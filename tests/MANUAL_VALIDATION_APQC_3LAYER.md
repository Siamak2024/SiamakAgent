# Manual Validation Guide: APQC 3-Layer Intelligence

## Prerequisites
1. Open AI Capability Mapping V2 tool
2. Have API key configured
3. Have BMC + Value Chain data in integration cache (for Layer 1 AI detection)

## Test Scenario 1: Full 3-Layer Flow (With Context)

**Steps:**
1. Navigate to BMC tool and fill in:
   - Value Proposition: "Cloud-based SaaS platform for project management"
   - Key Activities: "Software development, cloud infrastructure, customer support"
   - Strategic Goal: "Market leader in agile project management tools"
2. Export BMC to integration cache
3. Navigate to Capability Mapping V2
4. Click "APQC Import" button
5. **Expected:** AI detection banner appears after 2-3 seconds
6. **Verify:** Detects "Technology" industry with confidence > 70%
7. **Verify:** Industry dropdown is pre-filled with "Technology"
8. Select Strategic Focus: "Innovation"
9. Click "Importera Capabilities"
10. **Expected:** Console shows:
    - `[APQC Layer 2] Filtered X capabilities`
    - `[APQC Layer 3] Calling AI for scoring and customization...`
    - `[APQC AI Scoring] Y high-relevance capabilities after AI scoring`
11. **Verify:** Capabilities appear in domains with:
    - Customized names (not raw APQC names)
    - Priority assigned based on strategic context
    - No duplicates

## Test Scenario 2: Fallback Without Context

**Steps:**
1. Clear integration cache (or use fresh browser session)
2. Open Capability Mapping V2 directly
3. Click "APQC Import"
4. **Expected:** No AI detection banner (no context available)
5. Manually select:
   - Industry: "Financial Services"
   - Strategic Focus: "Compliance"
6. Click "Importera Capabilities"
7. **Expected:** Console shows:
    - `[APQC Layer 2] Filtered X capabilities`
    - `[APQC Layer 3] Skipping AI (no API key or no context) - using rule-based import`
8. **Verify:** Capabilities imported with:
    - Raw APQC names
    - Default priority = "important" (based on Compliance intent)
    - Maturity = 2

##Test Scenario 3: Fallback Without API Key

**Steps:**
1. Remove API key from localStorage: `localStorage.removeItem('ea_openai_key')`
2. Have BMC context loaded
3. Click "APQC Import"
4. **Expected:** Console shows:
    - `[INFO] No API key - skipping AI industry detection`
    - Manual dropdown selection required
5. Select industry and strategic focus
6. Click "Importera Capabilities"
7. **Expected:** Rule-based import (no AI scoring)

## Test Scenario 4: Filtering Logic Verification

**Steps:**
1. Open browser console
2. Run: `console.table(apqcFrameworkCap.categories.flatMap(c => c.children))`
3. **Verify:** All L2 entries have:
   - `industries` array (contains valid values)
   - `strategic_themes` array (contains valid values)
   - `capability_category` (one of: customer, operations, product, finance, technology)
4. Select Industry: "Manufacturing", Strategic Focus: "Sustainability"
5. **Expected:** Only capabilities with:
   - industries contains "manufacturing" OR "all"
   - strategic_themes contains "sustainability"

## Test Scenario 5: Deduplication

**Steps:**
1. Import APQC capabilities
2. Note number imported (e.g., "Importerade 12 APQC capabilities")
3. Click "APQC Import" again with SAME settings
4. **Expected:** "Importerade 0 APQC capabilities" (all duplicates skipped)

## Test Scenario 6: AI Detection Override

**Steps:**
1. Have BMC context where AI detects "Technology"
2. Click "APQC Import"
3. **Expected:** Banner shows detected industry
4. Click "Andras manuellt" button in banner
5. **Verify:** Dropdown resets, user can select different industry
6. Select "Healthcare" instead
7. **Verify:** Import uses Healthcare filter, not detected Technology

## Expected Console Output (Success)

```
[INFO] BMC context available
[APQC Layer 1] Detected industry: technology (confidence: 87%)
[APQC Layer 2] Filtered 15 capabilities for technology/innovation
[APQC Layer 3] Calling AI for scoring and customization...
[APQC AI Scoring] 12 high-relevance capabilities after AI scoring
[OK] Importerade 12 APQC capabilities for Technology (Innovation)
```

## Expected Console Output (Fallback)

```
[INFO] No API key - skipping AI industry detection
[APQC Layer 2] Filtered 10 capabilities for services/growth
[APQC Layer 3] Skipping AI (no API key or no context) - using rule-based import
[OK] Importerade 10 APQC capabilities for Services (Growth)
```

## Known Issues / Edge Cases

1. **Empty filter result:** If Industry + Strategic Theme combination yields 0 results, shows warning toast
2. **Malformed JSON from AI:** Caught in try/catch, falls back to rule-based import
3. **Network timeout:** User sees error message, retry manually
4. **Low confidence detection (<60%):** Detection banner shows info message, user selects manually

## Regression Tests

- [x] Manual APQC import (without AI) still works
- [x] Existing dropdown values unchanged
- [x] Deduplication logic unchanged
- [x] Domain mapping works with new capability_category field
- [x] No emojis in console output (architectural principle)
- [x] Graceful degradation when API unavailable

---

**Test Date:** 2026-04-08  
**Tester:** _________________  
**Result:** PASS / FAIL  
**Notes:** _______________________________________________
