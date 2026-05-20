/**
 * ea_asis_dashboard_renderer.js
 * AS-IS Architecture Dashboard HTML Renderer
 * 
 * Generates executive dashboard HTML following ASIS_Architecture_Portfolio_Dashboard.md specification
 * - Hero section + KPI strip
 * - Business domains (cards with modals)
 * - Architecture layers (horizontal bars)
 * - Strategic insights (cards with modals) - AI-generated
 * - Risk snapshot (6-cell grid)
 * - Modal system + export functionality
 * 
 * V5.41 (2026-05-19): NORDIC COLOR SCHEME
 *   - Updated all Strategic Insights colors to Vivicta Nordic green palette
 *   - Replaced purple/pink/cyan gradients with Nordic greens (#00472E, #006B3F, #4BE3A3)
 *   - Updated health badges, text colors, backgrounds to match Nordic theme
 *   - Maintains 3-column card grid layout with edit/delete functionality
 * 
 * V5.40 (2026-05-19): CRITICAL FIX - Unified Rendering Paths
 *   - FIXED: initStrategicInsights() now delegates to renderLensInsightsResults() for unified rendering
 *   - FIXED: Added retry counter (max 5) to prevent infinite loops
 *   - Both initial load and regenerate now use the same card grid renderer
 * 
 * V5.38 (2026-05-19): 3-COLUMN CARD GRID REDESIGN + EDIT/DELETE
 *   - Redesigned Strategic Insights with modern 3-column card grid layout
 *   - Executive Summary, Critical Actions, and Domain Recommendations as separate cards
 *   - Edit functionality with modal textarea editor
 *   - Delete functionality with confirmation
 *   - PowerPoint and print-optimized layout with page-break controls
 *   - Responsive design: 3 columns desktop, 2 tablet, 1 mobile
 * 
 * @version 5.38
 * @date 2026-05-19
 */

/**
 * Render complete AS-IS Architecture Dashboard with Three-Lens View
 * @param {Object} dashboardData - Output from mapApplicationsToDashboard() OR window.threeLensData
 * @param {String} containerId - Target container ID
 * @param {Object} options - Rendering options
 */
function renderASISDashboard(dashboardData, containerId = 'dashboard-container', options = {}) {
    const {
        showRegenerateButton = false,
        insights = null // Strategic insights from AI (if generated manually)
    } = options;

    console.log('[ASIS Dashboard Renderer] Rendering dashboard in', containerId);

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('[ASIS Dashboard Renderer] Container not found:', containerId);
        return;
    }

    // V2: Check if two-lens data is available (Business + Technology only)
    const hasThreeLensData = Boolean(
        window.threeLensData?.businessDomains?.length > 0 && 
        window.threeLensData?.technologyDomains?.length > 0
    );

    console.log('[ASIS Dashboard Renderer V2] Two-lens data available:', hasThreeLensData);

    // Generate HTML
    const html = `
        ${renderKPIStrip(dashboardData.kpis, showRegenerateButton)}
        ${hasThreeLensData ? renderThreeLensContent() : renderDomainsSection(dashboardData.domains)}
        ${renderFooter(dashboardData.metadata)}
        ${renderModal()}
    `;

    container.innerHTML = html;

    // Attach event handlers
    // V2: If two-lens data exists, use it for handlers; otherwise use old domains
    if (hasThreeLensData) {
        // For two-lens view, we need to get the active lens domains
        const activeLens = window.activeDashboardLens || 'business';
        const activeDomains = activeLens === 'business' 
            ? window.threeLensData.businessDomains 
            : window.threeLensData.technologyDomains;
        attachDomainCardHandlers(activeDomains || []);
    } else {
        attachDomainCardHandlers(dashboardData.domains);
    }
    
    if (insights && insights.insights && insights.insights.length > 0) {
        attachInsightCardHandlers(insights.insights);
    }
    attachModalHandlers();

    console.log('[ASIS Dashboard Renderer] Dashboard rendered successfully');
    
    // V2: Initialize Strategic Insights from localStorage after render
    if (hasThreeLensData) {
        console.log('[ASIS Dashboard Renderer] 🔍 Scheduling Strategic Insights initialization...');
        // Use setTimeout to ensure DOM is fully ready and engagementManager is loaded
        setTimeout(() => {
            console.log('[ASIS Dashboard Renderer] ⏰ setTimeout fired - calling initStrategicInsights...');
            initStrategicInsights('business');
            initStrategicInsights('technology');
        }, 100);
    }
}

/**
 * Render hero section
 */
function renderHeroSection(metadata) {
    return `
        <div class="asis-hero">
            <div class="asis-hero-content">
                <div class="asis-hero-left">
                    <div class="asis-eyebrow">AS-IS ARCHITECTURE</div>
                    <h1 class="asis-hero-title">
                        ${metadata.accountName} <em>Application Landscape</em>
                    </h1>
                    <div class="asis-hero-sub">
                        ${metadata.industry} • ${metadata.totalApplications} Applications
                    </div>
                </div>
                <div class="asis-hero-right">
                    <div class="asis-hero-meta-label">Report Date</div>
                    <div class="asis-hero-meta-org">${metadata.exportDate}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render KPI strip
 * KPIs are based on Business Capability Domain apps (Lens 1) to align with Strategic Insights
 */
function renderKPIStrip(kpis, showRegenerateButton) {
    const hasThreeLensData = window.threeLensData && window.threeLensData.apps && window.threeLensData.apps.length > 0;
    
    const regenerateBtn = showRegenerateButton ? `
        <button class="btn btn-secondary" onclick="regenerateASISDashboard()" style="margin-left: auto;">
            <i class="fas fa-sync-alt"></i> Regenerate Dashboard
        </button>
    ` : '';
    
    const exportBtn = hasThreeLensData ? `
        <button class="btn btn-success" onclick="exportThreeLensDashboard()" title="Download dashboard as JSON file">
            <i class="fas fa-download"></i> Export Dashboard
        </button>
    ` : '';
    
    const importBtn = `
        <button class="btn btn-primary" onclick="document.getElementById('dashboard-import-input').click()" title="Upload dashboard from JSON file">
            <i class="fas fa-upload"></i> Import Dashboard
        </button>
        <input type="file" id="dashboard-import-input" accept=".json" style="display:none;" onchange="importThreeLensDashboard(event)">
    `;

    return `
        <div class="asis-kpi-strip">
            <div class="asis-kpi-inner">
                <div class="asis-kpi-cell">
                    <div class="asis-kpi-num">${kpis.totalApplications}</div>
                    <div class="asis-kpi-label">Total Applications</div>
                    <div class="asis-kpi-sublabel" style="font-size: 0.7rem; color: #6b7280; margin-top: 2px;">Business Capability View</div>
                </div>
                <div class="asis-kpi-cell">
                    <div class="asis-kpi-num ${kpis.legacySystems > kpis.totalApplications * 0.2 ? 'warn' : ''}">${kpis.legacySystems}</div>
                    <div class="asis-kpi-label">Legacy Systems</div>
                    <div class="asis-kpi-sublabel" style="font-size: 0.7rem; color: #6b7280; margin-top: 2px;">${Math.round((kpis.legacySystems / kpis.totalApplications) * 100)}% of portfolio</div>
                </div>
                <div class="asis-kpi-cell">
                    <div class="asis-kpi-num">${kpis.activeSystems}</div>
                    <div class="asis-kpi-label">Active Systems</div>
                    <div class="asis-kpi-sublabel" style="font-size: 0.7rem; color: #6b7280; margin-top: 2px;">${Math.round((kpis.activeSystems / kpis.totalApplications) * 100)}% operational</div>
                </div>
                <div class="asis-kpi-cell">
                    <div class="asis-kpi-num ${kpis.highRiskApps > 0 ? 'warn' : ''}">${kpis.highRiskApps}</div>
                    <div class="asis-kpi-label">High-Risk Apps</div>
                    <div class="asis-kpi-sublabel" style="font-size: 0.7rem; color: #6b7280; margin-top: 2px;">${kpis.highRiskApps > 0 ? 'Requires attention' : 'Healthy'}</div>
                </div>
            </div>
            <div style="margin-left: auto; display: flex; gap: 8px;">
                ${importBtn}
                ${exportBtn}
                ${regenerateBtn}
            </div>
        </div>
    `;
}

/**
 * Render business domains section
 */
function renderDomainsSection(domains) {
    // Check if Unknown domain exists
    const unknownDomain = domains.find(d => d.name === 'Unknown');
    const analyzeButton = unknownDomain && unknownDomain.count > 0 ? `
        <button class="btn btn-secondary" onclick="analyzeUnknownApplications()" style="background: #7A0049; color: white; border-color: #7A0049;">
            <i class="fas fa-magic"></i> AI: Analyze ${unknownDomain.count} Unknown Apps
        </button>
    ` : '';

    // Get moved apps from session storage
    const movedApps = JSON.parse(sessionStorage.getItem('asis_moved_apps') || '{}');
    
    const domainCards = domains.map((domain, index) => `
        <div class="asis-domain-card ${domain.name === 'Unknown' ? 'domain-unknown' : ''}" 
             data-domain-index="${index}" 
             data-domain-name="${domain.name}"
             style="--card-accent: ${domain.cardAccent}">
            <div class="asis-domain-header">
                <div class="asis-domain-dot" style="background: ${domain.color}"></div>
                <div class="asis-domain-name">${domain.name}</div>
                <div class="asis-domain-count-badge">${domain.count} apps</div>
            </div>
            <div class="asis-app-pills" data-domain-pills="${domain.name}">
                ${domain.apps.map(app => {
                    const isMoved = movedApps[app] && movedApps[app].to === domain.name;
                    const movedStyle = isMoved ? 'background: #FFE4E6 !important; border: 2px solid #FDA4AF; font-weight: 600;' : '';
                    return `<span class="asis-pill ${isMoved ? 'asis-pill-moved' : ''}" data-app-name="${app}" style="${movedStyle}" title="${isMoved ? 'Moved from ' + movedApps[app].from : ''}">${app}</span>`;
                }).join('')}
                ${domain.legacy.map(app => {
                    const isMoved = movedApps[app] && movedApps[app].to === domain.name;
                    const movedStyle = isMoved ? 'background: #FFE4E6 !important; border: 2px solid #FDA4AF; font-weight: 600;' : '';
                    return `<span class="asis-pill asis-pill-legacy ${isMoved ? 'asis-pill-moved' : ''}" data-app-name="${app}" style="${movedStyle}" title="${isMoved ? 'Moved from ' + movedApps[app].from : ''}">${app}</span>`;
                }).join('')}
            </div>
        </div>
    `).join('');

    return `
        <div class="asis-section">
            <div class="asis-section-header">
                <h2 class="asis-section-title">Business Application Domain</h2>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div class="asis-pill-badge">${domains.length} domains</div>
                    ${analyzeButton}
                </div>
            </div>
            <div class="asis-domain-grid">
                ${domainCards}
            </div>
        </div>
    `;
}

/**
 * CRITICAL FIX: Deduplicate apps in domain arrays
 * Removes duplicate applications from all domain arrays based on app.name
 * This fixes duplicates caused by previous drag & drop operations
 */
function deduplicateThreeLensDomainArrays() {
    if (!window.threeLensData) {
        console.warn('[Deduplicate] No threeLensData available');
        return;
    }

    let totalDuplicatesRemoved = 0;

    // Deduplicate each domain type
    ['businessDomains', 'technologyDomains', 'serviceTowers'].forEach(domainType => {
        const domains = window.threeLensData[domainType];
        if (!domains || !Array.isArray(domains)) return;

        domains.forEach(domain => {
            if (!domain.apps || !Array.isArray(domain.apps)) return;

            const originalLength = domain.apps.length;
            
            // Remove duplicates using Map to track unique app names
            const uniqueApps = new Map();
            domain.apps.forEach(app => {
                if (!uniqueApps.has(app.name)) {
                    uniqueApps.set(app.name, app);
                }
            });
            
            domain.apps = Array.from(uniqueApps.values());
            
            const duplicatesRemoved = originalLength - domain.apps.length;
            if (duplicatesRemoved > 0) {
                totalDuplicatesRemoved += duplicatesRemoved;
                console.log(`[Deduplicate] ✅ Removed ${duplicatesRemoved} duplicates from ${domain.name} (${domainType})`);
            }
        });
    });

    if (totalDuplicatesRemoved > 0) {
        console.log(`[Deduplicate] ✅ Total duplicates removed: ${totalDuplicatesRemoved}`);
        
        // Save cleaned data back to localStorage
        const engagementManager = window.engagementManager;
        const currentEngagement = engagementManager?.getCurrentEngagement();
        if (currentEngagement?.id && window.saveThreeLensDashboardData) {
            window.saveThreeLensDashboardData(currentEngagement.id, window.threeLensData);
            console.log(`[Deduplicate] ✅ Saved cleaned data to localStorage`);
        }
    } else {
        console.log(`[Deduplicate] No duplicates found`);
    }

    return totalDuplicatesRemoved;
}

/**
 * Render two-lens tabs (Business | Technology)
 * V2: Service Tower tab removed - moved to WhiteSpot Heatmap
 */
function renderThreeLensTabs() {
    return `
        <div class="three-lens-tabs" style="
            background: white;
            border-radius: 12px;
            padding: 16px 24px;
            margin: 24px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            display: flex;
            gap: 8px;
            align-items: center;
        ">
            <div style="font-weight: 600; color: var(--ea-primary); margin-right: 16px;">
                <i class="fas fa-layer-group"></i> Classification View:
            </div>
            <button class="three-lens-tab active" data-lens="business" onclick="switchThreeLens('business')" style="
                padding: 10px 24px;
                border: 2px solid var(--ea-accent);
                background: var(--ea-accent);
                color: white;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">
                <i class="fas fa-building"></i> Business Domains
            </button>
            <button class="three-lens-tab" data-lens="technology" onclick="switchThreeLens('technology')" style="
                padding: 10px 24px;
                border: 2px solid #ddd;
                background: white;
                color: #666;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">
                <i class="fas fa-microchip"></i> Technology Domains
            </button>
            <!-- Service Tower tab removed - moved to WhiteSpot Heatmap -->
        </div>
    `;
}

/**
 * Render three-lens content containers
 */
function renderThreeLensContent() {
    const data = window.threeLensData;
    if (!data) {
        console.error('[Three-Lens] No three-lens data available');
        return '';
    }

    // CRITICAL FIX: Deduplicate domain arrays before rendering
    deduplicateThreeLensDomainArrays();

    console.log('[Three-Lens] Rendering content:', {
        businessDomains: data.businessDomains?.length || 0,
        technologyDomains: data.technologyDomains?.length || 0,
        serviceTowers: data.serviceTowers?.length || 0,
        apps: data.apps?.length || 0
    });

    return `
        <style>
            .three-lens-view {
                display: none !important;
            }
            .three-lens-view.active {
                display: block !important;
            }
            
            /* V2: Unknown Domain Styling */
            .asis-domain-unknown {
                background: #fff7ed !important;
                border: 2px dashed #f59e0b !important;
            }
            
            .asis-unknown-actions {
                display: flex;
                gap: 12px;
                margin: 12px 0;
            }
            
            .asis-unknown-button {
                flex: 1;
                padding: 10px 16px;
                border: 2px solid #f59e0b;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                background: white;
                color: #92400e;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .asis-unknown-button:hover {
                background: #f59e0b;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
            
            .asis-unknown-ai {
                border-color: #7A0049;
                color: #7A0049;
            }
            
            .asis-unknown-ai:hover {
                background: #7A0049;
                color: white;
                box-shadow: 0 4px 12px rgba(122, 0, 73, 0.3);
            }
            
            .asis-pill-unknown {
                background: #fef3c7 !important;
                border: 2px solid #f59e0b !important;
                color: #92400e !important;
                font-weight: 600;
                cursor: move;
            }
            
            /* V2: AI-Classified Apps Styling */
            .asis-pill-ai {
                background: #e0f2fe !important;
                border: 2px solid #0ea5e9 !important;
                color: #075985 !important;
            }
            
            .asis-pill-ai i {
                font-size: 10px;
                margin-left: 4px;
                color: #0ea5e9;
            }
        </style>
        <div id="three-lens-business" class="three-lens-view active">
            ${renderThreeLensDomains(data.businessDomains, 'business', 'Business Capability Domains')}
        </div>
        <div id="three-lens-technology" class="three-lens-view">
            ${renderThreeLensDomains(data.technologyDomains, 'technology', 'Technology Domains')}
        </div>
        <!-- V2: Service Tower view removed - moved to WhiteSpot Heatmap -->
    `;
}

/**
 * Render a set of three-lens domains
 */
function renderThreeLensDomains(domains, lensType, title) {
    console.log(`[Renderer] renderThreeLensDomains called for ${title}:`, {
        count: domains?.length || 0,
        names: domains?.map(d => d.name) || []
    });
    
    if (!domains || domains.length === 0) {
        return `<div class="empty-state">No ${title} data available</div>`;
    }

    // ENHANCEMENT: Filter out empty domains (domains with 0 apps)
    const nonEmptyDomains = domains.filter(domain => {
        const apps = domain.apps || [];
        return apps.length > 0;
    });

    console.log(`[Renderer] ✅ Filtered ${domains.length - nonEmptyDomains.length} empty domains. Showing ${nonEmptyDomains.length} domains with applications.`);

    // V2: Sort domains - Unknown domain always last
    const sortedDomains = [...nonEmptyDomains].sort((a, b) => {
        if (a.name === 'Unknown') return 1;
        if (b.name === 'Unknown') return -1;
        return 0; // Keep original order for other domains
    });

    const domainCards = sortedDomains.map((domain, index) => {
        // V2 FIX: Use apps array already stored in domain object
        // Each domain's apps array was populated during generateTwoLensDashboardFromData()
        const apps = domain.apps || [];

        const color = domain.color || '#006B3F';
        const cardAccent = domain.cardAccent || '#f0fdf4';
        const isUnknown = domain.name === 'Unknown';

        // V2: Special rendering for Unknown domain
        if (isUnknown) {
            return `
                <div class="asis-domain-card asis-domain-unknown" 
                     data-lens-type="${lensType}"
                     data-domain-name="${domain.name}"
                     style="--card-accent: #fff7ed; border: 2px dashed ${color};">
                    <div class="asis-domain-header">
                        <div class="asis-domain-dot" style="background: ${color}"></div>
                        <div class="asis-domain-name" style="color: ${color}">${domain.name}</div>
                        <div class="asis-domain-count-badge" style="background: ${color}; color: white">${apps.length} apps</div>
                    </div>
                    <div class="asis-unknown-actions">
                        <button class="asis-unknown-button asis-unknown-ai" 
                                data-lens-type="${lensType}"
                                onclick="classifyUnknownDomainsWithAI('${lensType}')"
                                title="Use AI to automatically classify these applications">
                            <i class="fas fa-robot"></i> Classify with AI
                        </button>
                        <button class="asis-unknown-button asis-unknown-manual" 
                                title="Drag applications manually to the correct domain">
                            <i class="fas fa-hand-paper"></i> Drag manually
                        </button>
                    </div>
                    <div class="asis-app-pills">
                        ${apps.map(app => `
                            <span class="asis-pill asis-pill-unknown" data-app-name="${app.name}" draggable="true"
                                  title="Drag to correct domain or click 'Classify with AI'">${app.name}</span>
                        `).join('')}
                    </div>
                    <div class="asis-domain-desc" style="color: #92400e; background: #fef3c7; padding: 8px; border-radius: 4px; margin-top: 8px;">
                        <i class="fas fa-info-circle"></i> These applications need classification. Use AI or drag them to the correct domain.
                    </div>
                </div>
            `;
        }

        // Regular domain card
        return `
            <div class="asis-domain-card" 
                 data-lens-type="${lensType}"
                 data-domain-name="${domain.name}"
                 style="--card-accent: ${cardAccent}">
                <div class="asis-domain-header">
                    <div class="asis-domain-dot" style="background: ${color}"></div>
                    <div class="asis-domain-name">${domain.name}</div>
                    <div class="asis-domain-count-badge">${apps.length} apps</div>
                </div>
                <div class="asis-app-pills">
                    ${apps.map(app => {
                        // V2: Mark AI-classified apps with visual indicator
                        const isAIClassified = app._classificationSource === 'ai';
                        const aiClass = isAIClassified ? 'asis-pill-ai' : '';
                        const aiIndicator = isAIClassified ? '<i class="fas fa-robot" style="font-size: 10px; margin-left: 4px;"></i>' : '';
                        
                        return `
                            <span class="asis-pill ${aiClass}" 
                                  data-app-name="${app.name}" 
                                  draggable="true"
                                  title="${isAIClassified ? 'Classified by AI' : 'From existing data'}">
                                ${app.name}${aiIndicator}
                            </span>
                        `;
                    }).join('')}
                </div>
                ${domain.description ? `<div class="asis-domain-desc">${domain.description}</div>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="asis-section">
            <div class="asis-section-header">
                <h2 class="asis-section-title">${title}</h2>
                <div class="asis-pill-badge">${sortedDomains.length} domains · ${window.threeLensData.apps.length} apps</div>
            </div>
            <div class="asis-domain-grid">
                ${domainCards}
            </div>
        </div>
        ${renderLensSpecificStrategicInsights(lensType)}
    `;
}

/**
 * Switch between three-lens views
 */
function switchThreeLens(lensType) {
    console.log('[Three-Lens] Switching to:', lensType);

    // Update tab styles
    document.querySelectorAll('.three-lens-tab').forEach(tab => {
        const isActive = tab.dataset.lens === lensType;
        tab.classList.toggle('active', isActive);
        if (isActive) {
            tab.style.background = 'var(--ea-accent)';
            tab.style.color = 'white';
            tab.style.borderColor = 'var(--ea-accent)';
        } else {
            tab.style.background = 'white';
            tab.style.color = '#666';
            tab.style.borderColor = '#ddd';
        }
    });

    // Update content visibility using CSS classes (works with !important rules)
    document.querySelectorAll('.three-lens-view').forEach(view => {
        view.classList.remove('active');
    });
    const activeView = document.getElementById(`three-lens-${lensType}`);
    if (activeView) {
        activeView.classList.add('active');
        console.log('[Three-Lens] Activated view:', lensType);
        
        // V2: Re-attach domain card handlers for the active lens
        if (window.threeLensData) {
            const activeDomains = lensType === 'business' 
                ? window.threeLensData.businessDomains 
                : window.threeLensData.technologyDomains;
            
            // Update global active lens tracker
            window.activeDashboardLens = lensType;
            
            // Re-initialize drag-and-drop for the new lens
            setTimeout(() => {
                attachDomainCardHandlers(activeDomains || []);
            }, 50);
        }
        
        // Load Strategic Insights from localStorage when switching tabs
        console.log(`[Three-Lens] 🔍 Scheduling insights init for ${lensType} tab...`);
        setTimeout(() => {
            console.log(`[Three-Lens] ⏰ setTimeout fired for ${lensType} - calling initStrategicInsights...`);
            initStrategicInsights(lensType);
        }, 100);
    } else {
        console.error('[Three-Lens] Could not find view element:', `three-lens-${lensType}`);
    }
}

/**
 * Render architecture layers section
 */
function renderArchitectureLayersSection(layers) {
    const layerBars = layers.map(layer => `
        <div class="asis-arch-layer">
            <div class="asis-arch-layer-bar" style="background: ${layer.barColor}"></div>
            <div class="asis-arch-layer-label">
                <div class="asis-arch-layer-name">${layer.name}</div>
                <div class="asis-arch-layer-count">${layer.count} apps</div>
            </div>
            <div class="asis-arch-layer-content">
                ${layer.tags.map(tag => `
                    <span class="asis-arch-tag" style="background: ${tag.bg}; color: ${tag.text}">
                        ${tag.name}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');

    const layerKey = `
        <div class="asis-arch-key">
            <span>Legend:</span>
            <span><span class="asis-arch-key-dot" style="background: #E8F5E9"></span> Active</span>
            <span><span class="asis-arch-key-dot" style="background: #FEF3C7"></span> Legacy</span>
        </div>
    `;

    return `
        <div class="asis-section">
            <div class="asis-section-header">
                <h2 class="asis-section-title">Architecture Layers</h2>
                <div class="asis-pill-badge">${layers.length} layers</div>
            </div>
            <div class="asis-arch-wrapper">
                ${layerKey}
                ${layerBars}
            </div>
        </div>
    `;
}

/**
 * Render lens-specific strategic insights section
 * Returns placeholder HTML with unique ID - actual insights loaded post-render via initStrategicInsights()
 * @param {string} lensType - 'business' or 'technology'
 */
function renderLensSpecificStrategicInsights(lensType) {
    const lensTitle = lensType === 'business' ? 'Business Domain' : 'Technology Stack';
    const lensIcon = lensType === 'business' ? 'fa-building' : 'fa-server';
    
    // Return placeholder - will be populated by initStrategicInsights() after render
    return `
        <div class="asis-section asis-insights-wrapper-${lensType}" id="strategic-insights-${lensType}" style="margin-top: 32px;">
            <div class="asis-section-header" style="display: flex; align-items: center; justify-content: space-between;">
                <h2 class="asis-section-title" style="margin: 0;">
                    <i class="${lensIcon}" style="color: var(--ea-accent); margin-right: 8px;"></i>
                    EA Portfolio Analysis (${lensTitle})
                </h2>
                <button class="btn btn-primary btn-sm" 
                        id="regenerate-insights-btn-${lensType}" 
                        onclick="regenerateASISInsights('${lensType}')" 
                        disabled
                        title="Make changes to the portfolio to enable regeneration"
                        style="opacity: 0.5; cursor: not-allowed;">
                    <i class="fas fa-sync-alt"></i> Regenerate Analysis
                </button>
            </div>
            <div class="asis-insights-empty" id="insights-placeholder-${lensType}">
                <p style="color: #666; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-hourglass-half" style="font-size: 24px; display: block; margin-bottom: 12px;"></i>
                    Loading insights...
                </p>
            </div>
            <div id="insights-results-container-${lensType}" style="display: none;"></div>
        </div>
    `;
}

/**
 * Initialize EA Portfolio Analysis after dashboard render
 * Loads insights from localStorage and updates DOM
 * @param {string} lensType - 'business' or 'technology'
 */
function initStrategicInsights(lensType) {
    console.log(`[EA Portfolio Analysis Init] 🔍 Function called for ${lensType} lens`);
    
    // Deep inspection of engagementManager
    console.log(`[EA Portfolio Analysis Init] 🔬 Deep inspection:`, {
        hasWindow: typeof window !== 'undefined',
        hasEngagementManager: !!window.engagementManager,
        engagementManagerType: typeof window.engagementManager,
        hasGetCurrent: !!window.engagementManager?.getCurrentEngagement,
        getCurrentType: typeof window.engagementManager?.getCurrentEngagement
    });
    
    // Get current engagement (returns { engagement: { id, ... }, ... })
    const currentEngagement = window.engagementManager?.getCurrentEngagement?.();
    
    // CORRECT PROPERTY PATH: engagement.id (nested structure)
    const engagementId = currentEngagement?.engagement?.id;
    
    console.log(`[EA Portfolio Analysis Init] 🔍 Engagement check:`, {
        hasModel: !!currentEngagement,
        hasEngagement: !!currentEngagement?.engagement,
        engagementId: engagementId || 'NOT FOUND'
    });
    
    if (!engagementId) {
        console.warn(`[EA Portfolio Analysis Init] ⚠️ No engagement loaded yet for ${lensType} lens - will retry on next render`);
        return;
    }
    
    const storageKey = `ea_three_lens_insights_${lensType}_${engagementId}`;
    const savedInsights = localStorage.getItem(storageKey);
    const insightsData = savedInsights ? JSON.parse(savedInsights) : null;
    
    console.log(`[EA Portfolio Analysis Init] Loading ${lensType} insights:`, {
        engagementId,
        storageKey,
        hasInsights: !!savedInsights,
        insightsCount: insightsData?.insights?.length || 0
    });
    
    // If insights exist, use the new card grid renderer
    if (insightsData && insightsData.insights && insightsData.insights.length > 0) {
        console.log(`[EA Portfolio Analysis Init] ✅ Found ${insightsData.insights.length} ${lensType} insights, rendering with card grid`);
        renderLensInsightsResults(insightsData, lensType);
        
        // Enable regenerate button if insights exist
        enableRegenerateButton(lensType, false); // false = not due to changes, just showing existing insights
    } else {
        console.log(`[EA Portfolio Analysis Init] No insights found for ${lensType} lens`);
    }
}

/**
 * Render strategic insights section (AI-generated)
 * @param {Object} insightsData - { insights: [], executiveSummary: {}, domainRecommendations: [] } or null
 */
function renderStrategicInsightsSection(insightsData) {
    // If no insights data, show "Generate with AI" button
    if (!insightsData || !insightsData.insights || insightsData.insights.length === 0) {
        return `
            <div class="asis-section">
                <div class="asis-section-header">
                    <h2 class="asis-section-title">Strategic Insights</h2>
                    <div class="asis-pill-badge">0 insights</div>
                </div>
                <div class="asis-insights-empty">
                    <div class="asis-insights-empty-icon"><i class="fas fa-robot"></i></div>
                    <h3 class="asis-insights-empty-title">AI-Powered Architecture Analysis</h3>
                    <p class="asis-insights-empty-text">
                        Generate executive summary and strategic insights using AI Assistant. 
                        The analysis will include architecture health assessment, TO-BE recommendations, 
                        and domain-specific transformation guidance.
                    </p>
                    <button class="btn btn-primary btn-lg" onclick="generateASISInsights()" id="generate-insights-btn">
                        <i class="fas fa-sparkles"></i> Generate Strategic Insights
                    </button>
                </div>
                <div id="insights-results-container" style="display: none;"></div>
            </div>
        `;
    }

    const { insights, executiveSummary, domainRecommendations } = insightsData;

    // Executive Summary Card
    const executiveSummaryCard = executiveSummary ? `
        <div class="asis-executive-summary">
            <div class="asis-exec-header">
                <div class="asis-exec-icon"><i class="fas fa-chart-line"></i></div>
                <div class="asis-exec-title-section">
                    <h3 class="asis-exec-title">Executive Summary</h3>
                    <div class="asis-exec-health">
                        <span class="asis-health-badge asis-health-${executiveSummary.overallHealth.toLowerCase()}">
                            ${executiveSummary.overallHealth}
                        </span>
                        <span class="asis-health-score">${executiveSummary.healthScore}/100</span>
                    </div>
                </div>
            </div>
            <div class="asis-exec-body">
                <p class="asis-exec-summary">${executiveSummary.summary}</p>
                <div class="asis-exec-actions">
                    <h4>Critical Actions</h4>
                    ${executiveSummary.criticalActions.map(action => `
                        <div class="asis-exec-action"><i class="fas fa-check-circle"></i> ${action}</div>
                    `).join('')}
                </div>
            </div>
            ${domainRecommendations && domainRecommendations.length > 0 ? `
                <div class="asis-exec-domains">
                    <h4>Domain-Specific Recommendations</h4>
                    ${domainRecommendations.map(rec => `
                        <div class="asis-domain-rec">
                            <div class="asis-domain-rec-name">${rec.domain}</div>
                            <div class="asis-domain-rec-row">
                                <span class="asis-domain-rec-label">Current:</span>
                                <span class="asis-domain-rec-text">${rec.currentState}</span>
                            </div>
                            <div class="asis-domain-rec-row">
                                <span class="asis-domain-rec-label">Future:</span>
                                <span class="asis-domain-rec-text">${rec.futureState}</span>
                            </div>
                            <div class="asis-domain-rec-actions">
                                ${rec.recommendations.slice(0, 3).map(r => `<div class="asis-domain-rec-item">→ ${r}</div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    ` : '';

    // Insight Cards
    const insightCards = insights.map((insight, index) => `
        <div class="asis-insight-card" data-insight-index="${index}">
            <div class="asis-insight-tag asis-tag-${insight.tag}">${insight.tagLabel}</div>
            <div class="asis-insight-icon-wrap" style="background: ${insight.iconBg}; color: ${insight.iconColor}">
                ${insight.icon}
            </div>
            <div class="asis-insight-card-title">${insight.title}</div>
            <div class="asis-insight-card-body">${insight.body}</div>
        </div>
    `).join('');

    return `
        <div class="asis-section">
            <div class="asis-section-header">
                <h2 class="asis-section-title">Strategic Insights</h2>
                <div class="asis-pill-badge">${insights.length} insights</div>
                <button class="btn btn-secondary btn-sm" onclick="regenerateASISInsights()" style="margin-left: auto;">
                    <i class="fas fa-sync-alt"></i> Regenerate
                </button>
            </div>
            ${executiveSummaryCard}
            <div class="asis-insight-grid" style="${executiveSummaryCard ? 'margin-top: 24px;' : ''}">
                ${insightCards}
            </div>
        </div>
    `;
}

/**
 * Render risk snapshot section
 */
function renderRiskSnapshotSection(riskSnapshot) {
    const riskCells = riskSnapshot.map(cell => `
        <div class="asis-risk-cell">
            <div class="asis-risk-label">${cell.label}</div>
            <div class="asis-risk-value ${cell.danger ? 'danger' : ''}">${cell.value}</div>
            <div class="asis-risk-desc">${cell.description}</div>
        </div>
    `).join('');

    return `
        <div class="asis-risk-section">
            <div class="asis-risk-inner">
                <h2 class="asis-risk-title">Risk Snapshot</h2>
                <div class="asis-risk-grid">
                    ${riskCells}
                </div>
            </div>
        </div>
    `;
}

/**
 * Render footer
 */
function renderFooter(metadata) {
    return `
        <div class="asis-footer">
            <div class="asis-footer-inner">
                <div class="asis-footer-text">
                    Generated by NextGenEA AS-IS Architecture Dashboard • ${metadata.exportDate}
                </div>
            </div>
        </div>
    `;
}

/**
 * Render modal (single reusable modal)
 */
function renderModal() {
    return `
        <div id="asis-modal-overlay" class="asis-modal-overlay">
            <div class="asis-modal">
                <div class="asis-modal-header">
                    <div class="asis-modal-dot" id="asis-modal-dot"></div>
                    <h3 class="asis-modal-title" id="asis-modal-title"></h3>
                    <button class="asis-modal-close" id="asis-modal-close">&times;</button>
                </div>
                <div class="asis-modal-body">
                    <p id="asis-modal-desc"></p>
                    <div id="asis-modal-apps-section" class="asis-modal-apps-section">
                        <h4>Applications</h4>
                        <div id="asis-modal-apps" class="asis-modal-pills"></div>
                    </div>
                    <div class="asis-modal-recs">
                        <h4>Recommendations</h4>
                        <div id="asis-modal-recs"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event handlers to domain cards
 */
function attachDomainCardHandlers(domains) {
    // Click handlers for domain cards
    document.querySelectorAll('.asis-domain-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking on a pill (draggable)
            if (e.target.classList.contains('asis-pill')) return;
            openDomainModal(domains[index]);
        });
    });

    // Drag-and-drop handlers for application pills
    initializeDragAndDrop(domains);
}

/**
 * Initialize drag-and-drop for application pills
 */
function initializeDragAndDrop(domains) {
    console.log('[Drag-Drop] Initializing drag and drop for', document.querySelectorAll('.asis-pill').length, 'application pills');
    
    // Make pills draggable
    document.querySelectorAll('.asis-pill').forEach((pill, index) => {
        // Skip if not an app pill (no data-app-name)
        if (!pill.getAttribute('data-app-name')) {
            console.log('[Drag-Drop] Skipping pill without data-app-name:', pill.textContent);
            return;
        }
        
        pill.draggable = true;
        pill.style.cursor = 'grab';
        pill.style.userSelect = 'none';
        pill.title = pill.title || 'Drag to move between domains';
        
        // Visual feedback on hover
        pill.addEventListener('mouseenter', () => {
            if (!pill.classList.contains('dragging')) {
                pill.style.transform = 'scale(1.05)';
                pill.style.transition = 'transform 0.2s';
            }
        });
        
        pill.addEventListener('mouseleave', () => {
            if (!pill.classList.contains('dragging')) {
                pill.style.transform = '';
            }
        });

        pill.addEventListener('dragstart', (e) => {
            e.stopPropagation(); // Don't trigger card click
            const appName = pill.getAttribute('data-app-name');
            const sourceCard = pill.closest('.asis-domain-card');
            const sourceDomain = sourceCard ? sourceCard.getAttribute('data-domain-name') : 'Unknown';
            const sourceLensType = sourceCard ? sourceCard.getAttribute('data-lens-type') : 'business';
            
            if (!appName) {
                console.error('[Drag-Drop] No app name on pill!', pill);
                e.preventDefault();
                return;
            }
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/x-app-name', appName);
            e.dataTransfer.setData('application/x-source-domain', sourceDomain);
            e.dataTransfer.setData('application/x-lens-type', sourceLensType); // Pass lens type
            
            pill.style.opacity = '0.4';
            pill.style.cursor = 'grabbing';
            pill.classList.add('dragging');
            console.log('✅ [Drag-Drop] Started dragging:', appName, 'from', sourceDomain, '(lens:', sourceLensType + ')');
        });

        pill.addEventListener('dragend', (e) => {
            pill.style.opacity = '1';
            pill.style.cursor = 'grab';
            pill.style.transform = '';
            pill.classList.remove('dragging');
            console.log('🏁 [Drag-Drop] Drag ended');
        });
        
        if (index === 0) {
            console.log('🔍 [Drag-Drop] Sample pill setup:', {
                appName: pill.getAttribute('data-app-name'),
                draggable: pill.draggable,
                cursor: pill.style.cursor
            });
        }
    });

    // Make domain cards drop zones
    const domainCards = document.querySelectorAll('.asis-domain-card');
    console.log('[Drag-Drop] Setting up', domainCards.length, 'domain cards as drop zones');
    
    domainCards.forEach((card, index) => {
        const domainName = card.getAttribute('data-domain-name');
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            card.style.background = '#F0FDF4';
            card.style.borderColor = '#10b981';
            card.style.borderWidth = '2px';
            card.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        });

        card.addEventListener('dragleave', (e) => {
            // Only reset if leaving the card completely (not entering a child)
            if (e.target === card) {
                card.style.background = '';
                card.style.borderColor = '';
                card.style.borderWidth = '';
                card.style.boxShadow = '';
            }
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            card.style.background = '';
            card.style.borderColor = '';
            card.style.borderWidth = '';
            card.style.boxShadow = '';

            const appName = e.dataTransfer.getData('application/x-app-name');
            const sourceDomain = e.dataTransfer.getData('application/x-source-domain');
            const targetDomain = card.getAttribute('data-domain-name');
            const lensType = card.getAttribute('data-lens-type'); // Get lens type from card

            console.log('📦 [Drag-Drop] Drop event:', { appName, sourceDomain, targetDomain, lensType });

            if (!appName) {
                console.error('❌ [Drag-Drop] No app name in drop data!');
                return;
            }

            if (sourceDomain === targetDomain) {
                console.log('⚠️ [Drag-Drop] Same domain, no action');
                showASISNotification(`${appName} is already in ${targetDomain}`, 'info');
                return;
            }

            console.log('✅ [Drag-Drop] Moving', appName, 'from', sourceDomain, 'to', targetDomain, 'in', lensType, 'lens');
            moveApplicationToDomain(appName, sourceDomain, targetDomain, lensType);
        });
        
        if (index === 0) {
            console.log('🔍 [Drag-Drop] Sample drop zone setup:', {
                domainName,
                hasListeners: true
            });
        }
    });
    
    console.log('✅ [Drag-Drop] Initialization complete!');
}

/**
 * Move application to a different domain
 * @param {string} appName - Application name
 * @param {string} sourceDomain - Source domain name
 * @param {string} targetDomain - Target domain name
 * @param {string} lensType - Lens type: 'business', 'technology', or 'serviceTower'
 */
function moveApplicationToDomain(appName, sourceDomain, targetDomain, lensType = 'business') {
    // CRITICAL FIX: Deduplicate before moving to ensure clean state
    deduplicateThreeLensDomainArrays();
    
    const engagementManager = window.engagementManager;
    if (!engagementManager) {
        alert('Engagement Manager not available');
        return;
    }

    // Find application by name
    const allApplications = engagementManager.getEntities('applications') || [];
    const app = allApplications.find(a => a.name === appName);
    
    // Mark that portfolio has changed - enable regenerate button
    markPortfolioAsChanged(lensType);

    if (!app) {
        console.error('[Drag-Drop] Application not found:', appName);
        return;
    }

    // Update ONLY the specific lens classification field
    // Do NOT update other lens classifications - they are independent!
    let lensFieldName = '';
    let lensDisplayName = '';
    
    if (lensType === 'business') {
        app.businessDomain = targetDomain;
        app.department = targetDomain; // Keep in sync for legacy compatibility
        lensFieldName = 'businessDomain';
        lensDisplayName = 'Business Domain';
        console.log(`[Drag-Drop] ✅ Updated Business Domain: ${targetDomain}`);
    } else if (lensType === 'technology') {
        app.technologyDomain = targetDomain;
        app.technologyStack = targetDomain; // ENHANCEMENT: Also update Technology Stack attribute
        lensFieldName = 'technologyDomain';
        lensDisplayName = 'Technology Domain';
        console.log(`[Drag-Drop] ✅ Updated Technology Domain AND Technology Stack: ${targetDomain}`);
    } else if (lensType === 'serviceTower') {
        app.serviceTower = targetDomain;
        lensFieldName = 'serviceTower';
        lensDisplayName = 'Service Tower';
    }
    
    // Mark as user override (so AI doesn't overwrite on next generation)
    if (!app._userOverrides) {
        app._userOverrides = {};
    }
    app._userOverrides[lensFieldName] = {
        value: targetDomain,
        timestamp: Date.now(),
        fromDomain: sourceDomain
    };
    
    console.log(`[Drag-Drop] Updated ${lensDisplayName}: ${sourceDomain} → ${targetDomain}`);
    
    engagementManager.updateEntity('applications', app.id, app);

    // Track moved apps in session storage for persistence across refreshes
    const movedApps = JSON.parse(sessionStorage.getItem('asis_moved_apps') || '{}');
    const moveKey = `${appName}:${lensType}`;
    movedApps[moveKey] = {
        appName,
        lensType,
        from: sourceDomain,
        to: targetDomain,
        timestamp: Date.now()
    };
    sessionStorage.setItem('asis_moved_apps', JSON.stringify(movedApps));

    // Update three-lens data in memory ONLY for the specific lens
    if (window.threeLensData && window.threeLensData.apps) {
        const threeLensApp = window.threeLensData.apps.find(a => a.name === appName);
        if (threeLensApp) {
            if (lensType === 'business') {
                threeLensApp.businessDomain = targetDomain;
            } else if (lensType === 'technology') {
                threeLensApp.technologyDomain = targetDomain;
            } else if (lensType === 'serviceTower') {
                threeLensApp.serviceTower = targetDomain;
            }
            console.log(`[Drag-Drop] Updated three-lens data (${lensType} only) for: ${appName}`);
            
            // CRITICAL: Update domain arrays - move app from source to target domain
            const domainsArray = lensType === 'business' 
                ? window.threeLensData.businessDomains 
                : lensType === 'technology' 
                ? window.threeLensData.technologyDomains 
                : window.threeLensData.serviceTowers;
            
            if (domainsArray) {
                // CRITICAL FIX: Remove app from ALL domains first to prevent duplicates
                // This handles edge cases where app might exist in multiple domains
                domainsArray.forEach(domain => {
                    if (domain.apps) {
                        const appIndex = domain.apps.findIndex(a => a.name === appName);
                        if (appIndex > -1) {
                            domain.apps.splice(appIndex, 1);
                            console.log(`[Drag-Drop] ✅ Removed ${appName} from ${domain.name} (${domain.apps.length} apps remaining)`);
                        }
                    }
                });
                
                // Add app to target domain's apps array
                let targetDomainObj = domainsArray.find(d => d.name === targetDomain);
                if (!targetDomainObj) {
                    // Create domain if it doesn't exist
                    targetDomainObj = {
                        name: targetDomain,
                        apps: [],
                        color: '#006B3F',
                        cardAccent: '#f0fdf4'
                    };
                    domainsArray.push(targetDomainObj);
                    console.log(`[Drag-Drop] ✅ Created new domain: ${targetDomain}`);
                }
                if (!targetDomainObj.apps) {
                    targetDomainObj.apps = [];
                }
                
                // CRITICAL FIX: Check if app already exists in target before adding (extra safety)
                const alreadyExists = targetDomainObj.apps.some(a => a.name === appName);
                if (!alreadyExists) {
                    targetDomainObj.apps.push(threeLensApp);
                    console.log(`[Drag-Drop] ✅ Added ${appName} to ${targetDomain} (${targetDomainObj.apps.length} apps total)`);
                } else {
                    console.log(`[Drag-Drop] ⚠️ ${appName} already exists in ${targetDomain}, skipping add`);
                }
            }
            
            // Save updated three-lens data back to localStorage
            const engagementManager = window.engagementManager;
            const currentEngagement = engagementManager?.getCurrentEngagement();
            if (currentEngagement?.id && window.saveThreeLensDashboardData) {
                window.saveThreeLensDashboardData(currentEngagement.id, window.threeLensData);
                console.log(`[Drag-Drop] ✅ Saved updated three-lens data to localStorage`);
            }
        }
    }

    // DON'T mark dashboard as stale - drag & drop updates attributes directly
    // No need for AI regeneration
    // invalidateASISDashboard(); // REMOVED - manual classification doesn't need regeneration
    
    // Re-render ONLY the current lens view to show visual update (NO full reload)
    if (window.threeLensData) {
        console.log(`[Drag-Drop] Re-rendering ${lensType} view only`);
        
        // Get the correct domains array and title
        let domainsArray, viewTitle, viewId;
        if (lensType === 'business') {
            domainsArray = window.threeLensData.businessDomains;
            viewTitle = 'Business Capability Domains';
            viewId = 'three-lens-business';
        } else if (lensType === 'technology') {
            domainsArray = window.threeLensData.technologyDomains;
            viewTitle = 'Technology Domains';
            viewId = 'three-lens-technology';
        } else if (lensType === 'serviceTower') {
            domainsArray = window.threeLensData.serviceTowers;
            viewTitle = 'Service Towers';
            viewId = 'three-lens-serviceTower';
        }
        
        // Re-render only this specific lens view
        const viewContainer = document.getElementById(viewId);
        if (viewContainer && domainsArray) {
            viewContainer.innerHTML = renderThreeLensDomains(domainsArray, lensType, viewTitle);
            
            // Re-attach drag & drop handlers ONLY for pills and cards in this view
            const pills = viewContainer.querySelectorAll('.asis-pill');
            const cards = viewContainer.querySelectorAll('.asis-domain-card');
            
            console.log(`[Drag-Drop] Re-attaching handlers: ${pills.length} pills, ${cards.length} cards`);
            
            // Make pills draggable
            pills.forEach(pill => {
                if (!pill.getAttribute('data-app-name')) return;
                
                pill.draggable = true;
                pill.style.cursor = 'grab';
                pill.style.userSelect = 'none';
                pill.title = pill.title || 'Drag to move between domains';
                
                pill.addEventListener('mouseenter', () => {
                    if (!pill.classList.contains('dragging')) {
                        pill.style.transform = 'scale(1.05)';
                        pill.style.transition = 'transform 0.2s';
                    }
                });
                
                pill.addEventListener('mouseleave', () => {
                    if (!pill.classList.contains('dragging')) {
                        pill.style.transform = '';
                    }
                });

                pill.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                    const appName = pill.getAttribute('data-app-name');
                    const sourceCard = pill.closest('.asis-domain-card');
                    const sourceDomain = sourceCard ? sourceCard.getAttribute('data-domain-name') : 'Unknown';
                    const sourceLensType = sourceCard ? sourceCard.getAttribute('data-lens-type') : 'business';
                    
                    if (!appName) {
                        e.preventDefault();
                        return;
                    }
                    
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('application/x-app-name', appName);
                    e.dataTransfer.setData('application/x-source-domain', sourceDomain);
                    e.dataTransfer.setData('application/x-lens-type', sourceLensType);
                    
                    pill.style.opacity = '0.4';
                    pill.style.cursor = 'grabbing';
                    pill.classList.add('dragging');
                });

                pill.addEventListener('dragend', (e) => {
                    pill.style.opacity = '1';
                    pill.style.cursor = 'grab';
                    pill.style.transform = '';
                    pill.classList.remove('dragging');
                });
            });
            
            // Make cards drop zones
            cards.forEach(card => {
                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    card.style.background = '#F0FDF4';
                    card.style.borderColor = '#10b981';
                    card.style.borderWidth = '2px';
                    card.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
                });

                card.addEventListener('dragleave', (e) => {
                    if (e.target === card) {
                        card.style.background = '';
                        card.style.borderColor = '';
                        card.style.borderWidth = '';
                        card.style.boxShadow = '';
                    }
                });

                card.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    card.style.background = '';
                    card.style.borderColor = '';
                    card.style.borderWidth = '';
                    card.style.boxShadow = '';

                    const appName = e.dataTransfer.getData('application/x-app-name');
                    const sourceDomain = e.dataTransfer.getData('application/x-source-domain');
                    const targetDomain = card.getAttribute('data-domain-name');
                    const lensType = card.getAttribute('data-lens-type');

                    if (!appName) return;

                    if (sourceDomain === targetDomain) {
                        showASISNotification(`${appName} is already in ${targetDomain}`, 'info');
                        return;
                    }

                    moveApplicationToDomain(appName, sourceDomain, targetDomain, lensType);
                });
            });
            
            console.log(`[Drag-Drop] ✅ View updated: ${viewTitle}`);
        }
    } else {
        // Legacy mode: Manual DOM update (single-lens view)
        console.log(`[Drag-Drop] Manual DOM update (legacy mode)`);
        
        const allDomainCards = document.querySelectorAll('.asis-domain-card');
        let sourceDomainCard = null;
        let targetDomainCard = null;
        
        allDomainCards.forEach(card => {
            const domainName = card.querySelector('.asis-domain-name')?.textContent.trim();
            if (domainName === sourceDomain) sourceDomainCard = card;
            if (domainName === targetDomain) targetDomainCard = card;
        });
        
        if (sourceDomainCard && targetDomainCard) {
            const sourcePillContainer = sourceDomainCard.querySelector('.asis-app-pills');
            const targetPillContainer = targetDomainCard.querySelector('.asis-app-pills');
            
            if (sourcePillContainer && targetPillContainer) {
                const appPills = sourcePillContainer.querySelectorAll('.asis-pill');
                let appPill = null;
                
                appPills.forEach(pill => {
                    if (pill.getAttribute('data-app-name') === appName) {
                        appPill = pill;
                    }
                });
                
                if (appPill) {
                    // Move pill to target domain
                    appPill.remove();
                    targetPillContainer.appendChild(appPill);
                    
                    // Update badges
                    const sourceCountBadge = sourceDomainCard.querySelector('.asis-domain-count-badge');
                    const targetCountBadge = targetDomainCard.querySelector('.asis-domain-count-badge');
                    if (sourceCountBadge) {
                        const sourceCount = sourcePillContainer.querySelectorAll('.asis-pill').length;
                        sourceCountBadge.textContent = `${sourceCount} apps`;
                    }
                    if (targetCountBadge) {
                        const targetCount = targetPillContainer.querySelectorAll('.asis-pill').length;
                        targetCountBadge.textContent = `${targetCount} apps`;
                    }
                    
                    console.log(`[Drag-Drop] ✅ Moved pill for: ${appName}`);
                } else {
                    console.warn(`[Drag-Drop] App pill not found: ${appName}`);
                }
            }
        }
    }
    
    // Show success notification
    showASISNotification(
        `✅ ${appName} moved to ${targetDomain}`, 
        'success', 
        3000
    );
}

/**
 * Attach event handlers to insight cards
 */
function attachInsightCardHandlers(insights) {
    document.querySelectorAll('.asis-insight-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            openInsightModal(insights[index]);
        });
    });
}

/**
 * Attach modal close handlers
 */
function attachModalHandlers() {
    const overlay = document.getElementById('asis-modal-overlay');
    const closeBtn = document.getElementById('asis-modal-close');

    // Close button
    closeBtn.addEventListener('click', closeModal);

    // Backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closeModal();
        }
    });
}

/**
 * Open domain modal
 */
function openDomainModal(domain) {
    document.getElementById('asis-modal-dot').style.background = domain.color;
    document.getElementById('asis-modal-title').textContent = domain.name;
    document.getElementById('asis-modal-desc').textContent = domain.description;

    // Show apps section
    const appsSection = document.getElementById('asis-modal-apps-section');
    appsSection.style.display = 'block';

    const allApps = [
        ...domain.apps.map(app => `<span class="asis-modal-pill">${app}</span>`),
        ...domain.legacy.map(app => `<span class="asis-modal-pill asis-modal-pill-legacy">${app}</span>`)
    ].join('');
    document.getElementById('asis-modal-apps').innerHTML = allApps;

    // Recommendations
    document.getElementById('asis-modal-recs').innerHTML = 
        domain.recommendations.map(rec => `<div class="asis-modal-rec">${rec}</div>`).join('');

    document.getElementById('asis-modal-overlay').classList.add('open');
}

/**
 * Open insight modal
 */
function openInsightModal(insight) {
    document.getElementById('asis-modal-dot').style.background = insight.iconColor;
    document.getElementById('asis-modal-title').textContent = insight.title;
    document.getElementById('asis-modal-desc').textContent = insight.modal.desc;

    // Hide apps section for insights
    document.getElementById('asis-modal-apps-section').style.display = 'none';

    // Recommendations
    document.getElementById('asis-modal-recs').innerHTML = 
        insight.modal.recs.map(rec => `<div class="asis-modal-rec">${rec}</div>`).join('');

    document.getElementById('asis-modal-overlay').classList.add('open');
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('asis-modal-overlay').classList.remove('open');
}

/**
 * Generate strategic insights using AI (Phase 2)
 * ENHANCED: Uses ONLY Business Capability Domains (Lens 1) for insights
 * Saves insights to three-lens data for persistence
 * @param {Object} dashboardData
 * @returns {Promise<Object>} { insights: [], executiveSummary: {}, domainRecommendations: [] }
 */
async function generateStrategicInsights(dashboardData, lensType = 'business') {
    console.log('[ASIS Insights] Generating strategic insights for', lensType, 'lens with AI...');

    // Build lens-specific prompt
    const prompt = lensType === 'business' 
        ? buildBusinessLensInsightsPrompt()
        : buildTechnologyLensInsightsPrompt();

    const instructions = lensType === 'business'
        ? 'You are an enterprise architect conducting AS-IS business capability assessment. Analyze ONLY the business domains. Provide executive summary and strategic insights. Return ONLY valid JSON without markdown.'
        : 'You are an enterprise architect conducting AS-IS technology stack assessment. Analyze technology domains focusing on cloud transformation, security, agentic AI, and compliance. Provide executive summary and strategic insights. Return ONLY valid JSON without markdown.';

    try {
        // Show progress
        const progressMsg = lensType === 'business'
            ? 'Analyzing business capability architecture...'
            : 'Analyzing technology stack architecture...';
        showAIProgress(progressMsg);

        // Call AI via AzureOpenAIProxy using GPT-5.4 (OpenAI Responses API)
        const response = await AzureOpenAIProxy.create(prompt, {
            // No model specified - uses default gpt-5.4
            instructions: instructions,
            temperature: 0.6,
            timeout: 240000 // 4 minutes - insights generation is complex
        });

        hideAIProgress();

        const result = parseBusinessInsightsResponse(response);
        console.log('[ASIS Insights] ✅ Generated', lensType, 'insights:', result.insights.length);
        
        return result;

    } catch (error) {
        hideAIProgress();
        console.error('[ASIS Insights] AI insight generation failed:', error);
        return getFallbackInsights(dashboardData);
    }
}

/**
 * Build BUSINESS LENS INSIGHTS PROMPT (Business Capability Domains Only)
 * Uses ONLY Lens 1 (Business Capability Domains) for strategic insights
 * Excludes technology domains and service towers
 * @returns {string} Business-lens insights prompt
 */
function buildBusinessLensInsightsPrompt() {
    console.log('[ASIS Insights] Building business-lens-only prompt');
    
    if (!window.threeLensData || !window.threeLensData.businessDomains) {
        console.error('[ASIS Insights] No three-lens data available');
        return '';
    }
    
    const businessDomains = window.threeLensData.businessDomains;
    const apps = window.threeLensData.apps || [];
    
    // Build business domain summary
    const domainSummary = businessDomains.map(domain => {
        const domainApps = apps.filter(app => app.businessDomain === domain.name);
        const legacyApps = domainApps.filter(app => 
            (app.technologyStack || '').toLowerCase().includes('legacy') ||
            (app.lifecycleStatus || '').toLowerCase() === 'legacy'
        );
        
        return `**${domain.name}** (${domainApps.length} apps, ${legacyApps.length} legacy)
  Applications: ${domainApps.map(a => a.name).join(', ')}`;
    }).join('\n\n');
    
    const engagementManager = window.engagementManager;
    const currentEngagement = engagementManager?.getCurrentEngagement();
    const accountName = currentEngagement?.customerName || 'Organization';
    const industry = currentEngagement?.segment || 'Insurance';
    
    return `# Business Capability Architecture Insights

## CONTEXT
Account: ${accountName}
Industry: ${industry}
Total Applications: ${apps.length}

## BUSINESS CAPABILITY DOMAINS (Lens 1)

${domainSummary}

## TASK
Analyze the business capability architecture ONLY. Do NOT analyze technology stacks or service towers.

Generate 3-5 strategic insights focused on:
- Business domain coverage and gaps
- Application distribution across business capabilities
- Legacy concentration in business-critical domains
- Business capability consolidation opportunities
- Business domain modernization priorities

## OUTPUT FORMAT (JSON ONLY)
{
  "insights": [
    {
      "tag": "risk | platform | data | integration | governance | rationalization",
      "tagLabel": "Risk",
      "icon": "⚠",
      "iconBg": "#FAF0EC",
      "iconColor": "#7A0049",
      "title": "Insight title (8 words max)",
      "body": "2-3 sentence summary",
      "modal": {
        "desc": "Detailed 3-5 sentence explanation",
        "recs": ["Action-oriented recommendation", "Another recommendation"]
      }
    }
  ],
  "executiveSummary": {
    "overallHealth": "Strong | Moderate | Weak",
    "healthScore": 75,
    "summary": "2-3 sentence executive summary",
    "criticalActions": ["Action 1", "Action 2", "Action 3"]
  },
  "domainRecommendations": [
    {
      "domain": "Core insurance — life & pension",
      "currentState": "Brief current state",
      "targetState": "Brief target state",
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  ]
}

Return ONLY valid JSON. NO markdown blocks.`;
}

/**
 * Build TECHNOLOGY LENS INSIGHTS PROMPT (Technology Stack Analysis)
 * Uses Technology Domains for strategic technology insights
 * Focuses on cloud transformation, security, agentic AI, compliance
 * @returns {string} Technology-lens insights prompt
 */
function buildTechnologyLensInsightsPrompt() {
    console.log('[ASIS Insights] Building technology-lens prompt');
    
    if (!window.threeLensData || !window.threeLensData.technologyDomains) {
        console.error('[ASIS Insights] No three-lens technology data available');
        return '';
    }
    
    const technologyDomains = window.threeLensData.technologyDomains;
    const apps = window.threeLensData.apps || [];
    
    // Build technology domain summary
    const domainSummary = technologyDomains.map(domain => {
        const domainApps = apps.filter(app => app.technologyDomain === domain.name);
        const legacyApps = domainApps.filter(app => 
            (app.technologyStack || '').toLowerCase().includes('legacy') ||
            (app.lifecycleStatus || '').toLowerCase() === 'legacy'
        );
        const highRiskApps = domainApps.filter(app => 
            (app.riskLevel || '').toLowerCase() === 'high' ||
            (app.technicalDebt || '').toLowerCase() === 'high'
        );
        
        return `**${domain.name}** (${domainApps.length} apps, ${legacyApps.length} legacy, ${highRiskApps.length} high-risk)
  Applications: ${domainApps.map(a => `${a.name} [${a.technologyStack || 'Unknown'}]`).join(', ')}`;
    }).join('\\n\\n');
    
    const engagementManager = window.engagementManager;
    const currentEngagement = engagementManager?.getCurrentEngagement();
    const accountName = currentEngagement?.customerName || 'Organization';
    const industry = currentEngagement?.segment || 'Enterprise';
    
    return `# Technology Stack Architecture Insights

## CONTEXT
Account: ${accountName}
Industry: ${industry}
Total Applications: ${apps.length}

## TECHNOLOGY DOMAINS (Technology Lens)

${domainSummary}

## TASK
Analyze the technology stack architecture ONLY. Focus on enterprise technology transformation priorities.

Generate 3-5 strategic insights focused on:
- **Cloud Transformation**: Cloud adoption opportunities, hybrid/multi-cloud strategy, legacy infrastructure modernization
- **Security Governance**: Security vulnerabilities, compliance gaps, governance frameworks, zero-trust architecture
- **Agentic AI & Automation**: AI/ML integration opportunities, workflow automation, intelligent process automation, LLM-based solutions
- **Technical Debt**: Legacy system retirement, technology consolidation, architecture simplification
- **Compliance & Risk**: Regulatory compliance (GDPR, SOC2, ISO), data governance, audit readiness

## OUTPUT FORMAT (JSON ONLY)
{
  "insights": [
    {
      "tag": "cloud | security | ai | debt | compliance | automation",
      "tagLabel": "Cloud Transformation",
      "icon": "☁️",
      "iconBg": "#EBF8FF",
      "iconColor": "#2563EB",
      "title": "Insight title (8 words max)",
      "body": "2-3 sentence summary focusing on technology impact",
      "modal": {
        "desc": "Detailed 3-5 sentence technical explanation",
        "recs": ["Technology-specific action", "Implementation recommendation"]
      }
    }
  ],
  "executiveSummary": {
    "overallHealth": "Strong | Moderate | Weak",
    "healthScore": 75,
    "summary": "2-3 sentence executive summary focusing on technology maturity",
    "criticalActions": ["Technology Action 1", "Technology Action 2", "Technology Action 3"]
  },
  "domainRecommendations": [
    {
      "domain": "Legacy Systems",
      "currentState": "Brief current technology state",
      "targetState": "Brief target technology state",
      "recommendations": ["Cloud migration strategy", "Security hardening approach"]
    }
  ]
}

Return ONLY valid JSON. NO markdown blocks.`;
}

/**
 * Build THREE-LENS CLASSIFICATION PROMPT (Classification Only - NO Insights)
 * Simpler prompt for fast classification without insights generation
 * @param {Array} applications - Application array (from batch)
 * @returns {string} Classification-only prompt
 */
function buildThreeLensClassificationPrompt(applications) {
    const engagementManager = window.engagementManager;
    if (!engagementManager) {
        console.error('[Dashboard] Engagement Manager not available');
        return '';
    }

    const currentEngagement = engagementManager.getCurrentEngagement();
    if (!currentEngagement) {
        console.error('[Dashboard] No current engagement');
        return '';
    }
    
    // Get account info
    let account = null;
    if (window.accountManager && typeof window.accountManager.getAccount === 'function') {
        account = window.accountManager.getAccount();
    } else if (currentEngagement.accountId && window.accountManager && typeof window.accountManager.getAccountById === 'function') {
        account = window.accountManager.getAccountById(currentEngagement.accountId);
    }
    
    const accountName = account?.name || currentEngagement?.customerName || 'Organization';
    const industry = account?.industry || currentEngagement?.segment || 'Insurance';

    // Build CSV
    const csvData = applications.map(app => {
        const name = (app.name || '').replace(/,/g, ';');
        const vendor = (app.vendor || 'Internal').replace(/,/g, ';');
        const techStack = (app.technologyStack || 'Unknown').replace(/,/g, ';');
        const lifecycle = app.lifecycle || 'Active';
        const risk = app.riskLevel || 'Medium';
        const primaryFunction = (app.primaryFunction || app.businessDomain || 'Unknown').replace(/,/g, ';');
        return `${name},${vendor},${techStack},${lifecycle},${risk},${primaryFunction}`;
    }).join('\\n');

    return `# Three-Lens Application Classification

## TASK
Classify each application across THREE dimensions:
1. Business Capability Domain
2. Technology Domain  
3. Service Tower

## ACCOUNT CONTEXT
Account: ${accountName}
Industry: ${industry}
Applications to classify: ${applications.length}

## APPLICATION DATA (CSV)
application_name,vendor_or_custom,technology_stack,lifecycle_status,risk_level,primary_business_function

${csvData}

## BUSINESS CAPABILITY DOMAINS (Insurance Industry)
1. Core insurance — life & pension (Lumera, pension systems, life insurance admin)
2. Core insurance — non-life (P&C) (Claims, motor, property, casualty)
3. Customer & distribution channels (Portals, CRM, broker platforms, contact centers)
4. Finance risk & actuarial (GL, risk models, actuarial tools, reporting)
5. Data & analytics (Warehouses, BI, MDM, ML)
6. Integration & middleware (ESBs, APIs, message brokers)
7. Infrastructure & platform (Azure, DevOps, monitoring, identity, backup)
8. Shared services & IT ops (ITSM, service desk, asset mgmt)

## TECHNOLOGY DOMAINS
1. Cloud platform & IaaS (Azure, AWS services)
2. SaaS & packaged software (Lumera, SalesTech, external SaaS)
3. Integration & middleware (MuleSoft, Azure Service Bus, APIs)
4. Data & AI platform (Azure Synapse, SQL, Power BI, ML)
5. Custom & bespoke (In-house .NET, Java apps)
6. Legacy & mainframe (Mainframe, old VB, cobol-based)
7. DevOps & developer tools (Azure DevOps, Git, build pipelines)
8. Cybersecurity & IAM (AAD, security tools, SOC)
9. End-user computing (Office 365, Teams, endpoint tools)

## SERVICE TOWERS (Procurement/Outsourcing Grouping)
1. Sovereign IT services (National infrastructure, regulated, mainframe)
2. Enterprise applications (ERP, CRM, packaged enterprise software)
3. Digital development (Custom web/mobile, APIs, modern dev)
4. Cloud services (Azure/AWS workloads, PaaS, containers)
5. Data & analytics (Warehouses, BI licenses, analytics platforms)
6. AI services (ML platforms, AI APIs, cognitive services)
7. Digital workplace (Microsoft 365, collaboration, endpoints)
8. Cybersecurity (Security ops, identity, threat detection)

## OUTPUT FORMAT (JSON ONLY - NO MARKDOWN)
{
  "apps": [
    {
      "name": "Application Name",
      "businessDomain": "Core insurance — life & pension",
      "technologyDomain": "SaaS & packaged software",
      "serviceTower": "Enterprise applications",
      "architectureLayer": "Layer 2 — Core business systems"
    }
  ],
  "businessDomains": [
    {
      "name": "Core insurance — life & pension",
      "count": 12,
      "color": "#006B3F",
      "description": "Life insurance and pension administration"
    }
  ],
  "technologyDomains": [...],
  "serviceTowers": [...]
}

Return ONLY valid JSON. NO markdown code blocks. NO prose.`;
}

/**
 * Build AI prompt for FULL insights generation (manual action)
 * ENHANCED: Includes technology stack distribution for better classification
 */
function buildInsightsPrompt(dashboardData) {
    const engagementManager = window.engagementManager;
    if (!engagementManager) {
        console.error('[Dashboard] Engagement Manager not available');
        return '';
    }

    const currentEngagement = engagementManager.getCurrentEngagement();
    if (!currentEngagement) {
        console.error('[Dashboard] No current engagement');
        return '';
    }

    const applications = engagementManager.getEntities('applications') || [];
    
    // Get account info from engagement or window.accountManager
    let account = null;
    if (window.accountManager && typeof window.accountManager.getAccount === 'function') {
        account = window.accountManager.getAccount();
    } else if (currentEngagement.accountId && window.accountManager && typeof window.accountManager.getAccountById === 'function') {
        account = window.accountManager.getAccountById(currentEngagement.accountId);
    }
    
    // Fallback to engagement data if account not found
    const accountName = account?.name || currentEngagement?.customerName || 'Organization';
    const industry = account?.industry || currentEngagement?.segment || 'Insurance';

    // Build CSV for AI from application data
    const csvRows = applications.map(app => {
        const name = (app.name || '').replace(/,/g, ';'); // Escape commas
        const vendor = (app.vendor || 'Internal').replace(/,/g, ';');
        const techStack = (app.technologyStack || 'Unknown').replace(/,/g, ';');
        const lifecycle = app.lifecycle || 'Active';
        const risk = app.riskLevel || 'Medium';
        const primaryFunction = (app.primaryFunction || app.businessDomain || 'Unknown').replace(/,/g, ';');
        
        return `${name},${vendor},${techStack},${lifecycle},${risk},${primaryFunction}`;
    });

    const csvData = csvRows.join('\n');

    // Count KPIs
    const totalApps = applications.length;
    const legacyApps = applications.filter(app => {
        const techStack = (app.technologyStack || '').toLowerCase();
        return techStack.includes('legacy') || techStack.includes('mainframe');
    }).length;
    const activeApps = applications.filter(app => {
        const lifecycle = (app.lifecycle || '').toLowerCase();
        return lifecycle === 'active' || lifecycle === 'production' || lifecycle === 'operational';
    }).length;
    const highRiskApps = applications.filter(app => 
        app.riskLevel === 'high' || app.risk === 'high'
    ).length;

    const reportDate = new Date().toISOString().split('T')[0];
    const exportLabel = `Exported ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    // Business model description based on industry
    let businessModel = '';
    if (industry === 'Insurance') {
        businessModel = `${accountName} is a major insurance group providing life insurance, pension, and non-life (P&C) insurance products to individual and corporate customers across Scandinavia. Revenue is generated through premiums, investment returns, and fee-based services.`;
    } else {
        businessModel = `${accountName} operates in the ${industry} sector, providing products and services to its customer base. Revenue is generated through core business operations and supporting services.`;
    }

    return `# AI Instruction Prompt — Executive Application Portfolio Dashboard
## SYSTEM ROLE

You are a senior enterprise architect conducting an AS-IS application portfolio assessment. Your output will feed an executive HTML dashboard for C-level and board audiences. Be precise, data-driven, and terse. Avoid filler language. Every insight must reference specific named systems.

---

## SECTION 1 — ACCOUNT CONTEXT

Account name: ${accountName}
Industry: ${industry}
Business model: ${businessModel}
Geography: Scandinavia
Report date: ${reportDate}
Export label: ${exportLabel}

---

## SECTION 2 — RAW PORTFOLIO DATA

application_name,vendor_or_custom,technology_stack,lifecycle_status,risk_level,primary_business_function

${csvData}

Portfolio totals (for validation):
Total applications: ${totalApps}
Legacy systems: ${legacyApps}
Active systems: ${activeApps}
High-risk apps: ${highRiskApps}

---

## SECTION 3 — SERVICE TOWER INPUT

Service towers: DERIVE

Use standard service towers:
- Sovereign IT services (Regulated / national infrastructure)
- Enterprise applications (Core ERP, CRM, packaged business apps)
- Digital development (Custom-built digital products)
- Cloud services (Cloud infrastructure and platform services)
- Data & analytics (Data platforms, BI, reporting services)
- AI services (AI/ML platforms, automation, agents)
- Digital workplace (Collaboration, productivity, end-user tools)
- Cybersecurity (Security operations, IAM, compliance tooling)

---

## SECTION 4 — BUSINESS CAPABILITY DOMAIN RULES

Industry: ${industry}

Use INSURANCE domain set:
- Core insurance — life & pension
- Core insurance — non-life (P&C)
- Customer & distribution channels
- Finance, risk & actuarial
- Data & analytics
- Integration & middleware
- Infrastructure & platform
- Shared services & IT ops

Classification priority order:
a. primary_business_function field (highest priority)
b. Application name + vendor (secondary signal)
c. technology_stack (tiebreaker only, never primary)
d. Legacy/mainframe → assign to the business domain it SERVES
e. Pure infrastructure tools → "Infrastructure & platform"
f. Pure middleware → "Integration & middleware"

---

## SECTION 5 — TECHNOLOGY DOMAIN RULES

Assign each application to exactly one technology domain using technology_stack as primary signal:

- Cloud platform & IaaS (Azure, AWS, GCP infrastructure)
- SaaS & packaged software (Vendor SaaS, licensed packages)
- Integration & middleware (API gateways, MQ, ESB, MFT, B2B)
- Data & AI platform (Data lakes, warehouses, BI, ML/AI, MDM)
- Custom & bespoke (Internally built applications)
- Legacy & mainframe (COBOL, mainframe batch, end-of-life systems)
- DevOps & developer tools (CI/CD, source control, artifact mgmt)
- Cybersecurity & IAM (SIEM, PAM, zero-trust, identity platforms)
- End-user computing (Productivity suites, collaboration, workplace tools)

---

## SECTION 6 — ARCHITECTURE LAYER RULES

Assign each application to exactly one layer:

Layer 1 — Customer & channels (Customer portals, self-service, mobile, contact centre, CRM)
Layer 2 — Core business systems (Policy admin, claims, ERP, lending core, order mgmt)
Layer 3 — Integration & middleware (API gateways, message brokers, ESBs, B2B platforms, MFT)
Layer 4 — Data & analytics (Data lakes, warehouses, MDM, BI tools, ML platforms)
Layer 5 — Legacy core (lifecycle_status = Legacy OR risk_level = High systems still in production)
Layer 6 — Infrastructure & platform (Cloud IaaS/PaaS, containers, DevOps, ITSM, identity, security, monitoring)

---

## SECTION 7 — INSIGHT GENERATION RULES

Generate 4–6 strategic insights derived only from patterns in the data. Do not use a fixed topic list.

For each insight provide:
- tag: risk | cloud | platform | data | integration | governance | security | rationalization
- title: 8 words or fewer, specific to this portfolio
- summary: 2–3 sentences — what the data shows and why it matters
- detail: 3–5 sentences — root cause and business impact if unaddressed
- recs: 3–5 bullets, each starting with an action verb, referencing specific named systems where possible

---

## SECTION 8 — RISK SNAPSHOT RULES

Generate exactly 6 cells:
Cell 1: Legacy count + % of total portfolio
Cell 2: High-risk app count + where concentrated
Cell 3: Rationalization status (decommission plans or "Retain all")
Cell 4: Modernisation signal (strongest active cloud/modern tech signal)
Cell 5: Platform consolidation risk (duplicate cores or parallel platforms)
Cell 6: Emerging capability gap (AI, real-time data, API-first, zero-trust)

Each cell: label (3–5 words), value (1–4 words or number), desc (one sentence), warn (true/false)

---

## SECTION 9 — CROSS-LENS INSIGHT RULES

Generate 2–3 cross-lens observations combining two or more classification lenses.

Format same as regular insights but add:
lenses: ["business", "technology"] | ["technology", "service"] | ["business", "service"] | ["all"]

---

## REQUIRED OUTPUT FORMAT

Return a single valid JSON object. No prose. No markdown fences. No text before or after the JSON.

Use this exact schema:

{
  "account": {
    "name": "string",
    "industry": "string",
    "businessModel": "string",
    "reportDate": "string",
    "exportLabel": "string"
  },
  "kpis": {
    "total": 0,
    "legacy": 0,
    "active": 0,
    "highRisk": 0
  },
  "apps": [
    {
      "name": "string",
      "vendor": "string",
      "technologyStack": "string",
      "lifecycleStatus": "Active | Legacy | Retiring | Planned",
      "riskLevel": "Low | Medium | High",
      "primaryFunction": "string",
      "businessDomain": "string",
      "technologyDomain": "string",
      "serviceTower": "string",
      "architectureLayer": "string"
    }
  ],
  "businessDomains": [
    {
      "name": "string",
      "color": "#HEX",
      "count": "string",
      "apps": ["string"],
      "legacyApps": ["string"],
      "dominantPattern": "string",
      "desc": "string",
      "recs": ["string"]
    }
  ],
  "technologyDomains": [
    {
      "name": "string",
      "color": "#HEX",
      "count": "string",
      "apps": ["string"],
      "legacyApps": ["string"],
      "desc": "string",
      "recs": ["string"]
    }
  ],
  "serviceTowers": [
    {
      "name": "string",
      "color": "#HEX",
      "count": "string",
      "apps": ["string"],
      "legacyApps": ["string"],
      "desc": "string",
      "recs": ["string"]
    }
  ],
  "layers": [
    {
      "name": "string",
      "appCount": "string",
      "barColor": "#HEX",
      "isLegacyLayer": false,
      "tags": [{"label": "string", "bg": "#HEX", "text": "#HEX"}]
    }
  ],
  "insights": [
    {
      "tag": "string",
      "tagLabel": "string",
      "icon": "string",
      "iconBg": "#HEX",
      "iconColor": "#HEX",
      "title": "string",
      "body": "string",
      "modal": {
        "desc": "string",
        "recs": ["string"]
      }
    }
  ],
  "crossLensInsights": [
    {
      "tag": "string",
      "tagLabel": "string",
      "icon": "string",
      "iconBg": "#HEX",
      "iconColor": "#HEX",
      "title": "string",
      "body": "string",
      "lenses": ["string"],
      "modal": {
        "desc": "string",
        "recs": ["string"]
      }
    }
  ],
  "riskCells": [
    {
      "label": "string",
      "value": "string",
      "desc": "string",
      "warn": false
    }
  ]
}

COLOUR PALETTE:
Business domains — greens and blues:
- #00472E (deep green)
- #006B3F (mid green)
- #1A5C42 (teal green)
- #003D75 (deep blue)
- #0F5560 (teal blue)
- #163F6B (mid blue)
- #3D3280 (purple — integration)
- #3E3D38 (neutral — infrastructure)

Technology domains — blues and teals:
- Cloud platform & IaaS: #003D75
- SaaS & packaged software: #006B3F
- Integration & middleware: #1A5C42
- Data & AI platform: #0F5560
- Custom & bespoke: #163F6B
- Legacy & mainframe: #7A0049 (Eliminate signal)
- DevOps & developer tools: #3D3280
- Cybersecurity & IAM: #00472E
- End-user computing: #3E3D38

Service towers — purples and ambers:
- Sovereign IT services: #00472E
- Enterprise applications: #003D75
- Digital development: #006B3F
- Cloud services: #163F6B
- Data & analytics: #0F5560
- AI services: #3D3280
- Digital workplace: #7A0049
- Cybersecurity: #1A5C42

VALIDATION CHECKLIST:
- Every application from CSV appears in apps[] array
- Every app has all four classifications populated (no nulls)
- No app assigned to "Legacy" as a business domain
- businessDomains[] app counts sum to kpis.total
- technologyDomains[] app counts sum to kpis.total
- serviceTowers[] app counts sum to kpis.total
- layers[] covers all apps
- insights[] count is between 4 and 6
- crossLensInsights[] count is between 2 and 3
- riskCells[] contains exactly 6 items
- All hex colours are valid 6-digit hex codes
- No insight topic invented for a pattern not present in the data
- JSON is valid — no trailing commas, no unquoted strings`;
}

/**
 * Parse business insights response (Business Capability Domains only)
 */
function parseBusinessInsightsResponse(response) {
    try {
        // Extract content from OpenAI response wrapper
        let content = response;
        
        if (response.choices && response.choices[0]?.message?.content) {
            content = response.choices[0].message.content;
        } else if (response.message?.content) {
            content = response.message.content;
        } else if (response.output_text) {
            content = response.output_text;
        }
        
        // Strip markdown code blocks
        if (typeof content === 'string') {
            content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        }
        
        const data = typeof content === 'string' ? JSON.parse(content) : content;
        
        console.log('[ASIS Insights] Parsed business insights:', {
            insightsCount: data.insights?.length || 0,
            hasExecutiveSummary: !!data.executiveSummary,
            domainRecommendationsCount: data.domainRecommendations?.length || 0
        });
        
        return {
            insights: data.insights || [],
            executiveSummary: data.executiveSummary || null,
            domainRecommendations: data.domainRecommendations || []
        };
    } catch (error) {
        console.error('[ASIS Insights] Failed to parse response:', error);
        return {
            insights: [],
            executiveSummary: null,
            domainRecommendations: []
        };
    }
}

/**
 * Parse AI response to insights array (LEGACY - for backward compatibility)
 */
function parseInsightsResponse(response) {
    try {
        // Extract content from OpenAI response wrapper
        let content = response;
        
        // Handle OpenAI API response format: response.choices[0].message.content
        if (response.choices && response.choices[0]?.message?.content) {
            content = response.choices[0].message.content;
            console.log('[ASIS Dashboard] Extracted content from choices[0].message.content');
        } 
        // Handle alternative format: response.message.content
        else if (response.message?.content) {
            content = response.message.content;
            console.log('[ASIS Dashboard] Extracted content from message.content');
        }
        // Handle output_text format (legacy)
        else if (response.output_text) {
            content = response.output_text;
            console.log('[ASIS Dashboard] Extracted content from output_text');
        }
        
        // Strip markdown code blocks if present
        if (typeof content === 'string') {
            content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        }
        
        // Parse JSON if string
        const data = typeof content === 'string' ? JSON.parse(content) : content;
        
        console.log('[ASIS Dashboard] Parsed three-lens dashboard structure:', {
            hasInsights: !!data.insights,
            insightsCount: data.insights?.length || 0,
            hasBusinessDomains: !!data.businessDomains,
            businessDomainsCount: data.businessDomains?.length || 0,
            hasTechnologyDomains: !!data.technologyDomains,
            technologyDomainsCount: data.technologyDomains?.length || 0,
            hasServiceTowers: !!data.serviceTowers,
            serviceTowersCount: data.serviceTowers?.length || 0,
            hasCrossLensInsights: !!data.crossLensInsights,
            crossLensInsightsCount: data.crossLensInsights?.length || 0,
            hasRiskCells: !!data.riskCells,
            riskCellsCount: data.riskCells?.length || 0,
            hasLayers: !!data.layers,
            layersCount: data.layers?.length || 0,
            hasApps: !!data.apps,
            appsCount: data.apps?.length || 0
        });
        
        // Validate new structure
        if (!data.businessDomains || !data.technologyDomains || !data.serviceTowers) {
            console.warn('[ASIS Dashboard] Missing required three-lens classification structure');
        }
        
        return {
            account: data.account || {},
            kpis: data.kpis || {},
            apps: data.apps || [],
            businessDomains: data.businessDomains || [],
            technologyDomains: data.technologyDomains || [],
            serviceTowers: data.serviceTowers || [],
            layers: data.layers || [],
            insights: data.insights || [],
            crossLensInsights: data.crossLensInsights || [],
            riskCells: data.riskCells || [],
            // Backward compatibility (convert to old format if needed)
            executiveSummary: null,
            domainRecommendations: []
        };
    } catch (error) {
        console.error('[ASIS Dashboard] Failed to parse insights:', error);
        console.error('[ASIS Dashboard] Response structure:', response);
        return { 
            account: {},
            kpis: {},
            apps: [],
            businessDomains: [],
            technologyDomains: [],
            serviceTowers: [],
            layers: [],
            insights: [], 
            crossLensInsights: [],
            riskCells: [],
            executiveSummary: null, 
            domainRecommendations: [] 
        };
    }
}

/**
 * Get fallback insights if AI fails
 */
function getFallbackInsights(dashboardData) {
    const { kpis } = dashboardData;
    const legacyPercent = Math.round((kpis.legacySystems / kpis.totalApplications) * 100);

    const insights = [];

    // Risk insight (always include if legacy > 20%)
    if (legacyPercent > 20) {
        insights.push({
            tag: 'risk',
            tagLabel: 'Risk',
            icon: '⚠',
            iconBg: '#FAF0EC',
            iconColor: '#7A0049',
            title: 'Significant legacy footprint',
            body: `${legacyPercent}% of applications are marked as legacy. This creates technical debt and modernization risk that should be addressed systematically.`,
            modal: {
                desc: `With ${kpis.legacySystems} legacy applications out of ${kpis.totalApplications} total, the portfolio carries significant technical debt. Legacy systems typically have higher maintenance costs, limited integration capabilities, and skill retention challenges.`,
                recs: [
                    'Conduct detailed legacy modernization assessment',
                    'Prioritize applications by business criticality and technical risk',
                    'Develop phased modernization roadmap with clear milestones'
                ]
            }
        });
    }

    // Platform insight
    insights.push({
        tag: 'platform',
        tagLabel: 'Platform',
        icon: '⊞',
        iconBg: '#F3E8FF',
        iconColor: '#7A0049',
        title: 'Platform consolidation opportunity',
        body: 'Multiple technology platforms create complexity. Consider consolidation to reduce costs and improve operational efficiency.',
        modal: {
            desc: 'The portfolio shows diversity in technology platforms and vendors. While some diversity is healthy, excessive fragmentation leads to higher licensing costs, complex integrations, and operational overhead.',
            recs: [
                'Identify strategic platforms vs. tactical solutions',
                'Evaluate consolidation opportunities for similar capabilities',
                'Standardize on preferred technology stacks for new development'
            ]
        }
    });

    return {
        insights,
        executiveSummary: {
            overallHealth: legacyPercent > 30 ? 'Weak' : legacyPercent > 15 ? 'Moderate' : 'Strong',
            healthScore: Math.max(0, 100 - legacyPercent * 2),
            summary: `The application portfolio consists of ${kpis.totalApplications} applications with ${legacyPercent}% legacy systems. This indicates ${legacyPercent > 30 ? 'significant' : 'moderate'} technical debt requiring strategic modernization attention.`,
            criticalActions: [
                'Assess and prioritize legacy application modernization',
                'Establish cloud migration strategy',
                'Implement platform consolidation roadmap'
            ]
        },
        domainRecommendations: []
    };
}

/**
 * Export dashboard as standalone HTML
 */
function exportASISDashboard() {
    console.log('[ASIS Dashboard] Exporting standalone HTML...');

    // Get current dashboard data from cache
    if (!window.asisDashboardCache || !window.asisDashboardCache.data) {
        alert('Dashboard data not available. Please regenerate the dashboard first.');
        return;
    }

    const { data, insights } = window.asisDashboardCache;

    // Generate standalone HTML following ASIS_Architecture_Portfolio_Dashboard.md spec
    const standalone = generateStandaloneHTML(data, insights);

    // Download as file
    const blob = new Blob([standalone], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASIS_Architecture_${data.metadata.accountName.replace(/\s+/g, '_')}_${data.metadata.reportDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[ASIS Dashboard] Export complete');
}

/**
 * Generate standalone HTML file (self-contained)
 */
function generateStandaloneHTML(dashboardData, insights) {
    // This would generate a complete HTML file following the ASIS spec
    // For brevity, returning a placeholder - full implementation would include:
    // - Complete HTML structure with embedded CSS
    // - Embedded JavaScript with data
    // - No external dependencies except Google Fonts
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dashboardData.metadata.accountName} — AS-IS Architecture Dashboard</title>
    <!-- Full CSS and embedded data would be here -->
</head>
<body>
    <!-- Dashboard HTML would be rendered here -->
    <p>Export functionality: Full implementation follows ASIS_Architecture_Portfolio_Dashboard.md specification</p>
</body>
</html>`;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderASISDashboard,
        generateStrategicInsights,
        exportASISDashboard,
        analyzeUnknownApplications
    };
}

// ═══════════════════════════════════════════════════════════════════
// AI DOMAIN ANALYZER FOR UNKNOWN APPLICATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze Unknown applications and suggest domains using AI
 */
async function analyzeUnknownApplications() {
    console.log('[AS-IS Dashboard] Starting AI domain analysis for Unknown applications...');

    // Get applications from Unknown domain
    const engagementManager = window.engagementManager;
    if (!engagementManager) {
        alert('Engagement Manager not available');
        return;
    }

    const allApplications = engagementManager.getEntities('applications') || [];
    const unknownApps = allApplications.filter(app => {
        const domain = app.businessDomain || app.department || '';
        return !domain || domain.trim() === '' || domain === 'Unknown';
    });

    if (unknownApps.length === 0) {
        alert('No unknown applications to analyze');
        return;
    }

    // Build AI prompt
    const prompt = buildDomainAnalysisPrompt(unknownApps);

    try {
        // Show loading indicator
        showASISNotification(`Analyzing ${unknownApps.length} applications...`, 'info');

        // Call AI via AzureOpenAIProxy
        const response = await AzureOpenAIProxy.create(prompt, {
            model: 'gpt-4o',
            instructions: 'You are an enterprise architect analyzing application portfolios. Suggest appropriate business domains based on application names, technology, and capabilities. Return ONLY valid JSON without markdown.',
            temperature: 0.3,
            timeout: 90000
        });

        const suggestions = parseDomainSuggestions(response);
        console.log('[AS-IS Dashboard] AI generated', suggestions.length, 'domain suggestions');

        // Show suggestions modal
        showDomainSuggestionsModal(suggestions, unknownApps);

    } catch (error) {
        console.error('[AS-IS Dashboard] AI domain analysis failed:', error);
        showASISNotification('Could not generate domain suggestions. Please try again.', 'error');
    }
}

/**
 * Build AI prompt for domain analysis
 */
function buildDomainAnalysisPrompt(unknownApps) {
    const appList = unknownApps.map(app => ({
        id: app.id,
        name: app.name,
        technology: app.technology || 'Unknown',
        description: app.description || '',
        capabilities: (app.businessCapabilities || app.linkedCapabilities || []).join(', ') || 'None'
    }));

    return `Analyze these ${unknownApps.length} applications and suggest appropriate business domains.

**Applications to analyze:**
${appList.map(app => `- **${app.name}** (ID: ${app.id})
  Technology: ${app.technology}
  Capabilities: ${app.capabilities}
  Description: ${app.description || 'N/A'}`).join('\n\n')}

**Suggested Domain Categories:**
1. Insurance Operations (underwriting, claims, policy administration)
2. Insurance Customer Management (policyholder services, customer portal)
3. Finance & Administration (accounting, budgeting, financial reporting)
4. Customer & Experience (CRM, marketing, customer service)
5. Technology & IT (infrastructure, development tools, IT management)
6. Risk & Governance (compliance, audit, risk management)
7. Human Resources (HR systems, payroll, talent management)
8. Operations & Delivery (supply chain, logistics, order fulfillment)
9. Data & Analytics (BI, reporting, data warehouse)
10. Marketing & Sales (campaign management, sales automation)

**Output Format (JSON only, no markdown):**
{
  "suggestions": [
    {
      "appId": "APP-001",
      "appName": "Application Name",
      "suggestedDomain": "Insurance Operations",
      "confidence": "high",
      "reasoning": "Brief explanation of why this domain fits"
    }
  ]
}

Analyze all ${unknownApps.length} applications and return ONLY the JSON structure.`;
}

/**
 * Parse AI domain suggestions response
 */
function parseDomainSuggestions(response) {
    try {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        return data.suggestions || [];
    } catch (error) {
        console.error('[AS-IS Dashboard] Failed to parse domain suggestions:', error);
        return [];
    }
}

/**
 * Show domain suggestions modal with Accept/Reject options
 */
function showDomainSuggestionsModal(suggestions, unknownApps) {
    // Create modal HTML
    const modalHTML = `
        <div id="domain-suggestions-modal" class="modal-overlay">
            <div class="modal-box" style="max-width: 800px; max-height: 85vh;">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-magic"></i> AI Domain Suggestions
                    </h3>
                    <button class="modal-close" onclick="closeDomainSuggestionsModal()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                    <p style="margin-bottom: 20px; color: #6b7280; font-size: 14px;">
                        AI analyzed ${unknownApps.length} applications. Review suggestions below and accept/reject individually.
                    </p>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Application</th>
                                <th>Suggested Domain</th>
                                <th>Confidence</th>
                                <th>Reasoning</th>
                                <th style="width: 120px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${suggestions.map(suggestion => `
                                <tr data-app-id="${suggestion.appId}">
                                    <td style="font-weight: 600;">${suggestion.appName}</td>
                                    <td>
                                        <input type="text" 
                                               id="domain-input-${suggestion.appId}" 
                                               value="${suggestion.suggestedDomain}" 
                                               class="form-input" 
                                               style="font-size: 13px; padding: 6px 10px;">
                                    </td>
                                    <td>
                                        <span class="badge ${suggestion.confidence === 'high' ? 'badge-active' : suggestion.confidence === 'medium' ? 'badge-medium' : 'badge-low'}">
                                            ${suggestion.confidence}
                                        </span>
                                    </td>
                                    <td style="font-size: 12px; color: #6b7280;">${suggestion.reasoning}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="acceptDomainSuggestion('${suggestion.appId}')" style="padding: 4px 10px; font-size: 12px;">
                                            <i class="fas fa-check"></i> Accept
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDomainSuggestionsModal()">
                        Close
                    </button>
                    <button class="btn btn-primary" onclick="acceptAllDomainSuggestions()">
                        <i class="fas fa-check-double"></i> Accept All
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Store suggestions in window for later use
    window.domainSuggestions = suggestions;
}

/**
 * Close domain suggestions modal
 */
function closeDomainSuggestionsModal() {
    const modal = document.getElementById('domain-suggestions-modal');
    if (modal) modal.remove();
    window.domainSuggestions = null;
}

/**
 * Accept single domain suggestion
 */
function acceptDomainSuggestion(appId) {
    const domainInput = document.getElementById(`domain-input-${appId}`);
    const newDomain = domainInput.value.trim();

    if (!newDomain) {
        alert('Please enter a domain name');
        return;
    }

    // Update application domain
    const engagementManager = window.engagementManager;
    const app = engagementManager.getEntity('applications', appId);

    if (app) {
        app.businessDomain = newDomain;
        app.department = newDomain; // Keep in sync
        engagementManager.updateEntity('applications', appId, app);

        // Remove row from table
        const row = document.querySelector(`tr[data-app-id="${appId}"]`);
        if (row) row.remove();

        // Check if all done
        const remainingRows = document.querySelectorAll('#domain-suggestions-modal tbody tr');
        if (remainingRows.length === 0) {
            closeDomainSuggestionsModal();
            
            // Mark dashboard as stale but DON'T auto-regenerate
            invalidateASISDashboard();
            
            showASISNotification(
                'Applications updated successfully.\n💡 Click "Regenerate Dashboard" to update AI classification', 
                'success',
                5000
            );
        } else {
            showASISNotification(`${app.name} moved to ${newDomain}`, 'success');
        }
    }
}

/**
 * Accept all domain suggestions
 */
function acceptAllDomainSuggestions() {
    if (!window.domainSuggestions) return;

    const engagementManager = window.engagementManager;
    let updateCount = 0;

    window.domainSuggestions.forEach(suggestion => {
        const domainInput = document.getElementById(`domain-input-${suggestion.appId}`);
        const newDomain = domainInput ? domainInput.value.trim() : suggestion.suggestedDomain;

        if (newDomain) {
            const app = engagementManager.getEntity('applications', suggestion.appId);
            if (app) {
                app.businessDomain = newDomain;
                app.department = newDomain;
                engagementManager.updateEntity('applications', suggestion.appId, app);
                updateCount++;
            }
        }
    });

    closeDomainSuggestionsModal();
    
    // Mark dashboard as stale but DON'T auto-regenerate
    invalidateASISDashboard();
    
    showASISNotification(
        `✅ Updated ${updateCount} applications\n💡 Click "Regenerate Dashboard" to update AI classification`,
        'success',
        5000
    );
}

// ═══════════════════════════════════════════════════════════════════
// AI PROGRESS BAR (Uses Global Vivicta UI Utils)
// ═══════════════════════════════════════════════════════════════════

/**
 * Show AI progress bar (wrapper for global Vivicta UI)
 */
function showAIProgress(message = 'Generating insights...') {
    if (typeof window.showVivictaAIProgress === 'function') {
        window.showVivictaAIProgress(message);
    } else {
        console.warn('[ASIS Dashboard] Vivicta UI Utils not loaded, using fallback');
        console.log('[AI Progress]', message);
    }
}

/**
 * Hide AI progress bar
 */
function hideAIProgress() {
    if (typeof window.hideVivictaAIProgress === 'function') {
        window.hideVivictaAIProgress();
    }
}

// ═══════════════════════════════════════════════════════════════════
// EA PORTFOLIO ANALYSIS GENERATION (User-Triggered)
// ═══════════════════════════════════════════════════════════════════

/**
 * Mark portfolio as changed - enables regenerate button for insights
 */
function markPortfolioAsChanged(lensType) {
    console.log(`[Portfolio Change] 📝 Marking ${lensType} portfolio as changed`);
    
    // Enable both lens buttons (business and technology) since changes affect both
    enableRegenerateButton('business', true);
    enableRegenerateButton('technology', true);
    
    // Store change timestamp
    const timestamp = Date.now();
    sessionStorage.setItem('asis_portfolio_last_change', timestamp.toString());
    sessionStorage.setItem(`asis_portfolio_changed_${lensType}`, 'true');
    
    console.log(`[Portfolio Change] ✅ Regenerate buttons enabled`);
}

/**
 * Enable/disable regenerate button for specific lens
 */
function enableRegenerateButton(lensType, enabled) {
    const button = document.getElementById(`regenerate-insights-btn-${lensType}`);
    if (button) {
        button.disabled = !enabled;
        button.style.opacity = enabled ? '1' : '0.5';
        button.style.cursor = enabled ? 'pointer' : 'not-allowed';
        button.title = enabled 
            ? 'Click to regenerate analysis with latest portfolio changes' 
            : 'Make changes to the portfolio to enable regeneration';
        console.log(`[Regenerate Button] ${lensType} button ${enabled ? 'enabled' : 'disabled'}`);
    }
}

/**
 * Generate EA Portfolio Analysis (user-triggered)
 */
async function generateASISInsights(lensType = 'business') {
    console.log('[EA Portfolio Analysis] User triggered analysis generation for', lensType, 'lens');

    const generateBtn = document.getElementById(`generate-insights-btn-${lensType}`);
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    }

    // Get dashboard data from cache or three-lens data
    const dashboardData = window.asisDashboardCache?.data || {};

    try {
        const progressMessage = lensType === 'business' 
            ? 'Analyzing business capability architecture...'
            : 'Analyzing technology stack architecture...';
        showAIProgress(progressMessage);
        
        const insights = await generateStrategicInsights(dashboardData, lensType);
        
        hideAIProgress();

        // PHASE 3: Add metadata for persistence tracking
        insights.generatedAt = new Date().toISOString();
        insights.lensType = lensType;

        // Save lens-specific insights to localStorage
        const engagementId = window.engagementManager?.getCurrentEngagement()?.engagement?.id;
        if (engagementId) {
            const storageKey = `ea_three_lens_insights_${lensType}_${engagementId}`;
            localStorage.setItem(storageKey, JSON.stringify(insights));
            console.log('[ASIS Insights] 💾 Saved', lensType, 'insights to localStorage with timestamp:', insights.generatedAt);
            
            // PHASE 3: Auto-sync domain recommendations to opportunities (Business Lens only)
            if (lensType === 'business' && insights.domainRecommendations && insights.domainRecommendations.length > 0) {
                console.log('[ASIS Insights] 🌉 Triggering auto-sync to opportunity pipeline...');
                
                // Get account ID from current engagement
                const currentEngagement = window.engagementManager?.getCurrentEngagement();
                const accountId = currentEngagement?.engagement?.accountId;
                
                if (accountId && window.domainOpportunityBridge && window.domainOpportunityBridge.initialized) {
                    try {
                        const syncResults = window.domainOpportunityBridge.syncDomainOpportunities(engagementId, accountId);
                        
                        if (syncResults.created > 0) {
                            showASISNotification(
                                `✅ ${syncResults.created} opportunities auto-created from domain recommendations`,
                                'success',
                                5000
                            );
                        }
                        
                        if (syncResults.skipped > 0) {
                            console.log(`[ASIS Insights] ⏭️  ${syncResults.skipped} opportunities already exist (skipped)`);
                        }
                        
                        if (syncResults.errors.length > 0) {
                            console.warn('[ASIS Insights] ⚠️  Sync errors:', syncResults.errors);
                        }
                    } catch (bridgeError) {
                        console.error('[ASIS Insights] Bridge sync failed:', bridgeError);
                    }
                } else {
                    if (!accountId) {
                        console.warn('[ASIS Insights] Cannot auto-sync: engagement has no accountId');
                    } else if (!window.domainOpportunityBridge) {
                        console.warn('[ASIS Insights] Cannot auto-sync: bridge not loaded');
                    } else {
                        console.warn('[ASIS Insights] Cannot auto-sync: bridge not initialized');
                    }
                }
            }
        }

        // Re-render insights section for this lens
        renderLensInsightsResults(insights, lensType);

        showASISNotification(`EA Portfolio Analysis generated successfully for ${lensType} lens`, 'success');

    } catch (error) {
        hideAIProgress();
        console.error('[EA Portfolio Analysis] Generation failed:', error);
        showASISNotification('Failed to generate analysis: ' + error.message, 'error');
        
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-sparkles"></i> Generate EA Portfolio Analysis';
        }
    } finally {
        // After generation (success or failure), disable the regenerate button until next change
        enableRegenerateButton(lensType, false);
        sessionStorage.removeItem(`asis_portfolio_changed_${lensType}`);
    }
}

/**
 * Regenerate EA Portfolio Analysis
 */
async function regenerateASISInsights(lensType = 'business') {
    console.log('[EA Portfolio Analysis] Regenerating', lensType, 'lens analysis');
    
    // Clear existing insights from localStorage for this lens
    const engagementId = window.engagementManager?.getCurrentEngagement()?.engagement?.id;
    if (engagementId) {
        const storageKey = `ea_three_lens_insights_${lensType}_${engagementId}`;
        localStorage.removeItem(storageKey);
        console.log(`[EA Portfolio Analysis] Cleared cached analysis for ${lensType} lens`);
    }
    
    // Trigger generation
    await generateASISInsights(lensType);
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD EXPORT/IMPORT (COST SAVINGS)
// ═══════════════════════════════════════════════════════════════════

/**
 * Export three-lens dashboard to JSON file
 * Prevents unnecessary AI token usage by allowing data reuse
 */
function exportThreeLensDashboard() {
    if (!window.threeLensData) {
        showASISNotification('❌ No dashboard data to export', 'error');
        return;
    }
    
    const engagementManager = window.engagementManager;
    const currentEngagement = engagementManager?.getCurrentEngagement();
    const engagementId = currentEngagement?.engagement?.id;
    
    // PHASE 7: Load Strategic Insights from localStorage
    let strategicInsights = null;
    if (engagementId) {
        const businessInsightsKey = `ea_three_lens_insights_business_${engagementId}`;
        const technologyInsightsKey = `ea_three_lens_insights_technology_${engagementId}`;
        
        const businessInsightsRaw = localStorage.getItem(businessInsightsKey);
        const technologyInsightsRaw = localStorage.getItem(technologyInsightsKey);
        
        if (businessInsightsRaw || technologyInsightsRaw) {
            strategicInsights = {
                business: businessInsightsRaw ? JSON.parse(businessInsightsRaw) : null,
                technology: technologyInsightsRaw ? JSON.parse(technologyInsightsRaw) : null,
                metadata: {
                    exportedAt: new Date().toISOString(),
                    version: "1.0"
                }
            };
            console.log('[Dashboard Export] Including Strategic Insights:', {
                businessInsights: strategicInsights.business?.insights?.length || 0,
                technologyInsights: strategicInsights.technology?.insights?.length || 0
            });
        }
    }
    
    // Create export package with metadata
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            engagementId: engagementId || 'unknown',
            engagementName: currentEngagement?.engagement?.name || 'Unknown Engagement',
            customerName: currentEngagement?.engagement?.customerName || 'Unknown Customer',
            version: '2.0.0',
            description: 'Three-Lens Dashboard Data Export (Business · Technology · Service Tower) with Strategic Insights'
        },
        dashboardData: window.threeLensData,
        strategicInsights: strategicInsights
    };
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `Dashboard_${currentEngagement?.engagement?.customerName || 'Export'}_${timestamp}.json`;
    
    // Create and trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    // Build success message
    let successMessage = `✅ Dashboard exported to ${filename}\n💾 Keep this file to restore dashboard without AI costs`;
    
    if (strategicInsights) {
        const businessCount = strategicInsights.business?.insights?.length || 0;
        const technologyCount = strategicInsights.technology?.insights?.length || 0;
        if (businessCount > 0 || technologyCount > 0) {
            successMessage += `\n💡 Including Strategic Insights (Business: ${businessCount}, Technology: ${technologyCount})`;
        }
    }
    
    console.log('[Dashboard Export] ✅ Exported three-lens data:', filename);
    showASISNotification(successMessage, 'success', 7000);
}

/**
 * Import three-lens dashboard from JSON file
 * Restores dashboard without AI token usage
 */
function importThreeLensDashboard(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show loading indicator
    showASISNotification('📤 Importing dashboard...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate structure
            if (!importData.dashboardData || !importData.dashboardData.apps) {
                throw new Error('Invalid dashboard file format');
            }
            
            // Validate it's three-lens data
            if (!importData.dashboardData.businessDomains || 
                !importData.dashboardData.technologyDomains || 
                !importData.dashboardData.serviceTowers) {
                throw new Error('File does not contain three-lens dashboard data');
            }
            
            // Set as active three-lens data
            window.threeLensData = importData.dashboardData;
            
            console.log('[Dashboard Import] 🔍 Imported data structure:', {
                hasBusinessDomains: !!importData.dashboardData.businessDomains,
                hasTechnologyDomains: !!importData.dashboardData.technologyDomains,
                hasServiceTowers: !!importData.dashboardData.serviceTowers,
                hasInsights: !!importData.dashboardData.insights,
                insightsCount: importData.dashboardData.insights?.length || 0,
                hasExecutiveSummary: !!importData.dashboardData.executiveSummary
            });
            
            // Try to save to localStorage for persistence (if engagement exists)
            const engagementManager = window.engagementManager;
            const currentEngagement = engagementManager?.getCurrentEngagement();
            
            let persistenceWarning = false;
            
            if (!currentEngagement?.engagement?.id) {
                console.warn('[Dashboard Import] ⚠️ No current engagement - data will display but NOT persist!');
                console.warn('[Dashboard Import] 💡 To save permanently: Create/select an engagement first, then re-import');
                persistenceWarning = true;
            } else if (!window.saveThreeLensDashboardData) {
                console.error('[Dashboard Import] ❌ saveThreeLensDashboardData function not found!');
                persistenceWarning = true;
            } else {
                // We have an engagement ID and save function - attempt to save
                console.log('[Dashboard Import] 💾 Attempting to save to localStorage...', {
                    engagementId: currentEngagement.engagement.id,
                    key: `ea_three_lens_${currentEngagement.engagement.id}`
                });
                
                const saveResult = window.saveThreeLensDashboardData(currentEngagement.engagement.id, importData.dashboardData);
                console.log('[Dashboard Import] Save result:', saveResult);
                
                // Verify it was saved by reading it back
                const verifyKey = `ea_three_lens_${currentEngagement.engagement.id}`;
                const savedData = localStorage.getItem(verifyKey);
                
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    console.log('[Dashboard Import] ✅ Verified localStorage persistence:', {
                        key: verifyKey,
                        dataSize: (savedData.length / 1024).toFixed(2) + ' KB',
                        businessDomains: parsed.businessDomains?.length || 0,
                        technologyDomains: parsed.technologyDomains?.length || 0,
                        serviceTowers: parsed.serviceTowers?.length || 0,
                        apps: parsed.apps?.length || 0,
                        insights: parsed.insights?.length || 0
                    });
                } else {
                    console.error('[Dashboard Import] ❌ Verification FAILED - localStorage is empty!');
                    console.error('[Dashboard Import] Attempted key:', verifyKey);
                    console.error('[Dashboard Import] LocalStorage keys:', Object.keys(localStorage));
                    persistenceWarning = true;
                }
            }
            
            // Calculate or use existing KPIs
            // IMPORTANT: Use CURRENT engagement apps for KPIs, not imported apps
            // This ensures KPIs reflect the latest state, even if dashboard export is outdated
            const currentApps = engagementManager?.getEntities('applications') || [];
            
            console.log('[Dashboard Import] 📊 KPI Source Check:', {
                importedApps: importData.dashboardData.apps?.length || 0,
                currentEngagementApps: currentApps.length,
                usingCurrentApps: true
            });
            
            // Check if imported data already has KPIs (preferred - avoids recalculation issues)
            let kpis;
            if (importData.dashboardData.kpis && 
                typeof importData.dashboardData.kpis.totalApplications === 'number' &&
                currentApps.length === importData.dashboardData.apps?.length) {
                // Use existing KPIs ONLY if app count matches (data is current)
                kpis = importData.dashboardData.kpis;
                console.log('[Dashboard Import] ✅ Using existing KPIs from export (app count matches):', kpis);
            } else {
                // Recalculate KPIs from CURRENT engagement apps (not imported apps)
                console.log('[Dashboard Import] 🔄 Recalculating KPIs from CURRENT engagement apps');
                
                // Diagnostic logging - check first app structure
                if (currentApps.length > 0) {
                    console.log('[Dashboard Import] 🔍 Sample current app structure:', {
                        name: currentApps[0].name,
                        hasLifecycle: !!currentApps[0].lifecycle,
                        hasLifecycleStatus: !!currentApps[0].lifecycleStatus,
                        lifecycle: currentApps[0].lifecycle,
                        lifecycleStatus: currentApps[0].lifecycleStatus,
                        hasRisk: !!currentApps[0].risk,
                        hasRiskLevel: !!currentApps[0].riskLevel,
                        risk: currentApps[0].risk,
                        riskLevel: currentApps[0].riskLevel,
                        hasTechnologyStack: !!currentApps[0].technologyStack,
                        technologyStack: currentApps[0].technologyStack
                    });
                }
                
                // More flexible filtering - check all possible field variations
                const legacyApps = currentApps.filter(a => {
                    const tech = (a.technologyStack || a.technology || '').toLowerCase();
                    const lifecycle = (a.lifecycle || a.lifecycleStatus || a.status || '').toLowerCase();
                    const isLegacyTech = tech.includes('legacy') || tech.includes('mainframe') || tech.includes('cobol');
                    const isLegacyLifecycle = lifecycle === 'legacy' || lifecycle === 'retiring' || lifecycle === 'decommission';
                    return isLegacyTech || isLegacyLifecycle;
                });
                
                const activeApps = currentApps.filter(a => {
                    const lifecycle = (a.lifecycle || a.lifecycleStatus || a.status || '').toLowerCase();
                    return lifecycle === 'active' || lifecycle === 'production' || lifecycle === 'operational' || lifecycle === 'live';
                });
                
                const highRiskApps = currentApps.filter(a => {
                    const risk = (a.risk || a.riskLevel || '').toLowerCase();
                    return risk === 'high' || risk === 'critical';
                });
                
                console.log('[Dashboard Import] 📊 Calculated KPIs from CURRENT engagement apps:', {
                    total: currentApps.length,
                    legacy: legacyApps.length,
                    active: activeApps.length,
                    highRisk: highRiskApps.length,
                    legacyDetails: legacyApps.slice(0, 3).map(a => ({ name: a.name, lifecycle: a.lifecycle || a.lifecycleStatus, tech: a.technologyStack })),
                    activeDetails: activeApps.slice(0, 3).map(a => ({ name: a.name, lifecycle: a.lifecycle || a.lifecycleStatus }))
                });
                
                kpis = {
                    totalApplications: currentApps.length,
                    legacySystems: legacyApps.length,
                    activeSystems: activeApps.length,
                    highRiskApps: highRiskApps.length
                };
            }
            
            // Get customer name from multiple sources
            let customerName = 'Unknown Customer';
            if (currentEngagement?.engagement?.customerName) {
                customerName = currentEngagement.engagement.customerName;
            } else if (importData.metadata?.customerName) {
                customerName = importData.metadata.customerName;
            } else if (window.accountManager) {
                const account = window.accountManager.getAccount();
                if (account?.name) {
                    customerName = account.name;
                }
            }
            
            console.log('[Dashboard Import] 🏭 Customer name resolution:', {
                fromEngagement: currentEngagement?.engagement?.customerName,
                fromImport: importData.metadata?.customerName,
                fromAccountManager: window.accountManager?.getAccount()?.name,
                final: customerName
            });
            
            // Create minimal dashboard data for metadata
            // Three-lens data is already loaded in window.threeLensData
            const dashboardData = {
                metadata: {
                    accountName: customerName,
                    industry: currentEngagement?.engagement?.segment || importData.metadata?.industry || 'Enterprise',
                    exportDate: new Date().toISOString().split('T')[0],
                    totalApplications: currentApps.length
                },
                kpis: kpis,  // Use calculated or imported KPIs
                domains: [], // Not used with three-lens view
                layers: importData.dashboardData.layers || []
            };
                
            renderASISDashboard(dashboardData, 'dashboard-container', {
                showRegenerateButton: true,
                insights: importData.dashboardData.insights ? {
                    insights: importData.dashboardData.insights,
                    executiveSummary: importData.dashboardData.executiveSummary,
                    domainRecommendations: importData.dashboardData.domainRecommendations
                } : null
            });
            
            // PHASE 7: Restore Strategic Insights to localStorage (new v2.0.0 format)
            if (importData.strategicInsights && currentEngagement?.engagement?.id) {
                const engagementId = currentEngagement.engagement.id;
                
                if (importData.strategicInsights.business) {
                    const businessKey = `ea_three_lens_insights_business_${engagementId}`;
                    localStorage.setItem(businessKey, JSON.stringify(importData.strategicInsights.business));
                    console.log('[Dashboard Import] ✅ Restored Business Strategic Insights:', 
                        importData.strategicInsights.business.insights?.length || 0, 'insights');
                }
                
                if (importData.strategicInsights.technology) {
                    const technologyKey = `ea_three_lens_insights_technology_${engagementId}`;
                    localStorage.setItem(technologyKey, JSON.stringify(importData.strategicInsights.technology));
                    console.log('[Dashboard Import] ✅ Restored Technology Strategic Insights:', 
                        importData.strategicInsights.technology.insights?.length || 0, 'insights');
                }
            }
            
            // If insights were imported (legacy format), render them
            if (importData.dashboardData.insights && importData.dashboardData.insights.length > 0) {
                console.log('[Dashboard Import] 💡 Restoring', importData.dashboardData.insights.length, 'insights (legacy format)');
                setTimeout(() => {
                    renderInsightsResults({
                        insights: importData.dashboardData.insights,
                        executiveSummary: importData.dashboardData.executiveSummary,
                        domainRecommendations: importData.dashboardData.domainRecommendations
                    });
                }, 500);
            }
            
            console.log('[Dashboard Import] ✅ Imported three-lens data:', {
                apps: importData.dashboardData.apps.length,
                businessDomains: importData.dashboardData.businessDomains.length,
                technologyDomains: importData.dashboardData.technologyDomains.length,
                serviceTowers: importData.dashboardData.serviceTowers.length,
                insights: importData.dashboardData.insights?.length || 0,
                hasStrategicInsights: !!importData.strategicInsights,
                businessInsights: importData.strategicInsights?.business?.insights?.length || 0,
                technologyInsights: importData.strategicInsights?.technology?.insights?.length || 0,
                source: importData.metadata?.engagementName || 'Unknown',
                persisted: !persistenceWarning
            });
            
            // Build success message
            let successMessage = `✅ Dashboard imported & saved!\n📊 ${importData.dashboardData.apps.length} applications restored`;
            
            // Add Strategic Insights status if present
            if (importData.strategicInsights) {
                const businessCount = importData.strategicInsights.business?.insights?.length || 0;
                const technologyCount = importData.strategicInsights.technology?.insights?.length || 0;
                if (businessCount > 0 || technologyCount > 0) {
                    successMessage += `\n💡 Strategic Insights restored (Business: ${businessCount}, Technology: ${technologyCount})`;
                }
            }
            
            successMessage += `\n💰 No AI tokens used`;
            
            // Show appropriate notification based on persistence status
            if (persistenceWarning) {
                showASISNotification(
                    `⚠️ Dashboard imported (temporary)\n📊 ${importData.dashboardData.apps.length} applications loaded\n💡 To save permanently: Create an engagement first, then re-import`, 
                    'warning',
                    8000
                );
            } else {
                showASISNotification(successMessage, 'success', 6000);
            }
            
        } catch (error) {
            console.error('[Dashboard Import] ❌ Import failed:', error);
            showASISNotification(`❌ Import failed: ${error.message}`, 'error', 6000);
        }
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.onerror = function() {
        showASISNotification('❌ Failed to read file', 'error');
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

/**
 * Render lens-specific insights results after AI generation (V2 - Card Grid Layout)
 * @param {Object} insights - Generated insights data
 * @param {string} lensType - 'business' or 'technology'
 * @param {number} retryCount - Internal retry counter (default: 0)
 */
function renderLensInsightsResults(insights, lensType, retryCount = 0) {
    console.log('[ASIS Insights] Rendering', lensType, 'lens insights results (Card Grid V2)');
    
    // Find the container for this lens
    const containerId = `insights-results-container-${lensType}`;
    let container = document.getElementById(containerId);
    
    if (!container) {
        if (retryCount >= 5) {
            console.error('[ASIS Insights] Container not found after 5 retries, giving up:', containerId);
            showASISNotification(`Failed to render ${lensType} insights - please refresh the dashboard`, 'error');
            return;
        }
        console.warn(`[ASIS Insights] Container not found (retry ${retryCount + 1}/5), will retry...`, containerId);
        // Container might not be in DOM yet, retry after a short delay
        setTimeout(() => renderLensInsightsResults(insights, lensType, retryCount + 1), 150);
        return;
    }
    
    // Hide empty state, show results
    const placeholderId = `insights-placeholder-${lensType}`;
    const emptyState = document.getElementById(placeholderId);
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    container.style.display = 'block';
    
    const { insights: insightsList, executiveSummary, domainRecommendations } = insights;
    
    // Build card grid with Executive Summary, Critical Actions, and Domain cards
    const cards = [];
    
    // CARD 1: Executive Summary Overview
    if (executiveSummary) {
        cards.push(`
            <div class="strategic-card" data-card-type="executive-summary" data-lens-type="${lensType}">
                <div class="strategic-card-header">
                    <div class="strategic-card-icon" style="background: linear-gradient(135deg, #00472E 0%, #006B3F 100%);">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="strategic-card-title-section">
                        <h3 class="strategic-card-title">Executive Summary</h3>
                        <div class="strategic-card-subtitle">
                            <span class="strategic-health-badge strategic-health-${executiveSummary.overallHealth.toLowerCase()}">
                                ${executiveSummary.overallHealth}
                            </span>
                            <span class="strategic-health-score">${executiveSummary.healthScore}/100</span>
                        </div>
                    </div>
                    <div class="strategic-card-actions">
                        <button class="strategic-card-btn" onclick="editStrategicCard('executive-summary', '${lensType}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="strategic-card-btn" onclick="deleteStrategicCard('executive-summary', '${lensType}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="strategic-card-body">
                    <p class="strategic-card-text">${executiveSummary.summary}</p>
                </div>
            </div>
        `);
        
        // CARD 2: Critical Actions
        if (executiveSummary.criticalActions && executiveSummary.criticalActions.length > 0) {
            cards.push(`
                <div class="strategic-card" data-card-type="critical-actions" data-lens-type="${lensType}">
                    <div class="strategic-card-header">
                        <div class="strategic-card-icon" style="background: linear-gradient(135deg, #006B3F 0%, #4BE3A3 100%);">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="strategic-card-title-section">
                            <h3 class="strategic-card-title">Critical Actions</h3>
                            <div class="strategic-card-subtitle">${executiveSummary.criticalActions.length} priorities</div>
                        </div>
                        <div class="strategic-card-actions">
                            <button class="strategic-card-btn" onclick="editStrategicCard('critical-actions', '${lensType}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="strategic-card-btn" onclick="deleteStrategicCard('critical-actions', '${lensType}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="strategic-card-body">
                        <ul class="strategic-action-list">
                            ${executiveSummary.criticalActions.map(action => `
                                <li class="strategic-action-item"><i class="fas fa-check-circle"></i> ${action}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `);
        }
    }
    
    // CARDS 3+: Domain Recommendations (each domain = 1 card)
    if (domainRecommendations && domainRecommendations.length > 0) {
        domainRecommendations.forEach((rec, index) => {
            cards.push(`
                <div class="strategic-card" data-card-type="domain-recommendation" data-domain-index="${index}" data-lens-type="${lensType}">
                    <div class="strategic-card-header">
                        <div class="strategic-card-icon" style="background: linear-gradient(135deg, #006B3F 0%, #4BE3A3 100%);">
                            <i class="fas fa-layer-group"></i>
                        </div>
                        <div class="strategic-card-title-section">
                            <h3 class="strategic-card-title">${rec.domain}</h3>
                            <div class="strategic-card-subtitle">Domain Transformation</div>
                        </div>
                        <div class="strategic-card-actions">
                            <button class="strategic-card-btn" onclick="editStrategicCard('domain-recommendation', '${lensType}', ${index})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="strategic-card-btn" onclick="deleteStrategicCard('domain-recommendation', '${lensType}', ${index})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="strategic-card-body">
                        <div class="strategic-state-row">
                            <div class="strategic-state-label"><i class="fas fa-circle" style="color: #D72638;"></i> Current</div>
                            <div class="strategic-state-text">${rec.currentState}</div>
                        </div>
                        <div class="strategic-state-row">
                            <div class="strategic-state-label"><i class="fas fa-circle" style="color: #4BE3A3;"></i> Target</div>
                            <div class="strategic-state-text">${rec.futureState}</div>
                        </div>
                        <div class="strategic-recommendations">
                            <div class="strategic-rec-title">Recommendations:</div>
                            <ul class="strategic-rec-list">
                                ${rec.recommendations.map(r => `<li class="strategic-rec-item">→ ${r}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `);
        });
    }
    
    // Render 3-column grid
    container.innerHTML = `
        <div class="strategic-cards-grid">
            ${cards.join('')}
        </div>
    `;
    
    console.log('[ASIS Insights] Rendered', cards.length, 'cards in 3-column grid');
}

/**
 * Render insights results after generation
 */
function renderInsightsResults(insightsData) {
    const { insights, executiveSummary, domainRecommendations } = insightsData;

    // Executive Summary Card
    const executiveSummaryCard = executiveSummary ? `
        <div class="asis-executive-summary">
            <div class="asis-exec-header">
                <div class="asis-exec-icon"><i class="fas fa-chart-line"></i></div>
                <div class="asis-exec-title-section">
                    <h3 class="asis-exec-title">Executive Summary</h3>
                    <div class="asis-exec-health">
                        <span class="asis-health-badge asis-health-${executiveSummary.overallHealth.toLowerCase()}">
                            ${executiveSummary.overallHealth}
                        </span>
                        <span class="asis-health-score">${executiveSummary.healthScore}/100</span>
                    </div>
                </div>
            </div>
            <div class="asis-exec-body">
                <p class="asis-exec-summary">${executiveSummary.summary}</p>
                <div class="asis-exec-actions">
                    <h4>Critical Actions</h4>
                    ${executiveSummary.criticalActions.map(action => `
                        <div class="asis-exec-action"><i class="fas fa-check-circle"></i> ${action}</div>
                    `).join('')}
                </div>
            </div>
            ${domainRecommendations && domainRecommendations.length > 0 ? `
                <div class="asis-exec-domains">
                    <h4>Domain-Specific Recommendations</h4>
                    ${domainRecommendations.map(rec => `
                        <div class="asis-domain-rec">
                            <div class="asis-domain-rec-name">${rec.domain}</div>
                            <div class="asis-domain-rec-row">
                                <span class="asis-domain-rec-label">Current:</span>
                                <span class="asis-domain-rec-text">${rec.currentState}</span>
                            </div>
                            <div class="asis-domain-rec-row">
                                <span class="asis-domain-rec-label">Future:</span>
                                <span class="asis-domain-rec-text">${rec.futureState}</span>
                            </div>
                            <div class="asis-domain-rec-actions">
                                ${rec.recommendations.slice(0, 3).map(r => `<div class="asis-domain-rec-item">→ ${r}</div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    ` : '';

    // Insight Cards
    const insightCards = insights.map((insight, index) => `
        <div class="asis-insight-card" data-insight-index="${index}">
            <div class="asis-insight-tag asis-tag-${insight.tag}">${insight.tagLabel}</div>
            <div class="asis-insight-icon-wrap" style="background: ${insight.iconBg}; color: ${insight.iconColor}">
                ${insight.icon}
            </div>
            <div class="asis-insight-card-title">${insight.title}</div>
            <div class="asis-insight-card-body">${insight.body}</div>
        </div>
    `).join('');

    const resultsHTML = `
        <div class="asis-section-header">
            <h2 class="asis-section-title">Strategic Insights</h2>
            <div class="asis-pill-badge">${insights.length} insights</div>
            <button class="btn btn-secondary btn-sm" onclick="regenerateASISInsights()" style="margin-left: auto;">
                <i class="fas fa-sync-alt"></i> Regenerate
            </button>
        </div>
        ${executiveSummaryCard}
        <div class="asis-insight-grid" style="${executiveSummaryCard ? 'margin-top: 24px;' : ''}">
            ${insightCards}
        </div>
    `;

    // Hide empty state, show results
    const emptyState = document.querySelector('.asis-insights-empty');
    if (emptyState) emptyState.style.display = 'none';

    const resultsContainer = document.getElementById('insights-results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';
    }

    // Attach handlers
    if (insights && insights.length > 0) {
        attachInsightCardHandlers(insights);
    }
}

// ═══════════════════════════════════════════════════════════════════
// STRATEGIC CARD EDIT/DELETE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Edit a strategic card
 */
function editStrategicCard(cardType, lensType, domainIndex = null) {
    console.log('[Strategic Cards] Edit:', { cardType, lensType, domainIndex });
    
    // Load current insights from localStorage
    const engagementId = window.engagementManager?.getCurrentEngagement()?.engagement?.id;
    if (!engagementId) {
        showASISNotification('No engagement loaded', 'error');
        return;
    }
    
    const storageKey = `ea_three_lens_insights_${lensType}_${engagementId}`;
    const savedData = localStorage.getItem(storageKey);
    if (!savedData) {
        showASISNotification('No insights data found', 'error');
        return;
    }
    
    const insights = JSON.parse(savedData);
    let currentValue = '';
    let fieldLabel = '';
    
    // Get current value based on card type
    if (cardType === 'executive-summary') {
        currentValue = insights.executiveSummary?.summary || '';
        fieldLabel = 'Executive Summary';
    } else if (cardType === 'critical-actions') {
        currentValue = insights.executiveSummary?.criticalActions?.join('\n') || '';
        fieldLabel = 'Critical Actions (one per line)';
    } else if (cardType === 'domain-recommendation' && domainIndex !== null) {
        const domain = insights.domainRecommendations[domainIndex];
        currentValue = `Domain: ${domain.domain}\n\nCurrent State:\n${domain.currentState}\n\nTarget State:\n${domain.futureState}\n\nRecommendations:\n${domain.recommendations.join('\n')}`;
        fieldLabel = `${domain.domain} - Domain Recommendation`;
    }
    
    // Show edit modal
    const modal = document.createElement('div');
    modal.className = 'strategic-edit-modal';
    modal.innerHTML = `
        <div class="strategic-edit-modal-content">
            <div class="strategic-edit-modal-header">
                <h3><i class="fas fa-edit"></i> Edit ${fieldLabel}</h3>
                <button class="strategic-edit-modal-close" onclick="this.closest('.strategic-edit-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="strategic-edit-modal-body">
                <textarea class="strategic-edit-textarea" rows="12">${currentValue}</textarea>
            </div>
            <div class="strategic-edit-modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.strategic-edit-modal').remove()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-primary" onclick="saveStrategicCardEdit('${cardType}', '${lensType}', ${domainIndex})">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('textarea').focus();
}

/**
 * Save edited strategic card
 */
function saveStrategicCardEdit(cardType, lensType, domainIndex = null) {
    const textarea = document.querySelector('.strategic-edit-textarea');
    if (!textarea) return;
    
    const newValue = textarea.value.trim();
    if (!newValue) {
        showASISNotification('Content cannot be empty', 'error');
        return;
    }
    
    // Load insights
    const engagementId = window.engagementManager?.getCurrentEngagement()?.engagement?.id;
    const storageKey = `ea_three_lens_insights_${lensType}_${engagementId}`;
    const insights = JSON.parse(localStorage.getItem(storageKey));
    
    // Update based on card type
    if (cardType === 'executive-summary') {
        insights.executiveSummary.summary = newValue;
    } else if (cardType === 'critical-actions') {
        insights.executiveSummary.criticalActions = newValue.split('\n').filter(line => line.trim());
    } else if (cardType === 'domain-recommendation' && domainIndex !== null) {
        // Parse structured format
        const lines = newValue.split('\n');
        const domain = insights.domainRecommendations[domainIndex];
        
        let section = '';
        let currentContent = [];
        
        lines.forEach(line => {
            if (line.startsWith('Domain:')) {
                domain.domain = line.replace('Domain:', '').trim();
            } else if (line.includes('Current State:')) {
                section = 'current';
                currentContent = [];
            } else if (line.includes('Target State:')) {
                if (section === 'current') domain.currentState = currentContent.join(' ').trim();
                section = 'target';
                currentContent = [];
            } else if (line.includes('Recommendations:')) {
                if (section === 'target') domain.futureState = currentContent.join(' ').trim();
                section = 'recs';
                currentContent = [];
            } else if (line.trim()) {
                if (section === 'recs') {
                    domain.recommendations.push(line.trim());
                } else {
                    currentContent.push(line.trim());
                }
            }
        });
        
        if (section === 'target' && currentContent.length > 0) {
            domain.futureState = currentContent.join(' ').trim();
        }
    }
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(insights));
    
    // Re-render
    renderLensInsightsResults(insights, lensType);
    
    // Close modal
    document.querySelector('.strategic-edit-modal')?.remove();
    
    showASISNotification('✅ Card updated successfully', 'success');
}

/**
 * Delete a strategic card
 */
function deleteStrategicCard(cardType, lensType, domainIndex = null) {
    const confirmMsg = cardType === 'domain-recommendation' 
        ? 'Delete this domain recommendation?' 
        : `Delete ${cardType.replace('-', ' ')}?`;
    
    if (!confirm(confirmMsg)) return;
    
    // Load insights
    const engagementId = window.engagementManager?.getCurrentEngagement()?.engagement?.id;
    const storageKey = `ea_three_lens_insights_${lensType}_${engagementId}`;
    const insights = JSON.parse(localStorage.getItem(storageKey));
    
    // Delete based on card type
    if (cardType === 'executive-summary') {
        insights.executiveSummary = null;
    } else if (cardType === 'critical-actions') {
        if (insights.executiveSummary) {
            insights.executiveSummary.criticalActions = [];
        }
    } else if (cardType === 'domain-recommendation' && domainIndex !== null) {
        insights.domainRecommendations.splice(domainIndex, 1);
    }
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(insights));
    
    // Re-render
    renderLensInsightsResults(insights, lensType);
    
    showASISNotification('✅ Card deleted', 'success');
}

// Expose functions globally
window.editStrategicCard = editStrategicCard;
window.saveStrategicCardEdit = saveStrategicCardEdit;
window.deleteStrategicCard = deleteStrategicCard;

/**
 * Show notification (wrapper for global Vivicta UI)
 */
function showASISNotification(message, type = 'info') {
    if (typeof window.showVivictaNotification === 'function') {
        window.showVivictaNotification(message, type);
    } else {
        console.warn('[ASIS Dashboard] Vivicta UI Utils not loaded, using fallback');
        // Fallback to console
        const prefix = type.toUpperCase();
        console.log(`[${prefix}]`, message);
    }
}

/**
 * V2: Classify Unknown Domain Apps with AI (OPTIONAL - user-triggered only)
 * Called when user clicks "Classify with AI" button in Unknown domain
 * 
 * @param {String} lensType - 'business' or 'technology'
 */
async function classifyUnknownDomainsWithAI(lensType) {
    console.log('[AS-IS Dashboard V2] 🤖 User requested AI classification for:', lensType);
    
    // Get Unknown domain apps
    const unknownDomain = lensType === 'business' 
        ? window.threeLensData.businessDomains.find(d => d.name === 'Unknown')
        : window.threeLensData.technologyDomains.find(d => d.name === 'Unknown');
    
    if (!unknownDomain || unknownDomain.apps.length === 0) {
        showASISNotification('No unknown apps to classify', 'info');
        return;
    }
    
    const unknownApps = unknownDomain.apps;
    console.log(`[AS-IS Dashboard V2] Found ${unknownApps.length} unknown apps to classify`);
    
    // Get existing domains (excluding Unknown) for AI context
    const existingDomains = lensType === 'business'
        ? window.threeLensData.businessDomains.filter(d => d.name !== 'Unknown')
        : window.threeLensData.technologyDomains.filter(d => d.name !== 'Unknown');
    
    // Build simplified AI prompt
    const domainNames = existingDomains.map(d => d.name).join(', ');
    const appList = unknownApps.map(app => `- ${app.name} (${app.technologyStack || 'No tech stack'})`).join('\n');
    
    const prompt = `You are an enterprise architect. Classify the following applications into existing ${lensType} domains.

**Existing Domains**: ${domainNames}

**Applications to Classify**:
${appList}

**Instructions**:
1. For each app, assign it to the MOST appropriate existing domain
2. Base classification on app name and technology stack
3. Return ONLY valid JSON

**Required JSON Format**:
{
  "classifications": [
    {"appName": "App1", "domain": "Domain Name"},
    {"appName": "App2", "domain": "Domain Name"}
  ]
}`;

    showASISNotification(`🤖 Classifying ${unknownApps.length} apps with AI...`, 'info');
    
    try {
        // Call AI using OpenAI Responses API (gpt-5.4)
        const response = await AzureOpenAIProxy.create(prompt, {
            instructions: 'Return ONLY valid JSON without markdown or prose.',
            temperature: 0.2, // Low temperature for consistent classification
            timeout: 120000 // 2 minutes
        });
        
        console.log('[AS-IS Dashboard V2] ✅ AI classification response received');
        
        // Extract content text from response object (Responses API format)
        let content = response;
        if (response.output_text) {
            content = response.output_text;
        } else if (response.choices && response.choices[0]?.message?.content) {
            content = response.choices[0].message.content;
        } else if (response.message?.content) {
            content = response.message.content;
        }
        
        console.log('[AS-IS Dashboard V2] Response content type:', typeof content);
        
        // Parse AI response
        let classifications;
        try {
            // If content is already an object, use it directly
            if (typeof content === 'object' && content !== null) {
                classifications = content;
            } else if (typeof content === 'string') {
                // Strip markdown code blocks if present
                const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                
                // Try direct JSON parse
                try {
                    classifications = JSON.parse(cleanContent);
                } catch (e) {
                    // Try extracting JSON from markdown code blocks (legacy format)
                    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
                    if (jsonMatch) {
                        classifications = JSON.parse(jsonMatch[1]);
                    } else {
                        throw new Error('Invalid JSON response from AI');
                    }
                }
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (e) {
            console.error('[AS-IS Dashboard V2] Failed to parse AI response:', e);
            throw new Error(`Failed to parse AI response: ${e.message}`);
        }
        
        if (!classifications.classifications || !Array.isArray(classifications.classifications)) {
            throw new Error('Response missing classifications array');
        }
        
        console.log('[AS-IS Dashboard V2] 📊 AI classified', classifications.classifications.length, 'apps');
        
        // Apply classifications
        let movedCount = 0;
        classifications.classifications.forEach(classification => {
            const app = window.threeLensData.apps.find(a => a.name === classification.appName);
            if (!app) {
                console.warn('[AS-IS Dashboard V2] ⚠️ App not found:', classification.appName);
                return;
            }
            
            // Verify domain exists
            const targetDomain = existingDomains.find(d => d.name === classification.domain);
            if (!targetDomain) {
                console.warn('[AS-IS Dashboard V2] ⚠️ Domain not found:', classification.domain);
                return;
            }
            
            // Update app classification
            if (lensType === 'business') {
                app.businessDomain = classification.domain;
            } else {
                app.technologyDomain = classification.domain;
            }
            app._classificationSource = 'ai'; // Mark as AI-classified
            
            movedCount++;
        });
        
        // Rebuild dashboard data
        const applications = window.threeLensData.apps;
        const updatedData = lensType === 'business' 
            ? await generateTwoLensDashboardFromData(applications, null)
            : await generateTwoLensDashboardFromData(applications, null);
        
        // Update global data
        window.threeLensData = updatedData;
        
        // Save to localStorage
        const currentEngagement = window.engagementManager.getActiveEngagement();
        if (currentEngagement) {
            saveThreeLensDashboardData(currentEngagement.id, updatedData);
        }
        
        // Re-render dashboard
        const dashboardData = {
            metadata: {
                accountName: currentEngagement?.customerName || 'Organization',
                industry: currentEngagement?.segment || 'Enterprise',
                exportDate: new Date().toISOString().split('T')[0],
                totalApplications: applications.length
            },
            kpis: updatedData.kpis,
            domains: [],
            layers: []
        };
        
        renderASISDashboard(dashboardData, 'dashboard-container', {
            showRegenerateButton: true,
            insights: window.asisDashboardCache?.insights || null
        });
        
        // Switch to the updated lens view
        setTimeout(() => switchThreeLens(lensType), 100);
        
        // Mark portfolio as changed to enable regenerate button
        markPortfolioAsChanged(lensType);
        
        showASISNotification(`✅ AI classified ${movedCount} apps successfully`, 'success');
        console.log('[AS-IS Dashboard V2] ✅ AI classification complete:', {
            processed: classifications.classifications.length,
            moved: movedCount,
            lensType: lensType
        });
        
    } catch (error) {
        console.error('[AS-IS Dashboard V2] ❌ AI classification failed:', error);
        showASISNotification(`❌ AI classification failed: ${error.message}`, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPOSE FUNCTIONS TO WINDOW FOR ONCLICK HANDLERS
// ═══════════════════════════════════════════════════════════════════
window.renderASISDashboard = renderASISDashboard;
window.generateASISInsights = generateASISInsights;
window.regenerateASISInsights = regenerateASISInsights;
window.renderLensInsightsResults = renderLensInsightsResults;
window.showASISNotification = showASISNotification;
window.classifyUnknownDomainsWithAI = classifyUnknownDomainsWithAI;
window.switchThreeLens = switchThreeLens;
window.markPortfolioAsChanged = markPortfolioAsChanged;
window.enableRegenerateButton = enableRegenerateButton;

// console.log('[ASIS Dashboard Renderer] ✅ Loaded v5.41 - Nordic Colors - Functions exposed to window:', {
//     renderASISDashboard: typeof window.renderASISDashboard,
//     generateASISInsights: typeof window.generateASISInsights,
//     switchThreeLens: typeof window.switchThreeLens
// });
