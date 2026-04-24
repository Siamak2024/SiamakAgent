/**
 * Decision.js — Decision Intelligence tab workflow (5 tasks).
 *
 * Analyses capabilities, identifies quick wins, traces strategic gaps,
 * recommends sequencing, and produces an executive summary.
 *
 * Task sequence:
 *   DI-1: Capability Health Assessment   (analysis)
 *   DI-2: Identify Quick Wins            (analysis)
 *   DI-3: Strategic Gap Analysis         (discovery)
 *   DI-4: Sequencing Recommendation      (analysis)
 *   DI-5: Executive Summary              (discovery)
 *
 * Usage (via AnalyticsWorkflowEngine):
 *   const result = await AnalyticsWorkflowEngine.run('decision-intelligence', {}, model);
 */

const Decision = (() => {

  // ── Shared JSON parser ────────────────────────────────────────────────────
  function _parseJSON(raw) {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    const s = String(raw).trim();
    // Strip markdown fences
    const clean = s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    try { return JSON.parse(clean); }
    catch(_) {
      // Try to extract first JSON array/object
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
    // DI-1: Capability Health Assessment
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'di-1',
      title:           'Capability Health Assessment',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/decision-intelligence/di_1_health_assessment.instruction.md',

      systemPrompt: (ctx) => {
        const industry = ctx.masterData?.industry || 'General';
        const priorities = (ctx.masterData?.strategicPriorities || []).join(', ');
        return `You are an enterprise architect analyzing organizational capabilities for a ${industry} company.
Strategic priorities: ${priorities || 'not specified'}.
Score each capability on health (0–100), maturity gap (1–5), and business criticality (1–5).
Output ONLY valid JSON — an array of assessments. No prose, no markdown fences.`;
      },

      userPrompt: (ctx) => {
        const caps = ctx.capabilities || [];
        const strategicAmbition = ctx.strategicIntent?.strategic_ambition || ctx.strategicIntentSummary || 'Not defined';
        if (!caps.length) {
          return `No capabilities mapped yet. Generate 3–5 example capability health scores for a ${ctx.masterData?.industry || 'general'} company pursuing: "${strategicAmbition}".
Output JSON array: [{"capabilityId":"string","name":"string","healthScore":number,"maturityGap":number,"criticality":number,"status":"string","assessment":"string"}]`;
        }
        return `Assess these ${caps.length} capabilities for a company pursuing: "${strategicAmbition}".

Capabilities:
${JSON.stringify(caps, null, 2)}

Output JSON array:
[{"capabilityId":"string","name":"string","healthScore":number,"maturityGap":number,"criticality":number,"status":"string (healthy|at-risk|critical)","assessment":"string"}]`;
      },

      outputSchema: [{ capabilityId: 'string', healthScore: 'number', criticality: 'number' }],

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed?.assessments) return parsed.assessments;
        if (parsed?.capabilities) return parsed.capabilities;
        return [];
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // DI-2: Identify Quick Wins
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'di-2',
      title:           'Identify Quick Wins',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/decision-intelligence/di_2_quick_wins.instruction.md',

      systemPrompt: (ctx) => {
        return `You are identifying low-effort, high-impact capability improvements for a ${ctx.masterData?.industry || 'general'} company.
Quick wins = effort "low" AND impact >= 60. Output ONLY JSON, no prose.`;
      },

      userPrompt: (ctx, userInput) => {
        const scores  = ctx['di-1'] || ctx.capabilityScores || [];
        const gaps    = ctx.gapAnalysis || [];
        const focus   = userInput?.focusAreas ? `Focus on: ${userInput.focusAreas.join(', ')}.` : '';
        return `${focus}
Identify quick wins from these capability assessments and gaps.
Quick wins = effort "low" with business impact >= 60.

Capability scores: ${JSON.stringify(scores.slice(0, 15), null, 2)}
Gaps: ${JSON.stringify(gaps.slice(0, 10), null, 2)}

Output JSON array:
[{"capabilityId":"string","capabilityName":"string","effort":"low","impact":number,"timeline":"string","riskLevel":"string (low|medium|high)","action":"string"}]`;
      },

      outputSchema: [{ capabilityId: 'string', effort: 'string', impact: 'number' }],

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed?.quickWins) return parsed.quickWins;
        return [];
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // DI-3: Strategic Gap Analysis
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'di-3',
      title:           'Strategic Gap Analysis',
      taskType:        'discovery',
      instructionFile: 'Analytics/Instructions/decision-intelligence/di_3_strategic_gaps.instruction.md',

      systemPrompt: (ctx) => {
        const ambition = ctx.strategicIntent?.strategic_ambition || ctx.strategicIntentSummary || 'Not defined';
        const constraints = (ctx.masterData?.constraints || []).join(', ');
        return `You are a senior enterprise architect analyzing strategic capability gaps.
Company ambition: "${ambition}".
Known constraints: ${constraints || 'none specified'}.
Identify gaps that are STRATEGICALLY critical — not just technically missing. Explain WHY each gap threatens the strategy.
Output ONLY valid JSON. No prose outside the JSON.`;
      },

      userPrompt: (ctx) => {
        const si   = ctx.strategicIntent || {};
        const caps  = ctx.capabilities || [];
        const gaps  = ctx.gapAnalysis  || [];
        return `Analyze strategic gaps given:
Strategic intent: ${JSON.stringify(si, null, 2)}
Top capabilities: ${JSON.stringify(caps.slice(0, 10), null, 2)}
Identified gaps: ${JSON.stringify(gaps.slice(0, 10), null, 2)}

Output JSON:
{"criticalGaps":["string"],"strategicImplications":"string","recommendations":["string"],"riskFactors":["string"]}`;
      },

      outputSchema: { criticalGaps: ['string'], strategicImplications: 'string', recommendations: ['string'] },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.criticalGaps) return parsed;
        return { criticalGaps: [], strategicImplications: 'Analysis unavailable', recommendations: [] };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // DI-4: Sequencing Recommendation
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'di-4',
      title:           'Sequencing Recommendation',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/decision-intelligence/di_4_sequencing.instruction.md',

      systemPrompt: (ctx) => {
        const timeline    = ctx.masterData?.constraints?.find(c => /year|month|timeline/i.test(c)) || '18–24 months';
        const constraints = (ctx.masterData?.constraints || []).slice(0, 3).join('; ');
        return `You are recommending the optimal capability delivery sequence for a ${ctx.masterData?.industry || 'general'} company.
Timeline context: ${timeline}. Constraints: ${constraints || 'none'}.
Sequence must respect dependencies. Maximize parallelism where possible. Output ONLY JSON.`;
      },

      userPrompt: (ctx) => {
        const caps  = ctx.capabilities      || [];
        const scores = ctx['di-1']          || [];
        const gaps   = ctx.gapAnalysis       || [];
        const criticals = ctx.criticalGaps  || [];
        return `Provide sequencing for these capabilities:
Capabilities: ${JSON.stringify(caps.slice(0, 15), null, 2)}
Health scores: ${JSON.stringify(scores.slice(0, 15), null, 2)}
Critical gaps: ${JSON.stringify(criticals, null, 2)}

Output JSON:
{"sequence":[{"phase":number,"name":"string","capabilityIds":["string"],"rationale":"string"}],"parallelizableGroups":[["string"]],"riskMitigation":"string","estimatedDurationMonths":number}`;
      },

      outputSchema: { sequence: ['object'], parallelizableGroups: [['string?']], riskMitigation: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.sequence) return parsed;
        return { sequence: [], parallelizableGroups: [], riskMitigation: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // DI-5: Executive Summary
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'di-5',
      title:           'Executive Summary',
      taskType:        'discovery',
      instructionFile: 'Analytics/Instructions/decision-intelligence/di_5_executive_summary.instruction.md',

      systemPrompt: (ctx) => {
        return `You are writing an executive briefing for the board about enterprise architecture priorities.
Audience: C-suite (CEO, CFO, COO). Tone: decisive, business-focused, jargon-free.
Use data from the analysis. Be specific with numbers and timelines. Output ONLY JSON.`;
      },

      userPrompt: (ctx) => {
        const scores    = ctx['di-1'] || [];
        const quickWins = ctx['di-2'] || [];
        const gaps      = ctx.criticalGaps || [];
        const seq       = ctx.sequence || [];
        return `Synthesize these analysis results into an executive briefing:
Capability health scores: ${JSON.stringify(scores.slice(0, 5), null, 2)}
Quick wins: ${JSON.stringify(quickWins.slice(0, 3), null, 2)}
Critical gaps: ${JSON.stringify(gaps, null, 2)}
Sequencing: ${JSON.stringify(seq, null, 2)}

Output JSON:
{"executiveSummary":"string","topPriorities":[{"name":"string","why":"string","timeline":"string"}],"criticalPath":"string","recommendations":["string"],"riskFactors":["string"],"quickWinCount":number,"estimatedDurationMonths":number}`;
      },

      outputSchema: {
        executiveSummary: 'string',
        topPriorities:    ['object'],
        recommendations:  ['string']
      },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.executiveSummary) return parsed;
        return { executiveSummary: 'Summary unavailable', topPriorities: [], recommendations: [] };
      }
    }

  ]; // end tasks[]

  // ── synthesize: extract final output from DI-5 result ────────────────────

  function synthesize(tabState) {
    const di1 = tabState.taskResults['di-1']?.output || [];
    const di2 = tabState.taskResults['di-2']?.output || [];
    const di3 = tabState.taskResults['di-3']?.output || {};
    const di4 = tabState.taskResults['di-4']?.output || {};
    const di5 = tabState.taskResults['di-5']?.output || {};

    return {
      topPriorities:    di5.topPriorities    || [],
      quickWins:        di2,
      criticalPath:     di5.criticalPath     || di4.sequence?.[0]?.name || '',
      recommendations:  di5.recommendations  || di3.recommendations || [],
      riskFactors:      di5.riskFactors      || di3.riskFactors || [],
      executiveSummary: di5.executiveSummary || '',
      sequencing:       di4.sequence         || [],
      parallelGroups:   di4.parallelizableGroups || [],
      capabilityScores: di1,
      estimatedDurationMonths: di5.estimatedDurationMonths || di4.estimatedDurationMonths || null,
      quickWinCount:    di5.quickWinCount    || di2.length
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    id:          'decision-intelligence',
    name:        'Decision Intelligence',
    description: 'Analyze capabilities, identify priorities, and guide strategic sequencing',
    dependsOn:   [],
    tasks,
    synthesize
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Decision;
}
