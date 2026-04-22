# Unified EA Pipeline Architecture

## Executive Summary

**Problem Solved**: Different workflow modes (Standard, Autopilot, Business Object) were trying to navigate to non-existent tabs (`step2`, `step3`, etc.) and not generating structured data compatible with EA platform views.

**Solution**: Implemented a unified EA pipeline that ensures all workflow modes follow the same 7-step process, produce identical data structures, and render to the same tabs—regardless of which workflow mode the user chooses.

---

## Architecture Overview

### The Problem

Previously, each workflow mode had its own implementation:
- **Standard Mode**: Used StepEngine with `step1`, `step2`, etc. identifiers
- **Autopilot Mode**: Bulk-generated all content at once
- **Business Object Mode**: Used discovery chat but didn't map to actual tabs

This caused:
1. ❌ **Tab navigation errors**: `showTab('step2')` failed because no `tab-step2` exists
2. ❌ **Missing structured data**: AI responses weren't being saved to `model.bmc`, `model.capabilities`, etc.
3. ❌ **No tab highlighting**: Tabs weren't being highlighted when content was generated
4. ❌ **Inconsistent data structures**: Different workflows stored data differently

### The Solution: Unified Pipeline

All workflow modes now follow the **same 7-step EA pipeline**:

```
┌─────────────────────────────────────────────────────────────┐
│              UNIFIED EA PIPELINE (All Modes)                │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   Standard Mode         Autopilot Mode      Business Object Mode
   (5 questions/step)    (0 questions)       (3 questions/step)
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                    7 Unified Steps
                              │
        ┌─────────────────────┼─────────────────────┐
        ├─ Step 1: Strategic Intent / Business Objectives
        │  → Saves to: model.businessObjectives, model.strategicIntent
        │  → Renders to: Executive Summary Tab (exec)
        │  → Tab ID: tab-exec
        │
        ├─ Step 2: Business Model Canvas
        │  → Saves to: model.bmc {value_propositions, customer_segments, ...}
        │  → Renders to: BMC Tab (bmc)
        │  → Tab ID: tab-bmc
        │  → Rendering: renderBMCCanvas(), renderBMCPanel()
        │
        ├─ Step 3: Capability Map
        │  → Saves to: model.capabilities [{id, name, domain, maturity, ...}]
        │  → Renders to: Capability Map Tab (capmap)
        │  → Tab ID: tab-capmap
        │  → Rendering: renderCapMap(), renderHeatmap()
        │
        ├─ Step 4: Operating Model
        │  → Saves to: model.operatingModel {structure, governance, processes}
        │  → Renders to: Operating Model Tab (opmodel)
        │  → Tab ID: tab-opmodel
        │
        ├─ Step 5: Gap Analysis
        │  → Saves to: model.gapAnalysis {gaps, priorities}
        │  → Renders to: Gap Analysis Tab (gap)
        │  → Tab ID: tab-gap
        │
        ├─ Step 6: Value Pools
        │  → Saves to: model.valuePools []
        │  → Renders to: Value Pools Tab (valuepools)
        │  → Tab ID: tab-valuepools
        │
        └─ Step 7: Roadmap
           → Saves to: model.roadmap {waves, milestones}
           → Renders to: Roadmap Visualization Tab (roadmapvis)
           → Tab ID: tab-roadmapvis
```

---

## Implementation Details

### 1. Tab Mapping Function

Created `getTabNameForStep(stepNum)` to map step numbers to actual tab IDs:

```javascript
function getTabNameForStep(stepNum) {
  const tabMapping = {
    1: 'exec',         // Executive Summary
    2: 'bmc',          // Business Model Canvas
    3: 'capmap',       // Capability Map
    4: 'opmodel',      // Operating Model
    5: 'gap',          // Gap Analysis
    6: 'valuepools',   // Value Pools
    7: 'roadmapvis'    // Roadmap Visualization
  };
  return tabMapping[stepNum] || 'exec';
}
```

**Usage**: 
- Replaces all `showTab('step2')` → `showTab(getTabNameForStep(2))` → `showTab('bmc')`
- Ensures navigation always uses valid tab IDs

### 2. Unified Data Structures

All workflow modes now save to the **same model properties**:

#### Step 1: Business Objectives / Strategic Intent
```javascript
model.businessObjectives = {
  primaryObjectives: [...],      // Array of objectives
  keyChallenges: [...],          // Array of challenges
  strategicContext: {            // Object with context
    industry: "...",
    market_position: "...",
    current_state: "..."
  },
  createdAt: "2026-04-22T..."
};

model.strategicIntent = {
  strategic_ambition: "...",
  strategic_themes: [...],
  success_metrics: [...],
  strategic_constraints: [...]
};
```

#### Step 2: Business Model Canvas
```javascript
model.bmc = {
  value_propositions: [...],
  customer_segments: [...],
  customer_relationships: [...],
  channels: [...],
  key_activities: [...],
  key_resources: [...],
  key_partners: [...],
  cost_structure: [...],
  revenue_streams: [...],
  // Metadata
  source: "business-object",              // Tracks which workflow created it
  alignedToObjectives: true,              // From Business Object mode
  createdAt: "2026-04-22T..."
};
```

#### Step 3: Capability Map
```javascript
model.capabilities = [
  {
    id: "cap_1234567890_0",
    name: "Customer Onboarding",
    domain: "Business",
    maturity: 2,
    verified: false,
    source: "business-object",
    alignedToObjectives: true
  },
  // ...more capabilities
];
```

### 3. Structured Data Saving

Updated `confirmStepOutputFromChat(stepNum, outputText)` to:
1. ✅ Parse AI output into structured data
2. ✅ Save to correct `model` properties
3. ✅ Add metadata (source, alignment, timestamps)
4. ✅ Save to database via `saveModelToDB()`
5. ✅ Render to appropriate view
6. ✅ Highlight the correct tab
7. ✅ Add console logging for debugging

**Example for Step 2 (BMC)**:
```javascript
if (stepNum === 2) {
  model.bmc = {
    value_propositions: extractBullets(outputText, 'Value Propositions'),
    customer_segments: extractBullets(outputText, 'Customer Segments'),
    // ...other fields
    source: model.workflowMode || 'standard',
    alignedToObjectives: model.businessObjectives ? true : false,
    createdAt: new Date().toISOString()
  };
  model.bmcConfirmed = true;
  console.log('[EA Pipeline] BMC saved:', model.bmc);
  
  // Save to database
  saveModelToDB(false, true);
  
  // Render BMC
  if (typeof renderBMCCanvas === 'function') renderBMCCanvas();
  if (typeof renderBMCPanel === 'function') renderBMCPanel();
  
  // Highlight tab
  const tabName = getTabNameForStep(2);  // Returns 'bmc'
  highlightTab(tabName);
  
  console.log(`[EA Pipeline] BMC rendered and tab '${tabName}' highlighted`);
}
```

### 4. Context Propagation

Business Objectives automatically flow to ALL downstream steps via `callAI()`:

```javascript
async function callAI(sys, user, options = {}) {
  // Build master data context (existing)
  const masterDataContext = includeProjectContext ? 
    buildMasterDataPromptContext() : '';
  
  // NEW: Build Business Objectives context
  const businessObjectivesContext = includeProjectContext ? 
    buildBusinessObjectivesContext() : '';
  
  // Combine contexts
  const contextSections = [masterDataContext, businessObjectivesContext]
    .filter(Boolean);
  const fullContext = contextSections.length > 0 ? 
    contextSections.join('\n\n') : '';
  
  // Instructions include both contexts
  const instructions = `${sys}${languageInstruction}\n\nProject Context:\n${fullContext}`;
  
  // User prompt includes alignment constraint
  const input = `${user}\n\nAnalysis Constraints:\n- Avoid generic advice\n- Use the provided master data and business context\n- Tailor output to the selected industry and business areas\n${businessObjectivesContext ? '- Align ALL outputs with the Business Objectives listed above' : ''}`;
  
  // Call GPT-5 via Responses API
  // ...
}
```

**Result**: Every AI call for BMC, Capabilities, Gap Analysis, etc. automatically includes Business Objectives context.

### 5. Tab Highlighting

All steps now highlight their respective tabs:

```javascript
// After saving and rendering
const tabName = getTabNameForStep(stepNum);
highlightTab(tabName);
console.log(`[EA Pipeline] Step ${stepNum} content rendered and tab '${tabName}' highlighted`);
```

**Visual Result**: Users immediately see which tabs have new content.

---

## Workflow Mode Differences

All modes follow the **same 7 steps** but differ in **interaction style**:

| Aspect | Standard Mode | Autopilot Mode | Business Object Mode |
|--------|---------------|----------------|---------------------|
| **Questions per step** | 5 max | 0 (auto-generate) | 3 max |
| **Interaction** | Interactive Q&A | Fully automated | Focused Q&A |
| **Initial Input** | Minimal | Company description | Business description |
| **Strategic Intent** | AI-generated | AI-generated | Extracted + structured |
| **Context Passing** | Master data | Master data | Master data + Business Objectives |
| **Output Structure** | ✅ Same | ✅ Same | ✅ Same |
| **Tab Navigation** | ✅ Same | ✅ Same | ✅ Same |
| **Data Storage** | ✅ Same | ✅ Same | ✅ Same |

---

## Testing & Validation

### Console Logging

The pipeline includes comprehensive logging for debugging:

```javascript
console.log('[EA Pipeline] Saving Step 2 output...');
console.log('[EA Pipeline] BMC saved:', model.bmc);
console.log('[EA Pipeline] Step 2 saved to database');
console.log('[EA Pipeline] BMC rendered and tab \'bmc\' highlighted');
```

**How to test**:
1. Open browser console (F12)
2. Start any workflow mode
3. Complete steps
4. Watch for `[EA Pipeline]` logs
5. Verify:
   - ✅ Data saved correctly
   - ✅ Database updated
   - ✅ Views rendered
   - ✅ Tabs highlighted

### E2E Test Flow

**Business Object Mode Example** (Resurs Bank):

1. **Start**: Click "Start Workflow" → Select "Business Object Mode"
2. **Step 1**: Submit comprehensive business description
3. **Extraction**: AI extracts objectives, challenges, context
4. **Save**: `model.businessObjectives` populated
5. **Render**: Executive Summary tab shows Business Objectives section
6. **Highlight**: Executive tab gets highlight class
7. **Step 2**: Click "Continue to BMC"
8. **Questions**: AI asks 1-3 focused questions about value propositions, customer segments, activities
9. **Synthesis**: AI generates BMC aligned with Business Objectives
10. **Save**: `model.bmc` populated with structured data
11. **Render**: BMC tab displays canvas and panel
12. **Highlight**: BMC tab gets highlight class
13. **Navigate**: User can click BMC tab to view generated content
14. **Step 3+**: Repeat for Capabilities, Operating Model, Gap Analysis, etc.

---

## Benefits

### For Users
- ✅ **Consistent Experience**: Same tabs regardless of workflow mode
- ✅ **Clear Progress**: Highlighted tabs show completed steps
- ✅ **Easy Navigation**: Click any tab to view generated content
- ✅ **Seamless Transitions**: Move between steps smoothly

### For Development
- ✅ **Single Codebase**: One rendering pipeline for all modes
- ✅ **Maintainable**: Changes to one mode don't break others
- ✅ **Debuggable**: Comprehensive logging tracks data flow
- ✅ **Extensible**: Easy to add new steps or modes

### For Business
- ✅ **Strategic Alignment**: Business Objectives propagate to all artifacts
- ✅ **Traceability**: Clear lineage from objectives → capabilities → gaps → roadmap
- ✅ **Quality**: Consistent data structures enable reliable analytics
- ✅ **Governance**: Single source of truth for EA model

---

## Technical Architecture

### Data Flow Diagram

```
User Input (Any Workflow Mode)
        ↓
AI Processing (GPT-5 + Business Objectives Context)
        ↓
Structured Output (JSON/Text)
        ↓
confirmStepOutputFromChat(stepNum, outputText)
        ├─→ Parse & Structure Data
        ├─→ Save to model.{bmc|capabilities|operatingModel|...}
        ├─→ saveModelToDB() → IndexedDB
        ├─→ render{BMC|CapMap|...}() → UI Update
        └─→ highlightTab(getTabNameForStep(stepNum)) → Visual Feedback
                ↓
        User sees generated content in tab
                ↓
        User proceeds to next step
```

### Function Call Chain

```
handleDiscoveryMessage(userMessage)
  ├─→ callAI(systemPrompt, userPrompt, {taskType: 'discovery'})
  │     └─→ buildBusinessObjectivesContext() [if Business Object mode]
  │           └─→ Includes objectives in AI prompt
  │
  └─→ [After 3 questions or synthesis]
        └─→ confirmStepOutputFromChat(stepNum, outputText)
              ├─→ Parse output
              ├─→ Save to model
              ├─→ saveModelToDB(false, true)
              ├─→ Render views
              │     ├─→ renderBMCCanvas()
              │     ├─→ renderCapMap()
              │     └─→ ...
              │
              └─→ highlightTab(getTabNameForStep(stepNum))
```

---

## Migration Notes

### Breaking Changes
- ❌ Old: `showTab('step2')` → Now: `showTab('bmc')`
- ❌ Old: No structured data saving → Now: Always save to `model.*`
- ❌ Old: No tab highlighting → Now: Always highlight after save

### Backward Compatibility
- ✅ Existing `model.bmc`, `model.capabilities` structures unchanged
- ✅ Existing rendering functions (`renderBMCCanvas`, etc.) work as-is
- ✅ Existing database operations (`saveModelToDB`) work as-is

### New Features
- ✅ `getTabNameForStep(stepNum)` - Maps step numbers to tab IDs
- ✅ `buildBusinessObjectivesContext()` - Formats objectives for AI
- ✅ Enhanced `callAI()` - Auto-includes Business Objectives
- ✅ Enhanced `confirmStepOutputFromChat()` - Unified save/render/highlight

---

## Future Enhancements

### Phase 1: Completed ✅
- [x] Tab mapping function
- [x] Unified data structures
- [x] Structured data saving
- [x] Tab highlighting
- [x] Context propagation
- [x] Console logging

### Phase 2: Planned
- [ ] JSON schema validation for AI outputs
- [ ] Undo/redo for step edits
- [ ] Step comparison (Standard vs Autopilot vs Business Object)
- [ ] Export pipeline report (objectives → BMC → capabilities → gaps → roadmap)
- [ ] Template library (pre-configured objectives for common scenarios)

### Phase 3: Advanced
- [ ] Multi-model comparison (test different GPT versions)
- [ ] A/B testing framework (which workflow mode produces better results)
- [ ] Quality scoring (how well BMC aligns with objectives)
- [ ] Automated validation (check for contradictions, gaps, ambiguities)

---

## Troubleshooting

### Issue: "Tab not found: step2"
**Cause**: Code trying to navigate to non-existent tab  
**Solution**: Use `getTabNameForStep(2)` → Returns `'bmc'`  
**Status**: ✅ Fixed

### Issue: AI generates content but nothing appears in tabs
**Cause**: Structured data not being saved to `model.*`  
**Solution**: Use `confirmStepOutputFromChat()` to parse and save  
**Status**: ✅ Fixed

### Issue: Tabs not highlighting after generation
**Cause**: Missing `highlightTab()` calls  
**Solution**: Call `highlightTab(getTabNameForStep(stepNum))` after render  
**Status**: ✅ Fixed

### Issue: BMC/Capabilities rendered incorrectly
**Cause**: Wrong rendering function names  
**Solution**: Use correct functions: `renderBMCCanvas()`, `renderCapMap()`  
**Status**: ✅ Fixed

---

## Summary

The Unified EA Pipeline ensures that **all workflow modes** (Standard, Autopilot, Business Object) follow the **same 7-step process**, produce **identical data structures**, and render to the **same tabs**—providing a consistent, maintainable, and user-friendly experience regardless of which workflow the user chooses.

**Key Principle**: Different paths, same destination. 🎯

---

**Document Version**: 1.0  
**Date**: April 22, 2026  
**Author**: GitHub Copilot  
**Status**: ✅ Implemented and Tested
