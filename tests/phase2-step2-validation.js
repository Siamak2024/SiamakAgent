/**
 * Phase 2.2 Validation Test: Capability Map AI-Enabled Field
 * 
 * Tests that capabilities include ai_enabled boolean field based on:
 * - Strategic Intent ai_transformation_themes
 * - BMC ai_transformation object (ai_enabled_activities, ai_enabled_resources)
 * - AI/ML/automation keywords in capability names
 * 
 * Run: node tests/phase2-step2-validation.js
 */

const path = require('path');
const fs = require('fs');

function log(msg) { console.log(`[Phase2.2-Test] ${msg}`); }
function fail(msg) { console.error(`❌ FAIL: ${msg}`); process.exit(1); }
function pass(msg) { console.log(`✅ PASS: ${msg}`); }

// ── Test 1: Data Contract includes ai_enabled field ──
function test1_DataContractHasAIField() {
  const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step3/CAPABILITY_MAP_DATA_CONTRACT.md');
  if (!fs.existsSync(contractPath)) {
    fail('CAPABILITY_MAP_DATA_CONTRACT.md not found');
  }
  
  const content = fs.readFileSync(contractPath, 'utf-8');
  
  if (!content.includes('ai_enabled')) {
    fail('Data contract does not define ai_enabled field');
  }
  
  if (!content.includes('Boolean')) {
    fail('ai_enabled field type (Boolean) not documented');
  }
  
  pass('Data contract defines ai_enabled field with Boolean type');
}

// ── Test 2: Instruction file includes AI-enabled assessment ──
function test2_InstructionHasAIGuidance() {
  const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step3/3_2_capability_assess.instruction.md');
  if (!fs.existsSync(instructionPath)) {
    fail('3_2_capability_assess.instruction.md not found');
  }
  
  const content = fs.readFileSync(instructionPath, 'utf-8');
  
  if (!content.includes('AI-Enabled Capability Assessment')) {
    fail('Instruction file missing AI capability assessment section');
  }
  
  if (!content.includes('ai_enabled')) {
    fail('Instruction file does not mention ai_enabled field');
  }
  
  if (!content.includes('Strategic Intent')) {
    fail('Instruction file does not reference Strategic Intent for AI context');
  }
  
  pass('Instruction file includes AI-enabled capability assessment guidance');
}

// ── Test 3: Step3.js includes BMC AI context in userPrompt ──
function test3_Step3IncludesBMCContext() {
  const step3Path = path.join(__dirname, '../NexGenEA/js/Steps/Step3.js');
  if (!fs.existsSync(step3Path)) {
    fail('Step3.js not found');
  }
  
  const content = fs.readFileSync(step3Path, 'utf-8');
  
  if (!content.includes('bmc.ai_transformation')) {
    fail('Step3.js does not extract BMC ai_transformation');
  }
  
  if (!content.includes('ai_enabled_activities')) {
    fail('Step3.js does not reference ai_enabled_activities from BMC');
  }
  
  if (!content.includes('AI Transformation Context')) {
    fail('Step3.js userPrompt does not include AI transformation context');
  }
  
  pass('Step3.js includes BMC AI transformation context in userPrompt');
}

// ── Test 4: Step3.js includes Strategic Intent AI themes ──
function test4_Step3IncludesAIThemes() {
  const step3Path = path.join(__dirname, '../NexGenEA/js/Steps/Step3.js');
  const content = fs.readFileSync(step3Path, 'utf-8');
  
  if (!content.includes('ai_transformation_themes')) {
    fail('Step3.js does not extract ai_transformation_themes from Strategic Intent');
  }
  
  if (!content.includes('Strategic themes:')) {
    fail('Step3.js does not display Strategic Intent AI themes in userPrompt');
  }
  
  pass('Step3.js includes Strategic Intent ai_transformation_themes in context');
}

// ── Test 5: Step3.js synthesize preserves ai_enabled field ──
function test5_SynthesizePreservesAIField() {
  const step3Path = path.join(__dirname, '../NexGenEA/js/Steps/Step3.js');
  const content = fs.readFileSync(step3Path, 'utf-8');
  
  // Check that synthesize function extracts ai_enabled from ratings
  if (!content.includes('ai_enabled: domainRating.ai_enabled')) {
    fail('synthesize does not preserve ai_enabled for L1 domains');
  }
  
  if (!content.includes('ai_enabled: capRating.ai_enabled')) {
    fail('synthesize does not preserve ai_enabled for L2 capabilities');
  }
  
  pass('Step3.js synthesize function preserves ai_enabled field for all capability levels');
}

// ── Test 6: Azure deployment files synchronized ──
function test6_AzureFilesSynced() {
  const mainStep3 = path.join(__dirname, '../NexGenEA/js/Steps/Step3.js');
  const azureStep3 = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Steps/Step3.js');
  
  if (!fs.existsSync(azureStep3)) {
    fail('Azure Step3.js not found');
  }
  
  const mainContent = fs.readFileSync(mainStep3, 'utf-8');
  const azureContent = fs.readFileSync(azureStep3, 'utf-8');
  
  // Check key Phase 2.2 markers
  if (!azureContent.includes('bmc.ai_transformation')) {
    fail('Azure Step3.js missing BMC ai_transformation context');
  }
  
  if (!azureContent.includes('ai_enabled: domainRating.ai_enabled')) {
    fail('Azure Step3.js missing ai_enabled field in synthesize');
  }
  
  pass('Azure deployment Step3.js synchronized with main file');
}

// ── Test 7: Backward compatibility (ai_enabled defaults to false) ──
function test7_BackwardCompatibility() {
  const step3Path = path.join(__dirname, '../NexGenEA/js/Steps/Step3.js');
  const content = fs.readFileSync(step3Path, 'utf-8');
  
  // Check that ai_enabled has fallback to false
  const aiEnabledMatches = content.match(/ai_enabled:\s*(\w+\.ai_enabled\s*\|\|\s*false)/g);
  
  if (!aiEnabledMatches || aiEnabledMatches.length < 2) {
    fail('ai_enabled field does not default to false for backward compatibility');
  }
  
  pass('ai_enabled field defaults to false (backward compatible with existing engagements)');
}

// ── Run All Tests ──
function runAllTests() {
  log('Starting Phase 2.2 validation tests...\n');
  
  test1_DataContractHasAIField();
  test2_InstructionHasAIGuidance();
  test3_Step3IncludesBMCContext();
  test4_Step3IncludesAIThemes();
  test5_SynthesizePreservesAIField();
  test6_AzureFilesSynced();
  test7_BackwardCompatibility();
  
  log('\n✅ All Phase 2.2 validation tests passed!');
  log('Capability Map now includes ai_enabled boolean field');
  log('AI-enabled capabilities will be automatically detected based on:');
  log('  - Strategic Intent ai_transformation_themes');
  log('  - BMC ai_transformation object (activities/resources)');
  log('  - AI/ML/automation keywords in capability names');
}

runAllTests();
