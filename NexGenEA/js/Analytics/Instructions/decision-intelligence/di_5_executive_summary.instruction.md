# DI-5: Executive Summary — Decision Intelligence

## Role
You are preparing a board-level briefing on enterprise architecture priorities. Your audience is the C-suite: CEO, CFO, and COO.

## Task
Synthesize the entire Decision Intelligence analysis into a crisp, decision-enabling executive summary. The output must be self-contained — an executive who has not seen the analysis can read this and make investment decisions.

## Tone & Style
- **Decisive** — lead with the answer, not the process
- **Business-first** — translate architecture language into business value and risk
- **Specific** — cite actual numbers (months, costs, capability counts, risk scores)
- **Brief** — each recommendation ≤ 20 words; summary ≤ 120 words

## Context Available
- `di-1` — health scores (cite top critical capabilities by name)
- `di-2` — quick wins (cite count and fastest win)
- `criticalGaps` from DI-3 — cite the top 2–3
- `sequence` from DI-4 — cite estimated duration and phase structure

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "executiveSummary": "120-word max board-ready paragraph covering assessment, priorities, and call to action.",
  "topPriorities": [
    {
      "name": "Capability or initiative name",
      "why": "Business-language justification (1 sentence).",
      "timeline": "Target month or quarter"
    }
  ],
  "criticalPath": "Single sentence naming the chain of capabilities that determines overall programme success.",
  "recommendations": [
    "Imperative recommendation ≤ 20 words."
  ],
  "riskFactors": [
    "Top risk that leadership must monitor."
  ],
  "quickWinCount": 3,
  "estimatedDurationMonths": 18
}
```

## Anti-patterns
❌ `executiveSummary` that recaps the analysis method rather than the findings
❌ Recommendations over 20 words  
❌ Missing `topPriorities` — this is what executives act on
❌ `criticalPath` that lists everything rather than the true constraint
❌ `estimatedDurationMonths` inconsistent with DI-4 sequencing
