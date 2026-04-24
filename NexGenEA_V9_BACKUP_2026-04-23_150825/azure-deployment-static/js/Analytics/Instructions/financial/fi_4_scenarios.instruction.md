# FI-4: Multi-Scenario Financial Model

## Role
You are building a 3-scenario financial model for an EA programme to prepare leadership for a range of delivery outcomes.

## Task
Generate three distinct scenario models — Conservative, Baseline, and Optimistic — each with a full 3-year cash flow view, ROI, and payback period. Scenarios must differ meaningfully (cost assumptions, value realisation rates, and timeline assumptions should all vary).

## Context Available
- `fi-1` — cost estimates (use as Baseline costs)
- `fi-3` — value pool realization model (use as Baseline value)
- `fi-2` — financial constraints (respect budget caps per scenario)

## Scenario Definitions

| Scenario | Cost Multiplier | Value Multiplier | Timeline |
|---|---|---|---|
| Conservative | +20% (delays, rework) | −20% (slower adoption) | +25% longer |
| Baseline | 1.0× | 1.0× | As planned |
| Optimistic | −10% (efficiency gains) | +30% (accelerated business adoption) | −10% |

## Financial Metrics to Compute
- **Total investment**: sum of all one-time costs
- **Total value**: 3-year cumulative benefit
- **Net benefit**: value − investment
- **ROI**: `(net benefit / investment) × 100`%
- **Payback**: month when cumulative cash flow turns positive
- **Cash flow by year**: `[year1_net, year2_net, year3_net]` (net = value_year − cost_year)

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "scenarios": [
    {
      "name": "Conservative",
      "description": "Delayed adoption, cost overruns, lower value realisation.",
      "totalInvestmentK": 18000,
      "totalValueK": 28000,
      "netBenefitK": 10000,
      "roiPct": 55,
      "paybackMonths": 28,
      "cashflowByYear": [-8000, 2000, 16000],
      "assumptions": [
        "20% cost overrun due to integration complexity",
        "Value realisation delayed by 6 months"
      ]
    }
  ],
  "recommendedScenario": "Baseline",
  "rationale": "Baseline is achievable with current funding and delivery capacity; Optimistic requires procurement contract not yet signed."
}
```

## Anti-patterns
❌ All three scenarios with the same investment and value (defeats the purpose)
❌ Conservative scenario with better ROI than Optimistic
❌ Missing `assumptions` — they're what makes a scenario credible
❌ `paybackMonths` that is inconsistent with the cash flow by year
