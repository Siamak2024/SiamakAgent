/**
 * AITaskConfig.js — Model configuration for all AI task types.
 * Primary model: gpt-4o via OpenAI Chat Completions API.
 *
 * To change a model or temperature, edit this file only.
 * All step modules reference task types by name (e.g. "heavy"),
 * never hard-code model names or configs directly.
 */

const AITaskConfig = (() => {

  const CONFIG = {

    // ── Discovery: deep reasoning, complex EA discussion ──────────────────
    discovery: {
      model: 'gpt-4o',
      temperature: 0.7,
      timeoutMs: 180000,
      description: 'Deep reasoning for context-aware EA result discussion'
    },

    // ── Action: exact JSON generation, structured model updates ──────────
    action: {
      model: 'gpt-4o',
      temperature: 0.2,
      timeoutMs: 120000,
      description: 'Precise JSON generation for EA model updates'
    },

    // ── Heavy: large architecture generation (Steps 3, 4, 7) ─────────────
    heavy: {
      model: 'gpt-4o',
      temperature: 0.3,
      timeoutMs: 240000,
      description: 'Complex EA architecture generation with deep analysis'
    },

    // ── Analysis: gap analysis, maturity, benchmarking ───────────────────
    analysis: {
      model: 'gpt-4o',
      temperature: 0.4,
      timeoutMs: 180000,
      description: 'Strategic analysis and insight generation'
    },

    // ── General: standard chat, Q&A, question generation ─────────────────
    general: {
      model: 'gpt-4o',
      temperature: 0.6,
      timeoutMs: 120000,
      description: 'General EA advisory and conversational questions'
    },

    // ── Lightweight: simple lookups, translations, context analysis ───────
    lightweight: {
      model: 'gpt-4o',
      temperature: 0.3,
      timeoutMs: 60000,
      description: 'Quick, simple tasks and classifications'
    }

  };

  /**
   * Get config for a given task type.
   * Falls back to 'general' if unknown type is requested.
   * @param {string} taskType
   * @returns {{ model, temperature, timeoutMs, reasoning, description }}
   */
  function getConfig(taskType) {
    return CONFIG[taskType] || CONFIG.general;
  }

  /**
   * Get all configs (for diagnostics / admin views).
   * @returns {object}
   */
  function getAllConfigs() {
    return { ...CONFIG };
  }

  /**
   * Override a model for a specific task type at runtime.
   * Useful for A/B testing different models.
   * @param {string} taskType
   * @param {string} modelName
   */
  function overrideModel(taskType, modelName) {
    if (CONFIG[taskType]) {
      CONFIG[taskType] = { ...CONFIG[taskType], model: modelName };
      console.log(`[AITaskConfig] Override: ${taskType} → ${modelName}`);
    }
  }

  return { getConfig, getAllConfigs, overrideModel };

})();
