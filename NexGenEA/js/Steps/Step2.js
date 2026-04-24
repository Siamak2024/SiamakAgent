/**
 * Step2.js — Business Model Canvas (current + future state)
 *
 * GOLDEN RULE: Business Objectives—not Strategic Intent—drive the EA process.
 * BMC MUST align to businessContext.primaryObjectives to ensure actionable architecture.
 *
 * Tasks:
 *   2.1 bmc_current   — Internal: generate CURRENT state BMC
 *   2.2 bmc_future    — Internal: generate FUTURE state BMC aligned to Business Objectives
 *   2.3 bmc_analysis  — Internal: produce delta/analysis (gaps + opportunities)
 *
 * Outputs:
 *   model.bmc            — future-state BMC (9 building blocks)
 *   model.bmcCurrent     — current-state BMC
 *   model.bmcAnalysis    — delta analysis object
 *   model.businessContext.enrichment.bmcInsights — captured insights for enrichment
 */

const Step2 = {

  id: 'step2',
  name: 'Business Model Canvas',
  dependsOn: ['step1'],

  tasks: [

    // ── Task 2.1: Current-state BMC ───────────────────────────────────────
    {
      taskId: 'step2_bmc_current',
      title: 'Mapping current business model',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '2_1_bmc_current.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an expert Business Model designer. Analyse the company description and Business Context (Primary Objectives) to map the CURRENT state Business Model Canvas.

This is a diagnostic map — reflect the AS-IS state of the organisation. Identify where the current model is under stress or misaligned with Primary Objectives.

CRITICAL: Return ONLY valid JSON. ALL fields MUST be ARRAYS.

Example output:
{
  "value_propositions": ["We help SMB retailers achieve X", "We enable enterprises to do Y"],
  "customer_segments": ["SMB companies in retail", "Enterprise manufacturing firms"],
  "customer_relationships": ["Self-service portal", "Dedicated account managers"],
  "channels": ["Direct sales", "Partner network", "Online marketplace"],
  "key_activities": ["Platform development", "Customer support", "Partner enablement"],
  "key_resources": ["Engineering team", "Cloud infrastructure", "Brand reputation"],
  "key_partners": ["Technology vendors", "System integrators", "Cloud providers"],
  "cost_structure": ["Staff salaries", "Cloud hosting costs", "Marketing spend"],
  "revenue_streams": ["SaaS subscription ($99/user/month)", "Professional services (hourly)", "Partner commissions"]
}

RULES:
- ALL 9 fields are ARRAYS with 2-5 string items each ← MUST be arrays like ["item1", "item2"]
- Mark uncertain items with ⚠️ prefix
- Ground each item in company description - no generic filler`,

      userPrompt: (ctx) => {
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const si = ctx.strategicIntent || {};
        
        if (profile) {
          // Rich Profile mode: Use detailed offerings, business model, markets
          const offerings = (profile.offerings || []).map(o => `• ${o.name}: ${o.description || 'N/A'} (${o.targetCustomers || 'N/A'})`).join('\n');
          const markets = (profile.markets?.regions || []).join(', ');
          const customers = (profile.markets?.customerTypes || []).join(', ');
          
          return `**ORGANIZATION PROFILE - BMC CONTEXT:**

Organization: ${profile.organizationName} (${profile.industry})
Business Model: ${profile.businessModel || 'Not specified'}

**Products/Services:**
${offerings || 'None specified'}

**Market Position:**
- Regions: ${markets || 'Not specified'}
- Customer Types: ${customers || 'Not specified'}
- Market Share: ${profile.markets?.marketShare || 'Not specified'}

**Competitors:** ${(profile.markets?.competitors || []).join(', ') || 'None specified'}
**Differentiators:** ${(profile.markets?.differentiators || []).join(', ') || 'None specified'}

**Strategic Intent (from Step 1):**
- Ambition: ${si.strategic_ambition || ''}
- Burning platform: ${si.burning_platform || ''}

**CRITICAL:** Map the CURRENT state BMC grounded in the SPECIFIC offerings, markets, and business model from the profile above. Do NOT use generic consulting language.

Return JSON output.`;
        }
        
        // Quick Start fallback
        return `Company: "${ctx.companyDescription}"

Strategic Intent (from Step 1):
- Ambition: ${si.strategic_ambition || ''}
- Industry: ${si.industry || ctx.masterData.industry || ''}
- Burning platform: ${si.burning_platform || ''}
- Constraints: ${(si.key_constraints || []).join('; ')}

Map the CURRENT state BMC. Ground each block in the company description. Mark gaps with ⚠️.

Return JSON output.`;
      },

      outputSchema: {
        value_propositions: ['string'],
        customer_segments: ['string'],
        customer_relationships: ['string'],
        channels: ['string'],
        key_activities: ['string'],
        key_resources: ['string'],
        key_partners: ['string'],
        cost_structure: ['string'],
        revenue_streams: ['string']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step2_bmc_current')
    },

    // ── Task 2.2: Future-state BMC ────────────────────────────────────────
    {
      taskId: 'step2_bmc_future',
      title: 'Designing future business model',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '2_2_bmc_future.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an expert Business Model designer. Based on the Business Context (Primary Objectives) and current-state BMC, design the FUTURE state Business Model Canvas — where the organisation needs to be to achieve their Primary Objectives.

This is a TARGET model — show the bold shifts needed to achieve Primary Objectives, not incremental tweaks.

CRITICAL: Return ONLY valid JSON. ALL fields MUST be ARRAYS.

Example output:
{
  "value_propositions": ["We will deliver X value through Y innovation", "We enable Z transformation"],
  "customer_segments": ["Expanded SMB segment", "New enterprise vertical", "International markets"],
  "customer_relationships": ["AI-powered self-service", "Community-driven support", "Premium concierge tier"],
  "channels": ["Digital-first omnichannel", "API ecosystem", "Strategic partnerships"],
  "key_activities": ["Platform R&D", "Data analytics", "Ecosystem development"],
  "key_resources": ["AI/ML capabilities", "Customer data platform", "Partner network"],
  "key_partners": ["Cloud hyperscalers", "System integrators", "Tech vendors"],
  "cost_structure": ["Engineering R&D", "Cloud infrastructure", "Go-to-market"],
  "revenue_streams": ["Tiered SaaS ($49-$199/user/month)", "Usage-based billing", "Premium add-ons"],
  "transformation_moves": [
    {"from": "Single-tier fixed pricing", "to": "Tiered usage-based model", "rationale": "Better align value capture with usage"}
  ]
}

RULES:
- ALL 9 building blocks are ARRAYS with 2-5 items ← MUST be arrays like ["item1", "item2"]
- transformation_moves: ARRAY of objects explaining major shifts
- Show bold changes from current to future state`,

      userPrompt: (ctx) => {
        const si = ctx.strategicIntent || {};
        const current = ctx.answers?.step2_bmc_current || {};
        
        // ── Phase 2.1: Include AI transformation themes from Strategic Intent ──
        const aiThemes = (si.ai_transformation_themes || []);
        const aiContext = aiThemes.length > 0
          ? `\n\nAI Transformation Themes (from Strategic Intent):\n${aiThemes.map((t, i) => `${i+1}. ${t}`).join('\n')}\n\nIncorporate these AI ambitions into the future BMC where relevant (key activities, resources, relationships, revenue).`
          : '';
        
        return `Company: "${ctx.companyDescription}"

Strategic Intent:
- Ambition: ${si.strategic_ambition || ''}
- Themes: ${(si.strategic_themes || []).join(' | ')}
- Expected outcomes: ${(si.expected_outcomes || []).join('; ')}
- Success metrics: ${(si.success_metrics || []).slice(0, 4).join('; ')}${aiContext}

Current BMC summary:
- Value propositions: ${(current.value_propositions || []).join('; ')}
- Customer segments: ${(current.customer_segments || []).join(', ')}
- Revenue streams: ${(current.revenue_streams || []).join('; ')}

Design the FUTURE state BMC. Show bold shifts — not just refining the current model. Include transformation_moves to explain each major change.

Return JSON output.`;
      },

      outputSchema: {
        value_propositions: ['string'],
        customer_segments: ['string'],
        customer_relationships: ['string'],
        channels: ['string'],
        key_activities: ['string'],
        key_resources: ['string'],
        key_partners: ['string'],
        cost_structure: ['string'],
        revenue_streams: ['string'],
        ai_transformation: 'object?'  // Phase 2.1: Optional AI-enabled BMC elements (only if Strategic Intent has AI plans)
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step2_bmc_future')
    },

    // ── Task 2.3: BMC Delta Analysis ──────────────────────────────────────
    {
      taskId: 'step2_bmc_analysis',
      title: 'Analysing business model delta',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '2_3_bmc_analysis.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a senior strategic analyst. Compare the current and future Business Model Canvas to produce a structured delta analysis.
Return ONLY valid JSON:
{
  "critical_gaps": [{"block":"","gap":"","impact":"HIGH|MEDIUM|LOW"}],
  "strategic_opportunities": [{"opportunity":"","value_driver":"","feasibility":"HIGH|MEDIUM|LOW"}],
  "capability_implications": [""],
  "architectural_implications": [""],
  "transformation_risk": "HIGH|MEDIUM|LOW",
  "transformation_risk_rationale": "",
  "executive_summary": ""
}`,

      userPrompt: (ctx) => {
        const current = ctx.answers?.step2_bmc_current || {};
        const future = ctx.answers?.step2_bmc_future || {};
        const si = ctx.strategicIntent || {};
        return `Strategic ambition: "${si.strategic_ambition || ''}"

Current BMC:
${JSON.stringify({ vp: current.value_propositions, segments: current.customer_segments, revenue: current.revenue_streams, activities: current.key_activities }, null, 2)}

Future BMC:
${JSON.stringify({ vp: future.value_propositions, segments: future.customer_segments, revenue: future.revenue_streams, moves: future.transformation_moves }, null, 2)}

Produce the delta analysis. executive_summary: 2-3 sentences for the Board.

Return JSON output.`;
      },

      outputSchema: {
        critical_gaps: ['object'],
        strategic_opportunities: ['object'],
        executive_summary: 'string'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step2_bmc_analysis')
    }

  ],

  synthesize: (ctx) => {
    // Bridge: normalize value_propositions (plural array) → value_proposition (singular string)
    // renderBMCPanel reads b.value_proposition (singular), so we must always set it.
    const normalizeBmc = (bmc) => {
      if (!bmc) return {};
      const r = { ...bmc };
      if (!r.value_proposition && r.value_propositions) {
        r.value_proposition = Array.isArray(r.value_propositions)
          ? r.value_propositions.join('\n\n')
          : String(r.value_propositions);
      }
      return r;
    };
    return {
      bmc: normalizeBmc(ctx.answers?.step2_bmc_future),
      bmcCurrent: normalizeBmc(ctx.answers?.step2_bmc_current),
      bmcAnalysis: ctx.answers?.step2_bmc_analysis || {}
    };
  },

  applyOutput: (output, model) => {
    // Capture BMC insights into enrichment
    if (model.businessContext && model.businessContext.enrichment) {
      model.businessContext.enrichment.bmcInsights = {
        customerSegments: output.bmc?.customer_segments || [],
        valuePropositions: output.bmc?.value_propositions || [],
        keyInsights: output.bmcAnalysis?.summary || 'BMC analysis completed',
        transformationMoves: output.bmc?.transformation_moves || []
      };
    }

    return {
      ...model,
      bmc: output.bmc,
      // Set BOTH spellings so renderBMCPanel (bmc_current underscore) and legacy code both work
      bmc_current: output.bmcCurrent,
      bmcCurrent: output.bmcCurrent,
      bmcAnalysis: output.bmcAnalysis,
      bmc_analysis: output.bmcAnalysis
    };
  },

  onComplete: (model) => {
    if (typeof renderBMCSection === 'function') renderBMCSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step2');
    if (typeof toast === 'function') toast('Business Model Canvas complete ✓');

    const bmc = model.bmc || {};
    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 2 — Business Model Canvas complete**\n\n` +
        `**Future model:** ${bmc.metadata?.at_a_glance || (bmc.value_propositions || []).slice(0, 2).join(', ')}\n\n` +
        `Review current vs. future BMC in the **BMC** tab.\n\n` +
        `**Click on Step 3: Capability Map in the left sidebar to continue.**`
      );
    }
  }
};
