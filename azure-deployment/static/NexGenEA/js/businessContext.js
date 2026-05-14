/**
 * Business Context Data Model Functions
 * Phase 1: Core functions to support businessContext architecture
 * 
 * This module provides:
 * - Data model initialization
 * - Context string building for AI prompts
 * - Migration from legacy strategicIntent
 * - Validation functions
 */

/**
 * Initialize empty enrichment structure
 * @returns {Object} Empty enrichment object
 */
function initializeEnrichment() {
  return {
    bmcInsights: {},
    capabilityGaps: [],
    operatingModelRisks: [],
    criticalGaps: [],
    valueStreamInsights: [],
    roadmapConstraints: [],
    validatedData: {
      organizationValidation: null,
      objectiveBenchmarks: [],
      industryInsights: null,
      technologyValidation: [],
      regulatoryContext: []
    },
    questionnaireResponses: [],
    completenessScore: 0
  };
}

/**
 * Build context string from businessContext for AI prompts
 * Replaces buildBusinessObjectivesContext()
 * @param {Object} model - The model containing businessContext
 * @returns {string} Formatted context string
 */
function buildBusinessContextContext(model) {
  if (!model || !model.businessContext) {
    return 'No business context available.';
  }

  const ctx = model.businessContext;
  let contextStr = '=== BUSINESS CONTEXT (PRIMARY DRIVER) ===\n\n';

  // Mandatory fields
  if (ctx.org_name) {
    contextStr += `Organization: ${ctx.org_name}\n`;
  }
  if (ctx.industry) {
    contextStr += `Industry: ${ctx.industry}\n`;
  }
  contextStr += '\n';

  // Primary Objectives (CRITICAL - drives everything)
  if (ctx.primaryObjectives && ctx.primaryObjectives.length > 0) {
    contextStr += '📌 PRIMARY OBJECTIVES:\n';
    ctx.primaryObjectives.forEach((obj, idx) => {
      contextStr += `${idx + 1}. ${obj.objective} (${obj.category})\n`;
      if (obj.measurable && obj.kpis && obj.kpis.length > 0) {
        contextStr += `   KPIs: ${obj.kpis.join(', ')}\n`;
      }
      if (obj.linkedCapabilities && obj.linkedCapabilities.length > 0) {
        contextStr += `   Linked Capabilities: ${obj.linkedCapabilities.join(', ')}\n`;
      }
    });
    contextStr += '\n';
  }

  // Key Challenges
  if (ctx.keyChallenges && ctx.keyChallenges.length > 0) {
    contextStr += '⚠️ KEY CHALLENGES:\n';
    ctx.keyChallenges.forEach((ch, idx) => {
      contextStr += `${idx + 1}. ${ch.challenge} (Impact: ${ch.impact || 'Unknown'})\n`;
    });
    contextStr += '\n';
  }

  // Success Metrics
  if (ctx.successMetrics && ctx.successMetrics.length > 0) {
    contextStr += '📊 SUCCESS METRICS:\n';
    ctx.successMetrics.forEach((metric, idx) => {
      contextStr += `${idx + 1}. ${metric.metric}: ${metric.target} (${metric.timeframe})\n`;
    });
    contextStr += '\n';
  }

  // Constraints
  if (ctx.constraints && ctx.constraints.length > 0) {
    contextStr += '🚧 CONSTRAINTS:\n';
    ctx.constraints.forEach((constraint, idx) => {
      contextStr += `${idx + 1}. [${constraint.type}] ${constraint.description}\n`;
    });
    contextStr += '\n';
  }

  // Strategic Vision (OPTIONAL - demoted)
  if (ctx.strategicVision && ctx.strategicVision.ambition) {
    contextStr += '🎯 STRATEGIC VISION (Optional):\n';
    contextStr += `Ambition: ${ctx.strategicVision.ambition}\n`;
    if (ctx.strategicVision.themes && ctx.strategicVision.themes.length > 0) {
      contextStr += `Themes: ${ctx.strategicVision.themes.join(', ')}\n`;
    }
    if (ctx.strategicVision.timeframe) {
      contextStr += `Timeframe: ${ctx.strategicVision.timeframe}\n`;
    }
    contextStr += '\n';
  }

  // Enrichment data (captured from Steps 2-7)
  if (ctx.enrichment) {
    contextStr += '=== ENRICHMENT DATA ===\n\n';

    // BMC Insights
    if (ctx.enrichment.bmcInsights && Object.keys(ctx.enrichment.bmcInsights).length > 0) {
      contextStr += '📋 BMC Insights:\n';
      const bmc = ctx.enrichment.bmcInsights;
      if (bmc.keyInsights) {
        contextStr += `  ${bmc.keyInsights}\n`;
      }
      if (bmc.customerSegments) {
        contextStr += `  Customer Segments: ${Array.isArray(bmc.customerSegments) ? bmc.customerSegments.join(', ') : bmc.customerSegments}\n`;
      }
      contextStr += '\n';
    }

    // Capability Gaps
    if (ctx.enrichment.capabilityGaps && ctx.enrichment.capabilityGaps.length > 0) {
      contextStr += '🔧 Capability Gaps:\n';
      ctx.enrichment.capabilityGaps.forEach((gap, idx) => {
        contextStr += `  ${idx + 1}. ${gap.capability}: Level ${gap.currentLevel} → ${gap.targetLevel} (Priority: ${gap.priority})\n`;
      });
      contextStr += '\n';
    }

    // Operating Model Risks
    if (ctx.enrichment.operatingModelRisks && ctx.enrichment.operatingModelRisks.length > 0) {
      contextStr += '⚠️ Operating Model Risks:\n';
      ctx.enrichment.operatingModelRisks.forEach((risk, idx) => {
        contextStr += `  ${idx + 1}. ${risk.risk} (Severity: ${risk.severity})\n`;
      });
      contextStr += '\n';
    }

    // Critical Gaps
    if (ctx.enrichment.criticalGaps && ctx.enrichment.criticalGaps.length > 0) {
      contextStr += '🚨 Critical Gaps:\n';
      ctx.enrichment.criticalGaps.forEach((gap, idx) => {
        contextStr += `  ${idx + 1}. ${gap.gap} - ${gap.impact}\n`;
      });
      contextStr += '\n';
    }

    // Value Stream Insights
    if (ctx.enrichment.valueStreamInsights && ctx.enrichment.valueStreamInsights.length > 0) {
      contextStr += '💰 Value Stream Insights:\n';
      ctx.enrichment.valueStreamInsights.forEach((insight, idx) => {
        contextStr += `  ${idx + 1}. ${insight.valueStream}: ${insight.insight}\n`;
      });
      contextStr += '\n';
    }

    // Roadmap Constraints
    if (ctx.enrichment.roadmapConstraints && ctx.enrichment.roadmapConstraints.length > 0) {
      contextStr += '📅 Roadmap Constraints:\n';
      ctx.enrichment.roadmapConstraints.forEach((constraint, idx) => {
        contextStr += `  ${idx + 1}. ${constraint.constraint}\n`;
      });
      contextStr += '\n';
    }

    // Validated Data (from web search)
    if (ctx.enrichment.validatedData) {
      const vd = ctx.enrichment.validatedData;
      
      if (vd.organizationValidation) {
        contextStr += '✓ Organization Validation:\n';
        contextStr += `  Verified: ${vd.organizationValidation.org_name} (${vd.organizationValidation.industry})\n`;
        contextStr += `  Confidence: ${(vd.organizationValidation.confidence * 100).toFixed(0)}%\n\n`;
      }

      if (vd.objectiveBenchmarks && vd.objectiveBenchmarks.length > 0) {
        contextStr += '📊 Objective Benchmarks:\n';
        vd.objectiveBenchmarks.forEach((benchmark, idx) => {
          contextStr += `  ${idx + 1}. ${benchmark.objective}\n`;
          contextStr += `     Industry: ${benchmark.industryBenchmark}\n`;
          contextStr += `     Feasibility: ${(benchmark.feasibilityScore * 100).toFixed(0)}%\n`;
        });
        contextStr += '\n';
      }
    }

    // Completeness Score
    contextStr += `Enrichment Completeness: ${ctx.enrichment.completenessScore}%\n`;
  }

  return contextStr;
}

/**
 * Migrate legacy strategicIntent model to new businessContext structure
 * Preserves backward compatibility during transition
 * @param {Object} legacyModel - Model with old strategicIntent structure
 * @returns {Object} Model with new businessContext structure (preserves legacy)
 */
function migrateStrategicIntentToBusinessContext(legacyModel) {
  if (!legacyModel) {
    return legacyModel;
  }

  // If already migrated, return as-is
  if (legacyModel.businessContext) {
    return legacyModel;
  }

  const migratedModel = { ...legacyModel };

  // Create new businessContext from strategicIntent
  if (legacyModel.strategicIntent) {
    const si = legacyModel.strategicIntent;
    
    migratedModel.businessContext = {
      // Mandatory fields
      org_name: si.org_name || '',
      industry: si.industry || '',
      
      // Merge businessObjectives if they exist
      primaryObjectives: [],
      keyChallenges: [],
      successMetrics: [],
      constraints: [],
      
      // Demote strategic_ambition to optional strategicVision
      strategicVision: {
        ambition: si.strategic_ambition || '',
        themes: si.strategic_themes || [],
        timeframe: si.time_horizon || ''
      },
      
      // Initialize enrichment
      enrichment: initializeEnrichment()
    };

    // Convert success_metrics array to structured successMetrics
    if (si.success_metrics && Array.isArray(si.success_metrics)) {
      migratedModel.businessContext.successMetrics = si.success_metrics.map((metric, idx) => ({
        metric: metric,
        target: '',
        timeframe: ''
      }));
    }

    // Convert key_challenges to keyChallenges
    if (si.key_challenges && Array.isArray(si.key_challenges)) {
      migratedModel.businessContext.keyChallenges = si.key_challenges.map((challenge, idx) => ({
        id: `ch${idx + 1}`,
        challenge: challenge,
        impact: 'Medium',
        category: 'General'
      }));
    }

    // Convert constraints
    if (si.constraints && Array.isArray(si.constraints)) {
      migratedModel.businessContext.constraints = si.constraints.map(constraint => ({
        type: 'General',
        description: constraint
      }));
    }
  }

  // Merge old businessObjectives into new primaryObjectives
  if (legacyModel.businessObjectives && legacyModel.businessObjectives.primaryObjectives) {
    migratedModel.businessContext.primaryObjectives = legacyModel.businessObjectives.primaryObjectives;
  }

  // Merge old keyChallenges if not already present
  if (legacyModel.businessObjectives && legacyModel.businessObjectives.keyChallenges) {
    if (migratedModel.businessContext.keyChallenges.length === 0) {
      migratedModel.businessContext.keyChallenges = legacyModel.businessObjectives.keyChallenges;
    }
  }

  // Keep strategicIntent for backward compatibility during transition
  migratedModel.strategicIntent = legacyModel.strategicIntent;

  return migratedModel;
}

/**
 * Validate businessContext structure
 * @param {Object} businessContext - The businessContext to validate
 * @returns {Object} Validation result { isValid: boolean, errors: string[] }
 */
function validateBusinessContext(businessContext) {
  const errors = [];

  if (!businessContext) {
    return { isValid: false, errors: ['businessContext is null or undefined'] };
  }

  // Mandatory fields
  if (!businessContext.org_name || businessContext.org_name.trim() === '') {
    errors.push('org_name is required');
  }

  if (!businessContext.industry || businessContext.industry.trim() === '') {
    errors.push('industry is required');
  }

  // Validate structure
  if (!Array.isArray(businessContext.primaryObjectives)) {
    errors.push('primaryObjectives must be an array');
  }

  if (!Array.isArray(businessContext.keyChallenges)) {
    errors.push('keyChallenges must be an array');
  }

  if (!businessContext.enrichment) {
    errors.push('enrichment object is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeEnrichment,
    buildBusinessContextContext,
    migrateStrategicIntentToBusinessContext,
    validateBusinessContext
  };
}
