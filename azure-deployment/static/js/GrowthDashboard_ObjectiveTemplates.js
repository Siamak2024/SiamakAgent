/**
 * GrowthDashboard_ObjectiveTemplates.js
 * 
 * Manages objective templates for Growth Sprint Dashboard
 * - Pre-defined industry templates
 * - Custom templates per account
 * - Template application and management
 * 
 * Storage: localStorage with key format:
 * - gsd_custom_templates_{accountId}: Custom templates created by user
 */

class GrowthDashboard_ObjectiveTemplates {
    constructor() {
        this.storagePrefix = 'gsd_custom_templates_';
        this.industryTemplates = this._getIndustryTemplates();
    }

    /**
     * Get all templates for an industry (pre-defined + custom)
     * @param {string} industry - Industry name
     * @param {string} accountId - Account ID for custom templates
     * @returns {Array} Array of template objects
     */
    getTemplatesByIndustry(industry, accountId) {
        const industryTemplates = this.industryTemplates[industry] || [];
        const customTemplates = this.getCustomTemplates(accountId, industry);
        
        return [
            ...industryTemplates.map(t => ({ ...t, isCustom: false })),
            ...customTemplates.map(t => ({ ...t, isCustom: true }))
        ];
    }

    /**
     * Get custom templates for an account
     * @param {string} accountId - Account ID
     * @param {string} filterIndustry - Optional industry filter
     * @returns {Array} Array of custom templates
     */
    getCustomTemplates(accountId, filterIndustry = null) {
        const key = this.storagePrefix + accountId;
        const stored = localStorage.getItem(key);
        
        if (!stored) return [];
        
        try {
            const templates = JSON.parse(stored);
            if (filterIndustry) {
                return templates.filter(t => t.industry === filterIndustry);
            }
            return templates;
        } catch (error) {
            console.error('Error parsing custom templates:', error);
            return [];
        }
    }

    /**
     * Save custom template
     * @param {string} accountId - Account ID
     * @param {Object} template - Template object
     * @returns {Object} Saved template with ID
     */
    saveCustomTemplate(accountId, template) {
        const key = this.storagePrefix + accountId;
        const templates = this.getCustomTemplates(accountId);
        
        const newTemplate = {
            id: `tmpl-${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...template,
            createdAt: Date.now(),
            createdBy: accountId
        };
        
        templates.push(newTemplate);
        localStorage.setItem(key, JSON.stringify(templates));
        
        return newTemplate;
    }

    /**
     * Delete custom template
     * @param {string} accountId - Account ID
     * @param {string} templateId - Template ID
     * @returns {boolean} Success status
     */
    deleteCustomTemplate(accountId, templateId) {
        const key = this.storagePrefix + accountId;
        const templates = this.getCustomTemplates(accountId);
        const filtered = templates.filter(t => t.id !== templateId);
        
        if (filtered.length === templates.length) {
            return false; // Template not found
        }
        
        localStorage.setItem(key, JSON.stringify(filtered));
        return true;
    }

    /**
     * Create template from existing objective
     * @param {Object} objective - Source objective
     * @returns {Object} Template object (without id, timestamps)
     */
    createTemplateFromObjective(objective) {
        return {
            name: objective.name,
            description: objective.description,
            priority: objective.priority,
            strategicTheme: objective.strategicTheme,
            outcomeStatement: objective.outcomeStatement,
            linkedCapabilities: objective.linkedCapabilities || [],
            industry: objective.industry || 'All'
        };
    }

    /**
     * Apply template to create new objective data
     * @param {Object} template - Template object
     * @param {string} accountId - Target account ID
     * @param {string} industry - Account industry
     * @returns {Object} Objective data ready for creation
     */
    applyTemplate(template, accountId, industry) {
        return {
            name: template.name,
            description: template.description,
            priority: template.priority || 'medium',
            strategicTheme: template.strategicTheme || '',
            outcomeStatement: template.outcomeStatement || '',
            linkedCapabilities: template.linkedCapabilities || [],
            industry: industry,
            createdBy: 'template'
        };
    }

    /**
     * Get pre-defined industry templates
     * @private
     * @returns {Object} Templates organized by industry
     */
    _getIndustryTemplates() {
        return {
            'Manufacturing': [
                {
                    id: 'mfg-001',
                    name: 'Optimize Production Efficiency',
                    description: 'Reduce production cycle time and increase throughput while maintaining quality standards',
                    priority: 'high',
                    strategicTheme: 'Operational Excellence',
                    outcomeStatement: 'Achieve 15% reduction in production cycle time within 12 months',
                    linkedCapabilities: ['1.1', '1.2', '9.1'] // Operations, Supply Chain, Quality
                },
                {
                    id: 'mfg-002',
                    name: 'Digital Manufacturing Transformation',
                    description: 'Implement IoT sensors and real-time monitoring across production lines',
                    priority: 'high',
                    strategicTheme: 'Digital Transformation',
                    outcomeStatement: 'Deploy IoT infrastructure across 80% of manufacturing facilities',
                    linkedCapabilities: ['1.1', '11.1', '11.2'] // Operations, IT Management
                },
                {
                    id: 'mfg-003',
                    name: 'Supply Chain Resilience',
                    description: 'Build flexible and resilient supply chain with multiple suppliers',
                    priority: 'high',
                    strategicTheme: 'Risk Management',
                    outcomeStatement: 'Reduce supply chain disruption impact by 40%',
                    linkedCapabilities: ['1.2', '1.3'] // Supply Chain, Logistics
                },
                {
                    id: 'mfg-004',
                    name: 'Sustainability & Green Manufacturing',
                    description: 'Reduce carbon footprint and waste in manufacturing processes',
                    priority: 'medium',
                    strategicTheme: 'Sustainability',
                    outcomeStatement: 'Achieve 25% reduction in manufacturing waste and 30% energy efficiency improvement',
                    linkedCapabilities: ['1.1', '9.1', '12.1'] // Operations, Quality, Environment
                }
            ],
            'Services': [
                {
                    id: 'svc-001',
                    name: 'Enhance Customer Experience',
                    description: 'Improve customer satisfaction through personalized service delivery',
                    priority: 'high',
                    strategicTheme: 'Customer Centricity',
                    outcomeStatement: 'Increase Net Promoter Score (NPS) from 45 to 65',
                    linkedCapabilities: ['2.1', '2.2', '3.1'] // Customer Service, Marketing
                },
                {
                    id: 'svc-002',
                    name: 'Service Delivery Automation',
                    description: 'Automate routine service processes to improve efficiency',
                    priority: 'high',
                    strategicTheme: 'Operational Excellence',
                    outcomeStatement: 'Automate 60% of routine service requests within 18 months',
                    linkedCapabilities: ['2.1', '11.1'] // Customer Service, IT
                },
                {
                    id: 'svc-003',
                    name: 'Talent Development Program',
                    description: 'Build world-class service delivery team through training',
                    priority: 'medium',
                    strategicTheme: 'People Development',
                    outcomeStatement: 'Achieve 90% employee certification rate in service excellence',
                    linkedCapabilities: ['6.1', '6.2'] // Human Resources
                }
            ],
            'Retail': [
                {
                    id: 'rtl-001',
                    name: 'Omnichannel Customer Experience',
                    description: 'Seamless integration of online and offline shopping experiences',
                    priority: 'high',
                    strategicTheme: 'Digital Transformation',
                    outcomeStatement: 'Achieve 40% of sales through omnichannel within 24 months',
                    linkedCapabilities: ['2.1', '3.1', '11.1'] // Customer Service, Marketing, IT
                },
                {
                    id: 'rtl-002',
                    name: 'Inventory Optimization',
                    description: 'Reduce stockouts and overstock through predictive analytics',
                    priority: 'high',
                    strategicTheme: 'Operational Excellence',
                    outcomeStatement: 'Reduce inventory carrying costs by 20% while maintaining 95% in-stock rate',
                    linkedCapabilities: ['1.2', '1.3'] // Supply Chain
                },
                {
                    id: 'rtl-003',
                    name: 'Personalized Marketing',
                    description: 'Leverage customer data for targeted marketing campaigns',
                    priority: 'medium',
                    strategicTheme: 'Customer Centricity',
                    outcomeStatement: 'Increase marketing ROI by 35% through personalization',
                    linkedCapabilities: ['3.1', '3.2', '11.3'] // Marketing, Analytics
                }
            ],
            'Financial Services': [
                {
                    id: 'fin-001',
                    name: 'Digital Banking Platform',
                    description: 'Launch mobile-first digital banking platform',
                    priority: 'high',
                    strategicTheme: 'Digital Transformation',
                    outcomeStatement: 'Migrate 60% of transactions to digital channels within 18 months',
                    linkedCapabilities: ['2.1', '11.1', '11.4'] // Customer Service, IT, Security
                },
                {
                    id: 'fin-002',
                    name: 'Risk Management Enhancement',
                    description: 'Improve credit risk assessment and fraud detection',
                    priority: 'high',
                    strategicTheme: 'Risk Management',
                    outcomeStatement: 'Reduce fraud losses by 40% and improve credit decision accuracy by 25%',
                    linkedCapabilities: ['8.1', '11.3', '11.4'] // Risk, Analytics, Security
                },
                {
                    id: 'fin-003',
                    name: 'Regulatory Compliance Automation',
                    description: 'Automate regulatory reporting and compliance monitoring',
                    priority: 'high',
                    strategicTheme: 'Compliance',
                    outcomeStatement: 'Achieve 100% on-time regulatory reporting with 50% effort reduction',
                    linkedCapabilities: ['8.1', '8.2', '11.1'] // Risk, Compliance, IT
                }
            ],
            'Insurance': [
                {
                    id: 'ins-001',
                    name: 'Claims Processing Acceleration',
                    description: 'Streamline claims processing through automation and AI',
                    priority: 'high',
                    strategicTheme: 'Operational Excellence',
                    outcomeStatement: 'Reduce average claim processing time from 14 days to 3 days',
                    linkedCapabilities: ['2.1', '11.1', '11.3'] // Customer Service, IT, Analytics
                },
                {
                    id: 'ins-002',
                    name: 'Risk Assessment Modernization',
                    description: 'Implement advanced analytics for underwriting and pricing',
                    priority: 'high',
                    strategicTheme: 'Digital Transformation',
                    outcomeStatement: 'Improve underwriting accuracy by 30% and reduce loss ratio by 15%',
                    linkedCapabilities: ['8.1', '11.3'] // Risk, Analytics
                },
                {
                    id: 'ins-003',
                    name: 'Customer Self-Service Portal',
                    description: 'Enable customers to manage policies and claims online',
                    priority: 'medium',
                    strategicTheme: 'Customer Centricity',
                    outcomeStatement: 'Achieve 70% customer adoption of self-service portal',
                    linkedCapabilities: ['2.1', '11.1'] // Customer Service, IT
                }
            ],
            'Healthcare': [
                {
                    id: 'hlt-001',
                    name: 'Patient Experience Enhancement',
                    description: 'Improve patient satisfaction through digital health services',
                    priority: 'high',
                    strategicTheme: 'Patient Centricity',
                    outcomeStatement: 'Increase patient satisfaction score from 72% to 88%',
                    linkedCapabilities: ['2.1', '11.1'] // Patient Services, IT
                },
                {
                    id: 'hlt-002',
                    name: 'Clinical Outcome Improvement',
                    description: 'Implement evidence-based protocols to improve outcomes',
                    priority: 'high',
                    strategicTheme: 'Quality of Care',
                    outcomeStatement: 'Reduce readmission rates by 25% and improve clinical quality scores',
                    linkedCapabilities: ['1.1', '9.1'] // Operations, Quality
                },
                {
                    id: 'hlt-003',
                    name: 'Healthcare Analytics Platform',
                    description: 'Build data-driven decision making through analytics',
                    priority: 'medium',
                    strategicTheme: 'Digital Transformation',
                    outcomeStatement: 'Deploy analytics platform covering 100% of clinical operations',
                    linkedCapabilities: ['11.1', '11.3'] // IT, Analytics
                }
            ],
            'Technology': [
                {
                    id: 'tech-001',
                    name: 'Product Innovation Acceleration',
                    description: 'Reduce time-to-market for new product features',
                    priority: 'high',
                    strategicTheme: 'Innovation',
                    outcomeStatement: 'Reduce product release cycle from 6 months to 2 months',
                    linkedCapabilities: ['4.1', '11.1'] // Product Development, IT
                },
                {
                    id: 'tech-002',
                    name: 'Cloud-Native Transformation',
                    description: 'Migrate legacy systems to cloud-native architecture',
                    priority: 'high',
                    strategicTheme: 'Technology Modernization',
                    outcomeStatement: 'Migrate 80% of applications to cloud within 24 months',
                    linkedCapabilities: ['11.1', '11.2'] // IT Management
                },
                {
                    id: 'tech-003',
                    name: 'Customer Success Program',
                    description: 'Build proactive customer success function to reduce churn',
                    priority: 'high',
                    strategicTheme: 'Customer Retention',
                    outcomeStatement: 'Reduce customer churn from 15% to 8% annually',
                    linkedCapabilities: ['2.1', '2.2', '3.1'] // Customer Service, Marketing
                },
                {
                    id: 'tech-004',
                    name: 'Engineering Productivity',
                    description: 'Improve developer experience and productivity',
                    priority: 'medium',
                    strategicTheme: 'Operational Excellence',
                    outcomeStatement: 'Increase developer productivity by 40% through tooling and automation',
                    linkedCapabilities: ['6.1', '11.1'] // HR, IT
                }
            ],
            'All': [
                {
                    id: 'all-001',
                    name: 'Revenue Growth',
                    description: 'Increase revenue through market expansion and customer acquisition',
                    priority: 'high',
                    strategicTheme: 'Growth',
                    outcomeStatement: 'Achieve 25% year-over-year revenue growth',
                    linkedCapabilities: ['3.1', '3.2'] // Marketing, Sales
                },
                {
                    id: 'all-002',
                    name: 'Cost Optimization',
                    description: 'Reduce operational costs through efficiency improvements',
                    priority: 'high',
                    strategicTheme: 'Operational Excellence',
                    outcomeStatement: 'Reduce operating costs by 15% while maintaining service quality',
                    linkedCapabilities: ['7.1', '7.2'] // Finance, Procurement
                },
                {
                    id: 'all-003',
                    name: 'Employee Engagement',
                    description: 'Improve employee satisfaction and retention',
                    priority: 'medium',
                    strategicTheme: 'People & Culture',
                    outcomeStatement: 'Increase employee engagement score to 80% and reduce turnover by 30%',
                    linkedCapabilities: ['6.1', '6.2'] // Human Resources
                }
            ]
        };
    }
}

// Global instance
window.growthDashboardObjectiveTemplates = new GrowthDashboard_ObjectiveTemplates();
