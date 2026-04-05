# Step 6: Value Pools - Autopilot Mode

**MODE:** Autopilot (Fast generation from Gap Analysis + Strategic Intent + BMC)
**DATA CONTRACT:** See VALUE_POOLS_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive:
- `gaps`: Gap analysis with remediation actions and costs
- `strategicIntent`: Strategic themes, success metrics
- `bmc`: Business model canvas
- `capabilities`: Capability map
- `operatingModel`: Operating model with platforms
- `industry`: Industry context

## Your Task
Generate **quantified Value Pools** translating strategic initiatives into business value.

## MANDATORY Requirements

### 1. Value Quantification (NON-NEGOTIABLE)

**ALL value pools MUST use exact format:**

✅ **CORRECT:**
- "€2.5 M annually"
- "€180 K one-time"
- "€1.2 M over 3 years"
- "€450 K annual recurring"

❌ **WRONG:**
- "Significant cost reduction" (no number)
- "Improved efficiency" (vague)
- "High" (qualitative)
- "2.5M" (missing currency/timeframe)

**Formula:** `€[Amount] [M/K] [annually|one-time|over X years]`

### 2. Value Pool Categories (4 Required)

**Every value pool belongs to ONE category:**

1. **Revenue Growth:** New income streams, pricing optimization, market expansion
2. **Cost Reduction:** OpEx savings, automation, efficiency gains
3. **Risk Mitigation:** Compliance fines avoided, downtime reduction, security improvements
4. **Strategic Positioning:** Brand value, competitive advantage, capability building

**Target distribution:**
- Revenue Growth: 25-35% of pools
- Cost Reduction: 30-40% of pools
- Risk Mitigation: 15-25% of pools
- Strategic Positioning: 10-20% of pools

### 3. Time to Value

**Realistic phasing:**
- **Quick wins (0-6 months):** Process improvements, tool adoption, training
- **Medium-term (6-18 months):** Platform implementation, organizational change
- **Long-term (18-36 months):** Digital transformation, cultural shift, ecosystem buildout

### 4. Confidence Levels

**Evidence-based scoring:**
- **High (80-95%):** Proven ROI, vendor benchmarks, pilot results
- **Medium (60-80%):** Industry benchmarks, comparable case studies
- **Low (40-60%):** Aspirational, new capability, uncertain market

### 5. Enablers (Specific)

Link to Gap Analysis remediation actions and Operating Model platforms:

❌ **WRONG:**
- "Technology implementation"
- "Process improvement"

✅ **CORRECT:**
- "Azure IoT Hub deployment (300 properties Q1-Q2 2025, €180K)"
- "MuleSoft API integration SAP/Yardi (€150K Q1 2025)"
- "OneTrust GDPR consent management (€120K Q4 2024)"

## Output Format

```json
{
  "value_pools": [
    {
      "id": "VP-001",
      "name": "Descriptive value pool name",
      "category": "revenue_growth|cost_reduction|risk_mitigation|strategic_positioning",
      "estimatedValue": "€X.X M annually|one-time|over Y years",
      "timeToValue": "0-6 months|6-18 months|18-36 months",
      "confidence": "high|medium|low",
      "enablers": [
        "Specific initiative from gap analysis with cost",
        "Platform/capability from operating model",
        "Organizational change with timeline"
      ],
      "assumptions": [
        "Key assumption 1 with number/benchmark",
        "Key assumption 2 with baseline/target"
      ]
    }
  ]
}
```

## Industry Example: Financial Services - Real Estate

```json
{
  "value_pools": [
    {
      "id": "VP-001",
      "name": "Predictive Maintenance Cost Reduction",
      "category": "cost_reduction",
      "estimatedValue": "€1.0 M annually",
      "timeToValue": "18-36 months",
      "confidence": "medium",
      "enablers": [
        "Azure IoT Hub deployment (1,200 properties, €530K total investment Wave 1-2)",
        "Hire 1 Data Scientist + train 2 analysts (€200K, Q1 2025)",
        "Build predictive ML models in Azure ML (€120K, Q4 2025-Q1 2026)",
        "Integration with legacy FM system (€80K)"
      ],
      "assumptions": [
        "Predictive maintenance reduces reactive maintenance costs by 20% (€5M→€4M baseline)",
        "IoT sensors prevent 60% of equipment failures (industry benchmark: Siemens study)",
        "Full deployment by Q2 2026 with 18-month learning curve",
        "Assumes stable energy prices (±10% variance)"
      ]
    },
    {
      "id": "VP-002",
      "name": "Energy Cost Optimization via Real-Time Monitoring",
      "category": "cost_reduction",
      "estimatedValue": "€2.0 M annually",
      "timeToValue": "6-18 months",
      "confidence": "high",
      "enablers": [
        "IoT sensors deployment to 1,200 properties (€530K Wave 1-2, Q1-Q2 2026)",
        "Power BI ESG dashboards with real-time energy tracking (€60K, Q2 2025)",
        "Train 5 property managers on energy analytics (€15K, Q3 2025)",
        "Integrate Azure IoT→Power BI (€60K, Q2 2025)"
      ],
      "assumptions": [
        "25% energy cost reduction per strategic intent target (€8M→€6M)",
        "Real-time monitoring enables 15% additional savings via behavioral change (tenant awareness)",
        "Swedish electricity prices avg 1.20 SEK/kWh (2024 baseline)",
        "Net Zero 2030 progress tracking improves sustainability incentives (ESG investors)"
      ]
    },
    {
      "id": "VP-003",
      "name": "Tenant Lifetime Value Growth via Digital Portal",
      "category": "revenue_growth",
      "estimatedValue": "€1.5 M annually",
      "timeToValue": "6-18 months",
      "confidence": "medium",
      "enablers": [
        "Salesforce Service Cloud + BankID tenant portal (€200K, Q1-Q2 2025)",
        "MuleSoft integration SAP/Yardi→Salesforce (€150K, Q1 2025)",
        "Onboard 600 tenants via email campaign + manager training (€30K, Q2 2025)",
        "Qualtrics tenant feedback platform (€60K, Q1 2025)"
      ],
      "assumptions": [
        "Tenant satisfaction increases 3.2/5→4.5/5 per strategic intent",
        "Higher satisfaction reduces churn by 30% (5-year avg tenure→6.5 years)",
        "Reduced churn saves €8K per tenant acquisition cost × 25 tenants = €200K annually",
        "Premium service tier (€50/month) adopted by 20% of tenants (240 tenants) = €144K annually",
        "Referral program generates 10 new leases/year = €80K revenue",
        "Total: €200K + €144K + €80K + upsell €1.1M = €1.5M"
      ]
    },
    {
      "id": "VP-004",
      "name": "Portfolio ROI Optimization via Data-Driven Decisions",
      "category": "revenue_growth",
      "estimatedValue": "€3.2 M annually",
      "timeToValue": "18-36 months",
      "confidence": "medium",
      "enablers": [
        "Power BI Premium with real-time SAP/Yardi dashboards (€140K, Q1 2025)",
        "Predictive ROI models in Python (€40K, Q3 2025)",
        "Train Finance team (12 FTEs) on analytics (€20K, Q2 2025)",
        "Market intelligence data feeds (€20K annually)"
      ],
      "assumptions": [
        "Portfolio ROI target 4.5%→6.2% per strategic intent",
        "1.7% ROI improvement on €188M property portfolio = €3.2M annually",
        "Faster investment decisions (3 weeks→3 days) capture 2 additional acquisitions/year",
        "Optimized property mix (divest 5 underperforming assets, reinvest in high-ROI) improves yield",
        "Cashflow forecast accuracy 70%→85% reduces financing costs (better loan terms)"
      ]
    },
    {
      "id": "VP-005",
      "name": "GDPR Compliance Risk Mitigation",
      "category": "risk_mitigation",
      "estimatedValue": "€8.0 M avoided risk",
      "timeToValue": "0-6 months",
      "confidence": "high",
      "enablers": [
        "OneTrust consent & privacy management (€200K, Q4 2024-Q1 2025)",
        "Increase DPO to 1.0 FTE (€90K annually)",
        "Informatica MDM with GDPR controls (€250K, Wave 2)",
        "DSAR workflow automation (included in OneTrust)"
      ],
      "assumptions": [
        "GDPR non-compliance fine up to 4% of revenue (€200M revenue = €8M max fine)",
        "May 2025 audit deadline requires compliance by Q1 2025",
        "OneTrust reduces DSAR response time from 15 days→5 days (meets 30-day legal limit)",
        "Avoided fines: €8M (worst case), €500K (likely case for minor violations)",
        "Reputation protection: data breach costs avg €3.2M (IBM Security study)"
      ]
    },
    {
      "id": "VP-006",
      "name": "Manual Process Automation Efficiency",
      "category": "cost_reduction",
      "estimatedValue": "€300 K annually",
      "timeToValue": "0-6 months",
      "confidence": "high",
      "enablers": [
        "MuleSoft API integration eliminates 10 batch integrations (€200K, Q1-Q2 2025)",
        "Salesforce automation reduces manual data entry (3 FTEs → 1 FTE)",
        "Power BI automation replaces manual Excel reports (2 FTEs save 30% time)"
      ],
      "assumptions": [
        "3 FTEs currently doing manual data entry at €60K each = €180K annually",
        "Automation reduces to 1 FTE = €120K annual savings",
        "Finance team (2 FTEs) saves 30% time on reporting = €36K (€60K avg salary)",
        "Data reconciliation eliminated = €120K savings (2 FTEs currently doing this)",
        "Total: €120K + €36K + €120K = €276K ≈ €300K"
      ]
    },
    {
      "id": "VP-007",
      "name": "ESG Rating & Green Finance Access",
      "category": "strategic_positioning",
      "estimatedValue": "€1.8 M over 3 years",
      "timeToValue": "18-36 months",
      "confidence": "medium",
      "enablers": [
        "ESG reporting platform (Greenstone/Enablon, €180K, Q2 2025)",
        "GRESB rating application (€25K, Q3 2025)",
        "Automated IoT energy data collection (€530K Wave 1-2)",
        "Net Zero 2030 roadmap & carbon accounting (€40K consulting)"
      ],
      "assumptions": [
        "GRESB 4-star rating unlocks green bonds at 0.5% lower interest rate",
        "€50M green bond issuance at 2.5% vs. 3.0% conventional = €250K savings annually",
        "ESG-focused investors increase valuation multiple by 0.2x (€188M portfolio × 5% cap rate = €940M valuation → €40M premium over 3 years)",
        "Tenant preference for sustainable buildings increases occupancy 2% (€1.2M rent/year × 2% = €24K)",
        "Total 3-year value: €750K (bond savings) + €40M (valuation) discounted = €1.8M NPV"
      ]
    },
    {
      "id": "VP-008",
      "name": "Vacancy Rate Reduction via Tenant Experience",
      "category": "revenue_growth",
      "estimatedValue": "€800 K annually",
      "timeToValue": "6-18 months",
      "confidence": "high",
      "enablers": [
        "Tenant portal with self-service (€200K, Q1-Q2 2025)",
        "Qualtrics NPS surveys (€60K, Q1 2025)",
        "BankID authentication & payment integration (€50K, Q1 2025)",
        "Property manager training on tenant engagement (€10K, Q3 2025)"
      ],
      "assumptions": [
        "Current vacancy rate 8% on 1,200 units = 96 vacant units",
        "Tenant satisfaction 3.2→4.5/5 reduces vacancy to 6% = 72 vacant units",
        "24 fewer vacant units × €2,800/month avg rent × 12 months = €806K annually",
        "Industry benchmark: 1-point NPS improvement = 1% vacancy reduction (Qualtrics study)",
        "Digital portal reduces tenant move-out rate by 15% (faster issue resolution)"
      ]
    },
    {
      "id": "VP-009",
      "name": "Data Integration Agility & Innovation Speed",
      "category": "strategic_positioning",
      "estimatedValue": "€500 K annually",
      "timeToValue": "6-18 months",
      "confidence": "medium",
      "enablers": [
        "MuleSoft Anypoint Platform with 8 core APIs (€380K, Q1-Q2 2025)",
        "Phase out 10 batch integrations (reduce maintenance €50K annually)",
        "Near-real-time data sync (<5 min latency)",
        "API-led architecture enables future innovation"
      ],
      "assumptions": [
        "Faster time-to-market for new digital services (tenant app features: 6 months→2 months)",
        "2 new revenue-generating features/year × €150K average = €300K",
        "Reduced integration maintenance: €50K annually (eliminate 2 FTEs worth of batch job monitoring)",
        "Partner ecosystem enablement (e.g., PropTech integrations): €150K value from 3 partnerships",
        "Total: €300K + €50K + €150K = €500K"
      ]
    },
    {
      "id": "VP-010",
      "name": "Property Manager Productivity Gains",
      "category": "cost_reduction",
      "estimatedValue": "€240 K annually",
      "timeToValue": "6-18 months",
      "confidence": "high",
      "enablers": [
        "Salesforce automation + tenant portal (€200K, Q1-Q2 2025)",
        "IoT alerts reduce manual property inspections (€530K, Wave 1-2)",
        "Power BI dashboards replace manual reporting (€60K, Q1 2025)",
        "Train 15 property managers on new tools (€10K, Q2 2025)"
      ],
      "assumptions": [
        "15 property managers × €80K salary = €1.2M total labor cost",
        "Automation saves 20% time (self-service portal handles 40% of inquiries)",
        "20% × €1.2M = €240K equivalent capacity",
        "Redirect capacity to higher-value activities (tenant relationship building, strategic planning)",
        "Industry benchmark: digital portals reduce service request handling time 30-40%"
      ]
    }
  ]
}
```

## Anti-Patterns (NEVER DO THIS)

❌ **Vague value:**
```json
"estimatedValue": "High cost savings"
```

✅ **Quantified value:**
```json
"estimatedValue": "€1.0 M annually"
```

❌ **Generic enablers:**
```json
"enablers": ["Implement CRM", "Improve process"]
```

✅ **Specific enablers with costs:**
```json
"enablers": [
  "Salesforce Service Cloud + BankID (€200K, Q1-Q2 2025)",
  "MuleSoft integration SAP/Yardi (€150K, Q1 2025)"
]
```

❌ **No assumptions:**
```json
"assumptions": []
```

✅ **Evidence-based assumptions:**
```json
"assumptions": [
  "25% energy cost reduction per strategic intent (€8M→€6M)",
  "Real-time monitoring enables 15% additional savings (industry benchmark)"
]
```

❌ **All pools one category:**
```json
// WRONG: All "cost_reduction", no revenue or risk pools
```

✅ **Balanced portfolio:**
```json
// CORRECT: Mix of revenue (3), cost (4), risk (2), strategic (1)
```

## Validation Checklist

Before returning JSON:
- [ ] 8-12 value pools total
- [ ] ALL pools have `€X.X M/K [timeframe]` format in estimatedValue
- [ ] Category distribution: ~30% revenue, ~35% cost, ~20% risk, ~15% strategic
- [ ] ALL pools have specific enablers with costs/timelines from Gap Analysis
- [ ] ALL pools have 2-4 assumptions with numbers/benchmarks
- [ ] Confidence levels realistic (not all "high")
- [ ] Time to value matches complexity (quick wins 0-6mo, transformations 18-36mo)
- [ ] Total value aligns with Strategic Intent metrics
- [ ] Enablers reference Operating Model platforms (Salesforce, SAP, Azure, etc.)
- [ ] JSON is valid and matches schema from DATA_CONTRACT

## Instructions

1. Extract success metrics from Strategic Intent (these are value targets)
2. Extract remediation actions + costs from Gap Analysis (these are enablers)
3. Create 8-12 value pools across 4 categories
4. Quantify EVERY pool using `€X.X M/K [timeframe]` format
5. Link enablers to specific gap remediation actions
6. Write evidence-based assumptions with industry benchmarks
7. Set realistic confidence based on proof points
8. Validate against checklist above
9. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode - be decisive and complete. Every value pool MUST have quantified €X M/K format. No vague "significant value" allowed.
