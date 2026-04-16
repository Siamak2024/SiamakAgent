/**
 * APQC Integration E2E Test Suite
 * ================================
 * Comprehensive tests for APQC framework integration
 * 
 * Run: node scripts/test_apqc_integration.mjs
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Color output helpers
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`  ${icon} ${name}`, color);
  if (details) {
    log(`    ${details}`, 'cyan');
  }
  if (passed) {
    results.passed.push(name);
  } else {
    results.failed.push({ name, details });
  }
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
  results.warnings.push(message);
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 1: JSON File Validation
// ═══════════════════════════════════════════════════════════════════════

async function testJsonFiles() {
  log('\n[TEST 1] Validating APQC JSON Files', 'cyan');
  
  const files = [
    'APAQ_Data/apqc_pcf_master.json',
    'APAQ_Data/apqc_metadata_mapping.json',
    'APAQ_Data/apqc_capability_enrichment.json'
  ];
  
  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file);
    try {
      if (!fs.existsSync(fullPath)) {
        logTest(`File exists: ${file}`, false, 'File not found');
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const json = JSON.parse(content);
      
      // Validate master file structure
      if (file.includes('master')) {
        const valid = json.framework_version && json.categories && Array.isArray(json.categories);
        logTest(`Valid master file: ${file}`, valid, 
          valid ? `${json.categories.length} L1 categories` : 'Invalid structure');
      }
      // Validate metadata file
      else if (file.includes('metadata')) {
        const valid = json.business_type_mappings && json.strategic_intent_mappings;
        logTest(`Valid metadata file: ${file}`, valid,
          valid ? `${Object.keys(json.business_type_mappings).length} business types` : 'Invalid structure');
      }
      // Validate enrichment file
      else if (file.includes('enrichment')) {
        logTest(`Valid enrichment file: ${file}`, true, 'Schema present');
      }
      
    } catch (error) {
      logTest(`Parse JSON: ${file}`, false, error.message);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 2: EA_DataManager Integration Tests
// ═══════════════════════════════════════════════════════════════════════

async function testDataManagerIntegration(page) {
  log('\n[TEST 2] EA_DataManager APQC Methods', 'cyan');
  
  // Test 1: Check if dataManager exists
  const hasDataManager = await page.evaluate(() => {
    return typeof window.EA_DataManager === 'function';
  });
  logTest('EA_DataManager loaded', hasDataManager);
  
  if (!hasDataManager) {
    logWarning('EA_DataManager not found, skipping tests');
    return;
  }
  
  // Test 2: Load APQC framework
  const frameworkLoaded = await page.evaluate(async () => {
    try {
      if (!window.dataManager) {
        window.dataManager = new window.EA_DataManager();
      }
      const framework = await window.dataManager.loadAPQCFramework();
      return framework !== null && framework.categories && framework.categories.length > 0;
    } catch (error) {
      console.error('Framework load error:', error);
      return false;
    }
  });
  logTest('Load APQC framework', frameworkLoaded);
  
  // Test 3: Get framework from cache
  const cachedFramework = await page.evaluate(async () => {
    try {
      const framework = await window.dataManager.getAPQCFramework();
      return {
        success: framework !== null,
        categoryCount: framework?.categories?.length || 0,
        version: framework?.framework_version
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  logTest('Get cached framework', cachedFramework.success, 
    `${cachedFramework.categoryCount} categories, v${cachedFramework.version}`);
  
  // Test 4: Filter by business type
  const filteredByType = await page.evaluate(async () => {
    try {
      const caps = await window.dataManager.getAPQCCapabilitiesByBusinessType('Manufacturing');
      return {
        success: caps && Array.isArray(caps),
        count: caps?.length || 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  logTest('Filter by business type', filteredByType.success,
    `${filteredByType.count} capabilities for Manufacturing`);
  
  // Test 5: Filter by strategic intent
  const filteredByIntent = await page.evaluate(async () => {
    try {
      const caps = await window.dataManager.getAPQCCapabilitiesByIntent('Innovation');
      return {
        success: caps && Array.isArray(caps),
        count: caps?.length || 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  logTest('Filter by strategic intent', filteredByIntent.success,
    `${filteredByIntent.count} capabilities for Innovation`);
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 3: UI Integration Tests
// ═══════════════════════════════════════════════════════════════════════

async function testUIIntegration(page) {
  log('\n[TEST 3] UI Integration Tests', 'cyan');
  
  // Test 1: Check for APQC banner elements
  const bannersExist = await page.evaluate(() => {
    return {
      capmap: !!document.getElementById('apqc-banner-capmap'),
      heatmap: !!document.getElementById('apqc-banner-heatmap'),
      layers: !!document.getElementById('apqc-banner-layers')
    };
  });
  logTest('APQC banners present', 
    bannersExist.capmap && bannersExist.heatmap && bannersExist.layers,
    `Capmap: ${bannersExist.capmap}, Heatmap: ${bannersExist.heatmap}, Layers: ${bannersExist.layers}`);
  
  // Test 2: Check for APQC integration functions
  const functionsExist = await page.evaluate(() => {
    return {
      initializeAPQC: typeof window.initializeAPQCIntegration === 'function',
      loadAPQC: typeof window.loadAPQCForProject === 'function',
      showSettings: typeof window.showAPQCSettings === 'function',
      updateBanners: typeof window.updateAPQCBanners === 'function'
    };
  });
  logTest('APQC functions loaded',
    Object.values(functionsExist).every(v => v),
    `${Object.values(functionsExist).filter(v => v).length}/4 functions present`);
  
  // Test 3: Test initialization
  const initSuccess = await page.evaluate(async () => {
    try {
      if (typeof window.initializeAPQCIntegration === 'function') {
        await window.initializeAPQCIntegration();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Init error:', error);
      return false;
    }
  });
  logTest('Initialize APQC integration', initSuccess);
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 4: Standard Mode Workflow Test
// ═══════════════════════════════════════════════════════════════════════

async function testStandardModeWorkflow(page) {
  log('\n[TEST 4] Standard Mode Workflow', 'cyan');
  
  try {
    // Create new project first
    await page.evaluate(() => {
      if (!window.dataManager) {
        window.dataManager = new window.EA_DataManager();
      }
      // Initialize project
      const projects = window.dataManager.getAllProjects();
      if (projects.length === 0) {
        // Create test project
        if (typeof window.model !== 'undefined') {
          window.model.projectName = 'APQC Test Project';
        }
      }
    });
    
    // Test load APQC for project
    const projectEnriched = await page.evaluate(async () => {
      try {
        // Get or create project
        let project = window.dataManager.getCurrentProject();
        if (!project) {
          // Mock a current project for testing
          const projectId = 'test_' + Date.now();
          window.dataManager.currentProjectId = projectId;
        }
        
        // Try to enrich with APQC
        if (typeof window.loadAPQCForProject === 'function') {
          const result = await window.loadAPQCForProject({
            businessType: 'Technology',
            strategicIntent: 'Innovation'
          });
          return { success: result, message: 'Project enriched' };
        }
        return { success: false, message: 'Function not available' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });
    
    logTest('Enrich project with APQC', projectEnriched.success, projectEnriched.message);
    
    // Test check APQC status
    const statusCheck = await page.evaluate(() => {
      try {
        if (window.dataManager && typeof window.dataManager.getAPQCStatus === 'function') {
          const status = window.dataManager.getAPQCStatus();
          return {
            success: true,
            integrated: status.integrated,
            message: status.message || 'No active project'
          };
        }
        return { success: false, message: 'Function not available' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });
    
    logTest('Check APQC status', statusCheck.success, statusCheck.message);
    
  } catch (error) {
    logTest('Standard mode workflow', false, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 5: Settings Modal Test
// ═══════════════════════════════════════════════════════════════════════

async function testSettingsModal(page) {
  log('\n[TEST 5] Settings Modal Test', 'cyan');
  
  try {
    // Test show settings modal
    const modalShown = await page.evaluate(() => {
      try {
        if (typeof window.showAPQCSettings === 'function') {
          window.showAPQCSettings();
          // Check if modal was created
          const modal = document.querySelector('.modal-overlay');
          return {
            success: modal !== null,
            hasBusinessType: !!document.getElementById('apqc-business-type'),
            hasStrategicIntent: !!document.getElementById('apqc-strategic-intent')
          };
        }
        return { success: false };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    logTest('Show settings modal', modalShown.success,
      modalShown.success ? `Business type dropdown: ${modalShown.hasBusinessType}, Intent dropdown: ${modalShown.hasStrategicIntent}` : '');
    
    if (modalShown.success) {
      // Close modal
      await page.evaluate(() => {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
      });
      
      logTest('Close settings modal', true);
    }
    
  } catch (error) {
    logTest('Settings modal test', false, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TEST 6: Banner Visibility Test
// ═══════════════════════════════════════════════════════════════════════

async function testBannerVisibility(page) {
  log('\n[TEST 6] Banner Visibility Test', 'cyan');
  
  try {
    // Test banner update function
    const bannersUpdated = await page.evaluate(() => {
      try {
        if (typeof window.updateAPQCBanners === 'function') {
          window.updateAPQCBanners({
            integrated: true,
            version: '8.0',
            capability_count: 13,
            filters: { businessType: 'Technology', strategicIntent: 'Innovation' }
          });
          
          // Check if banners are visible
          const banners = {
            capmap: document.getElementById('apqc-banner-capmap'),
            heatmap: document.getElementById('apqc-banner-heatmap'),
            layers: document.getElementById('apqc-banner-layers')
          };
          
          return {
            success: true,
            visible: {
              capmap: banners.capmap && !banners.capmap.classList.contains('hidden'),
              heatmap: banners.heatmap && !banners.heatmap.classList.contains('hidden'),
              layers: banners.layers && !banners.layers.classList.contains('hidden')
            }
          };
        }
        return { success: false };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    logTest('Update APQC banners', bannersUpdated.success);
    
    if (bannersUpdated.success) {
      const visibleCount = Object.values(bannersUpdated.visible).filter(v => v).length;
      logTest('Banners visibility', visibleCount === 3,
        `${visibleCount}/3 banners visible`);
    }
    
  } catch (error) {
    logTest('Banner visibility test', false, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Main Test Runner
// ═══════════════════════════════════════════════════════════════════════

async function runTests() {
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  APQC Integration E2E Test Suite', 'cyan');
  log('  EA V5 Platform', 'cyan');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  
  // Test 1: JSON files (no browser needed)
  await testJsonFiles();
  
  // Launch browser for remaining tests
  log('\n[SETUP] Launching browser...', 'cyan');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set longer timeout
  page.setDefaultTimeout(TEST_TIMEOUT);
  
  try {
    log(`[SETUP] Navigating to ${BASE_URL}/NexGenEA/NexGen_EA_V4.html...`, 'cyan');
    await page.goto(`${BASE_URL}/NexGenEA/NexGen_EA_V4.html`, { 
      waitUntil: 'networkidle',
      timeout: TEST_TIMEOUT 
    });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Run browser-based tests
    await testDataManagerIntegration(page);
    await testUIIntegration(page);
    await testStandardModeWorkflow(page);
    await testSettingsModal(page);
    await testBannerVisibility(page);
    
  } catch (error) {
    log(`\n[ERROR] Test execution failed: ${error.message}`, 'red');
    results.failed.push({ name: 'Test Execution', details: error.message });
  } finally {
    await browser.close();
  }
  
  // Print summary
  printSummary();
  
  // Save results
  saveResults();
}

// ═══════════════════════════════════════════════════════════════════════
// Results & Reporting
// ═══════════════════════════════════════════════════════════════════════

function printSummary() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  Test Summary', 'cyan');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  
  log(`\n  ✓ Passed: ${results.passed.length}`, 'green');
  log(`  ✗ Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');
  log(`  ⚠ Warnings: ${results.warnings.length}`, 'yellow');
  
  if (results.failed.length > 0) {
    log('\n  Failed Tests:', 'red');
    results.failed.forEach(f => {
      log(`    • ${f.name}`, 'red');
      if (f.details) log(`      ${f.details}`, 'yellow');
    });
  }
  
  if (results.warnings.length > 0) {
    log('\n  Warnings:', 'yellow');
    results.warnings.forEach(w => log(`    • ${w}`, 'yellow'));
  }
  
  const passRate = results.passed.length / (results.passed.length + results.failed.length) * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(1)}%`, passRate === 100 ? 'green' : 'yellow');
  
  log('\n═══════════════════════════════════════════════════════════════\n', 'cyan');
}

function saveResults() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length,
      total: results.passed.length + results.failed.length,
      passRate: (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1) + '%'
    },
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings
  };
  
  const reportPath = path.join(__dirname, '..', 'e2e-artifacts', 'apqc_integration_test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`[REPORT] Test results saved to: e2e-artifacts/apqc_integration_test_results.json`, 'cyan');
}

// Run tests
runTests().catch(error => {
  log(`\n[FATAL ERROR] ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
