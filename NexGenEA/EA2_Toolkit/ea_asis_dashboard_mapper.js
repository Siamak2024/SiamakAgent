/**
 * ea_asis_dashboard_mapper.js
 * AS-IS Architecture Dashboard Data Mapper
 * 
 * Maps application portfolio data to dashboard structure:
 * - Business domains (5-8 domains from apps)
 * - Architecture layers (4-layer taxonomy)
 * - KPI calculations (totals, lifecycle, risk)
 * 
 * @version 1.0
 * @date 2026-05-18
 */

/**
 * Main mapper function - transforms application array into dashboard data structure
 * @param {Array} applications - Array from engagementManager.getEntities('applications')
 * @param {Object} options - Optional configuration
 * @returns {Object} Dashboard data structure
 */
function mapApplicationsToDashboard(applications, options = {}) {
    const {
        accountName = 'Unknown Account',
        industry = 'Generic',
        reportDate = new Date().toISOString().split('T')[0]
    } = options;

    console.log('[ASIS Dashboard Mapper] Starting mapping for', applications.length, 'applications');

    // Phase 1: Calculate KPIs
    const kpis = calculatePortfolioKPIs(applications);

    // Phase 2: Map to business domains
    const domains = mapApplicationsToDomains(applications);

    // Phase 3: Map to architecture layers
    const layers = mapApplicationsToLayers(applications);

    console.log('[ASIS Dashboard Mapper] Mapped to', domains.length, 'domains and', layers.length, 'layers');

    return {
        metadata: {
            accountName,
            industry,
            reportDate,
            exportDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            totalApplications: applications.length
        },
        kpis,
        domains,
        layers,
        timestamp: Date.now()
    };
}

/**
 * Calculate portfolio KPIs
 * @param {Array} applications
 * @returns {Object} KPI values
 */
function calculatePortfolioKPIs(applications) {
    const total = applications.length;
    
    // Count legacy systems based on Technology Stack (for visualization)
    const legacy = applications.filter(app => {
        const techStack = (app.technologyStack || '').toLowerCase();
        return techStack.includes('legacy') || techStack.includes('mainframe');
    }).length;
    
    // Count active systems based on lifecycle field
    const active = applications.filter(app => {
        const lifecycle = (app.lifecycle || '').toLowerCase();
        return lifecycle === 'active' || lifecycle === 'production' || lifecycle === 'operational';
    }).length;
    
    const highRisk = applications.filter(app => 
        app.riskLevel === 'high' || app.risk === 'high'
    ).length;

    console.log(`[KPI Calculation] Total: ${total}, Legacy (Tech Stack): ${legacy}, Active (Lifecycle): ${active}, High Risk: ${highRisk}`);

    return {
        totalApplications: total,
        legacySystems: legacy,
        activeSystems: active,
        highRiskApps: highRisk
    };
}

/**
 * Map applications to business domains (5-8 domains)
 * Priority: app.businessDomain → app.businessCapabilities → app.department → "Supporting Systems"
 * @param {Array} applications
 * @returns {Array} Domain objects with apps
 */
function mapApplicationsToDomains(applications) {
    const domainMap = new Map();

    applications.forEach(app => {
        let domainName = inferBusinessDomain(app);
        
        if (!domainMap.has(domainName)) {
            domainMap.set(domainName, {
                name: domainName,
                color: getDomainColor(domainName),
                cardAccent: getDomainColor(domainName),
                count: 0,
                apps: [],
                legacy: [],
                description: getDomainDescription(domainName),
                recommendations: getDomainRecommendations(domainName)
            });
        }

        const domain = domainMap.get(domainName);
        domain.count++;

        // Separate active vs legacy apps
        if (app.lifecycle === 'legacy') {
            domain.legacy.push(app.name);
        } else {
            domain.apps.push(app.name);
        }
    });

    // Convert map to sorted array (by app count descending)
    return Array.from(domainMap.values())
        .sort((a, b) => b.count - a.count);
}

/**
 * Helper: Infer domain from Technology Stack ONLY
 * Used to detect if a domain was manually overridden
 * @param {String} technologyStack
 * @returns {String} Domain name or null
 */
function inferDomainFromTechnologyStack(techStack) {
    if (!techStack || !techStack.trim()) return null;
    
    const ts = techStack.trim();
    
    // Core Insurance & Pension Systems
    if (ts.match(/Core Insurance Platform|Core Insurance System|Core Pension Platform|Insurance System|Pension System/i)) {
        return 'Core Insurance & Pension';
    }
    
    // Legacy Core Systems (Mainframe & Batch)
    if (ts.match(/Legacy \(Mainframe\)|Legacy Core|Mainframe|Batch Processing/i)) {
        return 'Legacy Core Systems';
    }
    
    // Customer & Digital Experience
    if (ts.match(/Customer Platform|Customer Portal|Customer Data Platform|Experience Platform|eXperience Platform|Contact Center Platform/i)) {
        return 'Customer & Digital';
    }
    
    // Integration & APIs
    if (ts.match(/Integration Platform|Integration Tool|API Management|Messaging|Integration/i)) {
        return 'Integration & APIs';
    }
    
    // Data & Analytics
    if (ts.match(/Data Platform|Data Management|Data Processing|Analytics Platform|Analytics Tool|BI Tool|Analytics System/i)) {
        return 'Data & Analytics';
    }
    
    // Financial Operations
    if (ts.match(/Financial Processing|Financial System|ERP System|ERP|Payment System|Planning Tool/i)) {
        return 'Finance & Operations';
    }
    
    // Risk & Compliance
    if (ts.match(/Risk System|Claims System|Authorization System|Archive System/i)) {
        return 'Risk & Compliance';
    }
    
    // Infrastructure & IT Operations
    if (ts.match(/Cloud Infrastructure|Cloud Platform|Infrastructure|Network Security|Network Management|Security|Backup|ITSM Tool|DevOps Tool|DevOps Platform|Monitoring|File Transfer/i)) {
        return 'Infrastructure & IT Ops';
    }
    
    // Marketing & CRM
    if (ts.match(/Marketing Automation|CRM/i)) {
        return 'Marketing & Sales';
    }
    
    // Supporting Systems
    if (ts.match(/Legacy System|Content Management System|Document Management|Case Management|Advisory Tool|Service Platform|Partner System|Broker System/i)) {
        return 'Supporting Systems';
    }
    
    return null;
}

/**
 * Infer business domain for an application
 * ENHANCED: Uses technologyStack as primary classifier
 * @param {Object} app
 * @returns {String} Domain name
 */
function inferBusinessDomain(app) {
    // ============================================================
    // PRIORITY 0: Manual domain assignment (Drag & Drop override)
    // ============================================================
    // Check if user manually moved this app via drag & drop
    if (app._movedToDomain && app._movedToDomain.trim()) {
        console.log(`[Domain Mapper] Preserving manual move: ${app.name} → ${app._movedToDomain}`);
        return app._movedToDomain.trim();
    }
    
    // Also check businessDomain if it differs from Technology Stack inference
    // (might be from previous manual moves before _movedToDomain was added)
    if (app.businessDomain && app.businessDomain.trim() && app.businessDomain !== 'Unknown') {
        const techStackDomain = inferDomainFromTechnologyStack(app.technologyStack);
        if (techStackDomain !== app.businessDomain) {
            // Domain was manually set, preserve it
            console.log(`[Domain Mapper] Preserving existing domain: ${app.name} → ${app.businessDomain}`);
            return app.businessDomain.trim();
        }
    }
    
    // ============================================================
    // PRIORITY 1: Technology Stack-based classification
    // ============================================================
    const techStack = (app.technologyStack || '').trim();
    if (techStack) {
        // Core Insurance & Pension Systems
        if (techStack.match(/Core Insurance Platform|Core Insurance System|Core Pension Platform|Insurance System|Pension System/i)) {
            return 'Core Insurance & Pension';
        }
        
        // Legacy Core Systems (Mainframe & Batch)
        if (techStack.match(/Legacy \(Mainframe\)|Legacy Core|Mainframe|Batch Processing/i)) {
            return 'Legacy Core Systems';
        }
        
        // Customer & Digital Experience
        if (techStack.match(/Customer Platform|Customer Portal|Customer Data Platform|Experience Platform|eXperience Platform|Contact Center Platform/i)) {
            return 'Customer & Digital';
        }
        
        // Integration & APIs
        if (techStack.match(/Integration Platform|Integration Tool|API Management|Messaging|Integration/i)) {
            return 'Integration & APIs';
        }
        
        // Data & Analytics
        if (techStack.match(/Data Platform|Data Management|Data Processing|Analytics Platform|Analytics Tool|BI Tool|Analytics System/i)) {
            return 'Data & Analytics';
        }
        
        // Financial Operations
        if (techStack.match(/Financial Processing|Financial System|ERP System|ERP|Payment System|Planning Tool/i)) {
            return 'Finance & Operations';
        }
        
        // Risk & Compliance
        if (techStack.match(/Risk System|Claims System|Authorization System|Archive System/i)) {
            return 'Risk & Compliance';
        }
        
        // Infrastructure & IT Operations
        if (techStack.match(/Cloud Infrastructure|Cloud Platform|Infrastructure|Network Security|Network Management|Security|Backup|ITSM Tool|DevOps Tool|DevOps Platform|Monitoring|File Transfer/i)) {
            return 'Infrastructure & IT Ops';
        }
        
        // Marketing & CRM
        if (techStack.match(/Marketing Automation|CRM/i)) {
            return 'Marketing & Sales';
        }
        
        // Supporting Systems
        if (techStack.match(/Legacy System|Content Management System|Document Management|Case Management|Advisory Tool|Service Platform|Partner System|Broker System/i)) {
            return 'Supporting Systems';
        }
    }

    // ============================================================
    // PRIORITY 2: Explicit businessDomain field
    // ============================================================
    if (app.businessDomain && app.businessDomain.trim() && app.businessDomain !== 'Unknown') {
        return app.businessDomain.trim();
    }

    // ============================================================
    // PRIORITY 3: businessCapabilities → APQC L1 category
    // ============================================================
    const capabilities = app.businessCapabilities || app.linkedCapabilities || [];
    if (capabilities && capabilities.length > 0) {
        for (const capability of capabilities) {
            const domain = inferDomainFromCapability(capability);
            if (domain) return domain;
        }
    }

    // ============================================================
    // PRIORITY 4: department field fallback
    // ============================================================
    if (app.department && app.department.trim() && app.department !== 'Unknown') {
        return app.department.trim();
    }

    // ============================================================
    // PRIORITY 5: Technology stack and name pattern inference
    // ============================================================
    const techDomain = inferDomainFromTechnology(app);
    if (techDomain) return techDomain;

    // Default: Supporting Systems (not Unknown)
    return 'Supporting Systems';
}

/**
 * Infer domain from APQC capability name or ID
 * Supports both APQC PCF category names and specific capability patterns
 * @param {String} capability - Capability name or ID
 * @returns {String|null}
 */
function inferDomainFromCapability(capability) {
    const capLower = (capability || '').toLowerCase();

    // APQC PCF L1 Categories
    if (capLower.match(/vision|strategy|develop.*vision/i)) {
        return 'Strategy & Planning';
    }
    if (capLower.match(/develop.*product|manage.*product|product.*life.*cycle/i)) {
        return 'Product & Services';
    }
    if (capLower.match(/market.*product|sell.*product|generate.*demand|marketing|sales/i)) {
        return 'Marketing & Sales';
    }
    if (capLower.match(/deliver.*product|deliver.*service|order.*fulfillment|logistics|supply.*chain/i)) {
        return 'Operations & Delivery';
    }
    if (capLower.match(/deliver.*service|customer.*support|service.*delivery/i)) {
        return 'Customer Service';
    }
    if (capLower.match(/manage.*customer|customer.*relationship|customer.*experience|crm/i)) {
        return 'Customer & Experience';
    }
    if (capLower.match(/develop.*manage.*human.*capital|hr|human.*resource|talent|workforce/i)) {
        return 'Human Resources';
    }
    if (capLower.match(/information.*technology|it.*management|manage.*it|technology.*infrastructure/i)) {
        return 'Technology & IT';
    }
    if (capLower.match(/financial.*management|finance|accounting|budget|treasury/i)) {
        return 'Finance & Administration';
    }
    if (capLower.match(/property|real.*estate|facility|physical.*resource/i)) {
        return 'Facilities & Real Estate';
    }
    if (capLower.match(/environment|health|safety|ehs|sustainability/i)) {
        return 'Environment, Health & Safety';
    }
    if (capLower.match(/risk.*management|compliance|governance|legal|audit/i)) {
        return 'Risk & Governance';
    }
    if (capLower.match(/external.*relationship|stakeholder|government.*relation|community/i)) {
        return 'External Relations';
    }

    // Insurance-specific patterns
    if (capLower.match(/underwriting|policy.*admin|claims.*process|actuarial|premium/i)) {
        return 'Insurance Operations';
    }
    if (capLower.match(/policy.*holder|insured|beneficiary/i)) {
        return 'Insurance Customer Management';
    }

    // Generic business function patterns
    if (capLower.includes('customer') || capLower.includes('client')) {
        return 'Customer & Experience';
    }
    if (capLower.includes('finance') || capLower.includes('accounting')) {
        return 'Finance & Administration';
    }
    if (capLower.includes('operation') || capLower.includes('supply')) {
        return 'Operations & Delivery';
    }
    if (capLower.includes('technology') || capLower.includes('it ') || capLower.includes('data')) {
        return 'Technology & IT';
    }

    return null;
}

/**
 * Infer domain from technology/name patterns
 * @param {Object} app
 * @returns {String|null}
 */
function inferDomainFromTechnology(app) {
    const text = `${app.name || ''} ${app.technology || ''} ${app.technologyStack || ''}`.toLowerCase();

    // Customer-facing
    if (text.match(/crm|customer|portal|website|mobile app|campaign|marketing/i)) {
        return 'Customer & Digital';
    }

    // Core ERP/Finance
    if (text.match(/erp|sap|oracle|finance|accounting|agresso|concur/i)) {
        return 'Core ERP & Finance';
    }

    // Data & Analytics
    if (text.match(/bi|analytics|data|warehouse|power bi|tableau|reporting/i)) {
        return 'Data & Analytics';
    }

    // Integration & API
    if (text.match(/api|integration|middleware|esb|mq|kafka/i)) {
        return 'Integration & APIs';
    }

    // Infrastructure
    if (text.match(/infrastructure|cloud|azure|aws|server|storage|backup/i)) {
        return 'Infrastructure';
    }

    return null;
}

/**
 * Get color for domain (Vivicta palette)
 * @param {String} domainName
 * @returns {String} Hex color
 */
function getDomainColor(domainName) {
    const colorMap = {
        // Core Business
        'Core Insurance & Pension': '#00472E',       // Vivicta dark green
        'Finance & Operations': '#7A0049',           // Purple
        'Finance & Administration': '#7A0049',
        
        // Customer & Digital
        'Customer & Experience': '#003D75',          // Blue
        'Customer & Digital': '#003D75',
        'Marketing & Sales': '#0EA5E9',              // Sky blue
        
        // Product & Services
        'Product & Services': '#006B3F',             // Green
        
        // Technology & Data
        'Data & Analytics': '#4F46E5',               // Indigo
        'Integration & APIs': '#10B981',             // Emerald
        'Technology & IT': '#3B82F6',                // Blue
        
        // Operations
        'Operations': '#EA580C',                      // Orange
        'Operations & Delivery': '#EA580C',
        
        // Risk & Governance
        'Risk & Governance': '#DC2626',              // Red
        'Risk & Compliance': '#DC2626',
        
        // Infrastructure & Legacy
        'Infrastructure': '#6B7280',                 // Gray
        'Infrastructure & IT Ops': '#6B7280',
        'Legacy Core Systems': '#92400E',            // Amber/brown
        
        // Supporting
        'Supporting Systems': '#9CA3AF'              // Light Gray
    };

    return colorMap[domainName] || '#6B7280';
}

/**
 * Get domain description
 * @param {String} domainName
 * @returns {String}
 */
function getDomainDescription(domainName) {
    const descriptions = {
        'Customer & Experience': 'Customer-facing applications supporting engagement, marketing, and service delivery.',
        'Customer & Digital': 'Digital channels and customer interaction platforms.',
        'Product & Services': 'Product development, management, and service delivery capabilities.',
        'Core ERP & Finance': 'Enterprise resource planning, financial management, and core business operations.',
        'Finance & Administration': 'Financial operations, accounting, procurement, and administrative functions.',
        'Operations': 'Operational systems supporting production, logistics, and supply chain.',
        'Technology & Data': 'Technology infrastructure, data platforms, and analytics capabilities.',
        'Data & Analytics': 'Business intelligence, reporting, and data analytics platforms.',
        'Integration & APIs': 'Integration middleware, APIs, and data exchange platforms.',
        'Risk & Governance': 'Risk management, compliance, and governance systems.',
        'Infrastructure': 'Core IT infrastructure, hosting, and platform services.',
        'Supporting Systems': 'Supporting applications that don\'t fit into primary business domains.'
    };

    return descriptions[domainName] || 'Business applications supporting organizational operations.';
}

/**
 * Get domain recommendations
 * @param {String} domainName
 * @returns {Array} Recommendation strings
 */
function getDomainRecommendations(domainName) {
    // Generic recommendations - can be enriched by AI in Phase 2
    return [
        'Review application rationalization opportunities',
        'Assess cloud migration readiness',
        'Evaluate integration requirements'
    ];
}

/**
 * Map applications to architecture layers (4-layer taxonomy)
 * @param {Array} applications
 * @returns {Array} Layer objects with apps
 */
function mapApplicationsToLayers(applications) {
    const layers = [
        {
            name: 'Customer & Digital',
            count: 0,
            barColor: '#003D75',
            tags: []
        },
        {
            name: 'Core Business & Insurance',
            count: 0,
            barColor: '#006B3F',
            tags: []
        },
        {
            name: 'Data & Integration',
            count: 0,
            barColor: '#4F46E5',
            tags: []
        },
        {
            name: 'Infrastructure & Legacy Core',
            count: 0,
            barColor: '#6B7280',
            tags: []
        }
    ];

    applications.forEach(app => {
        const layerIndex = inferArchitectureLayer(app);
        const layer = layers[layerIndex];
        
        layer.count++;
        
        // Color coding: Legacy Mainframe = amber, Legacy = yellow, Active = blue
        const techStack = (app.technologyStack || '').trim();
        const isMainframe = techStack.match(/Legacy \(Mainframe\)|Mainframe/i);
        const isLegacy = app.lifecycle === 'legacy' || techStack.match(/^Legacy$/i);
        
        let bg, text;
        if (isMainframe) {
            bg = '#FEF3C7'; // Amber
            text = '#92400E'; // Amber text
        } else if (isLegacy) {
            bg = '#FEF9C3'; // Yellow
            text = '#854D0E'; // Yellow text
        } else {
            bg = '#E6F1FA'; // Blue
            text = '#003D75'; // Blue text
        }
        
        layer.tags.push({
            name: app.name,
            bg,
            text
        });
    });

    return layers.filter(layer => layer.count > 0);
}

/**
 * Infer architecture layer for an application
 * ENHANCED: Uses technologyStack as primary classifier
 * @param {Object} app
 * @returns {Number} Layer index (0-3)
 * 
 * Layers:
 * 0 - Customer & Digital: Portals, customer-facing apps, experience platforms
 * 1 - Core Business & Insurance: ERP, core insurance, pension, business logic
 * 2 - Data & Integration: APIs, data platforms, integration, analytics
 * 3 - Infrastructure & Legacy Core: Cloud, infrastructure, mainframe legacy
 */
function inferArchitectureLayer(app) {
    const text = `${app.name || ''} ${app.category || ''} ${app.technology || ''} ${app.description || ''}`.toLowerCase();
    const capabilities = (app.businessCapabilities || app.linkedCapabilities || []).join(' ').toLowerCase();
    const isLegacy = app.lifecycle === 'legacy';
    
    // ============================================================
    // PRIORITY 1: Technology Stack-based classification (NEW!)
    // ============================================================
    const techStack = (app.technologyStack || '').trim();
    if (techStack) {
        // Layer 0: Customer & Digital
        if (techStack.match(/Customer Platform|Customer Portal|Customer Data Platform|Experience Platform|eXperience Platform|Contact Center Platform|Marketing Automation|Content Management System/i)) {
            return 0;
        }
        
        // Layer 3: Infrastructure & Legacy Core
        if (techStack.match(/Legacy \(Mainframe\)|Mainframe|Core Platform|Infrastructure|Cloud Infrastructure|Cloud Platform|Network Security|Network Management|Security|Backup|ITSM Tool|DevOps Tool|DevOps Platform|Monitoring/i)) {
            return 3;
        }
        
        // Layer 2: Data & Integration
        if (techStack.match(/Integration Platform|Integration Tool|API Management|Messaging|Integration|Data Platform|Data Management|Data Processing|Analytics Platform|Analytics Tool|BI Tool|Analytics System|File Transfer/i)) {
            return 2;
        }
        
        // Layer 1: Core Business & Insurance (DEFAULT for business apps)
        if (techStack.match(/Core Insurance Platform|Core Insurance System|Core Pension Platform|Insurance System|Pension System|Financial Processing|Financial System|ERP System|ERP|Payment System|Planning Tool|Risk System|Claims System|Case Management|Advisory Tool|Service Platform|Archive System|Authorization System|Partner System|Broker System|Legacy System|Legacy|Document Management/i)) {
            return 1;
        }
    }

    // ============================================================
    // PRIORITY 2: Name/description pattern matching (fallback)
    // ============================================================
    
    // Layer 0: Customer & Digital (customer-facing, channels, portals)
    if (text.match(/portal|website|mobile.*app|customer.*facing|front.*end|web.*app|e-commerce|digital.*channel|customer.*portal/i)) {
        return 0;
    }
    if (capabilities.match(/customer.*experience|digital.*channel|customer.*portal|customer.*interface/i)) {
        return 0;
    }

    // Layer 3: Infrastructure (ONLY true infrastructure - cloud, servers, network, monitoring)
    // Mainframe and legacy core systems go here
    if (text.match(/mainframe|legacy.*core|batch.*processing/i)) {
        return 3; // Mainframe legacy → Infrastructure layer
    }
    if (!isLegacy) {
        if (text.match(/^(azure|aws|gcp|infrastructure|cloud.*platform|kubernetes|docker|server|network|firewall|load.*balancer|monitoring|logging|backup.*service|disaster.*recovery|vpn|dns|active.*directory|ldap)$/i)) {
            return 3;
        }
        if (text.match(/infrastructure.*management|cloud.*infrastructure|network.*infrastructure|server.*infrastructure|monitoring.*tool|logging.*platform/i)) {
            return 3;
        }
    }

    // Layer 2: Data & Integration (databases, APIs, middleware, ETL, integration platforms)
    if (text.match(/database|data.*warehouse|bi.*tool|etl|data.*integration|api.*gateway|middleware|esb|message.*queue|kafka|mq|integration.*platform|data.*lake|analytics.*platform/i)) {
        return 2;
    }
    if (text.match(/sql|oracle|postgres|mongodb|redis|elastic|tableau|power.*bi|informatica|talend|mulesoft|dell.*boomi/i)) {
        return 2;
    }
    if (capabilities.match(/data.*management|data.*integration|analytics|reporting|api.*management/i)) {
        return 2;
    }

    // Layer 1: Core Business & Insurance (DEFAULT - most apps belong here)
    // This includes: ERP, CRM, HCM, finance, operations, insurance, pension, etc.
    if (text.match(/erp|sap|oracle.*ebs|business|finance|accounting|hr|hcm|supply|product|service|core|insurance|banking|pension/i)) {
        return 1;
    }
    if (text.match(/underwriting|policy.*admin|claims.*system|actuarial|premium.*calculation/i)) {
        return 1;
    }
    if (text.match(/customer|crm|campaign|marketing/i)) {
        return 1; // CRM and marketing tools are business applications
    }
    if (capabilities.match(/finance|accounting|hr|human.*resource|supply.*chain|procurement|sales|marketing|underwriting|claims|policy/i)) {
        return 1;
    }

    // Default: Core Business & Insurance layer
    return 1;
}

/**
 * Calculate risk snapshot (6 cells)
 * @param {Array} applications
 * @returns {Array} Risk cell objects
 */
function calculateRiskSnapshot(applications) {
    const total = applications.length;
    const legacy = applications.filter(app => app.lifecycle === 'legacy').length;
    const highRisk = applications.filter(app => app.riskLevel === 'high' || app.risk === 'high').length;
    const phaseOut = applications.filter(app => app.lifecycle === 'phaseOut').length;
    const retire = applications.filter(app => 
        app.action === 'retire' || app.rationalizationAction === 'retire'
    ).length;

    // Count cloud indicators
    const cloudApps = applications.filter(app => {
        const text = `${app.technology || ''} ${app.technologyStack || ''}`.toLowerCase();
        return text.match(/azure|aws|cloud|saas/i);
    }).length;

    // Count AI agents (if field exists)
    const aiAgents = applications.reduce((sum, app) => {
        return sum + (app.linkedAIAgents?.length || 0);
    }, 0);

    return [
        {
            label: 'Legacy systems',
            value: legacy.toString(),
            danger: legacy > total * 0.2, // More than 20% legacy
            description: `${Math.round((legacy / total) * 100)}% of total portfolio`
        },
        {
            label: 'High-risk apps',
            value: highRisk.toString(),
            danger: highRisk > 0,
            description: highRisk > 0 ? 'Requires attention' : 'No critical risks identified'
        },
        {
            label: 'Rationalization',
            value: retire > 0 ? `${retire} to retire` : 'Retain',
            danger: false,
            description: phaseOut > 0 ? `${phaseOut} apps in phase-out` : 'No decommission plans recorded'
        },
        {
            label: 'Cloud signals',
            value: cloudApps > 0 ? `${cloudApps} apps` : 'None',
            danger: false,
            description: cloudApps > 0 ? 'Active cloud adoption' : 'No cloud-native applications detected'
        },
        {
            label: 'Platform diversity',
            value: getUniquePlatformCount(applications).toString(),
            danger: false,
            description: 'Unique technology platforms'
        },
        {
            label: 'AI agents registered',
            value: aiAgents.toString(),
            danger: false,
            description: aiAgents > 0 ? 'AI augmentation active' : 'No AI agents in portfolio'
        }
    ];
}

/**
 * Get count of unique platforms/vendors
 * @param {Array} applications
 * @returns {Number}
 */
function getUniquePlatformCount(applications) {
    const platforms = new Set();
    
    applications.forEach(app => {
        if (app.vendor && app.vendor.trim()) {
            platforms.add(app.vendor.trim().toLowerCase());
        }
        if (app.technologyVendor && app.technologyVendor.trim()) {
            platforms.add(app.technologyVendor.trim().toLowerCase());
        }
    });

    return platforms.size || 1; // At least 1 if no vendors specified
}

/**
 * Validate dashboard data completeness
 * @param {Object} dashboardData
 * @returns {Object} Validation result
 */
function validateDashboardData(dashboardData) {
    const issues = [];
    const warnings = [];

    // Check domain count
    if (dashboardData.domains.length < 3) {
        warnings.push('Less than 3 business domains identified - portfolio may need domain classification');
    }
    if (dashboardData.domains.length > 10) {
        warnings.push('More than 10 domains - consider consolidating for executive view');
    }

    // Check for "Supporting Systems" dominance
    const supportingDomain = dashboardData.domains.find(d => d.name === 'Supporting Systems');
    if (supportingDomain && supportingDomain.count > dashboardData.kpis.totalApplications * 0.3) {
        warnings.push('Over 30% of applications in "Supporting Systems" - improve domain classification');
    }

    // Check layer distribution
    if (dashboardData.layers.length < 2) {
        warnings.push('Applications concentrated in single layer - review architecture layer assignments');
    }

    return {
        valid: issues.length === 0,
        issues,
        warnings,
        completeness: calculateCompletenessScore(dashboardData)
    };
}

/**
 * Calculate data completeness score (0-100)
 * @param {Object} dashboardData
 * @returns {Number}
 */
function calculateCompletenessScore(dashboardData) {
    let score = 0;

    // KPIs present (25 points)
    if (dashboardData.kpis.totalApplications > 0) score += 25;

    // Domains identified (25 points)
    if (dashboardData.domains.length >= 3 && dashboardData.domains.length <= 8) {
        score += 25;
    } else if (dashboardData.domains.length > 0) {
        score += 15;
    }

    // Layers distributed (25 points)
    if (dashboardData.layers.length >= 3) {
        score += 25;
    } else if (dashboardData.layers.length >= 2) {
        score += 15;
    }

    // Three-lens data present (25 points) - optional bonus if available
    if (window.threeLensData && window.threeLensData.apps && window.threeLensData.apps.length > 0) {
        score += 25;
    }

    return score;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mapApplicationsToDashboard,
        calculatePortfolioKPIs,
        mapApplicationsToDomains,
        mapApplicationsToLayers,
        validateDashboardData
    };
}
