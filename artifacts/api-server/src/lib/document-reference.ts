import { request } from 'node:https';
import { lookup } from 'node:dns/promises';
import { createHash } from 'node:crypto';
import { approvedDestination,blocked } from './document-webhook';
export function referenceText(raw:string,html:boolean){
  const plain=html?raw.replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const v=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return v>0&&v<=0x10ffff?String.fromCodePoint(v):' ';}).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>(({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '} as Record<string,string>)[n]!)):raw;
  const text=plain.replace(/\s+/g,' ').trim();
  if(text.length<100||text.length>24000)throw Error('Reference must contain 100–24,000 characters. Paste a selected section for larger pages.');
  return text;
}
export async function importReference(value:string){
  const url=approvedDestination(value,process.env.DOCUMENT_REFERENCE_HOSTS||'');
  let timer:ReturnType<typeof setTimeout>|undefined;
  const addresses=await Promise.race([lookup(url.hostname,{all:true}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Reference DNS timeout')),5000);})]).finally(()=>clearTimeout(timer));
  if(!addresses.length||addresses.some(a=>blocked.check(a.address,a.family===4?'ipv4':'ipv6')))throw Error('Reference address is not public.');
  const pinned=addresses[0];
  const result=await new Promise<{raw:string;html:boolean}>((resolve,reject)=>{
    const req=request(url,{method:'GET',family:pinned.family,lookup:(_h,_o,cb)=>cb(null,pinned.address,pinned.family),headers:{Accept:'text/plain,text/html','Accept-Encoding':'identity','User-Agent':'ToolzCraft-Reference/1.0'},timeout:5000},res=>{
      const type=res.headers['content-type']||'';
      if(res.statusCode!==200||!/^text\/(plain|html)\b/i.test(type)||res.headers['content-encoding']){res.destroy();reject(Error('Use a direct public HTML/text URL; redirects and compressed responses are not imported.'));return;}
      let bytes=Buffer.alloc(0);res.on('data',chunk=>{if(bytes.length+chunk.length>200000){res.destroy();reject(Error('Reference page exceeds size limit.'));return;}bytes=Buffer.concat([bytes,chunk]);});
      res.on('end',()=>resolve({raw:bytes.toString('utf8'),html:/text\/html/i.test(type)}));res.on('error',reject);
    });
    const deadline=setTimeout(()=>req.destroy(Error('Reference download timeout')),8000);req.on('close',()=>clearTimeout(deadline));req.on('timeout',()=>req.destroy(Error('Reference timeout')));req.on('error',reject);req.end();
  });
  const text=referenceText(result.raw,result.html);
  return {url:url.href,retrievedAt:new Date().toISOString(),sha256:createHash('sha256').update(text).digest('hex'),text};
}
