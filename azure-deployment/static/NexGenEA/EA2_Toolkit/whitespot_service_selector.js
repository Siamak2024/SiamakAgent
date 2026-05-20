/**
 * whitespot_service_selector.js
 * Service selection and engagement linking module
 * 
 * Features:
 * - Select services from catalog (L2 + promoted L3)
 * - Link selected services to current engagement  
 * - View and manage engagement services
 * - Use selected services for target EA and roadmap planning
 * 
 * @version 1.0
 * @date 2026-05-09
 */

// Get selected services for current engagement
function getEngagementServices() {
    if (!window.currentEngagement) {
        console.warn('No active engagement');
        return [];
    }
    return window.currentEngagement.selectedServices || [];
}

// Set selected services for current engagement
function setEngagementServices(services) {
    if (!window.currentEngagement) {
        console.warn('No active engagement');
        return false;
    }
    window.currentEngagement.selectedServices = services;
    if (typeof saveEngagementData === 'function') {
        saveEngagementData();
    }
    return true;
}

// Open service selector modal
function openServiceSelector() {
    if (!window.currentEngagement) {
        if (typeof showNotification === 'function') {
            showNotification('Please create or select an engagement first', 'warning');
        } else {
            alert('Please create or select an engagement first');
        }
        return;
    }
    
    const allServices = typeof getAllServicesWithPromoted === 'function' 
        ? getAllServicesWithPromoted() 
        : window.vivictaServiceLoader.getHLServices();
    
    const selectedServices = getEngagementServices();
    const engagement = window.currentEngagement.engagement || {};
    
    const modal = document.createElement('div');
    modal.id = 'service-selector-modal';
    modal.className = 'ea-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 1400px; width: 95%; max-height: 92vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- Header -->
            <div style="padding: 24px; border-bottom: 2px solid #e5e7eb; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h2 style="font-size: 24px; font-weight: 700; color: #065f46; margin: 0 0 8px 0;">
                            <i class="fas fa-link" style="color: #10b981;"></i> Link Services to Engagement
                        </h2>
                        <p style="font-size: 14px; color: #047857; margin: 0;">
                            <strong>${engagement.name || 'Current Engagement'}</strong> • ${engagement.customerName || engagement.segment || 'N/A'}
                        </p>
                    </div>
                    <button onclick="closeServiceSelector()" style="background: transparent; border: none; font-size: 24px; color: #6b7280; cursor: pointer; padding: 4px 8px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="display: flex; gap: 16px; padding: 16px; background: white; border-radius: 8px; margin-top: 16px;">
                    <div style="flex: 1; text-align: center; padding: 12px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px;">
                        <div style="font-size: 28px; font-weight: 700; color: #1e40af;">${allServices.length}</div>
                        <div style="font-size: 11px; color: #1e3a8a; font-weight: 600;">AVAILABLE</div>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 12px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px;">
                        <div style="font-size: 28px; font-weight: 700; color: #065f46;" id="selected-count">${selectedServices.length}</div>
                        <div style="font-size: 11px; color: #064e3b; font-weight: 600;">SELECTED</div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div style="padding: 16px 24px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                <button onclick="selectAllServices()" class="btn btn-secondary" style="font-size: 13px; padding: 8px 16px;">
                    <i class="fas fa-check-double"></i> Select All
                </button>
                <button onclick="clearAllServices()" class="btn btn-secondary" style="font-size: 13px; padding: 8px 16px;">
                    <i class="fas fa-times"></i> Clear All
                </button>
                <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
                    <i class="fas fa-search" style="color: #9ca3af;"></i>
                    <input type="text" id="service-selector-search" placeholder="Filter services by name..." oninput="filterSelectorServices(this.value)" style="padding: 8px 12px; border: 2px solid #d1d5db; border-radius: 6px; width: 300px; font-size: 13px;"/>
                </div>
            </div>
            
            <!-- Service Grid -->
            <div id="service-selector-grid" style="flex: 1; overflow-y: auto; padding: 24px; background: #f9fafb;">
                ${renderServiceSelectorGrid(allServices, selectedServices)}
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px 24px; border-top: 2px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; color: #6b7280;">
                    <i class="fas fa-info-circle" style="color: #10b981;"></i>
                    Selected services will be used for target EA definition and roadmap planning
                </div>
                <div style="display: flex; gap: 12px;">
                    <button onclick="closeServiceSelector()" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button onclick="saveSelectedServices()" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save & Link (${selectedServices.length})
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.tempSelectedServices = [...selectedServices];
    
    console.log(`✓ Service selector opened - ${allServices.length} services available, ${selectedServices.length} pre-selected`);
}

// Render service selector grid grouped by L1 service areas
function renderServiceSelectorGrid(services, selectedIds) {
    if (!services || services.length === 0) {
        return '<div style="text-align: center; padding: 60px; color: #9ca3af; font-size: 16px;"><i class="fas fa-inbox" style="font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.3;"></i>No services found</div>';
    }
    
    // Group services by L1 service area
    const servicesByArea = {};
    services.forEach(service => {
        const area = service.l1ParentName || 'Other Services';
        if (!servicesByArea[area]) {
            servicesByArea[area] = [];
        }
        servicesByArea[area].push(service);
    });
    
    let html = '';
    const areaNames = Object.keys(servicesByArea).sort();
    
    areaNames.forEach(areaName => {
        const areaServices = servicesByArea[areaName];
        const areaSelectedCount = areaServices.filter(s => selectedIds.includes(s.id)).length;
        
        html += `
            <div class="service-area-group" data-area="${areaName}" style="margin-bottom: 32px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
                    <h4 style="font-size: 16px; font-weight: 700; color: #065f46; margin: 0;">
                        ${areaName}
                        <span style="font-size: 13px; color: #6b7280; font-weight: 400; margin-left: 8px;">(${areaServices.length} services)</span>
                    </h4>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 12px; color: #6b7280;">${areaSelectedCount} selected</span>
                        <button onclick="toggleAreaSelection('${areaName}', ${areaSelectedCount < areaServices.length})" class="btn btn-sm btn-secondary" style="font-size: 12px; padding: 4px 12px;">
                            <i class="fas fa-${areaSelectedCount < areaServices.length ? 'check-square' : 'square'}"></i>
                            ${areaSelectedCount < areaServices.length ? 'Select Area' : 'Deselect Area'}
                        </button>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
        `;
        
        areaServices.forEach(service => {
            const isSelected = selectedIds.includes(service.id);
            const isPromoted = service.isPromoted || false;
            
            html += `
                <div class="service-selector-card" 
                     data-service-id="${service.id}" 
                     data-service-name="${service.name.toLowerCase()}"
                     onclick="toggleServiceSelection('${service.id}')" 
                     style="
                        background: ${isSelected ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white'}; 
                        border: 2px solid ${isSelected ? '#10b981' : '#e5e7eb'}; 
                        border-radius: 8px; 
                        padding: 12px; 
                        cursor: pointer; 
                        position: relative;
                        transition: all 0.2s ease;
                        box-shadow: ${isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
                     "
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                     onmouseout="this.style.transform=''; this.style.boxShadow='${isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'}';">
                    
                    <div style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: ${isSelected ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <i class="fas fa-${isSelected ? 'check' : 'plus'}" style="color: ${isSelected ? 'white' : '#9ca3af'}; font-size: 12px;"></i>
                    </div>
                    
                    ${isPromoted ? '<div style="position: absolute; top: 8px; left: 8px; background: #fbbf24; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600;"><i class="fas fa-star"></i> PROMOTED</div>' : ''}
                    
                    <div style="font-size: 14px; font-weight: 600; color: #111827; padding-right: 30px; ${isPromoted ? 'margin-top: 20px;' : ''}">${service.name}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${service.id}</div>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    return html;
}

// Toggle service selection
function toggleServiceSelection(serviceId) {
    if (!window.tempSelectedServices) {
        window.tempSelectedServices = [];
    }
    
    const index = window.tempSelectedServices.indexOf(serviceId);
    if (index > -1) {
        window.tempSelectedServices.splice(index, 1);
    } else {
        window.tempSelectedServices.push(serviceId);
    }
    
    // Update selected count
    document.getElementById('selected-count').textContent = window.tempSelectedServices.length;
    
    // Update card visual state
    const card = document.querySelector(`[data-service-id="${serviceId}"]`);
    if (!card) {
        console.warn(`Card not found for service: ${serviceId}`);
        return;
    }
    
    const isSelected = window.tempSelectedServices.includes(serviceId);
    
    card.style.background = isSelected ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white';
    card.style.borderColor = isSelected ? '#10b981' : '#e5e7eb';
    card.style.boxShadow = isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)';
    
    const icon = card.querySelector('.fas');
    if (icon) {
        icon.className = `fas fa-${isSelected ? 'check' : 'plus'}`;
        icon.style.color = isSelected ? 'white' : '#9ca3af';
    }
    
    const iconBg = card.querySelector('div[style*="border-radius: 50%"]');
    if (iconBg) {
        iconBg.style.background = isSelected ? '#10b981' : '#e5e7eb';
    }
    
    // Update area selected count
    updateAreaCounts();
}

// Toggle entire area selection
function toggleAreaSelection(areaName, shouldSelect) {
    const areaGroup = document.querySelector(`[data-area="${areaName}"]`);
    const cards = areaGroup.querySelectorAll('.service-selector-card');
    
    cards.forEach(card => {
        const serviceId = card.getAttribute('data-service-id');
        const isCurrentlySelected = window.tempSelectedServices.includes(serviceId);
        
        if (shouldSelect && !isCurrentlySelected) {
            window.tempSelectedServices.push(serviceId);
            updateCardVisual(card, true);
        } else if (!shouldSelect && isCurrentlySelected) {
            const index = window.tempSelectedServices.indexOf(serviceId);
            window.tempSelectedServices.splice(index, 1);
            updateCardVisual(card, false);
        }
    });
    
    document.getElementById('selected-count').textContent = window.tempSelectedServices.length;
    updateAreaCounts();
}

// Update card visual state helper
function updateCardVisual(card, isSelected) {
    if (!card) {
        console.warn('updateCardVisual: card is null');
        return;
    }
    
    card.style.background = isSelected ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white';
    card.style.borderColor = isSelected ? '#10b981' : '#e5e7eb';
    card.style.boxShadow = isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)';
    
    const icon = card.querySelector('.fas');
    if (icon) {
        icon.className = `fas fa-${isSelected ? 'check' : 'plus'}`;
        icon.style.color = isSelected ? 'white' : '#9ca3af';
    }
    
    const iconBg = card.querySelector('div[style*="border-radius: 50%"]');
    if (iconBg) {
        iconBg.style.background = isSelected ? '#10b981' : '#e5e7eb';
    }
}

// Update area selection counts
function updateAreaCounts() {
    document.querySelectorAll('.service-area-group').forEach(areaGroup => {
        const areaName = areaGroup.getAttribute('data-area');
        const cards = areaGroup.querySelectorAll('.service-selector-card');
        const selectedCount = Array.from(cards).filter(card => 
            window.tempSelectedServices.includes(card.getAttribute('data-service-id'))
        ).length;
        
        const countSpan = areaGroup.querySelector('span[style*="font-size: 12px"]');
        if (countSpan) {
            countSpan.textContent = `${selectedCount} selected`;
        }
        
        const areaButton = areaGroup.querySelector('button');
        if (areaButton) {
            const allSelected = selectedCount === cards.length;
            areaButton.innerHTML = `<i class="fas fa-${allSelected ? 'square' : 'check-square'}"></i> ${allSelected ? 'Deselect Area' : 'Select Area'}`;
            areaButton.setAttribute('onclick', `toggleAreaSelection('${areaName}', ${!allSelected})`);
        }
    });
}

// Select all services
function selectAllServices() {
    const allServices = typeof getAllServicesWithPromoted === 'function' 
        ? getAllServicesWithPromoted() 
        : window.vivictaServiceLoader.getHLServices();
    
    window.tempSelectedServices = allServices.map(s => s.id);
    document.getElementById('selected-count').textContent = window.tempSelectedServices.length;
    
    document.querySelectorAll('.service-selector-card').forEach(card => {
        updateCardVisual(card, true);
    });
    
    updateAreaCounts();
    console.log(`✓ Selected all ${window.tempSelectedServices.length} services`);
}

// Clear all services
function clearAllServices() {
    window.tempSelectedServices = [];
    document.getElementById('selected-count').textContent = '0';
    
    document.querySelectorAll('.service-selector-card').forEach(card => {
        updateCardVisual(card, false);
    });
    
    updateAreaCounts();
    console.log('✓ Cleared all service selections');
}

// Filter services by search term
function filterSelectorServices(searchTerm) {
    const search = searchTerm.toLowerCase().trim();
    
    document.querySelectorAll('.service-selector-card').forEach(card => {
        const serviceName = card.getAttribute('data-service-name');
        const serviceId = card.getAttribute('data-service-id').toLowerCase();
        
        const matches = serviceName.includes(search) || serviceId.includes(search);
        card.style.display = matches ? 'block' : 'none';
    });
    
    // Hide area groups that have no visible services
    document.querySelectorAll('.service-area-group').forEach(areaGroup => {
        const visibleCards = Array.from(areaGroup.querySelectorAll('.service-selector-card'))
            .filter(card => card.style.display !== 'none');
        areaGroup.style.display = visibleCards.length > 0 ? 'block' : 'none';
    });
}

// Save selected services to engagement
function saveSelectedServices() {
    if (!window.currentEngagement) {
        console.error('No active engagement to save services to');
        return;
    }
    
    const selectedIds = window.tempSelectedServices || [];
    const allServices = typeof getAllServicesWithPromoted === 'function' 
        ? getAllServicesWithPromoted() 
        : window.vivictaServiceLoader.getHLServices();
    
    const selectedServicesData = allServices.filter(s => selectedIds.includes(s.id));
    
    // Save to engagement
    window.currentEngagement.selectedServices = selectedIds;
    window.currentEngagement.selectedServicesData = selectedServicesData.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        l1ParentName: s.l1ParentName,
        l1Category: s.l1Category || s.l1ParentName, // Add l1Category for compatibility
        l1SubArea: s.l1SubArea,
        isPromoted: s.isPromoted || false
    }));
    
    // Save to storage using EngagementManager
    if (window.engagementManager && typeof window.engagementManager.saveCurrentEngagement === 'function') {
        const saved = window.engagementManager.saveCurrentEngagement();
        if (saved) {
            console.log('✅ Services saved to engagement successfully');
        } else {
            console.error('❌ Failed to save services to engagement');
        }
    } else {
        console.error('❌ EngagementManager not available');
    }
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`Successfully linked ${selectedIds.length} services to engagement!`, 'success');
    } else if (typeof showToast === 'function') {
        showToast('Services Linked', `Successfully linked ${selectedIds.length} services`, 'success');
    } else {
        alert(`Successfully linked ${selectedIds.length} services to engagement!`);
    }
    
    console.log(`✓ Saved ${selectedIds.length} services to engagement:`, selectedIds);
    console.log('Service details:', window.currentEngagement.selectedServicesData);
    
    closeServiceSelector();
    
    // Trigger Target EA refresh if on that tab
    if (typeof renderTargetServices === 'function') {
        setTimeout(() => renderTargetServices(), 100);
    }
    
    // Trigger any engagement update callbacks
    if (typeof window.onEngagementServicesUpdated === 'function') {
        window.onEngagementServicesUpdated(selectedServicesData);
    }
}

// Close service selector modal
function closeServiceSelector() {
    const modal = document.getElementById('service-selector-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s';
        setTimeout(() => {
            modal.remove();
            window.tempSelectedServices = null;
        }, 200);
    }
}

// Render engagement services summary (for display in engagement setup tab)
function renderEngagementServicesSummary() {
    if (!window.currentEngagement || !window.currentEngagement.selectedServices) {
        return '<div style="padding: 20px; text-align: center; color: #9ca3af; border: 2px dashed #d1d5db; border-radius: 8px;"><i class="fas fa-link"></i> No services linked yet. Click "Link Services" to select services for this engagement.</div>';
    }
    
    const selectedData = window.currentEngagement.selectedServicesData || [];
    
    if (selectedData.length === 0) {
        return '<div style="padding: 20px; text-align: center; color: #9ca3af; border: 2px dashed #d1d5db; border-radius: 8px;"><i class="fas fa-link"></i> No services linked yet.</div>';
    }
    
    // Group by L1 area
    const byArea = {};
    selectedData.forEach(s => {
        const area = s.l1ParentName || 'Other';
        if (!byArea[area]) byArea[area] = [];
        byArea[area].push(s);
    });
    
    let html = `
        <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #065f46; margin: 0;">
                    <i class="fas fa-check-circle" style="color: #10b981;"></i> Linked Services (${selectedData.length})
                </h4>
                <button onclick="openServiceSelector()" class="btn btn-sm btn-primary" style="font-size: 13px;">
                    <i class="fas fa-edit"></i> Edit Selection
                </button>
            </div>
    `;
    
    Object.keys(byArea).sort().forEach(area => {
        html += `
            <div style="margin-bottom: 12px;">
                <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">${area}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        `;
        
        byArea[area].forEach(s => {
            html += `
                <span style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 4px; font-size: 12px; border: 1px solid #10b981;">
                    ${s.isPromoted ? '<i class="fas fa-star" style="color: #fbbf24; margin-right: 4px;"></i>' : ''}${s.name}
                </span>
            `;
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    
    return html;
}

// Export selected services as JSON
function exportEngagementServices() {
    if (!window.currentEngagement || !window.currentEngagement.selectedServicesData) {
        alert('No services to export');
        return;
    }
    
    const exportData = {
        engagementName: window.currentEngagement.engagement?.name || 'Unnamed Engagement',
        exportDate: new Date().toISOString(),
        selectedServices: window.currentEngagement.selectedServicesData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engagement-services-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✓ Exported engagement services');
}

// console.log('✓ Service Selector module loaded (v1.0)');
