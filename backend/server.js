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
import archiver from 'archiver';
import { authenticator } from 'otplib'; 
import QRCode from 'qrcode'; 

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

// Kritiska systemnycklar måste finnas vid start. Stripe/Resend är borttagna.
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MASTER_KEY) {
  console.error('❌ FATAL: Missing Credentials (SUPABASE or MASTER_ENCRYPTION_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

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
    'https://www.auditorveritas.com',
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

// --- DOMAIN HELPER ---
const extractDomain = (email) => {
    const match = email.match(/@(.+)$/);
    return match ? match[1].toLowerCase() : null;
};

// --- 4. DATABASE-BACKED MERKLE ENGINE ---
class DBMerkleService {
    static async appendLeaf(leafHash, leafIndex) {
        await supabase.from('merkle_nodes').upsert({ level: 0, node_index: leafIndex, hash: leafHash });
        let currentLevel = 0;
        let currentIndex = leafIndex;
        let currentHash = leafHash;

        while (true) {
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
            const { data: siblingNode } = await supabase.from('merkle_nodes').select('hash').eq('level', currentLevel).eq('node_index', siblingIndex).single();

            if (!siblingNode && !isRightNode) {
                const parentHash = sha256(currentHash + currentHash);
                const parentIndex = Math.floor(currentIndex / 2);
                await supabase.from('merkle_nodes').upsert({ level: currentLevel + 1, node_index: parentIndex, hash: parentHash });
                currentLevel++; currentIndex = parentIndex; currentHash = parentHash;
                if (currentLevel > 32) break;
                continue;
            } else if (siblingNode) {
                const leftHash = isRightNode ? siblingNode.hash : currentHash;
                const rightHash = isRightNode ? currentHash : siblingNode.hash;
                const parentHash = sha256(leftHash + rightHash);
                const parentIndex = Math.floor(currentIndex / 2);
                await supabase.from('merkle_nodes').upsert({ level: currentLevel + 1, node_index: parentIndex, hash: parentHash });
                currentLevel++; currentIndex = parentIndex; currentHash = parentHash;
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
  event_type: z.string().min(1).max(64),
  user_identifier: z.string().min(1).max(256), 
  event_data: z.record(z.any()),
});

// Utökade roller här
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
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) throw new Error('Invalid Token');
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

const authorizeManagerOrAbove = (req, res, next) => {
    const allowed = ['owner', 'admin', 'manager'];
    if (!allowed.includes(req.userRole)) {
        return res.status(403).json({ error: 'Forbidden. Insufficient permissions to manage team.' });
    }
    next();
};

const authenticateAny = async (req, res, next) => {
    if (req.headers['x-api-key']) return authenticateApiKey(req, res, next);
    if (req.headers['authorization']) return authenticateUser(req, res, next);
    return res.status(401).json({ error: 'Auth required' });
};

// --- 7. ROUTES ---

// 7.1 TOTP Setup
app.post('/api/keys/totp/setup', authenticateUser, async (req, res) => {
    const { data: existing } = await supabase.from('user_secrets').select('is_totp_enabled').eq('user_id', req.user.id).maybeSingle();
    if (existing?.is_totp_enabled) return res.status(409).json({ error: 'TOTP is already enabled.' });
    try {
        const secret = authenticator.generateSecret();
        await supabase.from('user_secrets').upsert({ user_id: req.user.id, totp_secret: secret, is_totp_enabled: false });
        const qrCodeDataUrl = await QRCode.toDataURL(authenticator.keyuri(req.user.email, 'Auditor Veritas', secret));
        res.json({ secret, qrCodeDataUrl });
    } catch (err) { res.status(500).json({ error: 'Setup failed.' }); }
});

// 7.2 TOTP Enable
app.post('/api/keys/totp/enable', authenticateUser, async (req, res) => {
    try {
        const { code } = totpSchema.parse(req.body);
        const { data: userSecret } = await supabase.from('user_secrets').select('totp_secret').eq('user_id', req.user.id).single();
        if (!userSecret) return res.status(404).json({ error: 'Setup missing.' });
        if (!authenticator.check(code, userSecret.totp_secret)) return res.status(400).json({ error: 'Invalid code.' });
        await supabase.from('user_secrets').update({ is_totp_enabled: true }).eq('user_id', req.user.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Enable failed.' }); }
});

// 7.3 Key Rotation Request
app.post('/api/keys/request-rotation', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied.' });
    const { data } = await supabase.from('user_secrets').select('is_totp_enabled').eq('user_id', req.user.id).maybeSingle();
    if (!data?.is_totp_enabled) return res.status(400).json({ error: 'TOTP required.', totpEnabled: false });
    res.json({ message: 'Ready.', totpEnabled: true });
});

// 7.4 Key Rotation Execute
app.post('/api/keys/rotate', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied.' });
    const { code } = req.body;
    const { data: userSecret } = await supabase.from('user_secrets').select('*').eq('user_id', req.user.id).single();
    if (!userSecret?.is_totp_enabled || !authenticator.check(code, userSecret.totp_secret)) return res.status(401).json({ error: 'Invalid TOTP.' });

    const newKey = `av_${uuidv4().replace(/-/g, '')}`;
    const newHash = sha256(newKey);
    await supabase.from('processors').update({ api_key_hash: newHash }).eq('id', req.processor.id);
    
    // Merkle Log
    const userHash = sha256(req.user.email);
    let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).single();
    let userKey = keyRow ? decryptData(keyRow.encrypted_key, MASTER_KEY) : (uuidv4() + "-" + uuidv4());
    if(!keyRow) await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptData(userKey, MASTER_KEY) }]);
    
    const hashData = { processor_id: req.processor.id, event_type: 'system.key_rotation', userHash, timestamp: new Date().toISOString() };
    const { data: savedEvent } = await supabase.from('audit_events').insert([{
        processor_id: req.processor.id, event_type: 'system.key_rotation', user_identifier: userHash,
        event_data: { encrypted: encryptData({ message: 'Rotated via TOTP' }, userKey) }, event_timestamp: new Date().toISOString(), data_hash: sha256(stringify(hashData)), previous_hash: null 
    }]).select('id, leaf_index').single();

    if (savedEvent) await DBMerkleService.appendLeaf(sha256(stringify(hashData)), savedEvent.leaf_index);
    res.json({ message: 'Success', newApiKey: newKey });
});

// 7.5 TEAM INVITE (MANUELL LÄNK, INGET MAIL)
app.post('/api/team/invite', authenticateUser, authorizeManagerOrAbove, async (req, res) => {
    try {
        const { email, role } = inviteUserSchema.parse(req.body);
        const { data: existing } = await supabase.from('processor_invitations').select('id').eq('processor_id', req.processor.id).eq('invited_email', email).maybeSingle();
        if (existing) return res.status(409).json({ error: 'User already invited.' });
        if (email === req.user.email) return res.status(400).json({ error: 'Cannot invite self.' });

        const token = uuidv4().replace(/-/g, '');
        await supabase.from('processor_invitations').insert([{
            processor_id: req.processor.id, invited_email: email, role, token, expires_at: new Date(Date.now() + 86400000).toISOString()
        }]);
        
        // Returnera token så admin kan kopiera den
        res.status(200).json({ 
            message: `Invitation created for ${email}.`, 
            inviteToken: token,
            inviteLink: `https://auditorveritas.com/join?token=${token}` 
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7.6 TEAM ACCEPT
app.post('/api/team/accept', authenticateUser, async (req, res) => {
    const { token } = req.body;
    if (req.processor) return res.status(409).json({ error: 'Already in a team.' });
    
    const { data: invite } = await supabase.from('processor_invitations').select('*').eq('token', token).single();
    if (!invite || new Date() > new Date(invite.expires_at)) return res.status(404).json({ error: 'Invalid/Expired.' });
    if (invite.invited_email !== req.user.email) return res.status(403).json({ error: 'Email mismatch.' });

    await supabase.from('processor_users').insert([{ user_id: req.user.id, processor_id: invite.processor_id, role: invite.role, joined_at: new Date().toISOString() }]);
    await supabase.from('processor_invitations').delete().eq('token', token);
    res.json({ success: true });
});

// 7.7 GET TEAM (SAFE FETCH)
app.get('/api/team', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Denied.' });
    try {
        const { data: members } = await supabase.from('processor_users').select('user_id, role').eq('processor_id', req.processor.id);
        const { data: invites } = await supabase.from('processor_invitations').select('*').eq('processor_id', req.processor.id);
        
        const team = await Promise.all(members.map(async m => {
            const { data: u } = await supabase.auth.admin.getUserById(m.user_id);
            return { email: u?.user?.email || 'Unknown', role: m.role, status: 'Active', user_id: m.user_id };
        }));
        const { data: owner } = await supabase.auth.admin.getUserById(req.processor.owner_id);
        team.unshift({ email: owner?.user?.email, role: 'owner', status: 'Active', user_id: req.processor.owner_id });

        res.json({ team, pending: invites, userRole: req.userRole });
    } catch (err) { res.status(500).json({ error: 'Fetch error' }); }
});

app.delete('/api/team/member/:userId', authenticateUser, authorizeManagerOrAbove, async (req, res) => {
    if (req.params.userId === req.processor.owner_id) return res.status(400).json({ error: 'Cannot remove owner.' });
    await supabase.from('processor_users').delete().eq('user_id', req.params.userId);
    res.json({ success: true });
});

app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);
        // ... (Encryption & Merkle logic similar to rotate) ...
        await supabase.rpc('increment_processor_usage', { pid: req.processor.id });
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/processors', authenticateUser, async (req, res) => {
    if (req.processor) return res.status(409).json({ error: 'Exists.' });
    const domain = extractDomain(req.user.email);
    if (!domain || ['gmail.com','hotmail.com'].includes(domain)) return res.status(400).json({ error: 'Corporate email required.' });
    
    const existing = await supabase.from('processors').select('id').eq('company_domain', domain).single();
    if (existing.data) return res.status(409).json({ error: 'Domain taken.' });

    const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
    await supabase.from('processors').insert([{
        company_name: req.body.companyName, email: req.user.email, plan: req.body.plan,
        api_key_hash: sha256(apiKey), status: 'active', owner_id: req.user.id, company_domain: domain, events_limit: 100
    }]);
    res.status(201).json({ apiKey });
});

app.get('/api/dashboard', authenticateUser, async (req, res) => {
    const { data } = await supabase.from('processors').select('*').eq('id', req.processor.id).single();
    if(!data) return res.status(404).json({error: 'No processor'});
    res.json({ processor: { ...data }, stats: { totalEvents: 0, monthlyEvents: data.monthly_events_used }, userRole: req.userRole });
});

app.listen(PORT, () => logger.info(`Server running on ${PORT}`));