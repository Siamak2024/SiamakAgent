/**
 * EA_AccountManager.js
 * 
 * Account-centric commercial execution platform manager
 * Manages Account, Opportunity, and ValueCase entities for sales/account teams
 * 
 * Features:
 * - Account CRUD (Commercial account tracking)
 * - Opportunity CRUD (Sales pipeline management)
 * - ValueCase CRUD (Business case & value justification)
 * - Cross-entity linking (Account → Opportunities → Engagements → Initiatives)
 * - Account-level aggregation (stakeholders, applications, capabilities)
 * - Commercial metrics (ACV, pipeline value, win rate, ROI)
 * - localStorage persistence (ea_account_*, ea_opportunity_*, ea_valuecase_*)
 * 
 * @version 1.0.0
 * @author EA Platform Team
 * @date 2026-04-19
 */

class EA_AccountManager {
  constructor() {
    this.storagePrefix = 'ea_account_';
    this.opportunityPrefix = 'ea_opportunity_';
    this.valueCasePrefix = 'ea_valuecase_';
    this.engagementPrefix = 'ea_engagement_model_';
    
    console.log('EA_AccountManager initialized');
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACCOUNT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Create a new account
   * @param {Object} accountData - Account properties
   * @returns {Object} Created account
   */
  createAccount(accountData) {
    const account = {
      id: accountData.id || this.generateAccountId(),
      name: accountData.name,
      accountManager: accountData.accountManager,
      ACV: accountData.ACV || 0,
      industry: accountData.industry,
      region: accountData.region,
      size: accountData.size || 'MidMarket',
      health: accountData.health || 'good',
      strategicPriorities: accountData.strategicPriorities || [],
      businessStrategy: accountData.businessStrategy || '',
      painPoints: accountData.painPoints || [],
      engagements: accountData.engagements || [],
      opportunities: accountData.opportunities || [],
      stakeholders: accountData.stakeholders || [],
      applications: accountData.applications || [],
      capabilities: accountData.capabilities || [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: accountData.createdBy || 'system',
        lastContactDate: accountData.lastContactDate || null
      }
    };

    localStorage.setItem(this.storagePrefix + account.id, JSON.stringify(account));
    console.log('Account created:', account.id);
    return account;
  }

  /**
   * Get account by ID
   * @param {string} accountId - Account ID (e.g., ACC-001)
   * @returns {Object|null} Account object or null
   */
  getAccount(accountId) {
    const data = localStorage.getItem(this.storagePrefix + accountId);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Update account
   * @param {string} accountId - Account ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated account
   */
  updateAccount(accountId, updates) {
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    Object.assign(account, updates);
    account.metadata.updatedAt = new Date().toISOString();

    localStorage.setItem(this.storagePrefix + accountId, JSON.stringify(account));
    console.log('Account updated:', accountId);
    return account;
  }

  /**
   * Delete account
   * @param {string} accountId - Account ID
   */
  deleteAccount(accountId) {
    localStorage.removeItem(this.storagePrefix + accountId);
    console.log('Account deleted:', accountId);
  }

  /**
   * List all accounts
   * @returns {Array} Array of account objects
   */
  listAccounts() {
    const accounts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.storagePrefix)) {
        const account = JSON.parse(localStorage.getItem(key));
        accounts.push(account);
      }
    }
    return accounts.sort((a, b) => b.ACV - a.ACV); // Sort by ACV descending
  }

  /**
   * Generate unique account ID
   * @returns {string} Account ID (ACC-001, ACC-002, etc.)
   */
  generateAccountId() {
    const accounts = this.listAccounts();
    const maxId = accounts.reduce((max, acc) => {
      const num = parseInt(acc.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `ACC-${String(maxId + 1).padStart(3, '0')}`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // OPPORTUNITY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Create a new opportunity
   * @param {Object} opportunityData - Opportunity properties
   * @returns {Object} Created opportunity
   */
  createOpportunity(opportunityData) {
    const opportunity = {
      id: opportunityData.id || this.generateOpportunityId(),
      accountId: opportunityData.accountId,
      name: opportunityData.name,
      status: opportunityData.status || 'discovery',
      stage: opportunityData.stage || '1-discovery',
      estimatedValue: opportunityData.estimatedValue || 0,
      probability: opportunityData.probability || 50,
      closeDate: opportunityData.closeDate,
      sponsor: opportunityData.sponsor,
      linkedInitiatives: opportunityData.linkedInitiatives || [],
      linkedEngagements: opportunityData.linkedEngagements || [],
      valueCase: opportunityData.valueCase || null,
      competitors: opportunityData.competitors || [],
      nextSteps: opportunityData.nextSteps || [],
      risks: opportunityData.risks || [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: opportunityData.createdBy || 'system',
        winReason: null,
        lossReason: null
      }
    };

    localStorage.setItem(this.opportunityPrefix + opportunity.id, JSON.stringify(opportunity));

    // Link to account
    if (opportunity.accountId) {
      this.linkOpportunityToAccount(opportunity.id, opportunity.accountId);
    }

    console.log('Opportunity created:', opportunity.id);
    return opportunity;
  }

  /**
   * Get opportunity by ID
   * @param {string} opportunityId - Opportunity ID (e.g., OPP-001)
   * @returns {Object|null} Opportunity object or null
   */
  getOpportunity(opportunityId) {
    const data = localStorage.getItem(this.opportunityPrefix + opportunityId);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Update opportunity
   * @param {string} opportunityId - Opportunity ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated opportunity
   */
  updateOpportunity(opportunityId, updates) {
    const opportunity = this.getOpportunity(opportunityId);
    if (!opportunity) {
      throw new Error(`Opportunity ${opportunityId} not found`);
    }

    Object.assign(opportunity, updates);
    opportunity.metadata.updatedAt = new Date().toISOString();

    localStorage.setItem(this.opportunityPrefix + opportunityId, JSON.stringify(opportunity));
    console.log('Opportunity updated:', opportunityId);
    return opportunity;
  }

  /**
   * Delete opportunity
   * @param {string} opportunityId - Opportunity ID
   */
  deleteOpportunity(opportunityId) {
    const opportunity = this.getOpportunity(opportunityId);
    if (opportunity && opportunity.accountId) {
      this.unlinkOpportunityFromAccount(opportunityId, opportunity.accountId);
    }
    localStorage.removeItem(this.opportunityPrefix + opportunityId);
    console.log('Opportunity deleted:', opportunityId);
  }

  /**
   * List all opportunities
   * @param {string} accountId - Optional: filter by account ID
   * @returns {Array} Array of opportunity objects
   */
  listOpportunities(accountId = null) {
    const opportunities = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.opportunityPrefix)) {
        const opportunity = JSON.parse(localStorage.getItem(key));
        if (!accountId || opportunity.accountId === accountId) {
          opportunities.push(opportunity);
        }
      }
    }
    return opportunities.sort((a, b) => new Date(b.closeDate) - new Date(a.closeDate));
  }

  /**
   * Generate unique opportunity ID
   * @returns {string} Opportunity ID (OPP-001, OPP-002, etc.)
   */
  generateOpportunityId() {
    const opportunities = this.listOpportunities();
    const maxId = opportunities.reduce((max, opp) => {
      const num = parseInt(opp.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `OPP-${String(maxId + 1).padStart(3, '0')}`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // VALUE CASE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Create a new value case
   * @param {Object} valueCaseData - ValueCase properties
   * @returns {Object} Created value case
   */
  createValueCase(valueCaseData) {
    const valueCase = {
      id: valueCaseData.id || this.generateValueCaseId(),
      opportunityId: valueCaseData.opportunityId,
      name: valueCaseData.name,
      narratives: {
        executive: valueCaseData.narratives?.executive || '',
        technical: valueCaseData.narratives?.technical || '',
        financial: valueCaseData.narratives?.financial || ''
      },
      totalValue: valueCaseData.totalValue || 0,
      totalInvestment: valueCaseData.totalInvestment || 0,
      ROI: this.calculateROI(valueCaseData.totalValue, valueCaseData.totalInvestment),
      paybackMonths: valueCaseData.paybackMonths || 0,
      NPV: valueCaseData.NPV || 0,
      IRR: valueCaseData.IRR || 0,
      valueDrivers: valueCaseData.valueDrivers || [],
      risks: valueCaseData.risks || [],
      assumptions: valueCaseData.assumptions || [],
      stakeholderViews: valueCaseData.stakeholderViews || {},
      generatedBy: valueCaseData.generatedBy || 'manual',
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: valueCaseData.createdBy || 'system',
        approvedBy: null,
        approvalDate: null
      }
    };

    localStorage.setItem(this.valueCasePrefix + valueCase.id, JSON.stringify(valueCase));

    // Link to opportunity
    if (valueCase.opportunityId) {
      this.linkValueCaseToOpportunity(valueCase.id, valueCase.opportunityId);
    }

    console.log('ValueCase created:', valueCase.id);
    return valueCase;
  }

  /**
   * Get value case by ID
   * @param {string} valueCaseId - ValueCase ID (e.g., VC-001)
   * @returns {Object|null} ValueCase object or null
   */
  getValueCase(valueCaseId) {
    const data = localStorage.getItem(this.valueCasePrefix + valueCaseId);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Update value case
   * @param {string} valueCaseId - ValueCase ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated value case
   */
  updateValueCase(valueCaseId, updates) {
    const valueCase = this.getValueCase(valueCaseId);
    if (!valueCase) {
      throw new Error(`ValueCase ${valueCaseId} not found`);
    }

    Object.assign(valueCase, updates);
    
    // Recalculate ROI if value/investment changed
    if (updates.totalValue !== undefined || updates.totalInvestment !== undefined) {
      valueCase.ROI = this.calculateROI(valueCase.totalValue, valueCase.totalInvestment);
    }

    valueCase.metadata.updatedAt = new Date().toISOString();

    localStorage.setItem(this.valueCasePrefix + valueCaseId, JSON.stringify(valueCase));
    console.log('ValueCase updated:', valueCaseId);
    return valueCase;
  }

  /**
   * Delete value case
   * @param {string} valueCaseId - ValueCase ID
   */
  deleteValueCase(valueCaseId) {
    const valueCase = this.getValueCase(valueCaseId);
    if (valueCase && valueCase.opportunityId) {
      this.unlinkValueCaseFromOpportunity(valueCaseId, valueCase.opportunityId);
    }
    localStorage.removeItem(this.valueCasePrefix + valueCaseId);
    console.log('ValueCase deleted:', valueCaseId);
  }

  /**
   * List all value cases
   * @param {string} opportunityId - Optional: filter by opportunity ID
   * @returns {Array} Array of value case objects
   */
  listValueCases(opportunityId = null) {
    const valueCases = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.valueCasePrefix)) {
        const valueCase = JSON.parse(localStorage.getItem(key));
        if (!opportunityId || valueCase.opportunityId === opportunityId) {
          valueCases.push(valueCase);
        }
      }
    }
    return valueCases.sort((a, b) => b.ROI - a.ROI); // Sort by ROI descending
  }

  /**
   * Generate unique value case ID
   * @returns {string} ValueCase ID (VC-001, VC-002, etc.)
   */
  generateValueCaseId() {
    const valueCases = this.listValueCases();
    const maxId = valueCases.reduce((max, vc) => {
      const num = parseInt(vc.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `VC-${String(maxId + 1).padStart(3, '0')}`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CROSS-ENTITY LINKING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Link opportunity to account
   * @param {string} opportunityId - Opportunity ID
   * @param {string} accountId - Account ID
   */
  linkOpportunityToAccount(opportunityId, accountId) {
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    if (!account.opportunities.includes(opportunityId)) {
      account.opportunities.push(opportunityId);
      this.updateAccount(accountId, { opportunities: account.opportunities });
    }
  }

  /**
   * Unlink opportunity from account
   * @param {string} opportunityId - Opportunity ID
   * @param {string} accountId - Account ID
   */
  unlinkOpportunityFromAccount(opportunityId, accountId) {
    const account = this.getAccount(accountId);
    if (account) {
      account.opportunities = account.opportunities.filter(id => id !== opportunityId);
      this.updateAccount(accountId, { opportunities: account.opportunities });
    }
  }

  /**
   * Link value case to opportunity
   * @param {string} valueCaseId - ValueCase ID
   * @param {string} opportunityId - Opportunity ID
   */
  linkValueCaseToOpportunity(valueCaseId, opportunityId) {
    const opportunity = this.getOpportunity(opportunityId);
    if (!opportunity) {
      throw new Error(`Opportunity ${opportunityId} not found`);
    }

    opportunity.valueCase = valueCaseId;
    this.updateOpportunity(opportunityId, { valueCase: valueCaseId });
  }

  /**
   * Unlink value case from opportunity
   * @param {string} valueCaseId - ValueCase ID
   * @param {string} opportunityId - Opportunity ID
   */
  unlinkValueCaseFromOpportunity(valueCaseId, opportunityId) {
    const opportunity = this.getOpportunity(opportunityId);
    if (opportunity && opportunity.valueCase === valueCaseId) {
      opportunity.valueCase = null;
      this.updateOpportunity(opportunityId, { valueCase: null });
    }
  }

  /**
   * Link engagement to account
   * @param {string} engagementId - Engagement ID
   * @param {string} accountId - Account ID
   */
  linkEngagementToAccount(engagementId, accountId) {
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    if (!account.engagements.includes(engagementId)) {
      account.engagements.push(engagementId);
      this.updateAccount(accountId, { engagements: account.engagements });
    }

    // Also update engagement with accountId
    const engagementData = localStorage.getItem(this.engagementPrefix + engagementId);
    if (engagementData) {
      const engagement = JSON.parse(engagementData);
      engagement.accountId = accountId;
      localStorage.setItem(this.engagementPrefix + engagementId, JSON.stringify(engagement));
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACCOUNT AGGREGATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Aggregate account-level data from linked engagements
   * @param {string} accountId - Account ID
   * @returns {Object} Aggregated data
   */
  aggregateAccountData(accountId) {
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const stakeholders = new Set();
    const applications = new Set();
    const capabilities = new Set();

    // Aggregate from all linked engagements
    account.engagements.forEach(engagementId => {
      const engagementData = localStorage.getItem(this.engagementPrefix + engagementId);
      if (engagementData) {
        const engagement = JSON.parse(engagementData);
        
        // Aggregate stakeholders
        if (engagement.stakeholders) {
          engagement.stakeholders.forEach(id => stakeholders.add(id));
        }
        
        // Aggregate applications
        if (engagement.applications) {
          engagement.applications.forEach(id => applications.add(id));
        }
        
        // Aggregate capabilities
        if (engagement.capabilities) {
          engagement.capabilities.forEach(id => capabilities.add(id));
        }
      }
    });

    // Update account with aggregated data
    this.updateAccount(accountId, {
      stakeholders: Array.from(stakeholders),
      applications: Array.from(applications),
      capabilities: Array.from(capabilities)
    });

    return {
      stakeholders: Array.from(stakeholders),
      applications: Array.from(applications),
      capabilities: Array.from(capabilities)
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMMERCIAL METRICS & CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Calculate ROI percentage
   * @param {number} totalValue - Total business value
   * @param {number} totalInvestment - Total investment
   * @returns {number} ROI percentage
   */
  calculateROI(totalValue, totalInvestment) {
    if (totalInvestment === 0) return 0;
    return ((totalValue - totalInvestment) / totalInvestment) * 100;
  }

  /**
   * Calculate account pipeline value (weighted)
   * @param {string} accountId - Account ID
   * @returns {number} Total weighted pipeline value
   */
  calculateAccountPipelineValue(accountId) {
    const opportunities = this.listOpportunities(accountId);
    return opportunities.reduce((total, opp) => {
      return total + (opp.estimatedValue * (opp.probability / 100));
    }, 0);
  }

  /**
   * Get account health metrics
   * @param {string} accountId - Account ID
   * @returns {Object} Health metrics
   */
  getAccountHealthMetrics(accountId) {
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const opportunities = this.listOpportunities(accountId);
    const openOpps = opportunities.filter(o => !['close-won', 'close-lost'].includes(o.status));
    const wonOpps = opportunities.filter(o => o.status === 'close-won');
    const lostOpps = opportunities.filter(o => o.status === 'close-lost');

    const totalValue = opportunities.reduce((sum, o) => sum + o.estimatedValue, 0);
    const weightedValue = this.calculateAccountPipelineValue(accountId);
    const winRate = (wonOpps.length + lostOpps.length) > 0 
      ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100 
      : 0;

    return {
      ACV: account.ACV,
      totalOpportunities: opportunities.length,
      openOpportunities: openOpps.length,
      wonOpportunities: wonOpps.length,
      lostOpportunities: lostOpps.length,
      totalPipelineValue: totalValue,
      weightedPipelineValue: weightedValue,
      winRate: winRate.toFixed(1),
      health: account.health,
      engagementCount: account.engagements.length,
      stakeholderCount: account.stakeholders.length,
      applicationCount: account.applications.length,
      capabilityCount: account.capabilities.length
    };
  }

  /**
   * Get opportunity forecast
   * @param {string} accountId - Optional: filter by account
   * @returns {Object} Forecast by quarter
   */
  getOpportunityForecast(accountId = null) {
    const opportunities = this.listOpportunities(accountId);
    const forecast = {};

    opportunities.forEach(opp => {
      if (['close-won', 'close-lost'].includes(opp.status)) return;

      const closeDate = new Date(opp.closeDate);
      const quarter = `${closeDate.getFullYear()}Q${Math.ceil((closeDate.getMonth() + 1) / 3)}`;
      
      if (!forecast[quarter]) {
        forecast[quarter] = {
          count: 0,
          totalValue: 0,
          weightedValue: 0
        };
      }

      forecast[quarter].count++;
      forecast[quarter].totalValue += opp.estimatedValue;
      forecast[quarter].weightedValue += (opp.estimatedValue * (opp.probability / 100));
    });

    return forecast;
  }

  /**
   * Get top accounts by ACV
   * @param {number} limit - Number of accounts to return
   * @returns {Array} Top accounts
   */
  getTopAccounts(limit = 10) {
    return this.listAccounts()
      .slice(0, limit)
      .map(account => ({
        id: account.id,
        name: account.name,
        ACV: account.ACV,
        health: account.health,
        pipelineValue: this.calculateAccountPipelineValue(account.id),
        opportunityCount: account.opportunities.length
      }));
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Search accounts by name or industry
   * @param {string} query - Search query
   * @returns {Array} Matching accounts
   */
  searchAccounts(query) {
    const lowerQuery = query.toLowerCase();
    return this.listAccounts().filter(account => 
      account.name.toLowerCase().includes(lowerQuery) ||
      account.industry.toLowerCase().includes(lowerQuery) ||
      account.accountManager.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get account summary (for dashboards)
   * @param {string} accountId - Account ID
   * @returns {Object} Account summary
   */
  getAccountSummary(accountId) {
    const account = this.getAccount(accountId);
    if (!account) return null;

    const health = this.getAccountHealthMetrics(accountId);
    const opportunities = this.listOpportunities(accountId);
    const recentOpps = opportunities.slice(0, 5);

    return {
      account,
      health,
      recentOpportunities: recentOpps,
      forecastThisQuarter: this.getOpportunityForecast(accountId)[this.getCurrentQuarter()] || { count: 0, totalValue: 0, weightedValue: 0 }
    };
  }

  /**
   * Get current quarter string (e.g., "2026Q2")
   * @returns {string} Current quarter
   */
  getCurrentQuarter() {
    const now = new Date();
    return `${now.getFullYear()}Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  }

  /**
   * Export account data (for reporting)
   * @param {string} accountId - Account ID
   * @returns {Object} Complete account data export
   */
  exportAccountData(accountId) {
    const account = this.getAccount(accountId);
    if (!account) return null;

    const opportunities = this.listOpportunities(accountId);
    const valueCases = opportunities
      .filter(o => o.valueCase)
      .map(o => this.getValueCase(o.valueCase))
      .filter(vc => vc !== null);

    return {
      account,
      opportunities,
      valueCases,
      health: this.getAccountHealthMetrics(accountId),
      aggregatedData: this.aggregateAccountData(accountId),
      exportedAt: new Date().toISOString()
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.EA_AccountManager = EA_AccountManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_AccountManager;
}
