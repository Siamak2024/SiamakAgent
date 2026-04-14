/**
 * E2E Browser Test — Autopilot Mode (Fully Automated, No User Input)
 *
 * Scenario: Real estate company, Sverige, Fastighet, Medium detail
 * Tests: Full autopilot flow + Step4 Operating Model 6-block validation
 *
 * Usage: node scripts/e2e_autopilot_browser.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL  = 'http://localhost:3000';
const PAGE_URL  = `${BASE_URL}/NexGenEA/NexGen_EA_V4.html`;
const TEST_PROJECT_NAME = 'E2E Test Project - Real Estate Autopilot';
const TEST_PROJECT_DESC = 'Automated E2E test scenario for Swedish real estate company with legacy systems. Generated on ' + new Date().toISOString();
const COMPANY   = 'A mid-size Swedish real estate company with legacy ERP and property management platforms causing heavily manual administration, personal dependency and poor data quality. Goal is to digitise core operations and improve ESG reporting.';
const STEP_TIMEOUT = 180_000; // 3 min per AI batch

let testProjectId = null; // Track project ID for cleanup

const artifactsDir = path.resolve('e2e-artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(),
  scenario: 'Autopilot — Real Estate, Sverige, Medium',
  testProjectName: TEST_PROJECT_NAME,
  testProjectId: null, // Will be set after project creation
  steps: [], consoleErrors: [], pageErrors: [], warnings: []
};

function log(msg) {
  console.log(`[${new Date().toISOString().split('T')[1].replace('Z','')}] ${msg}`);
}
function addStep(name, status, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`${icon} ${name}${detail ? ': ' + detail : ''}`);
  report.steps.push({ name, status, detail, at: new Date().toISOString() });
}

// Graceful shutdown on unhandled errors
process.on('unhandledRejection', async (err) => {
  log(`[FATAL] Unhandled rejection: ${err?.message || err}`);
  report.pageErrors.push(String(err?.message || err));
  await writeReport();
  process.exit(1);
});

async function writeReport() {
  report.finishedAt = new Date().toISOString();
  report.summary = {
    total: report.steps.length,
    pass:  report.steps.filter(s => s.status === 'PASS').length,
    fail:  report.steps.filter(s => s.status === 'FAIL').length,
    warn:  report.steps.filter(s => s.status === 'WARN').length,
    consoleErrors: report.consoleErrors.length,
    pageErrors:    report.pageErrors.length,
  };
  const file = path.join(artifactsDir, 'autopilot_browser_report.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  log(`\nReport: ${file}`);

  const { total, pass, fail, warn } = report.summary;
  log(`\n${'═'.repeat(55)}`);
  log(`  AUTOPILOT E2E RESULT: ${pass}/${total} PASS  |  ${fail} FAIL  |  ${warn} WARN`);
  log(`${'═'.repeat(55)}\n`);
  if (fail > 0) {
    log('FAILED checks:');
    report.steps.filter(s => s.status === 'FAIL').forEach(s => log(`  ✗ ${s.name}: ${s.detail}`));
  }
}

async function screenshot(page, name) {
  try {
    const file = path.join(artifactsDir, `ap_${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    log(`  Screenshot → ap_${name}.png`);
  } catch(e) { log(`  Screenshot failed: ${e.message}`); }
}

async function waitFor(page, selector, timeout = STEP_TIMEOUT) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch { return false; }
}

// ── LAUNCH ─────────────────────────────────────────────────────────────────
log('Launching browser...');
const browser  = await chromium.launch({ channel: 'msedge', headless: false, slowMo: 150 });
const context  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page     = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') {
    report.consoleErrors.push(msg.text());
    log(`  [ERR] ${msg.text().slice(0, 200)}`);
  } else if (msg.type() === 'warning') {
    report.warnings.push(msg.text());
    log(`  [WARN] ${msg.text().slice(0, 300)}`);
  } else if (msg.text().includes('[Step4]') || msg.text().includes('[StepEngine]') || msg.text().includes('[OutputValidator]')) {
    log(`  [LOG] ${msg.text().slice(0, 200)}`);
  }
});
page.on('pageerror', err => {
  report.pageErrors.push(err.message);
  log(`  [PAGE ERR] ${err.message.slice(0, 200)}`);
});

// ── 1. OPEN PAGE ────────────────────────────────────────────────────────────
log('Opening page...');
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 30_000 });

// Inject API key into localStorage so the app does not show a key-missing gate.
// Actual AI calls are proxied through the local server (server.js), not the browser.
await page.evaluate(() => {
  localStorage.setItem('ea_api_key', 'server-proxy');
});
log('  API key injected into localStorage');

await screenshot(page, '01_load');
addStep('Page load', 'PASS');

// ── 2. CREATE NEW PROJECT VIA DIALOG ────────────────────────────────────────
log('Filling out Create New Project dialog...');

// Wait for and fill project name field
const projectNameInput = page.locator('#newProjectName');
if (await projectNameInput.isVisible({ timeout: 8000 }).catch(() => false)) {
  await projectNameInput.fill(TEST_PROJECT_NAME);
  log(`  Project name: ${TEST_PROJECT_NAME}`);
} else {
  addStep('Create Project dialog', 'WARN', 'Dialog not visible - may already be bypassed');
}

// Fill project description
const projectDescInput = page.locator('#newProjectDescription');
if (await projectDescInput.isVisible({ timeout: 2000 }).catch(() => false)) {
  await projectDescInput.fill(TEST_PROJECT_DESC);
  log('  Project description filled');
}

// Click "Create Project" button
const createProjectBtn = page.locator('button').filter({ hasText: /Create Project/i }).first();
if (await createProjectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  await createProjectBtn.click();
  await page.waitForTimeout(1200);
  log('  ✓ Project created via dialog');
  addStep('Create New Project dialog', 'PASS', TEST_PROJECT_NAME);
} else {
  // Fallback: try old flow if dialog doesn't appear
  const createBtn = page.locator('button').filter({ hasText: /Create New Project/i }).first();
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(800);
    log('  Created new project (fallback)');
    addStep('Create New Project', 'WARN', 'Used fallback flow');
  }
}

// Capture project ID from window.currentModelId for cleanup
testProjectId = await page.evaluate(() => window.currentModelId || null);
report.testProjectId = testProjectId; // Save to report for inspection
log(`  Captured project ID for cleanup: ${testProjectId}`);

// Set description in DOM (even if hidden)
await page.evaluate(desc => {
  const el = document.getElementById('description');
  if (el) { el.value = desc; el.dispatchEvent(new Event('input', { bubbles: true })); }
  // Also store in model for StepContext
  if (window.model) window.model.description = desc;
}, COMPANY);
addStep('Company description set', 'PASS');

// ── 3. TRIGGER AUTOPILOT MODE ───────────────────────────────────────────────
log('Starting Autopilot mode...');
// Try clicking the DOM button first (discovery mode card), else call via JS
const autopilotBtn = page.locator('button[onclick*="startAutopilotMode"]').first();
if (await autopilotBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  await autopilotBtn.click();
  log('  Clicked Autopilot button in UI');
} else {
  await page.evaluate(() => { if (typeof startAutopilotMode === 'function') startAutopilotMode(); });
  log('  Called startAutopilotMode() via JS');
}
await page.waitForTimeout(1500);
await screenshot(page, '02_autopilot_start');

// ── 4-7. SET AUTOPILOT CONTEXT ──────────────────────────────────────────────
// Always call JS functions unconditionally — button visibility is informational only.
// These functions set _autopilotState.context.region / industry / detailLevel / companyDescription
// (which StepContext now reads as fallback for companyDescription).

const regionQ = await waitFor(page, 'button[onclick*="setAutopilotRegion"]', 5_000);
addStep('Autopilot Q1 region button appeared', regionQ ? 'PASS' : 'WARN',
  regionQ ? '' : 'Buttons not in viewport — using JS fallback');
await page.evaluate(() => { if (typeof setAutopilotRegion === 'function') setAutopilotRegion('Sverige'); });
await page.waitForTimeout(800);
log('  Set region: Sverige');

const industryQ = await waitFor(page, 'button[onclick*="setAutopilotIndustry"]', 5_000);
addStep('Autopilot Q2 industry button appeared', industryQ ? 'PASS' : 'WARN',
  industryQ ? '' : 'Buttons not in viewport — using JS fallback');
await page.evaluate(() => { if (typeof setAutopilotIndustry === 'function') setAutopilotIndustry('Fastighet'); });
await page.waitForTimeout(800);
log('  Set industry: Fastighet');

const detailQ = await waitFor(page, 'button[onclick*="setAutopilotDetailLevel"]', 5_000);
addStep('Autopilot Q3 detail level button appeared', detailQ ? 'PASS' : 'WARN',
  detailQ ? '' : 'Buttons not in viewport — using JS fallback');
await page.evaluate(() => { if (typeof setAutopilotDetailLevel === 'function') setAutopilotDetailLevel('medium'); });
await page.waitForTimeout(1500);
log('  Set detail level: medium');

// ── 8. INJECT COMPANY DESCRIPTION ──────────────────────────────────────────
// Inject directly into _autopilotState.context AND model.description.
// StepContext._getDescription() now falls back to both (no need to type in chat).
log('  Injecting company description into autopilot context...');
await page.evaluate((desc) => {
  if (window._autopilotState) {
    window._autopilotState.awaitingCompanyDescription = false;
    window._autopilotState.context = window._autopilotState.context || {};
    window._autopilotState.context.companyDescription = desc;
  }
  if (window.model) window.model.description = desc;
  const el = document.getElementById('description');
  if (el) { el.value = desc; el.dispatchEvent(new Event('input', { bubbles: true })); }
}, COMPANY);
await page.waitForTimeout(500);
await screenshot(page, '03_context_set');
addStep('Autopilot context injected (region/industry/detail/company)', 'PASS');

// ── 9. LAUNCH FULL AUTOPILOT FLOW ──────────────────────────────────────────
log('Launching Full Autopilot flow (all 7 steps)...');
await page.evaluate(() => { if (typeof runFullAutopilotFlow === 'function') runFullAutopilotFlow(); });
await page.waitForTimeout(1000);
await screenshot(page, '04_autopilot_running');
addStep('Full Autopilot flow launched', 'PASS');

// ── 10. WAIT FOR AUTOPILOT TO RUN ALL STEPS ────────────────────────────────
log('Waiting for Autopilot to complete all 7 steps (this takes several minutes)...');

const AUTOPILOT_TOTAL_TIMEOUT = 20 * 60 * 1000; // 20 min
const startTime = Date.now();
let autopilotDone = false;
let lastStepCount = 0;

while (Date.now() - startTime < AUTOPILOT_TOTAL_TIMEOUT) {
  const state = await page.evaluate(() => ({
    running:        window._autopilotState?.running,
    active:         window._autopilotState?.active,
    completedSteps: window._autopilotState?.completedSteps || [],
  })).catch(() => ({}));

  const doneCount = state.completedSteps?.length || 0;
  if (doneCount !== lastStepCount) {
    lastStepCount = doneCount;
    log(`  [${Math.round((Date.now()-startTime)/1000)}s] Completed steps: ${doneCount}/7 → ${(state.completedSteps||[]).join(', ')}`);
  }

  // Done: running=false means runFullAutopilotFlow finished (or errored)
  if (state.running === false && (doneCount > 0 || state.active === false)) {
    autopilotDone = doneCount >= 7;
    log(`  Autopilot flow ended. completedSteps=${doneCount}, running=${state.running}, active=${state.active}`);
    break;
  }

  await page.waitForTimeout(10_000);
}

await screenshot(page, '05_autopilot_complete');
addStep('Autopilot completed all 7 steps', autopilotDone ? 'PASS' : 'FAIL',
  autopilotDone ? 'All steps finished' : `Timed out — only ${lastStepCount}/7 steps done`);

// ── 11. VALIDATE MODEL DATA ─────────────────────────────────────────────────
log('Validating model data...');

// ── STEP 4 DIAGNOSTICS: dump raw task answers BEFORE validation ──────────
const step4Diag = await page.evaluate(() => {
  const s4 = window.model?.steps?.step4 || {};
  const cur = s4.answers?.step4_current_op_model;
  const tgt = s4.answers?.step4_target_op_model;
  const delta = s4.answers?.step4_op_model_delta;
  return {
    status: s4.status || 'N/A',
    error: s4.error || null,
    completedTasks: s4.completedTasks || [],
    curKeys: Object.keys(cur || {}),
    tgtKeys: Object.keys(tgt || {}),
    deltaKeys: Object.keys(delta || {}),
    curSample: JSON.stringify(cur).slice(0, 400),
    omDirectKeys: Object.keys(window.model?.operatingModel?.current || {}),
  };
}).catch(() => ({}));
log(`  [STEP4-DIAG] status=${step4Diag.status}, error=${step4Diag.error}`);
log(`  [STEP4-DIAG] completedTasks=${(step4Diag.completedTasks||[]).join(',')}`);
log(`  [STEP4-DIAG] step4_current_op_model keys: ${(step4Diag.curKeys||[]).join(',')}`);
log(`  [STEP4-DIAG] model.operatingModel.current keys: ${(step4Diag.omDirectKeys||[]).join(',')}`);
log(`  [STEP4-DIAG] raw current OM: ${step4Diag.curSample || '(empty)'}`);
report.step4Diagnostics = step4Diag;
// ── END STEP 4 DIAGNOSTICS ────────────────────────────────────────────────

const modelData = await page.evaluate(() => {
  const m = window.model || {};
  const om = m.operatingModel || {};
  const cur = om.current || {};
  const tgt = om.target  || {};
  const delta = m.operatingModelDelta || {};
  return {
    hasStrategicIntent: !!(m.strategicIntent?.strategic_ambition || m.strategicIntent?.burning_platform),
    hasBmc:             !!(m.bmc),
    bmcValueProp:       m.bmc?.value_proposition || m.bmc?.value_propositions?.[0] || '',
    capCount:           (m.capabilities || []).length,
    capMapDomains:      (m.capabilityMap?.l1_domains || []).length,
    om: {
      hasCurrent:   !!(cur.value_delivery || cur.capability_model),
      hasTarget:    !!(tgt.value_delivery || tgt.capability_model),
      hasDelta:     !!(delta.dimension_gaps?.length),
      block1:       !!cur.value_delivery,
      block2count:  Array.isArray(cur.capability_model) ? cur.capability_model.length : 0,
      block3count:  Array.isArray(cur.process_model) ? cur.process_model.length : 0,
      block4:       !!cur.organisation_governance,
      block5:       !!cur.application_data_landscape,
      block6count:  Array.isArray(cur.operating_model_principles) ? cur.operating_model_principles.length : 0,
      archetype:    cur.metadata?.model_archetype || '',
      changeReady:  delta.change_readiness?.score ?? null,
    },
    hasPriorityGaps: !!(m.priorityGaps?.length || m.gapAnalysis?.gaps?.length),
    hasValuePools:   !!(m.valuePools?.length),
    hasRoadmap:      !!(m.roadmap || m.initiatives?.length),
    targetArchDone:  !!m.targetArchDone,
  };
});

// Core data checks
addStep('Step 1: Strategic Intent',  modelData.hasStrategicIntent ? 'PASS' : 'FAIL');
addStep('Step 2: BMC',               modelData.hasBmc             ? 'PASS' : 'FAIL',
  modelData.bmcValueProp ? modelData.bmcValueProp.slice(0, 80) : '');
addStep('Step 3: Capabilities',      modelData.capCount > 0       ? 'PASS' : 'FAIL',
  `${modelData.capCount} capabilities, ${modelData.capMapDomains} domains`);

// Step 4: Operating Model 6-block validation
addStep('Step 4: OM current populated',     modelData.om.hasCurrent   ? 'PASS' : 'FAIL');
addStep('Step 4: OM target populated',      modelData.om.hasTarget    ? 'PASS' : 'WARN');
addStep('Step 4: OM delta populated',       modelData.om.hasDelta     ? 'PASS' : 'WARN',
  modelData.om.changeReady !== null ? `Change readiness: ${(modelData.om.changeReady * 100).toFixed(0)}%` : '');
addStep('Step 4 Block 1: Value Delivery',       modelData.om.block1         ? 'PASS' : 'FAIL');
addStep('Step 4 Block 2: Capability Model',     modelData.om.block2count > 0 ? 'PASS' : 'FAIL',
  `${modelData.om.block2count} capabilities`);
addStep('Step 4 Block 3: Process Model',        modelData.om.block3count > 0 ? 'PASS' : 'FAIL',
  `${modelData.om.block3count} processes`);
addStep('Step 4 Block 4: Org & Governance',     modelData.om.block4         ? 'PASS' : 'FAIL');
addStep('Step 4 Block 5: App & Data Landscape', modelData.om.block5         ? 'PASS' : 'FAIL');
addStep('Step 4 Block 6: Principles',           modelData.om.block6count > 0 ? 'PASS' : 'FAIL',
  `${modelData.om.block6count} principles`);

addStep('Step 5: Gap Analysis data',    modelData.hasPriorityGaps ? 'PASS' : 'FAIL');
addStep('Step 6: Value Pools data',     modelData.hasValuePools   ? 'PASS' : 'FAIL');
addStep('Step 7: Roadmap/initiatives',  modelData.hasRoadmap      ? 'PASS' : 'FAIL');

// ── 12. VALIDATE TABS RENDER ────────────────────────────────────────────────
log('Validating UI tab rendering...');

const tabs = [
  { id: 'opmodel',    label: 'Op Model tab',    content: '#opmodel-content' },
  { id: 'gap',        label: 'Gap tab',          content: '#insights' },
  { id: 'valuepools', label: 'Value Pools tab',  content: '#valuepools-content' },
  { id: 'targetarch', label: 'Target Arch tab',  content: '#targetarch-content' },
  { id: 'roadmapvis', label: 'Roadmap tab',       content: '#roadmapvis-content' },
];

for (const tab of tabs) {
  try {
    await page.evaluate(id => { if (typeof showTab === 'function') showTab(id); }, tab.id);
    await page.waitForTimeout(600);
    const text = await page.$eval(tab.content, el => el.innerText || el.textContent || '').catch(() => '');
    const rendered = text.length > 50;
    addStep(`Tab: ${tab.label} renders`, rendered ? 'PASS' : 'FAIL',
      rendered ? text.slice(0, 80) + '...' : 'Empty or placeholder');
    await screenshot(page, `06_tab_${tab.id}`);
  } catch(e) {
    addStep(`Tab: ${tab.label} renders`, 'FAIL', e.message);
  }
}

// ── 13. VALIDATE OM TAB — 6 SECTION HEADERS ─────────────────────────────────
log('Checking Op Model tab 6-block section headers...');
await page.evaluate(() => { if (typeof showTab === 'function') showTab('opmodel'); });
await page.waitForTimeout(600);

const omSections = await page.evaluate(() => {
  const content = document.getElementById('opmodel-content');
  if (!content) return [];
  // Look for omcell-title elements (the 6 block headers)
  return Array.from(content.querySelectorAll('.omcell-title')).map(el => el.textContent.trim());
}).catch(() => []);

const expectedBlocks = [
  'Value Delivery', 'Capability Model', 'Process Model',
  'Organisation', 'Application', 'Principles'
];
const foundBlocks = expectedBlocks.filter(b =>
  omSections.some(s => s.toLowerCase().includes(b.toLowerCase()))
);
addStep(`Op Model: ${foundBlocks.length}/6 block sections rendered`,
  foundBlocks.length >= 4 ? 'PASS' : foundBlocks.length > 0 ? 'WARN' : 'FAIL',
  `Found: ${omSections.slice(0,8).join(' | ')}`);

// Check AS-IS / TO-BE tabs exist
const asIsBtn  = await page.$('button[onclick*="_omTab=\'current\'"]');
const toBeBtn  = await page.$('button[onclick*="_omTab=\'target\'"]');
addStep('Op Model: AS-IS / TO-BE tabs present',
  asIsBtn && toBeBtn ? 'PASS' : 'WARN',
  `AS-IS: ${!!asIsBtn}, TO-BE: ${!!toBeBtn}`);

await screenshot(page, '07_opmodel_final');

// ── CLEANUP: DELETE TEST PROJECT ───────────────────────────────────────────
log('Cleaning up test data...');
if (testProjectId) {
  const deleted = await page.evaluate((projectId) => {
    try {
      // Use EA_DataManager to delete the project
      if (window.dataManager && typeof window.dataManager.deleteProject === 'function') {
        const result = window.dataManager.deleteProject(projectId);
        console.log(`[E2E Cleanup] Deleted project ${projectId}: ${result}`);
        return result;
      }
      // Fallback: manual localStorage cleanup
      const projects = JSON.parse(localStorage.getItem('ea_projects') || '{}');
      delete projects[projectId];
      localStorage.setItem('ea_projects', JSON.stringify(projects));
      localStorage.removeItem('ea_current_project');
      console.log(`[E2E Cleanup] Deleted project ${projectId} (fallback)`);
      return true;
    } catch (e) {
      console.error('[E2E Cleanup] Failed to delete project:', e);
      return false;
    }
  }, testProjectId);
  
  if (deleted) {
    log(`  ✓ Test project deleted: ${testProjectId}`);
    addStep('Cleanup: Delete test project', 'PASS', testProjectId);
  } else {
    log(`  ✗ Failed to delete test project: ${testProjectId}`);
    addStep('Cleanup: Delete test project', 'WARN', 'Deletion failed - may need manual cleanup');
  }
} else {
  log('  ⚠ No project ID captured - skipping cleanup');
  addStep('Cleanup: Delete test project', 'WARN', 'No project ID to clean up');
}

// ── CLOSE & REPORT ──────────────────────────────────────────────────────────
await browser.close();
await writeReport();
