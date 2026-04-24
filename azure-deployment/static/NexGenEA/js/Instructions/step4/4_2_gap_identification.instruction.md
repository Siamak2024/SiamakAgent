# Task 4.2: Gap Identification & Quick Wins

## Objective
Identify critical capability gaps requiring strategic attention and highlight quick-win opportunities for rapid improvement.

## Context Provided
- **Benchmark Results**: Capability-by-capability performance vs industry
- **Strategic Intent**: Organization's strategic objectives and constraints
- **Gap Analysis**: Specific gaps vs average and best-in-class

## Your Task

### 1. Identify Critical Gaps
Prioritize gaps that create the highest strategic risk:
- **CRITICAL**: Core capability >2 points below industry, blocks strategic objectives
- **HIGH**: Core capability >1 point below, or support capability >2 points below
- **MEDIUM**: Any capability >0.5 points below with moderate strategic impact
- **LOW**: Minor gaps in non-core areas

For each gap, determine:
- **Gap Type**: MATURITY | PROCESS | TECHNOLOGY | SKILLS | DATA
- **Root Cause**: Why does this gap exist?
- **Impact**: Business consequences if not addressed
- **Recommended Action**: Specific improvement approach

### 2. Identify Quick Wins
Find opportunities with **high impact + low effort**:
- Maturity gap 0.5-1.5 points (not too severe)
- Clear, actionable improvement path
- Can deliver results in <6 months
- Low implementation risk
- Aligns with existing initiatives

Quick win characteristics:
```
✅ Effort: LOW (< 3 months, < $100K)
✅ Benefit: Measurable maturity improvement (0.5-1.0 points)
✅ Risk: Low implementation complexity
✅ Alignment: Supports strategic priorities
```

### 3. Define Strategic Priorities
Based on gap analysis + strategic intent, recommend 3-5 focus areas that will:
- Close the most critical gaps
- Unlock strategic objectives
- Build competitive differentiation
- Enable downstream capabilities

## Gap Type Definitions

| Type | Description | Example |
|------|-------------|---------|
| **MATURITY** | Process/practice immaturity | Ad-hoc vs documented process |
| **PROCESS** | Missing/broken workflow | No approval workflow for changes |
| **TECHNOLOGY** | System/tool limitations | Manual data entry, no automation |
| **SKILLS** | Capability/knowledge deficit | No data science expertise |
| **DATA** | Data quality/availability issues | Siloed systems, poor data quality |

## Root Cause Analysis Framework
1. **Lack of investment**: Underfunded, deprioritized
2. **Technical debt**: Legacy systems, outdated technology
3. **Skills gap**: Missing expertise, training needed
4. **Process immaturity**: No standards, inconsistent execution
5. **Organizational silos**: Poor collaboration, fragmented ownership
6. **Strategic neglect**: Not recognized as priority

## Output Format
Return **ONLY** valid JSON:

```json
{
  "critical_gaps": [
    {
      "capability_id": "C02.03",
      "capability_name": "Data Analytics & Insights",
      "gap_type": "TECHNOLOGY",
      "severity": "CRITICAL",
      "current_maturity": 1.5,
      "target_maturity": 4.0,
      "gap_size": -1.7,
      "impact": "Unable to make data-driven decisions; relying on gut feel and lagging indicators",
      "root_cause": "Legacy reporting tools, no analytics platform, limited data science skills",
      "recommended_action": "Implement modern analytics platform (e.g., Power BI, Tableau); hire 2 data analysts; train business users",
      "estimated_effort": "6-9 months, $250K investment",
      "strategic_alignment": "Directly enables Strategic Objective #2: Become data-driven organization"
    }
  ],
  "quick_wins": [
    {
      "capability_id": "C01.05",
      "capability_name": "Customer Feedback Management",
      "action": "Deploy simple feedback survey tool and establish monthly review cadence",
      "expected_benefit": "Improve from Level 2 to Level 3 maturity; gain systematic voice-of-customer insights",
      "effort": "LOW",
      "timeframe": "2-3 months",
      "investment": "$15K for tool + setup",
      "success_metric": "Monthly NPS tracking, 80%+ response rate"
    }
  ],
  "strategic_priorities": [
    "Modernize data & analytics capabilities to enable data-driven decision-making",
    "Standardize core operational processes to improve consistency and efficiency",
    "Upskill workforce in digital tools and agile ways of working"
  ]
}
```

## Priority Logic Decision Tree
```
Is capability CORE to business model?
├─ YES → Is gap > -1.0?
│         ├─ YES → CRITICAL
│         └─ NO → HIGH
└─ NO → Is gap > -1.5?
          ├─ YES → HIGH
          └─ NO → MEDIUM
```

## Quality Checklist
- [ ] Critical gaps have clear severity justification
- [ ] Root causes are specific, not generic
- [ ] Recommended actions are concrete and actionable
- [ ] Quick wins balance impact vs effort realistically
- [ ] Strategic priorities link back to gaps + strategic intent
- [ ] Effort/investment estimates are ballpark reasonable
- [ ] JSON structure is valid

## Common Pitfalls
❌ Identifying too many "critical" gaps (should be 2-4 max)  
❌ Vague root causes like "needs improvement"  
❌ Quick wins that require >6 months or major investment  
❌ Recommended actions that are just capability names repeated  
❌ Strategic priorities that don't tie to actual gaps  

✅ Focused list of truly critical gaps (2-4)  
✅ Specific root cause hypotheses  
✅ Realistic quick wins (achievable in <6 months)  
✅ Actionable recommendations with effort/cost estimates  
✅ Strategic priorities derived from gap patterns  
