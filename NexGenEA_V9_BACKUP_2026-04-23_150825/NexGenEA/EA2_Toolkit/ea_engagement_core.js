/**
 * ea_engagement_core.js
 * Core UI functions that need to be available immediately
 * Must be loaded before HTML body for inline onclick handlers
 * 
 * @version 1.0
 * @date 2026-04-17
 */

// ═══════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════

let currentEngagement = null;

// ═══════════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function switchTab(tabName, btn) {
    // Hide all sections
    document.querySelectorAll('.section-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected section
    document.getElementById('view-' + tabName).classList.add('active');
    btn.classList.add('active');
    
    // Render content for tab (async rendering for tabs that need it)
    renderTabContent(tabName);
    
    // Update AI context (sidebar adapts to new tab)
    if (typeof updateAIContext === 'function') {
        setTimeout(() => updateAIContext(), 100);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SUB-TAB NAVIGATION (Canvas 1: Engagement Setup)
// ═══════════════════════════════════════════════════════════════════

function switchSubTab(subtabName) {
    // Hide all sub-tab contents
    document.querySelectorAll('.sub-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-tab').forEach(btn => btn.classList.remove('active'));
    
    // Show selected sub-tab
    const targetContent = document.getElementById('subtab-' + subtabName);
    const targetButton = event.target.closest('.sub-tab');
    
    if (targetContent) targetContent.classList.add('active');
    if (targetButton) targetButton.classList.add('active');
    
    // Trigger renders for specific sub-tabs
    if (subtabName === 'governance') {
        if (typeof renderDecisions === 'function') renderDecisions();
        if (typeof renderConstraints === 'function') renderConstraints();
        if (typeof renderAssumptions === 'function') renderAssumptions();
    } else if (subtabName === 'execution') {
        if (typeof renderPhases === 'function') renderPhases();
        if (typeof renderStories === 'function') renderStories();
    }
}

async function renderTabContent(tabName) {
    switch(tabName) {
        case 'engagement':
            // Canvas 1 already populated on load
            if (typeof renderDecisions === 'function') renderDecisions();
            if (typeof renderConstraints === 'function') renderConstraints();
            if (typeof renderAssumptions === 'function') renderAssumptions();
            if (typeof renderPhases === 'function') renderPhases();
            if (typeof renderStories === 'function') renderStories();
            break;
        case 'stakeholders':
            renderStakeholders();
            break;
        case 'portfolio':
            renderApplications();
            break;
        case 'whitespace':
            // WhiteSpot Heatmap requires async loading - await completion
            if (typeof renderWhiteSpotHeatmap === 'function') {
                await renderWhiteSpotHeatmap();
            }
            break;
        case 'target':
            renderTarget();
            break;
        case 'roadmap':
            renderRoadmap();
            if (typeof renderRoadmapTimeline === 'function') renderRoadmapTimeline();
            break;
        case 'leadership':
            renderLeadership();
            break;
    }
}

// ═══════════════════════════════════════════════════════════════════
// AI CHAT PANEL (Context-Aware with EA_AIAssistant)
// ═══════════════════════════════════════════════════════════════════

function toggleChatPanel() {
    document.body.classList.toggle('chat-sidebar-open');
    const btn = document.getElementById('toggle-chat-btn');
    if (document.body.classList.contains('chat-sidebar-open')) {
        btn.style.background = 'rgba(255,255,255,0.25)';
        // Update AI context when sidebar opens
        updateAIContext();
    } else {
        btn.style.background = 'rgba(255,255,255,0.1)';
    }
}

/**
 * Update AI assistant context and UI elements
 */
function updateAIContext() {
    if (typeof window.EAAIAssistant === 'undefined') {
        console.warn('EAAIAssistant not initialized yet');
        return;
    }
    
    try {
        // Detect current context
        const context = window.EAAIAssistant.detectContext();
        
        // Update context indicator
        const contextIndicator = document.getElementById('ai-context-indicator');
        if (contextIndicator) {
            const stepLabel = window.EAAIAssistant.getStepLabel(context.currentStep);
            contextIndicator.innerHTML = `<i class="fas fa-map-marker-alt"></i> Helping with: ${stepLabel}`;
        }
        
        // Update suggested prompts
        const suggestedPrompts = window.EAAIAssistant.getSuggestedPrompts(context);
        renderSuggestedPrompts(suggestedPrompts);
        
        // Update integration status badges (if element exists)
        updateIntegrationBadges(context.integrations);
        
    } catch (error) {
        console.error('Error updating AI context:', error);
    }
}

/**
 * Render suggested prompts as clickable buttons
 */
function renderSuggestedPrompts(prompts) {
    const container = document.getElementById('suggested-prompts');
    if (!container) return;
    
    if (!prompts || prompts.length === 0) {
        container.innerHTML = '<p style="font-size:12px;color:#999;">No suggestions available</p>';
        return;
    }
    
    container.innerHTML = prompts.map(p => `
        <button class="suggested-prompt" onclick="applySuggestedPrompt('${p.command}')" title="${p.text}">
            <span class="prompt-icon">${p.icon}</span>
            <span class="prompt-text">${p.text}</span>
        </button>
    `).join('');
}

/**
 * Update integration status badges
 */
function updateIntegrationBadges(integrations) {
    const container = document.getElementById('integration-badges');
    if (!container) return;
    
    const badges = [];
    
    if (integrations.apqc?.status === 'connected') {
        badges.push('<span class="integration-badge connected" title="APQC Framework Connected">📚 APQC</span>');
    }
    if (integrations.apm?.status === 'connected') {
        badges.push('<span class="integration-badge connected" title="APM Toolkit Connected">📱 APM</span>');
    }
    if (integrations.bmc?.status === 'connected') {
        badges.push('<span class="integration-badge connected" title="BMC Toolkit Connected">💼 BMC</span>');
    }
    if (integrations.capability?.status === 'connected') {
        badges.push('<span class="integration-badge connected" title="Capability Map Connected">🗺️ Capability</span>');
    }
    
    container.innerHTML = badges.length > 0 ? badges.join(' ') : '<span style="font-size:11px;color:#999;">No integrations</span>';
}

/**
 * Apply suggested prompt (user clicked on quick action)
 */
function applySuggestedPrompt(command) {
    const commandMap = {
        'scope': 'Help me define engagement scope',
        'timeline': 'Generate timeline estimate',
        'resources': 'Suggest resource allocation',
        'identify_stakeholders': 'Identify key stakeholders for this engagement',
        'influence_map': 'Map stakeholder influence and power dynamics',
        'import_bmc': 'Import stakeholders from Business Model Canvas',
        'gaps': 'Identify capability gaps in my current state',
        'prioritize': 'Prioritize white-spots by strategic impact',
        'apqc_benchmarks': 'Load APQC benchmarks for my industry',
        'connect_apqc': 'How do I connect the APQC framework?',
        'sequence': 'Sequence my initiatives in the optimal order',
        'dependencies': 'Identify dependencies between initiatives',
        'quickwins': 'Find quick wins for the first 90 days',
        'analyze_portfolio': 'Analyze my application portfolio',
        'sunset': 'Identify sunset candidates in my portfolio',
        'modernize': 'What are my top modernization priorities?',
        'import_apm': 'Import applications from APM Toolkit',
        'next_steps': 'What should I do next?',
        'insights': 'Show me insights from my engagement data'
    };
    
    const message = commandMap[command] || command;
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = message;
        sendChatMessage();
    }
}

// Keyboard shortcut Ctrl+K to toggle chat
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleChatPanel();
    }
});

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show loading state
    const sendBtn = document.getElementById('send-chat');
    const originalHTML = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner spinner"></i>';
    sendBtn.disabled = true;
    
    try {
        // Use new EA_AIAssistant if available
        if (typeof window.EAAIAssistant !== 'undefined') {
            const response = await window.EAAIAssistant.chat(message);
            addChatMessage(response, 'assistant');
            
            // Update context after interaction (suggested prompts may change)
            updateAIContext();
        } else {
            // Fallback to direct AzureOpenAIProxy call
            console.warn('EAAIAssistant not available, using fallback mode');
            
            const context = {
                engagement: currentEngagement,
                stakeholders: currentEngagement?.stakeholders || [],
                applications: currentEngagement?.applications || [],
                initiatives: currentEngagement?.initiatives || []
            };
            
            const systemPrompt = `You are an Enterprise Architecture advisor helping with an EA engagement. 
Current engagement: ${currentEngagement?.engagement?.name || 'None'}
Segment: ${currentEngagement?.engagement?.segment || 'Unknown'}
Theme: ${currentEngagement?.engagement?.theme || 'Unknown'}

Provide concise, actionable advice on EA best practices, stakeholder management, application modernization, and roadmap planning.`;

            const response = await window.AzureOpenAIProxy.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ], {
                taskType: 'analysis',
                includeReasoning: false
            });
            
            addChatMessage(response.content, 'assistant');
        }
    } catch (error) {
        console.error('AI Error:', error);
        addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
        sendBtn.innerHTML = originalHTML;
        sendBtn.disabled = false;
    }
}

function addChatMessage(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message ' + role;
    
    const icon = document.createElement('div');
    icon.className = 'chat-message-icon';
    icon.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'chat-message-text';
    
    // Support markdown-like formatting for AI responses
    if (role === 'assistant') {
        // Convert markdown-style formatting to HTML
        let formattedContent = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
            .replace(/`(.+?)`/g, '<code>$1</code>') // Inline code
            .replace(/\n\n/g, '<br><br>') // Paragraph breaks
            .replace(/\n/g, '<br>'); // Line breaks
        textDiv.innerHTML = formattedContent;
    } else {
        textDiv.textContent = content;
    }
    
    msgDiv.appendChild(icon);
    msgDiv.appendChild(textDiv);
    chatMessages.appendChild(msgDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Quick action buttons (legacy support - now use suggested prompts)
function quickAnalyzeStakeholders() {
    applySuggestedPrompt('identify_stakeholders');
}

function quickGapAnalysis() {
    applySuggestedPrompt('gaps');
}

function quickRoadmapAdvice() {
    applySuggestedPrompt('sequence');
}

// New context-aware quick actions
function start5QuestionAnalysis() {
    if (typeof window.EAAIAssistant === 'undefined') {
        addChatMessage('AI Assistant not initialized. Please refresh the page.', 'assistant');
        return;
    }
    
    const context = window.EAAIAssistant.detectContext();
    const message = `I need help with ${window.EAAIAssistant.getStepLabel(context.currentStep)}. Please ask me up to 5 questions to gather the information you need, then provide a comprehensive recommendation.`;
    
    document.getElementById('chat-input').value = message;
    sendChatMessage();
}

function clearChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    if (typeof window.EAAIAssistant !== 'undefined') {
        window.EAAIAssistant.clearHistory();
    }
    
    addChatMessage('Chat history cleared. How can I help you?', 'assistant');
}

function quickRiskAssessment() {
    document.getElementById('chat-input').value = 'Assess risks in my current application portfolio and modernization plan';
    sendChatMessage();
}

console.log('✓ EA Engagement Core loaded');
