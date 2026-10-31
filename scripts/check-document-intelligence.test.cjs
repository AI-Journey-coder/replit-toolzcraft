const test = require("node:test"),
  assert = require("node:assert/strict"),
  load = require("./load-ts-test.cjs");
const core = load("lib/document-intelligence/src/index.ts");

test("ordered comparison preserves repetitions and evidence on both sides", () => {
  const doc = (id, text) => ({
    id,
    name: id,
    pages: [{ id: id + "-p", label: "Page 1", text }],
  });
  const rows = core.compareDocumentLines(
    doc("a", "Alpha\nRepeat\nRepeat\nOmega"),
    doc("b", "Omega\nAlpha\nRepeat"),
  );
  assert.equal(
    rows
      .filter((r) => r.before)
      .map((r) => r.before.text)
      .join("\n"),
    "Alpha\nRepeat\nRepeat\nOmega",
  );
  assert.equal(
    rows
      .filter((r) => r.after)
      .map((r) => r.after.text)
      .join("\n"),
    "Omega\nAlpha\nRepeat",
  );
  assert.ok(
    rows.some((r) => r.kind === "removed" && r.before.text === "Repeat"),
  );
  assert.ok(
    rows.every(
      (r) =>
        (!r.before || r.before.sourceId === "a-p") &&
        (!r.after || r.after.sourceId === "b-p"),
    ),
  );
  assert.throws(
    () =>
      core.compareDocumentLines(
        doc("a", Array(1501).fill("line").join("\n")),
        doc("b", "line"),
      ),
    /1,500/,
  );
});

test("redaction is literal and removes identifiers without changing original text", () => {
  const { redactText } = load(
    "artifacts/toolkit/src/lib/document-redaction.ts",
  );
  const text = "Client A+B: demo@example.com +91 98765 43210";
  const result = redactText(text, ["A+B"], true);
  assert.equal(result, "Client [REDACTED]: [EMAIL REDACTED] [PHONE REDACTED]");
  assert.ok(text.includes("demo@example.com"));
});

test("editable Office exports preserve Unicode and keep spreadsheet formulas inert", () => {
  const path = require("node:path");
  const fflate = require(
    require.resolve("fflate", { paths: [path.resolve("artifacts/toolkit")] }),
  );
  const { buildWord, buildExcel } = load(
    "artifacts/toolkit/src/lib/document-package.ts",
    { fflate },
  );
  const word = fflate.unzipSync(buildWord("₹850.00\nA & B <review>"));
  const wordXml = fflate.strFromU8(word["word/document.xml"]);
  assert.match(wordXml, /₹850.00/);
  assert.match(wordXml, /A &amp; B &lt;review&gt;/);
  const excel = fflate.unzipSync(
    buildExcel([['=HYPERLINK("https://example.com")', "₹850.00"]]),
  );
  const sheet = fflate.strFromU8(excel["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /t="inlineStr"/);
  assert.doesNotMatch(sheet, /<f[ >]/);
  assert.match(sheet, /₹850.00/);
  assert.throws(() => buildExcel([Array(101).fill("x")]), /100 columns/);
  assert.throws(() => buildWord("x".repeat(200001)), /200,000/);
});

test("ZIP input rejects empty, unsupported and excessive document batches", async () => {
  const path = require("node:path");
  const fflate = require(
    require.resolve("fflate", { paths: [path.resolve("artifacts/toolkit")] }),
  );
  const { expandDocumentZip } = load(
    "artifacts/toolkit/src/lib/document-package.ts",
    { fflate },
  );
  const archive = (entries) => ({
    size: 100,
    arrayBuffer: async () => fflate.zipSync(entries).buffer,
  });
  await assert.rejects(expandDocumentZip(archive({})), /no supported/);
  await assert.rejects(
    expandDocumentZip(archive({ "run.exe": new Uint8Array([1]) })),
    /unsupported/,
  );
  await assert.rejects(
    expandDocumentZip(
      archive(
        Object.fromEntries(
          Array.from({ length: 6 }, (_, i) => [
            i + ".txt",
            new Uint8Array([1]),
          ]),
        ),
      ),
    ),
    /five documents/,
  );
});

test("tables retain rows, empty cells and source anchors without guessing missing columns", () => {
  const d = [
    {
      id: "d",
      name: "Table",
      pages: [
        {
          id: "p",
          label: "Page 1",
          text: "Item\tQty\tPrice\nPlan\t1\t850.00\nNote\n| Name | Value |\n| --- | --- |\n| GST | 18% |",
        },
      ],
    },
  ];
  const tables = core.extractTables(d);
  assert.equal(tables.length, 2);
  assert.equal(tables[0].rows[1][2], "850.00");
  assert.equal(tables[1].rows[1][1], "18%");
  assert.equal(tables[0].sourceId, "p");
  assert.equal(
    core.extractTables([
      {
        ...d[0],
        pages: [{ ...d[0].pages[0], text: "No table here\nPlain prose only" }],
      },
    ]).length,
    0,
  );
});
test("conversation limits reject malformed and oversized context without truncation", () => {
  assert.equal(
    core.validateConversation([{ question: "When?", answer: "October 1" }])
      .length,
    1,
  );
  assert.throws(() =>
    core.validateConversation(Array(7).fill({ question: "Q", answer: "A" })),
  );
  assert.throws(() =>
    core.validateConversation([{ question: "Q", answer: "a".repeat(6000) }]),
  );
  assert.throws(() =>
    core.validateConversation([{ question: "Q", answer: 42 }]),
  );
  const prompt = core.intelligencePrompt(
    [],
    "general",
    "questions",
    "And the total?",
    [{ question: "Which invoice?", answer: "DEMO" }],
  );
  assert.match(prompt, /DEMO/);
  assert.match(prompt, /never evidence/);
});
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
    const conversation = {
      ...input,
      documents: docs("x".repeat(5900)),
      action: "questions",
      question: "What next?",
    };
    const before = await (await send("quote", conversation)).json();
    const after = await (
      await send("quote", {
        ...conversation,
        history: [{ question: "Prior?", answer: "a".repeat(200) }],
      })
    ).json();
    assert.equal(before.credits, 1);
    assert.equal(after.credits, 2);
    assert.notEqual(before.fingerprint, after.fingerprint);
    assert.equal(
      (
        await send("quote", {
          ...input,
          history: [{ question: "Q", answer: "A" }],
        })
      ).status,
      400,
    );
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
    const mutations = queries.filter((q) => /^UPDATE/.test(q.sql));
    assert.equal(mutations.length, 1);
    assert.match(mutations[0].sql, /WHERE user_id=\$1/);
    assert.equal(mutations[0].args[0], 1);
    assert.equal(mutations[0].args[1].length, 1);
    assert.equal(mutations[0].args[1][0], id);
  } finally {
    await new Promise((r) => server.close(r));
    if (old === undefined) delete process.env.ENABLE_AI;
    else process.env.ENABLE_AI = old;
  }
});
test("invoice correction resolves line evidence and rejects an invented amount", async () => {
  const docs = [{id:"doc",name:"Invoice",pages:[{id:"upload-page",label:"Page 1",text:"Base INR 720.34\nSGST   64.83\nAmount due INR 850.00"}]}];
  for (const value of ["850.00","950.00"]) {
    let calls=0;
    const api=load("artifacts/api-server/src/lib/intelligence-analysis.ts",{"@workspace/document-intelligence":core,"./ai":{completeChat:async (_system,prompt)=>{
      if (++calls===1) return "{}";
      assert.match(prompt,/E3 Amount due INR 850.00/);
      return JSON.stringify({complete:true,missing:[],findings:[{label:"Amount due",status:"extracted",value,quote:"E3",sourceId:"upload-page"}]});
    }}});
    const result=api.analyzeEvidence(docs,"invoice","amounts","");
    if (value==="850.00") assert.equal((await result).findings[0].quote,"Amount due INR 850.00");
    else await assert.rejects(result,/could not verify/);
    assert.equal(calls,2);
  }
});
