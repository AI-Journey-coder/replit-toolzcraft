import { test, expect } from "@playwright/test";
for (const width of [390, 1280])
  test(
    "summary modes and local upload at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      let aiCalls = 0;
      await page.route("**/api/ai/**", (route) => {
        aiCalls++;
        return route.abort();
      });
      await page.goto("/tools/ai-summarizer");
      await expect(
        page.getByRole("radio", { name: "Free Summary" }),
      ).toBeChecked();
      await page
        .locator("input[type=file]")
        .setInputFiles({
          name: "document.txt",
          mimeType: "text/plain",
          buffer: Buffer.from(
            "Revenue increased this quarter. Revenue from subscriptions grew steadily. Costs stayed stable. The team hired two engineers. New markets opened.",
          ),
        });
      await expect(
        page.getByText("Text ready. Review and correct it before using AI."),
      ).toBeVisible();
      await page.getByTestId("button-run").click();
      await expect(page.getByTestId("text-result")).toContainText("Revenue");
      expect(aiCalls).toBe(0);
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download summary" }).click();
      expect((await download).suggestedFilename()).toBe(
        "toolzcraft-summary.txt",
      );
      await page
        .getByRole("radio", { name: "Quick Summary", exact: true })
        .check();
      await page.locator("textarea").first().fill("x".repeat(6001));
      await expect(page.getByRole("alert")).toContainText(
        "Choose Full Document",
      );
      await expect(page.getByTestId("button-run")).toBeDisabled();
      await page
        .getByRole("radio", { name: "Full Document", exact: true })
        .check();
      await expect(
        page.getByText(
          "6,001 / 24,000 characters · 2 credits for this summary",
        ),
      ).toBeVisible();
      await expect(page.getByTestId("button-run")).toBeDisabled();
      await page
        .getByRole("radio", { name: "Free Summary", exact: true })
        .check();
      await page.locator("textarea").first().fill("a".repeat(24001));
      await expect(page.getByTestId("button-run")).toBeDisabled();
      console.log('Overflow elements:',await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(el=>el.getBoundingClientRect().right>window.innerWidth+1).slice(0,12).map(el=>({tag:el.tagName,classes:el.className,width:el.getBoundingClientRect().width}))));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    },
  );

test('PDF text extraction and corrupt files do not send AI requests',async({page})=>{
 await page.goto('/tools/ai-summarizer');await page.locator('input[type=file]').setInputFiles('test-results/fixtures/sample.pdf');await expect(page.locator('textarea').first()).toContainText('ToolzCraft test 123');await expect(page.locator('textarea').first()).toContainText('[Page 2]');
 await page.locator('input[type=file]').setInputFiles({name:'broken.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF')});await expect(page.getByRole('status').filter({hasText:/PDF|Invalid|read/i})).toBeVisible();await expect(page.locator('textarea').first()).toContainText('ToolzCraft test 123');
});
