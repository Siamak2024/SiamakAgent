# Data Folder Structure

This folder contains all user-generated and application data for the EA Platform ecosystem.

## 📁 Folder Structure

### `/imports`
**Purpose:** Temporary storage for uploaded workshop files and data imports

- Workshop results from toolkit sessions
- Excel/CSV files uploaded by users
- JSON exports from external systems
- Files are processed and then can be archived or deleted

**Example files:**
- `bmc_workshop_2026-03-13.json`
- `capability_mapping_export.csv`
- `maturity_assessment_proptech.json`

---

### `/exports`
**Purpose:** Generated exports and reports for download

- EA architecture diagrams (PDF, PNG)
- Transformation roadmap exports (Excel, PDF)
- Workshop summary reports
- Project snapshots for sharing with stakeholders

**Example files:**
- `EA_Architecture_Report_2026-03-13.pdf`
- `Transformation_Roadmap_Q1_2026.xlsx`
- `Project_Commercial_RE_Export.json`

---

### `/projects`
**Purpose:** Saved project snapshots and versioned work

- Complete project state backups
- Versioned snapshots for comparison
- Long-term storage of analyzed architectures
- Auto-saves and manual saves from EA Platform

**Example files:**
- `Commercial_RE_Digital_Transformation_v1.json`
- `PropTech_Architecture_Autosave_2026-03-13.json`
- `Banking_EA_Maturity_Final.json`

---

## 🔒 Data Management

### LocalStorage
Primary storage mechanism uses browser localStorage with keys:
- `ea_config` - Global configuration and API key
- `ea_projects` - Project metadata and index
- `ea_project_{id}` - Individual project data

### File-Based Backup
Files in this folder serve as:
1. **Backup** - Secondary storage outside browser
2. **Import/Export** - Cross-system data transfer
3. **Archival** - Long-term project storage
4. **Collaboration** - Share project files with team members

---

## 🚫 Git Ignore

All folders under `/data` are ignored by git to protect:
- Customer data privacy
- API keys and sensitive information
- Large binary files (PDFs, Excel)
- Temporary workshop data

**Exception:** README files and template examples are tracked.

---

## 📊 File Formats

### JSON (Primary Format)
```json
{
  "id": "proj_123",
  "name": "Commercial RE Digital Transformation",
  "created": "2026-03-13T10:30:00Z",
  "data": {
    "capabilities": [...],
    "systems": [...],
    "initiatives": [...]
  }
}
```

### CSV (Excel Compatible)
Used for tabular data exports:
- Capability matrices
- System inventories
- Initiative roadmaps

### PDF (Reports)
Generated reports with:
- Executive summaries
- Architecture diagrams
- Maturity assessments
- Transformation roadmaps

---

## 🔄 Workflow

### Import Workflow
1. User uploads file via EA Platform interface
2. File saved to `/imports` folder
3. Validation and parsing
4. Data merged into current project
5. File can be kept or archived

### Export Workflow
1. User clicks export button in EA Platform
2. Data serialized to chosen format (JSON/CSV/PDF)
3. File saved to `/exports` folder
4. Download link presented to user
5. File available for re-download from history

### Project Save Workflow
1. User clicks "Save" in EA Platform
2. Full project state captured
3. Versioned file saved to `/projects` folder
4. Metadata updated in localStorage
5. Available in "Load" dialog for future sessions

---

## 🧹 Maintenance

### Cleanup Recommendations
- **imports/**: Archive or delete after 30 days
- **exports/**: Keep active downloads, archive older reports
- **projects/**: Maintain version history, archive completed projects

### Backup Strategy
- Regular backup of `/projects` folder
- Export critical projects to external storage
- Sync to cloud storage (OneDrive, Google Drive) if needed

---

## 🔧 Technical Notes

### File Naming Convention
```
{tool}_{description}_{timestamp}.{ext}

Examples:
- bmc_commercial_re_2026-03-13.json
- capmap_proptech_analysis_20260313_1430.json
- export_ea_architecture_final.pdf
```

### Character Encoding
All text files use UTF-8 encoding to support Swedish characters (å, ä, ö) and international content.

### Size Limits
- Individual files: Max 50 MB recommended
- Total folder size: Monitor and archive when >1 GB
- JSON structure: Keep under 10,000 objects for performance

---

## 📞 Support

For questions about data management:
1. Check EA Platform documentation
2. Review QUICKSTART.md in root folder
3. Contact EA 2.0 support team
