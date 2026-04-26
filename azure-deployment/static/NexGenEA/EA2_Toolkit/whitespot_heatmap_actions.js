/**
 * whitespot_heatmap_actions.js
 * Action handlers for WhiteSpot Heatmap user interactions
 * Handles CRUD operations, modals, and state management
 * 
 * @version 1.0
 * @date 2026-04-20
 */

// Global state for current customer selection
window.currentWhiteSpotCustomer = null;

// ═══════════════════════════════════════════════════════════════════
// CUSTOMER SWITCHING
// ═══════════════════════════════════════════════════════════════════

function switchWhiteSpotCustomer(customerId) {
    window.currentWhiteSpotCustomer = customerId;
    renderWhiteSpotHeatmap();
}

// ═══════════════════════════════════════════════════════════════════
// HEATMAP CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create new WhiteSpot Heatmap for a customer
 */
function createNewHeatmap(customerId) {
    const customer = engagementManager.getEntity('customers', customerId);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    // Get all HL services from Vivicta model
    const hlServices = window.vivictaServiceLoader.getHLServices();
    
    // Generate new heatmap ID
    const existingHeatmaps = engagementManager.getEntities('whiteSpotHeatmaps') || [];
    const nextId = `WSH-${String(existingHeatmaps.length + 1).padStart(3, '0')}`;
    
    // Create heatmap with empty assessments
    const newHeatmap = {
        id: nextId,
        customerId: customer.id,
        customerName: customer.name,
        assessmentDate: new Date().toISOString().split('T')[0],
        assessedBy: 'Current User', // TODO: Get from auth context
        hlAssessments: hlServices.map(service => ({
            l2ServiceId: service.id,
            l2ServiceName: service.name,
            l1ServiceArea: service.l1ParentName,
            assessmentState: 'POTENTIAL', // Default to POTENTIAL for new assessments
            l3Components: [],
            score: 0,
            apqcMappedCapabilities: [],
            opportunityValue: 0,
            notes: ''
        })),
        opportunities: [],
        customBusinessAreas: [],
        apqcMappings: [],
        description: '',
        comments: '',
        metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'Current User',
            version: '1.0'
        }
    };
    
    // Save to engagement
    engagementManager.addEntity('whiteSpotHeatmaps', newHeatmap);
    
    showNotification(`WhiteSpot Heatmap created for ${customer.name}`, 'success');
    renderWhiteSpotHeatmap();
}

/**
 * Edit heatmap metadata (description, comments, assessment date)
 */
function editHeatmapInfo(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    // Build modal content
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px;">Edit Heatmap Information</h3>
            
            <div class="form-group">
                <label>Assessment Date</label>
                <input type="date" id="edit-assessment-date" value="${heatmap.assessmentDate}" class="form-input">
            </div>
            
            <div class="form-group">
                <label>Assessed By</label>
                <input type="text" id="edit-assessed-by" value="${heatmap.assessedBy}" class="form-input">
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea id="edit-description" class="form-input" rows="3">${heatmap.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Comments</label>
                <textarea id="edit-comments" class="form-input" rows="3">${heatmap.comments || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveHeatmapInfo('${heatmapId}')">Save Changes</button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function saveHeatmapInfo(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    heatmap.assessmentDate = document.getElementById('edit-assessment-date').value;
    heatmap.assessedBy = document.getElementById('edit-assessed-by').value;
    heatmap.description = document.getElementById('edit-description').value;
    heatmap.comments = document.getElementById('edit-comments').value;
    heatmap.metadata.updatedAt = new Date().toISOString();
    
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    closeModal();
    showNotification('Heatmap information updated', 'success');
    renderWhiteSpotHeatmap();
}

/**
 * Export heatmap to JSON
 */
function exportHeatmap(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    const dataStr = JSON.stringify(heatmap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whitespot_heatmap_${heatmap.customerName}_${heatmap.assessmentDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Heatmap exported successfully', 'success');
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE ASSESSMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Open assessment modal for L2 service
 */
function assessService(heatmapId, l2ServiceId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const l2Service = window.vivictaServiceLoader.getHLServiceById(l2ServiceId);
    
    if (!heatmap || !l2Service) {
        showNotification('Service or heatmap not found', 'error');
        return;
    }
    
    // Get existing assessment or create new
    let assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    if (!assessment) {
        assessment = {
            l2ServiceId: l2Service.id,
            l2ServiceName: l2Service.name,
            l1ServiceArea: l2Service.l1ParentName,
            assessmentState: 'POTENTIAL',
            l3Components: [],
            score: 0,
            apqcMappedCapabilities: [],
            opportunityValue: 0,
            notes: ''
        };
        heatmap.hlAssessments.push(assessment);
    }
    
    // Build modal content
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin-bottom: 8px;">${l2Service.name}</h3>
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">Service Area: ${l2Service.l1ParentName}</p>
            
            <div class="form-group">
                <label>Assessment State *</label>
                <select id="assess-state" class="form-input">
                    <option value="FULL" ${assessment.assessmentState === 'FULL' ? 'selected' : ''}>FULL - All components delivered</option>
                    <option value="PARTIAL" ${assessment.assessmentState === 'PARTIAL' ? 'selected' : ''}>PARTIAL - Some gaps exist</option>
                    <option value="CUSTOM" ${assessment.assessmentState === 'CUSTOM' ? 'selected' : ''}>CUSTOM - Bespoke solution</option>
                    <option value="LOST" ${assessment.assessmentState === 'LOST' ? 'selected' : ''}>LOST - Not delivered</option>
                    <option value="POTENTIAL" ${assessment.assessmentState === 'POTENTIAL' ? 'selected' : ''}>POTENTIAL - Planned/High-value opportunity</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Delivery Score (0-100%)</label>
                <input type="number" id="assess-score" min="0" max="100" value="${assessment.score || 0}" class="form-input">
                <small style="color: #6b7280;">Percentage of L3 components delivered</small>
            </div>
            
            <div class="form-group">
                <label>Opportunity Value ($)</label>
                <input type="number" id="assess-value" min="0" value="${assessment.opportunityValue || 0}" class="form-input">
                <small style="color: #6b7280;">For PARTIAL/POTENTIAL/LOST states</small>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea id="assess-notes" class="form-input" rows="3">${assessment.notes || ''}</textarea>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 16px;">
                <p style="font-size: 13px; color: #065f46; margin-bottom: 8px;">
                    <i class="fas fa-info-circle"></i> <strong>Next Steps:</strong>
                </p>
                <ul style="font-size: 12px; color: #047857; margin-left: 20px; line-height: 1.6;">
                    <li>After basic assessment, drill down to L3 components</li>
                    <li>Map to APQC capabilities for business alignment</li>
                    <li>Link to opportunities in the opportunity tracker</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveServiceAssessment('${heatmapId}', '${l2ServiceId}')">
                    Save Assessment
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function saveServiceAssessment(heatmapId, l2ServiceId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    let assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    if (!assessment) {
        const l2Service = window.vivictaServiceLoader.getHLServiceById(l2ServiceId);
        assessment = {
            l2ServiceId: l2Service.id,
            l2ServiceName: l2Service.name,
            l1ServiceArea: l2Service.l1ParentName,
            l3Components: [],
            apqcMappedCapabilities: []
        };
        heatmap.hlAssessments.push(assessment);
    }
    
    assessment.assessmentState = document.getElementById('assess-state').value;
    assessment.score = parseInt(document.getElementById('assess-score').value) || 0;
    assessment.opportunityValue = parseFloat(document.getElementById('assess-value').value) || 0;
    assessment.notes = document.getElementById('assess-notes').value;
    
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    closeModal();
    showNotification('Service assessment saved', 'success');
    renderWhiteSpotHeatmap();
}

// ═══════════════════════════════════════════════════════════════════
// L3 DRILL-DOWN MODAL
// ═══════════════════════════════════════════════════════════════════

/**
 * Open drill-down modal showing L3 components for a service
 */
function openServiceDrilldown(heatmapId, l2ServiceId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const l2Service = window.vivictaServiceLoader.getHLServiceById(l2ServiceId);
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    
    if (!heatmap || !l2Service || !assessment) {
        showNotification('Service assessment not found', 'error');
        return;
    }
    
    // Get L3 components for this service
    const l3Components = window.vivictaServiceLoader.getDLComponentsForService(l2ServiceId);
    
    const stateColor = getStateColor(assessment.assessmentState);
    
    const modalContent = `
        <div style="padding: 20px; max-width: 900px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <div>
                    <h3 style="margin-bottom: 8px;">${l2Service.name}</h3>
                    <p style="color: #6b7280; font-size: 13px;">Service Area: ${l2Service.l1ParentName}</p>
                </div>
                <div style="text-align: right;">
                    <div style="display: inline-block; padding: 6px 12px; background: ${stateColor}; color: white; border-radius: 6px; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                        ${assessment.assessmentState}
                    </div>
                    <div style="font-size: 13px; color: #6b7280;">Score: <strong>${assessment.score}%</strong></div>
                </div>
            </div>
            
            ${assessment.notes ? `
                <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <strong style="font-size: 13px; color: #374151;">Notes:</strong>
                    <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">${assessment.notes}</p>
                </div>
            ` : ''}
            
            <!-- Tabs -->
            <div class="modal-tabs">
                <button class="modal-tab active" onclick="switchDrilldownTab('l3-components')">
                    <i class="fas fa-cubes"></i> L3 Components
                </button>
                <button class="modal-tab" onclick="switchDrilldownTab('apqc-mapping')">
                    <i class="fas fa-link"></i> APQC Mapping
                </button>
                <button class="modal-tab" onclick="switchDrilldownTab('opportunities')">
                    <i class="fas fa-lightbulb"></i> Opportunities
                </button>
            </div>
            
            <!-- L3 Components Tab -->
            <div id="tab-l3-components" class="modal-tab-content active">
                ${l3Components.length > 0 ? `
                    <p style="color: #6b7280; font-size: 13px; margin-bottom: 12px;">
                        Mark which L3 delivery components are currently delivered for this service.
                    </p>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 50px;"></th>
                                <th>Component Name</th>
                                <th>Description</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${l3Components.map(l3 => {
                                const l3Status = assessment.l3Components.find(c => c.l3Id === l3.id);
                                return `
                                    <tr>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                id="l3-${l3.id}"
                                                ${l3Status?.isDelivered ? 'checked' : ''}
                                                onchange="toggleL3Component('${heatmapId}', '${l2ServiceId}', '${l3.id}', this.checked)"
                                            >
                                        </td>
                                        <td><label for="l3-${l3.id}" style="cursor: pointer;">${l3.name}</label></td>
                                        <td style="font-size: 12px; color: #6b7280;">${l3.description || '-'}</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                placeholder="Add notes..."
                                                value="${l3Status?.notes || ''}"
                                                onchange="updateL3Notes('${heatmapId}', '${l2ServiceId}', '${l3.id}', this.value)"
                                                style="font-size: 12px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; width: 100%;"
                                            >
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div class="empty-state" style="padding: 40px;">
                        <p style="color: #6b7280;">No L3 components available for this service in the current data model.</p>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">This will be populated when v5+ JSON with full L3 hierarchy is loaded.</p>
                    </div>
                `}
            </div>
            
            <!-- APQC Mapping Tab -->
            <div id="tab-apqc-mapping" class="modal-tab-content">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="font-size: 13px; color: #065f46; margin-bottom: 12px;">
                        <i class="fas fa-layer-group"></i> <strong>3-Layer APQC Mapping:</strong> 
                        Map this service to APQC capabilities with intelligent type recommendations (Primary, Secondary, Enabler, Industry-specific).
                    </p>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-primary btn-sm" onclick="openAPQCMappingModalSafe('${heatmapId}', '${l2ServiceId}', '${heatmap.customerId}')" style="flex: 1;">
                            <i class="fas fa-edit"></i> Edit APQC Mappings
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="generateAPQCMappings('${heatmapId}', '${l2ServiceId}')">
                            <i class="fas fa-magic"></i> AI Suggestions
                        </button>
                    </div>
                </div>
                
                <div id="apqc-mappings-container">
                    ${renderAPQCMappingsForService(heatmap, l2ServiceId)}
                </div>
            </div>
            
            <!-- Opportunities Tab -->
            <div id="tab-opportunities" class="modal-tab-content">
                <button class="btn btn-primary btn-sm" onclick="addOpportunityForService('${heatmapId}', '${l2ServiceId}')" style="margin-bottom: 16px;">
                    <i class="fas fa-plus"></i> Add Opportunity
                </button>
                <div id="service-opportunities-container">
                    ${renderOpportunitiesForService(heatmap, l2ServiceId)}
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="assessService('${heatmapId}', '${l2ServiceId}')">
                    <i class="fas fa-edit"></i> Edit Assessment
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent, 'large');
}

// ═══════════════════════════════════════════════════════════════════
// L3 COMPONENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function toggleL3Component(heatmapId, l2ServiceId, l3Id, isDelivered) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    
    if (!assessment) return;
    
    let l3Component = assessment.l3Components.find(c => c.l3Id === l3Id);
    
    if (!l3Component) {
        const l3Service = window.vivictaServiceLoader.getL3ComponentById(l3Id);
        l3Component = {
            l3Id: l3Id,
            l3Name: l3Service.name,
            isDelivered: isDelivered,
            notes: ''
        };
        assessment.l3Components.push(l3Component);
    } else {
        l3Component.isDelivered = isDelivered;
    }
    
    // Recalculate score
    const totalL3 = window.vivictaServiceLoader.getDLComponentsForService(l2ServiceId).length;
    const deliveredL3 = assessment.l3Components.filter(c => c.isDelivered).length;
    assessment.score = totalL3 > 0 ? Math.round((deliveredL3 / totalL3) * 100) : 0;
    
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
}

function updateL3Notes(heatmapId, l2ServiceId, l3Id, notes) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    
    if (!assessment) return;
    
    let l3Component = assessment.l3Components.find(c => c.l3Id === l3Id);
    if (l3Component) {
        l3Component.notes = notes;
        heatmap.metadata.updatedAt = new Date().toISOString();
        engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    }
}

// ═══════════════════════════════════════════════════════════════════
// MODAL TAB SWITCHING
// ═══════════════════════════════════════════════════════════════════

function switchDrilldownTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.modal-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Highlight button
    event.target.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════
// APQC MAPPING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Safe wrapper to open APQC mapping modal without inline JSON issues
 * @param {string} heatmapId - Heatmap ID
 * @param {string} l2ServiceId - L2 Service ID
 * @param {string} customerId - Customer ID
 */
function openAPQCMappingModalSafe(heatmapId, l2ServiceId, customerId) {
    // Get heatmap from engagement manager
    if (!window.engagementManager) {
        showNotification('Engagement manager not initialized', 'error');
        return;
    }

    const engagement = window.engagementManager.getCurrentEngagement();
    if (!engagement || !engagement.heatmaps) {
        showNotification('No engagement data found', 'error');
        return;
    }

    const heatmap = engagement.heatmaps.find(h => h.id === heatmapId);
    if (!heatmap) {
        showNotification('Heatmap not found', 'error');
        return;
    }

    // Find the L2 service
    const l2Service = heatmap.services?.find(s => s.serviceId === l2ServiceId);
    if (!l2Service) {
        showNotification('Service not found', 'error');
        return;
    }

    // Get assessment data (contains mappedCapabilities)
    const assessment = heatmap.hlAssessments?.find(a => a.l2ServiceId === l2ServiceId);

    // Build service object for modal
    const serviceObj = {
        id: l2ServiceId,
        name: l2Service.name || '',
        description: l2Service.description || '',
        mappedCapabilities: assessment?.mappedCapabilities || []
    };

    // Call the original modal function with safe data
    if (typeof openAPQCMappingModal === 'function') {
        openAPQCMappingModal(serviceObj, customerId);
    } else {
        showNotification('APQC mapping modal not available', 'error');
        console.error('openAPQCMappingModal function not found');
    }
}

function renderAPQCMappingsForService(heatmap, l2ServiceId) {
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    const mappedCapabilities = assessment?.mappedCapabilities || [];
    
    if (mappedCapabilities.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px; text-align: center;">
                <i class="fas fa-link" style="font-size: 48px; color: #d1d5db; margin-bottom: 16px;"></i>
                <p style="color: #6b7280; font-size: 14px; font-weight: 600;">No APQC capabilities mapped yet</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">Click "Edit APQC Mappings" to map this service to APQC capabilities</p>
            </div>
        `;
    }
    
    const typeColors = {
        'Primary': '#10b981',
        'Secondary': '#3b82f6',
        'Enabler': '#8b5cf6',
        'Industry-specific': '#f59e0b'
    };
    
    return `
        <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <div style="font-size: 13px; color: #374151; margin-bottom: 12px;">
                <strong>${mappedCapabilities.length}</strong> capability mapping${mappedCapabilities.length !== 1 ? 's' : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${mappedCapabilities.map(mapping => {
                    const typeColor = typeColors[mapping.type] || '#6b7280';
                    const customBadge = mapping.customCapability ? '<span style="margin-left: 6px; font-size: 10px; padding: 2px 6px; background: #fef3c7; color: #92400e; border-radius: 4px;">CUSTOM</span>' : '';
                    
                    return `
                        <div style="background: white; border: 1px solid #e5e7eb; border-left: 4px solid ${typeColor}; border-radius: 6px; padding: 10px; display: flex; align-items: center; justify-content: space-between;">
                            <div style="flex: 1;">
                                <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
                                    ${mapping.apqcId}${customBadge}
                                </div>
                                <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                                    ${mapping.name}
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
                                    <span style="padding: 2px 8px; background: ${typeColor}20; color: ${typeColor}; border-radius: 4px; font-weight: 600;">
                                        ${mapping.type}
                                    </span>
                                    ${mapping.industry !== 'cross-industry' ? `<span style="color: #6b7280;">🎯 ${mapping.industry}</span>` : ''}
                                    <span style="color: #9ca3af;">Confidence: ${Math.round(mapping.confidenceScore * 100)}%</span>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-ghost" onclick="removeAPQCMapping('${heatmap.id}', '${l2ServiceId}', '${mapping.apqcId}')" title="Remove mapping">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <div style="padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
            <div style="font-size: 12px; color: #1e40af;">
                <strong>Mapping Types:</strong>
                <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
                    <div><span style="color: ${typeColors.Primary};">⬤</span> Primary - Core capability</div>
                    <div><span style="color: ${typeColors.Secondary};">⬤</span> Secondary - Supporting capability</div>
                    <div><span style="color: ${typeColors.Enabler};">⬤</span> Enabler - Platform/tech enablement</div>
                    <div><span style="color: ${typeColors['Industry-specific']};">⬤</span> Industry-specific - Custom extension</div>
                </div>
            </div>
        </div>
    `;
}


async function generateAPQCMappings(heatmapId, l2ServiceId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const l2Service = window.vivictaServiceLoader.getHLServiceById(l2ServiceId);
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    
    if (!heatmap || !l2Service || !assessment) {
        showNotification('Service not found', 'error');
        console.error('[APQC] Missing data:', { heatmap: !!heatmap, l2Service: !!l2Service, assessment: !!assessment });
        return;
    }
    
    // Check if APQC integration is available and loaded
    if (!window.apqcWhiteSpotIntegration) {
        showNotification('APQC integration not available', 'error');
        console.error('[APQC] window.apqcWhiteSpotIntegration is not defined');
        return;
    }
    
    if (!window.apqcWhiteSpotIntegration.isReady()) {
        showNotification('APQC framework not loaded. Please wait and try again.', 'warning');
        console.warn('[APQC] APQC framework not loaded yet');
        return;
    }
    
    // Show loading state
    showNotification('Generating AI-powered APQC mappings...', 'info');
    
    try {
        // Get L3 components for this service (optional - fallback to service-level matching)
        const l3Components = window.vivictaServiceLoader.getDLComponentsForService(l2ServiceId);
        
        console.log('[APQC] Service:', l2Service.name);
        console.log('[APQC] L3 Components:', l3Components?.length || 0);
        
        if (!l3Components || l3Components.length === 0) {
            console.log('[APQC] No L3 components - using service-level semantic matching');
        }
        
        // Generate mapping suggestions using semantic matching
        const suggestions = await window.apqcWhiteSpotIntegration.generateMappingSuggestions(
            l2Service,
            l3Components,
            {
                minConfidence: 0.25,  // Lowered from 0.5 to be more inclusive
                maxSuggestions: 10,
                preferredLevels: [3, 4]
            }
        );
        
        console.log('[APQC] Generated suggestions:', suggestions.length);
        console.log('[APQC] Suggestions:', suggestions);
        
        if (suggestions.length === 0) {
            showNotification(`No APQC mappings found with sufficient confidence for "${l2Service.name}". Try using the manual "Edit APQC Mappings" button instead.`, 'warning');
            console.warn('[APQC] No suggestions found. This may indicate the APQC framework is not loaded or lacks relevant processes.');
            return;
        }
        
        // Build suggestions modal
        const modalContent = `
            <div style="padding: 20px; max-width: 700px;">
                <h3 style="margin-bottom: 8px;">AI-Generated APQC Mapping Suggestions</h3>
                <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">for ${l2Service.name}</p>
                
                <p style="font-size: 13px; color: #374151; margin-bottom: 16px;">
                    Found <strong>${suggestions.length} suggested mappings</strong> based on semantic analysis.
                    Select the ones you want to add:
                </p>
                
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    ${suggestions.map((suggestion, idx) => {
                        const confidenceColor = suggestion.confidence >= 0.8 ? '#10b981' : suggestion.confidence >= 0.6 ? '#f59e0b' : '#6b7280';
                        const confidenceLabel = suggestion.confidence >= 0.8 ? 'High' : suggestion.confidence >= 0.6 ? 'Medium' : 'Low';
                        
                        return `
                            <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 10px; background: white;">
                                <div style="display: flex; align-items: start; gap: 12px;">
                                    <input 
                                        type="checkbox" 
                                        id="apqc-suggestion-${idx}"
                                        data-apqc-id="${suggestion.apqcId}"
                                        data-apqc-name="${encodeURIComponent(suggestion.apqcName)}"
                                        data-apqc-level="${suggestion.apqcLevel}"
                                        data-rationale="${encodeURIComponent(suggestion.rationale)}"
                                        ${suggestion.confidence >= 0.7 ? 'checked' : ''}
                                        style="margin-top: 4px;"
                                    >
                                    <div style="flex: 1;">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                                            <label for="apqc-suggestion-${idx}" style="font-weight: 600; font-size: 13px; color: #111827; cursor: pointer;">
                                                ${suggestion.apqcName}
                                            </label>
                                            <div style="display: flex; gap: 6px; align-items: center;">
                                                <span class="badge badge-primary">${suggestion.apqcLevel}</span>
                                                <span style="font-size: 11px; font-weight: 600; color: ${confidenceColor};">
                                                    ${confidenceLabel} (${Math.round(suggestion.confidence * 100)}%)
                                                </span>
                                            </div>
                                        </div>
                                        <p style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
                                            <strong>ID:</strong> ${suggestion.apqcId}
                                        </p>
                                        <p style="font-size: 12px; color: #374151; font-style: italic;">
                                            "${suggestion.rationale}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 16px;">
                    <p style="font-size: 12px; color: #065f46;">
                        <i class="fas fa-info-circle"></i> <strong>Note:</strong> High-confidence mappings are pre-selected. 
                        You can manually adjust selections and add custom mappings later.
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="applyAPQCMappings('${heatmapId}', '${l2ServiceId}')">
                        <i class="fas fa-check"></i> Apply Selected Mappings
                    </button>
                </div>
            </div>
        `;
        
        showModal(modalContent, 'large');
        
    } catch (error) {
        console.error('APQC mapping generation error:', error);
        showNotification('Error generating APQC mappings: ' + error.message, 'error');
    }
}

function removeAPQCMapping(heatmapId, l2ServiceId, apqcId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    
    if (assessment && assessment.mappedCapabilities) {
        // Remove the mapping object from mappedCapabilities array
        assessment.mappedCapabilities = assessment.mappedCapabilities.filter(m => m.apqcId !== apqcId);
        heatmap.metadata.updatedAt = new Date().toISOString();
        engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
        
        // Refresh modal
        openServiceDrilldown(heatmapId, l2ServiceId);
        showNotification('APQC mapping removed', 'success');
    }
}

// ═══════════════════════════════════════════════════════════════════
// OPPORTUNITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function renderOpportunitiesForService(heatmap, l2ServiceId) {
    const opportunities = heatmap.opportunities.filter(opp => opp.l2ServiceId === l2ServiceId);
    
    if (opportunities.length === 0) {
        return `
            <div class="empty-state" style="padding: 40px;">
                <p style="color: #6b7280;">No opportunities identified for this service</p>
            </div>
        `;
    }
    
    return opportunities.map(opp => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong style="font-size: 14px; color: #111827;">${opp.title}</strong>
                    ${opp.description ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${opp.description}</p>` : ''}
                </div>
                <div>
                    <button class="btn btn-sm btn-ghost" onclick="editOpportunity('${heatmap.id}', '${opp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-ghost" onclick="deleteOpportunity('${heatmap.id}', '${opp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 12px;">
                <span><strong>Value:</strong> ${opp.estimatedValue ? formatCurrency(opp.estimatedValue) : 'TBD'}</span>
                <span><strong>Priority:</strong> <span class="badge badge-${opp.priority || 'medium'}">${opp.priority || 'medium'}</span></span>
                <span><strong>Status:</strong> <span class="badge badge-${getStatusBadge(opp.status)}">${opp.status || 'identified'}</span></span>
            </div>
        </div>
    `).join('');
}

function addOpportunityForService(heatmapId, l2ServiceId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const l2Service = window.vivictaServiceLoader.getHLServiceById(l2ServiceId);
    
    if (!heatmap || !l2Service) {
        showNotification('Service not found', 'error');
        return;
    }
    
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin-bottom: 20px;">Add Opportunity</h3>
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">for ${l2Service.name}</p>
            
            <div class="form-group">
                <label class="form-label">Opportunity Title *</label>
                <input type="text" id="opp-title" class="form-input" placeholder="e.g., Implement automated deployment pipeline" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="opp-description" class="form-textarea" rows="3" placeholder="Detailed description of the opportunity..."></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Estimated Value ($)</label>
                    <input type="number" id="opp-value" class="form-input" min="0" placeholder="0">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="opp-priority" class="form-input">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select id="opp-status" class="form-input">
                        <option value="identified" selected>Identified</option>
                        <option value="qualified">Qualified</option>
                        <option value="pitched">Pitched</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Date</label>
                    <input type="date" id="opp-target-date" class="form-input">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Owner/Stakeholder</label>
                <input type="text" id="opp-owner" class="form-input" placeholder="Person responsible">
            </div>
            
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea id="opp-notes" class="form-textarea" rows="2" placeholder="Additional notes..."></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveOpportunity('${heatmapId}', '${l2ServiceId}', null)">
                    <i class="fas fa-plus"></i> Create Opportunity
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function addOpportunity(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    // Get all HL services for dropdown
    const hlServices = window.vivictaServiceLoader.getHLServices();
    
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin-bottom: 20px;">Add General Opportunity</h3>
            
            <div class="form-group">
                <label class="form-label">Related Service (Optional)</label>
                <select id="opp-service" class="form-input">
                    <option value="">-- General Opportunity (not service-specific) --</option>
                    ${hlServices.map(svc => `<option value="${svc.id}">${svc.name}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Opportunity Title *</label>
                <input type="text" id="opp-title" class="form-input" placeholder="e.g., Enterprise Architecture Maturity Assessment" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="opp-description" class="form-textarea" rows="3" placeholder="Detailed description of the opportunity..."></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Estimated Value ($)</label>
                    <input type="number" id="opp-value" class="form-input" min="0" placeholder="0">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="opp-priority" class="form-input">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select id="opp-status" class="form-input">
                        <option value="identified" selected>Identified</option>
                        <option value="qualified">Qualified</option>
                        <option value="pitched">Pitched</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Date</label>
                    <input type="date" id="opp-target-date" class="form-input">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Owner/Stakeholder</label>
                <input type="text" id="opp-owner" class="form-input" placeholder="Person responsible">
            </div>
            
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea id="opp-notes" class="form-textarea" rows="2" placeholder="Additional notes..."></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveOpportunity('${heatmapId}', null, null)">
                    <i class="fas fa-plus"></i> Create Opportunity
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function editOpportunity(heatmapId, oppId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const opportunity = heatmap.opportunities.find(o => o.id === oppId);
    
    if (!heatmap || !opportunity) {
        showNotification('Opportunity not found', 'error');
        return;
    }
    
    const hlServices = window.vivictaServiceLoader.getHLServices();
    
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin-bottom: 20px;">Edit Opportunity</h3>
            
            <div class="form-group">
                <label class="form-label">Related Service (Optional)</label>
                <select id="opp-service" class="form-input">
                    <option value="" ${!opportunity.l2ServiceId ? 'selected' : ''}>-- General Opportunity (not service-specific) --</option>
                    ${hlServices.map(svc => `<option value="${svc.id}" ${opportunity.l2ServiceId === svc.id ? 'selected' : ''}>${svc.name}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Opportunity Title *</label>
                <input type="text" id="opp-title" class="form-input" value="${opportunity.title || ''}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="opp-description" class="form-textarea" rows="3">${opportunity.description || ''}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Estimated Value ($)</label>
                    <input type="number" id="opp-value" class="form-input" min="0" value="${opportunity.estimatedValue || 0}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="opp-priority" class="form-input">
                        <option value="low" ${opportunity.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${opportunity.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${opportunity.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="critical" ${opportunity.priority === 'critical' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select id="opp-status" class="form-input">
                        <option value="identified" ${opportunity.status === 'identified' ? 'selected' : ''}>Identified</option>
                        <option value="qualified" ${opportunity.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="pitched" ${opportunity.status === 'pitched' ? 'selected' : ''}>Pitched</option>
                        <option value="won" ${opportunity.status === 'won' ? 'selected' : ''}>Won</option>
                        <option value="lost" ${opportunity.status === 'lost' ? 'selected' : ''}>Lost</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Date</label>
                    <input type="date" id="opp-target-date" class="form-input" value="${opportunity.targetDate || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Owner/Stakeholder</label>
                <input type="text" id="opp-owner" class="form-input" value="${opportunity.owner || ''}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea id="opp-notes" class="form-textarea" rows="2">${opportunity.notes || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveOpportunity('${heatmapId}', '${opportunity.l2ServiceId || ''}', '${oppId}')">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function deleteOpportunity(heatmapId, oppId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const opportunity = heatmap?.opportunities.find(o => o.id === oppId);
    
    if (!heatmap || !opportunity) return;
    
    if (!confirm(`Delete opportunity "${opportunity.title}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    heatmap.opportunities = heatmap.opportunities.filter(o => o.id !== oppId);
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    showNotification('Opportunity deleted', 'success');
    renderWhiteSpotHeatmap();
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM BUSINESS AREAS
// ═══════════════════════════════════════════════════════════════════

function addCustomBusinessArea(heatmapId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    const hlServices = window.vivictaServiceLoader.getHLServices();
    
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin-bottom: 20px;">Add Custom Business Area</h3>
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">
                Define a customer-specific business capability and link it to service delivery areas.
            </p>
            
            <div class="form-group">
                <label class="form-label">Business Area / Capability Name *</label>
                <input type="text" id="ba-name" class="form-input" placeholder="e.g., Customer Onboarding" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="ba-description" class="form-textarea" rows="3" placeholder="Describe the business capability, processes involved, and strategic importance..."></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Category</label>
                <select id="ba-category" class="form-input">
                    <option value="core">Core Business Function</option>
                    <option value="support">Support Function</option>
                    <option value="strategic">Strategic Initiative</option>
                    <option value="innovation">Innovation / R&D</option>
                    <option value="compliance">Compliance / Regulatory</option>
                    <option value="customer-facing">Customer-Facing</option>
                    <option value="internal">Internal Operations</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Linked Service Areas (Select Multiple)</label>
                <select id="ba-services" class="form-input" multiple size="8">
                    ${hlServices.map(svc => `<option value="${svc.id}">${svc.name} (${svc.l1ParentName})</option>`).join('')}
                </select>
                <small style="color: #6b7280; font-size: 12px; margin-top: 4px; display: block;">
                    Hold Ctrl/Cmd to select multiple services that support this business area
                </small>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Business Owner</label>
                    <input type="text" id="ba-owner" class="form-input" placeholder="Name or role">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="ba-priority" class="form-input">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea id="ba-notes" class="form-textarea" rows="2" placeholder="Additional context, dependencies, or transformation goals..."></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveCustomBusinessArea('${heatmapId}', null)">
                    <i class="fas fa-plus"></i> Add Business Area
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function editCustomBusinessArea(heatmapId, areaId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const area = heatmap?.customBusinessAreas.find(a => a.id === areaId);
    
    if (!heatmap || !area) {
        showNotification('Business area not found', 'error');
        return;
    }
    
    const hlServices = window.vivictaServiceLoader.getHLServices();
    
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin-bottom: 20px;">Edit Custom Business Area</h3>
            
            <div class="form-group">
                <label class="form-label">Business Area / Capability Name *</label>
                <input type="text" id="ba-name" class="form-input" value="${area.name || ''}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="ba-description" class="form-textarea" rows="3">${area.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Category</label>
                <select id="ba-category" class="form-input">
                    <option value="core" ${area.category === 'core' ? 'selected' : ''}>Core Business Function</option>
                    <option value="support" ${area.category === 'support' ? 'selected' : ''}>Support Function</option>
                    <option value="strategic" ${area.category === 'strategic' ? 'selected' : ''}>Strategic Initiative</option>
                    <option value="innovation" ${area.category === 'innovation' ? 'selected' : ''}>Innovation / R&D</option>
                    <option value="compliance" ${area.category === 'compliance' ? 'selected' : ''}>Compliance / Regulatory</option>
                    <option value="customer-facing" ${area.category === 'customer-facing' ? 'selected' : ''}>Customer-Facing</option>
                    <option value="internal" ${area.category === 'internal' ? 'selected' : ''}>Internal Operations</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Linked Service Areas (Select Multiple)</label>
                <select id="ba-services" class="form-input" multiple size="8">
                    ${hlServices.map(svc => `<option value="${svc.id}" ${area.linkedL2Services?.includes(svc.id) ? 'selected' : ''}>${svc.name} (${svc.l1ParentName})</option>`).join('')}
                </select>
                <small style="color: #6b7280; font-size: 12px; margin-top: 4px; display: block;">
                    Hold Ctrl/Cmd to select multiple services
                </small>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label class="form-label">Business Owner</label>
                    <input type="text" id="ba-owner" class="form-input" value="${area.owner || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="ba-priority" class="form-input">
                        <option value="low" ${area.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${area.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${area.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="critical" ${area.priority === 'critical' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea id="ba-notes" class="form-textarea" rows="2">${area.notes || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveCustomBusinessArea('${heatmapId}', '${areaId}')">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function deleteCustomBusinessArea(heatmapId, areaId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const area = heatmap?.customBusinessAreas.find(a => a.id === areaId);
    
    if (!heatmap || !area) return;
    
    if (!confirm(`Delete business area "${area.name}"?\n\nThis will remove all service linkages. This action cannot be undone.`)) {
        return;
    }
    
    heatmap.customBusinessAreas = heatmap.customBusinessAreas.filter(a => a.id !== areaId);
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    showNotification('Business area deleted', 'success');
    renderWhiteSpotHeatmap();
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR MODALS
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply selected APQC mappings from AI suggestions modal
 */
function applyAPQCMappings(heatmapId, l2ServiceId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    const assessment = heatmap.hlAssessments.find(a => a.l2ServiceId === l2ServiceId);
    
    if (!assessment) {
        showNotification('Assessment not found', 'error');
        return;
    }
    
    // Initialize mappedCapabilities array if it doesn't exist
    if (!assessment.mappedCapabilities) {
        assessment.mappedCapabilities = [];
    }
    
    // Get all checked checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="apqc-suggestion-"]:checked');
    
    if (checkboxes.length === 0) {
        showNotification('No mappings selected', 'warning');
        return;
    }
    
    // Extract APQC IDs and create mappings
    let addedCount = 0;
    checkboxes.forEach(cb => {
        const apqcId = cb.getAttribute('data-apqc-id');
        const apqcName = decodeURIComponent(cb.getAttribute('data-apqc-name') || apqcId);
        const apqcLevel = cb.getAttribute('data-apqc-level') || 'L3';
        const rationale = decodeURIComponent(cb.getAttribute('data-rationale') || 'AI-suggested mapping');
        
        // Check if mapping already exists
        const existingMapping = assessment.mappedCapabilities.find(m => m.apqcId === apqcId);
        
        if (!existingMapping) {
            // Add to assessment's mapped capabilities with correct structure
            assessment.mappedCapabilities.push({
                apqcId: apqcId,
                name: apqcName,  // Use 'name' not 'apqcName' for rendering
                apqcLevel: apqcLevel,
                type: 'Primary',  // Default type, can be changed via Edit APQC Mappings
                rationale: rationale,
                customCapability: false,
                confidenceScore: 0.7,  // Default confidence for AI suggestions
                industry: 'cross-industry',  // Default to cross-industry
                addedDate: new Date().toISOString()
            });
            addedCount++;
        }
    });
    
    // Update heatmap
    heatmap.metadata.updatedAt = new Date().toISOString();
    engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
    
    closeModal();
    showNotification(`${addedCount} APQC mapping(s) applied successfully`, 'success');
    
    // Refresh the drill-down modal to show updated mappings
    setTimeout(() => {
        openServiceDrilldown(heatmapId, l2ServiceId);
    }, 200);
}

/**
 * Save opportunity (create or update)
 * @param {string} heatmapId - Heatmap ID
 * @param {string} l2ServiceId - Service ID (can be null for general opportunities)
 * @param {string} oppId - Opportunity ID (null for new)
 */
function saveOpportunity(heatmapId, l2ServiceId, oppId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    // Get form values
    const title = document.getElementById('opp-title')?.value?.trim();
    const description = document.getElementById('opp-description')?.value?.trim();
    const estimatedValue = parseFloat(document.getElementById('opp-value')?.value) || 0;
    const priority = document.getElementById('opp-priority')?.value || 'medium';
    const status = document.getElementById('opp-status')?.value || 'identified';
    const targetDate = document.getElementById('opp-target-date')?.value || '';
    const owner = document.getElementById('opp-owner')?.value?.trim() || '';
    const notes = document.getElementById('opp-notes')?.value?.trim() || '';
    
    // Get service from dropdown if exists (for general opportunity modal)
    const serviceSelect = document.getElementById('opp-service');
    const finalServiceId = serviceSelect ? (serviceSelect.value || null) : l2ServiceId;
    
    // Validation
    if (!title) {
        showNotification('Opportunity title is required', 'error');
        return;
    }
    
    if (oppId) {
        // Update existing
        const opportunity = heatmap.opportunities.find(o => o.id === oppId);
        if (opportunity) {
            opportunity.title = title;
            opportunity.description = description;
            opportunity.estimatedValue = estimatedValue;
            opportunity.priority = priority;
            opportunity.status = status;
            opportunity.targetDate = targetDate;
            opportunity.owner = owner;
            opportunity.notes = notes;
            opportunity.l2ServiceId = finalServiceId;
            
            heatmap.metadata.updatedAt = new Date().toISOString();
            engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
            
            closeModal();
            showNotification('Opportunity updated successfully', 'success');
            renderWhiteSpotHeatmap();
        }
    } else {
        // Create new
        const newId = `OPP-${String(heatmap.opportunities.length + 1).padStart(3, '0')}`;
        const newOpportunity = {
            id: newId,
            title: title,
            description: description,
            estimatedValue: estimatedValue,
            priority: priority,
            status: status,
            targetDate: targetDate,
            owner: owner,
            notes: notes,
            l2ServiceId: finalServiceId,
            createdAt: new Date().toISOString()
        };
        
        heatmap.opportunities.push(newOpportunity);
        heatmap.metadata.updatedAt = new Date().toISOString();
        engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
        
        closeModal();
        showNotification('Opportunity created successfully', 'success');
        renderWhiteSpotHeatmap();
    }
}

/**
 * Save custom business area (create or update)
 * @param {string} heatmapId - Heatmap ID
 * @param {string} areaId - Business area ID (null for new)
 */
function saveCustomBusinessArea(heatmapId, areaId) {
    const heatmap = engagementManager.getEntity('whiteSpotHeatmaps', heatmapId);
    if (!heatmap) return;
    
    // Get form values
    const name = document.getElementById('ba-name')?.value?.trim();
    const description = document.getElementById('ba-description')?.value?.trim();
    const category = document.getElementById('ba-category')?.value || 'core';
    const owner = document.getElementById('ba-owner')?.value?.trim() || '';
    const priority = document.getElementById('ba-priority')?.value || 'medium';
    const notes = document.getElementById('ba-notes')?.value?.trim() || '';
    
    // Get selected services (multi-select)
    const servicesSelect = document.getElementById('ba-services');
    const linkedL2Services = Array.from(servicesSelect.selectedOptions).map(opt => opt.value);
    
    // Validation
    if (!name) {
        showNotification('Business area name is required', 'error');
        return;
    }
    
    if (areaId) {
        // Update existing
        const area = heatmap.customBusinessAreas.find(a => a.id === areaId);
        if (area) {
            area.name = name;
            area.description = description;
            area.category = category;
            area.owner = owner;
            area.priority = priority;
            area.notes = notes;
            area.linkedL2Services = linkedL2Services;
            
            heatmap.metadata.updatedAt = new Date().toISOString();
            engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
            
            closeModal();
            showNotification('Business area updated successfully', 'success');
            renderWhiteSpotHeatmap();
        }
    } else {
        // Create new
        const newId = `BA-${String(heatmap.customBusinessAreas.length + 1).padStart(3, '0')}`;
        const newArea = {
            id: newId,
            name: name,
            description: description,
            category: category,
            owner: owner,
            priority: priority,
            notes: notes,
            linkedL2Services: linkedL2Services,
            createdAt: new Date().toISOString()
        };
        
        heatmap.customBusinessAreas.push(newArea);
        heatmap.metadata.updatedAt = new Date().toISOString();
        engagementManager.updateEntity('whiteSpotHeatmaps', heatmap.id, heatmap);
        
        closeModal();
        showNotification('Business area created successfully', 'success');
        renderWhiteSpotHeatmap();
    }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS (imported from renderer)
// ═══════════════════════════════════════════════════════════════════

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

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/**
 * Generate demo heatmap for a specific customer
 * Called from the "Generate Demo Data" button in empty heatmap state
 */
async function generateDemoHeatmapForCustomer(customerId) {
    try {
        const customer = engagementManager.getEntity('customers', customerId);
        if (!customer) {
            showNotification('Customer not found', 'error');
            return;
        }
        
        showNotification('Generating demo heatmap with APQC mappings...', 'info');
        
        // Ensure loaders are initialized
        if (!window.vivictaServiceLoader || !window.vivictaServiceLoader.isReady()) {
            await window.vivictaServiceLoader.loadServiceModel('data/vivicta_dcs_service_delivery_consolidated_v4_1_HL_DL.json');
        }
        
        if (!window.apqcWhiteSpotIntegration || !window.apqcWhiteSpotIntegration.isReady()) {
            await window.apqcWhiteSpotIntegration.loadAPQCFramework('data/apqc_pcf_master.json');
        }
        
        // Generate heatmap with mixed scenario (balanced distribution)
        const heatmap = await generateDemoHeatmap(customer, 'mixed', window.engagementManager);
        
        // Save to engagement
        engagementManager.createEntity('whiteSpotHeatmaps', heatmap);
        
        console.log(`✓ Generated demo heatmap: ${heatmap.id} for ${customer.name}`);
        console.log(`  - ${heatmap.hlAssessments.length} service assessments`);
        console.log(`  - ${heatmap.opportunities.length} opportunities`);
        console.log(`  - APQC mappings integrated`);
        
        // Refresh display
        await renderWhiteSpotHeatmap();
        
        showNotification(
            `Demo heatmap generated for ${customer.name} with ${heatmap.hlAssessments.length} services and ${heatmap.opportunities.length} opportunities!`,
            'success'
        );
        
    } catch (error) {
        console.error('Error generating demo heatmap:', error);
        showNotification('Failed to generate demo heatmap: ' + error.message, 'error');
    }
}

/**
 * Show notification toast
 * Wrapper for showToast to match WhiteSpot function signatures
 */
function showNotification(message, type = 'info') {
    if (typeof showToast === 'function') {
        const title = type === 'success' ? 'Success' :
                     type === 'error' ? 'Error' :
                     type === 'warning' ? 'Warning' : 'Info';
        showToast(title, message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Show modal dialog
 * @param {string} content - HTML content for modal body
 * @param {string} size - 'normal' or 'large'
 */
function showModal(content, size = 'normal') {
    // Remove existing modal if present
    const existingModal = document.getElementById('whitespot-dynamic-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modalHTML = `
        <div id="whitespot-dynamic-modal" class="modal-overlay" onclick="if(event.target === this) closeModal()">
            <div class="modal-box ${size === 'large' ? 'large' : ''}" onclick="event.stopPropagation()">
                ${content}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal dialog
 */
function closeModal() {
    const modal = document.getElementById('whitespot-dynamic-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}
