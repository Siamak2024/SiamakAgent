/**
 * EA Engagement Playbook - Enhanced Stakeholder Management
 * Adds stakeholder types (internal/engagement-team/customer) and relationship tracking
 * @version 1.0
 * @date 2026-04-18
 */

console.log('✓ Enhanced Stakeholder Management loading...');

// Override renderStakeholders() with enhanced two-column layout
window.renderStakeholders = function() {
    console.log('✓ Enhanced renderStakeholders called');
    const stakeholders = engagementManager.getEntities('stakeholders') || [];
    const container = document.getElementById('stakeholders-container');
    
    if (!container) {
        console.error('Stakeholders container not found');
        return;
    }
    
    console.log(`Rendering ${stakeholders.length} stakeholders in two-column layout`);
    
    if (stakeholders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <div class="empty-state-title">No stakeholders defined yet</div>
                <div class="empty-state-text">Identify key stakeholders, their roles, influence levels, and priorities</div>
                <button class="btn btn-primary" onclick="openStakeholderModal()" style="margin-top: 16px;">
                    <i class="fas fa-plus"></i> Add First Stakeholder
                </button>
                <p style="color: #6b7280; font-size: 12px; margin-top: 12px;">or <button onclick="loadExampleEngagement()" style="background: none; border: none; color: #10b981; text-decoration: underline; cursor: pointer; font-size: 12px;">load example data</button></p>
            </div>
        `;
        return;
    }
    
    // Group stakeholders by type
    const grouped = {
        'internal': stakeholders.filter(s => (s.type || 'internal') === 'internal'),
        'engagement-team': stakeholders.filter(s => s.type === 'engagement-team'),
        'customer': stakeholders.filter(s => s.type === 'customer')
    };
    
    const getInfluenceColor = (level) => {
        return level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';
    };
    
    const getTypeConfig = (type) => {
        const configs = {
            'internal': { icon: 'fa-building', color: '#3b82f6', label: 'Consulting Internal Team', description: 'Technical Staff', bgColor: '#eff6ff' },
            'engagement-team': { icon: 'fa-user-tie', color: '#8b5cf6', label: 'Consulting Engagement Team', description: 'Marketing & Sales', bgColor: '#f5f3ff' },
            'customer': { icon: 'fa-handshake', color: '#10b981', label: 'Customer Team', description: 'Client Organization', bgColor: '#f0fdf4' }
        };
        return configs[type] || configs['internal'];
    };
    
    const renderCompactStakeholderCard = (s) => {
        const config = getTypeConfig(s.type || 'internal');
        const relationships = (s.customerRelationships || []).length;
        const hasRelationships = relationships > 0 && (s.type === 'engagement-team' || s.type === 'internal');
        
        return `
            <div class="entity-card stakeholder-card" 
                 id="stakeholder-${s.id}" 
                 style="border-left: 4px solid ${config.color}; margin-bottom: 12px; position: relative; cursor: pointer; transition: all 0.2s ease;" 
                 data-stakeholder-id="${s.id}" 
                 data-type="${s.type}"
                 data-relationships="${(s.customerRelationships || []).join(',')}"
                 onclick="toggleStakeholderHighlight('${s.id}')"
                 onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                 onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='';">
                <div class="entity-card-header" style="padding: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <i class="fas ${config.icon}" style="color: ${config.color}; font-size: 12px;"></i>
                            <div class="entity-card-title" style="font-size: 14px;">${s.name}</div>
                        </div>
                        <div class="entity-card-subtitle" style="font-size: 11px;">${s.role}</div>
                        <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">${s.orgUnit || ''}</div>
                    </div>
                    <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); openStakeholderModal('${s.id}')" title="Edit" style="padding: 4px 8px;">
                        <i class="fas fa-edit" style="font-size: 12px;"></i>
                    </button>
                </div>
                <div class="entity-card-body" style="padding: 8px 12px; padding-top: 0;">
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <div class="metric-badge" style="background: ${getInfluenceColor(s.influence)}20; color: ${getInfluenceColor(s.influence)}; font-size: 10px; padding: 2px 8px;">
                            <i class="fas fa-star" style="font-size: 9px;"></i> ${s.influence}
                        </div>
                        <div class="metric-badge" style="background: ${getInfluenceColor(s.decisionPower)}20; color: ${getInfluenceColor(s.decisionPower)}; font-size: 10px; padding: 2px 8px;">
                            <i class="fas fa-gavel" style="font-size: 9px;"></i> ${s.decisionPower}
                        </div>
                        ${hasRelationships ? `
                        <div class="metric-badge" style="background: #10b98120; color: #10b981; font-size: 10px; padding: 2px 8px;">
                            <i class="fas fa-link" style="font-size: 9px;"></i> ${relationships}
                        </div>
                        ` : ''}
                    </div>
                </div>
                <!-- Highlight indicator (hidden by default) -->
                <div class="relationship-indicator" style="display: none; position: absolute; top: 8px; right: 8px; width: 12px; height: 12px; border-radius: 50%; background: #10b981; border: 2px solid white; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); animation: pulse 1.5s ease-in-out infinite;"></div>
            </div>
        `;
    };
    
    // Combine internal and engagement team for left column
    const leftColumnStakeholders = [...grouped['internal'], ...grouped['engagement-team']];
    const rightColumnStakeholders = grouped['customer'];
    
    // Build two-column layout with SVG overlay for relationship lines
    let html = `
        <div style="position: relative;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; position: relative;">
                <!-- Left Column: Internal & Engagement Team -->
                <div>
                    ${grouped['internal'].length > 0 ? `
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 12px;">
                                <i class="fas fa-building" style="color: #3b82f6; font-size: 16px;"></i>
                                <div>
                                    <h3 style="font-size: 14px; font-weight: 700; color: #3b82f6; margin: 0;">Consulting Internal Team</h3>
                                    <p style="font-size: 11px; color: #6b7280; margin: 0;">${grouped['internal'].length} technical staff • Enterprise Architecture & Solution Design</p>
                                </div>
                            </div>
                            ${grouped['internal'].map(renderCompactStakeholderCard).join('')}
                        </div>
                    ` : ''}
                    
                    ${grouped['engagement-team'].length > 0 ? `
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f5f3ff; border-left: 4px solid #8b5cf6; border-radius: 8px; margin-bottom: 12px;">
                                <i class="fas fa-user-tie" style="color: #8b5cf6; font-size: 16px;"></i>
                                <div>
                                    <h3 style="font-size: 14px; font-weight: 700; color: #8b5cf6; margin: 0;">Consulting Engagement Team</h3>
                                    <p style="font-size: 11px; color: #6b7280; margin: 0;">${grouped['engagement-team'].length} customer-facing staff • Marketing & Sales</p>
                                </div>
                            </div>
                            ${grouped['engagement-team'].map(renderCompactStakeholderCard).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Right Column: Customer Team -->
                <div>
                    ${grouped['customer'].length > 0 ? `
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 12px;">
                                <i class="fas fa-handshake" style="color: #10b981; font-size: 16px;"></i>
                                <div>
                                    <h3 style="font-size: 14px; font-weight: 700; color: #10b981; margin: 0;">Customer Team</h3>
                                    <p style="font-size: 11px; color: #6b7280; margin: 0;">${grouped['customer'].length} client stakeholder${grouped['customer'].length === 1 ? '' : 's'} • Decision Makers & Key Contacts</p>
                                </div>
                            </div>
                            ${grouped['customer'].map(renderCompactStakeholderCard).join('')}
                        </div>
                    ` : `
                        <div style="padding: 40px; text-align: center; background: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                            <i class="fas fa-handshake" style="color: #d1d5db; font-size: 32px; margin-bottom: 12px;"></i>
                            <p style="color: #6b7280; font-size: 13px; margin: 0;">No customer stakeholders yet</p>
                            <button class="btn btn-sm btn-primary" onclick="openStakeholderModal()" style="margin-top: 12px; font-size: 12px;">
                                <i class="fas fa-plus"></i> Add Customer Contact
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- SVG Canvas for relationship lines (hidden by default, shown on hover) -->
            <svg id="relationship-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; opacity: 0;"></svg>
        </div>
        
        <!-- Relationship legend -->
        <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
                <i class="fas fa-info-circle" style="color: #3b82f6;"></i> 
                <strong>Click on any consulting team member</strong> to highlight their customer relationships. Click again to clear.
            </p>
            <button id="clear-selection-btn" onclick="clearStakeholderSelection()" style="display: none; padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; transition: background 0.2s;">
                <i class="fas fa-times"></i> Clear Selection
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add CSS for pulse animation if not already added
    if (!document.getElementById('stakeholder-highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'stakeholder-highlight-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
            }
            .stakeholder-card.active {
                border-left-width: 6px !important;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4) !important;
                background: linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent) !important;
            }
            .stakeholder-card.highlighted {
                border-left-width: 6px !important;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4) !important;
                background: linear-gradient(to left, rgba(16, 185, 129, 0.05), transparent) !important;
            }
            .stakeholder-card.dimmed {
                opacity: 0.3;
                filter: grayscale(0.5);
            }
            .stakeholder-card:hover {
                cursor: pointer;
            }
            .stakeholder-card.active:hover::after {
                content: "Click to deselect";
                position: absolute;
                bottom: -24px;
                left: 50%;
                transform: translateX(-50%);
                background: #111827;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);
    }
};

// Update stakeholder relationship field visibility
function updateStakeholderRelationshipField() {
    const type = document.getElementById('stakeholder-type').value;
    const relationshipsGroup = document.getElementById('stakeholder-relationships-group');
    
    // Show relationship field for engagement-team and internal, hide for customer
    if (type === 'engagement-team' || type === 'internal') {
        relationshipsGroup.style.display = 'block';
        
        // Populate with customer stakeholders
        const stakeholders = engagementManager.getEntities('stakeholders') || [];
        const customerStakeholders = stakeholders.filter(s => s.type === 'customer');
        const relationshipsSelect = document.getElementById('stakeholder-relationships');
        
        relationshipsSelect.innerHTML = customerStakeholders.length > 0 
            ? customerStakeholders.map(c => `<option value="${c.id}">${c.name} (${c.role})</option>`).join('')
            : '<option disabled>No customer stakeholders defined yet</option>';
    } else {
        relationshipsGroup.style.display = 'none';
    }
}

// Override openStakeholderModal to include type and relationships
const originalOpenStakeholderModal = window.openStakeholderModal;
window.openStakeholderModal = function(id = null) {
    // Call original if it exists
    if (originalOpenStakeholderModal) {
        originalOpenStakeholderModal(id);
    }
    
    // Get modal elements
    const modal = document.getElementById('stakeholderModal');
    const typeSelect = document.getElementById('stakeholder-type');
    const relationshipsSelect = document.getElementById('stakeholder-relationships');
    
    // Set type field
    if (id) {
        const stakeholder = engagementManager.getEntity('stakeholders', id);
        if (stakeholder) {
            // Load all existing fields
            document.getElementById('stakeholder-edit-id').value = id;
            document.getElementById('stakeholder-name').value = stakeholder.name || '';
            document.getElementById('stakeholder-role').value = stakeholder.role || '';
            document.getElementById('stakeholder-orgunit').value = stakeholder.orgUnit || '';
            document.getElementById('stakeholder-influence').value = stakeholder.influence || 'medium';
            document.getElementById('stakeholder-power').value = stakeholder.decisionPower || 'medium';
            document.getElementById('stakeholder-priorities').value = (stakeholder.priorities || []).join('\n');
            
            // Load type
            typeSelect.value = stakeholder.type || 'internal';
            
            // Update relationship field visibility
            updateStakeholderRelationshipField();
            
            // Load relationships
            if (stakeholder.customerRelationships && stakeholder.customerRelationships.length > 0) {
                Array.from(relationshipsSelect.options).forEach(opt => {
                    opt.selected = stakeholder.customerRelationships.includes(opt.value);
                });
            }
        }
    } else {
        // New stakeholder - default to internal
        typeSelect.value = 'internal';
        updateStakeholderRelationshipField();
    }
    
    modal.classList.remove('hidden');
};

// Override saveStakeholder to include type and relationships
const originalSaveStakeholder = window.saveStakeholder;
window.saveStakeholder = function() {
    const id = document.getElementById('stakeholder-edit-id').value;
    const name = document.getElementById('stakeholder-name').value;
    const role = document.getElementById('stakeholder-role').value;
    const orgUnit = document.getElementById('stakeholder-orgunit').value;
    const type = document.getElementById('stakeholder-type').value;
    const influence = document.getElementById('stakeholder-influence').value;
    const decisionPower = document.getElementById('stakeholder-power').value;
    const prioritiesText = document.getElementById('stakeholder-priorities').value;
    const priorities = prioritiesText.split('\n').filter(p => p.trim()).map(p => p.trim());
    
    // Get selected customer relationships
    const relationshipsSelect = document.getElementById('stakeholder-relationships');
    const customerRelationships = Array.from(relationshipsSelect.selectedOptions).map(opt => opt.value);
    
    if (!name || !role || !orgUnit) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    const stakeholder = {
        name, role, orgUnit, type, influence, decisionPower, priorities,
        customerRelationships: customerRelationships || []
    };
    
    if (id) {
        engagementManager.updateEntity('stakeholders', id, stakeholder);
    } else {
        engagementManager.addEntity('stakeholders', stakeholder);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeStakeholderModal();
    
    // Store active stakeholder before re-render
    const wasActive = currentActiveStakeholder;
    
    renderStakeholders();
    updateKPIs();
    
    // Restore active state after re-render
    if (wasActive) {
        setTimeout(() => toggleStakeholderHighlight(wasActive), 100);
    }
    
    showToast('Stakeholder Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
};

// Toggle stakeholder highlight - show relationships when clicked
let currentActiveStakeholder = null;

window.toggleStakeholderHighlight = function(stakeholderId) {
    console.log('Toggle called for:', stakeholderId, 'Current active:', currentActiveStakeholder);
    
    const allCards = document.querySelectorAll('.stakeholder-card');
    const clickedCard = document.querySelector(`[data-stakeholder-id="${stakeholderId}"]`);
    
    if (!clickedCard) {
        console.error('Clicked card not found:', stakeholderId);
        return;
    }
    
    // If clicking the same card, deactivate
    if (currentActiveStakeholder === stakeholderId) {
        console.log('Deactivating...');
        currentActiveStakeholder = null;
        
        // Hide clear button
        const clearBtn = document.getElementById('clear-selection-btn');
        if (clearBtn) clearBtn.style.display = 'none';
        
        // Remove all highlights
        allCards.forEach(card => {
            card.classList.remove('active', 'highlighted', 'dimmed');
            card.style.opacity = '';
            card.style.filter = '';
            const indicator = card.querySelector('.relationship-indicator');
            if (indicator) indicator.style.display = 'none';
        });
        
        // Hide SVG lines
        const svg = document.getElementById('relationship-svg');
        if (svg) {
            svg.style.opacity = '0';
            svg.innerHTML = '';
        }
        
        console.log('Deactivated successfully');
        return;
    }
    
    console.log('Activating:', stakeholderId);
    currentActiveStakeholder = stakeholderId;
    
    // Show clear button
    const clearBtn = document.getElementById('clear-selection-btn');
    if (clearBtn) clearBtn.style.display = 'block';
    
    // Get relationships from clicked card
    const relationships = clickedCard.dataset.relationships ? clickedCard.dataset.relationships.split(',').filter(r => r) : [];
    const cardType = clickedCard.dataset.type;
    
    // Reset all cards
    allCards.forEach(card => {
        card.classList.remove('active', 'highlighted', 'dimmed');
        const indicator = card.querySelector('.relationship-indicator');
        if (indicator) indicator.style.display = 'none';
    });
    
    // Highlight clicked card
    clickedCard.classList.add('active');
    
    if (relationships.length > 0) {
        // Highlight related stakeholders
        relationships.forEach(relId => {
            const relatedCard = document.querySelector(`[data-stakeholder-id="${relId}"]`);
            if (relatedCard) {
                relatedCard.classList.add('highlighted');
                const indicator = relatedCard.querySelector('.relationship-indicator');
                if (indicator) indicator.style.display = 'block';
            }
        });
        
        // Dim unrelated cards
        allCards.forEach(card => {
            const cardId = card.dataset.stakeholderId;
            if (cardId !== stakeholderId && !relationships.includes(cardId)) {
                card.classList.add('dimmed');
            }
        });
        
        // Draw lines to relationships
        const stakeholders = engagementManager.getEntities('stakeholders') || [];
        const grouped = {
            'internal': stakeholders.filter(s => (s.type || 'internal') === 'internal'),
            'engagement-team': stakeholders.filter(s => s.type === 'engagement-team'),
            'customer': stakeholders.filter(s => s.type === 'customer')
        };
        drawRelationshipLines(grouped, stakeholderId);
    } else {
        // No relationships - just dim others
        allCards.forEach(card => {
            if (card.dataset.stakeholderId !== stakeholderId) {
                card.classList.add('dimmed');
            }
        });
        
        // Hide SVG
        const svg = document.getElementById('relationship-svg');
        if (svg) {
            svg.style.opacity = '0';
            svg.innerHTML = '';
        }
    }
}

// Modified drawRelationshipLines to only draw for active stakeholder
window.drawRelationshipLines = function(grouped, activeStakeholderId) {
    const svg = document.getElementById('relationship-svg');
    if (!svg || !activeStakeholderId) {
        if (svg) {
            svg.style.opacity = '0';
            svg.innerHTML = '';
        }
        return;
    }
    
    const container = svg.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Clear existing lines
    svg.innerHTML = '';
    
    // Set SVG viewBox to match container
    svg.setAttribute('width', container.offsetWidth);
    svg.setAttribute('height', container.offsetHeight);
    
    // Find the active stakeholder
    const allStakeholders = [...grouped['internal'], ...grouped['engagement-team'], ...grouped['customer']];
    const activeStakeholder = allStakeholders.find(s => s.id === activeStakeholderId);
    
    if (!activeStakeholder || !activeStakeholder.customerRelationships || activeStakeholder.customerRelationships.length === 0) {
        svg.style.opacity = '0';
        return;
    }
    
    const sourceCard = document.querySelector(`[data-stakeholder-id="${activeStakeholderId}"]`);
    if (!sourceCard) return;
    
    const sourceRect = sourceCard.getBoundingClientRect();
    const sourceY = sourceRect.top - containerRect.top + (sourceRect.height / 2);
    const sourceX = sourceRect.right - containerRect.left;
    
    // Draw line to each customer relationship
    activeStakeholder.customerRelationships.forEach((targetId, index) => {
        const targetCard = document.querySelector(`[data-stakeholder-id="${targetId}"]`);
        if (!targetCard) return;
        
        const targetRect = targetCard.getBoundingClientRect();
        const targetY = targetRect.top - containerRect.top + (targetRect.height / 2);
        const targetX = targetRect.left - containerRect.left;
        
        // Create curved path
        const midX = sourceX + (targetX - sourceX) / 2;
        const path = `M ${sourceX} ${sourceY} Q ${midX} ${sourceY}, ${midX} ${(sourceY + targetY) / 2} Q ${midX} ${targetY}, ${targetX} ${targetY}`;
        
        // Create SVG path element with gradient
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('stroke', '#8b5cf6');
        pathElement.setAttribute('stroke-width', '3');
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('opacity', '0.7');
        pathElement.setAttribute('stroke-linecap', 'round');
        
        // Add arrow marker
        const arrowId = `arrow-${index}`;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', arrowId);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '8');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', '#10b981');
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        svg.appendChild(defs);
        
        pathElement.setAttribute('marker-end', `url(#${arrowId})`);
        
        svg.appendChild(pathElement);
        
        // Add connection dot on source side with glow
        const sourceDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sourceDot.setAttribute('cx', sourceX);
        sourceDot.setAttribute('cy', sourceY);
        sourceDot.setAttribute('r', '6');
        sourceDot.setAttribute('fill', '#8b5cf6');
        sourceDot.setAttribute('stroke', 'white');
        sourceDot.setAttribute('stroke-width', '2');
        svg.appendChild(sourceDot);
        
        // Add connection dot on target side with glow
        const targetDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        targetDot.setAttribute('cx', targetX);
        targetDot.setAttribute('cy', targetY);
        targetDot.setAttribute('r', '6');
        targetDot.setAttribute('fill', '#10b981');
        targetDot.setAttribute('stroke', 'white');
        targetDot.setAttribute('stroke-width', '2');
        svg.appendChild(targetDot);
    });
    
    // Show SVG with fade-in
    svg.style.opacity = '1';
    svg.style.transition = 'opacity 0.3s ease';
}

// Redraw lines on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentActiveStakeholder) {
            const stakeholders = engagementManager.getEntities('stakeholders') || [];
            const grouped = {
                'internal': stakeholders.filter(s => (s.type || 'internal') === 'internal'),
                'engagement-team': stakeholders.filter(s => s.type === 'engagement-team'),
                'customer': stakeholders.filter(s => s.type === 'customer')
            };
            drawRelationshipLines(grouped, currentActiveStakeholder);
        }
    }, 250);
});

// Clear stakeholder selection - helper function
window.clearStakeholderSelection = function() {
    if (currentActiveStakeholder) {
        toggleStakeholderHighlight(currentActiveStakeholder);
    }
};

console.log('✓ Enhanced Stakeholder Management loaded');
