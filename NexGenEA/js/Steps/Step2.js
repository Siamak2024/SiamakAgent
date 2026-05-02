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
 *   2.0 load_apqc          — Internal: Load APQC PCF v8.0 framework from cache/file
 *   2.1 capability_mapping — Internal: Build APQC-aligned capability map with gaps
 *   2.2 validate           — Custom UI: User validation/editing of capability map
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
        // Use dataManager instance to load APQC framework
        if (!window.dataManager || typeof window.dataManager.loadAPQCFramework !== 'function') {
          throw new Error('dataManager not available - cannot load APQC framework');
        }

        try {
          if (typeof addAssistantMessage === 'function') {
            addAssistantMessage('⏳ Loading APQC Process Classification Framework v8.0...');
          }

          const framework = await window.dataManager.loadAPQCFramework();
          
          if (!framework || !framework.categories || framework.categories.length === 0) {
            throw new Error('APQC framework loaded but contains no categories');
          }

          // Load metadata mapping (business types, strategic intents)
          const metadata = await window.dataManager.loadAPQCMetadata().catch(() => ({}));

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

    // ── Task 2.1: APQC-Integrated Capability Mapping ──────────────────────
    {
      taskId: 'step2_capability_mapping',
      title: 'Building APQC-aligned capability map',
      type: 'internal',
      taskType: 'heavy',
      instructionFile: '2_1_capability_mapping_apqc.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are an Enterprise Architecture expert with deep APQC Process Classification Framework knowledge.

Build a comprehensive capability model:
1. Select 5-8 relevant APQC L1 categories based on business type and objectives
2. Map 3-5 L2 processes per L1 category
3. For CORE domains, include 2-4 L3 activities per L2
4. Link every capability to Business Objectives (objective_mappings[])
5. Assess current vs target maturity (1-5 scale)
6. Identify gaps, white spots, IT enablement needs

Return ONLY valid JSON with structure:
{
  "apqc_summary": {
    "framework_version": "APQC PCF v8.0",
    "selected_l1_categories": [],
    "total_apqc_capabilities": 0,
    "total_custom_capabilities": 0,
    "business_type": "",
    "strategic_focus": []
  },
  "capability_hierarchy": [
    {
      "id": "1.0",
      "apqc_id": "1.0",
      "name": "",
      "description": "",
      "level": 1,
      "apqc_source": true,
      "objective_mappings": ["OBJ-01"],
      "classification": "Core|Differentiating|Supporting|Commodity",
      "scores": {"importance":5,"maturity":2,"performance":2,"cost":3},
      "current_maturity": 2,
      "target_maturity": 4,
      "gap": 2,
      "strategic_importance": "CORE",
      "investment_priority": "HIGH",
      "it_enablement": {"applications":[],"data_services":[],"integrations":[],"security":[]},
      "benchmark_maturity": 3.5,
      "white_spot_flags": [],
      "ai_enabled": false,
      "children": []
    }
  ],
  "gap_insights": [
    {
      "gap_id": "G01",
      "capability_id": "1.0",
      "capability_name": "",
      "objective_id": "OBJ-01",
      "objective_name": "",
      "gap_description": "",
      "business_impact": "",
      "recommendation": "",
      "priority": "HIGH|MEDIUM|LOW",
      "timeframe": "Quick-win|Short-term|Medium-term|Long-term",
      "estimated_effort": "",
      "expected_benefit": ""
    }
  ],
  "white_spots": [],
  "metadata": {"total_capabilities":0}
}`,

      userPrompt: (ctx) => {
        // Extract business context from Step 1
        const bc = ctx.businessContext || {};
        const objectives = bc.objectives || [];
        const themes = bc.strategicThemes || [];
        const gapInsights = bc.gapInsights || [];
        
        // APQC framework from Task 2.0
        const apqcData = ctx.answers?.step2_load_apqc || {};
        const apqcFramework = apqcData.framework || null;
        const apqcMetadata = apqcData.metadata || {};

        // Organization profile
        const orgDesc = ctx.companyDescription || ctx.orgDescription || '';
        const industry = bc.industry || ctx.masterData?.industry || 'General Enterprise';
        const businessType = bc.businessType || apqcMetadata.business_type || 'Services';

        // Build APQC context string
        let apqcContext = '';
        if (apqcFramework && apqcFramework.categories) {
          const l1Summary = apqcFramework.categories.slice(0, 12).map(cat => 
            `${cat.id} ${cat.name}${cat.description ? ': ' + cat.description.slice(0, 100) : ''}`
          ).join('\n');
          apqcContext = `\n\n**APQC Framework (L1 Categories):**\n${l1Summary}\n\nSelect 5-8 most relevant L1 categories for this organization.`;
        } else {
          apqcContext = `\n\n**APQC Framework**: Not loaded - use standard APQC knowledge to build capability map.`;
        }

        // Build objectives summary
        const objSummary = objectives.slice(0, 8).map((obj, idx) => 
          `${obj.id || `OBJ-${String(idx+1).padStart(2,'0')}`}: ${obj.objective || obj.name || obj.description || ''}`
        ).join('\n');

        // Strategic themes
        const themesList = (Array.isArray(themes) ? themes : [themes])
          .filter(t => t && typeof t === 'string')
          .join(', ');

        // Gap insights from Step 1
        const gapsList = gapInsights.slice(0, 5).map(g => 
          `- ${g.category || 'General'}: ${g.description || g.gap || ''}`
        ).join('\n');

        return `**Organization Profile:**
Company: "${orgDesc.slice(0, 400)}"
Industry: ${industry}
Business Type: ${businessType}

**Business Objectives (from Step 1):**
${objSummary || 'No objectives defined - use company description to infer'}

**Strategic Themes:**
${themesList || 'Growth, Innovation, Efficiency'}

**Known Gaps/Pain Points:**
${gapsList || 'Identify from company description'}
${apqcContext}

**Instructions:**
Follow the 8-step process in the instruction file:
1. Analyze business objectives
2. Select 5-8 relevant APQC L1 categories
3. Map APQC L2/L3 capabilities to objectives
4. Add custom capabilities only if truly unique
5. Assess maturity & gaps (1-5 scale)
6. Detect white spots (missing/under-invested/emerging)
7. Map IT enablement (applications, data, integrations, security)
8. Generate 5-10 gap insights with objective linkage

Return complete JSON with all fields populated.`;
      },

      outputSchema: {
        apqc_summary: 'object',
        capability_hierarchy: ['object'],
        gap_insights: ['object'],
        metadata: 'object'
      },

      parseOutput: (raw) => {
        const parsed = OutputValidator.parseJSON(raw, 'step2_capability_mapping');
        if (!parsed) return parsed;

        // Normalize field names (AI may use alternate names)
        if (!parsed.capability_hierarchy && parsed.capabilities) {
          parsed.capability_hierarchy = parsed.capabilities;
        }
        if (!parsed.capability_hierarchy && parsed.capabilityMap) {
          parsed.capability_hierarchy = parsed.capabilityMap;
        }

        // Ensure metadata exists
        if (!parsed.metadata) {
          parsed.metadata = {
            total_capabilities: (parsed.capability_hierarchy || []).length,
            total_l1: (parsed.capability_hierarchy || []).filter(c => c.level === 1).length
          };
        }

        // Ensure gap_insights exists
        if (!parsed.gap_insights) {
          parsed.gap_insights = [];
        }

        // Ensure white_spots exists
        if (!parsed.white_spots) {
          parsed.white_spots = [];
        }

        return parsed;
      }
    },

    // ── Task 2.2: Validation UI ───────────────────────────────────────────
    {
      taskId: 'step2_validate',
      title: 'Review capability map',
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
            addAssistantMessage('✅ Capability map auto-validated (Autopilot mode)');
          }
          return false;
        }

        return true;
      },

      execute: async (ctx) => {
        // Show validation message in chat with approval button
        const capMapping = ctx.answers?.step2_capability_mapping || {};
        const totalCaps = capMapping.capability_hierarchy?.length || 0;
        const gapsCount = capMapping.gap_insights?.length || 0;
        const whiteSpotsCount = capMapping.white_spots?.length || 0;
        
        if (typeof addAssistantMessage === 'function') {
          addAssistantMessage(
            `**✅ Capability Map Generated!**\n\n` +
            `📊 **Summary:**\n` +
            `- ${totalCaps} L1 capabilities identified (APQC-aligned)\n` +
            `- ${gapsCount} gap insights detected\n` +
            `- ${whiteSpotsCount} white-spot capabilities identified\n\n` +
            `**Next:** Review the capability map and approve to continue.\n\n` +
            `<button class="mode-action-btn mode-action-btn--action" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onclick="if (window._step2ValidationResolver) { window.model.capabilityValidated = true; window._step2ValidationResolver({ validated: true, approved: true }); window._step2ValidationResolver = null; if (typeof toast === 'function') toast('✅ Capability map approved!'); if (typeof autoSaveCurrentModel === 'function') autoSaveCurrentModel(); }">\n` +
            `  <i class="fas fa-check-circle"></i> Approve Capability Map & Continue\n` +
            `</button>\n\n` +
            `<button class="mode-action-btn" style="background: #f3f4f6; color: #374151; padding: 10px 20px; border-radius: 8px; border: 1px solid #d1d5db; font-weight: 500; cursor: pointer; margin-left: 8px;" onclick="if (typeof showTab === 'function') showTab('capmap', document.querySelector('[data-tab=capmap]'));">\n` +
            `  <i class="fas fa-eye"></i> Preview in Cap Map Tab\n` +
            `</button>`
          );
        }
        
        // Wait for user approval with 30-second timeout as safety net
        return new Promise((resolve) => {
          window._step2ValidationResolver = resolve;
          
          // Auto-approve after 30 seconds if no user action (prevents stuck workflow)
          setTimeout(() => {
            if (window._step2ValidationResolver) {
              console.warn('[Step2] Auto-approving after 30s timeout');
              window.model.capabilityValidated = true;
              resolve({ validated: true, approved: true, autoApproved: true });
              window._step2ValidationResolver = null;
              if (typeof addAssistantMessage === 'function') {
                addAssistantMessage('⏱️ Capability map auto-approved (timeout). Data saved.');
              }
            }
          }, 30000);
        });
      },

      parseOutput: (raw) => raw // Pass through validation result
    }

  ],

  // ── Synthesize: Transform AI output to model structure ───────────────────
  synthesize: (ctx) => {
    const apqcLoad = ctx.answers?.step2_load_apqc || {};
    const capMapping = ctx.answers?.step2_capability_mapping || {};
    const validation = ctx.answers?.step2_validate || {};

    // Build flattened capabilities array for backward compatibility
    const capabilities = [];
    const hierarchy = capMapping.capability_hierarchy || [];
    
    hierarchy.forEach((l1) => {
      // Add L1 capability
      const l1Cap = {
        id: l1.id,
        name: l1.name,
        description: l1.description || '',
        level: 1,
        domain: l1.name,
        maturity: l1.current_maturity || l1.scores?.maturity || 1,
        current_maturity: l1.current_maturity || null,
        target_maturity: l1.target_maturity || null,
        gap: l1.gap || null,
        strategic_importance: l1.strategic_importance || 'SUPPORT',
        strategicImportance: (l1.strategic_importance || 'SUPPORT').toLowerCase(),
        investment_priority: l1.investment_priority || null,
        classification: l1.classification || 'Supporting',
        apqc_source: l1.apqc_source !== false,
        apqc_id: l1.apqc_id || null,
        apqc_reference: l1.apqc_reference || null,
        apqc_code: l1.apqc_code || l1.apqc_id || null,
        custom_name: l1.custom_name || null,
        objective_mappings: l1.objective_mappings || [],
        scores: l1.scores || {},
        it_enablement: l1.it_enablement || {},
        benchmark_maturity: l1.benchmark_maturity || null,
        benchmark_deviation: l1.benchmark_deviation || null,
        white_spot_flags: l1.white_spot_flags || [],
        ai_enabled: l1.ai_enabled || false,
        ai_maturity: l1.ai_maturity || 1,
        children: []
      };
      capabilities.push(l1Cap);

      // Add L2 capabilities
      (l1.children || []).forEach((l2) => {
        const l2Cap = {
          id: l2.id,
          name: l2.name,
          description: l2.description || '',
          level: 2,
          domain: l1.name,
          maturity: l2.current_maturity || l2.scores?.maturity || 1,
          current_maturity: l2.current_maturity || null,
          target_maturity: l2.target_maturity || null,
          gap: l2.gap || null,
          strategic_importance: l2.strategic_importance || l1.strategic_importance || 'SUPPORT',
          strategicImportance: (l2.strategic_importance || l1.strategic_importance || 'SUPPORT').toLowerCase(),
          investment_priority: l2.investment_priority || null,
          classification: l2.classification || l1.classification || 'Supporting',
          apqc_source: l2.apqc_source !== false,
          apqc_id: l2.apqc_id || null,
          apqc_reference: l2.apqc_reference || null,
          objective_mappings: l2.objective_mappings || [],
          it_enablement: l2.it_enablement || {},
          white_spot_flags: l2.white_spot_flags || [],
          ai_enabled: l2.ai_enabled || false,
          children: []
        };
        capabilities.push(l2Cap);
        l1Cap.children.push(l2Cap);

        // Add L3 capabilities
        (l2.children || []).forEach((l3) => {
          const l3Cap = {
            id: l3.id,
            name: l3.name,
            description: l3.description || '',
            level: 3,
            domain: l1.name,
            maturity: l3.current_maturity || l3.scores?.maturity || 1,
            current_maturity: l3.current_maturity || null,
            target_maturity: l3.target_maturity || null,
            gap: l3.gap || null,
            strategic_importance: l3.strategic_importance || l2.strategic_importance || l1.strategic_importance || 'SUPPORT',
            strategicImportance: (l3.strategic_importance || l2.strategic_importance || l1.strategic_importance || 'SUPPORT').toLowerCase(),
            apqc_source: l3.apqc_source !== false,
            apqc_id: l3.apqc_id || null,
            objective_mappings: l3.objective_mappings || [],
            it_enablement: l3.it_enablement || {},
            white_spot_flags: l3.white_spot_flags || [],
            ai_enabled: l3.ai_enabled || false
          };
          capabilities.push(l3Cap);
          l2Cap.children.push(l3Cap);
        });
      });
    });

    // Transform hierarchy: rename 'children' to 'l2_capabilities' for UI compatibility
    const transformedHierarchy = hierarchy.map(l1 => {
      const l1Copy = { ...l1 };
      if (l1.children) {
        l1Copy.l2_capabilities = l1.children.map(l2 => {
          const l2Copy = { ...l2 };
          if (l2.children) {
            l2Copy.l3_capabilities = l2.children;
            delete l2Copy.children;
          }
          return l2Copy;
        });
        delete l1Copy.children;
      }
      return l1Copy;
    });

    return {
      apqcFramework: apqcLoad.framework || null,
      apqcSummary: capMapping.apqc_summary || {},
      capabilities,
      capabilityMap: {
        l1_domains: transformedHierarchy,
        metadata: capMapping.metadata || {}
      },
      gapInsights: capMapping.gap_insights || [],
      whiteSpots: capMapping.white_spots || [],
      capabilityValidated: validation.validated || false,
      // Backward compatibility aliases
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
        overall_maturity: capabilities.length > 0
          ? capabilities.filter(c => c.current_maturity).reduce((sum, c) => sum + c.current_maturity, 0) / 
            capabilities.filter(c => c.current_maturity).length
          : null,
        maturity_distribution: {
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
    // renderHeatmapSection() and renderGapSection() removed - functions don't exist
    // Will be replaced by renderCapMapWorkspace() in Phase 2, Step 9
    
    // Phase 1 Step 2: Render APQC Tree after Step 2 completes
    if (typeof renderAPQCTree === 'function') renderAPQCTree();
    
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
