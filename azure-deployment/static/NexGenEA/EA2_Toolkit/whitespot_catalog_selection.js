/**
 * whitespot_catalog_selection.js
 * Handles direct service selection from the reference catalog
 * 
 * @version 1.0
 * @date 2026-05-09
 */

// Initialize catalog selection state
if (!window.catalogSelectedServices) {
    window.catalogSelectedServices = [];
}

// Toggle service selection in catalog view
function toggleCatalogServiceSelection(serviceId) {
    if (!window.catalogSelectedServices) {
        window.catalogSelectedServices = [];
    }
    
    const index = window.catalogSelectedServices.indexOf(serviceId);
    if (index > -1) {
        window.catalogSelectedServices.splice(index, 1);
    } else {
        window.catalogSelectedServices.push(serviceId);
    }
    
    // Update the card visual
    updateCatalogCardVisual(serviceId);
    
    // Update floating action bar
    updateCatalogSelectionBar();
    
    console.log(`✓ Service ${serviceId} ${index > -1 ? 'deselected' : 'selected'}. Total: ${window.catalogSelectedServices.length}`);
}

// Update card visual state
function updateCatalogCardVisual(serviceId) {
    const card = document.querySelector(`[data-service-id="${serviceId}"]`);
    if (!card) return;
    
    const isSelected = window.catalogSelectedServices.includes(serviceId);
    const isPromoted = card.querySelector('.fa-star') !== null;
    
    // Update background
    if (isSelected) {
        card.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
        card.style.borderColor = '#10b981';
        card.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
    } else if (isPromoted) {
        card.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
        card.style.borderColor = '#10b981';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    } else {
        card.style.background = '#f9fafb';
        card.style.borderColor = '#e5e7eb';
        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }
    
    // Update checkbox
    const checkbox = card.querySelector('div[style*="border-radius: 4px"]');
    if (checkbox) {
        checkbox.style.background = isSelected ? '#10b981' : 'white';
        checkbox.style.borderColor = isSelected ? '#10b981' : '#d1d5db';
        checkbox.innerHTML = isSelected ? '<i class="fas fa-check" style="color: white; font-size: 12px;"></i>' : '';
    }
    
    // Find and update status messages
    const statusDivs = card.querySelectorAll('div[style*="font-size: 11px"]');
    statusDivs.forEach(div => {
        if (div.textContent.includes('Selected for engagement') || div.textContent.includes('Click to')) {
            div.innerHTML = isSelected 
                ? '<i class="fas fa-check-circle"></i> Selected for engagement'
                : '<i class="fas fa-info-circle"></i> Click to select for engagement';
            div.style.color = isSelected ? '#10b981' : '#9ca3af';
            div.style.fontWeight = isSelected ? '600' : 'normal';
        }
    });
}

// Update floating action bar
function updateCatalogSelectionBar() {
    const count = window.catalogSelectedServices.length;
    let bar = document.getElementById('catalog-selection-bar');
    
    if (count === 0) {
        if (bar) bar.remove();
        return;
    }
    
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'catalog-selection-bar';
        bar.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 16px;
            animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(bar);
    }
    
    bar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700;">
                    ${count}
                </div>
                <div>
                    <div style="font-size: 14px; font-weight: 600;">Services Selected</div>
                    <div style="font-size: 11px; opacity: 0.9;">Ready to link to engagement</div>
                </div>
            </div>
            <div style="height: 40px; width: 1px; background: rgba(255,255,255,0.3);"></div>
            <button onclick="saveCatalogSelection()" style="
                background: white;
                color: #059669;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <i class="fas fa-save"></i> Save to Engagement
            </button>
            <button onclick="clearCatalogSelection()" style="
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 10px 16px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
            ">
                <i class="fas fa-times"></i> Clear
            </button>
        </div>
    `;
}

// Save catalog selection to engagement
function saveCatalogSelection() {
    if (!window.currentEngagement) {
        if (typeof showNotification === 'function') {
            showNotification('Please create or select an engagement first', 'warning');
        } else {
            alert('Please create or select an engagement first. Go to Engagement Setup tab.');
        }
        return;
    }
    
    if (window.catalogSelectedServices.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No services selected', 'info');
        } else {
            alert('No services selected');
        }
        return;
    }
    
    const allServices = typeof getAllServicesWithPromoted === 'function' 
        ? getAllServicesWithPromoted() 
        : window.vivictaServiceLoader.getHLServices();
    
    const selectedServicesData = allServices.filter(s => window.catalogSelectedServices.includes(s.id));
    
    // Save to engagement
    window.currentEngagement.selectedServices = [...window.catalogSelectedServices];
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
        showNotification(`Successfully linked ${window.catalogSelectedServices.length} services to engagement!`, 'success');
    } else if (typeof showToast === 'function') {
        showToast('Services Linked', `Successfully linked ${window.catalogSelectedServices.length} services`, 'success');
    } else {
        alert(`Successfully linked ${window.catalogSelectedServices.length} services to engagement!`);
    }
    
    console.log(`✓ Saved ${window.catalogSelectedServices.length} services to engagement`);
    
    // Trigger Target EA refresh
    if (typeof renderTargetServices === 'function') {
        setTimeout(() => renderTargetServices(), 100);
    }
    
    // Clear selection and remove bar
    clearCatalogSelection();
}

// Clear catalog selection
function clearCatalogSelection() {
    const selectedIds = [...window.catalogSelectedServices];
    window.catalogSelectedServices = [];
    
    // Update all card visuals
    selectedIds.forEach(id => updateCatalogCardVisual(id));
    
    // Remove floating bar
    const bar = document.getElementById('catalog-selection-bar');
    if (bar) {
        bar.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => bar.remove(), 300);
    }
    
    console.log('✓ Cleared catalog selection');
}

// Select all visible services in catalog
function selectAllCatalogServices() {
    const allCards = document.querySelectorAll('.service-card-reference[data-service-id]');
    const visibleCards = Array.from(allCards).filter(card => 
        card.offsetParent !== null && card.style.display !== 'none'
    );
    
    visibleCards.forEach(card => {
        const serviceId = card.getAttribute('data-service-id');
        if (!window.catalogSelectedServices.includes(serviceId)) {
            window.catalogSelectedServices.push(serviceId);
            updateCatalogCardVisual(serviceId);
        }
    });
    
    updateCatalogSelectionBar();
    
    if (typeof showNotification === 'function') {
        showNotification(`Selected ${visibleCards.length} services`, 'success');
    }
    
    console.log(`✓ Selected all ${visibleCards.length} visible services`);
}

// Initialize catalog selection on page load
function initializeCatalogSelection() {
    // Load pre-selected services from current engagement if available
    if (window.currentEngagement && window.currentEngagement.selectedServices) {
        window.catalogSelectedServices = [...window.currentEngagement.selectedServices];
        console.log(`✓ Loaded ${window.catalogSelectedServices.length} pre-selected services from engagement`);
    }
}

// Add CSS animations
const catalogSelectionStyles = document.createElement('style');
catalogSelectionStyles.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
    }
    
    .service-card-reference {
        transition: all 0.2s ease !important;
    }
    
    .service-card-reference:hover {
        transform: translateY(-2px) !important;
    }
    
    .service-card-reference:active {
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(catalogSelectionStyles);

// Auto-initialize when WhiteSpot tab is activated
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const catalogContainer = document.querySelector('[data-view="catalog"]');
        if (catalogContainer && catalogContainer.offsetParent !== null) {
            initializeCatalogSelection();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// console.log('✓ Catalog Selection module loaded (v1.0)');
