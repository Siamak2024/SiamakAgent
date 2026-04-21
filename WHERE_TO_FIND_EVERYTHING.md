# 🎯 QUICK REFERENCE - Where to Find Everything

**Last Updated:** April 21, 2026  
**Version:** 4.0  
**Purpose:** Navigation guide for EA Platform components, tools, and documentation

---

## 🗂️ Complete Codebase Documentation

**📘 For comprehensive architecture, components, and code patterns:**  
👉 **See [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)**

This reference covers:
- Complete file structure and component organization
- All JavaScript modules and their responsibilities
- Data contracts and schemas
- API integration patterns (GPT-5 Responses API)
- Storage architecture (IndexedDB + localStorage)
- Common patterns and anti-patterns
- Testing and validation procedures

---

## 📍 Account Management Location

```
EA Growth Dashboard (Homepage)
    ↓
Click Database Icon (📊) in top-right toolbar
    ↓
Data Manager Modal Opens
    ↓
Scroll to "🏢 Manage Accounts" Section
```

### Visual Location

```
┌─────────────────────────────────────────────────┐
│  🚀 Growth Sprint Dashboard            📊 ❓ 🎓 │ ← Click database icon
└─────────────────────────────────────────────────┘

Opens modal:

┌──────────────────────────────────────────────────┐
│  📦 Data Management                          × │
├──────────────────────────────────────────────────┤
│  Storage Usage  [████░░░░░░] 45%                │
├──────────────────────────────────────────────────┤
│  Import/Export All Data                          │
│  [Export All Data] [Import Data]                │
├──────────────────────────────────────────────────┤
│  📋 Import Templates                             │
│  Download templates → Fill → Import              │
│  [Account CSV] [Account JSON]                   │
│  [Opportunity CSV] [Opportunity JSON]           │
│  [Import from Template (CSV/JSON)]              │
├──────────────────────────────────────────────────┤
│  🎯 Demo Scenarios                               │
│  [Banking] [FinTech] [Insurance]                │
│  [Load All 3 Demos]                             │
├──────────────────────────────────────────────────┤
│  🏢 Manage Accounts                 10 accounts  │ ← HERE!
│  ┌────────────────────────────────────────────┐ │
│  │ Nordic Universal Bank                      │ │
│  │ ACC-001 • Banking • ACV: €3.25M           │ │
│  │           [View] [Edit] [Delete]          │ │
│  ├────────────────────────────────────────────┤ │
│  │ PayNordic                                  │ │
│  │ FINTECH-2026-001 • Fintech • ACV: €1.45M │ │
│  │           [View] [Edit] [Delete]          │ │
│  ├────────────────────────────────────────────┤ │
│  │ SecureLife Insurance Group                │ │
│  │ INS-2026-001 • Insurance • ACV: €1.85M   │ │
│  │           [View] [Edit] [Delete]          │ │
│  └────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  Backups                          [Create Backup]│
│  (Backup list here...)                           │
└──────────────────────────────────────────────────┘
```

---

## 🏢 Account Management Actions

### 1. VIEW Account (Blue Button)
- **What:** Opens full account dashboard
- **Use:** See all details, opportunities, team, analytics
- **Result:** Navigates to account page

### 2. EDIT Account (Orange Button)
- **What:** Update account information
- **Fields:**
  - Account Name
  - ACV (Annual Contract Value)
  - Health Status (excellent/good/at-risk/critical)
- **Result:** Account updated, list refreshes

### 3. DELETE Account (Red Button)
- **What:** Permanently remove account
- **Also deletes:**
  - All opportunities
  - All engagements
  - Team data
  - Customer Success Plan
  - Activities
- **⚠️ WARNING:** Cannot be undone!
- **Result:** Account removed, list refreshes

---

---

## 🏗️ Core JavaScript Components

### Data & Storage Layer
- **EA_Config.js** - Unified configuration (API keys, storage keys, toolkit settings)
- **EA_DataManager.js** - Project management and data persistence
- **EA_StorageManager.js** - IndexedDB wrapper with localStorage fallback
- **EA_FileManager.js** - Import/export functionality
- **EA_SyncEngine.js** - Cross-toolkit data synchronization

### Business Logic Layer
- **EA_AccountManager.js** - Account, Opportunity, ValueCase CRUD
- **EA_EngagementManager.js** - Engagement lifecycle (14 entity types)
- **EA_WorkflowEngine.js** - E0-E5 workflow orchestration
- **EA_DecisionEngine.js** - Application portfolio rationalization
- **EA_ScoringEngine.js** - 4-criteria scoring engine

### AI Integration Layer
- **AzureOpenAIProxy.js** - GPT-5 Responses API wrapper
- **Advicy_AI.js** - System prompt builder
- **EA_AIAssistant.js** - Context-aware AI assistant
- **EA_AIOrchestrator.js** - AI content generation orchestrator
- **EA_UnifiedAIAssistant.js** - Unified AI across all pages

### Integration & Analytics
- **EA_IntegrationBridge.js** - APQC, APM, BMC, Capability integration
- **EA_Analytics.js** - Metrics and reporting dashboards
- **EA_GlobalSearch.js** - Unified search across all entities

### UI & Output
- **EA_NordicUI.js** - Nordic UI component library (dark mode for AI)
- **EA_OutputGenerator.js** - Multi-format output generation
- **EA_MarkdownGenerator.js** - Markdown document generation
- **EA_TemplateManager.js** - Import/export templates
- **EA_CrossNavigation.js** - Cross-page navigation

**📌 Location:** `/js/` and `/azure-deployment/static/js/` (mirrored)

---

## 🗄️ Data Files & Templates

### APQC Framework
- **Location:** `/data/`
- **Files:**
  - `apqc_pcf_master.json` - Process Classification Framework v8.0
  - `apqc_metadata_mapping.json` - Industry and strategic intent mappings
  - `apqc_capability_enrichment.json` - AI transformation metadata

### Industry Templates
- **Location:** `/data/`
- **Coverage:** Banking, Insurance, Fintech, Real Estate, Healthcare, Retail

### Demo Scenarios
- **Generator:** `EA_DemoScenarios.js`
- **Available:**
  - Banking: Nordic Universal Bank
  - FinTech: PayNordic
  - Insurance: SecureLife Insurance Group

---

## 📋 Import Templates - Complete Flow

### CSV Import Flow

```
1. DOWNLOAD TEMPLATE
   Click "Account CSV" or "Opportunity CSV"
   ↓
   Template file downloads to your computer

2. FILL TEMPLATE
   Open in Excel/Google Sheets
   ↓
   Delete sample rows
   ↓
   Add your data (one row per account/opportunity)
   ↓
   Save file

3. IMPORT
   Click "Import from Template (CSV/JSON)"
   ↓
   Select your filled file
   ↓
   ✅ Data imported!
   ↓
   Dashboard updates automatically
```

### JSON Import Flow

```
1. DOWNLOAD TEMPLATE
   Click "Account JSON" or "Opportunity JSON"
   ↓
   Template file downloads

2. FILL TEMPLATE
   Open in text editor (VS Code, Notepad++)
   ↓
   Replace sample data with your data
   ↓
   Keep JSON structure intact
   ↓
   Save file

3. IMPORT
   Click "Import from Template (CSV/JSON)"
   ↓
   Select your JSON file
   ↓
   ✅ Data imported!
```

---

## 📂 File Structure Reference

```
CanvasApp/
├── js/
│   ├── EA_AccountManager.js        ← CRUD operations (create, update, delete)
│   ├── EA_TemplateManager.js       ← NEW: Template download & import
│   ├── EA_DemoScenarios.js         ← NEW: Banking, FinTech, Insurance demos
│   └── EA_ProjectManager.js        ← NEW: Project export/import
│
├── NexGenEA/
│   └── EA2_Toolkit/
│       └── EA_Growth_Dashboard.html ← Entry point, Data Manager modal
│
├── ACCOUNT_MANAGEMENT_GUIDE.md     ← NEW: Complete how-to guide
├── TOOLKIT_ENHANCEMENTS_COMPLETE.md← Technical documentation
└── TOOLKIT_QUICK_START.md          ← 5-minute quick start
```

---

## 🎯 Templates Available

### Account Templates

**CSV Template:** `EA_Account_Import_Template.csv`
- **Download:** Data Manager → Import Templates → Account CSV
- **Columns:** 12 columns (3 required, 9 optional)
- **Required:** Account Name, Account Manager, Industry
- **Format:** Comma-separated values
- **Use for:** Bulk import from Excel, Google Sheets

**JSON Template:** `EA_Account_Import_Template.json`
- **Download:** Data Manager → Import Templates → Account JSON
- **Structure:** accounts array with objects
- **Required fields:** name, accountManager, industry
- **Format:** Valid JSON
- **Use for:** Programmatic import, API integration

### Opportunity Templates

**CSV Template:** `EA_Opportunity_Import_Template.csv`
- **Download:** Data Manager → Import Templates → Opportunity CSV
- **Columns:** 12 columns (3 required, 9 optional)
- **Required:** Account ID, Opportunity Name, Estimated Value
- **Format:** Comma-separated values
- **Note:** Account must exist before importing opportunities

**JSON Template:** `EA_Opportunity_Import_Template.json`
- **Download:** Data Manager → Import Templates → Opportunity JSON
- **Structure:** opportunities array with objects
- **Required fields:** accountId, name, estimatedValue
- **Format:** Valid JSON
- **Note:** Validates account exists during import

---

## 🎬 Demo Scenarios - What Gets Created

### Banking Demo
```
Account:
  Name: Nordic Universal Bank
  ID: BANK-2026-001
  ACV: €3,250,000
  Industry: Banking
  
Opportunity:
  Name: Core Banking Platform Modernization
  Value: €5,800,000
  Probability: 85%
  Stage: Negotiate
```

### FinTech Demo
```
Account:
  Name: PayNordic
  ID: FINTECH-2026-001
  ACV: €1,450,000
  Industry: Fintech
  
Opportunity:
  Name: Platform Re-Architecture
  Value: €1,850,000
  Probability: 65%
  Stage: Qualify
```

### Insurance Demo
```
Account:
  Name: SecureLife Insurance Group
  ID: INS-2026-001
  ACV: €1,850,000
  Industry: Insurance
  
Opportunity:
  Name: Digital Transformation
  Value: €2,500,000
  Probability: 70%
  Stage: Propose
```

### Load All Demos
```
Creates all 3 accounts above
Total ACV: €6,550,000
Total Pipeline: €10,150,000
Perfect for: Sales demonstrations, training, POCs
```

---

## ⚡ Common Tasks - Quick Commands

**Task:** Delete an account
**Steps:** Data Manager → Manage Accounts → Find account → Click Delete → Confirm

**Task:** Update account ACV
**Steps:** Data Manager → Manage Accounts → Find account → Click Edit → Enter new ACV

**Task:** Import 20 accounts from Excel
**Steps:** Download CSV template → Fill in Excel → Save → Import from Template → Select file

**Task:** Load demo data for presentation
**Steps:** Data Manager → Demo Scenarios → Click "Load All 3 Demos"

**Task:** Backup before major changes
**Steps:** Data Manager → Backups → Create Backup → Enter name

**Task:** See all account details
**Steps:** Data Manager → Manage Accounts → Click View (blue button)

---

## 📊 Data Manager Sections Summary

| Section | Purpose | Key Actions |
|---------|---------|-------------|
| **Storage Stats** | Monitor space usage | View only |
| **Import/Export All** | Full system backup | Export, Import |
| **Import Templates** | Bulk data entry | Download templates, Import files |
| **Demo Scenarios** | Sample data | Load Banking/FinTech/Insurance |
| **Manage Accounts** | Update/Delete accounts | View, Edit, Delete |
| **Backups** | Version control | Create, Restore, Delete |

---

## 🔑 Key Locations Cheat Sheet

```
┌─────────────────────────────────────────────────────────┐
│ WHAT                    WHERE                           │
├─────────────────────────────────────────────────────────┤
│ Account Management    → Data Manager → Manage Accounts  │
│ Download Templates    → Data Manager → Import Templates │
│ Import from Templates → Data Manager → Import Templates │
│ Load Demo Data        → Data Manager → Demo Scenarios   │
│ Export Everything     → Data Manager → Import/Export    │
│ Create Backup         → Data Manager → Backups          │
│ Edit Account          → Manage Accounts → Edit button   │
│ Delete Account        → Manage Accounts → Delete button │
│ View Account Details  → Manage Accounts → View button   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Everything is Ready!

**Core Documentation:**
✅ [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md) - **NEW!** Complete architecture reference
✅ [EA_TemplateManager.js](js/EA_TemplateManager.js) - Template system
✅ [EA_Growth_Dashboard.html](NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html) - Updated with all features
✅ [ACCOUNT_MANAGEMENT_GUIDE.md](ACCOUNT_MANAGEMENT_GUIDE.md) - Complete how-to guide
✅ This quick reference file

**Features Available:**
✅ Account CRUD (Create, Read, Update, Delete)
✅ CSV templates for accounts & opportunities  
✅ JSON templates for accounts & opportunities
✅ Bulk import from templates
✅ 3 industry demo scenarios (Banking, FinTech, Insurance)
✅ Account management UI with View/Edit/Delete
✅ Full data export/import
✅ Backup & restore system
✅ GPT-5 Responses API integration
✅ Context-aware AI assistant
✅ 7-step workflow engine (E0-E5)
✅ APQC framework integration
✅ 4-criteria scoring engine
✅ Multi-format output generation

**Next Step:** Open [EA_Growth_Dashboard.html](NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html) and click the database icon! 🎉

---

## 🏛️ Architecture Documentation

### Core Architecture Files
- **[CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)** - **NEW!** Complete codebase reference
- **[architecture/EAV4_Architecture.md](architecture/EAV4_Architecture.md)** - EA Platform V4 architecture
- **[architecture/APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md](architecture/APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md)** - APM Toolkit
- **[architecture/ea_BusinessObject_workflow.md](architecture/ea_BusinessObject_workflow.md)** - Workflow patterns
- **[architecture/NextGenEA_APM_Decision_Engine.md](architecture/NextGenEA_APM_Decision_Engine.md)** - Decision engine
- **[architecture/Parallel_Analytics_Workflows_Implementation_Plan.md](architecture/Parallel_Analytics_Workflows_Implementation_Plan.md)** - Analytics

### Implementation Guides
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[IMPLEMENTATION_APQC_3LAYER_ARCHITECTURE.md](IMPLEMENTATION_APQC_3LAYER_ARCHITECTURE.md)** - APQC integration
- **[MULTI_USER_IMPLEMENTATION_GUIDE.md](MULTI_USER_IMPLEMENTATION_GUIDE.md)** - Multi-user setup
- **[APM_EA_INTEGRATION_GUIDE.md](APM_EA_INTEGRATION_GUIDE.md)** - APM integration

### Verification & Testing
- **[ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md)** - Testing checklist
- **[E2E_WORKFLOW_TEST_GUIDE.md](E2E_WORKFLOW_TEST_GUIDE.md)** - End-to-end tests

---

## 💡 AI Integration Standards (April 2026)

### GPT-5 Responses API (CURRENT)
**❌ DO NOT USE:** Old Chat Completions API format
**✅ USE THIS:**
```javascript
const response = await AzureOpenAIProxy.create(
  "user message as string",  // First param: user input
  {
    instructions: systemPrompt,  // Use 'instructions', not 'systemInstructions'
    model: 'gpt-5'  // Optional, defaults to GPT-5
    // DO NOT SET temperature - GPT-5 only supports default
  }
);
const output = response.output_text;  // Extract text from response
```

### Dark Mode UI for AI Chat
**MANDATORY for all AI assistant panels:**
- Background: `#1a1a1a`
- Text: `#e5e5e5`
- AI messages: `#2d2d2d` background, blue left border
- User messages: `#374151` background, green left border

### Context-Aware Prompting
Use `EA_AIAssistant.detectContext()` to build context-aware prompts.

---

## 📊 Storage Architecture

### Primary Storage: IndexedDB
**Object Stores:** applications, decisions, scores, engagements, stakeholders, capabilities, initiatives, roadmapItems, risks, artifacts

### Fallback: localStorage
**Key Patterns:** `ea_config`, `ea_projects`, `ea_account_{id}`, `ea_opportunity_{id}`, `ea_engagement_model_{id}`, `apm_applications_{projectId}`

### Auto-Save
- Interval: 180 seconds (3 minutes)
- Triggers only when user idle for 10+ seconds

---

## 🔗 Integration Points

### APQC Framework
- **Access:** `EA_DataManager.loadAPQCFramework()`
- **Filter by Industry:** `getAPQCCapabilitiesByBusinessType('Banking')`
- **Filter by Intent:** `getAPQCCapabilitiesByIntent('Digital Transformation')`

### APM Toolkit
- **Storage:** `apm_applications_{projectId}`
- **Import:** `EA_IntegrationBridge.importFromAPM(projectId)`

### BMC Toolkit
- **Import:** `EA_IntegrationBridge.importFromBMC(projectId)`

### Capability Management
- **Sync:** `EA_IntegrationBridge.syncCapabilities(engagementId, source)`

---

## 🚨 Critical Updates (April 2026)

### What's Changed
1. **GPT-5 Responses API** - New API format (incompatible with old Chat Completions)
2. **Modular Architecture** - 30+ dedicated component files in /js/
3. **IndexedDB Primary** - localStorage is now fallback only
4. **Dark Mode AI** - Mandatory dark mode for all AI chat panels
5. **Data Contracts** - Strict schema enforcement (string vs array matters!)
6. **APQC Integration** - Deep integration with Process Classification Framework v8.0

### Deprecated/Removed
- ❌ Old Chat Completions API format
- ❌ Direct localStorage writes (use StorageManager)
- ❌ Custom temperature settings with GPT-5
- ❌ Light mode for AI panels
- ❌ Generic consulting language in outputs

### New Features
- ✅ Context-aware AI assistant
- ✅ 7-step workflow engine (E0-E5)
- ✅ 4-criteria scoring engine
- ✅ Decision automation (Invest/Tolerate/Migrate/Eliminate)
- ✅ Multi-format output generation
- ✅ Unified search across all entities
- ✅ Account-centric commercial execution

---

## 📞 Need Help?

### For Developers
1. **Start here:** [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)
2. **Architecture:** [architecture/EAV4_Architecture.md](architecture/EAV4_Architecture.md)
3. **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
4. **Component docs:** Inline comments in each `/js/` file

### For Users
1. **Quick Start:** [QUICKSTART_FIRST_USER.md](QUICKSTART_FIRST_USER.md)
2. **User Guides:** Search for `*_USER_GUIDE.md` files
3. **Demo Scenarios:** Use Data Manager modal → Demo Scenarios

### For Architects
1. **Workflow:** [architecture/ea_BusinessObject_workflow.md](architecture/ea_BusinessObject_workflow.md)
2. **Decision Engine:** [architecture/NextGenEA_APM_Decision_Engine.md](architecture/NextGenEA_APM_Decision_Engine.md)
3. **APM Toolkit:** [architecture/APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md](architecture/APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md)

---

**Last Updated:** April 21, 2026  
**Maintained By:** EA Platform Development Team  
**For Complete Code Reference:** See [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)

