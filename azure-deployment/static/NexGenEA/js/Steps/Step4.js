/**
 * Step4.js — Operating Model
 *
 * Tasks:
 *   4.1 current_op_model  — Internal: map current operating model
 *   4.2 target_op_model   — Internal: design target operating model
 *   4.3 op_model_delta    — Internal: gap + transition analysis
 *
 * Outputs:
 *   model.operatingModel      — structured operating model object (current + target)
 *   model.operatingModelDelta — delta/transition analysis
 */

const Step4 = {

  id: 'step4',
  name: 'Operating Model',
  dependsOn: ['step1', 'step2', 'step3'],

  tasks: [

    // ── Task 4.1: Current Operating Model ─────────────────────────────────
    {
      taskId: 'step4_current_op_model',
      title: 'Mapping current operating model',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '4_1_current_op_model.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture expert. Map the CURRENT state operating model using the 6-block POLDAT/TOGAF-inspired framework:
People, Organisation, Locations, Data, Applications, Technology.

Return ONLY valid JSON:
{
  "people": {
    "workforce_model": "internal|hybrid|outsourced|gig",
    "key_roles": [""],
    "skill_gaps": [""],
    "culture_indicators": [""]
  },
  "organisation": {
    "structure": "functional|divisional|matrix|flat|federated",
    "governance_model": "",
    "decision_making": "centralised|decentralised|federated",
    "pain_points": [""]
  },
  "processes": {
    "core_processes": [""],
    "automation_level": "LOW|MEDIUM|HIGH",
    "process_maturity": 1,
    "key_inefficiencies": [""]
  },
  "data": {
    "data_domains": [""],
    "data_maturity": "siloed|consolidated|managed|analytics-driven",
    "quality_issues": [""],
    "governance": "ad-hoc|emerging|defined|managed"
  },
  "applications": {
    "core_systems": [""],
    "integration_model": "point-to-point|hub-spoke|event-driven|API-mesh",
    "technical_debt_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "shadow_it_risk": "LOW|MEDIUM|HIGH"
  },
  "technology": {
    "infrastructure": "on-premise|cloud|hybrid|multi-cloud",
    "cloud_maturity": "NOT_STARTED|EXPERIMENTING|SCALING|CLOUD_NATIVE",
    "security_posture": "BASIC|DEVELOPING|DEFINED|ADVANCED",
    "key_constraints": [""]
  },
  "metadata": {"at_a_glance":"","model_archetype":""}
}`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const caps = (ctx.capabilities || []).filter(c => c.current_maturity && c.current_maturity <= 2).map(c => c.name).slice(0, 5);
        return `Company: "${ctx.companyDescription}"

Strategic context:
- Pain: ${si.burning_platform || ''}
- Constraints: ${(si.key_constraints || []).join('; ')}
- Low-maturity capabilities: ${caps.join(', ') || 'see assessment'}

Map the CURRENT operating model. Derive from what the user has told us — mark guesses with ⚠️.`;
      },

      outputSchema: {
        people: 'object',
        organisation: 'object',
        processes: 'object',
        data: 'object',
        applications: 'object',
        technology: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_current_op_model')
    },

    // ── Task 4.2: Target Operating Model ──────────────────────────────────
    {
      taskId: 'step4_target_op_model',
      title: 'Designing target operating model',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '4_2_target_op_model.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture expert. Design the TARGET operating model that will deliver the Strategic Intent. Use the same 6-block structure as the current model.
Add "transformation_principles" — the guiding design decisions behind model changes.

Return ONLY valid JSON with same 6-block schema + transformation_principles + metadata.at_a_glance.`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const current = ctx.answers?.step4_current_op_model || {};
        const bmc = ctx.bmc || {};
        return `Strategic Intent:
- Ambition: ${si.strategic_ambition || ''}
- Themes: ${(si.strategic_themes || []).join(' | ')}
- Outcomes: ${(si.expected_outcomes || []).join('; ')}

Current model snapshot:
- Workforce: ${current.people?.workforce_model || ''}
- Tech debt: ${current.applications?.technical_debt_level || ''}
- Data maturity: ${current.data?.data_maturity || ''}
- Integration: ${current.applications?.integration_model || ''}

Future BMC value props: ${(bmc.value_propositions || []).join('; ')}
Future BMC transformation moves: ${(bmc.transformation_moves || []).map(m => m.from + '→' + m.to).join('; ')}

Design the TARGET operating model. Show bold shifts. Include transformation_principles (the "why" behind design choices).`;
      },

      outputSchema: {
        people: 'object',
        organisation: 'object',
        processes: 'object',
        data: 'object',
        applications: 'object',
        technology: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_target_op_model')
    },

    // ── Task 4.3: Op Model Delta ───────────────────────────────────────────
    {
      taskId: 'step4_op_model_delta',
      title: 'Analysing operating model gaps',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '4_3_op_model_delta.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Operating Model Transformation specialist. Compare current and target operating models to produce a structured delta and transition analysis.
Return ONLY valid JSON:
{
  "dimension_gaps": [{"dimension":"","current_state":"","target_state":"","gap_severity":"HIGH|MEDIUM|LOW","transition_complexity":"HIGH|MEDIUM|LOW","recommended_pattern":""}],
  "cross_cutting_themes": [""],
  "dependency_chain": [""],
  "change_readiness": {"score":0.0,"factors":[""],"risks":[""]},
  "executive_summary": ""
}`,

      userPrompt: (ctx) => {
        const current = ctx.answers?.step4_current_op_model || {};
        const target = ctx.answers?.step4_target_op_model || {};
        const si = ctx.strategicIntent;
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Timeframe: ${si.timeframe || '3-5 years'}

Current: ${JSON.stringify({ org: current.organisation?.structure, tech: current.technology?.cloud_maturity, data: current.data?.data_maturity }, null, 2)}
Target: ${JSON.stringify({ org: target.organisation?.structure, tech: target.technology?.cloud_maturity, data: target.data?.data_maturity }, null, 2)}

Produce the delta. change_readiness.score: 0.0-1.0. executive_summary: 2-3 sentences Board-level.`;
      },

      outputSchema: {
        dimension_gaps: ['object'],
        executive_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_op_model_delta')
    }

  ],

  synthesize: (ctx) => {
    return {
      operatingModel: {
        current: ctx.answers?.step4_current_op_model || {},
        target:  ctx.answers?.step4_target_op_model  || {}
      },
      operatingModelDelta: ctx.answers?.step4_op_model_delta || {}
    };
  },

  applyOutput: (output, model) => {
    // Seed systems from current operating model core_systems so Architecture Layers
    // tab is populated after Step 4 (Step 7 will enrich with target platforms).
    const existingSys = (model.systems || []).length > 0;
    const coreSysList = output.operatingModel?.current?.applications?.core_systems || [];
    const derivedSystems = existingSys
      ? model.systems
      : coreSysList.map(name => ({ name, status: 'active', category: 'core', description: '' }));
    return {
      ...model,
      operatingModel: output.operatingModel,
      operatingModelDelta: output.operatingModelDelta,
      systems: derivedSystems
    };
  },

  onComplete: (model) => {
    if (typeof renderOperatingModelSection === 'function') renderOperatingModelSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step4');
    if (typeof toast === 'function') toast('Operating Model complete ✓');

    if (typeof addAssistantMessage === 'function') {
      const ready = model.operatingModelDelta?.change_readiness?.score;
      addAssistantMessage(
        `**Step 4 — Operating Model complete**\n\n` +
        `Change readiness: **${ready ? (ready * 100).toFixed(0) + '%' : 'scored'}**\n\n` +
        `**Next:** Ready to analyze capability gaps? Click below or use the **Continue** button in the sidebar.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step5', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 5: Gap Analysis\n` +
        `</button>`
      );
    }
  }
};
