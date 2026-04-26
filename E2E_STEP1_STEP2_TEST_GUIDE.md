# E2E Test Guide: Step 1 → Step 2 (4-Step Workflow)

## Overview

Comprehensive end-to-end test suite for NextGenEA V12's new 4-step workflow, covering:
- **Step 1**: Business Objectives (Unified Instruction Approach)
- **Step 2**: APQC Capability Mapping (NEW)
  - Task 2.0: Load APQC Framework
  - Task 2.1: AI-Driven APQC Alignment
  - Task 2.2: Custom Validation UI

## Test Coverage

### 📦 Phase 1: Module Availability (18 tests)
- StepEngine, Step0, Step1, Step2, Step3, Step4 modules loaded
- EA_DataManager APQC integration methods (7 methods)
- Step2 task definitions (3 tasks)
- StepEngine workflow orchestration methods
- UI rendering functions

### 🔧 Phase 2: Initialization & Data Model (6 tests)
- Test model creation
- businessContext structure validation
- contextObj validation
- Workflow mode configuration

### 🎯 Phase 3: Step 1 - Business Objectives (4 tests)
- Step1 dependency check (should have none)
- Step1 completion flags
- businessContext enrichment
- Legacy flag compatibility

### 📚 Phase 4: Step 2.0 - Load APQC Framework (6 tests)
- APQC framework cache check (sessionStorage)
- EA_DataManager.loadAPQCFramework() execution
- Framework structure validation (version, L1/L2/L3 hierarchy)
- Framework storage in test model
- Business type filtering
- APQC metadata loading

### 🤖 Phase 5: Step 2.1 - AI Capability Mapping (8 tests)
- Capability map structure validation
- APQC-sourced capability validation (apqc_id, apqc_reference)
- Custom capability validation (custom_name)
- Objective mappings (capability ↔ business objective traceability)
- Maturity assessment (current, target, gap calculation)
- IT enablement mapping (apps, data, integrations, security)
- Strategic importance classification
- Capability map storage

### 🔍 Phase 6: Gap Insights & White-Spot Detection (7 tests)
- Gap insight generation (priority, timeframe, recommendations)
- Priority level validation (HIGH/MEDIUM/LOW)
- White-spot capability detection (MISSING/UNDER_INVESTED/EMERGING)
- White-spot structure validation
- Business impact analysis
- Gap/white-spot storage in model

### 🎨 Phase 7: Step 2.2 - Validation UI (9 tests)
- renderStep2ValidationUI function availability
- UI helper functions (renderCapabilityRow, expandAllCapabilities, etc.)
- UI render context preparation
- APQC summary data display
- Capability map table display
- Gap insights display
- White-spot capabilities display
- Export functionality

### 💾 Phase 8: Data Persistence & Completion (6 tests)
- Step 2 completion flag (capabilityValidated)
- completedSteps array update
- Legacy flag recognition (_checkLegacyFlag)
- Data model completeness (11 required fields)
- JSON serialization/deserialization
- Enrichment score update (60% after Step 2)

### 🔄 Phase 9: Backward Compatibility (4 tests)
- Legacy 7-step model creation
- Legacy step recognition (old BMC, capabilities, operating model)
- Dual model support (new 4-step + legacy 7-step)
- UI hiding of obsolete steps (steps 5-6)

### 🔗 Phase 10: Dependency Validation (4 tests)
- Step 2 depends on Step 1
- Step 3 depends on Steps 1 & 2
- Step 4 depends on Steps 1, 2, & 3
- Dependency enforcement (no step skipping)

---

## Test Execution

### Option 1: Browser Console (Manual)

1. **Start dev server:**
   ```powershell
   cd "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp"
   .\dev-start.ps1
   ```

2. **Open browser:**
   Navigate to `http://localhost:8080/azure-deployment/static/NexGenEA/NexGenEA_V11.html`

3. **Open Developer Console (F12)**

4. **Load test script:**
   ```javascript
   const script = document.createElement('script');
   script.src = '/tests/E2E_Step1_Step2_4Step_Workflow_Test.js';
   document.head.appendChild(script);
   ```

5. **Run tests:**
   ```javascript
   const test = new E2E_Step1_Step2_4Step_Workflow_Test();
   const results = await test.runAll();
   ```

6. **Review results:**
   Test report will be printed to console with:
   - Total tests run
   - Pass/fail counts
   - Detailed error messages
   - Pass rate percentage
   - Test duration

---

### Option 2: Automated Test Runner

1. **Run test runner:**
   ```powershell
   cd tests
   node run-step1-step2-e2e.js
   ```

2. **Follow instructions** printed by the runner

3. **Generate Playwright spec** (optional):
   The runner auto-generates a Playwright test spec for automated browser testing

---

### Option 3: Playwright (Automated Browser Testing)

1. **Install Playwright:**
   ```bash
   npm install --save-dev @playwright/test
   ```

2. **Run Playwright tests:**
   ```bash
   npx playwright test tests/playwright-e2e-step1-step2.spec.js
   ```

3. **View HTML report:**
   ```bash
   npx playwright show-report
   ```

---

## Expected Test Results

### ✅ All Tests Pass (72 tests)

```
═══════════════════════════════════════════════════════════════════════════════
📊 E2E TEST REPORT: Step 1 → Step 2 (4-Step Workflow)
═══════════════════════════════════════════════════════════════════════════════

⏱️  Duration: 3.45s
✅ Passed: 72
❌ Failed: 0
⚠️  Warnings: 0
📈 Pass Rate: 100.0%
🔢 Total Tests: 72

═══════════════════════════════════════════════════════════════════════════════
🎉 ALL TESTS PASSED! Step 1 → Step 2 workflow is functional.
═══════════════════════════════════════════════════════════════════════════════
```

---

## Test Data Structure

### Mock Test Model

```javascript
{
  workflowMode: 'business-object',
  projectName: 'E2E Test Project - 4-Step Workflow',
  projectId: 'test-1735142400000',
  contextObj: {
    org_name: 'TestCorp Healthcare',
    industry: 'Healthcare',
    org_type: 'hospital',
    size: 'enterprise'
  },
  businessContext: {
    objectives: [
      {
        id: 'obj-1',
        title: 'Improve patient digital experience',
        description: 'Transform patient engagement through telehealth and portals',
        priority: 'high',
        timeframe: '12-18 months'
      },
      // ... 2 more objectives
    ],
    strategicIntents: [
      'Digital transformation',
      'Operational excellence',
      'AI-enabled healthcare'
    ]
  },
  apqcFramework: { /* APQC PCF v8.0 data */ },
  apqcSummary: {
    framework_version: 'PCF v8.0',
    total_l1_categories: 13,
    business_type: 'Healthcare',
    strategic_focus: ['Digital transformation']
  },
  capabilityMap: {
    l1_domains: [
      {
        id: 'cap-10000',
        name: 'Manage Patient Care Services',
        level: 1,
        apqc_source: true,
        apqc_id: '10000',
        objective_mappings: ['obj-1', 'obj-3'],
        current_maturity: 2,
        target_maturity: 4,
        gap: 2,
        strategic_importance: 'CORE',
        it_enablement: {
          applications: ['EMR System', 'Clinical Portal'],
          data_services: ['Patient Data Hub'],
          integrations: ['HL7 FHIR'],
          security: ['HIPAA Compliance']
        },
        children: [/* L2 capabilities */]
      },
      // ... more capabilities
    ]
  },
  gapInsights: [
    {
      capability_id: 'cap-10000',
      capability_name: 'Manage Patient Care Services',
      gap_size: 2,
      priority: 'HIGH',
      timeframe: '6-12 months',
      gap_description: 'Current maturity (2) significantly below target (4)',
      recommendation: 'Invest in AI-powered clinical decision support',
      affected_objectives: ['obj-1', 'obj-3']
    },
    // ... more gaps
  ],
  whiteSpots: [
    {
      capability_id: 'ws-1',
      capability_name: 'AI-Powered Clinical Analytics',
      reason: 'MISSING',
      required_for: ['obj-3'],
      recommendation: 'Deploy machine learning models for predictive diagnostics',
      priority: 'HIGH'
    },
    // ... more white-spots
  ],
  completedSteps: [1, 2],
  capabilityValidated: true
}
```

---

## Troubleshooting

### ❌ Test Fails: "APQC framework not loaded"

**Solution:**
- Verify APQC data files exist:
  - `/azure-deployment/static/NexGenEA/APAQ_Data/apqc_pcf_master.json`
  - `/azure-deployment/static/NexGenEA/APAQ_Data/apqc_metadata_mapping.json`
- Check network tab in DevTools for 404 errors
- Ensure EA_DataManager.js is loaded before tests

### ❌ Test Fails: "Step2 module not loaded"

**Solution:**
- Verify Step2.js is loaded in NexGenEA_V11.html:
  ```html
  <script src="js/Steps/Step2.js"></script>
  ```
- Check browser console for JavaScript errors
- Ensure correct file path (case-sensitive on Linux/Mac)

### ❌ Test Fails: "renderStep2ValidationUI not found"

**Solution:**
- Verify NexGenEA_V11.html has Phase 7 UI updates applied
- Check if `window.renderStep2ValidationUI` function exists
- Ensure HTML file is the latest version (with Step2 validation UI)

### ⚠️ Warning: "APQC framework not cached"

**Not a blocker** — Framework will be loaded from file on first access.
- To pre-cache: Open app once, load APQC framework, then run tests
- sessionStorage cache is temporary (cleared on tab close)

### ⚠️ Warning: "Legacy step UI elements not found"

**Not a blocker** — May occur in headless mode or if DOM not fully loaded.
- Ensure tests run after page fully loads (`DOMContentLoaded`)
- Verify UI elements exist: `#step-5`, `#step-6`

---

## Test Maintenance

### Adding New Tests

1. **Add test method to class:**
   ```javascript
   testNewFeature() {
     console.log('\n🆕 PHASE X: New Feature Tests\n');
     
     this.logTest(
       'Feature X works correctly',
       /* condition */,
       'Expected behavior description'
     );
   }
   ```

2. **Call from runAll():**
   ```javascript
   async runAll() {
     // ... existing tests
     this.testNewFeature();
     // ...
     return this.generateReport();
   }
   ```

### Updating Mock Data

Edit mock data in test methods:
- `testInitializationAndDataModel()` — Update test model
- `testStep2Task1_CapabilityMapping()` — Update mock capability map
- `testGapInsightsAndWhiteSpots()` — Update mock gaps/white-spots

---

## Test File Locations

```
c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\
├── tests\
│   ├── E2E_Step1_Step2_4Step_Workflow_Test.js    # Main test file
│   ├── run-step1-step2-e2e.js                     # Test runner
│   ├── playwright-e2e-step1-step2.spec.js         # Playwright spec (auto-generated)
│   └── fixtures\
│       └── businessObjectivesTestData.js          # Shared test data
├── E2E_STEP1_STEP2_TEST_GUIDE.md                  # This guide
└── azure-deployment\static\NexGenEA\
    ├── NexGenEA_V11.html                          # App entry point
    ├── js\Steps\
    │   ├── Step0.js
    │   ├── Step1.js
    │   ├── Step2.js                               # NEW
    │   ├── Step3.js                               # NEW
    │   ├── Step4.js                               # NEW
    │   └── StepEngine.js                          # Updated
    └── APAQ_Data\
        ├── apqc_pcf_master.json                   # 20MB+ APQC data
        └── apqc_metadata_mapping.json             # Business type mappings
```

---

## Next Steps

After Step 1 → Step 2 tests pass:

1. **Extend tests to Step 3 & 4:**
   - Create `E2E_Step3_Step4_Workflow_Test.js`
   - Test Target Architecture generation
   - Test Transformation Roadmap generation

2. **Test all 3 workflow modes:**
   - Standard mode (diagnostic questionnaire)
   - Business-object mode (unified instruction)
   - Autopilot mode (AI auto-generation)

3. **Test edge cases:**
   - Missing APQC data (graceful degradation)
   - Large capability maps (100+ capabilities)
   - Custom non-APQC capabilities
   - Backward compatibility (load old 7-step model)

4. **Integration tests:**
   - AI Assistant context injection
   - Export functionality (JSON/CSV/PDF)
   - Project save/load
   - Multi-user collaboration

---

## Success Criteria

✅ **Ready for Production** when:
- All 72 E2E tests pass (100% pass rate)
- No console errors during test execution
- APQC framework loads in <3 seconds
- Step2 validation UI renders correctly
- Data model serialization/deserialization works
- Backward compatibility with legacy models verified
- Test duration <5 seconds

---

## Support

**Test Issues:**
- Check browser console for errors
- Review test report error messages
- Verify all dependencies loaded (DevTools Network tab)
- Check file paths (case-sensitive)

**APQC Issues:**
- Verify data files exist and are valid JSON
- Check sessionStorage for cached framework
- Test EA_DataManager methods in console

**UI Issues:**
- Verify Phase 7 UI updates applied to NexGenEA_V11.html
- Check sidebar shows 4 steps (not 7)
- Verify renderStep2ValidationUI function exists

---

**Created:** April 25, 2026  
**Version:** 1.0.0  
**Test File:** [E2E_Step1_Step2_4Step_Workflow_Test.js](tests/E2E_Step1_Step2_4Step_Workflow_Test.js)  
**Test Runner:** [run-step1-step2-e2e.js](tests/run-step1-step2-e2e.js)

**Ready to test!** 🚀
