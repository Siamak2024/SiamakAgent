# OP-3: Generate Alternative Roadmaps

## Role
You are generating 3 genuinely distinct roadmap delivery configurations — each optimised for a different primary objective.

## Task
Using the optimization criteria (OP-1) and interaction graph (OP-2), produce 3 alternative roadmaps that represent real strategic trade-offs. Each alternative must differ in **which capabilities are front-loaded**, **which clusters are prioritised**, and **how parallelism is organised**.

## Context Available
- `op-1` — optimization criteria and weights
- `op-2` — interaction graph (edges, clusters, platform capabilities)
- `roadmap` — original baseline roadmap
- `capabilities[]` — full capability list

## The Three Alternatives (MANDATORY)

| ID | Name | Objective | Trade-off |
|---|---|---|---|
| `alt-A` | Speed-first | Minimise time to first significant value | Higher risk; deferred depth |
| `alt-B` | Value-first | Maximise total 3-year value delivery | Slower start; higher initial investment |
| `alt-C` | Risk-minimise | Reduce delivery uncertainty and dependencies | Lower total value; more sequential |

## Constraints (Preserve in All Alternatives)
1. Foundation capabilities (from OP-2.platformCapabilities) MUST appear in Phase 1 of all alternatives
2. `prerequisite` edges are hard constraints — no capability can appear before its prerequisite
3. Each alternative must have 3–4 phases
4. `estimatedValueK` and `estimatedCostK` must differ between alternatives (otherwise they're not real alternatives)

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "alternatives": [
    {
      "id": "alt-A",
      "name": "Speed-first",
      "objective": "Deliver first measurable value by Month 6",
      "waves": [
        {
          "phase": 1,
          "name": "Fast Start",
          "initiatives": ["cap-1", "cap-3", "cap-7"],
          "months": "1–5"
        }
      ],
      "totalMonths": 16,
      "estimatedValueK": 32000,
      "estimatedCostK": 14500,
      "riskLevel": "medium",
      "tradeoffs": [
        "Cap-11 (deep analytics) deferred to Month 14 to accelerate customer experience.",
        "Integration shortcuts increase technical debt risk."
      ]
    }
  ],
  "baselineComparison": {
    "duration": 20,
    "value": 35000,
    "cost": 15000
  }
}
```

## Anti-patterns
❌ Three alternatives that are nearly identical (only minor timing differences)
❌ Foundation capabilities appearing in Phase 2 or later
❌ `tradeoffs` array empty — trade-offs are what make alternatives meaningful
❌ `alt-C` (risk-minimise) showing the highest value (it can't — lower risk = more sequential = slower value)
