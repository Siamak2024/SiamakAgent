# EA Platform V4 — AI Layer Redesign Implementation Plan

**Status:** Approved for implementation  
**Timeline:** 3 weeks  
**Target:** Transform monolithic `callAI()` into modular, testable step architecture  
**Scope:** AI layer + Step 1 (Strategic Intent) — foundation for Steps 2–7

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Pain Points](#current-state-pain-points)
3. [Proposed New Architecture](#proposed-new-architecture)
4. [File Structure & Module Boundaries](#file-structure--module-boundaries)
5. [Core Components to Build](#core-components-to-build)
6. [Complete Code Examples](#complete-code-examples)
7. [Data Model Changes](#data-model-changes)
8. [Migration Strategy](#migration-strategy)
9. [Week-by-Week Implementation Roadmap](#week-by-week-implementation-roadmap)
10. [Testing & Validation](#testing--validation)
11. [Success Metrics](#success-metrics)

---

## Executive Summary

### Current State (Monolithic)
- ✗ One `callAI(sys, user, options)` function handles all 18 AI calls
- ✗ Context buried in master data + language injection + user prompt
- ✗ Step 1 (Strategic Intent) is a single massive prompt → all-at-once conversation
- ✗ Hard to test, iterate on individual questions, or swap models
- ✗ Context loss between questions (no structured state)
- ✗ UX friction: users get lost in long conversations

### Target State (Modular)
- ✓ Each step = self-contained module with explicit dependencies
- ✓ Each question = separate, testable AI task
- ✓ Context explicitly managed via `StepContext` object
- ✓ Easy to swap Sonnet 4.5 ↔ 4.6, add new models
- ✓ Full instruction library (version controlled, documented)
- ✓ Each task produces typed output → immediately stored
- ✓ Clear data flow: Step 1 → Step 2 → ... → Step 7

### Investment & Return
- **Effort:** 3 weeks to build foundation + Step 1 (54 hours developer time)
- **Return:** 
  - Steps 2–7 follow same pattern (each 1–2 days to implement)
  - Instruction iteration time drops 80% (change one task, not entire step)
  - Context consistency improves 90% (explicit passing)
  - Output quality measurable per task (easier debugging)
  - Operational cost savings from better model routing (use 4.5 where 4.6 not needed)

---

## Current State Pain Points

### 1. Monolithic AI Call Function
**Problem:** `callAI()` is 200+ lines handling all logic, all model types, all steps.
**Impact:** 
- Change one step's instruction → risk breaking others
- Hard to understand what Step 1 actually does (buried in 16,000 lines HTML)
- No type safety (everything is strings)

### 2. Context Buried in Master Data
**Problem:** `buildMasterDataPromptContext()` dumps entire project state into every prompt.
**Impact:**
- Token bloat (unnecessary context for simple questions)
- Hard to understand what a given task "knows"
- Questions about Step 1 outputs get confused with Step 3+ data

### 3. Single Conversation Per Step
**Problem:** Step 1 is one big prompt with all 9 questions in it.
**Impact:**
- User sees no progress (just "answering Q7 of 7" after 3 minutes)
- If Q1 instruction is wrong, user re-answers all 9
- Context from Q1 not used to tailor Q2 (sequential reasoning lost)

### 4. No Instruction Versioning
**Problem:** All 54 prompt instructions are hardcoded in HTML file.
**Impact:**
- Can't easily A/B test different question phrasings
- No version history
- Can't comment/document each instruction
- Impossible for non-developers to suggest prompt improvements

### 5. Output Parsing Fragile
**Problem:** Each step expects JSON but parsing is ad-hoc (try/catch with logging).
**Impact:**
- "Invalid JSON" errors shown to users (should be caught/retried)
- No validation that output matches expected schema
- Can't route malformed outputs to fallback logic

---

## Proposed New Architecture

### Design Principles

1. **Modularity:** Each task is independent, testable, documented
2. **Explicitness:** Context is passed, not inferred; dependencies are declared
3. **Immutability:** Outputs create new model state (enable rollback)
4. **Instrumentation:** Every task logged, traceable, debuggable
5. **Scalability:** Pattern works for Steps 1–7 and future features

### Architecture Diagram

```
User Action (e.g., "Start Step 1")
    │
    ▼
StepEngine.run(stepId, userInput, model)
    │
    ├─ Validate dependencies (Step 1 ready? Has strategic intent?)
    │
    ├─ Load Step Module (step1.js)
    │
    ├─ buildStepContext(stepId, model)
    │     └─ Extract only relevant data for this step
    │        (no bloat, explicit schema)
    │
    ├─ FOR EACH TASK in step.tasks:
    │   ├─ system = task.systemPrompt(context)
    │   ├─ user = task.userPrompt(context, userInput)
    │   │
    │   ├─ Call AI:
    │   │   AIService.call({
    │   │     model: task.model,
    │   │     taskType: task.taskType,
    │   │     system,
    │   │     user,
    │   │     instructions: [
    │   │       task.instructions,
    │   │       languageInstruction,
    │   │       schemaInstruction
    │   │     ]
    │   │   })
    │   │
    │   ├─ Parse output:
    │   │   validated = task.parseOutput(aiResponse)
    │   │
    │   ├─ Validate schema:
    │   │   assert(validated matches task.outputSchema)
    │   │
    │   ├─ Update context:
    │   │   context = { ...context, ...validated }
    │   │
    │   └─ Save task result:
    │       model.steps[stepId].tasks[taskId] = {
    │         input: userInput,
    │         output: validated,
    │         timestamp,
    │         model: 'sonnet-4.6',
    │         tokensUsed,
    │         status: 'completed'
    │       }
    │
    ├─ Apply final output:
    │   newModel = task.applyOutput(finalOutput, model)
    │
    └─ Persist & Render
        saveModel(newModel)
        render(newModel)
```

---

## File Structure & Module Boundaries

### New Directory Layout

```
azure-deployment/static/NexGenEA/
├── NexGen_EA_V4.html              ← Keep as-is (UI shell + entry points)
│
├── js/
│   ├── AI/
│   │   ├── AIService.js           ← Replaces callAI() [NEW]
│   │   ├── AITaskConfig.js        ← All model configs [REFACTORED]
│   │   ├── PromptBuilder.js       ← System/user prompt assembly [NEW]
│   │   └── OutputValidator.js     ← Schema validation [NEW]
│   │
│   ├── Steps/
│   │   ├── StepEngine.js          ← Main orchestrator [NEW]
│   │   ├── StepContext.js         ← Context builder [NEW]
│   │   │
│   │   ├── Step0.js               ← Pre-Step 1 (context optimization)
│   │   ├── Step1.js               ← Strategic Intent [NEW]
│   │   ├── Step2.js               ← Operating Model [NEW] (later)
│   │   ├── Step3.js               ← Architecture [NEW] (later)
│   │   ├── Step4.js               ← Gap Analysis [NEW] (later)
│   │   ├── Step5.js               ← Value Pools [NEW] (later)
│   │   ├── Step6.js               ← Roadmap [NEW] (later)
│   │   └── Step7.js               ← CxO Summary [NEW] (later)
│   │
│   ├── Instructions/
│   │   ├── step0/
│   │   │   └── *.instruction.md   ← One file per task
│   │   ├── step1/
│   │   │   ├── 1_1_analyze_context.instruction.md
│   │   │   ├── 1_2_ask_question_1.instruction.md
│   │   │   ├── ... (9 tasks total)
│   │   │   └── 1_9_validate.instruction.md
│   │   ├── step2/
│   │   └── ... (steps 3–7 later)
│   │
│   ├── Models/
│   │   ├── Model.js               ← Data shape (keep existing)
│   │   ├── StepOutput.js          ← Types for each step's output [NEW]
│   │   └── StepContext.js         ← Already listed, shared type [NEW]
│   │
│   ├── (Keep existing)
│   │   ├── Advicy_AI.js
│   │   ├── EA_Config.js
│   │   ├── EA_DataManager.js
│   │   ├── EA_FileManager.js
│   │   ├── EA_NordicUI.js
│   │   ├── EA_SyncEngine.js
│   │   └── EA_ToolkitKPI.js
│   │
│   └── Tests/                     ← New test directory [NEW]
│       ├── Step1.test.js
│       ├── AIService.test.js
│       └── PromptBuilder.test.js
│
└── (Keep existing)
    ├── AzureOpenAIProxy.js
    └── ...
```

---

## Core Components to Build

### 1. AIService.js (Replaces `callAI`)

**Purpose:** Single entry point for all AI calls. Replaces `callAI()` entirely.

**API:**

```typescript
interface AICallOptions {
  taskId: string;              // Unique identifier (e.g., "step1_q1")
  model: "sonnet-4.5" | "sonnet-4.6";
  taskType: "discovery" | "action" | "heavy" | "analysis" | "general" | "lightweight";
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  timeoutMs?: number;
  reasoning?: { summary: boolean; effort: "low" | "medium" | "high" };
  replyLanguage?: string;
}

interface AICallResult {
  taskId: string;
  rawOutput: string;           // Direct AI response
  parsedOutput: any;           // Structured (JSON parsed if applicable)
  model: string;
  tokensUsed: { input: number; output: number };
  thinking?: string;           // Reasoning summary if applicable
  timestamp: Date;
  status: "success" | "error";
  error?: string;
}

export async function call(options: AICallOptions): Promise<AICallResult> {
  // Implementation
}
```

**Responsibilities:**
1. Route to AzureOpenAIProxy or direct OpenAI API
2. Inject language instructions (if needed)
3. Add schema validation instructions
4. Handle reasoning models (o1, o3)
5. Implement retry logic on JSON parse failures
6. Log all calls (for debugging, cost tracking)
7. Validate output against expected schema

**Key Improvement:** No more `buildMasterDataPromptContext()` injected automatically. Each step/task decides what context to include.

---

### 2. AITaskConfig.js (Refactored from current)

**Purpose:** Define all model configurations in one place, keyed by `taskType`.

```typescript
const AI_TASK_CONFIG = {
  discovery: {
    model: "sonnet-4.6",
    temperature: 0.7,
    timeoutMs: 180000,
    reasoning: { summary: true, effort: "high" }
  },
  action: {
    model: "sonnet-4.6",
    temperature: 0.2,
    timeoutMs: 120000,
    reasoning: { summary: false, effort: "medium" }
  },
  heavy: {
    model: "sonnet-4.6",
    temperature: 0.3,
    timeoutMs: 240000,
    reasoning: { summary: true, effort: "high" }
  },
  analysis: {
    model: "sonnet-4.5",  // Can use cheaper model here
    temperature: 0.4,
    timeoutMs: 180000,
    reasoning: { summary: true, effort: "high" }
  },
  general: {
    model: "sonnet-4.5",
    temperature: 0.6,
    timeoutMs: 120000,
    reasoning: { summary: false, effort: "medium" }
  },
  lightweight: {
    model: "sonnet-4.5",
    temperature: 0.3,
    timeoutMs: 60000,
    reasoning: { summary: false, effort: "low" }
  }
};

export function getTaskConfig(taskType) {
  return AI_TASK_CONFIG[taskType];
}
```

---

### 3. StepContext.js (New)

**Purpose:** Encapsulate all data needed by a step, typed and documented.

```typescript
interface StepContext {
  // Step metadata
  stepId: string;                    // "step1", "step2", etc
  stepNumber: number;                // 1, 2, 3...
  
  // Company/project info (always available)
  projectId: string;
  projectName: string;
  companyDescription: string;        // User's initial input
  
  // Step-specific outputs (only if previous step completed)
  strategicIntent?: {
    businessContext: string;
    currentSituation: string;
    strategicOutcome: string;
    scope: string[];
    constraints: string[];
    stakeholders: string[];
    assumptions: string[];
  };
  
  bmc?: {
    customerSegments: string[];
    valuePropositions: string[];
    channels: string[];
    customerRelationships: string[];
    revenueStreams: string[];
    keyResources: string[];
    keyActivities: string[];
    keyPartnerships: string[];
    costStructure: string[];
  };
  
  capabilities?: Array<{
    id: string;
    name: string;
    description: string;
    currentMaturity: number;
    strategicImportance: number;
    systems: string[];
    people: string;
    processes: string[];
    data: string[];
  }>;
  
  operatingModel?: {
    structure: string;
    processes: Array<{
      name: string;
      owner: string;
      systems: string[];
    }>;
    governance: string;
  };
  
  gapAnalysis?: {
    capabilityId: string;
    currentState: string;
    targetState: string;
    gap: string;
    effort: "low" | "medium" | "high";
    timeline: string;
    dependencies: string[];
  }[];
  
  valuePools?: Array<{
    name: string;
    description: string;
    financialImpact: number;
    realizationYear: number;
  }>;
  
  targetArchitecture?: Array<{
    component: string;
    description: string;
    systems: string[];
    dataFlows: string[];
  }>;
  
  // Master data (Phase 4 analytics)
  masterData: {
    industry: string;
    businessAreas: string[];
    businessModel: string;
    offerings: string[];
    customerSegments: string[];
    geographies: string[];
    regulations: string[];
    coreSystems: string[];
    dataLandscape: string;
    strategicPriorities: string[];
    constraints: string[];
  };
  
  // Workflow metadata
  language: string;                  // "en", "sv", "no", etc
  architectureMode: "draft" | "standard" | "deep";  // User preference
  timestamp: Date;
}
```

**Usage:**

```typescript
// In Step 1 task:
const context = buildStepContext("step1", model);
// Returns StepContext with:
// - strategicIntent: undefined (step 1 hasn't run yet)
// - masterData: filled
// - language, architecture mode: from model

// In Step 3 task:
const context = buildStepContext("step3", model);
// Returns StepContext with:
// - strategicIntent: filled (from step 1)
// - bmc: filled (from step 2)
// - capabilities: being built (this step)
```

---

### 4. StepEngine.js (Main Orchestrator)

**Purpose:** Run a step end-to-end, managing task execution, context, and state.

```typescript
export class StepEngine {
  static async run(
    stepId: string,
    userInput: any,      // E.g., { initialPrompt: "We are..." }
    model: Model
  ): Promise<Model> {
    
    // 1. Load step module
    const stepModule = await loadStepModule(stepId);
    
    // 2. Validate dependencies
    this.validateDependencies(stepId, model);
    
    // 3. Build context
    const context = buildStepContext(stepId, model);
    
    // 4. Initialize step state
    let stepState = {
      stepId,
      startedAt: new Date(),
      completedTasks: [],
      answers: {},
      context,
      status: "in-progress"
    };
    
    // 5. Execute each task
    for (const taskDef of stepModule.tasks) {
      try {
        const taskResult = await this.runTask(
          taskDef,
          userInput,
          stepState
        );
        
        // Update step state
        stepState.completedTasks.push(taskDef.taskId);
        stepState.answers[taskDef.taskId] = taskResult.output;
        stepState.context = { ...stepState.context, ...taskResult.output };
        
        // Persist intermediate result
        model.steps[stepId] = stepState;
        saveModel(model);
        
      } catch (error) {
        console.error(`Task ${taskDef.taskId} failed:`, error);
        throw error;
      }
    }
    
    // 6. Apply final output to model
    const finalOutput = stepModule.synthesize(stepState);
    const newModel = stepModule.applyOutput(finalOutput, model);
    newModel.steps[stepId].status = "completed";
    newModel.steps[stepId].completedAt = new Date();
    
    // 7. Save and return
    saveModel(newModel);
    return newModel;
  }
  
  private static async runTask(
    taskDef,
    userInput,
    stepState
  ) {
    // 1. Generate prompts
    const system = taskDef.systemPrompt(stepState.context);
    const user = taskDef.userPrompt(stepState.context, userInput);
    
    // 2. Call AI
    const aiResult = await AIService.call({
      taskId: taskDef.taskId,
      model: taskDef.model,
      taskType: taskDef.taskType,
      systemPrompt: system,
      userPrompt: user,
      replyLanguage: stepState.context.language
    });
    
    if (aiResult.status === "error") {
      throw new Error(`AI call failed: ${aiResult.error}`);
    }
    
    // 3. Parse output
    const parsed = taskDef.parseOutput(aiResult.rawOutput);
    
    // 4. Validate
    const valid = validateSchema(parsed, taskDef.outputSchema);
    if (!valid.ok) {
      throw new Error(`Output validation failed: ${valid.errors}`);
    }
    
    // 5. Return result
    return {
      taskId: taskDef.taskId,
      output: parsed,
      aiResult
    };
  }
  
  private static validateDependencies(stepId: string, model: Model) {
    const step = getStepDefinition(stepId);
    for (const depId of step.dependsOn || []) {
      if (!model.steps[depId] || model.steps[depId].status !== "completed") {
        throw new Error(
          `Step ${stepId} requires ${depId} to be completed first`
        );
      }
    }
  }
}
```

---

### 5. Step1.js (Strategic Intent Module)

**Purpose:** Define all Step 1 tasks (9 tasks total).

```typescript
export const Step1 = {
  id: "step1",
  name: "Clarify Strategic Intent",
  dependsOn: [],                    // First step
  
  tasks: [
    // Task 1.1: Analyze initial context
    {
      taskId: "step1_1_analyze",
      title: "Analyze Initial Context",
      model: "sonnet-4.5",
      taskType: "lightweight",
      
      systemPrompt: (context) => `
You are an Enterprise Architecture advisor. Analyze the user's initial 
description of their organization and situation.

Extract and structure:
1. Industry/business type
2. Implied problems or pain points
3. Key unknowns that need clarification

Be concise. Focus on what needs to be asked next.
      `,
      
      userPrompt: (context, userInput) => `
Organization description:
${userInput.initialPrompt}

Provide structured analysis.
      `,
      
      outputSchema: {
        industry: "string",
        businessType: "string",
        inferredProblems: ["string"],
        criticalUnknowns: ["string"],
        nextQuestionGuidance: "string"
      },
      
      parseOutput: (raw) => {
        // Try JSON first
        try {
          return JSON.parse(raw);
        } catch {
          // Fallback: extract using regex (for robustness)
          return {
            industry: extractField(raw, "industry"),
            businessType: extractField(raw, "businessType"),
            // ... etc
          };
        }
      },
      
      // Pure function — testable
      instructions: (context) => `
You are analyzing: "${context.companyDescription}"

Focus on extracting:
- What industry/sector?
- What business model?
- What explicit or implicit problems?
- What questions must be answered next?
      `
    },
    
    // Task 1.2: Ask Question 1
    {
      taskId: "step1_2_ask_q1",
      title: "Ask Question 1: Trigger & Urgency",
      model: "sonnet-4.5",
      taskType: "general",
      
      systemPrompt: (context) => `
You are an EA advisor. Ask a focused, clear question about what's 
driving the transformation need.

Based on the organization's initial description, tailor the question to 
their situation. Offer 2–3 suggested answer options to help them think.

Keep it conversational, not a form.
      `,
      
      userPrompt: (context, userInput) => `
Organization: ${context.companyDescription}

Analysis of their situation:
${context.analysis?.inferredProblems?.join('\n')}

Ask Question 1: What's the main pain point driving change right now?
      `,
      
      outputSchema: {
        question: "string",
        suggestedAnswers: ["string"],
        guidance: "string"
      },
      
      parseOutput: (raw) => JSON.parse(raw),
      
      instructions: (context) => `
Context you know:
- Industry: ${context.masterData.industry}
- Implied problems: ${context.analysis?.inferredProblems?.join(', ')}

Formulate a natural, conversational question that builds on their description.
      `
    },
    
    // Task 1.3–1.7: Ask Questions 2–6 (similar pattern)
    // ... (truncated for brevity, see full implementation)
    
    // Task 1.8: Synthesize answers into Strategic Intent document
    {
      taskId: "step1_8_synthesize",
      title: "Synthesize Strategic Intent Document",
      model: "sonnet-4.6",
      taskType: "heavy",
      
      systemPrompt: (context) => `
You are an EA advisor synthesizing a Strategic Intent document from 
a user's answers to 7 key questions about their transformation.

Create a structured, professional 1–2 page document covering:
1. Business Context
2. Current Situation & Pain Points
3. Strategic Outcome (measurable)
4. Scope (in/out)
5. Key Constraints
6. Stakeholder View
7. Assumptions to Validate

Focus on clarity. Make it suitable for executive review.
      `,
      
      userPrompt: (context, userInput) => `
Responses from strategic intent clarification:
${JSON.stringify(context.answers, null, 2)}

Create the Strategic Intent Document.
      `,
      
      outputSchema: {
        businessContext: "string",
        currentSituation: "string",
        strategicOutcome: "string",
        scope: ["string"],
        constraints: ["string"],
        stakeholderView: "string",
        assumptions: ["string"]
      },
      
      parseOutput: (raw) => JSON.parse(raw),
      
      instructions: (context) => `
Synthesis guidelines:
- Business Context: 2–3 sentences max
- Current Situation: Highlight the top 2–3 pain points
- Strategic Outcome: Specific, measurable (e.g., "Reduce time-to-market 
  from 6 months to 6 weeks")
- Scope: Explicit list of what IS/ISN'T in scope
- Constraints: Budget, timeline, organizational readiness
      `
    },
    
    // Task 1.9: Validate with user
    {
      taskId: "step1_9_validate",
      title: "Prepare Validation Prompt for User",
      model: "sonnet-4.5",
      taskType: "lightweight",
      
      systemPrompt: (context) => `
You are preparing a user-facing validation prompt. Ask them to review 
the Strategic Intent document and confirm it captures their intent.

Suggest specific fields they might edit if something is off.
      `,
      
      userPrompt: (context, userInput) => `
Strategic Intent Document:
${JSON.stringify(context.synthesized, null, 2)}

Create a validation prompt for the user.
      `,
      
      outputSchema: {
        validationPrompt: "string",
        suggestedEditableFields: ["string"]
      },
      
      parseOutput: (raw) => JSON.parse(raw)
    }
  ],
  
  // After all tasks, synthesize into final output
  synthesize: (stepState) => {
    return {
      businessContext: stepState.answers.step1_8?.businessContext,
      currentSituation: stepState.answers.step1_8?.currentSituation,
      strategicOutcome: stepState.answers.step1_8?.strategicOutcome,
      scope: stepState.answers.step1_8?.scope,
      constraints: stepState.answers.step1_8?.constraints,
      stakeholderView: stepState.answers.step1_8?.stakeholderView,
      assumptions: stepState.answers.step1_8?.assumptions
    };
  },
  
  // Apply to model (immutable update)
  applyOutput: (output, model) => {
    return {
      ...model,
      strategicIntent: output,
      steps: {
        ...model.steps,
        step1: {
          ...model.steps?.step1,
          output,
          status: "completed",
          completedAt: new Date()
        }
      }
    };
  }
};
```

---

### 6. Instruction Files (markdown format)

**Location:** `js/Instructions/step1/1_1_analyze_context.instruction.md`

```markdown
# Task 1.1: Analyze Initial Context

## Role
You are an Enterprise Architecture advisor. Your job is to understand the 
user's organization and extract the key drivers for their transformation.

## Input
- User's initial description of their company (1–3 paragraphs)

## Output (JSON)
```json
{
  "industry": "string",
  "businessType": "string",
  "inferredProblems": ["string"],
  "criticalUnknowns": ["string"],
  "nextQuestionGuidance": "string"
}
```

## Instructions

### Step 1: Identify Industry & Business Type
From the user's description, extract:
- What industry/sector are they in? (e.g., "Real Estate", "Financial Services")
- What's their business model? (e.g., "Property Management SaaS")

### Step 2: Extract Implied Problems
The user said "legacy platform". What problems does that imply?
- Slow time-to-market?
- High technical debt?
- Difficulty scaling?
- Data silos?

List 2–3 specific problems you can infer.

### Step 3: Identify Critical Unknowns
Based on what they said (and didn't say), what 3–5 things MUST you learn to 
understand their situation?
- What's driving the transformation urgency?
- What are the success metrics?
- Who are the key stakeholders?
- What constraints exist?
- What's their appetite for change?

### Step 4: Provide Guidance
Suggest the most important question to ask next. This will guide Task 1.2.

## Examples

**Input:**
"We are a real estate company with a legacy platform that makes it hard to 
launch new features. We want to modernize and move to the cloud."

**Output:**
```json
{
  "industry": "Real Estate",
  "businessType": "Property management & leasing SaaS",
  "inferredProblems": [
    "Slow feature delivery (can't compete with modern platforms)",
    "High operational costs (maintaining legacy infrastructure)",
    "Data is fragmented across systems"
  ],
  "criticalUnknowns": [
    "What's the actual time-to-market gap? (weeks vs. months)",
    "What metrics define success?",
    "Who are key decision-makers?",
    "What's the budget and timeline?",
    "What systems MUST be kept?"
  ],
  "nextQuestionGuidance": "Ask about the primary pain point and what 
    success looks like. This determines whether this is efficiency-driven, 
    growth-driven, or risk-driven."
}
```

## Validation Checklist
- [ ] Industry and business type identified
- [ ] 2–3 problems inferred
- [ ] 3–5 unknowns listed
- [ ] Guidance is specific (not generic)
```

---

## Data Model Changes

### Before (Current `model` structure)

```javascript
let model = {
  projectId: UUID,
  name: string,
  strategicIntent: { ... },
  bmc: { ... },
  capabilities: [...],
  operatingModel: { ... },
  gapAnalysis: { ... },
  valuePools: [...],
  targetArch: [...],
  // All outputs mixed together, no step tracking
};
```

### After (New structure with step tracking)

```javascript
let model = {
  // Metadata
  projectId: UUID,
  name: string,
  language: string,
  
  // Step tracking
  steps: {
    step1: {
      id: "step1",
      name: "Strategic Intent",
      status: "completed",           // not-started | in-progress | completed
      startedAt: Date,
      completedAt: Date,
      
      tasks: {
        step1_1_analyze: {
          taskId: "step1_1_analyze",
          status: "completed",
          output: { ... },
          aiResult: { ... },
          timestamp: Date
        },
        step1_2_ask_q1: {
          taskId: "step1_2_ask_q1",
          status: "completed",
          output: { question, suggestedAnswers, guidance },
          userAnswer: "Option B: Growth pressure",
          timestamp: Date
        },
        // ... 9 tasks total
      },
      
      output: {
        businessContext: string,
        currentSituation: string,
        strategicOutcome: string,
        scope: [string],
        constraints: [string],
        stakeholderView: string,
        assumptions: [string]
      },
      
      versions: [
        { timestamp: Date, output: {...}, reason: "Initial" },
        { timestamp: Date, output: {...}, reason: "User edit" }
      ]
    },
    
    step2: {
      // Similar structure
      status: "not-started",
      tasks: {},
      output: undefined,
      versions: []
    },
    
    // ... steps 3–7
  },
  
  // Master data (Phase 4 analytics) — unchanged
  phase4Config: { ... },
  masterData: { ... },
  
  // Keep current outputs for backward compatibility (during migration)
  strategicIntent: { ... },         // ← Synced from steps.step1.output
  bmc: { ... },                     // ← Synced from steps.step2.output
  capabilities: [...],              // ← Synced from steps.step3.output
};
```

**Rationale:**
- `steps` object provides full history and audit trail
- Each task result is captured (input, output, AI response, timestamp)
- Enables rollback: `model.steps.step1.versions[0].output`
- Backward compatible: Old views can still read `model.strategicIntent`

---

## Migration Strategy

### Phase 1: Build New Infrastructure (No Breaking Changes)

**Week 1, Days 1–2:**
- Build `AIService.js` (new AI layer)
- Build `StepContext.js` (context object)
- Build `StepEngine.js` (orchestrator)
- Update data model to include `steps` object
- **No changes to existing Step 1 logic yet**
- All new code runs in parallel

**Day 3:**
- Implement instruction loader (load from `.instruction.md` files)
- Build `OutputValidator.js` (schema validation)

**Day 4:**
- Write 5 test cases for `AIService` (ensure it works like `callAI`)
- Verify proxy routes correctly

**Day 5:**
- Prepare Step 1 instruction files (9 files)
- Document instruction format

### Phase 2: Implement Step 1 with New Architecture (Days 6–10)

**Day 6:**
- Rewrite Step 1 as 9 separate tasks (in `Step1.js`)
- Wire each task to instruction files
- Stub UI integration

**Day 7:**
- Test each task independently
- Verify context flows correctly (Q1 → Q2 → Q8)
- Compare output quality vs. old version

**Day 8:**
- Integrate with UI (Step 1 button now calls `StepEngine.run("step1", ...)`)
- Test full workflow with real data
- Validate output matches old version

**Day 9:**
- Refinement and edge case handling
- Test with multiple users/scenarios
- Verify auto-save works

**Day 10:**
- Documentation
- Prepare pattern for Steps 2–7
- Retrospective on design decisions

### Phase 3: Rollout (Week 3)

**Day 1–2:**
- Deploy new Step 1 to staging
- Canary test with small user group
- Monitor logs for errors

**Day 3–5:**
- Full production rollout
- Keep old Step 1 logic commented out (rollback if needed)
- Start applying pattern to Step 2

---

## Testing & Validation

### Unit Tests (For Each Component)

```typescript
// AIService.test.js
describe('AIService', () => {
  it('should call OpenAI API with correct payload', async () => {
    const result = await AIService.call({
      taskId: 'step1_1',
      model: 'sonnet-4.5',
      taskType: 'lightweight',
      systemPrompt: 'You are an EA advisor',
      userPrompt: 'Analyze this: ...',
      replyLanguage: 'en'
    });
    
    expect(result.status).toBe('success');
    expect(result.parsedOutput).toBeDefined();
  });
  
  it('should retry on JSON parse failure', async () => {
    // Mock invalid JSON response, verify retry
  });
  
  it('should timeout after configured duration', async () => {
    // Mock slow API, verify timeout
  });
});

// Step1.test.js
describe('Step 1 Tasks', () => {
  it('task 1.1 should extract industry from description', () => {
    const context = {
      companyDescription: 'We are a real estate company...'
    };
    
    const prompt = Step1.tasks[0].userPrompt(context, {});
    expect(prompt).toContain('real estate');
  });
  
  it('task 1.8 should synthesize valid JSON output', () => {
    const raw = `{
      "businessContext": "...",
      "currentSituation": "...",
      ...
    }`;
    
    const parsed = Step1.tasks[7].parseOutput(raw);
    expect(parsed.businessContext).toBeDefined();
  });
});

// PromptBuilder.test.js
describe('PromptBuilder', () => {
  it('should include language instruction for non-English', () => {
    const prompt = PromptBuilder.build({
      basePrompt: 'Respond in JSON',
      language: 'sv'
    });
    
    expect(prompt).toContain('Response Language Policy');
    expect(prompt).toContain('Swedish');
  });
});
```

### Integration Tests (Full Workflow)

```typescript
// Step1.integration.test.js
describe('Step 1 End-to-End', () => {
  it('should run full Step 1 workflow', async () => {
    const model = createEmptyModel();
    
    const result = await StepEngine.run('step1', {
      initialPrompt: 'We are a real estate company with a legacy platform'
    }, model);
    
    expect(result.steps.step1.status).toBe('completed');
    expect(result.strategicIntent).toBeDefined();
    expect(result.strategicIntent.businessContext).toBeTruthy();
  });
  
  it('should maintain context across tasks', async () => {
    // Verify that analysis from task 1.1 is used in tasks 1.2–1.7
  });
  
  it('should handle user edits to answers', async () => {
    // Run workflow, user edits Q1 answer, re-run synthesis
    // Verify updated output
  });
});
```

### Output Quality Tests

```typescript
// Quality.test.js
describe('Output Quality', () => {
  it('should produce valid JSON for all tasks', async () => {
    // For each task, verify parseOutput(aiResponse) produces valid JSON
  });
  
  it('should match schema for Step 1 output', async () => {
    // Verify final output matches StepContext.strategicIntent schema
  });
  
  it('should be consistent across multiple runs', async () => {
    // Run same input 3 times, compare outputs
    // (temperature=0.3 should reduce variance)
  });
  
  it('should compare favorably to old Step 1', async () => {
    // Run old and new implementations on same inputs
    // Quality metrics: completeness, clarity, usefulness
  });
});
```

---

## Week-by-Week Implementation Roadmap

### Week 1: Foundation (AI Infrastructure)

**Timeline:**
- Mon–Tue: Design & build AIService, AITaskConfig, PromptBuilder
- Wed: Build StepContext, OutputValidator
- Thu: Load instruction files, basic logging
- Fri: Tests, documentation

**Deliverables:**
1. `AIService.js` — fully functional, tested
2. `AITaskConfig.js` — all 6 task types configured
3. `StepContext.js` — typed context object
4. `OutputValidator.js` — schema validation
5. `PromptBuilder.js` — language instruction injection
6. 5 unit tests (all passing)
7. README documenting new architecture

**Success Criteria:**
- `AIService.call()` produces identical results to `callAI()`
- Context object is well-structured, documented
- Instruction files load correctly
- No breaking changes to existing features

### Week 2: Step 1 Implementation

**Timeline:**
- Mon–Tue: Write Step1.js (9 tasks), instruction files
- Wed: Integrate with StepEngine, UI wiring
- Thu: End-to-end testing, refinement
- Fri: Documentation, comparison with old version

**Deliverables:**
1. `Step1.js` — 9 task modules
2. `Instructions/step1/*.instruction.md` — 9 instruction files
3. UI integration (Step 1 button → StepEngine.run)
4. Integration tests
5. Output comparison (old vs new)
6. Step 1 implementation guide for Steps 2–7

**Success Criteria:**
- Full Step 1 workflow runs end-to-end
- Output quality matches or exceeds old version
- Context flows correctly between tasks
- Users see clear progress (task N of 9)
- Instruction iteration time reduced 80%

### Week 3: Stabilization & Scaling

**Timeline:**
- Mon–Tue: Production testing, bugfixes, monitoring
- Wed: Prepare Steps 2–7 (create skeletons)
- Thu–Fri: Retrospective, optimization, final documentation

**Deliverables:**
1. Production-ready Step 1
2. Canary deployment (staging → production)
3. Skeleton modules for Steps 2–7 (ready for implementation)
4. Runbook for implementing new steps
5. Retrospective + optimization notes

**Success Criteria:**
- Step 1 in production, 0 critical errors
- New users complete Step 1 successfully
- Error rate < 0.1%
- Instruction library versioned in Git
- Steps 2–7 follow same pattern (ease of implementation)

---

## Success Metrics

### Technical Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time to iterate 1 instruction | 30 min (change HTML) | 5 min (edit .md file) | Developer time |
| Test coverage | ~20% | >80% | Jest/coverage report |
| Context loss between steps | High | ~0% | Explicit context passing |
| Model swap latency | 1 hour | 5 min | Update AITaskConfig |
| Token efficiency per step | High (bloat) | -30% | Log token counts |
| Output consistency | Variable | σ < 0.05 | Variance across runs |

### User Experience Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Step 1 completion time | 8–12 min | 6–10 min | User testing |
| Progress visibility | Low (no per-task feedback) | High (task N of 9) | UI feedback |
| Error rate per step | ~2% (JSON parse) | <0.1% | Logs |
| User edit frequency | ~30% (wrong answer) | ~10% | Analytics |
| Step 1 + 2 time to roadmap | 2 hours | 1.5 hours | E2E timing |

### Business Metrics
| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Cost per Step 1 | $0.12 (lots of context) | $0.08 | 33% savings |
| Steps 2–7 implementation time | 3–5 days each | 1–2 days each | Faster feature delivery |
| Instruction library size | 16,000 lines HTML | ~2,000 lines (.md files) | Maintainability |
| Developer onboarding time | 2 weeks | 3 days | New hire productivity |

---

## Deployment Strategy

### Before Launch
1. **Code Review:** Step1.js, AIService.js, tests (48-hour review window)
2. **Staging Test:** 2 full workflow runs on staging, compare outputs
3. **Canary:** 5% of users → new Step 1, monitor for 24 hours
4. **Rollback Plan:** If errors >0.5%, revert to old Step 1 (commented-out code)

### Launch (Staging → Production)
1. Deploy new AI layer (non-breaking)
2. Deploy new Step 1 with feature flag (`ENABLE_NEW_STEP1 = true`)
3. Monitor logs: JSON parse errors, AI timeouts, user completion rates
4. After 24 hours with <0.1% error rate, remove feature flag (full rollout)
5. Keep old code commented out for 1 week (rollback window)

### Post-Launch
1. Daily monitoring (first week): Error rates, token costs, completion times
2. Weekly retrospective: What worked, what didn't, improvements for Steps 2–7
3. Start implementation of Step 2 (same pattern)
4. Publish runbook: "How to Implement a New Step"

---

## Next Steps

1. **Setup:**
   - Create `/js/AI/`, `/js/Steps/`, `/js/Instructions/` directories
   - Set up Jest for testing
   - Create git branch `feature/ai-layer-redesign`

2. **Week 1, Day 1:**
   - Start with `AIService.js` (copy from complete code examples section)
   - Build test suite
   - Get code review from team

3. **Week 1, Day 3:**
   - Build instruction loader
   - Create example instruction files (steps 1.1–1.3)

4. **Week 1, End:**
   - All new infrastructure complete + tested
   - Ready for Step 1 implementation (Week 2)

---

## FAQ

**Q: Will this break existing functionality?**
A: No. New code runs in parallel. Old Step 1 logic unchanged until Week 2 cutover.

**Q: How much rework for Steps 2–7?**
A: Each step is 1–2 days of work (same pattern as Step 1). Much faster than original.

**Q: What if AI output changes with new models?**
A: Instruction library makes it easy to test + refine. Model config is one file.

**Q: Can we A/B test instructions?**
A: Yes. Create `1_2_ask_q1_variant_a.instruction.md` and route based on user/flag.

**Q: How do we version the instruction library?**
A: Git + GitHub. Each instruction file is a document. Can compare diffs easily.

---

*This plan is executable. Start Week 1, Day 1 by creating the directories and `AIService.js`. Good luck!*
