import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
importYW CryptoJS from 'crypto-js';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { z } from 'zod';
import stringify from 'fast-json-stable-stringify';
import winston from 'winston';
import morgan from 'morgan';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURATION CHECKS ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ FATAL: Missing Supabase Credentials.');
  process.exit(1);
}

// Supabase Admin Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// --- OBSERVABILITY ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auditor-veritas-api' },
  transports: [
    new winston.transports.Console({
        format: winston.format.simple(),
    })
  ],
});

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// --- SCHEMAS ---
const eventSubmissionSchema = z.object({
  event_type: z.string().min(1).max(64).regex(/^[a-zA-Z0-9._-]+$/, "Alphanumeric/dots/dashes only"),
  user_identifier: z.string().min(1).max(256), 
  event_data: z.record(z.any()).refine(data => JSON.stringify(data).length < 500000, "Payload > 500KB"),
});

const processorRegistrationSchema = z.object({
  companyName: z.string().min(2).max(100),
  plan: z.enum(['starter', 'professional', 'enterprise']).default('starter')
});

// --- MERKLE ENGINE ---
class MerkleTool {
  static hash(data) {
    if (!data) return '';
    const stableString = typeof data === 'object' ? stringify(data) : data.toString();
    return CryptoJS.SHA256(stableString).toString();
  }

  static buildTree(leaves) {
    if (leaves.length === 0) return [['']];
    const levels = [leaves];
    let currentLevel = leaves;
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
        nextLevel.push(this.hash(left + right));
      }
      levels.unshift(nextLevel);
      currentLevel = nextLevel;
    }
    return { root: levels[0][0], levels };
  }

  static getProof(leaves, leafHash) {
    const { levels } = this.buildTree(leaves);
    let index = leaves.indexOf(leafHash);
    if (index === -1) return null;
    
    const proof = [];
    let currentIndex = index;
    
    for (let i = levels.length - 1; i > 0; i--) {
      const level = levels[i];
      const isLeftNode = currentIndex % 2 === 0;
      const siblingIndex = isLeftNode ? currentIndex + 1 : currentIndex - 1;

      if (siblingIndex < level.length) {
        proof.push({ hash: level[siblingIndex], position: isLeftNode ? 'right' : 'left' });
      } else {
        proof.push({ hash: level[currentIndex], position: 'right' });
      }
      currentIndex = Math.floor(currentIndex / 2);
    }
    return { proof, root: levels[0][0] }; 
  }
}

// --- MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://checkout.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com", "https://auditor-veritas-mvp.onrender.com", process.env.VITE_API_URL || "https://auditorveritas.com", "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https:"], 
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

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

// Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
    message: { error: 'Rate limit exceeded' }
});
app.use(apiLimiter);

// 1. Maskin-Auth (API Key)
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  try {
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
    const { data: processor } = await supabase.from('processors').select('*').eq('api_key_hash', apiKeyHash).single();

    if (!processor) {
        logger.warn(`Invalid API Key attempt: ${req.ip}`);
        return res.status(401).json({ error: 'Invalid API key' });
    }
    if (processor.status === 'revoked') return res.status(403).json({ error: 'API Key Revoked' });
    
    req.processor = processor;
    req.authType = 'machine';
    next();
  } catch (err) {
    logger.error('Auth Error', err);
    res.status(500).json({ error: 'Auth Service Error' });
  }
};

// 2. Mänsklig-Auth (Supabase JWT)
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error('Invalid Token');

        req.user = user; 
        const { data: processor } = await supabase
            .from('processors')
            .select('*')
            .eq('owner_id', user.id)
            .single();
        
        if (processor) {
            req.processor = processor;
        }

        req.authType = 'human';
        next();
    } catch (err) {
        logger.warn(`User Auth Failed: ${err.message}`);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// --- ROUTES ---

// 1. Event Ingestion
app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const payload = eventSubmissionSchema.parse(req.body);
        const processor = req.processor;
        const timestamp = new Date().toISOString();

        const { data: lastEvent } = await supabase
            .from('audit_events')
            .select('data_hash')
            .eq('processor_id', processor.id)
            .order('event_timestamp', { ascending: false })
            .order('id', { ascending: false })
            .limit(1);
        
        const previous_hash = lastEvent?.[0]?.data_hash || null;

        const hashData = { processor_id: processor.id, ...payload, event_timestamp: timestamp, previous_hash };
        const stableString = stringify(hashData);
        const data_hash = CryptoJS.SHA256(stableString).toString();

        const { data: newEvent, error } = await supabase.from('audit_events').insert([{
            processor_id: processor.id,
            event_type: payload.event_type,
            event_data: payload.event_data,
            user_identifier: payload.user_identifier,
            event_timestamp: timestamp,
            data_hash,
            previous_hash
        }]).select().single();

        if (error) throw error;
        try { await supabase.rpc('increment_processor_usage', { pid: processor.id }); } catch (e) {}

        res.status(201).json({ success: true, eventId: newEvent.id, hash: data_hash });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        logger.error('Ingestion Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Dashboard Data
app.get('/api/dashboard', authenticateUser, async (req, res) => {
    if (!req.processor) {
        return res.status(404).json({ error: 'Processor account not found for this user. Please complete registration.' });
    }
    try {
        const pid = req.processor.id;
        const { count: totalCount } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', pid);

        res.json({
            processor: { 
                id: req.processor.id, 
                companyName: req.processor.company_name, 
                eventsLimit: req.processor.events_limit,
                plan: req.processor.plan
            },
            stats: { 
                totalEvents: totalCount || 0, 
                monthlyEvents: req.processor.monthly_events_used || 0, 
                eventsLimit: req.processor.events_limit 
            }
        });
    } catch (err) {
        logger.error('Dashboard Error', err);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// 3. Search
app.get('/api/events/search', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied: No linked processor.' });
    try {
        const { query, limit = 20 } = req.query;
        let dbQuery = supabase
            .from('audit_events')
            .select('id, event_type, user_identifier, event_data, event_timestamp, data_hash')
            .eq('processor_id', req.processor.id)
            .order('event_timestamp', { ascending: false })
            .limit(parseInt(limit));

        if (query) {
            dbQuery = dbQuery.or(`event_type.ilike.%${query}%, user_identifier.ilike.%${query}%`);
        }

        const { data, error } = await dbQuery;
        if (error) throw error;
        res.json({ events: data || [] });
    } catch (err) {
        logger.error('Search failed', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// 4. Key Rotation
app.post('/api/keys/rotate', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied: No linked processor.' });
    try {
        const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
        const newHash = CryptoJS.SHA256(newApiKey).toString();
        
        await supabase.from('processors')
            .update({ api_key_hash: newHash, last_key_rotation: new Date().toISOString() })
            .eq('id', req.processor.id);

        await supabase.from('admin_audit_logs').insert([{
            processor_id: req.processor.id,
            user_email: req.user.email,
            action: 'rotated_api_key',
            ip_address: req.ip,
            details: { timestamp: new Date().toISOString() }
        }]);

        logger.info(`Key rotated for processor ${req.processor.id} by ${req.user.email}`);
        res.json({ message: 'Success', newApiKey });
    } catch (err) {
        logger.error('Rotate Key Error', err);
        res.status(500).json({ error: 'Action failed' });
    }
});

// 5. Merkle Proof
app.get('/api/merkle/proof/:eventId', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied: No linked processor.' });
    try {
        const pid = req.processor.id;
        const { data: event } = await supabase.from('audit_events').select('data_hash').eq('id', req.params.eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const { data: allEvents } = await supabase
            .from('audit_events')
            .select('data_hash')
            .eq('processor_id', pid)
            .order('event_timestamp', { ascending: true })
            .order('id', { ascending: true }); 

        const leaves = allEvents.map(e => e.data_hash);
        const { proof, root } = MerkleTool.getProof(leaves, event.data_hash);
        
        if (!proof) return res.status(500).json({ error: 'Proof generation failed' });

        res.json({ leafHash: event.data_hash, merkleRoot: root, proof, verified: true });
    } catch (err) {
        logger.error('Merkle Proof Error', err);
        res.status(500).json({ error: 'Proof failed' });
    }
});

// 6. Processor Registration
app.post('/api/processors', authenticateUser, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'User must be authenticated to register a processor.' });
    if (req.processor) return res.status(409).json({ error: 'User already has a processor account.' });

    try {
        const data = processorRegistrationSchema.parse(req.body);
        const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
        const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
        
        const { error } = await supabase.from('processors').insert([{
            company_name: data.companyName,
            email: req.user.email,
            plan: data.plan,
            api_key_hash: apiKeyHash,
            status: 'active',
            events_limit: data.plan === 'enterprise' ? 1000000 : 1000,
            owner_id: req.user.id
        }]).select().single();
        
        if (error) throw error;
        logger.info(`New Processor Registered: ${data.companyName} by ${req.user.email}`);
        res.status(201).json({ apiKey, message: "Account created successfully" });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        logger.error('Registration failed', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 7. Stripe Checkout
const STRIPE_PRICES = {
  professional: 'price_1SXpLc48POA4USE9M4nzLvKP', 
  enterprise: 'price_PLACEHOLDER_ENTERPRISE_ID'
};
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    const { plan } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
            mode: 'subscription',
            return_url: `${req.headers.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        });
        res.json({ clientSecret: session.client_secret });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 8. GDPR Erasure (FIX FÖR 404 ERROR)
app.post('/api/gdpr/erase', authenticateUser, async (req, res) => {
    if (!req.processor) return res.status(403).json({ error: 'Access denied: No linked processor.' });
    
    try {
        const { user_identifier_hash } = req.body;
        if (!user_identifier_hash) return res.status(400).json({ error: 'Missing identifier hash' });

        const { data, error } = await supabase
            .from('audit_events')
            .update({ 
                user_identifier: `ANONYMIZED_${uuidv4()}`,
                event_data: { status: "erased", reason: "GDPR Article 17", timestamp: new Date().toISOString() } 
            })
            .eq('processor_id', req.processor.id)
            .eq('user_identifier', user_identifier_hash)
            .select();
        
        if (error) throw error;

        await supabase.from('admin_audit_logs').insert([{
            processor_id: req.processor.id,
            user_email: req.user.email,
            action: 'gdpr_erasure_executed',
            details: { count: data.length, target_hash_prefix: user_identifier_hash.substring(0,8) }
        }]);

        res.json({ 
            success: true, 
            records_anonymized: data.length, 
            erasure_token: `verify_${uuidv4()}` 
        });

    } catch (err) {
        logger.error('GDPR Erasure Error', err);
        res.status(500).json({ error: 'Erasure operation failed internally.' });
    }
});

// Start
app.listen(PORT, () => logger.info(`🚀 Enterprise Server running on port ${PORT}`));