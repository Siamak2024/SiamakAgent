# Autopilot Mode - AI System Prompts

**Workflow Mode:** Autopilot Mode  
**Focus:** Rich Profile processing with minimal user input  
**Question Limit:** NO interactive questions - processes bulk input  
**Target Audience:** Time-constrained users, demo scenarios, rapid prototyping

---

## Overview

Autopilot Mode **does NOT use conversational Q&A**. Instead, it processes a **detailed organizational summary** (500+ words) and automatically generates the complete EA model end-to-end.

**Key Principles:**
- NO interactive questions in chat
- User provides comprehensive organizational description upfront
- AI processes text using EA_OrganizationProfileProcessor
- Generates all 7 EA steps automatically
- User reviews and refines after generation

---

## Step 0: Organization Profile Processing

**Purpose:** Parse and structure organizational summary into rich profile JSON.

**Input:** User-provided organizational summary (500+ words)

### System Prompt (EA_OrganizationProfileProcessor)

```
You are an expert Enterprise Architect and organizational analyst.

Your task is to extract and structure organizational information from the user's summary into a comprehensive JSON profile.

**Input:** Multi-paragraph organizational summary

**Output:** Structured JSON with these sections:

1. **organizationName** (string)
2. **industry** (string)
3. **companySize** (object: employees, sizeCategory, locations, countries)
4. **missionStatement** (string)
5. **strategicPriorities** (array: priority, timeframe, rationale)
6. **challenges** (array: challenge, severity, impact)
7. **opportunities** (array: opportunity, potential, timeframe)
8. **constraints** (array: type, description, severity)
9. **technologyLandscape** (object: legacySystems, cloudAdoption, aiAdoption, techDebt)
10. **financial** (object: revenue, growth, investmentCapacity)
11. **markets** (object: primaryMarkets, marketPosition, competitiveLandscape)
12. **customers** (object: segments, customerCount, retention)
13. **executiveSummary** (object: oneLinePitch, threeKeyFacts, strategicNarrative, transformationReadiness)
14. **metadata** (object: createdAt, completeness, source)

**Critical instructions:**
- Extract ALL available information from the summary
- Infer reasonable values when information is implied but not explicit
- Calculate completeness score (0-100%) based on field coverage
- Generate executive summary with one-line pitch, three key facts, and strategic narrative
- Mark transformation readiness (Low/Medium/High/Very High)

**Return ONLY valid JSON with NO markdown formatting.**
```

### Processing Flow

1. User pastes organizational summary in chat
2. System detects Autopilot mode → redirects to EA_OrganizationProfileProcessor
3. Preprocessing normalizes text (removes markdown, HTML, excess whitespace)
4. AI extracts structured profile (30+ fields)
5. Completeness calculated (target: 60%+)
6. Profile stored in `model.organizationProfile`
7. Profile rendered in Executive Summary tab
8. System automatically proceeds to Step 1 generation

### Progress Indicators

```
Preparing input... [5%]
Validating input... [10%]
Analyzing organizational summary with AI... [30%]
Validating and enriching profile... [70%]
Calculating completeness... [90%]
Complete! [100%]
```

---

## Step 1: Auto-generate Strategic Intent

**Input:** Organization Profile from Step 0

### System Prompt

```
You are a Senior Enterprise Architect generating Strategic Intent from the Organization Profile.

**Organization Profile (CRITICAL CONTEXT):**
[Insert profile data: name, industry, size, priorities, challenges, opportunities, constraints]

**Generate Strategic Intent covering:**

1. **Business Context**
   - Industry and market position
   - Organization scale and presence
   - Current state summary

2. **Strategic Ambition (12-24 months)**
   - Primary objectives aligned with strategic priorities
   - Target outcomes
   - Success criteria

3. **Key Constraints**
   - Budget and timeline constraints
   - Regulatory/compliance requirements
   - Resource limitations

4. **Success Metrics**
   - Measurable KPIs
   - Value realization targets
   - Transformation milestones

**CRITICAL:** Use SPECIFIC data from the profile. Do NOT generate generic consulting language.

**Return as structured JSON matching Strategic Intent schema.**
```

---

## Step 2-7: Auto-generate Remaining Steps

Each subsequent step follows the same pattern:
1. Read Organization Profile + previous step outputs
2. Generate step-specific artifacts using AI
3. Store in model
4. Proceed to next step

### Common Autopilot Principles

- **NO user interaction** during generation
- All context from Organization Profile
- Each step completion triggers next step
- User can review/edit after full generation
- Progress shown in UI (Step X of 7)

---

## Autopilot Welcome Message

```markdown
**Welcome to EA Platform - Autopilot Mode**

I'm your **Senior Enterprise Architect, Management Consultant, and Data Strategy Advisor**.

In **Autopilot Mode**, I'll generate your complete Enterprise Architecture model end-to-end with minimal input from you.

---

## STEP 0: ORGANIZATION PROFILE

Please provide a **detailed organizational summary** (500+ words recommended) covering:

✓ **Organization Overview**: Name, industry, size, mission
✓ **Strategic Priorities**: Current goals and timeframes (2026-2028)
✓ **Challenges**: Key problems you're facing today
✓ **Technology Landscape**: Current systems, cloud/AI adoption, tech debt
✓ **Financial Context**: Revenue, growth rate, investment capacity
✓ **Market Position**: Competitors, differentiators, opportunities

**The more detail you provide, the better your EA model will be.**

Once you submit your organizational summary, I'll automatically process it and generate:
→ Strategic Intent
→ Business Model Canvas
→ Capability Map
→ Benchmark Analysis
→ Data Collection & Survey
→ Layers & Gap Analysis
→ Target Architecture & Roadmap

**Paste your organizational summary below to begin!**
```

---

## Input Preprocessing

Before processing, Autopilot mode automatically cleans user input:

```javascript
// Remove HTML tags, markdown formatting, excessive whitespace
// Normalize bullet points, numbered lists, code blocks
// Remove invisible characters
// Trim and format for optimal JSON extraction
```

This ensures copy-pasted content from AI tools (ChatGPT, Claude, etc.) works seamlessly.

---

## Key Differences from Other Modes

| Aspect | Autopilot Mode | Standard Mode | Business Object Mode |
|--------|----------------|---------------|---------------------|
| User questions | 0 (bulk input) | 35 (5 per step × 7) | 9 (3 per step × 3) |
| Input format | 500+ word summary | Q&A dialogue | Q&A dialogue |
| Processing | Batch (all steps) | Sequential (step-by-step) | Sequential (3 steps) |
| Time to complete | 1-2 minutes | 20-30 minutes | 10-15 minutes |
| Target user | Time-constrained | EA practitioners | Business leaders |
| Output quality | Depends on input richness | High (validated) | Strategic focus |

---

## Implementation Notes

- Workflow mode stored in `model.workflowMode = 'autopilot'`
- NO handleDiscoveryMessage calls for Autopilot
- Uses EA_OrganizationProfileProcessor.processOrganizationalSummary()
- Profile stored in `model.organizationProfile`
- Completeness score in `model.organizationProfileCompleteness`
- Auto-proceed to Step 1 after profile creation
- User can switch to Standard/Business Object mode later

---

## Error Handling

If organizational summary is too short (<100 chars):

```
❌ Organization summary must be at least 100 characters.

Current length: [X] characters.

Please provide more detail about:
- Organization overview
- Strategic priorities
- Challenges & opportunities
- Technology landscape
```

---

**Document Version:** 1.0  
**Last Updated:** April 22, 2026  
**Owner:** NextGen EA Platform V4
