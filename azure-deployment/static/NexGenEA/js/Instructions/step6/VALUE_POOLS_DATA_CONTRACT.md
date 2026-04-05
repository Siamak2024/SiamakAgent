# Value Pools Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Value Pools (Step 6) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

Value Pools represent **business value opportunities** unlocked by EA transformation.  
Stored as an **array of value pool objects** in `model.valuePools.valuePools`.

---

## Primary Schema (model.valuePools)

```json
{
  "valuePools": [
    {
      "name": "Revenue Pool Name",
      "estimatedValue": "€5M annually",
      "timeToValue": "12-18 months",
      "confidence": "medium",
      "enablers": ["Capability 1", "Capability 2", "Technology Platform"]
    },
    {
      "name": "Cost Reduction Pool",
      "estimatedValue": "€2.5M one-time savings",
      "timeToValue": "6-9 months",
      "confidence": "high",
      "enablers": ["Process Automation", "Cloud Migration"]
    }
  ]
}
```

---

## Field Specifications

### valuePools (ARRAY - REQUIRED)
Array of 5-7 value pool opportunities.

Each value pool object contains:

#### name (STRING - REQUIRED)
- **Format:** Clear, business-oriented pool name
- **Examples:**
  - "Digital Channel Revenue Growth"
  - "Supply Chain Cost Optimization"
  - "Customer Retention Improvement"
  - "Operational Efficiency via Automation"
- **Must be:** Outcome-focused, not technology-focused  
  - ❌ "Implement AI" ✅ "AI-Driven Personalization Revenue"

#### estimatedValue (STRING - REQUIRED)
- **Format:** Monetary value with timeframe
- **Patterns:**
  - Annual recurring: `"€X M annually"` or `"€X M per year"`
  - One-time: `"€X M one-time savings"` or `"€X M NPV over 3 years"`
  - Revenue growth: `"€X M incremental revenue by 2027"`
  - Cost reduction: `"€X M cost reduction annually"`
- **Precision:** Use M (millions) or K (thousands) appropriately
- **Examples:**
  - `"€5.5M annually"` — recurring annual benefit
  - `"€12M one-time savings"` — one-off benefit
  - `"€8M incremental revenue by 2027"` — cumulative growth
- **Must be:** Quantified estimate (NOT "significant value" or "TBD")

#### timeToValue (STRING - REQUIRED)
- **Format:** Time range in months
- **Pattern:** `"X-Y months"` or `"X months"`
- **Examples:**
  - `"6-9 months"` — Short-term
  - `"12-18 months"` — Medium-term
  - `"18-24 months"` — Long-term
- **Factors:**
  - Quick wins: 3-6 months (process changes, low-code)
  - Platform builds: 9-12 months (new systems)
  - Transformation programs: 18-24+ months (org change + tech)

#### confidence (STRING - REQUIRED)
- **Type:** Enum
- **Allowed values:** `low`, `medium`, `high`
- **Definitions:**
  - `high` — Well-understood value driver; proven ROI model; low execution risk
  - `medium` — Clear value hypothesis; some uncertainty on adoption/realization
  - `low` — Speculative value; depends on market conditions or unproven assumptions
- **Distribution:** Mix across confidence levels (not all "high" or all "low")

#### enablers (ARRAY - REQUIRED)
- **Format:** Array of capability/technology enablers
- **Content:** 2-5 specific enablers that unlock this value
- **Examples:**
  - Capabilities: `"Customer Data Platform"`, `"Predictive Analytics"`, `"Omnichannel Order Management"`
  - Technologies: `"Salesforce Marketing Cloud"`, `"Azure ML Platform"`, `"RPA (UiPath)"`
  - Initiatives: `"Cloud Migration"`, `"Legacy Decommission"`, `"API Platform"`
- **Should reference:** Capabilities from Step 3, gaps from Step 5, or platforms from Step 4
- **Must be SPECIFIC:** Not generic "AI" but "AI-driven credit scoring engine"

---

## Value Pool Categories

### Revenue Growth Pools
- **Examples:**
  - "Digital Channel Cross-Sell" (existing customers buy more online)
  - "New Product Launch Velocity" (faster time-to-market)
  - "Dynamic Pricing Optimization" (capture more margin)
- **Measurement:** Incremental revenue, conversion rate lift, ARPU increase

### Cost Reduction Pools
- **Examples:**
  - "Process Automation Savings" (RPA reduces manual work)
  - "Cloud Infrastructure Optimization" (lower hosting costs)
  - "Vendor Consolidation" (reduce license sprawl)
- **Measurement:** FTE reduction, infrastructure cost savings, license cost avoidance

### Risk Mitigation Pools
- **Examples:**
  - "Regulatory Compliance Efficiency" (avoid fines)
  - "Cybersecurity Posture Improvement" (reduce breach risk)
  - "Legacy System Risk Reduction" (avoid outages)
- **Measurement:** Cost of non-compliance avoided, downtime reduction, incident response time

### Strategic Positioning Pools
- **Examples:**
  - "Market Entry Acceleration" (new geographies faster)
  - "Partnership Ecosystem Revenue" (API monetization)
  - "Data-as-a-Service Revenue" (new business model)
- **Measurement:** New market share, partnership revenue, data product revenue

---

## Autopilot vs Legacy Generation

### Autopilot (generateAutopilotValuePools)
- Generates from BMC revenue streams + gap analysis
- 5-7 value pools automatically
- Simplified reasoning (linked to enablers)
- Conservative estimates

### Legacy (Value pool workshop)
- Detailed business case per pool
- NPV calculations with assumptions
- Risk-adjusted value ranges
- Prioritization matrix (value vs effort)

---

## Industry-Specific Examples

### Financial Services
```json
{
  "name": "Open Banking API Monetization",
  "estimatedValue": "€8M annually by 2027",
  "timeToValue": "18-24 months",
  "confidence": "medium",
  "enablers": ["API Management Platform", "Third-Party Developer Portal", "PSD2 Compliance Capability", "Usage-Based Billing"]
}
```

### Real Estate
```json
{
  "name": "PropTech Tenant Services Revenue",
  "estimatedValue": "€3.5M annually",
  "timeToValue": "12-15 months",
  "confidence": "medium",
  "enablers": ["Tenant Mobile App", "Smart Building IoT Platform", "Digital Marketplace Integration", "Payment Gateway"]
}
```

### Public Sector
```json
{
  "name": "Citizen Self-Service Cost Reduction",
  "estimatedValue": "€6M annually (120 FTE equivalent)",
  "timeToValue": "15-18 months",
  "confidence": "high",
  "enablers": ["Unified Citizen Portal", "E-ID Integration", "Case Management Automation", "Chatbot (First-Line Support)"]
}
```

### Retail
```json
{
  "name": "Omnichannel Inventory Optimization",
  "estimatedValue": "€10M annually (inventory carrying cost + markdown reduction)",
  "timeToValue": "9-12 months",
  "confidence": "high",
  "enablers": ["Real-Time Inventory Visibility", "Distributed Order Management", "Demand Forecasting ML", "Ship-from-Store Capability"]
}
```

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ **Non-quantified value:** `"estimatedValue": "Significant cost savings"`  
✅ **Quantified value:** `"estimatedValue": "€4.5M annually (15% operational cost reduction)"`

❌ **Generic pools:** `"name": "Digital Transformation Value"`  
✅ **Specific pools:** `"name": "Mobile Channel Revenue Growth (20% of total sales by 2027)"`

❌ **Technology-focused:** `"name": "Implement AI Platform"`  
✅ **Business outcome-focused:** `"name": "AI-Powered Recommendation Engine Revenue (€6M incremental sales)"`

❌ **Vague enablers:** `"enablers": ["Technology", "Process", "People"]`  
✅ **Specific enablers:** `"enablers": ["Salesforce Einstein AI", "Product Recommendation API", "Customer 360 Data Platform", "A/B Testing Framework"]`

❌ **All high confidence:** Every pool marked "high"  
✅ **Realistic mix:** 2-3 high confidence (proven concepts), 2-3 medium, 1-2 low (speculative)

---

## Validation Checklist

Before deploying any Value Pools instruction change:
- [ ] valuePools array with 5-7 objects
- [ ] Each pool has: name, estimatedValue, timeToValue, confidence, enablers
- [ ] All estimatedValue fields are QUANTIFIED (€X M format with timeframe)
- [ ] timeToValue follows "X-Y months" format
- [ ] Confidence is one of: low, medium, high (distributed realistically)
- [ ] Enablers are specific (2-5 per pool) and reference Step 3/4/5 content
- [ ] Pool names are business-outcome focused (NOT technology projects)
- [ ] Mix of pool types: revenue growth, cost reduction, risk mitigation
- [ ] Tested with generateAutopilotValuePools() — generates valid JSON

---

## Change Log

- **2026-04-05:** Initial contract created
  - Defined authoritative schema from Autopilot implementation
  - Added value pool categories (revenue, cost, risk, strategic)
  - Documented industry-specific examples
  - Added anti-patterns for generic vs quantified content
