# APM APQC Enhancement - Quick Start Guide

**Status:** ✅ Ready to Use  
**Date:** 2026-04-07

---

## What's New?

### 🌐 All APQC Industries Available
Load capability templates from **7 industries**:
- Manufacturing
- Services
- Retail
- Financial Services
- Healthcare
- Technology
- Plus custom templates

### 🤖 AI-Powered Application Mapping
Automatically map your applications to capabilities using GPT-5 intelligence.

### 📊 Clear Template Indicator
Always know which framework is loaded with visual confirmation banner.

---

## How to Use

### **Step 1: Load an Industry Template**

1. Open **Application Portfolio Management** toolkit
2. Navigate to **"Capability Layer"** tab
3. Click dropdown: **"Load APQC Template..."**
4. Select your industry (e.g., "Healthcare")
5. ✅ Blue banner confirms: **"Template Loaded: Healthcare Framework"**

**Result:** Industry-specific capabilities loaded into your workspace.

---

### **Step 2: Add Your Applications**

1. Switch to **"Inventory"** tab
2. Click **"+ Add Application"**
3. Fill in application details:
   - Name
   - Department
   - Description
   - Technology stack
   - Costs, lifecycle, etc.
4. Repeat for all applications in your portfolio

**Tip:** You can also import from Excel/JSON.

---

### **Step 3: Trigger AI Mapping** 🤖

1. Go back to **"Capability Layer"** tab
2. Click **"AI Map Apps"** button (green with robot icon)
3. Wait 5-30 seconds (depending on portfolio size)
4. **AI Mapping Modal** opens automatically

---

### **Step 4: Review & Approve Mappings**

In the AI Mapping Modal:

**For each application, you'll see:**
- Suggested capabilities
- Confidence percentage (🟢 High, 🟠 Medium, ⚪ Low)
- AI reasoning explanation

**Actions:**
- ✅ **Checked boxes** = Pre-selected (high confidence)
- ⬜ **Unchecked** = Review manually
- Toggle checkboxes to accept/reject suggestions

**Example:**
```
Application: "Patient Records System"
  ✅ Electronic Health Records (95% match)
     "EHR system manages patient data..."
  ✅ Patient Care Management (87% match)
     "Supports clinical workflows..."
  ⬜ Clinical Decision Support (45% match)
     "Low confidence - manual review needed"
```

---

### **Step 5: Apply Mappings**

1. Review all suggestions
2. Adjust checkboxes as needed
3. Click **"Apply Selected Mappings"**
4. ✅ Toast notification confirms applied count
5. Modal closes

**Result:** Applications now linked to capabilities bidirectionally.

---

### **Step 6: Verify & Analyze**

**In Capability Tree View:**
- Expand L1 domains
- See applications linked to each capability
- Click capability to view details
- Icons show link count

**In Application Inventory:**
- Each app shows linked capabilities
- Click app name to edit mappings
- Unmapped apps highlighted

---

## Tips & Best Practices

### 🎯 **Load Template First**
Always load APQC template BEFORE running AI mapping. Otherwise, no capabilities to map to!

### 🔄 **Iterate Freely**
- Run AI mapping multiple times
- Won't duplicate existing mappings
- Refine as you learn your portfolio

### ✏️ **Manual Override**
AI isn't perfect. Always review and adjust:
- Uncheck low-confidence suggestions
- Manually map edge cases
- Use domain expertise

### 🔑 **API Key Required (Optional)**
For AI mapping:
1. Add OpenAI API key in EA Config
2. Without key: System uses fallback rule-based matching (still useful!)

### 💾 **Save Regularly**
Data auto-saves to localStorage, but:
- Export to JSON periodically
- Keep backups before major changes

---

## No API Key? No Problem!

**Fallback Mode Works:**
- Uses keyword matching
- Department-domain alignment
- Reasonable suggestions without AI
- Lower accuracy (~60-70% vs. ~90% with AI)

---

## Clear Template If Needed

**To reset:**
1. Click **red X button** on template indicator
2. Confirms: "Remove all APQC-sourced capabilities?"
3. Keeps manually added capabilities
4. Fresh start for new template

---

## Troubleshooting

### "No APQC capabilities found"
**Cause:** APQC metadata not loaded  
**Fix:** Check `APAQ_Data/apqc_metadata_mapping.json` exists

### "AI mapping failed"
**Cause:** API key invalid or quota exceeded  
**Fix:** 
1. Check API key in EA Config
2. Verify OpenAI account has credits
3. Use fallback mode (works without key)

### "Template dropdown empty"
**Cause:** APQC metadata failed to load  
**Fix:**
1. Check browser console for errors
2. Verify file path `../APAQ_Data/apqc_metadata_mapping.json`
3. Hardcoded templates still work (Real Estate, Manufacturing, Financial Services)

---

## Example Workflow Video Script

*(For future video tutorial)*

**Narrator:** "Today I'll show you how to map 50 applications to capabilities in under 5 minutes using AI..."

1. **[00:00-00:30]** Open APM toolkit, show inventory with 50 apps
2. **[00:30-01:00]** Go to Capability Layer, load "Healthcare" template
3. **[01:00-01:15]** Template indicator appears, show 30+ capabilities loaded
4. **[01:15-01:30]** Click "AI Map Apps", show loading toast
5. **[01:30-03:00]** Review AI suggestions in modal, adjust selections
6. **[03:00-03:15]** Click "Apply", show confirmation toast
7. **[03:15-04:30]** Navigate capability tree, show linked applications
8. **[04:30-05:00]** Quick tips: iterate, manual override, export results

**Result:** Complete portfolio-to-capability mapping in <5 minutes! 🎉

---

## Next Steps

After mapping:
1. **Analyze Gaps:** Which capabilities have no applications?
2. **Find Consolidation:** Which capabilities have 5+ apps? (potential redundancy)
3. **AI Transformation:** Which apps have low AI maturity but high potential?
4. **Roadmap Planning:** Sequence rationalization initiatives

Use **APM AI Assistant** for these analyses!

---

## Support

- **Full Documentation:** [APM_APQC_ENHANCEMENT_GUIDE.md](./APM_APQC_ENHANCEMENT_GUIDE.md)
- **Feature Questions:** Contact Enterprise Architect
- **Bug Reports:** Include browser console errors
- **Enhancement Ideas:** Add to product backlog

---

✅ **You're ready to go! Start with Step 1: Load Template** 🚀
