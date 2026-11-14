import { test, expect } from "@playwright/test";

for (const route of ["ai-key-points", "ai-document-qa", "ai-translator"])
  test(route + " preserves uploaded and oversized input", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let calls = 0;
    await page.route("**/api/ai/**", (route) => {
      calls++;
      return route.abort();
    });
    await page.goto("/tools/" + route);
    await page
      .locator("input[type=file]")
      .setInputFiles({
        name: "meeting.txt",
        mimeType: "text/plain",
        buffer: Buffer.from(
          "Priya must finish testing by 25 October. Budget INR 85,000.",
        ),
      });
    await expect(page.locator("textarea").first()).toContainText("85,000");
    const source = "A".repeat(6001) + " END";
    await page.locator("textarea").first().fill(source);
    await expect(page.locator("textarea").first()).toHaveValue(source);
    await expect(page.getByRole("alert")).toContainText(
      "nothing has been sent or truncated",
    );
    await expect(page.getByTestId("button-run")).toBeDisabled();
    expect(calls).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("SRI hashes are browser-compatible and reject HTTP error pages", async ({
  page,
}) => {
  await page.goto("/tools/sri-hash-generator");
  await page.locator("textarea").first().fill("hello");
  await page.getByRole("button", { name: "Hash content", exact: true }).click();
  const { createHash } = await import("node:crypto");
  await expect(page.locator("main")).toContainText(
    "sha384-" + createHash("sha384").update("hello").digest("base64"),
  );
  await page.route("https://cdn.example.com/missing.js", (route) =>
    route.fulfill({
      status: 404,
      body: "Not found",
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await page
    .getByPlaceholder("https://cdn.example.com/library.min.js")
    .fill("https://cdn.example.com/missing.js");
  await page.getByRole("button", { name: "Fetch & Hash" }).click();
  await expect(
    page.getByText("Failed to fetch URL — try pasting content directly"),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    "sha384-" + createHash("sha384").update("Not found").digest("base64"),
  );
});
