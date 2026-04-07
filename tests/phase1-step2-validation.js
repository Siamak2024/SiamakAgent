/**
 * TDD VALIDATION: Phase 1.2 - Step 7 AI Principles Prompt
 * 
 * Run this in browser console after generating Step 7 architecture to validate:
 * 1. Architecture principles array exists
 * 2. At least 1 AI/Automation principle is present
 * 3. AI principle has required fields (name, statement, rationale, implications, anti_patterns)
 * 4. AI principle makes specific trade-offs (not generic)
 */

function validatePhase1Step2_AIPrinciples() {
  console.log('🧪 TEST: Phase 1.2 - Step 7 AI Principles Prompt\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if architecture principles exist in model
  console.log('Test 1: Architecture Principles Data Structure');
  const principles = window.model?.archPrinciples || [];
  if (principles.length === 0) {
    console.warn('⚠️  WARNING: No architecture principles found. Generate Step 7 to test.');
    tests.warnings++;
  } else {
    console.log(`✅ PASS: Found ${principles.length} architecture principles`);
    tests.passed++;
  }
  
  // Test 2: Check for AI/Automation principle
  console.log('\nTest 2: AI/Automation Principle Present');
  const aiPrinciples = principles.filter(p => {
    const text = (p.name + ' ' + p.statement + ' ' + p.rationale).toLowerCase();
    return text.includes('ai') || 
           text.includes('automation') || 
           text.includes('machine learning') ||
           text.includes('intelligent') ||
           text.includes('automat');
  });
  
  if (aiPrinciples.length === 0) {
    console.error('❌ FAIL: No AI/Automation principle found. Instruction file requirement not met.');
    console.log('   Expected: At least 1 principle with AI/automation focus');
    console.log(`   Found: ${principles.map(p => p.name).join(', ')}`);
    tests.failed++;
  } else {
    console.log(`✅ PASS: Found ${aiPrinciples.length} AI/Automation principle(s)`);
    aiPrinciples.forEach(p => console.log(`   - "${p.name}"`));
    tests.passed++;
  }
  
  // Test 3: Validate AI principle structure
  if (aiPrinciples.length > 0) {
    console.log('\nTest 3: AI Principle Has Required Fields');
    const firstAI = aiPrinciples[0];
    const hasName = firstAI.name && firstAI.name.length > 0;
    const hasStatement = firstAI.statement && firstAI.statement.length > 0;
    const hasRationale = firstAI.rationale && firstAI.rationale.length > 0;
    const hasImplications = Array.isArray(firstAI.implications) && firstAI.implications.length > 0;
    const hasAntiPatterns = Array.isArray(firstAI.anti_patterns) && firstAI.anti_patterns.length > 0;
    
    if (hasName && hasStatement && hasRationale && hasImplications && hasAntiPatterns) {
      console.log('✅ PASS: AI principle has all required fields');
      console.log(`   Name: "${firstAI.name}"`);
      console.log(`   Statement: "${firstAI.statement.substring(0, 80)}..."`);
      console.log(`   Implications: ${firstAI.implications.length} items`);
      console.log(`   Anti-patterns: ${firstAI.anti_patterns.length} items`);
      tests.passed++;
    } else {
      console.error('❌ FAIL: AI principle missing required fields');
      console.log(`   Has name: ${hasName}`);
      console.log(`   Has statement: ${hasStatement}`);
      console.log(`   Has rationale: ${hasRationale}`);
      console.log(`   Has implications: ${hasImplications}`);
      console.log(`   Has anti_patterns: ${hasAntiPatterns}`);
      tests.failed++;
    }
  }
  
  // Test 4: Check for specific trade-offs (not generic)
  if (aiPrinciples.length > 0) {
    console.log('\nTest 4: AI Principle Makes Specific Trade-offs');
    const firstAI = aiPrinciples[0];
    
    // Generic phrases that indicate weak principles
    const genericPhrases = ['leverage ai', 'use ai', 'ai is the future', 'improve business', 'digital transformation'];
    const statement = firstAI.statement.toLowerCase();
    const isGeneric = genericPhrases.some(phrase => statement.includes(phrase));
    
    // Strong indicators: "because", "not", "instead of", specific technology names
    const hasReasoning = statement.includes('because');
    const hasTradeoff = statement.includes('not ') || statement.includes('instead of') || firstAI.anti_patterns.length > 0;
    
    if (isGeneric) {
      console.warn('⚠️  WARNING: AI principle may be too generic');
      console.log(`   Statement: "${firstAI.statement}"`);
      console.log(`   Recommendation: Should include specific trade-offs and "because" reasoning`);
      tests.warnings++;
    } else if (hasReasoning && hasTradeoff) {
      console.log('✅ PASS: AI principle makes specific trade-offs');
      console.log(`   Has "because" reasoning: ${hasReasoning}`);
      console.log(`   Has trade-offs: ${hasTradeoff}`);
      tests.passed++;
    } else {
      console.warn('⚠️  WARNING: AI principle could be more opinionated');
      console.log(`   Has "because": ${hasReasoning}`);
      console.log(`   Has trade-offs: ${hasTradeoff}`);
      tests.warnings++;
    }
  }
  
  // Test 5: Check for concrete implications (not vague)
  if (aiPrinciples.length > 0) {
    console.log('\nTest 5: AI Principle Has Concrete Implications');
    const firstAI = aiPrinciples[0];
    
    if (firstAI.implications && firstAI.implications.length >= 2) {
      // Check if implications are specific (contain numbers, technology names, or "will"/"must")
      const specificImplications = firstAI.implications.filter(imp => {
        const impLower = imp.toLowerCase();
        return /\d/.test(imp) || // Contains numbers
               impLower.includes('will ') || 
               impLower.includes('must ') ||
               impLower.includes('azure') ||
               impLower.includes('aws') ||
               impLower.includes('api') ||
               impLower.includes('model') ||
               impLower.length > 50; // Detailed implication
      });
      
      if (specificImplications.length >= 2) {
        console.log(`✅ PASS: AI principle has ${specificImplications.length} concrete implications`);
        specificImplications.forEach((imp, i) => console.log(`   ${i+1}. "${imp.substring(0, 80)}..."`));
        tests.passed++;
      } else {
        console.warn('⚠️  WARNING: Implications could be more specific');
        console.log(`   Found ${specificImplications.length}/${firstAI.implications.length} concrete implications`);
        tests.warnings++;
      }
    } else {
      console.error('❌ FAIL: AI principle should have at least 2 implications');
      tests.failed++;
    }
  }
  
  // Test 6: Verify instruction file loaded correctly
  console.log('\nTest 6: Instruction File Integration');
  // Check if Step7 module exists
  if (typeof StepEngine !== 'undefined' && StepEngine.getStepConfig) {
    const step7Config = StepEngine.getStepConfig('step7');
    if (step7Config && step7Config.tasks) {
      const principlesTask = step7Config.tasks.find(t => t.taskId === 'step7_arch_principles');
      if (principlesTask && principlesTask.instructionFile === '7_1_arch_principles.instruction.md') {
        console.log('✅ PASS: Step 7 correctly references 7_1_arch_principles.instruction.md');
        tests.passed++;
      } else {
        console.error('❌ FAIL: Step 7 instruction file reference not found');
        tests.failed++;
      }
    }
  } else {
    console.warn('⚠️  WARNING: Cannot verify StepEngine integration (StepEngine not loaded)');
    tests.warnings++;
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY:`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  
  if (tests.failed === 0 && tests.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 1.2 implementation complete.');
  } else if (tests.failed === 0) {
    console.log('\n✅ TESTS PASSED with warnings. Review warnings above.');
  } else {
    console.log('\n❌ TESTS FAILED. Fix issues above and re-run.');
  }
  
  // Recommendations
  if (principles.length > 0 && aiPrinciples.length === 0) {
    console.log('\n💡 RECOMMENDATION:');
    console.log('   No AI principle detected. Regenerate Step 7 with updated instruction file.');
    console.log('   The enhanced instruction now MANDATES at least 1 AI/Automation principle.');
  }
  
  console.log('═══════════════════════════════════════════════\n');
  
  return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined' && window.model) {
  console.log('🔧 TDD Validation loaded. Run: validatePhase1Step2_AIPrinciples()');
}
