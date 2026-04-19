# 📚 ACCOUNT & DATA MANAGEMENT GUIDE

**Location:** EA Growth Dashboard → Data Manager  
**Access:** Click the database icon (📊) in the header toolbar  
**Last Updated:** April 19, 2026

---

## 🎯 Quick Access

**To open Data Manager:**
1. Open [EA_Growth_Dashboard.html](NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html)
2. Click the **database icon** in the top-right toolbar
3. The Data Manager modal will appear with all management options

---

## 🏢 MANAGE ACCOUNTS (Update & Delete)

### Location in Data Manager Modal

Scroll to the **"🏢 Manage Accounts"** section (fourth section from top)

### Features Available

**View All Accounts:**
- Lists all accounts with ID, Industry, and ACV
- Shows account count in top-right
- Scrollable list (max 300px height)

**Actions for Each Account:**

1. **View** (Blue button)
   - Opens full account dashboard
   - Shows all opportunities, engagements, team
   - Click → Navigates to `EA_Account_Dashboard.html?accountId=ACC-XXX`

2. **Edit** (Orange button)
   - Update account name
   - Update ACV (Annual Contract Value)
   - Update health status (excellent/good/at-risk/critical)
   - Click → Prompts appear for each field
   - All changes saved to localStorage immediately

3. **Delete** (Red button)
   - Deletes account AND all associated data
   - Also removes: opportunities, engagements, team data
   - **⚠️ WARNING:** Cannot be undone!
   - Confirmation dialog appears before deletion

### Example: Edit an Account

```
1. Click "Edit" button on Nordic Universal Bank
2. Prompt 1: "Account Name:" → Enter new name or keep current
3. Prompt 2: "ACV (Annual Contract Value in €):" → Enter amount
4. Prompt 3: "Health Status (excellent/good/at-risk/critical):" → Select status
5. Click OK on each prompt
6. ✅ Account updated! Dashboard refreshes automatically
```

### Example: Delete an Account

```
1. Click "Delete" button on account
2. Confirmation appears:
   ⚠️ Delete account "Account Name"?
   
   This will also delete:
   • X opportunities
   • All associated data
   
   This cannot be undone!
   
3. Click "OK" to confirm or "Cancel" to abort
4. ✅ Account deleted! List refreshes automatically
```

---

## 📋 IMPORT TEMPLATES (Add Multiple Accounts/Opportunities)

### Location in Data Manager Modal

Look for **"📋 Import Templates"** section (second section from top)

### Step-by-Step Process

**Option 1: Import Accounts (CSV Format)**

1. **Download Template:**
   - Click **"Account CSV"** button
   - File downloads: `EA_Account_Import_Template.csv`
   - Contains headers and sample row with instructions

2. **Fill Template:**
   - Open CSV in Excel or any spreadsheet app
   - Delete the sample row and instructions
   - Add your account data (one row per account)
   
   **Required Columns:**
   - Account Name
   - Account Manager
   - Industry
   
   **Optional Columns:**
   - Account ID (leave blank to auto-generate)
   - ACV (Annual Contract Value)
   - Region
   - Company Size
   - Health Status
   - Strategic Priorities (separate with semicolons)
   - Business Strategy
   - Pain Points (separate with semicolons)
   - Last Contact Date (YYYY-MM-DD)

3. **Import Data:**
   - Click **"Import from Template (CSV/JSON)"** button
   - Select your filled CSV file
   - ✅ Accounts created automatically!
   - Success message shows count and any errors

**Option 2: Import Accounts (JSON Format)**

1. **Download Template:**
   - Click **"Account JSON"** button
   - File downloads: `EA_Account_Import_Template.json`
   - Contains structure and 2 sample accounts

2. **Fill Template:**
   - Open JSON in text editor (VS Code, Notepad++, etc.)
   - Replace sample data with your accounts
   - Keep JSON structure intact
   
   **Example:**
   ```json
   {
     "accounts": [
       {
         "id": "ACC-001",
         "name": "Your Company Name",
         "accountManager": "Manager Name",
         "ACV": 2500000,
         "industry": "Banking",
         "region": "Nordic",
         "size": "Enterprise",
         "health": "good",
         "strategicPriorities": [
           "Digital Transformation",
           "Cost Reduction"
         ],
         "businessStrategy": "Your strategy here...",
         "painPoints": [
           "Pain point 1",
           "Pain point 2"
         ]
       }
     ]
   }
   ```

3. **Import Data:**
   - Click **"Import from Template (CSV/JSON)"** button
   - Select your JSON file
   - ✅ Accounts created!

**Option 3: Import Opportunities (CSV Format)**

1. **Download Template:**
   - Click **"Opportunity CSV"** button
   - File downloads: `EA_Opportunity_Import_Template.csv`

2. **Fill Template:**
   - Must have accounts created first!
   - Account ID must match existing account
   
   **Required Columns:**
   - Account ID (e.g., ACC-001)
   - Opportunity Name
   - Estimated Value (€)
   
   **Optional Columns:**
   - Opportunity ID (auto-generated if blank)
   - Status (active, won, lost, on-hold)
   - Stage (discovery, qualify, propose, negotiate, close)
   - Probability (0-100%)
   - Expected Close Date (YYYY-MM-DD)
   - Executive Sponsor
   - Competitors (separate with semicolons)
   - Next Steps (separate with semicolons)
   - Risks (separate with semicolons)

3. **Import Data:**
   - Click **"Import from Template (CSV/JSON)"** button
   - Select your CSV file
   - ✅ Opportunities linked to accounts!

**Option 4: Import Opportunities (JSON Format)**

1. **Download Template:**
   - Click **"Opportunity JSON"** button
   - File downloads: `EA_Opportunity_Import_Template.json`

2. **Fill Template:**
   - Replace sample data
   - Ensure accountId matches existing accounts
   
   **Example:**
   ```json
   {
     "opportunities": [
       {
         "id": "OPP-001",
         "accountId": "ACC-001",
         "name": "Digital Platform Modernization",
         "status": "active",
         "stage": "negotiate",
         "estimatedValue": 5800000,
         "probability": 85,
         "closeDate": "2026-09-30",
         "sponsor": "CIO Name"
       }
     ]
   }
   ```

3. **Import Data:**
   - Click **"Import from Template (CSV/JSON)"** button
   - Select your JSON file
   - ✅ Opportunities imported!

---

## 🎯 DEMO SCENARIOS (Pre-Built Examples)

### Location in Data Manager Modal

Find **"🎯 Demo Scenarios"** section (third section from top)

### Available Demos

**1. Banking Demo**
- Click **"Banking"** button
- Creates: Nordic Universal Bank
- ACV: €3.25M
- Opportunity: €5.8M Core Banking Modernization (85% probability)
- Industry: Banking
- Use for: Demonstrating banking EA engagements

**2. FinTech Demo**
- Click **"FinTech"** button
- Creates: PayNordic Payment Platform
- ACV: €1.45M
- Opportunity: €1.85M Platform Re-Architecture (65% probability)
- Industry: Fintech
- Use for: Demonstrating fintech scale-up scenarios

**3. Insurance Demo**
- Click **"Insurance"** button
- Creates: SecureLife Insurance Group
- ACV: €1.85M
- Opportunity: €2.5M Digital Transformation (70% probability)
- Industry: Insurance
- Use for: Demonstrating insurance modernization

**4. Load All Demos**
- Click **"Load All 3 Demos"** button
- Creates all three accounts at once
- Total ACV: €6.55M
- Total Pipeline: €10.15M
- Use for: Full toolkit demonstration

---

## 💾 EXPORT & IMPORT (Full Data Backup)

### Location in Data Manager Modal

**"Import/Export All Data"** section (first section from top)

### Export All Data

**Purpose:** Backup all accounts, opportunities, engagements, teams, etc.

**Steps:**
1. Click **"Export All Data"** button
2. JSON file downloads: `EA_Platform_Export_[timestamp].json`
3. Contains EVERYTHING in localStorage
4. Use for: Backups, sharing with colleagues, moving between environments

### Import Data

**Purpose:** Restore from previous export or load data from another instance

**Steps:**
1. Click **"Import Data"** button
2. Select JSON export file
3. Choose merge mode (adds to existing) or overwrite
4. ✅ Data restored!
5. Dashboard refreshes automatically

---

## 🔄 BACKUPS (Version Control)

### Location in Data Manager Modal

**"Backups"** section (last section at bottom)

### Create Backup

**Purpose:** Save a snapshot of current data with a custom name

**Steps:**
1. Click **"Create Backup"** button
2. Enter backup name (e.g., "Before Q2 Planning")
3. ✅ Backup created in localStorage
4. Shows in backups list with timestamp and size

### Restore Backup

**Purpose:** Revert to a previous state

**Steps:**
1. Find backup in list
2. Click **"Restore"** button
3. **⚠️ WARNING:** This replaces ALL current data
4. Confirm in dialog
5. Page reloads with restored data

### Delete Backup

**Steps:**
1. Find backup in list
2. Click **"Delete"** button
3. Confirm deletion
4. Backup removed (does not affect current data)

---

## 📊 STORAGE STATS

**Location:** Top of Data Manager modal

**Shows:**
- Total storage used
- Storage available
- Usage percentage
- Visual bar graph

**Typical Usage:**
- Empty toolkit: ~2 KB
- 5 accounts + opportunities: ~50 KB
- 20 accounts + full data: ~200 KB
- localStorage limit: 5-10 MB (browser dependent)

---

## 🔍 WHERE TO FIND WHAT

| What You Want to Do | Where to Go |
|---------------------|-------------|
| **View all accounts** | Data Manager → Manage Accounts section |
| **Edit account name/ACV** | Data Manager → Manage Accounts → Edit button |
| **Delete an account** | Data Manager → Manage Accounts → Delete button |
| **Add 1 account manually** | Growth Dashboard → Click "Add Account" (if available) OR use templates |
| **Add many accounts at once** | Data Manager → Import Templates → Download CSV/JSON → Fill → Import |
| **Add opportunities in bulk** | Data Manager → Import Templates → Download Opportunity template → Import |
| **Load demo data** | Data Manager → Demo Scenarios → Choose industry |
| **Backup everything** | Data Manager → Export All Data OR Create Backup |
| **Restore old version** | Data Manager → Backups → Restore |

---

## ⚠️ IMPORTANT WARNINGS

1. **Deleting Accounts:**
   - Deletes ALL associated opportunities
   - Deletes ALL associated engagements
   - Deletes team data, CSP data, activities
   - **CANNOT BE UNDONE** (unless you have a backup)

2. **Restoring Backups:**
   - Replaces EVERYTHING with backup data
   - Current data is lost (unless exported first)
   - Always export before restoring

3. **Storage Limits:**
   - localStorage has browser limits (usually 5-10 MB)
   - Monitor storage stats
   - Create backups and clear old data regularly

4. **Template Format:**
   - CSV: Must match column headers exactly
   - JSON: Must maintain structure
   - Validation errors shown after import
   - Fix errors and re-import if needed

---

## 🎓 BEST PRACTICES

### For Bulk Import

1. **Start with templates** - Download blank templates first
2. **Test with 1-2 rows** - Import small sample before bulk
3. **Backup before import** - Create backup in case of errors
4. **Validate data** - Check ACV amounts, dates, IDs before import
5. **Review errors** - Import shows which rows failed and why

### For Account Management

1. **Regular cleanup** - Delete old/inactive accounts periodically
2. **Consistent naming** - Use standard formats (e.g., "Company Name Inc.")
3. **Update health status** - Keep account health current
4. **Track ACV changes** - Update when contracts renew/expand

### For Data Safety

1. **Weekly exports** - Download full export every week
2. **Named backups** - Create backups before major changes
3. **Version control** - Keep old exports/backups in cloud storage
4. **Test restores** - Occasionally test that backups work

---

## 🆘 TROUBLESHOOTING

**Problem:** Import says "Account not found" for opportunities  
**Solution:** Import accounts FIRST, then opportunities

**Problem:** CSV import fails  
**Solution:** Check for special characters, extra commas, incorrect date formats

**Problem:** Can't find deleted account  
**Solution:** Check backups or exports - deletion is permanent

**Problem:** Storage full  
**Solution:** Export data, clear localStorage, import only what you need

**Problem:** Templates not downloading  
**Solution:** Check browser's download folder and pop-up blocker settings

**Problem:** Account list not showing  
**Solution:** Refresh page, check browser console for errors

---

## 📱 Quick Reference Card

```
┌─────────────────────────────────────────┐
│   EA GROWTH DASHBOARD - DATA MANAGER    │
├─────────────────────────────────────────┤
│ 📊 Access: Header → Database Icon       │
├─────────────────────────────────────────┤
│ SECTIONS (top to bottom):               │
│                                         │
│ 1. Import/Export All Data               │
│    • Full backup & restore              │
│                                         │
│ 2. 📋 Import Templates                  │
│    • Download blank CSV/JSON            │
│    • Import filled templates            │
│                                         │
│ 3. 🎯 Demo Scenarios                    │
│    • Banking, FinTech, Insurance        │
│    • Load all 3 at once                 │
│                                         │
│ 4. 🏢 Manage Accounts                   │
│    • VIEW: Open account dashboard       │
│    • EDIT: Update name/ACV/health       │
│    • DELETE: Remove account + data      │
│                                         │
│ 5. Backups                              │
│    • Create named snapshots             │
│    • Restore previous versions          │
└─────────────────────────────────────────┘
```

---

## ✅ COMPLETE WORKFLOW EXAMPLE

**Scenario:** Import 10 banking clients and their opportunities

### Step 1: Download Templates
```
1. Open Data Manager (database icon)
2. Scroll to "Import Templates"
3. Click "Account CSV" → Save template
4. Click "Opportunity CSV" → Save template
```

### Step 2: Fill Account Template
```
1. Open EA_Account_Import_Template.csv in Excel
2. Delete sample row and instruction rows
3. Add 10 rows with your bank clients:
   
   ACC-001,Bank A,John Smith,1500000,Banking,Nordic,Enterprise,good,...
   ACC-002,Bank B,Jane Doe,2200000,Banking,Nordic,Enterprise,excellent,...
   ...
   
4. Save file as "Banking_Accounts_Import.csv"
```

### Step 3: Import Accounts
```
1. In Data Manager, click "Import from Template"
2. Select "Banking_Accounts_Import.csv"
3. Wait for confirmation: "✅ 10 accounts imported"
4. Check any error messages
```

### Step 4: Fill Opportunity Template
```
1. Open EA_Opportunity_Import_Template.csv
2. Add opportunities, linking to imported accounts:
   
   OPP-001,ACC-001,Core Banking Modernization,active,negotiate,5800000,85,...
   OPP-002,ACC-002,Digital Channels Upgrade,active,qualify,3200000,65,...
   ...
   
3. Save as "Banking_Opportunities_Import.csv"
```

### Step 5: Import Opportunities
```
1. Click "Import from Template"
2. Select "Banking_Opportunities_Import.csv"
3. Wait for confirmation: "✅ X opportunities imported"
4. Dashboard updates automatically
```

### Step 6: Verify & Backup
```
1. Scroll to "Manage Accounts" section
2. Verify all 10 accounts appear
3. Click "View" to check opportunities linked
4. Scroll to bottom, click "Create Backup"
5. Name: "Banking Clients - Initial Import"
6. ✅ Done!
```

---

**Your toolkit is now fully equipped with comprehensive data management capabilities!** 🎉

For additional support, see:
- [TOOLKIT_ENHANCEMENTS_COMPLETE.md](TOOLKIT_ENHANCEMENTS_COMPLETE.md) - Full technical documentation
- [TOOLKIT_QUICK_START.md](TOOLKIT_QUICK_START.md) - Quick start guide
