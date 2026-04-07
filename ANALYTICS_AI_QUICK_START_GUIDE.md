# Analytics AI Quick Start Guide

**Created:** 2026-04-07  
**Purpose:** Documentation for AI-assisted standalone Analytics usage  
**Platform Version:** NexGenEA V4  

---

## Overview

**NEW FEATURE:** All 4 Analytics tabs now have **AI Quick Start** buttons that allow users to generate test data using natural language prompts — **without completing the 7-step EA Workflow**.

**Benefits:**
- ⚡ **Instant Testing:** Generate minimal EA context in seconds with AI
- 🎯 **Focused Demo:** Test specific Analytics features without full project setup
- 💬 **Natural Language:** Describe what you need in plain English
- 🤖 **AI-Powered:** Leverages Advicy AI to generate realistic test data

---

## Location & Access

### Where to Find It

**All 4 Analytics Tabs:**
1. **Decision Intelligence Analytics** (tab-analytics-di)
2. **Financial Analytics** (tab-analytics-financial)
3. **Scenario Analytics** (tab-analytics-scenarios)
4. **Optimize Analytics** (tab-analytics-optimize)

**UI Location:**
- Each tab has an **EA Context Status** section (top of tab)
- **Quick Test button** appears in top-right corner of this section
- Button styling: Purple background with wand icon (fa-wand-magic-sparkles)

---

## How to Use

### Step 1: Click "Quick Test" Button

Navigate to any Analytics tab → Click **✨ Quick Test** button in EA Context Status section

### Step 2: Describe Your Test Scenario

A modal opens with:
- **Freetext prompt field** - Describe what you want to generate
- **Quick Examples** - Pre-written prompts you can click to use
- **Info box** - Explains how the feature works

**Example Prompts:**
```
Decision Intelligence:
- "Generate 5 retail capabilities for quick DI analysis"
- "Create 8 financial services capabilities with maturity scores"
- "Build 6 manufacturing capabilities focused on Industry 4.0"

Financial Analytics:
- "Generate 5 capabilities with cost estimates for financial analysis"
- "Create retail capabilities with investment and ROI data"
- "Build healthcare capabilities with value pool estimates"

Scenario Analytics:
- "Create 5 capabilities for scenario stress-testing"
- "Generate manufacturing capabilities for disruption modeling"
- "Build financial services capabilities for resilience testing"

Optimize Analytics:
- "Generate 5 capabilities with dependencies for roadmap optimization"
- "Create retail capabilities with strategic importance scores"
- "Build 7 capabilities across different domains for optimization"
```

### Step 3: Generate Test Data

Click **🪄 Generate Test Data** button:
1. AI processes your prompt using specialized system prompt
2. Generates JSON with:
   - **Strategic Intent** (vision, mission, industry, themes)
   - **5-8 Capabilities** with full attribute set (maturity, importance, costs, etc.)
   - **Value Streams** extracted from capabilities
3. Data populates `window.model` object
4. Auto-saves to localStorage (`ea-autosave-default`)
5. Refreshes EA Context Status display

### Step 4: Run Analytics

After data generation:
- Confirmation dialog appears with summary
- Click **OK** to immediately run the Analytics workflow
- Or click **Cancel** and manually click "Run Analysis" button later

---

## Technical Implementation

### Architecture

**Files Modified:**
- `NexGenEA/NexGen_EA_V4.html` (local + azure-deployment)

**New Functions:**
1. **`showAnalyticsQuickStart(tabId)`** (line ~5970)
   - Displays modal with prompt field and examples
   - Tab-specific example prompts
   - Modal HTML with Tailwind CSS styling

2. **`generateAnalyticsQuickStartData(tabId)`** (line ~6060)
   - Builds specialized AI system prompt
   - Calls `callAI()` with temperature 0.7
   - Parses JSON response (handles markdown code blocks)
   - Validates and populates `window.model`
   - Triggers auto-save and context refresh
   - Shows success confirmation with option to run analysis

### AI System Prompt

**Specialized prompt for data generation:**
```
You are an Enterprise Architecture assistant specializing in rapid test data generation.

TASK: Generate minimal EA context for Analytics testing based on user's request.

REQUIRED OUTPUT FORMAT (valid JSON only):
{
  "strategicIntent": { vision, mission, industry, strategicThemes },
  "capabilities": [{ id, name, domain, valueStream, maturity, ... }]
}

RULES:
1. Generate 5-8 capabilities unless user specifies different count
2. Capability names MUST follow [Verb][Object] format
3. Spread capabilities across 3-4 different domains
4. Vary maturity levels (1-5) and strategic importance
5. Make estimates realistic for the industry
6. Keep strategicIntent brief and focused
7. Output ONLY the JSON object, no explanatory text
```

### Data Contract

**Generated JSON Structure:**
```json
{
  "strategicIntent": {
    "vision": "String - brief vision statement",
    "mission": "String - brief mission",
    "industry": "String - detected industry",
    "strategicThemes": ["Theme 1", "Theme 2", "Theme 3"]
  },
  "capabilities": [
    {
      "id": "cap-1",
      "name": "[Verb] [Object]",
      "domain": "Customer|Product|Operations|Risk|Finance|Technology|Support",
      "valueStream": "String - value stream name",
      "maturity": 3,
      "strategicImportance": "high|medium|low",
      "revenueExposure": "high|medium|low",
      "regulatoryExposure": "high|medium|low",
      "operationalCriticality": 3,
      "dependsOnCapabilities": [],
      "fteHoursSavedPct": 15,
      "invoiceVolumeImpactPct": 5,
      "investmentEstimate": 150000,
      "riskExposureEstimate": 500000
    }
  ]
}
```

**Post-Processing:**
- Value streams extracted from capabilities and stored in `model.valueStreams`
- All data persisted to localStorage via `autoSaveModel()`
- EA Context Status refreshed via `_refreshAnalyticsContext(tabId)`

---

## User Experience Flow

### Happy Path

1. User opens Analytics tab (e.g., Decision Intelligence)
2. Sees "Loading context…" → "⚠️ No capabilities found. Generate via EA Workflow or import."
3. Clicks **Quick Test** button
4. Modal opens with prompt field
5. User types: "Generate 5 retail capabilities"
6. Clicks **Generate Test Data**
7. Modal closes → Toast: "🔄 Generating test data with AI..."
8. AI responds in ~3-5 seconds
9. Toast: "✓ Generated 5 capabilities for Retail"
10. Confirmation dialog: "5 capabilities created across 2 value streams. Run analysis now?"
11. User clicks OK → `runAnalyticsTab('decision-intelligence')` executes
12. Analytics workflow runs with generated test data

### Error Handling

**Invalid JSON from AI:**
- Try to extract JSON from markdown code blocks (`/\{[\s\S]*\}/`)
- If parsing fails: Toast error message
- Console logs full AI response for debugging

**Empty Prompt:**
- Toast: "Please describe what you want to generate"
- Modal stays open

**AI Call Failure:**
- Catches error from `callAI()` 
- Toast: "Failed to generate test data: [error message]"
- Console logs full error

---

## Integration with Existing Features

### Compatibility

**Works Alongside:**
- ✅ **CSV Import** (see `ANALYTICS_STANDALONE_GUIDE.md`)
- ✅ **Console Injection** (manual `model.capabilities` assignment)
- ✅ **Full EA Workflow** (7-step process)
- ✅ **APQC Import** (process framework templates)

**Does NOT Conflict With:**
- Autopilot Mode
- Standard Mode
- Step-by-step workflow
- Existing model data (overwrites if present)

### Data Persistence

**Storage:**
- Generated data stored in `window.model` (in-memory)
- Auto-saved to `localStorage['ea-autosave-default']`
- Same persistence mechanism as full EA Workflow

**Lifecycle:**
- Persists across page reloads (localStorage)
- Can be exported via Export functions
- Can be cleared via "New Project" or console

---

## Example Use Cases

### 1. Demo Scenario: Quick Retail Capability Test

**Prompt:**
```
Generate 5 retail capabilities with high strategic importance focused on omnichannel customer experience
```

**Generated Capabilities:**
- Manage Online Customer Journey
- Process Cross-Channel Orders
- Deliver Personalized Recommendations
- Manage Inventory Visibility
- Analyze Customer Behavior

**Analytics Test:**
- Run Decision Intelligence → See quick wins + health scores
- Run Financial → Cost-benefit analysis
- Run Optimize → Roadmap sequencing

### 2. Demo Scenario: Financial Services Stress Test

**Prompt:**
```
Create 6 financial services capabilities for regulatory compliance and risk management scenario testing
```

**Generated Capabilities:**
- Monitor Regulatory Compliance
- Assess Credit Risk
- Manage Fraud Detection
- Process AML Screening
- Report Risk Exposures
- Manage Audit Trails

**Analytics Test:**
- Run Scenarios → Test "regulatory-change" disruption
- Run Financial → Estimate compliance investment
- Run DI → Identify capability gaps

### 3. Demo Scenario: Manufacturing Industry 4.0

**Prompt:**
```
Build 7 manufacturing capabilities across operations and technology domains for optimization testing
```

**Generated Capabilities:**
- Automate Production Planning
- Monitor Equipment Health
- Manage Supply Chain Visibility
- Optimize Quality Control
- Integrate IoT Sensors
- Analyze Production Data
- Manage Predictive Maintenance

**Analytics Test:**
- Run Optimize → Alternative roadmap scenarios
- Run Financial → ROI for automation investment
- Run DI → Technology maturity assessment

---

## Troubleshooting

### Issue: "No capabilities found" after generation

**Cause:** AI response parsing failed or JSON invalid

**Solution:**
1. Open browser console (F12)
2. Check for error: "Failed to parse AI response"
3. Inspect logged response text
4. Verify JSON structure matches data contract
5. Manually fix `window.model.capabilities` if needed

### Issue: Analytics unlock still disabled

**Cause:** Generated capabilities not meeting minimum threshold

**Solution:**
- Check `window.model.capabilities.length > 0`
- Verify `_refreshAnalyticsContext(tabId)` was called
- Manually refresh tab or page

### Issue: AI generates wrong industry/context

**Cause:** Prompt too vague or ambiguous

**Solution:**
- Be more specific in prompt (include industry name)
- Use example prompts as templates
- Add domain keywords (retail, healthcare, manufacturing, etc.)

---

## Future Enhancements

**Potential Improvements:**
1. **Industry Templates:** Dropdown with pre-defined industry profiles
2. **Capability Count Slider:** UI control for 3-15 capabilities
3. **Domain Selection:** Checkboxes to focus on specific domains
4. **Maturity Bias:** Slider to set avg maturity level (1-5)
5. **Strategic Focus:** Radio buttons (Cost Reduction / Growth / Innovation)
6. **Re-generate:** Allow tweaking prompt and re-running without modal
7. **Preview Before Save:** Show generated JSON preview before populating model
8. **Template Library:** Save/load custom quick start templates

---

## Related Documentation

- **ANALYTICS_STANDALONE_GUIDE.md** — CSV import and console injection methods
- **ARCHITECTURE_VERIFICATION_GUIDE.md** — Testing guide post-implementation
- **ai-transformation-architectural-principle.md** — AI-first EA principles (user memory)
- **ea-platform-architecture-principles.md** — Platform architecture decisions (user memory)

---

## Testing Commands

**Manual Test:**
1. Open NexGenEA V4 in browser
2. Navigate to Decision Intelligence Analytics tab
3. Click **Quick Test** button
4. Enter: "Generate 5 retail capabilities"
5. Click **Generate Test Data**
6. Verify: Success toast + confirmation dialog
7. Click OK → Verify: DI analysis runs successfully

**Console Test:**
```javascript
// Trigger quick start programmatically
showAnalyticsQuickStart('decision-intelligence');

// Generate directly (bypass modal)
document.getElementById('quick-start-prompt').value = 'Generate 5 retail capabilities';
generateAnalyticsQuickStartData('decision-intelligence');

// Verify model population
console.log('Capabilities:', window.model.capabilities?.length);
console.log('Industry:', window.model.strategicIntent?.industry);
console.log('Value Streams:', window.model.valueStreams?.map(v => v.name));
```

---

## Version History

**v1.0 (2026-04-07):**
- ✅ Initial implementation
- ✅ All 4 Analytics tabs equipped with Quick Test buttons
- ✅ Modal UI with example prompts
- ✅ AI data generation with specialized system prompt
- ✅ Auto-save and context refresh integration
- ✅ Error handling and validation

---

## Last Updated
2026-04-07 — Initial documentation
