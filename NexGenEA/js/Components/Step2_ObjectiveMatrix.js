/**
 * Step2_ObjectiveMatrix.js
 * TAB 2: Objective Mapping Matrix for Step 2
 * 
 * Interactive grid showing relationships between:
 * - Capabilities (rows)
 * - Business Objectives (columns)
 * - Mapping strength: High/Medium/Low (color-coded)
 * 
 * @version 1.0.0
 * @date 2026-04-26
 */

(function() {
  'use strict';

  window.Step2ObjectiveMatrix = {
    
    // ══════════════════════════════════════════════════════════════════════
    // RENDER MATRIX
    // ══════════════════════════════════════════════════════════════════════
    
    render: function() {
      const container = document.getElementById('step2-objective-matrix-grid');
      if (!container) {
        console.warn('Objective Matrix container not found');
        return;
      }

      const model = window.model || {};
      const capabilities = model.capabilities || [];
      const objectives = model.businessContext?.primaryObjectives || [];

      if (capabilities.length === 0) {
        container.innerHTML = `
          <div class="flex items-center justify-center p-12 text-center">
            <div>
              <i class="fas fa-table text-slate-300 text-5xl mb-3"></i>
              <div class="text-sm font-semibold text-slate-600 mb-1">No Capabilities Found</div>
              <div class="text-xs text-slate-500">Generate Step 2 Analysis first to populate the matrix</div>
            </div>
          </div>
        `;
        return;
      }

      if (objectives.length === 0) {
        container.innerHTML = `
          <div class="flex items-center justify-center p-12 text-center">
            <div>
              <i class="fas fa-bullseye text-slate-300 text-5xl mb-3"></i>
              <div class="text-sm font-semibold text-slate-600 mb-1">No Business Objectives Found</div>
              <div class="text-xs text-slate-500">Please complete Step 1 to define business objectives first</div>
            </div>
          </div>
        `;
        return;
      }

      // Build matrix
      const html = `
        <div class="overflow-auto" style="max-height: calc(100vh - 300px);">
          <table class="w-full border-collapse text-xs">
            <thead class="bg-slate-100 sticky top-0 z-10">
              <tr>
                <th class="p-2 border border-slate-300 text-left font-bold text-slate-700 min-w-[200px] sticky left-0 bg-slate-100 z-20">
                  Capability
                </th>
                ${objectives.map((obj, idx) => `
                  <th class="p-2 border border-slate-300 text-center font-semibold text-slate-700 min-w-[120px]" 
                      title="${obj.objective}">
                    <div class="flex flex-col items-center">
                      <span class="text-[10px] text-slate-500 mb-1">OBJ-${idx + 1}</span>
                      <span class="line-clamp-2">${obj.objective}</span>
                    </div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${capabilities.map(cap => this.renderCapabilityRow(cap, objectives)).join('')}
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 p-3 bg-slate-50 border-t border-slate-200">
          <span class="text-xs font-semibold text-slate-600">Mapping Strength:</span>
          <div class="flex items-center gap-1">
            <div class="w-6 h-6 bg-green-500 border border-green-600 rounded"></div>
            <span class="text-xs text-slate-600">High</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-6 h-6 bg-yellow-400 border border-yellow-500 rounded"></div>
            <span class="text-xs text-slate-600">Medium</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-6 h-6 bg-blue-300 border border-blue-400 rounded"></div>
            <span class="text-xs text-slate-600">Low</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-6 h-6 bg-white border border-slate-300 rounded"></div>
            <span class="text-xs text-slate-600">None</span>
          </div>
        </div>
      `;

      container.innerHTML = html;
    },

    renderCapabilityRow: function(cap, objectives) {
      const mappings = cap.objective_mappings || [];
      
      return `
        <tr class="hover:bg-slate-50">
          <td class="p-2 border border-slate-300 font-semibold text-slate-700 sticky left-0 bg-white z-10">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500">${cap.apqc_code || ''}</span>
              <span>${cap.name}</span>
            </div>
          </td>
          ${objectives.map(obj => this.renderMappingCell(cap, obj)).join('')}
        </tr>
      `;
    },

    renderMappingCell: function(cap, obj) {
      const mappings = cap.objective_mappings || [];
      const mapping = mappings.find(m => m.objective_id === obj.id || m.objectiveId === obj.id);
      const strength = mapping ? (mapping.strength || 'low') : 'none';
      
      const colorClass = {
        high: 'bg-green-500 border-green-600 text-white hover:bg-green-600',
        medium: 'bg-yellow-400 border-yellow-500 text-slate-800 hover:bg-yellow-500',
        low: 'bg-blue-300 border-blue-400 text-slate-800 hover:bg-blue-400',
        none: 'bg-white border-slate-300 text-slate-400 hover:bg-slate-100'
      }[strength];

      const icon = {
        high: '<i class="fas fa-star"></i>',
        medium: '<i class="fas fa-star-half-stroke"></i>',
        low: '<i class="far fa-star"></i>',
        none: '<i class="far fa-circle"></i>'
      }[strength];

      return `
        <td class="p-0 border border-slate-300">
          <button 
            onclick="Step2ObjectiveMatrix.toggleMapping('${cap.id}', '${obj.id}')"
            class="w-full h-full p-3 ${colorClass} border transition-colors cursor-pointer flex items-center justify-center"
            title="Click to cycle: None → Low → Medium → High">
            ${icon}
          </button>
        </td>
      `;
    },

    // ══════════════════════════════════════════════════════════════════════
    // INTERACTION HANDLERS
    // ══════════════════════════════════════════════════════════════════════
    
    toggleMapping: function(capabilityId, objectiveId) {
      console.log('[ObjectiveMatrix] Toggle mapping:', capabilityId, objectiveId);
      
      const model = window.model || {};
      const capabilities = model.capabilities || [];
      const cap = capabilities.find(c => c.id === capabilityId);
      
      if (!cap) {
        console.error('Capability not found:', capabilityId);
        return;
      }

      // Ensure objective_mappings array exists
      if (!cap.objective_mappings) {
        cap.objective_mappings = [];
      }

      // Find existing mapping
      const existingIndex = cap.objective_mappings.findIndex(m => 
        m.objective_id === objectiveId || m.objectiveId === objectiveId
      );

      if (existingIndex === -1) {
        // No mapping exists - create LOW
        cap.objective_mappings.push({
          objective_id: objectiveId,
          objectiveId: objectiveId,
          strength: 'low',
          notes: ''
        });
      } else {
        const current = cap.objective_mappings[existingIndex];
        
        // Cycle: none → low → medium → high → none
        if (current.strength === 'low') {
          current.strength = 'medium';
        } else if (current.strength === 'medium') {
          current.strength = 'high';
        } else {
          // Remove mapping (high → none)
          cap.objective_mappings.splice(existingIndex, 1);
        }
      }

      // Save model
      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
      }

      // Re-render matrix
      this.render();
    },

    // ══════════════════════════════════════════════════════════════════════
    // BULK ACTIONS
    // ══════════════════════════════════════════════════════════════════════
    
    clearAllMappings: function() {
      const confirmed = confirm('Clear all objective mappings?\n\nThis cannot be undone.');
      if (!confirmed) return;

      const capabilities = window.model?.capabilities || [];
      capabilities.forEach(cap => {
        cap.objective_mappings = [];
      });

      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
      }

      this.render();
    },

    autoMap: function() {
      console.log('[ObjectiveMatrix] Auto-mapping based on keywords...');
      
      const model = window.model || {};
      const capabilities = model.capabilities || [];
      const objectives = model.businessContext?.primaryObjectives || [];

      let mappingsCreated = 0;

      capabilities.forEach(cap => {
        const capText = (cap.name + ' ' + (cap.description || '')).toLowerCase();
        
        objectives.forEach(obj => {
          const objText = (obj.objective + ' ' + (obj.description || '')).toLowerCase();
          
          // Simple keyword matching
          const keywords = objText.split(/\s+/).filter(w => w.length > 4);
          const matches = keywords.filter(kw => capText.includes(kw)).length;
          
          if (matches >= 2) {
            // Create mapping if not exists
            if (!cap.objective_mappings) cap.objective_mappings = [];
            
            const exists = cap.objective_mappings.some(m => 
              m.objective_id === obj.id || m.objectiveId === obj.id
            );
            
            if (!exists) {
              cap.objective_mappings.push({
                objective_id: obj.id,
                objectiveId: obj.id,
                strength: matches >= 3 ? 'medium' : 'low',
                notes: 'Auto-mapped based on keyword similarity'
              });
              mappingsCreated++;
            }
          }
        });
      });

      if (typeof autoSaveCurrentModel === 'function') {
        autoSaveCurrentModel();
      }

      alert(`Auto-mapping complete!\n\n${mappingsCreated} new mappings created based on keyword similarity.`);
      this.render();
    },

    exportMatrix: function() {
      console.log('[ObjectiveMatrix] Exporting matrix to CSV...');
      
      const model = window.model || {};
      const capabilities = model.capabilities || [];
      const objectives = model.businessContext?.primaryObjectives || [];

      // Build CSV
      const headers = ['Capability', 'APQC Code', ...objectives.map((obj, idx) => `OBJ-${idx + 1}: ${obj.objective}`)];
      const rows = capabilities.map(cap => {
        const mappings = cap.objective_mappings || [];
        const row = [
          cap.name,
          cap.apqc_code || '',
          ...objectives.map(obj => {
            const mapping = mappings.find(m => m.objective_id === obj.id || m.objectiveId === obj.id);
            return mapping ? (mapping.strength || 'low').toUpperCase() : '';
          })
        ];
        return row;
      });

      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Objective_Matrix_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof addAssistantMessage === 'function') {
        addAssistantMessage('📊 Objective Matrix exported to CSV!');
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // AUTO-INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════
  
  // Auto-render when tab is shown
  document.addEventListener('DOMContentLoaded', function() {
    const tabButton = document.getElementById('btn-step2-objective-matrix');
    if (tabButton) {
      const originalOnClick = tabButton.onclick;
      tabButton.onclick = function(e) {
        if (originalOnClick) originalOnClick.call(this, e);
        setTimeout(() => window.Step2ObjectiveMatrix.render(), 100);
      };
    }
  });

})();
