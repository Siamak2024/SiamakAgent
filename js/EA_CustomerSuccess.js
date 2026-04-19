/**
 * EA_CustomerSuccess.js
 * Customer Success Plan (CSP) Management for Growth Accounts
 * 
 * Tracks:
 * - Customer Success Plans (goals, metrics, initiatives)
 * - Executive Business Reviews (EBRs)
 * - Quarterly Business Reviews (QBRs)
 * - Health Metrics and Success Criteria
 * - Adoption Tracking
 * - Value Realization
 * 
 * @version 1.0
 * @date 2026-04-19
 */

class EA_CustomerSuccess {
  constructor() {
    this.storagePrefix = 'ea_csp_';
  }

  /**
   * Create or update Customer Success Plan
   * @param {string} accountId - Associated account ID
   * @param {object} cspData - CSP details
   * @returns {object} - Saved CSP
   */
  createOrUpdateCSP(accountId, cspData) {
    const csp = {
      id: cspData.id || this.generateId('CSP'),
      accountId: accountId,
      
      // Plan Overview
      planName: cspData.planName || 'Customer Success Plan',
      planPeriod: cspData.planPeriod || 'Q1 2026 - Q4 2026',
      owner: cspData.owner || '', // Customer Success Manager
      executiveSponsor: cspData.executiveSponsor || '', // Internal exec
      customerSponsor: cspData.customerSponsor || '', // Customer exec
      
      // Success Goals
      goals: cspData.goals || [
        // { id, goal, category, targetDate, status, progress, owner }
      ],
      
      // Key Metrics & KPIs
      metrics: cspData.metrics || [
        // { id, metric, baseline, target, current, unit, trend, lastUpdated }
      ],
      
      // Strategic Initiatives (aligned with EA initiatives)
      initiatives: cspData.initiatives || [
        // { id, initiative, description, status, dueDate, owner, linkedEAInitiative }
      ],
      
      // Executive Business Reviews (EBRs)
      ebrs: cspData.ebrs || [
        // { id, date, attendees, topics, outcomes, actionItems, nextDate }
      ],
      
      // Quarterly Business Reviews (QBRs)
      qbrs: cspData.qbrs || [
        // { id, quarter, date, attendees, healthScore, achievements, challenges, priorities }
      ],
      
      // Adoption Tracking
      adoption: cspData.adoption || {
        productUsage: [], // { product, activeUsers, targetUsers, adoptionRate, trend }
        featureAdoption: [], // { feature, users, completedTraining, proficiencyLevel }
        trainingCompleted: 0, // % of users trained
        certifications: 0 // Number of certified users
      },
      
      // Value Realization
      valueRealization: cspData.valueRealization || {
        expectedValue: 0, // From original business case
        realizedValue: 0, // Actual value delivered to date
        realizationRate: 0, // % of expected value realized
        valueDrivers: [
          // { driver, expectedImpact, realizedImpact, status, evidence }
        ]
      },
      
      // Health Indicators
      health: cspData.health || {
        overallScore: 70, // 0-100
        dimensions: {
          adoption: { score: 0, trend: 'stable', notes: '' },
          satisfaction: { score: 0, trend: 'stable', notes: '' },
          value: { score: 0, trend: 'stable', notes: '' },
          engagement: { score: 0, trend: 'stable', notes: '' },
          renewal: { score: 0, trend: 'stable', notes: '' }
        },
        risks: [
          // { id, risk, severity, impact, mitigation, owner, status }
        ],
        opportunities: [
          // { id, opportunity, value, effort, priority, owner }
        ]
      },
      
      // Stakeholder Engagement
      stakeholders: cspData.stakeholders || [
        // { id, name, role, sentimentScore, lastContact, nextContact, notes }
      ],
      
      // Success Milestones
      milestones: cspData.milestones || [
        // { id, milestone, targetDate, completedDate, status, celebration }
      ],
      
      // Metadata
      metadata: {
        createdAt: cspData.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: cspData.metadata?.createdBy || 'System',
        lastReviewDate: cspData.lastReviewDate || null,
        nextReviewDate: cspData.nextReviewDate || null,
        version: cspData.metadata?.version || 1
      }
    };

    // Save to localStorage
    localStorage.setItem(`${this.storagePrefix}${csp.id}`, JSON.stringify(csp));
    
    // Update account reference
    this.updateAccountCSPReference(accountId, csp.id);
    
    console.log(`✅ CSP saved: ${csp.id} for account ${accountId}`);
    return csp;
  }

  /**
   * Get Customer Success Plan by ID
   * @param {string} cspId
   * @returns {object|null}
   */
  getCSP(cspId) {
    const data = localStorage.getItem(`${this.storagePrefix}${cspId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get Customer Success Plan by Account ID
   * @param {string} accountId
   * @returns {object|null}
   */
  getCSPByAccount(accountId) {
    // Search through all CSPs to find one with matching accountId
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        try {
          const csp = JSON.parse(localStorage.getItem(key));
          if (csp.accountId === accountId) {
            return csp;
          }
        } catch (e) {
          console.error(`Error parsing CSP from ${key}:`, e);
        }
      }
    }
    return null;
  }

  /**
   * Add Success Goal
   * @param {string} cspId
   * @param {object} goalData
   * @returns {object}
   */
  addGoal(cspId, goalData) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    const goal = {
      id: this.generateId('GOAL'),
      goal: goalData.goal,
      category: goalData.category || 'business', // business, technical, adoption, value
      targetDate: goalData.targetDate,
      status: goalData.status || 'in-progress', // not-started, in-progress, at-risk, completed
      progress: goalData.progress || 0, // 0-100
      owner: goalData.owner || '',
      description: goalData.description || '',
      successCriteria: goalData.successCriteria || [],
      dependencies: goalData.dependencies || []
    };

    csp.goals.push(goal);
    const updatedCSP = this.createOrUpdateCSP(csp.accountId, csp);
    return updatedCSP;
  }

  /**
   * Add or update Metric/KPI
   * @param {string} cspId
   * @param {object} metricData
   * @returns {object}
   */
  addMetric(cspId, metricData) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    const metric = {
      id: metricData.id || this.generateId('KPI'),
      metric: metricData.metric,
      baseline: metricData.baseline || 0,
      target: metricData.target,
      current: metricData.current || metricData.baseline || 0,
      unit: metricData.unit || '',
      trend: metricData.trend || 'stable', // improving, stable, declining
      category: metricData.category || 'business', // business, technical, adoption
      frequency: metricData.frequency || 'monthly', // weekly, monthly, quarterly
      lastUpdated: new Date().toISOString()
    };

    const existingIndex = csp.metrics.findIndex(m => m.id === metric.id);
    if (existingIndex >= 0) {
      csp.metrics[existingIndex] = metric;
    } else {
      csp.metrics.push(metric);
    }

    const updatedCSP = this.createOrUpdateCSP(csp.accountId, csp);
    return updatedCSP;
  }

  /**
   * Schedule Executive Business Review (EBR)
   * @param {string} cspId
   * @param {object} ebrData
   * @returns {object}
   */
  scheduleEBR(cspId, ebrData) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    const ebr = {
      id: this.generateId('EBR'),
      date: ebrData.date,
      status: ebrData.status || 'scheduled', // scheduled, completed, cancelled
      attendees: ebrData.attendees || [],
      topics: ebrData.topics || [
        'Business objectives review',
        'Value realization progress',
        'Health metrics review',
        'Strategic initiatives update',
        'Upcoming priorities'
      ],
      outcomes: ebrData.outcomes || '',
      actionItems: ebrData.actionItems || [],
      nextDate: ebrData.nextDate || null,
      duration: ebrData.duration || 60, // minutes
      location: ebrData.location || 'Virtual',
      materials: ebrData.materials || [], // Links to presentations, reports
      notes: ebrData.notes || ''
    };

    csp.ebrs.push(ebr);
    csp.ebrs.sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
    
    const updatedCSP = this.createOrUpdateCSP(csp.accountId, csp);
    return updatedCSP;
  }

  /**
   * Record Quarterly Business Review (QBR)
   * @param {string} cspId
   * @param {object} qbrData
   * @returns {object}
   */
  recordQBR(cspId, qbrData) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    const qbr = {
      id: this.generateId('QBR'),
      quarter: qbrData.quarter, // e.g., "Q1 2026"
      date: qbrData.date,
      attendees: qbrData.attendees || [],
      healthScore: qbrData.healthScore || csp.health.overallScore,
      achievements: qbrData.achievements || [],
      challenges: qbrData.challenges || [],
      priorities: qbrData.priorities || [], // Next quarter priorities
      valueRealized: qbrData.valueRealized || 0,
      renewalLikelihood: qbrData.renewalLikelihood || 'high', // high, medium, low
      expansionOpportunities: qbrData.expansionOpportunities || [],
      actionItems: qbrData.actionItems || [],
      materials: qbrData.materials || []
    };

    csp.qbrs.push(qbr);
    csp.qbrs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    this.createOrUpdateCSP(csp.accountId, csp);
    return qbr;
  }

  /**
   * Update Health Score
   * @param {string} cspId
   * @param {object} healthData
   * @returns {object}
   */
  updateHealth(cspId, healthData) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    // Update dimension scores
    if (healthData.dimensions) {
      Object.keys(healthData.dimensions).forEach(dim => {
        if (csp.health.dimensions[dim]) {
          const updatedDim = {
            ...csp.health.dimensions[dim],
            ...healthData.dimensions[dim]
          };
          // Clamp score to 0-100 range
          if (updatedDim.score !== undefined) {
            updatedDim.score = Math.max(0, Math.min(100, updatedDim.score));
          }
          csp.health.dimensions[dim] = updatedDim;
        }
      });
    }

    // Calculate overall score (average of dimension scores)
    const dimensionScores = Object.values(csp.health.dimensions)
      .map(d => d.score)
      .filter(s => s > 0);
    
    if (dimensionScores.length > 0) {
      csp.health.overallScore = Math.round(
        dimensionScores.reduce((sum, s) => sum + s, 0) / dimensionScores.length
      );
    }

    // Add risks
    if (healthData.risks) {
      healthData.risks.forEach(risk => {
        risk.id = risk.id || this.generateId('RISK');
        const existingIndex = csp.health.risks.findIndex(r => r.id === risk.id);
        if (existingIndex >= 0) {
          csp.health.risks[existingIndex] = risk;
        } else {
          csp.health.risks.push(risk);
        }
      });
    }

    // Add opportunities
    if (healthData.opportunities) {
      healthData.opportunities.forEach(opp => {
        opp.id = opp.id || this.generateId('OPP');
        const existingIndex = csp.health.opportunities.findIndex(o => o.id === opp.id);
        if (existingIndex >= 0) {
          csp.health.opportunities[existingIndex] = opp;
        } else {
          csp.health.opportunities.push(opp);
        }
      });
    }

    const updatedCSP = this.createOrUpdateCSP(csp.accountId, csp);
    return updatedCSP;
  }

  /**
   * Track Value Realization
   * @param {string} cspId
   * @param {object} valueData
   * @returns {object}
   */
  trackValueRealization(cspId, valueData) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    if (valueData.expectedValue !== undefined) {
      csp.valueRealization.expectedValue = valueData.expectedValue;
    }

    if (valueData.realizedValue !== undefined) {
      csp.valueRealization.realizedValue = valueData.realizedValue;
    }

    // Calculate realization rate
    if (csp.valueRealization.expectedValue > 0) {
      csp.valueRealization.realizationRate = Math.round(
        (csp.valueRealization.realizedValue / csp.valueRealization.expectedValue) * 100
      );
    }

    // Update value drivers
    if (valueData.valueDrivers) {
      valueData.valueDrivers.forEach(driver => {
        driver.id = driver.id || this.generateId('VD');
        const existingIndex = csp.valueRealization.valueDrivers.findIndex(vd => vd.id === driver.id);
        if (existingIndex >= 0) {
          csp.valueRealization.valueDrivers[existingIndex] = driver;
        } else {
          csp.valueRealization.valueDrivers.push(driver);
        }
      });
    }

    const updatedCSP = this.createOrUpdateCSP(csp.accountId, csp);
    return updatedCSP;
  }

  /**
   * Generate EBR Summary Report
   * @param {string} cspId
   * @param {string} ebrId - Optional specific EBR, otherwise uses most recent
   * @returns {object}
   */
  generateEBRReport(cspId, ebrId = null) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    const ebr = ebrId 
      ? csp.ebrs.find(e => e.id === ebrId)
      : csp.ebrs[0]; // Most recent

    if (!ebr) throw new Error('No EBR found');

    const account = this.getAccount(csp.accountId);
    
    return {
      title: `Executive Business Review - ${account?.name || 'Customer'}`,
      date: ebr.date,
      attendees: ebr.attendees,
      
      // Executive Summary
      executiveSummary: {
        overallHealth: csp.health.overallScore,
        healthTrend: this.calculateHealthTrend(csp),
        valueRealized: csp.valueRealization.realizedValue,
        valueRealizationRate: csp.valueRealization.realizationRate,
        renewalStatus: this.getRenewalStatus(csp),
        keyAchievements: this.getRecentAchievements(csp, 90), // Last 90 days
        criticalRisks: csp.health.risks.filter(r => r.severity === 'critical' && r.status === 'open')
      },

      // Goals Progress
      goalsProgress: {
        total: csp.goals.length,
        completed: csp.goals.filter(g => g.status === 'completed').length,
        inProgress: csp.goals.filter(g => g.status === 'in-progress').length,
        atRisk: csp.goals.filter(g => g.status === 'at-risk').length,
        details: csp.goals.map(g => ({
          goal: g.goal,
          progress: g.progress,
          status: g.status,
          targetDate: g.targetDate
        }))
      },

      // Metrics Dashboard
      metrics: csp.metrics.map(m => ({
        metric: m.metric,
        current: m.current,
        target: m.target,
        achievement: m.target > 0 ? Math.round((m.current / m.target) * 100) : 0,
        trend: m.trend
      })),

      // Value Realization
      valueRealization: csp.valueRealization,

      // Health Dimensions
      healthDimensions: csp.health.dimensions,

      // Risks & Opportunities
      risks: csp.health.risks.filter(r => r.status === 'open'),
      opportunities: csp.health.opportunities,

      // Action Items
      actionItems: ebr.actionItems,

      // Next Steps
      nextSteps: {
        nextEBR: ebr.nextDate,
        upcomingMilestones: this.getUpcomingMilestones(csp, 90),
        priorities: this.getCurrentPriorities(csp)
      }
    };
  }

  /**
   * Generate QBR Summary Report
   * @param {string} cspId
   * @param {string} qbrId - Optional specific QBR, otherwise uses most recent
   * @returns {object}
   */
  generateQBRReport(cspId, qbrId = null) {
    const csp = this.getCSP(cspId);
    if (!csp) throw new Error('CSP not found');

    const qbr = qbrId 
      ? csp.qbrs.find(q => q.id === qbrId)
      : csp.qbrs[0]; // Most recent

    if (!qbr) throw new Error('No QBR found');

    const account = this.getAccount(csp.accountId);
    
    return {
      title: `Quarterly Business Review - ${qbr.quarter}`,
      customer: account?.name || 'Customer',
      date: qbr.date,
      attendees: qbr.attendees,
      
      quarterSummary: {
        healthScore: qbr.healthScore,
        achievements: qbr.achievements,
        challenges: qbr.challenges,
        valueRealized: qbr.valueRealized,
        renewalLikelihood: qbr.renewalLikelihood
      },

      goalsCompleted: csp.goals.filter(g => 
        g.status === 'completed' && 
        this.isInQuarter(g.metadata?.completedAt, qbr.quarter)
      ),

      metricsProgress: csp.metrics,

      valueRealization: csp.valueRealization,

      nextQuarterPriorities: qbr.priorities,

      expansionOpportunities: qbr.expansionOpportunities,

      actionItems: qbr.actionItems
    };
  }

  /**
   * Get all CSPs (for dashboard/analytics)
   * @returns {array}
   */
  getAllCSPs() {
    const csps = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.storagePrefix)) {
        const data = localStorage.getItem(key);
        if (data) csps.push(JSON.parse(data));
      }
    }
    return csps;
  }

  /**
   * Get CSP Health Summary for Dashboard
   * @returns {object}
   */
  getHealthSummary() {
    const csps = this.getAllCSPs();
    
    const summary = {
      totalCSPs: csps.length,
      healthy: csps.filter(c => c.health.overallScore >= 80).length,
      atRisk: csps.filter(c => c.health.overallScore >= 50 && c.health.overallScore < 80).length,
      critical: csps.filter(c => c.health.overallScore < 50).length,
      averageHealth: csps.length > 0 
        ? Math.round(csps.reduce((sum, c) => sum + c.health.overallScore, 0) / csps.length)
        : 0,
      averageValueRealization: csps.length > 0
        ? Math.round(csps.reduce((sum, c) => sum + c.valueRealization.realizationRate, 0) / csps.length)
        : 0,
      upcomingEBRs: this.getUpcomingEBRs(csps, 30), // Next 30 days
      upcomingQBRs: this.getUpcomingQBRs(csps, 30)
    };

    return summary;
  }

  // ==================== Helper Functions ====================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  updateAccountCSPReference(accountId, cspId) {
    const account = this.getAccount(accountId);
    if (account) {
      account.cspId = cspId;
      localStorage.setItem(`ea_account_${accountId}`, JSON.stringify(account));
    }
  }

  getAccount(accountId) {
    const data = localStorage.getItem(`ea_account_${accountId}`);
    return data ? JSON.parse(data) : null;
  }

  calculateHealthTrend(csp) {
    // Compare current health with previous QBR
    if (csp.qbrs.length < 2) return 'stable';
    const current = csp.health.overallScore;
    const previous = csp.qbrs[1].healthScore; // Second most recent
    
    if (current > previous + 5) return 'improving';
    if (current < previous - 5) return 'declining';
    return 'stable';
  }

  getRenewalStatus(csp) {
    const score = csp.health.overallScore;
    if (score >= 80) return 'low-risk';
    if (score >= 60) return 'medium-risk';
    return 'high-risk';
  }

  getRecentAchievements(csp, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return csp.milestones
      .filter(m => m.status === 'completed' && new Date(m.completedDate) > cutoffDate)
      .map(m => m.milestone);
  }

  getUpcomingMilestones(csp, days) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return csp.milestones
      .filter(m => m.status !== 'completed' && new Date(m.targetDate) <= futureDate)
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
  }

  getCurrentPriorities(csp) {
    // Most recent QBR priorities, or top goals if no QBR
    if (csp.qbrs.length > 0) {
      return csp.qbrs[0].priorities || [];
    }
    
    return csp.goals
      .filter(g => g.status === 'in-progress')
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      .slice(0, 5)
      .map(g => g.goal);
  }

  getUpcomingEBRs(csps, days) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const now = new Date();
    
    const upcoming = [];
    csps.forEach(csp => {
      csp.ebrs
        .filter(e => e.status === 'scheduled' && new Date(e.date) >= now && new Date(e.date) <= futureDate)
        .forEach(e => {
          const account = this.getAccount(csp.accountId);
          upcoming.push({
            accountName: account?.name || 'Unknown',
            date: e.date,
            attendees: e.attendees
          });
        });
    });
    
    return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  getUpcomingQBRs(csps, days) {
    // Similar to EBRs
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const now = new Date();
    
    const upcoming = [];
    csps.forEach(csp => {
      if (csp.metadata.nextReviewDate) {
        const reviewDate = new Date(csp.metadata.nextReviewDate);
        if (reviewDate >= now && reviewDate <= futureDate) {
          const account = this.getAccount(csp.accountId);
          upcoming.push({
            accountName: account?.name || 'Unknown',
            date: csp.metadata.nextReviewDate,
            quarter: this.getQuarter(reviewDate)
          });
        }
      }
    });
    
    return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  getQuarter(date) {
    const d = new Date(date);
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  }

  isInQuarter(dateString, quarter) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return this.getQuarter(date) === quarter;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.customerSuccess = new EA_CustomerSuccess();
}
