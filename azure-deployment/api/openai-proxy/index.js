/**
 * Azure Function - OpenAI Responses API Proxy (SECURED)
 * Securely handles OpenAI Responses API requests using environment variable for API key
 * Prevents exposing API key to client-side code
 * 
 * SECURITY FEATURES:
 * - Authentication required (session token)
 * - Rate limiting per user
 * - Restricted CORS
 * - Input validation
 */

const https = require('https');
const { verifySessionToken } = require('../validate-invite');

// Simple in-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per user

function checkRateLimit(userId) {
  const now = Date.now();
  if (!rateLimiter.has(userId)) {
    rateLimiter.set(userId, []);
  }
  
  const userRequests = rateLimiter.get(userId);
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  
  return { allowed: true, remaining: MAX_REQUESTS - recentRequests.length };
}

module.exports = async function (context, req) {
  context.log('OpenAI Responses API proxy function triggered (SECURED)');

  // Get allowed origins from environment or use default
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://white-cliff-010e13b10.2.azurestaticapps.net'];
  
  const origin = req.headers.origin || req.headers.Origin;
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: null
    };
  }

  // SECURITY: Require authentication
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.log.warn('Missing or invalid authorization header');
    return {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin
      },
      body: {
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid session token.'
      }
    };
  }

  const sessionToken = authHeader.substring(7);
  const session = verifySessionToken(sessionToken);

  if (!session.valid) {
    context.log.warn('Invalid session token');
    return {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin
      },
      body: {
        error: 'Unauthorized',
        message: session.error || 'Invalid or expired session'
      }
    };
  }

  const { userId, email } = session;
  context.log('Authenticated user:', email);

  // SECURITY: Check rate limit
  const rateLimitResult = checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    context.log.warn('Rate limit exceeded for user:', userId);
    return {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
        'X-RateLimit-Remaining': '0',
        'Retry-After': '60'
      },
      body: {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait a moment before trying again.'
      }
    };
  }

  // Validate API Key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    context.log.error('OpenAI API key not configured');
    return {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin
      },
      body: {
        error: 'OpenAI API key not configured in Azure Function settings'
      }
    };
  }

  // Validate request body
  if (!req.body) {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Request body is required'
      }
    };
  }

  try {
    const {
      // Responses API fields
      input,
      instructions,
      model = 'gpt-5.4',  // GPT-5.4 via OpenAI Responses API
      tools,
      tool_choice,
      parallel_tool_calls,
      previous_response_id,
      store,
      text,
      include,
      // Legacy Chat Completions fields (auto-converted)
      messages,
      temperature,
      response_format
    } = req.body;

    // Resolve input/instructions — support both native Responses API format
    // and legacy Chat Completions messages[] format for backwards compatibility
    let resolvedInput = input;
    let resolvedInstructions = instructions;

    if (!resolvedInput && Array.isArray(messages) && messages.length > 0) {
      const sysMsg = messages.find(m => m.role === 'system');
      const nonSysMsgs = messages.filter(m => m.role !== 'system');
      resolvedInstructions = sysMsg ? sysMsg.content : resolvedInstructions;
      // Multi-turn: join non-system messages preserving role context
      if (nonSysMsgs.length === 1) {
        resolvedInput = nonSysMsgs[0].content;
      } else {
        resolvedInput = nonSysMsgs.map(m => `[${m.role}]: ${m.content}`).join('\n\n');
      }
    }

    if (!resolvedInput) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: '"input" field (or "messages" array) is required in request body'
        }
      };
    }

    // Build payload — only include fields that were provided
    const payload = { model, input: resolvedInput };
    if (resolvedInstructions !== undefined) payload.instructions = resolvedInstructions;
    if (tools !== undefined)               payload.tools = tools;
    if (tool_choice !== undefined)         payload.tool_choice = tool_choice;
    if (parallel_tool_calls !== undefined) payload.parallel_tool_calls = parallel_tool_calls;
    if (previous_response_id !== undefined) payload.previous_response_id = previous_response_id;
    if (store !== undefined)               payload.store = store;
    // Reasoning models (o1, o3, o4-mini, gpt-5) do not support the temperature parameter
    const isReasoningModel = /^(o1|o3|o4|gpt-5)/i.test(model);
    if (temperature !== undefined && !isReasoningModel) payload.temperature = temperature;

    // Resolve text format — support both native text.format and legacy response_format
    let resolvedText = text;
    if (!resolvedText && response_format) {
      resolvedText = { format: response_format };
    }
    if (resolvedText !== undefined)        payload.text = resolvedText;
    if (include !== undefined)             payload.include = include;

    const requestBody = JSON.stringify(payload);

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/responses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': `Bearer ${apiKey}`
      }
    };

    const response = await makeRequest(options, requestBody);

    // Add backwards-compatible choices field so legacy callers (choices[0].message.content) continue working
    if (response.output_text !== undefined && !response.choices) {
      response.choices = [{ message: { content: response.output_text } }];
    }

    context.log('OpenAI request successful for user:', userId);

    return {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      },
      body: response
    };

  } catch (error) {
    context.log.error('Error processing OpenAI request:', error.message);
    return {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin
      },
      body: {
        error: 'Failed to process OpenAI Responses API request',
        details: error.message
      }
    };
  }
};

/**
 * Helper function to make HTTPS requests
 */
function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || `OpenAI API error: ${res.statusCode}`));
          }
        } catch (_) {
          reject(new Error(`OpenAI API returned non-JSON (status ${res.statusCode}): ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
