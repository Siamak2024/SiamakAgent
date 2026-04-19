# EA Engagement Playbook - Multi-Engagement Management Guide

## Overview

The EA Engagement Playbook now supports managing multiple engagements simultaneously with full save/restore capabilities. Each engagement is stored independently in localStorage with auto-save and quick switching.

## Features

### 1. Engagement Selector (Header)
- **Location**: Top-right of header, left of action buttons
- **Display**: Shows current engagement name or "No engagement"
- **Click**: Opens engagement manager modal

### 2. New Engagement Button
- **Icon**: Plus (+) icon
- **Action**: Opens "Create New Engagement" modal
- **Keyboard**: No shortcut (use modal)

### 3. Engagement Manager Modal
- **Access**: Click engagement selector dropdown
- **Features**:
  - List all saved engagements
  - Show completeness % with traffic light colors
  - Display last updated date
  - Switch between engagements (click row)
  - Delete non-active engagements
  - Refresh list
  - Create new engagement

### 4. Auto-Save Functionality
- **On Tab Switch**: Automatically saves current engagement
- **On Engagement Switch**: Saves before loading new one
- **Manual Save**: "Save" button in Canvas 1 or Ctrl+S

## Engagement Data Storage

### Storage Pattern
```
localStorage keys:
- ea_engagement_model_{ID}       - Full engagement data
- ea_engagement_current           - Current engagement ID
- ea_engagement_segment_templates - Segment templates
```

### Data Structure (14 Entities)
Each engagement stores:
- Engagement metadata (ID, name, segment, theme, dates)
- Customers
- Phases (E0-E5)
- Stories
- Stakeholders
- Applications
- Capabilities
- Risks
- Constraints
- Decisions
- Assumptions
- Initiatives
- Roadmap Items
- Architecture Views
- Artifacts

## Usage Workflows

### Creating First Engagement
1. Open EA_Engagement_Playbook.html
2. System prompts: "No active engagement found. Create a new engagement?"
3. Click "OK" → Opens "New Engagement" modal
4. Fill in:
   - **ID**: SEG-XXX-YYYYQQ-NNN (e.g., SEG-INS-2026Q2-001)
   - **Name**: e.g., "Insurance Portfolio Modernization"
   - **Segment**: Insurance/Banking/Manufacturing/Retail/Custom
   - **Theme**: e.g., "Application sunsetting & modernization"
5. Click "Create Engagement"
6. Engagement is now active and ready for data entry

### Creating Additional Engagements
1. Click **+** button in header
2. Fill in new engagement form
3. Click "Create Engagement"
4. New engagement becomes active immediately
5. Previous engagement is auto-saved

### Switching Between Engagements
1. Click engagement selector in header
2. Engagement Manager modal opens with list
3. Click desired engagement row
4. Current engagement auto-saves
5. New engagement loads
6. Toast notification confirms switch

### Deleting an Engagement
1. Open Engagement Manager (click selector)
2. Find engagement to delete (must not be active)
3. Click trash icon
4. Confirm deletion
5. Engagement permanently removed from localStorage

### Viewing Engagement List
Each list item shows:
- **Name**: Engagement full name
- **Segment**: Industry segment icon
- **Completeness**: % with color (red <40%, yellow 40-75%, green 75%+)
- **Last Updated**: Date last modified
- **Status**: "ACTIVE" badge or Delete button

## Completeness Calculation

Completeness is calculated automatically based on:
- **Engagement Setup (20%)**: ID, name, segment, theme, dates, forum, criteria
- **Stakeholders (15%)**: At least 3 stakeholders with influence/decision power
- **Applications (15%)**: At least 5 applications with lifecycle status
- **Capabilities (15%)**: At least 8 capabilities with maturity scores
- **Initiatives (15%)**: At least 3 initiatives with business outcomes
- **Architecture (10%)**: At least 1 architecture view with principles
- **Artifacts (10%)**: At least 2 artifacts generated

### Traffic Light Thresholds
- 🟢 **Green (75-100%)**: High completeness - ready for outputs
- 🟡 **Yellow (40-74%)**: Medium completeness - work in progress
- 🔴 **Red (0-39%)**: Low completeness - just started

## Auto-Load Behavior

On page load, the system:
1. Checks for `ea_engagement_current` in localStorage
2. If found, loads that engagement
3. If not found, loads most recently updated engagement
4. If no engagements exist, prompts to create one
5. Updates engagement selector in header
6. Populates all canvas forms with data
7. Refreshes KPI dashboard

## Best Practices

### Naming Conventions
- **ID Format**: SEG-{SEGMENT}-{YEAR}Q{QUARTER}-{NUMBER}
  - SEG = Segment prefix (3 letters)
  - SEGMENT = Industry (INS, BNK, MFG, RTL, etc.)
  - YEAR = 4-digit year
  - QUARTER = Quarter number (1-4)
  - NUMBER = Sequential 3-digit number (001-999)
- **Name**: Descriptive, client-friendly (30-60 chars)
- **Theme**: Focus area or initiative (20-40 chars)

### Engagement Organization
- Create separate engagements for:
  - Different customers
  - Different business units within same customer
  - Different time periods (phases/years)
  - Different strategic themes
- Archive completed engagements (use Archive feature in future)

### Data Entry Workflow
1. **Canvas 1**: Complete engagement setup first
2. **Canvas 2**: Add key stakeholders and their priorities
3. **Canvas 3**: Import or add AS-IS applications
4. **Canvas 4**: Define capabilities and gap analysis
5. **Canvas 5**: Document target architecture principles
6. **Canvas 6**: Create roadmap with initiatives
7. **Canvas 7**: Review leadership dashboard
8. **Generate Outputs**: Export to markdown templates

### Backup & Export
- **Manual Export**: Use "Export JSON" button in header
- **Import**: Use "Import from APM Toolkit" for AS-IS portfolio
- **Backup**: Browser localStorage is persistent but not backed up
  - Recommendation: Export JSON weekly for large engagements
  - Store in version control or SharePoint

## Keyboard Shortcuts

- **Ctrl+K**: Toggle AI Assistant panel
- **Ctrl+S**: Save current engagement (if implemented)
- **Esc**: Close any modal

## Technical Details

### Files Modified
- `EA_Engagement_Playbook.html`: Added engagement selector UI, modals
- `ea_engagement_ui.js`: NEW - All engagement management functions
- `EA_EngagementManager.js`: Already had CRUD operations
- `engagement_schema.js`: Validation rules for engagement ID

### Functions Added
```javascript
// Modal Management
openEngagementManager()
closeEngagementManager()
refreshEngagementList()
openNewEngagementModal()
closeNewEngagementModal()

// Engagement Operations
switchEngagement(engagementId)
deleteEngagement(engagementId)
createNewEngagementFromModal()
updateEngagementSelector()
loadEngagementData()
autoLoadLatestEngagement()
```

### CSS Classes Added
```css
.engagement-selector
.engagement-selector-label
.engagement-selector-current
.engagement-list
.engagement-list-item
.engagement-list-item.active
.engagement-item-info
.engagement-item-name
.engagement-item-meta
.engagement-item-actions
```

## Troubleshooting

### Issue: "No engagement" shows in selector
**Solution**: Click selector → Click "New Engagement" → Fill form → Create

### Issue: Engagement list shows empty
**Solution**: Click "New Engagement" button → Create first engagement

### Issue: Changes not saving
**Solution**: 
1. Check browser console for errors
2. Verify localStorage is not full (5-10 MB limit)
3. Click "Save" button manually
4. Switch tabs to trigger auto-save

### Issue: Cannot delete active engagement
**Solution**: Switch to different engagement first, then delete

### Issue: Engagement data lost
**Solution**: 
1. Check browser history/cache
2. Restore from JSON export if available
3. localStorage is browser-specific - check correct browser

### Issue: Completeness stuck at 0%
**Solution**: 
1. Fill in Canvas 1 mandatory fields
2. Add at least 3 stakeholders in Canvas 2
3. Click Save or switch tabs to recalculate

## Future Enhancements

### Planned Features
- [ ] Export individual engagement to JSON file
- [ ] Import engagement from JSON file
- [ ] Archive/unarchive engagements
- [ ] Duplicate engagement (template)
- [ ] Search/filter engagements
- [ ] Sort engagements by name/date/completeness
- [ ] Cloud sync (Azure Blob Storage)
- [ ] Team collaboration (multi-user editing)
- [ ] Version history (audit trail)
- [ ] Engagement templates by segment

### API Integration (Future)
```javascript
// REST API endpoints (planned)
GET    /api/engagements           - List all engagements
GET    /api/engagements/{id}      - Get engagement by ID
POST   /api/engagements           - Create new engagement
PUT    /api/engagements/{id}      - Update engagement
DELETE /api/engagements/{id}      - Delete engagement
POST   /api/engagements/{id}/clone - Duplicate engagement
```

---

**Version**: 1.0  
**Date**: April 17, 2026  
**Status**: Production Ready ✅
