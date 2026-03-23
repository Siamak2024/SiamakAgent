// Sample code to call the OpenAI Responses API via Azure Function from your HTML/JavaScript
// Replace your direct OpenAI API calls with this

class AzureOpenAIClient {
  constructor(apiEndpoint = '/api/openai-proxy') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Make a single Responses API request.
   * @param {string|Array} input - User input string or array of message/item objects.
   * @param {Object} [options]
   * @param {string}  [options.model='gpt-4.1']
   * @param {string}  [options.instructions]        - System-level instructions.
   * @param {Array}   [options.tools]               - Tool definitions.
   * @param {*}       [options.tool_choice]         - 'auto'|'required'|'none'|{type,name}
   * @param {boolean} [options.parallel_tool_calls]
   * @param {string}  [options.previous_response_id]
   * @param {boolean} [options.store]
   * @param {Object}  [options.text]
   * @returns {Promise<Object>} Responses API response (includes output_text helper).
   */
  async create(input, options = {}) {
    const { model = 'gpt-4.1', instructions, tools, tool_choice,
            parallel_tool_calls, previous_response_id, store, text } = options;

    const body = { model, input };
    if (instructions !== undefined)         body.instructions = instructions;
    if (tools !== undefined)                body.tools = tools;
    if (tool_choice !== undefined)          body.tool_choice = tool_choice;
    if (parallel_tool_calls !== undefined)  body.parallel_tool_calls = parallel_tool_calls;
    if (previous_response_id !== undefined) body.previous_response_id = previous_response_id;
    if (store !== undefined)                body.store = store;
    if (text !== undefined)                 body.text = text;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Full function-calling loop.
   * Runs successive requests until the model returns a final text response.
   *
   * @param {string|Array} userInput  - Initial user message.
   * @param {Object} handlers         - { functionName: async (args) => result }
   * @param {Object} [options]        - Same as create(), must include `tools`.
   * @returns {Promise<Object>} Final Responses API response.
   *
   * @example
   * const tools = [{
   *   type: 'function',
   *   name: 'get_weather',
   *   description: 'Get current weather for a city.',
   *   parameters: {
   *     type: 'object',
   *     properties: { location: { type: 'string', description: 'City name' } },
   *     required: ['location'],
   *     additionalProperties: false
   *   },
   *   strict: true
   * }];
   *
   * const client = new AzureOpenAIClient();
   * const response = await client.callWithTools(
   *   'What is the weather in Paris?',
   *   {
   *     get_weather: ({ location }) => ({ temperature: 22, unit: 'C', location })
   *   },
   *   { tools, instructions: 'You are a helpful assistant.' }
   * );
   * console.log(response.output_text);
   */
  async callWithTools(userInput, handlers = {}, options = {}) {
    let inputList = Array.isArray(userInput)
      ? [...userInput]
      : [{ role: 'user', content: userInput }];

    let response;

    while (true) {
      response = await this.create(inputList, options);

      const functionCalls = (response.output || []).filter(
        item => item.type === 'function_call'
      );

      if (functionCalls.length === 0) break;

      // Append all output items (reasoning items must be preserved for reasoning models)
      inputList = inputList.concat(response.output);

      for (const call of functionCalls) {
        const handler = handlers[call.name];
        let output;

        if (!handler) {
          output = JSON.stringify({ error: `Function "${call.name}" is not implemented.` });
        } else {
          try {
            const args = call.arguments ? JSON.parse(call.arguments) : {};
            const result = await handler(args);
            output = typeof result === 'string' ? result : JSON.stringify(result);
          } catch (err) {
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
   * @param {string}  [options.model='gpt-4.1']         - Model to use.
   * @param {string}  [options.instructions]           - System-level instructions.
   * @param {string[]} [options.allowedDomains]        - Up to 100 domains to restrict results to.
   * @param {Object}  [options.userLocation]           - Approximate user location.
   * @param {string}  [options.userLocation.country]   - Two-letter ISO country code, e.g. 'SE'.
   * @param {string}  [options.userLocation.city]      - City name.
   * @param {string}  [options.userLocation.region]    - Region/state name.
   * @param {string}  [options.userLocation.timezone]  - IANA timezone, e.g. 'Europe/Stockholm'.
   * @param {boolean} [options.externalWebAccess=true] - Set false for cached/offline mode.
   * @param {boolean} [options.store]
   * @returns {Promise<{response, outputText, citations, sources}>}
   */
  async webSearch(query, options = {}) {
    const {
      model = 'gpt-4.1',
      instructions,
      allowedDomains,
      userLocation,
      externalWebAccess,
      store
    } = options;

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

    const createOptions = { model, tools: [webSearchTool] };
    if (instructions !== undefined) createOptions.instructions = instructions;
    if (store !== undefined)        createOptions.store = store;

    const response = await this.create(query, createOptions);

    // Extract answer text
    const outputText = response.output_text ??
      (response.output || []).find(i => i.type === 'message')?.content?.[0]?.text ?? '';

    // Extract inline url_citation annotations
    const msgItem = (response.output || []).find(i => i.type === 'message');
    const citations = (msgItem?.content?.[0]?.annotations ?? [])
      .filter(a => a.type === 'url_citation')
      .map(({ url, title, start_index, end_index }) => ({ url, title, start_index, end_index }));

    // Extract full source list from the web_search_call item
    const searchCall = (response.output || []).find(i => i.type === 'web_search_call');
    const sources = (searchCall?.sources ?? []).map(s => (typeof s === 'string' ? s : s.url ?? s));

    return { response, outputText, citations, sources };
  }
}

// ──────────────────────────────────────────────────────────────
// Example 1 — Simple text generation
// ──────────────────────────────────────────────────────────────
// const client = new AzureOpenAIClient();
// const response = await client.create('Hello!', {
//   instructions: 'You are a helpful assistant.',
//   model: 'gpt-4.1'
// });
// console.log(response.output_text);

// ──────────────────────────────────────────────────────────────
// Example 2 — Function / tool calling
// ──────────────────────────────────────────────────────────────
// const tools = [{
//   type: 'function',
//   name: 'get_weather',
//   description: 'Return current weather for a city.',
//   parameters: {
//     type: 'object',
//     properties: { location: { type: 'string' } },
//     required: ['location'],
//     additionalProperties: false
//   },
//   strict: true
// }];
//
// const client = new AzureOpenAIClient();
// const response = await client.callWithTools(
//   'What is the weather in Paris?',
//   { get_weather: ({ location }) => ({ temperature: 22, unit: 'C', location }) },
//   { tools, instructions: 'You are a helpful assistant.' }
// );
// console.log(response.output_text);

// ──────────────────────────────────────────────────────────────
// Example 3 — Web search (basic)
// ──────────────────────────────────────────────────────────────
// const client = new AzureOpenAIClient();
// const { outputText, citations, sources } = await client.webSearch(
//   'What are the latest developments in AI?'
// );
// console.log(outputText);
// // Display citations — must be made visible and clickable to end users
// citations.forEach(c => console.log(`[${c.title}](${c.url})`));
// // Full list of sources the model consulted
// console.log('Sources:', sources);

// ──────────────────────────────────────────────────────────────
// Example 4 — Web search with domain filter and user location
// ──────────────────────────────────────────────────────────────
// const client = new AzureOpenAIClient();
// const { outputText, citations } = await client.webSearch(
//   'Weekend weather forecast',
//   {
//     allowedDomains: ['weather.com', 'yr.no', 'smhi.se'],
//     userLocation: {
//       country: 'SE',
//       city: 'Stockholm',
//       region: 'Stockholms län',
//       timezone: 'Europe/Stockholm'
//     }
//   }
// );
// console.log(outputText);
// citations.forEach(c => console.log(`[${c.title}](${c.url})`));
