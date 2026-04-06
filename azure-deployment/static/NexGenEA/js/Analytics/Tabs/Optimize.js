/**
 * Optimize.js — Optimize tab workflow (5 tasks).
 *
 * Defines optimization criteria, maps capability interactions, generates
 * alternative roadmap configurations, analyses trade-offs, and produces
 * a final optimization recommendation.
 *
 * Task sequence:
 *   OP-1: Optimization Criteria Definition    (action)
 *   OP-2: Capability Interaction Graph        (analysis)
 *   OP-3: Generate Alternative Roadmaps       (heavy)
 *   OP-4: Analyse Trade-offs                  (analysis)
 *   OP-5: Recommendation & Rationale          (discovery)
 */

const Optimize = (() => {

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
    // OP-1: Optimization Criteria Definition
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'op-1',
      title:           'Optimization Criteria Definition',
      taskType:        'action',
      instructionFile: 'Analytics/Instructions/optimize/op_1_criteria.instruction.md',

      systemPrompt: (ctx) => {
        const industry = ctx.masterData?.industry || 'General';
        return `You are defining optimization criteria for an EA programme delivery model in ${industry}.
Criteria must be measurable, mutually exclusive, and collectively exhaustive (MECE).
Standard dimensions: speed, cost, value, risk, interdependency, strategic alignment.
Output ONLY valid JSON.`;
      },

      userPrompt: (ctx, userInput) => {
        const weights    = userInput?.weights || {};
        const ambition   = ctx.strategicIntent?.strategic_ambition || ctx.strategicIntentSummary || 'not specified';
        const constraints = (ctx.masterData?.constraints || []).join('; ');

        const weightsStr = Object.keys(weights).length > 0
          ? `User-defined weights: ${JSON.stringify(weights)}`
          : 'Use default equal weights.';

        return `Define optimization criteria for this EA programme.
${weightsStr}
Strategic ambition: "${ambition}".
Known constraints: ${constraints || 'none'}.

Output JSON:
{"criteria":[{"id":"string","name":"string","description":"string","weight":number,"measurementMethod":"string","target":"string"}],"primaryObjective":"string","secondaryObjectives":["string"],"constraints":["string"],"totalWeight":1.0}`;
      },

      outputSchema: { criteria: ['object'], primaryObjective: 'string', totalWeight: 'number' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.criteria) return parsed;
        return { criteria: [], primaryObjective: '', totalWeight: 1.0 };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // OP-2: Capability Interaction Graph
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'op-2',
      title:           'Capability Interaction Graph',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/optimize/op_2_interaction.instruction.md',

      systemPrompt: (ctx) => {
        return `You are mapping capability interaction and dependency graphs for an EA programme.
Identify: prerequisite relationships, synergistic pairs, competing resources, and platform dependencies.
Graph quality matters — shallow analysis is worthless. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const caps    = ctx.capabilities || [];
        const roadmap = ctx.roadmap     || {};
        return `Map interaction relationships between these capabilities:

Capabilities: ${JSON.stringify(caps.slice(0, 15), null, 2)}
Roadmap waves: ${JSON.stringify(roadmap.waves || [], null, 2)}

Output JSON:
{"nodes":[{"capabilityId":"string","name":"string","layer":"foundation|enabler|differentiator"}],"edges":[{"from":"string","to":"string","type":"prerequisite|synergy|conflict","strength":"high|medium|low","description":"string"}],"clusters":[{"name":"string","capabilityIds":["string"],"rationale":"string"}],"criticalDependencies":["string"],"platformCapabilities":["string"]}`;
      },

      outputSchema: { nodes: ['object'], edges: ['object'], criticalDependencies: ['string'] },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.nodes) return parsed;
        return { nodes: [], edges: [], clusters: [], criticalDependencies: [], platformCapabilities: [] };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // OP-3: Generate Alternative Roadmaps
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'op-3',
      title:           'Generate Alternative Roadmaps',
      taskType:        'heavy',
      instructionFile: 'Analytics/Instructions/optimize/op_3_alternatives.instruction.md',

      systemPrompt: (ctx) => {
        return `You are generating 3 alternative EA delivery roadmaps optimised for different objectives.
Each alternative must be a genuine trade-off — not minor variations.
Alternatives: (A) Speed-first, (B) Value-first, (C) Risk-minimise.
Respect capability dependencies from the interaction graph. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const criteria    = ctx['op-1']        || {};
        const interactions = ctx['op-2']       || {};
        const origRoadmap = ctx.roadmap        || {};
        const caps        = ctx.capabilities   || [];
        return `Generate 3 alternative delivery roadmaps:

Optimization criteria: ${JSON.stringify(criteria, null, 2)}
Capability interactions: ${JSON.stringify(interactions, null, 2)}
Original roadmap: ${JSON.stringify(origRoadmap, null, 2)}

Output JSON:
{"alternatives":[{"id":"string","name":"string","objective":"string","waves":[{"phase":number,"name":"string","initiatives":["string"],"months":"string"}],"totalMonths":number,"estimatedValueK":number,"estimatedCostK":number,"riskLevel":"low|medium|high","tradeoffs":["string"]}],"baselineComparison":{"duration":number,"value":number,"cost":number}}`;
      },

      outputSchema: { alternatives: ['object'], baselineComparison: 'object' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.alternatives) return parsed;
        return { alternatives: [], baselineComparison: {} };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // OP-4: Analyse Trade-offs
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'op-4',
      title:           'Analyse Trade-offs',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/optimize/op_4_tradeoffs.instruction.md',

      systemPrompt: (ctx) => {
        return `You are performing a weighted multi-criteria trade-off analysis across alternative roadmaps.
Score each alternative against each criterion. Compute a weighted total score.
Identify the Pareto-dominant option. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const criteria     = ctx['op-1']?.criteria || [];
        const alternatives = ctx['op-3']?.alternatives || [];
        return `Perform trade-off analysis using these criteria and alternatives:

Criteria (with weights): ${JSON.stringify(criteria, null, 2)}
Alternatives: ${JSON.stringify(alternatives, null, 2)}

Output JSON:
{"scoring":[{"alternativeId":"string","alternativeName":"string","scores":[{"criterionId":"string","score":number,"rationale":"string"}],"weightedTotal":number,"rank":number}],"paretoFront":["string"],"sensitivityNotes":"string","recommendation":"string"}`;
      },

      outputSchema: { scoring: ['object'], paretoFront: ['string'], recommendation: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.scoring) return parsed;
        return { scoring: [], paretoFront: [], recommendation: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // OP-5: Recommendation & Rationale
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'op-5',
      title:           'Recommendation & Rationale',
      taskType:        'discovery',
      instructionFile: 'Analytics/Instructions/optimize/op_5_recommendation.instruction.md',

      systemPrompt: (ctx) => {
        return `You are writing a definitive optimization recommendation for the EA programme.
Lead with the recommendation. Justify with evidence from the analysis.
Include adjustments that would make the winning alternative even stronger. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const tradeoffs    = ctx['op-4']   || {};
        const alternatives = ctx['op-3']?.alternatives || [];
        const criteria     = ctx['op-1']?.criteria || [];
        return `Synthesize into a final recommendation:

Trade-off analysis: ${JSON.stringify(tradeoffs, null, 2)}
Alternatives: ${JSON.stringify(alternatives, null, 2)}
Criteria: ${JSON.stringify(criteria, null, 2)}

Output JSON:
{"recommendedAlternativeId":"string","recommendedAlternativeName":"string","rationale":"string","keyAdvantages":["string"],"acceptedTradeoffs":["string"],"suggestedAdaptations":["string"],"implementationGuidance":"string","decisionConfidence":"high|medium|low","nextSteps":["string"]}`;
      },

      outputSchema: { recommendedAlternativeId: 'string', rationale: 'string', keyAdvantages: ['string'] },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.recommendedAlternativeId) return parsed;
        return { recommendedAlternativeId: '', rationale: '', keyAdvantages: [], nextSteps: [] };
      }
    }

  ]; // end tasks[]

  // ── synthesize ────────────────────────────────────────────────────────────

  function synthesize(tabState) {
    const op3 = tabState.taskResults['op-3']?.output || {};
    const op4 = tabState.taskResults['op-4']?.output || {};
    const op5 = tabState.taskResults['op-5']?.output || {};

    return {
      alternatives:            op3.alternatives || [],
      recommendedAlternative:  op5.recommendedAlternativeName || op4.recommendation || '',
      score:                   (op4.scoring || []).find(s => s.alternativeId === op5.recommendedAlternativeId) || null,
      keyAdvantages:           op5.keyAdvantages       || [],
      acceptedTradeoffs:       op5.acceptedTradeoffs   || [],
      nextSteps:               op5.nextSteps           || [],
      rationale:               op5.rationale           || '',
      decisionConfidence:      op5.decisionConfidence  || 'medium',
      interactionGraph:        tabState.taskResults['op-2']?.output || {}
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    id:          'optimize',
    name:        'Optimize',
    description: 'Generate and compare optimised roadmap alternatives using multi-criteria analysis',
    dependsOn:   [],
    tasks,
    synthesize
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Optimize;
}
