export type PayRow = {id:string;name:string;kind:'earning'|'employer'|'deduction';basis:'ctc'|'basic'|'gross'|'fixed';value:number;locked:boolean};
export const indiaRows:PayRow[]=[
 {id:'basic',name:'Basic + dearness allowance',kind:'earning',basis:'ctc',value:50,locked:true},
 {id:'hra',name:'House rent allowance',kind:'earning',basis:'basic',value:40,locked:false},
 {id:'bonus',name:'Annual bonus / variable pay',kind:'earning',basis:'fixed',value:0,locked:false},
 {id:'epf',name:'Employer PF / pension',kind:'employer',basis:'basic',value:12,locked:true},
 {id:'gratuity',name:'Gratuity provision (not cash salary)',kind:'employer',basis:'basic',value:100*15/26/12,locked:true},
 {id:'esiEmployer',name:'Employer ESI (if covered)',kind:'employer',basis:'gross',value:3.25,locked:true},
 {id:'insurance',name:'Employer insurance / other benefits',kind:'employer',basis:'fixed',value:0,locked:false},
 {id:'edli',name:'Employer EDLI / admin / LWF costs',kind:'employer',basis:'fixed',value:0,locked:false},
 {id:'pf',name:'Employee PF',kind:'deduction',basis:'basic',value:12,locked:true},
 {id:'esiEmployee',name:'Employee ESI (if covered)',kind:'deduction',basis:'gross',value:0.75,locked:true},
 {id:'tax',name:'Annual income tax / TDS',kind:'deduction',basis:'fixed',value:0,locked:false},
 {id:'pt',name:'Professional tax / employee LWF',kind:'deduction',basis:'fixed',value:0,locked:false},
 {id:'other',name:'Other employee deductions',kind:'deduction',basis:'fixed',value:0,locked:false},
];
export const globalRows:PayRow[]=[
 {id:'basic',name:'Base salary',kind:'earning',basis:'ctc',value:80,locked:false},
 {id:'bonus',name:'Annual bonus / variable pay',kind:'earning',basis:'fixed',value:0,locked:false},
 {id:'pensionEmployer',name:'Employer pension / social security',kind:'employer',basis:'fixed',value:0,locked:true},
 {id:'insurance',name:'Employer payroll taxes / insurance',kind:'employer',basis:'fixed',value:0,locked:true},
 {id:'severance',name:'Employer severance / gratuity provision',kind:'employer',basis:'fixed',value:0,locked:true},
 {id:'pensionEmployee',name:'Employee pension / social security',kind:'deduction',basis:'fixed',value:0,locked:true},
 {id:'tax',name:'Income tax withholding',kind:'deduction',basis:'fixed',value:0,locked:true},
 {id:'local',name:'State / local tax and statutory deductions',kind:'deduction',basis:'fixed',value:0,locked:true},
 {id:'other',name:'Other employee deductions',kind:'deduction',basis:'fixed',value:0,locked:false},
];
export type PayrollOptions={india:boolean;pfMode:'capped'|'full'|'off';esi:boolean;esiEmployeeExempt:boolean;wageFloor:boolean;statutoryBase:number};
export function payroll(ctc:number,rows:PayRow[],o:PayrollOptions){
 if(!Number.isFinite(ctc)||ctc<=0||ctc>1e10)throw new Error('Annual CTC must be above zero and at most 10 billion.');
 if(rows.some(r=>!Number.isFinite(r.value)||r.value<0||(r.basis!=='fixed'&&r.value>100)))throw new Error('Components must be non-negative; percentages cannot exceed 100.');
 if(!Number.isFinite(o.statutoryBase)||o.statutoryBase<0)throw new Error('Statutory wage override must be non-negative.');
 const basicRow=rows.find(r=>r.id==='basic');if(!basicRow||!['fixed','ctc'].includes(basicRow.basis))throw new Error('Basic salary must use annual fixed amount or percentage of CTC.');
 const basic=basicRow.basis==='fixed'?basicRow.value:ctc*basicRow.value/100;
 let gross=ctc,statutory=basic;let values:number[]=[];
 const amount=(r:PayRow,g:number,w:number)=>{
   let base=r.basis==='fixed'?1:r.basis==='ctc'?ctc:r.basis==='gross'?g:basic;
   if(o.india&&['epf','pf','gratuity'].includes(r.id)&&r.basis==='basic')base=w;
   if(o.india&&['epf','pf'].includes(r.id)){if(o.pfMode==='off')return 0;if(o.pfMode==='capped'&&r.basis==='basic')base=Math.min(base,180000);}
   if(o.india&&['esiEmployer','esiEmployee'].includes(r.id)&&(!o.esi||(r.id==='esiEmployee'&&o.esiEmployeeExempt)))return 0;
   return r.basis==='fixed'?r.value:base*r.value/100;
 };
 let converged=false;
 for(let i=0;i<300;i++){
   const epf=rows.find(r=>r.id==='epf');const employerPf=epf?amount(epf,gross,statutory):0;
   const newStatutory=o.statutoryBase||((o.india&&o.wageFloor)?Math.max(basic,(gross+employerPf)/2):basic);
   values=rows.map(r=>amount(r,gross,newStatutory));
   const targetGross=ctc-values.reduce((n,v,i)=>n+(rows[i].kind==='employer'?v:0),0);
   if(Math.abs(targetGross-gross)<1e-7&&Math.abs(newStatutory-statutory)<1e-7){gross=targetGross;statutory=newStatutory;converged=true;break;}
   gross=(gross+targetGross)/2;statutory=(statutory+newStatutory)/2;
 }
 if(!converged)throw new Error('These component rules do not converge. Reduce percentage costs or use fixed annual amounts.');
 values=rows.map(r=>amount(r,gross,statutory));
 const earningTotal=values.reduce((n,v,i)=>n+(rows[i].kind==='earning'?v:0),0);
 const balance=gross-earningTotal;const deductions=values.reduce((n,v,i)=>n+(rows[i].kind==='deduction'?v:0),0);
 if(balance<-.01)throw new Error('CTC is too small for the selected salary and employer components. Reduce them or increase CTC.');
 if(deductions>gross)throw new Error('Employee deductions exceed gross pay.');
 return {ctc,basic,statutory,gross,balance:Math.max(0,balance),deductions,net:gross-deductions,rows:rows.map((r,i)=>({...r,amount:values[i],percent:values[i]/ctc*100}))};
}
export function solveCtc(monthly:number,rows:PayRow[],o:PayrollOptions){
 if(!Number.isFinite(monthly)||monthly<=0)throw new Error('Monthly take-home target must be above zero.');
 let low=0,high=Math.max(monthly*24,1000);let result:ReturnType<typeof payroll>|undefined;
 for(let i=0;i<40;i++){try{result=payroll(high,rows,o);if(result.net/12>=monthly)break;}catch{}high*=2;if(high>1e10)throw new Error('No feasible CTC was found for these component settings.');}
 for(let i=0;i<100;i++){const mid=(low+high)/2;try{const r=payroll(mid,rows,o);if(r.net/12>=monthly){high=mid;result=r;}else low=mid;}catch{low=mid;}}
 result=payroll(high,rows,o);if(Math.abs(result.net/12-monthly)>.01)throw new Error('The target conflicts with minimum fixed components. Change the target or component rules.');return result;
}
