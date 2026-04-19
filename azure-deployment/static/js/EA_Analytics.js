/**
 * EA_Analytics.js
 * Analytics and reporting dashboards
 * Provides engagement metrics, account health scoring, pipeline analytics, and architecture coverage
 * 
 * @version 1.0
 * @phase Phase 5 - Integration & Polish
 */

class EA_Analytics {
  constructor() {
    this.accountManager = window.EA_AccountManager ? new window.EA_AccountManager() : null;
    this.engagementManager = window.engagementManager;
  }

  /**
   * Get engagement success metrics
   * @param {string} engagementId
   * @returns {object}
   */
  getEngagementMetrics(engagementId) {
    if (!this.engagementManager) return null;

    const engagement = this.engagementManager.getEngagement(engagementId);
    if (!engagement) return null;

    const workflowState = engagement.workflowState || {};
    const applications = this.engagementManager.getApplications(engagementId);
    const capabilities = this.engagementManager.getCapabilities(engagementId);
    const initiatives = this.engagementManager.getInitiatives(engagementId);
    const stakeholders = this.engagementManager.getStakeholders(engagementId);
    const risks = this.engagementManager.getRisks(engagementId);

    // Calculate completion percentage
    const completedSteps = workflowState.completedSteps?.length || 0;
    const totalSteps = 20; // E0-E5 has ~20 steps
    const completeness = Math.round((completedSteps / totalSteps) * 100);

    // Story velocity (entities created per week)
    const entitiesCreated = applications.length + capabilities.length + initiatives.length + stakeholders.length;
    const weeksSinceStart = this.getWeeksSince(engagement.startDate);
    const storyVelocity = weeksSinceStart > 0 ? Math.round(entitiesCreated / weeksSinceStart) : 0;

    // Phase progression
    const currentPhase = workflowState.currentPhase || 'E0';
    const phaseProgress = workflowState.phaseCompleteness?.[currentPhase] || 0;

    // Quality metrics
    const dataQuality = this.calculateDataQuality(engagement, {
      applications,
      capabilities,
      initiatives,
      stakeholders,
      risks
    });

    return {
      engagementId,
      engagementName: engagement.name,
      completeness,
      completedSteps,
      totalSteps,
      storyVelocity,
      currentPhase,
      phaseProgress,
      dataQuality,
      entityCounts: {
        applications: applications.length,
        capabilities: capabilities.length,
        initiatives: initiatives.length,
        stakeholders: stakeholders.length,
        risks: risks.length
      },
      timeMetrics: {
        weeksSinceStart,
        daysInCurrentPhase: this.getDaysSince(workflowState.phaseStartDate || engagement.startDate)
      }
    };
  }

  /**
   * Calculate data quality score
   * @param {object} engagement
   * @param {object} entities
   * @returns {number} 0-100
   */
  calculateDataQuality(engagement, entities) {
    let score = 0;
    let maxScore = 0;

    // Engagement fields (40 points)
    maxScore += 40;
    if (engagement.name) score += 5;
    if (engagement.customerName) score += 5;
    if (engagement.segment) score += 5;
    if (engagement.theme) score += 5;
    if (engagement.successCriteria?.length > 0) score += 10;
    if (engagement.governance?.decisionForum) score += 5;
    if (engagement.sprintCadence) score += 5;

    // Applications (20 points)
    maxScore += 20;
    if (entities.applications.length >= 5) score += 10;
    const appsWithRecommendations = entities.applications.filter(a => a.recommendation).length;
    score += Math.min(10, (appsWithRecommendations / Math.max(1, entities.applications.length)) * 10);

    // Capabilities (15 points)
    maxScore += 15;
    if (entities.capabilities.length >= 5) score += 8;
    const capsWithTargets = entities.capabilities.filter(c => c.targetMaturity).length;
    score += Math.min(7, (capsWithTargets / Math.max(1, entities.capabilities.length)) * 7);

    // Initiatives (15 points)
    maxScore += 15;
    if (entities.initiatives.length >= 3) score += 8;
    const initsWithCosts = entities.initiatives.filter(i => i.estimatedCost).length;
    score += Math.min(7, (initsWithCosts / Math.max(1, entities.initiatives.length)) * 7);

    // Stakeholders (10 points)
    maxScore += 10;
    if (entities.stakeholders.length >= 5) score += 10;

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Get account health scoring
   * @param {string} accountId
   * @returns {object}
   */
  getAccountHealthScore(accountId) {
    if (!this.accountManager) return null;

    const account = this.accountManager.getAccount(accountId);
    if (!account) return null;

    const opportunities = this.accountManager.listOpportunities(accountId);
    const engagements = account.engagements || [];

    let healthScore = 0;
    const factors = [];

    // Factor 1: Engagement activity (30 points)
    const activeEngagements = engagements.filter(e => {
      const eng = this.engagementManager?.getEngagement(e);
      return eng && eng.status === 'active';
    }).length;

    if (activeEngagements >= 3) {
      healthScore += 30;
      factors.push({ factor: 'High engagement activity', points: 30 });
    } else if (activeEngagements >= 1) {
      healthScore += 20;
      factors.push({ factor: 'Moderate engagement activity', points: 20 });
    } else {
      healthScore += 5;
      factors.push({ factor: 'Low engagement activity', points: 5 });
    }

    // Factor 2: Opportunity momentum (30 points)
    const activeOpportunities = opportunities.filter(o => 
      ['discovery', 'qualify', 'propose', 'negotiate'].includes(o.status)
    ).length;

    if (activeOpportunities >= 3) {
      healthScore += 30;
      factors.push({ factor: 'Strong opportunity pipeline', points: 30 });
    } else if (activeOpportunities >= 1) {
      healthScore += 20;
      factors.push({ factor: 'Active opportunities', points: 20 });
    } else {
      healthScore += 5;
      factors.push({ factor: 'Limited opportunities', points: 5 });
    }

    // Factor 3: Risk level (20 points)
    if (account.health === 'excellent') {
      healthScore += 20;
      factors.push({ factor: 'Excellent account health', points: 20 });
    } else if (account.health === 'good') {
      healthScore += 15;
      factors.push({ factor: 'Good account health', points: 15 });
    } else if (account.health === 'at-risk') {
      healthScore += 5;
      factors.push({ factor: 'Account at risk', points: 5 });
    } else {
      healthScore += 0;
      factors.push({ factor: 'Critical account health', points: 0 });
    }

    // Factor 4: ACV size (20 points)
    const acv = account.ACV || 0;
    if (acv >= 1000000) {
      healthScore += 20;
      factors.push({ factor: 'High ACV ($1M+)', points: 20 });
    } else if (acv >= 500000) {
      healthScore += 15;
      factors.push({ factor: 'Significant ACV ($500K+)', points: 15 });
    } else if (acv >= 100000) {
      healthScore += 10;
      factors.push({ factor: 'Moderate ACV ($100K+)', points: 10 });
    } else {
      healthScore += 5;
      factors.push({ factor: 'Low ACV', points: 5 });
    }

    // Determine overall health category
    let healthCategory = 'critical';
    if (healthScore >= 80) healthCategory = 'excellent';
    else if (healthScore >= 60) healthCategory = 'good';
    else if (healthScore >= 40) healthCategory = 'at-risk';

    return {
      accountId,
      accountName: account.name,
      healthScore,
      healthCategory,
      factors,
      metrics: {
        activeEngagements,
        activeOpportunities,
        totalOpportunities: opportunities.length,
        ACV: account.ACV
      }
    };
  }

  /**
   * Get pipeline analytics
   * @returns {object}
   */
  getPipelineAnalytics() {
    if (!this.accountManager) return null;

    const accounts = this.accountManager.listAccounts();
    const allOpportunities = [];

    accounts.forEach(account => {
      const opportunities = this.accountManager.listOpportunities(account.id);
      allOpportunities.push(...opportunities.map(o => ({ ...o, accountName: account.name })));
    });

    // Funnel conversion
    const funnel = {
      discovery: allOpportunities.filter(o => o.status === 'discovery').length,
      qualify: allOpportunities.filter(o => o.status === 'qualify').length,
      propose: allOpportunities.filter(o => o.status === 'propose').length,
      negotiate: allOpportunities.filter(o => o.status === 'negotiate').length,
      'close-won': allOpportunities.filter(o => o.status === 'close-won').length,
      'close-lost': allOpportunities.filter(o => o.status === 'close-lost').length
    };

    const totalClosed = funnel['close-won'] + funnel['close-lost'];
    const winRate = totalClosed > 0 ? Math.round((funnel['close-won'] / totalClosed) * 100) : 0;

    // Average deal size
    const closedWonOpps = allOpportunities.filter(o => o.status === 'close-won');
    const avgDealSize = closedWonOpps.length > 0
      ? Math.round(closedWonOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0) / closedWonOpps.length)
      : 0;

    // Sales cycle length (days from created to close)
    const salesCycleLengths = closedWonOpps
      .filter(o => o.metadata?.createdAt && o.closeDate)
      .map(o => {
        const created = new Date(o.metadata.createdAt);
        const closed = new Date(o.closeDate);
        return Math.round((closed - created) / (1000 * 60 * 60 * 24));
      });

    const avgSalesCycle = salesCycleLengths.length > 0
      ? Math.round(salesCycleLengths.reduce((sum, days) => sum + days, 0) / salesCycleLengths.length)
      : 0;

    // Total pipeline value
    const totalPipelineValue = allOpportunities
      .filter(o => !['close-won', 'close-lost'].includes(o.status))
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

    // Weighted pipeline value
    const weightedPipelineValue = allOpportunities
      .filter(o => !['close-won', 'close-lost'].includes(o.status))
      .reduce((sum, o) => sum + ((o.estimatedValue || 0) * (o.probability || 0) / 100), 0);

    return {
      totalOpportunities: allOpportunities.length,
      activeOpportunities: allOpportunities.filter(o => !['close-won', 'close-lost'].includes(o.status)).length,
      funnel,
      winRate,
      avgDealSize,
      avgSalesCycle,
      totalPipelineValue,
      weightedPipelineValue,
      conversionRates: {
        discoveryToQualify: funnel.discovery > 0 ? Math.round((funnel.qualify / funnel.discovery) * 100) : 0,
        qualifyToPropose: funnel.qualify > 0 ? Math.round((funnel.propose / funnel.qualify) * 100) : 0,
        proposeToNegotiate: funnel.propose > 0 ? Math.round((funnel.negotiate / funnel.propose) * 100) : 0,
        negotiateToClose: funnel.negotiate > 0 ? Math.round((funnel['close-won'] / funnel.negotiate) * 100) : 0
      }
    };
  }

  /**
   * Get architecture coverage metrics
   * @returns {object}
   */
  getArchitectureCoverage() {
    if (!this.accountManager || !this.engagementManager) return null;

    const accounts = this.accountManager.listAccounts();
    const allEngagements = this.engagementManager.getAllEngagements();

    let accountsWithEngagements = 0;
    let accountsWithASIS = 0;
    let accountsWithTarget = 0;
    let accountsWithRoadmap = 0;

    accounts.forEach(account => {
      const accountEngagements = allEngagements.filter(e => e.accountId === account.id);
      
      if (accountEngagements.length > 0) {
        accountsWithEngagements++;

        // Check for AS-IS (applications documented)
        const hasASIS = accountEngagements.some(e => {
          const apps = this.engagementManager.getApplications(e.id);
          return apps.length >= 3;
        });
        if (hasASIS) accountsWithASIS++;

        // Check for Target (capabilities with targets documented)
        const hasTarget = accountEngagements.some(e => {
          const caps = this.engagementManager.getCapabilities(e.id);
          return caps.some(c => c.targetMaturity);
        });
        if (hasTarget) accountsWithTarget++;

        // Check for Roadmap (initiatives documented)
        const hasRoadmap = accountEngagements.some(e => {
          const inits = this.engagementManager.getInitiatives(e.id);
          return inits.length >= 3;
        });
        if (hasRoadmap) accountsWithRoadmap++;
      }
    });

    const totalAccounts = accounts.length;

    return {
      totalAccounts,
      accountsWithEngagements,
      accountsWithASIS,
      accountsWithTarget,
      accountsWithRoadmap,
      coveragePercentages: {
        engagements: totalAccounts > 0 ? Math.round((accountsWithEngagements / totalAccounts) * 100) : 0,
        asIs: totalAccounts > 0 ? Math.round((accountsWithASIS / totalAccounts) * 100) : 0,
        target: totalAccounts > 0 ? Math.round((accountsWithTarget / totalAccounts) * 100) : 0,
        roadmap: totalAccounts > 0 ? Math.round((accountsWithRoadmap / totalAccounts) * 100) : 0
      }
    };
  }

  /**
   * Get comprehensive analytics dashboard data
   * @returns {object}
   */
  getDashboardData() {
    return {
      pipelineAnalytics: this.getPipelineAnalytics(),
      architectureCoverage: this.getArchitectureCoverage(),
      topAccounts: this.getTopAccounts(10),
      recentActivity: this.getRecentActivity(20),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get top accounts by health score
   * @param {number} limit
   * @returns {Array}
   */
  getTopAccounts(limit = 10) {
    if (!this.accountManager) return [];

    const accounts = this.accountManager.listAccounts();
    const accountsWithScores = accounts.map(account => {
      const healthScore = this.getAccountHealthScore(account.id);
      return {
        ...account,
        healthScore: healthScore?.healthScore || 0,
        healthCategory: healthScore?.healthCategory || 'unknown'
      };
    });

    accountsWithScores.sort((a, b) => b.healthScore - a.healthScore);
    return accountsWithScores.slice(0, limit);
  }

  /**
   * Get recent activity across all entities
   * @param {number} limit
   * @returns {Array}
   */
  getRecentActivity(limit = 20) {
    const activities = [];

    // Accounts
    if (this.accountManager) {
      const accounts = this.accountManager.listAccounts();
      accounts.forEach(account => {
        if (account.metadata?.createdAt) {
          activities.push({
            type: 'account',
            action: 'created',
            entityId: account.id,
            entityName: account.name,
            timestamp: account.metadata.createdAt
          });
        }
      });

      // Opportunities
      accounts.forEach(account => {
        const opportunities = this.accountManager.listOpportunities(account.id);
        opportunities.forEach(opp => {
          if (opp.metadata?.createdAt) {
            activities.push({
              type: 'opportunity',
              action: 'created',
              entityId: opp.id,
              entityName: opp.name,
              accountName: account.name,
              timestamp: opp.metadata.createdAt
            });
          }
        });
      });
    }

    // Engagements
    if (this.engagementManager) {
      const engagements = this.engagementManager.getAllEngagements();
      engagements.forEach(engagement => {
        if (engagement.metadata?.createdAt) {
          activities.push({
            type: 'engagement',
            action: 'created',
            entityId: engagement.id,
            entityName: engagement.name,
            timestamp: engagement.metadata.createdAt
          });
        }
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, limit);
  }

  /**
   * Export analytics to XLSX
   * @param {string} reportType - 'dashboard', 'pipeline', 'accounts', 'engagements'
   * @returns {Promise<Blob>}
   */
  async exportToXLSX(reportType = 'dashboard') {
    // Check if XLSX library is loaded
    if (!window.XLSX) {
      // Load XLSX library
      await this.loadXLSX();
    }

    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();

    if (reportType === 'dashboard' || reportType === 'pipeline') {
      // Pipeline Analytics Sheet
      const pipelineData = this.getPipelineAnalytics();
      if (pipelineData) {
        const pipelineSheet = [
          ['Pipeline Analytics', ''],
          [''],
          ['Metric', 'Value'],
          ['Total Opportunities', pipelineData.totalOpportunities],
          ['Active Opportunities', pipelineData.activeOpportunities],
          ['Win Rate', `${pipelineData.winRate}%`],
          ['Avg Deal Size', `$${pipelineData.avgDealSize.toLocaleString()}`],
          ['Avg Sales Cycle', `${pipelineData.avgSalesCycle} days`],
          ['Total Pipeline Value', `$${pipelineData.totalPipelineValue.toLocaleString()}`],
          ['Weighted Pipeline Value', `$${pipelineData.weightedPipelineValue.toLocaleString()}`],
          [''],
          ['Funnel Stage', 'Count'],
          ['Discovery', pipelineData.funnel.discovery],
          ['Qualify', pipelineData.funnel.qualify],
          ['Propose', pipelineData.funnel.propose],
          ['Negotiate', pipelineData.funnel.negotiate],
          ['Close-Won', pipelineData.funnel['close-won']],
          ['Close-Lost', pipelineData.funnel['close-lost']]
        ];
        const ws = XLSX.utils.aoa_to_sheet(pipelineSheet);
        XLSX.utils.book_append_sheet(wb, ws, 'Pipeline');
      }
    }

    if (reportType === 'dashboard' || reportType === 'accounts') {
      // Top Accounts Sheet
      const topAccounts = this.getTopAccounts(20);
      if (topAccounts.length > 0) {
        const accountsData = [
          ['Account Name', 'Health Score', 'Health Category', 'ACV', 'Industry', 'Region'],
          ...topAccounts.map(acc => [
            acc.name,
            acc.healthScore,
            acc.healthCategory,
            acc.ACV || 0,
            acc.industry || '',
            acc.region || ''
          ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(accountsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Top Accounts');
      }
    }

    if (reportType === 'dashboard') {
      // Architecture Coverage Sheet
      const coverage = this.getArchitectureCoverage();
      if (coverage) {
        const coverageData = [
          ['Architecture Coverage', ''],
          [''],
          ['Metric', 'Count', 'Percentage'],
          ['Total Accounts', coverage.totalAccounts, '100%'],
          ['Accounts with Engagements', coverage.accountsWithEngagements, `${coverage.coveragePercentages.engagements}%`],
          ['Accounts with AS-IS', coverage.accountsWithASIS, `${coverage.coveragePercentages.asIs}%`],
          ['Accounts with Target', coverage.accountsWithTarget, `${coverage.coveragePercentages.target}%`],
          ['Accounts with Roadmap', coverage.accountsWithRoadmap, `${coverage.coveragePercentages.roadmap}%`]
        ];
        const ws = XLSX.utils.aoa_to_sheet(coverageData);
        XLSX.utils.book_append_sheet(wb, ws, 'Architecture Coverage');
      }
    }

    // Generate blob
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.document' });
  }

  /**
   * Load XLSX library
   * @returns {Promise<void>}
   */
  async loadXLSX() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load XLSX library'));
      document.head.appendChild(script);
    });
  }

  /**
   * Helper: Get weeks since date
   * @param {string} dateString
   * @returns {number}
   */
  getWeeksSince(dateString) {
    if (!dateString) return 0;
    const startDate = new Date(dateString);
    const now = new Date();
    const diff = now - startDate;
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)));
  }

  /**
   * Helper: Get days since date
   * @param {string} dateString
   * @returns {number}
   */
  getDaysSince(dateString) {
    if (!dateString) return 0;
    const startDate = new Date(dateString);
    const now = new Date();
    const diff = now - startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_Analytics = EA_Analytics;
  window.analytics = new EA_Analytics();
}
