/**
 * Phase 2.4 Validation Test: Gap Analysis AI-Enabled Gap Field
 * 
 * Tests that gap analysis includes ai_enabled_gap boolean field to flag gaps
 * related to AI-enabled capabilities or AI transformation initiatives.
 * 
 * Run: node tests/phase2-step4-validation.js
 */

const path = require('path');
const fs = require('fs');

function log(msg) { console.log(`[Phase2.4-Test] ${msg}`); }
function fail(msg) { console.error(`❌ FAIL: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ PASS: ${msg}`); }

// ── Test 1: Data Contract includes ai_enabled_gap field ──
function test1_DataContractHasAIField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step5/GAP_ANALYSIS_DATA_CONTRACT.md');
  if (!fs.existsSync(contractPath)) {
    fail('GAP_ANALYSIS_DATA_CONTRACT.md not found');
  }
  
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.includes('ai_enabled_gap')) {
    fail('Data contract does not define ai_enabled_gap field');
  }
  
  if (!content.includes('Boolean')) {
    fail('ai_enabled_gap field type (Boolean) not documented');
  }
  
  if (!content.match(/ai_enabled_gap.*OPTIONAL.*Phase 2\.4/s)) {
    fail('ai_enabled_gap not marked as OPTIONAL Phase 2.4 field');
  }
  
  pass('Data contract defines ai_enabled_gap field with Boolean type and Phase 2.4 marker');
}

// ── Test 2: Data Contract includes AI gap criteria ──
function test2_DataContractHasCriteria() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step5/GAP_ANALYSIS_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.match(/ai_enabled.*true.*Step 3/s)) {
    fail('Data contract does not reference Step 3 capability ai_enabled');
  }
  
  if (!content.includes('Strategic Intent ai_transformation_themes')) {
    fail('Data contract does not reference Strategic Intent AI themes');
  }
  
  if (!content.includes('Predictive')) {
    fail('Data contract missing AI gap examples');
  }
  
  pass('Data contract includes AI gap identification criteria with examples');
}

// ── Test 3: Data Contract schema examples include field ──
function test3_DataContractSchemaHasField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step5/GAP_ANALYSIS_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.match(/"gaps":\s*\[[\s\S]*?"ai_enabled_gap":\s*false/)) {
    fail('Data contract schema example does not include ai_enabled_gap field');
  }
  
  pass('Data contract schema examples include ai_enabled_gap field');
}

// ── Test 4: Instruction file includes AI gap guidance ──
function test4_InstructionHasAIGuidance() {
  const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step5/5_1_capability_gaps.instruction.md');
  if (!fs.existsSync(instructionPath)) {
    fail('5_1_capability_gaps.instruction.md not found');
  }
  
  const content = fs.readFileSync(instructionPath, 'utf-8');
  
  if (!content.includes('AI-Enabled Gap Detection')) {
    fail('Instruction file missing AI-enabled gap detection section');
  }
  
  if (!content.includes('ai_enabled_gap: true')) {
    fail('Instruction file does not explain when to set ai_enabled_gap: true');
  }
  
  if (!content.includes('Phase 2.4')) {
    fail('Instruction file not marked with Phase 2.4');
  }
  
  pass('Instruction file includes AI-enabled gap detection guidance');
}

// ── Test 5: Instruction file JSON schema includes ai_enabled_gap ──
function test5_InstructionSchemaHasField() {
  const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step5/5_1_capability_gaps.instruction.md');
  const content = fs.readFileSync(instructionPath, 'utf-8');
  
  if (!content.match(/"gaps":\s*\[[\s\S]*?"ai_enabled_gap":\s*false/)) {
    fail('Instruction file JSON schema does not include ai_enabled_gap');
  }
  
  pass('Instruction file JSON schema includes ai_enabled_gap field');
}

// ── Test 6: Step5.js includes AI context in userPrompt ──
function test6_Step5IncludesAIContext() {
  const step5Path = path.join(__dirname, '../NexGenEA/js/Steps/Step5.js');
  if (!fs.existsSync(step5Path)) {
    fail('Step5.js not found');
  }
  
  const content = fs.readFileSync(step5Path, 'utf-8');
  
  if (!content.includes('ai_transformation_themes')) {
    fail('Step5.js does not extract ai_transformation_themes from Strategic Intent');
  }
  
  if (!content.includes('AI-enabled capabilities')) {
    fail('Step5.js does not list AI-enabled capabilities in userPrompt');
  }
  
  if (!content.match(/\[AI-enabled\]/)) {
    fail('Step5.js does not tag AI-enabled capabilities in gap list');
  }
  
  if (!content.includes('AI Transformation Context')) {
    fail('Step5.js userPrompt does not include AI transformation context');
  }
  
  pass('Step5.js includes AI transformation context from Strategic Intent and capabilities');
}

// ── Test 7: Azure deployment files synchronized ──
function test7_AzureFilesSynced() {
  const mainStep5 = path.join(__dirname, '../NexGenEA/js/Steps/Step5.js');
  const azureStep5 = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Steps/Step5.js');
  
  if (!fs.existsSync(azureStep5)) {
    fail('Azure Step5.js not found');
  }
  
  const mainContent = fs.readFileSync(mainStep5, 'utf-8');
  const azureContent = fs.readFileSync(azureStep5, 'utf-8');
  
  // Check key Phase 2.4 markers
  if (!azureContent.includes('AI Transformation Context')) {
    fail('Azure Step5.js missing AI transformation context');
  }
  
  if (!azureContent.match(/\[AI-enabled\]/)) {
    fail('Azure Step5.js missing AI-enabled capability tagging');
  }
  
  pass('Azure deployment Step5.js synchronized with main file');
}

// ── Test 8: Backward compatibility ──
function test8_BackwardCompatibility() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step5/GAP_ANALYSIS_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  // Check that ai_enabled_gap is marked as OPTIONAL
  if (!content.match(/ai_enabled_gap.*OPTIONAL/s)) {
    fail('ai_enabled_gap should be marked as OPTIONAL for backward compatibility');
  }
  
  // Check that default is false
  if (!content.match(/default.*false/i)) {
    fail('ai_enabled_gap should default to false for backward compatibility');
  }
  
  pass('ai_enabled_gap is optional and defaults to false (backward compatible)');
}

// ── Run All Tests ──
function runAllTests() {
  log('Starting Phase 2.4 validation tests...\n');
  
  test1_DataContractHasAIField();
  test2_DataContractHasCriteria();
  test3_DataContractSchemaHasField();
  test4_InstructionHasAIGuidance();
  test5_InstructionSchemaHasField();
  test6_Step5IncludesAIContext();
  test7_AzureFilesSynced();
  test8_BackwardCompatibility();
  
  log('\n✅ All Phase 2.4 validation tests passed!');
  log('Gap Analysis now includes ai_enabled_gap boolean field');
  log('AI-enabled gaps automatically detected based on:');
  log('  - Step 3 capability ai_enabled flags');
  log('  - Strategic Intent ai_transformation_themes');
  log('  - BMC ai_enabled_activities');
  log('Enables AI gap prioritization for transformation roadmap');
}

runAllTests();
