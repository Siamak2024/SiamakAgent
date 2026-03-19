/**
 * Azure OpenAI Proxy Handler
 * 
 * This module provides a secure interface to OpenAI API through Azure Functions
 * Replace direct OpenAI API calls with this proxy to keep your API key secure
 * 
 * Usage:
 *   const response = await AzureOpenAIProxy.chat(messages, options);
 */

class AzureOpenAIProxy {
  /**
   * Check if running in Azure environment vs local development
   */
  static isAzureEnvironment() {
    // In development (local): Use local proxy at /api
    // In production (Azure): Use Azure Function at /api/openai-proxy
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    return isProduction;
  }

  /**
   * Get the API endpoint based on environment
   */
  static getApiEndpoint() {
    if (this.isAzureEnvironment()) {
      // Production - use Azure Function
      return '/api/openai-proxy';
    } else {
      // Local development - use local server
      return '/api/openai/chat';
    }
  }

  /**
   * Make a chat completion request
   * @param {Array} messages - OpenAI message format array
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} OpenAI API response
   */
  static async chat(messages, options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 1000,
      timeout = 30000
    } = options;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    const endpoint = this.getApiEndpoint();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_tokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      console.error('Azure OpenAI Proxy error:', error);
      throw error;
    }
  }

  /**
   * Stream chat completion (for real-time responses)
   * Note: Streaming requires additional Azure Function implementation
   */
  static async chatStream(messages, onChunk, options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 1000
    } = options;

    const endpoint = this.getApiEndpoint();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_tokens,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data && data !== '[DONE]') {
              try {
                const json = JSON.parse(data);
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) {
                  onChunk(chunk);
                }
              } catch (e) {
                console.warn('Failed to parse stream chunk:', data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }
}

/**
 * Legacy Support: Drop-in replacement for OPENAI_KEY approach
 * 
 * Usage in old code:
 *   // Before:
 *   const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
 *     headers: { 'Authorization': 'Bearer ' + OPENAI_KEY }
 *   });
 *   
 *   // After:
 *   const response = await AzureOpenAIProxy.chat(messages);
 */

// Export for both ES6 modules and inline usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AzureOpenAIProxy;
}
