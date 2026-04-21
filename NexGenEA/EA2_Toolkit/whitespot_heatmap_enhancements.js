/**
 * whitespot_heatmap_enhancements.js
 * Phase 4: Enhanced Features & Analytics for WhiteSpot Heatmap
 * - Filtering and search
 * - Bulk operations
 * - Analytics dashboard
 * - Enhanced visualizations
 * - Print and advanced export
 * 
 * @version 1.0
 * @date 2026-04-20
 */

// ═══════════════════════════════════════════════════════════════════
// FILTERING AND SEARCH
// ═══════════════════════════════════════════════════════════════════

// Global filter state
window.whiteSpotFilters = {
    searchText: '',
    assessmentState: 'ALL',
    l1ServiceArea: 'ALL',
    scoreRange: [0, 100],
    showOnlyWithGaps: false,
    showOnlyWithOpportunities: false
};

/**
 * Render filter controls
 */
function renderFilterControls(heatmap) {
    const l1Groups = window.vivictaServiceLoader.getHLServicesGrouped();
    
    return `
        <div class="filter-bar" style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 12px; align-items: end;">
                <!-- Search -->
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 6px;">
                        Search Services
                    </label>
                    <input 
                        type="text" 
                        id="filter-search" 
                        placeholder="Search by name..."
                        value="${window.whiteSpotFilters.searchText}"
                        oninput="applyFilters()"
                        class="form-input"
                        style="width: 100%;"
                    >
                </div>
                
                <!-- Assessment State -->
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 6px;">
                        Assessment State
                    </label>
                    <select id="filter-state" onchange="applyFilters()" class="form-input" style="width: 100%;">
                        <option value="ALL" ${window.whiteSpotFilters.assessmentState === 'ALL' ? 'selected' : ''}>All States</option>
                        <option value="FULL" ${window.whiteSpotFilters.assessmentState === 'FULL' ? 'selected' : ''}>✓ FULL</option>
                        <option value="PARTIAL" ${window.whiteSpotFilters.assessmentState === 'PARTIAL' ? 'selected' : ''}>⚠ PARTIAL</option>
                        <option value="CUSTOM" ${window.whiteSpotFilters.assessmentState === 'CUSTOM' ? 'selected' : ''}>⚙ CUSTOM</option>
                        <option value="LOST" ${window.whiteSpotFilters.assessmentState === 'LOST' ? 'selected' : ''}>✗ LOST</option>
                        <option value="POTENTIAL" ${window.whiteSpotFilters.assessmentState === 'POTENTIAL' ? 'selected' : ''}>⭐ POTENTIAL</option>
                    </select>
                </div>
                
                <!-- L1 Service Area -->
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 6px;">
                        Service Area
                    </label>
                    <select id="filter-l1" onchange="applyFilters()" class="form-input" style="width: 100%;">
                        <option value="ALL" ${window.whiteSpotFilters.l1ServiceArea === 'ALL' ? 'selected' : ''}>All Areas</option>
                        ${l1Groups.map(group => `
                            <option value="${group.l1Name}" ${window.whiteSpotFilters.l1ServiceArea === group.l1Name ? 'selected' : ''}>
                                ${group.l1Name} (${group.hlServices.length})
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Score Range -->
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 6px;">
                        Score Range: ${window.whiteSpotFilters.scoreRange[0]}%-${window.whiteSpotFilters.scoreRange[1]}%
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input 
                            type="range" 
                            id="filter-score-min" 
                            min="0" 
                            max="100" 
                            value="${window.whiteSpotFilters.scoreRange[0]}"
                            oninput="updateScoreRange()"
                            style="flex: 1;"
                        >
                        <input 
                            type="range" 
                            id="filter-score-max" 
                            min="0" 
                            max="100" 
                            value="${window.whiteSpotFilters.scoreRange[1]}"
                            oninput="updateScoreRange()"
                            style="flex: 1;"
                        >
                    </div>
                </div>
                
                <!-- Quick Filters -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                        Quick Filters
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #374151; cursor: pointer;">
                        <input 
                            type="checkbox" 
                            id="filter-gaps"
                            ${window.whiteSpotFilters.showOnlyWithGaps ? 'checked' : ''}
                            onchange="applyFilters()"
                        >
                        <span>Gaps Only</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #374151; cursor: pointer;">
                        <input 
                            type="checkbox" 
                            id="filter-opportunities"
                            ${window.whiteSpotFilters.showOnlyWithOpportunities ? 'checked' : ''}
                            onchange="applyFilters()"
                        >
                        <span>Has Opportunities</span>
                    </label>
                </div>
            </div>
            
            <!-- Active Filters Summary -->
            <div id="active-filters-summary" style="margin-top: 12px; display: none;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    <span style="font-size: 11px; font-weight: 600; color: #6b7280;">ACTIVE FILTERS:</span>
                    <div id="filter-tags"></div>
                    <button class="btn btn-ghost btn-sm" onclick="clearAllFilters()" style="margin-left: auto;">
                        <i class="fas fa-times"></i> Clear All
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update score range filter
 */
function updateScoreRange() {
    const min = parseInt(document.getElementById('filter-score-min').value);
    const max = parseInt(document.getElementById('filter-score-max').value);
    
    // Ensure min <= max
    if (min > max) {
        document.getElementById('filter-score-min').value = max;
        window.whiteSpotFilters.scoreRange = [max, max];
    } else {
        window.whiteSpotFilters.scoreRange = [min, max];
    }
    
    applyFilters();
}

/**
 * Apply all filters to heatmap
 */
function applyFilters() {
    // Update filter state from UI
    window.whiteSpotFilters.searchText = document.getElementById('filter-search')?.value.toLowerCase() || '';
    window.whiteSpotFilters.assessmentState = document.getElementById('filter-state')?.value || 'ALL';
    window.whiteSpotFilters.l1ServiceArea = document.getElementById('filter-l1')?.value || 'ALL';
    window.whiteSpotFilters.showOnlyWithGaps = document.getElementById('filter-gaps')?.checked || false;
    window.whiteSpotFilters.showOnlyWithOpportunities = document.getElementById('filter-opportunities')?.checked || false;
    
    // Show/hide accordion groups and rows based on filters
    const accordionGroups = document.querySelectorAll('.accordion-item');
    let visibleCount = 0;
    
    accordionGroups.forEach(group => {
        const groupId = group.getAttribute('data-l1-id');
        const rows = group.querySelectorAll('[data-service-id]');
        let visibleInGroup = 0;
        
        rows.forEach(row => {
            if (matchesFilters(row)) {
                row.style.display = '';
                visibleInGroup++;
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Hide entire group if no visible rows
        if (visibleInGroup === 0) {
            group.style.display = 'none';
        } else {
            group.style.display = '';
        }
    });
    
    // Update active filters summary
    updateFilterSummary(visibleCount);
}

/**
 * Check if a service row matches current filters
 */
function matchesFilters(row) {
    const serviceName = row.getAttribute('data-service-name')?.toLowerCase() || '';
    const assessmentState = row.getAttribute('data-assessment-state') || '';
    const l1Area = row.getAttribute('data-l1-area') || '';
    const score = parseInt(row.getAttribute('data-score')) || 0;
    const hasGaps = row.getAttribute('data-has-gaps') === 'true';
    const hasOpportunities = row.getAttribute('data-has-opportunities') === 'true';
    
    // Search filter
    if (window.whiteSpotFilters.searchText && !serviceName.includes(window.whiteSpotFilters.searchText)) {
        return false;
    }
    
    // Assessment state filter
    if (window.whiteSpotFilters.assessmentState !== 'ALL' && assessmentState !== window.whiteSpotFilters.assessmentState) {
        return false;
    }
    
    // L1 service area filter
    if (window.whiteSpotFilters.l1ServiceArea !== 'ALL' && l1Area !== window.whiteSpotFilters.l1ServiceArea) {
        return false;
    }
    
    // Score range filter
    if (score < window.whiteSpotFilters.scoreRange[0] || score > window.whiteSpotFilters.scoreRange[1]) {
        return false;
    }
    
    // Gaps only filter
    if (window.whiteSpotFilters.showOnlyWithGaps && !hasGaps) {
        return false;
    }
    
    // Opportunities filter
    if (window.whiteSpotFilters.showOnlyWithOpportunities && !hasOpportunities) {
        return false;
    }
    
    return true;
}

/**
 * Update filter summary display
 */
function updateFilterSummary(visibleCount) {
    const summaryDiv = document.getElementById('active-filters-summary');
    const tagsDiv = document.getElementById('filter-tags');
    
    if (!summaryDiv || !tagsDiv) return;
    
    const tags = [];
    
    if (window.whiteSpotFilters.searchText) {
        tags.push(`Search: "${window.whiteSpotFilters.searchText}"`);
    }
    if (window.whiteSpotFilters.assessmentState !== 'ALL') {
        tags.push(`State: ${window.whiteSpotFilters.assessmentState}`);
    }
    if (window.whiteSpotFilters.l1ServiceArea !== 'ALL') {
        tags.push(`Area: ${window.whiteSpotFilters.l1ServiceArea}`);
    }
    if (window.whiteSpotFilters.scoreRange[0] > 0 || window.whiteSpotFilters.scoreRange[1] < 100) {
        tags.push(`Score: ${window.whiteSpotFilters.scoreRange[0]}-${window.whiteSpotFilters.scoreRange[1]}%`);
    }
    if (window.whiteSpotFilters.showOnlyWithGaps) {
        tags.push('Gaps Only');
    }
    if (window.whiteSpotFilters.showOnlyWithOpportunities) {
        tags.push('Has Opportunities');
    }
    
    if (tags.length > 0) {
        tagsDiv.innerHTML = tags.map(tag => `
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                ${tag}
            </span>
        `).join('');
        summaryDiv.style.display = 'block';
    } else {
        summaryDiv.style.display = 'none';
    }
    
    // Update visible count in summary
    const totalServices = document.querySelectorAll('[data-service-id]').length;
    tagsDiv.insertAdjacentHTML('beforeend', `
        <span style="color: #6b7280; font-size: 11px; margin-left: 12px;">
            Showing <strong>${visibleCount}</strong> of <strong>${totalServices}</strong> services
        </span>
    `);
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    window.whiteSpotFilters = {
        searchText: '',
        assessmentState: 'ALL',
        l1ServiceArea: 'ALL',
        scoreRange: [0, 100],
        showOnlyWithGaps: false,
        showOnlyWithOpportunities: false
    };
    
    // Reset UI
    if (document.getElementById('filter-search')) document.getElementById('filter-search').value = '';
    if (document.getElementById('filter-state')) document.getElementById('filter-state').value = 'ALL';
    if (document.getElementById('filter-l1')) document.getElementById('filter-l1').value = 'ALL';
    if (document.getElementById('filter-score-min')) document.getElementById('filter-score-min').value = 0;
    if (document.getElementById('filter-score-max')) document.getElementById('filter-score-max').value = 100;
    if (document.getElementById('filter-gaps')) document.getElementById('filter-gaps').checked = false;
    if (document.getElementById('filter-opportunities')) document.getElementById('filter-opportunities').checked = false;
    
    applyFilters();
}

// ═══════════════════════════════════════════════════════════════════
// BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Render bulk operations toolbar
 */
function renderBulkOperationsToolbar(heatmap) {
    return `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-tasks" style="color: #065f46; font-size: 16px;"></i>
                    <span style="font-weight: 600; color: #065f46; font-size: 13px;">Bulk Operations</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-secondary" onclick="bulkSetState('${heatmap.id}', 'FULL')">
                        <i class="fas fa-check-circle"></i> Mark as FULL
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="bulkSetState('${heatmap.id}', 'PARTIAL')">
                        <i class="fas fa-exclamation-circle"></i> Mark as PARTIAL
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="bulkSetState('${heatmap.id}', 'POTENTIAL')">
                        <i class="fas fa-star"></i> Mark as POTENTIAL
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="bulkGenerateAPQC('${heatmap.id}')">
                        <i class="fas fa-magic"></i> Generate APQC for All
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="bulkExportOpportunities('${heatmap.id}')">
                        <i class="fas fa-download"></i> Export Opportunities
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Bulk update assessment state for filtered services
 */
function bulkSetState(heatmapId, targetState) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    // Get visible (filtered) service rows
    const visibleRows = Array.from(document.querySelectorAll('[data-service-id]')).filter(row => row.style.display !== 'none');
    const visibleServiceIds = visibleRows.map(row => row.getAttribute('data-service-id'));
    
    if (visibleServiceIds.length === 0) {
        showNotification('No services match current filters', 'warning');
        return;
    }
    
    const confirmMsg = `Update ${visibleServiceIds.length} service(s) to "${targetState}" state?`;
    if (!confirm(confirmMsg)) return;
    
    let updated = 0;
    visibleServiceIds.forEach(serviceId => {
        const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === serviceId);
        if (assessment) {
            assessment.assessmentState = targetState;
            updated++;
        }
    });
    
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    showNotification(`${updated} service(s) updated to ${targetState}`, 'success');
    renderWhiteSpotHeatmap();
}

/**
 * Bulk generate APQC mappings for all filtered services
 */
async function bulkGenerateAPQC(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    const visibleRows = Array.from(document.querySelectorAll('[data-service-id]')).filter(row => row.style.display !== 'none');
    const visibleServiceIds = visibleRows.map(row => row.getAttribute('data-service-id'));
    
    if (visibleServiceIds.length === 0) {
        showNotification('No services match current filters', 'warning');
        return;
    }
    
    const confirmMsg = `Generate AI-powered APQC mappings for ${visibleServiceIds.length} service(s)?\n\nThis may take a few moments.`;
    if (!confirm(confirmMsg)) return;
    
    showNotification('Generating APQC mappings...', 'info');
    
    let totalMappings = 0;
    for (const serviceId of visibleServiceIds) {
        const l2Service = window.vivictaServiceLoader.getHLServiceById(serviceId);
        const l3Components = window.vivictaServiceLoader.getDLComponentsForService(serviceId);
        const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === serviceId);
        
        if (!assessment) continue;
        
        try {
            const suggestions = await window.apqcWhiteSpotIntegration.generateMappingSuggestions(
                l2Service,
                l3Components,
                { minConfidence: 0.7, maxSuggestions: 5, preferredLevels: [3, 4] }
            );
            
            // Auto-apply high-confidence suggestions
            suggestions.forEach(suggestion => {
                if (suggestion.confidence >= 0.7 && !assessment.apqcMappedCapabilities.includes(suggestion.apqcId)) {
                    assessment.apqcMappedCapabilities.push(suggestion.apqcId);
                    totalMappings++;
                }
            });
        } catch (error) {
            console.error(`APQC generation failed for ${serviceId}:`, error);
        }
    }
    
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    showNotification(`Generated ${totalMappings} APQC mappings`, 'success');
    renderWhiteSpotHeatmap();
}

/**
 * Bulk export opportunities to CSV
 */
function bulkExportOpportunities(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap || !heatmap.opportunities || heatmap.opportunities.length === 0) {
        showNotification('No opportunities to export', 'warning');
        return;
    }
    
    // Build CSV
    const headers = ['ID', 'Title', 'Service', 'Description', 'Estimated Value', 'Priority', 'Status', 'Target Date', 'Owner', 'Notes'];
    const rows = heatmap.opportunities.map(opp => {
        const service = opp.l2ServiceId ? window.vivictaServiceLoader.getHLServiceById(opp.l2ServiceId) : null;
        return [
            opp.id,
            opp.title,
            service ? service.name : 'General',
            opp.description || '',
            opp.estimatedValue || 0,
            opp.priority || 'medium',
            opp.status || 'identified',
            opp.targetDate || '',
            opp.owner || '',
            opp.notes || ''
        ];
    });
    
    const csvContent = [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whitespot_opportunities_${heatmap.customerName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${heatmap.opportunities.length} opportunities`, 'success');
}

// ═══════════════════════════════════════════════════════════════════
// ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════

/**
 * Render analytics dashboard modal
 */
function showAnalyticsDashboard(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    const stats = calculateDetailedStats(heatmap);
    
    const modalContent = `
        <div style="padding: 20px; max-width: 1000px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="margin: 0;">Analytics Dashboard</h3>
                <button class="btn btn-ghost" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Summary Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 28px; font-weight: 700; color: #065f46;">${stats.totalServices}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #047857; text-transform: uppercase;">Total Services</div>
                </div>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af;">${stats.avgScore}%</div>
                    <div style="font-size: 11px; font-weight: 600; color: #1e40af; text-transform: uppercase;">Avg Coverage</div>
                </div>
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 28px; font-weight: 700; color: #92400e;">${stats.totalOpportunities}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #b45309; text-transform: uppercase;">Opportunities</div>
                </div>
                <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 28px; font-weight: 700; color: #4338ca;">${formatCurrency(stats.totalOpportunityValue)}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #4338ca; text-transform: uppercase;">Total Value</div>
                </div>
            </div>
            
            <!-- Charts Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                <!-- State Distribution Chart -->
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                    <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #111827;">State Distribution</h4>
                    ${renderStateDistributionChart(stats)}
                </div>
                
                <!-- L1 Service Area Coverage -->
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                    <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #111827;">Coverage by Service Area</h4>
                    ${renderL1CoverageChart(stats)}
                </div>
            </div>
            
            <!-- Top Opportunities -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #111827;">Top Opportunities by Value</h4>
                ${renderTopOpportunities(stats)}
            </div>
            
            <!-- Gap Analysis -->
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #111827;">Gap Analysis</h4>
                ${renderGapAnalysis(stats)}
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary" onclick="exportAnalyticsReport('${heatmapId}')">
                    <i class="fas fa-file-pdf"></i> Export Report
                </button>
                <button class="btn btn-primary" onclick="closeModal()">
                    <i class="fas fa-check"></i> Close
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent, 'large');
}

/**
 * Calculate detailed statistics
 */
function calculateDetailedStats(heatmap) {
    const stats = {
        totalServices: heatmap.hlAssessments.length,
        stateDistribution: { FULL: 0, PARTIAL: 0, CUSTOM: 0, LOST: 0, POTENTIAL: 0 },
        l1Coverage: {},
        avgScore: 0,
        totalOpportunities: heatmap.opportunities.length,
        totalOpportunityValue: 0,
        topOpportunities: [],
        gaps: []
    };
    
    let totalScore = 0;
    
    heatmap.hlAssessments.forEach(assessment => {
        // State distribution
        stats.stateDistribution[assessment.assessmentState]++;
        
        // Score average
        totalScore += assessment.score || 0;
        
        // L1 coverage
        if (!stats.l1Coverage[assessment.l1ServiceArea]) {
            stats.l1Coverage[assessment.l1ServiceArea] = { total: 0, scoreSum: 0, avg: 0 };
        }
        stats.l1Coverage[assessment.l1ServiceArea].total++;
        stats.l1Coverage[assessment.l1ServiceArea].scoreSum += assessment.score || 0;
        
        // Identify gaps
        if (assessment.assessmentState === 'PARTIAL' || assessment.assessmentState === 'LOST' || assessment.score < 50) {
            stats.gaps.push({
                serviceName: assessment.l2ServiceName,
                state: assessment.assessmentState,
                score: assessment.score || 0,
                opportunityValue: assessment.opportunityValue || 0
            });
        }
    });
    
    // Calculate averages
    stats.avgScore = stats.totalServices > 0 ? Math.round(totalScore / stats.totalServices) : 0;
    
    Object.keys(stats.l1Coverage).forEach(l1 => {
        stats.l1Coverage[l1].avg = Math.round(stats.l1Coverage[l1].scoreSum / stats.l1Coverage[l1].total);
    });
    
    // Sort gaps by opportunity value
    stats.gaps.sort((a, b) => b.opportunityValue - a.opportunityValue);
    
    // Calculate opportunity value
    heatmap.opportunities.forEach(opp => {
        stats.totalOpportunityValue += opp.estimatedValue || 0;
    });
    
    // Top opportunities
    stats.topOpportunities = [...heatmap.opportunities]
        .filter(opp => opp.estimatedValue > 0)
        .sort((a, b) => b.estimatedValue - a.estimatedValue)
        .slice(0, 5);
    
    return stats;
}

/**
 * Render state distribution chart (simple horizontal bars)
 */
function renderStateDistributionChart(stats) {
    const total = stats.totalServices;
    const stateColors = {
        FULL: '#10b981',
        PARTIAL: '#f59e0b',
        CUSTOM: '#3b82f6',
        LOST: '#ef4444',
        POTENTIAL: '#f97316'
    };
    
    return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${Object.entries(stats.stateDistribution).map(([state, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                            <span style="font-weight: 600; color: #374151;">${state}</span>
                            <span style="color: #6b7280;">${count} (${percentage}%)</span>
                        </div>
                        <div style="height: 24px; background: #f3f4f6; border-radius: 6px; overflow: hidden;">
                            <div style="height: 100%; background: ${stateColors[state]}; width: ${percentage}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render L1 coverage chart
 */
function renderL1CoverageChart(stats) {
    return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${Object.entries(stats.l1Coverage).map(([l1, data]) => {
                const percentage = data.avg;
                const color = percentage >= 75 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                            <span style="font-weight: 600; color: #374151;">${l1}</span>
                            <span style="color: #6b7280;">${data.avg}% (${data.total} services)</span>
                        </div>
                        <div style="height: 24px; background: #f3f4f6; border-radius: 6px; overflow: hidden;">
                            <div style="height: 100%; background: ${color}; width: ${percentage}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Render top opportunities table
 */
function renderTopOpportunities(stats) {
    if (stats.topOpportunities.length === 0) {
        return '<p style="color: #6b7280; font-size: 13px;">No opportunities identified yet</p>';
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style="text-align: right;">Value</th>
                </tr>
            </thead>
            <tbody>
                ${stats.topOpportunities.map(opp => `
                    <tr>
                        <td style="font-weight: 600;">${opp.title}</td>
                        <td><span class="badge badge-${opp.priority}">${opp.priority}</span></td>
                        <td><span class="badge badge-${getStatusBadge(opp.status)}">${opp.status}</span></td>
                        <td style="text-align: right; font-weight: 600; color: #065f46;">${formatCurrency(opp.estimatedValue)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Render gap analysis table
 */
function renderGapAnalysis(stats) {
    if (stats.gaps.length === 0) {
        return '<p style="color: #6b7280; font-size: 13px;">No significant gaps identified</p>';
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>State</th>
                    <th>Coverage</th>
                    <th style="text-align: right;">Opportunity Value</th>
                </tr>
            </thead>
            <tbody>
                ${stats.gaps.slice(0, 10).map(gap => `
                    <tr>
                        <td style="font-weight: 600;">${gap.serviceName}</td>
                        <td><span class="badge" style="background: ${getStateColor(gap.state)}; color: white;">${gap.state}</span></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; background: ${gap.score >= 75 ? '#10b981' : gap.score >= 40 ? '#f59e0b' : '#ef4444'}; width: ${gap.score}%;"></div>
                                </div>
                                <span style="font-size: 12px; color: #6b7280; min-width: 40px;">${gap.score}%</span>
                            </div>
                        </td>
                        <td style="text-align: right; font-weight: 600; color: #f59e0b;">${gap.opportunityValue > 0 ? formatCurrency(gap.opportunityValue) : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Export analytics report
 */
function exportAnalyticsReport(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    const stats = calculateDetailedStats(heatmap);
    
    // Generate comprehensive report in JSON format
    const report = {
        metadata: {
            customerId: heatmap.customerId,
            customerName: heatmap.customerName,
            assessmentDate: heatmap.assessmentDate,
            assessedBy: heatmap.assessedBy,
            generatedAt: new Date().toISOString()
        },
        summary: {
            totalServices: stats.totalServices,
            averageCoverage: stats.avgScore,
            totalOpportunities: stats.totalOpportunities,
            totalOpportunityValue: stats.totalOpportunityValue
        },
        stateDistribution: stats.stateDistribution,
        l1Coverage: stats.l1Coverage,
        topOpportunities: stats.topOpportunities,
        gaps: stats.gaps
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whitespot_analytics_${heatmap.customerName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Analytics report exported', 'success');
}

// ═══════════════════════════════════════════════════════════════════
// ENHANCED VISUALIZATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Render heatmap color legend
 */
function renderHeatmapLegend() {
    return `
        <div style="display: flex; align-items: center; gap: 20px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
            <span style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Legend:</span>
            ${[
                { state: 'FULL', icon: 'check-circle', label: 'Fully Delivered' },
                { state: 'PARTIAL', icon: 'exclamation-circle', label: 'Partial Gaps' },
                { state: 'CUSTOM', icon: 'cog', label: 'Custom Solution' },
                { state: 'LOST', icon: 'times-circle', label: 'Not Delivered' },
                { state: 'POTENTIAL', icon: 'star', label: 'Potential/Planned' }
            ].map(item => `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 12px; height: 12px; border-radius: 3px; background: ${getStateColor(item.state)};"></div>
                    <span style="font-size: 11px; color: #374151;">${item.label}</span>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Render coverage progress bar for a service
 */
function renderCoverageProgress(score) {
    const color = score >= 75 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    return `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: ${color}; width: ${score}%; transition: width 0.3s;"></div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: ${color}; min-width: 40px;">${score}%</span>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// PRINT AND EXPORT FEATURES
// ═══════════════════════════════════════════════════════════════════

/**
 * Print heatmap
 */
function printHeatmap(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    const stats = calculateHeatmapStats(heatmap);
    const customer = engagementManager.getEntity('customers', heatmap.customerId);
    
    // Create print-friendly HTML
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhiteSpot Heatmap - ${heatmap.customerName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { color: #111827; margin-bottom: 8px; }
                .meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
                .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; }
                .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                th { background: #f9fafb; font-weight: 600; font-size: 12px; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <h1>WhiteSpot Heatmap: ${heatmap.customerName}</h1>
            <div class="meta">
                Assessment Date: ${heatmap.assessmentDate} | Assessed By: ${heatmap.assessedBy}
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.fullCount}</div>
                    <div class="stat-label">Full</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.partialCount}</div>
                    <div class="stat-label">Partial</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.customCount}</div>
                    <div class="stat-label">Custom</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.lostCount}</div>
                    <div class="stat-label">Lost</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.potentialCount}</div>
                    <div class="stat-label">Potential</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalCount}</div>
                    <div class="stat-label">Total</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Service Area</th>
                        <th>State</th>
                        <th>Score</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${heatmap.hlAssessments.map(assessment => `
                        <tr>
                            <td>${assessment.l2ServiceName}</td>
                            <td>${assessment.l1ServiceArea}</td>
                            <td><span class="badge">${assessment.assessmentState}</span></td>
                            <td>${assessment.score}%</td>
                            <td>${assessment.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    // Open in new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

/**
 * Export heatmap to Excel-compatible CSV
 */
function exportHeatmapCSV(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    // Build CSV with detailed data
    const headers = [
        'Service Name', 'Service Area', 'Assessment State', 'Coverage Score %',
        'L3 Components Delivered', 'L3 Components Total', 'APQC Capabilities Mapped',
        'Opportunity Value', 'Notes'
    ];
    
    const rows = heatmap.hlAssessments.map(assessment => {
        const l3Total = window.vivictaServiceLoader.getDLComponentsForService(assessment.l2ServiceId).length;
        const l3Delivered = assessment.l3Components.filter(c => c.isDelivered).length;
        
        return [
            assessment.l2ServiceName,
            assessment.l1ServiceArea,
            assessment.assessmentState,
            assessment.score || 0,
            l3Delivered,
            l3Total,
            assessment.apqcMappedCapabilities.length,
            assessment.opportunityValue || 0,
            (assessment.notes || '').replace(/"/g, '""')
        ];
    });
    
    const csvContent = [headers, ...rows].map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whitespot_heatmap_${heatmap.customerName}_${heatmap.assessmentDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Heatmap exported to CSV', 'success');
}
