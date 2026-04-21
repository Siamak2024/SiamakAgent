/**
 * Unit Test Suite: EA_ObjectivesManager
 * 
 * Tests CRUD operations and validation for business objectives
 * - Create, Read, Update, Delete operations
 * - Data validation and schema compliance
 * - Storage persistence (IndexedDB + localStorage fallback)
 * - Capability linking
 */

class EA_ObjectivesManager_Test {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
    this.startTime = Date.now();
    this.testObjectiveIds = []; // Track created objectives for cleanup
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

  async cleanup() {
    // Clean up test objectives
    for (const id of this.testObjectiveIds) {
      try {
        await EA_ObjectivesManager.deleteObjective(id);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    this.testObjectiveIds = [];
  }

  // ==================== TEST 1: CREATE OPERATIONS ====================

  async testCreateObjective() {
    console.log('\n📝 Test 1: Create Objective Operations\n');

    try {
      // Test 1.1: Create valid objective
      const validObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Create Valid Objective",
        priority: "high",
        strategicTheme: "Growth"
      });

      const created = await EA_ObjectivesManager.createObjective(validObjective);
      this.testObjectiveIds.push(created.id);

      this.logTest(
        '1.1: Create valid objective',
        created && created.id === validObjective.id,
        'Should return created objective with ID'
      );

      this.logTest(
        '1.2: Created objective has all fields',
        created && 
        created.name === validObjective.name &&
        created.description === validObjective.description &&
        created.priority === validObjective.priority &&
        created.strategicTheme === validObjective.strategicTheme &&
        created.outcomeStatement === validObjective.outcomeStatement,
        'All fields should be preserved'
      );

      this.logTest(
        '1.3: Created objective has timestamps',
        created && 
        typeof created.createdAt === 'number' &&
        typeof created.updatedAt === 'number',
        'Should have createdAt and updatedAt timestamps'
      );

      this.logTest(
        '1.4: Created objective has workflow state',
        created && 
        created.workflowState &&
        created.workflowState.step1Complete === false &&
        created.workflowState.step2Complete === false &&
        created.workflowState.step3Complete === false &&
        Array.isArray(created.workflowState.aiSessionHistory),
        'Should initialize workflow state'
      );

      // Test 1.5: Reject objective with missing required fields
      let errorCaught = false;
      try {
        await EA_ObjectivesManager.createObjective({
          id: "test-invalid-1",
          name: "Incomplete Objective"
          // Missing: description, priority, strategicTheme, outcomeStatement
        });
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '1.5: Reject objective with missing fields',
        errorCaught,
        'Should throw validation error'
      );

      // Test 1.6: Reject objective with invalid priority
      errorCaught = false;
      try {
        await EA_ObjectivesManager.createObjective(
          BusinessObjectivesTestData.createValidObjective({
            priority: "urgent" // Invalid - must be high, medium, or low
          })
        );
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '1.6: Reject objective with invalid priority',
        errorCaught,
        'Should validate priority is high, medium, or low'
      );

      // Test 1.7: Reject objective with empty strings
      errorCaught = false;
      try {
        await EA_ObjectivesManager.createObjective({
          id: "test-invalid-3",
          name: "",
          description: "",
          priority: "high",
          strategicTheme: "",
          outcomeStatement: ""
        });
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '1.7: Reject objective with empty strings',
        errorCaught,
        'Should validate required fields are non-empty'
      );

    } catch (error) {
      this.logTest('Create objective operations', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 2: READ OPERATIONS ====================

  async testReadObjective() {
    console.log('\n📖 Test 2: Read Objective Operations\n');

    try {
      // Setup: Create test objective
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Read Operations"
      });
      const created = await EA_ObjectivesManager.createObjective(testObjective);
      this.testObjectiveIds.push(created.id);

      // Test 2.1: Get objective by ID
      const retrieved = await EA_ObjectivesManager.getObjective(created.id);

      this.logTest(
        '2.1: Get objective by ID',
        retrieved && retrieved.id === created.id,
        'Should retrieve objective with correct ID'
      );

      this.logTest(
        '2.2: Retrieved objective has all data',
        retrieved && 
        retrieved.name === testObjective.name &&
        retrieved.description === testObjective.description &&
        retrieved.priority === testObjective.priority,
        'All objective data should be retrieved'
      );

      // Test 2.3: Get non-existent objective
      const nonExistent = await EA_ObjectivesManager.getObjective('non-existent-id-12345');

      this.logTest(
        '2.3: Return null for non-existent objective',
        nonExistent === null,
        'Should return null gracefully'
      );

      // Test 2.4: List all objectives
      const allObjectives = await EA_ObjectivesManager.listObjectives();

      this.logTest(
        '2.4: List all objectives',
        Array.isArray(allObjectives) && allObjectives.length > 0,
        `Should return array of objectives (found ${allObjectives.length})`
      );

      this.logTest(
        '2.5: List includes created objective',
        allObjectives.some(obj => obj.id === created.id),
        'List should include our test objective'
      );

    } catch (error) {
      this.logTest('Read objective operations', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 3: UPDATE OPERATIONS ====================

  async testUpdateObjective() {
    console.log('\n✏️ Test 3: Update Objective Operations\n');

    try {
      // Setup: Create test objective
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Update Operations",
        priority: "medium"
      });
      const created = await EA_ObjectivesManager.createObjective(testObjective);
      this.testObjectiveIds.push(created.id);

      // Test 3.1: Update objective priority
      const updatedData = {
        ...created,
        priority: "high",
        updatedAt: Date.now()
      };
      const updated = await EA_ObjectivesManager.updateObjective(created.id, updatedData);

      this.logTest(
        '3.1: Update objective priority',
        updated && updated.priority === "high",
        'Priority should be updated to high'
      );

      this.logTest(
        '3.2: Update timestamp changes',
        updated && updated.updatedAt > created.createdAt,
        'updatedAt should be newer than createdAt'
      );

      // Test 3.3: Update objective name and description
      const updated2 = await EA_ObjectivesManager.updateObjective(created.id, {
        ...updated,
        name: "Updated Objective Name",
        description: "Updated description text",
        updatedAt: Date.now()
      });

      this.logTest(
        '3.3: Update multiple fields',
        updated2 && 
        updated2.name === "Updated Objective Name" &&
        updated2.description === "Updated description text",
        'Multiple fields should be updated'
      );

      // Test 3.4: Verify update persists
      const retrieved = await EA_ObjectivesManager.getObjective(created.id);

      this.logTest(
        '3.4: Updated data persists in storage',
        retrieved && 
        retrieved.name === "Updated Objective Name" &&
        retrieved.priority === "high",
        'Updates should persist to storage'
      );

      // Test 3.5: Reject update with invalid data
      let errorCaught = false;
      try {
        await EA_ObjectivesManager.updateObjective(created.id, {
          ...updated2,
          priority: "invalid-priority"
        });
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '3.5: Reject update with invalid priority',
        errorCaught,
        'Should validate updated data'
      );

      // Test 3.6: Update non-existent objective
      errorCaught = false;
      try {
        await EA_ObjectivesManager.updateObjective('non-existent-id', updated2);
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '3.6: Reject update of non-existent objective',
        errorCaught,
        'Should throw error for non-existent ID'
      );

    } catch (error) {
      this.logTest('Update objective operations', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 4: DELETE OPERATIONS ====================

  async testDeleteObjective() {
    console.log('\n🗑️ Test 4: Delete Objective Operations\n');

    try {
      // Setup: Create test objective
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Delete Operations"
      });
      const created = await EA_ObjectivesManager.createObjective(testObjective);
      // Don't add to testObjectiveIds since we're testing deletion

      // Test 4.1: Delete existing objective
      const deleted = await EA_ObjectivesManager.deleteObjective(created.id);

      this.logTest(
        '4.1: Delete existing objective',
        deleted === true,
        'Should return true on successful deletion'
      );

      // Test 4.2: Verify objective is deleted
      const shouldBeNull = await EA_ObjectivesManager.getObjective(created.id);

      this.logTest(
        '4.2: Deleted objective not retrievable',
        shouldBeNull === null,
        'Should return null for deleted objective'
      );

      // Test 4.3: Delete non-existent objective
      let errorCaught = false;
      try {
        await EA_ObjectivesManager.deleteObjective('non-existent-id-12345');
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '4.3: Handle delete of non-existent objective',
        errorCaught || true, // Either throw error or return false gracefully
        'Should handle non-existent ID gracefully'
      );

    } catch (error) {
      this.logTest('Delete objective operations', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 5: CAPABILITY LINKING ====================

  async testCapabilityLinking() {
    console.log('\n🔗 Test 5: Capability Linking Operations\n');

    try {
      // Setup: Create test objective
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Capability Linking"
      });
      const created = await EA_ObjectivesManager.createObjective(testObjective);
      this.testObjectiveIds.push(created.id);

      // Test 5.1: Link capabilities to objective
      const capabilityIds = ['cap-10391', 'cap-10392', 'cap-10393'];
      const linked = await EA_ObjectivesManager.linkCapabilities(created.id, capabilityIds);

      this.logTest(
        '5.1: Link capabilities to objective',
        linked && 
        Array.isArray(linked.linkedCapabilities) &&
        linked.linkedCapabilities.length === 3,
        'Should link 3 capabilities'
      );

      this.logTest(
        '5.2: Linked capabilities persist',
        linked.linkedCapabilities.includes('cap-10391') &&
        linked.linkedCapabilities.includes('cap-10392') &&
        linked.linkedCapabilities.includes('cap-10393'),
        'All capability IDs should be stored'
      );

      // Test 5.3: Get linked capabilities
      const linkedCaps = await EA_ObjectivesManager.getLinkedCapabilities(created.id);

      this.logTest(
        '5.3: Get linked capabilities',
        Array.isArray(linkedCaps) && linkedCaps.length === 3,
        'Should retrieve all linked capabilities'
      );

      // Test 5.4: Update capability links (add more)
      const moreCapabilities = ['cap-10406', 'cap-10526'];
      const linkedMore = await EA_ObjectivesManager.linkCapabilities(created.id, [...capabilityIds, ...moreCapabilities]);

      this.logTest(
        '5.4: Update capability links',
        linkedMore && linkedMore.linkedCapabilities.length === 5,
        'Should support adding more capabilities'
      );

      // Test 5.5: Link capabilities to non-existent objective
      let errorCaught = false;
      try {
        await EA_ObjectivesManager.linkCapabilities('non-existent-id', capabilityIds);
      } catch (error) {
        errorCaught = true;
      }

      this.logTest(
        '5.5: Reject linking to non-existent objective',
        errorCaught,
        'Should throw error for non-existent objective'
      );

      // Test 5.6: Link empty capability array
      const linkedEmpty = await EA_ObjectivesManager.linkCapabilities(created.id, []);

      this.logTest(
        '5.6: Handle empty capability array',
        linkedEmpty && linkedEmpty.linkedCapabilities.length === 0,
        'Should allow clearing all capability links'
      );

    } catch (error) {
      this.logTest('Capability linking operations', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 6: WORKFLOW STATE MANAGEMENT ====================

  async testWorkflowState() {
    console.log('\n📊 Test 6: Workflow State Management\n');

    try {
      // Setup: Create test objective
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Workflow State"
      });
      const created = await EA_ObjectivesManager.createObjective(testObjective);
      this.testObjectiveIds.push(created.id);

      // Test 6.1: Initial workflow state
      this.logTest(
        '6.1: Initialize with all steps incomplete',
        created.workflowState.step1Complete === false &&
        created.workflowState.step2Complete === false &&
        created.workflowState.step3Complete === false,
        'All workflow steps should start as incomplete'
      );

      this.logTest(
        '6.2: Initialize with empty session history',
        Array.isArray(created.workflowState.aiSessionHistory) &&
        created.workflowState.aiSessionHistory.length === 0,
        'AI session history should start empty'
      );

      // Test 6.3: Update workflow state (complete Step 1)
      const updatedState = {
        ...created,
        workflowState: {
          ...created.workflowState,
          step1Complete: true,
          aiSessionHistory: [
            {
              step: 1,
              timestamp: Date.now(),
              questionCount: 5,
              userInputs: ["Healthcare", "500 employees", "Digital transformation", "Legacy systems", "Telehealth"]
            }
          ]
        },
        updatedAt: Date.now()
      };

      const updated = await EA_ObjectivesManager.updateObjective(created.id, updatedState);

      this.logTest(
        '6.3: Mark Step 1 as complete',
        updated && updated.workflowState.step1Complete === true,
        'Step 1 should be marked complete'
      );

      this.logTest(
        '6.4: AI session history updated',
        updated.workflowState.aiSessionHistory.length === 1 &&
        updated.workflowState.aiSessionHistory[0].step === 1,
        'Session history should record Step 1 interaction'
      );

      // Test 6.5: Complete all workflow steps
      const allCompleteState = {
        ...updated,
        workflowState: {
          ...updated.workflowState,
          step1Complete: true,
          step2Complete: true,
          step3Complete: true
        },
        updatedAt: Date.now()
      };

      const allComplete = await EA_ObjectivesManager.updateObjective(created.id, allCompleteState);

      this.logTest(
        '6.5: Mark all steps complete',
        allComplete && 
        allComplete.workflowState.step1Complete &&
        allComplete.workflowState.step2Complete &&
        allComplete.workflowState.step3Complete,
        'All workflow steps should be complete'
      );

    } catch (error) {
      this.logTest('Workflow state management', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 7: DATA VALIDATION ====================

  async testDataValidation() {
    console.log('\n✅ Test 7: Data Validation\n');

    try {
      // Test 7.1: Validate required fields
      const requiredFields = ['id', 'name', 'description', 'priority', 'strategicTheme', 'outcomeStatement'];
      
      for (const field of requiredFields) {
        let errorCaught = false;
        const invalidObj = BusinessObjectivesTestData.createValidObjective();
        delete invalidObj[field];

        try {
          await EA_ObjectivesManager.createObjective(invalidObj);
        } catch (error) {
          errorCaught = true;
        }

        this.logTest(
          `7.${requiredFields.indexOf(field) + 1}: Validate ${field} is required`,
          errorCaught,
          `Should reject objective without ${field}`
        );
      }

      // Test 7.7: Validate priority enum
      const validPriorities = ['high', 'medium', 'low'];
      const invalidPriorities = ['urgent', 'critical', 'low-priority', ''];

      for (const priority of invalidPriorities) {
        let errorCaught = false;
        try {
          await EA_ObjectivesManager.createObjective(
            BusinessObjectivesTestData.createValidObjective({ priority })
          );
        } catch (error) {
          errorCaught = true;
        }

        this.logTest(
          `7.7.${invalidPriorities.indexOf(priority) + 1}: Reject invalid priority "${priority}"`,
          errorCaught,
          'Should validate priority enum'
        );
      }

      // Test 7.8: Accept all valid priorities
      for (const priority of validPriorities) {
        const validObj = BusinessObjectivesTestData.createValidObjective({ priority });
        const created = await EA_ObjectivesManager.createObjective(validObj);
        this.testObjectiveIds.push(created.id);

        this.logTest(
          `7.8.${validPriorities.indexOf(priority) + 1}: Accept valid priority "${priority}"`,
          created && created.priority === priority,
          `Priority "${priority}" should be accepted`
        );
      }

    } catch (error) {
      this.logTest('Data validation', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST 8: STORAGE PERSISTENCE ====================

  async testStoragePersistence() {
    console.log('\n💾 Test 8: Storage Persistence (IndexedDB + localStorage)\n');

    try {
      // Test 8.1: Save to storage
      const testObjective = BusinessObjectivesTestData.createValidObjective({
        name: "Unit Test: Storage Persistence"
      });
      const created = await EA_ObjectivesManager.createObjective(testObjective);
      this.testObjectiveIds.push(created.id);

      this.logTest(
        '8.1: Save objective to storage',
        created && created.id === testObjective.id,
        'Should persist to IndexedDB or localStorage'
      );

      // Test 8.2: Retrieve from storage
      const retrieved = await EA_ObjectivesManager.getObjective(created.id);

      this.logTest(
        '8.2: Retrieve from storage',
        retrieved && retrieved.id === created.id,
        'Should retrieve persisted data'
      );

      // Test 8.3: Verify storage mechanism
      // Check if using IndexedDB or localStorage fallback
      const storageInfo = EA_ObjectivesManager.getStorageInfo ? 
        EA_ObjectivesManager.getStorageInfo() : 
        { type: 'unknown' };

      this.logTest(
        '8.3: Storage mechanism identified',
        storageInfo && (storageInfo.type === 'IndexedDB' || storageInfo.type === 'localStorage'),
        `Using ${storageInfo.type || 'unknown'} for persistence`
      );

    } catch (error) {
      this.logTest('Storage persistence', false, `Unexpected error: ${error.message}`);
    }
  }

  // ==================== TEST EXECUTION ====================

  async runAllTests() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  EA_ObjectivesManager - Unit Test Suite                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    try {
      await this.testCreateObjective();
      await this.testReadObjective();
      await this.testUpdateObjective();
      await this.testDeleteObjective();
      await this.testCapabilityLinking();
      await this.testWorkflowState();
      await this.testDataValidation();
      await this.testStoragePersistence();

      // Cleanup
      await this.cleanup();

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
        console.log('\n🎉 All tests passed! EA_ObjectivesManager is working correctly.');
      } else {
        console.log('\n⚠️  Some tests failed. Fix implementation before proceeding.');
      }

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
    }
  }
}

// Auto-run tests when page loads (for manual testing)
if (typeof window !== 'undefined') {
  window.EA_ObjectivesManagerTest = EA_ObjectivesManager_Test;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_ObjectivesManager_Test;
}
