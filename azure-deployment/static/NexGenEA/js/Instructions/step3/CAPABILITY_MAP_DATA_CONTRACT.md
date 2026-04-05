# Capability Map Data Contract — Source of Truth

**Purpose:** Define the EXACT JSON structure for Capability Map (Step 3) in NexGen EA V4.  
**Status:** Authoritative — all instruction files MUST conform to this schema.  
**Last Updated:** 2026-04-05

---

## Core Principle

Capability Map is an **array of capability objects** stored in `model.capabilities`.  
Each capability is a flat object (NO deep nesting beyond L2/L3 hierarchy in separate implementation).

---

## Primary Schema (model.capabilities)

```json
[
  {
    "id": "cap_001",
    "name": "Customer Onboarding",
    "domain": "Customer",
    "maturity": 3,
    "strategicImportance": "high",
    "description": "Brief capability description (1-2 sentences)"
  },
  {
    "id": "cap_002",
    "name": "Product Development",
    "domain": "Product",
    "maturity": 2,
    "strategicImportance": "critical",
    "description": "..."
  }
]
```

---

## Field Specifications

### id (STRING - REQUIRED)
- **Format:** `cap_XXX` where XXX is zero-padded 3-digit number
- **Example:** `cap_001`, `cap_012`, `cap_123`
- **Must be unique** across all capabilities

### name (STRING - REQUIRED)
- **Format:** [Verb] [Object] pattern
- **Examples:** "Manage Customer Relationships", "Develop Products", "Execute Marketing Campaigns"
- **Naming Convention:**
  - Use business verbs: Manage, Develop, Deliver, Acquire, Analyse, Plan, Monitor, Execute, Transform, Govern
  - NO technology terms: ❌ "SAP Management", ✅ "Manage Financial Processes"
  - NO org units: ❌ "Finance Department", ✅ "Financial Management"
  - NO processes: ❌ "Order-to-Cash Process", ✅ "Manage Order Fulfillment"

### domain (STRING - REQUIRED)
- **Type:** One of standard EA capability domains
- **Allowed values:**
  - `Customer` — Customer-facing capabilities
  - `Product` or `Service` — Product/service lifecycle
  - `Operations` — Core operational capabilities
  - `Finance` — Financial management
  - `Data` or `Information` — Data/analytics capabilities
  - `Technology` — Technology enablement
  - `Workforce` or `People` — HR and workforce capabilities
  - `Governance` or `Risk` — Governance, risk, compliance
  - `Partnership` or `Channel` — Partner/channel management
- **Industry-Specific Domains:**
  - Real Estate: `Property`, `Tenant`, `Facility`
  - Healthcare: `Patient`, `Clinical`, `Care`
  - Manufacturing: `Supply Chain`, `Production`, `Quality`

### maturity (NUMBER - REQUIRED)
- **Type:** Integer 1-5
- **Values:**
  - `1` — Ad-hoc (no standard process)
  - `2` — Repeatable (some standardization)
  - `3` — Defined (documented, consistent process)
  - `4` — Managed (measured, controlled)
  - `5` — Optimized (continuous improvement, automation)
- **Represents:** CURRENT state maturity (not target)

### strategicImportance (STRING - REQUIRED)
- **Type:** Enum
- **Allowed values:** `low`, `medium`, `high`, `critical`
- **Definition:**
  - `critical` — Core differentiator; strategic theme depends on this
  - `high` — Important for strategic execution
  - `medium` — Necessary operations; optimization target
  - `low` — Commodity; outsourcing/SaaS candidate

### description (STRING - OPTIONAL)
- **Format:** 1-2 sentence capability description
- **Example:** "Manages end-to-end customer onboarding from lead capture to active customer, including KYC, contract execution, and initial service setup."
- **Should answer:** "What does this capability enable the organization to do?"

---

## Autopilot vs Legacy Generation

### Autopilot (generateAutopilotCapabilityMap)
- Generates from Strategic Intent + BMC context
- Simple flat array (no L1/L2/L3 hierarchy stored)
- 8-25 capabilities based on detail level:
  - `low`: 8-10 capabilities
  - `medium`: 12-15 capabilities
  - `high`: 20-25 capabilities
- NO parent/child relationships in data structure

### Legacy (Step 3 via instruction 3_1_capability_map.instruction.md)
- May generate hierarchical structure (L1 domains → L2 capabilities → L3 sub-capabilities)
- Stores in different format if using legacy generator
- CORE capabilities get L3 depth; SUPPORT/COMMODITY stay at L2

---

## Rendering Logic

Capabilities displayed in:
- **Capability Map visualization** — Grouped by domain, colored by strategic importance
- **Gap Analysis** — Current vs target maturity comparison
- **Architecture tab** — Capability-to-application mapping

---

## Domain Selection Principles

### Domain Count
- **5-8 L1 domains** is the optimal range
- **Domains must be:** Exhaustive (cover whole business) AND mutually exclusive

### Industry-Specific Archetype Domains

**Financial Services:**
- Customer, Product, Risk Management, Operations, Technology, Governance & Compliance, Partnerships

**Real Estate:**
- Tenant Services, Property Management, Facility Operations, Finance & Admin, Data & Analytics, Technology, Governance

**Healthcare:**
- Patient Care, Clinical Operations, Administrative, Finance & Billing, Data & Research, Technology, Compliance

**Public Sector:**
- Citizen Services, Case Management, Finance & Procurement, Data & Transparency, Technology, Governance & Policy

**Retail:**
- Customer Experience, Product & Merchandising, Supply Chain, Store Operations, E-commerce, Finance, Data & Analytics

---

## Capability Naming Anti-Patterns

❌ **Technology terms:** "SAP Management", "CRM Administration", "IT Service Management"  
✅ **Business capabilities:** "Manage Financial Processes", "Manage Customer Relationships", "Deliver IT Services"

❌ **Org units:** "Finance Department", "HR Team", "IT Division"  
✅ **Capabilities:** "Financial Management", "Workforce Management", "Technology Enablement"

❌ **Process names:** "Order-to-Cash", "Procure-to-Pay", "Hire-to-Retire"  
✅ **Capabilities:** "Manage Order Fulfillment", "Manage Procurement", "Manage Employee Lifecycle"

❌ **Too many domains:** 12-15 L1 domains becomes unmanageable  
✅ **Right-sized:** 5-8 strategic domains

---

## Strategic Importance Classification

### CRITICAL
- **Definition:** The capabilities that differentiate the organization — where future model depends on excellence
- **Examples:** For Netflix: "Content Recommendation", "Streaming Delivery"; For Amazon: "Logistics Optimization", "Marketplace Platform"
- **Investment:** Strategic investment, innovation focus

### HIGH
- **Definition:** Necessary for strategic execution; good performance required
- **Examples:** "Customer Onboarding", "Product Development", "Marketing Campaign Management"
- **Investment:** Continuous improvement, targeted enhancements

### MEDIUM (SUPPORT)
- **Definition:** Necessary for operations but not differentiating — candidates for optimization/standardization
- **Examples:** "Employee Payroll", "Facilities Management", "Travel & Expense"
- **Investment:** Efficiency focus, standardize & automate

### LOW (COMMODITY)
- **Definition:** Table stakes, no competitive advantage — candidates for outsourcing or SaaS replacement
- **Examples:** "Email & Collaboration", "Basic Accounting", "Office Administration"
- **Investment:** Minimize cost, buy not build

---

## Validation Checklist

Before deploying any Capability Map instruction change:
- [ ] Capabilities array with 8-25 objects based on detail level
- [ ] Each capability has: id, name, domain, maturity, strategicImportance
- [ ] All ids unique and follow `cap_XXX` format
- [ ] All names follow [Verb] [Object] pattern (NO tech/org/process names)
- [ ] Domains are 5-8 standard categories (exhaustive + mutually exclusive)
- [ ] Maturity values are integers 1-5
- [ ] Strategic importance is one of: low, medium, high, critical
- [ ] At least 2-3 capabilities marked as "critical" (core differentiators)
- [ ] Tested with generateAutopilotCapabilityMap() — generates valid JSON

---

## Change Log

- **2026-04-05:** Initial contract created
  - Defined authoritative schema from Autopilot implementation
  - Added capability naming conventions (BIZBOK/TOGAF principles)
  - Documented strategic importance classification
  - Added industry-specific domain archetypes
