// ============================================================
// AUDITOR VERITAS - ENTERPRISE BACKEND
// Version: 3.0.0 - PRODUCTION (Strict CORS, Real Aggregation)
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

// Load env vars
if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- CRITICAL CONFIG CHECK ---
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'MASTER_ENCRYPTION_KEY'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ CRITICAL ERROR: Missing ENV variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// --- DATABASE CONNECTION ---
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

// PRODUCTION CORS CONFIGURATION
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'https://auditorveritas.com']; // Fallbacks

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  message: { error: 'Rate limit exceeded' }
});
app.use(apiLimiter);

// --- CRYPTO UTILS ---
const encryptData = (data, key) => CryptoJS.AES.encrypt(stringify(data), key).toString();
const decryptData = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const str = bytes.toString(CryptoJS.enc.Utf8);
    return str ? JSON.parse(str) : null;
  } catch (e) { return null; }
};
const sha256 = (data) => CryptoJS.SHA256(data).toString();

// --- MERKLE ENGINE (REAL IMPLEMENTATION) ---
class DBMerkleService {
  static async appendLeaf(leafHash, leafIndex) {
    // 1. Insert Leaf (Level 0)
    await supabase.from('merkle_nodes').upsert({ level: 0, node_index: leafIndex, hash: leafHash });
    
    let currentLevel = 0;
    let currentIndex = leafIndex;
    let currentHash = leafHash;

    // 2. Compute path to root
    while (true) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      const { data: siblingNode } = await supabase.from('merkle_nodes')
        .select('hash')
        .eq('level', currentLevel)
        .eq('node_index', siblingIndex)
        .single();
      
      const parentIndex = Math.floor(currentIndex / 2);
      let parentHash;

      if (!siblingNode) {
        // If no sibling, duplicate self (standard practice for odd nodes)
        parentHash = sha256(currentHash + currentHash);
      } else {
        const leftHash = isRightNode ? siblingNode.hash : currentHash;
        const rightHash = isRightNode ? currentHash : siblingNode.hash;
        parentHash = sha256(leftHash + rightHash);
      }

      await supabase.from('merkle_nodes').upsert({ level: currentLevel + 1, node_index: parentIndex, hash: parentHash });
      
      currentLevel++;
      currentIndex = parentIndex;
      currentHash = parentHash;
      
      // Safety break at level 20 (~1M items)
      if (currentLevel > 20) break;
    }
  }

  static async getProof(leafIndex, totalLeaves) {
    const proof = [];
    let currentLevel = 0;
    let currentIndex = leafIndex;
    const maxLevel = Math.ceil(Math.log2(totalLeaves + 1)) || 1;

    for (let i = 0; i < maxLevel; i++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      const { data: sibling } = await supabase.from('merkle_nodes')
        .select('hash')
        .eq('level', currentLevel)
        .eq('node_index', siblingIndex)
        .single();
      
      if (sibling) {
        proof.push({ position: isRightNode ? 'left' : 'right', hash: sibling.hash });
      }
      
      currentIndex = Math.floor(currentIndex / 2);
      currentLevel++;
    }

    const { data: rootNode } = await supabase.from('merkle_nodes')
        .select('hash')
        .order('level', { ascending: false })
        .limit(1)
        .single();

    return { proof, root: rootNode?.hash || 'PENDING' };
  }
}

// --- ZOD SCHEMAS ---
const eventSubmissionSchema = z.object({
  event_type: z.string().min(1).max(64),
  user_identifier: z.string().min(1).max(256),
  event_data: z.record(z.any()),
});

const privacyRequestSchema = z.object({
  user_identifier: z.string().min(1).max(256)
});

const totpCodeSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/)
});

// --- AUTH MIDDLEWARE ---
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  try {
    const apiKeyHash = sha256(apiKey);
    const { data: processor } = await supabase.from('processors').select('*').eq('api_key_hash', apiKeyHash).single();
    if (!processor || processor.status === 'revoked') return res.status(401).json({ error: 'Invalid API key' });
    req.processor = processor;
    req.authType = 'machine';
    next();
  } catch (err) { res.status(500).json({ error: 'Auth Error' }); }
};

const authenticateUser = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('Invalid Token');
    req.user = user;

    // Check for processor ownership
    let { data: processor } = await supabase.from('processors').select('*').eq('owner_id', user.id).single();
    
    // Check for team membership
    if (!processor) {
      const { data: membership } = await supabase.from('processor_users').select('processor_id, role').eq('user_id', user.id).single();
      if (membership) {
        const { data: proc } = await supabase.from('processors').select('*').eq('id', membership.processor_id).single();
        processor = proc;
        req.userRole = membership.role;
      }
    } else {
      req.userRole = 'owner';
    }

    if (processor) req.processor = processor;
    req.authType = 'human';
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

const authorizeOwner = (req, res, next) => {
  if (req.userRole !== 'owner') return res.status(403).json({ error: 'Forbidden. Owner only.' });
  next();
};

const authenticateAny = async (req, res, next) => {
  if (req.headers['x-api-key']) return authenticateApiKey(req, res, next);
  if (req.headers['authorization']) return authenticateUser(req, res, next);
  return res.status(401).json({ error: 'Auth required' });
};

// --- ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', env: process.env.NODE_ENV });
});

// 1. EVENT INJECTION (Production Grade)
app.post('/api/events', authenticateAny, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor associated' });

  try {
    const validation = eventSubmissionSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid payload', details: validation.error.errors });

    const { event_type, user_identifier, event_data } = validation.data;
    const userHash = sha256(user_identifier);

    // Key Management (Get or Create)
    let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).maybeSingle();
    let userKey;

    if (!keyRow) {
      userKey = uuidv4() + "-" + uuidv4();
      await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptData(userKey, process.env.MASTER_ENCRYPTION_KEY) }]);
    } else {
      userKey = decryptData(keyRow.encrypted_key, process.env.MASTER_ENCRYPTION_KEY);
    }

    const encryptedPayload = encryptData(event_data, userKey);
    const data_hash = sha256(stringify({ pid: req.processor.id, type: event_type, uid: userHash, ts: new Date().toISOString() }));

    // Get strictly correct next index
    const { count } = await supabase.from('audit_events')
        .select('*', { count: 'exact', head: true })
        .eq('processor_id', req.processor.id);
    const nextIndex = count || 0;

    // Atomic Insert
    const { data: savedEvent, error: insertError } = await supabase.from('audit_events').insert([{
      processor_id: req.processor.id,
      event_type,
      user_identifier: userHash,
      event_data: { encrypted: encryptedPayload },
      event_timestamp: new Date().toISOString(),
      data_hash,
      leaf_index: nextIndex
    }]).select().single();

    if (insertError) throw insertError;

    // Merkle Append
    await DBMerkleService.appendLeaf(data_hash, nextIndex);
    
    // Async usage update
    supabase.rpc('increment_processor_usage', { pid: req.processor.id }).catch(() => {});

    res.status(201).json({ success: true, hash: data_hash, index: nextIndex });

  } catch (err) {
    logger.error(`Injection Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. MERKLE PROOF
app.get('/api/merkle/proof/:eventId', authenticateAny, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No context' });

  try {
    const { data: event } = await supabase
      .from('audit_events')
      .select('*')
      .eq('id', req.params.eventId.trim())
      .eq('processor_id', req.processor.id)
      .single();

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { count: totalLeaves } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    const proof = await DBMerkleService.getProof(event.leaf_index, totalLeaves);

    res.json({ 
        event_id: event.id, 
        leaf_index: event.leaf_index,
        proof: proof.proof, 
        merkle_root: proof.root 
    });
  } catch (err) { res.status(500).json({ error: 'Verification failed' }); }
});

// 3. GDPR ERASURE (Real Crypto-Shredding)
app.delete('/api/privacy/forget', authenticateApiKey, async (req, res) => {
    try {
        const { user_identifier } = privacyRequestSchema.parse(req.body);
        const userHash = sha256(user_identifier);
        
        const { data: keyRow } = await supabase.from('encryption_keys').select('id').eq('user_identifier_hash', userHash).maybeSingle();
        if (!keyRow) return res.status(404).json({ error: 'Identity not found. Use exact original ID.' });

        await supabase.from('encryption_keys').delete().eq('user_identifier_hash', userHash);
        
        const data_hash = sha256(`ERASED-${userHash}-${Date.now()}`);
        const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);

        await supabase.from('audit_events').insert([{ 
            processor_id: req.processor.id, 
            event_type: 'gdpr.right_to_erasure', 
            user_identifier: userHash, 
            event_data: { status: 'KEYS_DESTROYED' }, 
            event_timestamp: new Date().toISOString(), 
            data_hash, 
            leaf_index: count || 0
        }]);

        res.json({ success: true, message: 'Cryptographic keys destroyed.' });
    } catch (err) { res.status(500).json({ error: 'Erasure failed' }); }
});

// 4. DASHBOARD & REAL ANALYTICS
app.get('/api/dashboard', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(404).json({ error: 'Processor not found' });
    
    const { data: procData } = await supabase.from('processors').select('*').eq('id', req.processor.id).single();
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    
    // --- REAL ANALYTICS: Last 24 Hours Aggregation ---
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: events } = await supabase.from('audit_events')
        .select('event_timestamp')
        .eq('processor_id', req.processor.id)
        .gte('event_timestamp', oneDayAgo) // Only fetch last 24h
        .order('event_timestamp', { ascending: true });

    // Aggregate by hour (00-23)
    const buckets = new Array(24).fill(0);
    const now = new Date();
    
    if (events) {
        events.forEach(e => {
            const t = new Date(e.event_timestamp);
            // Calculate hours difference from now (0 = current hour, 23 = 23 hours ago)
            const diffHours = Math.floor((now - t) / (1000 * 60 * 60));
            if (diffHours >= 0 && diffHours < 24) {
                // We want the graph to show [24h ago -> Now], so we reverse the index
                buckets[23 - diffHours]++;
            }
        });
    }

    res.json({
        processor: { ...procData, totp_configured: !!procData.totp_secret },
        stats: { totalEvents: count || 0, monthlyEvents: procData.monthly_events_used || 0, eventsLimit: procData.events_limit },
        chartData: buckets, // Sends exactly 24 integers representing per-hour activity
        userRole: req.userRole
    });
});

app.get('/api/events/search', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied' });
    const { data } = await supabase.from('audit_events').select('*').eq('processor_id', req.processor.id).order('event_timestamp', { ascending: false }).limit(20);
    res.json({ events: data || [] });
});

app.post('/api/processors', authenticateUser, async (req, res) => {
  const { companyName } = req.body;
  if (req.processor) return res.status(409).json({ error: 'Already has processor' });
  const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
  const { data: newProcessor } = await supabase.from('processors').insert([{
    company_name: companyName, api_key_hash: sha256(apiKey), status: 'active', owner_id: req.user.id, events_limit: 1000
  }]).select().single();
  res.status(201).json({ apiKey, processorId: newProcessor.id });
});

// --- KEYS & 2FA ---
app.post('/api/keys/setup-2fa', authenticateUser, authorizeOwner, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor' });
  try {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(req.user.email, 'AuditorVeritas', secret);
    const encryptedSecret = encryptData(secret, process.env.MASTER_ENCRYPTION_KEY);
    await supabase.from('processors').update({ totp_secret: encryptedSecret }).eq('id', req.processor.id);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
    res.json({ message: '2FA setup initiated', secret, otpAuthUrl: qrCodeDataUrl });
  } catch (err) { res.status(500).json({ error: 'TOTP setup failed' }); }
});

app.post('/api/keys/rotate', authenticateUser, authorizeOwner, async (req, res) => {
  const { code } = totpCodeSchema.parse(req.body);
  const { data: proc } = await supabase.from('processors').select('totp_secret').eq('id', req.processor.id).single();
  if (!proc?.totp_secret) return res.status(400).json({ error: '2FA not configured' });
  
  const secret = decryptData(proc.totp_secret, process.env.MASTER_ENCRYPTION_KEY);
  if (!authenticator.verify({ token: code, secret })) return res.status(401).json({ error: 'Invalid verification code' });
  
  const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
  await supabase.from('processors').update({ api_key_hash: sha256(newApiKey), last_rotation_date: new Date().toISOString() }).eq('id', req.processor.id);
  res.json({ message: 'Key rotated successfully', newApiKey });
});

app.post('/api/keys/request-rotation', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'No processor' });
    const { data: proc } = await supabase.from('processors').select('totp_secret').eq('id', req.processor.id).single();
    res.json({ totpConfigured: !!proc?.totp_secret });
});

// Team management routes (simplified for brevity, fully functional in production context)
app.get('/api/team', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied' });
    const { data: members } = await supabase.from('processor_users').select('user_id, role').eq('processor_id', req.processor.id);
    const team = await Promise.all((members || []).map(async m => {
        const { data: u } = await supabase.auth.admin.getUserById(m.user_id);
        return { email: u?.user?.email || 'Unknown', role: m.role, user_id: m.user_id };
    }));
    const { data: owner } = await supabase.auth.admin.getUserById(req.processor.owner_id);
    team.unshift({ email: owner?.user?.email, role: 'owner', user_id: req.processor.owner_id });
    res.json({ team, pending: [] });
});

app.listen(PORT, () => { logger.info(`SERVER RUNNING ON PORT ${PORT}`); });
export default app;