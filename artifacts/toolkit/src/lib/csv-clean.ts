import Papa from 'papaparse';
export type CleanOptions={trim:boolean;removeEmpty:boolean;deduplicate:boolean;dateColumns:string;missing:string;dateOrder:string};
export function cleanCsv(raw:string,options:CleanOptions){
  const parsed=Papa.parse<string[]>(raw,{skipEmptyLines:false});
  if(parsed.errors.length)throw new Error(parsed.errors.map(e=>`${e.message} (row ${(e.row??0)+1})`).join('; '));
  if(!parsed.data.length||!parsed.data[0].some(Boolean))throw new Error('A header row is required.');
  const headers=parsed.data[0].map(x=>options.trim?x.trim():x);if(new Set(headers).size!==headers.length)throw new Error('Column names must be unique.');
  const dates=new Set(options.dateColumns.split(',').map(x=>x.trim()).filter(Boolean));for(const h of dates)if(!headers.includes(h))throw new Error(`Unknown date column: ${h}`);
  let removed=0,duplicates=0;const warnings:string[]=[];const seen=new Set<string>();const rows:string[][]=[];
  for(let i=1;i<parsed.data.length;i++){let row=parsed.data[i];if(row.length===1&&row[0]===''&&i===parsed.data.length-1)continue;if(options.removeEmpty&&row.every(x=>!x.trim())){removed++;continue;}if(row.length!==headers.length)throw new Error(`Row ${i+1} has ${row.length} fields; expected ${headers.length}.`);
    row=row.map((value,j)=>{let x=options.trim?value.trim():value;if(dates.has(headers[j])&&x){const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(x);const local=/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(x);let y:number,m:number,d:number;if(iso){[,y,m,d]=iso.map(Number);}else if(local&&options.dateOrder!=='iso'){y=+local[3];m=+(options.dateOrder==='dmy'?local[2]:local[1]);d=+(options.dateOrder==='dmy'?local[1]:local[2]);}else{warnings.push(`Row ${i+1}, ${headers[j]}: date left unchanged.`);return x;}const dt=new Date(0);dt.setUTCFullYear(y,m-1,d);if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d){warnings.push(`Row ${i+1}, ${headers[j]}: invalid date left unchanged.`);return x;}x=`${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}return x===''?options.missing:x;});
    const key=JSON.stringify(row);if(options.deduplicate&&seen.has(key)){duplicates++;continue;}seen.add(key);rows.push(row);
  }
  return {headers,rows,removed,duplicates,warnings,csv:Papa.unparse([headers,...rows])};
}
