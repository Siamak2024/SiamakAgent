/**
 * EA_UnifiedAIAssistant - Context-Aware AI Assistant for EA2 Toolkit
 * Version: 1.0.0
 * 
 * Unified AI assistant that works across all EA2 toolkit pages with
 * context-specific instructions and knowledge.
 * 
 * Features:
 * - Automatic context detection (Account Dashboard, Growth Dashboard, Pipeline)
 * - Context-aware instructions and prompts
 * - GPT-5 integration via AzureOpenAIProxy
 * - Conversation history management
 * - Quick action suggestions
 */

class EA_UnifiedAIAssistant {
    constructor() {
        this.conversationHistory = [];
        this.currentContext = null;
        this.isProcessing = false;
        
        // Detect context on initialization
        this.detectContext();
        
        console.log('✅ EA_UnifiedAIAssistant initialized with context:', this.currentContext.page);
    }

    /**
     * Detect current page context and gather relevant data
     */
    detectContext() {
        const url = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        
        let page = 'unknown';
        let contextData = {};
        
        // Detect page type
        if (url.includes('EA_Account_Dashboard')) {
            page = 'account_dashboard';
            contextData = this.getAccountDashboardContext(urlParams);
        } else if (url.includes('EA_Growth_Dashboard')) {
            page = 'growth_dashboard';
            contextData = this.getGrowthDashboardContext();
        } else if (url.includes('EA_Opportunity_Pipeline')) {
            page = 'opportunity_pipeline';
            contextData = this.getOpportunityPipelineContext();
        }
        
        this.currentContext = {
            page,
            url,
            timestamp: new Date().toISOString(),
            ...contextData
        };
    }

    /**
     * Get Account Dashboard specific context
     */
    getAccountDashboardContext(urlParams) {
        const accountId = urlParams.get('accountId');
        const accountManager = window.accountManager;
        
        if (!accountId || !accountManager) {
            return {
                accountId: null,
                accountName: 'No Account Selected',
                hasData: false
            };
        }
        
        const account = accountManager.getAccount(accountId);
        if (!account) {
            return {
                accountId,
                accountName: 'Account Not Found',
                hasData: false
            };
        }
        
        const opportunities = accountManager.getOpportunitiesByAccount(accountId);
        const engagements = accountManager.getAllEngagements?.() || [];
        const accountEngagements = engagements.filter(e => e.accountId === accountId);
        
        return {
            accountId,
            accountName: account.name,
            accountIndustry: account.industry,
            accountRegion: account.region,
            accountSize: account.size,
            accountManager: account.accountManager,
            opportunityCount: opportunities.length,
            engagementCount: accountEngagements.length,
            totalValue: opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0),
            hasData: true
        };
    }

    /**
     * Get Growth Dashboard specific context
     */
    getGrowthDashboardContext() {
        const accountManager = window.accountManager;
        
        if (!accountManager) {
            return { hasData: false };
        }
        
        const accounts = accountManager.getAllAccounts();
        const opportunities = accountManager.getAllOpportunities();
        const activeOpps = opportunities.filter(o => 
            o.status !== 'close-won' && o.status !== 'close-lost'
        );
        
        const totalPipelineValue = activeOpps.reduce((sum, opp) => 
            sum + (opp.estimatedValue || 0) * (opp.probability || 0) / 100, 0
        );
        
        return {
            accountCount: accounts.length,
            opportunityCount: opportunities.length,
            activeOpportunityCount: activeOpps.length,
            totalPipelineValue,
            hasData: true
        };
    }

    /**
     * Get Opportunity Pipeline specific context
     */
    getOpportunityPipelineContext() {
        const accountManager = window.accountManager;
        
        if (!accountManager) {
            return { hasData: false };
        }
        
        const opportunities = accountManager.getAllOpportunities();
        
        // Group by stage
        const stages = {
            discovery: [],
            qualify: [],
            propose: [],
            negotiate: [],
            'close-won': [],
            'close-lost': []
        };
        
        opportunities.forEach(opp => {
            if (stages[opp.status]) {
                stages[opp.status].push(opp);
            }
        });
        
        return {
            totalOpportunities: opportunities.length,
            discoveryCount: stages.discovery.length,
            qualifyCount: stages.qualify.length,
            proposeCount: stages.propose.length,
            negotiateCount: stages.negotiate.length,
            wonCount: stages['close-won'].length,
            lostCount: stages['close-lost'].length,
            hasData: true
        };
    }

    /**
     * Get system instructions based on current context
     */
    getSystemInstructions() {
        const baseInstructions = `You are an expert Enterprise Architecture (EA) consultant and advisor integrated into the EA2 Toolkit platform.

Your role is to provide intelligent, context-aware assistance to EA professionals managing accounts, opportunities, and engagements.

Core Expertise:
- Enterprise Architecture principles and frameworks (TOGAF, Zachman, etc.)
- Account management and opportunity pipeline optimization
- Stakeholder engagement strategies
- Business value articulation and ROI analysis
- Technology transformation and modernization
- Risk assessment and mitigation
- **Service Delivery Model:** 41 High-Level services across 3 L1 areas (Consulting & Project Services, Managed Services, Platform Services)
- **WhiteSpot Heatmap Analysis:** Service coverage assessment with 5 states (FULL, PARTIAL, CUSTOM, LOST, POTENTIAL)
- **APQC Process Classification Framework:** L1-L4 process hierarchy for capability mapping
- **Service Gap Analysis:** Identifying white-spots as upsell and expansion opportunities

WhiteSpot Heatmap Integration:
- Understand customer service coverage across 41 services
- Interpret heatmap states: FULL (complete delivery), PARTIAL (gaps exist), CUSTOM (bespoke), LOST (not delivered), POTENTIAL (opportunity)
- Map service gaps to business capabilities using APQC L3/L4 processes
- Identify upsell opportunities from LOST and PARTIAL services
- Analyze heatmap analytics (state distribution, L1 coverage, opportunity values)
- Suggest targeted service offerings based on customer industry and engagement context

Documentation Access:
You have access to comprehensive toolkit documentation:
- WhiteSpot Heatmap User Guide: /WHITESPOT_HEATMAP_USER_GUIDE.md
- WhiteSpot Implementation Summary: /WHITESPOT_HEATMAP_IMPLEMENTATION_SUMMARY.md
- APQC Integration Guides: /NexGenEA/EA2_Toolkit/APQC_*.md
- APM Toolkit Guides: /NexGenEA/EA2_Toolkit/APM_*.md

Reference these when users ask about features, workflows, or best practices.

Communication Style:
- Professional yet approachable
- Provide actionable insights and specific recommendations
- Use data from the current context when available
- Ask clarifying questions when needed
- Structure responses clearly with bullet points or numbered lists when appropriate
- Keep responses concise but comprehensive (aim for 2-4 paragraphs unless more detail is requested)
- When discussing opportunities, reference WhiteSpot Heatmap insights where applicable`;

        const contextInstructions = this.getContextSpecificInstructions();
        
        return `${baseInstructions}\n\n${contextInstructions}`;
    }

    /**
     * Get context-specific instructions
     */
    getContextSpecificInstructions() {
        const ctx = this.currentContext;
        
        switch (ctx.page) {
            case 'account_dashboard':
                return `CURRENT CONTEXT: Account Dashboard

You are currently viewing the Account Dashboard${ctx.accountName ? ` for ${ctx.accountName}` : ''}.

${ctx.hasData ? `Account Information:
- Industry: ${ctx.accountIndustry || 'Unknown'}
- Region: ${ctx.accountRegion || 'Unknown'}
- Size: ${ctx.accountSize || 'Unknown'}
- Account Manager: ${ctx.accountManager || 'Unassigned'}
- Active Opportunities: ${ctx.opportunityCount || 0}
- Total Pipeline Value: $${(ctx.totalValue || 0).toLocaleString()}
- Engagements: ${ctx.engagementCount || 0}` : 'No account data available yet.'}

Your Focus:
- Analyze account health and engagement quality
- Identify expansion opportunities and upsell potential using WhiteSpot Heatmap analysis
- Assess stakeholder relationships and coverage
- Provide insights on opportunity progression
- Suggest next best actions for account growth based on service delivery gaps
- Help interpret metrics and KPIs
- Leverage WhiteSpot Heatmap to identify service gaps (LOST/PARTIAL states) as upsell opportunities
- Map account needs to service offerings (41 HL services)
- Use APQC capability framework to contextualize business needs to service gaps`;

            case 'growth_dashboard':
                return `CURRENT CONTEXT: Growth Dashboard

You are currently viewing the Growth Sprint Dashboard, the main hub for managing multiple accounts and opportunities.

${ctx.hasData ? `Portfolio Overview:
- Total Accounts: ${ctx.accountCount || 0}
- Total Opportunities: ${ctx.opportunityCount || 0}
- Active Opportunities: ${ctx.activeOpportunityCount || 0}
- Total Weighted Pipeline: $${(ctx.totalPipelineValue || 0).toLocaleString()}` : 'No portfolio data available yet.'}

Your Focus:
- Portfolio-level analysis and optimization
- Identify high-potential accounts requiring attention based on service delivery gaps
- Suggest account prioritization strategies using WhiteSpot Heatmap insights
- Analyze pipeline health and conversion trends
- Recommend resource allocation
- Help with strategic planning and territory management
- Assist with opportunity qualification criteria
- Leverage WhiteSpot Heatmap analytics across multiple accounts to identify portfolio-wide patterns
- Identify common service gaps (LOST/PARTIAL) across account portfolio
- Suggest targeted service offerings based on industry-specific APQC capability needs
- Generate account growth strategies based on service coverage analysis`;

            case 'opportunity_pipeline':
                return `CURRENT CONTEXT: Opportunity Pipeline

You are currently viewing the Opportunity Pipeline Kanban board for managing sales opportunities across stages.

${ctx.hasData ? `Pipeline Overview:
- Total Opportunities: ${ctx.totalOpportunities || 0}
- Discovery: ${ctx.discoveryCount || 0}
- Qualification: ${ctx.qualifyCount || 0}
- Proposal: ${ctx.proposeCount || 0}
- Negotiation: ${ctx.negotiateCount || 0}
- Closed Won: ${ctx.wonCount || 0}
- Closed Lost: ${ctx.lostCount || 0}` : 'No pipeline data available yet.'}

Your Focus:
- Opportunity stage progression analysis
- Sales process optimization and best practices
- Deal risk assessment and mitigation strategies
- Closing strategies for opportunities in negotiation
- Win/loss analysis and lessons learned
- Pipeline velocity and forecast accuracy
- Help prioritize opportunities requiring immediate attention`;

            default:
                return `CURRENT CONTEXT: EA2 Toolkit

You are assisting with the EA2 Toolkit platform for Enterprise Architecture and account management.

Your Focus:
- General EA consulting and advisory
- Platform navigation and feature usage
- Best practices for account and opportunity management
- Strategic guidance for EA engagements`;
        }
    }

    /**
     * Get quick action prompts based on context
     */
    getQuickPrompts() {
        const ctx = this.currentContext;
        
        switch (ctx.pIdentify service gaps and upsell opportunities (WhiteSpot)',
                    'What are the key risks for this account?',
                    'Suggest next best actions to expand this account',
                    'Map APQC capabilities to service delivery opportunities'
                ];
            
            case 'growth_dashboard':
                return [
                    'Which accounts should I prioritize this quarter?',
                    'Analyze portfolio-wide service coverage gaps',
                    'Suggest strategies to improve win rates',
                    'Identify common white-spots across accounts',
                    'What service expansion opportunities have highest valueer?',
                    'Analyze my pipeline health and coverage',
                    'Suggest strategies to improve win rates',
                    'Help me allocate resources across accounts',
                    'What trends do you see in my opportunity data?'
                ];
            
            case 'opportunity_pipeline':
                return [
                    'Which opportunities are at risk of stalling?',
                    'Suggest strategies to accelerate deal closure',
                    'Analyze my win/loss patterns',
                    'Help me qualify this opportunity',
                    'What should I focus on to improve conversion rates?'
                ];
            
            default:
                return [
                    'How can I improve my EA practice?',
                    'Help me navigate the EA2 Toolkit',
                    'What are best practices for account management?',
                    'Suggest ways to increase customer value'
                ];
        }
    }

    /**
     * Send a message to the AI assistant
     */
    async chat(userMessage) {
        if (this.isProcessing) {
            throw new Error('Please wait for the current response to complete');
        }
        
        if (!userMessage || !userMessage.trim()) {
            throw new Error('Message cannot be empty');
        }

        this.isProcessing = true;
        
        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // Prepare messages for API
            const messages = [
                {
                    role: 'system',
                    content: this.getSystemInstructions()
                },
                ...this.conversationHistory
            ];

            // Call OpenAI API via proxy
            const response = await AzureOpenAIProxy.create(messages, {
                model: 'gpt-5',  // Using GPT-5 (latest model)
                temperature: 0.7,
                reasoning: { type: 'extended' }  // Enable reasoning for better responses
            });

            // Extract response text
            const assistantMessage = response.output_text || 'I apologize, but I could not generate a response. Please try again.';

            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            // Limit history to last 20 messages (10 exchanges)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return {
                success: true,
                message: assistantMessage,
                context: this.currentContext
            };

        } catch (error) {
            console.error('AI Assistant Error:', error);
            
            return {
                success: false,
                message: `I encountered an error: ${error.message}. Please try again or contact support if the issue persists.`,
                error: error.message
            };
            
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        console.log('Conversation history cleared');
    }

    /**
     * Refresh context (call after page state changes)
     */
    refreshContext() {
        this.detectContext();
        console.log('Context refreshed:', this.currentContext.page);
    }

    /**
     * Get suggested prompt for quick action
     */
    getSuggestedPrompt(index) {
        const prompts = this.getQuickPrompts();
        return prompts[index] || null;
    }
}

// Make available globally
window.EA_UnifiedAIAssistant = EA_UnifiedAIAssistant;
