/**
 * Scenarios.js — Scenarios tab workflow (6 tasks).
 *
 * Defines and validates scenarios (e.g. capability failure, budget cut),
 * analyses dependency impacts, models resource reallocation, recalculates
 * the roadmap under constraints, compares to the baseline, and assesses
 * resilience.
 *
 * Task sequence:
 *   SC-1: Scenario Definition & Validation    (action)
 *   SC-2: Dependency Impact Analysis          (heavy)
 *   SC-3: Resource Reallocation Model         (analysis)
 *   SC-4: Recalculate Roadmap                 (heavy)
 *   SC-5: Compare vs Main Roadmap             (analysis)
 *   SC-6: Resilience & Mitigation             (discovery)
 */

const Scenarios = (() => {

  // ── Shared JSON parser ────────────────────────────────────────────────────
  function _parseJSON(raw) {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    const s = String(raw).trim();
    const clean = s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    try { return JSON.parse(clean); }
    catch(_) {
      const arr = clean.match(/\[[\s\S]*\]/);
      if (arr) try { return JSON.parse(arr[0]); } catch(_) {}
      const obj = clean.match(/\{[\s\S]*\}/);
      if (obj) try { return JSON.parse(obj[0]); } catch(_) {}
      return null;
    }
  }

  // ── TASK DEFINITIONS ─────────────────────────────────────────────────────

  const tasks = [

    // ─────────────────────────────────────────────────────────────────────
    // SC-1: Scenario Definition & Validation
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'sc-1',
      title:           'Scenario Definition & Validation',
      taskType:        'action',
      instructionFile: 'Analytics/Instructions/scenarios/sc_1_definition.instruction.md',

      systemPrompt: (ctx) => {
        const industry = ctx.masterData?.industry || 'General';
        return `You are an enterprise risk analyst defining planning scenarios for a ${industry} company.
Valid scenario types: capability-failure, budget-cut, timeline-compression, resource-reduction, regulatory-change, market-disruption.
Create or validate the proposed scenario and define its parameters precisely. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx, userInput) => {
        const scenarioType = userInput?.scenarioType || 'budget-cut';
        const capabilityId = userInput?.capabilityId || '';
        const magnitude    = userInput?.magnitude    || '30%';
        const caps         = ctx.capabilities        || [];

        let scenarioContext = '';
        if (scenarioType === 'capability-failure' && capabilityId) {
          const cap = caps.find(c => c.id === capabilityId || c.capabilityId === capabilityId);
          scenarioContext = cap
            ? `Targeted capability: ${JSON.stringify(cap)}`
            : `Targeted capability ID: ${capabilityId}`;
        }

        return `Define and validate this scenario:
Type: ${scenarioType}
Magnitude: ${magnitude}
${scenarioContext}

Available capabilities for reference: ${JSON.stringify(caps.slice(0, 10), null, 2)}
Roadmap context: ${JSON.stringify(ctx.roadmap || {}, null, 2)}

Output JSON:
{"scenarioId":"string","scenarioType":"string","name":"string","description":"string","magnitude":"string","affectedCapabilityIds":["string"],"triggerCondition":"string","timeframe":"string","assumptions":["string"],"isValid":true}`;
      },

      outputSchema: { scenarioId: 'string', scenarioType: 'string', name: 'string', isValid: 'boolean' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.scenarioId) return parsed;
        return { scenarioId: 'sc-generic', scenarioType: 'budget-cut', name: 'Generic Scenario', isValid: true };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // SC-2: Dependency Impact Analysis
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'sc-2',
      title:           'Dependency Impact Analysis',
      taskType:        'heavy',
      instructionFile: 'Analytics/Instructions/scenarios/sc_2_impact.instruction.md',

      systemPrompt: (ctx) => {
        return `You are an enterprise dependency analyst performing deep impact analysis.
Map downstream effects across all platform capabilities affected by the scenario.
Consider: technical dependencies, resource sharing, timeline knock-ons, and value pool degradation.
Be comprehensive — find second-order effects. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const scenario = ctx['sc-1']   || {};
        const caps     = ctx.capabilities || [];
        const roadmap  = ctx.roadmap     || {};
        return `Analyse the cascade impact of this scenario on the entire capability portfolio:

Scenario: ${JSON.stringify(scenario, null, 2)}
All capabilities: ${JSON.stringify(caps.slice(0, 15), null, 2)}
Roadmap waves: ${JSON.stringify(roadmap.waves || [], null, 2)}

Output JSON:
{"directlyImpacted":["string"],"indirectlyImpacted":["string"],"criticalPathBreaks":["string"],"delayedInitiatives":[{"capabilityId":"string","originalTime":"string","newTime":"string","reason":"string"}],"cascadeEffects":["string"],"severityScore":number,"overallImpact":"string"}`;
      },

      outputSchema: { directlyImpacted: ['string'], cascadeEffects: ['string'], severityScore: 'number', overallImpact: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.directlyImpacted) return parsed;
        return { directlyImpacted: [], indirectlyImpacted: [], cascadeEffects: [], severityScore: 0, overallImpact: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // SC-3: Resource Reallocation Model
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'sc-3',
      title:           'Resource Reallocation Model',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/scenarios/sc_3_reallocation.instruction.md',

      systemPrompt: (ctx) => {
        return `You are modeling resource reallocation under a constrained scenario.
Optimise for maximum strategic value delivery within the new constraints.
Identify what must be deferred, accelerated, cancelled, or restructured. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const scenario = ctx['sc-1'] || {};
        const impact   = ctx['sc-2'] || {};
        const caps     = ctx.capabilities || [];
        return `Model resource reallocation given scenario impact:

Scenario: ${JSON.stringify(scenario, null, 2)}
Impact analysis: ${JSON.stringify(impact, null, 2)}
Available capabilities: ${JSON.stringify(caps.slice(0, 12), null, 2)}

Output JSON:
{"reallocations":[{"capabilityId":"string","action":"defer|cancel|accelerate|restructure","reason":"string","resourceSavingK":number,"valueImpactK":number}],"preservedCapabilities":["string"],"cancelledCapabilities":["string"],"totalResourceSavingK":number,"strategyPreservationPct":number}`;
      },

      outputSchema: { reallocations: ['object'], preservedCapabilities: ['string'], strategyPreservationPct: 'number' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.reallocations) return parsed;
        return { reallocations: [], preservedCapabilities: [], cancelledCapabilities: [], strategyPreservationPct: 0 };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // SC-4: Recalculate Roadmap
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'sc-4',
      title:           'Recalculate Roadmap Under Scenario',
      taskType:        'heavy',
      instructionFile: 'Analytics/Instructions/scenarios/sc_4_recalculate.instruction.md',

      systemPrompt: (ctx) => {
        return `You are rebuilding the EA delivery roadmap under scenario constraints.
Respect the reallocation decisions. Maintain strategic coherence where possible.
Show the adjusted wave structure and revised timelines. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const scenario     = ctx['sc-1']   || {};
        const reallocation = ctx['sc-3']   || {};
        const origRoadmap  = ctx.roadmap   || {};
        return `Recalculate the delivery roadmap given the scenario and reallocation:

Scenario: ${JSON.stringify(scenario, null, 2)}
Reallocation decisions: ${JSON.stringify(reallocation, null, 2)}
Original roadmap: ${JSON.stringify(origRoadmap, null, 2)}

Output JSON:
{"adjustedWaves":[{"phase":number,"name":"string","initiatives":["string"],"startMonth":number,"endMonth":number,"rationale":"string"}],"deferredTo":[{"initiative":"string","deferredToMonth":number}],"completeDateMonths":number,"strategyAchievabilityPct":number,"keyChanges":["string"]}`;
      },

      outputSchema: { adjustedWaves: ['object'], strategyAchievabilityPct: 'number' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.adjustedWaves) return parsed;
        return { adjustedWaves: [], deferredTo: [], completeDateMonths: 0, strategyAchievabilityPct: 0, keyChanges: [] };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // SC-5: Compare vs Main Roadmap
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'sc-5',
      title:           'Compare vs Main Roadmap',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/scenarios/sc_5_compare.instruction.md',

      systemPrompt: (ctx) => {
        return `You are comparing the scenario-adjusted roadmap against the base plan.
Quantify the delta in value delivery, timelines, and strategic coverage.
Be specific with numbers — months delayed, value lost, coverage degraded. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const origRoadmap = ctx.roadmap     || {};
        const adjRoadmap  = ctx['sc-4']    || {};
        const realloc     = ctx['sc-3']    || {};
        return `Compare the adjusted roadmap to the baseline:

Original roadmap: ${JSON.stringify(origRoadmap, null, 2)}
Adjusted roadmap: ${JSON.stringify(adjRoadmap, null, 2)}
Reallocation decisions: ${JSON.stringify(realloc, null, 2)}

Output JSON:
{"timelineDeltaMonths":number,"valueLostK":number,"strategyGapPct":number,"capabilitiesAffectedCount":number,"deltas":[{"area":"string","original":"string","scenario":"string","impact":"string"}],"isScenarioRecoverable":true,"recoveryActions":["string"],"overallAssessment":"string"}`;
      },

      outputSchema: { timelineDeltaMonths: 'number', valueLostK: 'number', overallAssessment: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (typeof parsed?.timelineDeltaMonths !== 'undefined') return parsed;
        return { timelineDeltaMonths: 0, valueLostK: 0, strategyGapPct: 0, overallAssessment: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // SC-6: Resilience & Mitigation
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'sc-6',
      title:           'Resilience & Mitigation Strategy',
      taskType:        'discovery',
      instructionFile: 'Analytics/Instructions/scenarios/sc_6_resilience.instruction.md',

      systemPrompt: (ctx) => {
        return `You are an enterprise resilience strategist designing mitigation actions.
Create actionable mitigations that restore strategic capability delivery.
Recommend monitoring triggers and contingency thresholds. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const comparison = ctx['sc-5'] || {};
        const scenario   = ctx['sc-1'] || {};
        const impact     = ctx['sc-2'] || {};
        return `Design a resilience and mitigation strategy for:

Scenario: ${JSON.stringify(scenario, null, 2)}
Impact: ${JSON.stringify(impact, null, 2)}
Comparison: ${JSON.stringify(comparison, null, 2)}

Output JSON:
{"resilienceScore":number,"mitigationActions":[{"action":"string","priority":"high|medium|low","timeframe":"string","responsibleRole":"string","cost":"string"}],"monitoringTriggers":["string"],"contingencyPlan":"string","earlyWarnings":["string"],"recommendation":"string"}`;
      },

      outputSchema: { mitigationActions: ['object'], resilienceScore: 'number', recommendation: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.mitigationActions) return parsed;
        return { mitigationActions: [], resilienceScore: 0, recommendation: '' };
      }
    }

  ]; // end tasks[]

  // ── synthesize ────────────────────────────────────────────────────────────

  function synthesize(tabState) {
    const sc1 = tabState.taskResults['sc-1']?.output || {};
    const sc2 = tabState.taskResults['sc-2']?.output || {};
    const sc4 = tabState.taskResults['sc-4']?.output || {};
    const sc5 = tabState.taskResults['sc-5']?.output || {};
    const sc6 = tabState.taskResults['sc-6']?.output || {};

    return {
      scenarioName:        sc1.name          || '',
      impactSeverity:      sc2.severityScore  || 0,
      adjustedRoadmap:     sc4.adjustedWaves  || [],
      timelineDeltaMonths: sc5.timelineDeltaMonths || 0,
      valueLostK:          sc5.valueLostK     || 0,
      strategyPreservation: sc4.strategyAchievabilityPct || 0,
      mitigationActions:   sc6.mitigationActions || [],
      recommendation:      sc6.recommendation || sc5.overallAssessment || '',
      isRecoverable:       sc5.isScenarioRecoverable !== false
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    id:          'scenarios',
    name:        'Scenario Analysis',
    description: 'Analyse impact of disruptions, model reallocation, and recalculate roadmap',
    dependsOn:   [],
    tasks,
    synthesize
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Scenarios;
}
