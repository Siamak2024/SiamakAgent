# Operating Model Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Operating Model (Step 4) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

Operating Model is a **structured object** with 5 key dimensions stored in `model.operatingModel`.  
Each dimension contains descriptive strings and arrays — NO deep nesting.

---

## Primary Schema (model.operatingModel)

```json
{
  "governance": {
    "structure": "String — Governance model description",
    "decisionRights": "String — How decisions are made",
    "kpis": ["KPI 1", "KPI 2", "KPI 3"]
  },
  "organization": {
    "structure": "String — Org structure approach",
    "roles": ["Role 1", "Role 2", "Role 3"],
    "culture": "String — Cultural characteristics"
  },
  "processes": {
    "coreProcesses": ["Process 1", "Process 2", "Process 3"],
    "maturity": "String — Overall process maturity level"
  },
  "data": {
    "strategy": "String — Data strategy approach",
    "governance": "String — Data governance model",
    "platforms": ["Platform 1", "Platform 2"]
  },
  "technology": {
    "architecture": "String — Architecture approach (e.g., cloud-first, hybrid)",
    "platforms": ["Platform 1", "Platform 2", "Platform 3"],
    "investmentFocus": "String — Where tech investment is focused"
  }
}
```

---

## Field Specifications

### governance (OBJECT - REQUIRED)
Defines how the organization is governed and measured.

**Sub-fields:**
- **structure** (string): Governance model (e.g., "Federated", "Centralized", "Hybrid")
  - Example: "Federated governance with central architecture authority and domain-autonomous execution"
- **decisionRights** (string): Decision-making framework
  - Example: "RACI-based decision matrix; strategic decisions at board level, architectural decisions at EA forum, implementation decisions domain-autonomous"
- **kpis** (array): Key performance indicators tracked
  - Example: `["Cost-to-income ratio", "System uptime 99.9%", "Time-to-market for new products"]`

### organization (OBJECT - REQUIRED)
Defines organizational structure and culture.

**Sub-fields:**
- **structure** (string): Org design approach
  - Example: "Matrix organization with functional centers of excellence and cross-functional product teams"
- **roles** (array): Key roles in the operating model
  - Example: `["Product Owner", "Solution Architect", "DevOps Engineer", "Data Steward", "Scrum Master"]`
- **culture** (string): Cultural characteristics and values
  - Example: "Agile mindset with continuous improvement focus; data-driven decision-making; customer-centric design thinking"

### processes (OBJECT - REQUIRED)
Defines core business processes.

**Sub-fields:**
- **coreProcesses** (array): 5-8 core end-to-end processes
  - Example: `["Customer Onboarding", "Product Development", "Order Fulfillment", "Service Delivery", "Financial Close"]`
- **maturity** (string): Overall process maturity assessment
  - Example: "Mixed maturity: Customer processes at Level 3 (Defined), back-office at Level 2 (Repeatable), target state Level 4 (Managed) across all domains"

### data (OBJECT - REQUIRED)
Defines data and information management approach.

**Sub-fields:**
- **strategy** (string): Data strategy summary
  - Example: "Data-as-a-product with domain-driven data ownership; master data centralized, operational data federated; API-first integration"
- **governance** (string): Data governance approach
  - Example: "Central data governance board sets standards; domain data stewards enforce quality; automated data lineage and catalog"
- **platforms** (array): Key data platforms
  - Example: `["Snowflake (data warehouse)", "Databricks (analytics)", "Collibra (data catalog)", "Talend (integration)"]`

### technology (OBJECT - REQUIRED)
Defines technology architecture and platforms.

**Sub-fields:**
- **architecture** (string): Architectural approach
  - Example: "Cloud-first hybrid architecture; Azure as primary cloud; on-prem for latency-sensitive workloads; microservices for new builds, API layer for legacy"
- **platforms** (array): Key technology platforms (5-10)
  - Example: `["Microsoft 365", "Salesforce CRM", "SAP S/4HANA", "Azure Kubernetes Service", "ServiceNow ITSM"]`
- **investmentFocus** (string): Where tech investment is concentrated
  - Example: "60% on cloud migration and modernization, 25% on data platform, 15% on security and compliance infrastructure"

---

## Autopilot vs Legacy Generation

### Autopilot (generateAutopilotOperatingModel)
- Generates from Capability Map context
- Simple 5-dimension structure above
- Industry-realistic platform names and approaches
- NO detailed process models or org charts

### Legacy (Step 4 via detailed operating model generator)
- May include additional dimensions (locations, vendors, sourcing strategy)
- Can reference specific TOGAF/COBIT frameworks
- More detailed governance structures

---

## Industry-Specific Guidance

### Financial Services
- **Governance:** Heavy regulatory focus (Basel, GDPR, PSD2); compliance as key KPI
- **Organization:** Risk-aware culture; separate teams for regulated vs non-regulated activities
- **Processes:** Core banking, trading, risk management, regulatory reporting
- **Data:** Strong data lineage requirements; BCBS 239 compliance
- **Technology:** Hybrid cloud (regulatory constraints on data location); core banking modernization focus

### Real Estate
- **Governance:** Property-level P&L ownership; centralized procurement
- **Organization:** Regional property managers; shared services for finance/IT
- **Processes:** Tenant lifecycle, maintenance operations, ESG reporting
- **Data:** Property/tenant master data; IoT data from buildings
- **Technology:** PropTech platforms (IWMS, tenant portals, IoT); facility management systems

### Public Sector
- **Governance:** Political oversight; public transparency requirements
- **Organization:** Department-based; cross-department initiatives complex
- **Processes:** Citizen services, case management, procurement (LOU compliance)
- **Data:** Open data requirements; strict privacy for citizen data
- **Technology:** On-prem legacy; slow cloud adoption; vendor lock-in issues

### Retail
- **Governance:** Category/channel P&L; fast decision cycles
- **Organization:** Merchandising, ops, e-commerce as separate domains
- **Processes:** Merchandising, supply chain, omnichannel fulfillment
- **Data:** Customer 360 focus; inventory visibility critical
- **Technology:** E-commerce platform, POS, OMS, WMS; personalization engines

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
