/**
 * EA Engagement Playbook - Phase 1 Additions
 * Risk, Decision, Constraint, and Assumption Management
 * @version 1.0 - Phase 1
 * @date 2026-04-18
 */

// ═══════════════════════════════════════════════════════════════════
// RISK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openRiskModal(id = null) {
    document.getElementById('risk-edit-id').value = id || '';
    
    if (id) {
        const risk = engagementManager.getEntity('risks', id);
        if (risk) {
            document.getElementById('risk-modal-title').textContent = 'Edit Risk';
            document.getElementById('risk-title').value = risk.title || '';
            document.getElementById('risk-description').value = risk.description || '';
            document.getElementById('risk-category').value = risk.category || 'technical';
            document.getElementById('risk-probability').value = risk.probability || 'medium';
            document.getElementById('risk-impact').value = risk.impact || 'medium';
            document.getElementById('risk-status').value = risk.status || 'open';
            document.getElementById('risk-owner').value = risk.owner || '';
            document.getElementById('risk-mitigation').value = risk.mitigationPlan || '';
        }
    } else {
        document.getElementById('risk-modal-title').textContent = 'Add Risk';
        document.getElementById('risk-title').value = '';
        document.getElementById('risk-description').value = '';
        document.getElementById('risk-category').value = 'technical';
        document.getElementById('risk-probability').value = 'medium';
        document.getElementById('risk-impact').value = 'medium';
        document.getElementById('risk-status').value = 'open';
        document.getElementById('risk-owner').value = '';
        document.getElementById('risk-mitigation').value = '';
    }
    
    document.getElementById('riskModal').classList.remove('hidden');
}

function closeRiskModal() {
    document.getElementById('riskModal').classList.add('hidden');
}

function saveRisk() {
    const id = document.getElementById('risk-edit-id').value;
    const title = document.getElementById('risk-title').value.trim();
    const description = document.getElementById('risk-description').value.trim();
    const category = document.getElementById('risk-category').value;
    const probability = document.getElementById('risk-probability').value;
    const impact = document.getElementById('risk-impact').value;
    const status = document.getElementById('risk-status').value;
    const owner = document.getElementById('risk-owner').value.trim();
    const mitigationPlan = document.getElementById('risk-mitigation').value.trim();
    
    if (!title || !description || !owner) {
        showToast('Validation Error', 'Please fill in title, description, and owner', 'error');
        return;
    }
    
    // Calculate severity score (simple: high=3, medium=2, low=1)
    const probScore = probability === 'high' ? 3 : probability === 'medium' ? 2 : 1;
    const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
    const severity = probScore * impactScore;
    
    const risk = {
        title, description, category, probability, impact, status, owner, 
        mitigationPlan, severity,
        identifiedDate: new Date().toISOString().split('T')[0],
        lastReviewDate: new Date().toISOString().split('T')[0],
        relatedObjects: []
    };
    
    if (id) {
        engagementManager.updateEntity('risks', id, risk);
    } else {
        engagementManager.addEntity('risks', risk);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeRiskModal();
    renderRisks();
    updateKPIs();
    
    showToast('Risk Saved', id ? `Updated ${title}` : `Added ${title}`, 'success');
}

function renderRisks() {
    const risks = engagementManager.getEntities('risks') || [];
    const container = document.getElementById('risk-container');
    
    if (risks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="empty-state-title">No risks identified</div>
                <div class="empty-state-text">Identify and track engagement risks</div>
            </div>
        `;
        return;
    }
    
    // Sort by severity (descending)
    const sorted = [...risks].sort((a, b) => (b.severity || 0) - (a.severity || 0));
    
    const getRiskColor = (severity) => {
        if (severity >= 6) return '#dc2626'; // high
        if (severity >= 4) return '#f59e0b'; // medium
        return '#10b981'; // low
    };
    
    const getStatusBadge = (status) => {
        const colors = {
            open: 'red',
            mitigating: 'yellow',
            closed: 'green',
            accepted: 'gray'
        };
        return `<span class="badge badge-${colors[status] || 'gray'}">${status}</span>`;
    };
    
    container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Risk</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Category</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Severity</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Status</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Owner</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(risk => `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 12px;">
                            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${risk.title}</div>
                            <div style="font-size: 12px; color: #6b7280;">${risk.description.substring(0, 80)}${risk.description.length > 80 ? '...' : ''}</div>
                        </td>
                        <td style="padding: 12px;">
                            <span class="badge badge-gray">${risk.category}</span>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${getRiskColor(risk.severity)}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; margin: 0 auto;">
                                ${risk.severity}
                            </div>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            ${getStatusBadge(risk.status)}
                        </td>
                        <td style="padding: 12px; color: #374151;">${risk.owner}</td>
                        <td style="padding: 12px; text-align: center;">
                            <button onclick="openRiskModal('${risk.id}')" class="btn btn-ghost btn-sm" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteEntity('risks', '${risk.id}')" class="btn btn-ghost btn-sm" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// DECISION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openDecisionModal(id = null) {
    document.getElementById('decision-edit-id').value = id || '';
    
    if (id) {
        const decision = engagementManager.getEntity('decisions', id);
        if (decision) {
            document.getElementById('decision-modal-title').textContent = 'Edit Decision';
            document.getElementById('decision-title').value = decision.title || '';
            document.getElementById('decision-description').value = decision.description || '';
            document.getElementById('decision-status').value = decision.status || 'proposed';
            document.getElementById('decision-owner').value = decision.owner || '';
            document.getElementById('decision-impact').value = decision.impact || '';
            document.getElementById('decision-rationale').value = decision.rationale || '';
            document.getElementById('decision-date').value = decision.decisionDate || '';
        }
    } else {
        document.getElementById('decision-modal-title').textContent = 'Add Decision';
        document.getElementById('decision-title').value = '';
        document.getElementById('decision-description').value = '';
        document.getElementById('decision-status').value = 'proposed';
        document.getElementById('decision-owner').value = '';
        document.getElementById('decision-impact').value = '';
        document.getElementById('decision-rationale').value = '';
        document.getElementById('decision-date').value = '';
    }
    
    document.getElementById('decisionModal').classList.remove('hidden');
}

function closeDecisionModal() {
    document.getElementById('decisionModal').classList.add('hidden');
}

function saveDecision() {
    const id = document.getElementById('decision-edit-id').value;
    const title = document.getElementById('decision-title').value.trim();
    const description = document.getElementById('decision-description').value.trim();
    const status = document.getElementById('decision-status').value;
    const owner = document.getElementById('decision-owner').value.trim();
    const impact = document.getElementById('decision-impact').value.trim();
    const rationale = document.getElementById('decision-rationale').value.trim();
    const decisionDate = document.getElementById('decision-date').value;
    
    if (!title || !description || !owner || !impact) {
        showToast('Validation Error', 'Please fill in title, description, owner, and impact', 'error');
        return;
    }
    
    const decision = {
        title, description, status, owner, impact, rationale, decisionDate,
        reviewDate: new Date().toISOString().split('T')[0],
        relatedObjects: [],
        alternatives: [],
        evidenceRefs: []
    };
    
    if (id) {
        engagementManager.updateEntity('decisions', id, decision);
    } else {
        engagementManager.addEntity('decisions', decision);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeDecisionModal();
    renderDecisions();
    updateKPIs();
    
    showToast('Decision Saved', id ? `Updated ${title}` : `Added ${title}`, 'success');
}

function renderDecisions() {
    const decisions = engagementManager.getEntities('decisions') || [];
    const container = document.getElementById('decisions-container');
    
    if (decisions.length === 0) {
        container.innerHTML = `
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                <i class="fas fa-gavel"></i> Decisions
            </h4>
            <div class="empty-state" style="padding: 20px;">
                <div class="empty-state-text">No decisions recorded</div>
            </div>
        `;
        return;
    }
    
    const getStatusColor = (status) => {
        const colors = {
            proposed: 'gray',
            'under-review': 'yellow',
            approved: 'green',
            rejected: 'red',
            deferred: 'gray'
        };
        return colors[status] || 'gray';
    };
    
    container.innerHTML = `
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #374151;">
            <i class="fas fa-gavel"></i> Decisions (${decisions.length})
        </h4>
        <div style="display: grid; gap: 12px;">
            ${decisions.map(dec => `
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${dec.title}</div>
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${dec.description}</div>
                            <div style="font-size: 12px; color: #6b7280;">
                                <strong>Impact:</strong> ${dec.impact}
                            </div>
                            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                                <strong>Owner:</strong> ${dec.owner} ${dec.decisionDate ? `| <strong>Date:</strong> ${dec.decisionDate}` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="badge badge-${getStatusColor(dec.status)}">${dec.status}</span>
                            <button onclick="openDecisionModal('${dec.id}')" class="btn btn-ghost btn-sm" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteEntity('decisions', '${dec.id}')" class="btn btn-ghost btn-sm" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTRAINT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openConstraintModal(id = null) {
    document.getElementById('constraint-edit-id').value = id || '';
    
    if (id) {
        const constraint = engagementManager.getEntity('constraints', id);
        if (constraint) {
            document.getElementById('constraint-modal-title').textContent = 'Edit Constraint';
            document.getElementById('constraint-title').value = constraint.title || '';
            document.getElementById('constraint-description').value = constraint.description || '';
            document.getElementById('constraint-type').value = constraint.type || 'technical';
            document.getElementById('constraint-severity').value = constraint.severity || 'medium';
            document.getElementById('constraint-owner').value = constraint.owner || '';
            document.getElementById('constraint-workaround').value = constraint.workaround || '';
        }
    } else {
        document.getElementById('constraint-modal-title').textContent = 'Add Constraint';
        document.getElementById('constraint-title').value = '';
        document.getElementById('constraint-description').value = '';
        document.getElementById('constraint-type').value = 'technical';
        document.getElementById('constraint-severity').value = 'medium';
        document.getElementById('constraint-owner').value = '';
        document.getElementById('constraint-workaround').value = '';
    }
    
    document.getElementById('constraintModal').classList.remove('hidden');
}

function closeConstraintModal() {
    document.getElementById('constraintModal').classList.add('hidden');
}

function saveConstraint() {
    const id = document.getElementById('constraint-edit-id').value;
    const title = document.getElementById('constraint-title').value.trim();
    const description = document.getElementById('constraint-description').value.trim();
    const type = document.getElementById('constraint-type').value;
    const severity = document.getElementById('constraint-severity').value;
    const owner = document.getElementById('constraint-owner').value.trim();
    const workaround = document.getElementById('constraint-workaround').value.trim();
    
    if (!title || !description) {
        showToast('Validation Error', 'Please fill in title and description', 'error');
        return;
    }
    
    const constraint = {
        title, description, type, severity, owner, workaround,
        relatedObjects: []
    };
    
    if (id) {
        engagementManager.updateEntity('constraints', id, constraint);
    } else {
        engagementManager.addEntity('constraints', constraint);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeConstraintModal();
    renderConstraints();
    updateKPIs();
    
    showToast('Constraint Saved', id ? `Updated ${title}` : `Added ${title}`, 'success');
}

function renderConstraints() {
    const constraints = engagementManager.getEntities('constraints') || [];
    const container = document.getElementById('constraints-container');
    
    if (constraints.length === 0) {
        container.innerHTML = `
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                <i class="fas fa-ban"></i> Constraints
            </h4>
            <div class="empty-state" style="padding: 20px;">
                <div class="empty-state-text">No constraints defined</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #374151;">
            <i class="fas fa-ban"></i> Constraints (${constraints.length})
        </h4>
        <div style="display: grid; gap: 12px;">
            ${constraints.map(con => `
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${con.title}</div>
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${con.description}</div>
                            <div style="display: flex; gap: 12px; font-size: 12px; color: #6b7280;">
                                <span><strong>Type:</strong> ${con.type}</span>
                                <span><strong>Severity:</strong> ${con.severity}</span>
                                ${con.owner ? `<span><strong>Owner:</strong> ${con.owner}</span>` : ''}
                            </div>
                            ${con.workaround ? `<div style="font-size: 12px; color: #6b7280; margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px;">
                                <strong>Workaround:</strong> ${con.workaround}
                            </div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="badge badge-${con.severity === 'critical' ? 'red' : con.severity === 'high' ? 'yellow' : 'gray'}">${con.severity}</span>
                            <button onclick="openConstraintModal('${con.id}')" class="btn btn-ghost btn-sm" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteEntity('constraints', '${con.id}')" class="btn btn-ghost btn-sm" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// ASSUMPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function openAssumptionModal(id = null) {
    document.getElementById('assumption-edit-id').value = id || '';
    
    if (id) {
        const assumption = engagementManager.getEntity('assumptions', id);
        if (assumption) {
            document.getElementById('assumption-modal-title').textContent = 'Edit Assumption';
            document.getElementById('assumption-title').value = assumption.title || '';
            document.getElementById('assumption-description').value = assumption.description || '';
            document.getElementById('assumption-status').value = assumption.status || 'active';
            document.getElementById('assumption-impact').value = assumption.impact || 'medium';
            document.getElementById('assumption-validated-by').value = assumption.validatedBy || '';
            document.getElementById('assumption-validation-date').value = assumption.validationDate || '';
        }
    } else {
        document.getElementById('assumption-modal-title').textContent = 'Add Assumption';
        document.getElementById('assumption-title').value = '';
        document.getElementById('assumption-description').value = '';
        document.getElementById('assumption-status').value = 'active';
        document.getElementById('assumption-impact').value = 'medium';
        document.getElementById('assumption-validated-by').value = '';
        document.getElementById('assumption-validation-date').value = '';
    }
    
    document.getElementById('assumptionModal').classList.remove('hidden');
}

function closeAssumptionModal() {
    document.getElementById('assumptionModal').classList.add('hidden');
}

function saveAssumption() {
    const id = document.getElementById('assumption-edit-id').value;
    const title = document.getElementById('assumption-title').value.trim();
    const description = document.getElementById('assumption-description').value.trim();
    const status = document.getElementById('assumption-status').value;
    const impact = document.getElementById('assumption-impact').value;
    const validatedBy = document.getElementById('assumption-validated-by').value.trim();
    const validationDate = document.getElementById('assumption-validation-date').value;
    
    if (!title || !description) {
        showToast('Validation Error', 'Please fill in title and description', 'error');
        return;
    }
    
    const assumption = {
        title, description, status, impact, validatedBy, validationDate,
        relatedObjects: [],
        evidenceRefs: []
    };
    
    if (id) {
        engagementManager.updateEntity('assumptions', id, assumption);
    } else {
        engagementManager.addEntity('assumptions', assumption);
    }
    
    currentEngagement = engagementManager.getCurrentEngagement();
    closeAssumptionModal();
    renderAssumptions();
    updateKPIs();
    
    showToast('Assumption Saved', id ? `Updated ${title}` : `Added ${title}`, 'success');
}

function renderAssumptions() {
    const assumptions = engagementManager.getEntities('assumptions') || [];
    const container = document.getElementById('assumptions-container');
    
    if (assumptions.length === 0) {
        container.innerHTML = `
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #374151;">
                <i class="fas fa-question-circle"></i> Assumptions
            </h4>
            <div class="empty-state" style="padding: 20px;">
                <div class="empty-state-text">No assumptions defined</div>
            </div>
        `;
        return;
    }
    
    const getStatusColor = (status) => {
        const colors = {
            active: 'yellow',
            validated: 'green',
            invalidated: 'red',
            retired: 'gray'
        };
        return colors[status] || 'gray';
    };
    
    container.innerHTML = `
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #374151;">
            <i class="fas fa-question-circle"></i> Assumptions (${assumptions.length})
        </h4>
        <div style="display: grid; gap: 12px;">
            ${assumptions.map(asmp => `
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${asmp.title}</div>
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${asmp.description}</div>
                            <div style="display: flex; gap: 12px; font-size: 12px; color: #6b7280;">
                                <span><strong>Impact:</strong> ${asmp.impact}</span>
                                ${asmp.validatedBy ? `<span><strong>Validated By:</strong> ${asmp.validatedBy}</span>` : ''}
                                ${asmp.validationDate ? `<span><strong>Date:</strong> ${asmp.validationDate}</span>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="badge badge-${getStatusColor(asmp.status)}">${asmp.status}</span>
                            <button onclick="openAssumptionModal('${asmp.id}')" class="btn btn-ghost btn-sm" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteEntity('assumptions', '${asmp.id}')" class="btn btn-ghost btn-sm" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function deleteEntity(entityType, id) {
    const entityName = entityType.slice(0, -1); // Remove trailing 's'
    if (confirm(`Delete this ${entityName}? This cannot be undone.`)) {
        engagementManager.deleteEntity(entityType, id);
        currentEngagement = engagementManager.getCurrentEngagement();
        
        // Re-render the appropriate view
        if (entityType === 'risks') renderRisks();
        if (entityType === 'decisions') renderDecisions();
        if (entityType === 'constraints') renderConstraints();
        if (entityType === 'assumptions') renderAssumptions();
        
        updateKPIs();
        showToast(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} Deleted`, 'The item has been removed', 'info');
    }
}
