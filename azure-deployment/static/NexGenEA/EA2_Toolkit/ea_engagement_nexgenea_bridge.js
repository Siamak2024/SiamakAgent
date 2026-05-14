/**
 * ea_engagement_nexgenea_bridge.js
 * Import Business Objectives from NexGenEA Platform to EA Engagement Playbook Governance Tab
 * 
 * Transforms NexGenEA business data into Engagement Governance entities:
 * - Business Objectives → Decisions
 * - businessContext.constraints → Constraints
 * - businessContext.keyChallenges → Assumptions
 * - Evidence gaps → Assumptions
 * 
 * @version 1.0
 * @date 2026-05-13
 */

console.log('✓ EA Engagement NexGenEA Bridge loading...');

// ═══════════════════════════════════════════════════════════════════
// NEXGENEA PROJECT DISCOVERY
// ═══════════════════════════════════════════════════════════════════

/**
 * Get all saved NexGenEA projects from localStorage
 * @returns {Array} List of available projects
 */
function getNexGenEAProjects() {
  const projects = [];
  
  // Scan localStorage for nexgenea_project_* keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nexgenea_project_')) {
      try {
        const projectData = JSON.parse(localStorage.getItem(key));
        if (projectData && projectData.projectName) {
          projects.push({
            id: projectData.projectId,
            name: projectData.projectName,
            storageKey: key,
            lastModified: projectData.lastModified || 'Unknown',
            hasObjectives: !!(projectData.businessObjectives && projectData.businessObjectives.length > 0)
          });
        }
      } catch (e) {
        console.warn(`Failed to parse project from ${key}:`, e);
      }
    }
  }
  
  return projects;
}

/**
 * Load a specific NexGenEA project from localStorage
 * @param {string} storageKey - The localStorage key for the project
 * @returns {Object|null} Project data or null if not found
 */
function loadNexGenEAProject(storageKey) {
  try {
    const projectData = localStorage.getItem(storageKey);
    if (projectData) {
      return JSON.parse(projectData);
    }
  } catch (e) {
    console.error(`Failed to load project from ${storageKey}:`, e);
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// IMPORT ANALYSIS & PREVIEW
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze NexGenEA data and generate import preview
 * @param {Object} model - NexGenEA project data (optional, will use window.model or prompt user)
 * @returns {Object} Preview data with counts and items
 */
function analyzeNexGenEADataForImport(model = null) {
  // Try multiple sources for data
  if (!model) {
    model = window.model; // Check if currently loaded
  }
  
  // Check if we have valid data
  if (!model || !model.businessObjectives) {
    return {
      available: false,
      error: 'No NexGenEA data found. Please select a project to import from.',
      needsProjectSelection: true
    };
  };
  const preview = {
    available: true,
    decisions: [],
    constraints: [],
    assumptions: [],
    counts: { decisions: 0, constraints: 0, assumptions: 0 }
  };

  // ──────────────────────────────────────────────────────────────────
  // 1. Transform Business Objectives → Decisions
  // ──────────────────────────────────────────────────────────────────
  const businessObjectives = model.businessObjectives || [];
  
  businessObjectives.forEach(obj => {
    // Only import validated, high-priority objectives as decisions
    if (obj.validation_status === 'validated' && obj.priority?.toLowerCase() === 'high') {
      preview.decisions.push({
        source: 'businessObjective',
        sourceId: obj.id,
        title: `Pursue: ${obj.title}`,
        description: obj.description || obj.title,
        status: 'approved',
        owner: 'TBD',
        impact: `Directly supports ${obj.category || 'strategic'} objective: ${obj.kpi || obj.title}`,
        rationale: obj.rationale || `Target: ${obj.target_value} by ${obj.time_horizon}`,
        decisionDate: new Date().toISOString().split('T')[0],
        metadata: {
          sourceObjective: obj.id,
          evidenceStrength: obj.evidence_strength || 'medium',
          evidenceSource: obj.evidence_source || 'Validated during discovery'
        }
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────
  // 2. Transform businessContext.constraints → Constraints
  // ──────────────────────────────────────────────────────────────────
  const contextConstraints = model.businessContext?.constraints || [];
  
  contextConstraints.forEach(con => {
    // Handle both string and object format
    const constraintText = typeof con === 'string' ? con : con.description;
    const constraintType = typeof con === 'object' ? con.type : 'General';
    
    if (!constraintText || constraintText.trim() === '') return;

    // Map constraint type to schema enum
    const typeMapping = {
      'Financial': 'budgetary',
      'Budget': 'budgetary',
      'Operational': 'resource',
      'Organisational': 'organizational',
      'Organizational': 'organizational',
      'Technical': 'technical',
      'Timeline': 'timeline',
      'Time': 'timeline',
      'External': 'regulatory',
      'Regulatory': 'regulatory',
      'Compliance': 'regulatory'
    };
    
    const mappedType = typeMapping[constraintType] || 'technical';
    
    // Infer severity from keywords
    const lowerText = constraintText.toLowerCase();
    let severity = 'medium';
    if (lowerText.includes('critical') || lowerText.includes('mandatory') || lowerText.includes('must')) {
      severity = 'critical';
    } else if (lowerText.includes('budget') || lowerText.includes('deadline') || lowerText.includes('compliance')) {
      severity = 'high';
    }

    preview.constraints.push({
      source: 'businessContext',
      title: `${constraintType} Constraint`,
      description: constraintText,
      type: mappedType,
      severity: severity,
      owner: 'TBD',
      workaround: null
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 3. Transform businessContext.keyChallenges → Assumptions
  // ──────────────────────────────────────────────────────────────────
  const keyChallenges = model.businessContext?.keyChallenges || [];
  
  keyChallenges.forEach(challenge => {
    const challengeText = typeof challenge === 'string' ? challenge : challenge.challenge;
    const challengeImpact = typeof challenge === 'object' ? challenge.impact : 'medium';
    
    if (!challengeText || challengeText.trim() === '') return;

    preview.assumptions.push({
      source: 'businessChallenge',
      title: `Challenge: ${challengeText.substring(0, 60)}${challengeText.length > 60 ? '...' : ''}`,
      description: `Challenge identified during discovery: ${challengeText}`,
      status: 'active',
      impact: (challengeImpact || 'medium').toLowerCase(),
      validatedBy: null,
      validationDate: null
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 4. Transform evidence gaps → Assumptions
  // ──────────────────────────────────────────────────────────────────
  
  // From hypothesis objectives
  businessObjectives.forEach(obj => {
    if (obj.validation_status === 'hypothesis' && obj.evidence_gap) {
      preview.assumptions.push({
        source: 'evidenceGap',
        sourceId: obj.id,
        title: `Validate: ${obj.title}`,
        description: `Hypothesis requiring validation: ${obj.evidence_gap}`,
        status: 'active',
        impact: obj.priority?.toLowerCase() === 'high' ? 'high' : 'medium',
        validatedBy: null,
        validationDate: null,
        metadata: {
          sourceObjective: obj.id,
          evidenceGap: obj.evidence_gap
        }
      });
    }
  });

  // From validationMetrics.evidence_gaps
  const evidenceGaps = model.validationMetrics?.evidence_gaps || [];
  evidenceGaps.forEach((gap, idx) => {
    if (typeof gap === 'string' && gap.trim() !== '') {
      preview.assumptions.push({
        source: 'validationGap',
        title: `Evidence Gap: ${gap.substring(0, 50)}${gap.length > 50 ? '...' : ''}`,
        description: gap,
        status: 'active',
        impact: 'medium',
        validatedBy: null,
        validationDate: null
      });
    }
  });

  // Update counts
  preview.counts.decisions = preview.decisions.length;
  preview.counts.constraints = preview.constraints.length;
  preview.counts.assumptions = preview.assumptions.length;

  return preview;
}

// ═══════════════════════════════════════════════════════════════════
// IMPORT EXECUTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Import selected entities from preview into engagement
 * @param {Object} preview - Preview data from analyzeNexGenEADataForImport()
 * @param {Array} selectedDecisions - Indices of decisions to import
 * @param {Array} selectedConstraints - Indices of constraints to import
 * @param {Array} selectedAssumptions - Indices of assumptions to import
 * @returns {Object} Import result with counts
 */
function executeNexGenEAImport(preview, selectedDecisions, selectedConstraints, selectedAssumptions) {
  if (!engagementManager || !engagementManager.getCurrentEngagement()) {
    throw new Error('No active engagement. Please create or load an engagement first.');
  }

  const result = {
    success: true,
    imported: { decisions: 0, constraints: 0, assumptions: 0 },
    skipped: { decisions: 0, constraints: 0, assumptions: 0 },
    errors: []
  };

  try {
    // Import Decisions
    selectedDecisions.forEach(idx => {
      const decisionData = preview.decisions[idx];
      if (!decisionData) return;

      // Check for duplicates (fuzzy match on title)
      if (!isDuplicateDecision(decisionData.title)) {
        engagementManager.addEntity('decisions', decisionData);
        result.imported.decisions++;
      } else {
        result.skipped.decisions++;
      }
    });

    // Import Constraints
    selectedConstraints.forEach(idx => {
      const constraintData = preview.constraints[idx];
      if (!constraintData) return;

      // Check for duplicates (fuzzy match on description)
      if (!isDuplicateConstraint(constraintData.description)) {
        engagementManager.addEntity('constraints', constraintData);
        result.imported.constraints++;
      } else {
        result.skipped.constraints++;
      }
    });

    // Import Assumptions
    selectedAssumptions.forEach(idx => {
      const assumptionData = preview.assumptions[idx];
      if (!assumptionData) return;

      // Check for duplicates
      if (!isDuplicateAssumption(assumptionData.title)) {
        engagementManager.addEntity('assumptions', assumptionData);
        result.imported.assumptions++;
      } else {
        result.skipped.assumptions++;
      }
    });

    // Update current engagement reference
    currentEngagement = engagementManager.getCurrentEngagement();

  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
    console.error('Import error:', error);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════
// DUPLICATE DETECTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if decision already exists (fuzzy match on title)
 */
function isDuplicateDecision(title) {
  const existing = engagementManager.getEntities('decisions') || [];
  const normalizedTitle = title.toLowerCase().trim();
  
  return existing.some(d => {
    const existingTitle = d.title.toLowerCase().trim();
    return similarity(normalizedTitle, existingTitle) > 0.8;
  });
}

/**
 * Check if constraint already exists (fuzzy match on description)
 */
function isDuplicateConstraint(description) {
  const existing = engagementManager.getEntities('constraints') || [];
  const normalizedDesc = description.toLowerCase().trim();
  
  return existing.some(c => {
    const existingDesc = c.description.toLowerCase().trim();
    return similarity(normalizedDesc, existingDesc) > 0.8;
  });
}

/**
 * Check if assumption already exists
 */
function isDuplicateAssumption(title) {
  const existing = engagementManager.getEntities('assumptions') || [];
  const normalizedTitle = title.toLowerCase().trim();
  
  return existing.some(a => {
    const existingTitle = a.title.toLowerCase().trim();
    return similarity(normalizedTitle, existingTitle) > 0.8;
  });
}

/**
 * Calculate string similarity (Dice coefficient)
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Similarity score 0-1
 */
function similarity(str1, str2) {
  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);
  
  const intersection = bigrams1.filter(b => bigrams2.includes(b)).length;
  const union = bigrams1.length + bigrams2.length;
  
  return union === 0 ? 0 : (2 * intersection) / union;
}

function getBigrams(str) {
  const bigrams = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.substring(i, i + 2));
  }
  return bigrams;
}

// ═══════════════════════════════════════════════════════════════════
// UI FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Open import preview modal
 */
function openNexGenEAImportModal() {
  // First, check if we have projects available
  const projects = getNexGenEAProjects();
  
  if (projects.length === 0) {
    showToast('No Projects Found', 'No NexGenEA projects found in localStorage. Please create a project in NexGenEA first.', 'warning');
    return;
  }
  
  // If only one project, use it directly
  if (projects.length === 1) {
    const projectData = loadNexGenEAProject(projects[0].storageKey);
    const preview = analyzeNexGenEADataForImport(projectData);
    
    if (!preview.available) {
      showToast('Import Not Available', preview.error, 'warning');
      return;
    }
    
    if (preview.counts.decisions === 0 && preview.counts.constraints === 0 && preview.counts.assumptions === 0) {
      showToast('No Data to Import', 'No governance-relevant data found in NexGenEA Business Objectives.', 'info');
      return;
    }
    
    // Store preview data and project info
    window._importPreviewData = preview;
    window._selectedNexGenEAProject = projects[0];
    
    // Render modal
    renderImportPreviewModal(preview);
    
    // Show modal
    document.getElementById('nexgeneaImportModal').classList.remove('hidden');
  } else {
    // Multiple projects - show project selector
    renderProjectSelectorModal(projects);
    document.getElementById('nexgeneaImportModal').classList.remove('hidden');
  }
}

/**
 * Render project selector modal
 */
function renderProjectSelectorModal(projects) {
  const modalBody = document.getElementById('nexgenea-import-preview-body');
  
  modalBody.innerHTML = `
    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h4 style="font-size: 14px; font-weight: 700; color: #0c4a6e; margin-bottom: 8px;">
        <i class="fas fa-project-diagram"></i> Select NexGenEA Project
      </h4>
      <p style="font-size: 13px; color: #0369a1; margin-bottom: 0;">
        Found <strong>${projects.length} NexGenEA projects</strong>. Select one to import governance data:
      </p>
    </div>
    
    <div style="display: grid; gap: 12px;">
      ${projects.map(project => `
        <div 
          class="nexgenea-project-card" 
          onclick="selectNexGenEAProject('${project.storageKey}')" 
          style="
            background: white; 
            border: 2px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 16px; 
            cursor: pointer;
            transition: all 0.15s;
          "
          onmouseover="this.style.borderColor='#10b981'; this.style.background='#f0fdf4'"
          onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'"
        >
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 15px; color: #111827; margin-bottom: 6px;">
                <i class="fas fa-folder-open" style="color: #10b981; margin-right: 8px;"></i>
                ${project.name}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                <i class="fas fa-clock" style="margin-right: 4px;"></i>
                Last modified: ${new Date(project.lastModified).toLocaleDateString()}
              </div>
              <div style="font-size: 12px;">
                ${project.hasObjectives 
                  ? '<span style="color: #10b981;"><i class="fas fa-check-circle"></i> Has Business Objectives</span>' 
                  : '<span style="color: #f59e0b;"><i class="fas fa-exclamation-triangle"></i> No Business Objectives</span>'
                }
              </div>
            </div>
            <div style="color: #10b981;">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Select a NexGenEA project and show import preview
 */
function selectNexGenEAProject(storageKey) {
  const projectData = loadNexGenEAProject(storageKey);
  if (!projectData) {
    showToast('Load Error', 'Failed to load project data', 'error');
    return;
  }
  
  const preview = analyzeNexGenEADataForImport(projectData);
  
  if (!preview.available) {
    showToast('Import Not Available', preview.error, 'warning');
    return;
  }
  
  if (preview.counts.decisions === 0 && preview.counts.constraints === 0 && preview.counts.assumptions === 0) {
    showToast('No Data to Import', 'No governance-relevant data found in this project.', 'info');
    return;
  }
  
  // Store preview data and project info
  window._importPreviewData = preview;
  window._selectedNexGenEAProject = projectData;
  
  // Render preview
  renderImportPreviewModal(preview);
}

/**
 * Render import preview modal content
 */
function renderImportPreviewModal(preview) {
  const modalBody = document.getElementById('nexgenea-import-preview-body');
  const projectName = window._selectedNexGenEAProject?.projectName || 'Selected Project';
  
  const totalCount = preview.counts.decisions + preview.counts.constraints + preview.counts.assumptions;
  
  modalBody.innerHTML = `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h4 style="font-size: 14px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
        <i class="fas fa-check-circle"></i> Import from: ${projectName}
      </h4>
      <p style="font-size: 13px; color: #047857; margin-bottom: 12px;">
        Found <strong>${totalCount} governance items</strong> from NexGenEA Business Objectives:
      </p>
      <div style="display: flex; gap: 16px; font-size: 13px; color: #065f46;">
        <div><i class="fas fa-gavel"></i> <strong>${preview.counts.decisions}</strong> Decisions</div>
        <div><i class="fas fa-ban"></i> <strong>${preview.counts.constraints}</strong> Constraints</div>
        <div><i class="fas fa-question-circle"></i> <strong>${preview.counts.assumptions}</strong> Assumptions</div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="import-select-all" onchange="toggleAllImportSelections(this.checked)" checked>
        <span style="font-weight: 600; font-size: 13px;">Select All Items</span>
      </label>
    </div>

    ${preview.counts.decisions > 0 ? renderDecisionsPreview(preview.decisions) : ''}
    ${preview.counts.constraints > 0 ? renderConstraintsPreview(preview.constraints) : ''}
    ${preview.counts.assumptions > 0 ? renderAssumptionsPreview(preview.assumptions) : ''}
  `;
}

function renderDecisionsPreview(decisions) {
  return `
    <div style="margin-bottom: 24px;">
      <h5 style="font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 12px;">
        <i class="fas fa-gavel" style="color: #10b981;"></i> Decisions (${decisions.length})
      </h5>
      <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${decisions.map((d, idx) => `
          <label style="display: flex; align-items: start; gap: 10px; padding: 12px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <input type="checkbox" class="import-decision-checkbox" data-index="${idx}" checked style="margin-top: 2px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 13px; color: #111827; margin-bottom: 4px;">${d.title}</div>
              <div style="font-size: 12px; color: #6b7280;">${d.description.substring(0, 100)}${d.description.length > 100 ? '...' : ''}</div>
              <div style="font-size: 11px; color: #10b981; margin-top: 4px;">
                <span class="badge badge-active">Approved</span>
                ${d.metadata?.evidenceStrength ? `<span style="margin-left: 8px;">Evidence: ${d.metadata.evidenceStrength}</span>` : ''}
              </div>
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderConstraintsPreview(constraints) {
  return `
    <div style="margin-bottom: 24px;">
      <h5 style="font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 12px;">
        <i class="fas fa-ban" style="color: #f59e0b;"></i> Constraints (${constraints.length})
      </h5>
      <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${constraints.map((c, idx) => `
          <label style="display: flex; align-items: start; gap: 10px; padding: 12px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <input type="checkbox" class="import-constraint-checkbox" data-index="${idx}" checked style="margin-top: 2px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 13px; color: #111827; margin-bottom: 4px;">${c.title}</div>
              <div style="font-size: 12px; color: #6b7280;">${c.description}</div>
              <div style="font-size: 11px; margin-top: 4px;">
                <span class="badge badge-${c.severity === 'critical' ? 'high' : c.severity === 'high' ? 'medium' : 'low'}">${c.severity}</span>
                <span style="margin-left: 8px; color: #6b7280;">Type: ${c.type}</span>
              </div>
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAssumptionsPreview(assumptions) {
  return `
    <div style="margin-bottom: 24px;">
      <h5 style="font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 12px;">
        <i class="fas fa-question-circle" style="color: #6366f1;"></i> Assumptions (${assumptions.length})
      </h5>
      <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${assumptions.map((a, idx) => `
          <label style="display: flex; align-items: start; gap: 10px; padding: 12px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
            <input type="checkbox" class="import-assumption-checkbox" data-index="${idx}" checked style="margin-top: 2px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 13px; color: #111827; margin-bottom: 4px;">${a.title}</div>
              <div style="font-size: 12px; color: #6b7280;">${a.description.substring(0, 100)}${a.description.length > 100 ? '...' : ''}</div>
              <div style="font-size: 11px; margin-top: 4px;">
                <span class="badge badge-${a.impact === 'high' ? 'high' : a.impact === 'medium' ? 'medium' : 'low'}">Impact: ${a.impact}</span>
                <span style="margin-left: 8px; color: #6b7280;">Status: ${a.status}</span>
              </div>
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Toggle all checkboxes
 */
function toggleAllImportSelections(checked) {
  document.querySelectorAll('.import-decision-checkbox, .import-constraint-checkbox, .import-assumption-checkbox')
    .forEach(cb => cb.checked = checked);
}

/**
 * Execute import from modal
 */
function confirmNexGenEAImport() {
  const preview = window._importPreviewData;
  if (!preview) {
    showToast('Import Error', 'Preview data not found', 'error');
    return;
  }

  // Collect selected indices
  const selectedDecisions = Array.from(document.querySelectorAll('.import-decision-checkbox:checked'))
    .map(cb => parseInt(cb.dataset.index));
  const selectedConstraints = Array.from(document.querySelectorAll('.import-constraint-checkbox:checked'))
    .map(cb => parseInt(cb.dataset.index));
  const selectedAssumptions = Array.from(document.querySelectorAll('.import-assumption-checkbox:checked'))
    .map(cb => parseInt(cb.dataset.index));

  const totalSelected = selectedDecisions.length + selectedConstraints.length + selectedAssumptions.length;
  
  if (totalSelected === 0) {
    showToast('Nothing Selected', 'Please select at least one item to import', 'warning');
    return;
  }

  // Execute import
  const result = executeNexGenEAImport(preview, selectedDecisions, selectedConstraints, selectedAssumptions);

  // Close modal
  closeNexGenEAImportModal();

  // Show result
  const imported = result.imported.decisions + result.imported.constraints + result.imported.assumptions;
  const skipped = result.skipped.decisions + result.skipped.constraints + result.skipped.assumptions;

  let message = `✓ Imported ${imported} governance items from NexGenEA`;
  if (skipped > 0) {
    message += ` (${skipped} duplicates skipped)`;
  }

  showToast('Import Complete', message, 'success');

  // Refresh governance tab
  if (typeof renderDecisions === 'function') renderDecisions();
  if (typeof renderConstraints === 'function') renderConstraints();
  if (typeof renderAssumptions === 'function') renderAssumptions();
  if (typeof updateKPIs === 'function') updateKPIs();

  // Switch to governance tab
  const governanceSubTab = document.querySelector('.sub-tab[onclick*="governance"]');
  if (governanceSubTab) governanceSubTab.click();
}

/**
 * Close import modal
 */
function closeNexGenEAImportModal() {
  document.getElementById('nexgeneaImportModal').classList.add('hidden');
  window._importPreviewData = null;
}

console.log('✓ EA Engagement NexGenEA Bridge ready');
