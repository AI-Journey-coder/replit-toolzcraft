import { test, expect } from "@playwright/test";

test('image upload extracts readable text locally', async ({page}) => {
  test.setTimeout(120000);
  await page.goto('/tools/ai-document-intelligence');
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 1000; c.height = 300;
    const ctx = c.getContext('2d')!; ctx.fillStyle = 'white'; ctx.fillRect(0,0,1000,300);
    ctx.fillStyle = 'black'; ctx.font = '40px Arial';
    ctx.fillText('Invoice DEMO-202',40,80); ctx.fillText('Amount due INR 850.00',40,160);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.getByLabel('Upload documents').setInputFiles({name:'ocr-example.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await expect(page.getByLabel('Reviewed source text')).toHaveValue(/DEMO-202/, {timeout:90000});
  await expect(page.getByLabel('Reviewed source text')).toHaveValue(/850\.00/);
  await expect(page.getByAltText('Original uploaded document')).toBeVisible();
});
for (const width of [390, 1280])
  test(
    "document workspace replaces summarizer and checks invoice at " + width,
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      let aiCalls = 0;
      await page.route("**/api/document-intelligence/**", (route) => {
        aiCalls++;
        return route.abort();
      });
      const response = await page.request.get("/tools/ai-summarizer", {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(
        "/tools/ai-document-intelligence",
      );
      await page.goto("/tools/ai-document-intelligence");
      await expect(
        page.getByRole("heading", {
          name: "AI Document Intelligence",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("radio", { name: "Free Summary", exact: true }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Try invoice example" }).click();
      await page
        .getByRole("button", { name: "Review & validate locally · Free" })
        .click();
      const results = page.getByRole("region", {
        name: "Evidence-backed results",
      });
      await expect(results).toContainText("equals the printed total exactly");
      await expect(results).toContainText("SGST");
      await expect(results).toContainText("CGST");
      await expect(results).toContainText("₹720.34");
      await expect(results).toContainText("₹850.00");
      await results
        .getByRole("button", { name: /View source/ })
        .first()
        .click();
      await expect(
        page.getByText("Selected evidence", { exact: true }),
      ).toBeVisible();
      const download = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Export PDF", exact: true })
        .click();
      expect((await download).suggestedFilename()).toBe(
        "document-evidence-report.pdf",
      );
      await page.screenshot({
        path: "test-results/intelligence-" + width + ".png",
        fullPage: true,
      });
      await page.getByLabel("Reviewed source text").fill("New text.");
      await expect(results).toHaveCount(0);
      expect(aiCalls).toBe(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    },
  );
test("DOCX upload uses paragraphs and duplicate files are rejected", async ({
  page,
}) => {
  const { zipSync, strToU8 } =
    await import("../artifacts/toolkit/node_modules/fflate/lib/index.cjs");
  const data = zipSync({
    "word/document.xml": strToU8(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Due date 30 October 2026</w:t></w:r></w:p></w:body></w:document>',
    ),
  });
  await page.goto("/tools/ai-document-intelligence");
  const file = {
    name: "sample.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(data),
  };
  await page.getByLabel("Upload documents").setInputFiles(file);
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(
    "Due date 30 October 2026",
  );
  await expect(
    page.getByRole("button", { name: "Paragraphs 1–1", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Upload documents").setInputFiles(file);
  await expect(page.getByRole("alert")).toContainText(
    "already in the workspace",
  );
  await page.getByRole("button", { name: "Clear workspace" }).click();
  await expect(page.getByLabel("Reviewed source text")).toHaveCount(0);
});
test("PDF extraction preserves page anchors and corrupt files retain current source", async ({
  page,
}) => {
  await page.goto("/tools/ai-document-intelligence");
  await page
    .getByLabel("Upload documents")
    .setInputFiles("test-results/fixtures/sample.pdf");
  await expect(page.getByLabel("Reviewed source text")).toContainText(
    "ToolzCraft test 123",
  );
  await expect(
    page.getByRole("button", { name: "Page 2", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Upload documents")
    .setInputFiles({
      name: "bad.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("broken"),
    });
  await expect(page.getByRole("alert")).toContainText("Invalid PDF signature");
  await expect(page.getByLabel("Reviewed source text")).toContainText(
    "ToolzCraft test 123",
  );
});
test("oversize source is preserved and local comparison shows real differences", async ({
  page,
}) => {
  await page.goto("/tools/ai-document-intelligence");
  await page.getByRole("button", { name: "Paste text", exact: true }).click();
  await page.getByLabel("Reviewed source text").fill("a".repeat(24001));
  await expect(page.getByRole("alert")).toContainText(
    "Nothing is silently truncated",
  );
  await expect(
    page.getByRole("button", { name: "Review & validate locally · Free" }),
  ).toBeDisabled();
  await page.getByLabel("Reviewed source text").fill("Payment due in 30 days.");
  await page.getByRole("button", { name: "Paste text", exact: true }).click();
  await page.getByLabel("Reviewed source text").fill("Payment due in 15 days.");
  await page.getByRole("button", { name: "Compare text · Free" }).click();
  const r = page.getByRole("region", { name: "Evidence-backed results" });
  await expect(r).toContainText("Removed line");
  await expect(r).toContainText("Added line");
  await expect(r).toContainText("30 days");
  await expect(r).toContainText("15 days");
});
