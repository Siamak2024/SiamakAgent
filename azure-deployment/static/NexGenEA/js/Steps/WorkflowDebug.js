/**
 * Workflow State Diagnostic Tool
 * Use: WorkflowDebug.checkState() in console
 */

window.WorkflowDebug = {
  /**
   * Show complete workflow state
   */
  checkState() {
    console.group('%c🔍 WORKFLOW STATE DIAGNOSTIC', 'color: #4c6ef5; font-size: 18px; font-weight: bold;');
    
    const m = window.model || {};
    const steps = m.steps || {};
    
    console.group('Step 1: Business Objectives');
    console.log('✓ Formal status:', steps.step1?.status);
    console.log('✓ businessContextConfirmed:', m.businessContextConfirmed);
    console.log('✓ businessContext exists:', !!m.businessContext);
    console.log('✓ SHOULD BE DONE:', !!(steps.step1?.status === 'completed' || (m.businessContextConfirmed && m.businessContext)));
    console.groupEnd();
    
    console.group('Step 2: Capability Mapping');
    console.log('✓ Formal status:', steps.step2?.status);
    console.log('✓ capabilityValidated:', m.capabilityValidated);
    console.log('✓ capabilities.length:', m.capabilities?.length || 0);
    console.log('✓ SHOULD BE DONE:', !!((steps.step2?.status === 'completed' && m.capabilities?.length > 0) || (m.capabilityValidated && m.capabilities?.length > 0)));
    console.groupEnd();
    
    console.group('Step 3: Target Architecture');
    console.log('✓ Formal status:', steps.step3?.status);
    console.log('✓ targetArchDone:', m.targetArchDone);
    console.log('✓ targetArch exists:', !!m.targetArch);
    console.log('✓ targetArch type:', typeof m.targetArch);
    console.log('✓ targetArch value:', m.targetArch);
    console.log('✓ SHOULD BE DONE:', !!(steps.step3?.status === 'completed' && m.targetArch));
    console.groupEnd();
    
    console.group('Step 4: Transformation Roadmap');
    console.log('✓ Formal status:', steps.step4?.status);
    console.log('✓ operatingModelDelta:', !!m.operatingModelDelta);
    console.log('✓ roadmap exists:', !!m.roadmap);
    console.log('✓ roadmap type:', typeof m.roadmap);
    console.log('✓ roadmap value:', m.roadmap);
    console.log('✓ SHOULD BE DONE:', !!(steps.step4?.status === 'completed' && m.roadmap));
    console.groupEnd();
    
    console.groupEnd();
    
    console.log('\n%c💡 TIP: If steps show as complete when they shouldn\'t be, check for stale data in targetArch/roadmap', 'color: #ffd43b; font-weight: bold;');
  },
  
  /**
   * Clear stale Step 3/4 data
   */
  clearStaleData() {
    console.group('%c🧹 CLEARING STALE DATA', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
    
    let cleared = [];
    
    if (window.model.targetArch && !window.model.steps?.step3?.status) {
      console.log('❌ Removing stale targetArch (Step 3 not formally complete)');
      delete window.model.targetArch;
      delete window.model.targetArchDone;
      cleared.push('Step 3 data');
    }
    
    if (window.model.roadmap && !window.model.steps?.step4?.status) {
      console.log('❌ Removing stale roadmap (Step 4 not formally complete)');
      delete window.model.roadmap;
      delete window.model.operatingModelDelta;
      cleared.push('Step 4 data');
    }
    
    if (cleared.length > 0) {
      console.log('✅ Cleared:', cleared.join(', '));
      
      if (typeof updateWorkflowStepStates === 'function') {
        updateWorkflowStepStates();
        console.log('✅ Updated workflow UI');
      }
      
      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
        console.log('✅ Saved changes');
      }
      
      console.log('\n%c🎯 Refresh browser to see clean workflow state!', 'color: #51cf66; font-size: 14px; font-weight: bold;');
    } else {
      console.log('✅ No stale data found - workflow state is clean!');
    }
    
    console.groupEnd();
  },
  
  /**
   * Force set completion flags for Steps 3 and 4 if data exists
   */
  forceSetCompletionFlags() {
    console.group('%c🔧 FORCE SET COMPLETION FLAGS', 'color: #ffd43b; font-size: 16px; font-weight: bold;');
    
    let updated = [];
    
    // Step 3: If targetArch exists but targetArchDone is not set
    if (window.model.targetArch && !window.model.targetArchDone) {
      window.model.targetArchDone = true;
      updated.push('Step 3: targetArchDone = true');
      console.log('✅ Set targetArchDone flag');
    }
    
    // Step 4: If roadmap exists but operatingModelDelta is not set
    if (window.model.roadmap && !window.model.operatingModelDelta) {
      window.model.operatingModelDelta = true;
      updated.push('Step 4: operatingModelDelta = true');
      console.log('✅ Set operatingModelDelta flag');
    }
    
    if (updated.length > 0) {
      console.log('✅ Updated flags:', updated);
      
      if (typeof updateWorkflowStepStates === 'function') {
        updateWorkflowStepStates();
        console.log('✅ Updated workflow UI');
      }
      
      if (typeof updateNavigationLockStates === 'function') {
        updateNavigationLockStates();
        console.log('✅ Updated navigation lock states');
      }
      
      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
        console.log('✅ Saved changes');
      }
      
      console.log('\n%c🎯 Navigation should now be unlocked!', 'color: #51cf66; font-size: 14px; font-weight: bold;');
    } else {
      console.log('✅ All completion flags already set!');
    }
    
    console.groupEnd();
  },
  
  /**
   * Force refresh workflow UI badges
   */
  refreshWorkflowUI() {
    console.group('%c🔄 REFRESH WORKFLOW UI', 'color: #4c6ef5; font-size: 16px; font-weight: bold;');
    
    console.log('Calling updateWorkflowStepStates()...');
    
    if (typeof updateWorkflowStepStates === 'function') {
      updateWorkflowStepStates();
      console.log('✅ Workflow badges refreshed');
    } else {
      console.error('❌ updateWorkflowStepStates function not found');
    }
    
    if (typeof updateNavigationLockStates === 'function') {
      updateNavigationLockStates();
      console.log('✅ Navigation states refreshed');
    }
    
    console.log('\n%c🎯 Check the console output above for step completion details', 'color: #51cf66; font-size: 14px; font-weight: bold;');
    console.groupEnd();
  }
};

console.log('%c✅ WorkflowDebug loaded', 'color: #51cf66; font-weight: bold;');
console.log('Commands:');
console.log('  • WorkflowDebug.checkState() - Show complete workflow state');
console.log('  • WorkflowDebug.clearStaleData() - Remove orphaned Step 3/4 data');
console.log('  • WorkflowDebug.forceSetCompletionFlags() - Force set targetArchDone/operatingModelDelta flags');
console.log('  • WorkflowDebug.refreshWorkflowUI() - Force refresh workflow badges');
