# Unified Opportunity Data Model

**Version**: 2.0  
**Last Updated**: May 20, 2026  
**Status**: ✅ Harmonized across all opportunity types

---

## Overview

All opportunities in the Customer EA Opportunity Pipeline share the same unified data model, regardless of their source. This ensures consistency, predictability, and ease of maintenance.

## Three Opportunity Types

### 1. **Service Default Opportunities** 
- **Source**: System-generated on account creation
- **sourceType**: `'service-default'`
- **Location**: Backlog column (white background)
- **Count**: 8 services per account

### 2. **Manual User-Created Opportunities**
- **Source**: User via "+ New Opportunity" button
- **sourceType**: `'manual'`
- **Location**: Backlog column (light pink background)
- **Visual**: Pink left border, sorted to top

### 3. **AI-Generated Domain Opportunities** (Phase 3 - Future)
- **Source**: Automatic transformation from Business Domain recommendations
- **sourceType**: `'domain-recommendation'`
- **Location**: Discovery column (on creation)
- **Visual**: Green accent (TBD)

---

## Complete Data Model Schema

```javascript
{
  // ═══════════════════════════════════════════════════════════
  // CORE IDENTIFICATION
  // ═══════════════════════════════════════════════════════════
  id: "OPP-001" | "OPP-ACC-002-CLOUD-SERVICES",
  accountId: "ACC-002",
  name: "Cloud services",

  // ═══════════════════════════════════════════════════════════
  // STAGE & STATUS
  // ═══════════════════════════════════════════════════════════
  status: "backlog" | "discovery" | "qualify" | "propose" | "negotiate" | "close-won" | "close-lost",
  stage: "0-backlog" | "1-discovery" | "2-qualification" | "3-proposal" | "4-negotiation" | "5-closed",

  // ═══════════════════════════════════════════════════════════
  // SOURCE TRACKING (Phase 1)
  // ═══════════════════════════════════════════════════════════
  sourceType: "manual" | "service-default" | "domain-recommendation",

  // ═══════════════════════════════════════════════════════════
  // FINANCIAL
  // ═══════════════════════════════════════════════════════════
  estimatedValue: 180000,                 // € (number)
  probability: 50,                        // 0-100 (number)
  closeDate: "2026-12-30",               // ISO date string

  // ═══════════════════════════════════════════════════════════
  // STAKEHOLDERS
  // ═══════════════════════════════════════════════════════════
  sponsor: "CTO" | "?" | "TBD",

  // ═══════════════════════════════════════════════════════════
  // USER INPUT FIELDS (Phase 1) - Available for ALL types
  // ═══════════════════════════════════════════════════════════
  description: "string" | "",             // User-provided or default description
  recommendation: "string" | "",          // User-provided or default recommendation
  comments: "string" | "",                // User-provided additional comments

  // ═══════════════════════════════════════════════════════════
  // DOMAIN CONTEXT (Phase 2) - Only for AI-generated opportunities
  // ═══════════════════════════════════════════════════════════
  domainContext: {
    domainName: "Core insurance — life & pension",
    currentState: "LIV Backbone has broad business coverage...",
    targetState: "Consolidate overlapping capabilities...",
    linkedApps: ["PolicyAdmin", "ClaimsPro", "UnderwritingHub"],
    engagementId: "SEG-INS-2026Q2-001"
  } | null,

  // ═══════════════════════════════════════════════════════════
  // AI FIELDS (Phase 2) - Track AI generation and user refinement
  // ═══════════════════════════════════════════════════════════
  strategicRationale: "→ Identify duplicated capabilities..." | null,
  aiGenerated: false | true,              // true only for domain-recommendation
  refinedByUser: false | true,            // true after first user edit

  // ═══════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════
  linkedInitiatives: [],
  linkedEngagements: ["SEG-INS-2026Q2-001"] | [],

  // ═══════════════════════════════════════════════════════════
  // ADDITIONAL
  // ═══════════════════════════════════════════════════════════
  valueCase: null | "string",
  competitors: [],
  nextSteps: [],
  risks: [],

  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  metadata: {
    createdAt: "2026-05-20T10:30:00Z",
    updatedAt: "2026-05-20T10:30:00Z",
    createdBy: "system" | "user" | "system-ai",
    winReason: null | "string",
    lossReason: null | "string"
  }
}
```

---

## Field Comparison by Opportunity Type

| Field | Service Default | Manual User | AI-Generated (Phase 3) |
|-------|----------------|-------------|------------------------|
| **id** | Auto-generated | Auto-generated | Auto-generated |
| **accountId** | ✅ Required | ✅ Required | ✅ Required |
| **name** | ✅ Service name | ✅ User input | ✅ AI-generated |
| **status** | `backlog` | `backlog` | `discovery` |
| **stage** | `0-backlog` | `0-backlog` | `1-discovery` |
| **sourceType** | `service-default` | `manual` | `domain-recommendation` |
| **estimatedValue** | €100k-€200k | User input | AI-estimated |
| **probability** | 50% | User input (default 50%) | 30% (AI default) |
| **closeDate** | 2026-12-30 | User input | Today + 6 months |
| **sponsor** | `?` | User input | `TBD` |
| **description** | ✅ Default text | User input (optional) | AI-generated |
| **recommendation** | ✅ Default text | User input (optional) | Part of strategicRationale |
| **comments** | Empty | User input (optional) | Empty |
| **domainContext** | `null` | `null` | ✅ Full context |
| **strategicRationale** | `null` | `null` | ✅ AI recommendation |
| **aiGenerated** | `false` | `false` | `true` |
| **refinedByUser** | `false` | `false` | `false` (until edited) |
| **metadata.createdBy** | `system` | `user` | `system-ai` |

---

## Service Default Descriptions

All 8 service opportunities include meaningful default descriptions and recommendations:

### 1. AI Services (€150k)
**Description**: Artificial Intelligence and Machine Learning solutions to automate processes, enhance decision-making, and drive innovation.  
**Recommendation**: Assess current AI maturity and identify high-value use cases for pilot projects.

### 2. Enterprise Application (€200k)
**Description**: Core business applications including ERP, CRM, and industry-specific solutions to support business operations.  
**Recommendation**: Evaluate current application landscape and identify modernization opportunities.

### 3. Cloud Services (€180k)
**Description**: Cloud infrastructure and platform services for scalability, flexibility, and cost optimization.  
**Recommendation**: Develop cloud migration strategy and prioritize workloads for cloud adoption.

### 4. Cybersecurity (€120k)
**Description**: Comprehensive security solutions including threat detection, prevention, and compliance management.  
**Recommendation**: Conduct security assessment and implement zero-trust architecture.

### 5. Data & Analytics (€160k)
**Description**: Data management, analytics platforms, and business intelligence solutions for data-driven insights.  
**Recommendation**: Build data governance framework and establish analytics center of excellence.

### 6. Digital Development Services (€140k)
**Description**: Custom software development, API integration, and digital product engineering services.  
**Recommendation**: Establish agile development practices and API-first architecture.

### 7. Digital Workplace Services (€100k)
**Description**: Modern workplace solutions including collaboration tools, productivity suites, and employee experience platforms.  
**Recommendation**: Implement digital workplace strategy to enhance employee productivity and collaboration.

### 8. Sovereign IT Services (€130k)
**Description**: Sovereign IT solutions ensuring data residency, regulatory compliance, and digital independence.  
**Recommendation**: Review data sovereignty requirements and implement compliant IT infrastructure.

---

## Validation Rules

### Required Fields (All Types)
- `accountId`
- `name`
- `estimatedValue`
- `probability` (0-100)
- `closeDate`
- `status`

### Optional Fields
- `description` (recommended)
- `recommendation` (recommended)
- `comments`
- `sponsor`

### AI-Only Fields
- `domainContext` (only for `domain-recommendation`)
- `strategicRationale` (only for `domain-recommendation`)

---

## Backward Compatibility

✅ **All new fields have safe defaults**:
- `description`: defaults to `''`
- `recommendation`: defaults to `''`
- `comments`: defaults to `''`
- `domainContext`: defaults to `null`
- `strategicRationale`: defaults to `null`
- `aiGenerated`: defaults to `false`
- `refinedByUser`: defaults to `false`

✅ **Existing opportunities without new fields**:
- Will continue to work
- Fields added automatically by `EA_AccountManager.createOpportunity()`
- No data migration required

---

## User Refinement Tracking

When a user edits an AI-generated opportunity:

1. **First Edit**:
   - `refinedByUser` automatically set to `true`
   - `metadata.updatedAt` updated
   - Change is permanent

2. **Future AI Re-sync**:
   - Checks `refinedByUser` flag
   - If `true`: Skips update (preserves user edits)
   - If `false`: Updates from latest AI analysis

3. **Use Cases**:
   - Analytics: Track user engagement with AI recommendations
   - Conflict Resolution: Prevent overwriting user decisions
   - Audit Trail: Know which opportunities have been validated by humans

---

## Visual Indicators

### Opportunity Cards
- **White background**: Service default
- **Light pink background** (`#fce7f3`): Manual user-created
- **Green accent** (Phase 3): AI-generated domain opportunity

### Opportunity Details Modal
- **Gray box**: Description section
- **Yellow box**: Recommendation / Strategic Rationale section
- **Blue box**: Comments section
- **Green box**: Domain Context section (AI-only)
- **Purple badge**: "AI Generated" indicator

---

## Storage

**Location**: `localStorage`  
**Key Pattern**: `ea_opportunity_{OPPORTUNITY_ID}`  
**Example**: `ea_opportunity_OPP-ACC-002-CLOUD-SERVICES`

**Related Storage**:
- Accounts: `ea_account_{ACCOUNT_ID}`
- Domain Insights: `ea_three_lens_insights_business_{ENGAGEMENT_ID}`

---

## Future Enhancements (Phase 3)

### Domain Opportunity Creation
```javascript
// Example: AI-generated domain opportunity
{
  name: "Core Insurance Modernization",
  sourceType: "domain-recommendation",
  status: "discovery",                    // Created in Discovery (not Backlog)
  estimatedValue: 750000,                 // AI-estimated
  probability: 30,                        // Lower initial probability
  domainContext: {
    domainName: "Core insurance — life & pension",
    currentState: "...",
    targetState: "...",
    linkedApps: ["App1", "App2"],
    engagementId: "SEG-INS-2026Q2-001"
  },
  strategicRationale: "→ Consolidate overlapping capabilities...",
  aiGenerated: true,
  refinedByUser: false,
  metadata: {
    createdBy: "system-ai"
  }
}
```

---

## Verification Checklist

✅ **Data Model Consistency**:
- [x] All opportunity types share same schema
- [x] All fields explicitly set in all creation paths
- [x] No missing fields or inconsistencies

✅ **Service Defaults**:
- [x] 8 services with meaningful descriptions
- [x] Varied estimated values (€100k-€200k)
- [x] All new fields explicitly set to null/false

✅ **Manual Creation**:
- [x] All Phase 1 fields captured from form
- [x] All Phase 2 fields set to null/false
- [x] sourceType explicitly set to 'manual'

✅ **EA_AccountManager**:
- [x] createOpportunity() handles all fields
- [x] updateOpportunity() preserves all fields
- [x] Defaults set for missing fields
- [x] Helper method for refinement tracking

✅ **Display**:
- [x] Opportunity cards render consistently
- [x] Details modal displays all relevant fields
- [x] Domain context section conditional
- [x] AI-generated badge conditional

---

**Next Step**: Phase 3 - Automatic Domain Recommendation → Opportunity Transformation
