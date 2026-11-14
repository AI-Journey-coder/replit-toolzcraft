export async function encodeImage(canvas:HTMLCanvasElement,type:string,quality:number,targetKB:number,signal:AbortSignal){
 const encode=(c:HTMLCanvasElement,q:number)=>new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Image encoding failed.')),type,q));
 if(targetKB===0)return encode(canvas,quality);
 if(!Number.isFinite(targetKB)||targetKB<1||targetKB>100000)throw Error('Target size must be 1–100,000 KB, or 0 for manual quality.');
 const limit=Math.floor(targetKB*1024);let source=canvas;
 for(let attempt=0;attempt<25;attempt++){
  signal.throwIfAborted();let best=await encode(source,quality);if(best.size<=limit)return best;
  let low=0.05,high=quality;let candidate=await encode(source,low);
  if(candidate.size<=limit){for(let i=0;i<8;i++){signal.throwIfAborted();const mid=(low+high)/2;const b=await encode(source,mid);if(b.size<=limit){candidate=b;low=mid;}else high=mid;}return candidate;}
  if(source.width===1&&source.height===1)break;
  const next=document.createElement('canvas');next.width=Math.max(1,Math.floor(source.width*0.8));next.height=Math.max(1,Math.floor(source.height*0.8));next.getContext('2d')!.drawImage(canvas,0,0,next.width,next.height);source=next;
 }
 throw Error('Could not meet the target. Choose a larger size or JPEG/WebP format.');
}

/** Keep the highest tested quality that beats the original, or retain its exact bytes. */
export async function compressWithoutGrowth(canvas: HTMLCanvasElement, original: Blob, type: string, quality: number, targetKB: number, signal: AbortSignal) {
 signal.throwIfAborted();
 if (!Number.isFinite(quality) || quality < 0.1 || quality > 1) throw Error('Quality must be between 10% and 100%.');
 let blob = await encodeImage(canvas, type, quality, targetKB, signal);
 signal.throwIfAborted();
 let usedQuality = quality;
 // Manual target=0: avoid unexpectedly destroying quality or shrinking dimensions further.
 if (targetKB === 0 && blob.size >= original.size && type !== 'image/png') {
  const floor = Math.min(quality, 0.5);
  for (let q = quality - 0.05; q >= floor - 0.001; q -= 0.05) {
   signal.throwIfAborted();
   const candidate = await encodeImage(canvas, type, Math.max(floor,q), 0, signal);
   signal.throwIfAborted();
   if (candidate.size < blob.size) { blob = candidate; usedQuality = Math.max(floor,q); }
   if (blob.size < original.size) break;
  }
 }
 const originalFits = targetKB === 0 || original.size <= Math.floor(targetKB * 1024);
 if (blob.size >= original.size && originalFits) return {blob:original, retained:true, quality:null};
 return {blob, retained:false, quality:targetKB===0?usedQuality:null};
}
