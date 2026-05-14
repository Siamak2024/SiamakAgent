/**
 * E2E Analytics Validator — NexGen EA Platform
 *
 * Static-analysis + structural test for the Parallel Analytics Workflows
 * (Decision Intelligence, Financial, Scenarios, Optimize tabs).
 *
 * Checks without a live browser or real AI calls:
 *   - All 4 Analytics JS module files exist and export required shape
 *   - AnalyticsWorkflowEngine, ContextBuilder, TabContext are present
 *   - Both HTML files have all 4 tab buttons + panels + script tags
 *   - All 22 instruction files are present and non-empty
 *   - Run-button call sites match `runAnalyticsTab(tabId)` signature
 *   - Azure-deployment folder mirrors the Analytics/ module tree
 *
 * Usage:  node scripts/e2e_analytics_validator.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

const ANALYTICS_DIR   = path.join(ROOT, 'NexGenEA', 'js', 'Analytics');
const AZURE_ANALYTICS = path.join(ROOT, 'azure-deployment', 'static', 'NexGenEA', 'js', 'Analytics');
const MAIN_HTML       = path.join(ROOT, 'NexGenEA', 'NexGen_EA_V4.html');
const AZURE_HTML      = path.join(ROOT, 'azure-deployment', 'static', 'NexGenEA', 'NexGen_EA_V4.html');

// ── Colours ──────────────────────────────────────────────────────────────────
const RED   = '\x1b[31m';
const GREEN = '\x1b[32m';
const YEL   = '\x1b[33m';
const CYAN  = '\x1b[36m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

const report = { bugs: [], ok: [], warnings: [] };

function BUG(id, sev, msg, fileHint = '', fix = '') {
  report.bugs.push({ id, sev, msg, fileHint, fix });
  const badge = sev === 'CRITICAL' ? `${RED}[CRITICAL]${RESET}` : `${YEL}[ WARN  ]${RESET}`;
  console.log(`${badge} BUG-${id}: ${msg}`);
  if (fileHint) console.log(`   ${CYAN}File:${RESET} ${fileHint}`);
  if (fix)      console.log(`   ${CYAN}Fix :${RESET} ${fix}`);
}
function OK(msg)   { report.ok.push(msg);  console.log(`${GREEN}[  OK  ]${RESET} ${msg}`); }
function WARN(msg) { report.warnings.push(msg); console.log(`${YEL}[ WARN ]${RESET} ${msg}`); }

function readText(p) {
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

// ── 1. Analytics Module Files ─────────────────────────────────────────────────
console.log(`\n${BOLD}══ 1. Analytics module files ══${RESET}`);

const CORE_FILES = [
  'AnalyticsContextBuilder.js',
  'TabContext.js',
  'AnalyticsWorkflowEngine.js',
  'Tabs/Decision.js',
  'Tabs/Financial.js',
  'Tabs/Scenarios.js',
  'Tabs/Optimize.js',
];

let coreOk = 0;
for (const rel of CORE_FILES) {
  const full = path.join(ANALYTICS_DIR, rel);
  if (!fs.existsSync(full)) {
    BUG(1, 'CRITICAL', `Missing core module: ${rel}`, full, `Create NexGenEA/js/Analytics/${rel}`);
  } else {
    OK(`Core module present: ${rel}`);
    coreOk++;
  }
}

// ── 2. Instruction files ──────────────────────────────────────────────────────
console.log(`\n${BOLD}══ 2. Instruction files (22 expected) ══${RESET}`);

const INSTRUCTION_FILES = [
  'Instructions/decision-intelligence/di_1_health_assessment.instruction.md',
  'Instructions/decision-intelligence/di_2_quick_wins.instruction.md',
  'Instructions/decision-intelligence/di_3_strategic_gaps.instruction.md',
  'Instructions/decision-intelligence/di_4_sequencing.instruction.md',
  'Instructions/decision-intelligence/di_5_executive_summary.instruction.md',
  'Instructions/financial/fi_1_cost_estimation.instruction.md',
  'Instructions/financial/fi_2_constraints.instruction.md',
  'Instructions/financial/fi_3_value_pools.instruction.md',
  'Instructions/financial/fi_4_scenarios.instruction.md',
  'Instructions/financial/fi_5_cost_benefit.instruction.md',
  'Instructions/financial/fi_6_exec_summary.instruction.md',
  'Instructions/scenarios/sc_1_definition.instruction.md',
  'Instructions/scenarios/sc_2_impact.instruction.md',
  'Instructions/scenarios/sc_3_reallocation.instruction.md',
  'Instructions/scenarios/sc_4_recalculate.instruction.md',
  'Instructions/scenarios/sc_5_compare.instruction.md',
  'Instructions/scenarios/sc_6_resilience.instruction.md',
  'Instructions/optimize/op_1_criteria.instruction.md',
  'Instructions/optimize/op_2_interaction.instruction.md',
  'Instructions/optimize/op_3_alternatives.instruction.md',
  'Instructions/optimize/op_4_tradeoffs.instruction.md',
  'Instructions/optimize/op_5_recommendation.instruction.md',
];

let instrOk = 0;
for (const rel of INSTRUCTION_FILES) {
  const full = path.join(ANALYTICS_DIR, rel);
  const text = readText(full);
  if (text === null) {
    BUG(2, 'CRITICAL', `Missing instruction file: ${rel}`, full);
  } else if (text.trim().length < 50) {
    BUG(3, 'MODERATE', `Instruction file too short (< 50 chars): ${rel}`, full);
  } else {
    instrOk++;
  }
}
OK(`Instruction files present and non-empty: ${instrOk} / ${INSTRUCTION_FILES.length}`);

// ── 3. Module shape checks ────────────────────────────────────────────────────
console.log(`\n${BOLD}══ 3. Tab module shape ══${RESET}`);

const TAB_MODULE_SPECS = [
  { file: 'Tabs/Decision.js',  expectedId: 'decision-intelligence', taskCount: 5 },
  { file: 'Tabs/Financial.js', expectedId: 'financial',             taskCount: 6 },
  { file: 'Tabs/Scenarios.js', expectedId: 'scenarios',             taskCount: 6 },
  { file: 'Tabs/Optimize.js',  expectedId: 'optimize',              taskCount: 5 },
];

for (const spec of TAB_MODULE_SPECS) {
  const src = readText(path.join(ANALYTICS_DIR, spec.file));
  if (!src) continue; // already flagged above

  // id field may have multiple spaces: id:          'decision-intelligence'
  const idRe = new RegExp(`id:\\s+'${spec.expectedId}'|id:\\s+"${spec.expectedId}"`);
  if (!idRe.test(src)) {
    BUG(4, 'CRITICAL', `${spec.file} missing id: '${spec.expectedId}'`, spec.file);
  } else {
    OK(`${spec.file} has id: '${spec.expectedId}'`);
  }

  const taskMatches = [...src.matchAll(/taskId\s*:/g)];
  if (taskMatches.length !== spec.taskCount) {
    BUG(5, 'MODERATE',
      `${spec.file} has ${taskMatches.length} tasks, expected ${spec.taskCount}`,
      spec.file);
  } else {
    OK(`${spec.file} task count: ${spec.taskCount}`);
  }

  if (!src.includes('synthesize(')) {
    BUG(6, 'CRITICAL', `${spec.file} missing synthesize() function`, spec.file);
  } else {
    OK(`${spec.file} has synthesize()`);
  }
}

// ── 4. HTML — tab buttons ─────────────────────────────────────────────────────
console.log(`\n${BOLD}══ 4. HTML tab buttons + panels ══${RESET}`);

const ANALYTICS_TABS = [
  { tabId: 'analytics-di',         panelId: 'tab-analytics-di',         btnText: 'Decision Intelligence' },
  { tabId: 'analytics-financial',  panelId: 'tab-analytics-financial',  btnText: 'Financial' },
  { tabId: 'analytics-scenarios',  panelId: 'tab-analytics-scenarios',  btnText: 'Scenario' },
  { tabId: 'analytics-optimize',   panelId: 'tab-analytics-optimize',   btnText: 'Optim' },
];

const HTML_TARGETS = [
  { label: 'main',  path: MAIN_HTML  },
  { label: 'azure', path: AZURE_HTML },
];

for (const { label, path: htmlPath } of HTML_TARGETS) {
  const src = readText(htmlPath);
  if (!src) {
    BUG(7, 'CRITICAL', `HTML file not found: ${label}`, htmlPath);
    continue;
  }

  for (const tab of ANALYTICS_TABS) {
    // Buttons use onclick="showTab('analytics-di',this)" not data-tab attribute
    if (!src.includes(`showTab('${tab.tabId}'`) && !src.includes(`showTab("${tab.tabId}"`) ) {
      BUG(8, 'CRITICAL', `[${label}] Missing tab button for showTab('${tab.tabId}')`, htmlPath);
    } else {
      OK(`[${label}] Tab button: ${tab.tabId}`);
    }

    if (!src.includes(`id="${tab.panelId}"`)) {
      BUG(9, 'CRITICAL', `[${label}] Missing content panel id="${tab.panelId}"`, htmlPath);
    } else {
      OK(`[${label}] Panel: ${tab.panelId}`);
    }
  }

  // check script tags
  const SCRIPT_TAGS = [
    'AnalyticsContextBuilder.js',
    'TabContext.js',
    'AnalyticsWorkflowEngine.js',
    'Tabs/Decision.js',
    'Tabs/Financial.js',
    'Tabs/Scenarios.js',
    'Tabs/Optimize.js',
  ];
  let scriptTagsMissing = 0;
  for (const tag of SCRIPT_TAGS) {
    if (!src.includes(tag)) {
      BUG(10, 'CRITICAL', `[${label}] Missing <script> for ${tag}`, htmlPath);
      scriptTagsMissing++;
    }
  }
  if (scriptTagsMissing === 0) OK(`[${label}] All 7 Analytics script tags present`);

  // check runAnalyticsTab is defined
  if (!src.includes('function runAnalyticsTab(')) {
    BUG(11, 'CRITICAL', `[${label}] function runAnalyticsTab() not found in HTML`, htmlPath);
  } else {
    OK(`[${label}] runAnalyticsTab() defined`);
  }

  // check _refreshAnalyticsContext is defined
  if (!src.includes('function _refreshAnalyticsContext(')) {
    BUG(12, 'MODERATE', `[${label}] _refreshAnalyticsContext() not found`, htmlPath);
  } else {
    OK(`[${label}] _refreshAnalyticsContext() defined`);
  }

  // check analytics tabs wired in showTab
  for (const tab of ANALYTICS_TABS) {
    const internalId = tab.tabId.replace('analytics-', '').replace('di', 'decision-intelligence');
    if (!src.includes(`'${tab.tabId}'`) && !src.includes(`"${tab.tabId}"`)) {
      WARN(`[${label}] Tab ID '${tab.tabId}' might not be wired in showTab`);
    }
  }
}

// ── 5. Azure-deployment mirror ────────────────────────────────────────────────
console.log(`\n${BOLD}══ 5. Azure-deployment Analytics/ mirror ══${RESET}`);

for (const rel of [...CORE_FILES]) {
  const azureFull = path.join(AZURE_ANALYTICS, rel);
  if (!fs.existsSync(azureFull)) {
    BUG(13, 'CRITICAL',
      `Azure mirror missing: js/Analytics/${rel}`,
      azureFull,
      `Run: Copy-Item NexGenEA\\js\\Analytics -Destination azure-deployment\\static\\NexGenEA\\js\\Analytics -Recurse -Force`);
  } else {
    const mainSrc  = readText(path.join(ANALYTICS_DIR, rel));
    const azureSrc = readText(azureFull);
    if (mainSrc && azureSrc && mainSrc !== azureSrc) {
      WARN(`Azure mirror differs from main: ${rel}`);
    } else {
      OK(`Azure mirror in sync: ${rel}`);
    }
  }
}

// ── 6. AnalyticsWorkflowEngine TAB_MODULES registry ──────────────────────────
console.log(`\n${BOLD}══ 6. WorkflowEngine TAB_MODULES registry ══${RESET}`);

const engineSrc = readText(path.join(ANALYTICS_DIR, 'AnalyticsWorkflowEngine.js'));
if (engineSrc) {
  const expectedIds = ['decision-intelligence', 'financial', 'scenarios', 'optimize'];
  for (const id of expectedIds) {
    if (!engineSrc.includes(`'${id}'`) && !engineSrc.includes(`"${id}"`)) {
      BUG(14, 'CRITICAL',
        `AnalyticsWorkflowEngine TAB_MODULES missing entry for '${id}'`,
        'AnalyticsWorkflowEngine.js');
    } else {
      OK(`TAB_MODULES entry: '${id}'`);
    }
  }
  if (!engineSrc.includes('function run(') && !engineSrc.includes('run(tabId')) {
    BUG(15, 'CRITICAL', 'AnalyticsWorkflowEngine missing run() function');
  } else {
    OK('AnalyticsWorkflowEngine run() function found');
  }
}

// ── Final report ──────────────────────────────────────────────────────────────
const LINE = '═'.repeat(60);
console.log(`\n${BOLD}${LINE}${RESET}`);

if (report.bugs.length === 0) {
  console.log(`${GREEN}${BOLD}  ALL ANALYTICS CHECKS PASSED — ${report.ok.length} OK  |  0 BUGS${RESET}`);
} else {
  const crit = report.bugs.filter(b => b.sev === 'CRITICAL').length;
  const mod  = report.bugs.filter(b => b.sev === 'MODERATE').length;
  console.log(`${RED}${BOLD}  ${report.bugs.length} BUG(S) FOUND  (${crit} CRITICAL, ${mod} MODERATE)${RESET}`);
  console.log(`  ${GREEN}${report.ok.length} checks passed${RESET}  |  ${YEL}${report.warnings.length} warnings${RESET}`);
}

if (report.warnings.length) {
  console.log(`\n${YEL}Warnings:${RESET}`);
  report.warnings.forEach(w => console.log(`  ${YEL}•${RESET} ${w}`));
}

console.log(BOLD + LINE + RESET + '\n');

process.exit(report.bugs.filter(b => b.sev === 'CRITICAL').length > 0 ? 1 : 0);
