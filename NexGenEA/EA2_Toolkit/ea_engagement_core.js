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
    
    // Render content for tab
    renderTabContent(tabName);
}

function renderTabContent(tabName) {
    switch(tabName) {
        case 'setup':
            // Canvas 1 already populated on load
            break;
        case 'stakeholders':
            renderStakeholders();
            break;
        case 'portfolio':
            renderApplications();
            break;
        case 'whitespace':
            renderWhitespace();
            break;
        case 'target':
            renderTarget();
            break;
        case 'roadmap':
            renderRoadmap();
            break;
        case 'leadership':
            renderLeadership();
            break;
    }
}

// ═══════════════════════════════════════════════════════════════════
// AI CHAT PANEL
// ═══════════════════════════════════════════════════════════════════

function toggleChatPanel() {
    document.body.classList.toggle('chat-sidebar-open');
    const btn = document.getElementById('toggle-chat-btn');
    if (document.body.classList.contains('chat-sidebar-open')) {
        btn.style.background = 'rgba(255,255,255,0.25)';
    } else {
        btn.style.background = 'rgba(255,255,255,0.1)';
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
        // Call AI via AzureOpenAIProxy
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
    textDiv.textContent = content;
    
    msgDiv.appendChild(icon);
    msgDiv.appendChild(textDiv);
    chatMessages.appendChild(msgDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Quick action buttons
function quickAnalyzeStakeholders() {
    document.getElementById('chat-input').value = 'Analyze my stakeholder landscape and suggest engagement strategies';
    sendChatMessage();
}

function quickGapAnalysis() {
    document.getElementById('chat-input').value = 'Identify critical capability gaps and recommend priorities';
    sendChatMessage();
}

function quickRoadmapAdvice() {
    document.getElementById('chat-input').value = 'Review my roadmap and suggest improvements or missing initiatives';
    sendChatMessage();
}

function quickRiskAssessment() {
    document.getElementById('chat-input').value = 'Assess risks in my current application portfolio and modernization plan';
    sendChatMessage();
}

console.log('✓ EA Engagement Core loaded');
