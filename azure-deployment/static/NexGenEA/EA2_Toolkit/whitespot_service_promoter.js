/**
 * whitespot_service_promoter.js
 * Module for browsing L3 detailed services and promoting them to high-level (L2) status
 * 
 * Features:
 * - Search and filter through 115 L3 detailed services
 * - Promote L3 services to appear as high-level in reference catalog
 * - Persist promoted services in engagement data
 * - Seamless integration with existing WhiteSpot heatmap
 * 
 * @version 1.0
 * @date 2026-05-09
 */

// Storage for promoted services
let promotedServices = {
    services: [], // Array of promoted L3 service IDs
    customL2Services: [] // Array of custom L2-like services created from L3
};

// Expose globally for other modules
window.promotedServices = promotedServices;

/**
 * Initialize promoted services from storage
 */
function initPromotedServices() {
    if (window.engagementState && window.engagementState.promotedServices) {
        promotedServices = window.engagementState.promotedServices;
        window.promotedServices = promotedServices; // Keep global reference in sync
    }
    // console.log('✓ Promoted Services initialized:', promotedServices.services.length);
}

/**
 * Open the service browser modal to search and promote L3 services
 */
function openServiceBrowser() {
    const allL3 = window.vivictaServiceLoader.getAllL3Components();
    const stats = window.vivictaServiceLoader.getStatistics();
    
    const modal = document.createElement('div');
    modal.id = 'service-browser-modal';
    modal.className = 'ea-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 1200px; width: 90%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- Header -->
            <div style="padding: 24px; border-bottom: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
                <div>
                    <h2 style="font-size: 24px; font-weight: 700; color: #065f46; margin: 0 0 8px 0;">
                        <i class="fas fa-search-plus" style="color: #10b981;"></i> Service Browser
                    </h2>
                    <p style="font-size: 14px; color: #047857; margin: 0;">
                        Explore ${stats.totalL3Components} detailed service components • Add services to your WhiteSpot Heatmap
                    </p>
                </div>
                <button onclick="closeServiceBrowser()" style="background: transparent; border: none; font-size: 24px; color: #6b7280; cursor: pointer; padding: 8px; line-height: 1;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Search & Filter Bar -->
            <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px; position: relative;">
                        <input 
                            type="text" 
                            id="service-search-input" 
                            placeholder="Search by service name, description, or category..."
                            oninput="filterL3Services(this.value)"
                            style="width: 100%; padding: 12px 40px 12px 16px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                            onfocus="this.style.borderColor='#10b981'"
                            onblur="this.style.borderColor='#d1d5db'"
                        />
                        <i class="fas fa-search" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af;"></i>
                    </div>
                    
                    <select id="l2-parent-filter" onchange="filterL3Services()" style="padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;">
                        <option value="">All L2 Parents</option>
                        ${getUniqueL2Parents(allL3).map(l2 => `<option value="${l2.id}">${l2.name}</option>`).join('')}
                    </select>
                    
                    <select id="category-filter" onchange="filterL3Services()" style="padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;">
                        <option value="">All Categories</option>
                        <option value="Advisory">Advisory</option>
                        <option value="Managed">Managed</option>
                        <option value="Transformation">Transformation</option>
                    </select>
                    
                    <div style="font-size: 13px; color: #6b7280; padding: 0 8px;">
                        <span id="service-count-display">${allL3.length}</span> services
                        <span style="margin-left: 12px; color: #10b981; font-weight: 600;">
                            <i class="fas fa-star"></i> ${promotedServices.services.length} promoted
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Services Grid -->
            <div id="l3-services-container" style="flex: 1; overflow-y: auto; padding: 24px;">
                ${renderL3ServicesGrid(allL3)}
            </div>
            
            <!-- Footer with Actions -->
            <div style="padding: 20px 24px; border-top: 2px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; color: #6b7280;">
                    <i class="fas fa-info-circle" style="color: #10b981;"></i>
                    Selected services will be added to your WhiteSpot Heatmap
                </div>
                <div style="display: flex; gap: 12px;">
                    <button onclick="closeServiceBrowser()" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <button onclick="savePromotedServicesAndClose()" class="btn btn-primary">
                        <i class="fas fa-check"></i> Save & Apply (${promotedServices.services.length} services)
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus search input
    setTimeout(() => {
        document.getElementById('service-search-input')?.focus();
    }, 100);
}

/**
 * Get unique L2 parents from L3 services
 */
function getUniqueL2Parents(l3Services) {
    const l2Map = new Map();
    l3Services.forEach(l3 => {
        if (l3.l2ParentId && !l2Map.has(l3.l2ParentId)) {
            l2Map.set(l3.l2ParentId, {
                id: l3.l2ParentId,
                name: l3.l2ParentName || l3.l2ParentId
            });
        }
    });
    return Array.from(l2Map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Render L3 services in a grid layout
 */
function renderL3ServicesGrid(services) {
    if (!services || services.length === 0) {
        return `
            <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
                <div style="font-size: 48px; margin-bottom: 16px;"><i class="fas fa-search"></i></div>
                <div style="font-size: 16px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">No services found</div>
                <div style="font-size: 14px;">Try adjusting your search or filters</div>
            </div>
        `;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">';
    
    services.forEach(service => {
        const isPromoted = promotedServices.services.includes(service.id);
        const categoryColor = getCategoryColor(service.category);
        
        html += `
            <div class="l3-service-card" data-service-id="${service.id}" style="
                background: ${isPromoted ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'white'};
                border: 2px solid ${isPromoted ? '#10b981' : '#e5e7eb'};
                border-radius: 12px;
                padding: 16px;
                transition: all 0.2s;
                cursor: pointer;
                position: relative;
            " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)';" 
               onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)';">
                
                ${isPromoted ? '<div style="position: absolute; top: 12px; right: 12px; background: #10b981; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px;"><i class="fas fa-star"></i></div>' : ''}
                
                <div style="font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 8px; padding-right: ${isPromoted ? '35px' : '0'};">
                    ${service.name}
                </div>
                
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                    ${service.id} → ${service.l2ParentName || 'Unknown'}
                </div>
                
                ${service.category ? `
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${categoryColor.bg}; color: ${categoryColor.text}; margin-bottom: 8px;">
                        ${service.category}
                    </span>
                ` : ''}
                
                ${service.description && service.description !== '' ? `
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px; line-height: 1.5; max-height: 40px; overflow: hidden; text-overflow: ellipsis;">
                        ${service.description.substring(0, 100)}${service.description.length > 100 ? '...' : ''}
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid ${isPromoted ? '#10b981' : '#e5e7eb'};">
                    ${isPromoted ? `
                        <button onclick="unpromoteService('${service.id}'); event.stopPropagation();" style="flex: 1; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                            <i class="fas fa-minus-circle"></i> Remove
                        </button>
                    ` : `
                        <button onclick="promoteService('${service.id}'); event.stopPropagation();" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                            <i class="fas fa-plus-circle"></i> Add to WhiteSpot Heatmap
                        </button>
                    `}
                    <button onclick="showServiceDetails('${service.id}'); event.stopPropagation();" style="padding: 8px 12px; background: transparent; color: #6b7280; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Get color scheme for service category
 */
function getCategoryColor(category) {
    const colors = {
        'Advisory': { bg: '#dbeafe', text: '#1e40af' },
        'Managed': { bg: '#fef3c7', text: '#92400e' },
        'Transformation': { bg: '#e9d5ff', text: '#6b21a8' },
        'default': { bg: '#f3f4f6', text: '#4b5563' }
    };
    return colors[category] || colors.default;
}

/**
 * Filter L3 services based on search and filters
 */
function filterL3Services(searchTerm = null) {
    const search = searchTerm || document.getElementById('service-search-input')?.value || '';
    const l2Filter = document.getElementById('l2-parent-filter')?.value || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    
    let allL3 = window.vivictaServiceLoader.getAllL3Components();
    
    // Apply filters
    let filtered = allL3.filter(service => {
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            const matchesName = service.name.toLowerCase().includes(searchLower);
            const matchesDescription = service.description?.toLowerCase().includes(searchLower);
            const matchesId = service.id.toLowerCase().includes(searchLower);
            if (!matchesName && !matchesDescription && !matchesId) return false;
        }
        
        // L2 parent filter
        if (l2Filter && service.l2ParentId !== l2Filter) return false;
        
        // Category filter
        if (categoryFilter && service.category !== categoryFilter) return false;
        
        return true;
    });
    
    // Update count display
    const countDisplay = document.getElementById('service-count-display');
    if (countDisplay) {
        countDisplay.textContent = filtered.length;
    }
    
    // Re-render grid
    const container = document.getElementById('l3-services-container');
    if (container) {
        container.innerHTML = renderL3ServicesGrid(filtered);
    }
}

/**
 * Promote an L3 service to high-level status
 */
function promoteService(serviceId) {
    if (!promotedServices.services.includes(serviceId)) {
        promotedServices.services.push(serviceId);
        
        // Create a custom L2-like service entry
        const l3Service = window.vivictaServiceLoader.getL3ComponentById(serviceId);
        if (l3Service) {
            promotedServices.customL2Services.push({
                id: `L2-CUSTOM-${promotedServices.customL2Services.length + 1}`,
                originalL3Id: serviceId,
                name: l3Service.name,
                l1ParentId: l3Service.l1ServiceArea || 'L1-001',
                l1ParentName: l3Service.l1ServiceAreaName || 'Consulting & Project Services',
                l1SubArea: l3Service.l2ParentName || 'Custom Services',
                heatmapLevel: 'HL',
                isHL: true,
                isPromoted: true,
                category: l3Service.category,
                description: l3Service.description
            });
        }
        
        // Keep global reference in sync
        window.promotedServices = promotedServices;
        
        console.log(`✓ Promoted service: ${serviceId}`);
        
        // Update button text in footer
        updatePromoteButtonCount();
        
        // Re-render to update UI
        filterL3Services();
    }
}

/**
 * Unpromote (remove) an L3 service from high-level status
 */
function unpromoteService(serviceId) {
    const index = promotedServices.services.indexOf(serviceId);
    if (index > -1) {
        promotedServices.services.splice(index, 1);
        
        // Remove from custom L2 services
        promotedServices.customL2Services = promotedServices.customL2Services.filter(
            s => s.originalL3Id !== serviceId
        );
        
        // Keep global reference in sync
        window.promotedServices = promotedServices;
        
        console.log(`✓ Unpromoted service: ${serviceId}`);
        
        // Update button text in footer
        updatePromoteButtonCount();
        
        // Re-render to update UI
        filterL3Services();
    }
}

/**
 * Update the promote button count in modal footer
 */
function updatePromoteButtonCount() {
    const button = document.querySelector('[onclick*="savePromotedServicesAndClose"]');
    if (button) {
        button.innerHTML = `<i class="fas fa-check"></i> Save & Apply (${promotedServices.services.length} services)`;
    }
}

/**
 * Show detailed information about a service
 */
function showServiceDetails(serviceId) {
    const service = window.vivictaServiceLoader.getL3ComponentById(serviceId);
    if (!service) return;
    
    alert(`Service Details:\n\nName: ${service.name}\nID: ${service.id}\nL2 Parent: ${service.l2ParentName}\nCategory: ${service.category || 'N/A'}\nDescription: ${service.description || 'No description available'}\n\nSource Domain: ${service.sourceDomain || 'N/A'}\nSource Group: ${service.sourceGroup || 'N/A'}`);
}

/**
 * Close the service browser modal
 */
function closeServiceBrowser() {
    const modal = document.getElementById('service-browser-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s';
        setTimeout(() => modal.remove(), 200);
    }
}

/**
 * Save promoted services and close modal
 * Now actually adds the promoted services to the active heatmap
 */
function savePromotedServicesAndClose() {
    if (promotedServices.customL2Services.length === 0) {
        closeServiceBrowser();
        return;
    }
    
    // Get the manager (engagement or standalone)
    const manager = typeof window.whitespotStandaloneManager !== 'undefined' 
        ? window.whitespotStandaloneManager 
        : window.engagementManager;
    
    if (!manager) {
        console.error('❌ No manager available');
        closeServiceBrowser();
        return;
    }
    
    // Get customers and current heatmap
    const customers = manager.getCustomers ? manager.getCustomers() : (manager.getEntities('customers') || []);
    
    if (customers.length === 0) {
        showNotification('No customer found. Please create a customer first.', 'warning');
        closeServiceBrowser();
        return;
    }
    
    const selectedCustomerId = window.currentWhiteSpotCustomer || customers[0].id;
    const heatmaps = manager.getHeatmaps ? manager.getHeatmaps() : (manager.getEntities('whiteSpotHeatmaps') || []);
    let currentHeatmap = heatmaps.find(h => h.customerId === selectedCustomerId);
    
    // Create heatmap if it doesn't exist
    if (!currentHeatmap) {
        currentHeatmap = {
            id: `WSH-${Date.now()}`,
            customerId: selectedCustomerId,
            hlAssessments: [],
            createdAt: new Date().toISOString()
        };
        
        if (manager.addHeatmap) {
            manager.addHeatmap(currentHeatmap);
        } else if (manager.addEntity) {
            manager.addEntity('whiteSpotHeatmaps', currentHeatmap);
        }
        
        console.log(`✓ Created new heatmap: ${currentHeatmap.id}`);
    }
    
    // Add promoted services to heatmap
    let addedCount = 0;
    promotedServices.customL2Services.forEach(customService => {
        // Check if service already exists in heatmap
        const exists = currentHeatmap.hlAssessments.some(a => a.l2ServiceId === customService.id);
        
        if (!exists) {
            // Add as POTENTIAL status by default
            currentHeatmap.hlAssessments.push({
                l2ServiceId: customService.id,
                status: 'POTENTIAL',
                notes: `Promoted from L3: ${customService.originalL3Id}`,
                addedAt: new Date().toISOString(),
                isPromoted: true
            });
            addedCount++;
            console.log(`✓ Added promoted service to heatmap: ${customService.name}`);
        }
    });
    
    // Save the heatmap
    if (manager.updateEntity) {
        manager.updateEntity('whiteSpotHeatmaps', currentHeatmap.id, currentHeatmap);
    }
    
    // Save to engagement state for persistence
    if (window.engagementState) {
        window.engagementState.promotedServices = promotedServices;
    }
    
    console.log(`✅ Added ${addedCount} promoted services to heatmap ${currentHeatmap.id}`);
    
    // Show success message
    if (addedCount > 0) {
        showNotification(`Successfully added ${addedCount} services to WhiteSpot Heatmap!`, 'success');
    } else {
        showNotification('All selected services are already in the heatmap', 'info');
    }
    
    // Refresh the heatmap view
    if (typeof renderWhiteSpotHeatmap === 'function') {
        renderWhiteSpotHeatmap();
    }
    
    closeServiceBrowser();
}

/**
 * Refresh the reference catalog to include promoted services
 */
function refreshReferenceCatalog() {
    const container = document.getElementById('whitespot-container');
    if (container) {
        // Re-render the catalog view
        container.innerHTML = renderServiceCatalogView();
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: { bg: '#10b981', icon: 'check-circle' },
        info: { bg: '#3b82f6', icon: 'info-circle' },
        warning: { bg: '#f59e0b', icon: 'exclamation-triangle' },
        error: { bg: '#ef4444', icon: 'times-circle' }
    };
    
    const color = colors[type] || colors.info;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: ${color.bg};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <i class="fas fa-${color.icon}" style="font-size: 18px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Get all services including promoted ones (for reference catalog display)
 */
function getAllServicesWithPromoted() {
    const hlServices = window.vivictaServiceLoader.getHLServices();
    const promoted = promotedServices.customL2Services || [];
    return [...hlServices, ...promoted];
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .l3-service-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        transform: translateY(-2px) !important;
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initPromotedServices();
});
