/**
 * Business Objectives Mode Integration - StepEngineService
 * =========================================================
 * Clean integration of Mode3 (BusinessObjectivesStrategy) with the UI.
 * Outcome-focused workflow with max 3 questions per step + enrichment.
 * 
 * @version 2.0
 * @date 2026-04-27
 */

// ============================================================================
// BUSINESS OBJECTIVES MODE INITIALIZATION
// ============================================================================

/**
 * Start Business Objectives Mode - Entry point when user clicks "Start BO" button
 */
async function startBusinessObjectivesMode() {
  // Configure StepEngine with BusinessObjectivesStrategy
  if (!window.BusinessObjectivesStrategy) {
    addAssistantMessage('❌ **Error:** BusinessObjectivesStrategy not loaded. Please refresh the page.');
    return;
  }
  
  const boStrategy = new BusinessObjectivesStrategy();
  StepEngine.configure(boStrategy);
  
  // Show welcome message
  const welcomeMsg = `## 🎯 Business Objectives Mode - Outcome-First Workflow

**Business Objectives mode** focuses on defining clear, measurable business outcomes FIRST, then maps everything back to those objectives.

**Streamlined Workflow:**
- ✅ Max 3 questions per step (skip non-essentials)
- ✅ Web search enrichment for market intelligence  
- ✅ Organization Profile data integration
- ✅ Objective-driven capability mapping
- ✅ Traceability from objectives to architecture

**Let's define your business objectives!**

<button class="mode-action-btn mode-action-btn--primary" onclick="startStep1BusinessObjectives()">
  <i class="fas fa-bullseye"></i>
  Start - Define Business Objectives
</button>`;

  addAssistantMessage(welcomeMsg, { mode: 'business-objectives', offersAction: true });
  scrollToBottom();
}

/**
 * Start Step 1 in Business Objectives Mode
 */
async function startStep1BusinessObjectives() {
  addAssistantMessage(`🎯 **Starting: Business Objectives Definition**

I'll ask you 3 focused questions about your strategic goals...`, { mode: 'business-objectives' });
  
  showTypingIndicator();
  
  try {
    // Use BusinessObjectivesStrategy to execute step1
    await StepEngine.run('step1', {}, window.model);
    
    hideTypingIndicator();
    
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error starting Business Objectives:** ${error.message}

Please try again or contact support.`, { mode: 'business-objectives', error: true });
    console.error('[BO Mode] Step 1 failed:', error);
  }
}

/**
 * Start Step 2 in Business Objectives Mode
 */
async function startStep2BusinessObjectives() {
  // Validate Step 1 is complete
  if (!window.model.businessObjectives || window.model.businessObjectives.length === 0) {
    addAssistantMessage(`⚠️ **Business Objectives not defined.** Please complete Step 1 first.`, { mode: 'business-objectives' });
    return;
  }
  
  addAssistantMessage(`🗃️ **Starting: Objective-Driven Capability Mapping**

Mapping capabilities to your business objectives...`, { mode: 'business-objectives' });
  
  showTypingIndicator();
  
  try {
    await StepEngine.run('step2', {}, window.model);
    hideTypingIndicator();
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error in Capability Mapping:** ${error.message}`, { mode: 'business-objectives', error: true });
    console.error('[BO Mode] Step 2 failed:', error);
  }
}

/**
 * Start Step 3 in Business Objectives Mode
 */
async function startStep3BusinessObjectives() {
  // Validate Step 2 is complete
  if (!window.model.capabilities || window.model.capabilities.length === 0) {
    addAssistantMessage(`⚠️ **Capabilities not mapped.** Please complete Step 2 first.`, { mode: 'business-objectives' });
    return;
  }
  
  addAssistantMessage(`🏗️ **Starting: Capability Architecture**

Building architecture view with objective traceability...`, { mode: 'business-objectives' });
  
  showTypingIndicator();
  
  try {
    await StepEngine.run('step3', {}, window.model);
    hideTypingIndicator();
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error in Architecture:** ${error.message}`, { mode: 'business-objectives', error: true });
    console.error('[BO Mode] Step 3 failed:', error);
  }
}

/**
 * Start Step 4 in Business Objectives Mode
 */
async function startStep4BusinessObjectives() {
  // Validate Step 3 is complete
  if (!window.model.archBenchmark) {
    addAssistantMessage(`⚠️ **Architecture not complete.** Please complete Step 3 first.`, { mode: 'business-objectives' });
    return;
  }
  
  addAssistantMessage(`⚙️ **Starting: Operating Model Design**

Designing operating model aligned with business objectives...`, { mode: 'business-objectives' });
  
  showTypingIndicator();
  
  try {
    await StepEngine.run('step4', {}, window.model);
    hideTypingIndicator();
    
    addAssistantMessage(`🎉 **Business Objectives Workflow Complete!**

All 4 steps finished with full objective traceability. View your results:

<button class="mode-action-btn mode-action-btn--primary" onclick="showTab('exec')">
  <i class="fas fa-chart-line"></i>
  Executive Dashboard
</button>
<button class="mode-action-btn mode-action-btn--action" onclick="showTab('home')">
  <i class="fas fa-home"></i>
  Enterprise Dashboard
</button>`, { mode: 'business-objectives' });
    
    // Update workflow progress
    if (typeof updateWorkflowProgress === 'function') {
      updateWorkflowProgress([1, 2, 3, 4]);
    }
    
    toast('✅ Business Objectives workflow complete!');
    
  } catch (error) {
    hideTypingIndicator();
    addAssistantMessage(`❌ **Error in Operating Model:** ${error.message}`, { mode: 'business-objectives', error: true });
    console.error('[BO Mode] Step 4 failed:', error);
  }
}

// ============================================================================
// EXPORT FOR BROWSER
// ============================================================================

if (typeof window !== 'undefined') {
  window.startBusinessObjectivesMode = startBusinessObjectivesMode;
  window.startStep1BusinessObjectives = startStep1BusinessObjectives;
  window.startStep2BusinessObjectives = startStep2BusinessObjectives;
  window.startStep3BusinessObjectives = startStep3BusinessObjectives;
  window.startStep4BusinessObjectives = startStep4BusinessObjectives;
}
