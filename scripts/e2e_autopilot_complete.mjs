/**
 * E2E Complete Autopilot Test — Architecture Layers & Graph Validation
 * 
 * Comprehensive test that validates:
 * 1. All 7 autopilot steps complete successfully
 * 2. Final Target Architecture generation
 * 3. Complete Transformation Roadmap
 * 4. Architecture Layers populated (Value Streams, Systems, AI Agents, Capabilities)
 * 5. Graph/visualization generation for all layers
 * 
 * Usage: node scripts/e2e_autopilot_complete.mjs
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const PAGE_URL = `${BASE_URL}/NexGenEA/NexGen_EA_V4.html`;
const TEST_PROJECT_NAME = 'E2E Complete - Architecture & Roadmap Validation';
const TEST_PROJECT_DESC = 'Complete E2E test for autopilot mode with full architecture layers and graph validation. Generated on ' + new Date().toISOString();
const COMPANY = 'A mid-size Swedish real estate company with legacy ERP and property management platforms causing heavily manual administration, personal dependency and poor data quality. Goal is to digitise core operations and improve ESG reporting.';
const STEP_TIMEOUT = 180_000; // 3 min per step

const artifactsDir = path.resolve('e2e-artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(),
  scenario: 'Complete Autopilot — Architecture Layers & Graph Validation',
  testProjectName: TEST_PROJECT_NAME,
  testProjectId: null,
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  warnings: [],
  architectureValidation: {},
  graphValidation: {}
};

function log(msg) {
  console.log(`[${new Date().toISOString().split('T')[1].replace('Z', '')}] ${msg}`);
}

function addStep(name, status, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`${icon} ${name}${detail ? ': ' + detail : ''}`);
  report.steps.push({ name, status, detail, at: new Date().toISOString() });
}

async function writeReport() {
  report.finishedAt = new Date().toISOString();
  report.summary = {
    total: report.steps.length,
    pass: report.steps.filter(s => s.status === 'PASS').length,
    fail: report.steps.filter(s => s.status === 'FAIL').length,
    warn: report.steps.filter(s => s.status === 'WARN').length,
    consoleErrors: report.consoleErrors.length,
    pageErrors: report.pageErrors.length,
  };
  const file = path.join(artifactsDir, 'autopilot_complete_report.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  log(`\nReport: ${file}`);

  const { total, pass, fail, warn } = report.summary;
  log(`\n${'═'.repeat(65)}`);
  log(`  COMPLETE AUTOPILOT E2E: ${pass}/${total} PASS  |  ${fail} FAIL  |  ${warn} WARN`);
  log(`${'═'.repeat(65)}\n`);
  
  if (fail > 0) {
    log('❌ FAILED checks:');
    report.steps.filter(s => s.status === 'FAIL').forEach(s => log(`  ✗ ${s.name}: ${s.detail}`));
  }
  
  if (pass === total) {
    log('✅ ALL TESTS PASSED - Autopilot mode is fully functional!');
  }
}

async function screenshot(page, name) {
  try {
    const file = path.join(artifactsDir, `complete_${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    log(`  Screenshot → complete_${name}.png`);
  } catch (e) {
    log(`  Screenshot failed: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAUNCH BROWSER
// ═══════════════════════════════════════════════════════════════════════════
log('Launching browser for complete E2E test...');
const browser = await chromium.launch({ 
  channel: 'msedge', 
  headless: false, 
  slowMo: 100 
});
const context = await browser.newContext({ 
  viewport: { width: 1600, height: 1000 } 
});
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') {
    report.consoleErrors.push(msg.text());
    log(`  [ERR] ${msg.text().slice(0, 200)}`);
  } else if (msg.type() === 'warning') {
    report.warnings.push(msg.text());
  }
});

page.on('pageerror', err => {
  report.pageErrors.push(err.message);
  log(`  [PAGE ERR] ${err.message.slice(0, 200)}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: LOAD PAGE
// ═══════════════════════════════════════════════════════════════════════════
log('Opening EA Platform...');
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 30_000 });

await page.evaluate(() => {
  localStorage.setItem('ea_api_key', 'server-proxy');
});

await screenshot(page, '01_page_load');
addStep('Page load', 'PASS');

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: CREATE NEW PROJECT
// ═══════════════════════════════════════════════════════════════════════════
log('Creating new project...');

const projectNameInput = page.locator('#newProjectName');
if (await projectNameInput.isVisible({ timeout: 8000 }).catch(() => false)) {
  await projectNameInput.fill(TEST_PROJECT_NAME);
  const projectDescInput = page.locator('#newProjectDescription');
  if (await projectDescInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await projectDescInput.fill(TEST_PROJECT_DESC);
  }
  const createProjectBtn = page.locator('button').filter({ hasText: /Create Project/i }).first();
  if (await createProjectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await createProjectBtn.click();
    await page.waitForTimeout(1200);
    addStep('Create New Project', 'PASS', TEST_PROJECT_NAME);
  }
}

// Capture project ID for cleanup
const testProjectId = await page.evaluate(() => window.currentModelId || null);
report.testProjectId = testProjectId;
log(`  Project ID: ${testProjectId}`);

// Set company description
await page.evaluate(desc => {
  const el = document.getElementById('description');
  if (el) {
    el.value = desc;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (window.model) window.model.description = desc;
}, COMPANY);
addStep('Company description set', 'PASS');

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: START AUTOPILOT MODE
// ═══════════════════════════════════════════════════════════════════════════
log('Starting Autopilot mode...');

const autopilotBtn = page.locator('button[onclick*="startAutopilotMode"]').first();
if (await autopilotBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  await autopilotBtn.click();
} else {
  await page.evaluate(() => {
    if (typeof startAutopilotMode === 'function') startAutopilotMode();
  });
}
await page.waitForTimeout(1500);
await screenshot(page, '02_autopilot_start');

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: SET AUTOPILOT CONTEXT (Region, Industry, Detail Level)
// ═══════════════════════════════════════════════════════════════════════════
log('Setting autopilot context...');

await page.evaluate(() => {
  if (typeof setAutopilotRegion === 'function') setAutopilotRegion('Sverige');
});
await page.waitForTimeout(800);
log('  Region: Sverige');

await page.evaluate(() => {
  if (typeof setAutopilotIndustry === 'function') setAutopilotIndustry('Fastighet');
});
await page.waitForTimeout(800);
log('  Industry: Fastighet');

await page.evaluate(() => {
  if (typeof setAutopilotDetailLevel === 'function') setAutopilotDetailLevel('medium');
});
await page.waitForTimeout(1500);
log('  Detail Level: medium');

// Inject company description into autopilot context
await page.evaluate(desc => {
  if (window._autopilotState) {
    window._autopilotState.awaitingCompanyDescription = false;
    window._autopilotState.context = window._autopilotState.context || {};
    window._autopilotState.context.companyDescription = desc;
  }
  if (window.model) window.model.description = desc;
}, COMPANY);
await page.waitForTimeout(500);
await screenshot(page, '03_context_set');
addStep('Autopilot context configured (Sverige, Fastighet, medium)', 'PASS');

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: LAUNCH FULL AUTOPILOT FLOW
// ═══════════════════════════════════════════════════════════════════════════
log('Launching Full Autopilot flow (all 7 steps)...');
await page.evaluate(() => {
  if (typeof runFullAutopilotFlow === 'function') runFullAutopilotFlow();
});
await page.waitForTimeout(1000);
await screenshot(page, '04_autopilot_running');
addStep('Full Autopilot flow launched', 'PASS');

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6: WAIT FOR AUTOPILOT COMPLETION (ALL 7 STEPS)
// ═══════════════════════════════════════════════════════════════════════════
log('Waiting for Autopilot to complete all 7 steps...');
log('This will take several minutes. Progress updates below:');

const AUTOPILOT_TOTAL_TIMEOUT = 20 * 60 * 1000; // 20 min
const startTime = Date.now();
let autopilotDone = false;
let lastStepCount = 0;

while (Date.now() - startTime < AUTOPILOT_TOTAL_TIMEOUT) {
  const state = await page.evaluate(() => ({
    running: window._autopilotState?.running,
    active: window._autopilotState?.active,
    completedSteps: window._autopilotState?.completedSteps || [],
  })).catch(() => ({}));

  const doneCount = state.completedSteps?.length || 0;
  if (doneCount !== lastStepCount) {
    lastStepCount = doneCount;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log(`  [${elapsed}s] Completed steps: ${doneCount}/7 → ${(state.completedSteps || []).join(', ')}`);
  }

  // Check if autopilot is done
  if (state.running === false && (doneCount > 0 || state.active === false)) {
    autopilotDone = doneCount >= 7;
    log(`  Autopilot flow ended. Steps completed: ${doneCount}/7`);
    break;
  }

  await page.waitForTimeout(10_000); // Check every 10 seconds
}

await screenshot(page, '05_autopilot_complete');
addStep('Autopilot completed all 7 steps', autopilotDone ? 'PASS' : 'FAIL',
  autopilotDone ? 'All steps finished successfully' : `Timeout — only ${lastStepCount}/7 steps completed`);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 7: VALIDATE MODEL DATA (ALL 7 STEPS)
// ═══════════════════════════════════════════════════════════════════════════
log('\n═══════════════════════════════════════════════════════════════');
log('VALIDATING MODEL DATA...');
log('═══════════════════════════════════════════════════════════════\n');

const modelData = await page.evaluate(() => {
  const m = window.model || {};
  const om = m.operatingModel || {};
  const cur = om.current || {};
  const tgt = om.target || {};
  const delta = m.operatingModelDelta || {};

  return {
    // Step 1: Strategic Intent
    hasStrategicIntent: !!(m.strategicIntent?.strategic_ambition || m.strategicIntent?.burning_platform),
    strategicAmbition: m.strategicIntent?.strategic_ambition || '',
    
    // Step 2: BMC
    hasBmc: !!m.bmc,
    bmcValueProp: m.bmc?.value_proposition || m.bmc?.value_propositions?.[0] || '',
    
    // Step 3: Capabilities
    capCount: (m.capabilities || []).length,
    capMapDomains: (m.capabilityMap?.l1_domains || []).length,
    capMapL2Count: (m.capabilityMap?.l1_domains || []).reduce((sum, d) => sum + (d.l2_capabilities?.length || 0), 0),
    
    // Step 4: Operating Model
    om: {
      hasCurrent: !!(cur.value_delivery || cur.capability_model),
      hasTarget: !!(tgt.value_delivery || tgt.capability_model),
      hasDelta: !!(delta.dimension_gaps?.length),
      block1: !!cur.value_delivery,
      block2count: Array.isArray(cur.capability_model) ? cur.capability_model.length : 0,
      block3count: Array.isArray(cur.process_model) ? cur.process_model.length : 0,
      block4: !!cur.organisation_governance,
      block5: !!cur.application_data_landscape,
      block5Systems: Array.isArray(cur.application_data_landscape?.core_systems) ? cur.application_data_landscape.core_systems.length : 0,
      block6count: Array.isArray(cur.operating_model_principles) ? cur.operating_model_principles.length : 0,
      changeReady: delta.change_readiness?.score ?? null,
    },
    
    // Step 5: Gap Analysis
    hasPriorityGaps: !!(m.priorityGaps?.length || m.gapAnalysis?.gaps?.length),
    gapCount: (m.priorityGaps || m.gapAnalysis?.gaps || []).length,
    
    // Step 6: Value Pools
    hasValuePools: !!(m.valuePools?.length),
    valuePoolCount: (m.valuePools || []).length,
    
    // Step 7: Target Architecture & Roadmap
    hasTargetArch: !!(m.targetArchitecture || m.capabilities?.some(c => c.targetMaturity)),
    hasRoadmap: !!(m.roadmap || m.initiatives?.length),
    initiativeCount: (m.initiatives || []).length,
    roadmapWaves: m.roadmap?.waves?.length || 0,
    
    // Architecture Layers
    architectureLayers: {
      valueStreams: (m.valueStreams || []).length,
      systems: (m.systems || []).length,
      aiAgents: (m.aiAgents || []).length,
      capabilities: (m.capabilities || []).length,
    },
    
    // Flags
    targetArchDone: !!m.targetArchDone,
    gapAnalysisDone: !!m.gapAnalysisDone,
    valuepoolsDone: !!m.valuepoolsDone,
  };
});

// Step-by-step validation
log('Step 1: Strategic Intent');
addStep('Step 1: Strategic Intent populated', modelData.hasStrategicIntent ? 'PASS' : 'FAIL',
  modelData.strategicAmbition ? modelData.strategicAmbition.slice(0, 80) : '');

log('Step 2: Business Model Canvas');
addStep('Step 2: BMC populated', modelData.hasBmc ? 'PASS' : 'FAIL',
  modelData.bmcValueProp ? modelData.bmcValueProp.slice(0, 80) : '');

log('Step 3: Capability Map');
addStep('Step 3: Capabilities generated', modelData.capCount > 0 ? 'PASS' : 'FAIL',
  `${modelData.capCount} capabilities, ${modelData.capMapDomains} domains, ${modelData.capMapL2Count} L2 capabilities`);

log('Step 4: Operating Model (6-block validation)');
addStep('Step 4: OM current populated', modelData.om.hasCurrent ? 'PASS' : 'FAIL');
addStep('Step 4: OM target populated', modelData.om.hasTarget ? 'PASS' : 'WARN');
addStep('Step 4: OM delta populated', modelData.om.hasDelta ? 'PASS' : 'WARN',
  modelData.om.changeReady !== null ? `Change readiness: ${(modelData.om.changeReady * 100).toFixed(0)}%` : '');
addStep('  Block 1: Value Delivery', modelData.om.block1 ? 'PASS' : 'FAIL');
addStep('  Block 2: Capability Model', modelData.om.block2count > 0 ? 'PASS' : 'FAIL',
  `${modelData.om.block2count} capabilities`);
addStep('  Block 3: Process Model', modelData.om.block3count > 0 ? 'PASS' : 'FAIL',
  `${modelData.om.block3count} processes`);
addStep('  Block 4: Org & Governance', modelData.om.block4 ? 'PASS' : 'FAIL');
addStep('  Block 5: App & Data Landscape', modelData.om.block5 ? 'PASS' : 'FAIL',
  modelData.om.block5Systems > 0 ? `${modelData.om.block5Systems} systems` : '');
addStep('  Block 6: Operating Model Principles', modelData.om.block6count > 0 ? 'PASS' : 'FAIL',
  `${modelData.om.block6count} principles`);

log('Step 5: Gap Analysis');
addStep('Step 5: Gap Analysis populated', modelData.hasPriorityGaps ? 'PASS' : 'FAIL',
  `${modelData.gapCount} gaps identified`);

log('Step 6: Value Pools');
addStep('Step 6: Value Pools populated', modelData.hasValuePools ? 'PASS' : 'FAIL',
  `${modelData.valuePoolCount} value pools`);

log('Step 7: Target Architecture & Transformation Roadmap');
addStep('Step 7a: Target Architecture generated', modelData.hasTargetArch ? 'PASS' : 'FAIL');
addStep('Step 7b: Transformation Roadmap generated', modelData.hasRoadmap ? 'PASS' : 'FAIL',
  `${modelData.initiativeCount} initiatives, ${modelData.roadmapWaves} waves`);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 8: VALIDATE ARCHITECTURE LAYERS
// ═══════════════════════════════════════════════════════════════════════════
log('\n═══════════════════════════════════════════════════════════════');
log('VALIDATING ARCHITECTURE LAYERS...');
log('═══════════════════════════════════════════════════════════════\n');

const archLayers = modelData.architectureLayers;
report.architectureValidation = archLayers;

addStep('Architecture Layers: Value Streams', archLayers.valueStreams > 0 ? 'PASS' : 'FAIL',
  `${archLayers.valueStreams} value streams`);
addStep('Architecture Layers: Systems', archLayers.systems > 0 ? 'PASS' : 'FAIL',
  `${archLayers.systems} systems`);
addStep('Architecture Layers: AI Agents', archLayers.aiAgents > 0 ? 'PASS' : 'WARN',
  `${archLayers.aiAgents} AI agents (optional but recommended)`);
addStep('Architecture Layers: Capabilities', archLayers.capabilities > 0 ? 'PASS' : 'FAIL',
  `${archLayers.capabilities} capabilities`);

// Detailed Architecture Layers validation
log('Fetching detailed Architecture Layers data...');
const detailedArchData = await page.evaluate(() => {
  const m = window.model || {};
  return {
    valueStreams: (m.valueStreams || []).map(vs => ({
      name: vs.name || vs,
      linked_capabilities: vs.linked_capabilities?.length || 0
    })),
    systems: (m.systems || []).map(s => ({
      name: s.name || s,
      type: s.type || 'unknown',
      linked_capabilities: s.linked_capabilities?.length || 0
    })),
    aiAgents: (m.aiAgents || []).map(a => ({
      name: a.name || a,
      agent_type: a.agent_type || 'unknown',
      linked_capabilities: a.linked_capabilities?.length || 0,
      is_proposed: a.is_proposed || false
    })),
  };
});

log(`\nValue Streams (${detailedArchData.valueStreams.length}):`);
detailedArchData.valueStreams.slice(0, 5).forEach(vs => {
  log(`  • ${vs.name} (${vs.linked_capabilities} linked capabilities)`);
});

log(`\nSystems (${detailedArchData.systems.length}):`);
detailedArchData.systems.slice(0, 5).forEach(s => {
  log(`  • ${s.name} [${s.type}] (${s.linked_capabilities} linked capabilities)`);
});

log(`\nAI Agents (${detailedArchData.aiAgents.length}):`);
detailedArchData.aiAgents.slice(0, 5).forEach(a => {
  log(`  • ${a.name} [${a.agent_type}] ${a.is_proposed ? '(Proposed)' : '(Existing)'} (${a.linked_capabilities} linked capabilities)`);
});

report.architectureValidation.details = detailedArchData;

// ═══════════════════════════════════════════════════════════════════════════
// STEP 9: VALIDATE TABS AND UI RENDERING
// ═══════════════════════════════════════════════════════════════════════════
log('\n═══════════════════════════════════════════════════════════════');
log('VALIDATING UI TAB RENDERING...');
log('═══════════════════════════════════════════════════════════════\n');

const tabs = [
  { id: 'strategicintent', label: 'Strategic Intent', content: '#strategicintent-content' },
  { id: 'bmc', label: 'Business Model Canvas', content: '#bmc-content' },
  { id: 'capmap', label: 'Capability Map', content: '#capmap-content' },
  { id: 'opmodel', label: 'Operating Model', content: '#opmodel-content' },
  { id: 'gap', label: 'Gap Analysis', content: '#insights' },
  { id: 'valuepools', label: 'Value Pools', content: '#valuepools-content' },
  { id: 'targetarch', label: 'Target Architecture', content: '#targetarch-content' },
  { id: 'roadmapvis', label: 'Roadmap', content: '#roadmapvis-content' },
  { id: 'layers', label: 'Architecture Layers', content: '#layers-content' },
];

for (const tab of tabs) {
  try {
    await page.evaluate(id => {
      if (typeof showTab === 'function') showTab(id);
    }, tab.id);
    await page.waitForTimeout(800);
    
    const text = await page.$eval(tab.content, el => el.innerText || el.textContent || '').catch(() => '');
    const rendered = text.length > 50;
    
    addStep(`Tab: ${tab.label}`, rendered ? 'PASS' : 'FAIL',
      rendered ? `${text.length} chars` : 'Empty or placeholder');
    
    await screenshot(page, `tab_${tab.id}`);
  } catch (e) {
    addStep(`Tab: ${tab.label}`, 'FAIL', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 10: VALIDATE GRAPH/VISUALIZATION GENERATION
// ═══════════════════════════════════════════════════════════════════════════
log('\n═══════════════════════════════════════════════════════════════');
log('VALIDATING GRAPH/VISUALIZATION GENERATION...');
log('═══════════════════════════════════════════════════════════════\n');

// Navigate to Architecture Layers tab
await page.evaluate(() => {
  if (typeof showTab === 'function') showTab('layers');
});
await page.waitForTimeout(1000);
await screenshot(page, 'architecture_layers_view');

const layersRendering = await page.evaluate(() => {
  const content = document.getElementById('layers-content');
  if (!content) return { error: 'layers-content not found' };
  
  const sections = {
    valueStreamsSection: !!content.querySelector('.layer-section-valuestreams, [data-layer="valuestreams"]'),
    systemsSection: !!content.querySelector('.layer-section-systems, [data-layer="systems"]'),
    aiAgentsSection: !!content.querySelector('.layer-section-agents, [data-layer="agents"]'),
    capabilitiesSection: !!content.querySelector('.layer-section-capabilities, [data-layer="capabilities"]'),
  };
  
  const itemCounts = {
    valueStreamItems: content.querySelectorAll('[data-type="valuestream"], .valuestream-item').length,
    systemItems: content.querySelectorAll('[data-type="system"], .system-item').length,
    agentItems: content.querySelectorAll('[data-type="agent"], .agent-item, .ai-agent-item').length,
    capabilityItems: content.querySelectorAll('[data-type="capability"], .capability-item').length,
  };
  
  return { sections, itemCounts, contentLength: content.innerText?.length || 0 };
});

report.graphValidation = layersRendering;

addStep('Architecture Layers UI: Value Streams section', 
  layersRendering.sections?.valueStreamsSection ? 'PASS' : 'WARN',
  `${layersRendering.itemCounts?.valueStreamItems || 0} items`);
addStep('Architecture Layers UI: Systems section',
  layersRendering.sections?.systemsSection ? 'PASS' : 'WARN',
  `${layersRendering.itemCounts?.systemItems || 0} items`);
addStep('Architecture Layers UI: AI Agents section',
  layersRendering.sections?.aiAgentsSection ? 'PASS' : 'WARN',
  `${layersRendering.itemCounts?.agentItems || 0} items`);
addStep('Architecture Layers UI: Capabilities section',
  layersRendering.sections?.capabilitiesSection ? 'PASS' : 'FAIL',
  `${layersRendering.itemCounts?.capabilityItems || 0} items`);

// Navigate to Target Architecture visualization
log('\nChecking Target Architecture visualization...');
await page.evaluate(() => {
  if (typeof showTab === 'function') showTab('targetarch');
});
await page.waitForTimeout(1000);
await screenshot(page, 'target_architecture_view');

const targetArchViz = await page.evaluate(() => {
  const content = document.querySelector('#targetarch-content, .target-architecture-viz');
  if (!content) return { error: 'Target architecture content not found' };
  
  return {
    hasCanvas: !!content.querySelector('canvas'),
    hasSVG: !!content.querySelector('svg'),
    hasCapabilityCards: content.querySelectorAll('.capability-card, [data-type="capability"]').length,
    contentLength: content.innerText?.length || 0,
  };
});

addStep('Target Architecture Visualization',
  (targetArchViz.hasCanvas || targetArchViz.hasSVG || targetArchViz.hasCapabilityCards > 0) ? 'PASS' : 'WARN',
  `Canvas: ${!!targetArchViz.hasCanvas}, SVG: ${!!targetArchViz.hasSVG}, Cards: ${targetArchViz.hasCapabilityCards}`);

// Navigate to Roadmap visualization
log('\nChecking Roadmap visualization...');
await page.evaluate(() => {
  if (typeof showTab === 'function') showTab('roadmapvis');
});
await page.waitForTimeout(1000);
await screenshot(page, 'roadmap_visualization');

const roadmapViz = await page.evaluate(() => {
  const content = document.querySelector('#roadmapvis-content, .roadmap-timeline');
  if (!content) return { error: 'Roadmap content not found' };
  
  return {
    hasTimeline: !!content.querySelector('.timeline, .roadmap-timeline, [data-type="timeline"]'),
    hasWaves: content.querySelectorAll('.wave-block, .roadmap-wave, [data-wave]').length,
    hasInitiatives: content.querySelectorAll('.initiative-card, [data-type="initiative"]').length,
    contentLength: content.innerText?.length || 0,
  };
});

addStep('Roadmap Timeline Visualization',
  (roadmapViz.hasTimeline || roadmapViz.hasWaves > 0 || roadmapViz.hasInitiatives > 0) ? 'PASS' : 'WARN',
  `Timeline: ${!!roadmapViz.hasTimeline}, Waves: ${roadmapViz.hasWaves}, Initiatives: ${roadmapViz.hasInitiatives}`);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 11: CLEANUP
// ═══════════════════════════════════════════════════════════════════════════
log('\n═══════════════════════════════════════════════════════════════');
log('CLEANUP...');
log('═══════════════════════════════════════════════════════════════\n');

if (testProjectId) {
  const deleted = await page.evaluate(projectId => {
    try {
      if (window.dataManager && typeof window.dataManager.deleteProject === 'function') {
        return window.dataManager.deleteProject(projectId);
      }
      const projects = JSON.parse(localStorage.getItem('ea_projects') || '{}');
      delete projects[projectId];
      localStorage.setItem('ea_projects', JSON.stringify(projects));
      localStorage.removeItem('ea_current_project');
      return true;
    } catch (e) {
      console.error('[E2E Cleanup] Error:', e);
      return false;
    }
  }, testProjectId);

  if (deleted) {
    log(`  ✓ Test project deleted: ${testProjectId}`);
    addStep('Cleanup: Delete test project', 'PASS');
  } else {
    log(`  ✗ Failed to delete: ${testProjectId}`);
    addStep('Cleanup: Delete test project', 'WARN', 'Manual cleanup may be needed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FINAL REPORT
// ═══════════════════════════════════════════════════════════════════════════
await browser.close();
await writeReport();

process.exit(report.summary.fail > 0 ? 1 : 0);
