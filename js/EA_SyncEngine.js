/**
 * EA Platform V3 - Sync Engine
 * Handles bidirectional data synchronization between toolkits and EA Platform
 */

class EA_SyncEngine {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.config = window.EA_Config || EA_Config;
  }
  
  /**
   * Sync rules mapping - defines how data flows between toolkits
   */
  syncRules = {
    // Capability Map → EA Platform capabilities
    capabilityMap: {
      target: 'platform',
      field: 'capabilities',
      direction: 'bidirectional',
      transform: this.transformCapabilityMap.bind(this)
    },
    
    // Wardley Map → EA Platform systems
    wardley: {
      target: 'platform',
      field: 'systems',
      direction: 'bidirectional',
      transform: this.transformWardleyMap.bind(this)
    },
    
    // Business Model Canvas → EA Platform operating model
    bmc: {
      target: 'platform',
      field: 'operatingModel',
      direction: 'bidirectional',
      transform: this.transformBMC.bind(this)
    },
    
    // Value Chain → EA Platform processes
    valueChain: {
      target: 'platform',
      field: 'processes',
      direction: 'bidirectional',
      transform: this.transformValueChain.bind(this)
    },
    
    // Maturity → EA Platform maturity scores
    maturity: {
      target: 'platform',
      field: 'maturityScores',
      direction: 'to-platform',
      transform: this.transformMaturity.bind(this)
    }
  };
  
  /**
   * Sync data from a toolkit to EA Platform
   * @param {string} projectId - Project ID
   * @param {string} sourceToolkit - Source toolkit ID (bmc, capabilityMap, wardley, valueChain, maturity)
   * @param {object} options - Sync options (mode: 'merge' | 'replace' | 'append')
   */
  async syncToPlat(projectId, sourceToolkit, options = {}) {
    const mode = options.mode || 'merge';
    const project = this.dataManager.getProject(projectId);
    
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const rule = this.syncRules[sourceToolkit];
    if (!rule) {
      throw new Error(`No sync rule defined for toolkit: ${sourceToolkit}`);
    }
    
    // Get source data
    const sourceData = project.data[sourceToolkit];
    if (!sourceData) {
      console.warn(`No data found for toolkit: ${sourceToolkit}`);
      return { synced: 0, skipped: 0, conflicts: [] };
    }
    
    // Transform source data to platform format
    const transformedData = rule.transform(sourceData, 'to-platform');
    
    // Get current platform data
    const platformData = project.data.platform || this.dataManager.getEmptyPlatformData();
    const targetField = rule.field;
    
    // Merge based on mode
    let result;
    if (mode === 'merge') {
      result = this.mergeData(platformData[targetField], transformedData, sourceToolkit);
    } else if (mode === 'replace') {
      result = { data: transformedData, synced: transformedData.length, skipped: 0, conflicts: [] };
    } else if (mode === 'append') {
      result = { 
        data: [...(platformData[targetField] || []), ...transformedData], 
        synced: transformedData.length, 
        skipped: 0, 
        conflicts: [] 
      };
    }
    
    // Update platform data
    platformData[targetField] = result.data;
    project.data.platform = platformData;
    
    // Save project
    this.dataManager.updateToolkitData(projectId, 'platform', platformData);
    
    console.log(`✅ Synced ${result.synced} items from ${sourceToolkit} to platform.${targetField}`);
    
    return {
      synced: result.synced,
      skipped: result.skipped,
      conflicts: result.conflicts,
      mode: mode
    };
  }
  
  /**
   * Sync data from EA Platform to a toolkit (reverse sync)
   */
  async syncFromPlatform(projectId, targetToolkit, options = {}) {
    const mode = options.mode || 'merge';
    const project = this.dataManager.getProject(projectId);
    
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const rule = this.syncRules[targetToolkit];
    if (!rule || rule.direction === 'to-platform') {
      throw new Error(`Reverse sync not supported for toolkit: ${targetToolkit}`);
    }
    
    // Get platform data
    const platformData = project.data.platform;
    if (!platformData) {
      console.warn('No platform data to sync from');
      return { synced: 0, skipped: 0, conflicts: [] };
    }
    
    const sourceField = rule.field;
    const sourceData = platformData[sourceField];
    
    // Transform platform data to toolkit format
    const transformedData = rule.transform(sourceData, 'from-platform');
    
    // Update toolkit data
    const existingData = project.data[targetToolkit];
    let result;
    
    if (mode === 'merge' && existingData) {
      result = this.mergeData(existingData, transformedData, 'platform');
    } else {
      result = { data: transformedData, synced: transformedData.length, skipped: 0, conflicts: [] };
    }
    
    project.data[targetToolkit] = result.data;
    this.dataManager.updateToolkitData(projectId, targetToolkit, result.data);
    
    console.log(`✅ Synced ${result.synced} items from platform to ${targetToolkit}`);
    
    return {
      synced: result.synced,
      skipped: result.skipped,
      conflicts: result.conflicts,
      mode: mode
    };
  }
  
  /**
   * Smart merge: combines existing and new data, detecting conflicts
   */
  mergeData(existing, incoming, source) {
    const merged = [...(existing || [])];
    let synced = 0;
    let skipped = 0;
    const conflicts = [];
    
    incoming.forEach(newItem => {
      // Try to find matching item by name (fuzzy match)
      const match = this.findMatch(merged, newItem.name);
      
      if (match) {
        // Check for conflicts
        const hasConflict = this.detectConflict(match, newItem);
        
        if (hasConflict) {
          conflicts.push({
            field: 'name',
            existing: match,
            incoming: newItem,
            source: source
          });
          skipped++;
        } else {
          // Merge: prefer workshop/source data but keep AI-generated relationships
          Object.assign(match, {
            ...newItem,
            // Preserve platform-specific fields
            id: match.id,
            dependsOnCapabilities: match.dependsOnCapabilities || newItem.dependsOnCapabilities,
            relatedSystems: match.relatedSystems || newItem.relatedSystems,
            source: source,
            lastSynced: new Date().toISOString()
          });
          synced++;
        }
      } else {
        // New item - add with source metadata
        merged.push({
          ...newItem,
          id: newItem.id || this.generateId(),
          source: source,
          needsReview: true,
          lastSynced: new Date().toISOString()
        });
        synced++;
      }
    });
    
    return {
      data: merged,
      synced,
      skipped,
      conflicts
    };
  }
  
  /**
   * Find matching item using fuzzy name matching
   */
  findMatch(items, name) {
    if (!items || !name) return null;
    
    // Exact match first
    let match = items.find(item => item.name === name);
    if (match) return match;
    
    // Fuzzy match (case-insensitive, trimmed)
    const normalizedName = name.toLowerCase().trim();
    match = items.find(item => 
      item.name?.toLowerCase().trim() === normalizedName
    );
    if (match) return match;
    
    // Partial match (contains)
    match = items.find(item => 
      item.name?.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(item.name?.toLowerCase())
    );
    
    return match;
  }
  
  /**
   * Detect conflicts between existing and incoming data
   */
  detectConflict(existing, incoming) {
    // Check for significant differences in key fields
    if (existing.maturity && incoming.maturity) {
      if (Math.abs(existing.maturity - incoming.maturity) >= 2) {
        return true; // Maturity differs by 2+ levels
      }
    }
    
    if (existing.strategicImportance && incoming.strategicImportance) {
      if (existing.strategicImportance !== incoming.strategicImportance) {
        return true; // Strategic importance conflict
      }
    }
    
    return false;
  }
  
  /**
   * Transform Capability Map data to/from platform format
   */
  transformCapabilityMap(data, direction) {
    if (direction === 'to-platform') {
      // Capability Map → Platform
      const capabilities = [];
      
      if (data.domains) {
        data.domains.forEach(domain => {
          domain.capabilities?.forEach(cap => {
            capabilities.push({
              id: cap.id || 'cap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
              name: cap.name,
              domain: domain.name,
              maturity: cap.maturity || 3,
              strategicImportance: cap.priority === 'High' ? 'high' : cap.priority === 'Low' ? 'low' : 'medium',
              description: cap.description || '',
              source: 'capabilityMap'
            });
          });
        });
      }
      
      return capabilities;
    } else {
      // Platform → Capability Map
      const domains = {};
      
      (data || []).forEach(cap => {
        if (!domains[cap.domain]) {
          domains[cap.domain] = {
            name: cap.domain,
            capabilities: []
          };
        }
        
        domains[cap.domain].capabilities.push({
          id: cap.id,
          name: cap.name,
          maturity: cap.maturity,
          priority: cap.strategicImportance === 'high' ? 'High' : cap.strategicImportance === 'low' ? 'Low' : 'Medium',
          description: cap.description
        });
      });
      
      return {
        domains: Object.values(domains)
      };
    }
  }
  
  /**
   * Transform Wardley Map data to/from platform format
   */
  transformWardleyMap(data, direction) {
    if (direction === 'to-platform') {
      // Wardley → Platform systems
      return (data.components || []).map(comp => ({
        id: comp.id || 'sys_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: comp.name,
        status: comp.evolution > 0.7 ? 'active' : comp.evolution > 0.4 ? 'legacy' : 'planned',
        category: comp.visibility > 0.7 ? 'core' : 'supporting',
        description: comp.description || '',
        source: 'wardley'
      }));
    } else {
      // Platform → Wardley
      return {
        components: (data || []).map(sys => ({
          id: sys.id,
          name: sys.name,
          evolution: sys.status === 'active' ? 0.8 : sys.status === 'legacy' ? 0.5 : 0.3,
          visibility: sys.category === 'core' ? 0.9 : 0.5,
          description: sys.description
        }))
      };
    }
  }
  
  /**
   * Transform Business Model Canvas to/from platform format
   */
  transformBMC(data, direction) {
    if (direction === 'to-platform') {
      // BMC → Platform operating model
      return {
        valueProposition: data.valuePropositions?.[0] || '',
        services: data.keyActivities || [],
        domains: data.customerSegments || [],
        partners: data.keyPartners || [],
        channels: data.channels || [],
        revenue: data.revenueStreams || [],
        costs: data.costStructure || [],
        source: 'bmc'
      };
    } else {
      // Platform → BMC
      return {
        valuePropositions: [data.valueProposition || ''],
        customerSegments: data.domains || [],
        keyActivities: data.services || [],
        keyResources: [],
        keyPartners: data.partners || [],
        channels: data.channels || [],
        costStructure: data.costs || [],
        revenueStreams: data.revenue || []
      };
    }
  }
  
  /**
   * Transform Value Chain data to/from platform format
   */
  transformValueChain(data, direction) {
    if (direction === 'to-platform') {
      // Value Chain → Platform processes
      const processes = [];
      
      if (data.primary) {
        data.primary.forEach(activity => {
          processes.push({
            id: 'proc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: activity.name || activity,
            type: 'primary',
            description: activity.description || '',
            source: 'valueChain'
          });
        });
      }
      
      if (data.support) {
        data.support.forEach(activity => {
          processes.push({
            id: 'proc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: activity.name || activity,
            type: 'support',
            description: activity.description || '',
            source: 'valueChain'
          });
        });
      }
      
      return processes;
    } else {
      // Platform → Value Chain
      const primary = [];
      const support = [];
      
      (data || []).forEach(proc => {
        if (proc.type === 'primary') {
          primary.push({ name: proc.name, description: proc.description });
        } else {
          support.push({ name: proc.name, description: proc.description });
        }
      });
      
      return { primary, support };
    }
  }
  
  /**
   * Transform Maturity data to platform format (one-way)
   */
  transformMaturity(data, direction) {
    if (direction === 'to-platform') {
      // Maturity → Platform maturity scores
      return {
        domains: data.domains || {},
        overallScore: data.overallScore || 0,
        assessmentDate: data.assessmentDate || new Date().toISOString(),
        source: 'maturity'
      };
    }
    
    return data;
  }
  
  /**
   * Generate unique ID
   */
  generateId() {
    return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Get sync status for a project
   */
  getSyncStatus(projectId) {
    const project = this.dataManager.getProject(projectId);
    if (!project) return null;
    
    const status = {};
    
    Object.keys(this.syncRules).forEach(toolkit => {
      const hasSource = !!project.data[toolkit];
      const hasTarget = !!project.data.platform;
      const lastSynced = project.data[toolkit]?.lastSynced || null;
      
      status[toolkit] = {
        hasData: hasSource,
        canSync: hasSource && hasTarget,
        lastSynced: lastSynced,
        direction: this.syncRules[toolkit].direction
      };
    });
    
    return status;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_SyncEngine = EA_SyncEngine;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_SyncEngine;
}
