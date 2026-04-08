# EA Platform Design System Standardization

## Design System Reference

### Typography Hierarchy
```css
--ea-h1: 28px;    /* Page titles - semibold */
--ea-h2: 22px;    /* Section titles - semibold */
--ea-h3: 18px;    /* Subsection titles - medium */
--ea-body: 15px;  /* Body text - regular, lh 1.6 */
--ea-meta: 13px;  /* Labels, captions, meta - medium/muted */
--ea-kpi: 32px;   /* KPI display numbers - bold */
```

### Color Palette
```css
--ea-primary: #2C3E50;
--ea-secondary: #677480;
--ea-background: #EAEFF3;
--ea-surface: #FFFFFF;
--ea-accent: #4A7763;
--ea-text-strong: #1e293b;
--ea-text-default: #334155;
--ea-text-muted: #64748b;
--ea-border: #e2e8f0;
--ea-border-strong: #cbd5e1;
```

### Spacing Scale
```css
--v2-space-1: 4px;
--v2-space-2: 8px;
--v2-space-3: 12px;
--v2-space-4: 16px;
--v2-space-5: 20px;
--v2-space-6: 24px;
--v2-space-8: 32px;
```

### Border Radius
```css
--ea-radius-sm: 8px;
--ea-radius-md: 12px;
--ea-radius-lg: 16px;
```

### Shadows
```css
--ea-shadow-soft: 0 6px 18px rgba(31, 42, 51, 0.04);
--ea-shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);
--ea-shadow-md: 0 6px 18px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.08);
```

### Card Components
```css
.ea-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: var(--ea-radius-md);
  box-shadow: var(--ea-shadow-soft);
  padding: var(--v2-space-5);
}
```

### Chat Message Styling (AI Assistant Pattern)

**IMPORTANT:** All toolkits with AI Assistants MUST use this exact styling and markdown handling pattern (Architecture Principle #4 - Centralized AI Assistant).

#### Chat Container
```css
#chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  background: #1a1a1a;  /* Dark background for professional look */
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-width: thin;
  scrollbar-color: #404040 transparent;
}
```

#### Message Structure
```html
<div class="chat-message user-message">
  <div class="message-content">
    <div class="message-text">[escaped HTML text]</div>
    <div class="message-time">10:45 AM</div>
  </div>
</div>

<div class="chat-message assistant-message">
  <div class="message-content">
    <div class="message-text">[markdown rendered HTML]</div>
    <div class="message-time">10:45 AM</div>
  </div>
</div>
```

#### Message Styling
```css
.chat-message {
  display: flex;
  gap: 0;
  animation: chatSlideIn 0.2s ease;
  margin-bottom: 16px;
}

.user-message .message-text {
  background: rgba(55, 65, 81, 0.85);  /* Dark grey for user */
  color: #e2e8f0;
  border: 1px solid rgba(75, 85, 99, 0.4);
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.assistant-message .message-text {
  color: #e0e0e0;
  /* Markdown elements styled inline */
}

.message-time {
  font-size: 11px;
  color: #666;
  padding: 4px 0 0 0;
}
```

#### Markdown Rendering (MANDATORY)

All AI assistants MUST include the `parseMarkdown()` function from EA Platform (lines 7301-7414 in NexGen_EA_V4.html) to support:

- **Bold** (`**text**`) - rendered with `color:#ffffff;font-weight:700;`
- *Italic* (`*text*`) - rendered with `<em>` tags
- `Code` - inline code with dark background and blue text
- Headers (`#`, `##`, `###`) - styled with different font sizes and weights
- Lists (ordered and unordered) - proper spacing and bullets
- Code blocks (` ``` `) - dark background with light text
- Blockquotes (`> text`) - blue left border, indented
- Horizontal rules (`---`)

**Implementation Pattern:**
```javascript
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdown(text) {
  // Full implementation from NexGen_EA_V4.html line 7301
  // See AI Business Model Canvas.html for complete example
}

function addChatMessage(text, role) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${role}-message`;
  
  const messageHTML = role === 'assistant' ? parseMarkdown(text) : escapeHtml(text);
  
  msgDiv.innerHTML = `
    <div class="message-content">
      <div class="message-text">${messageHTML}</div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  document.getElementById('chat-messages').appendChild(msgDiv);
}
```

**Reference Implementation:** `NexGenEA/EA2_Toolkit/AI Business Model Canvas.html` (lines 783-901, 817-842)

## Standardization Scope

### Toolkits to Standardize
1. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4" fill="#22c55e"/></svg> **AI Business Model Canvas.html** (COMPLETED)
2. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4" fill="#64748b"/></svg> AI Strategy Workbench V2.html
3. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4" fill="#64748b"/></svg> AI Value Chain Analyzer V2.html
4. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4" fill="#64748b"/></svg> EA20 Maturity Toolbox V2.html
5. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4" fill="#64748b"/></svg> Application_Portfolio_Management.html
6. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4" fill="#64748b"/></svg> Workshop builders (3 files)

### Files Excluded from Standardization
- NexGen_EA_V4.html (EA Platform itself - already standardized)
- Integration mapping tools (working correctly)

## Standardization Checklist

For each toolkit:
- [ ] Replace inline `<style>` with external stylesheet references
- [ ] Apply EA Platform CSS variables for colors
- [ ] Standardize typography hierarchy (h1, h2, h3, body, meta)
- [ ] Use standard spacing scale (space-1 through space-8)
- [ ] Apply standard border radius (radius-sm, radius-md, radius-lg)
- [ ] Use card-based component patterns (.ea-card, .v2-card)
- [ ] Ensure consistent shadows (shadow-soft, shadow-sm, shadow-md)
- [ ] Maintain font family: Manrope/Inter
- [ ] Add proper header structure matching EA Platform
- [ ] Sync both local and azure-deployment versions

## Phase 1: AI Business Model Canvas

### Status: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> COMPLETED (2026-04-07)

### Changes Implemented
1. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Added EA stylesheet links (ea-nordic-theme.css, ea-design-engine.css)
2. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Changed font-family: 'Segoe UI' → 'Manrope'
3. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Replaced all color hex values with EA tokens (white → var(--ea-surface), #1e293b → var(--ea-border-strong))
4. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Converted typography: 0.6rem/0.72rem → var(--ea-meta), 1rem → var(--ea-h3)
5. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Applied EA spacing tokens throughout
6. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Updated border-radius: fixed px → var(--ea-radius-sm/md)
7. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Standardized shadows: custom rgba → var(--ea-shadow-soft/md)
8. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Standardized AI Assistant widget (chat panel, buttons, inputs)
9. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Removed duplicate stylesheet reference
10. <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> Validated (no errors) and synced to azure-deployment

### Example Transformation
```css
/* BEFORE */
.canvas-outer {
    background: white;
    border: 2px solid #1e293b;
    border-radius: 8px;
    padding: 20px;
    font-size: 0.72rem;
    color: #0f172a;
}

/* AFTER */
.canvas-outer {
    background: var(--ea-surface);
    border: 2px solid var(--ea-border-strong);
    border-radius: var(--ea-radius-md);
    padding: var(--v2-space-5);
    font-size: var(--ea-meta);
    color: var(--ea-text-strong);
}
```

### Validation Results
- **Errors:** None found
- **Lines Changed:** ~200 CSS lines standardized
- **Sync Status:** Deployed to azure-deployment/static/EA2_Toolkit/

---

## Next Steps

## Phase 1 MAJOR UPDATE: Complete Redesign (2026-04-08)

**AI Business Model Canvas** — Complete architecture rewrite implementing new EA Toolkit principles

### What Changed
**BEFORE:** Standalone toolkit with custom chat widget, API key modal, small canvas, action buttons at bottom  
**AFTER:** Fully integrated EA Platform toolkit with centralized AI sidebar, wider/higher canvas, **EA-styled toolbar**

### Key Improvements

1. **EA Platform Toolbar** (NEW):
   - Top toolbar following EA Platform styling
   - **Save/Load**: Quick save to browser localStorage, load saved BMC
   - **Export/Import**: JSON file export/import for sharing and backup
   - **Export Image**: Export canvas as image (placeholder for html2canvas)
   - **Print**: Print-optimized layout
   - **Clear Canvas**: Reset all content with confirmation
   - Consistent button styling with hover states and icons
   - Left-aligned actions, right-aligned destructive actions

2. **Centralized AI Assistant** (Architecture Principle #4):
   - Right sidebar matching EA Platform design (id="ai-chat-panel")
   - Removed separate API key modal → uses EA_Config centralized settings
   - "Fill BMC with AI" integrated as quick action button
   - Chat-based interaction: Fill BMC, Analyze, Improve
   - Ctrl+K keyboard shortcut to toggle sidebar

3. **Improved Readability**:
   - Cell min-height: 160px → **220px** (38% increase)
   - Bottom cells: 130px → **180px** (38% increase)
   - Typography: Larger fonts (var(--ea-body) instead of var(--ea-meta))
   - Canvas max-width: 1200px → **1600px** (33% wider)
   - Better spacing and padding throughout

4. **EA Platform Integration**:
   - EA Platform header with brand mark
   - Return to EA Platform navigation button
   - Uses EA_Config for API key (falls back to localStorage)
   - Consistent with EA Platform UX patterns

5. **Design System Compliance**:
   - All EA design tokens (colors, spacing, typography, shadows)
   - Clear borders: 3px outer, 2px grid cells
   - Proper flex layout with sidebar
   - .ea-btn and .toolbar-btn patterns
   - Print-optimized styles (@media print)

### Toolbar Features
```html
Left Actions:
- Save (primary button, saves to localStorage)
- Load (restores from localStorage)
- Export JSON (download file)
- Import JSON (upload file)
- Export Image (placeholder)
- Print (optimized layout)

Right Actions:
- Clear Canvas (danger button, with confirmation)
```

### Files
- **Modified:** `NexGenEA/EA2_Toolkit/AI Business Model Canvas.html` (~1000 lines)
- **Synced:** `azure-deployment/static/NexGenEA/EA2_Toolkit/AI Business Model Canvas.html`

### Pattern Established
This redesign establishes the **standard toolkit architecture** for all future EA Toolkits per Architecture Principle #4.

**Toolbar Pattern:**
- EA-styled toolbar between header and content
- Left: Primary actions (Save, Load, Export, Import)
- Right: Destructive actions (Clear, Delete)
- Dividers between logical groups
- Consistent button styling with icons

**Status:** <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#22c55e"/></svg> **COMPLETE & READY FOR TESTING**

---

## Next Steps (Original)

**Awaiting User Validation:**
- Review standardized [AI Business Model Canvas.html](NexGenEA/EA2_Toolkit/AI Business Model Canvas.html)
- Verify visual consistency with EA Platform design system
- Confirm UX/UI meets requirements
- Approve pattern before proceeding to remaining toolkits

**Pending Toolkits (5 remaining):**
1. AI Strategy Workbench V2.html
2. AI Value Chain Analyzer V2.html
3. EA20 Maturity Toolbox V2.html
4. Application_Portfolio_Management.html
5. Workshop builders (3 files: Wardley, ValueChain, Capability)
