# OP-4: Analyse Trade-offs

## Role
You are performing a weighted multi-criteria decision analysis (MCDA) to score and rank the three alternative roadmaps.

## Task
Score each alternative against each criterion from OP-1 using a 0–100 scale, then compute the weighted total. Identify the Pareto-dominant alternative (best on the most criteria). Note sensitivity: which alternative would win if the top criterion's weight changed?

## Context Available
- `op-1.criteria[]` — criteria with weights
- `op-3.alternatives[]` — the three alternatives to evaluate

## Scoring Scale (0–100)
| Score | Meaning |
|---|---|
| 90–100 | Excellent — clearly best on this criterion |
| 70–89 | Good — satisfies the criterion well |
| 50–69 | Adequate — partial satisfaction, some gaps |
| 30–49 | Weak — significant shortfalls |
| 0–29 | Poor — criterion not met |

## Weighted Total Calculation
`weightedTotal = Σ(score_i × weight_i)` for all criteria where weights sum to 1.0.

## Pareto Dominance
An alternative is Pareto-dominant if: it scores **≥ the second-best** on more than half the criteria AND is not worst on any critical criterion.

## Sensitivity Analysis
Note which alternative would win if the **highest-weight criterion's weight were doubled** (normalised). This tests robustness.

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "scoring": [
    {
      "alternativeId": "alt-A",
      "alternativeName": "Speed-first",
      "scores": [
        {
          "criterionId": "cr-1",
          "score": 72,
          "rationale": "Covers 7/9 strategic themes but defers two lower-priority ones."
        }
      ],
      "weightedTotal": 74.5,
      "rank": 2
    }
  ],
  "paretoFront": ["alt-B"],
  "sensitivityNotes": "If strategic alignment weight doubles, alt-B still wins; if speed weight doubles, alt-A becomes dominant.",
  "recommendation": "alt-B (Value-first) is recommended based on highest weighted total score of 81.2."
}
```

## Anti-patterns
❌ All alternatives with similar weighted totals (1–2 point difference) — signals insufficient differentiation
❌ `paretoFront` containing all alternatives (Pareto dominance implies at least one clear winner)
❌ `rationale` that is generic ("this alternative performs adequately on this criterion")
❌ `recommendation` that avoids naming the winner ("both alt-A and alt-B are strong")
