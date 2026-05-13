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
    let engagements = engagementManager.listEngagements();
    
    // FILTER: Show only engagement for current account (1:1 rule: one account = one engagement)
    if (window.currentAccountContext) {
        const accountId = window.currentAccountContext.id;
        engagements = engagements.filter(eng => eng.accountId === accountId);
        console.log(`Filtered engagements for account ${accountId}: ${engagements.length} found`);
    }
    
    if (engagements.length === 0) {
        const message = window.currentAccountContext 
            ? `No engagement found for ${window.currentAccountContext.name}` 
            : 'No engagements found';
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon"><i class="fas fa-folder-open"></i></div>
                <div class="empty-state-title">${message}</div>
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
    
    // Auto-populate from active account if available
    if (window.currentAccountContext) {
        const account = window.currentAccountContext;
        
        // Set CRM Customer ID (use account ID)
        document.getElementById('new-engagement-crm-id').value = account.id || '';
        
        // Fill in account details
        document.getElementById('new-engagement-customer-name').value = account.name || '';
        document.getElementById('new-engagement-segment').value = account.industry || '';
        document.getElementById('new-engagement-theme').value = account.strategicPriorities?.[0] || '';
        
        // Generate suggested Engagement ID
        const segmentCode = (account.industry || 'GEN').substring(0, 3).toUpperCase();
        const quarter = `${new Date().getFullYear()}Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
        const count = engagementManager.listEngagements().length + 1;
        const suggestedId = `SEG-${segmentCode}-${quarter}-${String(count).padStart(3, '0')}`;
        document.getElementById('new-engagement-id').value = suggestedId;
        
        console.log(`✓ Pre-populated form from account: ${account.name}`);
    } else {
        // Clear form if no account context
        document.getElementById('new-engagement-crm-id').value = '';
        document.getElementById('new-engagement-id').value = '';
        document.getElementById('new-engagement-name').value = '';
        document.getElementById('new-engagement-customer-name').value = '';
        document.getElementById('new-engagement-segment').value = '';
        document.getElementById('new-engagement-theme').value = '';
    }
}

function closeNewEngagementModal() {
    document.getElementById('newEngagementModal').classList.add('hidden');
}

function createNewEngagementFromModal() {
    const crmId = document.getElementById('new-engagement-crm-id').value.trim();
    const id = document.getElementById('new-engagement-id').value.trim();
    const name = document.getElementById('new-engagement-name').value.trim();
    const customerName = document.getElementById('new-engagement-customer-name').value.trim();
    const segment = document.getElementById('new-engagement-segment').value;
    const theme = document.getElementById('new-engagement-theme').value.trim();
    
    // Validation - Only CRM ID, Engagement ID, and Engagement Name are mandatory
    if (!crmId || !id || !name) {
        showToast('Validation Error', 'CRM Customer ID, Engagement ID, and Engagement Name are required', 'error');
        return;
    }
    
    // Check ID format (optional - can be relaxed if needed)
    const idPattern = /^[A-Z]{3}-[A-Z]{3}-\d{4}Q\d-\d{3}$/;
    if (!idPattern.test(id)) {
        showToast('Validation Warning', 'ID format recommended: SEG-XXX-YYYYQQ-NNN', 'warning');
        // Continue anyway - not blocking
    }
    
    // ENFORCE 1:1 RULE: Check if engagement already exists for this account
    let targetAccountId = null;
    if (window.pendingAccountLink) {
        targetAccountId = window.pendingAccountLink;
    } else if (window.currentAccountContext) {
        targetAccountId = window.currentAccountContext.id;
    }
    
    if (targetAccountId) {
        const existingEngagement = findEngagementByAccountId(targetAccountId);
        if (existingEngagement) {
            const accountName = window.currentAccountContext?.name || targetAccountId;
            showToast('Engagement Exists', `Account "${accountName}" already has an engagement: "${existingEngagement.name}". One account can have only one engagement.`, 'error');
            return;
        }
    }
    
    // Create engagement data object
    const engagementData = {
        id,
        name,
        crmCustomerId: crmId,  // NEW: Store CRM Customer ID
        customerName: customerName || '',
        segment: segment || '',
        theme: theme || '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        forum: '',
        reviewCadence: '',
        successCriteria: []
    };
    
    // Link to account if coming from Growth Dashboard
    if (window.pendingAccountLink) {
        engagementData.accountId = window.pendingAccountLink;
        console.log(`✓ Linking engagement to account: ${window.pendingAccountLink}`);
        
        // Import account stakeholders if available
        if (window.accountManager && window.currentAccountContext) {
            const account = window.currentAccountContext;
            if (account.stakeholders && account.stakeholders.length > 0) {
                console.log(`✓ Will import ${account.stakeholders.length} stakeholders from account`);
            }
        }
    } else if (window.currentAccountContext) {
        // Even without pendingAccountLink, link to current account
        engagementData.accountId = window.currentAccountContext.id;
        console.log(`✓ Linking engagement to current account: ${window.currentAccountContext.id}`);
    }
    
    // Create engagement
    try {
        const engagementId = engagementManager.createEngagement(engagementData);
        
        // Import stakeholders from account if linked
        if (window.currentAccountContext) {
            const account = window.currentAccountContext;
            if (account.stakeholders && account.stakeholders.length > 0) {
                account.stakeholders.forEach(sh => {
                    engagementManager.addEntity('stakeholders', {
                        name: sh.name,
                        role: sh.role || 'Stakeholder',
                        influence: sh.influence || 'medium',
                        sentiment: sh.sentiment || 'neutral',
                        concerns: sh.concerns || [],
                        linkedApplications: []
                    });
                });
                console.log(`✓ Imported ${account.stakeholders.length} stakeholders`);
            }
        }
        
        // Load the new engagement
        const model = engagementManager.getCurrentEngagement();
        currentEngagement = model;
        
        // Clear pending link
        window.pendingAccountLink = null;
        
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
    if (!currentEngagement) {
        // No engagement loaded, but populate from account context if available
        if (window.currentAccountContext) {
            populateFormFromAccount(window.currentAccountContext);
        }
        return;
    }
    
    const eng = currentEngagement.engagement;
    
    // Populate Overview tab fields from engagement
    document.getElementById('engagement-crm-id').value = eng.crmCustomerId || eng.accountId || '';
    document.getElementById('engagement-id').value = eng.id || '';
    document.getElementById('engagement-name').value = eng.name || '';
    document.getElementById('engagement-customer-name').value = eng.customerName || '';
    document.getElementById('engagement-segment').value = eng.segment || '';
    document.getElementById('engagement-theme').value = eng.theme || '';
    document.getElementById('engagement-cadence').value = eng.cadence || '2w';
    document.getElementById('engagement-forum').value = eng.forum || '';
    document.getElementById('engagement-review').value = eng.reviewCadence || '';
    document.getElementById('engagement-criteria').value = (eng.successCriteria || []).join('\n');
    
    // If engagement has accountId but fields are empty, fill from account
    if (eng.accountId && window.accountManager) {
        const account = window.accountManager.getAccount(eng.accountId);
        if (account) {
            if (!eng.customerName) document.getElementById('engagement-customer-name').value = account.name;
            if (!eng.segment) document.getElementById('engagement-segment').value = account.industry || '';
            if (!eng.crmCustomerId) document.getElementById('engagement-crm-id').value = account.id;
        }
    }
    
    // Refresh all canvases
    renderStakeholders();
    renderApplications();
    renderWhiteSpotHeatmap();
    renderTarget();
    renderRoadmap();
    renderLeadership();
    updateKPIs();
}

// Helper function to populate form from account when no engagement loaded
function populateFormFromAccount(account) {
    if (!account) return;
    
    console.log(`Populating form from account: ${account.name}`);
    
    // Populate form fields from account data
    document.getElementById('engagement-crm-id').value = account.id || '';
    document.getElementById('engagement-customer-name').value = account.name || '';
    document.getElementById('engagement-segment').value = account.industry || '';
    
    // Leave other fields empty for user to fill
    document.getElementById('engagement-id').value = '';
    document.getElementById('engagement-name').value = '';
    document.getElementById('engagement-theme').value = account.strategicPriorities?.[0] || '';
    document.getElementById('engagement-cadence').value = '2w';
    document.getElementById('engagement-forum').value = '';
    document.getElementById('engagement-review').value = '';
    document.getElementById('engagement-criteria').value = '';
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
