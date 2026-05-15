/**
 * WhiteSpot Heatmap - Custom Service Creator
 * 
 * Allows users to create customer-specific EA services
 * with custom categories for grouping
 * 
 * Features:
 * - Create custom services (Customer EA Services)
 * - Define custom service categories
 * - Add to heatmap automatically
 * - Full integration with existing service model
 * 
 * @version 1.0
 * @date May 15, 2026
 */

// ═══════════════════════════════════════════════════════════════════
// CUSTOM SERVICE CREATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Open custom service creator modal
 */
window.openCustomServiceCreator = function() {
    const manager = typeof window.whitespotStandaloneManager !== 'undefined' 
        ? window.whitespotStandaloneManager 
        : window.engagementManager;
    
    const customers = manager.getCustomers ? manager.getCustomers() : (manager.getEntities('customers') || []);
    
    if (customers.length === 0) {
        alert('No customer defined. Please create a customer first.');
        return;
    }
    
    const selectedCustomerId = window.currentWhiteSpotCustomer || customers[0].id;
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    
    // Get existing custom categories
    const customCategories = getCustomServiceCategories();
    
    const content = `
        <div style="padding: 24px; max-width: 600px;">
            <h3 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                <i class="fas fa-plus-circle" style="color: #3b82f6;"></i> Create Custom Service
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
                Add a customer-specific EA service to <strong>${selectedCustomer.name}</strong>'s heatmap
            </p>
            
            <!-- Service Name -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                    Service Name *
                </label>
                <input type="text" 
                       id="customServiceName" 
                       placeholder="e.g., Legacy System Migration, Custom Integration Hub"
                       style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                       required>
            </div>
            
            <!-- Service Description -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                    Description
                </label>
                <textarea id="customServiceDescription" 
                          placeholder="Brief description of the service..."
                          style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; min-height: 80px; resize: vertical;"></textarea>
            </div>
            
            <!-- Service Category -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                    Service Category *
                </label>
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <select id="customServiceCategory" 
                            onchange="toggleCustomCategoryInput(this.value)"
                            style="flex: 1; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                        <option value="">-- Select Category --</option>
                        <optgroup label="Existing Custom Categories">
                            ${customCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </optgroup>
                        <option value="__NEW__">+ Create New Category</option>
                    </select>
                </div>
                <input type="text" 
                       id="newCategoryName" 
                       placeholder="Enter new category name (e.g., Customer-Specific Services)"
                       style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; margin-top: 12px; display: none;">
            </div>
            
            <!-- Initial Status -->
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                    Initial Status
                </label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                    <button type="button" 
                            class="custom-status-btn" 
                            data-status="POTENTIAL"
                            onclick="selectCustomServiceStatus('POTENTIAL')"
                            style="padding: 10px; border: 2px solid #22c55e; border-radius: 8px; background: #f0fdf4; color: #16a34a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        🌟 POTENTIAL
                    </button>
                    <button type="button" 
                            class="custom-status-btn" 
                            data-status="PARTIAL"
                            onclick="selectCustomServiceStatus('PARTIAL')"
                            style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; color: #6b7280; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ⚠️ PARTIAL
                    </button>
                    <button type="button" 
                            class="custom-status-btn" 
                            data-status="FULL"
                            onclick="selectCustomServiceStatus('FULL')"
                            style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; color: #6b7280; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ✅ FULL
                    </button>
                </div>
            </div>
            
            <!-- Actions -->
            <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <button onclick="closeModal()" class="btn btn-ghost">
                    Cancel
                </button>
                <button onclick="saveCustomService()" class="btn btn-primary" style="background: #3b82f6;">
                    <i class="fas fa-check"></i> Create Service
                </button>
            </div>
        </div>
    `;
    
    showModal(content);
    
    // Set default status
    window.customServiceStatus = 'POTENTIAL';
};

/**
 * Toggle custom category input visibility
 */
window.toggleCustomCategoryInput = function(value) {
    const newCategoryInput = document.getElementById('newCategoryName');
    if (newCategoryInput) {
        newCategoryInput.style.display = value === '__NEW__' ? 'block' : 'none';
        if (value === '__NEW__') {
            newCategoryInput.focus();
        }
    }
};

/**
 * Select custom service status
 */
window.selectCustomServiceStatus = function(status) {
    window.customServiceStatus = status;
    
    // Update button styles
    const buttons = document.querySelectorAll('.custom-status-btn');
    buttons.forEach(btn => {
        const btnStatus = btn.dataset.status;
        if (btnStatus === status) {
            // Selected state
            const colors = {
                'FULL': { border: '#10b981', bg: '#f0fdf4', text: '#059669' },
                'PARTIAL': { border: '#ec4899', bg: '#fce7f3', text: '#db2777' },
                'POTENTIAL': { border: '#22c55e', bg: '#f0fdf4', text: '#16a34a' }
            };
            const color = colors[status];
            btn.style.borderColor = color.border;
            btn.style.background = color.bg;
            btn.style.color = color.text;
            btn.style.transform = 'scale(1.05)';
        } else {
            // Unselected state
            btn.style.borderColor = '#e5e7eb';
            btn.style.background = 'white';
            btn.style.color = '#6b7280';
            btn.style.transform = 'scale(1)';
        }
    });
};

/**
 * Save custom service to heatmap
 */
window.saveCustomService = async function() {
    // Get form values
    const serviceName = document.getElementById('customServiceName').value.trim();
    const description = document.getElementById('customServiceDescription').value.trim();
    const categorySelect = document.getElementById('customServiceCategory').value;
    const newCategoryName = document.getElementById('newCategoryName').value.trim();
    const status = window.customServiceStatus || 'POTENTIAL';
    
    // Validation
    if (!serviceName) {
        alert('Please enter a service name');
        document.getElementById('customServiceName').focus();
        return;
    }
    
    let category = categorySelect;
    if (categorySelect === '__NEW__') {
        if (!newCategoryName) {
            alert('Please enter a new category name');
            document.getElementById('newCategoryName').focus();
            return;
        }
        category = newCategoryName;
    } else if (!category) {
        alert('Please select or create a category');
        document.getElementById('customServiceCategory').focus();
        return;
    }
    
    // Get manager and customer
    const manager = typeof window.whitespotStandaloneManager !== 'undefined' 
        ? window.whitespotStandaloneManager 
        : window.engagementManager;
    
    const customers = manager.getCustomers ? manager.getCustomers() : (manager.getEntities('customers') || []);
    const selectedCustomerId = window.currentWhiteSpotCustomer || customers[0].id;
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    
    // Get current heatmap
    const heatmaps = manager.getHeatmaps ? manager.getHeatmaps() : (manager.getEntities('whiteSpotHeatmaps') || []);
    let heatmap = heatmaps.find(h => h.customerId === selectedCustomerId);
    
    if (!heatmap) {
        alert('No heatmap found for this customer');
        return;
    }
    
    // Generate custom service ID
    const customServiceId = `CUSTOM-${Date.now()}`;
    
    // Create custom service object
    const customService = {
        id: customServiceId,
        name: serviceName,
        description: description || '',
        l1ParentName: category,
        l1SubArea: 'Custom',
        isCustom: true,
        customerId: selectedCustomerId,
        createdAt: new Date().toISOString(),
        createdBy: 'user'
    };
    
    // Add to custom services registry
    if (!window.customServices) {
        window.customServices = [];
    }
    window.customServices.push(customService);
    
    // Save to localStorage for persistence
    localStorage.setItem('whitespot_custom_services', JSON.stringify(window.customServices));
    
    // Create assessment and add to heatmap
    const assessment = {
        l2ServiceId: customServiceId,
        l2ServiceName: serviceName,
        l1ServiceArea: category,
        assessmentState: status,
        vivictaSPOC: null,
        l3Components: [],
        score: 0,
        apqcMappedCapabilities: [],
        opportunityValue: 0,
        notes: description,
        isCustom: true
    };
    
    heatmap.hlAssessments.push(assessment);
    
    // Update metadata
    heatmap.metadata = heatmap.metadata || {};
    heatmap.metadata.updatedAt = new Date().toISOString();
    
    // Save heatmap
    manager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    closeModal();
    
    if (typeof showNotification === 'function') {
        showNotification(`✅ Custom service "${serviceName}" added to heatmap`, 'success');
    } else {
        alert(`✅ Custom service "${serviceName}" created successfully!`);
    }
    
    // Re-render
    await renderWhiteSpotHeatmap();
};

/**
 * Get existing custom service categories
 */
function getCustomServiceCategories() {
    if (!window.customServices) {
        // Load from localStorage
        const saved = localStorage.getItem('whitespot_custom_services');
        window.customServices = saved ? JSON.parse(saved) : [];
    }
    
    // Extract unique categories
    const categories = new Set();
    window.customServices.forEach(service => {
        if (service.l1ParentName) {
            categories.add(service.l1ParentName);
        }
    });
    
    return Array.from(categories).sort();
}

/**
 * Load custom services on page load
 */
window.loadCustomServices = function() {
    const saved = localStorage.getItem('whitespot_custom_services');
    if (saved) {
        window.customServices = JSON.parse(saved);
        console.log(`✓ Loaded ${window.customServices.length} custom services`);
    } else {
        window.customServices = [];
    }
};

// Initialize on load
loadCustomServices();

console.log('✓ WhiteSpot Custom Services module loaded (v1.0)');
