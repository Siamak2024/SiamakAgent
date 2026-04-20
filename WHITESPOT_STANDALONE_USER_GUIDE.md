# WhiteSpot Heatmap - Standalone Mode User Guide

**Version**: 1.0  
**Date**: April 20, 2026  
**Purpose**: Service delivery opportunity analysis for prospects and customers

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use Standalone vs. Integrated Mode](#when-to-use-standalone-vs-integrated-mode)
3. [Getting Started](#getting-started)
4. [Managing Prospects & Customers](#managing-prospects--customers)
5. [Creating & Using Heatmaps](#creating--using-heatmaps)
6. [Service Assessment Workflow](#service-assessment-workflow)
7. [APQC Integration](#apqc-integration)
8. [Import & Export](#import--export)
9. [Use Cases & Examples](#use-cases--examples)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Overview

### What is WhiteSpot Heatmap Standalone Mode?

The **WhiteSpot Heatmap Standalone Tool** is a lightweight, independent version of the WhiteSpot service delivery assessment feature that can be used **without running a full EA engagement workflow**.

**Key Benefits**:
- ✅ Quick prospect analysis for sales teams
- ✅ Service delivery opportunity mapping for new leads
- ✅ Standalone heatmap creation and sharing
- ✅ No dependency on formal EA engagement setup
- ✅ Works independently or syncs with full EA Engagement Playbook
- ✅ Built-in data persistence (browser localStorage)

### What is WhiteSpot Analysis?

WhiteSpot Analysis visualizes service delivery coverage across **41 Vivicta DCS High-Level (HL) services** organized into **3 L1 service areas**:

1. **Business Consulting** (19 services)
2. **Technology Consulting** (13 services)
3. **Managed Services** (9 services)

Each service can be assessed with **5 states**:
- 🟩 **FULL** - Complete service delivery with all components
- 🟨 **PARTIAL** - Some components delivered
- 🟦 **CUSTOM** - Customized/tailored delivery
- 🟥 **LOST** - Previously delivered, now lost to competitor
- ⬜ **POTENTIAL** - Not yet delivered, opportunity exists

### Vivicta DCS Service Hierarchy

- **L1**: Service Area (Business/Technology/Managed)
- **L2**: High-Level (HL) Service (41 total)
- **L3**: Detailed-Level (DL) Components (multiple per HL service)

Example:
```
L1: Business Consulting
└── L2: Enterprise Risk Management (HL Service)
    ├── L3: Risk Framework Design
    ├── L3: Risk Assessment & Modeling
    ├── L3: Compliance Management
    └── L3: Risk Reporting & Analytics
```

---

## When to Use Standalone vs. Integrated Mode

### Use **Standalone Mode** When:

✅ **Prospect Analysis**: Quickly assess service opportunities for new leads  
✅ **Sales Support**: Customer engagement teams need service delivery visualization  
✅ **Pre-Engagement**: Evaluate opportunities before formal EA engagement  
✅ **Lead Qualification**: Identify whitespace gaps to prioritize prospects  
✅ **Account Planning**: Map service coverage for existing customers  
✅ **Team Collaboration**: Share heatmap data across teams without full engagement context  

### Use **Integrated Mode** (EA Engagement Playbook) When:

✅ **Full EA Engagement**: Running complete E0-E5 workflow  
✅ **Multi-Customer Portfolio**: Managing multiple engagements simultaneously  
✅ **Deliverable Generation**: Creating formal EA outputs and documentation  
✅ **Architecture Planning**: Linking service gaps to target architecture  
✅ **Roadmap Development**: Connecting opportunities to transformation initiatives  

### Can I Use Both?

**Yes!** You can:
1. Start in **Standalone** for quick prospect analysis
2. **Export** heatmap data as JSON
3. **Import** into full EA Engagement Playbook when engagement is confirmed
4. Continue with full E0-E5 workflow

---

## Getting Started

### Accessing the Tool

**Option 1: Direct URL**
```
https://your-domain.com/NexGenEA/EA2_Toolkit/WhiteSpot_Standalone.html
```

**Option 2: From EA Engagement Playbook**
- Click the **External Link** icon in the header toolbar
- Opens in new tab/window

### First Launch

When you first open the standalone tool:

1. **Empty State**: No prospects or customers yet
2. **Two Options**:
   - **Add Prospect/Customer** - Enter real data
   - **Load Demo Data** - Explore with sample data

### Loading Demo Data

To explore features with sample data:

1. Click **"Load Demo Data"** button
2. Demo generates:
   - 3 sample customers (Financial Services, Manufacturing, Retail)
   - 3 complete heatmaps with varied assessments
   - Opportunities and APQC mappings
3. Data saved to browser localStorage
4. Explore features with realistic scenarios

### Clear Demo Data

When ready to use real data:
1. Click **"Clear All"** button in toolbar
2. Confirm deletion
3. All demo data removed
4. Start fresh with real prospects

---

## Managing Prospects & Customers

### Adding a New Prospect/Customer

**Step 1: Click "Add Prospect/Customer"**

**Step 2: Fill Out Form**

**Required Fields**:
- **Name** - Company name (e.g., "Acme Corporation")
- **Type** - Prospect / Customer / Partner

**Optional Fields**:
- **Industry** - e.g., Financial Services, Manufacturing
- **Region** - e.g., EMEA, North America, APAC
- **Annual Revenue** - e.g., $500M
- **Employees** - e.g., 5,000
- **Contact Person** - Primary contact name
- **Email** - Contact email
- **Phone** - Contact phone
- **Notes** - Additional context

**Step 3: Save**

- Click **"Save"** button
- Prospect added to system
- Automatically selected for heatmap creation

### Example: Adding a Prospect

```
Name: Global Bank International
Type: Prospect
Industry: Financial Services
Region: EMEA
Revenue: $2.5B
Employees: 12,000
Contact: Jane Smith
Email: jane.smith@globalbank.com
Phone: +44 20 1234 5678
Notes: Interested in Digital Transformation consulting.
       Current providers: IBM, Accenture.
       Potential opportunity in Cloud Migration.
```

### Editing a Prospect/Customer

1. Select customer from dropdown (when heatmap exists)
2. Click **Edit** icon in heatmap header
3. Update information
4. Save changes

### Deleting a Prospect/Customer

⚠️ **Warning**: Deleting a prospect also deletes all associated heatmaps.

1. Select customer
2. Click **Delete** button
3. Confirm deletion
4. Data permanently removed

---

## Creating & Using Heatmaps

### Creating Your First Heatmap

**Step 1: Add Prospect** (if not already added)

**Step 2: Click "Create Heatmap"**
- Button appears when viewing a prospect without a heatmap
- Creates empty heatmap with all 41 HL services set to "POTENTIAL"

**Step 3: Start Assessing Services**
- Heatmap grid displays all services grouped by L1 area
- Each service shows as a colored tile
- Default state: POTENTIAL (white/light gray)

### Heatmap Grid Layout

```
┌─────────────────────────────────────────────────────┐
│ WhiteSpot Heatmap - Global Bank International      │
│ Assessment Date: 2026-04-20 | Assessed By: You     │
├─────────────────────────────────────────────────────┤
│                                                      │
│ BUSINESS CONSULTING (19 services)                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │Strategic│ │Business │ │Process  │  ...          │
│ │Planning │ │Model    │ │Optim.   │               │
│ │ FULL ✓  │ │PARTIAL ~│ │POTENTIAL│               │
│ └─────────┘ └─────────┘ └─────────┘               │
│                                                      │
│ TECHNOLOGY CONSULTING (13 services)                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │Cloud    │ │Data &   │ │Security │  ...          │
│ │Strategy │ │Analytics│ │Advisory │               │
│ │ CUSTOM  │ │ FULL ✓  │ │ LOST ✗  │               │
│ └─────────┘ └─────────┘ └─────────┘               │
│                                                      │
│ MANAGED SERVICES (9 services)                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │App      │ │Infra    │ │Cloud    │  ...          │
│ │Support  │ │Mgmt     │ │Ops      │               │
│ │PARTIAL ~│ │POTENTIAL│ │POTENTIAL│               │
│ └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────┘
```

### Color Coding

- 🟩 **Green** - FULL (Complete delivery)
- 🟨 **Yellow** - PARTIAL (Some components)
- 🟦 **Blue** - CUSTOM (Tailored delivery)
- 🟥 **Red** - LOST (Lost to competitor)
- ⬜ **White/Gray** - POTENTIAL (Opportunity)

### Heatmap Metadata

Edit heatmap information:
- **Assessment Date** - When analysis was performed
- **Assessed By** - Who performed the assessment
- **Description** - Purpose/context of assessment
- **Comments** - Additional notes

---

## Service Assessment Workflow

### How to Assess a Service

**Step 1: Click on Service Tile**
- Opens assessment modal
- Shows service details and L3 components

**Step 2: Select Assessment State**

Choose appropriate state:

**FULL - Complete Service Delivery**
- All L3 components are delivered
- Customer receives full value
- No gaps in capability
- Example: All 8 Cloud Strategy components delivered

**PARTIAL - Some Components Delivered**
- Only some L3 components delivered
- Gaps exist in service coverage
- Opportunity to expand
- Example: 3 out of 8 Cloud Strategy components

**CUSTOM - Customized/Tailored**
- Non-standard delivery approach
- Bespoke solution for customer
- May differ from standard offering
- Example: Custom Cloud Strategy for specific industry

**LOST - Previously Delivered, Now Lost**
- Service was delivered in the past
- Now provided by competitor
- Win-back opportunity
- Example: Lost Cloud Migration to AWS partner

**POTENTIAL - Not Yet Delivered**
- Service not currently delivered
- Whitespace opportunity
- No existing relationship
- Example: Never provided Cloud Strategy

**Step 3: Track L3 Components (Optional)**

For detailed assessment:
- Check boxes for delivered L3 components
- System calculates coverage score
- Example: 5/8 components = 62.5% score

**Step 4: Add Notes**
- Context about current state
- Competitor information
- Customer pain points
- Opportunity details

**Step 5: Estimate Opportunity Value** (Optional)
- Annual contract value (ACV)
- Total contract value (TCV)
- Helps prioritize opportunities

**Step 6: Map to APQC** (Optional)
- Link service to relevant APQC processes
- Understand customer capability needs
- See [APQC Integration](#apqc-integration) section

**Step 7: Save Assessment**
- Click "Save"
- Service tile updates with new state
- Data persisted to localStorage

### Example: Assessing Cloud Strategy Service

**Scenario**: Prospect "Global Bank International" is evaluating cloud transformation.

**Assessment**:
```
Service: Cloud Strategy & Planning
L1 Area: Technology Consulting
Current State: PARTIAL

L3 Components:
☑ Cloud Readiness Assessment
☑ Cloud Strategy Development
☐ Cloud Economics & Business Case
☑ Multi-Cloud Architecture Design
☐ Cloud Security Strategy
☐ Cloud Migration Planning
☐ Cloud Governance Framework
☐ Cloud Operating Model Design

Coverage: 3/8 = 37.5%

Notes:
- Current provider: IBM (basic assessment only)
- Customer wants comprehensive multi-cloud strategy
- Opportunity: Full cloud strategy engagement
- Competitors: Accenture, Deloitte
- Key stakeholder: CTO Jane Smith

Opportunity Value: $350K (6-month engagement)

APQC Mapped Processes:
- 10420: Develop enterprise architecture
- 10428: Manage technology standards
- 11024: Develop IT strategy
```

**Result**:
- Service tile shows **YELLOW (PARTIAL)**
- Coverage indicator: **38%**
- Opportunity added to list
- Can be expanded to FULL delivery

---

## APQC Integration

### What is APQC?

**APQC** (American Productivity & Quality Center) **Process Classification Framework** is a standardized business process model with **1,200+ processes** organized in **4 levels**:

- **L1**: Operating Process (13 categories)
- **L2**: Process Group (~100 groups)
- **L3**: Process (~400 processes)
- **L4**: Activity (~700+ activities)

### Why Map WhiteSpot Services to APQC?

**Benefits**:
1. **Understand Customer Needs**: What processes does the customer need to improve?
2. **Align Offerings**: Match Vivicta services to customer capabilities
3. **Speak Customer Language**: Frame discussions in process terms
4. **Identify Gaps**: See where customer lacks process capability
5. **Build Business Case**: Connect services to business outcomes

### How Mapping Works

The system uses **semantic matching** to suggest relevant APQC processes for each Vivicta DCS service:

**Matching Algorithm**:
- **60%** - Keyword matching (service name vs. process name)
- **20%** - Description similarity
- **20%** - Strategic alignment

**Example**:
```
Vivicta Service: Enterprise Risk Management
└── Matched APQC Processes:
    ├── 10254: Manage enterprise risk (98% match)
    ├── 10252: Develop and manage compliance (85% match)
    └── 10420: Develop governance frameworks (72% match)
```

### Using APQC in Assessment

**Step 1: Assess Service** (as described above)

**Step 2: Click "Map to APQC"** button in assessment modal

**Step 3: View Suggested Processes**
- System shows top 10 matched processes
- Sorted by relevance score
- Displays L1-L4 hierarchy

**Step 4: Select Relevant Processes**
- Check boxes for applicable processes
- Can select multiple
- Add custom notes per process

**Step 5: Save Mapping**
- Mapping stored with assessment
- Visible in heatmap details
- Used for opportunity analysis

### Example: APQC Mapping Scenario

**Customer**: Global Bank International  
**Service**: Digital Transformation Strategy  
**Goal**: Modernize core banking systems

**Suggested APQC Processes**:

1. **10420: Develop enterprise architecture** (95% match)
   - Current State: Fragmented, legacy systems
   - Gap: No cohesive EA framework
   - Opportunity: EA governance consulting

2. **11024: Develop IT strategy** (92% match)
   - Current State: Reactive IT planning
   - Gap: No strategic IT roadmap
   - Opportunity: IT strategy development

3. **10651: Manage technology innovation** (88% match)
   - Current State: Limited innovation capability
   - Gap: No structured innovation process
   - Opportunity: Innovation lab setup

4. **11027: Manage data and information** (85% match)
   - Current State: Data silos across systems
   - Gap: No enterprise data strategy
   - Opportunity: Data strategy & governance

**Business Case**:
- Customer needs to transform **4 core processes**
- Vivicta Digital Transformation service addresses all 4
- Estimated value: **$1.2M** (12-month engagement)
- Competitive advantage: Integrated approach vs. point solutions

---

## Import & Export

### Why Import/Export?

**Use Cases**:
1. **Backup**: Save heatmap data externally
2. **Sharing**: Send heatmap to colleagues
3. **Migration**: Move from standalone to integrated mode
4. **Collaboration**: Work on heatmaps across teams
5. **Version Control**: Track changes over time

### Exporting Data

**Export All Data**:
1. Click **"Export All"** button in toolbar
2. System generates JSON file:
   ```
   whitespot_data_2026-04-20.json
   ```
3. File includes:
   - All customers/prospects
   - All heatmaps
   - All assessments
   - Metadata

**Export Single Heatmap**:
1. Open heatmap
2. Click **"Export"** button in heatmap header
3. Download JSON file:
   ```
   whitespot_heatmap_GlobalBank_2026-04-20.json
   ```

### Importing Data

**Import All Data**:
1. Click **"Import Data"** button in toolbar
2. Select JSON file from computer
3. System validates data structure
4. Confirms import
5. Data merged with existing (or replaces if empty)

**Import to EA Engagement Playbook**:
1. Open EA Engagement Playbook
2. Go to **Engagement Setup** canvas
3. Import customers from standalone export
4. Go to **WhiteSpot Heatmap** canvas
5. Import heatmap data
6. Continue with full E0-E5 workflow

### Data Format

Exported JSON structure:
```json
{
  "version": "1.0",
  "customers": [
    {
      "id": "CUST-001",
      "name": "Global Bank International",
      "type": "Prospect",
      "industry": "Financial Services",
      "region": "EMEA",
      "revenue": "$2.5B",
      "employees": "12,000",
      "contact": "Jane Smith",
      "email": "jane.smith@globalbank.com",
      "phone": "+44 20 1234 5678",
      "notes": "Interested in Digital Transformation",
      "metadata": {
        "createdAt": "2026-04-20T10:30:00Z",
        "updatedAt": "2026-04-20T14:45:00Z"
      }
    }
  ],
  "whiteSpotHeatmaps": [
    {
      "id": "WSH-001",
      "customerId": "CUST-001",
      "customerName": "Global Bank International",
      "assessmentDate": "2026-04-20",
      "assessedBy": "Sales Team",
      "hlAssessments": [
        {
          "l2ServiceId": "L2-BC-01",
          "l2ServiceName": "Strategic Planning",
          "l1ServiceArea": "Business Consulting",
          "assessmentState": "FULL",
          "l3Components": [...],
          "score": 100,
          "apqcMappedCapabilities": [...],
          "opportunityValue": 500000,
          "notes": "Full service delivery since 2024"
        }
      ],
      "opportunities": [...],
      "metadata": {...}
    }
  ]
}
```

---

## Use Cases & Examples

### Use Case 1: Sales Prospect Analysis

**Scenario**:  
Sales team identifies new prospect "TechCorp Manufacturing". Need quick assessment of service delivery opportunities before scheduling client meeting.

**Workflow**:
1. **Add Prospect**:
   - Name: TechCorp Manufacturing
   - Type: Prospect
   - Industry: Manufacturing
   - Revenue: $800M

2. **Create Heatmap**: Click "Create Heatmap"

3. **Quick Assessment** (based on discovery call):
   - **Digital Transformation**: POTENTIAL (never delivered)
   - **Cloud Strategy**: PARTIAL (basic assessment done by AWS)
   - **Data & Analytics**: LOST (previously Vivicta, now Snowflake)
   - **Cybersecurity Advisory**: POTENTIAL (current concern)
   - **Enterprise Architecture**: CUSTOM (limited scope, ad-hoc)

4. **Identify Top 3 Opportunities**:
   - Win-back Data & Analytics ($750K)
   - Expand Cloud Strategy to FULL ($400K)
   - New Cybersecurity program ($600K)
   - **Total Pipeline**: $1.75M

5. **Prepare for Meeting**:
   - Export heatmap as PDF (via screenshot)
   - Share with account team
   - Build discussion guide around gaps

**Outcome**: Sales team enters meeting with clear opportunity map and value proposition.

---

### Use Case 2: Account Planning

**Scenario**:  
Existing customer "Global Retail Corp" annual account planning session. Need to visualize current service delivery and identify upsell opportunities.

**Workflow**:
1. **Add Customer** (type: Customer, not Prospect)

2. **Comprehensive Assessment**:
   - Review all 41 HL services
   - Mark current deliveries as FULL/PARTIAL
   - Identify LOST services (to competitors)
   - Flag POTENTIAL opportunities

3. **Detailed L3 Tracking**:
   - For each PARTIAL service, check delivered L3 components
   - Calculate coverage scores
   - See which components are missing

4. **APQC Mapping**:
   - Map all FULL services to customer's process framework
   - Identify process gaps where no Vivicta service exists
   - Suggest new services to fill gaps

5. **Opportunity Prioritization**:
   - Rank opportunities by value
   - Consider strategic fit
   - Factor in competitive position

6. **Account Plan Document**:
   - Export heatmap data
   - Generate opportunity list
   - Build growth strategy

**Outcome**: Clear account growth roadmap with prioritized opportunities and value quantification.

---

### Use Case 3: Team Collaboration

**Scenario**:  
Customer engagement team in London assesses prospect, needs input from solution architects in New York before proposal.

**Workflow**:
1. **London Team**:
   - Creates prospect in standalone tool
   - Performs initial assessment based on RFP
   - Exports heatmap JSON

2. **Share via Email/Teams**:
   - Email JSON file to NY team
   - Include context and questions

3. **NY Solution Architects**:
   - Import JSON into their standalone tool
   - Review assessments
   - Add technical notes to services
   - Update opportunity values with solution costs
   - Export updated JSON

4. **London Team**:
   - Import updated JSON
   - Review SA input
   - Finalize proposal

5. **Proposal Submission**:
   - Export final heatmap
   - Include in proposal as "Current State Assessment"
   - Reference opportunities in SOW

**Outcome**: Seamless collaboration across teams/geographies without complex systems.

---

### Use Case 4: Pre-Engagement Qualification

**Scenario**:  
Lead comes in via website form. Before assigning to sales team, qualification team assesses opportunity size.

**Workflow**:
1. **Quick Setup**:
   - Add lead to standalone tool
   - Basic info from web form

2. **Preliminary Assessment**:
   - Based on public information (website, LinkedIn, news)
   - Mark known services (from competitor analysis)
   - Flag obvious opportunities

3. **Opportunity Sizing**:
   - Estimate values for top 5 opportunities
   - Total addressable market (TAM) calculation

4. **Qualification Decision**:
   - If TAM > $500K: Assign to senior sales
   - If TAM $100-500K: Assign to standard sales
   - If TAM < $100K: Nurture campaign

5. **Handoff**:
   - Export heatmap
   - Send to assigned sales rep
   - Include qualification notes

**Outcome**: Efficient lead routing based on data-driven opportunity assessment.

---

### Use Case 5: Migration to Full Engagement

**Scenario**:  
Prospect "FinanceOne" wins. Sales team used standalone tool. Now need to migrate to full EA engagement workflow.

**Workflow**:
1. **Export from Standalone**:
   - Export complete FinanceOne data
   - Save JSON file

2. **Open EA Engagement Playbook**:
   - Create new engagement: "FinanceOne Digital Transformation"

3. **Import Customer**:
   - Go to Engagement Setup canvas
   - Import FinanceOne customer data
   - Add to engagement

4. **Import Heatmap**:
   - Go to WhiteSpot Heatmap canvas
   - Import heatmap assessments
   - Link to customer

5. **Continue E0-E5 Workflow**:
   - E0: Engagement setup (already partially done)
   - E1: Discovery (use heatmap gaps as discovery topics)
   - E2-E3: Current/Gap Analysis (heatmap = input)
   - E4: Target Architecture (opportunities = roadmap items)
   - E5: Roadmap (prioritize based on heatmap value)

6. **Generate Deliverables**:
   - WhiteSpot Analysis Report
   - Opportunity Summary
   - Business Case
   - Transformation Roadmap

**Outcome**: Seamless transition from sales tool to delivery tool without data re-entry.

---

## Best Practices

### 1. Consistent Assessment Standards

**DO**:
- ✅ Define clear criteria for each state (FULL/PARTIAL/etc.)
- ✅ Document what "FULL" means for each service
- ✅ Use same assessor for consistency
- ✅ Regular calibration sessions with team

**DON'T**:
- ❌ Use different criteria per customer
- ❌ Mix "what we could deliver" with "what they need"
- ❌ Overstate current delivery (FULL when actually PARTIAL)

### 2. Regular Updates

**DO**:
- ✅ Update heatmaps after customer interactions
- ✅ Revise when competitor situation changes
- ✅ Quarterly refresh for active prospects
- ✅ Mark assessment date accurately

**DON'T**:
- ❌ Use outdated assessments in proposals
- ❌ Forget to update when services are won/lost

### 3. Opportunity Value Accuracy

**DO**:
- ✅ Use realistic ACV estimates
- ✅ Base on similar past engagements
- ✅ Include range (min-max) if uncertain
- ✅ Factor in probability (weighted value)

**DON'T**:
- ❌ Inflate values for optics
- ❌ Ignore solution costs
- ❌ Forget to update as deals progress

### 4. Notes & Context

**DO**:
- ✅ Add detailed notes to each assessment
- ✅ Include competitor information
- ✅ Note customer pain points
- ✅ Reference key stakeholders

**DON'T**:
- ❌ Leave notes blank
- ❌ Use vague descriptions
- ❌ Forget to update after meetings

### 5. APQC Mapping Discipline

**DO**:
- ✅ Map all FULL and PARTIAL services
- ✅ Validate mappings with customer
- ✅ Use mappings in customer discussions
- ✅ Link to customer process documentation

**DON'T**:
- ❌ Skip APQC mapping
- ❌ Map without customer context
- ❌ Use generic mappings for all customers

### 6. Data Hygiene

**DO**:
- ✅ Export data regularly (backup)
- ✅ Clean up old demo data
- ✅ Archive completed prospects
- ✅ Version control important heatmaps

**DON'T**:
- ❌ Let localStorage fill up with test data
- ❌ Lose data by clearing browser cache
- ❌ Mix real and demo data

### 7. Team Collaboration

**DO**:
- ✅ Use import/export for sharing
- ✅ Document assessment methodology
- ✅ Regular team calibration
- ✅ Centralized storage of exported JSONs

**DON'T**:
- ❌ Work in silos
- ❌ Use inconsistent methods
- ❌ Forget to share updates

---

## Troubleshooting

### Issue: Data Not Saving

**Symptoms**: Changes disappear after browser refresh

**Solutions**:
1. **Check localStorage**:
   - Open browser console (F12)
   - Type: `localStorage.getItem('whitespot_standalone_data')`
   - Should return JSON string

2. **Browser Settings**:
   - Ensure cookies/storage not blocked
   - Check privacy settings
   - Try incognito mode to test

3. **Storage Quota**:
   - Clear old data: Click "Clear All"
   - Export important data first
   - Use import/export for large datasets

### Issue: Import Fails

**Symptoms**: Error message when importing JSON

**Solutions**:
1. **Validate JSON**:
   - Open file in text editor
   - Check for syntax errors
   - Use online JSON validator

2. **Version Mismatch**:
   - Exported from older version?
   - Update file `version` field to "1.0"

3. **File Corruption**:
   - Re-export from source
   - Check file size (should be > 0 bytes)

### Issue: Services Not Displaying

**Symptoms**: Heatmap grid empty or incomplete

**Solutions**:
1. **Data Loaders**:
   - Check console for errors (F12)
   - Ensure `vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json` exists in `data/` folder
   - Reload page

2. **Create Heatmap**:
   - Click "Create Heatmap" button
   - Don't just add prospect, must create heatmap

3. **Customer Selection**:
   - Ensure customer selected in dropdown
   - Check if heatmap exists for selected customer

### Issue: APQC Mapping Not Working

**Symptoms**: No APQC processes suggested

**Solutions**:
1. **APQC Data**:
   - Check `data/apqc_pcf_master.json` exists
   - Reload page to re-initialize

2. **Service Assessment**:
   - Must assess service first
   - APQC mapping happens during assessment

### Issue: Export Download Fails

**Symptoms**: Export button clicked, no download

**Solutions**:
1. **Browser Settings**:
   - Check popup blocker
   - Allow downloads from site
   - Check download folder

2. **Data Size**:
   - Large datasets may take time
   - Wait 10-15 seconds
   - Check browser downloads

### Issue: Standalone Tool vs. Integrated Confusion

**Symptoms**: Changes in one not reflected in other

**Solutions**:
- **Important**: Standalone and Integrated modes use **separate data stores**
- To sync:
  1. Export from standalone
  2. Import to integrated (or vice versa)
- Use import/export workflow, not automatic sync

---

## FAQ

### General Questions

**Q: Is my data safe in standalone mode?**  
A: Data stored in browser localStorage. Secure but:
- Only accessible on same computer/browser
- Cleared if browser data cleared
- Export regularly for backup

**Q: Can multiple users share a standalone heatmap?**  
A: Not directly. Use import/export:
1. User A exports JSON
2. Sends file to User B
3. User B imports JSON

**Q: How many prospects can I manage?**  
A: localStorage limit ~5-10MB. Roughly:
- 50-100 prospects with detailed assessments
- 1000+ prospects with basic info only

**Q: Can I use standalone mode offline?**  
A: Partially:
- HTML/CSS/JS cached by browser
- Works offline after first load
- But data files (`vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json`, `apqc_pcf_master.json`) must be cached

### Data & Integration Questions

**Q: Can I import standalone data into EA Engagement Playbook?**  
A: Yes! Workflow:
1. Export from standalone
2. Open EA Engagement Playbook
3. Import JSON

**Q: Can I export from EA Engagement Playbook to standalone?**  
A: Yes! Same process, reverse direction.

**Q: Do I need a formal engagement to use standalone mode?**  
A: No. Standalone is designed for pre-engagement, prospect analysis, and quick assessments.

**Q: Can I use both modes simultaneously?**  
A: Yes, but they don't auto-sync. Use import/export to keep in sync.

### Assessment Questions

**Q: How do I decide between PARTIAL and CUSTOM?**  
A:
- **PARTIAL**: Standard service, but only some components delivered
- **CUSTOM**: Non-standard, bespoke delivery approach

**Q: What if a service doesn't fit any state?**  
A: Use closest match and add detailed notes. Consider:
- POTENTIAL: If never delivered
- PARTIAL: If some aspect exists
- CUSTOM: If unique situation

**Q: Should I track competitor services in heatmap?**  
A: Yes! Use notes field:
- LOST: Vivicta lost to competitor (name competitor)
- PARTIAL: Vivicta + competitor both deliver parts
- POTENTIAL: Neither Vivicta nor competitor

### Technical Questions

**Q: Which browsers are supported?**  
A: Modern browsers with localStorage support:
- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 13+

**Q: Can I customize the 41 HL services?**  
A: Not in current version. Services defined in `vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json`.

**Q: Can I add custom services?**  
A: Use "Custom Business Areas" feature (if available in your version).

**Q: Is there an API for integration?**  
A: Not in standalone mode. Use JSON import/export for system integration.

---

## Quick Reference Card

### Top Actions

| Action | How To |
|--------|--------|
| **Add Prospect** | Click "Add Prospect/Customer" → Fill form → Save |
| **Create Heatmap** | Select prospect → Click "Create Heatmap" |
| **Assess Service** | Click service tile → Select state → Add notes → Save |
| **Export Data** | Click "Export All" → Download JSON |
| **Import Data** | Click "Import Data" → Select JSON file |
| **Load Demo** | Click "Load Demo Data" |
| **Clear Data** | Click "Clear All" → Confirm |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Esc** | Close modal |
| **Ctrl+S** | Save assessment (when modal open) |
| **Ctrl+E** | Export (when on main screen) |

### Assessment States Quick Guide

| State | Icon | When to Use |
|-------|------|-------------|
| FULL | 🟩 | All L3 components delivered |
| PARTIAL | 🟨 | Some L3 components delivered |
| CUSTOM | 🟦 | Bespoke/non-standard delivery |
| LOST | 🟥 | Previously delivered, now lost |
| POTENTIAL | ⬜ | Never delivered, opportunity exists |

---

## Support & Resources

### Documentation
- **AI Assistant User Guide**: `AI_ASSISTANT_USER_GUIDE.md`
- **WhiteSpot Implementation Summary**: `WHITESPOT_HEATMAP_IMPLEMENTATION_SUMMARY.md`
- **APQC Enhancement Guide**: `APM_APQC_ENHANCEMENT_GUIDE.md`

### Tools
- **Standalone Mode**: `WhiteSpot_Standalone.html`
- **Integrated Mode**: `EA_Engagement_Playbook.html` → WhiteSpot Heatmap canvas

### Data Files
- **Vivicta DCS Services**: `data/vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json`
- **APQC Framework**: `data/apqc_pcf_master.json`

---

**Version**: 1.0  
**Last Updated**: April 20, 2026  
**Maintained By**: EA Platform Team
