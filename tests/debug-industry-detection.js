// Quick debug script to test industry detection from userText
const fs = require('fs');
const path = require('path');

// Mock window
global.window = {
  location: { hostname: 'localhost' },
  model: { phase4Config: { activeBusinessAreas: [] } }
};

// Load AdvisyAI
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'Advicy_AI.js'), 'utf8');
const wrappedCode = code.replace(/const AdvisyAI = /g, 'global.AdvisyAI = ');
eval(wrappedCode);

// Test
console.log('\n=== Testing userText industry detection ===\n');

AdvisyAI.updateIndustryLayer('generic');

const testText = 'Insurance company modernizing underwriting and claims processing with Solvency II compliance.';
console.log('Test Text:', testText);

const prompt = AdvisyAI.buildSystemPrompt({
  stepNum: 7,
  stepOverridePrompt: 'Generate target architecture.',
  userText: testText
});

console.log('\nPrompt length:', prompt.length);
console.log('\nSearching for insurance keywords in prompt...');
console.log('Contains "insurance":', prompt.toLowerCase().includes('insurance'));
console.log('Contains "underwriting":', prompt.toLowerCase().includes('underwriting'));
console.log('Contains "solvency":', prompt.toLowerCase().includes('solvency'));
console.log('Contains "insurtech":', prompt.toLowerCase().includes('insurtech'));

const state = AdvisyAI.getState();
console.log('\nDetected industry from state:', state.detectedIndustry);

// Extract industry layer part
const lines = prompt.split('\n\n');
console.log('\nPrompt has', lines.length, 'sections/layers');
lines.forEach((section, i) => {
  if (section.toLowerCase().includes('insurance') || 
      section.toLowerCase().includes('underwriting') ||
      section.toLowerCase().includes('solvency')) {
    console.log(`\nLayer ${i} contains insurance keywords:`);
    console.log(section.substring(0, 200) + '...');
  }
});
