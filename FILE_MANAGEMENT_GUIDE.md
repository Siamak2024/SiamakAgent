# EA Platform - File Management Guide

## 📂 Folder Structure

The EA Platform uses a structured folder system for managing all data files:

```
CanvasApp/
├── data/                    # Main data directory
│   ├── imports/            # Uploaded workshop files
│   ├── exports/            # Generated reports & downloads
│   ├── projects/           # Saved project snapshots
│   └── README.md           # Detailed folder documentation
├── js/                      # JavaScript modules
│   ├── EA_Config.js        # Configuration
│   ├── EA_DataManager.js   # Data persistence (localStorage)
│   ├── EA_SyncEngine.js    # Toolkit synchronization
│   └── EA_FileManager.js   # File-based storage
└── EA Plattform/           # Main application
    └── EA 20 Platform_V3_Integrated.html
```

---

## 🔧 Storage Architecture

### Dual Storage System

The EA Platform uses **two complementary storage mechanisms**:

#### 1️⃣ **Primary: Browser localStorage**
- **Speed:** Instant access, no file I/O
- **Storage:** Up to 10MB per domain
- **Keys:**
  - `ea_config` - Global settings & API key
  - `ea_projects` - Project metadata index
  - `ea_project_{id}` - Individual project data
  - `ea_snapshots` - Backup snapshot metadata

**Managed by:** `EA_DataManager.js`

#### 2️⃣ **Secondary: File System**
- **Purpose:** Backup, archival, collaboration
- **Location:** `/data` folder structure
- **Formats:** JSON (primary), CSV, PDF

**Managed by:** `EA_FileManager.js`

---

## 💾 Auto-Save Feature

**Status:** ✅ Enabled by default

- **Interval:** Every 5 minutes
- **Target:** localStorage (primary storage)
- **Silent:** Background operation, no user interruption
- **Console:** Logs auto-save timestamp

### How to Configure

```javascript
// Enable with custom interval (in minutes)
fileManager.enableAutoSave(projectId, projectName, () => model, 10);

// Disable auto-save
fileManager.disableAutoSave();
```

---

## � Creating New Projects

### Overview
The EA Platform provides a dedicated modal interface for creating new projects with proper metadata and automatic backup initialization.

### How to Create a New Project

#### Step 1: Open New Project Dialog
Click the **📄 New** button in the header navigation

#### Step 2: Enter Project Details
- **Project Name** (required): Descriptive name for your architecture model
  - Example: "Digital Transformation 2024"
  - Example: "Cloud Migration Strategy"
- **Description** (optional): Brief overview of project scope and objectives
  - Helps track project context over time
  - Saved as project metadata

#### Step 3: Create
Click **"Create Project"** to initialize

### What Happens Behind the Scenes

1. **Project ID Generation**
   - Format: `proj_{timestamp}`
   - Example: `proj_1704124800000`
   - Ensures unique identification

2. **DataManager Integration**
   ```javascript
   dataManager.saveProject(projectId, projectName, {
     valueStreams: [],
     capabilities: [],
     systems: [],
     metadata: {
       description: projectDescription,
       created: new Date().toISOString(),
       modified: new Date().toISOString()
     }
   });
   ```

3. **Initial Snapshot Creation**
   - FileManager creates backup in `/data/projects/`
   - Format: `EA-Platform_Project-Name_YYYY-MM-DD_HHmm.json`
   - Allows recovery to "fresh project" state

4. **Auto-Save Activation**
   - Auto-save restarts with new project ID
   - Saves progress every 5 minutes
   - Console logging confirms activation

### Benefits

✅ **Unique Project IDs** - No naming conflicts  
✅ **Metadata Tracking** - Creation date, description preserved  
✅ **Instant Backup** - Initial snapshot for recovery  
✅ **Auto-Save Ready** - Background saves configured automatically  
✅ **Load Dialog Integration** - Project appears in "💾 Load" menu immediately  

### Validation

- **Name Required:** Cannot create project without a name
- **Unsaved Changes Warning:** Confirms before discarding current work
- **Empty Model:** Starts with clean slate (no pre-loaded data)

---

## �📥 Import Workflow

### Step 1: Upload File
User clicks **Import** button in EA Platform header:
```html
<label>↑ Import
  <input type="file" onchange="importModel(event)" accept=".json">
</label>
```

### Step 2: Validation
FileManager validates the imported JSON structure:
```javascript
{
  "version": "EA_2.0",
  "projectId": "proj_123",
  "projectName": "Commercial RE",
  "data": { ... }
}
```

### Step 3: Integration
- Data merged into current project
- localStorage updated
- UI re-rendered with imported data

### Step 4: Backup (Optional)
- Uploaded file can be saved to `/data/imports` for audit trail
- Original filename preserved with timestamp

---

## 📤 Export Workflow

### Option 1: Quick Export (Browser Download)
User clicks **Export** button → Instant JSON download

```javascript
fileManager.exportProjectToDownload(projectId, name, data);
// Result: Commercial_RE_2026-03-13_1430.json
```

### Option 2: Full Backup Export
Includes snapshot metadata for versioning:

```javascript
fileManager.saveProjectSnapshot(projectId, name, data, true);
// Creates backup AND triggers download
```

### Export Formats

#### JSON (Primary)
```json
{
  "version": "EA_2.0",
  "exported": "2026-03-13T14:30:00Z",
  "projectId": "proj_123",
  "projectName": "Commercial RE Digital Transformation",
  "data": {
    "capabilities": [...],
    "systems": [...],
    "initiatives": [...],
    "operatingModel": {...}
  }
}
```

#### CSV (Excel Compatible)
For tabular exports:
```javascript
fileManager.exportToCSV(capabilities, 'capability_inventory');
// Result: capability_inventory_2026-03-13_1430.csv
```

---

## 💼 Project Snapshots

### What Are Snapshots?
Versioned backups of project state at specific points in time.

### When Are Snapshots Created?
1. **Manual Save:** User clicks "Save" button
2. **Pre-Export:** Before major exports
3. **Pre-Sync:** Before syncing with toolkits
4. **Manual Trigger:** Developer calls `saveProjectSnapshot()`

### Snapshot Metadata
Stored in localStorage `ea_snapshots`:
```json
[
  {
    "filename": "Commercial_RE_backup_2026-03-13_1430.json",
    "projectId": "proj_123",
    "projectName": "Commercial RE Digital Transformation",
    "timestamp": "2026-03-13T14:30:00Z"
  }
]
```

### Retention Policy
- **Per Project:** Keep last 10 snapshots
- **Cleanup:** Automatic on new snapshot creation
- **Manual Cleanup:** User can delete from `/data/projects` folder

---

## 🛠️ Toolkit Integration

### Workshop Data Export
Each toolkit can export its data:

```javascript
fileManager.exportWorkshopData('bmc', bmcData);
// Result: Business_Model_Canvas_2026-03-13_1430.json
```

### Available Toolkit IDs
- `bmc` - Business Model Canvas
- `capabilityMap` - Capability Mapping
- `wardley` - Strategy Workbench (Wardley Map)
- `valueChain` - Value Chain Analyzer
- `maturity` - Maturity Assessment

### Sync to Platform
Toolkit data can be imported into EA Platform:
1. Export from toolkit
2. Import to EA Platform
3. `EA_SyncEngine` merges data intelligently

---

## 🔐 Data Security

### API Key Storage
- **Location:** localStorage `ea_config`
- **Shared:** Across all toolkits via `EA_DataManager`
- **Never Exported:** API keys excluded from file exports
- **Git Ignored:** Local storage only

### Sensitive Data Protection
- All `/data` folders in `.gitignore`
- No customer data committed to repository
- Files stay local to user's machine
- Cloud sync via OneDrive/Google Drive (user choice)

---

## 📊 File Naming Convention

### Format
```
{tool}_{description}_{timestamp}.{ext}

Components:
- tool: bmc, capmap, strategy, platform
- description: snake_case project name
- timestamp: YYYY-MM-DD_HHmm
- ext: json, csv, pdf
```

### Examples
```
bmc_commercial_re_2026-03-13_1430.json
capmap_industry_analysis_2026-03-13_1545.json
platform_ea_architecture_export_2026-03-13_1600.json
maturity_banking_assessment_2026-03-13_1615.csv
```

---

## 🧹 Maintenance & Cleanup

### Recommended Schedule

#### Weekly
- Review `/data/imports` - archive or delete processed files
- Check `/data/exports` - keep recent, archive older

#### Monthly
- Review `/data/projects` - archive completed projects
- Verify localStorage size (Chrome DevTools → Application → Storage)

#### Quarterly
- Full backup of `/data/projects` to external storage
- Clean up old snapshots (>3 months)

### Manual Cleanup

```powershell
# List old files in imports (PowerShell)
Get-ChildItem data/imports -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }

# Move to archive folder
New-Item -ItemType Directory -Path "data/archive" -Force
Move-Item data/imports/*.json data/archive/
```

---

## 🚀 Advanced Usage

### Programmatic Export

```javascript
// Export all capabilities to CSV
const capabilities = model.capabilities.map(cap => ({
  Name: cap.name,
  Domain: cap.domain,
  Maturity: cap.maturity,
  'Strategic Importance': cap.strategicImportance,
  Description: cap.description
}));

fileManager.exportToCSV(capabilities, 'capabilities_inventory');
```

### Bulk Import

```javascript
// Import multiple workshop files
const files = ['bmc.json', 'capmap.json', 'wardley.json'];

for (const file of files) {
  const data = await fileManager.importFromFile(file);
  syncEngine.syncToPlat(projectId, data.toolkit, { mode: 'merge' });
}
```

### Custom Auto-Save Interval

```javascript
// Auto-save every 2 minutes (instead of default 5)
fileManager.enableAutoSave(
  currentModelId,
  currentModelName,
  () => model,
  2  // minutes
);
```

---

## 📞 Troubleshooting

### Issue: "No saved models found"
**Cause:** localStorage cleared or different browser
**Solution:** Import from `/data/projects` folder backup

### Issue: Export download not starting
**Cause:** Browser popup blocker
**Solution:** Allow popups for localhost:8080

### Issue: Import fails with "Invalid JSON"
**Cause:** Corrupted or wrong format file
**Solution:** Validate JSON at jsonlint.com

### Issue: Auto-save not working
**Cause:** FileManager not initialized
**Solution:** Check console for "FileManager initialized" message

---

## 📖 API Reference

### EA_FileManager Methods

```javascript
// Export project to download
fileManager.exportProjectToDownload(projectId, name, data)

// Export workshop data
fileManager.exportWorkshopData(toolkitId, data)

// Import from file
await fileManager.importFromFile(file)

// Save project snapshot
fileManager.saveProjectSnapshot(projectId, name, data, autoDownload)

// Get snapshots list
fileManager.getSnapshots(projectId)

// Export to CSV
fileManager.exportToCSV(data, filename)

// Enable auto-save
fileManager.enableAutoSave(projectId, name, getDataCallback, intervalMinutes)

// Disable auto-save
fileManager.disableAutoSave()
```

---

## ✅ Integration Checklist

When integrating file management in new features:

- [ ] Include `EA_FileManager.js` script tag
- [ ] Initialize FileManager in DOMContentLoaded
- [ ] Connect to DataManager via `fileManager.init(dataManager)`
- [ ] Use FileManager for exports instead of manual Blob creation
- [ ] Create snapshots before major operations
- [ ] Test import with various file sizes
- [ ] Verify .gitignore rules protecting user data

---

## 🔗 Related Documentation

- [EA_Config.js](../js/EA_Config.js) - Configuration management
- [EA_DataManager.js](../js/EA_DataManager.js) - localStorage management
- [EA_SyncEngine.js](../js/EA_SyncEngine.js) - Toolkit synchronization
- [data/README.md](../data/README.md) - Folder structure details

---

**Last Updated:** March 13, 2026  
**Version:** EA Platform V3
