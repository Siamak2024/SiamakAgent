# Step 4: Operating Model - Autopilot Mode

**MODE:** Autopilot (Fast generation from Strategic Intent + BMC + Capabilities)
**DATA CONTRACT:** See OPERATING_MODEL_DATA_CONTRACT.md
**SCHEMA COMPLIANCE:** CRITICAL - Output must match exact 5-dimension schema

## Context Available
You receive:
- `strategicIntent`: Strategic themes, metrics, constraints
- `bmc`: Business model canvas
- `capabilities`: Capability map with maturity levels
- `industry`: Industry context
- `region`: Geographic region

## Your Task
Generate a comprehensive **Operating Model** defining HOW the organization operates across 5 dimensions.

You are GPT-5 with deep knowledge of enterprise operating models, technology platforms, governance frameworks, and organizational design across all industries. Generate an operating model that is grounded in the user's actual context — not from generic templates.

## MANDATORY Requirements

### 1. Use REAL Platform/Tool Names (NOT Generic Labels)

❌ **WRONG:**
- "CRM system", "ERP platform", "Cloud infrastructure", "BI tool"

✅ **CORRECT:**
- Named platforms appropriate to the industry and context
- Match the technology to what organizations of this type, size, and region actually use
- If the company description mentions specific platforms, use those — otherwise infer from industry, region, and capability constraints

**How to select platforms:**
- Analyze the industry and region to determine the most realistic platform choices
- Use constraints from Strategic Intent (e.g., "legacy ERP" → name a realistic legacy platform for the sector)
- Match platform sophistication to the company's stated digital maturity
- Include local/regional platforms relevant to the geography (e.g., BankID for Sweden/Norway, NHS Spine for UK healthcare, Swish for Swedish payments)
- When multiple platforms are plausible, choose the most commonly used in that specific sector/region

### 2. Real Organizational Roles (Not Generic)

❌ **WRONG:**
- "IT Team", "Business Team", "Management"

✅ **CORRECT:**
- Specific role titles with FTE counts or team sizes
- Match the organizational sophistication to the company's stated size and transformation ambition
- Use role titles common in the specific industry (e.g., "Chief Digital Officer" for digital transformation, "DPO" for GDPR-regulated industries)

### 3. Specific Processes with Real Standards

❌ **WRONG:**
- "Agile development", "ITIL processes"

✅ **CORRECT:**
- Named methodology versions (SAFe 6.0, ITIL 4, Prosci ADKAR, Kotter 8-step)
- Scale the methodology to the organization's size and complexity
- Include industry-specific process standards where relevant (TOGAF for architecture, ISO 27001 for security, etc.)

### 4. Data Management with Real Regulations

❌ **WRONG:**
- "Data governance framework", "Master data management"

✅ **CORRECT:**
- Specific tools (Collibra, Informatica MDM, OneTrust) matched to scale and industry
- Reference actual regulations applicable to the industry and region (GDPR, HIPAA, Bokföringslagen, sector-specific)
- Data retention periods tied to specific laws

### 5. Governance with Real Frameworks

❌ **WRONG:**
- "Decision-making process", "Governance structure"

✅ **CORRECT:**
- Named frameworks (COBIT 2019, TOGAF ADM, ISO 31000) matched to organizational maturity
- Specific decision thresholds (e.g., investment amounts requiring board approval)
- Governance cadence (bi-weekly, quarterly) matching the organization's pace

### Output Format

Return ONLY valid JSON. No markdown, no prose.

```json
{
  "governance": {
    "decisionMakingFramework": "Specific governance framework and how it is applied",
    "architectureReviewProcess": "How architecture is reviewed and approved",
    "investmentPrioritization": "How investments are prioritized (NPV, ROI, strategic alignment)",
    "riskManagement": "Risk framework and processes with specific standards"
  },
  "organization": {
    "operatingModel": "Centralized | Decentralized | Federated | Hybrid",
    "keyRoles": ["Specific role title with FTE count or context", "..."],
    "teamStructures": ["Specific team with size and mandate", "..."],
    "skillsRequired": ["Specific skill with technology/domain context", "..."]
  },
  "processes": {
    "developmentMethodology": "Specific named methodology with version",
    "serviceManagement": "Specific ITSM approach and tooling",
    "changeManagement": "Named methodology with how it applies",
    "qualityAssurance": "Quality processes and standards"
  },
  "data": {
    "dataGovernance": "Specific data governance approach with tooling and regulations",
    "masterDataManagement": "MDM strategy, tools, and ownership",
    "dataRetention": "Retention policies with specific legal references",
    "dataQuality": "Quality measurement and improvement approach"
  },
  "technology": {
    "platforms": ["Named platform 1 with purpose and context", "Named platform 2", "..."],
    "infrastructure": "Cloud/on-premise strategy with specific providers and regions",
    "integration": "Integration pattern and named tools",
    "security": "Security architecture with specific identity providers and standards"
  }
}
```

## Quality Standards for Generated Operating Model

**What good output looks like:**
- Every platform should be a real, named product that organizations in this industry and region actually use
- Governance frameworks should match the organization's stated maturity and size
- Roles must be specific (title + sizing), not organizational units
- Data retention must cite applicable laws for the country/industry
- Infrastructure must name specific cloud regions where geography matters
- Integration pattern should reflect the capability maturity from Step 3

**Derive platforms from context:**
- Industry + region → narrow down to 3-5 realistic platform choices for each category
- Company size/maturity → select appropriately (enterprise SAP vs. mid-market Dynamics 365)
- Constraints from Strategic Intent → address legacy systems explicitly named or implied
- BMC key resources → these are often the platforms to name

**Regulatory alignment:**
- Identify the primary regulatory frameworks for the company's industry and region
- Reference data protection laws (GDPR for EU/EEA, HIPAA for US healthcare, etc.)
- Reference financial reporting laws if applicable (Bokföringslagen for Sweden, etc.)
- Reference industry-specific compliance (PCI DSS for payments, ISO 13485 for medical, etc.)

## Anti-Patterns (NEVER DO THIS)

❌ **Generic platform names:**
```json
"platforms": ["CRM", "ERP", "Cloud"]
```

✅ **Specific platforms matched to company context:**
```json
"platforms": [
  "Named ERP system appropriate to size and region",
  "Named CRM platform appropriate to industry",
  "Named cloud provider and region"
]
```

❌ **Vague roles:**
```json
"keyRoles": ["IT Team", "Business Team"]
```

✅ **Specific roles with counts:**
```json
"keyRoles": [
  "Enterprise Architecture CoE: [N] Business Architects, [N] Solution Architects",
  "Data & Analytics team: [N] FTEs with relevant specializations",
  "Industry-specific leadership role (CDO, DPO, etc.)"
]
```

❌ **No regulatory/legal references:**
```json
"dataRetention": "Data retained as needed"
```

✅ **Specific laws and timeframes:**
```json
"dataRetention": "Financial records [N] years ([applicable law]); Personal data [N] years (GDPR Art. 17 or sector-specific)"
```

## Validation Checklist

Before returning JSON:
- [ ] ALL platforms use REAL, named products appropriate to the industry/region
- [ ] Governance references specific named frameworks (COBIT, TOGAF, ISO 31000)
- [ ] Roles include FTE counts or team sizes
- [ ] Processes name specific methodologies (SAFe, ITIL 4, Prosci ADKAR)
- [ ] Data retention cites actual applicable laws
- [ ] Infrastructure names specific cloud providers and regions
- [ ] Integration tools are specifically named (not "middleware")
- [ ] Security references named identity providers and standards
- [ ] JSON is valid and matches schema from DATA_CONTRACT
- [ ] Content aligns with constraints from Strategic Intent

## Instructions

1. Extract constraints from Strategic Intent (legacy systems, budget, compliance deadlines, tech stack hints)
2. Determine industry-appropriate platforms from company size, industry, region, and stated constraints
3. Define governance frameworks matched to organizational maturity and regulatory environment
4. Define organization structure based on company size and digital transformation ambition
5. Specify processes with named methodologies appropriate to the scale
6. Include data governance with jurisdiction-specific regulatory references
7. List technology stack with REAL platform names inferred from context
8. Validate against checklist above
9. Return valid JSON matching schema

**CRITICAL:** This is Autopilot mode — be decisive and complete. Use real platform names from your knowledge of what organizations in this industry, size, and region actually use. Do not ask follow-up questions.
