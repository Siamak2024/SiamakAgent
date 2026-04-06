# OP-5: Recommendation & Rationale

## Role
You are producing the definitive optimization recommendation for the EA programme leadership team.

## Task
Based on the full optimization analysis (OP-1 through OP-4), recommend ONE alternative roadmap, justify the recommendation with evidence, acknowledge the accepted trade-offs, and provide adaptation suggestions that make the recommended alternative even stronger.

## Tone
- **Definitive**: Lead with the recommendation, not the analysis recap
- **Evidence-backed**: Cite the weighted score, key criterion wins, and financial metrics
- **Honest about trade-offs**: Name what is given up — this builds trust
- **Actionable**: Close with specific next steps, not general guidance

## Context Available
- `op-4.scoring[]` — weighted scores and ranks
- `op-4.paretoFront` — Pareto-dominant alternatives
- `op-3.alternatives[]` — full alternative definitions

## Adaptation Rule
Suggest 2–3 specific modifications to the recommended alternative that would improve it further (e.g., "Pull cap-7 earlier by removing its optional dependency on cap-9" or "Add a data governance layer in Phase 1 to reduce Phase 3 rework").

## Decision Confidence Levels
- `high`: Clear winner with ≥ 10-point weighted score advantage AND no unacceptable trade-offs
- `medium`: Clear winner but with 1–2 significant trade-offs that need acceptance
- `low`: Very close scoring; recommend piloting before full commitment

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "recommendedAlternativeId": "alt-B",
  "recommendedAlternativeName": "Value-first",
  "rationale": "alt-B achieves the highest weighted score (81.2) and dominates on the two highest-weight criteria: strategic alignment (87/100) and value delivery speed (79/100). It delivers 15% more total value than alt-A while adding only 4 months to delivery.",
  "keyAdvantages": [
    "Highest 3-year value delivery ($35M vs alt-A's $32M)",
    "Covers all 9 strategic themes vs 7 for alt-A",
    "Lower long-term technical debt than alt-A"
  ],
  "acceptedTradeoffs": [
    "Delayed first customer-facing capability by 2 months vs alt-A",
    "$500k higher programme investment than baseline"
  ],
  "suggestedAdaptations": [
    "Accelerate cap-7 (Customer Portal) to Phase 2 by decoupling from cap-11 dependency — saves 6 weeks.",
    "Add lightweight data governance capability in Phase 1 to reduce Phase 3 compliance rework.",
    "Consider running cap-4 and cap-6 in parallel in Phase 2 — they have no shared dependencies."
  ],
  "implementationGuidance": "Assign Phase 1 to a dedicated tiger team of 5 FTE. Run programme board review at Month 6.",
  "decisionConfidence": "high",
  "nextSteps": [
    "Present alt-B recommendation to programme board by end of quarter.",
    "Initiate Phase 1 procurement for data platform (cap-1) within 30 days.",
    "Schedule Phase 1 kick-off workshop."
  ]
}
```

## Anti-patterns
❌ `rationale` that doesn't cite the weighted score or any numbers
❌ `acceptedTradeoffs` empty ("there are no significant trade-offs")
❌ `suggestedAdaptations` that are generic ("improve planning" or "add more resources")
❌ `decisionConfidence: 'high'` when `op-4` scores are within 5 points of each other
❌ `nextSteps` with no timing or owner reference
