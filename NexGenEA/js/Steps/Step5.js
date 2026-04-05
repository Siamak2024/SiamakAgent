/**
 * Step5.js — Gap Analysis
 *
 * Tasks:
 *   5.1 capability_gaps  — Internal: detailed capability gap analysis
 *   5.2 priority_matrix  — Internal: prioritise gaps by impact + effort
 *   5.3 quick_wins       — Internal: identify and sequence quick wins
 *
 * Outputs:
 *   model.gapAnalysis         — full gap analysis object
 *   model.priorityGaps        — prioritised gap list (backward compat array)
 *   model.quickWins           — quick wins array
 */

const Step5 = {

  id: 'step5',
  name: 'Gap Analysis',
  dependsOn: ['step1', 'step2', 'step3', 'step4'],

  tasks: [

    // ── Task 5.1: Capability Gap Analysis ────────────────────────────────
    {
      taskId: 'step5_capability_gaps',
      title: 'Identifying capability gaps',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '5_1_capability_gaps.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture expert. Conduct a detailed gap analysis across all capability domains, cross-referencing the operating model delta.

Return ONLY valid JSON:
{
  "gaps": [
    {
      "gap_id": "G01",
      "capability": "",
      "domain": "",
      "current_state": "",
      "required_state": "",
      "gap_description": "",
      "root_cause": "",
      "business_impact": "",
      "impact_score": 1,
      "effort_score": 1,
      "interdependencies": ["G02"],
      "enablers": [""],
      "inhibitors": [""]
    }
  ],
  "gap_clusters": [{"cluster_name":"","gap_ids":["G01"],"theme":""}],
  "total_gaps": 0,
  "critical_path_gaps": ["G01"]
}

Scoring: impact_score 1-5 (5=strategic), effort_score 1-5 (5=very hard).
Generate 8-15 gaps covering People, Process, Data, Application, Technology, Governance.`,

      userPrompt: (ctx) => {
        const caps = (ctx.capabilities || []).filter(c => c.gap && c.gap > 0)
          .sort((a, b) => (b.gap || 0) - (a.gap || 0)).slice(0, 10)
          .map(c => `${c.name}: current=${c.current_maturity}, target=${c.target_maturity}, gap=${c.gap}`);

        const opDelta = ctx.operatingModelDelta?.dimension_gaps || [];
        const si = ctx.strategicIntent;

        return `Strategic ambition: "${si.strategic_ambition || ''}"
Success metrics: ${(si.success_metrics || []).join('; ')}

Top capability gaps (by maturity gap):
${caps.join('\n') || 'see capability assessment'}

Operating model dimension gaps:
${opDelta.slice(0, 5).map(g => `${g.dimension}: ${g.gap_severity} severity`).join('\n') || 'none'}

BMC delta gaps: ${(ctx.bmcAnalysis?.critical_gaps || []).map(g => `${g.block}: ${g.gap}`).join('; ') || 'none'}

Produce 8-15 gaps. Every gap must trace to a success metric or strategic theme.`;
      },

      outputSchema: {
        gaps: ['object'],
        total_gaps: 'number'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step5_capability_gaps')
    },

    // ── Task 5.2: Priority Matrix ──────────────────────────────────────────
    {
      taskId: 'step5_priority_matrix',
      title: 'Prioritising gaps',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '5_2_priority_matrix.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a strategic prioritisation expert. Place each gap into a priority quadrant and produce an ordered priority list.
Return ONLY valid JSON:
{
  "quadrants": {
    "quick_wins":       {"gap_ids":["G01"],"rationale":""},
    "strategic_bets":  {"gap_ids":[],"rationale":""},
    "fill_ins":        {"gap_ids":[],"rationale":""},
    "thankless_tasks": {"gap_ids":[],"rationale":""}
  },
  "ordered_priority": [
    {"rank":1,"gap_id":"G01","gap_name":"","priority":"CRITICAL|HIGH|MEDIUM|LOW","rationale":"","dependency_on":[]}
  ],
  "investment_bands": [{"band":"Short-term (0-6m)","gap_ids":[]},{"band":"Medium-term (6-18m)","gap_ids":[]},{"band":"Long-term (18m+)","gap_ids":[]}]
}`,

      userPrompt: (ctx) => {
        const gaps = ctx.answers?.step5_capability_gaps?.gaps || [];
        const si = ctx.strategicIntent;
        const gapSummary = gaps.map(g =>
          `${g.gap_id} ${g.capability}: impact=${g.impact_score}, effort=${g.effort_score}, deps=${(g.interdependencies || []).join(',')}`
        ).join('\n');
        return `Strategic timeframe: ${si.timeframe || '3-5 years'}
Constraints: ${(si.key_constraints || []).join('; ')}

Gaps to prioritise:
${gapSummary}

Place in 2x2 matrix (impact × effort). Consider interdependencies when building ordered_priority.
investment_bands: group into 3 time horizons.`;
      },

      outputSchema: {
        quadrants: 'object',
        ordered_priority: ['object'],
        investment_bands: ['object']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step5_priority_matrix')
    },

    // ── Task 5.3: Quick Wins ───────────────────────────────────────────────
    {
      taskId: 'step5_quick_wins',
      title: 'Identifying quick wins',
      type: 'internal',
      taskType: 'lightweight',
      instructionFile: '5_3_quick_wins.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture practitioner. Identify the top 5-7 quick wins — actions that can be started within 90 days that visibly reduce a gap and build momentum.

Return ONLY valid JSON:
{
  "quick_wins": [
    {
      "id": "QW01",
      "title": "",
      "closes_gap": "G01",
      "description": "",
      "estimated_effort": "days|weeks",
      "estimated_value": "",
      "owner_role": "",
      "start_condition": "",
      "success_indicator": ""
    }
  ],
  "90_day_narrative": ""
}`,

      userPrompt: (ctx) => {
        const qwids = ctx.answers?.step5_priority_matrix?.quadrants?.quick_wins?.gap_ids || [];
        const gaps = ctx.answers?.step5_capability_gaps?.gaps || [];
        const qwGaps = gaps.filter(g => qwids.includes(g.gap_id));
        const si = ctx.strategicIntent;
        return `Quick wins from priority matrix: ${qwids.join(', ')}

Quick win gap details:
${qwGaps.map(g => `${g.gap_id} ${g.capability}: ${g.gap_description} | Enablers: ${(g.enablers || []).join(', ')}`).join('\n')}

Organisation: "${ctx.companyDescription.slice(0, 200)}"
Change readiness: ${ctx.operatingModelDelta?.change_readiness?.score || 'unknown'}

Generate 5-7 concrete 90-day quick wins. Each must have a named owner_role and measurable success_indicator.
90_day_narrative: 2-3 sentences on the value of starting with these actions.`;
      },

      outputSchema: {
        quick_wins: ['object'],
        '90_day_narrative': 'string'
      },

      parseOutput: (raw) => {
        const obj = OutputValidator.parseJSON(raw, 'step5_quick_wins');
        // Normalise key name
        if (!obj['90_day_narrative'] && obj['90day_narrative']) {
          obj['90_day_narrative'] = obj['90day_narrative'];
        }
        return obj;
      }
    }

  ],

  synthesize: (ctx) => {
    const priorityMatrix = ctx.answers?.step5_priority_matrix || {};
    const allGaps = ctx.answers?.step5_capability_gaps?.gaps || [];
    const ordered = priorityMatrix.ordered_priority || [];

    // Build priorityGaps in the legacy flat array format
    const priorityGaps = ordered.map(p => {
      const gap = allGaps.find(g => g.gap_id === p.gap_id) || {};
      return {
        ...gap,
        priority: p.priority,
        rank: p.rank,
        rationale: p.rationale,
        dependency_on: p.dependency_on || []
      };
    });

    return {
      gapAnalysis: {
        gaps: allGaps,
        clusters: ctx.answers?.step5_capability_gaps?.gap_clusters || [],
        priorityMatrix,
        investmentBands: priorityMatrix.investment_bands || []
      },
      priorityGaps,
      quickWins: ctx.answers?.step5_quick_wins?.quick_wins || []
    };
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      gapAnalysis: output.gapAnalysis,
      priorityGaps: output.priorityGaps,
      quickWins: output.quickWins
    };
  },

  onComplete: (model) => {
    if (typeof renderGapAnalysisSection === 'function') renderGapAnalysisSection();
    if (typeof renderQuickWinsSection === 'function') renderQuickWinsSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4, 5]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step5');
    if (typeof toast === 'function') toast('Gap Analysis complete ✓');

    if (typeof addAssistantMessage === 'function') {
      const total = model.gapAnalysis?.gaps?.length || 0;
      const critical = (model.priorityGaps || []).filter(g => g.priority === 'CRITICAL').length;
      const qwCount = (model.quickWins || []).length;
      addAssistantMessage(
        `**Step 5 — Gap Analysis complete**\n\n` +
        `${total} gaps identified • ${critical} critical • ${qwCount} quick wins for 90-day plan\n\n` +
        `**Next:** Ready to identify Value Pools? Click below or use the **Continue** button in the sidebar.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step6', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 6: Value Pools\n` +
        `</button>`
      );
    }
  }
};
