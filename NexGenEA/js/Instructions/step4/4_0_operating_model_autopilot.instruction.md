# Step 4: Operating Model - Autopilot Mode

**MODE:** Autopilot (Fast generation from Strategic Intent + BMC + Capabilities)
**DATA CONTRACT:** See OPERATING_MODEL_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact 5-dimension schema

## Context Available
You receive:
- `strategicIntent`: Strategic themes, metrics, constraints
- `bmc`: Business model canvas
- `capabilities`: Capability map with maturity levels
- `industry`: Industry context
- `region`: Geographic region

## Your Task
Generate a comprehensive **Operating Model** defining HOW the organization operates across 5 dimensions.

## MANDATORY Requirements

### 1. Use REAL Platform/Tool Names (NOT Generic Labels)

❌ **WRONG:**
- "CRM system"
- "ERP platform"
- "Cloud infrastructure"
- "BI tool"

✅ **CORRECT:**
- "Salesforce Service Cloud"
- "SAP S/4HANA Finance"
- "Microsoft Azure (West Europe region)"
- "Power BI with Premium capacity"

**Industry-Specific Platform Examples:**

**Financial Services - Real Estate:**
- ERP: SAP R/3, Microsoft Dynamics 365, Oracle ERP Cloud
- Property Management: Yardi Voyager, MRI Software, Vitec Ekonomi
- CRM: Salesforce, Microsoft Dynamics 365 CRM
- Analytics: Power BI, Tableau, Qlik Sense
- Integration: MuleSoft, Azure Logic Apps, Dell Boomi
- Identity: BankID, Azure AD B2C
- IoT: Azure IoT Hub, AWS IoT Core, Siemens MindSphere

**Retail - E-commerce:**
- E-commerce: Shopify Plus, Adobe Commerce (Magento), SAP Commerce Cloud
- POS: NCR Emerald, Oracle Retail Xstore, Lightspeed
- OMS: Fluent Commerce, Manhattan Active Omni, Deposco
- Payment: Klarna, Adyen, Stripe, Swish (Sweden)
- Marketing: Adobe Experience Cloud, Salesforce Marketing Cloud
- Analytics: Google Analytics 360, Adobe Analytics

**Public Sector (Offentlig Sektor):**
- Case Management: Platina (CGI), Ciceron (Formpipe), W3D3 (Tieto Evry)
- Identity: BankID, e-legitimation (Svenska Pass), MinID (Norway)
- Document: eDok (Formpipe), Public 360 (Software Innovation)
- Integration: Mulesoft, Azure Logic Apps with SFTI/Svefaktura
- Analytics: Qlik Sense, Power BI Government Cloud

**Healthcare:**
- EHR: Epic, Cerner, Cosmic (Cambio), TakeCare (CompuGroup Medical)
- PACS: Sectra, Carestream, GE Healthcare
- Lab: LabVantage, Thermo Fisher, Abbott Informatics
- Identity: SITHS (Sweden), BankID Medical
- Integration: Mirth Connect, Rhapsody, HL7 FHIR APIs

### 2. Real Organizational Roles (Not Generic)

❌ **WRONG:**
- "IT Team"
- "Business Team"
- "Management"

✅ **CORRECT:**
- "Enterprise Architecture CoE (5 FTEs: 3 Business Architects, 2 Solution Architects)"
- "Digital Transformation Office (1 CDO + 8 FTEs)"
- "Property Technology Team (2 IoT Engineers, 1 Data Scientist)"

### 3. Specific Processes with Real Standards

❌ **WRONG:**
- "Agile development"
- "ITIL processes"

✅ **CORRECT:**
- "SAFe 6.0 for enterprise transformation (4 Agile Release Trains)"
- "ITIL 4 Service Management with ServiceNow ITSM"
- "TOGAF 10 for architecture governance with quarterly reviews"

### 4. Data Management with Real Regulations

❌ **WRONG:**
- "Data governance framework"
- "Master data management"

✅ **CORRECT:**
- "GDPR-compliant data catalog using Collibra with consent management via OneTrust"
- "MDM for customer/tenant data in Informatica MDM with golden record matching"
- "Data retention: 7 years for financial records (Bokföringslagen), 2 years for tenant logs"

### 5. Governance with Real Frameworks

❌ **WRONG:**
- "Decision-making process"
- "Governance structure"

✅ **CORRECT:**
- "Architecture Review Board meets bi-weekly using TOGAF ADM decision gates"
- "COBIT 2019 framework for IT governance with risk scoring"
- "Investment decisions via NPV analysis with 12% WACC threshold"

## Output Format

```json
{
  "governance": {
    "decisionMakingFramework": "Specific governance framework (COBIT, TOGAF, etc.)",
    "architectureReviewProcess": "How architecture is reviewed and approved",
    "investmentPrioritization": "How investments are prioritized (NPV, ROI, etc.)",
    "riskManagement": "Risk framework and processes"
  },
  "organization": {
    "operatingModel": "Centralized | Decentralized | Federated | Hybrid",
    "keyRoles": ["List of specific roles with FTE counts"],
    "teamStructures": ["Specific team setups"],
    "skillsRequired": ["Required skills"]
  },
  "processes": {
    "developmentMethodology": "SAFe | Scrum | Kanban with specifics",
    "serviceManagement": "ITIL version and tooling",
    "changeManagement": "Prosci ADKAR | Kotter | custom with details",
    "qualityAssurance": "Quality processes and standards"
  },
  "data": {
    "dataGovernance": "Specific data governance approach",
    "masterDataManagement": "MDM strategy and tools",
    "dataRetention": "Retention policies with legal references",
    "dataQuality": "Quality measurement and improvement"
  },
  "technology": {
    "platforms": ["Salesforce Service Cloud", "SAP S/4HANA", "Azure IoT Hub", ...],
    "infrastructure": "Cloud strategy: Azure West Europe + on-premise DCs",
    "integration": "MuleSoft Anypoint Platform with API-led architecture",
    "security": "Zero Trust with Azure AD B2C, BankID, MFA"
  }
}
```

## Industry Example: Financial Services - Real Estate

```json
{
  "governance": {
    "decisionMakingFramework": "COBIT 2019 for IT governance with quarterly board reviews. Architecture decisions via TOGAF ADM with EA Review Board (meets bi-weekly).",
    "architectureReviewProcess": "All initiatives >€500K require architecture review. TOGAF compliance gates at Phase B (Business Arch), Phase C (Data/App), Phase D (Tech). Non-compliance escalated to CIO.",
    "investmentPrioritization": "NPV analysis with 12% WACC threshold. Strategic alignment scoring (0-10) weighted 40%, ROI 30%, risk 20%, compliance 10%. Investments >€2M require board approval.",
    "riskManagement": "ISO 31000 risk framework. GDPR compliance risk scored critical. Quarterly risk reviews by Compliance Officer. Legacy system risk: SAP R/3 end-of-life 2027 (€1.2M annual maintenance)."
  },
  "organization": {
    "operatingModel": "Federated: Central EA CoE sets standards, business units execute. Property Operations (85 FTEs) owns tenant services, Finance (12 FTEs) owns billing, IT (15 FTEs) supports platforms.",
    "keyRoles": [
      "Chief Digital Officer (CDO) - owns digital transformation roadmap",
      "Enterprise Architecture CoE: 3 Business Architects, 2 Solution Architects",
      "Property Technology Team: 2 IoT Engineers, 1 Data Scientist (new hires for predictive maintenance)",
      "GDPR Data Protection Officer (DPO) - ensures tenant data compliance",
      "Sustainability Manager - drives Net Zero 2030 (ESG reporting)"
    ],
    "teamStructures": [
      "Digital Transformation Office (1 CDO + 8 FTEs): owns platform strategy",
      "Tenant Experience Squad (5 FTEs): agile team for portal development",
      "Data & Analytics CoE (4 FTEs): Power BI, IoT analytics, predictive models"
    ],
    "skillsRequired": [
      "IoT/sensor integration (Azure IoT Hub, MQTT protocols)",
      "Predictive analytics (Python, scikit-learn, time series forecasting)",
      "SAP integration & migration (S/4HANA roadmap planning)",
      "GDPR & data privacy (tenant consent management)",
      "ESG reporting & sustainability metrics"
    ]
  },
  "processes": {
    "developmentMethodology": "SAFe 6.0 Essentials for Digital Transformation ART (Agile Release Train). 2-week sprints. Portfolio Kanban for initiatives. Quarterly PI Planning with 150+ stakeholders.",
    "serviceManagement": "ITIL 4 Service Management via ServiceNow ITSM. SLA: P1 incidents 4h response, P2 8h, P3 24h. Change Advisory Board (CAB) meets weekly for production changes.",
    "changeManagement": "Prosci ADKAR model for tenant portal rollout. Change Champions (15 property managers) trained Q1 2025. Kotter 8-step for organization-wide transformation.",
    "qualityAssurance": "Automated testing for tenant portal (Selenium). Manual UAT by 20 pilot tenants. Code reviews via Azure DevOps pull requests. Security scanning with Veracode."
  },
  "data": {
    "dataGovernance": "GDPR-compliant data catalog in Collibra. Consent management via OneTrust. Data ownership: Property Ops owns tenant master data, Finance owns billing data. Stewardship model with 8 data stewards.",
    "masterDataManagement": "Tenant MDM in Informatica MDM with golden record from SAP R/3 (source of truth). Property data synchronized from Yardi Voyager. BankID as identity authority.",
    "dataRetention": "Financial records 7 years (Bokföringslagen). Tenant contracts 10 years. Energy consumption data 3 years. Personal data deleted within 30 days of tenant move-out (GDPR Art. 17).",
    "dataQuality": "Data quality rules in Informatica DQ: tenant email valid format (95% pass rate), property address geocoded (88% pass rate). Monthly DQ reports reviewed by Data Governance Board."
  },
  "technology": {
    "platforms": [
      "SAP R/3 (2008 version) - legacy ERP for financials (end-of-life 2027, migration to S/4HANA planned Wave 2)",
      "Yardi Voyager - property management and lease administration",
      "Salesforce Service Cloud - tenant CRM with BankID integration (implemented Q4 2024)",
      "Azure IoT Hub - manages 1,200 properties with temp/humidity/energy sensors",
      "Power BI Premium - dashboards for portfolio performance and ESG metrics",
      "OneTrust - GDPR consent and data privacy management (May 2025 audit prep)"
    ],
    "infrastructure": "Hybrid cloud: Azure West Europe (tenant portal, IoT, analytics), on-premise DC Stockholm (SAP R/3, file shares). Network: MPLS to 15 regional offices. Disaster recovery RTO 4h, RPO 1h.",
    "integration": "MuleSoft Anypoint Platform with API-led architecture. 25 APIs (tenant API, property API, billing API). Azure Logic Apps for IoT data ingestion. Legacy: batch file transfers SAP <-> Yardi (nightly).",
    "security": "Zero Trust architecture. Azure AD B2C for staff (MFA enabled). BankID for tenant authentication. Privileged Access Management (CyberArk). SIEM: Microsoft Sentinel. Vulnerability scanning: Qualys."
  }
}
```

## Anti-Patterns (NEVER DO THIS)

❌ **Generic platform names:**
```json
"platforms": ["CRM", "ERP", "Cloud"]
```

✅ **Specific platforms:**
```json
"platforms": [
  "Salesforce Service Cloud",
  "SAP S/4HANA Finance",
  "Microsoft Azure West Europe"
]
```

❌ **Vague roles:**
```json
"keyRoles": ["IT Team", "Business Team"]
```

✅ **Specific roles with counts:**
```json
"keyRoles": [
  "Enterprise Architecture CoE: 3 Business Architects, 2 Solution Architects",
  "Property Technology Team: 2 IoT Engineers, 1 Data Scientist"
]
```

❌ **No regulatory/legal references:**
```json
"dataRetention": "Data retained as needed"
```

✅ **Specific laws/regulations:**
```json
"dataRetention": "Financial records 7 years (Bokföringslagen), Personal data 2 years (GDPR Art. 17)"
```

## Validation Checklist

Before returning JSON:
- [ ] ALL platforms use REAL names (Salesforce, SAP, Azure - not "CRM", "ERP")
- [ ] Governance references specific frameworks (COBIT, TOGAF, ISO 31000)
- [ ] Roles include FTE counts or team sizes
- [ ] Processes mention specific methodologies (SAFe 6.0, ITIL 4, Prosci ADKAR)
- [ ] Data retention cites actual laws (GDPR, Bokföringslagen, sector regulations)
- [ ] Infrastructure mentions real regions (Azure West Europe, AWS eu-north-1)
- [ ] Integration tools specified (MuleSoft, Dell Boomi, Azure Logic Apps)
- [ ] Security includes real identity providers (BankID, Azure AD, Okta)
- [ ] JSON is valid and matches schema from DATA_CONTRACT
- [ ] Content aligns with Strategic Intent constraints (e.g., legacy SAP R/3 mentioned)

## Instructions

1. Extract constraints from Strategic Intent (legacy systems, budget, compliance deadlines)
2. Map capabilities to appropriate platforms/tools (use industry-specific examples above)
3. Define governance aligned with strategic themes
4. Specify organization structure based on industry norms
5. Detail processes with real methodologies
6. Include data governance with GDPR/regulatory compliance
7. List technology stack with REAL platform names
8. Cross-reference BMC and Capabilities
9. Validate against checklist above
10. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode - be decisive, complete, and use REAL platform names. Don't ask follow-up questions.
