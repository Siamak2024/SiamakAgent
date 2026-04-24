/**
 * Step4.js — Benchmark Analysis
 *
 * V10 REDESIGN: Compare capability maturity against APQC industry standards
 * and identify gaps vs. industry leaders.
 *
 * Tasks:
 *   4.1 benchmark_analysis    — Compare capabilities vs APQC standards
 *   4.2 gap_identification    — Identify gaps vs industry best practices
 *   4.3 executive_summary     — Generate benchmark executive summary
 *
 * Outputs:
 *   model.benchmarkData      — benchmark results with APQC comparisons
 *   model.benchmarkGaps[]    — identified gaps vs industry
 *   model.benchmarkSummary   — executive summary of findings
 */

const Step4 = {

  id: 'step4',
  name: 'Benchmark Analysis',
  dependsOn: ['step3'],

  tasks: [

    // ── Task 4.1: Benchmark Analysis ──────────────────────────────────────
    {
      taskId: 'step4_benchmark_analysis',
      title: 'Comparing capabilities vs APQC standards',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '4_1_benchmark_analysis.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture Benchmarking Analyst with expertise in APQC Process Classification Framework.

Analyze the organization's capability maturity against APQC industry standards.

Return ONLY valid JSON:
{
  "industry_baseline": {
    "sector": "",
    "avg_maturity": 0,
    "top_quartile_maturity": 0
  },
  "capability_benchmarks": [
    {
      "capability_id": "",
      "capability_name": "",
      "current_maturity": 0,
      "industry_avg": 0,
      "top_quartile": 0,
      "gap_vs_avg": 0,
      "gap_vs_best": 0,
      "apqc_alignment": "STRONG|MODERATE|WEAK",
      "priority": "HIGH|MEDIUM|LOW"
    }
  ],
  "summary": {
    "total_capabilities": 0,
    "above_average_count": 0,
    "below_average_count": 0,
    "critical_gaps": 0
  }
}`,

      userPrompt: (ctx) => {
        const capabilities = ctx.capabilities || [];
        const industry = ctx.industry || 'GENERIC';
        const strategicIntent = ctx.strategicIntent || {};
        
        const capList = capabilities.map(c => 
          `${c.id || c.capability_id} ${c.name}: Current maturity=${c.current_maturity || 'unknown'}, Target=${c.target_maturity || 'unknown'}, Importance=${c.strategic_importance || 'SUPPORT'}`
        ).join('\n');
        
        return `Industry sector: ${industry}
Strategic focus: ${strategicIntent.strategic_intent || ''}
Business model type: ${strategicIntent.business_model || ''}

Capabilities to benchmark:
${capList}

Compare each capability's current maturity against APQC industry standards. Identify where we lag vs. industry average and best-in-class performers.`;
      },

      outputSchema: {
        industry_baseline: 'object',
        capability_benchmarks: ['object'],
        summary: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_benchmark_analysis')
    },

    // ── Task 4.2: Gap Identification ──────────────────────────────────────
    {
      taskId: 'step4_gap_identification',
      title: 'Identifying critical gaps vs industry leaders',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '4_2_gap_identification.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Strategic Gap Analyst. Identify the most critical capability gaps that need attention.

Return ONLY valid JSON:
{
  "critical_gaps": [
    {
      "capability_id": "",
      "capability_name": "",
      "gap_type": "MATURITY|PROCESS|TECHNOLOGY|SKILLS",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "impact": "",
      "root_cause": "",
      "recommended_action": ""
    }
  ],
  "quick_wins": [
    {
      "capability_id": "",
      "capability_name": "",
      "action": "",
      "expected_benefit": "",
      "effort": "LOW|MEDIUM|HIGH",
      "timeframe": ""
    }
  ],
  "strategic_priorities": [""]
}`,

      userPrompt: (ctx) => {
        const benchmarks = ctx.answers?.step4_benchmark_analysis?.capability_benchmarks || [];
        const strategicIntent = ctx.strategicIntent || {};
        
        const gapList = benchmarks
          .filter(b => b.gap_vs_avg < -0.5 || b.gap_vs_best < -1.0)
          .map(b => `${b.capability_name}: Gap vs avg=${b.gap_vs_avg}, Gap vs best=${b.gap_vs_best}, Priority=${b.priority}`)
          .join('\n');
        
        return `Strategic objectives: ${(strategicIntent.strategic_themes || []).join(', ')}
Key constraints: ${(strategicIntent.key_constraints || []).join(', ')}

Capability gaps identified:
${gapList}

Prioritize gaps that:
1. Impact strategic objectives most
2. Create competitive disadvantage
3. Have quickest path to improvement (quick wins)`;
      },

      outputSchema: {
        critical_gaps: ['object'],
        quick_wins: ['object'],
        strategic_priorities: ['string']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_gap_identification')
    },

    // ── Task 4.3: Executive Summary ───────────────────────────────────────
    {
      taskId: 'step4_executive_summary',
      title: 'Generating benchmark executive summary',
      type: 'internal',
      taskType: 'synthesis',
      instructionFile: '4_3_executive_summary.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a C-suite Strategic Advisor. Create a concise executive summary of the benchmark findings.

Return ONLY valid JSON:
{
  "headline": "",
  "key_findings": [""],
  "competitive_position": "",
  "urgency_level": "CRITICAL|HIGH|MODERATE|LOW",
  "investment_focus": [""],
  "expected_outcomes": [""],
  "next_steps": [""]
}`,

      userPrompt: (ctx) => {
        const summary = ctx.answers?.step4_benchmark_analysis?.summary || {};
        const gaps = ctx.answers?.step4_gap_identification?.critical_gaps || [];
        const quickWins = ctx.answers?.step4_gap_identification?.quick_wins || [];
        
        return `Benchmark summary:
- Total capabilities assessed: ${summary.total_capabilities || 0}
- Above industry average: ${summary.above_average_count || 0}
- Below industry average: ${summary.below_average_count || 0}
- Critical gaps identified: ${summary.critical_gaps || 0}

Critical gaps: ${gaps.length} found
Quick wins available: ${quickWins.length} identified

Create a 3-paragraph executive summary that a CEO/CFO can read in 60 seconds.`;
      },

      outputSchema: {
        headline: 'string',
        key_findings: ['string'],
        competitive_position: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_executive_summary')
    }

  ],

  synthesize: (ctx) => {
    const benchmarkAnalysis = ctx.answers?.step4_benchmark_analysis || {};
    const gapAnalysis = ctx.answers?.step4_gap_identification || {};
    const execSummary = ctx.answers?.step4_executive_summary || {};
    
    return {
      benchmarkData: {
        industry_baseline: benchmarkAnalysis.industry_baseline || {},
        capability_benchmarks: benchmarkAnalysis.capability_benchmarks || [],
        summary: benchmarkAnalysis.summary || {},
        timestamp: new Date().toISOString()
      },
      benchmarkGaps: gapAnalysis.critical_gaps || [],
      benchmarkQuickWins: gapAnalysis.quick_wins || [],
      benchmarkPriorities: gapAnalysis.strategic_priorities || [],
      benchmarkSummary: {
        headline: execSummary.headline || '',
        key_findings: execSummary.key_findings || [],
        competitive_position: execSummary.competitive_position || '',
        urgency_level: execSummary.urgency_level || 'MODERATE',
        investment_focus: execSummary.investment_focus || [],
        expected_outcomes: execSummary.expected_outcomes || [],
        next_steps: execSummary.next_steps || []
      }
    };
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      benchmarkData: output.benchmarkData,
      benchmarkGaps: output.benchmarkGaps,
      benchmarkQuickWins: output.benchmarkQuickWins,
      benchmarkPriorities: output.benchmarkPriorities,
      benchmarkSummary: output.benchmarkSummary,
      benchmarkDone: true
    };
  },

  onComplete: (model) => {
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4]);
    if (typeof toast === 'function') toast('Benchmark Analysis complete ✓');
    if (typeof addAssistantMessage === 'function') {
      const summary = model.benchmarkSummary || {};
      addAssistantMessage(
        `**Step 4 — Benchmark Analysis complete**\n\n` +
        `${summary.headline || 'Benchmark analysis completed'}\n\n` +
        `**Click on Step 5: Data Collection in the left sidebar to continue.**`
      );
    }
  }

};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Step4;
}
