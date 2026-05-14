/**
 * Step3_DEBUG.js — Diagnostic utility to inspect Step 3 context
 * 
 * Add this to NexGenEA_V11.html after Step3.js:
 * <script src="js/Steps/Step3_DEBUG.js"></script>
 * 
 * Then open browser console and run:
 * Step3Debug.inspectContext()
 */

const Step3Debug = {
  
  /**
   * Inspect the context that would be passed to Step 3
   */
  inspectContext() {
    console.group('%c🔍 STEP 3 CONTEXT INSPECTION', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
    
    const model = window.model || {};
    const ctx = StepContext.build('step3', model);
    
    // ── Business Context (Step 1) ────────────────────────────────────────
    console.group('%c📋 BUSINESS CONTEXT (Step 1)', 'color: #4ecdc4; font-weight: bold;');
    const bc = ctx.businessContext || {};
    console.log('Exists:', !!bc);
    console.log('Objectives:', bc.objectives?.length || 0, 'items');
    if (bc.objectives?.length > 0) {
      console.log('Sample objective:', bc.objectives[0].objective || bc.objectives[0].name);
    }
    console.log('Strategic themes:', bc.strategicThemes?.length || 0);
    console.log('Industry:', bc.industry || 'NOT SET');
    console.log('Constraints:', bc.constraints?.length || 0);
    console.log('Challenges:', bc.challenges?.length || 0);
    console.groupEnd();
    
    // ── Capability Data (Step 2) ─────────────────────────────────────────
    console.group('%c🗺️ CAPABILITY DATA (Step 2)', 'color: #95e1d3; font-weight: bold;');
    console.log('Capabilities:', ctx.capabilities?.length || 0, 'items');
    if (ctx.capabilities?.length > 0) {
      console.log('L1 capabilities:', ctx.capabilities.filter(c => c.level === 1).length);
      console.log('Sample capability:', ctx.capabilities[0].name);
      console.log('AI-enabled caps:', ctx.capabilities.filter(c => c.ai_enabled).length);
    }
    console.log('Gap insights:', ctx.gapInsights?.length || 0, 'items');
    if (ctx.gapInsights?.length > 0) {
      console.log('Sample gap:', ctx.gapInsights[0].gap_id, '-', ctx.gapInsights[0].gap_description?.slice(0, 60));
    }
    console.log('White spots:', ctx.whiteSpots?.length || 0, 'items');
    if (ctx.whiteSpots?.length > 0) {
      console.log('Sample white spot:', ctx.whiteSpots[0].capability_name);
    }
    console.log('Top recommendations:', ctx.topRecommendations?.length || 0, 'items');
    if (ctx.topRecommendations?.length > 0) {
      console.log('Sample rec:', ctx.topRecommendations[0].title);
    }
    console.log('Capability Map:', !!ctx.capabilityMap);
    console.groupEnd();
    
    // ── Summary ───────────────────────────────────────────────────────────
    console.group('%c📊 SUMMARY', 'color: #ffd93d; font-weight: bold;');
    const hasBusinessContext = !!bc && bc.objectives?.length > 0;
    const hasCapabilities = ctx.capabilities?.length > 0;
    const hasGaps = ctx.gapInsights?.length > 0;
    const hasRecs = ctx.topRecommendations?.length > 0;
    
    console.log('✅ Has business objectives:', hasBusinessContext ? 'YES' : '❌ NO');
    console.log('✅ Has capabilities:', hasCapabilities ? 'YES' : '❌ NO');
    console.log('✅ Has gap insights:', hasGaps ? 'YES' : '❌ NO');
    console.log('✅ Has recommendations:', hasRecs ? 'YES' : '❌ NO');
    
    const contextScore = [hasBusinessContext, hasCapabilities, hasGaps, hasRecs].filter(Boolean).length;
    console.log('\n%cCONTEXT COMPLETENESS: ' + contextScore + '/4', 
      contextScore >= 3 ? 'color: #51cf66; font-size: 14px; font-weight: bold;' 
                        : 'color: #ff6b6b; font-size: 14px; font-weight: bold;');
    
    if (contextScore < 3) {
      console.warn('%c⚠️ INSUFFICIENT CONTEXT - Step 3 may produce generic results', 
        'color: #ff6b6b; font-size: 12px; font-weight: bold;');
      console.warn('Recommendation: Re-run Steps 1 and 2 to ensure data is properly captured.');
    }
    console.groupEnd();
    
    // ── Full Context Object ───────────────────────────────────────────────
    console.group('%c🔧 RAW CONTEXT OBJECT (Click to expand)', 'color: #a8dadc;');
    console.log(ctx);
    console.groupEnd();
    
    console.groupEnd();
    
    return ctx;
  },
  
  /**
   * Simulate the user prompt that would be sent to AI for Task 3.2
   */
  simulatePrompt() {
    console.group('%c🤖 SIMULATED AI PROMPT FOR TASK 3.2', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
    
    const model = window.model || {};
    const ctx = StepContext.build('step3', model);
    
    // Get the userPrompt function from Step3 task 3.2
    const task32 = Step3.tasks.find(t => t.taskId === 'step3_target_arch');
    if (!task32) {
      console.error('❌ Task 3.2 not found');
      console.groupEnd();
      return;
    }
    
    const userPrompt = task32.userPrompt(ctx);
    
    console.log('%cUSER PROMPT LENGTH:', 'font-weight: bold;', userPrompt.length, 'characters');
    console.log('%cCONTENT:', 'font-weight: bold;');
    console.log(userPrompt);
    
    console.groupEnd();
    
    return userPrompt;
  },
  
  /**
   * Check if instruction file is loading correctly
   */
  async checkInstructionFile() {
    console.group('%c📄 INSTRUCTION FILE CHECK', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
    
    const task32 = Step3.tasks.find(t => t.taskId === 'step3_target_arch');
    if (!task32) {
      console.error('❌ Task 3.2 not found');
      console.groupEnd();
      return;
    }
    
    console.log('Instruction file:', task32.instructionFile);
    console.log('Full path:', `js/Instructions/step3/${task32.instructionFile}`);
    
    try {
      const systemPrompt = await PromptBuilder.load('step3', task32.instructionFile, task32.systemPromptFallback);
      
      console.log('\n%c✅ INSTRUCTION FILE LOADED', 'color: #51cf66; font-weight: bold;');
      console.log('Prompt length:', systemPrompt.length, 'characters');
      console.log('Using fallback?', systemPrompt === task32.systemPromptFallback ? 'YES ⚠️' : 'NO ✅');
      
      console.log('\n%cSYSTEM PROMPT PREVIEW (first 500 chars):', 'font-weight: bold;');
      console.log(systemPrompt.slice(0, 500) + '...');
      
    } catch (err) {
      console.error('❌ FAILED TO LOAD INSTRUCTION FILE:', err);
    }
    
    console.groupEnd();
  },
  
  /**
   * Run all diagnostics
   */
  async runAll() {
    this.inspectContext();
    console.log('\n');
    this.simulatePrompt();
    console.log('\n');
    await this.checkInstructionFile();
    console.log('\n');
    console.log('%c🎯 DIAGNOSTICS COMPLETE', 'color: #51cf66; font-size: 18px; font-weight: bold;');
    console.log('Review the output above to identify why Step 3 might produce generic results.');
  },
  
  /**
   * Force unlock navigation items (emergency fix)
   */
  forceUnlockNavigation() {
    console.group('%c🔓 FORCE UNLOCK NAVIGATION', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
    
    // Ensure Step 2 completion flags are set
    if (window.model.capabilities?.length > 0) {
      window.model.capabilityValidated = true;
      
      if (!window.model.steps) window.model.steps = {};
      if (!window.model.steps.step2) window.model.steps.step2 = {};
      window.model.steps.step2.status = 'completed';
      
      console.log('✅ Set Step 2 as completed with capabilityValidated=true');
    }
    
    // Update UI
    if (typeof updateWorkflowStepStates === 'function') {
      updateWorkflowStepStates();
      console.log('✅ Updated workflow states');
    }
    
    if (typeof updateNavigationLockStates === 'function') {
      updateNavigationLockStates();
      console.log('✅ Updated navigation lock states');
    }
    
    // Save
    if (typeof autoSaveCurrentModel === 'function') {
      autoSaveCurrentModel();
      console.log('✅ Saved model');
    }
    
    console.log('\n%c🎯 Navigation should now be unlocked!', 'color: #51cf66; font-size: 14px; font-weight: bold;');
    console.log('Try clicking on Capability Map or Architecture Layers in the sidebar.');
    
    console.groupEnd();
  }
  
};

// Expose to global scope for console access
window.Step3Debug = Step3Debug;

// Auto-run on load if query param ?debug=step3
if (window.location.search.includes('debug=step3')) {
  window.addEventListener('load', () => {
    setTimeout(() => Step3Debug.runAll(), 1000);
  });
}
