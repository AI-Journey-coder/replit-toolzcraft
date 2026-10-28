const test = require("node:test"),
  assert = require("node:assert/strict"),
  load = require("./load-ts-test.cjs");
const core = load("lib/document-intelligence/src/index.ts");
const invoice = `[Page 1]\nPage 1 of 1\nInvoice\nInvoice number\tDEMO\t0001\nDate of issue September 1, 2026\nDate due September 1, 2026\nExample Software Pvt. Ltd GST\nBill to\nDemo Customer\nvideo AI - Basic\nSep 1–Oct 1, 2026\nSubtotal ₹850.00\nTotal excluding tax ₹720.34\nSGST - INDIA 9% incl. on ₹720.34 ₹64.83\nCGST - INDIA 9% incl. on ₹720.34 ₹64.83\nTotal ₹850.00\nAmount due ₹850.00\nHSN/SAC - 998314`;
const docs = (text = invoice) => [
  {
    id: "d1",
    name: "Synthetic invoice",
    pages: core.pagesFromText(text, "d1"),
  },
];
test("invoice layout preserves both taxes, pre-tax base, amount due and evidence", () => {
  assert.equal(core.classify(invoice), "invoice");
  const result = core.localInvoice(docs());
  for (const [label, value] of [
    ["Before tax", "₹720.34"],
    ["SGST", "₹64.83"],
    ["CGST", "₹64.83"],
    ["Amount due", "₹850.00"],
    ["Customer", "Demo Customer"],
  ])
    assert.ok(
      result.findings.some((f) => f.label === label && f.value === value),
      label,
    );
  assert.equal(
    result.findings.find((f) => f.label === "Invoice reference").status,
    "review",
  );
  assert.ok(
    result.findings.some((f) => f.label === "Service / item candidate"),
  );
  assert.equal(result.checks[0].status, "pass");
  assert.equal(result.checks.at(-1).status, "unavailable");
  for (const f of result.findings)
    assert.ok(
      core.normalize(docs()[0].pages[0].text).includes(core.normalize(f.quote)),
    );
});
test("tax checks abstain on missing tax, multiple invoices and ambiguous currencies", () => {
  assert.equal(
    core.localInvoice(docs(invoice.replace(/CGST[^\n]+\n/, ""))).checks[0]
      .status,
    "unavailable",
  );
  assert.equal(
    core.localInvoice([...docs(), { ...docs()[0], id: "d2" }]).checks[0].status,
    "unavailable",
  );
  assert.equal(
    core.localInvoice(docs(invoice + "\nUSD 5.00")).checks[0].status,
    "unavailable",
  );
  assert.equal(
    core.localInvoice(docs(invoice.replace("Total ₹850.00", "Total ₹851.00")))
      .checks[0].status,
    "review",
  );
  assert.equal(
    core.localInvoice(docs(invoice + "\nDiscount ₹10.00")).checks[0].status,
    "unavailable",
  );
});
test("decimal arithmetic does not guess separators or drop precision", () => {
  assert.equal(
    core.minorUnits("₹720.34") + core.minorUnits("₹64.83") * 2n,
    85000n,
  );
  assert.equal(core.minorUnits("1,23,456.78"), 12345678n);
  for (const s of ["1.234,56", "850", "-100.00", "1,2.34", "NaN", "850.001"])
    assert.equal(core.minorUnits(s), null);
});
test("unsupported source IDs, invented quotes and invented extracted values are rejected", () => {
  const result = {
    complete: true,
    findings: [
      {
        label: "Total",
        value: "₹850.00",
        sourceId: "d1-p1",
        quote: "Amount due ₹850.00",
        status: "extracted",
      },
    ],
    missing: [],
  };
  assert.equal(
    core.verifiedResult(JSON.stringify(result), docs()).findings.length,
    1,
  );
  for (const mutation of [
    { sourceId: "fake" },
    { quote: "Amount due ₹999.00" },
    { value: "₹999.00" },
    { status: "certain" },
  ])
    assert.throws(() =>
      core.verifiedResult(
        JSON.stringify({
          ...result,
          findings: [{ ...result.findings[0], ...mutation }],
        }),
        docs(),
      ),
    );
  assert.throws(() =>
    core.verifiedResult(JSON.stringify({ ...result, complete: false }), docs()),
  );
  assert.throws(() => core.verifiedResult("{broken", docs()));
});
test("reviewed source bounds and original page anchors are enforced", () => {
  const d = docs("[Page 4]\nFirst\n[Page 9]\nLast");
  assert.equal(d[0].pages[1].label, "Page 9");
  assert.equal(core.validateSources(d).length, 1);
  assert.throws(() => core.validateSources(docs("x".repeat(24001))));
  const repeated = docs();
  repeated[0].pages.push(repeated[0].pages[0]);
  assert.throws(() => core.validateSources(repeated));
  assert.throws(() =>
    core.validateSources([
      ...docs(),
      {
        ...docs()[0],
        pages: [{ id: "other-page", label: "Page 1", text: "Source" }],
      },
    ]),
  );
  const extra = docs();
  extra[0].hidden = "unreviewed";
  extra[0].pages[0].hidden = "unreviewed";
  assert.equal(
    JSON.stringify(core.validateSources(extra)).includes("unreviewed"),
    false,
  );
});
test("intelligence quote binds source, action and options; malformed jobs fail before billing", async () => {
  const express = require("../artifacts/api-server/node_modules/express");
  let charged = 0;
  const queries = [];
  const router = load(
    "artifacts/api-server/src/routes/document-intelligence.ts",
    {
      "@workspace/document-intelligence": core,
      "@workspace/db": {
        pool: {
          query: async (sql, args) => {
            queries.push({ sql, args });
            return { rows: [] };
          },
        },
      },
      "../middlewares/auth": {
        requireAuth: (req, res, next) => {
          if (!req.headers.authorization) return res.sendStatus(401);
          next();
        },
      },
      "../middlewares/account": {
        requireAccount: (req, res, next) => {
          req.dbUser = { id: 1, role: "user" };
          next();
        },
      },
      "../lib/summary": {
        summarize: async () => {
          charged++;
          return { result: "{}" };
        },
        SummaryError: class extends Error {},
      },
      "../lib/ai": { completeChat: async () => "" },
    },
  ).default;
  const old = process.env.ENABLE_AI;
  process.env.ENABLE_AI = "true";
  const app = express();
  app.use(express.json());
  app.use(router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const send = (path, body, auth = true) =>
    fetch(
      "http://127.0.0.1:" +
        server.address().port +
        "/document-intelligence/" +
        path,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(auth ? { authorization: "test" } : {}),
        },
        body: JSON.stringify(body),
      },
    );
  try {
    const input = {
      documents: docs(),
      documentType: "invoice",
      action: "overview",
      question: "",
    };
    assert.equal((await send("quote", input, false)).status, 401);
    const q = await (await send("quote", input)).json();
    assert.equal(q.credits, 1);
    const q2 = await (
      await send("quote", { ...input, action: "facts" })
    ).json();
    assert.notEqual(q.fingerprint, q2.fingerprint);
    assert.equal(
      (
        await send("analyze", {
          ...input,
          fingerprint: "wrong",
          requestId: require("crypto").randomUUID(),
          consent: true,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await send("analyze", {
          ...input,
          fingerprint: q.fingerprint,
          requestId: require("crypto").randomUUID(),
          consent: false,
        })
      ).status,
      400,
    );
    assert.equal(charged, 0);
    process.env.ENABLE_AI = "false";
    const id = require("crypto").randomUUID();
    assert.equal(
      (await send("clear", { requestIds: [id] }, false)).status,
      401,
    );
    assert.equal(
      (await send("clear", { requestIds: ["-".repeat(36)] })).status,
      400,
    );
    assert.equal((await send("clear", { requestIds: [id] })).status, 200);
    assert.equal(queries.length, 1);
    assert.match(queries[0].sql, /WHERE user_id=\$1/);
    assert.equal(queries[0].args[0], 1);
    assert.equal(queries[0].args[1].length, 1);
    assert.equal(queries[0].args[1][0], id);
  } finally {
    await new Promise((r) => server.close(r));
    if (old === undefined) delete process.env.ENABLE_AI;
    else process.env.ENABLE_AI = old;
  }
});
