/**
 * PromptBuilder.js — Instruction file loader and prompt assembly helper.
 * VERSION: Cache-Force-Refresh-v2.2 (May 2026)
 * LAST MODIFIED: 2026-05-12 16:45
 *
 * Instruction files (.instruction.md) are stored under:
 *   js/Instructions/step{N}/{taskId}.instruction.md
 *
 * Each file has a "## System Prompt" section whose content is extracted
 * and returned as the system prompt string. If the file cannot be fetched,
 * the fallback string provided by the Step module is used instead.
 */

const PromptBuilder = (() => {

  // Version check log (helps verify fresh code is loaded)
  console.log('%c[PromptBuilder.js] 📦 Module loaded', 'color: #f59e0b; font-weight: bold');
  console.log('[PromptBuilder.js] Version: Cache-Force-Refresh-v2.2 (May 2026)');
  console.log('[PromptBuilder.js] Last modified: 2026-05-12 16:45');

  // Cache: path → extracted prompt string
  const _cache = new Map();
  
  // Track which files should be force-refreshed on next load
  const _forceRefreshPaths = new Set();

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
   * @param {boolean} forceRefresh - Force bypass cache and fetch fresh file
   * @returns {Promise<string>}
   */
  async function load(stepId, taskFile, fallback = '', forceRefresh = false) {
    const path = `${BASE_PATH}/step${stepId.replace(/^step/, '')}/${taskFile}`;
    
    // Check if this path is marked for force refresh
    const shouldForceRefresh = forceRefresh || _forceRefreshPaths.has(path);
    if (shouldForceRefresh) {
      _forceRefreshPaths.delete(path);  // Clear the flag after using it
      _cache.delete(path);  // Remove from cache to force reload
      console.log(`[PromptBuilder] 🔄 Force refreshing: ${taskFile}`);
    }
    
    // Skip cache check if forceRefresh is true
    if (!shouldForceRefresh && _cache.has(path)) {
      console.log(`[PromptBuilder] 📦 Using cached: ${taskFile}`);
      return _cache.get(path);
    }

    try {
      // Add cache-busting parameter to force browser to fetch fresh file
      const cacheBuster = `?v=${Date.now()}`;
      const res = await fetch(path + cacheBuster, {
        cache: 'no-store',  // Bypass HTTP cache
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const extracted = _extractSystemPrompt(text) || fallback;
      _cache.set(path, extracted);
      
      // Extract version from instruction if present
      const versionMatch = extracted.match(/VERSION:\s*([^\n]+)/i);
      const version = versionMatch ? versionMatch[1].trim() : 'unknown';
      
      console.log(`[PromptBuilder] ✅ Loaded ${shouldForceRefresh ? 'FRESH' : 'new'} instruction file: ${taskFile}`);
      console.log(`[PromptBuilder]    Version: ${version}`);
      return extracted;
    } catch (_e) {
      console.warn(`[PromptBuilder] ⚠️ Could not load ${path} — using embedded fallback.`);
      _cache.set(path, fallback);
      return fallback;
    }
  }

  /**
   * Clear instruction cache.
   * @param {string} [stepId] - Clear only files for this step (e.g., "step1")
   * @param {string} [taskFile] - Clear only this specific file
   */
  function clearCache(stepId, taskFile) {
    if (stepId && taskFile) {
      // Clear specific file
      const path = `${BASE_PATH}/step${stepId.replace(/^step/, '')}/${taskFile}`;
      _cache.delete(path);
      _forceRefreshPaths.add(path);  // Mark for force refresh on next load
      console.log(`[PromptBuilder] 🧹 Cleared cache for ${path} (will force refresh on next load)`);
    } else if (stepId) {
      // Clear all files for this step
      let count = 0;
      for (const key of _cache.keys()) {
        if (key.startsWith(`${BASE_PATH}/step${stepId.replace(/^step/, '')}/`)) {
          _cache.delete(key);
          _forceRefreshPaths.add(key);  // Mark for force refresh
          count++;
        }
      }
      console.log(`[PromptBuilder] 🧹 Cleared ${count} cached files for ${stepId} (will force refresh on next load)`);
    } else {
      // Clear entire cache
      const count = _cache.size;
      _cache.clear();
      _forceRefreshPaths.clear();  // Also clear force refresh flags
      console.log(`[PromptBuilder] 🧹 Cleared entire cache (${count} files)`);
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
   * List all cached instruction paths (for diagnostics).
   * @returns {string[]}
   */
  function getCachedPaths() {
    return [..._cache.keys()];
  }

  return { load, preloadStep, clearCache, getCachedPaths };

})();
