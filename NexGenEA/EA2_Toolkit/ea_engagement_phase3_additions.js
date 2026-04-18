/**
 * EA Engagement Playbook - Phase 3: Agile Execution Model
 * Implements Phase, Story, RoadmapItem, and Customer management
 * @version 1.0
 * @date 2026-04-18
 */

console.log('✓ EA Engagement Phase 3 (Agile Execution) loading...');

// ═══════════════════════════════════════════════════════════════════
// PHASE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Open phase modal for create/edit
 */
function openPhaseModal(phaseId = null) {
    const modal = document.getElementById('phaseModal');
    const title = document.getElementById('phaseModalTitle');
    const form = document.getElementById('phaseForm');
    
    if (phaseId) {
        // Edit mode
        title.textContent = 'Edit Phase';
        const phase = engagementManager.getEntity('phases', phaseId);
        if (phase) {
            document.getElementById('phase-id').value = phase.id;
            document.getElementById('phase-name').value = phase.name;
            document.getElementById('phase-description').value = phase.description || '';
            document.getElementById('phase-status').value = phase.status;
            document.getElementById('phase-start-date').value = phase.startDate || '';
            document.getElementById('phase-end-date').value = phase.endDate || '';
            document.getElementById('phase-order').value = phase.order;
        }
    } else {
        // Create mode
        title.textContent = 'Create New Phase';
        form.reset();
        // Auto-generate next phase ID
        const phases = engagementManager.getEntities('phases') || [];
        const nextOrder = phases.length;
        document.getElementById('phase-id').value = `E${nextOrder}`;
        document.getElementById('phase-order').value = nextOrder;
    }
    
    modal.classList.remove('hidden');
}

/**
 * Close phase modal
 */
function closePhaseModal() {
    document.getElementById('phaseModal').classList.add('hidden');
    document.getElementById('phaseForm').reset();
}

/**
 * Save phase (create or update)
 */
function savePhase() {
    const phaseId = document.getElementById('phase-id').value;
    
    const phase = {
        id: phaseId,
        name: document.getElementById('phase-name').value,
        description: document.getElementById('phase-description').value,
        status: document.getElementById('phase-status').value,
        startDate: document.getElementById('phase-start-date').value,
        endDate: document.getElementById('phase-end-date').value,
        order: parseInt(document.getElementById('phase-order').value),
        stories: engagementManager.getEntity('phases', phaseId)?.stories || []
    };
    
    engagementManager.saveEntity('phases', phase);
    closePhaseModal();
    renderPhases();
    updateKPIs();
    showToast('Phase saved successfully', 'success');
}

/**
 * Delete phase
 */
function deletePhase(phaseId) {
    if (confirm('Delete this phase? All linked stories will remain but be unlinked.')) {
        // Unlink stories
        const stories = engagementManager.getEntities('stories') || [];
        stories.filter(s => s.phaseId === phaseId).forEach(story => {
            story.phaseId = null;
            engagementManager.saveEntity('stories', story);
        });
        
        engagementManager.deleteEntity('phases', phaseId);
        renderPhases();
        updateKPIs();
        showToast('Phase deleted', 'info');
    }
}

/**
 * Render phase status board
 */
function renderPhases() {
    const container = document.getElementById('phase-board');
    if (!container) return;
    
    const phases = (engagementManager.getEntities('phases') || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (phases.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="empty-state-title">No phases defined</div>
                <div class="empty-state-text">Create phases to organize your engagement execution</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${phases.map(phase => {
                const stories = (engagementManager.getEntities('stories') || []).filter(s => s.phaseId === phase.id);
                const completedStories = stories.filter(s => s.status === 'done').length;
                const totalStories = stories.length;
                const progress = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;
                
                const statusColors = {
                    'not-started': { bg: '#f3f4f6', text: '#374151', icon: 'fa-circle' },
                    'in-progress': { bg: '#dbeafe', text: '#1e40af', icon: 'fa-spinner' },
                    'completed': { bg: '#d1fae5', text: '#065f46', icon: 'fa-check-circle' }
                };
                const color = statusColors[phase.status] || statusColors['not-started'];
                
                return `
                    <div style="background: white; border: 2px solid ${color.bg === '#f3f4f6' ? '#e5e7eb' : color.bg}; border-radius: 12px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div>
                                <div style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                                    ${phase.id}
                                </div>
                                <div style="font-size: 14px; font-weight: 600; color: #374151;">
                                    ${phase.name}
                                </div>
                            </div>
                            <div class="btn-group">
                                <button class="btn-icon" onclick="openPhaseModal('${phase.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="deletePhase('${phase.id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div style="padding: 8px 12px; background: ${color.bg}; color: ${color.text}; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 12px; display: inline-flex; align-items: center; gap: 6px;">
                            <i class="fas ${color.icon}"></i>
                            ${phase.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.5;">
                            ${phase.description || 'No description'}
                        </p>
                        
                        ${phase.startDate || phase.endDate ? `
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
                                <i class="fas fa-calendar"></i> 
                                ${phase.startDate ? new Date(phase.startDate).toLocaleDateString() : '—'} 
                                → 
                                ${phase.endDate ? new Date(phase.endDate).toLocaleDateString() : '—'}
                            </div>
                        ` : ''}
                        
                        <div style="margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                <span>${totalStories} ${totalStories === 1 ? 'Story' : 'Stories'}</span>
                                <span>${progress}% Complete</span>
                            </div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="background: linear-gradient(90deg, #6366f1, #8b5cf6); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        
                        <button class="btn btn-sm btn-ghost" onclick="openStoryModal(null, '${phase.id}')" style="width: 100%; margin-top: 12px;">
                            <i class="fas fa-plus"></i> Add Story
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// STORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Open story modal for create/edit
 */
function openStoryModal(storyId = null, preselectedPhaseId = null) {
    const modal = document.getElementById('storyModal');
    const title = document.getElementById('storyModalTitle');
    const form = document.getElementById('storyForm');
    
    // Populate phase dropdown
    const phases = engagementManager.getEntities('phases') || [];
    const phaseSelect = document.getElementById('story-phase');
    phaseSelect.innerHTML = '<option value="">Select Phase...</option>' +
        phases.sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(p => `<option value="${p.id}">${p.id} - ${p.name}</option>`)
              .join('');
    
    if (storyId) {
        // Edit mode
        title.textContent = 'Edit Story';
        const story = engagementManager.getEntity('stories', storyId);
        if (story) {
            document.getElementById('story-id').value = story.id;
            document.getElementById('story-title').value = story.title;
            document.getElementById('story-description').value = story.description || '';
            document.getElementById('story-phase').value = story.phaseId || '';
            document.getElementById('story-status').value = story.status;
            document.getElementById('story-assigned').value = story.assignedTo || '';
            document.getElementById('story-acceptance').value = (story.acceptanceCriteria || []).join('\n');
        }
    } else {
        // Create mode
        title.textContent = 'Create New Story';
        form.reset();
        
        // Auto-generate story ID
        const stories = engagementManager.getEntities('stories') || [];
        const nextNum = stories.length + 1;
        document.getElementById('story-id').value = `STORY-${String(nextNum).padStart(4, '0')}`;
        
        // Preselect phase if provided
        if (preselectedPhaseId) {
            document.getElementById('story-phase').value = preselectedPhaseId;
        }
    }
    
    modal.classList.remove('hidden');
}

/**
 * Close story modal
 */
function closeStoryModal() {
    document.getElementById('storyModal').classList.add('hidden');
    document.getElementById('storyForm').reset();
}

/**
 * Save story (create or update)
 */
function saveStory() {
    const storyId = document.getElementById('story-id').value;
    const acceptanceCriteria = document.getElementById('story-acceptance').value
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    
    const story = {
        id: storyId,
        title: document.getElementById('story-title').value,
        description: document.getElementById('story-description').value,
        phaseId: document.getElementById('story-phase').value,
        status: document.getElementById('story-status').value,
        assignedTo: document.getElementById('story-assigned').value,
        acceptanceCriteria: acceptanceCriteria,
        artifactId: engagementManager.getEntity('stories', storyId)?.artifactId || null,
        evidenceRefs: engagementManager.getEntity('stories', storyId)?.evidenceRefs || []
    };
    
    // Update phase's stories array
    if (story.phaseId) {
        const phase = engagementManager.getEntity('phases', story.phaseId);
        if (phase) {
            if (!phase.stories) phase.stories = [];
            if (!phase.stories.includes(storyId)) {
                phase.stories.push(storyId);
                engagementManager.saveEntity('phases', phase);
            }
        }
    }
    
    engagementManager.saveEntity('stories', story);
    closeStoryModal();
    renderStories();
    renderPhases();
    updateKPIs();
    showToast('Story saved successfully', 'success');
}

/**
 * Delete story
 */
function deleteStory(storyId) {
    if (confirm('Delete this story?')) {
        const story = engagementManager.getEntity('stories', storyId);
        
        // Remove from phase
        if (story && story.phaseId) {
            const phase = engagementManager.getEntity('phases', story.phaseId);
            if (phase && phase.stories) {
                phase.stories = phase.stories.filter(id => id !== storyId);
                engagementManager.saveEntity('phases', phase);
            }
        }
        
        engagementManager.deleteEntity('stories', storyId);
        renderStories();
        renderPhases();
        updateKPIs();
        showToast('Story deleted', 'info');
    }
}

/**
 * Update story status (for drag-and-drop or quick update)
 */
function updateStoryStatus(storyId, newStatus) {
    const story = engagementManager.getEntity('stories', storyId);
    if (story) {
        story.status = newStatus;
        engagementManager.saveEntity('stories', story);
        renderStories();
        renderPhases();
        updateKPIs();
    }
}

/**
 * Render story Kanban board
 */
function renderStories() {
    const container = document.getElementById('story-board');
    if (!container) return;
    
    const stories = engagementManager.getEntities('stories') || [];
    const phases = engagementManager.getEntities('phases') || [];
    
    const columns = [
        { id: 'backlog', name: 'Backlog', icon: 'fa-inbox', color: '#f3f4f6' },
        { id: 'in-progress', name: 'In Progress', icon: 'fa-spinner', color: '#dbeafe' },
        { id: 'review', name: 'Review', icon: 'fa-eye', color: '#fef3c7' },
        { id: 'done', name: 'Done', icon: 'fa-check-circle', color: '#d1fae5' }
    ];
    
    if (stories.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>
                <div class="empty-state-title">No stories defined</div>
                <div class="empty-state-text">Create user stories and track them on the Kanban board</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            ${columns.map(column => {
                const columnStories = stories.filter(s => s.status === column.id);
                
                return `
                    <div style="background: ${column.color}; border-radius: 12px; padding: 16px; min-height: 400px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                            <i class="fas ${column.icon}" style="color: #374151;"></i>
                            <h4 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">
                                ${column.name}
                            </h4>
                            <span style="background: white; color: #6b7280; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 10px; margin-left: auto;">
                                ${columnStories.length}
                            </span>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${columnStories.map(story => {
                                const phase = phases.find(p => p.id === story.phaseId);
                                return `
                                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; cursor: pointer; transition: box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'" onclick="openStoryModal('${story.id}')">
                                        ${phase ? `<div style="font-size: 10px; font-weight: 700; color: #6366f1; margin-bottom: 6px;">${phase.id}</div>` : ''}
                                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 6px; line-height: 1.4;">
                                            ${story.title}
                                        </div>
                                        ${story.assignedTo ? `
                                            <div style="font-size: 11px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
                                                <i class="fas fa-user"></i> ${story.assignedTo}
                                            </div>
                                        ` : ''}
                                        ${story.acceptanceCriteria && story.acceptanceCriteria.length > 0 ? `
                                            <div style="font-size: 11px; color: #6b7280; margin-top: 6px;">
                                                <i class="fas fa-check-square"></i> ${story.acceptanceCriteria.length} criteria
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('') || '<div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px;">No stories</div>'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// ROADMAP ITEM MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Open roadmap item modal for create/edit
 */
function openRoadmapItemModal(itemId = null, preselectedInitiativeId = null) {
    const modal = document.getElementById('roadmapItemModal');
    const title = document.getElementById('roadmapItemModalTitle');
    const form = document.getElementById('roadmapItemForm');
    
    // Populate initiative dropdown
    const initiativeSelect = document.getElementById('roadmapitem-initiative');
    const initiatives = engagementManager.getEntities('initiatives') || [];
    initiativeSelect.innerHTML = '<option value="">Select Initiative...</option>' +
        initiatives.map(init => `<option value="${init.id}">${init.id} - ${init.name}</option>`).join('');
    
    if (itemId) {
        // Edit mode
        title.textContent = 'Edit Roadmap Item';
        const item = engagementManager.getEntity('roadmapItems', itemId);
        if (item) {
            document.getElementById('roadmapitem-id').value = item.id;
            document.getElementById('roadmapitem-name').value = item.name;
            document.getElementById('roadmapitem-initiative').value = item.initiativeId;
            document.getElementById('roadmapitem-quarter').value = item.quarter;
            document.getElementById('roadmapitem-wave').value = item.wave || '';
            document.getElementById('roadmapitem-status').value = item.status;
            document.getElementById('roadmapitem-start-date').value = item.startDate || '';
            document.getElementById('roadmapitem-end-date').value = item.endDate || '';
            document.getElementById('roadmapitem-dependencies').value = (item.dependencies || []).join(', ');
        }
    } else {
        // Create mode
        title.textContent = 'Create Roadmap Item';
        form.reset();
        
        // Auto-generate next ID
        const items = engagementManager.getEntities('roadmapItems') || [];
        const nextNum = items.length + 1;
        document.getElementById('roadmapitem-id').value = `RM-${String(nextNum).padStart(3, '0')}`;
        
        // Pre-select initiative if provided
        if (preselectedInitiativeId) {
            document.getElementById('roadmapitem-initiative').value = preselectedInitiativeId;
        }
        
        // Default to next quarter
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
        const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
        const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
        document.getElementById('roadmapitem-quarter').value = `${nextYear}Q${nextQuarter}`;
    }
    
    modal.classList.remove('hidden');
}

/**
 * Close roadmap item modal
 */
function closeRoadmapItemModal() {
    document.getElementById('roadmapItemModal').classList.add('hidden');
    document.getElementById('roadmapItemForm').reset();
}

/**
 * Save roadmap item (create or update)
 */
function saveRoadmapItem() {
    const itemId = document.getElementById('roadmapitem-id').value;
    const dependenciesText = document.getElementById('roadmapitem-dependencies').value;
    const dependencies = dependenciesText ? dependenciesText.split(',').map(s => s.trim()).filter(s => s) : [];
    
    const item = {
        id: itemId,
        initiativeId: document.getElementById('roadmapitem-initiative').value,
        name: document.getElementById('roadmapitem-name').value,
        quarter: document.getElementById('roadmapitem-quarter').value,
        wave: parseInt(document.getElementById('roadmapitem-wave').value) || null,
        status: document.getElementById('roadmapitem-status').value,
        startDate: document.getElementById('roadmapitem-start-date').value,
        endDate: document.getElementById('roadmapitem-end-date').value,
        dependencies: dependencies,
        milestones: engagementManager.getEntity('roadmapItems', itemId)?.milestones || []
    };
    
    engagementManager.saveEntity('roadmapItems', item);
    closeRoadmapItemModal();
    renderRoadmapTimeline();
    updateKPIs();
    showToast('Roadmap item saved successfully', 'success');
}

/**
 * Delete roadmap item
 */
function deleteRoadmapItem(itemId) {
    if (confirm('Delete this roadmap item?')) {
        engagementManager.deleteEntity('roadmapItems', itemId);
        renderRoadmapTimeline();
        updateKPIs();
        showToast('Roadmap item deleted', 'info');
    }
}

/**
 * Render quarterly roadmap timeline
 */
function renderRoadmapTimeline() {
    const container = document.getElementById('roadmap-timeline-container');
    if (!container) return;
    
    const items = engagementManager.getEntities('roadmapItems') || [];
    const initiatives = engagementManager.getEntities('initiatives') || [];
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-calendar-alt"></i></div>
                <div class="empty-state-title">No roadmap items defined</div>
                <div class="empty-state-text">Create roadmap items to visualize your delivery timeline</div>
            </div>
        `;
        return;
    }
    
    // Group items by quarter
    const itemsByQuarter = {};
    items.forEach(item => {
        if (!itemsByQuarter[item.quarter]) {
            itemsByQuarter[item.quarter] = [];
        }
        itemsByQuarter[item.quarter].push(item);
    });
    
    // Sort quarters chronologically
    const quarters = Object.keys(itemsByQuarter).sort((a, b) => {
        const [yearA, qA] = a.split('Q');
        const [yearB, qB] = b.split('Q');
        return parseInt(yearA) - parseInt(yearB) || parseInt(qA) - parseInt(qB);
    });
    
    const statusColors = {
        'planned': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
        'active': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
        'completed': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
        'delayed': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
        'cancelled': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
    };
    
    container.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                <i class="fas fa-calendar-alt" style="color: #10b981; margin-right: 8px;"></i>
                Quarterly Roadmap Timeline
            </h3>
            <p style="font-size: 13px; color: #6b7280;">
                ${items.length} roadmap ${items.length === 1 ? 'item' : 'items'} across ${quarters.length} ${quarters.length === 1 ? 'quarter' : 'quarters'}
            </p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 32px;">
            ${quarters.map(quarter => {
                const quarterItems = itemsByQuarter[quarter];
                const [year, q] = quarter.split('Q');
                
                return `
                    <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; background: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6;">
                            <div>
                                <div style="font-size: 24px; font-weight: 700; color: #111827;">${quarter}</div>
                                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                                    ${quarterItems.length} ${quarterItems.length === 1 ? 'item' : 'items'}
                                </div>
                            </div>
                            <button class="btn btn-sm btn-secondary" onclick="openRoadmapItemModal(null, null)">
                                <i class="fas fa-plus"></i> Add Item
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                            ${quarterItems.map(item => {
                                const initiative = initiatives.find(i => i.id === item.initiativeId);
                                const color = statusColors[item.status] || statusColors['planned'];
                                const hasDependencies = item.dependencies && item.dependencies.length > 0;
                                
                                return `
                                    <div style="background: white; border: 2px solid ${color.border}; border-radius: 10px; padding: 16px; position: relative;">
                                        ${item.wave ? `<div style="position: absolute; top: 8px; right: 8px; background: #6366f1; color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px;">Wave ${item.wave}</div>` : ''}
                                        
                                        <div style="margin-bottom: 12px;">
                                            <div style="font-size: 11px; font-weight: 700; color: #6b7280; margin-bottom: 4px;">${item.id}</div>
                                            <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 8px; line-height: 1.4;">
                                                ${item.name}
                                            </div>
                                        </div>
                                        
                                        ${initiative ? `
                                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; padding: 6px 10px; background: #f9fafb; border-radius: 6px;">
                                                <i class="fas fa-lightbulb" style="color: #f59e0b;"></i> ${initiative.name}
                                            </div>
                                        ` : ''}
                                        
                                        <div style="padding: 6px 12px; background: ${color.bg}; color: ${color.text}; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 12px; display: inline-flex; align-items: center; gap: 6px;">
                                            ${item.status.replace('-', ' ').toUpperCase()}
                                        </div>
                                        
                                        ${item.startDate || item.endDate ? `
                                            <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">
                                                <i class="fas fa-calendar"></i> 
                                                ${item.startDate ? new Date(item.startDate).toLocaleDateString() : '—'} 
                                                → 
                                                ${item.endDate ? new Date(item.endDate).toLocaleDateString() : '—'}
                                            </div>
                                        ` : ''}
                                        
                                        ${hasDependencies ? `
                                            <div style="font-size: 11px; color: #6b7280; margin-bottom: 12px;">
                                                <i class="fas fa-link"></i> Depends on: ${item.dependencies.join(', ')}
                                            </div>
                                        ` : ''}
                                        
                                        <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
                                            <button class="btn btn-sm btn-ghost" onclick="openRoadmapItemModal('${item.id}')" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-ghost" onclick="deleteRoadmapItem('${item.id}')" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

console.log('✓ EA Engagement Phase 3 loaded');
