# Task 6.1: Architecture Layers Generation

## Objective
Generate a layered enterprise architecture view comprising Value Streams, Applications/Systems, Data Assets, and Technology Stack that supports the capability map.

## Context Provided
- **Capabilities**: Complete capability map with validated maturity ratings
- **Strategic Intent**: Strategic objectives and transformation goals
- **BMC**: Business model canvas with key activities and resources
- **Industry**: Business sector context

## Your Task

### 1. Define Value Streams (3-6 streams)
Value streams are end-to-end flows of value delivery that group related capabilities.

**Characteristics**:
- Customer-centric (starts with customer need, ends with value delivered)
- Cross-functional (spans multiple capabilities/departments)
- Measurable outcome (revenue, service delivery, compliance, etc.)

**Typical Value Streams**:
- **Customer-Facing**: Customer Acquisition, Order-to-Cash, Service Delivery, Customer Support
- **Internal**: Product Development, Supply Chain, HR Services, Finance Operations
- **Enabling**: IT Services, Data Management, Compliance & Risk, Strategy & Planning

**For each value stream**:
- Map to 3-8 capabilities that support it
- Assess strategic importance (CORE | SUPPORT | COMMODITY)
- Describe value outcome delivered

### 2. Identify Applications/Systems (8-15 systems)
Map the technology landscape supporting capabilities.

**System Types**:
- **CORE_SYSTEM**: Mission-critical, competitive differentiator (ERP, CRM, core product platforms)
- **SUPPORTING**: Important but standard (HRMS, Finance, Document Management)
- **UTILITY**: Commodity infrastructure (Email, File Sharing, Basic Reporting)

**For each application**:
- Link to capabilities it supports (minimum 1, typical 2-5)
- Estimate maturity (1-5 scale based on age, features, integration)
- Assess modernization priority:
  - **HIGH**: Legacy blocker, poor integration, high risk
  - **MEDIUM**: Functional but aging, moderate tech debt
  - **LOW**: Modern, fit-for-purpose, low risk

**Maturity Indicators**:
- **Level 1-2**: Legacy, siloed, manual interfaces, poor data quality
- **Level 3**: Standard tools, some integration, documented processes
- **Level 4-5**: Modern platforms, API-based, real-time data, cloud-native

### 3. Catalog Data Assets (5-10 assets)
Identify critical data entities that enable capabilities.

**Data Asset Types**:
- **MASTER_DATA**: Customers, Products, Employees, Suppliers (golden records)
- **TRANSACTIONAL**: Orders, Invoices, Shipments, Support Tickets (operational data)
- **ANALYTICAL**: KPIs, Dashboards, Models, Forecasts (derived insights)
- **REFERENCE**: Industry codes, regulatory standards, configuration data

**Quality Levels**:
- **HIGH**: Single source of truth, good governance, real-time, accurate
- **MEDIUM**: Some duplication, decent quality, batch updates
- **LOW**: Siloed, poor quality, manual reconciliation, outdated

### 4. Document Technology Stack
Categorize technology platforms and tools:

**Platform Categories**:
- **Core Platforms**: ERP, CRM, SCM, PLM, HRMS
- **Infrastructure**: Cloud (AWS/Azure/GCP), On-prem servers, Network, Security
- **Integration**: ESB, API Gateway, iPaaS, ETL tools
- **Analytics**: BI tools, Data warehouse, Data lake, ML platforms
- **Collaboration**: Email, Teams/Slack, Intranet, Project management
- **Development**: IDEs, DevOps, Version control, CI/CD

## Output Format
Return **ONLY** valid JSON:

```json
{
  "value_streams": [
    {
      "id": "VS01",
      "name": "Order-to-Cash",
      "description": "End-to-end process from customer order receipt through fulfillment, invoicing, and payment collection",
      "capabilities": [
        "Order Management",
        "Inventory Management",
        "Fulfillment & Logistics",
        "Invoicing & Billing",
        "Payment Processing",
        "Customer Service"
      ],
      "strategic_importance": "CORE",
      "value_outcome": "$45M annual revenue, 98% on-time delivery, <2% order error rate"
    }
  ],
  "applications": [
    {
      "id": "APP01",
      "name": "SAP ERP",
      "type": "CORE_SYSTEM",
      "capabilities_supported": [
        "Order Management",
        "Inventory Management",
        "Financial Management",
        "Procurement"
      ],
      "technology_stack": "SAP ECC 6.0 on-premise, Oracle database, ABAP customizations",
      "maturity": 3,
      "maturity_rationale": "Functional but aging (15 years old), limited integration, heavy customization",
      "modernization_priority": "HIGH",
      "modernization_rationale": "Blocking digital initiatives; S/4HANA migration planned"
    }
  ],
  "data_assets": [
    {
      "id": "DATA01",
      "name": "Customer Master Data",
      "type": "MASTER_DATA",
      "description": "Complete customer records: demographics, preferences, transaction history, support interactions",
      "capabilities_served": [
        "Customer Relationship Management",
        "Sales & Marketing",
        "Customer Service",
        "Analytics"
      ],
      "quality_level": "MEDIUM",
      "quality_rationale": "Siloed across 3 systems (CRM, ERP, Support), 15% duplication, batch sync overnight",
      "improvement_priority": "HIGH"
    }
  ],
  "technology_stack": {
    "platforms": [
      "SAP ERP (Finance, Supply Chain, HR)",
      "Salesforce CRM (Sales, Marketing, Service)",
      "Microsoft Dynamics 365 (Project Management)"
    ],
    "infrastructure": [
      "On-premise data center (80% of workloads)",
      "AWS cloud (20% - web apps, dev/test)",
      "Hybrid network with Direct Connect"
    ],
    "integration": [
      "Dell Boomi iPaaS (cloud integrations)",
      "Legacy point-to-point interfaces (80+ custom connections)",
      "SFTP file transfers (batch data exchange)"
    ],
    "analytics": [
      "Power BI (departmental dashboards)",
      "Excel (primary reporting tool - 70% of reports)",
      "SQL Server data warehouse (nightly batch ETL)"
    ],
    "collaboration": [
      "Microsoft 365 (Email, Teams, SharePoint)",
      "Jira/Confluence (IT & product teams)",
      "Zoom (video conferencing)"
    ],
    "development": [
      "Azure DevOps (CI/CD pipelines)",
      "GitHub Enterprise (version control)",
      "VS Code, IntelliJ (developer IDEs)"
    ]
  }
}
```

## Design Principles

**Value Stream Design**:
- 3-6 streams (not too granular)
- Each stream represents a distinct value outcome
- Capabilities should map to 1-2 primary streams (not scattered)

**Application Portfolio**:
- Focus on **systems**, not individual apps (e.g., "SAP ERP", not "SAP FI module")
- 8-15 applications is typical (less for small orgs, more for large enterprises)
- Prioritize modernization based on strategic importance + technical debt

**Data Asset Catalog**:
- Focus on **critical data domains** that enable multiple capabilities
- Quality assessment should be honest (most orgs have MEDIUM quality data)
- Link data quality to capability maturity (poor data = low capability maturity)

## Quality Checklist
- [ ] 3-6 value streams covering all major capabilities
- [ ] 8-15 applications/systems identified
- [ ] Each application supports 1-5 capabilities
- [ ] 5-10 data assets cataloged
- [ ] Technology stack is comprehensive (6 categories)
- [ ] Strategic importance aligns with capability map
- [ ] Modernization priorities reflect strategic gaps
- [ ] JSON is valid and complete

## Common Pitfalls
❌ Too many value streams (>8) - over-fragmentation  
❌ Applications are too granular (listing 50+ individual tools)  
❌ All systems marked HIGH modernization priority (unrealistic)  
❌ Data quality all rated HIGH or all LOW (should be mixed)  
❌ Technology stack missing key categories  

✅ 3-6 focused value streams  
✅ 8-15 major systems (aggregate related tools)  
✅ Prioritized modernization (2-3 HIGH, 3-5 MEDIUM, rest LOW)  
✅ Realistic data quality mix (mostly MEDIUM)  
✅ Complete technology stack across all categories  
