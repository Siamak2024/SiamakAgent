/**
 * Step2.js — Business Model Canvas (current + future state)
 *
 * Tasks:
 *   2.1 bmc_current   — Internal: generate CURRENT state BMC
 *   2.2 bmc_future    — Internal: generate FUTURE state BMC aligned to Strategic Intent
 *   2.3 bmc_analysis  — Internal: produce delta/analysis (gaps + opportunities)
 *
 * Outputs:
 *   model.bmc            — future-state BMC (9 building blocks)
 *   model.bmcCurrent     — current-state BMC
 *   model.bmcAnalysis    — delta analysis object
 */

const Step2 = {

  id: 'step2',
  name: 'Business Model Canvas',
  dependsOn: ['step1'],

  tasks: [

    // ── Task 2.1: Current-state BMC ───────────────────────────────────────
    {
      taskId: 'step2_bmc_current',
      title: 'Mapping current business model',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '2_1_bmc_current.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an expert Business Model designer. Analyse the company description and Strategic Intent to map the CURRENT state Business Model Canvas.

This is a diagnostic map — reflect the AS-IS state of the organisation. Identify where the current model is under stress or misaligned with stated Strategic Intent.

Return ONLY valid JSON with this exact structure:
{
  "value_propositions": ["", ""],
  "customer_segments": ["", ""],
  "customer_relationships": ["", ""],
  "channels": ["", ""],
  "key_activities": ["", ""],
  "key_resources": ["", ""],
  "key_partnerships": ["", ""],
  "cost_structure": {"drivers":["",""],"type":"cost-driven|value-driven","scale_economies":true},
  "revenue_streams": {"model":"","streams":[{"name":"","percentage":null}]},
  "metadata": {"data_confidence":"","key_gaps":[""],"at_a_glance":""}
}

Rules:
- Each array: 3-5 non-generic entries grounded in what user has told us
- Mark uncertain items with ⚠️ prefix
- at_a_glance: max 25 words C-suite summary of current model
- DO NOT invent revenue figures — use null for percentage if not stated`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        return `Company: "${ctx.companyDescription}"

Strategic Intent (from Step 1):
- Ambition: ${si.strategic_ambition || ''}
- Industry: ${si.industry || ctx.masterData.industry || ''}
- Burning platform: ${si.burning_platform || ''}
- Constraints: ${(si.key_constraints || []).join('; ')}

Map the CURRENT state BMC. Ground each block in the company description. Mark gaps with ⚠️.

Return JSON output.`;
      },

      outputSchema: {
        value_propositions: ['string'],
        customer_segments: ['string'],
        key_activities: ['string'],
        key_resources: ['string'],
        revenue_streams: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step2_bmc_current')
    },

    // ── Task 2.2: Future-state BMC ────────────────────────────────────────
    {
      taskId: 'step2_bmc_future',
      title: 'Designing future business model',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '2_2_bmc_future.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an expert Business Model designer. Based on the Strategic Intent and current-state BMC, design the FUTURE state Business Model Canvas — where the organisation needs to be in ${3}-5 years.

This is a TARGET model — show the bold shifts needed, not incremental tweaks.

Return ONLY valid JSON (same schema as current BMC, adding "transformation_moves" array):
{
  "value_propositions": [],
  "customer_segments": [],
  "customer_relationships": [],
  "channels": [],
  "key_activities": [],
  "key_resources": [],
  "key_partnerships": [],
  "cost_structure": {"drivers":[],"type":"","scale_economies":false},
  "revenue_streams": {"model":"","streams":[{"name":"","percentage":null}]},
  "transformation_moves": [{"from":"","to":"","rationale":""}],
  "metadata": {"at_a_glance":"","strategic_alignment":""}
}`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const current = ctx.answers?.step2_bmc_current || {};
        return `Company: "${ctx.companyDescription}"

Strategic Intent:
- Ambition: ${si.strategic_ambition || ''}
- Themes: ${(si.strategic_themes || []).join(' | ')}
- Expected outcomes: ${(si.expected_outcomes || []).join('; ')}
- Success metrics: ${(si.success_metrics || []).slice(0, 4).join('; ')}

Current BMC summary:
- Value props: ${(current.value_propositions || []).join('; ')}
- Revenue: ${current.revenue_streams?.model || 'not specified'}
- Key pressures: ${(current.metadata?.key_gaps || []).join('; ')}

Design the FUTURE state BMC. Show bold shifts — not just refining the current model. Include transformation_moves to explain each major change.

Return JSON output.`;
      },

      outputSchema: {
        value_propositions: ['string'],
        customer_segments: ['string'],
        key_activities: ['string']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step2_bmc_future')
    },

    // ── Task 2.3: BMC Delta Analysis ──────────────────────────────────────
    {
      taskId: 'step2_bmc_analysis',
      title: 'Analysing business model delta',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '2_3_bmc_analysis.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a senior strategic analyst. Compare the current and future Business Model Canvas to produce a structured delta analysis.
Return ONLY valid JSON:
{
  "critical_gaps": [{"block":"","gap":"","impact":"HIGH|MEDIUM|LOW"}],
  "strategic_opportunities": [{"opportunity":"","value_driver":"","feasibility":"HIGH|MEDIUM|LOW"}],
  "capability_implications": [""],
  "architectural_implications": [""],
  "transformation_risk": "HIGH|MEDIUM|LOW",
  "transformation_risk_rationale": "",
  "executive_summary": ""
}`,

      userPrompt: (ctx) => {
        const current = ctx.answers?.step2_bmc_current || {};
        const future = ctx.answers?.step2_bmc_future || {};
        const si = ctx.strategicIntent;
        return `Strategic ambition: "${si.strategic_ambition || ''}"

Current BMC:
${JSON.stringify({ vp: current.value_propositions, rev: current.revenue_streams?.model, acts: current.key_activities }, null, 2)}

Future BMC:
${JSON.stringify({ vp: future.value_propositions, rev: future.revenue_streams?.model, moves: future.transformation_moves }, null, 2)}

Produce the delta analysis. executive_summary: 2-3 sentences for the Board.

Return JSON output.`;
      },

      outputSchema: {
        critical_gaps: ['object'],
        strategic_opportunities: ['object'],
        executive_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step2_bmc_analysis')
    }

  ],

  synthesize: (ctx) => {
    return {
      bmc: ctx.answers?.step2_bmc_future || {},
      bmcCurrent: ctx.answers?.step2_bmc_current || {},
      bmcAnalysis: ctx.answers?.step2_bmc_analysis || {}
    };
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      bmc: output.bmc,
      bmcCurrent: output.bmcCurrent,
      bmcAnalysis: output.bmcAnalysis
    };
  },

  onComplete: (model) => {
    if (typeof renderBMCSection === 'function') renderBMCSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step2');
    if (typeof toast === 'function') toast('Business Model Canvas complete ✓');

    const bmc = model.bmc || {};
    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 2 — Business Model Canvas complete**\n\n` +
        `**Future model:** ${bmc.metadata?.at_a_glance || (bmc.value_propositions || []).slice(0, 2).join(', ')}\n\n` +
        `Review current vs. future BMC in the **BMC** tab. Step 3 (Capability Architecture) is now unlocked.`
      );
    }
  }
};
