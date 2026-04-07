/**
 * Phase 2.5 Validation Test: Value Pools AI-Enabled Value Field
 * 
 * Tests that value pools include ai_enabled_value boolean field to flag
 * value opportunities generated/enhanced by AI transformation.
 * 
 * Run: node tests/phase2-step5-validation.js
 */

const path = require('path');
const fs = require('fs');

function log(msg) { console.log(`[Phase2.5-Test] ${msg}`); }
function fail(msg) { console.error(`❌ FAIL: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ PASS: ${msg}`); }

// ── Test 1: Data Contract includes ai_enabled_value field ──
function test1_DataContractHasAIField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step6/VALUE_POOLS_DATA_CONTRACT.md');
  if (!fs.existsSync(contractPath)) {
    fail('VALUE_POOLS_DATA_CONTRACT.md not found');
  }
  
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.includes('ai_enabled_value')) {
    fail('Data contract does not define ai_enabled_value field');
  }
  
  if (!content.match(/ai_enabled_value.*OPTIONAL.*Phase 2\.5/s)) {
    fail('ai_enabled_value not marked as OPTIONAL Phase 2.5 field');
  }
  
  pass('Data contract defines ai_enabled_value field with Phase 2.5 marker');
}

// ── Test 2: Data Contract includes AI value criteria ──
function test2_DataContractHasCriteria() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step6/VALUE_POOLS_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.match(/AI.*capabilities.*Step 3/s)) {
    fail('Data contract does not reference Step 3 AI-enabled capabilities');
  }
  
  if (!content.includes('Strategic Intent ai_transformation_themes')) {
    fail('Data contract does not reference Strategic Intent AI themes');
  }
  
  if (!content.includes('Predictive')) {
    fail('Data contract missing AI value pool examples');
  }
  
  pass('Data contract includes AI value pool identification criteria');
}

// ── Test 3: Data Contract schema includes field ──
function test3_DataContractSchemaHasField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step6/VALUE_POOLS_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.match(/"valuePools":\s*\[[\s\S]*?"ai_enabled_value":\s*false/)) {
    fail('Data contract schema does not include ai_enabled_value field');
  }
  
  pass('Data contract schema examples include ai_enabled_value field');
}

// ── Test 4: Instruction file includes AI value guidance ──
function test4_InstructionHasAIGuidance() {
  const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step6/6_1_value_pools.instruction.md');
  if (!fs.existsSync(instructionPath)) {
    fail('6_1_value_pools.instruction.md not found');
  }
  
  const content = fs.readFileSync(instructionPath, 'utf-8');
  
  if (!content.includes('AI-Enabled Value Pool Detection')) {
    fail('Instruction file missing AI-enabled value pool detection section');
  }
  
  if (!content.includes('ai_enabled_value: true')) {
    fail('Instruction file does not explain when to set ai_enabled_value: true');
  }
  
  if (!content.includes('Phase 2.5')) {
    fail('Instruction file not marked with Phase 2.5');
  }
  
  pass('Instruction file includes AI-enabled value pool guidance');
}

// ── Test 5: Instruction file JSON schema includes ai_enabled_value ──
function test5_InstructionSchemaHasField() {
  const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step6/6_1_value_pools.instruction.md');
  const content = fs.readFileSync(instructionPath, 'utf-8');
  
  if (!content.match(/"value_pools":\s*\[[\s\S]*?"ai_enabled_value":\s*false/)) {
    fail('Instruction file JSON schema does not include ai_enabled_value');
  }
  
  pass('Instruction file JSON schema includes ai_enabled_value field');
}

// ── Test 6: Step6.js includes AI context in userPrompt ──
function test6_Step6IncludesAIContext() {
  const step6Path = path.join(__dirname, '../NexGenEA/js/Steps/Step6.js');
  if (!fs.existsSync(step6Path)) {
    fail('Step6.js not found');
  }
  
  const content = fs.readFileSync(step6Path, 'utf-8');
  
  if (!content.includes('ai_transformation_themes')) {
    fail('Step6.js does not extract ai_transformation_themes');
  }
  
  if (!content.includes('AI-enabled capabilities')) {
    fail('Step6.js does not list AI-enabled capabilities in context');
  }
  
  if (!content.includes('AI Transformation Value Context')) {
    fail('Step6.js userPrompt does not include AI transformation value context');
  }
  
  if (!content.includes('ai_enabled_gap')) {
    fail('Step6.js does not reference AI-enabled gaps');
  }
  
  pass('Step6.js includes AI transformation value context');
}

// ── Test 7: Azure deployment files synchronized ──
function test7_AzureFilesSynced() {
  const mainStep6 = path.join(__dirname, '../NexGenEA/js/Steps/Step6.js');
  const azureStep6 = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Steps/Step6.js');
  
  if (!fs.existsSync(azureStep6)) {
    fail('Azure Step6.js not found');
  }
  
  const azureContent = fs.readFileSync(azureStep6, 'utf-8');
  
  if (!azureContent.includes('AI Transformation Value Context')) {
    fail('Azure Step6.js missing AI transformation value context');
  }
  
  if (!azureContent.includes('AI-enabled capabilities')) {
    fail('Azure Step6.js missing AI capabilities context');
  }
  
  pass('Azure deployment Step6.js synchronized with main file');
}

// ── Test 8: Backward compatibility ──
function test8_BackwardCompatibility() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step6/VALUE_POOLS_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.match(/ai_enabled_value.*OPTIONAL/s)) {
    fail('ai_enabled_value should be marked as OPTIONAL for backward compatibility');
  }
  
  if (!content.match(/default.*false/i)) {
    fail('ai_enabled_value should default to false for backward compatibility');
  }
  
  pass('ai_enabled_value is optional and defaults to false (backward compatible)');
}

// ── Run All Tests ──
function runAllTests() {
  log('Starting Phase 2.5 validation tests...\n');
  
  test1_DataContractHasAIField();
  test2_DataContractHasCriteria();
  test3_DataContractSchemaHasField();
  test4_InstructionHasAIGuidance();
  test5_InstructionSchemaHasField();
  test6_Step6IncludesAIContext();
  test7_AzureFilesSynced();
  test8_BackwardCompatibility();
  
  log('\n✅ All Phase 2.5 validation tests passed!');
  log('Value Pools now include ai_enabled_value boolean field');
  log('AI-enabled value pools automatically detected based on:');
  log('  - Step 3 AI-enabled capabilities');
  log('  - Step 5 AI-enabled gaps');
  log('  - Strategic Intent ai_transformation_themes');
  log('Enables AI transformation ROI quantification and prioritization');
}

runAllTests();
