# WhiteSpot Heatmap - User Guide

**Version:** 1.0  
**Date:** April 20, 2026  
**Platform:** EA Engagement Playbook - NexGenEA Toolkit

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [User Workflows](#user-workflows)
5. [Feature Reference](#feature-reference)
6. [Data Model](#data-model)
7. [Advanced Features](#advanced-features)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Overview

### What is WhiteSpot Heatmap?

WhiteSpot Heatmap is a comprehensive service delivery assessment tool integrated into the EA Engagement Playbook. It enables Enterprise Architects and delivery teams to:

- **Assess service coverage** across 41 Vivicta DCS High-Level (HL) services
- **Identify gaps** (white-spots) in service delivery
- **Map to business capabilities** using the APQC Process Classification Framework
- **Capture opportunities** for service expansion and upsell
- **Analyze coverage trends** with visual analytics dashboards
- **Export insights** for stakeholder presentations and strategic planning

### Key Benefits

✅ **Comprehensive Coverage:** All 41 HL services across 3 L1 service areas  
✅ **Intelligent Mapping:** AI-powered APQC capability suggestions  
✅ **Opportunity Tracking:** Document gaps with estimated values and priorities  
✅ **Visual Analytics:** Charts, dashboards, and exportable reports  
✅ **Flexible Filtering:** Focus on specific states, areas, or score ranges  
✅ **Bulk Operations:** Efficient updates across multiple services  

---

## Getting Started

### Prerequisites

1. **Customer Record:** At least one customer must be defined in Engagement Setup
2. **Browser:** Modern browser (Chrome, Edge, Firefox, Safari)
3. **Data Files:** Vivicta service model JSON and APQC framework JSON loaded

### Creating Your First Heatmap

#### Option 1: Manual Creation

1. Navigate to **WhiteSpot Heatmap** tab in EA Engagement Playbook
2. Select customer from dropdown (if multiple customers exist)
3. Click **"Create Heatmap for [Customer Name]"**
4. All 41 HL services are initialized with `POTENTIAL` state
5. Begin assessing services by clicking on service rows

#### Option 2: Demo Data Generation

1. Navigate to **WhiteSpot Heatmap** tab
2. Click **"Generate Demo Data"** button
3. Select a scenario:
   - **Mature Customer:** 70% FULL, 20% PARTIAL
   - **Emerging Customer:** 20% FULL, 50% PARTIAL/POTENTIAL
   - **Greenfield Customer:** 10% FULL, 50% POTENTIAL
   - **Mixed Portfolio:** Balanced distribution
4. Demo heatmap is created with realistic assessments, APQC mappings, and opportunities

---

## Core Concepts

### Service Hierarchy

```
L1 Service Area (3 total)
├─ Consulting & Project Services
│  ├─ L2 High-Level Service (HL-tagged, 41 total)
│  │  └─ L3 Delivery Components (DL-tagged, varies)
├─ Managed Services
│  └─ ...
└─ Platform Services
    └─ ...
```

### Assessment States

| State | Icon | Color | Description | Use Case |
|-------|------|-------|-------------|----------|
| **FULL** | ✓ | Green | All L3 components delivered | Complete service delivery |
| **PARTIAL** | ⚠ | Yellow | Some L3 components delivered, gaps exist | Partial implementation |
| **CUSTOM** | ⚙ | Blue | Bespoke solution for specific needs | Tailored offerings |
| **LOST** | ✗ | Red | Service not currently delivered | Competitive gaps |
| **POTENTIAL** | ⭐ | Orange | Opportunity identified, not delivered | Future roadmap |

### Coverage Score Calculation

```
Score = (Delivered L3 Components / Total L3 Components) × 100%
```

- **90-100%:** Excellent coverage
- **75-89%:** Good coverage
- **50-74%:** Moderate coverage  
- **25-49%:** Low coverage
- **0-24%:** Minimal coverage

### APQC Integration

The heatmap integrates with the **APQC Process Classification Framework** (PCF) v8.0 Cross-Industry:

- **L1-L4 Process Levels:** From high-level categories to detailed processes
- **AI-Powered Mapping:** Semantic matching with confidence scores (0.0-1.0)
- **Manual Override:** Create custom mappings as needed
- **Business Alignment:** Connect technical services to business capabilities

---

## User Workflows

### Workflow 1: Complete Service Assessment

1. **Open Service Drill-Down**
   - Click on any service row in the heatmap grid
   - Large modal opens with 3 tabs

2. **Assess L3 Components** (Tab 1)
   - Review list of all L3 delivery components for this service
   - Toggle checkboxes to mark components as delivered
   - Score updates automatically
   - Add notes to document rationale

3. **Map APQC Capabilities** (Tab 2)
   - Click "Generate AI Suggestions"
   - Review suggested APQC processes with confidence scores
   - Select high-confidence mappings to apply
   - Add custom mappings if needed
   - Remove incorrect suggestions

4. **Document Opportunities** (Tab 3)
   - Click "Add Opportunity"
   - Enter title, description, estimated value
   - Set priority (critical, high, medium, low)
   - Set target date and owner
   - Link opportunity to this service

5. **Save & Close**
   - All changes auto-save to localStorage
   - Close modal to return to heatmap grid

### Workflow 2: Bulk Assessment Update

1. **Apply Filters**
   - Use filter bar to narrow down services
   - Example: Show only "PARTIAL" services in "Managed Services" area

2. **Perform Bulk Operation**
   - Click bulk operations toolbar button
   - Options:
     - Mark filtered services as FULL
     - Mark filtered services as PARTIAL
     - Mark filtered services as POTENTIAL
     - Generate APQC mappings for all filtered services
     - Export opportunities to CSV

3. **Confirm & Execute**
   - System prompts for confirmation showing number of affected services
   - Click OK to apply bulk update
   - Heatmap refreshes with updated data

### Workflow 3: Analytics Review

1. **Open Analytics Dashboard**
   - Click "Analytics" button in header
   - Comprehensive modal displays

2. **Review Metrics**
   - **Summary Cards:** Total services, avg coverage, opportunities, total value
   - **State Distribution Chart:** Horizontal bars showing % in each state
   - **L1 Coverage Chart:** Coverage by service area
   - **Top Opportunities:** Top 5 by estimated value
   - **Gap Analysis:** Top 10 gaps ranked by opportunity value

3. **Export Analytics**
   - Click "Export Report" to download JSON
   - Use for executive presentations or trend analysis

### Workflow 4: Stakeholder Presentation

1. **Filter for Relevance**
   - Apply filters to show specific areas of interest
   - Example: "Gaps Only" + "Score < 50%"

2. **Print or Export**
   - **Print:** Click Print button → Print-friendly HTML opens → Print to PDF
   - **CSV Export:** Click CSV button → Excel-compatible file downloads
   - **JSON Export:** Click Download button → Full data backup

3. **Create Custom Views**
   - Use Custom Business Areas to group services by stakeholder domain
   - Link relevant services to each business area
   - Document priority and notes

---

## Feature Reference

### Filtering System

**Location:** Filter bar above heatmap grid

| Filter Type | Description | Usage |
|-------------|-------------|-------|
| **Search Text** | Keyword search in service names | Type to filter instantly |
| **Assessment State** | Filter by specific state | Select from dropdown (ALL, FULL, PARTIAL, etc.) |
| **L1 Service Area** | Filter by top-level category | Select from dropdown (ALL, Consulting, Managed, Platform) |
| **Score Range** | Filter by coverage score % | Dual-range slider (0-100%) |
| **Gaps Only** | Show only services with gaps | Checkbox (PARTIAL, LOST, or score < 75%) |
| **Has Opportunities** | Show only services with documented opportunities | Checkbox |

**Active Filters:**
- Displays as tags below filter bar
- Shows count: "Showing X of Y services"
- Click "Clear All" to reset

### Bulk Operations Toolbar

**Location:** Below filter bar (green background)

| Operation | Description | Behavior |
|-----------|-------------|----------|
| **Mark as FULL** | Update all filtered services to FULL state | Applies to visible services only |
| **Mark as PARTIAL** | Update all filtered services to PARTIAL state | Applies to visible services only |
| **Mark as POTENTIAL** | Update all filtered services to POTENTIAL state | Applies to visible services only |
| **Generate APQC for All** | AI-powered APQC mapping for all filtered services | Async operation, may take 10-30 seconds |
| **Export Opportunities** | Download CSV of all opportunities | Includes service linkage and all fields |

### Analytics Dashboard

**Access:** Click "Analytics" button in header

**Components:**

1. **Summary Cards (4-card grid)**
   - Total Services
   - Average Coverage %
   - Total Opportunities
   - Total Opportunity Value ($)

2. **State Distribution Chart**
   - Horizontal bar chart
   - Shows count and percentage per state
   - Color-coded by state

3. **L1 Coverage Chart**
   - Average coverage % per L1 service area
   - Dynamic color coding (green ≥75%, yellow 40-74%, red <40%)

4. **Top Opportunities Table**
   - Top 5 opportunities by estimated value
   - Shows title, priority, status, value

5. **Gap Analysis Table**
   - Top 10 services with gaps
   - Sorted by opportunity value
   - Shows state, coverage %, opportunity value

**Export:** Click "Export Report" → JSON file with all analytics data

### Custom Business Areas

**Purpose:** Create customer-specific business areas and link services

**Workflow:**

1. Click "Add Business Area" in Custom Business Areas section
2. Enter name and description
3. Multi-select services to link to this area
4. Set priority and notes
5. Save

**Use Cases:**
- Group services by customer department (Finance, HR, Operations)
- Create domain-specific portfolios
- Track priority areas for transformation

---

## Data Model

### WhiteSpot Heatmap Schema

```javascript
{
  id: "WSH-001",
  customerId: "CUST-001",
  customerName: "Customer Name",
  assessmentDate: "2026-04-20",
  assessedBy: "Assessor Name",
  description: "Overall assessment description",
  comments: "Additional comments",
  
  hlAssessments: [
    {
      l2ServiceId: "HL_001",
      l2ServiceName: "Service Name",
      l1ServiceArea: "Consulting & Project Services",
      assessmentState: "PARTIAL",
      score: 65,
      l3Components: [
        {
          l3Id: "DL_001",
          l3Name: "Component Name",
          isDelivered: true,
          notes: ""
        }
      ],
      apqcMappedCapabilities: ["10010", "10012"],
      opportunityValue: 150000,
      notes: "Assessment notes"
    }
  ],
  
  opportunities: [
    {
      id: "OPP-001",
      l2ServiceId: "HL_001",
      title: "Opportunity Title",
      description: "Description",
      estimatedValue: 150000,
      priority: "high",
      status: "identified",
      targetDate: "2026-12-31",
      owner: "Owner Name",
      notes: ""
    }
  ],
  
  customBusinessAreas: [
    {
      id: "BA-001",
      name: "Business Area Name",
      description: "Description",
      linkedServiceIds: ["HL_001", "HL_002"],
      priority: "high",
      notes: ""
    }
  ],
  
  metadata: {
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-20T15:30:00Z",
    version: "1.0"
  }
}
```

### Persistence

- **Storage:** Browser localStorage via EA_EngagementManager
- **Entity Type:** `whiteSpotHeatmaps`
- **Backup:** Export to JSON recommended for important assessments
- **Restore:** Import JSON via browser console or future import UI

---

## Advanced Features

### AI-Powered APQC Mapping

**Algorithm:**

1. **Keyword Matching (60% weight)**
   - Compares service name/description with APQC process names
   - Semantic overlap calculation

2. **Description Overlap (20% weight)**
   - Full-text similarity between descriptions
   - Identifies conceptual alignment

3. **Strategic Alignment (20% weight)**
   - Industry-specific relevance scoring
   - Process level appropriateness (L3/L4 preferred)

**Confidence Scores:**

- **0.9-1.0:** Excellent match, auto-apply recommended
- **0.7-0.89:** High confidence, review suggested
- **0.5-0.69:** Moderate confidence, manual verification needed
- **0.0-0.49:** Low confidence, typically not shown

### Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+H` | Toggle help modal | WhiteSpot tab active |
| `Ctrl+F` | Focus search filter | WhiteSpot tab active |
| `Ctrl+A` | Open analytics dashboard | WhiteSpot tab active |
| `Ctrl+E` | Export to CSV | WhiteSpot tab active |
| `Ctrl+P` | Print heatmap | WhiteSpot tab active |
| `Esc` | Close modal | Any modal open |
| `Tab` | Navigate form fields | Any form |
| `Enter` | Submit form | Any form |

### Export Formats

**CSV Export:**
- Excel-compatible encoding
- Columns: Service Name, Service Area, State, Score %, L3 Delivered, L3 Total, APQC Mapped, Opportunity Value, Notes
- Filename: `whitespot_heatmap_[customer]_[date].csv`

**Print Export:**
- Clean HTML formatting
- Summary statistics table
- Full service grid with states and scores
- Optimized for PDF printing

**JSON Export:**
- Complete heatmap object
- All assessments, opportunities, business areas
- APQC mappings included
- Filename: `whitespot_heatmap_[customer]_[date].json`

---

## Troubleshooting

### Issue: "Service loaders not initialized"

**Cause:** Vivicta service model or APQC framework JSON files not loaded

**Solution:**
1. Check that `vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json` exists in `data/` folder
2. Check that `apqc_pcf_master.json` exists in `data/` folder
3. Verify script includes in HTML:
   ```html
   <script src="vivicta_service_loader.js"></script>
   <script src="apqc_whitespot_integration.js"></script>
   ```
4. Open browser console and check for load errors

### Issue: Filters not working

**Cause:** Missing data attributes on service rows or enhancement script not loaded

**Solution:**
1. Verify `whitespot_heatmap_enhancements.js` is included in HTML
2. Check browser console for JavaScript errors
3. Ensure you're on Phase 4+ implementation (data attributes added)
4. Clear browser cache and reload

### Issue: APQC generation fails

**Cause:** APQC framework not loaded or network timeout

**Solution:**
1. Check browser console for error messages
2. Verify `apqc_pcf_master.json` is accessible
3. Try generating for single service first (drill-down modal)
4. Reduce number of services (use filters before bulk generation)

### Issue: Demo data not generating

**Cause:** Customer not found or loaders not initialized

**Solution:**
1. Ensure at least one customer exists in Engagement Setup
2. Wait for service loaders to initialize (check console)
3. Try selecting a different scenario
4. Check browser console for async errors

---

## FAQ

### Q: How many services should I see in the heatmap?

**A:** You should see **41 Vivicta DCS High-Level (HL) services** distributed across 3 L1 service areas:
- Consulting & Project Services
- Managed Services
- Platform Services

If you see fewer services, you may be using v4.1 JSON (26 services). The system will still work, but v5+ JSON with all 41 services is recommended.

---

### Q: Can I delete a heatmap?

**A:** Currently, deletion must be done via browser console:

```javascript
engagementManager.deleteEntity('whiteSpotHeatmaps', 'WSH-001');
renderWhiteSpotHeatmap();
```

Future versions will include a UI delete button with confirmation.

---

### Q: How do I backup my heatmap data?

**A:** Use the JSON export feature:

1. Click Download (JSON) button in header
2. Save file to secure location
3. To restore: Use browser console:
   ```javascript
   const heatmap = { /* paste JSON here */ };
   engagementManager.addEntity('whiteSpotHeatmaps', heatmap);
   ```

---

### Q: Can I assess the same customer at multiple points in time?

**A:** Currently, one heatmap per customer. Recommended approach:

1. Export current heatmap to JSON before major updates
2. Use naming convention: `whitespot_[customer]_Q1_2026.json`
3. Compare JSON files to track changes over time

Future versions may support versioning within the UI.

---

### Q: What happens if I close the browser?

**A:** All heatmap data is stored in browser localStorage and persists across sessions. Data remains until:
- Browser cache is cleared
- localStorage is manually deleted
- You access from a different browser/computer

Always export important assessments to JSON for backup.

---

### Q: How accurate are AI-generated APQC mappings?

**A:** Accuracy depends on service naming and description quality:

- **High-confidence (0.7+):** Typically 80-90% accurate
- **Medium-confidence (0.5-0.7):** 50-70% accurate, review required
- **Low-confidence (<0.5):** Not shown, manual mapping needed

Always review AI suggestions before applying. Domain expertise improves mapping quality.

---

### Q: Can I customize assessment states?

**A:** No, the 5 states (FULL, PARTIAL, CUSTOM, LOST, POTENTIAL) are fixed in v1.0. They were designed to cover all standard scenarios:

- **FULL + PARTIAL:** Standard delivery spectrum
- **CUSTOM:** Bespoke solutions
- **LOST:** Competitive gaps
- **POTENTIAL:** Future opportunities

If you need different states, use the Notes field to document nuances.

---

### Q: What's the difference between opportunities in drill-down vs. general opportunities?

**A:** 
- **Service-specific opportunities** (drill-down modal): Linked to a specific L2 service, shown in that service's drill-down
- **General opportunities**: Not linked to a specific service, shown in main Opportunities section

Both types appear in analytics and exports. Use general opportunities for cross-cutting initiatives.

---

### Q: How do I get the v5 JSON with all 41 services?

**A:** The v5 JSON (`HL_whitespot_service_model_v5_L3.JSON`) is currently being finalized. When available:

1. Place in `data/` folder
2. Update path in `vivicta_service_loader.js` if needed
3. The loader will automatically detect the hierarchical structure
4. All 41 HL services will display

The system is forward-compatible and will work with both v4.1 and v5+ formats.

---

## Support & Feedback

For questions, issues, or feature requests:

- **Internal Support:** Contact EA Platform team
- **Documentation:** Refer to this guide and in-app help (Ctrl+H)
- **Known Issues:** Check project GitHub issues (if applicable)

---

**Document Version:** 1.0  
**Last Updated:** April 20, 2026  
**Author:** EA Platform Development Team
