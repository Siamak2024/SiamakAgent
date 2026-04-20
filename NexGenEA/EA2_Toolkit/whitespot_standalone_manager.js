/**
 * whitespot_standalone_manager.js
 * Standalone data manager for WhiteSpot Heatmap
 * Provides localStorage-based data persistence without full engagement workflow
 * 
 * @version 1.0
 * @date 2026-04-20
 */

(function() {
    'use strict';
    
    const STORAGE_KEY = 'whitespot_standalone_data';
    const VERSION = '1.0';
    
    /**
     * WhiteSpot Standalone Manager
     * Manages prospects/customers and their heatmaps independently
     */
    class WhiteSpotStandaloneManager {
        constructor() {
            this.data = {
                version: VERSION,
                customers: [],
                whiteSpotHeatmaps: [],
                metadata: {
                    createdAt: null,
                    updatedAt: null
                }
            };
            this.isInitialized = false;
        }
        
        /**
         * Initialize manager and load data from localStorage
         */
        async initialize() {
            console.log('📊 Initializing WhiteSpot Standalone Manager...');
            
            // Load data from localStorage
            this.loadFromStorage();
            
            // Ensure data loaders are ready
            if (!window.vivictaServiceLoader.isReady()) {
                console.log('⏳ Loading Service Model...');
                await window.vivictaServiceLoader.loadServiceModel('data/vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json');
            }
            
            if (!window.apqcWhiteSpotIntegration.isReady()) {
                console.log('⏳ Loading APQC Framework...');
                await window.apqcWhiteSpotIntegration.loadAPQCFramework('data/apqc_pcf_master.json');
            }
            
            this.isInitialized = true;
            console.log('✅ WhiteSpot Standalone Manager initialized');
            console.log(`   📋 Customers: ${this.data.customers.length}`);
            console.log(`   🗺️ Heatmaps: ${this.data.whiteSpotHeatmaps.length}`);
            
            return true;
        }
        
        /**
         * Load data from localStorage
         */
        loadFromStorage() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    
                    // Validate version compatibility
                    if (parsed.version === VERSION) {
                        this.data = parsed;
                        console.log('✅ Loaded data from localStorage');
                    } else {
                        console.warn('⚠️ Version mismatch - using fresh data store');
                        this.initializeFreshData();
                    }
                } else {
                    console.log('📝 No existing data found - initializing fresh');
                    this.initializeFreshData();
                }
            } catch (error) {
                console.error('❌ Error loading from localStorage:', error);
                this.initializeFreshData();
            }
        }
        
        /**
         * Initialize fresh data structure
         */
        initializeFreshData() {
            this.data = {
                version: VERSION,
                customers: [],
                whiteSpotHeatmaps: [],
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            };
            this.saveToStorage();
        }
        
        /**
         * Save data to localStorage
         */
        saveToStorage() {
            try {
                this.data.metadata.updatedAt = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
                console.log('💾 Data saved to localStorage');
            } catch (error) {
                console.error('❌ Error saving to localStorage:', error);
                if (error.name === 'QuotaExceededError') {
                    alert('Storage quota exceeded. Please export your data and clear old entries.');
                }
            }
        }
        
        // ═════════════════════════════════════════════════════════════
        // CUSTOMER/PROSPECT MANAGEMENT
        // ═════════════════════════════════════════════════════════════
        
        /**
         * Get all customers/prospects
         */
        getCustomers() {
            return this.data.customers || [];
        }
        
        /**
         * Get customer by ID
         */
        getCustomer(customerId) {
            return this.data.customers.find(c => c.id === customerId);
        }
        
        /**
         * Add new customer/prospect
         */
        addCustomer(customerData) {
            const newCustomer = {
                id: customerData.id || this.generateId('CUST'),
                name: customerData.name,
                type: customerData.type || 'Prospect', // Prospect, Customer, Partner
                industry: customerData.industry || '',
                region: customerData.region || '',
                revenue: customerData.revenue || '',
                employees: customerData.employees || '',
                contact: customerData.contact || '',
                email: customerData.email || '',
                phone: customerData.phone || '',
                notes: customerData.notes || '',
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'Standalone User'
                }
            };
            
            this.data.customers.push(newCustomer);
            this.saveToStorage();
            
            return newCustomer;
        }
        
        /**
         * Update customer
         */
        updateCustomer(customerId, updates) {
            const index = this.data.customers.findIndex(c => c.id === customerId);
            if (index !== -1) {
                this.data.customers[index] = {
                    ...this.data.customers[index],
                    ...updates,
                    metadata: {
                        ...this.data.customers[index].metadata,
                        updatedAt: new Date().toISOString()
                    }
                };
                this.saveToStorage();
                return this.data.customers[index];
            }
            return null;
        }
        
        /**
         * Delete customer
         */
        deleteCustomer(customerId) {
            const index = this.data.customers.findIndex(c => c.id === customerId);
            if (index !== -1) {
                // Also delete associated heatmaps
                this.data.whiteSpotHeatmaps = this.data.whiteSpotHeatmaps.filter(h => h.customerId !== customerId);
                this.data.customers.splice(index, 1);
                this.saveToStorage();
                return true;
            }
            return false;
        }
        
        // ═════════════════════════════════════════════════════════════
        // HEATMAP MANAGEMENT
        // ═════════════════════════════════════════════════════════════
        
        /**
         * Get all heatmaps
         */
        getHeatmaps() {
            return this.data.whiteSpotHeatmaps || [];
        }
        
        /**
         * Get heatmap by ID
         */
        getHeatmap(heatmapId) {
            return this.data.whiteSpotHeatmaps.find(h => h.id === heatmapId);
        }
        
        /**
         * Get heatmap by customer ID
         */
        getHeatmapByCustomer(customerId) {
            return this.data.whiteSpotHeatmaps.find(h => h.customerId === customerId);
        }
        
        /**
         * Add new heatmap
         */
        addHeatmap(heatmapData) {
            const newHeatmap = {
                id: heatmapData.id || this.generateId('WSH'),
                customerId: heatmapData.customerId,
                customerName: heatmapData.customerName,
                assessmentDate: heatmapData.assessmentDate || new Date().toISOString().split('T')[0],
                assessedBy: heatmapData.assessedBy || 'Standalone User',
                hlAssessments: heatmapData.hlAssessments || [],
                opportunities: heatmapData.opportunities || [],
                customBusinessAreas: heatmapData.customBusinessAreas || [],
                apqcMappings: heatmapData.apqcMappings || [],
                description: heatmapData.description || '',
                comments: heatmapData.comments || '',
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'Standalone User',
                    version: VERSION
                }
            };
            
            this.data.whiteSpotHeatmaps.push(newHeatmap);
            this.saveToStorage();
            
            return newHeatmap;
        }
        
        /**
         * Update heatmap
         */
        updateHeatmap(heatmapId, updates) {
            const index = this.data.whiteSpotHeatmaps.findIndex(h => h.id === heatmapId);
            if (index !== -1) {
                this.data.whiteSpotHeatmaps[index] = {
                    ...this.data.whiteSpotHeatmaps[index],
                    ...updates,
                    metadata: {
                        ...this.data.whiteSpotHeatmaps[index].metadata,
                        updatedAt: new Date().toISOString()
                    }
                };
                this.saveToStorage();
                return this.data.whiteSpotHeatmaps[index];
            }
            return null;
        }
        
        /**
         * Delete heatmap
         */
        deleteHeatmap(heatmapId) {
            const index = this.data.whiteSpotHeatmaps.findIndex(h => h.id === heatmapId);
            if (index !== -1) {
                this.data.whiteSpotHeatmaps.splice(index, 1);
                this.saveToStorage();
                return true;
            }
            return false;
        }
        
        // ═════════════════════════════════════════════════════════════
        // COMPATIBILITY LAYER (Mimic engagementManager API)
        // ═════════════════════════════════════════════════════════════
        
        /**
         * Get entities (compatibility with engagementManager)
         */
        getEntities(type) {
            if (type === 'customers') {
                return this.getCustomers();
            } else if (type === 'whiteSpotHeatmaps') {
                return this.getHeatmaps();
            }
            return [];
        }
        
        /**
         * Get entity (compatibility with engagementManager)
         */
        getEntity(type, id) {
            if (type === 'customers') {
                return this.getCustomer(id);
            } else if (type === 'whiteSpotHeatmaps') {
                return this.getHeatmap(id);
            }
            return null;
        }
        
        /**
         * Add entity (compatibility with engagementManager)
         */
        addEntity(type, data) {
            if (type === 'customers') {
                return this.addCustomer(data);
            } else if (type === 'whiteSpotHeatmaps') {
                return this.addHeatmap(data);
            }
            return null;
        }
        
        /**
         * Update entity (compatibility with engagementManager)
         */
        updateEntity(type, id, updates) {
            if (type === 'customers') {
                return this.updateCustomer(id, updates);
            } else if (type === 'whiteSpotHeatmaps') {
                return this.updateHeatmap(id, updates);
            }
            return null;
        }
        
        /**
         * Delete entity (compatibility with engagementManager)
         */
        deleteEntity(type, id) {
            if (type === 'customers') {
                return this.deleteCustomer(id);
            } else if (type === 'whiteSpotHeatmaps') {
                return this.deleteHeatmap(id);
            }
            return false;
        }
        
        // ═════════════════════════════════════════════════════════════
        // IMPORT / EXPORT
        // ═════════════════════════════════════════════════════════════
        
        /**
         * Export all data as JSON
         */
        exportData() {
            return JSON.stringify(this.data, null, 2);
        }
        
        /**
         * Import data from JSON
         */
        importData(jsonData) {
            try {
                const imported = JSON.parse(jsonData);
                
                // Validate structure
                if (!imported.customers || !imported.whiteSpotHeatmaps) {
                    throw new Error('Invalid data structure');
                }
                
                // Merge or replace data
                this.data = {
                    version: VERSION,
                    customers: imported.customers,
                    whiteSpotHeatmaps: imported.whiteSpotHeatmaps,
                    metadata: {
                        ...imported.metadata,
                        importedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                };
                
                this.saveToStorage();
                return true;
            } catch (error) {
                console.error('❌ Import error:', error);
                return false;
            }
        }
        
        /**
         * Clear all data
         */
        clearAllData() {
            if (confirm('⚠️ This will delete all customers and heatmaps. Are you sure?')) {
                this.initializeFreshData();
                return true;
            }
            return false;
        }
        
        // ═════════════════════════════════════════════════════════════
        // UTILITY FUNCTIONS
        // ═════════════════════════════════════════════════════════════
        
        /**
         * Generate unique ID
         */
        generateId(prefix = 'ID') {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 7);
            return `${prefix}-${timestamp}-${random}`.toUpperCase();
        }
        
        /**
         * Get statistics
         */
        getStatistics() {
            return {
                customers: this.data.customers.length,
                heatmaps: this.data.whiteSpotHeatmaps.length,
                prospects: this.data.customers.filter(c => c.type === 'Prospect').length,
                activeCustomers: this.data.customers.filter(c => c.type === 'Customer').length,
                lastUpdated: this.data.metadata.updatedAt
            };
        }
    }
    
    // ═════════════════════════════════════════════════════════════
    // GLOBAL INTERFACE
    // ═════════════════════════════════════════════════════════════
    
    // Create singleton instance
    window.whitespotStandaloneManager = new WhiteSpotStandaloneManager();
    
    // If no engagementManager exists, use standalone manager as fallback
    if (typeof window.engagementManager === 'undefined') {
        console.log('📌 Using WhiteSpot Standalone Manager (no engagementManager detected)');
        window.engagementManager = window.whitespotStandaloneManager;
    }
    
    console.log('✅ WhiteSpot Standalone Manager loaded');
    
})();

// ═════════════════════════════════════════════════════════════
// STANDALONE-SPECIFIC ACTIONS
// ═════════════════════════════════════════════════════════════

/**
 * Add new prospect/customer (standalone mode)
 */
function addNewProspect() {
    const modalContent = `
        <div class="modal-header">
            <h3>Add Prospect / Customer</h3>
            <button class="btn btn-icon btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" id="prospect-name" class="form-input" placeholder="Company name" required>
            </div>
            
            <div class="form-group">
                <label>Type *</label>
                <select id="prospect-type" class="form-select">
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Industry</label>
                <input type="text" id="prospect-industry" class="form-input" placeholder="e.g., Financial Services">
            </div>
            
            <div class="form-group">
                <label>Region</label>
                <input type="text" id="prospect-region" class="form-input" placeholder="e.g., EMEA, North America">
            </div>
            
            <div class="form-group">
                <label>Annual Revenue</label>
                <input type="text" id="prospect-revenue" class="form-input" placeholder="e.g., $500M">
            </div>
            
            <div class="form-group">
                <label>Employees</label>
                <input type="text" id="prospect-employees" class="form-input" placeholder="e.g., 5000">
            </div>
            
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" id="prospect-contact" class="form-input" placeholder="Primary contact name">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="prospect-email" class="form-input" placeholder="contact@company.com">
            </div>
            
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" id="prospect-phone" class="form-input" placeholder="+1 (555) 123-4567">
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea id="prospect-notes" class="form-input" rows="3" placeholder="Additional notes..."></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveNewProspect()">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
    setTimeout(() => document.getElementById('prospect-name').focus(), 100);
}

/**
 * Save new prospect/customer
 */
function saveNewProspect() {
    const name = document.getElementById('prospect-name').value.trim();
    
    if (!name) {
        alert('Please enter a company name');
        document.getElementById('prospect-name').focus();
        return;
    }
    
    const customerData = {
        name: name,
        type: document.getElementById('prospect-type').value,
        industry: document.getElementById('prospect-industry').value.trim(),
        region: document.getElementById('prospect-region').value.trim(),
        revenue: document.getElementById('prospect-revenue').value.trim(),
        employees: document.getElementById('prospect-employees').value.trim(),
        contact: document.getElementById('prospect-contact').value.trim(),
        email: document.getElementById('prospect-email').value.trim(),
        phone: document.getElementById('prospect-phone').value.trim(),
        notes: document.getElementById('prospect-notes').value.trim()
    };
    
    const newCustomer = window.whitespotStandaloneManager.addCustomer(customerData);
    
    closeModal();
    showNotification(`${customerData.type} "${name}" added successfully`, 'success');
    
    // Refresh view
    if (typeof renderWhiteSpotHeatmap === 'function') {
        renderWhiteSpotHeatmap();
    }
}

/**
 * Import data from JSON file
 */
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const success = window.whitespotStandaloneManager.importData(event.target.result);
                if (success) {
                    showNotification('Data imported successfully', 'success');
                    if (typeof renderWhiteSpotHeatmap === 'function') {
                        renderWhiteSpotHeatmap();
                    }
                } else {
                    showNotification('Import failed - invalid data format', 'error');
                }
            } catch (error) {
                console.error('Import error:', error);
                showNotification('Import failed - ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Export all data to JSON file
 */
function exportAllData() {
    const jsonData = window.whitespotStandaloneManager.exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `whitespot_data_${timestamp}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully', 'success');
}

/**
 * Load demo data for testing
 */
function loadDemoData() {
    if (typeof generateWhiteSpotDemoData === 'function') {
        // Use existing demo generator if available
        generateWhiteSpotDemoData();
        showNotification('Demo data loaded successfully', 'success');
        if (typeof renderWhiteSpotHeatmap === 'function') {
            renderWhiteSpotHeatmap();
        }
    } else {
        showNotification('Demo data generator not available', 'warning');
    }
}

/**
 * Clear all data
 */
function clearAllData() {
    if (window.whitespotStandaloneManager.clearAllData()) {
        showNotification('All data cleared', 'success');
        if (typeof renderWhiteSpotHeatmap === 'function') {
            renderWhiteSpotHeatmap();
        }
    }
}
