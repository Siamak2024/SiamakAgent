/**
 * Step0.js — Pre-Step Context Engine
 *
 * Analyses the company description and generates:
 *   - Organisation classification (industry, org type, maturity estimate)
 *   - Industry-calibrated system prompts for Steps 1–7
 *   - Initial hypothesis + confidence
 *
 * This runs before Step 1 and stores results in:
 *   window._stepPrompts    — used by Steps 1–7 as their system prompts
 *   model.contextObj       — org classification
 *   window._step1Hypothesis
 *
 * Step0 is still used internally by Step1 (runs as an internal task).
 * It is NOT shown as a visible step in the UI.
 */

const Step0 = {

  id: 'step0',
  name: 'Context Engine',
  dependsOn: [],

  tasks: [
    {
      taskId: 'step0_context_engine',
      title: 'Analysing company context',
      type: 'internal',
      taskType: 'lightweight',
      instructionFile: '0_1_context_engine.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are the Context Engine for an enterprise architecture platform.
Analyse a company description and produce TWO things in a single JSON response:
1. A structured Context Object classifying the organisation.
2. Industry-calibrated system prompts for all 7 workflow steps.

Each step prompt must be a complete system prompt string — not a title or summary. Include:
- A named expert persona with 15+ years of relevant industry experience
- Industry context grounded ONLY in what the user described — never invent company attributes
- A "Return ONLY valid JSON, no markdown" instruction (except step_1 which gets its JSON schema added separately)
- A quality gate: "Generic output that could apply to any industry is unacceptable"

CRITICAL SCALE GUIDANCE:
- **Real Estate & Asset Management**: Revenue/AUM can be billions with only 20-50 employees if property/facility management is outsourced to external firms. Headcount ≠ company size.
- **Service delivery model matters**: Note if operations are in-house vs. outsourced in your interpretation.
- Do NOT assume large headcount for asset-heavy industries.

CRITICAL: Do NOT invent service lines, corridors, system names, customer types, or revenue figures not stated by the user.
Mark unknown attributes with [to be confirmed]. Only use details explicitly stated in the description.

Return ONLY valid JSON — no prose, no markdown.`,

      userPrompt: (ctx) => `Company description: "${ctx.companyDescription}"

Return JSON with this exact shape:
{
  "context": {
    "org_name": "",
    "industry": "",
    "sub_sector": "",
    "org_type": "enterprise|SME|startup|public-sector|PE-backed",
    "maturity_estimate": "1|2|3|4|5",
    "scale_estimate": "estimated revenue range and headcount",
    "primary_challenge": "",
    "strategic_posture": "survival|stabilize|grow|transform|disrupt",
    "regulatory_flags": [],
    "clarification_needed": ["any field where confidence is below 0.7"]
  },
  "hypothesis": {
    "interpretation": "1-2 sentence plain-English interpretation of what this organisation likely is and the core architectural challenge",
    "assumed_pain_points": ["inferred pain 1", "inferred pain 2"],
    "assumed_core_systems": ["inferred system type 1"],
    "confidence": 0.0
  },
  "step_prompts": {
    "step_1": "Full system prompt for Step 1 Strategic Intent. Named expert persona. Industry-specific quality gate. No JSON schema (added separately).",
    "step_2": "Full system prompt for Step 2 BMC. Return ONLY valid JSON, no markdown.",
    "step_3": "Full system prompt for Step 3 Architecture. Return ONLY valid JSON, no markdown.",
    "step_4": "Full system prompt for Step 4 Operating Model. Return ONLY valid JSON, no markdown.",
    "step_5": "Full system prompt for Step 5 Gap Analysis. Return ONLY valid JSON, no markdown.",
    "step_6": "Full system prompt for Step 6 Value Pools. Return ONLY valid JSON, no markdown.",
    "step_7": "Full system prompt for Step 7 Roadmap. Return ONLY valid JSON, no markdown."
  }
}`,

      outputSchema: {
        context: {
          org_name: 'string?',
          industry: 'string',
          org_type: 'string',
          maturity_estimate: 'string',
          strategic_posture: 'string'
        },
        hypothesis: {
          interpretation: 'string',
          confidence: 'number'
        },
        step_prompts: {
          step_1: 'string',
          step_2: 'string',
          step_3: 'string',
          step_4: 'string',
          step_5: 'string',
          step_6: 'string',
          step_7: 'string'
        }
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step0_context_engine')
    }
  ],

  synthesize: (ctx) => {
    const out = ctx.answers?.step0_context_engine || {};
    return {
      contextObj:   out.context || {},
      stepPrompts:  out.step_prompts || {},
      hypothesis:   out.hypothesis || null
    };
  },

  applyOutput: (output, model) => {
    // Store step prompts for downstream steps (keep window._ for backward compat)
    window._stepPrompts    = output.stepPrompts || {};
    window._step1Hypothesis = output.hypothesis || null;

    return {
      ...model,
      contextObj: output.contextObj || {}
    };
  },

  onComplete: (model) => {
    // No UI change — Step0 is internal
    console.log('[Step0] Context engine complete:', model.contextObj?.industry || 'unknown industry');
  }
};
