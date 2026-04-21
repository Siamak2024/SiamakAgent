# EA Chat Component Integration Guide

## Overview

The **EA Chat Component** is a universal, reusable AI assistant that follows the **EA Platform V4 Architecture Principles**:

✅ **OpenAI Responses API with GPT-5**  
✅ **Dark Mode Only UI**  
✅ **Draggable and Resizable Panel**  
✅ **Markdown Rendering with Syntax Highlighting**  
✅ **Streaming Support** (Future Enhancement)  
✅ **LocalStorage Persistence**  

---

## Quick Integration

### 1. Add Script References

Add these scripts to your HTML `<head>`:

```html
<!-- Optional: Markdown rendering library -->
<script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>

<!-- Optional: Syntax highlighting for code blocks -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>

<!-- Azure OpenAI Proxy (Required) -->
<script src="../../AzureOpenAIProxy.js"></script>

<!-- EA Chat Component (Required) -->
<script src="ea_chat_component.js"></script>
```

### 2. Initialize the Chat Component

Add this JavaScript at the end of your `<body>` or in your initialization script:

```javascript
// Initialize the EA Chat Component
eaChat = new EAChatComponent({
    panelId: 'whitespot-chat-panel',
    title: 'WhiteSpot AI Assistant',
    icon: 'fa-chart-bar',
    
    // Context provider function - returns current state
    contextProvider: () => {
        const customers = whitespotStandaloneManager.getCustomers();
        const heatmaps = whitespotStandaloneManager.getHeatmaps();
        const stats = whitespotStandaloneManager.getStatistics();
        
        return {
            tool: 'WhiteSpot Service Delivery Heatmap',
            customers: customers.map(c => ({ 
                name: c.name, 
                industry: c.industry, 
                region: c.region 
            })),
            heatmapCount: heatmaps.length,
            statistics: stats,
            summary: `${customers.length} customers, ${heatmaps.length} heatmaps`,
            
            // Quick action buttons
            quickActions: [
                {
                    label: 'Analyze Opportunities',
                    icon: 'fa-lightbulb',
                    prompt: 'Analyze the current heatmap and identify top opportunities for service expansion'
                },
                {
                    label: 'Find Gaps',
                    icon: 'fa-search',
                    prompt: 'What service gaps exist in the current coverage?'
                },
                {
                    label: 'Sales Strategy',
                    icon: 'fa-handshake',
                    prompt: 'Suggest a sales strategy based on the current service assessment'
                },
                {
                    label: 'APQC Insights',
                    icon: 'fa-sitemap',
                    prompt: 'What APQC capabilities should we focus on?'
                }
            ]
        };
    },
    
    // System prompt for the AI
    systemPrompt: `You are an expert service delivery consultant helping with WhiteSpot heatmap analysis. 
Focus on service coverage opportunities, APQC process mapping, and sales strategy. 
Provide concise, actionable insights for prospect analysis and opportunity identification.
Format your responses using markdown for better readability.`
});

// Render the chat panel
eaChat.render();

// Optional: Add keyboard shortcut (Ctrl+K or Cmd+K)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        eaChat.toggle();
    }
});
```

### 3. Add Toggle Button

Add a button to your header or toolbar:

```html
<button class="btn btn-primary" onclick="eaChat.toggle()" title="AI Assistant (Ctrl+K)">
    <i class="fas fa-robot"></i> AI Assistant
</button>
```

---

## API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `panelId` | string | `'ai-chat-panel'` | Unique ID for the chat panel element |
| `title` | string | `'AI Assistant'` | Title shown in the header |
| `icon` | string | `'fa-robot'` | Font Awesome icon class |
| `contextProvider` | function | `() => ({})` | Function that returns current context object |
| `systemPrompt` | string | Generic assistant | System instructions for the AI |

### Methods

```javascript
// Open/close/toggle the chat panel
eaChat.open();
eaChat.close();
eaChat.toggle();

// Send a message programmatically
eaChat.sendQuickAction('Your prompt here');

// Clear conversation history
eaChat.clearConversation();

// Add a message manually
eaChat.addMessage('Message text', 'user' | 'ai');

// Update context and quick actions
eaChat.updateContext();
eaChat.updateQuickActions();
```

### Context Provider

The `contextProvider` function should return an object with:

```javascript
{
    // Required
    summary: 'Brief context summary',  // Shown in context indicator
    
    // Optional - Will be passed to AI
    tool: 'Tool name',
    [customProperty]: anyValue,
    
    // Optional - Quick action buttons
    quickActions: [
        {
            label: 'Button label',
            icon: 'fa-icon-name',
            prompt: 'The prompt to send to AI'
        }
    ]
}
```

---

## Features

### Dark Mode Design

The chat panel uses a modern dark theme:
- **Background:** Gradient from `#1e293b` to `#0f172a`
- **Messages:** User messages in blue gradient, AI messages in slate
- **Syntax highlighting:** Atom One Dark theme for code blocks
- **Smooth animations:** Fade-in, slide-in effects

### Draggable

- **Drag from header:** Click and hold the header to move the panel
- **Constrained to viewport:** Can't drag off-screen
- **Position saved:** Remembers position in localStorage

### Resizable

- **Resize handle:** Left edge of the panel
- **Width constraints:** Min 320px, Max 600px
- **Width saved:** Remembers width preference in localStorage

### Markdown Support

AI responses are rendered with full markdown support:
- **Headings:** `#`, `##`, `###`
- **Lists:** Bullet and numbered
- **Links:** Clickable URLs
- **Code:** Inline `code` and fenced code blocks with syntax highlighting
- **Tables:** Full table rendering
- **Bold/Italic:** `**bold**` and `*italic*`

### State Persistence

Automatically saves to localStorage:
- Panel position (x, y coordinates)
- Panel width
- Conversation history (optional, not implemented by default)

---

## Styling Customization

The component includes all styles inline. To customize:

1. **Override CSS variables** (add to your page):

```css
.ea-chat-panel {
    --chat-bg-from: #1e293b;
    --chat-bg-to: #0f172a;
    --chat-accent: #3b82f6;
    --chat-text: #f1f5f9;
}
```

2. **Modify the component:** Edit `ea_chat_component.js` → `renderStyles()` method

---

## Examples

### WhiteSpot Standalone

```javascript
eaChat = new EAChatComponent({
    panelId: 'whitespot-chat',
    title: 'WhiteSpot AI Assistant',
    icon: 'fa-th',
    contextProvider: () => ({
        tool: 'WhiteSpot Service Delivery Heatmap',
        customers: whitespotStandaloneManager.getCustomers(),
        heatmaps: whitespotStandaloneManager.getHeatmaps(),
        summary: `${whitespotStandaloneManager.getCustomers().length} customers loaded`
    }),
    systemPrompt: 'Expert service delivery consultant for WhiteSpot analysis.'
});
eaChat.render();
```

### EA Engagement Playbook

```javascript
eaChat = new EAChatComponent({
    panelId: 'ea-engagement-chat',
    title: 'EA Engagement Assistant',
    icon: 'fa-users',
    contextProvider: () => ({
        tool: 'EA Engagement Playbook',
        engagement: engagementManager.getCurrentEngagement(),
        customer: engagementManager.getSelectedCustomer(),
        summary: `Engagement: ${engagementManager.getCurrentEngagement()?.name || 'None'}`
    }),
    systemPrompt: 'Expert EA consultant for customer engagement planning.'
});
eaChat.render();
```

### Growth Spring Dashboard

```javascript
eaChat = new EAChatComponent({
    panelId: 'growth-spring-chat',
    title: 'Growth Strategy Assistant',
    icon: 'fa-chart-line',
    contextProvider: () => ({
        tool: 'Growth Spring Dashboard',
        initiatives: growthManager.getInitiatives(),
        metrics: growthManager.getMetrics(),
        summary: `${growthManager.getInitiatives().length} initiatives tracked`
    }),
    systemPrompt: 'Expert growth strategist for business expansion planning.'
});
eaChat.render();
```

---

## Troubleshooting

### Chat panel doesn't appear

1. Check browser console for errors
2. Verify `ea_chat_component.js` is loaded
3. Verify `AzureOpenAIProxy.js` is loaded
4. Check that `eaChat.render()` is called

### AI responses fail

1. Check `AzureOpenAIProxy.js` path is correct
2. Verify API endpoint is accessible
3. Check browser console for error messages
4. Ensure GPT-5 Responses API format is used

### Dragging/resizing doesn't work

1. Check z-index conflicts with other elements
2. Verify event listeners are attached
3. Check browser console for JavaScript errors

### Markdown not rendering

1. Verify `markdown-it` library is loaded
2. Check for fallback renderer activation
3. Test with simple markdown (e.g., `**bold**`)

---

## Future Enhancements

- [ ] **Streaming support:** Real-time token-by-token rendering
- [ ] **Conversation export:** Save chat history to file
- [ ] **Voice input:** Speech-to-text integration
- [ ] **Multi-language:** Auto-detect and translate
- [ ] **Themes:** Customizable color schemes
- [ ] **Attachments:** Upload files for context

---

## Support

For questions or issues:
1. Check architecture documentation: `/architecture/EAV4_Architecture.md`
2. Review component source: `/NexGenEA/EA2_Toolkit/ea_chat_component.js`
3. Test with demo data to isolate issues

---

**Version:** 1.0.0  
**Last Updated:** April 21, 2026  
**License:** Internal Use Only
