/**
 * EA Engagement Playbook - Canvas Implementations (Phase 3)
 * Complete implementation of all 5 canvases with modals and rendering
 * @version 1.0 - Phase 3 Complete
 * @date 2026-04-17
 */

// ═══════════════════════════════════════════════════════════════════
// CANVAS 2: STAKEHOLDER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openStakeholderModal(id = null) {
    document.getElementById('stakeholder-edit-id').value = id || '';
    
    if (id) {
        const stakeholder = engagementManager.getEntity('stakeholders', id);
        if (stakeholder) {
            document.getElementById('stakeholder-modal-title').textContent = 'Edit Stakeholder';
            document.getElementById('stakeholder-name').value = stakeholder.name || '';
            document.getElementById('stakeholder-role').value = stakeholder.role || '';
            document.getElementById('stakeholder-orgunit').value = stakeholder.orgUnit || '';
            document.getElementById('stakeholder-influence').value = stakeholder.influence || 'medium';
            document.getElementById('stakeholder-power').value = stakeholder.decisionPower || 'medium';
            document.getElementById('stakeholder-priorities').value = (stakeholder.priorities || []).join('\n');
        }
    } else {
        document.getElementById('stakeholder-modal-title').textContent = 'Add Stakeholder';
        document.getElementById('stakeholder-name').value = '';
        document.getElementById('stakeholder-role').value = '';
        document.getElementById('stakeholder-orgunit').value = '';
        document.getElementById('stakeholder-influence').value = 'medium';
        document.getElementById('stakeholder-power').value = 'medium';
        document.getElementById('stakeholder-priorities').value = '';
    }
    
    document.getElementById('stakeholderModal').classList.remove('hidden');
}

function closeStakeholderModal() {
    document.getElementById('stakeholderModal').classList.add('hidden');
}

function saveStakeholder() {
    const id = document.getElementById('stakeholder-edit-id').value;
    const name = document.getElementById('stakeholder-name').value;
    const role = document.getElementById('stakeholder-role').value;
    const orgUnit = document.getElementById('stakeholder-orgunit').value;
    const influence = document.getElementById('stakeholder-influence').value;
    const decisionPower = document.getElementById('stakeholder-power').value;
    const prioritiesText = document.getElementById('stakeholder-priorities').value;
    const priorities = prioritiesText.split('\n').filter(p => p.trim()).map(p => p.trim());
    
    if (!name || !role) {
        showToast('Validation Error', 'Please fill in name and role', 'error');
        return;
    }
    
    const stakeholder = {
        name, role, orgUnit, influence, decisionPower, priorities,
        interest: 'medium',  // Default values for schema compatibility
        sentiment: 'neutral'
    };
    
    if (id) {
        engagementManager.updateEntity('stakeholders', id, stakeholder);
    } else {
        engagementManager.addEntity('stakeholders', stakeholder);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeStakeholderModal();
    renderStakeholders();
    updateKPIs();
    
    showToast('Stakeholder Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderStakeholders() {
    const stakeholders = engagementManager.getEntities('stakeholders') || [];
    const container = document.getElementById('stakeholders-container');
    
    // Apply filters
    const searchTerm = document.getElementById('filter-stakeholder')?.value.toLowerCase() || '';
    const influenceFilter = document.getElementById('filter-influence')?.value || '';
    
    const filtered = stakeholders.filter(s => {
        const matchesSearch = !searchTerm || 
            s.name.toLowerCase().includes(searchTerm) ||
            s.role.toLowerCase().includes(searchTerm) ||
            (s.orgUnit && s.orgUnit.toLowerCase().includes(searchTerm));
        const matchesInfluence = !influenceFilter || s.influence === influenceFilter;
        return matchesSearch && matchesInfluence;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <div class="empty-state-title">${stakeholders.length === 0 ? 'No stakeholders defined' : 'No matching stakeholders'}</div>
                <div class="empty-state-text">${stakeholders.length === 0 ? 'Add stakeholders to track influence and decision power' : 'Try adjusting your filters'}</div>
                ${stakeholders.length === 0 ? '<button class="btn btn-primary" onclick="openStakeholderModal()"><i class="fas fa-plus"></i> Add First Stakeholder</button>' : ''}
            </div>
        `;
        return;
    }
    
    const getInfluenceColor = (level) => {
        return level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';
    };
    
    container.innerHTML = filtered.map(s => `
        <div class="entity-card">
            <div class="entity-card-header">
                <div>
                    <div class="entity-card-title">${s.name}</div>
                    <div class="entity-card-subtitle">${s.role}${s.orgUnit ? ' • ' + s.orgUnit : ''}</div>
                </div>
                <button class="btn btn-sm btn-ghost" onclick="openStakeholderModal('${s.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="entity-card-body">
                <div class="entity-metrics">
                    <div class="metric-item">
                        <div class="metric-label">Influence</div>
                        <div class="metric-badge" style="background: ${getInfluenceColor(s.influence)}20; color: ${getInfluenceColor(s.influence)};">
                            ${s.influence}
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Decision Power</div>
                        <div class="metric-badge" style="background: ${getInfluenceColor(s.decisionPower)}20; color: ${getInfluenceColor(s.decisionPower)};">
                            ${s.decisionPower}
                        </div>
                    </div>
                    ${s.priorities && s.priorities.length > 0 ? `
                    <div class="metric-item" style="grid-column: 1 / -1;">
                        <div class="metric-label">Priorities</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                            ${s.priorities.slice(0, 3).map(p => `
                                <span class="tag" style="background: #3b82f620; color: #3b82f6; font-size: 11px; padding: 2px 8px;">
                                    ${p}
                                </span>
                            `).join('')}
                            ${s.priorities.length > 3 ? `<span class="tag" style="background: #6b728020; color: #6b7280; font-size: 11px; padding: 2px 8px;">+${s.priorities.length - 3} more</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 3: APPLICATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openApplicationModal(id = null) {
    document.getElementById('application-edit-id').value = id || '';
    
    if (id) {
        const app = engagementManager.getEntity('applications', id);
        if (app) {
            document.getElementById('application-modal-title').textContent = 'Edit Application';
            document.getElementById('application-name').value = app.name || '';
            document.getElementById('application-domain').value = app.businessDomain || '';
            document.getElementById('application-owner').value = app.owner || '';
            document.getElementById('application-lifecycle').value = app.lifecycle || 'tolerate';
            document.getElementById('application-risk').value = app.riskLevel || 'medium';
            document.getElementById('application-debt').value = app.technicalDebt || 'medium';
            document.getElementById('application-cost').value = app.annualCost || 0;
            document.getElementById('application-sunset').checked = app.sunsetCandidate || false;
            document.getElementById('application-modernize').checked = app.modernizationCandidate || false;
        }
    } else {
        document.getElementById('application-modal-title').textContent = 'Add Application';
        document.getElementById('application-name').value = '';
        document.getElementById('application-domain').value = '';
        document.getElementById('application-owner').value = '';
        document.getElementById('application-lifecycle').value = 'tolerate';
        document.getElementById('application-risk').value = 'medium';
        document.getElementById('application-debt').value = 'medium';
        document.getElementById('application-cost').value = 0;
        document.getElementById('application-sunset').checked = false;
        document.getElementById('application-modernize').checked = false;
    }
    
    document.getElementById('applicationModal').classList.remove('hidden');
}

function closeApplicationModal() {
    document.getElementById('applicationModal').classList.add('hidden');
}

function saveApplication() {
    const id = document.getElementById('application-edit-id').value;
    const name = document.getElementById('application-name').value;
    const businessDomain = document.getElementById('application-domain').value;
    const owner = document.getElementById('application-owner').value;
    const lifecycle = document.getElementById('application-lifecycle').value;
    const riskLevel = document.getElementById('application-risk').value;
    const technicalDebt = document.getElementById('application-debt').value;
    const annualCost = parseFloat(document.getElementById('application-cost').value) || 0;
    const sunsetCandidate = document.getElementById('application-sunset').checked;
    const modernizationCandidate = document.getElementById('application-modernize').checked;
    
    if (!name || !businessDomain) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    const application = {
        name, businessDomain, owner, lifecycle, riskLevel, technicalDebt,
        annualCost, sunsetCandidate, modernizationCandidate,
        regulatorySensitivity: 'medium'
    };
    
    if (id) {
        engagementManager.updateEntity('applications', id, application);
    } else {
        engagementManager.addEntity('applications', application);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeApplicationModal();
    renderApplications();
    updateKPIs();
    
    showToast('Application Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderApplications() {
    const applications = engagementManager.getEntities('applications') || [];
    const container = document.getElementById('applications-container');
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-cubes"></i></div>
                <div class="empty-state-title">No applications in portfolio</div>
                <div class="empty-state-text">Import from APM Toolkit or add manually</div>
                <button class="btn btn-primary" onclick="importAPMData()">
                    <i class="fas fa-download"></i> Import from APM Toolkit
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Application</th>
                    <th>Domain</th>
                    <th>Lifecycle</th>
                    <th>Risk</th>
                    <th>Tech Debt</th>
                    <th>Annual Cost</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${applications.map(app => `
                    <tr>
                        <td>
                            <strong>${app.name || 'Unnamed'}</strong>
                            ${app.sunsetCandidate ? '<span class="badge badge-high" style="margin-left: 8px;">Sunset</span>' : ''}
                            ${app.modernizationCandidate ? '<span class="badge badge-medium" style="margin-left: 8px;">Modernize</span>' : ''}
                        </td>
                        <td>${app.businessDomain || '-'}</td>
                        <td><span class="badge badge-${app.lifecycle || 'tolerate'}">${app.lifecycle || 'tolerate'}</span></td>
                        <td><span class="badge badge-${app.riskLevel || 'medium'}">${app.riskLevel || 'medium'}</span></td>
                        <td><span class="badge badge-${app.technicalDebt || 'medium'}">${app.technicalDebt || 'medium'}</span></td>
                        <td>${app.annualCost ? (app.annualCost || 0).toLocaleString() + ' SEK' : '-'}</td>
                        <td>
                            <button class="btn btn-ghost" style="padding: 4px 8px;" onclick="openApplicationModal('${app.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 4: CAPABILITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openCapabilityModal(id = null) {
    document.getElementById('capability-edit-id').value = id || '';
    
    if (id) {
        const cap = engagementManager.getEntity('capabilities', id);
        if (cap) {
            document.getElementById('capability-modal-title').textContent = 'Edit Capability';
            document.getElementById('capability-name').value = cap.name || '';
            document.getElementById('capability-domain').value = cap.domain || '';
            document.getElementById('capability-level').value = cap.level || 'L2';
            document.getElementById('capability-maturity').value = cap.maturity || 3;
            document.getElementById('capability-target').value = cap.targetMaturity || 4;
            document.getElementById('capability-importance').value = cap.strategicImportance || 'high';
            document.getElementById('capability-description').value = cap.description || '';
        }
    } else {
        document.getElementById('capability-modal-title').textContent = 'Add Capability';
        document.getElementById('capability-name').value = '';
        document.getElementById('capability-domain').value = '';
        document.getElementById('capability-level').value = 'L2';
        document.getElementById('capability-maturity').value = 3;
        document.getElementById('capability-target').value = 4;
        document.getElementById('capability-importance').value = 'high';
        document.getElementById('capability-description').value = '';
    }
    
    document.getElementById('capabilityModal').classList.remove('hidden');
}

function closeCapabilityModal() {
    document.getElementById('capabilityModal').classList.add('hidden');
}

function saveCapability() {
    const id = document.getElementById('capability-edit-id').value;
    const name = document.getElementById('capability-name').value;
    const domain = document.getElementById('capability-domain').value;
    const level = document.getElementById('capability-level').value;
    const maturity = parseInt(document.getElementById('capability-maturity').value);
    const targetMaturity = parseInt(document.getElementById('capability-target').value);
    const strategicImportance = document.getElementById('capability-importance').value;
    const description = document.getElementById('capability-description').value;
    
    if (!name || !domain) {
        showToast('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    const gap = targetMaturity - maturity;
    
    const capability = {
        name, domain, level, maturity, targetMaturity, gap,
        strategicImportance, description,
        linkedApplications: []
    };
    
    if (id) {
        engagementManager.updateEntity('capabilities', id, capability);
    } else {
        engagementManager.addEntity('capabilities', capability);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeCapabilityModal();
    renderWhitespace();
    updateKPIs();
    
    showToast('Capability Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderWhitespace() {
    const capabilities = engagementManager.getEntities('capabilities') || [];
    const container = document.getElementById('whitespace-container');
    
    if (capabilities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chart-line"></i></div>
                <div class="empty-state-title">No capability gaps defined</div>
                <div class="empty-state-text">Define capabilities to identify white-spots and opportunities</div>
            </div>
        `;
        return;
    }
    
    const gapStats = capabilities.reduce((acc, cap) => {
        const gap = cap.gap || 0;
        if (gap > 0) acc.hasGap++;
        if (gap >= 2) acc.critical++;
        return acc;
    }, { hasGap: 0, critical: 0 });
    
    container.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 12px;">
                <i class="fas fa-chart-bar" style="margin-right: 8px;"></i>Gap Analysis Summary
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #065f46;">${capabilities.length}</div>
                    <div style="font-size: 12px; color: #047857;">Total Capabilities</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #d97706;">${gapStats.hasGap}</div>
                    <div style="font-size: 12px; color: #92400e;">With Gaps</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${gapStats.critical}</div>
                    <div style="font-size: 12px; color: #991b1b;">Critical Gaps (≥2)</div>
                </div>
            </div>
        </div>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th>Capability</th>
                    <th>Domain</th>
                    <th>Level</th>
                    <th>Current</th>
                    <th>Target</th>
                    <th>Gap</th>
                    <th>Importance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${capabilities.map(cap => {
                    const gap = cap.gap || 0;
                    const gapClass = gap >= 2 ? 'badge-high' : gap === 1 ? 'badge-medium' : 'badge-low';
                    return `
                        <tr>
                            <td><strong>${cap.name || 'Unnamed'}</strong></td>
                            <td>${cap.domain || '-'}</td>
                            <td><span class="badge badge-draft">${cap.level || 'L2'}</span></td>
                            <td>${cap.maturity || 0}</td>
                            <td>${cap.targetMaturity || 0}</td>
                            <td><span class="badge ${gapClass}">${gap > 0 ? '+' + gap : gap}</span></td>
                            <td><span class="badge badge-${cap.strategicImportance || 'medium'}">${cap.strategicImportance || 'medium'}</span></td>
                            <td>
                                <button class="btn btn-ghost" style="padding: 4px 8px;" onclick="openCapabilityModal('${cap.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 5: ARCHITECTURE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openArchitectureModal(id = null) {
    document.getElementById('architecture-edit-id').value = id || '';
    
    if (id) {
        const arch = engagementManager.getEntity('architectureViews', id);
        if (arch) {
            document.getElementById('architecture-modal-title').textContent = 'Edit Architecture View';
            document.getElementById('architecture-name').value = arch.name || '';
            document.getElementById('architecture-type').value = arch.type || 'target';
            document.getElementById('architecture-diagram-type').value = arch.diagramType || 'application-landscape';
            document.getElementById('architecture-principles').value = (arch.principles || []).join('\n');
            document.getElementById('architecture-patterns').value = (arch.patterns || []).join('\n');
            document.getElementById('architecture-description').value = arch.description || '';
        }
    } else {
        document.getElementById('architecture-modal-title').textContent = 'Add Architecture View';
        document.getElementById('architecture-name').value = '';
        document.getElementById('architecture-type').value = 'target';
        document.getElementById('architecture-diagram-type').value = 'application-landscape';
        document.getElementById('architecture-principles').value = '';
        document.getElementById('architecture-patterns').value = '';
        document.getElementById('architecture-description').value = '';
    }
    
    document.getElementById('architectureModal').classList.remove('hidden');
}

function closeArchitectureModal() {
    document.getElementById('architectureModal').classList.add('hidden');
}

function saveArchitecture() {
    const id = document.getElementById('architecture-edit-id').value;
    const name = document.getElementById('architecture-name').value;
    const type = document.getElementById('architecture-type').value;
    const diagramType = document.getElementById('architecture-diagram-type').value;
    const principles = document.getElementById('architecture-principles').value.split('\n').filter(p => p.trim());
    const patterns = document.getElementById('architecture-patterns').value.split('\n').filter(p => p.trim());
    const description = document.getElementById('architecture-description').value;
    
    if (!name) {
        showToast('Validation Error', 'Please enter a name', 'error');
        return;
    }
    
    const architecture = {
        name, type, diagramType, principles, patterns, description,
        linkedCapabilities: [],
        linkedApplications: []
    };
    
    if (id) {
        engagementManager.updateEntity('architectureViews', id, architecture);
    } else {
        engagementManager.addEntity('architectureViews', architecture);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeArchitectureModal();
    renderTarget();
    updateKPIs();
    
    showToast('Architecture Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderTarget() {
    const architectures = engagementManager.getEntities('architectureViews') || [];
    const container = document.getElementById('target-container');
    
    if (architectures.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-bullseye"></i></div>
                <div class="empty-state-title">No target architecture defined</div>
                <div class="empty-state-text">Define principles, patterns, and reference architectures</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = architectures.map(arch => `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">${arch.name}</h3>
                    <div style="display: flex; gap: 8px;">
                        <span class="badge badge-${arch.type === 'target' ? 'active' : arch.type === 'as-is' ? 'draft' : 'medium'}">${(arch.type || 'other').toUpperCase()}</span>
                        ${arch.diagramType ? `<span class="badge badge-draft">${arch.diagramType.replace('-', ' ')}</span>` : ''}
                    </div>
                </div>
                <button class="btn btn-ghost" onclick="openArchitectureModal('${arch.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            
            ${arch.description ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">${arch.description}</p>` : ''}
            
            ${arch.principles && arch.principles.length > 0 ? `
                <div style="margin-bottom: 16px;">
                    <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        <i class="fas fa-lightbulb" style="color: #10b981; margin-right: 6px;"></i>Principles
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                        ${arch.principles.map(p => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${arch.patterns && arch.patterns.length > 0 ? `
                <div>
                    <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        <i class="fas fa-code-branch" style="color: #10b981; margin-right: 6px;"></i>Patterns
                    </h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${arch.patterns.map(p => `<span class="badge badge-active">${p}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// CANVAS 6: INITIATIVE & ROADMAP MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openInitiativeModal(id = null) {
    document.getElementById('initiative-edit-id').value = id || '';
    
    // Reset value type checkboxes
    ['cost', 'risk', 'speed', 'compliance', 'revenue', 'quality'].forEach(type => {
        document.getElementById('value-' + type).checked = false;
    });
    
    if (id) {
        const init = engagementManager.getEntity('initiatives', id);
        if (init) {
            document.getElementById('initiative-modal-title').textContent = 'Edit Initiative';
            document.getElementById('initiative-name').value = init.name || '';
            document.getElementById('initiative-description').value = init.description || '';
            document.getElementById('initiative-themes').value = (init.linkedThemes || []).join(', ');
            document.getElementById('initiative-horizon').value = init.timeHorizon || 'mid';
            document.getElementById('initiative-status').value = init.status || 'option';
            document.getElementById('initiative-effort').value = init.effort || 'M';
            document.getElementById('initiative-cost').value = init.estimatedCost || 0;
            document.getElementById('initiative-outcomes').value = (init.businessOutcomes || []).join('\n');
            document.getElementById('initiative-owner').value = init.owner || '';
            
            // Check value type checkboxes
            (init.valueType || []).forEach(type => {
                const checkbox = document.getElementById('value-' + type);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        document.getElementById('initiative-modal-title').textContent = 'Add Initiative';
        document.getElementById('initiative-name').value = '';
        document.getElementById('initiative-description').value = '';
        document.getElementById('initiative-themes').value = '';
        document.getElementById('initiative-horizon').value = 'mid';
        document.getElementById('initiative-status').value = 'option';
        document.getElementById('initiative-effort').value = 'M';
        document.getElementById('initiative-cost').value = 0;
        document.getElementById('initiative-outcomes').value = '';
        document.getElementById('initiative-owner').value = '';
    }
    
    document.getElementById('initiativeModal').classList.remove('hidden');
}

function closeInitiativeModal() {
    document.getElementById('initiativeModal').classList.add('hidden');
}

function saveInitiative() {
    const id = document.getElementById('initiative-edit-id').value;
    const name = document.getElementById('initiative-name').value;
    const description = document.getElementById('initiative-description').value;
    const themesInput = document.getElementById('initiative-themes').value;
    const linkedThemes = themesInput.split(',').map(t => t.trim()).filter(t => t);
    const timeHorizon = document.getElementById('initiative-horizon').value;
    const status = document.getElementById('initiative-status').value;
    const effort = document.getElementById('initiative-effort').value;
    const estimatedCost = parseFloat(document.getElementById('initiative-cost').value) || 0;
    const businessOutcomes = document.getElementById('initiative-outcomes').value.split('\n').filter(o => o.trim());
    const owner = document.getElementById('initiative-owner').value;
    
    // Get checked value types
    const valueType = [];
    ['cost', 'risk', 'speed', 'compliance', 'revenue', 'quality'].forEach(type => {
        if (document.getElementById('value-' + type).checked) {
            valueType.push(type);
        }
    });
    
    // Validation
    if (!name) {
        showToast('Validation Error', 'Please enter an initiative name', 'error');
        return;
    }
    if (linkedThemes.length === 0) {
        showToast('Validation Error', 'Please enter at least one theme', 'error');
        return;
    }
    if (businessOutcomes.length === 0) {
        showToast('Validation Error', 'Please enter at least one business outcome', 'error');
        return;
    }
    if (valueType.length === 0) {
        showToast('Validation Error', 'Please select at least one value driver', 'error');
        return;
    }
    
    const initiative = {
        name, description, linkedThemes, timeHorizon, status, effort, estimatedCost,
        businessOutcomes, valueType, owner,
        dependencies: [],
        risks: []
    };
    
    if (id) {
        engagementManager.updateEntity('initiatives', id, initiative);
    } else {
        engagementManager.addEntity('initiatives', initiative);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeInitiativeModal();
    renderRoadmap();
    updateKPIs();
    
    showToast('Initiative Saved', id ? `Updated ${name}` : `Added ${name}`, 'success');
}

function renderRoadmap() {
    const initiatives = engagementManager.getEntities('initiatives') || [];
    const container = document.getElementById('roadmap-container');
    
    if (initiatives.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-road"></i></div>
                <div class="empty-state-title">No initiatives defined</div>
                <div class="empty-state-text">Create initiatives and sequence them on the roadmap</div>
            </div>
        `;
        return;
    }
    
    const byHorizon = initiatives.reduce((acc, init) => {
        const horizon = init.timeHorizon || 'short'; // Default to short if undefined
        if (!acc[horizon]) acc[horizon] = [];
        acc[horizon].push(init);
        return acc;
    }, {});
    
    container.innerHTML = `
        <div style="margin-bottom: 16px; padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-info-circle" style="color: #0284c7;"></i>
            <span style="font-size: 13px; color: #0c4a6e;">
                <strong>Tip:</strong> Drag and drop initiatives between time horizons to reorganize your roadmap
            </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            ${['short', 'mid', 'long'].map(horizon => {
                const inits = byHorizon[horizon] || [];
                const horizonLabel = horizon === 'short' ? 'Short-term (0-12mo)' : horizon === 'mid' ? 'Mid-term (12-24mo)' : 'Long-term (24mo+)';
                const horizonColor = horizon === 'short' ? '#10b981' : horizon === 'mid' ? '#f59e0b' : '#3b82f6';
                
                return `
                    <div class="roadmap-column" data-horizon="${horizon}" 
                         style="background: white; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 20px; min-height: 400px;"
                         ondragover="allowDrop(event)" ondrop="dropInitiative(event, '${horizon}')">
                        <h3 style="font-size: 14px; font-weight: 700; color: ${horizonColor}; margin-bottom: 16px; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between;">
                            <span>${horizonLabel}</span>
                            <span style="background: ${horizonColor}20; color: ${horizonColor}; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${inits.length}</span>
                        </h3>
                        <div class="roadmap-items" style="display: flex; flex-direction: column; gap: 12px;">
                            ${inits.length === 0 ? `
                                <div style="text-align: center; padding: 40px 20px; color: #9ca3af; border: 2px dashed #e5e7eb; border-radius: 8px; background: #f9fafb;">
                                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 8px; display: block;"></i>
                                    <div style="font-size: 13px;">Drop initiatives here</div>
                                </div>
                            ` : inits.map(init => `
                                <div class="initiative-card" draggable="true" data-id="${init.id}" data-horizon="${horizon}"
                                     ondragstart="dragInitiative(event)"
                                     style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; cursor: move; transition: all 0.2s;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                                <i class="fas fa-grip-vertical" style="color: #9ca3af; font-size: 12px;"></i>
                                                <strong style="font-size: 14px; color: #111827;">${init.name || 'Unnamed'}</strong>
                                            </div>
                                            ${init.description ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${init.description}</div>` : ''}
                                        </div>
                                        <button class="btn btn-ghost" style="padding: 2px 6px; font-size: 12px;" onclick="openInitiativeModal('${init.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                    <div style="display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
                                        <span class="badge badge-${init.status === 'approved' ? 'active' : init.status === 'option' ? 'draft' : 'medium'}">${init.status || 'draft'}</span>
                                        <span class="badge badge-draft">${init.effort || 'medium'}</span>
                                        ${init.owner ? `<span class="badge" style="background: #e0e7ff; color: #4338ca;"><i class="fas fa-user" style="font-size: 10px;"></i> ${init.owner}</span>` : ''}
                                    </div>
                                    ${init.estimatedCost > 0 ? `
                                        <div style="font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 6px;">
                                            <i class="fas fa-coins" style="color: #f59e0b;"></i>
                                            <strong>${((init.estimatedCost || 0) / 1000000).toFixed(1)}M SEK</strong>
                                        </div>
                                    ` : ''}
                                    ${init.businessOutcomes && init.businessOutcomes.length > 0 ? `
                                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                <i class="fas fa-bullseye" style="color: #10b981;"></i> Outcomes:
                                            </div>
                                            <div style="font-size: 11px; color: #374151;">
                                                ${init.businessOutcomes.slice(0, 2).join(' • ')}${init.businessOutcomes.length > 2 ? '...' : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Add hover effects via CSS
    addRoadmapStyles();
}

function addRoadmapStyles() {
    if (!document.getElementById('roadmap-drag-styles')) {
        const style = document.createElement('style');
        style.id = 'roadmap-drag-styles';
        style.textContent = `
            .initiative-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-color: #3b82f6 !important;
            }
            .initiative-card.dragging {
                opacity: 0.5;
            }
            .roadmap-column.drag-over {
                background: #f0f9ff !important;
                border-color: #3b82f6 !important;
                border-style: solid !important;
            }
        `;
        document.head.appendChild(style);
    }
}

function dragInitiative(event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('initiativeId', event.target.dataset.id);
    event.dataTransfer.setData('sourceHorizon', event.target.dataset.horizon);
    event.target.classList.add('dragging');
}

function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    const column = event.currentTarget;
    if (column.classList.contains('roadmap-column')) {
        column.classList.add('drag-over');
    }
}

function dropInitiative(event, targetHorizon) {
    event.preventDefault();
    
    const initiativeId = event.dataTransfer.getData('initiativeId');
    const sourceHorizon = event.dataTransfer.getData('sourceHorizon');
    
    // Remove visual feedback
    document.querySelectorAll('.roadmap-column').forEach(col => col.classList.remove('drag-over'));
    document.querySelectorAll('.initiative-card').forEach(card => card.classList.remove('dragging'));
    
    if (sourceHorizon === targetHorizon) {
        return; // No change needed
    }
    
    // Update the initiative's timeHorizon
    const success = engagementManager.updateEntity('initiatives', initiativeId, {
        timeHorizon: targetHorizon
    });
    
    if (success) {
        currentEngagement = engagementManager.getCurrentEngagement();
        renderRoadmap();
        
        const horizonLabels = {
            short: 'Short-term (0-12mo)',
            mid: 'Mid-term (12-24mo)',
            long: 'Long-term (24mo+)'
        };
        
        showToast('Initiative Moved', `Moved to ${horizonLabels[targetHorizon]}`, 'success');
    } else {
        showToast('Error', 'Failed to move initiative', 'error');
    }
}

// Clean up drag feedback when drag leaves column
document.addEventListener('dragleave', function(event) {
    if (event.target.classList.contains('roadmap-column')) {
        event.target.classList.remove('drag-over');
    }
});

document.addEventListener('dragend', function(event) {
    document.querySelectorAll('.initiative-card').forEach(card => card.classList.remove('dragging'));
    document.querySelectorAll('.roadmap-column').forEach(col => col.classList.remove('drag-over'));
});

// ═══════════════════════════════════════════════════════════════════
// CANVAS 7: LEADERSHIP VIEW
// ═══════════════════════════════════════════════════════════════════

function renderLeadership() {
    const initiatives = engagementManager.getEntities('initiatives') || [];
    const applications = engagementManager.getEntities('applications') || [];
    const capabilities = engagementManager.getEntities('capabilities') || [];
    const container = document.getElementById('leadership-container');
    
    if (initiatives.length === 0 && applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chart-pie"></i></div>
                <div class="empty-state-title">Insufficient data for leadership view</div>
                <div class="empty-state-text">Complete other canvases to generate the portfolio view</div>
            </div>
        `;
        return;
    }
    
    const stats = {
        totalApps: applications.length,
        sunsetCandidates: applications.filter(a => a.sunsetCandidate).length,
        modernizeCandidates: applications.filter(a => a.modernizationCandidate).length,
        totalInitiatives: initiatives.length,
        approvedInitiatives: initiatives.filter(i => i.status === 'approved' || i.status === 'in-progress').length,
        totalCost: initiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
        criticalGaps: capabilities.filter(c => c.gap >= 2).length
    };
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; color: white;">
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Portfolio Overview</h2>
            <p style="opacity: 0.9; font-size: 14px;">Strategic summary for leadership review</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div class="kpi-card">
                <div class="kpi-value">${stats.totalApps}</div>
                <div class="kpi-label">Applications</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${stats.totalInitiatives}</div>
                <div class="kpi-label">Initiatives</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${stats.approvedInitiatives}</div>
                <div class="kpi-label">Approved</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${(stats.totalCost / 1000000).toFixed(1)}M</div>
                <div class="kpi-label">Total Investment (SEK)</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                    <i class="fas fa-cubes" style="color: #10b981; margin-right: 8px;"></i>Application Portfolio
                </h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${stats.sunsetCandidates}</div>
                        <div style="font-size: 12px; color: #6b7280;">Sunset Candidates</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${stats.modernizeCandidates}</div>
                        <div style="font-size: 12px; color: #6b7280;">Modernization Targets</div>
                    </div>
                </div>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                    <i class="fas fa-chart-line" style="color: #10b981; margin-right: 6px;"></i>Capability Gaps
                </h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${stats.criticalGaps}</div>
                        <div style="font-size: 12px; color: #6b7280;">Critical Gaps</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: #10b981;">${capabilities.length}</div>
                        <div style="font-size: 12px; color: #6b7280;">Total Capabilities</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 12px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 8px;">
                <i class="fas fa-info-circle" style="margin-right: 6px;"></i>Next Steps
            </h4>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px;">
                <li style="margin-bottom: 4px;">Review and approve ${stats.totalInitiatives - stats.approvedInitiatives} pending initiatives</li>
                <li style="margin-bottom: 4px;">Address ${stats.criticalGaps} critical capability gaps</li>
                <li>Complete sunset planning for ${stats.sunsetCandidates} applications</li>
            </ul>
        </div>
    `;
}
