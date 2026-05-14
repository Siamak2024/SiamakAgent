# Strategic Intent Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Strategic Intent (Step 1) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

Strategic Intent is a **simple flat object** with string and array fields. NO nested complexity.

---

## Primary Schema (model.businessContext)

```json
{
  "strategicVision": {
    "ambition": "String (2-3 sentences) — Executive summary of strategic direction",
    "themes": ["theme 1", "theme 2", "theme 3", "theme 4"],
    "timeframe": "String — Planning horizon (e.g., '3-5 years')"
  },
  "successMetrics": [
    {
      "metric": "Metric name and description",
      "target": "Target value or outcome",
      "timeframe": "When to achieve"
    }
  ],
  "constraints": [
    {
      "type": "Operational|Financial|Organisational|Technical|External",
      "description": "Constraint description"
    }
  ],
  "keyChallenges": [
    {
      "id": "String — Unique identifier",
      "challenge": "Challenge description",
      "impact": "High|Medium|Low",
      "category": "Category name"
    }
  ],
  "situation_narrative": "Optional: Current state description",
  "burning_platform": "Optional: Urgency driver",
  "investigation_scope": ["Optional: EA focus areas"],
  "key_assumptions_to_validate": ["Optional: Assumptions requiring validation"],
  "expected_outcomes": ["Optional: Expected results"]
}
```

---

## Field Specifications

### strategicVision (OBJECT - REQUIRED)
- **Type:** Object with ambition, themes, and timeframe
- **ambition (String):** 2-3 sentences — Executive-level strategic direction statement
- **Format:** "We aim to become [position] by [timeframe] through [key approaches]. This will enable [outcome] and differentiate us via [differentiator]."
- **themes (Array):** 3-5 action-oriented themes specific to industry
- **timeframe (String):** Planning horizon (e.g., "3-5 years", "2024-2027")
- **Industry-Specific:** Must reflect actual industry challenges and market dynamics
- **NEVER:** Generic consulting language, vague aspirations without concrete direction

**Examples:**
- Real Estate: ["PropTech Integration", "ESG Compliance (EU Taxonomy)", "Tenant Experience Digitization"]
- Finance: ["Open Banking API Platform", "AI-Driven Risk Management", "Core Banking Modernization"]
- Public Sector: ["Citizen Portal Unification", "Process Automation (RPA)", "Data Transparency"]

### successMetrics (ARRAY - REQUIRED)
- **Type:** Array of objects (3-4 metrics with structured targets)
- **Format:** Each object contains:
  - `metric`: "[Metric name and description]"
  - `target`: "[Current] → [Target]"
  - `timeframe`: "[When to achieve]"
- **Examples:**
  ```json
  [
    {
      "metric": "Cost-to-income ratio improvement",
      "target": "65% → 48%",
      "timeframe": "by 2027"
    },
    {
      "metric": "Digital adoption rate across customer base",
      "target": "30% → 75%",
      "timeframe": "within 18 months"
    }
  ]
  ```
- **Must include:** Baseline, target, timeframe (not just "increase X")
- **NEVER:** Unmeasurable aspirations ("Improve satisfaction")

### constraints (ARRAY - REQUIRED)
- **Type:** Array of objects (5 constraints covering all categories)
- **Format:** Each object contains:
  - `type`: "Operational" | "Financial" | "Organisational" | "Technical" | "External"
  - `description`: Specific constraint description
- **Examples:**
  ```json
  [
    {
      "type": "Financial",
      "description": "€12M transformation budget over 3 years; no CapEx for new datacenters"
    },
    {
      "type": "Technical",
      "description": "Legacy SAP R/3 must remain operational during 24-month migration"
    },
    {
      "type": "External",
      "description": "GDPR compliance mandatory; no non-EU cloud regions"
    }
  ]
  ```
- **Industry-Specific:** Real regulations (GDPR, Basel III, EU Taxonomy), real system names
- **NEVER:** Generic constraints ("Limited budget", "Resistance to change")

### keyChallenges (ARRAY - OPTIONAL)
- **Type:** Array of objects describing primary business challenges
- **Format:** Each object contains:
  - `id`: Unique identifier (e.g., "ch1", "ch2")
  - `challenge`: Challenge description
  - `impact`: "High" | "Medium" | "Low"
  - `category`: Category name (e.g., "Technology", "Process", "People")

### Optional Fields
- **situation_narrative:** Current state context (1-2 sentences)
- **burning_platform:** Why now? What's the urgency?
- **investigation_scope:** EA focus areas (["Business Architecture", "Data Architecture", "Application Portfolio"])
- **key_assumptions_to_validate:** Hypotheses requiring proof
- **expected_outcomes:** Desired end-state results

---

## Autopilot vs Legacy Generation

### Autopilot (generateAutopilotStrategicIntent)
- Generates from 3 context questions: industry, region, detail level
- Uses simple schema above
- NO metadata or confidence scores
- Language: Swedish (default) or English

### Legacy (Step 1 generation via Discovery Mode)
- Generates from 7-question interview flow
- Uses same schema + optional fields
- MAY include `_meta` object with assumptions, data sources
- Language: Based on user preference

---

## Rendering Logic

Strategic Intent displayed in:
- **Step 1 card** (home screen): Shows ambition + themes
- **AI Chat context**: Extracted for Steps 2-7 generation
- **Export/Reports**: Full JSON structure

---

## Industry-Specific Requirements

### Financial Services (fastighet, bank, finans)
- **Themes MUST include:** Regulatory compliance (GDPR, PSD2, Basel), core system modernization
- **Metrics:** Cost-to-income ratio, digital adoption %, NPS, compliance score
- **Constraints:** Legacy core banking systems, regulatory approval cycles

### Real Estate (fastighet)
- **Themes MUST include:** ESG/EU Taxonomy compliance, PropTech, tenant experience
- **Metrics:** NOI per sqm, tenant NPS, vacancy rate, CO2 reduction %
- **Constraints:** Outsourced facility management, rent regulations, BREEAM certification

### Public Sector (offentlig sektor)
- **Themes MUST include:** Citizen services, data transparency, cost efficiency
- **Metrics:** Citizen satisfaction, automation %, cost per service
- **Constraints:** Public procurement rules, budget cycles, legacy vendor lock-in

### Retail/E-commerce (handel)
- **Themes MUST include:** Omnichannel, personalization, supply chain visibility
- **Metrics:** Conversion rate, basket size, inventory turnover, CLV
- **Constraints:** Margin pressure, seasonal demand, last-mile delivery

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ **WRONG:** `"strategicVision": { "ambition": "Become a digital leader" }`  
✅ **RIGHT:** 
```json
{
  "strategicVision": {
    "ambition": "Become the leading PropTech-enabled property manager in Nordics by 2027 through AI-driven tenant services and ESG-compliant portfolio optimization, reducing operational costs by 20% while improving tenant NPS from 42 to 65.",
    "themes": ["PropTech Integration", "ESG Compliance (EU Taxonomy)", "AI-Driven Operations", "Tenant Experience Platform"],
    "timeframe": "3-5 years"
  }
}
```

❌ **WRONG:** `"successMetrics": [{"metric": "Increase revenue"}]`  
✅ **RIGHT:** 
```json
{
  "successMetrics": [
    {
      "metric": "Revenue growth (CAGR)",
      "target": "8% → 15%",
      "timeframe": "by 2027"
    },
    {
      "metric": "Operational efficiency (back-office cost reduction)",
      "target": "35% reduction",
      "timeframe": "by 2026"
    },
    {
      "metric": "Time-to-market for new products",
      "target": "6 months → 6 weeks",
      "timeframe": "within 18 months"
    }
  ]
}
```

❌ **WRONG:** `"constraints": [{"type": "Financial", "description": "Limited budget"}]`  
✅ **RIGHT:** 
```json
{
  "constraints": [
    {
      "type": "Financial",
      "description": "€12M transformation budget over 3 years; no CapEx for new datacenters"
    },
    {
      "type": "Technical",
      "description": "Legacy Momentum IWMS must remain operational during 18-month migration"
    },
    {
      "type": "Organisational",
      "description": "No external consultants allowed due to security policy"
    },
    {
      "type": "Operational",
      "description": "Maximum 6-month downtime window for core system migration"
    },
    {
      "type": "External",
      "description": "GDPR compliance mandatory; no non-EU cloud regions"
    }
  ]
}
```

---

## Validation Checklist

Before deploying any Strategic Intent instruction change:
- [ ] strategic_ambition is 2-3 sentence STRING with concrete direction
- [ ] strategic_themes are SPECIFIC to industry (3-5 themes)
- [ ] success_metrics include baseline, target, timeframe (3-4 metrics)
- [ ] strategic_constraints are REAL constraints with specifics (2-3 constraints)
- [ ] Industry examples updated if new sector added
- [ ] Tested with generateAutopilotStrategicIntent() — generates valid JSON
- [ ] NO generic consulting language ("digital transformation" without specifics)

---

## Change Log

- **2026-04-05:** Initial contract created
  - Defined authoritative schema from Autopilot implementation
  - Added industry-specific requirements (Finance, Real Estate, Public Sector, Retail)
  - Documented anti-patterns based on common AI generation failures
