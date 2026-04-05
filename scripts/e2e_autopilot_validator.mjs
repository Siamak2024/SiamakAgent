/**
 * E2E Autopilot Validator — NexGen EA Platform
 * 
 * Static-analysis + mock-runtime test for the full Autopilot Flow.
 * Discovers bugs without needing a real browser or live AI calls.
 *
 * Test scenario:
 *   "A mid-size swedish real estate company having operational and governance 
 *    problems due to legacy ERP and property management platforms, causing 
 *    heavily manual administration, personal dependency and problem with data quality."
 *
 * Usage:  node scripts/e2e_autopilot_validator.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const MAIN_HTML = path.join(ROOT, 'NexGenEA', 'NexGen_EA_V4.html');
const STEP_ENGINE = path.join(ROOT, 'NexGenEA', 'js', 'Steps', 'StepEngine.js');
const STEP_CONTEXT = path.join(ROOT, 'NexGenEA', 'js', 'Steps', 'StepContext.js');
const STEP_FILES  = [1,2,3,4,5,6,7].map(n => path.join(ROOT, 'NexGenEA', 'js', 'Steps', `Step${n}.js`));

const COMPANY_DESCRIPTION = 
  'A mid-size swedish real estate company having operational and governance problems ' +
  'due to legacy ERP and property management platforms, causing heavily manual administration, ' +
  'personal dependency and problem with data quality.';

// ── Colours ─────────────────────────────────────────────────────────────────
const RED   = '\x1b[31m';
const GREEN = '\x1b[32m';
const YEL   = '\x1b[33m';
const CYAN  = '\x1b[36m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

// ── Report accumulator ───────────────────────────────────────────────────────
const report = {
  bugs:    [],  // { id, severity, description, file, line, fix }
  ok:      [],  // { description }
  warnings: []
};

function BUG(id, severity, description, file, fix) {
  report.bugs.push({ id, severity, description, file, fix });
  const badge = severity === 'CRITICAL' ? `${RED}[CRITICAL]${RESET}` : `${YEL}[MODERATE]${RESET}`;
  console.log(`${badge} BUG-${id}: ${description}`);
  if (fix) console.log(`   ${CYAN}Fix:${RESET} ${fix}`);
}
function OK(description) {
  report.ok.push({ description });
  console.log(`${GREEN}[  OK  ]${RESET} ${description}`);
}
function WARN(description) {
  report.warnings.push(description);
  console.log(`${YEL}[ WARN ]${RESET} ${description}`);
}

// ── File reading helpers ─────────────────────────────────────────────────────
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(`Cannot read: ${filePath}`);
    return '';
  }
}

function grepLine(content, pattern) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return { found: true, line: i + 1, text: lines[i].trim() };
  }
  return { found: false };
}

function grepAll(content, pattern) {
  const lines = content.split('\n');
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) results.push({ line: i + 1, text: lines[i].trim() });
  }
  return results;
}

// ── Load source files ────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}  NexGen EA — Autopilot E2E Validator${RESET}`);
console.log(`${CYAN}═══════════════════════════════════════════════════════════${RESET}\n`);
console.log(`Test Scenario: "${COMPANY_DESCRIPTION.slice(0,80)}..."\n`);

const html   = readFile(MAIN_HTML);
const engine = readFile(STEP_ENGINE);
const ctx    = readFile(STEP_CONTEXT);
const steps  = STEP_FILES.map(f => ({ name: path.basename(f), content: readFile(f) }));

// ────────────────────────────────────────────────────────────────────────────
// TEST 1: Autopilot State — Does runFullAutopilotFlow mark Step1 as done?
// ────────────────────────────────────────────────────────────────────────────
console.log(`${BOLD}[TEST 1]${RESET} Autopilot: Step1 Dependency Check`);

const autopilotFlowMatch = grepLine(html, /await generateAutopilotStrategicIntent\(\)/);
const step1CompletedInFlow = grepLine(html, /model\.steps\.step1.*status.*completed|steps\.step1.*completed/);
const strategicIntentConfirmed = grepLine(html, /strategicIntentConfirmed\s*=\s*true/);

if (!step1CompletedInFlow.found && !strategicIntentConfirmed.found) {
  BUG(1, 'CRITICAL',
    'runFullAutopilotFlow: Step1 is NOT marked as completed after generateAutopilotStrategicIntent(). ' +
    'StepEngine._validateDependencies("step2") checks model.steps.step1.status==="completed" AND ' +
    'legacy fallback !!model.strategicIntentConfirmed. Both are false → Step2 throws dependency error.',
    'NexGen_EA_V4.html (runFullAutopilotFlow)',
    'After await generateAutopilotStrategicIntent(), add: ' +
    'window.model.strategicIntentConfirmed = true; window.model.steps = window.model.steps || {}; ' +
    'window.model.steps.step1 = { id:"step1", status:"completed", completedAt: new Date().toISOString() };'
  );
} else {
  OK('Step1 completion is marked in runFullAutopilotFlow');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 2: StepEngine — Does _runQuestionTask auto-answer in autopilot mode?
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 2]${RESET} Question Tasks in Autopilot Mode`);

const autopilotAutoAnswer = grepLine(engine, /_autopilotState.*running|autopilot.*auto.*answer|auto.*question/i);
const questionTaskFn = grepLine(engine, /function _runQuestionTask/);
const questionCardShow = grepLine(engine, /QuestionCard\.show/);

if (!autopilotAutoAnswer.found) {
  BUG(2, 'CRITICAL',
    'StepEngine._runQuestionTask() has NO autopilot bypass. Step6 task "step6_option_select" and ' +
    'Step7 task "step7_roadmap_validate" have type:"question" — they call QuestionCard.show() ' +
    'which hangs forever waiting for user input. Autopilot never completes.',
    'StepEngine.js (_runQuestionTask)',
    'At the start of _runQuestionTask(), add: if (window._autopilotState?.running) { ' +
    'const autoAnswer = questionData?.options?.[0] || "Confirm"; ' +
    'return { taskId, output: taskDef.wrapAnswer(autoAnswer, ctx), aiResult: null }; }'
  );
} else {
  OK('StepEngine._runQuestionTask has autopilot bypass logic');
}

// Verify which steps have question tasks
const questionTasks = [];
steps.forEach(s => {
  const matches = grepAll(s.content, /type:\s*['"]question['"]/);
  if (matches.length) {
    questionTasks.push({ step: s.name, count: matches.length, lines: matches.map(m => m.line) });
  }
});
if (questionTasks.length > 0) {
  console.log(`  ${YEL}⚠${RESET}  Question tasks found:`);
  questionTasks.forEach(t => console.log(`       ${t.step}: ${t.count} question task(s) at lines ${t.lines.join(',')}`));
  if (!autopilotAutoAnswer.found) {
    BUG('2b', 'CRITICAL',
      `Steps with "type:question" tasks: ${questionTasks.map(t=>t.step).join(', ')}. These WILL block autopilot.`,
      'StepEngine.js',
      'See BUG-2 fix above'
    );
  }
} else {
  OK('No question-type tasks found (or all have autopilot handling)');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 3: StepContext — companyDescription fallback to model.description
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 3]${RESET} StepContext.companyDescription Fallback`);

const getDescFn = grepLine(ctx, /function _getDescription/);
const descFallback = grepLine(ctx, /model\.description|companyDescription.*model\./);
const domReadOnly = grepLine(ctx, /getElementById.*description.*\.value/);

if (domReadOnly.found && !descFallback.found) {
  BUG(5, 'CRITICAL',
    'StepContext._buildBase() reads companyDescription ONLY from DOM element #description. ' +
    'In Autopilot mode, description is in window._autopilotState.context.companyDescription and ' +
    'model.description — but NOT in the #description input element. All StepEngine steps 2-7 ' +
    'will receive empty companyDescription in their context.',
    'StepContext.js (_buildBase)',
    'Change: companyDescription: _getDescription() ' +
    '→ companyDescription: _getDescription() || model.description || \'\''
  );
} else {
  OK('StepContext companyDescription has fallback to model.description');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 4: Strategic Intent Schema Compatibility
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 4]${RESET} Strategic Intent Schema Compatibility`);

// Autopilot SI generates: strategic_ambition, strategic_themes, success_metrics, strategic_constraints
// Steps 2-7 expect: strategic_ambition, strategic_themes, success_metrics, KEY_CONSTRAINTS (not strategic_constraints),
//                   burning_platform, investigation_scope, expected_outcomes, industry, timeframe

const autopilotSISchema = grepAll(html, /strategic_constraints|key_constraints/);
const siInstructions    = grepLine(html, /burning_platform|investigation_scope|expected_outcomes/);

// Check what Step2+ context uses
const step2Content = steps.find(s => s.name === 'Step2.js')?.content || '';
const usesKeyConstraints = grepLine(step2Content, /si\.key_constraints/);
const usesStrategicConstraints = grepLine(step2Content, /si\.strategic_constraints/);

if (usesKeyConstraints.found && !usesStrategicConstraints.found) {
  // Check if autopilot SI normalizes the field
  const normalizesSchema = grepLine(html, /key_constraints.*strategic_constraints|strategic_constraints.*key_constraints/);
  if (!normalizesSchema.found) {
    BUG(10, 'CRITICAL',
      'Schema mismatch: Autopilot Step1 generates "strategic_constraints" but Steps 2-7 read ' +
      '"key_constraints" (si.key_constraints). Also missing: burning_platform, investigation_scope, ' +
      'expected_outcomes, industry, timeframe. Steps 2-7 will have empty context for these fields.',
      'NexGen_EA_V4.html (generateAutopilotStrategicIntent)',
      'After JSON.parse(), normalize: strategicIntent.key_constraints = strategicIntent.key_constraints ' +
      '|| strategicIntent.strategic_constraints || []; strategicIntent.burning_platform = ...; ' +
      'strategicIntent.investigation_scope = strategicIntent.strategic_themes || []; etc.'
    );
  } else {
    OK('Autopilot SI schema normalized: strategic_constraints → key_constraints');
  }
}

// Check StepContext summarize uses ambition+themes+constraints fields
const ctxSummarize = grepLine(ctx, /si\.burning_platform|burning_platform/);
if (!ctxSummarize.found) {
  WARN('StepContext.summarize() might not include burning_platform (minor — only affects quality of AI context)');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 5: renderOperatingModel() — handles new schema?
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 5]${RESET} renderOperatingModel() Schema Compatibility`);

const opModelRenderFn = grepLine(html, /function renderOperatingModel/);
const opModelCheck    = grepLine(html, /!om\.valueProposition|om\.valueProposition/);
const opModelNewSchema = grepLine(html, /om\.target|operatingModel\.target|operatingModel\.current/);

if (opModelCheck.found && !opModelNewSchema.found) {
  BUG(6, 'MODERATE',
    'renderOperatingModel() checks "if (!om || !om.valueProposition) return" (old schema). ' +
    'Step4 now writes model.operatingModel = { current: {...}, target: {...} }. ' +
    'The function ALWAYS returns early (opmodel tab stays empty) because valueProposition is never set.',
    'NexGen_EA_V4.html (renderOperatingModel)',
    'Update renderOperatingModel() to support both schemas: check for om.target (new format) ' +
    'and render current/target operating model dimensions (people, org, processes, data, apps, technology).'
  );
} else {
  OK('renderOperatingModel() handles new schema { current, target }');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 6: renderTargetArchVisual() — expects flat array, Step7 writes object
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 6]${RESET} renderTargetArchVisual() Schema Compatibility`);

const targetArchRenderFn = grepLine(html, /function renderTargetArchVisual/);
const targetArchArrayCheck = grepLine(html, /!data\.length.*targetarch|model\.targetArch.*\[\]/);
const step7ArchOutput = grepAll(steps.find(s=>s.name==='Step7.js')?.content || '', /targetArch:|targetArchData:/);

// Check what Step7 applyOutput does
const step7Content = steps.find(s => s.name === 'Step7.js')?.content || '';
const step7ApplyOutput = grepLine(step7Content, /legacyTargetArch|targetArch.*\[|initiatives.*legac/i);

if (!step7ApplyOutput.found) {
  BUG(8, 'MODERATE',
    'renderTargetArchVisual() expects model.targetArch as a FLAT ARRAY of {name, domain, currentMaturity, targetMaturity}. ' +
    'Step7.applyOutput() sets model.targetArch = output.targetArch which is a complex object ' +
    '{business_architecture, data_architecture, application_architecture, technology_architecture}. ' +
    'Target Architecture tab always shows "Click Target Arch to generate" placeholder.',
    'NexGenEA/js/Steps/Step7.js (applyOutput)',
    'In Step7.applyOutput(), build a flat legacy targetArch array from model.capabilities ' +
    '(Step3 output) enriched with Step7 intentions. Also set model.initiatives from roadmap.waves.'
  );
} else {
  OK('Step7.applyOutput bridges targetArch to legacy flat array');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 7: renderRoadmapVisual()/renderInitiatives() — reads model.initiatives
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 7]${RESET} Roadmap rendering schema`);

const roadmapRenderCheck = grepLine(html, /model\.initiatives.*!model\.initiatives/);
const initRenderCheck    = grepLine(html, /model\.initiatives.*forEach|function renderInitiatives/);
const step7InitBridge    = grepLine(step7Content, /model\.initiatives|initiatives.*legacy|legacyInitiatives/i);

if (!step7InitBridge.found) {
  BUG(7, 'MODERATE',
    'renderRoadmapVisual() and renderInitiatives() read from model.initiatives (old flat array). ' +
    'Step7.applyOutput() does NOT set model.initiatives — it sets model.roadmap = { waves: [...] }. ' +
    'Roadmap and Initiatives tabs stay empty.',
    'NexGenEA/js/Steps/Step7.js (applyOutput)',
    'In Step7.applyOutput(), convert roadmap.waves[].initiatives[] to flat model.initiatives array ' +
    'with { name, impactsCapability, phase (mapped from horizon), estimatedBusinessValue, complexity, priority }.'
  );
} else {
  OK('Step7.applyOutput sets model.initiatives for legacy render functions');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 8: Missing render wrapper functions
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 8]${RESET} Render Wrapper Functions`);

const RENDER_WRAPPERS = [
  'renderBMCSection',
  'renderCapabilitySection',
  'renderBenchmarkSection',
  'renderOperatingModelSection',
  'renderGapAnalysisSection',
  'renderQuickWinsSection',
  'renderValuePoolsSection',
  'renderTargetArchSection',
  'renderRoadmapSection'
];

const missingWrappers = [];
RENDER_WRAPPERS.forEach(fn => {
  const def = grepLine(html, new RegExp(`function ${fn}`));
  if (!def.found) missingWrappers.push(fn);
});

if (missingWrappers.length > 0) {
  BUG(4, 'MODERATE',
    `Missing render wrapper functions called by Step onComplete hooks: ${missingWrappers.join(', ')}. ` +
    'These functions are checked with typeof guard (no crash), but tabs will NOT auto-render after step completion.',
    'NexGen_EA_V4.html',
    'Add wrapper functions that delegate to existing render functions. E.g.: ' +
    'function renderBMCSection() { if (typeof renderBMCCanvas === "function") renderBMCCanvas(); }'
  );
} else {
  OK('All render wrapper functions are defined');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 9: showTab() — missing auto-renders for opmodel, gap, targetarch, roadmapvis
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 9]${RESET} showTab() Auto-Render Coverage`);

const TAB_RENDERS = {
  'opmodel':    'renderOperatingModel',
  'targetarch': 'renderTargetArchVisual',
  'roadmapvis': 'renderRoadmapVisual',
  'gap':        'renderGapContent'
};

const showTabBlock = (() => {
  const start = html.indexOf('function showTab(');
  const end   = html.indexOf('\nfunction ', start + 1);
  return html.slice(start, end > start ? end : start + 3000);
})();

const missingTabRenders = [];
Object.entries(TAB_RENDERS).forEach(([tab, fn]) => {
  const hasRender = showTabBlock.includes(`name === '${tab}'`) || showTabBlock.includes(`name==='${tab}'`);
  if (!hasRender) missingTabRenders.push({ tab, fn });
});

if (missingTabRenders.length > 0) {
  BUG(9, 'MODERATE',
    `showTab() is missing auto-render calls for tabs: ${missingTabRenders.map(t=>t.tab).join(', ')}. ` +
    'Users navigating to these tabs will see "Click to generate" placeholder even after Autopilot completes.',
    'NexGen_EA_V4.html (showTab)',
    `Add: ${missingTabRenders.map(t => `if (name === '${t.tab}') setTimeout(${t.fn}, 50);`).join(' ')}`
  );
} else {
  OK('showTab() has auto-render calls for all data tabs');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 10: StepEngine — dependency _checkLegacyFlag for step4
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 10]${RESET} StepEngine Legacy Flag Check for step4`);

const legacyFlagStep4 = grepLine(engine, /case 'step4'.*operatingModel.*valueProposition|step4.*valueProposition/);
if (legacyFlagStep4.found) {
  WARN(
    'StepEngine._checkLegacyFlag("step4") checks model.operatingModel?.valueProposition ' +
    '(old schema). New Step4 writes model.operatingModel = {current,target}. ' +
    'This is only the fallback — primary check uses model.steps.step4.status which is set correctly. ' +
    'Low risk but should be updated for consistency.'
  );
} else {
  OK('StepEngine legacy flag for step4 is updated or not needed');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 11: Gap Analysis — model.priorityGaps used in rendering?
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 11]${RESET} Gap Analysis tab rendering`);

const gapTabContent = (() => {
  const start = html.indexOf('id="tab-gap"');
  return html.slice(start, start + 500);
})();

const insightsEl = grepLine(html, /id=['""]insights['"]/);
const formatGapOutput = grepLine(html, /formatGapAnalysisOutput|function formatGap/);
const priorityGapsRender = grepLine(html, /model\.priorityGaps.*render|renderGap.*priorityGaps/);

if (insightsEl.found && !priorityGapsRender.found) {
  BUG('11', 'MODERATE',
    'Gap Analysis tab has #insights div but renders only model.gapAnalysisRaw (old format). ' +
    'Step5 writes model.priorityGaps and model.gapAnalysis (new format). ' +
    'Gap Analysis tab will stay empty after Autopilot runs Step5.',
    'NexGen_EA_V4.html',
    'Add renderGapContent() function that reads model.priorityGaps and model.gapAnalysis and ' +
    'renders to #insights. Call it in showTab() for "gap" tab and in renderGapAnalysisSection().'
  );
} else {
  OK('Gap Analysis tab has rendering logic for new model.priorityGaps format');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 12: Value Pools — model.valuePools rendered?
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 12]${RESET} Value Pools Panel Rendering`);

const valuePoolsPanel = grepLine(html, /function renderValuePoolsPanel/);
const valuePoolsModel = grepLine(html, /model\.valuePools/);

if (valuePoolsPanel.found && valuePoolsModel.found) {
  OK('renderValuePoolsPanel() exists and reads model.valuePools');
} else {
  WARN('renderValuePoolsPanel() or model.valuePools reference not found');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 13: Autopilot context — companyDescription passed to generateAutopilotStrategicIntent?
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 13]${RESET} Autopilot companyDescription flow`);

const autopilotContextDesc = grepLine(html, /awaitingCompanyDescription\s*=\s*true/);
const setCompanyDesc = grepLine(html, /context\.companyDescription\s*=/);
const modelDescSet = grepLine(html, /model\.description\s*=\s*actualCompanyDesc/);

if (autopilotContextDesc.found && setCompanyDesc.found && modelDescSet.found) {
  OK('Autopilot flow captures companyDescription in both _autopilotState.context and model.description');
} else {
  WARN('Company description capture flow may be incomplete — check _autopilotState.context.companyDescription');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 14: Both files (main + azure) are in sync
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 14]${RESET} File Sync: main vs azure-deployment`);

const AZURE_HTML = path.join(ROOT, 'azure-deployment', 'static', 'NexGenEA', 'NexGen_EA_V4.html');
const AZURE_STEP_DIR = path.join(ROOT, 'azure-deployment', 'static', 'NexGenEA', 'js', 'Steps');

const azureHtml = readFile(AZURE_HTML);
if (html === azureHtml) {
  OK('NexGen_EA_V4.html is identical in main and azure-deployment');
} else {
  const mainLen = html.length;
  const azureLen = azureHtml.length;
  BUG('14', 'MODERATE',
    `NexGen_EA_V4.html differs between main (${mainLen} bytes) and azure-deployment (${azureLen} bytes). ` +
    'Deployment will use the azure copy which may be stale.',
    'azure-deployment/static/NexGenEA/NexGen_EA_V4.html',
    'Run: Copy-Item NexGenEA/NexGen_EA_V4.html azure-deployment/static/NexGenEA/NexGen_EA_V4.html -Force'
  );
}

// Check Step JS files
const AZURE_STEP_FILES = [1,2,3,4,5,6,7].map(n => path.join(AZURE_STEP_DIR, `Step${n}.js`));
AZURE_STEP_FILES.forEach((azFile, i) => {
  const srcFile = STEP_FILES[i];
  const srcContent = readFile(srcFile);
  const azContent = readFile(azFile);
  if (srcContent !== azContent) {
    WARN(`Step${i+1}.js differs from azure-deployment copy`);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// TEST 15: StepEngine STEP_MODULES has 'step7' key
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 15]${RESET} StepEngine STEP_MODULES includes step7`);

const step7InRegistry = grepLine(engine, /step7\s*:\s*\(\)\s*=>/);
if (!step7InRegistry.found) {
  BUG(15, 'CRITICAL',
    'StepEngine STEP_MODULES does not have a "step7" key. ' +
    'StepEngine.run("step7") throws "Step module step7 is not loaded" and Autopilot crashes at Step 7.',
    'NexGenEA/js/Steps/StepEngine.js (STEP_MODULES)',
    'Add: step7: () => typeof Step7 !== "undefined" ? Step7 : null, to STEP_MODULES registry.'
  );
} else {
  OK('StepEngine STEP_MODULES has "step7" key — StepEngine.run("step7") will work');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 16: Step5 sets gapAnalysisDone flag to unlock Gap tab
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 16]${RESET} Step5.applyOutput sets gapAnalysisDone flag`);

const step5Content = steps.find(s => s.name === 'Step5.js')?.content || '';
const gapDoneFlag  = grepLine(step5Content, /gapAnalysisDone\s*:\s*true/);
const lockCheck    = grepLine(html, /gapAnalysisDone/);

if (!gapDoneFlag.found || !lockCheck.found) {
  BUG(16, 'CRITICAL',
    'Step5.applyOutput() does not set model.gapAnalysisDone = true. ' +
    'updateTabLockStates() checks "\'gap\': () => !!model.gapAnalysisDone" to unlock the Gap tab. ' +
    'After Autopilot Step5, the Gap tab stays locked (grey) and user cannot see gap analysis results.',
    'NexGenEA/js/Steps/Step5.js (applyOutput)',
    'Add gapAnalysisDone: true to the object returned by applyOutput().'
  );
} else {
  OK('Step5.applyOutput sets gapAnalysisDone = true — Gap tab will unlock after Step 5');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 17: Step7 sets targetArchDone flag to unlock Target Arch + Roadmap tabs
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 17]${RESET} Step7.applyOutput sets targetArchDone flag`);

const step7Content2 = steps.find(s => s.name === 'Step7.js')?.content || '';
const archDoneFlag  = grepLine(step7Content2, /targetArchDone\s*:\s*true/);
const archLockCheck = grepLine(html, /targetArchDone/);

if (!archDoneFlag.found || !archLockCheck.found) {
  BUG(17, 'CRITICAL',
    'Step7.applyOutput() does not set model.targetArchDone = true. ' +
    'updateTabLockStates() checks "\'targetarch\': () => !!model.targetArchDone" and ' +
    '"\'roadmapvis\': () => !!model.targetArchDone". After Autopilot, both tabs stay locked.',
    'NexGenEA/js/Steps/Step7.js (applyOutput)',
    'Add targetArchDone: true to the object returned by applyOutput().'
  );
} else {
  OK('Step7.applyOutput sets targetArchDone = true — Target Arch + Roadmap tabs unlock after Step 7');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 18: Architecture Layers — valueStreams/systems/aiAgents populated by autopilot
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 18]${RESET} Architecture Layers: valueStreams/systems/aiAgents populated`);

const layersPopulate = grepLine(step7Content2, /valueStreams.*applyOutput|applyOutput.*valueStreams|model\.valueStreams\s*=|valueStreams\s*:/);
const systemsPopulate = grepLine(step7Content2, /systems.*applyOutput|applyOutput.*systems|systems\s*:/);

if (!layersPopulate.found || !systemsPopulate.found) {
  BUG(18, 'MODERATE',
    'Architecture Layers tab shows only Capabilities after Autopilot. ' +
    'model.valueStreams, model.systems, model.aiAgents are never populated by Steps 1-7. ' +
    'Only Capability section shows content. Värdeflöde, System and AI-Agenter sections are empty.',
    'NexGenEA/js/Steps/Step7.js (applyOutput)',
    'In Step7.applyOutput(), derive model.valueStreams from capability domains, ' +
    'model.systems from operatingModel.current.applications.core_systems + targetArch key_platforms, ' +
    'model.aiAgents from targetArch.technology_architecture.ai_agents if present.'
  );
} else {
  OK('Step7.applyOutput derives valueStreams/systems/aiAgents for Architecture Layers tab');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 19: OM tab shows Value Proposition from BMC
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 19]${RESET} Operating Model tab shows Value Proposition from BMC`);

const omShowsVP = grepLine(html, /bmc\.value_proposition|vpBanner|Value Proposition.*Business Model/);
if (!omShowsVP.found) {
  BUG(19, 'MODERATE',
    'renderOperatingModel() does not show the Value Proposition from the BMC (Step2). ' +
    'Operating Model tab has no "value proposition" context visible to the user. ' +
    'POLDAT grid shows people/org/processes/data/apps/tech but no VP/customer context.',
    'NexGen_EA_V4.html (renderOperatingModel)',
    'Add a vpBanner block at the top of renderOperatingModel() that reads model.bmc.value_proposition.'
  );
} else {
  OK('renderOperatingModel() shows Value Proposition from BMC as header context');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 20: Step3.synthesize() — sets domain and maturity fields
// REGRESSION: Capability Map was empty because c.domain was never set, and
// renderLayers showed "Mundefined" because c.maturity was never set.
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 20]${RESET} Step3.synthesize() — sets domain and maturity fields`);

const step3Content = steps.find(s => s.name === 'Step3.js')?.content || '';
const step3SetsDomain   = grepLine(step3Content, /domain\s*:\s*domain\.name/);
const step3SetsMat      = grepLine(step3Content, /maturity\s*:\s*domMaturity|maturity\s*:\s*domainRating\.current_maturity/);
const step3ChildDomain  = grepLine(step3Content, /domain\s*:\s*domain\.name.*which L1 domain|\/\/ which L1 domain/);
const step3ChildMat     = grepLine(step3Content, /maturity\s*:\s*capRating\.current_maturity/);

if (!step3SetsDomain.found) {
  BUG(20, 'CRITICAL',
    'Step3.synthesize() does NOT set c.domain on capability objects. ' +
    'renderCapMap() filters model.capabilities by c.domain — without this field every domain column is empty. ' +
    'Also Step7.applyOutput() derives valueStreams from c.domain — valueStreams layer is empty.',
    'NexGenEA/js/Steps/Step3.js (synthesize)',
    'Add domain: domain.name to the capabilities push() inside the domains.forEach loop.'
  );
} else {
  OK('Step3.synthesize() sets domain field — renderCapMap domain column filter works');
}

if (!step3SetsMat.found) {
  BUG('20b', 'CRITICAL',
    'Step3.synthesize() does NOT set c.maturity on capability objects. ' +
    'renderLayers() shows "M${c.maturity}" — without maturity field this renders as "Mundefined". ' +
    'renderCapMap() also uses class="m${c.maturity}" for colour coding — all tiles are unstyled.',
    'NexGenEA/js/Steps/Step3.js (synthesize)',
    'Add maturity: domainRating.current_maturity || 1 to the capabilities push() call.'
  );
} else {
  OK('Step3.synthesize() sets maturity field — renderLayers M-badge and renderCapMap colour classes work');
}

if (!step3ChildMat.found) {
  WARN('Step3.synthesize() may not set maturity on L2 child capabilities — renderCapMap l1_domains mode uses child maturity');
} else {
  OK('Step3.synthesize() sets maturity on L2 children — l1_domains dynamic mode colours correctly');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 21: renderCapMap() — dynamic l1_domains mode implemented
// REGRESSION: renderCapMap() used 7 hardcoded columns (Customer/Product/Operations/etc.)
// AI never generates these exact domain names → all columns always empty.
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 21]${RESET} renderCapMap() — dynamic l1_domains column support`);

const capMapUsesL1Domains    = grepLine(html, /capabilityMap.*l1_domains|l1Domains.*capabilityMap/);
const capMapDynamicCols      = grepLine(html, /domainsToRender|l1Domains\.length.*>\s*0/);
const capMapRebuildsGrid     = grepLine(html, /capGrid\.innerHTML\s*=\s*cols/);
const capMapHasLegacyFallback = grepLine(html, /Legacy fallback.*fixed 7-column|fixed 7-column.*layout/);

if (!capMapUsesL1Domains.found || !capMapDynamicCols.found) {
  BUG(21, 'CRITICAL',
    'renderCapMap() does NOT use model.capabilityMap.l1_domains for dynamic columns. ' +
    'It still uses 7 hardcoded domain names. AI-generated domains (e.g. "Portfolio Management", ' +
    '"Asset Operations") never match those → Capability Map is always empty after Autopilot.',
    'NexGen_EA_V4.html (renderCapMap)',
    'Rewrite renderCapMap() to check model.capabilityMap.l1_domains first. ' +
    'If present, build columns dynamically from l1_domains names showing l2_capabilities inside each column. ' +
    'Fall back to the static 7-column layout only when l1_domains is empty (legacy saved data).'
  );
} else {
  OK('renderCapMap() reads model.capabilityMap.l1_domains — shows AI-generated domain columns');
}

if (!capMapRebuildsGrid.found) {
  WARN('renderCapMap() may not rebuild cap-grid innerHTML dynamically — columns may be static HTML');
} else {
  OK('renderCapMap() dynamically rebuilds cap-grid — correct number of columns rendered');
}

if (!capMapHasLegacyFallback.found) {
  WARN('renderCapMap() may be missing legacy fallback for old data without l1_domains');
} else {
  OK('renderCapMap() has legacy fallback for saved data without l1_domains');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 22: renderLayers() — uses c.maturity (not c.current_maturity)
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 22]${RESET} renderLayers() — Architecture Layers maturity badge`);

const renderLayersFn = (() => {
  const start = html.indexOf('function renderLayers()');
  return html.slice(start, start + 1500);
})();
const layersUsesMat    = /M\$\{c\.maturity/.test(renderLayersFn);
const layersUsesCurMat = /current_maturity/.test(renderLayersFn);

if (!layersUsesMat && !layersUsesCurMat) {
  WARN('renderLayers() body not found or maturity badge reference unclear');
} else if (layersUsesCurMat && !layersUsesMat) {
  BUG(22, 'MODERATE',
    'renderLayers() references c.current_maturity for the maturity badge "M${c.current_maturity}". ' +
    'But Step3.synthesize() sets the field as current_maturity on the object. ' +
    'Check if the badge shows undefined.',
    'NexGen_EA_V4.html (renderLayers)',
    'Ensure Step3.synthesize() also sets maturity: current_maturity || 1 (shortcut field for renderLayers).'
  );
} else {
  OK('renderLayers() uses c.maturity for badge — matches Step3.synthesize() maturity field');
}

// ────────────────────────────────────────────────────────────────────────────
// TEST 23: Step7 valueStreams — uses level=1 capability names (not c.domain)
// REGRESSION: Old code used c.domain which was never set → empty valueStreams
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}[TEST 23]${RESET} Step7 valueStreams — derived from level=1 capability names`);

const step7vsContent = steps.find(s => s.name === 'Step7.js')?.content || '';
const vsUsesLevel1 = grepLine(step7vsContent, /filter.*level.*===.*1|level\s*===\s*1.*filter/);
const vsUsesCapMap = grepLine(step7vsContent, /capabilityMap.*l1_domains|l1_domains.*capabilityMap/);
const vsOldCode    = grepLine(step7vsContent, /map\(c => c\.domain\)\.filter\(Boolean\)/);

if (vsOldCode.found && !vsUsesLevel1.found) {
  BUG(23, 'CRITICAL',
    'Step7.applyOutput() derives valueStreams using "(model.capabilities || []).map(c => c.domain).filter(Boolean)". ' +
    'Before this patch, c.domain was never set by Step3.synthesize() → domains array is always [] → ' +
    'valueStreams is always [] → Architecture Layers "Value Streams" section is permanently empty.',
    'NexGenEA/js/Steps/Step7.js (applyOutput valueStreams)',
    'Change derivation to: model.capabilities.filter(c => c.level === 1).map(c => c.domain || c.name) ' +
    'OR model.capabilityMap?.l1_domains?.map(d => d.name)'
  );
} else if (vsUsesLevel1.found || vsUsesCapMap.found) {
  OK('Step7 valueStreams derivation uses level=1 capability names or l1_domains — Architecture Layers populated');
} else {
  WARN('Step7 valueStreams derivation logic unclear — verify Architecture Layers shows Value Streams');
}

// ────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}  VALIDATION SUMMARY${RESET}`);
console.log(`${CYAN}═══════════════════════════════════════════════════════════${RESET}`);

const critical = report.bugs.filter(b => b.severity === 'CRITICAL');
const moderate = report.bugs.filter(b => b.severity === 'MODERATE');

console.log(`\n${GREEN}✓  Passed:   ${report.ok.length}${RESET}`);
console.log(`${RED}✗  Critical: ${critical.length}${RESET}`);
console.log(`${YEL}⚠  Moderate: ${moderate.length}${RESET}`);
console.log(`${YEL}⚠  Warnings: ${report.warnings.length}${RESET}`);

if (critical.length > 0) {
  console.log(`\n${BOLD}CRITICAL BUGs (will break Autopilot flow):${RESET}`);
  critical.forEach(b => console.log(`  ${RED}• BUG-${b.id}:${RESET} ${b.description.slice(0,90)}...`));
}

if (moderate.length > 0) {
  console.log(`\n${BOLD}MODERATE BUGs (tabs show placeholders):${RESET}`);
  moderate.forEach(b => console.log(`  ${YEL}• BUG-${b.id}:${RESET} ${b.description.slice(0,90)}...`));
}

// Write JSON report
const reportPath = path.join(ROOT, 'e2e-artifacts', 'autopilot_validation_report.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n${CYAN}Full report: ${reportPath}${RESET}\n`);

// Exit code based on critical bugs
if (critical.length > 0) {
  console.log(`${RED}RESULT: FAILED — ${critical.length} critical bug(s) must be fixed before Autopilot works.${RESET}\n`);
  process.exit(1);
} else if (moderate.length > 0) {
  console.log(`${YEL}RESULT: PARTIAL — Autopilot flow runs but tabs may not render correctly.${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${GREEN}RESULT: PASSED — All tests passed!${RESET}\n`);
  process.exit(0);
}
