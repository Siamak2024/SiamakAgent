/**
 * Step6.js — Layers & Gap Analysis
 *
 * V10 REDESIGN: Generate architecture layers, identify capability gaps 
 * based on validated maturity, and recommend prioritized improvements.
 *
 * Tasks:
 *   6.1 architecture_layers   — Generate application/data/technology layers
 *   6.2 gap_analysis          — Identify and prioritize capability gaps
 *   6.3 quick_wins            — Recommend fast-track improvements
 *
 * Outputs:
 *   model.valueStreams[]     — value streams (backward compat)
 *   model.systems[]          — application/system inventory
 *   model.gapAnalysis        — detailed gap analysis
 *   model.priorityGaps[]     — prioritized list of critical gaps
 *   model.quickWins[]        — quick-win opportunities
 */

const Step6 = {

  id: 'step6',
  name: 'Layers & Gap Analysis',
  dependsOn: ['step3', 'step4', 'step5'],

  tasks: [

    // ── Task 6.1: Architecture Layers ─────────────────────────────────────
    {
      taskId: 'step6_architecture_layers',
      title: 'Generating architecture layers',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '6_1_architecture_layers.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architect specializing in layered architecture design.

Generate architecture layers: Value Streams, Applications/Systems, Data, Technology.

Return ONLY valid JSON:
{
  "value_streams": [
    {
      "id": "",
      "name": "",
      "description": "",
      "capabilities": [],
      "strategic_importance": "CORE|SUPPORT|COMMODITY"
    }
  ],
  "applications": [
    {
      "id": "",
      "name": "",
      "type": "CORE_SYSTEM|SUPPORTING|UTILITY",
      "capabilities_supported": [],
      "technology_stack": "",
      "maturity": 0,
      "modernization_priority": "HIGH|MEDIUM|LOW"
    }
  ],
  "data_assets": [
    {
      "id": "",
      "name": "",
      "type": "MASTER_DATA|TRANSACTIONAL|ANALYTICAL|REFERENCE",
      "capabilities_served": [],
      "quality_level": "HIGH|MEDIUM|LOW"
    }
  ],
  "technology_stack": {
    "platforms": [],
    "infrastructure": [],
    "integration": [],
    "analytics": []
  }
}`,

      userPrompt: (ctx) => {
        const capabilities = ctx.capabilities || [];
        const strategicIntent = ctx.strategicIntent || {};
        const bmc = ctx.bmc || {};
        
        const capList = capabilities.slice(0, 20).map(c => 
          `${c.name} (${c.domain || 'N/A'}): Maturity=${c.current_maturity || 'unknown'}, Importance=${c.strategic_importance || 'SUPPORT'}`
        ).join('\n');
        
        return `Organization: ${ctx.companyDescription?.slice(0, 300) || ''}
Industry: ${ctx.industry || 'generic'}
Strategic focus: ${strategicIntent.strategic_intent || ''}
Key activities: ${(bmc.key_activities || []).join(', ')}

Capabilities:
${capList}

Generate:
1. **Value Streams**: 3-6 end-to-end value streams that group related capabilities
2. **Applications**: 8-15 key applications/systems supporting these capabilities
3. **Data Assets**: 5-10 critical data entities (master data, transactional, analytical)
4. **Technology Stack**: Platforms, infrastructure, integration, analytics tools

Focus on CORE capabilities and systems that enable strategic objectives.`;
      },

      outputSchema: {
        value_streams: ['object'],
        applications: ['object'],
        data_assets: ['object'],
        technology_stack: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step6_architecture_layers')
    },

    // ── Task 6.2: Gap Analysis ────────────────────────────────────────────
    {
      taskId: 'step6_gap_analysis',
      title: 'Analyzing capability gaps',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '6_2_gap_analysis.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Strategic Gap Analysis Specialist.

Analyze capability gaps using validated maturity data and prioritize improvements.

Return ONLY valid JSON:
{
  "gap_summary": {
    "total_gaps": 0,
    "critical_count": 0,
    "high_count": 0,
    "medium_count": 0,
    "avg_gap_size": 0
  },
  "capability_gaps": [
    {
      "capability_id": "",
      "capability_name": "",
      "current_maturity": 0,
      "target_maturity": 0,
      "gap_size": 0,
      "gap_type": "MATURITY|PROCESS|TECHNOLOGY|SKILLS|DATA",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "business_impact": "",
      "root_cause": "",
      "dependencies": []
    }
  ],
  "strategic_implications": [""]
}`,

      userPrompt: (ctx) => {
        const capabilities = ctx.capabilities || [];
        const benchmarkGaps = ctx.benchmarkGaps || [];
        const surveyResults = ctx.surveyResults || {};
        const strategicIntent = ctx.strategicIntent || {};
        
        const capGaps = capabilities
          .filter(c => {
            const current = c.current_maturity || 0;
            const target = c.target_maturity || 3;
            return target - current > 0.5;
          })
          .slice(0, 15)
          .map(c => `${c.name}: Current=${c.current_maturity}, Target=${c.target_maturity}, Gap=${(c.target_maturity - c.current_maturity).toFixed(1)}`)
          .join('\n');
        
        return `Strategic objectives: ${(strategicIntent.strategic_themes || []).join(', ')}
Benchmark critical gaps: ${benchmarkGaps.length} identified
Survey insights: ${(surveyResults.cross_cutting_themes || []).join('; ')}

Capability gaps (current vs target):
${capGaps}

Prioritize gaps based on:
1. Strategic importance (CORE capabilities first)
2. Gap size (target - current maturity)
3. Business impact (blocks strategic objectives?)
4. Dependencies (enables other capabilities?)

Focus on gaps >0.5 maturity points. Identify root causes and strategic implications.`;
      },

      outputSchema: {
        gap_summary: 'object',
        capability_gaps: ['object'],
        strategic_implications: ['string']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step6_gap_analysis')
    },

    // ── Task 6.3: Quick Wins ──────────────────────────────────────────────
    {
      taskId: 'step6_quick_wins',
      title: 'Identifying quick-win opportunities',
      type: 'internal',
      taskType: 'synthesis',
      instructionFile: '6_3_quick_wins.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Strategic Improvement Advisor.

Identify quick-win opportunities: high-impact, low-effort improvements.

Return ONLY valid JSON:
{
  "quick_wins": [
    {
      "id": "",
      "capability_id": "",
      "capability_name": "",
      "action": "",
      "expected_benefit": "",
      "effort": "LOW|MEDIUM",
      "timeline": "",
      "investment": "",
      "success_metric": ""
    }
  ],
  "implementation_sequence": [""],
  "total_value_estimate": ""
}`,

      userPrompt: (ctx) => {
        const gapAnalysis = ctx.answers?.step6_gap_analysis || {};
        const quickWinsFromBenchmark = ctx.benchmarkQuickWins || [];
        const surveyInsights = ctx.surveyResults?.capability_insights || [];
        
        const gapList = (gapAnalysis.capability_gaps || [])
          .filter(g => ['HIGH', 'MEDIUM'].includes(g.priority))
          .slice(0, 10)
          .map(g => `${g.capability_name}: Gap=${g.gap_size}, Priority=${g.priority}, Root cause=${g.root_cause}`)
          .join('\n');
        
        return `Priority gaps:
${gapList}

Quick wins validated in surveys:
${quickWinsFromBenchmark.slice(0, 5).map(qw => `${qw.capability_name}: ${qw.action}`).join('\n')}

Survey improvement opportunities:
${surveyInsights.slice(0, 5).map(ins => `${ins.capability_name}: ${(ins.improvement_opportunities || []).join('; ')}`).join('\n')}

Identify 5-8 quick wins that:
- Close maturity gap by 0.5-1.0 points
- Deliver in <6 months
- Require <$150K investment
- Have clear success metrics
- Build momentum for larger initiatives

Sequence quick wins to create cascading value (early wins enable later ones).`;
      },

      outputSchema: {
        quick_wins: ['object'],
        implementation_sequence: ['string']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step6_quick_wins')
    }

  ],

  synthesize: (ctx) => {
    const layers = ctx.answers?.step6_architecture_layers || {};
    const gaps = ctx.answers?.step6_gap_analysis || {};
    const quickWins = ctx.answers?.step6_quick_wins || {};
    
    return {
      valueStreams: layers.value_streams || [],
      systems: layers.applications || [],
      dataAssets: layers.data_assets || [],
      technologyStack: layers.technology_stack || {},
      gapAnalysis: {
        gap_summary: gaps.gap_summary || {},
        capability_gaps: gaps.capability_gaps || [],
        strategic_implications: gaps.strategic_implications || [],
        timestamp: new Date().toISOString()
      },
      priorityGaps: (gaps.capability_gaps || [])
        .filter(g => ['CRITICAL', 'HIGH'].includes(g.priority))
        .map(g => g.capability_name),
      quickWins: quickWins.quick_wins || [],
      quickWinSequence: quickWins.implementation_sequence || [],
      quickWinValueEstimate: quickWins.total_value_estimate || ''
    };
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      valueStreams: output.valueStreams,
      systems: output.systems,
      dataAssets: output.dataAssets,
      technologyStack: output.technologyStack,
      gapAnalysis: output.gapAnalysis,
      priorityGaps: output.priorityGaps,
      quickWins: output.quickWins,
      quickWinSequence: output.quickWinSequence,
      quickWinValueEstimate: output.quickWinValueEstimate,
      gapAnalysisDone: true,
      gapAnalysisConfirmed: true
    };
  },

  onComplete: (model) => {
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4, 5, 6]);
    if (typeof toast === 'function') toast('Layers & Gap Analysis complete ✓');
    if (typeof addAssistantMessage === 'function') {
      const vsCount = model.valueStreams?.length || 0;
      const gapCount = model.priorityGaps?.length || 0;
      addAssistantMessage(
        `**Step 6 — Layers & Gap Analysis complete**\n\n` +
        `Mapped ${vsCount} value streams and identified ${gapCount} priority gaps.\n\n` +
        `**Click on Step 7: Target Arch & Roadmap in the left sidebar to continue.**`
      );
    }
  }

};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Step6;
}
