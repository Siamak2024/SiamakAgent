# 🎯 QUICK REFERENCE - Where to Find Everything

## 📍 Account Management Location

```
EA Growth Dashboard (Homepage)
    ↓
Click Database Icon (📊) in top-right toolbar
    ↓
Data Manager Modal Opens
    ↓
Scroll to "🏢 Manage Accounts" Section
```

### Visual Location

```
┌─────────────────────────────────────────────────┐
│  🚀 Growth Sprint Dashboard            📊 ❓ 🎓 │ ← Click database icon
└─────────────────────────────────────────────────┘

Opens modal:

┌──────────────────────────────────────────────────┐
│  📦 Data Management                          × │
├──────────────────────────────────────────────────┤
│  Storage Usage  [████░░░░░░] 45%                │
├──────────────────────────────────────────────────┤
│  Import/Export All Data                          │
│  [Export All Data] [Import Data]                │
├──────────────────────────────────────────────────┤
│  📋 Import Templates                             │
│  Download templates → Fill → Import              │
│  [Account CSV] [Account JSON]                   │
│  [Opportunity CSV] [Opportunity JSON]           │
│  [Import from Template (CSV/JSON)]              │
├──────────────────────────────────────────────────┤
│  🎯 Demo Scenarios                               │
│  [Banking] [FinTech] [Insurance]                │
│  [Load All 3 Demos]                             │
├──────────────────────────────────────────────────┤
│  🏢 Manage Accounts                 10 accounts  │ ← HERE!
│  ┌────────────────────────────────────────────┐ │
│  │ Nordic Universal Bank                      │ │
│  │ ACC-001 • Banking • ACV: €3.25M           │ │
│  │           [View] [Edit] [Delete]          │ │
│  ├────────────────────────────────────────────┤ │
│  │ PayNordic                                  │ │
│  │ FINTECH-2026-001 • Fintech • ACV: €1.45M │ │
│  │           [View] [Edit] [Delete]          │ │
│  ├────────────────────────────────────────────┤ │
│  │ SecureLife Insurance Group                │ │
│  │ INS-2026-001 • Insurance • ACV: €1.85M   │ │
│  │           [View] [Edit] [Delete]          │ │
│  └────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  Backups                          [Create Backup]│
│  (Backup list here...)                           │
└──────────────────────────────────────────────────┘
```

---

## 🏢 Account Management Actions

### 1. VIEW Account (Blue Button)
- **What:** Opens full account dashboard
- **Use:** See all details, opportunities, team, analytics
- **Result:** Navigates to account page

### 2. EDIT Account (Orange Button)
- **What:** Update account information
- **Fields:**
  - Account Name
  - ACV (Annual Contract Value)
  - Health Status (excellent/good/at-risk/critical)
- **Result:** Account updated, list refreshes

### 3. DELETE Account (Red Button)
- **What:** Permanently remove account
- **Also deletes:**
  - All opportunities
  - All engagements
  - Team data
  - Customer Success Plan
  - Activities
- **⚠️ WARNING:** Cannot be undone!
- **Result:** Account removed, list refreshes

---

## 📋 Import Templates - Complete Flow

### CSV Import Flow

```
1. DOWNLOAD TEMPLATE
   Click "Account CSV" or "Opportunity CSV"
   ↓
   Template file downloads to your computer

2. FILL TEMPLATE
   Open in Excel/Google Sheets
   ↓
   Delete sample rows
   ↓
   Add your data (one row per account/opportunity)
   ↓
   Save file

3. IMPORT
   Click "Import from Template (CSV/JSON)"
   ↓
   Select your filled file
   ↓
   ✅ Data imported!
   ↓
   Dashboard updates automatically
```

### JSON Import Flow

```
1. DOWNLOAD TEMPLATE
   Click "Account JSON" or "Opportunity JSON"
   ↓
   Template file downloads

2. FILL TEMPLATE
   Open in text editor (VS Code, Notepad++)
   ↓
   Replace sample data with your data
   ↓
   Keep JSON structure intact
   ↓
   Save file

3. IMPORT
   Click "Import from Template (CSV/JSON)"
   ↓
   Select your JSON file
   ↓
   ✅ Data imported!
```

---

## 📂 File Structure Reference

```
CanvasApp/
├── js/
│   ├── EA_AccountManager.js        ← CRUD operations (create, update, delete)
│   ├── EA_TemplateManager.js       ← NEW: Template download & import
│   ├── EA_DemoScenarios.js         ← NEW: Banking, FinTech, Insurance demos
│   └── EA_ProjectManager.js        ← NEW: Project export/import
│
├── NexGenEA/
│   └── EA2_Toolkit/
│       └── EA_Growth_Dashboard.html ← Entry point, Data Manager modal
│
├── ACCOUNT_MANAGEMENT_GUIDE.md     ← NEW: Complete how-to guide
├── TOOLKIT_ENHANCEMENTS_COMPLETE.md← Technical documentation
└── TOOLKIT_QUICK_START.md          ← 5-minute quick start
```

---

## 🎯 Templates Available

### Account Templates

**CSV Template:** `EA_Account_Import_Template.csv`
- **Download:** Data Manager → Import Templates → Account CSV
- **Columns:** 12 columns (3 required, 9 optional)
- **Required:** Account Name, Account Manager, Industry
- **Format:** Comma-separated values
- **Use for:** Bulk import from Excel, Google Sheets

**JSON Template:** `EA_Account_Import_Template.json`
- **Download:** Data Manager → Import Templates → Account JSON
- **Structure:** accounts array with objects
- **Required fields:** name, accountManager, industry
- **Format:** Valid JSON
- **Use for:** Programmatic import, API integration

### Opportunity Templates

**CSV Template:** `EA_Opportunity_Import_Template.csv`
- **Download:** Data Manager → Import Templates → Opportunity CSV
- **Columns:** 12 columns (3 required, 9 optional)
- **Required:** Account ID, Opportunity Name, Estimated Value
- **Format:** Comma-separated values
- **Note:** Account must exist before importing opportunities

**JSON Template:** `EA_Opportunity_Import_Template.json`
- **Download:** Data Manager → Import Templates → Opportunity JSON
- **Structure:** opportunities array with objects
- **Required fields:** accountId, name, estimatedValue
- **Format:** Valid JSON
- **Note:** Validates account exists during import

---

## 🎬 Demo Scenarios - What Gets Created

### Banking Demo
```
Account:
  Name: Nordic Universal Bank
  ID: BANK-2026-001
  ACV: €3,250,000
  Industry: Banking
  
Opportunity:
  Name: Core Banking Platform Modernization
  Value: €5,800,000
  Probability: 85%
  Stage: Negotiate
```

### FinTech Demo
```
Account:
  Name: PayNordic
  ID: FINTECH-2026-001
  ACV: €1,450,000
  Industry: Fintech
  
Opportunity:
  Name: Platform Re-Architecture
  Value: €1,850,000
  Probability: 65%
  Stage: Qualify
```

### Insurance Demo
```
Account:
  Name: SecureLife Insurance Group
  ID: INS-2026-001
  ACV: €1,850,000
  Industry: Insurance
  
Opportunity:
  Name: Digital Transformation
  Value: €2,500,000
  Probability: 70%
  Stage: Propose
```

### Load All Demos
```
Creates all 3 accounts above
Total ACV: €6,550,000
Total Pipeline: €10,150,000
Perfect for: Sales demonstrations, training, POCs
```

---

## ⚡ Common Tasks - Quick Commands

**Task:** Delete an account
**Steps:** Data Manager → Manage Accounts → Find account → Click Delete → Confirm

**Task:** Update account ACV
**Steps:** Data Manager → Manage Accounts → Find account → Click Edit → Enter new ACV

**Task:** Import 20 accounts from Excel
**Steps:** Download CSV template → Fill in Excel → Save → Import from Template → Select file

**Task:** Load demo data for presentation
**Steps:** Data Manager → Demo Scenarios → Click "Load All 3 Demos"

**Task:** Backup before major changes
**Steps:** Data Manager → Backups → Create Backup → Enter name

**Task:** See all account details
**Steps:** Data Manager → Manage Accounts → Click View (blue button)

---

## 📊 Data Manager Sections Summary

| Section | Purpose | Key Actions |
|---------|---------|-------------|
| **Storage Stats** | Monitor space usage | View only |
| **Import/Export All** | Full system backup | Export, Import |
| **Import Templates** | Bulk data entry | Download templates, Import files |
| **Demo Scenarios** | Sample data | Load Banking/FinTech/Insurance |
| **Manage Accounts** | Update/Delete accounts | View, Edit, Delete |
| **Backups** | Version control | Create, Restore, Delete |

---

## 🔑 Key Locations Cheat Sheet

```
┌─────────────────────────────────────────────────────────┐
│ WHAT                    WHERE                           │
├─────────────────────────────────────────────────────────┤
│ Account Management    → Data Manager → Manage Accounts  │
│ Download Templates    → Data Manager → Import Templates │
│ Import from Templates → Data Manager → Import Templates │
│ Load Demo Data        → Data Manager → Demo Scenarios   │
│ Export Everything     → Data Manager → Import/Export    │
│ Create Backup         → Data Manager → Backups          │
│ Edit Account          → Manage Accounts → Edit button   │
│ Delete Account        → Manage Accounts → Delete button │
│ View Account Details  → Manage Accounts → View button   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Everything is Ready!

**Created Files:**
✅ [EA_TemplateManager.js](js/EA_TemplateManager.js) - Template system
✅ [EA_Growth_Dashboard.html](NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html) - Updated with all features
✅ [ACCOUNT_MANAGEMENT_GUIDE.md](ACCOUNT_MANAGEMENT_GUIDE.md) - Complete how-to guide
✅ This quick reference file

**Features Available:**
✅ Account CRUD (Create, Read, Update, Delete)
✅ CSV templates for accounts & opportunities  
✅ JSON templates for accounts & opportunities
✅ Bulk import from templates
✅ 3 industry demo scenarios (Banking, FinTech, Insurance)
✅ Account management UI with View/Edit/Delete
✅ Full data export/import
✅ Backup & restore system

**Next Step:** Open [EA_Growth_Dashboard.html](NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html) and click the database icon! 🎉
