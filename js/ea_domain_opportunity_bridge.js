/**
 * ea_domain_opportunity_bridge.js
 * 
 * Automatic Bridge: Domain Recommendations → Opportunity Pipeline
 * 
 * PURPOSE:
 * Automatically transforms AI-generated domain recommendations from Strategic Insights 
 * into actionable opportunities in the Customer EA Opportunity Pipeline.
 * 
 * WORKFLOW:
 * 1. AI generates Strategic Insights with domainRecommendations[] in EA_Engagement_Playbook
 * 2. Insights saved to localStorage: ea_three_lens_insights_business_{engagementId}
 * 3. Bridge monitors for new/updated recommendations
 * 4. Transforms recommendations into opportunities with proper data model
 * 5. Creates opportunities in Backlog → automatically moves to Discovery stage
 * 6. Prevents duplicates via linkedOpportunityId tracking in recommendation metadata
 * 
 * DATA FLOW:
 * Domain Recommendation → Transformation → Opportunity Creation → Update Metadata
 * 
 * @version 1.0.0
 * @date 2026-05-20
 * @author NextGenEA V11 Team
 */

class EA_DomainOpportunityBridge {
    constructor() {
        this.accountManager = null;
        this.initialized = false;
        
        console.log('[Domain→Opportunity Bridge] 🌉 Bridge initialized');
    }

    /**
     * Initialize bridge with dependencies
     * @param {EA_AccountManager} accountManager - Account manager instance
     */
    init(accountManager) {
        if (!accountManager) {
            console.error('[Domain→Opportunity Bridge] ❌ AccountManager not provided');
            return false;
        }

        this.accountManager = accountManager;
        this.initialized = true;
        
        console.log('[Domain→Opportunity Bridge] ✅ Bridge ready');
        return true;
    }

    /**
     * Extract domain recommendations from Strategic Insights
     * @param {string} engagementId - Engagement ID
     * @returns {Array} Domain recommendations array
     */
    extractDomainRecommendations(engagementId) {
        if (!engagementId) {
            console.warn('[Domain→Opportunity Bridge] No engagement ID provided');
            return [];
        }

        const storageKey = `ea_three_lens_insights_business_${engagementId}`;
        const savedData = localStorage.getItem(storageKey);

        if (!savedData) {
            console.log('[Domain→Opportunity Bridge] No strategic insights found for:', engagementId);
            return [];
        }

        try {
            const insights = JSON.parse(savedData);
            const recommendations = insights.domainRecommendations || [];
            
            console.log(`[Domain→Opportunity Bridge] 📊 Found ${recommendations.length} domain recommendations`);
            return recommendations;

        } catch (error) {
            console.error('[Domain→Opportunity Bridge] Error parsing insights:', error);
            return [];
        }
    }

    /**
     * Debug helper: Find engagement data in localStorage
     * @param {string} engagementId - Engagement ID to search for
     * @returns {Object} Debug info about storage location
     */
    debugFindEngagement(engagementId) {
        console.log(`[Domain→Opportunity Bridge DEBUG] Searching for engagement: ${engagementId}`);
        
        const results = {
            engagementId,
            found: false,
            keys: [],
            accountId: null,
            storageKey: null,
            data: null
        };

        // Scan all localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(engagementId)) {
                results.keys.push(key);
                
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const accountId = data.accountId || 
                                     data.engagement?.accountId || 
                                     data.account?.id ||
                                     data.metadata?.accountId;
                    
                    if (accountId) {
                        results.found = true;
                        results.accountId = accountId;
                        results.storageKey = key;
                        results.data = data;
                        console.log(`[Domain→Opportunity Bridge DEBUG] ✅ Found accountId: ${accountId} in key: ${key}`);
                    } else {
                        console.log(`[Domain→Opportunity Bridge DEBUG] ⚠️  Key ${key} contains engagement but no accountId`);
                    }
                } catch (e) {
                    console.log(`[Domain→Opportunity Bridge DEBUG] ⚠️  Key ${key} is not valid JSON`);
                }
            }
        }

        if (!results.found) {
            console.log(`[Domain→Opportunity Bridge DEBUG] ❌ No accountId found for engagement: ${engagementId}`);
            console.log(`[Domain→Opportunity Bridge DEBUG] Keys containing engagement ID:`, results.keys);
        }

        return results;
    }

    /**
     * Transform domain recommendation to opportunity structure
     * @param {Object} recommendation - Domain recommendation object
     * @param {string} accountId - Account ID
     * @param {string} engagementId - Engagement ID
     * @returns {Object} Opportunity data object
     */
    transformDomainToOpportunity(recommendation, accountId, engagementId) {
        // Generate opportunity name from domain name
        const opportunityName = this.generateOpportunityName(recommendation.domain);

        // Estimate opportunity value based on domain complexity
        const estimatedValue = this.estimateOpportunityValue(recommendation);

        // Calculate close date (6 months from now)
        const closeDate = new Date();
        closeDate.setMonth(closeDate.getMonth() + 6);
        const closeDateStr = closeDate.toISOString().split('T')[0];

        // Extract linked applications
        const linkedApps = recommendation.linkedApps || [];

        // Build opportunity object with UNIFIED data model
        return {
            accountId: accountId,
            name: opportunityName,
            status: 'discovery',           // AI-generated starts in Discovery (not Backlog)
            stage: '1-discovery',
            sourceType: 'domain-recommendation',
            estimatedValue: estimatedValue,
            probability: 30,                // Lower initial probability for AI-generated
            closeDate: closeDateStr,
            sponsor: 'TBD',                // To be determined by user

            // Phase 1 fields - Auto-populated from AI
            description: recommendation.currentState || '',
            recommendation: recommendation.recommendations?.join(' • ') || '',
            comments: '',

            // Phase 2 fields - Domain context (CRITICAL for AI-generated)
            domainContext: {
                domainName: recommendation.domain,
                currentState: recommendation.currentState,
                targetState: recommendation.futureState || recommendation.targetState,
                linkedApps: linkedApps,
                engagementId: engagementId
            },
            strategicRationale: this.buildStrategicRationale(recommendation),
            aiGenerated: true,
            refinedByUser: false,

            // Relationships
            linkedInitiatives: [],
            linkedEngagements: [engagementId],
            valueCase: null,
            competitors: [],
            nextSteps: [],
            risks: [],

            // Metadata
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system-ai',
                winReason: null,
                lossReason: null
            }
        };
    }

    /**
     * Generate opportunity name from domain name
     * @param {string} domainName - Domain name
     * @returns {string} Opportunity name
     */
    generateOpportunityName(domainName) {
        // Examples:
        // "Core insurance — life & pension" → "Core Insurance Modernization"
        // "Customer Engagement" → "Customer Engagement Transformation"
        // "Claims Processing" → "Claims Processing Enhancement"

        const cleanName = domainName
            .split('—')[0]              // Take first part before em-dash
            .split('–')[0]              // Take first part before en-dash
            .trim();

        const suffixes = ['Modernization', 'Transformation', 'Enhancement', 'Optimization'];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return `${cleanName} ${randomSuffix}`;
    }

    /**
     * Estimate opportunity value based on domain complexity
     * @param {Object} recommendation - Domain recommendation
     * @returns {number} Estimated value in currency
     */
    estimateOpportunityValue(recommendation) {
        // Base value
        let baseValue = 500000; // €500k default

        // Increase based on number of linked apps
        const appCount = recommendation.linkedApps?.length || 0;
        const appMultiplier = 1 + (appCount * 0.15); // +15% per app

        // Increase based on number of recommendations (complexity indicator)
        const recCount = recommendation.recommendations?.length || 0;
        const complexityMultiplier = 1 + (recCount * 0.1); // +10% per recommendation

        const estimatedValue = baseValue * appMultiplier * complexityMultiplier;

        // Round to nearest 50k
        return Math.round(estimatedValue / 50000) * 50000;
    }

    /**
     * Build strategic rationale from recommendation data
     * @param {Object} recommendation - Domain recommendation
     * @returns {string} Strategic rationale text
     */
    buildStrategicRationale(recommendation) {
        const parts = [];

        parts.push(`→ ${recommendation.domain}`);
        
        if (recommendation.currentState) {
            parts.push(`\n\nCurrent State:\n${recommendation.currentState}`);
        }

        if (recommendation.futureState || recommendation.targetState) {
            parts.push(`\n\nTarget State:\n${recommendation.futureState || recommendation.targetState}`);
        }

        if (recommendation.recommendations && recommendation.recommendations.length > 0) {
            parts.push(`\n\nRecommendations:\n${recommendation.recommendations.map(r => `• ${r}`).join('\n')}`);
        }

        if (recommendation.linkedApps && recommendation.linkedApps.length > 0) {
            parts.push(`\n\nLinked Applications: ${recommendation.linkedApps.join(', ')}`);
        }

        return parts.join('');
    }

    /**
     * Check if opportunity already exists for this domain recommendation
     * @param {string} domainName - Domain name
     * @param {string} accountId - Account ID
     * @returns {boolean} True if opportunity exists
     */
    opportunityExists(domainName, accountId) {
        const opportunities = this.accountManager.listOpportunities();
        
        return opportunities.some(opp => 
            opp.accountId === accountId &&
            opp.sourceType === 'domain-recommendation' &&
            opp.domainContext?.domainName === domainName
        );
    }

    /**
     * Sync domain recommendations to opportunities (MAIN ENTRY POINT)
     * @param {string} engagementId - Engagement ID
     * @param {string} accountId - Account ID
     * @returns {Object} Sync results { created: number, skipped: number, errors: Array }
     */
    syncDomainOpportunities(engagementId, accountId) {
        if (!this.initialized) {
            console.error('[Domain→Opportunity Bridge] ❌ Bridge not initialized');
            return { created: 0, skipped: 0, errors: ['Bridge not initialized'] };
        }

        if (!engagementId || !accountId) {
            console.error('[Domain→Opportunity Bridge] ❌ Missing engagementId or accountId');
            return { created: 0, skipped: 0, errors: ['Missing required parameters'] };
        }

        console.log(`[Domain→Opportunity Bridge] 🔄 Syncing domain recommendations for engagement: ${engagementId}`);

        const recommendations = this.extractDomainRecommendations(engagementId);
        
        if (recommendations.length === 0) {
            console.log('[Domain→Opportunity Bridge] No recommendations to sync');
            return { created: 0, skipped: 0, errors: [] };
        }

        const results = {
            created: 0,
            skipped: 0,
            errors: []
        };

        recommendations.forEach((rec, index) => {
            try {
                // Check if opportunity already exists
                if (this.opportunityExists(rec.domain, accountId)) {
                    console.log(`[Domain→Opportunity Bridge] ⏭️  Skipped (exists): ${rec.domain}`);
                    results.skipped++;
                    return;
                }

                // Transform and create opportunity
                const opportunityData = this.transformDomainToOpportunity(rec, accountId, engagementId);
                const opportunity = this.accountManager.createOpportunity(opportunityData);

                console.log(`[Domain→Opportunity Bridge] ✅ Created opportunity: ${opportunity.name} (ID: ${opportunity.id})`);
                results.created++;

            } catch (error) {
                console.error(`[Domain→Opportunity Bridge] ❌ Error creating opportunity for ${rec.domain}:`, error);
                results.errors.push(`${rec.domain}: ${error.message}`);
            }
        });

        // Summary
        console.log(`[Domain→Opportunity Bridge] 📊 Sync complete: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`);

        return results;
    }

    /**
     * Manual trigger: Sync opportunities for current engagement
     * @returns {Object} Sync results
     */
    syncCurrentEngagement() {
        if (!window.engagementManager) {
            console.error('[Domain→Opportunity Bridge] engagementManager not available');
            return { created: 0, skipped: 0, errors: ['engagementManager not available'] };
        }

        const currentEngagement = window.engagementManager.getCurrentEngagement();
        if (!currentEngagement || !currentEngagement.engagement) {
            console.error('[Domain→Opportunity Bridge] No current engagement');
            return { created: 0, skipped: 0, errors: ['No current engagement'] };
        }

        const engagementId = currentEngagement.engagement.id;
        const accountId = currentEngagement.engagement.accountId;

        if (!accountId) {
            console.error('[Domain→Opportunity Bridge] Engagement has no accountId');
            return { created: 0, skipped: 0, errors: ['Engagement has no accountId'] };
        }

        return this.syncDomainOpportunities(engagementId, accountId);
    }

    /**
     * Sync ALL available domain recommendations to opportunities (batch operation)
     * Scans localStorage for all strategic insights and syncs unsynced recommendations
     * @returns {Object} Batch sync results { totalCreated, totalSkipped, totalErrors, engagementsSynced }
     */
    syncAllAvailableRecommendations() {
        if (!this.initialized) {
            console.error('[Domain→Opportunity Bridge] ❌ Bridge not initialized');
            return { totalCreated: 0, totalSkipped: 0, totalErrors: 0, engagementsSynced: 0 };
        }

        console.log('[Domain→Opportunity Bridge] 🔍 Scanning for unsynced domain recommendations...');

        const batchResults = {
            totalCreated: 0,
            totalSkipped: 0,
            totalErrors: 0,
            engagementsSynced: 0
        };

        // Scan localStorage for all business lens insights
        const insightsPattern = /^ea_three_lens_insights_business_(.+)$/;
        const engagementsWithInsights = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const match = key.match(insightsPattern);
            
            if (match) {
                const engagementId = match[1];
                engagementsWithInsights.push(engagementId);
            }
        }

        if (engagementsWithInsights.length === 0) {
            console.log('[Domain→Opportunity Bridge] No strategic insights found in localStorage');
            return batchResults;
        }

        console.log(`[Domain→Opportunity Bridge] Found ${engagementsWithInsights.length} engagements with strategic insights`);

        // Sync each engagement
        engagementsWithInsights.forEach(engagementId => {
            try {
                // Get engagement to find accountId
                // Try engagementManager first, then fall back to localStorage
                let engagement = null;
                let accountId = null;

                if (window.engagementManager && typeof window.engagementManager.getEngagement === 'function') {
                    engagement = window.engagementManager.getEngagement(engagementId);
                    accountId = engagement?.accountId;
                }

                // Fallback: Read directly from localStorage
                if (!accountId) {
                    // Try multiple possible storage key patterns
                    const possibleKeys = [
                        `ea_engagement_${engagementId}`,
                        `engagement_${engagementId}`,
                        engagementId
                    ];
                    
                    for (const key of possibleKeys) {
                        const savedData = localStorage.getItem(key);
                        if (savedData) {
                            try {
                                const data = JSON.parse(savedData);
                                // Try multiple possible accountId locations
                                accountId = data.accountId || 
                                           data.engagement?.accountId || 
                                           data.account?.id ||
                                           data.metadata?.accountId;
                                
                                if (accountId) {
                                    console.log(`[Domain→Opportunity Bridge] Found accountId via localStorage key: ${key}`);
                                    break;
                                }
                            } catch (parseError) {
                                // Skip invalid JSON
                            }
                        }
                    }
                    
                    // Last resort: scan all localStorage keys for this engagement ID
                    if (!accountId) {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && key.includes(engagementId)) {
                                try {
                                    const data = JSON.parse(localStorage.getItem(key));
                                    accountId = data.accountId || 
                                               data.engagement?.accountId || 
                                               data.account?.id ||
                                               data.metadata?.accountId;
                                    
                                    if (accountId) {
                                        console.log(`[Domain→Opportunity Bridge] Found accountId via scan, key: ${key}`);
                                        break;
                                    }
                                } catch (e) {
                                    // Skip
                                }
                            }
                        }
                    }
                }
                
                if (!accountId) {
                    console.warn(`[Domain→Opportunity Bridge] Skipping ${engagementId} - no accountId found in any storage location`);
                    return;
                }

                const recommendations = this.extractDomainRecommendations(engagementId);
                
                if (recommendations.length === 0) {
                    return; // No recommendations to sync
                }

                // Check if there are any unsynced recommendations
                const unsyncedRecs = recommendations.filter(rec => 
                    !this.opportunityExists(rec.domain, accountId)
                );

                if (unsyncedRecs.length === 0) {
                    console.log(`[Domain→Opportunity Bridge] All recommendations already synced for: ${engagementId}`);
                    return;
                }

                // Sync this engagement
                const results = this.syncDomainOpportunities(engagementId, accountId);
                
                batchResults.totalCreated += results.created;
                batchResults.totalSkipped += results.skipped;
                batchResults.totalErrors += results.errors.length;
                
                if (results.created > 0) {
                    batchResults.engagementsSynced++;
                }

            } catch (error) {
                console.error(`[Domain→Opportunity Bridge] Error syncing engagement ${engagementId}:`, error);
                batchResults.totalErrors++;
            }
        });

        // Summary
        if (batchResults.totalCreated > 0) {
            console.log(`[Domain→Opportunity Bridge] 🎉 Batch sync complete: ${batchResults.totalCreated} opportunities created from ${batchResults.engagementsSynced} engagements`);
        } else {
            console.log('[Domain→Opportunity Bridge] ✓ All recommendations already synced');
        }

        return batchResults;
    }
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════

window.EA_DomainOpportunityBridge = EA_DomainOpportunityBridge;

// Note: Global instance creation is deferred to each page's initialization
// to ensure proper initialization with accountManager instance
console.log('[Domain→Opportunity Bridge] 📦 Bridge module loaded, ready for initialization');
