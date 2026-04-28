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
        
        // NOTE: web_search tool removed - incompatible with JSON mode in Responses API
        // These questions are about user's specific company (not public info)

        // Skip if previous question completed discovery
        shouldRun: (ctx) => {
          const state = window.model?.discoveryState;
          if (!state) return true;  // First question always runs
          
          // Skip if discovery is already complete
          if (state.complete) {
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
        
        parseOutput: (raw) => {
          const parsed = OutputValidator.parseJSON(raw, `step1_discovery_q${i + 1}`);
          
          // Validate that we have a status field
          if (!parsed || !parsed.status) {
            console.error(`[Step1] AI response missing 'status' field:`, parsed);
            throw new Error(`Context Engine must return a 'status' field (either 'needs_more_info' or 'complete')`);
          }
          
          // Ensure discoveryState exists (defensive initialization)
          if (!window.model) window.model = {};
          if (!window.model.discoveryState) {
            console.warn('[Step1] discoveryState not initialized - creating now');
            window.model.discoveryState = {
              questionCount: 0,
              answers: [],
              context: null
            };
          }
          
          // Store discovery result in model
          const state = window.model.discoveryState;
          
          if (parsed.status === 'complete') {
            if (!parsed.context) {
              console.error(`[Step1] AI signaled complete but missing context:`, parsed);
              throw new Error(`Context Engine signaled 'complete' but did not provide context object`);
            }
            state.context = parsed.context;
            state.complete = true;
            console.log(`[Step1] Discovery complete at Q${i + 1}`);
            // Return null to skip question display
            return null;
          }
          
          // Validate and flatten nested question structure for StepEngine
          if (parsed.status === 'needs_more_info') {
            if (!parsed.question || typeof parsed.question !== 'object') {
              console.error(`[Step1] AI needs more info but missing question object:`, parsed);
              throw new Error(`Context Engine needs_more_info but did not provide a question object`);
            }
            
            if (!parsed.question.text || !Array.isArray(parsed.question.options)) {
              console.error(`[Step1] Question object missing text or options:`, parsed.question);
              throw new Error(`Question must have 'text' (string) and 'options' (array) fields`);
            }
            
            return {
              question: parsed.question.text,
              options: parsed.question.options,
              guidance: parsed.question.guidance || '',
              questionNumber: parsed.question.questionNumber || (i + 1)
            };
          }
          
          // Unknown status
          console.error(`[Step1] Unknown status from AI:`, parsed.status);
          throw new Error(`Context Engine returned unknown status: "${parsed.status}" (expected 'needs_more_info' or 'complete')`);
        },

        // If AI asks a question, show it to user
        wrapAnswer: (answer, ctx) => {
          // Ensure discoveryState exists
          if (!window.model) window.model = {};
          if (!window.model.discoveryState) {
            window.model.discoveryState = {
              questionCount: 0,
              answers: [],
              context: null
            };
          }
          
          const state = window.model.discoveryState;
          const aiResponse = ctx.answers?.[`step1_discovery_q${i + 1}`];
          
          // After parseOutput, question is a string (not an object)
          if (aiResponse && aiResponse.question) {
            // Store the Q&A pair
            state.questionCount++;
            state.answers.push({
              questionNumber: i + 1,
              question: aiResponse.question,  // Already a string after flattening
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
          org_name: 'string',
          industry: 'string',
          strategicVision: {
            ambition: 'string',
            themes: ['string'],
            timeframe: 'string'
          },
          situation_narrative: 'string',
          successMetrics: [{ metric: 'string', target: 'string', timeframe: 'string' }],
          constraints: [{ type: 'string', description: 'string' }],
          investigation_scope: ['string'],
          expected_outcomes: ['string'],
          burning_platform: 'string'
        },

        parseOutput: (raw) => {
          const parsed = OutputValidator.parseJSON(raw, 'step1_synthesize');
          
          // Helper: Infer category from metric name
          const inferCategory = (metricName) => {
            const lower = metricName.toLowerCase();
            if (/cost|expense|saving|efficiency|productivity|automation/.test(lower)) return 'Efficiency';
            if (/revenue|growth|market|customer|sales|expansion/.test(lower)) return 'Growth';
            if (/risk|compliance|security|quality|reliability|governance/.test(lower)) return 'Risk';
            if (/innovation|digital|transformation|technology|modernization/.test(lower)) return 'Innovation';
            return 'Strategic';
          };
          
          // Store in model
          if (window.model) {
            window.model.strategicIntent = parsed;
            window.model.businessContext = {
              org_name: parsed.org_name || 'Organization',
              industry: parsed.industry || 'Unknown',
              market_summary: parsed.situation_narrative || '',
              strategicVision: parsed.strategicVision,
              successMetrics: parsed.successMetrics,
              constraints: (parsed.constraints || []).map(c => 
                typeof c === 'string' ? c : `${c.type}: ${c.description}`
              ),
              situation_narrative: parsed.situation_narrative,
              expected_outcomes: Array.isArray(parsed.expected_outcomes) ? parsed.expected_outcomes : [],
              investigation_scope: parsed.investigation_scope || [],
              burning_platform: parsed.burning_platform || '',
              generated_at: Date.now(),
              instruction_version: 'context-engine-v1'
            };
            
            // Transform successMetrics → businessObjectives
            window.model.businessObjectives = (parsed.successMetrics || []).map((metric, idx) => ({
              id: `obj_${Date.now()}_${idx}`,
              title: metric.metric,
              description: `Achieve ${metric.target} by ${metric.timeframe}`,
              category: inferCategory(metric.metric),
              kpi: metric.metric,
              target_value: metric.target,
              time_horizon: metric.timeframe,
              priority: idx < 2 ? 'High' : idx < 4 ? 'Medium' : 'Low',
              rationale: parsed.burning_platform || parsed.situation_narrative || '',
              linked_themes: parsed.strategicVision?.themes || []
            }));
            
            // Transform strategicVision.themes → strategicThemes objects
            window.model.strategicThemes = (parsed.strategicVision?.themes || []).map((theme, idx) => ({
              id: `theme_${Date.now()}_${idx}`,
              name: theme,
              description: `Strategic theme: ${theme}`,
              rationale: parsed.burning_platform || 'Supports strategic transformation'
            }));
            
            // Initialize empty gap insights (can be populated later by AI analysis)
            window.model.gapInsights = [];
            
            console.log(`[Step1] Generated ${window.model.businessObjectives.length} business objectives from success metrics`);
            console.log(`[Step1] Generated ${window.model.strategicThemes.length} strategic themes`);
            console.log('[Step1] Data stored in window.model:', {
              hasBusinessContext: !!window.model.businessContext,
              orgName: window.model.businessContext?.org_name,
              industry: window.model.businessContext?.industry,
              objectivesCount: window.model.businessObjectives?.length,
              themesCount: window.model.strategicThemes?.length,
              constraintsCount: window.model.businessContext?.constraints?.length
            });
          }
          
          // CRITICAL: Return enriched data so StepEngine preserves it in workingModel
          // (auto-save overwrites window.model with workingModel, so we need data in both places)
          return {
            ...parsed,
            _enrichment: {
              businessContext: window.model.businessContext,
              businessObjectives: window.model.businessObjectives,
              strategicThemes: window.model.strategicThemes,
              gapInsights: window.model.gapInsights
            }
          };
        }
      },

      // ── Task 7: Validation ───────────────────────────────────────────────
      {
        taskId: 'step1_validate',
        title: 'Review Strategic Intent',
        type: 'question',
        allowSkip: false,
        generateQuestion: false,

        question: (ctx) => {
          const si = window.model?.strategicIntent || {};
          const themes = (si.strategicVision?.themes || []).map(t => `• ${t}`).join('\n');
          const metrics = (si.successMetrics || []).slice(0, 3).map(m => 
            `• ${m.metric}: ${m.target} ${m.timeframe}`
          ).join('\n');
          
          return `✅ **Strategic Intent drafted**

**Strategic Ambition:**
${si.strategicVision?.ambition || '[not generated]'}

**Strategic Themes:**
${themes}

**Key Success Metrics:**
${metrics}

Does this capture your strategic direction? Type "confirm" to proceed, or describe any adjustments needed.`;
        },
        
        options: (ctx) => {
          return ['Confirm and continue', 'Needs adjustment'];
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
  // STEP-LEVEL FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Synthesize final output after all tasks complete
   * @param {object} ctx - Context object with all task answers
   * @returns {object} - Final Strategic Intent output (includes _enrichment)
   */
  Step1.synthesize = (ctx) => {
    // All synthesis work is done in task parseOutput functions
    // Strategic Intent is already stored in window.model.strategicIntent
    // Return it with _enrichment data preserved from ctx.answers
    const taskOutput = ctx.answers?.step1_synthesize || {};
    
    console.log('[Step1.synthesize] Passing through data:', {
      hasEnrichment: !!taskOutput._enrichment,
      enrichmentObjectivesCount: taskOutput._enrichment?.businessObjectives?.length || 0,
      enrichmentThemesCount: taskOutput._enrichment?.strategicThemes?.length || 0
    });
    
    return taskOutput.org_name ? taskOutput : (window.model?.strategicIntent || {});
  };

  /**
   * Apply synthesized output to model
   * @param {object} output - Synthesized Strategic Intent (includes _enrichment)
   * @param {object} model - Current model state (may be stale)
   * @returns {object} - Updated model
   */
  Step1.applyOutput = (output, model) => {
    // CRITICAL: Read from _enrichment first (survives auto-save), fallback to window.model
    const enrichment = output._enrichment || {};
    const freshBusinessContext = enrichment.businessContext || window.model?.businessContext || {};
    const freshBusinessObjectives = enrichment.businessObjectives || window.model?.businessObjectives || [];
    const freshStrategicThemes = enrichment.strategicThemes || window.model?.strategicThemes || [];
    const freshGapInsights = enrichment.gapInsights || window.model?.gapInsights || [];
    
    console.log('[Step1.applyOutput] Reading data from _enrichment + window.model:', {
      source: enrichment.businessContext ? '_enrichment' : 'window.model',
      businessContext: !!freshBusinessContext.org_name,
      objectivesCount: freshBusinessObjectives.length,
      themesCount: freshStrategicThemes.length,
      gapInsightsCount: freshGapInsights.length
    });
    
    // Remove _enrichment from output before storing (internal use only)
    const { _enrichment, ...cleanOutput } = output;
    
    return {
      ...model,  // Spread old model for other properties
      strategicIntent: cleanOutput,
      businessContext: freshBusinessContext,
      businessObjectives: freshBusinessObjectives,
      strategicThemes: freshStrategicThemes,
      gapInsights: freshGapInsights,
      businessContextConfirmed: true,
      strategicIntentConfirmed: true
    };
  };

  /**
   * Post-completion callback
   * @param {object} model - Final model state
   */
  Step1.onComplete = (model) => {
    console.log('[Step1.onComplete] Starting post-completion tasks with model:', {
      hasBusinessContext: !!model.businessContext,
      hasStrategicIntent: !!model.strategicIntent,
      objectivesCount: model.businessObjectives?.length,
      themesCount: model.strategicThemes?.length
    });
    
    // Render Business Context section
    if (typeof renderBusinessContextSection === 'function') {
      console.log('[Step1.onComplete] Calling renderBusinessContextSection()');
      renderBusinessContextSection();
    } else if (typeof renderStrategicIntentSection === 'function') {
      console.log('[Step1.onComplete] Fallback: Calling renderStrategicIntentSection()');
      renderStrategicIntentSection();
    } else {
      console.error('[Step1.onComplete] ERROR: No render function available!');
    }
    
    // Update UI
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1]);
    if (typeof showTab === 'function' && typeof findTabButton === 'function') {
      showTab('exec', findTabButton('exec'));
    }
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step1');
    if (typeof toast === 'function') toast('Strategic Intent confirmed ✓');

    // Post-completion chat message
    const si = model.strategicIntent || {};
    if (typeof addAssistantMessage === 'function') {
      const themes = (si.strategicVision?.themes || []).slice(0, 3).join(' · ');
      const ambition = si.strategicVision?.ambition || '';
      
      addAssistantMessage(
        `**Step 1 — Business Context complete** ✓\n\n` +
        `**Strategic Ambition:** ${ambition || 'Defined'}\n` +
        `**Key Themes:** ${themes || 'Defined'}\n` +
        `**Business Objectives:** ${(model.businessObjectives || []).length} objectives\n\n` +
        `Review the full document in the **Executive** tab.\n\n` +
        `**Next:** Ready to map your capabilities with APQC framework? Click below or use the **Continue** button in the sidebar.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step2', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 2: Capability Mapping\n` +
        `</button>`
      );
    }
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
