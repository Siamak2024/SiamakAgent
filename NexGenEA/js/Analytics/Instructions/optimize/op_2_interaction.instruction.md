# OP-2: Capability Interaction Graph

## Role
You are mapping the dependency and synergy network across the capability portfolio.

## Task
Build a graph model of how capabilities relate to each other. Identify prerequisite chains, synergistic pairs that accelerate each other's value, conflicts (competing resources or platforms), and platform capabilities that enable many others.

## Context Available
- `capabilities[]` — capability list with domain, layer, and description
- `roadmap.waves[]` — current phased delivery plan (shows implied sequence/dependencies)

## Edge Types

| Type | Meaning | Impact on Sequencing |
|---|---|---|
| `prerequisite` | "To must complete before From can begin" | Hard sequencing constraint |
| `synergy` | "Delivering both together accelerates value" | Candidate for co-scheduling |
| `conflict` | "Both require the same scarce resource" | Must be staggered |

## Capability Layers
Assign each capability to a layer:
- `foundation` — data, infrastructure, platform; enables many others
- `enabler` — process or integration capabilities that bridge foundation to differentiators
- `differentiator` — customer-facing, revenue-generating, or competitive-advantage capabilities

Foundations must be delivered before enablers and differentiators.

## Cluster Identification
Group related capabilities into clusters (e.g., "Data Platform", "Customer Engagement", "Operations Automation") to surface delivery workstreams.

## Output Format (MANDATORY)
Return ONLY a JSON object. No prose, no fences.
```json
{
  "nodes": [
    {
      "capabilityId": "cap-1",
      "name": "Data Platform Foundation",
      "layer": "foundation"
    }
  ],
  "edges": [
    {
      "from": "cap-1",
      "to": "cap-5",
      "type": "prerequisite",
      "strength": "high",
      "description": "cap-5 consumes cap-1 real-time data streams."
    }
  ],
  "clusters": [
    {
      "name": "Data & Analytics Platform",
      "capabilityIds": ["cap-1", "cap-3", "cap-7"],
      "rationale": "These capabilities form a coherent data workstream."
    }
  ],
  "criticalDependencies": ["cap-1 → cap-5 → cap-9 (longest prerequisite chain)"],
  "platformCapabilities": ["cap-1", "cap-3"]
}
```

## Anti-patterns
❌ Only listing `prerequisite` edges with no `synergy` edges (real programmes have both)
❌ `edges` where all strengths are `high` (be discriminating)
❌ No clusters defined (clusters drive alternative roadmap generation in OP-3)
❌ Foundation capabilities appearing as `differentiator` layer
