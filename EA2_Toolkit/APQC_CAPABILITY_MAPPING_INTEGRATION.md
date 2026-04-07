# APQC Framework Integration - AI Capability Mapping V2 Toolkit

**Version:** 1.0  
**Date:** 2026-04-07  
**Status:** ✅ Production Ready  

---

## Overview

This document describes the complete APQC Process Classification Framework integration into the **AI Capability Mapping V2** toolkit. Users can now import industry-standard, bransch-specific capabilities directly from APQC framework.

---

## Features Implemented

### 1. **APQC Framework Loading**
- Automatic loading of APQC framework on toolkit initialization
- Uses existing EA_DataManager APQC methods (already integrated)
- Framework cached in sessionStorage for performance
- Console logging for debugging

### 2. **UI Enhancements**

#### Banner Notification
- **Location:** Below header, above capability grid
- **Element ID:** `apqc-banner-cap`
- **Visibility:** Shows when APQC framework is successfully loaded
- **Actions:** 
  - "Konfigurera & Importera" → Opens settings modal
  - Close button → Hides banner

#### APQC Settings Modal
- **Element ID:** `apqc-settings-modal-cap`
- **Fields:**
  - **Bransch (Business Type):** Dropdown with 7 options
    - Manufacturing
    - Services
    - Retail
    - Financial Services
    - Healthcare
    - Technology
    - All (Cross-Industry)
  - **Strategiskt Fokus (Strategic Intent):** Dropdown with 5 options
    - Growth
    - Innovation
    - Efficiency
    - Customer Centricity
    - Sustainability
- **Actions:**
  - "Importera Capabilities" → Imports filtered APQC capabilities
  - "Avbryt" → Closes modal

#### APQC Import Button
- **Location:** Header toolbar (after "Ladda exempel")
- **Label:** "APQC Import"
- **Icon:** fa-database
- **Styling:** Blue border, distinctive from other buttons
- **Action:** Opens APQC settings modal

### 3. **Data Integration Logic**

#### APQC-to-Domain Mapping
APQC L1 categories are mapped to toolkit domains:

| APQC Category (L1) | Toolkit Domain | Rationale |
|-------------------|----------------|-----------|
| 1.0 - Develop Vision and Strategy | Product | Strategic planning drives product development |
| 2.0 - Develop and Manage Products and Services | Product | Direct product management |
| 3.0 - Market and Sell Products and Services | Operations | Marketing and sales operations |
| 4.0 - Deliver Products and Services | Operations | Delivery and fulfillment processes |
| 5.0 - Manage Customer Service | Customer | Customer-facing capabilities |
| 6.0 - Develop and Manage Human Capital | Technology | HR systems and tools |
| 7.0 - Manage Information Technology | Technology | IT capabilities |
| 8.0 - Manage Financial Resources | Finance | Financial management |
| 9.0 - Acquire, Construct, and Manage Assets | Operations | Asset management |
| 10.0 - Manage Enterprise Risk, Compliance, Resiliency | Operations | Risk and compliance |
| 11.0 - Manage External Relationships | Operations | Partner and supplier relations |
| 12.0 - Develop and Manage Business Capabilities | Operations | Business capability management |
| 13.0 - Measure and Benchmark | Operations | Performance measurement |

#### Strategic Intent → Priority Mapping
Strategic intent determines imported capability priority:

| Strategic Intent | Priority Level | Use When... |
|-----------------|---------------|-------------|
| Growth | Strategic | Scaling business, market expansion |
| Innovation | Strategic | Product innovation, R&D focus |
| Efficiency | Important | Cost optimization, process improvement |
| Customer Centricity | Strategic | Customer experience transformation |
| Sustainability | Important | ESG compliance, sustainability goals |

#### Import Behavior
- **Duplicate Detection:** Checks if capability name already exists in domain
- **Default Maturity:** All imported capabilities get maturity level 2
- **Description Format:** `APQC {code}: {name}` or original description if available
- **Auto-Save:** Capabilities automatically saved to localStorage after import
- **Banner Hide:** Banner automatically hidden after successful import

---

## Technical Implementation

### JavaScript Functions Added

#### 1. `initializeAPQCIntegrationCap()`
- **Trigger:** `window.onload`
- **Purpose:** Load APQC framework from EA_DataManager
- **Actions:**
  - Checks if EA_DataManager is available
  - Calls `dataManager.loadAPQCFramework()`
  - Updates banner visibility on success
  - Logs errors to console

#### 2. `updateAPQCBannerCap()`
- **Purpose:** Show/hide APQC banner based on framework availability
- **Logic:** Banner visible if `apqcFrameworkCap.categories.length > 0`

#### 3. `showAPQCSettingsCap()`
- **Purpose:** Open APQC settings modal
- **Actions:** Removes `hidden` class, sets `display: flex`

#### 4. `closeAPQCModalCap()`
- **Purpose:** Close APQC settings modal
- **Actions:** Adds `hidden` class, sets `display: none`

#### 5. `applyAPQCSettingsCap()`
- **Purpose:** Import APQC capabilities based on user selections
- **Workflow:**
  1. Validate business type and strategic intent selections
  2. Call `dataManager.getAPQCCapabilitiesByBusinessType(businessType)`
  3. Map APQC categories to toolkit domains
  4. Set priority based on strategic intent
  5. Filter out duplicates (case-insensitive name match)
  6. Add capabilities to respective domains
  7. Call `render()` to update UI
  8. Call `saveAll()` to persist to localStorage
  9. Show success toast with count
  10. Close modal and hide banner

### Global Variables
```javascript
let apqcFrameworkCap = null;     // Stores loaded APQC framework
let apqcIntegratedCap = false;   // Flag for integration status
```

---

## File Modifications

### Files Updated (2 total)

#### 1. `EA2_Toolkit/AI Capability Mapping V2.html`
**Lines Added:** ~180 lines
- Banner HTML (lines ~322-344)
- Settings modal HTML (lines ~270-320)
- APQC import button (line ~334)
- APQC functions (lines ~1520-1670)
- Initialization call in `window.onload` (line ~1686)

#### 2. `azure-deployment/static/EA2_Toolkit/AI Capability Mapping V2.html`
**Lines Added:** ~180 lines (mirror of above)

---

## User Workflow

### Standard Import Flow

1. **Open Toolkit**
   - Navigate to `AI Capability Mapping V2.html`
   - APQC framework auto-loads in background

2. **See Banner**
   - Blue banner appears: "APQC Process Classification Framework tillgänglig"
   - Click "Konfigurera & Importera" button

3. **Configure Settings**
   - Select **Bransch** (e.g., "Manufacturing")
   - Select **Strategiskt Fokus** (e.g., "Innovation")
   - Click "Importera Capabilities"

4. **Review Imported Capabilities**
   - Capabilities appear in respective domains (Customer, Operations, Product, Finance, Technology)
   - Priority set based on strategic intent (Strategic/Important)
   - Maturity level defaults to 2
   - Toast notification shows count: "✅ Importerade 12 APQC capabilities för Manufacturing (Innovation)"

5. **Customize After Import**
   - Click any capability card to edit
   - Adjust priority, maturity, or description
   - Save changes

### Alternative Entry Points

- **Header Button:** Click "APQC Import" button directly (skips banner)
- **Re-import:** Can import again with different settings (duplicates filtered automatically)

---

## Integration with EA Platform

### Cross-Toolkit Compatibility

The APQC integration complements existing toolkit integrations:

- **Value Chain Integration:** Can use both Value Chain import AND APQC import
- **Export to Wardley Map:** APQC capabilities included in CSV export
- **Export to EA Platform:** APQC capabilities synced via `exportToIntegrationCache()`
- **AI Analysis:** APQC capabilities included in AI analysis prompts

### Data Flow

```
APQC JSON Files (APAQ_Data/)
    ↓
EA_DataManager.loadAPQCFramework()
    ↓
sessionStorage cache
    ↓
initializeAPQCIntegrationCap()
    ↓
apqcFrameworkCap variable
    ↓
User selects business type + intent
    ↓
dataManager.getAPQCCapabilitiesByBusinessType()
    ↓
Domain mapping + priority assignment
    ↓
Capability objects added to domains
    ↓
render() + saveAll()
    ↓
localStorage ('cap_map_v2')
```

---

## Testing Checklist

### Pre-Deployment Tests

- [x] APQC framework loads on page load
- [x] Banner appears when framework loaded
- [x] APQC import button visible in header
- [x] Settings modal opens/closes correctly
- [x] Business type dropdown populated
- [x] Strategic intent dropdown populated
- [x] Import validates both selections required
- [x] Capabilities import to correct domains
- [x] Priority set correctly based on intent
- [x] Duplicate capabilities filtered
- [x] Success toast shows correct count
- [x] Banner hides after successful import
- [x] Capabilities persist to localStorage
- [x] Imported capabilities editable
- [x] No console errors
- [x] Works in both toolkit versions (EA2_Toolkit/ and azure-deployment/)

### Browser Console Verification

Open toolkit in browser and run:
```javascript
// Check APQC framework loaded
console.log('APQC Framework:', apqcFrameworkCap);

// Check integration status
console.log('APQC Integrated:', apqcIntegratedCap);

// Check DataManager
console.log('DataManager:', dataManager);
dataManager.getAPQCStatus();
```

**Expected Output:**
```
✅ APQC Framework loaded for Capability Mapping Toolkit: {framework_version: "8.0", categories: Array(13), ...}
APQC Integrated: true
DataManager: EA_DataManager {apiKey: "...", ...}
{
  loaded: true,
  frameworkVersion: "8.0",
  totalCategories: 13,
  cacheStatus: "active",
  lastUpdated: "2026-04-07T..."
}
```

---

## Troubleshooting

### Issue: Banner doesn't appear

**Diagnosis:**
```javascript
console.log('Banner element:', document.getElementById('apqc-banner-cap'));
console.log('Framework:', apqcFrameworkCap);
```

**Solutions:**
- Verify `APAQ_Data/apqc_pcf_master.json` exists
- Check network tab for 404 errors
- Verify EA_DataManager loaded: `console.log(typeof EA_DataManager)`
- Check if banner manually hidden: `document.getElementById('apqc-banner-cap').classList.contains('hidden')`

### Issue: No capabilities imported

**Diagnosis:**
```javascript
dataManager.getAPQCCapabilitiesByBusinessType('Manufacturing')
  .then(caps => console.log('Filtered caps:', caps));
```

**Solutions:**
- Verify business type matches exactly (case-sensitive)
- Check `APAQ_Data/apqc_metadata_mapping.json` has mappings
- Verify capabilities array not empty in framework
- Check console for errors during import

### Issue: Wrong domain assignment

**Check mapping:**
```javascript
// Verify L1 code extraction
const testCap = { code: '3.2.1', name: 'Test' };
const l1Code = testCap.code.split('.')[0] + '.0'; // Should be "3.0"
console.log('L1 Code:', l1Code);
```

**Solution:**
- Review `domainMapping` object in `applyAPQCSettingsCap()`
- Verify APQC category codes in framework data
- Check L1 extraction logic

### Issue: Duplicates still imported

**Check duplicate detection:**
```javascript
const domain = 'operations';
const testName = 'Test Capability';
const exists = capabilities[domain]?.some(c => 
  c.name.toLowerCase() === testName.toLowerCase()
);
console.log('Already exists:', exists);
```

**Solution:**
- Verify case-insensitive comparison: `.toLowerCase()`
- Check if `capabilities[domainId]` initialized
- Review duplicate filtering logic in import function

---

## Dependencies

### Required Components
1. **EA_DataManager.js** - Must include APQC methods:
   - `loadAPQCFramework()`
   - `getAPQCFramework()`
   - `getAPQCCapabilitiesByBusinessType(businessType)`
   - `getAPQCStatus()`

2. **APQC Data Files** (in `APAQ_Data/`):
   - `apqc_pcf_master.json` - Framework structure
   - `apqc_metadata_mapping.json` - Business type mappings

3. **Browser APIs:**
   - `fetch()` - For loading JSON files
   - `sessionStorage` - For caching framework
   - `localStorage` - For persisting capabilities

### Optional Enhancements
- **Excel file:** For full APQC v8.0 framework conversion (placeholder currently)
- **Analytics integration:** Track APQC usage metrics
- **Custom mappings:** Allow users to customize domain mappings

---

## Future Enhancements

### Planned Features (Backlog)

1. **Custom Domain Mapping**
   - Allow users to configure APQC category → domain mappings
   - Save custom mappings per organization

2. **Bulk Edit APQC Capabilities**
   - After import, show preview panel
   - Allow batch priority/maturity adjustments before final save

3. **APQC Maturity Mapping**
   - Map APQC best practices to suggested maturity levels
   - Use industry benchmarking data

4. **APQC Dependency Matrix**
   - Show dependencies between APQC capabilities
   - Suggest prioritization based on dependencies

5. **Multi-Framework Support**
   - Support other frameworks (TOGAF, Zachman, COBIT)
   - Framework selector in settings modal

6. **APQC Delta Analysis**
   - Compare current capabilities vs. APQC standard
   - Show gaps in coverage

7. **Export APQC Report**
   - Generate PDF/Excel report of imported APQC capabilities
   - Include mapping rationale and priority justification

---

## API Reference

### Functions

#### `initializeAPQCIntegrationCap()`
**Returns:** `Promise<void>`  
**Description:** Loads APQC framework and initializes integration  
**Side Effects:** Sets `apqcFrameworkCap` global, updates banner

#### `updateAPQCBannerCap()`
**Returns:** `void`  
**Description:** Shows/hides banner based on framework availability

#### `showAPQCSettingsCap()`
**Returns:** `void`  
**Description:** Opens APQC settings modal

#### `closeAPQCModalCap()`
**Returns:** `void`  
**Description:** Closes APQC settings modal

#### `applyAPQCSettingsCap()`
**Returns:** `Promise<void>`  
**Description:** Imports APQC capabilities based on user selections  
**Side Effects:** Modifies `capabilities` object, calls `render()`, `saveAll()`

---

## Version History

### v1.0 (2026-04-07)
- ✅ Initial APQC integration
- ✅ Banner notification
- ✅ Settings modal with business type and strategic intent
- ✅ APQC-to-domain mapping logic
- ✅ Duplicate filtering
- ✅ Integration with EA_DataManager
- ✅ Auto-save after import
- ✅ Success notifications
- ✅ Documentation

---

## Support & Maintenance

### Contact
- **Enterprise Architect:** Siamak Khodayari
- **Platform:** EA V5 Platform (NextGen Enterprise Architecture)
- **Related Docs:**
  - `APAQ_Data/INTEGRATION_GUIDE.md` - Complete APQC integration guide
  - `APAQ_Data/IMPLEMENTATION_SUMMARY.md` - Backend implementation details
  - `FILE_MANAGEMENT_GUIDE.md` - File structure and organization

### Known Issues
None currently. Report issues in platform issue tracker.

---

## License & Attribution

- **APQC Framework:** © APQC (American Productivity & Quality Center)
- **Framework Version:** 8.0 (Cross-Industry)
- **Integration Code:** © Advicy Sweden AB
- **Platform:** EA V5 NextGen Enterprise Architecture Platform

---

**Last Updated:** 2026-04-07  
**Document Owner:** EA Platform Team  
**Status:** Production Ready ✅
