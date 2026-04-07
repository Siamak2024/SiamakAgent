/**
 * TDD VALIDATION: Phase 1.1 - Architecture Layers AI Agent Enhancement
 * 
 * Run this in browser console after implementing changes to validate:
 * 1. AI agents display with type badges
 * 2. TO-BE markers show for proposed agents
 * 3. Capability dependency count visible
 * 4. Distinct cyan styling
 * 5. Hover tooltips work
 */

function validatePhase1Step1_AIAgentStyling() {
  console.log('🧪 TEST: Phase 1.1 - Architecture Layers AI Agent Enhancement\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if model.aiAgents has enhanced schema
  console.log('Test 1: AI Agent Data Schema');
  const agents = window.model?.aiAgents || [];
  if (agents.length === 0) {
    console.warn('⚠️  WARNING: No AI agents in model. Generate architecture to test.');
    tests.warnings++;
  } else {
    const firstAgent = agents[0];
    const hasNewFields = firstAgent.agent_type || firstAgent.maturity_level || firstAgent.linked_capabilities;
    
    if (hasNewFields) {
      console.log('✅ PASS: AI agents have enhanced schema (agent_type, maturity_level, linked_capabilities)');
      tests.passed++;
    } else {
      console.error('❌ FAIL: AI agents missing enhanced schema. Current fields:', Object.keys(firstAgent));
      tests.failed++;
    }
  }
  
  // Test 2: Check if AI agent cards render with type badges
  console.log('\nTest 2: AI Agent Type Badges');
  const aiCards = document.querySelectorAll('.ai-card');
  if (aiCards.length === 0) {
    console.warn('⚠️  WARNING: No .ai-card elements found. Navigate to Architecture Layers tab.');
    tests.warnings++;
  } else {
    const firstCard = aiCards[0];
    const typeBadge = firstCard.querySelector('.ai-type-badge');
    
    if (typeBadge) {
      console.log(`✅ PASS: AI agent cards have type badges. Found: "${typeBadge.textContent}"`);
      tests.passed++;
    } else {
      console.error('❌ FAIL: No .ai-type-badge found in AI agent cards');
      tests.failed++;
    }
  }
  
  // Test 3: Check for TO-BE markers
  console.log('\nTest 3: TO-BE Markers');
  const tobeMarkers = document.querySelectorAll('.to-be-badge');
  if (tobeMarkers.length > 0) {
    console.log(`✅ PASS: Found ${tobeMarkers.length} TO-BE markers`);
    tests.passed++;
  } else {
    console.warn('⚠️  WARNING: No .to-be-badge elements. OK if no proposed agents exist.');
    tests.warnings++;
  }
  
  // Test 4: Check for capability dependency count
  console.log('\nTest 4: Capability Dependency Count');
  if (aiCards.length > 0) {
    const depCount = aiCards[0].querySelector('.ai-dep-count');
    if (depCount) {
      console.log(`✅ PASS: Capability dependency count visible: "${depCount.textContent}"`);
      tests.passed++;
    } else {
      console.error('❌ FAIL: No .ai-dep-count found in AI agent cards');
      tests.failed++;
    }
  }
  
  // Test 5: Check for cyan accent color (#1ea7c2)
  console.log('\nTest 5: Cyan Styling (#1ea7c2)');
  if (aiCards.length > 0) {
    const computedStyle = window.getComputedStyle(aiCards[0]);
    const borderColor = computedStyle.borderColor || computedStyle.borderLeftColor;
    const hasCyanAccent = borderColor.includes('30, 167, 194') || // rgb(30, 167, 194)
                           aiCards[0].classList.contains('border-cyan-600') ||
                           aiCards[0].style.borderColor === '#1ea7c2';
    
    if (hasCyanAccent) {
      console.log('✅ PASS: AI cards have cyan accent styling');
      tests.passed++;
    } else {
      console.error(`❌ FAIL: AI cards missing cyan accent. Found border: ${borderColor}`);
      tests.failed++;
    }
  }
  
  // Test 6: Check for robot icon
  console.log('\nTest 6: Robot Icon (fa-robot)');
  if (aiCards.length > 0) {
    const robotIcon = aiCards[0].querySelector('.fa-robot');
    if (robotIcon) {
      console.log('✅ PASS: AI cards have robot icon');
      tests.passed++;
    } else {
      console.error('❌ FAIL: No .fa-robot icon found in AI agent cards');
      tests.failed++;
    }
  }
  
  // Test 7: Hover tooltip
  console.log('\nTest 7: Hover Tooltips');
  if (aiCards.length > 0) {
    const tooltip = aiCards[0].getAttribute('title') || aiCards[0].querySelector('[title]')?.getAttribute('title');
    if (tooltip) {
      console.log(`✅ PASS: Tooltip found: "${tooltip.substring(0, 50)}..."`);
      tests.passed++;
    } else {
      console.warn('⚠️  WARNING: No tooltip on AI agent card');
      tests.warnings++;
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY:`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  
  if (tests.failed === 0 && tests.warnings === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 1.1 implementation complete.');
  } else if (tests.failed === 0) {
    console.log('\n✅ TESTS PASSED with warnings. Review warnings above.');
  } else {
    console.log('\n❌ TESTS FAILED. Fix issues above and re-run.');
  }
  console.log('═══════════════════════════════════════════════\n');
  
  return { passed: tests.passed, failed: tests.failed, warnings: tests.warnings };
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined' && window.model) {
  console.log('🔧 TDD Validation loaded. Run: validatePhase1Step1_AIAgentStyling()');
}
