/**
 * apqc_whitespot_integration.js
 * APQC PCF integration for WhiteSpot Heatmap capability mapping
 * Maps APQC L3-L4 processes to Vivicta DCS L3 delivery components
 * 
 * Integration Pattern:
 * - APQC PCF L3-L4 processes → DCS L3 components (per golden rule)
 * - Hybrid approach: AI-generated suggestions + user override capability
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class APQCWhiteSpotIntegration {
  constructor() {
    this.apqcData = null;
    this.l1Categories = [];
    this.l2Processes = [];
    this.l3Processes = [];
    this.l4Processes = [];
    this.isLoaded = false;
    
    // Default mapping templates (AI-enhanced)
    this.defaultMappings = [];
    this.customMappings = [];
  }

  /**
   * Load APQC PCF data from JSON
   * @param {string} jsonPath - Path to APQC master JSON (relative to root)
   * @returns {Promise<boolean>} - Success status
   */
  async loadAPQCFramework(jsonPath = '../../APAQ_Data/apqc_pcf_master.json') {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${jsonPath}: ${response.statusText}`);
      }
      
      this.apqcData = await response.json();
      this._parseAPQCData();
      this.isLoaded = true;
      
      console.log(`✓ APQC PCF Framework loaded (v${this.apqcData.framework_version})`);
      console.log(`  L1 Categories: ${this.l1Categories.length}`);
      console.log(`  L2 Processes: ${this.l2Processes.length}`);
      console.log(`  L3 Processes: ${this.l3Processes.length}`);
      console.log(`  L4 Processes: ${this.l4Processes.length}`);
      
      return true;
    } catch (error) {
      console.error('✗ Failed to load APQC Framework:', error);
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * Parse loaded APQC JSON and populate internal data structures
   * Flattens hierarchical structure for easier querying
   * @private
   */
  _parseAPQCData() {
    if (!this.apqcData?.categories) return;

    this.apqcData.categories.forEach(l1 => {
      // Store L1 category
      this.l1Categories.push({
        id: l1.id,
        code: l1.code,
        level: 1,
        name: l1.name,
        description: l1.description
      });

      // Parse L2 children
      if (l1.children) {
        l1.children.forEach(l2 => {
          this.l2Processes.push({
            id: l2.id,
            code: l2.code,
            level: 2,
            parentId: l1.id,
            parentName: l1.name,
            name: l2.name,
            description: l2.description,
            industries: l2.industries || [],
            strategicThemes: l2.strategic_themes || [],
            capabilityCategory: l2.capability_category || ''
          });

          // Parse L3 children
          if (l2.children) {
            l2.children.forEach(l3 => {
              this.l3Processes.push({
                id: l3.id,
                code: l3.code,
                level: 3,
                parentId: l2.id,
                parentName: l2.name,
                l1ParentId: l1.id,
                l1ParentName: l1.name,
                name: l3.name,
                description: l3.description || '',
                industries: l3.industries || l2.industries || [],
                strategicThemes: l3.strategic_themes || l2.strategic_themes || [],
                capabilityCategory: l3.capability_category || l2.capability_category || ''
              });

              // Parse L4 children
              if (l3.children) {
                l3.children.forEach(l4 => {
                  this.l4Processes.push({
                    id: l4.id,
                    code: l4.code,
                    level: 4,
                    parentId: l3.id,
                    parentName: l3.name,
                    l2ParentId: l2.id,
                    l2ParentName: l2.name,
                    l1ParentId: l1.id,
                    l1ParentName: l1.name,
                    name: l4.name,
                    description: l4.description || '',
                    industries: l4.industries || l3.industries || l2.industries || [],
                    strategicThemes: l4.strategic_themes || l3.strategic_themes || l2.strategic_themes || [],
                    capabilityCategory: l4.capability_category || l3.capability_category || l2.capability_category || ''
                  });
                });
              }
            });
          }
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - APQC BROWSING & SEARCH
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get all APQC L3 processes (primary mapping level)
   * @param {Object} filters - Optional filters (industry, theme, category)
   * @returns {Array} - Filtered L3 processes
   */
  getL3Processes(filters = {}) {
    let results = [...this.l3Processes];

    if (filters.industry) {
      results = results.filter(p => 
        p.industries.includes(filters.industry) || p.industries.includes('all')
      );
    }

    if (filters.strategicTheme) {
      results = results.filter(p => 
        p.strategicThemes.includes(filters.strategicTheme)
      );
    }

    if (filters.capabilityCategory) {
      results = results.filter(p => 
        p.capabilityCategory === filters.capabilityCategory
      );
    }

    return results;
  }

  /**
   * Get all APQC L4 processes (secondary mapping level)
   * @param {Object} filters - Optional filters
   * @returns {Array} - Filtered L4 processes
   */
  getL4Processes(filters = {}) {
    let results = [...this.l4Processes];

    if (filters.l3ParentId) {
      results = results.filter(p => p.parentId === filters.l3ParentId);
    }

    if (filters.industry) {
      results = results.filter(p => 
        p.industries.includes(filters.industry) || p.industries.includes('all')
      );
    }

    return results;
  }

  /**
   * Get APQC process by ID (any level)
   * @param {string} processId - APQC process ID
   * @returns {Object|null} - Process object or null
   */
  getProcessById(processId) {
    return this.l1Categories.find(p => p.id === processId) ||
           this.l2Processes.find(p => p.id === processId) ||
           this.l3Processes.find(p => p.id === processId) ||
           this.l4Processes.find(p => p.id === processId) ||
           null;
  }

  /**
   * Search APQC processes by keyword
   * @param {string} keyword - Search term
   * @param {Array} levels - Levels to search (default: [3, 4])
   * @returns {Object} - Search results grouped by level
   */
  searchProcesses(keyword, levels = [3, 4]) {
    const lowerKeyword = keyword.toLowerCase();
    const results = {};

    if (levels.includes(1)) {
      results.l1Matches = this.l1Categories.filter(p =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        (p.description && p.description.toLowerCase().includes(lowerKeyword))
      );
    }

    if (levels.includes(2)) {
      results.l2Matches = this.l2Processes.filter(p =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        (p.description && p.description.toLowerCase().includes(lowerKeyword))
      );
    }

    if (levels.includes(3)) {
      results.l3Matches = this.l3Processes.filter(p =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        (p.description && p.description.toLowerCase().includes(lowerKeyword))
      );
    }

    if (levels.includes(4)) {
      results.l4Matches = this.l4Processes.filter(p =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        (p.description && p.description.toLowerCase().includes(lowerKeyword))
      );
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - AI-POWERED MAPPING SUGGESTIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Generate AI-suggested APQC → DCS L3 mappings for a L2 service
   * Uses semantic matching based on keywords and capability categories
   * 
   * @param {Object} dcsL2Service - DCS L2 service object from Vivicta model
   * @param {Array} dcsL3Components - Array of DCS L3 components for this service
   * @param {Object} options - Mapping options (maxSuggestions, industry filter)
   * @returns {Array} - Array of suggested mappings with confidence scores
   */
  generateMappingSuggestions(dcsL2Service, dcsL3Components, options = {}) {
    const {
      maxSuggestions = 5,
      industry = null,
      minConfidence = 0.3
    } = options;

    const suggestions = [];

    // Get relevant APQC processes based on L2 service name
    const l2Keywords = this._extractKeywords(dcsL2Service.name);
    
    // Search APQC L3-L4 for matches
    const apqcMatches = this._findSemanticMatches(l2Keywords, industry);

    // For each DCS L3 component, find best APQC matches
    dcsL3Components.forEach(dcsL3 => {
      const l3Keywords = this._extractKeywords(dcsL3.name);
      
      apqcMatches.forEach(apqcProcess => {
        const confidence = this._calculateMatchConfidence(
          l3Keywords,
          apqcProcess,
          dcsL3
        );

        if (confidence >= minConfidence) {
          suggestions.push({
            apqcId: apqcProcess.id,
            apqcLevel: `L${apqcProcess.level}`,
            apqcName: apqcProcess.name,
            apqcDescription: apqcProcess.description,
            mapsToL3: [dcsL3.id],
            mapsToL3Names: [dcsL3.name],
            confidence: confidence,
            rationale: this._generateRationale(apqcProcess, dcsL3, confidence),
            isCustom: false,
            industries: apqcProcess.industries,
            strategicThemes: apqcProcess.strategicThemes
          });
        }
      });
    });

    // Sort by confidence and return top N
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);
  }

  /**
   * Extract keywords from service/component name
   * @private
   */
  _extractKeywords(name) {
    // Remove common words and extract meaningful terms
    const stopWords = ['and', 'or', 'the', 'of', 'to', 'for', 'in', 'as', 'a'];
    return name
      .toLowerCase()
      .replace(/[()&]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  /**
   * Find APQC processes that semantically match keywords
   * @private
   */
  _findSemanticMatches(keywords, industry = null) {
    const l3Matches = this.l3Processes.filter(p => {
      const nameWords = p.name.toLowerCase().split(/\s+/);
      const descWords = (p.description || '').toLowerCase().split(/\s+/);
      
      const hasKeywordMatch = keywords.some(kw => 
        nameWords.some(w => w.includes(kw) || kw.includes(w)) ||
        descWords.some(w => w.includes(kw) || kw.includes(w))
      );

      const matchesIndustry = !industry || 
        p.industries.includes(industry) || 
        p.industries.includes('all');

      return hasKeywordMatch && matchesIndustry;
    });

    const l4Matches = this.l4Processes.filter(p => {
      const nameWords = p.name.toLowerCase().split(/\s+/);
      const descWords = (p.description || '').toLowerCase().split(/\s+/);
      
      const hasKeywordMatch = keywords.some(kw => 
        nameWords.some(w => w.includes(kw) || kw.includes(w)) ||
        descWords.some(w => w.includes(kw) || kw.includes(w))
      );

      const matchesIndustry = !industry || 
        p.industries.includes(industry) || 
        p.industries.includes('all');

      return hasKeywordMatch && matchesIndustry;
    });

    return [...l3Matches, ...l4Matches];
  }

  /**
   * Calculate confidence score for APQC → DCS mapping
   * @private
   */
  _calculateMatchConfidence(dcsKeywords, apqcProcess, dcsComponent) {
    let score = 0.0;

    const apqcWords = apqcProcess.name.toLowerCase().split(/\s+/);
    const apqcDescWords = (apqcProcess.description || '').toLowerCase().split(/\s+/);

    // Keyword overlap score (0.0 - 0.6)
    const keywordMatches = dcsKeywords.filter(kw =>
      apqcWords.some(w => w.includes(kw) || kw.includes(w))
    ).length;
    score += Math.min(keywordMatches / dcsKeywords.length, 1.0) * 0.6;

    // Description overlap score (0.0 - 0.2)
    const descMatches = dcsKeywords.filter(kw =>
      apqcDescWords.some(w => w.includes(kw) || kw.includes(w))
    ).length;
    score += Math.min(descMatches / dcsKeywords.length, 1.0) * 0.2;

    // Strategic alignment score (0.0 - 0.2)
    const strategicBoost = this._getStrategicAlignmentBoost(
      apqcProcess.capabilityCategory,
      dcsComponent.name
    );
    score += strategicBoost * 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Get strategic alignment boost based on capability category
   * @private
   */
  _getStrategicAlignmentBoost(capabilityCategory, dcsName) {
    const lowerDcs = dcsName.toLowerCase();
    
    if (capabilityCategory === 'technology' && 
        (lowerDcs.includes('cloud') || lowerDcs.includes('platform') || lowerDcs.includes('automation'))) {
      return 1.0;
    }
    
    if (capabilityCategory === 'product' && 
        (lowerDcs.includes('development') || lowerDcs.includes('design'))) {
      return 1.0;
    }
    
    if (capabilityCategory === 'operations' && 
        (lowerDcs.includes('managed') || lowerDcs.includes('operations'))) {
      return 1.0;
    }
    
    return 0.5;
  }

  /**
   * Generate human-readable rationale for mapping
   * @private
   */
  _generateRationale(apqcProcess, dcsComponent, confidence) {
    if (confidence >= 0.7) {
      return `Strong semantic match between "${apqcProcess.name}" and "${dcsComponent.name}". Both focus on similar capabilities.`;
    } else if (confidence >= 0.5) {
      return `Moderate match - "${apqcProcess.name}" partially aligns with "${dcsComponent.name}" delivery scope.`;
    } else {
      return `Low-confidence suggestion based on keyword overlap. Review and customize as needed.`;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - CUSTOM MAPPINGS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Create custom APQC → DCS mapping (user override)
   * @param {string} apqcId - APQC process ID
   * @param {Array} dcsL3Ids - Array of DCS L3 component IDs
   * @param {string} rationale - User's rationale for mapping
   * @returns {Object} - Created mapping object
   */
  createCustomMapping(apqcId, dcsL3Ids, rationale = '') {
    const apqcProcess = this.getProcessById(apqcId);
    if (!apqcProcess) {
      throw new Error(`APQC process not found: ${apqcId}`);
    }

    const customMapping = {
      apqcId: apqcProcess.id,
      apqcLevel: `L${apqcProcess.level}`,
      apqcName: apqcProcess.name,
      mapsToL3: dcsL3Ids,
      rationale: rationale || `Custom mapping created by user`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    this.customMappings.push(customMapping);
    return customMapping;
  }

  /**
   * Get all custom mappings
   * @returns {Array} - Array of custom mapping objects
   */
  getCustomMappings() {
    return this.customMappings;
  }

  /**
   * Delete custom mapping
   * @param {string} apqcId - APQC process ID
   * @returns {boolean} - Success status
   */
  deleteCustomMapping(apqcId) {
    const index = this.customMappings.findIndex(m => m.apqcId === apqcId);
    if (index !== -1) {
      this.customMappings.splice(index, 1);
      return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API - UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get APQC framework statistics
   * @returns {Object} - Framework statistics
   */
  getStatistics() {
    return {
      frameworkVersion: this.apqcData?.framework_version || 'unknown',
      frameworkType: this.apqcData?.framework_type || 'unknown',
      totalCategories: this.l1Categories.length,
      totalL2Processes: this.l2Processes.length,
      totalL3Processes: this.l3Processes.length,
      totalL4Processes: this.l4Processes.length,
      customMappings: this.customMappings.length,
      isLoaded: this.isLoaded
    };
  }

  /**
   * Check if APQC framework is loaded and ready
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
  window.apqcWhiteSpotIntegration = new APQCWhiteSpotIntegration();
}

// Module export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APQCWhiteSpotIntegration;
}
