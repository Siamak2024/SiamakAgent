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
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const si = ctx.strategicIntent;
        const caps = (ctx.capabilities || []).filter(c => c.current_maturity && c.current_maturity <= 2).map(c => c.name).slice(0, 5);
        
        if (profile) {
          // Rich Profile: Use structure and technology landscape
          const structure = profile.structure?.organizationalStructure || 'Not specified';
          const governance = profile.structure?.governance || 'Not specified';
          const coreSystems = (profile.technologyLandscape?.coreSystems || []).map(s => s.name).join(', ');
          const legacySystems = (profile.technologyLandspace?.legacySystems || []).map(s => s.name).join(', ');
          
          return `**ORGANIZATION PROFILE - OPERATING MODEL CONTEXT:**

Organization: ${profile.organizationName} (${profile.industry})

**Structure:**
- Organizational Structure: ${structure}
- Governance: ${governance}
- Departments: ${(profile.structure?.departments || []).join(', ') || 'Not specified'}

**Technology Landscape:**
- Core Systems: ${coreSystems || 'Not specified'}
- Legacy Systems: ${legacySystems || 'Not specified'}
- Cloud Adoption: ${profile.technologyLandscape?.cloudAdoption || 'Unknown'}
- Tech Debt: ${profile.technologyLandscape?.techDebt || 'Unknown'}

**Strategic context:**
- Burning platform: ${si.burning_platform || ''}
- Constraints: ${(si.key_constraints || []).join('; ')}
- Low-maturity capabilities: ${caps.join(', ') || 'see assessment'}

**CRITICAL:** Map the CURRENT operating model grounded in the SPECIFIC structure and systems from the profile. Do NOT invent system names or organizational units not mentioned.

Return ONLY valid JSON. ALL key names must be EXACTLY as shown below (in English). Only text values may be in the local language:
{"value_delivery":{"value_streams":[],"customer_journeys":[],"channels":[]},"capability_model":[{"name":"","purpose":"","group":"Commercial","maturity":"Medium","strategic_priority":"High"}],"process_model":[{"name":"","linked_capability":"","is_bottleneck":false,"description":""}],"organisation_governance":{"key_roles":[],"capability_ownership":[{"capability":"","owner":""}],"governance_model":"Centralized","decision_making":""},"application_data_landscape":{"core_systems":[{"name":"","supports_capability":"","status":"active"}],"gaps_overlaps":[]},"operating_model_principles":[],"metadata":{"at_a_glance":"","model_archetype":""}}`;}
        
        // Quick Start fallback
        return `Company: "${ctx.companyDescription}"

Strategic context:
- Burning platform: ${si.burning_platform || ''}
- Constraints: ${(si.key_constraints || []).join('; ')}
- Low-maturity capabilities: ${caps.join(', ') || 'see assessment'}

Map the CURRENT operating model. Derive from company context — mark guesses with ⚠️.

Return ONLY valid JSON. ALL key names must be EXACTLY as shown below (in English). Only text values may be in the local language:
{"value_delivery":{"value_streams":[],"customer_journeys":[],"channels":[]},"capability_model":[{"name":"","purpose":"","group":"Commercial","maturity":"Medium","strategic_priority":"High"}],"process_model":[{"name":"","linked_capability":"","is_bottleneck":false,"description":""}],"organisation_governance":{"key_roles":[],"capability_ownership":[{"capability":"","owner":""}],"governance_model":"Centralized","decision_making":""},"application_data_landscape":{"core_systems":[{"name":"","supports_capability":"","status":"active"}],"gaps_overlaps":[]},"operating_model_principles":[],"metadata":{"at_a_glance":"","model_archetype":""}}`;},

      outputSchema: {
        value_delivery: 'object?',
        capability_model: ['object?'],
        process_model: ['object?'],
        organisation_governance: 'object?',
        application_data_landscape: 'object?',
        operating_model_principles: ['string?']
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step4_current_op_model');
        const EXPECTED = ['value_delivery', 'capability_model', 'process_model',
          'organisation_governance', 'application_data_landscape', 'operating_model_principles'];
        // Recursive depth-first search (up to 3 levels) for object containing OM keys
        function findOMObject(obj, depth) {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 3) return null;
          if (EXPECTED.some(k => obj[k] !== undefined)) return obj;
          let bestMatch = null, bestCount = 0;
          for (const k of Object.keys(obj)) {
            const child = obj[k];
            if (child && typeof child === 'object' && !Array.isArray(child)) {
              const found = findOMObject(child, depth + 1);
              if (found) {
                const count = EXPECTED.filter(ek => found[ek] !== undefined).length;
                if (count > bestCount) { bestCount = count; bestMatch = found; }
              }
            }
          }
          return bestMatch;
        }
        const found = findOMObject(parsed, 0);
        if (found) {
          const matchCount = EXPECTED.filter(k => found[k] !== undefined).length;
          if (found !== parsed) console.log(`[Step4] Unwrapped current OM (${matchCount} matching keys)`);
          return found;
        }
        console.warn('[Step4] Could not unwrap – raw AI output:', JSON.stringify(parsed).slice(0, 500));
        return parsed;
      }
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
        
        // ── Phase 2.3: Include AI transformation context ──
        const aiThemes = (si.ai_transformation_themes || []);
        const aiActivities = (bmc.ai_transformation?.ai_enabled_activities || []);
        const aiCapabilities = (ctx.capabilities || []).filter(c => c.ai_enabled).map(c => c.name);
        
        const aiContext = (aiThemes.length > 0 || aiActivities.length > 0 || aiCapabilities.length > 0)
          ? `\n\nAI Transformation Context:\n` +
            (aiThemes.length > 0 ? `- Strategic AI themes: ${aiThemes.join('; ')}\n` : '') +
            (aiActivities.length > 0 ? `- BMC AI activities: ${aiActivities.join(', ')}\n` : '') +
            (aiCapabilities.length > 0 ? `- AI-enabled capabilities: ${aiCapabilities.slice(0, 5).join(', ')}\n` : '') +
            `Mark processes as ai_enabled: true if they use AI/ML/automation.\n` +
            `Mark systems as is_ai_platform: true if they are ML/AI platforms (e.g., Azure ML, Databricks, UiPath, Salesforce Einstein).\n` +
            `Include AI governance roles in key_roles if AI transformation is significant.\n` +
            `Populate ai_transformation_indicators section with ai_enabled_processes, ai_platforms, ai_governance_roles, and ai_readiness_assessment.`
          : '';
        
        return `Strategic Intent:
- Ambition: ${si.strategic_ambition || ''}
- Themes: ${(si.strategic_themes || []).join(' | ')}
- Outcomes: ${(si.expected_outcomes || []).join('; ')}

Current Operating Model:
- Archetype: ${curArch || 'unknown'}
- Summary: ${curSummary || 'see current state'}
- Process bottlenecks: ${bottlenecks || 'none identified'}
- High-priority low-maturity capabilities: ${lowCaps || 'none identified'}

Future BMC value props: ${(bmc.value_propositions || []).join('; ')}${aiContext}

Design the TARGET operating model (6 building blocks). Address bottlenecks and low-maturity priorities. Include transformation_principles explaining the "why" behind design changes.

Return ONLY valid JSON. ALL key names must be EXACTLY as shown below (in English). Only text values may be in the local language:
{"value_delivery":{"value_streams":[],"customer_journeys":[],"channels":[]},"capability_model":[{"name":"","purpose":"","group":"Commercial","maturity":"High","strategic_priority":"High"}],"process_model":[{"name":"","linked_capability":"","is_bottleneck":false,"description":"","ai_enabled":false}],"organisation_governance":{"key_roles":[],"capability_ownership":[{"capability":"","owner":""}],"governance_model":"Federated","decision_making":""},"application_data_landscape":{"core_systems":[{"name":"","supports_capability":"","status":"active","is_ai_platform":false}],"gaps_overlaps":[]},"operating_model_principles":[],"transformation_principles":[],"metadata":{"at_a_glance":"","model_archetype":""},"ai_transformation_indicators":{"ai_enabled_processes":[],"ai_platforms":[],"ai_governance_roles":[],"ai_readiness_assessment":""}}`;
      },

      outputSchema: {
        value_delivery: 'object?',
        capability_model: ['object?'],
        process_model: ['object?'],
        organisation_governance: 'object?',
        application_data_landscape: 'object?',
        operating_model_principles: ['string?'],
        transformation_principles: ['string?']
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step4_target_op_model');
        const EXPECTED = ['value_delivery', 'capability_model', 'process_model',
          'organisation_governance', 'application_data_landscape', 'operating_model_principles'];
        function findOMObject(obj, depth) {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 3) return null;
          if (EXPECTED.some(k => obj[k] !== undefined)) return obj;
          let bestMatch = null, bestCount = 0;
          for (const k of Object.keys(obj)) {
            const child = obj[k];
            if (child && typeof child === 'object' && !Array.isArray(child)) {
              const found = findOMObject(child, depth + 1);
              if (found) {
                const count = EXPECTED.filter(ek => found[ek] !== undefined).length;
                if (count > bestCount) { bestCount = count; bestMatch = found; }
              }
            }
          }
          return bestMatch;
        }
        const found = findOMObject(parsed, 0);
        if (found) {
          if (found !== parsed) console.log(`[Step4] Unwrapped target OM (${EXPECTED.filter(k => found[k] !== undefined).length} matching keys)`);
          return found;
        }
        console.warn('[Step4] Could not unwrap target – raw:', JSON.stringify(parsed).slice(0, 500));
        return parsed;
      }
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

Compare the 6 building blocks across current and target models. change_readiness.score: 0.0-1.0. executive_summary: 2-3 sentences Board-level.

Return ONLY valid JSON. ALL key names must be EXACTLY as shown below (in English). Only text values may be in the local language:
{"dimension_gaps":[{"dimension":"Value Delivery","current_state":"","target_state":"","gap_severity":"HIGH","transition_complexity":"MEDIUM","recommended_pattern":""},{"dimension":"Capability Model","current_state":"","target_state":"","gap_severity":"HIGH","transition_complexity":"MEDIUM","recommended_pattern":""},{"dimension":"Process Model","current_state":"","target_state":"","gap_severity":"MEDIUM","transition_complexity":"LOW","recommended_pattern":""},{"dimension":"Organisation & Governance","current_state":"","target_state":"","gap_severity":"MEDIUM","transition_complexity":"MEDIUM","recommended_pattern":""},{"dimension":"Application & Data Landscape","current_state":"","target_state":"","gap_severity":"HIGH","transition_complexity":"HIGH","recommended_pattern":""},{"dimension":"Operating Model Principles","current_state":"","target_state":"","gap_severity":"LOW","transition_complexity":"LOW","recommended_pattern":""}],"cross_cutting_themes":[],"dependency_chain":[],"change_readiness":{"score":0.0,"factors":[],"risks":[]},"executive_summary":""}`;
      },

      outputSchema: {
        dimension_gaps: ['object?'],
        executive_summary: 'string?'
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step4_op_model_delta');
        const DELTA_KEYS = ['dimension_gaps', 'executive_summary', 'cross_cutting_themes',
          'change_readiness', 'dependency_chain'];
        if (DELTA_KEYS.some(k => parsed[k] !== undefined)) return parsed;
        // Generic unwrap if AI wrapped in a parent key
        for (const key of Object.keys(parsed || {})) {
          const inner = parsed[key];
          if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
            if (DELTA_KEYS.filter(k => inner[k] !== undefined).length >= 1) {
              console.log(`[Step4] Unwrapped delta from key "${key}"`);
              return inner;
            }
          }
        }
        return parsed;
      }
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
