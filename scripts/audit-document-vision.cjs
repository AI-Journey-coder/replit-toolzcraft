const fs = require("node:fs"),
  load = require("./load-ts-test.cjs");
if (!process.argv.includes("--live"))
  throw Error("Use --live for one synthetic image analysis.");
process.loadEnvFile("artifacts/api-server/.env");
process.env.AI_PROVIDER = "gemini";
process.env.AI_MODEL = "gemini-3.1-flash-lite";
(async () => {
  const { chromium } = require("@playwright/test");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  let bytes;
  try {
    const page = await browser.newPage({
      viewport: { width: 800, height: 500 },
    });
    await page.setContent(
      '<main style="font:24px Arial;padding:20px"><h2>Synthetic invoice DEMO-42</h2><p>Amount due: INR 850.00</p><table border="1" cellpadding="12" style="border-collapse:collapse;width:650px"><tr><th colspan="2">Services (merged heading)</th></tr><tr><td>Monthly report</td><td>850.00</td></tr><tr><td>Total INR</td><td>850.00</td></tr></table><p>[X] Reviewed</p><p style="font-family:cursive">Sample Signature</p></main>',
    );
    bytes = await page.screenshot();
  } finally {
    await browser.close();
  }
  fs.writeFileSync("test-results/synthetic-visual-invoice.png", bytes);
  const core = load("lib/document-intelligence/src/index.ts"),
    ai = load("artifacts/api-server/src/lib/ai.ts");
  const raw = await ai.completeVision(
    core.VISUAL_PROMPT,
    "data:image/png;base64," + bytes.toString("base64"),
  );
  fs.writeFileSync("test-results/intelligence-vision-raw.json", raw);
  const result = core.validateVisualDraft(raw);
  if (
    !result.blocks.some((b) => b.kind === "table" && b.cells?.length) ||
    !JSON.stringify(result).includes("850")
  )
    throw Error("Expected table and printed amount not extracted.");
  fs.writeFileSync(
    "test-results/intelligence-vision-live.json",
    JSON.stringify(result, null, 2),
  );
  console.log(
    "PASS: synthetic visual table and amount extracted into bounded review regions.",
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
