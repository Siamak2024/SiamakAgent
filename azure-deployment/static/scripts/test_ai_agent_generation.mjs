/**
 * Quick AI Agent Generation Test
 * 
 * Tests that Step 7 Target Architecture generates AI agents in autopilot mode.
 * 
 * Usage: node scripts/test_ai_agent_generation.mjs
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const PAGE_URL = `${BASE_URL}/NexGenEA/NexGenEA_V11.html`;
const TEST_PROJECT_NAME = 'AI Agent Test - Real Estate';
const COMPANY = 'A Swedish property management company with manual processes in tenant services, ESG reporting, and maintenance operations.';

const log = (msg) => console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${msg}`);

log('Launching browser...');
const browser = await chromium.launch({ channel: 'msedge', headless: false, slowMo: 100 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

log('Opening page...');
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 30_000 });
await page.evaluate(() => localStorage.setItem('ea_api_key', 'server-proxy'));

log('Creating project...');
const projectNameInput = page.locator('#newProjectName');
if (await projectNameInput.isVisible({ timeout: 8000 }).catch(() => false)) {
  await projectNameInput.fill(TEST_PROJECT_NAME);
  const createBtn = page.locator('button').filter({ hasText: /Create Project/i }).first();
  if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1200);
  }
}

await page.evaluate(desc => {
  if (window.model) window.model.description = desc;
  const el = document.getElementById('description');
  if (el) { el.value = desc; el.dispatchEvent(new Event('input', { bubbles: true })); }
}, COMPANY);

log('Starting autopilot...');
await page.evaluate(() => {
  if (typeof startAutopilotMode === 'function') startAutopilotMode();
});
await page.waitForTimeout(1500);

log('Setting context...');
await page.evaluate(() => {
  if (typeof setAutopilotRegion === 'function') setAutopilotRegion('Sverige');
});
await page.waitForTimeout(800);
await page.evaluate(() => {
  if (typeof setAutopilotIndustry === 'function') setAutopilotIndustry('Fastighet');
});
await page.waitForTimeout(800);
await page.evaluate(() => {
  if (typeof setAutopilotDetailLevel === 'function') setAutopilotDetailLevel('medium');
});
await page.waitForTimeout(1500);

await page.evaluate(desc => {
  if (window._autopilotState) {
    window._autopilotState.awaitingCompanyDescription = false;
    window._autopilotState.context = window._autopilotState.context || {};
    window._autopilotState.context.companyDescription = desc;
  }
  if (window.model) window.model.description = desc;
}, COMPANY);
await page.waitForTimeout(500);

log('Launching autopilot flow...');
await page.evaluate(() => {
  if (typeof runFullAutopilotFlow === 'function') runFullAutopilotFlow();
});

log('Waiting for autopilot completion (this may take 3-5 minutes)...');
const startTime = Date.now();
let done = false;
let lastCount = 0;

while (Date.now() - startTime < 20 * 60 * 1000) {
  const state = await page.evaluate(() => ({
    running: window._autopilotState?.running,
    completed: (window._autopilotState?.completedSteps || []).length,
  })).catch(() => ({}));

  if (state.completed !== lastCount) {
    lastCount = state.completed;
    log(`  Progress: ${state.completed}/7 steps completed`);
  }

  if (state.running === false && state.completed >= 7) {
    done = true;
    log('  ✓ Autopilot completed all 7 steps');
    break;
  }

  await page.waitForTimeout(10_000);
}

if (!done) {
  log('  ✗ Autopilot timed out');
  await browser.close();
  process.exit(1);
}

log('\n═══════════════════════════════════════════════════════════');
log('CHECKING AI AGENTS GENERATION');
log('═══════════════════════════════════════════════════════════\n');

const aiAgentsData = await page.evaluate(() => {
  const m = window.model || {};
  const agents = m.aiAgents || [];
  
  return {
    count: agents.length,
    agents: agents.map(a => ({
      name: a.name || 'Unnamed',
      type: a.agent_type || 'Unknown',
      purpose: (a.purpose || '').slice(0, 80),
      linked_caps: (a.linked_capabilities || []).length,
      is_proposed: a.is_proposed,
      maturity: a.maturity_level
    }))
  };
});

log(`AI Agents Generated: ${aiAgentsData.count}`);

if (aiAgentsData.count === 0) {
  log('\n❌ FAIL: No AI agents were generated!');
  log('\nThis indicates the fix did not work. Check:');
  log('1. Step 7 systemPromptFallback includes ai_agents in JSON schema');
  log('2. User prompt explicitly requests AI agents');
  log('3. AI instruction file 7_2_target_arch.instruction.md has AI agents section');
} else if (aiAgentsData.count < 3) {
  log(`\n⚠️  WARN: Only ${aiAgentsData.count} AI agents generated (expected 3-8)`);
} else {
  log('\n✅ SUCCESS: AI agents generation is working!');
}

log('\nGenerated AI Agents:');
aiAgentsData.agents.forEach((a, i) => {
  log(`\n${i + 1}. ${a.name}`);
  log(`   Type: ${a.type}`);
  log(`   Purpose: ${a.purpose}...`);
  log(`   Linked capabilities: ${a.linked_caps}`);
  log(`   Proposed: ${a.is_proposed ? 'Yes' : 'No'}`);
  log(`   Maturity: ${a.maturity}`);
});

// Check Architecture Layers data
const archLayersData = await page.evaluate(() => {
  const m = window.model || {};
  return {
    valueStreams: (m.valueStreams || []).length,
    systems: (m.systems || []).length,
    aiAgents: (m.aiAgents || []).length,
    capabilities: (m.capabilities || []).length
  };
});

log('\n═══════════════════════════════════════════════════════════');
log('ARCHITECTURE LAYERS SUMMARY');
log('═══════════════════════════════════════════════════════════');
log(`Value Streams: ${archLayersData.valueStreams}`);
log(`Systems: ${archLayersData.systems}`);
log(`AI Agents: ${archLayersData.aiAgents} ${archLayersData.aiAgents >= 3 ? '✅' : '❌'}`);
log(`Capabilities: ${archLayersData.capabilities}`);
log('═══════════════════════════════════════════════════════════\n');

// Cleanup
const testProjectId = await page.evaluate(() => window.currentModelId || null);
if (testProjectId) {
  await page.evaluate(projectId => {
    try {
      if (window.dataManager && typeof window.dataManager.deleteProject === 'function') {
        window.dataManager.deleteProject(projectId);
      } else {
        const projects = JSON.parse(localStorage.getItem('ea_projects') || '{}');
        delete projects[projectId];
        localStorage.setItem('ea_projects', JSON.stringify(projects));
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }, testProjectId);
  log(`Cleaned up test project: ${testProjectId}`);
}

await browser.close();

// Exit code based on result
if (aiAgentsData.count >= 3) {
  log('\n✅ TEST PASSED - AI agents are being generated correctly!');
  process.exit(0);
} else {
  log('\n❌ TEST FAILED - AI agents generation needs more work');
  process.exit(1);
}
