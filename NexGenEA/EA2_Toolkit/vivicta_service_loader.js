/**
 * vivicta_service_loader.js
 * Module for loading and accessing Vivicta DCS Service Delivery model
 * Supports L1 (Service Areas) → L2 (Delivery Offerings) → L3 (Delivery Components) hierarchy
 * Handles both v4.1 (flat L2 list) and v5+ (full L1/L2/L3 hierarchy) JSON formats
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class VivictaServiceLoader {
  constructor() {
    this.serviceData = null;
    this.l1ServiceAreas = [];
    this.l2Offerings = [];
    this.l3Components = [];
    this.isLoaded = false;
  }

  /**
   * Load Vivicta service delivery model from JSON
   * @param {string} jsonPath - Path to JSON file (relative to data folder)
   * @returns {Promise<boolean>} - Success status
   */
  async loadServiceModel(jsonPath = 'data/vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json') {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${jsonPath}: ${response.statusText}`);
      }
      
      this.serviceData = await response.json();
      this._parseServiceData();
      this.isLoaded = true;
      
      console.log(`✓ Service Model loaded (v${this.serviceData.schemaVersion || 'unknown'})`);
      console.log(`  L1 Service Areas: ${this.l1ServiceAreas.length}`);
      console.log(`  L2 HL Offerings: ${this.getHLServices().length}`);
      console.log(`  L3 Components: ${this.l3Components.length}`);
      
      return true;
    } catch (error) {
      console.error('✗ Failed to load Service Model:', error);
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * Parse loaded JSON and populate internal data structures
   * Handles both v4.1 (flat) and v5+ (hierarchical) formats
   * @private
   */
  _parseServiceData() {
    // Parse L2 Delivery Offerings
    if (this.serviceData.deliveryOfferings_L2) {
      this.l2Offerings = this.serviceData.deliveryOfferings_L2.map((offering, index) => ({
        id: offering.id || `L2-${String(index + 1).padStart(3, '0')}`, // Use id from JSON or generate
        name: offering.name,
        heatmapLevel: offering.heatmapLevel || 'DL',
        l1ParentId: offering.l1ServiceArea || this._inferL1Category(offering.name),
        l1ParentName: offering.l1ServiceAreaName || this._inferL1CategoryName(offering.name),
        l1SubArea: offering.l1SubArea || null, // Sub-domain grouping (Data & AI, Cloud, etc.)
        l3ComponentIds: offering.l3Components || [],
        description: offering.description || '',
        isHL: (offering.heatmapLevel === 'HL')
      }));
    }

    // Parse L3 Delivery Components
    if (this.serviceData.deliveryComponents_L3) {
      this.l3Components = this.serviceData.deliveryComponents_L3.map((component, index) => ({
        id: `L3-${String(index + 1).padStart(3, '0')}`, // L3-001, L3-002, etc.
        name: component.name,
        heatmapLevel: component.heatmapLevel || 'DL',
        l2ParentId: component.l2ParentId || null,
        l2ParentName: component.l2ParentName || null,
        description: component.description || ''
      }));
    }

    // Parse or generate L1 Service Areas
    if (this.serviceData.serviceAreas_L1) {
      // v5+ format with explicit L1 structure
      this.l1ServiceAreas = this.serviceData.serviceAreas_L1.map((area, index) => ({
        id: `L1-${String(index + 1).padStart(3, '0')}`, // L1-001, L1-002, L1-003
        name: area.name,
        description: area.description || '',
        l2OfferingIds: area.l2Offerings || []
      }));
    } else {
      // v4.1 format - infer L1 from implementation guide
      this.l1ServiceAreas = [
        {
          id: 'L1-001',
          name: 'Consulting & Project Services',
          description: 'Advisory, strategy, and transformation consulting',
          l2OfferingIds: []
        },
        {
          id: 'L1-002',
          name: 'Managed Services',
          description: 'Ongoing operational services and support',
          l2OfferingIds: []
        },
        {
          id: 'L1-003',
          name: 'Platform Services',
          description: 'Cloud platforms, infrastructure, and enablement',
          l2OfferingIds: []
        }
      ];

      // Link L2 offerings to L1 areas based on inferred categories
      this.l2Offerings.forEach(l2 => {
        const l1Area = this.l1ServiceAreas.find(l1 => l1.id === l2.l1ParentId);
        if (l1Area && !l1Area.l2OfferingIds.includes(l2.id)) {
          l1Area.l2OfferingIds.push(l2.id);
        }
      });
    }
  }

  /**
   * Infer L1 Service Area category from L2 offering name
   * Based on Vivicta DCS service delivery model structure
   * @private
   */
  _inferL1Category(l2Name) {
    const lowerName = l2Name.toLowerCase();
    
    // Consulting & Project Services patterns
    if (lowerName.includes('advisory') || lowerName.includes('consultancy') || 
        lowerName.includes('assessments') || lowerName.includes('roadmap') ||
        lowerName.includes('strategy') || lowerName.includes('governance') ||
        lowerName.includes('architecture') || lowerName.includes('modelling') ||
        lowerName.includes('custom software development') ||
        lowerName.includes('system integration') ||
        lowerName.includes('team as a service')) {
      return 'L1-001'; // Consulting & Project Services
    }
    
    // Managed Services patterns
    if (lowerName.includes('managed') || lowerName.includes('operate') ||
        lowerName.includes('lifecycle') || lowerName.includes('observability') ||
        lowerName.includes('security testing') || lowerName.includes('vulnerability') ||
        lowerName.includes('service management') || lowerName.includes('siam') ||
        lowerName.includes('itsm') || lowerName.includes('identity') ||
        lowerName.includes('access management')) {
      return 'L1-002'; // Managed Services
    }
    
    // Platform Services patterns (default)
    return 'L1-003'; // Platform Services
  }

  /**
   * Get friendly name for L1 category
   * @private
   */
  _inferL1CategoryName(l2Name) {
    const l1Id = this._inferL1Category(l2Name);
    const l1Area = this.l1ServiceAreas.find(l1 => l1.id === l1Id);
    return l1Area ? l1Area.name : 'Unknown';
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - HIGH LEVEL SERVICES (FOR HEATMAP)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get all High Level (HL) L2 services for heatmap display
   * @returns {Array} - Array of L2 offerings tagged as HL
   */
  getHLServices() {
    return this.l2Offerings.filter(l2 => l2.isHL);
  }

  /**
   * Get HL services grouped by L1 Service Area (for accordion UI)
   * @returns {Array} - Array of L1 areas with nested HL L2 offerings
   */
  getHLServicesGrouped() {
    return this.l1ServiceAreas.map(l1 => ({
      l1Id: l1.id,
      l1Name: l1.name,
      l1Description: l1.description,
      hlServices: this.l2Offerings.filter(l2 => 
        l2.l1ParentId === l1.id && l2.isHL
      )
    }));
  }

  /**
   * Get single L2 HL service by ID
   * @param {string} l2Id - L2 service ID (e.g., 'L2-001')
   * @returns {Object|null} - L2 service object or null
   */
  getHLServiceById(l2Id) {
    return this.l2Offerings.find(l2 => l2.id === l2Id && l2.isHL) || null;
  }

  /**
   * Get single L2 HL service by name
   * @param {string} name - L2 service name
   * @returns {Object|null} - L2 service object or null
   */
  getHLServiceByName(name) {
    return this.l2Offerings.find(l2 => 
      l2.name.toLowerCase() === name.toLowerCase() && l2.isHL
    ) || null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - DETAIL LEVEL COMPONENTS (FOR DRILL-DOWN)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get all L3 Detail Level components for a specific L2 service
   * @param {string} l2Id - L2 service ID
   * @returns {Array} - Array of L3 components
   */
  getDLComponentsForService(l2Id) {
    return this.l3Components.filter(l3 => l3.l2ParentId === l2Id);
  }

  /**
   * Get single L3 component by ID
   * @param {string} l3Id - L3 component ID
   * @returns {Object|null} - L3 component object or null
   */
  getL3ComponentById(l3Id) {
    return this.l3Components.find(l3 => l3.id === l3Id) || null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - SERVICE HIERARCHY
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get complete service hierarchy (L1 → L2 → L3)
   * @returns {Array} - Full hierarchical structure
   */
  getServiceHierarchy() {
    return this.l1ServiceAreas.map(l1 => ({
      ...l1,
      l2Offerings: this.l2Offerings
        .filter(l2 => l2.l1ParentId === l1.id)
        .map(l2 => ({
          ...l2,
          l3Components: this.l3Components.filter(l3 => l3.l2ParentId === l2.id)
        }))
    }));
  }

  /**
   * Get all L1 Service Areas
   * @returns {Array} - Array of L1 service areas
   */
  getServiceAreas() {
    return this.l1ServiceAreas;
  }

  /**
   * Get all L2 Offerings (both HL and DL)
   * @returns {Array} - Array of all L2 offerings
   */
  getAllL2Offerings() {
    return this.l2Offerings;
  }

  /**
   * Get all L3 Components
   * @returns {Array} - Array of all L3 components
   */
  getAllL3Components() {
    return this.l3Components;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Search services by keyword (across L1/L2/L3)
   * @param {string} keyword - Search term
   * @returns {Object} - Search results grouped by level
   */
  searchServices(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    return {
      l1Matches: this.l1ServiceAreas.filter(l1 => 
        l1.name.toLowerCase().includes(lowerKeyword) ||
        (l1.description && l1.description.toLowerCase().includes(lowerKeyword))
      ),
      l2Matches: this.l2Offerings.filter(l2 => 
        l2.name.toLowerCase().includes(lowerKeyword) ||
        (l2.description && l2.description.toLowerCase().includes(lowerKeyword))
      ),
      l3Matches: this.l3Components.filter(l3 => 
        l3.name.toLowerCase().includes(lowerKeyword) ||
        (l3.description && l3.description.toLowerCase().includes(lowerKeyword))
      )
    };
  }

  /**
   * Get statistics about loaded service model
   * @returns {Object} - Service model statistics
   */
  getStatistics() {
    return {
      schemaVersion: this.serviceData?.schemaVersion || 'unknown',
      totalL1Areas: this.l1ServiceAreas.length,
      totalL2Offerings: this.l2Offerings.length,
      totalL2HL: this.getHLServices().length,
      totalL2DL: this.l2Offerings.filter(l2 => !l2.isHL).length,
      totalL3Components: this.l3Components.length,
      isLoaded: this.isLoaded
    };
  }

  /**
   * Check if service model is loaded and ready
   * @returns {boolean}
   */
  isReady() {
    return this.isLoaded;
  }
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE & EXPORT
// ═══════════════════════════════════════════════════════════════════

// Create global singleton instance
if (typeof window !== 'undefined') {
  window.vivictaServiceLoader = new VivictaServiceLoader();
}

// Module export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VivictaServiceLoader;
}
