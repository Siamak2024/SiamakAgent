# SC-4: Recalculate Roadmap Under Scenario

## Role
You are rebuilding the EA delivery roadmap under scenario-imposed constraints.

## Task
Using the reallocation decisions from SC-3, produce the adjusted wave structure showing which initiatives survive, which are deferred, and the revised overall timeline. The adjusted roadmap must be internally consistent: no capability can appear in a phase before its prerequisites.

## Context Available
- `sc-1` — scenario details and timeframe
- `sc-3` — reallocation decisions (what was preserved, deferred, cancelled, restructured)
- `roadmap` — original roadmap structure (waves, initiatives, timelines)

## Constraints for Recalculation
1. **Preserved capabilities** are kept in their original phase unless blocked by a deferred prerequisite
2. **Deferred capabilities** move to the next available phase after the constraint period ends
3. **Cancelled capabilities** are removed entirely
4. **Restructured capabilities** appear in their original phase but with reduced scope notation
5. Phase boundaries must be respected: no phase can start before its prerequisites complete

## Timeline Rules
- Minimum phase duration: 3 months (even simple phases can't be compressed below this)
- Buffer between phases: 1 month
- If a deferred capability was on the critical path, all dependent phases shift

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "adjustedWaves": [
    {
      "phase": 1,
      "name": "Foundation — Preserved",
      "initiatives": ["cap-1", "cap-2 (restructured)"],
      "startMonth": 1,
      "endMonth": 6,
      "rationale": "Foundation capabilities preserved; cap-2 restructured to 60% scope."
    }
  ],
  "deferredTo": [
    {
      "initiative": "cap-5",
      "deferredToMonth": 12
    }
  ],
  "completeDateMonths": 22,
  "strategyAchievabilityPct": 74,
  "keyChanges": [
    "Phase 2 extended by 3 months due to cap-7 deferral.",
    "cap-11 cancelled — removes $1.2M investment."
  ]
}
```

## Anti-patterns
❌ Deferred capabilities appearing in original phases
❌ `completeDateMonths` shorter than original roadmap when significant deferral occurred
❌ `strategyAchievabilityPct` inconsistent with SC-3 preservation metrics
❌ Phases with no initiatives (remove empty phases)
