import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://localhost:3000';
const artifactsDir = path.resolve('e2e-artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const steps = [
  {
    name: 'BMC',
    path: '/EA2_Toolkit/AI%20Business%20Model%20Canvas.html',
    assistantSelector: '#bmc-assistant-btn',
    quickButtonName: /Forbered Value Chain|Förbered Value Chain/i,
  },
  {
    name: 'ValueChain',
    path: '/EA2_Toolkit/AI%20Value%20Chain%20Analyzer%20V2.html',
    assistantSelector: '#vc-fab',
    quickButtonName: /Forbered Capability Mapping|Förbered Capability Mapping/i,
  },
  {
    name: 'Capability',
    path: '/EA2_Toolkit/AI%20Capability%20Mapping%20V2.html',
    assistantSelector: '#cap-ai-button',
    quickButtonName: /Forbered Wardley-workshop|Förbered Wardley-workshop/i,
  },
  {
    name: 'Wardley',
    path: '/EA2_Toolkit/AI%20Strategy%20Workbench%20V2.html',
    assistantSelector: '#ward-ai-button',
    quickButtonName: /Forbered Mognadsanalys|Förbered Mognadsanalys/i,
  },
  {
    name: 'Maturity',
    path: '/EA2_Toolkit/EA20%20Maturity%20Toolbox%20V2.html',
    assistantSelector: '#mat-ai-button',
    quickButtonName: /Nasta steg: EA Platform|Nästa steg: EA Platform/i,
  },
];

const report = {
  startedAt: new Date().toISOString(),
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  uiWarnings: [],
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
const page = await context.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    report.consoleErrors.push({ url: page.url(), text: msg.text() });
  }
});
page.on('pageerror', (err) => {
  report.pageErrors.push({ url: page.url(), text: err.message });
});

for (const step of steps) {
  const entry = { name: step.name, ok: false, notes: [] };
  try {
    await page.goto(baseUrl + step.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(500);

    const assistant = page.locator(step.assistantSelector).first();
    await assistant.waitFor({ state: 'visible', timeout: 7000 });
    await assistant.click();
    entry.notes.push('Assistant opened');

    const qBtn = page.getByRole('button', { name: step.quickButtonName }).first();
    await qBtn.waitFor({ state: 'visible', timeout: 7000 });
    await qBtn.click();
    entry.notes.push('Handoff quick action clicked');

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth;
    });
    if (overflow) {
      report.uiWarnings.push({ page: step.name, warning: 'Horizontal overflow detected' });
    }

    if (step.name === 'Maturity') {
      const headerStyleOk = await page.evaluate(() => {
        const header = document.querySelector('header.bg-gradient-to-r');
        if (!header) return false;
        const style = window.getComputedStyle(header);
        return style.backgroundImage && style.backgroundImage !== 'none';
      });
      if (!headerStyleOk) {
        report.uiWarnings.push({ page: step.name, warning: 'Top integration header gradient style missing' });
      }
    }

    await page.screenshot({ path: path.join(artifactsDir, `${step.name}.png`), fullPage: true });
    entry.ok = true;
  } catch (err) {
    entry.ok = false;
    entry.notes.push(`Error: ${err.message}`);
    await page.screenshot({ path: path.join(artifactsDir, `${step.name}_error.png`), fullPage: true });
  }
  report.steps.push(entry);
}

report.finishedAt = new Date().toISOString();
const reportPath = path.join(artifactsDir, 'workshop_flow_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log('E2E workshop flow completed.');
console.log(`Report: ${reportPath}`);
console.log(`Screenshots: ${artifactsDir}`);
console.log(JSON.stringify(report, null, 2));

await context.close();
await browser.close();
