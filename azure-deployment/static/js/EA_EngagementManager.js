/**
 * EA_EngagementManager.js
 * Data persistence and business logic for EA Engagement Playbook
 * Extends EA_DataManager patterns with CRUD operations for 14 entity types
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class EA_EngagementManager {
  constructor() {
    this.currentEngagementId = null;
    this.storagePrefix = 'ea_engagement_';
    this.initializeStorage();
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  initializeStorage() {
    // Ensure segment templates are loaded
    if (!this.getSegmentTemplates().length) {
      this.initializeDefaultSegments();
    }
  }

  initializeDefaultSegments() {
    const defaultSegments = window.EA_EngagementSchema?.DefaultSegmentTemplates || [];
    if (defaultSegments.length > 0) {
      localStorage.setItem(`${this.storagePrefix}segment_templates`, JSON.stringify(defaultSegments));
      console.log('✓ Default segment templates initialized');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ENGAGEMENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Create a new engagement
   * @param {Object} engagementData - Engagement metadata
   * @returns {string} - Engagement ID
   */
  createEngagement(engagementData) {
    const timestamp = new Date().toISOString();
    
    const engagement = {
      ...engagementData,
      metadata: {
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: 'current-user', // TODO: Get from auth context
        completeness: 0
      }
    };

    // Initialize default phases
    const defaultPhases = window.EA_EngagementSchema?.DefaultPhases || [];
    const phases = defaultPhases.map(p => ({ ...p, status: 'not-started', stories: [] }));

    // Initialize empty entity collections
    const engagementModel = {
      engagement,
      customers: [],
      phases,
      stories: [],
      stakeholders: [],
      applications: [],
      capabilities: [],
      risks: [],
      constraints: [],
      decisions: [],
      assumptions: [],
      initiatives: [],
      roadmapItems: [],
      architectureViews: [],
      artifacts: [],
      whiteSpotHeatmaps: []
    };

    // Save to localStorage
    this.saveEngagement(engagement.id, engagementModel);
    this.setCurrentEngagement(engagement.id);

    console.log(`✓ Engagement created: ${engagement.id}`);
    return engagement.id;
  }

  /**
   * Get list of all engagements
   * @returns {Array} - Array of engagement summaries
   */
  listEngagements() {
    const engagementKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${this.storagePrefix}model_`)) {
        engagementKeys.push(key);
      }
    }

    return engagementKeys.map(key => {
      try {
        const model = JSON.parse(localStorage.getItem(key));
        return {
          id: model.engagement.id,
          name: model.engagement.name,
          segment: model.engagement.segment,
          status: model.engagement.status,
          theme: model.engagement.theme,
          completeness: model.engagement.metadata?.completeness || 0,
          updatedAt: model.engagement.metadata?.updatedAt
        };
      } catch (error) {
        console.error('Error reading engagement:', key, error);
        return null;
      }
    }).filter(e => e !== null);
  }

  /**
   * Save engagement model to localStorage
   * @param {string} engagementId - Engagement ID
   * @param {Object} model - Full engagement model
   */
  saveEngagement(engagementId, model) {
    const key = `${this.storagePrefix}model_${engagementId}`;
    
    // Update timestamp
    model.engagement.metadata.updatedAt = new Date().toISOString();
    
    // Calculate completeness
    model.engagement.metadata.completeness = this.calculateCompleteness(model);
    
    localStorage.setItem(key, JSON.stringify(model));
    console.log(`✓ Engagement saved: ${engagementId} (${model.engagement.metadata.completeness}% complete)`);
  }

  /**
   * Load engagement model from localStorage
   * @param {string} engagementId - Engagement ID
   * @returns {Object|null} - Full engagement model or null
   */
  loadEngagement(engagementId) {
    const key = `${this.storagePrefix}model_${engagementId}`;
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const model = JSON.parse(stored);
      this.currentEngagementId = engagementId;
      return model;
    } catch (error) {
      console.error('Error loading engagement:', engagementId, error);
      return null;
    }
  }

  /**
   * Get current engagement
   * @returns {Object|null}
   */
  getCurrentEngagement() {
    if (!this.currentEngagementId) {
      const currentId = localStorage.getItem(`${this.storagePrefix}current`);
      if (currentId) this.currentEngagementId = currentId;
    }
    
    return this.currentEngagementId ? this.loadEngagement(this.currentEngagementId) : null;
  }

  /**
   * Get current engagement ID
   * @returns {string|null}
   */
  getCurrentEngagementId() {
    if (!this.currentEngagementId) {
      const currentId = localStorage.getItem(`${this.storagePrefix}current`);
      if (currentId) this.currentEngagementId = currentId;
    }
    
    return this.currentEngagementId;
  }

  /**
   * Set current engagement
   * @param {string} engagementId - Engagement ID
   */
  setCurrentEngagement(engagementId) {
    this.currentEngagementId = engagementId;
    localStorage.setItem(`${this.storagePrefix}current`, engagementId);
  }

  /**
   * Delete engagement
   * @param {string} engagementId - Engagement ID
   */
  deleteEngagement(engagementId) {
    const key = `${this.storagePrefix}model_${engagementId}`;
    localStorage.removeItem(key);
    
    if (this.currentEngagementId === engagementId) {
      this.currentEngagementId = null;
      localStorage.removeItem(`${this.storagePrefix}current`);
    }
    
    console.log(`✓ Engagement deleted: ${engagementId}`);
  }

  /**
   * Archive engagement
   * @param {string} engagementId - Engagement ID
   */
  archiveEngagement(engagementId) {
    const model = this.loadEngagement(engagementId);
    if (!model) return false;
    
    model.engagement.status = 'archived';
    
    // Move to archive
    const archiveKey = `${this.storagePrefix}archive_${engagementId}`;
    localStorage.setItem(archiveKey, JSON.stringify(model));
    
    // Remove from active
    this.deleteEngagement(engagementId);
    
    console.log(`✓ Engagement archived: ${engagementId}`);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════
  // ENTITY CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Generic add entity method
   * @param {string} entityType - Entity type (stakeholders, applications, etc.)
   * @param {Object} entity - Entity data
   * @returns {boolean}
   */
  addEntity(entityType, entity) {
    const model = this.getCurrentEngagement();
    if (!model) {
      console.error('No current engagement');
      return false;
    }

    if (!model[entityType]) {
      model[entityType] = [];
    }

    // Generate ID if not provided
    if (!entity.id) {
      entity.id = this.generateEntityId(entityType);
    }

    model[entityType].push(entity);
    this.saveEngagement(this.currentEngagementId, model);
    return true;
  }

  /**
   * Generic update entity method
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @param {Object} updates - Updated fields
   * @returns {boolean}
   */
  updateEntity(entityType, entityId, updates) {
    const model = this.getCurrentEngagement();
    if (!model) return false;

    const index = model[entityType]?.findIndex(e => e.id === entityId);
    if (index === -1) {
      console.error(`Entity not found: ${entityType}/${entityId}`);
      return false;
    }

    model[entityType][index] = { ...model[entityType][index], ...updates };
    this.saveEngagement(this.currentEngagementId, model);
    return true;
  }

  /**
   * Generic delete entity method
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {boolean}
   */
  deleteEntity(entityType, entityId) {
    const model = this.getCurrentEngagement();
    if (!model) return false;

    const index = model[entityType]?.findIndex(e => e.id === entityId);
    if (index === -1) return false;

    model[entityType].splice(index, 1);
    this.saveEngagement(this.currentEngagementId, model);
    return true;
  }

  /**
   * Get all entities of a type
   * @param {string} entityType - Entity type
   * @returns {Array}
   */
  getEntities(entityType) {
    const model = this.getCurrentEngagement();
    return model?.[entityType] || [];
  }

  /**
   * Get single entity by ID
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {Object|null}
   */
  getEntity(entityType, entityId) {
    const model = this.getCurrentEngagement();
    return model?.[entityType]?.find(e => e.id === entityId) || null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEGMENT LIBRARY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get all segment templates
   * @returns {Array}
   */
  getSegmentTemplates() {
    try {
      const stored = localStorage.getItem(`${this.storagePrefix}segment_templates`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading segment templates:', error);
      return [];
    }
  }

  /**
   * Get segment template by ID
   * @param {string} segmentId - Segment ID
   * @returns {Object|null}
   */
  getSegmentTemplate(segmentId) {
    const templates = this.getSegmentTemplates();
    return templates.find(t => t.id === segmentId) || null;
  }

  /**
   * Save custom segment template
   * @param {Object} segment - Segment template
   */
  saveSegmentTemplate(segment) {
    const templates = this.getSegmentTemplates();
    const index = templates.findIndex(t => t.id === segment.id);
    
    if (index !== -1) {
      templates[index] = segment;
    } else {
      templates.push(segment);
    }
    
    localStorage.setItem(`${this.storagePrefix}segment_templates`, JSON.stringify(templates));
    console.log(`✓ Segment template saved: ${segment.name}`);
  }

  /**
   * Apply segment template to current engagement
   * @param {string} segmentId - Segment ID
   */
  applySegmentTemplate(segmentId) {
    const template = this.getSegmentTemplate(segmentId);
    const model = this.getCurrentEngagement();
    
    if (!template || !model) return false;

    // Create architecture view from reference architectures
    template.referenceArchitectures?.forEach((archName, index) => {
      this.addEntity('architectureViews', {
        id: `ARCH-${String(index + 1).padStart(3, '0')}`,
        name: archName,
        type: 'target',
        description: `Reference architecture for ${archName}`,
        principles: template.commonPrinciples || []
      });
    });

    // Create capabilities from white-spots
    template.typicalWhiteSpots?.forEach((whiteSpot, index) => {
      this.addEntity('capabilities', {
        id: `CAP-${String(index + 1).padStart(3, '0')}`,
        name: whiteSpot,
        level: 'L1',
        domain: 'Segment Default',
        maturity: 2,
        targetMaturity: 4,
        strategicImportance: 'high'
      });
    });

    // Create initiative themes
    template.standardThemes?.forEach((theme, index) => {
      this.addEntity('initiatives', {
        id: `INIT-${String(index + 1).padStart(3, '0')}`,
        name: theme,
        linkedThemes: [theme],
        businessOutcomes: ['To be defined'],
        valueType: ['cost', 'risk'],
        timeHorizon: 'mid',
        status: 'option'
      });
    });

    console.log(`✓ Segment template applied: ${template.name}`);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Validate engagement model completeness
   * @param {Object} model - Engagement model
   * @returns {Object} - Validation result with errors and warnings
   */
  validateModel(model) {
    const errors = [];
    const warnings = [];
    const ValidationRules = window.EA_EngagementSchema?.ValidationRules || {};

    // Validate engagement
    if (ValidationRules.engagement) {
      const engErrors = this.validateEntity(model.engagement, ValidationRules.engagement);
      errors.push(...engErrors);
    }

    // Validate initiatives
    model.initiatives?.forEach(initiative => {
      if (ValidationRules.initiative) {
        const initErrors = this.validateEntity(initiative, ValidationRules.initiative);
        errors.push(...initErrors.map(e => `Initiative ${initiative.id}: ${e}`));
      }
    });

    // Validate roadmap items
    model.roadmapItems?.forEach(item => {
      if (!model.initiatives?.find(i => i.id === item.initiativeId)) {
        errors.push(`RoadmapItem ${item.id}: references non-existent initiative ${item.initiativeId}`);
      }
    });

    // Validate decisions
    model.decisions?.forEach(decision => {
      if (ValidationRules.decision) {
        const decErrors = this.validateEntity(decision, ValidationRules.decision);
        errors.push(...decErrors.map(e => `Decision ${decision.id}: ${e}`));
      }
    });

    // Warnings for missing data
    if (!model.stakeholders?.length) warnings.push('No stakeholders defined');
    if (!model.applications?.length) warnings.push('No applications in portfolio');
    if (!model.initiatives?.length) warnings.push('No initiatives defined');
    if (!model.decisions?.length) warnings.push('No decisions logged');

    return { 
      valid: errors.length === 0, 
      errors, 
      warnings,
      completeness: this.calculateCompleteness(model)
    };
  }

  /**
   * Validate single entity against schema rules
   * @param {Object} entity - Entity to validate
   * @param {Object} rules - Validation rules
   * @returns {Array} - Array of error messages
   */
  validateEntity(entity, rules) {
    const errors = [];

    // Check required fields
    rules.required?.forEach(field => {
      const value = this.getNestedValue(entity, field);
      if (value === undefined || value === null || value === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check custom validation rules
    rules.checks?.forEach(check => {
      const value = this.getNestedValue(entity, check.field);
      
      if (check.rule === 'minLength' && Array.isArray(value) && value.length < check.value) {
        errors.push(check.message);
      }
      
      if (check.rule === 'required' && !value) {
        errors.push(check.message);
      }
    });

    return errors;
  }

  /**
   * Get nested object value by dot notation path
   * @param {Object} obj - Object to query
   * @param {string} path - Dot notation path (e.g., 'governance.decisionForum')
   * @returns {*} - Value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate model completeness percentage
   * @param {Object} model - Engagement model
   * @returns {number} - Percentage (0-100)
   */
  calculateCompleteness(model) {
    let score = 0;
    let maxScore = 0;

    // Engagement basic info (20 points)
    maxScore += 20;
    if (model.engagement?.id && model.engagement?.name && model.engagement?.theme) score += 10;
    if (model.engagement?.successCriteria?.length > 0) score += 5;
    if (model.engagement?.governance?.decisionForum) score += 5;

    // Stakeholders (15 points)
    maxScore += 15;
    if (model.stakeholders?.length > 0) score += 10;
    if (model.stakeholders?.length >= 3) score += 5;

    // Applications (15 points)
    maxScore += 15;
    if (model.applications?.length > 0) score += 10;
    if (model.applications?.length >= 5) score += 5;

    // Capabilities (10 points)
    maxScore += 10;
    if (model.capabilities?.length > 0) score += 10;

    // Initiatives (20 points)
    maxScore += 20;
    if (model.initiatives?.length > 0) score += 10;
    if (model.initiatives?.length >= 3) score += 5;
    if (model.initiatives?.some(i => i.status === 'approved')) score += 5;

    // Roadmap (10 points)
    maxScore += 10;
    if (model.roadmapItems?.length > 0) score += 10;

    // Decisions (10 points)
    maxScore += 10;
    if (model.decisions?.length > 0) score += 5;
    if (model.decisions?.some(d => d.status === 'approved')) score += 5;

    return Math.round((score / maxScore) * 100);
  }

  // ═══════════════════════════════════════════════════════════════════
  // IMPORT/EXPORT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Export engagement to JSON
   * @param {string} engagementId - Engagement ID
   * @returns {string} - JSON string
   */
  exportEngagementJSON(engagementId) {
    const model = engagementId ? this.loadEngagement(engagementId) : this.getCurrentEngagement();
    if (!model) return null;

    return JSON.stringify(model, null, 2);
  }

  /**
   * Import engagement from JSON
   * @param {string} jsonString - JSON string
   * @returns {string|null} - Engagement ID or null on error
   */
  importEngagementJSON(jsonString) {
    try {
      const model = JSON.parse(jsonString);
      
      if (!model.engagement?.id) {
        throw new Error('Invalid engagement JSON: missing engagement.id');
      }

      this.saveEngagement(model.engagement.id, model);
      return model.engagement.id;
    } catch (error) {
      console.error('Error importing engagement:', error);
      return null;
    }
  }

  /**
   * Import applications from APM Toolkit
   * PRESERVES ALL APM DATA using unified schema
   * @returns {number} - Number of applications imported
   */
  importFromAPMToolkit() {
    const dataManager = new EA_DataManager();
    let apmData = dataManager.getIntegrationData('apm_latest');
    
    // Fallback: Check if there's EA export data available (for testing/demo)
    if (!apmData || !apmData.applications) {
      console.warn('No APM data available for import at integration_apm_latest');
      
      // Try to find EA export data as alternative
      const eaExport = dataManager.getIntegrationData('ea_export_latest');
      if (eaExport && eaExport.applications) {
        console.info('Found EA export data - using for demo/testing purposes');
        apmData = eaExport;
      } else {
        console.warn('No APM or EA export data found. Please ensure APM Toolkit has exported data first.');
        return 0;
      }
    }

    let importCount = 0;
    const timestamp = new Date().toISOString();
    
    apmData.applications.forEach(app => {
      // UNIFIED MAPPING: Preserve ALL APM fields using extended schema
      const engagementApp = {
        // Core identifiers
        id: app.id, // Keep original APM ID (app_timestamp)
        name: app.name,
        description: app.description || '',
        
        // Organizational context
        businessDomain: app.department || app.businessDomain || 'Unknown',
        department: app.department,
        owner: app.owner,
        vendor: app.vendor,
        technology: app.technology,
        
        // Lifecycle management (support both EA and APM enums)
        lifecycle: app.lifecycle || 'active', // Keep original APM lifecycle
        action: app.action, // retain/invest/replace/consolidate/retire
        sunsetCandidate: app.action === 'retire',
        modernizationCandidate: app.action === 'invest' || app.action === 'replace',
        
        // Financial data (preserve separate capex/opex AND calculate combined)
        currency: app.currency || 'SEK',
        capex: app.capex || 0,
        opex: app.opex || 0,
        annualCost: (app.capex || 0) + (app.opex || 0),
        
        // Quality and risk assessment
        riskLevel: this.mapAPMRisk(app.technicalFit, app.businessValue),
        technicalDebt: app.technicalFit < 5 ? 'high' : app.technicalFit < 7 ? 'medium' : 'low',
        technicalFit: app.technicalFit,
        businessValue: app.businessValue,
        regulatorySensitivity: app.regulatorySensitivity || 'medium',
        
        // User and adoption metrics
        users: app.users || 0,
        
        // AI transformation readiness
        aiMaturity: app.aiMaturity,
        aiPotential: app.aiPotential,
        
        // Capability mapping (preserve APM capability links)
        businessCapabilities: app.businessCapabilities || [],
        linkedCapabilities: app.businessCapabilities || [],
        
        // EA-specific relationships
        constraints: [],
        evidenceRefs: ['imported-from-apm'],
        
        // Additional notes
        notes: app.notes || '',
        
        // Metadata (track origin and preserve APM metadata)
        metadata: {
          createdAt: app.metadata?.createdAt || timestamp,
          updatedAt: timestamp,
          createdBy: app.metadata?.createdBy || 'apm-import',
          source: 'APM',
          apmId: app.id // Track original APM ID for re-export
        }
      };

      this.addEntity('applications', engagementApp);
      importCount++;
    });

    // Also import capabilities if available
    if (apmData.capabilities && Array.isArray(apmData.capabilities)) {
      this.importCapabilitiesFromAPM(apmData.capabilities);
    }

    console.log(`✓ Imported ${importCount} applications from APM Toolkit (full data preserved)`);
    return importCount;
  }

  /**
   * Import capabilities from APM Toolkit
   * @param {Array} apmCapabilities - APM capabilities array
   */
  importCapabilitiesFromAPM(apmCapabilities) {
    let importCount = 0;
    
    apmCapabilities.forEach(cap => {
      // Check if capability already exists
      const existing = this.getEntities('capabilities').find(c => 
        c.id === cap.id || c.name === cap.name
      );
      
      if (!existing) {
        const engagementCap = {
          id: cap.id,
          name: cap.name,
          level: cap.level || 'L1',
          parentId: cap.parentId,
          domain: cap.domain || 'Unknown',
          maturity: cap.maturity || 3,
          targetMaturity: cap.maturity || 3,
          gap: 0,
          strategicImportance: cap.strategicImportance || 'medium',
          linkedApplications: cap.linkedApplications || [],
          description: cap.description || '',
          metadata: {
            source: 'APM',
            apmId: cap.id
          }
        };
        
        this.addEntity('capabilities', engagementCap);
        importCount++;
      }
    });
    
    if (importCount > 0) {
      console.log(`✓ Imported ${importCount} capabilities from APM Toolkit`);
    }
  }

  /**
   * Export applications to APM Toolkit format
   * CONVERTS EA data to APM-compatible format for seamless integration
   * @returns {Object} - APM-compatible data structure { applications: [], capabilities: [] }
   */
  exportToAPMToolkit() {
    const model = this.getCurrentEngagement();
    
    if (!model || !model.applications) {
      console.warn('No engagement data to export');
      return null;
    }

    const timestamp = new Date().toISOString();
    const apmApplications = [];
    
    // Convert EA applications to APM format
    model.applications.forEach(app => {
      const apmApp = {
        // Use original APM ID if available, otherwise generate one
        id: app.metadata?.apmId || app.id.startsWith('app_') ? app.id : `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        
        // Core fields
        name: app.name,
        description: app.description || '',
        
        // Organizational
        department: app.department || app.businessDomain,
        owner: app.owner || '',
        vendor: app.vendor || '',
        technology: app.technology || '',
        
        // Financial
        currency: app.currency || 'SEK',
        capex: app.capex || 0,
        opex: app.opex || 0,
        
        // User metrics
        users: app.users || 0,
        
        // Lifecycle (convert EA lifecycle back to APM if needed)
        lifecycle: this.mapEALifecycleToAPM(app.lifecycle),
        action: app.action || this.deriveAPMAction(app),
        
        // Assessment scores
        technicalFit: app.technicalFit || this.deriveTechnicalFit(app),
        businessValue: app.businessValue || this.deriveBusinessValue(app),
        
        // AI readiness
        aiMaturity: app.aiMaturity || 3,
        aiPotential: app.aiPotential || 'Medium',
        
        // Capability links
        businessCapabilities: app.businessCapabilities || app.linkedCapabilities || [],
        
        // Additional notes
        notes: app.notes || '',
        
        // Metadata
        metadata: {
          createdAt: app.metadata?.createdAt || timestamp,
          updatedAt: timestamp,
          createdBy: app.metadata?.createdBy || 'ea-export',
          eaId: app.id // Track original EA ID for re-import
        }
      };
      
      apmApplications.push(apmApp);
    });

    // Convert EA capabilities to APM format
    const apmCapabilities = [];
    if (model.capabilities && Array.isArray(model.capabilities)) {
      model.capabilities.forEach(cap => {
        const apmCap = {
          id: cap.metadata?.apmId || cap.id,
          name: cap.name,
          level: cap.level || 'L1',
          parentId: cap.parentId,
          domain: cap.domain,
          industryTag: model.engagement?.segment || 'General',
          strategicImportance: cap.strategicImportance || 'medium',
          maturity: cap.maturity || 3,
          aiPotential: cap.aiPotential || 'Medium',
          linkedApplications: cap.linkedApplications || [],
          description: cap.description || '',
          metadata: {
            createdAt: cap.metadata?.createdAt || timestamp,
            updatedAt: timestamp,
            source: 'EA',
            eaId: cap.id
          }
        };
        
        apmCapabilities.push(apmCap);
      });
    }

    const exportData = {
      applications: apmApplications,
      capabilities: apmCapabilities,
      metadata: {
        exportedAt: timestamp,
        exportedFrom: 'EA_Engagement_Toolkit',
        engagementId: model.engagement?.id,
        engagementName: model.engagement?.name,
        version: '1.0'
      }
    };

    // Save to integration storage for APM Toolkit to access
    const dataManager = new EA_DataManager();
    dataManager.saveIntegrationData('ea_export_latest', exportData);

    console.log(`✓ Exported ${apmApplications.length} applications and ${apmCapabilities.length} capabilities to APM format`);
    return exportData;
  }

  /**
   * Map EA lifecycle to APM lifecycle
   * @param {string} eaLifecycle - EA lifecycle value
   * @returns {string} - APM lifecycle value
   */
  mapEALifecycleToAPM(eaLifecycle) {
    const mapping = {
      'tolerate': 'active',
      'invest': 'phaseIn',
      'migrate': 'legacy',
      'retire': 'phaseOut',
      // Pass through APM values if already in APM format
      'phaseIn': 'phaseIn',
      'active': 'active',
      'legacy': 'legacy',
      'phaseOut': 'phaseOut',
      'retired': 'retired'
    };
    return mapping[eaLifecycle] || 'active';
  }

  /**
   * Derive APM action from EA application data
   * @param {Object} app - EA application object
   * @returns {string} - APM action
   */
  deriveAPMAction(app) {
    if (app.sunsetCandidate) return 'retire';
    if (app.modernizationCandidate) return 'replace';
    if (app.lifecycle === 'invest') return 'invest';
    if (app.lifecycle === 'migrate') return 'replace';
    if (app.lifecycle === 'retire') return 'retire';
    return 'retain';
  }

  /**
   * Derive technical fit score from EA risk and debt levels
   * @param {Object} app - EA application object
   * @returns {number} - Technical fit score (1-10)
   */
  deriveTechnicalFit(app) {
    // Convert qualitative assessments to numeric score
    const debtScores = { 'low': 9, 'medium': 6, 'high': 3, 'critical': 1 };
    return debtScores[app.technicalDebt] || 5;
  }

  /**
   * Derive business value score from EA risk level
   * @param {Object} app - EA application object
   * @returns {number} - Business value score (1-10)
   */
  deriveBusinessValue(app) {
    // Invert risk level to get value (low risk = high value for critical systems)
    const valueScores = { 'low': 6, 'medium': 7, 'high': 8, 'critical': 9 };
    return valueScores[app.riskLevel] || 5;
  }

  /**
   * Map APM lifecycle to engagement lifecycle
   * @param {string} apmLifecycle - APM lifecycle value
   * @returns {string} - Engagement lifecycle value
   */
  mapAPMLifecycle(apmLifecycle) {
    const mapping = {
      'phaseIn': 'invest',
      'active': 'tolerate',
      'legacy': 'migrate',
      'phaseOut': 'retire',
      'retired': 'retire'
    };
    return mapping[apmLifecycle] || 'tolerate';
  }

  /**
   * Map APM scores to risk level
   * @param {number} technicalFit - Technical fit score (1-10)
   * @param {number} businessValue - Business value score (1-10)
   * @returns {string} - Risk level
   */
  mapAPMRisk(technicalFit, businessValue) {
    const score = (technicalFit || 5) + (businessValue || 5);
    if (score < 8) return 'critical';
    if (score < 12) return 'high';
    if (score < 16) return 'medium';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Generate unique entity ID
   * @param {string} entityType - Entity type
   * @returns {string} - Generated ID
   */
  generateEntityId(entityType) {
    const prefixes = {
      customers: 'CUST',
      stakeholders: 'STK',
      applications: 'APP',
      capabilities: 'CAP',
      risks: 'RISK',
      constraints: 'CON',
      decisions: 'DEC',
      assumptions: 'ASM',
      initiatives: 'INIT',
      roadmapItems: 'RM',
      architectureViews: 'ARCH',
      artifacts: 'ART',
      stories: 'STORY'
    };

    const prefix = prefixes[entityType] || 'ENT';
    const model = this.getCurrentEngagement();
    const existing = model?.[entityType] || [];
    const maxId = existing.reduce((max, entity) => {
      const match = entity.id.match(/\d+$/);
      return match ? Math.max(max, parseInt(match[0])) : max;
    }, 0);

    const newId = maxId + 1;
    const padding = entityType === 'stories' ? 4 : 3;
    return `${prefix}-${String(newId).padStart(padding, '0')}`;
  }

  /**
   * Clear all engagement data (for testing)
   */
  clearAllData() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.currentEngagementId = null;
    
    console.log(`✓ Cleared ${keysToRemove.length} engagement items`);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_EngagementManager = EA_EngagementManager;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_EngagementManager;
}
