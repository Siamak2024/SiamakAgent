/**
 * EA Output Generator - Template Engine
 * Processes Markdown templates with engagement data to generate outputs
 * @version 2.0 - Phase 2
 * @date 2026-04-18
 */

class EA_OutputGenerator {
    constructor(engagementData) {
        this.data = engagementData;
        this.templates = {};
        this.helpers = this.initializeHelpers();
    }

    /**
     * Initialize template helper functions
     */
    initializeHelpers() {
        return {
            // Format date
            formatDate: (date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            },

            // Join array with separator
            join: (arr, separator = ', ') => {
                if (!Array.isArray(arr)) return arr || '';
                return arr.join(separator);
            },

            // Count items in array
            count: (arr) => {
                if (!Array.isArray(arr)) return 0;
                return arr.length;
            },

            // Sum numeric values
            sum: (arr, field) => {
                if (!Array.isArray(arr)) return 0;
                return arr.reduce((sum, item) => {
                    const value = field ? item[field] : item;
                    return sum + (parseFloat(value) || 0);
                }, 0);
            },

            // Format currency
            formatCurrency: (value) => {
                if (!value) return '€0';
                return '€' + parseFloat(value).toLocaleString('en-US');
            },

            // Calculate percentage
            percent: (part, total) => {
                if (!total) return '0';
                return ((part / total) * 100).toFixed(1);
            },

            // Get first item
            first: (arr) => {
                if (!Array.isArray(arr) || arr.length === 0) return null;
                return arr[0];
            },

            // Filter array
            filter: (arr, predicate) => {
                if (!Array.isArray(arr)) return [];
                return arr.filter(predicate);
            }
        };
    }

    /**
     * Load template from file or inline
     */
    async loadTemplate(templateName) {
        if (this.templates[templateName]) {
            return this.templates[templateName];
        }

        try {
            const response = await fetch(`engagement_templates/${templateName}.md.template`);
            if (!response.ok) throw new Error(`Template ${templateName} not found`);
            
            const content = await response.text();
            this.templates[templateName] = content;
            return content;
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }

    /**
     * Process template with data
     */
    processTemplate(template, data = null) {
        const context = data || this.prepareContext();
        let output = template;

        // Process {{#each}} loops
        output = this.processLoops(output, context);

        // Process simple variable interpolation {{variable}}
        output = this.processVariables(output, context);

        // Process helper functions
        output = this.processHelpers(output, context);

        return output;
    }

    /**
     * Process {{#each}} loops in template
     */
    processLoops(template, context) {
        const eachRegex = /\{\{#each\s+([a-zA-Z0-9_.]+)(?:\s+where\s+([^}]+))?\s*(?:limit\s+(\d+))?\}\}([\s\S]*?)\{\{\/each\}\}/g;
        
        return template.replace(eachRegex, (match, collectionPath, whereClause, limit, loopContent) => {
            let collection = this.getNestedValue(context, collectionPath);
            
            if (!Array.isArray(collection)) {
                return ''; // Empty if not array
            }

            // Apply where filter
            if (whereClause) {
                collection = this.applyWhereClause(collection, whereClause);
            }

            // Apply limit
            if (limit) {
                collection = collection.slice(0, parseInt(limit));
            }

            // Process each item
            return collection.map((item, index) => {
                const itemContext = {
                    ...context,
                    ...item,
                    index: index + 1,
                    isFirst: index === 0,
                    isLast: index === collection.length - 1
                };
                
                // Recursively process nested loops and variables
                let processedContent = loopContent;
                processedContent = this.processVariables(processedContent, itemContext);
                processedContent = this.processLoops(processedContent, itemContext);
                
                return processedContent;
            }).join('');
        });
    }

    /**
     * Apply where clause to filter collection
     */
    applyWhereClause(collection, whereClause) {
        // Parse simple where clauses like: status="approved", type in ["a","b"], value > 5
        const patterns = [
            // Equality: field="value" or field='value'
            { regex: /(\w+)\s*=\s*["']([^"']+)["']/, test: (item, field, value) => item[field] === value },
            // Inequality: field!="value"
            { regex: /(\w+)\s*!=\s*["']([^"']+)["']/, test: (item, field, value) => item[field] !== value },
            // Contains: field contains "value"
            { regex: /(\w+)\s+contains\s+["']([^"']+)["']/, test: (item, field, value) => {
                const itemValue = item[field];
                if (Array.isArray(itemValue)) return itemValue.includes(value);
                if (typeof itemValue === 'string') return itemValue.includes(value);
                return false;
            }},
            // In array: field in ["a","b"]
            { regex: /(\w+)\s+in\s+\[([^\]]+)\]/, test: (item, field, values) => {
                const valueArray = values.split(',').map(v => v.trim().replace(/['"]/g, ''));
                return valueArray.includes(item[field]);
            }}
        ];

        for (const pattern of patterns) {
            const match = whereClause.match(pattern.regex);
            if (match) {
                const field = match[1];
                const value = match[2];
                return collection.filter(item => pattern.test(item, field, value));
            }
        }

        return collection;
    }

    /**
     * Process simple {{variable}} interpolation
     */
    processVariables(template, context) {
        const varRegex = /\{\{([a-zA-Z0-9_.]+)\}\}/g;
        
        return template.replace(varRegex, (match, path) => {
            const value = this.getNestedValue(context, path);
            
            if (value === null || value === undefined) {
                return ''; // Empty string for missing values
            }
            
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            
            return String(value);
        });
    }

    /**
     * Process helper functions like {{join array}}
     */
    processHelpers(template, context) {
        const helperRegex = /\{\{([a-zA-Z0-9_]+)\s+([^}]+)\}\}/g;
        
        return template.replace(helperRegex, (match, helperName, args) => {
            if (this.helpers[helperName]) {
                // Parse arguments
                const argParts = args.split(/\s+/);
                const values = argParts.map(arg => {
                    // Check if it's a path to data
                    if (arg.match(/^[a-zA-Z0-9_.]+$/)) {
                        return this.getNestedValue(context, arg);
                    }
                    // Otherwise it's a literal
                    return arg.replace(/['"]/g, '');
                });
                
                return this.helpers[helperName](...values);
            }
            return match; // Leave unchanged if helper not found
        });
    }

    /**
     * Get nested value from object using dot notation
     */
    getNestedValue(obj, path) {
        if (!path) return obj;
        
        const parts = path.split('.');
        let value = obj;
        
        for (const part of parts) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[part];
        }
        
        return value;
    }

    /**
     * Prepare context data from engagement
     */
    prepareContext() {
        const engagement = this.data.engagement || {};
        const stakeholders = this.data.stakeholders || [];
        const applications = this.data.applications || [];
        const capabilities = this.data.capabilities || [];
        const initiatives = this.data.initiatives || [];
        const risks = this.data.risks || [];
        const decisions = this.data.decisions || [];
        const constraints = this.data.constraints || [];
        const assumptions = this.data.assumptions || [];
        const architectureViews = this.data.architectureViews || [];

        // Calculate metrics
        const sunsetCount = applications.filter(a => a.sunsetCandidate).length;
        const modernizeCount = applications.filter(a => a.modernizationCandidate).length;
        const investCount = applications.filter(a => a.lifecycle === 'invest').length;
        const retireCount = applications.filter(a => a.lifecycle === 'retire').length;
        const tolerateCount = applications.filter(a => a.lifecycle === 'tolerate').length;
        const migrateCount = applications.filter(a => a.lifecycle === 'migrate').length;

        const gapCount = capabilities.filter(c => (c.gap || 0) > 0).length;
        const criticalGaps = capabilities.filter(c => (c.gap || 0) >= 2);
        const moderateGaps = capabilities.filter(c => (c.gap || 0) === 1);

        const shortTermCount = initiatives.filter(i => i.timeHorizon === 'short').length;
        const midTermCount = initiatives.filter(i => i.timeHorizon === 'mid').length;
        const longTermCount = initiatives.filter(i => i.timeHorizon === 'long').length;

        const openRisks = risks.filter(r => r.status === 'open').length;
        const highSeverityRisks = risks.filter(r => (r.severity || 0) >= 6);
        const criticalRiskCount = risks.filter(r => (r.severity || 0) >= 7).length;

        const openDecisions = decisions.filter(d => d.status === 'proposed' || d.status === 'under-review').length;
        const approvedDecisions = decisions.filter(d => d.status === 'approved').length;

        const activeAssumptions = assumptions.filter(a => a.status === 'active').length;
        const validatedAssumptions = assumptions.filter(a => a.status === 'validated').length;

        const criticalConstraints = constraints.filter(c => c.severity === 'critical').length;

        const totalAnnualCost = this.helpers.sum(applications, 'annualCost');
        const totalInvestment = this.helpers.sum(initiatives, 'estimatedCost');

        return {
            // Engagement
            engagement,
            customerName: engagement.customerName || engagement.customers?.[0] || 'N/A',

            // Collections
            stakeholders,
            applications,
            capabilities,
            initiatives,
            risks,
            decisions,
            constraints,
            assumptions,
            architectureViews,

            // Calculated metrics
            sunsetCount,
            modernizeCount,
            investCount,
            retireCount,
            tolerateCount,
            migrateCount,
            gapCount,
            criticalGaps,
            moderateGaps,
            shortTermCount,
            midTermCount,
            longTermCount,
            openRisks,
            highSeverityRisks,
            criticalRiskCount,
            openDecisions,
            approvedDecisions,
            activeAssumptions,
            validatedAssumptions,
            criticalConstraints,
            totalAnnualCost: this.helpers.formatCurrency(totalAnnualCost),
            totalInvestment: this.helpers.formatCurrency(totalInvestment),

            // Special computed values
            topInitiatives: initiatives.filter(i => i.status === 'approved' || i.status === 'in-progress').slice(0, 3).map((init, idx) => ({
                ...init,
                index: idx + 1,
                firstBusinessOutcome: init.businessOutcomes?.[0] || 'N/A'
            })),

            sunsetCandidates: applications.filter(a => a.sunsetCandidate),
            modernizationCandidates: applications.filter(a => a.modernizationCandidate),

            accountableStakeholders: stakeholders.filter(s => s.decisionPower === 'high'),
            highInfluence: stakeholders.filter(s => s.influence === 'high').length,
            highDecisionPower: stakeholders.filter(s => s.decisionPower === 'high').length,

            // Generated metadata
            generated: {
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                timestamp: new Date().toISOString()
            },

            // Helper for percentages
            gapPercentage: this.helpers.percent(gapCount, capabilities.length),
            retirePercent: this.helpers.percent(retireCount, applications.length),
            toleratePercent: this.helpers.percent(tolerateCount, applications.length),
            investPercent: this.helpers.percent(investCount, applications.length),
            migratePercent: this.helpers.percent(migrateCount, applications.length)
        };
    }

    /**
     * Generate output from template name
     */
    async generate(templateName) {
        try {
            const template = await this.loadTemplate(templateName);
            const output = this.processTemplate(template);
            return output;
        } catch (error) {
            console.error('Error generating output:', error);
            throw error;
        }
    }

    /**
     * Generate multiple outputs
     */
    async generateAll(templateNames) {
        const outputs = {};
        
        for (const name of templateNames) {
            try {
                outputs[name] = await this.generate(name);
            } catch (error) {
                console.error(`Error generating ${name}:`, error);
                outputs[name] = `Error: ${error.message}`;
            }
        }
        
        return outputs;
    }

    /**
     * Export output as downloadable file
     */
    downloadOutput(content, filename, format = 'md') {
        const mimeTypes = {
            md: 'text/markdown',
            html: 'text/html',
            txt: 'text/plain',
            json: 'application/json'
        };

        const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Convert Markdown to HTML
     */
    markdownToHTML(markdown) {
        // Simple Markdown to HTML conversion
        let html = markdown;

        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Lists
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Tables (basic)
        html = html.replace(/\|(.+)\|/g, '<tr>$1</tr>');
        html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

        // Wrap in paragraph tags
        html = '<p>' + html + '</p>';

        return html;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EA_OutputGenerator;
}
