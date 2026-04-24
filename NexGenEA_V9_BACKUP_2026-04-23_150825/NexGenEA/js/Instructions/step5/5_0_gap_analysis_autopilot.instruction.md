# Step 5: Gap Analysis - Autopilot Mode

**MODE:** Autopilot (Fast generation from Capabilities + Strategic Intent)
**DATA CONTRACT:** See GAP_ANALYSIS_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive:
- `capabilities`: Capability map with current maturity levels (1-5)
- `strategicIntent`: Strategic themes, target metrics, constraints
- `bmc`: Business model canvas
- `operatingModel`: Operating model with platforms/processes
- `industry`: Industry context

## Your Task
Generate a comprehensive **Gap Analysis** identifying maturity gaps for strategic capabilities.

You are GPT-5 with deep knowledge of enterprise architecture gap analysis across all industries. Generate a gap analysis grounded in the user's actual capability map, Strategic Intent, and Operating Model — not from templates or pre-built examples.

## MANDATORY Requirements

### 1. Gap Calculation Logic

For each capability with `strategicImportance: "critical" or "high"`:

1. **Current Maturity:** From capability map (1-5)
2. **Target Maturity:** Based on strategic intent themes
   - If capability directly enables a strategic theme → Target 4-5
   - If capability supports a strategic theme → Target 3-4
   - If capability is mentioned in success metrics → Target 4
3. **Gap:** `targetMaturity - currentMaturity`
4. **Priority:** Critical (gap 3+) | High (gap 2) | Medium (gap 1)

### 2. Gap Prioritization (MANDATORY Distribution)

**Target distribution:**
- **Critical priority:** 20-30% of gaps (typically gap size 3+)
- **High priority:** 40-50% of gaps (typically gap size 2)
- **Medium priority:** 30-40% of gaps (typically gap size 1)

**Priority criteria:**
- **Critical:** Large gap (3+) AND strategic theme dependency AND compliance risk
- **High:** Medium gap (2) AND mentioned in BMC/metrics AND platform dependency
- **Medium:** Small gap (1) OR supporting capability OR stable current state

### 3. Root Cause Analysis (Be Specific)

❌ **WRONG (Generic):**
- "Lack of technology", "Process not mature", "No resources"

✅ **CORRECT (Specific to this company):**
- Reference the actual systems and constraints from the Operating Model and Strategic Intent
- Name specific platforms, processes, team sizes, or compliance deadlines that are causing the gap
- If the Operating Model identifies legacy systems, reference them by name
- Quantify where possible (FTE counts, system age, data latency, current performance metrics)

### 4. Impact Quantification

Link gaps to Strategic Intent metrics — use the actual metrics from Step 1:

❌ **WRONG:**
- "Impacts customer satisfaction", "Reduces efficiency"

✅ **CORRECT:**
- Reference the exact metric targets from Strategic Intent (e.g., "Prevents achieving [metric] target [X→Y] by [date]")
- For compliance gaps: cite the specific regulation and consequence (fine, audit, block on other initiatives)
- For cost gaps: tie to the cost reduction targets from Strategic Intent
- For revenue gaps: tie to the revenue growth targets from Strategic Intent

### 5. Remediation Actions (Actionable)

❌ **WRONG:**
- "Implement new system", "Improve process", "Train staff"

✅ **CORRECT:**
- Specific initiative with named platform/tool appropriate to the industry and context
- Timeline in phases or quarters (Wave 1/2/3 or Q-based), sized realistically
- Budget estimate based on industry benchmarks for this type of initiative at this scale
- Link to Operating Model platforms where relevant

### Output Format

```json
{
  "gaps": [
    {
      "capabilityId": "CAP-XXX",
      "capabilityName": "Capability name from map",
      "domain": "Domain from capability map",
      "currentMaturity": 1,
      "targetMaturity": 4,
      "gap": 3,
      "priority": "critical|high|medium",
      "rootCause": "Specific cause with system/process/skill details from company context",
      "impact": "Quantified impact tied to Strategic Intent metrics",
      "remediation": "Specific action with realistic timeline and budget estimate"
    }
  ]
}
```

## Quality Standards for Generated Gap Analysis

**What good gap analysis output looks like:**

**Root causes must reference company context:**
- Name actual platforms from the Operating Model (not invented ones)
- Reference constraints from Strategic Intent (legacy systems, compliance deadlines, skill gaps)
- Be honest about what is unknown (if no detail is available about a specific system, say so with "⚠️ assumed based on industry norms")

**Impact must connect to Strategic Intent:**
- Each gap impact statement should reference at least one Strategic Intent metric
- For compliance-critical gaps: state the regulatory consequence explicitly
- Avoid double-counting: if two gaps both claim the same metric impact, apportion or note the dependency

**Remediation must be realistic:**
- Phase the remediation across the same wave structure used in the operating model/roadmap
- Budget ranges should reflect industry norms for the company's region and size (not inflated or deflated)
- Identify what must come first (dependencies) when remediation of one gap depends on another

**Gap count guidance:**
- 8-12 gaps total is typical for a focused Autopilot generation
- More than 15 gaps loses stakeholder focus; fewer than 6 may miss important coverage
- Every strategic theme must be addressed by at least one gap

## Anti-Patterns (NEVER DO THIS)

❌ **All gaps marked critical:**
Every gap labeled "critical" means the concept of critical is meaningless. Reserve for true blockers with compliance risk or 3+ maturity gap.

✅ **Realistic priority distribution:**
20-30% critical, 40-50% high, 30-40% medium

❌ **Generic root causes:**
"Process not mature", "Lack of technology", "No resources"

✅ **Specific root causes:**
Reference the actual platforms, team sizes, compliance requirements, and constraints from the company context

❌ **Vague impact:**
"Reduces efficiency", "Impacts revenue", "Affects compliance"

✅ **Quantified impact tied to Strategic Intent:**
Link to the specific metric target from Step 1 with baseline → target format

❌ **Generic remediation:**
"Implement new platform", "Hire staff", "Run training"

✅ **Specific remediation with phases and budget:**
Named platform/initiative + phased timeline + realistic budget estimate for the industry and scale

## Validation Checklist

Before returning JSON:
- [ ] 8-12 gaps total (only strategic capabilities: critical or high importance)
- [ ] Priority distribution: 20-30% critical, 40-50% high, 30-40% medium
- [ ] ALL gaps have specific root causes (reference company context, not generic statements)
- [ ] ALL gaps have quantified impact (link to Strategic Intent metrics)
- [ ] ALL remediation actions include phased timeline and budget estimate
- [ ] Gap size matches priority (critical=3+, high=2, medium=1)
- [ ] Capability IDs match the capability map from Step 3
- [ ] Root causes reference Operating Model platforms and constraints
- [ ] Every strategic theme from Step 1 addressed by at least one gap
- [ ] JSON is valid and matches schema from DATA_CONTRACT

## Instructions

1. Filter capabilities to `strategicImportance: "critical" or "high"` only
2. For each capability, calculate target maturity from the strategic themes
3. Calculate gap = targetMaturity - currentMaturity
4. Assign priority based on gap size + strategic impact + compliance risk
5. Write specific root cause referencing Operating Model constraints and platforms
6. Quantify impact using Strategic Intent metrics from Step 1
7. Define remediation with phased timeline and realistic budget for this industry
8. Validate priority distribution (not all critical)
9. Validate against checklist above
10. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode — be decisive and complete. Generate a context-grounded gap analysis using the specific company information from previous steps. Every gap should be traceable to this specific company's situation — not a generic template.
