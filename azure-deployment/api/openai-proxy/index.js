/**
 * Azure Function - OpenAI Responses API Proxy
 * Securely handles OpenAI Responses API requests using environment variable for API key
 * Prevents exposing API key to client-side code
 */

const https = require('https');

module.exports = async function (context, req) {
  context.log('OpenAI Responses API proxy function triggered');

  // Validate API Key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'OpenAI API key not configured in Azure Function settings'
      }
    };
    return;
  }

  // Validate request body
  if (!req.body) {
    context.res = {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Request body is required'
      }
    };
    return;
  }

  try {
    const {
      // Responses API fields
      input,
      instructions,
      model = 'gpt-4o',  // GPT-4o (current latest model)
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
      context.res = {
        status: 400,
        body: {
          error: '"input" field (or "messages" array) is required in request body'
        }
      };
      return;
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

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: response
    };

  } catch (error) {
    context.log('Error:', error.message);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
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
