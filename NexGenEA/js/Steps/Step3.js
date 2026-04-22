/**
 * Step3.js — Capability Architecture
 *
 * Tasks:
 *   3.1 capability_map      — Internal: build L1/L2/L3 capability map
 *   3.2 capability_assess   — Internal: assess maturity & strategic importance
 *   3.3 arch_benchmark      — Internal: benchmark vs. industry peers
 *
 * Outputs:
 *   model.capabilities[]   — capability map with maturity ratings (backward compat)
 *   model.archBenchmark    — benchmarking object
 */

const Step3 = {

  id: 'step3',
  name: 'Capability Architecture',
  dependsOn: ['step1', 'step2'],

  tasks: [

    // ── Task 3.1: Build capability map ────────────────────────────────────
    {
      taskId: 'step3_capability_map',
      title: 'Building capability map',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '3_1_capability_map.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture practitioner. Build a three-level Business Capability Map for this organisation.

Capabilities describe WHAT the business does — not HOW (not systems, org units, or processes).
Use business verbs: "Manage", "Develop", "Deliver", "Acquire", "Analyse".

Return ONLY valid JSON:
{
  "l1_domains": [
    {
      "id": "D01",
      "name": "",
      "description": "",
      "strategic_importance": "CORE|SUPPORT|COMMODITY",
      "l2_capabilities": [
        {
          "id": "C01.01",
          "name": "",
          "description": "",
          "l3_capabilities": [{"id":"","name":""}]
        }
      ]
    }
  ],
  "metadata": {"total_caps":0,"domains_count":0,"methodology":"BIZBOK-aligned"}
}

Requirements:
- 5-8 L1 domains
- 3-5 L2 capabilities per domain
- 2-4 L3 capabilities per L2 only for CORE strategic domain
- DO NOT mirror org chart — capability ≠ org unit`,

      userPrompt: (ctx) => {
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const si = ctx.strategicIntent;
        const bmc = ctx.bmc;
        
        if (profile) {
          // Rich Profile: Use structure and offerings
          const offerings = (profile.offerings || []).map(o => o.name).join(', ');
          const priorities = (profile.strategicPriorities || []).map(p => p.priority).slice(0, 5).join('; ');
          const structure = profile.structure?.organizationalStructure || 'Not specified';
          
          return `**ORGANIZATION PROFILE - CAPABILITY CONTEXT:**

Organization: ${profile.organizationName} (${profile.industry})
Structure: ${structure}
Offerings: ${offerings || 'Not specified'}

**Strategic Priorities:** ${priorities || 'Not specified'}

**Strategic themes:** ${(si.strategic_themes || []).join(' | ')}
**Investigation scope:** ${(si.investigation_scope || []).join('; ')}

**BMC key activities:** ${(bmc.key_activities || []).join('; ')}
**BMC key resources:** ${(bmc.key_resources || []).join('; ')}

**CRITICAL:** Build capability map grounded in the SPECIFIC offerings and priorities from the profile. DO NOT use generic capability frameworks.

Build a full L1/L2/L3 capability map. Identify which L1 domains are CORE to the future model.
Inspection scope above should appear as capabilities — not just be referenced.`;
        }
        
        // Quick Start fallback
        return `Company: "${ctx.companyDescription}"

Strategic themes: ${(si.strategic_themes || []).join(' | ')}
Investigation scope: ${(si.investigation_scope || []).join('; ')}

BMC key activities: ${(bmc.key_activities || []).join('; ')}
BMC key resources: ${(bmc.key_resources || []).join('; ')}

Build a full L1/L2/L3 capability map. Identify which L1 domains are CORE to the future model.
Inspection scope above should appear as capabilities — not just be referenced.`;
      },

      outputSchema: {
        l1_domains: ['object']
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step3_capability_map');
        if (!parsed) return parsed;
        // Defensive normalization: AI may use alternate field names for the domains array
        if (!parsed.l1_domains || parsed.l1_domains.length === 0) {
          const alt = parsed.domains || parsed.capability_domains || parsed.capabilityDomains
            || parsed.businessDomains || parsed.business_domains;
          if (Array.isArray(alt) && alt.length > 0) {
            parsed.l1_domains = alt;
          }
        }
        return parsed;
      }
    },

    // ── Task 3.2: Maturity Assessment ─────────────────────────────────────
    {
      taskId: 'step3_capability_assess',
      title: 'Assessing capability maturity',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '3_2_capability_assess.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Capability Maturity Analyst. For each L1 domain and its key L2 capabilities, rate current maturity and target maturity using a 1-5 Gartner-aligned scale:
1=Initial, 2=Developing, 3=Defined, 4=Managed, 5=Optimising

Return ONLY valid JSON:
{
  "capability_ratings": [
    {
      "capability_id": "",
      "capability_name": "",
      "current_maturity": 1,
      "target_maturity": 3,
      "gap": 2,
      "strategic_importance": "CORE|SUPPORT|COMMODITY",
      "investment_priority": "HIGH|MEDIUM|LOW",
      "key_gaps": [""],
      "quick_wins": [""]
    }
  ],
  "overall_maturity": 1.0,
  "maturity_distribution": {"initial":0,"developing":0,"defined":0,"managed":0,"optimising":0}
}`,

      userPrompt: (ctx) => {
        const domains = (ctx.answers?.step3_capability_map?.l1_domains || []);
        const si = ctx.strategicIntent;
        const bmc = ctx.bmc;
        
        // ── Phase 2.2: Include AI transformation context ──
        const aiThemes = (si.ai_transformation_themes || []);
        const aiActivities = (bmc.ai_transformation?.ai_enabled_activities || []);
        const aiResources = (bmc.ai_transformation?.ai_enabled_resources || []);
        
        const aiContext = (aiThemes.length > 0 || aiActivities.length > 0)
          ? `\n\nAI Transformation Context:\n` +
            (aiThemes.length > 0 ? `- Strategic themes: ${aiThemes.join('; ')}\n` : '') +
            (aiActivities.length > 0 ? `- BMC AI activities: ${aiActivities.join(', ')}\n` : '') +
            (aiResources.length > 0 ? `- BMC AI resources: ${aiResources.join(', ')}\n` : '') +
            `Mark capabilities as ai_enabled: true if they align with these AI transformation plans.`
          : '';
        
        const capList = domains.map(d =>
          `${d.id} ${d.name} (${d.strategic_importance}): ${(d.l2_capabilities || []).map(c => c.name).join(', ')}`
        ).join('\n');
        
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Scale/current systems: ${si.key_constraints?.find(c => /technical/i.test(c)) || 'not stated'}
Pain points: ${si.burning_platform || ''}${aiContext}

Capabilities to rate:
${capList}

Base current maturity on what the company description tells us. Target maturity based on the Strategic Intent ambition.
Use null for current maturity if no evidence — do not guess.`;
      },

      outputSchema: {
        capability_ratings: ['object'],
        overall_maturity: 'number'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_capability_assess')
    },

    // ── Task 3.3: Industry Benchmark ──────────────────────────────────────
    {
      taskId: 'step3_arch_benchmark',
      title: 'Benchmarking vs. industry',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '3_3_arch_benchmark.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an EA Benchmarking expert. Compare this organisation's capabilities and architectural posture against industry peers (using general sector knowledge — no made-up statistics).

Return ONLY valid JSON:
{
  "peer_group": "",
  "benchmark_dimensions": [
    {
      "dimension": "",
      "industry_average": "Developing|Defined|Managed",
      "our_position": "Below par|At par|Above par",
      "gap_commentary": "",
      "priority": "HIGH|MEDIUM|LOW"
    }
  ],
  "distinctive_strengths": [""],
  "capability_gaps_vs_peers": [""],
  "architectural_debt_estimate": "LOW|MEDIUM|HIGH|CRITICAL",
  "time_to_par": "",
  "executive_benchmark_summary": ""
}`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent;
        const assess = ctx.answers?.step3_capability_assess || {};
        return `Industry: ${si.industry || ctx.masterData.industry || 'Enterprise/General'}
Company: "${ctx.companyDescription.slice(0, 300)}"
Overall capability maturity: ${assess.overall_maturity || 'not assessed'}
Distribution: ${JSON.stringify(assess.maturity_distribution || {})}
Strategic ambition: "${si.strategic_ambition || ''}"

Benchmark the org against peer group. Focus on 4-6 most critical dimensions.
executive_benchmark_summary: 2-3 sentences for the Board.`;
      },

      outputSchema: {
        benchmark_dimensions: ['object'],
        executive_benchmark_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step3_arch_benchmark')
    }

  ],

  synthesize: (ctx) => {
    // Flatten capabilities to legacy array format (backward compat with existing renderers)
    const domains = ctx.answers?.step3_capability_map?.l1_domains || [];
    const ratings = ctx.answers?.step3_capability_assess?.capability_ratings || [];
    const ratingMap = Object.fromEntries(ratings.map(r => [r.capability_id, r]));

    const capabilities = [];
    domains.forEach((domain) => {
      const domainRating = ratingMap[domain.id] || {};
      const domMaturity = domainRating.current_maturity || 1;
      capabilities.push({
        id: domain.id,
        name: domain.name,
        description: domain.description,
        level: 1,
        domain: domain.name,                                          // for renderLayers / valueStreams derivation
        maturity: domMaturity,                                         // for renderLayers maturity badge
        strategic_importance: domain.strategic_importance,
        strategicImportance: (domain.strategic_importance || 'SUPPORT').toLowerCase(),
        current_maturity: domainRating.current_maturity || null,
        target_maturity: domainRating.target_maturity || null,
        gap: domainRating.gap || null,
        investment_priority: domainRating.investment_priority || null,
        quick_wins: domainRating.quick_wins || [],
        ai_enabled: domainRating.ai_enabled || false,                  // Phase 2.2: AI capability flag
        children: (domain.l2_capabilities || []).map(cap => {
          const capRating = ratingMap[cap.id] || {};
          return {
            id: cap.id,
            name: cap.name,
            description: cap.description,
            level: 2,
            domain: domain.name,                                       // which L1 domain this belongs to
            maturity: capRating.current_maturity || 1,                 // maturity for colour class
            strategicImportance: (domain.strategic_importance || 'SUPPORT').toLowerCase(),
            current_maturity: capRating.current_maturity || null,
            target_maturity: capRating.target_maturity || null,
            gap: capRating.gap || null,
            ai_enabled: capRating.ai_enabled || false                  // Phase 2.2: AI capability flag
          };
        })
      });
    });

    return {
      capabilities,
      archBenchmark: ctx.answers?.step3_arch_benchmark || {},
      capabilityMap: ctx.answers?.step3_capability_map || {},
      capabilityAssessment: ctx.answers?.step3_capability_assess || {}
    };
  },

  applyOutput: (output, model) => {
    // Seed valueStreams from L1 domain names so Architecture Layers tab is
    // populated immediately after Step 3 (Step 7 will overwrite with richer data).
    const existingVS = (model.valueStreams || []).length > 0;
    const derivedVS = existingVS
      ? model.valueStreams
      : (output.capabilityMap?.l1_domains || []).map(d => ({ name: d.name, description: '' }));
    return {
      ...model,
      capabilities: output.capabilities,
      archBenchmark: output.archBenchmark,
      capabilityMap: output.capabilityMap,
      capabilityAssessment: output.capabilityAssessment,
      valueStreams: derivedVS
    };
  },

  onComplete: (model) => {
    if (typeof renderCapabilitySection === 'function') renderCapabilitySection();
    if (typeof renderBenchmarkSection === 'function') renderBenchmarkSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step3');
    if (typeof toast === 'function') toast('Capability Architecture complete ✓');

    const overall = model.capabilityAssessment?.overall_maturity;
    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 3 — Capability Architecture complete**\n\n` +
        `${model.capabilities?.length || 0} capabilities mapped across ${model.capabilityMap?.l1_domains?.length || 0} domains.\n` +
        `Overall maturity: **${overall ? overall.toFixed(1) + '/5' : 'assessed'}**\n\n` +
        `**Next:** Ready to design Operating Model? Click below or use the **Continue** button in the sidebar.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step4', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 4: Operating Model\n` +
        `</button>`
      );
    }
  }
};
