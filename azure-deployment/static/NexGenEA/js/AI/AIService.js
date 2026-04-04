/**
 * AIService.js — Modular AI call layer for EA Platform V4
 * Replaces the monolithic callAI() function.
 * Uses GPT-5.4 via OpenAI Responses API.
 *
 * Usage:
 *   const result = await AIService.call({
 *     taskId: 'step1_q1',
 *     taskType: 'general',
 *     systemPrompt: '...',
 *     userPrompt: '...',
 *     replyLanguage: 'en'
 *   });
 */

const AIService = (() => {

  // ── Call log (in-memory, for debugging) ──────────────────────────────────
  const _callLog = [];

  /**
   * Core AI call function.
   *
   * @param {object} opts
   * @param {string}  opts.taskId         - Unique identifier e.g. "step1_q1"
   * @param {string}  opts.taskType       - "discovery"|"action"|"heavy"|"analysis"|"general"|"lightweight"
   * @param {string}  opts.systemPrompt   - System / instructions prompt
   * @param {string}  opts.userPrompt     - User prompt (input)
   * @param {string}  [opts.replyLanguage]- e.g. "sv", "en"  (defaults to app language)
   * @param {number}  [opts.temperature]  - Override model temperature
   * @param {number}  [opts.timeoutMs]    - Override timeout
   * @param {object}  [opts.reasoning]    - Override { summary, effort }
   * @param {boolean} [opts.expectsJson]  - Adds JSON-safe language instruction if true
   * @param {boolean} [opts.retryOnJsonError] - Auto-retry once if JSON parse fails (default true)
   * @returns {Promise<{taskId, rawOutput, model, elapsed, thinking, timestamp, status, error}>}
   */
  async function call(opts) {
    const config = AITaskConfig.getConfig(opts.taskType);
    const modelName  = config.model;
    const timeoutMs  = Number(opts.timeoutMs  || config.timeoutMs);
    const reasoning  = opts.reasoning  || config.reasoning;
    const retryOnJson = opts.retryOnJsonError !== false; // default true

    // Language instruction
    const lang = _normalizeLang(opts.replyLanguage || _getAppLanguage());
    const langInstruction = _buildLanguageInstruction(lang, opts.expectsJson);

    // Assemble instructions (system) and input (user)
    const instructions = opts.systemPrompt +
      (langInstruction ? '\n\n' + langInstruction : '');
    let input = opts.userPrompt;

    // ── CRITICAL: OpenAI Responses API requires "JSON" keyword in input ───
    // If expectsJson is true but input doesn't contain "json" or "JSON", add it
    if (opts.expectsJson && !/\bjson\b/i.test(input)) {
      input = input.trim() + '\n\nReturn JSON output.';
    }

    // Reasoning models (o1, o3, o4-*, gpt-5.*) ignore temperature
    const isReasoningModel = /^(o1|o3|o4|gpt-5)/i.test(modelName);
    const temperature = isReasoningModel
      ? undefined
      : Number(opts.temperature ?? config.temperature);

    const createOpts = {
      model: modelName,
      instructions,
      timeout: timeoutMs,
      reasoning,
      ...(temperature !== undefined && { temperature }),
      ...(opts.expectsJson && { response_format: { type: 'json_object' } })
    };

    const startTime = Date.now();
    let response;
    let usedFallback = false;

    // ── Try proxy first ───────────────────────────────────────────────────
    try {
      if (typeof AzureOpenAIProxy === 'undefined') {
        throw new Error('Proxy not available (running locally)');
      }
      response = await AzureOpenAIProxy.create(input, createOpts);
    } catch (proxyErr) {
      const silent = /proxy not available|AzureOpenAIProxy is not defined/i.test(proxyErr.message);
      if (!silent) {
        console.warn(`[AIService] Proxy failed for ${opts.taskId}:`, proxyErr.message);
      }
      // ── Direct API fallback ────────────────────────────────────────────
      const apiKey = _getStoredApiKey();
      if (!apiKey) {
        if (typeof showSettingsModal === 'function') showSettingsModal();
        const err = 'No API key. Please add your OpenAI API key in Settings.';
        _log(opts.taskId, opts.taskType, null, null, 'error', err, 0);
        return { taskId: opts.taskId, rawOutput: '', model: modelName, elapsed: 0, thinking: null, timestamp: new Date(), status: 'error', error: err };
      }
      try {
        response = await _callDirectAPI(input, createOpts, apiKey, timeoutMs);
        usedFallback = true;
      } catch (directErr) {
        const err = directErr.message || proxyErr.message || 'API error';
        _log(opts.taskId, opts.taskType, null, null, 'error', err, Date.now() - startTime);
        return { taskId: opts.taskId, rawOutput: '', model: modelName, elapsed: Date.now() - startTime, thinking: null, timestamp: new Date(), status: 'error', error: err };
      }
    }

    const rawOutput = response?.output_text || '';
    const elapsed   = Date.now() - startTime;

    // ── Extract reasoning / thinking summary──────────────────────────────
    let thinking = null;
    if (response?.output) {
      const parts = [];
      for (const item of (response.output || [])) {
        if (item.type === 'reasoning' && Array.isArray(item.summary)) {
          parts.push(...item.summary.map(s => s.text || '').filter(Boolean));
        }
      }
      if (parts.length) thinking = parts.join('\n\n');
    }

    // ── Render thinking card in sidebar (matches existing behaviour) ──────
    if (thinking && typeof renderThinkingCard === 'function') {
      const panel = document.getElementById('ai-chat-panel');
      if (panel && panel.classList.contains('hidden') && typeof toggleChatPanel === 'function') {
        toggleChatPanel();
      }
      renderThinkingCard(opts.taskId, thinking);
    }

    _log(opts.taskId, opts.taskType, rawOutput, thinking, 'success', null, elapsed);

    // ── Auto-retry once if expecting JSON and parse fails ─────────────────
    if (retryOnJson && opts.expectsJson && rawOutput) {
      try {
        JSON.parse(_extractJSON(rawOutput));
      } catch (_parseErr) {
        console.warn(`[AIService] JSON parse failed for ${opts.taskId}, retrying once...`);
        return call({ ...opts, retryOnJsonError: false });
      }
    }

    return {
      taskId: opts.taskId,
      rawOutput,
      model: modelName,
      elapsed,
      thinking,
      timestamp: new Date(),
      status: 'success'
    };
  }

  // ── Direct OpenAI Responses API call ─────────────────────────────────────
  async function _callDirectAPI(input, createOpts, apiKey, timeoutMs) {
    // Transform response_format to text.format for Responses API
    const requestBody = { ...createOpts, input };
    
    // Remove client-side parameters that OpenAI doesn't accept
    delete requestBody.timeout;
    
    if (requestBody.response_format !== undefined) {
      requestBody.text = requestBody.text || {};
      requestBody.text.format = requestBody.response_format;
      delete requestBody.response_format;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Direct API error');
      // Normalise output_text from raw response structure
      if (!data.output_text && data.output) {
        const textItem = (data.output || []).find(o => o.type === 'message');
        const textContent = textItem?.content?.find(c => c.type === 'output_text' || c.type === 'text');
        data.output_text = textContent?.text || '';
      }
      return data;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // ── JSON extraction helper (mirrors existing extractJSON) ─────────────────
  function _extractJSON(text) {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) return m[1].trim();
    const a = text.indexOf('['), b = text.indexOf('{');
    const start = a === -1 ? b : b === -1 ? a : Math.min(a, b);
    if (start === -1) return text;
    return text.slice(start, Math.max(text.lastIndexOf(']'), text.lastIndexOf('}')) + 1);
  }

  // ── Language helpers ──────────────────────────────────────────────────────
  function _normalizeLang(lang) {
    const supported = ['en', 'sv', 'no', 'da', 'fi'];
    if (!lang || lang === 'auto') {
      const browser = (navigator.language || '').slice(0, 2).toLowerCase();
      return supported.includes(browser) ? browser : 'en';
    }
    return supported.includes(lang) ? lang : 'en';
  }

  function _buildLanguageInstruction(lang, expectsJson) {
    const jsonWarning = expectsJson
      ? '\n\n**CRITICAL JSON MODE:** You MUST respond with ONLY valid JSON. No prose, no markdown, no explanations. Return pure JSON that matches the expected schema. This is a JSON-only response requirement.'
      : '';
    
    if (lang === 'en') return jsonWarning;
    if (expectsJson) {
      return `**JSON Response Required**\n\nResponse Language Policy:\n- Respond in ${lang}.\n- Keep all JSON keys and schema tokens exactly as specified.\n- Translate only natural-language text values.${jsonWarning}`;
    }
    return `Response Language Policy:\n- Respond in ${lang}.`;
  }

  // ── Stored key / language resolvers (fall through to existing globals) ────
  function _getAppLanguage() {
    if (typeof getAppLanguage === 'function') return getAppLanguage();
    return localStorage.getItem('ea_app_language') || 'en';
  }

  function _getStoredApiKey() {
    if (typeof getStoredApiKey === 'function') return getStoredApiKey();
    return localStorage.getItem('openai_api_key') ||
           localStorage.getItem('ea_openai_key') || null;
  }

  // ── Internal call log ─────────────────────────────────────────────────────
  function _log(taskId, taskType, rawOutput, thinking, status, error, elapsed) {
    _callLog.push({ taskId, taskType, status, error, elapsed, timestamp: new Date(),
      outputLength: rawOutput ? rawOutput.length : 0, hasThinking: !!thinking });
    if (_callLog.length > 200) _callLog.shift(); // cap at 200 entries
  }

  function getCallLog() { return [..._callLog]; }

  return { call, getCallLog };

})();
