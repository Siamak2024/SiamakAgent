/**
 * Step1.js — Business Context Discovery (Context Engine Workflow)
 * VERSION: Evidence-Based-Validation-v2.3 (May 2026)
 * LAST MODIFIED: 2026-05-12 17:15 (FIXED OUTPUT FORMAT)
 *
 * Simplified workflow using dynamic Context Engine:
 *   Task 0: Company description input
 *   Tasks 1-5: Context Engine dynamic questions (max 5)
 *   Task 6: Validate with user
 *
 * NO SYNTHESIS STEP - validated objectives are transformed directly into businessObjectives
 *
 * The model after Step1 contains:
 *   model.businessObjectives  — Business objectives with validation metadata
 *   model.businessContext  — Structured business context
 *   model.businessContextConfirmed — Set to true after user confirms
 */

(function(global) {
  'use strict';

  // Version check log (helps verify fresh code is loaded)
  console.log('%c[Step1.js] 📦 Module loaded', 'color: #8b5cf6; font-weight: bold');
  console.log('[Step1.js] Version: V11-Evidence-Based-Validation (May 2026)');

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
          
          // CRITICAL: Clear any old cached discovery data to prevent using stale format
          delete window.model.discoveryState;
          delete window.model.businessObjectives;
          delete window.model.businessContext;
          delete window.model.validationMetrics;
          delete window.model.strategicIntent;
          
          // Clear instruction file cache to ensure fresh Context Engine instruction is loaded
          if (typeof PromptBuilder !== 'undefined' && PromptBuilder.clearCache) {
            PromptBuilder.clearCache('step1', 'context_engine_v2.instruction.md');
          }
          
          // Reset AI conversation to prevent old format pattern learning
          delete window._stepEngineResponseId;
          
          // Initialize fresh discovery state
          window.model.discoveryState = {
            questionCount: 0,
            answers: [],
            context: null,
            complete: false,
            validationHistory: []
          };
          console.log('[Step1] ✅ Company description captured');
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
        instructionFile: 'context_engine_v2.instruction.md',
        expectsJson: true,
        
        // NOTE: web_search tool removed - incompatible with JSON mode in Responses API
        // These questions are about user's specific company (not public info)

        // Skip if previous question completed discovery
        shouldRun: (ctx) => {
          const state = window.model?.discoveryState;
          
          console.log(`[Step1] 🔍 shouldRun check for Q${i + 1}:`, {
            hasState: !!state,
            isComplete: state?.complete,
            questionCount: state?.questionCount || 0
          });
          
          if (!state) {
            console.log(`[Step1] ✅ Q${i + 1} will run (no state yet)`);
            return true;  // First question always runs
          }
          
          // Skip if discovery is already complete
          if (state.complete) {
            console.log(`[Step1] ⏭️  Skipping Q${i + 1} - discovery already complete`);
            return false;
          }
          
          console.log(`[Step1] ✅ Q${i + 1} will run`);
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
          // Clear instruction cache to ensure fresh instruction is loaded
          if (typeof PromptBuilder !== 'undefined' && PromptBuilder.clearCache) {
            PromptBuilder.clearCache('step1', 'context_engine_v2.instruction.md');
          }
          
          const state = window.model?.discoveryState || {};
          const companyDesc = window.model?.description || ctx.companyDescription || '';
          const previousAnswers = state.answers || [];
          
          // Reset conversation chain before Q5 to prevent old format pattern inheritance
          if (i + 1 === 5 && window._stepEngineResponseId) {
            delete window._stepEngineResponseId;
          }
          
          console.log(`[Step1] 🤔 Preparing discovery Q${i + 1}:`, {
            previousQuestionsCount: previousAnswers.length,
            discoveryComplete: state.complete,
            hasContext: !!state.context
          });
          
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
          
          console.log(`[Step1] 📩 AI response for Q${i + 1}:`, {
            status: parsed?.status,
            hasQuestion: !!parsed?.question,
            hasContext: !!parsed?.context,
            validatedObjectives: parsed?.context?.validated_objectives?.length || 0,
            workingHypotheses: parsed?.context?.working_hypotheses?.length || 0
          });
          
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
              context: null,
              validationHistory: []  // NEW: Track validation across questions
            };
          }
          
          // Store discovery result in model
          const state = window.model.discoveryState;
          
          if (parsed.status === 'complete') {
            if (!parsed.context) {
              console.error(`[Step1] AI signaled complete but missing context:`, parsed);
              throw new Error(`Context Engine signaled 'complete' but did not provide context object`);
            }
            
            // DEBUG: Log ALL context fields to see what AI actually returned
            console.log('[Step1] 🔍 DEBUG: AI returned context with fields:', Object.keys(parsed.context));
            console.log('[Step1] 🔍 DEBUG: Full context object:', JSON.stringify(parsed.context, null, 2));
            
            // CRITICAL: Check if this is old cached data (missing validated_objectives structure)
            const hasNewFormat = parsed.context.hasOwnProperty('validated_objectives') || 
                                parsed.context.hasOwnProperty('working_hypotheses');
            
            if (!hasNewFormat) {
              console.error(`[Step1] ⚠️ Discovery context missing validated_objectives structure - likely old cached data:`, parsed.context);
              console.error(`%c🔧 FIX: Run this in console: clearInstructionCache()`, 'color: #ff6b6b; font-weight: bold; font-size: 14px');
              console.error(`[Step1] Then hard refresh browser (Ctrl+Shift+R) and restart Step 1`);
              throw new Error(`Discovery context has old format.\n\n` +
                `FIX:\n` +
                `1. Open browser console (F12)\n` +
                `2. Run: clearInstructionCache()\n` +
                `3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)\n` +
                `4. Restart Step 1\n\n` +
                `This clears cached instruction files.`);
            }
            
            // Log validation quality metrics
            const validatedCount = (parsed.context.validated_objectives || []).length;
            const hypothesisCount = (parsed.context.working_hypotheses || []).length;
            const evidenceGapsCount = (parsed.context.evidence_gaps || []).length;
            
            // Require at least 2 validated objectives (per Context Engine completion policy)
            if (validatedCount < 2 && hypothesisCount === 0) {
              console.error(`[Step1] ⚠️ Discovery completed but has insufficient validated objectives:`, {
                validated: validatedCount,
                hypotheses: hypothesisCount,
                context: parsed.context
              });
              throw new Error(`Discovery requires at least 2 validated objectives or hypotheses. Got ${validatedCount} validated, ${hypothesisCount} hypotheses. This indicates the Context Engine completed prematurely.`);
            }
            
            state.context = parsed.context;
            state.complete = true;
            
            console.log(`[Step1] ✅ Discovery complete at Q${i + 1}:`);
            console.log(`  - Validated objectives: ${validatedCount}`);
            console.log(`  - Working hypotheses: ${hypothesisCount}`);
            console.log(`  - Evidence gaps: ${evidenceGapsCount}`);
            
            // NEW: Directly transform validated objectives into businessObjectives (NO SYNTHESIS STEP)
            Step1._transformDiscoveryToBusinessObjectives(parsed.context);
            
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
            
            // NEW: Store validation snapshot for this question
            if (parsed.validation) {
              state.validationHistory.push({
                questionNumber: i + 1,
                supportedFacts: parsed.validation.supportedFacts || [],
                userInferences: parsed.validation.userInferences || [],
                evidenceGaps: parsed.validation.evidenceGaps || []
              });
              console.log(`[Step1] Validation @ Q${i + 1}:`, {
                facts: parsed.validation.supportedFacts?.length || 0,
                inferences: parsed.validation.userInferences?.length || 0,
                gaps: parsed.validation.evidenceGaps?.length || 0
              });
            }
            
            return {
              question: parsed.question.text,
              options: parsed.question.options,
              guidance: parsed.question.guidance || '',
              questionNumber: parsed.question.questionNumber || (i + 1),
              validation: parsed.validation  // NEW: Pass validation to context
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

      // ── Task 6: Validation ───────────────────────────────────────────────
      {
        taskId: 'step1_validate',
        title: 'Review Business Objectives',
        type: 'question',
        allowSkip: false,
        generateQuestion: false,

        question: (ctx) => {
          const context = window.model?.discoveryState?.context || {};
          const validatedObjectives = context.validated_objectives || [];
          const workingHypotheses = context.working_hypotheses || [];
          const evidenceGaps = context.evidence_gaps || [];
          const businessObjectives = window.model?.businessObjectives || [];
          
          const objectivesList = businessObjectives.slice(0, 5).map(obj => {
            const statusIcon = obj.validation_status === 'validated' ? '✅' : obj.validation_status === 'hypothesis' ? '🔬' : '❓';
            return `${statusIcon} **${obj.title}**\n  - Target: ${obj.target_value}\n  - Timeframe: ${obj.time_horizon}\n  - Validation: ${obj.validation_status}`;
          }).join('\n\n');
          
          const metrics = [
            `Total objectives: ${businessObjectives.length}`,
            `Validated: ${validatedObjectives.length}`,
            `Hypotheses: ${workingHypotheses.length}`,
            `Evidence gaps: ${evidenceGaps.length}`
          ].join(' | ');
          
          return `✅ **Discovery Complete - Business Objectives Generated**

**Quality Metrics:**
${metrics}

**Key Objectives:**
${objectivesList}

${businessObjectives.length > 5 ? `\n_...and ${businessObjectives.length - 5} more objectives_` : ''}

${evidenceGaps.length > 0 ? `\n⚠️ **Evidence Gaps Identified:**\n${evidenceGaps.slice(0, 3).map(g => `- ${g}`).join('\n')}${evidenceGaps.length > 3 ? `\n_...and ${evidenceGaps.length - 3} more gaps_` : ''}` : ''}

Does this capture your business objectives? Type "confirm" to proceed, or describe any adjustments needed.`;
        },
        
        options: (ctx) => {
          return ['Confirm and continue', 'Needs adjustment'];
        },

        wrapAnswer: (answer) => {
          const confirmed = /confirm|approve|yes|ja|ok|good|correct|continue/i.test(answer);
          
          if (confirmed && window.model) {
            window.model.businessContextConfirmed = true;
          }
          
          return { validation: answer, confirmed };
        }
      }
    ]
  };

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Transform discovery context directly into business objectives (NO AI SYNTHESIS)
   * Called when discovery completes with status === 'complete'
   * @param {object} context - Discovery context with validated_objectives, working_hypotheses, etc.
   */
  Step1._transformDiscoveryToBusinessObjectives = function(context) {
    console.log('[Step1] 🔧 Transforming discovery data to business objectives (no AI synthesis)');
    console.log('[Step1] Discovery context keys:', Object.keys(context));
    
    // Helper: Infer category from objective text
    const inferCategory = (text) => {
      const lower = text.toLowerCase();
      if (/cost|expense|saving|efficiency|productivity|automation/.test(lower)) return 'Efficiency';
      if (/revenue|growth|market|customer|sales|expansion/.test(lower)) return 'Growth';
      if (/risk|compliance|security|quality|reliability|governance/.test(lower)) return 'Risk';
      if (/innovation|digital|transformation|technology|modernization/.test(lower)) return 'Innovation';
      return 'Strategic';
    };
    
    const validatedObjectives = context.validated_objectives || [];
    const workingHypotheses = context.working_hypotheses || [];
    const evidenceGaps = context.evidence_gaps || [];
    const measurableKPIs = context.measurableKPIs || [];
    
    console.log('[Step1] Source data counts:', {
      validated: validatedObjectives.length,
      hypotheses: workingHypotheses.length,
      gaps: evidenceGaps.length,
      kpis: measurableKPIs.length
    });
    
    const allObjectives = [];
    
    // 1. Transform validated objectives
    validatedObjectives.forEach((vObj, idx) => {
      // Try to match with measurableKPIs to get target/timeframe
      const matchingKPI = measurableKPIs.find(kpi => 
        kpi.metric.toLowerCase().includes(vObj.objective.toLowerCase()) ||
        vObj.objective.toLowerCase().includes(kpi.metric.toLowerCase())
      );
      
      allObjectives.push({
        id: `obj_validated_${Date.now()}_${idx}`,
        title: vObj.objective,
        description: vObj.objective,
        category: inferCategory(vObj.objective),
        kpi: matchingKPI?.metric || vObj.objective,
        target_value: matchingKPI?.target || '[To be defined]',
        time_horizon: matchingKPI?.timeframe || '[To be determined]',
        priority: idx < 2 ? 'High' : 'Medium',
        rationale: `Validated objective from discovery`,
        linked_themes: [],
        // VALIDATION METADATA
        validation_status: 'validated',
        evidence_source: vObj.source || 'User confirmed',
        evidence_strength: vObj.strength || 'medium',
        evidence_gap: null
      });
    });
    
    // 2. Transform working hypotheses
    workingHypotheses.forEach((wh, idx) => {
      allObjectives.push({
        id: `obj_hypothesis_${Date.now()}_${idx}`,
        title: wh.hypothesis,
        description: `${wh.hypothesis} (Working hypothesis - requires validation)`,
        category: inferCategory(wh.hypothesis),
        kpi: wh.hypothesis,
        target_value: '[To be validated]',
        time_horizon: '[To be validated]',
        priority: 'Medium',
        rationale: `Hypothesis: ${wh.gap || 'Needs validation'}`,
        linked_themes: [],
        // VALIDATION METADATA
        validation_status: 'hypothesis',
        evidence_source: null,
        evidence_strength: 'unsupported',
        evidence_gap: wh.gap || 'Evidence not provided'
      });
    });
    
    // 3. Add any remaining KPIs that weren't matched to validated objectives
    // IMPORTANT: Only add KPIs if they have clean data (no invented baselines like "current 2026 level")
    measurableKPIs.forEach((kpi, idx) => {
      const alreadyExists = allObjectives.some(obj => 
        obj.kpi.toLowerCase().includes(kpi.metric.toLowerCase()) ||
        kpi.metric.toLowerCase().includes(obj.kpi.toLowerCase())
      );
      
      if (!alreadyExists) {
        // Check if KPI has invented baseline text (old format)
        const hasInventedData = /baseline.*current.*to be confirmed|baseline.*2026 level/i.test(kpi.target || '') ||
                               /baseline.*current.*to be confirmed|baseline.*2026 level/i.test(kpi.metric || '');
        
        if (hasInventedData) {
          console.warn(`[Step1] ⚠️ Skipping KPI with invented baseline data: ${kpi.metric}`);
          // Add as hypothesis instead with clean placeholders
          allObjectives.push({
            id: `obj_kpi_cleaned_${Date.now()}_${idx}`,
            title: kpi.metric,
            description: `${kpi.metric} (Target and baseline to be validated)`,
            category: inferCategory(kpi.metric),
            kpi: kpi.metric,
            target_value: '[To be defined]',
            time_horizon: '[To be determined]',
            priority: 'Medium',
            rationale: 'KPI from discovery - baseline and target require validation',
            linked_themes: [],
            // VALIDATION METADATA
            validation_status: 'hypothesis',
            evidence_source: null,
            evidence_strength: 'unsupported',
            evidence_gap: 'Baseline and target not explicitly provided'
          });
        } else {
          // Clean KPI data - use as-is
          const validationStatus = kpi.validation_status || 'unknown';
          allObjectives.push({
            id: `obj_kpi_${Date.now()}_${idx}`,
            title: kpi.metric,
            description: `${kpi.metric}: ${kpi.target} by ${kpi.timeframe}`,
            category: inferCategory(kpi.metric),
            kpi: kpi.metric,
            target_value: kpi.target || '[To be defined]',
            time_horizon: kpi.timeframe || '[To be determined]',
            priority: 'Medium',
            rationale: 'KPI from discovery',
            linked_themes: [],
            // VALIDATION METADATA
            validation_status: validationStatus,
            evidence_source: validationStatus === 'validated' ? 'User confirmed' : null,
            evidence_strength: validationStatus === 'validated' ? 'medium' : 'unsupported',
            evidence_gap: validationStatus === 'validated' ? null : 'Not explicitly validated'
          });
        }
      }
    });
    
    // Store in window.model
    if (!window.model) window.model = {};
    
    window.model.businessObjectives = allObjectives;
    
    // Create business context from discovery data
    window.model.businessContext = {
      org_name: window.model.description?.split(',')[0] || 'Organization',
      industry: context.industry || 'Unknown',
      market_summary: `${context.strategic_posture || 'Unknown'} posture with digital maturity ${context.digital_maturity || 0}/5`,
      constraints: (context.constraints || []).map(c => 
        typeof c === 'string' ? c : `${c.type}: ${c.description}`
      ),
      generated_at: Date.now(),
      instruction_version: 'context-engine-v2-direct-transform',
      evidence_gaps: evidenceGaps
    };
    
    // Store evidence gaps as gap insights
    window.model.gapInsights = evidenceGaps.map((gap, idx) => ({
      id: `gap_${Date.now()}_${idx}`,
      type: 'Evidence Gap',
      description: gap,
      severity: 'Medium',
      recommendation: 'Validate with stakeholders or gather supporting documentation'
    }));
    
    // Calculate validation metrics
    const validatedCount = allObjectives.filter(o => o.validation_status === 'validated').length;
    const hypothesisCount = allObjectives.filter(o => o.validation_status === 'hypothesis').length;
    const unknownCount = allObjectives.filter(o => o.validation_status === 'unknown').length;
    const strongSources = allObjectives.filter(o => o.evidence_strength === 'strong').length;
    const mediumSources = allObjectives.filter(o => o.evidence_strength === 'medium').length;
    const weakSources = allObjectives.filter(o => o.evidence_strength === 'weak' || o.evidence_strength === 'unsupported').length;
    
    window.model.validationMetrics = {
      validated_count: validatedCount,
      hypothesis_count: hypothesisCount,
      unknown_count: unknownCount,
      strong_sources: strongSources,
      medium_sources: mediumSources,
      weak_sources: weakSources,
      gaps_count: evidenceGaps.length,
      total_objectives: allObjectives.length,
      validation_quality_score: allObjectives.length > 0 
        ? Math.round((validatedCount / allObjectives.length) * 100) 
        : 0
    };
    
    console.log(`[Step1] ✅ Generated ${allObjectives.length} business objectives:`);
    console.log(`  - Validated: ${validatedCount}`);
    console.log(`  - Hypotheses: ${hypothesisCount}`);
    console.log(`  - Unknown: ${unknownCount}`);
    console.log(`[Step1] Evidence strength:`);
    console.log(`  - Strong: ${strongSources} | Medium: ${mediumSources} | Weak/Unsupported: ${weakSources}`);
    console.log(`[Step1] Evidence gaps: ${evidenceGaps.length}`);
    console.log(`[Step1] Validation quality score: ${window.model.validationMetrics.validation_quality_score}%`);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // STEP-LEVEL FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Synthesize final output after all tasks complete
   * @param {object} ctx - Context object with all task answers
   * @returns {object} - Final output with business objectives
   */
  Step1.synthesize = (ctx) => {
    // No synthesis needed - data was transformed during discovery
    // Return validation metrics and business objectives
    return {
      businessObjectives: window.model?.businessObjectives || [],
      businessContext: window.model?.businessContext || {},
      validationMetrics: window.model?.validationMetrics || {},
      gapInsights: window.model?.gapInsights || []
    };
  };

  /**
   * Apply synthesized output to model
   * @param {object} output - Output from synthesize
   * @param {object} model - Current model state
   * @returns {object} - Updated model
   */
  Step1.applyOutput = (output, model) => {
    // Data is already in window.model from _transformDiscoveryToBusinessObjectives
    // Just confirm it's set
    console.log('[Step1.applyOutput] Using data from window.model:', {
      objectivesCount: window.model?.businessObjectives?.length || 0,
      validationScore: window.model?.validationMetrics?.validation_quality_score || 0
    });
    
    return {
      ...model,
      businessObjectives: window.model?.businessObjectives || [],
      businessContext: window.model?.businessContext || {},
      validationMetrics: window.model?.validationMetrics || {},
      gapInsights: window.model?.gapInsights || [],
      businessContextConfirmed: true
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
    
    // V11.4: Update navigation and tab lock states
    if (typeof updateNavigationLockStates === 'function') {
      updateNavigationLockStates();
    } else if (typeof EANavigation !== 'undefined' && typeof EANavigation.updateLockStates === 'function') {
      EANavigation.updateLockStates();
    }
    if (typeof updateTabLockStates === 'function') updateTabLockStates();
    
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
