/**
 * EA Chat Component - Universal AI Assistant
 * Follows EA Platform V4 Architecture Principles:
 * - OpenAI Responses API with GPT-5
 * - Dark mode only UI
 * - Draggable and resizable panel
 * - Markdown rendering with syntax highlighting
 * - Streaming support
 * 
 * @version 1.0.0
 * @date 2026-04-21
 */

class EAChatComponent {
    constructor(options = {}) {
        this.panelId = options.panelId || 'ai-chat-panel';
        this.title = options.title || 'AI Assistant';
        this.icon = options.icon || 'fa-robot';
        this.contextProvider = options.contextProvider || (() => ({}));
        this.systemPrompt = options.systemPrompt || 'You are a helpful AI assistant.';
        
        // State
        this.isOpen = false;
        this.isDragging = false;
        this.isResizing = false;
        this.messages = [];
        
        // Load state from localStorage
        const savedState = localStorage.getItem(`${this.panelId}_state`);
        if (savedState) {
            const state = JSON.parse(savedState);
            this.position = state.position || { x: window.innerWidth - 420, y: 80 };
            this.width = state.width || 400;
        } else {
            this.position = { x: window.innerWidth - 420, y: 80 };
            this.width = 400;
        }
        
        this.minWidth = 320;
        this.maxWidth = 600;
        this.minHeight = 400;
        
        // Initialize markdown-it for rendering
        this.initMarkdownRenderer();
    }
    
    initMarkdownRenderer() {
        // Use markdown-it if available, otherwise simple fallback
        if (typeof markdownit !== 'undefined') {
            this.md = markdownit({
                html: true,
                linkify: true,
                typographer: true,
                highlight: function (str, lang) {
                    if (lang && hljs && hljs.getLanguage(lang)) {
                        try {
                            return '<pre class="hljs"><code>' +
                                   hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                                   '</code></pre>';
                        } catch (__) {}
                    }
                    return '<pre class="hljs"><code>' + str + '</code></pre>';
                }
            });
        } else {
            // Simple fallback markdown renderer
            this.md = {
                render: (text) => {
                    return text
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/`(.+?)`/g, '<code>$1</code>')
                        .replace(/\n/g, '<br>');
                }
            };
        }
    }
    
    render() {
        const panel = document.createElement('div');
        panel.id = this.panelId;
        panel.className = 'ea-chat-panel';
        panel.style.cssText = `
            position: fixed;
            left: ${this.position.x}px;
            top: ${this.position.y}px;
            width: ${this.width}px;
            min-height: ${this.minHeight}px;
            max-height: calc(100vh - 100px);
            display: none;
            flex-direction: column;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            z-index: 10000;
            overflow: hidden;
        `;
        
        panel.innerHTML = `
            ${this.renderStyles()}
            
            <!-- Resize Handle (Left Edge) -->
            <div class="ea-chat-resize-handle"></div>
            
            <!-- Header (Draggable) -->
            <div class="ea-chat-header">
                <div class="ea-chat-title">
                    <i class="fas ${this.icon}"></i>
                    <span>${this.title}</span>
                </div>
                <div class="ea-chat-controls">
                    <button class="ea-chat-btn" onclick="eaChat.minimize()" title="Minimize">
                        <i class="fas fa-window-minimize"></i>
                    </button>
                    <button class="ea-chat-btn" onclick="eaChat.clearConversation()" title="Clear conversation">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="ea-chat-btn" onclick="eaChat.close()" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Context Indicator -->
            <div class="ea-chat-context">
                <i class="fas fa-info-circle"></i>
                <span id="${this.panelId}-context">Loading context...</span>
            </div>
            
            <!-- Messages Container -->
            <div class="ea-chat-messages" id="${this.panelId}-messages">
                <div class="ea-chat-welcome">
                    <i class="fas ${this.icon}" style="font-size: 48px; color: #3b82f6; margin-bottom: 16px;"></i>
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Welcome to ${this.title}</h3>
                    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Ask me anything about your current work or use quick actions below.</p>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="ea-chat-quick-actions" id="${this.panelId}-quick-actions">
                <!-- Will be populated dynamically -->
            </div>
            
            <!-- Input Area -->
            <div class="ea-chat-input-container">
                <textarea 
                    class="ea-chat-input" 
                    id="${this.panelId}-input" 
                    placeholder="Type your message... (Shift+Enter for new line)"
                    rows="1"
                ></textarea>
                <button class="ea-chat-send-btn" id="${this.panelId}-send" onclick="eaChat.sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Set up event listeners
        this.setupEventListeners();
        
        return panel;
    }
    
    renderStyles() {
        return `
            <style>
                .ea-chat-panel {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                
                /* Resize Handle */
                .ea-chat-resize-handle {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 6px;
                    cursor: ew-resize;
                    background: transparent;
                    transition: background 0.2s;
                    z-index: 10;
                }
                
                .ea-chat-resize-handle:hover,
                .ea-chat-resize-handle.resizing {
                    background: #3b82f6;
                }
                
                /* Header */
                .ea-chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: rgba(30, 41, 59, 0.95);
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                    cursor: move;
                    user-select: none;
                }
                
                .ea-chat-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    color: #f1f5f9;
                }
                
                .ea-chat-title i {
                    color: #3b82f6;
                }
                
                .ea-chat-controls {
                    display: flex;
                    gap: 6px;
                }
                
                .ea-chat-btn {
                    background: transparent;
                    border: none;
                    color: #cbd5e1;
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .ea-chat-btn:hover {
                    background: rgba(148, 163, 184, 0.1);
                    color: #f1f5f9;
                }
                
                /* Context Indicator */
                .ea-chat-context {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(59, 130, 246, 0.1);
                    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
                    font-size: 12px;
                    color: #93c5fd;
                }
                
                /* Messages */
                .ea-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .ea-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }
                
                .ea-chat-messages::-webkit-scrollbar-track {
                    background: rgba(148, 163, 184, 0.1);
                }
                
                .ea-chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.3);
                    border-radius: 3px;
                }
                
                .ea-chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.5);
                }
                
                .ea-chat-welcome {
                    text-align: center;
                    padding: 40px 20px;
                    color: #cbd5e1;
                }
                
                /* Message Bubble */
                .ea-chat-message {
                    display: flex;
                    flex-direction: column;
                    max-width: 85%;
                    animation: messageSlideIn 0.3s ease;
                }
                
                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .ea-chat-message.user {
                    align-self: flex-end;
                }
                
                .ea-chat-message.ai {
                    align-self: flex-start;
                }
                
                .ea-chat-message-content {
                    padding: 12px 16px;
                    border-radius: 12px;
                    line-height: 1.6;
                    font-size: 14px;
                }
                
                .ea-chat-message.user .ea-chat-message-content {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                
                .ea-chat-message.ai .ea-chat-message-content {
                    background: #334155;
                    color: #f1f5f9;
                    border-bottom-left-radius: 4px;
                }
                
                .ea-chat-message-time {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 4px;
                    padding: 0 4px;
                }
                
                /* Markdown Styling */
                .ea-chat-message-content h1,
                .ea-chat-message-content h2,
                .ea-chat-message-content h3 {
                    margin-top: 16px;
                    margin-bottom: 8px;
                    font-weight: 700;
                }
                
                .ea-chat-message-content h1 { font-size: 18px; }
                .ea-chat-message-content h2 { font-size: 16px; }
                .ea-chat-message-content h3 { font-size: 14px; }
                
                .ea-chat-message-content p {
                    margin: 8px 0;
                }
                
                .ea-chat-message-content ul,
                .ea-chat-message-content ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                
                .ea-chat-message-content li {
                    margin: 4px 0;
                }
                
                .ea-chat-message-content code {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                }
                
                .ea-chat-message-content pre {
                    background: #1e293b;
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    border-radius: 6px;
                    padding: 12px;
                    overflow-x: auto;
                    margin: 12px 0;
                }
                
                .ea-chat-message-content pre code {
                    background: none;
                    padding: 0;
                }
                
                .ea-chat-message-content a {
                    color: #60a5fa;
                    text-decoration: underline;
                }
                
                .ea-chat-message-content a:hover {
                    color: #93c5fd;
                }
                
                .ea-chat-message-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12px 0;
                }
                
                .ea-chat-message-content th,
                .ea-chat-message-content td {
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    padding: 8px;
                    text-align: left;
                }
                
                .ea-chat-message-content th {
                    background: rgba(0, 0, 0, 0.2);
                    font-weight: 600;
                }
                
                /* Streaming indicator */
                .ea-chat-streaming {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: #3b82f6;
                    border-radius: 50%;
                    animation: pulse 1.5s ease-in-out infinite;
                    margin-left: 8px;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                
                /* Quick Actions */
                .ea-chat-quick-actions {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    padding: 12px 20px;
                    border-top: 1px solid rgba(148, 163, 184, 0.1);
                    background: rgba(30, 41, 59, 0.5);
                }
                
                .ea-chat-quick-btn {
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    color: #93c5fd;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                
                .ea-chat-quick-btn:hover {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.4);
                    transform: translateY(-1px);
                }
                
                /* Input Area */
                .ea-chat-input-container {
                    display: flex;
                    gap: 10px;
                    padding: 16px 20px;
                    background: rgba(30, 41, 59, 0.95);
                    border-top: 1px solid rgba(148, 163, 184, 0.1);
                }
                
                .ea-chat-input {
                    flex: 1;
                    background: #1e293b;
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    color: #f1f5f9;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 14px;
                    resize: none;
                    max-height: 120px;
                    font-family: inherit;
                }
                
                .ea-chat-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .ea-chat-input::placeholder {
                    color: #64748b;
                }
                
                .ea-chat-send-btn {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 16px;
                }
                
                .ea-chat-send-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                
                .ea-chat-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .ea-chat-send-btn .fa-spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    setupEventListeners() {
        const panel = document.getElementById(this.panelId);
        const header = panel.querySelector('.ea-chat-header');
        const resizeHandle = panel.querySelector('.ea-chat-resize-handle');
        const input = panel.querySelector('.ea-chat-input');
        
        // Dragging
        header.addEventListener('mousedown', (e) => this.startDrag(e));
        
        // Resizing
        resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        
        // Input auto-resize and enter to send
        input.addEventListener('input', (e) => this.autoResizeInput(e.target));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Global mouse events
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    startDrag(e) {
        if (e.target.closest('.ea-chat-controls')) return;
        
        this.isDragging = true;
        this.dragOffset = {
            x: e.clientX - this.position.x,
            y: e.clientY - this.position.y
        };
        
        const panel = document.getElementById(this.panelId);
        panel.style.cursor = 'move';
    }
    
    startResize(e) {
        e.preventDefault();
        this.isResizing = true;
        this.resizeStartX = e.clientX;
        this.resizeStartWidth = this.width;
        
        const handle = document.querySelector('.ea-chat-resize-handle');
        handle.classList.add('resizing');
    }
    
    handleMouseMove(e) {
        const panel = document.getElementById(this.panelId);
        
        if (this.isDragging) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            
            // Constrain to viewport
            this.position.x = Math.max(0, Math.min(newX, window.innerWidth - this.width));
            this.position.y = Math.max(0, Math.min(newY, window.innerHeight - this.minHeight));
            
            panel.style.left = `${this.position.x}px`;
            panel.style.top = `${this.position.y}px`;
        }
        
        if (this.isResizing) {
            const delta = this.resizeStartX - e.clientX;
            const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, this.resizeStartWidth + delta));
            
            this.width = newWidth;
            panel.style.width = `${newWidth}px`;
            
            // Adjust position to keep right edge in place
            this.position.x = Math.max(0, this.position.x - (newWidth - this.resizeStartWidth));
            panel.style.left = `${this.position.x}px`;
        }
    }
    
    handleMouseUp(e) {
        if (this.isDragging || this.isResizing) {
            this.saveState();
        }
        
        this.isDragging = false;
        this.isResizing = false;
        
        const panel = document.getElementById(this.panelId);
        panel.style.cursor = '';
        
        const handle = document.querySelector('.ea-chat-resize-handle');
        if (handle) handle.classList.remove('resizing');
    }
    
    autoResizeInput(input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }
    
    open() {
        this.isOpen = true;
        const panel = document.getElementById(this.panelId);
        panel.style.display = 'flex';
        this.updateContext();
        this.updateQuickActions();
    }
    
    close() {
        this.isOpen = false;
        const panel = document.getElementById(this.panelId);
        panel.style.display = 'none';
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    minimize() {
        // Implement minimize logic (could hide and show a small indicator)
        this.close();
    }
    
    updateContext() {
        const context = this.contextProvider();
        const contextEl = document.getElementById(`${this.panelId}-context`);
        contextEl.textContent = context.summary || 'Context loaded';
    }
    
    updateQuickActions() {
        const context = this.contextProvider();
        const actionsContainer = document.getElementById(`${this.panelId}-quick-actions`);
        
        if (context.quickActions && context.quickActions.length > 0) {
            actionsContainer.innerHTML = context.quickActions.map(action => 
                `<button class="ea-chat-quick-btn" onclick="eaChat.sendQuickAction('${action.prompt.replace(/'/g, "\\'")}')">
                    <i class="fas ${action.icon}"></i> ${action.label}
                </button>`
            ).join('');
        }
    }
    
    async sendMessage() {
        const input = document.getElementById(`${this.panelId}-input`);
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        this.autoResizeInput(input);
        
        // Show loading state
        const sendBtn = document.getElementById(`${this.panelId}-send`);
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        sendBtn.disabled = true;
        
        try {
            const context = this.contextProvider();
            
            // Build instructions with context
            const instructions = `${this.systemPrompt}

Current Context:
${JSON.stringify(context, null, 2)}`;
            
            // Call AI with Responses API
            const response = await AzureOpenAIProxy.create(message, {
                instructions: instructions
            });
            
            // Extract and display response
            const aiMessage = response.output_text || response.text || 'No response received';
            this.addMessage(aiMessage, 'ai');
            
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage('⚠️ Unable to connect to AI service. Please check your connection and try again.', 'ai');
        } finally {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }
    }
    
    sendQuickAction(prompt) {
        const input = document.getElementById(`${this.panelId}-input`);
        input.value = prompt;
        this.sendMessage();
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById(`${this.panelId}-messages`);
        
        // Remove welcome message if exists
        const welcome = messagesContainer.querySelector('.ea-chat-welcome');
        if (welcome) welcome.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ea-chat-message ${sender}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Render markdown for AI messages
        const content = sender === 'ai' ? this.md.render(text) : text;
        
        messageDiv.innerHTML = `
            <div class="ea-chat-message-content">${content}</div>
            <div class="ea-chat-message-time">${sender === 'user' ? 'You' : 'AI'} - ${timeStr}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ text, sender, timestamp: now.toISOString() });
    }
    
    clearConversation() {
        if (!confirm('Clear the conversation history?')) return;
        
        this.messages = [];
        const messagesContainer = document.getElementById(`${this.panelId}-messages`);
        messagesContainer.innerHTML = `
            <div class="ea-chat-welcome">
                <i class="fas ${this.icon}" style="font-size: 48px; color: #3b82f6; margin-bottom: 16px;"></i>
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Welcome to ${this.title}</h3>
                <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Ask me anything about your current work or use quick actions below.</p>
            </div>
        `;
    }
    
    saveState() {
        const state = {
            position: this.position,
            width: this.width
        };
        localStorage.setItem(`${this.panelId}_state`, JSON.stringify(state));
    }
}

// Global instance (will be initialized by each page)
let eaChat = null;
