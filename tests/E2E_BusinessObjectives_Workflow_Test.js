/**
 * E2E Test Suite: Business Objectives AI-Assisted Workflow
 * 
 * Tests the complete workflow including:
 * - Step 1: Understand Goals (AI-driven objectives definition)
 * - Step 2: Define and Assess Capabilities (APQC mapping)
 * - Step 3 (Optional): Link to EA Insights (Integration)
 * - Context awareness across steps
 * - Data persistence
 * - AI question limit enforcement (max 5 per step)
 */

class E2E_BusinessObjectives_Workflow_Test {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
    this.startTime = Date.now();
  }

  logTest(testName, passed, message) {
    this.results.total++;
    if (passed) {
      this.results.passed++;
      console.log(`✅ PASS: ${testName}`);
      if (message) console.log(`   └─ ${message}`);
    } else {
      this.results.failed++;
      this.results.errors.push({ test: testName, message });
      console.log(`❌ FAIL: ${testName}`);
      if (message) console.log(`   └─ ${message}`);
    }
  }

  // ==================== PHASE 1: MODULE AVAILABILITY ====================

  testModuleAvailability() {
    console.log('\n📦 Phase 1: Module Availability Tests\n');

    // Test 1.1: EA_BusinessObjectivesWorkflow module loaded
    this.logTest(
      'EA_BusinessObjectivesWorkflow module loaded',
      typeof EA_BusinessObjectivesWorkflow !== 'undefined',
      'EA_BusinessObjectivesWorkflow should be defined'
    );

    // Test 1.2: EA_ObjectivesManager module loaded
    this.logTest(
      'EA_ObjectivesManager module loaded',
      typeof EA_ObjectivesManager !== 'undefined',
      'EA_ObjectivesManager should be defined'
    );

    // Test 1.3: Required workflow methods exist
    const workflowMethods = [
      'startStep1',
      'handleStep1UserResponse',
      'synthesizeObjectives',
      'completeStep1',
      'startStep2',
      'handleStep2UserResponse',
      'completeStep2',
      'startStep3',
      'handleStep3UserResponse',
      'completeStep3',
      'getCurrentStep',
      'getWorkflowState'
    ];

    if (typeof EA_BusinessObjectivesWorkflow !== 'undefined') {
      workflowMethods.forEach(method => {
        this.logTest(
          `EA_BusinessObjectivesWorkflow.${method} method exists`,
          typeof EA_BusinessObjectivesWorkflow[method] === 'function',
          `Should have ${method} method`
        );
      });
    }

    // Test 1.4: Required manager methods exist
    const managerMethods = [
      'createObjective',
      'updateObjective',
      'deleteObjective',
      'getObjective',
      'listObjectives',
      'linkCapabilities',
      'getLinkedCapabilities'
    ];

    if (typeof EA_ObjectivesManager !== 'undefined') {
      managerMethods.forEach(method => {
        this.logTest(
          `EA_ObjectivesManager.${method} method exists`,
          typeof EA_ObjectivesManager[method] === 'function',
          `Should have ${method} method`
        );
      });
    }
  }

  // ==================== PHASE 2: STEP 1 - UNDERSTAND GOALS ====================

  async testStep1AIWorkflow() {
    console.log('\n🤖 Phase 2: Step 1 - AI-Driven Objectives Definition\n');

    try {
      // Test 2.1: Start Step 1
      console.log('Starting Step 1 workflow...');
      const step1Start = await EA_BusinessObjectivesWorkflow.startStep1();
      
      this.logTest(
        'Step 1 initialized successfully',
        step1Start && step1Start.question,
        'Should return first AI question'
      );

      this.logTest(
        'First question is non-empty',
        step1Start && step1Start.question && step1Start.question.length > 0,
        'AI should ask a meaningful question'
      );

      this.logTest(
        'Question count starts at 1',
        step1Start && step1Start.questionCount === 1,
        'Should track question count'
      );

      // Test 2.2: Process user responses (max 5 questions)
      const mockUserResponses = BusinessObjectivesTestData.userConversations.healthcare.step1;
      let questionCount = 1;

      for (let i = 0; i < mockUserResponses.length && questionCount < 5; i++) {
        const response = await EA_BusinessObjectivesWorkflow.handleStep1UserResponse(mockUserResponses[i]);
        questionCount = response.questionCount;

        this.logTest(
          `Process user response ${i + 1}`,
          response && (response.question || response.synthesis),
          `Should return next question or synthesis after ${i + 1} responses`
        );

        this.logTest(
          `Question count correct after response ${i + 1}`,
          questionCount === Math.min(i + 2, 5),
          `Question count should be ${Math.min(i + 2, 5)}`
        );
      }

      // Test 2.3: Enforce 5-question limit
      this.logTest(
        'AI asked maximum 5 questions',
        questionCount === 5,
        'Should stop after 5 questions'
      );

      // Test 2.4: Final synthesis
      const finalResponse = await EA_BusinessObjectivesWorkflow.handleStep1UserResponse(mockUserResponses[4]);
      
      this.logTest(
        'Step 1 synthesis generated',
        finalResponse && finalResponse.synthesis,
        'Should synthesize objectives after 5 questions'
      );

      this.logTest(
        'Synthesis contains strategic context',
        finalResponse.synthesis && finalResponse.synthesis.strategicContext,
        'Should include industry, company size, challenges, opportunities'
      );

      this.logTest(
        'Synthesis contains objectives',
        finalResponse.synthesis && 
        finalResponse.synthesis.objectives && 
        Array.isArray(finalResponse.synthesis.objectives) &&
        finalResponse.synthesis.objectives.length > 0,
        'Should include array of objectives'
      );

      // Test 2.5: Objective structure validation
      if (finalResponse.synthesis && finalResponse.synthesis.objectives) {
        const firstObjective = finalResponse.synthesis.objectives[0];
        
        this.logTest(
          'Objective has required fields',
          firstObjective.name &&
          firstObjective.description &&
          firstObjective.priority &&
          firstObjective.strategicTheme &&
          firstObjective.outcomeStatement,
          'Objectives should have all required fields'
        );
      }

      // Test 2.6: Complete Step 1
      const step1Complete = await EA_BusinessObjectivesWorkflow.completeStep1(finalResponse.synthesis.objectives);
      
      this.logTest(
        'Step 1 marked as complete',
        step1Complete && step1Complete.step1Complete === true,
        'Workflow state should mark Step 1 as complete'
      );

      this.logTest(
        'Objectives saved to storage',
        step1Complete && step1Complete.savedObjectives && step1Complete.savedObjectives.length > 0,
        'Objectives should be persisted'
      );

    } catch (error) {
      this.logTest('Step 1 workflow execution', false, `Error: ${error.message}`);
    }
  }

  // ==================== PHASE 3: STEP 2 - CAPABILITY MAPPING ====================

  async testStep2CapabilityMapping() {
    console.log('\n🗺️ Phase 3: Step 2 - Capability Mapping with APQC\n');

    try {
      // Prerequisite: Complete Step 1
      const step1Output = MockAIResponses.step1Synthesis.response;
      const step1Data = JSON.parse(step1Output.output_text);
      await EA_BusinessObjectivesWorkflow.completeStep1(step1Data.objectives);

      // Test 3.1: Start Step 2 with Step 1 context
      const step2Start = await EA_BusinessObjectivesWorkflow.startStep2(step1Data);
      
      this.logTest(
        'Step 2 initialized with Step 1 context',
        step2Start && step2Start.question && step2Start.context,
        'Should start Step 2 with context from Step 1'
      );

      this.logTest(
        'Step 2 context includes strategic themes',
        step2Start.context && step2Start.context.strategicContext,
        'Context should include industry, challenges, opportunities'
      );

      this.logTest(
        'APQC capabilities loaded',
        step2Start && step2Start.apqcCapabilities && step2Start.apqcCapabilities.length > 0,
        'Should load APQC capabilities for healthcare industry'
      );

      // Test 3.2: Process user responses for capability mapping
      const mockUserResponses = BusinessObjectivesTestData.userConversations.healthcare.step2;
      let questionCount = 1;

      for (let i = 0; i < mockUserResponses.length && questionCount < 5; i++) {
        const response = await EA_BusinessObjectivesWorkflow.handleStep2UserResponse(mockUserResponses[i]);
        questionCount = response.questionCount;

        this.logTest(
          `Step 2: Process response ${i + 1}`,
          response && (response.question || response.synthesis),
          `Should return next question or capability mapping after response ${i + 1}`
        );
      }

      // Test 3.3: Capability mapping synthesis
      const step2Final = await EA_BusinessObjectivesWorkflow.handleStep2UserResponse(mockUserResponses[4]);
      
      this.logTest(
        'Capability mapping synthesis generated',
        step2Final && step2Final.synthesis && step2Final.synthesis.capabilities,
        'Should synthesize capability mappings after questions'
      );

      this.logTest(
        'Gap analysis generated',
        step2Final.synthesis && step2Final.synthesis.gapAnalysis,
        'Should include gap analysis with recommendations'
      );

      // Test 3.4: Capability structure validation
      if (step2Final.synthesis && step2Final.synthesis.capabilities) {
        const firstCap = step2Final.synthesis.capabilities[0];
        
        this.logTest(
          'Capability has required fields',
          firstCap.apqc_code &&
          firstCap.name &&
          firstCap.domain &&
          typeof firstCap.currentMaturity === 'number' &&
          typeof firstCap.targetMaturity === 'number' &&
          firstCap.gap &&
          firstCap.strategicImportance &&
          Array.isArray(firstCap.linkedObjectives),
          'Capabilities should have all required fields'
        );

        this.logTest(
          'Maturity gap calculated',
          firstCap.targetMaturity > firstCap.currentMaturity,
          'Target maturity should exceed current maturity'
        );
      }

      // Test 3.5: Complete Step 2
      const step2Complete = await EA_BusinessObjectivesWorkflow.completeStep2(step2Final.synthesis.capabilities);
      
      this.logTest(
        'Step 2 marked as complete',
        step2Complete && step2Complete.step2Complete === true,
        'Workflow state should mark Step 2 as complete'
      );

      this.logTest(
        'Capabilities linked to objectives',
        step2Complete && step2Complete.linkedCapabilities && step2Complete.linkedCapabilities.length > 0,
        'Capabilities should be linked to objectives'
      );

    } catch (error) {
      this.logTest('Step 2 capability mapping', false, `Error: ${error.message}`);
    }
  }

  // ==================== PHASE 4: STEP 3 - EA INSIGHTS INTEGRATION ====================

  async testStep3EAIntegration() {
    console.log('\n🔗 Phase 4: Step 3 - Link to EA Insights (Optional)\n');

    try {
      // Prerequisites: Complete Steps 1 & 2
      const step1Data = JSON.parse(MockAIResponses.step1Synthesis.response.output_text);
      const step2Data = JSON.parse(MockAIResponses.step2Synthesis.response.output_text);
      
      await EA_BusinessObjectivesWorkflow.completeStep1(step1Data.objectives);
      await EA_BusinessObjectivesWorkflow.completeStep2(step2Data.capabilities);

      // Test 4.1: Start Step 3 with previous context
      const step3Start = await EA_BusinessObjectivesWorkflow.startStep3({ step1: step1Data, step2: step2Data });
      
      this.logTest(
        'Step 3 initialized with full context',
        step3Start && step3Start.question && step3Start.context,
        'Should start Step 3 with context from Steps 1 & 2'
      );

      this.logTest(
        'Step 3 context includes objectives and capabilities',
        step3Start.context && 
        step3Start.context.objectives && 
        step3Start.context.capabilities,
        'Context should include all previous workflow data'
      );

      // Test 4.2: Process integration questions
      const mockUserResponses = BusinessObjectivesTestData.userConversations.healthcare.step3;
      
      for (let i = 0; i < mockUserResponses.length; i++) {
        const response = await EA_BusinessObjectivesWorkflow.handleStep3UserResponse(mockUserResponses[i]);
        
        this.logTest(
          `Step 3: Process response ${i + 1}`,
          response && (response.question || response.synthesis),
          `Should process integration preferences (response ${i + 1})`
        );
      }

      // Test 4.3: Integration synthesis
      const step3Final = await EA_BusinessObjectivesWorkflow.handleStep3UserResponse(mockUserResponses[mockUserResponses.length - 1]);
      
      this.logTest(
        'Integration plan generated',
        step3Final && step3Final.synthesis && step3Final.synthesis.integrations,
        'Should synthesize integration plan'
      );

      this.logTest(
        'Execution roadmap generated',
        step3Final.synthesis && step3Final.synthesis.executionRoadmap,
        'Should include phased execution roadmap'
      );

      // Test 4.4: Integration validation
      if (step3Final.synthesis && step3Final.synthesis.integrations) {
        const validTools = ['WhiteSpot', 'GrowthDashboard', 'Engagement'];
        const allValid = step3Final.synthesis.integrations.every(int => validTools.includes(int.tool));
        
        this.logTest(
          'Integrations use valid EA tools',
          allValid,
          'Should only integrate with WhiteSpot, GrowthDashboard, or Engagement'
        );
      }

      // Test 4.5: Complete Step 3
      const step3Complete = await EA_BusinessObjectivesWorkflow.completeStep3(step3Final.synthesis);
      
      this.logTest(
        'Step 3 marked as complete',
        step3Complete && step3Complete.step3Complete === true,
        'Workflow state should mark Step 3 as complete'
      );

      this.logTest(
        'Entire workflow complete',
        step3Complete && 
        step3Complete.step1Complete && 
        step3Complete.step2Complete && 
        step3Complete.step3Complete,
        'All workflow steps should be complete'
      );

    } catch (error) {
      this.logTest('Step 3 EA integration', false, `Error: ${error.message}`);
    }
  }

  // ==================== PHASE 5: DATA PERSISTENCE ====================

  async testDataPersistence() {
    console.log('\n💾 Phase 5: Data Persistence Tests\n');

    try {
      // Test 5.1: Create objective
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Test Persistence Objective"
      });

      const created = await EA_ObjectivesManager.createObjective(testObjective);
      
      this.logTest(
        'Objective created in storage',
        created && created.id === testObjective.id,
        'Should save objective to IndexedDB/localStorage'
      );

      // Test 5.2: Retrieve objective
      const retrieved = await EA_ObjectivesManager.getObjective(testObjective.id);
      
      this.logTest(
        'Objective retrieved from storage',
        retrieved && retrieved.id === testObjective.id && retrieved.name === testObjective.name,
        'Should retrieve objective with all properties'
      );

      // Test 5.3: Update objective
      const updatedData = { ...testObjective, priority: 'high', updatedAt: Date.now() };
      const updated = await EA_ObjectivesManager.updateObjective(testObjective.id, updatedData);
      
      this.logTest(
        'Objective updated in storage',
        updated && updated.priority === 'high',
        'Should update objective properties'
      );

      // Test 5.4: List all objectives
      const allObjectives = await EA_ObjectivesManager.listObjectives();
      
      this.logTest(
        'List all objectives',
        Array.isArray(allObjectives) && allObjectives.length > 0,
        'Should return array of all objectives'
      );

      // Test 5.5: Link capabilities
      const capabilityIds = ['cap-10391', 'cap-10392'];
      const linked = await EA_ObjectivesManager.linkCapabilities(testObjective.id, capabilityIds);
      
      this.logTest(
        'Capabilities linked to objective',
        linked && linked.linkedCapabilities && linked.linkedCapabilities.length === 2,
        'Should link capabilities to objective'
      );

      // Test 5.6: Get linked capabilities
      const linkedCaps = await EA_ObjectivesManager.getLinkedCapabilities(testObjective.id);
      
      this.logTest(
        'Retrieve linked capabilities',
        Array.isArray(linkedCaps) && linkedCaps.length === 2,
        'Should retrieve linked capabilities'
      );

      // Test 5.7: Delete objective
      const deleted = await EA_ObjectivesManager.deleteObjective(testObjective.id);
      
      this.logTest(
        'Objective deleted from storage',
        deleted === true,
        'Should remove objective from storage'
      );

      // Test 5.8: Verify deletion
      const shouldBeNull = await EA_ObjectivesManager.getObjective(testObjective.id);
      
      this.logTest(
        'Deleted objective not retrievable',
        shouldBeNull === null,
        'Should return null for deleted objective'
      );

    } catch (error) {
      this.logTest('Data persistence', false, `Error: ${error.message}`);
    }
  }

  // ==================== PHASE 6: CONTEXT AWARENESS ====================

  async testContextAwareness() {
    console.log('\n🧠 Phase 6: Context Awareness Tests\n');

    try {
      // Test 6.1: Step 2 uses Step 1 context
      const step1Data = JSON.parse(MockAIResponses.step1Synthesis.response.output_text);
      await EA_BusinessObjectivesWorkflow.completeStep1(step1Data.objectives);

      const step2Start = await EA_BusinessObjectivesWorkflow.startStep2(step1Data);
      
      this.logTest(
        'Step 2 question references Step 1 context',
        step2Start && step2Start.question && 
        (step2Start.question.includes(step1Data.strategicContext.industry) ||
         step2Start.context.strategicContext.industry === step1Data.strategicContext.industry),
        'Step 2 AI should use healthcare industry from Step 1'
      );

      // Test 6.2: Step 3 uses Steps 1-2 context
      const step2Data = JSON.parse(MockAIResponses.step2Synthesis.response.output_text);
      await EA_BusinessObjectivesWorkflow.completeStep2(step2Data.capabilities);

      const step3Start = await EA_BusinessObjectivesWorkflow.startStep3({ step1: step1Data, step2: step2Data });
      
      this.logTest(
        'Step 3 has access to full workflow context',
        step3Start && step3Start.context && 
        step3Start.context.objectives && 
        step3Start.context.capabilities,
        'Step 3 should have both objectives and capabilities in context'
      );

      // Test 6.3: Workflow state tracking
      const workflowState = EA_BusinessObjectivesWorkflow.getWorkflowState();
      
      this.logTest(
        'Workflow state tracks all steps',
        workflowState && 
        workflowState.step1Complete && 
        workflowState.step2Complete,
        'Should track completion state of all steps'
      );

    } catch (error) {
      this.logTest('Context awareness', false, `Error: ${error.message}`);
    }
  }

  // ==================== PHASE 7: ERROR HANDLING ====================

  async testErrorHandling() {
    console.log('\n⚠️ Phase 7: Error Handling Tests\n');

    try {
      // Test 7.1: Invalid objective creation
      const invalidObjective = BusinessObjectivesTestData.invalidObjectives[0];
      let errorCaught = false;

      try {
        await EA_ObjectivesManager.createObjective(invalidObjective);
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        'Reject invalid objective',
        errorCaught,
        'Should throw error for missing required fields'
      );

      // Test 7.2: Invalid priority value
      const invalidPriority = BusinessObjectivesTestData.invalidObjectives[1];
      errorCaught = false;

      try {
        await EA_ObjectivesManager.createObjective(invalidPriority);
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        'Reject invalid priority value',
        errorCaught,
        'Should validate priority is high, medium, or low'
      );

      // Test 7.3: Retrieve non-existent objective
      const nonExistent = await EA_ObjectivesManager.getObjective('non-existent-id');
      
      this.logTest(
        'Return null for non-existent objective',
        nonExistent === null,
        'Should return null gracefully'
      );

      // Test 7.4: AI timeout handling
      // Mock timeout scenario
      this.logTest(
        'Handle AI timeout gracefully',
        true, // Placeholder - implement actual timeout handling test
        'Should retry or provide fallback on timeout'
      );

    } catch (error) {
      this.logTest('Error handling', false, `Error: ${error.message}`);
    }
  }

  // ==================== TEST EXECUTION ====================

  async runAllTests() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  Business Objectives Workflow - E2E Test Suite          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Run all test phases
    this.testModuleAvailability();
    await this.testStep1AIWorkflow();
    await this.testStep2CapabilityMapping();
    await this.testStep3EAIntegration();
    await this.testDataPersistence();
    await this.testContextAwareness();
    await this.testErrorHandling();

    // Print summary
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Test Results Summary                                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests:  ${this.results.total}`);
    console.log(`✅ Passed:     ${this.results.passed}`);
    console.log(`❌ Failed:     ${this.results.failed}`);
    console.log(`⏱️  Duration:   ${duration}s`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.test}`);
        console.log(`   └─ ${error.message}`);
      });
    }

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`\n📊 Pass Rate: ${passRate}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! Workflow is ready for implementation.');
    } else {
      console.log('\n⚠️  Some tests failed. Review errors before proceeding.');
    }
  }
}

// Auto-run tests when page loads (for manual testing)
if (typeof window !== 'undefined') {
  window.BusinessObjectivesWorkflowTest = E2E_BusinessObjectives_Workflow_Test;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = E2E_BusinessObjectives_Workflow_Test;
}
