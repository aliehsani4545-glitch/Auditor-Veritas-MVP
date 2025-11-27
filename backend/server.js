// server.js (FIXAD: Inkluderar nu import av 'z' från 'zod')

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { z } from 'zod'; // <--- DENNA RAD SAKNADES!

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// --- KONSTANTER ---
const NETLIFY_DOMAIN = 'https://dreamy-banoffee-1603b3.netlify.app';
const RENDER_DOMAIN = 'https://auditor-veritas-mvp.onrender.com';
const PRIMARY_FRONTEND_DOMAIN = 'https://auditorveritas.com'; 
const FRONTEND_URL = process.env.VITE_API_URL || PRIMARY_FRONTEND_DOMAIN;

// --- SUPABASE CHECK ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ FATAL: Missing Supabase Credentials.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// --- SCHEMAS ---
const eventSubmissionSchema = z.object({
  event_type: z.string().min(1).max(64),
  user_identifier: z.string().min(1).max(256),
  event_data: z.any(), // Allows any JSON object
});

const processorRegistrationSchema = z.object({
  companyName: z.string().min(2).max(100),
  email: z.string().email(),
  plan: z.enum(['starter', 'professional', 'enterprise']).default('starter')
});

const STRIPE_PRICES = {
  professional: 'price_1SXpLc48POA4USE9M4nzLvKP', 
  enterprise: 'price_PLACEHOLDER_ENTERPRISE_ID'
};

// --- MERKLE TREE ---
class MerkleTree {
  constructor(leaves = []) {
    this.leaves = leaves.map(leaf => leaf.data_hash ? leaf.data_hash : this.hash(leaf));
    this.levels = this.buildTree(this.leaves);
    this.root = this.levels.length > 0 ? this.levels[0][0] : '';
  }

  hash(data) {
    if (typeof data === 'object' && data !== null) {
      const sortedKeys = Object.keys(data).sort();
      const sortedObj = sortedKeys.reduce((acc, key) => ({ ...acc, [key]: data[key] }), {});
      data = JSON.stringify(sortedObj);
    }
    return CryptoJS.SHA256(data.toString()).toString();
  }

  buildTree(leaves) {
    if (leaves.length === 0) return [['']];
    const levels = [leaves];
    let currentLevel = leaves;
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
        const combined = left + right;
        nextLevel.push(this.hash(combined));
      }
      levels.unshift(nextLevel);
      currentLevel = nextLevel;
    }
    return levels;
  }

  getProof(leafHash) {
    let index = this.leaves.indexOf(leafHash);
    if (index === -1) return null;
    const proof = [];
    let currentIndex = index;
    for (let i = this.levels.length - 1; i > 0; i--) {
      const level = this.levels[i];
      const isRightNode = currentIndex % 2 === 0;
      const siblingIndex = isRightNode ? currentIndex + 1 : currentIndex - 1;
      if (siblingIndex < level.length) {
        proof.push({
          hash: level[siblingIndex],
          position: isRightNode ? 'right' : 'left'
        });
      }
      currentIndex = Math.floor(currentIndex / 2);
    }
    return proof;
  }

  verifyProof(leafHash, proof, root) {
    let computedHash = leafHash;
    for (const node of proof) {
      computedHash = node.position === 'left' 
        ? this.hash(node.hash + computedHash) 
        : this.hash(computedHash + node.hash);
    }
    return computedHash === root;
  }

  addLeaf(leafObj) {
    const leafHash = leafObj.data_hash; 
    this.leaves.push(leafHash);
    this.levels = this.buildTree(this.leaves);
    this.root = this.levels[0][0];
    return leafHash;
  }

  getTreeSummary() {
    return { root: this.root, leafCount: this.leaves.length, levels: this.levels.length };
  }
}

const merkleTrees = new Map();

async function initializeMerkleTrees() {
  console.log('🔄 Initializing Integrity Engine...');
  try {
    const { data: processors } = await supabase.from('processors').select('id');
    if (!processors) return;

    for (const processor of processors) {
      const treeId = `processor_${processor.id}`;
      const { data: events } = await supabase
        .from('audit_events')
        .select('id, data_hash, event_timestamp') 
        .eq('processor_id', processor.id)
        .order('event_timestamp', { ascending: true })
        .order('id', { ascending: true });

      if (events && events.length > 0) {
        const tree = new MerkleTree(events);
        merkleTrees.set(treeId, tree);
      }
    }
    console.log(`✅ Loaded Merkle Trees for ${processors.length} processors.`);
  } catch (error) {
    console.error('❌ Error initializing trees:', error);
  }
}

// --- MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://js.stripe.com"], 
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://checkout.stripe.com"],
      childSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com", RENDER_DOMAIN, PRIMARY_FRONTEND_DOMAIN],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://*.stripe.com"], 
    },
  } : false,
  crossOriginEmbedderPolicy: false
}));

const ALLOWED_ORIGINS = [
    PRIMARY_FRONTEND_DOMAIN, 
    NETLIFY_DOMAIN,
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests.', code: 'RATE_LIMIT_EXCEEDED' }
});
app.use(limiter);

// Auth Middleware
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  try {
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
    const { data: processor } = await supabase.from('processors').select('*').eq('api_key_hash', apiKeyHash).single();

    if (!processor) return res.status(401).json({ error: 'Invalid API key' });
    if (processor.status === 'revoked') return res.status(403).json({ error: 'API Key Revoked' });
    
    req.processor = processor;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth Service Error' });
  }
};

// --- ROUTES ---

// 1. Event Ingestion (FIXED 500 ERROR logic)
app.post('/api/events', authenticateApiKey, async (req, res) => {
    try {
        const payload = eventSubmissionSchema.parse(req.body);
        const processor = req.processor;
        const timestamp = new Date().toISOString();

        // Get Previous Hash
        const { data: lastEvent } = await supabase
            .from('audit_events')
            .select('data_hash')
            .eq('processor_id', processor.id)
            .order('event_timestamp', { ascending: false })
            .order('id', { ascending: false })
            .limit(1);
        
        const previous_hash = lastEvent?.[0]?.data_hash || null;

        const hashData = { 
            processor_id: processor.id, 
            ...payload, 
            event_timestamp: timestamp, 
            previous_hash 
        };
        // Hash the entire object
        const data_hash = CryptoJS.SHA256(JSON.stringify(hashData)).toString();

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

        // Update In-Memory Tree
        const treeId = `processor_${processor.id}`;
        if (!merkleTrees.has(treeId)) merkleTrees.set(treeId, new MerkleTree());
        merkleTrees.get(treeId).addLeaf({ data_hash }); 

        // FIX: Run stats update in separate try-catch
        try {
           // await supabase.rpc('increment_processor_usage', { pid: processor.id }); 
           // Fallback update if RPC is missing:
           const { data: curr } = await supabase.from('processors').select('monthly_events_used').eq('id', processor.id).single();
           await supabase.from('processors').update({ monthly_events_used: (curr?.monthly_events_used || 0) + 1 }).eq('id', processor.id);
        } catch (statsError) {
           console.warn("Stats update failed, but event saved:", statsError);
        }

        res.status(201).json({ success: true, eventId: newEvent.id, hash: data_hash });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: err.errors });
        console.error("Event Error:", err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// 2. Dashboard Stats
app.get('/api/dashboard', authenticateApiKey, async (req, res) => {
    try {
        const pid = req.processor.id;
        const { count: totalCount } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', pid);
        
        res.json({
            processor: { 
                id: req.processor.id, 
                companyName: req.processor.company_name, 
                eventsLimit: req.processor.events_limit 
            },
            stats: { 
                totalEvents: totalCount || 0, 
                monthlyEvents: req.processor.monthly_events_used || 0, 
                eventsLimit: req.processor.events_limit 
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Dashboard Data Failed' });
    }
});

// 3. Search
app.get('/api/events/search', authenticateApiKey, async (req, res) => {
    try {
        const { query, limit = 20 } = req.query;
        let dbQuery = supabase
            .from('audit_events')
            .select('*')
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
        res.status(500).json({ error: 'Search failed' });
    }
});

// 4. Merkle Proof (FIXED logic)
app.get('/api/merkle/proof/:eventId', authenticateApiKey, async (req, res) => {
    const tree = merkleTrees.get(`processor_${req.processor.id}`);
    if (!tree) return res.status(404).json({ error: 'Integrity Engine not ready' });

    const { data: event } = await supabase.from('audit_events').select('data_hash').eq('id', req.params.eventId).single();
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const leafHash = event.data_hash;
    const proof = tree.getProof(leafHash);
    
    if (!proof) {
        await initializeMerkleTrees();
        const retryProof = merkleTrees.get(`processor_${req.processor.id}`).getProof(leafHash);
        if (!retryProof) return res.status(500).json({ error: 'Tree sync error. Please try again.' });
    }

    res.json({
        leafHash,
        merkleRoot: tree.root,
        proof: proof || [],
        verified: tree.verifyProof(leafHash, proof || [], tree.root)
    });
});

// 5. Key Rotation
app.post('/api/keys/rotate', authenticateApiKey, async (req, res) => {
    const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const newHash = CryptoJS.SHA256(newApiKey).toString();
    await supabase.from('processors').update({ api_key_hash: newHash }).eq('id', req.processor.id);
    res.json({ message: 'Success', newApiKey });
});

app.post('/api/keys/revoke', authenticateApiKey, async (req, res) => {
    await supabase.from('processors').update({ status: 'revoked' }).eq('id', req.processor.id);
    res.json({ success: true });
});

// 6. GDPR Erasure (FIXED)
app.post('/api/gdpr/erase', authenticateApiKey, async (req, res) => {
    const { user_identifier_hash } = req.body;
    if (!user_identifier_hash) return res.status(400).json({ error: 'Identifier hash required' });

    const erasureToken = `ERASED_${uuidv4().slice(0,8)}`;

    const { error, count } = await supabase
        .from('audit_events')
        .update({ 
            user_identifier: erasureToken,
            event_data: { erased: true, date: new Date().toISOString() } 
        })
        .eq('processor_id', req.processor.id)
        .eq('user_identifier', user_identifier_hash)
        .select('id', { count: 'exact' });

    if (error) return res.status(500).json({ error: 'Erasure failed', details: error.message });

    res.json({ success: true, records_anonymized: count, erasure_token: erasureToken });
});

// 7. Stripe & Registration
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

app.get('/api/stripe/session-status', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.json({ status: session.status, customer_email: session.customer_details?.email });
});

app.post('/api/processors', async (req, res) => {
    try {
        const data = processorRegistrationSchema.parse(req.body);
        const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
        const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
        
        const { error } = await supabase.from('processors').insert([{
            company_name: data.companyName,
            email: data.email,
            plan: data.plan,
            api_key_hash: apiKeyHash,
            status: 'active',
            events_limit: 1000
        }]);
        
        if (error) throw error;
        res.status(201).json({ apiKey });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Registration failed' });
    }
});

initializeMerkleTrees().then(() => {
    app.listen(PORT, () => console.log(`🚀 Secure Server running on port ${PORT}`));
});