/**
 * EA Engagement Playbook - Canvas Implementations (Phase 3)
 * Complete implementation of all 5 canvases with modals and rendering
 * @version 1.0 - Phase 3 Complete
 * @date 2026-04-17
 */

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
                            <strong>${app.name}</strong>
                            ${app.sunsetCandidate ? '<span class="badge badge-high" style="margin-left: 8px;">Sunset</span>' : ''}
                            ${app.modernizationCandidate ? '<span class="badge badge-medium" style="margin-left: 8px;">Modernize</span>' : ''}
                        </td>
                        <td>${app.businessDomain}</td>
                        <td><span class="badge badge-${app.lifecycle}">${app.lifecycle}</span></td>
                        <td><span class="badge badge-${app.riskLevel}">${app.riskLevel}</span></td>
                        <td><span class="badge badge-${app.technicalDebt}">${app.technicalDebt}</span></td>
                        <td>${app.annualCost ? app.annualCost.toLocaleString() + ' SEK' : '-'}</td>
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
        if (cap.gap > 0) acc.hasGap++;
        if (cap.gap >= 2) acc.critical++;
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
                    const gapClass = cap.gap >= 2 ? 'badge-high' : cap.gap === 1 ? 'badge-medium' : 'badge-low';
                    return `
                        <tr>
                            <td><strong>${cap.name}</strong></td>
                            <td>${cap.domain}</td>
                            <td><span class="badge badge-draft">${cap.level}</span></td>
                            <td>${cap.maturity}</td>
                            <td>${cap.targetMaturity}</td>
                            <td><span class="badge ${gapClass}">${cap.gap > 0 ? '+' + cap.gap : cap.gap}</span></td>
                            <td><span class="badge badge-${cap.strategicImportance}">${cap.strategicImportance}</span></td>
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
                        <span class="badge badge-${arch.type === 'target' ? 'active' : arch.type === 'as-is' ? 'draft' : 'medium'}">${arch.type.toUpperCase()}</span>
                        <span class="badge badge-draft">${arch.diagramType.replace('-', ' ')}</span>
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
    
    if (id) {
        const init = engagementManager.getEntity('initiatives', id);
        if (init) {
            document.getElementById('initiative-modal-title').textContent = 'Edit Initiative';
            document.getElementById('initiative-name').value = init.name || '';
            document.getElementById('initiative-description').value = init.description || '';
            document.getElementById('initiative-horizon').value = init.timeHorizon || 'mid';
            document.getElementById('initiative-status').value = init.status || 'option';
            document.getElementById('initiative-effort').value = init.effort || 'M';
            document.getElementById('initiative-cost').value = init.estimatedCost || 0;
            document.getElementById('initiative-outcomes').value = (init.businessOutcomes || []).join('\n');
            document.getElementById('initiative-owner').value = init.owner || '';
        }
    } else {
        document.getElementById('initiative-modal-title').textContent = 'Add Initiative';
        document.getElementById('initiative-name').value = '';
        document.getElementById('initiative-description').value = '';
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
    const timeHorizon = document.getElementById('initiative-horizon').value;
    const status = document.getElementById('initiative-status').value;
    const effort = document.getElementById('initiative-effort').value;
    const estimatedCost = parseFloat(document.getElementById('initiative-cost').value) || 0;
    const businessOutcomes = document.getElementById('initiative-outcomes').value.split('\n').filter(o => o.trim());
    const owner = document.getElementById('initiative-owner').value;
    
    if (!name || businessOutcomes.length === 0) {
        showToast('Validation Error', 'Please enter a name and at least one business outcome', 'error');
        return;
    }
    
    const initiative = {
        name, description, timeHorizon, status, effort, estimatedCost,
        businessOutcomes, owner,
        linkedThemes: [],
        valueType: ['cost'],
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
        if (!acc[init.timeHorizon]) acc[init.timeHorizon] = [];
        acc[init.timeHorizon].push(init);
        return acc;
    }, {});
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            ${['short', 'mid', 'long'].map(horizon => {
                const inits = byHorizon[horizon] || [];
                const horizonLabel = horizon === 'short' ? 'Short-term (0-12mo)' : horizon === 'mid' ? 'Mid-term (12-24mo)' : 'Long-term (24mo+)';
                const horizonColor = horizon === 'short' ? '#10b981' : horizon === 'mid' ? '#f59e0b' : '#3b82f6';
                
                return `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                        <h3 style="font-size: 14px; font-weight: 700; color: ${horizonColor}; margin-bottom: 16px; text-transform: uppercase;">
                            ${horizonLabel}
                        </h3>
                        ${inits.length === 0 ? `
                            <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
                                <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 8px; display: block;"></i>
                                <div style="font-size: 13px;">No initiatives</div>
                            </div>
                        ` : inits.map(init => `
                            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                    <strong style="font-size: 14px; color: #111827;">${init.name}</strong>
                                    <button class="btn btn-ghost" style="padding: 2px 6px; font-size: 12px;" onclick="openInitiativeModal('${init.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                                <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                                    <span class="badge badge-${init.status === 'approved' ? 'active' : init.status === 'option' ? 'draft' : 'medium'}">${init.status}</span>
                                    <span class="badge badge-draft">${init.effort}</span>
                                </div>
                                ${init.estimatedCost > 0 ? `<div style="font-size: 12px; color: #6b7280;">Cost: ${init.estimatedCost.toLocaleString()} SEK</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

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
