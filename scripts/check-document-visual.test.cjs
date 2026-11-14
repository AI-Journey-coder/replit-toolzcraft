const test = require("node:test"),
  assert = require("node:assert/strict"),
  load = require("./load-ts-test.cjs");
const core = load("lib/document-intelligence/src/index.ts");
test("visual drafts reject incomplete regions, overlapping cells and invented certainty fields", () => {
  const draft = {
    complete: true,
    blocks: [
      {
        kind: "table",
        text: "Review table",
        box: [0, 0, 1, 1],
        confidence: 100,
        cells: [
          { row: 0, column: 0, rowSpan: 2, columnSpan: 1, text: "Merged" },
          { row: 0, column: 2, rowSpan: 1, columnSpan: 1, text: "Value" },
        ],
      },
    ],
    warnings: ["Check the image"],
  };
  const checked = core.validateVisualDraft(JSON.stringify(draft));
  assert.equal(checked.blocks[0].confidence, undefined);
  const rows = core.visualTableRows(checked.blocks[0].cells);
  assert.equal(rows[0][1].text, "");
  assert.equal(rows[1].length, 2);
  assert.equal(rows[0][0].rowSpan, 2);
  assert.throws(() =>
    core.validateVisualDraft(JSON.stringify({ ...draft, complete: false })),
  );
  assert.throws(() =>
    core.validateVisualDraft(
      JSON.stringify({
        ...draft,
        blocks: [{ ...draft.blocks[0], box: [0.8, 0, 0.2, 1] }],
      }),
    ),
  );
  assert.throws(() =>
    core.validateVisualDraft(
      JSON.stringify({
        ...draft,
        blocks: [
          {
            ...draft.blocks[0],
            cells: [
              ...draft.blocks[0].cells,
              { row: 1, column: 0, rowSpan: 1, columnSpan: 1, text: "Overlap" },
            ],
          },
        ],
      }),
    ),
  );
});
test("evidence correction is bounded and never returns unsupported output", async () => {
  const docs = [
    {
      id: "a",
      name: "Example",
      pages: [{ id: "p", label: "Page 1", text: "Amount 850.00" }],
    },
  ];
  let calls = 0;
  const good = JSON.stringify({
    complete: true,
    findings: [
      {
        label: "Amount",
        value: "850.00",
        quote: "Amount 850.00",
        sourceId: "p",
        status: "extracted",
      },
    ],
    missing: [],
  });
  const invalid = good.replaceAll("850.00", "999.00");
  const service = load(
    "artifacts/api-server/src/lib/intelligence-analysis.ts",
    {
      "@workspace/document-intelligence": core,
      "./ai": { completeChat: async () => (++calls === 1 ? invalid : good) },
    },
  );
  assert.equal(
    (await service.analyzeEvidence(docs, "invoice", "facts", "")).findings[0]
      .value,
    "850.00",
  );
  assert.equal(calls, 2);
  calls = 0;
  const bad = load("artifacts/api-server/src/lib/intelligence-analysis.ts", {
    "@workspace/document-intelligence": core,
    "./ai": {
      completeChat: async () => {
        calls++;
        return invalid;
      },
    },
  });
  await assert.rejects(bad.analyzeEvidence(docs, "invoice", "facts", ""));
  assert.equal(calls, 2);
});
test("webhook destinations require explicit HTTPS host approval", () => {
  const webhook = load("artifacts/api-server/src/lib/document-webhook.ts");
  const old = process.env.DOCUMENT_WEBHOOK_HOSTS;
  process.env.DOCUMENT_WEBHOOK_HOSTS = "events.example.com";
  try {
    assert.equal(
      webhook.approvedWebhook("https://events.example.com/hook").hostname,
      "events.example.com",
    );
    for (const url of [
      "http://events.example.com",
      "https://127.0.0.1/hook",
      "https://events.example.com.evil.test/hook",
      "https://user:pass@events.example.com",
      "https://events.example.com:444",
      "https://events.example.com/#secret",
    ])
      assert.throws(() => webhook.approvedWebhook(url));
  } finally {
    if (old === undefined) delete process.env.DOCUMENT_WEBHOOK_HOSTS;
    else process.env.DOCUMENT_WEBHOOK_HOSTS = old;
  }
});
