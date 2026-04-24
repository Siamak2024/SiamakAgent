# Leadership Investment Summary
## {{engagement.name}}

**Customer:** {{engagement.customerName}} | **Segment:** {{engagement.segment}}

---

## Investment Overview

### Strategic Alignment
**Theme:** {{engagement.theme}}

**Strategic Imperatives:**
{{#each engagement.successCriteria}}
- {{this}}
{{/each}}

---

## Investment Breakdown by Horizon

### Short-Term (0-12 months)
{{#each initiatives}}
{{#if (eq this.timeHorizon "short")}}
- **{{this.name}}** — ${{this.estimatedCost}} | Value: ${{this.estimatedValue}}
  - Outcomes: {{#each this.businessOutcomes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

**Short-Term Total:** ${{totals.shortTerm.cost}} | Expected Value: ${{totals.shortTerm.value}}

### Mid-Term (12-24 months)
{{#each initiatives}}
{{#if (eq this.timeHorizon "mid")}}
- **{{this.name}}** — ${{this.estimatedCost}} | Value: ${{this.estimatedValue}}
  - Outcomes: {{#each this.businessOutcomes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

**Mid-Term Total:** ${{totals.midTerm.cost}} | Expected Value: ${{totals.midTerm.value}}

### Long-Term (24+ months)
{{#each initiatives}}
{{#if (eq this.timeHorizon "long")}}
- **{{this.name}}** — ${{this.estimatedCost}} | Value: ${{this.estimatedValue}}
  - Outcomes: {{#each this.businessOutcomes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

**Long-Term Total:** ${{totals.longTerm.cost}} | Expected Value: ${{totals.longTerm.value}}

---

## Total Investment Summary

| Metric | Value |
|--------|-------|
| **Total Investment** | ${{totals.totalInvestment}} |
| **Expected Business Value** | ${{totals.totalValue}} |
| **ROI** | {{totals.roi}}% |
| **Initiatives** | {{initiatives.length}} |
| **Quick Wins (0-6mo)** | {{totals.quickWins}} |

---

## Value Creation by Type

### Cost Reduction
{{#each initiatives}}
{{#if (includes this.valueType "cost")}}
- {{this.name}}: ${{this.estimatedValue}}
{{/if}}
{{/each}}

### Revenue Growth
{{#each initiatives}}
{{#if (includes this.valueType "revenue")}}
- {{this.name}}: ${{this.estimatedValue}}
{{/if}}
{{/each}}

### Risk Mitigation
{{#each initiatives}}
{{#if (includes this.valueType "risk")}}
- {{this.name}}: {{this.description}}
{{/if}}
{{/each}}

---

## Top Risks & Mitigation

{{#each risks}}
{{#if (eq this.impact "high")}}
### {{this.name}}
**Risk:** {{this.description}}  
**Impact:** {{this.impact}} | **Probability:** {{this.probability}}  
**Mitigation:** {{this.mitigation}}
{{/if}}
{{/each}}

---

## Resource Requirements

### Key Roles Needed
{{#each initiatives}}
{{#if this.owner}}
- **{{this.name}}**: {{this.owner}} ({{this.effort}} effort)
{{/if}}
{{/each}}

### Stakeholder Engagement Required
- **Executive Sponsors:** {{stakeholderStats.executiveCount}}
- **Decision Makers:** {{stakeholderStats.decisionMakerCount}}
- **Technical Leads:** {{stakeholderStats.technicalCount}}

---

## Critical Success Factors

1. **Executive Sponsorship** — Secure C-level commitment for funding and prioritization
2. **Cross-Functional Collaboration** — Align IT, Business, and Operations teams
3. **Change Management** — Invest in training and adoption programs
4. **Architecture Governance** — Establish decision-making forum with {{engagement.governance.reviewCadence}} cadence
5. **Risk Management** — Monitor top {{risks.length}} risks with active mitigation

---

## Next Steps

1. **Secure Budget Approval** — Present investment case to steering committee
2. **Finalize Roadmap** — Sequence initiatives based on dependencies and quick wins
3. **Assign Owners** — Allocate initiative ownership across leadership team
4. **Establish Governance** — Set up {{engagement.governance.decisionForum}} with regular reviews
5. **Begin Execution** — Launch first {{totals.quickWins}} quick-win initiatives

---

**Prepared for:** Executive Leadership Team  
**Prepared by:** Enterprise Architecture Team  
**Date:** {{generatedDate}}
