# AI Assistant User Guide

**Platform:** EA2 Toolkit (EA Engagement Playbook & EA Growth Dashboard)  
**Version:** 2.0  
**Date:** April 20, 2026  
**AI Model:** GPT-4 / GPT-5 via Azure OpenAI

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [How to Use the AI Assistant](#how-to-use-the-ai-assistant)
4. [Prompt Examples by Context](#prompt-examples-by-context)
5. [WhiteSpot Heatmap AI Guidance](#whitespot-heatmap-ai-guidance)
6. [APQC Integration AI Support](#apqc-integration-ai-support)
7. [Best Practices](#best-practices)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Overview

### What is the AI Assistant?

The EA2 Toolkit includes **two intelligent AI assistants** that provide context-aware guidance, recommendations, and analysis throughout your Enterprise Architecture workflows:

1. **EA Engagement Playbook AI (Advicy AI)**
   - Integrated into EA_Engagement_Playbook.html
   - Provides step-by-step workflow guidance (E0-E5)
   - Understands current phase, step, canvas, and integrations
   - Specializes in EA methodology, WhiteSpot Heatmap, and APQC mapping

2. **EA Growth Dashboard AI (EA Assistant)**
   - Integrated into EA_Growth_Dashboard.html
   - Focuses on account management and portfolio optimization
   - Analyzes pipeline health, opportunity progression, and account prioritization
   - Leverages WhiteSpot Heatmap for upsell identification

### Key Capabilities

✅ **Context-Aware:** Automatically detects what you're working on and adapts guidance  
✅ **WhiteSpot Heatmap Expert:** Analyzes service coverage across 41 Vivicta DCS services  
✅ **APQC Integration:** Maps business capabilities to service delivery opportunities  
✅ **5-Question Pattern:** Asks max 5 targeted questions before providing recommendations  
✅ **Documentation Access:** References user guides and best practices  
✅ **Actionable Insights:** Provides specific deliverables with confidence scores  

---

## Getting Started

### Accessing the AI Assistant

#### In EA Engagement Playbook

1. **Open EA Engagement Playbook** (`EA_Engagement_Playbook.html`)
2. **Look for AI Chat Icon** in the top-right header (💬 or 🤖 icon)
3. **Click to open the AI chat panel** (right sidebar)
4. The AI panel will slide in from the right side
5. **Start chatting!**

**Keyboard Shortcut:** Press `Ctrl+Shift+A` to toggle AI panel (if implemented)

#### In EA Growth Dashboard

1. **Open EA Growth Dashboard** (`EA_Growth_Dashboard.html`)
2. **Click "AI Assistant" button** in the top toolbar
3. The AI chat panel will appear on the right side
4. **Start asking questions!**

### First-Time Setup

**No setup required!** The AI assistant is:
- ✅ Pre-configured with EA expertise
- ✅ Connected to Azure OpenAI
- ✅ Ready to help immediately
- ✅ Context-aware from the start

---

## How to Use the AI Assistant

### Basic Usage

#### 1. **Ask Questions Naturally**

The AI understands natural language. Just type your question or request:

```
"Help me define the engagement scope"
"What should I do next?"
"Identify service gaps for this customer"
"How do I use the WhiteSpot Heatmap?"
```

#### 2. **Use Quick Prompts**

Click suggested prompts below the chat input for common tasks:

- 🔍 "Analyze service coverage gaps"
- ⭐ "Prioritize white-spot opportunities"
- 🎯 "Generate APQC capability mappings"
- 💡 "What should I do next?"

#### 3. **Follow the 5-Question Pattern**

When you ask for analysis or recommendations, the AI will:
1. Ask **max 5 targeted questions** to gather context
2. **Stop early** if it has enough information (won't force all 5)
3. **Generate specific recommendations** with:
   - Clear deliverables
   - Confidence scores
   - Sources/references (APQC codes, frameworks, etc.)
4. **Format output** with clear sections and markdown

**Example Interaction:**

```
You: "Help me assess service coverage for this customer"

AI: "I'll help you with WhiteSpot Heatmap assessment. Let me ask a few questions:

1. What industry is this customer in?
2. What services are you currently delivering to them?
3. Are there any known pain points or gaps they've mentioned?
4. What is their strategic priority for the next 12 months?

Based on your answers, I'll recommend which services to mark as FULL/PARTIAL/LOST 
and identify upsell opportunities."

You: "Financial services, we deliver cloud infrastructure and security, 
they need better data governance, focus on regulatory compliance"

AI: "Perfect! Based on this context, here are my recommendations:

📊 **Service Assessment Recommendations** (Confidence: 85%)

**Mark as FULL (Green):**
- Cloud Infrastructure Services
- Security & Identity Management
- Infrastructure Operations

**Mark as PARTIAL (Yellow):**
- Data & Analytics Platform (gap: governance features)
- Compliance & Risk Management (gap: automated reporting)

**Mark as LOST (Red) - High Priority Upsell:**
- Data Governance Services ⭐ HIGH VALUE
- Regulatory Compliance Automation
- Risk Analytics & Reporting

**APQC Capability Mapping:**
- APQC 11012: Manage Information Technology (L2) → Cloud Infrastructure
- APQC 10731: Manage Enterprise Risk (L3) → Compliance & Risk Management
- APQC 10732: Manage Regulatory Compliance (L3) → Data Governance Services

**Estimated Opportunity Value:** $850K - $1.2M
**Priority:** HIGH (Strategic + Regulatory Driver)

**Next Steps:**
1. Navigate to WhiteSpot Heatmap tab
2. Assess services as recommended above
3. Click on 'Data Governance Services' to drill down into L3 components
4. Generate APQC mappings for validation
5. Create opportunity record with estimated value

Would you like me to guide you through the assessment process step-by-step?"
```

---

## Prompt Examples by Context

### Phase E0: Initiation & Planning

#### E0.1 - Define Engagement Scope

**Prompt:**
```
"Help me define the engagement scope for a mid-sized retail company 
undergoing digital transformation"
```

**AI Response Example:**
```
I'll help you define a comprehensive engagement scope. Let me ask 5 questions:

1. What are the primary business drivers for this transformation?
2. What is the expected timeline (6 months, 1 year, 18 months)?
3. What resources are available (budget, team size, stakeholder availability)?
4. Are there any hard constraints (technology limitations, regulatory requirements)?
5. What does success look like for the customer?

[After your responses...]

📋 **Engagement Scope Statement** (Confidence: 90%)

**Objective:** Enable omnichannel retail experience through cloud modernization 
and data platform integration

**Timeline:** 12 months (3 phases)
- Phase 1: Discovery & Planning (8 weeks)
- Phase 2: Platform Build (20 weeks)
- Phase 3: Migration & Optimization (12 weeks)

**Deliverables:**
- Current state architecture documentation
- Target state architecture blueprint
- Migration roadmap with 3 waves
- Value case with ROI analysis
- Risk mitigation plan

**Success Criteria:**
- ✓ 50% reduction in time-to-market for new features
- ✓ 360° customer view across all channels
- ✓ Cloud infrastructure cost optimization (20% savings)

**8-Item Checklist:**
☐ Stakeholder alignment secured
☐ Technical landscape assessment complete
☐ Business capability gaps identified
☐ Architecture principles defined
☐ Governance model established
☐ Phase plan approved
☐ Resource allocation confirmed
☐ Kickoff meeting scheduled

**Sources:** TOGAF ADM, Retail Industry Best Practices
```

#### E0.2 - Identify Stakeholders

**Prompt:**
```
"Who should I include as stakeholders for an EA engagement 
at a financial services company?"
```

**AI Response Example:**
```
For financial services EA engagements, here's a comprehensive stakeholder list:

**Executive Stakeholders (High Influence):**
- Chief Information Officer (CIO) - Primary sponsor
- Chief Technology Officer (CTO) - Architecture decisions
- Chief Risk Officer (CRO) - Compliance & risk approval
- Chief Financial Officer (CFO) - Budget approval
- Head of Digital - Transformation vision

**Business Stakeholders (High Interest):**
- Head of Retail Banking - Business requirements
- Head of Commercial Banking - Process owners
- Head of Compliance - Regulatory requirements
- Head of Customer Experience - User needs

**Technical Stakeholders (High Impact):**
- Enterprise Architect - Technical guidance
- Solution Architects (by domain) - Implementation details
- Infrastructure Lead - Platform decisions
- Security Architect - Security requirements
- Data Architect - Data governance

**Support Stakeholders:**
- PMO Lead - Project governance
- Change Manager - Organizational change
- Business Analysts - Requirements gathering

**Communication Plan:**
- Executive: Monthly steering committee (1 hour)
- Business: Bi-weekly workshops (2 hours)
- Technical: Weekly design sessions (2 hours)
- PMO: Weekly status updates (30 min)

Would you like me to generate a stakeholder influence/interest matrix?
```

### Phase E1: Discovery & Analysis

#### E1.2 - WhiteSpot Heatmap Analysis

**Prompt:**
```
"Analyze the WhiteSpot Heatmap and identify top 3 upsell opportunities"
```

**AI Response Example:**
```
I'll analyze the service coverage heatmap. First, let me understand the context:

1. What customer are you analyzing?
2. What industry are they in?
3. What is their current service coverage percentage (check heatmap stats)?
4. Are there any known strategic initiatives or pain points?

[After responses...]

🎯 **Top 3 Upsell Opportunities** (WhiteSpot Analysis)

**1. Data Governance & Master Data Management** ⭐⭐⭐
- **Status:** LOST (not currently delivered)
- **L1 Area:** Platform Services
- **Business Driver:** Regulatory compliance + data quality issues
- **APQC Mapping:** 10731 Manage Enterprise Data (L3) - 95% confidence
- **Estimated Value:** $1.2M - $1.5M
- **Priority:** HIGH
- **Why Now:** New GDPR enforcement deadline in 6 months
- **Next Action:** Schedule data governance workshop with Head of Compliance

**2. Cloud Security & Identity Management** ⭐⭐
- **Status:** PARTIAL (only infrastructure security, missing IAM)
- **L1 Area:** Platform Services
- **Business Driver:** Zero-trust architecture initiative
- **APQC Mapping:** 10019 Manage Information Security (L3) - 88% confidence
- **Estimated Value:** $800K - $1.1M
- **Priority:** MEDIUM-HIGH
- **Why Now:** Recent security audit identified IAM gaps
- **Next Action:** Conduct security maturity assessment

**3. Business Intelligence & Advanced Analytics** ⭐⭐
- **Status:** LOST (no analytics platform)
- **L1 Area:** Consulting & Project Services
- **Business Driver:** Data-driven decision making, competitive advantage
- **APQC Mapping:** 10055 Perform Data Analytics (L4) - 82% confidence
- **Estimated Value:** $600K - $900K
- **Priority:** MEDIUM
- **Why Now:** Executive mandate for predictive analytics
- **Next Action:** Demo BI platform capabilities to business stakeholders

**Portfolio Impact:**
- Total Opportunity Value: $2.6M - $3.5M
- Coverage Improvement: +18% (from 68% to 86%)
- Services Moving LOST → FULL: 3
- Strategic Alignment: STRONG (all align to customer priorities)

**Recommended Approach:**
1. Lead with Data Governance (regulatory driver = urgency)
2. Bundle Cloud Security as "Governance + Security" package
3. Position BI/Analytics as Phase 2 (after data foundation)

Would you like me to help you create opportunity records for these?
```

#### E1.1 - Application Portfolio Analysis

**Prompt:**
```
"Identify sunset candidates in the application portfolio"
```

**AI Response Example:**
```
I'll analyze the portfolio for rationalization opportunities. Quick questions:

1. How many applications are in the portfolio?
2. Do you have APM Toolkit connected for detailed data?
3. What are the main criteria for sunset (age, cost, redundancy)?

[Based on responses...]

🌅 **Sunset Candidates Analysis**

**High Priority Sunset (6 applications):**

1. **Legacy CRM System v2.1**
   - Age: 12 years
   - Annual Cost: $450K (licenses + maintenance)
   - Redundancy: 80% overlaps with Salesforce
   - Business Impact: LOW (10 users, reporting only)
   - Migration Effort: 3 months
   - **ROI:** $1.8M over 5 years

2. **Custom Reporting Portal**
   - Age: 8 years
   - Annual Cost: $180K (custom dev + hosting)
   - Redundancy: Power BI provides same capabilities
   - Business Impact: MEDIUM (150 users, quarterly reports)
   - Migration Effort: 2 months
   - **ROI:** $720K over 5 years

[... continues for all 6 ...]

**Total Sunset Value:**
- Cost Reduction: $1.8M annually
- One-time Migration Cost: $850K
- Net Savings (5 years): $7.2M
- Complexity Reduction: -15% portfolio size

**Recommended Sequencing:**
Phase 1 (Q1): Apps #1, #2, #5 (low business impact, high cost)
Phase 2 (Q2): Apps #3, #6 (medium impact, need transition time)
Phase 3 (Q3): App #4 (requires custom migration tool)

Would you like me to generate a detailed migration roadmap?
```

### Phase E4: Roadmap & Planning

#### E4.2 - Roadmap Development

**Prompt:**
```
"Help me sequence 15 initiatives into a 3-wave roadmap"
```

**AI Response Example:**
```
I'll help you create a dependency-aware, value-optimized roadmap. Questions:

1. What is the transformation horizon (12 months, 18 months, 24 months)?
2. How many parallel streams can the organization handle (2-3, 3-5, 5+)?
3. Are there any mandated deadlines (regulatory, contract renewals)?
4. What are the top 3 business priorities?
5. What is the available budget per wave?

[After responses...]

🗺️ **3-Wave Transformation Roadmap** (18 months)

**WAVE 1: Foundation & Quick Wins** (Months 1-6)
*Theme: Stabilize + Enable*

**Quick Wins (Parallel Track 1):**
1. ✅ Legacy App Sunset (3 apps) - $450K savings, 3 months
2. ✅ Cloud Cost Optimization - $200K savings, 2 months
3. ✅ Self-Service Portal - User satisfaction +30%, 4 months

**Foundation (Parallel Track 2):**
4. 🏗️ Cloud Landing Zone - Prerequisite for all cloud initiatives, 5 months
5. 🏗️ Identity & Access Management - Security foundation, 4 months
6. 🏗️ Data Governance Framework - Data platform prerequisite, 6 months

**Value Delivered:** $650K cost savings + IAM security posture
**Dependencies:** Wave 2 blocked until items #4, #5 complete
**Risk:** Resource contention between quick wins and foundation

---

**WAVE 2: Platform & Capabilities** (Months 7-12)
*Theme: Build + Integrate*

**Platform Track:**
7. 🔧 Data Platform Migration (depends on #6) - 6 months
8. 🔧 Cloud-Native Application Platform (depends on #4, #5) - 5 months
9. 🔧 API Gateway & Integration Hub (depends on #8) - 4 months

**Capability Track:**
10. 🔧 Customer 360 View (depends on #7) - 5 months
11. 🔧 Real-Time Analytics Engine (depends on #7) - 4 months

**Value Delivered:** Modern platform + customer insights
**Dependencies:** Wave 3 digital services require #9, #10
**Risk:** Data migration complexity (item #7)

---

**WAVE 3: Innovation & Scale** (Months 13-18)
*Theme: Transform + Optimize*

**Digital Services:**
12. 🚀 AI-Powered Recommendations (depends on #10, #11) - 4 months
13. 🚀 Omnichannel Experience Platform (depends on #9, #10) - 5 months
14. 🚀 Predictive Maintenance (depends on #11) - 3 months

**Optimization:**
15. 🚀 Automated DevOps Pipeline (depends on #8) - 4 months

**Value Delivered:** Digital transformation + operational excellence
**Dependencies:** None (final wave)
**Risk:** Adoption challenges (change management critical)

---

**Investment Summary:**
- Wave 1: $2.8M (Foundation + Quick Wins)
- Wave 2: $4.5M (Platform Build)
- Wave 3: $3.2M (Digital Services)
- **Total:** $10.5M over 18 months

**Value Realization:**
- Immediate (Wave 1): $650K cost savings
- Mid-term (Wave 2): $1.2M revenue enablement
- Long-term (Wave 3): $3.5M competitive advantage

**Critical Path:**
#4 (Landing Zone) → #7 (Data Platform) → #10 (Customer 360) → #13 (Omnichannel)
**Timeline:** 17 months (covers majority of roadmap)

**Resource Smoothing:**
- Max parallel initiatives: 4 (within capacity)
- Peak resource load: Month 7-9 (Wave 1/2 overlap)
- Recommend: Hire 2 contractors for 3-month bridge

Would you like me to generate Gantt chart coordinates or dependency graph?
```

---

## WhiteSpot Heatmap AI Guidance

### Understanding the Heatmap

**Prompt:**
```
"Explain the WhiteSpot Heatmap to me"
```

**AI Response:**
```
The WhiteSpot Heatmap is your service delivery assessment tool. Here's how it works:

**🎯 Purpose:**
Assess coverage of 41 Vivicta DCS High-Level services across 3 L1 areas to identify 
gaps (white-spots) as upsell opportunities.

**📊 Service Hierarchy:**
L1 Service Area (3 total)
├─ Consulting & Project Services
├─ Managed Services
└─ Platform Services
    └─ L2 High-Level Service (41 total, HL-tagged)
        └─ L3 Delivery Components (varies, DL-tagged)

**🎨 5 Assessment States:**

1. **FULL** (Green ✓)
   - All L3 components delivered
   - Complete service coverage
   - Example: "We deliver full Cloud Infrastructure including compute, storage, 
     network, monitoring, and backup"

2. **PARTIAL** (Yellow ⚠)
   - Some L3 components delivered, gaps exist
   - Upsell opportunity to complete the service
   - Example: "We deliver cloud compute and storage, but missing network security 
     and monitoring"

3. **CUSTOM** (Blue ⚙)
   - Bespoke solution tailored to specific needs
   - Not standard service offering
   - Example: "Custom IoT data pipeline built for this customer only"

4. **LOST** (Red ✗)
   - Service not currently delivered
   - HIGH PRIORITY upsell opportunity
   - Example: "We don't provide data governance services"

5. **POTENTIAL** (Orange 💡)
   - Planned service or high-value opportunity
   - Early-stage or prospecting
   - Example: "Identified need for AI/ML platform but not yet proposed"

**📈 Key Metrics:**
- **Coverage Score:** % of services marked FULL
- **Gap Count:** Number of LOST + PARTIAL services
- **Opportunity Value:** Estimated $ from closing gaps
- **L1 Distribution:** Coverage across 3 service areas

**🔍 How to Use:**
1. Select customer from dropdown
2. Assess each of 41 services (click row → select state)
3. Drill down into L3 components for detailed assessment
4. Generate APQC mappings to understand business context
5. Create opportunities from LOST/PARTIAL services
6. Use analytics dashboard to visualize coverage

**💡 Pro Tip:**
Focus on LOST services that align to customer's strategic priorities and have 
strong APQC capability mappings. These are your highest-value upsell targets.

Would you like me to walk you through assessing your first service?
```

### Assessing a Service

**Prompt:**
```
"How do I assess a service on the heatmap?"
```

**AI Response:**
```
I'll guide you through the service assessment process step-by-step:

**📋 Service Assessment Workflow**

**Step 1: Open Service Drill-Down**
1. Navigate to WhiteSpot Heatmap tab
2. Find the service in the accordion (organized by L1 area)
3. Click on the service row
4. A large modal opens with 3 tabs

**Step 2: Choose Assessment State** (Tab 1: Assessment)
Select one of 5 states based on delivery reality:
- ✅ **FULL:** All components delivered → Choose this if you deliver complete service
- ⚠️ **PARTIAL:** Some gaps → Choose this if missing some L3 components
- ⚙️ **CUSTOM:** Bespoke solution → Choose this for one-off custom builds
- ✗ **LOST:** Not delivered → Choose this if not currently offering
- 💡 **POTENTIAL:** Opportunity identified → Choose this for prospecting

**Step 3: Track L3 Components** (Tab 2: L3 Components)
1. Review list of delivery components for this service
2. Check/uncheck which components you deliver
3. Score auto-calculates based on % delivered:
   - 100% = FULL
   - 75-99% = PARTIAL (typically)
   - 50-74% = PARTIAL
   - 0-49% = LOST (typically)
4. Add notes for each component (optional)

**Step 4: Map to APQC** (Tab 3: APQC Mappings)
1. Click "Generate AI Suggestions"
2. Review AI-generated mappings with confidence scores
3. Each mapping shows:
   - APQC Code (e.g., 10731)
   - Process Name (e.g., "Manage Enterprise Data")
   - Level (L2, L3, L4)
   - Confidence Score (0-100%)
4. Accept or override mappings
5. Use mappings to understand business value context

**Step 5: Save Assessment**
1. Click "Save" in the modal
2. Service row updates with new state and color
3. Heatmap stats recalculate automatically

**💡 Example: Assessing "Data Governance Services"**

**Scenario:** Customer has basic data quality checks but no governance framework

**Assessment Decision:**
- Current Delivery:
  ✓ Data profiling and quality rules (component)
  ✓ Data stewardship roles defined (component)
  ✗ Master data management platform (component) ← MISSING
  ✗ Data catalog and lineage (component) ← MISSING
  ✗ Governance policies and controls (component) ← MISSING

**L3 Score:** 2/5 = 40% delivered

**Recommended State:** PARTIAL (yellow)
- Rationale: Some foundation exists (profiling, roles) but missing core platform 
  and governance framework
- Upsell Opportunity: $400K-$600K to complete MDM platform + data catalog + policies

**APQC Mappings Generated:**
- 10731: Manage Enterprise Data (L3) - 95% confidence ✓
- 10732: Establish Data Governance (L4) - 92% confidence ✓
- 10058: Manage Data Quality (L4) - 88% confidence ✓

**Next Action:** Create opportunity record for "Complete Data Governance Framework"

---

**⚡ Quick Assessment Tips:**

1. **Start with Consulting Services:** Usually easiest to assess (you know what 
   you delivered)
2. **Use Bulk Operations:** If many services are same state, use "Bulk Set State" 
   feature
3. **Generate APQC First:** Understanding business context helps with accurate 
   assessment
4. **Review with Delivery Team:** Don't guess - validate with people who delivered
5. **Update Regularly:** Reassess quarterly as delivery evolves

**🎯 Goal:** Accurate assessment enables precise gap analysis and targeted upsell 
strategies.

Need help with a specific service? Tell me which one and I'll guide you!
```

### Finding Opportunities

**Prompt:**
```
"Show me how to identify opportunities from the heatmap"
```

**AI Response:**
```
I'll show you how to turn service gaps into monetizable opportunities:

**🎯 Opportunity Identification Framework**

**Step 1: Analyze Heatmap for Gaps**
1. Open Analytics Dashboard (button in heatmap header)
2. Review "Gap Analysis" section:
   - Lists all LOST and PARTIAL services
   - Sorted by L1 area
   - Shows missing L3 component count
3. Look for patterns:
   - ⚠️ **Red Flags:** Multiple LOST services in same L1 area = major gap
   - 💡 **Quick Wins:** PARTIAL services = small upsell to complete
   - 🎯 **Strategic Fit:** LOST services that align to customer priorities

**Step 2: Filter for High-Value Targets**
Use filters to focus:
```
Filter by: State = LOST
Sort by: Has Opportunities = Yes
L1 Area: Platform Services (usually highest value)
```
Result: List of undelivered platform services with business drivers

**Step 3: Validate with APQC**
For each gap:
1. Check APQC mappings
2. High confidence (>85%) = strong business case
3. Match APQC capability to customer's industry needs
4. Example:
   - LOST Service: "Data Governance"
   - APQC: 10731 Manage Enterprise Data (95% confidence)
   - Customer: Financial Services → Regulatory requirements
   - **Conclusion:** HIGH priority opportunity

**Step 4: Create Opportunity Record**
1. Click "Add Opportunity" in drill-down modal or opportunities section
2. Fill in:
   - **Title:** "Implement Enterprise Data Governance Framework"
   - **Description:** "Deploy MDM platform, data catalog, and governance policies 
     to address regulatory compliance requirements (GDPR, SOX)"
   - **Estimated Value:** $850,000 (use industry benchmarks)
   - **Priority:** High
   - **Status:** Identified
   - **Target Close Date:** Q2 2026
3. Save opportunity

**Step 5: Prioritize Opportunities**
Use this scoring model:

**Opportunity Score = (Business Value × Strategic Fit × Feasibility) / 10**

- **Business Value (1-10):**
  - Revenue potential
  - Cost savings enabled
  - Competitive advantage
  
- **Strategic Fit (1-10):**
  - Aligns to customer priorities (high = 9-10)
  - Addresses pain point (high = 8-10)
  - Regulatory/compliance driver (high = 9-10)
  
- **Feasibility (1-10):**
  - Customer readiness (budget, sponsorship)
  - Our capability to deliver
  - Timeline practicality

**Example Calculation:**
```
Data Governance Opportunity:
- Business Value: 9 ($850K + compliance = high impact)
- Strategic Fit: 10 (regulatory mandate = critical)
- Feasibility: 7 (budget approved, 6-month timeline tight)

Score = (9 × 10 × 7) / 10 = 63/100 = HIGH PRIORITY ✓
```

**Step 6: Export Opportunities**
1. Click "Export Opportunities" (bulk operations)
2. Download CSV with all gaps
3. Share with sales team for pipeline review

---

**🎯 Real-World Example**

**Customer:** MidCorp Financial Services  
**Industry:** Banking  
**Current Coverage:** 68% (28 FULL, 8 PARTIAL, 5 LOST)

**Gap Analysis Results:**

**LOST Services (5):**
1. Data Governance Services - APQC 10731 (95%) - $850K
2. Regulatory Compliance Automation - APQC 10732 (92%) - $450K
3. AI/ML Platform Services - APQC 10055 (78%) - $600K
4. Advanced Threat Protection - APQC 10019 (88%) - $350K
5. Business Process Mining - APQC 10032 (72%) - $200K

**Prioritization:**

**Tier 1 (Lead with these):**
- #1 Data Governance: Score 63 (regulatory driver)
- #2 Compliance Automation: Score 58 (regulatory + efficiency)

**Tier 2 (Bundle or follow-up):**
- #4 Threat Protection: Score 52 (security mandate)
- #3 AI/ML Platform: Score 48 (innovation initiative)

**Tier 3 (Long-term):**
- #5 Process Mining: Score 35 (nice-to-have)

**Recommended Approach:**
1. **Immediate:** Propose "Governance + Compliance" package ($1.3M) - addresses 
   urgent regulatory needs
2. **Phase 2 (Q3):** Add Threat Protection as security enhancement ($350K)
3. **Phase 3 (2027):** AI/ML Platform after data foundation is solid ($600K)

**Total Opportunity Pipeline:** $2.45M from WhiteSpot gaps alone!

---

**💡 Pro Tips:**

✅ **Don't Chase Every Gap:** Focus on 3-5 high-impact opportunities  
✅ **Link to Business Drivers:** Use APQC to articulate business value  
✅ **Bundle Logically:** Group related services (e.g., Data + Governance)  
✅ **Update Regularly:** Reassess quarterly as delivery evolves  
✅ **Use Analytics Dashboard:** Visualize patterns across portfolio  

Need help prioritizing your specific opportunities? Share your heatmap stats and 
I'll analyze!
```

---

## APQC Integration AI Support

### Understanding APQC Mappings

**Prompt:**
```
"What is APQC and how does it help with WhiteSpot analysis?"
```

**AI Response:**
```
APQC (American Productivity & Quality Center) is a process classification framework 
that helps you connect services to business capabilities. Here's how it works:

**📚 APQC Framework Structure**

**4 Levels of Granularity:**
- **L1:** Process Categories (13 total)
  - Example: "1.0 Develop Vision and Strategy"
- **L2:** Process Groups (~100 total)
  - Example: "10.0 Manage Information Technology"
- **L3:** Processes (~500 total)
  - Example: "10731 Manage Enterprise Data"
- **L4:** Activities (~1500 total)
  - Example: "10732 Establish Data Governance Policies"

**3 Process Types:**
1. **Operating Processes:** Core business activities (1.0-8.0)
2. **Management & Support:** Enabling functions (9.0-12.0)
3. **Industry-Specific:** Tailored by sector (13.0+)

---

**🔗 How APQC Connects to WhiteSpot Heatmap**

**The Problem APQC Solves:**
When you identify a service gap (LOST or PARTIAL), you need to answer:
- **Why does the customer need this service?**
- **What business capability does it enable?**
- **How do we articulate ROI to executives?**

**The APQC Solution:**
Map services → APQC capabilities → Business value

**Example Flow:**

```
Vivicta Service: "Data Governance Services" (LOST)
       ↓
APQC Mapping: 10731 "Manage Enterprise Data" (L3)
       ↓
Business Capability: Enterprise data management, quality, stewardship
       ↓
Customer Context: Financial services → Regulatory compliance (GDPR, SOX)
       ↓
Business Case: "You lack enterprise data governance (APQC 10731), which creates 
               regulatory risk and limits analytics capabilities. Our Data 
               Governance service addresses this by implementing MDM, data catalog, 
               and governance policies."
       ↓
Value Articulation: - Compliance: Avoid $5M+ GDPR fines
                    - Quality: Reduce data errors by 60%
                    - Analytics: Enable trusted reporting for decisions
```

---

**🤖 AI-Powered Semantic Matching**

When you click "Generate APQC Mappings," the AI uses this algorithm:

**Confidence Score = (Keyword Match × 60%) + (Description Match × 20%) + (Strategic Alignment × 20%)**

**Example: "Data Governance Services"**

**Keyword Analysis (60%):**
- Service keywords: [data, governance, management, quality, stewardship]
- APQC 10731 keywords: [enterprise, data, management, governance]
- Match Score: 85% × 60% = 51 points

**Description Overlap (20%):**
- Service description mentions: "policies, catalog, lineage"
- APQC 10731 description includes: "policies, standards, stewardship"
- Match Score: 75% × 20% = 15 points

**Strategic Alignment (20%):**
- Service area: Platform Services → IT Management
- APQC category: 10.0 Manage Information Technology
- Match Score: 95% × 20% = 19 points

**Total Confidence: 51 + 15 + 19 = 85%** ✓ HIGH CONFIDENCE

---

**✅ How to Use APQC Mappings in WhiteSpot**

**Step 1: Generate Mappings**
1. Open service drill-down modal
2. Go to "APQC Mappings" tab
3. Click "Generate AI Suggestions"
4. Review suggestions (typically 3-5 mappings)

**Step 2: Validate Mappings**
Look for:
- **High confidence (>85%):** Usually accurate, trust the AI
- **Medium confidence (70-84%):** Review description for fit
- **Low confidence (<70%):** Manually search for better match

**Step 3: Use Mappings in Sales Process**
- **Discovery:** "Based on APQC benchmarks, companies in your industry typically 
  have mature data governance (10731). Where are you on that journey?"
- **Value Case:** "Our Data Governance service directly addresses APQC capability 
  10731, which industry benchmarks show reduces data incidents by 60%"
- **Executive Presentation:** Use APQC codes as industry-standard terminology

**Step 4: Link to Opportunities**
When creating opportunity from gap:
```
Title: "Implement Enterprise Data Governance Framework"
Description: "Deploy APQC 10731-aligned data governance including MDM platform, 
data catalog, and governance policies to address regulatory compliance"
APQC Codes: 10731, 10732, 10058
```

---

**📊 APQC Data Source**

**Included in Platform:**
- **File:** `/NexGenEA/EA2_Toolkit/data/apqc_pcf_master.json`
- **Version:** v8.0 Cross-Industry
- **Coverage:** L1-L4 complete hierarchy
- **Integration:** `apqc_whitespot_integration.js`

**Access Methods:**
1. **UI:** WhiteSpot Heatmap → Service Drill-Down → APQC tab
2. **Search:** Use APQC code or keyword to find processes
3. **Browse:** Hierarchical navigation (L1 → L2 → L3 → L4)

---

**💡 Advanced Use Cases**

**1. Reverse Mapping (Business → Services):**
```
Customer says: "We need better IT service management"
       ↓
Search APQC: "IT service management" → 10038 "Manage IT Services" (L3)
       ↓
Find Services: Which Vivicta services map to APQC 10038?
       ↓
Result: "Service Desk Management," "Incident & Problem Management"
       ↓
Action: Propose these services as solution
```

**2. Gap Validation:**
```
Customer claims: "We have good data governance"
       ↓
Check WhiteSpot: Data Governance = PARTIAL (only 40% L3 delivered)
       ↓
APQC Benchmark: Industry standard is 75%+ maturity for APQC 10731
       ↓
Gap Identified: 35% maturity gap vs. industry
       ↓
Value Prop: "You're at 40% maturity vs. 75% industry benchmark (APQC 10731). 
            Here's what's missing..."
```

**3. Portfolio Planning:**
```
Customer: "What capabilities should we prioritize?"
       ↓
Map Current State: All FULL services → APQC codes
       ↓
Identify Coverage: Which APQC L2 categories have <50% coverage?
       ↓
Result: "You're strong in 10.0 Manage IT (80% coverage) but weak in 
        10.7 Manage Data (30% coverage)"
       ↓
Recommendation: Focus on data services for balanced capability portfolio
```

---

**🎓 Learning Resources**

**Official APQC Resources:**
- Website: apqc.org/process-classification-framework
- Industry Benchmarks: apqc.org/benchmarks
- Best Practices: apqc.org/knowledge-base

**In-Platform Help:**
- WhiteSpot User Guide: Section 7 (Advanced Features → APQC Integration)
- Implementation Summary: APQC mapping algorithm details

Want me to help you map a specific service? Just tell me the service name!
```

---

## Best Practices

### Effective Prompting

**DO:**
✅ **Be specific about context**
```
Good: "Analyze service coverage for MidCorp Financial Services, focusing on 
       regulatory compliance services"
Poor: "Analyze coverage"
```

✅ **Ask follow-up questions**
```
AI: "I recommend marking Data Governance as PARTIAL"
You: "Why PARTIAL and not LOST? What L3 components are we delivering?"
```

✅ **Reference current work**
```
"I'm on step E1.2 and looking at the WhiteSpot Heatmap. What should I focus on 
 to identify upsell opportunities?"
```

✅ **Request specific formats**
```
"Generate a 5-point summary of top risks"
"Create a table comparing 3 architecture options"
"Provide a checklist for stakeholder engagement"
```

**DON'T:**
❌ **Ask overly broad questions**
```
"Tell me everything about EA"
"What should I do?" (without context)
```

❌ **Expect AI to make final decisions**
```
AI provides recommendations with confidence scores
You make the final call based on your judgment
```

❌ **Ignore the 5-question pattern**
```
AI asks questions for good reason - answer them thoroughly
Provides better, more accurate recommendations
```

### Getting the Most Value

**1. Use Quick Prompts for Common Tasks**
- Faster than typing
- Pre-optimized for best results
- Covers 80% of use cases

**2. Leverage Context Awareness**
- AI knows what phase/step you're in
- Automatically tailors guidance
- No need to re-explain every time

**3. Reference Documentation**
- Ask: "Show me the section in the user guide about X"
- AI will point you to specific docs
- Faster than searching manually

**4. Iterate and Refine**
```
You: "Help me assess services"
AI: [Provides recommendations]
You: "Great, but can you focus only on Platform Services?"
AI: [Refines to platform-only recommendations]
```

**5. Save Valuable Responses**
- Copy AI recommendations to notes
- Use as templates for future engagements
- Build your own prompt library

---

## Advanced Features

### Command Shortcuts

**Quick Actions:**
Type these commands for instant results:

```
/help          → Show this guide
/docs          → List all documentation
/context       → Show current context (phase, step, canvas)
/clear         → Clear conversation history
/export        → Export chat transcript
/suggest       → Get quick prompt suggestions
```

### Multi-Turn Conversations

**Complex Analysis:**
```
Turn 1: "Analyze the WhiteSpot Heatmap"
Turn 2: "Now focus only on LOST services"
Turn 3: "Which of those align to APQC data management?"
Turn 4: "Create an opportunity list for those 3 services"
Turn 5: "Export that as a CSV"
```

AI maintains context across all turns!

### Integration with Toolkits

**Connected Systems:**
When you have integrations active, AI leverages them:

```
APQC Connected:
→ AI provides industry benchmarks
→ References APQC codes in recommendations
→ Validates capability maturity

APM Toolkit Connected:
→ AI analyzes application portfolio data
→ Suggests rationalization based on actual metrics
→ Links applications to capabilities

BMC Connected:
→ AI imports stakeholders from Business Model Canvas
→ Aligns value propositions to service gaps
→ Connects customer segments to service offerings
```

---

## Troubleshooting

### Common Issues

**Issue: AI responses are generic**
**Solution:** Provide more context in your prompt
```
Instead of: "Help me"
Try: "I'm in Phase E1.2, working with a financial services customer. Help me 
      identify service gaps in their data platform capabilities."
```

**Issue: AI asks too many questions**
**Solution:** Provide upfront context to skip questions
```
"Customer: RetailCo, Industry: Retail, Size: 500 employees, Budget: $2M, 
 Timeline: 12 months. Help me scope the engagement."
```

**Issue: AI recommendations don't match customer reality**
**Solution:** Override with your expertise
```
AI: "I recommend FULL state for Data Governance"
You: "Actually, we only deliver data quality checks, not full governance. 
      I'll mark as PARTIAL instead."
```

**Issue: Chat panel won't open**
**Solution:**
1. Check if AI assistant script is loaded (F12 console)
2. Verify Azure OpenAI connection
3. Clear browser cache and reload
4. Check for JavaScript errors

**Issue: Slow responses**
**Solution:**
- Azure OpenAI may be under load (wait 30 seconds)
- Check internet connection
- Try shorter, more focused prompts
- Clear conversation history (/clear)

---

## FAQ

### General Questions

**Q: Is my data private?**
A: Yes. AI conversations are:
- Processed via Azure OpenAI (enterprise-grade security)
- Not used to train public models
- Stored locally in browser session
- Cleared when you close the browser (unless you export)

**Q: Can AI modify my data?**
A: No. AI provides recommendations only. You must:
- Click buttons to save changes
- Confirm updates to engagement
- Manually apply suggested edits

**Q: Does AI work offline?**
A: No. Requires internet connection to Azure OpenAI.

**Q: What AI model is used?**
A: GPT-4 or GPT-5 (depending on Azure OpenAI deployment)

### WhiteSpot Heatmap Questions

**Q: Can AI automatically assess all services?**
A: No, but it can:
- Recommend states based on context
- Suggest L3 component delivery
- Generate APQC mappings
- You still manually click "Save" for each

**Q: How accurate are APQC mappings?**
A: Confidence scores indicate accuracy:
- >85%: High confidence, usually correct
- 70-84%: Medium confidence, review recommended
- <70%: Low confidence, manual validation needed

**Q: Can AI create opportunities automatically?**
A: Not yet (roadmap feature). Currently:
- AI identifies gaps
- Recommends opportunity details
- You manually create opportunity record

### Advanced Questions

**Q: Can I customize AI prompts?**
A: System prompts are pre-configured, but you can:
- Provide detailed context in your messages
- Use follow-up questions to refine
- Reference specific documentation sections

**Q: Can AI analyze multiple customers at once?**
A: Yes, in Growth Dashboard:
```
"Analyze WhiteSpot coverage across all my accounts and identify 
 common gaps in Platform Services"
```

**Q: Does AI learn from my corrections?**
A: No (stateless conversation), but you can:
- Build a library of effective prompts
- Document your preferences
- Share prompts with team

---

## Quick Reference Card

### Top 10 Prompts

**Engagement Workflow:**
1. "Help me define engagement scope" (E0.1)
2. "Identify key stakeholders" (E0.2)
3. "What should I do next in this phase?"

**WhiteSpot Heatmap:**
4. "Analyze service coverage and identify top 3 upsell opportunities"
5. "Generate APQC mappings for [service name]"
6. "Explain why [service] should be marked PARTIAL vs LOST"

**Analysis & Planning:**
7. "Identify sunset candidates in application portfolio" (E1.1)
8. "Sequence 10 initiatives into a roadmap" (E4.2)
9. "Create value case for [initiative name]"

**Growth Dashboard:**
10. "Which accounts have the highest growth potential based on service gaps?"

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Toggle AI panel |
| `Ctrl+Enter` | Send message |
| `Esc` | Close AI panel |
| `/help` | Show help |
| `/clear` | Clear history |

### Quick Tips

💡 **Context is King:** More context = better recommendations  
💡 **Ask "Why?":** AI explains its reasoning  
💡 **Iterate:** Refine responses with follow-ups  
💡 **Reference Docs:** AI knows all user guides  
💡 **Trust but Verify:** AI provides confidence scores for a reason  

---

**Need More Help?**

- 📖 [WhiteSpot Heatmap User Guide](WHITESPOT_HEATMAP_USER_GUIDE.md)
- 📖 [APQC Integration Guide](APQC_CAPABILITY_MAPPING_INTEGRATION.md)
- 📖 [EA Engagement Playbook Documentation](MULTI_ENGAGEMENT_GUIDE.md)
- 💬 Ask the AI: "Show me how to [your question]"

---

**Document Version:** 2.0  
**Last Updated:** April 20, 2026  
**Prepared By:** EA2 Toolkit Team  
**Status:** ✅ Complete and Ready for Use
