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
    // NEW: Rich Profile Processing (auto-detected for detailed summaries)
    {
      taskId: 'step0_rich_profile',
      title: 'Processing detailed organizational summary',
      type: 'internal',
      taskType: 'lightweight',
      expectsJson: true,

      // Only run if company description is detailed (> 500 chars)
      shouldRun: (ctx) => {
        const desc = ctx.companyDescription || '';
        const isRich = desc.length > 500;
        if (isRich) {
          console.log('[Step0] Detected rich profile mode (', desc.length, 'chars)');
        }
        return isRich;
      },

      userPrompt: (ctx) => ctx.companyDescription,

      parseOutput: async (raw, ctx) => {
        console.log('[Step0] Processing organization profile with AI...');
        
        // Call the Organization Profile Processor
        if (typeof EA_OrganizationProfileProcessor === 'undefined') {
          console.error('[Step0] EA_OrganizationProfileProcessor not loaded!');
          throw new Error('Organization Profile Processor module not loaded');
        }

        const result = await EA_OrganizationProfileProcessor.processOrganizationalSummary(
          raw,
          {},
          (progress) => {
            console.log('[Step0] Progress:', progress.message, progress.percent + '%');
          }
        );

        if (!result.success) {
          throw new Error(result.message || 'Organization profile processing failed');
        }

        console.log('[Step0] Profile processed. Completeness:', result.completeness + '%');
        
        return {
          profile: result.profile,
          completeness: result.completeness,
          readyForWorkflow: result.readyForWorkflow
        };
      }
    },

    // EXISTING: Standard Context Engine (for short descriptions)
    {
      taskId: 'step0_context_engine',
      title: 'Analysing company context',
      type: 'internal',
      taskType: 'lightweight',
      instructionFile: '0_1_context_engine.instruction.md',
      expectsJson: true,

      // Only run if company description is short (<= 500 chars)
      shouldRun: (ctx) => {
        const desc = ctx.companyDescription || '';
        const isQuick = desc.length <= 500;
        if (isQuick) {
          console.log('[Step0] Using quick start mode (', desc.length, 'chars)');
        }
        return isQuick;
      },

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
    // Check which mode was used
    const richProfile = ctx.answers?.step0_rich_profile;
    const quickContext = ctx.answers?.step0_context_engine;

    if (richProfile) {
      // Rich Profile mode
      console.log('[Step0] Synthesizing Rich Profile output');
      return {
        mode: 'rich',
        organizationProfile: richProfile.profile || {},
        completeness: richProfile.completeness || 0,
        readyForWorkflow: richProfile.readyForWorkflow || false
      };
    } else if (quickContext) {
      // Quick Start mode (existing behavior)
      console.log('[Step0] Synthesizing Quick Start output');
      return {
        mode: 'quick',
        contextObj: quickContext.context || {},
        stepPrompts: quickContext.step_prompts || {},
        hypothesis: quickContext.hypothesis || null
      };
    }

    // Fallback
    console.warn('[Step0] No valid output from Step0 tasks');
    return { mode: 'unknown' };
  },

  applyOutput: (output, model) => {
    if (output.mode === 'rich') {
      // Rich Profile mode: Store organization profile
      console.log('[Step0] Applying Rich Profile to model. Completeness:', output.completeness + '%');
      
      return {
        ...model,
        organizationProfile: output.organizationProfile || {},
        organizationProfileCompleteness: output.completeness || 0,
        initializationMode: 'rich'
      };
    } else if (output.mode === 'quick') {
      // Quick Start mode: Store step prompts (existing behavior)
      window._stepPrompts = output.stepPrompts || {};
      window._step1Hypothesis = output.hypothesis || null;

      return {
        ...model,
        contextObj: output.contextObj || {},
        initializationMode: 'quick'
      };
    }

    // Fallback
    return model;
  },

  onComplete: (model) => {
    const mode = model.initializationMode || 'unknown';
    console.log('[Step0] Initialization complete. Mode:', mode);

    if (mode === 'rich') {
      const completeness = model.organizationProfileCompleteness || 0;
      console.log('[Step0] Organization Profile created. Completeness:', completeness + '%');
      
      // Log warnings if any
      const warnings = model.organizationProfile?.metadata?.warnings;
      if (warnings && warnings.length > 0) {
        console.warn('[Step0] Profile warnings:', warnings);
      }
      
      // Show completeness notification
      if (completeness >= 80) {
        console.log('[Step0] ✓ Excellent profile completeness - all steps will have rich context');
      } else if (completeness >= 60) {
        console.log('[Step0] ✓ Good profile completeness - workflow can proceed with quality context');
      } else if (completeness >= 40) {
        console.warn('[Step0] ⚠ Fair completeness - some steps may generate generic output');
      } else {
        console.warn('[Step0] ⚠ Low completeness - consider adding more organizational details');
      }
      
      // Render profile in Executive Summary tab (Phase 5)
      if (typeof renderOrganizationProfile === 'function') {
        setTimeout(() => {
          renderOrganizationProfile();
          console.log('[Step0] Organization Profile rendered in Executive Summary tab');
        }, 100);
      }
    } else if (mode === 'quick') {
      console.log('[Step0] Context engine complete:', model.contextObj?.industry || 'unknown industry');
    }
  }
};
