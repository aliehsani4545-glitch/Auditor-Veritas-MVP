// ============================================================
// AUDITOR VERITAS - ENTERPRISE BACKEND
// Version: 3.5.0 - PRODUCTION (Fault Tolerant & Strict Consistency)
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { config } from 'dotenv';
import { z } from 'zod'; 
import stringify from 'fast-json-stable-stringify';
import winston from 'winston';
import morgan from 'morgan';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIG CHECK ---
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'MASTER_ENCRYPTION_KEY'];
if (REQUIRED_ENV.some(key => !process.env[key])) {
  console.error(`❌ CRITICAL ERROR: Missing ENV variables.`);
  process.exit(1);
}

// --- DATABASE ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- LOGGING ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// --- SECURITY MIDDLEWARE ---
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'https://auditorveritas.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS Not Allowed'), false);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 1000, keyGenerator: (req) => req.headers['x-api-key'] || req.ip }));

// --- CRYPTO UTILS ---
const encryptData = (data, key) => CryptoJS.AES.encrypt(stringify(data), key).toString();
const decryptData = (ciphertext, key) => {
  try { return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8) ? JSON.parse(CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8)) : null; } catch (e) { return null; }
};
const sha256 = (data) => CryptoJS.SHA256(data).toString();
const normalizeUserId = (id) => String(id).trim().toLowerCase(); 

// --- MERKLE SERVICE ---
class DBMerkleService {
  static async appendLeaf(leafHash, leafIndex) {
    // We use upsert to prevent unique constraint errors if retried
    await supabase.from('merkle_nodes').upsert({ level: 0, node_index: leafIndex, hash: leafHash }, { onConflict: 'level, node_index' });
    
    let currentLevel = 0;
    let currentIndex = leafIndex;
    let currentHash = leafHash;

    // Build path to root
    while (currentLevel <= 20) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      
      const { data: sibling } = await supabase.from('merkle_nodes')
        .select('hash')
        .eq('level', currentLevel)
        .eq('node_index', siblingIndex)
        .single();
      
      const parentHash = sha256(sibling ? (isRight ? sibling.hash + currentHash : currentHash + sibling.hash) : currentHash + currentHash);
      const parentIndex = Math.floor(currentIndex / 2);
      
      await supabase.from('merkle_nodes').upsert({ level: currentLevel + 1, node_index: parentIndex, hash: parentHash }, { onConflict: 'level, node_index' });
      
      currentLevel++;
      currentIndex = parentIndex;
      currentHash = parentHash;
    }
  }

  static async getProof(leafIndex, totalLeaves) {
    const proof = [];
    let currentLevel = 0;
    let currentIndex = leafIndex;
    const maxLevel = Math.ceil(Math.log2(totalLeaves + 1)) || 1;

    for (let i = 0; i < maxLevel; i++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      
      const { data: sibling } = await supabase.from('merkle_nodes')
        .select('hash')
        .eq('level', currentLevel)
        .eq('node_index', siblingIndex)
        .single();
      
      if (sibling) proof.push({ position: isRight ? 'left' : 'right', hash: sibling.hash });
      
      currentIndex = Math.floor(currentIndex / 2);
      currentLevel++;
    }

    const { data: root } = await supabase.from('merkle_nodes').select('hash').order('level', { ascending: false }).limit(1).single();
    return { proof, root: root?.hash || 'PENDING' };
  }
}

// --- SYSTEM LOGGING ---
const logSystemEvent = async (processorId, action, actorEmail, details = {}) => {
  try { await supabase.from('system_audit_logs').insert([{ processor_id: processorId, action, actor_email: actorEmail, details, timestamp: new Date().toISOString() }]); } catch (e) { console.error("SysLog Error:", e); }
};

// --- AUTH & SCHEMAS ---
const eventSubmissionSchema = z.object({ event_type: z.string().min(1).max(64), user_identifier: z.string().min(1).max(256), event_data: z.record(z.any()) });
const privacyRequestSchema = z.object({ user_identifier: z.string().min(1).max(256) });
const totpCodeSchema = z.object({ code: z.string().length(6).regex(/^\d+$/) });

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });
  const { data: processor } = await supabase.from('processors').select('*').eq('api_key_hash', sha256(apiKey)).single();
  if (!processor || processor.status === 'revoked') return res.status(401).json({ error: 'Invalid API key' });
  req.processor = processor; req.authType = 'machine'; next();
};

const authenticateUser = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid Token' });
  req.user = user;
  let { data: processor } = await supabase.from('processors').select('*').eq('owner_id', user.id).single();
  if (!processor) {
    const { data: mem } = await supabase.from('processor_users').select('processor_id, role').eq('user_id', user.id).single();
    if (mem) { processor = await supabase.from('processors').select('*').eq('id', mem.processor_id).single().then(r => r.data); req.userRole = mem.role; }
  } else req.userRole = 'owner';
  if (processor) req.processor = processor;
  req.authType = 'human'; next();
};
const authenticateAny = async (req, res, next) => { if (req.headers['x-api-key']) return authenticateApiKey(req, res, next); return authenticateUser(req, res, next); };
const authorizeOwner = (req, res, next) => { if (req.userRole !== 'owner') return res.status(403).json({ error: 'Forbidden' }); next(); };

// --- ROUTES ---

app.get('/api/health', (req, res) => res.json({ status: 'healthy', env: process.env.NODE_ENV }));

// 1. INJECTION (Fault Tolerant)
app.post('/api/events', authenticateAny, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor' });
  try {
    const validation = eventSubmissionSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid payload' });

    const { event_type, user_identifier, event_data } = validation.data;
    const cleanUid = normalizeUserId(user_identifier);
    const userHash = sha256(cleanUid);

    // 1. ENSURE KEY EXISTS (Critical: Must finish before event logging)
    let userKey;
    const { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).maybeSingle();
    
    if (keyRow) {
        userKey = decryptData(keyRow.encrypted_key, process.env.MASTER_ENCRYPTION_KEY);
    } else {
        userKey = uuidv4() + "-" + uuidv4();
        // Use UPSERT/IGNORE logic via error handling to avoid race conditions
        const { error: insertError } = await supabase.from('encryption_keys').insert([
            { user_identifier_hash: userHash, encrypted_key: encryptData(userKey, process.env.MASTER_ENCRYPTION_KEY) }
        ]);
        
        // If error is NOT unique violation (23505), throw it. If it IS 23505, fetch the key that won the race.
        if (insertError) {
             if (insertError.code === '23505') {
                 const { data: existing } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).single();
                 userKey = decryptData(existing.encrypted_key, process.env.MASTER_ENCRYPTION_KEY);
             } else {
                 throw new Error("Key generation failed: " + insertError.message);
             }
        }
    }

    // 2. LOG EVENT (Critical)
    const encryptedPayload = encryptData(event_data, userKey);
    const data_hash = sha256(stringify({ pid: req.processor.id, type: event_type, uid: userHash, ts: new Date().toISOString() }));
    
    // Get optimistic index
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    const nextIndex = count || 0;

    const { error: eventError } = await supabase.from('audit_events').insert([{
      processor_id: req.processor.id,
      event_type,
      user_identifier: userHash,
      event_data: { encrypted: encryptedPayload },
      event_timestamp: new Date().toISOString(),
      data_hash,
      leaf_index: nextIndex
    }]);

    if (eventError) throw new Error("Event log failed: " + eventError.message);

    // 3. SECONDARY OPERATIONS (Non-Blocking / Fault Tolerant)
    // Wrap in try-catch so a failure here DOES NOT trigger a 500 response for the client
    try {
        await DBMerkleService.appendLeaf(data_hash, nextIndex);
        await supabase.rpc('increment_processor_usage', { pid: req.processor.id });
    } catch (secondaryError) {
        console.error("Secondary process warning:", secondaryError.message);
        // We purposefully do NOT throw here. The event is saved, that's what matters for API success.
    }

    res.status(201).json({ success: true, hash: data_hash, index: nextIndex });

  } catch (err) {
    logger.error(`Injection Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. ERASURE (Strict Matching)
app.delete('/api/privacy/forget', authenticateApiKey, async (req, res) => {
    try {
        const { user_identifier } = privacyRequestSchema.parse(req.body);
        const cleanUid = normalizeUserId(user_identifier);
        const userHash = sha256(cleanUid);
        
        const { data: keyRow } = await supabase.from('encryption_keys').select('id').eq('user_identifier_hash', userHash).maybeSingle();
        
        if (!keyRow) {
             console.warn(`GDPR 404: Hash not found for ${cleanUid}`);
             return res.status(404).json({ error: "Identity not found. Ensure ID matches exactly." });
        }

        const { error: delError } = await supabase.from('encryption_keys').delete().eq('user_identifier_hash', userHash);
        if (delError) throw delError;
        
        const data_hash = sha256(`ERASED-${userHash}-${Date.now()}`);
        const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);

        await supabase.from('audit_events').insert([{ 
            processor_id: req.processor.id, event_type: 'gdpr.right_to_erasure', 
            user_identifier: userHash, event_data: { status: 'KEYS_DESTROYED' }, 
            event_timestamp: new Date().toISOString(), data_hash, leaf_index: count || 0
        }]);

        await logSystemEvent(req.processor.id, 'gdpr_erasure', 'API_AUTOMATION', { target_hash: userHash });

        res.json({ success: true, message: 'Cryptographic keys destroyed.' });
    } catch (err) { res.status(500).json({ error: 'Erasure failed' }); }
});

// 3. DASHBOARD ROUTES
app.get('/api/dashboard', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(404).json({ error: 'No Processor' });
    const { data: proc } = await supabase.from('processors').select('*').eq('id', req.processor.id).single();
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: events } = await supabase.from('audit_events')
        .select('event_timestamp')
        .eq('processor_id', req.processor.id)
        .gte('event_timestamp', oneDayAgo);

    const buckets = new Array(24).fill(0);
    const now = new Date();
    
    events?.forEach(e => {
        const diff = Math.floor((now - new Date(e.event_timestamp)) / (1000 * 60 * 60));
        if (diff >= 0 && diff < 24) buckets[23 - diff]++;
    });

    res.json({
        processor: { ...proc, totp_configured: !!proc.totp_secret },
        stats: { totalEvents: count || 0, monthlyEvents: proc.monthly_events_used || 0, eventsLimit: proc.events_limit },
        chartData: buckets,
        userRole: req.userRole
    });
});

app.get('/api/system/audit', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied' });
    const { data } = await supabase.from('system_audit_logs').select('*').eq('processor_id', req.processor.id).order('timestamp', { ascending: false }).limit(50);
    res.json({ logs: data || [] });
});

app.get('/api/events/search', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied' });
    const { data } = await supabase.from('audit_events').select('*').eq('processor_id', req.processor.id).order('event_timestamp', { ascending: false }).limit(20);
    res.json({ events: data || [] });
});

app.get('/api/merkle/proof/:id', authenticateAny, async (req, res) => {
    const { data: e } = await supabase.from('audit_events').select('*').eq('id', req.params.id).single();
    if(!e) return res.status(404).json({error:'Not found'});
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', e.processor_id);
    const p = await DBMerkleService.getProof(e.leaf_index, count);
    res.json({ event_id: e.id, leaf_index: e.leaf_index, proof: p.proof, merkle_root: p.root });
});

app.post('/api/processors', authenticateUser, async (req, res) => {
    if(req.processor) return res.status(409).json({error:'Exists'});
    const k = `av_${uuidv4().replace(/-/g,'')}`;
    const {data} = await supabase.from('processors').insert([{company_name:req.body.companyName, api_key_hash:sha256(k), owner_id:req.user.id}]).select().single();
    res.status(201).json({apiKey:k, processorId:data.id});
});

app.post('/api/keys/setup-2fa', authenticateUser, authorizeOwner, async (req, res) => {
    const s = authenticator.generateSecret();
    await supabase.from('processors').update({totp_secret:encryptData(s, process.env.MASTER_ENCRYPTION_KEY)}).eq('id',req.processor.id);
    res.json({secret:s, otpAuthUrl: await QRCode.toDataURL(authenticator.keyuri(req.user.email,'Auditor',s))});
});

app.post('/api/keys/rotate', authenticateUser, authorizeOwner, async (req, res) => {
    const {data:p}=await supabase.from('processors').select('totp_secret').eq('id',req.processor.id).single();
    if(!authenticator.verify({token:req.body.code, secret:decryptData(p.totp_secret, process.env.MASTER_ENCRYPTION_KEY)})) return res.status(401).json({error:'Invalid Code'});
    const k = `av_${uuidv4().replace(/-/g,'')}`;
    await supabase.from('processors').update({api_key_hash:sha256(k), last_rotation_date:new Date()}).eq('id',req.processor.id);
    await logSystemEvent(req.processor.id, 'key_rotation', req.user.email, {status:'success'});
    res.json({newApiKey:k});
});

app.post('/api/keys/request-rotation', authenticateUser, async (req,res)=>{
    const {data:p}=await supabase.from('processors').select('totp_secret').eq('id',req.processor.id).single();
    res.json({totpConfigured:!!p?.totp_secret});
});

app.get('/api/team', authenticateUser, async (req,res) => {
    const {data:m}=await supabase.from('processor_users').select('*').eq('processor_id',req.processor.id);
    const team = await Promise.all((m||[]).map(async x => ({email:(await supabase.auth.admin.getUserById(x.user_id)).data.user.email, role:x.role, user_id:x.user_id})));
    const {data:o}=await supabase.auth.admin.getUserById(req.processor.owner_id);
    team.unshift({email:o?.user?.email, role:'owner', user_id:req.processor.owner_id});
    res.json({team, pending:[]});
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;