/**
 * Step1.js — Business Context Discovery (Context Engine Workflow)
 *
 * Simplified workflow using dynamic Context Engine:
 *   Task 0: Company description input
 *   Tasks 1-5: Context Engine dynamic questions (max 5)
 *   Task 6: Synthesize Strategic Intent
 *   Task 7: Validate with user
 *
 * The model after Step1 contains:
 *   model.strategicIntent  — Strategic Intent document
 *   model.businessContext  — Structured business context
 *   model.businessContextConfirmed — Set to true after user confirms
 */

(function(global) {
  'use strict';

  const Step1 = {
    id: 'step1',
    name: 'Business Context Discovery',
    dependencies: [],

    tasks: [
      // ── Task 0: Company Description Input ────────────────────────────────
      {
        taskId: 'step1_company_description',
        title: 'Tell us about your organization',
        type: 'text-input',
        
        promptUser: () => ({
          title: 'Organization Description',
          prompt: `**Welcome to the EA Platform!**

Please provide a brief description of your organization to help us understand your context.

**What to include:**
- Organization name and industry
- What your organization does (products/services)
- Approximate size (employees, revenue range)
- Any key challenges you're facing

**Example:**
"We are Acme Manufacturing, a mid-sized industrial equipment manufacturer with 250 employees and $50M annual revenue. We produce precision tools for the automotive industry. We're facing increasing competition and need to modernize our operations."

**Minimum:** 50 characters`,
          placeholder: 'e.g., We are a mid-sized healthcare provider with 500 employees operating 3 clinics...',
          minLength: 50,
          validate: (text) => {
            if (!text || text.trim().length < 50) {
              return { 
                valid: false, 
                error: 'Please provide at least 50 characters describing your organization.' 
              };
            }
            return { valid: true };
          }
        }),
        
        parseOutput: (text) => ({ companyDescription: text.trim() }),
        
        onComplete: (output, ctx) => {
          if (!window.model) window.model = {};
          window.model.description = output.companyDescription;
          // Initialize discovery state
          window.model.discoveryState = {
            questionCount: 0,
            answers: [],
            context: null
          };
          console.log('[Step1] Company description captured');
        },
        
        wrapAnswer: (answer) => ({ companyDescription: answer.companyDescription || answer })
      },

      // ── Tasks 1-5: Context Engine Discovery Questions ────────────────────
      ...Array.from({ length: 5 }, (_, i) => ({
        taskId: `step1_discovery_q${i + 1}`,
        title: `Discovery Question ${i + 1}`,
        type: 'question',
        allowMultiple: true,
        generateQuestion: true,
        taskType: 'general',
        instructionFile: 'context_engine.instruction.md',
        expectsJson: true,

        // Skip if previous question completed discovery
        shouldRun: (ctx) => {
          const state = window.model?.discoveryState;
          if (!state) return true;  // First question always runs
          
          // Skip if context is already complete
          if (state.context && state.context.status === 'complete') {
            console.log(`[Step1] Skipping Q${i + 1} - discovery already complete`);
            return false;
          }
          
          return true;  // Continue asking questions
        },

        systemPromptFallback: `You are the Context Engine for an Enterprise Architecture platform.
Analyze the company description and previous Q&A to determine if you need more information or have enough to complete discovery.

Ask ONE focused question at a time, or signal completion with status: "complete".

Return ONLY valid JSON with either:
{ "status": "needs_more_info", "question": {...} }
OR
{ "status": "complete", "context": {...} }`,

        userPrompt: (ctx) => {
          const state = window.model?.discoveryState || {};
          const companyDesc = window.model?.description || ctx.companyDescription || '';
          const previousAnswers = state.answers || [];
          
          const qaHistory = previousAnswers.length > 0
            ? `\n\n**Previous Q&A:**\n${previousAnswers.map((qa, idx) => 
                `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer}`
              ).join('\n\n')}`
            : '';

          return `**Company Description:**
${companyDesc}
${qaHistory}

**Your Task:**
This is question ${i + 1} of maximum 5.

${i + 1 === 5 
  ? 'IMPORTANT: This is the LAST question you can ask. After this, you MUST return status: "complete" with the context.' 
  : 'Either ask the NEXT most important discovery question, OR signal completion if you have enough information.'
}

**What you need:**
- Industry classification and strategic posture
- Primary business objectives/drivers
- Key success metrics (at least 2-3)
- Major constraints (financial, technical, organizational, regulatory)

**Return JSON format:**
If more info needed:
{
  "status": "needs_more_info",
  "question": {
    "text": "Specific question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "guidance": "Helper text",
    "questionNumber": ${i + 1}
  }
}

If you have enough:
{
  "status": "complete",
  "context": {
    "industry": "...",
    "strategic_posture": "...",
    "transformation_readiness": "...",
    "digital_maturity": 3,
    "regulatory_flags": [],
    "assumed_pain_points": [],
    "architecture_archetype": "...",
    "constraints": [{type, description}],
    "measurableKPIs": [{metric, target, timeframe}]
  }
}`;
        },

        outputSchema: { 
          status: 'string',
          question: { text: 'string', options: ['string'], guidance: 'string?', questionNumber: 'number' },
          context: 'object?'
        },
        
        parseOutput: (raw) => {
          const parsed = OutputValidator.parseJSON(raw, `step1_discovery_q${i + 1}`);
          
          // Store discovery result in model
          const state = window.model.discoveryState;
          
          if (parsed.status === 'complete') {
            state.context = parsed.context;
            state.complete = true;
            console.log(`[Step1] Discovery complete at Q${i + 1}`);
          }
          
          return parsed;
        },

        // If AI asks a question, show it to user
        wrapAnswer: (answer, ctx) => {
          const state = window.model.discoveryState;
          const aiResponse = ctx.answers?.[`step1_discovery_q${i + 1}`];
          
          if (aiResponse && aiResponse.question) {
            // Store the Q&A pair
            state.questionCount++;
            state.answers.push({
              questionNumber: i + 1,
              question: aiResponse.question.text,
              answer: answer
            });
          }
          
          return { [`q${i + 1}_answer`]: answer };
        }
      })),

      // ── Task 6: Synthesize Strategic Intent ──────────────────────────────
      {
        taskId: 'step1_synthesize',
        title: 'Synthesizing Strategic Intent',
        type: 'internal',
        taskType: 'heavy',
        expectsJson: true,

        systemPromptFallback: () => {
          return `You are a senior enterprise strategy advisor.

Transform the discovery context and Q&A into a structured Strategic Intent document.

Return ONLY valid JSON with this structure:
{
  "org_name": "string",
  "industry": "string",
  "strategicVision": {
    "ambition": "2-3 sentence executive summary",
    "themes": ["theme 1", "theme 2", "theme 3"],
    "timeframe": "3-5 years"
  },
  "situation_narrative": "2-3 sentences on current state",
  "successMetrics": [
    {"metric": "...", "target": "...", "timeframe": "..."}
  ],
  "constraints": [
    {"type": "Operational|Financial|Organisational|Technical|External", "description": "..."}
  ],
  "investigation_scope": ["scope item 1", "scope item 2"],
  "expected_outcomes": ["outcome 1", "outcome 2", "outcome 3"],
  "burning_platform": "Why act now?"
}

Quality rules:
- Strategic ambition must be specific, not generic
- Themes must be action-oriented (3-4 themes)
- All metrics must have baseline, target, and timeframe
- Constraints must be specific (exactly 5, one per type)
- Use industry-specific language`;
        },

        userPrompt: (ctx) => {
          const state = window.model?.discoveryState || {};
          const companyDesc = window.model?.description || '';
          const context = state.context || {};
          const qaHistory = (state.answers || [])
            .map(qa => `**${qa.question}**\n${Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer}`)
            .join('\n\n');

          return `**Company Description:**
${companyDesc}

**Discovery Context:**
Industry: ${context.industry || 'Unknown'}
Strategic Posture: ${context.strategic_posture || 'Unknown'}
Digital Maturity: ${context.digital_maturity || 'Unknown'}/5
Architecture Archetype: ${context.architecture_archetype || 'Unknown'}

**Pain Points:** ${(context.assumed_pain_points || []).join(', ')}
**Regulatory Flags:** ${(context.regulatory_flags || []).join(', ')}

**Q&A History:**
${qaHistory}

**Constraints:**
${(context.constraints || []).map(c => `- ${c.type}: ${c.description}`).join('\n')}

**KPIs:**
${(context.measurableKPIs || []).map(k => `- ${k.metric}: ${k.target} (${k.timeframe})`).join('\n')}

Generate a comprehensive Strategic Intent document from this information.`;
        },

        outputSchema: {
          strategicVision: {
            ambition: 'string',
            themes: ['string'],
            timeframe: 'string'
          },
          successMetrics: [{ metric: 'string', target: 'string', timeframe: 'string' }],
          constraints: [{ type: 'string', description: 'string' }],
          situation_narrative: 'string',
          expected_outcomes: ['string']
        },

        parseOutput: (raw) => {
          const parsed = OutputValidator.parseJSON(raw, 'step1_synthesize');
          
          // Store in model
          if (window.model) {
            window.model.strategicIntent = parsed;
            window.model.businessContext = {
              ...window.model.discoveryState?.context,
              strategicVision: parsed.strategicVision,
              successMetrics: parsed.successMetrics,
              constraints: parsed.constraints,
              situation_narrative: parsed.situation_narrative,
              expected_outcomes: parsed.expected_outcomes,
              burning_platform: parsed.burning_platform,
              generated_at: Date.now()
            };
          }
          
          return parsed;
        }
      },

      // ── Task 7: Validation ───────────────────────────────────────────────
      {
        taskId: 'step1_validate',
        title: 'Review Strategic Intent',
        type: 'question',
        allowSkip: false,
        generateQuestion: false,

        promptUser: (ctx) => {
          const si = window.model?.strategicIntent || {};
          const themes = (si.strategicVision?.themes || []).map(t => `• ${t}`).join('\n');
          const metrics = (si.successMetrics || []).slice(0, 3).map(m => 
            `• ${m.metric}: ${m.target} ${m.timeframe}`
          ).join('\n');
          
          return {
            question: `✅ **Strategic Intent drafted**

**Strategic Ambition:**
${si.strategicVision?.ambition || '[not generated]'}

**Strategic Themes:**
${themes}

**Key Success Metrics:**
${metrics}

Does this capture your strategic direction? Type "confirm" to proceed, or describe any adjustments needed.`,
            options: ['Confirm and continue', 'Needs adjustment']
          };
        },

        wrapAnswer: (answer) => {
          const confirmed = /confirm|approve|yes|ja|ok|good|correct|continue/i.test(answer);
          
          if (confirmed && window.model) {
            window.model.businessContextConfirmed = true;
            window.model.strategicIntentConfirmed = true;
          }
          
          return { validation: answer, confirmed };
        }
      }
    ]
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EXPORTS
  // ═══════════════════════════════════════════════════════════════════════

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Step1;
  } else {
    global.Step1 = Step1;
  }

})(typeof window !== 'undefined' ? window : global);
