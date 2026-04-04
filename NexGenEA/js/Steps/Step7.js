/**
 * Step7.js — Target Architecture & Roadmap
 *
 * Sub-module A: Target Architecture
 *   7.1 arch_principles  — Internal: generate architecture principles
 *   7.2 target_arch      — Internal: design target state architecture
 *   7.3 arch_decisions   — Internal: key architecture decision records (ADRs)
 *
 * Sub-module B: Roadmap
 *   7.4 roadmap_waves    — Internal: 3-horizon roadmap (wave plan)
 *   7.5 roadmap_validate — Question: confirm roadmap before finalising
 *
 * Outputs:
 *   model.targetArch      — target architecture specification
 *   model.archDecisions   — ADR list
 *   model.roadmap         — wave-phased transformation roadmap
 */

const Step7 = {

  id: 'step7',
  name: 'Target Architecture & Roadmap',
  dependsOn: ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'],

  tasks: [

    // ── Task 7.1: Architecture Principles ────────────────────────────────
    {
      taskId: 'step7_arch_principles',
      title: 'Defining architecture principles',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '7_1_arch_principles.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Chief Architect. Define 6-10 architecture principles that will govern all design decisions for this organisation's target state transformation.

Return ONLY valid JSON:
{
  "principles": [
    {
      "id": "P01",
      "name": "",
      "statement": "",
      "rationale": "",
      "implications": [""],
      "anti_patterns": [""]
    }
  ],
  "governing_pattern": "",
  "architecture_style": ""
}

Each principle:
- name: 3-6 words
- statement: 1 sentence ("We will... because...")
- rationale: 1-2 sentences grounded in Strategic Intent
- implications: 2-3 concrete design decisions this principle demands
- anti_patterns: 1-2 patterns this principle explicitly prohibits`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const target = ctx.operatingModel?.target || {};
        return `Strategic themes: ${(si.strategic_themes || []).join(' | ')}
Target architecture style: ${target.technology?.infrastructure || ''} / ${target.applications?.integration_model || ''}
Data target: ${target.data?.data_maturity || ''}
Transformation principles from operating model: ${(target.transformation_principles || []).join('; ')}

Generate 6-10 architecture principles. Each must enable at least one strategic theme.`;
      },

      outputSchema: {
        principles: ['object'],
        architecture_style: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step7_arch_principles')
    },

    // ── Task 7.2: Target Architecture Design ─────────────────────────────
    {
      taskId: 'step7_target_arch',
      title: 'Designing target architecture',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '7_2_target_arch.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Senior Enterprise Architect. Design the target state architecture across all layers: Business, Data, Application, Technology.

Return ONLY valid JSON:
{
  "business_architecture": {
    "operating_model_archetype": "",
    "capability_domains": [{"domain":"","target_state":"","key_changes":""}],
    "process_redesign_priorities": [""]
  },
  "data_architecture": {
    "data_mesh_approach": true,
    "canonical_data_domains": [""],
    "data_platform": "",
    "master_data_strategy": "",
    "analytics_maturity_target": ""
  },
  "application_architecture": {
    "target_landscape": "",
    "decommission_list": [""],
    "new_capabilities_needed": [""],
    "integration_pattern": "",
    "api_strategy": ""
  },
  "technology_architecture": {
    "cloud_strategy": "",
    "infrastructure_pattern": "",
    "security_architecture": "",
    "devsecops_maturity": "",
    "key_platforms": [""]
  },
  "architecture_decisions": [
    {"adr_id":"ADR01","title":"","decision":"","rationale":"","consequences":[""],"status":"Proposed"}
  ],
  "metadata": {"at_a_glance":"","architecture_style":""}
}`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const targetOp = ctx.operatingModel?.target || {};
        const pools = (ctx.valuePools || []).filter(p => p.value_potential === 'HIGH').map(p => p.name).slice(0, 4);
        const principles = (ctx.answers?.step7_arch_principles?.principles || []).map(p => p.statement).join('\n');
        const options = (ctx.strategicOptions || []).filter(o => o.selected || o.recommended).map(o => o.name).slice(0, 6);
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Outcomes: ${(si.expected_outcomes || []).join('; ')}

Architecture principles:
${principles || 'see principles output'}

Target operating model:
- Infra: ${targetOp.technology?.infrastructure || ''}
- Integration: ${targetOp.applications?.integration_model || ''}
- Data: ${targetOp.data?.data_maturity || ''}

High-value pools to enable: ${pools.join(', ')}
Strategic options in scope: ${options.join(', ')}

Design the complete 4-layer target architecture. Include 3-5 ADRs for the hardest decisions. metadata.at_a_glance: 25 words max.`;
      },

      outputSchema: {
        business_architecture: 'object',
        data_architecture: 'object',
        application_architecture: 'object',
        technology_architecture: 'object'
      },

      parseOutput: (raw) => {
        const obj = OutputValidator.parseJSON(raw, 'step7_target_arch');
        // Promote ADRs if nested
        if (!obj.architecture_decisions && obj.business_architecture?.adrs) {
          obj.architecture_decisions = obj.business_architecture.adrs;
        }
        return obj;
      }
    },

    // ── Task 7.3: Architecture Decision Records ───────────────────────────
    {
      taskId: 'step7_arch_decisions',
      title: 'Documenting architecture decisions',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '7_3_arch_decisions.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Chief Architect documenting key Architecture Decision Records (ADRs). Consolidate and expand the architectural decisions identified in the target architecture design.

Return ONLY valid JSON:
{
  "adrs": [
    {
      "adr_id": "ADR01",
      "title": "",
      "context": "",
      "decision": "",
      "rationale": "",
      "alternatives_considered": [""],
      "consequences": {"positive":[""],"negative":[""],"risks":[""]},
      "review_date": "",
      "status": "Proposed|Accepted|Deprecated",
      "owner": ""
    }
  ]
}

Generate 5-8 ADRs covering the most consequential architectural choices.`,

      userPrompt: (ctx) => {
        const targetArch = ctx.answers?.step7_target_arch || {};
        const draftADRs = targetArch.architecture_decisions || [];
        const si = ctx.strategicIntent;
        return `Strategic timeframe: ${si.timeframe || '3-5 years'}
Draft ADRs from architecture design: ${JSON.stringify(draftADRs, null, 2)}

Expand these into full ADRs. Add additional ones for any significant architectural choices not yet captured.
Ensure coverage: data platform choice, integration pattern, cloud landing zone, security model, application portfolio disposition.`;
      },

      outputSchema: {
        adrs: ['object']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step7_arch_decisions')
    },

    // ── Task 7.4: Transformation Roadmap ──────────────────────────────────
    {
      taskId: 'step7_roadmap_waves',
      title: 'Building transformation roadmap',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '7_4_roadmap_waves.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Transformation Planning expert. Build a 3-horizon roadmap (wave plan) that sequences all initiatives to close the priority gaps and deliver the target architecture.

Return ONLY valid JSON:
{
  "waves": [
    {
      "wave_id": "W1",
      "name": "",
      "horizon": "Foundation (0-6m)|Build (6-18m)|Scale (18-36m)",
      "theme": "",
      "initiatives": [
        {
          "id": "I01",
          "title": "",
          "type": "Capability Build|Process Change|Technology Change|Organisation Change|Data Change",
          "closes_gap": ["G01"],
          "enables_pool": ["VP01"],
          "effort": "S|M|L|XL",
          "dependencies": ["I00"],
          "owner_role": "",
          "success_criteria": "",
          "risk": "HIGH|MEDIUM|LOW"
        }
      ],
      "wave_outcomes": [""],
      "total_initiatives": 0
    }
  ],
  "critical_path": ["I01", "I03"],
  "key_milestones": [{"month":3,"milestone":""}],
  "roadmap_assumptions": [""],
  "executive_roadmap_summary": ""
}`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const priorityGaps = (ctx.priorityGaps || []).slice(0, 10).map(g =>
          `${g.gap_id} ${g.capability} (${g.priority})`
        );
        const pools = (ctx.valuePools || []).map(p => `${p.id} ${p.name} (${p.time_horizon})`);
        const qw = (ctx.quickWins || []).slice(0, 5).map(q => `${q.id} ${q.title}`);
        const archStyle = ctx.answers?.step7_target_arch?.metadata?.architecture_style || '';
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Timeframe: ${si.timeframe || '3-5 years'}
Constraints: ${(si.key_constraints || []).join('; ')}

Priority gaps to close:
${priorityGaps.join('\n')}

Value pools by horizon:
${pools.join('\n')}

Quick wins (must appear in Wave 1):
${qw.join('\n') || 'see quick wins list'}

Target architecture style: ${archStyle}
Recommended options: ${(ctx.strategicOptions || []).filter(o => o.selected || o.recommended).map(o => o.name).join(', ')}

Build a 3-wave roadmap:
- W1 Foundation (0-6m): Foundation + quick wins
- W2 Build (6-18m): Core capability delivery
- W3 Scale (18-36m): Optimise and scale
Include 8-12 initiatives total. executive_roadmap_summary: 3 sentences Board-level.`;
      },

      outputSchema: {
        waves: ['object'],
        critical_path: ['string'],
        executive_roadmap_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step7_roadmap_waves')
    },

    // ── Task 7.5: Roadmap Validation ──────────────────────────────────────
    {
      taskId: 'step7_roadmap_validate',
      title: 'Reviewing the roadmap',
      type: 'question',
      generateQuestion: false,
      allowSkip: false,

      question: (ctx) => {
        const waves = ctx.answers?.step7_roadmap_waves?.waves || [];
        const summary = ctx.answers?.step7_roadmap_waves?.executive_roadmap_summary || '';
        const waveLines = waves.map(w =>
          `**${w.name}** (${w.horizon}): ${w.total_initiatives || (w.initiatives || []).length} initiatives — ${(w.wave_outcomes || []).slice(0, 1).join('')}`
        ).join('\n');
        return `**Transformation Roadmap complete.** Here's the overview:\n\n${waveLines}\n\n${summary}\n\nDoes this roadmap sequence make sense? Type "confirm" to finalise, or describe any adjustments needed.`;
      },

      options: [
        'Confirm — this looks right',
        'Adjust Wave 1 — I\'ll explain below',
        'Adjust resourcing assumptions — I\'ll explain below'
      ],

      wrapAnswer: (answer) => ({
        validation: answer,
        confirmed: /confirm|looks right|yes|ja|good|ok/i.test(answer)
      })
    }

  ],

  synthesize: (ctx) => {
    return {
      targetArch: ctx.answers?.step7_target_arch || {},
      archDecisions: ctx.answers?.step7_arch_decisions?.adrs || [],
      archPrinciples: ctx.answers?.step7_arch_principles?.principles || [],
      roadmap: ctx.answers?.step7_roadmap_waves || {}
    };
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      targetArch: output.targetArch,
      archDecisions: output.archDecisions,
      archPrinciples: output.archPrinciples,
      roadmap: output.roadmap
    };
  },

  onComplete: (model) => {
    if (typeof renderTargetArchSection === 'function') renderTargetArchSection();
    if (typeof renderRoadmapSection === 'function') renderRoadmapSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4, 5, 6, 7]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step7');
    if (typeof toast === 'function') toast('Engagement complete — all 7 steps done ✓');

    if (typeof addAssistantMessage === 'function') {
      const waves = (model.roadmap?.waves || []).length;
      const initiatives = (model.roadmap?.waves || []).reduce((sum, w) => sum + ((w.initiatives || []).length), 0);
      const adrs = (model.archDecisions || []).length;
      addAssistantMessage(
        `🎯 **All 7 Steps complete!**\n\n` +
        `**Target Architecture:** ${model.targetArch?.metadata?.architecture_style || 'designed'}\n` +
        `**Architecture Decisions:** ${adrs} ADRs\n` +
        `**Roadmap:** ${waves} waves, ${initiatives} initiatives\n\n` +
        `Use the **Export** button to generate the full EA engagement report. Review the complete architecture in the **Architecture** and **Roadmap** tabs.`
      );
    }
  }
};
