import Papa from 'papaparse';
export type Contact={name:string;phones:string[];emails:string[];company:string};
export type DuplicateGroup={indices:number[];reasons:string[]};
export function contactDuplicateGroups(contacts:Contact[],mode:'email'|'phone'|'either'='either'):DuplicateGroup[]{
 const parent=contacts.map((_,i)=>i);const find=(i:number):number=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 const keys=new Map<string,number[]>();
 contacts.forEach((c,i)=>{const tokens=[...(mode!=='phone'?c.emails.map(e=>e.trim().toLowerCase()).filter(e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)).map(e=>'Email: '+e):[]),...(mode!=='email'?c.phones.filter(p=>/^[+\d\s().-]+$/.test(p)).map(p=>p.replace(/[^\d+]/g,'')).filter(p=>/^\+?\d{7,15}$/.test(p)).map(p=>'Phone: '+p):[])];for(const key of new Set(tokens)){const list=keys.get(key)||[];if(list.length)parent[find(i)]=find(list[0]);list.push(i);keys.set(key,list);}});
 const groups=new Map<number,DuplicateGroup>();contacts.forEach((_,i)=>{const root=find(i);const g=groups.get(root)||{indices:[],reasons:[]};g.indices.push(i);groups.set(root,g);});for(const [key,list] of keys)if(list.length>1)groups.get(find(list[0]))!.reasons.push(key);
 return [...groups.values()].filter(g=>g.indices.length>1);
}
export function mergeContactGroups(contacts:Contact[],groups:DuplicateGroup[],choices:Record<number,number>):Contact[]{
 const replacements=new Map<number,Contact>(),removed=new Set<number>();
 for(const [groupIndex,primary] of Object.entries(choices)){const group=groups[Number(groupIndex)];if(!group||!group.indices.includes(primary))throw Error('Choose a primary contact from each approved group.');const base=contacts[primary];replacements.set(Math.min(...group.indices),{...base,phones:[...new Set(group.indices.flatMap(i=>contacts[i].phones))],emails:[...new Set(group.indices.flatMap(i=>contacts[i].emails))]});group.indices.forEach(i=>removed.add(i));}
 return contacts.flatMap((c,i)=>replacements.has(i)?[replacements.get(i)!]:removed.has(i)?[]:[{...c,phones:[...c.phones],emails:[...c.emails]}]);
}
const unescape=(s:string)=>s.replace(/\\([nN,;\\])/g,(_,c)=>/[nN]/.test(c)?'\n':c);
const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function parseContacts(raw:string){
 if(raw.length>5_000_000)throw Error('Choose a contact file smaller than 5 MB.');
 const warnings=new Set<string>();const contacts:Contact[]=[];
 if(/BEGIN:VCARD/i.test(raw)){
  const unfolded=raw.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'');
  const cards=[...unfolded.matchAll(/BEGIN:VCARD\s*\n([\s\S]*?)\nEND:VCARD/gi)];
  if(!cards.length)throw Error('No complete vCard records found.');
  if((unfolded.match(/BEGIN:VCARD/gi)||[]).length!==cards.length)throw Error('An incomplete vCard was found. Repair the file before converting.');
  for(const card of cards){const c:Contact={name:'',phones:[],emails:[],company:''};for(const line of card[1].split('\n')){const colon=line.indexOf(':');if(colon<0)continue;const header=line.slice(0,colon);if(/ENCODING=|CHARSET=(?!UTF-8)/i.test(header))throw Error('Encoded/legacy vCards are not supported. Export UTF-8 vCard 3.0 or 4.0.');const key=header.split(';')[0].split('.').pop()!.toUpperCase(),value=unescape(line.slice(colon+1));if(key==='VERSION'&&!['3.0','4.0'].includes(value.trim()))throw Error('Use UTF-8 vCard 3.0 or 4.0.');if(key==='FN')c.name=value;else if(key==='TEL')c.phones.push(value.replace(/^tel:/i,''));else if(key==='EMAIL')c.emails.push(value);else if(key==='ORG')c.company=value;else if(!['VERSION','N'].includes(key))warnings.add(`${key} is not included in the converted output.`);}contacts.push(c);}
  warnings.add('Phone/email labels, structured names and organisation divisions are simplified. Keep your original file.');
 }else{
  const parsed=Papa.parse<string[]>(raw,{skipEmptyLines:'greedy'});if(parsed.errors.length)throw Error('Invalid CSV: '+parsed.errors[0].message);const [headers,...rows]=parsed.data;if(!headers?.length)throw Error('CSV needs a header row.');const keys=headers.map(x=>x.replace(/^\uFEFF/,'').trim().toLowerCase());const name=keys.findIndex(x=>['name','full name','display name'].includes(x)),company=keys.findIndex(x=>['company','organization','organization 1 - name'].includes(x));const phones=keys.map((x,i)=>/^(phone|telephone|mobile)( \d+( - value)?)?$/.test(x)?i:-1).filter(i=>i>=0),emails=keys.map((x,i)=>/^(email|e-mail)( \d+( - value)?)?$/.test(x)?i:-1).filter(i=>i>=0);if(name<0&&!phones.length&&!emails.length)throw Error('Use Name, Phone, Email and Company headers (numbered Phone/Email columns are supported).');const used=new Set([name,company,...phones,...emails]);headers.forEach((h,i)=>{if(!used.has(i))warnings.add(`Column ${h} is not included in the output.`);});for(const row of rows){if(row.length!==headers.length)throw Error('CSV row width differs from the header.');contacts.push({name:name<0?'':row[name],company:company<0?'':row[company],phones:phones.map(i=>row[i]).filter(Boolean),emails:emails.map(i=>row[i]).filter(Boolean)});}
 }
 if(!contacts.length)throw Error('No contacts found.');if(contacts.length>10000)throw Error('Limit: 10,000 contacts.');return {contacts,warnings:[...warnings]};
}
export function contactsCsv(contacts:Contact[],spreadsheetSafe=true){const p=Math.max(1,...contacts.map(c=>c.phones.length)),e=Math.max(1,...contacts.map(c=>c.emails.length));return Papa.unparse([['Name','Company',...Array.from({length:p},(_,i)=>`Phone ${i+1}`),...Array.from({length:e},(_,i)=>`Email ${i+1}`)],...contacts.map(c=>[c.name,c.company,...Array.from({length:p},(_,i)=>c.phones[i]||''),...Array.from({length:e},(_,i)=>c.emails[i]||'')])],{escapeFormulae:spreadsheetSafe});}
export function contactsVcf(contacts:Contact[]){return contacts.map(c=>['BEGIN:VCARD','VERSION:3.0','FN:'+escape(c.name||c.emails[0]||c.phones[0]||'Unnamed contact'),...c.phones.map(x=>'TEL:'+escape(x)),...c.emails.map(x=>'EMAIL:'+escape(x)),...(c.company?['ORG:'+escape(c.company)]:[]),'END:VCARD'].join('\r\n')).join('\r\n')+'\r\n';}
export function whatsappLink(phone:string,message:string){if(/[^+\d\s().-]/.test(phone))throw Error('Use digits and an international country code.');const digits=phone.replace(/\D/g,'');if(!/^[1-9]\d{6,14}$/.test(digits))throw Error('Enter 7–15 digits including the country code, without a leading zero.');if(message.length>2000)throw Error('Keep the message within 2,000 characters.');return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;}
