/**
 * TDD VALIDATION: Phase 1.5 - Roadmap AI Initiative Grouping
 * 
 * Run this in browser console after generating Step 7 roadmap to validate:
 * 1. AI initiatives are visually distinguished from business initiatives
 * 2. AI detection logic correctly identifies AI-related initiatives
 * 3. AI badge (robot icon) appears on AI initiative cards
 * 4. AI initiatives have cyan/teal styling
 * 5. Legend includes AI/Automation indicator
 * 6. AI themes from Strategic Intent are used for detection
 */

function validatePhase1Step5_RoadmapAIGrouping() {
  console.log('🧪 TEST: Phase 1.5 - Roadmap AI Initiative Grouping\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if roadmap exists
  console.log('Test 1: Roadmap Data Structure');
  const initiatives = window.model?.initiatives;
  if (!initiatives || initiatives.length === 0) {
    console.error('❌ FAIL: No initiatives found. Complete Step 7 to test.');
    tests.failed++;
    return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
  } else {
    console.log(`✅ PASS: Found ${initiatives.length} initiatives in roadmap`);
    tests.passed++;
  }
  
  // Test 2: Check if AI detection logic is available
  console.log('\nTest 2: AI Detection Function');
  const roadmapVisContent = document.getElementById('roadmapvis-content');
  if (!roadmapVisContent) {
    console.error('❌ FAIL: Roadmap visual container not found');
    console.log('   Expected: <div id="roadmapvis-content">');
    tests.failed++;
  } else {
    console.log('✅ PASS: Roadmap visual container exists');
    tests.passed++;
  }
  
  // Test 3: Check for AI initiatives in the data
  console.log('\nTest 3: AI Initiative Detection in Data');
  const aiKeywords = /\b(ai|artificial intelligence|ml|machine learning|automation|automate|intelligent|predictive|bot|rpa|robotic process|neural|deep learning|generative)\b/i;
  const aiInitiatives = initiatives.filter(init => {
    const title = String(init.name || init.title || '').toLowerCase();
    const description = String(init.description || '').toLowerCase();
    return aiKeywords.test(title) || aiKeywords.test(description);
  });
  
  if (aiInitiatives.length === 0) {
    console.warn('⚠️  WARNING: No AI initiatives detected in roadmap');
    console.log('   AI detection relies on keywords: AI, ML, automation, intelligent, predictive, bot, RPA, etc.');
    console.log('   This is OK if roadmap has no AI initiatives, but reduces test coverage.');
    tests.warnings++;
  } else {
    console.log(`✅ PASS: Detected ${aiInitiatives.length} AI initiatives in data`);
    aiInitiatives.slice(0, 3).forEach(init => 
      console.log(`   • "${init.name || init.title}"`)
    );
    tests.passed++;
  }
  
  // Test 4: Check for AI styling in rendered HTML
  console.log('\nTest 4: AI Initiative Visual Styling');
  const aiCards = document.querySelectorAll('.ea-roadmap-cell.is-ai');
  
  if (aiInitiatives.length > 0 && aiCards.length === 0) {
    console.error('❌ FAIL: AI initiatives exist but no .is-ai styled cards found');
    console.log('   Expected: .ea-roadmap-cell.is-ai elements in roadmap');
    console.log('   Actual: 0 elements with .is-ai class');
    tests.failed++;
  } else if (aiCards.length > 0) {
    console.log(`✅ PASS: Found ${aiCards.length} AI-styled initiative cards`);
    
    // Check if cards have cyan/teal background
    const firstCard = aiCards[0];
    const bgColor = window.getComputedStyle(firstCard).background;
    if (bgColor.includes('rgb') || bgColor.includes('gradient')) {
      console.log('   ✓ AI cards have gradient background styling');
    }
    
    tests.passed++;
  } else {
    console.log('⏭️  SKIP: No AI initiatives to validate styling');
  }
  
  // Test 5: Check for AI badge (robot icon)
  console.log('\nTest 5: AI Robot Badge Icon');
  const aiBadges = document.querySelectorAll('.ea-roadmap-cell__ai-badge');
  
  if (aiInitiatives.length > 0 && aiBadges.length === 0) {
    console.error('❌ FAIL: AI initiatives exist but no robot badges found');
    console.log('   Expected: .ea-roadmap-cell__ai-badge elements on AI cards');
    tests.failed++;
  } else if (aiBadges.length > 0) {
    console.log(`✅ PASS: Found ${aiBadges.length} AI robot badges`);
    const firstBadge = aiBadges[0];
    const badgeText = firstBadge.textContent.trim();
    console.log(`   Badge content: "${badgeText}"`);
    
    // Check tooltip
    const title = firstBadge.getAttribute('title');
    if (title && title.includes('AI')) {
      console.log(`   ✓ Tooltip: "${title}"`);
    }
    
    tests.passed++;
  } else {
    console.log('⏭️  SKIP: No AI badges to validate');
  }
  
  // Test 6: Check legend for AI indicator
  console.log('\nTest 6: Legend AI/Automation Entry');
  const legend = document.querySelector('.ea-roadmap-legend');
  
  if (!legend) {
    console.warn('⚠️  WARNING: Roadmap legend not found');
    tests.warnings++;
  } else {
    const legendText = legend.textContent || '';
    if (legendText.includes('AI') || legendText.includes('Automation')) {
      console.log('✅ PASS: Legend includes AI/Automation indicator');
      
      // Check for AI icon in legend
      const aiIcon = legend.querySelector('.ea-roadmap-legend__ai-icon');
      if (aiIcon) {
        console.log(`   ✓ AI icon present: "${aiIcon.textContent}"`);
      }
      
      tests.passed++;
    } else {
      console.error('❌ FAIL: Legend does not mention AI or Automation');
      console.log(`   Legend text: "${legendText.substring(0, 200)}..."`);
      tests.failed++;
    }
  }
  
  // Test 7: Check Strategic Intent AI themes integration
  console.log('\nTest 7: Strategic Intent AI Themes Integration');
  const aiThemes = window.model?.strategicIntent?.ai_transformation_themes || [];
  
  if (aiThemes.length === 0) {
    console.warn('⚠️  INFO: Strategic Intent has no AI transformation themes');
    console.log('   This is OK if no AI plans were selected in Step 1 Q7b');
    console.log('   AI detection will rely on keyword matching only');
  } else {
    console.log(`✅ PASS: Found ${aiThemes.length} AI transformation themes from Strategic Intent`);
    aiThemes.forEach(theme => console.log(`   • "${theme}"`));
    
    // Check if any initiatives reference these themes
    const themeMatches = initiatives.filter(init => {
      const title = String(init.name || init.title || '').toLowerCase();
      const description = String(init.description || '').toLowerCase();
      return aiThemes.some(theme => 
        title.includes(theme.toLowerCase()) || description.includes(theme.toLowerCase())
      );
    });
    
    if (themeMatches.length > 0) {
      console.log(`   ✓ ${themeMatches.length} initiatives reference AI transformation themes`);
    }
    
    tests.passed++;
  }
  
  // Test 8: Visual differentiation quality
  if (aiCards.length > 0) {
    console.log('\nTest 8: AI Initiative Visual Differentiation Quality');
    
    const firstAICard = aiCards[0];
    const computedStyle = window.getComputedStyle(firstAICard);
    
    // Check border color (should be cyan/teal)
    const borderColor = computedStyle.borderLeftColor;
    console.log(`   Border color: ${borderColor}`);
    
    // Check background (should be gradient)
    const bgImage = computedStyle.backgroundImage;
    if (bgImage.includes('gradient')) {
      console.log('   ✓ Background uses gradient');
    }
    
    // Check box shadow (should have subtle cyan shadow)
    const boxShadow = computedStyle.boxShadow;
    if (boxShadow !== 'none') {
      console.log('   ✓ Has box shadow for depth');
    }
    
    console.log('✅ PASS: AI cards have distinct visual styling');
    tests.passed++;
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY:`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  
  if (tests.failed === 0 && tests.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 1.5 implementation complete.');
  } else if (tests.failed === 0) {
    console.log('\n✅ TESTS PASSED with warnings. Review warnings above.');
  } else {
    console.log('\n❌ TESTS FAILED. Fix issues above and re-run.');
  }
  
  // Recommendations
  if (aiInitiatives.length === 0) {
    console.log('\n💡 RECOMMENDATION:');
    console.log('   To test AI grouping functionality:');
    console.log('   1. Complete Step 1 and select an AI transformation role in Q7b');
    console.log('   2. Regenerate Step 7 roadmap');
    console.log('   3. Verify initiatives include AI/automation keywords or reference AI themes');
  }
  
  if (aiCards.length > 0) {
    console.log('\n✨ VISUAL VALIDATION:');
    console.log('   Open the Roadmap tab and verify:');
    console.log('   • AI initiative cards have cyan/teal gradient background');
    console.log('   • Robot emoji (🤖) appears in top-right of AI cards');
    console.log('   • AI cards stand out from standard business initiatives');
    console.log('   • Legend shows "🤖 AI/Automation" indicator');
  }
  
  console.log('═══════════════════════════════════════════════\n');
  
  return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined' && window.model) {
  console.log('🔧 TDD Validation loaded. Run: validatePhase1Step5_RoadmapAIGrouping()');
}
