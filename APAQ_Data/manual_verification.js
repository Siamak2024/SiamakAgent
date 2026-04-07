/**
 * APQC Integration - Manual Verification Script
 * ==============================================
 * Open this in browser console after navigating to the platform
 * Copy and paste the entire script into browser DevTools console
 */

(async function verifyAPQCIntegration() {
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
  console.log('%c  APQC Integration - Manual Verification', 'color: cyan; font-weight: bold');
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
  
  const results = {
    passed: [],
    failed: []
  };
  
  function test(name, condition, details = '') {
    const passed = Boolean(condition);
    if (passed) {
      console.log(`%c✓ ${name}`, 'color: green', details);
      results.passed.push(name);
    } else {
      console.log(`%c✗ ${name}`, 'color: red', details);
      results.failed.push(name);
    }
  }
  
  console.log('\n📦 Step 1: Check DataManager');
  test('EA_DataManager exists', typeof window.EA_DataManager === 'function');
  test('dataManager instance exists', window.dataManager instanceof window.EA_DataManager);
  test('APQC methods present', 
    typeof window.dataManager?.loadAPQCFramework === 'function' &&
    typeof window.dataManager?.getAPQCStatus === 'function'
  );
  
  console.log('\n🔧 Step 2: Load APQC Framework');
  try {
    const framework = await window.dataManager.loadAPQCFramework();
    test('Framework loaded', framework !== null);
    test('Framework has categories', framework?.categories?.length > 0);
    console.log(`  → ${framework?.categories?.length || 0} L1 categories loaded`);
    console.log(`  → Version: ${framework?.framework_version}`);
  } catch (error) {
    test('Framework loaded', false, error.message);
  }
  
  console.log('\n📊 Step 3: Test Filtering');
  try {
    const byCaps = await window.dataManager.getAPQCCapabilitiesByBusinessType('Technology');
    test('Filter by business type', Array.isArray(byCaps));
    console.log(`  → ${byCaps?.length || 0} capabilities for Technology`);
    
    const byIntent = await window.dataManager.getAPQCCapabilitiesByIntent('Innovation');
    test('Filter by strategic intent', Array.isArray(byIntent));
    console.log(`  → ${byIntent?.length || 0} capabilities for Innovation`);
  } catch (error) {
    test('Filtering', false, error.message);
  }
  
  console.log('\n🎨 Step 4: UI Elements');
  test('Capmap banner exists', !!document.getElementById('apqc-banner-capmap'));
  test('Heatmap banner exists', !!document.getElementById('apqc-banner-heatmap'));
  test('Layers banner exists', !!document.getElementById('apqc-banner-layers'));
  
  console.log('\n🔄 Step 5: Integration Functions');
  test('initializeAPQCIntegration', typeof window.initializeAPQCIntegration === 'function');
  test('loadAPQCForProject', typeof window.loadAPQCForProject === 'function');
  test('showAPQCSettings', typeof window.showAPQCSettings === 'function');
  test('updateAPQCBanners', typeof window.updateAPQCBanners === 'function');
  
  console.log('\n🧪 Step 6: Test Banner Update');
  try {
    window.updateAPQCBanners({
      integrated: true,
      version: '8.0',
      capability_count: 13,
      filters: { businessType: 'Technology', strategicIntent: 'Innovation' }
    });
    const capBanner = document.getElementById('apqc-banner-capmap');
    test('Banner visible after update', capBanner && !capBanner.classList.contains('hidden'));
    test('Status text updated', document.getElementById('apqc-status-capmap')?.textContent.includes('13 capabilities'));
  } catch (error) {
    test('Banner update', false, error.message);
  }
  
  console.log('\n📋 Step 7: Settings Modal');
  try {
    window.showAPQCSettings();
    test('Settings modal created', !!document.querySelector('.modal-overlay'));
    test('Business type dropdown', !!document.getElementById('apqc-business-type'));
    test('Strategic intent dropdown', !!document.getElementById('apqc-strategic-intent'));
    // Close modal
    document.querySelector('.modal-overlay')?.remove();
    console.log('  → Modal closed');
  } catch (error) {
    test('Settings modal', false, error.message);
  }
  
  console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
  console.log('%c  Summary', 'color: cyan; font-weight: bold');
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
  
  console.log(`%c✓ Passed: ${results.passed.length}`, 'color: green; font-weight: bold');
  console.log(`%c✗ Failed: ${results.failed.length}`, results.failed.length > 0 ? 'color: red; font-weight: bold' : 'color: green; font-weight: bold');
  
  const passRate = (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1);
  console.log(`%cPass Rate: ${passRate}%`, 'color: ' + (passRate === '100.0' ? 'green' : 'yellow') + '; font-weight: bold; font-size: 14px');
  
  if (results.failed.length > 0) {
    console.log('\n%cFailed Tests:', 'color: red; font-weight: bold');
    results.failed.forEach(f => console.log(`  • ${f}`));
  }
  
  console.log('\n%c✅ Verification Complete!', 'color: green; font-weight: bold; font-size: 16px');
  console.log('\n%cNext Steps:', 'color: cyan; font-weight: bold');
  console.log('1. Test in Standard Mode: Start workflow and confirm APQC modal');
  console.log('2. Test in Autopilot Mode: Run autopilot and verify APQC auto-loads');
  console.log('3. Check Capability Map tab for APQC capabilities');
  console.log('4. Try changing filters in Settings modal');
  
  return {
    passed: results.passed.length,
    failed: results.failed.length,
    total: results.passed.length + results.failed.length,
    passRate: passRate + '%'
  };
})();
