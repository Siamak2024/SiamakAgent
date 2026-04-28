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

### strategic_ambition (STRING - REQUIRED)
- **Type:** String (2-3 sentences)
- **Format:** Executive-level strategic direction statement
- **Pattern:** "We aim to become [position] by [timeframe] through [key approaches]. This will enable [outcome] and differentiate us via [differentiator]."
- **Industry-Specific:** Must reflect actual industry challenges and market dynamics
- **NEVER:** Generic consulting language, vague aspirations without concrete direction

### strategic_themes (ARRAY - REQUIRED)
- **Type:** Array of strings (3-5 themes)
- **Format:** Each theme is action-oriented, specific to industry
- **Examples:**
  - Real Estate: "PropTech Integration", "ESG Compliance (EU Taxonomy)", "Tenant Experience Digitization"
  - Finance: "Open Banking API Platform", "AI-Driven Risk Management", "Core Banking Modernization"
  - Public Sector: "Citizen Portal Unification", "Process Automation (RPA)", "Data Transparency"
- **NEVER:** Generic themes like "Digital Transformation", "Innovation", "Customer Focus" without specificity

### success_metrics (ARRAY - REQUIRED)
- **Type:** Array of strings (3-4 metrics with targets)
- **Format:** "[Metric name]: [Current] → [Target] by [Timeframe]"
- **Examples:**
  - "Cost-to-income ratio: 65% → 48% by 2027"
  - "Digital adoption rate: 30% → 75% within 18 months"
  - "Tenant NPS: 42 → 65 by end of 2026"
- **Must include:** Baseline, target, timeframe (not just "increase X")
- **NEVER:** Unmeasurable aspirations ("Improve satisfaction")

### strategic_constraints (ARRAY - REQUIRED)
- **Type:** Array of strings (2-3 constraints)
- **Format:** Specific operational, regulatory, or resource constraints
- **Examples:**
  - "No budget for full ERP replacement; must modernize incrementally"
  - "GDPR compliance mandatory; no non-EU cloud regions"
  - "Legacy SAP R/3 must remain operational during 24-month migration"
- **Industry-Specific:** Real regulations (GDPR, Basel III, EU Taxonomy), real system names
- **NEVER:** Generic constraints ("Limited budget", "Resistance to change")

### Optional Fields
- **situation_narrative:** Current state context (1-2 sentences)
- **burning_platform:** Why now? What's the urgency?
- **key_constraints:** More detailed version of strategic_constraints
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

❌ **WRONG:** `"strategic_ambition": "Become a digital leader"`  
✅ **RIGHT:** `"strategic_ambition": "Become the leading PropTech-enabled property manager in Nordics by 2027 through AI-driven tenant services and ESG-compliant portfolio optimization, reducing operational costs by 20% while improving tenant NPS from 42 to 65."`

❌ **WRONG:** `"strategic_themes": ["Digital Transformation", "Innovation"]`  
✅ **RIGHT:** `"strategic_themes": ["Open Banking API Platform (PSD2)", "AI-Driven Credit Risk Engine", "Core Banking Migration to Cloud", "Customer Data Platform (CDP)"]`

❌ **WRONG:** `"success_metrics": ["Increase revenue", "Improve efficiency"]`  
✅ **RIGHT:** `"success_metrics": ["Revenue growth: 8% → 15% CAGR by 2027", "Operational efficiency: 35% cost reduction in back-office by 2026", "Time-to-market: 6 months → 6 weeks for new products"]`

❌ **WRONG:** `"strategic_constraints": ["Limited budget"]`  
✅ **RIGHT:** `"strategic_constraints": ["€12M transformation budget over 3 years; no CapEx for new datacenters", "Legacy Momentum IWMS must remain operational during 18-month migration", "No external consultants allowed due to security policy"]`

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
