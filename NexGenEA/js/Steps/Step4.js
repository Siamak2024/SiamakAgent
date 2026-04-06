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

      systemPromptFallback: `You are an Enterprise Architecture expert. Map the CURRENT state operating model using the 6-building-block framework.

Return ONLY valid JSON:
{
  "value_delivery": { "value_streams": [], "customer_journeys": [], "channels": [] },
  "capability_model": [
    { "name": "", "purpose": "", "group": "Commercial|Operations|Support|Digital", "maturity": "High|Medium|Low", "strategic_priority": "High|Medium|Low" }
  ],
  "process_model": [
    { "name": "", "linked_capability": "", "is_bottleneck": false, "description": "" }
  ],
  "organisation_governance": {
    "key_roles": [],
    "capability_ownership": [{ "capability": "", "owner": "" }],
    "governance_model": "Centralized|Decentralized|Federated",
    "decision_making": ""
  },
  "application_data_landscape": {
    "core_systems": [{ "name": "", "supports_capability": "", "status": "active|gap|redundant" }],
    "gaps_overlaps": []
  },
  "operating_model_principles": [],
  "metadata": { "at_a_glance": "", "model_archetype": "" }
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
        value_delivery: 'object',
        capability_model: ['object'],
        process_model: ['object'],
        organisation_governance: 'object',
        application_data_landscape: 'object',
        operating_model_principles: ['string']
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

      systemPromptFallback: `You are an Enterprise Architecture expert. Design the TARGET operating model using the 6-building-block framework.
Add "transformation_principles" (3-5 items) explaining the "why" behind key design changes.

Return ONLY valid JSON with same 6-block schema + transformation_principles[] + metadata.`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const current = ctx.answers?.step4_current_op_model || {};
        const bmc = ctx.bmc || {};
        const curSummary = current.metadata?.at_a_glance || '';
        const curArch = current.metadata?.model_archetype || '';
        const bottlenecks = (current.process_model || []).filter(p => p.is_bottleneck).map(p => p.name).join(', ');
        const lowCaps = (current.capability_model || []).filter(c => c.maturity === 'Low' && c.strategic_priority === 'High').map(c => c.name).join(', ');
        return `Strategic Intent:
- Ambition: ${si.strategic_ambition || ''}
- Themes: ${(si.strategic_themes || []).join(' | ')}
- Outcomes: ${(si.expected_outcomes || []).join('; ')}

Current Operating Model:
- Archetype: ${curArch || 'unknown'}
- Summary: ${curSummary || 'see current state'}
- Process bottlenecks: ${bottlenecks || 'none identified'}
- High-priority low-maturity capabilities: ${lowCaps || 'none identified'}

Future BMC value props: ${(bmc.value_propositions || []).join('; ')}

Design the TARGET operating model (6 building blocks). Address the bottlenecks and low-maturity priorities. Include transformation_principles (the "why" behind your design choices).`;
      },

      outputSchema: {
        value_delivery: 'object',
        capability_model: ['object'],
        process_model: ['object'],
        organisation_governance: 'object',
        application_data_landscape: 'object',
        operating_model_principles: ['string'],
        transformation_principles: ['string']
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
        const curArch   = current.metadata?.model_archetype || 'unknown';
        const tgtArch   = target.metadata?.model_archetype || 'unknown';
        const principles = (target.transformation_principles || []).join('; ');
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Timeframe: ${si.timeframe || '3-5 years'}

Current archetype: "${curArch}"  →  Target archetype: "${tgtArch}"
Transformation principles: ${principles || 'see target model'}

Compare the 6 building blocks (Value Delivery / Capability Model / Process Model / Organisation & Governance / Application & Data Landscape / Operating Model Principles).
change_readiness.score: 0.0-1.0. executive_summary: 2-3 sentences Board-level.`;
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
    // Seed systems from operating model so Architecture Layers tab is populated after Step 4.
    // Supports new 6-block schema (application_data_landscape) and old schema (applications.core_systems).
    const existingSys = (model.systems || []).length > 0;
    const newSchemaList  = output.operatingModel?.current?.application_data_landscape?.core_systems || [];
    const oldSchemaList  = output.operatingModel?.current?.applications?.core_systems || [];
    const srcList = newSchemaList.length ? newSchemaList : oldSchemaList;
    const derivedSystems = existingSys
      ? model.systems
      : srcList.map(s => typeof s === 'string'
          ? { name: s, status: 'active', category: 'core', description: '' }
          : { name: s.name || '', status: s.status || 'active', category: 'core', description: s.supports_capability || '' });
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
