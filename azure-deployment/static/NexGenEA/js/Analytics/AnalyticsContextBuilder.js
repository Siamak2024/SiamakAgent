/**
 * AnalyticsContextBuilder.js — Builds shared context for all 4 analytics tabs.
 *
 * Reads from model.steps (completed workflow outputs) + model.masterData,
 * returns a fully populated AnalyticsContext (with undefined for incomplete steps).
 *
 * All 4 tabs (Decision Intelligence, Financial, Scenarios, Optimize) read from
 * the same context object — single source of truth.
 *
 * Usage:
 *   const ctx     = AnalyticsContextBuilder.buildContext(window.model);
 *   const tabCtx  = AnalyticsContextBuilder.getTabContext(ctx, 'decision-intelligence');
 *   const enriched = AnalyticsContextBuilder.enrichWithUserInput(ctx, userInput);
 */

const AnalyticsContextBuilder = (() => {

  // ── Public: build full context from model ────────────────────────────────

  /**
   * Build a full AnalyticsContext from the current model.
   * Extracts data from completed workflow steps; leaves undefined for incomplete ones.
   *
   * @param {object} model - The current window.model
   * @returns {object} AnalyticsContext
   */
  function buildContext(model) {
    if (!model) model = {};
    const steps = model.steps || {};

    // Helper: true if a step is marked "completed"
    const done = (id) => steps[id]?.status === 'completed';

    // ── Pull from completed workflow steps ──────────────────────────────
    // Each step's output shape is documented in the DATA_CONTRACTS_INDEX.

    const strategicIntent = done('step1')
      ? (steps.step1.output || model.strategicIntent)
      : (model.strategicIntent || undefined);

    const capabilities = done('step3')
      ? (steps.step3.output?.capabilities || model.capabilities)
      : (model.capabilities || undefined);

    const operatingModel = done('step4')
      ? (steps.step4.output?.operatingModel || model.operatingModel)
      : (model.operatingModel || undefined);

    // Step 5: gapAnalysis is stored as   model.priorityGaps  OR  model.gapAnalysis.gaps
    const gapAnalysis = done('step5')
      ? (steps.step5.output?.gaps || steps.step5.output?.gapAnalysis?.gaps ||
         model.priorityGaps || model.gapAnalysis?.gaps)
      : (model.priorityGaps || model.gapAnalysis?.gaps || undefined);

    const valuePools = done('step6')
      ? (steps.step6.output?.valuePools || model.valuePools)
      : (model.valuePools || undefined);

    const roadmap = done('step7')
      ? (steps.step7.output?.roadmap || model.roadmap)
      : (model.roadmap || undefined);

    // ── Workflow completion status ────────────────────────────────────────
    const workflowStatus = _buildWorkflowStatus(steps);

    // ── Always-available master data ──────────────────────────────────────
    const masterData = _normaliseMasterData(model.masterData || {}, model);

    return {
      // Metadata
      projectId:        model.projectId   || model.id   || 'unknown',
      projectName:      model.projectName || model.name || model.currentModelName || 'Untitled',
      language:         model.language    || 'en',
      architectureMode: model.aiConfig?.architectureMode || 'standard',

      // Workflow outputs (undefined if step not complete)
      strategicIntent,
      capabilities,
      operatingModel,
      gapAnalysis,
      valuePools,
      roadmap,

      // Always present
      masterData,
      workflowStatus,
      lastUpdated: new Date().toISOString()
    };
  }

  // ── Public: enrich context with user-provided data ───────────────────────

  /**
   * Merge user-provided input into an existing context.
   * User input takes priority over inferred context (immutable — returns new object).
   *
   * @param {object} context   - Existing AnalyticsContext
   * @param {object} userInput - User-provided data (budget, scenario params, etc.)
   * @returns {object} New AnalyticsContext
   */
  function enrichWithUserInput(context, userInput) {
    if (!userInput || typeof userInput !== 'object') return { ...context };
    return {
      ...context,
      ...userInput,
      lastUpdated: new Date().toISOString()
    };
  }

  // ── Public: extract tab-specific subset of context ───────────────────────

  /**
   * Return only the fields that a specific tab needs.
   * Reduces noise in AI prompts by only sending relevant data.
   *
   * @param {object} context - Full AnalyticsContext
   * @param {string} tabId   - "decision-intelligence" | "scenarios" | "financial" | "optimize"
   * @returns {object} Tab-specific subset of context
   */
  function getTabContext(context, tabId) {
    const common = {
      projectId:        context.projectId,
      projectName:      context.projectName,
      language:         context.language,
      architectureMode: context.architectureMode,
      masterData:       context.masterData,
      workflowStatus:   context.workflowStatus
    };

    switch (tabId) {
      case 'decision-intelligence':
        return {
          ...common,
          strategicIntent: context.strategicIntent,
          capabilities:    context.capabilities,
          gapAnalysis:     context.gapAnalysis
        };

      case 'scenarios':
        return {
          ...common,
          capabilities:   context.capabilities,
          gapAnalysis:    context.gapAnalysis,
          roadmap:        context.roadmap,
          operatingModel: context.operatingModel
        };

      case 'financial':
        return {
          ...common,
          capabilities: context.capabilities,
          gapAnalysis:  context.gapAnalysis,
          valuePools:   context.valuePools,
          roadmap:      context.roadmap
        };

      case 'optimize':
        return {
          ...common,
          capabilities:   context.capabilities,
          gapAnalysis:    context.gapAnalysis,
          roadmap:        context.roadmap,
          operatingModel: context.operatingModel
        };

      default:
        // Unknown tab — return decision-intelligence subset as safe default
        return {
          ...common,
          strategicIntent: context.strategicIntent,
          capabilities:    context.capabilities,
          gapAnalysis:     context.gapAnalysis
        };
    }
  }

  // ── Public: validate context has what a tab needs ─────────────────────────

  /**
   * Check that a tab context has the fields it needs to produce useful results.
   * Returns valid=true even when data is missing (tabs run with warnings).
   *
   * @param {object} tabContext - Context slice for the specific tab
   * @param {string} tabId
   * @returns {{ valid: boolean, warnings: string[] }}
   */
  function validateContextForTab(tabContext, tabId) {
    const warnings = [];

    // Required = must have at least masterData
    if (!tabContext.masterData) {
      return { valid: false, warnings: ['masterData is required but missing'] };
    }

    // Per-tab soft warnings (tab can still run, results may be generic)
    const ws = tabContext.workflowStatus || {};

    if (!tabContext.capabilities) {
      warnings.push('Capabilities not yet mapped (Step 3 incomplete). Results will be generic.');
    }
    if (!tabContext.gapAnalysis && tabId !== 'scenarios') {
      warnings.push('Gap analysis not yet done (Step 5 incomplete). Results may be incomplete.');
    }
    if (!tabContext.strategicIntent && tabId === 'decision-intelligence') {
      warnings.push('Strategic intent not yet defined (Step 1 incomplete). Results will lack strategic context.');
    }
    if (!tabContext.roadmap && (tabId === 'scenarios' || tabId === 'optimize')) {
      warnings.push('Roadmap not yet generated (Step 7 incomplete). Scenario/optimization will apply defaults.');
    }
    if (!tabContext.valuePools && tabId === 'financial') {
      warnings.push('Value pools not yet defined (Step 6 incomplete). Financial model will use estimates only.');
    }

    // Completion percentage warning
    const pct = ws.completionPercentage || 0;
    if (pct < 30) {
      warnings.push(`Workflow only ${pct}% complete. Analytics results will be preliminary.`);
    }

    return { valid: true, warnings };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  function _buildWorkflowStatus(steps) {
    const flags = {};
    let completedCount = 0;
    for (let i = 1; i <= 7; i++) {
      const done = steps[`step${i}`]?.status === 'completed';
      flags[`step${i}_completed`] = done;
      if (done) completedCount++;
    }
    flags.completionPercentage = Math.round((completedCount / 7) * 100);
    return flags;
  }

  function _normaliseMasterData(md, model) {
    // Always return a valid masterData, filling gaps from model fields
    return {
      industry:            md.industry            || model.industry      || 'General',
      businessAreas:       md.businessAreas       || [],
      businessModel:       md.businessModel       || '',
      offerings:           md.offerings           || [],
      customerSegments:    md.customerSegments    || (model.bmc?.customer_segments) || [],
      geographies:         md.geographies         || [],
      regulations:         md.regulations         || [],
      coreSystems:         md.coreSystems         || [],
      dataLandscape:       md.dataLandscape       || model.description || '',
      strategicPriorities: md.strategicPriorities || [],
      constraints:         md.constraints         || []
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    buildContext,
    enrichWithUserInput,
    getTabContext,
    validateContextForTab
  };

})();

// Browser + Node.js dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsContextBuilder;
}
