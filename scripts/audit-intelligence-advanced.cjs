const fs = require("node:fs"),
  load = require("./load-ts-test.cjs");
if (!process.argv.includes("--live"))
  throw Error("Use --live for bounded synthetic provider tests.");
process.loadEnvFile("artifacts/api-server/.env");
const core = load("lib/document-intelligence/src/index.ts");
let calls = 0,
  currentAction = "fixture";
const completeChat = async (system, user) => {
  calls++;
  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3.1-flash-lite",
        max_tokens: 2048,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!r.ok) throw Error("HTTP " + r.status);
  const data = await r.json();
  if (data.choices[0].finish_reason !== "stop")
    throw Error("Incomplete response");
  fs.writeFileSync(
    "test-results/advanced-" + currentAction + "-" + calls + ".json",
    data.choices[0].message.content,
  );
  return data.choices[0].message.content;
};
const { analyzeEvidence } = load(
  "artifacts/api-server/src/lib/intelligence-analysis.ts",
  { "@workspace/document-intelligence": core, "./ai": { completeChat } },
);
const document = {
  id: "a",
  name: "Synthetic agreement",
  pages: [
    {
      id: "a-p1",
      label: "Page 1",
      text: "Service agreement\nParties: Example Buyer and Example Supplier.\nEffective date: October 1, 2026.\nThe supplier must deliver the report by October 15, 2026.\nThe buyer must pay INR 850.00 by October 20, 2026.\nTermination requires 30 days written notice.\nThe supplier should respond promptly to questions.\nAssumption: The buyer supplies the source data.\nDecision: Both parties selected monthly reporting.\nInvoice number: DEMO-104\nAmount due: INR 850.00\nPurchase order reference: PO-42",
    },
  ],
};
(async () => {
  const report = [];
  const filter = process.argv
    .find((a) => a.startsWith("--actions="))
    ?.slice(10)
    .split(",");
  for (const action of Object.keys(core.ADVANCED_TASKS).filter(
    (a) => !filter || filter.includes(a),
  )) {
    currentAction = action;
    const docs = [document];
    if (["semantic_compare", "reconcile", "contradictions"].includes(action))
      docs.push({
        id: "b",
        name: "Revised agreement",
        pages: [
          {
            id: "b-p1",
            label: "Page 1",
            text: document.pages[0].text
              .replace("30 days", "10 days")
              .replaceAll("850.00", "900.00"),
          },
        ],
      });
    const before = calls;
    try {
      const result = await analyzeEvidence(
        docs,
        "agreement",
        action,
        action === "translate" ? "Hindi" : "",
      );
      report.push({ action, pass: true, calls: calls - before, result });
      console.log(action + ": PASS (" + (calls - before) + " call(s))");
    } catch (e) {
      report.push({
        action,
        pass: false,
        calls: calls - before,
        error: e.message,
      });
      console.log(action + ": FAIL " + e.message);
    }
  }
  fs.writeFileSync(
    "test-results/intelligence-advanced-evidence.json",
    JSON.stringify(report, null, 2),
  );
  if (report.some((r) => !r.pass)) process.exitCode = 1;
})().catch(() => {
  console.error("Audit failed");
  process.exitCode = 1;
});
