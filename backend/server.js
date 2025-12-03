// ============================================================
// AUDITOR VERITAS - ZERO TRUST BACKEND SERVER
// Version: 2.1.0 - Production Ready (Secure QR)
// ============================================================

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
import { authenticator } from 'otplib';
import QRCode from 'qrcode'; // NYTT: För säker lokal QR-generering

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !MASTER_KEY) {
  console.error('FATAL: Missing Credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

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
    else callback(new Error('CORS policy violation'));
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
      const parentIndex = Math.floor(currentIndex / 2);
      let parentHash;

      if (!siblingNode && !isRightNode) {
        parentHash = sha256(currentHash + currentHash);
      } else if (siblingNode) {
        const leftHash = isRightNode ? siblingNode.hash : currentHash;
        const rightHash = isRightNode ? currentHash : siblingNode.hash;
        parentHash = sha256(leftHash + rightHash);
      } else {
        break;
      }

      await supabase.from('merkle_nodes').upsert({ level: currentLevel + 1, node_index: parentIndex, hash: parentHash });
      currentLevel++;
      currentIndex = parentIndex;
      currentHash = parentHash;
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

const eventSubmissionSchema = z.object({
  event_type: z.string().min(1).max(64),
  user_identifier: z.string().min(1).max(256),
  event_data: z.record(z.any()),
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['reader', 'editor', 'admin']).default('reader'),
});

const privacyRequestSchema = z.object({
  user_identifier: z.string().min(1).max(256)
});

const totpCodeSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/)
});

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

    let { data: processor } = await supabase.from('processors').select('*').eq('owner_id', user.id).single();

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

const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== 'owner' && req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
};

const authenticateAny = async (req, res, next) => {
  if (req.headers['x-api-key']) return authenticateApiKey(req, res, next);
  if (req.headers['authorization']) return authenticateUser(req, res, next);
  return res.status(401).json({ error: 'Auth required' });
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '2.0.0' });
});

app.get('/api/system/audit', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    if (!req.processor) return res.status(403).json({ error: 'No processor' });
    const { data } = await supabase.from('admin_audit_logs').select('*').eq('processor_id', req.processor.id).order('created_at', { ascending: false }).limit(50);
    const logs = data ? data.map(l => ({
      timestamp: l.created_at,
      user: l.user_email,
      action: `${l.action} ${l.details ? JSON.stringify(l.details) : ''}`
    })) : [];
    res.json({ logs });
  } catch (err) { res.json({ logs: [] }); }
});

// --- KEY ROTATION & TOTP (SÄKER VERSION) ---
app.post('/api/keys/setup-2fa', authenticateUser, authorizeOwner, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor' });

  try {
    // 1. Generera hemlighet
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(req.user.email, 'AuditorVeritas', secret);
    const encryptedSecret = encryptData(secret, MASTER_KEY);

    // 2. Spara i DB
    await supabase.from('processors').update({ totp_secret: encryptedSecret }).eq('id', req.processor.id);

    // 3. Generera QR-bild lokalt (Skickar inte hemligheten till externt API)
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    await supabase.from('admin_audit_logs').insert([{
      processor_id: req.processor.id,
      user_email: req.user.email,
      action: 'TOTP_SETUP_INITIATED'
    }]);

    res.json({ 
        message: '2FA setup initiated', 
        secret, 
        otpAuthUrl: qrCodeDataUrl // Detta är nu en "data:image/png;base64..." sträng
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'TOTP setup failed' });
  }
});

app.post('/api/keys/rotate', authenticateUser, authorizeOwner, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor' });

  try {
    const { code } = totpCodeSchema.parse(req.body);

    const { data: proc } = await supabase.from('processors').select('totp_secret').eq('id', req.processor.id).single();

    if (!proc?.totp_secret) {
      return res.status(400).json({ error: '2FA not configured. Run setup-2fa first.', code: 'TOTP_NOT_CONFIGURED' });
    }

    const secret = decryptData(proc.totp_secret, MASTER_KEY);
    if (!secret) return res.status(500).json({ error: 'Security config error' });

    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      await supabase.from('admin_audit_logs').insert([{
        processor_id: req.processor.id,
        user_email: req.user.email,
        action: 'KEY_ROTATION_FAILED',
        details: { reason: 'Invalid TOTP code' }
      }]);
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const newHash = sha256(newApiKey);
    const rotationDate = new Date().toISOString();

    await supabase.from('processors').update({ api_key_hash: newHash, last_rotation_date: rotationDate }).eq('id', req.processor.id);

    await supabase.from('admin_audit_logs').insert([{
      processor_id: req.processor.id,
      user_email: req.user.email,
      action: 'KEY_ROTATION_SUCCESS'
    }]);

    res.json({ message: 'Key rotated successfully', newApiKey, rotatedAt: rotationDate });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid code format' });
    logger.error(err);
    res.status(500).json({ error: 'Rotation failed' });
  }
});

app.post('/api/keys/request-rotation', authenticateUser, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor' });

  try {
    const { data: proc } = await supabase.from('processors').select('totp_secret').eq('id', req.processor.id).single();

    if (proc?.totp_secret) {
      return res.json({ message: '2FA configured. Use authenticator code.', step: 'verify', totpConfigured: true });
    }

    // Om ingen 2FA finns än, låt dem initiera det
    res.json({ message: 'Setup 2FA required', step: 'setup', totpConfigured: false });
  } catch (err) { res.status(500).json({ error: 'Verification error' }); }
});

// TEAM ROUTES
app.post('/api/team/invite', authenticateUser, authorizeOwner, async (req, res) => {
  try {
    const validated = inviteUserSchema.parse(req.body);
    const inviteToken = uuidv4().replace(/-/g, '');

    await supabase.from('processor_invitations').insert([{
      processor_id: req.processor.id,
      invited_email: validated.email,
      role: validated.role,
      token: inviteToken,
      expires_at: new Date(Date.now() + 86400000).toISOString()
    }]);

    const inviteLink = `https://auditorveritas.com/join?token=${inviteToken}`;
    res.status(200).json({ message: 'Invitation created', link: inviteLink });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/team/accept', authenticateUser, async (req, res) => {
  const { token } = req.body;
  try {
    if (req.processor) return res.status(409).json({ error: 'Already in a team' });
    const { data: invite } = await supabase.from('processor_invitations').select('*').eq('token', token).single();
    if (!invite) return res.status(404).json({ error: 'Invalid token' });
    if (invite.invited_email !== req.user.email) return res.status(403).json({ error: 'Email mismatch' });

    await supabase.from('processor_users').insert([{ user_id: req.user.id, processor_id: invite.processor_id, role: invite.role }]);
    await supabase.from('processor_invitations').delete().eq('token', token);
    res.json({ success: true, message: 'Joined team' });
  } catch (err) { res.status(500).json({ error: 'Join failed' }); }
});

app.get('/api/team', authenticateUser, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'Denied' });
  try {
    const { data: members } = await supabase.from('processor_users').select('user_id, role').eq('processor_id', req.processor.id);
    const { data: invites } = await supabase.from('processor_invitations').select('*').eq('processor_id', req.processor.id);

    const activeTeam = await Promise.all((members || []).map(async m => {
      const { data: u } = await supabase.auth.admin.getUserById(m.user_id);
      return { email: u?.user?.email || 'Unknown', role: m.role, status: 'Active', user_id: m.user_id };
    }));

    const { data: owner } = await supabase.auth.admin.getUserById(req.processor.owner_id);
    activeTeam.unshift({ email: owner?.user?.email, role: 'owner', status: 'Active', user_id: req.processor.owner_id });

    res.json({ team: activeTeam, pending: invites || [] });
  } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
});

app.delete('/api/team/member/:userId', authenticateUser, authorizeOwner, async (req, res) => {
  try {
    if (req.params.userId === req.processor.owner_id) return res.status(400).json({ error: 'Cannot remove owner' });
    await supabase.from('processor_users').delete().eq('processor_id', req.processor.id).eq('user_id', req.params.userId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// EVENT LOGGING
app.post('/api/events', authenticateAny, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor associated', code: 'NO_PROCESSOR' });

  try {
    const { event_type, user_identifier, event_data } = eventSubmissionSchema.parse(req.body);
    const userHash = sha256(user_identifier);

    let { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).maybeSingle();
    let userKey;

    if (!keyRow) {
      userKey = uuidv4() + "-" + uuidv4();
      await supabase.from('encryption_keys').insert([{ user_identifier_hash: userHash, encrypted_key: encryptData(userKey, MASTER_KEY) }]);
    } else {
      userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);
    }

    if (!userKey) throw new Error("Encryption Failure");

    const encryptedPayload = encryptData(event_data, userKey);
    const data_hash = sha256(stringify({ pid: req.processor.id, type: event_type, uid: userHash, ts: new Date().toISOString() }));

    const { data: savedEvent } = await supabase.from('audit_events').insert([{
      processor_id: req.processor.id,
      event_type,
      user_identifier: userHash,
      event_data: { encrypted: encryptedPayload },
      event_timestamp: new Date().toISOString(),
      data_hash,
      leaf_index: 0
    }]).select().single();

    if (savedEvent) await DBMerkleService.appendLeaf(data_hash, savedEvent.leaf_index || 0);
    try { await supabase.rpc('increment_processor_usage', { pid: req.processor.id }); } catch (e) {}

    res.status(201).json({ success: true, hash: data_hash });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid event data' });
    res.status(500).json({ error: err.message });
  }
});

// PRIVACY & EXPORT
app.delete('/api/privacy/forget', authenticateApiKey, async (req, res) => {
  try {
    const { user_identifier } = privacyRequestSchema.parse(req.body);
    const userHash = sha256(user_identifier);

    const { data: keyRow } = await supabase.from('encryption_keys').select('id').eq('user_identifier_hash', userHash).maybeSingle();
    if (!keyRow) return res.status(404).json({ error: 'User not found or already forgotten' });

    const { error } = await supabase.from('encryption_keys').delete().eq('user_identifier_hash', userHash);
    if (error) throw error;

    const data_hash = sha256(`ERASED-${userHash}-${Date.now()}`);
    await supabase.from('audit_events').insert([{
      processor_id: req.processor.id,
      event_type: 'gdpr.right_to_erasure',
      user_identifier: userHash,
      event_data: { status: 'KEYS_DESTROYED', method: 'crypto_shredding' },
      event_timestamp: new Date().toISOString(),
      data_hash,
      leaf_index: 0
    }]);

    res.json({ success: true, message: 'User keys destroyed. Data cryptographically unreadable.', gdpr_article: '17' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erasure failed' });
  }
});

app.post('/api/privacy/export', authenticateApiKey, async (req, res) => {
  try {
    const { user_identifier } = privacyRequestSchema.parse(req.body);
    const userHash = sha256(user_identifier);

    const { data: keyRow } = await supabase.from('encryption_keys').select('encrypted_key').eq('user_identifier_hash', userHash).maybeSingle();
    if (!keyRow) return res.status(404).json({ error: 'User not found' });

    const userKey = decryptData(keyRow.encrypted_key, MASTER_KEY);
    if (!userKey) return res.status(500).json({ error: 'Key corruption' });

    const { data: events } = await supabase.from('audit_events')
      .select('*')
      .eq('processor_id', req.processor.id)
      .eq('user_identifier', userHash)
      .order('event_timestamp', { ascending: true });

    const exportedData = (events || []).map(ev => {
      let decryptedPayload = null;
      if (ev.event_data?.encrypted) {
        decryptedPayload = decryptData(ev.event_data.encrypted, userKey);
      }
      return { timestamp: ev.event_timestamp, type: ev.event_type, hash: ev.data_hash, data: decryptedPayload || 'DECRYPTION_FAILED' };
    });

    res.json({ user: user_identifier, record_count: exportedData.length, generated_at: new Date().toISOString(), records: exportedData, gdpr_article: '15' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// ADMIN/PROCESSOR MGMT
app.post('/api/processors', authenticateUser, async (req, res) => {
  const { companyName, plan } = req.body;
  if (req.processor) return res.status(409).json({ error: 'User has processor' });

  const domain = extractDomain(req.user.email);
  const blockedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'protonmail.com'];

  if (!domain || blockedDomains.includes(domain)) {
    return res.status(400).json({ error: 'Corporate email required', code: 'CORPORATE_EMAIL_REQUIRED' });
  }

  const apiKey = `av_${uuidv4().replace(/-/g, '')}`;

  const { data: newProcessor, error } = await supabase.from('processors').insert([{
    company_name: companyName,
    email: null,
    plan: plan || 'standard',
    api_key_hash: sha256(apiKey),
    status: 'active',
    owner_id: req.user.id,
    company_domain: domain,
    events_limit: 1000,
    tier: 'standard',
    region: 'eu-west'
  }]).select().single();

  if (error) { logger.error(error); return res.status(500).json({ error: 'DB Insert Failed' }); }
  res.status(201).json({ apiKey, processorId: newProcessor.id });
});

app.get('/api/dashboard', authenticateUser, async (req, res) => {
  if (!req.processor) return res.status(404).json({ error: 'Processor not found', code: 'NO_PROCESSOR' });

  try {
    const { data, error } = await supabase.from('processors').select('*').eq('id', req.processor.id).single();
    if (error || !data) return res.status(404).json({ error: 'Processor data unavailable' });

    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);

    res.json({
      processor: {
        id: data.id,
        company_name: data.company_name,
        monthly_events_limit: data.events_limit,
        monthly_events_used: data.monthly_events_used || 0,
        plan: data.plan,
        tier: data.tier,
        region: data.region,
        owner_id: data.owner_id,
        last_rotation_date: data.last_rotation_date,
        totp_configured: !!data.totp_secret // Boolean flag till frontend
      },
      stats: { totalEvents: count || 0, monthlyEvents: data.monthly_events_used || 0, eventsLimit: data.events_limit },
      userRole: req.userRole
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Dashboard error' });
  }
});

app.get('/api/events/search', authenticateAny, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'Denied' });
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const { data } = await supabase.from('audit_events').select('*').eq('processor_id', req.processor.id).order('event_timestamp', { ascending: false }).limit(limit);
  res.json({ events: data || [] });
});

app.get('/api/merkle/proof/:eventId', authenticateAny, async (req, res) => {
  if (!req.processor) return res.status(403).json({ error: 'No processor' });

  try {
    const { data: event } = await supabase.from('audit_events').select('*').eq('id', req.params.eventId).eq('processor_id', req.processor.id).single();
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { count: totalLeaves } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', req.processor.id);
    const proof = await DBMerkleService.getProof(event.leaf_index || 0, totalLeaves || 1);

    res.json({ event_id: event.id, data_hash: event.data_hash, proof: proof.proof, merkle_root: proof.root });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Proof failed' });
  }
});

app.listen(PORT, () => {
  logger.info(`SERVER RUNNING ON PORT ${PORT}`);
  logger.info(`Zero Trust Security: ENABLED`);
});

export default app;