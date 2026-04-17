# Technical Implementation Instructions — AI‑Integrated Toolkit for EA Engagement Playbook

## 0) What you are implementing (non‑negotiable)
You are implementing an **EA Engagement Playbook Toolkit** where:

- **Analysis is done on canvases** (interactive structured work surfaces).
- **All outputs are generated from one canonical content model** (single source of truth).
- The toolkit produces **multiple formats** (MD/HTML/PDF/DOCX/PPTX) **without manual copy‑paste**.

### Business outcomes this must drive
- **Cost savings:** faster repeatable engagement execution across 5–10 customers per segment.
- **Risk reduction:** consistent decision logs, assumptions, and traceability.
- **Competitive advantage:** higher speed from discovery → EA vision → roadmap → executive pack.
- **Regulatory compliance support:** explicit constraints, dependencies, audit‑friendly documentation.

## 1) Scope and operating model

### 1.1 Engagement method to implement (as backlog + artifacts)
Implement the EA engagement as an **EA‑led, Agile, phase‑based initiative**.

**Epic structure (fixed):**
- `E0` Initiation & Setup
- `E1` AS‑IS Assessment
- `E2` White‑Spot & Opportunity Analysis
- `E3` Customer Validation & Alignment
- `E4` Target EA Vision
- `E5` Roadmap & Enablement

**Rule:** `1 story = 1 EA outcome` producing **one reviewable artifact**.

### 1.2 Mandatory customer deliverables
For each customer you must generate:

1. **EA Engagement Output Document** (single source of truth; full depth)
2. **Portfolio / Leadership View** (1–3 pages / slides; investment framing)
3. **Sales / Account Planning Extract** (one‑pager or slide mini‑deck)

All three must be derived from the same canonical model.

## 2) Target architecture of the toolkit

### 2.1 Three layers (implement exactly)

#### Layer A — Canonical Content Model (structured data)
- Stores engagement facts, decisions, initiatives, stakeholders, roadmaps, and architecture views.
- **No layout decisions** live here.

#### Layer B — Canvas & Analysis Layer (interactive)
- Users create and update structured content through **named canvases**.
- Canvases write to (and read from) the canonical model.

#### Layer C — Output & Generation Layer
- Renders the model into different audience‑specific outputs.
- Uses **templates + rules + AI**.

### 2.2 Governance rule (to prevent chaos)
- **One canonical model** (the truth)
- **Many rendered views** (documents, slides, dashboards)
- **No manual copy‑paste** between documents

## 3) Canonical content model (data objects + minimal schema)

### 3.1 Storage approach (practical)
Start with a file‑based repository per engagement:
- Canonical model: `YAML` or `JSON` (machine readable)
- Narrative blocks: `Markdown` (human readable)
- Diagrams: `SVG` / `PNG` references (optional)

This gives:
- **Low tool friction** (fast adoption)
- **Traceability** (diffs, versioning)
- **AI readiness** (structured prompts)

### 3.2 Core entities (minimum required)
Implement these entities. If they do not exist, you cannot generate consistent outputs.

- `Engagement`
- `Customer`
- `Segment`
- `Phase` (maps to Epics)
- `Story`
- `Stakeholder`
- `Application` (portfolio items)
- `Capability` (optional but recommended)
- `Risk`
- `Constraint`
- `Decision`
- `Assumption`
- `Initiative` (investment option)
- `RoadmapItem`
- `ArchitectureView` (AS‑IS, Target)
- `Artifact` (generated output references)

### 3.3 Required fields (opinionated minimum)
Below is a minimal JSON schema style definition (illustrative). Use the same keys in every engagement.

```json
{
  "engagement": {
    "id": "SEG-INS-2026Q2-001",
    "segment": "Insurance",
    "theme": "Application sunsetting & modernization",
    "customers": ["CUST-001", "CUST-002"],
    "status": "active",
    "sprintCadence": "2w",
    "governance": {
      "decisionForum": "Steering Committee",
      "reviewCadence": "biweekly",
      "raciRef": "artifact:raci"
    },
    "successCriteria": [
      "Prioritized modernization & sunsetting candidates confirmed",
      "Target EA vision agreed",
      "Roadmap approved"
    ]
  }
}
```

#### Stakeholder (must support top‑down mapping)
```json
{
  "stakeholder": {
    "id": "STK-007",
    "name": "CIO",
    "role": "CIO",
    "orgUnit": "IT",
    "influence": "high",
    "decisionPower": "high",
    "priorities": ["Cost reduction", "Regulatory readiness"],
    "notes": "Prefers 1-page decision packs"
  }
}
```

#### Application (portfolio lifecycle focus)
```json
{
  "application": {
    "id": "APP-042",
    "name": "Claims Legacy System",
    "businessDomain": "Claims",
    "lifecycle": "tolerate|invest|migrate|retire",
    "riskLevel": "high",
    "technicalDebt": "high",
    "regulatorySensitivity": "medium",
    "sunsetCandidate": true,
    "modernizationCandidate": true,
    "constraints": ["CON-003"],
    "evidenceRefs": ["workshop:2026-04-20"]
  }
}
```

#### Initiative (investment option)
```json
{
  "initiative": {
    "id": "INIT-010",
    "name": "Legacy Application Sunsetting Wave 1",
    "linkedThemes": ["Application Simplification"],
    "businessOutcomes": ["Lower run-cost", "Reduced operational risk"],
    "valueType": ["cost", "risk"],
    "timeHorizon": "short|mid|long",
    "dependencies": ["DEP-002"],
    "risks": ["RISK-004"],
    "status": "option" 
  }
}
```

## 4) Canvas catalog (analysis surfaces)

### 4.1 Mandatory canvases
Implement these canvases as first‑class UI/pages or structured forms.

1. **Engagement Canvas**
   - Scope, objectives, success criteria, governance, cadence
2. **Stakeholder Canvas**
   - Influence/decision power, sponsorship, workshop plan
3. **AS‑IS Application Portfolio Canvas**
   - Lifecycle heatmap, constraints, risk log
4. **White‑Spot Canvas**
   - Capability gaps, redundancy, technical debt hotspots
5. **Target EA Canvas**
   - Principles, target patterns, reference architectures
6. **Roadmap Canvas**
   - Short/mid/long initiatives, sequencing, dependencies
7. **Portfolio / Leadership Canvas**
   - Themes → initiatives → investment horizons → decisions

### 4.2 Canvas design rules (critical)
- Each canvas must:
  - Read/write **only** the canonical model
  - Capture **evidence** (workshop, assumption, decision)
  - Produce **structured outputs** (not free text only)

### 4.3 Mapping: Canvas → Model → Output sections

| Canvas | Primary Model Objects | Generated Output Sections |
|---|---|---|
| Engagement | Engagement, Phase, Story | Engagement Overview, Scope & Objectives, Governance & RACI, Agile Phases |
| Stakeholder | Stakeholder, Decision, Assumption | Stakeholder Insights, Stakeholder Map, Decisions/Assumptions |
| AS‑IS Portfolio | Application, Risk, Constraint | AS‑IS Summary, Lifecycle Snapshot, Risk & Constraint Log |
| White‑Spot | Capability, Application, Initiative (draft) | White‑Spot Analysis, Opportunity List, Prioritized Themes |
| Target EA | ArchitectureView, Principles, Patterns | Target EA Vision, Architecture Principles, Reference Patterns |
| Roadmap | RoadmapItem, Initiative, Dependency | Roadmap & Next Steps, Initiative Dependency Map |
| Portfolio | Initiative, Theme, RoadmapItem | Portfolio Themes, Investment Options, Investment Horizons, Leadership Decisions |

## 5) Output generation (multi‑format) from one model

### 5.1 Output types (must exist)

#### Output A — EA Engagement Output Document (customer)
**Format targets:** `Markdown` (canonical), `HTML`, `PDF/DOCX` (rendered)

**Section structure (fixed):**
- Executive Summary
- Engagement Overview
- Scope & Objectives
- Governance & RACI
- Agile Phases Overview
- AS‑IS Summary
- White‑Spot Analysis
- Stakeholder Insights
- Target EA Vision
- Modernization & Sunsetting
- Roadmap & Next Steps
- Decisions, Risks & Assumptions
- Actions & Follow‑Up
- Appendices (notes, diagrams)

#### Output B — Portfolio / Leadership View
**Format targets:** `PPTX` and/or `PDF` (1–3 pages)

**Table of contents (fixed):**
- Portfolio Context & Objectives
- Strategic Portfolio Themes
- Strategic Initiatives (Investment Options)
- Portfolio Roadmap (Investment Horizons)
- Value, Risk & Dependency Overview
- Leadership Decisions & Recommendations

#### Output C — Sales / Account Planning Extract
**Format targets:** `PPTX` or `1‑pager PDF`

**Content rules:**
- Reframe into **value**: cost, risk, speed, compliance
- Include **next‑step ask** (workshop, sponsorship, decision)

### 5.2 Rendering strategy (recommended)
- **Authoritative narrative:** Markdown files generated from the model
- **Web view:** HTML generated from the same markdown + structured data
- **PDF/DOCX:** render from HTML (template‑controlled)
- **PPTX:** use slide templates populated from the model

This approach minimizes rework and reduces quality variance.

## 6) AI integration design (where AI is allowed vs not allowed)

### 6.1 AI responsibilities (allowed)
Use AI for:
- Drafting **narrative** sections from structured facts
- Summarizing workshops and extracting:
  - risks, constraints, decisions, assumptions, actions
- Generating executive‑level reframes:
  - “what leadership needs to decide”
- Detecting inconsistencies:
  - missing owners, missing time horizons, duplicate initiatives

### 6.2 Hard guardrails (not allowed)
AI must **not**:
- Invent applications, stakeholders, constraints, or numbers
- Change lifecycle categories without evidence
- Mark a decision as “approved” without explicit confirmation

### 6.3 Traceability requirement
Every AI‑generated statement must be linked to at least one:
- `Decision` (if it is a conclusion)
- `Assumption` (if it is not confirmed)
- `EvidenceRef` (workshop notes, source reference)

## 7) Implementation workflow (how teams actually use it)

### 7.1 Sprint workflow (repeatable)
For each sprint:
1. **Canvas updates** (workshops, analysis)
2. **Model validation** (completeness checks)
3. **Generate outputs** (customer doc + leadership view)
4. **Review** (EA lead + account lead + sponsor)
5. **Decision capture** (log + owner + date)

### 7.2 Mandatory roles
- **EA Lead (owner):** backlog, quality, outputs
- **Account/Sales lead:** commercial framing, stakeholder access
- **CSM / Delivery lead:** initiatives feasibility, constraints
- **Customer sponsor:** decisions, prioritization

### 7.3 Definition of Done (DoD) for an EA story
A story is done only if:
- Model objects updated
- Artifact generated and reviewable
- Decisions/assumptions/actions captured
- Owner + date recorded

## 8) Quality controls (reduce risk, increase reuse)

### 8.1 Model completeness checks (automate)
Implement automated checks such as:
- Every `Initiative` has `businessOutcomes`, `timeHorizon`, and `linkedThemes`
- Every `RoadmapItem` references an `Initiative`
- Every `Decision` has `owner`, `date`, `status`
- Every `Application` has `lifecycle` and `riskLevel`

### 8.2 Segment reuse rules (scale across customers)
- Maintain a **segment library**:
  - reference architectures
  - common principles
  - typical white‑spots
  - standard portfolio themes
- Allow customer overrides, but keep defaults reusable.

Business outcome: **lower delivery cost per engagement** and **higher consistency**.

## 9) Minimal viable implementation plan (phased)

### Phase 1 — Realistic start (2–4 weeks)
- Canonical model in YAML/JSON
- Markdown generation for customer output document
- Basic canvas forms for Engagement + Stakeholder + AS‑IS
- Manual export to PDF via HTML template

**Outcome:** immediate repeatability; lower documentation effort.

### Phase 2 — Full canvas catalog + automated generation (4–8 weeks)
- Add White‑Spot, Target EA, Roadmap, Portfolio canvases
- Automated creation of:
  - customer doc (MD/HTML/PDF)
  - leadership pack (PPTX/PDF)
  - sales one‑pager

**Outcome:** faster executive communication and decision support.

### Phase 3 — Integrations (optional)
- Wiki/SharePoint publishing
- EA tool integrations (if needed)
- CRM linkage (initiatives → account plan)

**Outcome:** portfolio alignment and improved account execution.

## 10) Acceptance criteria (what “implemented” means)

### Must pass
- A new engagement can be created in < 30 minutes with:
  - scope, objectives, RACI, stakeholders (initial)
- For one customer, the toolkit can generate:
  - EA Engagement Output Document (MD + HTML)
  - Portfolio / Leadership View (PDF/PPTX)
  - Sales extract (one‑pager)
- No output requires manual copy‑paste
- Decisions/assumptions are traceable to evidence

### Should pass (strongly recommended)
- Segment reuse works across 5–10 customers
- Automated completeness checks prevent missing critical fields

## 11) Appendix — Content templates (starter)

### 11.1 File/folder convention (per engagement)
```text
engagements/
  SEG-INS-2026Q2-001/
    model/
      engagement.yaml
      stakeholders.yaml
      applications.yaml
      initiatives.yaml
      roadmap.yaml
      decisions.yaml
    canvases/
      engagement_canvas.md
      stakeholder_canvas.md
      as_is_portfolio_canvas.md
      white_spot_canvas.md
      target_ea_canvas.md
      roadmap_canvas.md
      portfolio_canvas.md
    outputs/
      customer_output.md
      leadership_view.md
      sales_extract.md
```

### 11.2 Decision log (required fields)
- `decisionId`
- `title`
- `status` (proposed / confirmed)
- `owner`
- `date`
- `impact`
- `relatedObjects` (apps, initiatives, roadmap items)

## 12) One‑sentence implementation instruction (for managers)
Implement EA engagements as an **EA‑led, Agile, epic‑to‑story delivery system** where **canvases capture structured analysis** into a **single canonical content model**, and **all customer, leadership, and sales outputs are generated automatically** from that model to drive faster decisions, lower delivery cost, and reduced execution risk.
