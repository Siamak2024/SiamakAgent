const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

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
  res.redirect('/NexGenEA/NexGen_EA_V4.html');
});

// Redirect /NexGenEA/EA2_Toolkit/ to start page
app.get('/NexGenEA/EA2_Toolkit/', (req, res) => {
  res.redirect('/NexGenEA/EA2_Toolkit/EA_Start_Page.html');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get OpenAI API key (from server environment)
app.get('/api/config/openai-key', (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(404).json({ error: 'OpenAI API key not configured' });
  }
  res.json({ apiKey });
});

// Proxy OpenAI Chat Completions API requests (keeps API key secure on server)
app.post('/api/openai/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured on server' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // Debug: Log incoming request body
    console.log('[Server] Incoming request body:', JSON.stringify(req.body, null, 2));

    // Detect request format:
    // Chat Completions uses { messages, model, ... }
    // Legacy Responses API uses { input, instructions, model, ... }
    const isResponsesAPI = req.body.input !== undefined && req.body.messages === undefined;
    
    let targetUrl = 'https://api.openai.com/v1/chat/completions';
    let requestBody = { ...req.body };

    // Transform Responses API format to Chat Completions format
    if (isResponsesAPI) {
      const { input, instructions, reasoning, ...rest } = requestBody;
      requestBody = {
        ...rest,
        messages: [
          ...(instructions ? [{ role: 'system', content: instructions }] : []),
          { role: 'user', content: input }
        ]
      };
      
      // Handle response_format conversion
      if (requestBody.text?.format) {
        requestBody.response_format = requestBody.text.format;
        delete requestBody.text;
      }
      
      // Filter out unsupported parameters for Chat Completions API
      delete requestBody.reasoning;  // Only supported in o1/o3 models via different endpoint
      delete requestBody.include;    // Responses API specific
      delete requestBody.store;       // Responses API specific
      delete requestBody.previous_response_id;  // Responses API specific
    }

    // Debug: Log what we're sending to OpenAI
    console.log('[Server] Sending to OpenAI:', JSON.stringify(requestBody, null, 2));
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

    // Check if response is empty or malformed
    if (!data || (Array.isArray(data.choices) && data.choices.length === 0)) {
      console.error('[Server] Empty or malformed response from OpenAI:', data);
      return res.status(500).json({ 
        error: 'Empty response from OpenAI', 
        details: 'The AI model returned an empty response'
      });
    }

    // Transform Chat Completions response back to Responses API format if needed
    if (isResponsesAPI) {
      const message = data.choices?.[0]?.message;
      const transformedData = {
        id: data.id,
        model: data.model,
        output: [{
          type: 'message',
          content: [{
            type: 'text',
            text: message?.content || ''
          }]
        }],
        output_text: message?.content || '',
        usage: data.usage
      };
      return res.json(transformedData);
    }

    res.json(data);
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: 'Failed to communicate with OpenAI', details: error.message });
  }
});

// ==================== MODEL ROUTES ====================

// Get all models
app.get('/api/models', (req, res) => {
  db.getAllModels((err, models) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve models', details: err.message });
    }
    res.json(models);
  });
});

// Get a specific model by ID
app.get('/api/models/:id', (req, res) => {
  const { id } = req.params;
  db.getModel(id, (err, model) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve model', details: err.message });
    }
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json(model);
  });
});

// Save or update a model
app.post('/api/models', (req, res) => {
  const { id, name, data } = req.body;
  
  if (!name || !data) {
    return res.status(400).json({ error: 'Name and data are required' });
  }

  db.saveModel(id, name, data, (err, modelId) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save model', details: err.message });
    }
    res.json({ success: true, id: modelId, message: 'Model saved successfully' });
  });
});

// Delete a model
app.delete('/api/models/:id', (req, res) => {
  const { id } = req.params;
  db.deleteModel(id, (err) => {
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
  console.log('  🚀 AI Enterprise Architecture Platform Backend');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Server running on: http://localhost:${PORT}`);
  console.log(`  API endpoint:      http://localhost:${PORT}/api`);
  console.log(`  OpenAI Key:        ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});
