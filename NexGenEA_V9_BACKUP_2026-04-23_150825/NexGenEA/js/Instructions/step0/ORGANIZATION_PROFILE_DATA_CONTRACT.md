# Organization Profile Data Contract — Source of Truth

**Version:** 1.0  
**Date:** April 22, 2026  
**Purpose:** Define the canonical schema for comprehensive organization profiles

---

## Core Principle

The **Organization Profile** is a rich, structured representation of an organization stored in `model.organizationProfile`.

It serves as the **primary organizational context** for all EA workflow steps, enriching:
- Strategic Intent generation
- Business Model Canvas
- Capability Mapping
- Operating Model design
- Gap Analysis
- Value Pool identification
- Transformation Roadmap
- Executive Summary

When present, it **replaces or enhances** the minimal company description used in quick-start mode.

---

## Storage Location

```javascript
window.model.organizationProfile = { /* schema below */ }
```

---

## Primary Schema

```json
{
  "organizationProfile": {
    
    // ═══════════════════════════════════════════════════════════
    // CORE IDENTITY
    // ═══════════════════════════════════════════════════════════
    "organizationName": "string",
    "legalName": "string (optional)",
    "industry": "string (REQUIRED)",
    "sector": ["string"],
    "headquarters": {
      "city": "string",
      "country": "string",
      "region": "Europe|North America|Asia|etc."
    },
    "founded": "number (year)",
    "companySize": {
      "employees": "number",
      "sizeCategory": "SME|Mid-Market|Enterprise|Large Enterprise",
      "locations": "number",
      "countries": ["string"]
    },

    // ═══════════════════════════════════════════════════════════
    // BUSINESS OVERVIEW
    // ═══════════════════════════════════════════════════════════
    "missionStatement": "string (1-2 sentences)",
    "visionStatement": "string (1-2 sentences)",
    "coreValues": ["string"],
    "businessModel": {
      "type": "B2B|B2C|B2B2C|B2G|Marketplace|Platform|Hybrid",
      "revenueModel": "Subscription|Transaction|License|Services|Advertising|Hybrid",
      "keyRevenueSources": ["string"]
    },

    // ═══════════════════════════════════════════════════════════
    // PRODUCTS & SERVICES
    // ═══════════════════════════════════════════════════════════
    "offerings": [
      {
        "name": "string",
        "type": "Product|Service|Solution|Platform",
        "description": "string (1-2 sentences)",
        "targetMarket": "string",
        "revenueContribution": "High|Medium|Low"
      }
    ],

    // ═══════════════════════════════════════════════════════════
    // MARKET POSITION
    // ═══════════════════════════════════════════════════════════
    "markets": {
      "primaryMarkets": ["string"],
      "geographicPresence": "Local|Regional|National|International|Global",
      "marketPosition": "Leader|Challenger|Niche Player|Emerging|Disruptor",
      "competitiveLandscape": "string (2-3 sentences)",
      "keyCompetitors": ["string"],
      "differentiators": ["string"]
    },

    // ═══════════════════════════════════════════════════════════
    // CUSTOMER BASE
    // ═══════════════════════════════════════════════════════════
    "customers": {
      "segments": ["string"],
      "keyAccounts": ["string (optional)"],
      "customerCount": "number (optional)",
      "retentionRate": "string (optional, e.g., '85%')",
      "npsScore": "number (optional)"
    },

    // ═══════════════════════════════════════════════════════════
    // ORGANIZATIONAL STRUCTURE
    // ═══════════════════════════════════════════════════════════
    "structure": {
      "type": "Functional|Divisional|Matrix|Flat|Network|Hybrid",
      "departments": ["string"],
      "keyRoles": ["string"],
      "governanceModel": "Centralized|Decentralized|Federated|Hybrid",
      "decisionMaking": "string (description of decision-making approach)"
    },

    // ═══════════════════════════════════════════════════════════
    // CULTURE & VALUES
    // ═══════════════════════════════════════════════════════════
    "culture": {
      "workStyle": "Remote|Hybrid|On-site|Flexible",
      "innovationCulture": "Conservative|Balanced|Progressive|Cutting-edge",
      "riskAppetite": "Low|Medium|High",
      "changeReadiness": "Low|Medium|High|Very High",
      "culturalNotes": "string (additional context)"
    },

    // ═══════════════════════════════════════════════════════════
    // STRATEGIC CONTEXT
    // ═══════════════════════════════════════════════════════════
    "strategicPriorities": [
      {
        "priority": "string",
        "description": "string",
        "timeframe": "Short-term (0-12m)|Mid-term (1-3yr)|Long-term (3yr+)",
        "importance": "Critical|High|Medium"
      }
    ],

    // ═══════════════════════════════════════════════════════════
    // CHALLENGES & OPPORTUNITIES
    // ═══════════════════════════════════════════════════════════
    "challenges": [
      {
        "challenge": "string (title)",
        "category": "Market|Technology|Operational|Financial|Regulatory|Talent|Cultural",
        "severity": "Critical|High|Medium|Low",
        "description": "string (details)"
      }
    ],
    "opportunities": [
      {
        "opportunity": "string (title)",
        "category": "Market Expansion|Technology|Digital Transformation|Innovation|M&A|New Products",
        "potential": "High|Medium|Low",
        "description": "string (details)"
      }
    ],

    // ═══════════════════════════════════════════════════════════
    // CONSTRAINTS
    // ═══════════════════════════════════════════════════════════
    "constraints": [
      {
        "type": "Budget|Technology|Regulatory|Skills|Time|Cultural|Vendor Lock-in",
        "description": "string (specific constraint)",
        "impact": "High|Medium|Low",
        "mitigation": "string (optional - how to address)"
      }
    ],

    // ═══════════════════════════════════════════════════════════
    // TECHNOLOGY & SYSTEMS
    // ═══════════════════════════════════════════════════════════
    "technologyLandscape": {
      "coreSystems": ["string (system names)"],
      "legacySystems": ["string (system names)"],
      "cloudAdoption": "None|Hybrid|Cloud-first|Cloud-native",
      "dataMaturity": "Low|Medium|High|Advanced",
      "aiAdoption": "None|Exploring|Piloting|Scaling|Mature",
      "techDebt": "Low|Medium|High|Critical",
      "technologyNotes": "string (additional context)"
    },

    // ═══════════════════════════════════════════════════════════
    // FINANCIAL CONTEXT
    // ═══════════════════════════════════════════════════════════
    "financial": {
      "revenue": "string (e.g., '€50M ARR', 'SEK 500M')",
      "growth": "string (e.g., '25% YoY', 'Break-even')",
      "profitability": "Profitable|Break-even|Scaling|Startup",
      "fundingStage": "Bootstrap|Seed|Series A-F|Public|Private Equity|PE-backed",
      "investmentCapacity": "Limited|Moderate|Strong|Significant"
    },

    // ═══════════════════════════════════════════════════════════
    // REGULATORY & COMPLIANCE
    // ═══════════════════════════════════════════════════════════
    "regulatory": {
      "frameworks": ["GDPR|SOX|HIPAA|ISO 27001|etc."],
      "certifications": ["string"],
      "complianceRequirements": ["string (specific requirements)"],
      "regulatoryPressure": "Low|Medium|High"
    },

    // ═══════════════════════════════════════════════════════════
    // STAKEHOLDERS
    // ═══════════════════════════════════════════════════════════
    "stakeholders": [
      {
        "group": "Executives|Board|Employees|Customers|Partners|Investors|Regulators",
        "keyIndividuals": ["string (names/titles)"],
        "influence": "High|Medium|Low",
        "concerns": ["string"]
      }
    ],

    // ═══════════════════════════════════════════════════════════
    // EXECUTIVE SUMMARY (AI-GENERATED)
    // ═══════════════════════════════════════════════════════════
    "executiveSummary": {
      "oneLinePitch": "string (elevator pitch, max 150 chars)",
      "threeKeyFacts": ["string", "string", "string"],
      "strategicNarrative": "string (2-3 paragraphs)",
      "transformationReadiness": "Low|Medium|High|Very High"
    },

    // ═══════════════════════════════════════════════════════════
    // METADATA
    // ═══════════════════════════════════════════════════════════
    "metadata": {
      "createdAt": "timestamp (Date.now())",
      "updatedAt": "timestamp",
      "processedBy": "AI|Manual",
      "completeness": "number (0-100, percentage)",
      "source": "User summary|Interview|Import|API",
      "version": "1.0",
      "originalSummary": "string (store original user input for reference)"
    }
  }
}
```

---

## Field Specifications

### REQUIRED Fields
These fields MUST be present for a valid Organization Profile:

- `organizationName` — Company name
- `industry` — Industry/sector
- `companySize.employees` — Employee count (estimate if exact unknown)
- `companySize.sizeCategory` — Size classification
- `strategicPriorities` — At least 1 priority
- `challenges` — At least 1 challenge
- `metadata.createdAt` — Timestamp
- `metadata.completeness` — Completeness score

### OPTIONAL Fields
All other fields are optional but recommended for completeness > 70%.

### Completeness Scoring

**Calculation Logic:**
```javascript
function calculateCompleteness(profile) {
  const weights = {
    coreIdentity: 15,        // name, industry, size
    businessOverview: 15,    // mission, vision, business model
    offerings: 10,           // products/services
    markets: 10,            // market position, competitors
    strategicPriorities: 15, // priorities (CRITICAL)
    challenges: 10,         // challenges & opportunities
    structure: 10,          // organizational structure
    technology: 10,         // tech landscape
    financial: 5            // financial context
  };
  
  let score = 0;
  
  // Score each section based on populated fields
  if (profile.organizationName && profile.industry) score += weights.coreIdentity;
  if (profile.missionStatement && profile.visionStatement) score += weights.businessOverview;
  // ... continue for all sections
  
  return Math.min(100, score);
}
```

**Thresholds:**
- **< 40%**: Too incomplete — suggest specific missing areas
- **40-60%**: Minimal — workflow can proceed but with warnings
- **60-80%**: Good — sufficient for quality EA generation
- **80-100%**: Excellent — rich context enables high-quality outputs

---

## Usage in Workflow Steps

### Step 1: Strategic Intent
If `organizationProfile` exists and completeness > 60%:
- **Skip or shorten** questionnaire
- Use profile data directly for Strategic Intent generation
- Extract: strategic priorities, challenges, opportunities, constraints

### Step 2: Business Model Canvas
Use profile for:
- **Value Proposition**: From mission, offerings, differentiators
- **Customer Segments**: From customers, markets
- **Revenue Streams**: From businessModel.revenueModel
- **Key Resources**: From technologyLandscape, structure
- **Key Partners**: From stakeholders

### Step 3: Capability Map
Use profile for:
- **Domain identification**: From offerings, structure.departments
- **Strategic importance**: From strategicPriorities
- **Current maturity**: From technology.techDebt, challenges

### Step 4: Operating Model
Use profile for:
- **Current state**: From structure, technologyLandscape
- **Governance**: From structure.governanceModel
- **Value streams**: From offerings, markets
- **Process model**: From challenges (bottlenecks)

### Step 5: Gap Analysis
Use profile for:
- **Current state baseline**: From challenges, technologyLandscape
- **Constraints**: From constraints array
- **Change readiness**: From culture.changeReadiness

### Step 6: Value Pools
Use profile for:
- **Opportunity identification**: From opportunities array
- **Financial impact estimation**: From financial data
- **Feasibility assessment**: From constraints, culture.riskAppetite

### Step 7: Transformation Roadmap
Use profile for:
- **Phasing**: From strategicPriorities.timeframe
- **Prioritization**: From strategicPriorities.importance
- **Resource planning**: From financial.investmentCapacity

---

## AI Assistant Integration

The AI Assistant MUST reference `organizationProfile` when answering user questions:

```javascript
function buildAIContext() {
  const profile = window.model.organizationProfile;
  
  if (!profile) return 'No organization profile available.';
  
  return `
ORGANIZATION CONTEXT:
- Company: ${profile.organizationName}
- Industry: ${profile.industry}
- Size: ${profile.companySize.employees} employees (${profile.companySize.sizeCategory})
- Mission: ${profile.missionStatement}
- Strategic Priorities: ${profile.strategicPriorities.map(p => p.priority).join(', ')}
- Key Challenges: ${profile.challenges.map(c => c.challenge).join(', ')}
- Technology Maturity: Cloud=${profile.technologyLandscape.cloudAdoption}, AI=${profile.technologyLandscape.aiAdoption}

Use this as PRIMARY context when answering user questions about the organization.
`;
}
```

---

## Validation Rules

### Syntax Validation
- All JSON keys must match schema exactly (case-sensitive)
- Enum values must match allowed options (e.g., "High", not "high")
- Arrays must contain specified types
- Required fields must not be null/undefined

### Semantic Validation
- `strategicPriorities` should have 3-6 items (not 1 or 20)
- `challenges` should be specific, not vague ("Legacy system X" not "old systems")
- `constraints` should include concrete details (budget amounts, specific regulations)
- `differentiators` should be meaningful, not generic marketing speak

### Completeness Warnings
If completeness < 60%, warn user:
```
⚠️ Organization Profile is incomplete (45%)

Missing critical information:
- Mission and vision statements
- Strategic priorities (only 1 provided, recommend 3-5)
- Technology landscape details
- Financial context

You can proceed, but AI-generated outputs may be less accurate.
Would you like to add more details?
```

---

## Export / Import

### Export Format
When exporting the EA model, include `organizationProfile` at root level:

```json
{
  "projectName": "...",
  "organizationProfile": { /* full profile */ },
  "strategicIntent": { /* ... */ },
  "bmc": { /* ... */ }
}
```

### Import Handling
When importing:
1. Validate schema compliance
2. Calculate completeness
3. Update metadata.updatedAt
4. Mark source as "Import"

---

## Versioning

**Current Version**: 1.0 (April 2026)

**Future Enhancements (v1.1+)**:
- Partnership ecosystem mapping
- ESG/sustainability metrics
- Innovation portfolio tracking
- Competitive intelligence integration
- Historical performance tracking

---

## Related Contracts

- [STRATEGIC_INTENT_DATA_CONTRACT.md](../step1/STRATEGIC_INTENT_DATA_CONTRACT.md)
- [BMC_DATA_CONTRACT.md](../step2/BMC_DATA_CONTRACT.md)
- [CAPABILITY_MAP_DATA_CONTRACT.md](../step3/CAPABILITY_MAP_DATA_CONTRACT.md)
- [OPERATING_MODEL_DATA_CONTRACT.md](../step4/OPERATING_MODEL_DATA_CONTRACT.md)

---

**End of Data Contract**
