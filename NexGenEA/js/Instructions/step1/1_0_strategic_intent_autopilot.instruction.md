# Step 1: Strategic Intent - Autopilot Mode

**MODE:** Autopilot (Fast generation from 3 context questions)
**DATA CONTRACT:** See STRATEGIC_INTENT_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive 3 Autopilot questions:
- `industry`: User's industry (e.g., "Financial Services - Real Estate", "Retail", "Public Sector")
- `region`: Geographic region (e.g., "Sweden", "Nordics", "EU")
- `detailLevel`: Detail preference ("high", "medium", "low")

## Your Task
Generate a Strategic Intent object with **industry-realistic** content.

## MANDATORY Requirements

### 1. Industry Realism
- **WRONG:** Generic "increase customer satisfaction", "digital transformation"
- **RIGHT:** Industry-specific themes with real regulations/trends
  - **Finance/Real Estate:** PSD2, GDPR, Basel III, ESG reporting, PropTech integration
  - **Retail:** Omnichannel commerce, GDPR, sustainability regulations, supply chain resilience
  - **Public Sector:** Digital-first, GDPR, accessibility (WCAG), citizen self-service
  - **Healthcare:** GDPR, medical device regulations, patient safety, interoperability

### 2. Quantified Metrics (REQUIRED)
- **WRONG:** "Improve efficiency", "Reduce costs"
- **RIGHT:** "Reduce operational costs by 15% (from €12M to €10.2M by 2025)"
- Every metric needs: **Baseline → Target → Timeframe**

### 3. Real Strategic Constraints
- **WRONG:** "Budget limitations", "Resistance to change"
- **RIGHT:** 
  - "Legacy mainframe systems (AS/400) with €2M annual maintenance"
  - "GDPR compliance deadline: May 2025"
  - "Union agreements restrict automation in customer service"

### 4. Regional Context
- **Sweden:** Mention BankID, Pensionsmyndigheten, SCB, Swedish Tax Agency if relevant
- **Nordics:** Reference Nordic regulations, cross-border harmonization
- **EU:** PSD2, GDPR, MiFID II, Digital Markets Act

## Output Format

```json
{
  "strategic_ambition": "Clear 2-3 sentence ambition",
  "strategic_themes": [
    "Theme 1 with specific industry context",
    "Theme 2 with regulatory/compliance driver",
    "Theme 3 with technology/capability focus",
    "Theme 4 with customer/stakeholder value"
  ],
  "success_metrics": [
    "Metric 1: Baseline X → Target Y by Date (e.g., Reduce NPS from 45 to 65 by Q4 2025)",
    "Metric 2: Cost reduction €X M → €Y M by Date",
    "Metric 3: Time to market from X weeks → Y weeks by Date"
  ],
  "strategic_constraints": [
    "Constraint 1: Specific legacy system or technical debt",
    "Constraint 2: Regulatory deadline or compliance requirement",
    "Constraint 3: Budget/resource limitation with numbers"
  ]
}
```

## Industry Examples

### Financial Services - Real Estate (Fastighet)
```json
{
  "strategic_ambition": "Transform from property management to data-driven real estate platform enabling predictive maintenance and tenant engagement by 2027, achieving 20% cost reduction and Net Zero 2030.",
  "strategic_themes": [
    "ESG Reporting & Net Zero 2030 compliance with real-time energy tracking",
    "Predictive Maintenance using IoT sensors across 1,200 properties",
    "Digital Tenant Portal with BankID authentication and self-service",
    "Data-Driven Asset Management with portfolio optimization analytics"
  ],
  "success_metrics": [
    "Reduce energy costs by 25% (€8M → €6M annually by 2026)",
    "Lower maintenance costs 20% via predictive models (€5M → €4M by 2027)",
    "Tenant satisfaction score from 3.2/5 → 4.5/5 by Q4 2025",
    "Property portfolio ROI from 4.5% → 6.2% by 2027"
  ],
  "strategic_constraints": [
    "Legacy ERP (SAP R/3 from 2008) with €1.2M annual maintenance",
    "GDPR compliance for tenant data with May 2025 audit deadline",
    "SEK 15M IT budget cap for 2024-2025 transformation",
    "Limited in-house technical skills (2 data engineers, no ML expertise)"
  ]
}
```

### Retail - E-commerce
```json
{
  "strategic_ambition": "Evolve from brick-and-mortar to omnichannel leader with seamless customer experience, achieving 40% online revenue share and carbon-neutral logistics by 2026.",
  "strategic_themes": [
    "Omnichannel Experience with unified inventory and click-and-collect",
    "Personalization Engine using customer behavior analytics",
    "Sustainable Supply Chain with carbon tracking and circular economy",
    "Payment Innovation supporting Klarna, Swish, and digital wallets"
  ],
  "success_metrics": [
    "Online revenue from 22% → 40% of total by Q4 2026",
    "Customer lifetime value from €180 → €320 by 2027",
    "Return rate reduction from 18% → 10% via better sizing tools",
    "Carbon footprint -50% on all logistics by 2026"
  ],
  "strategic_constraints": [
    "POS systems (NCR legacy) not integrated with e-commerce platform",
    "GDPR marketing consent only 35% of customer base",
    "€8M budget for digital transformation (2024-2025)",
    "Warehouse automation limited by lease agreements until 2026"
  ]
}
```

### Public Sector (Offentlig Sektor)
```json
{
  "strategic_ambition": "Deliver citizen-centric digital services with 80% digital self-service adoption, improving accessibility and reducing processing times by 60% by 2026.",
  "strategic_themes": [
    "Digital-First Services with BankID and e-legitimation integration",
    "Accessibility Compliance (WCAG 2.1 AA) across all digital touchpoints",
    "Data Sharing & Interoperability with national registers (Skatteverket, Försäkringskassan)",
    "Process Automation for case management and citizen inquiries"
  ],
  "success_metrics": [
    "Digital self-service adoption from 45% → 80% by Q4 2025",
    "Average case processing time from 14 days → 5 days by 2026",
    "Citizen satisfaction score from 3.8/5 → 4.6/5 by Q4 2025",
    "Staff efficiency: handle 30% more cases with same headcount"
  ],
  "strategic_constraints": [
    "Legacy case management system (built 2012) with no API support",
    "GDPR compliance with strict data minimization requirements",
    "Public procurement rules requiring 18-month vendor selection",
    "€5M IT budget approved for 2024-2026 digitalization"
  ]
}
```

## Anti-Patterns (NEVER DO THIS)

❌ **Generic themes:**
- "Digital transformation"
- "Become more customer-centric"
- "Leverage cloud and AI"

✅ **Industry-specific themes:**
- "PSD2 Open Banking with 10+ FinTech partnerships by Q2 2025"
- "Predictive Maintenance using IoT sensors across 1,200 properties"
- "WCAG 2.1 AA accessibility compliance across all citizen portals"

❌ **Vague metrics:**
- "Improve customer satisfaction"
- "Reduce operational costs"

✅ **Quantified metrics:**
- "NPS from 45 → 65 by Q4 2025"
- "OpEx reduction €12M → €10.2M (-15%) by 2025"

❌ **Generic constraints:**
- "Limited budget"
- "Legacy systems"

✅ **Specific constraints:**
- "€5M IT budget cap for 2024-2025"
- "SAP R/3 (2008) with €1.2M annual maintenance"
- "GDPR audit deadline: May 2025"

## Validation Checklist

Before returning JSON:
- [ ] All 4 strategic themes are **industry-specific** (not generic)
- [ ] All metrics have **baseline → target → timeframe**
- [ ] All constraints mention **specific systems, dates, or amounts**
- [ ] Regional context included (BankID, Swedish agencies if region=Sweden)
- [ ] Regulatory drivers mentioned (GDPR, PSD2, sector regulations)
- [ ] No generic "digital transformation" language
- [ ] JSON is valid and matches schema from DATA_CONTRACT

## Instructions

1. Analyze industry + region from Autopilot context
2. Generate 4 themes specific to that industry's challenges
3. Create 3-4 quantified metrics with real numbers
4. List 3-4 specific constraints (systems, regulations, budget)
5. Validate against checklist above
6. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode - be decisive and realistic. Don't ask follow-up questions. Generate complete strategic intent from available context.
