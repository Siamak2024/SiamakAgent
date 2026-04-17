# E2E Workflow Integration - Test Guide

## ✅ Implementation Summary

### What Was Implemented

1. **Auto-Trigger Capability Mapping**
   - Excel import → Auto-triggers capability mapping after 1 second
   - JSON import → Auto-triggers capability mapping after 1 second
   - Function: `autoMapImportedApplications()`

2. **Smart Capability Detection**
   - If apps have `businessCapabilities` array → Auto-links to existing capabilities
   - If no capabilities exist → Auto-generates from department and app names
   - If apps missing capabilities → Opens AI mapping modal

3. **Cross-Tab Synchronization**
   - After capability mapping → Updates inventory and rationalization views
   - After decisions generation → Prompts to regenerate if capabilities changed
   - Function: `syncCapabilitiesToRationalization()`

4. **Visual Workflow Progress Indicator**
   - 4-step progress bar at top of page
   - Step 1: Import Applications (shows count)
   - Step 2: Map Capabilities (shows % mapped)
   - Step 3: Analyze Portfolio (shows % with rationalization)
   - Step 4: Generate Decisions (shows decision count)
   - Auto-updates as user completes each step

5. **New Integration Functions**
   - `autoMapImportedApplications()` - Routes to link/map/generate
   - `autoGenerateCapabilitiesFromApps()` - Creates L1/L2 from data
   - `extractCapabilityName()` - Extracts capability from app name
   - `linkExistingCapabilities()` - Links pre-populated capabilities
   - `syncCapabilitiesToRationalization()` - Triggers cross-tab updates
   - `updateWorkflowProgress()` - Updates progress indicator
   - `updateWorkflowStep()` - Updates individual step status

---

## 🧪 Test Scenarios

### Test 1: Import Without Capabilities (AI Mapping Flow)

**Objective**: Verify AI mapping modal auto-opens for apps without capabilities

**Steps**:
1. Open APM toolkit at http://localhost:3000/NexGenEA/EA2_Toolkit/Application_Portfolio_Management.html
2. Go to **Inventory** tab
3. Click "Import from File"
4. Select `apm_portfolio_2026-03-31.json` (apps WITHOUT businessCapabilities)
5. **Expected Results**:
   - ✅ Toast: "Imported X applications"
   - ✅ After 1 second: "🤖 Starting AI capability mapping..."
   - ✅ AI Mapping modal opens automatically
   - ✅ Workflow progress shows Step 1 complete (green ✅)
   - ✅ Step 2 shows "0% mapped" (pending)

6. Continue AI mapping:
   - Select API key in modal
   - Click "Run AI Mapping"
   - **Expected**: AI analyzes apps and suggests capability mappings

7. Apply mappings:
   - Click "Apply All Mappings"
   - **Expected Results**:
     - ✅ Toast: "Applied X capability mappings"
     - ✅ Modal closes
     - ✅ Capability Layer tab updates with new capabilities
     - ✅ Inventory tab refreshes showing capability links
     - ✅ Workflow Step 2 shows green ✅ and "100% mapped"

---

### Test 2: Import With Pre-Populated Capabilities (Auto-Link Flow)

**Objective**: Verify auto-linking when apps already have businessCapabilities

**Steps**:
1. Clear existing data or use fresh database
2. Go to **Inventory** tab
3. Import file with pre-populated capabilities (if exists in data/imports/)
4. **Expected Results**:
   - ✅ Toast: "Imported X applications"
   - ✅ After 1 second: "🔗 Linking X applications to existing capabilities..."
   - ✅ NO modal opens (auto-links directly)
   - ✅ Toast: "✅ Linked X application-capability relationships"
   - ✅ Workflow Step 1 & 2 both show green ✅

5. Verify linking:
   - Go to **Capability Layer** tab
   - **Expected**: Capabilities created/linked to applications
   - Click on a capability
   - **Expected**: Shows linked applications in detail view

---

### Test 3: Auto-Generate Capabilities (No Capability Template)

**Objective**: Verify capability generation when no capabilities exist

**Steps**:
1. Start with empty database
2. Import applications (without businessCapabilities)
3. **Expected Results**:
   - ✅ Toast: "📋 No capability template loaded. Generating capabilities from applications..."
   - ✅ System creates L1 capabilities from departments
   - ✅ System creates L2 capabilities from app names/descriptions
   - ✅ Toast: "✅ Generated X capabilities from Y applications"

4. Verify generation:
   - Go to **Capability Layer** tab
   - **Expected**: See L1 capabilities matching department names
   - **Expected**: See L2 capabilities extracted from app names

---

### Test 4: Cross-Tab Synchronization

**Objective**: Verify data syncs across Inventory → Capabilities → Rationalization → Decisions

**Steps**:
1. Complete Test 1 or Test 2 (import + capability mapping)
2. Go to **Rationalization** tab
3. **Expected Results**:
   - ✅ Rationalization view shows updated data
   - ✅ Applications reflect capability mappings
   - ✅ Workflow Step 3 updates if rationalization actions exist

4. Assign rationalization actions to some apps:
   - In Inventory tab, edit apps and set rationalizationAction
   - Go back to **Rationalization** tab
   - **Expected**: Workflow Step 3 shows percentage with actions

5. Go to **Decisions** tab
6. Click "Run Portfolio Analysis"
7. **Expected Results**:
   - ✅ Decision engine analyzes applications
   - ✅ Uses capability context in decision rationale
   - ✅ Workflow Step 4 shows green ✅ with decision count

8. Go back to **Capability Layer**, add new mappings
9. After applying new mappings:
   - **Expected**: Confirmation dialog: "Capability mappings have been updated. Would you like to regenerate decisions?"
   - Click "OK"
   - **Expected**: Decisions refresh with updated capability context

---

### Test 5: Workflow Progress Indicator

**Objective**: Verify visual progress indicator tracks completion

**Initial State**:
- All steps show ⚪ (white circle, not started)
- Progress bar hidden

**After Import**:
- Step 1: ✅ Green checkmark, "X apps"
- Step 2: ⚪ White, "0% mapped"
- Progress bar visible

**After Capability Mapping**:
- Step 1: ✅ Green
- Step 2: ✅ Green, "100% mapped" or "Y% mapped"
- Step 3: ⚪ White, "0% analyzed"

**After Rationalization**:
- Step 3: ✅ Green, "Z% analyzed"
- Step 4: ⚪ White, "Pending"

**After Decisions**:
- Step 4: ✅ Green, "X decisions"

**Quick Navigation**:
- Click "Go to Inventory →" button in Step 1 → Switches to Inventory tab
- Click "Go to Capabilities →" in Step 2 → Switches to Capability tab
- Click "Go to Rationalization →" in Step 3 → Switches to Rationalization tab
- Click "Go to Decisions →" in Step 4 → Switches to Decisions tab

---

## 📊 Data Files for Testing

### Recommended Test Files

1. **apm_portfolio_2026-03-31.json**
   - Location: `data/projects/` or `NexGenEA/EA2_Toolkit/Import data/`
   - Contains: Applications WITHOUT businessCapabilities
   - Use for: Test 1 (AI Mapping Flow)

2. **Create Test File with Capabilities**
   ```json
   {
     "applications": [
       {
         "id": "app-001",
         "name": "Tenant Portal",
         "department": "Property Management",
         "businessCapabilities": ["Tenant Management", "Lease Management"],
         "lifecycle": "active",
         "capex": 150000,
         "opex": 75000,
         "currency": "SEK"
       },
       {
         "id": "app-002",
         "name": "Maintenance System",
         "department": "Operations",
         "businessCapabilities": ["Work Order Management", "Asset Maintenance"],
         "lifecycle": "active",
         "capex": 200000,
         "opex": 100000,
         "currency": "SEK"
       }
     ]
   }
   ```
   - Use for: Test 2 (Auto-Link Flow)

---

## 🐛 Troubleshooting

### Issue: Modal Not Auto-Opening

**Cause**: Import timeout delay not triggering
**Solution**: Check browser console for errors, verify `autoMapImportedApplications` function exists

### Issue: Capabilities Not Linking

**Cause**: `businessCapabilities` array format mismatch
**Solution**: Ensure businessCapabilities is array of strings, not objects

### Issue: Workflow Progress Not Updating

**Cause**: `updateWorkflowProgress()` not called
**Solution**: Verify it's called in `renderKPIs()`, `renderDecisions()`, `renderRationalization()`

### Issue: Decisions Don't Use Capability Context

**Cause**: Decision engine not accessing capability data
**Solution**: Check EA_ScoringEngine calculates businessFit using APQC alignment

---

## ✨ Key Integration Points

### 1. Import Functions (Lines 1997-2080)
```javascript
// After successful import, trigger auto-mapping
setTimeout(() => autoMapImportedApplications(imported), 1000);
```

### 2. Capability Mapping Enhancement (Lines 2840-2860)
```javascript
renderInventory(); // Refresh inventory to show capability links
syncCapabilitiesToRationalization(); // Sync to rationalization
```

### 3. New Integration Functions (Lines 2862-3040)
- `autoMapImportedApplications()` - Main routing logic
- `autoGenerateCapabilitiesFromApps()` - Generate from data
- `linkExistingCapabilities()` - Link pre-populated
- `syncCapabilitiesToRationalization()` - Cross-tab sync

### 4. Workflow Progress (Lines 1373-1450)
- `updateWorkflowProgress()` - Calculate completion
- `updateWorkflowStep()` - Update visual indicator

---

## 📈 Success Criteria

### ✅ Integration Complete When:

1. **Import triggers auto-mapping** without manual intervention
2. **Apps with capabilities** auto-link without modal
3. **Apps without capabilities** trigger AI mapping modal
4. **Capabilities auto-generate** from departments/app names when none exist
5. **Tabs synchronize** data automatically after each step
6. **Workflow progress** updates in real-time showing completion status
7. **Decision engine** uses capability context in recommendations
8. **User receives clear feedback** via toasts and progress indicator

---

## 🚀 Next Steps After Testing

1. **Test with real data** - Import actual application portfolio
2. **Validate AI mappings** - Verify AI suggests accurate capability mappings
3. **Review decision quality** - Ensure decisions reflect capability strategic importance
4. **User acceptance testing** - Have stakeholders test E2E workflow
5. **Performance optimization** - Test with 100+ applications
6. **Documentation** - Create user guide for E2E workflow

---

## 📝 Testing Checklist

- [ ] Test 1: AI Mapping Flow (apps without capabilities)
- [ ] Test 2: Auto-Link Flow (apps with capabilities)
- [ ] Test 3: Auto-Generate Capabilities (no template)
- [ ] Test 4: Cross-Tab Synchronization
- [ ] Test 5: Workflow Progress Indicator
- [ ] Verify no console errors
- [ ] Verify toasts display correctly
- [ ] Verify tabs switch correctly
- [ ] Verify data persists after reload
- [ ] Verify workflow progress accurate
- [ ] Test with multiple imports
- [ ] Test decision regeneration prompt

---

## 🎯 Expected User Experience

1. **User imports Excel/JSON** → System immediately shows "Imported X applications"
2. **1 second later** → System analyzes data and determines next action
3. **If capabilities exist** → System auto-links and confirms "✅ Linked X relationships"
4. **If no capabilities** → System opens AI modal for user to map
5. **After mapping** → All tabs update automatically
6. **Progress bar** → Shows user exactly where they are in workflow
7. **User clicks next step button** → Instantly switches to relevant tab
8. **Seamless experience** → No manual steps, data flows automatically

---

**Status**: ✅ E2E Workflow Integration Complete  
**Last Updated**: Phase 1 Implementation  
**Next Phase**: User Testing & Validation
