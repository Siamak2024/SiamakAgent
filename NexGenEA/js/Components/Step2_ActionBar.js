/**
 * Step2_ActionBar.js
 * Top Actions Bar for Step 2 - Decision-Grade Capability Mapping
 * 
 * Provides primary controls:
 * - Generate Step 2 Analysis (AI)
 * - Regenerate (with versioning)
 * - Validate Data
 * - Approve Step 2
 * - Mode Toggles (APQC View ↔ Business View)
 * - Benchmark Overlay Toggle
 * 
 * @version 1.0.0
 * @date 2026-04-26
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════
  
  window.Step2ActionBar = {
    state: {
      viewMode: localStorage.getItem('step2_viewMode') || 'apqc', // 'apqc' or 'business'
      benchmarkOverlay: localStorage.getItem('step2_benchmarkOverlay') === 'true',
      isApproved: false,
      approvedBy: null,
      approvedAt: null
    },

    // ══════════════════════════════════════════════════════════════════════
    // RENDER ACTION BAR
    // ══════════════════════════════════════════════════════════════════════
    
    render: function() {
      const container = document.getElementById('step2-actions-bar');
      if (!container) {
        console.warn('Step2 Actions Bar container not found');
        return;
      }

      const isApproved = this.state.isApproved || window.model?.capabilityApproved;
      const hasCapabilities = (window.model?.capabilities || []).length > 0;
      
      container.innerHTML = `
        <div class="flex items-center justify-between gap-4 p-3 bg-white border-b-2 border-slate-200 shadow-sm">
          <!-- Left: Primary Actions -->
          <div class="flex items-center gap-2">
            ${!isApproved ? `
              <button 
                onclick="Step2ActionBar.generateStep2Analysis()" 
                class="ea-btn ea-btn--primary"
                title="Run AI-powered capability mapping analysis"
                ${hasCapabilities ? 'disabled' : ''}>
                <i class="fas fa-wand-magic-sparkles"></i>
                <span>Generate Step 2 Analysis</span>
              </button>
              
              <button 
                onclick="Step2ActionBar.regenerateAnalysis()" 
                class="ea-btn ea-btn--secondary"
                title="Re-run analysis with versioning"
                ${!hasCapabilities ? 'disabled' : ''}>
                <i class="fas fa-rotate"></i>
                <span>Regenerate</span>
              </button>
            ` : `
              <div class="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <i class="fas fa-check-circle text-green-600"></i>
                <span class="text-sm font-semibold text-green-700">Approved</span>
                <span class="text-xs text-green-600">by ${this.state.approvedBy || 'User'}</span>
              </div>
            `}
            
            <button 
              onclick="Step2ActionBar.validateData()" 
              class="ea-btn ea-btn--secondary"
              title="Validate capability mappings and scores"
              ${!hasCapabilities ? 'disabled' : ''}>
              <i class="fas fa-check-double"></i>
              <span>Validate Data</span>
            </button>
            
            ${!isApproved ? `
              <button 
                onclick="Step2ActionBar.approveStep2()" 
                class="ea-btn ea-btn--success"
                title="Lock and approve Step 2 structure"
                ${!hasCapabilities ? 'disabled' : ''}>
                <i class="fas fa-lock"></i>
                <span>Approve Step 2</span>
              </button>
            ` : `
              <button 
                onclick="Step2ActionBar.unlockStep2()" 
                class="ea-btn ea-btn--warning"
                title="Unlock Step 2 for editing">
                <i class="fas fa-unlock"></i>
                <span>Unlock</span>
              </button>
            `}
          </div>

          <!-- Right: Mode Toggles -->
          <div class="flex items-center gap-3">
            <!-- View Mode Toggle -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-600">View:</span>
              <div class="bmc-state-toggle flex gap-1">
                <button 
                  id="step2-view-apqc" 
                  onclick="Step2ActionBar.setViewMode('apqc')"
                  class="${this.state.viewMode === 'apqc' ? 'active' : ''}">
                  APQC View
                </button>
                <button 
                  id="step2-view-business" 
                  onclick="Step2ActionBar.setViewMode('business')"
                  class="${this.state.viewMode === 'business' ? 'active' : ''}">
                  Business View
                </button>
              </div>
            </div>

            <!-- Benchmark Overlay Toggle -->
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="step2-benchmark-overlay"
                  ${this.state.benchmarkOverlay ? 'checked' : ''}
                  onchange="Step2ActionBar.toggleBenchmarkOverlay(this.checked)"
                  class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                <span class="text-xs font-semibold text-slate-600">Benchmark Overlay</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Validation Panel (Initially Hidden) -->
        <div id="step2-validation-panel" class="hidden bg-slate-50 border-b border-slate-200 p-3">
          <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
            <div class="flex-1">
              <div class="text-sm font-bold text-slate-800 mb-2">Validation Results</div>
              <div id="step2-validation-content"></div>
            </div>
            <button onclick="Step2ActionBar.closeValidationPanel()" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `;
    },

    // ══════════════════════════════════════════════════════════════════════
    // ACTION HANDLERS
    // ══════════════════════════════════════════════════════════════════════
    
    generateStep2Analysis: async function() {
      console.log('[Step2ActionBar] Generating Step 2 Analysis...');
      
      if (!window.StepEngine) {
        alert('StepEngine not available. Please ensure the platform is fully loaded.');
        return;
      }

      try {
        if (typeof addAssistantMessage === 'function') {
          addAssistantMessage('🔹 Starting Step 2: APQC-Integrated Capability Mapping...');
        }

        await window.StepEngine.run('step2', window.model);
        
        if (typeof addAssistantMessage === 'function') {
          addAssistantMessage('✅ Step 2 Analysis Complete! Review the capability map, objective mappings, and prioritization.');
        }

        this.render(); // Re-render to update button states
      } catch (error) {
        console.error('[Step2ActionBar] Generation failed:', error);
        alert(`Failed to generate Step 2 analysis: ${error.message}`);
      }
    },

    regenerateAnalysis: async function() {
      console.log('[Step2ActionBar] Regenerating Step 2 Analysis...');
      
      const note = prompt('Add a note for this version (optional):', '');
      
      // Save current version to history
      this.saveVersion(note || 'Regeneration');

      try {
        if (typeof addAssistantMessage === 'function') {
          addAssistantMessage('🔄 Regenerating Step 2 Analysis with updated data...');
        }

        await window.StepEngine.run('step2', window.model);
        
        if (typeof addAssistantMessage === 'function') {
          addAssistantMessage('✅ Step 2 Regenerated! Previous version saved to history.');
        }

        this.render();
      } catch (error) {
        console.error('[Step2ActionBar] Regeneration failed:', error);
        alert(`Failed to regenerate Step 2: ${error.message}`);
      }
    },

    validateData: function() {
      console.log('[Step2ActionBar] Validating Step 2 data...');
      
      const validation = this.runValidation();
      this.showValidationPanel(validation);
    },

    approveStep2: function() {
      console.log('[Step2ActionBar] Approving Step 2...');
      
      // Run validation first
      const validation = this.runValidation();
      
      if (validation.errors.length > 0) {
        alert('Cannot approve Step 2: Please fix all validation errors first.');
        this.showValidationPanel(validation);
        return;
      }

      // Show confirmation modal
      const caps = (window.model?.capabilities || []).length;
      const gaps = (window.model?.gapInsights || []).length;
      const highPriority = (window.model?.capabilities || []).filter(c => 
        c.strategic_importance === 'CORE' || c.strategicImportance === 'high'
      ).length;

      const confirmed = confirm(
        `Approve Step 2: APQC Capability Mapping?\n\n` +
        `Summary:\n` +
        `• ${caps} capabilities mapped\n` +
        `• ${gaps} gap insights identified\n` +
        `• ${highPriority} high-priority areas\n\n` +
        `⚠️ This will lock the capability structure. You can unlock later if needed.\n\n` +
        `Continue with approval?`
      );

      if (!confirmed) return;

      // Set approval flags
      this.state.isApproved = true;
      this.state.approvedBy = window.currentUser || 'User';
      this.state.approvedAt = new Date().toISOString();

      if (window.model) {
        window.model.capabilityApproved = true;
        window.model.capabilityApprovedBy = this.state.approvedBy;
        window.model.capabilityApprovedAt = this.state.approvedAt;
      }

      // Save model
      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
      }

      if (typeof addAssistantMessage === 'function') {
        addAssistantMessage('🔐 Step 2 Approved and Locked! The capability structure is now finalized.');
      }

      this.render();
    },

    unlockStep2: function() {
      console.log('[Step2ActionBar] Unlocking Step 2...');
      
      const reason = prompt('Enter reason for unlocking (required):', '');
      
      if (!reason || reason.trim() === '') {
        alert('Unlock reason is required.');
        return;
      }

      // Log unlock event
      const unlockEvent = {
        timestamp: new Date().toISOString(),
        user: window.currentUser || 'User',
        reason: reason,
        previousApproval: {
          approvedBy: this.state.approvedBy,
          approvedAt: this.state.approvedAt
        }
      };

      if (!window.model.capabilityUnlockHistory) {
        window.model.capabilityUnlockHistory = [];
      }
      window.model.capabilityUnlockHistory.push(unlockEvent);

      // Clear approval flags
      this.state.isApproved = false;
      if (window.model) {
        window.model.capabilityApproved = false;
      }

      // Save model
      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
      }

      if (typeof addAssistantMessage === 'function') {
        addAssistantMessage(`🔓 Step 2 Unlocked. Reason: ${reason}`);
      }

      this.render();
    },

    setViewMode: function(mode) {
      console.log('[Step2ActionBar] Setting view mode:', mode);
      
      this.state.viewMode = mode;
      localStorage.setItem('step2_viewMode', mode);

      // Re-render action bar
      this.render();

      // Trigger re-render of capability views
      if (typeof renderCapMap === 'function') {
        renderCapMap();
      }
      if (typeof renderHeatmap === 'function') {
        renderHeatmap();
      }
    },

    toggleBenchmarkOverlay: function(enabled) {
      console.log('[Step2ActionBar] Benchmark overlay:', enabled);
      
      this.state.benchmarkOverlay = enabled;
      localStorage.setItem('step2_benchmarkOverlay', enabled.toString());

      // Trigger heatmap re-render with benchmark overlay
      if (typeof renderHeatmap === 'function') {
        renderHeatmap();
      }
    },

    closeValidationPanel: function() {
      const panel = document.getElementById('step2-validation-panel');
      if (panel) {
        panel.classList.add('hidden');
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // VALIDATION LOGIC
    // ══════════════════════════════════════════════════════════════════════
    
    runValidation: function() {
      const errors = [];
      const warnings = [];
      const model = window.model || {};
      const capabilities = model.capabilities || [];
      const objectives = model.businessContext?.primaryObjectives || [];

      // Check for missing scores
      capabilities.forEach(cap => {
        if (!cap.maturity && !cap.current_maturity) {
          errors.push({
            type: 'missing_score',
            capability: cap.name,
            message: `Missing maturity score for "${cap.name}"`,
            fix: { type: 'navigate', target: 'capability', id: cap.id }
          });
        }
        
        if (!cap.strategic_importance && !cap.strategicImportance) {
          errors.push({
            type: 'missing_importance',
            capability: cap.name,
            message: `Missing strategic importance for "${cap.name}"`,
            fix: { type: 'navigate', target: 'capability', id: cap.id }
          });
        }
      });

      // Check for objective mappings
      if (objectives.length > 0) {
        const unmappedObjectives = objectives.filter(obj => {
          const linkedCaps = capabilities.filter(cap => 
            (cap.objective_mappings || []).includes(obj.id)
          );
          return linkedCaps.length === 0;
        });

        unmappedObjectives.forEach(obj => {
          warnings.push({
            type: 'unmapped_objective',
            objective: obj.objective,
            message: `Objective "${obj.objective}" is not mapped to any capability`,
            fix: { type: 'navigate', target: 'objective-matrix' }
          });
        });

        // Check for weak capability coverage
        capabilities.forEach(cap => {
          const mappings = cap.objective_mappings || [];
          if (mappings.length === 0 && cap.strategic_importance === 'CORE') {
            warnings.push({
              type: 'weak_coverage',
              capability: cap.name,
              message: `Core capability "${cap.name}" has no objective mappings`,
              fix: { type: 'navigate', target: 'objective-matrix' }
            });
          }
        });
      }

      // Check for conflicting scores
      capabilities.forEach(cap => {
        const current = cap.current_maturity || cap.maturity || 0;
        const target = cap.target_maturity || 0;
        
        if (target > 0 && target < current) {
          warnings.push({
            type: 'conflicting_scores',
            capability: cap.name,
            message: `Target maturity (${target}) is less than current (${current}) for "${cap.name}"`,
            fix: { type: 'navigate', target: 'capability', id: cap.id }
          });
        }
      });

      return { errors, warnings };
    },

    showValidationPanel: function(validation) {
      const panel = document.getElementById('step2-validation-panel');
      const content = document.getElementById('step2-validation-content');
      
      if (!panel || !content) return;

      let html = '';

      // Errors
      if (validation.errors.length > 0) {
        html += `
          <div class="mb-3">
            <div class="text-xs font-bold text-red-700 mb-2">
              <i class="fas fa-times-circle"></i> Blocking Errors (${validation.errors.length})
            </div>
            <div class="space-y-1">
              ${validation.errors.map(err => `
                <div class="flex items-start gap-2 text-xs p-2 bg-red-50 border border-red-200 rounded">
                  <i class="fas fa-circle text-red-500 text-[8px] mt-1"></i>
                  <div class="flex-1">${err.message}</div>
                  <button onclick="Step2ActionBar.fixValidationIssue(${JSON.stringify(err.fix).replace(/"/g, '&quot;')})" 
                    class="text-red-600 hover:text-red-800 font-semibold">
                    Fix →
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Warnings
      if (validation.warnings.length > 0) {
        html += `
          <div>
            <div class="text-xs font-bold text-yellow-700 mb-2">
              <i class="fas fa-exclamation-triangle"></i> Warnings (${validation.warnings.length})
            </div>
            <div class="space-y-1">
              ${validation.warnings.map(warn => `
                <div class="flex items-start gap-2 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <i class="fas fa-circle text-yellow-500 text-[8px] mt-1"></i>
                  <div class="flex-1">${warn.message}</div>
                  <button onclick="Step2ActionBar.fixValidationIssue(${JSON.stringify(warn.fix).replace(/"/g, '&quot;')})" 
                    class="text-yellow-600 hover:text-yellow-800 font-semibold">
                    Fix →
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Success message
      if (validation.errors.length === 0 && validation.warnings.length === 0) {
        html = `
          <div class="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded">
            <i class="fas fa-check-circle text-green-600"></i>
            <span class="font-semibold">All validation checks passed!</span>
          </div>
        `;
      }

      content.innerHTML = html;
      panel.classList.remove('hidden');
    },

    fixValidationIssue: function(fix) {
      console.log('[Step2ActionBar] Fixing validation issue:', fix);
      
      // Navigate to appropriate tab/section
      if (fix.target === 'objective-matrix') {
        if (typeof showTab === 'function') {
          showTab('step2-objective-matrix', null);
        }
      } else if (fix.target === 'capability' && fix.id) {
        // Find capability and open edit modal
        const capIndex = (window.model?.capabilities || []).findIndex(c => c.id === fix.id);
        if (capIndex >= 0 && typeof editLayerItem === 'function') {
          editLayerItem('capabilities', capIndex);
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    // VERSION MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════
    
    saveVersion: function(note) {
      console.log('[Step2ActionBar] Saving version:', note);
      
      if (!window.model) return;

      if (!window.model.capabilityHistory) {
        window.model.capabilityHistory = [];
      }

      const version = {
        version: window.model.capabilityHistory.length + 1,
        timestamp: new Date().toISOString(),
        note: note,
        data: {
          capabilities: JSON.parse(JSON.stringify(window.model.capabilities || [])),
          capabilityMap: JSON.parse(JSON.stringify(window.model.capabilityMap || {})),
          gapInsights: JSON.parse(JSON.stringify(window.model.gapInsights || []))
        }
      };

      window.model.capabilityHistory.push(version);

      // Keep only last 10 versions
      if (window.model.capabilityHistory.length > 10) {
        window.model.capabilityHistory.shift();
      }

      // Save to localStorage
      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // AUTO-INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════
  
  // Auto-render when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.getElementById('step2-actions-bar')) {
        window.Step2ActionBar.render();
      }
    });
  } else {
    if (document.getElementById('step2-actions-bar')) {
      window.Step2ActionBar.render();
    }
  }

})();
