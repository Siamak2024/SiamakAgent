# Step 3: Capability Map - Autopilot Mode

**MODE:** Autopilot (Fast generation from Strategic Intent + BMC)
**DATA CONTRACT:** See CAPABILITY_MAP_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive:
- `strategicIntent`: Object from Step 1 (themes, metrics, constraints)
- `bmc`: Object from Step 2 (value proposition, customer segments, channels, etc.)
- `industry`: Industry context
- `region`: Geographic region

## Your Task
Generate a comprehensive **Capability Map** with 25-35 capabilities organized into 5-8 business domains.

## MANDATORY Requirements

### 1. Capability Naming Convention
**ALWAYS use [Verb][Object] format:**

✅ **CORRECT:**
- "Manage Customer Relationships"
- "Process Loan Applications"
- "Monitor Building Energy"
- "Analyze Market Trends"

❌ **WRONG:**
- "CRM" (too technical)
- "Customer Management System" (system, not capability)
- "Sales" (no verb)
- "Marketing Automation" (tool, not capability)

### 2. Industry-Specific Domain Archetypes

**Financial Services - Real Estate:**
- Customer & Tenant Management
- Property & Asset Management
- Financial Management & Billing
- Maintenance & Operations
- Compliance & Risk
- Data & Analytics
- Technology & Integration

**Retail - E-commerce:**
- Customer Experience
- Product & Merchandising
- Order & Fulfillment
- Supply Chain & Logistics
- Marketing & Personalization
- Store Operations
- Data & Analytics

**Public Sector:**
- Citizen Services
- Case Management
- Regulatory Compliance
- Policy & Planning
- Stakeholder Engagement
- Data Management
- Infrastructure & Operations

**Healthcare:**
- Patient Care
- Clinical Operations
- Medical Records Management
- Compliance & Safety
- Research & Development
- Resource Planning
- Technology & Integration

### 3. Maturity Levels (1-5)
Base maturity on Strategic Intent constraints:

- **1 (Ad-hoc):** Manual processes, no standards, reactive
- **2 (Developing):** Some documentation, basic tools, inconsistent
- **3 (Defined):** Standardized processes, integrated tools, proactive
- **4 (Managed):** Metrics-driven, optimized workflows, predictive
- **5 (Optimizing):** AI/automation, continuous improvement, best-in-class

**Use constraints to set realistic maturity:**
- Legacy systems → maturity 1-2
- Recent implementations → maturity 3
- Strategic focus areas → maturity 2-3 (room to grow)
- Non-focus areas → maturity 2-3

### 4. Strategic Importance
Align with Strategic Intent themes:

- **critical:** Directly mentioned in strategic themes (6-10 capabilities)
- **high:** Enables strategic themes (8-12 capabilities)
- **medium:** Supporting capabilities (8-10 capabilities)
- **low:** Necessary but not strategic (2-5 capabilities)

### 5. Cross-Referencing
Link capabilities to:
- BMC value proposition delivery
- Strategic Intent themes
- Constraints that impact maturity

## Output Format

```json
{
  "capabilities": [
    {
      "id": "CAP-001",
      "name": "[Verb] [Object]",
      "domain": "Domain Name",
      "maturity": 1-5,
      "strategicImportance": "critical|high|medium|low",
      "description": "1-2 sentence description linking to strategic intent or BMC"
    }
  ]
}
```

## Industry Example: Financial Services - Real Estate

```json
{
  "capabilities": [
    {
      "id": "CAP-001",
      "name": "Manage Tenant Relationships",
      "domain": "Customer & Tenant Management",
      "maturity": 2,
      "strategicImportance": "critical",
      "description": "Handles tenant onboarding, contract management, and engagement through digital portal with BankID authentication. Supports strategic theme 'Digital Tenant Portal'."
    },
    {
      "id": "CAP-002",
      "name": "Process Tenant Inquiries",
      "domain": "Customer & Tenant Management",
      "maturity": 2,
      "strategicImportance": "high",
      "description": "Routes and resolves tenant service requests via email, phone, and portal. Currently manual with 48h avg response time."
    },
    {
      "id": "CAP-003",
      "name": "Analyze Tenant Satisfaction",
      "domain": "Customer & Tenant Management",
      "maturity": 1,
      "strategicImportance": "high",
      "description": "Measures and improves tenant experience. Annual surveys only, no real-time feedback. Target: 3.2/5 → 4.5/5 by Q4 2025."
    },
    {
      "id": "CAP-004",
      "name": "Monitor Building Energy",
      "domain": "Property & Asset Management",
      "maturity": 2,
      "strategicImportance": "critical",
      "description": "Tracks energy consumption across 1,200 properties for ESG reporting and Net Zero 2030 compliance. IoT sensors deployment in progress."
    },
    {
      "id": "CAP-005",
      "name": "Predict Maintenance Needs",
      "domain": "Property & Asset Management",
      "maturity": 1,
      "strategicImportance": "critical",
      "description": "Forecasts equipment failures using IoT sensor data. Currently reactive maintenance only. Strategic theme: 'Predictive Maintenance using IoT sensors'."
    },
    {
      "id": "CAP-006",
      "name": "Schedule Property Maintenance",
      "domain": "Maintenance & Operations",
      "maturity": 3,
      "strategicImportance": "high",
      "description": "Plans and coordinates preventive and corrective maintenance. Uses legacy FM system with manual scheduling."
    },
    {
      "id": "CAP-007",
      "name": "Manage Maintenance Vendors",
      "domain": "Maintenance & Operations",
      "maturity": 2,
      "strategicImportance": "medium",
      "description": "Procures and oversees external contractors for property maintenance. Paper-based contracts, no vendor performance tracking."
    },
    {
      "id": "CAP-008",
      "name": "Process Rental Invoices",
      "domain": "Financial Management & Billing",
      "maturity": 3,
      "strategicImportance": "high",
      "description": "Generates and collects rent payments. Integrated with BankID and Swish for digital payments."
    },
    {
      "id": "CAP-009",
      "name": "Analyze Portfolio Performance",
      "domain": "Financial Management & Billing",
      "maturity": 2,
      "strategicImportance": "critical",
      "description": "Evaluates property ROI and financial performance. Manual Excel analysis. Target: Portfolio ROI 4.5% → 6.2% by 2027."
    },
    {
      "id": "CAP-010",
      "name": "Forecast Property Cashflow",
      "domain": "Financial Management & Billing",
      "maturity": 2,
      "strategicImportance": "high",
      "description": "Projects future rental income and operational costs. Currently based on historical averages, no predictive models."
    },
    {
      "id": "CAP-011",
      "name": "Report ESG Metrics",
      "domain": "Compliance & Risk",
      "maturity": 2,
      "strategicImportance": "critical",
      "description": "Tracks and reports environmental, social, governance indicators for Net Zero 2030. Manual data collection from multiple sources."
    },
    {
      "id": "CAP-012",
      "name": "Ensure GDPR Compliance",
      "domain": "Compliance & Risk",
      "maturity": 2,
      "strategicImportance": "critical",
      "description": "Manages tenant data privacy and consent. May 2025 audit deadline. Legacy ERP lacks granular access controls."
    },
    {
      "id": "CAP-013",
      "name": "Manage Building Certifications",
      "domain": "Compliance & Risk",
      "maturity": 3,
      "strategicImportance": "medium",
      "description": "Tracks and renews fire, electrical, and environmental certifications. Well-established process with annual reviews."
    },
    {
      "id": "CAP-014",
      "name": "Analyze Market Trends",
      "domain": "Data & Analytics",
      "maturity": 1,
      "strategicImportance": "high",
      "description": "Monitors rental market dynamics and competitor pricing. Ad-hoc analysis using external reports."
    },
    {
      "id": "CAP-015",
      "name": "Visualize Portfolio Data",
      "domain": "Data & Analytics",
      "maturity": 2,
      "strategicImportance": "high",
      "description": "Presents KPIs and portfolio metrics. Basic Power BI dashboards with manual data refresh."
    },
    {
      "id": "CAP-016",
      "name": "Integrate Data Sources",
      "domain": "Technology & Integration",
      "maturity": 1,
      "strategicImportance": "critical",
      "description": "Connects legacy ERP (SAP R/3 2008), FM system, and new IoT platform. No API layer, batch file transfers only."
    },
    {
      "id": "CAP-017",
      "name": "Manage IT Infrastructure",
      "domain": "Technology & Integration",
      "maturity": 2,
      "strategicImportance": "medium",
      "description": "Operates on-premise servers and cloud services. Mixed environment with €1.2M annual maintenance on legacy systems."
    },
    {
      "id": "CAP-018",
      "name": "Secure Digital Assets",
      "domain": "Technology & Integration",
      "maturity": 3,
      "strategicImportance": "high",
      "description": "Protects tenant data and business systems. BankID authentication implemented, working on MFA for staff."
    }
  ]
}
```

## Anti-Patterns (NEVER DO THIS)

❌ **System/Tool Names Instead of Capabilities:**
- "CRM"
- "ERP"
- "Salesforce"

✅ **Correct Capability Names:**
- "Manage Customer Relationships"
- "Process Financial Transactions"
- "Analyze Sales Performance"

❌ **No Verb:**
- "Customer Service"
- "Data Analytics"
- "Compliance"

✅ **Verb + Object:**
- "Deliver Customer Service"
- "Analyze Customer Data"
- "Ensure Regulatory Compliance"

❌ **Unrealistic Maturity:**
- All capabilities at level 1-2 (too pessimistic)
- All capabilities at level 4-5 (ignores constraints)

✅ **Realistic Maturity Distribution:**
- Legacy systems → 1-2
- Recent implementations → 2-3
- Strategic focus areas → 2-3 (room to grow)
- Well-established processes → 3-4

❌ **Generic Descriptions:**
- "Manages customer data"
- "Handles financial processes"

✅ **Context-Specific Descriptions:**
- "Tracks tenant data in legacy SAP R/3 with GDPR compliance gap. May 2025 audit deadline."
- "Forecasts equipment failures using IoT sensors across 1,200 properties. Currently reactive only."

## Validation Checklist

Before returning JSON:
- [ ] 25-35 capabilities total
- [ ] 5-8 business domains (industry-specific)
- [ ] ALL names follow [Verb][Object] format
- [ ] Maturity distribution realistic (based on constraints)
- [ ] 6-10 capabilities marked "critical" (aligned with strategic themes)
- [ ] Descriptions reference Strategic Intent or BMC
- [ ] No system names (CRM, ERP) used as capability names
- [ ] JSON is valid and matches schema from DATA_CONTRACT
- [ ] Industry-specific domains used (not generic)

## Instructions

1. Extract industry from context
2. Select appropriate domain archetypes
3. Generate 25-35 capabilities across domains
4. Set maturity based on Strategic Intent constraints
5. Set importance based on Strategic Intent themes
6. Write descriptions linking to BMC and Strategic Intent
7. Validate against checklist above
8. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode - be decisive and complete. Generate full capability map without asking follow-up questions.
