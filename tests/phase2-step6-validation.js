/**
 * TDD VALIDATION: Phase 2.6 - Roadmap AI Initiative Field
 * 
 * Validates that Step 7 (Transformation Roadmap) includes ai_enabled_initiative field
 * for all initiatives, enabling automatic AI initiative detection across the roadmap.
 * 
 * Run: node tests/phase2-step6-validation.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Phase 2.6 Validation: Roadmap AI Initiative Field\n');

let passed = 0;
let failed = 0;

// Test 1: Data Contract includes ai_enabled_initiative field
console.log('Test 1: ROADMAP_DATA_CONTRACT.md includes ai_enabled_initiative field');
const contractPath = path.join(__dirname, '../NexGenEA/js/Instructions/step7/ROADMAP_DATA_CONTRACT.md');
const contractContent = fs.readFileSync(contractPath, 'utf-8');

if (!contractContent.includes('ai_enabled_initiative')) {
  console.error('❌ FAIL: ai_enabled_initiative field not found in data contract');
  failed++;
} else if (!contractContent.includes('Phase 2.6')) {
  console.error('❌ FAIL: Phase 2.6 attribution missing in data contract');
  failed++;
} else {
  console.log('✅ PASS: ai_enabled_initiative field documented in data contract (Phase 2.6)');
  passed++;
}

// Test 2: Data Contract defines AI initiative criteria
console.log('\nTest 2: Data Contract defines AI initiative detection criteria');
const hasCapabilityCriteria = contractContent.includes('AI-enabled capabilities') && contractContent.includes('Step 3');
const hasGapCriteria = contractContent.includes('AI-enabled gaps') && contractContent.includes('Step 5');
const hasValuePoolCriteria = contractContent.includes('AI-enabled value pools') && contractContent.includes('Step 6');
const hasPlatformCriteria = contractContent.includes('AI platforms/systems') && contractContent.includes('Step 4');
const hasThemeCriteria = contractContent.includes('AI transformation themes') && contractContent.includes('Strategic Intent');

if (!hasCapabilityCriteria || !hasGapCriteria || !hasValuePoolCriteria || !hasPlatformCriteria || !hasThemeCriteria) {
  console.error('❌ FAIL: Missing comprehensive AI initiative criteria');
  console.log(`   Capabilities: ${hasCapabilityCriteria}, Gaps: ${hasGapCriteria}, Value Pools: ${hasValuePoolCriteria}, Platforms: ${hasPlatformCriteria}, Themes: ${hasThemeCriteria}`);
  failed++;
} else {
  console.log('✅ PASS: All 5 AI initiative detection criteria defined (capabilities, gaps, value pools, platforms, themes)');
  passed++;
}

// Test 3: Data Contract JSON schema includes ai_enabled_initiative
console.log('\nTest 3: Data Contract JSON schema examples include ai_enabled_initiative: false');
const schemaMatches = contractContent.match(/"ai_enabled_initiative":\s*false/g);
if (!schemaMatches || schemaMatches.length < 2) {
  console.error('❌ FAIL: JSON schema examples missing ai_enabled_initiative field');
  console.log(`   Found ${schemaMatches ? schemaMatches.length : 0} instances, expected at least 2 (for 2 initiative examples)`);
  failed++;
} else {
  console.log(`✅ PASS: ai_enabled_initiative field present in ${schemaMatches.length} schema examples`);
  passed++;
}

// Test 4: Instruction file includes AI initiative detection guidance
console.log('\nTest 4: 7_4_roadmap_waves.instruction.md includes AI initiative detection guidance');
const instructionPath = path.join(__dirname, '../NexGenEA/js/Instructions/step7/7_4_roadmap_waves.instruction.md');
const instructionContent = fs.readFileSync(instructionPath, 'utf-8');

if (!instructionContent.includes('AI-Enabled Initiative Detection')) {
  console.error('❌ FAIL: AI-Enabled Initiative Detection section not found in instruction file');
  failed++;
} else if (!instructionContent.includes('Phase 2.6')) {
  console.error('❌ FAIL: Phase 2.6 attribution missing in instruction file');
  failed++;
} else if (!instructionContent.includes('ai_enabled_initiative: true')) {
  console.error('❌ FAIL: ai_enabled_initiative: true marking instruction not found');
  failed++;
} else {
  console.log('✅ PASS: AI-Enabled Initiative Detection guidance present (Phase 2.6)');
  passed++;
}

// Test 5: Instruction file JSON schema includes ai_enabled_initiative
console.log('\nTest 5: Instruction file JSON schema includes ai_enabled_initiative field');
if (!instructionContent.includes('"ai_enabled_initiative": false')) {
  console.error('❌ FAIL: ai_enabled_initiative field not in instruction JSON schema');
  failed++;
} else {
  console.log('✅ PASS: ai_enabled_initiative field present in instruction JSON schema');
  passed++;
}

// Test 6: Step7.js includes AI transformation context in userPrompt
console.log('\nTest 6: Step7.js extracts AI context for roadmap generation');
const step7Path = path.join(__dirname, '../NexGenEA/js/Steps/Step7.js');
const step7Content = fs.readFileSync(step7Path, 'utf-8');

const hasAIThemes = step7Content.includes('ai_transformation_themes');
const hasAICapabilities = step7Content.includes("filter(cap => cap.ai_enabled)");
const hasAIGaps = step7Content.includes("filter(gap => gap.ai_enabled_gap)");
const hasAIValuePools = step7Content.includes("filter(pool => pool.ai_enabled_value)");
const hasPhase26Comment = step7Content.includes('Phase 2.6');

if (!hasAIThemes || !hasAICapabilities || !hasAIGaps || !hasAIValuePools) {
  console.error('❌ FAIL: Step7.js missing AI context extraction');
  console.log(`   Themes: ${hasAIThemes}, Capabilities: ${hasAICapabilities}, Gaps: ${hasAIGaps}, Value Pools: ${hasAIValuePools}`);
  failed++;
} else if (!hasPhase26Comment) {
  console.error('❌ FAIL: Phase 2.6 comment missing in Step7.js');
  failed++;
} else {
  console.log('✅ PASS: Step7.js extracts AI themes, capabilities, gaps, value pools (Phase 2.6)');
  passed++;
}

// Test 7: Azure deployment files synchronized
console.log('\nTest 7: Azure deployment files synchronized with main files');
const azureContractPath = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Instructions/step7/ROADMAP_DATA_CONTRACT.md');
const azureInstructionPath = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Instructions/step7/7_4_roadmap_waves.instruction.md');
const azureStep7Path = path.join(__dirname, '../azure-deployment/static/NexGenEA/js/Steps/Step7.js');

const azureContract = fs.readFileSync(azureContractPath, 'utf-8');
const azureInstruction = fs.readFileSync(azureInstructionPath, 'utf-8');
const azureStep7 = fs.readFileSync(azureStep7Path, 'utf-8');

const contractMatch = azureContract.includes('ai_enabled_initiative') && azureContract.includes('Phase 2.6');
const instructionMatch = azureInstruction.includes('AI-Enabled Initiative Detection') && azureInstruction.includes('Phase 2.6');
const step7Match = azureStep7.includes('Phase 2.6') && azureStep7.includes('ai_transformation_themes');

if (!contractMatch || !instructionMatch || !step7Match) {
  console.error('❌ FAIL: Azure deployment files not synchronized');
  console.log(`   Contract: ${contractMatch}, Instruction: ${instructionMatch}, Step7.js: ${step7Match}`);
  failed++;
} else {
  console.log('✅ PASS: All Azure deployment files synchronized with Phase 2.6 changes');
  passed++;
}

// Test 8: Backward compatibility - ai_enabled_initiative is optional/default false
console.log('\nTest 8: Backward compatibility - ai_enabled_initiative is optional');
const isOptional = contractContent.includes('OPTIONAL') && contractContent.includes('Default:');
const defaultFalse = contractContent.match(/ai_enabled_initiative.*default.*false/is);

if (!isOptional) {
  console.error('❌ FAIL: ai_enabled_initiative not marked as OPTIONAL in data contract');
  failed++;
} else if (!defaultFalse) {
  console.error('❌ FAIL: ai_enabled_initiative default value not specified as false');
  failed++;
} else {
  console.log('✅ PASS: ai_enabled_initiative is optional with default false (backward compatible)');
  passed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`✅ PASSED: ${passed}/8 tests`);
console.log(`❌ FAILED: ${failed}/8 tests`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n🎉 SUCCESS: Phase 2.6 implementation validated!');
  console.log('\nTransformation Roadmap (Step 7) now includes:');
  console.log('- ai_enabled_initiative boolean field in data contract');
  console.log('- 5 comprehensive AI initiative detection criteria');
  console.log('- AI initiative detection guidance in instruction files');
  console.log('- AI context extraction in Step7.js (themes, capabilities, gaps, value pools)');
  console.log('- Azure deployment files synchronized');
  console.log('- Backward compatibility maintained (optional field, default false)');
  console.log('\nAI initiatives are now automatically identified based on:');
  console.log('1. AI-enabled capabilities from Step 3');
  console.log('2. AI-enabled gaps from Step 5');
  console.log('3. AI-enabled value pools from Step 6');
  console.log('4. AI platforms/systems from Step 4');
  console.log('5. AI transformation themes from Strategic Intent');
  process.exit(0);
} else {
  console.error('\n❌ VALIDATION FAILED: Fix errors above before proceeding');
  process.exit(1);
}
