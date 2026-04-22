/**
 * Step1.js — Strategic Intent (9-task conversational flow)
 *
 * Task breakdown:
 *   1.0 context_engine  — Internal: run Step0 context analysis (skipped if Rich Profile exists)
 *   1.1 q1_trigger      — Ask: main pain point / trigger
 *   1.2 q2_scale        — Ask: org scale & current systems
 *   1.3 q3_constraints  — Ask: budget, timeline, regulatory constraints
 *   1.4 q4_metrics      — Ask: success metrics (measurable outcomes)
 *   1.5 q5_stakeholders — Ask: key decision-makers and their priorities
 *   1.6 q6_scope        — Ask: what is explicitly in / out of scope
 *   1.7 q7_assumptions  — Ask: assumptions that must be validated
 *   1.8 synthesize      — Internal: synthesise Strategic Intent document
 *   1.9 validate        — Show draft to user for confirmation
 *
 * The model after Step1 contains:
 *   model.strategicIntent  — structured Strategic Intent object
 *   model.strategicIntentConfirmed — set to true after user confirms
 *
 * ORGANIZATION PROFILE INTEGRATION:
 * If window.model.organizationProfile exists with completeness >= 60%, Step1 will:
 * - Skip or shorten the questionnaire
 * - Use profile data for Strategic Intent generation
 * - Reference specific priorities, challenges, and constraints from the profile
 */

// Helper: Build context string from organizationProfile or fallback
function _buildStep1Context(ctx) {
  const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
  const completeness = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfileCompleteness : 0;

  if (profile && completeness >= 60) {
    // Rich Profile mode: Use structured context
    const priorities = (profile.strategicPriorities || []).map(p => p.priority).slice(0, 5).join('; ');
    const challenges = (profile.challenges || []).map(c => c.challenge).slice(0, 5).join('; ');
    const opportunities = (profile.opportunities || []).map(o => o.opportunity).slice(0, 3).join('; ');
    const constraints = (profile.constraints || []).map(c => c.description).slice(0, 3).join('; ');
    
    return `**ORGANIZATION CONTEXT (from Rich Profile - ${completeness}% complete):**

Company: ${profile.organizationName} (${profile.companySize?.employees || 'N/A'} employees, ${profile.companySize?.sizeCategory || 'N/A'})
Industry: ${profile.industry}
Mission: ${profile.missionStatement || 'Not specified'}
Market Position: ${profile.markets?.marketPosition || 'Not specified'}

Strategic Priorities: ${priorities || 'Not specified'}
Key Challenges: ${challenges || 'Not specified'}
Opportunities: ${opportunities || 'Not specified'}
Constraints: ${constraints || 'Not specified'}

Technology Maturity: Cloud=${profile.technologyLandscape?.cloudAdoption || 'Unknown'}, AI=${profile.technologyLandscape?.aiAdoption || 'Unknown'}, Tech Debt=${profile.technologyLandscape?.techDebt || 'Unknown'}
Transformation Readiness: ${profile.executiveSummary?.transformationReadiness || 'Unknown'}

CRITICAL: Use the specific priorities, challenges, and constraints from above. Do NOT generate generic consulting language.`;
  }

  // Quick Start mode: Minimal context
  return `Company description: "${ctx.companyDescription || 'Not provided'}"`;
}

const Step1 = {

  id: 'step1',
  name: 'Strategic Intent',
  dependsOn: [],  // First step

  tasks: [

    // ── Task 1.0: Context Engine (Step0) ──────────────────────────────────
    {
      taskId: 'step1_0_context',
      title: 'Analysing company context',
      type: 'internal',
      taskType: 'lightweight',
      instructionFile: '0_1_context_engine.instruction.md',
      expectsJson: true,

      // Skip if Rich Profile already exists
      shouldRun: (ctx) => {
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const completeness = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfileCompleteness : 0;
        
        if (profile && completeness >= 60) {
          console.log('[Step1] Skipping context engine - Rich Profile already exists (completeness:', completeness + '%)');
          return false;  // Skip
        }
        return true;  // Run
      },

      systemPromptFallback: `You are the Context Engine for an enterprise architecture platform.
Analyse the company description and produce a classification + industry-calibrated system prompts for all 7 steps.
Return ONLY valid JSON — no prose, no markdown.`,

      userPrompt: (ctx) => {
        // Re-use the Step0 user prompt builder
        return Step0.tasks[1].userPrompt(ctx);  // Note: Changed to tasks[1] since Step0 now has rich profile as first task
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_0_context'),

      // Immediately store step prompts so Q tasks can use them
      onComplete: (output, ctx) => {
        window._stepPrompts    = output.step_prompts || {};
        window._step1Hypothesis = output.hypothesis || null;
        if (window.model) window.model.contextObj = output.context || {};
      }
    },

    // ── Task 1.1: Q1 — Main pain point / trigger ──────────────────────────
    {
      taskId: 'step1_q1_trigger',
      title: 'What is driving this?',
      type: 'question',
      allowSkip: false,
      generateQuestion: true,  // AI generates the question text based on context
      taskType: 'general',
      instructionFile: '1_1_q1_trigger.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Based on the organisation description and initial context analysis, generate a focused, conversational question about what is driving the transformation need.

Tailor the question to the specific organisation — not generic. Offer 4-5 specific answer options relevant to their industry/situation.

Return ONLY valid JSON:
{
  "question": "natural conversational question text",
  "options": ["option 1", "option 2", "option 3", "option 4"],
  "guidance": "one sentence hint to help them answer"
}`,

      userPrompt: (ctx) => {
        const contextStr = _buildStep1Context(ctx);
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        
        if (profile) {
          // Rich Profile: Use structured priorities and challenges
          const topPriorities = (profile.strategicPriorities || []).slice(0, 3).map(p => p.priority).join(', ');
          const topChallenges = (profile.challenges || []).slice(0, 3).map(c => c.challenge).join(', ');
          
          return `${contextStr}

Generate Question 1: What is the main business pain or trigger driving this EA initiative right now?

Given the strategic priorities (${topPriorities}) and challenges (${topChallenges}), create a focused question with 4-5 options that reflect THEIR specific situation.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
        }

        // Quick Start fallback
        const analysis = ctx.answers?.step1_0_context || {};
        const industry = analysis.context?.industry || ctx.masterData.industry;
        const pains = (analysis.hypothesis?.assumed_pain_points || []).join(', ');
        return `${contextStr}
Industry: ${industry}
Inferred pain points: ${pains || 'unknown'}
Strategic posture: ${analysis.context?.strategic_posture || 'unknown'}

Generate Question 1: What is the main business pain or trigger driving this work right now?
Make it specific to their industry. Offer 4-5 options that map to the inferred situation.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'], guidance: 'string?' },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q1_trigger'),
      wrapAnswer: (answer, ctx) => ({ q1_trigger: answer })
    },

    // ── Task 1.2: Q2 — Scale & current systems ────────────────────────────
    {
      taskId: 'step1_q2_scale',
      title: 'What is the scale?',
      type: 'question',
      generateQuestion: true,
      taskType: 'general',
      instructionFile: '1_2_q2_scale.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask a focused question about the organisation's scale and current system landscape.
IMPORTANT: For real estate and asset-heavy industries, revenue/AUM can be very large with small headcount due to outsourcing.
Tailor to what you know — don't repeat what they already told you.
Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const q1 = ctx.answers?.step1_q1_trigger?.q1_trigger || '(not answered)';
        
        if (profile) {
          // Rich Profile: Already have scale data - skip or make this confirming
          const revenue = profile.financial?.revenue || 'Not specified';
          const employees = profile.companySize?.employees || 'Not specified';
          const coreSystems = (profile.technologyLandscape?.coreSystems || []).slice(0, 3).join(', ');
          
          return `${_buildStep1Context(ctx)}
Q1 answer: "${q1}"

Generate Question 2: Confirm/refine the scale and current system landscape.
We already know: Revenue: ${revenue}, Employees: ${employees}, Core Systems: ${coreSystems || 'Not specified'}

Generate a brief confirming question with 3-4 options to clarify system maturity or any gaps.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
        }
        
        // Quick Start fallback
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Q1 answer (pain point): "${q1}"
Generate Question 2: Scale & current systems. Cover revenue/AUM range, headcount (noting real estate/asset companies often have high revenue with small teams due to outsourcing), and system maturity.
Offer 4-5 options. Reflect industry norms.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q2_scale'),
      wrapAnswer: (answer) => ({ q2_scale: answer })
    },

    // ── Task 1.3: Q3 — Constraints ────────────────────────────────────────
    {
      taskId: 'step1_q3_constraints',
      title: 'Key constraints',
      type: 'question',
      generateQuestion: true,
      taskType: 'general',
      instructionFile: '1_3_q3_constraints.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask about the key constraints — budget, timeline, regulatory, organisational. Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const q1 = ctx.answers?.step1_q1_trigger?.q1_trigger || '';
        
        if (profile) {
          // Rich Profile: Use structured constraints
          const constraints = (profile.constraints || []).map(c => c.description).join('; ');
          const financial = profile.financial?.investmentCapacity || 'Unknown';
          
          return `${_buildStep1Context(ctx)}
Pain point: ${q1}

Generate Question 3: Confirm the binding constraints.
Known constraints: ${constraints || 'None specified'}
Investment capacity: ${financial}

Generate a focused question with 4-5 options to clarify budget, timeline, regulatory, or organizational readiness constraints.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
        }
        
        // Quick Start fallback
        const analysis = ctx.answers?.step1_0_context || {};
        const regFlags = (analysis.context?.regulatory_flags || []).join(', ') || 'none mentioned';
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Regulatory flags: ${regFlags}
Pain point: ${q1}
Generate Question 3: What are the binding constraints we must work within?
Focus on: budget envelope, hard deadlines, regulatory requirements, org readiness. 4-5 options.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q3_constraints'),
      wrapAnswer: (answer) => ({ q3_constraints: answer })
    },

    // ── Task 1.4: Q4 — Success metrics ───────────────────────────────────
    {
      taskId: 'step1_q4_metrics',
      title: 'Success metrics',
      type: 'question',
      generateQuestion: true,
      allowMultiple: true,  // Allow selecting 2-3 outcomes
      taskType: 'general',
      instructionFile: '1_4_q4_metrics.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask what measurable outcomes would define success for this engagement. The user should select 2-3 outcomes. Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const q1 = ctx.answers?.step1_q1_trigger?.q1_trigger || '';
        const q3 = ctx.answers?.step1_q3_constraints?.q3_constraints || '';
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Pain point: ${q1}
Constraints: ${q3}
Generate Question 4: Pick the 2-3 outcomes that matter most over your transformation horizon. Use "Reduction in / Improvement in / Increase in" framing. Offer 5-6 options grounded in their stated pain points. Do NOT invent metrics with specific numbers.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q4_metrics'),
      wrapAnswer: (answer) => ({ q4_metrics: answer })
    },

    // ── Task 1.5: Q5 — Stakeholders ───────────────────────────────────────
    {
      taskId: 'step1_q5_stakeholders',
      title: 'Key decision-makers',
      type: 'question',
      generateQuestion: true,
      taskType: 'general',
      instructionFile: '1_5_q5_stakeholders.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask about key decision-makers and their priorities. Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const q1 = ctx.answers?.step1_q1_trigger?.q1_trigger || '';
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Pain point / trigger: ${q1}
Generate Question 5: Who are the key stakeholders and what outcomes do they each care most about?
Typical roles: CEO, CFO, CTO, COO, Board. 4-5 options relevant to their org size.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q5_stakeholders'),
      wrapAnswer: (answer) => ({ q5_stakeholders: answer })
    },

    // ── Task 1.6: Q6 — Scope ─────────────────────────────────────────────
    {
      taskId: 'step1_q6_scope',
      title: 'Scope definition',
      type: 'question',
      generateQuestion: true,
      taskType: 'general',
      instructionFile: '1_6_q6_scope.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask what is explicitly in scope vs. out of scope for this engagement. Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const q2 = ctx.answers?.step1_q2_scale?.q2_scale || '';
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Scale / systems: ${q2}
Generate Question 6: What is explicitly in scope vs. out of scope for this EA engagement?
Options should cover process areas, systems, geographies, or org units.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q6_scope'),
      wrapAnswer: (answer) => ({ q6_scope: answer })
    },

    // ── Task 1.7: Q7 — Assumptions to validate ────────────────────────────
    {
      taskId: 'step1_q7_assumptions',
      title: 'Assumptions & risks',
      type: 'question',
      generateQuestion: true,
      taskType: 'general',
      instructionFile: '1_7_q7_assumptions.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask about the key assumptions that must be validated before committing to architectural direction. Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const q1 = ctx.answers?.step1_q1_trigger?.q1_trigger || '';
        const q3 = ctx.answers?.step1_q3_constraints?.q3_constraints || '';
        return `Company: "${ctx.companyDescription.slice(0, 300)}"
Pain: ${q1}  Constraints: ${q3}
Generate Question 7: What are the 2-3 most important assumptions this engagement must validate before committing to architecture direction?
Examples: "Is the bottleneck in the system or in the process?", "Is the data available for automation?". 4-5 options.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q7_assumptions'),
      wrapAnswer: (answer) => ({ q7_assumptions: answer })
    },
    // ── Task 1.7b: Q7b — AI & Automation Transformation Role ────────────────────
    {
      taskId: 'step1_q7b_ai_role',
      title: 'AI & Automation transformation',
      type: 'question',
      generateQuestion: true,
      taskType: 'general',
      instructionFile: '1_7b_ai_role.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture advisor. Ask about the role AI and automation will play in achieving the strategic ambition. Return ONLY valid JSON: { "question": "", "options": [], "guidance": "" }`,

      userPrompt: (ctx) => {
        const desc = ctx.companyDescription.slice(0, 300);
        const q1 = ctx.answers?.step1_q1_trigger?.q1_trigger || 'digital transformation';
        const q2 = ctx.answers?.step1_q2_scale?.q2_scale || '';
        return `Company: "${desc}"
Strategic trigger: ${q1}
Scale/ambition: ${q2}
Generate Question 7b: What role will AI and automation play in achieving your strategic ambition?
Provide 4-5 realistic AI/automation use cases for their industry, plus "No AI plans yet" option.

Return JSON with format: { "question": "string", "options": ["string"], "guidance": "string" }`;
      },

      outputSchema: { question: 'string', options: ['string'] },
      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step1_q7b_ai_role'),
      wrapAnswer: (answer) => ({ q7b_ai_role: answer })
    },
    // ── Task 1.8: Synthesise Strategic Intent ─────────────────────────────
    {
      taskId: 'step1_synthesize',
      title: 'Synthesising Strategic Intent',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '1_8_synthesize.instruction.md',
      expectsJson: true,

      systemPromptFallback: (ctx) => {
        const step1sys = window._stepPrompts?.step_1 || '';
        const basePrompt = step1sys && step1sys.trim().length > 80
          ? step1sys
          : `You are a senior strategy advisor with 15+ years of cross-industry experience. Translate the company description and interview answers into a structured Strategic Intent brief for a Senior Enterprise Architect. C-level tone. Do NOT invent specifics not stated — mark unknowns as [to be confirmed].`;

        return basePrompt + `\n\nOutput requirements — Return ONLY valid JSON (no markdown, no explanation):
{"org_name":"","industry":"","timeframe":"3-5 years","strategic_ambition":"","situation_narrative":"","strategic_themes":["","",""],"ai_transformation_themes":["",""],"investigation_scope":["","","","",""],"key_constraints":["","","","",""],"success_metrics":["","","","","",""],"key_assumptions_to_validate":["","","","","",""],"expected_outcomes":["","",""],"burning_platform":"","assumptions_and_caveats":[""]}

Rules:
- strategic_ambition: 1 sentence, executive tone, no invented numbers
- situation_narrative: 2-3 sentences, grounded in what user stated
- strategic_themes: exactly 3, plain English, max 8 words each
- ai_transformation_themes: 2-4 AI/automation use cases from Q7b (or empty array [] if "No AI plans")
- key_constraints: exactly 5, one each for Operational|Financial|Organisational|Technical|External prefixed with label
- success_metrics: 5-6, use "Reduction in / Improvement in / Increase in" framing
- key_assumptions_to_validate: 5-8 engagement assumptions (strategic, not data gaps)
- expected_outcomes: exactly 3
- assumptions_and_caveats: DATA GAPS ONLY — attributes inferred but not stated by user`;
      },

      userPrompt: (ctx) => {
        const profile = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfile : null;
        const completeness = (typeof window !== 'undefined' && window.model) ? window.model.organizationProfileCompleteness : 0;
        
        // Gather interview answers
        const answers = ctx.answers || {};
        const qa = [
          answers.step1_q1_trigger?.q1_trigger   ? `Q1 (Pain/Trigger): ${answers.step1_q1_trigger.q1_trigger}` : null,
          answers.step1_q2_scale?.q2_scale        ? `Q2 (Scale/Systems): ${answers.step1_q2_scale.q2_scale}` : null,
          answers.step1_q3_constraints?.q3_constraints ? `Q3 (Constraints): ${answers.step1_q3_constraints.q3_constraints}` : null,
          answers.step1_q4_metrics?.q4_metrics    ? `Q4 (Success Metrics): ${answers.step1_q4_metrics.q4_metrics}` : null,
          answers.step1_q5_stakeholders?.q5_stakeholders ? `Q5 (Stakeholders): ${answers.step1_q5_stakeholders.q5_stakeholders}` : null,
          answers.step1_q6_scope?.q6_scope        ? `Q6 (Scope): ${answers.step1_q6_scope.q6_scope}` : null,
          answers.step1_q7_assumptions?.q7_assumptions ? `Q7 (Assumptions): ${answers.step1_q7_assumptions.q7_assumptions}` : null,
          answers.step1_q7b_ai_role?.q7b_ai_role  ? `Q7b (AI Transformation): ${answers.step1_q7b_ai_role.q7b_ai_role}` : null
        ].filter(Boolean).join('\n');
        
        if (profile && completeness >= 60) {
          // Rich Profile mode: Use structured profile data as primary context
          const priorities = (profile.strategicPriorities || []).map(p => `• ${p.priority} (${p.timeframe || 'N/A'}): ${p.rationale || 'N/A'}`).join('\n');
          const challenges = (profile.challenges || []).map(c => `• ${c.challenge}: ${c.impact || 'N/A'}`).join('\n');
          const opportunities = (profile.opportunities || []).map(o => `• ${o.opportunity}`).join('\n');
          const constraints = (profile.constraints || []).map(c => `• ${c.type || 'N/A'}: ${c.description}`).join('\n');
          const offerings = (profile.offerings || []).map(o => `• ${o.name}: ${o.description || 'N/A'}`).join('\n');
          
          return `**ORGANIZATION PROFILE (${completeness}% complete — PRIMARY CONTEXT):**

Organization: ${profile.organizationName} (${profile.industry})
Size: ${profile.companySize?.employees || 'N/A'} employees, ${profile.companySize?.sizeCategory || 'N/A'}
Mission: ${profile.missionStatement || 'Not specified'}
Vision: ${profile.vision || 'Not specified'}
Business Model: ${profile.businessModel || 'Not specified'}

**Strategic Priorities:**
${priorities || 'None specified'}

**Challenges:**
${challenges || 'None specified'}

**Opportunities:**
${opportunities || 'None specified'}

**Constraints:**
${constraints || 'None specified'}

**Products/Services:**
${offerings || 'None specified'}

**Technology Landscape:**
- Cloud Adoption: ${profile.technologyLandscape?.cloudAdoption || 'Unknown'}
- AI Adoption: ${profile.technologyLandscape?.aiAdoption || 'Unknown'}
- Tech Debt: ${profile.technologyLandscape?.techDebt || 'Unknown'}

**Transformation Readiness:** ${profile.executiveSummary?.transformationReadiness || 'Unknown'}

**Financial Context:**
- Revenue: ${profile.financial?.revenue || 'Unknown'}
- Growth Rate: ${profile.financial?.growthRate || 'Unknown'}
- Investment Capacity: ${profile.financial?.investmentCapacity || 'Unknown'}

**Interview answers (refinements/confirmations):**
${qa || '(no additional answers)'}

**CRITICAL INSTRUCTION:** Use the Strategic Priorities, Challenges, Opportunities, and Constraints from the profile as the PRIMARY source. The interview answers are supplements only. Do NOT mark profile data as [to be confirmed].

Synthesise a complete Strategic Intent document grounded in the Rich Profile data above.

Return JSON with format: {
  "org_name": "string",
  "industry": "string",
  "timeframe": "3-5 years",
  "strategic_ambition": "string",
  "situation_narrative": "string",
  "strategic_themes": ["string", "string", "string"],
  "ai_transformation_themes": ["string"],
  "investigation_scope": ["string"],
  "key_constraints": ["string"],
  "success_metrics": ["string"],
  "key_assumptions_to_validate": ["string"],
  "expected_outcomes": ["string"],
  "burning_platform": "string",
  "assumptions_and_caveats": ["string"]
}`;
        }

        // Quick Start fallback
        return `Company description: "${ctx.companyDescription}"

Interview answers:
${qa || '(no answers provided)'}

Synthesise a complete Strategic Intent document. Treat the interview answers as ground truth — do not mark them as [to be confirmed].

Return JSON with format: {
  "org_name": "string",
  "industry": "string",
  "timeframe": "3-5 years",
  "strategic_ambition": "string",
  "situation_narrative": "string",
  "strategic_themes": ["string", "string", "string"],
  "investigation_scope": ["string"],
  "key_constraints": ["string"],
  "success_metrics": ["string"],
  "key_assumptions_to_validate": ["string"],
  "expected_outcomes": ["string"],
  "burning_platform": "string",
  "assumptions_and_caveats": ["string"]
}`;
      },

      outputSchema: {
        strategic_ambition: 'string',
        situation_narrative: 'string',
        strategic_themes: ['string'],
        key_constraints: ['string'],
        success_metrics: ['string'],
        expected_outcomes: ['string']
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step1_synthesize');
        // Strip _meta if present
        if (parsed._meta) {
          if (window.model) { window.model.stepMeta = window.model.stepMeta || {}; window.model.stepMeta[1] = parsed._meta; }
          delete parsed._meta;
        }
        return parsed;
      }
    },

    // ── Task 1.9: Show draft & await confirmation ─────────────────────────
    {
      taskId: 'step1_validate',
      title: 'Review Strategic Intent',
      type: 'question',
      generateQuestion: false,
      allowSkip: false,

      question: (ctx) => {
        const si = ctx.answers?.step1_synthesize || {};
        const themes = (si.strategic_themes || []).map(t => `• ${t}`).join('\n');
        const metrics = (si.success_metrics || []).slice(0, 3).map(m => `• ${m}`).join('\n');
        
        return `✅ **Strategic Intent drafted** — Before we proceed, please review this synthesis of your answers:

**Strategic Ambition:**
${si.strategic_ambition || '[not generated]'}

**Strategic Themes:**
${themes}

**Top Success Metrics:**
${metrics}

**Why this step?** This ensures the AI captured your intent correctly. Once confirmed, this becomes the foundation for all architecture decisions in the following steps.

**Note:** Don't worry if it's not perfect yet — you'll be able to edit and refine the full Strategic Intent in the "Strategic Intent" tab after this step. You can also return to adjust it anytime before proceeding to Step 2.

Does this capture the right direction? Select "Confirm" to proceed, or choose "Needs adjustment" and describe what to change in the chat box.`;
      },

      options: ['Confirm — looks right', 'Needs adjustment — see note below'],

      wrapAnswer: (answer) => {
        try {
          const confirmed = /confirm|looks right|yes|ja|ok|good|correct/i.test(answer);
          console.log('[Step1] Validation answer:', answer, '| Confirmed:', confirmed);
          return {
            validation: answer,
            confirmed: confirmed
          };
        } catch (err) {
          console.error('[Step1] Error in wrapAnswer:', err);
          return { validation: answer, confirmed: false };
        }
      }
    }

  ], // end tasks

  synthesize: (ctx) => {
    return ctx.answers?.step1_synthesize || {};
  },

  applyOutput: (output, model) => {
    return {
      ...model,
      strategicIntent: output,
      strategicIntentConfirmed: true  // Step Engine's confirmation replaces the old manual confirm button
    };
  },

  onComplete: (model) => {
    if (typeof renderStrategicIntentSection === 'function') renderStrategicIntentSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1]);
    if (typeof showTab === 'function' && typeof findTabButton === 'function') {
      showTab('exec', findTabButton('exec'));
    }
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step1');
    if (typeof toast === 'function') toast('Strategic Intent confirmed ✓');

    // Post-completion message in chat
    const si = model.strategicIntent || {};
    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 1 — Strategic Intent complete**\n\n` +
        `**Ambition:** ${si.strategic_ambition || ''}\n` +
        `**Themes:** ${(si.strategic_themes || []).join(' · ')}\n\n` +
        `Review the full document in the **Executive** tab.\n\n` +
        `**Next:** Ready to design your Business Model Canvas? Click below or use the **Continue** button in the sidebar.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step2', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 2: Business Model Canvas\n` +
        `</button>`
      );
    }

    // Show confirm button for manual re-confirmation (backward compat)
    const confirmBtn = document.getElementById('btn-step1-confirm');
    if (confirmBtn) confirmBtn.classList.add('hidden'); // already confirmed
  }
};
