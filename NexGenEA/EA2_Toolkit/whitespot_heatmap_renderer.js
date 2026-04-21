/**
 * whitespot_heatmap_renderer.js
 * UI rendering functions for WhiteSpot Heatmap feature
 * Handles grid visualization, drill-down, APQC mapping, and assessment controls
 * 
 * @version 1.0
 * @date 2026-04-20
 */

// ═══════════════════════════════════════════════════════════════════
// MAIN RENDERING FUNCTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Render WhiteSpot Heatmap for current engagement
 * Called by switchTab when navigating to White-Spot Analysis
 */
async function renderWhiteSpotHeatmap() {
    const container = document.getElementById('whitespot-heatmap-container');
    
    // Initialize loaders if not already loaded
    if (!window.vivictaServiceLoader.isReady()) {
        const loaded = await window.vivictaServiceLoader.loadServiceModel('data/vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json');
        if (!loaded) {
            container.innerHTML = renderErrorState('Failed to load Service Model. Check console for details.');
            return;
        }
    }
    
    if (!window.apqcWhiteSpotIntegration.isReady()) {
        await window.apqcWhiteSpotIntegration.loadAPQCFramework('data/apqc_pcf_master.json');
    }
    
    // Determine which manager to use (standalone vs integrated)
    const isStandalone = typeof window.whitespotStandaloneManager !== 'undefined';
    const manager = isStandalone ? window.whitespotStandaloneManager : window.engagementManager;
    
    // Get customers and heatmaps
    const customers = manager.getCustomers ? manager.getCustomers() : (manager.getEntities('customers') || []);
    const heatmaps = manager.getHeatmaps ? manager.getHeatmaps() : (manager.getEntities('whiteSpotHeatmaps') || []);
    
    // Check if we have customers
    if (customers.length === 0) {
        container.innerHTML = renderEmptyCustomerState();
        return;
    }
    
    // Get selected customer (default to first if none selected)
    const selectedCustomerId = window.currentWhiteSpotCustomer || customers[0].id;
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    
    // Get heatmap for selected customer
    let heatmap = heatmaps.find(h => h.customerId === selectedCustomerId);
    
    // If no heatmap exists for this customer, show create prompt
    if (!heatmap) {
        container.innerHTML = renderCreateHeatmapState(selectedCustomer, customers);
        return;
    }
    
    // Render full heatmap UI
    container.innerHTML = renderHeatmapGrid(heatmap, selectedCustomer, customers);
    
    // Initialize collapsible accordions
    initializeAccordions();
    
    // Apply filters if filtering system is available (Phase 4)
    if (typeof applyFilters === 'function') {
        applyFilters();
    }
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY STATES
// ═══════════════════════════════════════════════════════════════════

function renderEmptyCustomerState() {
    return `
        <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-building"></i></div>
            <div class="empty-state-title">No customers defined</div>
            <div class="empty-state-text">
                WhiteSpot Heatmap requires at least one customer. You can add a customer in Engagement Setup or load demo data to explore the feature.
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <button class="btn btn-primary" onclick="switchTab('engagement', document.querySelector('[data-tab=engagement]'))" style="margin: 0;">
                    <i class="fas fa-arrow-left"></i> Go to Engagement Setup
                </button>
                <button class="btn btn-secondary" onclick="loadWhiteSpotDemoData()" style="margin: 0;">
                    <i class="fas fa-flask"></i> Load Demo Data
                </button>
            </div>
        </div>
    `;
}

function renderCreateHeatmapState(customer, allCustomers) {
    return `
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #111827;">
                    <i class="fas fa-th" style="color: #10b981; margin-right: 8px;"></i>
                    WhiteSpot Heatmap - Service Delivery Coverage
                </h3>
                ${renderCustomerSelector(customer, allCustomers)}
            </div>
        </div>
        
        <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-th"></i></div>
            <div class="empty-state-title">No WhiteSpot Heatmap for ${customer.name}</div>
            <div class="empty-state-text">
                Create a new heatmap to assess service delivery coverage and identify opportunities.
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px;">
                <button class="btn btn-primary" onclick="createNewHeatmap('${customer.id}')">
                    <i class="fas fa-plus"></i> Create Heatmap for ${customer.name}
                </button>
                <button class="btn btn-secondary" onclick="generateDemoHeatmapForCustomer('${customer.id}')">
                    <i class="fas fa-magic"></i> Generate Demo Data
                </button>
            </div>
            <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; max-width: 600px; margin-left: auto; margin-right: auto;">
                <h4 style="font-size: 14px; font-weight: 600; color: #065f46; margin-bottom: 8px;">
                    <i class="fas fa-info-circle" style="margin-right: 6px;"></i>What is WhiteSpot Heatmap?
                </h4>
                <ul style="font-size: 13px; color: #047857; margin-left: 20px; line-height: 1.6;">
                    <li>Assess service delivery coverage across 41 High-Level services</li>
                    <li>Track 5 states: FULL, PARTIAL, CUSTOM, LOST, POTENTIAL</li>
                    <li>Map to APQC capabilities for business alignment</li>
                    <li>Identify white-spots and growth opportunities</li>
                </ul>
            </div>
        </div>
    `;
}

function renderErrorState(message) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon" style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="empty-state-title">Error Loading WhiteSpot Heatmap</div>
            <div class="empty-state-text">${message}</div>
            <button class="btn btn-primary" onclick="renderWhiteSpotHeatmap()" style="margin-top: 16px;">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOMER SELECTOR
// ═══════════════════════════════════════════════════════════════════

function renderCustomerSelector(selectedCustomer, allCustomers) {
    return `
        <div style="display: flex; align-items: center; gap: 12px;">
            <label style="font-size: 14px; font-weight: 500; color: #6b7280;">Customer:</label>
            <select 
                id="whitespot-customer-selector" 
                onchange="switchWhiteSpotCustomer(this.value)"
                style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; min-width: 200px;"
            >
                ${allCustomers.map(c => `
                    <option value="${c.id}" ${c.id === selectedCustomer.id ? 'selected' : ''}>
                        ${c.name}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// HEATMAP GRID RENDERING
// ═══════════════════════════════════════════════════════════════════

// Global view state
if (typeof window.whiteSpotView === 'undefined') {
    window.whiteSpotView = 'cards'; // 'cards' or 'table'
}

function renderHeatmapGrid(heatmap, customer, allCustomers) {
    const hlServices = window.vivictaServiceLoader.getHLServicesGrouped();
    const stats = calculateHeatmapStats(heatmap);
    
    return `
        <!-- Header Section -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 700; color: #111827;">
                        <i class="fas fa-th" style="color: #10b981; margin-right: 8px;"></i>
                        WhiteSpot Heatmap - Service Delivery Coverage
                    </h3>
                    <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                        <strong>Customer:</strong> ${customer.name} | 
                        <strong>Assessed:</strong> ${formatDate(heatmap.assessmentDate)} | 
                        <strong>By:</strong> ${heatmap.assessedBy}
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    ${renderCustomerSelector(customer, allCustomers)}
                    
                    <!-- View Toggle -->
                    <div class="btn-group" style="display: inline-flex; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <button 
                            class="btn ${window.whiteSpotView === 'cards' ? 'btn-primary' : 'btn-ghost'}" 
                            onclick="switchWhiteSpotView('cards')"
                            title="Card View"
                            style="border-radius: 0; border: none; padding: 8px 12px;">
                            <i class="fas fa-th-large"></i>
                        </button>
                        <button 
                            class="btn ${window.whiteSpotView === 'table' ? 'btn-primary' : 'btn-ghost'}" 
                            onclick="switchWhiteSpotView('table')"
                            title="Table View"
                            style="border-radius: 0; border: none; padding: 8px 12px;">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                    
                    <button class="btn btn-ghost" onclick="showWhiteSpotHelp()" title="Help & Guide">
                        <i class="fas fa-question-circle"></i>
                    </button>
                    <button class="btn btn-primary" onclick="showAnalyticsDashboard('${heatmap.id}')" title="Analytics Dashboard">
                        <i class="fas fa-chart-bar"></i> Analytics
                    </button>
                    <button class="btn btn-ghost" onclick="editHeatmapInfo('${heatmap.id}')" title="Edit heatmap info">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-ghost" onclick="exportHeatmapCSV('${heatmap.id}')" title="Export to CSV">
                        <i class="fas fa-file-csv"></i>
                    </button>
                    <button class="btn btn-ghost" onclick="printHeatmap('${heatmap.id}')" title="Print heatmap">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-ghost" onclick="exportHeatmap('${heatmap.id}')" title="Export JSON">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
            
            <!-- Stats Summary -->
            ${renderHeatmapStats(stats)}
        </div>
        
        <!-- Description and Comments -->
        ${heatmap.description || heatmap.comments ? `
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                ${heatmap.description ? `
                    <div style="margin-bottom: ${heatmap.comments ? '12px' : '0'};">
                        <strong style="font-size: 13px; color: #374151;">Description:</strong>
                        <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">${heatmap.description}</p>
                    </div>
                ` : ''}
                ${heatmap.comments ? `
                    <div>
                        <strong style="font-size: 13px; color: #374151;">Comments:</strong>
                        <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">${heatmap.comments}</p>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
        <!-- Filter Controls (Phase 4) -->
        ${typeof renderFilterControls === 'function' ? renderFilterControls(heatmap) : ''}
        
        <!-- Bulk Operations Toolbar (Phase 4) -->
        ${typeof renderBulkOperationsToolbar === 'function' ? renderBulkOperationsToolbar(heatmap) : ''}
        
        <!-- Heatmap View (Cards or Table) -->
        ${window.whiteSpotView === 'cards' 
            ? renderHeatmapCardsView(hlServices, heatmap, stats)
            : renderHeatmapTableView(hlServices, heatmap, stats)
        }
        
        <!-- Opportunities Section -->
        ${heatmap.opportunities && heatmap.opportunities.length > 0 ? renderOpportunities(heatmap) : ''}
        
        <!-- Custom Business Areas -->
        ${heatmap.customBusinessAreas && heatmap.customBusinessAreas.length > 0 ? renderCustomBusinessAreas(heatmap) : ''}
    `;
}

// ═══════════════════════════════════════════════════════════════════
// VIEW SWITCHING
// ═══════════════════════════════════════════════════════════════════

function switchWhiteSpotView(viewType) {
    window.whiteSpotView = viewType;
    renderWhiteSpotHeatmap();
}

// ═══════════════════════════════════════════════════════════════════
// CARD VIEW RENDERING (APQC-Style Capability Map)
// ═══════════════════════════════════════════════════════════════════

function renderHeatmapCardsView(hlServices, heatmap, stats) {
    return `
        <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #111827;">
                    Service Delivery Capability Map (${stats.totalHL} Services)
                </h4>
                <div style="display: flex; gap: 16px; font-size: 12px;">
                    ${renderLegend()}
                </div>
            </div>
            
            ${hlServices.map((l1Group, index) => renderL1CardGroup(l1Group, heatmap, index)).join('')}
        </div>
    `;
}

function renderL1CardGroup(l1Group, heatmap, index) {
    // Get L1 background color based on index
    const l1Colors = [
        { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },  // Yellow
        { bg: '#fed7aa', border: '#fdba74', text: '#7c2d12' },  // Orange
        { bg: '#fce7f3', border: '#fbcfe8', text: '#831843' },  // Pink
        { bg: '#dbeafe', border: '#bfdbfe', text: '#1e3a8a' },  // Blue
        { bg: '#d1fae5', border: '#a7f3d0', text: '#064e3b' },  // Green
        { bg: '#e0e7ff', border: '#c7d2fe', text: '#312e81' }   // Indigo
    ];
    const colorScheme = l1Colors[index % l1Colors.length];
    
    return `
        <div style="
            background: ${colorScheme.bg}; 
            border: 2px solid ${colorScheme.border};
            border-radius: 12px; 
            padding: 20px;
            margin-bottom: 20px;
            position: relative;
        ">
            <!-- L1 Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h5 style="font-size: 15px; font-weight: 700; color: ${colorScheme.text}; margin: 0;">
                    <i class="fas fa-layer-group" style="margin-right: 8px;"></i>
                    ${l1Group.l1Name}
                </h5>
                <div style="
                    background: rgba(255,255,255,0.8);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: ${colorScheme.text};
                ">
                    ${l1Group.hlServices.length} Services
                </div>
            </div>
            
            <!-- Service Cards Grid -->
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
            ">
                ${l1Group.hlServices.map(service => renderServiceCard(service, heatmap, l1Group)).join('')}
            </div>
        </div>
    `;
}

function renderServiceCard(service, heatmap, l1Group) {
    // Find assessment for this service
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === service.id);
    const state = assessment ? assessment.assessmentState : 'POTENTIAL';
    const score = assessment ? assessment.score : 0;
    
    // Check for gaps and opportunities
    const hasGaps = assessment && (assessment.gaps?.length > 0 || assessment.identifiedGaps?.length > 0);
    const hasOpportunities = heatmap.opportunities?.some(opp => opp.l2ServiceId === service.id);
    
    // Get color based on assessment state
    const stateColors = {
        'FULL': { bg: '#10b981', text: '#ffffff', icon: 'check-circle', label: 'FULL' },
        'PARTIAL': { bg: '#f59e0b', text: '#ffffff', icon: 'exclamation-triangle', label: 'PARTIAL' },
        'CUSTOM': { bg: '#3b82f6', text: '#ffffff', icon: 'cog', label: 'CUSTOM' },
        'LOST': { bg: '#ef4444', text: '#ffffff', icon: 'times-circle', label: 'LOST' },
        'POTENTIAL': { bg: '#f97316', text: '#ffffff', icon: 'star', label: 'POTENTIAL' }
    };
    const colorScheme = stateColors[state] || stateColors['POTENTIAL'];
    
    return `
        <div 
            class="service-card"
            data-service-id="${service.id}"
            data-service-name="${service.name.toLowerCase()}"
            data-assessment-state="${state}"
            data-l1-area="${l1Group.l1Name}"
            data-score="${score}"
            data-has-gaps="${hasGaps}"
            data-has-opportunities="${hasOpportunities}"
            onclick="openServiceDrilldown('${heatmap.id}', '${service.id}')"
            style="
                background: ${colorScheme.bg};
                color: ${colorScheme.text};
                border-radius: 10px;
                padding: 14px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                min-height: 90px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            "
            onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        >
            <!-- Service Name -->
            <div style="
                font-size: 13px;
                font-weight: 600;
                line-height: 1.3;
                margin-bottom: 8px;
                padding-right: 20px;
            ">
                ${service.name}
            </div>
            
            <!-- State Badge & Score -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: rgba(255,255,255,0.3);
                    padding: 3px 8px;
                    border-radius: 4px;
                ">
                    <i class="fas fa-${colorScheme.icon}" style="margin-right: 4px;"></i>
                    ${colorScheme.label}
                </div>
                ${score > 0 ? `
                    <div style="
                        font-size: 12px;
                        font-weight: 700;
                        background: rgba(255,255,255,0.3);
                        padding: 2px 6px;
                        border-radius: 4px;
                    ">
                        ${score}%
                    </div>
                ` : ''}
            </div>
            
            <!-- Grid Icon (top-right corner) -->
            <div style="
                position: absolute;
                top: 10px;
                right: 10px;
                opacity: 0.5;
            ">
                <i class="fas fa-th" style="font-size: 12px;"></i>
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// TABLE VIEW RENDERING (Original Accordion View)
// ═══════════════════════════════════════════════════════════════════

function renderHeatmapTableView(hlServices, heatmap, stats) {
    return `
        <!-- Heatmap Grid by L1 Service Areas (Accordion) -->
        <div style="background: white; border-radius: 12px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #111827;">
                    Service Delivery Assessment (${stats.totalHL} Services)
                </h4>
                <div style="display: flex; gap: 16px; font-size: 12px;">
                    ${renderLegend()}
                </div>
            </div>
            
            ${typeof renderHeatmapLegend === 'function' ? renderHeatmapLegend() : ''}
            
            ${hlServices.map((l1Group, index) => renderL1ServiceGroup(l1Group, heatmap, index === 0)).join('')}
        </div>
        
        <!-- Opportunities Section -->
        ${heatmap.opportunities && heatmap.opportunities.length > 0 ? renderOpportunities(heatmap) : ''}
        
        <!-- Custom Business Areas -->
        ${heatmap.customBusinessAreas && heatmap.customBusinessAreas.length > 0 ? renderCustomBusinessAreas(heatmap) : ''}
    `;
}

// ═══════════════════════════════════════════════════════════════════
// STATS & LEGEND
// ═══════════════════════════════════════════════════════════════════

function calculateHeatmapStats(heatmap) {
    const assessments = heatmap.hlAssessments || [];
    const stats = {
        totalHL: assessments.length,
        full: 0,
        partial: 0,
        custom: 0,
        lost: 0,
        potential: 0,
        notAssessed: 0
    };
    
    assessments.forEach(assess => {
        const state = assess.assessmentState;
        if (state === 'FULL') stats.full++;
        else if (state === 'PARTIAL') stats.partial++;
        else if (state === 'CUSTOM') stats.custom++;
        else if (state === 'LOST') stats.lost++;
        else if (state === 'POTENTIAL') stats.potential++;
        else stats.notAssessed++;
    });
    
    return stats;
}

function renderHeatmapStats(stats) {
    return `
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;">
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${stats.full}</div>
                <div style="font-size: 11px; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">FULL</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${stats.partial}</div>
                <div style="font-size: 11px; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px;">PARTIAL</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${stats.custom}</div>
                <div style="font-size: 11px; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">CUSTOM</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${stats.lost}</div>
                <div style="font-size: 11px; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">LOST</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #f97316;">${stats.potential}</div>
                <div style="font-size: 11px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">POTENTIAL</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #6b7280;">${stats.totalHL}</div>
                <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL</div>
            </div>
        </div>
    `;
}

function renderLegend() {
    return `
        <span style="display: inline-flex; align-items: center; gap: 4px;">
            <div style="width: 14px; height: 14px; background: #10b981; border-radius: 3px;"></div>
            <span style="color: #6b7280;">FULL</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
            <div style="width: 14px; height: 14px; background: #f59e0b; border-radius: 3px;"></div>
            <span style="color: #6b7280;">PARTIAL</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
            <div style="width: 14px; height: 14px; background: #3b82f6; border-radius: 3px;"></div>
            <span style="color: #6b7280;">CUSTOM</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
            <div style="width: 14px; height: 14px; background: #ef4444; border-radius: 3px;"></div>
            <span style="color: #6b7280;">LOST</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
            <div style="width: 14px; height: 14px; background: #f97316; border-radius: 3px;"></div>
            <span style="color: #6b7280;">POTENTIAL</span>
        </span>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// L1 SERVICE GROUP (ACCORDION)
// ═══════════════════════════════════════════════════════════════════

function renderL1ServiceGroup(l1Group, heatmap, isFirstExpanded = false) {
    const groupId = `l1-group-${l1Group.l1Id}`;
    
    return `
        <div class="accordion-item" data-l1-id="${l1Group.l1Id}" style="margin-bottom: 12px;">
            <div class="accordion-header" onclick="toggleAccordion('${groupId}')">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <i class="fas fa-chevron-down accordion-icon" id="${groupId}-icon"></i>
                    <div>
                        <strong style="font-size: 14px; color: #111827;">${l1Group.l1Name}</strong>
                        <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">(${l1Group.hlServices.length} services)</span>
                    </div>
                </div>
            </div>
            <div class="accordion-content ${isFirstExpanded ? 'active' : ''}" id="${groupId}">
                <table class="heatmap-table" style="width: 100%; margin-top: 12px;">
                    <thead>
                        <tr>
                            <th style="width: 40%;">Service Name</th>
                            <th style="width: 15%; text-align: center;">Assessment</th>
                            <th style="width: 12%; text-align: center;">Score</th>
                            <th style="width: 18%; text-align: center;">APQC Mapped</th>
                            <th style="width: 15%; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${l1Group.hlServices.map(l2Service => renderL2ServiceRow(l2Service, heatmap)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// L2 SERVICE ROW
// ═══════════════════════════════════════════════════════════════════

function renderL2ServiceRow(l2Service, heatmap) {
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2Service.id);
    
    if (!assessment) {
        // Service not yet assessed
        return `
            <tr data-service-id="${l2Service.id}" 
                data-service-name="${l2Service.name}" 
                data-assessment-state="NOT_ASSESSED" 
                data-l1-area="${l2Service.l1ParentName}" 
                data-score="0" 
                data-has-gaps="false" 
                data-has-opportunities="false">
                <td>${l2Service.name}</td>
                <td style="text-align: center;">
                    <span class="badge badge-draft">Not Assessed</span>
                </td>
                <td style="text-align: center;">-</td>
                <td style="text-align: center;">-</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-primary" onclick="assessService('${heatmap.id}', '${l2Service.id}')">
                        <i class="fas fa-plus"></i> Assess
                    </button>
                </td>
            </tr>
        `;
    }
    
    const stateClass = getStateClass(assessment.assessmentState);
    const stateColor = getStateColor(assessment.assessmentState);
    const apqcCount = assessment.apqcMappedCapabilities ? assessment.apqcMappedCapabilities.length : 0;
    const hasGaps = assessment.assessmentState === 'PARTIAL' || assessment.assessmentState === 'LOST' || (assessment.score || 0) < 75;
    const hasOpportunities = heatmap.opportunities?.some(opp => opp.l2ServiceId === l2Service.id) || false;
    
    return `
        <tr onclick="openServiceDrilldown('${heatmap.id}', '${l2Service.id}')" 
            style="cursor: pointer;" 
            class="heatmap-row-hover"
            data-service-id="${l2Service.id}" 
            data-service-name="${l2Service.name}" 
            data-assessment-state="${assessment.assessmentState}" 
            data-l1-area="${l2Service.l1ParentName}" 
            data-score="${assessment.score || 0}" 
            data-has-gaps="${hasGaps}" 
            data-has-opportunities="${hasOpportunities}">
            <td>
                <strong>${l2Service.name}</strong>
                ${assessment.notes ? `<br><span style="font-size: 12px; color: #6b7280;">${truncateText(assessment.notes, 60)}</span>` : ''}
            </td>
            <td style="text-align: center;">
                <span class="badge ${stateClass}" style="background: ${stateColor};">
                    ${assessment.assessmentState}
                </span>
            </td>
            <td style="text-align: center;">
                ${typeof renderCoverageProgress === 'function' && assessment.score !== undefined 
                    ? renderCoverageProgress(assessment.score) 
                    : `<strong>${assessment.score !== undefined ? assessment.score + '%' : '-'}</strong>`
                }
            </td>
            <td style="text-align: center;">
                ${apqcCount > 0 
                    ? `<span class="badge badge-primary"><i class="fas fa-check"></i> ${apqcCount}</span>` 
                    : `<span class="badge badge-draft">None</span>`
                }
            </td>
            <td style="text-align: center;" onclick="event.stopPropagation();">
                <button class="btn btn-sm btn-ghost" onclick="openServiceDrilldown('${heatmap.id}', '${l2Service.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-ghost" onclick="assessService('${heatmap.id}', '${l2Service.id}')" title="Edit Assessment">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// OPPORTUNITIES SECTION
// ═══════════════════════════════════════════════════════════════════

function renderOpportunities(heatmap) {
    // Group opportunities by priority
    const critical = heatmap.opportunities.filter(o => o.priority === 'critical');
    const high = heatmap.opportunities.filter(o => o.priority === 'high');
    const medium = heatmap.opportunities.filter(o => o.priority === 'medium');
    const low = heatmap.opportunities.filter(o => o.priority === 'low');
    
    // Calculate total value
    const totalValue = heatmap.opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
    
    return `
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%); border-radius: 12px; padding: 24px; margin-top: 24px; border: 2px solid #fed7aa;">
            <!-- Header with Stats -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <h4 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                        <i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i>
                        Identified Opportunities
                    </h4>
                    <div style="display: flex; gap: 20px; margin-top: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                            <span style="font-size: 13px; color: #6b7280;"><strong>${critical.length}</strong> Critical</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></div>
                            <span style="font-size: 13px; color: #6b7280;"><strong>${high.length}</strong> High</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
                            <span style="font-size: 13px; color: #6b7280;"><strong>${medium.length}</strong> Medium</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 8px; height: 8px; background: #6b7280; border-radius: 50%;"></div>
                            <span style="font-size: 13px; color: #6b7280;"><strong>${low.length}</strong> Low</span>
                        </div>
                        <div style="margin-left: 12px; padding-left: 20px; border-left: 2px solid #e5e7eb;">
                            <span style="font-size: 13px; color: #6b7280;">Total Value: </span>
                            <strong style="font-size: 16px; color: #065f46;">${formatCurrency(totalValue)}</strong>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="addOpportunity('${heatmap.id}')">
                    <i class="fas fa-plus"></i> Add Opportunity
                </button>
            </div>
            
            <!-- Opportunities Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;">
                ${heatmap.opportunities.map(opp => renderOpportunityCard(opp, heatmap)).join('')}
            </div>
        </div>
    `;
}

function renderOpportunityCard(opp, heatmap) {
    const l2Service = window.vivictaServiceLoader.getHLServiceById(opp.l2ServiceId);
    
    // Priority styling
    const priorityStyles = {
        'critical': { 
            bg: '#fef2f2', 
            border: '#fca5a5', 
            badge: '#dc2626', 
            icon: 'exclamation-triangle',
            dotColor: '#ef4444'
        },
        'high': { 
            bg: '#fff7ed', 
            border: '#fed7aa', 
            badge: '#ea580c', 
            icon: 'arrow-up',
            dotColor: '#f59e0b'
        },
        'medium': { 
            bg: '#eff6ff', 
            border: '#bfdbfe', 
            badge: '#2563eb', 
            icon: 'minus',
            dotColor: '#3b82f6'
        },
        'low': { 
            bg: '#f9fafb', 
            border: '#e5e7eb', 
            badge: '#6b7280', 
            icon: 'arrow-down',
            dotColor: '#9ca3af'
        }
    };
    const style = priorityStyles[opp.priority || 'medium'];
    
    // Status styling
    const statusStyles = {
        'identified': { color: '#3b82f6', bg: '#dbeafe', label: 'Identified' },
        'evaluating': { color: '#f59e0b', bg: '#fef3c7', label: 'Evaluating' },
        'approved': { color: '#10b981', bg: '#d1fae5', label: 'Approved' },
        'in-progress': { color: '#8b5cf6', bg: '#ede9fe', label: 'In Progress' },
        'completed': { color: '#059669', bg: '#a7f3d0', label: 'Completed' },
        'on-hold': { color: '#dc2626', bg: '#fee2e2', label: 'On Hold' }
    };
    const statusStyle = statusStyles[opp.status || 'identified'];
    
    return `
        <div 
            class="opportunity-card"
            style="
                background: white;
                border: 2px solid ${style.border};
                border-left: 5px solid ${style.badge};
                border-radius: 10px;
                padding: 18px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            "
            onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';"
            onclick="editOpportunity('${heatmap.id}', '${opp.id}')"
        >
            <!-- Priority Badge -->
            <div style="position: absolute; top: 14px; right: 14px;">
                <span style="
                    background: ${style.badge};
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 12px;
                    letter-spacing: 0.5px;
                ">
                    <i class="fas fa-${style.icon}" style="margin-right: 4px;"></i>
                    ${opp.priority || 'medium'}
                </span>
            </div>
            
            <!-- Title -->
            <div style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 10px; padding-right: 90px; line-height: 1.4;">
                ${opp.title}
            </div>
            
            <!-- Description (if exists) -->
            ${opp.description ? `
                <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px; line-height: 1.5;">
                    ${truncateText(opp.description, 100)}
                </div>
            ` : ''}
            
            <!-- Service Tag -->
            ${l2Service ? `
                <div style="margin-bottom: 12px;">
                    <span style="
                        background: #f0fdf4;
                        color: #065f46;
                        font-size: 11px;
                        font-weight: 600;
                        padding: 4px 10px;
                        border-radius: 6px;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        <i class="fas fa-cubes" style="font-size: 10px;"></i>
                        ${l2Service.name}
                    </span>
                </div>
            ` : ''}
            
            <!-- Value & Status Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
                <!-- Value -->
                <div>
                    ${opp.estimatedValue ? `
                        <div style="display: flex; align-items: baseline; gap: 4px;">
                            <i class="fas fa-dollar-sign" style="font-size: 11px; color: #10b981;"></i>
                            <span style="font-size: 18px; font-weight: 700; color: #065f46;">
                                ${formatCurrency(opp.estimatedValue)}
                            </span>
                        </div>
                        <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
                            Estimated Value
                        </div>
                    ` : `
                        <div style="font-size: 12px; color: #9ca3af;">
                            Value not estimated
                        </div>
                    `}
                </div>
                
                <!-- Status Badge -->
                <div style="
                    background: ${statusStyle.bg};
                    color: ${statusStyle.color};
                    font-size: 11px;
                    font-weight: 600;
                    padding: 6px 12px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    <div style="width: 6px; height: 6px; background: ${statusStyle.color}; border-radius: 50%;"></div>
                    ${statusStyle.label}
                </div>
            </div>
            
            <!-- Target Date (if exists) -->
            ${opp.targetDate ? `
                <div style="margin-top: 10px; font-size: 11px; color: #6b7280; display: flex; align-items: center; gap: 6px;">
                    <i class="fas fa-calendar" style="opacity: 0.5;"></i>
                    Target: ${formatDate(opp.targetDate)}
                </div>
            ` : ''}
            
            <!-- Actions (on hover) -->
            <div 
                class="opportunity-actions"
                style="
                    position: absolute;
                    bottom: 14px;
                    right: 14px;
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.2s;
                "
                onclick="event.stopPropagation();"
            >
                <button 
                    class="btn btn-sm btn-ghost" 
                    onclick="editOpportunity('${heatmap.id}', '${opp.id}')"
                    title="Edit"
                    style="padding: 6px 10px; background: white; border: 1px solid #e5e7eb;">
                    <i class="fas fa-edit"></i>
                </button>
                <button 
                    class="btn btn-sm btn-ghost" 
                    onclick="deleteOpportunity('${heatmap.id}', '${opp.id}')"
                    title="Delete"
                    style="padding: 6px 10px; background: white; border: 1px solid #e5e7eb; color: #ef4444;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <style>
            .opportunity-card:hover .opportunity-actions {
                opacity: 1 !important;
            }
        </style>
    `;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM BUSINESS AREAS
// ═══════════════════════════════════════════════════════════════════

function renderCustomBusinessAreas(heatmap) {
    return `
        <div style="background: white; border-radius: 12px; padding: 24px; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #111827;">
                    <i class="fas fa-sitemap" style="color: #3b82f6; margin-right: 8px;"></i>
                    Custom Business Areas (${heatmap.customBusinessAreas.length})
                </h4>
                <button class="btn btn-primary btn-sm" onclick="addCustomBusinessArea('${heatmap.id}')">
                    <i class="fas fa-plus"></i> Add Business Area
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                ${heatmap.customBusinessAreas.map(area => `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <strong style="font-size: 14px; color: #111827;">${area.name}</strong>
                            <div>
                                <button class="btn btn-sm btn-ghost" onclick="editCustomBusinessArea('${heatmap.id}', '${area.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-ghost" onclick="deleteCustomBusinessArea('${heatmap.id}', '${area.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        ${area.description ? `<p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${area.description}</p>` : ''}
                        <div style="font-size: 12px; color: #6b7280;">
                            <div><strong>Linked Services:</strong> ${area.linkedL2Services ? area.linkedL2Services.length : 0}</div>
                            <div><strong>APQC Capabilities:</strong> ${area.apqcCapabilities ? area.apqcCapabilities.length : 0}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function getStateClass(state) {
    const stateMap = {
        'FULL': 'badge-success',
        'PARTIAL': 'badge-warning',
        'CUSTOM': 'badge-primary',
        'LOST': 'badge-high',
        'POTENTIAL': 'badge-medium'
    };
    return stateMap[state] || 'badge-draft';
}

function getStateColor(state) {
    const colorMap = {
        'FULL': '#10b981',
        'PARTIAL': '#f59e0b',
        'CUSTOM': '#3b82f6',
        'LOST': '#ef4444',
        'POTENTIAL': '#f97316'
    };
    return colorMap[state] || '#9ca3af';
}

function getStatusBadge(status) {
    const badgeMap = {
        'identified': 'draft',
        'qualified': 'warning',
        'pitched': 'primary',
        'won': 'success',
        'lost': 'high'
    };
    return badgeMap[status] || 'draft';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ═══════════════════════════════════════════════════════════════════
// ACCORDION INTERACTION
// ═══════════════════════════════════════════════════════════════════

function initializeAccordions() {
    // Expand first accordion by default
    const firstContent = document.querySelector('.accordion-content.active');
    if (firstContent) {
        firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
        const firstIcon = document.querySelector('.accordion-icon');
        if (firstIcon) firstIcon.style.transform = 'rotate(180deg)';
    }
}

function toggleAccordion(groupId) {
    const content = document.getElementById(groupId);
    const icon = document.getElementById(`${groupId}-icon`);
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        content.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}
