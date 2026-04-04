# EA Platform V4 — Complete Architecture Documentation

**Purpose:** Reference document for redesigning the current monolithic AI layer into a modular, decoupled instruction architecture where each distinct task (question, synthesis, validation) is a separate, testable AI call that explicitly passes context forward.

**Source file:** `azure-deployment/static/NexGenEA/NexGen_EA_V4.html` (~16,000 lines)  
**Supporting files:** `js/Advicy_AI.js`, `AzureOpenAIProxy.js`, `js/EA_Config.js`  
**Last read:** April 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [AI Layer Architecture](#2-ai-layer-architecture)
3. [Data Model](#3-data-model)
4. [The 7-Step EA Workflow](#4-the-7-step-ea-workflow)
5. [Cross-Step Context Propagation](#5-cross-step-context-propagation)
6. [Supporting AI Calls](#6-supporting-ai-calls)
7. [AI Chat & Discovery Mode](#7-ai-chat--discovery-mode)
8. [Model Views / Tabs](#8-model-views--tabs)
9. [Context Flow Diagram](#9-context-flow-diagram)
10. [Known Patterns & Problems](#10-known-patterns--problems)
11. [AI Call Inventory](#11-ai-call-inventory)
12. [Language Handling](#12-language-handling)
13. [Industry & Business Area Configuration](#13-industry--business-area-configuration)

---

## 1. System Overview

### Platform

NextGen EA Platform V4 is a **single-page application** (SPA) contained in one monolithic HTML file (`NexGen_EA_V4.html`). It implements a 7-step Enterprise Architecture methodology with:

- AI-generated outputs at every step
- A persistent in-memory data model (`let model = {}`) synced to localStorage/IndexedDB
- An AI chat sidebar (Advicy Agent) that operates independently from workflow steps
- A Phase 4 industry/business-area analytics layer

### File Structure

```
azure-deployment/static/
  NexGenEA/
    NexGen_EA_V4.html          ← Main SPA (all workflow logic, AI calls, rendering, UI)
  AzureOpenAIProxy.js          ← HTTP proxy wrapper for OpenAI Responses API
  js/
    Advicy_AI.js               ← Layered system-prompt builder for AI Chat sidebar
    EA_Config.js               ← App config (version 3.0.0, storage keys, toolkit defs)
    EA_DataManager.js          ← Data persistence helpers
    EA_FileManager.js          ← Import/export
    EA_NordicUI.js             ← UI component library
    EA_SyncEngine.js           ← Cross-device sync
    EA_ToolkitKPI.js           ← KPI toolkit
```

### Technology

- **AI Model:** GPT-5 via OpenAI Responses API (with reasoning summaries)
- **AI Proxy:** `AzureOpenAIProxy.js` — POST `/api/openai-proxy` (Azure / production) or `/api/openai/chat` (localhost), with direct OpenAI API fallback using a stored key
- **Frontend:** Vanilla HTML + JavaScript, TailwindCSS, Nordic theme design system
- **Storage:** localStorage + IndexedDB (auto-save every 30 s)
- **Language support:** `en`, `sv`, `no`, `da`, `fi` with auto-detection

---

## 2. AI Layer Architecture

### 2.1 Request Path

Every AI call in the platform — workflow steps, supporting calls, and chat — flows through the single `callAI(sys, user, options)` function. No code bypasses it.

```
User Action
    │
    ▼
callAI(sys, user, options)
    │
    ├── Resolve taskType → AI_MODEL_CONFIG entry
    │     (discovery | action | heavy | analysis | general | lightweight)
    │
    ├── buildMasterDataPromptContext()       ← Always injected (project context)
    │
    ├── Language instruction injection       ← Append to sys if lang ≠ 'en'
    │
    ├── Assemble Responses API payload:
    │     instructions = sys + languageInstruction + "\n\nProject Context:\n" + masterData
    │     input        = user + "\n\nAnalysis Constraints:\n..."
    │
    ├── Try: AzureOpenAIProxy.create(input, createOpts)
    │
    └── Catch: Direct fetch to https://api.openai.com/v1/responses
                 (uses OPENAI_KEY from localStorage)

Return: response.output_text (string)
```

### 2.2 `callAI` Function (line ~3950)

```javascript
async function callAI(sys, user, options = {})
```

**Key options:**

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `taskType` | string | `'general'` | Selects `AI_MODEL_CONFIG` config |
| `temperature` | number | from config | Override model temperature |
| `timeoutMs` | number | from config | Override timeout |
| `reasoning` | object | from config | Override `{ summary, effort }` |
| `includeProjectContext` | boolean | `true` | Inject `buildMasterDataPromptContext()` |
| `replyLanguage` | string | app lang | Force response language |
| `_traceLabel` | string | taskType | Label for Prompt Trace sidebar card |
| `_fromChat` | boolean | false | Skip re-render of prompts trace (avoids loop) |
| `silentOnNoKey` | boolean | false | Throw silently if no API key |

**Behaviour:**
- Detects reasoning models (`/^(o1|o3|o4|gpt-5)/i`) and omits `temperature` for them
- Renders a "thinking card" in the chat sidebar if the model returned reasoning summaries
- Fires `renderPromptTrace()` (shows editable system+user prompt in sidebar) unless `_fromChat`

### 2.3 `AI_MODEL_CONFIG` (line ~2163)

Six named task profiles. All use GPT-5 with the OpenAI Responses API reasoning extension.

| Profile | Temperature | Timeout | Reasoning effort | Use for |
|---------|------------|---------|-----------------|---------|
| `discovery` | 0.7 | 180 s | high | Deep reasoning, EA result discussion |
| `action` | 0.2 | 120 s | medium | Exact JSON generation, model updates |
| `heavy` | 0.3 | 240 s | high | Steps 3, 4, 7 — full architecture generation |
| `analysis` | 0.4 | 180 s | high | Gap analysis, maturity, benchmarking |
| `general` | 0.6 | 120 s | medium | Chat Q&A, general advisement |
| `lightweight` | 0.3 | 60 s | low | Translations, simple lookups, Step 1 context engine |

> **Note:** `lightweight` is used for the Pre-Step 1 Context Engine and for Step 1 Strategic Intent itself — despite the name, these calls carry large system prompts. Steps 2 `generateBMC` uses `heavy`.

### 2.4 `buildMasterDataPromptContext()` (line ~3930)

Every `callAI` call (unless `includeProjectContext: false`) appends this block to the system prompt:

```
Industry Profile: {model.phase4Config.industry}
Active Business Areas: {normalizeBusinessAreas(...).join(', ')}
Business Model: {model.masterData.businessModel}
Offerings: {model.masterData.offerings}
Customer Segments: {model.masterData.customerSegments}
Geographies: {model.masterData.geographies}
Regulations: {model.masterData.regulations}
Core Systems: {model.masterData.coreSystems}
Data Landscape: {model.masterData.dataLandscape}
Strategic Priorities: {model.masterData.strategicPriorities}
Constraints: {model.masterData.constraints}
```

And this block to the user prompt:

```
Analysis Constraints:
- Avoid generic advice
- Use the provided master data and business context
- Tailor output to the selected industry and business areas
```

### 2.5 `Advicy_AI.js` — Chat Sidebar Context Engine

**Used exclusively by the AI Chat sidebar**, NOT by workflow steps 1–7.

Builds a layered system prompt:

1. **BASE_PROMPT** — always included; defines Advicy Agent persona
2. **INDUSTRY_LAYERS** — 10 industry-specific expansions (auto-detected via `_detectIndustryFromText()`)
3. **VIEW_LAYERS** — 15 active-view-specific instructions (set via `AdvisyAI.setActiveView()`)
4. **ESG addendum** — appended when ESG topics are detected

Key methods:
- `AdvisyAI.updateIndustryLayer()` — re-detects industry from current model content
- `AdvisyAI.setActiveView(viewName)` — called when user switches tabs
- `AdvisyAI.buildSystemPrompt()` — assembles all layers
- `AdvisyAI.call(userMessage, conversationHistory)` — wraps `callAI` for chat use

### 2.6 `AzureOpenAIProxy.js`

Thin HTTP wrapper. Key methods:

| Method | Signature | Purpose |
|--------|-----------|---------|
| `create` | `(input, opts)` | Standard text completion via Responses API |
| `callWithTools` | `(input, opts, tools)` | Tool-calling / function-calling |
| `webSearch` | `(query)` | Bing/search-grounded responses |

Routes: production → `/api/openai-proxy`, localhost → `/api/openai/chat`.

### 2.7 `extractJSON(text)` — JSON Parser

```javascript
function extractJSON(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  const a = text.indexOf('['), b = text.indexOf('{');
  const start = a === -1 ? b : b === -1 ? a : Math.min(a, b);
  if (start === -1) return text;
  return text.slice(start, Math.max(text.lastIndexOf(']'), text.lastIndexOf('}')) + 1);
}
```

**Known fragility:** Fails if AI wraps JSON in explanatory prose without code fences. All step calls request `"Return ONLY valid JSON, no markdown"` in their system prompts to mitigate this.

---

## 3. Data Model

### 3.1 `model` Object (line ~2098)

The single global mutable state object. All AI outputs are written into it. Persisted to localStorage/IndexedDB on auto-save.

```javascript
let model = {
  // ── CORE ARCHITECTURE ──
  valueStreams:    [],        // [{name}]
  capabilities:   [],        // [{name, domain, valueStream, maturity, strategicImportance,
                             //    operationalCriticality, dependsOnCapabilities,
                             //    fteHoursSavedPct, invoiceVolumeImpactPct,
                             //    investmentEstimate, riskExposureEstimate,
                             //    revenueUpliftEstimate, sustainabilityImpactPct,
                             //    revenueExposure, regulatoryExposure,
                             //    annualSavingsEstimate, annualRevenueUplift,
                             //    annualRiskAvoidance, totalAnnualValue,
                             //    roiMultiple, paybackMonths}]
  capabilities_tobe: [],     // [{name, domain, maturity, strategicImportance, valueStream,
                             //    changeType (keep|evolve|new|deprecate), changeRationale}]
  processes:      [],
  systems:        [],        // [{name, supportsCapability, criticality}]
  dataDomains:    [],        // [{name}]
  aiAgents:       [],        // [{name, supportsCapability, criticality}]
  initiatives:    [],        // [{name, impactsCapability, estimatedBusinessValue,
                             //    complexity, priority, phase, description,
                             //    strategicThemeLink, depends_on[], start_month,
                             //    duration_months, success_criteria, risk{description,mitigation}}]
  roadmapPhaseGates: null,   // [{phase, criteria[], decision_maker, fallback_if_gate_fails}]

  // ── WORKFLOW OUTPUTS ──
  strategicIntent: null,     // Step 1 JSON (see §4.2)
  strategicIntentConfirmed: false,
  bmc: null,                 // Step 2 target-state BMC JSON
  bmc_current: null,         // Step 2 current-state BMC JSON
  bmc_analysis: null,        // Step 2 model-shift analysis
  operatingModel: {},        // Step 4 JSON
  valuePools: [],            // Step 6 JSON array
  targetArch: null,          // Step 7a JSON array
  targetArchDone: false,
  gapAnalysisDone: false,
  gapAnalysisRaw: null,      // Step 5 raw text output
  aiBenchmark: null,         // Step 3 parallel benchmarking call output

  // ── CONTEXT & CONFIG ──
  masterData: {
    businessModel: '',
    offerings: '',
    customerSegments: '',
    geographies: '',
    regulations: '',
    coreSystems: '',
    dataLandscape: '',
    strategicPriorities: '',
    constraints: ''
  },
  aiConfig: {
    model: 'gpt-5',
    architectureMode: 'standard'   // 'draft' | 'standard' | 'deep'
  },
  phase4Config: {
    industry: 'generic',
    activeBusinessAreas: ['general']
  },
  contextObj: {},            // Output of Pre-Step 1 Context Engine
  stepMeta: {},              // _meta objects from each step's AI response

  // ── DIAGNOSTICS ──
  diagnosticProgress: {
    currentStep: 1,
    completedSteps: [],
    industryProfile: null,
    focusArea: null,
    contextData: {
      step1_scope: null,
      step2_currentState: null,
      step3_problems: null,
      step4_maturity: null,
      step5_outcomes: null,
      step6_strategicIntent: null,
      step7_targetArch: null
    },
    validationStatus: { step1:false, step2:false, step3:false, step4:false,
                        step5:false, step6:false, step7:false },
    cxoSummaries: {},
    scenarioAnalysis: null
  },
  scenarios: [],
  investments: []
};
```

### 3.2 Architecture Generation Modes (`model.aiConfig.architectureMode`)

Controls the profile used in Step 3 (`getArchitectureGenerationProfile()`):

| Mode | Value Streams | Capabilities | Systems | AI Agents | Temperature | Timeout |
|------|---------------|--------------|---------|-----------|-------------|---------|
| `draft` | 3–4 | 8–10 | 5–6 | 2–3 | 0.4 | 120 s |
| `standard` | 5–6 | 12–15 | 8–10 | 3–5 | 0.3 | 180 s |
| `deep` | 7–8 | 16–20 | 12–15 | 5–8 | 0.2 | 240 s |

### 3.3 Global Window Variables (cross-step state)

| Variable | Set by | Read by | Purpose |
|----------|--------|---------|---------|
| `window._stepPrompts` | Pre-Step 1 Context Engine | Steps 1–7 | Industry-calibrated system prompts |
| `window._step1Hypothesis` | Pre-Step 1 Context Engine | Clarification gate | AI's initial interpretation |
| `window._step1Questions` | Pre-Step 1 Context Engine | Clarification gate | 4 MCQ clarification questions |
| `window._cgAnswers` | Clarification gate | Step 1 prompt builder | User's gate answers |
| `window._capmapState` | Cap map UI | `renderCapMap()` | `'asis'` or `'tobe'` |
| `window._advisyPromptTrace` | Workflow step launchers | `callAI()` | Enable Prompt Trace panel |

---

## 4. The 7-Step EA Workflow

### Pre-Step 0 — Prompt Optimiser (`_buildOptimizedStep1Prompt`)

**Trigger:** Called at the start of `clarifyStrategicIntent()`, before any workflow step.  
**Task type:** `lightweight`  
**Function:** `_buildOptimizedStep1Prompt(desc)` (line ~9218)

**What it does:**
1. Sends the company description to a "Context Engine" AI call
2. Returns a JSON object with:
   - `context` — structured organisation classification (industry, org_type, maturity, scale, strategic_posture, regulatory_flags, etc.)
   - `hypothesis` — AI's initial interpretation + estimated confidence
   - `clarification_questions` — 4 MCQ questions for the user (objective, pain, scope, maturity)
   - `step_prompts` — complete, industry-specific system prompts for all 7 steps
3. Stores `step_prompts` in `window._stepPrompts` for downstream steps
4. Falls back to a static base prompt if the call fails

**System prompt (meta-prompt):** Instructs the AI to act as the "Context Engine" and produce ALL seven step system prompts in a single call. Each step prompt must include a named expert persona, industry context grounded only in user input, a JSON-only instruction, and a quality gate ("Generic output is unacceptable").

**Critical constraint:** "Do NOT invent specific service lines, corridors, system names, customer types, or revenue figures. Mark unknown attributes with `[to be confirmed]`."

**User input shape:**
```
Company description: "{desc}"

Return JSON with this exact shape:
{ "context": {...}, "hypothesis": {...}, "clarification_questions": [...], "step_prompts": {...} }
```

---

### Clarification Gate (`_showClarificationGate`)

**Trigger:** After Pre-Step 0, before Step 1 (fresh runs only, not refinement).  
**Function:** `_showClarificationGate(hypothesis, questions)` (line ~9504)

Renders an interactive card in the AI sidebar:
- AI hypothesis block (interpretation, assumed pain points, assumed systems, confidence %)
- 4 MCQ questions (objective, pain, scope, maturity)
- "Generate Strategic Intent" button → resolves Promise with answers object
- "Skip →" button → resolves Promise with `{ skipped: true }`

Answers are stored in `window._cgAnswers` and injected into Step 1's user prompt as:
```
User-confirmed clarifications (treat these as ground truth — do not mark as [to be confirmed]):
objective: {answer}
pain: {answer}
scope: {answer}
maturity: {answer}
```

---

### Step 1 — Strategic Intent (`clarifyStrategicIntent`)

**Function:** `clarifyStrategicIntent()` (line ~9630)  
**Task type:** `lightweight`  
**Temperature:** 0.3

**System prompt source:** `window._stepPrompts.step_1` (from Pre-Step 0) — a full expert persona prompt for a senior strategy advisor with 15+ years in the detected industry. Falls back to a static base prompt.

Always appended to the system prompt (regardless of source):

```
Output requirements — Return ONLY valid JSON (no markdown, no explanation):
{
  "org_name": "",
  "industry": "",
  "timeframe": "3-5 years",
  "strategic_ambition": "",      // 1 sentence, C-level, no invented numbers
  "situation_narrative": "",     // 2-3 sentences, grounded in user input only
  "strategic_themes": ["","",""],// exactly 3
  "investigation_scope": [],     // 4-6 items: What EA must investigate
  "key_constraints": [],         // exactly 5: Operational|Financial|Organisational|Technical|External
  "success_metrics": [],         // 5-6 items: Reduction in / Improvement in / Increase in
  "key_assumptions_to_validate":[],// 5-8 engagement assumptions
  "expected_outcomes": ["","",""],// exactly 3
  "burning_platform": "",
  "assumptions_and_caveats": [], // DATA GAPS ONLY — attributes inferred, not stated
  "_meta": { "assumptions":[], "confidence":0.0, "dataSources":[], "keyDrivers":[] }
}
```

**User prompt:**
```
Extract structured Strategic Intent for this organisation:

"{desc}"

User-confirmed clarifications (treat as ground truth):
objective: {answer}
...
```

**Output stored in:** `model.strategicIntent`  
**Unlock:** `model.strategicIntentConfirmed = true` (via "Confirm Step 1" button)

---

### Step 2 — Business Model Canvas (`generateBMC`)

**Function:** `generateBMC()` (line ~9697)  
**Task type:** `heavy`  
**Temperature:** 0.2

**System prompt source:** `window._stepPrompts.step_2`  
**Context injected:** Full Strategic Intent (ambition, situation narrative, burning platform, themes, constraints, metrics, investigation scope, assumptions, expected outcomes)

**JSON schema returned:**
```json
{
  "current_state_bmc": {
    "value_proposition": "",
    "customer_segments": [],
    "channels": [],
    "customer_relationships": [],
    "key_activities": [],
    "key_resources": [],
    "key_partners": [],
    "cost_structure": [],
    "revenue_streams": []
  },
  "target_state_bmc": { ...same shape... },
  "model_shift_analysis": {
    "blocks_requiring_transformation": [],
    "revenue_concentration_risk": "",
    "new_revenue_streams_enabled": [],
    "cost_lines_addressable": []
  },
  "_meta": { "assumptions":[], "confidence":0.0, "dataSources":[], "keyDrivers":[] }
}
```

**Output stored in:**
- `model.bmc` ← `target_state_bmc` (backwards-compatible with Steps 3–7)
- `model.bmc_current` ← `current_state_bmc`
- `model.bmc_analysis` ← `model_shift_analysis`

**Refinement mode:** If `model.bmc` already exists, includes existing canvases in user prompt and instructs AI to "refine and improve while preserving all confirmed details."

---

### Step 3 — Architecture Generation (`generateArchitecture`)

**Function:** `generateArchitecture()` (line ~10545)  
**Executes 3 AI calls (Call 1 sequential, Calls 2+3 parallel)**

#### Call 1 — Structure

**Task type:** `heavy`  
**Temperature:** from `getArchitectureGenerationProfile()` (0.2–0.4 by mode)  
**System prompt:** `window._stepPrompts.step_3`

**Context injected:**
- Strategic Intent block (Steps 1 output)
- BMC block (Step 2 target-state output)
- Existing architecture (if refinement mode)

**JSON schema returned:**
```json
{
  "valueStreams": [{ "name": "" }],
  "capabilities": [{
    "name": "",
    "domain": "Customer|Product|Operations|Risk|Finance|Technology|Support",
    "valueStream": "",
    "maturity": 3,
    "strategicImportance": "low|medium|high",
    "operationalCriticality": 3,
    "dependsOnCapabilities": []
  }],
  "systems": [{ "name": "", "supportsCapability": "", "criticality": "low|medium|high" }],
  "dataDomains": [{ "name": "" }],
  "aiAgents": [{ "name": "", "supportsCapability": "", "criticality": "" }],
  "_meta": { "assumptions":[], "confidence":0.0, "dataSources":[], "keyDrivers":[] }
}
```

**Output:** Directly merged into `model` via `model = { ...model, ...struct }`.

Immediately renders: `renderLayers()`, `renderCapMap()`, `renderHeatmap()`, `renderMaturityDashboard()`.

#### Call 2 — Financial Enrichment (`_enrichCapabilityFinancials`)

**Task type:** `analysis` (parallel with Call 3)  
**Input:** Company description + Strategic Intent + capability names list

**JSON schema per capability:**
```json
{
  "name": "",
  "fteHoursSavedPct": 0,
  "invoiceVolumeImpactPct": 0,
  "investmentEstimate": 0,
  "riskExposureEstimate": 0,
  "revenueUpliftEstimate": 0,
  "sustainabilityImpactPct": 0,
  "revenueExposure": "low|medium|high",
  "regulatoryExposure": "low|medium|high",
  "confidence": 0.0,
  "assumptions": ""
}
```

**Post-processing:** `computeDerivedFinancials()` calculates:
- `annualSavingsEstimate` = fteCost × (fteHoursSavedPct / 100)
- `annualRevenueUplift` = revenueUpliftEstimate
- `annualRiskAvoidance` = riskExposureEstimate × 0.15 (probability of materialisation)
- `totalAnnualValue` = sum of three levers
- `roiMultiple` = totalAnnualValue / investmentEstimate
- `paybackMonths` = 12 × investmentEstimate / totalAnnualValue

If Call 2 fails, falls back to `_applyHeuristicFinancials()` (rule-based estimates from domain/criticality).

#### Call 3 — AI Benchmarking (`_generateAIBenchmark`)

**Task type:** `analysis` (parallel with Call 2)  
**Input:** Company description + Strategic Intent + industry profile

Generates an industry-calibrated benchmark comparison.  
**Output stored in:** `model.aiBenchmark`

---

### Step 4 — Operating Model (`generateOperatingModel`)

**Function:** `generateOperatingModel()` (line ~10754)  
**Task type:** `heavy`  
**Temperature:** 0.2

**System prompt:** `window._stepPrompts.step_4`

**Context injected:**
- Full Strategic Intent block with `strategicDirection` flag:
  - `COST-REDUCTION / EFFICIENCY` — if ambition contains cost/efficien/lean/optim/save/reduc
  - `VALUE-CREATION / GROWTH` — otherwise
- BMC context (value proposition, customer segments, revenue streams)
- Sample of top 10 capabilities (name, domain, maturity, strategicImportance)

**JSON schema returned:**
```json
{
  "valueProposition": "",
  "customerSegments": [],
  "keyActivities": [],
  "keyResources": [],
  "keyPartners": [],
  "channels": [],
  "costStructure": [],
  "revenueStreams": []
}
```

**Strategic direction rules injected into user prompt:**
- Cost-reduction: key activities = process excellence + automation; cost = lean, fixed-to-variable
- Value-creation: key activities = innovation + CX + new markets; resources = talent + data + platform

**Output stored in:** `model.operatingModel`

---

### Step 5 — Gap Analysis (`analyseGaps` → `requestDynamicGapAnalysis`)

**Functions:**
- `analyseGaps()` (line ~10819) — button handler, calls `requestDynamicGapAnalysis()`
- `requestDynamicGapAnalysis(options)` (line ~8601) — core analysis engine

**Task type:** `analysis`

**System prompt:** `window._stepPrompts.step_5`

**Context injected:** Full `_buildStepContext(5)` output (see §5)

**JSON schema returned:**
```json
{
  "gapAnalysis": [{
    "title": "",
    "detail": "",
    "owner": "",
    "timeHorizon": "",
    "capabilityName": "",
    "gapScore": 0,
    "strategicAlignmentScore": 0,
    "financialImpactScore": 0,
    "actionUrgency": "immediate|short-term|medium-term|long-term"
  }],
  "desiredState": [{ "title": "", "detail": "" }],
  "currentState": [{ "title": "", "detail": "" }],
  "actionSteps": [{ "title": "", "detail": "", "owner": "", "timeHorizon": "" }]
}
```

**Weighting formula (from source):**
- Gap score combines: strategic alignment × 0.4 + financial impact × 0.4 + operational criticality × 0.2

**Output stored in:** `model.gapAnalysisRaw`, `model.gapAnalysisDone = true`  
**Displayed via:** `formatGapAnalysisOutput(raw)` → renders 4-lane layout in the Insights tab

---

### Step 6 — Value Pools (`generateValuePools`)

**Function:** `generateValuePools()` (line ~9978)  
**Task type:** `heavy`  
**Temperature:** 0.2

**System prompt:** `window._stepPrompts.step_6`

**Context injected:** Full `_buildStepContext(6)` output + all capability objects

**Rules injected:**
- Every value pool must reference a named capability
- Quantify impact against strategic ambition and success metrics
- Prioritise pools that directly close priority gaps
- Anchor revenue/cost pools to BMC revenue streams and cost structure

**JSON schema returned:**
```json
{
  "valuePools": [{
    "name": "",
    "description": "",
    "value_driver": "cost|revenue|risk|experience",
    "potential_impact": "high|medium|low",
    "enabling_capabilities": [],
    "time_horizon": "short|medium|long",
    "linked_strategic_theme": "",
    "estimated_annual_value_eur": 0
  }],
  "_meta": { ... }
}
```

**Output stored in:** `model.valuePools`

---

### Step 7a — Target Architecture (`generateTargetArch`)

**Function:** `generateTargetArch()` (line ~11020)  
**Task type:** `heavy`  
**Temperature:** 0.2

**System prompt:** Static — `'Return ONLY valid JSON array, no markdown.'`  
(Note: Does NOT use `window._stepPrompts.step_7`. The step_7 prompt is used only by Step 7b Roadmap.)

**Context injected:**
- Strategic Intent block with `strategicDirection`
- Prioritisation rules based on direction:
  - Cost-reduction: prioritise automation, process standardisation, shared services
  - Value-creation: prioritise CX, innovation, data, partner ecosystem
- Full `model.capabilities` array

**JSON schema (array of all capabilities):**
```json
[{
  "name": "",
  "currentMaturity": 2,
  "targetMaturity": 4,
  "domain": "",
  "strategicImportance": "high|medium|low",
  "action": "Specific action statement",
  "enabler": "Platform|AI|Process|Data|People",
  "strategicThemeLink": "Which theme drives this uplift, or null"
}]
```

**Key rule:** Target maturity is not simply "one level up from current" — it is justified by strategic direction. High-importance capabilities aligned to strategic themes should have the most aggressive targets.

**Output stored in:** `model.targetArch`, `model.targetArchDone = true`

---

### Step 7b — Transformation Roadmap (`generateRoadmap`)

**Function:** `generateRoadmap()` (line ~11174)  
**Task type:** `heavy`  
**Temperature:** 0.2

**System prompt:** `window._stepPrompts.step_7`

**Context injected:**
- Strategic Intent block with `strategicDirection`
- Phase sequencing rules based on direction
- Value pools (Step 6) — initiatives must be sequenced to realise these
- Priority gaps (high-importance capabilities with maturity ≤ 3) — Year 1 must close these
- `capContext` = `model.targetArch` (preferred) or `model.capabilities` (fallback)

**JSON schema returned:**
```json
{
  "initiatives": [{
    "name": "",
    "impactsCapability": "",
    "estimatedBusinessValue": "low|medium|high",
    "complexity": "low|medium|high",
    "priority": "high|medium|low",
    "phase": "Year 1 - Foundation|Year 2 - Expansion|Year 3 - Optimisation",
    "description": "",
    "strategicThemeLink": "",
    "depends_on": [],
    "start_month": 1,
    "duration_months": 3,
    "success_criteria": "",
    "risk": { "description": "", "mitigation": "" }
  }],
  "phase_gates": [{
    "phase": "Year 1 - Foundation",
    "criteria": [],
    "decision_maker": "CTO|COO|Board",
    "fallback_if_gate_fails": ""
  }]
}
```

**Output stored in:** `model.initiatives`, `model.roadmapPhaseGates`

---

## 5. Cross-Step Context Propagation

### 5.1 `_buildStepContext(stepNumber)` — Cumulative Context Builder

Called by Steps 5, 6 (and implicitly Step 7 via roadmap prompt). Assembles a complete summary of all prior steps' outputs:

```
=== STEP 1 — STRATEGIC INTENT ===
Ambition: "..."
Situation: "..."
Themes: A · B · C
Constraints: Operational: ... | Financial: ... | ...
Success metrics: ...
EA investigation scope: ...
Key assumptions to validate: ...
Expected outcomes: ...
Timeframe: ...

=== STEP 2 — BUSINESS MODEL CANVAS (TARGET STATE) ===
Value proposition: "..."
Customer segments: ...
Revenue streams: ...
...

=== STEP 3 — CAPABILITY ARCHITECTURE ===
Value streams: ...
Capabilities ({n}): [{name, domain, maturity, strategicImportance, investmentEstimate, totalAnnualValue}]
Priority gaps: (high-importance, maturity ≤ 3)
...
```

### 5.2 Inline Context Builders

Steps 3, 4 build their own `intentPrefix` / `bmcPrefix` blocks inline rather than calling `_buildStepContext`. This is the main source of code duplication.

### 5.3 Context Flow Summary

```
User input (description field or Discovery Mode chat)
    │
    ▼
_buildOptimizedStep1Prompt()
    └── window._stepPrompts{}        ─── used by Steps 1–7
    └── model.contextObj              ─── context classification
    └── window._step1Hypothesis
    └── window._step1Questions
    │
    ▼
Clarification Gate answers → window._cgAnswers
    (injected into Step 1 user prompt)
    │
    ▼
Step 1: model.strategicIntent
    (confirmed via model.strategicIntentConfirmed)
    │
    ▼
Step 2: model.bmc + model.bmc_current + model.bmc_analysis
    └── intentCtx2 injected from model.strategicIntent
    │
    ▼
Step 3: model.capabilities[] + model.valueStreams[] + model.systems[]
 ├── + model.aiBenchmark (parallel)
 └── + financial enrichment per capability (parallel)
    └── intentPrefix + bmcPrefix injected inline
    │
    ▼
Step 4: model.operatingModel
    └── siBlock + bmcBlock + capSample injected inline
    │
    ▼
Step 5: model.gapAnalysisDone + gapAnalysisRaw
    └── _buildStepContext(5) = Steps 1–4 complete summary
    │
    ▼
Step 6: model.valuePools[]
    └── _buildStepContext(6) + all capabilities
    │
    ▼
Step 7a: model.targetArch[]
    └── siBlock + model.capabilities inline
    │
    ▼
Step 7b: model.initiatives[] + model.roadmapPhaseGates
    └── siBlock + vpBlock (Step 6) + gapBlock (Step 5) + capContext (Step 7a)
```

### 5.4 `buildMasterDataPromptContext()` — Always-On Context

In addition to the step-specific context, every single `callAI` call receives the master data block (§2.4), making the organisation profile, industry, and business areas available globally.

---

## 6. Supporting AI Calls

### 6.1 TO-BE Capability Map (`generateCapabilityMapToBe`)

**Trigger:** "Generate TO-BE" button on the Capability Map tab  
**Task type:** `heavy`  
**System prompt:** Static — `'You are a senior enterprise architect. Return ONLY valid JSON, no markdown.'`

**Context:** AS-IS capabilities + Strategic Intent ambition/themes/constraints + BMC target value proposition / revenue streams / key activities

**Output:** `model.capabilities_tobe` — array of capabilities with `changeType` (keep|evolve|new|deprecate)

### 6.2 AI Benchmarking (`_generateAIBenchmark`)

**Trigger:** Parallel with financial enrichment in Step 3  
**Task type:** `analysis`

Generates an industry-calibrated benchmark comparison across the active business areas.  
**Output:** `model.aiBenchmark`

### 6.3 Discovery Mode / Workflow Chat (`sendMessage`)

See §7 — this is the main chat handler.

### 6.4 CxO Summary (`generateCxOSummary`)

**Trigger:** CxO summary buttons on Gap Analysis, Maturity, Operating Model, Benchmarking tabs  
**Function:** `generateCxOSummary(context, contextData)`  
**Task type:** `discovery`

Produces a 5-paragraph executive narrative (Situation → Business Impact → Key Findings → Recommendations → Next Steps).  
**Output:** Modal with editable narrative + export options

### 6.5 Maturity Assessment

**Trigger:** Maturity tab  
Computed client-side from `model.capabilities[].maturity` values + `PHASE4_AREA_BASELINES` benchmarks. No AI call — purely derived calculation.

### 6.6 UI Translation

**Trigger:** Language switcher  
**Task type:** `lightweight` (with `silentOnNoKey: true`)  
Translates UI strings in batch. Skips if no API key.

---

## 7. AI Chat & Discovery Mode

### 7.1 Chat Entry Point (`sendMessage`, line ~6767)

All chat messages (user-typed or programmatic) flow through `sendMessage()`.

**Message routing logic:**

1. **Discovery Mode active** (`assistantMode === 'discovery'`) → `enterDiscoveryModeForStep(step, message)` — deep reasoning discussion of a specific workflow step result
2. **Action Mode active** (`assistantMode === 'action'`) → `handleActionRequest(message)` — JSON model updates via chat instructions
3. **Step keyword detected** (e.g. "generate cap map", "analyse gaps") → route to appropriate workflow function
4. **General question** → `handleGeneralQuestion(message)` with full `buildConversationContext()`

### 7.2 `buildConversationContext()` (line ~6800)

Assembles context for chat calls by collecting all completed step outputs:

```
=== CURRENT EA MODEL STATE ===
Strategic Ambition: "..."
Strategic Themes: A · B · C
Capabilities: {n} capabilities across {domains}
Value Streams: ...
Systems: ...
Operating Model: {valueProposition}
Value Pools: {n} pools
Target Architecture: {n} capabilities defined
Roadmap: {n} initiatives across 3 phases
Gap Analysis: {done/pending}
Benchmark: {available/pending}
```

### 7.3 `startArchitectWorkflow()` — Discovery Mode Launcher (line ~5238)

Starts a guided conversational intake for organisations that prefer chat over form-filling. Collects:
1. Organisation description (iterative clarification)
2. Industry context and key challenges
3. Strategic objectives and constraints
4. Maturity self-assessment

At completion, synthesises a description for the standard workflow and triggers `clarifyStrategicIntent()`.

### 7.4 `enterDiscoveryModeForStep(step, message)` (line ~7743)

Sets `assistantMode = 'discovery'` with step context. Uses `AI_MODEL_CONFIG.discovery` (high reasoning effort) for all subsequent messages until mode changes. The AI persona is given the full step output and asked to act as a subject-matter expert discussing that specific result.

### 7.5 Assistant Modes

| Mode | Badge colour | Placeholder | AI Config |
|------|--------------|-------------|-----------|
| `discovery` | Purple | "Diskutera resultatet..." | `discovery` profile |
| `action` | Orange | "Beskriv ändringen..." | `action` profile |
| `general` | Grey | "Fråga Advicy Agent..." | `general` profile |

---

## 8. Model Views / Tabs

20 tabs in the application. All are managed by `showTab(tabId, btn)`.

| Tab ID | Label | Unlocked when | AI content |
|--------|-------|---------------|------------|
| `home` | Overview / Welcome | Always | Recent projects, role cards |
| `exec` | Executive | Always | Strategic Intent (Step 1) |
| `capmap` | Cap Map | Step 3 done | AS-IS or TO-BE capability map |
| `layers` | Architecture | Step 3 done | Value stream layers view |
| `heatmap` | Heatmap | Step 3 done | Capability prioritisation heatmap |
| `opmodel` | Op Model | Step 4 done | Operating Model Canvas + BMC |
| `insights` | Insights | Step 5 done | Gap analysis 4-lane layout |
| `maturity` | Maturity | Step 3 done | Maturity dashboard per domain |
| `targetarch` | Target Arch | Step 7a done | Target Architecture board |
| `roadmapvis` | Roadmap | Step 7b done | Gantt/timeline roadmap |
| `initiatives` | Initiatives | Step 7b done | Initiative cards |
| `cfo` | CFO | Step 3 done | Financial enrichment dashboard |
| `benchmarking` | Benchmarking | Step 3 done | AI benchmark comparison |
| `kpi` | KPIs | Step 3 done | KPI definitions |
| `dataexport` | Data Export | Step 3 done | Export controls |
| `narrative` | Narrative | Step 3 done | Auto-generated narrative |
| `scenarios` | Scenarios | Step 3 done | Scenario planning |
| `chat` | Chat | Always | Advicy Agent sidebar |
| `toolkit` | Toolkit | Always | EA2 Toolkit links |
| `settings` | Settings | Always | API key, language, preferences |

---

## 9. Context Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INPUT                                  │
│   description field ──or── Discovery Mode chat conversation      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ desc (string)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  PRE-STEP 0: _buildOptimizedStep1Prompt(desc)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  callAI(metaSys, metaUser, { taskType: 'lightweight' })  │   │
│  │  → window._stepPrompts   (7 industry-specific prompts)   │   │
│  │  → model.contextObj      (org classification)            │   │
│  │  → window._step1Hypothesis                               │   │
│  │  → window._step1Questions (4 MCQs)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLARIFICATION GATE: _showClarificationGate()                    │
│  → window._cgAnswers   (user's 4 MCQ answers)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: clarifyStrategicIntent()                               │
│  sys = window._stepPrompts.step_1 + JSON schema                 │
│  usr = desc + clarification answers                             │
│  → model.strategicIntent  (confirmed by user)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ model.strategicIntent
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: generateBMC()                                          │
│  sys = window._stepPrompts.step_2                               │
│  usr = desc + intentCtx2 (from model.strategicIntent)           │
│  → model.bmc (target) + model.bmc_current + model.bmc_analysis  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ model.bmc
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: generateArchitecture() — 3 calls                       │
│  Call 1: sys=step_3 prompt, usr=desc+intentPrefix+bmcPrefix     │
│          → model.capabilities[], valueStreams[], systems[]       │
│  Call 2: _enrichCapabilityFinancials() [parallel]               │
│          → financial fields on each capability                   │
│  Call 3: _generateAIBenchmark() [parallel]                      │
│          → model.aiBenchmark                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ model.capabilities
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: generateOperatingModel()                               │
│  sys = step_4 prompt                                            │
│  usr = siBlock + bmcBlock + capSample                           │
│  → model.operatingModel                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: analyseGaps() → requestDynamicGapAnalysis()            │
│  sys = step_5 prompt                                            │
│  usr = _buildStepContext(5)  ← FULL STEPS 1–4 SUMMARY          │
│  → model.gapAnalysisRaw, model.gapAnalysisDone                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: generateValuePools()                                   │
│  sys = step_6 prompt                                            │
│  usr = _buildStepContext(6) + all capabilities                  │
│  → model.valuePools[]                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7a: generateTargetArch()                                  │
│  sys = 'Return ONLY valid JSON array...'                        │
│  usr = siBlock + strategicDirection + model.capabilities        │
│  → model.targetArch[]                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7b: generateRoadmap()                                     │
│  sys = step_7 prompt                                            │
│  usr = siBlock + vpBlock(6) + gapBlock(5) + capContext(7a)      │
│  → model.initiatives[] + model.roadmapPhaseGates                │
└─────────────────────────────────────────────────────────────────┘

Every callAI call also receives (always-on, injected by callAI itself):
  → buildMasterDataPromptContext()  (industry, areas, masterData fields)
  → Language instruction            (if app language ≠ 'en')
```

---

## 10. Known Patterns & Problems

### 10.1 Monolithic Context Assembly

Each step assembles its context inline with duplicated code. Steps 3 and 4 build `intentPrefix`/`bmcPrefix` independently from each other and from `_buildStepContext`. There is no single "context contract" — the shape and completeness of injected context differs per step.

**Target:** Define a canonical `StepContext` object with typed fields that is constructed once and passed to all step prompt builders.

### 10.2 Fragile JSON Parser

`extractJSON()` uses a simple regex + bracket-finding heuristic. If a model response includes explanatory prose before or around the JSON block, the parser may return malformed JSON, causing `JSON.parse()` to throw.

**Target:** Use a dedicated JSON extraction library or request JSON-mode responses from the API consistently.

### 10.3 Global Mutable State (`model`)

`model` is a plain JavaScript object — no immutability, no rollback capability. Step 3 directly merges via `model = { ...model, ...struct }`, which can silently overwrite manually-edited fields.

**Target:** Add versioned snapshots before each step's AI write; allow rollback to any prior snapshot.

### 10.4 Silent Pre-Step Failure

`window._stepPrompts` is set to `{}` (empty object) if Pre-Step 0 fails. All subsequent steps silently fall back to generic prompts. There is no user-visible indication that the prompt optimiser failed.

**Target:** Show a warning card in the chat sidebar if the context engine call fails. Log which steps are using fallback prompts.

### 10.5 No Dependency Graph

Steps do not formally declare their dependencies. Step 7b uses Step 6 value pools and Step 5 gaps, but this is encoded only in the user prompt string. If the user skips Step 5/6 and jumps to Step 7b, the prompt simply omits those blocks silently.

**Target:** Define an explicit dependency graph. Each step module should declare `requiredSteps: ['step1', 'step2', 'step3']` and render a blocking gate if a required step is incomplete.

### 10.6 No Retry Logic

All `callAI` calls have a single try/catch with no retry. A timeout or transient API error shows a toast and discards the call. For Step 3 (3 calls, 240 s timeout), a failure on Call 2 or 3 means the user must re-run the entire architecture generation.

**Target:** Add exponential backoff retry (max 2 retries) for transient errors. For parallel calls (Steps 3 Calls 2+3), add individual failure handling.

### 10.7 No Partial Recovery for Parallel Calls

Step 3's `Promise.allSettled()` correctly catches individual failures. However, if Call 1 (structure) fails, the function throws immediately without attempting Calls 2 and 3 — even though they are independent.

### 10.8 Context Size Growth

`_buildStepContext(6)` for Step 6 includes summaries of Steps 1–5 plus all capability objects. For large deep-mode architectures (20 capabilities × full financial objects), this can approach 6,000–8,000 tokens in the user prompt, on top of the system prompt and master data context.

**Target:** Implement a context compression pass — summarise prior steps to their essential fields only, trim financial objects to `name + totalAnnualValue + strategicImportance`.

---

## 11. AI Call Inventory

Complete catalogue of all 18 AI calls in the platform.

| # | Function | Step | Task Type | Temp | Timeout | System Prompt Source | Primary Output |
|---|----------|------|-----------|------|---------|---------------------|----------------|
| 0 | `_buildOptimizedStep1Prompt` | Pre-1 | `lightweight` | 0.5 | 60 s | Hardcoded meta-prompt | `window._stepPrompts`, `model.contextObj` |
| 1 | `clarifyStrategicIntent` | 1 | `lightweight` | 0.3 | 60 s | `_stepPrompts.step_1` + JSON schema | `model.strategicIntent` |
| 2 | `generateBMC` | 2 | `heavy` | 0.2 | 240 s | `_stepPrompts.step_2` | `model.bmc`, `model.bmc_current`, `model.bmc_analysis` |
| 3 | `generateArchitecture` (Call 1) | 3 | `heavy` | 0.2–0.4 | 180–240 s | `_stepPrompts.step_3` | `model.capabilities`, `model.valueStreams`, `model.systems` |
| 4 | `_enrichCapabilityFinancials` (Call 2) | 3 | `analysis` | 0.4 | 180 s | Static | Financial fields on capabilities |
| 5 | `_generateAIBenchmark` (Call 3) | 3 | `analysis` | 0.4 | 180 s | Static | `model.aiBenchmark` |
| 6 | `generateOperatingModel` | 4 | `heavy` | 0.2 | 240 s | `_stepPrompts.step_4` | `model.operatingModel` |
| 7 | `requestDynamicGapAnalysis` | 5 | `analysis` | 0.4 | 180 s | `_stepPrompts.step_5` | `model.gapAnalysisRaw` |
| 8 | `generateValuePools` | 6 | `heavy` | 0.2 | 240 s | `_stepPrompts.step_6` | `model.valuePools` |
| 9 | `generateTargetArch` | 7a | `heavy` | 0.2 | 240 s | Hardcoded static | `model.targetArch` |
| 10 | `generateRoadmap` | 7b | `heavy` | 0.2 | 240 s | `_stepPrompts.step_7` | `model.initiatives`, `model.roadmapPhaseGates` |
| 11 | `generateCapabilityMapToBe` | — | `heavy` | 0.2 | 240 s | Static | `model.capabilities_tobe` |
| 12 | `generateCxOSummary` (gap) | — | `discovery` | 0.7 | 180 s | Dynamic per context | CxO narrative modal |
| 13 | `generateCxOSummary` (maturity) | — | `discovery` | 0.7 | 180 s | Dynamic per context | CxO narrative modal |
| 14 | `generateCxOSummary` (benchmarking) | — | `discovery` | 0.7 | 180 s | Dynamic per context | CxO narrative modal |
| 15 | `enterDiscoveryModeForStep` | Chat | `discovery` | 0.7 | 180 s | `AdvisyAI.buildSystemPrompt()` | Chat response |
| 16 | `handleGeneralQuestion` | Chat | `general` | 0.6 | 120 s | `AdvisyAI.buildSystemPrompt()` | Chat response |
| 17 | UI Translation | — | `lightweight` | 0.3 | 60 s | Static | Translated UI strings |

---

## 12. Language Handling

### App Language Detection

```javascript
const APP_LANGUAGE_KEY = 'ea_app_language';
const SUPPORTED_APP_LANGUAGES = ['en', 'sv', 'no', 'da', 'fi'];
```

Language is stored in localStorage. Set to `'auto'` by default → detects from browser locale.

### Per-Call Language Injection

`callAI` appends a language instruction to every system prompt (omitted for English):

**For non-JSON responses:**
```
Response Language Policy:
- Respond in {lang}.
```

**For JSON responses** (detected if sys/user contains `"Return ONLY valid JSON"`):
```
Response Language Policy:
- Respond in {lang}.
- Keep required JSON keys, schema, and enum tokens exactly as requested.
- Translate only natural-language values.
```

### `UI_TRANSLATIONS`

A `UI_TRANSLATIONS` constant maps UI labels to all 5 supported languages. Used for static UI text. For dynamic content generation (AI outputs), language injection in `callAI` is used.

---

## 13. Industry & Business Area Configuration

### Industry Profiles (`PHASE4_INDUSTRY_PROFILES`)

```javascript
{
  'generic':          { branch: 'generic',          benchPeer: 'Industry Peer Group A',      areas: ['general','operations','erp','finance'] },
  'startup':          { branch: 'startup',           benchPeer: 'Industry Peer Group A',      areas: ['general','operations','finance','itsm','cybersecurity'] },
  'domain-specific':  { branch: 'domain-specific',   benchPeer: 'Industry Peer Group A',      areas: ['general','operations','erp','finance','esg','itsm','cybersecurity'] },
  'fintech':          { branch: 'fintech',            benchPeer: 'Global Asset Management',    areas: ['general','operations','erp','finance','gdpr','cybersecurity'] },
  'industry-specific':{ branch: 'industry-specific', benchPeer: 'Industry Peer Group A',      areas: [...all] },
  'banking':          { branch: 'banking',            benchPeer: 'Global Asset Management',    areas: ['general','operations','erp','finance','gdpr','cybersecurity'] },
  'healthcare':       { branch: 'healthcare',         benchPeer: 'Public Housing (Sweden)',    areas: ['general','operations','erp','finance','gdpr','cybersecurity'] },
  'public-sector':    { branch: 'public-sector',      benchPeer: 'Public Housing (Sweden)',    areas: ['general','operations','erp','finance','esg','gdpr'] },
  'retail':           { branch: 'retail',             benchPeer: 'Industry Peer Group A',      areas: ['general','operations','erp','finance','itsm','gdpr'] },
  'insurance':        { branch: 'insurance',          benchPeer: 'Global Asset Management',    areas: ['general','operations','erp','finance','gdpr','cybersecurity'] }
}
```

### Business Area Baselines (`PHASE4_AREA_BASELINES`)

Maturity baseline scores (1–5) per industry per business area, used in benchmarking gap calculations:

| Industry | general | operations | erp | finance | esg | itsm | gdpr | cybersecurity |
|----------|---------|------------|-----|---------|-----|------|------|---------------|
| generic | 3.0 | 3.0 | 3.0 | 3.0 | 2.8 | 3.0 | 2.9 | 3.0 |
| startup | 2.8 | 3.1 | 2.7 | 3.0 | 2.5 | 3.3 | 2.6 | 3.1 |
| domain-specific | 3.1 | 3.4 | 3.3 | 3.3 | 3.3 | 3.2 | 3.0 | 3.2 |
| fintech | 3.3 | 3.5 | 3.2 | 3.8 | 2.9 | 3.3 | 3.7 | 3.9 |
| banking | 3.4 | 3.6 | 3.4 | 4.0 | 3.0 | 3.3 | 3.6 | 3.8 |
| healthcare | varies | varies | varies | varies | varies | varies | high | high |
| public-sector | varies | varies | varies | varies | high | varies | high | varies |

### Business Areas (`PHASE4_BUSINESS_AREAS`)

```javascript
['general', 'operations', 'erp', 'finance', 'esg', 'itsm', 'gdpr', 'cybersecurity']
```

Active areas from `model.phase4Config.activeBusinessAreas` are injected into every `callAI` via `buildMasterDataPromptContext()`.

---

## Appendix A — Modular Architecture Redesign Notes

This section captures the key decoupling opportunities identified during the documentation pass.

### Proposed Module Boundaries

Each workflow step should become a self-contained module with:

```typescript
interface StepModule {
  id: 'step0' | 'step1' | 'step2' | 'step3a' | 'step3b' | 'step3c' | 'step4' | 'step5' | 'step6' | 'step7a' | 'step7b';
  requiredInputs: StepField[];    // Fields from model that must exist before running
  produces: StepField[];          // Fields this step writes to model
  systemPrompt: (context: StepContext) => string;   // Pure function
  userPrompt: (context: StepContext) => string;     // Pure function
  taskType: keyof typeof AI_MODEL_CONFIG;
  outputSchema: JSONSchema;
  parseOutput: (raw: string) => StepOutput;         // Validated, typed
  applyOutput: (output: StepOutput, model: Model) => Model;  // Immutable update
}
```

### Context Contract

Replace all inline context assembly with a single `buildStepContext(stepId, model)` function that produces a typed `StepContext` object:

```typescript
interface StepContext {
  companyDescription: string;
  strategicIntent?: StrategicIntentOutput;
  bmc?: BMCOutput;
  capabilities?: Capability[];
  operatingModel?: OperatingModelOutput;
  gapAnalysis?: GapAnalysisOutput;
  valuePools?: ValuePool[];
  targetArch?: TargetArchItem[];
  masterData: MasterData;
  industry: string;
  businessAreas: string[];
  language: string;
  architectureMode: 'draft' | 'standard' | 'deep';
}
```

### Testability

Each step module's `systemPrompt()` and `userPrompt()` are pure functions — no DOM access, no global state reads. They can be unit-tested by passing mock `StepContext` objects and asserting prompt content.

`parseOutput()` and `applyOutput()` are similarly pure and testable independently from the AI call.

### Rollback

`applyOutput()` returns a new `model` object (immutable pattern). The runner stores `model` snapshots before each `applyOutput()` call, enabling one-click rollback to any prior state.

---

*End of EAV4_Architecture.md*
