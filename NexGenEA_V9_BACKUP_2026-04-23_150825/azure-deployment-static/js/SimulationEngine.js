/**
 * SimulationEngine.js — Decision Intelligence
 * Clones base EA state, applies scenario changes, propagates graph impact.
 */
class SimulationEngine {
  constructor(model) { this.model = model; }

  cloneBaseState() {
    return JSON.parse(JSON.stringify(this.model));
  }

  applyChanges(baseState, changes) {
    const state = JSON.parse(JSON.stringify(baseState));
    for (const c of (changes || [])) {
      switch (c.type) {
        case 'REMOVE_APP':
          state.systems = (state.systems || []).filter(s => s.id !== c.target && s.name !== c.target);
          break;
        case 'INVEST_CAPABILITY': {
          const cap = (state.capabilities || []).find(x => x.id === c.target || x.name === c.target);
          if (cap) { cap.maturity = Math.min(5, (cap.maturity || 1) + (c.maturityDelta || 1)); }
          break;
        }
        case 'MIGRATE_APP': {
          const app = (state.systems || []).find(s => s.id === c.target || s.name === c.target);
          if (app) app.status = 'planned';
          break;
        }
        case 'OUTSOURCE': {
          const app2 = (state.systems || []).find(s => s.id === c.target || s.name === c.target);
          if (app2) app2._outsourced = true;
          break;
        }
      }
    }
    return state;
  }

  propagateImpactChange(state, changes) {
    const capMap = {};
    for (const s of (state.systems || [])) {
      if (s.supportsCapability) {
        if (!capMap[s.supportsCapability]) capMap[s.supportsCapability] = [];
        capMap[s.supportsCapability].push(s.name);
      }
    }
    return (changes || [])
      .filter(c => c.type === 'INVEST_CAPABILITY' && capMap[c.target])
      .map(c => ({ capability: c.target, affectedSystems: capMap[c.target] }));
  }

  runScenario(scenario) {
    const baseState = this.cloneBaseState();
    const state = this.applyChanges(baseState, scenario.changes || []);
    const impacted = this.propagateImpactChange(state, scenario.changes || []);
    return { state, impacted };
  }
}

if (typeof module !== 'undefined') module.exports = SimulationEngine;
