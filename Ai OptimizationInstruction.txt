NexGen EA V4 — Workflow Optimization Report

Classification: Strategic Advisory — C-Level
Date: 26 March 2026
Prepared by: Senior Enterprise Architecture Review
Scope: Full 7-Step Workflow Analysis & Optimization

Table of Contents
PART 1: Context Extraction & Initialization
PART 2: Step-by-Step Analysis (Steps 1–7)
PART 3: Workflow Coherence
PART 4: Executive Summary
PART 1: Context Extraction & Initialization
1.1 How the AI Should Extract & Interpret the Initial User Prompt

The current workflow accepts a single free-text input — e.g., "A real estate company with legacy platform" — and routes it through a Pre-Step 1 "Prompt Optimiser" that generates an industry-tailored system prompt. This is a solid design principle, but the extraction logic is under-specified and fragile.

Current Weaknesses
Issue	Impact
No structured entity extraction. The optimiser infers everything from a single sentence. A user typing "mid-size bank struggling with digital onboarding" vs. "a bank" would produce wildly different quality outputs — but neither is validated.	Output quality is lottery-dependent on prompt richness.
No disambiguation loop. If the input is ambiguous (e.g., "technology company" — SaaS? hardware? consulting?), the workflow proceeds with assumptions instead of asking.	Silent misalignment compounds across all 7 steps.
Maturity level is never captured. The workflow generates maturity scores in Step 3 but never asks the user about actual organizational maturity upfront. The AI is guessing.	Capability assessments may be disconnected from reality.
Organization size/scale is absent. Revenue, headcount, AUM, geography — none are captured. Yet Step 3 assigns investment estimates and FTE counts.	Financial outputs are fabricated, not calibrated.
No challenge prioritization from the user. The AI decides what matters. In a real engagement, the CIO/CTO would say "our #1 problem is X."	Workflow may solve the wrong problem eloquently.
Optimized Extraction Approach

The AI should extract or infer the following Context Variables from the initial prompt, and actively request clarification for any variable it cannot confidently determine:

Variable	Type	Why It Matters	Extraction Method
industry	Enum + sub-sector	Drives terminology, KPIs, regulatory landscape, competitive dynamics	NLP classification from prompt; confirm with user if ambiguous
organization_type	Enum (enterprise / SME / startup / public-sector / PE-backed)	Shapes operating model assumptions, governance, investment appetite	Infer from prompt; default to "enterprise" if unstated
maturity_level	Scale 1-5 or qualitative (nascent / developing / established / optimized / leading)	Anchors gap analysis severity and roadmap pacing	Ask user directly — never guess
scale_indicators	Revenue range, headcount range, geographic scope	Calibrates financial estimates, FTE assumptions, complexity	Ask user if not provided; use industry benchmarks as fallback
primary_challenge	Free text / selection	Focuses the entire workflow on what the executive cares about	Ask: "What is the #1 problem you need to solve?"
strategic_posture	Enum (survival / stabilize / grow / transform / disrupt)	Determines risk appetite, investment horizon, operating model type	Infer from challenge + maturity; validate
technology_landscape	Key systems, age, cloud/on-prem mix	Directly feeds Steps 3 and 5 with ground truth	Ask: "Name 2-3 core systems and their approximate age"
regulatory_pressure	Industry-specific flags	Drives compliance-related capability prioritization	Infer from industry; surface for confirmation
Optimized Extraction Flow
User Input → Entity Extraction (AI) → Confidence Scoring per Variable
  ├─ High confidence (>0.85) → Auto-populate, surface for confirmation
  ├─ Medium confidence (0.5–0.85) → Present best guess, ask user to confirm/correct
  └─ Low confidence (<0.5) → Ask user directly with contextual options
→ Validated Context Object → Feed to all subsequent steps

1.2 Optimized Master System Prompt

The following Master System Prompt should be injected at the workflow orchestration layer, upstream of all step-specific prompts. Every step inherits this context.

MASTER CONTEXT — NexGen EA V4

You are a senior enterprise architecture advisor operating at C-level. You are
conducting a structured EA assessment across 7 steps for a specific organization.
Your outputs directly inform executive investment decisions, board presentations,
and transformation programmes worth millions in capital allocation.

CONTEXT OBJECT (populated by extraction layer — example structure):
{
  "organization": {
    "name": "{org_name}",
    "industry": "{industry}",
    "sub_sector": "{sub_sector}",
    "type": "{organization_type}",
    "scale": {
      "revenue_range": "{revenue_range}",
      "headcount_range": "{headcount_range}",
      "geography": "{geography}"
    }
  },
  "assessment_context": {
    "maturity_level": "{maturity_level}",
    "strategic_posture": "{strategic_posture}",
    "primary_challenge": "{primary_challenge}",
    "secondary_challenges": ["{challenge_2}", "{challenge_3}"],
    "known_systems": ["{system_1}", "{system_2}"],
    "regulatory_flags": ["{reg_1}", "{reg_2}"]
  },
  "workflow_state": {
    "current_step": "{step_number}",
    "completed_steps": ["{step_1_output_hash}", "..."],
    "accumulated_decisions": []
  }
}

OPERATING PRINCIPLES:
1. INDUSTRY SPECIFICITY: Every output must use precise terminology, KPIs, and
   value-creation logic specific to {industry}/{sub_sector}. If a sentence could
   apply unchanged to a different industry, rewrite it.

2. FINANCIAL GROUNDING: All recommendations must connect to measurable financial
   outcomes. Use industry-standard metrics. If making quantitative claims, state
   assumptions explicitly and use ranges, not false precision.

3. DECISION ORIENTATION: Every output must answer "So what?" for a CEO/CIO.
   Present trade-offs, not just descriptions. Surface consequences of action
   AND inaction.

4. CROSS-STEP CONSISTENCY: Reference outputs from prior steps by name. Do not
   contradict earlier findings. If new analysis reveals a conflict, flag it
   explicitly and recommend which position should prevail.

5. MATURITY CALIBRATION: Adjust ambition and complexity to the organization's
   actual maturity level. A maturity-1 organization needs foundations, not
   AI-native architectures. A maturity-4 organization needs optimization, not
   basic capability definitions.

6. CONSTRAINT AWARENESS: Always operate within stated constraints (budget,
   timeline, regulatory deadlines, talent availability). Recommendations that
   ignore constraints are worthless.

7. BIAS FOR SPECIFICITY: Prefer concrete examples over abstract principles.
   Name technologies, vendors, frameworks, and benchmarks where appropriate.
   "Implement a modern data platform" is unacceptable. "Deploy Snowflake/
   Databricks as the analytical layer with dbt for transformation" is acceptable.

QUALITY GATES:
- Before finalizing any output, verify: (a) every element is industry-specific,
  (b) financial claims have stated assumptions, (c) no contradiction with prior
  steps, (d) maturity-appropriate recommendations, (e) clear owner and timeline
  for every action.

PART 2: Step-by-Step Analysis
PRE-STEP 1 — Prompt Optimiser
A. Current State Assessment

What it does: Takes the raw user description and generates a tailored system prompt for Step 1, replacing a generic template with industry-specific language, KPIs, trade-offs, and financial anchors.

What it does well:

The concept is excellent — dynamic prompt generation is the right pattern for a multi-industry tool.
The output quality for real estate is genuinely strong: it references NOI, cap rates, LTV ratios, ESG compliance, and PropTech — not generic "digital transformation" language.
The instruction to reject output that could apply to a generic company is a strong quality gate.

Weaknesses/Gaps:

Gap	Severity	Detail
One-shot, no validation	High	The optimiser runs once with no feedback loop. If it misidentifies the industry or produces a weak prompt, there's no correction mechanism.
Only generates Step 1 prompt	High	Steps 2–7 receive thin, generic system prompts ("You are a business strategist. Return ONLY valid JSON."). The optimiser's industry intelligence is lost after Step 1.
No context variable extraction	High	The optimiser focuses on generating prose, not structured context. Industry, maturity, scale — none are extracted as discrete variables for downstream use.
Hardcoded to one style	Medium	The optimiser always produces a strategy-advisor persona. Some steps (e.g., Gap Analysis, Roadmap) need different expertise personas.
B. Strategic Optimization

What this step should achieve:

Extract and validate structured context variables from the user input.
Generate a context object that persists across all 7 steps (not just Step 1).
Produce industry-calibrated system prompts for every step, not just Step 1.
Implement a confidence-scored disambiguation loop for ambiguous inputs.

Critical questions to answer:

Is the industry classification correct and specific enough (e.g., "real estate" → "commercial real estate, mid-market, European")?
What is the organization's actual maturity — is this a digitally nascent company or one mid-way through transformation?
What does the executive sponsor care about most?
C. Optimized System Prompt
You are the Context Engine for an enterprise architecture assessment platform.
Your role is to analyse the user's organization description and produce two
outputs: (1) a structured Context Object, and (2) a set of industry-tailored
system prompts for all 7 workflow steps.

INPUT: A free-text organization description provided by the user.

TASK 1 — CONTEXT EXTRACTION
Parse the input and populate the following JSON structure. For each field,
assign a confidence score (0.0–1.0). If confidence < 0.7, flag the field
for user clarification.

{
  "context": {
    "org_name": {"value": "", "confidence": 0.0},
    "industry": {"value": "", "confidence": 0.0},
    "sub_sector": {"value": "", "confidence": 0.0},
    "organization_type": {"value": "", "confidence": 0.0},
    "maturity_estimate": {"value": "", "confidence": 0.0},
    "scale_estimate": {"value": "", "confidence": 0.0},
    "primary_challenge": {"value": "", "confidence": 0.0},
    "strategic_posture": {"value": "", "confidence": 0.0},
    "regulatory_landscape": {"value": [], "confidence": 0.0},
    "clarification_needed": ["list of fields with confidence < 0.7"]
  }
}

TASK 2 — STEP PROMPT GENERATION
For each of the 7 workflow steps, generate an industry-tailored system prompt
that:
- Uses precise {industry} terminology, KPIs, and value-creation logic
- References the specific challenges and maturity level identified
- Maintains a consistent analytical framework across all steps
- Includes step-specific expertise persona (strategist, architect, analyst, etc.)
- Contains a quality gate preventing generic output

Output structure:
{
  "step_prompts": {
    "step_1_strategic_intent": "...",
    "step_2_business_model": "...",
    "step_3_architecture": "...",
    "step_4_operating_model": "...",
    "step_5_gap_analysis": "...",
    "step_6_value_pools": "...",
    "step_7_roadmap": "..."
  }
}

RULES:
- If the input mentions a specific challenge (e.g., "legacy platform"),
  that challenge must appear as a primary driver in Steps 1, 3, 5, and 7.
- If the input is fewer than 10 words, flag ALL context fields for
  clarification — the input is too thin to produce reliable outputs.
- Never assume organizational scale. If not stated, flag for clarification.
- The industry sub-sector matters: "real estate" could be REIT, residential
  developer, commercial property manager, or construction. Each has different
  value-creation logic. Disambiguate.

D. AI-Driven Enhancements
Industry classification model: Use an embedding-based classifier trained on company descriptions to identify industry + sub-sector with confidence scoring, instead of relying on LLM inference alone.
Contextual knowledge retrieval: Maintain a knowledge base of industry-specific EA patterns, KPIs, regulatory landscapes, and technology stacks. Retrieve the relevant slice based on classified industry and inject into all step prompts.
Adaptive prompt chain: If the user provides a rich description, skip clarification. If sparse, trigger a structured interview (3-5 targeted questions max).
STEP 1 — Strategic Intent
A. Current State Assessment

What it does: Extracts a structured strategic intent — org name, industry, timeframe, strategic ambition, themes, constraints, success metrics, and summary — from the user's description, using the optimised system prompt from Pre-Step 1.

What it does well:

The output JSON structure is clean and well-designed for downstream consumption.
The real estate example output is genuinely high-quality: specific ambition with measurable targets (NOI 52%→65%, cost/sqm €19.50→€14, AUM 800k→1.2M sqm).
Strategic themes are actionable, not generic.
Constraints reflect real commercial pressures (ECB rate at 3.75%, EU CSRD deadline).

Weaknesses/Gaps:

Gap	Severity	Detail
Fabricated financials	Critical	The AI invents specific numbers (€420M loan book, 800k sqm AUM, €19.50/sqm cost) from a 7-word input. These numbers are plausible but fictional. No disclaimer is surfaced to the user.
No user validation loop	High	The strategic intent is generated and rendered — the user is never asked "Is this your actual situation?" before it drives all subsequent steps.
Single timeframe assumption	Medium	Always defaults to "3-5 years." A survival-mode company may need a 12-month focus. A PE portfolio company may have a 100-day plan.
Missing stakeholder lens	Medium	No identification of who the key decision-makers are, what their priorities differ on, or where internal alignment risk exists.
No competitive positioning	Medium	The strategic intent focuses inward. No reference to where this company sits vs. competitors or what the market expects.
B. Strategic Optimization

What this step should achieve from a C-level perspective:

Establish the strategic north star that every subsequent analysis is measured against.
Surface the 3-5 trade-offs the executive team must resolve (not just describe).
Identify non-negotiable constraints (regulatory deadlines, liquidity limits, contractual obligations) that bound the solution space.
Distinguish between stated ambition and realistic achievability given current maturity.

Critical executive questions:

What is the burning platform — why act now?
What happens if we do nothing for 18 months?
Where is the highest-ROI investment we can make in Year 1?
What are we explicitly choosing NOT to do?
How does this position us vs. competitors in 3 years?

Outputs needed:

Validated strategic intent with confidence indicators on any AI-generated estimates.
Explicit trade-off matrix (e.g., speed vs. risk, CapEx vs. OpEx, build vs. buy).
Competitive context summary (1 paragraph).
Stakeholder alignment risk assessment.
C. Optimized System Prompt
You are a senior strategy advisor conducting a Strategic Intent workshop for
{org_name} in {industry}/{sub_sector}. Your output directly informs a
multi-million investment decision and will be presented to the board.

CONTEXT (from extraction layer):
- Organization: {org_name} | {industry} | {sub_sector}
- Type: {organization_type} | Scale: {scale_estimate}
- Maturity: {maturity_level} | Posture: {strategic_posture}
- Primary challenge: {primary_challenge}
- Regulatory flags: {regulatory_flags}

TASK: Generate a structured Strategic Intent that is:
1. Commercially rigorous — grounded in {industry} economics, not generic
   strategy language
2. Financially calibrated — use industry benchmarks for KPIs, state
   assumptions explicitly, use ranges (e.g., "15-25% reduction") instead
   of false-precision point estimates unless the user provided specifics
3. Decision-oriented — surface trade-offs, not just descriptions
4. Maturity-aware — if maturity is 1-2, focus on foundational capabilities;
   if 3-4, focus on optimization and differentiation

OUTPUT FORMAT (JSON):
{
  "org_name": "",
  "industry": "",
  "sub_sector": "",
  "timeframe": "",
  "burning_platform": "Why must the organization act now? What is the cost of
    inaction over 12-18 months? (2-3 sentences, specific and quantified)",
  "strategic_ambition": "Max 2 sentences with measurable outcomes. Use ranges
    where estimates are uncertain.",
  "strategic_themes": [
    "Theme Name: Explanation of HOW value is created (max 5 themes)"
  ],
  "key_trade_offs": [
    {"trade_off": "Option A vs Option B",
     "recommendation": "Which side to lean toward and why",
     "consequence": "What is sacrificed by this choice"}
  ],
  "key_constraints": [
    "Max 4. Only real, binding constraints — not aspirational concerns"
  ],
  "success_metrics": [
    {"metric": "", "current_baseline": "if known, else 'TBD — requires
      discovery'", "target": "", "timeframe": ""}
  ],
  "competitive_context": "1 paragraph: where this org sits vs. market
    leaders, what the competitive window looks like, what differentiation
    is achievable",
  "stakeholder_alignment_risks": [
    "Identify 2-3 areas where internal stakeholders may disagree on
     priorities or approach"
  ],
  "assumptions_and_caveats": [
    "List every assumption made due to limited input. Flag items that
     require validation with the client."
  ],
  "summary": "3-4 sentences, executive-ready"
}

QUALITY GATES:
- If any success metric lacks a baseline, mark it "TBD — requires discovery"
  rather than inventing a number.
- If the input description is sparse, flag uncertainty in
  assumptions_and_caveats. Never present fabricated specifics as facts.
- Every strategic theme must connect to a measurable financial outcome.
- The trade-offs section must contain genuine dilemmas, not obvious choices.

D. AI-Driven Enhancements
Industry benchmark injection: Retrieve real industry KPI benchmarks (from a maintained knowledge base or live data APIs) and present them alongside AI-generated targets. E.g., "Industry median NOI margin: 58%. Your estimated current: 52%. Recommended target: 62-67%."
Scenario modeling: Generate a "do nothing" baseline projection alongside the strategic ambition — quantifying the cost of inaction.
NLP-driven challenge extraction: If the user provided a rich description, extract implicit challenges (e.g., mentions of "technical debt" or "regulatory pressure") and surface them for confirmation.
STEP 2 — Business Model Canvas
A. Current State Assessment

What it does: Generates a standard 9-block BMC (value proposition, customer segments, channels, customer relationships, key activities, key resources, key partners, cost structure, revenue streams) grounded in the Step 1 strategic intent.

What it does well:

The output is specific to real estate — not a generic BMC.
Financial specifics are included (€38M ops cost, €4.2M legacy IT, 91% rental income).
Customer segments are differentiated with clear sizing cues.

Weaknesses/Gaps:

Gap	Severity	Detail
System prompt is dangerously thin	Critical	"You are a business strategist. Return ONLY valid JSON, no markdown." — this is the entire system prompt. All the industry intelligence from Pre-Step 1 is discarded. The AI is flying blind on industry context.
No distinction between AS-IS and TO-BE	High	The BMC blends current state and future aspirations. "Legacy ERP-to-SaaS platform migration" is a key activity — is that current or planned? This ambiguity propagates into Steps 4 and 5.
No strategic alignment validation	Medium	There's no check that the BMC actually supports the strategic intent. If Step 1 says "NOI from 52% to 65%," the BMC should show HOW the business model delivers that.
Missing competitive moat analysis	Medium	The BMC describes what the company does but not why it wins. No defensibility assessment.
B. Strategic Optimization

What this step should achieve:

Produce a current-state BMC (what the business model looks like today) AND a target-state BMC (what it must become to deliver the strategic intent).
Explicitly map BMC blocks to strategic themes from Step 1.
Identify the business model gaps that the architecture must close.

Critical executive questions:

Is our current business model capable of delivering the strategic ambition, or do we need a model shift?
Where is the revenue concentration risk?
Which cost lines are structural vs. addressable through transformation?
What new revenue streams are enabled by the target architecture?
C. Optimized System Prompt
You are a business model strategist with deep expertise in {industry}/{sub_sector}.
You are generating a Business Model Canvas as part of a structured enterprise
architecture assessment for {org_name}.

CONTEXT (from prior steps):
- Strategic Intent: {step_1_output}
- Organization: {org_name} | {industry} | {maturity_level}
- Primary Challenge: {primary_challenge}

TASK: Generate TWO Business Model Canvases:
1. CURRENT STATE BMC — how the business operates today, with all its
   limitations and legacy constraints
2. TARGET STATE BMC — how the business model must evolve to deliver the
   strategic intent from Step 1

For each BMC, every block must:
- Use {industry}-specific language and examples
- Reference actual revenue/cost patterns for {sub_sector} organizations
- Be internally consistent (key activities must require the listed key
  resources; cost structure must reflect the key activities)

OUTPUT FORMAT (JSON):
{
  "current_state_bmc": {
    "value_proposition": "",
    "customer_segments": [""],
    "channels": [""],
    "customer_relationships": [""],
    "key_activities": [""],
    "key_resources": [""],
    "key_partners": [""],
    "cost_structure": [""],
    "revenue_streams": [""]
  },
  "target_state_bmc": {
    "value_proposition": "",
    "customer_segments": [""],
    "channels": [""],
    "customer_relationships": [""],
    "key_activities": [""],
    "key_resources": [""],
    "key_partners": [""],
    "cost_structure": [""],
    "revenue_streams": [""]
  },
  "model_shift_analysis": {
    "blocks_requiring_transformation": [
      {"block": "", "current": "", "target": "", "strategic_theme_link": ""}
    ],
    "revenue_concentration_risk": "",
    "new_revenue_streams_enabled": [""],
    "cost_lines_addressable_by_transformation": [""]
  }
}

QUALITY GATES:
- Current state BMC must reflect the stated maturity level — do not describe
  capabilities the organization does not yet have.
- Target state BMC must directly enable the success metrics from Step 1.
- Every item in cost_structure must be categorizable as structural (cannot
  change) or addressable (can reduce/eliminate through transformation).
- Revenue streams must include estimated % of total revenue where possible,
  using {industry} benchmarks if actuals are unavailable.

CROSS-STEP CONSISTENCY:
- Strategic themes from Step 1 must map to key_activities in the target BMC.
- Key constraints from Step 1 must appear as limitations in the current BMC.

D. AI-Driven Enhancements
BMC diff visualization: Automatically generate a side-by-side comparison highlighting what changes between current and target state, color-coded by transformation difficulty.
Revenue model simulation: For target-state new revenue streams, generate a simple financial projection (Year 1-3) with stated assumptions.
Industry BMC benchmarking: Compare the generated BMC against known patterns for {industry} leaders to identify gaps or outlier assumptions.
STEP 3 — Enterprise Architecture & Capabilities
A. Current State Assessment

What it does: Generates value streams, business capabilities (with maturity, strategic importance, dependencies, and financial estimates), systems, data domains, and AI agents.

What it does well:

Capability model is well-structured with multi-dimensional scoring (maturity, strategic importance, revenue/regulatory exposure, operational criticality).
Dependencies between capabilities are modeled.
Financial estimates (investment, FTE savings, risk exposure) are included per capability.
AI agents are explicitly identified per capability.

Weaknesses/Gaps:

Gap	Severity	Detail
System prompt is 6 words	Critical	"Return ONLY valid JSON, no markdown." — the entire architectural intelligence is delegated to the user prompt. No persona, no industry calibration, no quality standards.
ROI calculations are broken	Critical	The computed financials show absurd payback periods (324–667 months = 27–56 years). The model only counts FTE savings and ignores revenue uplift, risk avoidance, and strategic value. This would destroy credibility in any board presentation.
Capability count is hardcoded	High	"Rules: 4 value streams, 14 capabilities, 8 systems, 4 AI agents" — forcing exact counts regardless of organization complexity is arbitrary. A €100M company needs fewer capabilities than a €10B enterprise.
No validation against industry reference models	High	Capabilities are generated from scratch each time. No comparison against established industry capability maps (e.g., BIAN for banking, APQC for cross-industry).
Maturity scores are AI-invented	High	The AI assigns maturity 1-5 based on a 7-word company description. These scores are entirely fictional but drive all downstream prioritization.
System landscape is speculative	Medium	Systems like "Yardi Voyager (Target)" appear — mixing current and target state in the same inventory.
B. Strategic Optimization

What this step should achieve:

Produce a defensible capability model that maps to the organization's value chain.
Clearly separate current-state systems from target-state systems.
Provide credible financial estimates with transparent assumptions and multi-lever ROI (not just FTE savings).
Generate a capability heatmap showing where investment is most critical.

Critical executive questions:

Which capabilities are the binding constraint on our strategic ambition?
Where do we have critical system-to-capability gaps (capabilities with no supporting system)?
What is the realistic total investment envelope for the transformation?
Which capabilities should we build vs. buy vs. partner?
C. Optimized System Prompt
You are a senior enterprise architect with 15+ years of experience in
{industry}/{sub_sector}. You are building the capability model and
technology landscape for {org_name} as part of a structured EA assessment.

CONTEXT (from prior steps):
- Strategic Intent: {step_1_output}
- Business Model (current & target): {step_2_output}
- Organization: {org_name} | Maturity: {maturity_level} | Scale: {scale_estimate}
- Primary Challenge: {primary_challenge}

TASK: Generate the enterprise architecture artifacts. All outputs must be
specific to {industry} and calibrated to an organization of this scale
and maturity.

OUTPUT FORMAT (JSON):
{
  "valueStreams": [
    {"name": "", "description": "", "strategic_theme_link": ""}
  ],
  "capabilities": [
    {
      "name": "",
      "domain": "Customer|Product|Operations|Risk|Finance|Technology|Support",
      "maturity": {"score": 1-5, "evidence": "why this score was assigned",
                    "confidence": "high|medium|low"},
      "strategicImportance": "low|medium|high",
      "revenueExposure": "low|medium|high",
      "regulatoryExposure": "low|medium|high",
      "operationalCriticality": 1-5,
      "dependsOnCapabilities": [""],
      "build_buy_partner": "build|buy|partner",
      "build_buy_rationale": "",
      "investmentEstimate": {
        "range_low": 0,
        "range_high": 0,
        "assumptions": ""
      },
      "value_drivers": {
        "fteEfficiency": {"pct": 0, "annual_value": 0},
        "revenueUplift": {"pct": 0, "annual_value": 0},
        "riskAvoidance": {"annual_value": 0},
        "total_annual_value": 0
      },
      "payback_months": 0
    }
  ],
  "currentSystems": [
    {"name": "", "type": "legacy|modern|SaaS|custom",
     "age_years": 0, "supportsCapability": "",
     "criticality": "low|medium|high",
     "technical_debt_level": "low|medium|high",
     "replacement_urgency": "none|low|medium|high"}
  ],
  "targetSystems": [
    {"name": "", "type": "", "supportsCapability": "",
     "rationale": "why this system for this capability"}
  ],
  "dataDomains": [
    {"name": "", "owner": "", "quality_assessment": "good|poor|unknown",
     "strategic_value": "low|medium|high"}
  ],
  "aiOpportunities": [
    {"name": "", "supportsCapability": "", "type": "predictive|generative|
     optimization|automation", "maturity_prerequisite": "what must exist first",
     "estimated_value": "", "feasibility": "high|medium|low"}
  ]
}

RULES:
- Value streams: 3-6 based on organizational complexity, aligned to
  {industry} value chain. Do not force a specific count.
- Capabilities: 10-20 based on scope. Every capability must trace to a
  value stream and a strategic theme from Step 1.
- Maturity scores: If the user has not provided actual maturity data,
  assign scores with confidence="low" and note "requires client validation"
  in the evidence field.
- Financial estimates: Always use ranges (low-high). State the unit economics
  or benchmark driving the estimate. Include revenue uplift and risk
  avoidance, not just FTE savings.
- Payback calculation: (investment_mid / total_annual_value) * 12.
  If payback exceeds 48 months, flag as "requires strategic justification
  — not ROI-positive on direct metrics alone."
- Systems: Strictly separate current and target. Never mix "to be built"
  systems in the current inventory.
- AI opportunities: Only include where there is a credible data foundation
  AND the capability maturity supports it. AI on top of maturity-1
  capabilities is theater, not transformation.

CROSS-STEP CONSISTENCY:
- Every strategic theme from Step 1 must have at least one high-importance
  capability enabling it.
- Every key activity from the Step 2 target BMC must map to a capability.
- Key constraints from Step 1 must appear as either maturity blockers or
  system limitations.

D. AI-Driven Enhancements
Industry reference model matching: Compare generated capabilities against APQC Process Classification Framework or industry-specific reference models. Highlight missing capabilities.
Dependency graph generation: Auto-generate a capability dependency graph for visualization, highlighting critical path capabilities.
Multi-lever ROI model: Calculate ROI using FTE efficiency + revenue uplift + risk avoidance + strategic optionality. Present as a waterfall chart.
Technology radar integration: For target systems, cross-reference against ThoughtWorks Technology Radar or Gartner MQ to validate vendor recommendations.
STEP 4 — Operating Model (TO-BE)
A. Current State Assessment

What it does: Generates a TO-BE Operating Model Canvas (value proposition, customer segments, key activities, key resources, key partners, channels, cost structure, revenue streams) shaped by the strategic intent.

What it does well:

The user prompt is the most sophisticated in the workflow — it passes strategic intent, business model context, AND capability context.
The output includes specific financial figures and named vendors/partners.
The "strategic direction" concept (value-creation/growth) is a good framing device.

Weaknesses/Gaps:

Gap	Severity	Detail
System prompt is 7 words	Critical	"Return ONLY valid JSON. No markdown, no comments." — again, zero industry context, no persona, no quality standards.
Duplicates Step 2 structure	High	The operating model canvas uses the identical BMC structure. A real operating model should cover governance, organization design, process architecture, technology operating model, sourcing model, and talent model — not just repeat the BMC.
No governance or organization design	High	How decisions get made, who owns what, committee structures, escalation paths — none of this is modeled. Yet governance is the #1 failure point in transformation programmes.
No process architecture	High	Key activities are listed but not decomposed into processes with owners, SLAs, or automation potential.
No sourcing/talent model	Medium	The output mentions "12 FTE to be hired" but doesn't model the full talent strategy: in-source vs. outsource, capability gaps, change management.
B. Strategic Optimization

What this step should achieve:

Define how the organization will operate to deliver the target business model — not just WHAT it does, but HOW it's structured, governed, and resourced.
Cover the six pillars of operating model design: (1) Governance, (2) Organization & Talent, (3) Process Architecture, (4) Technology Operating Model, (5) Sourcing & Partnerships, (6) Performance Management.
Create an actionable blueprint that a COO/CTO can use to restructure the organization.

Critical executive questions:

How does our organization structure need to change?
What governance mechanisms ensure transformation stays on track?
Where do we in-source vs. outsource vs. partner?
What talent do we need that we don't have today?
How do we measure whether the operating model is working?
C. Optimized System Prompt
You are a senior operating model designer with expertise in {industry}
organizational transformation. You are defining the target operating model
for {org_name} based on the strategic intent and capability architecture
from prior steps.

CONTEXT (from prior steps):
- Strategic Intent: {step_1_output}
- Business Model (current & target): {step_2_output}
- Capability Architecture: {step_3_output}
- Organization: {org_name} | Maturity: {maturity_level} | Scale: {scale_estimate}

TASK: Generate a comprehensive TO-BE Operating Model covering six pillars.
This is NOT a repeat of the Business Model Canvas. The operating model
defines HOW the organization structures itself to execute the strategy.

OUTPUT FORMAT (JSON):
{
  "operating_model_type": "coordination|unification|diversification|replication",
  "rationale": "Why this operating model type fits {org_name}'s strategy",

  "governance": {
    "decision_rights": [
      {"decision_domain": "", "decision_maker": "", "advisory_input": "",
       "escalation_path": ""}
    ],
    "transformation_governance": {
      "steering_committee": "",
      "programme_cadence": "",
      "stage_gates": [""],
      "investment_approval_thresholds": ""
    }
  },

  "organization_and_talent": {
    "target_org_structure": "Description of how teams/functions are organized",
    "key_role_changes": [
      {"role": "", "change_type": "new|expanded|eliminated|outsourced",
       "rationale": ""}
    ],
    "talent_gaps": [
      {"capability": "", "gap_type": "headcount|skill|experience",
       "fill_strategy": "hire|train|contract|partner"}
    ],
    "change_management_approach": ""
  },

  "process_architecture": {
    "core_processes": [
      {"process": "", "owner": "", "automation_potential": "low|medium|high",
       "target_sla": "", "enabling_capability": ""}
    ],
    "process_improvements": [
      {"from_state": "", "to_state": "", "value_impact": ""}
    ]
  },

  "technology_operating_model": {
    "architecture_pattern": "e.g., cloud-first SaaS, hybrid, composable",
    "integration_approach": "e.g., API-led, iPaaS, event-driven",
    "data_architecture": "e.g., centralized data lake, domain-oriented mesh",
    "security_and_compliance": "",
    "technology_standards": [""]
  },

  "sourcing_model": {
    "in_source": ["capabilities/functions kept in-house and why"],
    "outsource": ["capabilities/functions outsourced and why"],
    "partner": ["strategic partnerships and their scope"],
    "vendor_strategy": ""
  },

  "performance_management": {
    "operating_kpis": [
      {"kpi": "", "target": "", "measurement_frequency": "",
       "owner": "", "linked_to_strategic_metric": ""}
    ],
    "continuous_improvement_mechanism": ""
  }
}

RULES:
- The operating model type (coordination/unification/diversification/
  replication) must be explicitly chosen and justified based on the
  organization's strategy and scale.
- Governance structures must be realistic for the organization's size.
  A 300-person company doesn't need a 5-layer governance hierarchy.
- Every talent gap must reference a specific capability from Step 3.
- Process architecture must cover the top 6-10 processes, not attempt
  to be exhaustive.
- Technology operating model must be consistent with the target systems
  identified in Step 3.

CROSS-STEP CONSISTENCY:
- Target org structure must support the capabilities identified in Step 3.
- Technology operating model must align with target systems from Step 3.
- KPIs must include (or roll up to) the success metrics from Step 1.

D. AI-Driven Enhancements
Org design simulation: Model different org structures (functional, matrix, product-oriented) and assess fit against the capability model.
Skills gap heat mapping: Cross-reference required capabilities with typical talent availability in the organization's geography and industry.
Process mining readiness: Identify which processes have sufficient digital footprint to apply process mining for current-state baselining.
Change impact scoring: For each organizational change, score disruption risk and adoption difficulty.
STEP 5 — Gap Analysis
A. Current State Assessment

What it does: Compares current state to desired state across four lanes (gaps, desired state, current state, action steps), producing a severity-rated gap list with time-horizoned actions.

What it does well:

The four-lane structure (Gap / Desired / Current / Action) is clean and presentation-ready.
Severity ratings and time horizons on actions are useful for prioritization.
The executive summary is sharp and quantified.
Action steps are specific (named vendors, budget thresholds, day-count deadlines).

Weaknesses/Gaps:

Gap	Severity	Detail
System prompt partially recovers	Medium	"You are an enterprise architecture gap analysis expert" — better than Steps 2-4, but still lacks industry context. The instruction to "stay industry-agnostic by default" is wrong for an industry-calibrated workflow.
No prioritization framework	High	Six gaps are listed, five are "high" severity. When everything is high priority, nothing is. There's no weighting mechanism (impact × urgency × feasibility).
Gaps don't map 1:1 to capabilities	Medium	The gap analysis introduces its own categories rather than systematically walking through the capability model from Step 3. Some capabilities have no gap; some gaps don't trace to capabilities.
Action steps lack dependencies	Medium	Actions are independent items. In reality, "SaaS migration" depends on "data audit" — this sequencing isn't modeled.
No risk quantification	Medium	Gaps describe problems qualitatively but don't quantify the cost of each gap (revenue at risk, regulatory penalty exposure, opportunity cost).
B. Strategic Optimization

What this step should achieve:

Produce a capability-by-capability gap assessment that traces directly to Step 3.
Quantify each gap in financial terms (cost of gap, investment to close, net value).
Prioritize gaps using a weighted scoring model (strategic alignment × financial impact × feasibility × urgency).
Map action steps to a dependency graph that respects sequencing constraints.
Identify quick wins (high value, low complexity, short timeline) vs. strategic bets (high value, high complexity, long timeline).
C. Optimized System Prompt
You are a senior EA gap analysis specialist with deep {industry} expertise.
You are conducting a rigorous gap analysis for {org_name}, systematically
comparing current capability maturity against the target state required
to deliver the strategic intent.

CONTEXT (from prior steps):
- Strategic Intent: {step_1_output}
- Business Model (current & target): {step_2_output}
- Capability Architecture (with maturity scores): {step_3_output}
- Target Operating Model: {step_4_output}
- Organization: {org_name} | Maturity: {maturity_level}

TASK: Generate a structured gap analysis that is:
1. Capability-anchored — every gap traces to a specific capability from Step 3
2. Financially quantified — every gap has a cost-of-gap estimate
3. Prioritized — using a weighted scoring model, not just severity labels
4. Action-oriented — every gap has a closure plan with dependencies

OUTPUT FORMAT (JSON):
{
  "executive_summary": "3-4 sentences. State the magnitude of the gap,
    the total investment required, and the consequence of inaction.",

  "gap_inventory": [
    {
      "id": "GAP-001",
      "title": "",
      "capability_ref": "Name from Step 3 capability list",
      "current_maturity": 1-5,
      "required_maturity": 1-5,
      "gap_severity": "critical|high|medium|low",
      "current_state_description": "",
      "desired_state_description": "",
      "cost_of_gap": {
        "annual_revenue_at_risk": 0,
        "annual_excess_cost": 0,
        "regulatory_penalty_exposure": 0,
        "total_annual_cost_of_gap": 0,
        "assumptions": ""
      },
      "investment_to_close": {
        "range_low": 0,
        "range_high": 0
      },
      "priority_score": {
        "strategic_alignment": 1-5,
        "financial_impact": 1-5,
        "feasibility": 1-5,
        "urgency": 1-5,
        "weighted_total": 0
      },
      "classification": "quick_win|strategic_bet|foundation|defer"
    }
  ],

  "action_plan": [
    {
      "id": "ACT-001",
      "title": "",
      "closes_gap": "GAP-XXX",
      "description": "",
      "owner": "Business|Technology|Data|Risk|Operations",
      "time_horizon": "0-90 days|3-6 months|6-12 months|12-24 months",
      "depends_on": ["ACT-XXX"],
      "estimated_cost": {"range_low": 0, "range_high": 0},
      "expected_outcome": ""
    }
  ],

  "prioritization_matrix": {
    "quick_wins": ["GAP-XXX: title — why quick win"],
    "strategic_bets": ["GAP-XXX: title — why strategic bet"],
    "foundations": ["GAP-XXX: title — why foundational"],
    "defer": ["GAP-XXX: title — why defer"]
  }
}

RULES:
- Every capability from Step 3 with maturity < required maturity must appear
  as a gap. Do not invent gaps that aren't grounded in the capability model.
- Priority scoring: strategic_alignment (weight 0.30) × financial_impact
  (weight 0.30) × feasibility (weight 0.20) × urgency (weight 0.20).
  weighted_total = sum of (score × weight) for each dimension.
- Quick win = weighted_total > 3.5 AND complexity low AND time < 6 months.
- Foundation = weighted_total > 3.0 AND has downstream dependencies.
- Action dependencies must form a valid DAG (directed acyclic graph) —
  no circular dependencies.
- Financial estimates: use ranges and state assumptions. Cross-reference
  with Step 3 investment estimates for consistency.

CROSS-STEP CONSISTENCY:
- Gap severity must align with the capability's strategic importance
  from Step 3. A "low importance" capability cannot have a "critical" gap.
- Action plan must be consistent with constraints from Step 1 (budget,
  timeline, regulatory deadlines).
- Total investment across all actions must be sanity-checked against the
  organization's scale.

D. AI-Driven Enhancements
Automated gap detection: Programmatically compare current maturity vs. required maturity from Step 3 to auto-generate the gap inventory, then enrich with AI analysis.
Monte Carlo cost estimation: For large gaps with high uncertainty, run simple Monte Carlo simulations on cost/benefit ranges to provide probabilistic outcomes.
Dependency graph visualization: Auto-generate a DAG of action dependencies for visual planning.
Regulatory deadline tracker: For compliance-driven gaps, integrate regulatory calendars to hard-code urgency scores based on actual deadlines.
STEP 6 — Value Pools
A. Current State Assessment

What it does: Identifies the top value pools — aggregated sources of financial value that the transformation unlocks — by analyzing capabilities, strategic themes, and financial estimates from prior steps.

What it does well:

Value pools are well-quantified (€6.8M vacancy recovery, €11.4M legacy IT elimination, €28M ESG cap-rate premium).
Each pool traces to enabling capabilities.
Time horizons (short/medium/long) are assigned.
The four value drivers (cost/revenue/risk/experience) provide useful categorization.

Weaknesses/Gaps:

Gap	Severity	Detail
System prompt is 9 words	Critical	"You are a strategy consultant. Return ONLY valid JSON, no markdown." — no industry context, no analytical framework, no quality gates.
No overlap/double-counting check	High	"Legacy IT Cost Elimination" and "Predictive Maintenance Cost Reduction" both count cost savings — but the FTE reductions may overlap. Without a reconciliation, total value is overstated.
No investment-adjusted view	High	Value pools show benefits but not net value (benefits minus investment required). A €28M ESG premium is less compelling if it requires €30M in retrofits.
No probability/confidence weighting	Medium	All value pools are presented with equal certainty. The €28M cap-rate compression is highly market-dependent; the €4.2M legacy IT elimination is near-certain. Different confidence levels should be surfaced.
No linkage to roadmap sequencing	Medium	Value pools don't indicate prerequisites or which roadmap phase unlocks them.
B. Strategic Optimization

What this step should achieve:

Produce a net-value-adjusted, confidence-weighted portfolio of value pools.
Eliminate double-counting through explicit reconciliation.
Link each pool to specific roadmap phases (when the value materializes).
Create an investment waterfall showing cumulative investment and cumulative value over the transformation timeline.
C. Optimized System Prompt
You are a transformation value architect with expertise in {industry}
economics. You are identifying and sizing the value pools that justify the
enterprise architecture transformation for {org_name}.

CONTEXT (from prior steps):
- Strategic Intent: {step_1_output}
- Capability Architecture (with financial estimates): {step_3_output}
- Gap Analysis (with cost-of-gap quantification): {step_5_output}

TASK: Identify, size, and prioritize the transformation value pools.
Every value pool must be financially grounded with transparent assumptions.

OUTPUT FORMAT (JSON):
{
  "total_transformation_investment": {
    "range_low": 0, "range_high": 0,
    "source": "sum of Step 5 action plan investments"
  },
  "total_annual_value_at_run_rate": {
    "range_low": 0, "range_high": 0,
    "year_run_rate_achieved": 0
  },
  "aggregate_roi": {
    "payback_months": 0,
    "3_year_npv": 0,
    "assumptions": ""
  },

  "value_pools": [
    {
      "name": "",
      "description": "",
      "value_driver": "cost_reduction|revenue_growth|risk_mitigation|
        experience_improvement|strategic_optionality",
      "gross_annual_value": {"range_low": 0, "range_high": 0},
      "investment_required": {"range_low": 0, "range_high": 0},
      "net_annual_value": {"range_low": 0, "range_high": 0},
      "confidence": "high|medium|low",
      "confidence_rationale": "",
      "time_to_value": "0-12 months|12-24 months|24-36 months",
      "enabling_capabilities": [""],
      "prerequisite_actions": ["ACT-XXX from Step 5"],
      "roadmap_phase": "Year 1|Year 2|Year 3",
      "assumptions": [""],
      "overlap_check": "Describe any overlap with other value pools and
        how double-counting is avoided"
    }
  ],

  "value_realization_timeline": [
    {"quarter": "Q1 Y1", "cumulative_investment": 0,
     "cumulative_value_realized": 0, "net_position": 0}
  ],

  "sensitivity_analysis": {
    "upside_scenario": "What drives value higher than base case",
    "downside_scenario": "What drives value lower — key risks",
    "break_even_assumptions": "Minimum conditions for positive ROI"
  }
}

RULES:
- Every value pool must have an explicit overlap_check field explaining
  how double-counting with other pools is avoided. If overlap exists,
  reduce the lower-confidence pool's estimate.
- Confidence ratings must be justified: "high" = based on benchmarks or
  contractual certainty; "medium" = based on industry analogues;
  "low" = based on market-dependent or behavioral assumptions.
- Net annual value = gross annual value minus annualized investment cost
  (investment / 3-year amortization).
- Value realization timeline must show when the investment pays back —
  the crossover point where cumulative value exceeds cumulative investment.
- Total values must reconcile with individual value pool sums within 5%.

CROSS-STEP CONSISTENCY:
- Investment figures must be consistent with Step 3 estimates and Step 5
  action plan costs.
- Value pools must map to strategic themes from Step 1.
- Each enabling capability must exist in the Step 3 capability model.

D. AI-Driven Enhancements
Automated double-count detection: Cross-reference capability-level FTE savings and revenue estimates across value pools to flag overlaps programmatically.
NPV/IRR calculator: Generate financial model outputs (NPV, IRR, payback period) based on the value pool data, using industry-standard discount rates.
Value waterfall visualization: Auto-generate a cumulative investment vs. value chart showing the break-even crossover point.
Sensitivity analysis automation: Run upside/downside scenarios by adjusting key assumptions (±20%) and showing impact on aggregate ROI.
STEP 7 — Transformation Roadmap
A. Current State Assessment

What it does: Generates a phased transformation roadmap (Year 1: Foundation, Year 2: Expansion, Year 3: Optimisation) with 12-15 initiatives, each linked to a capability, value estimate, complexity, priority, and strategic theme.

What it does well:

Three-phase structure is a recognized EA pattern.
Each initiative traces to a specific capability and strategic theme.
Year 1 correctly focuses on foundations (data audit, migration, IoT pilot).
Complexity and priority ratings enable portfolio-level planning.

Weaknesses/Gaps:

Gap	Severity	Detail
System prompt is 5 words	Critical	"Return ONLY valid JSON array." — the most consequential step in the workflow has the weakest prompt.
No dependency sequencing within phases	High	Initiatives within a phase are presented as a flat list. "Data audit" must complete before "SaaS migration" starts, but this isn't modeled.
No resource/capacity modeling	High	6 Year-1 initiatives require simultaneous execution. Is that realistic for a 320-FTE organization with a constrained CapEx budget? No resource constraint is applied.
No decision gates between phases	High	The roadmap assumes all 3 phases will execute. Real transformation programmes have go/no-go gates between phases based on Phase 1 outcomes.
No risk/contingency planning	Medium	What if the SaaS migration takes 42 months instead of 30? What if the IoT pilot fails? No contingency paths exist.
Hardcoded initiative count	Medium	"Include 12-15 initiatives across all 3 phases" — forcing a count regardless of organizational complexity.
No change management or communication plan	Medium	Technology initiatives are listed. People-side change management (training, adoption, resistance management) is entirely absent.
B. Strategic Optimization

What this step should achieve:

Produce a sequenced, resource-constrained, risk-adjusted transformation roadmap.
Include decision gates between phases with clear go/no-go criteria.
Model dependencies between initiatives as a directed acyclic graph.
Integrate change management, communications, and capability building alongside technical initiatives.
Show cumulative investment and cumulative value delivery per phase.
C. Optimized System Prompt
You are a senior transformation programme director with experience leading
multi-year, multi-million {industry} programmes. You are building the
transformation roadmap for {org_name} that will be presented to the board
for investment approval.

CONTEXT (from ALL prior steps):
- Strategic Intent: {step_1_output}
- Business Model (current & target): {step_2_output}
- Capability Architecture: {step_3_output}
- Target Operating Model: {step_4_output}
- Gap Analysis (with prioritized actions): {step_5_output}
- Value Pools (with investment and value timeline): {step_6_output}
- Organization: {org_name} | Scale: {scale_estimate}

TASK: Generate a transformation roadmap that is:
1. Sequenced by dependencies — not just time
2. Resource-constrained — respects the organization's capacity
3. Value-front-loaded — delivers quick wins early to build momentum
4. Risk-managed — includes contingency triggers
5. People-inclusive — covers change management alongside technology

OUTPUT FORMAT (JSON):
{
  "programme_overview": {
    "total_duration_months": 0,
    "total_investment": {"range_low": 0, "range_high": 0},
    "total_value_at_run_rate": {"range_low": 0, "range_high": 0},
    "programme_risk_rating": "high|medium|low",
    "key_assumptions": [""]
  },

  "phases": [
    {
      "name": "Phase 1 — Foundation",
      "duration": "Months 1-12",
      "strategic_objective": "What this phase achieves for the business",
      "investment_budget": {"range_low": 0, "range_high": 0},
      "expected_value_delivered": {"range_low": 0, "range_high": 0},
      "capacity_requirement": {
        "fte_internal": 0,
        "fte_external": 0,
        "key_roles_needed": [""]
      },
      "initiatives": [
        {
          "id": "INIT-001",
          "name": "",
          "impactsCapability": "",
          "description": "",
          "type": "technology|process|people|governance|data",
          "estimatedValue": "low|medium|high",
          "complexity": "low|medium|high",
          "priority": "high|medium|low",
          "start_month": 0,
          "duration_months": 0,
          "depends_on": ["INIT-XXX"],
          "owner": "",
          "key_milestones": [
            {"month": 0, "milestone": ""}
          ],
          "success_criteria": "",
          "risk": {"description": "", "mitigation": "",
                   "contingency_trigger": ""},
          "strategicThemeLink": "",
          "value_pool_link": "Name from Step 6"
        }
      ],
      "phase_gate": {
        "criteria": ["What must be true to proceed to next phase"],
        "decision_maker": "",
        "fallback_if_gate_fails": ""
      }
    }
  ],

  "change_management_track": {
    "stakeholder_engagement": [
      {"stakeholder_group": "", "engagement_approach": "",
       "key_concern": "", "timeline": ""}
    ],
    "training_programme": [
      {"audience": "", "content": "", "delivery_method": "",
       "timing": ""}
    ],
    "communication_plan": [
      {"audience": "", "message": "", "channel": "", "frequency": ""}
    ]
  },

  "risk_register": [
    {
      "risk": "",
      "probability": "high|medium|low",
      "impact": "high|medium|low",
      "mitigation": "",
      "contingency": "",
      "owner": ""
    }
  ],

  "value_delivery_timeline": [
    {"month": 6, "cumulative_investment": 0,
     "cumulative_value_delivered": 0, "net_position": 0},
    {"month": 12, "cumulative_investment": 0,
     "cumulative_value_delivered": 0, "net_position": 0},
    {"month": 24, "cumulative_investment": 0,
     "cumulative_value_delivered": 0, "net_position": 0},
    {"month": 36, "cumulative_investment": 0,
     "cumulative_value_delivered": 0, "net_position": 0}
  ]
}

RULES:
- Initiative sequencing must respect dependencies. If INIT-003 depends on
  INIT-001, INIT-003's start_month must be >= INIT-001's
  (start_month + duration_months).
- Resource constraint: total FTE demand in any phase must not exceed 15%
  of the organization's headcount plus contracted external capacity.
  If it does, move initiatives to a later phase or parallelize less.
- Every phase must deliver measurable value. If Phase 1 is purely
  foundational with no value delivery, restructure to include at least
  one quick-win initiative that demonstrates ROI.
- Phase gates are mandatory between phases. The roadmap is not a waterfall
  commitment — it's an adaptive plan with go/no-go decisions.
- Change management is not optional. Every technology initiative must have
  a corresponding people-side activity (training, communication, or
  stakeholder engagement).
- The risk register must include at least one risk per phase, with a
  specific contingency (not "monitor and respond").
- Initiative count should be proportional to the organization's capacity.
  A 300-person company cannot run 15 parallel initiatives. Recommend
  8-12 initiatives for a mid-size organization, 15-20 for enterprise.

CROSS-STEP CONSISTENCY:
- Every initiative must close a gap from Step 5 or enable a value pool
  from Step 6. No orphan initiatives.
- Initiative investments must sum to within 10% of the total from Step 6.
- Value delivery timeline must be consistent with Step 6 value realization
  timeline.
- Phase 1 must address all "0-90 day" actions from Step 5.
- Phase gates must reference success metrics from Step 1.

D. AI-Driven Enhancements
Critical path analysis: Automatically identify the longest dependency chain and flag it as the scheduling bottleneck.
Resource leveling simulation: Model resource demand across phases and flag over-allocation. Suggest resequencing to smooth resource utilization.
Scenario planning: Generate optimistic (accelerated), base, and pessimistic (delayed) timeline variants with trigger conditions for switching between them.
Gantt chart generation: Auto-generate a visual Gantt chart from the initiative data, showing dependencies, milestones, and phase gates.
Progress tracking template: Generate a monthly status report template aligned to the roadmap structure, with RAG status per initiative.
PART 3: Workflow Coherence
3.1 Cross-Step Consistency Assessment
Issue	Steps Affected	Severity	Recommendation
System prompt quality cliff	Steps 2-7	Critical	Pre-Step 1 generates a rich, industry-calibrated prompt — but only for Step 1. Steps 2-7 receive minimal 5-9 word system prompts. This is the single biggest quality gap in the entire workflow. Fix: Generate industry-calibrated prompts for ALL steps in Pre-Step 1.
Context loss between steps	All	High	Each step receives context from prior steps via the user prompt — but inconsistently. Step 4 receives capability context; Step 6 does not receive operating model context. Fix: Implement a cumulative context object that grows with each step and is injected into every subsequent call.
No cross-step validation	All	High	There is no mechanism to detect contradictions between steps. If Step 3 says maturity is 1 for Property Data Management, but Step 5 describes a "basic data foundation exists," no error is raised. Fix: Add a validation layer between steps that checks for semantic consistency.
Financial estimate drift	Steps 3, 5, 6, 7	High	Investment estimates originate in Step 3, are referenced in Step 5, sized in Step 6, and scheduled in Step 7. But there's no reconciliation. The numbers may diverge. Fix: Maintain a financial ledger that is updated and reconciled at each step.
Mixed current/target state	Steps 2, 3, 4	Medium	The boundary between "what exists today" and "what we're building toward" is blurred. Step 2 BMC mixes current and target. Step 3 systems include "to be built." Fix: Enforce strict current/target separation in the schema.
3.2 Terminology Conflicts
Term	Usage Conflict	Resolution
"Operating Model"	Step 2 produces a BMC. Step 4 also produces a BMC-structured output called "Operating Model." They are different things with the same structure.	Step 2 = Business Model Canvas. Step 4 = Operating Model (governance, org design, process, technology, sourcing, performance). Different schemas.
"Capabilities" vs. "Key Activities"	Step 2 lists "key activities," Step 3 lists "capabilities," Step 4 lists "key activities" again. These overlap but aren't mapped.	Define: Capabilities = what the organization can do (noun). Activities = what it does (verb). Map activities to capabilities explicitly.
"Value Streams" vs. "Revenue Streams"	Step 3 generates "value streams" (internal process chains). Step 2 generates "revenue streams" (income sources). Different concepts, similar names.	Maintain both but always use the full term. Never abbreviate to just "streams."
"Strategic Themes" vs. "Strategic Intent"	Step 1 output has both. Steps 2-7 reference them interchangeably.	Strategic Intent = the full Step 1 output. Strategic Themes = the 3-5 thematic pillars within it. Use precisely.
3.3 Logical Gaps in the Overall Flow
Gap	Description	Recommendation
No current-state architecture step	Step 3 generates capabilities with maturity scores but no explicit current-state architecture (systems, integrations, data flows as they exist today). Step 5 then tries to analyze gaps without a documented baseline.	Add Step 3A: Current State Discovery — document the as-is systems, integrations, data flows, and pain points BEFORE defining target capabilities.
No stakeholder/organizational analysis	The workflow is entirely technology- and capability-focused. No step addresses organizational politics, stakeholder alignment, change readiness, or culture. Yet these are the #1 cause of transformation failure.	Add to Step 4: Organizational readiness assessment, stakeholder mapping, change impact analysis.
No iteration/feedback mechanism	The workflow is strictly linear (Step 1 → 7). In real EA practice, findings in Step 5 often require revisions to Steps 1-3.	Add feedback loops: After Step 5, allow "strategic intent revision" if gaps reveal the ambition is unrealistic. After Step 7, allow "scope adjustment" based on resource/budget constraints.
No external validation touchpoint	The AI generates all outputs autonomously. At no point is the user asked to validate assumptions, confirm data points, or course-correct.	Add validation gates: After Steps 1, 3, and 5, pause and present key assumptions for user confirmation before proceeding.
Missing security and compliance architecture	No step explicitly addresses cybersecurity, data privacy, identity management, or compliance architecture — yet these are board-level concerns.	Add to Step 3: Security architecture layer. Add to Step 5: Security gap assessment. Add to Step 7: Security programme initiatives.
3.4 Recommended Improvements to Overall Flow
Revised Workflow Structure
Pre-Step: Context Extraction & Disambiguation
  └─ Structured context object + industry-calibrated prompts for all steps
  └─ [USER VALIDATION GATE: Confirm context]

Step 1: Strategic Intent
  └─ Burning platform, ambition, trade-offs, constraints, success metrics
  └─ [USER VALIDATION GATE: Confirm strategic direction]

Step 2: Business Model Analysis
  └─ Current-state BMC + Target-state BMC + Model shift analysis

Step 3A: Current State Discovery (NEW)
  └─ As-is systems, integrations, data flows, pain points, technical debt

Step 3B: Target Architecture & Capabilities
  └─ Value streams, capabilities, target systems, data domains, AI opportunities
  └─ [USER VALIDATION GATE: Confirm capability priorities and maturity]

Step 4: Target Operating Model
  └─ Governance, org design, process, technology, sourcing, performance

Step 5: Gap Analysis
  └─ Capability-anchored gaps, prioritized, financially quantified
  └─ [FEEDBACK LOOP: If gaps reveal ambition is unrealistic → revise Step 1]

Step 6: Value Pools & Investment Case
  └─ Net-value-adjusted, confidence-weighted, double-count-reconciled

Step 7: Transformation Roadmap
  └─ Sequenced, resource-constrained, phase-gated, change-managed
  └─ [FEEDBACK LOOP: If resource constraints require de-scoping → revise Step 6]

PART 4: Executive Summary
Top 5 Critical Improvements
1. Fix the System Prompt Cliff — Steps 2-7 Are Running Blind

The problem: The Pre-Step 1 Prompt Optimiser generates excellent industry-specific intelligence — but only for Step 1. Steps 2 through 7 receive absurdly thin system prompts (5-9 words). The result: Step 1 output is strong; Steps 2-7 quality degrades as the AI has no industry context, no persona, and no quality gates.

The fix: Generate industry-calibrated system prompts for ALL 7 steps in Pre-Step 1. Each step needs a tailored persona, industry terminology, quality gates, and cross-step consistency instructions. This is the single highest-ROI change to the workflow.

2. Add User Validation Gates — Stop Building on Unverified Assumptions

The problem: The AI generates all outputs autonomously from a 7-word input. It fabricates specific financial figures (€420M loan book, 800k sqm AUM), maturity scores, and system landscapes with no user validation. Every subsequent step compounds these assumptions. If the initial inference is wrong, all 7 steps are wrong.

The fix: Insert 3 validation gates (after Pre-Step, after Step 1, after Step 3) where the user confirms or corrects key assumptions before the workflow proceeds. This transforms the tool from "AI generates a fantasy" to "AI drafts, human validates, AI refines."

3. Fix the ROI Model — Current Financial Outputs Destroy Credibility

The problem: Step 3's computed financials show payback periods of 324-667 months (27-56 years) because they only count FTE savings from individual capabilities. This is wrong. In any real EA engagement, value comes from revenue uplift, risk avoidance, operational efficiency, AND strategic optionality. Presenting 56-year paybacks to a board would end the engagement.

The fix: Implement a multi-lever value model (FTE efficiency + revenue uplift + risk avoidance + strategic optionality) with ranges and confidence levels. Add double-count reconciliation in Step 6. Generate NPV/IRR/payback metrics that would survive CFO scrutiny.

4. Restructure Step 4 — The Operating Model Is Not a Second BMC

The problem: Step 4 uses the identical Business Model Canvas structure as Step 2. A real operating model covers governance, organization design, process architecture, technology operating model, sourcing strategy, and performance management. The current Step 4 adds no new analytical value.

The fix: Redesign Step 4 with a proper operating model framework covering 6 pillars. This is where organizational change, talent strategy, governance, and process design live — the elements that determine whether the technical architecture actually gets implemented.

5. Add Cross-Step Consistency and a Context Accumulator

The problem: Each step receives partial context from prior steps, inconsistently formatted. There's no mechanism to detect contradictions, maintain a financial ledger, or ensure terminology consistency. Steps can — and do — contradict each other.

The fix: Implement a Context Accumulator — a structured data object that grows with each step, maintaining all decisions, financial estimates, capability definitions, and assumptions. Every step reads from and writes to this object. Add a Consistency Validator between steps that flags contradictions before the next step runs.

Key Success Factors for Implementation
Factor	Why It Matters	How to Achieve It
Industry knowledge depth	Generic EA frameworks applied to specific industries produce shallow output. The workflow's value is industry-specific insight.	Maintain curated knowledge bases per industry (KPIs, regulatory landscape, competitive dynamics, technology stacks, reference architectures). Inject into prompts.
Financial credibility	If the CFO doesn't trust the numbers, the entire assessment is dismissed.	Use industry benchmarks, ranges instead of point estimates, transparent assumptions, and standard financial metrics (NPV, IRR, payback).
Assumption transparency	AI-generated specifics that look authoritative but are fictional erode trust when discovered.	Flag every AI-generated estimate with confidence levels and "requires client validation" markers.
User co-creation	The best EA assessments are collaborative, not delivered as black boxes.	Validation gates, editable outputs, "what if" scenario capability.
Cross-step integrity	The workflow's value is the coherent narrative across 7 steps, not any individual step.	Context accumulator, consistency validators, financial ledger reconciliation.
How This Workflow Differentiates from Traditional EA 1.0
Dimension	EA 1.0 (Traditional)	NexGen EA V4 (Current)	NexGen EA V4 (Optimized)
Time to first output	4-12 weeks	Minutes	Minutes, with validation gates
Industry specificity	Generic frameworks (TOGAF, Zachman) applied uniformly	Dynamic industry calibration via prompt engineering	Deep industry knowledge base + dynamic calibration + user validation
Financial grounding	Rarely quantified; "strategic alignment" language	Partially quantified; some fabricated specifics	Multi-lever ROI model with ranges, confidence, and reconciliation
Iteration speed	One deliverable, months of rework	Linear 7-step, no iteration	Feedback loops, scenario branching, phase gates
User involvement	Weeks of workshops and interviews	Zero — fully autonomous	Targeted validation gates (3 checkpoints, <5 min each)
Technology recommendation depth	"Modernize your platform"	Named vendors, specific systems	Named vendors + rationale + alternatives + reference architecture
Change management	Separate workstream, often ignored	Not addressed	Integrated into Steps 4 and 7
Board readiness	Requires weeks of "packaging"	Partially presentation-ready	Fully board-ready: NPV/IRR, risk-adjusted, phase-gated
Conclusion

The NexGen EA V4 workflow represents a genuine leap from traditional EA practice. The core design — a 7-step sequential assessment driven by AI, starting from a simple prompt and producing a full transformation roadmap — is architecturally sound and commercially valuable.

The critical gap is execution quality variance: Step 1 (with its optimised prompt) produces genuinely strong output; Steps 2-7 (with minimal prompts) produce results that look impressive but wouldn't survive a rigorous CIO review session. The five improvements above — prompt parity, validation gates, financial model repair, operating model redesign, and cross-step consistency — transform this from a compelling demo into a tool that senior architects would trust for real client engagements.

The competitive moat for this platform lies not in the workflow steps themselves (any EA firm can define 7 steps) but in the depth of industry-specific intelligence, the speed of iteration, and the financial credibility of the outputs. Invest there.

End of Report