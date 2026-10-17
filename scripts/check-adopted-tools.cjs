const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('vm'),{createRequire}=require('module');
const ts=require('../node_modules/typescript');const file=path.resolve(__dirname,'../artifacts/toolkit/src/lib/contact-conversion.ts');const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{module:mod,exports:mod.exports,require:createRequire(file)});const {parseContacts,contactsCsv,contactsVcf,whatsappLink}=mod.exports;
const contacts=[{name:'Mukta, Example; नमस्ते',phones:['+919876543210','+12025550123'],emails:['a@example.com','b@example.com'],company:'Example "Company"\nDivision'}];
assert.deepEqual(JSON.parse(JSON.stringify(parseContacts(contactsVcf(contacts)).contacts)),contacts);assert.deepEqual(JSON.parse(JSON.stringify(parseContacts(contactsCsv(contacts,false)).contacts)),contacts);
assert.match(contactsCsv([{...contacts[0],name:'=1+1'}]),/'=1\+1/);assert.throws(()=>parseContacts('BEGIN:VCARD\nVERSION:3.0\nFN:Test'),/incomplete|complete/);assert.throws(()=>parseContacts('BEGIN:VCARD\nVERSION:2.1\nFN:Test\nEND:VCARD'),/3.0/);assert.throws(()=>parseContacts('Name,Email\nA,a@example.com,extra'),/width/);
assert.equal(whatsappLink('+91 98765 43210','Hello & नमस्ते'),'https://wa.me/919876543210?text='+encodeURIComponent('Hello & नमस्ते'));assert.throws(()=>whatsappLink('09876543210',''),/7–15/);assert.throws(()=>whatsappLink('123abc456789',''),/digits/);
console.log('PASS: contact VCF/CSV Unicode and multiline round trips, multiple phones/emails, spreadsheet protection, malformed inputs and WhatsApp link validation.');
const {contactDuplicateGroups,mergeContactGroups}=mod.exports;
const roster=[{name:'A',company:'First',phones:['+1 (202) 555-0123'],emails:['a@example.com']},{name:'B',company:'Second',phones:['+12025550123'],emails:['b@example.com']},{name:'C',company:'Third',phones:[],emails:['B@example.com']},{name:'A',company:'Different person',phones:[],emails:[]}];
const original=JSON.stringify(roster),groups=contactDuplicateGroups(roster);
assert.equal(groups.length,1);assert.equal(groups[0].indices.length,3);assert.equal(contactDuplicateGroups(roster,'email')[0].indices.length,2);assert.equal(contactDuplicateGroups(roster,'phone')[0].indices.length,2);
assert.equal(mergeContactGroups(roster,groups,{}).length,4);const merged=mergeContactGroups(roster,groups,{0:1});assert.equal(merged.length,2);assert.equal(merged[0].name,'B');assert.equal(merged[0].company,'Second');assert.equal(merged[0].phones.length,2);assert.equal(merged[0].emails.length,3);assert.equal(merged[1].company,'Different person');assert.equal(JSON.stringify(roster),original);assert.throws(()=>mergeContactGroups(roster,groups,{0:3}),/primary/);
assert.equal(contactDuplicateGroups([{name:'A',company:'',phones:['02025550123'],emails:[]},{name:'A',company:'',phones:['+12025550123'],emails:[]}]).length,0);
console.log('PASS: transitive candidate groups, email/phone modes, no name-only matches, explicit selection, primary fields, preservation and non-mutating merge.');

// Search regression checks use the real catalogue and keep all entry points consistent.
function loadSearchModule(name){const source=fs.readFileSync(path.resolve(__dirname,'../artifacts/toolkit/src/lib',name),'utf8').replaceAll('import.meta.env.VITE_ENABLE_AI','"false"');const m={exports:{}};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,module:m,require:()=>new Proxy({},{get:()=>()=>null})});return m.exports;}
const {TOOLS,CATEGORIES}=loadSearchModule('tools-registry.ts');const {searchTools}=loadSearchModule('tool-search.ts');
for(const tool of TOOLS)assert.ok(searchTools(TOOLS,tool.name).filter(t=>t.name===tool.name).some(t=>t.slug===tool.slug),`Exact title: ${tool.name}`);
for(const term of ['shrink','compact','smaller'])for(const slug of ['image-compressor','image-resizer','video-compressor','pdf-compressor','file-compressor'])assert.ok(searchTools(TOOLS,term).some(t=>t.slug===slug),`${term}: ${slug}`);
assert.equal(searchTools(TOOLS,'shrink photo')[0]?.category,'image');
assert.ok(searchTools(TOOLS,'payroll').some(t=>t.slug==='ctc-calculator'));
assert.ok(searchTools(TOOLS,'pretty json').length>0);
assert.equal(searchTools(TOOLS,'zzzznotatool').length,0);
assert.equal(searchTools(TOOLS,'  ').length,TOOLS.length);
for(const c of CATEGORIES)assert.ok(TOOLS.filter(t=>t.category===c.slug).length>1,c.name);
console.log('PASS: all exact catalogue titles, intent synonyms, multiword search, empty queries and no single-tool categories.');
for(const term of ['shri','compa','payr'])assert.ok(searchTools(TOOLS,term).length>0,term);
for(const slug of ['image-compressor','video-compressor','pdf-compressor','image-resizer'])assert.ok(searchTools(TOOLS,'shri').some(t=>t.slug===slug),slug);
