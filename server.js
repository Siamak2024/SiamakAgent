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

// Serve static files from current directory
app.use(express.static(__dirname));

// Initialize database
db.init();

// ==================== API ROUTES ====================

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

// Proxy OpenAI Responses API requests (keeps API key secure on server)
app.post('/api/openai/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured on server' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // Detect request format:
    // Responses API uses { input, instructions, model, ... }
    // Chat Completions uses { messages, model, ... }
    const isResponsesAPI = req.body.input !== undefined && req.body.messages === undefined;
    const targetUrl = isResponsesAPI
      ? 'https://api.openai.com/v1/responses'
      : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Normalise response: always expose output_text for Responses API callers
    if (isResponsesAPI && data.output && !data.output_text) {
      const textItem = (data.output || []).find(o => o.type === 'message');
      const textContent = textItem?.content?.find(c => c.type === 'output_text' || c.type === 'text');
      data.output_text = textContent?.text || '';
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
