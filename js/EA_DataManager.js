/**
 * EA Platform V3 - Data Manager
 * Handles unified localStorage structure, project management, and data persistence
 */

class EA_DataManager {
  constructor() {
    this.config = window.EA_Config || EA_Config;
    this.currentProjectId = null;
    this.initializeStorage();
  }
  
  /**
   * Initialize storage structure and migrate legacy data if needed
   */
  initializeStorage() {
    // Check if config exists
    let eaConfig = this.getStorageItem(this.config.storage.apiKey);
    
    if (!eaConfig) {
      // Create new config structure
      eaConfig = {
        version: this.config.version,
        apiKey: this.migrateLegacyApiKey(),
        initialized: new Date().toISOString(),
        settings: {
          mode: this.config.modes.AI_ASSISTED,
          autoSave: true,
          autoSaveInterval: this.config.autoSaveInterval
        }
      };
      this.setStorageItem(this.config.storage.apiKey, eaConfig);
    }
    
    // Check if projects exist
    let projects = this.getStorageItem(this.config.storage.projects);
    if (!projects) {
      projects = {};
      
      // Migrate V2 data if available
      const v2Data = this.getStorageItem(this.config.storage.legacy.v2_models);
      if (v2Data) {
        const migratedProject = this.migrateV2Project(v2Data);
        projects[migratedProject.id] = migratedProject;
        console.log('✅ Migrated V2 data to V3 format');
      }
      
      this.setStorageItem(this.config.storage.projects, projects);
    }
    
    // Load current project
    const currentProjectId = this.getStorageItem(this.config.storage.currentProject);
    if (currentProjectId && projects[currentProjectId]) {
      this.currentProjectId = currentProjectId;
    }
  }
  
  /**
   * Migrate legacy API key from any old storage location
   */
  migrateLegacyApiKey() {
    const legacyKeys = this.config.storage.legacy;
    
    // Try V2 key first
    let apiKey = localStorage.getItem(legacyKeys.v2_apiKey);
    
    // Try other toolkit keys if V2 not found
    if (!apiKey) {
      const keys = Object.values(legacyKeys);
      for (const key of keys) {
        apiKey = localStorage.getItem(key);
        if (apiKey) break;
      }
    }
    
    return apiKey || null;
  }
  
  /**
   * Migrate V2 project data to V3 format
   */
  migrateV2Project(v2Data) {
    const projectId = 'migrated_' + Date.now();
    return {
      id: projectId,
      name: 'Migrerat från V2',
      description: 'Automatiskt migrerat från EA Platform V2',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      metadata: {
        completionStatus: {
          platform: 100,
          bmc: 0,
          capabilityMap: 0,
          wardley: 0,
          valueChain: 0,
          maturity: 0
        },
        workshopCount: 0,
        participants: []
      },
      data: {
        platform: typeof v2Data === 'string' ? JSON.parse(v2Data) : v2Data,
        bmc: null,
        capabilityMap: null,
        wardley: null,
        valueChain: null,
        maturity: null
      }
    };
  }
  
  /**
   * Get unified API key
   */
  getApiKey() {
    const config = this.getStorageItem(this.config.storage.apiKey);
    return config?.apiKey || null;
  }
  
  /**
   * Set unified API key (updates all legacy locations for compatibility)
   */
  setApiKey(apiKey) {
    // Update unified config
    const config = this.getStorageItem(this.config.storage.apiKey) || {};
    config.apiKey = apiKey;
    this.setStorageItem(this.config.storage.apiKey, config);
    
    // Update legacy keys for backward compatibility with standalone toolkits
    const legacyKeys = this.config.storage.legacy;
    Object.values(legacyKeys).forEach(key => {
      localStorage.setItem(key, apiKey);
    });
    
    console.log('✅ API Key updated across all storage locations');
    return true;
  }
  
  /**
   * Create new project
   */
  createProject(name, description = '') {
    const projectId = 'project_' + Date.now();
    const project = {
      id: projectId,
      name: name,
      description: description,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      metadata: {
        completionStatus: {
          platform: 0,
          bmc: 0,
          capabilityMap: 0,
          wardley: 0,
          valueChain: 0,
          maturity: 0
        },
        workshopCount: 0,
        participants: []
      },
      data: {
        platform: this.getEmptyPlatformData(),
        bmc: null,
        capabilityMap: null,
        wardley: null,
        valueChain: null,
        maturity: null
      }
    };
    
    // Save project
    const projects = this.getStorageItem(this.config.storage.projects) || {};
    projects[projectId] = project;
    this.setStorageItem(this.config.storage.projects, projects);
    
    // Set as current project
    this.setCurrentProject(projectId);
    
    return project;
  }
  
  /**
   * Get empty platform data structure
   */
  getEmptyPlatformData() {
    return {
      valueStreams: [],
      capabilities: [],
      systems: [],
      aiAgents: [],
      processes: [],
      dataDomains: [],
      initiatives: [],
      operatingModel: {
        services: [],
        domains: [],
        valueChain: null
      },
      maturityScores: {}
    };
  }
  
  /**
   * Get all projects
   */
  getAllProjects() {
    const projects = this.getStorageItem(this.config.storage.projects) || {};
    return Object.values(projects).sort((a, b) => 
      new Date(b.lastModified) - new Date(a.lastModified)
    );
  }
  
  /**
   * Get project by ID
   */
  getProject(projectId) {
    const projects = this.getStorageItem(this.config.storage.projects) || {};
    return projects[projectId] || null;
  }
  
  /**
   * Get current project
   */
  getCurrentProject() {
    if (!this.currentProjectId) return null;
    return this.getProject(this.currentProjectId);
  }
  
  /**
   * Set current project
   */
  setCurrentProject(projectId) {
    this.currentProjectId = projectId;
    this.setStorageItem(this.config.storage.currentProject, projectId);
    return true;
  }
  
  /**
   * Update project data
   */
  updateProject(projectId, updates) {
    const projects = this.getStorageItem(this.config.storage.projects) || {};
    const project = projects[projectId];
    
    if (!project) {
      console.warn('updateProject: project not found —', projectId);
      return false;
    }
    
    // Merge updates
    Object.assign(project, updates);
    project.lastModified = new Date().toISOString();
    
    // Save
    projects[projectId] = project;
    this.setStorageItem(this.config.storage.projects, projects);
    
    return true;
  }
  
  /**
   * Update toolkit data within a project
   */
  updateToolkitData(projectId, toolkitId, data) {
    const project = this.getProject(projectId);
    if (!project) return false;
    
    project.data[toolkitId] = data;
    project.lastModified = new Date().toISOString();
    
    // Update completion status
    project.metadata.completionStatus[toolkitId] = this.calculateCompletion(toolkitId, data);
    
    // Save project
    const projects = this.getStorageItem(this.config.storage.projects) || {};
    projects[projectId] = project;
    this.setStorageItem(this.config.storage.projects, projects);
    
    return true;
  }
  
  /**
   * Calculate completion percentage for a toolkit
   */
  calculateCompletion(toolkitId, data) {
    if (!data) return 0;
    
    switch(toolkitId) {
      case 'platform':
        const fields = ['valueStreams', 'capabilities', 'systems', 'processes'];
        const completed = fields.filter(f => data[f] && data[f].length > 0).length;
        return Math.round((completed / fields.length) * 100);
        
      case 'bmc':
        const bmcFields = Object.keys(data || {});
        const bmcCompleted = bmcFields.filter(f => data[f] && data[f].length > 0).length;
        return Math.round((bmcCompleted / 9) * 100);
        
      case 'capabilityMap':
        const domains = data?.domains || [];
        if (domains.length === 0) return 0;
        const totalCaps = domains.reduce((sum, d) => sum + (d.capabilities?.length || 0), 0);
        return totalCaps > 0 ? 100 : 50;
        
      case 'wardley':
        return data?.components?.length > 0 ? 100 : 0;
        
      case 'valueChain':
        const vcFields = ['primary', 'support'];
        const vcCompleted = vcFields.filter(f => data[f] && data[f].length > 0).length;
        return Math.round((vcCompleted / 2) * 100);
        
      case 'maturity':
        return data?.scores ? 100 : 0;
        
      default:
        return 0;
    }
  }
  
  /**
   * Delete project
   */
  deleteProject(projectId) {
    const projects = this.getStorageItem(this.config.storage.projects) || {};
    
    if (!projects[projectId]) {
      console.error('Project not found:', projectId);
      return false;
    }
    
    delete projects[projectId];
    this.setStorageItem(this.config.storage.projects, projects);
    
    // Clear current project if it was deleted
    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
      localStorage.removeItem(this.config.storage.currentProject);
    }
    
    return true;
  }
  
  /**
   * Export project to JSON
   */
  exportProject(projectId) {
    const project = this.getProject(projectId);
    if (!project) return null;
    
    return {
      exportVersion: '3.0',
      exportDate: new Date().toISOString(),
      project: project
    };
  }
  
  /**
   * Import project from JSON
   */
  importProject(jsonData) {
    try {
      const imported = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Validate structure
      if (!imported.project || !imported.exportVersion) {
        throw new Error('Invalid export format');
      }
      
      // Generate new ID to avoid conflicts
      const newProjectId = 'imported_' + Date.now();
      const project = {
        ...imported.project,
        id: newProjectId,
        name: imported.project.name + ' (Imported)',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      // Save
      const projects = this.getStorageItem(this.config.storage.projects) || {};
      projects[newProjectId] = project;
      this.setStorageItem(this.config.storage.projects, projects);
      
      return project;
    } catch (error) {
      console.error('Import failed:', error);
      return null;
    }
  }
  
  /**
   * Storage helpers
   */
  getStorageItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', key, error);
      return null;
    }
  }
  
  setStorageItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to storage:', key, error);
      return false;
    }
  }
  
  /**
   * Clear all V3 data (for testing/reset)
   */
  clearAllData() {
    localStorage.removeItem(this.config.storage.apiKey);
    localStorage.removeItem(this.config.storage.projects);
    localStorage.removeItem(this.config.storage.currentProject);
    this.currentProjectId = null;
    console.log('✅ All V3 data cleared');
  }
  
  // ═══════════════════════════════════════════════════════════════════
  // CROSS-TOOLKIT INTEGRATION METHODS
  // ═══════════════════════════════════════════════════════════════════
  
  /**
   * Save integration data from one toolkit for consumption by another
   * @param {string} key - Integration identifier (e.g., 'bmc_latest', 'valuechain_to_capability')
   * @param {object} data - Data to store
   */
  saveIntegrationData(key, data) {
    try {
      const integrationKey = `ea_integration_${key}`;
      const integrationData = {
        data: data,
        timestamp: new Date().toISOString(),
        version: this.config.version
      };
      
      localStorage.setItem(integrationKey, JSON.stringify(integrationData));
      
      // Update last sync time
      localStorage.setItem('ea_integration_last_sync', new Date().toISOString());
      
      console.log(`✓ Integration data saved: ${key}`);
      return true;
    } catch (error) {
      console.error('Error saving integration data:', key, error);
      return false;
    }
  }
  
  /**
   * Get integration data from another toolkit
   * @param {string} key - Integration identifier
   * @returns {object|null} - Stored data or null if not found
   */
  getIntegrationData(key) {
    try {
      const integrationKey = `ea_integration_${key}`;
      const stored = localStorage.getItem(integrationKey);
      
      if (!stored) return null;
      
      const integrationData = JSON.parse(stored);
      return integrationData.data;
    } catch (error) {
      console.error('Error reading integration data:', key, error);
      return null;
    }
  }
  
  /**
   * Get integration data with metadata (timestamp, version)
   * @param {string} key - Integration identifier
   * @returns {object|null} - Full integration package or null
   */
  getIntegrationPackage(key) {
    try {
      const integrationKey = `ea_integration_${key}`;
      const stored = localStorage.getItem(integrationKey);
      
      if (!stored) return null;
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading integration package:', key, error);
      return null;
    }
  }
  
  /**
   * Check if integration data exists and is recent
   * @param {string} key - Integration identifier
   * @param {number} maxAgeMinutes - Maximum age in minutes (default 60)
   * @returns {boolean} - True if data exists and is fresh
   */
  hasRecentIntegrationData(key, maxAgeMinutes = 60) {
    const pkg = this.getIntegrationPackage(key);
    if (!pkg) return false;
    
    const dataAge = Date.now() - new Date(pkg.timestamp).getTime();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    
    return dataAge < maxAgeMs;
  }
  
  /**
   * List all available integration data keys
   * @returns {Array} - Array of integration keys
   */
  listIntegrationData() {
    const integrationKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ea_integration_')) {
        // Remove prefix for cleaner output
        integrationKeys.push(key.replace('ea_integration_', ''));
      }
    }
    
    return integrationKeys;
  }
  
  /**
   * Get integration summary status
   * @returns {object} - Status of all toolkit integrations
   */
  getIntegrationStatus() {
    return {
      bmc: {
        available: !!this.getIntegrationData('bmc_latest'),
        lastUpdated: this.getIntegrationPackage('bmc_latest')?.timestamp || null
      },
      valueChain: {
        available: !!this.getIntegrationData('valuechain_latest'),
        lastUpdated: this.getIntegrationPackage('valuechain_latest')?.timestamp || null
      },
      capabilityMap: {
        available: !!this.getIntegrationData('capability_latest'),
        lastUpdated: this.getIntegrationPackage('capability_latest')?.timestamp || null
      },
      strategyWorkbench: {
        available: !!this.getIntegrationData('strategy_latest'),
        lastUpdated: this.getIntegrationPackage('strategy_latest')?.timestamp || null
      },
      lastSync: localStorage.getItem('ea_integration_last_sync') || null
    };
  }
  
  /**
   * Clear integration data for a specific key or all integration data
   * @param {string|null} key - Specific key to clear, or null to clear all
   */
  clearIntegrationData(key = null) {
    if (key) {
      // Clear specific integration
      const integrationKey = `ea_integration_${key}`;
      localStorage.removeItem(integrationKey);
      console.log(`✓ Integration data cleared: ${key}`);
    } else {
      // Clear all integration data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith('ea_integration_')) {
          keysToRemove.push(storageKey);
        }
      }
      
      keysToRemove.forEach(k => localStorage.removeItem(k));
      console.log(`✓ All integration data cleared (${keysToRemove.length} items)`);
    }
  }

  /**
   * Save a structured tool report package (AS-IS, analysis, TO-BE)
   * @param {string} toolId - Toolkit identifier (bmc, valueChain, capability, strategy, maturity)
   * @param {object} reportData - Report payload
   */
  saveToolReport(toolId, reportData) {
    if (!toolId) return false;

    try {
      const reportKey = `ea_tool_report_${toolId}`;
      const payload = {
        toolId,
        savedAt: new Date().toISOString(),
        version: this.config.version,
        asIs: reportData?.asIs || null,
        analysis: reportData?.analysis || null,
        toBe: reportData?.toBe || null,
        meta: reportData?.meta || {}
      };

      localStorage.setItem(reportKey, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Error saving tool report:', toolId, error);
      return false;
    }
  }

  /**
   * Get one tool report package
   * @param {string} toolId - Toolkit identifier
   * @returns {object|null}
   */
  getToolReport(toolId) {
    if (!toolId) return null;

    try {
      const stored = localStorage.getItem(`ea_tool_report_${toolId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading tool report:', toolId, error);
      return null;
    }
  }

  /**
   * List all saved tool reports
   * @returns {Array}
   */
  getAllToolReports() {
    const reports = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('ea_tool_report_')) continue;

      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (parsed) reports.push(parsed);
      } catch (error) {
        console.warn('Skipping invalid tool report key:', key, error);
      }
    }

    return reports.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  }

  /**
   * Clear one tool report or all tool reports
   * @param {string|null} toolId - Toolkit identifier or null for all
   */
  clearToolReport(toolId = null) {
    if (toolId) {
      localStorage.removeItem(`ea_tool_report_${toolId}`);
      return;
    }

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ea_tool_report_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
  
  /**
   * Sync toolkit data to project
   * Useful for consolidating toolkit work into the main project
   * @param {string} toolkitId - Toolkit identifier (bmc, valueChain, etc.)
   * @param {object} data - Toolkit data to sync
   */
  syncToolkitToProject(toolkitId, data) {
    if (!this.currentProjectId) {
      console.error('No active project to sync to');
      return false;
    }
    
    return this.updateToolkitData(this.currentProjectId, toolkitId, data);
  }
  
  /**
   * Get toolkit data from current project
   * @param {string} toolkitId - Toolkit identifier
   * @returns {object|null} - Toolkit data or null
   */
  getToolkitDataFromProject(toolkitId) {
    const project = this.getCurrentProject();
    if (!project) return null;
    
    return project.data[toolkitId] || null;
  }
  
  /**
   * Check if current project has data for a specific toolkit
   * @param {string} toolkitId - Toolkit identifier
   * @returns {boolean} - True if toolkit data exists in project
   */
  hasToolkitData(toolkitId) {
    const data = this.getToolkitDataFromProject(toolkitId);
    return data !== null && Object.keys(data).length > 0;
  }
  
  /**
   * Get integration workflow status for current project
   * Shows which toolkits have been completed and can be integrated
   * @returns {object} - Workflow status
   */
  getWorkflowStatus() {
    if (!this.currentProjectId) {
      return {
        projectActive: false,
        steps: []
      };
    }
    
    const project = this.getCurrentProject();
    if (!project) return { projectActive: false, steps: [] };
    
    return {
      projectActive: true,
      projectName: project.name,
      steps: [
        {
          id: 'bmc',
          name: 'Business Model Canvas',
          completed: project.metadata.completionStatus.bmc >= 80,
          canExportTo: ['valueChain'],
          status: project.metadata.completionStatus.bmc
        },
        {
          id: 'valueChain',
          name: 'Value Chain Analyzer',
          completed: project.metadata.completionStatus.valueChain >= 80,
          canExportTo: ['platform', 'capabilityMap'],
          status: project.metadata.completionStatus.valueChain
        },
        {
          id: 'capabilityMap',
          name: 'Capability Mapping',
          completed: project.metadata.completionStatus.capabilityMap >= 80,
          canExportTo: ['wardley', 'platform'],
          status: project.metadata.completionStatus.capabilityMap
        },
        {
          id: 'wardley',
          name: 'Strategy Workbench',
          completed: project.metadata.completionStatus.wardley >= 80,
          canExportTo: ['platform'],
          status: project.metadata.completionStatus.wardley
        },
        {
          id: 'platform',
          name: 'EA Platform',
          completed: project.metadata.completionStatus.platform >= 80,
          canExportTo: [],
          status: project.metadata.completionStatus.platform
        }
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // APQC FRAMEWORK INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Load APQC PCF master data
   * @returns {Promise<object>} - APQC framework data
   */
  async loadAPQCFramework() {
    try {
      const response = await fetch('APAQ_Data/apqc_pcf_master.json');
      if (!response.ok) {
        throw new Error(`Failed to load APQC framework: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Cache in sessionStorage for performance
      sessionStorage.setItem('ea_apqc_framework', JSON.stringify(data));
      
      console.log('✅ APQC Framework loaded:', data.total_categories, 'categories');
      return data;
    } catch (error) {
      console.error('❌ Failed to load APQC framework:', error);
      return null;
    }
  }

  /**
   * Load APQC metadata mappings
   * @returns {Promise<object>} - Metadata mappings
   */
  async loadAPQCMetadata() {
    try {
      const response = await fetch('APAQ_Data/apqc_metadata_mapping.json');
      if (!response.ok) {
        throw new Error(`Failed to load APQC metadata: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Cache in sessionStorage
      sessionStorage.setItem('ea_apqc_metadata', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('❌ Failed to load APQC metadata:', error);
      return null;
    }
  }

  /**
   * Load APQC capability enrichment data
   * @returns {Promise<object>} - Enrichment data
   */
  async loadAPQCEnrichment() {
    try {
      const response = await fetch('APAQ_Data/apqc_capability_enrichment.json');
      if (!response.ok) {
        // Enrichment file may not exist yet if Excel hasn't been converted
        console.warn('⚠️ APQC enrichment file not found (run converter first)');
        return null;
      }
      const data = await response.json();
      
      // Cache in sessionStorage
      sessionStorage.setItem('ea_apqc_enrichment', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.warn('⚠️ APQC enrichment not available:', error.message);
      return null;
    }
  }

  /**
   * Get cached APQC framework or load if not cached
   * @returns {Promise<object>} - APQC framework data
   */
  async getAPQCFramework() {
    // Check cache first
    const cached = sessionStorage.getItem('ea_apqc_framework');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Invalid cached APQC data, reloading...');
      }
    }
    
    return await this.loadAPQCFramework();
  }

  /**
   * Get APQC capabilities filtered by business type
   * @param {string} businessType - Business type filter (e.g., "Manufacturing", "Services")
   * @returns {Promise<Array>} - Filtered capabilities
   */
  async getAPQCCapabilitiesByBusinessType(businessType) {
    const framework = await this.getAPQCFramework();
    const metadata = await this.loadAPQCMetadata();
    
    if (!framework || !metadata) return [];

    const mapping = metadata.business_type_mappings[businessType];
    if (!mapping) return framework.categories; // Return all if no specific mapping

    // Filter categories based on business type
    return framework.categories.filter(category => {
      return mapping.applicable_categories?.includes(category.code) ||
             mapping.primary_categories?.includes(category.code) ||
             mapping.secondary_categories?.includes(category.code);
    });
  }

  /**
   * Get APQC capabilities filtered by strategic intent
   * @param {string} strategicIntent - Strategic intent filter (e.g., "Growth", "Innovation")
   * @returns {Promise<Array>} - Filtered capabilities
   */
  async getAPQCCapabilitiesByIntent(strategicIntent) {
    const framework = await this.getAPQCFramework();
    const metadata = await this.loadAPQCMetadata();
    
    if (!framework || !metadata) return [];

    const mapping = metadata.strategic_intent_mappings[strategicIntent];
    if (!mapping) return framework.categories;

    // Filter categories based on strategic intent
    return framework.categories.filter(category => {
      return mapping.primary_categories?.includes(category.code);
    });
  }

  /**
   * Enrich project capabilities with APQC data
   * @param {string} projectId - Project ID
   * @param {object} options - Enrichment options (businessType, strategicIntent)
   * @returns {Promise<boolean>} - Success status
   */
  async enrichProjectWithAPQC(projectId, options = {}) {
    const project = this.getProject(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return false;
    }

    try {
      const framework = await this.getAPQCFramework();
      const enrichment = await this.loadAPQCEnrichment();
      const metadata = await this.loadAPQCMetadata();

      if (!framework) {
        console.error('APQC framework not available');
        return false;
      }

      // Filter capabilities based on options
      let capabilities = framework.categories;
      
      if (options.businessType) {
        capabilities = await this.getAPQCCapabilitiesByBusinessType(options.businessType);
      }
      
      if (options.strategicIntent) {
        const intentCapabilities = await this.getAPQCCapabilitiesByIntent(options.strategicIntent);
        // Intersect if both filters applied
        if (options.businessType) {
          const intentIds = new Set(intentCapabilities.map(c => c.id));
          capabilities = capabilities.filter(c => intentIds.has(c.id));
        } else {
          capabilities = intentCapabilities;
        }
      }

      // Store APQC data in project
      const apqcData = {
        source: 'APQC',
        framework_version: framework.framework_version,
        imported_date: new Date().toISOString(),
        filters: options,
        capabilities: capabilities,
        enrichment: enrichment || [],
        metadata: metadata
      };

      // Update project with APQC data
      this.updateProject(projectId, {
        data: {
          ...project.data,
          apqc: apqcData
        },
        metadata: {
          ...project.metadata,
          apqc_integrated: true,
          apqc_version: framework.framework_version
        }
      });

      console.log(`✅ Project enriched with ${capabilities.length} APQC capabilities`);
      return true;

    } catch (error) {
      console.error('❌ Failed to enrich project with APQC:', error);
      return false;
    }
  }

  /**
   * Get APQC capabilities for current project
   * @returns {Array} - APQC capabilities or empty array
   */
  getProjectAPQCCapabilities() {
    const project = this.getCurrentProject();
    if (!project || !project.data.apqc) {
      return [];
    }
    
    return project.data.apqc.capabilities || [];
  }

  /**
   * Check if current project has APQC integration
   * @returns {boolean} - True if APQC data exists
   */
  hasAPQCIntegration() {
    const project = this.getCurrentProject();
    return project && project.metadata.apqc_integrated === true;
  }

  /**
   * Get APQC integration status for UI display
   * @returns {object} - Integration status
   */
  getAPQCStatus() {
    const project = this.getCurrentProject();
    
    if (!project) {
      return {
        integrated: false,
        message: 'No active project'
      };
    }

    if (!project.metadata.apqc_integrated) {
      return {
        integrated: false,
        message: 'APQC framework not loaded for this project'
      };
    }

    const apqcData = project.data.apqc;
    return {
      integrated: true,
      version: apqcData.framework_version,
      imported_date: apqcData.imported_date,
      capability_count: apqcData.capabilities?.length || 0,
      filters: apqcData.filters,
      message: `Powered by APQC PCF ${apqcData.framework_version}`
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_DataManager = EA_DataManager;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_DataManager;
}
