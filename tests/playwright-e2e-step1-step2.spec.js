/**
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
    
    console.log(`✓ All ${testResults.summary.total} tests passed in ${testResults.duration}s`);
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
