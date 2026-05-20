/**
 * EA Engagement - Growth Dashboard Bridge
 * Syncs opportunities from Growth Dashboard to Engagement Playbook Decisions
 * 
 * RELATIONSHIP:
 * - Growth Dashboard: "Shape the Opportunity" story contains opportunities (may not be in CRM)
 * - Engagement Playbook: "Decisions" tab represents approved opportunities (CRM-sync ready)
 * 
 * @version 1.0
 * @date 2026-05-13
 */

// ═══════════════════════════════════════════════════════════════════
// GROWTH DASHBOARD OPPORTUNITY SCANNER
// ═══════════════════════════════════════════════════════════════════

/**
 * Scan localStorage for Growth Dashboard opportunities
 * @returns {Array} Array of opportunity objects
 */
function scanGrowthDashboardOpportunities() {
    const opportunities = [];
    const prefix = 'ea_opportunity_';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                opportunities.push(data);
            } catch (e) {
                console.warn(`Failed to parse opportunity: ${key}`, e);
            }
        }
    }
    
    return opportunities;
}

/**
 * Get opportunities for a specific account
 * @param {string} accountId - Account ID (e.g., ACC-001)
 * @returns {Array} Filtered opportunities
 */
function getAccountOpportunities(accountId) {
    const all = scanGrowthDashboardOpportunities();
    return accountId ? all.filter(opp => opp.accountId === accountId) : all;
}

// ═══════════════════════════════════════════════════════════════════
// OPPORTUNITY → DECISION TRANSFORMATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Transform Growth Dashboard opportunity into Engagement Playbook decision
 * @param {Object} opportunity - Opportunity object from Growth Dashboard
 * @returns {Object} Decision object for Engagement Playbook
 */
function transformOpportunityToDecision(opportunity) {
    // Map opportunity status to decision status
    const statusMap = {
        'discovery': 'proposed',
        'qualified': 'under-review',
        'proposal': 'under-review',
        'negotiation': 'under-review',
        'closed-won': 'approved',
        'closed-lost': 'rejected'
    };
    
    // Calculate impact level based on estimated value
    let impactLevel = 'low';
    if (opportunity.estimatedValue > 500000) impactLevel = 'high';
    else if (opportunity.estimatedValue > 100000) impactLevel = 'medium';
    
    // Build impact description
    const impactDesc = `Estimated value: €${opportunity.estimatedValue?.toLocaleString() || 0}. ` +
                      `Probability: ${opportunity.probability || 50}%. ` +
                      `Stage: ${opportunity.stage || 'discovery'}.`;
    
    // Build rationale from value case
    let rationale = 'Opportunity identified from Growth Dashboard.';
    if (opportunity.valueCase) {
        rationale += ` Value case: ${opportunity.valueCase}`;
    }
    if (opportunity.nextSteps && opportunity.nextSteps.length > 0) {
        rationale += ` Next steps: ${opportunity.nextSteps.join('; ')}`;
    }
    
    return {
        title: opportunity.name,
        description: `${opportunity.name} (Stage: ${opportunity.stage || 'discovery'})`,
        status: statusMap[opportunity.status] || 'proposed',
        owner: opportunity.sponsor || 'Growth Team',
        decisionDate: opportunity.closeDate || new Date().toISOString().split('T')[0],
        reviewDate: new Date().toISOString().split('T')[0],
        impact: impactDesc,
        rationale: rationale,
        relatedObjects: opportunity.linkedInitiatives || [],
        alternatives: opportunity.competitors || [],
        evidenceRefs: [],
        // Tracking metadata for sync
        metadata: {
            source: 'growth-dashboard',
            opportunityId: opportunity.id,
            syncedAt: new Date().toISOString(),
            estimatedValue: opportunity.estimatedValue,
            probability: opportunity.probability,
            crmStatus: opportunity.crmStatus || 'not-synced'
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// DUPLICATE DETECTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if decision already exists for this opportunity
 * @param {string} opportunityId - Opportunity ID (OPP-###)
 * @param {Array} existingDecisions - Current decisions in engagement
 * @returns {Object|null} Existing decision or null
 */
function findExistingDecisionForOpportunity(opportunityId, existingDecisions) {
    return existingDecisions.find(dec => 
        dec.metadata && dec.metadata.opportunityId === opportunityId
    );
}

/**
 * Calculate Dice coefficient similarity between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1;
    if (s1.length < 2 || s2.length < 2) return 0;
    
    const bigrams1 = new Set();
    for (let i = 0; i < s1.length - 1; i++) {
        bigrams1.add(s1.substring(i, i + 2));
    }
    
    const bigrams2 = new Set();
    for (let i = 0; i < s2.length - 1; i++) {
        bigrams2.add(s2.substring(i, i + 2));
    }
    
    const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
    return (2.0 * intersection.size) / (bigrams1.size + bigrams2.size);
}

/**
 * Check if decision title is similar to existing decisions
 * @param {string} title - Decision title to check
 * @param {Array} existingDecisions - Current decisions
 * @param {number} threshold - Similarity threshold (default 0.8)
 * @returns {Object|null} Similar decision or null
 */
function findSimilarDecision(title, existingDecisions, threshold = 0.8) {
    for (const dec of existingDecisions) {
        const similarity = calculateSimilarity(title, dec.title);
        if (similarity >= threshold) {
            return { decision: dec, similarity };
        }
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════
// SYNC WORKFLOW
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze opportunities and prepare sync preview
 * @param {string} accountId - Optional account filter
 * @returns {Object} Preview data with actions
 */
function analyzeOpportunitiesForSync(accountId = null) {
    const opportunities = accountId ? getAccountOpportunities(accountId) : scanGrowthDashboardOpportunities();
    const existingDecisions = engagementManager.getEntities('decisions') || [];
    
    const preview = {
        total: opportunities.length,
        toCreate: [],
        toUpdate: [],
        duplicates: [],
        skipped: []
    };
    
    opportunities.forEach(opp => {
        // Check if already synced
        const existing = findExistingDecisionForOpportunity(opp.id, existingDecisions);
        
        if (existing) {
            // Check if opportunity has been updated
            const oppUpdated = new Date(opp.metadata?.updatedAt || 0);
            const decSynced = new Date(existing.metadata?.syncedAt || 0);
            
            if (oppUpdated > decSynced) {
                preview.toUpdate.push({
                    opportunity: opp,
                    existingDecision: existing,
                    changes: detectChanges(opp, existing)
                });
            } else {
                preview.skipped.push({
                    opportunity: opp,
                    reason: 'Already synced (no changes)'
                });
            }
        } else {
            // Check for similar titles (fuzzy match)
            const similar = findSimilarDecision(opp.name, existingDecisions);
            
            if (similar) {
                preview.duplicates.push({
                    opportunity: opp,
                    similarDecision: similar.decision,
                    similarity: similar.similarity
                });
            } else {
                preview.toCreate.push({ opportunity: opp });
            }
        }
    });
    
    return preview;
}

/**
 * Detect changes between opportunity and decision
 * @param {Object} opportunity - Opportunity object
 * @param {Object} decision - Decision object
 * @returns {Array} List of changed fields
 */
function detectChanges(opportunity, decision) {
    const changes = [];
    
    if (opportunity.name !== decision.title) {
        changes.push({ field: 'title', old: decision.title, new: opportunity.name });
    }
    
    if (opportunity.status && opportunity.status !== decision.metadata?.lastStatus) {
        changes.push({ field: 'status', old: decision.status, new: opportunity.status });
    }
    
    if (opportunity.estimatedValue !== decision.metadata?.estimatedValue) {
        changes.push({ field: 'estimatedValue', old: decision.metadata?.estimatedValue, new: opportunity.estimatedValue });
    }
    
    return changes;
}

// ═══════════════════════════════════════════════════════════════════
// UI FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Open sync modal with preview
 */
function openGrowthDashboardSyncModal() {
    const opportunities = scanGrowthDashboardOpportunities();
    
    if (opportunities.length === 0) {
        showToast('No Opportunities', 'No opportunities found in Growth Dashboard', 'info');
        return;
    }
    
    const preview = analyzeOpportunitiesForSync();
    renderGrowthSyncPreviewModal(preview);
}

/**
 * Render sync preview modal
 * @param {Object} preview - Preview data from analysis
 */
function renderGrowthSyncPreviewModal(preview) {
    const modal = document.createElement('div');
    modal.id = 'growth-sync-modal';
    modal.className = 'modal-backdrop active';
    modal.style.zIndex = '10001';
    
    modal.innerHTML = `
        <div class="modal active" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2 class="modal-title">📊 Sync Opportunities from Growth Dashboard</h2>
                <button class="modal-close" onclick="document.getElementById('growth-sync-modal').remove()">×</button>
            </div>
            
            <div class="modal-content">
                <div style="margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                        <div style="text-align: center; padding: 12px; background: #f0fdf4; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: 700; color: #10b981;">${preview.toCreate.length}</div>
                            <div style="font-size: 11px; color: #6b7280;">New</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${preview.toUpdate.length}</div>
                            <div style="font-size: 11px; color: #6b7280;">Updates</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: #fee2e2; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${preview.duplicates.length}</div>
                            <div style="font-size: 11px; color: #6b7280;">Duplicates</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: #f3f4f6; border-radius: 6px;">
                            <div style="font-size: 24px; font-weight: 700; color: #6b7280;">${preview.skipped.length}</div>
                            <div style="font-size: 11px; color: #6b7280;">Skipped</div>
                        </div>
                    </div>
                </div>
                
                ${preview.toCreate.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="select-all-new" checked onchange="toggleAllCheckboxes('new', this.checked)" style="cursor: pointer;">
                        <label for="select-all-new" style="cursor: pointer;">✅ New Opportunities (${preview.toCreate.length})</label>
                    </div>
                    <div id="new-opportunities-list">
                        ${preview.toCreate.map((item, idx) => `
                            <div style="padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 6px; background: white;">
                                <div style="display: flex; align-items: start; gap: 8px;">
                                    <input type="checkbox" 
                                           class="sync-checkbox-new" 
                                           data-index="${idx}" 
                                           checked 
                                           style="margin-top: 3px; cursor: pointer;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 13px;">${item.opportunity.name}</div>
                                        <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                                            Value: €${item.opportunity.estimatedValue?.toLocaleString() || 0} • 
                                            Stage: ${item.opportunity.stage || 'discovery'} • 
                                            ID: ${item.opportunity.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${preview.toUpdate.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="select-all-update" checked onchange="toggleAllCheckboxes('update', this.checked)" style="cursor: pointer;">
                        <label for="select-all-update" style="cursor: pointer;">🔄 Updates (${preview.toUpdate.length})</label>
                    </div>
                    <div id="update-opportunities-list">
                        ${preview.toUpdate.map((item, idx) => `
                            <div style="padding: 10px; border: 1px solid #fcd34d; border-radius: 6px; margin-bottom: 6px; background: #fffbeb;">
                                <div style="display: flex; align-items: start; gap: 8px;">
                                    <input type="checkbox" 
                                           class="sync-checkbox-update" 
                                           data-index="${idx}" 
                                           checked 
                                           style="margin-top: 3px; cursor: pointer;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 13px;">${item.opportunity.name}</div>
                                        <div style="font-size: 11px; color: #78350f; margin-top: 2px;">
                                            Changes: ${item.changes.map(c => c.field).join(', ')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${preview.duplicates.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #ef4444;">
                        ⚠️ Potential Duplicates (${preview.duplicates.length})
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                        These opportunities have similar titles to existing decisions. Review carefully.
                    </div>
                    ${preview.duplicates.map(item => `
                        <div style="padding: 10px; border: 1px solid #fca5a5; border-radius: 6px; margin-bottom: 6px; background: #fef2f2;">
                            <div style="font-weight: 600; font-size: 13px; color: #dc2626;">${item.opportunity.name}</div>
                            <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">
                                Similar to: "${item.similarDecision.title}" (${(item.similarity * 100).toFixed(0)}% match)
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="document.getElementById('growth-sync-modal').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="executeGrowthDashboardSync()">
                        <i class="fas fa-sync"></i> Sync Selected
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store preview data for sync execution
    window._growthSyncPreview = preview;
}

/**
 * Toggle all checkboxes in a category
 */
function toggleAllCheckboxes(category, checked) {
    document.querySelectorAll(`.sync-checkbox-${category}`).forEach(cb => {
        cb.checked = checked;
    });
}

/**
 * Execute the sync based on user selections
 */
function executeGrowthDashboardSync() {
    const preview = window._growthSyncPreview;
    if (!preview) return;
    
    let created = 0;
    let updated = 0;
    
    // Process new opportunities
    document.querySelectorAll('.sync-checkbox-new:checked').forEach(checkbox => {
        const idx = parseInt(checkbox.dataset.index);
        const item = preview.toCreate[idx];
        if (item) {
            const decision = transformOpportunityToDecision(item.opportunity);
            engagementManager.addEntity('decisions', decision);
            created++;
        }
    });
    
    // Process updates
    document.querySelectorAll('.sync-checkbox-update:checked').forEach(checkbox => {
        const idx = parseInt(checkbox.dataset.index);
        const item = preview.toUpdate[idx];
        if (item) {
            const decision = transformOpportunityToDecision(item.opportunity);
            engagementManager.updateEntity('decisions', item.existingDecision.id, decision);
            updated++;
        }
    });
    
    // Close modal
    document.getElementById('growth-sync-modal').remove();
    
    // Show success message
    showToast('Sync Complete', `Created ${created} decisions, updated ${updated}`, 'success');
    
    // Refresh decisions list
    if (typeof renderDecisions === 'function') {
        renderDecisions();
    }
    
    // Clean up
    delete window._growthSyncPreview;
}

// console.log('✅ EA Engagement - Growth Dashboard Bridge loaded');
