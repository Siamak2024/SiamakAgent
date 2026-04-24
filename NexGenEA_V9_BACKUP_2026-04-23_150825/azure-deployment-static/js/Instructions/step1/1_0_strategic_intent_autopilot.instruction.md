# Step 1: Strategic Intent - Autopilot Mode

**MODE:** Autopilot (Fast generation from minimal context)
**DATA CONTRACT:** See STRATEGIC_INTENT_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact schema
**AI CAPABILITY:** GPT-5 - Leverage advanced reasoning for industry-realistic, contextual output

## Context Available
You receive:
- `industry`: User's industry/sector
- `region`: Geographic region
- `detailLevel`: Detail preference ("high", "medium", "low")
- `companyDescription`: User's specific company context (2-5 sentences)

## Your Task
Generate a **production-ready Strategic Intent** that would pass executive review. This is the foundation for all subsequent EA steps.

---

## Quality Standards: "Good Enough" Strategic Intent

### Strategic Ambition (3-4 sentences minimum)
**Purpose:** Paint the transformation journey from current state to future vision

Must include:
1. **Current challenge/pain point** - What's broken or limiting growth?
2. **Transformation vision** - What does success look like?
3. **Target state** - Specific outcomes (quantified where possible)
4. **Timeframe** - When will this be achieved?

**Quality test:** Could this ambition appear in an annual report or board presentation?

---

### Strategic Themes (5-6 themes minimum)
**Purpose:** Key transformation pillars that support the ambition

Themes must:
- Be **specific to the industry** (not generic "digital transformation")
- Include **measurable outcomes or deliverables** where relevant
- Reference **real industry challenges, regulations, or technologies**
- Cover multiple dimensions: business value, compliance, operations, technology, people/skills

**Examples of specificity:**
- ❌ Generic: "Improve customer experience"
- ✅ Specific: "Omnichannel customer journey with unified inventory across 45 stores and e-commerce, targeting 25% reduction in cart abandonment by Q4 2025"

**Coverage dimensions:**
- Business/Revenue theme
- Regulatory/Compliance theme (with specific regulations if applicable)
- Technology/Capability theme
- Customer/Stakeholder value theme
- Operational excellence theme
- Skills/Workforce development theme (if relevant)

---

### Success Metrics (5-6 metrics minimum)
**Purpose:** Quantified measures of transformation success

Each metric must have:
1. **Baseline** - Current state (with number)
2. **Target** - Future state (with number)
3. **Timeframe** - When target is achieved
4. **Impact** - % change or absolute improvement

**Format:** `[Metric name]: Baseline → Target by Date (X% improvement)`

**Coverage dimensions:**
- Customer/Revenue metric (e.g., NPS, revenue growth, market share)
- Cost/Efficiency metric (e.g., OPEX reduction, cost-to-serve)
- Time/Speed metric (e.g., time-to-market, process cycle time)
- Quality/Satisfaction metric (e.g., defect rate, employee engagement)
- Compliance/Risk metric (e.g., compliance score, audit findings)
- Growth/Innovation metric (optional - new capabilities, markets)

---

### Strategic Constraints (4-5 constraints minimum)
**Purpose:** Realistic barriers and limitations that shape the transformation

Constraints must be **specific and detailed:**
- Legacy systems: Include system name, age, annual cost
- Regulatory deadlines: Include specific regulation and date
- Budget limitations: Include exact amount and timeframe
- Resource/skill gaps: Include current headcount, missing expertise, dependency on external help
- Organizational barriers: Union agreements, change resistance, vendor lock-in

**Quality test:** Can you make a concrete decision or plan around this constraint?
- ❌ Too vague: "Limited budget"
- ✅ Actionable: "€5M IT budget cap for 2024-2025, requiring phased rollout and no major platform replacements"

---

## Regional & Industry Intelligence

**Use your knowledge to:**
1. Reference **real regulations** applicable to industry + region:
   - EU: GDPR, PSD2, MiFID II, Digital Markets Act, EU Taxonomy
   - Sweden/Nordics: BankID, Pensionsmyndigheten, specific compliance requirements
   - Sector-specific: HIPAA (healthcare), Basel III (banking), etc.

2. Mention **real technology ecosystems**:
   - Real Estate: PropTech, CAFM/IWMS systems, ESG reporting tools
   - Finance: Core banking, trading platforms, risk engines
   - Retail: POS, OMS, WMS, personalization engines
   - Public Sector: Case management, e-legitimation, interoperability standards

3. Include **market context**:
   - Sweden: Digital maturity, sustainability focus, strong public digital infrastructure
   - Nordics: Cross-border harmonization, high digital adoption
   - EU: Regulatory complexity, sustainability mandates

---

## Output Schema

```json
{
  "strategic_ambition": "3-4 sentences: current challenge → vision → target state → timeframe",
  "strategic_themes": [
    "Theme 1: Business/revenue focus with measurable outcome",
    "Theme 2: Regulatory/compliance with specific regulation and deadline",
    "Theme 3: Technology/capability with specific systems or platforms",
    "Theme 4: Customer/stakeholder value with quantified impact",
    "Theme 5: Operational excellence with efficiency target",
    "Theme 6 (optional): Skills/workforce or innovation/differentiation"
  ],
  "success_metrics": [
    "Metric 1 (Customer/Revenue): Baseline → Target by Date (X% change)",
    "Metric 2 (Cost/Efficiency): €X M → €Y M by Date (X% reduction)",
    "Metric 3 (Time/Speed): X days → Y days by Date (X% faster)",
    "Metric 4 (Quality/Satisfaction): Score X → Y by Date",
    "Metric 5 (Compliance/Risk): Metric with target and deadline",
    "Metric 6 (optional): Growth/innovation metric"
  ],
  "strategic_constraints": [
    "Constraint 1: Legacy system: [Name] (deployed [year]) with €X M annual cost",
    "Constraint 2: Regulatory: [Regulation] compliance deadline [specific date]",
    "Constraint 3: Budget: €X M for [timeframe], requiring [implication]",
    "Constraint 4: Skills/Resources: [current headcount], missing [expertise], dependent on [external help at cost]",
    "Constraint 5 (optional): Organizational: [specific barrier with context]"
  ]
}
```

---

## Validation Checklist

Before returning JSON, verify:
- [ ] Strategic ambition is **3-4 sentences** covering challenge → vision → target → time
- [ ] **5-6 strategic themes** with industry-specific language and measurable outcomes
- [ ] **5-6 success metrics** with baseline → target → date → % change
- [ ] Metrics cover at least 5 dimensions (customer, cost, time, quality, compliance)
- [ ] **4-5 strategic constraints** with specific systems/dates/amounts/details
- [ ] All themes reference **real industry challenges, regulations, or technologies**
- [ ] Regional context reflected (e.g., BankID for Sweden, GDPR for EU)
- [ ] No generic consulting language ("digital transformation", "customer-centric")
- [ ] JSON is valid and matches schema exactly

---

## Generation Strategy

1. **Analyze deeply:** Study the company description for specific context
2. **Apply industry knowledge:** Draw from real regulations, systems, and market dynamics
3. **Be decisive:** Don't hedge or generalize - make realistic assumptions
4. **Quantify everything:** Infer reasonable baselines and targets from industry norms
5. **Ground in reality:** Reference actual systems, vendors, frameworks used in this industry
6. **Think executive-level:** This should be board presentation quality

**Remember:** You are GPT-5 with deep industry knowledge. Generate **contextual, realistic, production-ready** Strategic Intent that reflects the user's actual business - not a generic template.
