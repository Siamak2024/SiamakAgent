/**
 * Azure Function - OpenAI API Proxy
 * Securely handles OpenAI API requests using environment variable for API key
 * Prevents exposing API key to client-side code
 */

const https = require('https');

module.exports = async function (context, req) {
  context.log('OpenAI proxy function triggered');

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
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      context.res = {
        status: 400,
        body: {
          error: 'messages array is required in request body'
        }
      };
      return;
    }

    const requestBody = JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
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
        error: 'Failed to process OpenAI request',
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
