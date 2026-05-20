/**
 * EA Engagement Playbook - Canvas Implementations (Phase 3)
 * Complete implementation of all 5 canvases with modals and rendering
 * @version 1.0 - Phase 3 Complete
 * @date 2026-04-17
 */

// ═══════════════════════════════════════════════════════════════════
// CANVAS 2: STAKEHOLDER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openStakeholderModal(id = null) {
    document.getElementById('stakeholder-edit-id').value = id || '';
    
    if (id) {
        const stakeholder = engagementManager.getEntity('stakeholders', id);
        if (stakeholder) {
            document.getElementById('stakeholder-modal-title').textContent = 'Edit Stakeholder';
            document.getElementById('stakeholder-name').value = stakeholder.name || '';
            document.getElementById('stakeholder-role').value = stakeholder.role || '';
            document.getElementById('stakeholder-orgunit').value = stakeholder.orgUnit || '';
            document.getElementById('stakeholder-influence').value = stakeholder.influence || 'medium';
            document.getElementById('stakeholder-power').value = stakeholder.decisionPower || 'medium';
            document.getElementById('stakeholder-priorities').value = (stakeholder.priorities || []).join('\n');
        }
    } else {
        document.getElementById('stakeholder-modal-title').textContent = 'Add Stakeholder';
        document.getElementById('stakeholder-name').value = '';
        document.getElementById('stakeholder-role').value = '';
        document.getElementById('stakeholder-orgunit').value = '';
        document.getElementById('stakeholder-influence').value = 'medium';
        document.getElementById('stakeholder-power').value = 'medium';
        document.getElementById('stakeholder-priorities').value = '';
    }
    
    document.getElementById('stakeholderModal').classList.remove('hidden');
}

function closeStakeholderModal() {
    document.getElementById('stakeholderModal').classList.add('hidden');
}

function saveStakeholder() {
    const id = document.getElementById('stakeholder-edit-id').value;
    const name = document.getElementById('stakeholder-name').value;
    const role = document.getElementById('stakeholder-role').value;
    const orgUnit = document.getElementById('stakeholder-orgunit').value;
    const influence = document.getElementById('stakeholder-influence').value;
    const decisionPower = document.getElementById('stakeholder-power').value;
    const prioritiesText = document.getElementById('stakeholder-priorities').value;
    const priorities = prioritiesText.split('\n').filter(p => p.trim()).map(p => p.trim());
    
    if (!name || !role) {
        showToast('Validation Error', 'Please fill in name and role', 'error');
        return;
    }
    
    const stakeholder = {
        name, role, orgUnit, influence, decisionPower, priorities,
        interest: 'medium',  // Default values for schema compatibility
        sentiment: 'neutral'
    };
    
    if (id) {
        engagementManager.updateEntity('stakeholders', id, stakeholder);
    } else {
        engagementManager.addEntity('stakeholders', stakeholder);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeStakeholderModal();
    renderStakeholders();
    updateKPIs();
    
    showToast('Stakeholder Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderStakeholders() {
    const stakeholders = engagementManager.getEntities('stakeholders') || [];
    const container = document.getElementById('stakeholders-container');
    
    // Apply filters
    const searchTerm = document.getElementById('filter-stakeholder')?.value.toLowerCase() || '';
    const influenceFilter = document.getElementById('filter-influence')?.value || '';
    
    const filtered = stakeholders.filter(s => {
        const matchesSearch = !searchTerm || 
            s.name.toLowerCase().includes(searchTerm) ||
            s.role.toLowerCase().includes(searchTerm) ||
            (s.orgUnit && s.orgUnit.toLowerCase().includes(searchTerm));
        const matchesInfluence = !influenceFilter || s.influence === influenceFilter;
        return matchesSearch && matchesInfluence;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <div class="empty-state-title">${stakeholders.length === 0 ? 'No stakeholders defined' : 'No matching stakeholders'}</div>
                <div class="empty-state-text">${stakeholders.length === 0 ? 'Add stakeholders to track influence and decision power' : 'Try adjusting your filters'}</div>
                ${stakeholders.length === 0 ? '<button class="btn btn-primary" onclick="openStakeholderModal()"><i class="fas fa-plus"></i> Add First Stakeholder</button>' : ''}
            </div>
        `;
        return;
    }
    
    const getInfluenceColor = (level) => {
        return level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';
    };
    
    container.innerHTML = filtered.map(s => `
        <div class="entity-card">
            <div class="entity-card-header">
                <div>
                    <div class="entity-card-title">${s.name}</div>
                    <div class="entity-card-subtitle">${s.role}${s.orgUnit ? ' • ' + s.orgUnit : ''}</div>
                </div>
                <button class="btn btn-sm btn-ghost" onclick="openStakeholderModal('${s.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="entity-card-body">
                <div class="entity-metrics">
                    <div class="metric-item">
                        <div class="metric-label">Influence</div>
                        <div class="metric-badge" style="background: ${getInfluenceColor(s.influence)}20; color: ${getInfluenceColor(s.influence)};">
                            ${s.influence}
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Decision Power</div>
                        <div class="metric-badge" style="background: ${getInfluenceColor(s.decisionPower)}20; color: ${getInfluenceColor(s.decisionPower)};">
                            ${s.decisionPower}
                        </div>
                    </div>
                    ${s.priorities && s.priorities.length > 0 ? `
                    <div class="metric-item" style="grid-column: 1 / -1;">
                        <div class="metric-label">Priorities</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                            ${s.priorities.slice(0, 3).map(p => `
                                <span class="tag" style="background: #3b82f620; color: #3b82f6; font-size: 11px; padding: 2px 8px;">
                                    ${p}
                                </span>
                            `).join('')}
                            ${s.priorities.length > 3 ? `<span class="tag" style="background: #6b728020; color: #6b7280; font-size: 11px; padding: 2px 8px;">+${s.priorities.length - 3} more</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 3: APPLICATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openApplicationModal(id = null) {
    document.getElementById('application-edit-id').value = id || '';
    
    if (id) {
        const app = engagementManager.getEntity('applications', id);
        if (app) {
            document.getElementById('application-modal-title').textContent = 'Edit Application';
            // Basic info
            document.getElementById('application-name').value = app.name || '';
            document.getElementById('application-description').value = app.description || '';
            document.getElementById('application-domain').value = app.businessDomain || '';
            document.getElementById('application-owner').value = app.owner || '';
            document.getElementById('application-vendor').value = app.vendor || '';
            document.getElementById('application-technology').value = app.technologyStack || '';
            // Lifecycle & assessment
            document.getElementById('application-lifecycle').value = app.lifecycle || 'active';
            if (document.getElementById('application-action-decision')) {
                document.getElementById('application-action-decision').value = app.action || '';
            }
            document.getElementById('application-action').value = app.rationalizationAction || 'retain';
            document.getElementById('application-risk').value = app.riskLevel || 'medium';
            document.getElementById('application-debt').value = app.technicalDebt || 'medium';
            document.getElementById('application-technical-fit').value = app.technicalFit || '';
            document.getElementById('application-business-value').value = app.businessValue || '';
            // Financial & metrics
            document.getElementById('application-currency').value = app.currency || 'SEK';
            document.getElementById('application-capex').value = app.capex || 0;
            document.getElementById('application-opex').value = app.opex || 0;
            document.getElementById('application-users').value = app.users || 0;
            // AI transformation
            document.getElementById('application-ai-maturity').value = app.aiMaturity || '';
            document.getElementById('application-ai-potential').value = app.aiPotential || 'Medium';
            // Flags & notes
            document.getElementById('application-sunset').checked = app.sunsetCandidate || false;
            document.getElementById('application-modernize').checked = app.modernizationCandidate || false;
            document.getElementById('application-notes').value = app.notes || '';
        }
    } else {
        document.getElementById('application-modal-title').textContent = 'Add Application';
        // Reset all fields to defaults
        document.getElementById('application-name').value = '';
        document.getElementById('application-description').value = '';
        document.getElementById('application-domain').value = '';
        document.getElementById('application-owner').value = '';
        document.getElementById('application-vendor').value = '';
        document.getElementById('application-technology').value = '';
        document.getElementById('application-lifecycle').value = 'active';
        if (document.getElementById('application-action-decision')) {
            document.getElementById('application-action-decision').value = '';
        }
        document.getElementById('application-action').value = 'retain';
        document.getElementById('application-risk').value = 'medium';
        document.getElementById('application-debt').value = 'medium';
        document.getElementById('application-technical-fit').value = '';
        document.getElementById('application-business-value').value = '';
        document.getElementById('application-currency').value = 'SEK';
        document.getElementById('application-capex').value = 0;
        document.getElementById('application-opex').value = 0;
        document.getElementById('application-users').value = 0;
        document.getElementById('application-ai-maturity').value = '';
        document.getElementById('application-ai-potential').value = 'Medium';
        document.getElementById('application-sunset').checked = false;
        document.getElementById('application-modernize').checked = false;
        document.getElementById('application-notes').value = '';
    }
    
    document.getElementById('applicationModal').classList.remove('hidden');
}

function closeApplicationModal() {
    document.getElementById('applicationModal').classList.add('hidden');
}

function saveApplication() {
    const id = document.getElementById('application-edit-id').value;
    const name = document.getElementById('application-name').value;
    const businessDomain = document.getElementById('application-domain').value;
    
    if (!name || !businessDomain) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    // Collect all APM-compatible fields
    const capex = parseFloat(document.getElementById('application-capex').value) || 0;
    const opex = parseFloat(document.getElementById('application-opex').value) || 0;
    
    const application = {
        // Basic info
        name,
        description: document.getElementById('application-description').value,
        businessDomain,
        department: businessDomain, // Alias for APM compatibility
        owner: document.getElementById('application-owner').value,
        vendor: document.getElementById('application-vendor').value,
        technologyStack: document.getElementById('application-technology').value,
        
        // Lifecycle & assessment
        lifecycle: document.getElementById('application-lifecycle').value,
        action: document.getElementById('application-action-decision') ? document.getElementById('application-action-decision').value : '',
        rationalizationAction: document.getElementById('application-action').value,
        riskLevel: document.getElementById('application-risk').value,
        technicalDebt: document.getElementById('application-debt').value,
        technicalFit: parseInt(document.getElementById('application-technical-fit').value) || undefined,
        businessValue: parseInt(document.getElementById('application-business-value').value) || undefined,
        regulatorySensitivity: 'medium',
        
        // Financial & metrics
        currency: document.getElementById('application-currency').value,
        capex,
        opex,
        annualCost: capex + opex, // Calculate combined cost
        users: parseInt(document.getElementById('application-users').value) || 0,
        
        // AI transformation
        aiMaturity: parseInt(document.getElementById('application-ai-maturity').value) || undefined,
        aiPotential: document.getElementById('application-ai-potential').value,
        
        // Flags & relationships
        sunsetCandidate: document.getElementById('application-sunset').checked,
        modernizationCandidate: document.getElementById('application-modernize').checked,
        businessCapabilities: [], // Preserved for capability links
        linkedCapabilities: [],
        constraints: [],
        evidenceRefs: [],
        
        // Additional notes
        notes: document.getElementById('application-notes').value,
        
        // Metadata
        metadata: {
            source: 'Manual',
            updatedAt: new Date().toISOString()
        }
    };
    
    if (id) {
        engagementManager.updateEntity('applications', id, application);
    } else {
        engagementManager.addEntity('applications', application);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeApplicationModal();
    renderApplications();
    updateKPIs();
    
    // Invalidate AS-IS Dashboard cache
    invalidateASISDashboard();
    
    // Mark portfolio as changed to enable EA Portfolio Analysis regeneration button
    if (typeof window.markPortfolioAsChanged === 'function') {
        window.markPortfolioAsChanged('business'); // Enable both business and technology buttons
    }
    
    showToast('Application Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

// ═══════════════════════════════════════════════════════════════════
// APPLICATION SORT & FILTER STATE
// ═══════════════════════════════════════════════════════════════════

let applicationSortState = {
    column: 'name',
    direction: 'asc'
};

let applicationFilterState = {
    searchText: '',
    domain: '',
    lifecycle: '',
    risk: ''
};

let applicationSelectionState = {
    selectedIds: new Set(),
    selectAll: false
};

// IMPORTANT: Never reset this state unless explicitly clearing selection

// Global flag to track if checkbox listeners are attached
let checkboxListenerInitialized = false;

// Store the handler function reference so we can remove it if needed
let checkboxChangeHandler = null;

/**
 * Sort applications by column
 */
function sortApplications(column) {
    // Toggle direction if same column, otherwise default to asc
    if (applicationSortState.column === column) {
        applicationSortState.direction = applicationSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        applicationSortState.column = column;
        applicationSortState.direction = 'asc';
    }
    
    renderApplications();
}

/**
 * Filter applications based on current filter state
 */
function filterApplications() {
    // Update filter state from UI
    applicationFilterState.searchText = (document.getElementById('app-search-input')?.value || '').toLowerCase();
    applicationFilterState.domain = document.getElementById('filter-domain')?.value || '';
    applicationFilterState.lifecycle = document.getElementById('filter-lifecycle')?.value || '';
    applicationFilterState.risk = document.getElementById('filter-risk')?.value || '';
    
    renderApplications();
}

/**
 * Clear all application filters
 */
function clearApplicationFilters() {
    applicationFilterState = {
        searchText: '',
        domain: '',
        lifecycle: '',
        risk: ''
    };
    
    // Reset UI
    const searchInput = document.getElementById('app-search-input');
    if (searchInput) searchInput.value = '';
    
    const domainFilter = document.getElementById('filter-domain');
    if (domainFilter) domainFilter.value = '';
    
    const lifecycleFilter = document.getElementById('filter-lifecycle');
    if (lifecycleFilter) lifecycleFilter.value = '';
    
    const riskFilter = document.getElementById('filter-risk');
    if (riskFilter) riskFilter.value = '';
    
    renderApplications();
}

/**
 * Apply filters to applications array
 */
function applyApplicationFilters(applications) {
    return applications.filter(app => {
        // Text search (across name, domain, vendor, technologyStack)
        if (applicationFilterState.searchText) {
            const searchableText = [
                app.name || '',
                app.businessDomain || '',
                app.technologyVendor || '',
                app.technologyStack || '',
                app.description || ''
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(applicationFilterState.searchText)) {
                return false;
            }
        }
        
        // Domain filter
        if (applicationFilterState.domain && app.businessDomain !== applicationFilterState.domain) {
            return false;
        }
        
        // Lifecycle filter
        if (applicationFilterState.lifecycle && app.lifecycle !== applicationFilterState.lifecycle) {
            return false;
        }
        
        // Risk filter
        if (applicationFilterState.risk && app.riskLevel !== applicationFilterState.risk) {
            return false;
        }
        
        return true;
    });
}

/**
 * Apply sorting to applications array
 */
function applySortToApplications(applications) {
    const sortedApps = [...applications];
    const { column, direction } = applicationSortState;
    const multiplier = direction === 'asc' ? 1 : -1;
    
    sortedApps.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
            case 'name':
                aVal = (a.name || '').toLowerCase();
                bVal = (b.name || '').toLowerCase();
                return aVal.localeCompare(bVal) * multiplier;
            
            case 'domain':
                aVal = (a.businessDomain || '').toLowerCase();
                bVal = (b.businessDomain || '').toLowerCase();
                return aVal.localeCompare(bVal) * multiplier;
            
            case 'lifecycle':
                const lifecycleOrder = { 'phaseIn': 1, 'active': 2, 'legacy': 3, 'phaseOut': 4, 'retired': 5 };
                aVal = lifecycleOrder[a.lifecycle] || 99;
                bVal = lifecycleOrder[b.lifecycle] || 99;
                return (aVal - bVal) * multiplier;
            
            case 'action':
                const actionOrder = { 'invest': 1, 'tolerate': 2, 'migrate': 3, 'retire': 4 };
                aVal = actionOrder[a.action] || 99;
                bVal = actionOrder[b.action] || 99;
                return (aVal - bVal) * multiplier;
            
            case 'rationalizationAction':
                const rationalizationOrder = { 'retain': 1, 'invest': 2, 'tolerate': 3, 'migrate': 4, 'replace': 5, 'consolidate': 6, 'retire': 7 };
                aVal = rationalizationOrder[a.rationalizationAction] || 99;
                bVal = rationalizationOrder[b.rationalizationAction] || 99;
                return (aVal - bVal) * multiplier;
            
            case 'risk':
                const riskOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                aVal = riskOrder[a.riskLevel] || 99;
                bVal = riskOrder[b.riskLevel] || 99;
                return (aVal - bVal) * multiplier;
            
            case 'debt':
                const debtOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                aVal = debtOrder[a.technicalDebt] || 99;
                bVal = debtOrder[b.technicalDebt] || 99;
                return (aVal - bVal) * multiplier;
            
            case 'owner':
            case 'vendor':
            case 'technology':
                aVal = (a[column] || '').toLowerCase();
                bVal = (b[column] || '').toLowerCase();
                return aVal.localeCompare(bVal) * multiplier;
            
            case 'techfit':
                aVal = a.technicalFit || 0;
                bVal = b.technicalFit || 0;
                return (aVal - bVal) * multiplier;
            
            case 'bizvalue':
                aVal = a.businessValue || 0;
                bVal = b.businessValue || 0;
                return (aVal - bVal) * multiplier;
            
            case 'users':
                aVal = a.users || 0;
                bVal = b.users || 0;
                return (aVal - bVal) * multiplier;
            
            case 'cost':
                aVal = a.annualCost || 0;
                bVal = b.annualCost || 0;
                return (aVal - bVal) * multiplier;
            
            default:
                return 0;
        }
    });
    
    return sortedApps;
}

/**
 * Get sort icon for table header
 */
function getSortIcon(column) {
    if (applicationSortState.column !== column) {
        return '<i class="fas fa-sort" style="margin-left: 6px; color: #d1d5db;"></i>';
    }
    
    if (applicationSortState.direction === 'asc') {
        return '<i class="fas fa-sort-up" style="margin-left: 6px; color: #3b82f6;"></i>';
    } else {
        return '<i class="fas fa-sort-down" style="margin-left: 6px; color: #3b82f6;"></i>';
    }
}

/**
 * Toggle selection of an application
 */
/**
 * Toggle selection of an application (unused but kept for reference)
 */
function toggleApplicationSelection(appId) {
    if (applicationSelectionState.selectedIds.has(appId)) {
        applicationSelectionState.selectedIds.delete(appId);
    } else {
        applicationSelectionState.selectedIds.add(appId);
    }
    updateBulkActionsUI();
}

/**
 * Delete all applications from the portfolio
 */
function deleteAllApplications() {
    const allApplications = engagementManager.getEntities('applications') || [];
    
    if (allApplications.length === 0) {
        showNotification('No applications to delete', 'info');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(
        `⚠️ WARNING: This will permanently delete all ${allApplications.length} applications from the portfolio.\n\n` +
        `This action cannot be undone.\n\n` +
        `Are you sure you want to continue?`
    );
    
    if (!confirmed) {
        return;
    }
    
    // Delete all applications
    allApplications.forEach(app => {
        engagementManager.deleteEntity('applications', app.id);
    });
    
    // Clear selection state
    applicationSelectionState.selectedIds.clear();
    applicationSelectionState.selectAll = false;
    
    // Invalidate dashboard cache
    if (typeof invalidateASISDashboard === 'function') {
        invalidateASISDashboard();
    }
    
    // Refresh the display
    renderApplications();
    
    showNotification(`Successfully deleted all ${allApplications.length} applications`, 'success');
}

/**
 * Delete a single application
 * @param {string} appId - Application ID to delete
 */
function deleteApplication(appId) {
    const app = engagementManager.getEntity('applications', appId);
    
    if (!app) {
        showNotification('Application not found', 'error');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(
        `Delete "${app.name}"?\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmed) {
        return;
    }
    
    // Delete the application
    engagementManager.deleteEntity('applications', appId);
    
    // Remove from selection if selected
    applicationSelectionState.selectedIds.delete(appId);
    
    // Invalidate dashboard cache
    if (typeof invalidateASISDashboard === 'function') {
        invalidateASISDashboard();
    }
    
    // Refresh the display
    renderApplications();
    
    showNotification(`Deleted "${app.name}" successfully`, 'success');
}

/**
 * Bulk delete selected applications
 */
function bulkDeleteApplications() {
    const selectedIds = Array.from(applicationSelectionState.selectedIds);
    
    if (selectedIds.length === 0) {
        showNotification('No applications selected', 'info');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(
        `⚠️ Delete ${selectedIds.length} selected application(s)?\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmed) {
        return;
    }
    
    // Delete all selected applications
    selectedIds.forEach(appId => {
        engagementManager.deleteEntity('applications', appId);
    });
    
    // Clear selection state
    applicationSelectionState.selectedIds.clear();
    applicationSelectionState.selectAll = false;
    
    // Invalidate dashboard cache
    if (typeof invalidateASISDashboard === 'function') {
        invalidateASISDashboard();
    }
    
    // Refresh the display
    renderApplications();
    
    showNotification(`Successfully deleted ${selectedIds.length} application(s)`, 'success');
}

/**
 * Clear all selections
 */
function clearSelection() {
    applicationSelectionState.selectedIds.clear();
    applicationSelectionState.selectAll = false;
    
    // Uncheck all checkboxes
    document.querySelectorAll('.app-select-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    updateBulkActionsUI();
}

/**
 * Update bulk actions bar visibility
 */
function updateBulkActionsUI() {
    const bulkActionsBar = document.getElementById('bulk-actions-bar');
    const selectedCountBadge = document.getElementById('selected-count-badge');
    
    if (bulkActionsBar && selectedCountBadge) {
        const count = applicationSelectionState.selectedIds.size;
        if (count > 0) {
            bulkActionsBar.style.display = 'flex';
            bulkActionsBar.style.gap = '0';
            selectedCountBadge.textContent = count;
        } else {
            bulkActionsBar.style.display = 'none';
        }
        
        // Adjust table header position after bulk actions bar visibility changes
        setTimeout(() => {
            if (typeof adjustTableHeaderPosition === 'function') {
                adjustTableHeaderPosition();
            }
        }, 10);
    } else {
        console.error('❌ Could not find bulk actions elements');
    }
}

/**
 * Update checkbox visual states to match selection state
 * (Call after table re-render to sync checkboxes with selection)
 */
function updateCheckboxStates() {
    const checkboxes = document.querySelectorAll('.app-select-checkbox');
    let syncedCount = 0;
    
    checkboxes.forEach(checkbox => {
        const appId = checkbox.getAttribute('data-app-id');
        if (appId) {
            const shouldBeChecked = applicationSelectionState.selectedIds.has(appId);
            if (checkbox.checked !== shouldBeChecked) {
                checkbox.checked = shouldBeChecked;
                syncedCount++;
            }
        }
    });
}

/**
 * Adjust table header sticky position based on filter bar height
 */
function adjustTableHeaderPosition() {
    const filterBar = document.getElementById('applications-filter-bar');
    const table = document.querySelector('#applications-container .data-table');
    
    if (filterBar && table) {
        const filterBarHeight = filterBar.offsetHeight;
        const thead = table.querySelector('thead');
        
        if (thead) {
            // Add small buffer (8px) for visual separation
            const topPosition = filterBarHeight + 8;
            thead.style.top = topPosition + 'px';
        }
    }
}

/**
 * Open bulk update modal
 */
function openBulkUpdateModal() {
    const count = applicationSelectionState.selectedIds.size;
    const warningText = document.getElementById('bulk-update-count');
    const btnText = document.getElementById('bulk-update-count-btn');
    const pluralText = document.getElementById('bulk-update-plural');
    
    warningText.textContent = count;
    btnText.textContent = count;
    
    // Update plural/singular
    if (pluralText) {
        pluralText.textContent = count === 1 ? 'application' : 'applications';
    }
    
    // Reset all checkboxes and fields
    ['domain', 'department', 'lifecycle', 'risk', 'debt', 'techfit', 'bizvalue', 'action'].forEach(field => {
        const checkbox = document.getElementById(`bulk-enable-${field}`);
        const input = document.getElementById(`bulk-${field}`);
        if (checkbox) checkbox.checked = false;
        if (input) {
            input.disabled = true;
            input.value = '';
        }
    });
    
    document.getElementById('bulkUpdateModal').classList.remove('hidden');
}

/**
 * Close bulk update modal
 */
function closeBulkUpdateModal() {
    document.getElementById('bulkUpdateModal').classList.add('hidden');
}

/**
 * Toggle bulk field enable/disable
 */
function toggleBulkField(field) {
    const checkbox = document.getElementById(`bulk-enable-${field}`);
    const input = document.getElementById(`bulk-${field}`);
    if (checkbox && input) {
        input.disabled = !checkbox.checked;
        if (!checkbox.checked) {
            input.value = '';
        }
    }
}

/**
 * Execute bulk update
 */
function executeBulkUpdate() {
    const updates = {};
    
    // Collect enabled field updates
    const fieldMappings = {
        'domain': 'businessDomain',
        'department': 'department',
        'lifecycle': 'lifecycle',
        'action-decision': 'action',
        'risk': 'riskLevel',
        'debt': 'technicalDebt',
        'techfit': 'technicalFitScore',
        'bizvalue': 'businessValueScore',
        'action': 'rationalizationAction'
    };
    
    Object.keys(fieldMappings).forEach(field => {
        const checkbox = document.getElementById(`bulk-enable-${field}`);
        const input = document.getElementById(`bulk-${field}`);
        
        if (checkbox && checkbox.checked && input && input.value) {
            const dataField = fieldMappings[field];
            let value = input.value;
            
            // Parse numbers
            if (field === 'techfit' || field === 'bizvalue') {
                value = parseInt(value);
            }
            
            updates[dataField] = value;
        }
    });
    
    if (Object.keys(updates).length === 0) {
        alert('Please enable at least one field to update.');
        return;
    }
    
    // Apply updates to selected applications
    const selectedIds = Array.from(applicationSelectionState.selectedIds);
    let updateCount = 0;
    
    selectedIds.forEach(appId => {
        const app = engagementManager.getEntity('applications', appId);
        if (app) {
            const updatedApp = { ...app, ...updates, lastModified: new Date().toISOString() };
            engagementManager.updateEntity('applications', appId, updatedApp);
            updateCount++;
        }
    });
    
    // Close modal and refresh
    closeBulkUpdateModal();
    clearSelection();
    renderApplications();
    
    // Invalidate AS-IS Dashboard cache
    invalidateASISDashboard();
    
    // Show success message
    showNotification(`Successfully updated ${updateCount} applications`, 'success');
}

/**
 * Show notification (simple implementation)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// COLUMN MANAGER
// ============================================

/**
 * Available columns configuration
 */
const AVAILABLE_COLUMNS = [
    { id: 'name', label: 'Application Name', defaultVisible: true, alwaysVisible: true },
    { id: 'domain', label: 'Business Domain', defaultVisible: false },
    { id: 'lifecycle', label: 'Lifecycle Phase', defaultVisible: true },
    { id: 'action', label: 'Action Decision', defaultVisible: false },
    { id: 'rationalizationAction', label: 'Rationalization Action', defaultVisible: false },
    { id: 'risk', label: 'Risk Level', defaultVisible: true },
    { id: 'debt', label: 'Technical Debt', defaultVisible: true },
    { id: 'owner', label: 'Owner', defaultVisible: false },
    { id: 'vendor', label: 'Vendor', defaultVisible: false },
    { id: 'technology', label: 'Technology Stack', defaultVisible: true },
    { id: 'techfit', label: 'Technical Fit Score', defaultVisible: false },
    { id: 'bizvalue', label: 'Business Value Score', defaultVisible: false },
    { id: 'users', label: 'User Count', defaultVisible: false },
    { id: 'cost', label: 'Annual Cost', defaultVisible: true },
    { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

/**
 * Get column preferences from localStorage
 */
function getColumnPreferences() {
    const saved = localStorage.getItem('engagement_playbook_columns');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse column preferences', e);
        }
    }
    // Return default preferences
    return AVAILABLE_COLUMNS
        .filter(col => col.defaultVisible)
        .map(col => col.id);
}

/**
 * Save column preferences to localStorage
 */
function saveColumnPreferencesToStorage(columnIds) {
    localStorage.setItem('engagement_playbook_columns', JSON.stringify(columnIds));
}

/**
 * Get visible columns in order
 */
function getVisibleColumns() {
    const prefs = getColumnPreferences();
    return AVAILABLE_COLUMNS.filter(col => prefs.includes(col.id));
}

/**
 * Open column manager modal
 */
function openColumnManager() {
    const modal = document.getElementById('columnManagerModal');
    if (!modal) {
        console.error('Column manager modal not found');
        return;
    }
    
    const list = document.getElementById('column-manager-list');
    const prefs = getColumnPreferences();
    
    // Build column list
    list.innerHTML = AVAILABLE_COLUMNS.map((col, index) => {
        const isChecked = prefs.includes(col.id);
        const isDisabled = col.alwaysVisible;
        
        return `
            <div class="column-item" data-column-id="${col.id}" draggable="${!isDisabled}" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: ${isDisabled ? '#f9fafb' : '#ffffff'};
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: ${isDisabled ? 'not-allowed' : 'move'};
                opacity: ${isDisabled ? '0.6' : '1'};
            ">
                <i class="fas fa-grip-vertical" style="color: #9ca3af; font-size: 16px;"></i>
                <input type="checkbox" 
                       id="col-${col.id}" 
                       ${isChecked ? 'checked' : ''}
                       ${isDisabled ? 'disabled' : ''}
                       onchange="toggleColumnVisibility('${col.id}', this.checked)"
                       style="width: 18px; height: 18px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'};">
                <label for="col-${col.id}" style="flex: 1; font-size: 14px; font-weight: 500; color: #374151; cursor: ${isDisabled ? 'not-allowed' : 'pointer'};">
                    ${col.label}
                    ${isDisabled ? '<span style="font-size: 11px; color: #9ca3af; font-weight: 400;"> (always visible)</span>' : ''}
                </label>
            </div>
        `;
    }).join('');
    
    // Initialize drag and drop
    initializeColumnDragDrop();
    
    modal.classList.remove('hidden');
}

/**
 * Close column manager modal
 */
function closeColumnManager() {
    const modal = document.getElementById('columnManagerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Toggle column visibility
 */
function toggleColumnVisibility(columnId, isVisible) {
    // Temporarily store state, will be saved on "Apply Changes"
    const checkbox = document.getElementById(`col-${columnId}`);
    if (checkbox) {
        checkbox.checked = isVisible;
    }
}

/**
 * Initialize drag and drop for column reordering
 */
function initializeColumnDragDrop() {
    const list = document.getElementById('column-manager-list');
    if (!list) return;
    
    let draggedItem = null;
    
    list.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('column-item') && e.target.draggable) {
            draggedItem = e.target;
            e.target.style.opacity = '0.5';
        }
    });
    
    list.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('column-item')) {
            e.target.style.opacity = '1';
        }
    });
    
    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
            list.appendChild(draggedItem);
        } else {
            list.insertBefore(draggedItem, afterElement);
        }
    });
}

/**
 * Get element after drag position
 */
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Save column preferences
 */
function saveColumnPreferences() {
    const list = document.getElementById('column-manager-list');
    const items = list.querySelectorAll('.column-item');
    
    // Get column IDs in order with visibility state
    const orderedColumns = Array.from(items).map(item => {
        const colId = item.dataset.columnId;
        const checkbox = document.getElementById(`col-${colId}`);
        return {
            id: colId,
            visible: checkbox?.checked || false
        };
    });
    
    // Save only visible column IDs in order
    const visibleColumnIds = orderedColumns
        .filter(col => col.visible)
        .map(col => col.id);
    
    saveColumnPreferencesToStorage(visibleColumnIds);
    
    // Close modal and refresh table
    closeColumnManager();
    renderApplications();
    
    showNotification('Column preferences saved', 'success');
}

/**
 * Reset column preferences to defaults
 */
function resetColumnDefaults() {
    if (!confirm('Reset to default column configuration? This will restore the original columns and order.')) {
        return;
    }
    
    const defaultColumnIds = AVAILABLE_COLUMNS
        .filter(col => col.defaultVisible)
        .map(col => col.id);
    
    saveColumnPreferencesToStorage(defaultColumnIds);
    
    // Refresh modal
    openColumnManager();
    
    showNotification('Column preferences reset to defaults', 'success');
}

// ═══════════════════════════════════════════════════════════════════
// AS-IS ARCHITECTURE DASHBOARD INTEGRATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Toggle between table and dashboard view
 */
function togglePortfolioView(viewMode) {
    const dashboardContainer = document.getElementById('dashboard-container');
    const tableContainer = document.getElementById('applications-container');
    const filterBar = document.getElementById('applications-filter-bar');
    const businessBtn = document.getElementById('view-toggle-business');
    const technologyBtn = document.getElementById('view-toggle-technology');
    const tableBtn = document.getElementById('view-toggle-table');
    
    // Store active view mode globally
    window.activePortfolioView = viewMode;
    
    if (viewMode === 'business' || viewMode === 'technology') {
        // Show dashboard, hide table
        dashboardContainer.style.display = 'block';
        tableContainer.style.display = 'none';
        if (filterBar) filterBar.style.display = 'none';
        
        // Update button states
        tableBtn.style.background = '';
        tableBtn.style.color = '';
        tableBtn.style.borderColor = '';
        
        if (viewMode === 'business') {
            businessBtn.style.background = '#10b981';
            businessBtn.style.color = 'white';
            businessBtn.style.borderColor = '#10b981';
            technologyBtn.style.background = '';
            technologyBtn.style.color = '';
            technologyBtn.style.borderColor = '';
            
            // Initialize dashboard with Business lens
            initASISDashboard('business');
        } else {
            technologyBtn.style.background = '#10b981';
            technologyBtn.style.color = 'white';
            technologyBtn.style.borderColor = '#10b981';
            businessBtn.style.background = '';
            businessBtn.style.color = '';
            businessBtn.style.borderColor = '';
            
            // Initialize dashboard with Technology lens
            initASISDashboard('technology');
        }
    } else {
        // Show table, hide dashboard
        dashboardContainer.style.display = 'none';
        tableContainer.style.display = 'block';
        if (filterBar && engagementManager.getEntities('applications').length > 0) {
            filterBar.style.display = 'block';
        }
        
        // Update button states
        tableBtn.style.background = '#10b981';
        tableBtn.style.color = 'white';
        tableBtn.style.borderColor = '#10b981';
        if (businessBtn) {
            businessBtn.style.background = '';
            businessBtn.style.color = '';
            businessBtn.style.borderColor = '';
        }
        if (technologyBtn) {
            technologyBtn.style.background = '';
            technologyBtn.style.color = '';
            technologyBtn.style.borderColor = '';
        }
        
        // Ensure table is rendered
        renderApplications();
    }
}

/**
 * Generate three-lens dashboard structure using AI with batch processing
 * @param {Array} applications - Application array
 * @param {Function} onProgress - Progress callback(current, total, batchNum, totalBatches, message)
 * @returns {Promise<Object>} Three-lens JSON structure
 */
/**
 * Generate Two-Lens Dashboard from Data ONLY (NO AI by default)
 * V2 Architecture: Data-first approach with optional AI classification
 * 
 * Business Domain Lens:
 * - Read app.businessDomain attribute
 * - Apps WITHOUT attribute → "Unknown" domain (orange)
 * 
 * Technology Domain Lens:
 * - Infer from app.technologyStack attribute
 * - Apps WITHOUT attribute → "Unknown" domain (orange)
 * 
 * Service Tower Lens: REMOVED (moved to WhiteSpot Heatmap)
 * 
 * @param {Array} applications - Application portfolio
 * @param {Function} onProgress - Optional progress callback
 * @returns {Object} Two-lens dashboard structure with Unknown domains
 */
async function generateTwoLensDashboardFromData(applications, onProgress) {
    console.log('[AS-IS Dashboard V2] Generating two-lens structure from DATA ONLY (zero AI calls)...');
    
    if (onProgress) {
        onProgress(0, applications.length, 0, 1, 'Building dashboard from existing data...');
    }
    
    // Initialize domain maps
    const businessDomainMap = new Map();
    const technologyDomainMap = new Map();
    
    // Process each application
    applications.forEach((app, index) => {
        // ========================================
        // BUSINESS DOMAIN LENS
        // ========================================
        const businessDomainName = app.businessDomain && app.businessDomain.trim() 
            ? app.businessDomain.trim() 
            : 'Unknown';
        
        if (!businessDomainMap.has(businessDomainName)) {
            businessDomainMap.set(businessDomainName, {
                name: businessDomainName,
                description: businessDomainName === 'Unknown' 
                    ? 'Applications without assigned business domain' 
                    : `${businessDomainName} domain applications`,
                color: businessDomainName === 'Unknown' ? '#f59e0b' : getDomainColor(businessDomainName),
                apps: []
            });
        }
        
        // Add app to business domain
        const businessDomain = businessDomainMap.get(businessDomainName);
        businessDomain.apps.push({
            ...app,
            businessDomain: businessDomainName,
            _classificationSource: app.businessDomain ? 'data' : 'unknown'
        });
        
        // ========================================
        // TECHNOLOGY DOMAIN LENS
        // ========================================
        const technologyDomainName = inferTechnologyDomain(app);
        
        if (!technologyDomainMap.has(technologyDomainName)) {
            technologyDomainMap.set(technologyDomainName, {
                name: technologyDomainName,
                description: technologyDomainName === 'Unknown' 
                    ? 'Applications without technology classification' 
                    : getTechnologyDomainDescription(technologyDomainName),
                color: technologyDomainName === 'Unknown' ? '#f59e0b' : getTechnologyDomainColor(technologyDomainName),
                apps: []
            });
        }
        
        // Add app to technology domain
        const technologyDomain = technologyDomainMap.get(technologyDomainName);
        technologyDomain.apps.push({
            ...app,
            technologyDomain: technologyDomainName,
            _classificationSource: technologyDomainName === 'Unknown' ? 'unknown' : 'inferred'
        });
    });
    
    // Convert maps to arrays
    const businessDomains = Array.from(businessDomainMap.values());
    const technologyDomains = Array.from(technologyDomainMap.values());
    
    // Calculate KPIs from all applications
    const legacyApps = applications.filter(a => {
        const tech = (a.technologyStack || '').toLowerCase();
        const lifecycle = (a.lifecycleStatus || a.lifecycle || '').toLowerCase();
        return tech.includes('legacy') || lifecycle === 'legacy';
    });
    const activeApps = applications.filter(a => {
        const lifecycle = (a.lifecycleStatus || a.lifecycle || '').toLowerCase();
        return lifecycle === 'active' || lifecycle === 'production' || lifecycle === 'operational';
    });
    const highRiskApps = applications.filter(a => {
        const risk = (a.riskLevel || a.risk || '').toLowerCase();
        return risk === 'high';
    });
    
    const unknownBusinessCount = businessDomainMap.get('Unknown')?.apps.length || 0;
    const unknownTechCount = technologyDomainMap.get('Unknown')?.apps.length || 0;
    
    console.log('[AS-IS Dashboard V2] ✅ Data-driven dashboard generated:', {
        businessDomains: businessDomains.length,
        technologyDomains: technologyDomains.length,
        totalApps: applications.length,
        unknownBusiness: unknownBusinessCount,
        unknownTech: unknownTechCount,
        aiCalls: 0,
        cost: '$0.00'
    });
    
    if (onProgress) {
        onProgress(applications.length, applications.length, 1, 1, 'Dashboard ready');
    }
    
    // Return structure matching old AI format for compatibility
    return {
        apps: applications,
        businessDomains: businessDomains,
        technologyDomains: technologyDomains,
        serviceTowers: [], // TODO: Service domain mapping moved to WhiteSpot Heatmap
        layers: [],
        insights: null,
        crossLensInsights: null,
        riskCells: null,
        kpis: {
            totalApplications: applications.length,
            legacySystems: legacyApps.length,
            activeSystems: activeApps.length,
            highRiskApps: highRiskApps.length,
            unknownBusinessDomains: unknownBusinessCount,
            unknownTechnologyDomains: unknownTechCount,
            // Backward compatibility
            total: applications.length,
            legacy: legacyApps.length,
            active: activeApps.length,
            highRisk: highRiskApps.length
        }
    };
}

/**
 * Infer technology domain from app attributes (technologyStack primarily)
 * @param {Object} app - Application object
 * @returns {String} Technology domain name or "Unknown"
 */
function inferTechnologyDomain(app) {
    const techStack = (app.technologyStack || '').toLowerCase().trim();
    
    if (!techStack) return 'Unknown';
    
    // Legacy Systems
    if (techStack.includes('cobol') || techStack.includes('mainframe') || techStack.includes('legacy')) {
        return 'Legacy Systems';
    }
    
    // Modern Web Applications
    if (techStack.includes('react') || techStack.includes('angular') || techStack.includes('vue') || 
        techStack.includes('node') || techStack.includes('javascript')) {
        return 'Modern Web Applications';
    }
    
    // Cloud Platforms
    if (techStack.includes('aws') || techStack.includes('azure') || techStack.includes('gcp') || 
        techStack.includes('cloud')) {
        return 'Cloud Infrastructure';
    }
    
    // SaaS / Commercial Platforms
    if (techStack.includes('sap') || techStack.includes('salesforce') || techStack.includes('oracle') || 
        techStack.includes('workday') || techStack.includes('servicenow')) {
        return 'SaaS & Commercial Platforms';
    }
    
    // Data & Analytics
    if (techStack.includes('data') || techStack.includes('analytics') || techStack.includes('bi') || 
        techStack.includes('warehouse') || techStack.includes('lake')) {
        return 'Data & Analytics';
    }
    
    // Integration & Middleware
    if (techStack.includes('integration') || techStack.includes('api') || techStack.includes('middleware') || 
        techStack.includes('mq') || techStack.includes('kafka')) {
        return 'Integration & Middleware';
    }
    
    // Mobile Applications
    if (techStack.includes('mobile') || techStack.includes('ios') || techStack.includes('android')) {
        return 'Mobile Applications';
    }
    
    // Default: Use first significant word from technology stack
    const words = techStack.split(/[,\/\-\s]+/).filter(w => w.length > 3);
    if (words.length > 0) {
        return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' Systems';
    }
    
    return 'Unknown';
}

/**
 * Get technology domain description
 * @param {String} domainName
 * @returns {String} Description
 */
function getTechnologyDomainDescription(domainName) {
    const descriptions = {
        'Legacy Systems': 'Mainframe, COBOL, and legacy platform applications',
        'Modern Web Applications': 'React, Angular, Node.js, and modern JavaScript frameworks',
        'Cloud Infrastructure': 'AWS, Azure, GCP, and cloud-native applications',
        'SaaS & Commercial Platforms': 'SAP, Salesforce, Oracle, and commercial SaaS solutions',
        'Data & Analytics': 'Data warehouses, analytics platforms, and BI tools',
        'Integration & Middleware': 'API gateways, ESBs, messaging, and integration platforms',
        'Mobile Applications': 'iOS, Android, and mobile app platforms'
    };
    return descriptions[domainName] || `${domainName} applications`;
}

/**
 * Get technology domain color
 * @param {String} domainName
 * @returns {String} Hex color
 */
function getTechnologyDomainColor(domainName) {
    const colors = {
        'Legacy Systems': '#6b7280',
        'Modern Web Applications': '#3b82f6',
        'Cloud Infrastructure': '#10b981',
        'SaaS & Commercial Platforms': '#8b5cf6',
        'Data & Analytics': '#f59e0b',
        'Integration & Middleware': '#ef4444',
        'Mobile Applications': '#06b6d4'
    };
    return colors[domainName] || '#64748b';
}

/**
 * LEGACY FUNCTION - generateThreeLensDashboardWithAI()
 * Now deprecated in favor of generateTwoLensDashboardFromData()
 * Kept for backward compatibility only
 * 
 * @deprecated Use generateTwoLensDashboardFromData() instead
 */
async function generateThreeLensDashboardWithAI(applications, onProgress) {
    console.log('[AS-IS Dashboard] Generating three-lens structure with AI (batch processing)...');
    
    const BATCH_SIZE = 20;
    const batches = [];
    
    // Split applications into batches
    for (let i = 0; i < applications.length; i += BATCH_SIZE) {
        batches.push(applications.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`[AS-IS Dashboard] Processing ${applications.length} applications in ${batches.length} batches`);
    
    try {
        // Build three-lens prompt using the renderer's prompt builder
        if (typeof buildInsightsPrompt !== 'function') {
            console.error('[AS-IS Dashboard] buildInsightsPrompt function not available');
            return null;
        }
        
        const allClassifiedApps = [];
        let aggregatedDomains = { 
            business: new Map(),      // Key: domain name, Value: domain object
            technology: new Map(), 
            serviceTower: new Map() 
        };
        
        // Process each batch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            const batchNum = batchIndex + 1;
            const processedSoFar = batchIndex * BATCH_SIZE + batch.length;
            
            if (onProgress) {
                onProgress(
                    processedSoFar, 
                    applications.length, 
                    batchNum, 
                    batches.length,
                    `Processing batch ${batchNum}/${batches.length} (${batch.length} apps)...`
                );
            }
            
            console.log(`[AS-IS Dashboard] Processing batch ${batchNum}/${batches.length} (${batch.length} apps)`);
            
            // Build CLASSIFICATION-ONLY prompt for this batch (no insights)
            if (typeof buildThreeLensClassificationPrompt !== 'function') {
                console.error('[AS-IS Dashboard] buildThreeLensClassificationPrompt function not available');
                return null;
            }
            
            const prompt = buildThreeLensClassificationPrompt(batch);
            
            console.log(`[AS-IS Dashboard] Batch ${batchNum} prompt length:`, prompt.length, 'chars');
            
            // Call AI for this batch using GPT-5.4 (OpenAI Responses API)
            const response = await AzureOpenAIProxy.create(prompt, {
                // No model specified - uses default gpt-5.4
                instructions: 'You are a senior enterprise architect. Classify applications across Business, Technology, and Service Tower dimensions. Return ONLY valid JSON without markdown or prose.',
                temperature: 0.3, // Lower temperature for consistent classification
                timeout: 180000 // 3 minutes per batch
            });
            
            console.log(`[AS-IS Dashboard] ✅ Batch ${batchNum} response received`);
            
            // Parse response
            if (typeof parseInsightsResponse !== 'function') {
                console.error('[AS-IS Dashboard] parseInsightsResponse function not available');
                return null;
            }
            
            const batchResult = parseInsightsResponse(response);
            
            // Aggregate results - only add apps from THIS batch (avoid duplicates)
            if (batchResult.apps && Array.isArray(batchResult.apps)) {
                // Create map of original apps for field merging
                const originalAppsMap = new Map(batch.map(app => [app.name, app]));
                
                // Only add apps that were in the original batch (by name matching)
                const batchAppNames = new Set(batch.map(app => app.name));
                const batchClassifiedApps = batchResult.apps
                    .filter(app => batchAppNames.has(app.name))
                    .map(classifiedApp => {
                        // Merge AI classification with original app data to preserve ALL fields
                        const originalApp = originalAppsMap.get(classifiedApp.name);
                        return {
                            ...originalApp,  // All original fields (lifecycle, risk, vendor, etc.)
                            ...classifiedApp  // AI classification (businessDomain, technologyDomain, serviceTower)
                        };
                    });
                
                console.log(`[AS-IS Dashboard] Batch ${batchNum} returned ${batchResult.apps.length} apps, filtered to ${batchClassifiedApps.length} from this batch (with original fields merged)`);
                
                allClassifiedApps.push(...batchClassifiedApps);
            }
            
            // Collect unique domains by NAME (avoid duplicates from different batches)
            if (batchResult.businessDomains) {
                const beforeSize = aggregatedDomains.business.size;
                batchResult.businessDomains.forEach(d => {
                    if (!aggregatedDomains.business.has(d.name)) {
                        aggregatedDomains.business.set(d.name, d);
                    }
                });
                console.log(`[AS-IS Dashboard] Batch ${batchNum} Business Domains: ${batchResult.businessDomains.length} returned, ${aggregatedDomains.business.size - beforeSize} new added (total: ${aggregatedDomains.business.size})`);
            }
            if (batchResult.technologyDomains) {
                const beforeSize = aggregatedDomains.technology.size;
                batchResult.technologyDomains.forEach(d => {
                    if (!aggregatedDomains.technology.has(d.name)) {
                        aggregatedDomains.technology.set(d.name, d);
                    }
                });
                console.log(`[AS-IS Dashboard] Batch ${batchNum} Technology Domains: ${batchResult.technologyDomains.length} returned, ${aggregatedDomains.technology.size - beforeSize} new added (total: ${aggregatedDomains.technology.size})`);
            }
            if (batchResult.serviceTowers) {
                const beforeSize = aggregatedDomains.serviceTower.size;
                const domainNames = batchResult.serviceTowers.map(d => d.name);
                console.log(`[AS-IS Dashboard] Batch ${batchNum} Service Towers returned:`, domainNames);
                
                batchResult.serviceTowers.forEach(d => {
                    if (!aggregatedDomains.serviceTower.has(d.name)) {
                        aggregatedDomains.serviceTower.set(d.name, d);
                        console.log(`  ✅ Added new Service Tower: "${d.name}"`);
                    } else {
                        console.log(`  ⏭️  Skipped duplicate Service Tower: "${d.name}"`);
                    }
                });
                console.log(`[AS-IS Dashboard] Batch ${batchNum} Service Towers: ${batchResult.serviceTowers.length} returned, ${aggregatedDomains.serviceTower.size - beforeSize} new added (total: ${aggregatedDomains.serviceTower.size})`);
            }
            
            console.log(`[AS-IS Dashboard] Batch ${batchNum} processed: ${batchResult.apps?.length || 0} apps classified`);
            
            // Small delay between batches to avoid rate limiting
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        // Deduplicate apps by name (safety check)
        const uniqueAppsMap = new Map();
        allClassifiedApps.forEach((app, index) => {
            if (!uniqueAppsMap.has(app.name)) {
                uniqueAppsMap.set(app.name, app);
            } else {
                console.warn(`[AS-IS Dashboard] ⚠️ Duplicate app detected: "${app.name}" (appears multiple times, using first occurrence)`);
            }
        });
        const uniqueApps = Array.from(uniqueAppsMap.values());
        
        console.log(`[AS-IS Dashboard] Aggregation complete:`, {
            totalProcessed: allClassifiedApps.length,
            uniqueApps: uniqueApps.length,
            expectedApps: applications.length,
            duplicatesRemoved: allClassifiedApps.length - uniqueApps.length
        });
        
        // Calculate KPIs from Business Capability Domain apps ONLY (Lens 1)
        // Strategic Insights and KPIs should be aligned to the same data source
        const businessDomainApps = uniqueApps; // All apps have businessDomain assigned
        const legacyApps = businessDomainApps.filter(a => {
            const tech = (a.technologyStack || '').toLowerCase();
            const lifecycle = (a.lifecycleStatus || a.lifecycle || '').toLowerCase();
            return tech.includes('legacy') || lifecycle === 'legacy';
        });
        const activeApps = businessDomainApps.filter(a => {
            const lifecycle = (a.lifecycleStatus || a.lifecycle || '').toLowerCase();
            return lifecycle === 'active' || lifecycle === 'production' || lifecycle === 'operational';
        });
        const highRiskApps = businessDomainApps.filter(a => {
            const risk = (a.riskLevel || a.risk || '').toLowerCase();
            return risk === 'high';
        });
        
        console.log('[AS-IS Dashboard] 📊 KPIs calculated from Business Capability Domain apps:', {
            total: businessDomainApps.length,
            legacy: legacyApps.length,
            active: activeApps.length,
            highRisk: highRiskApps.length
        });
        
        // Construct final result (CLASSIFICATION ONLY - NO INSIGHTS)
        const finalResult = {
            apps: uniqueApps,
            businessDomains: Array.from(aggregatedDomains.business.values()),
            technologyDomains: Array.from(aggregatedDomains.technology.values()),
            serviceTowers: Array.from(aggregatedDomains.serviceTower.values()),
            layers: [], // Derived from apps
            insights: null, // Not generated - user must click "Generate Insights" button separately
            crossLensInsights: null,
            riskCells: null,
            kpis: {
                totalApplications: businessDomainApps.length,
                legacySystems: legacyApps.length,
                activeSystems: activeApps.length,
                highRiskApps: highRiskApps.length,
                // Backward compatibility
                total: businessDomainApps.length,
                legacy: legacyApps.length,
                active: activeApps.length,
                highRisk: highRiskApps.length
            }
        };
        
        console.log('[AS-IS Dashboard] ✅ All batches completed. Final three-lens structure:', {
            businessDomains: finalResult.businessDomains.length,
            technologyDomains: finalResult.technologyDomains.length,
            serviceTowers: finalResult.serviceTowers.length,
            apps: finalResult.apps.length,
            expectedApps: applications.length,
            insightsGenerated: false,
            domainDeduplication: {
                businessUnique: aggregatedDomains.business.size,
                technologyUnique: aggregatedDomains.technology.size,
                serviceTowerUnique: aggregatedDomains.serviceTower.size
            }
        });
        
        // Log exact domain names for verification
        console.log('[AS-IS Dashboard] Final Business Domain names:', finalResult.businessDomains.map(d => d.name));
        console.log('[AS-IS Dashboard] Final Technology Domain names:', finalResult.technologyDomains.map(d => d.name));
        console.log('[AS-IS Dashboard] Final Service Tower names:', finalResult.serviceTowers.map(d => d.name));
        
        // Validate total count
        if (finalResult.apps.length !== applications.length) {
            console.warn(`[AS-IS Dashboard] ⚠️ App count mismatch! Expected ${applications.length}, got ${finalResult.apps.length}`);
        }
        
        return finalResult;
        
    } catch (error) {
        console.error('[AS-IS Dashboard] AI generation failed:', error);
        throw error;
    }
}

/**
 * Save three-lens dashboard data to localStorage
 * @param {string} engagementId - Engagement ID
 * @param {Object} threeLensData - Three-lens classification data
 */
function saveThreeLensDashboardData(engagementId, threeLensData) {
    if (!engagementId || !threeLensData) {
        console.error('[Three-Lens Storage] Invalid parameters');
        return false;
    }
    
    const key = `ea_three_lens_${engagementId}`;
    const dataToSave = {
        ...threeLensData,
        metadata: {
            savedAt: new Date().toISOString(),
            version: '1.0',
            appsCount: threeLensData.apps?.length || 0,
            domainsCount: {
                business: threeLensData.businessDomains?.length || 0,
                technology: threeLensData.technologyDomains?.length || 0,
                serviceTower: threeLensData.serviceTowers?.length || 0
            }
        }
    };
    
    try {
        localStorage.setItem(key, JSON.stringify(dataToSave));
        console.log(`[Three-Lens Storage] ✅ Saved three-lens data: ${key}`, {
            apps: dataToSave.apps?.length || 0,
            businessDomains: dataToSave.businessDomains?.length || 0,
            technologyDomains: dataToSave.technologyDomains?.length || 0,
            serviceTowers: dataToSave.serviceTowers?.length || 0
        });
        return true;
    } catch (error) {
        console.error('[Three-Lens Storage] Failed to save:', error);
        return false;
    }
}

/**
 * Load three-lens dashboard data from localStorage
 * @param {string} engagementId - Engagement ID
 * @returns {Object|null} - Three-lens data or null
 */
function loadThreeLensDashboardData(engagementId) {
    if (!engagementId) {
        console.error('[Three-Lens Storage] No engagement ID provided');
        return null;
    }
    
    const key = `ea_three_lens_${engagementId}`;
    
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            console.log('[Three-Lens Storage] No saved three-lens data found for:', engagementId);
            return null;
        }
        
        const parsed = JSON.parse(data);
        console.log(`[Three-Lens Storage] ✅ Loaded three-lens data: ${key}`, {
            savedAt: parsed.metadata?.savedAt,
            apps: parsed.apps?.length || 0,
            businessDomains: parsed.businessDomains?.length || 0,
            technologyDomains: parsed.technologyDomains?.length || 0,
            serviceTowers: parsed.serviceTowers?.length || 0
        });
        
        // Log Service Tower names to verify no duplicates in saved data
        if (parsed.serviceTowers && parsed.serviceTowers.length > 0) {
            console.log('[Three-Lens Storage] Service Tower names in saved data:', 
                parsed.serviceTowers.map(d => d.name));
        }
        
        return parsed;
    } catch (error) {
        console.error('[Three-Lens Storage] Failed to load:', error);
        return null;
    }
}

/**
 * Clear three-lens dashboard data from localStorage
 * @param {string} engagementId - Engagement ID
 */
function clearThreeLensDashboardData(engagementId) {
    if (!engagementId) return;
    
    const key = `ea_three_lens_${engagementId}`;
    localStorage.removeItem(key);
    console.log('[Three-Lens Storage] Cleared data for:', engagementId);
}

/**
 * Initialize and render AS-IS Architecture Dashboard (orchestrator)
 * ALWAYS loads from localStorage if available - ensures persistence across tab switches
 */
async function initASISDashboard(lensType = null, options = {}) {
    console.log('[AS-IS Dashboard] Initializing dashboard...', { lensType, options });
    
    // Store lens type globally for later use
    if (lensType) {
        window.activeDashboardLens = lensType;
    }
    
    const { useAI = false } = options;
    
    // Get current engagement ID for three-lens data storage
    const currentEngagement = engagementManager.getCurrentEngagement();
    const engagementId = currentEngagement?.id;
    
    // ALWAYS try to load from localStorage first (unless explicitly regenerating with AI)
    // This ensures three-lens data persists across:
    // - Tab switches (Opportunity Qualification → AS-IS Portfolio)
    // - View toggles (Table → Dashboard)
    // - Page refreshes
    if (!useAI && engagementId) {
        const savedThreeLensData = loadThreeLensDashboardData(engagementId);
        if (savedThreeLensData && savedThreeLensData.apps && savedThreeLensData.apps.length > 0) {
            console.log('[AS-IS Dashboard] ✅ Loaded three-lens data from localStorage');
            console.log('[AS-IS Dashboard] 💰 Cost savings: No AI tokens used!');
            
            // Check if insights were saved
            if (savedThreeLensData.insights && savedThreeLensData.insights.length > 0) {
                console.log('[AS-IS Dashboard] 💡 Found saved insights:', savedThreeLensData.insights.length);
            }
            
            window.threeLensData = savedThreeLensData;
            
            // Render with three-lens data (include insights if available)
            const dashboardData = mapApplicationsToDashboard(); // Still need this for layers/metadata
            window.renderASISDashboard(dashboardData, 'dashboard-container', {
                showRegenerateButton: true,
                insights: savedThreeLensData.insights ? {
                    insights: savedThreeLensData.insights,
                    executiveSummary: savedThreeLensData.executiveSummary,
                    domainRecommendations: savedThreeLensData.domainRecommendations
                } : null
            });
            
            // Auto-switch to specified lens if provided
            if (lensType && typeof window.switchThreeLens === 'function') {
                setTimeout(() => {
                    window.switchThreeLens(lensType);
                    console.log('[AS-IS Dashboard] Auto-switched to', lensType, 'lens');
                }, 100);
            }
            
            // Render insights if available
            if (savedThreeLensData.insights && savedThreeLensData.insights.length > 0) {
                setTimeout(() => {
                    renderInsightsResults({
                        insights: savedThreeLensData.insights,
                        executiveSummary: savedThreeLensData.executiveSummary,
                        domainRecommendations: savedThreeLensData.domainRecommendations
                    });
                }, 500);
            }
            
            return;
        } else {
            console.log('[AS-IS Dashboard] ⚠️ No saved three-lens data found');
            console.log('[AS-IS Dashboard] 💡 Options: 1) Click "Regenerate Dashboard" (uses AI), or 2) Click "Import Dashboard" (free)');
        }
    }
    
    // Check cache (skip if AI regeneration requested)
    if (!useAI && window.asisDashboardCache && !window.asisDashboardCache.isStale) {
        console.log('[AS-IS Dashboard] Using cached dashboard');
        
        // IMPORTANT: Even when using cache, ensure window.threeLensData is loaded or generated
        // This is needed for lens switching and drag-and-drop
        if (!window.threeLensData) {
            // Try loading from localStorage first
            if (engagementId) {
                const savedThreeLensData = loadThreeLensDashboardData(engagementId);
                if (savedThreeLensData && savedThreeLensData.apps && savedThreeLensData.apps.length > 0) {
                    window.threeLensData = savedThreeLensData;
                    console.log('[AS-IS Dashboard] Loaded two-lens data from localStorage for cache rendering');
                } else {
                    // No saved data - need to generate it from current applications
                    const applications = engagementManager.getEntities('applications') || [];
                    if (applications.length > 0) {
                        console.log('[AS-IS Dashboard] Generating two-lens data for cache rendering...');
                        try {
                            const dataResult = await generateTwoLensDashboardFromData(applications);
                            if (dataResult && dataResult.businessDomains) {
                                window.threeLensData = dataResult;
                                if (engagementId) {
                                    saveThreeLensDashboardData(engagementId, dataResult);
                                }
                                console.log('[AS-IS Dashboard] Two-lens data generated and saved');
                            }
                        } catch (error) {
                            console.error('[AS-IS Dashboard] Failed to generate two-lens data:', error);
                        }
                    }
                }
            }
        }
        
        const { data, insights } = window.asisDashboardCache;
        window.renderASISDashboard(data, 'dashboard-container', {
            showRegenerateButton: true,
            insights: insights || null
        });
        
        // Auto-switch to specified lens if provided
        if (lensType && typeof window.switchThreeLens === 'function') {
            setTimeout(() => {
                window.switchThreeLens(lensType);
                console.log('[AS-IS Dashboard] Auto-switched to', lensType, 'lens');
            }, 100);
        }
        
        return;
    }
    
    // Get applications
    const applications = engagementManager.getEntities('applications') || [];
    if (applications.length === 0) {
        document.getElementById('dashboard-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chart-pie"></i></div>
                <div class="empty-state-title">No application data available</div>
                <div class="empty-state-text">Import applications from APM Toolkit or add manually to view dashboard</div>
                <button class="btn btn-primary" onclick="importAPMData()">
                    <i class="fas fa-download"></i> Import from APM Toolkit
                </button>
            </div>
        `;
        return;
    }
    
    // V2 Architecture: ALWAYS generate two-lens dashboard structure from data (zero AI)
    // The structure is built from existing app.businessDomain and app.technologyStack attributes
    // AI classification is OPTIONAL and only used via "Classify with AI" button in Unknown domains
    if (!window.threeLensData || window.threeLensData.apps?.length !== applications.length) {
        console.log('[AS-IS Dashboard V2] Generating two-lens structure from existing data (no AI)...');
        try {
            const dataResult = await generateTwoLensDashboardFromData(applications, options.onProgress);
            if (dataResult && dataResult.businessDomains) {
                console.log('[AS-IS Dashboard V2] Two-lens structure generated successfully');
                
                // Store result in memory
                window.threeLensData = dataResult;
                
                // Save to localStorage for persistence across page refreshes
                if (engagementId) {
                    saveThreeLensDashboardData(engagementId, dataResult);
                }
                
                console.log('[AS-IS Dashboard V2] Two-lens data available in window.threeLensData:', {
                    businessDomains: dataResult.businessDomains?.length || 0,
                    technologyDomains: dataResult.technologyDomains?.length || 0,
                    serviceTowers: dataResult.serviceTowers?.length || 0, // Empty - moved to WhiteSpot Heatmap
                    unknownBusiness: dataResult.kpis?.unknownBusinessDomains || 0,
                    unknownTech: dataResult.kpis?.unknownTechnologyDomains || 0,
                    apps: dataResult.apps?.length || 0,
                    aiCalls: 0
                });
            }
        } catch (error) {
            console.error('[AS-IS Dashboard V2] Data generation failed, falling back to local mapper:', error);
        }
    } else {
        console.log('[AS-IS Dashboard V2] Using existing two-lens data in memory');
    }
    
    // Map applications to dashboard data (using local mapper for now)
    // Note: currentEngagement already declared at function start (line 1363)
    const dashboardData = mapApplicationsToDashboard(applications, {
        accountName: currentEngagement?.customerName || 'Organization',
        industry: currentEngagement?.segment || 'Enterprise',
        reportDate: new Date().toISOString().split('T')[0]
    });
    
    // Render dashboard WITHOUT insights (user will trigger insights generation)
    window.renderASISDashboard(dashboardData, 'dashboard-container', {
        showRegenerateButton: true,
        insights: window.asisDashboardCache?.insights || null
    });
    
    // Auto-switch to specified lens if provided
    if (lensType && typeof window.switchThreeLens === 'function') {
        setTimeout(() => {
            window.switchThreeLens(lensType);
            console.log('[AS-IS Dashboard] Auto-switched to', lensType, 'lens');
        }, 100);
    }
    
    // Cache
    window.asisDashboardCache = {
        data: dashboardData,
        insights: window.asisDashboardCache?.insights || null,
        timestamp: Date.now(),
        isStale: false
    };
    
    // Hide stale badge
    const staleBadge = document.getElementById('dashboard-stale-badge');
    if (staleBadge) staleBadge.style.display = 'none';
    
    console.log('[AS-IS Dashboard] Dashboard rendered successfully');
}

/**
 * Mark dashboard as stale (needs regeneration)
 * Called when user makes changes (drag & drop, bulk updates, etc.)
 * 
 * NOTE: This does NOT clear three-lens data from localStorage!
 * The user's manual drag & drop changes are saved in window.threeLensData
 * and will persist across page refreshes.
 */
function invalidateASISDashboard() {
    if (window.asisDashboardCache) {
        window.asisDashboardCache.isStale = true;
        
        // Show stale badge to indicate AI classification may be outdated
        const staleBadge = document.getElementById('dashboard-stale-badge');
        if (staleBadge) staleBadge.style.display = 'flex';
        
        console.log('[AS-IS Dashboard] Cache invalidated (marked as stale)');
    }
    
    // DO NOT clear three-lens data here!
    // User's manual changes (drag & drop) should persist across refreshes
    // Only clear when user explicitly clicks "Regenerate Dashboard"
    console.log('[AS-IS Dashboard] Three-lens data preserved with user changes');
}

/**
 * Regenerate dashboard (clear cache and re-render)
 */
async function regenerateASISDashboard() {
    console.log('[AS-IS Dashboard] Regenerating dashboard with AI classification...');
    
    // Show AI progress indicator with batch tracking
    const progressHtml = `
        <div id="ai-regenerate-progress" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #00472E 0%, #006B3F 100%);
            color: white;
            padding: 40px 56px;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            z-index: 10000;
            min-width: 500px;
            text-align: center;
        ">
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">
                🤖 AI Assistant Working...
            </div>
            <div style="margin-bottom: 8px; font-size: 14px; opacity: 0.9;">
                Three-Lens Classification (Business · Technology · Service Tower)
            </div>
            <div id="ai-batch-info" style="margin-bottom: 20px; font-size: 13px; font-weight: 500; opacity: 0.85;">
                Preparing...
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                <div id="ai-progress-bar" style="
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    width: 0%;
                    transition: width 0.5s ease;
                "></div>
            </div>
            <div id="ai-progress-percentage" style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">
                0%
            </div>
            <div id="ai-progress-status" style="margin-top: 8px; font-size: 12px; opacity: 0.75; font-style: italic;">
                Initializing AI analysis...
            </div>
        </div>
    `;
    
    const progressDiv = document.createElement('div');
    progressDiv.innerHTML = progressHtml;
    document.body.appendChild(progressDiv);
    
    const updateProgress = (current, total, batchNum, totalBatches, message) => {
        const percentage = Math.round((current / total) * 100);
        
        const barEl = document.getElementById('ai-progress-bar');
        const percentEl = document.getElementById('ai-progress-percentage');
        const batchEl = document.getElementById('ai-batch-info');
        const statusEl = document.getElementById('ai-progress-status');
        
        if (barEl) barEl.style.width = percentage + '%';
        if (percentEl) percentEl.textContent = percentage + '%';
        if (batchEl) batchEl.textContent = `Batch ${batchNum}/${totalBatches} · ${current}/${total} applications`;
        if (statusEl) statusEl.textContent = message;
    };
    
    const updateStatus = (message) => {
        const statusEl = document.getElementById('ai-progress-status');
        if (statusEl) statusEl.textContent = message;
    };
    
    try {
        updateStatus('📊 Preparing application data...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Clear old cache and three-lens data
        window.asisDashboardCache = null;
        
        const currentEngagement = engagementManager?.getCurrentEngagement();
        if (currentEngagement?.id) {
            clearThreeLensDashboardData(currentEngagement.id);
            console.log('[AS-IS Dashboard] Cleared old three-lens data');
        }
        
        updateStatus('🔍 Starting AI batch processing...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Re-render with AI mode enabled and progress callback
        await initASISDashboard({ 
            useAI: true,
            onProgress: updateProgress
        });
        
        // Final update
        const barEl = document.getElementById('ai-progress-bar');
        const percentEl = document.getElementById('ai-progress-percentage');
        if (barEl) barEl.style.width = '100%';
        if (percentEl) percentEl.textContent = '100%';
        updateStatus('✅ Classification complete!');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove progress indicator
        const progress = document.getElementById('ai-regenerate-progress');
        if (progress) progress.parentElement.remove();
        
        // Show success with save confirmation
        const appsCount = window.threeLensData?.apps?.length || 0;
        // Note: currentEngagement already declared at function start (line 1572)
        const savedMessage = currentEngagement?.id ? '\n💾 Saved - persists across page refreshes' : '';
        
        showToast(
            'Dashboard Regenerated with AI', 
            `✅ Three-lens classification complete\n📊 ${appsCount} applications classified${savedMessage}\n🔄 Regenerate after drag & drop or bulk updates`, 
            'success'
        );
    } catch (error) {
        console.error('[AS-IS Dashboard] Regeneration error:', error);
        const progress = document.getElementById('ai-regenerate-progress');
        if (progress) progress.parentElement.remove();
        showToast('Error', 'Failed to regenerate dashboard: ' + error.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// APPLICATION TABLE RENDERING
// ═══════════════════════════════════════════════════════════════════

function renderApplications() {
    const allApplications = engagementManager.getEntities('applications') || [];
    const container = document.getElementById('applications-container');
    const filterBar = document.getElementById('applications-filter-bar');
    
    // 🔍 DEBUG: Check for duplicate IDs
    const appIds = allApplications.map(app => app.id);
    const uniqueIds = new Set(appIds);
    if (appIds.length !== uniqueIds.size) {
        console.error('❌ DUPLICATE APPLICATION IDs DETECTED!', {
            totalApps: appIds.length,
            uniqueIds: uniqueIds.size,
            allIds: appIds,
            duplicates: appIds.filter((id, index) => appIds.indexOf(id) !== index)
        });
    } else {
        console.log('✅ All application IDs are unique:', {
            totalApps: appIds.length,
            sampleIds: appIds.slice(0, 5)
        });
    }
    
    // Show/hide filter bar
    if (filterBar) {
        filterBar.style.display = allApplications.length > 0 ? 'block' : 'none';
    }
    
    if (allApplications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-cubes"></i></div>
                <div class="empty-state-title">No applications in portfolio</div>
                <div class="empty-state-text">Import from APM Toolkit or add manually</div>
                <button class="btn btn-primary" onclick="importAPMData()">
                    <i class="fas fa-download"></i> Import from APM Toolkit
                </button>
            </div>
        `;
        return;
    }
    
    // Populate domain filter dropdown with unique domains
    const domainFilter = document.getElementById('filter-domain');
    if (domainFilter) {
        const currentValue = domainFilter.value;
        const uniqueDomains = [...new Set(allApplications.map(a => a.businessDomain).filter(Boolean))];
        
        domainFilter.innerHTML = '<option value="">All Domains</option>' + 
            uniqueDomains.sort().map(domain => 
                `<option value="${domain}">${domain}</option>`
            ).join('');
        
        domainFilter.value = currentValue; // Restore selection
    }
    
    // Apply filters
    const filteredApplications = applyApplicationFilters(allApplications);
    
    // Apply sorting
    const sortedApplications = applySortToApplications(filteredApplications);
    
    // Update filter count badge
    const filterCountBadge = document.getElementById('filter-count-badge');
    const filteredCount = document.getElementById('filtered-count');
    const totalCount = document.getElementById('total-count');
    
    if (filterCountBadge && filteredCount && totalCount) {
        const hasActiveFilters = applicationFilterState.searchText || 
                                  applicationFilterState.domain || 
                                  applicationFilterState.lifecycle || 
                                  applicationFilterState.risk;
        
        if (hasActiveFilters || filteredApplications.length !== allApplications.length) {
            filterCountBadge.style.display = 'block';
            filteredCount.textContent = filteredApplications.length;
            totalCount.textContent = allApplications.length;
        } else {
            filterCountBadge.style.display = 'none';
        }
    }
    
    // Get visible columns
    const visibleColumns = getVisibleColumns();
    
    // Generate table headers
    const tableHeaders = visibleColumns.map(col => {
        if (col.id === 'actions') {
            return `<th>Actions</th>`;
        }
        if (col.id === 'name') {
            return `
                <th style="width: 40px; text-align: center;">
                    <button onclick="deleteAllApplications()" 
                            class="btn btn-ghost" 
                            style="padding: 4px 8px; color: #dc2626;"
                            title="Delete All Applications">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </th>
                <th onclick="sortApplications('${col.id}')" style="cursor: pointer; user-select: none;">
                    ${col.label} ${getSortIcon(col.id)}
                </th>
            `;
        }
        return `<th onclick="sortApplications('${col.id}')" style="cursor: pointer; user-select: none;">
            ${col.label} ${getSortIcon(col.id)}
        </th>`;
    }).join('');
    
    // Generate table rows
    const tableRows = sortedApplications.length === 0 ? `
        <tr>
            <td colspan="${visibleColumns.length + 1}" style="text-align: center; padding: 32px; color: #9ca3af;">
                <i class="fas fa-filter" style="font-size: 24px; margin-bottom: 8px;"></i>
                <div>No applications match the current filters</div>
                <button onclick="clearApplicationFilters()" class="btn btn-ghost" style="margin-top: 12px;">
                    <i class="fas fa-times"></i> Clear Filters
                </button>
            </td>
        </tr>
    ` : sortedApplications.map(app => {
        const cells = visibleColumns.map(col => {
            switch(col.id) {
                case 'name':
                    return `
                        <td style="text-align: center;">
                            <input type="checkbox" 
                                   class="app-select-checkbox"
                                   data-app-id="${app.id}" 
                                   ${applicationSelectionState.selectedIds.has(app.id) ? 'checked' : ''}
                                   style="cursor: pointer;">
                        </td>
                        <td>
                            <strong>${app.name || 'Unnamed'}</strong>
                            ${app.sunsetCandidate ? '<span class="badge badge-high" style="margin-left: 8px;">Sunset</span>' : ''}
                            ${app.modernizationCandidate ? '<span class="badge badge-medium" style="margin-left: 8px;">Modernize</span>' : ''}
                        </td>
                    `;
                case 'domain':
                    return `<td>${app.businessDomain || '-'}</td>`;
                case 'lifecycle':
                    return `<td><span class="badge badge-${app.lifecycle || 'active'}">${app.lifecycle || 'active'}</span></td>`;
                case 'action':
                    return `<td>${app.action ? `<span class="badge badge-${app.action}">${app.action}</span>` : '-'}</td>`;
                case 'rationalizationAction':
                    return `<td>${app.rationalizationAction ? `<span class="badge badge-${app.rationalizationAction}">${app.rationalizationAction}</span>` : '-'}</td>`;
                case 'risk':
                    return `<td><span class="badge badge-${app.riskLevel || 'medium'}">${app.riskLevel || 'medium'}</span></td>`;
                case 'debt':
                    return `<td><span class="badge badge-${app.technicalDebt || 'medium'}">${app.technicalDebt || 'medium'}</span></td>`;
                case 'owner':
                    return `<td>${app.owner || '-'}</td>`;
                case 'vendor':
                    return `<td>${app.vendor || '-'}</td>`;
                case 'technology':
                    return `<td>${app.technologyStack || '-'}</td>`;
                case 'techfit':
                    return `<td>${app.technicalFit ? `${app.technicalFit}/5` : '-'}</td>`;
                case 'bizvalue':
                    return `<td>${app.businessValue ? `${app.businessValue}/5` : '-'}</td>`;
                case 'users':
                    return `<td>${app.users ? app.users.toLocaleString() : '-'}</td>`;
                case 'cost':
                    return `<td>${app.annualCost ? (app.annualCost || 0).toLocaleString() + ' SEK' : '-'}</td>`;
                case 'actions':
                    return `
                        <td>
                            <button class="btn btn-ghost" style="padding: 4px 8px;" onclick="openApplicationModal('${app.id}')" title="Edit Application">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-ghost" style="padding: 4px 8px; color: #dc2626;" onclick="deleteApplication('${app.id}')" title="Delete Application">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                default:
                    return '<td>-</td>';
            }
        }).join('');
        
        return `<tr>${cells}</tr>`;
    }).join('');
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
    
    // Initialize listeners ONCE (will skip if already initialized)
    setTimeout(() => {
        initializeCheckboxListeners();
        
        // Sync checkbox visual state with selection state (important after table re-render)
        updateCheckboxStates();
        
        // Update bulk actions UI to reflect current selection
        updateBulkActionsUI();
        
        // Adjust table header position based on filter bar height
        adjustTableHeaderPosition();
    }, 0);
}

/**
 * Initialize checkbox event listeners (call only ONCE)
 */
function initializeCheckboxListeners() {
    const container = document.getElementById('applications-container');
    if (!container) {
        console.error('❌ Container #applications-container NOT FOUND!');
        return;
    }
    
    // Check if this specific container already has a listener using a data attribute
    if (container.dataset.listenerAttached === 'true') {
        console.log('⏭️ Listener already attached to this container, skipping');
        return;
    }
    
    // Remove old listener if it exists (failsafe)
    if (checkboxChangeHandler) {
        container.removeEventListener('change', checkboxChangeHandler);
    }
    
    // Define the handler function
    checkboxChangeHandler = function(event) {
        // Check if event was on a checkbox
        const checkbox = event.target;
        if (checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') {
            return;
        }
        
        if (!checkbox.classList.contains('app-select-checkbox')) {
            return;
        }
        
        // Get app ID
        const appId = checkbox.getAttribute('data-app-id');
        if (!appId) {
            console.warn('⚠️ Checkbox has no data-app-id attribute');
            return;
        }
        
        // Update selection state based on checkbox state
        if (checkbox.checked) {
            applicationSelectionState.selectedIds.add(appId);
        } else {
            applicationSelectionState.selectedIds.delete(appId);
        }
        
        // Update bulk actions UI
        updateBulkActionsUI();
    };
    
    // Attach the listener
    container.addEventListener('change', checkboxChangeHandler);
    
    // Mark this container as having a listener attached
    container.dataset.listenerAttached = 'true';
    
    checkboxListenerInitialized = true;
}

/**
 * Handle checkbox change events (LEGACY - NOT USED)
 */
function handleCheckboxChange(event) {
    console.warn('⚠️ Legacy handleCheckboxChange called - should not happen');
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 4: CAPABILITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openCapabilityModal(id = null) {
    document.getElementById('capability-edit-id').value = id || '';
    
    if (id) {
        const cap = engagementManager.getEntity('capabilities', id);
        if (cap) {
            document.getElementById('capability-modal-title').textContent = 'Edit Capability';
            document.getElementById('capability-name').value = cap.name || '';
            document.getElementById('capability-domain').value = cap.domain || '';
            document.getElementById('capability-level').value = cap.level || 'L2';
            document.getElementById('capability-maturity').value = cap.maturity || 3;
            document.getElementById('capability-target').value = cap.targetMaturity || 4;
            document.getElementById('capability-importance').value = cap.strategicImportance || 'high';
            document.getElementById('capability-description').value = cap.description || '';
        }
    } else {
        document.getElementById('capability-modal-title').textContent = 'Add Capability';
        document.getElementById('capability-name').value = '';
        document.getElementById('capability-domain').value = '';
        document.getElementById('capability-level').value = 'L2';
        document.getElementById('capability-maturity').value = 3;
        document.getElementById('capability-target').value = 4;
        document.getElementById('capability-importance').value = 'high';
        document.getElementById('capability-description').value = '';
    }
    
    document.getElementById('capabilityModal').classList.remove('hidden');
}

function closeCapabilityModal() {
    document.getElementById('capabilityModal').classList.add('hidden');
}

function saveCapability() {
    const id = document.getElementById('capability-edit-id').value;
    const name = document.getElementById('capability-name').value;
    const domain = document.getElementById('capability-domain').value;
    const level = document.getElementById('capability-level').value;
    const maturity = parseInt(document.getElementById('capability-maturity').value);
    const targetMaturity = parseInt(document.getElementById('capability-target').value);
    const strategicImportance = document.getElementById('capability-importance').value;
    const description = document.getElementById('capability-description').value;
    
    if (!name || !domain) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    const gap = targetMaturity - maturity;
    
    const capability = {
        name, domain, level, maturity, targetMaturity, gap,
        strategicImportance, description,
        linkedApplications: []
    };
    
    if (id) {
        engagementManager.updateEntity('capabilities', id, capability);
    } else {
        engagementManager.addEntity('capabilities', capability);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeCapabilityModal();
    renderWhitespace();
    updateKPIs();
    
    showToast('Capability Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

// ═══════════════════════════════════════════════════════════════════
// DEPRECATED: Old White-Spot Implementation (replaced by WhiteSpot Heatmap)
// ═══════════════════════════════════════════════════════════════════
// This function has been replaced by renderWhiteSpotHeatmap() in whitespot_heatmap_renderer.js
// Kept here for reference only - DO NOT USE
/*
function renderWhitespace() {
    const capabilities = engagementManager.getEntities('capabilities') || [];
    const container = document.getElementById('whitespace-container');
    
    if (capabilities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chart-line"></i></div>
                <div class="empty-state-title">No capability gaps defined</div>
                <div class="empty-state-text">Define capabilities to identify white-spots and opportunities</div>
            </div>
        `;
        return;
    }
    
    const gapStats = capabilities.reduce((acc, cap) => {
        const gap = cap.gap || 0;
        if (gap > 0) acc.hasGap++;
        if (gap >= 2) acc.critical++;
        return acc;
    }, { hasGap: 0, critical: 0 });
    
    container.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 12px;">
                <i class="fas fa-chart-bar" style="margin-right: 8px;"></i>Gap Analysis Summary
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #065f46;">${capabilities.length}</div>
                    <div style="font-size: 12px; color: #047857;">Total Capabilities</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #d97706;">${gapStats.hasGap}</div>
                    <div style="font-size: 12px; color: #92400e;">With Gaps</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${gapStats.critical}</div>
                    <div style="font-size: 12px; color: #991b1b;">Critical Gaps (≥2)</div>
                </div>
            </div>
        </div>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th>Capability</th>
                    <th>Domain</th>
                    <th>Level</th>
                    <th>Current</th>
                    <th>Target</th>
                    <th>Gap</th>
                    <th>Importance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${capabilities.map(cap => {
                    const gap = cap.gap || 0;
                    const gapClass = gap >= 2 ? 'badge-high' : gap === 1 ? 'badge-medium' : 'badge-low';
                    return `
                        <tr>
                            <td><strong>${cap.name || 'Unnamed'}</strong></td>
                            <td>${cap.domain || '-'}</td>
                            <td><span class="badge badge-draft">${cap.level || 'L2'}</span></td>
                            <td>${cap.maturity || 0}</td>
                            <td>${cap.targetMaturity || 0}</td>
                            <td><span class="badge ${gapClass}">${gap > 0 ? '+' + gap : gap}</span></td>
                            <td><span class="badge badge-${cap.strategicImportance || 'medium'}">${cap.strategicImportance || 'medium'}</span></td>
                            <td>
                                <button class="btn btn-ghost" style="padding: 4px 8px;" onclick="openCapabilityModal('${cap.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}
*/

// ═══════════════════════════════════════════════════════════════════
// CANVAS 5: ARCHITECTURE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openArchitectureModal(id = null) {
    document.getElementById('architecture-edit-id').value = id || '';
    
    let linkedServices = [];
    
    if (id) {
        const arch = engagementManager.getEntity('architectureViews', id);
        if (arch) {
            document.getElementById('architecture-modal-title').textContent = 'Edit Architecture Theme';
            document.getElementById('architecture-name').value = arch.name || '';
            document.getElementById('architecture-type').value = arch.type || 'target';
            document.getElementById('architecture-diagram-type').value = arch.diagramType || 'application-landscape';
            document.getElementById('architecture-principles').value = (arch.principles || []).join('\n');
            document.getElementById('architecture-patterns').value = (arch.patterns || []).join('\n');
            document.getElementById('architecture-description').value = arch.description || '';
            linkedServices = arch.linkedServices || [];
        }
    } else {
        document.getElementById('architecture-modal-title').textContent = 'Add Architecture Theme';
        document.getElementById('architecture-name').value = '';
        document.getElementById('architecture-type').value = 'target';
        document.getElementById('architecture-diagram-type').value = 'application-landscape';
        document.getElementById('architecture-principles').value = '';
        document.getElementById('architecture-patterns').value = '';
        document.getElementById('architecture-description').value = '';
    }
    
    // V2.0 E2E Integration: Populate service checkboxes
    const selectedServices = (window.currentEngagement && window.currentEngagement.selectedServices) || [];
    const selectedServicesData = (window.currentEngagement && window.currentEngagement.selectedServicesData) || [];
    
    const serviceLinkingSection = document.getElementById('architecture-service-linking-section');
    const checkboxContainer = document.getElementById('architecture-service-checkboxes');
    
    if (selectedServices.length > 0) {
        // Show service linking section
        serviceLinkingSection.style.display = 'block';
        
        // Build checkbox list grouped by L1
        const servicesByL1 = {};
        selectedServicesData.forEach(service => {
            const l1 = service.l1Category || service.l1ParentName || 'Other';
            if (!servicesByL1[l1]) servicesByL1[l1] = [];
            servicesByL1[l1].push(service);
        });
        
        let checkboxHTML = '';
        Object.keys(servicesByL1).sort().forEach(l1 => {
            checkboxHTML += `
                <div style="margin-bottom: 16px;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 13px;">
                        <i class="fas fa-folder" style="color: #10b981;"></i> ${l1}
                    </div>
            `;
            
            servicesByL1[l1].forEach(service => {
                const isChecked = linkedServices.includes(service.id) ? 'checked' : '';
                checkboxHTML += `
                    <div style="margin-left: 20px; margin-bottom: 6px;">
                        <label style="display: flex; align-items: center; cursor: pointer; font-size: 13px;">
                            <input type="checkbox" 
                                   value="${service.id}" 
                                   class="arch-service-checkbox" 
                                   ${isChecked}
                                   style="margin-right: 8px;">
                            <span style="color: #1f2937;">${service.name}</span>
                            <span style="color: #9ca3af; font-size: 12px; margin-left: 8px;">(${service.category || 'Service'})</span>
                        </label>
                    </div>
                `;
            });
            
            checkboxHTML += '</div>';
        });
        
        checkboxContainer.innerHTML = checkboxHTML;
    } else {
        // Hide service linking section if no services selected
        serviceLinkingSection.style.display = 'none';
        checkboxContainer.innerHTML = '<p style="color: #9ca3af; font-size: 13px; text-align: center; padding: 16px;">No services selected in WhiteSpot Heatmap yet.</p>';
    }
    
    document.getElementById('architectureModal').classList.remove('hidden');
}

function closeArchitectureModal() {
    document.getElementById('architectureModal').classList.add('hidden');
}

function deleteArchitecture(id) {
    const arch = engagementManager.getEntity('architectureThemes', id);
    if (!arch) return;
    
    // Check if architecture has linked services
    const linkedServicesCount = (arch.linkedServices || []).length;
    
    // Build confirmation message
    let confirmMsg = `Are you sure you want to delete "${arch.name}"?`;
    
    if (linkedServicesCount > 0) {
        confirmMsg += `\n\n⚠️ Warning: This architecture is currently linked to ${linkedServicesCount} service${linkedServicesCount !== 1 ? 's' : ''}. These links will be removed.`;
    }
    
    confirmMsg += '\n\nThis action cannot be undone.';
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Delete the architecture
    engagementManager.deleteEntity('architectureThemes', id);
    
    // Update engagement references
    currentEngagement = engagementManager.getCurrentEngagement();
    window.currentEngagement = currentEngagement;
    
    // V2.0: Update serviceToArchitectureMap to remove deleted architecture references
    if (typeof updateServiceToArchitectureMap === 'function') {
        updateServiceToArchitectureMap();
    }
    
    // Refresh views
    renderTarget();
    
    // Refresh Target Services view if services were linked
    if (linkedServicesCount > 0 && typeof renderTargetServices === 'function') {
        renderTargetServices();
    }
    
    updateKPIs();
    
    showToast('Architecture Theme Deleted', `"${arch.name}" has been removed`, 'success');
}

function saveArchitecture() {
    const id = document.getElementById('architecture-edit-id').value;
    const name = document.getElementById('architecture-name').value;
    const type = document.getElementById('architecture-type').value;
    const diagramType = document.getElementById('architecture-diagram-type').value;
    const principles = document.getElementById('architecture-principles').value.split('\n').filter(p => p.trim());
    const patterns = document.getElementById('architecture-patterns').value.split('\n').filter(p => p.trim());
    const description = document.getElementById('architecture-description').value;
    
    if (!name) {
        showToast('Validation Error', 'Please enter a name', 'error');
        return;
    }
    
    // V2.0 E2E Integration: Capture linkedServices from checkboxes
    const serviceCheckboxes = document.querySelectorAll('.arch-service-checkbox:checked');
    const linkedServices = Array.from(serviceCheckboxes).map(cb => cb.value);
    
    const architecture = {
        name, type, diagramType, principles, patterns, description,
        linkedCapabilities: [],
        linkedApplications: [],
        linkedServices: linkedServices  // V2.0: Service linking
    };
    
    if (id) {
        engagementManager.updateEntity('architectureThemes', id, architecture);
    } else {
        engagementManager.addEntity('architectureThemes', architecture);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    window.currentEngagement = currentEngagement; // Expose to modules
    
    // V2.0: Update serviceToArchitectureMap
    if (typeof updateServiceToArchitectureMap === 'function') {
        updateServiceToArchitectureMap();
    }
    
    closeArchitectureModal();
    renderTarget();
    updateKPIs();
    
    const serviceCount = linkedServices.length;
    const serviceMsg = serviceCount > 0 ? ` (${serviceCount} service${serviceCount !== 1 ? 's' : ''} linked)` : '';
    showToast('Architecture Theme Saved', id ? `Updated ${name}${serviceMsg}` : `Added ${name}${serviceMsg}`, 'success');
}

function renderTarget() {
    // V2.0: Render selected services section first
    if (typeof renderTargetServices === 'function') {
        renderTargetServices();
    }
    
    const architectures = engagementManager.getEntities('architectureThemes') || [];
    const container = document.getElementById('target-container');
    
    if (architectures.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-bullseye"></i></div>
                <div class="empty-state-title">No target architecture defined</div>
                <div class="empty-state-text">Define principles, patterns, and reference architectures</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = architectures.map(arch => `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">${arch.name}</h3>
                    <div style="display: flex; gap: 8px;">
                        <span class="badge badge-${arch.type === 'target' ? 'active' : arch.type === 'as-is' ? 'draft' : 'medium'}">${(arch.type || 'other').toUpperCase()}</span>
                        ${arch.diagramType ? `<span class="badge badge-draft">${arch.diagramType.replace('-', ' ')}</span>` : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost" onclick="openArchitectureModal('${arch.id}')" title="Edit Architecture">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-ghost" onclick="deleteArchitecture('${arch.id}')" style="color: #ef4444;" title="Delete Architecture">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${arch.description ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">${arch.description}</p>` : ''}
            
            ${arch.linkedServices && arch.linkedServices.length > 0 ? `
                <div style="margin-bottom: 16px;">
                    <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        <i class="fas fa-cubes" style="color: #10b981; margin-right: 6px;"></i>Linked Services (${arch.linkedServices.length})
                    </h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${arch.linkedServices.map(svcId => {
                            const svc = (window.currentEngagement?.selectedServicesData || []).find(s => s.id === svcId);
                            return svc ? `<span class="badge badge-active" style="font-size: 11px;">${svc.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${arch.principles && arch.principles.length > 0 ? `
                <div style="margin-bottom: 16px;">
                    <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        <i class="fas fa-lightbulb" style="color: #10b981; margin-right: 6px;"></i>Principles
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                        ${arch.principles.map(p => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${arch.patterns && arch.patterns.length > 0 ? `
                <div>
                    <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        <i class="fas fa-code-branch" style="color: #10b981; margin-right: 6px;"></i>Patterns
                    </h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${arch.patterns.map(p => `<span class="badge badge-active">${p}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 6: INITIATIVE & ROADMAP MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openInitiativeModal(id = null) {
    document.getElementById('initiative-edit-id').value = id || '';
    
    // Reset value type checkboxes
    ['cost', 'risk', 'speed', 'compliance', 'revenue', 'quality'].forEach(type => {
        document.getElementById('value-' + type).checked = false;
    });
    
    if (id) {
        const init = engagementManager.getEntity('initiatives', id);
        if (init) {
            document.getElementById('initiative-modal-title').textContent = 'Edit Initiative';
            document.getElementById('initiative-name').value = init.name || '';
            document.getElementById('initiative-description').value = init.description || '';
            document.getElementById('initiative-themes').value = (init.linkedThemes || []).join(', ');
            document.getElementById('initiative-horizon').value = init.timeHorizon || 'mid';
            document.getElementById('initiative-status').value = init.status || 'option';
            document.getElementById('initiative-effort').value = init.effort || 'M';
            document.getElementById('initiative-cost').value = init.estimatedCost || 0;
            document.getElementById('initiative-outcomes').value = (init.businessOutcomes || []).join('\n');
            document.getElementById('initiative-owner').value = init.owner || '';
            
            // Check value type checkboxes
            (init.valueType || []).forEach(type => {
                const checkbox = document.getElementById('value-' + type);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        document.getElementById('initiative-modal-title').textContent = 'Add Initiative';
        document.getElementById('initiative-name').value = '';
        document.getElementById('initiative-description').value = '';
        document.getElementById('initiative-themes').value = '';
        document.getElementById('initiative-horizon').value = 'mid';
        document.getElementById('initiative-status').value = 'option';
        document.getElementById('initiative-effort').value = 'M';
        document.getElementById('initiative-cost').value = 0;
        document.getElementById('initiative-outcomes').value = '';
        document.getElementById('initiative-owner').value = '';
    }
    
    document.getElementById('initiativeModal').classList.remove('hidden');
}

function closeInitiativeModal() {
    document.getElementById('initiativeModal').classList.add('hidden');
}

function saveInitiative() {
    const id = document.getElementById('initiative-edit-id').value;
    const name = document.getElementById('initiative-name').value;
    const description = document.getElementById('initiative-description').value;
    const themesInput = document.getElementById('initiative-themes').value;
    const linkedThemes = themesInput.split(',').map(t => t.trim()).filter(t => t);
    const timeHorizon = document.getElementById('initiative-horizon').value;
    const status = document.getElementById('initiative-status').value;
    const effort = document.getElementById('initiative-effort').value;
    const estimatedCost = parseFloat(document.getElementById('initiative-cost').value) || 0;
    const businessOutcomes = document.getElementById('initiative-outcomes').value.split('\n').filter(o => o.trim());
    const owner = document.getElementById('initiative-owner').value;
    
    // Get checked value types
    const valueType = [];
    ['cost', 'risk', 'speed', 'compliance', 'revenue', 'quality'].forEach(type => {
        if (document.getElementById('value-' + type).checked) {
            valueType.push(type);
        }
    });
    
    // Validation
    if (!name) {
        showToast('Validation Error', 'Please enter an initiative name', 'error');
        return;
    }
    if (linkedThemes.length === 0) {
        showToast('Validation Error', 'Please enter at least one theme', 'error');
        return;
    }
    if (businessOutcomes.length === 0) {
        showToast('Validation Error', 'Please enter at least one business outcome', 'error');
        return;
    }
    if (valueType.length === 0) {
        showToast('Validation Error', 'Please select at least one value driver', 'error');
        return;
    }
    
    const initiative = {
        name, description, linkedThemes, timeHorizon, status, effort, estimatedCost,
        businessOutcomes, valueType, owner,
        dependencies: [],
        risks: []
    };
    
    if (id) {
        engagementManager.updateEntity('initiatives', id, initiative);
    } else {
        engagementManager.addEntity('initiatives', initiative);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeInitiativeModal();
    renderRoadmap();
    updateKPIs();
    
    showToast('Initiative Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderRoadmap() {
    const initiatives = engagementManager.getEntities('initiatives') || [];
    const container = document.getElementById('roadmap-container');
    
    if (initiatives.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-road"></i></div>
                <div class="empty-state-title">No initiatives defined</div>
                <div class="empty-state-text">Create initiatives and sequence them on the roadmap</div>
            </div>
        `;
        return;
    }
    
    const byHorizon = initiatives.reduce((acc, init) => {
        const horizon = init.timeHorizon || 'short'; // Default to short if undefined
        if (!acc[horizon]) acc[horizon] = [];
        acc[horizon].push(init);
        return acc;
    }, {});
    
    container.innerHTML = `
        <div style="margin-bottom: 16px; padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-info-circle" style="color: #0284c7;"></i>
            <span style="font-size: 13px; color: #0c4a6e;">
                <strong>Tip:</strong> Drag and drop initiatives between time horizons to reorganize your roadmap
            </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            ${['short', 'mid', 'long'].map(horizon => {
                const inits = byHorizon[horizon] || [];
                const horizonLabel = horizon === 'short' ? 'Short-term (0-12mo)' : horizon === 'mid' ? 'Mid-term (12-24mo)' : 'Long-term (24mo+)';
                const horizonColor = horizon === 'short' ? '#10b981' : horizon === 'mid' ? '#f59e0b' : '#3b82f6';
                
                return `
                    <div class="roadmap-column" data-horizon="${horizon}" 
                         style="background: white; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 20px; min-height: 400px;"
                         ondragover="allowDrop(event)" ondrop="dropInitiative(event, '${horizon}')">
                        <h3 style="font-size: 14px; font-weight: 700; color: ${horizonColor}; margin-bottom: 16px; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between;">
                            <span>${horizonLabel}</span>
                            <span style="background: ${horizonColor}20; color: ${horizonColor}; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${inits.length}</span>
                        </h3>
                        <div class="roadmap-items" style="display: flex; flex-direction: column; gap: 12px;">
                            ${inits.length === 0 ? `
                                <div style="text-align: center; padding: 40px 20px; color: #9ca3af; border: 2px dashed #e5e7eb; border-radius: 8px; background: #f9fafb;">
                                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 8px; display: block;"></i>
                                    <div style="font-size: 13px;">Drop initiatives here</div>
                                </div>
                            ` : inits.map(init => `
                                <div class="initiative-card" draggable="true" data-id="${init.id}" data-horizon="${horizon}"
                                     ondragstart="dragInitiative(event)"
                                     style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; cursor: move; transition: all 0.2s;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                                <i class="fas fa-grip-vertical" style="color: #9ca3af; font-size: 12px;"></i>
                                                <strong style="font-size: 14px; color: #111827;">${init.name || 'Unnamed'}</strong>
                                            </div>
                                            ${init.description ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${init.description}</div>` : ''}
                                        </div>
                                        <button class="btn btn-ghost" style="padding: 2px 6px; font-size: 12px;" onclick="openInitiativeModal('${init.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                    <div style="display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
                                        <span class="badge badge-${init.status === 'approved' ? 'active' : init.status === 'option' ? 'draft' : 'medium'}">${init.status || 'draft'}</span>
                                        <span class="badge badge-draft">${init.effort || 'medium'}</span>
                                        ${init.owner ? `<span class="badge" style="background: #e0e7ff; color: #4338ca;"><i class="fas fa-user" style="font-size: 10px;"></i> ${init.owner}</span>` : ''}
                                    </div>
                                    ${init.estimatedCost > 0 ? `
                                        <div style="font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 6px;">
                                            <i class="fas fa-coins" style="color: #f59e0b;"></i>
                                            <strong>${((init.estimatedCost || 0) / 1000000).toFixed(1)}M SEK</strong>
                                        </div>
                                    ` : ''}
                                    ${init.businessOutcomes && init.businessOutcomes.length > 0 ? `
                                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                <i class="fas fa-bullseye" style="color: #10b981;"></i> Outcomes:
                                            </div>
                                            <div style="font-size: 11px; color: #374151;">
                                                ${init.businessOutcomes.slice(0, 2).join(' • ')}${init.businessOutcomes.length > 2 ? '...' : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Add hover effects via CSS
    addRoadmapStyles();
}

function addRoadmapStyles() {
    if (!document.getElementById('roadmap-drag-styles')) {
        const style = document.createElement('style');
        style.id = 'roadmap-drag-styles';
        style.textContent = `
            .initiative-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-color: #3b82f6 !important;
            }
            .initiative-card.dragging {
                opacity: 0.5;
            }
            .roadmap-column.drag-over {
                background: #f0f9ff !important;
                border-color: #3b82f6 !important;
                border-style: solid !important;
            }
        `;
        document.head.appendChild(style);
    }
}

function dragInitiative(event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('initiativeId', event.target.dataset.id);
    event.dataTransfer.setData('sourceHorizon', event.target.dataset.horizon);
    event.target.classList.add('dragging');
}

function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    const column = event.currentTarget;
    if (column.classList.contains('roadmap-column')) {
        column.classList.add('drag-over');
    }
}

function dropInitiative(event, targetHorizon) {
    event.preventDefault();
    
    const initiativeId = event.dataTransfer.getData('initiativeId');
    const sourceHorizon = event.dataTransfer.getData('sourceHorizon');
    
    // Remove visual feedback
    document.querySelectorAll('.roadmap-column').forEach(col => col.classList.remove('drag-over'));
    document.querySelectorAll('.initiative-card').forEach(card => card.classList.remove('dragging'));
    
    if (sourceHorizon === targetHorizon) {
        return; // No change needed
    }
    
    // Update the initiative's timeHorizon
    const success = engagementManager.updateEntity('initiatives', initiativeId, {
        timeHorizon: targetHorizon
    });
    
    if (success) {
        currentEngagement = engagementManager.getCurrentEngagement();
        renderRoadmap();
        
        const horizonLabels = {
            short: 'Short-term (0-12mo)',
            mid: 'Mid-term (12-24mo)',
            long: 'Long-term (24mo+)'
        };
        
        showToast('Initiative Moved', `Moved to ${horizonLabels[targetHorizon]}`, 'success');
    } else {
        showToast('Error', 'Failed to move initiative', 'error');
    }
}

// Clean up drag feedback when drag leaves column
document.addEventListener('dragleave', function(event) {
    if (event.target.classList.contains('roadmap-column')) {
        event.target.classList.remove('drag-over');
    }
});

document.addEventListener('dragend', function(event) {
    document.querySelectorAll('.initiative-card').forEach(card => card.classList.remove('dragging'));
    document.querySelectorAll('.roadmap-column').forEach(col => col.classList.remove('drag-over'));
});

// ═══════════════════════════════════════════════════════════════════
// CANVAS 7: LEADERSHIP VIEW
// ═══════════════════════════════════════════════════════════════════

function renderLeadership() {
    const initiatives = engagementManager.getEntities('initiatives') || [];
    const applications = engagementManager.getEntities('applications') || [];
    const capabilities = engagementManager.getEntities('capabilities') || [];
    const risks = engagementManager.getEntities('risks') || [];
    const container = document.getElementById('leadership-container');
    
    if (initiatives.length === 0 && applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chart-pie"></i></div>
                <div class="empty-state-title">Insufficient data for leadership view</div>
                <div class="empty-state-text">Complete other canvases to generate the portfolio view</div>
            </div>
        `;
        return;
    }
    
    const stats = {
        totalApps: applications.length,
        sunsetCandidates: applications.filter(a => a.sunsetCandidate).length,
        modernizeCandidates: applications.filter(a => a.modernizationCandidate).length,
        totalInitiatives: initiatives.length,
        approvedInitiatives: initiatives.filter(i => i.status === 'approved' || i.status === 'in-progress').length,
        totalCost: initiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
        criticalGaps: capabilities.filter(c => (c.gap || 0) >= 2).length,
        highRisks: risks.filter(r => (r.severity || 0) >= 6).length
    };
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; color: white;">
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Portfolio Overview</h2>
            <p style="opacity: 0.9; font-size: 14px;">Strategic summary for leadership review</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div class="kpi-card">
                <div class="kpi-value">${stats.totalApps}</div>
                <div class="kpi-label">Applications</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${stats.totalInitiatives}</div>
                <div class="kpi-label">Initiatives</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${stats.approvedInitiatives}</div>
                <div class="kpi-label">Approved</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${(stats.totalCost / 1000000).toFixed(1)}M</div>
                <div class="kpi-label">Total Investment (€)</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
            <!-- Application Lifecycle Chart -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                    <i class="fas fa-chart-pie" style="color: #10b981; margin-right: 8px;"></i>Application Lifecycle
                </h3>
                <canvas id="appLifecycleChart" style="max-height: 250px;"></canvas>
            </div>
            
            <!-- Initiative Timeline Chart -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                    <i class="fas fa-chart-bar" style="color: #3b82f6; margin-right: 8px;"></i>Initiative Timeline
                </h3>
                <canvas id="initiativeTimelineChart" style="max-height: 250px;"></canvas>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
            <!-- Capability Maturity Chart -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                    <i class="fas fa-chart-line" style="color: #8b5cf6; margin-right: 8px;"></i>Capability Maturity
                </h3>
                <canvas id="capabilityMaturityChart" style="max-height: 250px;"></canvas>
            </div>
            
            <!-- Risk Distribution Chart -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444; margin-right: 8px;"></i>Risk Distribution
                </h3>
                <canvas id="riskDistributionChart" style="max-height: 250px;"></canvas>
            </div>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                <i class="fas fa-flag" style="color: #f59e0b; margin-right: 8px;"></i>Key Highlights
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 20px; font-weight: 700; color: #92400e;">${stats.sunsetCandidates}</div>
                    <div style="font-size: 13px; color: #78350f;">Applications to Sunset</div>
                    <div style="font-size: 11px; color: #92400e; margin-top: 4px;">Retire legacy systems</div>
                </div>
                <div style="padding: 16px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <div style="font-size: 20px; font-weight: 700; color: #1e40af;">${stats.modernizeCandidates}</div>
                    <div style="font-size: 13px; color: #1e3a8a;">Modernization Targets</div>
                    <div style="font-size: 11px; color: #1e40af; margin-top: 4px;">Technical debt reduction</div>
                </div>
                <div style="padding: 16px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <div style="font-size: 20px; font-weight: 700; color: #991b1b;">${stats.highRisks}</div>
                    <div style="font-size: 13px; color: #7f1d1d;">High-Severity Risks</div>
                    <div style="font-size: 11px; color: #991b1b; margin-top: 4px;">Requires immediate attention</div>
                </div>
            </div>
        </div>
    `;
    
    // Render charts after DOM is updated
    setTimeout(() => {
        renderAppLifecycleChart(applications);
        renderInitiativeTimelineChart(initiatives);
        renderCapabilityMaturityChart(capabilities);
        renderRiskDistributionChart(risks);
    }, 100);
}

// ═══════════════════════════════════════════════════════════════════
// CHART RENDERING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function renderAppLifecycleChart(applications) {
    const canvas = document.getElementById('appLifecycleChart');
    if (!canvas) return;
    
    const lifecycleCounts = {
        retire: applications.filter(a => a.lifecycle === 'retire').length,
        tolerate: applications.filter(a => a.lifecycle === 'tolerate').length,
        invest: applications.filter(a => a.lifecycle === 'invest').length,
        migrate: applications.filter(a => a.lifecycle === 'migrate').length
    };
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Retire', 'Tolerate', 'Invest', 'Migrate'],
            datasets: [{
                data: [lifecycleCounts.retire, lifecycleCounts.tolerate, lifecycleCounts.invest, lifecycleCounts.migrate],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function renderInitiativeTimelineChart(initiatives) {
    const canvas = document.getElementById('initiativeTimelineChart');
    if (!canvas) return;
    
    const timeHorizonCounts = {
        short: initiatives.filter(i => i.timeHorizon === 'short').length,
        mid: initiatives.filter(i => i.timeHorizon === 'mid').length,
        long: initiatives.filter(i => i.timeHorizon === 'long').length
    };
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Short-Term\n(0-12mo)', 'Mid-Term\n(12-24mo)', 'Long-Term\n(24mo+)'],
            datasets: [{
                label: 'Initiatives',
                data: [timeHorizonCounts.short, timeHorizonCounts.mid, timeHorizonCounts.long],
                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderCapabilityMaturityChart(capabilities) {
    const canvas = document.getElementById('capabilityMaturityChart');
    if (!canvas) return;
    
    if (capabilities.length === 0) {
        canvas.getContext('2d').fillText('No capability data', 10, 10);
        return;
    }
    
    const avgCurrentMaturity = capabilities.reduce((sum, c) => sum + (c.maturity || 0), 0) / capabilities.length;
    const avgTargetMaturity = capabilities.reduce((sum, c) => sum + (c.targetMaturity || 0), 0) / capabilities.length;
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Current', 'Target'],
            datasets: [{
                label: 'Avg Maturity',
                data: [avgCurrentMaturity.toFixed(1), avgTargetMaturity.toFixed(1)],
                backgroundColor: ['#f59e0b', '#10b981'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderRiskDistributionChart(risks) {
    const canvas = document.getElementById('riskDistributionChart');
    if (!canvas) return;
    
    const severityCounts = {
        critical: risks.filter(r => (r.severity || 0) >= 7).length,
        high: risks.filter(r => (r.severity || 0) >= 4 && (r.severity || 0) < 7).length,
        low: risks.filter(r => (r.severity || 0) > 0 && (r.severity || 0) < 4).length
    };
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Critical\n(7-9)', 'High\n(4-6)', 'Low\n(1-3)'],
            datasets: [{
                label: 'Risks',
                data: [severityCounts.critical, severityCounts.high, severityCounts.low],
                backgroundColor: ['#dc2626', '#f59e0b', '#10b981'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}




// -------------------------------------------------------------------
// GLOBAL SCOPE EXPOSURE (for ea_engagement_core.js compatibility)
// -------------------------------------------------------------------

if (typeof window !== 'undefined') {
    window.renderStakeholders = renderStakeholders;
    window.renderApplications = renderApplications;
    window.renderTarget = renderTarget;
    window.renderRoadmap = renderRoadmap;
    window.renderLeadership = renderLeadership;
    window.saveThreeLensDashboardData = saveThreeLensDashboardData;
    window.togglePortfolioView = togglePortfolioView;
    // console.log('[Canvas Impl] ✅ Global functions exposed:', {
    //     renderStakeholders: typeof renderStakeholders,
    //     renderApplications: typeof renderApplications,
    //     renderTarget: typeof renderTarget,
    //     renderRoadmap: typeof renderRoadmap,
    //     renderLeadership: typeof renderLeadership,
    //     saveThreeLensDashboardData: typeof saveThreeLensDashboardData
    // });
}
