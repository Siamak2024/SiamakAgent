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
      body: {
        error: 'Request body is required'
      }
    };
    return;
  }

  try {
    const {
      input,
      instructions,
      model = 'gpt-4.1',
      tools,
      tool_choice,
      parallel_tool_calls,
      previous_response_id,
      store,
      text,
      include
    } = req.body;

    if (!input) {
      context.res = {
        status: 400,
        body: {
          error: '"input" field is required in request body'
        }
      };
      return;
    }

    // Build payload — only include fields that were provided
    const payload = { model, input };
    if (instructions !== undefined)        payload.instructions = instructions;
    if (tools !== undefined)               payload.tools = tools;
    if (tool_choice !== undefined)         payload.tool_choice = tool_choice;
    if (parallel_tool_calls !== undefined) payload.parallel_tool_calls = parallel_tool_calls;
    if (previous_response_id !== undefined) payload.previous_response_id = previous_response_id;
    if (store !== undefined)               payload.store = store;
    if (text !== undefined)                payload.text = text;
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
    
    context.res = {
      status: 200,
      body: response
    };

  } catch (error) {
    context.log('Error:', error.message);
    context.res = {
      status: 500,
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
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`OpenAI API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
