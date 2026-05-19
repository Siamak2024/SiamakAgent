/**
 * WhiteSpot Heatmap - Bulk Selection & Actions
 * 
 * Features:
 * - Checkbox-based bulk selection
 * - Bulk remove services
 * - Select all / deselect all
 * - Dynamic selection counter
 * 
 * @version 1.0
 * @date May 15, 2026
 */

// ═══════════════════════════════════════════════════════════════════
// BULK SELECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Toggle heatmap service selection and update UI
 */
window.toggleHeatmapServiceSelection = function(checkbox) {
    updateSelectionCount();
    
    // Show/hide bulk toolbar based on selection
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    const toolbar = document.getElementById('bulkActionsToolbar');
    
    if (toolbar) {
        toolbar.style.display = checkboxes.length > 0 ? 'block' : 'none';
    }
};

/**
 * Update selection count display
 */
function updateSelectionCount() {
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    const countElement = document.getElementById('selectedCount');
    
    if (countElement) {
        const count = checkboxes.length;
        countElement.textContent = `${count} selected`;
        countElement.style.color = count > 0 ? '#dc2626' : '#111827';
    }
}

/**
 * Select all services
 */
window.selectAllServices = function() {
    const checkboxes = document.querySelectorAll('.service-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = true;
    });
    updateSelectionCount();
    
    const toolbar = document.getElementById('bulkActionsToolbar');
    if (toolbar && checkboxes.length > 0) {
        toolbar.style.display = 'block';
    }
};

/**
 * Deselect all services
 */
window.deselectAllServices = function() {
    const checkboxes = document.querySelectorAll('.service-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    updateSelectionCount();
    
    const toolbar = document.getElementById('bulkActionsToolbar');
    if (toolbar) {
        toolbar.style.display = 'none';
    }
};

/**
 * Bulk remove selected services from heatmap
 */
window.bulkRemoveServices = async function() {
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one service to remove.');
        return;
    }
    
    // Confirm bulk removal
    const confirmed = confirm(`Remove ${checkboxes.length} service(s) from the heatmap?\n\nThis will delete their assessments and all associated data.`);
    
    if (!confirmed) return;
    
    const manager = typeof window.whitespotStandaloneManager !== 'undefined' 
        ? window.whitespotStandaloneManager 
        : window.engagementManager;
    
    let successCount = 0;
    let failCount = 0;
    
    // Remove each selected service
    checkboxes.forEach(cb => {
        const serviceId = cb.dataset.serviceId;
        const heatmapId = cb.dataset.heatmapId;
        
        try {
            // Get heatmap
            const heatmaps = manager.getHeatmaps ? manager.getHeatmaps() : (manager.getEntities('whiteSpotHeatmaps') || []);
            const heatmap = heatmaps.find(h => h.id === heatmapId);
            
            if (heatmap) {
                // Remove assessment
                heatmap.hlAssessments = heatmap.hlAssessments.filter(a => a.l2ServiceId !== serviceId);
                
                // Save updated heatmap
                if (manager.updateHeatmap) {
                    manager.updateHeatmap(heatmapId, heatmap);
                } else if (manager.updateEntity) {
                    manager.updateEntity('whiteSpotHeatmaps', heatmapId, heatmap);
                }
                
                successCount++;
                console.log(`✅ Removed service ${serviceId} from heatmap ${heatmapId}`);
            } else {
                failCount++;
                console.error(`❌ Heatmap ${heatmapId} not found`);
            }
        } catch (error) {
            failCount++;
            console.error(`❌ Error removing service ${serviceId}:`, error);
        }
    });
    
    // Show result message
    if (successCount > 0) {
        if (typeof showNotification === 'function') {
            showNotification(`✅ Removed ${successCount} service(s) from heatmap`, 'success');
        } else {
            alert(`✅ Successfully removed ${successCount} service(s) from heatmap!${failCount > 0 ? `\n⚠️ ${failCount} failed.` : ''}`);
        }
    }
    
    // Re-render the view (removed services will disappear)
    await renderWhiteSpotHeatmap();
};

// console.log('✓ WhiteSpot Bulk Selection module loaded (v1.0)');
