#!/usr/bin/env node
/**
 * EA Toolkits Validation Script
 * Validates all EA2_Toolkit integrations and functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const results = {
  pass: 0,
  fail: 0,
  warn: 0,
  checks: []
};

function log(status, message, details = '') {
  const symbols = { OK: '✓', FAIL: '✗', WARN: '⚠' };
  const statusColors = { OK: colors.green, FAIL: colors.red, WARN: colors.yellow };
  const symbol = symbols[status] || '•';
  const color = statusColors[status] || colors.cyan;
  
  console.log(`${color}[${symbol.padEnd(5)}]${colors.reset} ${message}${details ? colors.gray + ' — ' + details + colors.reset : ''}`);
  
  results.checks.push({ status, message, details });
  if (status === 'OK') results.pass++;
  else if (status === 'FAIL') results.fail++;
  else if (status === 'WARN') results.warn++;
}

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  } catch {
    return null;
  }
}

function fileExists(relPath) {
  try {
    return fs.existsSync(path.join(ROOT, relPath));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}    EA TOOLKITS VALIDATION${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

// Test 1: Check all toolkit files exist
console.log(`${colors.blue}▸ Test 1: Toolkit Files Existence${colors.reset}\n`);

const expectedToolkits = [
  { name: 'AI Business Model Canvas', path: 'EA2_Toolkit/AI Business Model Canvas.html' },
  { name: 'AI Value Chain Analyzer V2', path: 'EA2_Toolkit/AI Value Chain Analyzer V2.html' },
  { name: 'AI Capability Mapping V2', path: 'EA2_Toolkit/AI Capability Mapping V2.html' },
  { name: 'AI Strategy Workbench V2', path: 'EA2_Toolkit/AI Strategy Workbench V2.html' },
  { name: 'EA20 Maturity Toolbox V2', path: 'EA2_Toolkit/EA20 Maturity Toolbox V2.html' },
  { name: 'Application Portfolio Management', path: 'EA2_Toolkit/Application_Portfolio_Management.html' }
];

expectedToolkits.forEach(tk => {
  if (fileExists(tk.path)) {
    log('OK', `${tk.name} exists`, tk.path);
  } else {
    log('FAIL', `${tk.name} NOT FOUND`, tk.path);
  }
});

// Test 2: Check azure-deployment mirror
console.log(`\n${colors.blue}▸ Test 2: Azure Deployment Mirror${colors.reset}\n`);

expectedToolkits.forEach(tk => {
  const azurePath = 'azure-deployment/static/' + tk.path;
  if (fileExists(azurePath)) {
    log('OK', `${tk.name} mirrored to azure-deployment`, azurePath);
  } else {
    log('WARN', `${tk.name} missing in azure-deployment`, azurePath);
  }
});

// Test 3: Check NexGen HTML references
console.log(`\n${colors.blue}▸ Test 3: Toolkit Links in NexGen_EA_V4.html${colors.reset}\n`);

const mainHtml = readFile('NexGenEA/NexGen_EA_V4.html');
if (!mainHtml) {
  log('FAIL', 'Cannot read NexGenEA/NexGen_EA_V4.html');
} else {
  expectedToolkits.forEach(tk => {
    const linkPath = '../' + tk.path;
    if (mainHtml.includes(linkPath)) {
      log('OK', `Link to ${tk.name} found in HTML`, linkPath);
    } else {
      log('FAIL', `Link to ${tk.name} NOT FOUND in HTML`, linkPath);
    }
  });
}

// Test 4: Check sync functions exist
console.log(`\n${colors.blue}▸ Test 4: Sync Functions${colors.reset}\n`);

const syncFunctions = [
  'function syncToolkit',
  'function syncAllToolkits',
  'function mergeBmcIntoModel',
  'function mergeCapabilityIntoModel',
  'function mergeValueChainIntoModel',
  'function mergeStrategyIntoModel',
  'function mergeMaturityIntoModel'
];

if (mainHtml) {
  syncFunctions.forEach(fn => {
    if (mainHtml.includes(fn)) {
      log('OK', `${fn} exists`);
    } else {
      log('FAIL', `${fn} NOT FOUND`);
    }
  });
}

// Test 5: Check toolkits tab exists and is configured
console.log(`\n${colors.blue}▸ Test 5: Toolkits Tab Configuration${colors.reset}\n`);

if (mainHtml) {
  if (mainHtml.includes('id="tab-toolkits"')) {
    log('OK', 'Toolkits tab panel exists', 'id="tab-toolkits"');
  } else {
    log('FAIL', 'Toolkits tab panel NOT FOUND', 'id="tab-toolkits"');
  }
  
  if (mainHtml.includes("showTab('toolkits'")) {
    log('OK', 'Toolkits tab button exists', "showTab('toolkits')");
  } else {
    log('FAIL', 'Toolkits tab button NOT FOUND');
  }
  
  // Check if toolkits is marked as always available
  if (mainHtml.includes("'toolkits': () => true")) {
    log('OK', 'Toolkits tab is always unlocked', "contentChecks['toolkits']");
  } else {
    log('WARN', 'Toolkits tab unlock logic not found or changed');
  }
}

// Test 6: Check integration dashboard elements
console.log(`\n${colors.blue}▸ Test 6: Integration Dashboard${colors.reset}\n`);

const integrationElements = [
  'id="integration-dashboard"',
  'id="integration-bmc"',
  'id="integration-valuechain"',
  'id="integration-capability"',
  'id="integration-strategy"',
  'onclick="syncAllToolkits()"',
  'onclick="importFromValueChain()"',
  'onclick="exportForCapabilityMap()"'
];

if (mainHtml) {
  integrationElements.forEach(elem => {
    if (mainHtml.includes(elem)) {
      log('OK', `Integration element found: ${elem}`);
    } else {
      log('WARN', `Integration element missing: ${elem}`);
    }
  });
}

// Test 7: Check toolkit localStorage integration keys
console.log(`\n${colors.blue}▸ Test 7: LocalStorage Integration Keys${colors.reset}\n`);

const storageKeys = [
  'ea_integration_bmc_latest',
  'ea_integration_capability_latest',
  'ea_integration_valuechain_latest',
  'ea_integration_strategy_latest',
  'ea_integration_maturity_latest'
];

if (mainHtml) {
  storageKeys.forEach(key => {
    if (mainHtml.includes(key)) {
      log('OK', `Storage key referenced: ${key}`);
    } else {
      log('WARN', `Storage key not found: ${key}`);
    }
  });
}

// Test 8: Check if toolkit cards have proper structure
console.log(`\n${colors.blue}▸ Test 8: Toolkit Card Structure${colors.reset}\n`);

if (mainHtml) {
  const cardElements = [
    { name: 'Card headers', pattern: 'class="card-header' },
    { name: 'Card bodies', pattern: 'class="card-body' },
    { name: 'Card footers', pattern: 'class="card-footer' },
    { name: 'Open buttons', pattern: 'class="open-btn' },
    { name: 'Sync buttons', pattern: 'onclick="syncToolkit(' },
    { name: 'Use case scenarios', pattern: 'class="scenario-box' }
  ];
  
  cardElements.forEach(elem => {
    const count = (mainHtml.match(new RegExp(elem.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
      log('OK', `${elem.name}: ${count} found`);
    } else {
      log('FAIL', `${elem.name}: none found`);
    }
  });
}

// Test 9: Check sync log functionality
console.log(`\n${colors.blue}▸ Test 9: Sync Log Functionality${colors.reset}\n`);

if (mainHtml) {
  if (mainHtml.includes('id="sync-log"')) {
    log('OK', 'Sync log container exists');
  } else {
    log('WARN', 'Sync log container missing');
  }
  
  if (mainHtml.includes('function addSyncLog')) {
    log('OK', 'addSyncLog function exists');
  } else {
    log('WARN', 'addSyncLog function missing');
  }
}

// Test 10: Verify toolkit HTML files are valid
console.log(`\n${colors.blue}▸ Test 10: Toolkit HTML Validity${colors.reset}\n`);

expectedToolkits.forEach(tk => {
  const content = readFile(tk.path);
  if (!content) {
    log('FAIL', `Cannot read ${tk.name}`);
    return;
  }
  
  // Check for basic HTML structure
  if (content.includes('<!DOCTYPE') || content.includes('<html')) {
    log('OK', `${tk.name} has valid HTML structure`);
  } else {
    log('WARN', `${tk.name} missing HTML structure`);
  }
  
  // Check for localStorage export capability
  if (content.includes('localStorage.setItem')) {
    log('OK', `${tk.name} has localStorage export`);
  } else {
    log('WARN', `${tk.name} may not export to localStorage`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}    VALIDATION SUMMARY${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.green}✓ Passed:   ${results.pass}${colors.reset}`);
console.log(`${colors.red}✗ Failed:   ${results.fail}${colors.reset}`);
console.log(`${colors.yellow}⚠ Warnings: ${results.warn}${colors.reset}`);
console.log(`${colors.gray}Total:      ${results.checks.length}${colors.reset}\n`);

if (results.fail > 0) {
  console.log(`${colors.red}❌ VALIDATION FAILED${colors.reset} - ${results.fail} critical issue(s) found\n`);
  process.exit(1);
} else if (results.warn > 0) {
  console.log(`${colors.yellow}⚠️  VALIDATION PASSED WITH WARNINGS${colors.reset} - ${results.warn} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`${colors.green}✅ ALL CHECKS PASSED${colors.reset} - EA Toolkits are properly configured\n`);
  process.exit(0);
}
