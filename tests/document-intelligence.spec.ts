import { test, expect } from "@playwright/test";

test("anonymous workspace expires without retaining reviewed text", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/tools/ai-document-intelligence");
  await page.getByRole("button", { name: "Paste text", exact: true }).click();
  await page
    .getByLabel("Reviewed source text")
    .fill("Private document content");
  await page.clock.fastForward(60 * 60 * 1000 + 1000);
  await expect(page.getByLabel("Reviewed source text")).toHaveCount(0);
  await expect(
    page.getByText(
      "Your anonymous workspace expired after 60 minutes. Local documents and results have been cleared.",
      { exact: true },
    ),
  ).toBeVisible();
});

test("ZIP documents extract locally and redaction applies only to exported text", async ({
  page,
}) => {
  const scanUploads: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/document-scan')) scanUploads.push(request.url()); });
  const { zipSync, strToU8 } =
    await import("../artifacts/toolkit/node_modules/fflate/lib/index.cjs");
  await page.goto("/tools/ai-document-intelligence");
  await page.getByLabel("Upload documents").setInputFiles({
    name: "documents.zip",
    mimeType: "application/zip",
    buffer: Buffer.from(
      zipSync({
        "nested/example.txt": strToU8(
          "Account SECRET-123\nContact demo@example.com",
        ),
      }),
    ),
  });
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(
    /SECRET-123/,
  );
  await page
    .getByLabel("Redact exact text (one phrase per line)")
    .fill("SECRET-123");
  await page
    .getByLabel(
      "Also mask email addresses and international phone-number patterns",
    )
    .check();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download extracted text", exact: true })
    .click();
  const download = await pending;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  expect(scanUploads).toEqual([]);
  expect(text).toContain("[REDACTED]");
  expect(text).not.toContain("SECRET-123");
  expect(text).not.toContain("demo@example.com");
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(
    /SECRET-123/,
  );
});

test("specialist questions and checklists follow the chosen document type", async ({
  page,
}) => {
  await page.goto("/tools/ai-document-intelligence");
  await page.getByRole("button", { name: "Paste text", exact: true }).click();
  await page
    .getByLabel("Reviewed source text")
    .fill("Agreement between Example A and Example B. Notice period: 30 days.");
  await page
    .getByLabel("Document type", { exact: true })
    .selectOption("agreement");
  await page.getByLabel("AI action", { exact: true }).selectOption("questions");
  await page
    .getByRole("button", {
      name: "What are the termination and notice terms?",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Your question or follow-up")).toHaveValue(
    "What are the termination and notice terms?",
  );
  await page
    .getByRole("button", { name: "Use these fields as checklist" })
    .click();
  await expect(page.getByLabel("Required fields or checklist")).toHaveValue(
    /Notice period/,
  );
});

test("Word tables retain cells and export source rows without guessed headers", async ({
  page,
}) => {
  const { zipSync, strToU8 } =
    await import("../artifacts/toolkit/node_modules/fflate/lib/index.cjs");
  const row = (cells: string[]) =>
    "<w:tr>" +
    cells
      .map((c) => "<w:tc><w:p><w:r><w:t>" + c + "</w:t></w:r></w:p></w:tc>")
      .join("") +
    "</w:tr>";
  const xml =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:tbl>' +
    row(["Item", "Qty", "Amount"]) +
    row(["Plan", "1", "850.00"]) +
    "</w:tbl></w:body></w:document>";
  await page.goto("/tools/ai-document-intelligence");
  await page.getByLabel("Upload documents").setInputFiles({
    name: "table.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(zipSync({ "word/document.xml": strToU8(xml) })),
  });
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(
    "Item\tQty\tAmount\nPlan\t1\t850.00",
  );
  await page
    .getByRole("button", { name: "Extract tables · Free", exact: true })
    .click();
  const tables = page.getByRole("region", { name: "Extracted tables" });
  await expect(
    tables.getByRole("cell", { name: "850.00", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await tables.getByRole("button", { name: "Export table 1 CSV" }).click();
  expect((await download).suggestedFilename()).toBe("document-table-1.csv");
  await tables.getByRole("button", { name: "View row 2 source" }).click();
  await expect(
    page.getByText("Selected evidence", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Reviewed source text").fill("Edited");
  await expect(tables).toHaveCount(0);
});

test("image upload extracts readable text locally", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/tools/ai-document-intelligence");
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 300;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1000, 300);
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("Invoice DEMO-202", 40, 80);
    ctx.fillText("Amount due INR 850.00", 40, 160);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.getByLabel("Upload documents").setInputFiles({
    name: "ocr-example.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(
    /DEMO-202/,
    { timeout: 90000 },
  );
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(/850\.00/);
  await expect(page.getByAltText("Original uploaded document")).toBeVisible();
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
  await expect(page.getByAltText("Thumbnail Page 2")).toBeVisible();
  await page
    .getByRole("button", { name: "Preview Page 2", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /sample.pdf · Page 2/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Preview Page 1", exact: true })
    .click();
  await page.getByLabel("Upload documents").setInputFiles({
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

test("financial calculations retain source evidence and distinguish matching totals", async ({
  page,
}) => {
  await page.goto("/tools/ai-document-intelligence");
  await page.getByRole("button", { name: "Paste text", exact: true }).click();
  await page
    .getByLabel("Reviewed source text")
    .fill("Base 720.34\nSGST 64.83\nCGST 64.83\nTotal 850.00");
  await page
    .getByText("Financial arithmetic & reconciliation · Free", { exact: true })
    .click();
  await page.getByLabel("Financial source page").selectOption({ index: 1 });
  await page.getByLabel("Currency/unit and scale").fill("INR units");
  for (const [quote, value] of [
    ["Base 720.34", "720.34"],
    ["SGST 64.83", "64.83"],
    ["CGST 64.83", "64.83"],
    ["Total 850.00", "850.00"],
  ]) {
    await page.getByLabel("Exact financial evidence excerpt").fill(quote);
    await page.getByLabel("Printed decimal value").fill(value);
    await page
      .getByRole("button", { name: "Add source value", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Verify selected calculation", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Evidence-backed results" })
      .getByText(
        /Selected components total 850; stated total 850; difference 0 INR units/,
      ),
  ).toBeVisible();
  await page.getByLabel("Reviewed source text").fill("Changed source");
  await expect(
    page.getByRole("button", {
      name: "Verify selected calculation",
      exact: true,
    }),
  ).toBeDisabled();
});

test('reviewed document converts to Word and PDF without an AI call', async ({ page }) => {
  await page.goto('/tools/ai-document-intelligence');
  await page.getByRole('button', { name: 'Paste text', exact: true }).click();
  await page.getByLabel('Reviewed source text').fill('Invoice total INR 850.00. Tax base INR 720.34. Review the original before payment.');
  for (const format of ['Word', 'PDF']) {
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Convert reviewed text to ' + format, exact: true }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(format === 'Word' ? /\.docx$/ : /\.pdf$/);
    expect(await file.failure()).toBeNull();
  }
});
