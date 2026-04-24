/**
 * FinancialEngine.js — Decision Intelligence
 * Calculates NPV, ROI, IRR, Payback for EA scenarios.
 */
class FinancialEngine {
  constructor(discountRate = 0.08) { this.discountRate = discountRate; }

  calculateCashFlows(scenario) {
    let upfront = 0, annualBenefit = 0;
    for (const c of (scenario.changes || [])) {
      if ((c.costChange || 0) < 0) upfront += Math.abs(c.costChange);
      if ((c.benefitChange || 0) > 0) annualBenefit += c.benefitChange;
    }
    const dur = scenario.duration || 3;
    const flows = [-upfront];
    for (let y = 0; y < dur; y++) flows.push(annualBenefit / dur);
    return flows;
  }

  calculateNPV(scenario, discountRatePct) {
    const r = (discountRatePct != null ? discountRatePct : this.discountRate * 100) / 100;
    const flows = this.calculateCashFlows(scenario);
    return Math.round(flows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0));
  }

  calculateROI(scenario) {
    let cost = 0, benefit = 0;
    for (const c of (scenario.changes || [])) {
      if ((c.costChange || 0) < 0) cost += Math.abs(c.costChange);
      if ((c.benefitChange || 0) > 0) benefit += c.benefitChange;
    }
    return cost === 0 ? 0 : Math.round(((benefit - cost) / cost) * 100);
  }

  calculatePayback(scenario) {
    let cum = 0;
    const flows = this.calculateCashFlows(scenario);
    for (let t = 0; t < flows.length; t++) {
      cum += flows[t];
      if (cum >= 0) return t;
    }
    return null;
  }

  calculateIRR(scenario) {
    const flows = this.calculateCashFlows(scenario);
    if (!flows.some(f => f > 0) || !flows.some(f => f < 0)) return null;
    let r = 0.1;
    for (let i = 0; i < 200; i++) {
      let npv = 0, d = 0;
      for (let t = 0; t < flows.length; t++) {
        const f = Math.pow(1 + r, t);
        npv += flows[t] / f;
        if (t > 0) d -= t * flows[t] / (f * (1 + r));
      }
      if (Math.abs(d) < 1e-12) break;
      const next = r - npv / d;
      if (Math.abs(next - r) < 1e-6) { r = next; break; }
      r = Math.max(-0.99, Math.min(10, next));
    }
    return isFinite(r) && r > -1 ? Math.round(r * 1000) / 10 : null;
  }

  evaluateScenario(scenario, discountRatePct) {
    return {
      npv: this.calculateNPV(scenario, discountRatePct),
      roi: this.calculateROI(scenario),
      payback: this.calculatePayback(scenario),
      irr: this.calculateIRR(scenario),
      cashFlows: this.calculateCashFlows(scenario)
    };
  }
}

if (typeof module !== 'undefined') module.exports = FinancialEngine;
