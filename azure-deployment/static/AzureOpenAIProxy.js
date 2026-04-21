/**
 * Azure OpenAI Proxy Handler — Responses API
 *
 * Provides a secure interface to the OpenAI Responses API through Azure Functions.
 * Supports text generation, function/tool calling, structured outputs, and multi-turn.
 *
 * Basic usage:
 *   const response = await AzureOpenAIProxy.create('Hello!', {
 *     instructions: 'You are a helpful assistant.'
 *   });
 *   console.log(response.output_text);
 *
 * Tool calling usage:
 *   const tools = [{ type: 'function', name: 'get_weather', ... }];
 *   const handlers = { get_weather: ({ location }) => ({ temp: 22 }) };
 *   const response = await AzureOpenAIProxy.callWithTools('What is the weather in Paris?', handlers, {
 *     tools,
 *     instructions: 'You are a helpful assistant.'
 *   });
 *   console.log(response.output_text);
 */

class AzureOpenAIProxy {
  static isAzureEnvironment() {
    const isProduction = window.location.hostname !== 'localhost' &&
                        window.location.hostname !== '127.0.0.1';
    return isProduction;
  }

  static getApiEndpoint() {
    return this.isAzureEnvironment() ? '/api/openai-proxy' : '/api/openai/chat';
  }

  /**
   * Make a single Responses API request.
   *
   * @param {string|Array} input - User input string or array of message/item objects.
   * @param {Object} [options]
   * @param {string}  [options.model='gpt-4.1']
   * @param {string}  [options.instructions]         - System-level instructions.
   * @param {Array}   [options.tools]                - Tool definitions (function, built-in, custom).
   * @param {*}       [options.tool_choice]          - 'auto'|'required'|'none'|{type,name}|{type,mode,tools}
   * @param {boolean} [options.parallel_tool_calls]  - Allow/prevent parallel tool calls.
   * @param {string}  [options.previous_response_id] - Chain to a previous response.
   * @param {boolean} [options.store]                - Persist response server-side.
   * @param {Object}  [options.text]                 - e.g. { format: { type: 'json_schema', ... } }
   * @param {Object}  [options.response_format]      - Legacy: converted to text.format automatically
   * @param {Array}   [options.include]              - Extra items to include, e.g. ['reasoning.encrypted_content']
   * @param {number}  [options.timeout=30000]        - Request timeout in ms.
   * @returns {Promise<Object>} Responses API response object (includes output_text helper).
   */
  static async create(input, options = {}) {
    const {
      model = 'gpt-5',  // Updated to GPT-5 (latest model)
      instructions,
      tools,
      tool_choice,
      parallel_tool_calls,
      previous_response_id,
      store,
      text,
      response_format,
      reasoning,
      temperature,
      include,
      timeout = 30000
    } = options;

    if (!input) throw new Error('input is required');

    const body = { model, input };
    if (instructions !== undefined)        body.instructions = instructions;
    if (reasoning !== undefined)           body.reasoning = reasoning;
    if (temperature !== undefined)         body.temperature = temperature;
    if (tools !== undefined)               body.tools = tools;
    if (tool_choice !== undefined)         body.tool_choice = tool_choice;
    if (parallel_tool_calls !== undefined) body.parallel_tool_calls = parallel_tool_calls;
    if (previous_response_id !== undefined) body.previous_response_id = previous_response_id;
    if (store !== undefined)               body.store = store;
    
    // Merge text and response_format (Responses API uses text.format not response_format)
    if (text !== undefined || response_format !== undefined) {
      body.text = text || {};
      if (response_format !== undefined) {
        body.text.format = response_format;
      }
    }
    
    if (include !== undefined)             body.include = include;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(this.getApiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errMsg = `API error: ${res.status}`;
        try {
          const err = await res.json();
          errMsg = err.error?.message || err.error || errMsg;
        } catch (_) {
          try { const txt = await res.text(); if (txt) errMsg = txt; } catch (_2) {}
        }
        throw new Error(errMsg);
      }

      // Get response text first to check if it's empty
      const responseText = await res.text();
      
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from API');
        throw new Error('Empty response from Azure OpenAI API');
      }

      // Try to parse JSON
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText.substring(0, 200));
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error(`Request timeout after ${timeout}ms`);
      console.error('AzureOpenAIProxy error:', error);
      throw error;
    }
  }

  /**
   * Perform a full function-calling loop using the Responses API.
   *
   * Makes successive requests until the model returns a final text response
   * (no more pending function calls). Each function call in the response is
   * dispatched to the matching handler and the output fed back into the next
   * request via function_call_output items.
   *
   * @param {string|Array} userInput - Initial user message.
   * @param {Object} handlers - Map of function name → async (parsedArgs) => result.
   *   The result can be anything JSON-serialisable; plain strings are also accepted.
   * @param {Object} [options] - Same options as create(), including `tools`.
   * @returns {Promise<Object>} The final Responses API response.
   *
   * @example
   * const tools = [{
   *   type: 'function',
   *   name: 'get_weather',
   *   description: 'Returns current weather for a city.',
   *   parameters: {
   *     type: 'object',
   *     properties: { location: { type: 'string' } },
   *     required: ['location'],
   *     additionalProperties: false
   *   },
   *   strict: true
   * }];
   * const response = await AzureOpenAIProxy.callWithTools(
   *   'What is the weather in Paris?',
   *   { get_weather: ({ location }) => ({ temperature: 22, unit: 'C', location }) },
   *   { tools, instructions: 'You are a helpful assistant.' }
   * );
   * console.log(response.output_text);
   */
  static async callWithTools(userInput, handlers = {}, options = {}) {
    // Build a running input list (items accumulate across turns)
    let inputList = Array.isArray(userInput)
      ? [...userInput]
      : [{ role: 'user', content: userInput }];

    let response;

    // Agentic loop — continue until no more function calls are pending
    while (true) {
      response = await this.create(inputList, options);

      // Collect any function_call items from the response
      const functionCalls = (response.output || []).filter(
        item => item.type === 'function_call'
      );

      if (functionCalls.length === 0) {
        // No tool calls — model is done
        break;
      }

      // Append all output items (including reasoning items required by reasoning models)
      inputList = inputList.concat(response.output);

      // Execute each function call and append its output
      for (const call of functionCalls) {
        const handler = handlers[call.name];
        let output;

        if (!handler) {
          console.warn(`No handler registered for function "${call.name}". Returning error.`);
          output = JSON.stringify({ error: `Function "${call.name}" is not implemented.` });
        } else {
          try {
            const args = call.arguments ? JSON.parse(call.arguments) : {};
            const result = await handler(args);
            output = typeof result === 'string' ? result : JSON.stringify(result);
          } catch (err) {
            console.error(`Error executing function "${call.name}":`, err);
            output = JSON.stringify({ error: err.message });
          }
        }

        inputList.push({
          type: 'function_call_output',
          call_id: call.call_id,
          output
        });
      }
    }

    return response;
  }

  /**
   * Perform a web search using the Responses API web_search built-in tool.
   *
   * @param {string} query - The search query or user question.
   * @param {Object} [options]
   * @param {string}  [options.model='gpt-4.1']          - Model to use.
   * @param {string}  [options.instructions]             - System-level instructions.
   * @param {string[]} [options.allowedDomains]          - Up to 100 domains to restrict results to
   *                                                       (e.g. ['openai.com', 'wikipedia.org']).
   * @param {Object}  [options.userLocation]             - Approximate user location for geo-relevant results.
   * @param {string}  [options.userLocation.country]     - Two-letter ISO country code, e.g. 'US'.
   * @param {string}  [options.userLocation.city]        - City name, e.g. 'Stockholm'.
   * @param {string}  [options.userLocation.region]      - Region/state, e.g. 'Stockholms län'.
   * @param {string}  [options.userLocation.timezone]    - IANA timezone, e.g. 'Europe/Stockholm'.
   * @param {boolean} [options.externalWebAccess=true]   - false = use cached/indexed results only.
   * @param {string}  [options.previous_response_id]     - Chain to a previous response.
   * @param {boolean} [options.store]                    - Persist response server-side.
   * @param {number}  [options.timeout=30000]            - Request timeout in ms.
   * @returns {Promise<{response, outputText, citations, sources}>}
   *   - `response`   — raw Responses API response object
   *   - `outputText` — the assistant's answer text
   *   - `citations`  — array of { url, title, start_index, end_index } annotation objects
   *   - `sources`    — full list of source URLs the model consulted
   *
   * @example
   * // Simple search
   * const { outputText, citations } = await AzureOpenAIProxy.webSearch(
   *   'What is the latest news about OpenAI?'
   * );
   * console.log(outputText);
   * citations.forEach(c => console.log(c.title, c.url));
   *
   * @example
   * // Domain-filtered, location-aware search
   * const { outputText } = await AzureOpenAIProxy.webSearch(
   *   'Local weather this weekend',
   *   {
   *     allowedDomains: ['weather.com', 'yr.no'],
   *     userLocation: { country: 'SE', city: 'Stockholm', timezone: 'Europe/Stockholm' }
   *   }
   * );
   */
  static async webSearch(query, options = {}) {
    const {
      model = 'gpt-5',
      instructions,
      allowedDomains,
      userLocation,
      externalWebAccess,
      previous_response_id,
      store,
      timeout = 30000
    } = options;

    // Build the web_search tool definition
    const webSearchTool = { type: 'web_search' };
    if (allowedDomains && allowedDomains.length > 0) {
      webSearchTool.filters = { allowed_domains: allowedDomains };
    }
    if (userLocation) {
      webSearchTool.user_location = userLocation;
    }
    if (externalWebAccess !== undefined) {
      webSearchTool.external_web_access = externalWebAccess;
    }

    const createOptions = { model, tools: [webSearchTool], timeout };
    if (instructions !== undefined)         createOptions.instructions = instructions;
    if (previous_response_id !== undefined) createOptions.previous_response_id = previous_response_id;
    if (store !== undefined)                createOptions.store = store;

    const response = await this.create(query, createOptions);

    return {
      response,
      outputText: this._extractOutputText(response),
      citations:  this._extractCitations(response),
      sources:    this._extractSources(response)
    };
  }

  /**
   * Extract the assistant's answer text from a web-search response.
   * @param {Object} response - Raw Responses API response.
   * @returns {string}
   */
  static _extractOutputText(response) {
    // output_text is a convenience helper on the top-level response
    if (response.output_text) return response.output_text;
    // Fallback: find the message item manually
    const msg = (response.output || []).find(item => item.type === 'message');
    return msg?.content?.[0]?.text ?? '';
  }

  /**
   * Extract url_citation annotations from a web-search response.
   * @param {Object} response - Raw Responses API response.
   * @returns {Array<{url, title, start_index, end_index}>}
   */
  static _extractCitations(response) {
    const msg = (response.output || []).find(item => item.type === 'message');
    const annotations = msg?.content?.[0]?.annotations ?? [];
    return annotations
      .filter(a => a.type === 'url_citation')
      .map(({ url, title, start_index, end_index }) => ({ url, title, start_index, end_index }));
  }

  /**
   * Extract the full list of source URLs from a web-search response.
   * @param {Object} response - Raw Responses API response.
   * @returns {Array<string>}
   */
  static _extractSources(response) {
    const searchCall = (response.output || []).find(item => item.type === 'web_search_call');
    if (!searchCall) return [];
    // `sources` may be present as a top-level field on the search call item
    return (searchCall.sources ?? []).map(s => (typeof s === 'string' ? s : s.url ?? s));
  }

  /**
   * @deprecated Use create() instead, which targets the Responses API.
   * Kept for backward compatibility — internally delegates to create().
   */
  static async chat(messages, options = {}) {
    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    return this.create(
      userMessages.length === 1 ? userMessages[0].content : userMessages,
      { ...options, instructions: systemMsg?.content }
    );
  }
}

// Export for both ES6 modules and inline usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AzureOpenAIProxy;
}
