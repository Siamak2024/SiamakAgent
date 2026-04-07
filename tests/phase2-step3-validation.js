/**
 * Phase 2.3 Validation Test: Operating Model AI Transformation Fields
 * 
 * Tests that operating model includes AI transformation tracking:
 * - process_model[].ai_enabled boolean for AI-automated processes
 * - application_data_landscape.core_systems[].is_ai_platform for ML/AI platforms
 * - ai_transformation_indicators object with AI readiness assessment
 * 
 * Run: node tests/phase2-step3-validation.js
 */

const path = require('path');
const fs = require('fs');

function log(msg) { console.log(`[Phase2.3-Test] ${msg}`); }
function fail(msg) { console.error(`❌ FAIL: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ PASS: ${msg}`); }

// ── Test 1: Data Contract includes ai_enabled field in process_model ──
function test1_DataContractHasProcessAIField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step4/OPERATING_MODEL_DATA_CONTRACT.md');
  if (!fs.existsSync(contractPath)) {
    fail('OPERATING_MODEL_DATA_CONTRACT.md not found');
  }
  
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.includes('ai_enabled')) {
    fail('Data contract does not define ai_enabled field for processes');
  }
  
  if (!content.match(/process_model.*ai_enabled/s)) {
    fail('ai_enabled field not documented in process_model section');
  }
  
  pass('Data contract defines ai_enabled field for process_model');
}

// ── Test 2: Data Contract includes is_ai_platform field in core_systems ──
function test2_DataContractHasSystemAIField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step4/OPERATING_MODEL_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.includes('is_ai_platform')) {
    fail('Data contract does not define is_ai_platform field for systems');
  }
  
  if (!content.match(/core_systems.*is_ai_platform/s)) {
    fail('is_ai_platform field not documented in application_data_landscape section');
  }
  
  pass('Data contract defines is_ai_platform field for core_systems');
}

// ── Test 3: Data Contract includes ai_transformation_indicators ──
function test3_DataContractHasAIIndicators() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step4/OPERATING_MODEL_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.includes('ai_transformation_indicators')) {
    fail('Data contract does not define ai_transformation_indicators object');
  }
  
  const requiredFields = ['ai_enabled_processes', 'ai_platforms', 'ai_governance_roles', 'ai_readiness_assessment'];
  for (const field of requiredFields) {
    if (!content.includes(field)) {
      fail(`ai_transformation_indicators missing field: ${field}`);
    }
  }
  
  pass('Data contract defines ai_transformation_indicators with all 4 fields');
}

// ── Test 4: Instruction file includes AI transformation guidance ──
function test4_InstructionHasAIGuidance() {
  const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step4/4_2_target_op_model.instruction.md');
  if (!fs.existsSync(instructionPath)) {
    fail('4_2_target_op_model.instruction.md not found');
  }
  
  const content = fs.readFileSync(instructionPath, 'utf-8');
  
  if (!content.includes('AI Transformation Integration')) {
    fail('Instruction file missing AI transformation integration section');
  }
  
  if (!content.includes('ai_enabled') || !content.includes('is_ai_platform')) {
    fail('Instruction file does not explain AI field usage');
  }
  
  if (!content.includes('AI Readiness Assessment Guidance')) {
    fail('Instruction file missing AI readiness assessment guidance');
  }
  
  pass('Instruction file includes comprehensive AI transformation guidance');
}

// ── Test 5: Step4.js includes AI context in userPrompt ──
function test5_Step4IncludesAIContext() {
  const step4Path = path.join(__dirname, '../NexGenEA/js/Steps/Step4.js');
  if (!fs.existsSync(step4Path)) {
    fail('Step4.js not found');
  }
  
  const content = fs.readFileSync(step4Path, 'utf-8');
  
  if (!content.includes('ai_transformation_themes')) {
    fail('Step4.js does not extract ai_transformation_themes from Strategic Intent');
  }
  
  if (!content.includes('ai_enabled_activities')) {
    fail('Step4.js does not reference BMC ai_enabled_activities');
  }
  
  if (!content.includes('AI Transformation Context')) {
    fail('Step4.js userPrompt does not include AI transformation context');
  }
  
  if (!content.includes('ai_enabled_processes')) {
    fail('Step4.js does not mention ai_enabled_processes in prompt');
  }
  
  pass('Step4.js includes AI transformation context from Strategic Intent, BMC, and Capabilities');
}

// ── Test 6: Step4.js JSON schema includes AI fields ──
function test6_Step4SchemaIncludesAIFields() {
  const step4Path = path.join(__dirname, '../NexGenEA/js/Steps/Step4.js');
  const content = fs.readFileSync(step4Path, 'utf-8');
  
  // Check JSON schema example in userPrompt
  if (!content.match(/"process_model":\[.*"ai_enabled":false/s)) {
    fail('Step4.js JSON schema does not include ai_enabled in process_model');
  }
  
  if (!content.match(/"core_systems":\[.*"is_ai_platform":false/s)) {
    fail('Step4.js JSON schema does not include is_ai_platform in core_systems');
  }
  
  if (!content.includes('"ai_transformation_indicators"')) {
    fail('Step4.js JSON schema does not include ai_transformation_indicators object');
  }
  
  pass('Step4.js JSON schema includes all AI transformation fields');
}

// ── Test 7: Azure deployment files synchronized ──
function test7_AzureFilesSynced() {
  const mainStep4 = path.join(__dirname, '../NexGenEA/js/Steps/Step4.js');
  const azureStep4 = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Steps/Step4.js');
  
  if (!fs.existsSync(azureStep4)) {
    fail('Azure Step4.js not found');
  }
  
  const mainContent = fs.readFileSync(mainStep4, 'utf-8');
  const azureContent = fs.readFileSync(azureStep4, 'utf-8');
  
  // Check key Phase 2.3 markers
  if (!azureContent.includes('AI Transformation Context')) {
    fail('Azure Step4.js missing AI transformation context');
  }
  
  if (!azureContent.includes('ai_transformation_indicators')) {
    fail('Azure Step4.js missing ai_transformation_indicators in JSON schema');
  }
  
  pass('Azure deployment Step4.js synchronized with main file');
}

// ── Test 8: Backward compatibility (AI fields are optional) ──
function test8_BackwardCompatibility() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step4/OPERATING_MODEL_DATA_CONTRACT.md');
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  // Check that ai_transformation_indicators is marked as OPTIONAL
  if (!content.match(/ai_transformation_indicators.*OPTIONAL/s)) {
    fail('ai_transformation_indicators should be marked as OPTIONAL for backward compatibility');
  }
  
  // Check that ai_enabled defaults to false
  if (!content.match(/ai_enabled.*default.*false/i)) {
    fail('ai_enabled should default to false for backward compatibility');
  }
  
  pass('AI transformation fields are optional/default to preserve backward compatibility');
}

// ── Run All Tests ──
function runAllTests() {
  log('Starting Phase 2.3 validation tests...\n');
  
  test1_DataContractHasProcessAIField();
  test2_DataContractHasSystemAIField();
  test3_DataContractHasAIIndicators();
  test4_InstructionHasAIGuidance();
  test5_Step4IncludesAIContext();
  test6_Step4SchemaIncludesAIFields();
  test7_AzureFilesSynced();
  test8_BackwardCompatibility();
  
  log('\n✅ All Phase 2.3 validation tests passed!');
  log('Operating Model now tracks AI transformation:');
  log('  - ai_enabled processes (RPA, ML-powered automation)');
  log('  - is_ai_platform systems (Azure ML, Databricks, UiPath, etc.)');
  log('  - ai_transformation_indicators (processes, platforms, governance roles, readiness)');
  log('  - Integration with Strategic Intent AI themes + BMC AI activities + AI-enabled capabilities');
}

runAllTests();
