# AI Business Readiness — EA Toolkit MVP
## Implementation Guide for GitHub Copilot / VS Code

**Version:** 1.0 — First Draft MVP  
**Framework:** React + Node.js + Express  
**AI Layer:** Anthropic Claude API (claude-sonnet-4-20250514)  
**Target User:** Enterprise Architects & AI Transformation Consultants  

---

## Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Platform Architecture](#2-platform-architecture)
3. [Project Structure](#3-project-structure)
4. [Technology Stack](#4-technology-stack)
5. [Core Workflow — 7 Steps](#5-core-workflow--7-steps)
6. [APQC Framework Integration](#6-apqc-framework-integration)
7. [Regulatory Knowledge Base — JSON Structure](#7-regulatory-knowledge-base--json-structure)
8. [AI Integration Layer](#8-ai-integration-layer)
9. [Component Implementation Guide](#9-component-implementation-guide)
10. [Data Models](#10-data-models)
11. [API Endpoints](#11-api-endpoints)
12. [MVP Build Sequence](#12-mvp-build-sequence)
13. [Environment Setup](#13-environment-setup)

---

## 1. Overview & Vision

**AI Business Readiness** is an EA Toolkit that guides large enterprises through a structured, AI-accelerated assessment of their readiness to adopt AI at enterprise scale.

The toolkit uses Enterprise Architecture methodology (EA), grounded in the APQC Process Classification Framework (PCF), to produce a credible, traceable, and regulatory-compliant AI Transformation Roadmap.

### Core Value Proposition

- Takes an enterprise from **AI Strategic Intent → AI Transformation Roadmap** in hours, not weeks
- **APQC-anchored** capability mapping eliminates hallucination risk on process names
- **Regulatory compliance embedded** from day one — EU AI Act, GDPR and other regional frameworks
- Two operating modes: **Autopilot** (AI-driven) and **Standard** (user-driven, AI-assisted)

### The 7-Step Workflow

```
Step 1: AI Strategic Intent
        ↓
Step 2: AI Capability Assessment  (APQC L1–L3)
        ↓
Step 3: Data & Technology Readiness
        ↓
Step 4: AI Governance & Risk  (Regulatory Knowledge Base)
        ↓
Step 5: AI Operating Model Design
        ↓
Step 6: Change & Adoption Readiness
        ↓
Step 7: AI Transformation Roadmap
```

---

## 2. Platform Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Autopilot│ │ Standard │ │ Toolkit  │            │
│  │   Mode   │ │   Mode   │ │  Panels  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│         ↕ REST API / JSON                           │
├─────────────────────────────────────────────────────┤
│                BACKEND (Node/Express)                │
│  ┌──────────────┐  ┌──────────────────────────┐    │
│  │  AI Service  │  │   Data Service            │    │
│  │ Claude API   │  │ APQC JSON + Reg. KB JSON  │    │
│  └──────────────┘  └──────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                  DATA LAYER (JSON Files)             │
│  apqc_framework.json   regulatory_knowledge_base.json│
│  session_store.json    roadmap_templates.json        │
└─────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

```
ai-business-readiness/
├── README.md
├── package.json
├── .env
├── .env.example
│
├── /client                          # React Frontend
│   ├── package.json
│   ├── /public
│   └── /src
│       ├── App.jsx
│       ├── /components
│       │   ├── /layout
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Header.jsx
│       │   │   └── StepProgress.jsx
│       │   ├── /steps
│       │   │   ├── Step1_StrategicIntent.jsx
│       │   │   ├── Step2_CapabilityAssessment.jsx
│       │   │   ├── Step3_DataTechReadiness.jsx
│       │   │   ├── Step4_GovernanceRisk.jsx
│       │   │   ├── Step5_OperatingModel.jsx
│       │   │   ├── Step6_ChangeAdoption.jsx
│       │   │   └── Step7_Roadmap.jsx
│       │   ├── /shared
│       │   │   ├── AIAssistant.jsx
│       │   │   ├── ModelViewer.jsx
│       │   │   ├── HeatMap.jsx
│       │   │   ├── RegulatoryAlert.jsx
│       │   │   └── ExportPanel.jsx
│       │   └── /toolkit
│       │       ├── CapabilityMapToolkit.jsx
│       │       ├── RegulatoryScanToolkit.jsx
│       │       └── WorkshopFacilitator.jsx
│       ├── /context
│       │   └── AssessmentContext.jsx
│       ├── /hooks
│       │   ├── useAIAssistant.js
│       │   └── useAPQC.js
│       └── /utils
│           ├── apqcMapper.js
│           └── regulatoryChecker.js
│
├── /server                          # Node/Express Backend
│   ├── index.js
│   ├── /routes
│   │   ├── ai.routes.js
│   │   ├── apqc.routes.js
│   │   ├── regulatory.routes.js
│   │   └── assessment.routes.js
│   ├── /services
│   │   ├── claude.service.js
│   │   ├── apqc.service.js
│   │   └── regulatory.service.js
│   └── /middleware
│       └── errorHandler.js
│
└── /data                            # JSON Knowledge Bases
    ├── apqc_framework.json
    ├── regulatory_knowledge_base.json
    ├── roadmap_templates.json
    └── maturity_benchmarks.json
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS | Utility-first styling |
| State | React Context + useReducer | Assessment state management |
| Charts | Recharts | Heatmaps, roadmap visualizations |
| Backend | Node.js + Express | API server |
| AI | Anthropic Claude API | AI generation and assistance |
| Data | JSON flat files | APQC + Regulatory knowledge bases |
| Export | jsPDF + xlsx | PDF and Excel export |
| Dev | VS Code + GitHub Copilot | Development environment |

### Installation

```bash
# Root
npm init -y
npm install express cors dotenv axios

# Client
cd client
npm create vite@latest . -- --template react
npm install tailwindcss recharts jspdf xlsx lucide-react

# Server
cd server
npm install @anthropic-ai/sdk express cors dotenv
```

---

## 5. Core Workflow — 7 Steps

### Step 1: AI Strategic Intent

**Purpose:** Capture the organization's AI ambition, business context and strategic drivers.

**AI Behavior (Autopilot):** Ask 7 structured questions, progressively building the Strategic Intent Statement.

**Questions sequence:**
```
Q1. Describe your organization (industry, size, geography, business model)
Q2. What are your top 3 strategic business priorities for the next 3 years?
Q3. What is your current level of AI adoption? (None / Experimental / Scaling / AI-First)
Q4. What are your primary AI ambitions? (Cost reduction / Revenue growth / Risk management / Customer experience / Innovation)
Q5. What are your biggest business challenges that AI could address?
Q6. Who are your main competitors and how are they using AI?
Q7. What constraints exist? (Budget / Regulation / Culture / Technology / Skills)
```

**Output:** `StrategicIntentStatement` object — structured JSON containing all answers plus AI-generated summary statement.

---

### Step 2: AI Capability Assessment

**Purpose:** Map current AI capabilities against APQC L1–L3 framework for the detected industry. Score maturity and identify gaps.

**AI Behavior:** Auto-detect industry from Step 1, load relevant APQC subset, generate initial capability scores, allow user override.

**Output:** `CapabilityHeatmap` — scored capability map with maturity ratings per APQC process.

---

### Step 3: Data & Technology Readiness

**Purpose:** Assess the data and technology foundations required to deliver the AI capabilities identified in Step 2.

**Dimensions assessed:**
- Data quality and availability
- Cloud and infrastructure readiness
- Integration architecture complexity
- AI/ML tooling and platform maturity
- Cybersecurity and data governance posture

**Output:** `TechReadinessScore` — scored readiness per dimension with gap commentary.

---

### Step 4: AI Governance & Risk

**Purpose:** Classify all AI use cases by regulatory risk level, map against applicable regulations, and generate a governance blueprint.

**AI Behavior:** Auto-detect applicable regulations from Step 1 (region/industry), classify each AI capability from Step 2 by risk level, flag compliance gaps against active deadlines.

**Output:** `GovernanceBlueprint` + `RegulatoryRiskMatrix`

---

### Step 5: AI Operating Model Design

**Purpose:** Design the target operating model for AI delivery — structure, roles, sourcing, and governance.

**Dimensions:**
- AI Center of Excellence (CoE) design
- Roles and skills gap analysis
- Build vs Buy vs Partner decisions
- AI delivery model (Centralised / Federated / Hybrid)

**Output:** `AIOperatingModelCanvas`

---

### Step 6: Change & Adoption Readiness

**Purpose:** Assess organizational readiness for AI transformation — culture, leadership, change capacity and adoption risks.

**Output:** `ChangeReadinessReport` with stakeholder heatmap and adoption risk register.

---

### Step 7: AI Transformation Roadmap

**Purpose:** Synthesize all previous steps into a prioritized, sequenced, investment-graded transformation roadmap.

**Horizons:**
- **Quick Wins:** 0–6 months
- **Strategic Programs:** 6–24 months
- **AI-First Horizon:** 24+ months

**Output:** `TransformationRoadmap` — initiative list with priorities, dependencies, effort estimates, business cases, and compliance flags.

---

## 6. APQC Framework Integration

### File: `/data/apqc_framework.json`

The APQC data is structured as a hierarchical JSON with industry tags and strategic theme mappings.

```json
{
  "version": "7.0",
  "last_updated": "2024-01",
  "industries": [
    "financial_services",
    "healthcare",
    "manufacturing",
    "retail",
    "energy_utilities",
    "telecommunications",
    "public_sector",
    "professional_services",
    "pharmaceutical",
    "insurance"
  ],
  "framework": [
    {
      "id": "APQC-1",
      "level": 1,
      "code": "1.0",
      "name": "Develop Vision and Strategy",
      "category": "operating",
      "industries": ["all"],
      "strategic_themes": ["growth", "innovation", "transformation"],
      "ai_relevance": "high",
      "children": [
        {
          "id": "APQC-1.1",
          "level": 2,
          "code": "1.1",
          "name": "Define the business concept and long-term vision",
          "parent": "APQC-1",
          "industries": ["all"],
          "strategic_themes": ["growth", "innovation"],
          "ai_relevance": "medium",
          "children": [
            {
              "id": "APQC-1.1.1",
              "level": 3,
              "code": "1.1.1",
              "name": "Define the business model",
              "parent": "APQC-1.1",
              "industries": ["all"],
              "strategic_themes": ["growth", "innovation"],
              "ai_relevance": "medium",
              "ai_use_cases": [
                "AI-driven business model simulation",
                "Market opportunity analysis"
              ]
            },
            {
              "id": "APQC-1.1.2",
              "level": 3,
              "code": "1.1.2",
              "name": "Evaluate and prioritize market opportunities",
              "parent": "APQC-1.1",
              "industries": ["all"],
              "strategic_themes": ["growth"],
              "ai_relevance": "high",
              "ai_use_cases": [
                "Predictive market analysis",
                "Competitive intelligence AI"
              ]
            }
          ]
        },
        {
          "id": "APQC-1.2",
          "level": 2,
          "code": "1.2",
          "name": "Develop business strategy",
          "parent": "APQC-1",
          "industries": ["all"],
          "strategic_themes": ["growth", "transformation"],
          "ai_relevance": "high",
          "children": [
            {
              "id": "APQC-1.2.1",
              "level": 3,
              "code": "1.2.1",
              "name": "Perform external environment analysis",
              "parent": "APQC-1.2",
              "industries": ["all"],
              "strategic_themes": ["growth", "innovation"],
              "ai_relevance": "high",
              "ai_use_cases": [
                "Real-time competitive monitoring",
                "Sentiment analysis of market signals"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "APQC-2",
      "level": 1,
      "code": "2.0",
      "name": "Develop and Manage Products and Services",
      "category": "operating",
      "industries": ["manufacturing", "retail", "pharmaceutical", "financial_services"],
      "strategic_themes": ["innovation", "growth", "customer"],
      "ai_relevance": "high",
      "children": [
        {
          "id": "APQC-2.1",
          "level": 2,
          "code": "2.1",
          "name": "Manage product and service portfolio",
          "parent": "APQC-2",
          "industries": ["manufacturing", "retail", "pharmaceutical"],
          "strategic_themes": ["innovation", "growth"],
          "ai_relevance": "high",
          "children": [
            {
              "id": "APQC-2.1.1",
              "level": 3,
              "code": "2.1.1",
              "name": "Evaluate performance of existing products and services",
              "parent": "APQC-2.1",
              "industries": ["manufacturing", "retail", "pharmaceutical"],
              "strategic_themes": ["efficiency", "growth"],
              "ai_relevance": "high",
              "ai_use_cases": [
                "Product performance prediction",
                "Automated performance dashboards"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "APQC-3",
      "level": 1,
      "code": "3.0",
      "name": "Market and Sell Products and Services",
      "category": "operating",
      "industries": ["all"],
      "strategic_themes": ["growth", "customer"],
      "ai_relevance": "high",
      "children": [
        {
          "id": "APQC-3.1",
          "level": 2,
          "code": "3.1",
          "name": "Understand markets, customers and capabilities",
          "parent": "APQC-3",
          "industries": ["all"],
          "strategic_themes": ["customer", "growth"],
          "ai_relevance": "high",
          "children": [
            {
              "id": "APQC-3.1.1",
              "level": 3,
              "code": "3.1.1",
              "name": "Perform customer and market intelligence analysis",
              "parent": "APQC-3.1",
              "industries": ["all"],
              "strategic_themes": ["customer", "growth"],
              "ai_relevance": "high",
              "ai_use_cases": [
                "Customer segmentation AI",
                "Churn prediction",
                "Next-best-action models"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "APQC-9",
      "level": 1,
      "code": "9.0",
      "name": "Develop and Manage Human Capital",
      "category": "management",
      "industries": ["all"],
      "strategic_themes": ["efficiency", "transformation"],
      "ai_relevance": "high",
      "children": [
        {
          "id": "APQC-9.1",
          "level": 2,
          "code": "9.1",
          "name": "Develop and manage HR planning, policies and strategies",
          "parent": "APQC-9",
          "industries": ["all"],
          "strategic_themes": ["transformation", "efficiency"],
          "ai_relevance": "medium",
          "children": [
            {
              "id": "APQC-9.1.1",
              "level": 3,
              "code": "9.1.1",
              "name": "Manage workforce forecasting",
              "parent": "APQC-9.1",
              "industries": ["all"],
              "strategic_themes": ["efficiency"],
              "ai_relevance": "high",
              "ai_use_cases": [
                "Workforce demand forecasting",
                "Skills gap AI analysis"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

> **Note for Copilot:** The full APQC PCF framework covers 13 L1 categories and hundreds of L2/L3 processes. The above is a structural template. Expand all 13 L1 categories following the same schema pattern. Full APQC PCF data is available at apqc.org.

### APQC Service: `/server/services/apqc.service.js`

```javascript
const fs = require('fs');
const path = require('path');

const apqcData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/apqc_framework.json'), 'utf8')
);

/**
 * Detect industry from org description using Claude AI
 * Returns: { primary_industry, secondary_industry, confidence }
 */
async function detectIndustry(orgDescription, claudeService) {
  const prompt = `
    Analyze this organization description and classify it into APQC industry categories.
    
    Available industries: ${apqcData.industries.join(', ')}
    
    Organization description: "${orgDescription}"
    
    Return ONLY a JSON object with:
    {
      "primary_industry": "<industry>",
      "secondary_industry": "<industry or null>",
      "confidence": <0.0-1.0>,
      "reasoning": "<brief explanation>"
    }
  `;
  
  const response = await claudeService.complete(prompt);
  return JSON.parse(response);
}

/**
 * Get APQC processes filtered by industry and level
 */
function getProcessesByIndustry(industry, level = 3) {
  const results = [];
  
  function traverse(nodes) {
    for (const node of nodes) {
      if (node.level <= level) {
        const matchesIndustry = 
          node.industries.includes('all') || 
          node.industries.includes(industry);
        
        if (matchesIndustry) {
          results.push({
            id: node.id,
            level: node.level,
            code: node.code,
            name: node.name,
            ai_relevance: node.ai_relevance,
            ai_use_cases: node.ai_use_cases || [],
            strategic_themes: node.strategic_themes
          });
        }
        
        if (node.children) {
          traverse(node.children);
        }
      }
    }
  }
  
  traverse(apqcData.framework);
  return results;
}

/**
 * Score capability relevance against strategic intent
 * Returns processes sorted by relevance score
 */
async function scoreCapabilityRelevance(processes, strategicIntent, claudeService) {
  const prompt = `
    Given this strategic intent:
    ${JSON.stringify(strategicIntent, null, 2)}
    
    Score each of these APQC processes for AI relevance (0-5) based on:
    - Alignment with stated strategic priorities
    - Potential AI impact
    - Industry context
    
    Processes: ${JSON.stringify(processes.map(p => ({ id: p.id, name: p.name })), null, 2)}
    
    Return ONLY a JSON array:
    [{ "id": "APQC-x.x.x", "relevance_score": 0-5, "rationale": "brief reason" }]
  `;
  
  const response = await claudeService.complete(prompt);
  const scores = JSON.parse(response);
  
  return processes.map(p => ({
    ...p,
    relevance_score: scores.find(s => s.id === p.id)?.relevance_score || 0,
    rationale: scores.find(s => s.id === p.id)?.rationale || ''
  })).sort((a, b) => b.relevance_score - a.relevance_score);
}

module.exports = { detectIndustry, getProcessesByIndustry, scoreCapabilityRelevance };
```

---

## 7. Regulatory Knowledge Base — JSON Structure

### File: `/data/regulatory_knowledge_base.json`

```json
{
  "version": "1.0",
  "last_updated": "2025-04",
  "regions": [
    {
      "id": "EU",
      "name": "European Union",
      "regulations": [
        {
          "id": "EU-AI-ACT",
          "name": "EU AI Act",
          "full_name": "Regulation (EU) 2024/1689 on Artificial Intelligence",
          "status": "active",
          "effective_date": "2024-08-01",
          "authority": "European AI Office",
          "scope": "All AI systems placed on the EU market or used in the EU",
          "url": "https://artificialintelligenceact.eu",
          "applies_to_industries": ["all"],
          "risk_framework": {
            "levels": [
              {
                "level": "unacceptable",
                "label": "Prohibited",
                "color": "red",
                "description": "AI systems that pose an unacceptable risk to safety, livelihoods and rights of people",
                "examples": [
                  "Social scoring by governments",
                  "Real-time biometric surveillance in public spaces",
                  "Manipulation of vulnerable groups",
                  "Predictive policing based on profiling"
                ],
                "action": "PROHIBITED — must not be deployed",
                "active_since": "2025-02-02"
              },
              {
                "level": "high",
                "label": "High Risk",
                "color": "orange",
                "description": "AI in critical infrastructure, education, employment, essential services, law enforcement, migration, justice",
                "examples": [
                  "CV screening and recruitment AI",
                  "Credit scoring systems",
                  "Medical device AI",
                  "Critical infrastructure management",
                  "Border control AI",
                  "AI in court decisions"
                ],
                "action": "PERMITTED with mandatory compliance program",
                "compliance_requirements": [
                  "Risk management system (Art. 9)",
                  "Data governance (Art. 10)",
                  "Technical documentation (Art. 11)",
                  "Record keeping (Art. 12)",
                  "Transparency to deployers (Art. 13)",
                  "Human oversight (Art. 14)",
                  "Accuracy and robustness (Art. 15)",
                  "Fundamental rights impact assessment (Art. 27)"
                ],
                "deadline": "2026-08-02"
              },
              {
                "level": "limited",
                "label": "Limited Risk",
                "color": "yellow",
                "description": "AI systems with specific transparency obligations",
                "examples": [
                  "Chatbots",
                  "Deepfake generators",
                  "Emotion recognition systems",
                  "AI-generated content"
                ],
                "action": "PERMITTED with transparency obligations",
                "compliance_requirements": [
                  "Disclose AI interaction to users (Art. 50)",
                  "Label AI-generated content",
                  "Inform users of emotion recognition"
                ],
                "deadline": "2026-08-02"
              },
              {
                "level": "minimal",
                "label": "Minimal Risk",
                "color": "green",
                "description": "All other AI systems — spam filters, AI in video games, etc.",
                "examples": [
                  "AI-powered spam filters",
                  "Recommendation engines (non-critical)",
                  "Inventory optimization AI",
                  "Process automation (non-HR, non-critical)"
                ],
                "action": "PERMITTED — standard governance recommended",
                "compliance_requirements": [
                  "Voluntary codes of conduct recommended"
                ],
                "deadline": null
              }
            ]
          },
          "compliance_timeline": [
            {
              "date": "2024-08-01",
              "milestone": "EU AI Act enters into force",
              "status": "passed",
              "applies_to": "all"
            },
            {
              "date": "2025-02-02",
              "milestone": "Prohibited AI practices banned; AI literacy training mandatory",
              "status": "active",
              "applies_to": "all",
              "articles": ["Art. 4", "Art. 5"]
            },
            {
              "date": "2025-08-02",
              "milestone": "GPAI model obligations apply",
              "status": "active",
              "applies_to": "gpai_providers",
              "articles": ["Art. 51-56"]
            },
            {
              "date": "2026-08-02",
              "milestone": "High-risk AI system requirements fully enforceable",
              "status": "upcoming",
              "applies_to": "high_risk_deployers",
              "articles": ["Art. 8-15", "Art. 26", "Art. 27"]
            },
            {
              "date": "2027-08-02",
              "milestone": "Full compliance required for all in-scope AI systems",
              "status": "upcoming",
              "applies_to": "all"
            }
          ],
          "penalties": {
            "prohibited_systems": "Up to €35M or 7% of global annual turnover",
            "high_risk_non_compliance": "Up to €15M or 3% of global annual turnover",
            "misleading_information": "Up to €7.5M or 1.5% of global annual turnover"
          },
          "key_articles": [
            { "article": "Art. 4", "topic": "AI Literacy", "status": "active" },
            { "article": "Art. 5", "topic": "Prohibited AI Practices", "status": "active" },
            { "article": "Art. 9", "topic": "Risk Management System", "status": "upcoming_2026" },
            { "article": "Art. 10", "topic": "Data Governance", "status": "upcoming_2026" },
            { "article": "Art. 11", "topic": "Technical Documentation", "status": "upcoming_2026" },
            { "article": "Art. 12", "topic": "Record Keeping", "status": "upcoming_2026" },
            { "article": "Art. 13", "topic": "Transparency", "status": "upcoming_2026" },
            { "article": "Art. 14", "topic": "Human Oversight", "status": "upcoming_2026" },
            { "article": "Art. 15", "topic": "Accuracy and Robustness", "status": "upcoming_2026" },
            { "article": "Art. 27", "topic": "Fundamental Rights Impact Assessment", "status": "upcoming_2026" },
            { "article": "Art. 50", "topic": "Transparency for Certain AI Systems", "status": "upcoming_2026" }
          ]
        },
        {
          "id": "EU-GDPR",
          "name": "GDPR",
          "full_name": "General Data Protection Regulation (EU) 2016/679",
          "status": "active",
          "effective_date": "2018-05-25",
          "authority": "National Data Protection Authorities",
          "scope": "Processing of personal data of EU residents",
          "applies_to_industries": ["all"],
          "ai_specific_requirements": [
            "Right to explanation for automated decisions (Art. 22)",
            "Data minimization for AI training datasets",
            "Purpose limitation for AI model training",
            "DPIA required for high-risk AI data processing",
            "Data subject rights apply to AI-generated profiles"
          ],
          "penalties": {
            "severe": "Up to €20M or 4% of global annual turnover"
          }
        },
        {
          "id": "EU-DATA-ACT",
          "name": "EU Data Act",
          "full_name": "Regulation (EU) 2023/2854",
          "status": "active",
          "effective_date": "2025-09-12",
          "authority": "European Commission",
          "scope": "Data generated by connected products and related services",
          "applies_to_industries": ["manufacturing", "energy_utilities", "telecommunications"],
          "ai_specific_requirements": [
            "Data sharing obligations for AI training",
            "Interoperability requirements for data spaces",
            "Restrictions on data exclusivity"
          ]
        }
      ]
    },
    {
      "id": "US",
      "name": "United States",
      "regulations": [
        {
          "id": "US-NIST-AI-RMF",
          "name": "NIST AI Risk Management Framework",
          "full_name": "NIST AI RMF 1.0",
          "status": "active",
          "effective_date": "2023-01-26",
          "authority": "National Institute of Standards and Technology",
          "scope": "Voluntary framework for managing AI risks",
          "applies_to_industries": ["all"],
          "mandatory": false,
          "core_functions": ["Govern", "Map", "Measure", "Manage"],
          "ai_specific_requirements": [
            "AI risk identification and classification",
            "Trustworthiness characteristics assessment",
            "Human oversight mechanisms",
            "AI lifecycle documentation"
          ]
        },
        {
          "id": "US-EO-AI",
          "name": "Executive Order on AI Safety",
          "full_name": "Executive Order 14110 on Safe, Secure and Trustworthy AI",
          "status": "active",
          "effective_date": "2023-10-30",
          "authority": "White House / Federal Agencies",
          "scope": "Federal agencies and large AI model developers",
          "applies_to_industries": ["all"],
          "mandatory": false,
          "ai_specific_requirements": [
            "Safety testing for powerful AI models",
            "Watermarking of AI-generated content",
            "AI talent and immigration policy",
            "Federal agency AI governance"
          ]
        }
      ]
    },
    {
      "id": "UK",
      "name": "United Kingdom",
      "regulations": [
        {
          "id": "UK-AI-FRAMEWORK",
          "name": "UK AI Regulation Framework",
          "full_name": "A pro-innovation approach to AI regulation",
          "status": "active",
          "effective_date": "2023-03-29",
          "authority": "Department for Science, Innovation and Technology",
          "scope": "Sector-led AI regulation via existing regulators",
          "applies_to_industries": ["all"],
          "mandatory": false,
          "principles": [
            "Safety, security and robustness",
            "Appropriate transparency and explainability",
            "Fairness",
            "Accountability and governance",
            "Contestability and redress"
          ]
        }
      ]
    },
    {
      "id": "APAC",
      "name": "Asia Pacific",
      "regulations": [
        {
          "id": "SG-AI-GOVERNANCE",
          "name": "Singapore Model AI Governance Framework",
          "full_name": "Model Artificial Intelligence Governance Framework (2nd Edition)",
          "status": "active",
          "effective_date": "2020-01-21",
          "authority": "Info-communications Media Development Authority (IMDA)",
          "scope": "Voluntary framework for private sector AI governance",
          "applies_to_industries": ["all"],
          "mandatory": false
        },
        {
          "id": "CN-AI-REGULATION",
          "name": "China AI Regulations",
          "full_name": "Interim Measures for Generative AI Services",
          "status": "active",
          "effective_date": "2023-08-15",
          "authority": "Cyberspace Administration of China",
          "scope": "Generative AI services provided in China",
          "applies_to_industries": ["all"],
          "mandatory": true
        }
      ]
    },
    {
      "id": "ME",
      "name": "Middle East",
      "regulations": [
        {
          "id": "UAE-AI-STRATEGY",
          "name": "UAE National AI Strategy 2031",
          "full_name": "UAE National Strategy for Artificial Intelligence 2031",
          "status": "active",
          "effective_date": "2019-10-01",
          "authority": "UAE Office of AI",
          "scope": "AI adoption across government and private sector",
          "applies_to_industries": ["all"],
          "mandatory": false
        }
      ]
    }
  ],
  "industry_specific_regulations": [
    {
      "industry": "financial_services",
      "regulations": [
        {
          "id": "EU-DORA",
          "name": "EU Digital Operational Resilience Act",
          "ai_relevance": "AI systems in financial infrastructure resilience",
          "effective_date": "2025-01-17"
        },
        {
          "id": "SR11-7",
          "name": "SR 11-7 (US Banking AI Models)",
          "ai_relevance": "Model risk management for AI in banking",
          "effective_date": "2011-04-04"
        }
      ]
    },
    {
      "industry": "healthcare",
      "regulations": [
        {
          "id": "EU-MDR",
          "name": "EU Medical Device Regulation",
          "ai_relevance": "AI as medical device (SaMD)",
          "effective_date": "2021-05-26"
        },
        {
          "id": "US-FDA-AI",
          "name": "FDA AI/ML Action Plan",
          "ai_relevance": "AI-based software as medical device",
          "effective_date": "2021-01-12"
        }
      ]
    },
    {
      "industry": "pharmaceutical",
      "regulations": [
        {
          "id": "EMA-AI-REFLECTION",
          "name": "EMA Reflection Paper on AI in Medicines",
          "ai_relevance": "AI use in drug development and clinical trials",
          "effective_date": "2023-07-17"
        }
      ]
    }
  ]
}
```

---

## 8. AI Integration Layer

### Claude Service: `/server/services/claude.service.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Base completion function
 */
async function complete(prompt, systemPrompt = null) {
  const messages = [{ role: 'user', content: prompt }];
  
  const params = {
    model: MODEL,
    max_tokens: 2000,
    messages
  };
  
  if (systemPrompt) {
    params.system = systemPrompt;
  }
  
  const response = await client.messages.create(params);
  return response.content[0].text;
}

/**
 * Step 1: Generate Strategic Intent Statement from Q&A answers
 */
async function generateStrategicIntent(answers) {
  const system = `You are an expert Enterprise Architect and AI Strategy consultant. 
  Generate structured, professional outputs grounded in EA methodology.
  Always return valid JSON only — no markdown, no preamble.`;
  
  const prompt = `
  Based on these organizational assessment answers, generate a comprehensive AI Strategic Intent Statement.
  
  Answers: ${JSON.stringify(answers, null, 2)}
  
  Return ONLY a JSON object:
  {
    "organization_profile": {
      "industry": "<detected industry>",
      "size": "<size category>",
      "geography": "<regions>",
      "business_model": "<summary>"
    },
    "strategic_intent_statement": "<2-3 sentence executive summary of AI ambition>",
    "ai_ambition_level": "<Augmentation|Automation|AI-Augmented|AI-First>",
    "strategic_priorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
    "ai_opportunity_areas": ["<area 1>", "<area 2>", "<area 3>"],
    "key_constraints": ["<constraint 1>", "<constraint 2>"],
    "recommended_focus_areas": ["<focus 1>", "<focus 2>", "<focus 3>"]
  }`;
  
  const response = await complete(prompt, system);
  return JSON.parse(response);
}

/**
 * Step 2: Generate Capability Assessment from APQC processes + Strategic Intent
 */
async function generateCapabilityAssessment(strategicIntent, apqcProcesses) {
  const system = `You are an expert Enterprise Architect. 
  Assess AI capability maturity using the APQC PCF framework.
  Always return valid JSON only.`;
  
  const prompt = `
  Assess AI capability maturity for this organization across these APQC processes.
  
  Strategic Intent: ${JSON.stringify(strategicIntent, null, 2)}
  APQC Processes (L1-L3): ${JSON.stringify(apqcProcesses, null, 2)}
  
  For each process, estimate current maturity and target maturity using:
  0 = Not applicable
  1 = Initial (ad-hoc, no formal AI)
  2 = Developing (pilots underway)
  3 = Defined (standardized AI use)
  4 = Managed (measured and controlled)
  5 = Optimizing (continuous improvement)
  
  Return ONLY a JSON array:
  [{
    "apqc_id": "<id>",
    "process_name": "<name>",
    "current_maturity": <0-5>,
    "target_maturity": <0-5>,
    "gap": <difference>,
    "priority": "<High|Medium|Low>",
    "ai_use_cases": ["<use case 1>", "<use case 2>"],
    "quick_win": <true|false>,
    "rationale": "<brief explanation>"
  }]`;
  
  const response = await complete(prompt, system);
  return JSON.parse(response);
}

/**
 * Step 4: Classify AI use cases by regulatory risk
 */
async function classifyRegulatoryRisk(aiUseCases, applicableRegulations, organizationProfile) {
  const system = `You are an expert in AI regulation and compliance, specializing in the EU AI Act.
  Classify AI use cases accurately against regulatory frameworks.
  Always return valid JSON only.`;
  
  const prompt = `
  Classify each AI use case by regulatory risk level based on applicable regulations.
  
  Organization: ${JSON.stringify(organizationProfile, null, 2)}
  Applicable Regulations: ${JSON.stringify(applicableRegulations.map(r => r.id), null, 2)}
  AI Use Cases: ${JSON.stringify(aiUseCases, null, 2)}
  
  For each use case, apply EU AI Act risk classification:
  - unacceptable: Prohibited
  - high: Requires full compliance program by Aug 2026
  - limited: Transparency obligations
  - minimal: Standard governance
  
  Return ONLY a JSON array:
  [{
    "use_case": "<name>",
    "apqc_process": "<process name>",
    "eu_ai_act_risk_level": "<unacceptable|high|limited|minimal>",
    "risk_rationale": "<why this classification>",
    "applicable_articles": ["Art. X", "Art. Y"],
    "compliance_actions_required": ["<action 1>", "<action 2>"],
    "compliance_deadline": "<date or null>",
    "gdpr_relevance": "<High|Medium|Low|None>",
    "industry_specific_regulations": ["<reg 1>"]
  }]`;
  
  const response = await complete(prompt, system);
  return JSON.parse(response);
}

/**
 * Step 7: Generate Transformation Roadmap
 */
async function generateTransformationRoadmap(allStepsData) {
  const system = `You are an expert Enterprise Architect and AI Transformation specialist.
  Generate realistic, prioritized, business-grounded transformation roadmaps.
  Always return valid JSON only.`;
  
  const prompt = `
  Generate a comprehensive AI Transformation Roadmap synthesizing all assessment data.
  
  Assessment Data: ${JSON.stringify(allStepsData, null, 2)}
  
  Structure initiatives into three horizons:
  - quick_wins: 0-6 months, low complexity, high impact
  - strategic_programs: 6-24 months, medium-high complexity
  - ai_first_horizon: 24+ months, transformational
  
  Return ONLY a JSON object:
  {
    "roadmap_summary": "<executive summary>",
    "total_initiatives": <number>,
    "estimated_investment_range": "<range e.g. €5M-€15M>",
    "horizons": {
      "quick_wins": [{
        "id": "QW-1",
        "initiative": "<name>",
        "description": "<brief description>",
        "apqc_processes": ["<process>"],
        "ai_capability": "<capability>",
        "business_value": "<value statement>",
        "estimated_effort": "<weeks>",
        "estimated_cost": "<range>",
        "dependencies": [],
        "compliance_flags": [],
        "priority_score": <1-10>
      }],
      "strategic_programs": [{ "id": "SP-1", "...": "..." }],
      "ai_first_horizon": [{ "id": "AF-1", "...": "..." }]
    },
    "compliance_roadmap": [{
      "regulation": "EU AI Act",
      "deadline": "2026-08-02",
      "required_actions": ["<action>"],
      "linked_initiatives": ["SP-1", "SP-2"]
    }],
    "critical_dependencies": ["<dependency 1>"],
    "risk_register": [{
      "risk": "<risk description>",
      "likelihood": "<High|Medium|Low>",
      "impact": "<High|Medium|Low>",
      "mitigation": "<mitigation action>"
    }]
  }`;
  
  const response = await complete(prompt, system);
  return JSON.parse(response);
}

/**
 * AI Assistant — analyze and suggest updates to existing models
 */
async function assistantAnalyze(currentModel, userQuery, stepContext) {
  const system = `You are an expert EA AI Assistant embedded in an AI Business Readiness platform.
  Help users analyze, update and improve their EA models.
  Be specific, actionable and concise.`;
  
  const prompt = `
  Context: User is working on ${stepContext}
  Current model: ${JSON.stringify(currentModel, null, 2)}
  User query: "${userQuery}"
  
  Provide analysis and specific recommendations. If suggesting model updates, 
  include the exact JSON changes needed.`;
  
  return await complete(prompt, system);
}

module.exports = {
  complete,
  generateStrategicIntent,
  generateCapabilityAssessment,
  classifyRegulatoryRisk,
  generateTransformationRoadmap,
  assistantAnalyze
};
```

---

## 9. Component Implementation Guide

### Assessment Context: `/client/src/context/AssessmentContext.jsx`

```jsx
import { createContext, useContext, useReducer } from 'react';

const initialState = {
  mode: 'standard', // 'autopilot' | 'standard'
  currentStep: 1,
  completedSteps: [],
  organization: null,
  steps: {
    1: { status: 'pending', data: null }, // Strategic Intent
    2: { status: 'pending', data: null }, // Capability Assessment
    3: { status: 'pending', data: null }, // Data & Tech Readiness
    4: { status: 'pending', data: null }, // Governance & Risk
    5: { status: 'pending', data: null }, // Operating Model
    6: { status: 'pending', data: null }, // Change & Adoption
    7: { status: 'pending', data: null }, // Roadmap
  },
  regulatoryContext: {
    detectedRegions: [],
    applicableRegulations: [],
    riskMatrix: []
  },
  apqcContext: {
    detectedIndustry: null,
    selectedProcesses: [],
    capabilityScores: []
  }
};

function assessmentReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_STEP_DATA':
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.step]: { status: 'complete', data: action.payload }
        },
        completedSteps: [...new Set([...state.completedSteps, action.step])]
      };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_REGULATORY_CONTEXT':
      return { ...state, regulatoryContext: action.payload };
    case 'SET_APQC_CONTEXT':
      return { ...state, apqcContext: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);
  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  return useContext(AssessmentContext);
}
```

### Step Progress Component: `/client/src/components/layout/StepProgress.jsx`

```jsx
import { useAssessment } from '../../context/AssessmentContext';

const STEPS = [
  { id: 1, label: 'Strategic Intent', icon: '🎯' },
  { id: 2, label: 'Capability Assessment', icon: '📊' },
  { id: 3, label: 'Data & Tech Readiness', icon: '🔧' },
  { id: 4, label: 'Governance & Risk', icon: '⚖️' },
  { id: 5, label: 'Operating Model', icon: '🏗️' },
  { id: 6, label: 'Change & Adoption', icon: '🔄' },
  { id: 7, label: 'Roadmap', icon: '🗺️' },
];

export default function StepProgress() {
  const { state, dispatch } = useAssessment();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      {STEPS.map((step, idx) => {
        const isComplete = state.completedSteps.includes(step.id);
        const isCurrent = state.currentStep === step.id;
        
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isComplete && dispatch({ type: 'SET_CURRENT_STEP', payload: step.id })}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                ${isCurrent ? 'bg-blue-600 text-white' : ''}
                ${isComplete && !isCurrent ? 'text-green-600 cursor-pointer hover:bg-green-50' : ''}
                ${!isComplete && !isCurrent ? 'text-gray-400 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-lg">{step.icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
              {isComplete && <span className="text-xs">✓</span>}
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-8 mx-1 ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Regulatory Alert Component: `/client/src/components/shared/RegulatoryAlert.jsx`

```jsx
const RISK_COLORS = {
  unacceptable: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', badge: 'bg-red-600' },
  high: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', badge: 'bg-orange-500' },
  limited: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', badge: 'bg-yellow-500' },
  minimal: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', badge: 'bg-green-500' },
};

export default function RegulatoryAlert({ useCase }) {
  const colors = RISK_COLORS[useCase.eu_ai_act_risk_level] || RISK_COLORS.minimal;
  
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-3`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`${colors.badge} text-white text-xs px-2 py-0.5 rounded-full uppercase font-bold`}>
              {useCase.eu_ai_act_risk_level}
            </span>
            <span className={`font-semibold ${colors.text}`}>{useCase.use_case}</span>
          </div>
          <p className={`text-sm ${colors.text} mb-2`}>{useCase.risk_rationale}</p>
          {useCase.compliance_deadline && (
            <p className={`text-xs ${colors.text} font-medium`}>
              ⏰ Compliance deadline: {useCase.compliance_deadline}
            </p>
          )}
        </div>
      </div>
      {useCase.compliance_actions_required?.length > 0 && (
        <div className="mt-3">
          <p className={`text-xs font-semibold ${colors.text} mb-1`}>Required actions:</p>
          <ul className="list-disc list-inside">
            {useCase.compliance_actions_required.map((action, i) => (
              <li key={i} className={`text-xs ${colors.text}`}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Data Models

### Core TypeScript Interfaces (or JSDoc types)

```javascript
/**
 * @typedef {Object} StrategicIntent
 * @property {OrganizationProfile} organization_profile
 * @property {string} strategic_intent_statement
 * @property {string} ai_ambition_level - 'Augmentation'|'Automation'|'AI-Augmented'|'AI-First'
 * @property {string[]} strategic_priorities
 * @property {string[]} ai_opportunity_areas
 * @property {string[]} key_constraints
 */

/**
 * @typedef {Object} CapabilityScore
 * @property {string} apqc_id
 * @property {string} process_name
 * @property {number} current_maturity - 0-5
 * @property {number} target_maturity - 0-5
 * @property {number} gap
 * @property {string} priority - 'High'|'Medium'|'Low'
 * @property {string[]} ai_use_cases
 * @property {boolean} quick_win
 */

/**
 * @typedef {Object} RegulatoryRisk
 * @property {string} use_case
 * @property {string} eu_ai_act_risk_level - 'unacceptable'|'high'|'limited'|'minimal'
 * @property {string} risk_rationale
 * @property {string[]} applicable_articles
 * @property {string[]} compliance_actions_required
 * @property {string|null} compliance_deadline
 */

/**
 * @typedef {Object} RoadmapInitiative
 * @property {string} id
 * @property {string} initiative
 * @property {string} description
 * @property {string[]} apqc_processes
 * @property {string} business_value
 * @property {string} estimated_effort
 * @property {string} estimated_cost
 * @property {string[]} dependencies
 * @property {string[]} compliance_flags
 * @property {number} priority_score - 1-10
 */
```

---

## 11. API Endpoints

### `/server/routes/ai.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude.service');

// Step 1: Generate Strategic Intent
router.post('/strategic-intent', async (req, res) => {
  try {
    const { answers } = req.body;
    const result = await claudeService.generateStrategicIntent(answers);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 2: Generate Capability Assessment
router.post('/capability-assessment', async (req, res) => {
  try {
    const { strategicIntent, apqcProcesses } = req.body;
    const result = await claudeService.generateCapabilityAssessment(strategicIntent, apqcProcesses);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 4: Classify Regulatory Risk
router.post('/regulatory-classification', async (req, res) => {
  try {
    const { aiUseCases, regulations, organizationProfile } = req.body;
    const result = await claudeService.classifyRegulatoryRisk(aiUseCases, regulations, organizationProfile);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 7: Generate Roadmap
router.post('/roadmap', async (req, res) => {
  try {
    const { allStepsData } = req.body;
    const result = await claudeService.generateTransformationRoadmap(allStepsData);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Assistant — analyze model
router.post('/assistant', async (req, res) => {
  try {
    const { currentModel, userQuery, stepContext } = req.body;
    const result = await claudeService.assistantAnalyze(currentModel, userQuery, stepContext);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
```

### `/server/routes/apqc.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const apqcService = require('../services/apqc.service');
const claudeService = require('../services/claude.service');

// Detect industry from org description
router.post('/detect-industry', async (req, res) => {
  try {
    const { orgDescription } = req.body;
    const result = await apqcService.detectIndustry(orgDescription, claudeService);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get APQC processes for industry
router.get('/processes/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { level = 3 } = req.query;
    const result = apqcService.getProcessesByIndustry(industry, parseInt(level));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Score processes against strategic intent
router.post('/score-relevance', async (req, res) => {
  try {
    const { processes, strategicIntent } = req.body;
    const result = await apqcService.scoreCapabilityRelevance(processes, strategicIntent, claudeService);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
```

### `/server/routes/regulatory.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const regData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/regulatory_knowledge_base.json'), 'utf8')
);

// Get regulations by region
router.get('/by-region/:regionId', (req, res) => {
  const region = regData.regions.find(r => r.id === req.params.regionId);
  if (!region) return res.status(404).json({ success: false, error: 'Region not found' });
  res.json({ success: true, data: region });
});

// Get applicable regulations for org profile
router.post('/applicable', (req, res) => {
  const { regions, industry } = req.body;
  
  const applicable = [];
  
  for (const regionId of regions) {
    const region = regData.regions.find(r => r.id === regionId);
    if (region) {
      for (const reg of region.regulations) {
        if (reg.applies_to_industries.includes('all') || reg.applies_to_industries.includes(industry)) {
          applicable.push({ region: region.name, ...reg });
        }
      }
    }
  }
  
  // Add industry-specific regulations
  const industrySpecific = regData.industry_specific_regulations.find(r => r.industry === industry);
  if (industrySpecific) {
    applicable.push(...industrySpecific.regulations.map(r => ({ region: 'Industry-specific', ...r })));
  }
  
  res.json({ success: true, data: applicable });
});

// Get EU AI Act compliance timeline
router.get('/eu-ai-act/timeline', (req, res) => {
  const euRegion = regData.regions.find(r => r.id === 'EU');
  const aiAct = euRegion?.regulations.find(r => r.id === 'EU-AI-ACT');
  if (!aiAct) return res.status(404).json({ success: false });
  res.json({ success: true, data: aiAct.compliance_timeline });
});

module.exports = router;
```

---

## 12. MVP Build Sequence

Build in this exact order to ensure each phase is testable before proceeding:

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure (client + server)
- [ ] Configure environment variables
- [ ] Implement Claude service (`claude.service.js`)
- [ ] Load and serve APQC JSON data
- [ ] Load and serve Regulatory Knowledge Base JSON
- [ ] Set up React app with Tailwind and routing
- [ ] Implement `AssessmentContext`

### Phase 2: Core Workflow Steps 1–2 (Week 2)
- [ ] Build `Step1_StrategicIntent.jsx` — 7-question Autopilot flow
- [ ] Build APQC industry detection
- [ ] Build `Step2_CapabilityAssessment.jsx` — heatmap with APQC L1-L3
- [ ] Build `StepProgress.jsx` navigation
- [ ] Test Autopilot: Org description → Strategic Intent → Capability Map

### Phase 3: Governance & Risk Step 4 (Week 3)
- [ ] Build Regulatory Knowledge Base API endpoints
- [ ] Build `Step4_GovernanceRisk.jsx`
- [ ] Build `RegulatoryAlert.jsx` component
- [ ] Implement EU AI Act risk classification
- [ ] Test: Capability Map → Regulatory Risk Matrix

### Phase 4: Remaining Steps 3, 5, 6 (Week 4)
- [ ] Build `Step3_DataTechReadiness.jsx`
- [ ] Build `Step5_OperatingModel.jsx`
- [ ] Build `Step6_ChangeAdoption.jsx`

### Phase 5: Roadmap & AI Assistant (Week 5)
- [ ] Build `Step7_Roadmap.jsx` with timeline visualization
- [ ] Build `AIAssistant.jsx` — chat panel for model analysis and updates
- [ ] Implement model regeneration on user updates
- [ ] End-to-end Autopilot test: Full 7-step flow

### Phase 6: Polish & Export (Week 6)
- [ ] Build `ExportPanel.jsx` — PDF and Excel export
- [ ] Add Standard Mode user overrides throughout
- [ ] Add loading states and error handling
- [ ] Build Workshop Facilitator toolkit tab
- [ ] Final MVP testing with 3 sample organizations

---

## 13. Environment Setup

### `.env.example`

```env
# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server
PORT=3001
NODE_ENV=development

# Client
VITE_API_BASE_URL=http://localhost:3001/api
```

### Root `package.json`

```json
{
  "name": "ai-business-readiness",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "node server/index.js",
    "client": "cd client && npm run dev",
    "install:all": "npm install && cd client && npm install"
  },
  "dependencies": {
    "concurrently": "^8.0.0"
  }
}
```

### Server entry: `/server/index.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/apqc', require('./routes/apqc.routes'));
app.use('/api/regulatory', require('./routes/regulatory.routes'));
app.use('/api/assessment', require('./routes/assessment.routes'));

app.listen(process.env.PORT || 3001, () => {
  console.log(`AI Business Readiness server running on port ${process.env.PORT || 3001}`);
});
```

---

## Copilot Implementation Notes

When working with GitHub Copilot in VS Code on this project:

1. **Start with data files first** — create `apqc_framework.json` and `regulatory_knowledge_base.json` before any code, as all services depend on them.

2. **APQC expansion** — the JSON template above shows the structure for a subset of APQC. Copilot can help expand all 13 L1 categories. Prompt Copilot: *"Expand this APQC JSON structure to include all 13 L1 categories following the same schema"*

3. **Claude API key** — never hardcode the key. Always use `process.env.ANTHROPIC_API_KEY` via dotenv.

4. **JSON parsing safety** — always wrap Claude API responses in try/catch with JSON.parse. Claude occasionally returns markdown-wrapped JSON; strip backticks before parsing.

5. **Autopilot flow** — implement as a state machine in `AssessmentContext`. Each step dispatches `SET_STEP_DATA` when complete, automatically triggering the next step in Autopilot mode.

6. **Regulatory Knowledge Base** — treat as a living document. Structure allows easy addition of new regulations by appending to the `regulations` array within each region object.

7. **APQC industry detection confidence** — if confidence < 0.7, always prompt the user to confirm the detected industry before loading processes.

---

*End of Implementation Guide — AI Business Readiness EA Toolkit MVP v1.0*
