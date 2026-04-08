# EA Platform Integration Registry

**Status:** Source of Truth for Toolkit Integration  
**Created:** 2026-04-08  
**Purpose:** Document data contracts, integration flows, and governance principles to prevent breaking changes across toolkit chains

---

## Overview

The EA Platform follows a **modular toolkit architecture** where each toolkit focuses on a specific EA activity and integrates through **versioned data contracts** via the **EA_DataManager API**.

**Core Integration Principle:**
> New toolkits MUST NOT break existing integration flows. All data exchange follows versioned schemas with backward compatibility guarantees.

---

## Integration Flow Diagram

```
Business Model Canvas (BMC)
         ↓
    [bmc_latest]
         ↓
Value Chain Analysis (VC)
         ↓
    [valuechain_latest]
         ↓
AI Capability Mapping V2
         ↓
    [capability_latest v2.0]  ← YOU ARE HERE
         ↓
Gap Analysis Toolkit (FUTURE)
         ↓
    [gap_analysis_latest v1.0]
         ↓
Transformation Roadmap Toolkit (FUTURE)
         ↓
    [roadmap_latest v1.0]
         ↓
Strategy Workbench (APM)
```

---

## Data Contracts

### 1. capability_latest (v2.0)

**Source Toolkit:** AI Capability Mapping V2  
**Consumer Toolkits:** Gap Analysis, Transformation Roadmap, Strategy Workbench  
**Schema Version:** 2.0 (April 2026)  
**Storage Key:** `capability_latest`

#### Schema Definition

```json
{
  "schema_version": "2.0",
  "toolkit": "capability_mapping",
  "timestamp": "2026-04-08T10:30:00Z",
  
  "apqc_context": {
    "scenario": "Scenario 2 (AI-Assisted)",
    "industry": "technology",
    "confidence": 85,
    "secondary_industry": "financial-services",
    "ai_detected": true
  },
  
  "as_is_to_be": {
    "workshop_step": 3,
    "as_is_locked_count": 18,
    "as_is_total_count": 24,
    "as_is_lock_percentage": 75,
    "as_is_snapshot": { /* snapshot before TO-BE generation */ },
    "to_be_draft": { /* AI-generated TO-BE */ },
    "to_be_final": { /* consolidated TO-BE */ },
    "to_be_users_updated": true
  },
  
  "capabilities": {
    "customer": [
      {
        "name": "Manage Customer Relationships",
        "priority": "strategic",
        "maturity": 2,
        "apqc_code": "8.1.2",
        "description": "Build and maintain customer relationships",
        "locked": true,
        "to_be_enhanced": false
      }
    ],
    "operations": [ /* ... */ ],
    "product": [ /* ... */ ],
    "finance": [ /* ... */ ],
    "technology": [ /* ... */ ],
    "people": [ /* ... */ ]
  }
}
```

#### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | string | Yes | Contract version for compatibility checking |
| `toolkit` | string | Yes | Source toolkit identifier |
| `timestamp` | string (ISO 8601) | Yes | Export timestamp |
| `apqc_context` | object | No | APQC framework context (if used) |
| `apqc_context.scenario` | string | No | Import scenario (Scenario 1/2) |
| `apqc_context.industry` | string | No | Primary industry detected/selected |
| `apqc_context.confidence` | number | No | AI detection confidence (0-100) |
| `apqc_context.secondary_industry` | string | No | Secondary industry (if applicable) |
| `apqc_context.ai_detected` | boolean | No | Whether AI detection was used |
| `as_is_to_be` | object | Yes | Workshop flow metadata |
| `as_is_to_be.workshop_step` | number | Yes | Current workshop step (1-3) |
| `as_is_to_be.as_is_locked_count` | number | Yes | Number of locked AS-IS capabilities |
| `as_is_to_be.as_is_total_count` | number | Yes | Total AS-IS capabilities |
| `as_is_to_be.as_is_lock_percentage` | number | Yes | Percentage of locked capabilities |
| `as_is_to_be.as_is_snapshot` | object | No | AS-IS state before TO-BE generation |
| `as_is_to_be.to_be_draft` | object | No | AI-generated TO-BE draft |
| `as_is_to_be.to_be_final` | object | No | Consolidated TO-BE state |
| `as_is_to_be.to_be_users_updated` | boolean | No | Whether user edited TO-BE |
| `capabilities` | object | Yes | Capability map organized by domains |
| `capabilities.[domain][]` | array | Yes | Array of capability objects |
| `capabilities.[domain][].name` | string | Yes | Capability name |
| `capabilities.[domain][].priority` | string | Yes | strategic/important/commodity |
| `capabilities.[domain][].maturity` | number | Yes | 1-5 maturity level |
| `capabilities.[domain][].apqc_code` | string | No | APQC framework code (if APQC-sourced) |
| `capabilities.[domain][].description` | string | No | Capability description |
| `capabilities.[domain][].locked` | boolean | No | AS-IS lock status (workshop flow) |
| `capabilities.[domain][].to_be_enhanced` | boolean | No | TO-BE enhancement flag |

#### Backward Compatibility (v1.0 → v2.0)

**Breaking Changes:** None  
**New Optional Fields:** `apqc_context`, `as_is_to_be`

**v1.0 Consumers:** Can safely ignore new fields and process `capabilities` object as before  
**v2.0 Consumers:** Should check `schema_version` and use enhanced metadata when available

---

### 2. gap_analysis_latest (v1.0) — PLANNED

**Source Toolkit:** Gap Analysis Toolkit (future)  
**Consumer Toolkits:** Transformation Roadmap, Strategy Workbench  
**Schema Version:** 1.0 (planned Q3 2026)  
**Storage Key:** `gap_analysis_latest`

#### Planned Schema Structure

```json
{
  "schema_version": "1.0",
  "toolkit": "gap_analysis",
  "timestamp": "2026-06-15T14:20:00Z",
  "source_capability_version": "2.0",
  
  "gaps": [
    {
      "capability_name": "Manage Customer Relationships",
      "domain": "customer",
      "current_maturity": 2,
      "target_maturity": 4,
      "gap_type": "maturity_gap",
      "priority": "high",
      "enabler_type": "ai",
      "transformation_theme": "AI-driven personalization",
      "estimated_effort": "medium",
      "dependencies": ["Customer Data Platform", "AI Ethics Policy"]
    }
  ],
  
  "transformation_themes": [
    {
      "theme": "AI-driven personalization",
      "affected_capabilities": 5,
      "priority": "strategic",
      "enabler_technologies": ["AI", "Data"]
    }
  ]
}
```

---

### 3. roadmap_latest (v1.0) — PLANNED

**Source Toolkit:** Transformation Roadmap Toolkit (future)  
**Consumer Toolkits:** Strategy Workbench  
**Schema Version:** 1.0 (planned Q4 2026)  
**Storage Key:** `roadmap_latest`

#### Planned Schema Structure

```json
{
  "schema_version": "1.0",
  "toolkit": "transformation_roadmap",
  "timestamp": "2026-09-20T16:45:00Z",
  "source_gap_analysis_version": "1.0",
  
  "initiatives": [
    {
      "id": "init_001",
      "name": "Implement AI-driven Customer Insights Platform",
      "type": "AI Infrastructure",
      "wave": "Wave 1: Foundation",
      "start_quarter": "Q1 2027",
      "duration_quarters": 3,
      "capabilities_enabled": ["Analyze Customer Behavior", "Predict Customer Needs"],
      "gaps_addressed": ["gap_cust_001", "gap_cust_005"],
      "dependencies": ["init_002"],
      "cost_estimate": "high",
      "value_impact": "strategic"
    }
  ],
  
  "waves": [
    {
      "name": "Wave 1: Foundation",
      "start_date": "2027-Q1",
      "end_date": "2027-Q4",
      "focus": "AI Infrastructure & Data Platform",
      "initiatives_count": 4
    }
  ]
}
```

---

## Integration Governance Principles

### Principle 1: No Breaking Changes to Existing Keys

**Rule:** When adding new toolkit exports, use NEW storage keys. NEVER modify schema of existing keys without major version bump.

**Example:**
- ✅ **CORRECT:** `capability_latest` v1.0 → v2.0 adds optional fields only
- ❌ **WRONG:** `capability_latest` v2.0 removes `capabilities.customer` array

### Principle 2: New Toolkits Use New Keys

**Rule:** Each new toolkit creates its own storage key. Do not overwrite upstream toolkit data.

**Example:**
- ✅ **CORRECT:** Gap Analysis toolkit stores to `gap_analysis_latest`
- ❌ **WRONG:** Gap Analysis toolkit overwrites `capability_latest`

### Principle 3: Versioning on All Exports

**Rule:** All exported data MUST include `schema_version` field for compatibility detection.

**Implementation:**
```javascript
const exportData = {
  schema_version: '2.0',
  toolkit: 'capability_mapping',
  // ... rest of data
};
```

### Principle 4: EA_DataManager Exclusive API

**Rule:** ALL inter-toolkit data exchange MUST go through EA_DataManager. Direct `localStorage` access is forbidden for integration.

**Implementation:**
```javascript
// ✅ CORRECT
dataManager.setIntegrationData('capability_latest', exportData);
const capData = dataManager.getIntegrationData('capability_latest');

// ❌ WRONG
localStorage.setItem('capability_latest', JSON.stringify(exportData));
const capData = JSON.parse(localStorage.getItem('capability_latest'));
```

### Principle 5: Documentation Before Implementation

**Rule:** Before creating a new toolkit or modifying integration contracts, UPDATE THIS REGISTRY FIRST.

**Process:**
1. Document planned schema in INTEGRATION_REGISTRY.md
2. Review with stakeholders
3. Create data contract markdown files
4. Implement toolkit with versioned exports
5. Update INTEGRATION_REGISTRY.md with actual implementation details

---

## Toolkit Integration Checklist

Use this checklist when creating a new toolkit or modifying integration contracts:

- [ ] **Schema Documentation:** Defined schema structure in this registry
- [ ] **Data Contract File:** Created `[TOOLKIT_NAME]_DATA_CONTRACT.md` in toolkit folder
- [ ] **Schema Version:** Included `schema_version` field in exports
- [ ] **Toolkit Identifier:** Included `toolkit` field in exports
- [ ] **Timestamp:** Included `timestamp` field (ISO 8601) in exports
- [ ] **EA_DataManager Integration:** Used `setIntegrationData()` / `getIntegrationData()` only
- [ ] **Backward Compatibility:** Verified existing consumers can safely ignore new fields
- [ ] **Breaking Change Check:** Confirmed NO removal/renaming of existing required fields
- [ ] **Version Migration:** Created migration function if schema changes are complex
- [ ] **Testing:** Validated integration with upstream/downstream toolkits
- [ ] **Documentation Update:** Updated INTEGRATION_REGISTRY.md with actual implementation

---

## Changelog

### 2026-04-08 — Initial Registry Creation
- Documented `capability_latest v2.0` schema
- Added APQC context and workshop flow metadata
- Planned `gap_analysis_latest v1.0` schema
- Planned `roadmap_latest v1.0` schema
- Established 5 integration governance principles
- Created toolkit integration checklist

---

## Future Enhancements

### Validation Library (Q2 2026)
Create `EA_SchemaValidator.js` to automatically validate exports against registry specifications.

```javascript
// Proposed API
const validator = new EA_SchemaValidator();
const result = validator.validate(exportData, 'capability_latest', '2.0');
if (!result.valid) {
  console.error('Schema validation failed:', result.errors);
}
```

### Migration Framework (Q3 2026)
Build automatic schema migration for version upgrades.

```javascript
// Proposed API
const migrator = new EA_SchemaMigrator();
const upgradedData = migrator.migrate(oldData, '1.0', '2.0');
```

### Integration Diagram Generator (Q4 2026)
Auto-generate visual integration flow diagrams from registry metadata.

---

## Contacts

**Platform Architect:** Siamak Khodayari  
**Integration Governance:** EA Platform Team  
**Questions/Changes:** Update this registry via pull request with rationale

---

**Last Updated:** 2026-04-08  
**Registry Version:** 1.0
