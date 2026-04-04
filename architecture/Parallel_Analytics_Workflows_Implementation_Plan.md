# Parallel Analytics Workflows with Shared Context
## Decision Intelligence, Scenarios, Financial, Optimize

**Architecture:** Parallel processes (separate AI layers) + Shared context model  
**Availability:** Always accessible (independent of workflow completion)  
**Data Flow:** Tabs feed from workflow + accept independent input  
**Reasoning Level:** Mix of analysis + reasoning per tab  
**Timeline:** 4 weeks after core workflow stable  

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Shared Context Model](#shared-context-model)
3. [Tab-by-Tab Design](#tab-by-tab-design)
4. [Parallel Workflow Engine](#parallel-workflow-engine)
5. [Data Synchronization](#data-synchronization)
6. [Implementation Timeline](#implementation-timeline)
7. [Testing Strategy](#testing-strategy)
8. [Copilot Implementation Guide](#copilot-implementation-guide)

---

## Architecture Overview

### Design Principle: "Always Available + Shared State"

```
Main Workflow (Steps 1–7)
├─ Runs independently
├─ Produces: strategicIntent, capabilities, gaps, roadmap, etc.
└─ Stores in model.steps.step1-7, model.strategicIntent, etc.
    ↓
Shared Context Layer (NEW)
├─ Built on-demand when user accesses any tab
├─ Pulls from: completed steps + master data + user preferences
├─ No new data collection required
└─ Can be built even if workflow incomplete (uses defaults/nulls)
    ↓
Parallel Analytics Workflows (4 tabs, independent)
├─ Decision Intelligence
│   ├─ Reads: capabilities, gaps, intent, masterData
│   ├─ Produces: prioritized initiatives, recommendations
│   └─ Can run anytime (workflow optional)
├─ Scenarios
│   ├─ Reads: capabilities, gaps, roadmap (if exists)
│   ├─ User input: scenario parameters (what-if changes)
│   ├─ Produces: alternative roadmaps, impact analysis
│   └─ Can run anytime, multiple times
├─ Financial
│   ├─ Reads: capabilities, gaps, valuePools, masterData
│   ├─ User input: budget constraints (optional)
│   ├─ Produces: cost models, ROI, financial scenarios
│   └─ Can run anytime
└─ Optimize
    ├─ Reads: capabilities, gaps, roadmap
    ├─ User input: optimization criteria (weights)
    ├─ Produces: alternative roadmaps, trade-off analysis
    └─ Can run anytime
```

### Key Design Decisions

1. **Parallel = Independent Workflows**
   - Each tab has own task sequence
   - Each tab can run without main workflow completion
   - Each tab produces independent outputs
   - Not sequential (don't depend on each other)

2. **Shared Context = Single Source of Truth**
   - All tabs read from same model data
   - If user updates main workflow, tabs see changes
   - If user runs tab independently (without workflow), uses provided/default data
   - Context builder handles both cases

3. **Always Available = No Workflow Gates**
   - User can click "Scenarios" on day 1 (workflow step 1)
   - Tab will work with whatever data exists
   - As workflow completes, tab results improve

---

## Shared Context Model

### AnalyticsContext Object (NEW)

```typescript
interface AnalyticsContext {
  // Metadata
  projectId: string;
  projectName: string;
  language: string;
  architectureMode: "draft" | "standard" | "deep";
  
  // From Main Workflow (Optional - may be null/incomplete)
  strategicIntent?: {
    businessContext: string;
    currentSituation: string;
    strategicOutcome: string;
    scope: string[];
    constraints: string[];
    stakeholders: string[];
    assumptions: string[];
  };
  
  capabilities?: Array<{
    id: string;
    name: string;
    description: string;
    currentMaturity: number;      // 1-5
    targetMaturity: number;       // 1-5
    strategicImportance: number;  // 1-5
    systems: string[];
    people: string;
    processes: string[];
    data: string[];
    dependsOn: string[];          // Other capability IDs
    financialImpact?: number;
  }>;
  
  gapAnalysis?: Array<{
    capabilityId: string;
    currentState: string;
    targetState: string;
    gap: string;
    effort: "low" | "medium" | "high";
    timeline: string;              // e.g., "6 months", "2 years"
    dependencies: string[];
    estimatedCost?: number;
  }>;
  
  valuePools?: Array<{
    name: string;
    description: string;
    financialImpact: number;      // Annual value, $
    realizationYear: number;      // Which year realized
    linkedCapabilities: string[]; // Which capabilities enable this
  }>;
  
  roadmap?: Array<{
    phase: number;                // 1, 2, 3...
    name: string;                 // "Phase 1: Foundation"
    initiatives: string[];        // Capability IDs
    timeline: string;             // "Months 0-6"
    estimatedCost?: number;
    expectedValue?: number;
  }>;
  
  operatingModel?: {
    structure: string;
    processes: Array<{
      name: string;
      owner: string;
      systems: string[];
      frequency: string;
    }>;
    governance: string;
  };
  
  // Master Data (Always available)
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
  
  // Workflow Completion Status (For UI/logic)
  workflowStatus: {
    step1_completed: boolean;
    step2_completed: boolean;
    step3_completed: boolean;
    step4_completed: boolean;
    step5_completed: boolean;
    step6_completed: boolean;
    step7_completed: boolean;
    completionPercentage: number; // 0-100
  };
  
  // Timestamp of last update
  lastUpdated: Date;
}
```

### AnalyticsContextBuilder (NEW)

```typescript
class AnalyticsContextBuilder {
  /**
   * Build context for analytics tabs
   * Includes data from completed workflow steps + defaults for incomplete steps
   */
  static buildContext(model: Model): AnalyticsContext {
    return {
      projectId: model.projectId,
      projectName: model.projectName,
      language: model.language,
      architectureMode: model.architectureMode,
      
      // Pull from workflow if completed, else undefined
      strategicIntent: model.steps?.step1?.status === 'completed' 
        ? model.steps.step1.output 
        : undefined,
      
      capabilities: model.steps?.step3?.status === 'completed'
        ? model.steps.step3.output.capabilities
        : undefined,
      
      gapAnalysis: model.steps?.step5?.status === 'completed'
        ? model.steps.step5.output.gapAnalysis
        : undefined,
      
      valuePools: model.steps?.step6?.status === 'completed'
        ? model.steps.step6.output.valuePools
        : undefined,
      
      roadmap: model.steps?.step7?.status === 'completed'
        ? model.steps.step7.output.roadmap
        : undefined,
      
      operatingModel: model.steps?.step4?.status === 'completed'
        ? model.steps.step4.output.operatingModel
        : undefined,
      
      // Master data always available
      masterData: model.masterData,
      
      // Workflow status (for UI)
      workflowStatus: {
        step1_completed: model.steps?.step1?.status === 'completed',
        step2_completed: model.steps?.step2?.status === 'completed',
        step3_completed: model.steps?.step3?.status === 'completed',
        step4_completed: model.steps?.step4?.status === 'completed',
        step5_completed: model.steps?.step5?.status === 'completed',
        step6_completed: model.steps?.step6?.status === 'completed',
        step7_completed: model.steps?.step7?.status === 'completed',
        completionPercentage: calculateCompletionPercentage(model.steps)
      },
      
      lastUpdated: new Date()
    };
  }
  
  /**
   * Enrich context with user-provided data (for independent runs)
   * E.g., user inputs budget constraints without completing workflow
   */
  static enrichWithUserInput(
    context: AnalyticsContext,
    userInput: any
  ): AnalyticsContext {
    return {
      ...context,
      // User input overrides defaults
      ...userInput,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Get context for specific tab (subset of full context)
   * Different tabs need different data
   */
  static getTabContext(context: AnalyticsContext, tabId: string): any {
    const contexts = {
      'decision-intelligence': {
        strategicIntent: context.strategicIntent,
        capabilities: context.capabilities,
        gapAnalysis: context.gapAnalysis,
        masterData: context.masterData,
        workflowStatus: context.workflowStatus
      },
      'scenarios': {
        capabilities: context.capabilities,
        gapAnalysis: context.gapAnalysis,
        roadmap: context.roadmap,
        operatingModel: context.operatingModel,
        masterData: context.masterData,
        workflowStatus: context.workflowStatus
      },
      'financial': {
        capabilities: context.capabilities,
        gapAnalysis: context.gapAnalysis,
        valuePools: context.valuePools,
        roadmap: context.roadmap,
        masterData: context.masterData,
        workflowStatus: context.workflowStatus
      },
      'optimize': {
        capabilities: context.capabilities,
        gapAnalysis: context.gapAnalysis,
        roadmap: context.roadmap,
        operatingModel: context.operatingModel,
        masterData: context.masterData,
        workflowStatus: context.workflowStatus
      }
    };
    
    return contexts[tabId] || contexts['decision-intelligence'];
  }
}
```

---

## Tab-by-Tab Design

### 1. Decision Intelligence Tab

**Purpose:** Analyze capabilities, identify priorities, guide strategy

**When Available:** Always (even with incomplete workflow)

**What It Does:**
- Analyzes capabilities by criticality, maturity, effort
- Identifies quick wins vs. transformation initiatives
- Generates strategic recommendations
- Prioritizes roadmap sequencing

**AI Reasoning:** Analysis + Light reasoning
- Analysis: Scoring and ranking capabilities
- Reasoning: Why this matters strategically

**Tasks (5 total):**

```
Task DI-1: Capability Health Assessment
├─ Input: capabilities, gaps, strategic intent
├─ Model: sonnet-4.5 (analysis)
├─ Task Type: "analysis"
└─ Output: {capabilityId, healthScore, maturityGap, criticality, status}

Task DI-2: Identify Quick Wins
├─ Input: capabilities ranked by DI-1, gaps
├─ Model: sonnet-4.5
├─ Task Type: "analysis"
└─ Output: [{ capabilityId, effort, impact, timeline, riskLevel }]

Task DI-3: Strategic Gap Analysis
├─ Input: strategic intent, gaps, capabilities
├─ Model: sonnet-4.6 (reasoning)
├─ Task Type: "discovery"
└─ Output: {criticalGaps, strategicImplications, recommendations}

Task DI-4: Sequencing Recommendation
├─ Input: capabilities, gaps, dependencies, effort
├─ Model: sonnet-4.5
├─ Task Type: "analysis"
└─ Output: [{ sequence, reasoning, parallelizableGroups, riskMitigation }]

Task DI-5: Executive Summary
├─ Input: All previous outputs
├─ Model: sonnet-4.6
├─ Task Type: "discovery"
└─ Output: {executiveSummary, topPriorities, criticalPath, risks}
```

**User Input (Optional):**
- Focus areas (which capabilities matter most?)
- Timeline constraints
- Risk tolerance
- Budget constraints (if Financial tab not run)

**Output:**
- Prioritized capability list
- Quick wins (do first)
- Critical path (longest chain)
- Executive summary
- Recommendations for sequencing

**UI Pattern:**
```
[Tab: Decision Intelligence]
├─ Status: 2 of 5 tasks complete (showing progress)
├─ Data coverage: "Strategic intent (✓), Capabilities (✓), Gaps (✓), Roadmap (○ not needed)"
├─ Results when complete:
│  ├─ Top 5 Priorities (card-based)
│  ├─ Quick Wins (list)
│  ├─ Critical Path (timeline)
│  ├─ Risk Summary
│  └─ Recommendations
└─ Actions: [Refine Input] [Export] [Copy to Main Roadmap]
```

---

### 2. Scenarios Tab

**Purpose:** Explore "what-if" alternatives, edge cases, resilience

**When Available:** Always (run with incomplete workflow too)

**What It Does:**
- User defines scenario (capability fails, timeline changes, budget constraints)
- AI models impact on other capabilities
- Recalculates roadmap under scenario
- Compares with main workflow result

**AI Reasoning:** Heavy reasoning + Analysis
- Reasoning: Understanding cascading effects, dependencies
- Analysis: Quantifying impact

**Tasks (6 total):**

```
Task SC-1: Scenario Definition & Validation
├─ Input: User scenario parameters, capabilities, dependencies
├─ Model: sonnet-4.5 (analysis)
├─ Task Type: "action"
└─ Output: {scenarioName, parameters, assumptions, constraints}

Task SC-2: Dependency Impact Analysis
├─ Input: Scenario parameters, capability dependency graph
├─ Model: sonnet-4.6 (reasoning - models complex chains)
├─ Task Type: "heavy"
└─ Output: {affectedCapabilities, cascadingEffects, severity, timeline}

Task SC-3: Resource Reallocation Model
├─ Input: Scenario, affected capabilities, roadmap
├─ Model: sonnet-4.5
├─ Task Type: "analysis"
└─ Output: {reallocations, bottlenecks, parallelizationOpportunities}

Task SC-4: Recalculate Roadmap
├─ Input: Original roadmap, scenario impacts, reallocation
├─ Model: sonnet-4.6 (reasoning - resequencing)
├─ Task Type: "heavy"
└─ Output: {newPhases, newTimeline, newCosts, newRisks}

Task SC-5: Compare vs. Main Roadmap
├─ Input: Original roadmap, scenario roadmap
├─ Model: sonnet-4.5
├─ Task Type: "analysis"
└─ Output: {differences, costImpact, timelineImpact, riskDelta}

Task SC-6: Resilience & Mitigation
├─ Input: Scenario, impacts, risks
├─ Model: sonnet-4.6 (reasoning)
├─ Task Type: "discovery"
└─ Output: {vulnerabilities, mitigationStrategies, contingencyPlans}
```

**User Input (Required):**
- Scenario type:
  - Capability failure: "What if System-A fails?"
  - Timeline delay: "What if Step 2 takes 6 months longer?"
  - Budget cut: "What if budget reduced by 30%?"
  - Market change: "What if regulation changes?"
  - Resource loss: "What if we lose the architecture team?"
- Severity/scope
- Timeline of scenario occurrence

**Output:**
- Scenario roadmap (alternative sequencing)
- Impact assessment (cost, timeline, scope changes)
- Resilience strategies (how to prevent/mitigate)
- Comparison with main roadmap (what changes, what stays)
- Recommendations (should we redesign the plan?)

**UI Pattern:**
```
[Tab: Scenarios]
├─ Scenario Builder (form)
│  ├─ Scenario Type: [Capability Failure v] [Timeline Delay] [Budget Cut] [Custom]
│  ├─ Select from: [List of capabilities/teams/risks]
│  ├─ When: [Start date picker] [Duration slider]
│  └─ [Run Scenario]
├─ Results (if scenario exists):
│  ├─ Impact Summary (card)
│  ├─ Affected Capabilities (list)
│  ├─ Alternative Roadmap (gantt/timeline)
│  ├─ vs. Main Roadmap (comparison)
│  └─ Resilience Strategies (recommendations)
└─ Actions: [Run Different Scenario] [Save As Template] [Export]
```

---

### 3. Financial Tab

**Purpose:** Model costs, ROI, value realization, financial trade-offs

**When Available:** Always (works with/without capability data)

**What It Does:**
- Estimates capability modernization costs
- Models financial impact over time
- Calculates ROI and payback period
- Explores financial scenarios (different sequencing, different budgets)

**AI Reasoning:** Analysis + Reasoning
- Analysis: Cost estimation, ROI calculation
- Reasoning: Understanding value drivers, financial trade-offs

**Tasks (6 total):**

```
Task FI-1: Capability Cost Estimation
├─ Input: Capabilities, gaps, effort estimates
├─ Model: sonnet-4.5 (analysis)
├─ Task Type: "analysis"
└─ Output: {capabilityId, capexEstimate, opexEstimate, effort, timeline}

Task FI-2: Gather Financial Constraints
├─ Input: User input (if provided), masterData
├─ Model: sonnet-4.5
├─ Task Type: "action"
└─ Output: {budgetConstraints, capexTarget, opexTarget, roi, paybackTarget}

Task FI-3: Value Pool Realization Model
├─ Input: Value pools, capabilities, timeline
├─ Model: sonnet-4.6 (reasoning - models value drivers)
├─ Task Type: "heavy"
└─ Output: {valueDrivers, realizationCurve, yearlyValue}

Task FI-4: Multi-Scenario Financial Model
├─ Input: Costs, value pools, different sequencing options
├─ Model: sonnet-4.6
├─ Task Type: "heavy"
└─ Output: {scenarios: [{name, sequence, costs, benefits, roi, payback}]}

Task FI-5: Cost-Benefit Analysis
├─ Input: All scenarios, constraints
├─ Model: sonnet-4.5
├─ Task Type: "analysis"
└─ Output: {recommendedSequence, tradeoffs, riskFactors, sensitivity}

Task FI-6: Financial Executive Summary
├─ Input: All financial outputs
├─ Model: sonnet-4.6
├─ Task Type: "discovery"
└─ Output: {summary, recommendations, topRisks, keyAssumptions}
```

**User Input (Optional):**
- Budget constraints (total capex, capex/year)
- ROI target (payback period, minimum annual return)
- Preference (optimize for cost, speed, or risk)
- Known cost data (if user has actual estimates)

**Output:**
- Cost breakdown (by capability, by phase)
- ROI projections (by year)
- Payback period
- Financial scenarios (different budgets, different sequencing)
- Recommendations (best financial path)

**UI Pattern:**
```
[Tab: Financial Analysis]
├─ Input Section (collapsible):
│  ├─ Total Budget: [input] (optional)
│  ├─ ROI Target: [input] (optional)
│  └─ [Run Analysis]
├─ Cost Summary (card):
│  ├─ Total Capex: $X
│  ├─ Total Opex (Year 1-3): $Y
│  ├─ By Phase breakdown
│  └─ Cost per capability
├─ Financial Charts:
│  ├─ Costs over time (stacked bar chart)
│  ├─ Value realization (S-curve)
│  ├─ ROI by scenario (comparison)
│  └─ Payback period (metric)
├─ Scenarios (tabs):
│  ├─ Scenario A: Best Cost
│  ├─ Scenario B: Best Speed
│  ├─ Scenario C: Best ROI
│  └─ Scenario D: Balanced
└─ Actions: [Change Assumptions] [Export Report] [Copy to Main]
```

---

### 4. Optimize Tab

**Purpose:** Find optimal roadmap given constraints/preferences

**When Available:** Always (works with incomplete workflow)

**What It Does:**
- User specifies optimization criteria (speed, cost, risk, value)
- AI finds optimal sequencing
- Suggests alternative roadmaps with different trade-offs
- Explains why each alternative is better at something

**AI Reasoning:** Heavy reasoning
- Reasoning: Constraint satisfaction, optimization, trade-off analysis
- May need reasoning model (o1) or optimization algorithm

**Tasks (5 total):**

```
Task OP-1: Optimization Criteria Definition
├─ Input: User weights (speed, cost, risk, value)
├─ Model: sonnet-4.5 (action)
├─ Task Type: "action"
└─ Output: {criteria, weights, constraints, objectives}

Task OP-2: Capability Interaction Graph
├─ Input: Capabilities, dependencies, masterData
├─ Model: sonnet-4.5
├─ Task Type: "analysis"
└─ Output: {dependencyGraph, parallelGroups, criticalPath, bottlenecks}

Task OP-3: Generate Alternative Roadmaps
├─ Input: Optimization criteria, interaction graph, constraints
├─ Model: o1 (reasoning model - best for optimization)
├─ Task Type: "heavy" (or use o1 reasoning=high)
└─ Output: [{ roadmapId, name, phases, explanation, metrics }] (3-5 alternatives)

Task OP-4: Analyze Trade-offs
├─ Input: Alternative roadmaps, original roadmap
├─ Model: sonnet-4.6
├─ Task Type: "analysis"
└─ Output: {tradeoffs: [{alternative, wins, loses, whenBetter}]}

Task OP-5: Recommendation & Rationale
├─ Input: All roadmaps, criteria, trade-offs
├─ Model: sonnet-4.6 (reasoning)
├─ Task Type: "discovery"
└─ Output: {recommended, rationale, alternatives, risks, assumptions}
```

**User Input (Required):**
- Optimization weights (sliders or radio buttons):
  - Maximize speed (get to end state fastest)
  - Minimize cost (lowest total investment)
  - Minimize risk (most conservative sequencing)
  - Maximize value (highest NPV/ROI)
  - Balanced (all equal weight)

**Output:**
- Top 3 alternative roadmaps with different optimizations
- Detailed comparison (cost, time, risk, value for each)
- Trade-off analysis ("Option A is 30% faster but 20% more expensive")
- Recommendation ("For your strategy, Option B is best because...")
- Sensitivity analysis (what changes if budget increases 10%?)

**UI Pattern:**
```
[Tab: Optimize]
├─ Optimization Criteria (sliders):
│  ├─ Speed: [=====] (0-100)
│  ├─ Cost: [===] (0-100)
│  ├─ Risk: [==] (0-100)
│  ├─ Value: [====] (0-100)
│  └─ [Optimize]
├─ Results (comparison):
│  ├─ Roadmap A: "Speed Optimized"
│  │  ├─ Timeline: 18 months (vs. 24 months baseline)
│  │  ├─ Cost: +$2M
│  │  ├─ Risk: Higher (parallel work)
│  │  └─ Best for: Fast transformation
│  │
│  ├─ Roadmap B: "Cost Optimized"
│  │  ├─ Timeline: 28 months (vs. 24 months baseline)
│  │  ├─ Cost: -$3M
│  │  ├─ Risk: Lower (sequential, safer)
│  │  └─ Best for: Budget constrained
│  │
│  ├─ Roadmap C: "Balanced"
│  │  ├─ Timeline: 24 months
│  │  ├─ Cost: Baseline
│  │  ├─ Risk: Moderate
│  │  └─ Best for: Healthy balance
│  │
│  └─ Recommendation: "Roadmap C matches your strategy best"
└─ Actions: [Adjust Weights] [Detailed Comparison] [Adopt Roadmap]
```

---

## Parallel Workflow Engine

### AnalyticsWorkflowEngine (NEW)

**Similar to StepEngine, but for parallel workflows**

```typescript
export class AnalyticsWorkflowEngine {
  /**
   * Run an analytics workflow end-to-end
   * @param tabId - "decision-intelligence", "scenarios", "financial", "optimize"
   * @param userInput - Tab-specific user input (or empty object)
   * @param model - Current model (for context)
   * @returns Promise<AnalyticsResult>
   */
  static async run(
    tabId: string,
    userInput: any,
    model: Model
  ): Promise<AnalyticsResult> {
    
    // 1. Load analytics context (from model + user input)
    const fullContext = AnalyticsContextBuilder.buildContext(model);
    const enrichedContext = AnalyticsContextBuilder.enrichWithUserInput(
      fullContext,
      userInput
    );
    const tabContext = AnalyticsContextBuilder.getTabContext(enrichedContext, tabId);
    
    // 2. Load tab module
    const tabModule = await this.loadTabModule(tabId);
    
    // 3. Validate that required data exists for this tab
    const validation = this.validateContextForTab(tabContext, tabId);
    if (!validation.valid) {
      // Warn user but continue (some fields may be missing)
      console.warn(`Tab ${tabId} running with incomplete data:`, validation.warnings);
    }
    
    // 4. Initialize tab state
    let tabState = {
      tabId,
      startedAt: new Date(),
      completedTasks: [],
      taskResults: {},
      context: tabContext,
      status: "in-progress",
      warnings: validation.warnings
    };
    
    // 5. Execute each task in sequence
    for (const taskDef of tabModule.tasks) {
      try {
        const taskResult = await this.runTask(
          taskDef,
          userInput,
          tabState
        );
        
        // Update tab state
        tabState.completedTasks.push(taskDef.taskId);
        tabState.taskResults[taskDef.taskId] = taskResult;
        tabState.context = { ...tabState.context, ...taskResult.output };
        
        // Persist intermediate result (so users see progress)
        await this.savTabState(tabId, model.projectId, tabState);
        
        // Fire progress callback
        this.fireProgressCallback({
          tabId,
          taskId: taskDef.taskId,
          completedTasks: tabState.completedTasks.length,
          totalTasks: tabModule.tasks.length,
          progress: Math.round(
            (tabState.completedTasks.length / tabModule.tasks.length) * 100
          )
        });
        
      } catch (error) {
        console.error(`Task ${taskDef.taskId} failed:`, error);
        tabState.status = "error";
        throw error;
      }
    }
    
    // 6. Synthesize final output
    const finalOutput = tabModule.synthesize(tabState);
    
    // 7. Build result
    const result = {
      tabId,
      status: "success",
      completedAt: new Date(),
      output: finalOutput,
      taskResults: tabState.taskResults,
      context: tabState.context,
      metadata: {
        totalTasks: tabModule.tasks.length,
        durationMs: Date.now() - tabState.startedAt.getTime(),
        modelUsed: this.getModelsUsed(tabState.taskResults),
        tokensUsed: this.getTotalTokens(tabState.taskResults)
      }
    };
    
    // 8. Save final result
    await this.saveTabResult(tabId, model.projectId, result);
    
    return result;
  }
  
  /**
   * Run a single task within a workflow
   */
  private static async runTask(taskDef: any, userInput: any, tabState: any) {
    // 1. Generate prompts
    const system = taskDef.systemPrompt(tabState.context);
    const user = taskDef.userPrompt(tabState.context, userInput);
    
    // 2. Call AI
    const aiResult = await AIService.call({
      taskId: taskDef.taskId,
      model: taskDef.model,
      taskType: taskDef.taskType,
      systemPrompt: system,
      userPrompt: user,
      replyLanguage: tabState.context.language
    });
    
    if (aiResult.status === "error") {
      throw new Error(`AI call failed: ${aiResult.error}`);
    }
    
    // 3. Parse output
    const parsed = taskDef.parseOutput(aiResult.rawOutput);
    
    // 4. Validate
    const valid = OutputValidator.validateSchema(parsed, taskDef.outputSchema);
    if (!valid.ok) {
      throw new Error(`Output validation failed: ${valid.errors.join(", ")}`);
    }
    
    // 5. Return
    return {
      taskId: taskDef.taskId,
      output: parsed,
      aiResult
    };
  }
  
  /**
   * Validate that context has required fields for this tab
   */
  private static validateContextForTab(context: any, tabId: string) {
    const requirements = {
      'decision-intelligence': ['capabilities', 'masterData'],
      'scenarios': ['capabilities', 'dependencies', 'masterData'],
      'financial': ['capabilities', 'masterData'],
      'optimize': ['capabilities', 'dependencies', 'masterData']
    };
    
    const required = requirements[tabId] || [];
    const missing = required.filter(field => !context[field]);
    const warnings = [];
    
    if (missing.length > 0) {
      warnings.push(`Missing: ${missing.join(", ")}. Tab will run with defaults.`);
    }
    
    // Check workflow completion status
    const { workflowStatus } = context;
    if (!workflowStatus.step1_completed) {
      warnings.push("Strategic intent not yet defined. Results will be generic.");
    }
    
    return {
      valid: missing.length === 0, // Valid if no missing required fields
      warnings
    };
  }
  
  /**
   * Progress callback (for UI)
   */
  private static progressCallback?: (progress: any) => void;
  
  static onProgress(callback: (progress: any) => void) {
    this.progressCallback = callback;
  }
  
  private static fireProgressCallback(progress: any) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}
```

### AnalyticsResult Interface

```typescript
interface AnalyticsResult {
  tabId: string;
  status: "success" | "error";
  completedAt: Date;
  
  output: any;  // Tab-specific output (varies by tab)
  
  taskResults: {
    [taskId: string]: {
      output: any;
      aiResult: AICallResult;
    }
  };
  
  context: AnalyticsContext;  // Full context used
  
  metadata: {
    totalTasks: number;
    durationMs: number;
    modelUsed: string[];
    tokensUsed: number;
  };
}
```

---

## Data Synchronization

### How Shared Context Stays In Sync

**Scenario 1: User completes workflow, then opens tab**
```
User completes Step 1–7
  → model.steps.step1.status = "completed"
  → model.steps.step3.status = "completed"
  → ... etc
  
User clicks "Decision Intelligence" tab
  → AnalyticsContextBuilder.buildContext(model)
  → Pulls model.strategicIntent, model.capabilities, model.gapAnalysis
  → All current
  → Results are based on latest workflow outputs ✓
```

**Scenario 2: User opens tab without completing workflow**
```
User on Step 2 (hasn't completed Step 3 yet)
  → model.steps.step3.status = "not-started" or "in-progress"
  
User clicks "Decision Intelligence" tab
  → AnalyticsContextBuilder.buildContext(model)
  → model.capabilities is undefined (Step 3 not done)
  → Returns: capabilities = undefined
  → Tab warning: "Strategic Intent and Capabilities not yet analyzed. Results will be generic."
  → Tab runs anyway (uses defaults/example data)
  → Results are preliminary ⚠️
```

**Scenario 3: User updates main workflow, tab results should update**
```
User completes Step 1–5 (has results)
User opens "Financial" tab, runs analysis
  → Stores result in model.analytics.financial[timestamp]
  
User goes back, updates strategic intent (Step 1)
User returns to Financial tab
  → Click "Refresh" button
  → AnalyticsContextBuilder.buildContext(model)
  → Pulls UPDATED strategicIntent
  → Re-runs workflow with new context
  → Old result still saved, new result generated ✓
```

### Data Storage Structure

```javascript
// New structure in model for analytics results
model.analytics = {
  'decision-intelligence': {
    latestResult: AnalyticsResult,
    history: [
      { timestamp: Date, result: AnalyticsResult },
      { timestamp: Date, result: AnalyticsResult },
      ...
    ]
  },
  'scenarios': {
    latestResult: AnalyticsResult,
    history: [...]
  },
  'financial': {
    latestResult: AnalyticsResult,
    history: [...]
  },
  'optimize': {
    latestResult: AnalyticsResult,
    history: [...]
  }
};

// Allows users to:
// - See latest results immediately
// - Compare results over time
// - Revert to earlier results
// - Track how recommendations changed as workflow evolved
```

---

## Implementation Timeline

### Pre-Work (Week 1–2, runs in parallel with Step 1–7 deployment)

**Day 1–2:** Design
- Finalize AnalyticsContext schema
- Design each tab's task sequence (list above)
- Create instruction templates

**Day 3–4:** Foundation
- Create AnalyticsWorkflowEngine.js
- Create AnalyticsContext.js + AnalyticsContextBuilder.js
- Create TabContext.js (builder for each tab's specific context)

**Day 5:** Tests + Docs
- Unit tests for AnalyticsContextBuilder
- Integration tests for AnalyticsWorkflowEngine with mock tab
- Documentation: how to add new analytics tabs

### Phase 1: Decision Intelligence Tab (Week 3–4)

**Day 1–2:**
- Create Decision.js module with 5 tasks
- Create instruction files (5 files)
- Write tests

**Day 3:**
- UI integration (tab button → AnalyticsWorkflowEngine.run)
- Progress indicator (Task 2 of 5...)
- Results rendering

**Day 4–5:**
- Staging deployment
- Canary test (5% of users)
- Fix issues, launch

### Phase 2: Financial Tab (Week 5)

**Day 1:** Create Financial.js module, instruction files
**Day 2:** Tests, UI integration
**Day 3:** Staging, canary, launch

### Phase 3: Scenarios Tab (Week 6–7)

**Day 1:** Create Scenarios.js module, instruction files
**Day 2–3:** More complex testing (scenario combinations)
**Day 4:** UI (scenario builder form)
**Day 5:** Launch

### Phase 4: Optimize Tab (Week 8)

**Day 1:** Create Optimize.js module
**Day 2:** Instruction files (most complex tab)
**Day 3:** Evaluate if o1 reasoning model needed
**Day 4:** Tests, UI
**Day 5:** Launch

**Total Timeline:** 4 weeks after core workflow stable

---

## Testing Strategy

### Unit Tests

```typescript
// AnalyticsContextBuilder.test.js
describe("AnalyticsContextBuilder", () => {
  it("should include completed workflow data in context", () => {
    const model = createMockModel({ step1_complete: true, step3_complete: true });
    const context = AnalyticsContextBuilder.buildContext(model);
    
    expect(context.strategicIntent).toBeDefined();
    expect(context.capabilities).toBeDefined();
  });
  
  it("should omit incomplete workflow data from context", () => {
    const model = createMockModel({ step1_complete: false, step3_complete: false });
    const context = AnalyticsContextBuilder.buildContext(model);
    
    expect(context.strategicIntent).toBeUndefined();
    expect(context.capabilities).toBeUndefined();
  });
  
  it("should allow user input to override context data", () => {
    const context = AnalyticsContextBuilder.buildContext(model);
    const enriched = AnalyticsContextBuilder.enrichWithUserInput(context, {
      budgetConstraints: { capex: 5000000 }
    });
    
    expect(enriched.budgetConstraints.capex).toBe(5000000);
  });
});

// AnalyticsWorkflowEngine.test.js
describe("AnalyticsWorkflowEngine", () => {
  it("should run decision intelligence workflow", async () => {
    const result = await AnalyticsWorkflowEngine.run(
      'decision-intelligence',
      {},
      mockModel
    );
    
    expect(result.status).toBe("success");
    expect(result.completedTasks.length).toBe(5);
    expect(result.output.topPriorities).toBeDefined();
  });
  
  it("should work with incomplete workflow data", async () => {
    const incompletModel = createMockModel({ step1_complete: false });
    const result = await AnalyticsWorkflowEngine.run(
      'decision-intelligence',
      {},
      incompleteModel
    );
    
    expect(result.status).toBe("success");
    expect(result.warnings.length > 0).toBe(true); // Should warn
  });
});
```

### Integration Tests

```typescript
// decision-intelligence.integration.test.js
describe("Decision Intelligence Tab End-to-End", () => {
  it("should rank capabilities by criticality", async () => {
    const result = await AnalyticsWorkflowEngine.run(
      'decision-intelligence',
      {},
      completeModel
    );
    
    expect(result.output.topPriorities.length).toBeGreaterThan(0);
    expect(result.output.topPriorities[0].criticality).toBeGreaterThanOrEqual(
      result.output.topPriorities[1].criticality
    );
  });
  
  it("should identify quick wins correctly", async () => {
    const result = await AnalyticsWorkflowEngine.run(
      'decision-intelligence',
      {},
      completeModel
    );
    
    const quickWins = result.output.quickWins;
    quickWins.forEach(win => {
      expect(win.effort).toBe("low");
      expect(win.impact).toBeGreaterThan(0);
    });
  });
});

// scenarios.integration.test.js
describe("Scenarios Workflow", () => {
  it("should model capability failure scenario", async () => {
    const userInput = {
      scenarioType: "capability-failure",
      capabilityId: "system-a",
      severity: "complete"
    };
    
    const result = await AnalyticsWorkflowEngine.run(
      'scenarios',
      userInput,
      completeModel
    );
    
    expect(result.output.affectedCapabilities.length).toBeGreaterThan(0);
    expect(result.output.newTimeline).toBeGreaterThan(
      completeModel.steps.step7.output.roadmap.duration
    );
  });
});
```

### Comparison Tests

```typescript
// All tabs should be compared against any existing implementation
describe("Financial Tab Comparison", () => {
  it("should match or exceed old financial model output", async () => {
    const newResult = await AnalyticsWorkflowEngine.run(
      'financial',
      { budgetConstraint: 5000000 },
      model
    );
    
    // If old implementation exists, compare
    // newResult.output.totalCost should match oldResult.totalCost within 5%
    // newResult.output.roi should match oldResult.roi within 5%
  });
});
```

---

## Copilot Implementation Guide

### Week 1–2: Foundation Infrastructure

#### Prompt 1: Create AnalyticsContext.js

```
Create js/Analytics/AnalyticsContext.js - shared context for all analytics tabs.

This is the central data structure that all 4 tabs read from.

Requirements:

1. Export AnalyticsContext interface/type with these fields:
   - projectId, projectName, language, architectureMode
   - strategicIntent (optional - from Step 1)
   - capabilities (optional - from Step 3)
   - gapAnalysis (optional - from Step 5)
   - valuePools (optional - from Step 6)
   - roadmap (optional - from Step 7)
   - operatingModel (optional - from Step 4)
   - masterData (always present)
   - workflowStatus (which steps are complete)
   - lastUpdated (timestamp)

2. Each optional field should be exactly as it appears in the workflow step output.
   For example, strategicIntent matches model.steps.step1.output.

3. Add JSDoc comments explaining what data each field contains and which tab uses it.

4. Export empty/default AnalyticsContext for testing.
```

#### Prompt 2: Create AnalyticsContextBuilder.js

```
Create js/Analytics/AnalyticsContextBuilder.js - builds context from model.

Requirements:

1. Static class AnalyticsContextBuilder with these methods:

   buildContext(model: Model): AnalyticsContext
   - Extract data from model.steps.step1-7
   - If step is complete, include its output
   - If step is incomplete, leave field undefined
   - Always include masterData + metadata
   - Return fully populated AnalyticsContext

   enrichWithUserInput(context, userInput): AnalyticsContext
   - Take base context and merge in user-provided data
   - User input takes priority (can override context)
   - Example: user provides budgetConstraints without completing workflow
   - Return enriched context

   getTabContext(context, tabId): Object
   - Given full AnalyticsContext, extract only what specific tab needs
   - For 'decision-intelligence': return {strategicIntent, capabilities, gapAnalysis, masterData, workflowStatus}
   - For 'scenarios': return {capabilities, gapAnalysis, roadmap, operatingModel, masterData, workflowStatus}
   - For 'financial': return {capabilities, gapAnalysis, valuePools, roadmap, masterData, workflowStatus}
   - For 'optimize': return {capabilities, gapAnalysis, roadmap, operatingModel, masterData, workflowStatus}
   - Different tabs need different data - be selective

   validateContextForTab(context, tabId): {valid: boolean, warnings: string[]}
   - Check required fields are present for this tab
   - Example: Financial tab requires capabilities, gapAnalysis, masterData
   - If missing optional fields, return warning but valid=true (tab can run with defaults)
   - Return warnings if workflow is incomplete (e.g., "Strategy not defined yet")

2. Add helper functions:
   - calculateWorkflowCompletionPercentage(steps)
   - inferDefaultValueIfMissing(field, masterData)
   - mergeContexts(baseContext, overrides)

3. Heavy comments - this is a critical contract between workflow and analytics.
```

#### Prompt 3: Create AnalyticsWorkflowEngine.js

```
Create js/Analytics/AnalyticsWorkflowEngine.js - orchestrates analytics workflows.

This is the main engine that runs the 4 analytics tabs.

Requirements:

1. Static class AnalyticsWorkflowEngine

2. Static async method: run(tabId, userInput, model)
   - tabId: "decision-intelligence", "scenarios", "financial", or "optimize"
   - userInput: user-provided data (varies by tab)
   - model: current model object
   - Returns: Promise<AnalyticsResult>

   Implementation:
   a) Build context: AnalyticsContextBuilder.buildContext(model)
   b) Enrich with user input: enrichWithUserInput(context, userInput)
   c) Load tab module: const tabModule = loadTabModule(tabId)
   d) Validate context for tab: validateContextForTab(context, tabId)
   e) Initialize tabState: { tabId, startedAt, completedTasks, taskResults, context, status }
   f) For each task in tabModule.tasks:
      - Call runTask(taskDef, userInput, tabState)
      - Update tabState with result
      - Fire progress callback
   g) Synthesize: tabModule.synthesize(tabState)
   h) Return AnalyticsResult object

3. Private static method: runTask(taskDef, userInput, tabState)
   - Generate prompts: system = taskDef.systemPrompt(context)
   - Call AI: AIService.call({taskId, model, taskType, systemPrompt, userPrompt})
   - Parse output: taskDef.parseOutput(aiResult.rawOutput)
   - Validate: OutputValidator.validateSchema(parsed, taskDef.outputSchema)
   - Return {taskId, output, aiResult}
   - Handle errors gracefully

4. Add progress callback:
   - onProgress(callback) - subscribe to progress updates
   - fireProgressCallback({tabId, taskId, completedTasks, totalTasks, progress%})

5. Export AnalyticsResult interface with fields:
   {tabId, status, completedAt, output, taskResults, context, metadata}

6. Heavy comments explaining the flow.
```

#### Prompt 4: Create TabContext.js (Shared utility)

```
Create js/Analytics/TabContext.js - helper for tab-specific context building.

Requirements:

1. For each of the 4 tabs, create a context builder:
   
   - DecisionIntelligenceContext.build(context)
     Returns subset: {strategicIntent, capabilities, gapAnalysis, masterData, workflowStatus}
   
   - ScenariosContext.build(context)
     Returns subset: {capabilities, gapAnalysis, roadmap, operatingModel, masterData, workflowStatus}
   
   - FinancialContext.build(context)
     Returns subset: {capabilities, gapAnalysis, valuePools, roadmap, masterData, workflowStatus}
   
   - OptimizeContext.build(context)
     Returns subset: {capabilities, gapAnalysis, roadmap, operatingModel, masterData, workflowStatus}

2. Each builder should include:
   - validateRequired() - check that required fields are present
   - addDefaults() - fill in sensible defaults if fields missing
   - sanitizeForAI() - prepare data for AI (remove sensitive info, compress large arrays)

3. Add comments explaining why each tab needs specific fields.

This is a thin layer - mostly delegates to AnalyticsContextBuilder, but allows
per-tab customization if needed later.
```

### Week 3–4: Decision Intelligence Tab

#### Prompt 5: Create Decision.js (Tab Module)

```
Create js/Analytics/Tabs/Decision.js - Decision Intelligence tab workflow.

This is the main module for the Decision Intelligence tab (5 tasks).

Requirements:

1. Export Decision object with:
   - id: "decision-intelligence"
   - name: "Decision Intelligence"
   - description: "Analyze capabilities, identify priorities, guide strategy"
   - dependsOn: [] (no dependencies - independent workflow)

2. Define 5 tasks in tasks[] array. Each task has:
   - taskId: "di-1", "di-2", ..., "di-5"
   - title: descriptive title
   - model: "claude-sonnet-4-5-20241022" or "claude-sonnet-4-20250514"
   - taskType: "analysis" or "discovery"
   - systemPrompt(context): returns instruction string (pure function)
   - userPrompt(context, userInput): returns question string (pure function)
   - outputSchema: {field: "type", ...}
   - parseOutput(raw): parse AI response to JSON
   - instructions(context): additional context-specific instructions

3. Tasks:
   
   Task DI-1: Capability Health Assessment
   - Input: capabilities array, gaps, strategic intent
   - Output: [{capabilityId, healthScore (0-100), maturityGap (1-5), criticality (1-5), status}]
   - Model: sonnet-4.5
   - TaskType: analysis
   
   Task DI-2: Identify Quick Wins
   - Input: capabilities scored by DI-1, gaps
   - Output: [{capabilityId, effort ("low"/"medium"/"high"), impact (0-100), timeline, riskLevel}]
   - Model: sonnet-4.5
   - TaskType: analysis
   
   Task DI-3: Strategic Gap Analysis
   - Input: strategic intent, capabilities, gaps
   - Output: {criticalGaps: string[], strategicImplications: string, recommendations: string[]}
   - Model: sonnet-4.6
   - TaskType: discovery
   
   Task DI-4: Sequencing Recommendation
   - Input: capabilities, gaps, dependencies, effort
   - Output: {sequence: [{phase, capabilityIds}], parallelizableGroups: string[][], riskMitigation: string}
   - Model: sonnet-4.5
   - TaskType: analysis
   
   Task DI-5: Executive Summary
   - Input: All previous outputs combined
   - Output: {executiveSummary: string, topPriorities: [{name, why}], criticalPath: string, recommendations: string[]}
   - Model: sonnet-4.6
   - TaskType: discovery

4. synthesize(tabState): Extract final output from task DI-5
   - Return clean object with topPriorities, quickWins, criticalPath, recommendations

5. Output example:
   {
     topPriorities: [{capabilityId, name, reason}],
     quickWins: [{capabilityId, effort, impact}],
     criticalPath: "System A → System B → System C (18 months)",
     recommendations: ["Start with quick wins", "Parallelize where possible"],
     riskFactors: ["Integration complexity", "Team capacity"]
   }

Make systemPrompt/userPrompt pure functions (testable, no side effects).
```

#### Prompt 6: Create Decision Intelligence Instructions (5 files)

```
Create 5 instruction files in js/Analytics/Instructions/decision-intelligence/:

di_1_health_assessment.instruction.md
- Role: You are analyzing enterprise capabilities
- Context: Company has [industry], strategic goal is [outcome]
- Input: List of capabilities with current maturity, gaps
- Output: Score each 0-100 on health, identify maturity gaps
- Quality: Scores should reflect business criticality (not just technical maturity)

di_2_quick_wins.instruction.md
- Role: You are identifying low-effort, high-impact initiatives
- Context: These capabilities were scored in the previous step
- Input: Capability scores, gaps, effort estimates
- Output: List capabilities that are easy to fix, high business impact
- Quality: Quick wins should have effort = "low", impact >= 70

di_3_strategic_gaps.instruction.md
- Role: You are analyzing gaps from a strategic perspective
- Context: Company strategy is [outcome], constraints are [list]
- Input: Strategic intent, capability gaps, current state
- Output: Identify which gaps are strategically critical
- Quality: Explain WHY each gap matters for the strategy

di_4_sequencing.instruction.md
- Role: You are recommending the optimal sequence to address capabilities
- Context: Company has [timeline], [budget], [team capacity]
- Input: Capabilities, gaps, dependencies, effort
- Output: Propose sequence, identify parallelizable work
- Quality: Sequence should respect dependencies and minimize timeline

di_5_executive_summary.instruction.md
- Role: You are writing for the executive audience
- Context: All analysis complete, ready to summarize
- Input: All previous DI task outputs
- Output: Executive summary, top 3 priorities, critical path, risks
- Quality: Concise, actionable, business language (not technical jargon)

Each file should:
- Explain the role clearly
- Give concrete examples
- Specify output requirements
- Include quality criteria
- Be 200-300 words max
```

#### Prompt 7: Decision Intelligence Tests

```
Create js/Tests/DecisionIntelligence.test.js - comprehensive tests for DI tab.

Requirements:

1. Unit tests for each Decision task (5 tasks)
   - DI-1: Health Assessment
     * Test: Scores should be 0-100
     * Test: Critical capabilities get higher scores than non-critical
   
   - DI-2: Quick Wins
     * Test: Only low-effort items included
     * Test: Impact > 70 for all quick wins
   
   - DI-3: Strategic Gaps
     * Test: Output includes rationale for each gap
     * Test: Gaps align with strategic intent
   
   - DI-4: Sequencing
     * Test: Dependencies respected (A before B if A→B dependency)
     * Test: Parallelizable groups identified
   
   - DI-5: Executive Summary
     * Test: Top priorities from DI-2 and DI-4 included
     * Test: Risks mentioned (not just opportunities)

2. Integration test: Full Decision Intelligence workflow
   - Test: Run end-to-end with complete workflow data
   - Test: Results are consistent (DI-2 quickWins subset of DI-5 priorities)
   - Test: Recommendations are actionable

3. Resilience test: Run with incomplete workflow data
   - Test: Tab still produces results (with warnings)
   - Test: Results are generic but valid

4. Performance test:
   - Test: 5 tasks complete in < 5 minutes
   - Test: No memory leaks

Use createMockModel() from setup.test.js.
Use mockAIResponse() to control outputs.
```

### Repeat for Scenarios, Financial, Optimize (Weeks 5–8)

Similar pattern for each tab:
1. Create TabModule.js (5–6 tasks per tab)
2. Create instruction files
3. Create tests
4. Deploy

---

## Copilot Prompts Summary

**Week 1–2 (Foundation):**
- Prompt 1: AnalyticsContext.js
- Prompt 2: AnalyticsContextBuilder.js
- Prompt 3: AnalyticsWorkflowEngine.js
- Prompt 4: TabContext.js

**Week 3–4 (Decision Intelligence):**
- Prompt 5: Decision.js (5-task module)
- Prompt 6: 5 instruction files
- Prompt 7: Tests

**Week 5 (Financial):**
- Prompt 8: Financial.js (6-task module)
- Prompt 9: 6 instruction files
- Prompt 10: Tests

**Week 6–7 (Scenarios):**
- Prompt 11: Scenarios.js (6-task module)
- Prompt 12: 6 instruction files
- Prompt 13: Tests + scenario validation

**Week 8 (Optimize):**
- Prompt 14: Optimize.js (5-task module)
- Prompt 15: 5 instruction files
- Prompt 16: Tests + optimization validation

---

## Key Design Patterns

### Pure Functions for Prompts

Every `systemPrompt()` and `userPrompt()` is a pure function - no side effects, testable:

```javascript
// Good: Pure function
systemPrompt: (context) => `
  You are analyzing capabilities for ${context.masterData.industry}.
  Company is focused on: ${context.masterData.strategicPriorities.join(", ")}.
  ...
`,

// Bad: Side effects
systemPrompt: (context) => {
  saveToDatabase(context);  // No!
  console.log("Running task");  // Avoid
  return "...";
}
```

### Schema Validation

Every task defines `outputSchema`:

```javascript
outputSchema: {
  topPriorities: [{
    capabilityId: "string",
    healthScore: "number",
    criticality: "number"
  }],
  quickWins: ["string"],
  recommendations: ["string"]
}
```

AnalyticsWorkflowEngine validates output matches schema before storing.

### Context Immutability

Never mutate context:

```javascript
// Good: Return new context
tabState.context = { ...tabState.context, ...newFields };

// Bad: Mutation
tabState.context.newField = value;  // No!
```

---

## Success Criteria

### By End of Week 2
- ✓ AnalyticsWorkflowEngine runs without errors
- ✓ Can load and execute Decision Intelligence workflow
- ✓ Context flows correctly from model to tabs
- ✓ Tests pass for foundation

### By End of Week 4
- ✓ Decision Intelligence tab in production
- ✓ Users can access anytime (independent of workflow completion)
- ✓ Results improve as workflow completes
- ✓ <0.1% error rate

### By End of Week 8
- ✓ All 4 tabs in production
- ✓ Users routinely access analytics (usage metrics)
- ✓ Tab results influence roadmap decisions
- ✓ Cost tracking: tokens, API calls, performance

---

## FAQ

**Q: Can tabs run before workflow completes?**
A: Yes. AnalyticsContext will have undefined fields, and TabEngine validates with warnings. Tabs run anyway with generic/default results.

**Q: What if user updates workflow after running tab?**
A: Old results are saved, user can click "Refresh" to re-run with new context. Both results are kept.

**Q: Do I need o1 reasoning model?**
A: For Optimize tab, yes - it's constraint satisfaction, optimization is a reasoning task. Others can use sonnet-4.5/4.6.

**Q: How much does this cost?**
A: ~$0.10–0.20 per tab run (depends on complexity). 100 users × 5 tabs × 1 run/month = ~$50–100/month.

**Q: Can users export results?**
A: Yes. Add export button to each tab. Export as PDF, JSON, or copy to clipboard.

**Q: Can tabs communicate?**
A: Not directly in Phase 1. Phase 2 feature: "Use this scenario's roadmap as input to Financial analysis."

---

## Next Steps

1. **Confirm this architecture** - Does parallel + shared context match your vision?
2. **Prioritize tab order** - Which first? (Recommended: Decision Intelligence)
3. **Review Copilot prompts** - Ready to start Week 1 foundation work?
4. **Operational questions** - How will you monitor, maintain, evolve these tabs?

---

*This architecture gives you independent analytics workflows that always have access to your main workflow data. Users can explore alternatives without disrupting the main roadmap. Start building Week 1 after main workflow is stable in production.*
