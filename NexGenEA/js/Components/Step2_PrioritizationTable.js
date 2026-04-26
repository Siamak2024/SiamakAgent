/**
 * Step2_PrioritizationTable.js
 * TAB 6: Prioritization Table for Step 2
 * 
 * Sortable table showing capability prioritization based on:
 * - Strategic Importance
 * - Maturity Gap
 * - Cost Estimate
 * - Classification (Invest/Optimize/Maintain)
 * 
 * @version 1.0.0
 * @date 2026-04-26
 */

(function() {
  'use strict';

  window.Step2PrioritizationTable = {
    
    state: {
      sortColumn: 'priority_score',
      sortDirection: 'desc',
      filterClassification: 'all' // 'all', 'invest', 'optimize', 'maintain'
    },

    // ══════════════════════════════════════════════════════════════════════
    // RENDER TABLE
    // ══════════════════════════════════════════════════════════════════════
    
    render: function() {
      const container = document.getElementById('step2-prioritization-table-grid');
      if (!container) {
        console.warn('Prioritization Table container not found');
        return;
      }

      const model = window.model || {};
      const capabilities = model.capabilities || [];

      if (capabilities.length === 0) {
        container.innerHTML = `
          <div class="flex items-center justify-center p-12 text-center">
            <div>
              <i class="fas fa-list-ol text-slate-300 text-5xl mb-3"></i>
              <div class="text-sm font-semibold text-slate-600 mb-1">No Capabilities Found</div>
              <div class="text-xs text-slate-500">Generate Step 2 Analysis first to populate the prioritization table</div>
            </div>
          </div>
        `;
        return;
      }

      // Calculate priority scores
      const enrichedCapabilities = capabilities.map(cap => {
        const score = this.calculatePriorityScore(cap);
        const classification = this.determineClassification(cap);
        return { ...cap, priority_score: score, classification };
      });

      // Filter
      const filtered = this.state.filterClassification === 'all' 
        ? enrichedCapabilities
        : enrichedCapabilities.filter(c => c.classification === this.state.filterClassification);

      // Sort
      const sorted = this.sortCapabilities(filtered);

      const html = `
        <!-- Controls -->
        <div class="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold text-slate-600">Filter by Classification:</span>
            <select 
              onchange="Step2PrioritizationTable.setFilter(this.value)"
              class="text-xs px-2 py-1 border border-slate-300 rounded">
              <option value="all" ${this.state.filterClassification === 'all' ? 'selected' : ''}>All (${enrichedCapabilities.length})</option>
              <option value="invest" ${this.state.filterClassification === 'invest' ? 'selected' : ''}>
                Invest (${enrichedCapabilities.filter(c => c.classification === 'invest').length})
              </option>
              <option value="optimize" ${this.state.filterClassification === 'optimize' ? 'selected' : ''}>
                Optimize (${enrichedCapabilities.filter(c => c.classification === 'optimize').length})
              </option>
              <option value="maintain" ${this.state.filterClassification === 'maintain' ? 'selected' : ''}>
                Maintain (${enrichedCapabilities.filter(c => c.classification === 'maintain').length})
              </option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button 
              onclick="Step2PrioritizationTable.exportTable()"
              class="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              <i class="fas fa-download"></i> Export CSV
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-auto" style="max-height: calc(100vh - 350px);">
          <table class="w-full border-collapse text-xs">
            <thead class="bg-slate-100 sticky top-0 z-10">
              <tr>
                <th class="p-2 border border-slate-300 text-left">
                  <button onclick="Step2PrioritizationTable.setSortColumn('name')" 
                    class="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600">
                    Capability ${this.renderSortIcon('name')}
                  </button>
                </th>
                <th class="p-2 border border-slate-300 text-center">
                  <button onclick="Step2PrioritizationTable.setSortColumn('priority_score')" 
                    class="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600">
                    Priority Score ${this.renderSortIcon('priority_score')}
                  </button>
                </th>
                <th class="p-2 border border-slate-300 text-center">
                  <button onclick="Step2PrioritizationTable.setSortColumn('strategic_importance')" 
                    class="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600">
                    Importance ${this.renderSortIcon('strategic_importance')}
                  </button>
                </th>
                <th class="p-2 border border-slate-300 text-center">
                  <button onclick="Step2PrioritizationTable.setSortColumn('gap')" 
                    class="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600">
                    Maturity Gap ${this.renderSortIcon('gap')}
                  </button>
                </th>
                <th class="p-2 border border-slate-300 text-center">
                  <button onclick="Step2PrioritizationTable.setSortColumn('cost_estimate')" 
                    class="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600">
                    Cost ${this.renderSortIcon('cost_estimate')}
                  </button>
                </th>
                <th class="p-2 border border-slate-300 text-center">
                  <button onclick="Step2PrioritizationTable.setSortColumn('classification')" 
                    class="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600">
                    Classification ${this.renderSortIcon('classification')}
                  </button>
                </th>
                <th class="p-2 border border-slate-300 text-left">
                  <span class="font-bold text-slate-700">Key Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${sorted.map((cap, idx) => this.renderCapabilityRow(cap, idx)).join('')}
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="flex items-center justify-between p-3 bg-slate-50 border-t border-slate-200">
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-red-500 rounded"></div>
              <span class="font-semibold">Invest:</span>
              <span>${enrichedCapabilities.filter(c => c.classification === 'invest').length}</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-yellow-500 rounded"></div>
              <span class="font-semibold">Optimize:</span>
              <span>${enrichedCapabilities.filter(c => c.classification === 'optimize').length}</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-green-500 rounded"></div>
              <span class="font-semibold">Maintain:</span>
              <span>${enrichedCapabilities.filter(c => c.classification === 'maintain').length}</span>
            </div>
          </div>
          <div class="text-xs text-slate-600">
            Showing ${filtered.length} of ${enrichedCapabilities.length} capabilities
          </div>
        </div>
      `;

      container.innerHTML = html;
    },

    renderCapabilityRow: function(cap, idx) {
      const classColors = {
        invest: 'bg-red-50 border-red-200 text-red-700',
        optimize: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        maintain: 'bg-green-50 border-green-200 text-green-700'
      };

      const importanceLabels = {
        'CORE': 'Core',
        'STRATEGIC': 'Strategic',
        'SUPPORTING': 'Supporting',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };

      const importance = cap.strategic_importance || cap.strategicImportance || 'medium';
      const gap = cap.gap || (cap.target_maturity || 0) - (cap.current_maturity || cap.maturity || 0);
      const costEstimate = cap.cost_estimate || this.estimateCost(cap);

      return `
        <tr class="hover:bg-slate-50">
          <td class="p-2 border border-slate-300">
            <div class="flex flex-col">
              <span class="font-semibold text-slate-700">${cap.name}</span>
              <span class="text-[10px] text-slate-500">${cap.apqc_code || ''}</span>
            </div>
          </td>
          <td class="p-2 border border-slate-300 text-center">
            <div class="flex items-center justify-center">
              <div class="flex flex-col items-center">
                <span class="text-lg font-bold ${this.getPriorityScoreColor(cap.priority_score)}">
                  ${cap.priority_score}
                </span>
                <div class="w-16 h-1 rounded-full mt-1 ${this.getPriorityScoreBarColor(cap.priority_score)}"></div>
              </div>
            </div>
          </td>
          <td class="p-2 border border-slate-300 text-center">
            <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${this.getImportanceBadgeColor(importance)}">
              ${importanceLabels[importance] || importance}
            </span>
          </td>
          <td class="p-2 border border-slate-300 text-center">
            <span class="font-semibold ${gap > 2 ? 'text-red-600' : gap > 0 ? 'text-yellow-600' : 'text-green-600'}">
              ${gap > 0 ? '+' : ''}${gap}
            </span>
          </td>
          <td class="p-2 border border-slate-300 text-center">
            <span class="text-xs text-slate-700">${this.formatCost(costEstimate)}</span>
          </td>
          <td class="p-2 border border-slate-300 text-center">
            <span class="inline-block px-2 py-1 rounded border text-xs font-semibold ${classColors[cap.classification]}">
              ${cap.classification.toUpperCase()}
            </span>
          </td>
          <td class="p-2 border border-slate-300">
            <div class="text-[10px] text-slate-600 space-y-1">
              ${this.getKeyActions(cap).map(action => `
                <div class="flex items-start gap-1">
                  <i class="fas fa-chevron-right text-blue-500 text-[8px] mt-0.5"></i>
                  <span>${action}</span>
                </div>
              `).join('')}
            </div>
          </td>
        </tr>
      `;
    },

    renderSortIcon: function(column) {
      if (this.state.sortColumn !== column) {
        return '<i class="fas fa-sort text-slate-400"></i>';
      }
      
      return this.state.sortDirection === 'asc' 
        ? '<i class="fas fa-sort-up text-blue-600"></i>'
        : '<i class="fas fa-sort-down text-blue-600"></i>';
    },

    // ══════════════════════════════════════════════════════════════════════
    // SCORING & CLASSIFICATION
    // ══════════════════════════════════════════════════════════════════════
    
    calculatePriorityScore: function(cap) {
      // Priority Score = (Importance × 3) + (Gap × 2) + Objective Mappings - Cost Factor
      
      const importanceScore = {
        'CORE': 10,
        'STRATEGIC': 7,
        'SUPPORTING': 4,
        'high': 10,
        'medium': 6,
        'low': 3
      }[cap.strategic_importance || cap.strategicImportance || 'medium'] || 5;

      const gap = cap.gap || (cap.target_maturity || 0) - (cap.current_maturity || cap.maturity || 0);
      const gapScore = Math.max(0, gap * 2);

      const objectiveMappings = (cap.objective_mappings || []).length;
      const mappingScore = objectiveMappings > 0 ? 5 : 0;

      const costEstimate = cap.cost_estimate || this.estimateCost(cap);
      const costFactor = {
        'low': 0,
        'medium': 2,
        'high': 5
      }[costEstimate] || 2;

      const score = (importanceScore * 3) + (gapScore * 2) + mappingScore - costFactor;
      
      return Math.round(Math.max(0, score));
    },

    determineClassification: function(cap) {
      const importance = cap.strategic_importance || cap.strategicImportance || 'medium';
      const gap = cap.gap || (cap.target_maturity || 0) - (cap.current_maturity || cap.maturity || 0);
      const maturity = cap.current_maturity || cap.maturity || 0;

      // Invest: High importance + large gap OR core with any gap
      if ((importance === 'CORE' || importance === 'high') && gap > 1) {
        return 'invest';
      }
      
      // Optimize: Medium importance + moderate gap OR high importance with small gap
      if (gap > 0 && gap <= 2) {
        return 'optimize';
      }
      
      // Maintain: No gap or negative gap (already at/above target)
      if (gap <= 0 || maturity >= 4) {
        return 'maintain';
      }

      return 'optimize'; // Default
    },

    estimateCost: function(cap) {
      const gap = cap.gap || (cap.target_maturity || 0) - (cap.current_maturity || cap.maturity || 0);
      
      if (gap <= 0) return 'low';
      if (gap <= 1) return 'medium';
      return 'high';
    },

    getKeyActions: function(cap) {
      const actions = [];
      const classification = cap.classification;
      const gap = cap.gap || 0;

      if (classification === 'invest') {
        actions.push('Conduct capability assessment');
        actions.push('Define transformation roadmap');
        if (gap > 2) actions.push('Identify quick wins');
      } else if (classification === 'optimize') {
        actions.push('Identify optimization opportunities');
        actions.push('Benchmark against best practices');
      } else {
        actions.push('Monitor performance');
        actions.push('Maintain current state');
      }

      return actions.slice(0, 2); // Max 2 actions
    },

    // ══════════════════════════════════════════════════════════════════════
    // SORTING & FILTERING
    // ══════════════════════════════════════════════════════════════════════
    
    setSortColumn: function(column) {
      if (this.state.sortColumn === column) {
        // Toggle direction
        this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.state.sortColumn = column;
        this.state.sortDirection = 'desc';
      }
      
      this.render();
    },

    setFilter: function(classification) {
      this.state.filterClassification = classification;
      this.render();
    },

    sortCapabilities: function(capabilities) {
      const column = this.state.sortColumn;
      const direction = this.state.sortDirection;
      
      return [...capabilities].sort((a, b) => {
        let aVal, bVal;

        if (column === 'name') {
          aVal = a.name || '';
          bVal = b.name || '';
        } else if (column === 'priority_score') {
          aVal = a.priority_score || 0;
          bVal = b.priority_score || 0;
        } else if (column === 'strategic_importance') {
          const importanceOrder = { 'CORE': 3, 'STRATEGIC': 2, 'SUPPORTING': 1, 'high': 3, 'medium': 2, 'low': 1 };
          aVal = importanceOrder[a.strategic_importance || a.strategicImportance] || 0;
          bVal = importanceOrder[b.strategic_importance || b.strategicImportance] || 0;
        } else if (column === 'gap') {
          aVal = a.gap || 0;
          bVal = b.gap || 0;
        } else if (column === 'cost_estimate') {
          const costOrder = { 'low': 1, 'medium': 2, 'high': 3 };
          aVal = costOrder[a.cost_estimate || this.estimateCost(a)] || 0;
          bVal = costOrder[b.cost_estimate || this.estimateCost(b)] || 0;
        } else if (column === 'classification') {
          aVal = a.classification || '';
          bVal = b.classification || '';
        } else {
          return 0;
        }

        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        if (aVal < bVal) comparison = -1;

        return direction === 'asc' ? comparison : -comparison;
      });
    },

    // ══════════════════════════════════════════════════════════════════════
    // STYLING HELPERS
    // ══════════════════════════════════════════════════════════════════════
    
    getPriorityScoreColor: function(score) {
      if (score >= 40) return 'text-red-600';
      if (score >= 25) return 'text-orange-600';
      if (score >= 15) return 'text-yellow-600';
      return 'text-green-600';
    },

    getPriorityScoreBarColor: function(score) {
      if (score >= 40) return 'bg-red-500';
      if (score >= 25) return 'bg-orange-500';
      if (score >= 15) return 'bg-yellow-500';
      return 'bg-green-500';
    },

    getImportanceBadgeColor: function(importance) {
      const colors = {
        'CORE': 'bg-purple-100 text-purple-700 border border-purple-300',
        'STRATEGIC': 'bg-blue-100 text-blue-700 border border-blue-300',
        'SUPPORTING': 'bg-slate-100 text-slate-700 border border-slate-300',
        'high': 'bg-purple-100 text-purple-700 border border-purple-300',
        'medium': 'bg-blue-100 text-blue-700 border border-blue-300',
        'low': 'bg-slate-100 text-slate-700 border border-slate-300'
      };
      return colors[importance] || colors['medium'];
    },

    formatCost: function(cost) {
      const labels = {
        'low': '$ Low',
        'medium': '$$ Medium',
        'high': '$$$ High'
      };
      return labels[cost] || cost;
    },

    // ══════════════════════════════════════════════════════════════════════
    // EXPORT
    // ══════════════════════════════════════════════════════════════════════
    
    exportTable: function() {
      console.log('[PrioritizationTable] Exporting to CSV...');
      
      const model = window.model || {};
      const capabilities = model.capabilities || [];

      const enrichedCapabilities = capabilities.map(cap => {
        const score = this.calculatePriorityScore(cap);
        const classification = this.determineClassification(cap);
        return { ...cap, priority_score: score, classification };
      });

      const sorted = this.sortCapabilities(enrichedCapabilities);

      // Build CSV
      const headers = ['Capability', 'APQC Code', 'Priority Score', 'Importance', 'Maturity Gap', 'Cost', 'Classification', 'Key Actions'];
      const rows = sorted.map(cap => {
        const importance = cap.strategic_importance || cap.strategicImportance || 'medium';
        const gap = cap.gap || 0;
        const costEstimate = cap.cost_estimate || this.estimateCost(cap);
        const actions = this.getKeyActions(cap).join('; ');

        return [
          cap.name,
          cap.apqc_code || '',
          cap.priority_score,
          importance,
          gap,
          costEstimate,
          cap.classification,
          actions
        ];
      });

      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Capability_Prioritization_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof addAssistantMessage === 'function') {
        addAssistantMessage('📊 Prioritization Table exported to CSV!');
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // AUTO-INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════
  
  // Auto-render when tab is shown
  document.addEventListener('DOMContentLoaded', function() {
    const tabButton = document.getElementById('btn-step2-prioritization-table');
    if (tabButton) {
      const originalOnClick = tabButton.onclick;
      tabButton.onclick = function(e) {
        if (originalOnClick) originalOnClick.call(this, e);
        setTimeout(() => window.Step2PrioritizationTable.render(), 100);
      };
    }
  });

})();
