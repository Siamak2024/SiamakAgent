# Task 4.1: Benchmark Analysis

## Objective
Compare the organization's capability maturity against APQC Process Classification Framework industry standards and identify performance gaps.

## Context Provided
- **Capabilities**: Complete capability map from Step 3 with current/target maturity ratings
- **Industry**: Business sector/vertical
- **Strategic Intent**: Strategic objectives and transformation goals
- **Business Model**: Operating model characteristics

## Your Task
1. **Establish Industry Baseline**
   - Determine average maturity for this industry sector using APQC standards
   - Identify top-quartile (best-in-class) maturity benchmarks
   - Consider sector-specific factors (e.g., regulatory, digital maturity)

2. **Benchmark Each Capability**
   - Compare current maturity vs industry average
   - Calculate gap vs top-quartile performers
   - Assess APQC framework alignment (STRONG/MODERATE/WEAK)
   - Determine priority based on strategic importance + gap size

3. **Summarize Findings**
   - Count capabilities above/below industry average
   - Identify critical gaps (>1.5 points below average)
   - Highlight competitive advantages (above top quartile)

## APQC Maturity Reference Scale
```
Level 1 (Initial): Ad-hoc, reactive, no formal process
Level 2 (Developing): Some structure, inconsistent execution
Level 3 (Defined): Documented standards, repeatable process
Level 4 (Managed): Measured, data-driven, proactive management
Level 5 (Optimizing): Continuous improvement, industry-leading innovation
```

## Industry Maturity Benchmarks (Typical)
- **Financial Services**: Avg 3.2, Top Quartile 4.5
- **Manufacturing**: Avg 3.0, Top Quartile 4.2
- **Healthcare**: Avg 2.8, Top Quartile 4.0
- **Technology**: Avg 3.5, Top Quartile 4.7
- **Retail**: Avg 2.9, Top Quartile 4.1
- **Generic/Other**: Avg 3.0, Top Quartile 4.0

## Gap Interpretation
- **Gap ≥ +1.0**: Competitive strength, potential to lead
- **Gap -0.5 to +0.5**: At par with market
- **Gap -0.5 to -1.0**: Lagging, needs improvement
- **Gap < -1.0**: Critical gap, strategic risk

## Priority Assignment Logic
```javascript
if (strategic_importance === 'CORE' && gap_vs_avg < -0.5) → HIGH priority
else if (strategic_importance === 'CORE') → MEDIUM priority
else if (gap_vs_avg < -1.0) → MEDIUM priority
else → LOW priority
```

## Output Format
Return **ONLY** valid JSON matching this exact structure:

```json
{
  "industry_baseline": {
    "sector": "Financial Services | Manufacturing | Healthcare | Technology | Retail | Generic",
    "avg_maturity": 3.2,
    "top_quartile_maturity": 4.5,
    "data_source": "APQC PCF v8.0"
  },
  "capability_benchmarks": [
    {
      "capability_id": "C01.01",
      "capability_name": "Customer Onboarding",
      "current_maturity": 2.5,
      "industry_avg": 3.2,
      "top_quartile": 4.5,
      "gap_vs_avg": -0.7,
      "gap_vs_best": -2.0,
      "apqc_alignment": "MODERATE",
      "priority": "HIGH",
      "rationale": "Core capability lagging industry average"
    }
  ],
  "summary": {
    "total_capabilities": 15,
    "above_average_count": 4,
    "at_average_count": 6,
    "below_average_count": 5,
    "critical_gaps": 2,
    "competitive_strengths": 1
  }
}
```

## Quality Checklist
- [ ] Industry baseline matches business sector
- [ ] All capabilities have benchmark comparisons
- [ ] Gap calculations are mathematically correct (gap = current - industry_avg)
- [ ] Priority logic follows strategic importance + gap severity
- [ ] APQC alignment assessment is justified
- [ ] Summary counts add up correctly
- [ ] JSON is valid and parseable

## Common Pitfalls to Avoid
❌ Using generic benchmarks for specialized industries  
❌ Ignoring strategic importance when setting priorities  
❌ Overly optimistic industry baseline (inflating gaps)  
❌ Missing null/unknown maturity values  
❌ Inconsistent gap calculations  

✅ Sector-specific benchmarks from APQC  
✅ Priority tied to strategic impact + gap size  
✅ Conservative baseline estimates  
✅ Handle missing data gracefully  
✅ Double-check arithmetic  
