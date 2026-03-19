const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', (e) => {
    errors.push('[pageerror] ' + e.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push('[console.error] ' + msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000/NexGenEA/NexGen_EA_V4.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);

    const status = await page.evaluate(() => ({
      hasGenerateBtn: !!document.querySelector('button[onclick*="generateArchitecture()"]'),
      hasLanguageSelect: !!document.getElementById('header-language-select'),
      bodyClass: document.body && document.body.className
    }));

    console.log('STATUS', JSON.stringify(status));
    if (!errors.length) {
      console.log('NO_RUNTIME_ERRORS');
    } else {
      console.log('RUNTIME_ERRORS_START');
      for (const e of errors) console.log(e);
      console.log('RUNTIME_ERRORS_END');
    }
  } catch (e) {
    console.log('FATAL', e.message);
  } finally {
    await browser.close();
  }
})();
