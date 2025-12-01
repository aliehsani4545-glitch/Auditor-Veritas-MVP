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

const inviteUserSchema = z.object({
    email: z.string().email(),
    role: z.enum(['reader', 'editor', 'admin']).default('reader'),
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
        
        // 1. Försök hitta som Ägare (Owner)
        let { data: processor } = await supabase.from('processors').select('*').eq('owner_id', user.id).single();
        
        // 2. Om inte ägare, försök hitta som Teammedlem
        if (!processor) {
            const { data: membership } = await supabase
                .from('processor_users')
                .select('processor_id, role')
                .eq('user_id', user.id)
                .single();
            
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
    if (req.userRole !== 'owner') {
        return res.status(403).json({ error: 'Forbidden. Only the Processor Owner can perform this action.' });
    }
    next();
};

const authenticateAny = async (req, res, next) => {
    if (req.headers['x-api-key']) return authenticateApiKey(req, res, next);
    if (req.headers['authorization']) return authenticateUser(req, res, next);
    return res.status(401).json({ error: 'Auth required' });
};

// --- 7. ROUTES ---

// --- KEY ROTATION ROUTES ---
app.post('/api/keys/request-rotation', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    
    try {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

        await supabase.from('processors').update({ 
                verification_code: verificationCode, 
                verification_expires: expiresAt 
            }).eq('id', req.processor.id);

        const { error } = await resend.emails.send({
            from: 'security@auditorveritas.com', 
            to: [req.user.email],
            subject: 'Security Alert: API Key Rotation Request',
            html: `<p>Your code: <strong>${verificationCode}</strong></p>`
        });

        if (error) { console.error(error); return res.status(500).json({ error: 'Email failed' }); }
        res.json({ message: 'Code sent', email: req.user.email });
    } catch (err) { res.status(500).json({ error: 'Internal verification error.' }); }
});

app.post('/api/keys/rotate', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Verification code missing' });

    try {
        const { data: proc } = await supabase.from('processors').select('*').eq('id', req.processor.id).single();
        if (!proc || proc.verification_code !== code) return res.status(400).json({ error: 'Invalid code.' });
        if (new Date() > new Date(proc.verification_expires)) return res.status(400).json({ error: 'Code expired.' });

        // Rotera
        const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
        const newHash = sha256(newApiKey);
        const rotationDate = new Date().toISOString();

        await supabase.from('processors').update({ 
            api_key_hash: newHash, verification_code: null, verification_expires: null, last_rotation_date: rotationDate 
        }).eq('id', req.processor.id);

        // LOGGA EVENTET
        const eventType = 'system.key_rotation';
        const userIdentifier = req.user.email;
        const userHash = sha256(userIdentifier);
        const eventData = { message: 'API Key Rotated via 2FA' };
        
        let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).single();
        let userKey;
        if (!keyRow) {
             userKey = uuidv4() + "-" + uuidv4(); 
             const encryptedUserKey = encryptData(userKey, MASTER_KEY);
             await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptedUserKey }]);
        } else {
             userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);
        }

        const encryptedPayload = encryptData(eventData, userKey);
        const { data: lastEvent } = await supabase.from('audit_events').select('data_hash, leaf_index').eq('processor_id', req.processor.id).order('leaf_index', { ascending: false }).limit(1).single();
        const previous_hash = lastEvent?.data_hash || null;
        const next_leaf_index = (lastEvent?.leaf_index !== undefined && lastEvent?.leaf_index !== null) ? lastEvent.leaf_index + 1 : 0;
        
        const hashData = { processor_id: req.processor.id, event_type: eventType, userHash, encryptedPayload, timestamp: rotationDate, previous_hash };
        const data_hash = sha256(stringify(hashData));

        const { data: savedEvent } = await supabase.from('audit_events').insert([{
            processor_id: req.processor.id, event_type: eventType, user_identifier: userHash,
            event_data: { encrypted: encryptedPayload }, event_timestamp: rotationDate, data_hash, previous_hash, leaf_index: next_leaf_index
        }]).select('id, leaf_index').single();

        if (savedEvent && savedEvent.leaf_index !== null) {
            await DBMerkleService.appendLeaf(data_hash, savedEvent.leaf_index);
        }

        res.json({ message: 'Success', newApiKey });
    } catch (err) { res.status(500).json({ error: 'Rotation failed.' }); }
});


// --- TEAM MANAGEMENT ROUTES ---

app.post('/api/team/invite', authenticateUser, authorizeOwner, async (req, res) => {
    const processorId = req.processor.id;
    
    try {
        const validated = inviteUserSchema.parse(req.body);

        const { data: existingInvite } = await supabase.from('processor_invitations')
             .select('id')
             .eq('processor_id', processorId)
             .eq('invited_email', validated.email)
             .maybeSingle();
        
        if (existingInvite) return res.status(409).json({ error: 'User already has a pending invitation.' });

        if (validated.email === req.user.email) return res.status(400).json({ error: 'You are already the owner.' });

        const inviteToken = uuidv4().replace(/-/g, '');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); 

        const { error: insertError } = await supabase.from('processor_invitations').insert([{
            processor_id: processorId,
            invited_email: validated.email,
            role: validated.role,
            token: inviteToken,
            expires_at: expiresAt
        }]);

        if (insertError) throw insertError;

        const inviteLink = `https://auditorveritas.com/join?token=${inviteToken}`;

        await resend.emails.send({
            from: 'team@auditorveritas.com', 
            to: [validated.email],
            subject: `You've been invited to join ${req.processor.company_name} on Auditor Veritas`,
            html: `<p>You have been invited by ${req.user.email} to join the team as a ${validated.role}. Click here to accept: <a href="${inviteLink}">${inviteLink}</a></p>`
        });
        
        res.status(200).json({ message: `Invitation sent to ${validated.email}.` });

    } catch (err) {
        logger.error('Invite Error', err);
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues.map(i => i.message).join(', ') });
        res.status(500).json({ error: err.message || 'Failed to send invitation.' });
    }
});


// Lista alla teammedlemmar och inbjudningar (UPPDATERAD FÖR FELSÖKNING)
app.get('/api/team', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied.' });
    const processorId = req.processor.id;

    try {
        // 1. Hämta aktiva medlemmar (Bara ID och Roll)
        const { data: members, error: membersError } = await supabase.from('processor_users')
            .select('user_id, role') 
            .eq('processor_id', processorId);

        // Loggar det exakta Supabase-felet för membersError om det finns
        if (membersError) {
            logger.error('Supabase Error (Members):', membersError); 
            throw new Error(`DB Error (Members): ${membersError.message}`);
        }

        // 2. Hämta inbjudningar
        const { data: invitations, error: invitesError } = await supabase.from('processor_invitations')
            .select('invited_email, role, expires_at')
            .eq('processor_id', processorId)
            .gte('expires_at', new Date().toISOString());

        // Loggar det exakta Supabase-felet för invitesError om det finns
        if (invitesError) {
            logger.error('Supabase Error (Invites):', invitesError); 
            throw new Error(`DB Error (Invites): ${invitesError.message}`);
        }

        // 3. Slå upp e-postadresser via Admin API
        const activeTeamWithEmails = await Promise.all(members.map(async (m) => {
            const { data: u, error: userError } = await supabase.auth.admin.getUserById(m.user_id);
            
            if (userError) {
                logger.error(`Error fetching user ${m.user_id}:`, userError);
                return { user_id: m.user_id, email: `User Error: ${userError.message.substring(0, 20)}`, role: m.role, status: 'Active' };
            }

            return {
                user_id: m.user_id,
                email: u?.user?.email || 'Deleted User',
                role: m.role,
                status: 'Active'
            };
        }));

        // 4. Hämta ägarens info
        const { data: ownerUser } = await supabase.auth.admin.getUserById(req.processor.owner_id);
        
        // 5. Kombinera lista
        const fullTeam = [{ 
            user_id: req.processor.owner_id, 
            email: ownerUser?.user?.email || 'Owner Missing', 
            role: 'owner', 
            status: 'Active' 
        }].concat(activeTeamWithEmails);

        // 6. Formatera inbjudningar
        const pending = invitations.map(i => ({
            email: i.invited_email,
            role: i.role,
            status: 'Pending',
            expires: i.expires_at
        }));

        res.json({ team: fullTeam, pending: pending, userRole: req.userRole });

    } catch (err) {
        // Här loggar vi det mer specifika felet, vilket nu ska vara något av våra kastade "DB Error"
        logger.error('Team List Final Catch Error', err); 
        res.status(500).json({ error: 'Failed to fetch team data.' });
    }
});

// Ta bort teammedlem (Inkluderar Merkle Loggning)
app.delete('/api/team/member/:userId', authenticateUser, authorizeOwner, async (req, res) => {
    const { userId } = req.params;
    
    if (userId === req.processor.owner_id) return res.status(400).json({ error: 'Cannot remove the owner.' });

    try {
        // 1. Ta bort från DB
        const { error: deleteError } = await supabase.from('processor_users')
            .delete()
            .eq('processor_id', req.processor.id)
            .eq('user_id', userId);

        if (deleteError) throw deleteError;
        
        // 2. Logga i Merkle Tree
        const timestamp = new Date().toISOString();
        const eventType = 'system.team_member_removed';
        const userIdentifier = req.user.email;
        const userHash = sha256(userIdentifier);
        const eventData = { removed_user_id: userId, action_by: req.user.email };
        
        let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).single();
        let userKey;
        if (!keyRow) {
            userKey = uuidv4() + "-" + uuidv4(); 
            const encryptedUserKey = encryptData(userKey, MASTER_KEY);
            await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptedUserKey }]);
        } else {
            userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);
        }

        const encryptedPayload = encryptData(eventData, userKey);
        const { data: lastEvent } = await supabase.from('audit_events').select('data_hash, leaf_index').eq('processor_id', req.processor.id).order('leaf_index', { ascending: false }).limit(1).single();
        const previous_hash = lastEvent?.data_hash || null;
        const next_leaf_index = (lastEvent?.leaf_index !== undefined && lastEvent?.leaf_index !== null) ? lastEvent.leaf_index + 1 : 0;
        
        const hashData = { processor_id: req.processor.id, event_type: eventType, userHash, encryptedPayload, timestamp, previous_hash };
        const data_hash = sha256(stringify(hashData));

        const { data: savedEvent } = await supabase.from('audit_events').insert([{
            processor_id: req.processor.id, event_type: eventType, user_identifier: userHash,
            event_data: { encrypted: encryptedPayload }, event_timestamp: timestamp, data_hash, previous_hash, leaf_index: next_leaf_index
        }]).select('id, leaf_index').single();

        if (savedEvent && savedEvent.leaf_index !== null) {
            await DBMerkleService.appendLeaf(data_hash, savedEvent.leaf_index);
        }

        res.json({ success: true, message: `User ${userId} removed.` });

    } catch (err) {
        logger.error('Removal Error', err);
        res.status(500).json({ error: err.message || 'Failed to remove team member.' });
    }
});


// INGESTION ENDPOINT
app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);
        const processor = req.processor;
        const timestamp = new Date().toISOString();
        const userHash = sha256(user_identifier);

        if (processor.plan === 'starter' && processor.monthly_events_used >= 100) {
            logger.warn(`Limit reached for ${processor.id}`);
            return res.status(403).json({ error: `Monthly limit reached (100 events). Usage: ${processor.monthly_events_used}` });
        }

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
        const { data: lastEvent } = await supabase.from('audit_events').select('data_hash, leaf_index').eq('processor_id', processor.id).order('leaf_index', { ascending: false }).limit(1).single();
        const previous_hash = lastEvent?.data_hash || null;
        const next_leaf_index = (lastEvent?.leaf_index !== undefined && lastEvent?.leaf_index !== null) ? lastEvent.leaf_index + 1 : 0;
        
        const hashData = { processor_id: processor.id, event_type, userHash, encryptedPayload, timestamp, previous_hash };
        const data_hash = sha256(stringify(hashData));

        const { data: savedEvent } = await supabase.from('audit_events').insert([{
            processor_id: processor.id, event_type, user_identifier: userHash,
            event_data: { encrypted: encryptedPayload }, event_timestamp: timestamp, data_hash, previous_hash, leaf_index: next_leaf_index
        }]).select('id, leaf_index').single();

        if (savedEvent && savedEvent.leaf_index !== null) {
            await DBMerkleService.appendLeaf(data_hash, savedEvent.leaf_index);
        }

        try { await supabase.rpc('increment_processor_usage', { pid: processor.id }); } catch (e) {logger.error('RPC Error', e);} 
        res.status(201).json({ success: true, eventId: savedEvent.id, hash: data_hash });

    } catch (err) {
        logger.error('Ingestion Error', err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
});

// PROCESSOR CREATION
app.post('/api/processors', authenticateUser, async (req, res) => {
    const { companyName, plan } = req.body;
    
    if (req.processor) return res.status(409).json({ error: 'User already belongs to a processor node.' });
    
    const domain = extractDomain(req.user.email);
    if (!domain || domain === 'gmail.com' || domain === 'hotmail.com') { 
        return res.status(400).json({ error: 'Cannot determine valid corporate domain from user email. Registration failed on server side.' });
    }

    const { data: existing } = await supabase.from('processors').select('id').eq('company_domain', domain).single();
    if (existing) {
        return res.status(409).json({ error: `Domain ${domain} is already claimed by another processor. Contact support to merge.` });
    }

    const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const apiKeyHash = sha256(apiKey);
    
    const { error: insertError } = await supabase.from('processors').insert([{
        company_name: companyName, 
        email: req.user.email, 
        plan, 
        api_key_hash: apiKeyHash, 
        status: 'active', 
        owner_id: req.user.id,
        company_domain: domain,
        events_limit: 100
    }]);
    
    if (insertError) {
        logger.error('Processor Insert Error', insertError);
        return res.status(500).json({ error: 'Failed to create processor.' });
    }

    res.status(201).json({ apiKey });
});

// --- ÖVRIGA ROUTES ---
app.post('/api/gdpr/erase', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied.' });
    try {
        const { user_identifier_hash } = req.body;
        await supabase.from('encryption_keys').delete().eq('user_identifier_hash', user_identifier_hash);
        await supabase.from('admin_audit_logs').insert([{
            processor_id: req.processor.id, user_email: req.user?.email || 'api_system',
            action: 'CRYPTO_SHRED_EXECUTED', details: { target: user_identifier_hash }
        }]);
        res.json({ success: true, message: "Encryption key destroyed." });
    } catch (err) { res.status(500).json({ error: 'Erasure failed' }); }
});

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

app.get('/api/merkle/proof/:eventId', authenticateAny, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied' });
    const { data: targetEvent } = await supabase.from('audit_events').select('data_hash, leaf_index').eq('id', req.params.eventId).single();
    if(!targetEvent) return res.status(404).json({error: 'Event not found'});
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    const { proof, root } = await DBMerkleService.getProof(targetEvent.leaf_index, count);
    res.json({ leafHash: targetEvent.data_hash, merkleRoot: root, proof: proof, verified: true });
});

app.get('/api/dashboard', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(404).json({ error: 'Processor not found' });
    
    const { data: processorData, error } = await supabase
        .from('processors')
        .select('id, company_name, events_limit, plan, monthly_events_used, last_rotation_date, owner_id')
        .eq('id', req.processor.id)
        .single();

    if (error || !processorData) {
        console.error("Dashboard Error:", error);
        return res.status(404).json({ error: 'Processor data fetch failed' });
    }

    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    res.json({
        processor: { 
            id: processorData.id, 
            companyName: processorData.company_name, 
            eventsLimit: processorData.events_limit, 
            plan: processorData.plan,
            owner_id: processorData.owner_id, 
            lastRotationDate: processorData.last_rotation_date 
        },
        stats: { totalEvents: count || 0, monthlyEvents: processorData.monthly_events_used || 0, eventsLimit: processorData.events_limit },
        userRole: req.userRole 
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

app.listen(PORT, () => logger.info(`🚀 SERVER RUNNING ON ${PORT}`));