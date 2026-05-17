# Multi-Portfolio Management System - User Guide

## Overview

The Application Portfolio Management tool now supports managing multiple application portfolios for different customer accounts. This enables consultants and enterprise architects to work with multiple clients simultaneously, with each customer's data completely isolated and independently managed.

---

## Key Features

### 1. **Multiple Portfolio Support**
- Create unlimited portfolios for different customers
- Each portfolio is completely isolated with its own data
- Switch between portfolios instantly via dropdown selector
- All data persists in browser localStorage

### 2. **Portfolio Metadata**
Each portfolio includes:
- **Customer Name** (required)
- **Industry** (Property, Manufacturing, Financial Services, Insurance, Retail, Healthcare, Technology, Services, Other)
- **Description** (optional)
- **Created Date** & **Last Modified Date**
- **Statistics** (application count, capability count, AI agent count, total cost)

### 3. **Complete Data Structure**
Each portfolio contains:
- ✅ **Applications** (full inventory with financials, scores, lifecycle, etc.)
- ✅ **Capabilities** (APQC PCF framework, L1/L2/L3 hierarchy)
- ✅ **AI Agents** (automation and AI transformation initiatives)
- ✅ **All tab data** (decisions, rationalization, mappings)

### 4. **CRUD Operations**
- **Create**: Add new customer portfolios
- **Read**: View and analyze portfolio data
- **Update**: Modify portfolio data (auto-saved)
- **Delete**: Remove portfolios (with confirmation)

### 5. **Export Capabilities**

#### **Excel Export** (.xlsx)
Export portfolio data to multi-sheet Excel workbook:
- **Summary Sheet**: Portfolio metadata and statistics
- **Applications Sheet**: Complete application inventory with all attributes
- **Capabilities Sheet**: Business capability framework
- **AI Agents Sheet**: AI/automation agent inventory
- Selectable data types (choose what to export)
- Professional formatting ready for client presentation

#### **JSON Export** (.json)
- Full data export in structured JSON format
- Includes metadata and complete portfolio data
- Can be re-imported to restore portfolio
- Suitable for backup and data migration

#### **Bulk Export**
- Export all portfolios at once to JSON
- Useful for backup and archival purposes

---

## User Interface Elements

### **Header Portfolio Selector**
Located in the header (top-right area):
- **Portfolio Dropdown**: Shows all available portfolios with application count
- **Settings Icon (⚙️)**: Opens Portfolio Manager modal
- **Current Selection**: Highlighted in orange when active

### **Portfolio Manager Modal**
Comprehensive management interface:

#### **Create New Portfolio Section** (Green box)
- Customer Name field (required)
- Industry dropdown
- Description field
- "Create" button

#### **Portfolio Cards Grid**
Each portfolio displays:
- Customer name and industry
- Creation and modification dates
- **Statistics Dashboard**:
  - Application count
  - Capability count
  - AI Agent count
  - Total annual cost
- **Action Buttons**:
  - "Activate" (switch to this portfolio)
  - "Export" (Excel export)
  - "JSON" (JSON export)
  - "Delete" (remove portfolio)
- **Active Badge**: Orange badge shows currently active portfolio

#### **Header Actions**
- "Refresh" button
- "Export All" button (bulk JSON export)

### **Inventory Tab Enhancement**
New "Export Excel" button added to filter bar:
- Green button with Excel icon
- Opens export options modal
- Quick access to Excel export functionality

---

## Usage Workflows

### **Workflow 1: Create New Customer Portfolio**

1. Click **⚙️ Settings icon** in header
2. In "Create New Portfolio" section:
   - Enter customer name (e.g., "Handelsbanken")
   - Select industry (e.g., "Financial Services")
   - Add description (e.g., "Digital transformation portfolio 2026")
3. Click **"Create"** button
4. Portfolio is created and added to list
5. Switch to new portfolio using dropdown or "Activate" button

### **Workflow 2: Switch Between Portfolios**

**Method 1 - Quick Switch:**
1. Click portfolio dropdown in header
2. Select desired portfolio from list
3. All tabs reload with selected portfolio data

**Method 2 - Portfolio Manager:**
1. Open Portfolio Manager (⚙️ icon)
2. Click "Activate" on desired portfolio card
3. Manager closes and portfolio loads

### **Workflow 3: Export Portfolio to Excel**

1. Ensure correct portfolio is active (check dropdown)
2. Click **"Export Excel"** button (Inventory tab or Portfolio Manager)
3. In Export Modal:
   - ✅ Check "Application Inventory" (default)
   - ☐ Check "Capabilities" (optional)
   - ☐ Check "AI Agents" (optional)
4. Click **"Export to Excel"**
5. Excel file downloads: `CustomerName_Portfolio_YYYY-MM-DD.xlsx`

### **Workflow 4: Backup Portfolio (JSON)**

1. Open Portfolio Manager
2. Find portfolio card
3. Click **"JSON"** button
4. JSON file downloads: `CustomerName_YYYY-MM-DD.json`

### **Workflow 5: Backup All Portfolios**

1. Open Portfolio Manager
2. Click **"Export All"** in header
3. Combined JSON downloads: `all_portfolios_YYYY-MM-DD.json`

### **Workflow 6: Delete Portfolio**

1. Open Portfolio Manager
2. Find portfolio to delete
3. Click **"Delete"** button (red, bottom-right)
4. Confirm deletion in dialog
5. Portfolio permanently removed

**⚠️ Note:** Cannot delete currently active portfolio. Switch to another first.

---

## Excel Export Details

### **Sheet Structure**

#### **1. Summary Sheet**
```
Metric                  | Value
-----------------------|------------------
Customer Name          | Acme Corporation
Industry               | Manufacturing
Export Date            | 2026-05-17T...
                       |
Total Applications     | 47
Total Capabilities     | 23
Total AI Agents        | 8
Total Annual Cost      | 12500000
```

#### **2. Applications Sheet**
Columns:
- Application Name
- Description
- Department
- Owner
- Vendor
- Technology Stack
- Currency
- CAPEX (Annual)
- OPEX (Annual)
- Total Cost (Annual)
- User Count
- Lifecycle
- Rationalization Action
- Technical Fit Score (1-5)
- Business Value Score (1-5)
- AI Maturity (1-5)
- AI Potential
- Business Capabilities
- Modern Stack Alternative
- Notes

#### **3. Capabilities Sheet** (if selected)
Columns:
- Capability Name
- Level (L1/L2/L3)
- Domain
- Industry Tag
- Strategic Importance
- Maturity
- AI Potential
- Linked Applications (count)
- Description
- APQC Code

#### **4. AI Agents Sheet** (if selected)
Columns:
- Agent Name
- Type (NLP, RPA, Predictive Analytics, etc.)
- Description
- Maturity Level (1-5)
- TO-BE (Yes/No)
- Linked Capabilities (count)
- Linked Applications (count)

---

## Data Storage & Persistence

### **Storage Keys**
- `apm_portfolios` - Array of all portfolios
- `apm_current_portfolio` - ID of active portfolio
- `apm_portfolio` (legacy) - Auto-migrated to new format

### **Portfolio Data Structure**
```json
{
  "id": "portfolio_abc123",
  "customerName": "Acme Corporation",
  "industry": "Manufacturing",
  "description": "Application modernization initiative",
  "createdAt": "2026-05-17T10:00:00.000Z",
  "lastModified": "2026-05-17T14:30:00.000Z",
  "data": {
    "applications": [...],
    "capabilities": [...],
    "ai_agents": [...],
    "lastUpdated": "2026-05-17T14:30:00.000Z"
  },
  "stats": {
    "applicationCount": 47,
    "capabilityCount": 23,
    "aiAgentCount": 8,
    "totalCost": 12500000,
    "lifecycleCounts": {
      "active": 32,
      "legacy": 10,
      "phaseOut": 5
    }
  }
}
```

### **Auto-Save Behavior**
- All changes automatically saved to localStorage
- Statistics recalculated on every save
- Last modified timestamp updated
- No manual save button required

---

## Best Practices

### **1. Naming Conventions**
- Use clear, recognizable customer names
- Include year for time-series analysis: "Acme Corp 2026"
- Use consistent industry classifications

### **2. Data Management**
- Regular JSON backups for critical portfolios
- Export to Excel before major data changes
- Use descriptive portfolio descriptions
- Review statistics before client presentations

### **3. Multi-User Scenarios**
⚠️ **Important**: localStorage is browser-specific
- Each user has independent portfolio storage
- No cloud sync between browsers/devices
- Use JSON export/import to share portfolios
- Excel exports suitable for client delivery

### **4. Performance**
- Tested up to 50 portfolios
- Each portfolio supports 500+ applications
- Instant switching between portfolios
- No page reload required

---

## Migration from Single Portfolio

If you have existing data in the old single-portfolio format:

1. **Auto-Migration on First Load**:
   - System detects legacy data
   - Creates "Default Portfolio" automatically
   - Migrates all existing applications, capabilities, AI agents
   - No data loss occurs

2. **Manual Export (Recommended)**:
   ```
   Before update: Export data via browser console
   localStorage.getItem('apm_portfolio')
   Save output to file as backup
   ```

---

## Troubleshooting

### **Portfolio Not Showing in Dropdown**
- Refresh browser page (F5)
- Check Portfolio Manager for full list
- Verify localStorage not full (check browser storage settings)

### **Data Not Saving**
- Check browser console for errors
- Verify localStorage enabled (not in private/incognito mode)
- Clear browser cache if corrupted

### **Excel Export Fails**
- Ensure XLSX library loaded (check browser console)
- Try exporting smaller data subsets
- Check popup blocker settings

### **Portfolio Disappeared**
- Check "All Portfolios" in dropdown
- Look in Portfolio Manager
- If deleted, restore from JSON backup

---

## Technical Details

### **Dependencies**
- **XLSX.js** (v0.18.5): Excel export functionality
- **Chart.js** (v4.4.1): Visualizations (unchanged)
- **Font Awesome** (v6.4.0): Icons

### **Browser Compatibility**
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### **Storage Limits**
- localStorage: ~5-10 MB per domain
- Typical portfolio: 50-200 KB
- Estimated capacity: 25-100 portfolios

---

## API Functions (for Developers)

### **Core Functions**
```javascript
// Portfolio Management
getAllPortfolios()              // Returns array of all portfolios
getPortfolio(portfolioId)       // Get specific portfolio by ID
getCurrentPortfolioId()         // Get active portfolio ID
setCurrentPortfolioId(id)       // Switch active portfolio
generatePortfolioId()           // Generate unique portfolio ID

// CRUD Operations
createNewPortfolio()            // Create from UI inputs
deletePortfolio(portfolioId)    // Delete with confirmation
switchPortfolio(portfolioId)    // Activate and reload views

// Export Functions
exportPortfolioToExcel(id)      // Open Excel export modal
exportPortfolioJSON(id)         // Download JSON export
exportAllPortfolios()           // Bulk JSON export
executeExcelExport()            // Execute Excel export

// Data Functions
loadData()                      // Load current portfolio data
saveData(data)                  // Save to current portfolio
calculatePortfolioStats(data)   // Calculate statistics
```

---

## Future Enhancements (Roadmap)

### **Phase 2** (Planned)
- [ ] Cloud synchronization (Azure Storage)
- [ ] Multi-user collaboration
- [ ] Portfolio comparison view
- [ ] Advanced analytics dashboard
- [ ] Portfolio templates by industry
- [ ] Audit trail and version history

### **Phase 3** (Proposed)
- [ ] AI-powered portfolio optimization
- [ ] Benchmark data integration
- [ ] Custom KPI definitions
- [ ] Role-based access control
- [ ] REST API for integrations

---

## Support

For issues or questions:
1. Check this guide first
2. Review browser console for errors
3. Export portfolio as backup before troubleshooting
4. Contact EA Platform support team

---

**Document Version:** 1.0  
**Last Updated:** May 17, 2026  
**Compatibility:** Application Portfolio Management v11+
