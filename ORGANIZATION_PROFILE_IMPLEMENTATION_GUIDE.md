# Organization Profile — Business Object Initialization Implementation Guide

**Version:** 1.0  
**Date:** April 22, 2026  
**Status:** Phase 1-2 Complete — Core Modules Ready  

---

## Executive Summary

This guide documents the implementation of the **Organization Profile / Business Object Initialization** feature for the NextGen EA Platform V4. This feature allows users to provide a detailed organizational summary (500-2000 words) that is AI-processed into a structured JSON profile, enriching all downstream EA workflow steps.

### What's Been Delivered

✅ **Phase 1: Data Model & AI Processing Module (COMPLETE)**
- [ORGANIZATION_PROFILE_DATA_CONTRACT.md](NexGenEA/js/Instructions/step0/ORGANIZATION_PROFILE_DATA_CONTRACT.md) — Complete schema with 30+ fields
- [0_2_organization_profile_processor.instruction.md](NexGenEA/js/Instructions/step0/0_2_organization_profile_processor.instruction.md) — GPT-5 AI system prompt
- [EA_OrganizationProfileProcessor.js](js/EA_OrganizationProfileProcessor.js) — Processing module with validation

✅ **Phase 2: Standalone Demo (COMPLETE)**
- [OrganizationProfileDemo.html](NexGenEA/OrganizationProfileDemo.html) — Working demo for testing

### Next Steps

⏳ **Phase 3: Workflow Integration** (To be implemented)
- Integrate with Step0.js
- Add mode selector UI to EA Platform
- Wire processing logic into workflow

⏳ **Phase 4-6: Context Propagation & Testing**
- Update Steps 1-7 to use organizationProfile
- Add profile display/edit UI
- End-to-end testing

---

## Architecture Overview

### Core Components

```
NexGenEA/
├── js/
│   ├── EA_OrganizationProfileProcessor.js      ← Main processing module
│   ├── Instructions/
│   │   └── step0/
│   │       ├── ORGANIZATION_PROFILE_DATA_CONTRACT.md        ← Schema docs
│   │       └── 0_2_organization_profile_processor.instruction.md  ← AI prompt
│   └── Steps/
│       ├── StepEngine.js                       ← Orchestrator
│       └── Step0.js                            ← Context engine (to enhance)
└── OrganizationProfileDemo.html                ← Standalone demo
```

### Data Flow

```
User Input (Rich Summary)
    ↓
EA_OrganizationProfileProcessor.processOrganizationalSummary()
    ↓
AI Extraction (GPT-5) → Structured JSON
    ↓
Validation & Enrichment
    ↓
Completeness Scoring (0-100%)
    ↓
Store in window.model.organizationProfile
    ↓
Context propagation to Steps 1-7
```

### Storage Location

```javascript
window.model.organizationProfile = {
    // 30+ fields across 15 categories
    organizationName: "ACME Corp",
    industry: "Healthcare Technology",
    strategicPriorities: [...],
    challenges: [...],
    executiveSummary: {...},
    metadata: {
        completeness: 85,
        createdAt: 1713878400000
    }
}
```

---

## Phase 1-2: Delivered Components

### 1. Data Contract (ORGANIZATION_PROFILE_DATA_CONTRACT.md)

**Purpose:** Define canonical schema for organization profiles

**Key Sections:**
- **Core Identity:** organizationName, industry, headquarters, companySize
- **Business Overview:** mission, vision, businessModel
- **Products & Services:** offerings array
- **Market Position:** markets, competitors, differentiators
- **Strategic Context:** strategicPriorities, challenges, opportunities, constraints
- **Technology Landscape:** coreSystems, legacySystems, cloudAdoption, techDebt
- **Financial Context:** revenue, growth, profitability, investmentCapacity
- **Executive Summary:** AI-generated oneLinePitch, threeKeyFacts, strategicNarrative
- **Metadata:** completeness score, timestamps, source tracking

**Completeness Scoring:**
- < 40%: Too incomplete (warn user)
- 40-60%: Minimal (workflow can proceed with warnings)
- 60-80%: Good (sufficient for quality generation)
- 80-100%: Excellent (rich context for all steps)

### 2. AI System Prompt (0_2_organization_profile_processor.instruction.md)

**Purpose:** Instruction file for GPT-5 to extract structured data from freeform text

**Key Features:**
- **Inference Guidelines:** When to infer vs. when to use null
- **Quality Standards:** Specificity over generality
- **Industry Intelligence:** Context-aware categorization patterns
- **Completeness Calculation:** Section-weighted scoring logic
- **Error Handling:** Short input, missing data, JSON parsing errors

**Output:** Valid JSON matching ORGANIZATION_PROFILE_DATA_CONTRACT schema

### 3. Processing Module (EA_OrganizationProfileProcessor.js)

**Purpose:** Main JavaScript module for processing organizational summaries

**Key Functions:**

```javascript
// Main entry point
processOrganizationalSummary(summaryText, options, progressCallback)
    → Returns: { success, profile, completeness, readyForWorkflow }

// Validation
validateInput(summaryText)
    → Checks minimum length (100 chars)
    → Returns validation result

// AI extraction
extractStructuredData(summaryText, options)
    → Loads instruction file
    → Calls GPT-5 via AzureOpenAIProxy
    → Parses JSON response
    → Returns structured profile

// Enrichment
validateAndEnrichProfile(profile, originalSummary)
    → Ensures required fields
    → Validates enum values
    → Generates executive summary if missing
    → Returns enriched profile

// Executive summary generation
generateExecutiveSummary(profile)
    → Creates oneLinePitch (max 150 chars)
    → Extracts threeKeyFacts
    → Generates strategicNarrative (2-3 paragraphs)
    → Assesses transformationReadiness

// Completeness scoring
calculateCompleteness(profile)
    → Weighted section scoring
    → Returns 0-100% score
```

**Configuration:**
```javascript
CONFIG = {
    MIN_SUMMARY_LENGTH: 100,
    RECOMMENDED_LENGTH: 500,
    MAX_RETRIES: 2,
    COMPLETENESS_THRESHOLD: 60,
    AI_MODEL: 'gpt-5',
    INSTRUCTION_FILE: 'step0/0_2_organization_profile_processor.instruction.md'
}
```

### 4. Standalone Demo (OrganizationProfileDemo.html)

**Purpose:** Test the Organization Profile processor without integrating into main platform

**Features:**
- Mode selector: Quick Start vs. Rich Profile
- Character counter with visual feedback
- Progress indicator during AI processing
- Result display:
  - Completeness score with color-coded badge
  - Executive summary
  - Core identity
  - Strategic priorities
  - Key challenges
  - Warnings (if completeness < 60%)
- Action buttons:
  - View Full JSON
  - Download JSON
  - Process Another

**How to Test:**
1. Open `NexGenEA/OrganizationProfileDemo.html` in browser
2. Switch to "Rich Profile" mode
3. Paste example organizational summary (or use pre-filled example)
4. Click "Process with AI"
5. Review generated profile

**Example Input:**
See pre-filled example in demo (ACME Healthcare Solutions — 500+ words)

**Expected Output:**
- Completeness: 80-90%
- All 30+ fields populated
- Executive summary generated
- Warnings: None (if example used)

---

## Phase 3: Workflow Integration (To Implement)

### Step 1: Enhance Step0.js

**File:** `NexGenEA/js/Steps/Step0.js`

**Changes Required:**

#### 1. Add Mode Selection Task

Add a new task at the beginning of Step0:

```javascript
const Step0 = {
  id: 'step0',
  name: 'Context Engine',
  dependsOn: [],

  tasks: [
    // NEW TASK: Mode selection
    {
      taskId: 'step0_mode_selection',
      title: 'Select initialization mode',
      type: 'question',  // User chooses mode
      taskType: 'lightweight',
      
      userPrompt: (ctx) => {
        return {
          question: 'How would you like to initialize your EA model?',
          options: [
            { value: 'quick', label: 'Quick Start', description: 'Provide 2-3 sentence company description' },
            { value: 'rich', label: 'Rich Profile', description: 'Detailed organizational summary (500-2000 words) — AI-processed into structured profile' }
          ],
          defaultValue: 'quick'
        };
      },
      
      parseOutput: (raw) => {
        return { mode: raw };  // Store selected mode
      }
    },

    // CONDITIONAL TASK 1: Quick Start (existing context engine)
    {
      taskId: 'step0_context_engine',
      title: 'Analysing company context',
      type: 'internal',
      taskType: 'lightweight',
      
      // Only run if mode === 'quick'
      shouldRun: (ctx) => ctx.answers?.step0_mode_selection?.mode === 'quick',
      
      // ... (existing implementation)
    },

    // CONDITIONAL TASK 2: Rich Profile processing
    {
      taskId: 'step0_rich_profile',
      title: 'Processing organizational summary',
      type: 'question',  // Ask for detailed summary
      taskType: 'lightweight',
      
      // Only run if mode === 'rich'
      shouldRun: (ctx) => ctx.answers?.step0_mode_selection?.mode === 'rich',
      
      userPrompt: (ctx) => {
        return {
          question: 'Provide a detailed organizational summary',
          placeholder: `Describe your organization in detail (500-2000 words):

Include:
• Company background, history, and structure
• Products, services, and offerings
• Market position and competitive landscape
• Strategic priorities and goals (with timeframes)
• Key challenges and pain points
• Technology landscape and systems
• Financial context and investment capacity
• Regulatory requirements
• Organizational culture

Be specific — mention actual systems, numbers, and concrete details.`,
          multiline: true,
          minLength: 500,
          hint: 'The more detail you provide, the better the AI can structure your profile for downstream steps.'
        };
      },
      
      parseOutput: async (raw, ctx) => {
        // Call the processor
        const result = await EA_OrganizationProfileProcessor.processOrganizationalSummary(
          raw,
          {},
          (progress) => {
            // Update UI progress indicator
            if (typeof updateStepProgress === 'function') {
              updateStepProgress(progress.message, progress.percent);
            }
          }
        );
        
        if (!result.success) {
          throw new Error(result.message || 'Organization profile processing failed');
        }
        
        return {
          profile: result.profile,
          completeness: result.completeness,
          readyForWorkflow: result.readyForWorkflow
        };
      }
    }
  ],

  synthesize: (ctx) => {
    const mode = ctx.answers?.step0_mode_selection?.mode;
    
    if (mode === 'quick') {
      // Quick Start: Return existing context engine output
      const out = ctx.answers?.step0_context_engine || {};
      return {
        contextObj: out.context || {},
        stepPrompts: out.step_prompts || {},
        hypothesis: out.hypothesis || null,
        mode: 'quick'
      };
    } else if (mode === 'rich') {
      // Rich Profile: Return organization profile
      const richOut = ctx.answers?.step0_rich_profile || {};
      return {
        organizationProfile: richOut.profile || {},
        completeness: richOut.completeness || 0,
        mode: 'rich'
      };
    }
    
    return {};
  },

  applyOutput: (output, model) => {
    if (output.mode === 'quick') {
      // Quick Start: Store step prompts (existing behavior)
      window._stepPrompts = output.stepPrompts || {};
      window._step1Hypothesis = output.hypothesis || null;
      
      return {
        ...model,
        contextObj: output.contextObj || {}
      };
    } else if (output.mode === 'rich') {
      // Rich Profile: Store organization profile
      return {
        ...model,
        organizationProfile: output.organizationProfile || {},
        organizationProfileCompleteness: output.completeness || 0
      };
    }
    
    return model;
  },

  onComplete: (model) => {
    console.log('[Step0] Initialization complete. Mode:', model.organizationProfile ? 'rich' : 'quick');
    
    // If rich profile with warnings, display them
    if (model.organizationProfile?.metadata?.warnings) {
      const warnings = model.organizationProfile.metadata.warnings;
      console.warn('[Step0] Completeness warnings:', warnings);
      
      // Show warnings to user (optional)
      if (typeof showCompletenessWarnings === 'function') {
        showCompletenessWarnings(warnings, model.organizationProfileCompleteness);
      }
    }
  }
};
```

#### 2. Add `shouldRun` Support to StepEngine

**File:** `NexGenEA/js/Steps/StepEngine.js`

Enhance task execution to support conditional tasks:

```javascript
// In the task execution loop (inside run() function)
for (let i = 0; i < stepModule.tasks.length; i++) {
  const task = stepModule.tasks[i];
  
  // NEW: Check if task should run
  if (task.shouldRun && !task.shouldRun(stepContext)) {
    console.log(`[StepEngine] Skipping task ${task.taskId} (condition not met)`);
    continue;  // Skip this task
  }
  
  // ... existing task execution logic
}
```

### Step 2: UI Integration

**File:** `azure-deployment/static/NexGenEA/NexGen_EA_V4.html` (or relevant EA Platform HTML)

**Changes Required:**

#### 1. Load EA_OrganizationProfileProcessor Module

Add script tag after other JS modules:

```html
<!-- EA Organization Profile Processor (Phase 2) -->
<script src="js/EA_OrganizationProfileProcessor.js"></script>
```

#### 2. Add Mode Selector UI (Optional - can use StepEngine's question cards instead)

If you want a custom mode selector in the left panel:

```html
<!-- In left panel, before "Organisation Description" -->
<div class="bg-white rounded-xl shadow-sm p-4 border border-slate-200 mb-3">
  <div class="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">
    Initialization Mode
  </div>
  <div class="grid grid-cols-2 gap-2">
    <button 
      id="mode-quick" 
      class="mode-selector-btn active" 
      onclick="setInitMode('quick')"
    >
      <i class="fas fa-bolt"></i> Quick Start
    </button>
    <button 
      id="mode-rich" 
      class="mode-selector-btn" 
      onclick="setInitMode('rich')"
    >
      <i class="fas fa-magic"></i> Rich Profile
    </button>
  </div>
  
  <div id="quick-mode-desc" class="text-xs text-slate-600 mt-2">
    2-3 sentence description
  </div>
  <div id="rich-mode-desc" class="text-xs text-slate-600 mt-2" style="display:none;">
    Detailed 500-2000 word summary, AI-processed
  </div>
</div>

<style>
.mode-selector-btn {
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-selector-btn:hover {
  border-color: #667eea;
}

.mode-selector-btn.active {
  border-color: #667eea;
  background: #f0f4ff;
  color: #667eea;
}
</style>

<script>
let initMode = 'quick';

function setInitMode(mode) {
  initMode = mode;
  
  // Update button states
  document.getElementById('mode-quick').classList.toggle('active', mode === 'quick');
  document.getElementById('mode-rich').classList.toggle('active', mode === 'rich');
  
  // Update descriptions
  document.getElementById('quick-mode-desc').style.display = mode === 'quick' ? 'block' : 'none';
  document.getElementById('rich-mode-desc').style.display = mode === 'rich' ? 'block' : 'none';
  
  // Adjust textarea height
  const textarea = document.getElementById('description');
  if (textarea) {
    textarea.style.minHeight = mode === 'rich' ? '200px' : '80px';
    textarea.placeholder = mode === 'rich' 
      ? 'Provide detailed organizational summary (500-2000 words)...'
      : 'E.g. Nordic insurance company focusing on embedded insurance...';
  }
  
  console.log('[InitMode] Set to:', mode);
}
</script>
```

#### 3. Modify Workflow Start Function

Update the function that starts the workflow to pass the mode:

```javascript
async function startWorkflow() {
  const description = document.getElementById('description').value.trim();
  const mode = initMode || 'quick';  // Get selected mode
  
  if (!description) {
    toast('Describe your organisation first', true);
    return;
  }
  
  try {
    // Store description in model
    window.model = window.model || {};
    window.model.description = description;
    
    // Run Step0 with mode context
    await StepEngine.run('step0', { 
      initialMode: mode,
      companyDescription: description 
    }, window.model);
    
    // Continue to Step 1
    await StepEngine.run('step1', window.model);
    
  } catch (error) {
    console.error('[Workflow] Error:', error);
    toast('Workflow failed: ' + error.message, true);
  }
}
```

### Step 3: Test Integration

1. **Open EA Platform:** Load `NexGen_EA_V4.html` in browser
2. **Select Rich Profile Mode:** Click "Rich Profile" button
3. **Enter Detailed Summary:** Paste organizational summary (500+ words)
4. **Start Workflow:** Click workflow start button
5. **Verify:**
   - Step0 runs with rich profile task
   - AI processing completes
   - `window.model.organizationProfile` is populated
   - Completeness score displayed
   - Warnings shown (if < 60%)
6. **Check Storage:** 
   ```javascript
   console.log(window.model.organizationProfile);
   console.log(window.model.organizationProfileCompleteness);
   ```

---

## Phase 4: Context Propagation to Steps 1-7

### Implementation Pattern

For each step (Step1.js through Step7.js), update the `systemPrompt` function to check for and use `organizationProfile` as primary context.

### Example: Step1.js (Strategic Intent)

**Before:**
```javascript
systemPrompt: (ctx) => {
  const companyDesc = ctx.companyDescription || 'the organisation';
  return `You are a Strategic Enterprise Architect...
  Company: ${companyDesc}
  ...`;
}
```

**After:**
```javascript
systemPrompt: (ctx) => {
  const profile = window.model?.organizationProfile;
  
  // Rich Profile mode: Use structured context
  if (profile && profile.metadata?.completeness >= 60) {
    const priorities = profile.strategicPriorities?.map(p => p.priority).join(', ') || 'Not specified';
    const challenges = profile.challenges?.map(c => c.challenge).join(', ') || 'Not specified';
    
    return `You are a Senior Enterprise Architect with 15+ years of experience in ${profile.industry}.

**ORGANIZATION CONTEXT (from Rich Profile):**
- **Company:** ${profile.organizationName} (${profile.companySize?.employees} employees, ${profile.companySize?.sizeCategory})
- **Industry:** ${profile.industry}
- **Mission:** ${profile.missionStatement}
- **Strategic Priorities:** ${priorities}
- **Key Challenges:** ${challenges}
- **Technology Maturity:** Cloud=${profile.technologyLandscape?.cloudAdoption}, AI=${profile.technologyLandscape?.aiAdoption}
- **Transformation Readiness:** ${profile.executiveSummary?.transformationReadiness}

**TASK:** Generate Strategic Intent based on this rich organizational context.

CRITICAL: Use the specific priorities, challenges, and constraints from the profile above. Do NOT generate generic consulting language.

Return ONLY valid JSON matching the Strategic Intent schema.`;
  }
  
  // Quick Start mode: Minimal context (existing behavior)
  const companyDesc = ctx.companyDescription || 'the organisation';
  return `You are a Strategic Enterprise Architect...
  Company: ${companyDesc}
  ...`;
}
```

### Steps to Update (Apply pattern to all)

1. ✅ **Step1.js (Strategic Intent):** Use strategicPriorities, challenges, opportunities
2. ✅ **Step2.js (Business Model Canvas):** Use offerings, businessModel, markets, customers
3. ✅ **Step3.js (Capability Map):** Use structure, offerings, strategicPriorities
4. ✅ **Step4.js (Operating Model):** Use structure, technologyLandscape, governance
5. ✅ **Step5.js (Gap Analysis):** Use challenges, constraints, technologyLandscape
6. ✅ **Step6.js (Value Pools):** Use opportunities, financial context, strategicPriorities
7. ✅ **Step7.js (Roadmap):** Use strategicPriorities (timeframe, importance), constraints, financial

### Questionnaire Skip Logic

For steps with AI questionnaires (e.g., Step1), skip or shorten questionnaire if rich profile is complete:

```javascript
// In Step1.js
tasks: [
  {
    taskId: 'step1_questionnaire',
    type: 'question',
    
    // Skip questionnaire if rich profile exists
    shouldRun: (ctx) => {
      const profile = window.model?.organizationProfile;
      const completeness = profile?.metadata?.completeness || 0;
      
      if (completeness >= 60) {
        console.log('[Step1] Skipping questionnaire — using rich profile context');
        return false;  // Skip
      }
      return true;  // Run questionnaire
    },
    
    // ... rest of task definition
  }
]
```

---

## Phase 5: Profile Display & Edit UI

### 1. Executive Summary Tab Enhancement

**File:** `NexGen_EA_V4.html`

Add Organization Profile section to Executive Summary tab:

```html
<!-- In Executive Summary tab -->
<div id="org-profile-section" style="display:none;">
  <div class="section-header">
    <i class="fas fa-building"></i> Organization Profile
    <span class="completeness-badge" id="profile-completeness-badge">85% Complete</span>
  </div>
  
  <div class="profile-summary">
    <h3>One-Line Pitch</h3>
    <p id="profile-pitch"></p>
    
    <h3>Strategic Narrative</h3>
    <p id="profile-narrative"></p>
    
    <h3>Core Identity</h3>
    <ul id="profile-identity"></ul>
    
    <h3>Strategic Priorities</h3>
    <ul id="profile-priorities"></ul>
    
    <h3>Key Challenges</h3>
    <ul id="profile-challenges"></ul>
  </div>
  
  <button onclick="editOrganizationProfile()" class="btn btn-secondary">
    <i class="fas fa-edit"></i> Edit Profile
  </button>
</div>

<script>
function renderOrganizationProfile() {
  const profile = window.model?.organizationProfile;
  if (!profile) {
    document.getElementById('org-profile-section').style.display = 'none';
    return;
  }
  
  // Show section
  document.getElementById('org-profile-section').style.display = 'block';
  
  // Completeness badge
  const completeness = profile.metadata?.completeness || 0;
  const badge = document.getElementById('profile-completeness-badge');
  badge.textContent = `${completeness}% Complete`;
  badge.className = 'completeness-badge ' + getCompletenessClass(completeness);
  
  // One-line pitch
  document.getElementById('profile-pitch').textContent = 
    profile.executiveSummary?.oneLinePitch || 'N/A';
  
  // Narrative
  document.getElementById('profile-narrative').textContent = 
    profile.executiveSummary?.strategicNarrative || 'N/A';
  
  // Identity
  const identityHTML = `
    <li><strong>Organization:</strong> ${profile.organizationName}</li>
    <li><strong>Industry:</strong> ${profile.industry}</li>
    <li><strong>Size:</strong> ${profile.companySize?.employees} employees</li>
    <li><strong>Mission:</strong> ${profile.missionStatement}</li>
  `;
  document.getElementById('profile-identity').innerHTML = identityHTML;
  
  // Priorities
  const prioritiesHTML = (profile.strategicPriorities || [])
    .map(p => `<li><strong>${p.priority}:</strong> ${p.description}</li>`)
    .join('');
  document.getElementById('profile-priorities').innerHTML = prioritiesHTML;
  
  // Challenges
  const challengesHTML = (profile.challenges || [])
    .map(c => `<li><strong>${c.challenge}:</strong> ${c.description}</li>`)
    .join('');
  document.getElementById('profile-challenges').innerHTML = challengesHTML;
}

function getCompletenessClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function editOrganizationProfile() {
  // Open edit modal
  alert('Edit functionality coming in Phase 5.2');
}
</script>
```

### 2. Profile Edit Modal

Add modal for editing organization profile:

```html
<div id="profile-edit-modal" class="modal-overlay hidden">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">Edit Organization Profile</div>
      <button onclick="closeProfileEditModal()">×</button>
    </div>
    <div class="modal-body">
      <!-- Form fields for editing profile -->
      <div class="form-group">
        <label>Organization Name</label>
        <input type="text" id="edit-org-name" />
      </div>
      <!-- ... more fields ... -->
    </div>
    <div class="modal-footer">
      <button onclick="saveProfileEdits()" class="btn btn-primary">Save</button>
      <button onclick="closeProfileEditModal()" class="btn btn-secondary">Cancel</button>
    </div>
  </div>
</div>
```

---

## Phase 6: Testing & Validation

### Test Cases

#### TC1: Quick Start Mode (Existing Behavior)
- **Steps:**
  1. Select "Quick Start" mode
  2. Enter 2-3 sentence description
  3. Start workflow
- **Expected:** Existing behavior (context engine runs, generates step prompts)
- **Verify:** `window.model.contextObj` populated, no `organizationProfile`

#### TC2: Rich Profile Mode — Complete Profile
- **Steps:**
  1. Select "Rich Profile" mode
  2. Enter detailed 800-word summary (use ACME Healthcare example)
  3. Process with AI
- **Expected:**
  - Processing completes in 10-30 seconds
  - Completeness: 80-90%
  - All major sections populated
  - No warnings
  - `window.model.organizationProfile` populated
- **Verify:**
  ```javascript
  console.assert(window.model.organizationProfile.organizationName !== null);
  console.assert(window.model.organizationProfile.metadata.completeness >= 80);
  console.assert(!window.model.organizationProfile.metadata.warnings);
  ```

#### TC3: Rich Profile Mode — Incomplete Profile
- **Steps:**
  1. Select "Rich Profile" mode
  2. Enter minimal 150-word summary
  3. Process with AI
- **Expected:**
  - Processing completes
  - Completeness: 40-60%
  - Warnings displayed
- **Verify:**
  ```javascript
  console.assert(window.model.organizationProfile.metadata.completeness < 60);
  console.assert(window.model.organizationProfile.metadata.warnings.length > 0);
  ```

#### TC4: Context Propagation to Step 1
- **Steps:**
  1. Complete Rich Profile setup (TC2)
  2. Proceed to Step 1 (Strategic Intent)
  3. Check system prompt
- **Expected:**
  - Step 1 questionnaire skipped (if completeness >= 60%)
  - System prompt includes organization profile context
  - Strategic Intent generated uses profile data
- **Verify:**
  - Strategic Intent references specific priorities from profile
  - Challenges mentioned are from profile
  - Industry-specific language matches profile.industry

#### TC5: Storage & Retrieval
- **Steps:**
  1. Complete Rich Profile setup
  2. Save to database
  3. Reload page
  4. Load from database
- **Expected:**
  - organizationProfile persisted correctly
  - All fields intact after reload
  - Completeness score preserved
- **Verify:** `window.model.organizationProfile` matches saved data

#### TC6: Error Handling
- **Steps:**
  1. Enter very short summary (< 100 chars)
  2. Attempt to process
- **Expected:**
  - Error message: "Input too short"
  - Minimum length indicated
  - No processing attempted
- **Verify:** No AI call made

---

## API Reference

### EA_OrganizationProfileProcessor

#### Main Function

```javascript
async processOrganizationalSummary(summaryText, options, progressCallback)
```

**Parameters:**
- `summaryText` (string): User's organizational summary
- `options` (object, optional): Configuration overrides
  - `model` (string): AI model (default: 'gpt-5')
- `progressCallback` (function, optional): Progress updates
  - Called with `{ message: string, percent: number }`

**Returns:**
```javascript
{
  success: boolean,
  profile?: object,              // OrganizationProfile JSON
  completeness?: number,         // 0-100
  readyForWorkflow?: boolean,    // true if completeness >= 60%
  error?: string,                // Error type (if success=false)
  message?: string,              // Error message
  details?: object               // Error details
}
```

#### Utility Functions

```javascript
validateInput(summaryText)
calculateCompleteness(profile)
generateExecutiveSummary(profile)
```

---

## Troubleshooting

### Issue: AI Processing Fails

**Symptoms:** Error message "AI extraction failed"

**Possible Causes:**
1. AzureOpenAIProxy not loaded
2. AI service unavailable
3. Instruction file not found
4. Invalid JSON response from AI

**Solution:**
1. Check browser console for detailed error
2. Verify `AzureOpenAIProxy.js` is loaded
3. Test with OrganizationProfileDemo.html first
4. Check instruction file path: `NexGenEA/js/Instructions/step0/0_2_organization_profile_processor.instruction.md`

### Issue: Completeness Score Too Low

**Symptoms:** Completeness < 40%, many warnings

**Possible Causes:**
1. Input too short
2. Too vague (generic descriptions)
3. Missing key information

**Solution:**
1. Provide longer summary (aim for 500+ words)
2. Be specific: mention actual systems, numbers, dates
3. Include all recommended sections:
   - Strategic priorities (3-5)
   - Challenges (3-5)
   - Technology landscape
   - Financial context

### Issue: Profile Not Stored After Processing

**Symptoms:** `window.model.organizationProfile` is null after processing

**Possible Causes:**
1. Step0.js not updated with rich profile task
2. applyOutput not saving profile to model
3. Database save failing

**Solution:**
1. Verify Step0.js has `step0_rich_profile` task
2. Check applyOutput function saves `organizationProfile`
3. Check browser console for save errors
4. Manually verify: `window.model.organizationProfile` after Step0 completes

---

## Future Enhancements (v1.1+)

### Planned Features

1. **Profile Import/Export**
   - Import from existing systems (CRM, ERP)
   - Export to PowerPoint/PDF
   - Integration with Microsoft Graph API

2. **Incremental Profile Updates**
   - Allow editing individual sections
   - Re-calculate completeness after edits
   - Track change history

3. **Profile Templates**
   - Industry-specific profile templates
   - Pre-filled examples for common scenarios
   - Guided questionnaire mode (alternative to freeform text)

4. **Multi-Organization Support**
   - Support for subsidiaries, business units
   - Hierarchical profiles (parent/child)
   - Cross-organizational comparison

5. **Enhanced AI Intelligence**
   - Automatic competitor analysis (web scraping)
   - Financial data enrichment (APIs)
   - Industry benchmarking

6. **Visualization**
   - Organizational chart generation
   - Strategic priority timeline
   - Technology landscape diagram

---

## Appendix A: Example Organizational Summaries

### Example 1: Healthcare Technology (Complete)

```
ACME Healthcare Solutions is a Swedish healthcare technology company founded in 2010, 
now employing 500 people across offices in Stockholm, Oslo, and Copenhagen. We provide 
cloud-based patient management systems to 200+ healthcare providers across the Nordics.

Our mission is to make healthcare administration seamless and secure. We serve hospitals, 
clinics, and private practices with three core products: PatientPortal (patient engagement), 
CareFlow (clinical workflow), and DataVault (secure health records storage).

We're the #2 player in the Nordic market behind MedTechGiant, but growing fast (30% YoY). 
Our key differentiator is deep integration with Nordic national health systems (BankID, 
1177, Kry).

Major challenges:
- Legacy on-premise systems at older customers limiting upsell
- GDPR compliance complexity with cross-border data
- Shortage of healthcare IT specialists
- Competition from international players entering Nordic market

Strategic priorities for 2026-2028:
1. Migrate all customers to cloud (SaaS model) by end 2027
2. Launch AI-powered clinical decision support features
3. Expand to Germany and Netherlands (EU expansion)
4. Achieve ISO 27001 and SOC 2 Type II certifications

Our tech stack includes Azure (cloud), PostgreSQL (data), React (frontend). We have 
significant tech debt from rapid growth and some legacy code from 2010 that needs 
refactoring. Budget is €5M for IT modernization over next 2 years.

Culture is innovative but somewhat chaotic—we're professionalizing governance and 
processes as we scale. Hybrid work model with 60% remote.
```

**Expected Completeness:** 85%

### Example 2: Property Management (Minimal — Will Have Warnings)

```
We are a property management company in Stockholm managing about 800 apartments. 
We want to digitize tenant communication and improve ESG reporting. Current system 
is old and slow.
```

**Expected Completeness:** 45%  
**Expected Warnings:**
- Missing strategic priorities (only 1 implied)
- Limited challenge information
- No technology landscape details
- Missing financial context

---

## Appendix B: Schema Reference

See [ORGANIZATION_PROFILE_DATA_CONTRACT.md](NexGenEA/js/Instructions/step0/ORGANIZATION_PROFILE_DATA_CONTRACT.md) for complete schema specification.

**Quick Reference — Required Fields:**
- `organizationName` (string)
- `industry` (string)
- `companySize.employees` (number)
- `companySize.sizeCategory` (enum)
- `strategicPriorities` (array, min 1)
- `challenges` (array, min 1)
- `metadata.createdAt` (timestamp)
- `metadata.completeness` (number 0-100)

**Quick Reference — High-Value Fields (boost completeness):**
- `missionStatement`, `visionStatement`
- `strategicPriorities` (3-5 items with timeframes)
- `challenges` (3-5 items with severity)
- `technologyLandscape` (cloudAdoption, techDebt)
- `financial.investmentCapacity`

---

## Support & Contact

**Documentation:** See all `*_GUIDE.md` files in project root  
**Demo:** `NexGenEA/OrganizationProfileDemo.html`  
**Issues:** Check browser console for detailed error messages  

---

**End of Implementation Guide**  
**Version:** 1.0 (April 22, 2026)
