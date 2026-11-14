export type Dialect='postgres'|'mysql'|'sqlserver'|'sqlite';
export function rowCount(n:number){if(!Number.isInteger(n)||n<1||n>1000)throw Error('Choose a whole number of rows between 1 and 1,000.');}
function splitColumns(body:string){const out:string[]=[];let depth=0,quote='',start=0;for(let i=0;i<body.length;i++){const c=body[i];if(quote){if(c===quote){if(body[i+1]===quote)i++;else quote='';}}else if(c==='"'||c==="'"||c==='`')quote=c;else if(c==='(')depth++;else if(c===')'){if(--depth<0)throw Error('Unbalanced parentheses.');}else if(c===','&&depth===0){out.push(body.slice(start,i).trim());start=i+1;}}if(depth||quote)throw Error('Unclosed quote or parentheses.');out.push(body.slice(start).trim());return out;}
const identifier='(?:[A-Za-z_][A-Za-z0-9_]*|"[A-Za-z_][A-Za-z0-9_ ]*"|`[A-Za-z_][A-Za-z0-9_ ]*`|\\[[A-Za-z_][A-Za-z0-9_ ]*\\])';
const clean=(s:string)=>s.replace(/^["`\[]|["`\]]$/g,'');
export function sqlData(schema:string,count:number,dialect:Dialect){
 rowCount(count);if(schema.length>20000)throw Error('Schema must be under 20,000 characters.');
 const match=schema.trim().match(new RegExp('^CREATE\\s+TABLE\\s+('+identifier+')\\s*\\(([\\s\\S]*)\\)\\s*;?$','i'));
 if(!match)throw Error('Paste one CREATE TABLE statement with a simple table name.');
 const columns=splitColumns(match[2]).map(def=>{
  const m=def.match(new RegExp('^('+identifier+')\\s+(SMALLINT|BIGINT|INTEGER|INT|SERIAL|BIGSERIAL|VARCHAR|NVARCHAR|CHAR|TEXT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|BOOLEAN|BOOL|BIT|DATE|DATETIME|TIMESTAMP)(?:\\s*\\(\\s*(\\d+)\\s*(?:,\\s*(\\d+)\\s*)?\\))?([\\s\\S]*)$','i'));
  if(!m)throw Error('Unsupported column or table constraint: '+def.slice(0,80));
  const tail=m[5].replace(/PRIMARY\s+KEY|NOT\s+NULL|\bNULL\b|\bUNIQUE\b/gi,'').trim();if(tail)throw Error('This version supports types, PRIMARY KEY, UNIQUE and NOT NULL only. Remove defaults, identity, foreign keys and checks for a standalone test schema.');
  const type=m[2].toUpperCase(),length=m[3]?Number(m[3]):undefined,scale=m[4]?Number(m[4]):undefined;
  if(length!==undefined&&(!Number.isInteger(length)||length<1||length>10000))throw Error('Invalid length or precision.');
  if(scale!==undefined&&(scale<0||scale>(length??0)))throw Error('Invalid decimal scale.');
  if(/DECIMAL|NUMERIC/.test(type)&&length!==undefined&&length-(scale??0)<String(count).length)throw Error('Decimal precision is too small for unique sample values.');
  if(/CHAR/.test(type)&&length!==undefined&&length<String(count).length)throw Error('Text column is too short for this many distinct sample values.');
  if(/BOOL|BIT/.test(type)&&/UNIQUE|PRIMARY/i.test(m[5])&&count>2)throw Error('A unique Boolean column allows at most two rows.');
  return {name:clean(m[1]),type,length,scale};
 });
 if(!columns.length||columns.length>100)throw Error('Use between 1 and 100 columns.');
 if(new Set(columns.map(c=>c.name.toLowerCase())).size!==columns.length)throw Error('Column names must be unique.');
 const q=(s:string)=>dialect==='mysql'?'`'+s+'`':dialect==='sqlserver'?'['+s+']':'"'+s+'"';
 const literal=(s:string)=>"'"+s.replaceAll("'","''")+"'";
 const rows=Array.from({length:count},(_,i)=>'('+columns.map(c=>{
  const n=i+1;if(/INT|SERIAL|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL/.test(c.type))return String(n);
  if(/BOOL|BIT/.test(c.type))return dialect==='postgres'?(i%2?'TRUE':'FALSE'):String(i%2);
  if(/DATE|TIME/.test(c.type))return literal(new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,c.type==='DATE'?10:19).replace('T',' '));
  let value=/email/i.test(c.name)?`person${n}@example.test`:/name/i.test(c.name)?`Sample ${n}`:`value_${n}`;
  if(c.length&&value.length>c.length)value=String(n).padStart(c.length,'x');return literal(value);
 }).join(', ')+')');
 return '-- Synthetic test data only. Review before running in a disposable database.\nINSERT INTO '+q(clean(match[1]))+' ('+columns.map(c=>q(c.name)).join(', ')+') VALUES\n'+rows.join(',\n')+';';
}
export function sampleRecords(count:number,seed:number){rowCount(count);if(!Number.isSafeInteger(seed))throw Error('Use a whole-number seed.');let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};return Array.from({length:count},(_,i)=>({id:i+1,name:['Alex','Sam','Taylor','Jordan'][Math.floor(random()*4)]+' Sample '+(i+1),email:`person${i+1}@example.test`,active:random()>.3,amount:Math.round(random()*100000)/100,created_at:new Date(Date.UTC(2026,0,1+Math.floor(random()*365))).toISOString().slice(0,10)}));}
export function recordsCsv(rows:ReturnType<typeof sampleRecords>){return ['id,name,email,active,amount,created_at',...rows.map(r=>Object.values(r).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\r\n');}
export function boundaryCases(max:number){if(!Number.isInteger(max)||max<1||max>10000)throw Error('Choose a maximum length from 1 to 10,000.');return [{case:'empty',value:''},{case:'missing',value:null},{case:'spaces',value:'   '},{case:'Unicode',value:'Zoë नमस्ते 日本語'},{case:'quotes and comma',value:'He said "Hello", then left'},{case:'line breaks',value:'first\nsecond'},{case:'at maximum',value:'x'.repeat(max)},{case:'over maximum',value:'x'.repeat(max+1)}];}
