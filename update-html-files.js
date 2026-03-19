#!/usr/bin/env node
/**
 * Automated HTML Update Script for Azure OpenAI Proxy Integration
 * Updates all 17 HTML files from direct OpenAI to secure Azure proxy
 */

const fs = require('fs');
const path = require('path');

const DEPLOYMENT_DIR = path.join(__dirname, 'azure-deployment', 'static');

// List of all HTML files to update (relative to static folder)
const HTML_FILES = [
  'NexGenEA/NexGen_EA_V4.html',
  'NexGenEA/EA_20_Transformation_Plattform.html',
  'NexGenEA/EA 20 Platform.html',
  'NexGenEA/EA 20 Platform_BD_final.html',
  'NexGenEA/EA 20 Platform_BD_phase2.html',
  'NexGenEA/EA 20 Platform_BD_phase3.html',
  'NexGenEA/EA 20 Platform_BD_phase4.html',
  'NexGenEA/EA 20 Platform_V3_Integrated_C.html',
  'EA2_Toolkit/EA2_Strategic_Tools.html',
  'EA2_Toolkit/AI Business Model Canvas.html',
  'EA2_Toolkit/AI Strategy Workbench V2.html',
  'EA2_Toolkit/AI Capability Mapping V2.html',
  'EA2_Toolkit/AI Value Chain Analyzer V2.html',
  'EA2_Toolkit/EA20 Maturity Toolbox V2.html',
  'Integration_Workflow_Hub.html',
  'EA 20 Platform_BD_final_2.html',
  'TEST_SYNC_FLOW.html'
];

function updateHTMLFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: File not found ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Determine the correct path to AzureOpenAIProxy.js based on file location
    const isInSubfolder = filePath.includes('NexGenEA') || filePath.includes('EA2_Toolkit');
    const proxyPath = isInSubfolder ? '../../AzureOpenAIProxy.js' : '../AzureOpenAIProxy.js';

    // 1. Add Azure Proxy script if not already present
    if (!content.includes('AzureOpenAIProxy')) {
      // Add after the last <link> tag or before </head>
      if (content.includes('</head>')) {
        content = content.replace(
          '</head>',
          `<script src="${proxyPath}"></script>\n</head>`
        );
      }
    }

    // 2. Replace direct OpenAI API calls
    // Pattern 1: fetch('https://api.openai.com...' with OPENAI_KEY
    content = content.replace(
      /await\s+fetch(?:WithTimeout)?\(\s*['"]https:\/\/api\.openai\.com\/v1\/chat\/completions['"]\s*,\s*\{[\s\S]*?headers:\s*\{[\s\S]*?['"]Authorization['"]\s*:\s*['"]Bearer\s*['"]\s*\+\s*OPENAI_KEY[\s\S]*?\}[\s\S]*?\}\s*\)/g,
      'await AzureOpenAIProxy.chat(messages, {model: selectedModel})'
    );

    // Pattern 2: Remove or replace API key input fields
    content = content.replace(
      /<input[^>]*id=['"](ai-api-key-input|apiKeyInput)['"]\s+type=['"](password|text)['"]\s*placeholder=['"]sk-\.\.\.['"][^>]*>/g,
      '<div style="padding:8px;background:#f0f9ff;border:1px solid #0ea5e9;border-radius:4px;font-size:12px;color:#0369a1;">API Key Management: Handled securely by Azure Proxy. No client-side key needed.</div>'
    );

    // 3. Comment out or remove the global OPENAI_KEY usage instructions
    content = content.replace(
      /Stored locally in your browser\. Never sent anywhere except OpenAI\./g,
      'Managed securely by Azure Function. Client-side key not needed.'
    );

    // 4. Update settings panel descriptions
    content = content.replace(
      /saving your OpenAI API key|enter your OpenAI API key/gi,
      'API key is managed securely on Azure servers'
    );

    // Mark that file was updated
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`  - No changes needed: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ERROR: Failed to update ${filePath}: ${error.message}`);
    return false;
  }
}

// Main execution
console.log('\n===========================================');
console.log('HTML Update Script - Azure OpenAI Proxy');
console.log('===========================================\n');

console.log(`Deployment directory: ${DEPLOYMENT_DIR}\n`);
console.log(`Processing ${HTML_FILES.length} HTML files...\n`);

let updatedCount = 0;
let errorCount = 0;

HTML_FILES.forEach((file, index) => {
  const fullPath = path.join(DEPLOYMENT_DIR, file);
  console.log(`[${index + 1}/${HTML_FILES.length}] ${file}`);
  
  if (updateHTMLFile(fullPath)) {
    updatedCount++;
  } else {
    errorCount++;
  }
});

console.log(`\n===========================================`);
console.log(`Completed: ${updatedCount} files updated, ${errorCount} errors/skipped`);
console.log(`===========================================\n`);

console.log('Next steps:');
console.log('1. Verify changes in azure-deployment/static/');
console.log('2. Test locally: npm start');
console.log('3. Push to GitHub: git push origin main');
console.log('4. Monitor Azure deployment\n');
