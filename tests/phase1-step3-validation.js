/**
 * TDD VALIDATION: Phase 1.3 - Capability Map AI Icons
 * 
 * Run this in browser console after generating Step 3 capabilities to validate:
 * 1. CSS styling for .ai-indicator exists
 * 2. AI-enabled capabilities show robot icon
 * 3. Icon has correct teal color (#0d9488)
 * 4. Tooltip shows "AI-enabled capability"
 * 5. Icon position is after capability name, before change tag
 */

function validatePhase1Step3_CapabilityMapAIIcons() {
  console.log('🧪 TEST: Phase 1.3 - Capability Map AI Icons\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if .ai-indicator CSS class exists
  console.log('Test 1: CSS Styling for .ai-indicator');
  const styleSheets = Array.from(document.styleSheets);
  let aiIndicatorStyleFound = false;
  
  try {
    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        const aiIndicatorRule = rules.find(rule => 
          rule.selectorText && rule.selectorText.includes('.ai-indicator')
        );
        if (aiIndicatorRule) {
          aiIndicatorStyleFound = true;
          const color = aiIndicatorRule.style.color;
          console.log(`✅ PASS: .ai-indicator CSS found with color: ${color}`);
          tests.passed++;
          break;
        }
      } catch (e) {
        // Skip cross-origin stylesheets
      }
    }
  } catch (e) {
    console.warn('⚠️  WARNING: Could not fully inspect stylesheets (CORS)');
  }
  
  if (!aiIndicatorStyleFound) {
    console.error('❌ FAIL: .ai-indicator CSS class not found');
    tests.failed++;
  }
  
  // Test 2: Check if capabilities data structure exists
  console.log('\nTest 2: Capabilities Data Structure');
  const capabilities = window.model?.capabilities || [];
  if (capabilities.length === 0) {
    console.warn('⚠️  WARNING: No capabilities found. Generate Step 3 to test.');
    tests.warnings++;
  } else {
    console.log(`✅ PASS: Found ${capabilities.length} capabilities`);
    tests.passed++;
  }
  
  // Test 3: Check for ai_enabled or ai_maturity fields in capabilities
  console.log('\nTest 3: AI Fields in Capability Data');
  const aiEnabledCaps = capabilities.filter(c => c.ai_enabled || c.ai_maturity > 1);
  
  if (capabilities.length > 0) {
    if (aiEnabledCaps.length === 0) {
      console.warn('⚠️  WARNING: No capabilities marked as AI-enabled');
      console.log('   This is OK if Step 3 hasn\'t generated ai_enabled fields yet');
      console.log('   (Phase 2 will add AI fields to instruction files)');
      tests.warnings++;
    } else {
      console.log(`✅ PASS: Found ${aiEnabledCaps.length} AI-enabled capabilities`);
      aiEnabledCaps.slice(0, 3).forEach(c => 
        console.log(`   - "${c.name}" (ai_enabled: ${c.ai_enabled}, ai_maturity: ${c.ai_maturity || 'N/A'})`)
      );
      tests.passed++;
    }
  }
  
  // Test 4: Check if AI icons render in Capability Map DOM
  console.log('\nTest 4: AI Icons in Capability Map DOM');
  const capMapGrid = document.getElementById('cap-grid');
  
  if (!capMapGrid) {
    console.warn('⚠️  WARNING: Capability Map grid not found. Navigate to Capability Map tab.');
    tests.warnings++;
  } else {
    const aiIcons = capMapGrid.querySelectorAll('.ai-indicator');
    
    if (aiEnabledCaps.length > 0 && aiIcons.length === 0) {
      console.error('❌ FAIL: AI-enabled capabilities exist but no .ai-indicator icons rendered');
      console.log('   Expected: Robot icons for AI-enabled capabilities');
      console.log('   Found: No .ai-indicator elements in DOM');
      tests.failed++;
    } else if (aiIcons.length > 0) {
      console.log(`✅ PASS: Found ${aiIcons.length} AI indicator icons in Capability Map`);
      tests.passed++;
      
      // Check icon properties
      const firstIcon = aiIcons[0];
      const computedStyle = window.getComputedStyle(firstIcon);
      const color = computedStyle.color;
      const fontSize = computedStyle.fontSize;
      
      console.log(`   Icon color: ${color}`);
      console.log(`   Icon size: ${fontSize}`);
      console.log(`   Title: "${firstIcon.getAttribute('title')}"`);
    } else {
      console.log('⚠️  INFO: No AI icons rendered (expected if no AI-enabled capabilities)');
      tests.passed++;
    }
  }
  
  // Test 5: Verify icon color is teal (#0d9488 or rgb(13, 148, 136))
  if (capMapGrid) {
    console.log('\nTest 5: Icon Color Verification');
    const aiIcons = capMapGrid.querySelectorAll('.ai-indicator');
    
    if (aiIcons.length > 0) {
      const firstIcon = aiIcons[0];
      const computedStyle = window.getComputedStyle(firstIcon);
      const color = computedStyle.color;
      
      // Check if color is teal (rgb(13, 148, 136))
      const isTeal = color.includes('13, 148, 136') || color.includes('0d9488');
      
      if (isTeal) {
        console.log('✅ PASS: Icon color is teal (#0d9488)');
        tests.passed++;
      } else {
        console.warn('⚠️  WARNING: Icon color may not be teal');
        console.log(`   Expected: rgb(13, 148, 136) or #0d9488`);
        console.log(`   Found: ${color}`);
        tests.warnings++;
      }
    } else {
      console.log('⏭️  SKIP: No icons to verify color');
    }
  }
  
  // Test 6: Verify tooltip text
  if (capMapGrid) {
    console.log('\nTest 6: Tooltip Text');
    const aiIcons = capMapGrid.querySelectorAll('.ai-indicator');
    
    if (aiIcons.length > 0) {
      const firstIcon = aiIcons[0];
      const title = firstIcon.getAttribute('title');
      
      if (title === 'AI-enabled capability') {
        console.log('✅ PASS: Tooltip text is "AI-enabled capability"');
        tests.passed++;
      } else {
        console.error('❌ FAIL: Incorrect tooltip text');
        console.log(`   Expected: "AI-enabled capability"`);
        console.log(`   Found: "${title}"`);
        tests.failed++;
      }
    } else {
      console.log('⏭️  SKIP: No icons to verify tooltip');
    }
  }
  
  // Test 7: Verify icon is Font Awesome robot
  if (capMapGrid) {
    console.log('\nTest 7: Font Awesome Robot Icon');
    const aiIcons = capMapGrid.querySelectorAll('.ai-indicator');
    
    if (aiIcons.length > 0) {
      const firstIcon = aiIcons[0];
      const hasFaRobot = firstIcon.classList.contains('fa-robot');
      const hasFontAwesome = firstIcon.classList.contains('fas') || firstIcon.classList.contains('fa');
      
      if (hasFaRobot && hasFontAwesome) {
        console.log('✅ PASS: Icon is Font Awesome robot (.fas.fa-robot)');
        tests.passed++;
      } else {
        console.error('❌ FAIL: Icon is not Font Awesome robot');
        console.log(`   Has .fa-robot: ${hasFaRobot}`);
        console.log(`   Has Font Awesome class: ${hasFontAwesome}`);
        console.log(`   Classes: ${firstIcon.className}`);
        tests.failed++;
      }
    } else {
      console.log('⏭️  SKIP: No icons to verify');
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY:`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  
  if (tests.failed === 0 && tests.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 1.3 implementation complete.');
  } else if (tests.failed === 0) {
    console.log('\n✅ TESTS PASSED with warnings. Review warnings above.');
  } else {
    console.log('\n❌ TESTS FAILED. Fix issues above and re-run.');
  }
  
  // Recommendations
  if (capabilities.length > 0 && aiEnabledCaps.length === 0) {
    console.log('\n💡 RECOMMENDATION:');
    console.log('   No AI-enabled capabilities detected.');
    console.log('   Phase 2 will add AI field generation to Step 3 instruction files.');
    console.log('   For now, manually set c.ai_enabled=true on a capability to test icon rendering:');
    console.log('   > model.capabilities[0].ai_enabled = true');
    console.log('   > renderCapMap()');
  }
  
  if (capMapGrid && capMapGrid.innerHTML === '') {
    console.log('\n💡 TIP:');
    console.log('   Capability Map is empty. Generate Step 3 architecture first.');
  }
  
  console.log('═══════════════════════════════════════════════\n');
  
  return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined' && window.model) {
  console.log('🔧 TDD Validation loaded. Run: validatePhase1Step3_CapabilityMapAIIcons()');
}
