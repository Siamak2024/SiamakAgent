# Multi-Portfolio Management - Visual Guide

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Application Portfolio Management - Header                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [≡] Application Portfolio Management                                   │
│      Application Inventory • Lifecycle • Portfolio Rationalization      │
│                                                                          │
│                    [💼 Acme Corp (47 apps) ▼] [⚙️] [⊞] [🏠] [🤖]        │
│                          ↑                      ↑                        │
│                   Portfolio Selector     Settings Icon                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Portfolio Manager Modal Layout

```
╔═══════════════════════════════════════════════════════════════════╗
║  💼 Portfolio Manager                                        [✕]  ║
║  Manage application portfolios for different customer accounts   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ➕ Create New Portfolio                                     │ ║
║  ├─────────────────────────────────────────────────────────────┤ ║
║  │ Customer Name*  │ Industry ▼  │ Description       │ CREATE │ ║
║  │ [___________]   │ [Property]  │ [______________]  │   ▶   │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  Existing Portfolios (3)            [🔄 Refresh] [📥 Export All] ║
║                                                                   ║
║  ┌──────────────────┬──────────────────┬──────────────────────┐ ║
║  │ ✅ ACTIVE        │                  │                      │ ║
║  │ Acme Corp        │ Tech Solutions   │ Bank Holdings        │ ║
║  │ 🏭 Manufacturing │ 💻 Technology    │ 🏦 Financial Services│ ║
║  │                  │                  │                      │ ║
║  │ 47 Apps   23 Cap │ 32 Apps   18 Cap │ 89 Apps   45 Cap    │ ║
║  │ 8 Agents         │ 5 Agents         │ 12 Agents           │ ║
║  │ 12.5M SEK/yr     │ 8.3M SEK/yr      │ 45.2M SEK/yr        │ ║
║  │                  │                  │                      │ ║
║  │        [✓]       │   [✓ Activate]   │   [✓ Activate]      │ ║
║  │ [📊 Excel]       │   [📊 Excel]     │   [📊 Excel]        │ ║
║  │ [💾 JSON]        │   [💾 JSON]      │   [💾 JSON]         │ ║
║  │                  │   [🗑️ Delete]    │   [🗑️ Delete]       │ ║
║  └──────────────────┴──────────────────┴──────────────────────┘ ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                              [Close]              ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Export Excel Modal Layout

```
╔═══════════════════════════════════════════════════╗
║  📊 Export to Excel                          [✕] ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  Select what to export:                           ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ ☑ Application Inventory                     │ ║
║  │   All applications with complete details    │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ ☐ Capabilities                              │ ║
║  │   Business capability framework             │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ ☐ AI Agents                                 │ ║
║  │   AI/automation agent inventory             │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  ⚠️ Note: Excel export includes all selected     ║
║     data tabs. You can re-import the file to     ║
║     restore the portfolio.                       ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║                [Cancel]  [📊 Export to Excel]    ║
╚═══════════════════════════════════════════════════╝
```

## Portfolio Card States

### Active Portfolio (Orange)
```
┌──────────────────────────────────────┐
│ ✅ ACTIVE                            │
│ ╔══════════════════════════════════╗ │
│ ║ Acme Corporation                 ║ │
│ ║ 🏭 Manufacturing • Full analysis ║ │
│ ║ Created: 2026-01-15              ║ │
│ ║ Modified: 2026-05-17             ║ │
│ ╠══════════════════════════════════╣ │
│ ║  47      │  23     │  8    │12.5M║ │
│ ║  Apps    │  Caps   │ Agents│Cost ║ │
│ ╠══════════════════════════════════╣ │
│ ║        Currently Active          ║ │
│ ║ [📊 Excel] [💾 JSON]             ║ │
│ ╚══════════════════════════════════╝ │
└──────────────────────────────────────┘
```

### Inactive Portfolio (White)
```
┌──────────────────────────────────────┐
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Tech Solutions Inc.            │  │
│ │ 💻 Technology • Q1 2026        │  │
│ │ Created: 2026-03-01            │  │
│ │ Modified: 2026-04-22           │  │
│ ├────────────────────────────────┤  │
│ │  32    │  18    │  5    │ 8.3M │  │
│ │  Apps  │  Caps  │Agents │Cost  │  │
│ ├────────────────────────────────┤  │
│ │ [✓ Activate] [📊 Excel]        │  │
│ │ [💾 JSON]    [🗑️ Delete]       │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Workflow Diagram

```
                        User Actions
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
  [Create New]         [Switch To]          [Export]
   Portfolio            Portfolio            Portfolio
        │                    │                    │
        ▼                    ▼                    ▼
  ┌──────────┐        ┌──────────┐        ┌──────────┐
  │ Enter    │        │ Select   │        │ Choose   │
  │ Customer │        │ from     │        │ Format   │
  │ Details  │        │ Dropdown │        │ & Sheets │
  └─────┬────┘        └─────┬────┘        └─────┬────┘
        │                    │                    │
        ▼                    ▼                    │
  ┌──────────┐        ┌──────────┐               │
  │ Generate │        │ Load     │               │
  │ Portfolio│        │ Portfolio│               │
  │ ID       │        │ Data     │               │
  └─────┬────┘        └─────┬────┘               │
        │                    │                    │
        ▼                    ▼                    │
  ┌──────────┐        ┌──────────┐               │
  │ Save to  │        │ Update   │               │
  │ Local    │        │ All      │               │
  │ Storage  │        │ Views    │               │
  └─────┬────┘        └─────┬────┘               │
        │                    │                    │
        └────────┬───────────┘                    │
                 ▼                                │
          [Portfolio Active]                     │
                 │                                │
                 ▼                                │
          ┌─────────────┐                        │
          │ Add/Edit    │                        │
          │ Applications│                        │
          │ Capabilities│                        │
          │ AI Agents   │                        │
          └──────┬──────┘                        │
                 │                                │
                 ▼                                │
          [Auto-Save to                          │
           Active Portfolio]                     │
                 │                                │
                 │     ┌──────────────────────────┘
                 │     │
                 ▼     ▼
           ┌──────────────────┐
           │ Generate File    │
           │ Excel or JSON    │
           └────────┬─────────┘
                    │
                    ▼
             [Download File]
```

## Excel Export Structure

```
📊 Acme_Corporation_Portfolio_2026-05-17.xlsx
│
├─ 📄 Summary
│  ├─ Customer Name: Acme Corporation
│  ├─ Industry: Manufacturing
│  ├─ Export Date: 2026-05-17
│  ├─ Total Applications: 47
│  ├─ Total Capabilities: 23
│  ├─ Total AI Agents: 8
│  └─ Total Annual Cost: 12,500,000 SEK
│
├─ 📄 Applications
│  ├─ Application Name
│  ├─ Description
│  ├─ Department
│  ├─ Owner
│  ├─ Vendor
│  ├─ Technology Stack
│  ├─ Currency
│  ├─ CAPEX (Annual)
│  ├─ OPEX (Annual)
│  ├─ Total Cost (Annual)
│  ├─ User Count
│  ├─ Lifecycle
│  ├─ Rationalization Action
│  ├─ Technical Fit Score
│  ├─ Business Value Score
│  ├─ AI Maturity
│  ├─ AI Potential
│  ├─ Business Capabilities
│  ├─ Modern Stack Alternative
│  └─ Notes
│
├─ 📄 Capabilities (Optional)
│  ├─ Capability Name
│  ├─ Level (L1/L2/L3)
│  ├─ Domain
│  ├─ Industry Tag
│  ├─ Strategic Importance
│  ├─ Maturity
│  ├─ AI Potential
│  ├─ Linked Applications
│  ├─ Description
│  └─ APQC Code
│
└─ 📄 AI Agents (Optional)
   ├─ Agent Name
   ├─ Type
   ├─ Description
   ├─ Maturity Level
   ├─ TO-BE (Yes/No)
   ├─ Linked Capabilities
   └─ Linked Applications
```

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│  ┌──────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │Portfolio │→ │Settings│→ │  Home  │  │  Chat  │         │
│  │Dropdown  │  │  ⚙️    │  │   🏠   │  │  🤖   │         │
│  └──────────┘  └────────┘  └────────┘  └────────┘         │
│       │            │                                        │
│       │            └─────────────┐                         │
│       ▼                           ▼                         │
│  ┌─────────┐           ┌──────────────────┐               │
│  │ Switch  │           │ Portfolio Manager│               │
│  │Portfolio│           │                  │               │
│  └─────────┘           │ • Create         │               │
│       │                │ • View All       │               │
│       │                │ • Export         │               │
│       │                │ • Delete         │               │
│       │                └──────────────────┘               │
│       ▼                                                    │
├─────────────────────────────────────────────────────────────┤
│ Tabs                                                        │
│ ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐│
│ │Capab ││AI    ││Invent││Lifecy││Owner ││Fit   ││Ration││
│ │ility ││Agent ││ory   ││cle   ││ship  ││Matrix││aliza ││
│ └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘│
│                    ▲                                       │
│                    │                                       │
│                    └───[Export Excel] button               │
│                                                            │
├─────────────────────────────────────────────────────────────┤
│ Content Area                                               │
│  • All data specific to selected portfolio                │
│  • Auto-saved on every change                             │
│  • Statistics updated in real-time                        │
└─────────────────────────────────────────────────────────────┘
```

## Color Coding

```
🟢 Active Portfolio:    Orange gradient (#ea580c)
⚪ Inactive Portfolio:  White background
🔵 Action Buttons:      Blue (#3b82f6)
🟢 Success Actions:     Green (#16a34a)
🟡 Warning Actions:     Yellow (#fbbf24)
🔴 Delete Actions:      Red (#dc2626)
⚫ Icons:               Various colors per context
```

## Button Icons Reference

```
📊 Excel Export
💾 JSON Export
🔄 Refresh
➕ Create/Add
✓ Activate/Confirm
⚙️ Settings/Manage
🗑️ Delete
🏠 Home
🤖 AI Chat
💼 Portfolio Selector
📥 Download All
🏭 Manufacturing Icon
💻 Technology Icon
🏦 Financial Services Icon
```

## Keyboard Shortcuts

```
Ctrl + K        → Toggle AI Chat Sidebar
Enter (Chat)    → Send Chat Message
Escape          → Close Active Modal
```

## Status Indicators

```
✅ ACTIVE       → Currently selected portfolio (orange badge)
🟢 Ready        → Portfolio loaded and operational
⚠️ Warning      → Action requires confirmation
❌ Error        → Operation failed
📈 Stats        → Real-time statistics updated
💾 Saved        → Auto-saved successfully
```

---

## Usage Example Flow

```
1. User opens Application Portfolio Management
   ↓
2. System initializes portfolio system
   ↓
3. Loads default portfolio or creates new one
   ↓
4. User clicks ⚙️ Settings icon
   ↓
5. Portfolio Manager modal opens
   ↓
6. User fills "Create New Portfolio" form:
   - Customer Name: "Nordic Bank"
   - Industry: "Financial Services"
   - Description: "Q2 2026 digital transformation"
   ↓
7. Clicks "Create" button
   ↓
8. Portfolio created with unique ID
   ↓
9. Portfolio card appears in grid with 0 apps
   ↓
10. User clicks "Activate" on new portfolio
    ↓
11. System switches to Nordic Bank portfolio
    ↓
12. User navigates to Inventory tab
    ↓
13. Adds applications via "Import Apps" or "Add Application"
    ↓
14. Data auto-saves to Nordic Bank portfolio
    ↓
15. User clicks "Export Excel" button
    ↓
16. Export modal opens
    ↓
17. User selects: ☑ Applications, ☑ Capabilities
    ↓
18. Clicks "Export to Excel"
    ↓
19. File downloads: Nordic_Bank_Portfolio_2026-05-17.xlsx
    ↓
20. User can switch back to other portfolios anytime
```

---

**Visual Guide Version:** 1.0  
**Last Updated:** May 17, 2026
