/**
 * E2E test: Capability Workshop Builder
 * Scenario: Technology company with PropTech focus
 * Tests: Form validation, AI industry lookup, APQC import, workshop-to-toolkit handoff
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const WORKSHOP_URL = `${BASE_URL}/NexGenEA/EA2_Toolkit/Capability_Workshop_Builder.html`;
const TOOLKIT_URL = `${BASE_URL}/NexGenEA/EA2_Toolkit/AI Capability Mapping V2.html`;

const TEST_DATA = {
  org: 'Riksbyggen',
  industry: 'Real Estate',
  focus: 'digital',
  orgDesc: 'Vi är ett fastighetsbolag som digitaliserar hyresgästupplevelsen. Vi har 15,000 lägenheter och fokuserar på AI-driven prediktiv underhåll och digital kundtjänst.',
  themes: ['AI & Automation', 'Customer Experience', 'Digital Channels']
};

const STEP_TIMEOUT = 120_000; // 2 min for AI calls

process.on('unhandledRejection', (reason) => {
  console.log(`[E2E] Unhandled rejection (non-fatal): ${String(reason).slice(0, 200)}`);
});

const artifactsDir = path.resolve('e2e-artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(),
  scenario: 'Capability Workshop Builder',
  testData: TEST_DATA,
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  warnings: [],
  localStorage: {},
  finalStatus: 'UNKNOWN'
};

function log(msg) {
  const ts = new Date().toISOString().split('T')[1].replace('Z','');
  console.log(`[${ts}] ${msg}`);
}

function addStep(name, status, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`${icon} ${name}${detail ? ': ' + detail : ''}`);
  report.steps.push({ name, status, detail, at: new Date().toISOString() });
}

log('=== Starting Capability Workshop Builder E2E Test ===');

const browser = await chromium.launch({ 
  channel: 'msedge', 
  headless: false, 
  slowMo: 300 
});
const context = await browser.newContext({ 
  viewport: { width: 1440, height: 900 } 
});
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    report.consoleErrors.push(text);
    log(`  [console error] ${text}`);
  }
  if (msg.type() === 'warn') {
    report.warnings.push(msg.text());
  }
});

page.on('pageerror', err => {
  report.pageErrors.push(err.message);
  log(`  [page error] ${err.message.slice(0, 200)}`);
});

async function screenshot(name) {
  try {
    const file = path.join(artifactsDir, `workshop_${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    log(`  Screenshot: ${file}`);
  } catch (e) {
    log(`  Screenshot failed (${name}): ${e.message}`);
  }
}

async function waitForElement(selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function getLocalStorage() {
  return await page.evaluate(() => {
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storage[key] = localStorage.getItem(key);
    }
    return storage;
  });
}

try {
  // ═══════════════════════════════════════════════════════════
  // STEP 1: Page Load & Initial State
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 1: Page Load & Initial State ---');
  
  await page.goto(WORKSHOP_URL, { waitUntil: 'networkidle' });
  await screenshot('01_page_loaded');
  
  // Check header
  const headerExists = await waitForElement('h1');
  if (headerExists) {
    const headerText = await page.textContent('h1');
    if (headerText.includes('Capability Mapping Workshop Builder')) {
      addStep('Page header correct', 'PASS', headerText);
    } else {
      addStep('Page header incorrect', 'FAIL', headerText);
    }
  } else {
    addStep('Page header missing', 'FAIL');
  }
  
  // Check step indicator
  const stepIndicator = await waitForElement('#step-wrap');
  if (stepIndicator) {
    addStep('Step indicator rendered', 'PASS');
  } else {
    addStep('Step indicator missing', 'FAIL');
  }
  
  // Check initial step is active
  const step1Active = await page.$eval('#si-1', el => el.classList.contains('active'));
  if (step1Active) {
    addStep('Step 1 is active', 'PASS');
  } else {
    addStep('Step 1 not active', 'FAIL');
  }
  
  // ═══════════════════════════════════════════════════════════
  // STEP 2: Form Validation (Step 1)
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 2: Form Validation ---');
  
  // Try to proceed without filling form (should fail)
  await page.click('.btn-next');
  await page.waitForTimeout(500);
  
  // Check if toast appears
  const toastVisible = await page.isVisible('#toast.show');
  if (toastVisible) {
    const toastText = await page.textContent('#toast');
    addStep('Validation toast appears', 'PASS', toastText);
  } else {
    addStep('Validation toast missing', 'FAIL');
  }
  
  await screenshot('02_validation_failed');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 3: Fill Step 1 Form
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 3: Fill Step 1 Form ---');
  
  // Fill organization
  await page.fill('#f-org', TEST_DATA.org);
  addStep('Organization field filled', 'PASS', TEST_DATA.org);
  
  // Fill industry manually (will test AI lookup separately)
  await page.fill('#f-industry', TEST_DATA.industry);
  addStep('Industry field filled', 'PASS', TEST_DATA.industry);
  
  // Select focus
  await page.selectOption('#f-focus', TEST_DATA.focus);
  addStep('Strategic focus selected', 'PASS', TEST_DATA.focus);
  
  // Fill organization description
  await page.fill('#f-org-desc', TEST_DATA.orgDesc);
  addStep('Organization description filled', 'PASS');
  
  // Click theme tags
  for (const theme of TEST_DATA.themes) {
    const tags = await page.$$('.tag');
    for (const tag of tags) {
      const text = await tag.textContent();
      if (text.trim() === theme) {
        await tag.click();
        await page.waitForTimeout(200);
        const isSelected = await tag.evaluate(el => el.classList.contains('sel'));
        if (isSelected) {
          addStep(`Theme selected: ${theme}`, 'PASS');
        } else {
          addStep(`Theme selection failed: ${theme}`, 'FAIL');
        }
        break;
      }
    }
  }
  
  await screenshot('03_step1_filled');
  
  // Click checklist items
  const checkItems = await page.$$('.citem');
  for (const item of checkItems) {
    await item.click();
    await page.waitForTimeout(100);
  }
  addStep('Checklist items clicked', 'PASS', `${checkItems.length} items`);
  
  await screenshot('03b_checklist_checked');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 4: AI Industry Lookup (if API key available)
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 4: AI Industry Lookup Test ---');
  
  // Clear industry field
  await page.fill('#f-industry', '');
  
  // Click AI lookup button
  const apiKey = await page.evaluate(() => {
    const keys = ['ea20_openai_key','openai_api_key','strategy_openai_key','ea_openai_key'];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    return null;
  });
  
  if (apiKey && apiKey.startsWith('sk-')) {
    addStep('API key found', 'PASS');
    
    await page.click('#btn-lookup-industry');
    await page.waitForTimeout(500);
    
    // Check if button shows spinner
    const btnText = await page.textContent('#btn-lookup-industry');
    if (btnText.includes('Söker')) {
      addStep('AI lookup initiated', 'PASS');
    } else {
      addStep('AI lookup not initiated', 'WARN');
    }
    
    // Wait for industry to be populated (max 30 seconds)
    try {
      await page.waitForFunction(
        () => document.getElementById('f-industry').value.length > 0,
        { timeout: 30000 }
      );
      const detectedIndustry = await page.inputValue('#f-industry');
      addStep('AI industry detection completed', 'PASS', detectedIndustry);
    } catch {
      addStep('AI industry detection timeout', 'FAIL');
      // Fill manually as fallback
      await page.fill('#f-industry', TEST_DATA.industry);
    }
  } else {
    addStep('API key not available, skipping AI lookup', 'WARN');
    await page.fill('#f-industry', TEST_DATA.industry);
  }
  
  await screenshot('04_ai_lookup_done');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 5: Navigate to Step 2
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 5: Navigate to Step 2 ---');
  
  await page.click('.btn-next');
  await page.waitForTimeout(1000);
  
  // Check step 2 is active
  const step2Active = await page.$eval('#si-2', el => el.classList.contains('active'));
  if (step2Active) {
    addStep('Navigated to Step 2', 'PASS');
  } else {
    addStep('Navigation to Step 2 failed', 'FAIL');
  }
  
  // Check step 1 is marked done
  const step1Done = await page.$eval('#si-1', el => el.classList.contains('done'));
  if (step1Done) {
    addStep('Step 1 marked as done', 'PASS');
  } else {
    addStep('Step 1 not marked done', 'FAIL');
  }
  
  // Check progress bar
  const progWidth = await page.$eval('#prog', el => el.style.width);
  if (progWidth === '55%') {
    addStep('Progress bar updated', 'PASS', progWidth);
  } else {
    addStep('Progress bar incorrect', 'WARN', progWidth);
  }
  
  await screenshot('05_step2_loaded');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 6: APQC AI Import
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 6: APQC AI Import ---');
  
  if (apiKey && apiKey.startsWith('sk-')) {
    await page.click('#btn-apqc');
    await page.waitForTimeout(500);
    
    // Check if button shows spinner
    const btnText = await page.textContent('#btn-apqc');
    if (btnText.includes('spinner')) {
      addStep('APQC import initiated', 'PASS');
    } else {
      addStep('APQC import not showing spinner', 'WARN');
    }
    
    // Wait for result box to appear (max 2 minutes)
    try {
      await page.waitForSelector('#apqc-result.show', { timeout: STEP_TIMEOUT });
      
      const resultText = await page.textContent('#apqc-result');
      if (resultText.includes('AI-filtrering klar') || resultText.includes('capabilities importerade')) {
        addStep('APQC import successful', 'PASS');
        
        // Extract capability count from result
        const countMatch = resultText.match(/(\d+) capabilities/);
        if (countMatch) {
          const capCount = parseInt(countMatch[1]);
          addStep('Capabilities imported', 'PASS', `${capCount} capabilities`);
          
          if (capCount >= 10 && capCount <= 30) {
            addStep('Capability count in valid range', 'PASS', `${capCount} (10-30 expected)`);
          } else {
            addStep('Capability count outside expected range', 'WARN', `${capCount} (10-30 expected)`);
          }
        }
        
        // Check if preview is visible
        const previewVisible = await page.isVisible('#capability-preview');
        if (previewVisible) {
          addStep('Capability preview displayed', 'PASS');
          
          // Check preview content
          const previewContent = await page.textContent('#cap-preview-list');
          if (previewContent.length > 0) {
            addStep('Capability preview has content', 'PASS');
          } else {
            addStep('Capability preview empty', 'FAIL');
          }
        } else {
          addStep('Capability preview not visible', 'FAIL');
        }
        
        // Check if next button is enabled
        const nextBtnDisabled = await page.$eval('#btn-next-2', el => el.disabled);
        if (!nextBtnDisabled) {
          addStep('Next button enabled after import', 'PASS');
        } else {
          addStep('Next button still disabled', 'FAIL');
        }
        
      } else if (resultText.includes('misslyckades')) {
        addStep('APQC import failed', 'FAIL', resultText);
      } else {
        addStep('APQC result unclear', 'WARN', resultText.slice(0, 100));
      }
    } catch {
      addStep('APQC import timeout', 'FAIL', 'No result after 2 minutes');
    }
  } else {
    addStep('Skipping APQC import (no API key)', 'WARN');
    // Use manual workshop instead
    await page.click('button:has-text("Starta Tom Workshop")');
    await page.waitForTimeout(500);
    const nextBtnDisabled = await page.$eval('#btn-next-2', el => el.disabled);
    if (!nextBtnDisabled) {
      addStep('Manual workshop mode activated', 'PASS');
    } else {
      addStep('Manual workshop activation failed', 'FAIL');
    }
  }
  
  await screenshot('06_apqc_import_done');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 7: Navigate to Step 3
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 7: Navigate to Step 3 ---');
  
  await page.click('#btn-next-2');
  await page.waitForTimeout(1000);
  
  const step3Active = await page.$eval('#si-3', el => el.classList.contains('active'));
  if (step3Active) {
    addStep('Navigated to Step 3', 'PASS');
  } else {
    addStep('Navigation to Step 3 failed', 'FAIL');
  }
  
  // Check progress bar is at 100%
  const finalProgWidth = await page.$eval('#prog', el => el.style.width);
  if (finalProgWidth === '100%') {
    addStep('Progress bar at 100%', 'PASS');
  } else {
    addStep('Progress bar not at 100%', 'WARN', finalProgWidth);
  }
  
  await screenshot('07_step3_loaded');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 8: Verify Summary Display
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 8: Verify Summary ---');
  
  // Check summary fields
  const sumOrg = await page.textContent('#sum-org');
  if (sumOrg === TEST_DATA.org) {
    addStep('Summary organization correct', 'PASS', sumOrg);
  } else {
    addStep('Summary organization incorrect', 'FAIL', `Expected: ${TEST_DATA.org}, Got: ${sumOrg}`);
  }
  
  const sumIndustry = await page.textContent('#sum-industry');
  if (sumIndustry.length > 0) {
    addStep('Summary industry populated', 'PASS', sumIndustry);
  } else {
    addStep('Summary industry empty', 'FAIL');
  }
  
  const sumFocus = await page.textContent('#sum-focus');
  if (sumFocus.includes('digital') || sumFocus.includes('Digital')) {
    addStep('Summary focus correct', 'PASS', sumFocus);
  } else {
    addStep('Summary focus incorrect', 'WARN', sumFocus);
  }
  
  const sumThemes = await page.textContent('#sum-themes');
  const hasThemes = TEST_DATA.themes.some(t => sumThemes.includes(t));
  if (hasThemes) {
    addStep('Summary themes populated', 'PASS', sumThemes.slice(0, 50));
  } else {
    addStep('Summary themes incorrect', 'FAIL', sumThemes);
  }
  
  await screenshot('08_summary_verified');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 9: Test JSON Export
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 9: Test JSON Export ---');
  
  // Listen for download
  const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
  
  await page.click('button:has-text("Exportera JSON")');
  await page.waitForTimeout(500);
  
  const download = await downloadPromise;
  if (download) {
    addStep('JSON export triggered', 'PASS', await download.suggestedFilename());
    
    // Save download to artifacts
    const downloadPath = path.join(artifactsDir, 'workshop_export.json');
    await download.saveAs(downloadPath);
    
    // Validate JSON structure
    try {
      const jsonContent = fs.readFileSync(downloadPath, 'utf-8');
      const data = JSON.parse(jsonContent);
      
      if (data.schema_version === '2.0') {
        addStep('Export schema version correct', 'PASS', '2.0');
      } else {
        addStep('Export schema version incorrect', 'FAIL', data.schema_version);
      }
      
      if (data.toolkit === 'capability_mapping') {
        addStep('Export toolkit identifier correct', 'PASS');
      } else {
        addStep('Export toolkit identifier incorrect', 'FAIL', data.toolkit);
      }
      
      if (data.source === 'workshop_builder') {
        addStep('Export source identifier correct', 'PASS');
      } else {
        addStep('Export source identifier incorrect', 'WARN', data.source);
      }
      
      if (data.capabilities && typeof data.capabilities === 'object') {
        const capCount = Object.values(data.capabilities).flat().length;
        addStep('Export contains capabilities', 'PASS', `${capCount} capabilities`);
      } else {
        addStep('Export missing capabilities', 'WARN');
      }
      
      if (data.context && data.context.org === TEST_DATA.org) {
        addStep('Export context correct', 'PASS');
      } else {
        addStep('Export context incorrect', 'FAIL');
      }
      
    } catch (e) {
      addStep('JSON export validation failed', 'FAIL', e.message);
    }
  } else {
    addStep('JSON export not triggered', 'WARN');
  }
  
  await screenshot('09_export_tested');
  
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // STEP 10: Launch to Toolkit
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 10: Launch to Toolkit ---');
  
  // Click launch button and wait for navigation
  const navigationPromise = page.waitForURL(/AI.*Capability.*Mapping.*V2\.html\?from=workshop/, { timeout: 10000 });
  
  await page.click('.btn-launch');
  await page.waitForTimeout(500);
  
  // Check toast appears
  const launchToastVisible = await page.isVisible('#toast.show');
  if (launchToastVisible) {
    const toastText = await page.textContent('#toast');
    addStep('Launch toast appears', 'PASS', toastText.slice(0, 50));
  } else {
    addStep('Launch toast missing', 'WARN');
  }
  
  await screenshot('10_launch_initiated');
  
  // Wait for navigation
  try {
    await navigationPromise;
    addStep('Navigated to main toolkit', 'PASS');
  } catch {
    addStep('Navigation to toolkit timeout', 'FAIL');
  }
  
  // ═══════════════════════════════════════════════════════════
  // STEP 11: Verify Workshop Import in Main Toolkit
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 11: Verify Workshop Import ---');
  
  await page.waitForTimeout(2000); // Wait for page to fully load
  await screenshot('11_toolkit_loaded');
  
  // Check APQC hero section is visible
  const heroVisible = await page.isVisible('#apqc-hero-section');
  if (heroVisible) {
    addStep('APQC hero section visible', 'PASS');
    
    const heroText = await page.textContent('#apqc-hero-section');
    if (heroText.includes(TEST_DATA.org) || heroText.includes('Scenario')) {
      addStep('APQC hero shows workshop context', 'PASS');
    } else {
      addStep('APQC hero missing workshop context', 'WARN');
    }
  } else {
    addStep('APQC hero section not visible', 'WARN');
  }
  
  // Check workshop progress indicator is visible
  const workshopProgVisible = await page.isVisible('#workshop-progress');
  if (workshopProgVisible) {
    addStep('Workshop progress indicator visible', 'PASS');
    
    // Check if Step 1 is active
    const ws1Active = await page.$eval('#ws-step-1', el => el.classList.contains('active'));
    if (ws1Active) {
      addStep('Workshop Step 1 active in toolkit', 'PASS');
    } else {
      addStep('Workshop Step 1 not active', 'WARN');
    }
  } else {
    addStep('Workshop progress indicator not visible', 'FAIL');
  }
  
  // Check context badge
  const badgeVisible = await page.isVisible('#cap-context-badge');
  if (badgeVisible) {
    const badgeText = await page.textContent('#cap-context-badge');
    if (badgeText.includes('Workshop') && badgeText.includes(TEST_DATA.org)) {
      addStep('Context badge shows workshop source', 'PASS', badgeText.slice(0, 50));
    } else {
      addStep('Context badge incomplete', 'WARN', badgeText);
    }
  } else {
    addStep('Context badge not visible', 'WARN');
  }
  
  // Check capabilities are loaded
  const domainCards = await page.$$('.domain-col');
  if (domainCards.length > 0) {
    addStep('Domain cards rendered', 'PASS', `${domainCards.length} domains`);
    
    // Count capabilities across all domains
    const capCards = await page.$$('.cap-card');
    if (capCards.length > 0) {
      addStep('Capabilities imported to toolkit', 'PASS', `${capCards.length} capabilities`);
    } else {
      addStep('No capabilities found in toolkit', 'WARN');
    }
  } else {
    addStep('Domain cards not rendered', 'FAIL');
  }
  
  await screenshot('11_workshop_import_verified');
  
  // ═══════════════════════════════════════════════════════════
  // STEP 12: Verify localStorage Data
  // ═══════════════════════════════════════════════════════════
  log('\n--- STEP 12: Verify localStorage ---');
  
  const storage = await getLocalStorage();
  report.localStorage = storage;
  
  if (storage.cap_map_v2) {
    try {
      const capData = JSON.parse(storage.cap_map_v2);
      const capCount = Object.values(capData).flat().length;
      addStep('cap_map_v2 in localStorage', 'PASS', `${capCount} capabilities`);
    } catch {
      addStep('cap_map_v2 invalid JSON', 'FAIL');
    }
  } else {
    addStep('cap_map_v2 missing from localStorage', 'FAIL');
  }
  
  if (storage.capability_workshop_context) {
    try {
      const ctx = JSON.parse(storage.capability_workshop_context);
      if (ctx.org === TEST_DATA.org) {
        addStep('Workshop context in localStorage', 'PASS');
      } else {
        addStep('Workshop context incorrect', 'FAIL');
      }
    } catch {
      addStep('Workshop context invalid JSON', 'FAIL');
    }
  } else {
    addStep('Workshop context missing from localStorage', 'FAIL');
  }
  
  // ═══════════════════════════════════════════════════════════
  // Final Summary
  // ═══════════════════════════════════════════════════════════
  log('\n=== Test Summary ===');
  
  const totalSteps = report.steps.length;
  const passedSteps = report.steps.filter(s => s.status === 'PASS').length;
  const failedSteps = report.steps.filter(s => s.status === 'FAIL').length;
  const warnSteps = report.steps.filter(s => s.status === 'WARN').length;
  
  log(`Total steps: ${totalSteps}`);
  log(`✓ Passed: ${passedSteps}`);
  log(`✗ Failed: ${failedSteps}`);
  log(`⚠ Warnings: ${warnSteps}`);
  log(`Console errors: ${report.consoleErrors.length}`);
  log(`Page errors: ${report.pageErrors.length}`);
  
  if (failedSteps === 0) {
    report.finalStatus = 'PASS';
    log('\n✓✓✓ ALL TESTS PASSED ✓✓✓');
  } else if (failedSteps <= 3 && passedSteps > failedSteps * 3) {
    report.finalStatus = 'PASS_WITH_WARNINGS';
    log('\n⚠ TESTS PASSED WITH WARNINGS ⚠');
  } else {
    report.finalStatus = 'FAIL';
    log('\n✗✗✗ TESTS FAILED ✗✗✗');
  }
  
  report.completedAt = new Date().toISOString();
  
  // Save report
  const reportPath = path.join(artifactsDir, 'capability_workshop_builder_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nReport saved: ${reportPath}`);

} catch (error) {
  log(`\n✗✗✗ TEST CRASHED ✗✗✗`);
  log(`Error: ${error.message}`);
  log(`Stack: ${error.stack}`);
  report.finalStatus = 'CRASH';
  report.crashError = error.message;
  report.completedAt = new Date().toISOString();
  
  const reportPath = path.join(artifactsDir, 'capability_workshop_builder_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  await screenshot('99_crash');
} finally {
  await page.waitForTimeout(2000);
  await browser.close();
  
  process.exit(report.finalStatus === 'PASS' ? 0 : 1);
}
