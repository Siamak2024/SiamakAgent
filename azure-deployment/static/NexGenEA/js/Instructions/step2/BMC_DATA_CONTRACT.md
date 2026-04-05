# BMC Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Business Model Canvas data in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

The application uses **simple arrays and strings**. DO NOT use complex nested objects for BMC fields unless explicitly documented here.

---

## Primary BMC Schema (model.bmc)

This is the TARGET STATE (TO-BE) model used by the application:

```json
{
  "value_proposition": "String (2-4 sentences) — NOT an array",
  "customer_segments": ["Array of strings"],
  "channels": ["Array of strings"],
  "customer_relationships": ["Array of strings"],
  "key_activities": ["Array of strings"],
  "key_resources": ["Array of strings"],
  "key_partners": ["Array of strings"],
  "cost_structure": ["Array of strings — NOT an object"],
  "revenue_streams": ["Array of strings — NOT an object"]
}
```

### Field Specifications

#### value_proposition (STRING)
- **Type:** String (NOT array)
- **Format:** 2-4 coherent sentences
- **Pattern:** "We help [segment] achieve [outcome] by providing [solution]. Unlike [alternative], our [differentiator] enables [benefit]. This supports [strategic theme]."
- **Rendered as:** Text block (parseMarkdown applied)
- **NEVER:** `[]`, `["prop1","prop2"]`, `null`, `""`

#### All other fields (ARRAYS)
- **Type:** Array of strings
- **Rendered as:** `<ul><li>` list
- **Empty state:** `[]` or missing (shows "Not yet defined")

---

## Secondary BMC Schemas

### Current State BMC (model.bmc_current)
Same structure as `model.bmc` — represents AS-IS model.

### BMC Analysis (model.bmc_analysis)
Used by legacy `generateBMC()` for CURRENT → TARGET transformation analysis:

```json
{
  "blocks_requiring_transformation": ["Key Activities", "Revenue Streams"],
  "revenue_concentration_risk": "String description",
  "new_revenue_streams_enabled": ["Array of new streams"],
  "cost_lines_addressable": ["Array of cost categories that can be optimized"]
}
```

---

## Autopilot vs Legacy Generation

### Autopilot (generateAutopilotBMC)
- Generates **simplified BMC** directly into `model.bmc`
- NO current/target split
- NO analysis object
- Uses instruction: `2_0_bmc_autopilot.instruction.md`

### Legacy (_v5LegacyBMC)
- Generates **dual-state BMC**: `current_state_bmc` + `target_state_bmc` + `model_shift_analysis`
- Maps to: `model.bmc_current`, `model.bmc`, `model.bmc_analysis`
- Uses custom prompt (MAY use `window._stepPrompts.step_2` if configured)
- Intended for Step 2 regeneration after manual discussion

---

## Rendering Logic

### renderBMCPanel() (line 10980)
```javascript
const bmc = model.bmc;  // Target state
const hasDual = !!model.bmc_current;  // Does AS-IS exist?
const activeBmc = activeState === 'current' ? model.bmc_current : bmc;

// Value Proposition rendered as TEXT
_bmcBlock('bmc-block-vp', 'Value Proposition', b.value_proposition, true)

// All others rendered as LISTS
_bmcBlock('bmc-block-kp', 'Key Partners', b.key_partners, false)
```

**Critical:** `isText=true` for value_proposition ONLY. All others are arrays.

---

## BMC Canvas Display (line 11800+)

Shows traditional Osterwalder 9-block layout:
1. Key Partners (column 1, rows 1-2)
2. Key Activities (column 2, row 1)
3. Key Resources (column 2, row 2)
4. Value Propositions (column 3, rows 1-2) ← **CENTER, spans 2 rows**
5. Customer Relationships (column 4, row 1)
6. Channels (column 4, row 2)
7. Customer Segments (column 5, rows 1-2)
8. Cost Structure (bottom row, columns 1-3)
9. Revenue Streams (bottom row, columns 4-5)

**UI expects:**
- `bmc.value_proposition` → string (displays in cell 4)
- `bmc.key_partners` → array (displays as list)
- etc.

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ **WRONG:** `"value_propositions": ["prop1", "prop2"]`  
✅ **RIGHT:** `"value_proposition": "We help X achieve Y..."`

❌ **WRONG:** `"cost_structure": {"drivers": ["IT", "Staff"], "type": "cost-driven"}`  
✅ **RIGHT:** `"cost_structure": ["IT infrastructure", "Staff salaries", "Marketing"]`

❌ **WRONG:** `"revenue_streams": {"model": "SaaS", "streams": [...]}`  
✅ **RIGHT:** `"revenue_streams": ["Subscription fees (SaaS, monthly)", "Professional services", "Partner revenue share"]`

---

## Instruction File Requirements

All step2 instruction files MUST:
1. Output the schema documented above (simple arrays + value_proposition as string)
2. Reference this contract: "See BMC_DATA_CONTRACT.md for authoritative schema"
3. Include examples using the CORRECT data types
4. Never use complex objects for cost_structure or revenue_streams

---

## Validation Checklist

Before deploying any BMC instruction change:
- [ ] value_proposition is STRING (2-4 sentences)
- [ ] All 8 other fields are ARRAYS of strings
- [ ] No nested objects in cost_structure or revenue_streams
- [ ] Tested with renderBMCPanel() — displays correctly
- [ ] Autopilot generates valid JSON matching this contract
- [ ] Legacy generation (if modified) still works

---

## Change Log

- **2026-04-05:** Initial contract created after discovering instruction/application mismatch
  - Fixed value_propositions → value_proposition (array → string)
  - Fixed cost_structure (object → array)
  - Fixed revenue_streams (object → array)
  - Created 2_0_bmc_autopilot.instruction.md with correct schema
