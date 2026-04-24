# Task 6.2: Gap Analysis

## Objective
Analyze capability gaps using validated maturity data from Step 5, prioritize based on strategic impact, and articulate business implications.

## Context Provided
- **Capabilities**: Capability map with survey-validated maturity ratings
- **Benchmark Gaps**: Industry comparison gaps from Step 4
- **Survey Results**: Stakeholder insights and root causes from Step 5
- **Strategic Intent**: Organizational goals and constraints

## Your Task

### 1. Calculate Capability Gaps
For each capability, determine gap size:

```javascript
gap_size = target_maturity - current_maturity

// Significance thresholds:
// gap_size > 2.0 → CRITICAL
// gap_size 1.0-2.0 → HIGH
// gap_size 0.5-1.0 → MEDIUM
// gap_size < 0.5 → LOW (not a priority)
```

**Focus Analysis On**:
- Gaps ≥0.5 maturity points
- CORE and HIGH strategic importance capabilities
- Capabilities blocking strategic objectives
- Capabilities with cascading dependencies

### 2. Classify Gap Types
Categorize the primary root cause for each gap:

| Gap Type | Root Cause | Typical Remediation |
|----------|------------|---------------------|
| **MATURITY** | Immature practices, ad-hoc processes | Process standardization, governance |
| **PROCESS** | Missing/broken workflows, inefficient | Process redesign, automation |
| **TECHNOLOGY** | Legacy systems, tool limitations | Platform modernization, new tools |
| **SKILLS** | Knowledge/expertise deficit | Training, hiring, outsourcing |
| **DATA** | Poor quality, siloed, inaccessible | Data governance, integration, MDM |

Use survey insights and benchmark data to determine gap type.

### 3. Prioritize Gaps
Apply prioritization logic:

**Priority Framework**:
```
CRITICAL:
- CORE capability + gap >1.5
- Blocks strategic objectives
- High business risk if not addressed

HIGH:
- CORE capability + gap 0.8-1.5
- Significant competitive disadvantage
- Enables multiple dependent capabilities

MEDIUM:
- SUPPORT capability + gap >1.0
- OR CORE capability + gap 0.5-0.8
- Moderate business impact

LOW:
- COMMODITY capability + any gap
- OR gap <0.5 on any capability
- Limited business impact
```

**Business Impact Assessment**:
- Revenue impact (lost sales, pricing pressure)
- Cost impact (inefficiency, rework, manual effort)
- Risk impact (compliance, security, operational resilience)
- Strategic impact (blocks transformation, limits innovation)

### 4. Identify Root Causes
For each gap, articulate specific root cause:

**Good Root Causes** (specific, actionable):
✅ "No analytics platform; relying on Excel for all reporting"  
✅ "20-year-old order management system with no API integration"  
✅ "Customer data siloed across 4 systems with manual reconciliation"  
✅ "Zero dedicated data analysts; business users lack SQL/BI tool skills"  

**Bad Root Causes** (vague, not actionable):
❌ "Process needs improvement"  
❌ "Technology is outdated"  
❌ "Lacks maturity"  

### 5. Map Dependencies
Identify which gaps are blockers for other capabilities:

- **Foundational gaps**: Data infrastructure, integration platform, core systems
- **Enabling gaps**: Analytics, governance, change management
- **Dependent gaps**: Capabilities that rely on foundational capabilities

Example dependency chain:
```
Data Quality (gap=1.8) → blocks → Analytics (gap=2.0) → blocks → Data-Driven Decisions
```

### 6. Strategic Implications
Synthesize 3-5 strategic-level implications:
- What business outcomes are at risk?
- Which strategic objectives are blocked?
- What competitive position is threatened?
- What transformation initiatives are impacted?

## Output Format
Return **ONLY** valid JSON:

```json
{
  "gap_summary": {
    "total_gaps": 18,
    "critical_count": 2,
    "high_count": 5,
    "medium_count": 7,
    "low_count": 4,
    "avg_gap_size": 1.2,
    "max_gap": 2.3,
    "total_maturity_points_needed": 21.5
  },
  "capability_gaps": [
    {
      "capability_id": "C02.03",
      "capability_name": "Data Analytics & Insights",
      "current_maturity": 1.6,
      "target_maturity": 4.0,
      "gap_size": 2.4,
      "gap_type": "TECHNOLOGY",
      "priority": "CRITICAL",
      "strategic_importance": "CORE",
      "business_impact": "Unable to make data-driven pricing decisions; losing $2M annually to suboptimal pricing. Customer insights limited to anecdotal feedback. Cannot forecast demand accurately, resulting in 15% inventory overstock.",
      "root_cause": "No analytics platform (Excel-only reporting); legacy ERP has no real-time data export; zero data analysts on staff; business users lack SQL/BI training",
      "dependencies": [
        "C02.01 Data Management (must improve data quality first)",
        "C05.03 Reporting & Dashboards (dependent on analytics capability)"
      ],
      "benchmark_context": "Industry average is 3.2; top quartile is 4.5. We are 1.6 points below average, putting us in bottom 20% of sector.",
      "survey_validation": "14 responses (85% rate) confirmed Level 1-2 maturity; 11 cited lack of tools as primary barrier"
    }
  ],
  "strategic_implications": [
    "Digital Transformation at Risk: 3 of 4 strategic objectives require strong data/analytics capabilities. Current 2.4-point gap blocks progress on 'Become Data-Driven Organization' initiative.",
    "Competitive Disadvantage: Industry moving to AI/ML-driven insights while we lack basic analytics. Risk losing market share to digitally native competitors within 18-24 months.",
    "Foundation Missing: Data & integration gaps (2 critical, 3 high) prevent modernization of customer experience and operational efficiency. Must address foundation before pursuing innovation.",
    "Talent Gap Compounding: Skills gaps in data, digital, and agile identified across 60% of surveyed capabilities. Training/hiring needed alongside technology investments.",
    "Quick Win Potential: Despite large gaps, 5 quick-win opportunities identified with <6 month delivery and high ROI. Can build momentum for larger transformation program."
  ]
}
```

## Gap Prioritization Matrix

```
┌─────────────────────────────────────────────┐
│         Strategic Importance                │
│                                             │
│  HIGH  │ gap≥1.5: CRITICAL                 │
│        │ gap 0.8-1.5: HIGH                 │
│ MEDIUM │ gap≥1.0: HIGH                     │
│        │ gap 0.5-1.0: MEDIUM               │
│  LOW   │ any gap: MEDIUM or LOW            │
└─────────────────────────────────────────────┘
```

## Quality Checklist
- [ ] All gaps ≥0.5 points are analyzed
- [ ] Priority levels follow the framework (not all CRITICAL)
- [ ] Gap types are specific (not all "MATURITY")
- [ ] Business impact is quantified where possible
- [ ] Root causes are specific and actionable
- [ ] Dependencies are identified for foundational gaps
- [ ] Strategic implications link to strategic objectives
- [ ] Gap summary statistics are mathematically correct
- [ ] JSON is valid and complete

## Expected Distribution
For a typical capability portfolio:
- **2-4 CRITICAL gaps** (5-10% of capabilities)
- **4-6 HIGH gaps** (10-20% of capabilities)
- **6-10 MEDIUM gaps** (20-30% of capabilities)
- **Rest LOW** or no significant gap

## Common Pitfalls
❌ Marking everything CRITICAL (priority inflation)  
❌ Vague root causes ("needs improvement")  
❌ No quantified business impact  
❌ Ignoring dependencies  
❌ Generic strategic implications  

✅ Realistic priority distribution (few CRITICAL)  
✅ Specific, actionable root causes  
✅ Quantified impact where data exists  
✅ Dependency chains identified  
✅ Strategic implications tied to objectives  

## Business Impact Formula
Try to quantify when possible:

**Revenue Impact**:
- Lost sales due to poor customer experience
- Pricing inefficiency due to lack of analytics
- Market share loss to competitors

**Cost Impact**:
- Manual effort (FTE hours × hourly cost)
- Rework/errors (defect rate × resolution cost)
- Inefficiency (cycle time × volume)

**Risk Impact**:
- Compliance penalties
- Security breach probability × impact
- Operational downtime cost

**Strategic Impact**:
- Initiatives blocked or delayed
- Competitive position erosion
- Innovation constraint

Example: "Manual order entry (3 FTE @ $60K = $180K annually) + 5% error rate causing $400K rework = $580K cost impact"
