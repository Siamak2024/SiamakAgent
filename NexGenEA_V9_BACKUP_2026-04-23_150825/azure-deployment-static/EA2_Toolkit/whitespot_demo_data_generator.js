/**
 * whitespot_demo_data_generator.js
 * Phase 5: Demo Data Generator for WhiteSpot Heatmap
 * - Generate realistic sample heatmaps for testing
 * - Populate with varied assessment states
 * - Include opportunities and APQC mappings
 * - Support multiple customer scenarios
 * 
 * @version 1.0
 * @date 2026-04-20
 */

// ═══════════════════════════════════════════════════════════════════
// DEMO DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate a complete demo heatmap for a customer
 * @param {Object} customer - Customer entity
 * @param {string} scenario - Scenario type: 'mature', 'emerging', 'mixed', 'greenfield'
 * @param {Object} manager - Optional manager (standalone or engagement)
 * @returns {Object} Complete WhiteSpot heatmap with assessments
 */
async function generateDemoHeatmap(customer, scenario = 'mixed', manager = null) {
    if (!window.vivictaServiceLoader || !window.apqcWhiteSpotIntegration) {
        throw new Error('Service loaders not initialized. Please ensure service loader and APQC integration modules are loaded.');
    }
    
    // Determine which manager to use
    const dataManager = manager || (typeof window.whitespotStandaloneManager !== 'undefined' ? window.whitespotStandaloneManager : window.engagementManager);
    
    const hlServices = window.vivictaServiceLoader.getHLServices();
    const timestamp = new Date().toISOString();
    
    // Generate heatmap ID
    const existingHeatmaps = dataManager.getHeatmaps ? dataManager.getHeatmaps() : (dataManager.getEntities('whiteSpotHeatmaps') || []);
    const nextId = existingHeatmaps.length + 1;
    const heatmapId = `WSH-${String(nextId).padStart(3, '0')}`;
    
    // Create base heatmap structure
    const heatmap = {
        id: heatmapId,
        customerId: customer.id,
        customerName: customer.name,
        assessmentDate: new Date().toISOString().split('T')[0],
        assessedBy: 'Demo Data Generator',
        description: getDemoDescription(scenario),
        comments: getDemoComments(scenario),
        hlAssessments: [],
        opportunities: [],
        customBusinessAreas: [],
        apqcMappings: [],
        metadata: {
            createdAt: timestamp,
            updatedAt: timestamp,
            version: '1.0',
            scenario: scenario
        }
    };
    
    // Generate assessments for all HL services based on scenario
    for (const service of hlServices) {
        const assessment = await generateServiceAssessment(service, scenario, heatmap);
        heatmap.hlAssessments.push(assessment);
    }
    
    // Generate opportunities based on gaps
    heatmap.opportunities = generateOpportunities(heatmap, scenario);
    
    // Generate custom business areas
    heatmap.customBusinessAreas = generateCustomBusinessAreas(heatmap, scenario);
    
    return heatmap;
}

/**
 * Generate assessment for a single service based on scenario
 */
async function generateServiceAssessment(service, scenario, heatmap) {
    const l3Components = window.vivictaServiceLoader.getDLComponentsForService(service.id);
    
    // Determine assessment state based on scenario
    const state = determineAssessmentState(service, scenario);
    
    // Generate L3 component delivery tracking
    const l3Tracking = l3Components.map(component => ({
        l3Id: component.id,
        l3Name: component.name,
        isDelivered: determineL3Delivery(component, state, scenario),
        notes: ''
    }));
    
    // Calculate score based on L3 delivery
    const deliveredCount = l3Tracking.filter(c => c.isDelivered).length;
    const score = l3Components.length > 0 ? Math.round((deliveredCount / l3Components.length) * 100) : 0;
    
    // Generate APQC mappings for this service
    const apqcMappings = await generateAPQCMappingsForService(service, l3Components, scenario);
    
    const assessment = {
        l2ServiceId: service.id,
        l2ServiceName: service.name,
        l1ServiceArea: service.l1ParentName,
        assessmentState: state,
        score: score,
        l3Components: l3Tracking,
        apqcMappedCapabilities: apqcMappings,
        opportunityValue: calculateOpportunityValue(state, score),
        notes: generateAssessmentNotes(service, state, scenario)
    };
    
    return assessment;
}

/**
 * Determine assessment state based on scenario and service characteristics
 */
function determineAssessmentState(service, scenario) {
    const rand = Math.random();
    
    switch (scenario) {
        case 'mature':
            // Mature customers have mostly FULL with some PARTIAL
            if (rand < 0.70) return 'FULL';
            if (rand < 0.90) return 'PARTIAL';
            if (rand < 0.95) return 'CUSTOM';
            return 'POTENTIAL';
            
        case 'emerging':
            // Emerging customers have mix of PARTIAL, POTENTIAL, and some LOST
            if (rand < 0.20) return 'FULL';
            if (rand < 0.50) return 'PARTIAL';
            if (rand < 0.70) return 'POTENTIAL';
            if (rand < 0.85) return 'CUSTOM';
            return 'LOST';
            
        case 'greenfield':
            // New customers are mostly POTENTIAL with some initial CUSTOM
            if (rand < 0.10) return 'FULL';
            if (rand < 0.20) return 'PARTIAL';
            if (rand < 0.40) return 'CUSTOM';
            if (rand < 0.50) return 'LOST';
            return 'POTENTIAL';
            
        case 'mixed':
        default:
            // Balanced distribution across all states
            if (rand < 0.30) return 'FULL';
            if (rand < 0.50) return 'PARTIAL';
            if (rand < 0.65) return 'CUSTOM';
            if (rand < 0.80) return 'POTENTIAL';
            return 'LOST';
    }
}

/**
 * Determine if L3 component is delivered based on parent state
 */
function determineL3Delivery(component, assessmentState, scenario) {
    const rand = Math.random();
    
    switch (assessmentState) {
        case 'FULL':
            return rand < 0.95; // 95% delivered for FULL
        case 'PARTIAL':
            return rand < 0.50; // 50% delivered for PARTIAL
        case 'CUSTOM':
            return rand < 0.60; // 60% delivered for CUSTOM
        case 'POTENTIAL':
            return rand < 0.10; // 10% delivered for POTENTIAL
        case 'LOST':
            return rand < 0.05; // 5% delivered for LOST
        default:
            return false;
    }
}

/**
 * Generate APQC mappings for a service
 */
async function generateAPQCMappingsForService(service, l3Components, scenario) {
    try {
        const suggestions = await window.apqcWhiteSpotIntegration.generateMappingSuggestions(
            service,
            l3Components,
            { minConfidence: 0.5, maxSuggestions: 5, preferredLevels: [3, 4] }
        );
        
        // For demo, randomly select 2-4 high-confidence suggestions
        const numMappings = Math.floor(Math.random() * 3) + 2; // 2-4 mappings
        const selectedMappings = suggestions
            .filter(s => s.confidence >= 0.5)
            .slice(0, numMappings)
            .map(s => s.apqcId);
        
        return selectedMappings;
    } catch (error) {
        console.warn(`Could not generate APQC mappings for ${service.name}:`, error);
        return [];
    }
}

/**
 * Calculate opportunity value based on state and score
 */
function calculateOpportunityValue(state, score) {
    if (state === 'FULL' && score >= 90) return 0;
    if (state === 'LOST') return Math.floor(Math.random() * 500000) + 100000; // $100k-$600k
    if (state === 'POTENTIAL') return Math.floor(Math.random() * 300000) + 50000; // $50k-$350k
    if (state === 'PARTIAL') return Math.floor(Math.random() * 200000) + 25000; // $25k-$225k
    if (state === 'CUSTOM') return Math.floor(Math.random() * 150000) + 20000; // $20k-$170k
    return 0;
}

/**
 * Generate assessment notes based on service and state
 */
function generateAssessmentNotes(service, state, scenario) {
    const notes = {
        FULL: [
            'All components fully operational and meeting SLAs.',
            'Complete delivery with high customer satisfaction.',
            'Comprehensive coverage across all service areas.',
            'Mature implementation with proven track record.'
        ],
        PARTIAL: [
            'Some components delivered, gaps identified in advanced features.',
            'Core services in place, additional capabilities needed.',
            'Basic delivery operational, expansion opportunities exist.',
            'Foundational elements complete, optimization required.'
        ],
        CUSTOM: [
            'Tailored solution implemented for specific requirements.',
            'Bespoke implementation addressing unique needs.',
            'Custom-built components integrated with standard services.',
            'Specialized configuration for client-specific use cases.'
        ],
        POTENTIAL: [
            'High-value opportunity identified, pending evaluation.',
            'Strategic service offering planned for next phase.',
            'Potential expansion area with strong business case.',
            'Recommended for future roadmap consideration.'
        ],
        LOST: [
            'Service not currently provided to this customer.',
            'Capability gap - competitive offering in place.',
            'Not delivered due to scope constraints.',
            'Outside current engagement scope.'
        ]
    };
    
    const stateNotes = notes[state] || ['No specific notes.'];
    return stateNotes[Math.floor(Math.random() * stateNotes.length)];
}

/**
 * Generate opportunities based on gaps in heatmap
 */
function generateOpportunities(heatmap, scenario) {
    const opportunities = [];
    let oppId = 1;
    
    // Find services with gaps (PARTIAL, LOST, or low score)
    const gapServices = heatmap.hlAssessments.filter(a => 
        a.assessmentState === 'PARTIAL' || 
        a.assessmentState === 'LOST' || 
        a.assessmentState === 'POTENTIAL' ||
        a.score < 75
    );
    
    // Generate 3-7 opportunities from gap services
    const numOpps = Math.min(gapServices.length, Math.floor(Math.random() * 5) + 3);
    const selectedServices = shuffleArray(gapServices).slice(0, numOpps);
    
    selectedServices.forEach(assessment => {
        const opp = {
            id: `OPP-${String(oppId++).padStart(3, '0')}`,
            l2ServiceId: assessment.l2ServiceId,
            title: generateOpportunityTitle(assessment),
            description: generateOpportunityDescription(assessment, scenario),
            estimatedValue: assessment.opportunityValue,
            priority: determineOpportunityPriority(assessment),
            status: 'identified',
            targetDate: generateTargetDate(),
            owner: '',
            notes: ''
        };
        opportunities.push(opp);
    });
    
    // Add 1-2 general opportunities not tied to specific services
    const generalOppCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < generalOppCount; i++) {
        opportunities.push({
            id: `OPP-${String(oppId++).padStart(3, '0')}`,
            l2ServiceId: null,
            title: getGeneralOpportunityTitle(scenario, i),
            description: getGeneralOpportunityDescription(scenario, i),
            estimatedValue: Math.floor(Math.random() * 400000) + 100000,
            priority: 'high',
            status: 'identified',
            targetDate: generateTargetDate(),
            owner: '',
            notes: ''
        });
    }
    
    return opportunities;
}

/**
 * Generate opportunity title based on assessment
 */
function generateOpportunityTitle(assessment) {
    const templates = [
        `Expand ${assessment.l2ServiceName} Coverage`,
        `Close ${assessment.l2ServiceName} Service Gaps`,
        `Enhance ${assessment.l2ServiceName} Capabilities`,
        `Implement Full ${assessment.l2ServiceName} Suite`,
        `Upgrade ${assessment.l2ServiceName} to Enterprise Level`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate opportunity description
 */
function generateOpportunityDescription(assessment, scenario) {
    return `Opportunity to enhance ${assessment.l2ServiceName} delivery. Current state: ${assessment.assessmentState} (${assessment.score}% coverage). Recommended to address identified gaps and deliver comprehensive service suite.`;
}

/**
 * Determine opportunity priority based on assessment
 */
function determineOpportunityPriority(assessment) {
    if (assessment.assessmentState === 'LOST' || assessment.score < 25) return 'critical';
    if (assessment.assessmentState === 'PARTIAL' || assessment.score < 50) return 'high';
    if (assessment.assessmentState === 'POTENTIAL' || assessment.score < 75) return 'medium';
    return 'low';
}

/**
 * Generate target date (3-12 months from now)
 */
function generateTargetDate() {
    const months = Math.floor(Math.random() * 10) + 3; // 3-12 months
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    return targetDate.toISOString().split('T')[0];
}

/**
 * Generate custom business areas
 */
function generateCustomBusinessAreas(heatmap, scenario) {
    const businessAreas = [];
    const areaTemplates = [
        { name: 'Financial Services', description: 'Banking, insurance, and financial management systems' },
        { name: 'Healthcare Operations', description: 'Patient care, medical records, and clinical systems' },
        { name: 'Manufacturing & Supply Chain', description: 'Production planning, inventory, and logistics' },
        { name: 'Retail & E-commerce', description: 'Point of sale, online ordering, and customer experience' },
        { name: 'Human Resources', description: 'Talent management, payroll, and employee services' },
        { name: 'Customer Relationship Management', description: 'Sales, marketing, and customer service operations' }
    ];
    
    // Generate 2-4 business areas
    const numAreas = Math.floor(Math.random() * 3) + 2;
    const selectedAreas = shuffleArray(areaTemplates).slice(0, numAreas);
    
    selectedAreas.forEach((area, index) => {
        // Randomly select 3-7 services to link to this area
        const numLinkedServices = Math.floor(Math.random() * 5) + 3;
        const linkedServices = shuffleArray(heatmap.hlAssessments)
            .slice(0, numLinkedServices)
            .map(a => a.l2ServiceId);
        
        businessAreas.push({
            id: `BA-${String(index + 1).padStart(3, '0')}`,
            name: area.name,
            description: area.description,
            linkedServiceIds: linkedServices,
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            notes: ''
        });
    });
    
    return businessAreas;
}

/**
 * Get general opportunity title
 */
function getGeneralOpportunityTitle(scenario, index) {
    const titles = [
        'Strategic Service Portfolio Expansion',
        'Digital Transformation Initiative',
        'Cloud Migration & Modernization',
        'Enterprise Integration Platform',
        'Advanced Analytics & AI Implementation'
    ];
    return titles[index % titles.length];
}

/**
 * Get general opportunity description
 */
function getGeneralOpportunityDescription(scenario, index) {
    const descriptions = [
        'Cross-cutting initiative to expand service capabilities across multiple areas. Requires coordination with key stakeholders and phased implementation approach.',
        'Comprehensive digital transformation program targeting process automation, data integration, and customer experience enhancement.',
        'Migration of legacy systems to modern cloud infrastructure with focus on scalability, resilience, and cost optimization.',
        'Development of unified integration platform to connect disparate systems and enable seamless data flow across the organization.',
        'Implementation of advanced analytics capabilities including machine learning, predictive modeling, and AI-powered decision support.'
    ];
    return descriptions[index % descriptions.length];
}

/**
 * Get demo description based on scenario
 */
function getDemoDescription(scenario) {
    const descriptions = {
        mature: 'Comprehensive assessment of established customer with mature service delivery across most areas. Focus on optimization and expansion opportunities.',
        emerging: 'Growing customer engagement with mixed service adoption. Significant opportunities for expansion and capability enhancement.',
        greenfield: 'New customer engagement with foundational services in planning phase. High potential for comprehensive service portfolio development.',
        mixed: 'Balanced assessment showing varied service maturity levels. Mix of fully delivered capabilities and growth opportunities.'
    };
    return descriptions[scenario] || descriptions.mixed;
}

/**
 * Get demo comments based on scenario
 */
function getDemoComments(scenario) {
    const comments = {
        mature: 'Customer demonstrates strong adoption of core services. Recommend focus on advanced capabilities and optimization initiatives.',
        emerging: 'Customer showing positive momentum. Priority should be on closing critical gaps and building foundational capabilities.',
        greenfield: 'Early-stage engagement with significant greenfield opportunities. Recommend phased approach starting with high-priority services.',
        mixed: 'Customer exhibits varied maturity across service areas. Tailored approach needed for each L1 category.'
    };
    return comments[scenario] || comments.mixed;
}

/**
 * Utility: Shuffle array (Fisher-Yates)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ═══════════════════════════════════════════════════════════════════
// UI INTEGRATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate demo heatmap for current customer (UI action)
 */
async function generateDemoHeatmapForCustomer(customerId) {
    const customer = engagementManager.getEntity('customers', customerId);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    // Check if heatmap already exists
    const existingHeatmap = engagementManager.getEntities('whiteSpotHeatmaps')
        .find(h => h.customerId === customerId);
    
    if (existingHeatmap) {
        if (!confirm(`A heatmap already exists for ${customer.name}. Replace with demo data?`)) {
            return;
        }
        engagementManager.deleteEntity('whiteSpotHeatmaps', existingHeatmap.id);
    }
    
    // Show scenario selection modal
    showScenarioSelectionModal(customer);
}

/**
 * Show scenario selection modal
 */
function showScenarioSelectionModal(customer) {
    const modalContent = `
        <div style="padding: 20px; max-width: 600px;">
            <h3 style="margin: 0 0 16px 0;">Generate Demo Heatmap</h3>
            <p style="color: #6b7280; margin-bottom: 24px;">
                Select a scenario to generate realistic demo data for <strong>${customer.name}</strong>:
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <label class="demo-scenario-option" onclick="executeGenerateDemoHeatmap('${customer.id}', 'mature')">
                    <input type="radio" name="scenario" value="mature">
                    <div>
                        <strong>Mature Customer</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                            70% FULL, 20% PARTIAL - Established engagement with optimization opportunities
                        </p>
                    </div>
                </label>
                
                <label class="demo-scenario-option" onclick="executeGenerateDemoHeatmap('${customer.id}', 'emerging')">
                    <input type="radio" name="scenario" value="emerging">
                    <div>
                        <strong>Emerging Customer</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                            20% FULL, 50% PARTIAL/POTENTIAL - Growing engagement with expansion opportunities
                        </p>
                    </div>
                </label>
                
                <label class="demo-scenario-option" onclick="executeGenerateDemoHeatmap('${customer.id}', 'greenfield')">
                    <input type="radio" name="scenario" value="greenfield">
                    <div>
                        <strong>Greenfield Customer</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                            10% FULL, 50% POTENTIAL - New engagement with high growth potential
                        </p>
                    </div>
                </label>
                
                <label class="demo-scenario-option" onclick="executeGenerateDemoHeatmap('${customer.id}', 'mixed')">
                    <input type="radio" name="scenario" value="mixed" checked>
                    <div>
                        <strong>Mixed Portfolio</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                            Balanced distribution - Realistic mix across all assessment states
                        </p>
                    </div>
                </label>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-ghost" onclick="closeModal()">
                    Cancel
                </button>
            </div>
        </div>
        
        <style>
            .demo-scenario-option {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .demo-scenario-option:hover {
                border-color: #10b981;
                background: #f0fdf4;
            }
            .demo-scenario-option input[type="radio"] {
                margin-top: 2px;
            }
        </style>
    `;
    
    showModal(modalContent, 'medium');
}

/**
 * Execute demo heatmap generation
 */
async function executeGenerateDemoHeatmap(customerId, scenario) {
    closeModal();
    
    const customer = engagementManager.getEntity('customers', customerId);
    if (!customer) return;
    
    showNotification('Generating demo heatmap...', 'info');
    
    try {
        const heatmap = await generateDemoHeatmap(customer, scenario);
        engagementManager.addEntity('whiteSpotHeatmaps', heatmap);
        
        showNotification(`Demo heatmap created for ${customer.name} (${scenario} scenario)`, 'success');
        renderWhiteSpotHeatmap();
    } catch (error) {
        console.error('Demo generation failed:', error);
        showNotification(`Failed to generate demo: ${error.message}`, 'error');
    }
}

/**
 * Generate demo data for all customers
 */
async function generateDemoForAllCustomers() {
    const customers = engagementManager.getEntities('customers');
    
    if (!customers || customers.length === 0) {
        showNotification('No customers found. Please add customers first.', 'warning');
        return;
    }
    
    const scenarios = ['mature', 'emerging', 'greenfield', 'mixed'];
    let count = 0;
    
    showNotification('Generating demo heatmaps for all customers...', 'info');
    
    for (const customer of customers) {
        // Skip if heatmap already exists
        const existing = engagementManager.getEntities('whiteSpotHeatmaps')
            .find(h => h.customerId === customer.id);
        if (existing) continue;
        
        // Rotate through scenarios
        const scenario = scenarios[count % scenarios.length];
        
        try {
            const heatmap = await generateDemoHeatmap(customer, scenario);
            engagementManager.addEntity('whiteSpotHeatmaps', heatmap);
            count++;
        } catch (error) {
            console.error(`Failed to generate demo for ${customer.name}:`, error);
        }
    }
    
    showNotification(`Generated ${count} demo heatmap(s)`, 'success');
    renderWhiteSpotHeatmap();
}

/**
 * Generate WhiteSpot demo data for standalone mode
 * Creates demo customers and heatmaps compatible with standalone manager
 */
async function generateWhiteSpotDemoData() {
    // Check if we're in standalone mode
    const isStandalone = typeof window.whitespotStandaloneManager !== 'undefined';
    const manager = isStandalone ? window.whitespotStandaloneManager : window.engagementManager;
    
    if (!manager) {
        showNotification('No data manager available', 'error');
        return;
    }
    
    try {
        // Demo customers for standalone mode
        const demoCustomers = [
            {
                id: 'demo-cust-001',
                name: 'Global Bank International',
                industry: 'Financial Services',
                segment: 'Enterprise',
                region: 'EMEA',
                description: 'Leading retail and commercial bank with digital transformation initiative',
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo-cust-002',
                name: 'TechCorp Solutions',
                industry: 'Technology',
                segment: 'Mid-Market',
                region: 'North America',
                description: 'Software development company seeking managed services',
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo-cust-003',
                name: 'HealthFirst Medical Group',
                industry: 'Healthcare',
                segment: 'Enterprise',
                region: 'North America',
                description: 'Healthcare provider modernizing IT infrastructure',
                createdAt: new Date().toISOString()
            }
        ];
        
        const scenarios = ['mature', 'emerging', 'mixed'];
        let customersAdded = 0;
        let heatmapsGenerated = 0;
        
        // Add demo customers and generate heatmaps
        for (let i = 0; i < demoCustomers.length; i++) {
            const customer = demoCustomers[i];
            
            // Get existing customers using appropriate method
            const existingCustomers = manager.getCustomers ? manager.getCustomers() : (manager.getEntities('customers') || []);
            const existingCustomer = existingCustomers.find(c => c.id === customer.id);
            if (!existingCustomer) {
                if (isStandalone) {
                    manager.addCustomer(customer);
                } else {
                    manager.addEntity('customers', customer);
                }
                customersAdded++;
            }
            
            // Get existing heatmaps using appropriate method
            const existingHeatmaps = manager.getHeatmaps ? manager.getHeatmaps() : (manager.getEntities('whiteSpotHeatmaps') || []);
            const existingHeatmap = existingHeatmaps.find(h => h.customerId === customer.id);
            if (!existingHeatmap) {
                const customerObj = existingCustomer || customer;
                const scenario = scenarios[i % scenarios.length];
                const heatmap = await generateDemoHeatmap(customerObj, scenario, manager);
                
                if (isStandalone) {
                    manager.addHeatmap(heatmap);
                } else {
                    manager.addEntity('whiteSpotHeatmaps', heatmap);
                }
                heatmapsGenerated++;
            }
        }
        
        showNotification(
            `Demo loaded: ${customersAdded} customer(s), ${heatmapsGenerated} heatmap(s)`, 
            'success'
        );
        
        // Refresh the UI
        if (typeof renderWhiteSpotHeatmap === 'function') {
            renderWhiteSpotHeatmap();
        }
        
    } catch (error) {
        console.error('Failed to generate demo data:', error);
        showNotification(`Demo generation failed: ${error.message}`, 'error');
    }
}

/**
 * Wrapper function for loading demo data - works in both standalone and integrated modes
 * Can be called from UI buttons in either context
 */
async function loadWhiteSpotDemoData() {
    await generateWhiteSpotDemoData();
}
