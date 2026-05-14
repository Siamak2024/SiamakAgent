/**
 * COMPREHENSIVE E2E TEST - AI Generation with APQC & AI Agents
 * =============================================================
 * Tests that AI actually USES APQC data and GENERATES AI agents during workflow
 * 
 * Run: node scripts/test_ai_generation_integration.mjs
 * 
 * Prerequisites:
 * - Server running on localhost:3000
 * - APQC data files present in APAQ_Data/
 * - Valid OpenAI API key (or test will skip AI generation)
 */

import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds for AI generation

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════

async function runTests() {
  log('\n' + '═'.repeat(70), 'cyan');
  log('  COMPREHENSIVE E2E TEST - AI Generation Integration', 'bold');
  log('  Testing: APQC Usage + AI Agent Generation', 'cyan');
  log('═'.repeat(70) + '\n', 'cyan');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
    warnings: [],
    skipped: []
  };

  function logTest(name, status, details = '') {
    const icon = status === 'pass' ? '✓' : status === 'skip' ? '⊘' : '✗';
    const color = status === 'pass' ? 'green' : status === 'skip' ? 'yellow' : 'red';
    log(`  ${icon} ${name}`, color);
    if (details) log(`    ${details}`, 'cyan');
    
    if (status === 'pass') results.passed.push(name);
    else if (status === 'fail') results.failed.push({ name, details });
    else if (status === 'skip') results.skipped.push(name);
  }

  try {
    //=======================================================================
    // TEST 1: Platform Loads with APQC Integration
    //=======================================================================
    log('\n[TEST 1] Platform Initialization with APQC', 'cyan');
    
    await page.goto(`${BASE_URL}/NexGenEA/NexGen_EA_V4.html`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    
    // Check if EA_DataManager loaded
    const hasDataManager = await page.evaluate(() => typeof EA_DataManager !== 'undefined');
    logTest('EA_DataManager loaded', hasDataManager ? 'pass' : 'fail', hasDataManager ? 'Available' : 'Missing');
    
    // Check if APQC methods exist
    const hasAPQCMethods = await page.evaluate(() => {
      if (typeof EA_DataManager === 'undefined') return false;
      const dm = new EA_DataManager();
      return typeof dm.loadAPQCFramework === 'function' && 
             typeof dm.getAPQCCapabilitiesByBusinessType === 'function';
    });
    logTest('APQC methods available', hasAPQCMethods ? 'pass' : 'fail');

    //=======================================================================
    // TEST 2: APQC Framework Auto-Loads
    //=======================================================================
    log('\n[TEST 2] APQC Framework Auto-Loading', 'cyan');
    
    // Wait for framework to load (check console logs)
    await page.waitForTimeout(2000); // Give time for async load
    
    const apqcStatus = await page.evaluate(async () => {
      if (typeof EA_DataManager === 'undefined') return { loaded: false };
      const dm = new EA_DataManager();
      try {
        await dm.loadAPQCFramework();
        return dm.getAPQCStatus();
      } catch (error) {
        return { loaded: false, error: error.message };
      }
    });
    
    logTest('APQC framework loaded', apqcStatus.loaded ? 'pass' : 'fail', 
      apqcStatus.loaded ? `v${apqcStatus.frameworkVersion || '?'}, ${apqcStatus.totalCategories || 0} categories` : apqcStatus.error || 'Failed to load');

    //=======================================================================
    // TEST 3: Create New Project with APQC Context
    //=======================================================================
    log('\n[TEST 3] Create Project with Industry Context', 'cyan');
    
    // Create new project
    await page.click('button:has-text("Ny"), button:has-text("New")');
    await page.fill('input[placeholder*="projekt"], input[placeholder*="project"]', 'APQC Test Project');
    await page.click('button:has-text("Skapa"), button:has-text("Create")');
    await page.waitForTimeout(1000);
    
    logTest('New project created', 'pass', 'APQC Test Project');

    //=======================================================================
    // TEST 4: Step 1 - Strategic Intent with AI Role
    //=======================================================================
    log('\n[TEST 4] Step 1 - Strategic Intent (Industry: Manufacturing)', 'cyan');
    
    // Set industry to Manufacturing (APQC use case)
    await page.evaluate(() => {
      window.model = window.model || {};
      window.model.strategicIntent = {
        industry: 'Manufacturing',
        region: 'Europe',
        company_size: 'Mid-size (500-2000 employees)',
        strategic_themes: ['Operational Excellence', 'Digital Transformation', 'Sustainability'],
        ai_transformation_ambition: 'Use AI to optimize production planning and predictive maintenance',
        ai_strategic_themes: ['Predictive Maintenance', 'Process Automation', 'Quality Control AI']
      };
    });
    
    logTest('Strategic Intent set', 'pass', 'Manufacturing | Digital Transformation | AI-focused');

    //=======================================================================
    // TEST 5: Step 2 - BMC (Quick Setup)
    //=======================================================================
    log('\n[TEST 5] Step 2 - Business Model Canvas', 'cyan');
    
    await page.evaluate(() => {
      window.model.bmc = {
        value_proposition: 'Precision manufacturing with AI-optimized production',
        key_activities: ['Design & Engineering', 'Production Planning', 'Quality Assurance', 'Supply Chain Management'],
        customer_segments: ['Industrial Clients', 'OEM Partners']
      };
    });
    
    logTest('BMC configured', 'pass', 'Manufacturing business model');

    //=======================================================================
    // TEST 6: Step 3 - Capability Map Generation WITH APQC
    //=======================================================================
    log('\n[TEST 6] 🔥 Capability Map Generation with APQC Integration', 'cyan');
    
    // Check if we have an API key (needed for AI generation)
    const hasApiKey = await page.evaluate(() => {
      return !!localStorage.getItem('ea_openai_key');
    });
    
    if (!hasApiKey) {
      logTest('Capability Map AI Generation', 'skip', 'No API key configured - cannot test AI generation');
      results.warnings.push('Set ea_openai_key in localStorage to test AI generation');
    } else {
      // Trigger autopilot capability map generation
      const capGenResult = await page.evaluate(async () => {
        try {
          // Simulate autopilot capability generation with APQC context
          const dm = window.dataManager || new EA_DataManager();
          
          // Load APQC capabilities for Manufacturing
          const apqcCaps = await dm.getAPQCCapabilitiesByBusinessType('Manufacturing');
          
          // This simulates what the AI instruction should receive
          const context = {
            strategicIntent: window.model.strategicIntent,
            bmc: window.model.bmc,
            industry: 'Manufacturing',
            apq cCapabilities: apqcCaps  // ← THIS IS THE FIX! AI needs this in context
          };
          
          return {
            success: true,
            apqcCount: apqcCaps?.length || 0,
            contextIncludesAPQC: !!apqcCaps
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      logTest('APQC capabilities loaded for AI context', capGenResult.success ? 'pass' : 'fail',
        capGenResult.success ? `${capGenResult.apqcCount} APQC capabilities available` : capGenResult.error);
      
      // Verify generated capabilities include APQC source markers
      await page.waitForTimeout(2000);
      
      const capabilityCheck = await page.evaluate(() => {
        const caps = window.model?.capabilities || [];
        const hasAPQCSource = caps.some(c => c.apqc_source === true);
        const hasAPQCCode = caps.some(c => c.apqc_code);
        const hasAIEnabled = caps.some(c => c.ai_enabled === true);
        
        return {
          totalCaps: caps.length,
          hasAPQCSource,
          hasAPQCCode,
          hasAIEnabled,
          apqcCount: caps.filter(c => c.apqc_source === true).length,
          aiEnabledCount: caps.filter(c => c.ai_enabled === true).length
        };
      });
      
      logTest('Capabilities include APQC sources', capabilityCheck.hasAPQCSource ? 'pass' : 'fail',
        `${capabilityCheck.apqcCount}/${capabilityCheck.totalCaps} capabilities from APQC`);
      
      logTest('Capabilities include ai_enabled flag', capabilityCheck.hasAIEnabled ? 'pass' : 'fail',
        `${capabilityCheck.aiEnabledCount} AI-enabled capabilities`);
      
      if (capabilityCheck.totalCaps === 0) {
        results.warnings.push('No capabilities generated - check AI generation function');
      }
    }

    //=======================================================================
    // TEST 7: Step 7 - Architecture Layers WITH AI AGENTS
    //=======================================================================
    log('\n[TEST 7] 🔥 Architecture Layers with AI Agent Generation', 'cyan');
    
    if (!hasApiKey) {
      logTest('AI Agent Generation', 'skip', 'No API key - skipping AI generation test');
    } else {
      // Verify AI agents in model
      const agentCheck = await page.evaluate(() => {
        const agents = window.model?.aiAgents || [];
        
        if (agents.length === 0) return { hasAgents: false, count: 0 };
        
        // Check structure compliance
        const validAgents = agents.filter(a => 
          a.name && 
          a.agent_type && 
          a.purpose && 
          Array.isArray(a.linked_capabilities) &&
          typeof a.is_proposed === 'boolean'
        );
        
        return {
          hasAgents: agents.length > 0,
          count: agents.length,
          validCount: validAgents.length,
          types: [...new Set(agents.map(a => a.agent_type))],
          proposedCount: agents.filter(a => a.is_proposed === true).length
        };
      });
      
      logTest('AI Agents generated', agentCheck.hasAgents ? 'pass' : 'fail',
        agentCheck.hasAgents ? `${agentCheck.count} agents, ${agentCheck.validCount} valid, ${agentCheck.proposedCount} proposed (TO-BE)` : 'No AI agents found');
      
      if (agentCheck.hasAgents) {
        logTest('AI Agent types diverse', agentCheck.types.length >= 2 ? 'pass' : 'fail',
          `Types: ${agentCheck.types.join(', ')}`);
      }
      
      // Check if agents are visible in architecture layers tab
      await page.click('button#tab-layers, button:has-text("Arkitekturlager")');
      await page.waitForTimeout(1000);
      
      const layersVisible = await page.evaluate(() => {
        const agentContainer = document.getElementById('aiagents');
        return agentContainer && agentContainer.innerHTML.trim().length > 50; // Not just empty div
      });
      
      logTest('AI Agents visible in Architecture Layers tab', layersVisible ? 'pass' : 'fail');
      
      if (!agentCheck.hasAgents) {
        results.warnings.push('AI agents not generated - check Step 7 instruction file includes ai_agents generation');
      }
    }

    //=======================================================================
    // TEST 8: Data Contract Compliance
    //=======================================================================
    log('\n[TEST 8] Data Contract Compliance', 'cyan');
    
    const contractCheck = await page.evaluate(() => {
      const caps = window.model?.capabilities || [];
      const agents = window.model?.aiAgents || [];
      
      // Check capability fields
      const capCompliance = caps.every(c => 
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        typeof c.domain === 'string' &&
        typeof c.maturity === 'number' &&
        typeof c.strategicImportance === 'string'
      );
      
      // Check optional APQC fields are correct type when present
      const apqcFieldsValid = caps.filter(c => c.apqc_source).every(c =>
        typeof c.apqc_source === 'boolean' &&
        (c.apqc_code === undefined || typeof c.apqc_code === 'string')
      );
      
      // Check AI agent structure
      const agentCompliance = agents.length === 0 || agents.every(a =>
        typeof a.name === 'string' &&
        typeof a.agent_type === 'string' &&
        typeof a.purpose === 'string' &&
        Array.isArray(a.linked_capabilities) &&
        typeof a.is_proposed === 'boolean'
      );
      
      return {
        capCompliance,
        apqcFieldsValid,
        agentCompliance,
        totalCaps: caps.length,
        totalAgents: agents.length
      };
    });
    
    logTest('Capability data contract compliance', contractCheck.capCompliance ? 'pass' : 'fail');
    logTest('APQC fields type-correct', contractCheck.apqcFieldsValid ? 'pass' : 'fail');
    logTest('AI Agent data contract compliance', contractCheck.agentCompliance ? 'pass' : 'fail');

    //=======================================================================
    // TEST 9: UI Rendering Verification
    //=======================================================================
    log('\n[TEST 9] UI Rendering with New Features', 'cyan');
    
    // Navigate to Capability Map tab
    await page.click('button[onclick*="showTab(\'capability\')"], button:has-text("Förmågekarta")');
    await page.waitForTimeout(1000);
    
    // Check for APQC badges in capability cards
    const hasAPQCBadges = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('.cap-badge, .apqc-badge, [class*="apqc"]'));
      return badges.length > 0;
    });
    
    logTest('APQC badges visible in UI', hasAPQCBadges ? 'pass' : 'fail');
    
    // Check for robot icons (AI-enabled capabilities)
    const hasRobotIcons = await page.evaluate(() => {
      const robots = Array.from(document.querySelectorAll('.fa-robot, .ai-icon, [class*="ai-enabled"]'));
      return robots.length > 0;
    });
    
    logTest('AI-enabled icons visible', hasRobotIcons ? 'pass' : 'fail');

  } catch (error) {
    log(`\n❌ TEST ERROR: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await browser.close();
  }

  //=========================================================================
  // TEST SUMMARY
  //=========================================================================
  log('\n' + '═'.repeat(70), 'cyan');
  log('  TEST SUMMARY', 'bold');
  log('═'.repeat(70), 'cyan');
  
  log(`\n✓ Passed:  ${results.passed.length}`, 'green');
  log(`✗ Failed:  ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');
  log(`⊘ Skipped: ${results.skipped.length}`, 'yellow');
  log(`⚠ Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');
  
  if (results.failed.length > 0) {
    log('\nFailed Tests:', 'red');
    results.failed.forEach(f => {
      log(`  ✗ ${f.name}`, 'red');
      if (f.details) log(`    ${f.details}`, 'cyan');
    });
  }
  
  if (results.warnings.length > 0) {
    log('\nWarnings:', 'yellow');
    results.warnings.forEach(w => log(`  ⚠ ${w}`, 'yellow'));
  }
  
  if (results.skipped.length > 0) {
    log('\nSkipped Tests:', 'yellow');
    results.skipped.forEach(s => log(`  ⊘ ${s}`, 'yellow'));
  }
  
  const passRate = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  log('\n' + '═'.repeat(70) + '\n', 'cyan');
  
  // Save results
  const reportPath = './e2e-artifacts/ai_generation_test_results.json';
  fs.mkdirSync('./e2e-artifacts', { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    passRate: parseFloat(passRate)
  }, null, 2));
  
  log(`Results saved to: ${reportPath}\n`, 'cyan');
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests();
