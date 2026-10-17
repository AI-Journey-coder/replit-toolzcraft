import { test, expect } from '@playwright/test';
import path from 'node:path';
const fixture=(name:string)=>path.resolve('test-results/fixtures',name);
test('contact merges require selection and preserve other contacts',async({page})=>{
 await page.goto('/tools/contact-duplicate-merger');
 await page.getByRole('textbox',{name:'Contact file text',exact:true}).fill('Name,Phone,Email,Company\nAda,+12025550123,ada@example.com,First\nAda Work,+12025550124,ada@example.com,Second\nGrace,+12025550125,grace@example.com,Third');
 await page.getByRole('button',{name:'Find duplicate candidates',exact:true}).click();
 await expect(page.getByRole('button',{name:'Preview selected merges',exact:true})).toBeDisabled();
 await page.getByRole('combobox',{name:'Keep name and company from group 1',exact:true}).selectOption('1');
 await page.getByRole('checkbox',{name:'Merge group 1 with this primary contact',exact:true}).check();
 await page.getByRole('button',{name:'Preview selected merges',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Merged output · 2 contacts',exact:true})).toBeVisible();
 await expect(page.getByText('1. Ada Work · Second · +12025550123, +12025550124 · ada@example.com',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Reset merge selections',exact:true}).click();
 await expect(page.getByRole('button',{name:'Preview selected merges',exact:true})).toBeDisabled();
});
test('length, favourites, currency and logo persist',async({page})=>{
 await page.goto('/tools/length-converter');await expect(page.getByText('5\' 3" · 5 ft 3 in',{exact:true})).toBeVisible();await page.getByRole('spinbutton',{name:'Value',exact:true}).fill('75');await expect(page.getByText('6\' 3" · 6 ft 3 in',{exact:true})).toBeVisible();await page.getByRole('button',{name:'☆ Add to favourites'}).click();await page.goto('/my-tools');await page.getByRole('combobox',{name:'Preferred currency',exact:true}).selectOption('USD');await page.reload();await expect(page.getByRole('combobox',{name:'Preferred currency',exact:true})).toHaveValue('USD');await expect(page.getByRole('heading',{name:'Your favourites (1)'})).toBeVisible();await page.goto('/logo-gallery');const card=page.getByRole('article').filter({hasText:'TC monogram'});await card.getByRole('button',{name:'Use this logo'}).click();await page.reload();await expect(card.getByRole('button',{name:'Selected'})).toHaveAttribute('aria-pressed','true');
});
test('mobile directory and policies remain usable',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/privacy');await page.getByRole('button',{name:'Tools',exact:true}).click();await page.locator('#mobile-tool-directory').getByRole('searchbox',{name:'Find a tool'}).fill('Length');await page.locator('#mobile-tool-directory').getByRole('link',{name:'Length Converter',exact:true}).click();await expect(page).toHaveURL(/length-converter/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
test('verified purchasing-power example and validation',async({page})=>{await page.goto('/tools/money-value-calculator');await page.getByRole('button',{name:'Load this example'}).click();await page.getByRole('button',{name:'Show what my money can buy'}).click();await expect(page.getByText('2.83 units',{exact:true})).toBeVisible();await expect(page.getByText('2.44 units',{exact:true})).toBeVisible();});
test('PDF organizer creates a download from a real PDF',async({page})=>{await page.goto('/tools/pdf-page-organizer');await page.locator('input[type=file]').setInputFiles(fixture('sample.pdf'));await expect(page.getByText(/2 pages ready/)).toBeVisible();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download selected pages'}).click();expect((await download).suggestedFilename()).toBe('organized.pdf');});
test('PDF form supports filling and downloading',async({page})=>{await page.goto('/tools/pdf-form-filler');await page.locator('input[type=file]').setInputFiles(fixture('form.pdf'));await page.getByRole('textbox',{name:'Full name'}).fill('Ada Example');const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download filled PDF'}).click();expect((await download).suggestedFilename()).toBe('filled-form.pdf');});
test('Markdown preview removes executable markup',async({page})=>{await page.goto('/tools/markdown-preview');await page.getByTestId('textarea-markdown').fill('<script>alert(1)</script><img src=x onerror="alert(1)"><p>Safe text</p>');await expect(page.getByTestId('div-preview')).toContainText('Safe text');await expect(page.getByTestId('div-preview').locator('script,[onerror]')).toHaveCount(0);});
test('missing pages and stale assets return 404',async({request})=>{expect((await request.get('/nonexistent-route')).status()).toBe(404);expect((await request.get('/assets/old-build.js')).status()).toBe(404);});

test('homepage catalogue search, category filters and empty results', async ({ page }) => {
 await page.goto('/');
 const search = page.getByRole('searchbox', { name: 'Search the tool catalogue', exact: true });
 await search.fill('contacts');
 await expect(page.getByRole('heading', { name: 'Matching tools', exact: true })).toBeVisible();
 await expect(page.locator('main').getByRole('link').filter({ hasText: 'Contacts Viewer & Converter' })).toBeVisible();
 await page.getByRole('combobox', { name: 'Filter tools by category' }).selectOption('finance');
 await expect(page.getByText('No tools match your search. Try a shorter phrase or another category.', { exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Show all tools', exact: true }).click();
 await expect(search).toHaveValue('');
 await page.getByRole('button', { name: 'Expand all categories', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Collapse all categories', exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Collapse all categories', exact: true }).click();
 await expect(page.locator('[id^="home-category-"]:visible')).toHaveCount(0);
});


test('intent search and theme choice survive navigation and reload', async ({page}) => {
 await page.goto('/');
 await page.getByRole('searchbox',{name:'Search the tool catalogue',exact:true}).fill('shrink');
 await expect(page.locator('main a[href="/tools/image-resizer"]')).toBeVisible();
 await expect(page.locator('main a[href="/tools/video-compressor"]')).toBeVisible();
 await page.goto('/my-tools');
 await page.getByRole('button',{name:/^Indigo Paper/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-palette','indigo');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-palette','indigo');
 await page.getByRole('button',{name:/^Jade Studio/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-palette','jade');
});

test('compressor keeps a tiny original instead of inflating it at target zero', async ({page}) => {
 await page.goto('/tools/image-compressor');
 await page.locator('input[type=file]').setInputFiles(fixture('pixel.png'));
 await page.getByRole('combobox',{name:'Output format',exact:true}).selectOption('image/png');
 await page.getByRole('button',{name:'Compress images',exact:true}).click();
 await expect(page.getByText('Original kept: re-encoding was not smaller. Original format, dimensions and metadata are retained.',{exact:true})).toBeVisible();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download',exact:true}).click();
 const saved=await (await download).path();
 const fs=await import('node:fs/promises');
 expect(await fs.readFile(saved!)).toEqual(await fs.readFile(fixture('pixel.png')));
});

