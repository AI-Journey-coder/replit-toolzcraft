export function initialRole(uid:string,allowlist=process.env.ADMIN_FIREBASE_UIDS||''): 'admin'|'user' {
  return allowlist.split(',').map(x=>x.trim()).filter(Boolean).includes(uid)?'admin':'user';
}
export function allowedOrigin(origin:string|undefined,configured=process.env.APP_ORIGIN){
  return !origin||Boolean(configured&&origin===configured);
}
export function validateRuntime(env:NodeJS.ProcessEnv=process.env){
  if(env.NODE_ENV!=='production')return;
  if(!env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
  const origin=new URL(env.APP_ORIGIN||'');if(origin.protocol!=='https:'||origin.origin!==env.APP_ORIGIN)throw new Error('APP_ORIGIN must be the public HTTPS origin without a trailing slash.');
  if(!env.FIREBASE_PROJECT_ID&&!env.VITE_FIREBASE_PROJECT_ID)throw new Error('FIREBASE_PROJECT_ID is required for API authentication.');
  if(env.ENABLE_AI==='true'&&(!env.AI_MODEL||!(env.AI_PROVIDER==='openai'?env.OPENAI_API_KEY:env.GEMINI_API_KEY)))throw new Error('Enabled AI requires an explicit AI_MODEL and server-only provider key.');
}
