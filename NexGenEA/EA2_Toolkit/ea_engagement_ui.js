/**
 * ea_engagement_ui.js
 * UI functions for multi-engagement management
 * Handles engagement selector, switcher, and creation modals
 * 
 * @version 1.0
 * @date 2026-04-17
 */

// ═══════════════════════════════════════════════════════════════════
// ENGAGEMENT MANAGER UI
// ═══════════════════════════════════════════════════════════════════

function openEngagementManager() {
    refreshEngagementList();
    document.getElementById('engagementManagerModal').classList.remove('hidden');
}

function closeEngagementManager() {
    document.getElementById('engagementManagerModal').classList.add('hidden');
}

function refreshEngagementList() {
    const container = document.getElementById('engagement-list-container');
    const engagements = engagementManager.listEngagements();
    
    if (engagements.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon"><i class="fas fa-folder-open"></i></div>
                <div class="empty-state-title">No engagements found</div>
                <div class="empty-state-text">Create your first engagement to get started</div>
            </div>
        `;
        return;
    }
    
    const currentId = engagementManager.currentEngagementId;
    
    container.innerHTML = engagements.map(eng => {
        const isActive = eng.id === currentId;
        const completenessClass = eng.completeness >= 75 ? 'level-high' : 
                                 eng.completeness >= 40 ? 'level-medium' : 'level-low';
        const lastUpdated = new Date(eng.updatedAt).toLocaleDateString();
        
        return `
            <div class="engagement-list-item ${isActive ? 'active' : ''}" onclick="switchEngagement('${eng.id}')">
                <div class="engagement-item-info">
                    <div class="engagement-item-name">${eng.name}</div>
                    <div class="engagement-item-meta">
                        <span><i class="fas fa-tag"></i> ${eng.segment}</span>
                        <span><i class="fas fa-signal"></i> <span class="${completenessClass}">${eng.completeness}%</span></span>
                        <span><i class="fas fa-clock"></i> ${lastUpdated}</span>
                    </div>
                </div>
                <div class="engagement-item-actions" onclick="event.stopPropagation()">
                    ${!isActive ? `<button class="btn btn-ghost btn-sm" onclick="deleteEngagement('${eng.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>` : '<span style="color: #10b981; font-size: 12px; font-weight: 600;">ACTIVE</span>'}
                </div>
            </div>
        `;
    }).join('');
}

function switchEngagement(engagementId) {
    // Auto-save current before switching
    if (currentEngagement) {
        saveEngagement();
    }
    
    // Load new engagement
    const model = engagementManager.loadEngagement(engagementId);
    if (model) {
        currentEngagement = model;
        engagementManager.setCurrentEngagement(engagementId);
        
        // Update UI
        updateEngagementSelector();
        loadEngagementData();
        closeEngagementManager();
        
        showToast('Engagement Loaded', `Switched to: ${model.engagement.name}`, 'success');
    }
}

function deleteEngagement(engagementId) {
    const model = engagementManager.loadEngagement(engagementId);
    if (!model) return;
    
    const confirmMsg = `Delete engagement "${model.engagement.name}"? This cannot be undone.`;
    if (confirm(confirmMsg)) {
        engagementManager.deleteEngagement(engagementId);
        refreshEngagementList();
        showToast('Engagement Deleted', 'The engagement has been removed', 'info');
    }
}

// ═══════════════════════════════════════════════════════════════════
// NEW ENGAGEMENT MODAL
// ═══════════════════════════════════════════════════════════════════

function openNewEngagementModal() {
    document.getElementById('newEngagementModal').classList.remove('hidden');
    // Clear form
    document.getElementById('new-engagement-id').value = '';
    document.getElementById('new-engagement-name').value = '';
    document.getElementById('new-engagement-segment').value = '';
    document.getElementById('new-engagement-theme').value = '';
}

function closeNewEngagementModal() {
    document.getElementById('newEngagementModal').classList.add('hidden');
}

function createNewEngagementFromModal() {
    const id = document.getElementById('new-engagement-id').value.trim();
    const name = document.getElementById('new-engagement-name').value.trim();
    const segment = document.getElementById('new-engagement-segment').value;
    const theme = document.getElementById('new-engagement-theme').value.trim();
    
    // Validation
    if (!id || !name || !segment || !theme) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    // Check ID format
    const idPattern = /^[A-Z]{3}-[A-Z]{3}-\d{4}Q\d-\d{3}$/;
    if (!idPattern.test(id)) {
        showToast('Validation Error', 'Invalid ID format. Use: SEG-XXX-YYYYQQ-NNN', 'error');
        return;
    }
    
    // Create engagement
    try {
        const engagementId = engagementManager.createEngagement({
            id,
            name,
            segment,
            theme,
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            forum: '',
            reviewCadence: '',
            successCriteria: []
        });
        
        // Load the new engagement
        const model = engagementManager.getCurrentEngagement();
        currentEngagement = model;
        
        // Update UI
        updateEngagementSelector();
        loadEngagementData();
        closeNewEngagementModal();
        
        showToast('Engagement Created', `"${name}" is now active`, 'success');
    } catch (error) {
        console.error('Error creating engagement:', error);
        showToast('Creation Error', error.message || 'Failed to create engagement', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// ENGAGEMENT DATA LOADING
// ═══════════════════════════════════════════════════════════════════

function updateEngagementSelector() {
    const selector = document.getElementById('current-engagement-name');
    if (currentEngagement) {
        selector.innerHTML = `
            <span>${currentEngagement.engagement.name}</span>
            <i class="fas fa-chevron-down" style="font-size: 10px;"></i>
        `;
    } else {
        selector.innerHTML = `
            <span>No engagement</span>
            <i class="fas fa-chevron-down" style="font-size: 10px;"></i>
        `;
    }
}

function loadEngagementData() {
    if (!currentEngagement) return;
    
    const eng = currentEngagement.engagement;
    
    // Populate Canvas 1 fields
    document.getElementById('engagement-id').value = eng.id || '';
    document.getElementById('engagement-name').value = eng.name || '';
    document.getElementById('engagement-segment').value = eng.segment || '';
    document.getElementById('engagement-start').value = eng.startDate || '';
    document.getElementById('engagement-end').value = eng.endDate || '';
    document.getElementById('engagement-status').value = eng.status || 'active';
    document.getElementById('engagement-theme').value = eng.theme || '';
    document.getElementById('engagement-forum').value = eng.forum || '';
    document.getElementById('engagement-review').value = eng.reviewCadence || '';
    document.getElementById('engagement-criteria').value = (eng.successCriteria || []).join('\n');
    
    // Refresh all canvases
    renderStakeholders();
    renderApplications();
    renderWhitespace();
    renderTarget();
    renderRoadmap();
    renderLeadership();
    updateKPIs();
}

// ═══════════════════════════════════════════════════════════════════
// AUTO-LOAD LATEST ENGAGEMENT
// ═══════════════════════════════════════════════════════════════════

function autoLoadLatestEngagement() {
    // Try to load most recent engagement
    const engagements = engagementManager.listEngagements();
    if (engagements.length > 0) {
        // Sort by updated date, most recent first
        engagements.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        // Load most recent or current
        const currentId = localStorage.getItem('ea_engagement_current');
        const toLoad = currentId || engagements[0].id;
        
        const model = engagementManager.loadEngagement(toLoad);
        if (model) {
            currentEngagement = model;
            updateEngagementSelector();
            loadEngagementData();
            console.log('✓ Loaded engagement:', toLoad);
            return true;
        }
    }
    return false;
}

console.log('✓ EA Engagement UI loaded');
