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

### Resizable Chat Sidebar (MANDATORY)

All toolkit AI chat panels MUST be resizable by dragging the left edge.

#### Resize Handle HTML
```html
<div id="ai-chat-panel">
  <div id="chat-resize-handle" title="Drag to resize"></div>
  <div id="chat-header">...</div>
  ...
</div>
```

#### Resize Handle CSS
```css
#chat-resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  background: transparent;
  z-index: 20;
  transition: background 0.15s;
}
#chat-resize-handle:hover,
#chat-resize-handle.dragging {
  background: #0e7afe;
}
```

#### Resize Functionality JavaScript
```javascript
function initChatSidebarResize() {
  const handle = document.getElementById('chat-resize-handle');
  const panel = document.getElementById('ai-chat-panel');
  if (!handle || !panel) return;
  let startX, startW;

  // Restore saved width from localStorage
  const saved = parseInt(localStorage.getItem('[toolkit]_sidebar_w') || '0', 10);
  if (saved >= 280 && saved <= 800) applySidebarWidth(saved);

  handle.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startW = panel.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    function onMove(ev) {
      const diff = startX - ev.clientX;
      const newW = Math.max(280, Math.min(800, startW + diff));
      applySidebarWidth(newW);
    }
    
    function onUp() {
      localStorage.setItem('[toolkit]_sidebar_w', panel.offsetWidth);
      handle.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function applySidebarWidth(w) {
  const panel = document.getElementById('ai-chat-panel');
  if (!panel) return;
  panel.style.width = w + 'px';
  
  // Update main content margin to match
  const style = document.getElementById('_sidebar-width-style') || (() => {
    const s = document.createElement('style');
    s.id = '_sidebar-width-style';
    document.head.appendChild(s);
    return s;
  })();
  style.textContent = `body.chat-sidebar-open #main-content{margin-right:${w}px!important;}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initChatSidebarResize();
});
```

**Constraints:**
- Minimum width: 280px
- Maximum width: 800px
- Default width: 420px (or restored from localStorage)
- Width persists across sessions using `localStorage`

**Reference Implementation:** `NexGenEA/EA2_Toolkit/AI Business Model Canvas.html` (lines 823-871)

### Toolkit-Specific Header Colors

**EXCEPTION:** Each toolkit uses its own hero/header gradient color while maintaining consistent sizes and icons.

#### Header Gradients by Toolkit

| Toolkit | Step | Gradient (135deg) | CSS Code |
|---------|------|-------------------|----------|
| **AI Business Model Canvas** | STEP 1 | Dark slate → Teal | `linear-gradient(135deg, #1e293b 0%, #0f766e 100%)` |
| **AI Value Chain Analyzer** | STEP 2 | Navy → Blue | `linear-gradient(135deg, #1e3a8a 0%, #1a56db 100%)` |
| **AI-förmågekartläggning** | STEP 3 | Purple → Violet | `linear-gradient(135deg, #581c87 0%, #7c3aed 100%)` |
| **AI-strategiverkstad** | STEP 4 | Brown → Orange | `linear-gradient(135deg, #92400e 0%, #ea580c 100%)` |
| **NextGen EA Mognadsverktygsláda** | STEP 5 | Indigo → Purple | `linear-gradient(135deg, #3730a3 0%, #7c3aed 100%)` |
| **Applikationsportföljhantering** | STEP 6 | Rust → Brown | `linear-gradient(135deg, #92400e 0%, #b45309 100%)` |

#### Consistent Header Structure

**ALL toolkits must maintain:**
- Height: 64px
- Icon size: 32px (`.ea-brand i` or `.fa-*` icons)
- Title font-size: 20px
- Title font-weight: 700
- Padding: 0 24px
- Border-bottom: 1px solid rgba(255,255,255,0.08)

```html
<div class="ea-header">
  <div class="ea-header-left">
    <div class="ea-brand-mark">EA</div>
    <div class="ea-header-title">
      <h1><i class="fas fa-table-cells-large"></i> AI Business Model Canvas</h1>
      <p>Affärsmodell — Värdeerbjudande — Intäktslogik</p>
    </div>
  </div>
  <div class="ea-header-actions">
    <!-- Action buttons -->
  </div>
</div>
```

```css
.ea-header {
  height: 64px;
  background: [toolkit-specific gradient] !important; /* !important needed to override ea-nordic-theme.css */
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: white;
}

.ea-header h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 2px 0;
}

.ea-header h1 i {
  font-size: 32px;
  margin-right: 12px;
}
```

**Reference:** Toolkit landing page (image provided 2026-04-08) shows each toolkit with unique color scheme while maintaining consistent layout and sizing.

**Reference Implementation:** `NexGenEA/EA2_Toolkit/AI Business Model Canvas.html` (lines 37-43)

---

## Complete Implementation Blueprint

This section provides the COMPLETE pattern for standardizing any toolkit. Follow this checklist exactly.

### Step-by-Step Implementation Guide

#### 1. External Stylesheets (Lines 8-10 in <head>)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="../../css/ea-nordic-theme.css" />
<link rel="stylesheet" href="../../css/ea-design-engine.css" />
<script src="../js/EA_Config.js"></script>
<script src="../js/EA_DataManager.js"></script>
<script src="../js/Advicy_AI.js"></script>
```

#### 2. Base Layout Structure
```css
body {
    margin: 0;
    font-family: 'Manrope', 'Segoe UI', system-ui, sans-serif;
    background: var(--ea-background);
    overflow: hidden;
}
#app-container {
    display: flex;
    height: 100vh;
    position: relative;
}
#main-content {
    flex: 1;
    overflow-y: auto;
    transition: margin-right 0.2s ease;
}
body.chat-sidebar-open #main-content {
    margin-right: 380px; /* Default, will be overridden by resize */
}
```

#### 3. Header Structure (Toolkit-Specific Color)
```html
<div class="ea-header">
    <div class="ea-header-left">
        <div class="ea-brand-mark">EA</div>
        <div class="ea-header-title">
            <h1><i class="fas fa-[icon]"></i>[Toolkit Name]</h1>
            <p>[Subtitle in Swedish]</p>
        </div>
    </div>
    <div class="ea-header-right">
        <button class="ea-header-icon" onclick="window.location.href='../NexGen_EA_V4.html'" title="Return to EA Platform">
            <i class="fas fa-arrow-left"></i>
        </button>
        <button class="ea-header-icon" onclick="toggleChatPanel()" title="AI Assistant (Ctrl+K)">
            <i class="fas fa-robot"></i>
        </button>
    </div>
</div>
```

```css
.ea-header {
    height: 64px;
    background: [toolkit-gradient] !important; /* See color table below */
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    color: white;
}
.ea-header-title h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 2px 0;
    display: flex;
    align-items: center;
    gap: 12px;
}
.ea-header-title h1 i {
    font-size: 32px;
}
.ea-header-title p {
    font-size: 11px;
    opacity: 0.7;
    margin: 0;
}
```

**Toolkit Color Assignments:**
| Toolkit | Icon | Gradient |
|---------|------|----------|
| AI Business Model Canvas | `fa-table-cells-large` | `linear-gradient(135deg, #1e293b 0%, #0f766e 100%)` |
| AI Value Chain Analyzer | `fa-network-wired` | `linear-gradient(135deg, #1e3a8a 0%, #1a56db 100%)` |
| AI Capability Mapping | `fa-sitemap` | `linear-gradient(135deg, #581c87 0%, #7c3aed 100%)` |
| AI Strategy Workbench | `fa-chess` | `linear-gradient(135deg, #92400e 0%, #ea580c 100%)` |
| EA20 Maturity Toolbox | `fa-chart-line` | `linear-gradient(135deg, #3730a3 0%, #7c3aed 100%)` |
| Application Portfolio Management | `fa-layer-group` | `linear-gradient(135deg, #92400e 0%, #b45309 100%)` |

#### 4. AI Chat Sidebar (Right Side)
```html
<div id="ai-chat-panel">
    <div id="chat-resize-handle" title="Drag to resize"></div>
    <div id="chat-header">
        <h3><i class="fas fa-robot"></i> [Toolkit] AI Assistant</h3>
        <button onclick="toggleChatPanel()" title="Close (ESC)">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div id="chat-messages">
        <div class="chat-message assistant-message">
            <div class="message-content">
                <div class="message-text">
                    <p><strong>Welcome to [Toolkit] AI Assistant</strong></p>
                    <p>I can help you:</p>
                    <ul>
                        <li>[Toolkit-specific capability 1]</li>
                        <li>[Toolkit-specific capability 2]</li>
                        <li>[Toolkit-specific capability 3]</li>
                    </ul>
                    <p><em>Click "Fill [Toolkit]" above or ask me anything!</em></p>
                </div>
            </div>
        </div>
    </div>
    <div id="chat-input-container">
        <textarea id="chat-input" placeholder="Ask about [toolkit topic]..." rows="2"></textarea>
        <button id="chat-send-btn" onclick="sendChatMessage()">
            <i class="fas fa-paper-plane"></i>
        </button>
    </div>
</div>
```

```css
#ai-chat-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 420px;
    background: var(--ea-surface);
    box-shadow: -2px 0 8px rgba(0,0,0,0.12);
    display: none;
    flex-direction: column;
    z-index: 100;
}
body.chat-sidebar-open #ai-chat-panel {
    display: flex;
}
#chat-resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    cursor: col-resize;
    background: transparent;
    z-index: 20;
    transition: background 0.15s;
}
#chat-resize-handle:hover,
#chat-resize-handle.dragging {
    background: #0e7afe;
}
#chat-header {
    height: 64px;
    background: [same gradient as .ea-header];
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    border-bottom: 1px solid rgba(255,255,255,0.08);
}
#chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    background: #1a1a1a;
    display: flex;
    flex-direction: column;
    gap: 0;
}
```

#### 5. Required JavaScript Functions

**Toggle Chat Panel:**
```javascript
function toggleChatPanel() {
    document.body.classList.toggle('chat-sidebar-open');
    if (document.body.classList.contains('chat-sidebar-open')) {
        document.getElementById('chat-input')?.focus();
    }
}
```

**Resize Sidebar:**
```javascript
function initChatSidebarResize() {
    const handle = document.getElementById('chat-resize-handle');
    const panel = document.getElementById('ai-chat-panel');
    if (!handle || !panel) return;
    let startX, startW;
    
    const saved = parseInt(localStorage.getItem('[toolkit]_sidebar_w') || '0', 10);
    if (saved >= 280 && saved <= 800) applySidebarWidth(saved);
    
    handle.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startW = panel.offsetWidth;
        handle.classList.add('dragging');
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        
        function onMove(ev) {
            const diff = startX - ev.clientX;
            const newW = Math.max(280, Math.min(800, startW + diff));
            applySidebarWidth(newW);
        }
        
        function onUp() {
            localStorage.setItem('[toolkit]_sidebar_w', panel.offsetWidth);
            handle.classList.remove('dragging');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        }
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

function applySidebarWidth(w) {
    const panel = document.getElementById('ai-chat-panel');
    if (!panel) return;
    panel.style.width = w + 'px';
    const style = document.getElementById('_sidebar-width-style') || (() => {
        const s = document.createElement('style');
        s.id = '_sidebar-width-style';
        document.head.appendChild(s);
        return s;
    })();
    style.textContent = `body.chat-sidebar-open #main-content{margin-right:${w}px!important;}`;
}
```

**Markdown Chat Messages:**
```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseMarkdown(text) {
    return text
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => 
            `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hup])/gm, '<p>')
        .replace(/(?<![>])$/gm, '</p>')
        .replace(/<p><\/p>/g, '');
}

function addChatMessage(sender, msg) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    const content = sender === 'user' ? escapeHtml(msg) : parseMarkdown(msg);
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${content}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
```

**Initialize on Page Load:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    initChatSidebarResize();
    
    // ESC to close chat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('chat-sidebar-open')) {
            toggleChatPanel();
        }
    });
    
    // Ctrl+K to open chat
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleChatPanel();
        }
    });
});
```

#### 6. Validation Checklist

Before marking toolkit as complete:
- [ ] Header shows correct gradient color with !important
- [ ] Header icon is 32px, title is 20px/700
- [ ] Chat sidebar resizable (drag left edge)
- [ ] Width persists with localStorage key: `[toolkit]_sidebar_w`
- [ ] Chat messages render markdown (code blocks, lists, bold, italic)
- [ ] User messages right-aligned blue, assistant left-aligned gray
- [ ] ESC closes chat, Ctrl+K opens chat
- [ ] No console errors
- [ ] Synced to azure-deployment

---

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
