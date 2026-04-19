# Enterprise Architecture Blueprint
## {{engagement.name}}

**Customer:** {{engagement.customerName}}  
**Segment:** {{engagement.segment}}  
**Date:** {{generatedDate}}

---

## Architecture Overview

### Strategic Theme
{{engagement.theme}}

### Architecture Vision
{{architectureVision}}

### Architecture Principles

{{#each architecturePrinciples}}
#### {{this.name}}
**Statement:** {{this.statement}}  
**Rationale:** {{this.rationale}}  
**Implications:** {{this.implications}}
{{/each}}

---

## AS-IS Architecture

### Current State Summary
{{asIsDescription}}

### AS-IS Application Landscape ({{applications.length}} applications)

#### By Category
{{#each applicationsByCategory}}
**{{this.category}}** ({{this.count}} apps)
{{#each this.applications}}
- {{this.name}} — {{this.technology}} | Business Value: {{this.businessValue}} | Technical Fit: {{this.technicalFit}}
{{/each}}

{{/each}}

#### Lifecycle Distribution
- **Invest/Grow:** {{portfolio.invest}} applications
- **Maintain:** {{portfolio.maintain}} applications
- **Contain:** {{portfolio.contain}} applications
- **Sunset:** {{portfolio.sunset}} applications

### AS-IS Capability Maturity

{{#each capabilities}}
#### {{this.name}} (L{{this.level}} - {{this.category}})
- **Current Maturity:** {{this.maturity}}/5
- **Strategic Importance:** {{this.strategicImportance}}
{{#if this.supportedBy.length}}
- **Supported By:** {{#each this.supportedBy}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

### AS-IS Architecture Views

{{#each architectureViews}}
{{#if (eq this.type "as-is")}}
#### {{this.name}} ({{this.viewType}})
{{this.description}}
{{#if this.diagram}}
![{{this.name}}]({{this.diagram}})
{{/if}}
{{#if this.notes}}
**Notes:** {{this.notes}}
{{/if}}
{{/if}}
{{/each}}

---

## Target Architecture

### Target State Vision
{{targetDescription}}

### Target Capability Maturity

{{#each capabilities}}
#### {{this.name}}
- **Current Maturity:** {{this.maturity}}/5
- **Target Maturity:** {{this.targetMaturity}}/5
- **Gap:** {{this.gap}}
{{#if (gt this.gap 0)}}
- **Gap Analysis:** {{this.gapDescription}}
{{/if}}
{{/each}}

### Capability Heat Map

**High Priority Gaps (Gap ≥ 2):**
{{#each capabilities}}
{{#if (gte this.gap 2)}}
- **{{this.name}}**: Current {{this.maturity}} → Target {{this.targetMaturity}} (Gap: {{this.gap}})
{{/if}}
{{/each}}

### Target Architecture Views

{{#each architectureViews}}
{{#if (eq this.type "target")}}
#### {{this.name}} ({{this.viewType}})
{{this.description}}
{{#if this.diagram}}
![{{this.name}}]({{this.diagram}})
{{/if}}
{{#if this.notes}}
**Notes:** {{this.notes}}
{{/if}}
{{/if}}
{{/each}}

---

## Gap Analysis

### Application Portfolio Gaps

**Applications to Sunset:**
{{#each applications}}
{{#if (eq this.recommendation "sunset")}}
- **{{this.name}}**: {{this.rationale}}
{{/if}}
{{/each}}

**Applications to Modernize:**
{{#each applications}}
{{#if (eq this.recommendation "modernize")}}
- **{{this.name}}**: {{this.rationale}}
{{/if}}
{{/each}}

**New Applications Needed:**
{{#each newApplications}}
- **{{this.name}}**: {{this.purpose}} (supports capability: {{this.capability}})
{{/each}}

### Capability White-Spots

{{#each capabilities}}
{{#if (and (gt this.gap 1) (eq this.supportedBy.length 0))}}
#### {{this.name}}
- **Gap:** {{this.gap}} maturity levels
- **Strategic Importance:** {{this.strategicImportance}}
- **Current State:** No enabling applications identified
- **Recommendation:** {{this.recommendation}}
{{/if}}
{{/each}}

---

## Technology & Integration Architecture

### Technology Stack

#### Current Technology Landscape
{{#each technologyStack.current}}
- **{{this.layer}}**: {{#each this.technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

#### Target Technology Landscape
{{#each technologyStack.target}}
- **{{this.layer}}**: {{#each this.technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

### Integration Patterns

{{#each integrationPatterns}}
#### {{this.name}}
- **Pattern Type:** {{this.type}}
- **Use Cases:** {{#each this.useCases}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Technology:** {{this.technology}}
{{/each}}

---

## Architecture Constraints & Risks

### Constraints ({{constraints.length}} identified)

{{#each constraints}}
#### {{this.name}} ({{this.type}})
- **Impact:** {{this.impactLevel}}
- **Description:** {{this.description}}
{{#if this.workaround}}
- **Workaround:** {{this.workaround}}
{{/if}}
{{/each}}

### Architecture Risks

{{#each risks}}
{{#if (includes this.category "technical")}}
#### {{this.name}}
- **Risk:** {{this.description}}
- **Probability:** {{this.probability}} | **Impact:** {{this.impact}}
- **Mitigation:** {{this.mitigation}}
{{/if}}
{{/each}}

---

## Transformation Roadmap

### Initiative Sequencing

{{#each initiatives}}
#### {{this.name}} ({{this.timeHorizon}}-term)
- **Linked Themes:** {{#each this.linkedThemes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Business Outcomes:** {{#each this.businessOutcomes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Value Type:** {{#each this.valueType}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- **Effort:** {{this.effort}} | **Cost:** ${{this.estimatedCost}} | **Value:** ${{this.estimatedValue}}
{{#if this.dependencies.length}}
- **Dependencies:** {{#each this.dependencies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{#if this.risks.length}}
- **Risks:** {{#each this.risks}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

### Roadmap Timeline

{{#each roadmapItems}}
#### Q{{this.quarter}} {{this.year}}: {{this.name}}
- **Initiative:** {{this.initiativeId}}
- **Milestones:** {{#each this.milestones}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if this.dependencies.length}}
- **Dependencies:** {{#each this.dependencies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

---

## Governance & Decision-Making

### Architecture Governance Model

**Decision Forum:** {{engagement.governance.decisionForum}}  
**Review Cadence:** {{engagement.governance.reviewCadence}}  
**Sprint Cadence:** {{engagement.sprintCadence}}

### Key Architectural Decisions

{{#each decisions}}
{{#if (includes this.category "architecture")}}
#### {{this.title}}
- **Decision Date:** {{this.decisionDate}}
- **Status:** {{this.status}}
- **Decision:** {{this.decision}}
- **Rationale:** {{this.rationale}}
- **Decided By:** {{this.decidedBy}}
{{#if this.alternatives}}
- **Alternatives Considered:** {{#each this.optionsConsidered}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/if}}
{{/each}}

---

## Architecture Patterns & Standards

### Recommended Patterns

{{#each architecturePatterns}}
#### {{this.name}}
- **Pattern Type:** {{this.type}}
- **Description:** {{this.description}}
- **When to Use:** {{this.useWhen}}
- **Benefits:** {{#each this.benefits}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if this.examples}}
- **Examples:** {{this.examples}}
{{/if}}
{{/each}}

### Architecture Standards

{{#each architectureStandards}}
- **{{this.domain}}**: {{this.standard}}
{{/each}}

---

## Success Metrics

### Architecture KPIs

{{#each architectureKPIs}}
- **{{this.metric}}**: {{this.target}}
{{/each}}

### Capability Maturity Targets

| Capability | Current | Target | Timeline |
|-----------|---------|--------|----------|
{{#each capabilities}}
{{#if (gt this.gap 0)}}
| {{this.name}} | {{this.maturity}}/5 | {{this.targetMaturity}}/5 | {{this.targetTimeline}} |
{{/if}}
{{/each}}

### Application Portfolio Targets

| Metric | Current | Target |
|--------|---------|--------|
| Applications | {{applications.length}} | {{targetApplicationCount}} |
| Sunset Rate | - | {{sunsetTarget}}% |
| Cloud-Native Apps | {{cloudNativeCount}} | {{cloudNativeTarget}} |
| Technical Debt Score | {{technicalDebtScore}}/10 | {{technicalDebtTarget}}/10 |

---

## Appendices

### Glossary of Terms

{{#each glossary}}
- **{{this.term}}**: {{this.definition}}
{{/each}}

### Reference Documents

{{#each artifacts}}
{{#if (includes this.type "architecture")}}
- **{{this.name}}** ({{this.format}}) — {{this.description}}
{{/if}}
{{/each}}

### Stakeholder Review & Approval

{{#each stakeholders}}
{{#if (eq this.type "engagement-team")}}
- **{{this.name}}** ({{this.role}}) — Reviewed {{this.reviewDate}}
{{/if}}
{{/each}}

---

**Document Classification:** Internal Architecture Reference  
**Version:** {{documentVersion}}  
**Last Updated:** {{generatedDate}}  
**Next Review:** {{nextReviewDate}}

---

**Prepared By:** Enterprise Architecture Team  
**Approved By:** {{approver}}  
**Approval Date:** {{approvalDate}}
