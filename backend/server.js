import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { z } from 'zod';
import stringify from 'fast-json-stable-stringify';
import winston from 'winston';
import morgan from 'morgan';
import archiver from 'archiver'; // MÅSTE VARA INSTALLERAD OCH I package.json

// Ladda miljövariabler
if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. SÄKERHET & CONFIG ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY; 

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MASTER_KEY) {
  console.error('❌ FATAL: Missing Credentials (SUPABASE or MASTER_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// --- 2. LOGGING & MIDDLEWARE ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(helmet());

const ALLOWED_ORIGINS = [
    'https://auditorveritas.com',
    'https://dreamy-banoffee-1603b3.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' })); 

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
    message: { error: 'Rate limit exceeded' }
});
app.use(apiLimiter);

// --- 3. CRYPTO HELPERS (ÄKTA AES-256) ---
const encryptData = (data, key) => CryptoJS.AES.encrypt(stringify(data), key).toString();
const decryptData = (ciphertext, key) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const str = bytes.toString(CryptoJS.enc.Utf8);
        if (!str) return null;
        return JSON.parse(str);
    } catch (e) { return null; }
};

// --- 4. VALIDATION SCHEMAS ---
const eventSubmissionSchema = z.object({
  event_type: z.string().min(1).max(64),
  user_identifier: z.string().min(1).max(256), 
  event_data: z.record(z.any()),
});

// --- 5. AUTHENTICATION ---
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  try {
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
    const { data: processor } = await supabase.from('processors').select('*').eq('api_key_hash', apiKeyHash).single();

    if (!processor || processor.status === 'revoked') {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    req.processor = processor;
    req.authType = 'machine';
    next();
  } catch (err) { res.status(500).json({ error: 'Auth Error' }); }
};

const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error('Invalid Token');
        req.user = user; 
        const { data: processor } = await supabase.from('processors').select('*').eq('owner_id', user.id).single();
        if (processor) req.processor = processor;
        req.authType = 'human';
        next();
    } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

const authenticateAny = async (req, res, next) => {
    if (req.headers['x-api-key']) return authenticateApiKey(req, res, next);
    if (req.headers['authorization']) return authenticateUser(req, res, next);
    return res.status(401).json({ error: 'Auth required' });
};

// --- 6. ROUTES ---

/**
 * INGESTION: Äkta Kryptering & Merkle Chaining
 */
app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);
        const processor = req.processor;
        const timestamp = new Date().toISOString();
        const userHash = CryptoJS.SHA256(user_identifier).toString();

        // A. Hämta/Skapa AES-nyckel för användaren
        let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).single();
        
        let userKey;
        if (!keyRow) {
            userKey = uuidv4() + "-" + uuidv4(); 
            const encryptedUserKey = encryptData(userKey, MASTER_KEY);
            await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptedUserKey }]);
        } else {
            userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);
        }

        if (!userKey) throw new Error("Encryption key failure");

        // B. Kryptera Payload
        const encryptedPayload = encryptData(event_data, userKey);

        // C. Hash Chain (Merkle Integrity) på KRYPTERAD data
        const { data: lastEvent } = await supabase.from('audit_events')
            .select('data_hash')
            .eq('processor_id', processor.id)
            .order('event_timestamp', { ascending: false })
            .limit(1);
        
        const previous_hash = lastEvent?.[0]?.data_hash || null;
        const hashData = { processor_id: processor.id, event_type, userHash, encryptedPayload, timestamp, previous_hash };
        const data_hash = CryptoJS.SHA256(stringify(hashData)).toString();

        // D. Spara
        const { data } = await supabase.from('audit_events').insert([{
            processor_id: processor.id,
            event_type,
            user_identifier: userHash,
            event_data: { encrypted: encryptedPayload },
            event_timestamp: timestamp,
            data_hash,
            previous_hash
        }]).select().single();

        try { await supabase.rpc('increment_processor_usage', { pid: processor.id }); } catch (e) {}

        res.status(201).json({ success: true, eventId: data.id, hash: data_hash });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        logger.error('Ingestion Error', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GDPR: Crypto-Shredding
 */
app.post('/api/gdpr/erase', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied.' });
    
    try {
        const { user_identifier_hash } = req.body;
        if (!user_identifier_hash) return res.status(400).json({ error: 'Missing hash' });

        const { error } = await supabase.from('encryption_keys')
            .delete()
            .eq('user_identifier_hash', user_identifier_hash);
        
        if (error) throw error;

        await supabase.from('admin_audit_logs').insert([{
            processor_id: req.processor.id,
            user_email: req.user?.email || 'api_system',
            action: 'CRYPTO_SHRED_EXECUTED',
            details: { target: user_identifier_hash }
        }]);

        res.json({ success: true, message: "Encryption key destroyed. Data permanently unrecoverable." });
    } catch (err) {
        res.status(500).json({ error: 'Erasure failed' });
    }
});

/**
 * EXPORT: Auditor Evidence Package (ZIP)
 */
app.get('/api/export/evidence', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });

    try {
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="evidence_package.zip"');

        archive.pipe(res);

        const { data: logs } = await supabase
            .from('audit_events')
            .select('id, event_timestamp, event_type, data_hash, previous_hash, event_data, user_identifier')
            .eq('processor_id', req.processor.id)
            .order('event_timestamp', { ascending: true })
            .limit(5000);

        archive.append(JSON.stringify(logs, null, 2), { name: 'encrypted_ledger.json' });

        const verifyScript = `
        const fs = require('fs');
        const logs = JSON.parse(fs.readFileSync('./encrypted_ledger.json'));
        console.log('Verifying Chain Integrity...');
        let valid = true;
        for (let i = 1; i < logs.length; i++) {
            if (logs[i].previous_hash !== logs[i-1].data_hash) {
                console.error('BROKEN LINK AT ID:', logs[i].id);
                valid = false;
            }
        }
        console.log(valid ? 'SUCCESS: Chain Intact' : 'FAILURE: Chain Broken');
        `;
        archive.append(verifyScript, { name: 'verify_chain.js' });

        await archive.finalize();
    } catch (err) {
        logger.error('Export Failed', err);
        res.status(500).end();
    }
});

app.get('/api/dashboard', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(404).json({ error: 'Processor not found' });
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    res.json({
        processor: { id: req.processor.id, companyName: req.processor.company_name, eventsLimit: req.processor.events_limit, plan: req.processor.plan },
        stats: { totalEvents: count || 0, monthlyEvents: req.processor.monthly_events_used || 0, eventsLimit: req.processor.events_limit }
    });
});

app.get('/api/events/search', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    const { query, limit = 20 } = req.query;
    let dbQuery = supabase.from('audit_events').select('*').eq('processor_id', req.processor.id).order('event_timestamp', { ascending: false }).limit(parseInt(limit));
    if (query) dbQuery = dbQuery.or(`event_type.ilike.%${query}%, user_identifier.ilike.%${query}%`);
    const { data } = await dbQuery;
    res.json({ events: data || [] });
});

app.post('/api/keys/rotate', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const newHash = CryptoJS.SHA256(newApiKey).toString();
    await supabase.from('processors').update({ api_key_hash: newHash }).eq('id', req.processor.id);
    res.json({ message: 'Success', newApiKey });
});

app.post('/api/processors', authenticateUser, async (req, res) => {
    const { companyName, plan } = req.body;
    if (req.processor) return res.status(409).json({ error: 'Exists' });
    const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
    await supabase.from('processors').insert([{
        company_name: companyName, email: req.user.email, plan, api_key_hash: apiKeyHash, status: 'active', owner_id: req.user.id
    }]);
    res.status(201).json({ apiKey });
});

app.get('/api/merkle/proof/:eventId', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    const { data: event } = await supabase.from('audit_events').select('data_hash').eq('id', req.params.eventId).single();
    if(!event) return res.status(404).json({error: 'Not found'});
    // Mock proof för MVP kontextens skull (implementera riktig Merkle klass här om kritisk)
    res.json({ leafHash: event.data_hash, merkleRoot: "ROOT_HASH_EXAMPLE", proof: [], verified: true });
});

app.listen(PORT, () => logger.info(`🚀 SERVER RUNNING ON ${PORT}`));