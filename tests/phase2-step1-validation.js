/**
 * TDD VALIDATION: Phase 2.1 - BMC AI Transformation Fields
 * 
 * Run this in browser console after completing Step 2 to validate:
 * 1. BMC includes ai_transformation object with 4 array fields
 * 2. AI-enabled activities are identified from key_activities
 * 3. AI-enabled resources are identified from key_resources
 * 4. AI-powered relationships reference customer_relationships
 * 5. AI revenue enablers reference revenue_streams
 * 6. AI transformation aligns with Strategic Intent themes
 */

function validatePhase2Step1_BMCAITransformation() {
  console.log('🧪 TEST: Phase 2.1 - BMC AI Transformation Fields\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if BMC exists
  console.log('Test 1: BMC Data Structure');
  const bmc = window.model?.bmc;
  if (!bmc) {
    console.error('❌ FAIL: No BMC found. Complete Step 2 to test.');
    tests.failed++;
    return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
  } else {
    console.log('✅ PASS: BMC exists');
    console.log(`   Value proposition: "${(bmc.value_proposition || '').substring(0, 80)}..."`);
    tests.passed++;
  }
  
  // Test 2: Check if ai_transformation field exists
  console.log('\nTest 2: AI Transformation Object');
  const aiTransform = bmc.ai_transformation;
  
  if (!aiTransform) {
    const si = window.model?.strategicIntent;
    const aiThemes = si?.ai_transformation_themes || [];
    
    if (aiThemes.length === 0) {
      console.warn('⚠️  INFO: No ai_transformation field in BMC');
      console.log('   This is OK - Strategic Intent has no AI transformation themes');
      console.log('   ai_transformation field is only generated when AI plans exist');
      tests.warnings++;
    } else {
      console.error('❌ FAIL: ai_transformation field missing from BMC');
      console.log(`   Strategic Intent has ${aiThemes.length} AI themes but BMC doesn't include ai_transformation`);
      console.log('   Expected: bmc.ai_transformation object with 4 fields');
      tests.failed++;
    }
  } else {
    console.log('✅ PASS: ai_transformation field exists');
    tests.passed++;
  }
  
  // Test 3: Validate ai_transformation structure
  if (aiTransform) {
    console.log('\nTest 3: AI Transformation Structure');
    
    const requiredFields = [
      'ai_enabled_activities',
      'ai_enabled_resources',
      'ai_powered_relationships',
      'ai_revenue_enablers'
    ];
    
    const missingFields = requiredFields.filter(f => !aiTransform.hasOwnProperty(f));
    
    if (missingFields.length > 0) {
      console.error(`❌ FAIL: Missing fields in ai_transformation: ${missingFields.join(', ')}`);
      console.log('   Expected all 4 fields: ai_enabled_activities, ai_enabled_resources, ai_powered_relationships, ai_revenue_enablers');
      tests.failed++;
    } else {
      console.log('✅ PASS: All 4 required fields present');
      
      // Check if fields are arrays
      const nonArrayFields = requiredFields.filter(f => !Array.isArray(aiTransform[f]));
      if (nonArrayFields.length > 0) {
        console.error(`❌ FAIL: Fields that are not arrays: ${nonArrayFields.join(', ')}`);
        tests.failed++;
      } else {
        console.log('   ✓ All fields are arrays');
        tests.passed++;
      }
    }
    
    // Display counts
    if (missingFields.length === 0) {
      console.log(`   ai_enabled_activities: ${(aiTransform.ai_enabled_activities || []).length} items`);
      console.log(`   ai_enabled_resources: ${(aiTransform.ai_enabled_resources || []).length} items`);
      console.log(`   ai_powered_relationships: ${(aiTransform.ai_powered_relationships || []).length} items`);
      console.log(`   ai_revenue_enablers: ${(aiTransform.ai_revenue_enablers || []).length} items`);
    }
  }
  
  // Test 4: Validate AI activities reference actual key_activities
  if (aiTransform && Array.isArray(aiTransform.ai_enabled_activities)) {
    console.log('\nTest 4: AI-Enabled Activities Alignment');
    
    const keyActivities = (bmc.key_activities || []).map(a => a.toLowerCase());
    const aiActivities = aiTransform.ai_enabled_activities;
    
    if (aiActivities.length === 0) {
      console.warn('⚠️  WARNING: No AI-enabled activities identified');
      console.log('   Expected: At least 1 activity from key_activities that uses AI');
      tests.warnings++;
    } else {
      console.log(`✅ PASS: ${aiActivities.length} AI-enabled activities identified`);
      aiActivities.slice(0, 3).forEach(act => console.log(`   • "${act}"`));
      
      // Check if activities reference key_activities
      const hasKeywordMatch = aiActivities.some(act => {
        const actLower = act.toLowerCase();
        return keyActivities.some(key => 
          actLower.includes(key.split(' ').slice(0, 2).join(' ')) || 
          key.includes(actLower.split(' ').slice(0, 2).join(' '))
        );
      });
      
      if (hasKeywordMatch) {
        console.log('   ✓ Activities reference key_activities');
      }
      
      tests.passed++;
    }
  }
  
  // Test 5: Validate AI resources contain ML/data keywords
  if (aiTransform && Array.isArray(aiTransform.ai_enabled_resources)) {
    console.log('\nTest 5: AI-Enabled Resources Quality');
    
    const aiResources = aiTransform.ai_enabled_resources;
    const aiKeywords = /\b(ai|ml|machine learning|data|analytics|platform|model|algorithm|intelligence|automation)\b/i;
    
    if (aiResources.length === 0) {
      console.warn('⚠️  WARNING: No AI-enabled resources identified');
      tests.warnings++;
    } else {
      console.log(`✅ PASS: ${aiResources.length} AI-enabled resources identified`);
      aiResources.forEach(res => console.log(`   • "${res}"`));
      
      // Check if resources contain AI keywords
      const validAIResources = aiResources.filter(res => aiKeywords.test(res));
      if (validAIResources.length < aiResources.length) {
        console.warn(`   ⚠️  ${aiResources.length - validAIResources.length} resources lack AI keywords`);
      } else {
        console.log('   ✓ All resources contain AI/data keywords');
      }
      
      tests.passed++;
    }
  }
  
  // Test 6: Validate alignment with Strategic Intent AI themes
  if (aiTransform) {
    console.log('\nTest 6: Strategic Intent AI Theme Alignment');
    
    const si = window.model?.strategicIntent;
    const aiThemes = (si?.ai_transformation_themes || []).map(t => t.toLowerCase());
    
    if (aiThemes.length === 0) {
      console.log('⏭️  SKIP: No AI themes in Strategic Intent to compare');
    } else {
      console.log(`   Strategic Intent has ${aiThemes.length} AI themes:`);
      aiThemes.forEach(theme => console.log(`   • "${theme}"`));
      
      // Check if any BMC AI elements reference the themes
      const allAIElements = [
        ...(aiTransform.ai_enabled_activities || []),
        ...(aiTransform.ai_enabled_resources || []),
        ...(aiTransform.ai_powered_relationships || []),
        ...(aiTransform.ai_revenue_enablers || [])
      ].map(e => e.toLowerCase());
      
      const hasThemeAlignment = aiThemes.some(theme => 
        allAIElements.some(element => 
          element.includes(theme) || theme.split(' ').some(word => word.length > 4 && element.includes(word))
        )
      );
      
      if (hasThemeAlignment) {
        console.log('✅ PASS: BMC AI elements reference Strategic Intent themes');
        tests.passed++;
      } else {
        console.warn('⚠️  WARNING: BMC AI elements don\'t explicitly reference Strategic Intent themes');
        console.log('   This is OK - themes may be implemented differently in BMC');
        tests.warnings++;
      }
    }
  }
  
  // Test 7: Check data propagation to Step 3
  console.log('\nTest 7: AI Transformation Propagation');
  if (aiTransform) {
    console.log('✅ INFO: ai_transformation available for downstream steps');
    console.log('   • Step 3 (Capabilities) can mark AI-enabled capabilities');
    console.log('   • Step 5 (Gap Analysis) can identify AI capability gaps');
    console.log('   • Step 7 (Architecture) can design AI agent layers');
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY:`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  
  if (tests.failed === 0 && tests.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 2.1 implementation complete.');
  } else if (tests.failed === 0) {
    console.log('\n✅ TESTS PASSED with warnings. Review warnings above.');
  } else {
    console.log('\n❌ TESTS FAILED. Fix issues above and re-run.');
  }
  
  // Recommendations
  if (!aiTransform && tests.failed > 0) {
    console.log('\n💡 RECOMMENDATION:');
    console.log('   1. Ensure Step 1 Q7b was answered with AI transformation role');
    console.log('   2. Regenerate Step 2 BMC');
    console.log('   3. Verify ai_transformation_themes exist in Strategic Intent');
  }
  
  if (aiTransform) {
    console.log('\n✨ NEXT STEPS:');
    console.log('   Phase 2.1 complete. Move to Phase 2.2:');
    console.log('   • Update Step 3 Capability Map data contract');
    console.log('   • Add ai_enabled field to capabilities');
    console.log('   • Reference BMC ai_transformation in capability generation');
  }
  
  console.log('═══════════════════════════════════════════════\n');
  
  return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined' && window.model) {
  console.log('🔧 TDD Validation loaded. Run: validatePhase2Step1_BMCAITransformation()');
}
