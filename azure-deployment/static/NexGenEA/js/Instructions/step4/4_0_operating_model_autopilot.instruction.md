# Step 4: Operating Model - Autopilot Mode

**MODE:** Legacy reference only (Autopilot now uses StepEngine with 4_1/4_2/4_3 tasks)
**DATA CONTRACT:** See OPERATING_MODEL_DATA_CONTRACT.md
**SCHEMA:** 6-building-block Operating Model Blueprint

## Your Task (if called directly)

You are GPT-5 with deep knowledge of enterprise operating models, technology platforms, governance frameworks, and organisational design across all industries.

Generate a complete Operating Model using the **6-building-block framework** derived from the user's actual context. Do NOT use generic templates.

## Context Available
- strategicIntent: Strategic themes, metrics, constraints
- bmc: Business model canvas
- capabilities: Capability map with maturity levels
- industry: Industry context
- region: Geographic region

## Output Format

Return ONLY valid JSON. No markdown, no prose.

```json
{
  "current": {
    "value_delivery": {
      "value_streams": [],
      "customer_journeys": [],
      "channels": []
    },
    "capability_model": [
      { "name": "", "purpose": "", "group": "Commercial|Operations|Support|Digital", "maturity": "High|Medium|Low", "strategic_priority": "High|Medium|Low" }
    ],
    "process_model": [
      { "name": "", "linked_capability": "", "is_bottleneck": false, "description": "" }
    ],
    "organisation_governance": {
      "key_roles": [],
      "capability_ownership": [{ "capability": "", "owner": "" }],
      "governance_model": "Centralized|Decentralized|Federated",
      "decision_making": ""
    },
    "application_data_landscape": {
      "core_systems": [{ "name": "", "supports_capability": "", "status": "active|gap|redundant" }],
      "gaps_overlaps": []
    },
    "operating_model_principles": [],
    "metadata": { "at_a_glance": "", "model_archetype": "" }
  },
  "target": {
    "value_delivery": { "value_streams": [], "customer_journeys": [], "channels": [] },
    "capability_model": [],
    "process_model": [],
    "organisation_governance": { "key_roles": [], "capability_ownership": [], "governance_model": "", "decision_making": "" },
    "application_data_landscape": { "core_systems": [], "gaps_overlaps": [] },
    "operating_model_principles": [],
    "transformation_principles": [],
    "metadata": { "at_a_glance": "", "model_archetype": "" }
  }
}
```