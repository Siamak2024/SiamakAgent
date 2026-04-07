# APQC Process Classification Framework Data

**Version:** 8.0 (Cross-Industry)  
**Source:** APQC PCF Framework  
**Integration Date:** April 7, 2026  
**Status:** Integrated with EA V5 Platform

---

## Purpose

This folder contains the APQC Process Classification Framework (PCF) data in JSON format, enriched with metadata for seamless integration with the EA V5 Platform's capability model, heatmaps, and architecture layers.

---

## File Structure

- **`apqc_pcf_master.json`** - Complete APQC framework with all hierarchy levels
- **`apqc_metadata_mapping.json`** - Metadata mappings (business types, strategic alignment, BMC elements)
- **`apqc_capability_enrichment.json`** - Enrichment data for capability model integration

---

## Data Model

### Hierarchy Structure
```json
{
  "framework_version": "8.0",
  "framework_type": "Cross-Industry",
  "last_updated": "2026-04-07",
  "categories": [
    {
      "id": "1.0",
      "level": 1,
      "code": "1.0",
      "name": "Develop Vision and Strategy",
      "description": "...",
      "children": [
        {
          "id": "1.1",
          "level": 2,
          "code": "1.1",
          "parent_id": "1.0",
          "name": "Define business concept and organizational strategy",
          "description": "...",
          "children": [...]
        }
      ]
    }
  ]
}
```

### Enrichment Metadata
```json
{
  "capability_id": "1.1",
  "source": "APQC",
  "business_types": ["All", "Manufacturing", "Services", "Retail"],
  "strategic_alignment": {
    "intent_categories": ["Growth", "Innovation", "Efficiency"],
    "bmc_elements": ["key_activities", "key_resources"]
  },
  "ai_transformation": {
    "ai_enabled": true,
    "ai_opportunity": "Strategic planning automation with AI-driven insights",
    "ai_maturity": 3
  },
  "tags": ["strategy", "planning", "leadership"]
}
```

---

## Integration Points

### 1. Capability Model Tab
- Loads APQC capabilities on workflow initiation
- Maps to existing capability model structure
- Displays source badge: "APQC"

### 2. Heatmap Visualization
- Uses hierarchy for multi-level drill-down
- Current State vs. Target State indicators
- Interactive filters by business type and strategic intent

### 3. Architecture Layer
- Links capabilities to applications/systems
- Cross-layer dependency visualization
- Target architecture alignment

### 4. Workflow Modes
- **Autopilot Mode:** Auto-loads relevant APQC capabilities based on industry/business type
- **Standard Mode:** Prompts user to select/import APQC capabilities

---

## Version Control

**Current Version:** 8.0  
**Update Policy:** When APQC releases new framework versions, re-run the converter script without breaking existing EA workflows.

---

## Source File

Place the APQC Excel file here:
```
APAQ_Data/source/K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.xlsx
```

Run converter:
```bash
node scripts/convert_apqc_to_json.js
```
