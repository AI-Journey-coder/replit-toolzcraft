import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
export async function extractBinary(bytes: Buffer, format: string, signal: AbortSignal): Promise<{pages:{id:string;label:string;text:string}[];warnings:string[]}> {
  if (!['txt','docx','pdf','png','jpg','jpeg'].includes(format)) throw Error('Unsupported document format');
  const temporary=await mkdtemp(join(tmpdir(),'toolzcraft-extract-'));
  try { return await new Promise((accept,reject)=>{
    const child=spawn(process.env.DOCUMENT_PYTHON || 'python3',[resolve(process.cwd(),'document-extract.py'),format,temporary],{
      stdio:['pipe','pipe','ignore'],detached:process.platform!=='win32',windowsHide:true,
      env:{PATH:process.env.PATH,LANG:'C.UTF-8',PYTHONIOENCODING:'utf-8',...(process.platform==='win32'?{SYSTEMROOT:process.env.SYSTEMROOT,TEMP:process.env.TEMP}:{})},
    });
    let output=Buffer.alloc(0),failure:Error|undefined;
    const stop=(error:Error)=>{failure ||= error;try{if(process.platform!=='win32'&&child.pid)process.kill(-child.pid,'SIGKILL');else child.kill();}catch{}};
    const abort=()=>stop(Error('Extraction cancelled'));
    const timer=setTimeout(()=>stop(Error('Extraction timed out. Split the document.')),45000);
    signal.addEventListener('abort',abort,{once:true});
    child.on('error',()=>{failure=Error('Document extraction unavailable');});
    child.stdin.on('error',()=>{});
    child.stdout.on('data',chunk=>{if(output.length+chunk.length>2*1024*1024)stop(Error('Extracted output exceeds limits'));else output=Buffer.concat([output,chunk]);});
    child.on('close',code=>{
      clearTimeout(timer);signal.removeEventListener('abort',abort);
      if(failure){reject(failure);return;}
      try{const result=JSON.parse(output.toString('utf8'));if(code!==0||!Array.isArray(result.pages)||!result.pages.length)throw Error();accept(result);}catch{reject(Error('Extraction failed. Use local extraction or split the file.'));}
    });
    if(signal.aborted)abort();else child.stdin.end(bytes);
  }); } finally { await rm(temporary,{recursive:true,force:true}); }
}
