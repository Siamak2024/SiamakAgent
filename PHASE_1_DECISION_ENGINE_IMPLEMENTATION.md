# Phase 1 Decision Engine - UI Integration Guide

## Files Created

### Core Modules (Completed ✅)
1. **js/EA_StorageManager.js** - IndexedDB wrapper with localStorage fallback
2. **js/EA_ScoringEngine.js** - 4-criteria scoring algorithm  
3. **js/EA_DecisionEngine.js** - Decision rules and recommendation logic
4. **data/decision_rules.json** - Configuration for thresholds and rules

### Extended Modules (Completed ✅)
5. **js/EA_DataManager.js** - Added 11 decision engine integration methods
6. **js/Advicy_AI.js** - Added generateDecisionRationale() method

## UI Integration Required

### 1. Add Scripts to Application_Portfolio_Management.html

Add before closing `</body>` tag (after existing script tags):

```html
<!-- Decision Engine Modules -->
<script src="../js/EA_StorageManager.js"></script>
<script src="../js/EA_ScoringEngine.js"></script>
<script src="../js/EA_DecisionEngine.js"></script>
```

### 2. Add Decision Tab Button

In the tab bar (around line 369-376), add after the "Rationalization" button:

```html
<button class="tab-btn" onclick="switchTab('decisions',this)">
    <i class="fas fa-lightbulb"></i> Decisions
</button>
```

### 3. Add Decision View Section

Add after the "RATIONALIZATION" section (around line 590):

```html
<!-- ==================== DECISIONS ==================== -->
<div id="view-decisions" class="section-view">
    <!-- KPI Strip -->
    <div class="kpi-strip">
        <div class="kpi-card" style="background:linear-gradient(135deg, #16a34a 0%, #84cc16 100%)">
            <div class="kpi-value" id="decInvestCount">0</div>
            <div class="kpi-label">Invest</div>
        </div>
        <div class="kpi-card" style="background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)">
            <div class="kpi-value" id="decTolerateCount">0</div>
            <div class="kpi-label">Tolerate</div>
        </div>
        <div class="kpi-card" style="background:linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)">
            <div class="kpi-value" id="decMigrateCount">0</div>
            <div class="kpi-label">Migrate</div>
        </div>
        <div class="kpi-card" style="background:linear-gradient(135deg, #dc2626 0%, #f87171 100%)">
            <div class="kpi-value" id="decEliminateCount">0</div>
            <div class="kpi-label">Eliminate</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value" id="decAvgConfidence">0%</div>
            <div class="kpi-label">Avg Confidence</div>
        </div>
    </div>

    <!-- Action Bar -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-primary" onclick="runPortfolioAnalysis()" title="Generate AI-powered decisions for all applications">
                <i class="fas fa-play"></i> Run Analysis
            </button>
            <button class="btn btn-ghost" onclick="refreshDecisions()" title="Reload decisions">
                <i class="fas fa-sync"></i> Refresh
            </button>
            <button class="btn btn-ghost" onclick="exportDecisions()" title="Export decisions to JSON">
                <i class="fas fa-download"></i> Export
            </button>
        </div>
        <div style="display:flex;gap:8px">
            <select id="filterDecisionStatus" onchange="renderDecisions()">
                <option value="">All Statuses</option>
                <option value="Invest">Invest</option>
                <option value="Tolerate">Tolerate</option>
                <option value="Migrate">Migrate</option>
                <option value="Eliminate">Eliminate</option>
            </select>
            <select id="filterApprovalStatus" onchange="renderDecisions()">
                <option value="">All Approvals</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
    </div>

    <!-- Decisions Table -->
    <div class="card" style="padding:0;overflow:hidden">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Application</th>
                        <th>Decision</th>
                        <th>Confidence</th>
                        <th>Total Score</th>
                        <th title="Business Fit Score">B.Fit</th>
                        <th title="Technical Health Score">T.Health</th>
                        <th title="Cost Efficiency Score">Cost Eff.</th>
                        <th title="Risk Score">Risk</th>
                        <th>Rationale</th>
                        <th>Approval</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="decisionsBody"></tbody>
            </table>
        </div>
    </div>
</div>
```

### 4. Add JavaScript Functions

Add to the `<script>` section (after existing functions):

```javascript
// ═══════════════════════════════════════════════════════════════
// DECISION ENGINE
// ═══════════════════════════════════════════════════════════════

let _decisionsCache = null;
let _scoresCache = null;

/**
 * Initialize Decision Engine
 */
async function initDecisionEngine() {
    try {
        const dataManager = window.EA_DataManager_Instance || new EA_DataManager();
        await dataManager.initDecisionEngine();
        console.log('✅ Decision Engine ready');
        return true;
    } catch (error) {
        console.error('❌ Decision Engine initialization failed:', error);
        showToast('Decision Engine initialization failed', 'error');
        return false;
    }
}

/**
 * Run portfolio analysis
 */
async function runPortfolioAnalysis() {
    const apps = getApps();
    if (!apps.length) {
        showToast('No applications to analyze', 'warning');
        return;
    }

    showToast('Analyzing portfolio... This may take a moment.', 'info');
    
    try {
        // Initialize if needed
        await initDecisionEngine();
        
        const dataManager = window.EA_DataManager_Instance || new EA_DataManager();
        const result = await dataManager.analyzePortfolio(apps);
        
        if (result.success) {
            _decisionsCache = result.decisions;
            _scoresCache = result.summary;
            
            renderDecisions();
            showToast(`Analysis complete! Generated ${result.decisions.length} decisions.`, 'ok');
        } else {
            showToast('Analysis failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Portfolio analysis failed:', error);
        showToast('Analysis failed: ' + error.message, 'error');
    }
}

/**
 * Refresh decisions from storage
 */
async function refreshDecisions() {
    try {
        await initDecisionEngine();
        const storage = window.EA_StorageManager_Instance;
        
        _decisionsCache = await storage.getAll('decisions');
        _scoresCache = await storage.getAll('scores');
        
        renderDecisions();
        showToast('Decisions refreshed', 'ok');
    } catch (error) {
        console.error('❌ Refresh failed:', error);
        showToast('Refresh failed', 'error');
    }
}

/**
 * Render decisions table
 */
async function renderDecisions() {
    if (!_decisionsCache) {
        await refreshDecisions();
        if (!_decisionsCache) {
            document.getElementById('decisionsBody').innerHTML = 
                '<tr><td colspan="11" style="text-align:center;padding:40px;color:#94a3b8"><i class="fas fa-info-circle"></i> No decisions generated yet. Click "Run Analysis" to start.</td></tr>';
            return;
        }
    }

    const statusFilter = document.getElementById('filterDecisionStatus')?.value || '';
    const approvalFilter = document.getElementById('filterApprovalStatus')?.value || '';

    let filtered = _decisionsCache;
    if (statusFilter) filtered = filtered.filter(d => d.status === statusFilter);
    if (approvalFilter) filtered = filtered.filter(d => d.approvalStatus === approvalFilter);

    // Update KPIs
    const summary = {
        Invest: _decisionsCache.filter(d => d.status === 'Invest').length,
        Tolerate: _decisionsCache.filter(d => d.status === 'Tolerate').length,
        Migrate: _decisionsCache.filter(d => d.status === 'Migrate').length,
        Eliminate: _decisionsCache.filter(d => d.status === 'Eliminate').length,
        avgConfidence: Math.round((_decisionsCache.reduce((sum, d) => sum + d.confidence, 0) / _decisionsCache.length) * 100)
    };

    document.getElementById('decInvestCount').textContent = summary.Invest;
    document.getElementById('decTolerateCount').textContent = summary.Tolerate;
    document.getElementById('decMigrateCount').textContent = summary.Migrate;
    document.getElementById('decEliminateCount').textContent = summary.Eliminate;
    document.getElementById('decAvgConfidence').textContent = summary.avgConfidence + '%';

    // Render table
    const apps = getApps();
    const tbody = document.getElementById('decisionsBody');
    
    tbody.innerHTML = filtered.map(decision => {
        const app = apps.find(a => a.id === decision.appId);
        if (!app) return '';

        const score = _scoresCache?.find(s => s.appId === decision.appId) || {};
        const confidencePct = Math.round(decision.confidence * 100);
        const confidenceColor = decision.confidence >= 0.8 ? '#16a34a' : decision.confidence >= 0.6 ? '#3b82f6' : '#fbbf24';

        const statusColors = {
            'Invest': '#16a34a',
            'Tolerate': '#fbbf24',
            'Migrate': '#3b82f6',
            'Eliminate': '#dc2626'
        };

        const approvalColors = {
            'pending': '#6c757d',
            'approved': '#16a34a',
            'rejected': '#dc2626'
        };

        return `<tr>
            <td><strong>${app.name}</strong></td>
            <td><span class="badge" style="background:${statusColors[decision.status]};color:white">${decision.status}</span></td>
            <td><span style="color:${confidenceColor};font-weight:700">${confidencePct}%</span></td>
            <td><strong>${score.total || '–'}</strong></td>
            <td>${score.businessFit || '–'}</td>
            <td>${score.technicalHealth || '–'}</td>
            <td>${score.costEfficiency || '–'}</td>
            <td>${score.risk || '–'}</td>
            <td style="max-width:300px"><small>${decision.rationale}</small></td>
            <td><span class="badge" style="background:${approvalColors[decision.approvalStatus]};color:white">${decision.approvalStatus}</span></td>
            <td>
                <div class="action-row">
                    ${decision.approvalStatus === 'pending' ? `
                        <button class="icon-btn" onclick="approveDecision('${decision.id}')" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="icon-btn del" onclick="rejectDecision('${decision.id}')" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : '–'}
                </div>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Approve decision
 */
async function approveDecision(decisionId) {
    const dataManager = window.EA_DataManager_Instance || new EA_DataManager();
    const success = await dataManager.updateDecisionStatus(decisionId, 'approve', 'Current User');
    
    if (success) {
        await refreshDecisions();
        showToast('Decision approved', 'ok');
    } else {
        showToast('Failed to approve decision', 'error');
    }
}

/**
 * Reject decision
 */
async function rejectDecision(decisionId) {
    const reason = prompt('Rejection reason (optional):');
    const dataManager = window.EA_DataManager_Instance || new EA_DataManager();
    const success = await dataManager.updateDecisionStatus(decisionId, 'reject', 'Current User', reason);
    
    if (success) {
        await refreshDecisions();
        showToast('Decision rejected', 'ok');
    } else {
        showToast('Failed to reject decision', 'error');
    }
}

/**
 * Export decisions
 */
async function exportDecisionsData() {
    const dataManager = window.EA_DataManager_Instance || new EA_DataManager();
    const json = await dataManager.exportDecisions();
    
    if (json) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio_decisions_' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Decisions exported', 'ok');
    }
}
```

### 5. Update switchTab() Function

Find the `switchTab()` function and add:

```javascript
if (name === 'decisions') { renderDecisions(); }
```

## Testing Checklist

1. ✅ Load Application_Portfolio_Management.html
2. ✅ Click "Decisions" tab
3. ✅ Click "Run Analysis" button
4. ✅ Verify decisions are generated for all applications
5. ✅ Check KPI cards update correctly
6. ✅ Filter by decision status (Invest, Tolerate, Migrate, Eliminate)
7. ✅ Filter by approval status (pending, approved, rejected)
8. ✅ Approve/reject decisions
9. ✅ Export decisions to JSON
10. ✅ Check browser console for errors

## Architecture Summary

### Data Flow
```
Applications (localStorage)
    ↓
EA_StorageManager (IndexedDB migration)
    ↓
EA_ScoringEngine (4-criteria calculation)
    ↓
EA_DecisionEngine (rules application)
    ↓
Advicy_AI (rationale enhancement - optional)
    ↓
Decision UI (visualization & approval)
```

### Decision Lifecycle
```
1. User clicks "Run Analysis"
2. All applications scored (Business Fit, Tech Health, Cost Efficiency, Risk)
3. Rules applied in priority order (Eliminate → Migrate → Consolidate → Invest → Tolerate)
4. Decisions saved to IndexedDB
5. UI renders decisions with approval workflow
6. User approves/rejects decisions
7. Export for reporting/documentation
```

## Configuration

Edit `data/decision_rules.json` to customize:
- **Thresholds**: scoreHigh (70), scoreLow (40), costHigh ($500k), etc.
- **Weights**: Business Fit (0.3), Technical Health (0.3), Cost Efficiency (0.2), Risk (0.2)
- **Benchmarks**: Cost per user by app category (ERP: $2k, CRM: $1.5k, etc.)

## Next Steps (Phase 2-4)

- **Phase 2**: Optimization Layer (consolidation groups, TCO analysis)
- **Phase 3**: Transformation Layer (migration roadmaps, project planning)
- **Phase 4**: AI Expansion (natural language decisions, automated reporting)

---

**Status**: Phase 1 Core Implementation Complete ✅  
**Estimated Integration Time**: 15-30 minutes  
**Files Modified**: Application_Portfolio_Management.html (1 file)
