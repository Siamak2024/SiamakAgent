# EA Platform Data Contracts — Master Index

**Purpose:** Central index of ALL data contracts for NexGen EA V4 Step 1-7.  
**Last Updated:** 2026-04-05

---

## Quick Reference

| Step | Component | Contract File | Autopilot Instruction | Standard Instruction |
|------|-----------|---------------|----------------------|---------------------|
| **1** | Strategic Intent | [CONTRACT](step1/STRATEGIC_INTENT_DATA_CONTRACT.md) | [1_0_strategic_intent_autopilot](step1/1_0_strategic_intent_autopilot.instruction.md) | [1_1-1_8 (Q1-Q7 + synthesize)](step1/) |
| **2** | Business Model Canvas | [CONTRACT](step2/BMC_DATA_CONTRACT.md) | [2_0_bmc_autopilot](step2/2_0_bmc_autopilot.instruction.md) | [2_1_bmc_current, 2_2_bmc_future](step2/) |
| **3** | Capability Map | [CONTRACT](step3/CAPABILITY_MAP_DATA_CONTRACT.md) | [3_0_capability_map_autopilot](step3/3_0_capability_map_autopilot.instruction.md) | [3_1_capability_map, 3_2_assess, 3_3_benchmark](step3/) |
| **4** | Operating Model | [CONTRACT](step4/OPERATING_MODEL_DATA_CONTRACT.md) | [4_0_operating_model_autopilot](step4/4_0_operating_model_autopilot.instruction.md) | [4_1_current, 4_2_target, 4_3_delta](step4/) |
| **5** | Gap Analysis | [CONTRACT](step5/GAP_ANALYSIS_DATA_CONTRACT.md) | [5_0_gap_analysis_autopilot](step5/5_0_gap_analysis_autopilot.instruction.md) | [5_1_gaps, 5_2_priority, 5_3_quick_wins](step5/) |
| **6** | Value Pools | [CONTRACT](step6/VALUE_POOLS_DATA_CONTRACT.md) | [6_0_value_pools_autopilot](step6/6_0_value_pools_autopilot.instruction.md) | [6_1_value_pools, 6_2_options_matrix](step6/) |
| **7** | Transformation Roadmap | [CONTRACT](step7/ROADMAP_DATA_CONTRACT.md) | [7_0_roadmap_autopilot](step7/7_0_roadmap_autopilot.instruction.md) | [7_1_principles, 7_2_target, 7_3_decisions, 7_4_waves](step7/) |

---

## Generation Modes

### Autopilot Mode
**Context:** User chooses "Autopilot" workflow → answers 3 questions (industry, region, detailLevel)  
**Behavior:** AI generates ALL 7 steps automatically from minimal context  
**Instruction Files:** `X_0_*_autopilot.instruction.md` files  
**Requirements:**
- Be decisive — don't ask follow-up questions
- Generate complete, realistic content from limited context
- Use industry-specific examples from contracts
- Prioritize speed + completeness over perfection
- All mandatory fields must be populated

### Standard Mode (Question-by-Question)
**Context:** User chooses "Standard Workflow" → guided discovery with 7-20 questions per step  
**Behavior:** AI asks detailed questions, synthesizes responses after each sub-step  
**Instruction Files:** `X_1_*.instruction.md` through `X_N_*.instruction.md` files  
**Requirements:**
- Ask focused questions (2-4 options, <150 words)
- Build context incrementally across sub-steps
- Synthesize final output only after all questions answered
- Allow user to refine/reject AI suggestions
- More interactive, collaborative approach

---

## Usage

### For AI Instruction File Authors
1. **Before writing/editing** any instruction file → READ the corresponding data contract
2. **Output Format section** in instruction MUST match contract schema EXACTLY
3. **Reference the contract** in instruction files: `"See {COMPONENT}_DATA_CONTRACT.md for authoritative schema"`

### For Developers
1. **Before modifying** Autopilot generators → CHECK contract for current schema
2. **When adding new fields** → UPDATE the contract FIRST, then code
3. **Breaking changes** → Require contract version update + migration plan

### For GitHub Copilot
1. **Check contract** BEFORE generating any Step 1-7 AI prompt
2. **Validate JSON** output matches contract schema
3. **Never assume** schema from old code — contracts are source of truth

---

## Critical Rules

### ✅ DO THIS
- Read contract before ANY instruction/code change
- Update contract if schema needs to change
- Reference contract in instruction file output format section
- Validate generated JSON against contract
- Use industry-specific examples from contracts
- Follow anti-patterns documented in contracts

### ❌ NEVER DO THIS
- Modify instruction without checking contract
- Use complex nested objects when contract says simple arrays
- Generate generic content when contract requires industry-specific
- Leave fields empty when contract marks them REQUIRED
- Ignore data type specifications (string vs array)

---

## Common Patterns Across All Contracts

### 1. Industry Realism Required
ALL steps require industry-specific, realistic content:
- Real system names (Salesforce, SAP, Azure) not generic "CRM", "ERP"
- Real regulations (GDPR, PSD2, EU Taxonomy) not "compliance requirements"
- Quantified metrics with baselines and targets
- Specific technologies and vendors common in the industry

### 2. Avoid Generic Consulting Language
❌ "Digital transformation", "Innovation", "Customer focus"  
✅ "Open Banking API Platform (PSD2)", "PropTech Tenant Portal", "AI-Driven Credit Scoring"

### 3. Quantification Over Aspirations
❌ "Improve efficiency", "Increase revenue"  
✅ "€5M annual cost reduction (18% operational efficiency gain)", "Revenue CAGR 8% → 15% by 2027"

### 4. Specificity Over Generality
❌ "Modern architecture", "Better processes"  
✅ "Event-driven microservices on Azure Kubernetes with CQRS pattern", "Automated KYC via RPA (UiPath) reducing onboarding from 14 days to 24 hours"

---

## Schema Validation

### Key Data Type Rules

**STRING fields:**
- Strategic Intent: `strategic_ambition` (2-3 sentences)
- BMC: `value_proposition` (2-4 sentences) — NOT an array!
- Operating Model: All dimension descriptions
- Value Pools: `estimatedValue`, `timeToValue`, `confidence`

**ARRAY fields:**
- Strategic Intent: `strategic_themes`, `success_metrics`, `strategic_constraints`
- BMC: All 8 other fields (customer_segments, channels, etc.)
- Capabilities: `model.capabilities` is the root array
- Gap Analysis: `gaps` array
- Value Pools: `valuePools` array
- Roadmap: `initiatives` array

**OBJECT fields:**
- Strategic Intent: Root is object
- BMC: Root is object
- Operating Model: Root is object with sub-objects (governance, organization, etc.)
- Capability: Each item in array is object
- Gap: Each item in array is object

**NUMBER fields:**
- Capability: `maturity` (integer 1-5)
- Gap: `currentMaturity`, `targetMaturity`, `gap` (integers 1-5)

---

## Anti-Pattern Summary

### Most Common Mistakes (from all contracts)

1. **Wrong data type:**  
   Using arrays when contract specifies string (BMC value_proposition)

2. **Generic content:**  
   "Digital transformation" instead of specific initiatives with real tech

3. **Missing quantification:**  
   "Increase revenue" instead of "€8M incremental revenue by 2027"

4. **Unrealistic assumptions:**  
   Maturity jump from 1 to 5 in 6 months

5. **Missing industry context:**  
   Generic "compliance" instead of "GDPR + PSD2 compliance with BCBS 239 data lineage"

6. **Broken references:**  
   Capability names in gaps that don't exist in capability map

---

## Version History

- **v1.1** — 2026-04-05: Updated Standard-flow instructions with data contract references
  - Added contract references to all Standard mode instructions (1_8, 2_1, 3_1, 4_1, 5_1, 6_1, 7_4)
  - Documented schema differences between Autopilot (quantified, decisive) vs Standard (qualitative, workshop)
  - Clarified that Standard mode uses extended schemas for richer workshop metadata
  - Added conversion notes where hierarchical output must be flattened to match contracts

- **v1.0** — 2026-04-05: Initial creation of all 7 data contracts + 7 Autopilot instructions
  - Step 1: Strategic Intent (1_0_strategic_intent_autopilot.instruction.md)
  - Step 2: BMC (2_0_bmc_autopilot.instruction.md) — fixed value_proposition array→string bug
  - Step 3: Capability Map (3_0_capability_map_autopilot.instruction.md)
  - Step 4: Operating Model (4_0_operating_model_autopilot.instruction.md)
  - Step 5: Gap Analysis (5_0_gap_analysis_autopilot.instruction.md)
  - Step 6: Value Pools (6_0_value_pools_autopilot.instruction.md)
  - Step 7: Transformation Roadmap (7_0_roadmap_autopilot.instruction.md)
  - Updated Autopilot generator functions in NexGen_EA_V4.html with instruction file references

---

## Related Documentation

- **Architecture Principles:** `/memories/ea-platform-architecture-principles.md`
- **UX Design Standards:** `/memories/ea-ux-design-standards.md`
- **Regression Log:** `/memories/regression-prevention.md`

---

## Contact / Questions

If a contract is unclear or needs updating:
1. Check `/memories/ea-platform-architecture-principles.md` for context
2. Review Autopilot generator functions in `NexGen_EA_V4.html` (lines 8606+)
3. Test with actual generation to validate schema
4. Update contract FIRST before changing code/instructions
