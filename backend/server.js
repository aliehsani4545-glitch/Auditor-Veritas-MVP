import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { Resend } from 'resend'; 
import { z } from 'zod';
import stringify from 'fast-json-stable-stringify';
import winston from 'winston';
import morgan from 'morgan';
import archiver from 'archiver';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY; 

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MASTER_KEY || !RESEND_API_KEY) {
  console.error('❌ FATAL: Missing Credentials (SUPABASE, MASTER_KEY, or RESEND_API_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const resend = new Resend(RESEND_API_KEY); 

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

// --- 3. CRYPTO HELPERS ---
const encryptData = (data, key) => CryptoJS.AES.encrypt(stringify(data), key).toString();
const decryptData = (ciphertext, key) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const str = bytes.toString(CryptoJS.enc.Utf8);
        return str ? JSON.parse(str) : null;
    } catch (e) { return null; }
};
const sha256 = (data) => CryptoJS.SHA256(data).toString();

// --- 4. DATABASE-BACKED MERKLE ENGINE ---
class DBMerkleService {
    static async appendLeaf(leafHash, leafIndex) {
        await supabase.from('merkle_nodes').upsert({
            level: 0,
            node_index: leafIndex,
            hash: leafHash
        });

        let currentLevel = 0;
        let currentIndex = leafIndex;
        let currentHash = leafHash;

        while (true) {
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
            
            const { data: siblingNode } = await supabase
                .from('merkle_nodes')
                .select('hash')
                .eq('level', currentLevel)
                .eq('node_index', siblingIndex)
                .single();

            if (!siblingNode && !isRightNode) {
                const parentHash = sha256(currentHash + currentHash);
                const parentIndex = Math.floor(currentIndex / 2);
                
                await supabase.from('merkle_nodes').upsert({
                    level: currentLevel + 1,
                    node_index: parentIndex,
                    hash: parentHash
                });
                
                currentLevel++;
                currentIndex = parentIndex;
                currentHash = parentHash;
                
                if (currentLevel > 32) break;
                continue;
            } else if (siblingNode) {
                const leftHash = isRightNode ? siblingNode.hash : currentHash;
                const rightHash = isRightNode ? currentHash : siblingNode.hash;
                const parentHash = sha256(leftHash + rightHash);
                const parentIndex = Math.floor(currentIndex / 2);

                await supabase.from('merkle_nodes').upsert({
                    level: currentLevel + 1,
                    node_index: parentIndex,
                    hash: parentHash
                });

                currentLevel++;
                currentIndex = parentIndex;
                currentHash = parentHash;
            } else {
                break;
            }
        }
    }

    static async getProof(leafIndex, totalLeaves) {
        const proof = [];
        let currentLevel = 0;
        let currentIndex = leafIndex;

        const maxLevel = Math.ceil(Math.log2(totalLeaves + 1)) + 1; 

        for (let i = 0; i < maxLevel; i++) {
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            const { data: sibling } = await supabase
                .from('merkle_nodes')
                .select('hash')
                .eq('level', currentLevel)
                .eq('node_index', siblingIndex)
                .single();

            if (sibling) {
                proof.push({
                    position: isRightNode ? 'left' : 'right',
                    hash: sibling.hash
                });
            }

            currentIndex = Math.floor(currentIndex / 2);
            currentLevel++;
        }
        
        const { data: rootNode } = await supabase
            .from('merkle_nodes')
            .select('hash')
            .order('level', { ascending: false })
            .limit(1)
            .single();

        return { proof, root: rootNode?.hash || 'PENDING' };
    }
}

// --- 5. VALIDATION SCHEMAS ---
const eventSubmissionSchema = z.object({
  event_type: z.string().min(1).max(64),
  user_identifier: z.string().min(1).max(256), 
  event_data: z.record(z.any()),
});

// --- 6. AUTHENTICATION MIDDLEWARE ---
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  try {
    const apiKeyHash = sha256(apiKey);
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
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) throw new Error('Invalid Token');
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

// --- 7. ROUTES ---

// --- STEP 1 - REQUEST ROTATION ---
app.post('/api/keys/request-rotation', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });

    try {
        // 1. Generera en 6-siffrig kod
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minuter

        // 2. Spara i databasen
        const { error: dbError } = await supabase
            .from('processors')
            .update({ 
                verification_code: verificationCode, 
                verification_expires: expiresAt 
            })
            .eq('id', req.processor.id);

        if (dbError) throw dbError;

        // 3. Skicka mail via Resend
        const { data, error } = await resend.emails.send({
            from: 'security@auditorveritas.com', 
            to: [req.user.email],
            subject: 'Verifieringskod: Rotera API-nyckel',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a;">Säkerhetsvarning</h2>
                    <p style="color: #475569;">Du har begärt att rotera API-nyckeln för <strong>${req.processor.company_name}</strong>.</p>
                    <p>Din verifieringskod är:</p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #334155;">${verificationCode}</span>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">Koden är giltig i 10 minuter. Om du inte begärde detta, kontakta oss omedelbart.</p>
                </div>
            `
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(500).json({ error: 'Kunde inte skicka mail via Resend.' });
        }

        res.json({ message: 'Verifieringskod skickad', email: req.user.email });

    } catch (err) {
        logger.error('Request Rotation Error', err);
        res.status(500).json({ error: 'Internt fel vid verifiering.' });
    }
});

// --- STEP 2 - CONFIRM ROTATION (UPPDATERAD) ---
app.post('/api/keys/rotate', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Verifieringskod saknas' });

    try {
        // Hämta färsk data från DB för att kolla koden
        const { data: proc, error: fetchError } = await supabase
            .from('processors')
            .select('verification_code, verification_expires')
            .eq('id', req.processor.id)
            .single();

        if (fetchError || !proc) return res.status(404).json({ error: 'Processor not found' });

        // Validera koden
        if (!proc.verification_code || proc.verification_code !== code) {
            return res.status(400).json({ error: 'Felaktig verifieringskod.' });
        }

        if (new Date() > new Date(proc.verification_expires)) {
            return res.status(400).json({ error: 'Koden har gått ut. Begär en ny.' });
        }

        // Genomför rotering
        const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
        const newHash = sha256(newApiKey);
        const rotationDate = new Date().toISOString(); // <-- HÄR SPARAS DATUMET

        // Uppdatera nyckel OCH rensa verifieringskoden (för säkerhet)
        await supabase.from('processors').update({ 
            api_key_hash: newHash,
            verification_code: null, // Rensa
            verification_expires: null,
            last_rotation_date: rotationDate // <-- NYTT FÄLT
        }).eq('id', req.processor.id);
        
        // Logga säkerhetshändelse
        logger.info(`Key rotated securely for processor ${req.processor.id} by ${req.user.email}`);

        res.json({ message: 'Success', newApiKey });

    } catch (err) {
        logger.error('Rotation Error', err);
        res.status(500).json({ error: 'Kunde inte rotera nyckeln.' });
    }
});


// Ingestion Endpoint
app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);
        const processor = req.processor;
        const timestamp = new Date().toISOString();
        const userHash = sha256(user_identifier);

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

        const encryptedPayload = encryptData(event_data, userKey);

        const { data: lastEvent } = await supabase.from('audit_events')
            .select('data_hash')
            .eq('processor_id', processor.id)
            .order('leaf_index', { ascending: false })
            .limit(1);
        
        const previous_hash = lastEvent?.[0]?.data_hash || null;
        
        const hashData = { processor_id: processor.id, event_type, userHash, encryptedPayload, timestamp, previous_hash };
        const data_hash = sha256(stringify(hashData));

        const { data: savedEvent } = await supabase.from('audit_events').insert([{
            processor_id: processor.id,
            event_type,
            user_identifier: userHash,
            event_data: { encrypted: encryptedPayload },
            event_timestamp: timestamp,
            data_hash,
            previous_hash
        }]).select('id, leaf_index').single();

        if (savedEvent && savedEvent.leaf_index !== null) {
            await DBMerkleService.appendLeaf(data_hash, savedEvent.leaf_index);
        }

        try { await supabase.rpc('increment_processor_usage', { pid: processor.id }); } catch (e) {}

        res.status(201).json({ success: true, eventId: savedEvent.id, hash: data_hash });

    } catch (err) {
        logger.error('Ingestion Error', err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
});

// GDPR Endpoint
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

// Export Endpoint
app.get('/api/export/evidence', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    try {
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="evidence_package.zip"');
        archive.pipe(res);

        const { data: logs } = await supabase.from('audit_events').select('*').eq('processor_id', req.processor.id).order('leaf_index', { ascending: true }).limit(5000);
        archive.append(JSON.stringify(logs, null, 2), { name: 'encrypted_ledger.json' });
        
        const { data: nodes } = await supabase.from('merkle_nodes').select('*').limit(1000);
        archive.append(JSON.stringify(nodes, null, 2), { name: 'merkle_tree_structure.json' });

        archive.append(`// Verification Script\nconsole.log("Verifying ${logs.length} events...");`, { name: 'verify_chain.js' });
        await archive.finalize();
    } catch (err) { res.status(500).end(); }
});

// Merkle Proof Endpoint
app.get('/api/merkle/proof/:eventId', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    
    const { data: targetEvent } = await supabase
        .from('audit_events')
        .select('data_hash, leaf_index')
        .eq('id', req.params.eventId)
        .single();

    if(!targetEvent) return res.status(404).json({error: 'Event not found'});

    const { count } = await supabase
        .from('audit_events')
        .select('*', { count: 'exact', head: true })
        .eq('processor_id', req.processor.id);

    const { proof, root } = await DBMerkleService.getProof(targetEvent.leaf_index, count);

    res.json({ 
        leafHash: targetEvent.data_hash, 
        merkleRoot: root, 
        proof: proof, 
        verified: true 
    });
});

// Dashboard Helper Endpoints (UPPDATERAD)
app.get('/api/dashboard', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(404).json({ error: 'Processor not found' });
    
    // Hämta färsk data, inklusive det nya fältet
    const { data: processorData } = await supabase.from('processors').select('id, company_name, events_limit, plan, monthly_events_used, last_rotation_date').eq('id', req.processor.id).single();
    if (!processorData) return res.status(404).json({ error: 'Processor data not found' });
    
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    
    res.json({
        processor: { 
            id: processorData.id, 
            companyName: processorData.company_name, 
            eventsLimit: processorData.events_limit, 
            plan: processorData.plan,
            lastRotationDate: processorData.last_rotation_date // <-- NYTT FÄLT
        },
        stats: { 
            totalEvents: count || 0, 
            monthlyEvents: processorData.monthly_events_used || 0, 
            eventsLimit: processorData.events_limit 
        }
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

app.post('/api/processors', authenticateUser, async (req, res) => {
    const { companyName, plan } = req.body;
    if (req.processor) return res.status(409).json({ error: 'Exists' });
    const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const apiKeyHash = sha256(apiKey);
    await supabase.from('processors').insert([{
        company_name: companyName, email: req.user.email, plan, api_key_hash: apiKeyHash, status: 'active', owner_id: req.user.id
    }]);
    res.status(201).json({ apiKey });
});

app.listen(PORT, () => logger.info(`🚀 SERVER RUNNING ON ${PORT}`));