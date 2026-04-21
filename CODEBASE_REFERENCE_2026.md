# EA Platform Codebase Reference 2026

**Version:** 4.0  
**Last Updated:** April 21, 2026  
**Purpose:** Complete reference for EA Platform architecture, components, and implementation patterns

---

## 🎯 Architecture Overview

### Technology Stack
- **Frontend:** Vanilla JavaScript, HTML5, TailwindCSS
- **AI Integration:** OpenAI GPT-5 via Responses API
- **Storage:** localStorage + IndexedDB (dual-mode with fallback)
- **Design System:** Nordic UI theme (dark mode for AI panels)
- **Architecture Pattern:** Modular SPA with component-based organization

### Core Principles

1. **GPT-5 Responses API** (NOT Chat Completions API)
   - First parameter: User message as string
   - Second parameter: Options object with `instructions` (not `systemInstructions`)
   - Model: GPT-5 (default, supports reasoning summaries)
   - Temperature: Do NOT set custom values (GPT-5 only supports default)
   - Response extraction: Use `response.output_text`

2. **Dark Mode UI for AI Chat Panels**
   - All AI assistant interfaces MUST use dark mode exclusively
   - Consistent across all toolkit pages

3. **Data Persistence Strategy**
   - Primary: IndexedDB (with fallback to localStorage)
   - Storage keys: `ea_*` prefix pattern
   - Auto-save every 180 seconds (3 minutes) with debouncing

4. **Modular Component Architecture**
   - Each major feature has dedicated JS module
   - Clear separation of concerns
   - Consistent naming: `EA_ComponentName.js`

---

## 📂 File Structure

### Core Application Files

```
CanvasApp/
├── index.html                          # Main entry point
├── server.js                           # Node.js server
├── database.js                         # Database utilities
├── AzureOpenAIProxy.js                 # AI proxy wrapper (GPT-5 Responses API)
│
├── js/                                 # Core JavaScript modules
│   ├── Advicy_AI.js                   # System prompt builder for AI
│   ├── EA_Config.js                   # Unified configuration (v3.0.0)
│   ├── EA_DataManager.js              # Data persistence & project management
│   ├── EA_FileManager.js              # Import/export functionality
│   ├── EA_StorageManager.js           # IndexedDB wrapper with localStorage fallback
│   ├── EA_SyncEngine.js               # Cross-toolkit data synchronization
│   │
│   ├── EA_AccountManager.js           # Account CRUD & commercial execution
│   ├── EA_AccountTeam.js              # Team management
│   ├── EA_EngagementManager.js        # Engagement lifecycle management
│   ├── EA_WorkflowEngine.js           # E0-E5 workflow orchestration
│   ├── EA_IntegrationBridge.js        # Toolkit integration interface
│   │
│   ├── EA_AIAssistant.js              # Context-aware AI assistant
│   ├── EA_AIOrchestrator.js           # AI content generation orchestrator
│   ├── EA_AI_Assistant.js             # AI questionnaire & analysis
│   ├── EA_UnifiedAIAssistant.js       # Unified AI across all pages
│   │
│   ├── EA_DecisionEngine.js           # Application portfolio decisions
│   ├── EA_ScoringEngine.js            # 4-criteria scoring (Business/Tech/Cost/Risk)
│   ├── EA_Analytics.js                # Metrics & reporting dashboards
│   ├── EA_GlobalSearch.js             # Unified search across entities
│   │
│   ├── EA_OutputGenerator.js          # Multi-format output generation
│   ├── EA_MarkdownGenerator.js        # Markdown document generation
│   ├── EA_TemplateManager.js          # Import/export templates
│   ├── EA_ProjectManager.js           # Project export/import
│   │
│   ├── EA_NordicUI.js                 # Nordic UI component library
│   ├── EA_ToolkitKPI.js               # KPI status monitoring
│   ├── EA_KPI_Validator.js            # Financial KPI validation
│   ├── EA_CrossNavigation.js          # Cross-page navigation
│   ├── EA_CustomerSuccess.js          # Customer success plan management
│   └── EA_DemoScenarios.js            # Demo data generators
│
├── azure-deployment/static/            # Deployment assets
│   ├── NexGenEA/
│   │   └── NexGen_EA_V4.html          # Main EA Platform SPA (~16,000 lines)
│   ├── js/                            # Deployment-specific JS (mirrors root js/)
│   └── ...
│
├── architecture/                       # Architecture documentation
│   ├── EAV4_Architecture.md           # Complete architecture doc
│   ├── APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md
│   ├── EA_BusinessObject_workflow.md
│   ├── NextGenEA_APM_Decision_Engine.md
│   ├── Parallel_Analytics_Workflows_Implementation_Plan.md
│   └── ...
│
├── data/                               # Data files (APQC, industry templates)
├── css/                                # Stylesheets
├── scripts/                            # Utility scripts
├── tests/                              # Test files
└── [Various .md guide files]           # User and implementation guides
```

---

## 🔧 Core Components Deep Dive

### 1. EA_Config.js - Unified Configuration

**Purpose:** Centralized configuration for API keys, storage keys, toolkit settings

**Key Exports:**
```javascript
EA_Config = {
  version: '3.0.0',
  storage: {
    apiKey: 'ea_config',
    projects: 'ea_projects',
    currentProject: 'ea_current_project'
  },
  openai: {
    model: 'gpt-4.1',  // Note: Documentation says GPT-5, verify in code
    temperature: 0.7,
    maxTokens: 2000
  },
  toolkits: {
    platform: { id: 'platform', file: 'NexGenEA/NexGen_EA_V4.html' },
    bmc: { id: 'bmc', file: 'AI Business Model Canvas.html' },
    capabilityMap: { id: 'capabilityMap', file: 'AI Capability Mapping V2.html' },
    // ... more toolkits
  },
  autoSaveInterval: 180000  // 3 minutes
}
```

### 2. AzureOpenAIProxy.js - AI Integration Layer

**Purpose:** HTTP proxy wrapper for OpenAI Responses API

**Critical Pattern:**
```javascript
// ✅ CORRECT: Responses API format with GPT-5
const response = await AzureOpenAIProxy.create(userMessage, {
    instructions: systemPrompt,
    model: 'gpt-5'  // Default, can be omitted
});
const output = response.output_text;

// ❌ WRONG: Old Chat Completions API format (DO NOT USE)
await AzureOpenAIProxy.create({
    taskType: 'analysis',
    userMessage: message,
    systemInstructions: '...'
});

// ❌ WRONG: Custom temperature with GPT-5 (NOT SUPPORTED)
await AzureOpenAIProxy.create(message, {
    instructions: '...',
    temperature: 0.7  // Will fail!
});
```

**Endpoints:**
- Production: `POST /api/openai-proxy` (Azure)
- Localhost: `POST /api/openai/chat`
- Fallback: Direct OpenAI API with stored key

### 3. EA_DataManager.js - Data Persistence

**Purpose:** Unified localStorage structure, project management

**Key Methods:**
```javascript
class EA_DataManager {
  getApiKey()                    // Get unified API key
  getProject(projectId)          // Get project by ID
  createProject(projectData)     // Create new project
  updateToolkitData(projectId, toolkitId, data)  // Update toolkit data
  loadAPQCFramework()            // Load APQC framework
  getAPQCCapabilitiesByBusinessType(industry)
  getAPQCCapabilitiesByIntent(intent)
}
```

**Storage Structure:**
```javascript
{
  ea_config: {
    version: '3.0.0',
    apiKey: 'sk-...',
    settings: { mode: 'ai-assisted', autoSave: true }
  },
  ea_projects: {
    'project_123': {
      id: 'project_123',
      name: 'Nordic Bank Transformation',
      data: {
        platform: { ... },
        bmc: { ... },
        capabilityMap: { ... }
      }
    }
  }
}
```

### 4. EA_StorageManager.js - IndexedDB Wrapper

**Purpose:** IndexedDB with localStorage fallback for robustness

**Object Stores:**
- `applications` - Application portfolio data
- `decisions` - Decision recommendations
- `scores` - Application scoring results
- `engagements` - Engagement models
- `stakeholders` - Stakeholder information
- `capabilities` - Capability definitions
- `initiatives` - Transformation initiatives
- `roadmapItems` - Roadmap planning
- `risks` - Risk tracking
- `artifacts` - Generated documents

**Key Methods:**
```javascript
class EA_StorageManager {
  async init()                       // Initialize (IndexedDB or fallback)
  async save(storeName, object)      // Save object
  async get(storeName, id)           // Get by ID
  async getAll(storeName)            // Get all objects
  async delete(storeName, id)        // Delete object
  async query(storeName, index, value)  // Query by index
}
```

### 5. EA_AccountManager.js - Commercial Execution

**Purpose:** Account-centric platform for sales/account teams

**Entities Managed:**
- **Accounts:** Commercial account tracking (ACV, health, industry)
- **Opportunities:** Sales pipeline management
- **ValueCases:** Business case & ROI justification

**Key Methods:**
```javascript
class EA_AccountManager {
  // Account Management
  createAccount(accountData)
  getAccount(accountId)
  updateAccount(accountId, updates)
  listAccounts()
  
  // Opportunity Management
  createOpportunity(opportunityData)
  getOpportunity(oppId)
  updateOpportunity(oppId, updates)
  listOpportunities(accountId)
  
  // ValueCase Management
  createValueCase(valueCaseData)
  getValueCase(vcId)
  
  // Analytics
  getAccountMetrics(accountId)
  getPipelineValue(accountId)
}
```

**Storage Keys:**
- `ea_account_{id}` - Account objects
- `ea_opportunity_{id}` - Opportunity objects
- `ea_valuecase_{id}` - ValueCase objects

### 6. EA_EngagementManager.js - Engagement Lifecycle

**Purpose:** CRUD operations for 14 entity types in engagement model

**Core Entities:**
1. Engagement metadata
2. Customers
3. Phases (E0-E5)
4. Stories (user stories)
5. Stakeholders
6. Applications
7. Capabilities
8. Risks
9. Constraints
10. Decisions
11. Assumptions
12. Initiatives
13. Roadmap items
14. Architecture views
15. Artifacts
16. Whitespot heatmaps

**Key Methods:**
```javascript
class EA_EngagementManager {
  createEngagement(engagementData)
  getEngagement(id)
  getCurrentEngagement()
  listEngagements()
  
  // Entity CRUD (pattern repeated for all 14 types)
  addStakeholder(engagementId, stakeholderData)
  getStakeholders(engagementId)
  updateStakeholder(engagementId, stakeholderId, updates)
  deleteStakeholder(engagementId, stakeholderId)
  
  // ... similar for applications, capabilities, risks, etc.
}
```

### 7. EA_WorkflowEngine.js - E0-E5 Workflow

**Purpose:** Orchestrate 6-phase engagement workflow

**Workflow Phases:**
- **E0:** Engagement Setup & Planning
- **E1:** Current State Analysis
- **E2:** Target Architecture Definition
- **E3:** Roadmap & Migration Planning
- **E4:** Value Case & Business Justification
- **E5:** Execution & Governance

**Each Phase Has:**
- Multiple steps (e.g., E0.1, E0.2, E0.3)
- Checklist template
- AI prompt guidance
- Suggested quick actions
- Integration hooks (APQC, APM, BMC)
- Completion criteria

**Key Methods:**
```javascript
class EA_WorkflowEngine {
  getWorkflowDefinition()
  getCurrentPhase(engagementId)
  getStepsForPhase(phaseId)
  markStepComplete(engagementId, stepId)
  getCompletionPercentage(engagementId)
  validatePhaseCompletion(engagementId, phaseId)
}
```

### 8. EA_AIAssistant.js - Context-Aware AI

**Purpose:** Single unified AI assistant that auto-detects context

**Context Detection:**
- Current workflow step (E0.1, E1.2, etc.)
- Active canvas/tab (stakeholders, whitespace, roadmap)
- Connected toolkits (APQC, APM, BMC, Capability)
- Recent user actions
- Engagement data

**Key Methods:**
```javascript
class EA_AIAssistant {
  detectContext()                    // Auto-detect current context
  chat(userMessage)                  // Main conversational interface
  getSuggestedPrompts()              // Context-aware quick actions
  askQuestions(maxQuestions = 5)     // 5-question discovery pattern
  applyRecommendation(recommendation) // Save AI output to engagement
}
```

**Implementation Pattern:**
```javascript
// Context-aware system prompt building
const context = aiAssistant.detectContext();
const systemPrompt = `
You are an EA assistant helping with ${context.currentPhase} - ${context.currentStep}.

Current engagement: ${context.engagementName}
Industry: ${context.segment}
Stakeholders: ${context.stakeholderCount}
Applications: ${context.applicationCount}

Connected toolkits:
- APQC: ${context.integrations.apqc.status}
- APM: ${context.integrations.apm.status}

Focus your guidance on completing this specific step.
`;
```

### 9. EA_DecisionEngine.js - Portfolio Rationalization

**Purpose:** Automated decision recommendations for applications

**Decision Types:**
- **Invest:** High score, strategic value
- **Tolerate:** Acceptable performance, maintain
- **Migrate:** High business value, poor tech health
- **Consolidate:** Capability overlap detected
- **Eliminate:** Low score, high cost

**Decision Rules (Priority Order):**
```javascript
class EA_DecisionEngine {
  ruleEliminate(app, score, context)     // Priority 1
  ruleMigrate(app, score, context)       // Priority 2
  ruleConsolidate(app, score, context)   // Priority 3
  ruleInvest(app, score, context)        // Priority 4
  ruleTolerate(app, score, context)      // Priority 5 (fallback)
}
```

**Scoring Integration:**
Uses EA_ScoringEngine (4-criteria model):
- Business Fit (30%)
- Technical Health (30%)
- Cost Efficiency (20%)
- Risk (20%)

### 10. EA_IntegrationBridge.js - Toolkit Integration

**Purpose:** Unified interface for cross-toolkit data flow

**Supported Integrations:**
1. **APQC Framework** - Load capability templates by industry/intent
2. **APM Toolkit** - Import application portfolio data
3. **BMC Toolkit** - Import business model canvas
4. **Capability Management** - Sync capability definitions

**Key Methods:**
```javascript
class EA_IntegrationBridge {
  // APQC Integration
  async loadAPQCFramework()
  async getAPQCCapabilitiesByIndustry(industry)
  async importAPQCCapabilities(industry, intent)
  
  // APM Integration
  async importFromAPM(projectId)
  async exportToAPM(engagementId)
  
  // BMC Integration
  async importFromBMC(projectId)
  
  // Capability Sync
  async syncCapabilities(engagementId, source)
  
  // Integration Status Tracking
  updateIntegrationStatus(toolkitId, status)
  getIntegrationStatus(toolkitId)
}
```

---

## 🎨 UI Components & Design System

### EA_NordicUI.js - Component Library

**Purpose:** Reusable Nordic-themed UI components

**Available Components:**
```javascript
window.EANordicUI = {
  escapeHtml(value),
  button({ label, variant, icon, attrs }),
  statusBadge({ label, level, icon }),
  metricCard({ label, value, meta }),
  heatCell({ level, label, meta, title }),
  emptyState(text),
  legendItem(colorClass, label)
}
```

**Usage Example:**
```javascript
// Create primary button
const html = EANordicUI.button({
  label: 'Generate Architecture',
  variant: 'primary',
  icon: 'fas fa-robot',
  attrs: { onclick: 'generateArch()' }
});

// Create status badge
const badge = EANordicUI.statusBadge({
  label: 'In Progress',
  level: 'medium',
  icon: 'fas fa-spinner'
});
```

### Dark Mode Standards for AI Chat

**Mandatory for all AI assistant panels:**
```css
.ai-chat-container {
  background: #1a1a1a;
  color: #e5e5e5;
}

.ai-message {
  background: #2d2d2d;
  border-left: 3px solid #3b82f6;
}

.user-message {
  background: #374151;
  border-left: 3px solid #10b981;
}
```

---

## 📊 Data Contracts & Schemas

### Key Data Structures

**Strategic Intent (Step 1):**
```javascript
{
  strategic_ambition: "string (2-3 sentences)",
  strategic_themes: ["theme1", "theme2"],  // ARRAY
  success_metrics: ["metric1", "metric2"],  // ARRAY
  strategic_constraints: ["constraint1"],   // ARRAY
  scope: "in/out of scope description",
  stakeholders: ["stakeholder1"],           // ARRAY
  assumptions: ["assumption1"]              // ARRAY
}
```

**Business Model Canvas (Step 2):**
```javascript
{
  value_proposition: "string (2-4 sentences)",  // STRING, not array!
  customer_segments: ["segment1"],               // ARRAY
  channels: ["channel1"],                        // ARRAY
  customer_relationships: ["relationship1"],     // ARRAY
  revenue_streams: ["stream1"],                  // ARRAY
  key_resources: ["resource1"],                  // ARRAY
  key_activities: ["activity1"],                 // ARRAY
  key_partners: ["partner1"],                    // ARRAY
  cost_structure: ["cost1"]                      // ARRAY
}
```

**Capability (Step 3):**
```javascript
{
  id: "CAP-001",
  name: "Customer Onboarding",
  description: "detailed description",
  currentMaturity: 2,       // integer 1-5
  targetMaturity: 4,        // integer 1-5
  strategicImportance: 5,   // integer 1-5
  systems: ["CRM", "KYC Platform"],
  people: "10 FTE in onboarding team",
  processes: ["KYC process", "Document verification"],
  data: ["Customer master data", "Documents"],
  dependsOn: ["CAP-002"],   // Other capability IDs
  apqc_source: true,        // APQC-derived capability
  apqc_code: "2.1.1"        // APQC framework code
}
```

**AI Agent (Step 7 - Target Architecture):**
```javascript
{
  name: "Invoice Processing RPA",
  agent_type: "RPA",  // NLP, Computer Vision, RPA, Predictive, etc.
  purpose: "Automate invoice data extraction and posting",
  linked_capabilities: ["Manage Accounts Payable"],  // Links to Step 3 capabilities
  maturity_level: "Pilot",  // Pilot, Production, Optimized
  is_proposed: true         // TO-BE agent (not yet implemented)
}
```

---

## 🔍 Common Patterns & Anti-Patterns

### ✅ Correct Patterns

**1. AI Integration (GPT-5 Responses API):**
```javascript
// First parameter: user message as STRING
// Second parameter: options with 'instructions' (not 'systemInstructions')
const response = await AzureOpenAIProxy.create(
  "Generate capability map for banking industry",
  {
    instructions: systemPrompt,
    model: 'gpt-5'  // Optional, defaults to GPT-5
  }
);
const result = response.output_text;
```

**2. Context-Aware AI Prompting:**
```javascript
// Build context from current state
const engagement = engagementManager.getCurrentEngagement();
const context = aiAssistant.detectContext();

const prompt = `
You are assisting with ${context.currentPhase} - ${context.currentStep}.

Engagement: ${engagement.engagement.name}
Industry: ${engagement.engagement.segment}
Current data:
- ${context.stakeholderCount} stakeholders
- ${context.applicationCount} applications
- ${context.capabilityCount} capabilities

Help the user complete this step.
`;
```

**3. Data Persistence:**
```javascript
// Use StorageManager for robustness (IndexedDB + localStorage fallback)
const storage = new EA_StorageManager();
await storage.init();
await storage.save('engagements', engagementObject);
const eng = await storage.get('engagements', 'ENG-001');
```

**4. Modular Component Usage:**
```javascript
// Initialize managers
const dataManager = new EA_DataManager();
const accountManager = new EA_AccountManager();
const engagementManager = new EA_EngagementManager();
const integrationBridge = new EA_IntegrationBridge(
  engagementManager, dataManager, workflowEngine
);
```

### ❌ Anti-Patterns (DO NOT USE)

**1. Old Chat Completions API Format:**
```javascript
// ❌ WRONG - This is legacy format
await AzureOpenAIProxy.create({
  taskType: 'analysis',
  userMessage: message,
  systemInstructions: prompt  // Wrong property name
});
```

**2. Custom Temperature with GPT-5:**
```javascript
// ❌ WRONG - GPT-5 doesn't support custom temperature
await AzureOpenAIProxy.create(message, {
  instructions: prompt,
  temperature: 0.7  // Will fail!
});
```

**3. Array vs String Confusion in Data Contracts:**
```javascript
// ❌ WRONG - value_proposition should be STRING
{
  value_proposition: ["We provide digital banking"]  // WRONG!
}

// ✅ CORRECT
{
  value_proposition: "We provide digital banking solutions"  // STRING
}
```

**4. Direct localStorage Without Fallback:**
```javascript
// ❌ WRONG - No fallback if localStorage fails
localStorage.setItem('key', JSON.stringify(data));

// ✅ CORRECT - Use StorageManager with IndexedDB fallback
await storageManager.save('storeName', data);
```

**5. Generic Consulting Language:**
```javascript
// ❌ WRONG - Too generic
const initiative = {
  name: "Digital Transformation",
  description: "Improve efficiency"
};

// ✅ CORRECT - Specific and quantified
const initiative = {
  name: "Open Banking API Platform (PSD2 Compliance)",
  description: "Build REST API platform supporting 50+ fintech partners, reducing integration time from 6 months to 2 weeks, enabling €8M revenue stream by 2027"
};
```

---

## 🧪 Testing & Validation

### EA_KPI_Validator.js - Financial Accuracy

**Purpose:** Validate NPV, ROI, IRR, Payback calculations

**Usage:**
```javascript
const validator = new EA_KPI_Validator();
const results = validator.runAllValidations();
console.log(`Pass Rate: ${results.passRate}%`);
```

**Test Coverage:**
- NPV calculations with different discount rates
- ROI formulas
- Payback period calculations
- IRR (Internal Rate of Return)
- Edge cases (zero costs, negative values, etc.)

### Manual Verification Checklist

**1. AI Agents Display (Architecture Layers tab):**
- ✅ 3-8 agents shown with robot icon
- ✅ Type badges (NLP, RPA, Computer Vision, etc.)
- ✅ "Proposed" marking for TO-BE agents
- ✅ Capability link count displayed
- ✅ Hover shows purpose tooltip

**2. APQC Integration (Capability Map):**
- ✅ APQC-sourced capabilities have blue badge
- ✅ Tooltip shows framework code (e.g., "2.1.0")
- ✅ Load by industry works
- ✅ Load by strategic intent works

**3. Analytics Workflows:**
- ✅ Decision Intelligence runs without errors
- ✅ Financial analytics calculates ROI/NPV
- ✅ Scenarios tab generates alternatives
- ✅ Optimize tab provides recommendations

**4. Data Persistence:**
- ✅ Auto-save triggers after 3 minutes of inactivity
- ✅ Data survives page refresh
- ✅ Export/import preserves all data
- ✅ IndexedDB fallback to localStorage works

---

## 📚 Quick Reference - Common Tasks

### Initialize Platform for Development

```javascript
// 1. Load configuration
const config = window.EA_Config;

// 2. Initialize data manager
const dataManager = new EA_DataManager();

// 3. Set API key (if not already set)
const apiKey = dataManager.getApiKey();
if (!apiKey) {
  // Prompt user or load from environment
}

// 4. Initialize storage
const storage = new EA_StorageManager();
await storage.init();

// 5. Initialize managers
const accountManager = new EA_AccountManager();
const engagementManager = new EA_EngagementManager();
const workflowEngine = new EA_WorkflowEngine(engagementManager);
const integrationBridge = new EA_IntegrationBridge(
  engagementManager, dataManager, workflowEngine
);
const aiAssistant = new EA_AIAssistant(
  engagementManager, workflowEngine, integrationBridge
);

// 6. Load current project (if exists)
const currentProjectId = dataManager.getCurrentProjectId();
if (currentProjectId) {
  const project = dataManager.getProject(currentProjectId);
  console.log('Loaded project:', project.name);
}
```

### Create New Engagement

```javascript
const engagementData = {
  id: 'ENG-2026-001',
  name: 'Nordic Bank Digital Transformation',
  customerName: 'Nordic Universal Bank',
  segment: 'Banking',
  theme: 'Core Banking Modernization',
  status: 'active',
  startDate: '2026-04-21',
  endDate: '2026-12-31',
  successCriteria: [
    'Complete AS-IS architecture documentation',
    'Define TO-BE target state',
    'Create 24-month roadmap',
    'Secure board approval for transformation budget'
  ]
};

const engagementId = engagementManager.createEngagement(engagementData);
console.log('Created engagement:', engagementId);
```

### Import APQC Capabilities

```javascript
// Load APQC capabilities by industry
const result = await integrationBridge.importAPQCCapabilities('Banking', null);

if (result.success) {
  console.log(`Imported ${result.data.length} capabilities`);
} else {
  console.error('Import failed:', result.error);
}
```

### Generate AI Recommendation

```javascript
// Detect context
const context = aiAssistant.detectContext();

// Build contextual prompt
const userMessage = "Help me identify capability gaps";

// Get AI response
const response = await aiAssistant.chat(userMessage);

// Apply recommendation to engagement
if (response.recommendation) {
  await aiAssistant.applyRecommendation(response.recommendation);
}
```

### Export Project

```javascript
const projectManager = new EA_ProjectManager();
const accountId = 'ACC-001';

// Export to downloads folder
projectManager.downloadProject(accountId);

// Or get project data programmatically
const projectData = projectManager.exportProject(accountId);
console.log('Project metadata:', projectData.metadata);
console.log('Opportunities:', projectData.opportunities.length);
console.log('Engagements:', projectData.engagements.length);
```

---

## 🔗 Integration Points

### APQC Framework Integration

**Files:** `data/apqc_pcf_master.json`, `data/apqc_metadata_mapping.json`

**Access via:**
```javascript
const framework = await dataManager.loadAPQCFramework();
const bankingCaps = await dataManager.getAPQCCapabilitiesByBusinessType('Banking');
const digitalCaps = await dataManager.getAPQCCapabilitiesByIntent('Digital Transformation');
```

**Capability Structure:**
```javascript
{
  "process_group": "Manage Customer Service",
  "process": "Plan and Manage Customer Service",
  "capability_name": "Customer Service Strategy",
  "apqc_code": "4.1.1",
  "strategic_themes": ["Customer Experience", "Digital Transformation"],
  "business_types": ["Banking", "Insurance", "Retail"],
  "ai_transformation_opportunity": "High"
}
```

### APM Toolkit Integration

**Storage Key:** `apm_applications_{projectId}`

**Import Pattern:**
```javascript
async function importFromAPM(projectId) {
  const apmKey = `apm_applications_${projectId}`;
  const apmData = JSON.parse(localStorage.getItem(apmKey) || '[]');
  
  // Transform to engagement format
  const applications = apmData.map(app => ({
    id: app.id,
    name: app.name,
    category: app.category,
    businessValue: app.businessValue,
    technicalFit: app.technicalFit,
    recommendation: app.recommendation,
    // ... map other fields
  }));
  
  // Add to engagement
  applications.forEach(app => {
    engagementManager.addApplication(engagementId, app);
  });
}
```

---

## 📝 Naming Conventions

### File Naming
- Component files: `EA_ComponentName.js` (PascalCase with EA_ prefix)
- HTML pages: `descriptive-name.html` (kebab-case)
- Documentation: `DESCRIPTIVE_NAME.md` (SCREAMING_SNAKE_CASE)
- Data files: `descriptive_name.json` (snake_case)

### Variable Naming
- Classes: `EA_ClassName` (PascalCase with EA_ prefix)
- Functions/Methods: `functionName` (camelCase)
- Constants: `CONSTANT_NAME` (SCREAMING_SNAKE_CASE)
- Private properties: `_privateProp` (camelCase with _ prefix)

### Storage Key Naming
- Pattern: `{prefix}_{entity}_{id}`
- Examples:
  - `ea_account_ACC-001`
  - `ea_opportunity_OPP-001`
  - `ea_engagement_model_ENG-001`
  - `apm_applications_project_123`

---

## 🚨 Critical Notes for AI

### When Implementing New Features

1. **Always use GPT-5 Responses API** (not Chat Completions)
2. **Dark mode for AI panels** - no exceptions
3. **IndexedDB with localStorage fallback** - never direct localStorage
4. **Modular architecture** - create dedicated component file
5. **Data contract compliance** - follow exact schema (string vs array!)
6. **Industry-specific content** - avoid generic consulting language
7. **Quantification** - include metrics, costs, timelines
8. **Real system names** - use actual vendors (Salesforce, SAP, Azure, etc.)

### Documentation Standards

- Update this file when adding new components
- Document data contracts for new entities
- Include code examples for complex patterns
- Reference related files and their purposes

### Testing Checklist

Before committing changes:
- ✅ Test in both Chrome and Edge
- ✅ Verify IndexedDB fallback works
- ✅ Check console for errors
- ✅ Validate data contract compliance
- ✅ Test AI integration with sample prompt
- ✅ Verify auto-save triggers correctly
- ✅ Test export/import preserves data

---

## 📞 Related Documentation

- **Architecture:** [architecture/EAV4_Architecture.md](architecture/EAV4_Architecture.md)
- **APM Toolkit:** [architecture/APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md](architecture/APM_TOOLKIT_TECHNICAL_DOCUMENTATION.md)
- **Workflow Engine:** [architecture/ea_BusinessObject_workflow.md](architecture/ea_BusinessObject_workflow.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Where to Find Everything:** [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)

---

**Last Updated:** April 21, 2026  
**Maintained By:** EA Platform Development Team  
**For Questions:** Refer to inline code comments or architecture documentation
