/**
 * EA Engagement Playbook - Story Board (Execution Tab)
 * Manages backlog stories with 6-column kanban workflow
 * Each story can have multiple activities (sub-tasks)
 * 
 * @version 2.0
 * @date 2026-05-13
 */

// ═══════════════════════════════════════════════════════════════════
// KANBAN BOARD RENDERING
// ═══════════════════════════════════════════════════════════════════

/**
 * Main function to render the execution board with stories
 */
function renderExecutionBoard() {
    const container = document.getElementById('execution-board-container');
    if (!container) return;

    // Safety check: ensure engagementManager is initialized
    if (typeof engagementManager === 'undefined' || !engagementManager) {
        console.warn('engagementManager not initialized yet');
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-spinner fa-spin"></i></div>
                <div class="empty-state-title">Loading...</div>
                <div class="empty-state-text">Initializing engagement manager</div>
            </div>
        `;
        return;
    }

    // Get all stories from engagement manager
    const stories = engagementManager.getEntities('stories') || [];
    
    if (stories.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="fas fa-columns"></i></div>
                <div class="empty-state-title">No stories yet</div>
                <div class="empty-state-text">Add stories to track EA workflow execution</div>
                <button class="btn btn-primary" onclick="openStoryModal()" style="margin-top: 16px;">
                    <i class="fas fa-plus"></i> Add First Story
                </button>
            </div>
        `;
        return;
    }

    // Group stories by status
    const storyGroups = {
        'backlog': stories.filter(s => s.status === 'backlog'),
        'in-progress': stories.filter(s => s.status === 'in-progress'),
        'review': stories.filter(s => s.status === 'review'),
        'validated': stories.filter(s => s.status === 'validated'),
        'crm-updated': stories.filter(s => s.status === 'crm-updated'),
        'done': stories.filter(s => s.status === 'done')
    };

    // Sort stories by order within each group
    Object.keys(storyGroups).forEach(status => {
        storyGroups[status].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Render 6-column kanban board
    const columnsHtml = ACTIVITY_STATUS_COLUMNS.map(column => 
        renderKanbanColumn(column, storyGroups[column.id])
    ).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                    <i class="fas fa-clipboard-list"></i> Story Board
                </h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                    ${stories.length} ${stories.length === 1 ? 'story' : 'stories'} across 6 workflow stages
                </p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-ghost" onclick="filterStoriesByPhase()" title="Filter by phase">
                    <i class="fas fa-filter"></i> Filter
                </button>
                <button class="btn btn-primary" onclick="openStoryModal()">
                    <i class="fas fa-plus"></i> Add Story
                </button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; min-height: 400px;">
            ${columnsHtml}
        </div>
    `;

    // Initialize drag-and-drop after rendering
    initializeStoryDragAndDrop();
}

/**
 * Render a single kanban column with stories
 */
function renderKanbanColumn(column, stories) {
    const storiesHtml = stories.length > 0 
        ? stories.map(story => renderStoryCard(story)).join('')
        : `<div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 13px;">
               <i class="fas fa-inbox" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
               <div>No stories</div>
           </div>`;

    return `
        <div class="kanban-column" data-status="${column.id}">
            <div class="kanban-column-header" style="background: ${column.color}; color: white; padding: 12px; border-radius: 6px 6px 0 0;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas ${column.icon}"></i>
                        <span style="font-weight: 600; font-size: 14px;">${column.name}</span>
                    </div>
                    <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${stories.length}
                    </span>
                </div>
            </div>
            <div class="kanban-column-body" 
                 data-status="${column.id}"
                 ondrop="handleStoryDrop(event)" 
                 ondragover="handleStoryDragOver(event)"
                 ondragleave="handleStoryDragLeave(event)"
                 style="background: #f9fafb; padding: 12px; min-height: 300px; border: 2px dashed transparent; border-radius: 0 0 6px 6px;">
                ${storiesHtml}
            </div>
        </div>
    `;
}

/**
 * Render a single story card
 */
function renderStoryCard(story) {
    const phaseInfo = EA_WORKFLOW_PHASES.find(p => p.id === story.phaseType);
    const phaseBadge = phaseInfo 
        ? `<span style="background: ${phaseInfo.color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
               <i class="fas ${phaseInfo.icon}"></i> ${phaseInfo.name}
           </span>`
        : '';

    const priorityColor = {
        'low': '#6b7280',
        'medium': '#3b82f6',
        'high': '#f59e0b',
        'critical': '#ef4444'
    }[story.priority || 'medium'];

    const assignedBadge = story.assignedTo 
        ? `<div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
               <i class="fas fa-user-circle"></i> ${story.assignedTo}
           </div>`
        : '';

    const hoursBadge = story.estimatedHours 
        ? `<div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
               <i class="fas fa-clock"></i> ${story.estimatedHours}h
           </div>`
        : '';

    const crmIndicator = story.crmStatus === 'synced'
        ? `<i class="fas fa-check-circle" style="color: #10b981;" title="Synced to CRM"></i>`
        : story.crmStatus === 'pending'
        ? `<i class="fas fa-spinner fa-spin" style="color: #3b82f6;" title="Syncing to CRM"></i>`
        : story.crmStatus === 'failed'
        ? `<i class="fas fa-exclamation-circle" style="color: #ef4444;" title="CRM sync failed"></i>`
        : '';

    // Get child activities count
    const activities = engagementManager.getEntities('activities') || [];
    const storyActivities = activities.filter(a => a.storyId === story.id);
    const completedActivities = storyActivities.filter(a => a.completed).length;
    const activitiesBadge = storyActivities.length > 0
        ? `<div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
               <i class="fas fa-tasks"></i> ${completedActivities}/${storyActivities.length}
           </div>`
        : '';

    return `
        <div class="story-card" 
             data-story-id="${story.id}"
             draggable="true"
             ondragstart="handleStoryDragStart(event)"
             ondragend="handleStoryDragEnd(event)"
             onclick="openStoryModal('${story.id}')"
             style="background: white; border: 1px solid #e5e7eb; border-left: 4px solid ${priorityColor}; border-radius: 6px; padding: 12px; margin-bottom: 8px; cursor: move; transition: all 0.2s;">
            <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
                <div style="flex: 1; font-weight: 600; font-size: 14px; color: #111827; line-height: 1.4;">
                    ${story.title}
                </div>
                ${crmIndicator}
            </div>
            <div style="margin-bottom: 8px;">
                ${phaseBadge}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px;">
                ${assignedBadge}
                ${hoursBadge}
                ${activitiesBadge}
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// DRAG AND DROP HANDLERS
// ═══════════════════════════════════════════════════════════════════

let draggedStoryId = null;

function initializeStoryDragAndDrop() {
    // Event listeners are attached via inline handlers in HTML
    console.log('✓ Story drag-and-drop initialized');
}

function handleStoryDragStart(event) {
    const card = event.target.closest('.story-card');
    if (!card) return;
    
    draggedStoryId = card.dataset.storyId;
    card.style.opacity = '0.5';
    event.dataTransfer.effectAllowed = 'move';
}

function handleStoryDragEnd(event) {
    const card = event.target.closest('.story-card');
    if (card) {
        card.style.opacity = '1';
    }
    
    // Remove all drop zone highlights
    document.querySelectorAll('.kanban-column-body').forEach(col => {
        col.style.borderColor = 'transparent';
        col.style.background = '#f9fafb';
    });
}

function handleStoryDragOver(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    dropZone.style.borderColor = '#10b981';
    dropZone.style.background = '#f0fdf4';
    event.dataTransfer.dropEffect = 'move';
}

function handleStoryDragLeave(event) {
    const dropZone = event.currentTarget;
    dropZone.style.borderColor = 'transparent';
    dropZone.style.background = '#f9fafb';
}

function handleStoryDrop(event) {
    event.preventDefault();
    
    if (!draggedStoryId) return;
    
    const dropZone = event.currentTarget;
    const newStatus = dropZone.dataset.status;
    
    // Update story status
    const story = engagementManager.getEntities('stories').find(s => s.id === draggedStoryId);
    if (!story) return;
    
    const oldStatus = story.status;
    story.status = newStatus;
    story.updatedAt = new Date().toISOString();
    
    // Auto-update CRM status if moved to crm-updated column
    if (newStatus === 'crm-updated' && story.crmStatus === 'not-synced') {
        story.crmStatus = 'pending';
    }
    
    engagementManager.updateEntity('stories', story.id, story);
    
    // Show toast notification
    const columnName = ACTIVITY_STATUS_COLUMNS.find(c => c.id === newStatus).name;
    showToast('Story Moved', `Moved to ${columnName}`, 'success');
    
    // Reset drag state
    draggedStoryId = null;
    
    // Re-render board
    renderExecutionBoard();
}

// ═══════════════════════════════════════════════════════════════════
// STORY MODAL (ADD/EDIT)
// ═══════════════════════════════════════════════════════════════════

function openStoryModal(storyId = null) {
    const modal = document.getElementById('storyModal');
    if (!modal) return;
    
    const modalTitle = document.getElementById('story-modal-title');
    const deleteBtn = document.getElementById('story-delete-btn');
    
    if (storyId) {
        // Edit mode
        const story = engagementManager.getEntities('stories').find(s => s.id === storyId);
        if (!story) return;
        
        modalTitle.textContent = 'Edit Story';
        deleteBtn.style.display = 'block';
        
        // Populate form
        document.getElementById('story-edit-id').value = story.id;
        document.getElementById('story-title').value = story.title || '';
        document.getElementById('story-description').value = story.description || '';
        document.getElementById('story-phase').value = story.phaseType || 'discovery';
        document.getElementById('story-status').value = story.status || 'backlog';
        document.getElementById('story-assigned-to').value = story.assignedTo || '';
        document.getElementById('story-estimated-hours').value = story.estimatedHours || '';
        document.getElementById('story-priority').value = story.priority || 'medium';
        document.getElementById('story-deliverables').value = (story.deliverables || []).join('\n');
        document.getElementById('story-acceptance-criteria').value = (story.acceptanceCriteria || []).join('\n');
        
        // Render activities section
        renderStoryActivities(storyId);
    } else {
        // Add mode
        modalTitle.textContent = 'Add Story';
        deleteBtn.style.display = 'none';
        
        // Clear form
        document.getElementById('story-edit-id').value = '';
        document.getElementById('story-title').value = '';
        document.getElementById('story-description').value = '';
        document.getElementById('story-phase').value = 'discovery';
        document.getElementById('story-status').value = 'backlog';
        document.getElementById('story-assigned-to').value = '';
        document.getElementById('story-estimated-hours').value = '';
        document.getElementById('story-priority').value = 'medium';
        document.getElementById('story-deliverables').value = '';
        document.getElementById('story-acceptance-criteria').value = '';
        
        // Clear activities section
        const activitiesContainer = document.getElementById('story-activities-list');
        if (activitiesContainer) {
            activitiesContainer.innerHTML = '<p style="color: #6b7280; font-size: 13px;">Activities can be added after creating the story.</p>';
        }
    }
    
    modal.classList.remove('hidden');
}

function closeStoryModal() {
    const modal = document.getElementById('storyModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveStory() {
    const storyId = document.getElementById('story-edit-id').value;
    const title = document.getElementById('story-title').value.trim();
    
    if (!title) {
        alert('Story title is required');
        return;
    }
    
    const storyData = {
        title: title,
        description: document.getElementById('story-description').value.trim(),
        phaseType: document.getElementById('story-phase').value,
        status: document.getElementById('story-status').value,
        assignedTo: document.getElementById('story-assigned-to').value.trim(),
        estimatedHours: parseFloat(document.getElementById('story-estimated-hours').value) || 0,
        priority: document.getElementById('story-priority').value,
        deliverables: document.getElementById('story-deliverables').value.split('\n').filter(d => d.trim()),
        acceptanceCriteria: document.getElementById('story-acceptance-criteria').value.split('\n').filter(c => c.trim()),
        updatedAt: new Date().toISOString()
    };
    
    if (storyId) {
        // Update existing story
        engagementManager.updateEntity('stories', storyId, storyData);
        showToast('Story Updated', 'Story has been updated', 'success');
    } else {
        // Create new story
        storyData.createdAt = new Date().toISOString();
        storyData.crmStatus = 'not-synced';
        storyData.order = 0;
        engagementManager.addEntity('stories', storyData);
        showToast('Story Created', 'Story added to backlog', 'success');
    }
    
    closeStoryModal();
    renderExecutionBoard();
    updateKPIs();
}

function deleteStory() {
    const storyId = document.getElementById('story-edit-id').value;
    if (!storyId) return;
    
    const story = engagementManager.getEntities('stories').find(s => s.id === storyId);
    if (!story) return;
    
    if (!confirm(`Delete story "${story.title}"?\n\nThis will also delete all child activities.`)) {
        return;
    }
    
    // Delete child activities first
    const activities = engagementManager.getEntities('activities') || [];
    const childActivities = activities.filter(a => a.storyId === storyId);
    childActivities.forEach(activity => {
        engagementManager.deleteEntity('activities', activity.id);
    });
    
    // Delete story
    engagementManager.deleteEntity('stories', storyId);
    
    const activityMsg = childActivities.length > 0 ? ` and ${childActivities.length} ${childActivities.length === 1 ? 'activity' : 'activities'}` : '';
    showToast('Story Deleted', `Story${activityMsg} deleted`, 'info');
    
    closeStoryModal();
    renderExecutionBoard();
    updateKPIs();
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVITY MANAGEMENT (Sub-tasks of Story)
// ═══════════════════════════════════════════════════════════════════

function renderStoryActivities(storyId) {
    const container = document.getElementById('story-activities-list');
    if (!container) return;
    
    const activities = engagementManager.getEntities('activities') || [];
    const storyActivities = activities.filter(a => a.storyId === storyId).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (storyActivities.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; background: #f9fafb; border-radius: 6px; border: 1px dashed #d1d5db;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px 0;">No activities yet</p>
                <button class="btn btn-sm btn-primary" onclick="addActivity('${storyId}')">
                    <i class="fas fa-plus"></i> Add Activity
                </button>
            </div>
        `;
        return;
    }
    
    const activitiesHtml = storyActivities.map(activity => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px; background: ${activity.completed ? '#f0fdf4' : '#fff'}; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 6px;">
            <input type="checkbox" 
                   ${activity.completed ? 'checked' : ''} 
                   onchange="toggleActivity('${activity.id}')"
                   style="width: 16px; height: 16px; cursor: pointer;">
            <div style="flex: 1; font-size: 13px; color: ${activity.completed ? '#6b7280' : '#111827'}; ${activity.completed ? 'text-decoration: line-through;' : ''}">
                ${activity.title}
            </div>
            <div style="font-size: 12px; color: #6b7280;">
                ${activity.estimatedHours ? activity.estimatedHours + 'h' : ''}
            </div>
            <button class="btn-icon" onclick="deleteActivity('${activity.id}')" title="Delete activity">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    container.innerHTML = `
        ${activitiesHtml}
        <button class="btn btn-sm btn-ghost" onclick="addActivity('${storyId}')" style="margin-top: 8px;">
            <i class="fas fa-plus"></i> Add Activity
        </button>
    `;
}

function addActivity(storyId) {
    const title = prompt('Activity title:');
    if (!title || !title.trim()) return;
    
    const hours = prompt('Estimated hours (optional):');
    
    const activityData = {
        storyId: storyId,
        title: title.trim(),
        status: 'todo',
        completed: false,
        estimatedHours: hours ? parseFloat(hours) : 0,
        createdAt: new Date().toISOString(),
        order: 0
    };
    
    engagementManager.addEntity('activities', activityData);
    renderStoryActivities(storyId);
    showToast('Activity Added', 'Activity added', 'success');
}

function toggleActivity(activityId) {
    const activity = engagementManager.getEntities('activities').find(a => a.id === activityId);
    if (!activity) return;
    
    activity.completed = !activity.completed;
    activity.status = activity.completed ? 'done' : 'todo';
    activity.updatedAt = new Date().toISOString();
    if (activity.completed) {
        activity.completedAt = new Date().toISOString();
    }
    
    engagementManager.updateEntity('activities', activityId, activity);
    renderStoryActivities(activity.storyId);
}

function deleteActivity(activityId) {
    const activity = engagementManager.getEntities('activities').find(a => a.id === activityId);
    if (!activity) return;
    
    if (!confirm(`Delete activity "${activity.title}"?`)) return;
    
    engagementManager.deleteEntity('activities', activityId);
    renderStoryActivities(activity.storyId);
    showToast('Activity Deleted', `"${activity.title}" removed`, 'info');
}

// ═══════════════════════════════════════════════════════════════════
// CRM INTEGRATION
// ═══════════════════════════════════════════════════════════════════

function syncStoryToCRM(storyId) {
    const story = engagementManager.getEntities('stories').find(s => s.id === storyId);
    if (!story) return;
    
    // Update status to pending
    story.crmStatus = 'pending';
    engagementManager.updateEntity('stories', storyId, story);
    renderExecutionBoard();
    
    // Simulate CRM API call (2 seconds)
    setTimeout(() => {
        story.crmStatus = 'synced';
        story.crmId = 'DYN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        story.crmUrl = `https://dynamics.microsoft.com/stories/${story.crmId}`;
        story.crmSyncDate = new Date().toISOString();
        
        engagementManager.updateEntity('stories', storyId, story);
        renderExecutionBoard();
        
        showToast('CRM Synced', 'Story synced to CRM', 'success');
    }, 2000);
}

function bulkSyncToCRM() {
    const stories = engagementManager.getEntities('stories') || [];
    const validatedStories = stories.filter(s => s.status === 'validated' && s.crmStatus !== 'synced');
    
    if (validatedStories.length === 0) {
        showToast('No Stories to Sync', 'All validated stories are already synced', 'info');
        return;
    }
    
    validatedStories.forEach(story => {
        syncStoryToCRM(story.id);
    });
    
    showToast('Bulk Sync Started', `Syncing ${validatedStories.length} stories to CRM...`, 'info');
}

// ═══════════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════════

function filterStoriesByPhase() {
    showToast('Filter', 'Phase filtering coming soon', 'info');
}
