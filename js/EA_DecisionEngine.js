/**
 * EA_DecisionEngine.js
 * Decision Rules Engine for Application Portfolio Rationalization
 * Generates automated recommendations: Invest, Tolerate, Migrate, Eliminate
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class EA_DecisionEngine {
  constructor(scoringEngine, storageManager, config = null) {
    this.scoringEngine = scoringEngine;
    this.storage = storageManager;
    this.config = config || this.getDefaultConfig();
  }

  /**
   * Get default decision rules configuration
   * @returns {object}
   */
  getDefaultConfig() {
    return {
      thresholds: {
        scoreHigh: 70,        // Score >= 70 = High performing
        scoreLow: 40,         // Score < 40 = Low performing
        costHigh: 500000,     // Annual cost > $500k = High cost
        overlapHigh: 0.6,     // Capability overlap > 60%
        businessCritical: 70,  // BusinessFit >= 70 = Critical
        techPoor: 40          // TechnicalHealth < 40 = Poor tech
      },
      weights: {
        scoreWeight: 0.5,
        costWeight: 0.3,
        overlapWeight: 0.2
      }
    };
  }

  /**
   * Generate decision recommendation for application
   * @param {Application} app - Application object
   * @param {Score} score - Calculated score
   * @param {object} context - Additional context (consolidation candidates, portfolio data)
   * @returns {Decision}
   */
  async recommendDecision(app, score, context = {}) {
    // Apply decision rules in priority order
    const rules = [
      this.ruleEliminate,
      this.ruleMigrate,
      this.ruleConsolidate,
      this.ruleInvest,
      this.ruleTolerate  // Default fallback
    ];

    for (const rule of rules) {
      const decision = rule.call(this, app, score, context);
      if (decision) {
        // Generate unique ID and persist
        decision.id = this.generateDecisionId(app.id);
        decision.appId = app.id;
        decision.approvalStatus = 'pending';
        decision.createdAt = new Date().toISOString();
        
        // Save to storage
        await this.storage.save('decisions', decision);
        
        return decision;
      }
    }

    // Should never reach here (ruleTolerate is fallback)
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // DECISION RULES (Priority Order)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Rule 1: ELIMINATE - Low score + High cost
   * Confidence: 0.9 if both conditions met
   */
  ruleEliminate(app, score, context) {
    const totalCost = (app.capex || 0) + (app.opex || 0);
    
    if (score.total < this.config.thresholds.scoreLow && 
        totalCost > this.config.thresholds.costHigh) {
      
      return {
        status: 'Eliminate',
        confidence: 0.9,
        rationale: `Low total score (${score.total}/100) combined with high annual cost ($${totalCost.toLocaleString()}) makes this application a strong candidate for retirement. Consider migrating users to alternative solutions.`,
        owner: null,
        metadata: {
          triggeredRule: 'Eliminate',
          scoreTotal: score.total,
          annualCost: totalCost
        }
      };
    }
    
    return null;
  }

  /**
   * Rule 2: MIGRATE - High business value + Low technical health
   * Confidence: 0.85
   */
  ruleMigrate(app, score, context) {
    if (score.businessFit >= this.config.thresholds.businessCritical && 
        score.technicalHealth < this.config.thresholds.techPoor) {
      
      return {
        status: 'Migrate',
        confidence: 0.85,
        rationale: `High business value (${score.businessFit}/100) but poor technical health (${score.technicalHealth}/100) indicates need for modernization. Consider re-platforming or cloud migration to preserve business value while improving technical foundation.`,
        owner: null,
        metadata: {
          triggeredRule: 'Migrate',
          businessFit: score.businessFit,
          technicalHealth: score.technicalHealth
        }
      };
    }
    
    return null;
  }

  /**
   * Rule 3: CONSOLIDATE - High capability overlap
   * Confidence: 0.75 (depends on overlap analysis)
   */
  ruleConsolidate(app, score, context) {
    const overlapData = context.consolidationCandidates || [];
    const overlap = this.calculateOverlap(app, overlapData);
    
    if (overlap.index > this.config.thresholds.overlapHigh) {
      return {
        status: 'Eliminate',
        confidence: 0.75,
        rationale: `High capability overlap (${Math.round(overlap.index * 100)}%) detected with ${overlap.candidates.length} other application(s): ${overlap.candidates.map(c => c.name).join(', ')}. Consider consolidation to reduce redundancy and optimize costs.`,
        owner: null,
        metadata: {
          triggeredRule: 'Consolidate',
          overlapIndex: overlap.index,
          overlappingApps: overlap.candidates.map(c => c.id)
        }
      };
    }
    
    return null;
  }

  /**
   * Rule 4: INVEST - High total score
   * Confidence: 0.9
   */
  ruleInvest(app, score, context) {
    if (score.total >= this.config.thresholds.scoreHigh) {
      return {
        status: 'Invest',
        confidence: 0.9,
        rationale: `Excellent total score (${score.total}/100) across all criteria. This is a high-performing application that delivers strong business value with good technical health. Recommend continued investment and enhancement.`,
        owner: null,
        metadata: {
          triggeredRule: 'Invest',
          scoreTotal: score.total,
          businessFit: score.businessFit,
          technicalHealth: score.technicalHealth
        }
      };
    }
    
    return null;
  }

  /**
   * Rule 5: TOLERATE - Default fallback
   * Confidence: 0.5 (medium)
   */
  ruleTolerate(app, score, context) {
    return {
      status: 'Tolerate',
      confidence: 0.5,
      rationale: `Moderate performance (score: ${score.total}/100) with no critical issues. Application can be maintained in current state but should be monitored for changes in business needs or technical landscape.`,
      owner: null,
      metadata: {
        triggeredRule: 'Tolerate',
        scoreTotal: score.total
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PORTFOLIO-WIDE ANALYSIS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate decisions for entire application portfolio
   * @param {Application[]} applications
   * @returns {Promise<Decision[]>}
   */
  async analyzePortfolio(applications) {
    console.log(`🔄 Analyzing portfolio of ${applications.length} applications...`);

    // Step 1: Calculate scores for all applications
    const scores = this.scoringEngine.calculateBatchScores(applications);
    
    // Step 2: Build portfolio context (consolidation candidates)
    const consolidationContext = this.buildConsolidationContext(applications);
    
    // Step 3: Generate decisions
    const decisions = [];
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const score = scores[i];
      const context = {
        consolidationCandidates: consolidationContext[app.id] || []
      };
      
      const decision = await this.recommendDecision(app, score, context);
      decisions.push(decision);
    }

    console.log(`✅ Portfolio analysis complete: ${decisions.length} decisions generated`);
    return decisions;
  }

  /**
   * Build consolidation context by analyzing capability overlap
   * @param {Application[]} applications
   * @returns {object} - Map of app ID to consolidation candidates
   */
  buildConsolidationContext(applications) {
    const context = {};
    
    for (let i = 0; i < applications.length; i++) {
      const app1 = applications[i];
      const candidates = [];
      
      for (let j = 0; j < applications.length; j++) {
        if (i === j) continue;
        
        const app2 = applications[j];
        const overlapScore = this.calculateCapabilityOverlap(app1, app2);
        
        if (overlapScore > 0.3) { // 30% overlap threshold
          candidates.push({
            id: app2.id,
            name: app2.name,
            overlapScore: overlapScore
          });
        }
      }
      
      context[app1.id] = candidates.sort((a, b) => b.overlapScore - a.overlapScore);
    }
    
    return context;
  }

  /**
   * Calculate capability overlap between two applications
   * @param {Application} app1
   * @param {Application} app2
   * @returns {number} - Overlap index (0-1)
   */
  calculateCapabilityOverlap(app1, app2) {
    // Method 1: APQC process overlap
    if (app1.processIds && app2.processIds && 
        app1.processIds.length > 0 && app2.processIds.length > 0) {
      const intersection = app1.processIds.filter(p => app2.processIds.includes(p));
      const union = [...new Set([...app1.processIds, ...app2.processIds])];
      return intersection.length / union.length;
    }
    
    // Method 2: Department overlap (simple heuristic)
    if (app1.department && app2.department && app1.department === app2.department) {
      return 0.4; // Same department = some overlap
    }
    
    // Method 3: Category/Type overlap
    if (app1.category && app2.category && app1.category === app2.category) {
      return 0.5; // Same category = moderate overlap
    }
    
    return 0; // No detectable overlap
  }

  /**
   * Calculate overlap data for a specific app
   * @param {Application} app
   * @param {Array} candidates - Pre-computed consolidation candidates
   * @returns {object}
   */
  calculateOverlap(app, candidates) {
    if (!candidates || candidates.length === 0) {
      return { index: 0, candidates: [] };
    }
    
    // Average overlap with top candidates
    const topCandidates = candidates.slice(0, 3);
    const avgOverlap = topCandidates.reduce((sum, c) => sum + c.overlapScore, 0) / topCandidates.length;
    
    return {
      index: avgOverlap,
      candidates: topCandidates
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DECISION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update decision (e.g., owner assignment, approval)
   * @param {string} decisionId
   * @param {object} updates
   * @returns {Promise<Decision>}
   */
  async updateDecision(decisionId, updates) {
    const decision = await this.storage.get('decisions', decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }
    
    const updated = { ...decision, ...updates, updatedAt: new Date().toISOString() };
    await this.storage.save('decisions', updated);
    
    return updated;
  }

  /**
   * Approve decision
   * @param {string} decisionId
   * @param {string} approver
   * @returns {Promise<Decision>}
   */
  async approveDecision(decisionId, approver) {
    return this.updateDecision(decisionId, {
      approvalStatus: 'approved',
      approver: approver,
      approvedAt: new Date().toISOString()
    });
  }

  /**
   * Reject decision
   * @param {string} decisionId
   * @param {string} rejector
   * @param {string} reason
   * @returns {Promise<Decision>}
   */
  async rejectDecision(decisionId, rejector, reason) {
    return this.updateDecision(decisionId, {
      approvalStatus: 'rejected',
      rejector: rejector,
      rejectionReason: reason,
      rejectedAt: new Date().toISOString()
    });
  }

  /**
   * Get decisions by status
   * @param {string} status - 'Invest', 'Tolerate', 'Migrate', 'Eliminate'
   * @returns {Promise<Decision[]>}
   */
  async getDecisionsByStatus(status) {
    return this.storage.query('decisions', 'status', status);
  }

  /**
   * Get decisions by approval status
   * @param {string} approvalStatus - 'pending', 'approved', 'rejected'
   * @returns {Promise<Decision[]>}
   */
  async getDecisionsByApproval(approvalStatus) {
    return this.storage.query('decisions', 'approvalStatus', approvalStatus);
  }

  /**
   * Get decision for specific application
   * @param {string} appId
   * @returns {Promise<Decision|null>}
   */
  async getDecisionForApp(appId) {
    const decisions = await this.storage.query('decisions', 'appId', appId);
    return decisions.length > 0 ? decisions[0] : null;
  }

  /**
   * Generate portfolio summary
   * @returns {Promise<object>}
   */
  async getPortfolioSummary() {
    const allDecisions = await this.storage.getAll('decisions');
    
    const summary = {
      total: allDecisions.length,
      byStatus: {
        'Invest': 0,
        'Tolerate': 0,
        'Migrate': 0,
        'Eliminate': 0
      },
      byApproval: {
        'pending': 0,
        'approved': 0,
        'rejected': 0
      },
      avgConfidence: 0
    };
    
    let confidenceSum = 0;
    
    allDecisions.forEach(d => {
      summary.byStatus[d.status] = (summary.byStatus[d.status] || 0) + 1;
      summary.byApproval[d.approvalStatus] = (summary.byApproval[d.approvalStatus] || 0) + 1;
      confidenceSum += d.confidence;
    });
    
    summary.avgConfidence = allDecisions.length > 0 
      ? Math.round((confidenceSum / allDecisions.length) * 100) / 100
      : 0;
    
    return summary;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate unique decision ID
   * @param {string} appId
   * @returns {string}
   */
  generateDecisionId(appId) {
    return `DEC_${appId}_${Date.now()}`;
  }

  /**
   * Update configuration
   * @param {object} newConfig
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Export decisions to JSON
   * @returns {Promise<string>}
   */
  async exportDecisions() {
    const decisions = await this.storage.getAll('decisions');
    const scores = await this.storage.getAll('scores');
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      decisions: decisions,
      scores: scores,
      config: this.config
    }, null, 2);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_DecisionEngine;
}
