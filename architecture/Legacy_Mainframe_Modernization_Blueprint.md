# Legacy Mainframe Modernization Blueprint
## Banking & Insurance Enterprise Transformation Program

**Document Version:** 1.0  
**Classification:** Program Management Reference  
**Target Users:** Enterprise Architects (EA) · Program/Project Managers · Finance & Risk Officers  
**AI-Assisted:** Claude Sonnet (Anthropic) — EA Platform Integration  
**Last Updated:** April 2026  

---

> **How to Use This Blueprint**
> This document is designed to be updated iteratively throughout the program. Every section marked `[EDITABLE]` should be revised by the program team as discovery progresses. Gannt timelines are expressed in relative weeks/months so they can be anchored to your actual program start date. Tollgates are the mandatory governance checkpoints — no phase proceeds without tollgate sign-off.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Organisation Assessment Input](#2-organisation-assessment-input)
3. [Modernization Maturity Model](#3-modernization-maturity-model)
4. [Strategic Framework & Modernization Patterns](#4-strategic-framework--modernization-patterns)
5. [Program Architecture & Phases](#5-program-architecture--phases)
6. [Tollgate Governance Model](#6-tollgate-governance-model)
7. [Gantt Plan — Master Program Schedule](#7-gantt-plan--master-program-schedule)
8. [Migration Plan](#8-migration-plan)
9. [Test Plan](#9-test-plan)
10. [Tools & Technology Stack](#10-tools--technology-stack)
11. [AI Integration Layer](#11-ai-integration-layer)
12. [Artifacts Register](#12-artifacts-register)
13. [CAPEX Model & Business Case](#13-capex-model--business-case)
14. [Risk Register](#14-risk-register)
15. [Sources & External References](#15-sources--external-references)

---

## 1. Executive Summary

### Program Purpose

This Blueprint provides a comprehensive, structured framework for the modernization of Legacy Mainframe environments in Banking and Insurance enterprises. It is designed to serve as both a **strategic architecture reference** and an **operational program management tool** — enabling Enterprise Architects, Program Managers and Finance Officers to plan, execute and govern the transformation from a Legacy Mainframe state to a modern, cloud-native or hybrid target architecture.

### The Business Imperative

Legacy mainframe environments in Banking and Insurance represent both the organization's greatest operational strength and its most significant strategic liability.

- **Cost burden:** Maintaining legacy systems consumes up to **60–80% of IT budgets** in traditional enterprises, leaving minimal budget for innovation *(Gartner, 2024)*
- **Skills crisis:** Nearly **one-third of COBOL programmers will retire by 2030**, creating an existential talent dependency *(Quinnox, 2025)*
- **Strategic constraint:** Legacy systems act as data silos, blocking real-time AI, cloud-native integration and digital customer experience
- **Regulatory exposure:** Aging mainframe architectures increasingly fail to meet modern regulatory requirements for real-time reporting, audit trails and data governance (GDPR, EU AI Act, DORA, Basel IV)
- **Market opportunity:** The mainframe modernization market is growing at **15.2% CAGR** from $15.72B (2024) to $18.12B (2025) — meaning tools, partners and proven patterns have never been more mature *(The Business Research Company, 2025)*

### Program Approach

This Blueprint adopts the **Intelligent Hybrid Modernization** approach — not a Big Bang replacement, but a structured, risk-managed, wave-based transformation using the **Strangler Fig Pattern** as the governing architectural principle, underpinned by the **Gartner TIME Framework** for workload disposition decisions.

### Expected Outcomes

| Outcome | Target | Timeframe |
|---------|--------|-----------|
| MIPS cost reduction | 50–70% | 36–48 months |
| IT budget freed for innovation | 30–40% | 24–36 months |
| Batch-to-real-time conversion | 60–80% of eligible batch | 36 months |
| Development cycle acceleration | 3–5x faster | 24 months |
| Regulatory compliance posture | Full (DORA, GDPR, EU AI Act) | 18–24 months |
| ROI | 288–362% | Over 3 years *(Kyndryl, 2025)* |

---

## 2. Organisation Assessment Input

> **[EDITABLE — Starting Point for Blueprint Generation]**  
> Complete this section before activating AI-assisted blueprint generation. The more detail provided, the higher the quality of AI-generated artifacts downstream.

### 2.1 Organisation Profile

```
Organisation Name:        [ENTER]
Industry:                 [ ] Banking  [ ] Insurance  [ ] Both  [ ] Other BFSI
Headquarters:             [ENTER]
Operating Regions:        [ENTER — list all countries/regions]
Annual Revenue (approx):  [ENTER]
Number of Employees:      [ENTER]
IT Department Size:       [ENTER]
Regulatory Jurisdictions: [ENTER — e.g. EU, UK, US Federal, etc.]
```

### 2.2 Current Mainframe Environment

```
Mainframe Platform:       [ ] IBM zSeries  [ ] Unisys  [ ] Bull/Atos  [ ] Other: [ENTER]
Current IBM z-version:    [ENTER — e.g. z15, z16, z17]
Estimated MIPS:           [ENTER]
Annual Mainframe Cost:    [ENTER — USD/EUR]
No. of COBOL Programs:    [ENTER — approximate]
No. of JCL Batch Jobs:    [ENTER — approximate]
No. of CICS Transactions: [ENTER — approximate]
Primary Databases:        [ ] DB2  [ ] IMS  [ ] VSAM  [ ] Other: [ENTER]
No. of Integration Points:[ENTER — connections to non-mainframe systems]
Avg Nightly Batch Window: [ENTER — hours]
Peak Transaction Volume:  [ENTER — TPS]
```

### 2.3 Business Challenges `[EDITABLE]`

Document the primary challenges driving this transformation. Use these as the strategic anchor for the entire blueprint.

| # | Challenge | Business Impact | Priority |
|---|-----------|----------------|----------|
| 1 | [e.g. 70% IT budget consumed by mainframe run-costs] | [e.g. No budget for digital/AI initiatives] | High/Med/Low |
| 2 | [e.g. COBOL skills retiring — 3 key developers retiring 2026] | [e.g. Critical knowledge loss risk] | |
| 3 | [e.g. Nightly batch window 6h — blocks real-time products] | [e.g. Cannot offer real-time payments/pricing] | |
| 4 | [e.g. Cannot connect mainframe data to AI/ML platforms] | [e.g. Blocked from AI-driven fraud detection] | |
| 5 | [e.g. DORA compliance requires resilience improvements] | [e.g. Regulatory risk — deadlines 2025] | |
| 6 | [ADD MORE] | | |

### 2.4 Business Opportunities `[EDITABLE]`

| # | Opportunity | Value Potential | Enabled By |
|---|-------------|----------------|------------|
| 1 | [e.g. Real-time fraud detection AI] | [e.g. €5-15M annual fraud savings] | Batch → event streaming |
| 2 | [e.g. Open Banking API monetization] | [e.g. €2-10M new revenue] | API layer on core banking |
| 3 | [e.g. Personalized insurance pricing] | [e.g. 15-25% premium revenue uplift] | Real-time data access |
| 4 | [e.g. Cloud infrastructure cost model] | [e.g. 50-70% MIPS cost reduction] | Workload migration |
| 5 | [ADD MORE] | | |

### 2.5 Constraints `[EDITABLE]`

```
Budget Envelope (CAPEX):     [ENTER — total approved or estimated]
Program Timeline Constraint: [ENTER — e.g. must reduce MIPS by 30% within 18 months]
Regulatory Hard Deadlines:   [ENTER — e.g. DORA Jan 2025, EU AI Act Aug 2026]
Business Continuity SLA:     [ENTER — e.g. 99.99% uptime, zero batch failures]
Decommission Targets:        [ENTER — any contractual/hardware end-of-life dates]
Skills Constraints:          [ENTER — e.g. 2 COBOL developers retiring Q4 2026]
```

---

## 3. Modernization Maturity Model

The Mainframe Modernization Maturity Model (M4) provides a structured framework to assess organizational readiness across five dimensions before and during the transformation program. It drives tollgate decisions and identifies where remediation is needed before proceeding.

### 3.1 The Five Maturity Dimensions

| Dimension | Description |
|-----------|-------------|
| **1. Discovery & Inventory** | Completeness of mainframe application, data, batch and dependency inventory |
| **2. Architecture Readiness** | Target architecture defined, EA governance in place, patterns selected |
| **3. Data Readiness** | Data quality, data lineage, CDC capability, data governance maturity |
| **4. Organizational Readiness** | Skills availability, change management, training, vendor partnerships |
| **5. Operational Readiness** | DevOps/DevSecOps capability, observability, testing automation, runbook maturity |

### 3.2 Maturity Levels

| Level | Label | Description |
|-------|-------|-------------|
| **1** | Initial | Ad-hoc, undocumented, reactive — no formal modernization planning |
| **2** | Developing | Basic inventory exists, some planning underway, skills gaps identified |
| **3** | Defined | Documented processes, architecture decisions made, CDC tools selected |
| **4** | Managed | Metrics-driven, tooling in place, pilot migrations complete, governance active |
| **5** | Optimizing | Continuous improvement, automated pipelines, full observability, repeatable |

### 3.3 Maturity Assessment Scorecard `[EDITABLE — Score each dimension 1–5]`

#### Dimension 1: Discovery & Inventory

| Capability | Score (1–5) | Evidence / Notes |
|------------|-------------|-----------------|
| Complete COBOL program inventory exists | | |
| JCL batch job catalog with dependencies documented | | |
| CICS/IMS transaction inventory complete | | |
| Data dictionary / schema documentation current | | |
| Integration point map (mainframe ↔ external) complete | | |
| Business criticality ratings assigned to all applications | | |
| **DIMENSION AVERAGE** | | |

#### Dimension 2: Architecture Readiness

| Capability | Score (1–5) | Evidence / Notes |
|------------|-------------|-----------------|
| Target architecture defined and approved | | |
| Modernization patterns selected per workload | | |
| Coexistence / transitional architecture designed | | |
| API strategy and gateway design complete | | |
| Event streaming / CDC architecture defined | | |
| Cloud landing zone designed and provisioned | | |
| **DIMENSION AVERAGE** | | |

#### Dimension 3: Data Readiness

| Capability | Score (1–5) | Evidence / Notes |
|------------|-------------|-----------------|
| Data quality baseline assessment complete | | |
| Data lineage mapped for critical data domains | | |
| CDC tooling selected and tested | | |
| Data governance framework in place | | |
| Data migration tooling selected | | |
| Reconciliation framework designed | | |
| **DIMENSION AVERAGE** | | |

#### Dimension 4: Organisational Readiness

| Capability | Score (1–5) | Evidence / Notes |
|------------|-------------|-----------------|
| Program team structure defined and staffed | | |
| COBOL/mainframe knowledge transfer plan active | | |
| Cloud/modern skills training program underway | | |
| Vendor/SI partner selected and contracted | | |
| Change management plan approved | | |
| Executive sponsorship confirmed | | |
| **DIMENSION AVERAGE** | | |

#### Dimension 5: Operational Readiness

| Capability | Score (1–5) | Evidence / Notes |
|------------|-------------|-----------------|
| DevSecOps pipeline established for new workloads | | |
| Dual observability (mainframe + target) in place | | |
| Automated testing framework (regression + functional) ready | | |
| Runbooks for coexistence operations documented | | |
| Rollback procedures defined and tested | | |
| SLA monitoring for both environments active | | |
| **DIMENSION AVERAGE** | | |

### 3.4 Overall Maturity Radar `[EDITABLE]`

```
                    Discovery & Inventory
                           5
                           |
    Operational            4
    Readiness   ──────────3──────────  Architecture
                           2           Readiness
                           1
                           |
    Org          ──────────┼──────────  Data
    Readiness              |            Readiness

[ Plot your scores above. Minimum Level 3 required across all dimensions before Phase 2 can begin. ]
```

### 3.5 Maturity Thresholds by Tollgate

| Tollgate | Minimum Required Score | Dimension Focus |
|----------|----------------------|----------------|
| TG0 — Program Launch | All dimensions ≥ 2 | All |
| TG1 — Architecture Approved | Arch Readiness ≥ 4, Discovery ≥ 3 | 1 + 2 |
| TG2 — Wave 1 Migration Start | Data Readiness ≥ 3, Ops ≥ 3 | 3 + 5 |
| TG3 — Wave 2 Migration Start | All dimensions ≥ 3 | All |
| TG4 — Wave 3 (Core) Migration Start | All dimensions ≥ 4 | All |
| TG5 — Decommission Approval | All dimensions ≥ 4, zero critical defects open | All |

---

## 4. Strategic Framework & Modernization Patterns

### 4.1 Governing Principle: Intelligent Hybrid Modernization

> *"The mainframe modernization narrative has shifted from migration to optimization — with a focus on the best platform for specific workloads."* — Forrester, 2025

This blueprint rejects the Big Bang approach. Instead, it applies **workload-specific pattern selection** governed by the Strangler Fig architectural principle. Every workload is assessed individually and assigned the optimal modernization pattern based on business criticality, technical complexity and strategic intent.

### 4.2 Workload Disposition: Gartner TIME Framework

*Source: Gartner TIME Framework — Tolerate, Invest, Migrate, Eliminate (Quinnox, 2025)*

| TIME Category | Description | Modernization Pattern | Typical % of Portfolio |
|--------------|-------------|----------------------|----------------------|
| **Tolerate** | Run as-is, low change rate, acceptable cost | Replatform (lift & shift) | 25–35% |
| **Invest** | Strategic value, needs enhancement | Refactor / Modernize-in-place | 20–30% |
| **Migrate** | Move to better platform, preserve logic | Replatform to cloud / Replace | 30–40% |
| **Eliminate** | No business value, retire | Decommission | 5–15% |

### 4.3 Four Modernization Patterns

*Source: AWS Mainframe Modernization documentation; Capgemini Mainframe Modernization Patterns for Financial Services, 2025*

#### Pattern 1 — Replatform (Rehost)
**What:** Move COBOL/CICS applications to a cloud-based mainframe emulation environment with minimal code changes.  
**Best for:** Stable, non-differentiating workloads — regulatory reporting, ledger processing, standard product administration.  
**Tools:** AWS Mainframe Modernization (BluAge / Micro Focus), IBM Cloud for VMware, Azure Mainframe Migration.  
**Risk:** Low. **Effort:** Low–Medium. **Timeline:** 3–9 months per domain.  
**Data approach:** Lift VSAM → cloud file storage or managed relational DB; minimal transformation required.

#### Pattern 2 — Refactor
**What:** Restructure existing code to run natively on modern infrastructure without changing business logic. COBOL → Java or cloud-native equivalent.  
**Best for:** Core processing engines that are well-understood, stable business logic, but need cloud portability and DevOps integration.  
**Tools:** IBM watsonx Code Assistant for Z, AWS Blu Age automated refactoring, Micro Focus Enterprise Analyzer.  
**Risk:** Medium. **Effort:** Medium–High. **Timeline:** 6–18 months per domain.  
**Data approach:** DB2 → managed cloud database (PostgreSQL, Amazon Aurora); schema migration with transformation.

#### Pattern 3 — Replace
**What:** Retire legacy mainframe application and replace with a commercial package or modern custom build.  
**Best for:** Commodity functions (GL, HR, standard insurance administration, payments) where market packages are mature.  
**Tools (Banking):** Temenos Transact, Mambu, Thought Machine Vault, FIS Modern Banking Platform.  
**Tools (Insurance):** Guidewire, Duck Creek Technologies, Majesco.  
**Risk:** Medium–High. **Effort:** High. **Timeline:** 12–36 months per domain.  
**Data approach:** Full data migration — bulk historical + CDC during parallel run.

#### Pattern 4 — Reimagine
**What:** Complete rearchitecture as cloud-native microservices with event-driven real-time processing. Eliminates batch processing entirely.  
**Best for:** Customer-facing capabilities, AI-driven processes, competitive differentiators — fraud detection, real-time pricing, customer 360.  
**Tools:** Kubernetes, Apache Kafka/Confluent, Flink, cloud-native databases, API management.  
**Risk:** High. **Effort:** Very High. **Timeline:** 18–48 months per domain.  
**Data approach:** Event streaming via CDC; historical data to data lake; new microservice databases designed clean.

### 4.4 The Strangler Fig Execution Model

*Source: Martin Fowler — StranglerFigApplication (martinfowler.com); AWS Integration Architectures for Mainframe Coexistence, 2024*

Every workload — regardless of pattern — follows three Strangler Fig phases:

```
PHASE A — TRANSFORM          PHASE B — COEXIST              PHASE C — ELIMINATE
─────────────────────        ───────────────────────        ────────────────────
Build modern equivalent  →   Route traffic via facade   →   Decommission legacy
in parallel                  Old + new run together          module
Test against production       CDC keeps data in sync         MIPS released
data shadow                   Rollback available             License savings realized
```

**Critical Coexistence Architecture Components:**
- **API Facade/Gateway:** Routes traffic between legacy and new — Kong, AWS API Gateway, Azure API Management
- **Event Bus / CDC Layer:** Kafka or AWS Kinesis for real-time data synchronization between mainframe and target
- **Dual Observability:** Unified monitoring across both environments — Dynatrace, Datadog, IBM Instana
- **Reconciliation Engine:** Automated data consistency checking between mainframe and target during coexistence

### 4.5 Batch Job Disposition Framework

*Source: Research synthesis from AWS, Kyndryl and Capgemini modernization frameworks, 2024–2025*

The average large banking mainframe environment contains **7,800 JCL scripts orchestrating 65% of all data-intensive operations** *(World Journal of Advanced Engineering Technology and Sciences, 2025)*. Batch jobs require a dedicated disposition strategy before any migration begins.

| Batch Category | Description | Target Architecture | Tooling |
|---------------|-------------|--------------------|---------| 
| **Real-time Convertible** | Batch exists only due to legacy constraints on real-time processing | Event-driven microservices + Kafka streaming | Apache Kafka, AWS Kinesis, Confluent |
| **Scheduled Analytics** | Genuine end-of-period aggregation — business requirement | Cloud-native scheduler; retain timing, modernize platform | Apache Airflow, AWS Batch, Azure Data Factory |
| **Regulatory Mandatory** | Required by regulation — fixed reporting cycles | Replatform to modern scheduler, preserve run logic | Control-M on cloud, IBM Workload Automation |
| **Interdependent Chains** | JCL Job A feeds Job B feeds Job C — tightly coupled | Decompose via event choreography; introduce async messaging | Apache Kafka, MQ Series on cloud |

---

## 5. Program Architecture & Phases

### 5.1 Program Overview

The program is structured into **6 phases** across an estimated **48–60 month** full transformation timeline for a large BFSI enterprise. Phases are sequential at the program level but run in parallel streams at the workload level.

```
PHASE 0          PHASE 1          PHASE 2          PHASE 3          PHASE 4          PHASE 5
Discovery &      Foundation &     Wave 1           Wave 2           Wave 3           Optimise &
Assessment       Architecture     (Quick Wins)     (Core Systems)   (Final Domains)  Decommission
─────────        ────────────     ────────────     ────────────     ────────────     ────────────
Months 1–4       Months 3–8       Months 6–18      Months 15–36     Months 30–48     Months 42–60
TG0 → TG1        TG1 → TG2        TG2 → TG3        TG3 → TG4        TG4 → TG5        Post-TG5
```

---

### 5.2 Phase 0 — Discovery & Assessment *(Months 1–4)*

**Objective:** Complete inventory, dependency map, maturity assessment and business case. Establish program governance.

**Key Activities:**

| Activity | Owner | Output Artifact | Duration |
|----------|-------|----------------|----------|
| Mainframe estate inventory (automated scan) | EA Lead + Vendor | Mainframe Inventory Register | Weeks 1–4 |
| COBOL program dependency analysis | EA Lead | Application Dependency Map | Weeks 2–5 |
| JCL batch job catalog and chain analysis | Mainframe Architect | Batch Job Register | Weeks 2–6 |
| Data landscape assessment (VSAM, DB2, IMS) | Data Architect | Data Landscape Report | Weeks 3–6 |
| Integration point mapping | Integration Architect | Integration Dependency Map | Weeks 3–7 |
| Maturity Model assessment (M4) | EA Lead + PMO | M4 Scorecard | Weeks 4–8 |
| Workload classification (TIME Framework) | EA Team | Workload Classification Matrix | Weeks 6–10 |
| Batch job disposition analysis | EA + Mainframe Arch | Batch Disposition Register | Weeks 6–10 |
| Business case and CAPEX model | PMO + Finance | Business Case Document | Weeks 8–14 |
| Vendor / SI partner selection | Procurement + EA | Vendor Assessment Report | Weeks 6–14 |
| Program setup and governance | Program Director | Program Charter | Weeks 1–4 |

**Tollgate TG0 — Program Launch Approval:**  
- Business case approved by board
- Program sponsor confirmed
- Budget allocated
- M4 Dimension scores ≥ 2 across all dimensions
- Key risks acknowledged

---

### 5.3 Phase 1 — Foundation & Architecture *(Months 3–8)*

**Objective:** Design and build the technical foundation — target architecture, coexistence layer, cloud landing zone, CDC infrastructure and API gateway. Knowledge transfer begins.

**Key Activities:**

| Activity | Owner | Output Artifact | Duration |
|----------|-------|----------------|----------|
| Target architecture design | EA Lead | Target Architecture Document | Weeks 1–6 |
| Coexistence architecture design | Integration Architect | Coexistence Architecture | Weeks 3–8 |
| Cloud landing zone provisioning | Cloud Architect | Cloud Landing Zone | Weeks 2–8 |
| API gateway deployment | Integration Architect | API Gateway (live) | Weeks 4–10 |
| CDC infrastructure setup (Kafka/Kinesis) | Data Architect | Event Bus (live) | Weeks 4–10 |
| Dual observability platform setup | Ops Architect | Observability Dashboard | Weeks 6–12 |
| COBOL knowledge documentation (AI-assisted) | Mainframe Team | Code Documentation | Weeks 1–16 |
| DevSecOps pipeline for new workloads | DevOps Lead | CI/CD Pipeline | Weeks 4–12 |
| Reconciliation framework design | Data Architect | Reconciliation Spec | Weeks 6–12 |
| Modern development team training | HR + Training | Training completion records | Weeks 1–16 |

**Tollgate TG1 — Architecture Approval:**  
- Target architecture formally approved by EA Board
- Coexistence architecture signed off
- Cloud landing zone operational
- CDC infrastructure tested
- M4 Architecture Readiness ≥ 4; Discovery ≥ 3

---

### 5.4 Phase 2 — Wave 1: Quick Wins *(Months 6–18)*

**Objective:** Migrate lowest-complexity, highest-value workloads first. Prove the model. Achieve first MIPS reductions. Convert eligible batch jobs to real-time.

**Wave 1 Selection Criteria:**
- TIME disposition: Replatform or Retire
- Business criticality: Low–Medium
- Dependency count: Minimal (< 5 integration points)
- Batch convertibility: Real-time convertible candidates prioritized

**Typical Wave 1 Workloads (Banking):**
- Regulatory reporting batch jobs → cloud scheduler
- Read-heavy inquiry transactions → API layer + cloud database (offload 70–80% of read MIPS)
- Customer self-service functions → reimagined as microservices
- Archive data migration → cloud data lake

**Typical Wave 1 Workloads (Insurance):**
- Policy inquiry and status checks → API-wrapped microservices
- Standard reporting batch → cloud-native scheduler (Control-M)
- Claims status inquiry → event-driven query service

**Expected Wave 1 Outcomes:**
- 20–30% MIPS reduction
- Batch window reduction by 2–3 hours
- First real-time capability live
- Model proven — organizational confidence built

**Tollgate TG2 — Wave 1 Complete / Wave 2 Approval:**  
- Wave 1 workloads all in production on target platform
- Zero critical incidents in 30-day hypercare window
- MIPS reduction target achieved
- M4 Data Readiness ≥ 3; Operational Readiness ≥ 3
- Business case revalidated

---

### 5.5 Phase 3 — Wave 2: Core Systems *(Months 15–36)*

**Objective:** Migrate or transform the highest-value core business domains — core banking system, policy administration (insurance), payments, risk and compliance engines.

> ⚠️ **Critical Phase Warning:** This is the highest-risk phase of the program. Core banking and policy administration systems carry the highest business continuity risk. Extended parallel running (minimum 90 days per domain), comprehensive regression testing and board-level risk sign-off is mandatory before each domain cutover.

**Wave 2 Typical Workloads:**

| Domain | Pattern | Migration Method | Parallel Run Duration |
|--------|---------|------------------|-----------------------|
| Core Banking / Core Policy | Replace (Temenos/Guidewire) or Refactor | Strangler Fig + CDC | 90–180 days |
| Payments Processing | Reimagine (real-time event-driven) | Parallel run + gradual traffic shift | 60–90 days |
| Credit / Underwriting Engine | Refactor → cloud-native | CDC + shadow mode | 60–90 days |
| Customer Master Data | Migrate + Cleanse | Bulk + CDC | 30–60 days |
| Risk & Compliance Reporting | Replatform + Enhance | Direct migration + reconciliation | 30–60 days |
| General Ledger | Replace or Replatform | Parallel ledger run | 90–180 days |

**Expected Wave 2 Outcomes:**
- 50–60% total MIPS reduction achieved
- Core batch window eliminated for reimagined domains
- Real-time payments, pricing and fraud detection live
- AI/ML platform connectivity established

**Tollgate TG3 — Wave 2 Complete / Wave 3 Approval:**  
- All Wave 2 domains in production — zero P1 incidents in 60-day hypercare
- Data reconciliation accuracy ≥ 99.99% confirmed
- Regulatory compliance validated by internal audit
- M4 all dimensions ≥ 3
- CAPEX spend vs budget reviewed

---

### 5.6 Phase 4 — Wave 3: Final Domains *(Months 30–48)*

**Objective:** Migrate remaining complex, tightly coupled mainframe applications. Complete the batch-to-event-streaming conversion. Prepare for decommissioning.

**Wave 3 Workloads:** Remaining COBOL applications with high interdependency scores, specialist processing (actuarial engines, complex product calculators, treasury systems), final archive migrations.

**Tollgate TG4 — Wave 3 Complete / Decommission Approval:**  
- All workloads migrated and in production
- Mainframe MIPS at decommission threshold (< 10% of original)
- Complete data reconciliation signed off
- Regulatory sign-off on decommissioning plan
- M4 all dimensions ≥ 4

---

### 5.7 Phase 5 — Optimise & Decommission *(Months 42–60)*

**Objective:** Decommission mainframe hardware and licenses. Optimise new platform. Realise full cost savings. Enable AI and advanced analytics on clean modern platform.

**Key Activities:**
- Mainframe contract/license termination planning (12-month notice period typical)
- Hardware decommissioning (IBM z-series)
- Remaining staff transition or retirement management
- Cost savings realisation and reporting
- AI platform enablement on clean data estate
- Post-program architecture review and optimization

**Tollgate TG5 — Program Closure:**  
- Mainframe decommissioned (or reduced to agreed residual)
- Final audit of cost savings vs business case
- Lessons learned documented
- Target architecture baseline updated

---

## 6. Tollgate Governance Model

### 6.1 Tollgate Summary

| Tollgate | Phase Gate | Key Decision | Approver |
|----------|-----------|--------------|---------|
| **TG0** | Program Launch | Approve program, budget, sponsor | Board / CTO / CIO |
| **TG1** | Architecture Approved | Approve target architecture and coexistence design | EA Board + CTO |
| **TG2** | Wave 1 → Wave 2 | Approve Wave 1 close-out; authorize Wave 2 | Program Sponsor + Risk |
| **TG3** | Wave 2 → Wave 3 | Approve core system migrations; authorize Wave 3 | Board + CTO + Regulator* |
| **TG4** | Wave 3 → Decommission | Authorize decommissioning plan | Board + Legal + Regulator* |
| **TG5** | Program Closure | Accept final state; close program | Board + Audit |

*Regulatory notification/approval may be required for core banking system replacement depending on jurisdiction.*

### 6.2 Tollgate Entry/Exit Criteria Template `[EDITABLE]`

For each tollgate, complete the following before the review meeting:

```
TOLLGATE ID:        [TG#]
REVIEW DATE:        [DATE]
CHAIR:              [NAME]

ENTRY CRITERIA (all must be met to hold review):
[ ] All Phase artifacts complete and reviewed
[ ] M4 maturity scores at required threshold
[ ] Financial review complete (actual vs plan)
[ ] Risk register reviewed and mitigations active
[ ] Test completion evidence reviewed

DECISION OPTIONS:
[ ] PROCEED     — all criteria met, proceed to next phase
[ ] PROCEED WITH CONDITIONS — proceed but with named conditions tracked
[ ] HOLD        — specific gaps must be resolved before re-review
[ ] STOP        — program suspended pending strategic review

CONDITIONS / ISSUES:
[Document any conditions or issues raised]

SIGNATURES:
Program Sponsor:    _________________ Date: _______
EA Lead:            _________________ Date: _______
Risk Officer:       _________________ Date: _______
Finance:            _________________ Date: _______
```

---

## 7. Gantt Plan — Master Program Schedule

> **[EDITABLE]** — Anchor Week 1 to your actual program start date. All timelines are expressed in relative months (M1–M60). Adjust wave durations based on your Workload Classification Matrix output.

### 7.1 Master Gantt — Overview Level

```
ACTIVITY                              M1  M2  M3  M4  M5  M6  M7  M8  M9 M10 M11 M12 M18 M24 M30 M36 M42 M48 M54 M60
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

PHASE 0: DISCOVERY & ASSESSMENT
  Estate Inventory & Scan              ████████
  Dependency & Batch Analysis                 ████████████
  Maturity Assessment (M4)                    ████████
  Workload Classification                             ████████
  Business Case & CAPEX Model                             ████████████
  Vendor / SI Selection                           ████████████████
  Program Charter & Governance         ████

  ◆ TG0 — Program Launch                   |

PHASE 1: FOUNDATION & ARCHITECTURE
  Target Architecture Design                          ████████████
  Coexistence Architecture                                ████████████
  Cloud Landing Zone Build                                    ████████████
  API Gateway Deployment                                          ████████
  CDC / Event Bus Setup                                           ████████
  Dual Observability Platform                                         ████████
  COBOL Knowledge Capture (AI)          ████████████████████████████████████████████████
  DevSecOps Pipeline Build                                    ████████████
  Staff Training Program                ████████████████████████████████

  ◆ TG1 — Architecture Approved                                   |

PHASE 2: WAVE 1 — QUICK WINS
  Read Offload (API + Cloud DB)                                       ████████████████
  Regulatory Reporting Migration                                       ████████████████
  Batch → Scheduler Replatform                                        ████████████████████
  Real-time Conversion (Priority Batch)                                   ████████████████████████
  Wave 1 Parallel Run & Testing                                               ████████████████
  Wave 1 Hypercare (30 days)                                                          ████

  ◆ TG2 — Wave 1 Complete                                                              |

PHASE 3: WAVE 2 — CORE SYSTEMS
  Core Banking/Policy: Discovery                                                   ████████████
  Core Banking/Policy: Build                                                              ████████████████████████████
  Core Banking/Policy: Parallel Run                                                                       ████████████████████████
  Payments: Reimagine & Build                                                          ████████████████████████████
  Credit/Underwriting: Refactor                                                              ████████████████████████
  Customer Master Data Migration                                                          ████████████████████
  GL Migration                                                                                ████████████████████████████
  Wave 2 Hypercare (60 days)                                                                                  ████████

  ◆ TG3 — Wave 2 Complete                                                                                          |

PHASE 4: WAVE 3 — FINAL DOMAINS
  Complex COBOL Applications                                                                               ████████████████████████
  Actuarial / Pricing Engines                                                                                  ████████████████████
  Final Archive Migration                                                                                          ████████████████
  Wave 3 Hypercare (60 days)                                                                                              ████████

  ◆ TG4 — Decommission Approval                                                                                               |

PHASE 5: OPTIMISE & DECOMMISSION
  MIPS Rundown & License Termination                                                                                   ████████████████
  Hardware Decommission                                                                                                        ████████
  AI Platform Enablement                                                                                               ████████████████████
  Cost Savings Realisation Tracking     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Post-Program Review                                                                                                              ████

  ◆ TG5 — Program Closure                                                                                                             |

ONGOING WORKSTREAMS
  Program Management (PMO)             ████████████████████████████████████████████████████████████████████████████████████
  Risk & Issue Management              ████████████████████████████████████████████████████████████████████████████████████
  Regulatory Compliance Tracking       ████████████████████████████████████████████████████████████████████████████████████
  Business Change Management           ████████████████████████████████████████████████████████████████████████████████████
  Security & Audit                     ████████████████████████████████████████████████████████████████████████████████████
```

### 7.2 Wave Detail Gantt — Wave 1 `[EDITABLE]`

```
WAVE 1 ACTIVITIES                     W1  W2  W3  W4  W5  W6  W7  W8  W9 W10 W11 W12 W16 W20 W24 W28 W32 W36 W40 W44 W48 W52
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Read Offload Stream
  API design & review                  ████████
  API gateway config                       ████████
  Cloud DB provisioning                    ████████
  CDC connection (mainframe → cloud)           ████████████
  Shadow mode testing                              ████████████████
  Traffic shift (10% → 100%)                               ████████████████████
  Parallel run validation                                          ████████████████
  Cutover & hypercare                                                      ████████

Batch Replatform Stream
  Batch inventory & scoring            ████████████████
  Control-M / Airflow setup                    ████████████
  Job-by-job migration (groups)                        ████████████████████████████████
  Regression testing                                                   ████████████████
  Production cutover                                                               ████████

Real-time Conversion Stream
  Identify RT-convertible jobs         ████████████████
  Kafka/Kinesis setup                      ████████████
  Event schema design                              ████████████
  Microservice build                                       ████████████████████████
  Shadow mode (parallel batch + RT)                                ████████████████████
  Batch retirement (per job)                                                ████████████████

Wave 1 Integration Testing                                                    ████████████████
Wave 1 UAT                                                                            ████████████
Wave 1 Hypercare (30 days)                                                                    ████████████
```

### 7.3 Gantt Update Instructions `[EDITABLE]`

When updating the Gantt:
1. Replace relative month/week references with actual calendar dates in your project management tool
2. The Gantt above is designed for import into **Microsoft Project, Jira/Confluence, or Monday.com**
3. Each `████` block = approximately 2–4 weeks depending on timeline
4. `◆` markers = Tollgate review dates — schedule these in calendars 4 weeks in advance
5. Adjust wave durations based on actual Workload Classification Matrix output
6. Wave 2 and Wave 3 timelines are highly variable — re-baseline after each tollgate

---

## 8. Migration Plan

### 8.1 Migration Principles

1. **Never Big Bang** — every migration uses Strangler Fig parallel run approach
2. **Data First** — no application cutover without data reconciliation sign-off
3. **Rollback Always Available** — mainframe remains live until 30-day hypercare complete
4. **Business Continuity SLA Non-Negotiable** — 99.99% uptime maintained throughout
5. **Regulatory Continuity** — no migration proceeds without compliance sign-off from Legal
6. **AI-Assisted** — AI tools used throughout for code analysis, documentation, test generation and anomaly detection

### 8.2 Migration Execution Model — Per Workload

Every individual workload migration follows this 7-step execution model:

```
STEP 1          STEP 2          STEP 3          STEP 4
Workload        Migration       Environment     Shadow
Profile         Design          Build           Mode
────────        ─────────       ───────────     ──────────
Inventory       Select pattern  Provision       Run new
Classify        Design data     target env      system in
Dependencies    migration       Build/config    parallel —
Complexity      CDC config      CDC live        no cutover
Score           Test plan       Test env live   yet

STEP 5          STEP 6          STEP 7
Parallel        Gradual         Cutover &
Run &           Traffic         Decommission
Validate        Shift           ─────────────
────────        ─────────       Confirm 30-day
Both systems    10% → 25%       hypercare clean
live — main-    → 50% →         Rollback removed
frame is        75% → 100%      MIPS released
source of       Validate        License savings
record          each step       realized
```

### 8.3 Data Migration Strategy

*Source: Mainframe Zero Strategy — IJCESEN, 2025; AWS Integration Architectures for Mainframe Coexistence, 2024*

Data migration is executed as a **three-layer concurrent strategy** running throughout the program:

#### Layer 1: Change Data Capture (CDC) — Live Synchronization

**Purpose:** Keep mainframe and target database in continuous sync during parallel running period.  
**Technology:** IBM InfoSphere Data Replication, Precisely Connect CDC, Debezium, AWS DMS  
**Pattern:** Capture every INSERT/UPDATE/DELETE from mainframe DB2/VSAM → publish to Kafka topic → consume into target database  
**Latency target:** < 100ms for transactional data; < 5 minutes for batch updates  

```
Mainframe DB2 / VSAM
        │
        ▼
CDC Capture Agent (log-based)
        │
        ▼
Kafka Topic (per domain)
        │
        ├──► Target Cloud DB (operational)
        │
        └──► Data Lake (analytical)
```

#### Layer 2: Bulk Historical Migration — Wave-by-Wave

**Purpose:** Move historical and archive data to cloud storage during migration waves.  
**Technology:** AWS SCT + DMS, Google Cloud Database Migration Service, Azure Database Migration Service, Attunity Replicate  
**Approach:** Domain-by-domain bulk extraction → transformation → load; run in parallel to live CDC  
**Reconciliation:** Automated row-count, checksum and business-rule validation at each step  

**Bulk Migration Wave Plan `[EDITABLE]`:**

| Wave | Data Domain | Volume (approx) | Method | Duration |
|------|-------------|----------------|--------|----------|
| Wave 1 | Customer reference data | [ENTER GB/TB] | Bulk extract + transform | 2–4 weeks |
| Wave 1 | Transaction history (rolling 2 years) | [ENTER] | Parallel bulk + CDC | 4–8 weeks |
| Wave 2 | Full transaction history (7+ years) | [ENTER] | Bulk in batches | 8–16 weeks |
| Wave 2 | Core banking balances and positions | [ENTER] | CDC + bulk reconciliation | 4–8 weeks |
| Wave 3 | Archive data (10+ years) | [ENTER] | Bulk to cold storage | 4–12 weeks |
| Wave 3 | Actuarial / risk model data | [ENTER] | Structured bulk | 4–8 weeks |

#### Layer 3: Data Quality & Reconciliation

**Purpose:** Guarantee zero data loss and data integrity throughout migration.  
**Technology:** Great Expectations, AWS Glue Data Quality, Informatica Data Quality  
**Reconciliation checkpoints:**

| Check Type | Frequency | Tolerance | Action if Failed |
|-----------|-----------|-----------|-----------------|
| Row count reconciliation | Every CDC batch | Zero discrepancy | HALT migration, investigate |
| Financial balance reconciliation | Daily during parallel run | Zero discrepancy | HALT, escalate to Program Director |
| Business rule validation | Per wave | < 0.001% exceptions | Investigate and remediate |
| Referential integrity check | Per wave | Zero orphaned records | Data cleanse before proceeding |

### 8.4 Batch Migration Execution Plan `[EDITABLE]`

#### Step 1: Batch Inventory & Scoring (Phase 0)

Use AI-assisted tooling to scan and score all JCL batch jobs:

```
For each JCL script:
  - Extract: program calls, datasets accessed, schedule, dependencies
  - AI Score: complexity (1–5), business criticality (1–5), RT-convertibility (Y/N)
  - Classify: Real-time Convertible / Scheduled Analytics / Regulatory / Interdependent
  - Assign: Target disposition and migration wave
```

#### Step 2: Batch Migration by Category

**Real-time Convertible Batch (Priority):**
1. Design event schema for the business event the batch was simulating
2. Build Kafka producer at source transaction point
3. Build cloud-native consumer microservice
4. Run batch AND event stream in parallel — validate outputs match
5. Retire batch job when confidence threshold reached (typically 30 days)

**Scheduled Analytics Batch:**
1. Extract job logic from JCL + COBOL
2. Rewrite as Python/Spark job in cloud
3. Configure Apache Airflow DAG with same schedule
4. Parallel run — compare output files
5. Cutover when reconciliation complete

**Regulatory Mandatory Batch:**
1. Replatform to IBM Workload Automation or Control-M on cloud
2. Recompile COBOL if needed (Micro Focus / BluAge)
3. Parallel run with output comparison against mainframe
4. Regulatory sign-off on output parity before cutover

---

## 9. Test Plan

### 9.1 Testing Strategy Overview

Testing is structured in **parallel streams** running concurrently with migration activities, not sequentially. This is critical for maintaining program velocity.

```
Migration Stream          Test Stream (Parallel)
────────────────          ──────────────────────────────────────────────
Build / Configure    ──►  Unit Testing + Component Testing
Shadow Mode Active   ──►  Integration Testing + Data Reconciliation Testing
Parallel Run         ──►  Functional Testing + Regression Testing + Performance Testing
Gradual Traffic Shift──►  Non-Functional Testing + Security Testing + SLA Validation
Cutover              ──►  Production Validation + Hypercare Monitoring
```

### 9.2 Test Types & Scope

| Test Type | Purpose | Owner | When | Pass Criteria |
|-----------|---------|-------|------|---------------|
| **Unit Testing** | Validate individual migrated functions/services | Dev Team | Continuous | 100% automated pass |
| **Component Testing** | Validate each migrated component end-to-end | Dev Team | Per component | 100% business scenarios pass |
| **Integration Testing** | Validate API, CDC and event bus connections | Integration Team | Per wave | Zero data loss; latency < SLA |
| **Data Reconciliation Testing** | Validate data parity mainframe ↔ target | Data Team | Daily during parallel run | Zero financial discrepancy |
| **Regression Testing** | Ensure nothing broken by migration | QA Team | Per wave | 100% of regression suite passes |
| **Functional Testing (UAT)** | Business validation of migrated functions | Business Team | Per wave | Business sign-off |
| **Performance Testing** | Validate throughput and latency at load | Performance Eng | Pre-cutover | Exceeds mainframe baseline TPS |
| **Batch Output Comparison** | Validate migrated batch produces identical outputs | QA + Data Team | Per batch job | 100% output parity |
| **Security Penetration Testing** | Validate security posture of new platform | Security Team | Pre-production | No critical/high findings open |
| **Disaster Recovery Testing** | Validate RTO/RPO on new platform | Ops Team | Per wave | RTO/RPO ≤ mainframe baseline |
| **Regulatory Acceptance Testing** | Confirm regulatory reporting output correctness | Compliance + Audit | Pre-cutover | Internal Audit sign-off |
| **Hypercare Monitoring** | Post-cutover production validation | Ops + Dev | 30/60 days post-cutover | Zero P1 incidents |

### 9.3 AI-Assisted Testing Capabilities

AI tools are embedded throughout the test lifecycle:

| AI Tool | Function | Platform |
|---------|----------|---------|
| **Automated test generation** | Generate regression test cases from COBOL code analysis | IBM watsonx Code Assistant, Copilot |
| **Anomaly detection** | Detect data reconciliation anomalies in real time | Custom ML model on Kafka stream |
| **Log analysis** | Identify error patterns across dual environment logs | Dynatrace AI, Datadog AI |
| **Batch output comparison** | Automated line-by-line output comparison at scale | Python + pandas + Great Expectations |
| **Performance analysis** | Predict performance bottlenecks before load testing | AI-driven load test tools (k6, Gatling) |

### 9.4 Defect Classification & Escalation

| Severity | Definition | Resolution SLA | Escalation |
|----------|-----------|----------------|-----------|
| **P1 — Critical** | Data loss, financial discrepancy, regulatory breach | 4 hours | Program Director + CTO |
| **P2 — High** | Functional failure, SLA breach, reconciliation failure | 24 hours | Stream Lead + EA Lead |
| **P3 — Medium** | Non-critical function failure, performance degradation | 5 business days | Stream Lead |
| **P4 — Low** | Minor defect, UX issue, documentation gap | Next sprint | Dev Team |

> **Migration Blocking Rule:** Any open P1 or P2 defect **blocks** traffic shift increase and cutover. No exceptions without Program Director written override.

### 9.5 Test Completion Criteria per Tollgate

| Tollgate | Test Completion Requirement |
|----------|---------------------------|
| TG2 (Wave 1 complete) | All Wave 1 UAT signed off; zero P1/P2 open; data reconciliation 100%; 30-day hypercare clean |
| TG3 (Wave 2 complete) | All Wave 2 UAT signed off; financial reconciliation verified by Finance; regulatory testing signed by Compliance; 60-day hypercare clean |
| TG4 (Wave 3 complete) | All workloads UAT complete; full regression clean; DR test passed; zero open P1/P2 |
| TG5 (Decommission) | Final audit of all test evidence; external audit sign-off if required |

---

## 10. Tools & Technology Stack

### 10.1 Assessment & Discovery Tools

| Tool | Purpose | Vendor | Notes |
|------|---------|--------|-------|
| **IBM Application Discovery** | COBOL application and dependency scanning | IBM | Best for IBM z environments |
| **Micro Focus Enterprise Analyzer** | COBOL code analysis, call trees, dead code detection | Micro Focus (Broadcom) | Cross-platform |
| **CAST Highlight** | Application portfolio assessment, complexity scoring | CAST Software | Cloud-based; fast scanning |
| **Google Cloud Mainframe Assessment Tool** | Automated mainframe workload assessment | Google Cloud | Free; integrates with GCP migration |
| **AWS Migration Evaluator** | TCO and migration readiness assessment | AWS | Free; generates business case data |
| **BMC Compuware Topaz** | JCL batch analysis and code quality | BMC | Deep JCL dependency analysis |

*Sources: AWS, IBM, Micro Focus documentation; Mainframe Modernization Complete Guide 2025*

### 10.2 Migration & Transformation Tools

| Tool | Purpose | Vendor | Pattern Support |
|------|---------|--------|----------------|
| **AWS Blu Age** | Automated COBOL → Java/cloud transformation | AWS | Refactor, Reimagine |
| **IBM watsonx Code Assistant for Z** | AI-powered COBOL analysis and modernization | IBM | Refactor |
| **Micro Focus Enterprise Server** | COBOL replatforming to cloud emulation | Micro Focus (Broadcom) | Replatform |
| **TmaxSoft OpenFrame** | Mainframe rehosting on x86/cloud | TmaxSoft | Replatform |
| **Heirloom Computing** | COBOL to PaaS transformation | Heirloom | Refactor, Replatform |
| **CloudFrame** | Automated mainframe application migration | CloudFrame | Refactor, Replatform |

*Source: Mainframe Modernization Tools & Vendors Guide 2025 — mainframe-modernization.org; IBM, AWS product documentation*

### 10.3 Data Migration & CDC Tools

| Tool | Purpose | Vendor | Notes |
|------|---------|--------|-------|
| **IBM InfoSphere Data Replication** | CDC from DB2/IMS/VSAM | IBM | Native z/OS integration |
| **Precisely Connect CDC** | Real-time mainframe data replication | Precisely | Multi-target support |
| **AWS Database Migration Service (DMS)** | Database migration + CDC | AWS | Supports DB2, VSAM |
| **Debezium** | Open-source CDC framework | Red Hat / Community | Kafka-native |
| **Attunity Replicate (Qlik)** | Enterprise data replication | Qlik | VSAM, DB2, IMS support |
| **Google Cloud Dual Run** | Production workload replay validation | Google Cloud | Risk reduction for cutover |
| **Great Expectations** | Data quality and reconciliation | Open Source | Python-native; highly configurable |
| **Informatica IDMC** | Enterprise data quality and governance | Informatica | Enterprise-grade |

*Sources: AWS, IBM, Precisely, Google Cloud product documentation; IJCESEN Mainframe Zero Strategy paper, 2025*

### 10.4 Integration & Event Streaming

| Tool | Purpose | Vendor | Notes |
|------|---------|--------|-------|
| **Apache Kafka / Confluent** | Event streaming backbone; CDC target | Confluent / Apache | Industry standard for event-driven arch |
| **AWS Kinesis** | Managed event streaming | AWS | AWS-native alternative to Kafka |
| **IBM MQ on Cloud** | Enterprise messaging for coexistence | IBM | Proven in BFSI; familiar to mainframe teams |
| **Kong / AWS API Gateway / Azure APIM** | API facade for Strangler Fig pattern | Various | Route traffic mainframe ↔ new |
| **MuleSoft / Azure Integration Services** | Enterprise integration platform | Salesforce / Microsoft | Complex integration scenarios |

### 10.5 Target Platform & Cloud

| Platform | Use Case | Provider |
|----------|---------|---------|
| **AWS Mainframe Modernization** | Managed migration and runtime | AWS |
| **IBM Cloud / IBM LinuxONE** | Modernize-in-place; hybrid cloud | IBM |
| **Microsoft Azure** | Target cloud for refactored workloads | Microsoft |
| **Google Cloud** | Analytics, AI/ML, BigQuery for data lake | Google |
| **Kubernetes (EKS/AKS/GKE)** | Container platform for reimagined workloads | Cloud-native |

*Source: Capgemini Mainframe Modernization Patterns for Financial Services, 2025; IBM, AWS, Microsoft product documentation*

### 10.6 Core Banking & Insurance Package Replacements

| Domain | Banking Platform | Insurance Platform |
|--------|----------------|-------------------|
| Core System | Temenos Transact, Mambu, Thought Machine Vault, FIS | Guidewire PolicyCenter, Duck Creek, Majesco |
| Payments | Volante, Form3, Finastra | — |
| Risk & Compliance | Moody's Analytics, Murex | Riskonnect, Ventiv |
| General Ledger | Oracle Fusion, SAP S/4HANA | Oracle Fusion, SAP |

### 10.7 Observability & Operations

| Tool | Purpose | Notes |
|------|---------|-------|
| **Dynatrace** | Full-stack observability incl. mainframe | AI-powered anomaly detection |
| **Datadog** | Hybrid observability | Strong cloud-native coverage |
| **IBM Instana** | Mainframe + cloud observability | Native z/OS agent |
| **Splunk** | Log aggregation and analytics | Industry standard in BFSI |
| **Control-M (BMC)** | Workload automation — batch scheduler | Industry standard; cloud-capable |
| **Apache Airflow** | Open-source workflow orchestration | For reimagined batch as DAGs |

### 10.8 Program Management Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Microsoft Project / Project Online** | Gantt planning and tracking | Best for complex program schedules |
| **Jira + Confluence** | Agile delivery tracking + documentation | Best for wave delivery teams |
| **Monday.com / Smartsheet** | Executive Gantt and milestone tracking | Easy to update; good dashboards |
| **Power BI / Tableau** | Program KPI and cost dashboards | CAPEX tracking and reporting |
| **ServiceNow SPM** | Program portfolio management | Enterprise-grade; integrates ITSM |

---

## 11. AI Integration Layer

The EA Platform AI layer is integrated throughout the modernization program to reduce manual effort, improve quality and accelerate timelines at every phase.

### 11.1 AI-Assisted Capabilities by Phase

| Phase | AI Capability | Tool | Time Saved |
|-------|--------------|------|-----------|
| **Phase 0** | Automated COBOL code documentation generation | IBM watsonx Code Assistant | Weeks → hours |
| **Phase 0** | Batch job dependency analysis and classification | CAST Highlight + AI | Days → hours |
| **Phase 0** | Workload complexity scoring | AWS Migration Evaluator + ML | Manual → automated |
| **Phase 1** | Architecture pattern recommendation | EA Platform AI Assistant | Reduces EA effort by ~40% |
| **Phase 1** | COBOL-to-Java automated translation | AWS Blu Age / watsonx | 60–80% automation rate |
| **All Waves** | Test case generation from COBOL code | GitHub Copilot + watsonx | 70% test gen automation |
| **All Waves** | Data reconciliation anomaly detection | ML on Kafka streams | Real-time vs manual sampling |
| **All Waves** | Log analysis and incident prediction | Dynatrace AI / Datadog | Proactive vs reactive ops |
| **Phase 3–4** | Business rule extraction from legacy code | AI code analysis tools | Preserves institutional knowledge |
| **All Phases** | EA Platform AI Assistant — model updates | Claude API (Anthropic) | Continuous artifact maintenance |

*Source: IBM watsonx Code Assistant for Z announcement, September 2024; AWS Agentic AI for Mainframe Modernization, December 2025*

### 11.2 EA Platform Integration Points

The AI Business Readiness EA Platform supports this blueprint through:

1. **Strategic Intent → Mainframe Modernization Context:** Org description and challenges auto-populate Phase 0 assessment inputs
2. **APQC Capability Map → Workload Classification:** APQC L1–L3 processes mapped to mainframe domains and workloads
3. **Gap Analysis → Migration Waves:** Capability gaps drive wave sequencing and prioritization
4. **Regulatory Knowledge Base → Compliance Tracking:** EU AI Act, DORA, GDPR compliance requirements embedded in tollgate criteria
5. **AI Assistant → Blueprint Updates:** Regenerate affected artifacts when strategic context changes
6. **Transformation Roadmap → Gantt Integration:** Roadmap initiatives map directly to wave activities

### 11.3 AI Prompt Templates for Key Tasks `[EDITABLE]`

**Workload Classification Prompt:**
```
Given this APQC process mapping and mainframe workload inventory:
[PASTE INVENTORY]

Classify each workload using Gartner TIME framework (Tolerate/Invest/Migrate/Eliminate)
and assign modernization pattern (Replatform/Refactor/Replace/Reimagine).
Consider: business criticality, technical complexity, dependency count, batch dependency.
Output as JSON array with rationale for each classification.
```

**Batch Disposition Prompt:**
```
Analyze these JCL batch jobs:
[PASTE JCL SUMMARY]

For each job:
1. Classify as: Real-time Convertible / Scheduled Analytics / Regulatory Mandatory / Interdependent
2. Score real-time conversion complexity (1–5)
3. Identify dependencies on other jobs
4. Recommend target architecture and tooling
5. Estimate migration effort in weeks

Output as structured JSON with rationale.
```

**Migration Wave Sequencing Prompt:**
```
Given this workload classification matrix:
[PASTE MATRIX]

And these constraints:
- Business continuity SLA: 99.99%
- Budget envelope: [ENTER]
- Key regulatory deadlines: [ENTER]
- Skills constraints: [ENTER]

Generate an optimized migration wave sequence that:
1. Minimizes business risk
2. Maximizes early MIPS reduction
3. Respects all constraints
4. Groups workloads by domain affinity

Output as wave plan with rationale and Gantt structure.
```

---

## 12. Artifacts Register

All artifacts produced throughout the program. Track status in your PMO tool.

| # | Artifact | Phase | Owner | Status | Location |
|---|---------|-------|-------|--------|---------|
| A01 | Program Charter | P0 | Program Director | [ ] Draft [ ] Review [ ] Approved | |
| A02 | Mainframe Estate Inventory | P0 | EA Lead | | |
| A03 | Application Dependency Map | P0 | EA Lead | | |
| A04 | JCL Batch Job Register | P0 | Mainframe Architect | | |
| A05 | Batch Disposition Register | P0 | EA Lead | | |
| A06 | Data Landscape Report | P0 | Data Architect | | |
| A07 | Integration Dependency Map | P0 | Integration Architect | | |
| A08 | Workload Classification Matrix | P0 | EA Lead | | |
| A09 | M4 Maturity Scorecard | P0 | EA Lead | | |
| A10 | Business Case & CAPEX Model | P0 | PMO + Finance | | |
| A11 | Vendor Assessment Report | P0 | Procurement + EA | | |
| A12 | Target Architecture Document | P1 | EA Lead | | |
| A13 | Coexistence Architecture | P1 | Integration Architect | | |
| A14 | Cloud Landing Zone Design | P1 | Cloud Architect | | |
| A15 | CDC Architecture Specification | P1 | Data Architect | | |
| A16 | Reconciliation Framework Design | P1 | Data Architect | | |
| A17 | Master Test Strategy | P1 | QA Lead | | |
| A18 | COBOL Knowledge Documentation | P0–P4 | Mainframe Team + AI | | |
| A19 | Wave 1 Migration Plan | P1 | Wave PM | | |
| A20 | Wave 1 Test Plan | P1 | QA Lead | | |
| A21 | Wave 1 Cutover Runbook | P2 | Ops Lead | | |
| A22 | Wave 2 Migration Plan | P2 | Wave PM | | |
| A23 | Wave 2 Test Plan | P2 | QA Lead | | |
| A24 | Core Banking Migration Plan | P3 | EA Lead + Wave PM | | |
| A25 | Data Migration Wave Plans | P2–P4 | Data Architect | | |
| A26 | Decommissioning Plan | P4 | EA Lead | | |
| A27 | Risk Register (live) | All | PMO | | |
| A28 | CAPEX Actuals vs Budget (live) | All | Finance | | |
| A29 | Regulatory Compliance Tracker | All | Compliance | | |
| A30 | Program Closure Report | P5 | Program Director | | |

---

## 13. CAPEX Model & Business Case

### 13.1 CAPEX Cost Categories `[EDITABLE — Enter actuals or estimates]`

| Cost Category | Wave 1 | Wave 2 | Wave 3 | Total |
|--------------|--------|--------|--------|-------|
| **Discovery & Assessment Tools** | | | | |
| Inventory/scanning tooling | [€] | — | — | |
| Assessment consultancy | [€] | — | — | |
| **Architecture & Foundation** | | | | |
| Cloud landing zone build | [€] | — | — | |
| CDC / Event bus infrastructure | [€] | [€] | — | |
| API gateway setup | [€] | — | — | |
| Observability platform | [€] | [€] | [€] | |
| **Migration Tooling** | | | | |
| Refactoring/replatform tools | [€] | [€] | [€] | |
| Data migration tools (DMS, CDC) | [€] | [€] | [€] | |
| Data quality tooling | [€] | [€] | [€] | |
| **Application Development** | | | | |
| Internal development effort | [€] | [€] | [€] | |
| SI partner / vendor fees | [€] | [€] | [€] | |
| **Package Replacement (if applicable)** | | | | |
| Core banking platform license | — | [€] | — | |
| Insurance platform license | — | [€] | — | |
| Implementation services | — | [€] | [€] | |
| **Testing** | | | | |
| Test tooling and automation | [€] | [€] | [€] | |
| Testing resource (internal + external) | [€] | [€] | [€] | |
| **Training & Change Management** | | | | |
| Staff training programs | [€] | [€] | [€] | |
| Change management consultancy | [€] | [€] | [€] | |
| **Program Management** | | | | |
| PMO overhead | [€] | [€] | [€] | |
| Program contingency (15–20%) | [€] | [€] | [€] | |
| **TOTAL CAPEX** | **[€]** | **[€]** | **[€]** | **[€]** |

### 13.2 Benefits & ROI Model `[EDITABLE]`

*Benchmark data sources: Kyndryl State of Mainframe Modernization 2025; Gartner 2024; Salfati Group 2025*

| Benefit Category | Calculation Method | Year 1 | Year 2 | Year 3 | Year 5 |
|-----------------|-------------------|--------|--------|--------|--------|
| **MIPS Cost Reduction** | Current MIPS cost × % reduction achieved | | | | |
| Target: 50–70% MIPS reduction | | | | | |
| **Software License Savings** | Mainframe ISV license costs eliminated | | | | |
| **Infrastructure Savings** | Cloud vs mainframe hardware/maintenance | | | | |
| **Development Velocity** | 3–5x faster = staff cost efficiency | | | | |
| **New Revenue (Real-time products)** | Based on product pipeline enabled | | | | |
| **Fraud Reduction (AI-enabled)** | Historical fraud loss × detection improvement | | | | |
| **Regulatory Fine Avoidance** | Risk-adjusted compliance cost savings | | | | |
| **TOTAL ANNUAL BENEFITS** | | **[€]** | **[€]** | **[€]** | **[€]** |
| **Cumulative CAPEX** | | [€] | [€] | [€] | [€] |
| **Net Benefit** | | [€] | [€] | [€] | [€] |
| **ROI** | (Total Benefits − CAPEX) / CAPEX × 100 | | | | |
| **Payback Period** | Month when cumulative benefits exceed CAPEX | | | | |

> **Benchmark:** Kyndryl 2025 survey reports **288–362% ROI** across modernization paths over 3 years for enterprises that execute phased hybrid approaches.

### 13.3 CAPEX Update Cadence `[EDITABLE]`

Update this model:
- Monthly: Actual spend vs budget per category
- At each Tollgate: Full reforecast of remaining phases
- Trigger: Any scope change, delay > 4 weeks, or risk event with financial impact > 5% of budget

---

## 14. Risk Register

> **[LIVE DOCUMENT — Update at every Program Board]**

| ID | Risk Description | Probability | Impact | Score | Mitigation | Owner | Status |
|----|-----------------|-------------|--------|-------|-----------|-------|--------|
| R01 | **Big Bang cutover temptation** — pressure to cut corners on parallel run | Medium | Critical | High | Mandatory tollgate gate — no cutover without 30-day parallel run complete | EA Lead | Active |
| R02 | **Data reconciliation failure** on core banking cutover | Low | Critical | High | Automated reconciliation engine; financial sign-off mandatory | Data Architect | Active |
| R03 | **COBOL knowledge loss** — key developer retires before knowledge transfer complete | High | High | High | AI-assisted code documentation starts Day 1; knowledge transfer tracked weekly | Program Director | Active |
| R04 | **Regulatory non-compliance** during migration (DORA, GDPR) | Low | Critical | High | Compliance sign-off at every tollgate; Legal on program board | Compliance | Active |
| R05 | **Vendor/SI underperformance** — migration partner misses milestones | Medium | High | High | Fixed-price milestones; monthly SLA review; exit clause in contract | Procurement | Active |
| R06 | **Batch window extension** during parallel run impacts business operations | Medium | Medium | Medium | Batch window monitoring; contingency batch capacity on mainframe | Ops Lead | Active |
| R07 | **Skills shortage** — cloud/modern skills gap in internal team | High | Medium | Medium | Training program from M1; SI partner to supplement; target hire plan | HR | Active |
| R08 | **CDC latency breach** — data sync falls behind during high-volume periods | Medium | High | High | CDC performance testing at 2x peak load before Wave 2 | Data Architect | Active |
| R09 | **Scope creep** — business requests additional features during migration | High | Medium | Medium | Strict change control; new features queued post-wave; PMO governance | PMO | Active |
| R10 | **CAPEX overrun** — migration complexity higher than estimated | Medium | High | High | 15–20% contingency built in; re-baseline at each tollgate | Finance + PMO | Active |
| R11 | **Core banking platform implementation failure** (if Replace pattern) | Low | Critical | High | Reference customer visits; fixed-price SI; board-level oversight | Program Director | Active |
| R12 | **Security vulnerability** in coexistence period | Medium | Critical | High | Security penetration testing before each wave cutover; CISO on board | CISO | Active |
| [ADD] | | | | | | | |

---

## 15. Sources & External References

All external knowledge sources referenced in this Blueprint:

### Architecture & Methodology

| Source | Reference | URL |
|--------|-----------|-----|
| Martin Fowler | Strangler Fig Application Pattern (original) | https://martinfowler.com/bliki/StranglerFigApplication.html |
| AWS | Strangler Fig Pattern — Mainframe Modernization | https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html |
| AWS | Integration Architectures between Mainframe and AWS for Coexistence (2024) | https://aws.amazon.com/blogs/migration-and-modernization/integration-architectures-between-mainframe-and-aws-for-coexistence/ |
| AWS | Reimagine Mainframe Applications with Agentic AI and AWS Transform (Dec 2025) | https://aws.amazon.com/blogs/migration-and-modernization/reimagine-your-mainframe-applications-with-agentic-ai-and-aws-transform/ |
| Capgemini | Mainframe Modernization Patterns for Financial Services (2025) | https://www.capgemini.com/insights/research-library/mainframe-modernization-patterns-for-financial-services/ |
| Microsoft | Strangler Fig and Anti-Corruption Layer Patterns for Mainframe Modernization | https://techcommunity.microsoft.com/blog/integrationsonazureblog/patterns-for-a-gradual-modernization-of-ibm-mainframes-and-midranges-using-azure/3919207 |
| IBM Redbooks | Mainframe Application Modernization Patterns for Hybrid Cloud | https://www.redbooks.ibm.com/redbooks/pdfs/sg248532.pdf |
| Gartner | TIME Framework for Application Portfolio Management | Referenced in Quinnox, 2025 |
| IJCESEN | Mainframe Zero Strategy — Cloud-Native Data Platforms (2025) | https://ijcesen.com/index.php/ijcesen/article/view/5047 |
| Kai Waehner | Strangler Fig with Data Streaming — Allianz Insurance Case Study (2025) | https://www.kai-waehner.de/blog/2025/03/27/replacing-legacy-systems-one-step-at-a-time-with-data-streaming-the-strangler-fig-approach/ |
| IN-COM Data Systems | Strangler Fig Pattern in COBOL System Modernization (2025) | https://www.in-com.com/blog/strangler-fig-pattern-in-cobol-system-modernization-practical-implementations/ |

### Market Research & Industry Data

| Source | Reference | URL |
|--------|-----------|-----|
| Kyndryl | 2025 State of Mainframe Modernization Research Report | https://www.kyndryl.com/us/en/campaign/state-of-mainframe-modernization |
| BMC Software | Top Mainframe Priorities for BFSI Firms — 2025 Survey | https://www.bmc.com/blogs/mainframe-priorities-banking-financial-services-insurance/ |
| Forrester | The State of Mainframe, Global, 2025 | https://www.forrester.com/report/the-state-of-mainframe-global-2025/RES183032 |
| MarketsandMarkets | Mainframe Modernization Market Report 2025 | https://www.marketsandmarkets.com/Market-Reports/mainframe-modernization-market-52477.html |
| The Business Research Company | Mainframe Modernization Market 2025–2034 | https://www.openpr.com/news/4303841/2025-2034-mainframe-modernization-market-evolution-emerging |
| Quinnox | Legacy Mainframe Modernization — Complete Guide 2025 | https://www.quinnox.com/blogs/legacy-mainframe-modernization/ |
| Mainframe-modernization.org | Complete 2025 Guide — Strategies, Hybrid Approaches, Cloud Migration | https://blog.mainframe-modernization.org/2025/10/08/mainframe-modernization-the-complete-2025-guide/ |
| World Journal of Advanced Engineering Technology and Sciences | Demystifying Mainframe Modernization (2025) | https://wjaets.com/sites/default/files/fulltext_pdf/WJAETS-2025-1146.pdf |
| Emergen Research | Mainframe Modernization Services Market 2024 | https://www.emergenresearch.com/industry-report/mainframe-modernization-services-market |
| Salfati Group | Strangler Fig Pattern — CIO Guide 2025 | https://salfati.group/topics/strangler-fig-pattern |

### Tools & Technology Documentation

| Source | Reference | URL |
|--------|-----------|-----|
| IBM | watsonx Code Assistant for Z (announced Sept 2024) | https://www.ibm.com/products/watsonx-code-assistant-z |
| AWS | AWS Mainframe Modernization — BluAge | https://aws.amazon.com/mainframe-modernization/ |
| Accenture + Microsoft | Mainframe Modernization Accelerator (announced July 2024) | https://newsroom.accenture.com |
| Hexaviewtech | Mainframe Modernization Strategies for US Financial Institutions (2026) | https://www.hexaviewtech.com/blog/mainframe-modernization-strategies-for-us-financial-institutions-in-banking-finance-and-insurance |
| APQC | Process Classification Framework (PCF) — Financial Services | https://www.apqc.org/pcf |

### Regulatory Sources

| Regulation | Reference | URL |
|------------|-----------|-----|
| EU AI Act | Regulation (EU) 2024/1689 — Full text and timeline | https://artificialintelligenceact.eu |
| EU DORA | Digital Operational Resilience Act — effective Jan 2025 | https://www.eba.europa.eu/regulation-and-policy/dora |
| GDPR | General Data Protection Regulation — Art. 22 on automated decisions | https://gdpr.eu |
| PCI DSS v4.0 | Payment Card Industry Data Security Standard | https://www.pcisecuritystandards.org |
| Basel IV | Banking capital and reporting requirements | https://www.bis.org/bcbs/basel4.htm |

### Maturity Models

| Source | Reference | URL |
|--------|-----------|-----|
| CMG | A Mainframe Modernization Maturity Model | https://www.cmg.org/2020/09/a-mainframe-modernization-maturity-model/ |
| NIST | AI Risk Management Framework (relevant for AI-enabled modernization) | https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf |
| Gartner | IT Score for Infrastructure & Operations (maturity model) | Gartner subscription required |

---

*End of Blueprint — Legacy Mainframe Modernization v1.0*

---

> **Document Maintenance**  
> This Blueprint is a living document. Review and update at every Program Board meeting and at each Tollgate. Sections marked `[EDITABLE]` are designed for direct revision by the program team. AI-assisted updates can be triggered via the EA Platform AI Assistant by providing updated context, and affected sections will be regenerated automatically.
>
> **Next Review Date:** `[ENTER — recommend monthly]`  
> **Program Director:** `[ENTER]`  
> **EA Lead:** `[ENTER]`  
> **Document Owner:** `[ENTER]`
