/**
 * EA_ScoringEngine.js
 * 4-Criteria Scoring Engine for Application Portfolio Decision Making
 * Formula: Total = 0.3×BusinessFit + 0.3×TechnicalHealth + 0.2×CostEfficiency + 0.2×Risk
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class EA_ScoringEngine {
  constructor(apqcFramework = null, industryBenchmarks = null) {
    this.apqc = apqcFramework;
    this.benchmarks = industryBenchmarks || this.getDefaultBenchmarks();
    this.weights = {
      businessFit: 0.3,
      technicalHealth: 0.3,
      costEfficiency: 0.2,
      risk: 0.2
    };
  }

  /**
   * Get default industry benchmarks
   * @returns {object}
   */
  getDefaultBenchmarks() {
    return {
      costPerUser: {
        'ERP': 2000,
        'CRM': 1500,
        'HCM': 1000,
        'Finance': 1800,
        'Analytics': 800,
        'Collaboration': 300,
        'Default': 1000
      },
      averageAge: 5, // years
      maxIntegrations: 10
    };
  }

  /**
   * Calculate composite score for application
   * @param {Application} app - Application object
   * @returns {Score} - Score object with 5 values
   */
  calculateScore(app) {
    const businessFit = this.calculateBusinessFit(app);
    const technicalHealth = this.calculateTechnicalHealth(app);
    const costEfficiency = this.calculateCostEfficiency(app);
    const risk = this.calculateRisk(app);
    
    const total = 
      this.weights.businessFit * businessFit +
      this.weights.technicalHealth * technicalHealth +
      this.weights.costEfficiency * costEfficiency +
      this.weights.risk * risk;
    
    return {
      appId: app.id,
      businessFit: Math.round(businessFit),
      technicalHealth: Math.round(technicalHealth),
      costEfficiency: Math.round(costEfficiency),
      risk: Math.round(risk),
      total: Math.round(total),
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * BusinessFit: Strategic value + APQC alignment + user adoption
   * Score range: 0-100
   * 
   * Factors:
   * - Base business value (1-10) → 10-100 scale
   * - APQC strategic process alignment: +15 per strategic process
   * - User adoption: +10 if >100 users
   * - Business criticality: +20 if critical
   */
  calculateBusinessFit(app) {
    let score = (app.businessValue || 5) * 10; // Base: 1-10 → 10-100
    
    // APQC strategic alignment bonus
    if (this.apqc && app.processIds && app.processIds.length > 0) {
      const strategicProcesses = app.processIds.filter(pid => 
        this.isStrategicProcess(pid)
      );
      
      if (strategicProcesses.length > 0) {
        score += 15 * strategicProcesses.length; // +15 per strategic process
      }
    }
    
    // User adoption indicator
    if (app.users && app.users > 100) {
      score += 10; // Widely adopted = high business value
    }
    
    // Business criticality
    if (app.isCritical || app.businessValue >= 9) {
      score += 20;
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * TechnicalHealth: Architecture quality + vendor support + age
   * Score range: 0-100
   * 
   * Factors:
   * - Base technical fit (1-10) → 10-100 scale
   * - Lifecycle stage: Legacy(-20), Phase Out(-30), Retired(-50)
   * - Vendor risk: Unknown/Custom(-15)
   * - Technology debt: Legacy/Mainframe(-25)
   * - Application age: >10 years(-20), >15 years(-30)
   */
  calculateTechnicalHealth(app) {
    let score = (app.technicalFit || 5) * 10; // Base: 1-10 → 10-100
    
    // Lifecycle penalty
    const lifecyclePenalty = {
      'phaseIn': 0,
      'active': 0,
      'legacy': -20,
      'phaseOut': -30,
      'retired': -50
    };
    score += lifecyclePenalty[app.lifecycle] || 0;
    
    // Vendor risk (if vendor unknown/unsupported)
    if (!app.vendor || app.vendor === 'Custom' || app.vendor === 'Unknown' || app.vendor === 'In-House') {
      score -= 15;
    }
    
    // Technology debt
    const techStack = (app.technology || '').toLowerCase();
    if (techStack.includes('legacy') || techStack.includes('mainframe') || 
        techStack.includes('cobol') || techStack.includes('as/400')) {
      score -= 25;
    }
    
    // Application age (if available in metadata)
    const age = this.getApplicationAge(app);
    if (age > 10) {
      score -= 20;
    } else if (age > 15) {
      score -= 30;
    }
    
    return Math.max(score, 0); // Floor at 0
  }

  /**
   * CostEfficiency: TCO per user vs. industry benchmark
   * Score range: 0-100
   * 
   * Factors:
   * - Cost per user vs. benchmark (lower = better)
   * - ROI indicator (if available)
   * - License utilization (active users / licensed users)
   */
  calculateCostEfficiency(app) {
    const capex = app.capex || 0;
    const opex = app.opex || 0;
    const tco = capex + opex;
    const users = app.users || 1; // Avoid division by zero
    
    const costPerUser = tco / users;
    
    // Get benchmark for app category
    const category = this.categorizeApplication(app);
    const benchmark = this.benchmarks.costPerUser[category] || this.benchmarks.costPerUser.Default;
    
    // Calculate efficiency score
    // If costPerUser < benchmark, score is high (>100 possible, then capped)
    // If costPerUser > benchmark, score is low
    let efficiency = (benchmark / costPerUser) * 100;
    
    // License utilization bonus (if data available)
    if (app.licensedUsers && app.users) {
      const utilization = app.users / app.licensedUsers;
      if (utilization > 0.8) {
        efficiency += 10; // Good utilization
      } else if (utilization < 0.3) {
        efficiency -= 15; // Poor utilization
      }
    }
    
    // Cap at 100
    return Math.min(Math.max(efficiency, 0), 100);
  }

  /**
   * Risk: Compliance + integration complexity + vendor stability + single point of failure
   * Score range: 0-100 (higher = lower risk)
   * 
   * Factors:
   * - Start at 100 (no risk)
   * - Compliance risk: -20 if non-compliant
   * - Integration complexity: -5 per integration
   * - Single point of failure: -25 if critical with no backup
   * - Vendor concentration: -15 if high vendor lock-in
   * - Data sensitivity: -20 if handles sensitive data with poor security
   */
  calculateRisk(app) {
    let riskScore = 100; // Start at max (no risk = good)
    
    // Compliance risk
    if (app.metadata && app.metadata.compliant === false) {
      riskScore -= 20;
    }
    
    // Integration complexity (more integrations = higher risk)
    const integrationCount = app.integrations?.length || 0;
    riskScore -= Math.min(integrationCount * 5, 30); // Cap at -30
    
    // Single point of failure (critical process, only 1 app supporting it)
    if (app.isCritical && !app.hasBackup && !app.hasAlternative) {
      riskScore -= 25;
    }
    
    // Vendor concentration
    if (this.isVendorConcentrated(app.vendor)) {
      riskScore -= 15;
    }
    
    // Data sensitivity + security posture
    if (app.dataSensitivity === 'high' || app.dataSensitivity === 'critical') {
      if (!app.securityRating || app.securityRating < 7) {
        riskScore -= 20; // High sensitivity + low security = high risk
      }
    }
    
    // Technology obsolescence risk
    const age = this.getApplicationAge(app);
    if (age > 15) {
      riskScore -= 15; // Very old apps have higher risk
    }
    
    return Math.max(riskScore, 0); // Floor at 0
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if APQC process is strategic
   * @param {string} processId - APQC process ID
   * @returns {boolean}
   */
  isStrategicProcess(processId) {
    if (!this.apqc || !this.apqc.categories) return false;
    
    // Check if process is tagged with strategic themes
    const strategicThemes = ['innovation', 'growth', 'transformation'];
    
    for (const category of this.apqc.categories) {
      if (this.checkCategoryForProcess(category, processId, strategicThemes)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Recursively check category and children for strategic process
   */
  checkCategoryForProcess(category, processId, strategicThemes) {
    if (category.id === processId || category.code === processId) {
      return category.strategic_themes?.some(theme => strategicThemes.includes(theme));
    }
    
    if (category.children) {
      for (const child of category.children) {
        if (this.checkCategoryForProcess(child, processId, strategicThemes)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Categorize application for benchmark lookup
   * @param {Application} app
   * @returns {string}
   */
  categorizeApplication(app) {
    const name = (app.name || '').toLowerCase();
    const description = (app.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('erp') || combined.includes('enterprise resource')) return 'ERP';
    if (combined.includes('crm') || combined.includes('salesforce') || combined.includes('customer relationship')) return 'CRM';
    if (combined.includes('hcm') || combined.includes('hr') || combined.includes('human capital')) return 'HCM';
    if (combined.includes('finance') || combined.includes('accounting') || combined.includes('sap')) return 'Finance';
    if (combined.includes('analytics') || combined.includes('bi') || combined.includes('reporting')) return 'Analytics';
    if (combined.includes('collaboration') || combined.includes('teams') || combined.includes('slack')) return 'Collaboration';
    
    return 'Default';
  }

  /**
   * Get application age in years
   * @param {Application} app
   * @returns {number}
   */
  getApplicationAge(app) {
    if (app.deployedDate) {
      const deployedDate = new Date(app.deployedDate);
      const now = new Date();
      return Math.floor((now - deployedDate) / (365.25 * 24 * 60 * 60 * 1000));
    }
    
    // If no deployed date, estimate from lifecycle
    const lifecycleAgeEstimate = {
      'phaseIn': 1,
      'active': 5,
      'legacy': 10,
      'phaseOut': 12,
      'retired': 15
    };
    
    return lifecycleAgeEstimate[app.lifecycle] || this.benchmarks.averageAge;
  }

  /**
   * Check if vendor concentration is high (placeholder - needs portfolio context)
   * @param {string} vendor
   * @returns {boolean}
   */
  isVendorConcentrated(vendor) {
    // TODO: This should check against full portfolio to see if >50% apps from same vendor
    // For now, return false (will be implemented when integrated with portfolio analysis)
    return false;
  }

  /**
   * Batch calculate scores for multiple applications
   * @param {Application[]} applications
   * @returns {Score[]}
   */
  calculateBatchScores(applications) {
    return applications.map(app => this.calculateScore(app));
  }

  /**
   * Get score breakdown explanation
   * @param {Score} score
   * @returns {object}
   */
  getScoreBreakdown(score) {
    return {
      total: {
        score: score.total,
        label: this.getScoreLabel(score.total)
      },
      businessFit: {
        score: score.businessFit,
        contribution: Math.round(score.businessFit * this.weights.businessFit),
        label: this.getScoreLabel(score.businessFit)
      },
      technicalHealth: {
        score: score.technicalHealth,
        contribution: Math.round(score.technicalHealth * this.weights.technicalHealth),
        label: this.getScoreLabel(score.technicalHealth)
      },
      costEfficiency: {
        score: score.costEfficiency,
        contribution: Math.round(score.costEfficiency * this.weights.costEfficiency),
        label: this.getScoreLabel(score.costEfficiency)
      },
      risk: {
        score: score.risk,
        contribution: Math.round(score.risk * this.weights.risk),
        label: this.getScoreLabel(score.risk)
      }
    };
  }

  /**
   * Get qualitative label for score
   * @param {number} score
   * @returns {string}
   */
  getScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  }

  /**
   * Update scoring weights (for customization)
   * @param {object} weights - New weights object
   */
  updateWeights(weights) {
    this.weights = { ...this.weights, ...weights };
    
    // Normalize weights to sum to 1.0
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      console.warn(`⚠️ Weights sum to ${sum}, normalizing to 1.0`);
      Object.keys(this.weights).forEach(key => {
        this.weights[key] = this.weights[key] / sum;
      });
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_ScoringEngine;
}
