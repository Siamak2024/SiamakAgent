# Gap Analysis Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Gap Analysis (Step 5) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

Gap Analysis is an **array of gap objects** stored in `model.gapAnalysis.gaps`.  
Each gap represents current vs target maturity for a capability.

---

## Primary Schema (model.gapAnalysis)

```json
{
  "gaps": [
    {
      "capability": "Customer Onboarding",
      "currentMaturity": 2,
      "targetMaturity": 4,
      "gap": 2,
      "priority": "high",
      "reasoning": "String — Why this gap matters and what needs to change",
      "ai_enabled_gap": false
    },
    {
      "capability": "Data Analytics",
      "currentMaturity": 1,
      "targetMaturity": 5,
      "gap": 4,
      "priority": "critical",
      "reasoning": "...",
      "ai_enabled_gap": false
    }
  ]
}
```

---

## Field Specifications

### gaps (ARRAY - REQUIRED)
Array of 8-12 capability gaps (top priorities).

Each gap object contains:

#### capability (STRING - REQUIRED)
- **Type:** Capability name (must match capability from Step 3)
- **Example:** "Customer Onboarding", "Product Development", "Risk Management"
- **Must exist** in `model.capabilities` array

#### currentMaturity (NUMBER - REQUIRED)
- **Type:** Integer 1-5
- **Values:**
  - `1` — Ad-hoc (no standard process)
  - `2` — Repeatable (some standardization)
  - `3` — Defined (documented process)
  - `4` — Managed (measured, controlled)
  - `5` — Optimized (continuous improvement)
- **Source:** From `model.capabilities[].maturity` (current state)

#### targetMaturity (NUMBER - REQUIRED)
- **Type:** Integer 1-5 (same scale as currentMaturity)
- **Must be:** Greater than or equal to currentMaturity
- **Strategic alignment:** Higher targets for "critical" importance capabilities
- **Feasibility:** Consider timeframe — don't jump from 1 to 5 in 12 months

#### gap (NUMBER - REQUIRED)
- **Type:** Integer (calculated)
- **Formula:** `targetMaturity - currentMaturity`
- **Range:** 0-4 (0 = no gap, 4 = maximum gap)
- **Example:** Current 2 → Target 4 = Gap 2

#### priority (STRING - REQUIRED)
- **Type:** Enum
- **Allowed values:** `low`, `medium`, `high`, `critical`
- **Factors influencing priority:**
  - Strategic importance of capability
  - Size of gap (larger gap = may be higher priority)
  - Enabler for other capabilities
  - Alignment with strategic themes
  - Dependencies (foundational capabilities first)
- **Distribution:** Aim for 2-3 "critical", 3-5 "high", rest "medium"

#### reasoning (STRING - REQUIRED)
- **Format:** 2-3 sentences explaining:
  1. Why this gap exists (root cause)
  2. Why closing it matters (business impact)
  3. What needs to change (key interventions)
- **Example:** "Customer onboarding is manual and paper-based, taking 14 days on average. Digital competitors complete onboarding in 24 hours, putting us at risk of customer churn. Need to implement digital identity verification, automated document processing, and self-service portal to reach target state."
- **Must be SPECIFIC:** Reference actual systems, processes, timeframes, competitors

#### ai_enabled_gap (BOOLEAN - OPTIONAL, Phase 2.4)
- **Type:** Boolean, default false
- **Purpose:** Flag gaps related to AI-enabled capabilities for prioritization and architecture planning
- **Criteria:** Set to `true` if:
  - The capability has `ai_enabled: true` in Step 3 Capability Map
  - Closing the gap involves AI/ML implementation (e.g., predictive analytics, automated decision-making, intelligent automation)
  - References Strategic Intent ai_transformation_themes or BMC ai_enabled_activities
- **Examples:**
  - ✅ `true`: "Predictive Demand Forecasting" gap (AI-enabled capability), "Automated Claims Processing" gap (requires ML model)
  - ❌ `false`: "Manual Invoice Approval" gap (no AI), "Employee Onboarding" gap (process improvement, not AI)
- **Usage:**
  - High priority for AI transformation strategies
  - Informs Step 6 Value Pools (AI-enabled value)
  - Informs Step 7 Architecture (which gaps need AI agent layers)
  - Enables AI initiative grouping in roadmap

---

## Gap Prioritization Logic

### CRITICAL Priority
- **Criteria:**
  - Blocks strategic themes (can't execute strategy without this)
  - Large gap (3-4 levels) on high/critical importance capability
  - Foundational for multiple other capabilities
- **Example:** "Data Platform" at maturity 1, needs to be 4 — enables analytics, AI, reporting

### HIGH Priority
- **Criteria:**
  - Supports strategic themes directly
  - Gap of 2-3 levels on medium/high importance
  - Customer-facing or revenue-impacting
- **Example:** "Customer Onboarding" at 2, target 4 — impacts customer experience KPI

### MEDIUM Priority
- **Criteria:**
  - Gap of 1-2 levels on support capabilities
  - Important but not blocking strategy
  - Can be addressed in later phases
- **Example:** "Employee Performance Management" at 2, target 3 — nice to have but not strategic

### LOW Priority
- **Criteria:**
  - Small gap (1 level) on commodity capabilities
  - No strategic impact
  - May outsource instead of improving
- **Example:** "Travel & Expense Management" at 2, target 3 — low strategic value

---

## Autopilot vs Legacy Generation

### Autopilot (generateAutopilotGapAnalysis)
- Analyzes capabilities from Step 3
- Generates 8-10 top gaps automatically
- Prioritizes based on strategic importance + gap size
- Simple reasoning (1-2 sentences)

### Legacy (Gap analysis via detailed assessment)
- May include more detailed root cause analysis
- Can reference specific architecture decisions
- May include cost estimates per gap
- Integration with value pool analysis

---

## Rendering Logic

Gap Analysis displayed in:
- **Gap Analysis tab** — Table/chart showing current vs target
- **Roadmap planning** — Gaps inform initiative prioritization
- **Value Pool analysis** — Closing gaps unlocks value

---

## Industry-Specific Examples

### Financial Services
```json
{
  "capability": "Real-Time Payment Processing",
  "currentMaturity": 2,
  "targetMaturity": 5,
  "gap": 3,
  "priority": "critical",
  "reasoning": "Batch-based payment processing (T+2 settlement) is being disrupted by instant payment competitors. PSD2 and real-time payment schemes (Swish, SEPA Instant) require sub-second processing. Need to migrate to event-driven architecture with in-memory processing and ISO 20022 messaging."
}
```

### Real Estate
```json
{
  "capability": "ESG Reporting & Compliance",
  "currentMaturity": 1,
  "targetMaturity": 4,
  "gap": 3,
  "priority": "critical",
  "reasoning": "EU Taxonomy disclosure requirements mandate detailed energy, waste, and carbon reporting from 2024. Currently manual Excel-based; no automated data collection from buildings. Need IoT sensor deployment, automated data aggregation, and CSRD-compliant reporting platform."
}
```

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ **Generic reasoning:** `"reasoning": "This capability needs improvement to meet strategic goals"`  
✅ **Specific reasoning:** `"reasoning": "Current manual credit approval takes 5 days vs 1-hour competitor benchmark, causing 20% application abandonment. Need AI-driven credit scoring engine and automated decisioning for <€50K loans to hit target NPS of 65."`

❌ **Misaligned priorities:** All gaps marked "critical"  
✅ **Balanced priorities:** 2-3 critical, 3-5 high, rest medium (reflects realistic capacity)

❌ **Unrealistic targets:** Current 1 → Target 5 in 6 months  
✅ **Feasible targets:** Current 1 → Target 3 in 12 months (2-level jump per year is realistic)

❌ **Missing capability reference:** Capability name doesn't exist in model.capabilities  
✅ **Valid reference:** Capability name exactly matches entry in Step 3 capability map

---

## Validation Checklist

Before deploying any Gap Analysis instruction change:
- [ ] gaps array with 8-12 objects
- [ ] Each gap has: capability, currentMaturity, targetMaturity, gap, priority, reasoning
- [ ] All capability names exist in model.capabilities
- [ ] currentMaturity values match capability maturity from Step 3
- [ ] targetMaturity >= currentMaturity (never lower)
- [ ] gap = targetMaturity - currentMaturity (calculated correctly)
- [ ] Priorities distributed realistically (2-3 critical, 3-5 high)
- [ ] Reasoning is SPECIFIC with concrete details (times, systems, impacts)
- [ ] Tested with generateAutopilotGapAnalysis() — generates valid JSON

---

## Change Log

- **2026-04-05:** Initial contract created
  - Defined authoritative schema from Autopilot implementation
  - Added gap prioritization logic and criteria
  - Documented industry-specific examples
  - Added anti-patterns for generic vs specific content
