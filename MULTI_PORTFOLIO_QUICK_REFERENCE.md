# Multi-Portfolio Quick Reference Card

## 🎯 Common Tasks

### Create New Portfolio
1. Click **⚙️** (Settings) in header
2. Fill customer name, industry, description
3. Click **Create**

### Switch Portfolio
- Use **dropdown** in header
- OR click **Activate** in Portfolio Manager

### Export to Excel
1. Click **Export Excel** (green button, Inventory tab)
2. Select data types (Applications ✓, Capabilities, AI Agents)
3. Click **Export to Excel**

### Backup Portfolio
- Open Portfolio Manager → Click **JSON** button
- File downloads: `CustomerName_YYYY-MM-DD.json`

### Delete Portfolio
1. Open Portfolio Manager
2. Click **Delete** (red button) on portfolio card
3. Confirm deletion
⚠️ Must switch away from active portfolio first

---

## 📊 Excel Export Contents

### Always Included: Summary Sheet
- Customer name, industry
- Export date
- Total counts (apps, capabilities, agents)
- Total annual cost

### Optional Sheets (Select in modal):
- **Applications**: Full inventory (20+ columns)
- **Capabilities**: APQC framework hierarchy
- **AI Agents**: Automation inventory

---

## 🔑 Key Features

| Feature | Location | Icon |
|---------|----------|------|
| Portfolio Selector | Header (top-right) | 💼 Dropdown |
| Portfolio Manager | Header | ⚙️ Settings |
| Export Excel | Inventory Tab | 📊 Green Button |
| Create Portfolio | Portfolio Manager | ➕ Green Box |
| Switch Portfolio | Portfolio Manager | ✅ Activate |
| Export JSON | Portfolio Manager | 💾 JSON |
| Delete Portfolio | Portfolio Manager | 🗑️ Delete |

---

## 💾 Data Storage

- **Location**: Browser localStorage (5-10 MB)
- **Capacity**: ~25-100 portfolios
- **Persistence**: Per browser/device
- **Backup**: Export JSON regularly
- **Sharing**: Export → Send file → Import

---

## ⚠️ Important Notes

- ✅ All changes auto-save
- ✅ Switch portfolios instantly
- ✅ No data loss on switch
- ⚠️ No cloud sync (use JSON export to share)
- ⚠️ Private/incognito mode won't persist
- ⚠️ Cannot delete active portfolio (switch first)

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Portfolio missing | Refresh page (F5) |
| Not saving | Check incognito mode, enable localStorage |
| Excel fails | Check console, disable popup blocker |
| Switch not working | Hard refresh (Ctrl+F5) |

---

## 📁 File Naming

### Excel Export
`CustomerName_Portfolio_YYYY-MM-DD.xlsx`

### JSON Export
`CustomerName_YYYY-MM-DD.json`

### Bulk Export
`all_portfolios_YYYY-MM-DD.json`

---

**Quick Start:** Click ⚙️ → Create Portfolio → Add data → Export Excel
