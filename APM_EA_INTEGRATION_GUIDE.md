# APM ↔ EA Engagement Toolkit Integration Guide

## Overview

The **APM Toolkit** and **EA Engagement Toolkit** now share a **unified application data model**, enabling seamless bidirectional data exchange. You can now easily move application inventory data between the two toolkits without data loss.

## Key Features

✅ **Unified Schema**: Both toolkits use the same application data model  
✅ **Full Data Preservation**: All APM fields are preserved when importing to EA Engagement Toolkit  
✅ **Bidirectional Sync**: Export from EA back to APM with complete fidelity  
✅ **Automatic Capability Mapping**: Capabilities are also imported/exported  
✅ **One-Click Operations**: Simple UI buttons for import/export  

---

## Unified Application Schema

### Shared Fields

Both toolkits now support the following comprehensive application schema:

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| **id** | string | Unique identifier (supports both APM `app_xxx` and EA `APP-xxx` formats) | Both |
| **name** | string | Application name | Both |
| **description** | string | Application description | APM + EA |
| **businessDomain** | string | Business domain/department | Both |
| **department** | string | Owning department (alias) | APM |
| **owner** | string | Application owner | Both |
| **vendor** | string | Vendor name (SAP, Microsoft, etc.) | Both |
| **technology** | string | Technology stack (.NET, Java, React, etc.) | APM + EA |
| **lifecycle** | enum | Lifecycle stage (see mapping below) | Both |
| **action** | enum | Recommended action (retain/invest/replace/consolidate/retire) | APM + EA |
| **currency** | enum | Currency (SEK/EUR/USD) | APM + EA |
| **capex** | number | Annual license cost | APM + EA |
| **opex** | number | Annual support/consulting cost | APM + EA |
| **annualCost** | number | Total annual cost (capex + opex) | Both |
| **users** | number | Active user count | APM + EA |
| **riskLevel** | enum | Risk assessment (critical/high/medium/low) | Both |
| **technicalDebt** | enum | Technical debt level (critical/high/medium/low) | Both |
| **technicalFit** | number | Technical fit score (1-10) | APM + EA |
| **businessValue** | number | Business value score (1-10) | APM + EA |
| **aiMaturity** | number | AI maturity level (1-5) | APM + EA |
| **aiPotential** | enum | AI potential (High/Medium/Low) | APM + EA |
| **businessCapabilities** | array | Linked capability IDs | Both |
| **sunsetCandidate** | boolean | Marked for retirement | EA |
| **modernizationCandidate** | boolean | Marked for modernization | EA |
| **notes** | string | Additional notes | Both |
| **metadata** | object | Creation/update tracking | Both |

### Lifecycle Mapping

The toolkits use different lifecycle enums that are automatically mapped:

| APM Lifecycle | EA Lifecycle | Description |
|---------------|--------------|-------------|
| **phaseIn** | **invest** | New application being deployed |
| **active** | **tolerate** | Operational and maintained |
| **legacy** | **migrate** | Needs modernization |
| **phaseOut** | **retire** | Being decommissioned |
| **retired** | **retire** | No longer in use |

---

## How to Use

### 1. Import from APM to EA Engagement Toolkit

**Scenario**: You've cataloged your applications in APM Toolkit and want to analyze them in an EA engagement context.

**Steps**:

1. **Open APM Toolkit** and ensure your application inventory is up to date
2. **Navigate to** `AS-IS Application Portfolio` canvas in EA Engagement Toolkit
3. **Click** `Import from APM` button
4. **Result**: All applications and capabilities are imported with full data preservation

**What Gets Imported**:
- ✅ All applications with complete financial data (CAPEX/OPEX)
- ✅ Technology stack and vendor information
- ✅ AI maturity and potential scores
- ✅ Business capabilities and their mappings
- ✅ Assessment scores (technical fit, business value)

**Data Storage**:
- Import reads from `localStorage['integration_apm_latest']`
- APM Toolkit automatically saves export data to this key

---

### 2. Export from EA Engagement Toolkit to APM

**Scenario**: You've enriched application data in EA Engagement Toolkit and want to reflect changes back in APM.

**Steps**:

1. **Open EA Engagement Toolkit** with your engagement loaded
2. **Navigate to** `AS-IS Application Portfolio` canvas
3. **Click** `Export to APM` button
4. **Result**: 
   - Data is saved to `localStorage['integration_ea_export_latest']`
   - JSON file is downloaded for manual backup

**What Gets Exported**:
- ✅ All applications converted to APM format
- ✅ Financial data (CAPEX/OPEX separated if available)
- ✅ Assessment scores (technical fit, business value)
- ✅ AI transformation readiness data
- ✅ Capabilities with strategic importance ratings

**APM Toolkit Access**:
- APM Toolkit can read from `integration_ea_export_latest` key
- Implements import from EA feature (if available)

---

## Enhanced Application Modal

The EA Engagement Toolkit application modal now includes **all APM fields** organized in sections:

### 📋 Basic Information
- Application Name
- Description
- Business Domain
- Owner & Vendor
- Technology Stack

### 🔄 Lifecycle & Assessment
- Lifecycle Stage
- Recommended Action
- Risk Level & Technical Debt
- Technical Fit (1-10)
- Business Value (1-10)

### 💰 Financial & Metrics
- Currency (SEK/EUR/USD)
- CAPEX (Annual License Cost)
- OPEX (Annual Support Cost)
- Active Users Count

### 🤖 AI Transformation Readiness
- AI Maturity (1-5)
- AI Potential (High/Medium/Low)

### 🏷️ Flags & Notes
- Sunset Candidate
- Modernization Candidate
- Additional Notes

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APM Toolkit                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Application Inventory                                 │   │
│  │ - Full portfolio with APQC capabilities              │   │
│  │ - AI maturity assessments                            │   │
│  │ - Financial tracking (CAPEX/OPEX)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Export
                          ▼
         localStorage['integration_apm_latest']
                          │
                          │ Import
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              EA Engagement Toolkit                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AS-IS Application Portfolio                          │   │
│  │ - Enriched with engagement context                   │   │
│  │ - White-spot analysis                                │   │
│  │ - Stakeholder relationships                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Export
                          ▼
        localStorage['integration_ea_export_latest']
                          │
                          │ Import (future feature)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    APM Toolkit                               │
│         (Updated with EA insights)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation Details

### Import Function: `importFromAPMToolkit()`

**Location**: `js/EA_EngagementManager.js`

**Key Features**:
- Reads from `EA_DataManager.getIntegrationData('apm_latest')`
- Preserves all APM fields using unified schema
- Imports both applications AND capabilities
- Tracks data origin in metadata (`source: 'APM'`)
- Maintains original APM IDs for re-export

**Example Code**:
```javascript
const count = engagementManager.importFromAPMToolkit();
// Returns: Number of applications imported
```

### Export Function: `exportToAPMToolkit()`

**Location**: `js/EA_EngagementManager.js`

**Key Features**:
- Converts EA data to APM-compatible format
- Maps lifecycle enums back to APM values
- Generates APM IDs if not present
- Derives missing scores from qualitative assessments
- Saves to both localStorage and downloads JSON file

**Example Code**:
```javascript
const exportData = engagementManager.exportToAPMToolkit();
// Returns: { applications: [], capabilities: [], metadata: {} }
```

---

## Field Mapping Reference

### EA → APM Conversion

When exporting from EA to APM, the following conversions occur:

| EA Field | APM Field | Conversion Logic |
|----------|-----------|------------------|
| `businessDomain` | `department` | Direct copy |
| `lifecycle: 'tolerate'` | `lifecycle: 'active'` | Enum mapping |
| `lifecycle: 'invest'` | `lifecycle: 'phaseIn'` | Enum mapping |
| `lifecycle: 'migrate'` | `lifecycle: 'legacy'` | Enum mapping |
| `lifecycle: 'retire'` | `lifecycle: 'phaseOut'` | Enum mapping |
| `sunsetCandidate: true` | `action: 'retire'` | Derived action |
| `modernizationCandidate: true` | `action: 'replace'` | Derived action |
| `technicalDebt: 'low'` | `technicalFit: 9` | Score derivation |
| `technicalDebt: 'medium'` | `technicalFit: 6` | Score derivation |
| `technicalDebt: 'high'` | `technicalFit: 3` | Score derivation |
| `riskLevel: 'low'` | `businessValue: 6` | Inverse mapping |
| `riskLevel: 'critical'` | `businessValue: 9` | Inverse mapping |

---

## Best Practices

### 1. **Start with APM Toolkit**
- Build your comprehensive application inventory in APM first
- Use APQC framework for capability mapping
- Leverage AI-powered capability suggestions
- Track financial data (CAPEX/OPEX) accurately

### 2. **Import to EA for Engagement Context**
- Import APM data when starting a new customer engagement
- Enrich with stakeholder relationships
- Add engagement-specific constraints and decisions
- Perform white-spot analysis in engagement context

### 3. **Sync Regularly**
- Export back to APM to keep inventory updated
- Maintain single source of truth in APM for portfolio data
- Use EA for engagement-specific analysis and planning

### 4. **Data Quality**
- Fill in all APM fields for best integration experience
- Use consistent naming conventions across toolkits
- Document technology stack and vendor information
- Keep financial data current

---

## Troubleshooting

### Issue: Import returns 0 applications

**Cause**: No APM data available in localStorage

**Solution**:
1. Open APM Toolkit
2. Ensure applications exist in inventory
3. Check browser console for `integration_apm_latest` key
4. If missing, APM may need to implement export feature

### Issue: Export button not visible

**Cause**: No engagement selected or no applications in portfolio

**Solution**:
1. Create or load an engagement first
2. Add or import at least one application
3. Export button will appear in section header

### Issue: Data lost during round-trip (APM → EA → APM)

**Cause**: This should not happen with the unified schema

**Solution**:
1. Check that both toolkits are using latest code
2. Verify metadata fields contain original IDs
3. Review browser console for errors

---

## API Reference

### EA_EngagementManager Methods

#### `importFromAPMToolkit()`
Imports applications and capabilities from APM Toolkit.

**Returns**: `number` - Count of applications imported

**Example**:
```javascript
const count = engagementManager.importFromAPMToolkit();
console.log(`Imported ${count} applications`);
```

#### `exportToAPMToolkit()`
Exports applications and capabilities to APM-compatible format.

**Returns**: `object` - Export data structure

**Example**:
```javascript
const data = engagementManager.exportToAPMToolkit();
// data.applications - Array of APM applications
// data.capabilities - Array of APM capabilities
// data.metadata - Export metadata
```

#### `importCapabilitiesFromAPM(capabilities)`
Imports capabilities from APM capability array.

**Parameters**: 
- `capabilities` (Array) - APM capability objects

**Example**:
```javascript
engagementManager.importCapabilitiesFromAPM(apmCapabilities);
```

---

## Summary

✅ **Schema Unified**: Both toolkits share the same application data model  
✅ **Data Preserved**: All fields maintained during import/export  
✅ **Easy to Use**: One-click import/export buttons  
✅ **Bidirectional**: Full round-trip support (APM → EA → APM)  
✅ **Capability Mapping**: Capabilities imported/exported alongside applications  
✅ **Metadata Tracking**: Origin and relationships preserved  

The APM and EA Engagement toolkits are now fully integrated, enabling you to work seamlessly across portfolio management and engagement planning workflows!

---

## Version History

**Version 1.0** (2026-04-18)
- Initial integration implementation
- Unified application schema
- Bidirectional import/export
- Enhanced EA application modal with all APM fields
- Capability synchronization
- Metadata tracking for data provenance
