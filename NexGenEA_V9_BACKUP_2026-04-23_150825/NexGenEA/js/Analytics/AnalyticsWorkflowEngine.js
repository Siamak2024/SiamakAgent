/**
 * AnalyticsWorkflowEngine.js — Orchestrates all 4 parallel analytics workflows.
 *
 * Mirrors StepEngine.js but for parallel analytics tabs (Decision Intelligence,
 * Financial, Scenarios, Optimize). Each tab is independent — no mutual dependencies.
 *
 * Usage:
 *   const result = await AnalyticsWorkflowEngine.run('decision-intelligence', userInput, window.model);
 *
 * Flow per run():
 *   1. Build context:    AnalyticsContextBuilder.buildContext(model)
 *   2. Enrich:          enrichWithUserInput(context, userInput)
 *   3. Load tab module: Decision | Financial | Scenarios | Optimize
 *   4. Validate context
 *   5. Preload instruction files via PromptBuilder
 *   6. Execute tasks sequentially (fire progress callback after each)
 *   7. synthesize(tabState) → final output
 *   8. Store in model.analytics[tabId] + return AnalyticsResult
 */

const AnalyticsWorkflowEngine = (() => {

  // ── Tab module registry ──────────────────────────────────────────────────
  const TAB_MODULES = {
    'decision-intelligence': () => typeof Decision  !== 'undefined' ? Decision  : null,
    'financial':             () => typeof Financial !== 'undefined' ? Financial : null,
    'scenarios':             () => typeof Scenarios !== 'undefined' ? Scenarios : null,
    'optimize':              () => typeof Optimize  !== 'undefined' ? Optimize  : null
  };

  // ── Progress callback ────────────────────────────────────────────────────
  let _progressCallback = null;

  /**
   * Subscribe to progress updates (fired after each completed task).
   * @param {Function} callback - ({tabId, taskId, completedTasks, totalTasks, progress}) => void
   */
  function onProgress(callback) {
    _progressCallback = typeof callback === 'function' ? callback : null;
  }

  function _fireProgress(info) {
    if (_progressCallback) {
      try { _progressCallback(info); } catch(_) {}
    }
  }

  // ── Main entry point ─────────────────────────────────────────────────────

  /**
   * Run a full analytics workflow for the given tab.
   *
   * @param {string} tabId     - "decision-intelligence" | "financial" | "scenarios" | "optimize"
   * @param {object} userInput - Tab-specific user input (budget, scenario params, weights, etc.)
   * @param {object} model     - Current window.model
   * @returns {Promise<AnalyticsResult>}
   */
  async function run(tabId, userInput, model) {
    const startTime = Date.now();

    // 1. Resolve model
    if (!model) model = (typeof window !== 'undefined') ? window.model : {};
    userInput = userInput || {};

    // 2. Load tab module
    const tabModuleFn = TAB_MODULES[tabId];
    if (!tabModuleFn) throw new Error(`[AnalyticsWorkflowEngine] Unknown tab: ${tabId}`);
    const tabModule = tabModuleFn();
    if (!tabModule) throw new Error(`[AnalyticsWorkflowEngine] Tab module "${tabId}" is not loaded`);

    console.log(`[AnalyticsWorkflowEngine] Starting ${tabId}`);

    // 3. Build + enrich context
    const fullContext  = AnalyticsContextBuilder.buildContext(model);
    const enriched     = AnalyticsContextBuilder.enrichWithUserInput(fullContext, userInput);
    const tabContext   = AnalyticsContextBuilder.getTabContext(enriched, tabId);

    // 4. Validate
    const validation = AnalyticsContextBuilder.validateContextForTab(tabContext, tabId);
    if (validation.warnings.length) {
      console.warn(`[AnalyticsWorkflowEngine] ${tabId} warnings:`, validation.warnings);
    }

    // 5. Preload instruction files (if PromptBuilder available)
    if (typeof PromptBuilder !== 'undefined' && tabModule.tasks) {
      const preloadDefs = tabModule.tasks
        .filter(t => t.instructionFile)
        .map(t => ({ taskFile: t.instructionFile, fallback: t.systemPromptFallback || '' }));
      if (preloadDefs.length) {
        await PromptBuilder.preloadStep(tabId, preloadDefs).catch(e =>
          console.warn(`[AnalyticsWorkflowEngine] Instruction preload warning: ${e.message}`)
        );
      }
    }

    // 6. Initialize tab state
    let tabState = {
      tabId,
      startedAt:       new Date().toISOString(),
      completedTasks:  [],
      taskResults:     {},
      context:         tabContext,
      status:          'in-progress',
      warnings:        validation.warnings,
      userInput
    };

    // 7. Execute tasks in sequence
    for (const taskDef of tabModule.tasks) {
      try {
        console.log(`[AnalyticsWorkflowEngine] Running task ${taskDef.taskId}`);
        const taskResult = await _runTask(taskDef, userInput, tabState);

        tabState.completedTasks.push(taskDef.taskId);
        tabState.taskResults[taskDef.taskId] = taskResult;
        // Merge task output into running context (later tasks can use earlier outputs)
        tabState.context = { ...tabState.context, ...taskResult.output };

        // Save intermediate state to model (so UI can show progress)
        _saveIntermediate(tabId, model, tabState);

        _fireProgress({
          tabId,
          taskId:         taskDef.taskId,
          completedTasks: tabState.completedTasks.length,
          totalTasks:     tabModule.tasks.length,
          progress:       Math.round((tabState.completedTasks.length / tabModule.tasks.length) * 100)
        });

        console.log(`[AnalyticsWorkflowEngine] Completed task ${taskDef.taskId}`);

      } catch (err) {
        console.error(`[AnalyticsWorkflowEngine] Task ${taskDef.taskId} failed:`, err);
        tabState.status = 'error';
        throw err;
      }
    }

    // 8. Synthesize final output
    tabState.status = 'completed';
    const finalOutput = tabModule.synthesize(tabState);

    // 9. Build result object
    const result = {
      tabId,
      status:      'success',
      completedAt: new Date().toISOString(),
      output:      finalOutput,
      taskResults: tabState.taskResults,
      context:     tabState.context,
      warnings:    tabState.warnings,
      metadata: {
        totalTasks:  tabModule.tasks.length,
        durationMs:  Date.now() - startTime
      }
    };

    // 10. Persist to model.analytics
    _saveResult(tabId, model, result);

    console.log(`[AnalyticsWorkflowEngine] Completed ${tabId} in ${result.metadata.durationMs}ms`);
    return result;
  }

  // ── Private: run a single task ─────────────────────────────────────────

  async function _runTask(taskDef, userInput, tabState) {
    const ctx = tabState.context;

    // Build prompts (pure functions — testable)
    let system = taskDef.systemPrompt(ctx);
    let user   = taskDef.userPrompt(ctx, userInput);

    // Append instruction file content if PromptBuilder loaded it
    if (typeof PromptBuilder !== 'undefined' && taskDef.instructionFile) {
      const instruction = await PromptBuilder.load(tabState.tabId, taskDef.instructionFile, '');
      if (instruction) system = instruction + '\n\n' + system;
    }

    // Call AI
    const aiResult = await AIService.call({
      taskId:       taskDef.taskId,
      taskType:     taskDef.taskType || 'analysis',
      systemPrompt: system,
      userPrompt:   user,
      replyLanguage: ctx.language || 'en',
      expectsJson:  true
    });

    if (aiResult.status === 'error') {
      throw new Error(`AI call failed for ${taskDef.taskId}: ${aiResult.error}`);
    }

    // Parse output
    const parsed = taskDef.parseOutput(aiResult.rawOutput);

    // Validate against schema (warning only — don't abort)
    if (taskDef.outputSchema && typeof OutputValidator !== 'undefined') {
      const vr = OutputValidator.validate(parsed, taskDef.outputSchema);
      if (!vr.ok) {
        console.warn(`[AnalyticsWorkflowEngine] Schema warnings for ${taskDef.taskId}:`, vr.errors);
      }
    }

    return { taskId: taskDef.taskId, output: parsed, aiResult };
  }

  // ── Private: persistence helpers ──────────────────────────────────────────

  function _saveIntermediate(tabId, model, tabState) {
    if (!model) return;
    if (!model.analytics) model.analytics = {};
    if (!model.analytics[tabId]) model.analytics[tabId] = { history: [] };
    model.analytics[tabId].inProgress = {
      completedTasks: tabState.completedTasks,
      taskResults:    tabState.taskResults,
      updatedAt:      new Date().toISOString()
    };
    // Bubble to window.model if different reference
    if (typeof window !== 'undefined' && window.model && window.model !== model) {
      Object.assign(window.model, { analytics: model.analytics });
    }
  }

  function _saveResult(tabId, model, result) {
    if (!model) return;
    if (!model.analytics) model.analytics = {};
    if (!model.analytics[tabId]) model.analytics[tabId] = { history: [] };
    // Keep previous results in history (up to 5)
    const prev = model.analytics[tabId].latestResult;
    if (prev) {
      model.analytics[tabId].history.unshift({ timestamp: prev.completedAt, result: prev });
      if (model.analytics[tabId].history.length > 5) model.analytics[tabId].history.length = 5;
    }
    model.analytics[tabId].latestResult = result;
    delete model.analytics[tabId].inProgress;

    // Bubble to window.model
    if (typeof window !== 'undefined' && window.model && window.model !== model) {
      Object.assign(window.model, { analytics: model.analytics });
    }

    // Trigger auto-save if available
    if (typeof window !== 'undefined' && typeof saveModel === 'function') {
      try { saveModel(); } catch(_) {}
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return { run, onProgress };

})();

// Browser + Node.js dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsWorkflowEngine;
}
