/**
 * EA_CrossNavigation.js
 * Cross-entity linking and navigation utilities
 * Provides seamless navigation between Account → Engagement → Canvas → Entity
 * 
 * @version 1.0
 * @phase Phase 5 - Integration & Polish
 */

class EA_CrossNavigation {
  constructor() {
    this.navigationHistory = [];
    this.maxHistorySize = 20;
    this.breadcrumbs = [];
  }

  /**
   * Navigate to account view
   * @param {string} accountId
   * @param {object} options - {returnUrl, source}
   */
  goToAccount(accountId, options = {}) {
    this.addToHistory({
      type: 'account',
      id: accountId,
      timestamp: new Date().toISOString(),
      source: options.source
    });

    const url = `EA_Account_Dashboard.html?accountId=${accountId}`;
    if (options.returnUrl) {
      sessionStorage.setItem('returnUrl', options.returnUrl);
    }
    window.location.href = url;
  }

  /**
   * Navigate to engagement playbook
   * @param {string} engagementId
   * @param {object} options - {accountId, returnUrl, source}
   */
  goToEngagement(engagementId, options = {}) {
    this.addToHistory({
      type: 'engagement',
      id: engagementId,
      accountId: options.accountId,
      timestamp: new Date().toISOString(),
      source: options.source
    });

    const url = `EA_Engagement_Playbook.html?engagementId=${engagementId}`;
    if (options.accountId) {
      sessionStorage.setItem('contextAccountId', options.accountId);
    }
    if (options.returnUrl) {
      sessionStorage.setItem('returnUrl', options.returnUrl);
    }
    window.location.href = url;
  }

  /**
   * Navigate to opportunity pipeline
   * @param {string} opportunityId - Optional, if provided opens opportunity detail
   * @param {object} options - {accountId, returnUrl, source}
   */
  goToOpportunity(opportunityId = null, options = {}) {
    this.addToHistory({
      type: 'opportunity',
      id: opportunityId,
      accountId: options.accountId,
      timestamp: new Date().toISOString(),
      source: options.source
    });

    let url = 'EA_Opportunity_Pipeline.html';
    if (opportunityId) {
      url += `?opportunityId=${opportunityId}`;
    }
    if (options.accountId) {
      url += opportunityId ? '&' : '?';
      url += `accountId=${options.accountId}`;
    }
    
    if (options.returnUrl) {
      sessionStorage.setItem('returnUrl', options.returnUrl);
    }
    window.location.href = url;
  }

  /**
   * Navigate to value case builder
   * @param {string} valueCaseId
   * @param {object} options - {opportunityId, returnUrl, source}
   */
  goToValueCase(valueCaseId, options = {}) {
    this.addToHistory({
      type: 'valueCase',
      id: valueCaseId,
      opportunityId: options.opportunityId,
      timestamp: new Date().toISOString(),
      source: options.source
    });

    const url = `EA_ValueCase_Builder.html?valueCaseId=${valueCaseId}`;
    if (options.opportunityId) {
      sessionStorage.setItem('contextOpportunityId', options.opportunityId);
    }
    if (options.returnUrl) {
      sessionStorage.setItem('returnUrl', options.returnUrl);
    }
    window.location.href = url;
  }

  /**
   * Navigate to growth dashboard
   */
  goToGrowthDashboard() {
    this.addToHistory({
      type: 'dashboard',
      id: 'growth',
      timestamp: new Date().toISOString()
    });

    window.location.href = 'EA_Growth_Dashboard.html';
  }

  /**
   * Navigate to stakeholder influence matrix
   * @param {string} engagementId
   */
  goToStakeholderMatrix(engagementId) {
    this.addToHistory({
      type: 'stakeholderMatrix',
      engagementId,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem('currentEngagementId', engagementId);
    window.location.href = 'EA_Stakeholder_Influence_Matrix.html';
  }

  /**
   * Go back to previous page
   */
  goBack() {
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      window.location.href = returnUrl;
    } else {
      window.history.back();
    }
  }

  /**
   * Add to navigation history
   * @param {object} entry
   */
  addToHistory(entry) {
    this.navigationHistory.unshift(entry);
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.pop();
    }
    this.saveHistory();
  }

  /**
   * Get navigation history
   * @returns {Array}
   */
  getHistory() {
    return this.navigationHistory;
  }

  /**
   * Get recent items (last 10)
   * @returns {Array}
   */
  getRecentItems() {
    return this.navigationHistory.slice(0, 10);
  }

  /**
   * Save history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem('ea_navigation_history', JSON.stringify(this.navigationHistory));
    } catch (error) {
      console.warn('Failed to save navigation history:', error);
    }
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('ea_navigation_history');
      if (saved) {
        this.navigationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load navigation history:', error);
      this.navigationHistory = [];
    }
  }

  /**
   * Build breadcrumb trail
   * @param {object} context - {accountId, engagementId, opportunityId, entityType, entityId}
   * @returns {Array} - Array of breadcrumb objects {label, url, active}
   */
  async buildBreadcrumbs(context) {
    const breadcrumbs = [];

    // Always start with Growth Dashboard
    breadcrumbs.push({
      label: 'Growth Dashboard',
      url: 'EA_Growth_Dashboard.html',
      active: false,
      icon: '🏠'
    });

    // Add account if available
    if (context.accountId) {
      const accountManager = window.EA_AccountManager ? new window.EA_AccountManager() : null;
      if (accountManager) {
        const account = accountManager.getAccount(context.accountId);
        breadcrumbs.push({
          label: account?.name || context.accountId,
          url: `EA_Account_Dashboard.html?accountId=${context.accountId}`,
          active: !context.engagementId && !context.opportunityId,
          icon: '🏢'
        });
      }
    }

    // Add opportunity if available
    if (context.opportunityId) {
      const accountManager = window.EA_AccountManager ? new window.EA_AccountManager() : null;
      if (accountManager) {
        const opportunity = accountManager.getOpportunity(context.opportunityId);
        breadcrumbs.push({
          label: opportunity?.name || context.opportunityId,
          url: `EA_Opportunity_Pipeline.html?opportunityId=${context.opportunityId}`,
          active: !context.valueCaseId && !context.engagementId,
          icon: '🎯'
        });
      }
    }

    // Add engagement if available
    if (context.engagementId) {
      const engagementManager = window.engagementManager;
      if (engagementManager) {
        const engagement = engagementManager.getEngagement(context.engagementId);
        breadcrumbs.push({
          label: engagement?.name || context.engagementId,
          url: `EA_Engagement_Playbook.html?engagementId=${context.engagementId}`,
          active: !context.entityType,
          icon: '📋'
        });
      }
    }

    // Add entity type if available
    if (context.entityType) {
      breadcrumbs.push({
        label: this.formatEntityType(context.entityType),
        url: null,
        active: true,
        icon: this.getEntityIcon(context.entityType)
      });
    }

    return breadcrumbs;
  }

  /**
   * Render breadcrumbs HTML
   * @param {Array} breadcrumbs
   * @returns {string} HTML
   */
  renderBreadcrumbs(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) return '';

    const items = breadcrumbs.map((bc, index) => {
      const isLast = index === breadcrumbs.length - 1;
      const classes = ['breadcrumb-item'];
      if (bc.active) classes.push('active');

      if (bc.url && !bc.active) {
        return `<li class="${classes.join(' ')}">
          <a href="${bc.url}">${bc.icon} ${bc.label}</a>
        </li>`;
      } else {
        return `<li class="${classes.join(' ')}">${bc.icon} ${bc.label}</li>`;
      }
    }).join('<li class="breadcrumb-separator">›</li>');

    return `<nav aria-label="breadcrumb">
      <ol class="breadcrumb">${items}</ol>
    </nav>`;
  }

  /**
   * Format entity type for display
   * @param {string} entityType
   * @returns {string}
   */
  formatEntityType(entityType) {
    const mapping = {
      'stakeholder': 'Stakeholder',
      'application': 'Application',
      'capability': 'Capability',
      'initiative': 'Initiative',
      'risk': 'Risk',
      'decision': 'Decision',
      'constraint': 'Constraint',
      'assumption': 'Assumption',
      'roadmapItem': 'Roadmap Item',
      'architectureView': 'Architecture View',
      'artifact': 'Artifact'
    };
    return mapping[entityType] || entityType;
  }

  /**
   * Get icon for entity type
   * @param {string} entityType
   * @returns {string}
   */
  getEntityIcon(entityType) {
    const mapping = {
      'stakeholder': '👤',
      'application': '💻',
      'capability': '🎯',
      'initiative': '🚀',
      'risk': '⚠️',
      'decision': '✅',
      'constraint': '🚧',
      'assumption': '💭',
      'roadmapItem': '🗓️',
      'architectureView': '🏛️',
      'artifact': '📄'
    };
    return mapping[entityType] || '📌';
  }

  /**
   * Get entity preview data for tooltip
   * @param {string} entityType
   * @param {string} entityId
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async getEntityPreview(entityType, entityId, engagementId) {
    const engagementManager = window.engagementManager;
    if (!engagementManager) return null;

    let entity = null;

    switch (entityType) {
      case 'stakeholder':
        entity = engagementManager.getStakeholders(engagementId).find(s => s.id === entityId);
        return entity ? {
          title: entity.name,
          subtitle: entity.role,
          fields: [
            { label: 'Type', value: entity.type },
            { label: 'Level', value: entity.level },
            { label: 'Decision Power', value: entity.decisionPower },
            { label: 'Influence', value: entity.influence }
          ]
        } : null;

      case 'application':
        entity = engagementManager.getApplications(engagementId).find(a => a.id === entityId);
        return entity ? {
          title: entity.name,
          subtitle: entity.category,
          fields: [
            { label: 'Technology', value: entity.technology },
            { label: 'Business Value', value: entity.businessValue },
            { label: 'Technical Fit', value: entity.technicalFit },
            { label: 'Lifecycle', value: entity.lifecycleStage }
          ]
        } : null;

      case 'capability':
        entity = engagementManager.getCapabilities(engagementId).find(c => c.id === entityId);
        return entity ? {
          title: entity.name,
          subtitle: entity.category,
          fields: [
            { label: 'Current Maturity', value: `${entity.maturity}/5` },
            { label: 'Target Maturity', value: `${entity.targetMaturity}/5` },
            { label: 'Gap', value: entity.targetMaturity - entity.maturity },
            { label: 'Strategic Importance', value: entity.strategicImportance }
          ]
        } : null;

      case 'initiative':
        entity = engagementManager.getInitiatives(engagementId).find(i => i.id === entityId);
        return entity ? {
          title: entity.name,
          subtitle: entity.timeHorizon + '-term',
          fields: [
            { label: 'Status', value: entity.status },
            { label: 'Effort', value: entity.effort },
            { label: 'Cost', value: entity.estimatedCost ? `$${entity.estimatedCost.toLocaleString()}` : 'N/A' },
            { label: 'Value', value: entity.estimatedValue ? `$${entity.estimatedValue.toLocaleString()}` : 'N/A' }
          ]
        } : null;

      case 'risk':
        entity = engagementManager.getRisks(engagementId).find(r => r.id === entityId);
        return entity ? {
          title: entity.name,
          subtitle: entity.category,
          fields: [
            { label: 'Probability', value: entity.probability },
            { label: 'Impact', value: entity.impact },
            { label: 'Status', value: entity.status },
            { label: 'Owner', value: entity.owner }
          ]
        } : null;

      default:
        return null;
    }
  }

  /**
   * Render entity preview tooltip
   * @param {object} preview - From getEntityPreview()
   * @returns {string} HTML
   */
  renderEntityPreview(preview) {
    if (!preview) return '';

    const fieldsHtml = preview.fields.map(f => 
      `<div class="preview-field">
        <span class="preview-label">${f.label}:</span>
        <span class="preview-value">${f.value}</span>
      </div>`
    ).join('');

    return `
      <div class="entity-preview-tooltip">
        <div class="preview-title">${preview.title}</div>
        <div class="preview-subtitle">${preview.subtitle}</div>
        <div class="preview-fields">${fieldsHtml}</div>
      </div>
    `;
  }

  /**
   * Get linking suggestions for an entity
   * @param {string} entityType
   * @param {string} entityId
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async getLinkingSuggestions(entityType, entityId, engagementId) {
    const suggestions = {
      accounts: [],
      opportunities: [],
      engagements: [],
      initiatives: []
    };

    const accountManager = window.EA_AccountManager ? new window.EA_AccountManager() : null;
    const engagementManager = window.engagementManager;

    if (!accountManager || !engagementManager) return suggestions;

    // For initiatives, suggest linking to opportunities
    if (entityType === 'initiative') {
      const engagement = engagementManager.getEngagement(engagementId);
      if (engagement.accountId) {
        const opportunities = accountManager.listOpportunities(engagement.accountId);
        suggestions.opportunities = opportunities.map(opp => ({
          id: opp.id,
          name: opp.name,
          status: opp.status,
          estimatedValue: opp.estimatedValue
        }));
      }
    }

    // For engagements, suggest linking to accounts
    if (entityType === 'engagement') {
      const accounts = accountManager.listAccounts();
      suggestions.accounts = accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        ACV: acc.ACV,
        health: acc.health
      }));
    }

    return suggestions;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_CrossNavigation = EA_CrossNavigation;
  window.crossNav = new EA_CrossNavigation();
  window.crossNav.loadHistory();
}
