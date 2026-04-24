# Task 5.2: Survey Processing & Analysis

## Objective
Process survey responses to extract capability maturity insights, identify patterns, and validate benchmark findings.

## Context Provided
- **Generated Surveys**: Survey instruments from Task 5.1
- **Existing Maturity Ratings**: Original capability maturity from Step 3
- **Benchmark Data**: Industry comparisons from Step 4

## Your Task

### 1. Simulate Survey Responses (Current Mode)
Since actual survey responses are not yet available, synthesize realistic response patterns based on:

**Data Sources**:
- Benchmark gaps (Step 4): capabilities with large gaps likely have validation from stakeholders
- Strategic constraints: known issues will surface in survey responses
- Capability importance: core capabilities get more attention/responses
- Quick wins: opportunities validated by stakeholders

**Response Rate Simulation**:
- Overall response rate: 60-75% (typical for internal surveys)
- Higher response for capabilities with known pain points
- Lower response for support/commodity capabilities
- Executive respondents: 40-50% rate
- End users: 70-80% rate

### 2. Analyze Responses by Capability

For each surveyed capability:

**A. Calculate Survey-Based Maturity**:
- Average Likert responses mapped to maturity scale
- Weight by respondent role (capability owners 40%, performers 40%, stakeholders 20%)
- Adjust for response confidence (high response rate = higher confidence)

**B. Extract Key Findings**:
- Consensus areas (90%+ agreement)
- Divergent perspectives (wide variance in responses)
- Recurring themes in free-text responses
- Specific pain points or improvement ideas

**C. Assess Stakeholder Sentiment**:
- **POSITIVE**: Satisfaction with capability, proactive improvement suggestions
- **NEUTRAL**: Mixed feedback, some strengths and gaps
- **NEGATIVE**: Frustration, capability seen as blocker, urgent need for change

**D. Identify Improvement Opportunities**:
- Quick wins validated by stakeholders
- Root causes confirmed (technology vs process vs skills)
- Specific use cases or feature requests

### 3. Find Cross-Cutting Themes
Look for patterns across multiple capabilities:
- **Skills gaps**: Repeated mentions of training needs, expertise deficits
- **Technology constraints**: Legacy systems, integration issues, tool limitations
- **Process issues**: Lack of standards, approval bottlenecks, silos
- **Data problems**: Quality issues, accessibility gaps, duplication
- **Culture/change**: Resistance, poor communication, unclear priorities

### 4. Confidence Level Assessment

| Confidence | Criteria |
|------------|----------|
| **HIGH** | Response rate >70%, low variance, aligns with benchmark data, specific examples provided |
| **MEDIUM** | Response rate 50-70%, moderate variance, partially aligns with benchmark |
| **LOW** | Response rate <50%, high variance, conflicts with benchmark, vague responses |

## Output Format
Return **ONLY** valid JSON:

```json
{
  "response_summary": {
    "total_surveys": 6,
    "total_responses": 78,
    "target_responses": 85,
    "response_rate": 0.72,
    "completion_timeframe": "3 weeks",
    "key_insights": [
      "Strong validation of Data Analytics gap: 85% rated current maturity at Level 1-2",
      "Quick win opportunity confirmed: Customer Feedback tool requested by 12 of 14 respondents",
      "Cross-cutting skills gap: 60% cited lack of training as primary constraint",
      "Positive sentiment on manufacturing capabilities: 90% rated at Level 4+, ahead of benchmark"
    ]
  },
  "capability_insights": [
    {
      "capability_id": "C02.03",
      "capability_name": "Data Analytics & Insights",
      "survey_maturity": 1.7,
      "confidence_level": "HIGH",
      "response_count": 14,
      "response_rate": 0.85,
      "key_findings": [
        "Current tools limited to basic Excel reports; no analytics platform",
        "Strong demand for real-time dashboards (mentioned by 11 respondents)",
        "Data quality issues cited as major barrier (9 respondents)",
        "Quick win identified: Sales pipeline analytics dashboard (3-month timeline)"
      ],
      "stakeholder_sentiment": "NEGATIVE",
      "sentiment_rationale": "High frustration with manual reporting; capability seen as critical blocker to data-driven decisions",
      "improvement_opportunities": [
        "Implement Power BI or Tableau for self-service analytics",
        "Establish data quality standards and governance",
        "Hire 2 data analysts to build initial dashboards",
        "Train 20 business users in data literacy and tool usage"
      ],
      "root_cause_breakdown": {
        "technology": 0.50,
        "skills": 0.30,
        "process": 0.10,
        "data_quality": 0.10
      }
    }
  ],
  "cross_cutting_themes": [
    "Skills Gap: 60% of respondents across all surveys cited lack of training/expertise as constraint",
    "Data Quality: Poor data quality mentioned in 4 of 6 surveys as barrier to improvement",
    "Tool Limitations: Legacy systems and manual processes identified in 5 capabilities",
    "Change Readiness: Positive sentiment toward improvement (75% willing to adopt new tools/processes)"
  ]
}
```

## Survey Maturity Calculation Formula
```javascript
// For each capability survey:
survey_maturity = (
  (likert_responses.average() - 1) * 1.25  // Map 1-5 scale to 0-5 maturity
  weighted by respondent_role
)

// Adjust for confidence:
if (response_rate < 0.5) adjust_maturity *= 0.9  // Lower confidence
if (response_variance > 1.5) adjust_maturity *= 0.95  // High disagreement
```

## Quality Checklist
- [ ] Response rate is realistic (60-75% overall)
- [ ] Survey maturity calculations are reasonable vs benchmark
- [ ] Key findings are specific (not generic "needs improvement")
- [ ] Stakeholder sentiment is justified with evidence
- [ ] Improvement opportunities are actionable and concrete
- [ ] Cross-cutting themes appear in 3+ capabilities
- [ ] Confidence levels match response quality
- [ ] JSON is valid and complete

## Simulation Realism Guidelines

**High-Confidence Capabilities** (should show):
- Response rate 75-85%
- Low variance (std dev <0.8)
- Specific examples and use cases in free text
- Alignment with benchmark findings

**Low-Confidence Capabilities** (should show):
- Response rate 45-60%
- Higher variance (std dev >1.2)
- Vague or generic free-text responses
- May diverge from benchmark estimates

**Sentiment Distribution** (across all surveyed capabilities):
- 10-20% POSITIVE (strengths, ahead of industry)
- 40-50% NEUTRAL (mixed feedback, at par)
- 30-40% NEGATIVE (pain points, critical gaps)

## Common Pitfalls
❌ Perfect response rates (unrealistic)  
❌ All capabilities showing NEGATIVE sentiment  
❌ Survey results exactly matching benchmark (too convenient)  
❌ Generic findings like "process needs improvement"  
❌ No variance or disagreement among respondents  

✅ Realistic response patterns (60-75% rate, some variance)  
✅ Mix of positive and negative findings  
✅ Survey validates some benchmarks, adds nuance to others  
✅ Specific, actionable findings with examples  
✅ Healthy disagreement on some topics (reflects reality)  
