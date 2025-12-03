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



// --- 1. CONFIGURATION & SECRETS ---

const SUPABASE_URL = process.env.SUPABASE_URL;

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; 

const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY; 



// CRITICAL CHECK: Ensure server doesn't start in a broken state

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MASTER_KEY) {

  console.error('❌ FATAL: Missing Environment Variables (SUPABASE_URL, SERVICE_KEY or MASTER_KEY).');

  process.exit(1);

}



const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {

  auth: { autoRefreshToken: false, persistSession: false }

});



// --- 2. LOGGING, SECURITY & CORS ---

const logger = winston.createLogger({

  level: 'info',

  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),

  transports: [new winston.transports.Console()],

});



app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(helmet());



// Allowed Origins (Production + Dev)

const ALLOWED_ORIGINS = [

    'https://auditorveritas.com',

    'https://www.auditorveritas.com',

    'https://dreamy-banoffee-1603b3.netlify.app',

    'http://localhost:5173', 

    'http://localhost:3000'

];



app.use(cors({

  origin: (origin, callback) => {

    // Allow requests with no origin (like mobile apps or curl requests)

    if (!origin) return callback(null, true);

    

    // Check if origin is allowed

    const isAllowed = ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.startsWith(allowed));

    

    if (isAllowed) {

      callback(null, true);

    } else {

      console.warn(`Blocked by CORS: ${origin}`);

      callback(new Error('Not allowed by CORS'));

    }

  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']

}));



app.use(express.json({ limit: '5mb' })); 



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



// --- 4. MERKLE LOGIC ---

class DBMerkleService {

    static async appendLeaf(leafHash, leafIndex) {

        await supabase.from('merkle_nodes').upsert({ level: 0, node_index: leafIndex, hash: leafHash });

        let currentLevel = 0;

        let currentIndex = leafIndex;

        let currentHash = leafHash;



        while (true) {

            const isRightNode = currentIndex % 2 === 1;

            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            

            const { data: siblingNode } = await supabase.from('merkle_nodes')

                .select('hash')

                .eq('level', currentLevel)

                .eq('node_index', siblingIndex)

                .single();



            const parentIndex = Math.floor(currentIndex / 2);

            currentLevel++;

            

            if (siblingNode) {

                const leftHash = isRightNode ? siblingNode.hash : currentHash;

                const rightHash = isRightNode ? currentHash : siblingNode.hash;

                const parentHash = sha256(leftHash + rightHash);

                

                await supabase.from('merkle_nodes').upsert({ level: currentLevel, node_index: parentIndex, hash: parentHash });

                

                // Cleanup leaves to save space (optional optimization)

                await supabase.from('merkle_nodes').delete().eq('level', currentLevel - 1).eq('node_index', siblingIndex);

                await supabase.from('merkle_nodes').delete().eq('level', currentLevel - 1).eq('node_index', currentIndex);



                currentIndex = parentIndex; 

                currentHash = parentHash;

            } else if (!isRightNode) {

                // Promotion of single left node

                const parentHash = sha256(currentHash + currentHash);

                await supabase.from('merkle_nodes').upsert({ level: currentLevel, node_index: parentIndex, hash: parentHash });

                currentIndex = parentIndex;

                currentHash = parentHash;

            } else {

                break;

            }

            if (currentLevel > 32) break; 

        }

    }

}



// --- 5. VALIDATION SCHEMAS ---

const eventSubmissionSchema = z.object({

  event_type: z.string().min(1).max(128),

  user_identifier: z.string().min(1).max(256), 

  event_data: z.record(z.any()),

});



const inviteUserSchema = z.object({

    email: z.string().email(),

    role: z.enum(['reader', 'editor', 'manager', 'admin']).default('reader'),

});



const totpSchema = z.object({

    code: z.string().length(6),

});



const createProcessorSchema = z.object({

    companyName: z.string().min(2).max(100)

});



// --- 6. AUTHENTICATION MIDDLEWARE ---

const authenticateApiKey = async (req, res, next) => {

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  try {

    const apiKeyHash = sha256(apiKey);

    const { data: processor } = await supabase.from('processors').select('*').eq('api_key_hash', apiKeyHash).single();

    if (!processor || processor.status === 'revoked') return res.status(401).json({ error: 'Invalid API key' });

    req.processor = processor; req.authType = 'machine'; next();

  } catch (err) { res.status(500).json({ error: 'Auth Error' }); }

};



// --- ROBUST AUTHENTICATE USER FUNCTION ---

const authenticateUser = async (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(401).json({ error: 'Token required' });

    

    const token = authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Malformed token' });

    

    try {

        const { data: { user }, error } = await supabase.auth.getUser(token);

        

        if (error || !user) {

            console.error("Supabase Auth Error:", error);

            return res.status(401).json({ error: 'Invalid Token' });

        }

        

        req.user = user; 

        

        // SAFE LOOKUP LOGIC

        let processor = null;

        let userRole = null;



        // 1. Try to find as OWNER

        const { data: ownerProcessor } = await supabase

            .from('processors')

            .select('*')

            .eq('owner_id', user.id)

            .maybeSingle();

        

        if (ownerProcessor) {

            processor = ownerProcessor;

            userRole = 'owner';

        } 

        

        // 2. If not owner, try to find as MEMBER

        if (!processor) {

            const { data: membership } = await supabase

                .from('processor_users')

                .select('processor_id, role')

                .eq('user_id', user.id)

                .maybeSingle();

            

            if (membership) {

                const { data: proc } = await supabase

                    .from('processors')

                    .select('*')

                    .eq('id', membership.processor_id)

                    .single();

                

                if (proc) {

                    processor = proc; 

                    userRole = membership.role;

                }

            }

        }

        

        // Attach to request (ONLY if found)

        if (processor) req.processor = processor;

        if (userRole) req.userRole = userRole;



        req.authType = 'human'; 

        next();

        

    } catch (err) { 

        console.error('Middleware Critical Error:', err);

        res.status(500).json({ error: 'Internal Auth Error' }); 

    }

};



const authenticateAny = async (req, res, next) => {

    if (req.headers['x-api-key']) return authenticateApiKey(req, res, next);

    if (req.headers['authorization']) return authenticateUser(req, res, next);

    return res.status(401).json({ error: 'Auth required' });

};



// --- 7. ROUTES ---



// Health Check

app.get('/health', (req, res) => res.status(200).send('OK'));



// --- PROCESSOR CREATION ---

app.post('/api/processors', authenticateUser, async (req, res) => {

    try {

        if (req.processor) return res.status(400).json({ error: 'Processor already exists' });

        

        const { companyName } = createProcessorSchema.parse(req.body);

        const apiKeyRaw = `el_${uuidv4().replace(/-/g, '')}`; // Namnändring här

        const apiKeyHash = sha256(apiKeyRaw);



        const { data, error } = await supabase.from('processors').insert([{

            owner_id: req.user.id,

            company_name: companyName,

            api_key_hash: apiKeyHash,

            status: 'active',

            tier: 'standard',

            region: 'eu-west',

            monthly_events_limit: 1000

        }]).select().single();



        if (error) throw error;

        

        await supabase.from('processor_users').insert([{

            processor_id: data.id,

            user_id: req.user.id,

            role: 'owner'

        }]);



        res.status(201).json({ success: true, apiKey: apiKeyRaw, processorId: data.id });

    } catch (e) { res.status(500).json({ error: e.message }); }

});



// --- DASHBOARD DATA (Safe Route) ---

app.get('/api/dashboard', authenticateUser, async (req, res) => {

    try {

        // SAFE GUARD: If middleware didn't find a processor, return 404 (Frontend handles this)

        if (!req.processor || !req.processor.id) {

            return res.status(404).json({ error: 'No processor found.' });

        }



        // Fetch fresh processor data to ensure valid keys/stats

        const { data: processorData } = await supabase

            .from('processors')

            .select('*')

            .eq('id', req.processor.id)

            .single();



        if (!processorData) return res.status(404).json({ error: 'Processor data missing.' });

        

        const { count } = await supabase

            .from('audit_events')

            .select('*', { count: 'exact', head: true })

            .eq('processor_id', req.processor.id);

        

        res.json({ 

            processor: processorData, 

            stats: { 

                totalEvents: count || 0, 

                monthlyEvents: processorData.monthly_events_used 

            }, 

            userRole: req.userRole 

        });

    } catch(e) { 

        console.error("Dashboard Fetch Error:", e);

        res.status(500).json({error: "Failed to load dashboard data."}); 

    }

});



// --- KEY ROTATION ---

app.post('/api/keys/totp/setup', authenticateUser, async (req, res) => {

    try {

        const secret = authenticator.generateSecret();

        await supabase.from('user_secrets').upsert({ user_id: req.user.id, totp_secret: secret, is_totp_enabled: false });

        const qrCodeDataUrl = await QRCode.toDataURL(authenticator.keyuri(req.user.email, 'EuroLedger', secret)); // Namnändring här

        res.json({ secret, qrCodeDataUrl });

    } catch (err) { res.status(500).json({ error: 'Setup failed.' }); }

});



app.post('/api/keys/totp/enable', authenticateUser, async (req, res) => {

    try {

        const { code } = totpSchema.parse(req.body);

        const { data: userSecret } = await supabase.from('user_secrets').select('totp_secret').eq('user_id', req.user.id).single();

        if (!userSecret || !authenticator.check(code, userSecret.totp_secret)) return res.status(400).json({ error: 'Invalid code.' });

        await supabase.from('user_secrets').update({ is_totp_enabled: true }).eq('user_id', req.user.id);

        res.json({ success: true });

    } catch (err) { res.status(500).json({ error: 'Enable failed.' }); }

});



app.post('/api/keys/rotate', authenticateUser, async (req, res) => {

    try {

        if (!req.processor) return res.status(403).json({ error: 'No processor' });

        const { code } = req.body;

        const { data: userSecret } = await supabase.from('user_secrets').select('*').eq('user_id', req.user.id).single();

        

        if (!userSecret?.is_totp_enabled || !authenticator.check(code, userSecret.totp_secret)) {

            return res.status(401).json({ error: 'Invalid TOTP code.' });

        }



        const newKey = `el_${uuidv4().replace(/-/g, '')}`; // Namnändring här

        await supabase.from('processors').update({ api_key_hash: sha256(newKey), last_rotation_date: new Date() }).eq('id', req.processor.id);

        

        await supabase.from('audit_events').insert([{

            processor_id: req.processor.id, event_type: 'system.key_rotation', user_identifier: sha256(req.user.email),

            event_data: { note: 'Key rotated via 2FA' }, event_timestamp: new Date().toISOString(), data_hash: sha256(`rotation-${Date.now()}`)

        }]);



        res.json({ message: 'Success', newApiKey: newKey });

    } catch(e) { res.status(500).json({error: e.message}); }

});



// --- TEAM MANAGEMENT ---

app.get('/api/team', authenticateUser, async (req, res) => {

    try {

        if (!req.processor) return res.json({ team: [], pending: [] });

        

        const { data: members } = await supabase.from('processor_users').select('user_id, role').eq('processor_id', req.processor.id);

        const { data: invites } = await supabase.from('processor_invitations').select('*').eq('processor_id', req.processor.id);

        

        const team = members ? await Promise.all(members.map(async m => {

            const { data: u } = await supabase.auth.admin.getUserById(m.user_id);

            return { email: u?.user?.email || 'Unknown', role: m.role, status: 'Active', user_id: m.user_id };

        })) : [];



        res.json({ team, pending: invites || [], userRole: req.userRole });

    } catch (err) { res.status(500).json({ error: 'Fetch error' }); }

});



// --- EVENT INGESTION ---

app.post('/api/events', authenticateApiKey, async (req, res) => {

    try {

        const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);

        

        const timestamp = new Date().toISOString();

        const userHash = sha256(user_identifier);

        

        // 1. Encryption Key Management

        let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).maybeSingle();

        let userKey;

        

        if (keyRow) {

            userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);

        } else {

            userKey = uuidv4() + "-" + uuidv4();

            await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptData(userKey, MASTER_KEY) }]);

        }



        if (!userKey) throw new Error("Encryption key failure.");



        // 2. Encrypt Payload

        const encryptedPayload = encryptData(event_data, userKey);

        

        // 3. Generate Integrity Hash

        const integrityHash = sha256(stringify({

            processor_id: req.processor.id,

            event_type,

            userHash,

            timestamp,

            payload_hash: sha256(encryptedPayload) 

        }));



        // 4. Save Event

        const { data: savedEvent, error } = await supabase.from('audit_events').insert([{

            processor_id: req.processor.id,

            event_type,

            user_identifier: userHash, 

            event_data: { encrypted: encryptedPayload },

            event_timestamp: timestamp,

            data_hash: integrityHash

        }]).select('leaf_index').single();



        if (error) throw error;

        

        // 5. Update Merkle Tree (Async)

        DBMerkleService.appendLeaf(integrityHash, savedEvent.leaf_index).catch(err => console.error("Merkle Error:", err));

        

        // 6. Update Usage Stats

        await supabase.rpc('increment_processor_usage', { pid: req.processor.id });



        res.status(201).json({ success: true, hash: integrityHash });

    } catch (err) { 

        console.error("Ingest Error:", err);

        res.status(500).json({ error: err.message }); 

    }

});



// --- SEARCH ---

app.get('/api/events/search', authenticateAny, async (req, res) => {

    if (!req.processor) return res.status(403).json({ error: 'No processor' });

    const limit = parseInt(req.query.limit) || 20;

    const { data } = await supabase.from('audit_events')

        .select('*')

        .eq('processor_id', req.processor.id)

        .order('event_timestamp', { ascending: false })

        .limit(limit);

    res.json({ events: data || [] });

});



app.listen(PORT, () => logger.info(`Server running on ${PORT}`));