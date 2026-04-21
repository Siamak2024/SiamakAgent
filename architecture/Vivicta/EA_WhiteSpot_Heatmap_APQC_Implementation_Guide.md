# EA WhiteSpot Heatmap & APQC Integration – Implementation Guide

**Audience:** EA, Sales, DevOps/Engineering  
**Purpose:** Implement a WhiteSpot heatmap using the Service Delivery Model (JSON) and integrate it with APQC for an EA Engagement Playbook, EA Growth Dashboard, and opportunity management.

---

## 1. What you will build

You will build a solution that:

- Uses the **Service Delivery Model JSON** as the **system of record** for services (L1/L2/L3) and HL/DL tagging.
- Captures **customer-specific assessments** on **HL services** using the legend: **Full / Partial / Custom / Lost / Potential**.
- Integrates **APQC** by mapping **APQC Level 3–4 processes** to **L3 (DL) delivery components**, then rolling up to **L2 (HL)** for heatmaps.
- Exposes **dashboard views** for Sales + EA:
  - **EA Growth Dashboard** (portfolio heatmap + opportunities)
  - **Opportunity management** (pipeline candidates based on gaps)
  - **APQC coverage view** (capability/process coverage)

---

## 2. Inputs (files)

### 2.1 Required

1. **Service Delivery Model JSON (consolidated)**  
   - Contains: L1 service areas, L2 offerings, L3 components, and heatmap tagging HL/DL.

2. **APQC Model dataset** (PCF)  
   - At minimum: APQC ID, name, hierarchy (Level 1–4).

### 2.2 Optional (strongly recommended)

3. **Customer instance data**
   - Account metadata (industry, segment, region)
   - Current-state assessments and evidence
   - Opportunity register

---

## 3. Core concepts (do not mix these)

### 3.1 Taxonomy vs. assessment

- **Taxonomy (stable):** services, service areas, delivery offerings, delivery components.
- **Assessment (per customer/time):** Full/Partial/Custom/Lost/Potential.

**Rule:** Do **not** write customer-specific values into the core taxonomy. Keep them in separate “instance” data.

### 3.2 HL vs DL

- **HL (High Level):** used for the **heatmap** (stable groupings, portfolio-level)
- **DL (Detail Level):** used for **drill-down** and **APQC mapping** (execution-level)

**Rule:** Only HL items appear as rows in the main heatmap.

---

## 4. The 3-Level Service Delivery Model (what it means)

### L1 – Service Area (domain)
Examples: Infrastructure Services, Data & AI, Security, Business Automation & Integration (BAI), Enterprise Service Management.

### L2 – Delivery Offering (portfolio grouping)
Examples: Cloud Strategy & Governance, Cloud Operations, Intelligent Automation, Data Architecture & Modelling.

### L3 – Delivery Component (concrete delivery)
Examples: Cloud Operating Model, Data and AI governance, Penetration Testing, Data modernization and migration.

**Heatmap principle:** Heatmap rows are **L2 (HL)**; evidence and APQC mapping happens at **L3 (DL)**.

---

## 5. WhiteSpot Heatmap – how to implement

### 5.1 Data structures (recommended)

Maintain 3 data stores:

1. **Service Taxonomy Store** (from JSON) – stable
2. **APQC Store** (PCF) – stable
3. **Customer Instance Store** – mutable


### 5.2 Customer Instance Store – minimum schema

Create a per-customer/per-assessment snapshot structure. Example:

```json
{
  "customerId": "CUST-001",
  "customerName": "Example Customer",
  "industry": "Insurance",
  "assessmentDate": "2026-04-20",
  "assessedBy": "Enterprise Architecture",
  "hlAssessments": [
    {
      "l2Id": "L2-INF-02",
      "l2Name": "Cloud Operations",
      "assessment": "Partial",
      "evidenceRefs": ["meeting:...", "doc:..."],
      "notes": "Ops exists but limited automation"
    }
  ],
  "opportunities": [
    {
      "oppId": "OPP-101",
      "title": "FinOps operating model",
      "linkedHlServices": ["L2-INF-02"],
      "status": "Identified",
      "estimatedValue": null
    }
  ]
}
```

**Rule:** Only HL services appear in `hlAssessments`.

---

## 6. APQC integration – the only correct mapping rule

### 6.1 Golden rule

> Map **APQC Level 3–4** ⟶ **L3 (DL) Delivery Components**.

Do **not** map APQC directly to L1 or L2. Those are roll-ups.

### 6.2 APQC Mapping Store – recommended schema

```json
{
  "apqcMappings": [
    {
      "apqcId": "6.4.1",
      "apqcLevel": 3,
      "apqcName": "Define data governance",
      "mapsToL3": ["L3-DAI-002"],
      "rationale": "Governance delivery component"
    },
    {
      "apqcId": "6.4.4",
      "apqcLevel": 3,
      "apqcName": "Enable data integration",
      "mapsToL3": ["L3-BAI-005", "L3-BAI-006"],
      "rationale": "Integration architecture + API management"
    }
  ]
}
```

### 6.3 Roll-up logic (APQC → Heatmap)

1. Determine which APQC processes apply to the customer (industry + scope).
2. For each selected APQC process, evaluate the mapped **L3** components.
3. Roll up the L3 component statuses to their parent **L2** services.
4. Populate the **HL heatmap** for the customer using your legend.

---

## 7. Heatmap scoring (recommended deterministic rules)

For each HL service (L2):

- **Full**: all relevant mapped L3 components are delivered and evidence exists
- **Partial**: some mapped L3 components are delivered; gaps exist
- **Custom**: delivered via bespoke solution (non-standard approach)
- **Lost**: not delivered today (no mapped L3 components delivered)
- **Potential**: planned / high-value opportunity identified

**Implementation note:** Keep scoring rules configurable (policy file) so EA can adjust without code changes.

---

## 8. Dashboard views (EA Growth Dashboard)

### 8.1 Core views

1. **Portfolio Heatmap (HL)**
   - Rows: HL services (L2)
   - Columns: customers or segments
   - Cell: assessment value

2. **Opportunity Heatmap**
   - Filter: assessments = Lost or Potential
   - Group by: L1 service area

3. **APQC Coverage View**
   - Rows: APQC Level 2 or 3
   - Columns: HL services (L2)
   - Cell: coverage derived from L3 mapping + customer evidence

### 8.2 Drill-down

From any HL cell:
- Show contributing L3 components
- Show mapped APQC processes
- Show evidence references
- Show suggested next actions (playbook steps)

---

## 9. EA Engagement Playbook integration

### 9.1 Engagement phases (recommended)

1. **Discover**
   - Select APQC scope
   - Identify stakeholders
   - Gather evidence

2. **Assess**
   - Rate HL services (Full/Partial/Custom/Lost/Potential)
   - Validate with EA + Sales lead

3. **Identify Opportunities**
   - Convert Lost/Potential to opportunity backlog
   - Link to HL services and APQC processes

4. **Plan & Roadmap**
   - Prioritize opportunities
   - Define target state + milestones

5. **Execute / Handover**
   - Convert to delivery epics / work packages

### 9.2 Outputs to Sales

- EA Growth Dashboard (heatmap + opportunity list)
- 1-page storyline: “Top 5 capability gaps → recommended services”
- Roadmap view (quarterly)

---

## 10. Engineering implementation checklist

### 10.1 Data ingestion

- [ ] Parse Service Delivery Model JSON
- [ ] Store in a queryable catalog (graph or relational)
- [ ] Parse APQC PCF dataset

### 10.2 Mapping workflow

- [ ] Maintain APQC ↔ L3 mapping as a separate artifact (versioned)
- [ ] Implement validation rules:
  - APQC mappings reference valid L3 IDs
  - HL services flagged correctly

### 10.3 Scoring engine

- [ ] Compute HL assessment from L3 evidence + rules
- [ ] Support manual override (EA decision)
- [ ] Store snapshots per customer

### 10.4 UI / Reporting

- [ ] Heatmap visualization (HL only)
- [ ] Drill-down panels (L2 → L3 → APQC)
- [ ] Opportunity register linked to heatmap cells

---

## 11. Guardrails (must-have)

- Do not embed customer-specific assessments into the taxonomy JSON.
- Do not map APQC to L1 or L2.
- Treat service categories (Consulting/Managed/Platform) as an axis, not a hierarchy.
- Keep HL list stable; extend DL freely.

---

## 12. Deliverables for DevOps handover

- [ ] **Service Delivery Model JSON** (taxonomy + HL/DL tags)
- [ ] **APQC dataset** (Level 1–4)
- [ ] **APQC ↔ L3 mapping file** (versioned)
- [ ] **Customer assessment snapshots** (instance data)
- [ ] **Dashboard definitions** (views + filters)

---

## 13. Recommended next increment

1. Add `assessment` field on HL services in customer instance data
2. Implement APQC mapping store + validation
3. Build initial heatmap (1–3 customers)
4. Add opportunity register and linkage

---

**End of document**
