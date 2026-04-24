/**
 * OptimizationEngine.js — Decision Intelligence
 * Greedy knapsack: selects best portfolio of scenarios under budget constraints.
 */
class OptimizationEngine {
  constructor(financialEngine) {
    this.fin = financialEngine || new FinancialEngine();
  }

  _getCost(scenario) {
    return (scenario.changes || [])
      .filter(c => (c.costChange || 0) < 0)
      .reduce((s, c) => s + Math.abs(c.costChange), 0) || scenario.cost || 0;
  }

  _fmt(n) {
    const v = Math.abs(n || 0);
    const sign = n < 0 ? '-' : '';
    if (v >= 1e6) return sign + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return sign + (v / 1e3).toFixed(0) + 'K';
    return sign + (v || 0).toLocaleString();
  }

  scoreInitiative(scenario, riskTolerance = 0.5) {
    const m = this.fin.evaluateScenario(scenario);
    const npvScore = Math.max(0, Math.min(1, (m.npv || 0) / 1e6));
    const roiScore = Math.max(0, Math.min(1, (m.roi || 0) / 200));
    const riskPenalty = (scenario.riskScore || 0.3) * (1 - riskTolerance);
    return npvScore * 0.5 + roiScore * 0.3 - riskPenalty * 0.2;
  }

  optimizePortfolio(scenarios, budget, riskTolerance = 0.5) {
    if (!budget || budget <= 0) {
      return {
        selected: [], rejected: scenarios,
        totalNPV: 0, totalCost: 0, remaining: 0,
        explanation: 'No budget set — no scenarios selected.'
      };
    }

    const scored = scenarios
      .map(s => ({ ...s, _score: this.scoreInitiative(s, riskTolerance) }))
      .sort((a, b) => b._score - a._score);

    const selected = [], rejected = [];
    let remaining = budget;
    for (const sc of scored) {
      const cost = this._getCost(sc);
      if (cost <= remaining) {
        selected.push(sc);
        remaining -= cost;
      } else {
        rejected.push(sc);
      }
    }

    const totalNPV = selected.reduce((s, sc) => s + (this.fin.calculateNPV(sc) || 0), 0);
    const totalCost = budget - remaining;

    return {
      selected, rejected, remaining, totalNPV, totalCost,
      explanation: `${selected.length} of ${scenarios.length} initiative(s) selected within ` +
        `${this._fmt(budget)} budget. Total investment: ${this._fmt(totalCost)}. ` +
        `Combined portfolio NPV: ${this._fmt(totalNPV)}. ` +
        `${rejected.length} initiative(s) deferred due to budget or risk constraints.`
    };
  }
}

if (typeof module !== 'undefined') module.exports = OptimizationEngine;
