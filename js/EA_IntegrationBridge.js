/**
 * EA_IntegrationBridge - Unified interface for toolkit integrations
 * Location: js/EA_IntegrationBridge.js
 * 
 * Responsibilities:
 * - Connect to APQC Framework (via EA_DataManager)
 * - Import from APM Toolkit (localStorage)
 * - Import from BMC Toolkit (localStorage)
 * - Sync with Capability Management (localStorage)
 * - Track integration status and last sync times
 * - Provide bidirectional data flow
 */

class EA_IntegrationBridge {
  constructor(engagementManager, dataManager, workflowEngine) {
    this.engagementManager = engagementManager;
    this.dataManager = dataManager;
    this.workflowEngine = workflowEngine;
  }

  // ═══════════════════════════════════════════════════════════════════
  // APQC FRAMEWORK INTEGRATION (leverages EA_DataManager)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Load APQC framework data
   */
  async loadAPQCFramework() {
    try {
      console.log('🔄 Loading APQC Framework...');
      
      // Use existing EA_DataManager methods
      const framework = await this.dataManager.loadAPQCFramework();
      
      if (framework && framework.processes) {
        // Update integration status
        this.updateIntegrationStatus('apqc', {
          status: 'connected',
          frameworkVersion: framework.version || 'PCF v8.0',
          lastSync: new Date().toISOString()
        });
        
        console.log(`✅ APQC Framework loaded: ${framework.processes.length} processes`);
        return { success: true, data: framework };
      } else {
        console.warn('⚠️ APQC Framework data not available');
        return { success: false, error: 'Framework data not found' };
      }
    } catch (error) {
      console.error('❌ Failed to load APQC Framework:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get APQC capabilities by business type (industry)
   */
  async getAPQCCapabilitiesByIndustry(industry) {
    try {
      const capabilities = await this.dataManager.getAPQCCapabilitiesByBusinessType(industry);
      
      if (capabilities && capabilities.length > 0) {
        console.log(`✅ Loaded ${capabilities.length} APQC capabilities for ${industry}`);
        return { success: true, data: capabilities };
      } else {
        return { success: false, error: `No capabilities found for ${industry}` };
      }
    } catch (error) {
      console.error('❌ Failed to load APQC capabilities:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get APQC capabilities by strategic intent
   */
  async getAPQCCapabilitiesByIntent(intent) {
    try {
      const capabilities = await this.dataManager.getAPQCCapabilitiesByIntent(intent);
      
      if (capabilities && capabilities.length > 0) {
        console.log(`✅ Loaded ${capabilities.length} APQC capabilities for intent: ${intent}`);
        return { success: true, data: capabilities };
      } else {
        return { success: false, error: `No capabilities found for intent: ${intent}` };
      }
    } catch (error) {
      console.error('❌ Failed to load APQC capabilities by intent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import APQC capabilities to engagement
   */
  async importAPQCCapabilities(industry, intent) {
    try {
      const engagement = this.engagementManager.getCurrentEngagement();
      if (!engagement) {
        return { success: false, error: 'No active engagement' };
      }

      // Get capabilities from APQC
      const result = industry 
        ? await this.getAPQCCapabilitiesByIndustry(industry)
        : await this.getAPQCCapabilitiesByIntent(intent);

      if (!result.success) {
        return result;
      }

      // Convert APQC capabilities to engagement capability format
      const capabilities = result.data.map((apqcCap, index) => ({
        id: `CAP-${String(index + 1).padStart(3, '0')}`,
        name: apqcCap.capability_name || apqcCap.name,
        category: apqcCap.process_group || 'General',
        description: apqcCap.description || '',
        maturity: 1, // Default low maturity
        targetMaturity: 3, // Default target
        gap: 2, // Auto-calculated later
        strategicImportance: apqcCap.strategic_importance || 'medium',
        applications: [],
        source: 'apqc',
        apqcCode: apqcCap.process_id || apqcCap.id
      }));

      // Add to engagement
      if (!engagement.capabilities) {
        engagement.capabilities = [];
      }

      // Merge (avoid duplicates)
      capabilities.forEach(cap => {
        const existing = engagement.capabilities.find(c => c.apqcCode === cap.apqcCode);
        if (!existing) {
          engagement.capabilities.push(cap);
        }
      });

      // Save engagement
      this.engagementManager.saveEngagement(engagement.engagement.id, engagement);

      // Update integration status
      this.updateIntegrationStatus('apqc', {
        status: 'connected',
        lastSync: new Date().toISOString()
      });

      console.log(`✅ Imported ${capabilities.length} APQC capabilities`);
      return { 
        success: true, 
        count: capabilities.length,
        message: `Imported ${capabilities.length} capabilities from APQC framework`
      };
    } catch (error) {
      console.error('❌ Failed to import APQC capabilities:', error);
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // APM TOOLKIT INTEGRATION (Application Portfolio Management)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * List available APM projects in localStorage
   */
  listAPMProjects() {
    const projects = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('apm_project_')) {
          const projectData = localStorage.getItem(key);
          const project = JSON.parse(projectData);
          projects.push({
            id: key.replace('apm_project_', ''),
            name: project.name || 'Unnamed Project',
            applicationCount: project.applications?.length || 0,
            lastModified: project.lastModified || 'Unknown'
          });
        }
      }
      
      console.log(`📱 Found ${projects.length} APM projects`);
      return { success: true, data: projects };
    } catch (error) {
      console.error('❌ Failed to list APM projects:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import applications from APM Toolkit
   */
  async importFromAPM(projectId) {
    try {
      console.log(`🔄 Importing from APM project: ${projectId}`);
      
      const engagement = this.engagementManager.getCurrentEngagement();
      if (!engagement) {
        return { success: false, error: 'No active engagement' };
      }

      // Load APM project data
      const apmData = localStorage.getItem(`apm_project_${projectId}`);
      if (!apmData) {
        return { success: false, error: `APM project not found: ${projectId}` };
      }

      const apmProject = JSON.parse(apmData);
      const applications = apmProject.applications || [];

      if (applications.length === 0) {
        return { success: false, error: 'No applications found in APM project' };
      }

      // Convert APM applications to engagement application format
      const convertedApps = applications.map((apmApp, index) => ({
        id: apmApp.id || `APP-${String(index + 1).padStart(3, '0')}`,
        name: apmApp.name,
        description: apmApp.description || '',
        type: apmApp.type || 'Business Application',
        vendor: apmApp.vendor || 'Unknown',
        version: apmApp.version || '',
        owner: apmApp.owner || '',
        businessValue: this.convertAPMScore(apmApp.businessValue),
        technicalFit: this.convertAPMScore(apmApp.technicalFit),
        lifecycle: apmApp.lifecycle || 'maintain',
        annualCost: apmApp.annualCost || 0,
        capabilities: apmApp.capabilities || [],
        dependencies: apmApp.dependencies || [],
        users: apmApp.users || 0,
        criticality: apmApp.criticality || 'medium',
        source: 'apm',
        apmProjectId: projectId
      }));

      // Add to engagement
      if (!engagement.applications) {
        engagement.applications = [];
      }

      // Merge (avoid duplicates)
      convertedApps.forEach(app => {
        const existing = engagement.applications.find(a => a.id === app.id);
        if (!existing) {
          engagement.applications.push(app);
        } else {
          // Update existing
          Object.assign(existing, app);
        }
      });

      // Save engagement
      this.engagementManager.saveEngagement(engagement.engagement.id, engagement);

      // Update integration status
      this.updateIntegrationStatus('apm', {
        status: 'connected',
        projectId: projectId,
        lastSync: new Date().toISOString()
      });

      console.log(`✅ Imported ${convertedApps.length} applications from APM`);
      return { 
        success: true, 
        count: convertedApps.length,
        message: `Imported ${convertedApps.length} applications from APM Toolkit`
      };
    } catch (error) {
      console.error('❌ Failed to import from APM:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert APM scoring (1-5) to engagement scoring (low/medium/high)
   */
  convertAPMScore(score) {
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════════
  // BMC TOOLKIT INTEGRATION (Business Model Canvas)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * List available BMC canvases in localStorage
   */
  listBMCCanvases() {
    const canvases = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bmc_')) {
          const bmcData = localStorage.getItem(key);
          const bmc = JSON.parse(bmcData);
          canvases.push({
            id: key.replace('bmc_', ''),
            name: bmc.name || 'Unnamed Canvas',
            customerSegments: bmc.customerSegments?.length || 0,
            keyPartners: bmc.keyPartners?.length || 0,
            lastModified: bmc.lastModified || 'Unknown'
          });
        }
      }
      
      console.log(`💼 Found ${canvases.length} BMC canvases`);
      return { success: true, data: canvases };
    } catch (error) {
      console.error('❌ Failed to list BMC canvases:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import stakeholders from BMC Toolkit
   */
  async importFromBMC(bmcId) {
    try {
      console.log(`🔄 Importing from BMC: ${bmcId}`);
      
      const engagement = this.engagementManager.getCurrentEngagement();
      if (!engagement) {
        return { success: false, error: 'No active engagement' };
      }

      // Load BMC data
      const bmcData = localStorage.getItem(`bmc_${bmcId}`);
      if (!bmcData) {
        return { success: false, error: `BMC canvas not found: ${bmcId}` };
      }

      const bmc = JSON.parse(bmcData);
      
      // Extract stakeholders from BMC components
      const stakeholders = [];

      // From Customer Segments
      if (bmc.customerSegments) {
        bmc.customerSegments.forEach((segment, index) => {
          stakeholders.push({
            id: `STK-CS-${String(index + 1).padStart(3, '0')}`,
            name: segment.name || `Customer Segment ${index + 1}`,
            role: 'Customer',
            type: 'customer',
            influence: segment.importance === 'high' ? 'high' : 'medium',
            interest: 'high',
            power: 'medium',
            priorities: segment.needs || [],
            decisionPower: 'influencer',
            source: 'bmc',
            bmcId: bmcId
          });
        });
      }

      // From Key Partners
      if (bmc.keyPartners) {
        bmc.keyPartners.forEach((partner, index) => {
          stakeholders.push({
            id: `STK-KP-${String(index + 1).padStart(3, '0')}`,
            name: partner.name || `Partner ${index + 1}`,
            role: 'Partner',
            type: 'external',
            influence: 'medium',
            interest: 'medium',
            power: 'medium',
            priorities: partner.valueProvided || [],
            decisionPower: 'informed',
            source: 'bmc',
            bmcId: bmcId
          });
        });
      }

      // From Key Resources (people)
      if (bmc.keyResources) {
        bmc.keyResources.filter(r => r.type === 'human').forEach((resource, index) => {
          stakeholders.push({
            id: `STK-KR-${String(index + 1).padStart(3, '0')}`,
            name: resource.name || `Resource ${index + 1}`,
            role: resource.role || 'Team Member',
            type: 'internal',
            influence: 'medium',
            interest: 'high',
            power: 'low',
            priorities: [],
            decisionPower: 'contributor',
            source: 'bmc',
            bmcId: bmcId
          });
        });
      }

      if (stakeholders.length === 0) {
        return { success: false, error: 'No stakeholders found in BMC canvas' };
      }

      // Add to engagement
      if (!engagement.stakeholders) {
        engagement.stakeholders = [];
      }

      // Merge (avoid duplicates)
      stakeholders.forEach(stk => {
        const existing = engagement.stakeholders.find(s => s.name === stk.name && s.source === 'bmc');
        if (!existing) {
          engagement.stakeholders.push(stk);
        }
      });

      // Save engagement
      this.engagementManager.saveEngagement(engagement.engagement.id, engagement);

      // Update integration status
      this.updateIntegrationStatus('bmc', {
        status: 'connected',
        bmcId: bmcId,
        lastSync: new Date().toISOString()
      });

      console.log(`✅ Imported ${stakeholders.length} stakeholders from BMC`);
      return { 
        success: true, 
        count: stakeholders.length,
        message: `Imported ${stakeholders.length} stakeholders from BMC Toolkit`
      };
    } catch (error) {
      console.error('❌ Failed to import from BMC:', error);
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // CAPABILITY MANAGEMENT INTEGRATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Sync with Capability Map (bidirectional)
   */
  async syncWithCapabilityMap() {
    try {
      console.log('🔄 Syncing with Capability Map...');
      
      const engagement = this.engagementManager.getCurrentEngagement();
      if (!engagement) {
        return { success: false, error: 'No active engagement' };
      }

      // Load capability map from localStorage
      const capMapData = localStorage.getItem('cap_map_v2');
      if (!capMapData) {
        return { success: false, error: 'Capability Map not found in localStorage' };
      }

      const capMap = JSON.parse(capMapData);
      
      if (!capMap.capabilities || capMap.capabilities.length === 0) {
        return { success: false, error: 'No capabilities found in Capability Map' };
      }

      // Convert capability map format to engagement format
      const capabilities = capMap.capabilities.map((capMapCap, index) => ({
        id: capMapCap.id || `CAP-${String(index + 1).padStart(3, '0')}`,
        name: capMapCap.name,
        category: capMapCap.l1 || 'General',
        description: capMapCap.description || '',
        maturity: capMapCap.currentMaturity || 1,
        targetMaturity: capMapCap.targetMaturity || 3,
        gap: (capMapCap.targetMaturity || 3) - (capMapCap.currentMaturity || 1),
        strategicImportance: capMapCap.strategicImportance || 'medium',
        applications: capMapCap.applications || [],
        source: 'capability_map',
        capMapId: 'cap_map_v2'
      }));

      // Bidirectional sync: 
      // 1. Import from Capability Map to Engagement
      if (!engagement.capabilities) {
        engagement.capabilities = [];
      }

      capabilities.forEach(cap => {
        const existing = engagement.capabilities.find(c => c.id === cap.id);
        if (!existing) {
          engagement.capabilities.push(cap);
        } else {
          // Update maturity if changed
          existing.maturity = cap.maturity;
          existing.targetMaturity = cap.targetMaturity;
          existing.gap = cap.gap;
        }
      });

      // 2. Export from Engagement back to Capability Map (update maturity assessments)
      engagement.capabilities.forEach(engCap => {
        const capMapCap = capMap.capabilities.find(c => c.id === engCap.id);
        if (capMapCap) {
          capMapCap.currentMaturity = engCap.maturity;
          capMapCap.targetMaturity = engCap.targetMaturity;
          capMapCap.lastUpdated = new Date().toISOString();
          capMapCap.updatedBy = 'EA_Engagement_Playbook';
        }
      });

      // Save updated capability map back to localStorage
      localStorage.setItem('cap_map_v2', JSON.stringify(capMap));

      // Save engagement
      this.engagementManager.saveEngagement(engagement.engagement.id, engagement);

      // Update integration status
      this.updateIntegrationStatus('capability', {
        status: 'connected',
        capMapId: 'cap_map_v2',
        lastSync: new Date().toISOString()
      });

      console.log(`✅ Synced ${capabilities.length} capabilities with Capability Map`);
      return { 
        success: true, 
        count: capabilities.length,
        message: `Synced ${capabilities.length} capabilities with Capability Map (bidirectional)`
      };
    } catch (error) {
      console.error('❌ Failed to sync with Capability Map:', error);
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // INTEGRATION STATUS MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Update integration status in workflow state
   */
  updateIntegrationStatus(integrationName, status) {
    if (this.workflowEngine) {
      this.workflowEngine.updateIntegrationStatus(integrationName, status);
    }
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(integrationName) {
    if (this.workflowEngine) {
      return this.workflowEngine.getIntegrationStatus(integrationName);
    }
    return { status: 'not_connected' };
  }

  /**
   * Get all integration statuses
   */
  getAllIntegrationStatuses() {
    return {
      apqc: this.getIntegrationStatus('apqc'),
      apm: this.getIntegrationStatus('apm'),
      bmc: this.getIntegrationStatus('bmc'),
      capability: this.getIntegrationStatus('capability')
    };
  }

  /**
   * Disconnect integration
   */
  disconnectIntegration(integrationName) {
    this.updateIntegrationStatus(integrationName, {
      status: 'not_connected',
      lastSync: null
    });
    
    console.log(`🔌 Disconnected ${integrationName}`);
    return { success: true, message: `Disconnected ${integrationName}` };
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get integration summary for dashboard
   */
  getIntegrationSummary() {
    const statuses = this.getAllIntegrationStatuses();
    
    return {
      connectedCount: Object.values(statuses).filter(s => s.status === 'connected').length,
      totalIntegrations: 4,
      integrations: [
        { 
          name: 'APQC Framework', 
          icon: '📚', 
          status: statuses.apqc.status,
          lastSync: statuses.apqc.lastSync,
          description: 'Industry benchmarks and process framework'
        },
        { 
          name: 'APM Toolkit', 
          icon: '📱', 
          status: statuses.apm.status,
          lastSync: statuses.apm.lastSync,
          projectId: statuses.apm.projectId,
          description: 'Application portfolio data'
        },
        { 
          name: 'BMC Toolkit', 
          icon: '💼', 
          status: statuses.bmc.status,
          lastSync: statuses.bmc.lastSync,
          description: 'Business model and stakeholders'
        },
        { 
          name: 'Capability Map', 
          icon: '🗺️', 
          status: statuses.capability.status,
          lastSync: statuses.capability.lastSync,
          description: 'Capability hierarchy and maturity'
        }
      ]
    };
  }

  /**
   * Test integration connection
   */
  async testConnection(integrationName) {
    console.log(`🧪 Testing ${integrationName} connection...`);
    
    try {
      switch (integrationName) {
        case 'apqc':
          return await this.loadAPQCFramework();
        
        case 'apm':
          return this.listAPMProjects();
        
        case 'bmc':
          return this.listBMCCanvases();
        
        case 'capability':
          const capMapData = localStorage.getItem('cap_map_v2');
          if (capMapData) {
            const capMap = JSON.parse(capMapData);
            return { 
              success: true, 
              message: `Capability Map found with ${capMap.capabilities?.length || 0} capabilities` 
            };
          } else {
            return { success: false, error: 'Capability Map not found' };
          }
        
        default:
          return { success: false, error: `Unknown integration: ${integrationName}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Initialize global instance (will be initialized after dependencies load)
if (typeof window !== 'undefined') {
  window.EA_IntegrationBridge = EA_IntegrationBridge;
}
