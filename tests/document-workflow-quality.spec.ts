import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";

const toolkit = createRequire(path.resolve("artifacts/toolkit/package.json"));
const { PDFDocument } = toolkit("pdf-lib");

test("organizer exports selected pages in the chosen order and rotation", async ({ page }) => {
  const pdf = await PDFDocument.create();
  for (const width of [200, 300, 400]) pdf.addPage([width, 500]);
  await page.goto("/tools/pdf-page-organizer");
  await page.locator('input[type=file]').setInputFiles({ name: "order.pdf", mimeType: "application/pdf", buffer: Buffer.from(await pdf.save()) });
  await page.getByRole("button", { name: "Move page at position 3 earlier" }).click();
  await page.getByRole("button", { name: "Move page at position 2 earlier" }).click();
  await page.getByLabel("Position 3 · page 2").uncheck();
  await page.locator("article").filter({has:page.getByAltText("Original page 3")}).getByRole("button",{name:"Rotate"}).click();
  const result = page.waitForEvent("download");
  await page.getByRole("button",{name:"Download selected pages"}).click();
  const out = await PDFDocument.load(await readFile((await (await result).path())!));
  expect(out.getPages().map((p: any) => [p.getWidth(), p.getRotation().angle])).toEqual([[400,90],[200,0]]);
});

test("cleaned CSV download retains quoted fields and identifiers through JSON conversion", async ({page}) => {
  await page.goto("/tools/csv-cleaner");
  await page.locator("textarea").fill('name,date,id\n"Ada, Jr.",31/12/2025,001\n"Ada, Jr.",31/12/2025,001');
  await page.getByRole("button",{name:"Preview cleaned CSV"}).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button",{name:"Download cleaned CSV"}).click();
  const csv = await readFile((await (await download).path())!, "utf8");
  const guide = page.locator('details[aria-label$="guidance"]');
  await guide.locator("summary").click();
  await guide.getByRole("link",{name:"CSV to JSON"}).click();
  await page.getByTestId("textarea-input").fill(csv.replace(/^\uFEFF/, ""));
  await page.getByTestId("btn-convert").click();
  expect(JSON.parse(await page.getByTestId("textarea-output").inputValue())).toEqual([{name:"Ada, Jr.",date:"2025-12-31",id:"001"}]);
});

test("searchable PDF rejects 21 pages and exports searchable scan text", async ({page}) => {
  test.setTimeout(150000);
  await page.goto("/tools/searchable-pdf");
  const upload = page.locator('input[type=file]');
  const oversized = await PDFDocument.create();
  for(let i=0;i<21;i++) oversized.addPage();
  await upload.setInputFiles({name:"too-many.pdf",mimeType:"application/pdf",buffer:Buffer.from(await oversized.save())});
  await page.getByRole("button",{name:"Create searchable PDF"}).click();
  await expect(page.getByText(/split larger documents first/i)).toBeVisible();
  const raster = await page.evaluate(() => {
    const canvas=document.createElement("canvas");canvas.width=900;canvas.height=180;
    const ctx=canvas.getContext("2d")!;ctx.fillStyle="white";ctx.fillRect(0,0,900,180);
    ctx.fillStyle="black";ctx.font="bold 54px Arial";ctx.fillText("ORCHARD INVOICE",45,110);
    return canvas.toDataURL("image/png");
  });
  const pdf=await PDFDocument.create();
  const img=await pdf.embedPng(raster);
  pdf.addPage([450,90]).drawImage(img,{x:0,y:0,width:450,height:90});
  await upload.setInputFiles({name:"scan.pdf",mimeType:"application/pdf",buffer:Buffer.from(await pdf.save())});
  await page.getByRole("button",{name:"Create searchable PDF"}).click();
  const button=page.getByRole("button",{name:"Download searchable PDF"});
  await expect(button).toBeVisible({timeout:100000});
  const download=page.waitForEvent("download");await button.click();
  const output=await readFile((await (await download).path())!);
  await page.goto("/tools/ai-document-intelligence");
  await page.getByLabel("Upload documents").setInputFiles({name:"searchable.pdf",mimeType:"application/pdf",buffer:output});
  await expect(page.getByLabel("Reviewed source text")).toHaveValue(/ORCHARD\s+INVOICE/i);
});

test("base 36 example, zero and invalid input match the displayed result", async ({page}) => {
  await page.goto("/tools/arbitrary-base-converter");
  const input = page.locator("main input.text-lg");
  for (const [value, expected] of [["35", "Z"], ["0", "0"], ["xyz", "—"]]) {
    await input.fill(value);
    await expect(page.locator("main div.min-h-\\[52px\\]")).toHaveText(expected);
  }
});

test("every advertised tool prerenders its own operating instructions", async ({ request }) => {
  const fs = await import("node:fs/promises");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const tools = Array.from(sitemap.matchAll(/<loc>https?:\/\/[^/]+\/tools\/([\w-]+)<\/loc>/g), match => match[1]);
  expect(tools.length).toBeGreaterThan(250);
  const instructions = new Set<string>();
  for (const slug of tools) {
    const html = await fs.readFile(path.resolve("artifacts/toolkit/dist/public/tools",slug,"index.html"), "utf8");
    const steps = /Getting a reliable result<\/h3><p>([^<]+)<\/p>/.exec(html)?.[1];
    expect(steps,slug).toBeTruthy();
    expect(instructions.has(steps!),slug).toBe(false);
    instructions.add(steps!);
  }
});
