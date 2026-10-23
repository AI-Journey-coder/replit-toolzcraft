// Build visible, crawlable entry points from the same registry, guides and policies used by React.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../artifacts/toolkit'),out=path.join(root,'dist/public');
const req=name=>require(require.resolve(name,{paths:[root]}));
(async()=>{
 const {loadEnv}=await import(pathToFileURL(require.resolve('vite',{paths:[root]})).href);
 const env={...loadEnv('production',root,'VITE_'),...Object.fromEntries(Object.entries(process.env).filter(([k])=>k.startsWith('VITE_')))};
 const ts=req('typescript'),React=req('react'),{renderToStaticMarkup}=req('react-dom/server');
 let registry;
 function load(file){const source=fs.readFileSync(path.join(root,'src',file),'utf8').replaceAll('import.meta.env',JSON.stringify(env));const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;const exports={};vm.runInNewContext(code,{exports,require:name=>name==='wouter'?{Link:({children,href,...p})=>React.createElement('a',{...p,href},children)}:name==='@/lib/tools-registry'?registry:req(name)});return exports;}
 registry=load('lib/tools-registry.ts');const {TOOLS:tools,CATEGORIES:categories}=registry;
 const {ToolGuide}=load('components/ToolGuide.tsx');const {InformationPage}=load('pages/Information.tsx');
 const policies=JSON.parse(fs.readFileSync(path.join(root,'src/lib/policy-content.json'),'utf8').replace(/^\uFEFF/,''));
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let origin=env.VITE_SITE_URL;if(origin){const url=new URL(origin);if(url.protocol!=='https:')throw new Error('VITE_SITE_URL must use HTTPS.');origin=url.origin;}
 const publisher=env.VITE_ADSENSE_PUBLISHER_ID;if(publisher&&!/^ca-pub-\d{16}$/.test(publisher))throw new Error('Use the real AdSense publisher ID in ca-pub- followed by 16 digits format.');
 let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
 if(publisher&&!html.includes('name="google-adsense-account"'))html=html.replace('</head>',`<meta name="google-adsense-account" content="${publisher}" /></head>`);
 // Verification metadata does not load advertising scripts or generate an invented ads.txt authorization.
 const routes=[];
 const nav='<nav><a href="/">Tools</a> · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/compliance">All policies</a></nav>';
 function emit(route,title,description,body,noindex=false){let page=html.replace(/<title>.*?<\/title>/,`<title>${escape(title)} | ToolzCraft</title>`).replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*("\s*\/?>)/g,(_,a,b)=>a+escape(description)+b).replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*("\s*\/?>)/g,(_,a,b)=>a+escape(title)+' | ToolzCraft'+b);
   if(noindex)page=page.replace('content="index, follow"','content="noindex, follow"');
   page=page.replace(/<link rel="canonical"[^>]*>/g,'');if(origin&&!noindex)page=page.replace('</head>',`<link rel="canonical" href="${escape(origin+route)}" /></head>`);
   page=page.replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<script|<\/body)/,'<div id="root"></div>');
   page=page.replace('<div id="root"></div>',`<div id="root"><main>${body}${nav}</main></div>`);
   const directory=path.join(out,route);fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'index.html'),page);if(!noindex)routes.push(route);
 }
 for(const tool of tools)emit('/tools/'+tool.slug,tool.name,tool.description,`<h1>${escape(tool.name)}</h1><p>${escape(tool.description)}</p><p>Enable JavaScript to use the interactive tool.</p>`+renderToStaticMarkup(React.createElement(ToolGuide,{tool})));
 for(const category of categories)emit('/category/'+category.slug,category.name,category.description,`<h1>${escape(category.name)}</h1><p>${escape(category.description)}</p><ul>`+tools.filter(t=>t.category===category.slug).map(t=>`<li><a href="/tools/${t.slug}">${escape(t.name)}</a>: ${escape(t.description)}</li>`).join('')+'</ul>');
 for(const [slug,title] of Object.entries({about:'About ToolzCraft',contact:'Contact',privacy:'Privacy policy',terms:'Terms of use'}))emit('/'+slug,title,title+' for ToolzCraft.',renderToStaticMarkup(React.createElement(InformationPage,{page:slug})));
 for(const [slug,p] of Object.entries(policies))emit('/'+slug,p.title,p.description,`<h1>${escape(p.title)}</h1>`+p.sections.map(s=>`<section><h2>${escape(s.heading)}</h2><p>${escape(s.text)}</p></section>`).join(''));
 for(const [slug,title] of Object.entries({profile:'My profile',subscriptions:'Subscriptions','my-tools':'My tools','logo-gallery':'Logo gallery',promo:'Explore ToolzCraft',login:'Sign in',admin:'Administration',...env.VITE_ENABLE_AI!=='true'?{'tools/ai-summarizer':'AI unavailable','tools/ai-key-points':'AI unavailable','tools/ai-document-qa':'AI unavailable','tools/ai-translator':'AI unavailable'}:{}}))emit('/'+slug,title,title,`<h1>${title}</h1><p>Enable JavaScript to use this page.</p>`,true);
 emit('/','Browser tools','Practical tools for files, code, calculations and conversions.',`<h1>ToolzCraft browser tools</h1><p>Browse ${tools.length} tools with guidance and examples.</p><ul>`+categories.map(c=>`<li><a href="/category/${c.slug}">${escape(c.name)}</a></li>`).join('')+'</ul>');
 if(origin)fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>`<url><loc>${escape(origin+r)}</loc></url>`).join('')+'</urlset>');
 fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
 for(const [oldSlug,newSlug] of Object.entries({media:'image',files:'data'})){fs.mkdirSync(path.join(out,'category',oldSlug),{recursive:true});fs.copyFileSync(path.join(out,'category',newSlug,'index.html'),path.join(out,'category',oldSlug,'index.html'));}
 console.log(`Created ${tools.length} tool pages with guides, ${categories.length} categories and policy pages. ${origin?'Production sitemap generated.':'Set VITE_SITE_URL before publication.'}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
