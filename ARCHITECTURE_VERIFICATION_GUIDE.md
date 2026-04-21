# EA Platform Architecture Verification Guide

**Version:** 2.0  
**Date:** April 21, 2026  
**Purpose:** Guide för att testa och verifiera implementerad arkitektur

---

## 🎯 Översikt

Denna guide hjälper dig att:
1. ✅ Verifiera GPT-5 Responses API integration
2. ✅ Kontrollera modular component architecture
3. ✅ Testa IndexedDB + localStorage fallback
4. ✅ Validera AI transformation focus i alla genererade artifacts
5. ✅ Verifiera APQC-integration i Capability Map
6. ✅ Testa Analytics-vyerna (DI, Financial, Scenarios, Optimize)
7. ✅ Kontrollera dark mode UI för AI chat panels

---

## 📚 Dokumentationsreferenser

**Komplett kodbasdokumentation:**  
👉 [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)

**Arkitektur:**  
👉 [architecture/EAV4_Architecture.md](architecture/EAV4_Architecture.md)

**Navigationsguide:**  
👉 [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)

---

## 🚨 Kritiska förändringar (April 2026)

### Senaste uppdateringar:

1. **GPT-5 Responses API** - Ny API-format (ej kompatibel med gamla Chat Completions)
   - **FIX:** Använd `instructions` (INTE `systemInstructions`)
   - **FIX:** Första parametern måste vara sträng, inte objekt
   - **FIX:** Sätt ALDRIG temperature (GPT-5 stödjer endast default)
   - **FIX:** Använd `response.output_text` för output

2. **Modular Architecture** - 30+ dedikerade komponenter i /js/
   - **FIX:** Varje major feature har egen JS-modul
   - **FIX:** Clear separation of concerns
   - **FIX:** Konsekvent namngivning: `EA_ComponentName.js`

3. **IndexedDB Primary** - localStorage är nu endast fallback
   - **FIX:** Använd EA_StorageManager för all datapersistence
   - **FIX:** Automatisk fallback till localStorage om IndexedDB misslyckas

4. **Dark Mode AI** - Obligatoriskt dark mode för alla AI chat panels
   - **FIX:** Background `#1a1a1a`, text `#e5e5e5`
   - **FIX:** AI messages `#2d2d2d` med blå vänster border
   - **FIX:** User messages `#374151` med grön vänster border

5. **Data Contracts** - Strikt schema enforcement
   - **FIX:** value_proposition är STRING (INTE array!)
   - **FIX:** strategic_themes är ARRAY (INTE sträng!)
   - **FIX:** Validera datatyper enligt contracts i CODEBASE_REFERENCE_2026.md

6. **APQC Integration** - Deep integration med Process Classification Framework v8.0
   - **FIX:** APQC-capabilities visar blå badge
   - **FIX:** Tooltip visar framework-kod (t.ex. "2.1.0")

---

---

## 📋 Test 1: Verifiera GPT-5 Responses API Integration

### Scenario: AI Assistant Chat

**Steg:**
1. Öppna valfri sida med AI assistant (t.ex. Growth Dashboard, Account Dashboard)
2. Öppna browser Developer Tools (F12) → Console
3. Skicka ett meddelande till AI assistant
4. Observera network traffic och console logs

**Förväntat resultat:**
- ✅ API-anrop går till `/api/openai-proxy` eller `/api/openai/chat`
- ✅ Request payload innehåller:
  ```javascript
  {
    message: "user message",  // Första parametern som sträng
    options: {
      instructions: "system prompt",  // INTE systemInstructions
      model: "gpt-5"  // eller saknas (default)
    }
  }
  ```
- ✅ Response innehåller `output_text` field
- ✅ **INGEN** `temperature` parameter i request
- ✅ Ingen console error

**Om det misslyckas:**
- Kontrollera AzureOpenAIProxy.js implementation
- Verifiera att komponenten använder KORREKT API-format
- Se exempel i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 2: Verifiera Modular Component Architecture

### Scenario: Component Loading and Initialization

**Steg:**
1. Öppna huvudsidan (index.html eller Growth Dashboard)
2. Öppna Developer Tools → Console
3. Kör följande kommandon:
```javascript
console.log('EA_Config:', typeof EA_Config);
console.log('EA_DataManager:', typeof EA_DataManager);
console.log('EA_AccountManager:', typeof EA_AccountManager);
console.log('EA_StorageManager:', typeof EA_StorageManager);
console.log('EA_AIAssistant:', typeof EA_AIAssistant);
console.log('AzureOpenAIProxy:', typeof AzureOpenAIProxy);
```

**Förväntat resultat:**
- ✅ Alla ska returnera `"function"` (för klasser) eller `"object"` (för config)
- ✅ Ingen ska vara `undefined`
- ✅ EA_Config.version ska vara "3.0.0" eller högre

**Om någon är undefined:**
- Kontrollera att `<script>` tags är korrekt ordnade i HTML
- Verifiera att filer finns i /js/ katalogen
- Kolla console för load errors

---

## 📋 Test 3: Verifiera IndexedDB + localStorage Fallback

### Scenario: Storage Manager Initialization

**Steg:**
1. Öppna Application → IndexedDB i Developer Tools
2. Leta efter `EA_DecisionEngine` databas
3. Om IndexedDB finns, bekräfta object stores:
   - applications
   - decisions
   - scores
   - engagements
   - stakeholders
   - capabilities
   - initiatives
   - etc.
4. Testa fallback genom att blocka IndexedDB:
```javascript
// I console
delete window.indexedDB;
location.reload();
```
5. Verifiera att data fortfarande sparas i localStorage

**Förväntat resultat:**
- ✅ IndexedDB används som primary storage
- ✅ localStorage används som fallback om IndexedDB misslyckas
- ✅ EA_StorageManager.init() returnerar true i båda fallen
- ✅ Data persisterar över page refresh

**Om det misslyckas:**
- Kontrollera EA_StorageManager.js implementation
- Verifiera initIndexedDB() och initLocalStorage() methods
- Se fallback pattern i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 4: Verifiera Dark Mode UI för AI Chat Panels

### Scenario: AI Assistant Visual Styling

**Steg:**
1. Öppna sida med AI assistant (Account Dashboard, Growth Dashboard)
2. Öppna AI chat panel (höger sidebar)
3. Skicka några meddelanden
4. Inspektera chat panel element med Developer Tools

**Förväntat resultat:**
- ✅ Chat container background: `#1a1a1a` eller mörkare
- ✅ Text color: `#e5e5e5` eller ljusare
- ✅ AI message background: `#2d2d2d` med blå vänster border (`#3b82f6`)
- ✅ User message background: `#374151` med grön vänster border (`#10b981`)
- ✅ **INGEN** light mode styling

**Om light mode används:**
- Uppdatera CSS för AI chat panel
- Se dark mode standards i CODEBASE_REFERENCE_2026.md
- Kontrollera att `.ai-chat-container`, `.ai-message`, `.user-message` har rätt styling

---

## 📋 Test 5: Verifiera Data Contract Compliance

### Scenario: Strategic Intent Generation (Step 1)

**Steg:**
1. Öppna NexGen_EA_V4.html
2. Generera Strategic Intent (Step 1)
3. I Developer Tools Console, kör:
```javascript
console.log('Strategic Intent:', model.strategicIntent);
console.log('Type of strategic_ambition:', typeof model.strategicIntent.strategic_ambition);
console.log('Type of strategic_themes:', Array.isArray(model.strategicIntent.strategic_themes));
```

**Förväntat resultat:**
- ✅ `strategic_ambition` är STRING
- ✅ `strategic_themes` är ARRAY
- ✅ `success_metrics` är ARRAY
- ✅ `strategic_constraints` är ARRAY

### Scenario: Business Model Canvas (Step 2)

**Steg:**
1. Generera BMC (Step 2)
2. I Console:
```javascript
console.log('BMC:', model.bmc);
console.log('Type of value_proposition:', typeof model.bmc.value_proposition);
console.log('Type of customer_segments:', Array.isArray(model.bmc.customer_segments));
```

**Förväntat resultat:**
- ✅ `value_proposition` är STRING (INTE array!)
- ✅ Alla andra BMC fields (customer_segments, channels, etc.) är ARRAYS

**Om fel datatyp:**
- Kontrollera AI generation instruction files
- Verifiera data contracts i CODEBASE_REFERENCE_2026.md
- Se Data Contracts & Schemas section

---

## 📋 Test 6: Verifiera AI Agents Generation

### Scenario: Target Architecture AI Agents (Step 7)

**Steg:**
1. Öppna NexGen_EA_V4.html med projekt som har Step 1-3 komplett
2. Generera Step 7: Target Architecture
3. Navigera till "EA-arkitekturgslåda" (Architecture Layers) tab
4. Kontrollera sektionen "AI-AGENTER"

**Förväntat resultat:**
- ✅ Minst 3-8 AI agents visas
- ✅ Varje agent har:
  - 🤖 Robot-ikon
  - **Type badge** (NLP, RPA, Computer Vision, Predictive, etc.)
  - **✨ "Proposed"** märkning (för TO-BE agents)
  - **↔ X caps** (antal länkade capabilities)
- ✅ Hover över agent-namn visar `purpose` tooltip

**Om det misslyckas:**
- Kontrollera browser console för fel
- Verifiera att `model.aiAgents` existerar i localStorage
- Kör: `console.log(window.model.aiAgents)` i developer tools
- Se AI Agent schema i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 7: Verifiera APQC Integration

### Scenario: APQC Capability Loading

**Steg:**
1. Öppna NexGen_EA_V4.html eller APM Toolkit
2. Ladda APQC capabilities för en specifik industry (t.ex. Banking)
3. I Console:
```javascript
// Test APQC loading
const dm = new EA_DataManager();
const framework = await dm.loadAPQCFramework();
console.log('APQC Framework loaded:', framework);

const bankingCaps = await dm.getAPQCCapabilitiesByBusinessType('Banking');
console.log('Banking capabilities:', bankingCaps.length);
```

**Förväntat resultat:**
- ✅ APQC framework laddar utan errors
- ✅ Industry-specific capabilities returneras
- ✅ Capabilities har `apqc_code` field (t.ex. "2.1.1")
- ✅ Capabilities har `capability_name`, `process_group`

### Scenario: APQC Badge i Capability Map

**Steg:**
1. Efter APQC import, öppna Capability Map view
2. Leta efter capabilities märkta med APQC
3. Hover över blå APQC badge

**Förväntat resultat:**
- ✅ APQC-capabilities har blå "APQC" badge
- ✅ Tooltip visar: "APQC Framework capability: X.X.X"
- ✅ Badge syns i både domain-based och fixed-domain layouts

**Om badges saknas:**
- Verifiera CSS för `.apqc-badge`
- Kontrollera att capability object har `apqc_source: true`, `apqc_code: "X.X.X"`
- Se APQC Integration section i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 8: Verifiera Analytics Workflows

### Scenario: Decision Intelligence Analytics

**Förberedelser:**
- Skapa EA-modell med minst:
  - Strategic Intent (Step 1)
  - Capabilities (Step 3) - minst 5 capabilities
  - Gap Analysis (Step 5)

**Steg:**
1. Gå till "Påverkan" (Analytics) → "DI" tab
2. Klicka "Run Analysis"
3. Observera generated recommendations

**Förväntat resultat:**
- ✅ Analysis körs utan errors
- ✅ Recommendations genereras baserat på gap analysis
- ✅ Output är industry-specific och kvantifierat
- ✅ AI transformation opportunities identifieras

### Scenario: Financial Analytics

**Steg:**
1. Gå till "Påverkan" → "Financial" tab
2. Klicka "Run Financial Analysis"

**Förväntat resultat:**
- ✅ NPV, ROI, IRR calculations visas
- ✅ Payback period beräknas
- ✅ Cost-benefit analysis presenteras
- ✅ Inga calculation errors

### Scenario: Scenarios Analytics

**Steg:**
1. Gå till "Påverkan" → "Scenarios" tab
2. Definiera scenario parameters
3. Generate alternative scenarios

**Förväntat resultat:**
- ✅ Multiple scenarios genereras
- ✅ Comparison table visas
- ✅ Impact analysis för varje scenario
- ✅ Recommendations baserat på constraints

**Om Analytics misslyckas:**
- Kontrollera AnalyticsWorkflowEngine.js
- Verifiera PromptBuilder.load() await pattern
- Se Parallel Analytics Workflows documentation

---

## 📋 Test 9: Verifiera Context-Aware AI Assistant

### Scenario: Context Detection

**Steg:**
1. Öppna Account Dashboard med specifik account
2. Öppna AI assistant panel
3. I Console:
```javascript
const context = aiAssistant.detectContext();
console.log('Detected context:', context);
```

**Förväntat resultat:**
- ✅ `context.currentPhase` detekteras (t.ex. "E0", "E1", etc.)
- ✅ `context.currentStep` detekteras (t.ex. "E1.2")
- ✅ `context.accountId` finns (om på Account Dashboard)
- ✅ `context.engagementId` finns (om engagement öppet)
- ✅ Integration status för APQC, APM, BMC visas

### Scenario: Context-Aware Prompting

**Steg:**
1. Navigera till olika workflow steps
2. Öppna AI assistant på varje step
3. Observera suggested prompts

**Förväntat resultat:**
- ✅ Suggested prompts ändras baserat på current step
- ✅ AI responses är relevanta för current context
- ✅ Integration hooks visas när relevant (t.ex. "Import from APM" vid E1.1)

**Om context inte detekteras:**
- Kontrollera EA_AIAssistant.detectContext() method
- Verifiera workflowState i engagement data
- Se Context Detection Engine i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 10: Verifiera Auto-Save Funktionalitet

### Scenario: Auto-Save Trigger

**Steg:**
1. Öppna projekt i NexGen_EA_V4.html
2. Gör ändringar i data (lägg till capability, etc.)
3. Vänta 3 minuter utan aktivitet
4. Observera console logs

**Förväntat resultat:**
- ✅ Auto-save triggar efter 180 sekunder (3 minuter)
- ✅ Console log: "Auto-save triggered" eller liknande
- ✅ Data sparas till IndexedDB/localStorage
- ✅ Page refresh behåller changes

**Test Debouncing:**
1. Gör ändringar
2. Fortsätt göra ändringar inom 10 sekunder varje gång
3. Auto-save ska INTE trigga förrän 10+ sekunder idle

**Om auto-save inte fungerar:**
- Kontrollera EA_Config.autoSaveInterval (ska vara 180000 ms)
- Verifiera debouncing logic
- Se Auto-Save section i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 11: Verifiera Export/Import Funktionalitet

### Scenario: Project Export

**Steg:**
1. Skapa eller öppna account med data
2. Använd Data Manager → Export All Data
3. Verifiera downloaded JSON file

**Förväntat resultat:**
- ✅ JSON fil downloadar
- ✅ Innehåller all account data
- ✅ Innehåller opportunities, engagements
- ✅ Metadata finns (exportDate, version, etc.)

### Scenario: Project Import

**Steg:**
1. Importera previously exported JSON
2. Verifiera data restoreras korrekt

**Förväntat resultat:**
- ✅ All data återställs
- ✅ Relationships bevaras (account → opportunities → engagements)
- ✅ Ingen data loss

**Om import/export misslyckas:**
- Kontrollera EA_FileManager.js och EA_ProjectManager.js
- Verifiera JSON structure
- Se Export Project section i CODEBASE_REFERENCE_2026.md

---

## 📋 Test 12: Verifiera Cross-Component Integration

### Scenario: Account → Engagement → APM Flow

**Steg:**
1. Skapa Account
2. Skapa Opportunity för account
3. Skapa Engagement från opportunity
4. Importera applications från APM Toolkit
5. Verifiera länkar

**Förväntat resultat:**
- ✅ Account har reference till opportunity
- ✅ Opportunity har reference till engagement
- ✅ Engagement har applications från APM
- ✅ Navigation mellan vyer fungerar
- ✅ Data är konsistent across components

**Om links inte fungerar:**
- Kontrollera EA_AccountManager linking logic
- Verifiera EA_EngagementManager.addApplication()
- Se Integration Points i CODEBASE_REFERENCE_2026.md

---

## ✅ Test Checklist Summary

Kör alla tester ovan och markera:

**Core Infrastructure:**
- [ ] GPT-5 Responses API fungerar
- [ ] Modular components laddar korrekt
- [ ] IndexedDB + localStorage fallback fungerar
- [ ] Auto-save triggar efter 3 minuter idle

**UI & UX:**
- [ ] Dark mode för AI chat panels
- [ ] APQC badges visas i Capability Map
- [ ] Context-aware AI assistant

**Data & Storage:**
- [ ] Data contracts följs (string vs array)
- [ ] Export/import bevarar all data
- [ ] Cross-component linking fungerar

**Features:**
- [ ] AI Agents genereras (Step 7)
- [ ] Analytics workflows körs utan errors
- [ ] APQC integration fungerar
- [ ] Decision Engine recommendations

---

## 🚨 Common Issues & Solutions

### Issue 1: "AzureOpenAIProxy.create is not a function"
**Lösning:** Verifiera att AzureOpenAIProxy.js är laddad innan andra components

### Issue 2: "Cannot read property 'instructions' of undefined"
**Lösning:** Använd korrekt API format - första param sträng, andra param options object

### Issue 3: "localStorage quota exceeded"
**Lösning:** Använd EA_StorageManager istället för direkt localStorage - det har IndexedDB fallback

### Issue 4: AI responses är generiska
**Lösning:** Säkerställ context-aware prompting används (EA_AIAssistant.detectContext())

### Issue 5: APQC capabilities visas inte
**Lösning:** Verifiera att APQC framework är korrekt laddad via EA_DataManager

---

## 📞 Support & Documentation

**För fullständig kod-referens:**
👉 [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)

**För navigering:**
👉 [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)

**För arkitektur:**
👉 [architecture/EAV4_Architecture.md](architecture/EAV4_Architecture.md)

---

**Last Updated:** April 21, 2026  
**Maintained By:** EA Platform Development Team


### Scenario: APQC Workflow i APM Toolkit

**Steg:**
1. Öppna [EA2_Toolkit/Application_Portfolio_Management.html](EA2_Toolkit/Application_Portfolio_Management.html)
2. Importera portfolio data (eller skapa manuellt)
3. Klicka **"Load Capability Template"** → Välj **"Real Estate"**
4. Observera capabilities-listan i vänstra panelen
5. Öppna [NexGenEA_EA_V4.html](NexGenEA/NexGen_EA_V4.html)
6. Gå till **"Mognad"** tab → **Capability Map**
7. Kontrollera capabilities som har `apqc_source: true` i data

**Förväntat resultat:**
- ✅ Capabilities från APQC framework har en **blå "APQC" badge**
- ✅ Hover över badge visar tooltip: "APQC Framework capability: X.X.X" (kod)
- ✅ Badge syns både i:
  - Domain-baserad layout (ny capabilityMap_tobe struktur)
  - Fixed-domain layout (legacy 7-column grid)

**Om det misslyckas:**
- Kontrollera att CSS-styling för `.apqc-badge` finns (line ~17580 i HTML)
- Verifiera att capabilities har fields: `apqc_source: true`, `apqc_code: "2.1.0"`

---

## 📋 Test 3: Verifiera Analytics-vyerna

### Scenario: Köra alla 4 Analytics Workflows

**Förberedelser:**
1. Se till att du har en EA-modell med minst:
   - ✅ Strategic Intent (Step 1)
   - ✅ Capabilities (Step 3) - minst 5 capabilities
   - ✅ Gap Analysis (Step 5) - helst
   - ✅ Value Pools (Step 6) - helst för Financial tab

**Test 3.1: Decision Intelligence Analytics**
1. Gå till **"Påverkan"** (Analytics) → **"DI"** tab
2. Klicka **"Run Analysis"**
3. Vänta på progress bar (5 tasks: Health Assessment → Quick Wins → Gap Analysis → Sequencing → Executive Summary)
4. Verifiera resultat:
   - ✅ Health scores för capabilities visas
   - ✅ Quick wins identifierade
   - ✅ Strategic gaps listade
   - ✅ Sequencing recommendations
   - ✅ Executive summary genererat

**Test 3.2: Financial Analytics**
1. Gå till **"Financial"** tab
2. Ange **Discount Rate** (t.ex. 8%)
3. Klicka **"Run Analysis"**
4. Verifiera resultat:
   - ✅ Cost estimates per capability
   - ✅ Value pool modeling
   - ✅ NPV/IRR calculations
   - ✅ Multi-scenario financial model
   - ✅ Investment priorities

**Test 3.3: Scenario Analytics**  
1. Gå till **"Scenarios"** tab
2. Definiera ett disruption scenario (t.ex. "Budget Cut 30%")
3. Klicka **"Run Analysis"**
4. Verifiera resultat:
   - ✅ Disruption impact analysis
   - ✅ Dependency cascades identified
   - ✅ Resilience assessment
   - ✅ Mitigation strategies

**Test 3.4: Optimize Analytics**
1. Gå till **"Optimize"** tab
2. Ange optimization weights (Strategic Alignment, ROI, Risk, Speed)
3. Klicka **"Run Analysis"**
4. Verifiera resultat:
   - ✅ Alternative roadmaps generated
   - ✅ Trade-off analysis
   - ✅ Pareto-optimal solutions
   - ✅ Recommended portfolio

**Om något fail:**
- **"PromptBuilder.getInstruction is not a function"** → Detta borde vara fixat nu!
- Kontrollera browser console för andra fel
- Verifiera att alla JS-filer laddas korrekt (Network tab i DevTools)

---

## 📋 Test 4: AI Transformation Focus

### Scenario: Verifiera AI-First Thinking i Genererade Artifacts

**Test 4.1: Strategic Intent (Step 1)**
1. Generera Strategic Intent för en organization
2. Kontrollera att `ai_transformation_ambition` finns i output
3. Verifiera att `strategic_themes` inkluderar AI-relaterade teman (om relevant för bransch)

**Test 4.2: Capability Map (Step 3)**
1. Generera Capability Map
2. Kontrollera att minst 30% av capabilities har:
   - `ai_enabled: true` eller
   - `ai_maturity > 1`
3. Verifiera att capabilities visar 🤖 robot-ikon i Capability Map-vyn

**Test 4.3: Operating Model (Step 4)**
1. Generera Operating Model
2. Leta efter:
   - AI governance structure
   - AI CoE (Center of Excellence) references
   - AI skill requirements

**Test 4.4: Value Pools (Step 6)**
1. Generera Value Pools
2. Kontrollera att minst 2 value pools har:
   - `enabler_technology: "ai"` eller liknande

**Test 4.5: Architecture Layers (Step 7)**
1. Generera Target Architecture
2. Kontrollera att:
   - ✅ 3-8 AI agents skapas
   - ✅ Varje agent länkar till capabilities
   - ✅ AI agents är märkta som TO-BE (proposed)
   - ✅ Architecture Decisions (ADRs) nämner AI infrastructure

**Förväntat beteende:**
Advicy AI ska ALLTID:
- Identifiera AI-transformation opportunities
- Föreslå AI-augmented capabilities
- Generera konkreta AI agents
- Markera TO-BE vs AS-IS tydligt
- Länka AI capabilities till business outcomes

---

## 🛠️ Debugging Tips

### Problem: AI Agents visas inte
**Lösning:**
1. Öppna Developer Tools (F12)
2. Kör: `console.log(window.model.aiAgents)`
3. Om `undefined` eller `[]`:
   - Kontrollera att Step 7 kördes framgångsrikt
   - Leta efter `targetArch.ai_agents` i raw data
4. Om data finns men inte visas:
   - Kontrollera att `renderLayers()` anropas
   - Verifiera CSS för `.ai-card`, `.ai-type-badge`, `.to-be-badge`

### Problem: Analytics-vyer krachar
**Lösning:**
1. Kontrollera browser console för exakt felmeddelande
2. Vanliga fel:
   - "PromptBuilder.getInstruction is not a function" → **FIXAT!**
   - "AnalyticsWorkflowEngine is undefined" → Kontrollera att JS-filer laddas
   - "Cannot read property 'capabilities' of undefined" → Saknad EA context
3. Testa med en komplett EA-modell (alla 7 steps)

### Problem: APQC badges syns inte
**Lösning:**
1. Kontrollera att capability har: `{ "apqc_source": true, "apqc_code": "2.1.0" }`
2. Verifiera CSS: Sök efter `.apqc-badge` i HTML-filen (line ~17580)
3. Kontrollera i Developer Tools → Elements att badge-elementet renderas

### Problem: TO-BE markers saknas
**Lösning:**
1. Kontrollera att objekt har `is_proposed: true`
2. Verifiera CSS för `.to-be-badge`
3. För AI agents: `agent.is_proposed === true`
4. För capabilities: `capability.changeType === 'TRANSFORM'` eller liknande

---

## 📊 Automated Testing

### Köra E2E Validator
Kör detta från workspace root:

```powershell
node scripts/e2e_autopilot_validator.mjs
```

Detta testar:
- ✅ StepEngine integration
- ✅ Architecture Layers population
- ✅ AI agents schema compliance
- ✅ Data contract alignment

### Köra APQC Integration Test
```powershell
node scripts/test_apqc_integration.mjs
```

Detta testar:
- ✅ APQC template loading
- ✅ Capability mapping to applications
- ✅ Bi-directional linking
- ✅ Export with capability preservation

---

## 📝 Checklist: Komplett Verifiering

Gå igenom denna checklista för att verifiera att allt fungerar:

### ✅ Architecture Layers (EA-arkitekturslåda)
- [ ] Värdeflöden (Value Streams) populeras
- [ ] Förmågor (Capabilities) populeras med maturity badges
- [ ] System populeras med status markers
- [ ] AI-AGENTER populeras med 3-8 agents
- [ ] AI agents har type badges (NLP, RPA, etc.)
- [ ] AI agents har TO-BE markers (✨ Proposed)
- [ ] AI agents har capability dependency count (↔ X caps)

### ✅ Capability Map Integration
- [ ] APQC-märkta capabilities visar blå badge
- [ ] AI-enabled capabilities visar robot-ikon 🤖
- [ ] TO-BE vs AS-IS toggle fungerar
- [ ] Domain-based layout renderas korrekt
- [ ] Fixed-domain fallback fungerar

### ✅ Analytics Workflows
- [ ] **DI Analytics** kör utan fel (5 tasks)
- [ ] **Financial Analytics** kör utan fel (4 tasks)
- [ ] **Scenario Analytics** kör utan fel (4 tasks)
- [ ] **Optimize Analytics** kör utan fel (5 tasks)
- [ ] Progress bars uppdateras korrekt
- [ ] Resultat renderas med rich formatting
- [ ] Felmeddelanden visas tydligt vid failure

### ✅ AI Transformation Mindset
- [ ] Strategic Intent inkluderar AI ambition (när relevant)
- [ ] ≥30% av capabilities är AI-enabled eller AI-dependent
- [ ] Operating Model inkluderar AI governance
- [ ] Value Pools identifierar AI-driven värdeskapande
- [ ] Roadmap sekvenserar AI infrastructure före AI-beroende initiativ
- [ ] Architecture Layers genererar konkreta AI agents

---

## 🎓 Nästa Steg

Efter att du verifierat att allt fungerar:

1. **Dokumentera findings:** Notera eventuella buggar eller förbättringsområden
2. **Testa edge cases:** Vad händer med tom data? Ofullständig EA-modell?
3. **Performance testing:** Hur lång tid tar varje analytics workflow?
4. **User experience:** Är feedback-mekanismerna tydliga? Förstår användaren vad som händer?

---

## 📚 Relaterade Dokument

- [AI Transformation Architectural Principle](/.copilot/ai-transformation-architectural-principle.md)
- [EA Platform Architecture Principles](/.copilot/ea-platform-architecture-principles.md)
- [Phase 4 Implementation Notes](/memories/repo/phase4-notes.md)
- [APQC Integration Guide](/APAQ_Data/INTEGRATION_GUIDE.md)
- [E2E Test Results](/EA2_Toolkit/Import data/E2E_TEST_RESULTS.md)

---

**Lycka till med verifieringen!** 🚀
