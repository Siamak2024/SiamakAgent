/**
 * EA Engagement Playbook — Canonical Data Model Schema
 * Defines 14 core entities for structured engagement management
 * 
 * @version 1.0
 * @date 2026-04-17
 */

// ═══════════════════════════════════════════════════════════════════
// ENTITY TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Engagement Entity
 * Top-level engagement metadata and governance
 */
const EngagementSchema = {
  id: { type: 'string', required: true, pattern: /^[A-Z]{3}-[A-Z]{3}-\d{4}Q\d-\d{3}$/ }, // e.g., SEG-INS-2026Q2-001
  name: { type: 'string', required: true },
  customerName: { type: 'string', required: false }, // Customer organization name
  segment: { type: 'string', required: true, enum: ['Insurance', 'Banking', 'Manufacturing', 'Retail', 'Healthcare', 'Public Sector', 'Custom'] },
  theme: { type: 'string', required: true },
  customers: { type: 'array', required: true, items: 'string' }, // Customer IDs
  status: { type: 'string', required: true, enum: ['draft', 'active', 'paused', 'completed', 'archived'], default: 'draft' },
  sprintCadence: { type: 'string', required: true, enum: ['1w', '2w', '3w', '4w'], default: '2w' },
  governance: {
    type: 'object',
    required: true,
    properties: {
      decisionForum: { type: 'string', required: true },
      reviewCadence: { type: 'string', required: true },
      raciRef: { type: 'string' } // Reference to RACI artifact
    }
  },
  successCriteria: { type: 'array', required: true, items: 'string' },
  startDate: { type: 'string', format: 'date' },
  endDate: { type: 'string', format: 'date' },
  metadata: {
    type: 'object',
    properties: {
      createdAt: { type: 'string', format: 'datetime' },
      updatedAt: { type: 'string', format: 'datetime' },
      createdBy: { type: 'string' },
      completeness: { type: 'number', min: 0, max: 100 }
    }
  }
};

/**
 * Customer Entity
 * Customer organization details
 */
const CustomerSchema = {
  id: { type: 'string', required: true, pattern: /^CUST-\d{3}$/ },
  name: { type: 'string', required: true },
  industry: { type: 'string', required: true },
  size: { type: 'string', enum: ['SME', 'MidMarket', 'Enterprise', 'Global'] },
  region: { type: 'string', required: true },
  contactPerson: { type: 'string' },
  contactEmail: { type: 'string', format: 'email' },
  description: { type: 'string' },
  strategicPriorities: { type: 'array', items: 'string' }
};

/**
 * Segment Entity
 * Segment template library for reusable patterns
 */
const SegmentSchema = {
  id: { type: 'string', required: true },
  name: { type: 'string', required: true },
  description: { type: 'string' },
  isDefault: { type: 'boolean', default: false },
  referenceArchitectures: { type: 'array', items: 'string' },
  commonPrinciples: { type: 'array', items: 'string' },
  typicalWhiteSpots: { type: 'array', items: 'string' },
  standardThemes: { type: 'array', items: 'string' },
  metadata: {
    type: 'object',
    properties: {
      createdAt: { type: 'string', format: 'datetime' },
      usageCount: { type: 'number', default: 0 }
    }
  }
};

/**
 * Phase Entity
 * Agile phase/epic structure (E0-E5)
 */
const PhaseSchema = {
  id: { type: 'string', required: true, pattern: /^E\d$/ }, // E0, E1, E2, E3, E4, E5
  name: { type: 'string', required: true },
  description: { type: 'string', required: true },
  status: { type: 'string', required: true, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
  startDate: { type: 'string', format: 'date' },
  endDate: { type: 'string', format: 'date' },
  stories: { type: 'array', items: 'string' }, // Story IDs
  order: { type: 'number', required: true }
};

/**
 * Story Entity
 * User story within a phase (1 story = 1 EA outcome)
 */
const StorySchema = {
  id: { type: 'string', required: true, pattern: /^STORY-\d{4}$/ },
  phaseId: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string' },
  acceptanceCriteria: { type: 'array', items: 'string' },
  status: { type: 'string', required: true, enum: ['backlog', 'in-progress', 'review', 'done'], default: 'backlog' },
  assignedTo: { type: 'string' },
  artifactId: { type: 'string' }, // Link to generated artifact
  evidenceRefs: { type: 'array', items: 'string' }
};

/**
 * Stakeholder Entity
 * Stakeholder management with influence mapping and relationship tracking
 * 
 * Type definitions:
 * - internal: Technical staff from Vivicta (IT service provider) - Enterprise Architects, Solution Architects, Technical Leads
 * - engagement-team: Customer-facing roles from Vivicta Marketing/Sales - Account Managers, Sales Representatives, Customer Success
 * - customer: Stakeholders from the client organization receiving services
 */
const StakeholderSchema = {
  id: { type: 'string', required: true, pattern: /^STK-\d{3}$/ },
  name: { type: 'string', required: true },
  role: { type: 'string', required: true },
  orgUnit: { type: 'string', required: true },
  type: { 
    type: 'string', 
    required: true, 
    enum: ['internal', 'engagement-team', 'customer'], 
    default: 'internal',
    description: 'internal=Vivicta IT staff | engagement-team=Vivicta Marketing/Sales | customer=Client organization'
  },
  influence: { type: 'string', required: true, enum: ['high', 'medium', 'low'] },
  decisionPower: { type: 'string', required: true, enum: ['high', 'medium', 'low'] },
  priorities: { type: 'array', required: true, items: 'string' },
  customerRelationships: { 
    type: 'array', 
    items: 'string',
    description: 'Array of customer stakeholder IDs that this internal/engagement-team member works with'
  },
  notes: { type: 'string' },
  contactEmail: { type: 'string', format: 'email' },
  workshopAttendance: { type: 'array', items: 'string' } // Workshop dates
};

/**
 * Application Entity
 * Application portfolio items (can import from APM Toolkit)
 * UNIFIED SCHEMA: Compatible with APM Toolkit for seamless import/export
 */
const ApplicationSchema = {
  // Core identifiers (supports both EA and APM ID patterns)
  id: { type: 'string', required: true }, // Pattern: APP-\d{3} (EA) or app_\d+ (APM)
  name: { type: 'string', required: true },
  description: { type: 'string' },
  
  // Organizational context
  businessDomain: { type: 'string', required: true }, // EA: domain, APM: maps to department
  department: { type: 'string' }, // APM field
  owner: { type: 'string' },
  vendor: { type: 'string' },
  technology: { type: 'string' }, // APM: technology stack (e.g., ".NET", "Java")
  
  // Lifecycle management
  lifecycle: { type: 'string', required: true, enum: ['tolerate', 'invest', 'migrate', 'retire', 'phaseIn', 'active', 'legacy', 'phaseOut', 'retired'] }, // EA + APM enums
  action: { type: 'string', enum: ['retain', 'invest', 'replace', 'consolidate', 'retire'] }, // APM: recommended action
  sunsetCandidate: { type: 'boolean', default: false }, // EA specific
  modernizationCandidate: { type: 'boolean', default: false }, // EA specific
  
  // Financial data (supports both combined and separate formats)
  currency: { type: 'string', enum: ['SEK', 'EUR', 'USD'], default: 'SEK' },
  capex: { type: 'number' }, // APM: average yearly license cost
  opex: { type: 'number' }, // APM: average yearly support/consulting cost
  annualCost: { type: 'number' }, // EA: combined cost (calculated from capex+opex if not provided)
  
  // Quality and risk assessment
  riskLevel: { type: 'string', required: true, enum: ['critical', 'high', 'medium', 'low'] },
  technicalDebt: { type: 'string', required: true, enum: ['critical', 'high', 'medium', 'low'] },
  technicalFit: { type: 'number', min: 1, max: 10 }, // APM: 1-10 scale
  businessValue: { type: 'number', min: 1, max: 10 }, // APM: 1-10 scale
  regulatorySensitivity: { type: 'string', enum: ['high', 'medium', 'low'] },
  
  // User and adoption metrics
  users: { type: 'number' }, // APM: active user count
  
  // AI transformation readiness
  aiMaturity: { type: 'number', min: 1, max: 5 }, // APM: 1-5 scale
  aiPotential: { type: 'string', enum: ['High', 'Medium', 'Low'] },
  
  // Capability mapping
  businessCapabilities: { type: 'array', items: 'string' }, // APM: array of capability IDs
  linkedCapabilities: { type: 'array', items: 'string' }, // EA: array of capability IDs (alias)
  
  // EA-specific relationships
  constraints: { type: 'array', items: 'string' }, // Constraint IDs
  evidenceRefs: { type: 'array', items: 'string' },
  
  // Additional notes
  notes: { type: 'string' },
  
  // Metadata
  metadata: {
    type: 'object',
    properties: {
      createdAt: { type: 'string', format: 'datetime' },
      updatedAt: { type: 'string', format: 'datetime' },
      createdBy: { type: 'string' },
      source: { type: 'string', enum: ['EA', 'APM', 'Manual'], default: 'Manual' }, // Track data origin
      apmId: { type: 'string' }, // Original APM ID if imported
      eaId: { type: 'string' } // Original EA ID if exported
    }
  }
};

/**
 * Capability Entity
 * Business capability gaps and mapping
 */
const CapabilitySchema = {
  id: { type: 'string', required: true, pattern: /^CAP-\d{3}$/ },
  name: { type: 'string', required: true },
  level: { type: 'string', required: true, enum: ['L1', 'L2', 'L3'] },
  parentId: { type: 'string' }, // Parent capability for L2/L3
  domain: { type: 'string', required: true },
  maturity: { type: 'number', required: true, min: 1, max: 5 },
  targetMaturity: { type: 'number', min: 1, max: 5 },
  gap: { type: 'number' }, // Calculated: targetMaturity - maturity
  strategicImportance: { type: 'string', required: true, enum: ['critical', 'high', 'medium', 'low'] },
  linkedApplications: { type: 'array', items: 'string' }, // App IDs
  description: { type: 'string' }
};

/**
 * Risk Entity
 * Risk register for engagement
 */
const RiskSchema = {
  id: { type: 'string', required: true, pattern: /^RISK-\d{3}$/ },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  category: { type: 'string', required: true, enum: ['technical', 'business', 'regulatory', 'organizational', 'financial', 'timeline'] },
  probability: { type: 'string', required: true, enum: ['high', 'medium', 'low'] },
  impact: { type: 'string', required: true, enum: ['high', 'medium', 'low'] },
  severity: { type: 'number' }, // Calculated score
  status: { type: 'string', required: true, enum: ['open', 'mitigating', 'closed', 'accepted'], default: 'open' },
  owner: { type: 'string', required: true },
  mitigationPlan: { type: 'string' },
  relatedObjects: { type: 'array', items: 'string' }, // App IDs, Initiative IDs, etc.
  identifiedDate: { type: 'string', format: 'date' },
  lastReviewDate: { type: 'string', format: 'date' }
};

/**
 * Constraint Entity
 * Project constraints and limitations
 */
const ConstraintSchema = {
  id: { type: 'string', required: true, pattern: /^CON-\d{3}$/ },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  type: { type: 'string', required: true, enum: ['regulatory', 'technical', 'budgetary', 'timeline', 'resource', 'organizational'] },
  severity: { type: 'string', required: true, enum: ['critical', 'high', 'medium', 'low'] },
  relatedObjects: { type: 'array', items: 'string' },
  workaround: { type: 'string' },
  owner: { type: 'string' }
};

/**
 * Decision Entity
 * Decision log with approval tracking
 */
const DecisionSchema = {
  id: { type: 'string', required: true, pattern: /^DEC-\d{3}$/ },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  status: { type: 'string', required: true, enum: ['proposed', 'under-review', 'approved', 'rejected', 'deferred'], default: 'proposed' },
  owner: { type: 'string', required: true },
  decisionDate: { type: 'string', format: 'date' },
  reviewDate: { type: 'string', format: 'date' },
  impact: { type: 'string', required: true },
  rationale: { type: 'string' },
  relatedObjects: { type: 'array', items: 'string' }, // Apps, initiatives, roadmap items
  alternatives: { type: 'array', items: 'string' },
  evidenceRefs: { type: 'array', items: 'string' }
};

/**
 * Assumption Entity
 * Assumptions log with validation tracking
 */
const AssumptionSchema = {
  id: { type: 'string', required: true, pattern: /^ASM-\d{3}$/ },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  status: { type: 'string', required: true, enum: ['active', 'validated', 'invalidated', 'retired'], default: 'active' },
  validationDate: { type: 'string', format: 'date' },
  validatedBy: { type: 'string' },
  impact: { type: 'string', required: true, enum: ['high', 'medium', 'low'] },
  relatedObjects: { type: 'array', items: 'string' },
  evidenceRefs: { type: 'array', items: 'string' }
};

/**
 * Initiative Entity
 * Investment options and transformation initiatives
 */
const InitiativeSchema = {
  id: { type: 'string', required: true, pattern: /^INIT-\d{3}$/ },
  name: { type: 'string', required: true },
  description: { type: 'string' },
  linkedThemes: { type: 'array', required: true, items: 'string' },
  businessOutcomes: { type: 'array', required: true, items: 'string' },
  valueType: { type: 'array', required: true, items: { enum: ['cost', 'risk', 'speed', 'compliance', 'revenue', 'quality'] } },
  timeHorizon: { type: 'string', required: true, enum: ['short', 'mid', 'long'] }, // short: 0-12mo, mid: 12-24mo, long: 24mo+
  status: { type: 'string', required: true, enum: ['option', 'planned', 'approved', 'in-progress', 'completed', 'cancelled'], default: 'option' },
  dependencies: { type: 'array', items: 'string' }, // Initiative IDs
  risks: { type: 'array', items: 'string' }, // Risk IDs
  effort: { type: 'string', enum: ['S', 'M', 'L', 'XL'] },
  estimatedCost: { type: 'number' },
  estimatedValue: { type: 'number' },
  owner: { type: 'string' },
  approvedBy: { type: 'string' },
  approvalDate: { type: 'string', format: 'date' }
};

/**
 * RoadmapItem Entity
 * Roadmap timeline items
 */
const RoadmapItemSchema = {
  id: { type: 'string', required: true, pattern: /^RM-\d{3}$/ },
  initiativeId: { type: 'string', required: true }, // Must reference an Initiative
  name: { type: 'string', required: true },
  quarter: { type: 'string', required: true, pattern: /^\d{4}Q[1-4]$/ }, // e.g., 2026Q2
  wave: { type: 'number' },
  status: { type: 'string', required: true, enum: ['planned', 'active', 'completed', 'delayed', 'cancelled'], default: 'planned' },
  startDate: { type: 'string', format: 'date' },
  endDate: { type: 'string', format: 'date' },
  dependencies: { type: 'array', items: 'string' }, // RoadmapItem IDs
  milestones: { type: 'array', items: 'object' }
};

/**
 * ArchitectureView Entity
 * AS-IS and Target architecture views
 */
const ArchitectureViewSchema = {
  id: { type: 'string', required: true, pattern: /^ARCH-\d{3}$/ },
  name: { type: 'string', required: true },
  type: { type: 'string', required: true, enum: ['as-is', 'target', 'transition'] },
  description: { type: 'string' },
  principles: { type: 'array', items: 'string' },
  patterns: { type: 'array', items: 'string' },
  diagramUrl: { type: 'string' }, // URL or base64 data
  diagramType: { type: 'string', enum: ['capability-map', 'application-landscape', 'data-flow', 'integration', 'reference-architecture'] },
  linkedCapabilities: { type: 'array', items: 'string' },
  linkedApplications: { type: 'array', items: 'string' },
  metadata: {
    type: 'object',
    properties: {
      createdAt: { type: 'string', format: 'datetime' },
      version: { type: 'string' }
    }
  }
};

/**
 * Artifact Entity
 * Generated outputs and deliverables
 */
const ArtifactSchema = {
  id: { type: 'string', required: true, pattern: /^ART-\d{3}$/ },
  name: { type: 'string', required: true },
  type: { type: 'string', required: true, enum: ['customer-document', 'leadership-view', 'sales-extract', 'workshop-notes', 'raci', 'other'] },
  format: { type: 'string', required: true, enum: ['markdown', 'html', 'pdf', 'pptx', 'json', 'xlsx'] },
  content: { type: 'string' }, // For markdown/html/json
  url: { type: 'string' }, // For external files
  generatedBy: { type: 'string', enum: ['ai', 'manual', 'template'] },
  generatedAt: { type: 'string', format: 'datetime' },
  version: { type: 'string' },
  status: { type: 'string', enum: ['draft', 'review', 'approved', 'published'], default: 'draft' }
};

// ═══════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════

const ValidationRules = {
  // Core model completeness checks
  engagement: {
    required: ['id', 'name', 'segment', 'theme', 'customers', 'status', 'governance', 'successCriteria'],
    checks: [
      { field: 'customers', rule: 'minLength', value: 1, message: 'At least one customer is required' },
      { field: 'successCriteria', rule: 'minLength', value: 1, message: 'At least one success criterion is required' },
      { field: 'governance.decisionForum', rule: 'required', message: 'Decision forum must be defined' },
      { field: 'governance.reviewCadence', rule: 'required', message: 'Review cadence must be defined' }
    ]
  },
  
  initiative: {
    required: ['id', 'name', 'linkedThemes', 'businessOutcomes', 'valueType', 'timeHorizon'],
    checks: [
      { field: 'businessOutcomes', rule: 'minLength', value: 1, message: 'At least one business outcome is required' },
      { field: 'linkedThemes', rule: 'minLength', value: 1, message: 'At least one theme is required' },
      { field: 'valueType', rule: 'minLength', value: 1, message: 'At least one value type is required' }
    ]
  },
  
  roadmapItem: {
    required: ['id', 'initiativeId', 'name', 'quarter', 'status'],
    checks: [
      { field: 'initiativeId', rule: 'referenceExists', entity: 'initiative', message: 'Must reference a valid initiative' }
    ]
  },
  
  decision: {
    required: ['id', 'title', 'description', 'status', 'owner', 'impact'],
    checks: [
      { field: 'owner', rule: 'required', message: 'Decision owner must be assigned' },
      { field: 'decisionDate', rule: 'requiredIfStatus', status: ['approved', 'rejected'], message: 'Decision date required for approved/rejected decisions' }
    ]
  },
  
  application: {
    required: ['id', 'name', 'businessDomain', 'lifecycle', 'riskLevel', 'technicalDebt'],
    checks: []
  },
  
  stakeholder: {
    required: ['id', 'name', 'role', 'orgUnit', 'influence', 'decisionPower', 'priorities'],
    checks: [
      { field: 'priorities', rule: 'minLength', value: 1, message: 'At least one priority is required' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════
// DEFAULT VALUES AND ENUMS
// ═══════════════════════════════════════════════════════════════════

const DefaultPhases = [
  { id: 'E0', name: 'Initiation & Setup', description: 'Engagement setup, stakeholder identification, governance establishment', order: 0 },
  { id: 'E1', name: 'AS-IS Assessment', description: 'Current state analysis, portfolio assessment, white-spot identification', order: 1 },
  { id: 'E2', name: 'White-Spot & Opportunity Analysis', description: 'Gap analysis, capability maturity, opportunity prioritization', order: 2 },
  { id: 'E3', name: 'Customer Validation & Alignment', description: 'Stakeholder workshops, decision alignment, constraint validation', order: 3 },
  { id: 'E4', name: 'Target EA Vision', description: 'Future state design, architecture principles, reference patterns', order: 4 },
  { id: 'E5', name: 'Roadmap & Enablement', description: 'Initiative sequencing, roadmap approval, enablement planning', order: 5 }
];

const DefaultSegmentTemplates = [
  {
    id: 'seg-insurance',
    name: 'Insurance',
    description: 'Insurance sector EA engagement patterns',
    isDefault: true,
    referenceArchitectures: ['Core Insurance Platform', 'Policy Administration', 'Claims Processing', 'Underwriting System'],
    commonPrinciples: ['Risk-based architecture', 'Regulatory compliance first', 'Customer data protection', 'Real-time decisioning'],
    typicalWhiteSpots: ['Legacy policy systems', 'Fragmented customer data', 'Manual underwriting processes', 'Compliance gaps'],
    standardThemes: ['Digital customer experience', 'Core system modernization', 'Risk & compliance automation', 'Data platform consolidation']
  },
  {
    id: 'seg-banking',
    name: 'Banking',
    description: 'Banking sector EA engagement patterns',
    isDefault: true,
    referenceArchitectures: ['Core Banking Platform', 'Payment Processing', 'Digital Banking', 'Risk Management'],
    commonPrinciples: ['Security by design', 'API-first architecture', 'Real-time processing', 'Regulatory compliance'],
    typicalWhiteSpots: ['Mainframe dependency', 'Siloed customer data', 'Legacy payment systems', 'Manual compliance processes'],
    standardThemes: ['Open banking enablement', 'Core banking modernization', 'Customer 360 platform', 'Compliance automation']
  },
  {
    id: 'seg-manufacturing',
    name: 'Manufacturing',
    description: 'Manufacturing sector EA engagement patterns',
    isDefault: true,
    referenceArchitectures: ['ERP System', 'MES/MOM', 'Supply Chain Platform', 'IoT/OT Integration'],
    commonPrinciples: ['Industry 4.0 readiness', 'OT/IT convergence', 'Supply chain visibility', 'Sustainability tracking'],
    typicalWhiteSpots: ['Legacy ERP systems', 'Disconnected shop floor', 'Limited supply chain visibility', 'Manual quality processes'],
    standardThemes: ['Digital factory transformation', 'Smart supply chain', 'Predictive maintenance', 'Sustainability reporting']
  },
  {
    id: 'seg-retail',
    name: 'Retail',
    description: 'Retail sector EA engagement patterns',
    isDefault: true,
    referenceArchitectures: ['E-commerce Platform', 'POS System', 'Inventory Management', 'Customer Loyalty'],
    commonPrinciples: ['Omnichannel architecture', 'Customer-centric design', 'Real-time inventory', 'Personalization at scale'],
    typicalWhiteSpots: ['Disconnected channels', 'Inventory inaccuracy', 'Fragmented customer view', 'Limited personalization'],
    standardThemes: ['Omnichannel experience', 'Unified commerce platform', 'Customer data platform', 'Supply chain optimization']
  }
];

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.EA_EngagementSchema = {
    Engagement: EngagementSchema,
    Customer: CustomerSchema,
    Segment: SegmentSchema,
    Phase: PhaseSchema,
    Story: StorySchema,
    Stakeholder: StakeholderSchema,
    Application: ApplicationSchema,
    Capability: CapabilitySchema,
    Risk: RiskSchema,
    Constraint: ConstraintSchema,
    Decision: DecisionSchema,
    Assumption: AssumptionSchema,
    Initiative: InitiativeSchema,
    RoadmapItem: RoadmapItemSchema,
    ArchitectureView: ArchitectureViewSchema,
    Artifact: ArtifactSchema,
    ValidationRules,
    DefaultPhases,
    DefaultSegmentTemplates
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EngagementSchema,
    CustomerSchema,
    SegmentSchema,
    PhaseSchema,
    StorySchema,
    StakeholderSchema,
    ApplicationSchema,
    CapabilitySchema,
    RiskSchema,
    ConstraintSchema,
    DecisionSchema,
    AssumptionSchema,
    InitiativeSchema,
    RoadmapItemSchema,
    ArchitectureViewSchema,
    ArtifactSchema,
    ValidationRules,
    DefaultPhases,
    DefaultSegmentTemplates
  };
}
