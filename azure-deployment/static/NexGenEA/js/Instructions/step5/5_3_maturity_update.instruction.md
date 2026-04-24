# Task 5.3: Maturity Update & Validation

## Objective
Update capability maturity ratings by integrating survey-validated data with original assessments, improving accuracy and confidence.

## Context Provided
- **Original Capabilities**: Capability map from Step 3 with initial maturity ratings
- **Survey Insights**: Processed survey data from Task 5.2 with stakeholder-validated maturity
- **Benchmark Data**: Industry comparisons for context

## Your Task

### 1. Compare Original vs Survey Maturity
For each capability with survey data:

**Alignment Analysis**:
- **CONFIRMED**: Survey maturity within ±0.3 of original estimate
- **ADJUSTED_UP**: Survey maturity >0.3 points higher (original was too pessimistic)
- **ADJUSTED_DOWN**: Survey maturity >0.3 points lower (original was too optimistic)

**Adjustment Logic**:
```javascript
// Weighted average: 40% original + 60% survey (survey has more weight)
adjusted_maturity = (0.4 * original_maturity) + (0.6 * survey_maturity)

// Exception: If confidence is LOW, reduce survey weight
if (confidence === 'LOW') {
  adjusted_maturity = (0.6 * original_maturity) + (0.4 * survey_maturity)
}

// Round to 1 decimal place
adjusted_maturity = Math.round(adjusted_maturity * 10) / 10
```

### 2. Confidence Assessment
Determine confidence in the adjusted maturity rating:

| Confidence | Criteria |
|------------|----------|
| **HIGH** | Survey + original agree (±0.3), high response rate (>70%), low variance |
| **MEDIUM** | Moderate agreement (±0.5), decent response rate (50-70%), some variance |
| **LOW** | High disagreement (>0.5 gap), low response rate (<50%), high variance OR conflicting data sources |

### 3. Validation Status
Categorize each update:

- **CONFIRMED**: Survey validates original assessment (no change or <0.3 adjustment)
- **ADJUSTED_UP**: Survey shows higher maturity than originally estimated (+0.3 to +1.0 typical)
- **ADJUSTED_DOWN**: Survey shows lower maturity than originally estimated (-0.3 to -1.0 typical)

### 4. Document Rationale
For each maturity update, provide clear justification:
- What changed and why
- Key evidence from survey
- Confidence factors
- Any caveats or follow-up needs

### 5. Generate Validation Summary
Aggregate statistics:
- Count of CONFIRMED, ADJUSTED_UP, ADJUSTED_DOWN
- Average confidence level
- Number of high-confidence ratings
- Capabilities needing further investigation (low confidence)

## Output Format
Return **ONLY** valid JSON:

```json
{
  "maturity_updates": [
    {
      "capability_id": "C02.03",
      "capability_name": "Data Analytics & Insights",
      "original_maturity": 1.5,
      "survey_maturity": 1.7,
      "adjusted_maturity": 1.6,
      "confidence": "HIGH",
      "validation_status": "CONFIRMED",
      "rationale": "Survey (1.7) closely validates original estimate (1.5). 14 responses with high consensus confirm ad-hoc/reactive state with limited tools. Adjusted to 1.6 reflecting weighted average with high survey confidence (85% response rate).",
      "key_evidence": [
        "85% response rate with low variance (σ=0.4)",
        "Specific examples: Excel-only reporting, no analytics platform",
        "Stakeholder consensus on Level 1-2 maturity (12 of 14)"
      ],
      "next_steps": "Maturity validated; proceed with analytics platform implementation per benchmark recommendations"
    },
    {
      "capability_id": "C03.05",
      "capability_name": "Manufacturing Operations",
      "original_maturity": 3.0,
      "survey_maturity": 4.2,
      "adjusted_maturity": 3.7,
      "confidence": "MEDIUM",
      "validation_status": "ADJUSTED_UP",
      "rationale": "Survey (4.2) indicates higher maturity than original estimate (3.0). Operators report documented SOPs, real-time monitoring dashboards, and continuous improvement culture. Adjusted to 3.7 (weighted avg). Confidence MEDIUM due to smaller sample size (8 responses, 67% rate) but consistent feedback.",
      "key_evidence": [
        "100% respondents cited documented standard operating procedures",
        "Real-time OEE monitoring in place (Level 4 characteristic)",
        "Active Kaizen program with quarterly improvement cycles"
      ],
      "next_steps": "Competitive strength confirmed; consider benchmarking other sites against this facility"
    },
    {
      "capability_id": "C01.08",
      "capability_name": "Customer Feedback Management",
      "original_maturity": null,
      "survey_maturity": 2.3,
      "adjusted_maturity": 2.3,
      "confidence": "HIGH",
      "validation_status": "CONFIRMED",
      "rationale": "No original maturity estimate (null). Survey provides first data point: 2.3 (Developing level). 11 responses (78% rate) consistently describe ad-hoc email surveys with no systematic analysis. High confidence in survey-based rating.",
      "key_evidence": [
        "78% response rate with strong agreement (σ=0.5)",
        "Current state: Manual email surveys 1-2x/year, no CRM integration",
        "Quick win validated: 12 of 14 respondents support feedback tool investment"
      ],
      "next_steps": "Survey establishes baseline; quick-win opportunity confirmed for feedback tool deployment"
    }
  ],
  "validation_summary": {
    "total_capabilities_updated": 18,
    "confirmed_count": 12,
    "adjusted_up_count": 4,
    "adjusted_down_count": 2,
    "high_confidence_count": 14,
    "medium_confidence_count": 3,
    "low_confidence_count": 1,
    "avg_confidence": "HIGH",
    "avg_adjustment_magnitude": 0.4,
    "capabilities_needing_investigation": [
      "C04.02 IT Service Management: Low confidence due to conflicting feedback (σ=1.8)"
    ]
  }
}
```

## Adjustment Decision Tree
```
Does survey data exist for capability?
├─ NO → Keep original maturity (no update)
└─ YES → Calculate |original - survey|
          ├─ Difference ≤ 0.3 → CONFIRMED (use weighted avg)
          ├─ Survey > Original by >0.3 → ADJUSTED_UP (use weighted avg)
          └─ Survey < Original by >0.3 → ADJUSTED_DOWN (use weighted avg)
```

## Confidence Logic
```javascript
let confidence = 'MEDIUM';  // default

// Upgrade to HIGH if:
if (response_rate > 0.70 && variance < 0.8 && Math.abs(survey - original) < 0.5) {
  confidence = 'HIGH';
}

// Downgrade to LOW if:
if (response_rate < 0.50 || variance > 1.5 || Math.abs(survey - original) > 1.0) {
  confidence = 'LOW';
}
```

## Quality Checklist
- [ ] All capabilities with survey data have maturity updates
- [ ] Adjusted maturity uses proper weighted average formula
- [ ] Confidence levels are justified with evidence
- [ ] Validation status (CONFIRMED/ADJUSTED_UP/DOWN) is correct
- [ ] Rationale clearly explains the update decision
- [ ] Summary statistics add up correctly
- [ ] Capabilities with null original maturity handled properly
- [ ] JSON is valid and complete

## Handling Edge Cases

### Case 1: Null Original Maturity
```json
{
  "original_maturity": null,
  "survey_maturity": 2.3,
  "adjusted_maturity": 2.3,
  "validation_status": "CONFIRMED",
  "rationale": "No original estimate; survey provides first data point"
}
```

### Case 2: Large Discrepancy (>1.0 difference)
```json
{
  "original_maturity": 2.0,
  "survey_maturity": 3.8,
  "adjusted_maturity": 3.1,
  "confidence": "MEDIUM",
  "validation_status": "ADJUSTED_UP",
  "rationale": "Significant gap suggests original was too pessimistic. Survey reveals documented processes and measurement practices not visible in initial assessment. Adjusted upward but maintaining caution (MEDIUM confidence) due to large variance."
}
```

### Case 3: Low Response Rate
```json
{
  "survey_maturity": 2.5,
  "confidence": "LOW",
  "rationale": "Survey data from only 4 responses (40% rate) with high variance (σ=1.3). Use weighted average but flag for follow-up validation."
}
```

## Common Pitfalls
❌ Ignoring original estimate completely (should use weighted average)  
❌ All updates showing CONFIRMED (unrealistic - surveys should reveal nuance)  
❌ Confidence levels not matching evidence (e.g., HIGH confidence with 40% response rate)  
❌ Vague rationale ("survey provided more data")  
❌ Math errors in weighted average calculation  

✅ Properly weighted adjustments (40% original + 60% survey)  
✅ Mix of CONFIRMED, ADJUSTED_UP, ADJUSTED_DOWN (reflects reality)  
✅ Confidence justified by response rate + variance + agreement  
✅ Specific rationale with key evidence bullets  
✅ Correct arithmetic (verify sample calculations)  

## Expected Distribution
For a typical survey validation:
- **60-70% CONFIRMED**: Survey validates original estimate
- **15-20% ADJUSTED_UP**: Original was too pessimistic
- **10-15% ADJUSTED_DOWN**: Original was too optimistic
- **70-80% HIGH or MEDIUM confidence**: Most surveys yield usable data
- **5-10% LOW confidence**: Some surveys have poor response/variance
