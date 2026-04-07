/**
 * TDD VALIDATION: Phase 1.4 - Strategic Intent AI Question
 * 
 * Run this in browser console after completing Step 1 to validate:
 * 1. Q7b AI transformation question was asked during Step 1
 * 2. Strategic Intent includes ai_transformation_themes field
 * 3. AI transformation themes are populated (unless "No AI plans" selected)
 * 4. Themes are business-outcome focused, not technical jargon
 * 5. Subsequent steps can reference AI ambition from Strategic Intent
 */

function validatePhase1Step4_StrategicIntentAIQuestion() {
  console.log('🧪 TEST: Phase 1.4 - Strategic Intent AI Question\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if Strategic Intent exists
  console.log('Test 1: Strategic Intent Data Structure');
  const strategicIntent = window.model?.strategicIntent;
  if (!strategicIntent) {
    console.error('❌ FAIL: No Strategic Intent found. Complete Step 1 to test.');
    tests.failed++;
    return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
  } else {
    console.log('✅ PASS: Strategic Intent exists');
    console.log(`   Org: ${strategicIntent.org_name || 'N/A'}`);
    console.log(`   Industry: ${strategicIntent.industry || 'N/A'}`);
    tests.passed++;
  }
  
  // Test 2: Check if ai_transformation_themes field exists
  console.log('\nTest 2: AI Transformation Themes Field');
  if (!strategicIntent.hasOwnProperty('ai_transformation_themes')) {
    console.error('❌ FAIL: ai_transformation_themes field missing from Strategic Intent');
    console.log('   Expected: strategicIntent.ai_transformation_themes array');
    console.log(`   Found fields: ${Object.keys(strategicIntent).join(', ')}`);
    tests.failed++;
  } else {
    console.log('✅ PASS: ai_transformation_themes field exists');
    tests.passed++;
  }
  
  // Test 3: Check if ai_transformation_themes is populated
  console.log('\nTest 3: AI Transformation Themes Content');
  const aiThemes = strategicIntent.ai_transformation_themes || [];
  
  if (!Array.isArray(aiThemes)) {
    console.error('❌ FAIL: ai_transformation_themes is not an array');
    console.log(`   Type: ${typeof aiThemes}`);
    tests.failed++;
  } else if (aiThemes.length === 0) {
    console.warn('⚠️  WARNING: ai_transformation_themes is empty');
    console.log('   This is OK if user selected "No AI plans" in Q7b');
    console.log('   Otherwise, Q7b answer may not have been captured properly');
    tests.warnings++;
  } else {
    console.log(`✅ PASS: Found ${aiThemes.length} AI transformation themes`);
    aiThemes.forEach((theme, i) => console.log(`   ${i+1}. "${theme}"`));
    tests.passed++;
  }
  
  // Test 4: Check theme quality (business outcomes, not technical jargon)
  if (aiThemes.length > 0) {
    console.log('\nTest 4: Theme Quality (Business-Outcome Focused)');
    
    // Good indicators: "automate", "AI-driven", "predictive", specific processes
    // Bad indicators: "implement", "deploy", "leverage AI", "use ML"
    const badPhrases = ['implement', 'deploy', 'leverage ai', 'use ml', 'adopt'];
    const goodPhrases = ['automate', 'ai-driven', 'ai-powered', 'predictive', 'intelligent'];
    
    let qualityIssues = [];
    aiThemes.forEach((theme, i) => {
      const themeLower = theme.toLowerCase();
      const hasBad = badPhrases.some(phrase => themeLower.includes(phrase));
      const hasGood = goodPhrases.some(phrase => themeLower.includes(phrase));
      
      if (hasBad && !hasGood) {
        qualityIssues.push(`Theme ${i+1}: "${theme}" (too technical/generic)`);
      }
    });
    
    if (qualityIssues.length > 0) {
      console.warn('⚠️  WARNING: Some themes may be too technical');
      qualityIssues.forEach(issue => console.log(`   ${issue}`));
      console.log('   Recommendation: Themes should describe business outcomes, not tech implementation');
      tests.warnings++;
    } else {
      console.log('✅ PASS: Themes are business-outcome focused');
      tests.passed++;
    }
  }
  
  // Test 5: Check if Q7b was asked (answers should exist)
  console.log('\nTest 5: Q7b Question Was Asked');
  const stepAnswers = window.model?._stepAnswers || {};
  const q7bAnswer = stepAnswers.step1_q7b_ai_role;
  
  if (!q7bAnswer) {
    console.warn('⚠️  WARNING: No Q7b answer found in _stepAnswers');
    console.log('   Q7b may not have been asked (older Step 1 completion)');
    console.log('   Regenerate Step 1 to test new question');
    tests.warnings++;
  } else {
    console.log('✅ PASS: Q7b answer exists');
    console.log(`   Answer: "${q7bAnswer.q7b_ai_role?.substring(0, 80)}..."`);
    tests.passed++;
  }
  
  // Test 6: Verify themes align with strategic_themes
  if (aiThemes.length > 0 && strategicIntent.strategic_themes) {
    console.log('\nTest 6: AI Themes Align with Strategic Themes');
    const stratThemes = strategicIntent.strategic_themes || [];
    
    // Check if any AI theme mentions words from strategic themes
    let alignmentFound = false;
    aiThemes.forEach(aiTheme => {
      const aiWords = aiTheme.toLowerCase().split(' ');
      stratThemes.forEach(stratTheme => {
        const stratWords = stratTheme.toLowerCase().split(' ');
        const overlap = aiWords.filter(word => 
          stratWords.includes(word) && word.length > 4 // Ignore short words like "the", "and"
        );
        if (overlap.length > 0) {
          alignmentFound = true;
        }
      });
    });
    
    if (alignmentFound) {
      console.log('✅ PASS: AI themes reference strategic themes');
      tests.passed++;
    } else {
      console.warn('⚠️  INFO: AI themes don't explicitly reference strategic themes');
      console.log('   This is OK — AI themes may enable strategic themes indirectly');
      console.log(`   Strategic themes: ${stratThemes.join(', ')}`);
    }
  }
  
  // Test 7: Verify Step 7 can reference AI ambition
  console.log('\nTest 7: Integration with Step 7 Context');
  // Check if StepContext can access ai_transformation_themes
  if (typeof StepContext !== 'undefined' && StepContext.build) {
    try {
      const testContext = StepContext.build(window.model, 'step7');
      if (testContext.strategicIntent?.ai_transformation_themes) {
        console.log('✅ PASS: Step 7 context includes ai_transformation_themes');
        console.log(`   Context has ${testContext.strategicIntent.ai_transformation_themes.length} AI themes`);
        tests.passed++;
      } else {
        console.warn('⚠️  WARNING: Step 7 context may not include ai_transformation_themes');
        tests.warnings++;
      }
    } catch (e) {
      console.warn('⚠️  WARNING: Could not test Step 7 context integration');
      console.log(`   Error: ${e.message}`);
      tests.warnings++;
    }
  } else {
    console.log('⏭️  SKIP: StepContext not available (OK)');
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY:`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  
  if (tests.failed === 0 && tests.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 1.4 implementation complete.');
  } else if (tests.failed === 0) {
    console.log('\n✅ TESTS PASSED with warnings. Review warnings above.');
  } else {
    console.log('\n❌ TESTS FAILED. Fix issues above and re-run.');
  }
  
  // Recommendations
  if (tests.failed > 0 || (aiThemes.length === 0 && !q7bAnswer)) {
    console.log('\n💡 RECOMMENDATION:');
    console.log('   Regenerate Step 1 with the updated workflow to test Q7b question.');
    console.log('   The new question should appear after Q7 (Assumptions).');
  }
  
  if (aiThemes.length > 0) {
    console.log('\n✨ NEXT STEPS:');
    console.log('   AI transformation themes are now available in Strategic Intent.');
    console.log('   These will be referenced in:');
    console.log('   - Step 3: Capability mapping (AI-enabled capabilities)');
    console.log('   - Step 5: Gap analysis (AI opportunity identification)');
    console.log('   - Step 7: Target architecture (AI agent generation)');
  }
  
  console.log('═══════════════════════════════════════════════\n');
  
  return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined' && window.model) {
  console.log('🔧 TDD Validation loaded. Run: validatePhase1Step4_StrategicIntentAIQuestion()');
}
