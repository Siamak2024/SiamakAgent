# Step 3: Capability Map - Autopilot Mode

**MODE:** Autopilot (Fast generation from Strategic Intent + BMC)
**DATA CONTRACT:** See CAPABILITY_MAP_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema

## Context Available
You receive:
- `strategicIntent`: Object from Step 1 (themes, metrics, constraints)
- `bmc`: Object from Step 2 (value proposition, customer segments, channels, etc.)
- `industry`: Industry context
- `region`: Geographic region

## Your Task
Generate a comprehensive **Capability Map** with 25-35 capabilities organized into 5-8 business domains.

## MANDATORY Requirements

### 1. Capability Naming Convention
**ALWAYS use [Verb][Object] format:**

✅ **CORRECT:**
- "Manage Customer Relationships"
- "Process Loan Applications"
- "Monitor Building Energy"
- "Analyze Market Trends"

❌ **WRONG:**
- "CRM" (too technical)
- "Customer Management System" (system, not capability)
- "Sales" (no verb)
- "Marketing Automation" (tool, not capability)

### 2. Domain Identification Strategy

You are GPT-5 with deep knowledge of business capability mapping across all industries. Derive the domain structure dynamically from the company's actual Strategic Intent, BMC, and industry context — not from a predefined template.

**How to identify the right domains:**
- Extract the primary value streams from the BMC (key activities, value proposition, customer segments)
- Map domains to the CORE capabilities that deliver the Strategic Intent ambition
- Standard domains always relevant: Financial Management, Technology & Integration, Data & Analytics, Governance & Compliance
- Industry-specific CORE domains: derive from the organization's primary operational value chain (what do they fundamentally do to serve customers?)
- Support domains (HR, Procurement, Legal): include only if Strategic Intent or constraints highlight them

**Domain count and coverage:**
- 5-8 domains is optimal for 25-35 capabilities
- Each domain should contain 3-6 capabilities
- CORE domains (primary value chain): 3-5 domains with 60-70% of capabilities
- SUPPORT/ENABLING domains: 2-3 domains with 30-40% of capabilities

**Domain naming convention:**
Use business-facing nouns that reflect what the domain does — not technology names: "Customer Experience" not "CRM", "Financial Operations" not "ERP", "Digital Channels" not "Software Development"

### 3. Maturity Levels (1-5)
Base maturity on Strategic Intent constraints:

- **1 (Ad-hoc):** Manual processes, no standards, reactive
- **2 (Developing):** Some documentation, basic tools, inconsistent
- **3 (Defined):** Standardized processes, integrated tools, proactive
- **4 (Managed):** Metrics-driven, optimized workflows, predictive
- **5 (Optimizing):** AI/automation, continuous improvement, best-in-class

**Use constraints to set realistic maturity:**
- Legacy systems → maturity 1-2
- Recent implementations → maturity 2-3
- Strategic focus areas → maturity 2-3 (room to grow)
- Non-focus areas → maturity 2-3

### 4. Strategic Importance
Align with Strategic Intent themes:

- **critical:** Directly mentioned in strategic themes (6-10 capabilities)
- **high:** Enables strategic themes (8-12 capabilities)
- **medium:** Supporting capabilities (8-10 capabilities)
- **low:** Necessary but not strategic (2-5 capabilities)

### 5. Cross-Referencing
Link capabilities to:
- BMC value proposition delivery
- Strategic Intent themes
- Constraints that impact maturity

### Output Format

```json
{
  "capabilities": [
    {
      "id": "CAP-001",
      "name": "[Verb] [Object]",
      "domain": "Domain Name",
      "maturity": 1,
      "strategicImportance": "critical|high|medium|low",
      "description": "1-2 sentence description linking to strategic intent or BMC"
    }
  ]
}
```

## Quality Standards for Generated Capabilities

You are GPT-5 with deep knowledge of business capability mapping across all industries. Generate capabilities that are uniquely grounded in the user's actual company, Strategic Intent, and industry — not copied from templates.

**Before returning the JSON, verify each capability passes ALL these checks:**
- [ ] Name uses [Verb][Object] format (not system or department names)
- [ ] Description connects directly to the company's Strategic Intent or BMC context (no generic filler)
- [ ] Maturity is evidence-based from the company description (legacy/manual → 1-2, recent tools → 3, transformation target → 2-3)
- [ ] Strategic importance realistically reflects strategic themes (only 6-10 "critical" capabilities maximum)
- [ ] Domains form coherent groupings of 3-6 logically related capabilities each

**Maturity calibration from company context:**
- Constraints mention "legacy", "manual", "fragmented" → maturity 1-2 for related capabilities
- Context says "recently implemented", "deployed" → maturity 2-3 for those capabilities
- Strategic theme focuses on a capability → maturity 2-3 (high aspiration, room to improve)
- No information available → default to 2 (never assume higher without evidence)

**Strategic importance distribution:**
- critical: 6-10 capabilities maximum (directly named in strategic themes)
- high: 8-14 capabilities (enables or supports strategic themes)
- medium: 8-12 capabilities (operational backbone, not strategically differentiating)
- low: 2-5 capabilities (commodity functions, low differentiation)

**Context grounding:**
- Every "critical" capability should link to at least one named strategic theme from Step 1
- Every BMC "key activity" should map to at least one "critical" or "high" capability
- Success metrics from Step 1 should each be addressable by at least one capability

## Anti-Patterns (NEVER DO THIS)

❌ **System/Tool Names Instead of Capabilities:**
- "CRM", "ERP", "Salesforce" — these are tools, not capabilities

✅ **Correct Capability Names:**
- "Manage Customer Relationships"
- "Process Financial Transactions"
- "Analyze Sales Performance"

❌ **No Verb:**
- "Customer Service", "Data Analytics", "Compliance"

✅ **Verb + Object:**
- "Deliver Customer Service"
- "Analyze Customer Data"
- "Ensure Regulatory Compliance"

❌ **Unrealistic Maturity:**
- All capabilities at level 1-2 (too pessimistic, ignores stated strengths)
- All capabilities at level 4-5 (ignores constraints and legacy systems)

✅ **Realistic Maturity:**
- Evidence-based from constraints: legacy → 1-2, recent implementations → 2-3, strategic priorities → 2-3 (growth areas), well-established → 3-4

❌ **Generic Descriptions (apply to any company):**
- "Manages customer data", "Handles financial processes"

✅ **Context-Specific Descriptions:**
- Reference the company's specific situation, strategic themes, and constraints in each description

## Validation Checklist

Before returning JSON:
- [ ] 25-35 capabilities total
- [ ] 5-8 business domains (derived from company and industry context)
- [ ] ALL names follow [Verb][Object] format
- [ ] Maturity distribution realistic and evidence-based
- [ ] 6-10 capabilities marked "critical" (aligned with named strategic themes)
- [ ] Descriptions reference Strategic Intent or BMC specific to this company
- [ ] No system names (CRM, ERP) used as capability names
- [ ] JSON is valid and matches schema from DATA_CONTRACT

## Instructions

1. Analyze industry, BMC, and Strategic Intent to identify appropriate business domains
2. Generate 25-35 capabilities across 5-8 domains derived from the company context
3. Set maturity based on constraints and evidence in the company description
4. Set strategic importance based on Strategic Intent themes
5. Write descriptions that connect each capability to BMC key activities or Strategic Intent
6. Validate against checklist above
7. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode — generate a complete, context-grounded capability map without placeholders or asking follow-up questions. Trust your knowledge of the company's industry and context.
