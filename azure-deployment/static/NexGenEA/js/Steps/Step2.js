/**
 * Step2.js — APQC-Integrated Capability Mapping & Gap Analysis
 *
 * GOLDEN RULE: All capabilities must trace to Business Objectives for strategic alignment.
 *
 * New 4-step workflow position: Step 2 of 4
 * - Step 1: Discovery (Business Objectives)
 * - Step 2: Capability Mapping (APQC-aligned) ← THIS FILE
 * - Step 3: Target Architecture
 * - Step 4: Transformation Roadmap
 *
 * Tasks:
 *   2.0 load_apqc              — Internal: Load APQC PCF v8.0 framework from cache/file
 *   2.1a capability_initiation — Internal (light): AI-assisted capability pre-selection & mapping
 *   2.2 validate               — Custom UI: User validation/editing of capability selection
 *   2.3 deep_assessment        — Internal (heavy): Full maturity scoring, IT mapping, gaps
 *
 * Outputs:
 *   model.apqcFramework        — APQC PCF v8.0 framework (full hierarchy)
 *   model.apqcSummary          — APQC integration metadata
 *   model.capabilities[]       — Flattened capability array (backward compat)
 *   model.capabilityMap        — L1/L2/L3 hierarchy with APQC alignment
 *   model.gapInsights          — Gap analysis with objective linkage
 *   model.whiteSpots[]         — Detected white-spot capabilities
 *   model.capabilityValidated  — Boolean flag for validation completion
 */

const Step2 = {

  id: 'step2',
  name: 'APQC Capability Mapping',
  dependsOn: ['step1'],

  tasks: [

    // ── Task 2.0: Load APQC Framework ─────────────────────────────────────
    {
      taskId: 'step2_load_apqc',
      title: 'Loading APQC framework',
      type: 'internal',
      taskType: 'light',
      expectsJson: false,
      skipAI: true, // No AI call needed - just data loading

      // Conditional execution - skip in autopilot mode if already loaded
      shouldRun: (ctx) => {
        if (ctx.workflowMode === 'autopilot' && window.EA_DataManager) {
          const cached = window.EA_DataManager.getAPQCFramework();
          if (cached && cached.categories && cached.categories.length > 0) {
            ctx.answers = ctx.answers || {};
            ctx.answers.step2_load_apqc = { 
              status: 'cached', 
              framework: cached,
              message: 'APQC framework loaded from cache'
            };
            return false; // Skip this task
          }
        }
        return true;
      },

      execute: async (ctx) => {
        // Use EA_DataManager to load APQC framework
        if (!window.EA_DataManager || typeof window.EA_DataManager.loadAPQCFramework !== 'function') {
          throw new Error('EA_DataManager not available - cannot load APQC framework');
        }

        try {
          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage('⏳ Loading APQC Process Classification Framework v8.0...');
          }

          const framework = await window.EA_DataManager.loadAPQCFramework();
          
          if (!framework || !framework.categories || framework.categories.length === 0) {
            throw new Error('APQC framework loaded but contains no categories');
          }

          // Load metadata mapping (business types, strategic intents)
          const metadata = await window.EA_DataManager.loadAPQCMetadata().catch(() => ({}));

          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage(
              `✅ APQC framework loaded: ${framework.categories.length} L1 categories, ` +
              `${framework.total_processes || 'multiple'} processes`
            );
          }

          return {
            status: 'loaded',
            framework,
            metadata,
            message: `APQC PCF v8.0 loaded successfully`
          };

        } catch (error) {
          console.error('Step2 APQC load error:', error);
          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage(`⚠️ APQC framework load failed: ${error.message}. Continuing with standard capability mapping.`);
          }
          // Don't fail - allow fallback to standard capability mapping
          return {
            status: 'fallback',
            framework: null,
            metadata: {},
            message: `Fallback to standard capability mapping`,
            error: error.message
          };
        }
      },

      parseOutput: (raw) => raw // Direct pass-through
    },

    // ── Task 2.1a: AI-Assisted Capability Initiation ──────────────────────
    {
      taskId: 'step2_capability_initiation',
      title: 'Analyzing objectives and pre-selecting capabilities',
      type: 'internal',
      taskType: 'light', // Fast, lightweight AI call
      instructionFile: '2_1a_capability_initiation.instruction.md',
      expectsJson: true,
      temperature: 0.3,
      timeoutMs: 90000, // 90 seconds max

      systemPromptFallback: `You are an Enterprise Architecture expert helping prepare a ready-to-work capability workspace.

**PHASE 2a — INITIATION (Lightweight)**

Your tasks:
1. Pre-select 5-8 relevant APQC L1 categories based on business type and objectives
2. Map capabilities to business objectives (relationship strength: HIGH/MEDIUM/LOW)
3. Initial classification (Core/Differentiating/Supporting/Commodity)
4. Identify focus areas based on objective density
5. Flag coverage gaps (weak objective support, orphan capabilities)

**DO NOT:**
- Full maturity scoring (comes in Phase 2b)
- Detailed IT enablement mapping
- Deep gap analysis
- White spot detection

Return JSON with:
{
  "apqc_summary": {...},
  "capability_selection": [{id, name, level, classification, objective_mappings, children}],
  "objective_capability_matrix": [{objective_id, mapped_capabilities, coverage_status}],
  "focus_capabilities": [{capability_id, focus_reason, suggested_priority}],
  "coverage_warnings": [{type, issue, suggestion}],
  "metadata": {...}
}`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        const objectives = bc.objectives || [];
        const themes = bc.strategicThemes || [];
        
        const apqcData = ctx.answers?.step2_load_apqc || {};
        const apqcFramework = apqcData.framework || null;

        const orgDesc = ctx.companyDescription || ctx.orgDescription || '';
        const industry = bc.industry || ctx.masterData?.industry || 'General Enterprise';
        const businessType = bc.businessType || 'Services';

        // Build APQC L1 summary
        let apqcContext = '';
        if (apqcFramework && apqcFramework.categories) {
          const l1List = apqcFramework.categories.slice(0, 12).map(cat => 
            `${cat.id} ${cat.name}`
          ).join('\n');
          apqcContext = `\n\n**APQC L1 Categories (select 5-8):**\n${l1List}`;
        }

        const objSummary = objectives.slice(0, 8).map((obj, idx) => 
          `${obj.id || `OBJ-${String(idx+1).padStart(2,'0')}`}: ${obj.objective || obj.name || ''}`
        ).join('\n');

        const themesList = (Array.isArray(themes) ? themes : [themes])
          .filter(t => t && typeof t === 'string')
          .join(', ');

        return `**Organization Profile:**
Company: "${orgDesc.slice(0, 300)}"
Industry: ${industry}
Business Type: ${businessType}

**Business Objectives (from Step 1):**
${objSummary || 'No objectives defined'}

**Strategic Themes:**
${themesList || 'Growth, Innovation, Efficiency'}
${apqcContext}

**Task:**
1. Select 5-8 relevant APQC L1 categories
2. For each L1, select 3-5 key L2 processes
3. For CORE domains, add 2-4 L3 activities
4. Map each capability to objectives (HIGH/MEDIUM/LOW relationship)
5. Classify capabilities (Core/Differentiating/Supporting/Commodity)
6. Identify focus areas
7. Flag coverage warnings

Return complete JSON. Keep it lightweight—no full scoring yet.`;
      },

      outputSchema: {
        apqc_summary: 'object',
        capability_selection: ['object'],
        objective_capability_matrix: ['object'],
        focus_capabilities: ['object'],
        coverage_warnings: ['object'],
        metadata: 'object'
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step2_capability_initiation');
        if (!parsed) return parsed;

        // Normalize field names
        if (!parsed.capability_selection && parsed.capabilities) {
          parsed.capability_selection = parsed.capabilities;
        }
        if (!parsed.objective_capability_matrix) {
          parsed.objective_capability_matrix = [];
        }
        if (!parsed.focus_capabilities) {
          parsed.focus_capabilities = [];
        }
        if (!parsed.coverage_warnings) {
          parsed.coverage_warnings = [];
        }
        if (!parsed.metadata) {
          parsed.metadata = { total_capabilities: (parsed.capability_selection || []).length };
        }

        return parsed;
      }
    },

    // ── Task 2.2: Validation UI ───────────────────────────────────────────
    {
      taskId: 'step2_validate',
      title: 'Review and validate capability selection',
      type: 'custom-ui',
      expectsJson: false,

      // Conditional execution based on workflow mode
      shouldRun: (ctx) => {
        // Always show validation in standard mode
        if (!ctx.workflowMode || ctx.workflowMode === 'standard') return true;
        
        // Show validation in business-object mode
        if (ctx.workflowMode === 'business-object') return true;
        
        // Skip validation in autopilot mode
        if (ctx.workflowMode === 'autopilot') {
          // Auto-confirm in autopilot
          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage('✅ Capability selection auto-validated (Autopilot mode)');
          }
          return false;
        }

        return true;
      },

      execute: async (ctx) => {
        // Get initiation output
        const initiation = ctx.answers?.step2_capability_initiation || {};
        
        // Show validation UI message
        if (typeof addAssistantMessage === 'function') {
          const totalCaps = initiation.metadata?.total_capabilities || 0;
          const focusCount = (initiation.focus_capabilities || []).length;
          const warningCount = (initiation.coverage_warnings || []).length;
          
          addAssistantMessage(
            `🎯 **Capability Initiation Complete**\n\n` +
            `**Summary:**\n` +
            `- ${totalCaps} capabilities pre-selected\n` +
            `- ${initiation.apqc_summary?.selected_l1_count || 0} APQC L1 domains\n` +
            `- ${focusCount} high-focus capabilities identified\n` +
            `- ${warningCount} coverage warnings flagged\n\n` +
            `**Next Steps:**\n` +
            `1. Review the capability selection\n` +
            `2. Check objective-capability mappings\n` +
            `3. Validate focus areas\n` +
            `4. Address any coverage warnings\n\n` +
            `📋 **Review the validation screen and approve to proceed to deep assessment.**`
          );
        }

        // Render custom validation UI (implemented in NexGenEA_V11.html)
        if (typeof window.renderStep2ValidationUI === 'function') {
          await window.renderStep2ValidationUI(ctx);
          
          // Wait for user confirmation (UI will call StepEngine.resumeAfterValidation)
          return new Promise((resolve) => {
            window._step2ValidationResolver = resolve;
          });
        } else {
          console.warn('renderStep2ValidationUI not available - skipping validation UI');
          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage('⚠️ Validation UI not available - proceeding with AI-generated selection');
          }
          return { validated: true, message: 'Auto-validated (UI not available)' };
        }
      },

      parseOutput: (raw) => raw // Pass through validation result
    },

    // ── Task 2.3: Deep Capability Assessment ──────────────────────────────
    {
      taskId: 'step2_deep_assessment',
      title: 'Performing deep capability assessment',
      type: 'internal',
      taskType: 'heavy', // Comprehensive AI analysis
      instructionFile: '2_3_deep_assessment.instruction.md',
      expectsJson: true,
      temperature: 0.3,
      timeoutMs: 180000, // 3 minutes max for deep analysis

      systemPromptFallback: `You are an Enterprise Architecture expert performing detailed capability assessment.

**PHASE 2b — DEEP ASSESSMENT**

User has validated capability scope. Now perform:
1. Full maturity assessment (1-5 scale: current, target, gap)
2. Multi-dimensional scoring (importance, maturity, performance, cost)
3. IT enablement mapping (applications, data, integrations, security)
4. Benchmark overlay (industry standards)
5. White spot detection (high importance + low maturity)
6. Gap insights with recommendations (5-10 actionable insights)
7. Investment prioritization (HIGH/MEDIUM/LOW)

Return JSON with:
{
  "capability_assessments": [{...full scoring & IT mapping...}],
  "gap_insights": [{...detailed gaps with recommendations...}],
  "white_spots": [{...strategic gaps...}],
  "summary": {...overall metrics...}
}`,

      userPrompt: (ctx) => {
        const bc = ctx.businessContext || {};
        const objectives = bc.objectives || [];
        const initiation = ctx.answers?.step2_capability_initiation || {};
        const validation = ctx.answers?.step2_validate || {};
        
        // Get validated capabilities (may include user modifications)
        const validatedCapabilities = validation.modifiedCapabilities || 
                                      initiation.capability_selection || [];

        const orgDesc = ctx.companyDescription || ctx.orgDescription || '';
        const industry = bc.industry || 'General Enterprise';

        // Build capability list for assessment
        const capList = validatedCapabilities.map(cap => 
          `${cap.id} ${cap.name} (${cap.classification || 'Supporting'})`
        ).join('\n');

        const objSummary = objectives.slice(0, 8).map((obj, idx) => 
          `${obj.id || `OBJ-${String(idx+1).padStart(2,'0')}`}: ${obj.objective || obj.name || ''}`
        ).join('\n');

        return `**Organization Profile:**
Company: "${orgDesc.slice(0, 300)}"
Industry: ${industry}

**Business Objectives:**
${objSummary}

**Validated Capabilities (from Phase 2a):**
${capList || 'No capabilities defined'}

**Objective-Capability Mappings (confirmed):**
${JSON.stringify(initiation.objective_capability_matrix || [], null, 2)}

**Coverage Warnings from Initiation:**
${(initiation.coverage_warnings || []).map(w => `- ${w.issue}`).join('\n') || 'None'}

**Task:**
Perform deep assessment for each capability:
1. Score: importance (1-5), maturity (1-5), performance (1-5), cost efficiency (1-5)
2. Set current maturity, target maturity, gap
3. Map IT enablement (applications, data, integrations, security, coverage status)
4. Add benchmark maturity (industry standard)
5. Detect white spots (high importance + low maturity)
6. Generate 5-10 gap insights with:
   - Clear business impact
   - Root causes
   - Actionable recommendations
   - Priority, timeframe, effort estimate
   - Link to objectives

Return complete JSON with all assessment data.`;
      },

      outputSchema: {
        capability_assessments: ['object'],
        gap_insights: ['object'],
        white_spots: ['object'],
        summary: 'object'
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step2_deep_assessment');
        if (!parsed) return parsed;

        // Ensure arrays exist
        if (!parsed.capability_assessments) {
          parsed.capability_assessments = [];
        }
        if (!parsed.gap_insights) {
          parsed.gap_insights = [];
        }
        if (!parsed.white_spots) {
          parsed.white_spots = [];
        }
        if (!parsed.summary) {
          parsed.summary = {
            overall_maturity: 0,
            total_gaps: parsed.gap_insights.length,
            white_spots: parsed.white_spots.length
          };
        }

        return parsed;
      }
    }

  ],

  // ── Synthesize: Transform AI output to model structure ───────────────────
  synthesize: (ctx) => {
    const apqcLoad = ctx.answers?.step2_load_apqc || {};
    const initiation = ctx.answers?.step2_capability_initiation || {};
    const validation = ctx.answers?.step2_validate || {};
    const assessment = ctx.answers?.step2_deep_assessment || {};

    // Merge Phase 2a (initiation) and Phase 2b (assessment) data
    const capabilitySelection = validation.modifiedCapabilities || 
                                 initiation.capability_selection || [];
    const assessmentData = assessment.capability_assessments || [];

    // Build flattened capabilities array with full data
    const capabilities = [];
    
    capabilitySelection.forEach((capInit) => {
      // Find corresponding assessment data
      const capAssessment = assessmentData.find(a => a.id === capInit.id) || {};
      
      // Merge initiation + assessment data
      const mergedCap = {
        id: capInit.id,
        name: capInit.name,
        description: capInit.description || '',
        level: capInit.level,
        domain: capInit.name, // L1 name as domain
        
        // From initiation (Phase 2a)
        classification: capInit.classification || 'Supporting',
        objective_mappings: capInit.objective_mappings || [],
        apqc_source: capInit.apqc_source !== false,
        apqc_id: capInit.apqc_id || null,
        apqc_reference: capInit.apqc_reference || null,
        
        // From assessment (Phase 2b)
        scores: capAssessment.scores || {},
        current_maturity: capAssessment.current_maturity || null,
        target_maturity: capAssessment.target_maturity || null,
        gap: capAssessment.gap || null,
        strategic_importance: capAssessment.strategic_importance || 
                              (capInit.classification === 'Core' || capInit.classification === 'Differentiating' ? 'CORE' : 'SUPPORT'),
        strategicImportance: (capAssessment.strategic_importance || 'SUPPORT').toLowerCase(),
        investment_priority: capAssessment.investment_priority || null,
        it_enablement: capAssessment.it_enablement || {},
        benchmark_maturity: capAssessment.benchmark_maturity || null,
        benchmark_deviation: capAssessment.benchmark_deviation || null,
        white_spot_flags: capAssessment.white_spot_flags || [],
        ai_enabled: capAssessment.ai_enabled || false,
        ai_maturity: capAssessment.ai_maturity || 1,
        
        // Backward compat
        maturity: capAssessment.current_maturity || capAssessment.scores?.maturity || 1,
        children: []
      };
      
      capabilities.push(mergedCap);

      // Process children (L2)
      (capInit.children || []).forEach((l2Init) => {
        const l2Assessment = assessmentData.find(a => a.id === l2Init.id) || {};
        
        const l2Cap = {
          id: l2Init.id,
          name: l2Init.name,
          description: l2Init.description || '',
          level: 2,
          domain: capInit.name,
          
          classification: l2Init.classification || capInit.classification || 'Supporting',
          objective_mappings: l2Init.objective_mappings || [],
          apqc_source: l2Init.apqc_source !== false,
          apqc_id: l2Init.apqc_id || null,
          
          scores: l2Assessment.scores || {},
          current_maturity: l2Assessment.current_maturity || null,
          target_maturity: l2Assessment.target_maturity || null,
          gap: l2Assessment.gap || null,
          strategic_importance: l2Assessment.strategic_importance || mergedCap.strategic_importance,
          strategicImportance: (l2Assessment.strategic_importance || mergedCap.strategic_importance || 'SUPPORT').toLowerCase(),
          investment_priority: l2Assessment.investment_priority || null,
          it_enablement: l2Assessment.it_enablement || {},
          white_spot_flags: l2Assessment.white_spot_flags || [],
          ai_enabled: l2Assessment.ai_enabled || false,
          
          maturity: l2Assessment.current_maturity || l2Assessment.scores?.maturity || 1,
          children: []
        };
        
        capabilities.push(l2Cap);
        mergedCap.children.push(l2Cap);

        // Process children (L3)
        (l2Init.children || []).forEach((l3Init) => {
          const l3Assessment = assessmentData.find(a => a.id === l3Init.id) || {};
          
          const l3Cap = {
            id: l3Init.id,
            name: l3Init.name,
            description: l3Init.description || '',
            level: 3,
            domain: capInit.name,
            
            objective_mappings: l3Init.objective_mappings || [],
            apqc_source: l3Init.apqc_source !== false,
            apqc_id: l3Init.apqc_id || null,
            
            current_maturity: l3Assessment.current_maturity || null,
            target_maturity: l3Assessment.target_maturity || null,
            gap: l3Assessment.gap || null,
            strategic_importance: l3Assessment.strategic_importance || l2Cap.strategic_importance,
            strategicImportance: (l3Assessment.strategic_importance || l2Cap.strategic_importance || 'SUPPORT').toLowerCase(),
            it_enablement: l3Assessment.it_enablement || {},
            white_spot_flags: l3Assessment.white_spot_flags || [],
            ai_enabled: l3Assessment.ai_enabled || false,
            
            maturity: l3Assessment.current_maturity || l3Assessment.scores?.maturity || 1
          };
          
          capabilities.push(l3Cap);
          l2Cap.children.push(l3Cap);
        });
      });
    });

    // Build hierarchical structure for capabilityMap
    const hierarchy = capabilitySelection.filter(c => c.level === 1).map(l1 => {
      const l1Full = capabilities.find(c => c.id === l1.id) || l1;
      return {
        ...l1Full,
        children: l1.children || []
      };
    });

    return {
      apqcFramework: apqcLoad.framework || null,
      apqcSummary: initiation.apqc_summary || {},
      capabilities,
      capabilityMap: {
        l1_domains: hierarchy,
        metadata: initiation.metadata || {}
      },
      gapInsights: assessment.gap_insights || [],
      whiteSpots: assessment.white_spots || [],
      capabilityValidated: validation.validated || false,
      
      // Phase 2a outputs (for UI reference)
      objectiveCapabilityMatrix: initiation.objective_capability_matrix || [],
      focusCapabilities: initiation.focus_capabilities || [],
      coverageWarnings: initiation.coverage_warnings || [],
      
      // Backward compatibility
      capabilityAssessment: {
        capability_ratings: capabilities.filter(c => c.level <= 2).map(c => ({
          capability_id: c.id,
          capability_name: c.name,
          current_maturity: c.current_maturity,
          target_maturity: c.target_maturity,
          gap: c.gap,
          strategic_importance: c.strategic_importance,
          investment_priority: c.investment_priority,
          ai_enabled: c.ai_enabled
        })),
        overall_maturity: assessment.summary?.overall_maturity || 
                          (capabilities.length > 0 && capabilities.filter(c => c.current_maturity).length > 0
                            ? capabilities.filter(c => c.current_maturity).reduce((sum, c) => sum + c.current_maturity, 0) / 
                              capabilities.filter(c => c.current_maturity).length
                            : null),
        maturity_distribution: assessment.summary?.maturity_distribution || {
          initial: capabilities.filter(c => c.current_maturity === 1).length,
          developing: capabilities.filter(c => c.current_maturity === 2).length,
          defined: capabilities.filter(c => c.current_maturity === 3).length,
          managed: capabilities.filter(c => c.current_maturity === 4).length,
          optimising: capabilities.filter(c => c.current_maturity === 5).length
        }
      }
    };
  },

  // ── Apply Output: Merge into model ────────────────────────────────────────
  applyOutput: (output, model) => {
    // Enrich businessContext with capability gaps
    if (model.businessContext && model.businessContext.enrichment) {
      model.businessContext.enrichment.capabilityGaps = (output.gapInsights || []).map(g => ({
        capability: g.capability_name,
        objective_id: g.objective_id,
        linkedObjective: g.objective_id,
        currentLevel: null, // Extract from capability if needed
        targetLevel: null,
        priority: g.priority,
        description: g.gap_description,
        recommendation: g.recommendation,
        timeframe: g.timeframe
      }));
    }

    // Seed valueStreams from L1 domains (for Architecture Layers tab)
    const existingVS = (model.valueStreams || []).length > 0;
    const derivedVS = existingVS
      ? model.valueStreams
      : (output.capabilityMap?.l1_domains || []).map(d => ({ 
          name: d.name, 
          description: d.description || '' 
        }));

    return {
      ...model,
      apqcFramework: output.apqcFramework,
      apqcSummary: output.apqcSummary,
      capabilities: output.capabilities,
      capabilityMap: output.capabilityMap,
      capabilityAssessment: output.capabilityAssessment,
      gapInsights: output.gapInsights,
      whiteSpots: output.whiteSpots,
      capabilityValidated: output.capabilityValidated,
      valueStreams: derivedVS
    };
  },

  // ── On Complete: UI updates and next step prompt ──────────────────────────
  onComplete: (model) => {
    // Update UI sections
    if (typeof renderCapabilitySection === 'function') renderCapabilitySection();
    if (typeof renderHeatmapSection === 'function') renderHeatmapSection();
    if (typeof renderGapSection === 'function') renderGapSection();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2]);
    if (typeof StepEngine === 'object') StepEngine.stopSpinner('step2');
    if (typeof toast === 'function') toast('Capability Mapping complete ✓');

    // AI Assistant message
    const totalCaps = model.capabilities?.length || 0;
    const totalGaps = model.gapInsights?.length || 0;
    const totalWhiteSpots = model.whiteSpots?.length || 0;
    const avgMaturity = model.capabilityAssessment?.overall_maturity || 0;

    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(
        `**Step 2 — APQC Capability Mapping complete** ✅\n\n` +
        `📊 **Summary:**\n` +
        `- ${totalCaps} capabilities mapped (APQC-aligned)\n` +
        `- ${model.capabilityMap?.l1_domains?.length || 0} L1 domains\n` +
        `- Overall maturity: **${avgMaturity ? avgMaturity.toFixed(1) + '/5' : 'assessed'}**\n` +
        `- ${totalGaps} gap insights identified\n` +
        `- ${totalWhiteSpots} white-spot capabilities detected\n\n` +
        `**Next:** Ready to design Target Architecture? Click below or use the **Continue** button.\n\n` +
        `<button class="mode-action-btn mode-action-btn--action" onclick="if (typeof StepEngine !== 'undefined' && StepEngine.run) { StepEngine.run('step3', window.model); } else { console.error('StepEngine not available'); }">\n` +
        `  <i class="fas fa-arrow-right"></i>\n` +
        `  Start Step 3: Target Architecture\n` +
        `</button>`
      );
    }

    // Auto-save
    if (typeof autoSaveCurrentModel === 'function') {
      autoSaveCurrentModel();
    }
  }
};

// Export to window
window.Step2 = Step2;
