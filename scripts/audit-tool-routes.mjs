import fs from 'node:fs';
import path from 'node:path';
import {chromium} from '@playwright/test';
import {createServer} from '../deploy/server.mjs';
const root=path.resolve('artifacts/toolkit/dist/public');
const routes=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>https?:\/\/[^/]+(\/tools\/[^<]+)<\/loc>/g)].map(m=>m[1]);
if(!routes.length)throw new Error("No tool routes found in sitemap");
fs.mkdirSync("test-results",{recursive:true});
const server=createServer({root,production:true,staging:true});await new Promise(r=>server.listen(3089,'127.0.0.1',r));
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL || (process.platform==='win32'?'msedge':undefined),headless:true});const rows=[];let cursor=0;
try{await Promise.all(Array.from({length:3},async()=>{const page=await browser.newPage();while(cursor<routes.length){const route=routes[cursor++];const errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);let row={route};try{await page.setViewportSize({width:1280,height:900});const response=await page.goto('http://127.0.0.1:3089'+route);await page.getByRole('button',{name:/Add to favourites/}).waitFor({timeout:15000});await page.waitForTimeout(100);row.status=response.status();row.guide=await page.locator('details[aria-label$="guidance"]').count();row.errors=errors;await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);row.mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(row.mobileOverflow||errors.length)await page.screenshot({path:'test-results/audit-'+route.split('/').pop()+'.png',fullPage:false});}catch(e){row.failure=e.message.slice(0,200);}finally{page.off('pageerror',listener);}rows.push(row);if(rows.length%25===0)console.log('Audited '+rows.length+'/'+routes.length);}await page.close();}));}finally{await browser.close();await new Promise(r=>server.close(r));}
const issues=rows.filter(r=>r.failure||r.status!==200||r.errors?.length||r.mobileOverflow||r.guide!==1);
fs.writeFileSync('test-results/route-audit.json',JSON.stringify(rows,null,2));console.log(JSON.stringify({count:rows.length,issues},null,2));
if(issues.length)process.exitCode=1;
