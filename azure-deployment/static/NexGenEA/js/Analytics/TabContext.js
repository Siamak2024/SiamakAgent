/**
 * TabContext.js — Per-tab context preparation for AI prompts.
 *
 * Thin helper on top of AnalyticsContextBuilder.getTabContext().
 * Handles:
 *   - Sanitizing large arrays for AI (truncate to N items)
 *   - Adding defaults for missing fields
 *   - Building compact text summaries for AI prompt injection
 *
 * Usage:
 *   const prepared = TabContext.prepareForAI('decision-intelligence', tabCtx);
 */

const TabContext = (() => {

  // Max items to send to AI for large arrays (reduces token usage)
  const MAX_CAPABILITIES = 20;
  const MAX_GAPS         = 15;
  const MAX_WAVES        = 5;
  const MAX_VALUE_POOLS  = 10;

  /**
   * Prepare tab-specific context for inclusion in AI prompts.
   * Trims large arrays, fills in defaults, builds text summaries.
   *
   * @param {string} tabId   - "decision-intelligence" | "scenarios" | "financial" | "optimize"
   * @param {object} tabCtx  - Output of AnalyticsContextBuilder.getTabContext()
   * @returns {object} Sanitized, AI-ready context
   */
  function prepareForAI(tabId, tabCtx) {
    const base = {
      projectName:      tabCtx.projectName      || 'Unnamed project',
      language:         tabCtx.language         || 'en',
      architectureMode: tabCtx.architectureMode || 'standard',
      masterData:       _sanitiseMasterData(tabCtx.masterData),
      workflowStatus:   tabCtx.workflowStatus   || {}
    };

    switch (tabId) {
      case 'decision-intelligence':
        return {
          ...base,
          strategicIntentSummary: _summariseIntent(tabCtx.strategicIntent),
          capabilities:           _trimArray(tabCtx.capabilities, MAX_CAPABILITIES),
          gapAnalysis:            _trimArray(tabCtx.gapAnalysis,  MAX_GAPS),
          capabilityCount:        (tabCtx.capabilities || []).length,
          gapCount:               (tabCtx.gapAnalysis  || []).length
        };

      case 'scenarios':
        return {
          ...base,
          capabilities:     _trimArray(tabCtx.capabilities, MAX_CAPABILITIES),
          gapAnalysis:      _trimArray(tabCtx.gapAnalysis,  MAX_GAPS),
          roadmapSummary:   _summariseRoadmap(tabCtx.roadmap),
          operatingModelSummary: _summariseOM(tabCtx.operatingModel)
        };

      case 'financial':
        return {
          ...base,
          capabilities:     _trimArray(tabCtx.capabilities, MAX_CAPABILITIES),
          gapAnalysis:      _trimArray(tabCtx.gapAnalysis,  MAX_GAPS),
          valuePools:       _trimArray(tabCtx.valuePools,   MAX_VALUE_POOLS),
          roadmapSummary:   _summariseRoadmap(tabCtx.roadmap),
          totalValuePool:   _totalValue(tabCtx.valuePools),
          waveCount:        (tabCtx.roadmap?.waves || []).length
        };

      case 'optimize':
        return {
          ...base,
          capabilities:            _trimArray(tabCtx.capabilities, MAX_CAPABILITIES),
          gapAnalysis:             _trimArray(tabCtx.gapAnalysis,  MAX_GAPS),
          roadmapSummary:          _summariseRoadmap(tabCtx.roadmap),
          dependencyGraph:         _buildDependencyGraph(tabCtx.capabilities),
          operatingModelSummary:   _summariseOM(tabCtx.operatingModel)
        };

      default:
        return { ...base, capabilities: _trimArray(tabCtx.capabilities, MAX_CAPABILITIES) };
    }
  }

  // ── Private sanitization helpers ──────────────────────────────────────────

  function _trimArray(arr, maxN) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, maxN);
  }

  function _sanitiseMasterData(md) {
    if (!md) return {};
    return {
      industry:            md.industry            || 'General',
      businessAreas:       (md.businessAreas      || []).slice(0, 10),
      businessModel:       md.businessModel       || '',
      offerings:           (md.offerings          || []).slice(0, 5),
      customerSegments:    (md.customerSegments   || []).slice(0, 5),
      strategicPriorities: (md.strategicPriorities|| []).slice(0, 5),
      constraints:         (md.constraints        || []).slice(0, 5),
      coreSystems:         (md.coreSystems        || []).slice(0, 8),
      regulations:         (md.regulations        || []).slice(0, 5)
    };
  }

  function _summariseIntent(si) {
    if (!si) return 'Strategic intent not yet defined.';
    const ambition = si.strategic_ambition || si.ambition || '';
    const themes   = (si.strategic_themes  || si.themes || []).join(', ');
    const platform = si.burning_platform   || '';
    return [
      ambition && `Ambition: ${ambition}`,
      themes   && `Themes: ${themes}`,
      platform && `Burning platform: ${platform}`
    ].filter(Boolean).join('\n') || 'Strategic intent available.';
  }

  function _summariseRoadmap(roadmap) {
    if (!roadmap) return 'Roadmap not yet generated.';
    const waves = roadmap.waves || [];
    if (!waves.length) return 'Roadmap exists but has no waves.';
    return waves.slice(0, MAX_WAVES).map(w =>
      `${w.name} (${w.timeline || ''}): ${(w.initiatives || []).join(', ')}`
    ).join('\n');
  }

  function _summariseOM(om) {
    if (!om) return 'Operating model not yet generated.';
    const cur = om.current || {};
    return `Structure: ${cur.organisation_governance?.structure || 'unknown'}. ` +
           `Systems: ${Object.keys(cur.application_data_landscape || {}).join(', ') || 'unknown'}.`;
  }

  function _totalValue(valuePools) {
    if (!Array.isArray(valuePools)) return 0;
    return valuePools.reduce((sum, vp) => sum + (Number(vp.financial_impact) || 0), 0);
  }

  function _buildDependencyGraph(capabilities) {
    if (!Array.isArray(capabilities)) return {};
    const graph = {};
    capabilities.forEach(c => {
      graph[c.id || c.name] = c.dependsOn || c.depends_on || [];
    });
    return graph;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return { prepareForAI };

})();

// Browser + Node.js dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TabContext;
}
