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
import archiver from 'archiver'; // Importeras för Export-funktionalitet

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

// Critical Check
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MASTER_KEY) {
  console.error('❌ FATAL: Missing Environment Variables. Check Render Dashboard.');
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

// Tillåtna domäner (Produktion + Dev)
const ALLOWED_ORIGINS = [
    'https://auditorveritas.com',
    'https://www.auditorveritas.com',
    'https://dreamy-banoffee-1603b3.netlify.app',
    'http://localhost:5173', 
    'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
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
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

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
const extractDomain = (email) => {
    const match = email.match(/@(.+)$/);
    return match ? match[1].toLowerCase() : null;
};

// --- 4. MERKLE LOGIC (FULL RECURSIVE IMPLEMENTATION) ---
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
                
                // Optimerad: Ta bort lövet och dess syskon när föräldern är beräknad
                await supabase.from('merkle_nodes').delete().eq('level', currentLevel - 1).eq('node_index', siblingIndex);
                await supabase.from('merkle_nodes').delete().eq('level', currentLevel - 1).eq('node_index', currentIndex);

                currentIndex = parentIndex; 
                currentHash = parentHash;
            } else if (!isRightNode) {
                // Lyft upp en ensam vänster nod
                const parentHash = sha256(currentHash + currentHash);
                await supabase.from('merkle_nodes').upsert({ level: currentLevel, node_index: parentIndex, hash: parentHash });
                currentIndex = parentIndex;
                currentHash = parentHash;
            } else {
                break;
            }

            // Avsluta om trädnivån blir för hög (säkerhet)
            if (currentLevel > 32) break; 
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
            const { data: sibling } = await supabase.from('merkle_nodes').select('hash').eq('level', currentLevel).eq('node_index', siblingIndex).single();
            if (sibling) proof.push({ position: isRightNode ? 'left' : 'right', hash: sibling.hash });
            currentIndex = Math.floor(currentIndex / 2);
            currentLevel++;
        }
        const { data: rootNode } = await supabase.from('merkle_nodes').select('hash').order('level', { ascending: false }).limit(1).single();
        return { proof, root: rootNode?.hash || 'PENDING' };
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

const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) return res.status(401).json({ error: 'Token required' });
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error('Invalid Token');
        req.user = user; 
        
        let { data: processor } = await supabase.from('processors').select('*').eq('owner_id', user.id).single();
        if (!processor) {
            const { data: membership } = await supabase.from('processor_users').select('processor_id, role').eq('user_id', user.id).single();
            if (membership) {
                const { data: proc } = await supabase.from('processors').select('*').eq('id', membership.processor_id).single();
                processor = proc; req.userRole = membership.role;
            }
        } else { req.userRole = 'owner'; }
        
        if (processor) req.processor = processor;
        req.authType = 'human'; next();
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

// --- 7. ROUTES ---

// Health Check (Förhindrar 502 på Render)
app.get('/health', (req, res) => res.status(200).send('OK'));

// Key Rotation Setup (2FA)
app.post('/api/keys/totp/setup', authenticateUser, async (req, res) => {
    try {
        const secret = authenticator.generateSecret();
        await supabase.from('user_secrets').upsert({ user_id: req.user.id, totp_secret: secret, is_totp_enabled: false });
        const qrCodeDataUrl = await QRCode.toDataURL(authenticator.keyuri(req.user.email, 'Auditor Veritas', secret));
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

app.post('/api/keys/request-rotation', authenticateUser, async (req, res) => {
    const { data } = await supabase.from('user_secrets').select('is_totp_enabled').eq('user_id', req.user.id).maybeSingle();
    res.json({ message: 'Ready.', totpEnabled: !!data?.is_totp_enabled });
});

app.post('/api/keys/rotate', authenticateUser, async (req, res) => {
    try {
        const { code } = req.body;
        const { data: userSecret } = await supabase.from('user_secrets').select('*').eq('user_id', req.user.id).single();
        if (!userSecret?.is_totp_enabled || !authenticator.check(code, userSecret.totp_secret)) return res.status(401).json({ error: 'Invalid TOTP.' });

        const newKey = `av_${uuidv4().replace(/-/g, '')}`;
        await supabase.from('processors').update({ api_key_hash: sha256(newKey), last_rotation_date: new Date() }).eq('id', req.processor.id);
        
        await supabase.from('audit_events').insert([{
            processor_id: req.processor.id, event_type: 'system.key_rotation', user_identifier: sha256(req.user.email),
            event_data: { note: 'Key rotated via 2FA' }, event_timestamp: new Date().toISOString(), data_hash: sha256(`rotation-${Date.now()}`)
        }]);

        res.json({ message: 'Success', newApiKey: newKey });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// Team Invite (Ger länk)
app.post('/api/team/invite', authenticateUser, authorizeOwner, async (req, res) => {
    try {
        const { email, role } = inviteUserSchema.parse(req.body);
        const token = uuidv4().replace(/-/g, '');
        
        await supabase.from('processor_invitations').insert([{
            processor_id: req.processor.id, invited_email: email, role, token, expires_at: new Date(Date.now() + 86400000).toISOString()
        }]);
        
        res.status(200).json({ 
            message: `Invitation generated`, 
            inviteLink: `https://auditorveritas.com/join?token=${token}` 
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/team', authenticateUser, async (req, res) => {
    try {
        const { data: members } = await supabase.from('processor_users').select('user_id, role').eq('processor_id', req.processor.id);
        const { data: invites } = await supabase.from('processor_invitations').select('*').eq('processor_id', req.processor.id);
        
        // Använder Admin API för att hämta e-postadresser för Dashboarden
        const team = members ? await Promise.all(members.map(async m => {
            const { data: u } = await supabase.auth.admin.getUserById(m.user_id);
            return { email: u?.user?.email || 'Unknown', role: m.role, status: 'Active', user_id: m.user_id };
        })) : [];
        
        const { data: owner } = await supabase.auth.admin.getUserById(req.processor.owner_id);
        if (!team.find(t => t.user_id === req.processor.owner_id)) {
             team.unshift({ email: owner?.user?.email, role: 'owner', status: 'Active', user_id: req.processor.owner_id });
        }

        res.json({ team, pending: invites || [], userRole: req.userRole });
    } catch (err) { res.status(500).json({ error: 'Fetch error' }); }
});

// MAIN EVENT INGESTION (PRODUCTION READY)
app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);
        
        const timestamp = new Date().toISOString();
        const userHash = sha256(user_identifier);
        
        // 1. Krypteringsnyckel (Crypto-Shredding logic)
        let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).maybeSingle();
        let userKey;
        
        if (keyRow) {
            userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);
        } else {
            userKey = uuidv4() + "-" + uuidv4();
            await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptData(userKey, MASTER_KEY) }]);
        }

        if (!userKey) throw new Error("Encryption key access failed.");

        // 2. Kryptera payload
        const encryptedPayload = encryptData(event_data, userKey);
        
        // 3. Skapa Integrity Hash
        const integrityHash = sha256(stringify({
            processor_id: req.processor.id,
            event_type,
            userHash,
            timestamp,
            payload_hash: sha256(encryptedPayload) 
        }));

        // 4. Spara till DB och få leaf index
        const { data: savedEvent, error } = await supabase.from('audit_events').insert([{
            processor_id: req.processor.id,
            event_type,
            user_identifier: userHash, 
            event_data: { encrypted: encryptedPayload },
            event_timestamp: timestamp,
            data_hash: integrityHash
        }]).select('leaf_index').single();

        if (error) throw error;
        
        // 5. Uppdatera Merkle (Full rekursion, körs asynkront)
        DBMerkleService.appendLeaf(integrityHash, savedEvent.leaf_index).catch(console.error);
        
        // 6. Uppdatera Usage
        await supabase.rpc('increment_processor_usage', { pid: req.processor.id });

        res.status(201).json({ success: true, hash: integrityHash });
    } catch (err) { 
        console.error("Ingest Error:", err);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/dashboard', authenticateUser, async (req, res) => {
    try {
        const { data } = await supabase.from('processors').select('*').eq('id', req.processor.id).single();
        if (!data) return res.status(404).json({ error: 'No processor found.' });
        
        const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
        
        res.json({ 
            processor: data, 
            stats: { totalEvents: count || 0, monthlyEvents: data.monthly_events_used }, 
            userRole: req.userRole 
        });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/events/search', authenticateAny, async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const { data } = await supabase.from('audit_events')
        .select('*')
        .eq('processor_id', req.processor.id)
        .order('event_timestamp', { ascending: false })
        .limit(limit);
    res.json({ events: data || [] });
});

app.listen(PORT, () => logger.info(`Server running on ${PORT}`));