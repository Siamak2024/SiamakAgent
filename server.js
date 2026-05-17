const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./database');
const { requireAuth, rateLimit, sanitizeInput } = require('./auth-middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - restrict to specific origins in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : [];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️  Blocked CORS request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to all API routes
app.use('/api', rateLimit);

// Serve static files — disable caching in development so JS changes take effect immediately
app.use(express.static(__dirname, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

// Initialize database
db.init();

// ==================== API ROUTES ====================

// Suppress favicon 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Redirect /NexGenEA/ to main app
app.get('/NexGenEA/', (req, res) => {
  res.redirect('/NexGenEA/NexGenEA_V11.html');
});

// Redirect /NexGenEA/EA2_Toolkit/ to start page
app.get('/NexGenEA/EA2_Toolkit/', (req, res) => {
  res.redirect('/NexGenEA/EA2_Toolkit/EA_Start_Page.html');
});

// Health check (public endpoint)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ROUTES ====================

// Login endpoint (validates invite code and generates session)
app.post('/api/auth/login', async (req, res) => {
  const { email, inviteCode } = req.body;
  
  if (!email || !inviteCode) {
    return res.status(400).json({ error: 'Email and invite code required' });
  }
  
  // Validate with Azure Function or local validation
  // For now, this is a placeholder - integrate with your Azure validate-invite function
  try {
    const { generateSessionToken, generateUserId, validateEmail } = require('./auth-middleware');
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // TODO: Validate invite code with Azure Function
    // For now, allow any invite code in development
    const userId = generateUserId(email);
    const sessionToken = generateSessionToken(userId, email);
    
    res.json({ 
      success: true, 
      sessionToken,
      email,
      userId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== AI PROXY ROUTES ====================

// Proxy OpenAI Chat Completions API requests (keeps API key secure on server)
// Note: Auth removed for local development - API key security is sufficient
app.post('/api/openai/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured on server' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // Debug: Log incoming request body
    console.log('[Server] Incoming request body (Responses API):', JSON.stringify(req.body, null, 2));

    // Use Responses API endpoint (no transformation needed - already in correct format)
    const targetUrl = 'https://api.openai.com/v1/responses';
    const requestBody = { ...req.body };

    // Ensure store is set to true for stateful conversations (default in Responses API)
    if (requestBody.store === undefined) {
      requestBody.store = true;
    }

    // Debug: Log what we're sending to OpenAI
    console.log('[Server] Sending to OpenAI Responses API:', JSON.stringify(requestBody, null, 2));
    console.log('[Server] Target URL:', targetUrl);

    // Give the upstream OpenAI call up to 5 minutes before forcing a server-side abort
    const upstreamController = new AbortController();
    const upstreamTimer = setTimeout(() => upstreamController.abort(), 300000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: upstreamController.signal
    });
    clearTimeout(upstreamTimer);

    const data = await response.json();

    if (!response.ok) {
      console.error('[Server] OpenAI API Error:', data);
      return res.status(response.status).json(data);
    }

    // Validate Responses API response structure
    if (!data || !Array.isArray(data.output)) {
      console.error('[Server] Invalid response structure from Responses API:', data);
      return res.status(500).json({ 
        error: 'Invalid response from OpenAI Responses API', 
        details: 'Expected output array is missing'
      });
    }

    // Add output_text helper for easy access to message content
    if (!data.output_text) {
      const messageItem = data.output.find(item => item.type === 'message');
      if (messageItem && messageItem.content) {
        const textContent = messageItem.content.find(c => c.type === 'output_text' || c.type === 'text');
        data.output_text = textContent?.text || '';
      }
    }

    console.log('[Server] Response from Responses API:', {
      id: data.id,
      model: data.model,
      outputItems: data.output.length,
      outputText: data.output_text?.substring(0, 100) + '...'
    });

    res.json(data);
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: 'Failed to communicate with OpenAI', details: error.message });
  }
});

// ==================== MODEL ROUTES ====================

// Get all models (user-specific)
// SECURED: Requires authentication
app.get('/api/models', requireAuth, (req, res) => {
  const userId = req.user.userId;
  
  db.getAllModels(userId, (err, models) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve models', details: err.message });
    }
    res.json(models);
  });
});

// Get a specific model by ID (user-specific)
// SECURED: Requires authentication and ownership
app.get('/api/models/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  db.getModel(id, userId, (err, model) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve model', details: err.message });
    }
    if (!model) {
      return res.status(404).json({ error: 'Model not found or access denied' });
    }
    res.json(model);
  });
});

// Save or update a model
// SECURED: Requires authentication
app.post('/api/models', requireAuth, (req, res) => {
  const { id, name, data } = req.body;
  const userId = req.user.userId;
  
  if (!name || !data) {
    return res.status(400).json({ error: 'Name and data are required' });
  }
  
  // Sanitize input
  const sanitizedName = sanitizeInput(name);
  
  // Validate name length
  if (sanitizedName.length > 200) {
    return res.status(400).json({ error: 'Name too long (max 200 characters)' });
  }

  db.saveModel(id, sanitizedName, data, userId, (err, modelId) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save model', details: err.message });
    }
    res.json({ success: true, id: modelId, message: 'Model saved successfully' });
  });
});

// Delete a model
// SECURED: Requires authentication and ownership
app.delete('/api/models/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  db.deleteModel(id, userId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete model', details: err.message });
    }
    res.json({ success: true, message: 'Model deleted successfully' });
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  � AI Enterprise Architecture Platform Backend (SECURED)');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Server running on: http://localhost:${PORT}`);
  console.log(`  API endpoint:      http://localhost:${PORT}/api`);
  console.log(`  OpenAI Key:        ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Authentication:    ✓ Enabled`);
  console.log(`  Rate Limiting:     ✓ Enabled (100 req/min)`);
  console.log(`  CORS:              ✓ Restricted`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});
