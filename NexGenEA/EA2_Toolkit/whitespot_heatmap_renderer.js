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
    
    // Get customers and heatmaps for current engagement
    const customers = engagementManager.getEntities('customers') || [];
    const heatmaps = engagementManager.getEntities('whiteSpotHeatmaps') || [];
    
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
                WhiteSpot Heatmap requires at least one customer. Go to Engagement Setup to add a customer.
            </div>
            <button class="btn btn-primary" onclick="switchTab('engagement', document.querySelector('[data-tab=engagement]'))" style="margin-top: 16px;">
                <i class="fas fa-arrow-left"></i> Go to Engagement Setup
            </button>
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
    return `
        <div style="background: white; border-radius: 12px; padding: 24px; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #111827;">
                    <i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i>
                    Identified Opportunities (${heatmap.opportunities.length})
                </h4>
                <button class="btn btn-primary btn-sm" onclick="addOpportunity('${heatmap.id}')">
                    <i class="fas fa-plus"></i> Add Opportunity
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Service</th>
                        <th>Value</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${heatmap.opportunities.map(opp => {
                        const l2Service = window.vivictaServiceLoader.getHLServiceById(opp.l2ServiceId);
                        return `
                            <tr>
                                <td><strong>${opp.title}</strong></td>
                                <td>${l2Service ? l2Service.name : opp.l2ServiceId}</td>
                                <td>${opp.estimatedValue ? formatCurrency(opp.estimatedValue) : '-'}</td>
                                <td><span class="badge badge-${opp.priority || 'medium'}">${opp.priority || 'medium'}</span></td>
                                <td><span class="badge badge-${getStatusBadge(opp.status)}">${opp.status || 'identified'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-ghost" onclick="editOpportunity('${heatmap.id}', '${opp.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-ghost" onclick="deleteOpportunity('${heatmap.id}', '${opp.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
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
