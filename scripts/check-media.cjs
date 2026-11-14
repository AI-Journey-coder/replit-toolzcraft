global.self={location:{href:'file:///ffmpeg-core.js'}};
const path=require('path'),fs=require('fs'),assert=require('node:assert/strict');const base=path.resolve(__dirname,'../artifacts/toolkit');
(async()=>{const entry=require.resolve('@ffmpeg/core',{paths:[base]});const create=require(entry);const core=await create({wasmBinary:fs.readFileSync(path.join(path.dirname(entry),'ffmpeg-core.wasm'))});core.setLogger(()=>{});
  let code=core.exec('-f','lavfi','-i','color=c=blue:s=320x240:d=1','-c:v','libx264','-pix_fmt','yuv420p','sample.mp4');assert.equal(code,0);
  code=core.exec('-i','sample.mp4','-map','0:v:0','-map','0:a?','-vf','scale=-2:trunc(min(720\\,ih)/2)*2','-c:v','libx264','-preset','ultrafast','-crf','28','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','output.mp4');assert.equal(code,0);const out=core.FS.readFile('output.mp4');assert.ok(out.length>0);console.log('PASS: bundled FFmpeg generated and compressed a short MP4 with the app command.');
  process.exit(0);
})().catch(e=>{console.error(e);process.exitCode=1;});
