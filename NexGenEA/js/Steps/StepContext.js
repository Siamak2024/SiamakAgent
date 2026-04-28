/**
 * StepContext.js — Context object builder for EA workflow steps.
 *
 * buildStepContext(stepId, model) extracts exactly the data a given step
 * needs from the global model object. No bloat. No implicit globals.
 *
 * Each step also sees the always-available fields:
 *   - companyDescription  (from description field or Discovery Mode synthesis)
 *   - masterData          (Phase 4 analytics context)
 *   - language            (app language code)
 *   - architectureMode    (draft|standard|deep)
 */

const StepContext = (() => {

  /**
   * Build a context object for the given step.
   * Only includes prior step outputs that are already completed.
   *
   * @param {string} stepId - e.g. "step1", "step3"
   * @param {object} model  - Current global model object
   * @returns {object} StepContext
   */
  function build(stepId, model) {
    const base = _buildBase(model);

    switch (stepId) {
      case 'step0': return { ...base };

      case 'step1': return { ...base };

      case 'step2': return {
        ...base,
        strategicIntent: model.strategicIntent || null,
        stepMeta: _pickStepMeta(model, [1])
      };

      case 'step3': return {
        ...base,
        strategicIntent: model.strategicIntent || null,
        bmc: model.bmc || null,
        bmcCurrent: model.bmcCurrent || null,
        bmcAnalysis: model.bmcAnalysis || null,
        stepMeta: _pickStepMeta(model, [1, 2])
      };

      case 'step4': return {
        ...base,
        strategicIntent: model.strategicIntent || null,
        bmc: model.bmc || null,
        capabilities: model.capabilities || [],
        industry: model.phase4Config?.industry || model.masterData?.industry || 'generic',
        stepMeta: _pickStepMeta(model, [1, 2, 3])
      };

      case 'step5': return {
        ...base,
        strategicIntent: model.strategicIntent || null,
        capabilities: model.capabilities || [],
        benchmarkGaps: model.benchmarkGaps || [],
        benchmarkQuickWins: model.benchmarkQuickWins || [],
        benchmarkData: model.benchmarkData || null,
        industry: model.phase4Config?.industry || model.masterData?.industry || 'generic',
        stepMeta: _pickStepMeta(model, [1, 2, 3, 4])
      };

      case 'step6': return {
        ...base,
        strategicIntent: model.strategicIntent || null,
        bmc: model.bmc || null,
        capabilities: model.capabilities || [],
        benchmarkGaps: model.benchmarkGaps || [],
        benchmarkQuickWins: model.benchmarkQuickWins || [],
        surveyResults: model.surveyResults || null,
        industry: model.phase4Config?.industry || model.masterData?.industry || 'generic',
        stepMeta: _pickStepMeta(model, [1, 2, 3, 4, 5])
      };

      case 'step7':
      case 'step7a': return {
        ...base,
        strategicIntent: model.strategicIntent || null,
        bmc: model.bmc || null,
        capabilities: model.capabilities || [],
        valueStreams: model.valueStreams || [],
        systems: model.systems || [],
        priorityGaps: model.priorityGaps || [],
        quickWins: model.quickWins || [],
        gapAnalysis: model.gapAnalysis || null,
        stepMeta: _pickStepMeta(model, [1, 2, 3, 4, 5, 6]) // V10: Depends on all prior steps
      };

      default: return { ...base };
    }
  }

  // ── Base (always included) ────────────────────────────────────────────────
  function _buildBase(model) {
    return {
      companyDescription: _getDescription(),
      language: _getLanguage(),
      architectureMode: model.aiConfig?.architectureMode || 'standard',
      masterData: {
        industry:           model.phase4Config?.industry || 'generic',
        businessAreas:      (model.phase4Config?.activeBusinessAreas || ['general']).join(', '),
        businessModel:      model.masterData?.businessModel || '',
        offerings:          model.masterData?.offerings || '',
        customerSegments:   model.masterData?.customerSegments || '',
        geographies:        model.masterData?.geographies || '',
        regulations:        model.masterData?.regulations || '',
        coreSystems:        model.masterData?.coreSystems || '',
        dataLandscape:      model.masterData?.dataLandscape || '',
        strategicPriorities:model.masterData?.strategicPriorities || '',
        constraints:        model.masterData?.constraints || ''
      }
    };
  }

  // ── Compact capabilities (omit noise fields for context) ─────────────────
  function _compactCapabilities(caps) {
    return caps.map(c => ({
      name: c.name,
      domain: c.domain,
      valueStream: c.valueStream,
      maturity: c.maturity,
      strategicImportance: c.strategicImportance,
      operationalCriticality: c.operationalCriticality,
      totalAnnualValue: c.totalAnnualValue,
      investmentEstimate: c.investmentEstimate
    }));
  }

  // ── Extract high-priority gaps (Step 7b sequencing guidance) ─────────────
  function _extractPriorityGaps(caps) {
    return caps
      .filter(c => c.strategicImportance === 'high' && Number(c.maturity) <= 3)
      .sort((a, b) => Number(a.maturity) - Number(b.maturity))
      .slice(0, 8)
      .map(c => `${c.name} (M${c.maturity}, ${c.domain})`);
  }

  // ── Pick _meta objects from completed steps ───────────────────────────────
  function _pickStepMeta(model, stepNums) {
    const meta = {};
    for (const n of stepNums) {
      if (model.stepMeta && model.stepMeta[n]) {
        meta[`step${n}`] = model.stepMeta[n];
      }
    }
    return meta;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _getDescription() {
    const el = document.getElementById('description');
    const domVal = (el && el.value) ? el.value.trim() : '';
    // Fallback: autopilot stores description in model.description / _autopilotState.context
    if (domVal) return domVal;
    const autopilotDesc = (typeof window !== 'undefined') && window._autopilotState?.context?.companyDescription;
    if (autopilotDesc) return autopilotDesc;
    const modelDesc = (typeof model !== 'undefined') ? model?.description : (typeof window !== 'undefined' ? window.model?.description : '');
    return modelDesc || '';
  }

  function _getLanguage() {
    if (typeof getAppLanguage === 'function') return getAppLanguage();
    return localStorage.getItem('ea_app_language') || 'en';
  }

  /**
   * Convert a StepContext to a human-readable summary string.
   * Used by steps to inject accumulated context into user prompts.
   *
   * @param {object} ctx - StepContext (output of build())
   * @returns {string}
   */
  function summarize(ctx) {
    const lines = [];

    if (ctx.companyDescription) {
      lines.push(`Company description:\n"${ctx.companyDescription.slice(0, 600)}"`);
    }

    const si = ctx.strategicIntent;
    if (si) {
      lines.push(`\n=== STEP 1 — STRATEGIC INTENT ===`);
      
      // Strategic Vision
      if (si.strategicVision) {
        if (si.strategicVision.ambition) lines.push(`Ambition: "${si.strategicVision.ambition}"`);
        if ((si.strategicVision.themes || []).length) lines.push(`Themes: ${si.strategicVision.themes.join(' · ')}`);
        if (si.strategicVision.timeframe) lines.push(`Timeframe: ${si.strategicVision.timeframe}`);
      }
      
      if (si.situation_narrative) lines.push(`Situation: ${si.situation_narrative}`);
      
      // Constraints (array of objects)
      if ((si.constraints || []).length) {
        const constraintStrs = si.constraints.map(c => `${c.type}: ${c.description}`);
        lines.push(`Constraints: ${constraintStrs.join(' | ')}`);
      }
      
      // Success Metrics (array of objects)
      if ((si.successMetrics || []).length) {
        const metricStrs = si.successMetrics.map(m => `${m.metric} (${m.target} ${m.timeframe})`);
        lines.push(`Success metrics: ${metricStrs.join(' | ')}`);
      }
      
      if ((si.investigation_scope || []).length) lines.push(`EA scope: ${si.investigation_scope.join(' | ')}`);
      if ((si.expected_outcomes || []).length) lines.push(`Outcomes: ${si.expected_outcomes.join(' · ')}`);
    }

    const bmc = ctx.bmc;
    if (bmc) {
      lines.push(`\n=== STEP 2 — BUSINESS MODEL CANVAS ===`);
      if (bmc.value_proposition) lines.push(`Value proposition: "${bmc.value_proposition}"`);
      if ((bmc.customer_segments || []).length) lines.push(`Customers: ${bmc.customer_segments.join(' · ')}`);
      if ((bmc.revenue_streams || []).length) lines.push(`Revenue: ${bmc.revenue_streams.join(' · ')}`);
      if ((bmc.key_activities || []).length) lines.push(`Key activities: ${bmc.key_activities.join(' · ')}`);
    }

    const caps = ctx.capabilities;
    if (caps && caps.length) {
      lines.push(`\n=== STEP 3 — CAPABILITY ARCHITECTURE ===`);
      lines.push(`${caps.length} capabilities across domains: ${[...new Set(caps.map(c => c.domain))].join(', ')}`);
      const highPri = caps.filter(c => c.strategicImportance === 'high').slice(0, 5);
      if (highPri.length) lines.push(`High-priority: ${highPri.map(c => `${c.name} (M${c.maturity})`).join(', ')}`);
      if (ctx.priorityGaps && ctx.priorityGaps.length) lines.push(`Priority gaps: ${ctx.priorityGaps.join(', ')}`);
    }

    const om = ctx.operatingModel;
    if (om && om.valueProposition) {
      lines.push(`\n=== STEP 4 — OPERATING MODEL ===`);
      lines.push(`Value proposition: "${om.valueProposition}"`);
    }

    if (ctx.valuePools && ctx.valuePools.length) {
      lines.push(`\n=== STEP 6 — VALUE POOLS ===`);
      lines.push(ctx.valuePools.map(p => `${p.name} (${p.value_driver}, ${p.time_horizon})`).join(' · '));
    }

    return lines.join('\n');
  }

  return { build, summarize };

})();
