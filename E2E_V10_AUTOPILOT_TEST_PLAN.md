# EA Platform V10 - Complete Autopilot E2E Test Plan
**Version:** V10 Architecture  
**Test Date:** April 23, 2026  
**Test Purpose:** Validate V10 architecture refactoring (new Steps 4-6)  
**Test Mode:** Full Autopilot  

---

## 🎯 Test Objectives

### Primary Goals
1. ✅ Validate V10 workflow executes all 7 steps sequentially
2. ✅ Verify new Step 4 (Benchmark) generates APQC comparison data
3. ✅ Verify new Step 5 (Data Collection) generates surveys and validates maturity
4. ✅ Verify new Step 6 (Layers & Gap) generates architecture layers (value streams, systems, data)
5. ✅ Confirm legacy step names (Operating Model, Value Pools) are fully removed
6. ✅ Validate AI Assistant messages use correct V10 step names
7. ✅ Check for encoding issues in AI chat panel and tab views
8. ✅ Verify no auto-generation of value streams in Step 3

### Secondary Goals
- Performance: Autopilot should complete in under 5 minutes
- Data quality: All outputs should match V10 schema
- UI consistency: Tab labels and sidebar workflow match V10
- Error handling: No validation errors or console warnings

---

## 📋 Test Prerequisites

### Environment Setup
- **Server:** Running on http://localhost:3000
- **Node.js:** v18+
- **Database:** Clean ea_models.db or fresh test project
- **API Key:** Valid OpenAI API key configured
- **Browser:** Chrome/Edge with developer tools open

### Test Data
**Scenario:** Swedish Insurance Company - Digital Transformation  
**Industry:** Insurance (Försäkring)  
**Detail Level:** Medium  
**Expected Outputs:**
- 5-7 L1 capabilities
- 15-20 L2 capabilities
- 3-5 benchmark gaps
- 3-5 survey questions
- 4-6 value streams
- 3-5 application systems

---

## 🧪 Test Execution Steps

### Phase 1: Setup & Launch Autopilot

**Steps:**
1. Open http://localhost:3000/NexGenEA/NexGen_EA_V4.html
2. Click "New Project" or clear existing model
3. Verify all 7 workflow steps are visible in left sidebar:
   - ✅ Step 1: Strategic Intent
   - ✅ Step 2: Business Model Canvas
   - ✅ Step 3: Capability Map
   - ✅ Step 4: **Benchmark** (V10 - NEW)
   - ✅ Step 5: **Data Collection** (V10 - NEW)
   - ✅ Step 6: **Layers & Gap** (V10 - NEW)
   - ✅ Step 7: Target Architecture
4. Verify NO legacy step names appear:
   - ❌ Operating Model (removed in V10)
   - ❌ Value Pools (removed in V10)
5. Open AI chat panel
6. Enter company description:
   ```
   Swedish insurance company focusing on digital transformation. 
   We need to modernize our customer service platform and improve 
   claims processing efficiency. Target: Reduce claims processing 
   time by 40% and improve customer satisfaction scores.
   ```
7. Click "Run Full Autopilot" button

**Expected Results:**
- Autopilot starts immediately
- AI chat panel shows: "🚀 Starting Full Autopilot Mode..."
- Workflow progress bar appears at top
- Step 1 starts executing

---

### Phase 2: Step-by-Step Validation

#### ✅ Step 1: Strategic Intent
**Expected AI Message:** "🎯 **Step 1:** Analyzing Strategic Intent..."

**Validation Checklist:**
- [ ] AI generates strategic ambition
- [ ] Success metrics defined (minimum 3)
- [ ] Strategic themes identified
- [ ] Completion message: "✅ **Step 1 complete:** Strategic Intent"
- [ ] Sidebar Step 1 turns green with checkmark

**Check Console for Errors:**
```javascript
// Should see:
[StepEngine] Running step1 with context...
[StepEngine] Step1 completed successfully
// Should NOT see any validation errors
```

**Inspect Data Model:**
```javascript
console.log(window.model.strategicIntent)
// Should contain: strategic_ambition, success_metrics, strategic_themes
```

---

#### ✅ Step 2: Business Model Canvas
**Expected AI Message:** "📊 **Step 2:** Building Business Model Canvas..."

**Validation Checklist:**
- [ ] BMC generated with all 9 blocks
- [ ] Value propositions defined
- [ ] Customer segments identified
- [ ] Revenue streams and cost structure present
- [ ] Completion message: "✅ **Step 2 complete:** Business Model Canvas"
- [ ] Sidebar Step 2 turns green

**Inspect Data Model:**
```javascript
console.log(window.model.businessModelCanvas)
// Should contain: value_propositions, customer_segments, key_activities, etc.
```

---

#### ✅ Step 3: Capability Map
**Expected AI Message:** "🗺️ **Step 3:** Generating Capability Map..."

**Validation Checklist:**
- [ ] L1 capabilities generated (5-7 expected)
- [ ] L2 capabilities generated (15-20 expected)
- [ ] Maturity ratings assigned (1-5 scale)
- [ ] APQC domain mapping present
- [ ] Completion message: "✅ **Step 3 complete:** Capability Map"
- [ ] Completion message includes: **"Click on Step 4: Benchmark in the left sidebar to continue."**
- [ ] ❌ NO Operating Model mentioned in completion message
- [ ] Sidebar Step 3 turns green
- [ ] **CRITICAL:** Value Streams tab remains empty (no auto-generation)

**Inspect Data Model:**
```javascript
console.log(window.model.capabilities)
// Should contain array of capabilities with L1 and L2 structure

console.log(window.model.valueStreams)
// V10: Should be EMPTY or [] - value streams created in Step 6 only

console.log(window.model.capabilityMap)
// Should contain: l1_domains[], APQC mappings

console.log(window.model.capabilityAssessment)
// Should contain: overall_maturity, capability_ratings[]
```

**Check Architecture Layers Tab:**
- Navigate to "Architecture Layers" tab
- **Expected:** Tab should be empty or show placeholder (no value streams yet)
- **V10 Change:** Step 3 no longer auto-populates this tab

---

#### ✅ Step 4: Benchmark Analysis (V10 - NEW)
**Expected AI Message:** "✨ **Step 4:** Running Benchmark Analysis..."

**Validation Checklist:**
- [ ] Benchmark comparison vs APQC standards
- [ ] Gap identification (3-5 gaps expected)
- [ ] Executive summary generated
- [ ] Completion message: "✅ **Step 4 complete:** Benchmark Analysis"
- [ ] Sidebar Step 4 turns green
- [ ] **CRITICAL:** No mention of "Operating Model" anywhere

**Inspect Data Model:**
```javascript
console.log(window.model.benchmarkData)
// Should contain: industry_standards, maturity_comparison, gap_areas

console.log(window.model.benchmarkGaps)
// Should contain array of gaps with: capability, current_level, target_level, priority

console.log(window.model.benchmarkSummary)
// Should contain: overall_assessment, key_findings, recommendations
```

**Check Benchmark Tab:**
- Navigate to "Benchmark" tab (if exists)
- **Expected:** Should display benchmark data and gaps
- Verify no encoding issues (å, ä, ö should render correctly)

---

#### ✅ Step 5: Data Collection & Survey (V10 - NEW)
**Expected AI Message:** "✨ **Step 5:** Generating Surveys & Validating Maturity..."

**Validation Checklist:**
- [ ] Survey questions generated (3-5 surveys)
- [ ] Questions target capability gaps from Step 4
- [ ] Survey processing logic present
- [ ] Maturity ratings validated/updated
- [ ] Completion message: "✅ **Step 5 complete:** Data Collection & Survey"
- [ ] Sidebar Step 5 turns green
- [ ] **CRITICAL:** No mention of "Gap Analysis" (old step name)

**Inspect Data Model:**
```javascript
console.log(window.model.surveys)
// Should contain array of surveys with: target_capability, questions[], stakeholder_groups[]

console.log(window.model.surveyResults)
// Should contain: responses, validated_maturity, confidence_scores

console.log(window.model.capabilities)
// Capabilities should have updated maturity ratings based on survey validation
```

**Check Data Collection Tab:**
- Navigate to "Data Collection" tab (if exists)
- **Expected:** Should display survey questions and results
- Verify survey questions are relevant to identified gaps

---

#### ✅ Step 6: Layers & Gap Analysis (V10 - NEW)
**Expected AI Message:** "✨ **Step 6:** Building Architecture Layers & Analyzing Gaps..."

**Validation Checklist:**
- [ ] Value Streams generated (4-6 expected)
- [ ] Application Systems identified (3-5 expected)
- [ ] Data Assets/Entities defined
- [ ] Gap analysis with priorities
- [ ] Quick wins identified
- [ ] Completion message: "✅ **Step 6 complete:** Layers & Gap Analysis"
- [ ] Sidebar Step 6 turns green
- [ ] **CRITICAL:** No mention of "Value Pools" (old step name)

**Inspect Data Model:**
```javascript
console.log(window.model.valueStreams)
// V10: Should NOW be populated with value streams (was empty after Step 3)
// Should contain: name, description, linked_capabilities

console.log(window.model.systems)
// Should contain array of systems: name, type, criticality, linked_capabilities

console.log(window.model.gapAnalysis)
// Should contain: gap_categories[], prioritization_matrix, investment_areas

console.log(window.model.priorityGaps)
// Should contain array: gap, impact, effort, priority_score

console.log(window.model.quickWins)
// Should contain array: initiative, benefit, effort, timeline
```

**Check Architecture Layers Tab:**
- Navigate to "Architecture Layers" tab
- **Expected:** Now fully populated with:
  - ✅ Value Streams section (populated)
  - ✅ Systems section (populated)
  - ✅ Data Assets section (populated)
  - ✅ Capabilities section (linked from Step 3)
- Verify no encoding issues in Swedish/Norwegian text

**Check Layers & Gap Tab:**
- Navigate to "Layers & Gap" tab (if exists)
- **Expected:** Should display gap analysis matrix and quick wins

---

#### ✅ Step 7: Target Architecture & Roadmap
**Expected AI Message:** "🎯 **Step 7:** Creating Transformation Roadmap..."

**Validation Checklist:**
- [ ] Target architecture principles generated
- [ ] Solution building blocks defined
- [ ] Transformation initiatives created
- [ ] Implementation waves (quarters) defined
- [ ] Completion message: "✅ **Step 7 complete:** Target Architecture & Roadmap"
- [ ] Sidebar Step 7 turns green
- [ ] Autopilot completion message: "🎉 Full Autopilot Complete! All 7 steps finished."

**Inspect Data Model:**
```javascript
console.log(window.model.targetArchitecture)
// Should contain: principles[], solution_building_blocks[], future_state_capabilities

console.log(window.model.transformationRoadmap)
// Should contain: initiatives[], waves[], dependencies

console.log(window.model.initiatives)
// Should contain array: name, description, linked_gap, timeline, roi

console.log(window.model.waves)
// Should contain: wave_1_q1_q2, wave_2_q3_q4, etc.
```

**Check Target Architecture Tab:**
- Navigate to "Target Architecture" tab
- **Expected:** Should display architecture principles and solution blocks
- Verify target state architecture diagram/visualization

**Check Roadmap Tab:**
- Navigate to "Roadmap" tab
- **Expected:** Should display timeline with waves and initiatives
- Verify no encoding issues in initiative names

---

### Phase 3: V10-Specific Validation

#### ✅ Legacy References Check

**AI Chat Panel Audit:**
1. Scroll through entire chat history
2. Search for legacy terms (Ctrl+F):
   - ❌ "Operating Model" (should NOT appear after Step 3)
   - ❌ "Value Pools" (should NOT appear anywhere)
   - ❌ "Gap Analysis" as step name (OK in context, not as step title)
3. Verify V10 step names appear correctly:
   - ✅ "Step 4: Benchmark" or "Benchmark Analysis"
   - ✅ "Step 5: Data Collection" or "Surveys & Validating Maturity"
   - ✅ "Step 6: Layers & Gap" or "Architecture Layers & Analyzing Gaps"

**Tab Labels Audit:**
1. Check all tab labels in main UI
2. Expected V10 tabs:
   - ✅ Strategic Intent
   - ✅ Business Model Canvas
   - ✅ Capability Map
   - ✅ Benchmark (or Benchmark Analysis)
   - ✅ Data Collection (or Surveys)
   - ✅ Layers & Gap (or Architecture Layers)
   - ✅ Target Architecture
   - ✅ Roadmap
3. Verify NO legacy tabs exist:
   - ❌ Operating Model tab
   - ❌ Value Pools tab

**Sidebar Workflow Audit:**
1. Check workflow sidebar (left side)
2. All 7 steps should show green checkmarks
3. Step labels should match V10:
   - Step 4: Benchmark ✓
   - Step 5: Data Collection ✓
   - Step 6: Layers & Gap ✓

---

#### ✅ Encoding Issues Check

**AI Chat Panel:**
1. Inspect all AI messages for mojibake characters
2. Common encoding issues to look for:
   - ❌ `�` or `???` (replacement characters)
   - ❌ `&#x2718;` (HTML entities not decoded)
   - ❌ `f�r` instead of `för`
   - ❌ `Allm�n` instead of `Allmän`
3. Expected after V10 fix:
   - ✅ All text in English (Swedish translated)
   - ✅ Proper UTF-8 rendering
   - ✅ No HTML entity codes visible

**Tab Content:**
1. Navigate to each tab
2. Check for encoding issues in:
   - Capability names
   - Gap descriptions
   - Value stream names
   - Initiative titles
3. Expected:
   - ✅ All special characters render correctly
   - ✅ Swedish: å, ä, ö render properly
   - ✅ Norwegian: æ, ø, å render properly
   - ✅ Danish characters render properly

**Console Logs:**
1. Open browser DevTools → Console
2. Check for encoding warnings:
   ```
   ❌ Should NOT see: "Character encoding issue detected"
   ✅ Should see: "UTF-8 encoding validated"
   ```

---

#### ✅ Data Cascade Validation

**Objective:** Verify Step 3 does NOT trigger cascade generation

**Test Steps:**
1. After autopilot completes, reload page
2. Load the same project
3. Manually click "Generate Capability Map" button (Step 3)
4. **Expected Behavior:**
   - ✅ Only Step 3 executes
   - ✅ Capabilities are regenerated
   - ✅ Value Streams remain from Step 6 (NOT regenerated)
   - ✅ No automatic triggering of Steps 4, 5, 6
5. Check Architecture Layers tab
   - **Expected:** Still shows data from previous Step 6
   - **V10 Fix:** Step 3 no longer auto-populates value streams

**Console Validation:**
```javascript
// After clicking "Generate Capability Map"
// Should see:
[StepEngine] Running step3 with context...
[StepEngine] Step3 completed successfully

// Should NOT see:
[StepEngine] Running step4...  // ❌ Should not auto-run
[StepEngine] Running step5...  // ❌ Should not auto-run
[StepEngine] Running step6...  // ❌ Should not auto-run
```

---

### Phase 4: Performance & Quality Metrics

#### ⏱️ Performance Benchmarks

**Target Performance:**
- Total autopilot time: < 5 minutes (300 seconds)
- Step 1 (Strategic Intent): < 30 seconds
- Step 2 (BMC): < 40 seconds
- Step 3 (Capability Map): < 50 seconds
- Step 4 (Benchmark): < 40 seconds
- Step 5 (Data Collection): < 40 seconds
- Step 6 (Layers & Gap): < 50 seconds
- Step 7 (Target Architecture): < 60 seconds

**Actual Performance (to be filled during test):**
- Total time: _____ seconds
- Step 1: _____ seconds
- Step 2: _____ seconds
- Step 3: _____ seconds
- Step 4: _____ seconds
- Step 5: _____ seconds
- Step 6: _____ seconds
- Step 7: _____ seconds

**Performance Rating:**
- ✅ EXCELLENT: < 4 minutes
- ✅ GOOD: 4-5 minutes
- ⚠️ ACCEPTABLE: 5-7 minutes
- ❌ NEEDS OPTIMIZATION: > 7 minutes

---

#### 📊 Data Quality Metrics

**Capability Map Quality:**
- L1 Capabilities generated: _____ (target: 5-7)
- L2 Capabilities generated: _____ (target: 15-20)
- Maturity ratings valid (1-5): ☐ Yes ☐ No
- APQC mappings present: ☐ Yes ☐ No

**Benchmark Quality (V10 - NEW):**
- Benchmark gaps identified: _____ (target: 3-5)
- Executive summary length: _____ characters (target: 500-1000)
- Gap priorities defined: ☐ Yes ☐ No

**Survey Quality (V10 - NEW):**
- Surveys generated: _____ (target: 3-5)
- Questions per survey: _____ (target: 4-6)
- Stakeholder groups identified: ☐ Yes ☐ No

**Architecture Layers Quality (V10 - NEW):**
- Value streams generated: _____ (target: 4-6)
- Systems identified: _____ (target: 3-5)
- Data entities defined: _____ (target: 5-10)
- Quick wins identified: _____ (target: 3-5)

**Target Architecture Quality:**
- Architecture principles: _____ (target: 4-6)
- Solution building blocks: _____ (target: 5-8)
- Transformation initiatives: _____ (target: 8-12)
- Implementation waves: _____ (target: 3-4)

---

#### ❌ Error & Warning Check

**Console Errors:**
```javascript
// Check browser DevTools → Console
// Should NOT see:
❌ [StepEngine] Task failed: ...
❌ [OutputValidator] Validation failed: ...
❌ Uncaught TypeError: ...
❌ Cannot read property 'xxx' of undefined

// Should see:
✅ [StepEngine] Step1 completed successfully
✅ [StepEngine] Step2 completed successfully
✅ ... (all 7 steps)
✅ [OutputValidator] All outputs validated successfully
```

**Network Errors:**
```javascript
// Check browser DevTools → Network tab
// Should NOT see:
❌ 500 Internal Server Error
❌ 429 Too Many Requests
❌ CORS errors
❌ Failed to fetch

// Should see:
✅ All API calls return 200 OK
✅ OpenAI API calls succeed
✅ Database operations succeed
```

---

## 📈 Test Results Summary

### Overall Test Score
**Formula:** (Passed Checks / Total Checks) × 100

**Scoring:**
- ✅ PASS: 90-100%
- ⚠️ ACCEPTABLE: 70-89%
- ❌ FAIL: < 70%

**Test Score:** _____ / _____ = _____% 

---

### Critical V10 Validation Results

| Test Area | Status | Notes |
|-----------|--------|-------|
| V10 Step 4 (Benchmark) executes | ☐ Pass ☐ Fail | |
| V10 Step 5 (Data Collection) executes | ☐ Pass ☐ Fail | |
| V10 Step 6 (Layers & Gap) executes | ☐ Pass ☐ Fail | |
| Legacy "Operating Model" removed | ☐ Pass ☐ Fail | |
| Legacy "Value Pools" removed | ☐ Pass ☐ Fail | |
| AI messages use V10 step names | ☐ Pass ☐ Fail | |
| Step 3 NO auto-generation | ☐ Pass ☐ Fail | |
| Encoding issues fixed | ☐ Pass ☐ Fail | |
| Value Streams created in Step 6 | ☐ Pass ☐ Fail | |
| Architecture Layers tab populated | ☐ Pass ☐ Fail | |

---

### Known Issues (V9 → V10 Migration)

**Issues Fixed in V10:**
1. ✅ Step 3 cascade execution (fixed: no longer auto-generates value streams)
2. ✅ AI Assistant legacy step names (fixed: messages updated to V10)
3. ✅ Encoding issues (fixed: Swedish translated to English)
4. ✅ Autopilot workflow messages (fixed: V10 step names)

**Potential New Issues to Watch:**
1. ⚠️ Step 7 Target Architecture may need updates to pull from Step 6 outputs
2. ⚠️ Benchmark tab may not exist yet (UI pending)
3. ⚠️ Data Collection tab may not exist yet (UI pending)
4. ⚠️ Legacy function bridges may still reference old functions

---

## 🔧 Troubleshooting

### Issue: Autopilot Fails to Start
**Symptoms:** Clicking "Run Full Autopilot" does nothing
**Diagnosis:**
```javascript
// Check in console:
console.log(typeof runFullAutopilot) // Should be 'function'
console.log(window._autopilotState) // Should exist
```
**Solution:** Check StepEngine is loaded, verify all Step modules exist

---

### Issue: Step X Validation Error
**Symptoms:** "[OutputValidator] Task output failed validation"
**Diagnosis:**
```javascript
// Check which field is missing:
console.log(window.model.steps.stepX.answers)
```
**Solution:** Review Step module's tasks array, verify output schema matches instruction file

---

### Issue: AI Chat Panel Shows Encoding Issues
**Symptoms:** Mojibake characters (�, &#x2718;, f�r)
**Diagnosis:**
```javascript
// Check file encoding:
// NexGen_EA_V4.html should be UTF-8
```
**Solution:** Already fixed in V10 - if still occurs, re-apply Swedish→English translations

---

### Issue: Step 3 Triggers Cascade
**Symptoms:** Clicking "Generate Capability Map" runs Steps 4-7
**Diagnosis:**
```javascript
// Check Step3.js applyOutput():
console.log(window.model.valueStreams) // Should be [] after Step 3
```
**Solution:** Already fixed in V10 - Step3 no longer auto-generates value streams

---

## 📝 Test Report Template

### Test Execution Details
- **Tester:** _____________________
- **Date:** _____________________
- **Time Started:** _____________________
- **Time Completed:** _____________________
- **Duration:** _____ minutes
- **Environment:** Local / Azure
- **Browser:** Chrome / Edge / Firefox

### Test Results
- **Total Checks:** _____
- **Passed:** _____
- **Failed:** _____
- **Warnings:** _____
- **Pass Rate:** _____% 

### Critical Issues Found
1. _____________________________________________________
2. _____________________________________________________
3. _____________________________________________________

### Recommendations
1. _____________________________________________________
2. _____________________________________________________
3. _____________________________________________________

### Sign-Off
- **Test Status:** ☐ PASS ☐ FAIL ☐ BLOCKED
- **Ready for Production:** ☐ YES ☐ NO ☐ WITH FIXES
- **Tester Signature:** _____________________
- **Date:** _____________________

---

## 📚 Related Documentation

- [V10 Architecture Guide](NexGenEA_V10_ARCHITECTURE.md)
- [Step 4 Benchmark Module](NexGenEA/js/Steps/Step4.js)
- [Step 5 Data Collection Module](NexGenEA/js/Steps/Step5.js)
- [Step 6 Layers & Gap Module](NexGenEA/js/Steps/Step6.js)
- [StepEngine Registry](NexGenEA/js/Steps/StepEngine.js)
- [Previous E2E Test Results](E2E_AUTOPILOT_TEST_RESULTS.md)

---

**End of Test Plan**
