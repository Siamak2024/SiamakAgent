# Operating Model Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Operating Model (Step 4) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-06

---

## Core Principle

Operating Model is a **6-building-block blueprint** stored in `model.operatingModel`.  
It is distinct from the BMC (which describes WHAT the business does and for WHOM).  
The Operating Model describes HOW the organisation delivers value — process, capability, people, systems, governance.

`model.operatingModel` always has the shape:
```json
{ "current": { ...6-block schema... }, "target": { ...6-block schema + transformation_principles... } }
```

`model.operatingModelDelta` holds the delta/transition analysis (Step 4.3).

---

## 6-Building-Block Schema (Current & Target)

Both `current` and `target` use the same 6-block schema.  
`target` additionally includes `transformation_principles[]`.

```json
{
  "value_delivery": {
    "value_streams": ["3–5 core end-to-end value streams"],
    "customer_journeys": ["Key customer journey descriptions"],
    "channels": ["Delivery channels used to reach customers"]
  },
  "capability_model": [
    {
      "name": "Capability Name (Verb + Object)",
      "purpose": "Why this capability matters (1 sentence)",
      "group": "Commercial|Operations|Support|Digital",
      "maturity": "High|Medium|Low",
      "strategic_priority": "High|Medium|Low"
    }
  ],
  "process_model": [
    {
      "name": "Core Process Name",
      "linked_capability": "Capability Name this process supports",
      "is_bottleneck": false,
      "description": "Brief description of the process",
      "ai_enabled": false
    }
  ],
  "organisation_governance": {
    "key_roles": ["Role title: brief responsibility"],
    "capability_ownership": [
      { "capability": "Capability Name", "owner": "Role or team" }
    ],
    "governance_model": "Centralized|Decentralized|Federated",
    "decision_making": "1-sentence description of how key decisions are made"
  },
  "application_data_landscape": {
    "core_systems": [
      {
        "name": "System or Platform Name",
        "supports_capability": "Capability Name",
        "status": "active|gap|redundant",
        "is_ai_platform": false
      }
    ],
    "gaps_overlaps": ["Description of a major system gap or overlap"]
  },
  "operating_model_principles": [
    "Principle statement (5–7 total, e.g. 'Digital-first customer interaction')"
  ],
  "metadata": {
    "at_a_glance": "1-sentence summary of this operating model state",
    "model_archetype": "e.g. Fragmented traditional | Federated digital-first | Centralised shared services"
  },
  "ai_transformation_indicators": {
    "ai_enabled_processes": ["Process names that leverage AI/ML/automation"],
    "ai_platforms": ["Named AI/ML platforms and tools"],
    "ai_governance_roles": ["Roles responsible for AI oversight and ethics"],
    "ai_readiness_assessment": "Brief assessment of AI maturity and readiness (1-2 sentences)"
  }
}
```

### Target operating model adds:
```json
{
  "transformation_principles": [
    "The 'why' behind a key design decision, e.g. 'API-first to enable ecosystem participation'"
  ]
}
```

---

## Field Specifications

### 1. value_delivery (OBJECT - REQUIRED)
Describes how value flows end-to-end.
- **value_streams** (array, 3–5): Core flows from input to customer value
- **customer_journeys** (array): Key journeys experienced by the customer
- **channels** (array): Delivery channels (digital, physical, partner, etc.)

### 2. capability_model (ARRAY of objects - REQUIRED, 6–10 items)
Business capabilities required to operate. 1–2 levels only (no deep hierarchy).
- **name**: [Verb][Object] format, e.g. "Manage Customer Relationships"
- **purpose**: Why this capability is needed
- **group**: Logical grouping — Commercial, Operations, Support, or Digital
- **maturity**: Current maturity (High/Medium/Low)
- **strategic_priority**: How critical to the strategy (High/Medium/Low)

### 3. process_model (ARRAY of objects - REQUIRED, 5–7 items)
How work gets done — mapped to capabilities.
- **name**: Descriptive process name
- **linked_capability**: Which capability this process enables
- **is_bottleneck**: Boolean — is this a known friction point?
- **description**: 1-sentence description
- **ai_enabled**: Boolean (default: false) — is this process AI-automated/augmented? Criteria:
  - Uses ML models for decision-making (e.g., predictive routing, risk scoring)
  - Automated via RPA/intelligent automation
  - References AI-enabled capabilities from Step 3
  - Appears in BMC ai_enabled_activities or Strategic Intent ai_transformation_themes
  - Examples: ✅ "Predictive Demand Planning", "Automated Claims Processing" | ❌ "Manual Invoice Approval", "Monthly Financial Close"

### 4. organisation_governance (OBJECT - REQUIRED)
Who does what and how decisions are made.
- **key_roles** (array): Specific role titles with brief responsibilities
- **capability_ownership** (array): Who owns each capability
- **governance_model**: Centralized / Decentralized / Federated
- **decision_making**: 1-sentence description

### 5. application_data_landscape (OBJECT - REQUIRED)
Systems and data supporting the business model.
- **core_systems** (array): Named platforms — include status (active/gap/redundant)
  - **is_ai_platform**: Boolean (default: false) — is this an AI/ML platform? Criteria:
    - ML/AI-specific platforms (e.g., Azure ML, AWS SageMaker, Databricks, DataRobot)
    - Systems with embedded AI capabilities (e.g., Salesforce Einstein, SAP AI Business Services)
    - Data platforms supporting AI workloads (e.g., Snowflake, BigQuery with ML)
    - RPA platforms (e.g., UiPath, Automation Anywhere)
    - Examples: ✅ "Azure Machine Learning", "Salesforce Einstein", "UiPath" | ❌ "SAP ERP", "Microsoft 365"
- **gaps_overlaps** (array): Where the landscape has holes or redundancy

### 6. operating_model_principles (ARRAY of strings - REQUIRED, 5–7)
Guiding principles that govern how the organisation operates.
Examples: "Standardize core, differentiate edge", "Data as a shared asset"

### 7. ai_transformation_indicators (OBJECT - OPTIONAL, Phase 2.3)
AI transformation tracking across the operating model.
- **ai_enabled_processes** (array): Process names from process_model that have ai_enabled: true
- **ai_platforms** (array): Platform names from core_systems that have is_ai_platform: true
- **ai_governance_roles** (array): Roles from organisation_governance.key_roles responsible for AI oversight, ethics, model governance (e.g., "Chief AI Officer", "AI Ethics Board", "ML Model Risk Manager")
- **ai_readiness_assessment** (string): 1-2 sentence assessment of current AI maturity and organizational readiness for AI transformation
  - Consider: AI skills availability, data infrastructure quality, AI governance maturity, change readiness for AI adoption
  - Examples: ✅ "Strong data foundation and cloud infrastructure in place; limited AI expertise requires upskilling" | ❌ "Good AI readiness"

**Integration with other steps:**
- Step 3 (Capabilities): Process ai_enabled should align with capability ai_enabled flags
- Step 2 (BMC): ai_enabled_activities from BMC should map to ai_enabled processes
- Step 1 (Strategic Intent): ai_transformation_themes should inform ai_readiness_assessment and ai_governance_roles

---

## Difference from BMC

| BMC | Operating Model |
|-----|----------------|
| WHAT is the business? | HOW does the business operate? |
| Value Proposition, Channels, Customer Segments | Value Streams, Capabilities, Processes |
| Revenue Streams, Cost Structure | Governance, Systems, Principles |
| Strategic positioning | Operational blueprint |

---

## Delta Schema (model.operatingModelDelta)

```json
{
  "dimension_gaps": [
    {
      "dimension": "One of the 6 building blocks",
      "current_state": "Brief current description",
      "target_state": "Brief target description",
      "gap_severity": "HIGH|MEDIUM|LOW",
      "transition_complexity": "HIGH|MEDIUM|LOW",
      "recommended_pattern": "e.g. Phased migration, Big-bang cutover"
    }
  ],
  "cross_cutting_themes": ["Themes spanning multiple blocks"],
  "dependency_chain": ["Ordered list of what must happen first"],
  "change_readiness": {
    "score": 0.5,
    "factors": ["What drives score up/down"],
    "risks": ["Top 3 specific risks"]
  },
  "executive_summary": "2-3 sentences Board-level summary"
}
```

---

## Validation Rules

- `capability_model` MUST have 6–10 items
- `process_model` MUST have 5–7 items
- `operating_model_principles` MUST have 5–7 items
- All `capability_model[].name` MUST follow [Verb][Object] convention
- `application_data_landscape.core_systems[].status` MUST be one of: active, gap, redundant
- `metadata.at_a_glance` MUST be present and non-empty

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ **Generic descriptions:** `"governance": {"structure": "Good governance"}`  
✅ **Specific descriptions:** `"governance": {"structure": "Federated model with central EA authority and domain-autonomous execution within architecture guardrails"}`

❌ **Non-specific platforms:** `"platforms": ["CRM", "ERP"]`  
✅ **Actual platforms:** `"platforms": ["Salesforce Sales Cloud", "SAP S/4HANA Cloud", "Microsoft Dynamics 365"]`

❌ **Missing KPIs:** `"kpis": []`  
✅ **Measurable KPIs:** `"kpis": ["Cost-to-income ratio <50%", "Cloud adoption >80% by 2027", "Incident resolution time <4h"]`

❌ **Vague culture:** `"culture": "Innovative and customer-focused"`  
✅ **Specific culture:** `"culture": "Agile product teams with DevOps practices; data-driven decision-making culture; experimentation encouraged via A/B testing; customer co-creation sprints quarterly"`

---

## Validation Checklist

Before deploying any Operating Model instruction change:
- [ ] All 5 dimensions present: governance, organization, processes, data, technology
- [ ] Each dimension has required sub-fields (structure/strategy, arrays where specified)
- [ ] Platform names are REALISTIC (real products like Salesforce, SAP, Azure, not generic "CRM")
- [ ] KPIs are measurable with targets
- [ ] Core processes are end-to-end business processes (not technical processes)
- [ ] Technology architecture describes actual approach (cloud-first, hybrid, etc.)
- [ ] Tested with generateAutopilotOperatingModel() — generates valid JSON

---

## Change Log

- **2026-04-05:** Initial contract created
  - Defined authoritative 5-dimension schema from Autopilot implementation
  - Added industry-specific guidance (Finance, Real Estate, Public Sector, Retail)
  - Documented anti-patterns for generic vs specific content
