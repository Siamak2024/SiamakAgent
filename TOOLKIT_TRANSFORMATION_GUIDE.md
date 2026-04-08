# EA Platform Design System Transformation Guide

## Status Overview

### Toolkit 1: AI Value Chain Analyzer V2.html - 70% Complete
- ✅ Head section with EA stylesheets
- ✅ CSS layout (app-container, sidebar styles)  
- ✅ Header structure updated
- ❌ Chat sidebar HTML needs replacement (line ~588)
- ❌ JavaScript functions missing
- ❌ localStorage key needs update

### Toolkit 2: EA20 Maturity Toolbox V2.html - 10% Complete
- ✅ Partial head updates
- ❌ Remove Tailwind script tag
- ❌ Remove all Tailwind classes from HTML
- ❌ Add EA Platform header
- ❌ Add chat sidebar
- ❌ Add JavaScript

### Toolkit 3: Application_Portfolio_Management.html - 0% Complete
- ❌ Full transformation needed

---

## Required Changes Per Toolkit

### 1. AI Value Chain Analyzer V2.html

#### A. Replace Old Chat HTML (Line ~588-640)
**Find:**
```html
<!-- === VC AI ASSISTANT HTML === -->
<button id="vc-fab" onclick="vcToggleChat()" title="AI Värdekedje-assistent">
    <i class="fas fa-robot"></i>
    <span class="vc-badge" id="vc-badge" style="display:none">1</span>
</button>

<div id="vc-chat-panel" class="vc-hidden">
    ... (entire old chat panel) ...
</div>
<!-- === VC AI ASSISTANT HTML END === -->
```

**Replace with:**
```html
    </div><!-- end main-content -->
    
    <!-- AI Chat Sidebar (fixed right, full height) -->
    <div id="ai-chat-panel" class="hidden">
        <div id="chat-resize-handle" title="Drag to resize"></div>
        <div id="chat-header">
            <div id="chat-header-title">
                <i class="fas fa-robot"></i> Value Chain AI Assistant
            </div>
            <div id="chat-controls">
                <button onclick="clearChat()" title="Clear chat"><i class="fas fa-trash"></i></button>
                <button onclick="toggleChatPanel()" title="Close"><i class="fas fa-times"></i></button>
            </div>
        </div>
        
        <div id="chat-messages">
            <div class="chat-message assistant-message">
                <div class="message-content">
                    <div class="message-text">
                        <strong style="color:#ffffff;font-weight:700;">Welcome to Value Chain AI Assistant</strong>
                        <div style="height:10px;"></div>
                        <p style="line-height:1.65;margin-bottom:8px;color:#e0e0e0;">I can help you analyze value chain activities, identify optimization opportunities, and assess digitalization potential.</p>
                        <div style="height:10px;"></div>
                        <em>Fill in your value chain activities and ask me anything!</em>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="chat-input-container">
            <textarea id="chat-input" placeholder="Ask about your value chain..."></textarea>
            <button id="send-chat" onclick="sendMessage()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
    
</div><!-- end app-container -->
```

#### B. Add JavaScript Functions (Before </body>)
Copy from AI Business Model Canvas.html lines 783-1050:
- `escapeHtml(text)`
- `parseMarkdown(text)`  
- `addChatMessage(text, role)`
- `sendMessage()`
- `clearChat()`
- `toggleChatPanel()`
- `initChatSidebarResize()`
- `applySidebarWidth(w)`
- DOMContentLoaded listener calling `initChatSidebarResize()`

#### C. Update localStorage Key
Change: `localStorage.getItem('bmc_sidebar_w')` → `localStorage.getItem('vc_sidebar_w')`

---

### 2. EA20 Maturity Toolbox V2.html

#### A. Remove Tailwind (Head Section)
**Remove:**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

#### B. Replace Body Tag & Header
**Find:**
```html
<body class="...tailwind classes...">
<header class="bg-gradient-to-r from-indigo-700 to-purple-600 ...">
```

**Replace with:**
```html
<body>
<div id="app-container">
    <div id="main-content">
        <div class="ea-header">
            <div class="ea-header-left">
                <div class="ea-brand-mark">EA</div>
                <div class="ea-header-title">
                    <h1><i class="fas fa-chart-line"></i>EA Maturity Toolbox</h1>
                    <p>Framework Assessment — Maturity Scoring — Capability Evaluation</p>
                </div>
            </div>
            <div class="ea-header-right">
                <button class="ea-header-icon" onclick="window.location.href='../NexGen_EA_V4.html'">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <button class="ea-header-icon" onclick="toggleChatPanel()">
                    <i class="fas fa-robot"></i>
                </button>
            </div>
        </div>
```

#### C. Remove All Tailwind Utility Classes
Replace:
- `class="flex items-center gap-4"` → `class="ea-toolbar-left"` (use EA Platform classes)
- `class="bg-white px-4 py-2"` → `class="toolbar-btn"`
- `class="grid grid-cols-3"` → `style="display: grid; grid-template-columns: repeat(3, 1fr);"`

#### D. Add Chat Sidebar (Before </body>)
Copy chat sidebar HTML from Value Chain template above (adjust title to "Maturity AI Assistant")

#### E. Add JavaScript
Copy all JavaScript functions from BMC template

#### F. Update Header Gradient
CSS line ~40:
```css
background: linear-gradient(135deg, #3730a3 0%, #7c3aed 100%) !important;
```

---

### 3. Application_Portfolio_Management.html

#### A. Full Transformation
1. Copy head section from BMC
2. Update header gradient: `linear-gradient(135deg, #92400e 0%, #b45309 100%)`
3. Update title: `<h1><i class="fas fa-layer-group"></i>Application Portfolio Management</h1>`
4. Update subtitle: `Portfolio Analysis — Rationalization — Technology Mapping`
5. Wrap existing content in app-container → main-content structure
6. Add chat sidebar
7. Add JavaScript functions
8. localStorage key: `apm_sidebar_w`

---

## JavaScript Template (Copy to All Toolkits)

```javascript
// Chat Panel Toggle
function toggleChatPanel() {
    const panel = document.getElementById('ai-chat-panel');
    if (!panel) return;
    const isOpen = !panel.classList.contains('hidden');
    if (isOpen) {
        panel.classList.add('hidden');
        document.body.classList.remove('chat-sidebar-open');
    } else {
        panel.classList.remove('hidden');
        document.body.classList.add('chat-sidebar-open');
        const input = document.getElementById('chat-input');
        if (input) input.focus();
    }
}

// Initialize Chat Sidebar Resize
function initChatSidebarResize() {
    const handle = document.getElementById('chat-resize-handle');
    const panel = document.getElementById('ai-chat-panel');
    if (!handle || !panel) return;
    let startX, startW;

    // Restore saved width (use toolkit-specific key)
    const saved = parseInt(localStorage.getItem('TOOLKIT_sidebar_w') || '0', 10);
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
            localStorage.setItem('TOOLKIT_sidebar_w', panel.offsetWidth);
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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initChatSidebarResize();
});

// Keyboard shortcut: Ctrl+K toggles chat
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleChatPanel();
    }
    if (e.key === 'Enter' && e.target.id === 'chat-input' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Markdown parser (from EA Platform)
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseMarkdown(text) {
    if (!text) return '';
    let t = escapeHtml(text);
    
    // Inline formatting
    t = t.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;font-weight:700;">$1</strong>');
    t = t.replace(/\*(.*?)\*/g, '<em>$1</em>');
    t = t.replace(/`([^`]+)`/g, '<code style="font-family:monospace;background:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:12px;color:#66d9ef;font-weight:500;border:1px solid #404040;">$1</code>');
    
    // Block processing
    const lines = t.split('\n');
    const out = [];
    let inUL = false, inOL = false, inCodeBlock = false, codeLines = [];
    
    const closeList = () => {
        if (inUL) { out.push('</ul>'); inUL = false; }
        if (inOL) { out.push('</ol>'); inOL = false; }
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Code blocks (```)
        if (trimmed.startsWith('```')) {
            if (!inCodeBlock) {
                closeList();
                inCodeBlock = true;
                codeLines = [];
                continue;
            } else {
                const codeContent = codeLines.join('\n');
                out.push(`<pre style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:8px;margin:10px 0;overflow-x:auto;font-size:10px;line-height:1.6;font-family:monospace;"><code>${codeContent}</code></pre>`);
                inCodeBlock = false;
                continue;
            }
        }
        
        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }
        
        // Headings
        const h3m = trimmed.match(/^### (.+)$/);
        const h2m = trimmed.match(/^## (.+)$/);
        const h1m = trimmed.match(/^# (.+)$/);
        if (h1m || h2m || h3m) {
            closeList();
            if (h3m) out.push(`<div style="font-size:14px;font-weight:600;color:#b0b0b0;margin:16px 0 8px;">${h3m[1]}</div>`);
            else if (h2m) out.push(`<div style="font-size:15px;font-weight:700;color:#e0e0e0;border-bottom:2px solid #0066cc;padding-bottom:6px;margin:18px 0 10px;">${h2m[1]}</div>`);
            else out.push(`<div style="font-size:16px;font-weight:700;color:#ffffff;margin:20px 0 10px;">${h1m[1]}</div>`);
            continue;
        }
        
        // Horizontal rule
        if (/^---+$/.test(trimmed)) {
            closeList();
            out.push('<hr style="border:none;border-top:1px solid #404040;margin:14px 0;">');
            continue;
        }
        
        // Blockquote
        const quotem = trimmed.match(/^> (.+)$/);
        if (quotem) {
            closeList();
            out.push(`<div style="border-left:3px solid #0066cc;background:#1a1a1a;padding:10px 14px;margin:10px 0;border-radius:4px;font-style:italic;color:#b0b0b0;">${quotem[1]}</div>`);
            continue;
        }
        
        // Unordered list
        const ulm = trimmed.match(/^[-*—] (.+)$/);
        if (ulm) {
            if (!inUL) { closeList(); out.push('<ul style="margin:8px 0;padding-left:20px;list-style-type:disc;color:#b0b0b0;">'); inUL = true; }
            out.push(`<li style="margin-bottom:6px;line-height:1.6;color:#e0e0e0;">${ulm[1]}</li>`);
            continue;
        }
        
        // Ordered list
        const olm = trimmed.match(/^\d+\.\s(.+)$/);
        if (olm) {
            if (!inOL) { closeList(); out.push('<ol style="margin:8px 0;padding-left:22px;color:#b0b0b0;">'); inOL = true; }
            out.push(`<li style="margin-bottom:6px;line-height:1.6;color:#e0e0e0;">${olm[1]}</li>`);
            continue;
        }
        
        // Empty line
        if (trimmed === '') {
            closeList();
            out.push('<div style="height:10px;"></div>');
            continue;
        }
        
        // Regular paragraph
        closeList();
        out.push(`<p style="line-height:1.65;margin-bottom:8px;color:#e0e0e0;">${trimmed}</p>`);
    }
    
    closeList();
    return out.join('');
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    // Call AI (implement based on toolkit needs)
    addChatMessage('AI response placeholder - implement based on toolkit requirements', 'assistant');
}

function addChatMessage(text, role) {
    const messagesDiv = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = role === 'assistant' ? parseMarkdown(text) : escapeHtml(text);
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    msgDiv.appendChild(messageContent);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function clearChat() {
    const messagesDiv = document.getElementById('chat-messages');
    messagesDiv.innerHTML = '';
    addChatMessage('Chat history cleared. How can I help you?', 'assistant');
}
```

**Note:** Replace `TOOLKIT_sidebar_w` with:
- `vc_sidebar_w` for Value Chain Analyzer
- `ea20_sidebar_w` for EA20 Maturity Toolbox
- `apm_sidebar_w` for Application Portfolio Management

---

## Validation Checklist

For each toolkit after transformation:

### Visual/Structure
- [ ] No Tailwind script tag in `<head>`
- [ ] No Tailwind utility classes in HTML
- [ ] EA Platform header with correct gradient color
- [ ] Icon in h1 (32px), title 20px
- [ ] app-container → main-content structure present
- [ ] Chat sidebar HTML with resize handle exists

### JavaScript
- [ ] Markdown parser function exists
- [ ] Chat functions (sendMessage, addChatMessage, clearChat) exist
- [ ] Toggle function (toggleChatPanel) exists
- [ ] Resize logic (initChatSidebarResize) exists
- [ ] DOMContentLoaded listener calls initChatSidebarResize()
- [ ] Correct localStorage key for sidebar width

### Functionality
- [ ] Click robot icon → chat panel opens
- [ ] Drag resize handle → sidebar resizes (280-800px)
- [ ] Resize persists after page reload
- [ ] Ctrl+K keyboard shortcut toggles chat
- [ ] Enter in textarea sends message
- [ ] Links work (back to EA Platform)
- [ ] Existing toolkit features still work (grids, forms, etc.)

### Deployment
- [ ] File synced to azure-deployment/static/NexGenEA/EA2_Toolkit/

---

## Color Reference

| Toolkit | Gradient |
|---------|----------|
| Value Chain Analyzer | `linear-gradient(135deg, #1e3a8a 0%, #1a56db 100%)` (blue) |
| EA20 Maturity Toolbox | `linear-gradient(135deg, #3730a3 0%, #7c3aed 100%)` (indigo/purple) |
| Application Portfolio Management | `linear-gradient(135deg, #92400e 0%, #b45309 100%)` (brown/rust) |

---

## Sync to Azure Deployment

After completing each toolkit, sync to deployment:

```powershell
Copy-Item "NexGenEA\EA2_Toolkit\AI Value Chain Analyzer V2.html" `
    "azure-deployment\static\NexGenEA\EA2_Toolkit\AI Value Chain Analyzer V2.html" -Force

Copy-Item "NexGenEA\EA2_Toolkit\EA20 Maturity Toolbox V2.html" `
    "azure-deployment\static\NexGenEA\EA2_Toolkit\EA20 Maturity Toolbox V2.html" -Force

Copy-Item "NexGenEA\EA2_Toolkit\Application_Portfolio_Management.html" `
    "azure-deployment\static\NexGenEA\EA2_Toolkit\Application_Portfolio_Management.html" -Force
```

---

## Quick Reference - Header Icons

```html
<!-- Value Chain -->
<i class="fas fa-link"></i>

<!-- EA20 Maturity -->
<i class="fas fa-chart-line"></i>

<!-- APM -->
<i class="fas fa-layer-group"></i>
```

---

## Completion Timeline Estimate

- **Value Chain Analyzer:** 30 minutes (chat HTML replacement + JavaScript)
- **EA20 Maturity Toolbox:** 60 minutes (Tailwind removal + full structure)
- **Application Portfolio Management:** 90 minutes (full transformation)

**Total:** ~3 hours for systematic completion

---

## Support Resources

- **Reference Implementation:** `NexGenEA/EA2_Toolkit/AI Business Model Canvas.html`
- **CSS Source:** Lines 1-350 (head + styles)
- **JavaScript Source:** Lines 783-1050 (markdown + chat functions)
- **Layout Pattern:** Lines 550-780 (HTML structure)
