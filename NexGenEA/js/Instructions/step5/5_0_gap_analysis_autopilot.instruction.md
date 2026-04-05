# Step 5: Gap Analysis - Autopilot Mode

**MODE:** Autopilot (Fast generation from Capabilities + Strategic Intent)
**DATA CONTRACT:** See GAP_ANALYSIS_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive:
- `capabilities`: Capability map with current maturity levels (1-5)
- `strategicIntent`: Strategic themes, target metrics, constraints
- `bmc`: Business model canvas
- `operatingModel`: Operating model with platforms/processes
- `industry`: Industry context

## Your Task
Generate a comprehensive **Gap Analysis** identifying maturity gaps for strategic capabilities.

## MANDATORY Requirements

### 1. Gap Calculation Logic

For each capability with `strategicImportance: "critical" or "high"`:

1. **Current Maturity:** From capability map (1-5)
2. **Target Maturity:** Based on strategic intent themes
   - If capability enables strategic theme → Target 4-5
   - If capability supports strategic theme → Target 3-4
   - If capability mentioned in success metrics → Target 4
3. **Gap:** `targetMaturity - currentMaturity`
4. **Priority:** Critical (gap 3+) | High (gap 2) | Medium (gap 1)

### 2. Gap Prioritization (MANDATORY Distribution)

**Target distribution:**
- **Critical priority:** 20-30% of gaps (typically gap size 3+)
- **High priority:** 40-50% of gaps (typically gap size 2)
- **Medium priority:** 30-40% of gaps (typically gap size 1)

**Priority criteria:**
- **Critical:** Large gap (3+) AND strategic theme dependency AND compliance risk
- **High:** Medium gap (2) AND mentioned in BMC/metrics AND platform dependency
- **Medium:** Small gap (1) OR supporting capability OR stable current state

### 3. Root Cause Analysis (Be Specific)

❌ **WRONG (Generic):**
- "Lack of technology"
- "Process not mature"
- "No resources"

✅ **CORRECT (Specific):**
- "Legacy SAP R/3 (2008) has no IoT integration APIs. €1.2M annual maintenance, end-of-life 2027."
- "Manual Excel-based analysis. No predictive models. Team lacks data science skills (0 FTEs)."
- "GDPR consent management not implemented. May 2025 audit deadline. Tenant data in 3 siloed systems."

### 4. Impact Quantification

Link gaps to Strategic Intent metrics:

❌ **WRONG:**
- "Impacts customer satisfaction"
- "Reduces efficiency"

✅ **CORRECT:**
- "Prevents achieving tenant satisfaction target 3.2→4.5/5 by Q4 2025"
- "Blocks €2M cost reduction (€5M→€4M maintenance target)"
- "Risk: GDPR non-compliance fine up to 4% revenue (€8M)"

### 5. Remediation Actions (Actionable)

❌ **WRONG:**
- "Implement new system"
- "Improve process"
- "Train staff"

✅ **CORRECT:**
- "Deploy Azure IoT Hub with MQTT sensors across 1,200 properties (Wave 1: Q1-Q2 2025, 300 properties pilot)"
- "Hire 1 Data Scientist + train 2 analysts in Python/scikit-learn (Q1 2025, €180K budget)"
- "Implement OneTrust consent management with BankID integration (Q4 2024-Q1 2025, €120K)"

## Output Format

```json
{
  "gaps": [
    {
      "capabilityId": "CAP-XXX",
      "capabilityName": "Capability name from map",
      "domain": "Domain from capability map",
      "currentMaturity": 1-5,
      "targetMaturity": 1-5,
      "gap": 0-4,
      "priority": "critical|high|medium",
      "rootCause": "Specific reason with system/process/skill details",
      "impact": "Quantified impact on strategic metrics",
      "remediation": "Specific action with timeline and budget"
    }
  ]
}
```

## Industry Example: Financial Services - Real Estate

```json
{
  "gaps": [
    {
      "capabilityId": "CAP-005",
      "capabilityName": "Predict Maintenance Needs",
      "domain": "Property & Asset Management",
      "currentMaturity": 1,
      "targetMaturity": 4,
      "gap": 3,
      "priority": "critical",
      "rootCause": "No predictive analytics capability. Reactive maintenance only. IoT sensors not deployed. No data science team (0 FTEs). Legacy FM system has no ML integration.",
      "impact": "Prevents €1M maintenance cost reduction target (€5M→€4M by 2027). Delays Net Zero 2030 energy optimization. Risk: equipment failures increase downtime 20%.",
      "remediation": "Phase 1 (Q1-Q2 2025): Deploy Azure IoT Hub with temp/vibration sensors on 300 properties pilot (€180K). Phase 2 (Q3 2025): Hire 1 Data Scientist, train 2 analysts in Python/ML (€200K). Phase 3 (Q4 2025-Q1 2026): Build predictive models in Azure ML (€120K)."
    },
    {
      "capabilityId": "CAP-012",
      "capabilityName": "Ensure GDPR Compliance",
      "domain": "Compliance & Risk",
      "currentMaturity": 2,
      "targetMaturity": 4,
      "gap": 2,
      "priority": "critical",
      "rootCause": "Tenant data in 3 siloed systems (SAP R/3, Yardi, Excel). No consent management platform. Manual data subject access requests (DSAR) taking 15 days vs. 30-day legal limit. DPO part-time (0.5 FTE).",
      "impact": "GDPR non-compliance risk: fines up to 4% of revenue (€8M). May 2025 audit deadline. Reputation risk if data breach occurs. Blocks digital tenant portal launch (BankID integration requires consent framework).",
      "remediation": "Q4 2024-Q1 2025: Implement OneTrust consent & privacy management (€120K license + €80K implementation). Automate DSAR workflows (target 5-day response). Increase DPO to 1.0 FTE (€90K annual). Migrate tenant data to Informatica MDM with GDPR controls (Wave 2, €250K)."
    },
    {
      "capabilityId": "CAP-001",
      "capabilityName": "Manage Tenant Relationships",
      "domain": "Customer & Tenant Management",
      "currentMaturity": 2,
      "targetMaturity": 4,
      "gap": 2,
      "priority": "high",
      "rootCause": "No unified tenant view. CRM (Salesforce) implemented Q4 2024 but not integrated with SAP/Yardi. BankID authentication ready but portal UX incomplete. 60% of tenants still use phone/email only.",
      "impact": "Prevents tenant satisfaction target 3.2/5→4.5/5 by Q4 2025. Delays strategic theme 'Digital Tenant Portal'. Inefficient: 3 FTEs manually entering data in multiple systems (€180K annual waste).",
      "remediation": "Q1 2025: Complete MuleSoft integration SAP/Yardi→Salesforce (€150K). Q1-Q2 2025: Develop tenant self-service portal (rent payment, service requests, contract docs) with BankID (€200K). Q2 2025: Onboard 600 tenants (50% target) via email campaign + property manager training."
    },
    {
      "capabilityId": "CAP-009",
      "capabilityName": "Analyze Portfolio Performance",
      "domain": "Financial Management & Billing",
      "currentMaturity": 2,
      "targetMaturity": 4,
      "gap": 2,
      "priority": "high",
      "rootCause": "Manual Excel-based financial analysis. No automated dashboards. Data from SAP/Yardi exported weekly (batch files). No predictive ROI modeling. CFO relies on month-old data for investment decisions.",
      "impact": "Prevents portfolio ROI target 4.5%→6.2% by 2027. Slow decision-making: property acquisition analysis takes 3 weeks vs. 3 days target. Risk: missed investment opportunities worth €2M annually.",
      "remediation": "Q1 2025: Deploy Power BI Premium with real-time SAP/Yardi connectors (€80K license + €60K setup). Build 5 dashboards: Portfolio ROI, Property Performance, Cashflow Forecast, Budget vs. Actual, ESG Metrics. Q2 2025: Train Finance team (12 FTEs) on Power BI (€20K). Q3 2025: Implement predictive ROI models in Python (€40K)."
    },
    {
      "capabilityId": "CAP-004",
      "capabilityName": "Monitor Building Energy",
      "domain": "Property & Asset Management",
      "currentMaturity": 2,
      "targetMaturity": 4,
      "gap": 2,
      "priority": "high",
      "rootCause": "IoT sensors deployed on 150/1,200 properties only (12%). Manual meter readings monthly. No real-time energy monitoring. Data not integrated with ESG reporting platform. Net Zero 2030 progress tracking is manual Excel.",
      "impact": "Delays €2M energy cost reduction target (€8M→€6M by 2026). Risks Net Zero 2030 commitment. ESG reporting incomplete: missing 88% of property energy data. Tenant complaints about high energy bills (no transparency).",
      "remediation": "Wave 1 (Q1-Q3 2025): Deploy IoT sensors to 600 additional properties (€300K hardware + €80K Azure IoT Hub). Wave 2 (Q4 2025-Q2 2026): Remaining 450 properties (€250K). Integrate Azure IoT→Power BI for real-time dashboards (€60K). Train 5 property managers on energy analytics (€15K)."
    },
    {
      "capabilityId": "CAP-016",
      "capabilityName": "Integrate Data Sources",
      "domain": "Technology & Integration",
      "currentMaturity": 1,
      "targetMaturity": 4,
      "gap": 3,
      "priority": "critical",
      "rootCause": "No API layer. SAP R/3 (2008) has no REST APIs. Yardi integration via nightly batch files (SFTP). IoT data stored separately in Azure (not linked to tenant/property master data). 15 point-to-point integrations. Data latency 24 hours.",
      "impact": "Blocks real-time tenant portal (needs live data). Prevents predictive maintenance (IoT + FM data must merge). Manual data reconciliation costs €120K annually (2 FTEs). GDPR risk: data inconsistency across systems.",
      "remediation": "Q1-Q2 2025: Deploy MuleSoft Anypoint Platform with API-led architecture (€180K license + €200K implementation). Build 8 core APIs: Tenant, Property, Billing, IoT, Contract, Maintenance, Energy, Document. Phase out 10 batch integrations. Q3 2025: Migrate to near-real-time sync (<5 min latency)."
    },
    {
      "capabilityId": "CAP-011",
      "capabilityName": "Report ESG Metrics",
      "domain": "Compliance & Risk",
      "currentMaturity": 2,
      "targetMaturity": 4,
      "gap": 2,
      "priority": "high",
      "rootCause": "Manual data collection from 8 sources (energy bills, waste invoices, tenant surveys, building certs). No automated ESG dashboard. Sustainability Manager spends 40% time on data gathering. Net Zero 2030 tracking is annual Excel report.",
      "impact": "Delays Net Zero 2030 progress visibility. Investor ESG due diligence requests take 2 weeks (should be real-time). Risk: non-compliance with EU Taxonomy Regulation (reporting deadline 2026). Competitive disadvantage: peer firms have ESG ratings (GRESB).",
      "remediation": "Q2 2025: Implement ESG reporting platform (e.g., Greenstone, Enablon) integrated with IoT energy data (€100K license + €80K setup). Automate data collection from Azure IoT, Yardi, waste contractor APIs. Build ESG dashboard in Power BI (5 metrics: Energy, Waste, Water, Carbon, Tenant Wellbeing). Q3 2025: Apply for GRESB rating (€25K)."
    },
    {
      "capabilityId": "CAP-003",
      "capabilityName": "Analyze Tenant Satisfaction",
      "domain": "Customer & Tenant Management",
      "currentMaturity": 1,
      "targetMaturity": 3,
      "gap": 2,
      "priority": "medium",
      "rootCause": "Annual paper survey only (35% response rate). No real-time feedback mechanism. No NPS tracking. Complaints captured in email (not structured). No sentiment analysis or trend reporting.",
      "impact": "Prevents tenant satisfaction target 3.2/5→4.5/5 by Q4 2025. No early warning for churn (avg tenant lifetime 5 years, churn cost €8K per tenant). Property managers lack actionable insights.",
      "remediation": "Q1 2025: Implement Qualtrics tenant feedback platform integrated with Salesforce (€40K license + €20K setup). Launch quarterly NPS surveys with BankID authentication (60% response rate target). Q2 2025: Add real-time feedback widget to tenant portal. Q3 2025: Train 15 property managers on feedback analytics (€10K)."
    },
    {
      "capabilityId": "CAP-010",
      "capabilityName": "Forecast Property Cashflow",
      "domain": "Financial Management & Billing",
      "currentMaturity": 2,
      "targetMaturity": 3,
      "gap": 1,
      "priority": "medium",
      "rootCause": "Cashflow forecasting based on historical averages (3-year rolling). No predictive models for tenant churn, rent escalation, vacancy rates. Finance team uses Excel templates (not automated). Forecast accuracy 70% (vs. 90% industry benchmark).",
      "impact": "Suboptimal investment decisions. Bank financing requires 12-month cashflow forecast with 85% accuracy (currently 70%). Risk: liquidity shortfall if vacancy rate spikes (no scenario modeling).",
      "remediation": "Q2-Q3 2025: Build predictive cashflow model in Power BI with tenant churn probability (logistic regression), rent escalation (CPI indexing), vacancy rates (market trends). Integrate with Yardi lease data and market intelligence (€60K consulting + €20K data feeds). Improve forecast accuracy to 85% by Q4 2025."
    }
  ]
}
```

## Anti-Patterns (NEVER DO THIS)

❌ **All gaps marked critical:**
```json
// WRONG: Every gap is "critical" - no prioritization
{"priority": "critical"}, {"priority": "critical"}, ...
```

✅ **Realistic priority distribution:**
```json
// CORRECT: 2-3 critical, 4-5 high, 3-4 medium
```

❌ **Generic root causes:**
```json
"rootCause": "Process not mature"
```

✅ **Specific root causes:**
```json
"rootCause": "Legacy SAP R/3 (2008) has no IoT APIs. €1.2M annual maintenance. End-of-life 2027."
```

❌ **Vague impact:**
```json
"impact": "Reduces efficiency"
```

✅ **Quantified impact:**
```json
"impact": "Prevents €1M cost reduction target (€5M→€4M by 2027). Risk: 20% downtime increase."
```

❌ **Generic remediation:**
```json
"remediation": "Implement new platform"
```

✅ **Specific remediation with timeline/budget:**
```json
"remediation": "Q1-Q2 2025: Deploy Azure IoT Hub (€180K). Hire 1 Data Scientist (€200K). Build ML models (€120K)."
```

## Validation Checklist

Before returning JSON:
- [ ] 8-12 gaps total (only strategic capabilities)
- [ ] Priority distribution: 20-30% critical, 40-50% high, 30-40% medium
- [ ] ALL gaps have specific root causes (systems, processes, skills mentioned)
- [ ] ALL gaps have quantified impact (link to strategic metrics)
- [ ] ALL remediation actions include timeline (Q1 2025, Wave 2, etc.) and budget (€XK)
- [ ] Gap size matches priority (critical=3+, high=2, medium=1)
- [ ] Capability IDs match capability map
- [ ] Root causes reference Operating Model platforms/constraints
- [ ] JSON is valid and matches schema from DATA_CONTRACT

## Instructions

1. Filter capabilities to `strategicImportance: "critical" or "high"` only
2. For each capability, calculate target maturity from strategic themes
3. Calculate gap = targetMaturity - currentMaturity
4. Assign priority based on gap size + strategic impact + compliance risk
5. Write specific root cause referencing Operating Model constraints
6. Quantify impact using Strategic Intent metrics
7. Define remediation with timeline (quarters/waves) and budget
8. Validate priority distribution (not all critical!)
9. Validate against checklist above
10. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode - be decisive and complete. Generate comprehensive gap analysis without asking follow-up questions. Use real numbers from strategic intent.
