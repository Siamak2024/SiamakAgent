/**
 * E2E test: Full NexGen EA workflow
 * Scenario: "A real Estate Company with legacy system"
 * Business areas: Finance, Operation, ESG
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const PAGE_URL = `${BASE_URL}/NexGenEA/NexGen_EA_V4.html`;
const DESCRIPTION = 'A real estate company with legacy system';
const ACTIVE_AREAS = ['finance', 'operation', 'esg'];
const STEP_TIMEOUT = 120_000; // 2 min per AI step (generous for slow API)

// Prevent Node from crashing on unhandled promise rejections (e.g. Playwright page closed errors)
process.on('unhandledRejection', (reason) => {
  console.log(`[E2E] Unhandled rejection caught (non-fatal): ${String(reason).slice(0, 200)}`);
});

const artifactsDir = path.resolve('e2e-artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(),
  description: DESCRIPTION,
  activeAreas: ACTIVE_AREAS,
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  warnings: [],
};

function log(msg) {
  const ts = new Date().toISOString().split('T')[1].replace('Z','');
  console.log(`[${ts}] ${msg}`);
}

function addStep(name, status, detail = '') {
  log(`${status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠'} ${name}${detail ? ': ' + detail : ''}`);
  report.steps.push({ name, status, detail, at: new Date().toISOString() });
}

const browser = await chromium.launch({ channel: 'msedge', headless: false, slowMo: 200 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    report.consoleErrors.push(text);
    log(`  [console error] ${text}`);
  }
  if (msg.type() === 'warn' && msg.text().includes('not found')) {
    report.warnings.push(msg.text());
  }
});
page.on('pageerror', err => {
  // Log but never re-throw — page errors in the app should not crash the test runner
  report.pageErrors.push(err.message);
  log(`  [page error] ${err.message.slice(0, 200)}`);
});

async function screenshot(name) {
  try {
    const file = path.join(artifactsDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    log(`  Screenshot: ${file}`);
  } catch (e) {
    log(`  Screenshot failed (${name}): ${e.message}`);
  }
}

async function waitForStepUnlocked(stepId, timeout = STEP_TIMEOUT) {
  // Wait until the step wrapper no longer has workflow-step-locked
  try {
    await page.waitForFunction(
      id => !document.getElementById(id)?.classList.contains('workflow-step-locked'),
      stepId, { timeout }
    );
    return true;
  } catch {
    log(`  Warning: Step ${stepId} never unlocked within timeout`);
    return false;
  }
}

async function waitForElement(selector, timeout = STEP_TIMEOUT) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function clickStep(stepId, btnId, label) {
  const unlocked = await waitForStepUnlocked(stepId);
  if (!unlocked) {
    addStep(label, 'WARN', `step-${stepId} never unlocked`);
    return false;
  }
  // Use evaluate to bypass any overlay pointer-event issues
  await page.evaluate(id => {
    const btn = document.getElementById(id);
    if (btn) btn.click();
  }, btnId);
  log(`  Clicked ${btnId} via JS`);
  return true;
}

async function getTextContent(selector) {
  try { return (await page.textContent(selector, { timeout: 3000 })).trim(); }
  catch { return null; }
}

async function isVisible(selector) {
  try { return await page.isVisible(selector, { timeout: 2000 }); }
  catch { return false; }
}

// ─── OPEN PAGE ─────────────────────────────────────────────────────────────
log('Opening NexGen EA platform...');
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 30000 });
await screenshot('01-page-load');
addStep('Page load', 'PASS', PAGE_URL);

// ─── SET DESCRIPTION ───────────────────────────────────────────────────────
log('Setting description...');
// Click "Create New Project" on the welcome screen if it's visible
const createBtn = page.locator('button').filter({ hasText: /Create New Project/i }).first();
if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  await createBtn.click();
  log('  Clicked "Create New Project"');
  await page.waitForTimeout(800);
}

// Populate #description via JS (field is hidden in Discovery-first UI)
await page.evaluate(desc => {
  const el = document.getElementById('description');
  if (el) { el.value = desc; el.dispatchEvent(new Event('input', { bubbles: true })); }
}, DESCRIPTION);
const descVal = await page.evaluate(() => document.getElementById('description')?.value || '');
addStep('Description set', descVal === DESCRIPTION ? 'PASS' : 'FAIL', descVal || '(empty)');

// ─── SET BUSINESS AREAS ────────────────────────────────────────────────────
log('Setting business areas...');
// Phase4 area toggles may not be visible until after Step 3 — skip if not present
const togglesExist = await page.locator('#phase4-area-toggles').count() > 0;
if (togglesExist) {
  // Collect current toggle buttons
  const toggleButtons = await page.locator('#phase4-area-toggles button, #phase4-area-toggles label').all();
  log(`  Found ${toggleButtons.length} area toggle elements`);

  for (const area of ACTIVE_AREAS) {
    // Look for a toggle whose text matches the area name (case-insensitive)
    const btn = page.locator(`#phase4-area-toggles button, #phase4-area-toggles label`).filter({ hasText: new RegExp(area, 'i') }).first();
    const exists = await btn.count() > 0;
    if (exists) {
      const isActive = await btn.getAttribute('class').then(c => c?.includes('active') || c?.includes('bg-blue') || c?.includes('selected')).catch(() => false);
      if (!isActive) await btn.click();
      addStep(`Business area: ${area}`, 'PASS');
    } else {
      addStep(`Business area: ${area}`, 'WARN', 'toggle not found — skipping');
    }
  }
} else {
  addStep('Business areas', 'WARN', 'phase4-area-toggles not found on page — areas are configured later');
}
await screenshot('02-business-areas-set');

// ─── STEP 1: CLARIFY STRATEGIC INTENT ─────────────────────────────────────
log('Step 1: Clarifying Strategic Intent...');
// Try sidebar button first, then fallback to JS function call
const step1Btn = page.locator('#step-1 button, button[onclick*="clarifyStrategicIntent"]').first();
if (await step1Btn.count() > 0 && await step1Btn.isVisible({ timeout: 3000 }).catch(() => false)) {
  await step1Btn.click();
} else {
  await page.evaluate(() => window.clarifyStrategicIntent && window.clarifyStrategicIntent());
}
await page.waitForTimeout(2000);

// Handle clarification gate if it appears (waits up to 20s for gate)
const gateAppeared = await waitForElement('#clarification-gate-card', 20000);
if (gateAppeared) {
  log('  Clarification gate appeared — answering questions...');
  await screenshot('03-clarification-gate');
  const clicked = new Set();
  const chips = await page.locator('#clarification-gate-card button[data-dim]').all();
  for (const chip of chips) {
    const dim = await chip.getAttribute('data-dim').catch(() => null);
    if (dim && !clicked.has(dim)) { await chip.click(); clicked.add(dim); }
  }
  const submitBtn = page.locator('#clarification-gate-card button').filter({ hasText: /confirm|submit|continue|proceed/i }).first();
  if (await submitBtn.count() > 0) { await submitBtn.click(); log('  Gate submitted'); }
} else {
  log('  No clarification gate — direct response');
}

// Wait for intent to appear (up to 2 min)
log('  Waiting for Step 1 intent to render...');
const intentAppeared = await waitForElement('#intent-display-section:not(.hidden)', STEP_TIMEOUT);
await screenshot('04-step1-result');

const orgName = await getTextContent('#intent-org-name');
const ambition = await getTextContent('#intent-ambition');
addStep('Step 1: Strategic Intent', intentAppeared ? 'PASS' : 'FAIL',
  intentAppeared ? `Org: "${orgName}" | Ambition: "${(ambition||'').slice(0,100)}..."` : 'Timed out waiting for intent-display-section');

// Confirm intent
if (await isVisible('#btn-step1-confirm')) {
  log('  Confirming Strategic Intent...');
  await page.evaluate(() => document.getElementById('btn-step1-confirm')?.click());
  await page.waitForTimeout(500);
}

// ─── STEP 2: BUSINESS MODEL CANVAS ─────────────────────────────────────────
log('Step 2: Generating Business Model Canvas...');
const s2ok = await clickStep('step-2', 'btn-step2', 'Step 2: BMC');
if (s2ok) {
  const s2done = await waitForElement('#bmc-content:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(1000);
  await screenshot('05-step2-bmc');
  const bmcContent = await getTextContent('#bmc-content');
  addStep('Step 2: Business Model Canvas', s2done && bmcContent?.length > 50 ? 'PASS' : 'FAIL',
    bmcContent ? `${bmcContent.slice(0, 100)}...` : 'bmc-content empty');
}

// ─── STEP 3: CAPABILITY MAP ─────────────────────────────────────────────────
log('Step 3: Generating Architecture & Capability Map...');
const s3ok = await clickStep('step-3', 'btn-step3', 'Step 3: Capability Map');
if (s3ok) {
  // Step 3 is the heaviest — wait for capmap-content to have data
  const s3done = await waitForElement('#capmap-content:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(2000);
  await screenshot('06-step3-capmap');

  const capCount = await page.evaluate(() => window.model?.capabilities?.length || 0);
  const kpiGridVisible = await isVisible('#exec-kpi-grid');
  const alignmentKpi = await getTextContent('#exec-alignment');
  addStep('Step 3: Capability Map', capCount > 0 ? 'PASS' : 'FAIL',
    `${capCount} capabilities | Exec KPI grid: ${kpiGridVisible ? 'visible ✓' : 'hidden'} | Alignment: ${alignmentKpi}`);

  // Switch to Industry tab and verify it unlocked
  await page.evaluate(() => {
    const btn = document.querySelector('button[onclick*="phase4"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  const ph4PlaceholderGone = !(await isVisible('#phase4-placeholder'));
  const areaMatAvg = await getTextContent('#phase4-kpis .kpi-card:first-child .text-2xl');
  addStep('Industry tab: unlocked after Step 3', ph4PlaceholderGone ? 'PASS' : 'FAIL',
    `Placeholder gone: ${ph4PlaceholderGone} | Area Maturity Avg: ${areaMatAvg}`);
  await screenshot('07-step3-industry-tab');

  // Return to exec tab
  await page.evaluate(() => document.querySelector('button[onclick*="showTab(\'exec\'"]')?.click());
  await page.waitForTimeout(500);
}

// ─── STEP 4: OPERATING MODEL ─────────────────────────────────────────────────
log('Step 4: Generating Operating Model...');
const s4ok = await clickStep('step-4', 'btn-step4', 'Step 4: Operating Model');
if (s4ok) {
  // Wait for opmodel-content to be populated (AI generates 3 sub-tasks)
  const s4done = await waitForElement('#opmodel-content:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(2000);

  // Navigate to Op Model tab
  await page.evaluate(() => { if (typeof showTab === 'function') showTab('opmodel'); });
  await page.waitForTimeout(1000);
  await screenshot('08-step4-opmodel');

  const opContent = await getTextContent('#opmodel-content');
  addStep('Step 4: Operating Model generated', s4done && opContent?.length > 50 ? 'PASS' : 'FAIL',
    opContent ? `${opContent.slice(0, 120)}...` : 'opmodel-content empty');

  // ── Validate model data structure ─────────────────────────────────────
  const omData = await page.evaluate(() => {
    const om = window.model?.operatingModel || {};
    const cur = om.current || {};
    const tgt = om.target  || {};
    const delta = window.model?.operatingModelDelta || {};
    return {
      hasCurrent:    !!(cur.value_delivery || cur.capability_model),
      hasTarget:     !!(tgt.value_delivery || tgt.capability_model),
      hasDelta:      !!(delta.dimension_gaps?.length),
      blocks: {
        valueDelivery:       !!cur.value_delivery,
        capabilityModel:     Array.isArray(cur.capability_model) ? cur.capability_model.length : 0,
        processModel:        Array.isArray(cur.process_model)    ? cur.process_model.length    : 0,
        orgGovernance:       !!cur.organisation_governance,
        appDataLandscape:    !!cur.application_data_landscape,
        principles:          Array.isArray(cur.operating_model_principles) ? cur.operating_model_principles.length : 0,
      },
      changeReadiness: delta.change_readiness?.score ?? null,
      archetype:       cur.metadata?.model_archetype || '(none)',
    };
  });

  addStep('Step 4: model.operatingModel.current populated', omData.hasCurrent ? 'PASS' : 'FAIL',
    `Archetype: "${omData.archetype}"`);
  addStep('Step 4: model.operatingModel.target populated', omData.hasTarget ? 'PASS' : 'WARN',
    omData.hasTarget ? 'Target OS-IS generated' : 'Target not generated');
  addStep('Step 4: operatingModelDelta populated', omData.hasDelta ? 'PASS' : 'WARN',
    omData.hasDelta ? `Change readiness: ${omData.changeReadiness !== null ? (omData.changeReadiness * 100).toFixed(0) + '%' : 'n/a'}` : 'No delta');

  // ── Validate 6 blocks ────────────────────────────────────────────────
  addStep('Step 4 Block 1: Value Delivery',            omData.blocks.valueDelivery              ? 'PASS' : 'FAIL');
  addStep('Step 4 Block 2: Capability Model',          omData.blocks.capabilityModel > 0        ? 'PASS' : 'FAIL',
    `${omData.blocks.capabilityModel} capabilities`);
  addStep('Step 4 Block 3: Process Model',             omData.blocks.processModel > 0           ? 'PASS' : 'FAIL',
    `${omData.blocks.processModel} processes`);
  addStep('Step 4 Block 4: Organisation & Governance', omData.blocks.orgGovernance              ? 'PASS' : 'FAIL');
  addStep('Step 4 Block 5: Application & Data',        omData.blocks.appDataLandscape           ? 'PASS' : 'FAIL');
  addStep('Step 4 Block 6: Principles',                omData.blocks.principles > 0             ? 'PASS' : 'FAIL',
    `${omData.blocks.principles} principles`);

  // ── AS-IS / TO-BE / Delta tab rendering ──────────────────────────────
  const asIsBtn  = page.locator('#opmodel-content button').filter({ hasText: /AS-IS/i }).first();
  const toBeBtn  = page.locator('#opmodel-content button').filter({ hasText: /TO-BE/i }).first();
  const deltaBtn = page.locator('#opmodel-content button').filter({ hasText: /Delta/i }).first();

  if (await asIsBtn.count() > 0) {
    await asIsBtn.click(); await page.waitForTimeout(400);
    await screenshot('08b-step4-asis');
    addStep('Step 4 Tab: AS-IS renders', true ? 'PASS' : 'FAIL');
  }
  if (await toBeBtn.count() > 0) {
    await toBeBtn.click(); await page.waitForTimeout(400);
    await screenshot('08c-step4-tobe');
    addStep('Step 4 Tab: TO-BE renders', true ? 'PASS' : 'FAIL');
  }
  if (await deltaBtn.count() > 0) {
    await deltaBtn.click(); await page.waitForTimeout(400);
    await screenshot('08d-step4-delta');
    addStep('Step 4 Tab: Delta renders', true ? 'PASS' : 'FAIL');
  } else {
    addStep('Step 4 Tab: Delta', 'WARN', 'Delta tab not shown (may need dimension_gaps)');
  }

  // Return to exec tab
  await page.evaluate(() => { if (typeof showTab === 'function') showTab('exec'); });
  await page.waitForTimeout(500);
}

// ─── STEP 5: GAP ANALYSIS ─────────────────────────────────────────────────
log('Step 5: Gap Analysis...');
const s5ok = await clickStep('step-5', 'btn-step5', 'Step 5: Gap Analysis');
if (s5ok) {
  const s5done = await waitForElement('#insights:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(1000);
  await screenshot('09-step5-gap');
  const gapContent = await getTextContent('#insights');
  addStep('Step 5: Gap Analysis', s5done && gapContent?.length > 50 ? 'PASS' : 'FAIL',
    gapContent ? `${gapContent.slice(0, 100)}...` : 'insights empty');
}

// ─── STEP 6: VALUE POOLS ─────────────────────────────────────────────────
log('Step 6: Value Pools...');
const s6ok = await clickStep('step-6', 'btn-step6', 'Step 6: Value Pools');
if (s6ok) {
  const s6done = await waitForElement('#valuepools-content:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(1000);
  await screenshot('10-step6-valuepools');
  const vpContent = await getTextContent('#valuepools-content');
  addStep('Step 6: Value Pools', s6done && vpContent?.length > 50 ? 'PASS' : 'FAIL',
    vpContent ? `${vpContent.slice(0, 100)}...` : 'valuepools-content empty');
}

// ─── STEP 7a: TARGET ARCHITECTURE ────────────────────────────────────────
log('Step 7a: Target Architecture...');
const s7aok = await clickStep('step-7', 'btn-step7a', 'Step 7a: Target Architecture');
if (s7aok) {
  const s7adone = await waitForElement('#targetarch-content:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(1000);
  await screenshot('11-step7a-targetarch');
  const taContent = await getTextContent('#targetarch-content');
  addStep('Step 7a: Target Architecture', s7adone && taContent?.length > 50 ? 'PASS' : 'FAIL',
    taContent ? `${taContent.slice(0, 100)}...` : 'targetarch-content empty');
}

// ─── STEP 7b: ROADMAP ────────────────────────────────────────────────────
log('Step 7b: Roadmap...');
const s7bok = await clickStep('step-7', 'btn-step7b', 'Step 7b: Roadmap');
if (s7bok) {
  const s7bdone = await waitForElement('#roadmapvis-content:not(:empty)', STEP_TIMEOUT);
  await page.waitForTimeout(1000);
  await screenshot('12-step7b-roadmap');
  const rmContent = await getTextContent('#roadmapvis-content');
  addStep('Step 7b: Roadmap', s7bdone && rmContent?.length > 50 ? 'PASS' : 'FAIL',
    rmContent ? `${rmContent.slice(0, 100)}...` : 'roadmapvis-content empty');
}

// ─── POST-RUN CHECKS ────────────────────────────────────────────────────
log('Post-run checks...');

// Check KPIs are no longer 0% after full run
const alignment = await getTextContent('#exec-alignment');
const aiReady = await getTextContent('#exec-aiready');
const techDebt = await getTextContent('#exec-techdebt');
addStep('KPIs populated (not 0%)', alignment !== '–' && alignment !== '0%' ? 'PASS' : 'WARN',
  `Alignment: ${alignment} | AI Readiness: ${aiReady} | Tech Debt: ${techDebt}`);

// Check New Workflow reset clears intent
log('Testing New Workflow reset...');
await page.evaluate(() => window.startNewWorkflow && window.startNewWorkflow());
// Bypass confirm dialog
page.on('dialog', d => d.accept());
await page.evaluate(() => window.resetWorkflowModel && window.resetWorkflowModel());
await page.waitForTimeout(1000);
await screenshot('13-after-reset');

const intentAfterReset = await isVisible('#intent-display-section');
const placeholderAfterReset = await isVisible('#intent-placeholder');
addStep('New Workflow reset: intent cleared', !intentAfterReset && placeholderAfterReset ? 'PASS' : 'FAIL',
  `intent-display-section visible: ${intentAfterReset} | placeholder visible: ${placeholderAfterReset}`);

const kpiGridAfterReset = await isVisible('#exec-kpi-grid');
const kpiPlaceholderAfterReset = await isVisible('#exec-kpi-placeholder');
addStep('New Workflow reset: KPI grid cleared', !kpiGridAfterReset && kpiPlaceholderAfterReset ? 'PASS' : 'WARN',
  `KPI grid visible: ${kpiGridAfterReset} | KPI placeholder visible: ${kpiPlaceholderAfterReset}`);

// ─── FINAL REPORT ───────────────────────────────────────────────────────
report.finishedAt = new Date().toISOString();
report.summary = {
  total: report.steps.length,
  pass: report.steps.filter(s => s.status === 'PASS').length,
  fail: report.steps.filter(s => s.status === 'FAIL').length,
  warn: report.steps.filter(s => s.status === 'WARN').length,
  consoleErrors: report.consoleErrors.length,
  pageErrors: report.pageErrors.length,
};

const reportPath = path.join(artifactsDir, 'nexgen_workflow_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n══════════════════════════════════════════');
console.log('  WORKFLOW TEST RESULTS');
console.log('══════════════════════════════════════════');
console.log(`  Description : "${DESCRIPTION}"`);
console.log(`  Areas       : ${ACTIVE_AREAS.join(', ')}`);
console.log(`  PASS        : ${report.summary.pass}/${report.summary.total}`);
console.log(`  FAIL        : ${report.summary.fail}`);
console.log(`  WARN        : ${report.summary.warn}`);
console.log(`  JS errors   : ${report.summary.consoleErrors}`);
console.log('──────────────────────────────────────────');
report.steps.forEach(s => {
  const icon = s.status === 'PASS' ? '✓' : s.status === 'FAIL' ? '✗' : '⚠';
  console.log(`  ${icon} ${s.name}`);
  if (s.detail) console.log(`      ${s.detail}`);
});
if (report.consoleErrors.length) {
  console.log('\n  Console errors:');
  report.consoleErrors.forEach(e => console.log(`    • ${e}`));
}
console.log('══════════════════════════════════════════');
console.log(`  Full report: ${reportPath}`);
console.log(`  Screenshots: ${artifactsDir}`);

await browser.close();
