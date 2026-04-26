/**
 * Test Runner: Step 1 → Step 2 E2E Tests
 * 
 * Runs comprehensive E2E tests for the new 4-step workflow
 * covering Step 1 (Business Objectives) → Step 2 (APQC Capability Mapping)
 * 
 * Usage:
 *   node tests/run-step1-step2-e2e.js
 * 
 * Or in browser console:
 *   Run this script in the browser with NexGenEA_V11.html loaded
 */

const path = require('path');
const fs = require('fs');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function printHeader() {
  console.log('\n' + colors.bright + colors.cyan);
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║      NextGenEA V12 - Step 1 → Step 2 E2E Test Runner             ║');
  console.log('║                                                                    ║');
  console.log('║      4-Step Workflow with APQC PCF v8.0 Integration               ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset + '\n');
}

function printInstructions() {
  console.log(colors.bright + 'Test Environment Setup:' + colors.reset);
  console.log('');
  console.log('This E2E test suite must be run in a browser environment with:');
  console.log('  1. NexGenEA_V11.html loaded');
  console.log('  2. All Step files (Step0.js, Step1.js, Step2.js, Step3.js, Step4.js)');
  console.log('  3. StepEngine.js loaded');
  console.log('  4. EA_DataManager.js loaded (for APQC integration)');
  console.log('  5. APQC data files available (/APAQ_Data/)');
  console.log('');
  console.log(colors.bright + 'Running Tests:' + colors.reset);
  console.log('');
  console.log('  ' + colors.cyan + 'Option 1: Browser Console' + colors.reset);
  console.log('    1. Open NexGenEA_V11.html in browser');
  console.log('    2. Open Developer Console (F12)');
  console.log('    3. Run:');
  console.log('       ' + colors.yellow + 'const script = document.createElement("script");' + colors.reset);
  console.log('       ' + colors.yellow + 'script.src = "tests/E2E_Step1_Step2_4Step_Workflow_Test.js";' + colors.reset);
  console.log('       ' + colors.yellow + 'document.head.appendChild(script);' + colors.reset);
  console.log('    4. Then run:');
  console.log('       ' + colors.yellow + 'const test = new E2E_Step1_Step2_4Step_Workflow_Test();' + colors.reset);
  console.log('       ' + colors.yellow + 'await test.runAll();' + colors.reset);
  console.log('');
  console.log('  ' + colors.cyan + 'Option 2: Automated Browser Test' + colors.reset);
  console.log('    1. Install Playwright: ' + colors.yellow + 'npm install --save-dev @playwright/test' + colors.reset);
  console.log('    2. Run: ' + colors.yellow + 'npx playwright test tests/playwright-e2e-step1-step2.spec.js' + colors.reset);
  console.log('');
  console.log('  ' + colors.cyan + 'Option 3: Manual Test' + colors.reset);
  console.log('    1. Start dev server: ' + colors.yellow + '.\\dev-start.ps1' + colors.reset);
  console.log('    2. Navigate to http://localhost:8080/NexGenEA_V11.html');
  console.log('    3. Open DevTools Console');
  console.log('    4. Load and run test script (see Option 1)');
  console.log('');
}

function checkTestFile() {
  const testFilePath = path.join(__dirname, 'E2E_Step1_Step2_4Step_Workflow_Test.js');
  
  if (fs.existsSync(testFilePath)) {
    console.log(colors.green + '✓' + colors.reset + ' E2E test file found: ' + colors.dim + testFilePath + colors.reset);
    return true;
  } else {
    console.log(colors.red + '✗' + colors.reset + ' E2E test file NOT found: ' + colors.dim + testFilePath + colors.reset);
    return false;
  }
}

function checkAPQCData() {
  const apqcMasterPath = path.join(__dirname, '..', 'azure-deployment', 'static', 'NexGenEA', 'APAQ_Data', 'apqc_pcf_master.json');
  const apqcMetadataPath = path.join(__dirname, '..', 'azure-deployment', 'static', 'NexGenEA', 'APAQ_Data', 'apqc_metadata_mapping.json');
  
  if (fs.existsSync(apqcMasterPath)) {
    const stats = fs.statSync(apqcMasterPath);
    console.log(colors.green + '✓' + colors.reset + ' APQC master data found: ' + colors.dim + `${(stats.size / 1024 / 1024).toFixed(2)} MB` + colors.reset);
  } else {
    console.log(colors.red + '✗' + colors.reset + ' APQC master data NOT found: ' + colors.dim + apqcMasterPath + colors.reset);
  }
  
  if (fs.existsSync(apqcMetadataPath)) {
    console.log(colors.green + '✓' + colors.reset + ' APQC metadata found: ' + colors.dim + apqcMetadataPath + colors.reset);
  } else {
    console.log(colors.red + '✗' + colors.reset + ' APQC metadata NOT found: ' + colors.dim + apqcMetadataPath + colors.reset);
  }
}

function generatePlaywrightSpec() {
  const playwrightSpec = `/**
 * Playwright E2E Test: Step 1 → Step 2 (4-Step Workflow)
 * 
 * Automated browser test for NextGenEA V12
 * 
 * Install: npm install --save-dev @playwright/test
 * Run: npx playwright test tests/playwright-e2e-step1-step2.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('NextGenEA V12 - Step 1 → Step 2 E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8080/NexGenEA_V11.html');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should load all required modules', async ({ page }) => {
    // Check if core modules are loaded
    const modulesLoaded = await page.evaluate(() => {
      return {
        stepEngine: typeof StepEngine !== 'undefined',
        step1: typeof Step1 !== 'undefined',
        step2: typeof Step2 !== 'undefined',
        dataManager: typeof EA_DataManager !== 'undefined'
      };
    });

    expect(modulesLoaded.stepEngine).toBe(true);
    expect(modulesLoaded.step1).toBe(true);
    expect(modulesLoaded.step2).toBe(true);
    expect(modulesLoaded.dataManager).toBe(true);
  });

  test('should run E2E tests in browser', async ({ page }) => {
    // Load the test file
    await page.addScriptTag({
      path: './tests/E2E_Step1_Step2_4Step_Workflow_Test.js'
    });

    // Run tests
    const testResults = await page.evaluate(async () => {
      const testRunner = new E2E_Step1_Step2_4Step_Workflow_Test();
      return await testRunner.runAll();
    });

    // Verify tests passed
    expect(testResults.passed).toBe(true);
    expect(testResults.summary.failed).toBe(0);
    
    console.log(\`✓ All \${testResults.summary.total} tests passed in \${testResults.duration}s\`);
  });

  test('should display 4-step workflow in sidebar', async ({ page }) => {
    // Check workflow sidebar
    const step1 = await page.locator('#step-1').textContent();
    const step2 = await page.locator('#step-2').textContent();
    const step3 = await page.locator('#step-3').textContent();
    const step4 = await page.locator('#step-4').textContent();

    expect(step1).toContain('Business Objectives');
    expect(step2).toContain('APQC Capability Mapping');
    expect(step3).toContain('Target Architecture');
    expect(step4).toContain('Transformation Roadmap');
  });

  test('should hide legacy steps 5-6', async ({ page }) => {
    const step5 = await page.locator('#step-5');
    const step6 = await page.locator('#step-6');

    await expect(step5).toHaveClass(/hidden/);
    await expect(step6).toHaveClass(/hidden/);
  });
});
`;

  const specPath = path.join(__dirname, 'playwright-e2e-step1-step2.spec.js');
  fs.writeFileSync(specPath, playwrightSpec);
  console.log(colors.green + '✓' + colors.reset + ' Generated Playwright test spec: ' + colors.dim + specPath + colors.reset);
}

// Main execution
function main() {
  printHeader();
  
  console.log(colors.bright + 'Pre-flight Checks:' + colors.reset);
  console.log('');
  
  checkTestFile();
  checkAPQCData();
  
  console.log('');
  
  try {
    generatePlaywrightSpec();
    console.log('');
  } catch (error) {
    console.log(colors.yellow + '⚠' + colors.reset + ' Could not generate Playwright spec: ' + error.message);
  }
  
  printInstructions();
  
  console.log(colors.bright + colors.cyan + 'Ready to test!' + colors.reset);
  console.log('Follow the instructions above to run E2E tests.\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
