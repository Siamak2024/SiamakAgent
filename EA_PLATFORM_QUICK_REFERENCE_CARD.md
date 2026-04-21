# EA Platform V4 Quick Reference Card - April 2026

**Version:** 4.0  
**Last Updated:** April 21, 2026  
**Purpose:** Quick lookup for common tasks and patterns

---

## 🚀 Getting Started

### New to the codebase?
1. **START HERE:** [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)
2. **Navigation:** [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)
3. **Setup:** [QUICKSTART.md](QUICKSTART.md)

### Need to test something?
👉 [ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md)

### What changed recently?
👉 [DOCUMENTATION_UPDATE_SUMMARY_2026.md](DOCUMENTATION_UPDATE_SUMMARY_2026.md)

---

## 🔴 CRITICAL: GPT-5 Responses API

### ❌ OLD (DO NOT USE):
```javascript
// Chat Completions format - DEPRECATED
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{role: 'system', content: prompt}],
    temperature: 0.7
  })
});
```

### ✅ NEW (USE THIS):
```javascript
// Responses API format - CURRENT
const response = await AzureOpenAIProxy.create(
  "user message",  // First param: string
  {
    instructions: systemPrompt,  // NOT systemInstructions
    model: 'gpt-5'  // Optional, defaults to gpt-5
  }
);
const output = response.output_text;
```

**Key Differences:**
- First param is STRING (not messages array)
- Use `instructions` (not `systemInstructions`)
- NO temperature parameter (GPT-5 only supports default)
- Extract from `response.output_text`

---

## 📦 Core Modules Quick Reference

### Configuration
```javascript
import EA_Config from './js/EA_Config.js';
const apiKey = EA_Config.openai.apiKey;
const model = EA_Config.openai.model;  // 'gpt-4.1' or 'gpt-5'
```

### Data Management
```javascript
const dm = new EA_DataManager();
await dm.init();
const project = await dm.getProject(projectId);
await dm.updateProject(projectId, projectData);
```

### Storage (IndexedDB + localStorage)
```javascript
await EA_StorageManager.init();
await EA_StorageManager.save('applications', appData);
const app = await EA_StorageManager.get('applications', appId);
const allApps = await EA_StorageManager.getAll('applications');
```

### Account Management
```javascript
const am = new EA_AccountManager();
const account = await am.createAccount(accountData);
const opportunity = await am.createOpportunity(accountId, oppData);
```

### Engagement Management
```javascript
const em = new EA_EngagementManager();
const engagement = await em.createEngagement(engagementData);
await em.addApplication(engagementId, applicationData);
await em.addCapability(engagementId, capabilityData);
```

### AI Assistant
```javascript
const aiAssistant = new EA_AIAssistant();
const context = aiAssistant.detectContext();
const response = await aiAssistant.chat(userMessage, context);
```

### APQC Integration
```javascript
const framework = await dm.loadAPQCFramework();
const caps = await dm.getAPQCCapabilitiesByBusinessType('Banking');
const digiCaps = await dm.getAPQCCapabilitiesByIntent('Digital Transformation');
```

---

## 🎨 UI Standards

### Dark Mode AI Chat (MANDATORY)
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

### APQC Badge
```html
<span class="apqc-badge" title="APQC Framework capability: 2.1.0">
  APQC
</span>
```

```css
.apqc-badge {
  background: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
```

---

## 📊 Data Contracts

### Strategic Intent
```javascript
{
  strategic_ambition: "string",        // STRING
  strategic_themes: ["theme1", ...],   // ARRAY
  success_metrics: ["metric1", ...],   // ARRAY
  strategic_constraints: ["...", ...]  // ARRAY
}
```

### Business Model Canvas
```javascript
{
  value_proposition: "string",         // STRING (NOT array!)
  customer_segments: ["seg1", ...],    // ARRAY
  channels: ["channel1", ...],         // ARRAY
  revenue_streams: ["stream1", ...],   // ARRAY
  // ... all other fields are ARRAYS
}
```

### Application
```javascript
{
  id: "uuid",
  name: "string",
  business_criticality: "High|Medium|Low",
  technical_health: 0-100,
  annual_cost: number,
  users_count: number
}
```

**See full contracts:** [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md) → Data Contracts

---

## 🔍 Common Tasks

### Create New Account
```javascript
const am = new EA_AccountManager();
const account = await am.createAccount({
  name: "Acme Corp",
  industry: "Financial Services",
  acv: 500000,
  health: "Green"
});
```

### Load APQC Capabilities
```javascript
const dm = new EA_DataManager();
const caps = await dm.getAPQCCapabilitiesByBusinessType('Insurance');
// Import to engagement
await EA_IntegrationBridge.importAPQCCapabilities(engagementId, caps);
```

### Detect Context for AI
```javascript
const aiAssistant = new EA_AIAssistant();
const context = aiAssistant.detectContext();
console.log('Current phase:', context.currentPhase);  // E0, E1, E2, etc.
console.log('Current step:', context.currentStep);    // E1.2, E2.1, etc.
```

### Run Decision Engine
```javascript
const de = new EA_DecisionEngine();
const decision = await de.analyzeApplication(applicationData);
console.log('Decision:', decision.decision);  // Invest, Tolerate, Migrate, etc.
console.log('Reason:', decision.reason);
```

### Export Project
```javascript
const fm = new EA_FileManager();
const exportData = await fm.exportProject(projectId);
// Download as JSON
fm.downloadAsJSON(exportData, 'project_export.json');
```

---

## 🛠️ Troubleshooting

### Issue: "AzureOpenAIProxy.create is not a function"
**Fix:** Ensure AzureOpenAIProxy.js is loaded before other components

### Issue: API returns error "Invalid instructions"
**Fix:** Use `instructions` (not `systemInstructions`)

### Issue: "localStorage quota exceeded"
**Fix:** Use EA_StorageManager (has IndexedDB fallback)

### Issue: APQC capabilities not loading
**Fix:** Check that APQC JSON files exist in /data/ folder

### Issue: Dark mode not applied
**Fix:** Check CSS for `.ai-chat-container`, `.ai-message`, `.user-message`

### Issue: Data type mismatch
**Fix:** Validate against data contracts in CODEBASE_REFERENCE_2026.md

---

## 📁 File Structure Quick Map

```
CanvasApp/
├── js/
│   ├── EA_Config.js              # Configuration
│   ├── EA_DataManager.js         # Project data
│   ├── EA_StorageManager.js      # IndexedDB + localStorage
│   ├── EA_AccountManager.js      # Accounts
│   ├── EA_EngagementManager.js   # Engagements
│   ├── EA_WorkflowEngine.js      # E0-E5 workflow
│   ├── EA_AIAssistant.js         # AI assistant
│   ├── EA_DecisionEngine.js      # Portfolio decisions
│   ├── EA_ScoringEngine.js       # 4-criteria scoring
│   ├── EA_IntegrationBridge.js   # Integrations
│   └── ... (20+ more modules)
├── AzureOpenAIProxy.js           # OpenAI API wrapper
├── data/
│   ├── apqc_pcf_master.json      # APQC framework
│   └── ... (templates, etc.)
└── CODEBASE_REFERENCE_2026.md    # ⭐ START HERE
```

---

## 📞 Need Help?

| Question | Documentation |
|----------|--------------|
| How does component X work? | [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md) |
| Where is feature Y? | [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md) |
| How do I test Z? | [ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md) |
| What changed recently? | [DOCUMENTATION_UPDATE_SUMMARY_2026.md](DOCUMENTATION_UPDATE_SUMMARY_2026.md) |
| How do I set up locally? | [QUICKSTART.md](QUICKSTART.md) or [README.md](README.md) |

---

## 🎯 Anti-Patterns (DO NOT DO)

1. ❌ Use Chat Completions API format
2. ❌ Set temperature with GPT-5
3. ❌ Write directly to localStorage
4. ❌ Use light mode for AI panels
5. ❌ Ignore data contract specifications
6. ❌ Use generic consulting language
7. ❌ Pass messages array to AzureOpenAIProxy.create()

---

## ✅ Best Practices (DO THIS)

1. ✅ Use GPT-5 Responses API format
2. ✅ Accept default temperature
3. ✅ Use EA_StorageManager for all persistence
4. ✅ Apply dark mode UI for AI
5. ✅ Validate data types match contracts
6. ✅ Use AI transformation mindset
7. ✅ Pass user message string to AzureOpenAIProxy.create()

---

**Print this page for quick reference!**  
**Last Updated:** April 21, 2026  
**Maintained By:** EA Platform Development Team
