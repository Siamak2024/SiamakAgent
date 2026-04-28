/**
 * Standard Mode Integration - StepEngineService
 * =============================================
 * Clean integration of Mode1 (StandardStrategy) with the UI.
 * Step-by-step questionnaire with user validation at each step.
 * 
 * @version 2.0
 * @date 2026-04-27
 */

// ============================================================================
// STANDARD MODE INITIALIZATION
// ============================================================================

/**
 * Start Standard Mode - Entry point when user clicks "Start Standard" button
 */
async function startStandardMode() {
  // Configure StepEngine with StandardStrategy
  if (!window.StandardStrategy) {
    addAssistantMessage('❌ **Error:** StandardStrategy not loaded. Please refresh the page.');
    return;
  }
  
  const standardStrategy = new StandardStrategy();
  StepEngine.configure(standardStrategy);
  
  // Show welcome message
  const welcomeMsg = `## 📋 Standard Mode - Step-by-Step EA Workflow

**Standard mode** guides you through a structured 4-step Enterprise Architecture workflow with interactive questionnaires and validation at each step.

**Workflow:**
1. 🎯 **Business Objectives** - Define strategic goals and outcomes
2. 🗃️ **Capability Mapping** - Map business capabilities
3. 🏗️ **Capability Architecture** - Detail capability architecture
4. ⚙️ **Operating Model** - Design target operating model

**Let's begin with Step 1!**

<button class="mode-action-btn mode-action-btn--primary" onclick="startStep1Standard()">
  <i class="fas fa-play-circle"></i>
  Start Step 1 - Business Objectives
</button>`;

  addAssistantMessage(welcomeMsg, { mode: 'standard', offersAction: true });
  scrollToBottom();
}

/**
 * Start Step 1 in Standard Mode
 */
async function startStep1Standard() {
  addAssistantMessage(`🎯 **Starting Step 1: Business Objectives**

I'll ask you a series of questions to understand your strategic context...`, { mode: 'standard' });
  
  showTypingIndicator();
  
  try {
    // Use StandardStrategy to execute step1
    // This will show QuestionCard UI for interactive Q&A
    await StepEngine.run('step1', {}, window.model);
    
    hideTypingIndicator();
    
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error starting Step 1:** ${error.message}

Please try again or contact support.`, { mode: 'standard', error: true });
    console.error('[Standard Mode] Step 1 failed:', error);
  }
}

/**
 * Start Step 2 in Standard Mode
 */
async function startStep2Standard() {
  // Validate Step 1 is complete
  if (!window.model.businessContext && !window.model.strategicIntent) {
    addAssistantMessage(`⚠️ **Step 1 not complete.** Please complete Step 1 first before continuing to Step 2.`, { mode: 'standard' });
    return;
  }
  
  addAssistantMessage(`🗃️ **Starting Step 2: Capability Mapping**

Loading APQC framework and analyzing your business objectives...`, { mode: 'standard' });
  
  showTypingIndicator();
  
  try {
    await StepEngine.run('step2', {}, window.model);
    hideTypingIndicator();
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error in Step 2:** ${error.message}`, { mode: 'standard', error: true });
    console.error('[Standard Mode] Step 2 failed:', error);
  }
}

/**
 * Start Step 3 in Standard Mode
 */
async function startStep3Standard() {
  // Validate Step 2 is complete
  if (!window.model.capabilities || window.model.capabilities.length === 0) {
    addAssistantMessage(`⚠️ **Step 2 not complete.** Please complete Step 2 first.`, { mode: 'standard' });
    return;
  }
  
  addAssistantMessage(`🏗️ **Starting Step 3: Capability Architecture**

Analyzing capabilities and building detailed architecture...`, { mode: 'standard' });
  
  showTypingIndicator();
  
  try {
    await StepEngine.run('step3', {}, window.model);
    hideTypingIndicator();
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error in Step 3:** ${error.message}`, { mode: 'standard', error: true });
    console.error('[Standard Mode] Step 3 failed:', error);
  }
}

/**
 * Start Step 4 in Standard Mode
 */
async function startStep4Standard() {
  // Validate Step 3 is complete
  if (!window.model.archBenchmark) {
    addAssistantMessage(`⚠️ **Step 3 not complete.** Please complete Step 3 first.`, { mode: 'standard' });
    return;
  }
  
  addAssistantMessage(`⚙️ **Starting Step 4: Operating Model**

Designing target operating model...`, { mode: 'standard' });
  
  showTypingIndicator();
  
  try {
    await StepEngine.run('step4', {}, window.model);
    hideTypingIndicator();
    
    addAssistantMessage(`🎉 **Standard Workflow Complete!**

All 4 steps finished. View your results:

<button class="mode-action-btn mode-action-btn--primary" onclick="showTab('exec')">
  <i class="fas fa-chart-line"></i>
  Executive Dashboard
</button>
<button class="mode-action-btn mode-action-btn--action" onclick="showTab('home')">
  <i class="fas fa-home"></i>
  Enterprise Dashboard
</button>`, { mode: 'standard' });
    
    // Update workflow progress
    if (typeof updateWorkflowProgress === 'function') {
      updateWorkflowProgress([1, 2, 3, 4]);
    }
    
    toast('✅ Standard workflow complete!');
    
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error in Step 4:** ${error.message}`, { mode: 'standard', error: true });
    console.error('[Standard Mode] Step 4 failed:', error);
  }
}

// ============================================================================
// EXPORT FOR BROWSER
// ============================================================================

if (typeof window !== 'undefined') {
  window.startStandardMode = startStandardMode;
  window.startStep1Standard = startStep1Standard;
  window.startStep2Standard = startStep2Standard;
  window.startStep3Standard = startStep3Standard;
  window.startStep4Standard = startStep4Standard;
}
