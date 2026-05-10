/**
 * Step3.js — Target Architecture Design (V11.4 OPTIMIZED)
 *
 * GOLDEN RULE: Architecture decisions must align with Business Objectives and capability priorities.
 *
 * OPTIMIZATION HISTORY:
 * - V11.3: Single heavy task (240s timeout) → Frequent timeouts with large context
 * - V11.4: Split into 6 focused sub-tasks with optimized context (~2k tokens each)
 *
 * New 4-step workflow position: Step 3 of 4
 * - Step 1: Discovery (Business Objectives)
 * - Step 2: Capability Mapping (APQC-aligned)
 * - Step 3: Target Architecture ← THIS FILE (6 sub-tasks)
 * - Step 4: Transformation Roadmap
 *
 * Tasks:
 *   3.1 context_analysis     — Lightweight: Analyze Step 1+2 results, identify themes (60s)
 *   3.2 arch_principles      — Analysis: Generate 6-10 guiding principles (120s)
 *   3.3 systems_arch         — Heavy: Design Layer 3 - Application/Systems portfolio (180s)
 *   3.4 ai_agents            — Action: Generate Layer 4 - AI agent proposals (120s)
 *   3.5 arch_decisions       — Analysis: Document Architecture Decision Records (120s)
 *   3.6 arch_synthesis       — Lightweight: Combine all outputs into final model (60s)
 *
 * Total estimated time: ~660s (11 min) vs V11.3: 240s (frequent timeout)
 *
 * Outputs:
 *   model.archPrinciples      — 6-10 guiding principles
 *   model.targetArchData      — Full 4-layer architecture design
 *   model.targetArch          — Flattened capability uplift (backward compat)
 *   model.archDecisions       — ADR list (5-10 decisions)
 *   model.aiAgents            — AI agent proposals (3-8 agents)
 *   model.systems             — Application portfolio (current + target)
 *   model.valueStreams        — Derived from capability domains
 *   model.capabilityMap_tobe  — TO-BE capability map for visualization
 */

const Step3 = {

  id: 'step3',
  name: 'Target Architecture',
  dependsOn: ['step1', 'step2'],

  tasks: [

    // ══════════════════════════════════════════════════════════════════════════
    // Task 3.1: Context Analysis (NEW in V11.4)
    // ══════════════════════════════════════════════════════════════════════════
    {
      taskId: 'step3_context_analysis',
      title: 'Analyzing business context and priorities',
      type: 'internal',
      taskType: 'lightweight',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architect analyzing business context to identify key themes for target architecture design.

Return ONLY valid JSON:
{
  "key_themes": ["theme1", "theme2", "theme3"],
  "priority_areas": ["area1", "area2"],
  "architecture_focus": "brief description of where to focus architectural effort",
  "top_gaps_summary": "2-sentence summary of most critical gaps",
  "automation_opportunities": ["opportunity1", "opportunity2"]
}`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        // Top 5 objectives only
        const objectives = (bc.objectives || []).slice(0, 5).map(o => 
          `${o.id}: "${o.objective || o.name}"`
        ).join('\n');
        
        // Top 10 gaps only
        const gaps = (ctx.gapInsights || []).slice(0, 10).map(g =>
          `${g.gap_id} [${g.priority}]: ${g.gap_description}`
        ).join('\n');
        
        // Strategic themes
        const themes = (bc.strategicThemes || []).join(', ') || 'Digital transformation';
        
        // Industry and constraints
        const industry = bc.industry || 'General Enterprise';
        const constraints = (bc.constraints || []).slice(0, 3).join('; ') || 'None';
        
        return `Industry: ${industry}
Strategic Themes: ${themes}
Constraints: ${constraints}

TOP 5 BUSINESS OBJECTIVES:
${objectives}

TOP 10 CAPABILITY GAPS:
${gaps}

Analyze this context and identify:
1. 3-5 key architectural themes that will drive the target state design
2. 2-3 priority areas requiring most architectural attention
3. Where to focus architectural effort (1 sentence)
4. Summary of most critical gaps (2 sentences max)
5. 2-4 automation opportunities from gaps/objectives`;
      },

      outputSchema: {
        key_themes: ['string'],
        priority_areas: ['string'],
        architecture_focus: 'string',
        top_gaps_summary: 'string',
        automation_opportunities: ['string?']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_context_analysis')
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Task 3.2: Architecture Principles (EXISTING - OPTIMIZED CONTEXT)
    // ══════════════════════════════════════════════════════════════════════════
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
- rationale: 1-2 sentences grounded in Business Objectives
- implications: 2-3 concrete design decisions this principle demands
- anti_patterns: 1-2 patterns this principle explicitly prohibits`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        const contextAnalysis = ctx.answers?.step3_context_analysis || {};
        
        // OPTIMIZED: Use analysis output instead of raw data
        const keyThemes = (contextAnalysis.key_themes || []).join(', ');
        const priorityAreas = (contextAnalysis.priority_areas || []).join(', ');
        const architectureFocus = contextAnalysis.architecture_focus || '';
        
        // Top 5 objectives only (reduced from all)
        const objectives = (bc.objectives || []).slice(0, 5).map(o => o.objective || o.name).join('; ');
        
        // Top 5 gaps only (reduced from all)
        const gaps = (ctx.gapInsights || []).slice(0, 5).map(g => g.gap_description).join('; ');
        
        // L1 capabilities only (reduced from L1+L2)
        const caps = (ctx.capabilities || []).filter(c => c.level === 1).map(c => c.name).join(', ');
        
        const industry = bc.industry || ctx.masterData?.industry || 'enterprise';
        const orgDesc = (ctx.companyDescription || ctx.orgDescription || '').slice(0, 200); // Reduced from 300
        
        return `Company: ${orgDesc}
Industry: ${industry}

KEY ARCHITECTURAL THEMES (from analysis):
${keyThemes}

PRIORITY AREAS:
${priorityAreas}

ARCHITECTURE FOCUS:
${architectureFocus}

Strategic objectives: ${objectives}
Priority gaps: ${gaps}
Key capability domains: ${caps}

Generate 6-10 architecture principles that support this organization's specific transformation. 
Include at least one AI/Automation principle (mandatory).
Align principles to close identified gaps and support key themes.`;
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
              rationale: 'Business objectives emphasize data quality and analytics capabilities.',
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

    // ══════════════════════════════════════════════════════════════════════════
    // Task 3.3: Systems Architecture - Layer 3 (NEW SPLIT from target_arch)
    // ══════════════════════════════════════════════════════════════════════════
    {
      taskId: 'step3_systems_arch',
      title: 'Designing application and systems architecture (Layer 3)',
      type: 'internal',
      taskType: 'heavy',
      expectsJson: true,

      systemPromptFallback: `You are a Senior Enterprise Architect designing the application and systems portfolio (Layer 3).

Focus on:
- Current application landscape assessment
- Target application portfolio (new systems, consolidations, decommissions)
- Integration patterns and API strategy
- System-to-capability mapping

Return ONLY valid JSON:
{
  "current_landscape_summary": "2-3 sentence assessment of current state",
  "target_systems": [
    {
      "name": "System Name",
      "category": "core|support|commodity",
      "purpose": "Brief purpose",
      "linked_capabilities": ["CAP-01", "CAP-02"],
      "integration_needs": ["API", "Event Bus"],
      "status": "new|enhance|migrate|decommission"
    }
  ],
  "decommission_list": ["Legacy System 1", "Legacy System 2"],
  "consolidation_opportunities": ["Opportunity 1"],
  "integration_architecture": {
    "pattern": "API-first|Event-driven|Hybrid",
    "api_strategy": "Brief description",
    "data_integration": "Brief description"
  },
  "key_platforms": ["Platform 1", "Platform 2"]
}`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        const contextAnalysis = ctx.answers?.step3_context_analysis || {};
        const principles = (ctx.answers?.step3_arch_principles?.principles || []);
        
        // OPTIMIZED: Only gaps requiring system changes
        const systemGaps = (ctx.gapInsights || [])
          .filter(g => 
            g.gap_description.toLowerCase().includes('system') ||
            g.gap_description.toLowerCase().includes('application') ||
            g.gap_description.toLowerCase().includes('platform') ||
            g.gap_description.toLowerCase().includes('integration') ||
            g.priority === 'HIGH' || g.priority === 'CRITICAL'
          )
          .slice(0, 10)
          .map(g => `${g.gap_id} [${g.priority}]: ${g.gap_description}`)
          .join('\n');
        
        // OPTIMIZED: Only L1 capabilities with gaps
        const capsWithGaps = (ctx.capabilities || [])
          .filter(c => c.level === 1 && (c.target_maturity - c.current_maturity) > 0)
          .map(c => `${c.id}: ${c.name} [Gap: ${c.target_maturity - c.current_maturity}] [${c.strategic_importance || 'SUPPORT'}]`)
          .join('\n');
        
        // Architecture principles (integration/API related only)
        const relevantPrinciples = principles
          .filter(p => 
            p.statement.toLowerCase().includes('api') ||
            p.statement.toLowerCase().includes('integrat') ||
            p.statement.toLowerCase().includes('cloud') ||
            p.statement.toLowerCase().includes('system')
          )
          .map(p => `${p.id}: ${p.statement}`)
          .join('\n');
        
        const keyThemes = (contextAnalysis.key_themes || []).join(', ');
        const constraints = (bc.constraints || []).join('; ') || 'None';
        
        return `KEY THEMES: ${keyThemes}
CONSTRAINTS: ${constraints}

GAPS REQUIRING SYSTEM CHANGES:
${systemGaps || 'No specific system gaps identified'}

CAPABILITIES REQUIRING SYSTEM SUPPORT:
${capsWithGaps || 'See all capabilities'}

RELEVANT ARCHITECTURE PRINCIPLES:
${relevantPrinciples || 'No specific system principles'}

Design the target application and systems architecture (Layer 3):
1. Assess current landscape (if known from context)
2. Define target systems portfolio with clear capability links
3. Identify decommission candidates
4. Design integration architecture (APIs, events, data)
5. List key platforms needed (cloud, data, integration, etc.)

CRITICAL: Link each system to specific capability IDs. Use only IDs provided above.`;
      },

      outputSchema: {
        current_landscape_summary: 'string?',
        target_systems: ['object'],
        decommission_list: ['string?'],
        integration_architecture: 'object?',
        key_platforms: ['string?']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_systems_arch')
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Task 3.4: AI Agents - Layer 4 (NEW SPLIT from target_arch)
    // ══════════════════════════════════════════════════════════════════════════
    {
      taskId: 'step3_ai_agents',
      title: 'Generating AI agent proposals (Layer 4)',
      type: 'internal',
      taskType: 'action',
      expectsJson: true,

      systemPromptFallback: `You are an AI/Automation Architect proposing intelligent agents to automate and augment enterprise capabilities.

Generate 3-8 AI agents that address priority gaps and automate high-volume/repetitive work.

Return ONLY valid JSON:
{
  "ai_agents": [
    {
      "name": "Agent Name",
      "agent_type": "NLP|RPA|Predictive Analytics|Computer Vision|Conversational AI|Recommendation Engine",
      "purpose": "What this agent does (1 sentence)",
      "linked_capabilities": ["CAP-01", "CAP-02"],
      "linked_gaps": ["GAP-01"],
      "automation_level": "Assisted|Augmented|Autonomous",
      "maturity_level": "Pilot|Production|Optimized",
      "business_value": "Expected impact (1 sentence)",
      "is_proposed": true
    }
  ],
  "automation_summary": "Overall automation strategy (2-3 sentences)"
}`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        const contextAnalysis = ctx.answers?.step3_context_analysis || {};
        
        // OPTIMIZED: Only automation/efficiency objectives
        const automationObjectives = (bc.objectives || [])
          .filter(o => {
            const text = (o.objective || o.name || '').toLowerCase();
            return text.includes('automat') || text.includes('efficien') || 
                   text.includes('productiv') || text.includes('cost') ||
                   text.includes('speed') || text.includes('digital');
          })
          .slice(0, 5)
          .map(o => `${o.id}: ${o.objective || o.name}`)
          .join('\n');
        
        // OPTIMIZED: Only high-volume/repetitive capabilities (L2)
        const automationCaps = (ctx.capabilities || [])
          .filter(c => {
            const text = (c.name + ' ' + (c.description || '')).toLowerCase();
            return c.level === 2 && (
              text.includes('process') || text.includes('manual') ||
              text.includes('review') || text.includes('analyz') ||
              text.includes('report') || text.includes('monitor') ||
              text.includes('track') || text.includes('manage')
            );
          })
          .slice(0, 15)
          .map(c => `${c.id}: ${c.name}`)
          .join('\n');
        
        // OPTIMIZED: Only automation-related gaps
        const automationGaps = (ctx.gapInsights || [])
          .filter(g => {
            const text = g.gap_description.toLowerCase();
            return text.includes('manual') || text.includes('automat') ||
                   text.includes('efficien') || text.includes('slow') ||
                   text.includes('time-consum') || text.includes('repetitive');
          })
          .slice(0, 8)
          .map(g => `${g.gap_id}: ${g.gap_description}`)
          .join('\n');
        
        // AI/Automation principle
        const aiPrinciple = (ctx.answers?.step3_arch_principles?.principles || [])
          .find(p => p.statement.toLowerCase().includes('ai') || p.statement.toLowerCase().includes('automat'));
        
        const automationOpportunities = (contextAnalysis.automation_opportunities || []).join('\n');
        
        return `AUTOMATION OPPORTUNITIES (from analysis):
${automationOpportunities}

AI/AUTOMATION PRINCIPLE:
${aiPrinciple ? `${aiPrinciple.id}: ${aiPrinciple.statement}` : 'Deploy AI to augment human capabilities'}

AUTOMATION-FOCUSED OBJECTIVES:
${automationObjectives || 'Improve operational efficiency'}

HIGH-VOLUME/REPETITIVE CAPABILITIES:
${automationCaps || 'See capability map for potential automation targets'}

AUTOMATION-RELATED GAPS:
${automationGaps || 'Manual processes, lack of automation'}

Generate 3-8 AI agents that:
1. Address identified gaps and opportunities
2. Link to specific capabilities (use IDs provided)
3. Focus on high-ROI automation opportunities
4. Cover different agent types (NLP, RPA, Predictive, etc.)
5. Include maturity level and business value

Each agent MUST link to at least 1 capability ID. Use only IDs provided above.`;
      },

      outputSchema: {
        ai_agents: ['object'],
        automation_summary: 'string?'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_ai_agents')
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Task 3.5: Architecture Decisions - ADRs (EXISTING - ENHANCED CONTEXT)
    // ══════════════════════════════════════════════════════════════════════════
    {
      taskId: 'step3_arch_decisions',
      title: 'Documenting architecture decisions',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '../step7/7_3_arch_decisions.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Chief Architect documenting key Architecture Decision Records (ADRs).

Document 5-10 consequential architectural decisions covering:
- Data platform choice
- Integration pattern
- Cloud strategy
- Security model
- Application portfolio disposition
- AI/Automation approach

Return ONLY valid JSON:
{
  "adrs": [
    {
      "adr_id": "ADR01",
      "title": "Brief title",
      "context": "Why this decision is needed (2-3 sentences)",
      "decision": "What we decided (1-2 sentences)",
      "rationale": "Why this is the right choice (2-3 sentences)",
      "alternatives_considered": ["Alt 1", "Alt 2"],
      "consequences": {
        "positive": ["Pro 1", "Pro 2"],
        "negative": ["Con 1"],
        "risks": ["Risk 1"]
      },
      "linked_principles": ["P01", "P02"],
      "review_date": "YYYY-MM",
      "status": "Proposed",
      "owner": "Role"
    }
  ]
}`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        const principles = (ctx.answers?.step3_arch_principles?.principles || []);
        const systemsArch = ctx.answers?.step3_systems_arch || {};
        const aiAgents = ctx.answers?.step3_ai_agents || {};
        
        // OPTIMIZED: Only key decisions from previous tasks
        const integrationPattern = systemsArch.integration_architecture?.pattern || 'Not defined';
        const apiStrategy = systemsArch.integration_architecture?.api_strategy || 'Not defined';
        const keyPlatforms = (systemsArch.key_platforms || []).slice(0, 5).join(', ');
        const automationStrategy = aiAgents.automation_summary || 'Not defined';
        const agentCount = (aiAgents.ai_agents || []).length;
        
        // Top 3 principles only
        const topPrinciples = principles.slice(0, 3).map(p => `${p.id}: ${p.statement}`).join('\n');
        
        // Top 5 constraints only
        const constraints = (bc.constraints || []).slice(0, 5).join('; ') || 'None';
        const timeframe = bc.timeframe || '3-5 years';
        
        // Top 3 gaps only
        const topGaps = (ctx.gapInsights || []).slice(0, 3).map(g => g.gap_description).join('; ');
        
        return `Timeframe: ${timeframe}
Constraints: ${constraints}

TOP PRINCIPLES:
${topPrinciples}

KEY ARCHITECTURAL DECISIONS MADE:
- Integration Pattern: ${integrationPattern}
- API Strategy: ${apiStrategy}
- Key Platforms: ${keyPlatforms}
- Automation Strategy: ${automationStrategy}
- AI Agents Proposed: ${agentCount}

TOP GAPS ADDRESSED:
${topGaps}

Document 5-10 Architecture Decision Records (ADRs) that capture the most consequential choices.
Ensure coverage of: data, integration, cloud, security, applications, AI/automation.
Link each ADR to relevant principles using principle IDs provided above.`;
      },

      outputSchema: {
        adrs: ['object']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_arch_decisions')
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Task 3.6: Architecture Synthesis (NEW in V11.4)
    // ══════════════════════════════════════════════════════════════════════════
    {
      taskId: 'step3_arch_synthesis',
      title: 'Synthesizing complete target architecture',
      type: 'internal',
      taskType: 'lightweight',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architect synthesizing all architecture outputs into a cohesive target state design.

Return ONLY valid JSON:
{
  "architecture_summary": {
    "at_a_glance": "25-word executive summary",
    "architecture_style": "Architecture approach (e.g., Cloud-Native, Event-Driven, Modular)",
    "transformation_scope": "Scope of change (e.g., Foundational, Incremental, Revolutionary)"
  },
  "business_architecture": {
    "operating_model_archetype": "Archetype (e.g., Coordination, Unification, Diversification)",
    "value_delivery_model": "How value is delivered (1 sentence)",
    "key_capabilities_transformation": "Which capabilities are transforming (1 sentence)"
  },
  "data_architecture": {
    "data_strategy": "Data strategy (1 sentence)",
    "analytics_target": "Analytics maturity target"
  },
  "application_architecture": {
    "portfolio_summary": "Application portfolio summary (1 sentence)",
    "modernization_approach": "Modernization approach (1 sentence)"
  },
  "technology_architecture": {
    "cloud_strategy": "Cloud strategy (1 sentence)",
    "security_approach": "Security approach (1 sentence)",
    "infrastructure_pattern": "Infrastructure pattern"
  },
  "white_spot_summary": {
    "themes": [{
      "id": "WST01",
      "theme": "Strategic opportunity name",
      "description": "Why this matters (1 sentence)",
      "business_value_potential": "HIGH|MEDIUM|LOW",
      "strategic_importance": "CRITICAL|HIGH|MEDIUM",
      "traceability": {"business_objectives": [], "capabilities": [], "gaps": []}
    }]
  },
  "future_state_ea": {
    "data_ai_automation": {"headline": "", "summary": "", "key_capabilities": [], "traceability": {}},
    "cloud_infrastructure": {"headline": "", "summary": "", "key_capabilities": [], "traceability": {}},
    "digital_security_resilience": {"headline": "", "summary": "", "key_capabilities": [], "traceability": {}},
    "application_erp": {"headline": "", "summary": "", "key_capabilities": [], "traceability": {}}
  }
}`,

      userPrompt: (ctx) => {
        const contextAnalysis = ctx.answers?.step3_context_analysis || {};
        const principles = ctx.answers?.step3_arch_principles || {};
        const systemsArch = ctx.answers?.step3_systems_arch || {};
        const aiAgents = ctx.answers?.step3_ai_agents || {};
        const archDecisions = ctx.answers?.step3_arch_decisions || {};
        const whiteSpots = ctx.model?.whiteSpots || [];
        const objectives = ctx.businessContext?.objectives || [];
        const gapInsights = ctx.model?.gapInsights || [];
        const capabilities = ctx.model?.capabilities || [];
        
        // Format white spots for context
        const whiteSpotsList = whiteSpots.slice(0, 10).map(w => 
          `"${w.capability_name}" → Linked to: ${(w.linked_objectives || []).join(', ')} | Rationale: ${w.rationale || 'Strategic gap'}`
        ).join('\n');
        
        // Format objectives with IDs
        const objectivesList = objectives.slice(0, 5).map(o => 
          `${o.id}: ${o.objective} [${o.timeframe}]`
        ).join('\n');
        
        // Top 10 gaps with IDs
        const gapsList = gapInsights.slice(0, 10).map(g => 
          `${g.gap_id}: [${g.priority}] ${g.gap_description} → Linked to: ${(g.linked_objectives || []).join(', ')}`
        ).join('\n');
        
        // Top 15 capabilities with IDs
        const capsList = capabilities.filter(c => c.level <= 2).slice(0, 15).map(c => 
          `${c.id}: ${c.name} [Maturity: ${c.current_maturity || 1}→${c.target_maturity || 3}]`
        ).join('\n');
        
        return `Synthesize all architecture outputs into a cohesive target state:

CONTEXT ANALYSIS:
- Key Themes: ${(contextAnalysis.key_themes || []).join(', ')}
- Architecture Focus: ${contextAnalysis.architecture_focus || 'N/A'}

ARCHITECTURE PRINCIPLES:
- Count: ${(principles.principles || []).length}
- Style: ${principles.architecture_style || 'Not defined'}
- Governing Pattern: ${principles.governing_pattern || 'Not defined'}

SYSTEMS ARCHITECTURE (LAYER 3):
- Target Systems: ${(systemsArch.target_systems || []).length}
- Integration Pattern: ${systemsArch.integration_architecture?.pattern || 'Not defined'}
- Key Platforms: ${(systemsArch.key_platforms || []).join(', ')}

AI AGENTS (LAYER 4):
- Agent Count: ${(aiAgents.ai_agents || []).length}
- Automation Summary: ${aiAgents.automation_summary || 'Not defined'}

ARCHITECTURE DECISIONS:
- ADR Count: ${(archDecisions.adrs || []).length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHITE SPOT ANALYSIS (REQUIRED - USE THESE IDs IN OUTPUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate 4-7 white spot themes from these opportunities:
${whiteSpotsList || 'No white spots identified'}

Each theme MUST include traceability linking to objectives and capabilities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FUTURE-STATE EA (REQUIRED - USE THESE IDs IN OUTPUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate target state for 4 domains: data_ai_automation, cloud_infrastructure, digital_security_resilience, application_erp

BUSINESS OBJECTIVES (USE THESE IDs):
${objectivesList}

CAPABILITY GAPS (USE THESE IDs):
${gapsList}

CAPABILITIES (USE THESE IDs):
${capsList}

⚠️ CRITICAL: Use only the IDs provided above in traceability fields. Do not invent new IDs.

Generate a cohesive architecture summary that ties all these elements together.
Keep summaries brief (1 sentence each) and executive-friendly.`;
      },

      outputSchema: {
        architecture_summary: 'object',
        business_architecture: 'object?',
        data_architecture: 'object?',
        application_architecture: 'object?',
        technology_architecture: 'object?',
        white_spot_summary: 'object',
        future_state_ea: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_arch_synthesis')
    }

  ],

  // ══════════════════════════════════════════════════════════════════════════
  // Synthesize: Transform AI output to model structure
  // ══════════════════════════════════════════════════════════════════════════
  synthesize: (ctx) => {
    const contextAnalysis = ctx.answers?.step3_context_analysis || {};
    const archPrinciples = ctx.answers?.step3_arch_principles?.principles || [];
    const systemsArch = ctx.answers?.step3_systems_arch || {};
    const aiAgents = ctx.answers?.step3_ai_agents?.ai_agents || [];
    const archDecisions = ctx.answers?.step3_arch_decisions?.adrs || [];
    const archSynthesis = ctx.answers?.step3_arch_synthesis || {};
    const model = ctx.model || window.model || {};

    // Build consolidated targetArchData
    const targetArchData = {
      context_analysis: contextAnalysis,
      business_architecture: archSynthesis.business_architecture || {},
      data_architecture: archSynthesis.data_architecture || {},
      application_architecture: {
        ...systemsArch,
        ...(archSynthesis.application_architecture || {})
      },
      technology_architecture: archSynthesis.technology_architecture || {},
      ai_agents: aiAgents,
      architecture_decisions: archDecisions,
      metadata: archSynthesis.architecture_summary || {
        at_a_glance: 'Target architecture designed',
        architecture_style: 'Modern',
        transformation_scope: 'Incremental'
      }
    };

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
        enabler:              systemsArch.integration_architecture?.pattern || ''
      }));
    }

    // Build TO-BE capability map
    const baseDomains = model.capabilityMap?.l1_domains || [];
    let capabilityMap_tobe = null;
    if (baseDomains.length > 0) {
      const ratings = model.capabilityAssessment?.capability_ratings || [];
      const ratingById = Object.fromEntries(ratings.map(r => [r.capability_id, r]));
      
      capabilityMap_tobe = {
        l1_domains: baseDomains.map(domain => {
          return {
            ...domain,
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

    // Extract white spot summary and future state EA from synthesis
    const whiteSpotSummary = archSynthesis.white_spot_summary || null;
    const futureStateEA = archSynthesis.future_state_ea || null;

    return {
      archPrinciples,
      targetArchData,
      targetArch: legacyTargetArch,
      archDecisions,
      capabilityMap_tobe,
      whiteSpotSummary,
      futureStateEA
    };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Apply Output: Merge into model
  // ══════════════════════════════════════════════════════════════════════════
  applyOutput: (output, model) => {
    // Derive valueStreams from capability domains
    const existingVS = (model.valueStreams || []).length > 0;
    const derivedVS = existingVS
      ? model.valueStreams
      : (model.capabilityMap?.l1_domains || []).map(d => ({ 
          name: d.name, 
          description: d.description || '' 
        }));

    // Derive systems from target_systems in systemsArch
    const existingSys = (model.systems || []).length > 0;
    const targetSystems = output.targetArchData?.application_architecture?.target_systems || [];
    const derivedSys = existingSys
      ? model.systems
      : targetSystems.map(sys => ({
          name: sys.name,
          status: sys.status || 'active',
          category: sys.category || 'core',
          description: sys.purpose || ''
        }));

    // Derive AI agents with proper structure
    const existingAgents = (model.aiAgents || []).length > 0;
    const aiAgentsRaw = output.targetArchData?.ai_agents || [];
    const derivedAgents = existingAgents
      ? model.aiAgents
      : aiAgentsRaw.map(a => {
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
          if (!baseAgent.maturity_level) baseAgent.maturity_level = baseAgent.is_proposed ? 'Pilot' : 'Production';
          
          return baseAgent;
        });

    return {
      ...model,
      archPrinciples: output.archPrinciples,
      targetArchData: output.targetArchData,
      targetArch: output.targetArch,
      archDecisions: output.archDecisions,
      capabilityMap_tobe: output.capabilityMap_tobe,
      whiteSpotSummary: output.whiteSpotSummary,
      futureStateEA: output.futureStateEA,
      valueStreams: derivedVS,
      systems: derivedSys,
      aiAgents: derivedAgents,
      targetArchDone: true
    };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // On Complete: UI updates and next step prompt
  // ══════════════════════════════════════════════════════════════════════════
  onComplete: (model) => {
    // SAFETY CHECK: Ensure targetArchDone flag is set (should already be set by applyOutput)
    if (model.targetArch && !model.targetArchDone) {
      model.targetArchDone = true;
      window.model.targetArchDone = true;
      console.log('[Step3] ✅ Set targetArchDone flag for navigation unlock');
    }
    
    if (typeof renderTargetArchSection === 'function') renderTargetArchSection();
    if (typeof renderLayersSection === 'function') renderLayersSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3]);
    
    // V11.4: Update navigation and tab lock states
    if (typeof updateNavigationLockStates === 'function') {
      updateNavigationLockStates();
    } else if (typeof EANavigation !== 'undefined' && typeof EANavigation.updateLockStates === 'function') {
      EANavigation.updateLockStates();
    }
    if (typeof updateTabLockStates === 'function') updateTabLockStates();
    
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step3');
    if (typeof toast === 'function') toast('✅ Target Architecture complete');

    const principles = (model.archPrinciples || []).length;
    const adrs = (model.archDecisions || []).length;
    const aiAgents = (model.aiAgents || []).length;
    const systems = (model.systems || []).length;
    const archStyle = model.targetArchData?.metadata?.architecture_style || 'designed';

    console.group('[Step3 V11.4] ✅ Target Architecture Complete');
    console.log('Architecture Style:', archStyle);
    console.log('Principles:', principles);
    console.log('ADRs:', adrs);
    console.log('AI Agents:', aiAgents);
    console.log('Systems:', systems);
    console.log('Total tasks executed: 6 (optimized from 3)');
    console.groupEnd();

    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 3 — Target Architecture complete** ✅\n\n` +
        `🏗️ **Summary:**\n` +
        `- Architecture style: **${archStyle}**\n` +
        `- ${principles} guiding principles\n` +
        `- ${adrs} Architecture Decision Records (ADRs)\n` +
        `- ${aiAgents} AI agents proposed\n` +
        `- ${systems} systems in target portfolio\n` +
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
