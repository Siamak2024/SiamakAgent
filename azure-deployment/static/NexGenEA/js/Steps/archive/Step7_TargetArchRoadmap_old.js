/**
 * Step7.js — Target Architecture & Roadmap
 *
 * GOLDEN RULE: Roadmap must trace back to Primary Objectives and set enrichment completeness to 100%.
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
 *   model.businessContext.enrichment.roadmapConstraints — constraints with dependencies
 *   model.businessContext.enrichment.completenessScore  — SET TO 100% after Step7
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
        const si = ctx.strategicIntent || {};
        const target = ctx.operatingModel?.target || {};
        const bmc = ctx.businessModelCanvas || {};
        const caps = ctx.capabilityMap || [];
        
        const strategicThemes = (si.strategic_themes || []).join(' | ') || 'Digital transformation and operational excellence';
        const techStyle = target.technology?.infrastructure || bmc.key_resources || 'Cloud-native architecture';
        const integrationModel = target.applications?.integration_model || 'API-first integration';
        const dataMaturity = target.data?.data_maturity || bmc.value_proposition || 'Data-driven decision making';
        const transformPrinciples = (target.transformation_principles || []).join('; ') || 'Agile, customer-centric, scalable';
        const industry = ctx.company?.industry || ctx.autopilotContext?.industry || 'enterprise';
        const companyDescription = ctx.company?.description || 'organization undergoing digital transformation';
        
        return `Company: ${companyDescription}
Industry: ${industry}
Strategic themes: ${strategicThemes}
Target architecture style: ${techStyle} / ${integrationModel}
Data target: ${dataMaturity}
Transformation principles from operating model: ${transformPrinciples}
Key capabilities: ${caps.slice(0, 5).map(c => c.name).join(', ') || 'technology modernization'}

Generate 6-10 architecture principles that support this organization's specific transformation. Include at least one AI/Automation principle (mandatory).`;
      },

      outputSchema: {
        principles: ['object?'],  // Made optional to prevent cascade failure
        governing_pattern: 'string?',
        architecture_style: 'string?'
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step7_arch_principles');
        // Fallback: If AI didn't generate principles, provide sensible defaults
        if (!parsed.principles || parsed.principles.length === 0) {
          console.warn('[Step7] AI did not generate architecture principles. Using fallback defaults.');
          parsed.principles = [
            {
              id: 'P01',
              name: 'Cloud-First Infrastructure',
              statement: 'We will deploy all new systems to cloud infrastructure because it provides scalability, resilience, and faster time-to-market.',
              rationale: 'Legacy on-premise infrastructure limits innovation speed and increases operational costs.',
              implications: ['All new applications are cloud-native', 'Migrate legacy systems to cloud-managed services', 'No new on-premise hardware purchases'],
              anti_patterns: ['On-premise first procurement', 'Lift-and-shift without re-architecture']
            },
            {
              id: 'P02',
              name: 'API-First Integration',
              statement: 'We will integrate all systems via APIs and event-driven architectures because point-to-point integrations create fragility and hinder agility.',
              rationale: 'Modern integration enables rapid business change and ecosystem partnerships.',
              implications: ['All integrations use REST/GraphQL APIs or event bus', 'No direct database connections between systems', 'API catalog and governance in place'],
              anti_patterns: ['Point-to-point custom integrations', 'Batch file transfers for real-time data']
            },
            {
              id: 'P03',
              name: 'Data-Driven Decision Making',
              statement: 'We will centralize data in a unified platform and ensure single source of truth because fragmented data prevents informed decisions.',
              rationale: 'Strategic intent emphasizes data quality and analytics capabilities.',
              implications: ['Master Data Management for core entities', 'Self-service analytics platforms', 'Data quality monitoring and alerting'],
              anti_patterns: ['Departmental data silos', 'Manual data reconciliation']
            },
            {
              id: 'P04',
              name: 'AI-Augmented Operations',
              statement: 'We will deploy AI to automate routine tasks and augment human decision-making because intelligent automation frees people for strategic work.',
              rationale: 'Competitive pressure requires faster, smarter operations at lower cost.',
              implications: ['AI-powered process automation for high-volume tasks', 'Predictive analytics for proactive issue resolution', 'Human-in-loop for high-stakes decisions'],
              anti_patterns: ['Full automation without human oversight', 'AI for the sake of AI without ROI']
            }
          ];
        }
        return parsed;
      }
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

CRITICAL: Generate 3-8 AI agents that automate or augment capabilities. Each agent must have: name, agent_type (NLP/RPA/Predictive Analytics/Computer Vision/Conversational AI), purpose, linked_capabilities array, maturity_level (Pilot/Production/Optimized), and is_proposed: true.

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
  "ai_agents": [
    {
      "name": "Document Processing RPA",
      "agent_type": "RPA",
      "purpose": "Automate document extraction and data entry",
      "linked_capabilities": ["Process Documents"],
      "maturity_level": "Pilot",
      "is_proposed": true
    }
  ],
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
        const capabilities = (ctx.capabilities || []).map(c => c.name).slice(0, 8).join(', ');
        const aiEnabledCaps = (ctx.capabilities || []).filter(c => c.ai_enabled).map(c => c.name).join(', ');
        const gaps = (ctx.priorityGaps || []).slice(0, 5).map(g => g.gap || g.title || g.name).join('; ');
        
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Outcomes: ${(si.expected_outcomes || []).join('; ')}
AI transformation role: ${si.ai_transformation_ambition || 'Improve efficiency and decision-making'}

Architecture principles:
${principles || 'see principles output'}

Target operating model:
- Infra: ${targetOp.technology?.infrastructure || ''}
- Integration: ${targetOp.applications?.integration_model || ''}
- Data: ${targetOp.data?.data_maturity || ''}

High-value pools to enable: ${pools.join(', ')}
Strategic options in scope: ${options.join(', ')}

Capabilities to support: ${capabilities}
AI-enabled capabilities: ${aiEnabledCaps || 'Identify from capabilities'}
Priority gaps: ${gaps}

Design the complete 4-layer target architecture. 

CRITICAL - AI AGENTS (MANDATORY):
Generate 3-8 AI agents that address priority gaps and automate/augment capabilities. Focus on:
- Document processing and data entry automation (RPA)
- Customer service and inquiries (Conversational AI, NLP)  
- Predictive analytics for operations (Predictive Analytics)
- Data quality and anomaly detection (ML/AI)
- Process optimization (Decision Support)
Each agent MUST link to specific capabilities by name.

Include 3-5 ADRs for the hardest decisions. metadata.at_a_glance: 25 words max.`;
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
        
        // Phase 2.6: AI Transformation Context
        const aiThemes = (si.ai_transformation_themes || []).join(', ');
        const aiCapabilities = (ctx.capabilities || [])
          .filter(cap => cap.ai_enabled)
          .map(cap => cap.capability_name || cap.name);
        const aiGaps = (ctx.priorityGaps || [])
          .filter(gap => gap.ai_enabled_gap)
          .map(g => `${g.gap_id} ${g.capability} [AI-enabled]`);
        const aiValuePools = (ctx.valuePools || [])
          .filter(pool => pool.ai_enabled_value)
          .map(p => `${p.id} ${p.name} (${p.time_horizon}) [AI-enabled]`);
        
        return `Strategic ambition: "${si.strategic_ambition || ''}"
Timeframe: ${si.timeframe || '3-5 years'}
Constraints: ${(si.key_constraints || []).join('; ')}

Priority gaps to close:
${priorityGaps.join('\n')}

${aiGaps.length > 0 ? `AI-enabled gaps (require AI/ML/automation initiatives):
${aiGaps.join('\n')}
` : ''}
Value pools by horizon:
${pools.join('\n')}

${aiValuePools.length > 0 ? `AI-enabled value pools (quantify AI transformation ROI):
${aiValuePools.join('\n')}
` : ''}
Quick wins (must appear in Wave 1):
${qw.join('\n') || 'see quick wins list'}

Target architecture style: ${archStyle}
Recommended options: ${(ctx.strategicOptions || []).filter(o => o.selected || o.recommended).map(o => o.name).join(', ')}

${aiThemes ? `AI Transformation Context:
Strategic Intent AI themes: ${aiThemes}
AI-enabled capabilities from Step 3: ${aiCapabilities.slice(0, 5).join(', ')}
Mark initiatives as ai_enabled_initiative: true if they implement AI transformation (see instruction file for criteria).
` : ''}
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
    // ── BUG-7 FIX: Build legacy model.initiatives from new roadmap schema ──
    // renderRoadmapVisual() and renderInitiatives() read model.initiatives
    // (old flat array). Step7 now sets model.roadmap = { waves: [...] }.
    // We convert waves[].initiatives[] to the legacy flat array so the render
    // functions work without modification.
    const horizonToPhase = {
      'Foundation (0-6m)': 'Year 1 - Foundation',
      'Build (6-18m)':     'Year 2 - Expansion',
      'Scale (18-36m)':    'Year 3 - Optimisation'
    };
    const effortToValue = { S: 'low', M: 'medium', L: 'high', XL: 'high' };
    const legacyInitiatives = [];
    (output.roadmap?.waves || []).forEach(wave => {
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

    // ── BUG-8 FIX: Build legacy model.targetArch flat array for renderTargetArchVisual ──
    // renderTargetArchVisual() expects an array of
    //   { name, domain, currentMaturity, targetMaturity, strategicImportance, action, enabler }
    // Step7 writes model.targetArch as an object { business_architecture, data_architecture, ... }.
    // We derive the flat array from model.capabilities (Step3 output) which has all
    // current_maturity / target_maturity values, enriched with Step7 intent.
    const caps = model.capabilities || [];
    const archObj = output.targetArch || {};
    let legacyTargetArch = [];

    if (caps.length > 0) {
      const domainKeywords = {
        Customer:   /customer|tenant|client|renter|occupant|lease/i,
        Finance:    /financ|cost|revenue|budget|account|billing|payment/i,
        Technology: /tech|system|digital|data|platform|software|api|cloud|it\b/i,
        Risk:       /risk|compliance|security|govern|audit|legal|regulation/i,
        Operations: /operat|process|maintenance|facilit|propert|asset|manage/i,
        Support:    /hr|human.*resource|people|train|support|service.*desk/i
      };
      const inferDomain = (cap) => {
        const text = (cap.name + ' ' + (cap.description || '')).toLowerCase();
        for (const [domain, re] of Object.entries(domainKeywords)) {
          if (re.test(text)) return domain;
        }
        return 'Operations';
      };

      // Get L1 domains with their maturity from Step3 capabilities
      const l1Caps = caps.filter(c => c.level === 1 || !c.level);
      const capList = l1Caps.length > 0 ? l1Caps : caps;

      legacyTargetArch = capList.map(cap => ({
        name:                 cap.name,
        domain:               cap.domain || inferDomain(cap),
        currentMaturity:      cap.current_maturity || cap.maturity || 2,
        targetMaturity:       cap.target_maturity
                               || Math.min(5, (cap.current_maturity || cap.maturity || 2) + 1),
        strategicImportance:  (cap.strategic_importance || 'SUPPORT')
                               .toLowerCase()
                               .replace('core', 'high')
                               .replace('support', 'medium')
                               .replace('commodity', 'low'),
        action:               (cap.quick_wins || []).slice(0, 1).join('') || '',
        enabler:              archObj.technology_architecture?.infrastructure || ''
      }));
    }
    // ── END BUG-7 + BUG-8 FIX ──────────────────────────────────────────────

    return {
      ...model,
      targetArch:     legacyTargetArch,   // Legacy flat array for renderTargetArchVisual
      targetArchData: output.targetArch,  // Rich new format preserved
      archDecisions:  output.archDecisions,
      archPrinciples: output.archPrinciples,
      roadmap:        output.roadmap,
      initiatives:    legacyInitiatives,  // Legacy flat array for renderRoadmapVisual/renderInitiatives
      targetArchDone: true,               // Unlocks targetarch + roadmapvis tabs in updateTabLockStates()

      // ── Populate Architecture Layers (valueStreams / systems / aiAgents) ──
      // These were never set by Steps 1-6. Step7 knows the full arch so we
      // derive them here so the Layers tab is populated after autopilot.
      valueStreams: (() => {
        // Existing user-entered streams take priority
        if ((model.valueStreams || []).length > 0) return model.valueStreams;
        // Derive from L1 domain names in model.capabilities (level=1 items set by Step3)
        const l1Names = (model.capabilities || [])
          .filter(c => c.level === 1)
          .map(c => c.domain || c.name)
          .filter(Boolean);
        // Also try l1_domains from capabilityMap directly
        const mapNames = (model.capabilityMap?.l1_domains || []).map(d => d.name).filter(Boolean);
        const domainNames = l1Names.length > 0 ? l1Names : mapNames;
        const fromBiz  = (output.targetArch?.business_architecture?.process_redesign_priorities || []).slice(0, 4);
        const sources  = fromBiz.length ? fromBiz : domainNames;
        return sources.map(name => ({ name, description: '' }));
      })(),

      systems: (() => {
        if ((model.systems || []).length > 0) return model.systems;
        // Current systems from Step4 operating model
        const currentSys = (model.operatingModel?.current?.applications?.core_systems || []);
        // New platforms from Step7 target arch
        const newPlatforms = (output.targetArch?.technology_architecture?.key_platforms || []);
        // New capabilities from Step7 app arch
        const newCaps = (output.targetArch?.application_architecture?.new_capabilities_needed || []);
        const decommission = new Set((output.targetArch?.application_architecture?.decommission_list || []).map(s => s.toLowerCase()));
        const all = [...new Set([...currentSys, ...newPlatforms, ...newCaps])].filter(Boolean);
        return all.map(name => ({
          name,
          status:      decommission.has(name.toLowerCase()) ? 'decommission' : 'active',
          category:    newPlatforms.includes(name) ? 'target' : 'core',
          description: ''
        }));
      })(),

      aiAgents: (() => {
        if ((model.aiAgents || []).length > 0) return model.aiAgents;
        // AI agents should be at output.targetArch.ai_agents per 7_2_target_arch.instruction.md
        // ALSO check technology_architecture for backward compatibility with older generations
        const explicit = output.targetArch?.ai_agents 
                      || output.targetArch?.technology_architecture?.ai_agents 
                      || output.targetArch?.technology_architecture?.ai_capabilities 
                      || [];
        if (explicit.length) {
          // Enrich AI agents with Phase 1.1 schema fields if not present
          return explicit.map(a => {
            const baseAgent = typeof a === 'string'
              ? { name: a, purpose: '', capabilities: '', triggerConditions: '' }
              : a;
            
            // Infer agent_type from name/purpose if not specified
            if (!baseAgent.agent_type) {
              const text = (baseAgent.name + ' ' + baseAgent.purpose).toLowerCase();
              if (text.includes('nlp') || text.includes('natural language') || text.includes('text analys')) {
                baseAgent.agent_type = 'NLP';
              } else if (text.includes('vision') || text.includes('image') || text.includes('ocr')) {
                baseAgent.agent_type = 'Computer Vision';
              } else if (text.includes('rpa') || text.includes('robot') || text.includes('automation')) {
                baseAgent.agent_type = 'RPA';
              } else if (text.includes('predict') || text.includes('forecast') || text.includes('ml')) {
                baseAgent.agent_type = 'Predictive';
              } else if (text.includes('chat') || text.includes('conversational') || text.includes('dialogue')) {
                baseAgent.agent_type = 'Conversational';
              } else if (text.includes('document') || text.includes('processing')) {
                baseAgent.agent_type = 'Document Processing';
              } else if (text.includes('decision') || text.includes('recommend')) {
                baseAgent.agent_type = 'Decision Support';
              } else {
                baseAgent.agent_type = 'AI'; // Generic fallback
              }
            }
            
            // Set is_proposed based on whether this is new or existing
            if (baseAgent.is_proposed === undefined) {
              baseAgent.is_proposed = true; // Default to proposed for target architecture
            }
            
            // Set maturity_level if not present (1-5 scale)
            if (!baseAgent.maturity_level) {
              baseAgent.maturity_level = baseAgent.is_proposed ? 1 : 3; // Proposed=1, Existing=3
            }
            
            // Link to capabilities if not already linked
            if (!baseAgent.linked_capabilities) {
              // Try to find capabilities mentioned in purpose or capabilities fields
              const caps = model.capabilities || [];
              const linked = caps
                .filter(cap => {
                  const searchText = (baseAgent.purpose + ' ' + baseAgent.capabilities).toLowerCase();
                  return searchText.includes(cap.name.toLowerCase());
                })
                .map(cap => cap.id)
                .slice(0, 5); // Limit to 5 links
              baseAgent.linked_capabilities = linked;
            }
            
            return baseAgent;
          });
        }
        return model.aiAgents || [];
      })(),

      // ── capabilityMap_tobe: TO-BE capability map for renderCapMap() TO-BE mode ──
      // Built from the AS-IS capabilityMap + target maturity scores from
      // capabilityAssessment.  Each L2 capability gets a changeType tag and
      // the target_maturity field so renderCapMap can colour by target state.
      capabilityMap_tobe: (() => {
        const baseDomains = model.capabilityMap?.l1_domains || [];
        if (!baseDomains.length) return null;
        const ratings = model.capabilityAssessment?.capability_ratings || [];
        const ratingById = Object.fromEntries(ratings.map(r => [r.capability_id, r]));
        // Step7 target arch may describe domain-level changes
        const archCapDomains = output.targetArch?.business_architecture?.capability_domains || [];
        const archByName = Object.fromEntries(
          archCapDomains.map(d => [(d.domain || '').toLowerCase(), d])
        );
        return {
          l1_domains: baseDomains.map(domain => {
            const archDom = archByName[domain.name?.toLowerCase()] || {};
            return {
              ...domain,
              description: archDom.target_state || domain.description || '',
              l2_capabilities: (domain.l2_capabilities || []).map(cap => {
                const r = ratingById[cap.id] || {};
                const cur = r.current_maturity || cap.current_maturity || 1;
                const tgt = r.target_maturity  || cap.target_maturity  || Math.min(5, cur + 1);
                const gap = tgt - cur;
                const changeType = gap >= 2 ? 'TRANSFORM'
                                 : gap === 1 ? 'IMPROVE'
                                 : gap === 0 ? 'SUSTAIN'
                                 : 'CONSOLIDATE';
                return { ...cap, changeType, target_maturity: tgt, current_maturity: cur };
              })
            };
          })
        };
      })()
    };
  },

  onComplete: (model) => {
    // ── GOLDEN RULE: Set enrichment completeness to 100% after Step7 ──
    if (model.businessContext && model.businessContext.enrichment) {
      // Capture roadmap constraints
      const roadmapConstraints = [];
      
      if (model.roadmap?.waves) {
        model.roadmap.waves.forEach(wave => {
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
      model.businessContext.enrichment.completenessScore = 100;
    }

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
