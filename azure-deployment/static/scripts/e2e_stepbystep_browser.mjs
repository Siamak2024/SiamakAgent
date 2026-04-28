/**
 * E2E Browser Test — Step-by-Step (Sequential, with per-step validation)
 *
 * Strategy:
 *   - Creates a NEW project via the app's createNewProject() modal flow
 *   - Enables _autopilotState.running so StepEngine auto-answers question tasks
 *   - Runs each step 1→7 individually via StepEngine.run(), validates after EACH step
 *   - Screenshots + data checks per step before proceeding to the next
 *
 * Scenario: Manufacturing company, Sverige, Tillverkning, Medium detail
 *
 * Usage: node scripts/e2e_stepbystep_browser.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL     = 'http://localhost:3000';
const PAGE_URL     = `${BASE_URL}/NexGenEA/NexGenEA_V11.html`;
const PROJECT_NAME = 'E2E StepByStep — ' + new Date().toISOString().slice(0, 16).replace('T', ' ');
const COMPANY      = 'A Swedish mid-size manufacturing company producing industrial components. Facing global supply chain disruptions, rising energy costs, and pressure to adopt Industry 4.0. Key challenges include siloed production data, manual quality control, and limited real-time visibility into factory floor operations. Goal: digitise manufacturing operations and enable predictive maintenance.';
const STEP_TIMEOUT = 4 * 60 * 1000; // 4 min per step (AI can be slow)

const artifactsDir = path.resolve('e2e-artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(),
  scenario: 'Step-by-Step — Manufacturing, Sverige, Medium',
  projectName: PROJECT_NAME,
  steps: [], consoleErrors: [], pageErrors: [], warnings: [],
  stepData: {}
};

function log(msg) {
  console.log(`[${new Date().toISOString().split('T')[1].replace('Z','')}] ${msg}`);
}
function addCheck(name, status, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`  ${icon} ${name}${detail ? ': ' + detail : ''}`);
  report.steps.push({ name, status, detail, at: new Date().toISOString() });
}

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
  const file = path.join(artifactsDir, 'stepbystep_report.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  log(`\nReport: ${file}`);

  const { total, pass, fail, warn } = report.summary;
  log(`\n${'═'.repeat(60)}`);
  log(`  STEP-BY-STEP E2E RESULT: ${pass}/${total} PASS  |  ${fail} FAIL  |  ${warn} WARN`);
  log(`${'═'.repeat(60)}\n`);
  if (fail > 0) {
    log('FAILED checks:');
    report.steps.filter(s => s.status === 'FAIL').forEach(s => log(`  ✗ ${s.name}: ${s.detail}`));
  }
  if (warn > 0) {
    log('WARNINGS:');
    report.steps.filter(s => s.status === 'WARN').forEach(s => log(`  ⚠ ${s.name}: ${s.detail}`));
  }
}

async function screenshot(page, name) {
  try {
    const file = path.join(artifactsDir, `sbs_${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    log(`    Screenshot → sbs_${name}.png`);
  } catch(e) { log(`    Screenshot failed: ${e.message}`); }
}

/**
 * Run a single EA step via StepEngine.run() and wait for it to complete.
 * Returns true if completed successfully, false on timeout/error.
 */
async function runStep(page, stepId, displayName) {
  log(`\n${'─'.repeat(50)}`);
  log(`Running ${displayName} (${stepId})...`);

  const stepStart = Date.now();
  let stepDone = false;
  let stepError = null;

  // Mark beginning state
  await page.evaluate(id => {
    window.__e2e_stepDone = false;
    window.__e2e_stepError = null;
    StepEngine.run(id, window.model)
      .then(() => { window.__e2e_stepDone = true; })
      .catch(err => { window.__e2e_stepError = err?.message || String(err); window.__e2e_stepDone = true; });
  }, stepId).catch(err => {
    stepError = err.message;
    stepDone = true;
  });

  // Poll until done or timeout
  while (Date.now() - stepStart < STEP_TIMEOUT) {
    await page.waitForTimeout(5_000);
    const state = await page.evaluate(() => ({
      done:  window.__e2e_stepDone,
      error: window.__e2e_stepError,
    })).catch(() => ({ done: false, error: null }));

    const elapsed = Math.round((Date.now() - stepStart) / 1000);
    if (state.done) {
      stepDone = true;
      stepError = state.error || null;
      log(`    [${elapsed}s] ${stepId} completed${stepError ? ` — ERROR: ${stepError}` : ''}`);
      break;
    }
    log(`    [${elapsed}s] ${stepId} still running...`);
  }

  if (!stepDone) {
    log(`    [TIMEOUT] ${stepId} did not complete within ${STEP_TIMEOUT / 1000}s`);
    return { ok: false, error: `Timed out after ${STEP_TIMEOUT / 1000}s` };
  }

  return { ok: !stepError, error: stepError };
}

// ── LAUNCH ─────────────────────────────────────────────────────────────────
log('Launching browser (Step-by-Step E2E)...');
const browser = await chromium.launch({ channel: 'msedge', headless: false, slowMo: 100 });
const ctx     = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page    = await ctx.newPage();

page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error') {
    report.consoleErrors.push(text);
    log(`  [ERR] ${text.slice(0, 200)}`);
  } else if (msg.type() === 'warning' && !text.includes('tailwindcss') && !text.includes('translation')) {
    report.warnings.push(text);
    log(`  [WARN] ${text.slice(0, 200)}`);
  } else if (text.includes('[StepEngine]') || text.includes('[Step') || text.includes('[OutputValidator]')) {
    log(`  [LOG] ${text.slice(0, 180)}`);
  }
});
page.on('pageerror', err => {
  report.pageErrors.push(err.message);
  log(`  [PAGE ERR] ${err.message.slice(0, 200)}`);
});

// ══════════════════════════════════════════════════════════════════════════
// SECTION 1 — OPEN PAGE
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ SECTION 1: Open Page ═══');
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 30_000 });
await page.waitForTimeout(1500);
await screenshot(page, '01_load');
addCheck('Page loads', 'PASS');

// ══════════════════════════════════════════════════════════════════════════
// SECTION 2 — CREATE NEW PROJECT
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ SECTION 2: Create New Project ═══');

// Click "Create New Project" if visible (home screen), otherwise open modal via JS
const homeCreateBtn = page.locator('button').filter({ hasText: /Create New Project/i }).first();
if (await homeCreateBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
  await homeCreateBtn.click();
  log('  Clicked "Create New Project" from home screen');
} else {
  await page.evaluate(() => openNewProjectModal());
  log('  Opened new project modal via JS');
}
await page.waitForTimeout(600);

// Fill in project name and description
const nameInput = page.locator('#newProjectName');
const descInput = page.locator('#newProjectDescription');
await nameInput.fill(PROJECT_NAME);
await descInput.fill(COMPANY);
await page.waitForTimeout(400);

// Submit
await page.evaluate(() => createNewProject());
await page.waitForTimeout(1200);

// Verify project was created (currentModelId/Name are let variables, check DOM + model state)
const projectCreated = await page.evaluate((name) => {
  const heroName = document.getElementById('hero-project-name')?.textContent || '';
  const dashVisible = !document.getElementById('project-dashboard')?.classList.contains('hidden');
  const modelReady  = typeof window.model === 'object' && window.model !== null;
  return { heroName, dashVisible, modelReady };
}, PROJECT_NAME).catch(() => ({ heroName: '', dashVisible: false, modelReady: false }));

addCheck('New project created', projectCreated.dashVisible && projectCreated.modelReady ? 'PASS' : 'FAIL',
  `dashboard=${projectCreated.dashVisible} model=${projectCreated.modelReady} name="${projectCreated.heroName}"`);

// Inject description into model for StepContext fallback
await page.evaluate((desc) => {
  if (window.model) window.model.description = desc;
  const el = document.getElementById('description');
  if (el) { el.value = desc; el.dispatchEvent(new Event('input', { bubbles: true })); }
}, COMPANY);

await screenshot(page, '02_new_project');
log(`  Project name: ${PROJECT_NAME}`);
addCheck('Company description injected', 'PASS');

// ══════════════════════════════════════════════════════════════════════════
// SECTION 3 — ENABLE AUTOPILOT QUESTION-AUTO-ANSWER
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ SECTION 3: Enable Auto-answer Mode ═══');
// We are NOT running full autopilot — we run steps individually.
// But we enable _autopilotState.running = true so StepEngine auto-answers
// question-type tasks (see _runQuestionTask in StepEngine.js).
await page.evaluate((company) => {
  window._autopilotState = {
    active:         true,
    running:        true,
    currentStep:    0,
    completedSteps: [],
    context: {
      region:             'Sverige',
      industry:           'Tillverkning',
      detailLevel:        'medium',
      companyDescription: company
    },
    generatedData: {}
  };
  // Also make step1 start from scratch (no existing legacy flags)
  if (window.model) {
    window.model.strategicIntentConfirmed = false;
    if (!window.model.steps) window.model.steps = {};
  }
}, COMPANY);
await page.waitForTimeout(300);
addCheck('Auto-answer mode enabled (question tasks will self-answer)', 'PASS');

// ══════════════════════════════════════════════════════════════════════════
// STEP 1 — STRATEGIC INTENT
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 1: Strategic Intent ═══');
const s1Result = await runStep(page, 'step1', 'Step 1: Strategic Intent');

addCheck('Step 1 executed', s1Result.ok ? 'PASS' : 'FAIL', s1Result.error || '');

// Signal step1 as completed so dependency checks pass
await page.evaluate(() => {
  window.model.strategicIntentConfirmed = true;
  if (!window.model.steps) window.model.steps = {};
  window.model.steps.step1 = {
    id: 'step1', name: 'Strategic Intent', status: 'completed',
    startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    output: window.model.strategicIntent
  };
});

// Validate step 1 data
const s1Data = await page.evaluate(() => {
  const si = window.model?.strategicIntent || {};
  return {
    hasAmbition:  !!(si.strategic_ambition),
    hasThemes:    Array.isArray(si.strategic_themes) && si.strategic_themes.length > 0,
    hasPlatform:  !!(si.burning_platform),
    ambition:     (si.strategic_ambition || '').slice(0, 100),
    themeCount:   Array.isArray(si.strategic_themes) ? si.strategic_themes.length : 0
  };
}).catch(() => ({}));
report.stepData.step1 = s1Data;

addCheck('Step 1: strategic_ambition populated', s1Data.hasAmbition ? 'PASS' : 'FAIL',
  s1Data.ambition || '');
addCheck('Step 1: strategic_themes populated', s1Data.hasThemes ? 'PASS' : 'FAIL',
  `${s1Data.themeCount} themes`);
addCheck('Step 1: burning_platform populated', s1Data.hasPlatform ? 'PASS' : 'WARN');

await screenshot(page, '03_step1_done');

// ══════════════════════════════════════════════════════════════════════════
// STEP 2 — BUSINESS MODEL CANVAS
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 2: Business Model Canvas ═══');
const s2Result = await runStep(page, 'step2', 'Step 2: Business Model Canvas');
addCheck('Step 2 executed', s2Result.ok ? 'PASS' : 'FAIL', s2Result.error || '');

const s2Data = await page.evaluate(() => {
  const bmc = window.model?.bmc || {};
  return {
    hasBmc:        !!(bmc),
    hasVP:         !!(bmc.value_propositions?.length || bmc.value_proposition),
    hasSegments:   Array.isArray(bmc.customer_segments) && bmc.customer_segments.length > 0,
    hasActivities: Array.isArray(bmc.key_activities) && bmc.key_activities.length > 0,
    hasRevenue:    Array.isArray(bmc.revenue_streams) && bmc.revenue_streams.length > 0,
    vp:            (bmc.value_propositions?.[0] || bmc.value_proposition || '').slice(0, 100),
    segmentCount:  Array.isArray(bmc.customer_segments) ? bmc.customer_segments.length : 0
  };
}).catch(() => ({}));
report.stepData.step2 = s2Data;

addCheck('Step 2: value_propositions populated', s2Data.hasVP ? 'PASS' : 'FAIL', s2Data.vp || '');
addCheck('Step 2: customer_segments populated', s2Data.hasSegments ? 'PASS' : 'FAIL',
  `${s2Data.segmentCount} segments`);
addCheck('Step 2: key_activities populated', s2Data.hasActivities ? 'PASS' : 'WARN');
addCheck('Step 2: revenue_streams populated', s2Data.hasRevenue ? 'PASS' : 'WARN');

// Show Tab
await page.evaluate(() => { if (typeof showTab === 'function') showTab('bmc'); });
await page.waitForTimeout(500);
await screenshot(page, '04_step2_bmc');

// ══════════════════════════════════════════════════════════════════════════
// STEP 3 — CAPABILITY MAP
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 3: Capability Map ═══');
const s3Result = await runStep(page, 'step3', 'Step 3: Capability Map');
addCheck('Step 3 executed', s3Result.ok ? 'PASS' : 'FAIL', s3Result.error || '');

const s3Data = await page.evaluate(() => {
  const caps = window.model?.capabilities || [];
  const map  = window.model?.capabilityMap || {};
  return {
    capCount:    caps.length,
    domainCount: (map.l1_domains || []).length,
    hasMaturity: caps.some(c => c.current_maturity != null),
    hasDomains:  (map.l1_domains || []).length > 0,
    firstCap:    (caps[0]?.name || '').slice(0, 60)
  };
}).catch(() => ({}));
report.stepData.step3 = s3Data;

addCheck('Step 3: capabilities populated', s3Data.capCount > 0 ? 'PASS' : 'FAIL',
  `${s3Data.capCount} capabilities`);
addCheck('Step 3: l1_domains populated', s3Data.hasDomains ? 'PASS' : 'FAIL',
  `${s3Data.domainCount} domains`);
addCheck('Step 3: maturity scores present', s3Data.hasMaturity ? 'PASS' : 'WARN');

await page.evaluate(() => { if (typeof showTab === 'function') showTab('capmap'); });
await page.waitForTimeout(500);
await screenshot(page, '05_step3_caps');

// ══════════════════════════════════════════════════════════════════════════
// STEP 4 — OPERATING MODEL
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 4: Operating Model ═══');
const s4Result = await runStep(page, 'step4', 'Step 4: Operating Model');
addCheck('Step 4 executed', s4Result.ok ? 'PASS' : 'FAIL', s4Result.error || '');

const s4Data = await page.evaluate(() => {
  const cur   = window.model?.operatingModel?.current || {};
  const tgt   = window.model?.operatingModel?.target  || {};
  const delta = window.model?.operatingModelDelta || {};
  return {
    hasCurrent:   !!(cur.value_delivery || cur.capability_model),
    hasTarget:    !!(tgt.value_delivery || tgt.capability_model),
    hasDelta:     !!(delta.dimension_gaps?.length || delta.executive_summary),
    block1:       !!cur.value_delivery,
    block2count:  Array.isArray(cur.capability_model) ? cur.capability_model.length : 0,
    block3count:  Array.isArray(cur.process_model) ? cur.process_model.length : 0,
    block4:       !!cur.organisation_governance,
    block5:       !!cur.application_data_landscape,
    block6count:  Array.isArray(cur.operating_model_principles) ? cur.operating_model_principles.length : 0,
    archetype:    cur.metadata?.model_archetype || '',
    changeReady:  delta.change_readiness?.score ?? null,
  };
}).catch(() => ({}));
report.stepData.step4 = s4Data;

addCheck('Step 4: current OM populated',            s4Data.hasCurrent   ? 'PASS' : 'FAIL');
addCheck('Step 4: target OM populated',             s4Data.hasTarget    ? 'PASS' : 'WARN');
addCheck('Step 4: delta populated',                 s4Data.hasDelta     ? 'PASS' : 'WARN',
  s4Data.changeReady !== null ? `Change readiness: ${(s4Data.changeReady * 100).toFixed(0)}%` : '');
addCheck('Step 4 Block 1: Value Delivery',          s4Data.block1         ? 'PASS' : 'FAIL');
addCheck('Step 4 Block 2: Capability Model',        s4Data.block2count > 0 ? 'PASS' : 'FAIL',
  `${s4Data.block2count} capabilities`);
addCheck('Step 4 Block 3: Process Model',           s4Data.block3count > 0 ? 'PASS' : 'FAIL',
  `${s4Data.block3count} processes`);
addCheck('Step 4 Block 4: Org & Governance',        s4Data.block4         ? 'PASS' : 'FAIL');
addCheck('Step 4 Block 5: App & Data Landscape',    s4Data.block5         ? 'PASS' : 'FAIL');
addCheck('Step 4 Block 6: Operating Principles',    s4Data.block6count > 0 ? 'PASS' : 'FAIL',
  `${s4Data.block6count} principles`);

// Explicitly render the Op Model tab (re-syncs let model→render)
await page.evaluate(() => { if (typeof renderOperatingModel === 'function') renderOperatingModel(); });
await page.waitForTimeout(400);
// Validate Op Model tab 6 block sections
await page.evaluate(() => { if (typeof showTab === 'function') showTab('opmodel'); });
await page.waitForTimeout(600);
const omSections = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('#opmodel-content .omcell-title'))
    .map(el => el.textContent.trim());
}).catch(() => []);
const expectedBlocks = ['Value Delivery', 'Capability Model', 'Process Model', 'Organisation', 'Application', 'Principles'];
const foundBlocks = expectedBlocks.filter(b => omSections.some(s => s.toLowerCase().includes(b.toLowerCase())));
addCheck(`Step 4 Tab: ${foundBlocks.length}/6 OM block sections rendered`,
  foundBlocks.length >= 4 ? 'PASS' : foundBlocks.length > 0 ? 'WARN' : 'FAIL',
  `Found: ${omSections.slice(0, 7).join(' | ')}`);

await screenshot(page, '06_step4_om');

// ══════════════════════════════════════════════════════════════════════════
// STEP 5 — GAP ANALYSIS
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 5: Gap Analysis ═══');
const s5Result = await runStep(page, 'step5', 'Step 5: Gap Analysis');
addCheck('Step 5 executed', s5Result.ok ? 'PASS' : 'FAIL', s5Result.error || '');

const s5Data = await page.evaluate(() => {
  const m = window.model || {};
  const gaps = m.priorityGaps || m.gapAnalysis?.gaps || [];
  const qw   = m.quickWins || [];
  return {
    gapCount: gaps.length,
    hasGaps:  gaps.length > 0,
    hasQuickWins: qw.length > 0,
    qwCount: qw.length,
    firstGap: (gaps[0]?.capability || gaps[0]?.name || '').slice(0, 60)
  };
}).catch(() => ({}));
report.stepData.step5 = s5Data;

addCheck('Step 5: priority gaps populated', s5Data.hasGaps ? 'PASS' : 'FAIL',
  `${s5Data.gapCount} gaps${s5Data.firstGap ? ' — ' + s5Data.firstGap : ''}`);
addCheck('Step 5: quick wins present', s5Data.hasQuickWins ? 'PASS' : 'WARN',
  `${s5Data.qwCount} quick wins`);

await page.evaluate(() => { if (typeof showTab === 'function') showTab('gap'); });
await page.waitForTimeout(500);
await screenshot(page, '07_step5_gaps');

// ══════════════════════════════════════════════════════════════════════════
// STEP 6 — VALUE POOLS
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 6: Value Pools ═══');
const s6Result = await runStep(page, 'step6', 'Step 6: Value Pools');
addCheck('Step 6 executed', s6Result.ok ? 'PASS' : 'FAIL', s6Result.error || '');

const s6Data = await page.evaluate(() => {
  const vp   = window.model?.valuePools || [];
  const opts = window.model?.strategicOptions || [];
  return {
    vpCount:   vp.length,
    hasVP:     vp.length > 0,
    hasOptions: opts.length > 0,
    optCount:  opts.length,
    firstPool: (vp[0]?.name || vp[0]?.title || '').slice(0, 60)
  };
}).catch(() => ({}));
report.stepData.step6 = s6Data;

addCheck('Step 6: value pools populated', s6Data.hasVP ? 'PASS' : 'FAIL',
  `${s6Data.vpCount} pools${s6Data.firstPool ? ' — ' + s6Data.firstPool : ''}`);
addCheck('Step 6: strategic options present', s6Data.hasOptions ? 'PASS' : 'WARN',
  `${s6Data.optCount} options`);

await page.evaluate(() => { if (typeof showTab === 'function') showTab('valuepools'); });
await page.waitForTimeout(500);
await screenshot(page, '08_step6_valuepools');

// ══════════════════════════════════════════════════════════════════════════
// STEP 7 — TARGET ARCHITECTURE & ROADMAP
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ STEP 7: Target Architecture & Roadmap ═══');
const s7Result = await runStep(page, 'step7', 'Step 7: Target Arch & Roadmap');
addCheck('Step 7 executed', s7Result.ok ? 'PASS' : 'FAIL', s7Result.error || '');

const s7Data = await page.evaluate(() => {
  const m  = window.model || {};
  const rw = m.roadmap?.waves || [];
  const ini = m.initiatives || [];
  const waves = rw.length > 0 ? rw.flatMap(w => w.initiatives || []) : ini;
  return {
    hasRoadmap:    !!(m.roadmap || ini.length > 0),
    waveCount:     rw.length,
    initiativeCount: waves.length,
    targetArchDone: !!m.targetArchDone,
    firstWave:     rw[0]?.name || '',
  };
}).catch(() => ({}));
report.stepData.step7 = s7Data;

addCheck('Step 7: roadmap populated', s7Data.hasRoadmap ? 'PASS' : 'FAIL',
  `${s7Data.waveCount} waves, ${s7Data.initiativeCount} initiatives`);
addCheck('Step 7: targetArchDone flag set', s7Data.targetArchDone ? 'PASS' : 'WARN');

// Target Arch tab — trigger visual render then check
await page.evaluate(() => {
  if (typeof renderTargetArchVisual === 'function') renderTargetArchVisual();
  if (typeof showTab === 'function') showTab('targetarch');
});
await page.waitForTimeout(800);
const taText = await page.$eval('#targetarch-content', el => el.innerText || '').catch(() => '');
// Accept both rendered content (> 50 chars) and the button placeholder (> 20 chars)
addCheck('Step 7: Target Arch tab accessible', taText.length > 20 ? 'PASS' : 'FAIL', taText.slice(0, 80));
addCheck('Step 7: Target Arch data populated', taText.length > 200 ? 'PASS' : 'WARN',
  taText.length > 200 ? 'Visual rendered' : 'Placeholder — click to generate');
await screenshot(page, '09_step7_targetarch');

// Roadmap tab
await page.evaluate(() => { if (typeof showTab === 'function') showTab('roadmapvis'); });
await page.waitForTimeout(500);
const roadText = await page.$eval('#roadmapvis-content', el => el.innerText || '').catch(() => '');
addCheck('Step 7: Roadmap tab renders', roadText.length > 50 ? 'PASS' : 'FAIL',
  roadText.slice(0, 80));
await screenshot(page, '10_step7_roadmap');

// ══════════════════════════════════════════════════════════════════════════
// SECTION 4 — FULL UI WALKTHROUGH (ALL 5 TABS)
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ SECTION 4: Full UI Walkthrough ═══');
const tabChecks = [
  { id: 'opmodel',    label: 'Op Model',     selector: '#opmodel-content',    minLen: 200    },
  { id: 'gap',        label: 'Gap Analysis', selector: '#insights',            minLen: 50     },
  { id: 'valuepools', label: 'Value Pools',  selector: '#valuepools-content',  minLen: 50     },
  { id: 'targetarch', label: 'Target Arch',  selector: '#targetarch-content',  minLen: 20     },
  { id: 'roadmapvis', label: 'Roadmap',      selector: '#roadmapvis-content',  minLen: 20     },
];
for (const t of tabChecks) {
  await page.evaluate(id => { if (typeof showTab === 'function') showTab(id); }, t.id);
  await page.waitForTimeout(500);
  const text = await page.$eval(t.selector, el => el.innerText || '').catch(() => '');
  addCheck(`UI Tab: ${t.label} renders`, text.length >= (t.minLen || 50) ? 'PASS' : 'FAIL',
    text.slice(0, 70));
}
await screenshot(page, '11_final_ui');

// ══════════════════════════════════════════════════════════════════════════
// SECTION 5 — PROJECT SAVED CHECK
// ══════════════════════════════════════════════════════════════════════════
log('\n═══ SECTION 5: Project State Check ═══');
const projectState = await page.evaluate(() => ({
  project:   document.getElementById('hero-project-name')?.textContent || '',
  hasBmc:    !!(window.model?.bmc),
  hasCaps:   (window.model?.capabilities || []).length > 0,
  hasOM:     !!(window.model?.operatingModel?.current?.value_delivery),
  hasGaps:   !!(window.model?.priorityGaps?.length || window.model?.gapAnalysis?.gaps?.length),
  hasVP:     !!(window.model?.valuePools?.length),
  hasRoadmap:!!(window.model?.roadmap || window.model?.initiatives?.length),
})).catch(() => ({}));

addCheck('Project name in header', projectState.project.length > 3 ? 'PASS' : 'WARN',
  `"${projectState.project}"`);
addCheck('Final: BMC in model',            projectState.hasBmc    ? 'PASS' : 'FAIL');
addCheck('Final: Capabilities in model',   projectState.hasCaps   ? 'PASS' : 'FAIL');
addCheck('Final: Operating Model in model',projectState.hasOM     ? 'PASS' : 'FAIL');
addCheck('Final: Gap Analysis in model',   projectState.hasGaps   ? 'PASS' : 'FAIL');
addCheck('Final: Value Pools in model',    projectState.hasVP     ? 'PASS' : 'FAIL');
addCheck('Final: Roadmap in model',        projectState.hasRoadmap? 'PASS' : 'FAIL');

report.projectState = projectState;

// ── CLOSE & REPORT ──────────────────────────────────────────────────────────
await browser.close();
await writeReport();
