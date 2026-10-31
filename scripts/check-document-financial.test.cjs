const test = require("node:test"),
  assert = require("node:assert/strict"),
  load = require("./load-ts-test.cjs");
const core = load("lib/document-intelligence/src/index.ts");
test("financial checks use exact decimals, cited operands and explicit matching units", () => {
  const text =
    "Base 720.34\nSGST 64.83\nCGST 64.83\nTotal 850.00\nPrevious 100\nCurrent 125\nZero 0\nLarge 9007199254740993.01\nTiny 0.01\nLarge total 9007199254740993.02";
  const docs = [
    { id: "d", name: "Invoice", pages: [{ id: "p", label: "P", text }] },
  ];
  const op = (quote, value, unit = "INR units") => ({
    sourceId: "p",
    quote,
    value,
    unit,
  });
  const invoice = [
    op("Base 720.34", "720.34"),
    op("SGST 64.83", "64.83"),
    op("CGST 64.83", "64.83"),
    op("Total 850.00", "850.00"),
  ];
  assert.equal(
    core.checkFinancialCalculation(docs, "sum", invoice).checks[0].status,
    "pass",
  );
  assert.equal(
    core.checkFinancialCalculation(docs, "sum", [
      op("Large 9007199254740993.01", "9007199254740993.01"),
      op("Tiny 0.01", "0.01"),
      op("Large total 9007199254740993.02", "9007199254740993.02"),
    ]).checks[0].status,
    "pass",
  );
  assert.match(
    core.checkFinancialCalculation(docs, "growth", [
      op("Previous 100", "100"),
      op("Current 125", "125"),
    ]).checks[0].detail,
    /25.00%/,
  );
  assert.equal(
    core.checkFinancialCalculation(docs, "growth", [
      op("Zero 0", "0"),
      op("Current 125", "125"),
    ]).checks[0].status,
    "unavailable",
  );
  assert.throws(() =>
    core.checkFinancialCalculation(docs, "difference", [
      op("Previous 100", "100"),
      op("Current 125", "125", "USD units"),
    ]),
  );
  assert.throws(() =>
    core.checkFinancialCalculation(docs, "difference", [
      op("Previous 100", "10"),
      op("Current 125", "125"),
    ]),
  );
  assert.throws(() =>
    core.checkFinancialCalculation(docs, "difference", [
      op("Invented 999", "999"),
      op("Current 125", "125"),
    ]),
  );
  const rules = [
    {
      label: "Precision",
      field: "Large",
      operator: "maximum",
      expected: "9007199254740993.00",
    },
  ];
  assert.equal(
    core.runRules(
      [
        {
          ...docs[0],
          pages: [{ id: "p", label: "P", text: "Large 9007199254740993.01" }],
        },
      ],
      rules,
    ).checks[0].status,
    "review",
  );
});
test("long-document batches preserve every character, source order and Unicode boundaries", () => {
  const text = "A".repeat(23999) + "😀" + "B".repeat(26000);
  const docs = [
    {
      id: "d",
      name: "Long report",
      pages: [{ id: "p", label: "Page 1", text }],
    },
  ];
  const batches = core.splitDocumentBatch(docs);
  assert.equal(batches.length, 3);
  assert.equal(
    batches
      .flatMap((b) => b.flatMap((d) => d.pages.map((p) => p.text)))
      .join(""),
    text,
  );
  for (const batch of batches) {
    core.validateSources(batch);
    for (const page of batch[0].pages)
      assert.ok(!/[\uD800-\uDBFF]$/.test(page.text));
  }
  assert.throws(() =>
    core.splitDocumentBatch([
      { ...docs[0], pages: [{ id: "p", label: "P", text: " " }] },
    ]),
  );
  assert.throws(() =>
    core.splitDocumentBatch([
      {
        ...docs[0],
        pages: [{ id: "p", label: "P", text: "x".repeat(24000 * 31) }],
      },
    ]),
  );
});
