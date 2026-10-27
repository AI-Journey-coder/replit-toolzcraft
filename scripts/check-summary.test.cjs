const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  load = require("./load-ts-test.cjs");
const free = load("artifacts/toolkit/src/lib/free-summary.ts").freeSummary;
const modulePath = "artifacts/api-server/src/lib/summary.ts";
test("free summaries preserve decimal amounts and avoid duplicate sentences",()=>{
  const source="The amount due is INR 720.34. The amount due is INR 720.34. The amount due is INR 720.34. Payment must arrive by 30 October. The office opens at nine. The office closes at five.";
  const result=free(source);
  assert.ok(result.includes('720.34'));
  assert.equal(result.split('720.34').length-1,1);
  assert.ok(result.includes('30 October'));
});
const inert = load(modulePath, {
    "./ai-prompts": load("artifacts/api-server/src/lib/ai-prompts.ts"),
  "@workspace/db": {},
  "./backend-quota": {},
  "./ai": {},
});
test("free summary selects source sentences, supports Unicode and enforces input limits", () => {
  const text =
    "Revenue grew this quarter. Revenue growth came from subscriptions. Costs remained stable. The team hired two engineers. New markets opened.";
  const result = free(text);
  assert.ok(result.length < text.length);
  for (const s of result.split("\n\n")) assert.ok(text.includes(s));
  assert.ok(free("यह पहली पंक्ति है। यह दूसरी पंक्ति है।").length > 0);
  assert.throws(() => free(" "));
  assert.throws(() => free("x".repeat(24001)));
});
test("server calculates credits and rejects invalid requests before allocation", () => {
  const id = crypto.randomUUID();
  for (const [n, c] of [
    [1, 1],
    [6000, 1],
    [6001, 2],
    [12001, 3],
    [24000, 4],
  ])
    assert.equal(
      inert.summaryInput({
        mode: "full",
        text: "a".repeat(n),
        requestId: id,
        credits: 0,
      }).credits,
      c,
    );
  assert.throws(() =>
    inert.summaryInput({
      mode: "quick",
      text: "a".repeat(6001),
      requestId: id,
    }),
  );
  assert.throws(() =>
    inert.summaryInput({
      mode: "full",
      text: "a".repeat(24001),
      requestId: id,
    }),
  );
  assert.throws(() =>
    inert.summaryInput({ mode: "free", text: "a", requestId: id }),
  );
  assert.throws(() =>
    inert.summaryInput({ mode: "quick", text: "a", requestId: "bad" }),
  );
});
test(
  "summary credit transactions and retry recovery on PostgreSQL",
  { skip: !process.env.BILLING_TEST_DATABASE_URL },
  async (t) => {
    const { Pool } = require(
      require.resolve("pg", { paths: [path.resolve("lib/db")] }),
    );
    const url = process.env.BILLING_TEST_DATABASE_URL,
      schema = "summary_test_" + crypto.randomBytes(8).toString("hex"),
      root = new Pool({ connectionString: url });
    await root.query("CREATE SCHEMA " + schema);
    const pool = new Pool({
      connectionString: url,
      options: "-c search_path=" + schema,
    });
    const quota = load("artifacts/api-server/src/lib/backend-quota.ts", {
      "@workspace/db": { pool },
      "./razorpay": { razorpayConfig: () => null },
    });
    const summary = load(modulePath, {
    "./ai-prompts": load("artifacts/api-server/src/lib/ai-prompts.ts"),
      "@workspace/db": { pool },
      "./backend-quota": quota,
      "./ai": {},
    });
    let calls = 0;
    const generate = async () => {
      calls++;
      return "A complete summary.";
    };
    const input = (n, id = crypto.randomUUID()) =>
      summary.summaryInput({
        mode: "full",
        text: "a".repeat(n),
        requestId: id,
      });
    try {
      for (const f of fs
        .readdirSync("lib/db/migrations")
        .filter((n) => n.endsWith(".sql"))
        .sort())
        await pool.query(fs.readFileSync("lib/db/migrations/" + f, "utf8"));
      const uid = (
        await pool.query(
          "INSERT INTO users(firebase_uid) VALUES('summary-test') RETURNING id",
        )
      ).rows[0].id;
      await t.test(
        "insufficient balance rolls back every reservation without provider call",
        async () => {
          await assert.rejects(
            summary.summarize(uid, input(24000), pool, generate),
            (e) => e.status === 402,
          );
          assert.equal((await quota.backendAccess(uid)).remaining, 3);
          assert.equal(calls, 0);
        },
      );
      await t.test(
        "success charges exactly two credits and retries reuse saved result",
        async () => {
          const body = input(6001),
            r = await summary.summarize(uid, body, pool, generate);
          assert.equal(r.credits, 2);
          assert.equal((await quota.backendAccess(uid)).remaining, 1);
          assert.equal(
            (await summary.summarize(uid, body, pool, generate)).replayed,
            true,
          );
          assert.equal(calls, 1);
          await assert.rejects(
            summary.summarize(uid, { ...body, text: "other" }, pool, generate),
            (e) => e.status === 409,
          );
          assert.equal((await quota.backendAccess(uid)).remaining, 1);
        },
      );
      await t.test("provider failure rolls back the charge", async () => {
        await assert.rejects(
          summary.summarize(uid, input(10), pool, async () => {
            throw Error("timeout");
          }),
        );
        assert.equal((await quota.backendAccess(uid)).remaining, 1);
      });
      await t.test(
        "concurrent duplicate cannot charge while first request is in flight",
        async () => {
          let release, started;
          const ready = new Promise((r) => (started = r)),
            wait = new Promise((r) => (release = r)),
            body = input(10);
          const pending = summary.summarize(uid, body, pool, async () => {
            started();
            await wait;
            return "Done";
          });
          await ready;
          try {
            await assert.rejects(
              summary.summarize(uid, body, pool, generate),
              (e) => e.status === 409,
            );
          } finally {
            release();
          }
          await pending;
          assert.equal((await quota.backendAccess(uid)).remaining, 0);
          assert.equal(
            (await summary.summarize(uid, body, pool, generate)).replayed,
            true,
          );
        },
      );
      await t.test(
        "admin bypasses credit deductions and disabled account cannot recover results",
        async () => {
          await pool.query("UPDATE users SET role='admin' WHERE id=$1", [uid]);
          const body = input(24000);
          await summary.summarize(uid, body, pool, generate);
          assert.equal((await quota.backendAccess(uid)).remaining, null);
          await pool.query("UPDATE users SET disabled=true WHERE id=$1", [uid]);
          await assert.rejects(
            summary.summarize(uid, body, pool, generate),
            (e) => e.status === 403,
          );
        },
      );
    } finally {
      await pool.end();
      await root.query("DROP SCHEMA " + schema + " CASCADE");
      await root.end();
    }
  },
);
