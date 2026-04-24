# Account Planning Brief: {{account.name}}

**Account Manager:** {{account.accountManager}} | **Industry:** {{account.industry}} | **Region:** {{account.region}}

---

## Account Overview

**Annual Contract Value:** ${{account.ACV}}  
**Health Status:** {{account.health}}  
**Size:** {{account.size}}

### Strategic Priorities
{{#each account.strategicPriorities}}
- {{this}}
{{/each}}

### Key Pain Points
{{#each account.painPoints}}
- {{this}}
{{/each}}

---

## Opportunity Pipeline

**Active Opportunities:** {{opportunities.length}}  
**Total Pipeline Value:** ${{pipeline.totalValue}}  
**Weighted Value:** ${{pipeline.weightedValue}}

{{#each opportunities}}
### {{this.name}}
- **Value:** ${{this.estimatedValue}} | **Probability:** {{this.probability}}%
- **Stage:** {{this.status}} | **Close Date:** {{this.closeDate}}
- **Sponsor:** {{this.sponsor}}
- **Next Steps:** {{#each this.nextSteps}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

---

## Architecture Engagements

**Active Engagements:** {{engagements.length}}

{{#each engagements}}
### {{this.name}}
- **Theme:** {{this.theme}}
- **Status:** {{this.status}}
- **Phase:** {{this.workflowState.currentPhase}}
- **Key Stakeholders:** {{this.stakeholders.length}}
- **Applications in Scope:** {{this.applications.length}}
- **Initiatives:** {{this.initiatives.length}}
{{/each}}

---

## Stakeholder Map

**Total Stakeholders:** {{stakeholders.length}}

### Executive Sponsors
{{#each stakeholders}}
{{#if (eq this.level "executive")}}
- **{{this.name}}** ({{this.role}}) — Power: {{this.decisionPower}}, Influence: {{this.influence}}
{{/if}}
{{/each}}

### Key Decision Makers
{{#each stakeholders}}
{{#if (eq this.decisionPower "high")}}
- **{{this.name}}** ({{this.role}}) — {{this.department}}
{{/if}}
{{/each}}

---

## Technology Landscape

**Applications:** {{applications.length}}  
**Capabilities Assessed:** {{capabilities.length}}

### Portfolio Health
- **Modern/Strategic:** {{portfolio.modern}}
- **Maintain:** {{portfolio.maintain}}
- **Sunset Candidates:** {{portfolio.sunset}}

### Capability Gaps (White-Spots)
{{#each capabilities}}
{{#if (gt this.gap 2)}}
- **{{this.name}}**: Gap of {{this.gap}} (Current: {{this.maturity}}, Target: {{this.targetMaturity}})
{{/if}}
{{/each}}

---

## Growth Opportunities

### Architecture-Driven Opportunities
{{#each growthOpportunities}}
- **{{this.title}}**: {{this.description}} — Estimated Value: ${{this.estimatedValue}}
{{/each}}

### Expansion Potential
{{#if account.businessStrategy}}
**Strategic Direction:** {{account.businessStrategy}}
{{/if}}

**Recommended Focus Areas:**
{{#each recommendations}}
- {{this}}
{{/each}}

---

## Next Actions

### Immediate (This Week)
{{#each nextActions.immediate}}
- {{this}}
{{/each}}

### Short-Term (Next 30 Days)
{{#each nextActions.shortTerm}}
- {{this}}
{{/each}}

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **ACV** | ${{account.ACV}} |
| **Pipeline Value** | ${{pipeline.totalValue}} |
| **Open Opportunities** | {{opportunities.length}} |
| **Active Engagements** | {{engagements.length}} |
| **Stakeholders** | {{stakeholders.length}} |
| **Applications** | {{applications.length}} |

---

**Prepared for:** Sales & Account Planning  
**Last Updated:** {{generatedDate}}  
**Next Review:** {{nextReviewDate}}
