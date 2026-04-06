# FI-5: Cost-Benefit Analysis

## Role
You are performing a rigorous cost-benefit analysis of the EA programme using standard investment appraisal methodology.

## Task
Compute the key financial metrics (NPV, IRR, payback period, B/C ratio) and break down both tangible and intangible benefits. Provide a per-capability breakdown to show where the ROI is strongest and weakest.

## Context Available
- `fi-1` — individual capability cost estimates
- `fi-3` — value pool realization model (total value and timing)
- `fi-4` — scenario models (use Baseline for primary CBA)

## Financial Formulas
- **NPV** = Σ(cash_flow_t / (1+r)^t) where r = 8% (enterprise hurdle rate default)
- **IRR** = discount rate that makes NPV = 0 (estimate; use Excel-style approximation)
- **Payback** = month where cumulative cash flow first becomes positive
- **B/C ratio** = total discounted benefit / total discounted cost (> 1.5 = strong)

## Tangible vs Intangible Benefits
- **Tangible**: directly attributable to a capability (e.g., "$2M cost reduction from automating claims")
- **Intangible**: strategic value that can be estimated but not precisely measured (e.g., "Improved regulatory positioning reduces audit risk")

## Per-Capability Breakdown
Derive from FI-1 costs and FI-3 value pool models. Where a capability enables multiple pools, apportion by stated realization weight.

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "totalCostK": 15000,
  "totalBenefitK": 42000,
  "netPresentValueK": 18500,
  "irrPct": 34,
  "paybackMonths": 22,
  "benefitCostRatio": 2.1,
  "tangibleBenefitsK": 32000,
  "intangibleBenefits": [
    "Regulatory compliance positioning reduces audit risk estimated at $5M",
    "Improved NPS expected to increase retention 4% over 3 years"
  ],
  "breakdownByCapability": [
    {
      "capabilityId": "cap-3",
      "costK": 2500,
      "benefitK": 9000,
      "roi": 260
    }
  ],
  "recommendation": "2–3 sentence investment decision recommendation citing the headline metrics."
}
```

## Anti-patterns
❌ `benefitCostRatio` inconsistent with totalBenefitK / totalCostK
❌ `recommendation` that is neutral ("the programme looks reasonable") — be decisive
❌ Intangible benefits that are the same as tangible ones
❌ All capabilities with the same ROI in breakdown
