# APQC Integration - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Add Excel File
Place APQC Excel in: `APAQ_Data/source/`
```bash
node scripts/convert_apqc_to_json.js
```

### 3. Start Platform
```bash
npm run dev:open
```

---

## 📋 What Users See

### Standard Mode
1. Start workflow → **Modal: "Load APQC Framework?"**
2. Click "Load APQC Framework" → ✅ Capabilities loaded
3. See **"Powered by APQC"** banner on tabs
4. Capability Map shows APQC capabilities with badges

### Autopilot Mode
1. Start autopilot → APQC **auto-loads** (no prompt)
2. Framework enriches all 7 steps
3. AI generates APQC-aligned capabilities
4. Banner visible on completion

---

## 🎯 Key Features

### Filtering
- **Business Type:** Manufacturing, Services, Retail, etc.
- **Strategic Intent:** Growth, Innovation, Efficiency, etc.
- **Access:** Click "Configure" button on APQC banner

### Integration Status
- Check: `dataManager.hasAPQCIntegration()` → returns `true/false`
- Get Details: `dataManager.getAPQCStatus()` → returns object

### Manual Loading
```javascript
// Load with default settings
await loadAPQCForProject();

// Load with filters
await loadAPQCForProject({
  businessType: 'Technology',
  strategicIntent: 'Innovation'
});
```

---

## 🔧 Troubleshooting

### Problem: No APQC modal appears
**Solution:**
```javascript
// Manually trigger
await loadAPQCForProject();
```

### Problem: Banners not showing
**Solution:**
```javascript
// Check status
console.log(dataManager.getAPQCStatus());

// Force refresh
initializeAPQCIntegration();
```

### Problem: No capabilities loaded
**Solution:**
1. Check browser console for errors
2. Try filter: "All Industries"
3. Verify JSON files exist in `APAQ_Data/`

---

## 📁 File Locations

| File | Location |
|------|----------|
| Framework JSON | `APAQ_Data/apqc_pcf_master.json` |
| Metadata | `APAQ_Data/apqc_metadata_mapping.json` |
| Enrichment | `APAQ_Data/apqc_capability_enrichment.json` |
| Converter | `scripts/convert_apqc_to_json.js` |
| DataManager | `js/EA_DataManager.js` (lines 664-906) |
| UI Functions | `NexGenEA/NexGen_EA_V4.html` (lines 16428+) |

---

## 🎨 UI Components

### Banner Locations
- **Capability Map Tab** (`#apqc-banner-capmap`)
- **Heatmap Tab** (`#apqc-banner-heatmap`)
- **Architecture Layers Tab** (`#apqc-banner-layers`)

### Modals
- **Load Confirmation:** Shows on Standard mode start
- **Settings Modal:** Click "Configure" on banner

---

## 📊 Data Structure

### Capability Fields Added
```javascript
{
  source: 'APQC',           // Source identifier
  apqc_code: '1.1',         // APQC code
  apqc_id: '1.1',           // APQC ID
  business_types: [...],    // Applicable industries
  ai_enabled: true,         // AI transformation flag
  ai_maturity: 4            // AI maturity level (1-5)
}
```

### Integration Status Object
```javascript
{
  integrated: true,
  version: '8.0',
  capability_count: 152,
  filters: {
    businessType: 'Technology',
    strategicIntent: 'Growth'
  },
  message: 'Powered by APQC PCF 8.0'
}
```

---

## 🔄 Workflow Hooks

### Standard Mode Hook
```javascript
// In Step 1 (Strategic Intent)
async function startStep1() {
  // ... existing code ...
  await enhanceStandardModeWithAPQC();
}
```

### Autopilot Mode Hook
```javascript
// In runFullAutopilotFlow()
async function runFullAutopilotFlow() {
  const context = window._autopilotState?.context;
  await enhanceAutopilotModeWithAPQC(context);
  // ... continue autopilot ...
}
```

---

## 📖 API Reference

### DataManager Methods
```javascript
// Load framework
await dataManager.loadAPQCFramework();
await dataManager.getAPQCFramework();

// Filter capabilities
await dataManager.getAPQCCapabilitiesByBusinessType('Services');
await dataManager.getAPQCCapabilitiesByIntent('Innovation');

// Enrich project
await dataManager.enrichProjectWithAPQC(projectId, options);

// Status checks
dataManager.hasAPQCIntegration();
dataManager.getAPQCStatus();
dataManager.getProjectAPQCCapabilities();
```

### UI Functions
```javascript
// Initialize
initializeAPQCIntegration();

// Load
await loadAPQCForProject(options);

// Settings
showAPQCSettings();
applyAPQCSettings();

// Integration
integrateAPQCCapabilities();

// Banners
updateAPQCBanners(status);
```

---

## 🎓 Best Practices

### 1. Check Before Loading
```javascript
if (!dataManager.hasAPQCIntegration()) {
  await loadAPQCForProject();
}
```

### 2. Cache Framework
```javascript
// Framework is cached in sessionStorage after first load
const framework = await dataManager.getAPQCFramework();
```

### 3. Filter Early
```javascript
// Apply filters during project creation
await dataManager.enrichProjectWithAPQC(projectId, {
  businessType: 'Manufacturing',
  strategicIntent: 'Efficiency'
});
```

### 4. Update UI
```javascript
// After any APQC operation
renderCapMap();
renderHeatmap();
renderLayers();
```

---

## 📞 Support

**Documentation:**
- Full Guide: `APAQ_Data/INTEGRATION_GUIDE.md`
- Summary: `APAQ_Data/IMPLEMENTATION_SUMMARY.md`
- Framework Info: `APAQ_Data/README.md`

**Console Debugging:**
```javascript
// Check APQC status
console.log(dataManager.getAPQCStatus());

// Check project data
console.log(dataManager.getCurrentProject().data.apqc);

// Check capabilities
console.log(dataManager.getProjectAPQCCapabilities());
```

---

## ✅ Verification Checklist

- [ ] `npm install` completed successfully
- [ ] APAQ_Data folder exists with JSON files
- [ ] Platform starts without errors
- [ ] Standard mode shows APQC modal
- [ ] Autopilot mode auto-loads APQC
- [ ] Banners appear on integrated tabs
- [ ] Settings modal opens and works
- [ ] Capabilities appear in Capability Map
- [ ] Filtering works (business type & intent)

---

**Version:** 1.0  
**Status:** Production-ready  
**Date:** April 7, 2026
