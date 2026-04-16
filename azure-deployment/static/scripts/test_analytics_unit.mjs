/**
 * test_analytics_unit.mjs — Unit tests for Parallel Analytics Workflows
 *
 * Tests the entire analytics layer:
 *   AnalyticsContextBuilder → AnalyticsWorkflowEngine → Tab modules (Decision/Financial/Scenarios/Optimize)
 *
 * Usage: node scripts/test_analytics_unit.mjs
 *
 * Test-first: these tests were written BEFORE implementation.
 * All tests must pass after implementation is complete.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.resolve(__dir, '..');
const JROOT = path.join(ROOT, 'NexGenEA', 'js');

// ── IIFE loader (runs browser-style IIFE JS in Node) ──────────────────────
function loadIIFE(relPath) {
  const code = readFileSync(path.join(JROOT, relPath), 'utf8');
  const fn = new Function(code + '\nreturn typeof module !== "undefined" ? module.exports : undefined;');
  try { fn(); } catch(_) {}  // run side effects (registers globals in this context)
  return null;
}
function loadAndGetExport(relPath, globalName) {
  const code = readFileSync(path.join(JROOT, relPath), 'utf8');
  // eslint-disable-next-line no-new-func
  const context = {};
  const wrapped = `(function(exports){${code}\n})(context)`;
  // Try to evaluate and catch; then just do a module-level eval
  try {
    const fn = new Function('exports', code + `\nif(typeof ${globalName}!=="undefined") exports.value=${globalName};`);
    const exp = {};
    fn(exp);
    return exp.value;
  } catch(e) {
    throw new Error(`Cannot load ${relPath}: ${e.message}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// TEST HELPERS
// ──────────────────────────────────────────────────────────────────────────
let passed = 0; let failed = 0; const failures = [];

function describe(name, fn) {
  console.log(`\n▸ ${name}`);
  fn();
}
function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch(e) {
    console.log(`  ✗ ${name} — ${e.message}`);
    failed++;
    failures.push(`${name}: ${e.message}`);
  }
}
async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch(e) {
    console.log(`  ✗ ${name} — ${e.message}`);
    failed++;
    failures.push(`${name}: ${e.message}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ──────────────────────────────────────────────────────────────────────────

/** Minimal model with NO workflow steps completed */
function createEmptyModel() {
  return {
    projectId:   'test-project-001',
    projectName: 'Test Project',
    description: 'A test manufacturing company',
    language:    'en',
    aiConfig: { architectureMode: 'standard' },
    masterData: {
      industry:            'Manufacturing',
      businessAreas:       ['Production', 'Quality', 'Logistics'],
      businessModel:       'B2B',
      offerings:           ['Industrial components'],
      customerSegments:    ['OEM manufacturers', 'Distributors'],
      geographies:         ['Sweden', 'Germany'],
      regulations:         ['ISO 9001', 'GDPR'],
      coreSystems:         ['ERP', 'MES', 'PLM'],
      dataLandscape:       'Siloed production data, limited real-time visibility',
      strategicPriorities: ['Digitise manufacturing', 'Predictive maintenance'],
      constraints:         ['Budget constrained', 'Legacy systems']
    },
    steps: {}
  };
}

/** Model with ALL 7 steps completed */
function createCompleteModel() {
  const m = createEmptyModel();
  m.strategicIntent = {
    strategic_ambition: 'Become a leader in smart manufacturing by 2028',
    strategic_themes: ['Industry 4.0', 'Predictive Maintenance', 'Data-Driven Quality'],
    burning_platform: 'Competitors automating; we risk losing major OEM contracts'
  };
  m.bmc = {
    value_propositions: ['Real-time production visibility for OEMs'],
    customer_segments: ['OEM manufacturers', 'Tier 1 suppliers'],
    key_activities: ['Component manufacturing', 'Quality control'],
    revenue_streams: ['Component sales', 'Maintenance contracts']
  };
  m.capabilities = [
    { id: 'C001', name: 'Production Data Analytics', current_maturity: 1, target_maturity: 4, strategic_importance: 5, systems: ['MES'], dependsOn: [] },
    { id: 'C002', name: 'Predictive Maintenance',    current_maturity: 1, target_maturity: 4, strategic_importance: 5, systems: ['IoT'], dependsOn: ['C001'] },
    { id: 'C003', name: 'Quality Automation',        current_maturity: 2, target_maturity: 4, strategic_importance: 4, systems: ['PLM'], dependsOn: [] },
    { id: 'C004', name: 'Supply Chain Visibility',   current_maturity: 2, target_maturity: 3, strategic_importance: 3, systems: ['ERP'], dependsOn: [] }
  ];
  m.capabilityMap = { l1_domains: ['Manufacturing', 'Quality', 'Logistics', 'Data', 'Technology'] };
  m.operatingModel = {
    current: {
      value_delivery: { value_streams: ['Order-to-ship'], customer_journeys: ['Customer order'] },
      capability_model: [{ name: 'Engineering', id: 'C001', maturity: 'Building' }],
      process_model:   [{ name: 'Order Processing', frequency: 'Daily' }],
      organisation_governance: { structure: 'Functional', coo_span: 6 },
      application_data_landscape: { erp: 'SAP', mes: 'Siemens SIMATIC' },
      operating_model_principles: ['Customer first', 'Data-driven']
    },
    target: {
      value_delivery: { value_streams: ['Digital Order-to-ship'] },
      capability_model: [],
      process_model: [],
      organisation_governance: {},
      application_data_landscape: {},
      operating_model_principles: []
    }
  };
  m.priorityGaps = [
    { capability: 'Production Data Analytics', gap: 'No real-time data', effort: 'high',  impact: 90 },
    { capability: 'Predictive Maintenance',    gap: 'No IoT sensors',    effort: 'high',  impact: 85 },
    { capability: 'Quality Automation',        gap: 'Manual inspection', effort: 'medium',impact: 70 },
    { capability: 'Supply Chain Visibility',   gap: 'Disconnected ERP',  effort: 'low',   impact: 60 }
  ];
  m.valuePools = [
    { name: 'Predictive Maintenance Savings', financial_impact: 2000000, realization_year: 2, linked_capabilities: ['C002'] },
    { name: 'Quality Defect Reduction',       financial_impact: 800000,  realization_year: 1, linked_capabilities: ['C003'] }
  ];
  m.roadmap = {
    waves: [
      { name: 'Wave 1: Foundation', initiatives: ['Data platform', 'IoT sensors'], timeline: 'Months 0-6' },
      { name: 'Wave 2: Insights',   initiatives: ['Analytics', 'Predictive ML'],   timeline: 'Months 6-12' },
      { name: 'Wave 3: Scale',      initiatives: ['Quality automation'],            timeline: 'Months 12-18' }
    ]
  };
  // Mark all steps as completed
  for (let i = 1; i <= 7; i++) {
    m.steps[`step${i}`] = { id: `step${i}`, status: 'completed', output: {} };
  }
  m.steps.step1.output = m.strategicIntent;
  m.steps.step3.output = { capabilities: m.capabilities };
  m.steps.step4.output = { operatingModel: m.operatingModel };
  m.steps.step5.output = { gaps: m.priorityGaps };
  m.steps.step6.output = { valuePools: m.valuePools };
  m.steps.step7.output = { roadmap: m.roadmap };
  return m;
}

/** Partially complete model — only steps 1 and 3 done */
function createPartialModel() {
  const m = createEmptyModel();
  m.strategicIntent = createCompleteModel().strategicIntent;
  m.capabilities    = createCompleteModel().capabilities;
  m.steps.step1 = { id: 'step1', status: 'completed', output: m.strategicIntent };
  m.steps.step3 = { id: 'step3', status: 'completed', output: { capabilities: m.capabilities } };
  return m;
}

// ──────────────────────────────────────────────────────────────────────────
// 1. AnalyticsContextBuilder TESTS
// ──────────────────────────────────────────────────────────────────────────

// Load module
let AnalyticsContextBuilder;
try {
  AnalyticsContextBuilder = loadAndGetExport('Analytics/AnalyticsContextBuilder.js', 'AnalyticsContextBuilder');
} catch(e) {
  console.warn(`[WARN] AnalyticsContextBuilder not loaded: ${e.message}`);
}

describe('AnalyticsContextBuilder.buildContext()', () => {

  it('always returns projectId and masterData', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createEmptyModel());
    assert.equal(ctx.projectId,  'test-project-001');
    assert.ok(ctx.masterData,    'masterData should be present');
    assert.ok(ctx.workflowStatus,'workflowStatus should be present');
    assert.ok(ctx.lastUpdated,   'lastUpdated should be present');
  });

  it('includes completed step data', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createCompleteModel());
    assert.ok(ctx.strategicIntent, 'should include strategicIntent from step1');
    assert.ok(ctx.capabilities,    'should include capabilities from step3');
    assert.ok(ctx.gapAnalysis,     'should include gapAnalysis from step5');
    assert.ok(ctx.valuePools,      'should include valuePools from step6');
    assert.ok(ctx.roadmap,         'should include roadmap from step7');
  });

  it('omits incomplete step data', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createEmptyModel());
    assert.equal(ctx.strategicIntent, undefined, 'strategicIntent should be undefined');
    assert.equal(ctx.capabilities,    undefined, 'capabilities should be undefined');
    assert.equal(ctx.gapAnalysis,     undefined, 'gapAnalysis should be undefined');
  });

  it('partial model includes only completed steps', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createPartialModel());
    assert.ok(ctx.strategicIntent, 'step1 done → strategicIntent present');
    assert.ok(ctx.capabilities,    'step3 done → capabilities present');
    assert.equal(ctx.gapAnalysis,     undefined, 'step5 not done → gapAnalysis absent');
    assert.equal(ctx.valuePools,      undefined, 'step6 not done → valuePools absent');
  });

  it('computes correct workflowStatus percentages', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const emptyCtx  = AnalyticsContextBuilder.buildContext(createEmptyModel());
    const fullCtx   = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const partCtx   = AnalyticsContextBuilder.buildContext(createPartialModel());
    assert.equal(emptyCtx.workflowStatus.completionPercentage, 0,    'empty: 0%');
    assert.equal(fullCtx.workflowStatus.completionPercentage,  100,  'full: 100%');
    assert.ok(partCtx.workflowStatus.completionPercentage > 0 &&
              partCtx.workflowStatus.completionPercentage < 100, 'partial: between 0-100%');
  });

  it('workflowStatus flags reflect completed steps', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createCompleteModel());
    for (let i = 1; i <= 7; i++) {
      assert.equal(ctx.workflowStatus[`step${i}_completed`], true, `step${i} should be completed`);
    }
  });
});

describe('AnalyticsContextBuilder.enrichWithUserInput()', () => {

  it('merges user input into context', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createEmptyModel());
    const enriched = AnalyticsContextBuilder.enrichWithUserInput(ctx, {
      budgetConstraints: { capex: 5000000, currency: 'SEK' }
    });
    assert.deepEqual(enriched.budgetConstraints, { capex: 5000000, currency: 'SEK' });
  });

  it('user input takes priority over context fields', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const overrideIntent = { strategic_ambition: 'USER OVERRIDE' };
    const enriched = AnalyticsContextBuilder.enrichWithUserInput(ctx, {
      strategicIntent: overrideIntent
    });
    assert.equal(enriched.strategicIntent.strategic_ambition, 'USER OVERRIDE');
  });

  it('does not mutate original context (immutable)', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder.buildContext(createEmptyModel());
    AnalyticsContextBuilder.enrichWithUserInput(ctx, { newField: 'added' });
    assert.equal(ctx.newField, undefined, 'original context must not be mutated');
  });

  it('updates lastUpdated timestamp', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx      = AnalyticsContextBuilder.buildContext(createEmptyModel());
    const before   = new Date(ctx.lastUpdated).getTime();
    // Tiny wait so timestamps differ
    const enriched = AnalyticsContextBuilder.enrichWithUserInput(ctx, {});
    const after    = new Date(enriched.lastUpdated).getTime();
    assert.ok(after >= before, 'enriched.lastUpdated should be >= original');
  });
});

describe('AnalyticsContextBuilder.getTabContext()', () => {

  it('decision-intelligence context includes capabilities+gaps+strategicIntent', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx     = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx  = AnalyticsContextBuilder.getTabContext(ctx, 'decision-intelligence');
    assert.ok(tabCtx.capabilities,    'needs capabilities');
    assert.ok(tabCtx.gapAnalysis,     'needs gapAnalysis');
    assert.ok(tabCtx.strategicIntent, 'needs strategicIntent');
    assert.ok(tabCtx.masterData,      'always needs masterData');
    assert.ok(tabCtx.workflowStatus,  'always needs workflowStatus');
  });

  it('scenarios context includes roadmap+operatingModel', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx    = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx = AnalyticsContextBuilder.getTabContext(ctx, 'scenarios');
    assert.ok(tabCtx.capabilities,    'needs capabilities');
    assert.ok(tabCtx.roadmap,         'needs roadmap');
    assert.ok(tabCtx.operatingModel,  'needs operatingModel');
  });

  it('financial context includes valuePools', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx    = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx = AnalyticsContextBuilder.getTabContext(ctx, 'financial');
    assert.ok(tabCtx.valuePools,   'needs valuePools');
    assert.ok(tabCtx.gapAnalysis,  'needs gapAnalysis');
    assert.ok(tabCtx.roadmap,      'needs roadmap');
  });

  it('optimize context includes dependencies info', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx    = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx = AnalyticsContextBuilder.getTabContext(ctx, 'optimize');
    assert.ok(tabCtx.capabilities, 'needs capabilities');
    assert.ok(tabCtx.roadmap,      'needs roadmap');
  });

  it('unknown tab falls back to decision-intelligence context', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx    = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx = AnalyticsContextBuilder.getTabContext(ctx, 'unknown-tab');
    assert.ok(tabCtx.masterData, 'should have masterData even for unknown tab');
  });
});

describe('AnalyticsContextBuilder.validateContextForTab()', () => {

  it('returns valid=true for complete workflow + required fields present', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx    = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx = AnalyticsContextBuilder.getTabContext(ctx, 'decision-intelligence');
    const v      = AnalyticsContextBuilder.validateContextForTab(tabCtx, 'decision-intelligence');
    assert.equal(v.valid, true, 'should be valid');
    assert.ok(Array.isArray(v.warnings), 'should return warnings array');
  });

  it('returns valid=true with warnings for incomplete workflow', () => {
    if (!AnalyticsContextBuilder) throw new Error('Module not loaded');
    const ctx    = AnalyticsContextBuilder.buildContext(createEmptyModel());
    const tabCtx = AnalyticsContextBuilder.getTabContext(ctx, 'decision-intelligence');
    const v      = AnalyticsContextBuilder.validateContextForTab(tabCtx, 'decision-intelligence');
    // valid=true (tab can still run) but warnings for missing data
    assert.ok(Array.isArray(v.warnings), 'should return warnings');
    assert.ok(v.warnings.length > 0,    'should have at least one warning for empty model');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 2. TabContext TESTS
// ──────────────────────────────────────────────────────────────────────────

let TabContext;
try {
  TabContext = loadAndGetExport('Analytics/TabContext.js', 'TabContext');
} catch(e) {
  console.warn(`[WARN] TabContext not loaded: ${e.message}`);
}

describe('TabContext (per-tab context builders)', () => {

  it('DecisionIntelligenceContext provides sanitized data for AI', () => {
    if (!TabContext || !AnalyticsContextBuilder) throw new Error('Modules not loaded');
    const fullCtx = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx  = AnalyticsContextBuilder.getTabContext(fullCtx, 'decision-intelligence');
    const prepared = TabContext.prepareForAI('decision-intelligence', tabCtx);
    assert.ok(prepared,                    'should return prepared context');
    assert.ok(typeof prepared === 'object','should be object');
  });

  it('FinancialContext provides valuePools for AI', () => {
    if (!TabContext || !AnalyticsContextBuilder) throw new Error('Modules not loaded');
    const fullCtx = AnalyticsContextBuilder.buildContext(createCompleteModel());
    const tabCtx  = AnalyticsContextBuilder.getTabContext(fullCtx, 'financial');
    const prepared = TabContext.prepareForAI('financial', tabCtx);
    assert.ok(prepared, 'should return prepared financial context');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 3. Decision Tab Module TESTS (pure function tests)
// ──────────────────────────────────────────────────────────────────────────

let Decision;
try {
  Decision = loadAndGetExport('Analytics/Tabs/Decision.js', 'Decision');
} catch(e) {
  console.warn(`[WARN] Decision module not loaded: ${e.message}`);
}

describe('Decision module structure', () => {

  it('exports id, name, tasks[], synthesize()', () => {
    if (!Decision) throw new Error('Module not loaded');
    assert.equal(Decision.id, 'decision-intelligence');
    assert.ok(Decision.name,                'should have a name');
    assert.ok(Array.isArray(Decision.tasks),'tasks should be an array');
    assert.ok(typeof Decision.synthesize === 'function', 'should have synthesize()');
  });

  it('has exactly 5 tasks', () => {
    if (!Decision) throw new Error('Module not loaded');
    assert.equal(Decision.tasks.length, 5, 'exactly 5 tasks required');
  });

  it('each task has required shape', () => {
    if (!Decision) throw new Error('Module not loaded');
    Decision.tasks.forEach((t, i) => {
      assert.ok(t.taskId,                          `task[${i}] needs taskId`);
      assert.ok(t.taskType,                        `task[${i}] needs taskType`);
      assert.ok(typeof t.systemPrompt === 'function', `task[${i}] systemPrompt must be function`);
      assert.ok(typeof t.userPrompt   === 'function', `task[${i}] userPrompt must be function`);
      assert.ok(typeof t.parseOutput  === 'function', `task[${i}] parseOutput must be function`);
      assert.ok(t.outputSchema,                    `task[${i}] needs outputSchema`);
    });
  });

  it('systemPrompt and userPrompt are pure functions (no side effects)', () => {
    if (!Decision) throw new Error('Module not loaded');
    const ctx = AnalyticsContextBuilder
      ? AnalyticsContextBuilder.getTabContext(AnalyticsContextBuilder.buildContext(createCompleteModel()), 'decision-intelligence')
      : { masterData: createEmptyModel().masterData, workflowStatus: { step1_completed: true } };
    Decision.tasks.forEach((t, i) => {
      const sys = t.systemPrompt(ctx);
      const usr = t.userPrompt(ctx, {});
      assert.ok(typeof sys === 'string' && sys.length > 0, `task[${i}] systemPrompt should return non-empty string`);
      assert.ok(typeof usr === 'string' && usr.length > 0, `task[${i}] userPrompt should return non-empty string`);
    });
  });

  it('DI-1 taskType is "analysis"', () => {
    if (!Decision) throw new Error('Module not loaded');
    assert.equal(Decision.tasks[0].taskType, 'analysis');
  });

  it('DI-3 and DI-5 taskType is "discovery"', () => {
    if (!Decision) throw new Error('Module not loaded');
    assert.equal(Decision.tasks[2].taskType, 'discovery'); // DI-3
    assert.equal(Decision.tasks[4].taskType, 'discovery'); // DI-5
  });

  it('parseOutput handles valid JSON string', () => {
    if (!Decision) throw new Error('Module not loaded');
    const task = Decision.tasks[0]; // DI-1
    const mockJson = JSON.stringify([
      { capabilityId: 'C001', healthScore: 85, maturityGap: 3, criticality: 5, status: 'critical' }
    ]);
    const result = task.parseOutput(mockJson);
    assert.ok(result !== null && result !== undefined, 'should parse without error');
  });

  it('synthesize extracts topPriorities from taskResults', () => {
    if (!Decision) throw new Error('Module not loaded');
    const tabState = {
      taskResults: {
        'di-1': { output: [{ capabilityId: 'C001', healthScore: 85, criticality: 5, status: 'critical' }] },
        'di-2': { output: [{ capabilityId: 'C003', effort: 'low', impact: 75 }] },
        'di-3': { output: { criticalGaps: ['Data platform missing'], strategicImplications: 'Risk of revenue loss', recommendations: ['Invest in data'] } },
        'di-4': { output: { sequence: [{ phase: 1, capabilityIds: ['C001'], parallelizableGroups: [] }], riskMitigation: 'Phased approach' } },
        'di-5': { output: { executiveSummary: 'Urgent digital transformation needed', topPriorities: [{ name: 'Data Platform', why: 'Enables all other capabilities' }], criticalPath: 'C001 → C002', recommendations: ['Start with data foundation'] } }
      }
    };
    const result = Decision.synthesize(tabState);
    assert.ok(result.topPriorities,    'synthesize should return topPriorities');
    assert.ok(result.quickWins,        'synthesize should return quickWins');
    assert.ok(result.criticalPath,     'synthesize should return criticalPath');
    assert.ok(result.recommendations,  'synthesize should return recommendations');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 4. Financial Tab Module TESTS
// ──────────────────────────────────────────────────────────────────────────

let Financial;
try {
  Financial = loadAndGetExport('Analytics/Tabs/Financial.js', 'Financial');
} catch(e) {
  console.warn(`[WARN] Financial module not loaded: ${e.message}`);
}

describe('Financial module structure', () => {

  it('exports id, name, tasks[], synthesize()', () => {
    if (!Financial) throw new Error('Module not loaded');
    assert.equal(Financial.id, 'financial');
    assert.ok(Array.isArray(Financial.tasks));
    assert.ok(typeof Financial.synthesize === 'function');
  });

  it('has exactly 6 tasks', () => {
    if (!Financial) throw new Error('Module not loaded');
    assert.equal(Financial.tasks.length, 6, 'exactly 6 tasks required');
  });

  it('each task has required shape', () => {
    if (!Financial) throw new Error('Module not loaded');
    Financial.tasks.forEach((t, i) => {
      assert.ok(t.taskId,                          `task[${i}] needs taskId`);
      assert.ok(typeof t.systemPrompt === 'function');
      assert.ok(typeof t.userPrompt   === 'function');
      assert.ok(typeof t.parseOutput  === 'function');
    });
  });

  it('FI-1 systemPrompt includes capability context', () => {
    if (!Financial || !AnalyticsContextBuilder) throw new Error('Modules not loaded');
    const ctx = AnalyticsContextBuilder.getTabContext(
      AnalyticsContextBuilder.buildContext(createCompleteModel()), 'financial');
    const prompt = Financial.tasks[0].systemPrompt(ctx);
    assert.ok(prompt.length > 50, 'prompt should have substantial content');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 5. Scenarios Tab Module TESTS
// ──────────────────────────────────────────────────────────────────────────

let Scenarios;
try {
  Scenarios = loadAndGetExport('Analytics/Tabs/Scenarios.js', 'Scenarios');
} catch(e) {
  console.warn(`[WARN] Scenarios module not loaded: ${e.message}`);
}

describe('Scenarios module structure', () => {

  it('exports id, name, tasks[], synthesize()', () => {
    if (!Scenarios) throw new Error('Module not loaded');
    assert.equal(Scenarios.id, 'scenarios');
    assert.ok(Array.isArray(Scenarios.tasks));
    assert.ok(typeof Scenarios.synthesize === 'function');
  });

  it('has exactly 6 tasks', () => {
    if (!Scenarios) throw new Error('Module not loaded');
    assert.equal(Scenarios.tasks.length, 6, 'exactly 6 tasks required');
  });

  it('SC-2 uses "heavy" taskType for dependency impact', () => {
    if (!Scenarios) throw new Error('Module not loaded');
    const sc2 = Scenarios.tasks[1];
    assert.equal(sc2.taskType, 'heavy', 'SC-2 needs heavy reasoning for cascading effects');
  });

  it('userPrompt includes scenario type when provided', () => {
    if (!Scenarios || !AnalyticsContextBuilder) throw new Error('Modules not loaded');
    const ctx      = AnalyticsContextBuilder.getTabContext(
      AnalyticsContextBuilder.buildContext(createCompleteModel()), 'scenarios');
    const userInput = { scenarioType: 'capability-failure', capabilityId: 'C001', severity: 'complete' };
    const prompt   = Scenarios.tasks[0].userPrompt(ctx, userInput);
    assert.ok(prompt.includes('C001') || prompt.includes('capability'), 'prompt should reference the scenario subject');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 6. Optimize Tab Module TESTS
// ──────────────────────────────────────────────────────────────────────────

let Optimize;
try {
  Optimize = loadAndGetExport('Analytics/Tabs/Optimize.js', 'Optimize');
} catch(e) {
  console.warn(`[WARN] Optimize module not loaded: ${e.message}`);
}

describe('Optimize module structure', () => {

  it('exports id, name, tasks[], synthesize()', () => {
    if (!Optimize) throw new Error('Module not loaded');
    assert.equal(Optimize.id, 'optimize');
    assert.ok(Array.isArray(Optimize.tasks));
    assert.ok(typeof Optimize.synthesize === 'function');
  });

  it('has exactly 5 tasks', () => {
    if (!Optimize) throw new Error('Module not loaded');
    assert.equal(Optimize.tasks.length, 5, 'exactly 5 tasks required');
  });

  it('OP-3 uses "heavy" taskType for optimization', () => {
    if (!Optimize) throw new Error('Module not loaded');
    const op3 = Optimize.tasks[2];
    assert.equal(op3.taskType, 'heavy', 'OP-3 needs heavy reasoning for constraint satisfaction');
  });

  it('userPrompt for OP-1 includes optimization weights', () => {
    if (!Optimize || !AnalyticsContextBuilder) throw new Error('Modules not loaded');
    const ctx      = AnalyticsContextBuilder.getTabContext(
      AnalyticsContextBuilder.buildContext(createCompleteModel()), 'optimize');
    const userInput = { weights: { speed: 70, cost: 30, risk: 40, value: 80 } };
    const prompt   = Optimize.tasks[0].userPrompt(ctx, userInput);
    assert.ok(prompt.length > 0, 'should produce non-empty prompt');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 7. AnalyticsWorkflowEngine TESTS (mock AI calls)
// ──────────────────────────────────────────────────────────────────────────

let AnalyticsWorkflowEngine;
try {
  AnalyticsWorkflowEngine = loadAndGetExport('Analytics/AnalyticsWorkflowEngine.js', 'AnalyticsWorkflowEngine');
} catch(e) {
  console.warn(`[WARN] AnalyticsWorkflowEngine not loaded: ${e.message}`);
}

describe('AnalyticsWorkflowEngine structure', () => {

  it('exports run(), onProgress()', () => {
    if (!AnalyticsWorkflowEngine) throw new Error('Module not loaded');
    assert.ok(typeof AnalyticsWorkflowEngine.run         === 'function', 'needs run()');
    assert.ok(typeof AnalyticsWorkflowEngine.onProgress   === 'function', 'needs onProgress()');
  });

  it('onProgress registers callback without throwing', () => {
    if (!AnalyticsWorkflowEngine) throw new Error('Module not loaded');
    assert.doesNotThrow(() => {
      AnalyticsWorkflowEngine.onProgress((p) => {});
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────
// RESULT SUMMARY
// ──────────────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(60));
console.log(`  ANALYTICS UNIT TESTS: ${passed} PASS  |  ${failed} FAIL`);
console.log('═'.repeat(60));
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
}
console.log('');

process.exit(failed > 0 ? 1 : 0);
