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
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  return Math.round(monthlyEvents / currentDay);
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

// KORRIGERAD CORS-KONFIGURATION FÖR ATT TILLÅTA ALLA ORIGINER I PRODUKTION
app.use(cors({
  origin: isProduction ? '*' : ['http://localhost:3000', 'http://localhost:5173'],
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

// KORRIGERAD PLATS: API Key Authentication (MÅSTE VARA INNAN ROUTES)
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

// PRICING CONFIGURATION (Återställd till 100 events för Starter)
const PRICING_PLANS = {
  starter: { 
    events: 100, // ÅTERSTÄLLD TILL 100 EVENTS
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

// --- MERKLE TREE ENDPOINTS (Oförändrad) ---
// ...

// Key Rotation Endpoint (Oförändrad)
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

// NY FUNKTION: API Key Revocation (Omedelbar återkallning)
app.post('/api/keys/revoke', authenticateApiKey, async (req, res) => {
  try {
    const processor = req.processor;

    // Ersätt den nuvarande nyckeln med en ogiltig (dummy) hash
    const revokedKeyHash = CryptoJS.SHA256(`revoked_${uuidv4()}_${Date.now()}`).toString();

    const { error } = await supabase
      .from('processors')
      .update({
        api_key_hash: revokedKeyHash,
        status: 'revoked', // Sätt status till revoked så auth-middleware blockerar
        updated_at: new Date().toISOString()
      })
      .eq('id', processor.id);

    if (error) throw error;

    // Logga händelsen
    await supabase
      .from('audit_events')
      .insert([{
        processor_id: processor.id,
        event_type: 'key_revocation_manual',
        event_data: { action: 'api_key_revoked_by_user' },
        event_timestamp: new Date().toISOString(),
        data_hash: CryptoJS.SHA256(`key_revoked_${Date.now()}`).toString()
      }]);

    console.log('❌ API Key revoked for processor:', processor.id);

    res.json({
      message: 'API key successfully revoked. You must generate a new key to proceed.',
      status: 'REVOKED',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Key revocation error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// NY FUNKTION: GDPR Right to Erasure (Pseudonymisering)
app.post('/api/gdpr/erase', authenticateApiKey, async (req, res) => {
  try {
    const { user_identifier } = req.body;
    const processor = req.processor;

    if (!user_identifier) {
      return res.status(400).json({ error: 'User identifier is required for erasure.' });
    }

    // Steg 1: Hitta alla händelser för användaren (använder den hashade ID:t från frontend)
    const { data: eventsToErase, error: fetchError } = await supabase
      .from('audit_events')
      .select('*')
      .eq('processor_id', processor.id)
      .eq('user_identifier', user_identifier);

    if (fetchError) throw fetchError;

    if (!eventsToErase || eventsToErase.length === 0) {
      return res.status(404).json({ message: 'No events found for this identifier.' });
    }

    // Steg 2: Pseudonymisera (uppdatera) alla matching händelser
    const newHash = CryptoJS.SHA256(user_identifier + Date.now()).toString();
    const pseudonymizedIdentifier = `ERASED_${newHash.substring(0, 16)}`;

    const { error: updateError } = await supabase
      .from('audit_events')
      .update({ 
        user_identifier: pseudonymizedIdentifier,
        event_data: { erased: true, reason: 'GDPR Right to Erasure' }
      })
      .eq('processor_id', processor.id)
      .eq('user_identifier', user_identifier); // Använder original-ID (hashad) för att hitta posterna

    if (updateError) throw updateError;
    
    // Steg 3: Lägg till en oföränderlig audit-händelse för själva raderingen
    const eraseEvent = {
      processor_id: processor.id,
      event_type: 'gdpr_erasure_request',
      user_identifier: pseudonymizedIdentifier, // Använd den nya pseudonymiserade identifieraren
      event_data: { 
        records_erased: eventsToErase.length, 
        original_identifier_hash: user_identifier // Lagra den hashade ID:t som raderades
      },
      event_timestamp: new Date().toISOString(),
      data_hash: CryptoJS.SHA256(`gdpr_erase_${Date.now()}`).toString()
    };

    await supabase.from('audit_events').insert([eraseEvent]);

    console.warn(`⚠️ Merkle Tree for processor ${processor.id} needs to be rebuilt after erasure.`);

    res.json({
      message: 'GDPR Right to Erasure executed.',
      records_updated: eventsToErase.length,
      new_identifier_format: pseudonymizedIdentifier,
      audit_log_created: true
    });

  } catch (error) {
    console.error('GDPR erasure error:', error);
    res.status(500).json({ error: 'Failed to process erasure request.' });
  }
});


// Enhanced Error Handling
app.use((err, req, res, next) => {
// ...
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
      'POST /api/keys/revoke', // NY
      'GET  /api/keys/status',
      'GET  /api/pricing',
      'GET  /api/dashboard',
      'POST /api/events',
      'POST /api/events/bulk',
      'GET  /api/events/search',
      'GET  /api/events/:id/verify',
      'GET  /api/gdpr/export/:processorId',
      'POST /api/gdpr/erase', // NY
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
  console.log(`   POST   /api/keys/revoke     - REVOKE API Key (NY)`);
  console.log(`   GET    /api/keys/status     - Check key rotation status`);
  console.log(`   GET    /api/dashboard       - Business analytics dashboard`);
  console.log(`   POST   /api/events          - Log event (with Merkle Tree)`);
  console.log(`   POST   /api/events/bulk     - Bulk import (Enterprise)`);
  console.log(`   GET    /api/events/search   - Advanced search & filtering`);
  console.log(`   GET    /api/gdpr/export     - GDPR data export`);
  console.log(`   POST   /api/gdpr/erase      - GDPR Right to Erasure (NY)`);
  console.log(`\n🌳 Merkle Tree Endpoints:`);
  console.log(`   GET    /api/merkle/tree     - Get Merkle Tree status`);
  console.log(`   POST   /api/merkle/events   - Add event to Merkle Tree`);
  console.log(`   GET    /api/merkle/proof/:id - Generate integrity proof`);
  console.log(`   POST   /api/merkle/verify   - Verify Merkle proof`);
  console.log(`   GET    /api/merkle/structure - Get tree structure`);
  console.log(`\n💼 ${isProduction ? 'PRODUCTION READY - MAKING MONEY! 💰' : 'DEVELOPMENT MODE - TESTING!'}`);
});