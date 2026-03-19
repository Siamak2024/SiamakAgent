/**
 * EA_IntegrationEngine.js
 * Cross-toolkit data transformation and synchronization for EA 2.0 Suite
 * 
 * Handles 4-phase integration:
 * 1. BMC ↔ Value Chain
 * 2. Value Chain ↔ EA Platform
 * 3. Value Chain ↔ Capability Mapping
 * 4. Capability Map ↔ Strategy Workbench
 * 
 * @version 1.0
 * @date March 2026
 */

class EA_IntegrationEngine {
  constructor() {
    this.dataManager = null;
    this.fileManager = null;
    this.transformRules = this.initializeTransformRules();
    this.validationRules = this.initializeValidationRules();
    this.integrationLog = [];
    console.log('🔗 EA Integration Engine loaded');
  }

  /**
   * Initialize the engine with required dependencies
   */
  init(dataManager, fileManager) {
    this.dataManager = dataManager;
    this.fileManager = fileManager;
    this.loadIntegrationLog();
    console.log('✅ Integration Engine initialized');
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: BMC ↔ VALUE CHAIN INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Transform BMC data for Value Chain import
   */
  transformBMCToValueChain(bmcData) {
    return {
      aiContext: this.generateValueChainContext(bmcData),
      activityNotes: {
        operations: bmcData.value_proposition ? `BMC Value: ${bmcData.value_proposition}` : '',
        margin: bmcData.cost_structure ? `BMC Costs: ${bmcData.cost_structure}` : '',
        procurement: bmcData.key_partners ? `BMC Partners: ${bmcData.key_partners}` : '',
        sales: bmcData.customer_segments ? `BMC Segments: ${bmcData.customer_segments}` : '',
        service: bmcData.customer_relationships ? `BMC Relations: ${bmcData.customer_relationships}` : ''
      },
      metadata: {
        source: 'BMC',
        transformedAt: new Date().toISOString(),
        version: 'EA_2.0'
      }
    };
  }

  /**
   * Generate AI analysis context from BMC data
   */
  generateValueChainContext(bmcData) {
    return `Business Model Context (imported from BMC):

Value Proposition: ${bmcData.value_proposition || 'Not specified'}
Customer Segments: ${bmcData.customer_segments || 'Not specified'}
Revenue Streams: ${bmcData.revenue_streams || 'Not specified'}
Cost Structure: ${bmcData.cost_structure || 'Not specified'}
Key Activities: ${bmcData.key_activities || 'Not specified'}
Key Resources: ${bmcData.key_resources || 'Not specified'}
Key Partners: ${bmcData.key_partners || 'Not specified'}
Channels: ${bmcData.channels || 'Not specified'}

Strategic Context:
Goal: ${bmcData.goal || 'Not specified'}
Driver: ${bmcData.driver || 'Not specified'}
Regulatory: ${bmcData.regulatory || 'Not specified'}

Please analyze the value chain with this business model context in mind. Focus on:
1. How well the value chain delivers on the value proposition
2. Where costs concentrate and margin pressures exist
3. Partner dependencies and supply chain risks
4. Customer segment alignment with sales/service activities
`;
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: VALUE CHAIN ↔ EA PLATFORM INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Transform Value Chain data to EA Platform format
   */
  transformValueChainToEA(vcData) {
    const transformed = {
      valueStreams: this.extractValueStreams(vcData),
      capabilities: this.extractCapabilities(vcData),
      systems: this.extractSystems(vcData),
      aiAgents: this.extractAIAgents(vcData),
      initiatives: this.extractInitiatives(vcData),
      metadata: {
        source: 'Value_Chain_Analyzer',
        transformedAt: new Date().toISOString(),
        version: 'EA_2.0',
        activityCount: vcData.activities?.length || 0
      }
    };

    this.logIntegration('valuechain', 'ea_platform', 'success', transformed);
    return transformed;
  }

  /**
   * Extract value streams from Value Chain activities
   */
  extractValueStreams(vcData) {
    const valueStreams = [];
    
    // Create value stream for primary activities
    if (vcData.activities) {
      const primaryActivities = vcData.activities.filter(a => a.type === 'primary');
      if (primaryActivities.length > 0) {
        valueStreams.push({
          id: `vs_${Date.now()}`,
          name: 'Primary Value Delivery',
          description: `Core value chain activities: ${primaryActivities.map(a => a.name).join(', ')}`,
          source: 'value_chain'
        });
      }
    }

    return valueStreams;
  }

  /**
   * Extract capabilities from Value Chain activities
   */
  extractCapabilities(vcData) {
    const capabilities = [];

    if (!vcData.activities) return capabilities;

    vcData.activities.forEach(activity => {
      // Only extract high-value or strategic activities as capabilities
      if (!this.shouldExtractAsCapability(activity)) return;

      capabilities.push({
        id: `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: activity.name,
        domain: this.mapActivityToDomain(activity),
        strategicImportance: this.calculateStrategicImportance(activity),
        maturity: this.inferMaturityFromActivity(activity),
        description: activity.notes || activity.description || `Capability derived from ${activity.name} in value chain`,
        source: 'value_chain',
        sourceId: activity.id,
        metadata: {
          valueScore: activity.value_score,
          costScore: activity.cost_score,
          digitalizationPotential: activity.digitalization_potential,
          activityType: activity.type
        }
      });
    });

    return capabilities;
  }

  /**
   * Determine if activity should be extracted as capability
   */
  shouldExtractAsCapability(activity) {
    // High-value primary activities
    if (activity.type === 'primary' && activity.value_score >= 7) return true;
    
    // Support activities with high strategic importance
    if (activity.type === 'support' && activity.cost_score >= 7) return true;
    
    // Activities with high digitalization potential
    if (activity.digitalization_potential >= 8) return true;
    
    return false;
  }

  /**
   * Map Value Chain activity to Capability domain
   */
  mapActivityToDomain(activity) {
    const activityLower = activity.name.toLowerCase();
    
    // Customer domain
    if (activityLower.includes('sales') || 
        activityLower.includes('marketing') || 
        activityLower.includes('service') ||
        activityLower.includes('customer')) {
      return 'Customer';
    }
    
    // Operations domain
    if (activityLower.includes('operation') || 
        activityLower.includes('inbound') || 
        activityLower.includes('outbound') ||
        activityLower.includes('logistics')) {
      return 'Operations';
    }
    
    // Technology domain
    if (activityLower.includes('tech') || 
        activityLower.includes('development') || 
        activityLower.includes('digital') ||
        activityLower.includes('it')) {
      return 'Technology';
    }
    
    // Finance domain
    if (activityLower.includes('finance') || 
        activityLower.includes('infrastructure') || 
        activityLower.includes('procurement') ||
        activityLower.includes('margin')) {
      return 'Finance';
    }
    
    // Product domain
    if (activityLower.includes('product') || 
        activityLower.includes('innovation') || 
        activityLower.includes('r&d')) {
      return 'Product';
    }
    
    // Default to Operations
    return 'Operations';
  }

  /**
   * Calculate strategic importance from activity metrics
   */
  calculateStrategicImportance(activity) {
    // High value + primary = Strategic
    if (activity.value_score >= 8 && activity.type === 'primary') {
      return 'strategic';
    }
    
    // High margin contribution = Strategic
    if (activity.margin_score && activity.margin_score >= 8) {
      return 'strategic';
    }
    
    // Necessary but lower value = Important
    if (activity.value_score >= 6 && activity.type === 'primary') {
      return 'important';
    }
    
    // Support activities = Commodity
    if (activity.type === 'support') {
      return 'commodity';
    }
    
    return 'important'; // Default
  }

  /**
   * Infer maturity level from activity characteristics
   */
  inferMaturityFromActivity(activity) {
    // High digitalization potential = low maturity (emerging)
    if (activity.digitalization_potential >= 8) return 2;
    
    // High AI opportunity = emerging technology
    if (activity.ai_opportunity && activity.ai_opportunity.score >= 8) return 2;
    
    // High value + low cost = mature and optimized
    if (activity.value_score >= 8 && activity.cost_score <= 3) return 5;
    
    // High cost + low value = needs optimization (medium maturity)
    if (activity.cost_score >= 7 && activity.value_score <= 4) return 3;
    
    // Default medium maturity
    return 3;
  }

  /**
   * Extract systems from Value Chain activities
   */
  extractSystems(vcData) {
    const systems = [];

    if (!vcData.activities) return systems;

    vcData.activities.forEach(activity => {
      // Extract systems from activities with high digitalization potential
      if (activity.digitalization_potential >= 7) {
        systems.push({
          id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${activity.name} System`,
          status: 'planned',
          category: this.mapActivityToSystemCategory(activity),
          description: `System to support ${activity.name}`,
          source: 'value_chain',
          sourceId: activity.id
        });
      }
    });

    return systems;
  }

  /**
   * Map activity to system category
   */
  mapActivityToSystemCategory(activity) {
    const activityLower = activity.name.toLowerCase();
    
    if (activityLower.includes('customer') || activityLower.includes('service')) {
      return 'Customer Systems';
    }
    if (activityLower.includes('operation') || activityLower.includes('production')) {
      return 'Operations Systems';
    }
    if (activityLower.includes('tech') || activityLower.includes('development')) {
      return 'Technology Platform';
    }
    if (activityLower.includes('finance') || activityLower.includes('erp')) {
      return 'Business Systems';
    }
    
    return 'Business Systems';
  }

  /**
   * Extract AI agents from Value Chain AI opportunities
   */
  extractAIAgents(vcData) {
    const aiAgents = [];

    if (!vcData.activities) return aiAgents;

    vcData.activities.forEach(activity => {
      // Extract AI agents from activities with identified AI opportunities
      if (activity.ai_opportunity && activity.ai_opportunity.score >= 7) {
        aiAgents.push({
          id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `AI Agent: ${activity.name}`,
          purpose: activity.ai_opportunity.description || `Automate ${activity.name}`,
          capabilities: [activity.ai_opportunity.type || 'Automation'],
          triggerConditions: [`Process automation for ${activity.name}`],
          source: 'value_chain',
          sourceId: activity.id,
          metadata: {
            aiOpportunityScore: activity.ai_opportunity.score,
            expectedROI: activity.ai_opportunity.roi || 'To be calculated'
          }
        });
      }
    });

    return aiAgents;
  }

  /**
   * Extract initiatives from Value Chain improvement opportunities
   */
  extractInitiatives(vcData) {
    const initiatives = [];

    if (!vcData.activities) return initiatives;

    vcData.activities.forEach(activity => {
      // Create initiatives for high-cost, low-value activities (optimization targets)
      if (activity.cost_score >= 7 && activity.value_score <= 4) {
        initiatives.push({
          id: `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `Optimize ${activity.name}`,
          description: `Cost optimization initiative for ${activity.name}`,
          targetCapability: activity.name,
          priority: 'high',
          source: 'value_chain',
          sourceId: activity.id,
          metadata: {
            currentCostScore: activity.cost_score,
            currentValueScore: activity.value_score,
            optimizationPotential: 'High'
          }
        });
      }
      
      // Create initiatives for high digitalization potential
      if (activity.digitalization_potential >= 8) {
        initiatives.push({
          id: `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `Digitalize ${activity.name}`,
          description: `Digital transformation initiative for ${activity.name}`,
          targetCapability: activity.name,
          priority: 'medium',
          source: 'value_chain',
          sourceId: activity.id,
          metadata: {
            digitalizationPotential: activity.digitalization_potential,
            expectedBenefit: 'Process efficiency and data insights'
          }
        });
      }
    });

    return initiatives;
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: VALUE CHAIN ↔ CAPABILITY MAPPING INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Transform Value Chain to Capability Mapping format
   */
  transformValueChainToCapabilities(vcData) {
    const capabilities = [];

    if (!vcData.activities) return capabilities;

    vcData.activities.forEach(activity => {
      capabilities.push({
        id: `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: activity.name,
        domain: this.mapActivityToDomain(activity),
        priority: this.calculateStrategicImportance(activity),
        maturity: this.inferMaturityFromActivity(activity),
        description: activity.notes || activity.description || '',
        evolution: this.calculateEvolution(
          this.inferMaturityFromActivity(activity),
          this.calculateStrategicImportance(activity)
        ),
        visibility: this.calculateVisibility(
          this.calculateStrategicImportance(activity),
          this.mapActivityToDomain(activity)
        ),
        source: 'value_chain',
        metadata: {
          valueScore: activity.value_score,
          costScore: activity.cost_score,
          activityType: activity.type
        }
      });
    });

    this.logIntegration('valuechain', 'capability_map', 'success', { capabilityCount: capabilities.length });
    return capabilities;
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: CAPABILITY MAP ↔ STRATEGY WORKBENCH INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Transform Capability Map to Wardley Strategy format
   */
  transformCapabilityToWardley(capData) {
    const wardleyNodes = [];

    if (!capData.capabilities) return wardleyNodes;

    capData.capabilities.forEach(cap => {
      const evolutionX = this.calculateEvolution(cap.maturity, cap.strategicImportance || cap.priority);
      const visibilityY = this.calculateVisibility(cap.strategicImportance || cap.priority, cap.domain);

      wardleyNodes.push({
        id: cap.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: cap.name,
        x: evolutionX,
        y: visibilityY,
        domain: cap.domain,
        priority: cap.strategicImportance || cap.priority,
        maturity: cap.maturity,
        evolution: this.getEvolutionLabel(evolutionX),
        color: this.getWardleyColor(cap.strategicImportance || cap.priority),
        category: this.getWardleyCategory(evolutionX, cap.strategicImportance || cap.priority),
        description: cap.description || '',
        source: 'capability_mapping'
      });
    });

    this.logIntegration('capability_map', 'strategy_workbench', 'success', { nodeCount: wardleyNodes.length });
    return wardleyNodes;
  }

  /**
   * Calculate Wardley Evolution (X-axis) from maturity and importance
   * Maturity 1-2 → Genesis/Custom (0-0.4)
   * Maturity 3-4 → Product (0.4-0.7)
   * Maturity 5 → Commodity (0.7-1.0)
   */
  calculateEvolution(maturity, strategicImportance) {
    const importanceLower = String(strategicImportance).toLowerCase();
    
    if (maturity <= 2 && importanceLower === 'strategic') {
      return 0.15 + (Math.random() * 0.15); // Genesis: 0.15-0.30
    } else if (maturity <= 2) {
      return 0.30 + (Math.random() * 0.15); // Custom: 0.30-0.45
    } else if (maturity <= 4) {
      return 0.45 + (Math.random() * 0.25); // Product: 0.45-0.70
    } else {
      return 0.70 + (Math.random() * 0.25); // Commodity: 0.70-0.95
    }
  }

  /**
   * Calculate Wardley Visibility (Y-axis) from strategic importance
   * Strategic → High visibility (0.7-0.95)
   * Important → Mid visibility (0.4-0.7)
   * Commodity → Low visibility (0.1-0.4)
   */
  calculateVisibility(strategicImportance, domain) {
    const importanceLower = String(strategicImportance).toLowerCase();
    
    const visibilityMap = {
      'strategic': [0.70, 0.95],
      'important': [0.40, 0.70],
      'commodity': [0.10, 0.40]
    };
    
    const [min, max] = visibilityMap[importanceLower] || [0.40, 0.70];
    
    // Customer domain gets visibility boost
    const boost = domain === 'Customer' ? 0.10 : 0;
    
    return Math.min(0.95, min + (Math.random() * (max - min)) + boost);
  }

  /**
   * Get Wardley evolution stage label
   */
  getEvolutionLabel(x) {
    if (x < 0.25) return 'Genesis';
    if (x < 0.45) return 'Custom';
    if (x < 0.70) return 'Product';
    return 'Commodity';
  }

  /**
   * Get Wardley node color based on strategic importance
   */
  getWardleyColor(strategicImportance) {
    const importanceLower = String(strategicImportance).toLowerCase();
    
    const colorMap = {
      'strategic': '#ef4444',   // Red
      'important': '#f97316',   // Orange
      'commodity': '#22c55e'    // Green
    };
    
    return colorMap[importanceLower] || '#64748b'; // Gray default
  }

  /**
   * Get Wardley category (Build/Buy/Partner recommendation)
   */
  getWardleyCategory(evolutionX, strategicImportance) {
    const importanceLower = String(strategicImportance).toLowerCase();
    
    if (evolutionX < 0.25 && importanceLower === 'strategic') {
      return 'Build (Genesis)';
    } else if (evolutionX < 0.30) {
      return 'Build (Custom)';
    } else if (evolutionX < 0.45) {
      return 'Build or Partner';
    } else if (evolutionX < 0.70) {
      return 'Buy (Product/SaaS)';
    } else {
      return 'Outsource (Commodity)';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDATION & DATA QUALITY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize validation rules for each data type
   */
  initializeValidationRules() {
    return {
      'capability': {
        required: ['name', 'domain', 'maturity'],
        types: {
          name: 'string',
          domain: 'enum:Customer,Operations,Product,Finance,Technology',
          strategicImportance: 'enum:strategic,important,commodity',
          maturity: 'number:1-5'
        }
      },
      'system': {
        required: ['name', 'status'],
        types: {
          name: 'string',
          status: 'enum:active,planned,deprecated',
          category: 'string'
        }
      },
      'aiAgent': {
        required: ['name', 'purpose'],
        types: {
          name: 'string',
          purpose: 'string',
          capabilities: 'array'
        }
      }
    };
  }

  /**
   * Validate data against schema
   */
  validateData(data, schemaType) {
    const rules = this.validationRules[schemaType];
    if (!rules) return { valid: true, errors: [] };

    const errors = [];

    // Check required fields
    rules.required.forEach(field => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check field types and constraints
    Object.entries(rules.types).forEach(([field, typeRule]) => {
      if (!data[field]) return;

      if (typeRule.startsWith('enum:')) {
        const validValues = typeRule.split(':')[1].split(',');
        if (!validValues.includes(String(data[field]))) {
          errors.push(`Invalid value for ${field}. Must be one of: ${validValues.join(', ')}`);
        }
      } else if (typeRule.startsWith('number:')) {
        const [min, max] = typeRule.split(':')[1].split('-').map(Number);
        const value = Number(data[field]);
        if (isNaN(value) || value < min || value > max) {
          errors.push(`${field} must be a number between ${min} and ${max}`);
        }
      } else if (typeRule === 'array') {
        if (!Array.isArray(data[field])) {
          errors.push(`${field} must be an array`);
        }
      } else if (typeRule === 'string') {
        if (typeof data[field] !== 'string') {
          errors.push(`${field} must be a string`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize transformation rules registry
   */
  initializeTransformRules() {
    return {
      'bmc_to_valuechain': {
        name: 'BMC → Value Chain',
        direction: 'unidirectional',
        description: 'Export BMC context for Value Chain AI analysis'
      },
      'valuechain_to_ea': {
        name: 'Value Chain → EA Platform',
        direction: 'bidirectional',
        description: 'Transform activities to capabilities, systems, AI agents'
      },
      'valuechain_to_capability': {
        name: 'Value Chain → Capability Mapping',
        direction: 'unidirectional',
        description: 'Map activities to capability domains with priorities'
      },
      'capability_to_strategy': {
        name: 'Capability Map → Strategy Workbench',
        direction: 'unidirectional',
        description: 'Position capabilities on Wardley map with coordinates'
      }
    };
  }

  /**
   * Get integration status for all toolkits
   */
  getIntegrationStatus() {
    if (!this.dataManager) return {};

    return {
      bmc: this.dataManager.getIntegrationData('bmc_latest') ? 'available' : 'pending',
      valuechain: this.dataManager.getIntegrationData('valuechain_latest') ? 'available' : 'pending',
      capability: this.dataManager.getIntegrationData('capability_latest') ? 'available' : 'pending',
      strategy: this.dataManager.getIntegrationData('strategy_latest') ? 'available' : 'pending',
      lastSync: this.dataManager.getIntegrationData('last_sync_time') || 'never'
    };
  }

  /**
   * Log integration event
   */
  logIntegration(source, target, status, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      source,
      target,
      status,
      metadata
    };

    this.integrationLog.push(logEntry);

    // Keep only last 50 entries
    if (this.integrationLog.length > 50) {
      this.integrationLog = this.integrationLog.slice(-50);
    }

    // Save to dataManager
    if (this.dataManager) {
      this.saveIntegrationLog();
    }

    console.log(`🔗 Integration: ${source} → ${target} [${status}]`);
  }

  /**
   * Save integration log to localStorage
   */
  saveIntegrationLog() {
    if (this.dataManager) {
      localStorage.setItem('ea_integration_log', JSON.stringify(this.integrationLog));
    }
  }

  /**
   * Load integration log from localStorage
   */
  loadIntegrationLog() {
    try {
      const saved = localStorage.getItem('ea_integration_log');
      if (saved) {
        this.integrationLog = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading integration log:', e);
      this.integrationLog = [];
    }
  }

  /**
   * Get integration log
   */
  getIntegrationLog(limit = 20) {
    return this.integrationLog.slice(-limit).reverse();
  }

  /**
   * Clear integration cache
   */
  clearIntegrationCache() {
    if (this.dataManager) {
      localStorage.removeItem('ea_integration_bmc_latest');
      localStorage.removeItem('ea_integration_valuechain_latest');
      localStorage.removeItem('ea_integration_capability_latest');
      localStorage.removeItem('ea_integration_strategy_latest');
      localStorage.removeItem('ea_integration_log');
      
      this.integrationLog = [];
      console.log('✓ Integration cache cleared');
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_IntegrationEngine;
}
