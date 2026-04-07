# EA V5 Platform - APQC Integration Guide

## Overview
This guide walks you through the complete APQC Process Classification Framework integration for the EA V5 Platform.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Prepare APQC Excel File
Place your APQC Excel file in the source folder:
```
APAQ_Data/source/K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.xlsx
```

### 3. Convert Excel to JSON
Run the converter script:
```bash
node scripts/convert_apqc_to_json.js
```

This will generate:
- `APAQ_Data/apqc_pcf_master.json` - Complete framework with hierarchy
- `APAQ_Data/apqc_capability_enrichment.json` - Enrichment data with metadata

### 4. Start the Platform
```bash
npm run dev:open
```

## Integration Features

### Automatic Loading
APQC capabilities are automatically loaded when:
- **Standard Mode:** User confirms APQC loading at workflow start
- **Autopilot Mode:** Auto-loaded based on industry and region context

### Capability Enrichment
All APQC capabilities include:
- **Business Type Mapping:** Industry-specific relevance
- **Strategic Alignment:** Links to strategic intent and BMC elements
- **AI Transformation:** AI opportunity identification and maturity levels
- **Hierarchical Structure:** L1-L4 process classification

### UI Enhancements
- **Capability Map Tab:** Displays APQC capabilities with source badges
- **Heatmap Tab:** Interactive hierarchical view with drill-down
- **Architecture Layers:** Cross-layer capability-system-agent mapping
- **"Powered by APQC" Banners:** Visible on all integrated tabs

## Data Model

### APQC Master Structure
```json
{
  "framework_version": "8.0",
  "framework_type": "Cross-Industry",
  "categories": [
    {
      "id": "1.0",
      "level": 1,
      "code": "1.0",
      "name": "Develop Vision and Strategy",
      "description": "...",
      "children": [...]
    }
  ]
}
```

### Enrichment Metadata
```json
{
  "capability_id": "1.1",
  "source": "APQC",
  "business_types": ["All", "Manufacturing"],
  "strategic_alignment": {
    "intent_categories": ["Growth", "Innovation"],
    "bmc_elements": ["key_activities"]
  },
  "ai_transformation": {
    "ai_enabled": true,
    "ai_opportunity": "AI-driven strategy automation",
    "ai_maturity": 4,
    "ai_types": ["NLP", "Predictive Analytics"]
  }
}
```

## Configuration

### Business Type Filters
Customize which capabilities are loaded based on industry:
- All Industries (default)
- Manufacturing
- Services
- Retail
- Financial Services
- Healthcare
- Technology

### Strategic Intent Filters
Filter capabilities by strategic focus:
- Growth
- Innovation
- Efficiency
- Customer Centricity
- Sustainability

## API Usage

### JavaScript API
```javascript
// Load APQC framework
await dataManager.getAPQCFramework();

// Filter by business type
const capabilities = await dataManager.getAPQCCapabilitiesByBusinessType('Manufacturing');

// Filter by strategic intent
const strategicCaps = await dataManager.getAPQCCapabilitiesByIntent('Innovation');

// Enrich current project
await dataManager.enrichProjectWithAPQC(projectId, {
  businessType: 'Technology',
  strategicIntent: 'Growth'
});

// Check integration status
const status = dataManager.getAPQCStatus();
```

### UI Functions
```javascript
// Show APQC settings modal
showAPQCSettings();

// Load APQC for current project
await loadAPQCForProject({ 
  businessType: 'Services', 
  strategicIntent: 'Efficiency' 
});

// Integrate capabilities into model
integrateAPQCCapabilities();
```

## Workflow Integration

### Standard Mode
1. User starts EA workflow (Step 1: Strategic Intent)
2. System prompts: "Load APQC Framework?" (modal)
3. If confirmed, loads capabilities based on industry context
4. Capabilities appear in Capability Map with "APQC" source badge
5. "Powered by APQC" banner visible on relevant tabs

### Autopilot Mode
1. Autopilot flow starts with context (industry, region, detail level)
2. APQC framework automatically loaded based on industry
3. Framework enriches Step 3 (Capability Map) generation
4. AI instructions include APQC capability references
5. Generated capabilities aligned with APQC standards

## EA2 Toolkit Integration

### AI Capability Mapping V2 Toolkit
The APQC framework is now fully integrated into the standalone AI Capability Mapping V2 toolkit.

**Features:**
- **APQC Import Button:** Direct import from header toolbar
- **Settings Modal:** Configure business type and strategic intent
- **Domain Mapping:** APQC categories automatically mapped to toolkit domains:
  - 1.0-2.0 → Product
  - 3.0-4.0 → Operations
  - 5.0 → Customer
  - 6.0-7.0 → Technology
  - 8.0 → Finance
  - 9.0-13.0 → Operations
- **Priority Assignment:** Strategic intent determines capability priority
- **Duplicate Filtering:** Prevents duplicate capabilities
- **Auto-Save:** Capabilities automatically saved to localStorage

**User Workflow:**
1. Open `EA2_Toolkit/AI Capability Mapping V2.html`
2. Click "APQC Import" button in header
3. Select business type (e.g., Manufacturing)
4. Select strategic intent (e.g., Innovation)
5. Click "Importera Capabilities"
6. Capabilities appear in respective domains with priority and maturity

**Documentation:** See `EA2_Toolkit/APQC_CAPABILITY_MAPPING_INTEGRATION.md` for full details.

**Cross-Compatibility:**
- Works alongside Value Chain integration
- Exported to Wardley Map via CSV
- Synced to EA Platform via integration cache
- Included in AI analysis prompts

## Updating APQC Framework

When APQC releases new versions:

1. Download new Excel file
2. Place in `APAQ_Data/source/` (replace old file)
3. Run converter: `node scripts/convert_apqc_to_json.js`
4. No code changes needed - existing projects unaffected
5. New projects use updated framework

## Troubleshooting

### "APQC framework not found"
- Ensure Excel file is in `APAQ_Data/source/` folder
- Run converter script
- Check console for errors

### "No capabilities loaded"
- Check filter settings (business type, strategic intent)
- Try "All Industries" filter
- Verify enrichment file exists

### "Banner not showing"
- Check if project has APQC integration: `dataManager.hasAPQCIntegration()`
- Manually trigger: `initializeAPQCIntegration()`
- Refresh capabilities: `loadAPQCForProject()`

## Architecture Decision

### Why APQC Integration?
- **Industry Standard:** Globally recognized process classification
- **Accelerated Development:** Pre-built capability hierarchies
- **Best Practices:** Proven process structures
- **AI Enhancement:** Enables intelligent transformation recommendations

### Integration Approach
- **Non-invasive:** Existing projects unaffected
- **Optional:** Users can skip APQC loading
- **Flexible:** Filter by industry and strategic focus
- **Extensible:** Easy to add custom metadata

## File Structure
```
APAQ_Data/
├── README.md                           # Framework documentation
├── apqc_pcf_master.json               # Complete APQC framework
├── apqc_metadata_mapping.json          # Business type & strategic mappings
├── apqc_capability_enrichment.json     # Generated enrichment data
└── source/
    └── K016808_APQC...xlsx            # Original Excel file

scripts/
└── convert_apqc_to_json.js            # Excel to JSON converter

js/
└── EA_DataManager.js                  # APQC integration methods

NexGenEA/
└── NexGen_EA_V4.html                  # UI integration
```

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify file paths and permissions
3. Review data contract alignment
4. Test with simplified filters (All Industries)

## Next Steps

After successful integration:
1. ✅ Test in Standard Mode workflow
2. ✅ Test in Autopilot Mode workflow
3. ✅ Verify capability map rendering
4. ✅ Check heatmap hierarchy
5. ✅ Validate architecture layer links
6. ✅ Test filter combinations
7. ✅ Export/import with APQC data

---

**Version:** 1.0  
**Last Updated:** April 7, 2026  
**Integration Status:** Complete
