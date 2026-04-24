/**
 * Financial.js — Financial Analysis tab workflow (6 tasks).
 *
 * Estimates costs, models value pool realization, generates multi-scenario
 * financial models, performs cost-benefit analysis, and produces an
 * executive financial summary.
 *
 * Task sequence:
 *   FI-1: Capability Cost Estimation          (analysis)
 *   FI-2: Gather Financial Constraints        (action)
 *   FI-3: Value Pool Realization Model        (heavy)
 *   FI-4: Multi-Scenario Financial Model      (heavy)
 *   FI-5: Cost-Benefit Analysis               (analysis)
 *   FI-6: Financial Executive Summary         (discovery)
 */

const Financial = (() => {

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
    // FI-1: Capability Cost Estimation
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'fi-1',
      title:           'Capability Cost Estimation',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/financial/fi_1_cost_estimation.instruction.md',

      systemPrompt: (ctx) => {
        const industry = ctx.masterData?.industry || 'General';
        const region   = ctx.masterData?.region   || 'Global';
        return `You are a financial analyst specialising in enterprise capability investment modeling for ${industry} companies in ${region}.
Estimate realistic costs using industry benchmarks — people, technology, and process components.
All monetary values in thousands USD (000s). Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const caps = ctx.capabilities || [];
        const gaps = ctx.gapAnalysis  || [];
        return `Estimate the investment required for each capability initiative.

Capabilities: ${JSON.stringify(caps.slice(0, 15), null, 2)}
Priority gaps: ${JSON.stringify(gaps.slice(0, 8), null, 2)}

Output JSON array:
[{"capabilityId":"string","capabilityName":"string","oneTimeCostK":number,"recurringAnnualK":number,"implementationMonths":number,"costDrivers":["string"],"confidence":"low|medium|high"}]`;
      },

      outputSchema: [{ capabilityId: 'string', oneTimeCostK: 'number', recurringAnnualK: 'number' }],

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed?.costs) return parsed.costs;
        if (parsed?.capabilities) return parsed.capabilities;
        return [];
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // FI-2: Gather Financial Constraints
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'fi-2',
      title:           'Financial Constraints Analysis',
      taskType:        'action',
      instructionFile: 'Analytics/Instructions/financial/fi_2_constraints.instruction.md',

      systemPrompt: (ctx) => {
        const org = ctx.masterData?.organizationName || 'the organization';
        return `You are analyzing financial constraints that affect EA programme delivery for ${org}.
Identify budget limits, funding cycles, approval thresholds, and financial risk factors.
Provide structured constraints that will inform scenario planning. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx, userInput) => {
        const budget  = userInput?.budgetK ? `Annual budget: $${userInput.budgetK}k.` : '';
        const horizon = userInput?.horizon || '3 years';
        const costs   = ctx['fi-1'] || [];
        return `${budget}
Planning horizon: ${horizon}.

Based on these cost estimates and the organization's EA posture, identify financial constraints.
Cost estimates: ${JSON.stringify(costs.slice(0, 8), null, 2)}

Operating model context: ${JSON.stringify(ctx.operatingModel || {}, null, 2)}

Output JSON:
{"annualBudgetCapK":number,"fundingMechanism":"string","approvalThresholdK":number,"constraints":["string"],"riskFactors":["string"],"windfall":"string","phaseGating":"string","summary":"string"}`;
      },

      outputSchema: { constraints: ['string'], riskFactors: ['string'], summary: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.constraints) return parsed;
        return { constraints: [], riskFactors: [], summary: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // FI-3: Value Pool Realization Model
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'fi-3',
      title:           'Value Pool Realization Model',
      taskType:        'heavy',
      instructionFile: 'Analytics/Instructions/financial/fi_3_value_pools.instruction.md',

      systemPrompt: (ctx) => {
        const industry = ctx.masterData?.industry || 'general';
        const ambition = ctx.strategicIntent?.strategic_ambition || ctx.strategicIntentSummary || 'not specified';
        return `You are a strategic finance expert modeling value pool realization for a ${industry} company.
Strategic ambition: "${ambition}".
Model realistic value realization timelines using capability enablement logic.
Include benefit type ($Revenue, $Cost, $Risk, $OpEx). All values in thousands USD. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const valuePools = ctx.valuePools       || [];
        const costs      = ctx['fi-1']          || [];
        const caps       = ctx.capabilities     || [];
        return `Model value realization from these value pools and investments:

Value pools: ${JSON.stringify(valuePools.slice(0, 10), null, 2)}
Capability costs: ${JSON.stringify(costs.slice(0, 10), null, 2)}
Enabler capabilities: ${JSON.stringify(caps.slice(0, 8), null, 2)}

Output JSON:
{"valuePoolModels":[{"poolId":"string","poolName":"string","totalValue":number,"year1":number,"year2":number,"year3":number,"enablerCapabilities":["string"],"realizationProbability":number,"drivers":["string"]}],"totalPortfolioValueK":number,"realizationRatePct":number}`;
      },

      outputSchema: { valuePoolModels: ['object'], totalPortfolioValueK: 'number' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.valuePoolModels) return parsed;
        return { valuePoolModels: [], totalPortfolioValueK: 0, realizationRatePct: 0 };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // FI-4: Multi-Scenario Financial Model
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'fi-4',
      title:           'Multi-Scenario Financial Model',
      taskType:        'heavy',
      instructionFile: 'Analytics/Instructions/financial/fi_4_scenarios.instruction.md',

      systemPrompt: (ctx) => {
        return `You are building a multi-scenario financial model for an enterprise architecture programme.
Model 3 scenarios: Conservative (−20% value, +20% cost), Baseline (plan as-is), Optimistic (+30% value, −10% cost).
All values in thousands USD. 3-year horizon unless context specifies otherwise. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const costs      = ctx['fi-1'] || [];
        const vpModel    = ctx['fi-3'] || {};
        const constraints = ctx.financialConstraints || ctx['fi-2'] || {};
        return `Build 3 financial scenarios from:

Cost estimates: ${JSON.stringify(costs.slice(0, 8), null, 2)}
Value pool model: ${JSON.stringify(vpModel, null, 2)}
Constraints: ${JSON.stringify(constraints, null, 2)}

Output JSON:
{"scenarios":[{"name":"string","description":"string","totalInvestmentK":number,"totalValueK":number,"netBenefitK":number,"roiPct":number,"paybackMonths":number,"cashflowByYear":[number,number,number],"assumptions":["string"]}],"recommendedScenario":"string","rationale":"string"}`;
      },

      outputSchema: { scenarios: ['object'], recommendedScenario: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.scenarios) return parsed;
        return { scenarios: [], recommendedScenario: '', rationale: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // FI-5: Cost-Benefit Analysis
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'fi-5',
      title:           'Cost-Benefit Analysis',
      taskType:        'analysis',
      instructionFile: 'Analytics/Instructions/financial/fi_5_cost_benefit.instruction.md',

      systemPrompt: (ctx) => {
        return `You are performing a rigorous cost-benefit analysis for an enterprise architecture programme.
Apply standard CBA methodology: NPV, IRR, payback period, benefit-cost ratio.
Include both tangible (measurable) and intangible (strategic) benefits. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const costs     = ctx['fi-1'] || [];
        const vpModel   = ctx['fi-3'] || {};
        const scenarios = ctx['fi-4']?.scenarios || [];
        return `Perform cost-benefit analysis using:

All cost estimates: ${JSON.stringify(costs.slice(0, 10), null, 2)}
Value realization model: ${JSON.stringify(vpModel, null, 2)}
Scenario models: ${JSON.stringify(scenarios, null, 2)}

Output JSON:
{"totalCostK":number,"totalBenefitK":number,"netPresentValueK":number,"irrPct":number,"paybackMonths":number,"benefitCostRatio":number,"tangibleBenefitsK":number,"intangibleBenefits":["string"],"breakdownByCapability":[{"capabilityId":"string","costK":number,"benefitK":number,"roi":number}],"recommendation":"string"}`;
      },

      outputSchema: { totalCostK: 'number', totalBenefitK: 'number', netPresentValueK: 'number', recommendation: 'string' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (typeof parsed?.totalCostK === 'number') return parsed;
        return { totalCostK: 0, totalBenefitK: 0, netPresentValueK: 0, recommendation: '' };
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // FI-6: Financial Executive Summary
    // ─────────────────────────────────────────────────────────────────────
    {
      taskId:          'fi-6',
      title:           'Financial Executive Summary',
      taskType:        'discovery',
      instructionFile: 'Analytics/Instructions/financial/fi_6_exec_summary.instruction.md',

      systemPrompt: (ctx) => {
        return `You are writing a financial executive briefing for the CFO and board.
Audience: senior finance leadership. Tone: precise, evidence-based, investment-grade.
Lead with ROI and payback. Be specific — use numbers. Output ONLY valid JSON.`;
      },

      userPrompt: (ctx) => {
        const cba       = ctx['fi-5'] || {};
        const scenarios = ctx['fi-4']?.scenarios || [];
        const vpModel   = ctx['fi-3'] || {};
        return `Synthesize the financial analysis into an executive briefing:

Cost-benefit analysis: ${JSON.stringify(cba, null, 2)}
Scenarios: ${JSON.stringify(scenarios, null, 2)}
Value pools: ${JSON.stringify(vpModel, null, 2)}

Output JSON:
{"executiveSummary":"string","investmentRequired":number,"expectedReturn":number,"roiPct":number,"paybackMonths":number,"recommendedScenario":"string","keyRisks":["string"],"fundingRecommendation":"string","nextSteps":["string"]}`;
      },

      outputSchema: { executiveSummary: 'string', roiPct: 'number', investmentRequired: 'number' },

      parseOutput: (raw) => {
        const parsed = _parseJSON(raw);
        if (parsed?.executiveSummary) return parsed;
        return { executiveSummary: '', investmentRequired: 0, expectedReturn: 0, roiPct: 0 };
      }
    }

  ]; // end tasks[]

  // ── synthesize ────────────────────────────────────────────────────────────

  function synthesize(tabState) {
    const fi5 = tabState.taskResults['fi-5']?.output || {};
    const fi6 = tabState.taskResults['fi-6']?.output || {};
    const fi4 = tabState.taskResults['fi-4']?.output || {};

    return {
      costBreakdown:    tabState.taskResults['fi-1']?.output || [],
      roiProjections:   fi5.breakdownByCapability || [],
      paybackPeriod:    fi6.paybackMonths || fi5.paybackMonths || null,
      scenarios:        fi4.scenarios    || [],
      recommendations:  fi6.nextSteps    || [],
      roiPct:           fi6.roiPct        || fi5.irrPct        || null,
      investmentRequired: fi6.investmentRequired || fi5.totalCostK || null,
      executiveSummary: fi6.executiveSummary || '',
      keyRisks:         fi6.keyRisks     || []
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    id:          'financial',
    name:        'Financial Analysis',
    description: 'Model costs, value pools, scenarios, and ROI across the EA programme',
    dependsOn:   [],
    tasks,
    synthesize
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Financial;
}
