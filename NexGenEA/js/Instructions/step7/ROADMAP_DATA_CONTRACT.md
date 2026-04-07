# Transformation Roadmap Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Transformation Roadmap (Step 7) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

Transformation Roadmap defines **prioritized initiatives** organized in waves/phases.  
Stored as `model.roadmap` or `model.transformationRoadmap` (depends on implementation).

---

## Primary Schema (model.roadmap)

```json
{
  "initiatives": [
    {
      "id": "init_001",
      "name": "Customer Data Platform Implementation",
      "description": "Build unified customer 360 platform",
      "phase": "Wave 1 (Q1-Q2 2026)",
      "duration": "6 months",
      "priority": "critical",
      "valuePool": "€5M annually",
      "dependencies": ["init_005 (API Gateway)"],
      "capabilities": ["Customer Data Management", "Customer Analytics"],
      "status": "not-started",
      "ai_enabled_initiative": false
    },
    {
      "id": "init_002",
      "name": "Legacy System Decommission (Mainframe)",
      "description": "Migrate from mainframe to cloud-native stack",
      "phase": "Wave 2 (Q3-Q4 2026)",
      "duration": "9 months",
      "priority": "high",
      "valuePool": "€3M annually (infrastructure cost)",
      "dependencies": ["init_001", "init_004"],
      "capabilities": ["Core Transaction Processing", "Data Integration"],
      "status": "not-started",
      "ai_enabled_initiative": false
    }
  ],
  "waves": [
    {
      "name": "Wave 1 — Foundation (Q1-Q2 2026)",
      "focus": "Data platform, API infrastructure, quick wins",
      "initiatives": ["init_001", "init_003", "init_005"]
    },
    {
      "name": "Wave 2 — Modernization (Q3-Q4 2026)",
      "focus": "Legacy migration, process automation",
      "initiatives": ["init_002", "init_004", "init_006"]
    }
  ]
}
```

---

## Field Specifications

### initiatives (ARRAY - REQUIRED)
Array of 8-15 transformation initiatives.

Each initiative object contains:

#### id (STRING - REQUIRED)
- **Format:** `init_XXX` where XXX is zero-padded 3-digit number
- **Example:** `init_001`, `init_012`, `init_123`
- **Must be unique** across all initiatives

#### name (STRING - REQUIRED)
- **Format:** Project/initiative name (concise, 3-8 words)
- **Examples:**
  - "Customer Data Platform Implementation"
  - "Process Automation via RPA"
  - "Cloud Migration (Phase 1)"
  - "API Gateway Deployment"
- **Should be:** Action-oriented, technology + outcome
- **Avoid:** Vague names like "Digital Initiative" or "Transformation Program 1"

#### description (STRING - REQUIRED)
- **Format:** 1-2 sentence initiative description
- **Should include:**
  - What will be done
  - Key deliverables
  - Primary objective
- **Example:** "Implement Salesforce Customer 360 platform integrating data from 8 source systems to create unified customer profile. Enable marketing personalization, 360-degree service view, and predictive analytics."

#### phase (STRING - REQUIRED)
- **Format:** Wave/phase name with timeframe
- **Pattern:** `"Wave N (QX-QY YYYY)"` or `"Phase N — Name (timeframe)"`
- **Examples:**
  - `"Wave 1 (Q1-Q2 2026)"`
  - `"Foundation Phase (Jan-Jun 2026)"`
  - `"Quick Wins (Immediate)"`
- **Should align:** With waves array

#### duration (STRING - REQUIRED)
- **Format:** Time duration
- **Pattern:** `"X months"` or `"X-Y months"` or `"X weeks"`
- **Examples:** `"6 months"`, `"9-12 months"`, `"8 weeks"`

#### priority (STRING - REQUIRED)
- **Type:** Enum
- **Allowed values:** `low`, `medium`, `high`, `critical`
- **Definitions:**
  - `critical` — Foundational; blocks other initiatives; strategic must-have
  - `high` — Important for strategic execution; significant value
  - `medium` — Valuable but not urgent; can be deferred
  - `low` — Nice-to-have; low strategic impact

#### valuePool (STRING - REQUIRED)
- **Format:** Value statement from Step 6 value pools
- **Pattern:** `"€X M [timeframe/type]"`
- **Examples:**
  - `"€5M annually"`
  - `"€3M one-time cost savings"`
  - `"€8M incremental revenue by 2027"`
  - `"Risk mitigation (avoid €2M potential fines)"`
- **Should reference:** Value pools from Step 6

#### dependencies (ARRAY - OPTIONAL)
- **Format:** Array of initiative IDs or names this initiative depends on
- **Examples:**
  - `["init_005 (API Gateway)", "init_003 (Cloud Foundation)"]`
  - `[]` if no dependencies
- **Use:** Define sequencing and critical path

#### capabilities (ARRAY - REQUIRED)
- **Format:** Array of capability names this initiative improves/enables
- **Should reference:** Capabilities from Step 3 and gaps from Step 5
- **Examples:**
  - `["Customer Data Management", "Marketing Campaign Execution", "Customer Analytics"]`
- **Count:** 2-5 capabilities per initiative

#### status (STRING - REQUIRED)
- **Type:** Enum
- **Allowed values:** `not-started`, `planning`, `in-progress`, `completed`, `on-hold`
- **Default:** `not-started` for new roadmaps

#### ai_enabled_initiative (BOOLEAN - OPTIONAL)
- **Added:** Phase 2.6 (2026-04-05)
- **Type:** Boolean
- **Default:** `false`
- **Purpose:** Flag initiatives that implement/enable AI transformation
- **Criteria** (mark `true` if ANY apply):
  1. **Initiative enables AI-enabled capabilities** from Step 3 (e.g., implements ML model, RPA, intelligent automation)
  2. **Initiative closes AI-enabled gaps** from Step 5 (e.g., addresses predictive analytics gap marked ai_enabled_gap: true)
  3. **Initiative delivers AI-enabled value pools** from Step 6 (e.g., generates AI-driven revenue marked ai_enabled_value: true)
  4. **Initiative implements AI platforms/systems** from Step 4 (e.g., deploys Azure ML, Databricks, UiPath marked is_ai_platform: true)
  5. **Initiative name/description contains AI transformation themes** from Strategic Intent ai_transformation_themes (e.g., "predictive maintenance", "intelligent automation")
- **Examples:**
  - ✅ `true`: "Customer Churn Prediction Model Implementation" (ML capability from Step 3)
  - ✅ `true`: "RPA Deployment for Invoice Processing" (automation gap closure from Step 5)
  - ✅ `true`: "Azure ML Platform Setup" (AI system from Step 4)
  - ✅ `true`: "AI-Driven Personalization Engine" (AI value pool from Step 6)
  - ❌ `false`: "ERP System Upgrade" (no AI component)
  - ❌ `false`: "Cloud Infrastructure Migration" (enabler, not AI-specific)
  - ❌ `false`: "API Gateway Deployment" (integration layer, not AI)
- **Usage:**
  - Enables AI initiative grouping/filtering in roadmap visualization (Phase 1.5 enhancement)
  - Quantifies AI transformation investment vs. traditional modernization
  - Prioritizes AI roadmap vs. broader digital transformation
  - Validates AI strategy execution vs. ambition (Strategic Intent ai_transformation_themes)
  - Tracks AI initiative distribution across waves (ensure balanced delivery)

---

### waves (ARRAY - OPTIONAL)
Array of transformation waves/phases for grouping.

Each wave object contains:

#### name (STRING - REQUIRED)
- **Format:** Wave name with timeframe
- **Example:** `"Wave 1 — Foundation (Q1-Q2 2026)"`

#### focus (STRING - REQUIRED)
- **Format:** Wave strategic focus (1 sentence)
- **Example:** `"Establish data platform and API infrastructure; deliver quick-win automations"`

#### initiatives (ARRAY - REQUIRED)
- **Format:** Array of initiative IDs in this wave
- **Example:** `["init_001", "init_003", "init_005", "init_007"]`

---

## Initiative Prioritization Logic

### CRITICAL Priority Initiatives
- **Criteria:**
  - Foundation for multiple other initiatives (API platform, data platform, cloud foundation)
  - Addresses "critical" priority gaps from Step 5
  - Required for regulatory compliance
- **Typical count:** 2-4 initiatives
- **Sequencing:** Must start in Wave 1

### HIGH Priority Initiatives
- **Criteria:**
  - High-value pools from Step 6 (€5M+)
  - Directly supports strategic themes
  - Customer-facing or revenue-impacting
- **Typical count:** 4-6 initiatives
- **Sequencing:** Wave 1-2

### MEDIUM Priority Initiatives
- **Criteria:**
  - Moderate value (€1-5M)
  - Operational improvement focus
  - Can wait for infrastructure from Wave 1
- **Typical count:** 3-5 initiatives
- **Sequencing:** Wave 2-3

---

## Wave Sequencing Principles

### Wave 1 — Foundation (0-6 months)
- **Focus:** Infrastructure, platforms, quick wins
- **Typical initiatives:**
  - Cloud foundation / infrastructure-as-code
  - API gateway and integration platform
  - Data platform foundation (lake/warehouse)
  - Process automation quick wins (RPA)
  - Security baseline (IAM, SIEM)

### Wave 2 — Capability Build (6-12 months)
- **Focus:** Core capability enhancement, legacy migration
- **Typical initiatives:**
  - Customer 360 / CRM platform
  - Legacy system migration (phase 1)
  - Core process digitization
  - Analytics and BI platform

### Wave 3 — Scale & Optimize (12-18 months)
- **Focus:** Advanced capabilities, optimization, innovation
- **Typical initiatives:**
  - AI/ML platform and use cases
  - Advanced analytics and insights
  - Ecosystem/partner integration
  - Continuous optimization programs

---

## Industry-Specific Example

### Financial Services Roadmap
```json
{
  "name": "Open Banking Platform",
  "phase": "Wave 1 (Q1-Q2 2026)",
  "duration": "6 months",
  "priority": "critical",
  "valuePool": "€8M annually (API monetization)",
  "dependencies": ["init_002 (Cloud Migration)"],
  "capabilities": ["API Management", "Third-Party Integration", "Developer Portal"],
  "description": "Build PSD2-compliant open banking API platform enabling third-party developers to access account data and initiate payments. Includes API gateway (Apigee), developer portal, sandbox environment, and usage-based billing."
}
```

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ **Vague initiatives:** `"name": "Digital Transformation"`  
✅ **Specific initiatives:** `"name": "Customer Data Platform (Salesforce CDP) Implementation"`

❌ **No value linkage:** `"valuePool": "TBD"` or missing  
✅ **Quantified value:** `"valuePool": "€5M annually (customer retention + cross-sell)"`

❌ **Missing dependencies:** All initiatives independent  
✅ **Realistic dependencies:** "CRM migration depends on API platform + data migration"

❌ **Unrealistic sequencing:** All "critical" in Wave 1  
✅ **Phased approach:** Foundation → Capability build → Optimization

❌ **Generic capabilities:** `"capabilities": ["IT"]`  
✅ **Specific capabilities:** `"capabilities": ["Customer Onboarding", "KYC/AML Processing", "Digital Identity Management"]`

---

## Validation Checklist

Before deploying any Roadmap instruction change:
- [ ] initiatives array with 8-15 objects
- [ ] Each initiative has: id, name, description, phase, duration, priority, valuePool, capabilities, status
- [ ] All ids unique and follow `init_XXX` format
- [ ] Phases/waves defined and initiatives assigned to waves
- [ ] Dependencies create logical sequencing (no circular deps)
- [ ] Priorities distributed: 2-4 critical, 4-6 high, rest medium
- [ ] valuePool values reference Step 6 value pools
- [ ] capabilities reference Step 3 capability map and Step 5 gaps
- [ ] Wave 1 contains foundational initiatives (platforms, infrastructure)
- [ ] Tested with generateAutopilotRoadmap() — generates valid JSON

---

## Change Log

- **2026-04-05:** Initial contract created
  - Defined authoritative schema from Autopilot roadmap implementation
  - Added wave sequencing principles (Foundation → Build → Scale)
  - Documented initiative prioritization logic
  - Added industry-specific example (Financial Services)
