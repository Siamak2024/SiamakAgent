/**
 * Step6.js — Value Pools & Strategic Options
 *
 * Tasks:
 *   6.1 value_pools    — Internal: identify and size value pools
 *   6.2 options_matrix — Internal: generate strategic options per value pool
 *   6.3 option_select  — Question: which options to pursue?
 *
 * Outputs:
 *   model.valuePools        — array of value pool objects
 *   model.strategicOptions  — options with selection status
 */

const Step6 = {

  id: 'step6',
  name: 'Value Pools & Strategic Options',
  dependsOn: ['step1', 'step2', 'step3', 'step5'],

  tasks: [

    // ── Task 6.1: Identify Value Pools ────────────────────────────────────
    {
      taskId: 'step6_value_pools',
      title: 'Identifying value pools',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '6_1_value_pools.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Value Architecture strategist. Identify the distinct "value pools" available to this organisation — clusters of addressable value that architectural decisions will unlock or destroy.

Categories of value pools: Customer Experience, Operational Efficiency, Revenue Growth, Risk Reduction, Data/Insights Monetisation, Partnership/Ecosystem.

Return ONLY valid JSON:
{
  "value_pools": [
    {
      "id": "VP01",
      "name": "",
      "category": "Customer Experience|Operational Efficiency|Revenue Growth|Risk Reduction|Data/Insights|Partnership Ecosystem",
      "description": "",
      "value_potential": "HIGH|MEDIUM|LOW",
      "time_horizon": "Short (0-12m)|Medium (12-24m)|Long (24m+)",
      "linked_gaps": ["G01"],
      "linked_capabilities": [""],
      "value_narrative": "",
      "risks_if_missed": ""
    }
  ],
  "total_addressable_value": "",
  "executive_summary": ""
}

Generate 5-8 value pools. Every pool must link to at least one gap or capability.`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const priorityGaps = (ctx.priorityGaps || []).slice(0, 8).map(g =>
          `${g.gap_id} ${g.capability} (${g.priority}): ${g.gap_description || ''}`
        );
        const bmc = ctx.bmc || {};
        return `Company: "${ctx.companyDescription.slice(0, 300)}"

Strategic themes: ${(si.strategic_themes || []).join(' | ')}
Expected outcomes: ${(si.expected_outcomes || []).join('; ')}

Priority gaps:
${priorityGaps.join('\n') || 'see gap analysis'}

Future BMC opportunities: ${(ctx.bmcAnalysis?.strategic_opportunities || []).map(o => o.opportunity).join('; ')}

Identify 5-8 value pools. For each: what value becomes accessible if we close these gaps? Use directional sizing (no invented numbers). executive_summary: 2-3 sentences Board-level.`;
      },

      outputSchema: {
        value_pools: ['object'],
        executive_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step6_value_pools')
    },

    // ── Task 6.2: Strategic Options Matrix ───────────────────────────────
    {
      taskId: 'step6_options_matrix',
      title: 'Generating strategic options',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '6_2_options_matrix.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Strategic Portfolio advisor. For each value pool, generate 2-3 realistic strategic options — distinct approaches to capture that pool.

Include a "do nothing" option where the risk of inaction is significant.

Return ONLY valid JSON:
{
  "options": [
    {
      "option_id": "O01",
      "value_pool_id": "VP01",
      "name": "",
      "approach": "",
      "investment_level": "LOW|MEDIUM|HIGH",
      "time_to_value": "",
      "confidence": "HIGH|MEDIUM|LOW",
      "dependencies": [""],
      "pros": [""],
      "cons": [""],
      "recommended": false
    }
  ],
  "recommended_portfolio": {
    "option_ids": [],
    "rationale": "",
    "total_investment_band": "",
    "expected_value": ""
  }
}`,

      userPrompt: (ctx) => {
        const pools = ctx.answers?.step6_value_pools?.value_pools || [];
        const si = ctx.strategicIntent;
        const poolSummary = pools.map(p => `${p.id} "${p.name}" (${p.value_potential}): ${p.description || ''}`).join('\n');
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Constraints: ${(si.key_constraints || []).join('; ')}

Value pools:
${poolSummary}

Generate 2-3 options per value pool. Mark recommended=true if aligned with Strategic Intent.
recommended_portfolio: the most coherent combination of options. Express total_investment_band as a range descriptor.`;
      },

      outputSchema: {
        options: ['object'],
        recommended_portfolio: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step6_options_matrix')
    },

    // ── Task 6.3: User confirms options ───────────────────────────────────
    {
      taskId: 'step6_option_select',
      title: 'Reviewing strategic options',
      type: 'question',
      generateQuestion: false,
      allowSkip: false,

      question: (ctx) => {
        const portfolio = ctx.answers?.step6_options_matrix?.recommended_portfolio || {};
        const options = ctx.answers?.step6_options_matrix?.options || [];
        const recommended = options.filter(o => o.recommended).map(o => `• ${o.name} (${o.investment_level} investment)`).join('\n');
        return `**Strategic options analysed.** Recommended portfolio:\n\n${recommended}\n\n**Rationale:** ${portfolio.rationale || ''}\n**Investment band:** ${portfolio.total_investment_band || ''}\n\nDo you want to proceed with this portfolio, or adjust which options to include?`;
      },

      options: [
        'Proceed with recommended portfolio',
        'Include more options — I\'ll describe below',
        'Reduce scope — I\'ll describe below'
      ],

      wrapAnswer: (answer) => ({
        portfolio_decision: answer,
        confirmed: /proceed|recommended|yes|confirm|ok/i.test(answer)
      })
    }

  ],

  synthesize: (ctx) => {
    const options = ctx.answers?.step6_options_matrix?.options || [];
    const decision = ctx.answers?.step6_option_select || {};

    return {
      valuePools: ctx.answers?.step6_value_pools?.value_pools || [],
      strategicOptions: options.map(o => ({
        ...o,
        selected: decision.confirmed ? o.recommended : undefined
      })),
      recommendedPortfolio: ctx.answers?.step6_options_matrix?.recommended_portfolio || {}
    };
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      valuePools: output.valuePools,
      strategicOptions: output.strategicOptions,
      recommendedPortfolio: output.recommendedPortfolio
    };
  },

  onComplete: (model) => {
    if (typeof renderValuePoolsSection === 'function') renderValuePoolsSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step6');
    if (typeof toast === 'function') toast('Value Pools complete ✓');

    if (typeof addAssistantMessage === 'function') {
      const count = (model.valuePools || []).length;
      const portfolio = model.recommendedPortfolio || {};
      addAssistantMessage(
        `**Step 6 — Value Pools complete**\n\n` +
        `${count} value pools identified.\n` +
        `Recommended portfolio: **${portfolio.expected_value || 'see analysis'}**\n\n` +
        `Step 7 (Target Architecture & Roadmap) is now unlocked.`
      );
    }
  }
};
