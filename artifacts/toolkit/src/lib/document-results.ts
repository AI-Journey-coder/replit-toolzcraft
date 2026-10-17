export type WorkflowResult={columns:string[];rows:string[][];summary:string;remaining:number|null;invoice?:Record<string,string>;taxes?:Record<string,string>[]};
export function csvCell(value:string){return '"'+(/^[\s]*[=+@-]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';}
export function csv(headers:string[],rows:string[][]){return '\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');}
// Only unambiguous dot-decimal numbers are checked. Never guess localized currency separators.
function amount(s:string|undefined){return s!==undefined&&/^-?\d+(?:\.\d{1,4})?$/.test(s.trim())?Number(s):null;}
export function invoiceChecks(invoice:Record<string,string>,rows:string[][]){
 const issues:string[]=[];const sub=amount(invoice.subtotal),total=amount(invoice.total);const tax=amount(invoice.tax),shipping=amount(invoice.shipping),discount=amount(invoice.discount);
 rows.forEach((r,i)=>{const q=amount(r[1]),p=amount(r[2]),a=amount(r[3]);if(q!==null&&p!==null&&a!==null&&Math.abs(q*p-a)>0.02)issues.push('Line '+(i+1)+': quantity × unit price differs from the printed amount (check discounts or rounding).');});
 const values=rows.map(r=>amount(r[3]));if(rows.length&&sub!==null&&values.every(v=>v!==null)&&Math.abs(values.reduce<number>((sum,v)=>sum+(v??0),0)-sub)>0.02)issues.push('Line amounts do not add up to the printed subtotal.');
 if([sub,total,tax,shipping,discount].every(v=>v!==null)&&Math.abs(sub!+tax!+shipping!-discount!-total!)>0.02)issues.push('Subtotal + tax + shipping − discount does not match the printed total.');
 return issues;
}
