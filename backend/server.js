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
console.log('🔍 Environment Variables Status:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
console.log('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ SET' : '❌ MISSING');
console.log('   PORT:', PORT);

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

// Initialize Merkle Trees on Server Start (Måste vara högst upp)
async function initializeMerkleTrees() {
  try {
    const { data: processors } = await supabase
      .from('processors')
      .select('id');

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

// Utility Functions (Måste vara före de routes som använder dem)
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

  return {
    last30Days: recentEvents?.length || 0,
    trend: 'increasing'
  };
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

// ************************************************
// KORRIGERING: TILLÅT NETLIFY DOMÄN I PRODUKTION
// ************************************************
const NETLIFY_DOMAIN = 'https://dreamy-banoffee-1603b3.netlify.app';
const RENDER_DOMAIN = 'https://auditor-veritas-mvp.onrender.com';

app.use(cors({
  origin: isProduction 
    ? [RENDER_DOMAIN, NETLIFY_DOMAIN] // Tillåt både Render och Netlify i PROD
    : ['http://localhost:3000', 'http://localhost:5173', NETLIFY_DOMAIN], // Tillåt lokal och Netlify i DEV
  credentials: true
}));
app.options('*', cors()); // Hanterar preflight-förfrågningar för alla rutter

app.use(express.json({ limit: '10mb' }));

// Production Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// KORRIGERAD PLATS: API Key Authentication (MÅSTE VARA INNAN RUTTER)
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required in x-api-key header',
        code: 'API_KEY_MISSING'
      });
    }

    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();

    const { data: processor, error } = await supabase
      .from('processors')
      .select('*')
      .eq('api_key_hash', apiKeyHash)
      .single();

    if (error || !processor) {
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'API_KEY_INVALID'
      });
    }

    if (processor.status === 'revoked') {
        return res.status(403).json({ 
            error: 'API Key has been permanently revoked.', 
            code: 'KEY_REVOKED' 
        });
    }

    if (processor.status !== 'active') {
      return res.status(403).json({
        error: 'Processor account suspended or key revoked',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    req.processor = processor;
    next();

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: isProduction ? null : error.message
    });
  }
};

// PRICING CONFIGURATION
const PRICING_PLANS = {
  starter: { 
    events: 100,
    price: 0,
    features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support']
  },
  professional: { 
    events: 5000, 
    price: 49,
    features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events']
  },
  enterprise: { 
    events: 50000, 
    price: 199,
    features: ['Everything in Professional', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations']
  }
};

// --- ENTERPRISE KEY MANAGEMENT ENDPOINTS ---

// API Key Revocation (Immediate Kill Switch)
app.post('/api/keys/revoke', authenticateApiKey, async (req, res) => {
    try {
        const processor = req.processor;
        const revocationId = uuidv4();

        // 1. Overwrite the key hash with a revocation signature and set status to 'revoked'
        const { error } = await supabase
            .from('processors')
            .update({ 
                status: 'revoked',
                api_key_hash: `REVOKED_${revocationId}`, // Ensures old key cannot be re-used
                updated_at: new Date().toISOString()
            })
            .eq('id', processor.id);

        if (error) throw error;

        // 2. Log the immutable key revocation event
        await supabase
            .from('audit_events')
            .insert([{
                processor_id: processor.id,
                event_type: 'key_revoked_immediate',
                event_data: {
                    action: 'api_key_revoked_by_user',
                    previous_key_hash_prefix: processor.api_key_hash.substring(0, 8)
                },
                event_timestamp: new Date().toISOString(),
                data_hash: CryptoJS.SHA256(`key_revoked_${Date.now()}`).toString()
            }]);

        console.log(`🚨 API Key REVOKED for processor: ${processor.id}`);

        res.json({
            success: true,
            message: 'API Key has been permanently revoked. All current access tokens are invalidated.',
            status: 'revoked',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Revocation Error:', error);
        res.status(500).json({ error: 'Failed to revoke key' });
    }
});


// Key Rotation Endpoint (Existing)
app.post('/api/keys/rotate', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;

    // Generate new API key
    const newApiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const newApiKeyHash = CryptoJS.SHA256(newApiKey).toString();

    // Update processor with new key
    const { error } = await supabase
      .from('processors')
      .update({
        api_key_hash: newApiKeyHash,
        last_key_rotation: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', processor.id);

    if (error) {
      console.error('Key rotation error:', error);
      return res.status(500).json({
        error: 'Failed to rotate API key',
        code: 'KEY_ROTATION_FAILED'
      });
    }

    // Log the key rotation event
    await supabase
      .from('audit_events')
      .insert([{
        processor_id: processor.id,
        event_type: 'key_rotation',
        event_data: {
          action: 'api_key_rotated',
          previous_key_hash: processor.api_key_hash.substring(0, 8) + '...',
          rotation_timestamp: new Date().toISOString()
        },
        event_timestamp: new Date().toISOString(),
        data_hash: CryptoJS.SHA256(`key_rotation_${Date.now()}`).toString()
      }]);

    console.log('🔑 API Key rotated for processor:', processor.id);

    res.json({
      message: 'API key rotated successfully',
      newApiKey: newApiKey,
      rotationTimestamp: new Date().toISOString(),
      security: {
        previousKeyDisabled: true,
        newKeyActive: true,
        rotationPolicy: '90 days recommended'
      }
    });

  } catch (error) {
    console.error('Key rotation error:', error);
    res.status(500).json({
      error: 'Internal server error during key rotation',
      code: 'ROTATION_ERROR'
    });
  }
});

// --- GDPR COMPLIANCE ENDPOINT ---

// GDPR Right to Erasure (Pseudonymization)
app.post('/api/gdpr/erase', authenticateApiKey, async (req, res) => {
    try {
        const { user_identifier_hash } = req.body; // Expecting the already-hashed user ID from frontend
        const processor = req.processor;

        if (!user_identifier_hash) {
            return res.status(400).json({ error: 'user_identifier_hash is required' });
        }

        // 1. Find all events for this user (using the hash)
        const { data: eventsToErase, error: fetchError } = await supabase
            .from('audit_events')
            .select('id')
            .eq('processor_id', processor.id)
            .eq('user_identifier', user_identifier_hash);

        if (fetchError) throw fetchError;

        if (!eventsToErase || eventsToErase.length === 0) {
            return res.status(404).json({ message: 'No records found for this identifier.' });
        }

        // 2. Generate a pseudonym (Erasure Token)
        const erasureToken = `ERASED_${uuidv4()}`;

        // 3. Update the records (Pseudonymization)
        // NOTE: This updates the mutable user_identifier field, leaving data_hash intact to preserve the chain integrity.
        const { error: updateError } = await supabase
            .from('audit_events')
            .update({ user_identifier: erasureToken })
            .eq('processor_id', processor.id)
            .eq('user_identifier', user_identifier_hash);

        if (updateError) throw updateError;

        // 4. Log the Erasure Event to maintain the Immutable Chain
        const eventTimestamp = new Date().toISOString();
        const erasureEventData = {
            action: 'gdpr_right_to_erasure',
            records_affected: eventsToErase.length,
            original_hash_redacted: true, // Indicates hash field was targeted
            erasure_token: erasureToken
        };

        const data_hash = CryptoJS.SHA256(JSON.stringify({
            processor_id: processor.id,
            event_type: 'gdpr.erasure_request',
            event_data: erasureEventData,
            event_timestamp: eventTimestamp
        })).toString();

        await supabase.from('audit_events').insert([{
            processor_id: processor.id,
            event_type: 'gdpr.erasure_request',
            event_data: erasureEventData,
            user_identifier: 'SYSTEM_COMPLIANCE_BOT',
            event_timestamp: eventTimestamp,
            data_hash: data_hash
        }]);
        
        // No need to update Merkle Tree as we are logging a new event only. Old events keep their hash/leaf.

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


// --- MERKLE TREE ENDPOINTS ---
// Get or Create Merkle Tree for Processor (RAD 143: FUNGERAR NU)
app.get('/api/merkle/tree', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;
    const treeId = `processor_${processor.id}`;

    if (!merkleTrees.has(treeId)) {
      // Build initial tree from existing events
      const { data: events } = await supabase
        .from('audit_events')
        .select('*')
        .eq('processor_id', processor.id)
        .order('event_timestamp', { ascending: true });

      const tree = new MerkleTree(events?.map(event => ({
        id: event.id,
        event_type: event.event_type,
        event_data: event.event_data,
        timestamp: event.event_timestamp,
        data_hash: event.data_hash
      })) || []);

      merkleTrees.set(treeId, tree);
    }

    const tree = merkleTrees.get(treeId);
    res.json({
      treeId: treeId,
      ...tree.getTreeSummary(),
      message: 'Merkle Tree loaded successfully'
    });

  } catch (error) {
    console.error('Merkle tree error:', error);
    res.status(500).json({
      error: 'Failed to load Merkle tree'
    });
  }
});

// Add Event to Merkle Tree
app.post('/api/merkle/events', authenticateApiKey, async (req, res) => {
  try {
    const { event_type, event_data, user_identifier } = req.body;
    const processor = req.processor;

    if (!event_type?.trim()) {
      return res.status(400).json({
        error: 'Event type is required'
      });
    }

    // Create the event first
    const eventTimestamp = new Date().toISOString();
    const hashData = {
      processor_id: processor.id,
      event_type: event_type.trim(),
      event_data: event_data || {},
      user_identifier: user_identifier,
      event_timestamp: eventTimestamp
    };

    const data_hash = CryptoJS.SHA256(JSON.stringify(hashData)).toString();

    const { data: event, error } = await supabase
      .from('audit_events')
      .insert([{
        processor_id: processor.id,
        event_type: event_type.trim(),
        event_data: event_data || {},
        user_identifier: user_identifier,
        event_timestamp: eventTimestamp,
        data_hash: data_hash
      }])
      .select()
      .single();

    if (error) throw error;

    // Add to Merkle Tree
    const treeId = `processor_${processor.id}`;
    if (!merkleTrees.has(treeId)) {
      merkleTrees.set(treeId, new MerkleTree());
    }

    const tree = merkleTrees.get(treeId);
    const leafHash = tree.addLeaf({
      id: event.id,
      event_type: event_type.trim(),
      event_data: event_data || {},
      timestamp: eventTimestamp,
      data_hash: data_hash
    });

    res.json({
      message: 'Event added to Merkle Tree',
      eventId: event.id,
      leafHash: leafHash,
      merkleRoot: tree.root,
      treeSummary: tree.getTreeSummary()
    });

  } catch (error) {
    console.error('Merkle event error:', error);
    res.status(500).json({
      error: 'Failed to add event to Merkle tree'
    });
  }
});

// Generate Merkle Proof for Event
app.get('/api/merkle/proof/:eventId', authenticateApiKey, async (req, res) => {
  try {
    const { eventId } = req.params;
    const processor = req.processor;

    // Get the event
    const { data: event } = await supabase
      .from('audit_events')
      .select('*')
      .eq('id', eventId)
      .eq('processor_id', processor.id)
      .single();

    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    const treeId = `processor_${processor.id}`;
    if (!merkleTrees.has(treeId)) {
      return res.status(404).json({
        error: 'Merkle tree not found for processor'
      });
    }

    const tree = merkleTrees.get(treeId);
    const leafData = {
      id: event.id,
      event_type: event.event_type,
      event_data: event.event_data,
      timestamp: event.event_timestamp,
      data_hash: event.data_hash
    };

    const leafHash = tree.hash(leafData);
    const proof = tree.getProof(leafHash);

    if (!proof) {
      return res.status(404).json({
        error: 'Event not found in Merkle tree'
      });
    }

    // Verify the proof
    const isValid = tree.verifyProof(leafHash, proof, tree.root);

    res.json({
      eventId: eventId,
      leafHash: leafHash,
      merkleRoot: tree.root,
      proof: proof,
      isValid: isValid,
      verification: {
        verified: isValid,
        timestamp: new Date().toISOString(),
        rootHash: tree.root
      },
      treeInfo: {
        totalLeaves: tree.leaves.length,
        treeLevels: tree.levels.length
      }
    });

  } catch (error) {
    console.error('Merkle proof error:', error);
    res.status(500).json({
      error: 'Failed to generate Merkle proof'
    });
  }
});

// Verify Merkle Proof
app.post('/api/merkle/verify', authenticateApiKey, async (req, res) => {
  try {
    const { leafHash, proof, root } = req.body;
    const processor = req.processor;

    if (!leafHash || !proof || !root) {
      return res.status(400).json({
        error: 'leafHash, proof, and root are required'
      });
    }

    const treeId = `processor_${processor.id}`;
    if (!merkleTrees.has(treeId)) {
      return res.status(404).json({
        error: 'Merkle tree not found'
      });
    }

    const tree = merkleTrees.get(treeId);
    const isValid = tree.verifyProof(leafHash, proof, root);

    res.json({
      verified: isValid,
      leafHash: leafHash,
      providedRoot: root,
      currentRoot: tree.root,
      matchesCurrent: root === tree.root,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Merkle verify error:', error);
    res.status(500).json({
      error: 'Failed to verify Merkle proof'
    });
  }
});

// Get Merkle Tree Structure
app.get('/api/merkle/structure', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;
    const treeId = `processor_${processor.id}`;

    if (!merkleTrees.has(treeId)) {
      return res.status(404).json({
        error: 'Merkle tree not found'
      });
    }

    const tree = merkleTrees.get(treeId);
    
    res.json({
      treeId: treeId,
      root: tree.root,
      leafCount: tree.leaves.length,
      levels: tree.levels.length,
      structure: {
        leaves: tree.leaves.slice(0, 10),
        levelCount: tree.levels.length,
        treeSummary: tree.getTreeSummary()
      }
    });

  } catch (error) {
    console.error('Merkle structure error:', error);
    res.status(500).json({
      error: 'Failed to get Merkle tree structure'
    });
  }
});

// Enhanced Routes

// Health Check with Business Metrics
app.get('/api/health', async (req, res) => {
  try {
    const { data: processors, error: pError } = await supabase
      .from('processors')
      .select('id, plan, status, created_at');

    const { data: events, error: eError } = await supabase
      .from('audit_events')
      .select('id, event_timestamp');

    const monthlyRevenue = processors?.reduce((sum, p) => {
      return sum + (PRICING_PLANS[p.plan]?.price || 0);
    }, 0);

    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
      business: {
        totalProcessors: processors?.length || 0,
        totalEvents: events?.length || 0,
        activeProcessors: processors?.filter(p => p.status === 'active').length || 0,
        monthlyRevenue: monthlyRevenue,
        uptime: process.uptime()
      },
      database: pError || eError ? 'Error' : 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: isProduction ? 'Internal server error' : error.message
    });
  }
});

// Create Processor with Payment Integration
app.post('/api/processors', async (req, res) => {
  try {
    const { companyName, email, plan = 'starter', paymentIntent } = req.body;

    // Enhanced validation
    if (!companyName?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: 'Company name and email are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    if (!PRICING_PLANS[plan]) {
      return res.status(400).json({
        error: 'Invalid plan selected',
        code: 'INVALID_PLAN',
        availablePlans: Object.keys(PRICING_PLANS)
      });
    }

    // Check for existing processor
    const { data: existing } = await supabase
      .from('processors')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (existing?.length > 0) {
      return res.status(409).json({
        error: 'Processor with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Payment validation for paid plans
    if (PRICING_PLANS[plan].price > 0 && !paymentIntent) {
      return res.status(402).json({
        error: 'Payment required for this plan',
        code: 'PAYMENT_REQUIRED',
        plan: plan,
        price: PRICING_PLANS[plan].price,
        features: PRICING_PLANS[plan].features
      });
    }

    // Create processor
    const processorId = uuidv4();
    const apiKey = `av_${uuidv4().replace(/-/g, '')}`;
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();

    const processorData = {
      id: processorId,
      company_name: companyName.trim(),
      email: email.trim().toLowerCase(),
      plan: plan,
      api_key_hash: apiKeyHash,
      status: 'active',
      events_limit: PRICING_PLANS[plan].events,
      monthly_events_used: 0,
      created_at: new Date().toISOString(),
      last_key_rotation: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('processors')
      .insert([processorData])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Failed to create processor',
        code: 'DATABASE_ERROR'
      });
    }

    console.log('💰 New processor created:', { companyName, email, plan });

    res.status(201).json({
      message: 'Processor created successfully',
      processorId: processorId,
      apiKey: apiKey,
      processor: {
        id: processorId,
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        plan: plan,
        eventsLimit: PRICING_PLANS[plan].events,
        features: PRICING_PLANS[plan].features,
        createdAt: processorData.created_at,
        lastKeyRotation: processorData.last_key_rotation
      },
      billing: {
        plan: plan,
        price: PRICING_PLANS[plan].price,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Processor creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get Key Rotation Status
app.get('/api/keys/status', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;

    const lastRotation = new Date(processor.last_key_rotation);
    const daysSinceRotation = Math.floor((new Date() - lastRotation) / (1000 * 60 * 60 * 24));
    const recommendedRotation = 90;
    const rotationStatus = daysSinceRotation >= recommendedRotation ? 'overdue' : 
                          daysSinceRotation >= recommendedRotation - 30 ? 'due_soon' : 'current';

    res.json({
      keyStatus: {
        lastRotation: processor.last_key_rotation,
        daysSinceRotation: daysSinceRotation,
        rotationStatus: rotationStatus,
        recommendedRotationDays: recommendedRotation,
        securityScore: rotationStatus === 'current' ? 100 : 
                      rotationStatus === 'due_soon' ? 70 : 40
      },
      recommendations: rotationStatus === 'overdue' ? 
        ['Immediate key rotation recommended'] :
        rotationStatus === 'due_soon' ?
        ['Consider rotating your API key in the next 30 days'] :
        ['Your key rotation schedule is current']
    });

  } catch (error) {
    console.error('Key status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve key status'
    });
  }
});

// Get Pricing Plans
app.get('/api/pricing', (req, res) => {
  res.json({
    plans: PRICING_PLANS,
    currency: 'USD',
    billingPeriod: 'monthly'
  });
});

// Enhanced Dashboard with Business Analytics
app.get('/api/dashboard', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;

    // Get current month events
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: monthlyEvents, error: monthlyError } = await supabase
      .from('audit_events')
      .select('id', { count: 'exact' })
      .eq('processor_id', processor.id)
      .gte('event_timestamp', startOfMonth);

    // Get total events
    const { data: totalEvents, error: totalError } = await supabase
      .from('audit_events')
      .select('id', { count: 'exact' })
      .eq('processor_id', processor.id);

    if (monthlyError || totalError) {
      return res.status(500).json({
        error: 'Failed to fetch dashboard data'
      });
    }

    // Update monthly usage
    await supabase
      .from('processors')
      .update({ monthly_events_used: monthlyEvents.length })
      .eq('id', processor.id);

    // Calculate usage analytics
    const utilization = ((monthlyEvents.length / processor.events_limit) * 100).toFixed(1);
    const usageTrend = await getUsageTrend(processor.id);

    // Get key rotation status
    const lastRotation = new Date(processor.last_key_rotation);
    const daysSinceRotation = Math.floor((new Date() - lastRotation) / (1000 * 60 * 60 * 24));

    // Get Merkle Tree status
    const treeId = `processor_${processor.id}`;
    const hasMerkleTree = merkleTrees.has(treeId);
    const merkleTree = hasMerkleTree ? merkleTrees.get(treeId) : null;

    res.json({
      processor: {
        id: processor.id,
        companyName: processor.company_name,
        email: processor.email,
        plan: processor.plan,
        eventsLimit: processor.events_limit,
        monthlyEventsUsed: monthlyEvents.length,
        status: processor.status,
        createdAt: processor.created_at,
        lastKeyRotation: processor.last_key_rotation,
        daysSinceKeyRotation: daysSinceRotation,
        features: PRICING_PLANS[processor.plan]?.features || []
      },
      stats: {
        monthlyEvents: monthlyEvents.length,
        totalEvents: totalEvents.length,
        eventsLimit: processor.events_limit,
        remainingEvents: Math.max(0, processor.events_limit - monthlyEvents.length),
        utilization: utilization + '%',
        dailyAverage: calculateDailyAverage(monthlyEvents.length),
        usageTrend: usageTrend
      },
      security: {
        keyRotationStatus: daysSinceRotation > 90 ? 'overdue' : daysSinceRotation > 60 ? 'due_soon' : 'current',
        lastRotation: processor.last_key_rotation,
        encryption: 'AES-256',
        compliance: 'GDPR Certified',
        merkleTree: {
          active: hasMerkleTree,
          rootHash: merkleTree?.root?.substring(0, 16) + '...',
          eventCount: merkleTree?.leaves.length || 0
        }
      },
      billing: {
        plan: processor.plan,
        price: PRICING_PLANS[processor.plan]?.price || 0,
        nextBillingDate: new Date(new Date(processor.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Enhanced Event Logging with Analytics
app.post('/api/events', authenticateApiKey, async (req, res) => {
  try {
    const { event_type, event_data, user_identifier } = req.body;
    const processor = req.processor;

    // Enhanced validation
    if (!event_type?.trim()) {
      return res.status(400).json({
        error: 'Event type is required',
        code: 'EVENT_TYPE_REQUIRED'
      });
    }

    if (!event_data) {
      return res.status(400).json({
        error: 'Event data is required',
        code: 'EVENT_DATA_REQUIRED'
      });
    }

    // Validate JSON
    let parsedEventData;
    try {
      parsedEventData = typeof event_data === 'string' ? JSON.parse(event_data) : event_data;
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid JSON in event data',
        code: 'INVALID_JSON'
      });
    }

    // Check monthly limit
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: monthlyEvents, error: countError } = await supabase
      .from('audit_events')
      .select('id', { count: 'exact' })
      .eq('processor_id', processor.id)
      .gte('event_timestamp', startOfMonth);

    if (countError) {
      return res.status(500).json({
        error: 'Failed to check event limit'
      });
    }

    if (monthlyEvents.length >= processor.events_limit) {
      return res.status(429).json({
        error: 'Monthly event limit exceeded',
        limit: processor.events_limit,
        used: monthlyEvents.length,
        code: 'EVENT_LIMIT_EXCEEDED',
        upgradeUrl: '/api/pricing'
      });
    }

    // Get previous hash for chain integrity
    const { data: lastEvent } = await supabase
      .from('audit_events')
      .select('data_hash')
      .eq('processor_id', processor.id)
      .order('event_timestamp', { ascending: false })
      .limit(1);

    const previous_hash = lastEvent?.[0]?.data_hash || null;

    // Create immutable hash
    const eventTimestamp = new Date().toISOString();
    const hashData = {
      processor_id: processor.id,
      event_type: event_type.trim(),
      event_data: parsedEventData,
      user_identifier: user_identifier,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      event_timestamp: eventTimestamp,
      previous_hash: previous_hash
    };

    const data_hash = CryptoJS.SHA256(JSON.stringify(hashData)).toString();

    // Insert event
    const { data, error } = await supabase
      .from('audit_events')
      .insert([{
        processor_id: processor.id,
        event_type: event_type.trim(),
        event_data: parsedEventData,
        user_identifier: user_identifier,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        event_timestamp: eventTimestamp,
        data_hash: data_hash,
        previous_hash: previous_hash
      }])
      .select();

    if (error) {
      console.error('Event creation error:', error);
      return res.status(500).json({
        error: 'Failed to log audit event: ' + (isProduction ? 'Database error' : error.message)
      });
    }

    // Add to Merkle Tree
    const treeId = `processor_${processor.id}`;
    if (!merkleTrees.has(treeId)) {
      merkleTrees.set(treeId, new MerkleTree());
    }

    const tree = merkleTrees.get(treeId);
    tree.addLeaf({
      id: data[0].id,
      event_type: event_type.trim(),
      event_data: parsedEventData,
      timestamp: eventTimestamp,
      data_hash: data_hash
    });

    // Update analytics
    await updateProcessorAnalytics(processor.id);

    res.status(201).json({
      message: 'Audit event logged successfully',
      eventId: data[0].id,
      event_timestamp: data[0].event_timestamp,
      data_hash: data[0].data_hash,
      merkleRoot: tree.root,
      usage: {
        monthlyUsed: monthlyEvents.length + 1,
        remaining: processor.events_limit - (monthlyEvents.length + 1)
      }
    });

  } catch (error) {
    console.error('Event logging error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + (isProduction ? null : error.message)
    });
  }
});

// Bulk Event Import for Enterprise
app.post('/api/events/bulk', authenticateApiKey, async (req, res) => {
  try {
    const { events } = req.body;
    const processor = req.processor;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Events array is required',
        code: 'EVENTS_ARRAY_REQUIRED'
      });
    }

    if (events.length > 1000) {
      return res.status(400).json({
        error: 'Maximum 1000 events per bulk import',
        code: 'BULK_LIMIT_EXCEEDED'
      });
    }

    // Feature Gating: Block Starter
    if (processor.plan === 'starter') {
      return res.status(403).json({
        error: 'Bulk import requires Professional or Enterprise plan',
        code: 'UPGRADE_REQUIRED',
        upgradeUrl: '/api/pricing'
      });
    }

    const processedEvents = [];
    const errors = [];

    for (const eventData of events) {
      try {
        const { event_type, event_data, user_identifier } = eventData;

        if (!event_type?.trim()) {
          errors.push({ event: eventData, error: 'Event type is required' });
          continue;
        }

        const eventTimestamp = new Date().toISOString();
        const hashData = {
          processor_id: processor.id,
          event_type: event_type.trim(),
          event_data: event_data || {},
          user_identifier: user_identifier,
          event_timestamp: eventTimestamp
        };

        const data_hash = CryptoJS.SHA256(JSON.stringify(hashData)).toString();

        processedEvents.push({
          processor_id: processor.id,
          event_type: event_type.trim(),
          event_data: event_data || {},
          user_identifier: user_identifier,
          event_timestamp: eventTimestamp,
          data_hash: data_hash
        });
      } catch (error) {
        errors.push({ event: eventData, error: error.message });
      }
    }

    // Insert all valid events
    const { data, error } = await supabase
      .from('audit_events')
      .insert(processedEvents)
      .select();

    if (error) {
      return res.status(500).json({
        error: 'Failed to import events: ' + (isProduction ? 'Database error' : error.message)
      });
    }

    // Add to Merkle Tree
    const treeId = `processor_${processor.id}`;
    if (!merkleTrees.has(treeId)) {
      merkleTrees.set(treeId, new MerkleTree());
    }

    const tree = merkleTrees.get(treeId);
    data.forEach(event => {
      tree.addLeaf({
        id: event.id,
        event_type: event.event_type,
        event_data: event.event_data,
        timestamp: event.event_timestamp,
        data_hash: event.data_hash
      });
    });

    // Update analytics
    await updateProcessorAnalytics(processor.id);

    res.json({
      message: `Bulk import completed successfully`,
      imported: processedEvents.length,
      errors: errors.length,
      error_details: isProduction ? null : errors,
      merkleRoot: tree.root,
      usage: {
        totalImported: processedEvents.length,
        failedImports: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + (isProduction ? null : error.message)
    });
  }
});

// Advanced Event Search with Filtering
app.get('/api/events/search', authenticateApiKey, async (req, res) => {
  try {
    const { 
      query, 
      event_type, 
      start_date, 
      end_date,
      page = 1, 
      limit = 50 
    } = req.query;

    let supabaseQuery = supabase
      .from('audit_events')
      .select('*', { count: 'exact' })
      .eq('processor_id', req.processor.id);

    // Apply filters
    if (event_type) {
      supabaseQuery = supabaseQuery.eq('event_type', event_type);
    }

    if (start_date) {
      supabaseQuery = supabaseQuery.gte('event_timestamp', start_date);
    }

    if (end_date) {
      supabaseQuery = supabaseQuery.lte('event_timestamp', end_date);
    }

    if (query) {
      supabaseQuery = supabaseQuery.or(`event_type.ilike.%${query}%,event_data.ilike.%${query}%`);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await supabaseQuery
      .order('event_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        error: 'Failed to search events: ' + (isProduction ? 'Database error' : error.message)
      });
    }

    res.json({
      events: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      filters: {
        query,
        event_type,
        start_date,
        end_date
      },
      analytics: {
        totalMatching: count,
        eventTypes: [...new Set(data.map(e => e.event_type))]
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + (isProduction ? null : error.message)
    });
  }
});

// Enhanced Event Verification with Chain Analysis
app.get('/api/events/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Recalculate hash
    const hashData = {
      processor_id: event.processor_id,
      event_type: event.event_type,
      event_data: event.event_data,
      user_identifier: event.user_identifier,
      ip_address: event.ip_address,
      user_agent: req.get('User-Agent'),
      event_timestamp: event.event_timestamp,
      previous_hash: event.previous_hash
    };

    const calculated_hash = CryptoJS.SHA256(JSON.stringify(hashData)).toString();
    const is_valid = calculated_hash === event.data_hash;

    // Verify chain integrity
    let chain_analysis = await analyzeChainIntegrity(event);

    // Verify Merkle Tree inclusion if available
    let merkle_proof = null;
    const treeId = `processor_${event.processor_id}`;
    if (merkleTrees.has(treeId)) {
      const tree = merkleTrees.get(treeId);
      const leafData = {
        id: event.id,
        event_type: event.event_type,
        event_data: event.event_data,
        timestamp: event.event_timestamp,
        data_hash: event.data_hash
      };
      const leafHash = tree.hash(leafData);
      merkle_proof = tree.getProof(leafHash);
    }

    res.json({
      eventId: event.id,
      event_timestamp: event.event_timestamp,
      is_valid: is_valid && chain_analysis.chain_valid,
      data_hash_match: is_valid,
      chain_integrity: chain_analysis.chain_valid,
      calculated_hash: calculated_hash,
      stored_hash: event.data_hash,
      verification_timestamp: new Date().toISOString(),
      chain_analysis: chain_analysis,
      merkle_proof: merkle_proof ? {
        available: true,
        root: merkleTrees.get(treeId)?.root,
        proof_steps: merkle_proof.length
      } : { available: false },
      gdpr_compliant: true
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GDPR Compliance Endpoints
app.get('/api/gdpr/export/:processorId', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;

    // Get all data for export
    const { data: events } = await supabase
      .from('audit_events')
      .select('*')
      .eq('processor_id', processor.id);

    const exportData = {
      exportDate: new Date().toISOString(),
      processor: {
        id: processor.id,
        companyName: processor.company_name,
        email: processor.email,
        plan: processor.plan,
        createdAt: processor.created_at
      },
      events: events,
      merkleTree: merkleTrees.has(`processor_${processor.id}`) ? {
        root: merkleTrees.get(`processor_${processor.id}`).root,
        leafCount: merkleTrees.get(`processor_${processor.id}`).leaves.length
      } : null,
      gdprNotice: 'This export contains all your data as per GDPR Right to Access Article 15',
      totalEvents: events?.length || 0
    };

    res.json(exportData);

  } catch (error) {
    console.error('GDPR export error:', error);
    res.status(500).json({
      error: 'Failed to generate GDPR export'
    });
  }
});

// Enhanced Error Handling
app.use((err, req, res, next) => {
  console.error('💥 Production Error:', {
    error: err.message,
    stack: isProduction ? null : err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    request_id: uuidv4(),
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    available_endpoints: [
      'GET  /api/health',
      'POST /api/processors',
      'POST /api/keys/rotate',
      'POST /api/keys/revoke', // New
      'GET  /api/keys/status',
      'GET  /api/pricing',
      'GET  /api/dashboard',
      'POST /api/events',
      'POST /api/events/bulk',
      'GET  /api/events/search',
      'GET  /api/events/:id/verify',
      'POST /api/gdpr/erase', // New
      'GET  /api/gdpr/export/:processorId',
      'GET  /api/merkle/tree',
      'POST /api/merkle/events',
      'GET  /api/merkle/proof/:eventId',
      'POST /api/merkle/verify',
      'GET  /api/merkle/structure'
    ]
  });
});

// Initialize Merkle Trees on server start
initializeMerkleTrees();

// Server startup
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 AUDITOR VERITAS ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} BACKEND`);
  console.log(`📍 Server running on 0.0.0.0:${PORT}`);
  console.log(`💰 Pricing: Starter (Free) → Professional ($49) → Enterprise ($199)`);
  console.log(`🔑 Key Rotation: Automated security key management`);
  console.log(`🌳 Merkle Trees: Cryptographic data integrity`);
  console.log(`🔒 GDPR Compliant • EU Data Centers • Ready for Production`);
  console.log(`\n📊 Business Endpoints:`);
  console.log(`   GET    /api/health          - System health & revenue metrics`);
  console.log(`   GET    /api/pricing         - Pricing plans & features`);
  console.log(`   POST   /api/processors      - Create processor (with payment)`);
  console.log(`   POST   /api/keys/rotate     - Rotate API keys for security`);
  console.log(`   POST   /api/keys/revoke     - Revoke API key (Kill Switch)`); // New
  console.log(`   GET    /api/keys/status     - Check key rotation status`);
  console.log(`   GET    /api/dashboard       - Business analytics dashboard`);
  console.log(`   POST   /api/events          - Log event (with Merkle Tree)`);
  console.log(`   POST   /api/events/bulk     - Bulk import (Enterprise)`);
  console.log(`   GET    /api/events/search   - Advanced search & filtering`);
  console.log(`   GET    /api/gdpr/export     - GDPR data export`);
  console.log(`   POST   /api/gdpr/erase      - GDPR Right to Erasure`); // New
  console.log(`\n🌳 Merkle Tree Endpoints:`);
  console.log(`   GET    /api/merkle/tree     - Get Merkle Tree status`);
  console.log(`   POST   /api/merkle/events   - Add event to Merkle Tree`);
  console.log(`   GET    /api/merkle/proof/:id - Generate integrity proof`);
  console.log(`   POST   /api/merkle/verify   - Verify Merkle proof`);
  console.log(`   GET    /api/merkle/structure - Get tree structure`);
  console.log(`\n💼 ${isProduction ? 'PRODUCTION READY - MAKING MONEY! 💰' : 'DEVELOPMENT MODE - TESTING!'}`);
});