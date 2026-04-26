# Phase 1 MVP - Visual Reference Guide

## 📱 UI Components Overview

### 1. **Top Actions Bar** (Always visible in Cap Map tab)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  [🪄 Generate Step 2 Analysis]  [🔄 Regenerate]  [✓✓ Validate Data]  [🔒 Approve Step 2] │
│                                                                                            │
│  View: [APQC View] [Business View]    ☑️ Benchmark Overlay                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Button States:**
- Generate = Enabled when NO capabilities exist
- Regenerate = Enabled when capabilities exist
- Validate = Always enabled (shows warnings/errors)
- Approve = Enabled when NO errors found
- After Approval → Shows "🔓 Unlock" button instead

---

### 2. **Validation Panel** (Shows below actions bar when issues found)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚠️  Validation Results                                                              [×] │
│                                                                                            │
│  ❌ Blocking Errors (2)                                                                   │
│  • Missing maturity score for "Customer Onboarding"                          [Fix →]     │
│  • Missing strategic importance for "Payment Processing"                     [Fix →]     │
│                                                                                            │
│  ⚠️  Warnings (3)                                                                         │
│  • Objective "Increase Revenue" is not mapped to any capability              [Fix →]     │
│  • Core capability "Risk Management" has no objective mappings               [Fix →]     │
│  • Target maturity (2) is less than current (3) for "Data Analytics"        [Fix →]     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. **Architecture Tabs** (Updated with 2 new tabs)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  [📚 Layers]  [🗂️ Cap Map]  [📊 Objectives]  [🔀 Graph]  [📋 Priority]        │
│                            ↑ NEW            ↑ NEW                              │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. **TAB 2: Objective Mapping Matrix**

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Objective Mapping Matrix                                                                 │
│  Map capabilities to business objectives with High/Medium/Low strength                   │
│                                                                                            │
│  [🪄 Auto-Map]  [🧹 Clear All]  [💾 Export]                                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┬────────────────┬────────────────┬────────────────┬────────────┐
│                           │    OBJ-1       │    OBJ-2       │    OBJ-3       │   OBJ-4    │
│      Capability           │ Increase       │ Reduce         │ Improve        │ Expand     │
│                           │ Revenue        │ Costs          │ Quality        │ Market     │
├──────────────────────────┼────────────────┼────────────────┼────────────────┼────────────┤
│ Customer Onboarding       │  🟩 ⭐ High   │  ⬜ ○ None    │  🟦 ☆ Low     │  ⬜ ○ None │
│ 1.1.2                     │                │                │                │            │
├──────────────────────────┼────────────────┼────────────────┼────────────────┼────────────┤
│ Payment Processing        │  🟨 ◐ Medium  │  🟩 ⭐ High   │  ⬜ ○ None    │  🟦 ☆ Low  │
│ 3.2.1                     │                │                │                │            │
├──────────────────────────┼────────────────┼────────────────┼────────────────┼────────────┤
│ Risk Management           │  ⬜ ○ None    │  🟨 ◐ Medium  │  🟩 ⭐ High   │  ⬜ ○ None │
│ 4.1.1                     │                │                │                │            │
├──────────────────────────┼────────────────┼────────────────┼────────────────┼────────────┤
│ Data Analytics            │  🟦 ☆ Low     │  🟦 ☆ Low     │  🟨 ◐ Medium  │ 🟩 ⭐ High │
│ 6.2.3                     │                │                │                │            │
└──────────────────────────┴────────────────┴────────────────┴────────────────┴────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Mapping Strength:  🟩 High    🟨 Medium    🟦 Low    ⬜ None                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Click any cell to cycle: None → Low → Medium → High → None
- Color changes instantly
- Auto-saved to model

---

### 5. **TAB 6: Prioritization Table**

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Capability Prioritization                                                                │
│  Decision-grade capability prioritization based on importance, gap, and cost              │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Filter by Classification:  [All (12) ▼]  [Invest (4)]  [Optimize (5)]  [Maintain (3)]  │
│                                                                            [💾 Export CSV] │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────┬────────────┬─────────┬────────┬────────────┬───────────────┐
│  Capability      │ Priority │ Importance │ Maturity│  Cost  │ Classification│ Key Actions │
│                  │  Score ↓ │            │  Gap    │        │            │               │
├──────────────────┼──────────┼────────────┼─────────┼────────┼────────────┼───────────────┤
│ Customer         │    45    │  🟣 Core   │  +3 🔴  │ $$$ H  │ 🔴 INVEST  │ • Conduct     │
│ Onboarding       │  ████    │            │         │        │            │   assessment  │
│ 1.1.2            │          │            │         │        │            │ • Define      │
│                  │          │            │         │        │            │   roadmap     │
├──────────────────┼──────────┼────────────┼─────────┼────────┼────────────┼───────────────┤
│ Payment          │    38    │ 🔵 Strat.  │  +2 🟠  │ $$ M   │ 🔴 INVEST  │ • Conduct     │
│ Processing       │  ███▒    │            │         │        │            │   assessment  │
│ 3.2.1            │          │            │         │        │            │ • Identify QW │
├──────────────────┼──────────┼────────────┼─────────┼────────┼────────────┼───────────────┤
│ Risk             │    28    │ 🔵 Strat.  │  +1 🟡  │ $$ M   │ 🟡 OPTIMIZE│ • Identify    │
│ Management       │  ██▒▒    │            │         │        │            │   opportunities│
│ 4.1.1            │          │            │         │        │            │ • Benchmark   │
├──────────────────┼──────────┼────────────┼─────────┼────────┼────────────┼───────────────┤
│ Data             │    15    │ ⚪ Supp.   │   0 🟢  │ $ L    │ 🟢 MAINTAIN│ • Monitor     │
│ Analytics        │  █▒▒▒    │            │         │        │            │   performance │
│ 6.2.3            │          │            │         │        │            │ • Maintain    │
└──────────────────┴──────────┴────────────┴─────────┴────────┴────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🔴 Invest: 4    🟡 Optimize: 5    🟢 Maintain: 3     │     Showing 12 of 12 capabilities│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Sorting:**
- Click any column header to sort ascending
- Click again to sort descending
- Current sort column shows ↑ or ↓ arrow

**Color Coding:**
- Priority Score: 🔴 Red (40+) → 🟠 Orange (25-39) → 🟡 Yellow (15-24) → 🟢 Green (<15)
- Maturity Gap: 🔴 High (>2) → 🟡 Medium (1-2) → 🟢 Low (0)
- Classification: 🔴 Invest → 🟡 Optimize → 🟢 Maintain

---

## 🎯 User Workflows

### Workflow 1: Generate & Review Step 2
```
1. Navigate to Cap Map tab
   ↓
2. Click "Generate Step 2 Analysis"
   ↓
3. Wait for AI (60-120 seconds)
   ↓
4. Review capability map grid
   ↓
5. Click "Validate Data" to check for issues
   ↓
6. Fix any errors shown in validation panel
   ↓
7. Click "Approve Step 2" when satisfied
```

### Workflow 2: Map Capabilities to Objectives
```
1. Click "Objectives" tab
   ↓
2. Option A: Manual Mapping
   - Click cells to set strength
   ↓
   OR Option B: Auto-Mapping
   - Click "Auto-Map" button
   ↓
3. Review and adjust mappings
   ↓
4. Export matrix via "Export" button
```

### Workflow 3: Prioritize Capabilities
```
1. Click "Priority" tab
   ↓
2. Review priority scores and classifications
   ↓
3. Sort by different columns to analyze
   ↓
4. Filter by classification (e.g., show only "Invest")
   ↓
5. Export table for stakeholder review
```

### Workflow 4: Iterate & Improve
```
1. Make changes to capabilities in Layers tab
   ↓
2. Click "Regenerate" in Cap Map
   ↓
3. Add version note (e.g., "Added new capabilities")
   ↓
4. Previous version saved to history
   ↓
5. Review updated prioritization
```

---

## 💡 Power User Tips

### Tip 1: Validation Before Approval
Always click "Validate Data" before approving. The validation panel will show:
- ❌ **Errors** that block approval
- ⚠️ **Warnings** that suggest improvements

Click the "Fix →" button next to any issue to navigate directly to the problem.

### Tip 2: Auto-Mapping Efficiency
Use "Auto-Map" in the Objective Matrix to get a quick first pass:
- Matches capabilities to objectives based on keyword similarity
- Creates Low/Medium mappings automatically
- Review and adjust to High where appropriate

### Tip 3: Prioritization Filtering
Use the classification filter to focus on specific action groups:
- **Invest**: High-priority capabilities needing significant investment
- **Optimize**: Mid-priority capabilities for incremental improvement
- **Maintain**: Low-priority capabilities at acceptable maturity

### Tip 4: Version Management
Before regenerating, add meaningful version notes:
- "Initial generation"
- "Added finance capabilities"
- "Adjusted maturity scores based on SME feedback"

Previous versions are kept in history (max 10) for rollback if needed.

### Tip 5: Export for Stakeholders
Both the Objective Matrix and Prioritization Table have export buttons:
- Downloads as CSV for Excel analysis
- Share with stakeholders for review
- Use in presentations and reports

---

## 🔧 Troubleshooting

### Issue: "Generate Step 2 Analysis" button is disabled
**Cause:** Capabilities already exist  
**Solution:** Use "Regenerate" button instead, or clear existing capabilities first

### Issue: Objective Matrix shows "No Business Objectives Found"
**Cause:** Step 1 not completed or objectives not defined  
**Solution:** Complete Step 1: Business Context first

### Issue: Priority scores seem incorrect
**Cause:** Missing strategic importance or maturity scores  
**Solution:** Click "Validate Data" to identify missing fields, fix via "Fix →" buttons

### Issue: Cannot approve Step 2
**Cause:** Validation errors present  
**Solution:** Click "Validate Data", review error list, fix all blocking errors

### Issue: Changes not persisting after page reload
**Cause:** Browser localStorage disabled or browser in private mode  
**Solution:** Enable localStorage or use normal browsing mode

---

## 📊 Example Priority Score Calculation

For capability "Customer Onboarding":
- Strategic Importance: CORE → 10 points
- Maturity Gap: Target(5) - Current(2) = 3 → 6 points (×2)
- Objective Mappings: 2 objectives → 5 points
- Cost Estimate: High → -5 points

**Total Score:** (10 × 3) + (3 × 2) + 5 - 5 = **42 points** → 🔴 Critical Priority

---

## 🎨 Color Legend Summary

### Priority Scores
- 🔴 **40+** - Critical (immediate action required)
- 🟠 **25-39** - High (plan in next quarter)
- 🟡 **15-24** - Medium (plan in 6-12 months)
- 🟢 **<15** - Low (monitor and maintain)

### Objective Mapping Strength
- 🟩 **High** - Core strategic alignment
- 🟨 **Medium** - Supporting alignment
- 🟦 **Low** - Weak/tangential alignment
- ⬜ **None** - No mapping

### Classification
- 🔴 **Invest** - Significant investment needed
- 🟡 **Optimize** - Incremental improvements
- 🟢 **Maintain** - Current state acceptable

### Importance Badges
- 🟣 **Core** - Mission-critical capabilities
- 🔵 **Strategic** - Key differentiators
- ⚪ **Supporting** - Enablers

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-26  
**Implementation Status:** ✅ Complete - Ready for Testing
