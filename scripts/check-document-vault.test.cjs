const test = require("node:test"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto"),
  path = require("node:path"),
  fs = require("node:fs"),
  load = require("./load-ts-test.cjs");
const core = load("lib/document-intelligence/src/index.ts");
const vault = load("artifacts/api-server/src/lib/document-vault.ts", {
  "@workspace/document-intelligence": core,
});
const snapshot = {
  documents: [
    {
      id: "d",
      name: "Example",
      pages: [{ id: "p", label: "Page 1", text: "PRIVATE SOURCE 123" }],
    },
  ],
  history: [],
  action: "overview",
  documentType: "general",
  question: "",
};
test("workspace encryption rejects tampering and cross-workspace replay; snapshots exclude secrets", () => {
  const old = process.env.DOCUMENT_WORKSPACE_KEY;
  process.env.DOCUMENT_WORKSPACE_KEY = crypto
    .randomBytes(32)
    .toString("base64");
  try {
    const filtered = vault.workspaceSnapshot({
      ...snapshot,
      password: "secret",
      documents: [{ ...snapshot.documents[0], password: "secret" }],
    });
    assert.ok(!JSON.stringify(filtered).includes("secret"));
    const encrypted = vault.sealWorkspace(filtered, "a:1");
    assert.ok(!encrypted.includes("PRIVATE"));
    assert.equal(
      vault.openWorkspace(encrypted, "a:1").documents[0].pages[0].text,
      "PRIVATE SOURCE 123",
    );
    assert.throws(() => vault.openWorkspace(encrypted, "b:1"));
    const data = Buffer.from(encrypted, "base64");
    data[30] ^= 1;
    assert.throws(() => vault.openWorkspace(data.toString("base64"), "a:1"));
    delete process.env.DOCUMENT_WORKSPACE_KEY;
    assert.equal(vault.vaultReady(), false);
    assert.throws(() => vault.sealWorkspace(filtered, "a:1"));
  } finally {
    if (old === undefined) delete process.env.DOCUMENT_WORKSPACE_KEY;
    else process.env.DOCUMENT_WORKSPACE_KEY = old;
  }
});
test("deterministic rules abstain on ambiguous fields and duplicate references retain evidence", () => {
  const docs = (text) => [
    { id: "d", name: "D", pages: [{ id: "p", label: "P", text }] },
  ];
  const rules = [
    {
      label: "Quantity",
      field: "Quantity",
      operator: "minimum",
      expected: "2",
    },
  ];
  assert.equal(
    core.runRules(docs("Quantity: 3"), rules).checks[0].status,
    "pass",
  );
  assert.equal(
    core.runRules(docs("Quantity: 1"), rules).checks[0].status,
    "review",
  );
  assert.equal(
    core.runRules(docs("Quantity: 3 units"), rules).checks[0].status,
    "unavailable",
  );
  assert.equal(
    core.runRules(docs("Quantity: 3\nQuantity: 4"), rules).checks[0].status,
    "review",
  );
  const d = docs("Invoice number: INV-42");
  const duplicates = core.duplicateInvoiceReferences([
    ...d,
    { ...d[0], id: "b", pages: [{ ...d[0].pages[0], id: "bp" }] },
  ]);
  assert.equal(duplicates.findings.length, 2);
  assert.equal(duplicates.findings[1].sourceId, "bp");
});
test(
  "saved workspace authorization, version conflicts, review and deletion on PostgreSQL",
  { skip: !process.env.BILLING_TEST_DATABASE_URL },
  async () => {
    const { Pool } = require(
      require.resolve("pg", { paths: [path.resolve("lib/db")] }),
    );
    const url = process.env.BILLING_TEST_DATABASE_URL;
    if (!["127.0.0.1", "localhost"].includes(new URL(url).hostname))
      throw Error("Use a disposable local database.");
    const schema = "workspace_test_" + crypto.randomBytes(8).toString("hex"),
      root = new Pool({ connectionString: url });
    await root.query("CREATE SCHEMA " + schema);
    const pool = new Pool({
      connectionString: url,
      options: "-c search_path=" + schema,
    });
    let server;
    const old = process.env.DOCUMENT_WORKSPACE_KEY;
    process.env.DOCUMENT_WORKSPACE_KEY = crypto
      .randomBytes(32)
      .toString("base64");
    try {
      await pool.query(
        "CREATE TABLE users(id integer PRIMARY KEY,firebase_uid text,disabled boolean DEFAULT false); INSERT INTO users VALUES(1,'owner',false),(2,'viewer',false),(3,'outsider',false)",
      );
      await pool.query("ALTER TABLE users ADD COLUMN email text; UPDATE users SET email='viewer@example.test' WHERE id=2");
      await pool.query(
        fs.readFileSync(
          "lib/db/migrations/0006_document_workspaces.sql",
          "utf8",
        ),
      );
      await pool.query(
        fs.readFileSync("lib/db/migrations/0007_document_jobs.sql", "utf8"),
      );
      await pool.query(
        fs.readFileSync(
          "lib/db/migrations/0008_document_workflows.sql",
          "utf8",
        ),
      );
      await pool.query(
        fs.readFileSync("lib/db/migrations/0009_support_requests.sql", "utf8"),
      );
      await pool.query(fs.readFileSync("lib/db/migrations/0012_support_rate_limit.sql", "utf8"));
      await pool.query(fs.readFileSync("lib/db/migrations/0013_document_transfers.sql", "utf8"));
      await pool.query(fs.readFileSync("lib/db/migrations/0014_publication_pages.sql", "utf8"));
      await pool.query(fs.readFileSync("lib/db/migrations/0015_ai_call_metrics.sql", "utf8"));
      await pool.query(
        fs.readFileSync("lib/db/migrations/0010_ai_configuration.sql", "utf8"),
      );
      await pool.query(
        "CREATE TABLE tool_settings(tool_slug text,enabled boolean)",
      );
      const express = require("../artifacts/api-server/node_modules/express");
      const router = load(
        "artifacts/api-server/src/routes/document-workspaces.ts",
        {
          "@workspace/db": { pool },
          "../lib/document-vault": vault,
          "../middlewares/auth": {
            requireAuth: (req, res, next) =>
              req.headers.authorization ? next() : res.sendStatus(401),
          },
          "../middlewares/account": {
            requireAccount: (req, res, next) => {
              req.dbUser = { id: Number(req.headers.authorization) };
              next();
            },
          },
        },
      ).default;
      const app = express();
      app.use(express.json());
      app.use(router);
      server = app.listen(0, "127.0.0.1");
      await new Promise((r) => server.once("listening", r));
      const base =
        "http://127.0.0.1:" + server.address().port + "/document-workspaces";
      const send = (suffix = "", method = "GET", body, uid = 1) =>
        fetch(base + suffix, {
          method,
          headers: {
            authorization: String(uid),
            "content-type": "application/json",
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
      const support = load("artifacts/api-server/src/routes/support.ts", {
        "@workspace/db": { pool },
        "../lib/document-vault": vault,
        "../middlewares/auth": {
          requireAuth: (req, res, next) =>
            req.headers.authorization ? next() : res.sendStatus(401),
        },
        "../middlewares/account": {
          requireAccount: (req, res, next) => {
            req.dbUser = { id: Number(req.headers.authorization) };
            next();
          },
        },
        "../middlewares/admin": {
          requireAdmin: (req, res, next) =>
            req.headers.authorization === "1" ? next() : res.sendStatus(403),
        },
        "../middlewares/admin-audit": {
          adminAudit: (_req, _res, next) => next(),
        },
      }).default;
      app.use(support);
      app.use(load('artifacts/api-server/src/routes/publication.ts',{
        '@workspace/db':{pool},
        '../middlewares/auth':{requireAuth:(req,res,next)=>req.headers.authorization?next():res.sendStatus(401)},
        '../middlewares/admin':{requireAdmin:(req,res,next)=>req.headers.authorization==='1'?next():res.sendStatus(403)},
        '../middlewares/admin-audit':{adminAudit:(_req,_res,next)=>next()},
      }).default);
      const help = (path = "", method = "GET", body, uid = 2) =>
        fetch(base.replace("/document-workspaces", path), {
          method,
          headers: {
            authorization: String(uid),
            "content-type": "application/json",
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
      const guide={slug:'test-guide',title:'Synthetic guide',description:'Testing publication controls',content:'Evidence and careful review. '.repeat(40),published:false,noindex:true,adPlacement:'off',adSlot:'',version:0};
      assert.equal((await help('/admin/publication-pages','PUT',guide)).status,403);
      assert.equal((await help('/admin/publication-pages','PUT',guide,1)).status,200);
      assert.equal((await help('/publication-pages/test-guide')).status,404);
      assert.equal((await help('/admin/publication-pages','PUT',{...guide,version:1,published:true,noindex:false},1)).status,200);
      assert.equal((await help('/publication-pages/test-guide')).status,200);
      assert.equal((await help('/admin/publication-pages','PUT',{...guide,version:1},1)).status,409);
      assert.equal((await help('/admin/publication-pages','PUT',{...guide,version:2},1)).status,200);
      assert.equal((await help('/publication-pages/test-guide')).status,404);
      const ticket = await help("/support-requests", "POST", {
        title: "Private title",
        message: "PRIVATE SUPPORT BODY",
        category: "problem",
        consent: true,
      });
      assert.equal(ticket.status, 201);
      const ticketId = (await ticket.json()).id;
      assert.equal(
        (await (await help("/support-requests", "GET", undefined, 3)).json())
          .requests.length,
        0,
      );
      assert.equal((await help("/admin/support-requests", "GET")).status, 403);
      assert.ok(
        !(
          await pool.query("SELECT ciphertext FROM support_requests")
        ).rows[0].ciphertext.includes("PRIVATE"),
      );
      assert.equal(
        (
          await help(
            "/admin/support-requests/" + ticketId,
            "PATCH",
            { status: "resolved", response: "Fixed in test" },
            1,
          )
        ).status,
        200,
      );
      assert.equal(
        (await (await help("/support-requests")).json()).requests[0].response,
        "Fixed in test",
      );
      await help("/support-requests/" + ticketId, "DELETE", undefined, 3);
      assert.equal(
        (await pool.query("SELECT count(*)::int n FROM support_requests"))
          .rows[0].n,
        1,
      );
      await help("/support-requests/" + ticketId, "DELETE");
      assert.equal(
        (await pool.query("SELECT count(*)::int n FROM support_requests"))
          .rows[0].n,
        0,
      );
      const supportBody={title:'Rate test',message:'Synthetic support message',category:'problem',consent:true};
      for(let i=0;i<4;i++){
        const created=await help('/support-requests','POST',supportBody);
        assert.equal(created.status,201);
        await help('/support-requests/'+(await created.json()).id,'DELETE');
      }
      assert.equal((await help('/support-requests','POST',supportBody)).status,429);
      await pool.query("UPDATE support_request_submissions SET created_at=now()-interval '2 days' WHERE user_id=2");
      const renewed=await help('/support-requests','POST',supportBody);assert.equal(renewed.status,201);
      await help('/support-requests/'+(await renewed.json()).id,'DELETE');
      assert.equal((await pool.query('SELECT count(*)::int n FROM support_request_submissions WHERE user_id=2')).rows[0].n,1);
      let r = await send("", "POST", {
        name: "Fixture",
        consent: true,
        snapshot,
      });
      assert.equal(r.status, 201);
      const { id } = await r.json();
      assert.equal((await send("/" + id, "GET", undefined, 3)).status, 404);
      assert.equal(
        (
          await send("/" + id + "/members", "POST", {
            firebaseUid: "viewer",
            role: "viewer",
          })
        ).status,
        200,
      );
      assert.equal((await send("/" + id, "GET", undefined, 2)).status, 200);
      assert.equal((await send('/'+id+'/members','GET',undefined,2)).status,403);
      assert.equal((await (await send('/'+id+'/members')).json())[0].label,'viewer@example.test');
      assert.equal((await send('/'+id+'/members','POST',{firebaseUid:'VIEWER@example.test',role:'viewer'})).status,200);
      await pool.query("INSERT INTO users(id,firebase_uid) SELECT n,'member-'||n FROM generate_series(10,108) n");
      await pool.query("INSERT INTO document_workspace_members(workspace_id,user_id,role) SELECT $1,n,'viewer' FROM generate_series(10,108) n",[id]);
      assert.equal((await send('/'+id+'/members','POST',{firebaseUid:'outsider',role:'viewer'})).status,409);
      assert.equal((await send('/'+id+'/members','POST',{firebaseUid:' VIEWER@example.test ',role:'viewer'})).status,200);
      assert.equal((await (await send('/'+id+'/members')).json()).length,100);
      assert.equal((await send('/'+id+'/members','POST',{firebaseUid:'member-10',role:'remove'})).status,200);
      assert.equal((await send('/'+id+'/members','POST',{firebaseUid:'outsider',role:'viewer'})).status,200);
      await pool.query("DELETE FROM document_workspace_members WHERE workspace_id=$1 AND user_id<>2",[id]);
      await pool.query("DELETE FROM users WHERE id BETWEEN 10 AND 108");

      assert.equal(
        (await send("/" + id, "PUT", { expectedVersion: 1, snapshot }, 2))
          .status,
        403,
      );
      const saves = await Promise.all([
        send("/" + id, "PUT", { expectedVersion: 1, snapshot }),
        send("/" + id, "PUT", { expectedVersion: 1, snapshot }),
      ]);
      assert.deepEqual(saves.map((r) => r.status).sort(), [200, 409]);
      assert.equal((await send("/" + id + "?version=1")).status, 200);
      assert.equal(
        (
          await send("/" + id + "/review", "POST", {
            state: "approved",
            expectedVersion: 1,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await send(
            "/" + id + "/review",
            "POST",
            { state: "approved", expectedVersion: 2 },
            2,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await send("/" + id + "/review", "POST", {
            state: "approved",
            expectedVersion: 2,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await send("/" + id + "/members", "POST", {
            firebaseUid: "viewer",
            role: "remove",
          })
        ).status,
        200,
      );
      assert.equal((await send("/" + id, "GET", undefined, 2)).status, 404);
      const stored = await pool.query(
        "SELECT ciphertext FROM document_workspace_versions",
      );
      assert.ok(
        stored.rows.every((r) => !r.ciphertext.includes("PRIVATE SOURCE")),
      );
      assert.equal((await send("/" + id, "DELETE")).status, 200);
      assert.equal(
        (
          await pool.query(
            "SELECT count(*)::int n FROM document_workspace_versions",
          )
        ).rows[0].n,
        0,
      );
      const inputModule = load(
        "artifacts/api-server/src/lib/intelligence-input.ts",
        { "@workspace/document-intelligence": core },
      );
      const input = inputModule.intelligenceInput(snapshot),
        jobId = crypto.randomUUID();
      await pool.query(
        "INSERT INTO document_jobs(id,user_id,fingerprint,action,credits,payload) VALUES($1,1,$2,$3,$4,$5)",
        [
          jobId,
          input.fingerprint,
          input.action,
          input.credits,
          vault.sealWorkspace(input, "job:" + jobId),
        ],
      );
      class SummaryError extends Error {
        constructor(status, message) {
          super(message);
          this.status = status;
        }
      }
      const worker = load(
        "artifacts/api-server/src/lib/document-job-runner.ts",
        {
          "@workspace/db": { pool },
          "./document-vault": vault,
          "./summary": { SummaryError, summarize: async () => {} },
          "./intelligence-analysis": { analyzeEvidence: async () => {} },
          "./intelligence-input": inputModule,
        },
      );
      const priorAi = process.env.ENABLE_AI;
      process.env.ENABLE_AI = "true";
      let charged = 0;
      const result = {
        findings: [
          {
            label: "Source",
            value: "PRIVATE SOURCE 123",
            sourceId: "p",
            quote: "PRIVATE SOURCE 123",
            status: "extracted",
          },
        ],
        missing: [],
        checks: [],
      };
      const charge = async (uid, input, db, generate) => {
        const result = await generate();
        charged++;
        return { result };
      };
      try {
        assert.equal(
          await worker.processDocumentJob(
            pool,
            async (d, t, a, q, h, usage) => {
              usage({
                inputTokens: 100,
                outputTokens: 20,
                model: "test-model",
              });
              return result;
            },
            charge,
          ),
          true,
        );
        let job = (
          await pool.query("SELECT * FROM document_jobs WHERE id=$1", [jobId])
        ).rows[0];
        assert.equal(job.state, "completed");
        assert.equal(job.input_tokens, 100);
        await pool.query(
          "ALTER TABLE users ADD COLUMN created_at timestamp NOT NULL DEFAULT (now()-interval '20 days'); CREATE TABLE usage_events(user_id integer,created_at timestamp); INSERT INTO usage_events VALUES(1,now()-interval '19 days'),(1,now()-interval '10 days'),(2,now()-interval '19 days')",
        );
        await pool.query(
          fs.readFileSync("lib/db/migrations/0002_billing.sql", "utf8"),
        );
        await pool.query(
          "INSERT INTO billing_subscriptions(id,user_id,plan_id,mode) VALUES('live',1,'test-plan','live'),('test',2,'test-plan','test'); INSERT INTO billing_periods(payment_id,subscription_id,user_id,period_start,period_end) VALUES('paid-live','live',1,now(),now()+interval '1 month'),('paid-test','test',2,now(),now()+interval '1 month')",
        );
        await pool.query(fs.readFileSync("lib/db/migrations/0011_document_reporting_indexes.sql","utf8"));
        const analytics = await load(
          "artifacts/api-server/src/lib/product-analytics.ts",
        ).productAnalytics(pool);
        assert.equal(analytics.outcomes.signups, 3);
        assert.equal(analytics.outcomes.activated, 2);
        assert.equal(analytics.outcomes.paid, 1);
        assert.equal(analytics.weeks[0].retained, 1);

        const operations = load(
          "artifacts/api-server/src/lib/document-operations.ts",
        );
        let stats = await operations.documentOperations(pool);
        assert.equal(
          stats.jobs.find((j) => j.id === jobId).estimated_usd,
          null,
        );
        const settings = load(
          "artifacts/api-server/src/lib/ai-configuration.ts",
        );
        await pool.query(
          "INSERT INTO ai_runtime_configuration(provider,model,input_usd_per_million,output_usd_per_million) VALUES($1,'test-model',0.25,1.5)",
          [settings.modelPolicy().provider],
        );
        stats = await operations.documentOperations(pool);
        assert.equal(
          Number(stats.jobs.find((j) => j.id === jobId).estimated_usd),
          0.000055,
        );
        await pool.query("INSERT INTO ai_call_daily(day,provider,model,kind,outcome,calls,input_tokens,output_tokens,unknown_usage) VALUES(current_date,$1,'test-model','chat','complete',1,1000,100,0)", [settings.modelPolicy().provider]);
        stats = await operations.documentOperations(pool);
        assert.equal(Number(stats.providerCalls[0].estimated_usd), 0.0004);
        await pool.query("UPDATE ai_call_daily SET unknown_usage=1");
        stats = await operations.documentOperations(pool);
        assert.equal(stats.providerCalls[0].estimated_usd, null);
        assert.ok(!JSON.stringify(stats).includes("PRIVATE SOURCE"));

        assert.equal(charged, 1);
        assert.equal(
          vault.openWorkspace(job.result, "result:" + jobId).findings[0].value,
          "PRIVATE SOURCE 123",
        );
        assert.equal(
          await worker.processDocumentJob(pool, async () => result, charge),
          false,
        );
        const cancelled = crypto.randomUUID();
        await pool.query(
          "INSERT INTO document_jobs(id,user_id,fingerprint,action,credits,payload) VALUES($1,1,$2,$3,$4,$5)",
          [
            cancelled,
            input.fingerprint,
            input.action,
            input.credits,
            vault.sealWorkspace(input, "job:" + cancelled),
          ],
        );
        await worker.processDocumentJob(
          pool,
          async () => {
            await pool.query(
              "UPDATE document_jobs SET state='cancel_requested' WHERE id=$1",
              [cancelled],
            );
            return result;
          },
          charge,
        );
        job = (
          await pool.query("SELECT * FROM document_jobs WHERE id=$1", [
            cancelled,
          ])
        ).rows[0];
        assert.equal(job.state, "cancelled");
        assert.equal(charged, 1);
        const workspaceId = crypto.randomUUID(),
          workflowId = crypto.randomUUID();
        await pool.query(
          "INSERT INTO document_workspaces(id,owner_id,name,current_version,review_state) VALUES($1,1,'Scheduled',1,'approved')",
          [workspaceId],
        );
        await pool.query(
          "INSERT INTO document_workspace_versions(workspace_id,version,ciphertext,author_id) VALUES($1,1,$2,1)",
          [workspaceId, vault.sealWorkspace(snapshot, workspaceId + ":1")],
        );
        const specification = {
          action: "overview",
          question: "",
          maxCredits: 4,
          repeat: "once",
          rules: [],
          webhook: "",
        };
        await pool.query(
          "INSERT INTO document_workflows(id,user_id,workspace_id,name,specification,next_run_at) VALUES($1,1,$2,'Daily test',$3,now()-interval '1 minute')",
          [
            workflowId,
            workspaceId,
            vault.sealWorkspace(specification, "workflow:" + workflowId),
          ],
        );
        const automation = load(
          "artifacts/api-server/src/lib/document-automation.ts",
          {
            "@workspace/db": { pool },
            "@workspace/document-intelligence": core,
            "./document-vault": vault,
            "./intelligence-input": inputModule,
            "./document-webhook": {
              approvedWebhook: () => {},
              deliverDocumentEvent: async () => {
                throw Error("No external deliveries in tests");
              },
            },
          },
        );
        assert.equal(await automation.scheduleDocumentWorkflows(), 1);
        assert.equal(await automation.scheduleDocumentWorkflows(), 0);
        await pool.query(
          "UPDATE document_workflows SET enabled=true,next_run_at=now()-interval '1 minute',specification=$2 WHERE id=$1",
          [
            workflowId,
            vault.sealWorkspace(
              {
                ...specification,
                rules: [
                  {
                    label: "Required",
                    field: "Missing field",
                    operator: "contains",
                    expected: "yes",
                  },
                ],
              },
              "workflow:" + workflowId,
            ),
          ],
        );
        assert.equal(await automation.scheduleDocumentWorkflows(), 0);
        assert.equal(
          (
            await pool.query(
              "SELECT review_state FROM document_workspaces WHERE id=$1",
              [workspaceId],
            )
          ).rows[0].review_state,
          "in_review",
        );
      } finally {
        if (priorAi === undefined) delete process.env.ENABLE_AI;
        else process.env.ENABLE_AI = priorAi;
      }
    } finally {
      if (server) await new Promise((r) => server.close(r));
      if (old === undefined) delete process.env.DOCUMENT_WORKSPACE_KEY;
      else process.env.DOCUMENT_WORKSPACE_KEY = old;
      await pool.end();
      await root.query("DROP SCHEMA " + schema + " CASCADE");
      await root.end();
    }
  },
);
