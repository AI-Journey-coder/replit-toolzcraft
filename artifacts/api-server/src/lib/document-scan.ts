import { createConnection } from 'node:net';

export const SCAN_MAX_BYTES = 20 * 1024 * 1024;
export function scanConfigured() {
  return process.env.ENABLE_DOCUMENT_SCAN === 'true' && /^\d{1,5}$/.test(process.env.CLAMAV_PORT || '') && Number(process.env.CLAMAV_PORT) > 0 && Number(process.env.CLAMAV_PORT) <= 65535;
}
// Only loopback: clamd TCP has no authentication or encryption. Never accept a
// destination supplied by a request or send original files to a remote host.
async function requireFreshSignatures(signal?:AbortSignal){
 await new Promise<void>((resolve,reject)=>{
  const socket=createConnection({host:'127.0.0.1',port:Number(process.env.CLAMAV_PORT)});let response='',done=false;
  const finish=(error?:Error)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);socket.destroy();error?reject(error):resolve();};
  const abort=()=>finish(Error('Scan cancelled'));const timer=setTimeout(()=>finish(Error('Scanner version check timed out')),5000);
  signal?.addEventListener('abort',abort,{once:true});socket.on('error',()=>finish(Error('Scanner unavailable')));
  socket.on('connect',()=>socket.write('zVERSION\0'));
  socket.on('data',chunk=>{response+=chunk.toString();if(response.length>4096)finish(Error('Invalid scanner version'));});
  socket.on('end',()=>{const stamp=Date.parse(response.replace(/\0$/,'').split('/').slice(2).join('/'));const age=Date.now()-stamp;if(!response.startsWith('ClamAV ')||!response.endsWith('\0')||!Number.isFinite(stamp)||age>7*86400000||age< -86400000)finish(Error('Scanner signatures are unavailable or stale'));else finish();});
  socket.on('close',()=>{if(!done)finish(Error('Incomplete scanner version'));});if(signal?.aborted)abort();
 });
}
export async function scanDocument(bytes: Buffer, signal?: AbortSignal): Promise<'clean' | 'blocked'> {
  if (!scanConfigured()) return Promise.reject(new Error('Scanner unavailable'));
  if (!bytes.length || bytes.length > SCAN_MAX_BYTES) return Promise.reject(new Error('Invalid scan size'));
  await requireFreshSignatures(signal);
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: '127.0.0.1', port: Number(process.env.CLAMAV_PORT) });
    let done = false, response = Buffer.alloc(0);
    const finish = (error?: Error, result?: 'clean' | 'blocked') => {
      if (done) return;
      done = true; clearTimeout(timer); signal?.removeEventListener('abort', abort); socket.destroy();
      if (error) reject(error); else resolve(result!);
    };
    const abort = () => finish(new Error('Scan cancelled'));
    const timer = setTimeout(() => finish(new Error('Scan timed out')), 30000);
    signal?.addEventListener('abort', abort, { once: true });
    socket.on('error', () => finish(new Error('Scanner unavailable')));
    socket.on('data', chunk => {
      if (typeof chunk === 'string') { finish(new Error('Invalid scanner encoding')); return; }
      if (response.length + chunk.length > 4096) { finish(new Error('Invalid scanner response')); return; }
      response = Buffer.concat([response, chunk]);
    });
    socket.on('end', () => {
      const answer = response.toString('utf8');
      if (answer === 'stream: OK\0') finish(undefined, 'clean');
      else if (/^stream: [^\r\n\0]+ FOUND\0$/.test(answer)) finish(undefined, 'blocked');
      else finish(new Error('Scan incomplete'));
    });
    socket.on('close', () => { if (!done) finish(new Error('Scan incomplete')); });
    socket.on('connect', () => {
      socket.write('zINSTREAM\0');
      let offset = 0;
      const pump = () => {
        while (!done && offset < bytes.length) {
          const end = Math.min(offset + 65536, bytes.length);
          const frame = Buffer.allocUnsafe(4 + end - offset);
          frame.writeUInt32BE(end - offset); bytes.copy(frame, 4, offset, end); offset = end;
          if (!socket.write(frame)) { socket.once('drain', pump); return; }
        }
        if (!done) socket.write(Buffer.alloc(4));
      };
      pump();
    });
    if (signal?.aborted) abort();
  });
}
