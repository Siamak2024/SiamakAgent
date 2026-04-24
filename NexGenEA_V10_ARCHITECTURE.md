# NexGen EA V10 Architecture

**Created:** April 23, 2026  
**Version:** 10.0.0  
**Status:** Implementation in progress

---

## Overview

V10 is a major refactoring that creates a **coherent, context-aware workflow** where each step builds upon previous outputs, leveraging OpenAI Response API and GPT-5 for high-quality generation.

**Core Principle:** The Capability Map (Step 3) is the strategic anchor. All subsequent steps use it as primary input, enriched with context from Steps 1-2.

---

## Workflow Structure

### **Sequential Steps**

1. **Step 1: Strategic Intent / Business Objectives**
   - **Output:** `model.strategicIntent` OR `model.businessObjectives`
   - **Unlocks:** Executive tab

2. **Step 2: Business Model Canvas**
   - **Output:** `model.bmc`, `model.bmcCurrent`, `model.bmcAnalysis`
   - **Unlocks:** BMC tab

3. **Step 3: Capability Architecture (ANCHOR)**
   - **Output:** `model.capabilities[]`, `model.capabilityAssessment`, `model.archBenchmark`
   - **Unlocks:** Capability Map tab
   - **Context Used:** Strategic Intent (Step 1), BMC (Step 2)
   - **APQC Integration:** Auto-loads APQC PCF framework for industry-standard capabilities

4. **Step 4: Benchmark (NEW)**
   - **Output:** `model.benchmarkData`, `model.benchmarkGaps[]`, `model.benchmarkSummary`
   - **Unlocks:** Benchmark tab
   - **Context Used:** Capabilities (Step 3), Industry, APQC framework
   - **Purpose:** Compare capability maturity vs APQC industry benchmarks

5. **Step 5: Data Collection / Survey (NEW)**
   - **Output:** `model.surveys[]`, `model.surveyResults`, updated `model.capabilities[]`
   - **Unlocks:** Data/Survey tab
   - **Context Used:** Benchmark gaps (Step 4), Capabilities (Step 3)
   - **Purpose:** Generate targeted surveys, validate maturity levels

6. **Step 6: Layers & Gap Analysis (NEW)**
   - **Output:** `model.valueStreams[]`, `model.systems[]`, `model.gapAnalysis`, `model.priorityGaps[]`
   - **Unlocks:** Layers tab, Gap tab
   - **Context Used:** Validated capabilities (Step 5), Survey data, BMC, Strategic Intent
   - **Purpose:** Generate architecture layers, identify gaps

7. **Step 7: Target Architecture & Roadmap**
   - **Output:** `model.targetArchData`, `model.roadmap.waves[]`, `model.initiatives[]`
   - **Unlocks:** Target Architecture tab, Roadmap tab
   - **Context Used:** Gap analysis (Step 6), Priority gaps, All prior context
   - **Purpose:** Design target architecture, sequence transformation

---

## Removed Functionality

### **Operating Model (Step 4 - Old)** ❌
- Removed completely - didn't fit sequential knowledge thread

### **Value Pools (Step 6 - Old)** ❌
- Removed completely - generated content without clear value

### **Removed Tabs** ❌
- heatmap, graph, impact, maturity, phase4, opmodel, valuepools

### **CFO Tab** →
- Moved to Analytics (Financial Analytics tab)

---

## Implementation Status

- [x] Backup created (NexGenEA_V9_BACKUP_2026-04-23_150825)
- [ ] Remove Operating Model
- [ ] Remove Value Pools
- [ ] Remove redundant tabs
- [ ] Create new Step 4: Benchmark
- [ ] Create new Step 5: Survey
- [ ] Create new Step 6: Layers & Gap
- [ ] Update Step 7
- [ ] Update StepEngine & StepContext
- [ ] Test E2E

---

## Rollback Plan

Copy from `NexGenEA_V9_BACKUP_2026-04-23_150825` if needed.
