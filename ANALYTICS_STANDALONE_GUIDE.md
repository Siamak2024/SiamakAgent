# Analytics Standalone Usage Guide

**Version:** 1.0  
**Date:** 2026-04-07  
**Purpose:** Använd Analytics-tabbar UTAN att köra EA Workflow först

---

## 🎯 Översikt

Analytics-tabbarna (DI, Financial, Scenarios, Optimize) kan användas **oberoende** av EA Workflow! Du behöver bara tillhandahålla minimal data.

### ✅ Fördelar med Standalone Mode:
- Snabbare setup (ingen 7-stegs workflow)
- Fokusera på analys istället för datainsamling
- Återanvänd befintlig capability data
- Testa analytics med "quick & dirty" data

---

## 📋 Data Requirements per Tab

| Analytics Tab | **Kräver** | **Optional (förbättrar resultat)** |
|--------------|------------|-------------------------------------|
| **Decision Intelligence** | Capabilities (≥3) | Strategic Intent, Gap Analysis |
| **Financial** | Capabilities + Value Pools | Strategic Intent, Initiatives |
| **Scenarios** | Capabilities | Roadmap, Dependencies |
| **Optimize** | Capabilities + Initiatives | Value Pools, Constraints |

---

## 🚀 Metod 1: Import från CSV/Excel

### Steg 1: Förbered din Excel-fil

Skapa en Excel med följande format:

```csv
=== CAPABILITIES ===
name,domain,maturity,strategicImportance,businessAreas,description
Manage Customer Data,Customer,2,high,sales|marketing,CRM and customer database management
Process Orders,Operations,3,high,sales|logistics,Order fulfillment workflow
Analyze Sales Data,Finance,2,medium,finance|sales,Sales analytics and reporting
Manage Inventory,Operations,3,medium,logistics,Stock management
Develop Products,Product,2,high,r&d|product,Product development lifecycle
```

**Fält-guide:**
- `name`: Capability namn (required)
- `domain`: Business domain (Customer/Operations/Finance/Product/Technology/Support/Risk)
- `maturity`: 1-5 (1=Initial, 2=Defined, 3=Managed, 4=Optimized, 5=Innovative)
- `strategicImportance`: low/medium/high
- `businessAreas`: Pipe-separated (sales|marketing|finance)
- `description`: Fri text

### Steg 2: Import till plattformen

1. Öppna [NexGenEA/NexGen_EA_V4.html](NexGenEA/NexGen_EA_V4.html)
2. Gå till **"Lager"** (Architecture Layers) tab
3. Klicka **"Excel-import/-export"** knappen (högst upp till höger)
4. Välj **"Import from CSV/Excel"**
5. Bläddra till din fil och klicka **OK**
6. Bekräfta importen

### Steg 3: Verifiera import

1. Kontrollera att capabilities visas i **"FÖRMÅGOR"** (Capabilities) sektionen
2. Navigera till **Analytics → DI** tab
3. Kontrollera att **"EA Context Status"** visar:
   - ✅ X Capabilities
   - ⚠️ Strategic Intent missing (OK för standalone)
   - ⚠️ Gap Analysis missing (OK för standalone)

### Steg 4: Kör Analytics

Klicka **"Run Analysis"** → Vänta på resultat!

---

## 🚀 Metod 2: Programmatisk Data Injection

### JavaScript Console Quick Start

Öppna Developer Tools (F12) och kör:

```javascript
// 1. Definiera minimal capabilities-data
window.model = window.model || {};
window.model.capabilities = [
  {
    id: 'cap_1',
    name: 'Manage Customer Relationships',
    domain: 'Customer',
    maturity: 2,
    strategicImportance: 'high',
    businessAreas: ['sales', 'marketing'],
    description: 'CRM and customer engagement',
    operationalCriticality: 4
  },
  {
    id: 'cap_2',
    name: 'Process Financial Transactions',
    domain: 'Finance',
    maturity: 3,
    strategicImportance: 'high',
    businessAreas: ['finance'],
    description: 'Payment processing and reconciliation',
    operationalCriticality: 5
  },
  {
    id: 'cap_3',
    name: 'Analyze Business Intelligence',
    domain: 'Technology',
    maturity: 2,
    strategicImportance: 'medium',
    businessAreas: ['analytics', 'finance'],
    description: 'Data warehousing and BI reporting',
    operationalCriticality: 3
  }
];

// 2. (Optional) Lägg till Strategic Intent för bättre resultat
window.model.strategicIntent = {
  strategic_ambition: 'Digital Transformation & Customer Excellence',
  strategic_themes: ['Customer Experience', 'Operational Efficiency', 'Data-Driven Decisions'],
  key_outcomes: ['Reduce costs by 20%', 'Improve NPS by 15 points'],
  key_constraints: ['Limited IT budget', 'Legacy system dependencies']
};

// 3. Spara till localStorage för persistens
localStorage.setItem('ea-autosave-default', JSON.stringify(window.model));

// 4. Uppdatera UI
if (typeof updateTabLockStates === 'function') updateTabLockStates();

console.log('✅ Data loaded! Navigate to Analytics tabs.');
```

### Förbättrad Data för Financial Tab

För **Financial Analytics** behöver du också Value Pools:

```javascript
window.model.valuePools = [
  {
    id: 'vp_1',
    name: 'Cost Reduction through Process Automation',
    category: 'Cost Reduction',
    estimatedValue: 2500000,
    timeframe: '12 months',
    confidence: 'medium',
    enabler_technology: 'ai',
    linked_capabilities: ['cap_1', 'cap_2']
  },
  {
    id: 'vp_2',
    name: 'Revenue Growth from Enhanced CX',
    category: 'Revenue Growth',
    estimatedValue: 5000000,
    timeframe: '18 months',
    confidence: 'high',
    enabler_technology: 'digital',
    linked_capabilities: ['cap_1']
  }
];

// Mark Gap Analysis as done (tricks the unlock logic)
window.model.gapAnalysisDone = true;

localStorage.setItem('ea-autosave-default', JSON.stringify(window.model));
```

### Förbättrad Data för Optimize Tab

För **Optimize Analytics** behöver du Initiatives:

```javascript
window.model.initiatives = [
  {
    id: 'init_1',
    name: 'Implement CRM Modernization',
    description: 'Replace legacy CRM with cloud platform',
    linkedCapability: 'cap_1',
    priority: 'P1',
    effort: 'L',
    impact: 'high',
    estimatedCost: 800000,
    estimatedDuration: 9
  },
  {
    id: 'init_2',
    name: 'Deploy BI Platform',
    description: 'Implement modern data warehouse and analytics',
    linkedCapability: 'cap_3',
    priority: 'P2',
    effort: 'M',
    impact: 'medium',
    estimatedCost: 500000,
    estimatedDuration: 6
  }
];

// Mark Target Arch as done
window.model.targetArchDone = true;

localStorage.setItem('ea-autosave-default', JSON.stringify(window.model));
```

---

## 🚀 Metod 3: REST API Integration (Future Enhancement)

**Detta behöver implementeras!**

### Proposed API Endpoints:

```javascript
// POST /api/analytics/load-context
{
  "capabilities": [...],
  "strategicIntent": {...},
  "valuePools": [...],
  "initiatives": [...]
}

// POST /api/analytics/run/{tabId}
{
  "userInput": {...}  // Tab-specific parameters
}

// GET /api/analytics/results/{tabId}/{runId}
```

**Implementation TODO:**
- Create server-side API endpoint in `server.js`
- Add CORS support for external integration
- Implement result caching/persistence
- Add webhook notifications for completed analyses

---

## 📊 Hur Systemet Avgör Tab Unlock

Från kod (line 13020):

```javascript
const contentChecks = {
  'analytics-di': () => model.capabilities.length > 0,
  'analytics-financial': () => model.capabilities.length > 0 && 
                               (model.valuePools?.length > 0 || model.gapAnalysisDone),
  'analytics-scenarios': () => model.capabilities.length > 0,
  'analytics-optimize': () => model.capabilities.length > 0 && 
                              (model.initiatives?.length > 0 || model.targetArchDone)
};
```

### Context Builder Logic

När du öppnar en Analytics tab anropas `AnalyticsContextBuilder.buildContext()`:

```javascript
// Från AnalyticsContextBuilder.js
{
  strategicIntent: model.strategicIntent || null,
  capabilities: model.capabilities || [],
  gapAnalysis: model.gapAnalysis?.gaps || [],
  valuePools: model.valuePools || [],
  roadmap: {
    initiatives: model.initiatives || [],
    waves: model.roadmap?.waves || []
  },
  workflowStatus: {
    completionPercentage: calculateCompletionPct(),
    completedSteps: [...]
  }
}
```

**Analytics körs MED den data som finns** - ingen är obligatorisk utom capabilities!

---

## ⚠️ Varningar och Limitationer

### 1. Data Quality Påverkar Resultat

**Minimal data = Enklare analys:**
- Med bara 3 capabilities → DI Analytics kan bara göra basic health scoring
- Utan Strategic Intent → AI kan inte koppla till business strategy
- Utan Value Pools → Financial Analytics kan inte beräkna ROI

**Rekommendation:** 
- Minst **5-10 capabilities** för meningsfulla resultat
- Lägg till Strategic Intent (3 meningar räcker!)
- För Financial: Minst 2-3 value pools

### 2. Tab-Context Status Warning

När du öppnar en analytics tab med minimal data ser du:

```
⚠️ No EA workflow data yet. Analytics will work with limited context. 
Complete Steps 1-3 for better results.
```

**Detta är OK!** Klicka bara "Run Analysis" ändå.

### 3. Vissa Features Kräver Full Workflow

**Begränsade utan full workflow:**
- **Decision Intelligence:** Kan inte göra sequencing utan gap analysis
- **Financial:** Kan inte göra multi-scenario CBA utan value pools
- **Scenarios:** Kan inte modellera disruption utan dependencies
- **Optimize:** Kan inte optimera roadmap utan initiatives

**Men grundläggande analys fungerar fortfarande!**

---

## 🧪 Test Scenarios

### Scenario 1: "Quick Health Check"

**Mål:** Snabb capability health assessment

**Data needed:**
```javascript
{
  capabilities: [5-10 items with maturity 1-5]
}
```

**Run:** Analytics → DI → Task 1 only

**Expected output:** Health scores per capability

---

### Scenario 2: "Financial Justification"

**Mål:** Business case för transformation

**Data needed:**
```javascript
{
  capabilities: [≥5 items],
  valuePools: [≥3 items with estimatedValue]
}
```

**Run:** Analytics → Financial

**Expected output:** NPV, IRR, Payback period, Investment priorities

---

### Scenario 3: "Portfolio Optimization"

**Mål:** Optimal initiativ-sekvensering

**Data needed:**
```javascript
{
  capabilities: [≥5 items],
  initiatives: [≥5 items with effort/impact/cost]
}
```

**Run:** Analytics → Optimize

**Expected output:** Pareto-optimal roadmap alternatives

---

## 📚 Relaterade Guider

- **[Architecture Verification Guide](ARCHITECTURE_VERIFICATION_GUIDE.md)** - Testa efter EA Workflow
- **[APQC Integration Guide](APAQ_Data/INTEGRATION_GUIDE.md)** - Import industry-standard capabilities
- **[Data Contracts Index](NexGenEA/js/Instructions/DATA_CONTRACTS_INDEX.md)** - Full data model specs

---

## 🎓 Best Practices

### ✅ DO:
- Start med minimal data och iterera
- Använd CSV import för bulk capabilities
- Spara till localStorage för persistence
- Testa DI först (kräver minst data)
- Lägg till Strategic Intent även om den är enkel

### ❌ DON'T:
- Försök inte köra Optimize utan initiatives
- Förvänta inte full sequencing utan gap analysis
- Glöm inte att spara till localStorage efter data injection
- Låt bli att hoppa över `updateTabLockStates()` call

---

## 💡 Tips: Snabbstart Template

Kopiera-klistra detta i console för omedelbar start:

```javascript
// SNABBSTART: 5 CAPABILITIES + STRATEGIC INTENT
window.model = {
  capabilities: [
    {id:'cap_1',name:'Customer Onboarding',domain:'Customer',maturity:2,strategicImportance:'high',businessAreas:['sales'],operationalCriticality:4},
    {id:'cap_2',name:'Order Processing',domain:'Operations',maturity:3,strategicImportance:'high',businessAreas:['operations'],operationalCriticality:5},
    {id:'cap_3',name:'Financial Reporting',domain:'Finance',maturity:3,strategicImportance:'medium',businessAreas:['finance'],operationalCriticality:4},
    {id:'cap_4',name:'Product Development',domain:'Product',maturity:2,strategicImportance:'high',businessAreas:['r&d'],operationalCriticality:3},
    {id:'cap_5',name:'Data Analytics',domain:'Technology',maturity:2,strategicImportance:'medium',businessAreas:['analytics'],operationalCriticality:3}
  ],
  strategicIntent: {
    strategic_ambition:'Digital Excellence & Customer Satisfaction',
    strategic_themes:['Customer Experience','Operational Efficiency','Innovation']
  }
};
localStorage.setItem('ea-autosave-default',JSON.stringify(window.model));
if(typeof updateTabLockStates==='function')updateTabLockStates();
console.log('✅ Ready! Go to Analytics tabs.');
```

**Efter körning:** Alla 4 Analytics tabs är upplåsta och redo att köra!

---

## 🚀 Future Enhancements (Roadmap)

### Phase 1: Enhanced Standalone Mode (Q2 2026)
- [ ] **Guided minimal data wizard** - "Generate Analytics in 3 questions"
- [ ] **Template library** - Pre-built capability sets per industry
- [ ] **Smart defaults** - Auto-fill missing optional fields
- [ ] **Data validation** - Real-time validation av input

### Phase 2: External Integration (Q3 2026)
- [ ] **REST API** - Load context via HTTP
- [ ] **Webhook callbacks** - Async result notifications
- [ ] **PowerBI connector** - Direct integration
- [ ] **Excel Add-in** - Generate from Excel worksheet

### Phase 3: AI-Assisted Data Prep (Q4 2026)
- [ ] **Natural language input** - "I have 200 people in Sales, 50 in IT..."
- [ ] **Auto-capability extraction** - Scan org chart → Generate capabilities
- [ ] **Industry templates** - "I'm in Retail" → Pre-populate 15 retail capabilities
- [ ] **Synthetic data generator** - Create realistic test data

---

## 📞 Support

**Problem?** Se [Architecture Verification Guide](ARCHITECTURE_VERIFICATION_GUIDE.md) → "Debugging Tips"

**Feature Request?** Kontakta platform team

**Bug Report?** Check browser console och inkludera:
- `console.log(window.model)`
- Error stacktrace
- Browser version

---

**Lycka till med standalone analytics!** 🚀
