import type { Tool } from './tools-registry';
// Shared intent vocabulary: literal matches rank above related operations.
const concepts = [
 ['shrink','smaller','reduce','compress','compression','compressor','resize','resizer','compact','minify','minifier','optimize','optimise'],
 ['image','images','photo','photos','picture','pictures','jpg','jpeg','png','webp'],
 ['video','videos','movie','movies','mp4','media'],
 ['merge','combine','join','concatenate'], ['split','separate','extract'],
 ['convert','converter','conversion','transform','change'],
 ['format','formatter','beautify','pretty','prettify','indent'],
 ['validate','validator','check','verify','lint','diagnose'],
 ['generate','generator','create','maker','build','builder'],
 ['duplicate','duplicates','deduplicate','dedup','repeated'],
 ['remove','delete','erase','strip','clean','cleaner'],
 ['compare','difference','diff'], ['encode','encoding','encoder'], ['decode','decoding','decoder'],
 ['encrypt','encryption','cipher'], ['decrypt','decryption','decipher'],
 ['hash','checksum','digest'], ['password','passphrase','secret'],
 ['salary','ctc','payroll','wage','takehome'], ['money','currency','cash','finance'],
 ['inflation','purchasing','purchasingpower','past','future'],
 ['interest','loan','mortgage','emi'], ['invest','investment','savings','saving'],
 ['calculate','calculator','calculation','compute'], ['percent','percentage'],
 ['date','calendar','day'], ['time','clock','timezone'],
 ['contact','contacts','addressbook','vcard','vcf'],
 ['spreadsheet','csv','excel','tabular'], ['database','db','sql'],
 ['text','string','words'], ['count','counter','length'],
 ['ocr','scan','scanned','recognition'], ['pdf','document'],
 ['colour','color','palette'], ['background','backdrop'],
 ['archive','zip','pack','package'], ['url','link','hyperlink'],
 ['qr','qrcode'], ['unit','measurement','measure'],
];
const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const stop = new Set(['a','an','the','my','me','to','of','for','and','please','tool','tools','how','can','i','with']);
export function searchTools(tools: readonly Tool[], query: string): Tool[] {
 const phrase = normalize(query);
 const terms = phrase.split(' ').filter(term => term && !stop.has(term));
 if (!terms.length) return [...tools];
 return tools.map((tool,index) => {
  const title = normalize(tool.name), body = normalize(`${tool.name} ${tool.slug} ${tool.description}`), words = body.split(' ');
  let score = title === phrase ? 1000 : title.includes(phrase) ? 100 : 0;
  for (const term of terms) {
   if (title.split(' ').includes(term)) { score += 20; continue; }
   if (words.some(word => word.startsWith(term))) { score += 10; continue; }
   const related = concepts.filter(group => group.includes(term) || (term.length >= 3 && group.some(word => word.startsWith(term)))).flat();
   if (!related.some(word => words.includes(word))) return {tool,index,score:-1};
   score += related.some(word => title.split(' ').includes(word)) ? 5 : 1;
  }
  return {tool,index,score};
 }).filter(item => item.score >= 0).sort((a,b) => b.score-a.score || a.index-b.index).map(item => item.tool);
}
