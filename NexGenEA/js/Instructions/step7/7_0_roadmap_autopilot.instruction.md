# Step 7: Transformation Roadmap - Autopilot Mode

**MODE:** Autopilot (Fast generation from Value Pools + Gap Analysis + Strategic Intent)
**DATA CONTRACT:** See ROADMAP_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive:
- `valuePools`: Value pools with estimated values, enablers
- `gaps`: Gap analysis with remediation actions
- `strategicIntent`: Strategic themes, metrics, constraints
- `capabilities`: Capability map
- `operatingModel`: Operating model platforms
- `industry`: Industry context

## Your Task
Generate a comprehensive **Transformation Roadmap** organizing initiatives into waves with dependencies.

## MANDATORY Requirements

### 1. Wave Sequencing (3-Wave Standard)

**Wave 1: Foundation (0-6 months)**
- Quick wins (high value, low complexity)
- Platform foundations (identity, integration, data)
- Compliance & risk mitigation (GDPR, regulatory deadlines)
- Organizational readiness (training, governance)

**Wave 2: Capability Build (6-18 months)**
- Core platforms (CRM, analytics, IoT)
- Process transformation (automation, digitalization)
- Data & integration maturity
- Pilot programs & learning

**Wave 3: Scale & Optimize (18-36 months)**
- Advanced capabilities (AI/ML, predictive analytics)
- Ecosystem integration (partners, APIs)
- Continuous improvement & innovation
- Full-scale adoption

### 2. Initiative Prioritization

**CRITICAL priority (must-do, 20-30%):**
- Regulatory compliance deadlines (GDPR May 2025, etc.)
- Strategic theme enablers mentioned in Strategic Intent
- Foundation dependencies (identity, master data, integration)
- High-value, low-complexity quick wins

**HIGH priority (core roadmap, 40-50%):**
- Value pools with medium-high confidence
- Capability gaps with priority "critical" or "high"
- Platform implementations enabling multiple capabilities
- Revenue growth & cost reduction initiatives

**MEDIUM priority (nice-to-have, 20-30%):**
- Strategic positioning value pools
- Long-term innovations (AI/ML experiments)
- Process optimizations with low ROI
- Supporting capabilities

### 3. Dependencies (Explicit)

Link initiatives using dependency chains:

❌ **WRONG:**
- "Depends on platform implementation"

✅ **CORRECT:**
- "Depends on INIT-002 (MuleSoft API platform Q1-Q2 2025)"
- "Requires INIT-005 (BankID authentication Q1 2025) + INIT-008 (Salesforce CRM Q1-Q2 2025)"

**Common dependency patterns:**
- Identity/authentication → All digital services
- Master data management → Analytics & reporting
- Integration platform → Cross-system workflows
- Organizational change → Technology adoption

### 4. Initiative Structure

Each initiative must have:
- **Unique ID:** INIT-001, INIT-002, etc.
- **Descriptive name:** Specific initiative (not generic "Implement CRM")
- **Value pool reference:** Link to VP-XXX
- **Capability reference:** Link to CAP-XXX from gap analysis
- **Duration:** Quarters (Q1 2025, Q1-Q2 2025) or months (3 months, 6 months)
- **Budget:** From gap analysis remediation costs
- **Priority:** critical | high | medium
- **Dependencies:** Array of INIT-XXX IDs or "none"

### 5. Wave Budget Balance

**Validate total investment against Strategic Intent constraints:**

Example: If Strategic Intent says "€15M IT budget for 2024-2025":
- **Wave 1 (0-6mo):** €3-5M (20-30% of total)
- **Wave 2 (6-18mo):** €6-8M (40-50% of total)
- **Wave 3 (18-36mo):** €4-6M (20-30% of total)

**Don't exceed stated budget constraints!**

## Output Format

```json
{
  "initiatives": [
    {
      "id": "INIT-001",
      "name": "Specific initiative name",
      "valuePool": "VP-XXX",
      "capabilities": ["CAP-XXX", "CAP-YYY"],
      "duration": "Q1 2025|Q1-Q2 2025|3 months|6 months",
      "budget": "€XXX K",
      "priority": "critical|high|medium",
      "dependencies": ["INIT-XXX", "INIT-YYY"] or "none",
      "description": "1-2 sentence description linking to strategic theme and value pool"
    }
  ],
  "waves": [
    {
      "wave": 1,
      "name": "Foundation (0-6 months)",
      "timeline": "Q4 2024 - Q1 2025",
      "initiativeIds": ["INIT-001", "INIT-002", ...],
      "totalBudget": "€X.X M",
      "expectedValue": "€Y.Y M annually",
      "objectives": ["Objective 1", "Objective 2", "Objective 3"]
    }
  ]
}
```

## Industry Example: Financial Services - Real Estate

```json
{
  "initiatives": [
    {
      "id": "INIT-001",
      "name": "Implement OneTrust GDPR Consent & Privacy Management",
      "valuePool": "VP-005",
      "capabilities": ["CAP-012"],
      "duration": "Q4 2024 - Q1 2025",
      "budget": "€200 K",
      "priority": "critical",
      "dependencies": "none",
      "description": "Deploy OneTrust for tenant consent management and DSAR automation to ensure GDPR compliance by May 2025 audit deadline. Avoids €8M non-compliance fine risk."
    },
    {
      "id": "INIT-002",
      "name": "Deploy MuleSoft Anypoint Platform with API-Led Architecture",
      "valuePool": "VP-009",
      "capabilities": ["CAP-016"],
      "duration": "Q1-Q2 2025",
      "budget": "€380 K",
      "priority": "critical",
      "dependencies": "none",
      "description": "Build integration platform with 8 core APIs (Tenant, Property, Billing, IoT, Contract, Maintenance, Energy, Document). Foundation for all digital services. Enables near-real-time data sync."
    },
    {
      "id": "INIT-003",
      "name": "Implement BankID Authentication for Tenant Portal",
      "valuePool": "VP-003",
      "capabilities": ["CAP-001"],
      "duration": "Q1 2025",
      "budget": "€50 K",
      "priority": "critical",
      "dependencies": ["INIT-001"],
      "description": "Deploy BankID authentication infrastructure with consent management (OneTrust integration). Required for secure tenant portal access and GDPR compliance."
    },
    {
      "id": "INIT-004",
      "name": "Increase DPO to 1.0 FTE & GDPR Training",
      "valuePool": "VP-005",
      "capabilities": ["CAP-012"],
      "duration": "Q1 2025",
      "budget": "€90 K annually",
      "priority": "critical",
      "dependencies": ["INIT-001"],
      "description": "Expand Data Protection Officer from 0.5 to 1.0 FTE. Conduct GDPR training for 25 staff (Property Ops, IT, Finance). Prepare for May 2025 audit."
    },
    {
      "id": "INIT-005",
      "name": "Integrate Salesforce with SAP/Yardi via MuleSoft",
      "valuePool": "VP-003",
      "capabilities": ["CAP-001", "CAP-016"],
      "duration": "Q1 2025",
      "budget": "€150 K",
      "priority": "high",
      "dependencies": ["INIT-002"],
      "description": "Build MuleSoft connectors to synchronize tenant master data from SAP R/3 and Yardi into Salesforce CRM. Enables unified tenant view. Near-real-time sync (<5 min latency)."
    },
    {
      "id": "INIT-006",
      "name": "Develop Tenant Self-Service Portal with BankID",
      "valuePool": "VP-003",
      "capabilities": ["CAP-001", "CAP-002"],
      "duration": "Q1-Q2 2025",
      "budget": "€200 K",
      "priority": "high",
      "dependencies": ["INIT-002", "INIT-003", "INIT-005"],
      "description": "Build tenant portal for rent payment (Swish integration), service requests, contract documents, consumption data. Onboard 600 tenants (50% target) via email campaign + property manager training."
    },
    {
      "id": "INIT-007",
      "name": "Deploy Power BI Premium with Real-Time SAP/Yardi Dashboards",
      "valuePool": "VP-004",
      "capabilities": ["CAP-009", "CAP-015"],
      "duration": "Q1 2025",
      "budget": "€140 K",
      "priority": "high",
      "dependencies": ["INIT-002"],
      "description": "Implement Power BI with 5 dashboards: Portfolio ROI, Property Performance, Cashflow Forecast, Budget vs. Actual, ESG Metrics. Real-time data via MuleSoft APIs. Train Finance team (12 FTEs)."
    },
    {
      "id": "INIT-008",
      "name": "Implement Qualtrics Tenant Feedback Platform",
      "valuePool": "VP-003",
      "capabilities": ["CAP-003"],
      "duration": "Q1 2025",
      "budget": "€60 K",
      "priority": "high",
      "dependencies": ["INIT-003", "INIT-005"],
      "description": "Deploy Qualtrics integrated with Salesforce for quarterly NPS surveys + real-time feedback widget in tenant portal. BankID authentication for 60% response rate target."
    },
    {
      "id": "INIT-009",
      "name": "Deploy Azure IoT Hub - Wave 1 (300 Properties Pilot)",
      "valuePool": "VP-001",
      "capabilities": ["CAP-004", "CAP-005"],
      "duration": "Q1-Q2 2025",
      "budget": "€180 K",
      "priority": "high",
      "dependencies": ["INIT-002"],
      "description": "Install IoT sensors (temperature, humidity, vibration, energy) on 300 properties. Deploy Azure IoT Hub for data ingestion. Integrate with MuleSoft for property/tenant context. Pilot for predictive maintenance & ESG reporting."
    },
    {
      "id": "INIT-010",
      "name": "Automate Manual Processes (Reduce 3 FTEs to 1 FTE)",
      "valuePool": "VP-006",
      "capabilities": ["CAP-001", "CAP-016"],
      "duration": "Q2 2025",
      "budget": "€50 K",
      "priority": "high",
      "dependencies": ["INIT-005", "INIT-006"],
      "description": "Eliminate manual data entry via Salesforce workflow automation and tenant portal self-service. Reduce 3 FTEs to 1 FTE (€120K annual savings). Automate 60% of service request routing."
    },
    {
      "id": "INIT-011",
      "name": "Deploy Azure IoT Hub - Wave 2 (900 Additional Properties)",
      "valuePool": "VP-001",
      "capabilities": ["CAP-004", "CAP-005"],
      "duration": "Q3 2025 - Q2 2026",
      "budget": "€350 K",
      "priority": "high",
      "dependencies": ["INIT-009"],
      "description": "Scale IoT sensor deployment to remaining 900 properties based on Wave 1 pilot learnings. Full estate coverage for energy monitoring and predictive maintenance by Q2 2026."
    },
    {
      "id": "INIT-012",
      "name": "Hire Data Science Team (1 Data Scientist + Train 2 Analysts)",
      "valuePool": "VP-001",
      "capabilities": ["CAP-005", "CAP-014"],
      "duration": "Q1 2025",
      "budget": "€200 K",
      "priority": "high",
      "dependencies": "none",
      "description": "Recruit 1 Data Scientist (€120K) + train 2 existing analysts in Python/scikit-learn (€80K training). Build in-house predictive analytics capability for maintenance forecasting & market analysis."
    },
    {
      "id": "INIT-013",
      "name": "Build Predictive Maintenance ML Models in Azure ML",
      "valuePool": "VP-001",
      "capabilities": ["CAP-005"],
      "duration": "Q4 2025 - Q1 2026",
      "budget": "€120 K",
      "priority": "high",
      "dependencies": ["INIT-009", "INIT-012"],
      "description": "Develop time series forecasting models for equipment failure prediction using IoT sensor data. Integrate with legacy FM system for automated work order generation. Target: 60% failure prevention, 20% maintenance cost reduction."
    },
    {
      "id": "INIT-014",
      "name": "Implement ESG Reporting Platform (Greenstone/Enablon)",
      "valuePool": "VP-007",
      "capabilities": ["CAP-011"],
      "duration": "Q2 2025",
      "budget": "€180 K",
      "priority": "medium",
      "dependencies": ["INIT-009"],
      "description": "Deploy automated ESG reporting platform integrated with Azure IoT (energy data), Yardi (waste/water invoices), building certifications. Net Zero 2030 progress tracking with 5 KPIs."
    },
    {
      "id": "INIT-015",
      "name": "Apply for GRESB Rating",
      "valuePool": "VP-007",
      "capabilities": ["CAP-011"],
      "duration": "Q3 2025",
      "budget": "€25 K",
      "priority": "medium",
      "dependencies": ["INIT-014"],
      "description": "Submit GRESB sustainability rating application using automated ESG data. Target: 4-star rating to unlock green bonds at 0.5% lower interest rate (€250K annual savings on €50M issuance)."
    },
    {
      "id": "INIT-016",
      "name": "Build Predictive Cashflow Models in Power BI",
      "valuePool": "VP-004",
      "capabilities": ["CAP-010"],
      "duration": "Q2-Q3 2025",
      "budget": "€80 K",
      "priority": "medium",
      "dependencies": ["INIT-007", "INIT-012"],
      "description": "Develop predictive models for tenant churn (logistic regression), rent escalation (CPI indexing), vacancy rates (market trends). Integrate with Yardi lease data and market intelligence feeds. Improve forecast accuracy 70%→85%."
    },
    {
      "id": "INIT-017",
      "name": "Migrate Informatica MDM with GDPR Controls",
      "valuePool": "VP-005",
      "capabilities": ["CAP-012"],
      "duration": "Q3-Q4 2025",
      "budget": "€250 K",
      "priority": "high",
      "dependencies": ["INIT-001", "INIT-002"],
      "description": "Implement Informatica Master Data Management for tenant golden records. GDPR-compliant data retention policies (7 years financial, 2 years personal). Integrate with SAP/Yardi as source systems via MuleSoft."
    },
    {
      "id": "INIT-018",
      "name": "Train Property Managers on Digital Tools",
      "valuePool": "VP-010",
      "capabilities": ["CAP-001", "CAP-002"],
      "duration": "Q2-Q3 2025",
      "budget": "€25 K",
      "priority": "high",
      "dependencies": ["INIT-006", "INIT-007", "INIT-008"],
      "description": "Conduct training for 15 property managers on Salesforce CRM, tenant portal support, Power BI dashboards, Qualtrics feedback. Change management via Prosci ADKAR. Enable 20% productivity gains (€240K value)."
    },
    {
      "id": "INIT-019",
      "name": "Migrate SAP R/3 to S/4HANA",
      "valuePool": "VP-001",
      "capabilities": ["CAP-008", "CAP-009", "CAP-016"],
      "duration": "Q3 2025 - Q2 2026",
      "budget": "€1,200 K",
      "priority": "critical",
      "dependencies": ["INIT-002", "INIT-017"],
      "description": "Upgrade legacy SAP R/3 (2008, end-of-life 2027) to S/4HANA. Eliminates €1.2M annual maintenance. Enables real-time financial analytics, IoT integration, and API-led architecture. Phased migration with minimal downtime."
    },
    {
      "id": "INIT-020",
      "name": "Launch Partner Ecosystem Program (PropTech Integrations)",
      "valuePool": "VP-009",
      "capabilities": ["CAP-016"],
      "duration": "Q4 2025 - Q2 2026",
      "budget": "€150 K",
      "priority": "medium",
      "dependencies": ["INIT-002", "INIT-019"],
      "description": "Open API platform to PropTech partners (smart home, energy optimization, tenant engagement). Target: 3 integrations generating €150K value. API governance via MuleSoft Anypoint Platform."
    }
  ],
  "waves": [
    {
      "wave": 1,
      "name": "Foundation (0-6 months)",
      "timeline": "Q4 2024 - Q1 2025",
      "initiativeIds": ["INIT-001", "INIT-002", "INIT-003", "INIT-004", "INIT-005", "INIT-007", "INIT-008", "INIT-012"],
      "totalBudget": "€1,230 K",
      "expectedValue": "€8.5 M risk avoided + €300 K annual savings",
      "objectives": [
        "Achieve GDPR compliance by May 2025 audit (avoid €8M fine risk)",
        "Deploy integration platform foundation (MuleSoft API-led architecture)",
        "Establish identity & security foundation (BankID authentication)",
        "Build analytics capability (Power BI dashboards + Data Science team)",
        "Enable tenant feedback loop (Qualtrics NPS surveys)"
      ]
    },
    {
      "wave": 2,
      "name": "Capability Build (6-18 months)",
      "timeline": "Q2 2025 - Q3 2026",
      "initiativeIds": ["INIT-006", "INIT-009", "INIT-010", "INIT-011", "INIT-013", "INIT-014", "INIT-016", "INIT-017", "INIT-018", "INIT-019"],
      "totalBudget": "€2,555 K",
      "expectedValue": "€6.3 M annually (cost reduction + revenue growth)",
      "objectives": [
        "Launch tenant digital portal with 600 users (50% adoption, €1.5M value)",
        "Deploy IoT sensors across all 1,200 properties (€2M energy savings + €1M maintenance reduction)",
        "Build predictive maintenance capability (20% cost reduction, €1M annually)",
        "Migrate SAP R/3 to S/4HANA (eliminate €1.2M maintenance, enable real-time analytics)",
        "Automate ESG reporting and achieve GRESB rating (€1.8M green finance value)",
        "Achieve tenant satisfaction 3.2→4.5/5 (reduce vacancy, +€800K revenue)"
      ]
    },
    {
      "wave": 3,
      "name": "Scale & Optimize (18-36 months)",
      "timeline": "Q4 2025 - Q2 2027",
      "initiativeIds": ["INIT-015", "INIT-020"],
      "totalBudget": "€175 K",
      "expectedValue": "€2.3 M over 3 years (strategic positioning + innovation)",
      "objectives": [
        "Achieve GRESB 4-star rating (unlock green bonds, €250K annual savings)",
        "Launch PropTech partner ecosystem (3 integrations, €150K value)",
        "Optimize portfolio ROI from 4.5%→6.2% (€3.2M annually)",
        "Establish continuous improvement culture (Kaizen, quarterly retrospectives)",
        "Position as PropTech leader in Swedish real estate market"
      ]
    }
  ]
}
```

## Anti-Patterns (NEVER DO THIS)

❌ **Vague initiative names:**
```json
"name": "Implement CRM"
```

✅ **Specific initiative names:**
```json
"name": "Integrate Salesforce with SAP/Yardi via MuleSoft"
```

❌ **No dependencies:**
```json
// All initiatives have "dependencies": "none"
```

✅ **Explicit dependency chains:**
```json
"dependencies": ["INIT-002", "INIT-003", "INIT-005"]
```

❌ **Unrealistic budget:**
```json
// Wave 1: €10M, Wave 2: €5M, Wave 3: €2M
// (frontloaded, ignores learning curve)
```

✅ **Balanced budget:**
```json
// Wave 1: €1.2M (foundation), Wave 2: €2.5M (build), Wave 3: €0.2M (optimize)
```

❌ **All critical priority:**
```json
// WRONG: Every initiative marked "critical"
```

✅ **Realistic priority distribution:**
```json
// CORRECT: 25% critical, 50% high, 25% medium
```

## Validation Checklist

Before returning JSON:
- [ ] 15-25 initiatives total
- [ ] 3 waves defined with clear timeline boundaries
- [ ] Wave 1 focuses on foundations (identity, integration, compliance, quick wins)
- [ ] Wave 2 builds core capabilities (platforms, automation, analytics)
- [ ] Wave 3 scales and optimizes (AI/ML, ecosystem, continuous improvement)
- [ ] ALL initiatives have explicit dependencies or "none"
- [ ] Dependency chains are logical (e.g., portal depends on BankID + integration)
- [ ] Priority distribution: ~25% critical, ~50% high, ~25% medium
- [ ] Budget distribution: ~25% Wave 1, ~60% Wave 2, ~15% Wave 3
- [ ] Total budget does NOT exceed Strategic Intent constraint (e.g., €15M cap)
- [ ] ALL initiatives reference value pools (VP-XXX) and capabilities (CAP-XXX)
- [ ] Compliance deadlines (GDPR May 2025) scheduled in Wave 1
- [ ] JSON is valid and matches schema from DATA_CONTRACT

## Instructions

1. Extract value pool enablers (these become initiative budgets)
2. Extract gap remediation actions (these become initiative descriptions)
3. Extract Strategic Intent constraints (budget cap, compliance deadlines)
4. Organize initiatives into 3 waves based on dependency logic
5. Assign priorities: critical (deadlines, foundations, quick wins), high (core), medium (nice-to-have)
6. Map dependencies: identity/integration → digital services, data → analytics, etc.
7. Calculate wave budgets (validate against Strategic Intent budget cap)
8. Calculate expected value per wave (sum value pools)
9. Write wave objectives aligned with Strategic Intent themes
10. Validate against checklist above
11. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode - be decisive and complete. Generate comprehensive roadmap with explicit dependencies. Ensure Wave 1 includes compliance deadlines and foundations.
