const fs=require('fs'),path=require('path');const {pathToFileURL}=require('url');const root=path.resolve(__dirname,'../artifacts/toolkit');
(async()=>{const {loadEnv}=await import(pathToFileURL(require.resolve('vite',{paths:[root]})).href);const env={...loadEnv('production',root,'VITE_'),...process.env};const issues=[];
for(const key of ['VITE_SITE_URL','VITE_CONTACT_EMAIL','VITE_OPERATOR_NAME'])if(!env[key]?.trim())issues.push(`${key} is missing.`);
try{const u=new URL(env.VITE_SITE_URL);if(u.protocol!=='https:'||['localhost','127.0.0.1'].includes(u.hostname)||u.hostname.endsWith('.example'))issues.push('Use the real public HTTPS domain.');}catch{issues.push('A valid production domain is required.');}
if(env.VITE_CONTACT_EMAIL&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.VITE_CONTACT_EMAIL))issues.push('Contact email format is invalid.');
const firebaseKeys=['VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'];
const firebaseCount=firebaseKeys.filter(key=>env[key]?.trim()).length;
if(firebaseCount>0&&firebaseCount<3)issues.push('Firebase public configuration is incomplete; supply all three values or leave all unset.');
if((env.VITE_ENABLE_AI==='true'||env.VITE_ENABLE_PHONE_AUTH==='true')&&firebaseCount!==3)issues.push('AI and phone sign-in require complete Firebase configuration.');
if(env.VITE_ADSENSE_PUBLISHER_ID&&!/^ca-pub-\d{16}$/.test(env.VITE_ADSENSE_PUBLISHER_ID))issues.push('AdSense publisher ID must be your actual ca-pub- followed by 16 digits.');
try{const u=new URL(env.VITE_SITE_URL);if(u.pathname!=='/'||u.search||u.hash||u.username||u.password)issues.push('VITE_SITE_URL must be an origin only, without path, query or credentials.');}catch{}
if(env.VITE_ENABLE_AI==='true')issues.push('AI is enabled: complete provider, privacy and live endpoint review before release.');
if(env.VITE_ENABLE_USAGE_TRACKING==='true')issues.push('Usage tracking is enabled: confirm legal basis, retention and privacy controls before release.');
const out=path.join(root,'dist/public');for(const file of ['index.html','privacy/index.html','terms/index.html','contact/index.html','cookies/index.html','sitemap.xml'])if(!fs.existsSync(path.join(out,file)))issues.push(`Build output missing: ${file}`);
if(fs.existsSync(path.join(out,'privacy/index.html'))&&fs.readFileSync(path.join(out,'privacy/index.html'),'utf8').includes('no support email configured'))issues.push('Built policy pages still contain the local contact fallback. Rebuild with operator details.');
if(issues.length){console.error('Publication checks need attention:\n'+issues.map(x=>'- '+x).join('\n'));process.exitCode=1;}else console.log('Automated publication checks passed. This is not Google approval or legal certification. Complete COMPLIANCE.md and live-site review.');
})().catch(e=>{console.error(e);process.exitCode=1;});
