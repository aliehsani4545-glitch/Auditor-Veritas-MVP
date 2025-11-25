import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Environment configuration
import { config } from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Production security checks
if (isProduction) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ PRODUCTION ERROR: Missing Supabase credentials');
    process.exit(1);
  }
}

console.log(`🚀 ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} - Auditor Veritas Backend`);

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseServiceKey || 'placeholder_key'
);

// --- MERKLE TREE IMPLEMENTATION ---
class MerkleTree {
  constructor(leaves = []) {
    this.leaves = leaves.map(leaf => this.hash(leaf));
    this.levels = this.buildTree(this.leaves);
    this.root = this.levels.length > 0 ? this.levels[0][0] : this.hash('');
  }

  hash(data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data, Object.keys(data).sort());
    }
    return CryptoJS.SHA256(data).toString();
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
      if (node.position === 'left') {
        computedHash = this.hash(node.hash + computedHash);
      } else {
        computedHash = this.hash(computedHash + node.hash);
      }
    }
    return computedHash === root;
  }

  addLeaf(leafData) {
    const leafHash = this.hash(leafData);
    this.leaves.push(leafHash);
    this.levels = this.buildTree(this.leaves);
    this.root = this.levels[0][0];
    return leafHash;
  }

  getTreeSummary() {
    return {
      root: this.root,
      leafCount: this.leaves.length,
      levels: this.levels.length,
      leaves: this.leaves.slice(0, 5)
    };
  }
}

// Global Merkle Tree storage
const merkleTrees = new Map();

async function initializeMerkleTrees() {
  try {
    const { data: processors } = await supabase.from('processors').select('id');
    if (!processors) return;
    for (const processor of processors) {
      const treeId = `processor_${processor.id}`;
      const { data: events } = await supabase
        .from('audit_events')
        .select('*')
        .eq('processor_id', processor.id)
        .order('event_timestamp', { ascending: true });

      if (events && events.length > 0) {
        const tree = new MerkleTree(events.map(event => ({
          id: event.id,
          event_type: event.event_type,
          event_data: event.event_data,
          timestamp: event.event_timestamp,
          data_hash: event.data_hash
        })));
        merkleTrees.set(treeId, tree);
        console.log(`🌳 Merkle Tree initialized for processor ${processor.id} with ${events.length} events`);
      }
    }
  } catch (error) {
    console.error('Error initializing Merkle trees:', error);
  }
}

// Utility Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function getUsageTrend(processorId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await supabase
    .from('audit_events')
    .select('event_timestamp')
    .eq('processor_id', processorId)
    .gte('event_timestamp', thirtyDaysAgo);
  return { last30Days: recentEvents?.length || 0, trend: 'increasing' };
}

function calculateDailyAverage(monthlyEvents) {
  const currentDay = new Date().getDate();
  return Math.round(monthlyEvents / (currentDay || 1));
}

async function updateProcessorAnalytics(processorId) {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: monthlyEvents } = await supabase
    .from('audit_events')
    .select('id', { count: 'exact' })
    .eq('processor_id', processorId)
    .gte('event_timestamp', startOfMonth);

  await supabase
    .from('processors')
    .update({ monthly_events_used: monthlyEvents.length })
    .eq('id', processorId);
}

async function analyzeChainIntegrity(event) {
  let currentEvent = event;
  let chain_valid = true;
  let chain_length = 1;
  const chain_events = [event];
  while (currentEvent.previous_hash) {
    const { data: prevEvent } = await supabase
      .from('audit_events')
      .select('*')
      .eq('data_hash', currentEvent.previous_hash)
      .single();
    if (!prevEvent) {
      chain_valid = false;
      break;
    }
    chain_events.unshift(prevEvent);
    currentEvent = prevEvent;
    chain_length++;
  }
  return {
    chain_valid,
    chain_length,
    chain_events: chain_events.map(e => ({ id: e.id, event_type: e.event_type, timestamp: e.event_timestamp }))
  };
}

// Enhanced Middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  } : false,
  crossOriginEmbedderPolicy: false
}));

const NETLIFY_DOMAIN = 'https://dreamy-banoffee-1603b3.netlify.app';
const RENDER_DOMAIN = 'https://auditor-veritas-mvp.onrender.com';

app.use(cors({
  origin: isProduction 
    ? [RENDER_DOMAIN, NETLIFY_DOMAIN] 
    : ['http://localhost:3000', 'http://localhost:5173', NETLIFY_DOMAIN],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests.', code: 'RATE_LIMIT_EXCEEDED' }
});
app.use(limiter);

// Authentication Middleware
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) return res.status(401).json({ error: 'API key required', code: 'API_KEY_MISSING' });

    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();
    const { data: processor, error } = await supabase
      .from('processors')
      .select('*')
      .eq('api_key_hash', apiKeyHash)
      .single();

    if (error || !processor) return res.status(401).json({ error: 'Invalid API key', code: 'API_KEY_INVALID' });
    if (processor.status === 'revoked') return res.status(403).json({ error: 'API Key revoked.', code: 'KEY_REVOKED' });
    if (processor.status !== 'active') return res.status(403).json({ error: 'Account suspended', code: 'ACCOUNT_SUSPENDED' });

    req.processor = processor;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const PRICING_PLANS = {
  starter: { events: 100, price: 0, features: ['Basic Audit Trail'] },
  professional: { events: 5000, price: 49, features: ['Advanced Analytics'] },
  enterprise: { events: 50000, price: 199, features: ['Everything'] }
};

// --- ROUTES ---

// 1. GDPR ERASURE (DEN KOD DU BEGÄRDE)
app.post('/api/gdpr/erase', authenticateApiKey, async (req, res) => {
    try {
        const { user_identifier_hash } = req.body; 
        const processor = req.processor;

        if (!user_identifier_hash) {
            return res.status(400).json({ error: 'user_identifier_hash is required' });
        }

        const { data: eventsToErase, error: fetchError } = await supabase
            .from('audit_events')
            .select('id')
            .eq('processor_id', processor.id)
            .eq('user_identifier', user_identifier_hash);

        if (fetchError) throw fetchError;

        if (!eventsToErase || eventsToErase.length === 0) {
            return res.status(404).json({ message: 'No records found for this identifier.' });
        }

        const erasureToken = `ERASED_${uuidv4()}`;

        const { error: updateError } = await supabase
            .from('audit_events')
            .update({ user_identifier: erasureToken })
            .eq('processor_id', processor.id)
            .eq('user_identifier', user_identifier_hash);

        if (updateError) throw updateError;

        const eventTimestamp = new Date().toISOString();
        const erasureEventData = {
            action: 'gdpr_right_to_erasure',
            records_affected: eventsToErase.length,
            original_hash_redacted: true, 
            erasure_token: erasureToken
        };

        const data_hash = CryptoJS.SHA256(JSON.stringify({
            processor_id: processor.id,
            event_type: 'gdpr.erasure_request',
            event_data: erasureEventData,
            event_timestamp: eventTimestamp
        })).toString();

        const { data: newEvent } = await supabase.from('audit_events').insert([{
            processor_id: processor.id,
            event_type: 'gdpr.erasure_request',
            event_data: erasureEventData,
            user_identifier: 'SYSTEM_COMPLIANCE_BOT',
            event_timestamp: eventTimestamp,
            data_hash: data_hash
        }]).select().single();
        
        // Uppdatera Merkle Tree
        const treeId = `processor_${processor.id}`;
        if (merkleTrees.has(treeId)) {
            merkleTrees.get(treeId).addLeaf({
                id: newEvent.id,
                event_type: 'gdpr.erasure_request',
                event_data: erasureEventData,
                timestamp: eventTimestamp,
                data_hash: data_hash
            });
        }

        console.log(`🗑️ GDPR Erasure executed for ${eventsToErase.length} records.`);

        res.json({
            success: true,
            message: 'GDPR Erasure completed successfully',
            records_anonymized: eventsToErase.length,
            erasure_token: erasureToken
        });

    } catch (error) {
        console.error('GDPR Erasure Error:', error);
        res.status(500).json({ error: 'Failed to process erasure request' });
    }
});

// 2. SEARCH ENDPOINT (Ny - Krävs för Dashboard)
app.get('/api/events/search', authenticateApiKey, async (req, res) => {
    try {
        const { query, event_type, start_date, page = 1, limit = 50 } = req.query;
        let supabaseQuery = supabase.from('audit_events').select('*', { count: 'exact' }).eq('processor_id', req.processor.id);
        
        if (event_type) supabaseQuery = supabaseQuery.eq('event_type', event_type);
        if (start_date) supabaseQuery = supabaseQuery.gte('event_timestamp', start_date);
        if (query) supabaseQuery = supabaseQuery.or(`event_type.ilike.%${query}%,event_data.ilike.%${query}%`);
        
        const offset = (page - 1) * limit;
        const { data, count, error } = await supabaseQuery.order('event_timestamp', { ascending: false }).range(offset, offset + limit - 1);
        
        if(error) throw error;
        res.json({ events: data, pagination: { page: parseInt(page), total: count, pages: Math.ceil(count / limit) } });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// 3. REVOKE KEY ENDPOINT
app.post('/api/keys/revoke', authenticateApiKey, async (req, res) => {
    try {
        const processor = req.processor;
        const revocationId = uuidv4();
        await supabase.from('processors').update({ status: 'revoked', api_key_hash: `REVOKED_${revocationId}`, updated_at: new Date().toISOString() }).eq('id', processor.id);
        
        await supabase.from('audit_events').insert([{
            processor_id: processor.id,
            event_type: 'key_revoked_immediate',
            event_data: { action: 'api_key_revoked_by_user', previous_key_prefix: processor.api_key_hash.substring(0, 8) },
            event_timestamp: new Date().toISOString(),
            data_hash: CryptoJS.SHA256(`key_revoked_${Date.now()}`).toString()
        }]);

        res.json({ success: true, message: 'API Key revoked.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke key' });
    }
});

// Standard Routes
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.post('/api/processors', async (req, res) => {
    const { companyName, email, plan = 'starter' } = req.body;
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    
    const processorId = uuidv4();
    const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();

    const { error } = await supabase.from('processors').insert([{
        id: processorId, company_name: companyName, email, plan, 
        api_key_hash: apiKeyHash, status: 'active', events_limit: 1000
    }]);

    if(error) return res.status(500).json({error: error.message});
    res.status(201).json({ processorId, apiKey });
});

app.get('/api/dashboard', authenticateApiKey, async (req, res) => {
    const processor = req.processor;
    const { count } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', processor.id);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: monthly } = await supabase.from('audit_events').select('*', { count: 'exact', head: true }).eq('processor_id', processor.id).gte('event_timestamp', startOfMonth);
    const usageTrend = await getUsageTrend(processor.id);

    res.json({
        processor: { ...processor, companyName: processor.company_name, eventsLimit: processor.events_limit },
        stats: { 
            totalEvents: count || 0, 
            monthlyEvents: monthly || 0,
            eventsLimit: processor.events_limit,
            utilization: (((monthly || 0) / processor.events_limit) * 100).toFixed(1) + '%',
            dailyAverage: calculateDailyAverage(monthly || 0),
            usageTrend: usageTrend
        },
        security: { keyRotationStatus: 'current' }
    });
});

app.post('/api/events', authenticateApiKey, async (req, res) => {
    const { event_type, event_data, user_identifier } = req.body;
    const processor = req.processor;
    const timestamp = new Date().toISOString();
    
    const { data: lastEvent } = await supabase.from('audit_events').select('data_hash').eq('processor_id', processor.id).order('event_timestamp', { ascending: false }).limit(1);
    const previous_hash = lastEvent?.[0]?.data_hash || null;

    const hashData = {
        processor_id: processor.id, event_type, event_data, user_identifier,
        event_timestamp: timestamp, previous_hash
    };
    const data_hash = CryptoJS.SHA256(JSON.stringify(hashData)).toString();

    const { data: newEvent, error } = await supabase.from('audit_events').insert([{
        processor_id: processor.id, event_type, event_data, user_identifier, 
        event_timestamp: timestamp, data_hash, previous_hash
    }]).select().single();

    if (error) return res.status(500).json({ error: error.message });

    const treeId = `processor_${processor.id}`;
    if (!merkleTrees.has(treeId)) merkleTrees.set(treeId, new MerkleTree());
    merkleTrees.get(treeId).addLeaf({
        id: newEvent.id, event_type, event_data, timestamp, data_hash
    });

    await updateProcessorAnalytics(processor.id);
    res.json({ success: true, eventId: newEvent.id });
});

app.post('/api/keys/rotate', authenticateApiKey, async (req, res) => {
    const processor = req.processor;
    const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const newApiKeyHash = CryptoJS.SHA256(newApiKey).toString();
    await supabase.from('processors').update({ api_key_hash: newApiKeyHash, last_key_rotation: new Date().toISOString() }).eq('id', processor.id);
    
    await supabase.from('audit_events').insert([{
        processor_id: processor.id,
        event_type: 'key_rotation',
        event_data: { action: 'api_key_rotated', rotation_timestamp: new Date().toISOString() },
        event_timestamp: new Date().toISOString(),
        data_hash: CryptoJS.SHA256(`key_rotation_${Date.now()}`).toString()
    }]);

    res.json({ message: 'Rotated', newApiKey });
});

app.get('/api/merkle/proof/:eventId', authenticateApiKey, async (req, res) => {
    try {
        const { eventId } = req.params;
        const processor = req.processor;
        const treeId = `processor_${processor.id}`;
        
        if (!merkleTrees.has(treeId)) return res.status(404).json({ error: 'Tree not found' });
        
        const { data: event } = await supabase.from('audit_events').select('*').eq('id', eventId).eq('processor_id', processor.id).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const tree = merkleTrees.get(treeId);
        const leafHash = tree.hash({
            id: event.id, event_type: event.event_type, event_data: event.event_data,
            timestamp: event.event_timestamp, data_hash: event.data_hash
        });
        
        const proof = tree.getProof(leafHash);
        if (!proof) return res.status(404).json({ error: 'Event not found in Merkle tree' });

        const isValid = tree.verifyProof(leafHash, proof, tree.root);
        res.json({ eventId, leafHash, merkleRoot: tree.root, proof, isValid });
    } catch (error) {
        res.status(500).json({ error: 'Proof generation failed' });
    }
});

// Other Routes
app.get('/api/merkle/tree', authenticateApiKey, async (req, res) => {
    const tree = merkleTrees.get(`processor_${req.processor.id}`);
    if(tree) res.json({ ...tree.getTreeSummary(), message: 'Tree loaded' });
    else res.status(404).json({error: 'Tree not found'});
});

initializeMerkleTrees();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});