import engine from './sql-engine.py?raw';
let ready: Promise<any> | null = null;
self.onmessage = async ({data}) => {
  try {
    if(!ready)ready=(async()=>{const base=new URL('../vendor/pyodide/',data.base).href;const {loadPyodide}=await import(/* @vite-ignore */`${base}pyodide.mjs`);const py=await loadPyodide({indexURL:base});const response=await fetch(new URL('../vendor/sqlglot-30.18.0-py3-none-any.whl',data.base));if(!response.ok)throw new Error('SQL engine package could not be loaded.');py.unpackArchive(await response.arrayBuffer(),'zip',{extractDir:'/sqlglot'});py.runPython('import sys\nsys.path.insert(0, "/sqlglot")');py.runPython(engine);return py;})();
    const py=await ready;py.globals.set('payload_json',JSON.stringify(data.payload));const result=py.runPython('convert_sql(json.loads(payload_json))');self.postMessage({result:JSON.parse(result)});
  }catch(e){ready=null;self.postMessage({error:e instanceof Error?e.message:String(e)});}
};
