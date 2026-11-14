import { test, expect } from "@playwright/test";

test("both categories lead to one DNS reference, including on refresh", async ({ page, request }) => {
  const legacy = "/tools/dns-record-reference-ref";
  const current = "/tools/dns-record-reference";
  const redirect = await request.get(legacy + "?from=bookmark", { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe(current + "?from=bookmark");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain(legacy);
  expect(sitemap).not.toMatch(/\/guides<\/loc>/);
  expect(sitemap.match(/\/tools\/dns-record-reference<\/loc>/g)).toHaveLength(1);
  for (const category of ["reference", "devtools"]) {
    await page.goto("/category/" + category);
    await page.locator('main a[href="' + current + '"]').first().click();
    await expect(page).toHaveTitle("DNS Record Reference | ToolzCraft");
    await expect(page.locator("h1")).toHaveText("DNS Record Reference");
    await page.reload();
    await page.getByPlaceholder("Search record types...").fill("CNAME");
    await expect(page.locator("main")).toContainText("www.example.com → example.com");
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count()) expect(await canonical.getAttribute("href")).toMatch(/\/tools\/dns-record-reference$/);
  }
});

test("public guidance examples match the mobile tool outputs", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const [slug, placeholder] of [
    ["http-status-codes-reference", "Search status codes..."],
    ["http-status-lookup", "Search by code or name..."],
  ]) {
    await page.goto("/tools/" + slug);
    await page.getByPlaceholder(placeholder).fill("404");
    await expect(page.locator("main").getByText("Not Found", { exact: true })).toBeVisible();
    await expect(page.locator("main h1")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test("guide link follows published catalogue and private metadata survives navigation", async ({ page }) => {
  for (const published of [false, true]) {
    await page.route("**/api/publication-pages", route => route.fulfill({ json: published ? [{slug:"sample"}] : [] }));
    await page.goto("/");
    const link = page.locator('footer a[href="/guides"]');
    await expect(link).toHaveCount(published ? 1 : 0);
    await page.locator('footer a[href="/subscriptions"]').click();
    await expect(page).toHaveTitle("Subscriptions | ToolzCraft");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await page.reload();
    await expect(page).toHaveTitle("Subscriptions | ToolzCraft");
    await page.unroute("**/api/publication-pages");
  }
});
