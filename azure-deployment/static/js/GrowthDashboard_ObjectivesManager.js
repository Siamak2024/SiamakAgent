/**
 * GrowthDashboard_ObjectivesManager
 * 
 * Manages business objectives for Growth Sprint Dashboard
 * - Account-scoped storage (separate from NexGenEA Platform)
 * - localStorage-based persistence with JSON format
 * - 15 objective limit per account (warning at 8)
 * - Evidence-based validation support
 * - Future: Industry-level sharing (Phase 4)
 * 
 * Storage Strategy:
 * - Account-specific: localStorage key 'gsd_objectives_{accountId}'
 * - Industry-shared: 'gsd_objectives_industry_{industry}' (Phase 4)
 * - Format: JSON array of objectives
 * 
 * Version: 1.0 (Phase 1 - Basic CRUD)
 */

const GrowthDashboard_ObjectivesManager = (function() {
  'use strict';

  // Constants
  const STORAGE_PREFIX = 'gsd_objectives_';
  const VALID_PRIORITIES = ['high', 'medium', 'low'];
  const VALID_VALIDATION_STATUS = ['validated', 'hypothesis', 'unknown'];
  const VALID_EVIDENCE_STRENGTH = ['strong', 'medium', 'weak', 'unsupported'];
  const MAX_OBJECTIVES_PER_ACCOUNT = 15;
  const WARNING_THRESHOLD = 8;

  /**
   * Get storage key for account
   */
  function getStorageKey(accountId) {
    return `${STORAGE_PREFIX}${accountId}`;
  }

  /**
   * Load objectives from localStorage
   */
  function loadObjectivesFromStorage(accountId) {
    try {
      const key = getStorageKey(accountId);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return [];
      }
      
      const objectives = JSON.parse(data);
      return Array.isArray(objectives) ? objectives : [];
    } catch (error) {
      console.error('Error loading objectives from storage:', error);
      return [];
    }
  }

  /**
   * Save objectives to localStorage
   */
  function saveObjectivesToStorage(accountId, objectives) {
    try {
      const key = getStorageKey(accountId);
      localStorage.setItem(key, JSON.stringify(objectives));
      return true;
    } catch (error) {
      console.error('Error saving objectives to storage:', error);
      return false;
    }
  }

  /**
   * Validate objective data
   */
  function validateObjective(objectiveData) {
    const errors = [];

    // Required fields
    if (!objectiveData.name || typeof objectiveData.name !== 'string' || objectiveData.name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }

    if (!objectiveData.description || typeof objectiveData.description !== 'string' || objectiveData.description.trim() === '') {
      errors.push('description is required and must be a non-empty string');
    }

    if (!objectiveData.priority || !VALID_PRIORITIES.includes(objectiveData.priority)) {
      errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    if (!objectiveData.strategicTheme || typeof objectiveData.strategicTheme !== 'string' || objectiveData.strategicTheme.trim() === '') {
      errors.push('strategicTheme is required and must be a non-empty string');
    }

    if (!objectiveData.outcomeStatement || typeof objectiveData.outcomeStatement !== 'string' || objectiveData.outcomeStatement.trim() === '') {
      errors.push('outcomeStatement is required and must be a non-empty string');
    }

    // Optional fields validation
    if (objectiveData.validation_status && !VALID_VALIDATION_STATUS.includes(objectiveData.validation_status)) {
      errors.push(`validation_status must be one of: ${VALID_VALIDATION_STATUS.join(', ')}`);
    }

    if (objectiveData.evidence_strength && !VALID_EVIDENCE_STRENGTH.includes(objectiveData.evidence_strength)) {
      errors.push(`evidence_strength must be one of: ${VALID_EVIDENCE_STRENGTH.join(', ')}`);
    }

    return errors;
  }

  /**
   * Generate unique objective ID
   */
  function generateObjectiveId(accountId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `obj-${accountId}-${timestamp}-${random}`;
  }

  /**
   * Create a new objective
   */
  function createObjective(accountId, objectiveData) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    // Check limit
    const existing = loadObjectivesFromStorage(accountId);
    if (existing.length >= MAX_OBJECTIVES_PER_ACCOUNT) {
      throw new Error(`Account has reached the maximum of ${MAX_OBJECTIVES_PER_ACCOUNT} objectives`);
    }

    // Show warning at threshold
    if (existing.length >= WARNING_THRESHOLD) {
      console.warn(`⚠️ Account has ${existing.length} objectives (approaching limit of ${MAX_OBJECTIVES_PER_ACCOUNT})`);
    }

    // Validate
    const errors = validateObjective(objectiveData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Create objective with defaults
    const objective = {
      id: generateObjectiveId(accountId),
      accountId: accountId,
      industry: objectiveData.industry || null,
      isShared: objectiveData.isShared || false,
      sharedAt: objectiveData.sharedAt || null,
      sharedBy: objectiveData.sharedBy || null,
      name: objectiveData.name.trim(),
      description: objectiveData.description.trim(),
      priority: objectiveData.priority,
      strategicTheme: objectiveData.strategicTheme.trim(),
      outcomeStatement: objectiveData.outcomeStatement.trim(),
      linkedCapabilities: objectiveData.linkedCapabilities || [],
      validation_status: objectiveData.validation_status || 'unknown',
      evidence_source: objectiveData.evidence_source || null,
      evidence_strength: objectiveData.evidence_strength || 'unsupported',
      evidence_gap: objectiveData.evidence_gap || null,
      validatedBy: objectiveData.validatedBy || null,
      validatedAt: objectiveData.validatedAt || null,
      comments: objectiveData.comments || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: objectiveData.createdBy || 'user',
      workflowState: objectiveData.workflowState || {
        step1Complete: false,
        step2Complete: false,
        aiSessionHistory: []
      }
    };

    // Add to storage
    existing.push(objective);
    saveObjectivesToStorage(accountId, existing);

    console.log(`✅ Created objective: ${objective.name} (${objective.id})`);
    return objective;
  }

  /**
   * List objectives by account
   */
  function listObjectivesByAccount(accountId) {
    if (!accountId) {
      return [];
    }

    return loadObjectivesFromStorage(accountId);
  }

  /**
   * Get objectives count for account
   */
  function getObjectivesCount(accountId) {
    if (!accountId) {
      return 0;
    }

    const objectives = loadObjectivesFromStorage(accountId);
    return objectives.length;
  }

  /**
   * Get single objective by ID
   */
  function getObjective(objectiveId, accountId) {
    if (!objectiveId || !accountId) {
      return null;
    }

    const objectives = loadObjectivesFromStorage(accountId);
    return objectives.find(obj => obj.id === objectiveId) || null;
  }

  /**
   * Update objective
   */
  function updateObjective(objectiveId, accountId, updates) {
    if (!objectiveId || !accountId) {
      throw new Error('objectiveId and accountId are required');
    }

    const objectives = loadObjectivesFromStorage(accountId);
    const index = objectives.findIndex(obj => obj.id === objectiveId);

    if (index === -1) {
      throw new Error(`Objective ${objectiveId} not found`);
    }

    // Validate updates if they contain required fields
    if (updates.name || updates.description || updates.priority || updates.strategicTheme || updates.outcomeStatement) {
      const updatedObj = { ...objectives[index], ...updates };
      const errors = validateObjective(updatedObj);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
    }

    // Apply updates
    objectives[index] = {
      ...objectives[index],
      ...updates,
      updatedAt: Date.now()
    };

    saveObjectivesToStorage(accountId, objectives);
    console.log(`✅ Updated objective: ${objectives[index].name} (${objectiveId})`);

    return objectives[index];
  }

  /**
   * Delete objective
   */
  function deleteObjective(objectiveId, accountId) {
    if (!objectiveId || !accountId) {
      throw new Error('objectiveId and accountId are required');
    }

    const objectives = loadObjectivesFromStorage(accountId);
    const filtered = objectives.filter(obj => obj.id !== objectiveId);

    if (filtered.length === objectives.length) {
      throw new Error(`Objective ${objectiveId} not found`);
    }

    saveObjectivesToStorage(accountId, filtered);
    console.log(`✅ Deleted objective: ${objectiveId}`);

    return true;
  }

  /**
   * Bulk delete objectives
   */
  function bulkDeleteObjectives(objectiveIds, accountId) {
    if (!objectiveIds || !Array.isArray(objectiveIds) || objectiveIds.length === 0) {
      throw new Error('objectiveIds must be a non-empty array');
    }

    if (!accountId) {
      throw new Error('accountId is required');
    }

    const objectives = loadObjectivesFromStorage(accountId);
    const filtered = objectives.filter(obj => !objectiveIds.includes(obj.id));

    const deletedCount = objectives.length - filtered.length;
    
    if (deletedCount === 0) {
      throw new Error('No objectives were deleted (IDs not found)');
    }

    saveObjectivesToStorage(accountId, filtered);
    console.log(`✅ Bulk deleted ${deletedCount} objective(s)`);

    return deletedCount;
  }

  /**
   * Delete all objectives for an account
   */
  function deleteObjectivesByAccount(accountId) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    const key = getStorageKey(accountId);
    localStorage.removeItem(key);
    console.log(`✅ Deleted all objectives for account: ${accountId}`);

    return true;
  }

  /**
   * Export objectives for an account (JSON format)
   */
  function exportAccountObjectives(accountId) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    const objectives = loadObjectivesFromStorage(accountId);

    return {
      format: 'growth_sprint_objectives_v1',
      exportedAt: new Date().toISOString(),
      accountId: accountId,
      count: objectives.length,
      objectives: objectives
    };
  }

  /**
   * Import objectives for an account
   */
  function importAccountObjectives(accountId, objectivesArray, overwrite = false) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    if (!Array.isArray(objectivesArray)) {
      throw new Error('objectivesArray must be an array');
    }

    let existing = overwrite ? [] : loadObjectivesFromStorage(accountId);

    // Validate and add each objective
    let importedCount = 0;
    let skippedCount = 0;

    objectivesArray.forEach(obj => {
      try {
        // Check if already exists (by ID)
        if (!overwrite && existing.find(e => e.id === obj.id)) {
          console.warn(`⚠️ Skipping duplicate objective: ${obj.id}`);
          skippedCount++;
          return;
        }

        // Validate
        const errors = validateObjective(obj);
        if (errors.length > 0) {
          console.error(`❌ Skipping invalid objective: ${obj.name}`, errors);
          skippedCount++;
          return;
        }

        // Add accountId if missing
        const objective = {
          ...obj,
          accountId: accountId,
          updatedAt: Date.now()
        };

        existing.push(objective);
        importedCount++;
      } catch (error) {
        console.error(`❌ Error importing objective:`, error);
        skippedCount++;
      }
    });

    saveObjectivesToStorage(accountId, existing);
    console.log(`✅ Imported ${importedCount} objective(s), skipped ${skippedCount}`);

    return {
      imported: importedCount,
      skipped: skippedCount,
      total: existing.length
    };
  }

  /**
   * Calculate validation quality metrics
   */
  function getValidationMetrics(accountId) {
    if (!accountId) {
      return null;
    }

    const objectives = loadObjectivesFromStorage(accountId);

    if (objectives.length === 0) {
      return {
        total: 0,
        validated: 0,
        hypothesis: 0,
        unknown: 0,
        qualityScore: 0
      };
    }

    const validated = objectives.filter(o => o.validation_status === 'validated').length;
    const hypothesis = objectives.filter(o => o.validation_status === 'hypothesis').length;
    const unknown = objectives.filter(o => o.validation_status === 'unknown').length;

    // Quality score: validated = 1.0, hypothesis = 0.5, unknown = 0
    const qualityScore = (validated * 1.0 + hypothesis * 0.5) / objectives.length * 100;

    return {
      total: objectives.length,
      validated: validated,
      hypothesis: hypothesis,
      unknown: unknown,
      qualityScore: Math.round(qualityScore)
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4: INDUSTRY SHARING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get storage key for industry shared objectives
   */
  function getIndustryStorageKey(industry) {
    return `gsd_objectives_industry_${industry.toLowerCase().replace(/\s+/g, '_')}`;
  }

  /**
   * Load shared objectives for an industry
   */
  function loadSharedObjectivesFromIndustry(industry) {
    try {
      const key = getIndustryStorageKey(industry);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return [];
      }
      
      const objectives = JSON.parse(data);
      return Array.isArray(objectives) ? objectives : [];
    } catch (error) {
      console.error('Error loading shared objectives from industry:', error);
      return [];
    }
  }

  /**
   * Save shared objectives to industry storage
   */
  function saveSharedObjectivesToIndustry(industry, objectives) {
    try {
      const key = getIndustryStorageKey(industry);
      localStorage.setItem(key, JSON.stringify(objectives));
      return true;
    } catch (error) {
      console.error('Error saving shared objectives to industry:', error);
      return false;
    }
  }

  /**
   * Share an objective to industry pool
   */
  function shareObjective(objectiveId, accountId) {
    if (!objectiveId || !accountId) {
      throw new Error('objectiveId and accountId are required');
    }

    // Get the objective
    const objective = getObjective(objectiveId, accountId);
    if (!objective) {
      throw new Error(`Objective ${objectiveId} not found`);
    }

    // Must have industry
    if (!objective.industry) {
      throw new Error('Objective must have an industry to be shared');
    }

    // Mark as shared in account storage
    updateObjective(objectiveId, accountId, {
      isShared: true,
      sharedAt: new Date().toISOString()
    });

    // Add to industry storage
    const sharedObjectives = loadSharedObjectivesFromIndustry(objective.industry);
    
    // Check if already shared (by ID)
    const existingIndex = sharedObjectives.findIndex(obj => obj.id === objectiveId);
    
    // Create shared copy
    const sharedCopy = {
      ...objective,
      isShared: true,
      sharedAt: new Date().toISOString(),
      sharedBy: accountId
    };

    if (existingIndex >= 0) {
      // Update existing
      sharedObjectives[existingIndex] = sharedCopy;
    } else {
      // Add new
      sharedObjectives.push(sharedCopy);
    }

    saveSharedObjectivesToIndustry(objective.industry, sharedObjectives);
    console.log(`✅ Shared objective ${objectiveId} to ${objective.industry} industry`);
    
    return sharedCopy;
  }

  /**
   * Unshare an objective from industry pool
   */
  function unshareObjective(objectiveId, accountId) {
    if (!objectiveId || !accountId) {
      throw new Error('objectiveId and accountId are required');
    }

    // Get the objective
    const objective = getObjective(objectiveId, accountId);
    if (!objective) {
      throw new Error(`Objective ${objectiveId} not found`);
    }

    // Mark as not shared in account storage
    updateObjective(objectiveId, accountId, {
      isShared: false,
      sharedAt: null
    });

    // Remove from industry storage if it exists
    if (objective.industry) {
      const sharedObjectives = loadSharedObjectivesFromIndustry(objective.industry);
      const filtered = sharedObjectives.filter(obj => obj.id !== objectiveId);
      
      if (filtered.length < sharedObjectives.length) {
        saveSharedObjectivesToIndustry(objective.industry, filtered);
        console.log(`✅ Unshared objective ${objectiveId} from ${objective.industry} industry`);
      }
    }

    return objective;
  }

  /**
   * List shared objectives by industry
   */
  function listSharedObjectivesByIndustry(industry) {
    if (!industry) {
      return [];
    }

    return loadSharedObjectivesFromIndustry(industry);
  }

  /**
   * Get count of shared objectives for an industry
   */
  function getSharedObjectivesCount(industry) {
    if (!industry) {
      return 0;
    }

    const sharedObjectives = loadSharedObjectivesFromIndustry(industry);
    return sharedObjectives.length;
  }

  /**
   * Get combined objectives (account + shared) for display
   */
  function getCombinedObjectives(accountId, industry) {
    if (!accountId) {
      return { account: [], shared: [], combined: [] };
    }

    const accountObjectives = loadObjectivesFromStorage(accountId);
    const sharedObjectives = industry ? loadSharedObjectivesFromIndustry(industry) : [];

    // Filter out objectives from this account (no duplicates)
    const sharedFromOthers = sharedObjectives.filter(obj => obj.accountId !== accountId);

    return {
      account: accountObjectives,
      shared: sharedFromOthers,
      combined: [...accountObjectives, ...sharedFromOthers]
    };
  }

  // Public API
  return {
    createObjective,
    listObjectivesByAccount,
    getObjectivesCount,
    getObjective,
    updateObjective,
    deleteObjective,
    bulkDeleteObjectives,
    deleteObjectivesByAccount,
    exportAccountObjectives,
    importAccountObjectives,
    getValidationMetrics,
    
    // Phase 4: Industry Sharing
    shareObjective,
    unshareObjective,
    listSharedObjectivesByIndustry,
    getSharedObjectivesCount,
    getCombinedObjectives,
    
    // Constants (exposed for UI)
    MAX_OBJECTIVES_PER_ACCOUNT,
    WARNING_THRESHOLD
  };
})();

// Log initialization
console.log('✅ GrowthDashboard_ObjectivesManager loaded (Phase 4 - Industry Sharing)');
