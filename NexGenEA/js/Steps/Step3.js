/**
 * Step3.js — Target Architecture Design
 *
 * GOLDEN RULE: Architecture decisions must align with Business Objectives and capability priorities.
 *
 * New 4-step workflow position: Step 3 of 4
 * - Step 1: Discovery (Business Objectives)
 * - Step 2: Capability Mapping (APQC-aligned)
 * - Step 3: Target Architecture ← THIS FILE
 * - Step 4: Transformation Roadmap
 *
 * Tasks:
 *   3.1 arch_principles  — Internal: Generate architecture principles
 *   3.2 target_arch      — Internal: Design target state architecture (4 layers)
 *   3.3 arch_decisions   — Internal: Document Architecture Decision Records (ADRs)
 *
 * Outputs:
 *   model.archPrinciples      — 6-10 guiding principles
 *   model.targetArchData      — Full 4-layer architecture design
 *   model.targetArch          — Flattened capability uplift (backward compat)
 *   model.archDecisions       — ADR list
 *   model.aiAgents            — AI agent proposals (3-8 agents)
 *   model.valueStreams        — Derived from capability domains
 *   model.systems             — Application portfolio (current + target)
 *   model.capabilityMap_tobe  — TO-BE capability map for visualization
 */

const Step3 = {

  id: 'step3',
  name: 'Target Architecture',
  dependsOn: ['step1', 'step2'],

  tasks: [

    // ── Task 3.1: Architecture Principles ────────────────────────────────
    {
      taskId: 'step3_arch_principles',
      title: 'Defining architecture principles',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '../step7/7_1_arch_principles.instruction.md',
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
        const bc = ctx.businessContext || {};
        const objectives = (bc.objectives || []).slice(0, 5).map(o => o.objective || o.name).join('; ');
        const themes = (bc.strategicThemes || []).join(' | ') || 'Digital transformation and operational excellence';
        const gaps = (ctx.gapInsights || []).slice(0, 5).map(g => g.gap_description).join('; ');
        const caps = (ctx.capabilities || []).filter(c => c.level === 1).map(c => c.name).join(', ');
        const industry = bc.industry || ctx.masterData?.industry || 'enterprise';
        const orgDesc = ctx.companyDescription || ctx.orgDescription || 'organization undergoing digital transformation';
        
        return `Company: ${orgDesc.slice(0, 300)}
Industry: ${industry}
Strategic objectives: ${objectives}
Strategic themes: ${themes}
Priority gaps: ${gaps || 'Technology modernization, process optimization'}
Key capability domains: ${caps || 'see capability map'}

Generate 6-10 architecture principles that support this organization's specific transformation. 
Include at least one AI/Automation principle (mandatory).
Align principles to close identified gaps and support strategic themes.`;
      },

      outputSchema: {
        principles: ['object?'],
        governing_pattern: 'string?',
        architecture_style: 'string?'
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step3_arch_principles');
        if (!parsed.principles || parsed.principles.length === 0) {
          console.warn('[Step3] AI did not generate architecture principles. Using fallback defaults.');
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

    // ── Task 3.2: Target Architecture Design ─────────────────────────────
    {
      taskId: 'step3_target_arch',
      title: 'Designing target architecture',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '../step7/7_2_target_arch.instruction.md',
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
        const bc = ctx.businessContext || {};
        const objectives = (bc.objectives || []).slice(0, 5).map(o => o.objective || o.name).join('; ');
        const gaps = (ctx.gapInsights || []).slice(0, 8).map(g => `${g.gap_id}: ${g.gap_description}`).join('\n');
        const principles = (ctx.answers?.step3_arch_principles?.principles || []).map(p => p.statement).join('\n');
        const capabilities = (ctx.capabilities || []).filter(c => c.level === 1).map(c => c.name).slice(0, 8).join(', ');
        const aiEnabledCaps = (ctx.capabilities || []).filter(c => c.ai_enabled).map(c => c.name).join(', ');
        const whiteSpots = (ctx.whiteSpots || []).slice(0, 5).map(w => w.capability_name).join(', ');
        const recommendations = (ctx.topRecommendations || [])
          .map(r => `- ${r.title}: ${r.description}`)
          .join('\n');
        const industry = bc.industry || 'General Enterprise';

        return `Strategic objectives: ${objectives || 'see business context'}

Architecture principles:
${principles || 'see principles output'}

Top Strategic Recommendations (from Capability Overview):
${recommendations || 'See gap analysis'}

Priority gaps to address:
${gaps || 'Technology modernization, process optimization'}

Capability domains: ${capabilities}
AI-enabled capabilities: ${aiEnabledCaps || 'Identify from capabilities and gaps'}
White-spot capabilities: ${whiteSpots || 'None identified'}

Industry: ${industry}

Design the complete 4-layer target architecture (Business, Data, Application, Technology) that explicitly addresses the Top Strategic Recommendations above.

CRITICAL - AI AGENTS (MANDATORY):
Generate 3-8 AI agents that address priority gaps and automate/augment capabilities. Focus on:
- Document processing and data entry automation (RPA)
- Customer service and inquiries (Conversational AI, NLP)  
- Predictive analytics for operations (Predictive Analytics)
- Data quality and anomaly detection (ML/AI)
- Process optimization (Decision Support)
Each agent MUST link to specific capabilities by name.

Include 3-5 draft ADRs for the hardest decisions. metadata.at_a_glance: 25 words max.`;
      },

      outputSchema: {
        business_architecture: 'object',
        data_architecture: 'object',
        application_architecture: 'object',
        technology_architecture: 'object'
      },

      parseOutput: (raw) => {
        const obj = OutputValidator.parseJSON(raw, 'step3_target_arch');
        if (!obj) return obj;
        // Promote ADRs if nested
        if (!obj.architecture_decisions && obj.business_architecture?.adrs) {
          obj.architecture_decisions = obj.business_architecture.adrs;
        }
        return obj;
      }
    },

    // ── Task 3.3: Architecture Decision Records ───────────────────────────
    {
      taskId: 'step3_arch_decisions',
      title: 'Documenting architecture decisions',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '../step7/7_3_arch_decisions.instruction.md',
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
        const targetArch = ctx.answers?.step3_target_arch || {};
        const draftADRs = targetArch.architecture_decisions || [];
        const bc = ctx.businessContext || {};
        const timeframe = bc.timeframe || '3-5 years';
        
        return `Strategic timeframe: ${timeframe}
Draft ADRs from architecture design: ${JSON.stringify(draftADRs, null, 2)}

Expand these into full ADRs. Add additional ones for any significant architectural choices not yet captured.
Ensure coverage: data platform choice, integration pattern, cloud landing zone, security model, application portfolio disposition.`;
      },

      outputSchema: {
        adrs: ['object']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_arch_decisions')
    }

  ],

  // ── Synthesize: Transform AI output to model structure ───────────────────
  synthesize: (ctx) => {
    const archPrinciples = ctx.answers?.step3_arch_principles?.principles || [];
    const targetArch = ctx.answers?.step3_target_arch || {};
    const archDecisions = ctx.answers?.step3_arch_decisions?.adrs || [];
    const model = ctx.model || window.model || {};

    // Build legacy flat targetArch array for renderTargetArchVisual (backward compat)
    const caps = model.capabilities || [];
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
        enabler:              targetArch.technology_architecture?.infrastructure || ''
      }));
    }

    // Build TO-BE capability map
    const baseDomains = model.capabilityMap?.l1_domains || [];
    let capabilityMap_tobe = null;
    if (baseDomains.length > 0) {
      const ratings = model.capabilityAssessment?.capability_ratings || [];
      const ratingById = Object.fromEntries(ratings.map(r => [r.capability_id, r]));
      const archCapDomains = targetArch.business_architecture?.capability_domains || [];
      const archByName = Object.fromEntries(
        archCapDomains.map(d => [(d.domain || '').toLowerCase(), d])
      );
      capabilityMap_tobe = {
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
    }

    return {
      archPrinciples,
      targetArchData: targetArch,
      targetArch: legacyTargetArch,
      archDecisions,
      capabilityMap_tobe
    };
  },

  // ── Apply Output: Merge into model ────────────────────────────────────────
  applyOutput: (output, model) => {
    // Derive valueStreams from capability domains
    const existingVS = (model.valueStreams || []).length > 0;
    const derivedVS = existingVS
      ? model.valueStreams
      : (model.capabilityMap?.l1_domains || []).map(d => ({ 
          name: d.name, 
          description: d.description || '' 
        }));

    // Derive systems from current + target application architecture
    const existingSys = (model.systems || []).length > 0;
    const newPlatforms = (output.targetArchData?.technology_architecture?.key_platforms || []);
    const newCaps = (output.targetArchData?.application_architecture?.new_capabilities_needed || []);
    const decommission = new Set((output.targetArchData?.application_architecture?.decommission_list || []).map(s => s.toLowerCase()));
    const allSystems = [...new Set([...newPlatforms, ...newCaps])].filter(Boolean);
    const derivedSys = existingSys
      ? model.systems
      : allSystems.map(name => ({
          name,
          status: decommission.has(name.toLowerCase()) ? 'decommission' : 'active',
          category: newPlatforms.includes(name) ? 'target' : 'core',
          description: ''
        }));

    // Derive AI agents
    const existingAgents = (model.aiAgents || []).length > 0;
    const explicit = output.targetArchData?.ai_agents 
                  || output.targetArchData?.technology_architecture?.ai_agents 
                  || [];
    const derivedAgents = existingAgents
      ? model.aiAgents
      : explicit.map(a => {
          const baseAgent = typeof a === 'string' ? { name: a, purpose: '', capabilities: '' } : a;
          
          if (!baseAgent.agent_type) {
            const text = (baseAgent.name + ' ' + baseAgent.purpose).toLowerCase();
            if (text.includes('nlp') || text.includes('natural language')) baseAgent.agent_type = 'NLP';
            else if (text.includes('vision') || text.includes('image')) baseAgent.agent_type = 'Computer Vision';
            else if (text.includes('rpa') || text.includes('robot')) baseAgent.agent_type = 'RPA';
            else if (text.includes('predict') || text.includes('forecast')) baseAgent.agent_type = 'Predictive';
            else if (text.includes('chat') || text.includes('conversational')) baseAgent.agent_type = 'Conversational';
            else baseAgent.agent_type = 'AI';
          }
          
          if (baseAgent.is_proposed === undefined) baseAgent.is_proposed = true;
          if (!baseAgent.maturity_level) baseAgent.maturity_level = baseAgent.is_proposed ? 1 : 3;
          if (!baseAgent.linked_capabilities) {
            const caps = model.capabilities || [];
            const linked = caps
              .filter(cap => (baseAgent.purpose + ' ' + baseAgent.capabilities).toLowerCase().includes(cap.name.toLowerCase()))
              .map(cap => cap.id)
              .slice(0, 5);
            baseAgent.linked_capabilities = linked;
          }
          
          return baseAgent;
        });

    return {
      ...model,
      archPrinciples: output.archPrinciples,
      targetArchData: output.targetArchData,
      targetArch: output.targetArch,
      archDecisions: output.archDecisions,
      capabilityMap_tobe: output.capabilityMap_tobe,
      valueStreams: derivedVS,
      systems: derivedSys,
      aiAgents: derivedAgents,
      targetArchDone: true
    };
  },

  // ── On Complete: UI updates and next step prompt ──────────────────────────
  onComplete: (model) => {
    if (typeof renderTargetArchSection === 'function') renderTargetArchSection();
    if (typeof renderLayersSection === 'function') renderLayersSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step3');
    if (typeof toast === 'function') toast('Target Architecture complete ✓');

    const principles = (model.archPrinciples || []).length;
    const adrs = (model.archDecisions || []).length;
    const aiAgents = (model.aiAgents || []).length;
    const archStyle = model.targetArchData?.metadata?.architecture_style || 'designed';

    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 3 — Target Architecture complete** ✅\n\n` +
        `🏗️ **Summary:**\n` +
        `- Architecture style: **${archStyle}**\n` +
        `- ${principles} guiding principles\n` +
        `- ${adrs} Architecture Decision Records (ADRs)\n` +
        `- ${aiAgents} AI agents proposed\n` +
        `- 4-layer design: Business, Data, Application, Technology\n\n` +
        `**Next:** Ready to build Transformation Roadmap? Click below or use the **Continue** button.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step4', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 4: Transformation Roadmap\n` +
        `</button>`
      );
    }

    if (typeof autoSaveCurrentModel === 'function') {
      autoSaveCurrentModel();
    }
  }
};
