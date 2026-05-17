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
            document.getElementById('application-technology').value = app.technology || '';
            // Lifecycle & assessment
            document.getElementById('application-lifecycle').value = app.lifecycle || 'tolerate';
            document.getElementById('application-action').value = app.action || 'retain';
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
        document.getElementById('application-lifecycle').value = 'tolerate';
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
        technology: document.getElementById('application-technology').value,
        
        // Lifecycle & assessment
        lifecycle: document.getElementById('application-lifecycle').value,
        action: document.getElementById('application-action').value,
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
        // Text search (across name, domain, vendor, technology)
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
                const lifecycleOrder = { 'invest': 1, 'tolerate': 2, 'migrate': 3, 'retire': 4 };
                aVal = lifecycleOrder[a.lifecycle] || 99;
                bVal = lifecycleOrder[b.lifecycle] || 99;
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
    
    // Refresh the display
    renderApplications();
    
    showNotification(`Successfully deleted all ${allApplications.length} applications`, 'success');
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

function renderApplications() {
    const allApplications = engagementManager.getEntities('applications') || [];
    const container = document.getElementById('applications-container');
    const filterBar = document.getElementById('applications-filter-bar');
    
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
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 40px; text-align: center;">
                        <button onclick="deleteAllApplications()" 
                                class="btn btn-ghost" 
                                style="padding: 4px 8px; color: #dc2626;"
                                title="Delete All Applications">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </th>
                    <th onclick="sortApplications('name')" style="cursor: pointer; user-select: none;">
                        Application ${getSortIcon('name')}
                    </th>
                    <th onclick="sortApplications('domain')" style="cursor: pointer; user-select: none;">
                        Domain ${getSortIcon('domain')}
                    </th>
                    <th onclick="sortApplications('lifecycle')" style="cursor: pointer; user-select: none;">
                        Lifecycle ${getSortIcon('lifecycle')}
                    </th>
                    <th onclick="sortApplications('risk')" style="cursor: pointer; user-select: none;">
                        Risk ${getSortIcon('risk')}
                    </th>
                    <th onclick="sortApplications('debt')" style="cursor: pointer; user-select: none;">
                        Tech Debt ${getSortIcon('debt')}
                    </th>
                    <th onclick="sortApplications('cost')" style="cursor: pointer; user-select: none;">
                        Annual Cost ${getSortIcon('cost')}
                    </th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sortedApplications.length === 0 ? `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 32px; color: #9ca3af;">
                            <i class="fas fa-filter" style="font-size: 24px; margin-bottom: 8px;"></i>
                            <div>No applications match the current filters</div>
                            <button onclick="clearApplicationFilters()" class="btn btn-ghost" style="margin-top: 12px;">
                                <i class="fas fa-times"></i> Clear Filters
                            </button>
                        </td>
                    </tr>
                ` : sortedApplications.map(app => `
                    <tr>
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
                        <td>${app.businessDomain || '-'}</td>
                        <td><span class="badge badge-${app.lifecycle || 'tolerate'}">${app.lifecycle || 'tolerate'}</span></td>
                        <td><span class="badge badge-${app.riskLevel || 'medium'}">${app.riskLevel || 'medium'}</span></td>
                        <td><span class="badge badge-${app.technicalDebt || 'medium'}">${app.technicalDebt || 'medium'}</span></td>
                        <td>${app.annualCost ? (app.annualCost || 0).toLocaleString() + ' SEK' : '-'}</td>
                        <td>
                            <button class="btn btn-ghost" style="padding: 4px 8px;" onclick="openApplicationModal('${app.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
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
    if (checkboxListenerInitialized) {
        return;
    }
    
    const container = document.getElementById('applications-container');
    if (!container) {
        console.error('❌ Container #applications-container NOT FOUND!');
        setTimeout(() => initializeCheckboxListeners(), 100); // Retry in 100ms
        return;
    }
    
    // Use event delegation with 'change' event (simpler and more reliable)
    container.addEventListener('change', function(event) {
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
    });
    
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
