import { Router, raw } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireAccount } from '../middlewares/account';
import { scanConfigured, scanDocument, SCAN_MAX_BYTES } from '../lib/document-scan';
import { extractBinary } from '../lib/document-binary';
import { pool } from '@workspace/db';
const router = Router();
let active = 0;
const hits = new Map<number, { at: number; count: number }>();
router.use(['/document-scan','/document-extract'], requireAuth, requireAccount);
router.get('/document-scan', (_req, res) => { res.json({ available: scanConfigured() }); });
router.post(['/document-scan','/document-extract'], (req, res, next) => {
  const extracting=req.path==='/document-extract';
  if(extracting && (process.env.ENABLE_DOCUMENT_EXTRACTION!=='true'||!['txt','docx','pdf','png','jpg','jpeg'].includes(String(req.query.format)))){res.status(400).json({message:'Binary extraction is disabled or the format is unsupported.'});return;}
  if (!scanConfigured()) { res.status(503).json({ message: 'Malware scanning is not configured. No scan was performed.' }); return; }
  if (req.query.consent !== (extracting?'upload-for-extraction':'upload-for-scan')) { res.status(400).json({ message: 'Explicit upload consent is required.' }); return; }
  if (!req.is('application/octet-stream') || req.headers['content-encoding']) { res.status(415).json({ message: 'Send an uncompressed binary file.' }); return; }
  const now = Date.now();
  for (const [id, h] of hits) if (now - h.at > 60000) hits.delete(id);
  const id = req.dbUser!.id, h = hits.get(id) || { at: now, count: 0 };
  if (active >= 2 || h.count >= 10 || hits.size >= 10000) { res.setHeader('Retry-After','60'); res.status(429).json({ message: 'Scanner busy. Try again in one minute.' }); return; }
  h.count++; hits.set(id,h); active++;
  let released = false;
  const deadline = setTimeout(() => { res.destroy(); req.destroy(); }, 90000);
  const release = () => { if (!released) { released=true; active--; clearTimeout(deadline); } };
  res.once('close', release); res.once('finish', release);
  next();
}, raw({ type: 'application/octet-stream', limit: SCAN_MAX_BYTES, inflate: false }), async (req, res) => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  res.once('close', abort);
  let outcome='failed';const started=Date.now();
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) { res.status(400).json({ message: 'Choose a nonempty file.' }); return; }
    const status = await scanDocument(req.body, controller.signal);
    outcome=status;
    if(status==='clean'&&req.path==='/document-extract'){
      outcome='failed';
      const result=await extractBinary(req.body,String(req.query.format),controller.signal);
      outcome='extracted';res.json({...result,scan:'No malware detected; not a safety guarantee.',retained:false});return;
    }
    res.status(status === 'clean' ? 200 : 422).json({ status, message: status === 'clean' ? 'No malware detected. This is not a guarantee that the file is safe.' : 'The scanner blocked this file. It has not been extracted.' });
  } catch { if (!res.destroyed) res.status(503).json({ message: 'Scanning did not complete. File extraction was stopped.' }); }
  finally {
    res.removeListener('close', abort);
    const bytes=Buffer.isBuffer(req.body)?req.body.length:0;
    if (Buffer.isBuffer(req.body)) req.body.fill(0);
    await pool.query("INSERT INTO document_transfer_daily(day,operation,outcome,requests,bytes,duration_ms) VALUES(current_date,$1,$2,1,$3,$4) ON CONFLICT(day,operation,outcome) DO UPDATE SET requests=document_transfer_daily.requests+1,bytes=document_transfer_daily.bytes+excluded.bytes,duration_ms=document_transfer_daily.duration_ms+excluded.duration_ms",[req.path==='/document-extract'?'extract':'scan',outcome,bytes,Date.now()-started]).catch(()=>{});
  }
});
export default router;
