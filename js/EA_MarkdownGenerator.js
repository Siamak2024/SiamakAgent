/**
 * EA_MarkdownGenerator.js
 * Markdown Document Generator for EA Engagement Playbook
 * Transforms canonical engagement model into structured Markdown documents
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class EA_MarkdownGenerator {
  constructor(aiService = null) {
    this.ai = aiService; // Optional AI service for narrative generation
  }

  /**
   * Generate complete EA Engagement Output Document
   * Full 14-section document
   * 
   * @param {object} data - Engagement data
   * @param {Array} sections - Section names to include
   * @returns {Promise<string>} - Markdown content
   */
  async generateEngagementDocument(data, sections) {
    console.log('📝 Generating EA Engagement Document (14 sections)...');

    let markdown = `# EA Engagement Output Document\n\n`;
    markdown += `**Engagement:** ${data.engagement.name || 'Untitled'}\n`;
    markdown += `**Segment:** ${data.engagement.segment || 'N/A'}\n`;
    markdown += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
    markdown += `---\n\n`;

    // Generate each section
    if (sections.includes('executiveSummary')) {
      markdown += await this.generateExecutiveSummary(data);
    }
    if (sections.includes('engagementOverview')) {
      markdown += this.generateEngagementOverview(data);
    }
    if (sections.includes('scopeAndObjectives')) {
      markdown += this.generateScopeAndObjectives(data);
    }
    if (sections.includes('governanceAndRACI')) {
      markdown += this.generateGovernanceAndRACI(data);
    }
    if (sections.includes('agilePhases')) {
      markdown += this.generateAgilePhases(data);
    }
    if (sections.includes('asisSummary')) {
      markdown += this.generateASISSummary(data);
    }
    if (sections.includes('whitespotAnalysis')) {
      markdown += this.generateWhitespotAnalysis(data);
    }
    if (sections.includes('stakeholderInsights')) {
      markdown += this.generateStakeholderInsights(data);
    }
    if (sections.includes('targetEAVision')) {
      markdown += this.generateTargetEAVision(data);
    }
    if (sections.includes('modernizationAndSunsetting')) {
      markdown += this.generateModernizationAndSunsetting(data);
    }
    if (sections.includes('roadmapAndNextSteps')) {
      markdown += this.generateRoadmapAndNextSteps(data);
    }
    if (sections.includes('decisionsRisksAssumptions')) {
      markdown += this.generateDecisionsRisksAssumptions(data);
    }
    if (sections.includes('actionsAndFollowUp')) {
      markdown += this.generateActionsAndFollowUp(data);
    }
    if (sections.includes('appendices')) {
      markdown += this.generateAppendices(data);
    }

    return markdown;
  }

  /**
   * Section 1: Executive Summary
   */
  async generateExecutiveSummary(data) {
    let md = `## 1. Executive Summary\n\n`;

    // Key metrics
    const appCount = data.applications?.length || 0;
    const initiativeCount = data.initiatives?.length || 0;
    const stakeholderCount = data.stakeholders?.length || 0;

    md += `This engagement encompassed **${appCount} applications**, **${initiativeCount} strategic initiatives**, and involved **${stakeholderCount} key stakeholders** across the organization.\n\n`;

    // High-level findings (AI-generated if available)
    if (this.ai) {
      const summary = await this.ai.generateExecutiveSummary(data);
      md += summary + '\n\n';
    } else {
      md += `### Key Findings\n\n`;
      md += `- Application portfolio analyzed across business fit, technical health, cost efficiency, and risk dimensions\n`;
      md += `- Strategic initiatives identified with clear investment horizons\n`;
      md += `- Target EA vision established with alignment to business objectives\n\n`;
    }

    md += `### Success Criteria Status\n\n`;
    if (data.engagement.successCriteria && data.engagement.successCriteria.length > 0) {
      data.engagement.successCriteria.forEach((criterion, index) => {
        md += `${index + 1}. ${criterion}\n`;
      });
    } else {
      md += `*Success criteria not yet defined*\n`;
    }

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 2: Engagement Overview
   */
  generateEngagementOverview(data) {
    let md = `## 2. Engagement Overview\n\n`;

    md += `### Engagement Context\n\n`;
    md += `| Attribute | Value |\n`;
    md += `|-----------|-------|\n`;
    md += `| Engagement ID | ${data.engagement.id || 'N/A'} |\n`;
    md += `| Theme | ${data.engagement.theme || 'N/A'} |\n`;
    md += `| Segment | ${data.engagement.segment || 'N/A'} |\n`;
    md += `| Status | ${data.engagement.status || 'Active'} |\n`;
    md += `| Sprint Cadence | ${data.engagement.sprintCadence || '2 weeks'} |\n\n`;

    md += `### Engagement Objectives\n\n`;
    if (data.engagement.objectives && data.engagement.objectives.length > 0) {
      data.engagement.objectives.forEach((obj, i) => {
        md += `${i + 1}. ${obj}\n`;
      });
    } else {
      md += `*Objectives to be defined in initiation phase*\n`;
    }

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 3: Scope & Objectives
   */
  generateScopeAndObjectives(data) {
    let md = `## 3. Scope & Objectives\n\n`;

    md += `### In Scope\n\n`;
    md += `- Application portfolio assessment and rationalization\n`;
    md += `- Capability mapping and maturity analysis\n`;
    md += `- Target EA vision definition\n`;
    md += `- Strategic roadmap development\n\n`;

    md += `### Out of Scope\n\n`;
    md += `- Detailed technical design\n`;
    md += `- Implementation execution\n`;
    md += `- Change management program\n\n`;

    md += `### Success Criteria\n\n`;
    if (data.engagement.successCriteria && data.engagement.successCriteria.length > 0) {
      data.engagement.successCriteria.forEach((criterion, i) => {
        md += `- [${i === 0 ? 'x' : ' '}] ${criterion}\n`;
      });
    }

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 4: Governance & RACI
   */
  generateGovernanceAndRACI(data) {
    let md = `## 4. Governance & RACI\n\n`;

    md += `### Decision Forum\n\n`;
    md += `- **Forum:** ${data.engagement.governance?.decisionForum || 'Steering Committee'}\n`;
    md += `- **Cadence:** ${data.engagement.governance?.reviewCadence || 'Bi-weekly'}\n\n`;

    md += `### RACI Matrix\n\n`;
    md += `| Activity | Responsible | Accountable | Consulted | Informed |\n`;
    md += `|----------|-------------|-------------|-----------|----------|\n`;
    md += `| EA Assessment | EA Lead | CIO | Business Units | Executive Team |\n`;
    md += `| Target Vision | EA Lead | CIO | Architecture Team | All Stakeholders |\n`;
    md += `| Roadmap Approval | EA Lead | Executive Team | All Stakeholders | Organization |\n\n`;

    md += `---\n\n`;
    return md;
  }

  /**
   * Section 5: Agile Phases Overview
   */
  generateAgilePhases(data) {
    let md = `## 5. Agile Phases Overview\n\n`;

    const phases = [
      { id: 'E0', name: 'Initiation & Setup', status: 'Complete' },
      { id: 'E1', name: 'AS-IS Assessment', status: 'Complete' },
      { id: 'E2', name: 'White-Spot Analysis', status: 'In Progress' },
      { id: 'E3', name: 'Customer Validation', status: 'Not Started' },
      { id: 'E4', name: 'Target EA Vision', status: 'Not Started' },
      { id: 'E5', name: 'Roadmap & Enablement', status: 'Not Started' }
    ];

    md += `| Phase | Name | Status |\n`;
    md += `|-------|------|--------|\n`;
    phases.forEach(phase => {
      md += `| ${phase.id} | ${phase.name} | ${phase.status} |\n`;
    });

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 6: AS-IS Summary
   */
  generateASISSummary(data) {
    let md = `## 6. AS-IS Summary\n\n`;

    md += `### Application Portfolio Overview\n\n`;
    md += `**Total Applications:** ${data.applications?.length || 0}\n\n`;

    // Lifecycle breakdown
    const lifecycleCounts = this.countByField(data.applications, 'lifecycle');
    md += `### Lifecycle Distribution\n\n`;
    md += `| Lifecycle Stage | Count |\n`;
    md += `|----------------|-------|\n`;
    Object.entries(lifecycleCounts).forEach(([lifecycle, count]) => {
      md += `| ${lifecycle} | ${count} |\n`;
    });

    md += `\n### Top Applications by Business Value\n\n`;
    const topApps = (data.applications || [])
      .sort((a, b) => (b.businessValue || 0) - (a.businessValue || 0))
      .slice(0, 10);

    md += `| Application | Business Value | Lifecycle | Users |\n`;
    md += `|-------------|----------------|-----------|-------|\n`;
    topApps.forEach(app => {
      md += `| ${app.name} | ${app.businessValue || 'N/A'} | ${app.lifecycle || 'N/A'} | ${app.users || 0} |\n`;
    });

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 7: White-Spot Analysis
   */
  generateWhitespotAnalysis(data) {
    let md = `## 7. White-Spot Analysis\n\n`;

    md += `### Capability Gaps\n\n`;
    const unmappedApps = (data.applications || []).filter(app => 
      !app.linkedCapabilities || app.linkedCapabilities.length === 0
    );
    md += `- **${unmappedApps.length}** applications not mapped to capabilities\n`;
    md += `- Potential redundancy across similar business functions\n`;
    md += `- Opportunities for consolidation identified\n\n`;

    md += `### Redundancy Analysis\n\n`;
    md += `*Analysis in progress - detailed findings to be added*\n\n`;

    md += `---\n\n`;
    return md;
  }

  /**
   * Section 8: Stakeholder Insights
   */
  generateStakeholderInsights(data) {
    let md = `## 8. Stakeholder Insights\n\n`;

    md += `### Key Stakeholders\n\n`;
    md += `| Name | Role | Influence | Decision Power | Priorities |\n`;
    md += `|------|------|-----------|----------------|------------|\n`;

    (data.stakeholders || []).forEach(stakeholder => {
      const priorities = stakeholder.priorities?.join(', ') || 'N/A';
      md += `| ${stakeholder.name} | ${stakeholder.role} | ${stakeholder.influence} | ${stakeholder.decisionPower} | ${priorities} |\n`;
    });

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 9: Target EA Vision
   */
  generateTargetEAVision(data) {
    let md = `## 9. Target EA Vision\n\n`;

    md += `### Architecture Principles\n\n`;
    md += `1. **Business-Driven:** All EA decisions must align with business strategy\n`;
    md += `2. **Simplicity First:** Reduce complexity through consolidation and standardization\n`;
    md += `3. **Cloud-Native:** Leverage cloud-native services where appropriate\n`;
    md += `4. **Data-Centric:** Enable data-driven decision making\n`;
    md += `5. **Secure by Design:** Security and compliance built-in from the start\n\n`;

    md += `### Target State Characteristics\n\n`;
    md += `- Rationalized application portfolio with clear ownership\n`;
    md += `- Standardized technology platforms\n`;
    md += `- Modern integration architecture\n`;
    md += `- Cloud-enabled infrastructure\n\n`;

    md += `---\n\n`;
    return md;
  }

  /**
   * Section 10: Modernization & Sunsetting
   */
  generateModernizationAndSunsetting(data) {
    let md = `## 10. Modernization & Sunsetting\n\n`;

    // Filter applications by lifecycle
    const retireCandidates = (data.applications || []).filter(app => 
      app.lifecycle === 'Retire' || app.sunsetCandidate
    );
    const migrateCandidates = (data.applications || []).filter(app => 
      app.lifecycle === 'Migrate' || app.modernizationCandidate
    );

    md += `### Sunsetting Candidates\n\n`;
    md += `**Total:** ${retireCandidates.length} applications\n\n`;
    if (retireCandidates.length > 0) {
      md += `| Application | Rationale |\n`;
      md += `|-------------|----------|\n`;
      retireCandidates.slice(0, 10).forEach(app => {
        md += `| ${app.name} | Low business value, high cost |\n`;
      });
    }

    md += `\n### Modernization Candidates\n\n`;
    md += `**Total:** ${migrateCandidates.length} applications\n\n`;
    if (migrateCandidates.length > 0) {
      md += `| Application | Modernization Approach |\n`;
      md += `|-------------|----------------------|\n`;
      migrateCandidates.slice(0, 10).forEach(app => {
        md += `| ${app.name} | Cloud migration |\n`;
      });
    }

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 11: Roadmap & Next Steps
   */
  generateRoadmapAndNextSteps(data) {
    let md = `## 11. Roadmap & Next Steps\n\n`;

    // Group initiatives by time horizon
    const shortTerm = (data.initiatives || []).filter(i => i.timeHorizon === 'short');
    const midTerm = (data.initiatives || []).filter(i => i.timeHorizon === 'mid');
    const longTerm = (data.initiatives || []).filter(i => i.timeHorizon === 'long');

    md += `### Short-Term (0-6 months)\n\n`;
    shortTerm.forEach(init => {
      md += `- **${init.name}**: ${init.description || 'Details TBD'}\n`;
    });

    md += `\n### Mid-Term (6-18 months)\n\n`;
    midTerm.forEach(init => {
      md += `- **${init.name}**: ${init.description || 'Details TBD'}\n`;
    });

    md += `\n### Long-Term (18+ months)\n\n`;
    longTerm.forEach(init => {
      md += `- **${init.name}**: ${init.description || 'Details TBD'}\n`;
    });

    md += `\n---\n\n`;
    return md;
  }

  /**
   * Section 12: Decisions, Risks & Assumptions
   */
  generateDecisionsRisksAssumptions(data) {
    let md = `## 12. Decisions, Risks & Assumptions\n\n`;

    md += `### Decisions\n\n`;
    (data.decisions || []).forEach((decision, i) => {
      md += `**D${i + 1}:** ${decision.rationale} *(Status: ${decision.approvalStatus})*  \n`;
      md += `*Evidence:* Decision ID ${decision.id}\n\n`;
    });

    md += `### Risks\n\n`;
    (data.risks || []).forEach((risk, i) => {
      md += `**R${i + 1}:** ${risk.description} *(Likelihood: ${risk.likelihood}, Impact: ${risk.impact})*\n\n`;
    });

    md += `### Assumptions\n\n`;
    (data.assumptions || []).forEach((assumption, i) => {
      md += `**A${i + 1}:** ${assumption.description}\n\n`;
    });

    md += `---\n\n`;
    return md;
  }

  /**
   * Section 13: Actions & Follow-Up
   */
  generateActionsAndFollowUp(data) {
    let md = `## 13. Actions & Follow-Up\n\n`;

    md += `| Action | Owner | Due Date | Status |\n`;
    md += `|--------|-------|----------|--------|\n`;
    md += `| Complete capability mapping | EA Lead | Week 4 | In Progress |\n`;
    md += `| Validate with stakeholders | EA Lead | Week 5 | Not Started |\n`;
    md += `| Finalize roadmap | EA Lead | Week 6 | Not Started |\n\n`;

    md += `---\n\n`;
    return md;
  }

  /**
   * Section 14: Appendices
   */
  generateAppendices(data) {
    let md = `## 14. Appendices\n\n`;

    md += `### A. Application Inventory (Full)\n\n`;
    md += `*See attached application inventory spreadsheet*\n\n`;

    md += `### B. Workshop Notes\n\n`;
    md += `*Workshop artifacts available in engagement repository*\n\n`;

    md += `### C. Architecture Diagrams\n\n`;
    md += `*Architecture diagrams available in engagement repository*\n\n`;

    md += `---\n\n`;
    md += `**End of Document**\n`;
    return md;
  }

  /**
   * Generate Portfolio/Leadership View
   * Investment-focused 1-3 page summary
   */
  async generateLeadershipView(data, sections) {
    console.log('📊 Generating Portfolio/Leadership View...');

    let md = `# Portfolio / Leadership View\n\n`;
    md += `**Engagement:** ${data.engagement.name}\n`;
    md += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
    md += `---\n\n`;

    md += `## Portfolio Context & Objectives\n\n`;
    md += `This view provides executive leadership with an investment-focused summary of the application portfolio analysis, strategic initiatives, and recommended roadmap.\n\n`;

    md += `## Strategic Portfolio Themes\n\n`;
    md += `1. **Application Rationalization:** Reduce portfolio complexity\n`;
    md += `2. **Cloud Migration:** Enable scalability and agility\n`;
    md += `3. **Legacy Modernization:** Address technical debt\n\n`;

    md += `## Strategic Initiatives (Investment Options)\n\n`;
    md += `| Initiative | Value Type | Time Horizon | Investment |\n`;
    md += `|-----------|-----------|--------------|------------|\n`;
    (data.initiatives || []).slice(0, 10).forEach(init => {
      md += `| ${init.name} | ${init.valueType?.join(', ') || 'N/A'} | ${init.timeHorizon} | TBD |\n`;
    });

    md += `\n## Leadership Decisions Required\n\n`;
    md += `1. Approve portfolio rationalization approach\n`;
    md += `2. Prioritize strategic initiatives\n`;
    md += `3. Allocate investment budget\n\n`;

    return md;
  }

  /**
   * Generate Sales/Account Planning Extract
   * Value-focused 1-pager
   */
  async generateSalesExtract(data, sections) {
    console.log('💼 Generating Sales/Account Extract...');

    let md = `# Sales / Account Planning Extract\n\n`;
    md += `**Client:** ${data.engagement.name}\n`;
    md += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;

    md += `## Value Proposition\n\n`;
    md += `Transform application portfolio complexity into strategic business value through EA-led modernization.\n\n`;

    md += `## Business Case\n\n`;
    md += `- **Cost Reduction:** 15-25% TCO reduction through portfolio rationalization\n`;
    md += `- **Risk Mitigation:** Reduce compliance and operational risks\n`;
    md += `- **Speed to Market:** Enable faster delivery of new capabilities\n\n`;

    md += `## Key Findings\n\n`;
    md += `- ${data.applications?.length || 0} applications analyzed\n`;
    md += `- Consolidation opportunities identified\n`;
    md += `- Clear roadmap for modernization\n\n`;

    md += `## Recommendations\n\n`;
    md += `1. Proceed with Phase 1 rationalization\n`;
    md += `2. Invest in cloud migration program\n`;
    md += `3. Establish EA governance framework\n\n`;

    md += `## Next Steps\n\n`;
    md += `- [ ] Executive approval\n`;
    md += `- [ ] Budget allocation\n`;
    md += `- [ ] Kickoff workshop\n\n`;

    return md;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Count items by field value
   * @param {Array} items
   * @param {string} field
   * @returns {object}
   */
  countByField(items, field) {
    const counts = {};
    (items || []).forEach(item => {
      const value = item[field] || 'Undefined';
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  /**
   * Escape markdown special characters
   * @param {string} text
   * @returns {string}
   */
  escapeMarkdown(text) {
    return (text || '').replace(/[*_`#]/g, '\\$&');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_MarkdownGenerator = EA_MarkdownGenerator;
}
