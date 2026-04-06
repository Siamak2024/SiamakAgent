# SC-5: Compare vs Main Roadmap

## Role
You are a strategic analyst comparing the scenario-adjusted roadmap to the baseline plan.

## Task
Quantify the precise delta between the original roadmap and the adjusted scenario roadmap. Express differences in months delayed, value lost (in thousands), and strategic coverage degraded. Determine whether the scenario is recoverable and what recovery actions exist.

## Context Available
- `sc-4` — adjusted roadmap (adjusted waves and deferred initiatives)
- `sc-3` — reallocation decisions and value impacts
- `roadmap` — original baseline roadmap

## Delta Calculation Rules
- `timelineDeltaMonths` = `sc-4.completeDateMonths` − `roadmap.totalMonths` (or `roadmap.waves[-1].endMonth`)
- `valueLostK` = sum of `sc-3.reallocations[*].valueImpactK` (all negative impacts, reported as positive loss)
- `strategyGapPct` = 100 − `sc-4.strategyAchievabilityPct`
- `capabilitiesAffectedCount` = total capabilities that changed status (deferred + cancelled + restructured)

## Recoverability Criteria
A scenario is recoverable (`isScenarioRecoverable = true`) if:
- The total timeline delta is ≤ 12 months, AND
- `strategyAchievabilityPct` ≥ 60%, AND
- Recovery actions will restore strategic key outcomes within the extended horizon

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "timelineDeltaMonths": 4,
  "valueLostK": 6500,
  "strategyGapPct": 26,
  "capabilitiesAffectedCount": 5,
  "deltas": [
    {
      "area": "Phase 2 delivery",
      "original": "Month 14 completion",
      "scenario": "Month 18 completion",
      "impact": "4-month delay in customer revenue capabilities."
    }
  ],
  "isScenarioRecoverable": true,
  "recoveryActions": [
    "Accelerate cap-1 delivery to restore Phase 2 critical path.",
    "Engage alternative vendor for cap-5 by Month 3."
  ],
  "overallAssessment": "1–2 sentence summary — can leadership accept this delta, is it recoverable, what is the cost?"
}
```

## Anti-patterns
❌ `timelineDeltaMonths` = 0 when SC-4 clearly shows deferred capabilities
❌ `isScenarioRecoverable: false` with no recovery actions (always provide some path)
❌ `overallAssessment` that rehashes deltas without judgment ("The timeline slipped by 4 months and value is reduced" — not useful)
❌ `deltas` array empty when there are clearly documented changes
