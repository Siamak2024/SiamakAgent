/**
 * PromptBuilder.js — Instruction file loader and prompt assembly helper.
 *
 * Instruction files (.instruction.md) are stored under:
 *   js/Instructions/step{N}/{taskId}.instruction.md
 *
 * Each file has a "## System Prompt" section whose content is extracted
 * and returned as the system prompt string. If the file cannot be fetched,
 * the fallback string provided by the Step module is used instead.
 */

const PromptBuilder = (() => {

  // Cache: path → extracted prompt string
  const _cache = new Map();

  // Base path (relative to NexGen_EA_V4.html location)
  // Resolves to: /NexGenEA/js/Instructions/...
  const BASE_PATH = 'js/Instructions';

  /**
   * Load an instruction file and return its System Prompt section.
   * Falls back to fallbackText if the file is unavailable.
   *
   * @param {string} stepId    - e.g. "step1"
   * @param {string} taskFile  - e.g. "1_1_analyze_context.instruction.md"
   * @param {string} fallback  - Fallback system prompt string
   * @returns {Promise<string>}
   */
  async function load(stepId, taskFile, fallback) {
    const path = `${BASE_PATH}/${stepId}/${taskFile}`;
    if (_cache.has(path)) return _cache.get(path);

    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const extracted = _extractSystemPrompt(text) || fallback;
      _cache.set(path, extracted);
      return extracted;
    } catch (_e) {
      console.warn(`[PromptBuilder] Could not load ${path} — using embedded fallback.`);
      _cache.set(path, fallback);
      return fallback;
    }
  }

  /**
   * Preload all instruction files for a step (parallel fetch).
   * Call this at the start of StepEngine.run() so tasks don't wait for fetches.
   *
   * @param {string} stepId
   * @param {Array<{taskFile: string, fallback: string}>} taskDefs
   * @returns {Promise<void>}
   */
  async function preloadStep(stepId, taskDefs) {
    await Promise.allSettled(
      taskDefs.map(({ taskFile, fallback }) => load(stepId, taskFile, fallback))
    );
  }

  /**
   * Extract the content under the "## System Prompt" heading from a .md file.
   * Stops at the next ## heading or end-of-file.
   *
   * @param {string} text - Full .md file content
   * @returns {string|null}
   */
  function _extractSystemPrompt(text) {
    // Match "## System Prompt" (case-insensitive) and capture until next ## or EOF
    const match = text.match(/##\s*System Prompt\s*\n([\s\S]*?)(?=\n##\s|\n---\s*\n|$)/i);
    if (match && match[1].trim()) return match[1].trim();

    // Fallback: strip YAML frontmatter (--- ... ---) and return remainder
    const parts = text.split(/^---\s*$/m);
    if (parts.length >= 3) return parts.slice(2).join('---').trim();

    return null;
  }

  /**
   * Clear the instruction cache.
   * Useful during development / hot-reload scenarios.
   */
  function clearCache() {
    _cache.clear();
    console.log('[PromptBuilder] Cache cleared.');
  }

  /**
   * List all cached instruction paths (for diagnostics).
   * @returns {string[]}
   */
  function getCachedPaths() {
    return [..._cache.keys()];
  }

  return { load, preloadStep, clearCache, getCachedPaths };

})();
