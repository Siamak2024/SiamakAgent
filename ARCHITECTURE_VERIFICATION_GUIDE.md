# EA Platform Architecture Verification Guide

**Version:** 1.0  
**Date:** 2026-04-07  
**Purpose:** Guide för att testa och verifiera implementerad arkitektur

---

## 🎯 Översikt

Denna guide hjälper dig att:
1. ✅ Verifiera att AI agents genereras korrekt
2. ✅ Kontrollera APQC-integration i Capability Map
3. ✅ Testa Analytics-vyerna (DI, Financial, Scenarios, Optimize)
4. ✅ Validera AI transformation focus i alla genererade artifacts

---

## 🔧 Senaste fixar (2026-04-07)

### Problem som åtgärdades:
1. **AI Agents visades inte** i Architecture Layers tab
   - **FIX:** Step7.js letar nu i `targetArch.ai_agents` (enligt data contract)
2. **APQC badges saknades** i Capability Map
   - **FIX:** APQC-märkta capabilities visar nu blå badge med framework-kod
3. **Analytics-vyer kraschade** med "PromptBuilder.getInstruction is not a function"
   - **FIX:** AnalyticsWorkflowEngine.js använder nu `await PromptBuilder.load()`
4. **AI Transformation princip** implementerad
   - **FIX:** BASE_PROMPT i Advicy_AI.js förstärkt med AI transformation mindset

---

## 📋 Test 1: Verifiera AI Agents Generation

### Scenario: Standard Mode - Step 7 Generation

**Steg:**
1. Öppna [NexGenEA/NexGen_EA_V4.html](NexGenEA/NexGen_EA_V4.html)
2. Skapa nytt projekt eller ladda befintligt
3. a befintligt projekt med Strategic Intent + Capabilities  (minst Step 1-3)
4. Generera **Step 7: Target Architecture & Roadmap**
5. Navigera till fliken **"EA-arkitekturgslåda"** (Architecture Layers)
6. Kontrollera sektionen **"AI-AGENTER"**

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

---

## 📋 Test 2: Verifiera APQC Badge Integration

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
