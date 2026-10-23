const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../artifacts/toolkit');const dest=path.join(root,'public/vendor/pyodide');fs.mkdirSync(dest,{recursive:true});
const source=path.dirname(require.resolve('pyodide/package.json',{paths:[root]}));
for(const name of ['pyodide.mjs','pyodide.asm.mjs','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])fs.copyFileSync(path.join(source,name),path.join(dest,name));
console.log('Local SQL engine assets prepared.');
