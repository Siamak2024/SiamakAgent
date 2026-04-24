/**
 * apqc_mapping_modal.js
 * APQC Process Classification Framework mapping UI
 * Implements 3-layer architecture: APQC Capability → Customer View → WhiteSpot Service
 * 
 * @version 1.0
 * @date 2026-04-21
 */

/**
 * Open APQC mapping modal for a service
 * @param {Object} service - Service object with mappedCapabilities
 * @param {string} customerId - Customer ID (optional, for industry filtering)
 */
function openAPQCMappingModal(service, customerId = null) {
    if (!service) {
        showToast('Invalid service', 'error');
        return;
    }

    // Get customer for industry context
    let customer = null;
    if (customerId && window.engagementManager) {
        const engagement = window.engagementManager.getCurrentEngagement();
        if (engagement && engagement.customers) {
            customer = engagement.customers.find(c => c.id === customerId);
        }
    }

    const modal = document.createElement('div');
    modal.id = 'apqc-mapping-modal';
    modal.className = 'modal active';
    modal.style.zIndex = '10001';

    const industryFilter = customer?.industry || 'cross-industry';
    const industryLabel = customer ? window.getIndustryLabel(customer.industry) : 'Cross-Industry';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; height: 85vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h2 style="font-size: 20px; color: #1f2937; margin: 0;">
                    <span style="color: #6366f1;">📊</span> APQC Capability Mapping
                </h2>
                <button class="icon-button" onclick="closeAPQCMappingModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af;">×</button>
            </div>

            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">WhiteSpot Service</div>
                        <div style="font-weight: 600; color: #1f2937;">${service.name}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Industry Context</div>
                        <div style="font-weight: 600; color: #1f2937;">${industryLabel}</div>
                    </div>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #4b5563;">${service.description || ''}</div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <input 
                    type="text" 
                    id="apqc-search-input" 
                    class="form-input" 
                    placeholder="Search APQC processes..." 
                    style="flex: 1;"
                    onkeyup="searchAPQCProcesses()"
                />
                <select id="apqc-level-filter" class="form-input" style="width: 150px;" onchange="searchAPQCProcesses()">
                    <option value="all">All Levels</option>
                    <option value="l2" selected>L2 - Process Groups</option>
                    <option value="l3">L3 - Processes</option>
                    <option value="l4">L4 - Activities</option>
                </select>
                <button class="secondary-button" onclick="toggleIndustryFilter()" style="white-space: nowrap;">
                    <span id="industry-filter-icon">🌍</span> ${customer ? 'Industry Filter' : 'All Industries'}
                </button>
            </div>

            <div style="flex: 1; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
                <div id="apqc-process-list" style="padding: 12px;">
                    <!-- Populated by JavaScript -->
                </div>
            </div>

            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="font-size: 16px; color: #1f2937; margin: 0;">Mapped Capabilities (<span id="mapped-count">0</span>)</h3>
                    <button class="secondary-button" onclick="addCustomCapability('${service.id}')">
                        + Custom Capability
                    </button>
                </div>
                <div id="mapped-capabilities-list" style="max-height: 150px; overflow-y: auto; background: #f9fafb; border-radius: 6px; padding: 8px;">
                    <!-- Populated by JavaScript -->
                </div>
            </div>

            <div class="modal-footer" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <button class="secondary-button" onclick="closeAPQCMappingModal()">Cancel</button>
                <button class="primary-button" onclick="saveMappings('${service.id}')">
                    Save Mappings
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize state
    window.apqcMappingState = {
        serviceId: service.id,
        serviceName: service.name,
        customerId: customerId,
        industryFilter: customer?.industry || null,
        industryFilterActive: false,
        mappedCapabilities: JSON.parse(JSON.stringify(service.mappedCapabilities || [])), // Deep copy
        searchTerm: '',
        levelFilter: 'l2'
    };

    // Initial render
    renderAPQCProcessList();
    renderMappedCapabilitiesList();
}

/**
 * Close APQC mapping modal
 */
function closeAPQCMappingModal() {
    const modal = document.getElementById('apqc-mapping-modal');
    if (modal) {
        modal.remove();
    }
    window.apqcMappingState = null;
}

/**
 * Search APQC processes
 */
function searchAPQCProcesses() {
    if (!window.apqcMappingState) return;

    const searchInput = document.getElementById('apqc-search-input');
    const levelFilter = document.getElementById('apqc-level-filter');

    window.apqcMappingState.searchTerm = searchInput.value.toLowerCase();
    window.apqcMappingState.levelFilter = levelFilter.value;

    renderAPQCProcessList();
}

/**
 * Toggle industry filter on/off
 */
function toggleIndustryFilter() {
    if (!window.apqcMappingState) return;

    window.apqcMappingState.industryFilterActive = !window.apqcMappingState.industryFilterActive;
    
    const icon = document.getElementById('industry-filter-icon');
    if (icon) {
        icon.textContent = window.apqcMappingState.industryFilterActive ? '🎯' : '🌍';
    }

    renderAPQCProcessList();
}

/**
 * Render APQC process list
 */
function renderAPQCProcessList() {
    if (!window.apqcMappingState || !window.apqcWhiteSpotIntegration) return;

    const container = document.getElementById('apqc-process-list');
    if (!container) return;

    const { searchTerm, levelFilter, industryFilter, industryFilterActive } = window.apqcMappingState;

    // Get processes based on level
    let processes = [];
    const apqc = window.apqcWhiteSpotIntegration;

    if (levelFilter === 'all' || levelFilter === 'l2') {
        const l2Processes = apqc.getL2Processes() || [];
        processes.push(...l2Processes.map(p => ({ ...p, level: 'L2' })));
    }

    if (levelFilter === 'all' || levelFilter === 'l3') {
        const l3Processes = apqc.getL3Processes() || [];
        processes.push(...l3Processes.map(p => ({ ...p, level: 'L3' })));
    }

    if (levelFilter === 'all' || levelFilter === 'l4') {
        const l4Processes = apqc.getL4Processes() || [];
        processes.push(...l4Processes.map(p => ({ ...p, level: 'L4' })));
    }

    // Apply industry filter
    if (industryFilterActive && industryFilter) {
        processes = processes.filter(p => {
            if (!p.industry_tags || p.industry_tags.length === 0) return true; // Cross-industry
            return p.industry_tags.some(tag => tag.toLowerCase().includes(industryFilter.toLowerCase()));
        });
    }

    // Apply search filter
    if (searchTerm) {
        processes = processes.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            p.id.toLowerCase().includes(searchTerm)
        );
    }

    // Limit to 50 results
    processes = processes.slice(0, 50);

    if (processes.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: #9ca3af;">No processes found</div>`;
        return;
    }

    let html = '';
    processes.forEach(proc => {
        const isMapping = window.apqcMappingState.mappedCapabilities.some(m => m.apqcId === proc.id);
        const mappingType = isMapping ? window.apqcMappingState.mappedCapabilities.find(m => m.apqcId === proc.id).type : null;

        html += `
            <div class="apqc-process-item" style="border: 1px solid ${isMapping ? '#6366f1' : '#e5e7eb'}; background: ${isMapping ? '#eef2ff' : 'white'}; border-radius: 6px; padding: 12px; margin-bottom: 8px; cursor: pointer;" onclick="toggleMapping('${proc.id}', '${proc.name}', '${proc.level}')">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: #6366f1;">${proc.id}</span>
                            ${proc.level ? `<span style="margin-left: 8px; padding: 2px 6px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 10px;">${proc.level}</span>` : ''}
                            ${proc.industry_tags && proc.industry_tags.length > 0 ? `<span style="margin-left: 4px; font-size: 11px;">🎯 ${proc.industry_tags.slice(0, 2).join(', ')}</span>` : ''}
                        </div>
                        <div style="font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 4px;">${proc.name}</div>
                        ${proc.description ? `<div style="font-size: 12px; color: #6b7280; line-height: 1.4;">${proc.description.substring(0, 120)}${proc.description.length > 120 ? '...' : ''}</div>` : ''}
                    </div>
                    <div style="margin-left: 12px;">
                        ${isMapping ? getMappingTypeBadge(mappingType) : '<div style="width: 24px; height: 24px; border: 2px dashed #cbd5e1; border-radius: 50%;"></div>'}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Get mapping type badge HTML
 */
function getMappingTypeBadge(type) {
    const badges = {
        'Primary': '<div style="width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">P</div>',
        'Secondary': '<div style="width: 24px; height: 24px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">S</div>',
        'Enabler': '<div style="width: 24px; height: 24px; background: #8b5cf6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">E</div>',
        'Industry-specific': '<div style="width: 24px; height: 24px; background: #f59e0b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">I</div>'
    };
    return badges[type] || badges['Primary'];
}

/**
 * Toggle mapping for a process
 */
function toggleMapping(apqcId, apqcName, level) {
    if (!window.apqcMappingState) return;

    const existingIndex = window.apqcMappingState.mappedCapabilities.findIndex(m => m.apqcId === apqcId);

    if (existingIndex >= 0) {
        // Already mapped - show type selector
        showMappingTypeSelector(apqcId, apqcName, window.apqcMappingState.mappedCapabilities[existingIndex].type);
    } else {
        // Not mapped - add with default type
        showMappingTypeSelector(apqcId, apqcName, 'Primary');
    }
}

/**
 * Show mapping type selector popup
 */
function showMappingTypeSelector(apqcId, apqcName, currentType) {
    const popup = document.createElement('div');
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 10002; min-width: 350px;';

    popup.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">Select Mapping Type</h3>
        <div style="margin-bottom: 12px; font-size: 13px; color: #6b7280;">${apqcId}: ${apqcName}</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="mapping-type-btn" onclick="setMappingType('${apqcId}', '${apqcName}', 'Primary')" style="padding: 12px; border: 2px solid ${currentType === 'Primary' ? '#10b981' : '#e5e7eb'}; background: ${currentType === 'Primary' ? '#d1fae5' : 'white'}; border-radius: 6px; cursor: pointer; text-align: left;">
                <strong style="color: #10b981;">⬤ Primary</strong> - Core capability directly delivered
            </button>
            <button class="mapping-type-btn" onclick="setMappingType('${apqcId}', '${apqcName}', 'Secondary')" style="padding: 12px; border: 2px solid ${currentType === 'Secondary' ? '#3b82f6' : '#e5e7eb'}; background: ${currentType === 'Secondary' ? '#dbeafe' : 'white'}; border-radius: 6px; cursor: pointer; text-align: left;">
                <strong style="color: #3b82f6;">⬤ Secondary</strong> - Supporting capability, partial coverage
            </button>
            <button class="mapping-type-btn" onclick="setMappingType('${apqcId}', '${apqcName}', 'Enabler')" style="padding: 12px; border: 2px solid ${currentType === 'Enabler' ? '#8b5cf6' : '#e5e7eb'}; background: ${currentType === 'Enabler' ? '#ede9fe' : 'white'}; border-radius: 6px; cursor: pointer; text-align: left;">
                <strong style="color: #8b5cf6;">⬤ Enabler</strong> - Technology/platform enablement
            </button>
            <button class="mapping-type-btn" onclick="setMappingType('${apqcId}', '${apqcName}', 'Industry-specific')" style="padding: 12px; border: 2px solid ${currentType === 'Industry-specific' ? '#f59e0b' : '#e5e7eb'}; background: ${currentType === 'Industry-specific' ? '#fef3c7' : 'white'}; border-radius: 6px; cursor: pointer; text-align: left;">
                <strong style="color: #f59e0b;">⬤ Industry-specific</strong> - Custom industry extension
            </button>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <button class="secondary-button" onclick="this.closest('div').remove()" style="flex: 1;">Cancel</button>
            <button class="danger-button" onclick="removeMapping('${apqcId}'); this.closest('div').remove();" style="flex: 1;">Remove</button>
        </div>
    `;

    document.body.appendChild(popup);
}

/**
 * Set mapping type
 */
function setMappingType(apqcId, apqcName, type) {
    if (!window.apqcMappingState) return;

    const existingIndex = window.apqcMappingState.mappedCapabilities.findIndex(m => m.apqcId === apqcId);

    const mapping = {
        apqcId: apqcId,
        name: apqcName,
        type: type,
        industry: window.apqcMappingState.industryFilter || 'cross-industry',
        confidenceScore: 0.85, // Default
        customCapability: false
    };

    if (existingIndex >= 0) {
        window.apqcMappingState.mappedCapabilities[existingIndex] = mapping;
    } else {
        window.apqcMappingState.mappedCapabilities.push(mapping);
    }

    // Close popup
    const popups = document.querySelectorAll('body > div[style*="position: fixed"]');
    popups.forEach(p => p.remove());

    renderAPQCProcessList();
    renderMappedCapabilitiesList();
}

/**
 * Remove mapping
 */
function removeMapping(apqcId) {
    if (!window.apqcMappingState) return;

    window.apqcMappingState.mappedCapabilities = window.apqcMappingState.mappedCapabilities.filter(m => m.apqcId !== apqcId);

    renderAPQCProcessList();
    renderMappedCapabilitiesList();
}

/**
 * Render mapped capabilities list
 */
function renderMappedCapabilitiesList() {
    if (!window.apqcMappingState) return;

    const container = document.getElementById('mapped-capabilities-list');
    const countSpan = document.getElementById('mapped-count');

    if (!container) return;

    const mappings = window.apqcMappingState.mappedCapabilities;

    if (countSpan) {
        countSpan.textContent = mappings.length;
    }

    if (mappings.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 13px;">No capabilities mapped yet. Click on processes above to add mappings.</div>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 6px;">';
    mappings.forEach(mapping => {
        const typeColors = {
            'Primary': '#10b981',
            'Secondary': '#3b82f6',
            'Enabler': '#8b5cf6',
            'Industry-specific': '#f59e0b'
        };

        html += `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div style="width: 6px; height: 40px; background: ${typeColors[mapping.type]}; border-radius: 3px;"></div>
                <div style="flex: 1;">
                    <div style="font-size: 11px; color: #6b7280;">${mapping.apqcId}</div>
                    <div style="font-size: 13px; font-weight: 600; color: #1f2937;">${mapping.name}</div>
                </div>
                <div style="padding: 4px 8px; background: ${typeColors[mapping.type]}20; color: ${typeColors[mapping.type]}; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ${mapping.type}
                </div>
                <button onclick="removeMapping('${mapping.apqcId}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 18px; padding: 4px;">×</button>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

/**
 * Add custom capability
 */
function addCustomCapability(serviceId) {
    const name = prompt('Enter custom capability name:');
    if (!name || !window.apqcMappingState) return;

    const customId = `CUSTOM-${Date.now()}`;
    const mapping = {
        apqcId: customId,
        name: name,
        type: 'Industry-specific',
        industry: window.apqcMappingState.industryFilter || 'custom',
        confidenceScore: 1.0,
        customCapability: true
    };

    window.apqcMappingState.mappedCapabilities.push(mapping);

    renderMappedCapabilitiesList();
}

/**
 * Save mappings back to service
 */
function saveMappings(serviceId) {
    if (!window.apqcMappingState || !window.engagementManager) {
        showToast('Cannot save mappings', 'error');
        return;
    }

    // Find service in engagement data and update mappedCapabilities
    const engagement = window.engagementManager.getCurrentEngagement();
    if (!engagement || !engagement.whiteSpotHeatmaps) {
        showToast('No engagement found', 'error');
        return;
    }

    let updated = false;
    engagement.whiteSpotHeatmaps.forEach(heatmap => {
        if (heatmap.serviceAssessment) {
            heatmap.serviceAssessment.forEach(service => {
                if (service.id === serviceId) {
                    service.mappedCapabilities = window.apqcMappingState.mappedCapabilities;
                    updated = true;
                }
            });
        }
    });

    if (updated) {
        window.engagementManager.saveEngagement(engagement);
        showToast(`Saved ${window.apqcMappingState.mappedCapabilities.length} capability mappings`, 'success');
        closeAPQCMappingModal();

        // Refresh heatmap if visible
        if (typeof renderWhiteSpotHeatmap === 'function') {
            const currentCustomerId = window.apqcMappingState.customerId;
            if (currentCustomerId) {
                renderWhiteSpotHeatmap(currentCustomerId);
            }
        }
    } else {
        showToast('Service not found in engagement', 'error');
    }
}

// Export functions for global access
if (typeof window !== 'undefined') {
    window.openAPQCMappingModal = openAPQCMappingModal;
    window.closeAPQCMappingModal = closeAPQCMappingModal;
    window.searchAPQCProcesses = searchAPQCProcesses;
    window.toggleIndustryFilter = toggleIndustryFilter;
    window.toggleMapping = toggleMapping;
    window.setMappingType = setMappingType;
    window.removeMapping = removeMapping;
    window.addCustomCapability = addCustomCapability;
    window.saveMappings = saveMappings;
}

console.log('✓ APQC Mapping Modal loaded');
