# Organization Profile Feature - Quick Start Testing Guide

**Status:** ✅ Ready for Testing  
**Testing Time:** 15-30 minutes for core validation  

---

## Prerequisites
- ✅ All code implemented (Phases 1-6 complete)
- ✅ No syntax errors
- ✅ Script tag added for EA_OrganizationProfileProcessor.js
- ✅ Ready to open NexGen_EA_V4.html in browser

---

## 🚀 Quick Test (5 minutes)

### Step 1: Verify Processor Loaded
1. Open `NexGenEA/NexGen_EA_V4.html` in browser
2. Open browser console (F12)
3. Type: `typeof EA_OrganizationProfileProcessor`
4. **Expected:** `"object"` (not "undefined")

### Step 2: Test Short Input Validation
1. Start new workflow
2. In Step 0, enter: `"Short text"` (< 100 chars)
3. **Expected:** Error message about minimum length

### Step 3: Test Quick Start Mode (Backward Compatibility)
1. Enter: `"ACME Corp is a logistics company modernizing operations."` (~60 chars)
2. Proceed with workflow
3. Open console, type: `model.initializationMode`
4. **Expected:** `"quick"` (not "rich")
5. **Expected:** No Organization Profile section in Executive Summary tab

---

## 📊 Core Feature Test (15 minutes)

### Test Rich Profile Mode with Sample Data

**Copy this sample text into Step 0:**

```
ACME Healthcare is a regional hospital network operating across the Midwest United States. We employ 8,500 staff including 1,200 physicians and 3,500 nurses across 12 hospitals and 45 outpatient clinics. 

OUR MISSION: Provide compassionate, high-quality healthcare accessible to all. We serve 2 million patients annually across three states.

STRATEGIC PRIORITIES (2026-2028):
1. Digital Health Transformation - Expand telehealth, launch patient engagement app
2. Value-Based Care Transition - Shift from fee-for-service to value-based models
3. Financial Sustainability - Improve operating margin from 2.1% to 4%

CURRENT CHALLENGES:
- Financial pressures from Medicare cuts and rising labor costs
- Nursing shortage (12% vacancy rate)
- Legacy Epic EHR from 2015 needs $12M upgrade
- Competition from specialty hospitals and retail clinics

TECHNOLOGY LANDSCAPE:
- Epic EHR (2015 version, outdated)
- Cloud adoption: Early stage (15% workloads)
- AI adoption: Pilot phase (sepsis prediction, radiology AI)
- Tech debt: High (network aging, 40 point-to-point interfaces)

FINANCIALS:
- Revenue: $1.4 billion annually
- Operating margin: 2.1% (below industry median of 3.5%)
- Growth rate: 3% YoY
- Investment capacity: Limited ($45M capital budget, $28M IT budget)

MARKET:
- Market share: 18% (2nd largest in region)
- Serve 1.2M population in 8 counties
- Competitors: Midwest Health System (32% share), University Medical Center
- Differentiators: Community trust, integrated care, telehealth capabilities

OPPORTUNITIES:
- Telehealth expansion to rural areas
- Value-based contracts ($8-12M potential savings)
- Service line growth in oncology and orthopedics
```

### Expected Results:

**During Processing (10-30 seconds):**
- Watch console for processing messages
- Progress updates should appear

**After Processing:**
1. Open console and verify:
   ```javascript
   model.initializationMode // Expected: "rich"
   model.organizationProfileCompleteness // Expected: 75-85
   model.organizationProfile.organizationName // Expected: "ACME Healthcare"
   ```

2. **Go to Executive Summary tab**
   - ✅ Organization Profile section visible at top
   - ✅ Completeness badge shows "80% Complete" (green or blue)
   - ✅ Executive summary card displays
   - ✅ Core Identity shows: "ACME Healthcare | Healthcare | 8,500 employees"
   - ✅ Strategic Priorities shows 3 items
   - ✅ Click "Show full profile" → Details expand
   - ✅ Click "Edit" button → Modal opens

3. **Test Edit Modal:**
   - Fields should be pre-filled with current data
   - Change "Revenue" from "$1.4 billion" to "$1.5 billion"
   - Click Save
   - **Expected:** Profile updates, completeness may change slightly
   - **Expected:** Alert "Organization profile updated successfully!"

---

## 🔍 Context Propagation Test (10 minutes)

After completing Rich Profile setup above:

### Test Step 1 (Strategic Intent)
1. Proceed from Step 0 to Step 1
2. **Expected:** Questionnaire may be skipped or shortened
3. Generate Strategic Intent document
4. **Verify:** Document mentions "ACME Healthcare" and specific priorities like "Digital Health Transformation"
5. Open console:
   ```javascript
   const si = model.strategicIntent.document;
   si.includes('Digital Health') // Expected: true
   si.includes('telehealth') // Expected: true
   ```

### Test Step 2 (Business Model Canvas)
1. Proceed to Step 2
2. **Expected:** BMC generation uses actual business model
3. **Verify:** Value Propositions mention "compassionate healthcare" or "telehealth"

### Quick Check Steps 3-7
- Proceed through remaining steps
- Spot-check outputs mention ACME Healthcare specifics (not generic healthcare templates)

---

## ✅ Success Criteria Checklist

### Must Pass:
- [ ] EA_OrganizationProfileProcessor loaded successfully
- [ ] Short input (<100 chars) shows validation error
- [ ] Quick Start mode (≤500 chars) works as before
- [ ] Rich Profile mode (>500 chars) processes successfully
- [ ] Completeness score 75-85% for sample data
- [ ] Profile displays in Executive Summary tab
- [ ] Edit modal opens and allows updates
- [ ] Step 1 uses profile context (mentions ACME Healthcare)

### Nice to Have:
- [ ] Processing completes in <30 seconds
- [ ] All 7 steps reference profile data
- [ ] Storage persists after page reload
- [ ] Warnings display for incomplete profiles

---

## 🐛 Troubleshooting

### "EA_OrganizationProfileProcessor is not defined"
- **Fix:** Verify script tag at line ~87 in NexGen_EA_V4.html:
  ```html
  <script src="../js/EA_OrganizationProfileProcessor.js"></script>
  ```
- Check file exists at: `js/EA_OrganizationProfileProcessor.js`

### "AI extraction failed"
- Check console for detailed error
- Verify AzureOpenAIProxy.js loaded successfully
- Check instruction file exists: `NexGenEA/js/Instructions/step0/0_2_organization_profile_processor.instruction.md`

### Profile doesn't display in Executive Summary
- Check console: `model.organizationProfileCompleteness`
- If < 40%, profile is hidden (by design)
- If undefined, Step 0 may not have completed successfully

### Context not propagating to Step 1
- Check console: `model.organizationProfile`
- Verify completeness >= 60%
- Check Step1.js loaded correctly (no errors)

---

## 📋 Testing Commands Reference

```javascript
// Check initialization mode
model.initializationMode // 'quick' or 'rich'

// Check profile exists
!!model.organizationProfile // true or false

// Check completeness
model.organizationProfileCompleteness // 0-100

// View full profile
console.table(model.organizationProfile)

// Check if Step 1 used profile
model.strategicIntent?.contextUsed?.organizationProfile

// Force re-render profile
renderOrganizationProfile()

// Export profile to file
const dataStr = JSON.stringify(model.organizationProfile, null, 2);
const blob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'organization_profile.json';
a.click();
```

---

## 📞 Need Help?

**Full Test Plan:** See `ORGANIZATION_PROFILE_PHASE6_TEST_PLAN.md` for comprehensive test cases

**Implementation Guide:** See `ORGANIZATION_PROFILE_IMPLEMENTATION_GUIDE.md` for technical details

**Complete Summary:** See `ORGANIZATION_PROFILE_COMPLETE_IMPLEMENTATION_SUMMARY.md` for architecture and data flow

---

**Ready to Test!** 🎉

Start with the Quick Test (5 min), then proceed to Core Feature Test (15 min) for full validation.
