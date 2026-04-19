/**
 * EA_GlobalSearch.js
 * Global search and filter across all entities
 * Provides unified search bar with filters, saved searches, and recent items
 * 
 * @version 1.0
 * @phase Phase 5 - Integration & Polish
 */

class EA_GlobalSearch {
  constructor() {
    this.searchIndex = new Map();
    this.savedSearches = [];
    this.recentItems = [];
    this.maxRecentItems = 10;
    this.loadSavedSearches();
    this.loadRecentItems();
  }

  /**
   * Build search index from all entities
   * @returns {Promise<void>}
   */
  async buildSearchIndex() {
    console.log('🔍 Building search index...');
    this.searchIndex.clear();

    const accountManager = window.EA_AccountManager ? new window.EA_AccountManager() : null;
    const engagementManager = window.engagementManager;

    // Index accounts
    if (accountManager) {
      const accounts = accountManager.listAccounts();
      accounts.forEach(account => {
        this.indexEntity('account', account.id, {
          name: account.name,
          accountManager: account.accountManager,
          industry: account.industry,
          region: account.region,
          size: account.size,
          health: account.health,
          strategicPriorities: account.strategicPriorities?.join(' ') || '',
          painPoints: account.painPoints?.join(' ') || ''
        });
      });
    }

    // Index opportunities
    if (accountManager) {
      const allOpportunities = [];
      const accounts = accountManager.listAccounts();
      accounts.forEach(account => {
        const opportunities = accountManager.listOpportunities(account.id);
        allOpportunities.push(...opportunities);
      });

      allOpportunities.forEach(opp => {
        this.indexEntity('opportunity', opp.id, {
          name: opp.name,
          accountId: opp.accountId,
          status: opp.status,
          sponsor: opp.sponsor,
          nextSteps: opp.nextSteps?.join(' ') || ''
        });
      });
    }

    // Index engagements
    if (engagementManager) {
      const engagements = engagementManager.getAllEngagements();
      engagements.forEach(engagement => {
        this.indexEntity('engagement', engagement.id, {
          name: engagement.name,
          customerName: engagement.customerName,
          segment: engagement.segment,
          theme: engagement.theme,
          status: engagement.status,
          accountId: engagement.accountId
        });

        // Index stakeholders
        const stakeholders = engagementManager.getStakeholders(engagement.id);
        stakeholders.forEach(stakeholder => {
          this.indexEntity('stakeholder', stakeholder.id, {
            name: stakeholder.name,
            role: stakeholder.role,
            type: stakeholder.type,
            level: stakeholder.level,
            department: stakeholder.department,
            engagementId: engagement.id,
            engagementName: engagement.name
          });
        });

        // Index applications
        const applications = engagementManager.getApplications(engagement.id);
        applications.forEach(app => {
          this.indexEntity('application', app.id, {
            name: app.name,
            category: app.category,
            technology: app.technology,
            vendor: app.vendor,
            recommendation: app.recommendation,
            engagementId: engagement.id,
            engagementName: engagement.name
          });
        });

        // Index capabilities
        const capabilities = engagementManager.getCapabilities(engagement.id);
        capabilities.forEach(cap => {
          this.indexEntity('capability', cap.id, {
            name: cap.name,
            category: cap.category,
            strategicImportance: cap.strategicImportance,
            engagementId: engagement.id,
            engagementName: engagement.name
          });
        });

        // Index initiatives
        const initiatives = engagementManager.getInitiatives(engagement.id);
        initiatives.forEach(init => {
          this.indexEntity('initiative', init.id, {
            name: init.name,
            timeHorizon: init.timeHorizon,
            status: init.status,
            owner: init.owner,
            engagementId: engagement.id,
            engagementName: engagement.name
          });
        });
      });
    }

    console.log(`✅ Search index built: ${this.searchIndex.size} entities`);
  }

  /**
   * Index an entity
   * @param {string} type
   * @param {string} id
   * @param {object} data
   */
  indexEntity(type, id, data) {
    const key = `${type}:${id}`;
    
    // Build searchable text
    const searchText = Object.values(data)
      .filter(v => v !== null && v !== undefined)
      .map(v => String(v).toLowerCase())
      .join(' ');

    this.searchIndex.set(key, {
      type,
      id,
      data,
      searchText
    });
  }

  /**
   * Search across all entities
   * @param {string} query
   * @param {object} filters - {type, segment, status, dateRange, owner}
   * @returns {Array}
   */
  search(query, filters = {}) {
    const queryLower = query.toLowerCase().trim();
    const results = [];

    if (!queryLower && Object.keys(filters).length === 0) {
      return [];
    }

    for (const [key, entry] of this.searchIndex) {
      // Text search
      let matchesQuery = true;
      if (queryLower) {
        matchesQuery = entry.searchText.includes(queryLower);
      }

      // Apply filters
      let matchesFilters = true;

      if (filters.type && filters.type.length > 0) {
        matchesFilters = matchesFilters && filters.type.includes(entry.type);
      }

      if (filters.segment) {
        matchesFilters = matchesFilters && (
          entry.data.segment === filters.segment ||
          entry.data.industry === filters.segment
        );
      }

      if (filters.status) {
        matchesFilters = matchesFilters && entry.data.status === filters.status;
      }

      if (filters.owner) {
        matchesFilters = matchesFilters && (
          entry.data.owner === filters.owner ||
          entry.data.accountManager === filters.owner
        );
      }

      if (filters.dateRange) {
        // Filter by date (if applicable)
        const entityDate = entry.data.createdAt || entry.data.startDate;
        if (entityDate) {
          const date = new Date(entityDate);
          if (date < new Date(filters.dateRange.start) || date > new Date(filters.dateRange.end)) {
            matchesFilters = false;
          }
        }
      }

      if (matchesQuery && matchesFilters) {
        results.push({
          type: entry.type,
          id: entry.id,
          data: entry.data,
          score: this.calculateRelevanceScore(entry.searchText, queryLower)
        });
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 50); // Limit to 50 results
  }

  /**
   * Calculate relevance score
   * @param {string} text
   * @param {string} query
   * @returns {number}
   */
  calculateRelevanceScore(text, query) {
    if (!query) return 0;

    let score = 0;

    // Exact match
    if (text === query) {
      score += 100;
    }

    // Starts with query
    if (text.startsWith(query)) {
      score += 50;
    }

    // Contains query
    if (text.includes(query)) {
      score += 25;
    }

    // Word match
    const words = query.split(' ');
    words.forEach(word => {
      if (text.includes(word)) {
        score += 10;
      }
    });

    return score;
  }

  /**
   * Get search suggestions (autocomplete)
   * @param {string} query
   * @param {number} limit
   * @returns {Array}
   */
  getSuggestions(query, limit = 5) {
    const queryLower = query.toLowerCase().trim();
    if (!queryLower) return [];

    const suggestions = new Set();

    for (const [key, entry] of this.searchIndex) {
      // Check name field
      const name = entry.data.name?.toLowerCase();
      if (name && name.includes(queryLower)) {
        suggestions.add(entry.data.name);
      }

      // Check other text fields
      if (entry.data.customerName?.toLowerCase().includes(queryLower)) {
        suggestions.add(entry.data.customerName);
      }

      if (entry.data.role?.toLowerCase().includes(queryLower)) {
        suggestions.add(entry.data.role);
      }

      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Save a search
   * @param {string} name
   * @param {string} query
   * @param {object} filters
   */
  saveSearch(name, query, filters) {
    const existingIndex = this.savedSearches.findIndex(s => s.name === name);
    
    const savedSearch = {
      name,
      query,
      filters,
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.savedSearches[existingIndex] = savedSearch;
    } else {
      this.savedSearches.push(savedSearch);
    }

    this.persistSavedSearches();
  }

  /**
   * Delete saved search
   * @param {string} name
   */
  deleteSavedSearch(name) {
    this.savedSearches = this.savedSearches.filter(s => s.name !== name);
    this.persistSavedSearches();
  }

  /**
   * Get saved searches
   * @returns {Array}
   */
  getSavedSearches() {
    return this.savedSearches;
  }

  /**
   * Load saved search
   * @param {string} name
   * @returns {object|null}
   */
  loadSavedSearch(name) {
    return this.savedSearches.find(s => s.name === name) || null;
  }

  /**
   * Persist saved searches to localStorage
   */
  persistSavedSearches() {
    try {
      localStorage.setItem('ea_saved_searches', JSON.stringify(this.savedSearches));
    } catch (error) {
      console.warn('Failed to save searches:', error);
    }
  }

  /**
   * Load saved searches from localStorage
   */
  loadSavedSearches() {
    try {
      const saved = localStorage.getItem('ea_saved_searches');
      if (saved) {
        this.savedSearches = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load saved searches:', error);
      this.savedSearches = [];
    }
  }

  /**
   * Add to recent items
   * @param {string} type
   * @param {string} id
   * @param {string} name
   */
  addToRecent(type, id, name) {
    // Remove if already exists
    this.recentItems = this.recentItems.filter(item => !(item.type === type && item.id === id));

    // Add to front
    this.recentItems.unshift({
      type,
      id,
      name,
      timestamp: new Date().toISOString()
    });

    // Trim to max size
    if (this.recentItems.length > this.maxRecentItems) {
      this.recentItems = this.recentItems.slice(0, this.maxRecentItems);
    }

    this.persistRecentItems();
  }

  /**
   * Get recent items
   * @returns {Array}
   */
  getRecentItems() {
    return this.recentItems;
  }

  /**
   * Clear recent items
   */
  clearRecentItems() {
    this.recentItems = [];
    this.persistRecentItems();
  }

  /**
   * Persist recent items to localStorage
   */
  persistRecentItems() {
    try {
      localStorage.setItem('ea_recent_items', JSON.stringify(this.recentItems));
    } catch (error) {
      console.warn('Failed to save recent items:', error);
    }
  }

  /**
   * Load recent items from localStorage
   */
  loadRecentItems() {
    try {
      const saved = localStorage.getItem('ea_recent_items');
      if (saved) {
        this.recentItems = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load recent items:', error);
      this.recentItems = [];
    }
  }

  /**
   * Get available filter options
   * @returns {object}
   */
  getFilterOptions() {
    const options = {
      types: ['account', 'opportunity', 'engagement', 'stakeholder', 'application', 'capability', 'initiative', 'risk'],
      segments: new Set(),
      statuses: new Set(),
      owners: new Set()
    };

    for (const [key, entry] of this.searchIndex) {
      if (entry.data.segment) options.segments.add(entry.data.segment);
      if (entry.data.industry) options.segments.add(entry.data.industry);
      if (entry.data.status) options.statuses.add(entry.data.status);
      if (entry.data.owner) options.owners.add(entry.data.owner);
      if (entry.data.accountManager) options.owners.add(entry.data.accountManager);
    }

    return {
      types: options.types,
      segments: Array.from(options.segments).sort(),
      statuses: Array.from(options.statuses).sort(),
      owners: Array.from(options.owners).sort()
    };
  }

  /**
   * Format search result for display
   * @param {object} result
   * @returns {object}
   */
  formatResult(result) {
    const icons = {
      'account': '🏢',
      'opportunity': '🎯',
      'engagement': '📋',
      'stakeholder': '👤',
      'application': '💻',
      'capability': '🎯',
      'initiative': '🚀',
      'risk': '⚠️'
    };

    const formatted = {
      icon: icons[result.type] || '📌',
      type: result.type,
      id: result.id,
      title: result.data.name || result.data.customerName || 'Untitled',
      subtitle: '',
      metadata: [],
      url: this.getResultUrl(result)
    };

    // Type-specific formatting
    switch (result.type) {
      case 'account':
        formatted.subtitle = `${result.data.industry} • ${result.data.region}`;
        formatted.metadata.push({ label: 'ACV', value: result.data.ACV ? `$${result.data.ACV.toLocaleString()}` : 'N/A' });
        formatted.metadata.push({ label: 'Health', value: result.data.health });
        break;

      case 'opportunity':
        formatted.subtitle = `${result.data.status} • ${result.data.sponsor || 'No sponsor'}`;
        formatted.metadata.push({ label: 'Value', value: result.data.estimatedValue ? `$${result.data.estimatedValue.toLocaleString()}` : 'N/A' });
        break;

      case 'engagement':
        formatted.subtitle = `${result.data.segment} • ${result.data.status}`;
        formatted.metadata.push({ label: 'Customer', value: result.data.customerName });
        break;

      case 'stakeholder':
        formatted.subtitle = result.data.role;
        formatted.metadata.push({ label: 'Engagement', value: result.data.engagementName });
        formatted.metadata.push({ label: 'Level', value: result.data.level });
        break;

      case 'application':
        formatted.subtitle = `${result.data.category} • ${result.data.technology}`;
        formatted.metadata.push({ label: 'Engagement', value: result.data.engagementName });
        formatted.metadata.push({ label: 'Recommendation', value: result.data.recommendation });
        break;

      case 'capability':
        formatted.subtitle = result.data.category;
        formatted.metadata.push({ label: 'Engagement', value: result.data.engagementName });
        formatted.metadata.push({ label: 'Strategic Importance', value: result.data.strategicImportance });
        break;

      case 'initiative':
        formatted.subtitle = `${result.data.timeHorizon}-term • ${result.data.status}`;
        formatted.metadata.push({ label: 'Engagement', value: result.data.engagementName });
        break;
    }

    return formatted;
  }

  /**
   * Get URL for search result
   * @param {object} result
   * @returns {string}
   */
  getResultUrl(result) {
    switch (result.type) {
      case 'account':
        return `EA_Account_Dashboard.html?accountId=${result.id}`;
      case 'opportunity':
        return `EA_Opportunity_Pipeline.html?opportunityId=${result.id}`;
      case 'engagement':
        return `EA_Engagement_Playbook.html?engagementId=${result.id}`;
      case 'stakeholder':
      case 'application':
      case 'capability':
      case 'initiative':
        return `EA_Engagement_Playbook.html?engagementId=${result.data.engagementId}`;
      default:
        return '#';
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_GlobalSearch = EA_GlobalSearch;
  window.globalSearch = new EA_GlobalSearch();
}
