/**
 * Step4.js — Transformation Roadmap
 *
 * GOLDEN RULE: Roadmap must trace back to Business Objectives and set enrichment completeness to 100%.
 *
 * New 4-step workflow position: Step 4 of 4
 * - Step 1: Discovery (Business Objectives)
 * - Step 2: Capability Mapping (APQC-aligned)
 * - Step 3: Target Architecture
 * - Step 4: Transformation Roadmap ← THIS FILE
 *
 * Tasks:
 *   4.1 roadmap_waves    — Internal: Build 3-horizon wave plan with initiatives
 *   4.2 roadmap_validate — Question: Confirm roadmap before finalizing
 *
 * Outputs:
 *   model.roadmap                  — Wave-phased transformation roadmap
 *   model.initiatives              — Flattened initiative array (backward compat)
 *   model.businessContext.enrichment.roadmapConstraints  — Constraints with dependencies
 *   model.businessContext.enrichment.completenessScore   — SET TO 100% after Step 4
 */

const Step4 = {

  id: 'step4',
  name: 'Transformation Roadmap',
  dependsOn: ['step1', 'step2', 'step3'],

  tasks: [

    // ── Task 4.1: Transformation Roadmap ──────────────────────────────────
    {
      taskId: 'step4_roadmap_waves',
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
          "enables_pool": [],
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
        const bc = ctx.businessContext || {};
        const objectives = (bc.objectives || []).slice(0, 5).map(o => `${o.id || ''}: ${o.objective || o.name}`).join('\n');
        const timeframe = bc.timeframe || '3-5 years';
        const constraints = (bc.constraints || []).join('; ') || 'Budget and resource constraints apply';
        
        const gaps = (ctx.gapInsights || []).slice(0, 10).map(g =>
          `${g.gap_id} ${g.capability_name} (${g.priority}): ${g.gap_description}`
        );
        
        const archStyle = ctx.targetArchData?.metadata?.architecture_style || '';
        const aiAgents = (ctx.aiAgents || []).map(a => `${a.name} (${a.agent_type})`).join(', ');
        const whiteSpots = (ctx.whiteSpots || []).slice(0, 5).map(w => w.capability_name).join(', ');
        
        return `Strategic objectives:
${objectives}

Timeframe: ${timeframe}
Constraints: ${constraints}

Priority gaps to close:
${gaps.join('\n') || 'See gap analysis'}

Target architecture style: ${archStyle}
AI agents proposed: ${aiAgents || 'None'}
White-spot capabilities: ${whiteSpots || 'None'}

Build a 3-wave roadmap:
- W1 Foundation (0-6m): Foundation + quick wins
- W2 Build (6-18m): Core capability delivery
- W3 Scale (18-36m): Optimize and scale

Include 8-12 initiatives total. Each initiative must:
- Link to specific gaps via closes_gap[]
- Have clear dependencies via dependencies[]
- Include success_criteria for measurement
- Risk assessment (HIGH/MEDIUM/LOW)

executive_roadmap_summary: 3 sentences Board-level.`;
      },

      outputSchema: {
        waves: ['object'],
        critical_path: ['string'],
        executive_roadmap_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step4_roadmap_waves')
    },

    // ── Task 4.2: Roadmap Validation ──────────────────────────────────────
    {
      taskId: 'step4_roadmap_validate',
      title: 'Reviewing the roadmap',
      type: 'question',
      generateQuestion: false,
      allowSkip: false,

      // Skip validation in autopilot mode
      shouldRun: (ctx) => {
        if (ctx.workflowMode === 'autopilot') {
          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage('✅ Roadmap auto-validated (Autopilot mode)');
          }
          return false;
        }
        return true;
      },

      question: (ctx) => {
        const waves = ctx.answers?.step4_roadmap_waves?.waves || [];
        const summary = ctx.answers?.step4_roadmap_waves?.executive_roadmap_summary || '';
        const waveLines = waves.map(w =>
          `**${w.name}** (${w.horizon}): ${w.total_initiatives || (w.initiatives || []).length} initiatives — ${(w.wave_outcomes || []).slice(0, 1).join('')}`
        ).join('\n');
        return `**Transformation Roadmap complete.** Here's the overview:\n\n${waveLines}\n\n${summary}\n\nDoes this roadmap sequence make sense? Type "confirm" to finalize, or describe any adjustments needed.`;
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

  // ── Synthesize: Transform AI output to model structure ───────────────────
  synthesize: (ctx) => {
    const roadmap = ctx.answers?.step4_roadmap_waves || {};
    
    // Build legacy initiatives array (backward compat)
    const horizonToPhase = {
      'Foundation (0-6m)': 'Year 1 - Foundation',
      'Build (6-18m)':     'Year 2 - Expansion',
      'Scale (18-36m)':    'Year 3 - Optimisation'
    };
    const effortToValue = { S: 'low', M: 'medium', L: 'high', XL: 'high' };
    const legacyInitiatives = [];
    
    (roadmap.waves || []).forEach(wave => {
      const phase = horizonToPhase[wave.horizon] || wave.name || 'Year 1 - Foundation';
      (wave.initiatives || []).forEach(init => {
        legacyInitiatives.push({
          name:                  init.title || init.id || 'Initiative',
          impactsCapability:     (init.closes_gap || []).length > 0
                                   ? (init.closes_gap[0] || init.type || '')
                                   : (init.type || ''),
          phase:                 phase,
          estimatedBusinessValue: (init.enables_pool || []).length > 0
                                   ? 'high'
                                   : (effortToValue[init.effort] || 'medium'),
          complexity:            init.risk === 'HIGH'   ? 'high'
                                 : init.risk === 'MEDIUM' ? 'medium' : 'low',
          priority:              init.risk === 'HIGH'   ? 'high'
                                 : init.risk === 'MEDIUM' ? 'medium' : 'low',
          description:           init.success_criteria || '',
          strategicThemeLink:    null,
          depends_on:            init.dependencies || [],
          start_month:           1,
          duration_months:       init.effort === 'S' ? 2
                                 : init.effort === 'M' ? 4
                                 : init.effort === 'L' ? 6 : 9,
          success_criteria:      init.success_criteria || '',
          risk: { description: `${init.risk || 'MEDIUM'}`, mitigation: '' }
        });
      });
    });

    return {
      roadmap,
      initiatives: legacyInitiatives
    };
  },

  // ── Apply Output: Merge into model ────────────────────────────────────────
  applyOutput: (output, model) => {
    // Capture roadmap constraints for enrichment
    if (model.businessContext && model.businessContext.enrichment) {
      const roadmapConstraints = [];
      
      if (output.roadmap?.waves) {
        output.roadmap.waves.forEach(wave => {
          if (wave.initiatives) {
            wave.initiatives.forEach(init => {
              if (init.dependencies && init.dependencies.length > 0) {
                roadmapConstraints.push({
                  constraint: `${init.title} depends on: ${init.dependencies.join(', ')}`,
                  reason: init.success_criteria || 'Prerequisite',
                  type: 'Dependency'
                });
              }
            });
          }
        });
      }

      model.businessContext.enrichment.roadmapConstraints = roadmapConstraints;
      
      // GOLDEN RULE: Set completeness to 100% after Step 4
      model.businessContext.enrichment.completenessScore = 100;
    }

    return {
      ...model,
      roadmap: output.roadmap,
      initiatives: output.initiatives
    };
  },

  // ── On Complete: UI updates and final message ──────────────────────────────
  onComplete: (model) => {
    if (typeof renderRoadmapSection === 'function') renderRoadmapSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step4');
    if (typeof toast === 'function') toast('Engagement complete — all 4 steps done ✓');

    const waves = (model.roadmap?.waves || []).length;
    const initiatives = (model.initiatives || []).length;
    const summary = model.roadmap?.executive_roadmap_summary || '';

    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `🎯 **All 4 Steps complete!** Congratulations!\n\n` +
        `**✅ Summary:**\n` +
        `- Step 1: Business Objectives captured\n` +
        `- Step 2: ${model.capabilities?.length || 0} APQC-aligned capabilities mapped\n` +
        `- Step 3: Target Architecture designed (${model.archPrinciples?.length || 0} principles, ${model.archDecisions?.length || 0} ADRs)\n` +
        `- Step 4: Transformation Roadmap created (${waves} waves, ${initiatives} initiatives)\n\n` +
        `**Roadmap Summary:**\n${summary}\n\n` +
        `**Next Steps:**\n` +
        `- Use the **Export** button to generate the full EA engagement report\n` +
        `- Review tabs: Capability Map, Heatmap, Gap Analysis, Target Architecture, Roadmap\n` +
        `- Share with stakeholders for review and refinement`
      );
    }

    if (typeof autoSaveCurrentModel === 'function') {
      autoSaveCurrentModel();
    }
  }
};
