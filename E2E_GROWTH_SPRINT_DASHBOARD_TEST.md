# E2E Test Scenario: Growth Sprint Dashboard
**Test Date**: April 21, 2026  
**Tester**: Siamak Khodayari  
**Environment**: Azure Static Web App (white-cliff-010e13b10.2.azurestaticapps.net)  
**Objective**: Validate complete functionality of Growth Sprint Dashboard including AI Assistant integration

---

## 📋 TEST OVERVIEW

### Scope
This E2E test validates the **Growth Sprint Dashboard** as the central hub for managing multiple accounts, opportunities, and portfolio analytics with integrated AI assistance.

### Key Features to Test
1. ✅ **Dashboard Entry Points** (Account, Opportunity, Growth views)
2. ✅ **Portfolio Metrics & Analytics** (Charts, KPIs, pipeline visualization)
3. ✅ **Account Management** (CRUD operations, navigation)
4. ✅ **Opportunity Pipeline** (Kanban board, status tracking)
5. ✅ **AI Assistant Integration** (Responses API, markdown rendering, context awareness)
6. ✅ **Design Consistency** (NexGen EA Platform styling, ea-design-engine.css)
7. ✅ **Cross-Navigation** (Links between dashboards, deep linking)
8. ✅ **Data Persistence** (localStorage, backup/restore)

---

## 🎯 PRE-TEST SETUP

### 1. Server Status
- [ ] Verify Node.js server running on localhost:3000
- [ ] Confirm OPENAI_API_KEY environment variable set
- [ ] Check server.js POST /api/openai/chat endpoint active

**Command**:
```powershell
# Start server if not running
node server.js
```

**Expected**: Server listens on port 3000, logs "Server running on http://localhost:3000"

---

### 2. Browser Setup
- [ ] Clear browser cache and localStorage
- [ ] Open Developer Console (F12)
- [ ] Enable Network tab to monitor API calls
- [ ] Navigate to: http://localhost:3000/NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html

**Expected**: 
- Dashboard loads without errors
- Console shows: `✅ EA_UnifiedAIAssistant initialized with context: growth_dashboard`
- Network shows successful loading of CSS, JS resources

---

### 3. Demo Data Loading
- [ ] Click "Demo Scenarios" button (if available)
- [ ] Load sample accounts and opportunities

**Alternative**: Create test data manually:
1. Click "New Account" → Create "Test Corp" (Banking, Nordic, Enterprise)
2. Click "New Opportunity" → Create "Cloud Transformation" ($250K, Qualification stage)
3. Create 2-3 more accounts and opportunities for realistic testing

---

## 🧪 TEST SCENARIOS

---

## SCENARIO 1: Dashboard Overview & Entry Points
**Objective**: Verify main dashboard displays correct portfolio metrics and navigation works

### Test Steps:

#### 1.1 Entry Card Metrics
- [ ] Verify 3 entry cards displayed in grid layout:
  - **Account Management** (green border, user-friends icon)
  - **Opportunity Pipeline** (purple border, funnel icon)
  - **Growth Analytics** (blue border, chart-line icon)
- [ ] Each card shows correct metric count:
  - Accounts count matches actual accounts
  - Opportunities count matches total opportunities
  - Pipeline value calculated correctly (sum of weighted opportunities)

**Expected**: Grid layout with centered cards, hover effects work, metrics dynamically update

---

#### 1.2 Navigation from Entry Cards
- [ ] Click "Account Management" card
  - **Expected**: Navigate to Account List view (same page, different section)
  - **Verify**: URL parameter or scroll to accounts table
- [ ] Click "Opportunity Pipeline" card
  - **Expected**: Navigate to EA_Opportunity_Pipeline.html
  - **Verify**: Kanban board loads, opportunities displayed in correct stages
- [ ] Use browser back button to return to Growth Dashboard
  - **Expected**: Dashboard state preserved

---

#### 1.3 Portfolio Metrics Cards
Verify 4 metric cards below entry points:

1. **Total Accounts**
   - [ ] Count matches Account Manager data
   - [ ] Trend indicator (↑/↓) shows change vs previous period
   - [ ] Icon: user-friends (green background)

2. **Active Opportunities**
   - [ ] Count excludes Close-Won and Close-Lost
   - [ ] Shows only Discovery, Qualification, Proposal, Negotiation stages
   - [ ] Icon: bullseye (blue background)

3. **Total Pipeline Value**
   - [ ] Sum of all active opportunity values
   - [ ] Formatted as currency ($X.XM)
   - [ ] Trend percentage displayed
   - [ ] Icon: dollar-sign (purple background)

4. **Win Rate**
   - [ ] Calculation: (Close-Won / (Close-Won + Close-Lost)) * 100
   - [ ] Percentage with 1 decimal place
   - [ ] Icon: trophy (orange background)

**Expected**: All metrics update in real-time when opportunities/accounts change

---

## SCENARIO 2: Account Management
**Objective**: Validate account CRUD operations and detail navigation

### Test Steps:

#### 2.1 Create New Account
- [ ] Click "+ New Account" button
- [ ] Fill modal form:
  - **Name**: "Nordic Insurance AB"
  - **Industry**: Insurance
  - **Region**: Nordic
  - **Size**: Enterprise
  - **Account Manager**: Test User
  - **Status**: Active
- [ ] Click "Save"

**Expected**:
- Modal closes
- Account appears in accounts table
- Dashboard metrics update (+1 account)
- Success notification displayed

---

#### 2.2 View Account Dashboard
- [ ] Click account name "Nordic Insurance AB" in table
- [ ] Should navigate to EA_Account_Dashboard.html?accountId=<id>

**Verify**:
- [ ] Account name in header matches
- [ ] Industry, region, size displayed correctly
- [ ] Opportunity count for this account shown
- [ ] Account-specific metrics calculated
- [ ] AI Assistant context shows "account_dashboard"

---

#### 2.3 Edit Account
- [ ] From accounts table, click Edit icon (pencil)
- [ ] Change Status to "Strategic"
- [ ] Add notes: "Key account for Q2 expansion"
- [ ] Click "Save"

**Expected**:
- Account updated in table
- Status badge color changes
- Notes saved (visible in account detail view)

---

#### 2.4 Delete Account
- [ ] Click Delete icon (trash) on a test account
- [ ] Confirm deletion in alert dialog

**Expected**:
- Account removed from table
- Dashboard metrics update (-1 account)
- Associated opportunities remain but show "Account Deleted" or reassign to null

---

## SCENARIO 3: Opportunity Management
**Objective**: Test opportunity pipeline and Kanban board functionality

### Test Steps:

#### 3.1 Create New Opportunity
- [ ] Click "+ New Opportunity" button
- [ ] Fill form:
  - **Title**: "APM Implementation"
  - **Account**: Nordic Insurance AB
  - **Value**: $125,000
  - **Probability**: 60%
  - **Expected Close**: +60 days from today
  - **Stage**: Qualification
  - **Owner**: Test User
  - **Description**: "Application Portfolio Management toolkit implementation"
- [ ] Click "Save"

**Expected**:
- Opportunity appears in opportunities table
- Weighted value calculated: $75,000 (60% of $125K)
- Pipeline metrics update

---

#### 3.2 Navigate to Kanban Board
- [ ] Click "Opportunity Pipeline" entry card or menu item
- [ ] Navigate to EA_Opportunity_Pipeline.html

**Verify**:
- [ ] Kanban columns: Discovery, Qualification, Proposal, Negotiation, Close-Won, Close-Lost
- [ ] "APM Implementation" appears in **Qualification** column
- [ ] Card shows: Title, Account name, Value, Probability, Expected close date
- [ ] Drag-and-drop handles visible

---

#### 3.3 Move Opportunity Through Pipeline
- [ ] Drag "APM Implementation" from Qualification to Proposal column
- [ ] Drop card in new column

**Expected**:
- Card moves to Proposal column
- Stage updated in database (localStorage)
- Dashboard metrics recalculate if weighted value changes
- Timeline/audit log updated (if implemented)

---

#### 3.4 Update Opportunity Probability
- [ ] Click on opportunity card to open detail modal
- [ ] Change Probability from 60% to 75%
- [ ] Update Expected Close date to +45 days
- [ ] Click "Save"

**Expected**:
- Weighted value recalculated: $93,750 (75% of $125K)
- Total pipeline value metric updates
- Card displays updated probability

---

## SCENARIO 4: AI Assistant Integration (CRITICAL)
**Objective**: Validate AI Assistant works correctly with Responses API format and matches NexGen EA design

### Test Steps:

#### 4.1 Open AI Assistant
- [ ] Click AI Assistant toggle button (robot icon, top-right corner)
- [ ] Verify panel slides in from right side

**Expected**:
- [ ] Panel width: 360px default
- [ ] Dark theme (#1a1a1a background, #e0e0e0 text)
- [ ] Header: "Growth Sprint AI" with robot icon
- [ ] Three control buttons: + (new chat), ↺ (clear history), × (close)
- [ ] Welcome message displayed:
  - Lightbulb icon
  - "Growth Sprint AI Assistant" title
  - Description paragraph
- [ ] 4 Quick Action buttons visible:
  - "Which accounts should I prioritize?"
  - "Analyze portfolio-wide service gaps"
  - "Suggest strategies to improve win rates"
  - "Identify high-value expansion opportunities"
- [ ] Input textarea at bottom with placeholder text
- [ ] Send button (paper plane icon) on right

---

#### 4.2 Test Quick Action Prompt
- [ ] Click first quick action: "Which accounts should I prioritize?"

**Expected**:
- [ ] Welcome message and quick actions disappear
- [ ] Prompt text appears in input field
- [ ] Message automatically sent to AI
- [ ] User message bubble appears (left-aligned, user icon, dark background)
- [ ] Send button shows loading spinner
- [ ] After 2-5 seconds, AI response appears (right-aligned, robot icon, light background)

**Verify API Call** (in Network tab):
- [ ] POST request to http://localhost:3000/api/openai/chat
- [ ] Request payload format:
  ```json
  {
    "model": "gpt-5",
    "input": "User: Which accounts should I prioritize this quarter?",
    "instructions": "You are an expert Enterprise Architecture consultant...[full system prompt]",
    "temperature": 0.7,
    "timeout": 45000,
    "reasoning": {"summary": "auto", "effort": "medium"}
  }
  ```
- [ ] Response status: 200 OK
- [ ] Response contains `output_text` field

**Check Console for Errors**:
- [ ] **MUST NOT see**: "Missing required parameter: 'messages[0].content[0].type'"
- [ ] **MUST NOT see**: "Error: Unknown parameter: 'reasoning'"
- [ ] **SHOULD see**: Context refresh logs, API call success

---

#### 4.3 Test Manual Message Input
- [ ] Type in input: "What are the key risks in my current pipeline?"
- [ ] Press Enter (or click Send button)

**Expected**:
- [ ] Message sent without Shift+Enter (new line only on Shift+Enter)
- [ ] User message appears immediately
- [ ] AI response follows after processing
- [ ] Response uses enhanced markdown rendering:
  - **Bold text** (wrapped in `<strong>`)
  - *Italic text* (wrapped in `<em>`)
  - Headers (H1-H6 with proper styling)
  - Bullet lists (wrapped in `<ul><li>`)
  - Numbered lists (wrapped in `<ol><li>`)
  - Code blocks (wrapped in `<pre><code>` with syntax highlighting)
  - Tables (proper `<table>` with headers and alternating row colors)
  - Blockquotes (left border accent)
  - Links (clickable, open in new tab)

---

#### 4.4 Test Conversation History
- [ ] Send 3-4 follow-up messages:
  1. "Focus on the Nordic region"
  2. "What about opportunities in the Insurance sector?"
  3. "Compare Nordic Insurance AB with other accounts"

**Expected**:
- [ ] All messages remain in chat window (scrollable)
- [ ] Conversation context maintained (AI references previous messages)
- [ ] Scroll automatically to latest message
- [ ] History limited to last 20 messages (10 exchanges)

---

#### 4.5 Test Chat Panel Resize
- [ ] Hover over left edge of AI panel
- [ ] Cursor changes to resize icon (↔)
- [ ] Drag left to widen panel
- [ ] Drag right to narrow panel

**Expected**:
- [ ] Panel width: 240px (min) to 700px (max)
- [ ] Main content area adjusts margin to accommodate panel
- [ ] Resize handle shows subtle blue highlight on hover
- [ ] Resizing smooth (no transition during drag)

---

#### 4.6 Test Clear History
- [ ] Click ↺ (clear history) button in header
- [ ] Confirm action if prompted

**Expected**:
- [ ] All messages cleared from chat window
- [ ] Welcome message reappears
- [ ] Quick action buttons reappear
- [ ] Conversation context reset (next message starts fresh)

---

#### 4.7 Test New Conversation
- [ ] Click + (new chat) button in header

**Expected**:
- [ ] Same behavior as Clear History
- [ ] Console log: "Started new conversation"

---

#### 4.8 Close and Reopen Panel
- [ ] Click × (close) button
- [ ] Verify panel slides out to right (off-screen)
- [ ] Click AI Assistant toggle again to reopen
- [ ] Verify conversation history preserved

**Expected**:
- [ ] Panel closes with smooth animation
- [ ] Main content expands to full width
- [ ] Reopening shows previous conversation (unless cleared)

---

## SCENARIO 5: Design Consistency Validation
**Objective**: Ensure Growth Dashboard matches NexGen EA Platform design exactly

### Test Steps:

#### 5.1 CSS Stylesheet Verification
- [ ] Open Developer Tools → Sources tab
- [ ] Verify stylesheets loaded:
  - `ea-nordic-theme.css` ✅
  - `ea-design-engine.css` ✅ (CRITICAL - was missing before fix)
  - Font Awesome CDN ✅

**Check Network tab**:
- [ ] All CSS files load with 200 status
- [ ] No 404 errors for stylesheets
- [ ] Total CSS load time < 500ms

---

#### 5.2 AI Panel HTML Structure
- [ ] Inspect `<div id="ai-chat-panel">` in Elements tab

**Verify structure**:
```html
<div id="ai-chat-panel" class="hidden">
  <div id="chat-resize-handle"></div>
  <div id="chat-header">
    <div id="chat-header-title">...</div>
    <div id="chat-controls">
      <button id="new-chat">...</button>
      <button id="clear-chat">...</button>
      <button id="close-chat">...</button>
    </div>
  </div>
  <div id="chat-welcome" class="chat-welcome-message">...</div>
  <div id="chat-quick-actions" class="chat-quick-actions">...</div>
  <div id="chat-messages"></div>
  <div id="chat-input-container">
    <textarea id="chat-input"></textarea>
    <button id="send-chat">...</button>
  </div>
</div>
```

**Compare with EA_Engagement_Playbook.html**:
- [ ] Structure matches exactly ✅
- [ ] Same ID naming convention ✅
- [ ] Same class names ✅
- [ ] Welcome message format identical ✅
- [ ] Quick action buttons have icons ✅

---

#### 5.3 Visual Design Check
- [ ] AI panel background: #1a1a1a (very dark gray, VS Code style)
- [ ] Text color: #e0e0e0 (light gray)
- [ ] Header background: #2d2d2d (slightly lighter than panel)
- [ ] Accent color: #0066cc (blue for links, active states)
- [ ] User message bubble: #0066cc background, white text
- [ ] Assistant message bubble: #2d2d2d background, #e0e0e0 text
- [ ] Code blocks: #4fc3f7 (cyan) for inline code, #81c995 (green) for keywords
- [ ] Table styling: #262626 background, #404040 borders, alternating row colors

**Compare with**:
- WhiteSpot_Standalone.html ✅
- EA_Engagement_Playbook.html ✅
- EA_Account_Dashboard.html ✅

**All must match exactly**

---

#### 5.4 Responsive Layout
- [ ] Resize browser window to different widths:
  - 1920px (Full HD) ✅
  - 1366px (Laptop) ✅
  - 1024px (Tablet landscape) ✅
  - 768px (Tablet portrait) ⚠️ (May need horizontal scroll)

**Expected**:
- AI panel remains fixed on right
- Main content adjusts width responsively
- Charts and cards reflow to smaller grid
- No layout breaking or overlapping elements

---

## SCENARIO 6: Cross-Navigation & Deep Linking
**Objective**: Validate navigation between different dashboards preserves context

### Test Steps:

#### 6.1 Account Dashboard → Growth Dashboard
- [ ] Navigate to EA_Account_Dashboard.html?accountId=<id>
- [ ] Click breadcrumb or "Back to Growth Dashboard" button

**Expected**:
- Returns to Growth Dashboard
- Portfolio metrics reflect current data
- No data loss

---

#### 6.2 Opportunity Pipeline → Growth Dashboard
- [ ] Navigate to EA_Opportunity_Pipeline.html
- [ ] Click "Growth Dashboard" in navigation menu

**Expected**:
- Returns to Growth Dashboard
- Opportunity metrics updated if changes made in pipeline
- Kanban state preserved

---

#### 6.3 Deep Link with Parameters
- [ ] Open URL: `EA_Growth_Dashboard.html?view=accounts&highlightAccount=<accountId>`

**Expected**:
- Dashboard loads
- Scrolls to accounts section
- Highlights specified account in table
- Parameters parsed correctly

---

## SCENARIO 7: Data Persistence & Backup
**Objective**: Verify localStorage persistence and backup/restore functionality

### Test Steps:

#### 7.1 Data Persistence After Reload
- [ ] Create 2 new accounts and 3 new opportunities
- [ ] Reload page (F5)

**Expected**:
- All accounts and opportunities still present
- Metrics recalculate correctly
- No data loss

---

#### 7.2 Export Data Backup
- [ ] Click "Backup Data" button (if available in Data Management section)
- [ ] Choose export format (JSON)

**Expected**:
- JSON file downloads: `ea-growth-backup-YYYY-MM-DD.json`
- File contains:
  - All accounts
  - All opportunities
  - Engagement data
  - User preferences
- File size reasonable (not empty)

---

#### 7.3 Import Data Restore
- [ ] Clear localStorage (or use Incognito window)
- [ ] Navigate to Growth Dashboard (should be empty)
- [ ] Click "Restore Data" button
- [ ] Select previously exported JSON file

**Expected**:
- All accounts restored
- All opportunities restored
- Metrics match pre-export state
- Success notification displayed

---

#### 7.4 LocalStorage Structure Validation
- [ ] Open Developer Tools → Application tab → Local Storage
- [ ] Check for keys:
  - `ea_accounts`
  - `ea_opportunities`
  - `ea_engagements`
  - `ea_user_preferences`

**Verify**:
- Data stored as valid JSON
- Timestamps present (createdAt, updatedAt)
- No duplicate IDs
- Data structure matches schema

---

## SCENARIO 8: Error Handling & Edge Cases
**Objective**: Test system behavior under error conditions

### Test Steps:

#### 8.1 AI Assistant - Server Offline
- [ ] Stop Node.js server (Ctrl+C in server terminal)
- [ ] Send message in AI Assistant

**Expected**:
- Error message appears in chat: "I encountered an error processing your request. Please try again."
- Console error logged (connection refused or timeout)
- No crash or blank screen
- Send button re-enabled after error

---

#### 8.2 AI Assistant - API Timeout
- [ ] Server running but slow network simulation
- [ ] Send message

**Expected**:
- After 45 seconds, timeout error displayed
- User can retry message
- Conversation history not corrupted

---

#### 8.3 Invalid Data Entry
- [ ] Try to create account with missing required fields (e.g., blank Name)
- [ ] Try to save opportunity with negative value

**Expected**:
- Validation errors displayed
- Form does not submit
- Specific field highlighted in red
- Error message clear and actionable

---

#### 8.4 Concurrent Data Modification
- [ ] Open Growth Dashboard in two browser tabs
- [ ] Modify same account in Tab 1
- [ ] Modify same account in Tab 2
- [ ] Save both

**Expected**:
- Last write wins (or conflict detection if implemented)
- No data corruption
- Metrics eventually consistent after reload

---

## 📊 TEST RESULTS SUMMARY

### Pass/Fail Criteria
- **PASS**: All critical scenarios execute without errors, AI Assistant responds correctly, design matches NexGen EA
- **PARTIAL PASS**: Minor UI issues or non-critical bugs, but core functionality works
- **FAIL**: Critical errors (AI not working, data loss, crashes, design inconsistencies)

---

### Test Execution Log

| Scenario | Status | Issues Found | Severity | Notes |
|----------|--------|--------------|----------|-------|
| 1. Dashboard Overview | ⬜ PENDING | | | |
| 2. Account Management | ⬜ PENDING | | | |
| 3. Opportunity Management | ⬜ PENDING | | | |
| 4. AI Assistant Integration | ⬜ PENDING | | | **CRITICAL TEST** |
| 5. Design Consistency | ⬜ PENDING | | | |
| 6. Cross-Navigation | ⬜ PENDING | | | |
| 7. Data Persistence | ⬜ PENDING | | | |
| 8. Error Handling | ⬜ PENDING | | | |

**Update table with**:
- ✅ PASS
- ⚠️ PARTIAL PASS (with issue description)
- ❌ FAIL (with detailed error)

---

## 🔍 KNOWN ISSUES (Pre-Test)

### Issues Fixed in This Deployment:
1. ✅ **EA_UnifiedAIAssistant API Format**
   - **Issue**: Error "Missing required parameter: 'messages[0].content[0].type'"
   - **Fix**: Changed to Responses API format (string input + instructions)
   - **Commit**: 59d0e9e

2. ✅ **EA_Growth_Dashboard Design Standardization**
   - **Issue**: Missing ea-design-engine.css, inline AI panel styles, inconsistent HTML structure
   - **Fix**: Added stylesheet, removed inline CSS, matched NexGen EA structure
   - **Commit**: 59d0e9e

### Remaining Open Issues (To Monitor):
1. ⚠️ **API Timeout Handling**
   - Occasional 45-second timeouts on AI requests
   - Not blocking but impacts UX
   - Consider reducing timeout or adding retry logic

2. ⚠️ **Font Awesome Tracking Prevention**
   - Browser blocks CDN access for privacy
   - Workaround: Self-host Font Awesome icons
   - Non-critical (icons fallback to text)

---

## 🚀 POST-TEST ACTIONS

### If All Tests Pass:
- [ ] Update DEPLOYMENT_STATUS.md with test results
- [ ] Mark Growth Sprint Dashboard as "Production Ready"
- [ ] Create release notes for stakeholders
- [ ] Schedule user training session

### If Critical Failures Found:
- [ ] Document detailed error logs
- [ ] Create GitHub issues for each bug
- [ ] Prioritize fixes (P0: AI Assistant, P1: Data loss, P2: UI issues)
- [ ] Retest after fixes deployed

### Continuous Improvement:
- [ ] Gather user feedback on AI Assistant responses
- [ ] Monitor API usage and costs
- [ ] Optimize chart rendering performance
- [ ] Add E2E automated tests (Playwright/Cypress)

---

## 📝 TESTER NOTES

**Test Environment**:
- Browser: Microsoft Edge / Chrome (latest)
- OS: Windows 11
- Screen Resolution: 1920x1080
- Network: Local development (localhost:3000)

**Prerequisites**:
- Node.js v18+ installed
- OPENAI_API_KEY configured in .env
- Server running and healthy

**Testing Duration**: ~45-60 minutes for complete E2E test

---

## ✅ FINAL CHECKLIST

Before marking test complete, verify:
- [ ] All 8 scenarios executed
- [ ] Test results table updated
- [ ] Screenshots captured for critical bugs (if any)
- [ ] Console errors logged and categorized
- [ ] Network API calls validated
- [ ] Design consistency checked against NexGen EA
- [ ] AI Assistant Responses API format verified
- [ ] Data persistence confirmed
- [ ] Cross-browser testing completed (Edge, Chrome, Firefox)

**Test Completed By**: ___________________  
**Date**: ___________________  
**Overall Status**: ⬜ PASS | ⬜ PARTIAL PASS | ⬜ FAIL

---

**Document Version**: 1.0  
**Last Updated**: April 21, 2026  
**Related Documents**:
- [AI_ASSISTANT_USER_GUIDE.md](AI_ASSISTANT_USER_GUIDE.md)
- [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)
- [WHITESPOT_HEATMAP_TESTING_CHECKLIST.md](WHITESPOT_HEATMAP_TESTING_CHECKLIST.md)
