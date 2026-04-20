/**
 * EA_AIAssistant - Single unified context-aware AI assistant
 * Version: 2.0.0
 * 
 * Design Principle: ONE AI assistant in right sidebar that auto-detects context
 * and adapts behavior based on current workflow step, canvas, and integrations.
 * 
 * Context Detection:
 *   - Current workflow step (E0.1, E1.2, etc.)
 *   - Active canvas/tab (stakeholders, whitespace, roadmap)
 *   - Connected toolkits (APQC, APM, BMC, Capability)
 *   - Recent user actions
 *   - Engagement data
 * 
 * Public API:
 *   chat(userMessage) - Main conversational interface
 *   detectContext() - Get current context state
 *   getSuggestedPrompts() - Get context-aware quick actions
 *   askQuestions(maxQuestions=5) - 5-question pattern for analysis
 *   applyRecommendation(recommendation) - Save AI output to engagement
 */

class EA_AIAssistant {
  constructor(engagementManager, workflowEngine, integrationBridge) {
    this.engagementManager = engagementManager;
    this.workflowEngine = workflowEngine;
    this.integrationBridge = integrationBridge;
    this.conversationHistory = [];
    this.currentContext = null;
    this.activeQuestionFlow = null;
    
    console.log('✅ EA_AIAssistant initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONTEXT DETECTION ENGINE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Detect current context from UI state, engagement data, and integrations
   * @returns {Object} Context object with all relevant state
   */
  detectContext() {
    const engagement = this.engagementManager?.getCurrentEngagement?.();
    const workflowState = engagement?.engagement?.workflowState;
    
    const context = {
      // Workflow context
      currentPhase: workflowState?.currentPhase || this.detectPhaseFromUI() || 'E0',
      currentStep: workflowState?.currentStep || this.detectStepFromUI() || 'E0.1',
      completedSteps: workflowState?.completedSteps || [],
      phaseCompleteness: workflowState?.phaseCompleteness || {
        E0: 0, E1: 0, E2: 0, E3: 0, E4: 0, E5: 0
      },
      
      // UI context
      currentTab: this.getCurrentActiveTab(),
      currentView: this.getCurrentView(),
      
      // Data context
      engagement: engagement,
      engagementId: engagement?.engagement?.id || null,
      engagementName: engagement?.engagement?.name || 'Untitled',
      segment: engagement?.engagement?.segment || 'Unknown',
      theme: engagement?.engagement?.theme || 'Unknown',
      stakeholderCount: engagement?.stakeholders?.length || 0,
      applicationCount: engagement?.applications?.length || 0,
      capabilityCount: engagement?.capabilities?.length || 0,
      initiativeCount: engagement?.initiatives?.length || 0,
      riskCount: engagement?.risks?.length || 0,
      
      // Integration context
      integrations: workflowState?.integrations || {
        apqc: { status: 'not_connected' },
        apm: { status: 'not_connected' },
        bmc: { status: 'not_connected' },
        capability: { status: 'not_connected' }
      },
      
      // Activity context
      recentActions: this.getRecentActions(5),
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
    
    this.currentContext = context;
    return context;
  }

  /**
   * Get currently active tab from DOM
   * @returns {string} Tab identifier (e.g., 'overview', 'stakeholders', 'whitespace')
   */
  getCurrentActiveTab() {
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab?.dataset?.tab) {
      return activeTab.dataset.tab;
    }
    
    // Fallback: check URL or other indicators
    const url = window.location.href;
    if (url.includes('stakeholder')) return 'stakeholders';
    if (url.includes('whitespace')) return 'whitespace';
    if (url.includes('roadmap')) return 'roadmap';
    if (url.includes('portfolio')) return 'portfolio';
    
    return 'overview';
  }

  /**
   * Get current view type
   * @returns {string} View type ('engagement', 'account', 'growth')
   */
  getCurrentView() {
    const url = window.location.pathname;
    if (url.includes('Account_View')) return 'account';
    if (url.includes('Growth_Dashboard')) return 'growth';
    return 'engagement';
  }

  /**
   * Detect current phase from UI if workflow state not available
   * @returns {string|null} Phase identifier (E0-E5)
   */
  detectPhaseFromUI() {
    const phaseIndicator = document.querySelector('[data-current-phase]');
    if (phaseIndicator) {
      return phaseIndicator.dataset.currentPhase;
    }
    return null;
  }

  /**
   * Detect current step from UI if workflow state not available
   * @returns {string|null} Step identifier (E0.1, E1.2, etc.)
   */
  detectStepFromUI() {
    const stepIndicator = document.querySelector('[data-current-step]');
    if (stepIndicator) {
      return stepIndicator.dataset.currentStep;
    }
    return null;
  }

  /**
   * Get recent user actions from engagement activity log
   * @param {number} count - Number of recent actions to retrieve
   * @returns {Array} Recent actions
   */
  getRecentActions(count = 5) {
    const engagement = this.engagementManager?.getCurrentEngagement?.();
    if (!engagement?.engagement?.activityLog) {
      return [];
    }
    return engagement.engagement.activityLog.slice(-count);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PROMPT GENERATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Generate context-aware system prompt for AI
   * @param {Object} context - Current context object
   * @returns {string} Complete system prompt
   */
  generateSystemPrompt(context) {
    let prompt = this.getBasePrompt();
    
    // Add step-specific guidance
    const stepGuidance = this.getStepGuidance(context.currentStep);
    if (stepGuidance) {
      prompt += '\n\n' + stepGuidance;
    }
    
    // Add canvas-specific hints
    const canvasHints = this.getCanvasHints(context.currentTab);
    if (canvasHints) {
      prompt += '\n\n' + canvasHints;
    }
    
    // Add integration context
    const integrationContext = this.getIntegrationContext(context.integrations);
    if (integrationContext) {
      prompt += '\n\n' + integrationContext;
    }
    
    // Add data summary
    prompt += `\n\n**Current Context:**
Engagement: ${context.engagementName}
Segment: ${context.segment} | Theme: ${context.theme}
Phase: ${context.currentPhase} (${context.phaseCompleteness[context.currentPhase] || 0}% complete)
Current Step: ${context.currentStep}
Data: ${context.stakeholderCount} stakeholders, ${context.applicationCount} applications, ${context.capabilityCount} capabilities, ${context.initiativeCount} initiatives`;
    
    return prompt;
  }

  /**
   * Get base EA expert prompt (always included)
   * @returns {string} Base prompt
   */
  getBasePrompt() {
    return `You are Advicy AI, the intelligent enterprise architecture advisor integrated into the EA Toolkit. 
You help users navigate the EA engagement workflow (E0-E5) with contextual guidance, industry benchmarks, 
and actionable recommendations.

**Your Expertise:**
- Enterprise Architecture (TOGAF, ArchiMate, Zachman)
- Capability mapping and operating model design
- Digital transformation and strategic planning
- Application portfolio management
- APQC Process Classification Framework (v8.0 Cross-Industry)
- Service Delivery Model (41 HL services across 3 L1 areas)
- WhiteSpot Heatmap analysis and service coverage assessment
- Value case development and ROI analysis

**WhiteSpot Heatmap & APQC Integration Knowledge:**
You have full access to and understanding of:
- **WhiteSpot Heatmap:** Service delivery assessment tool with 41 High-Level services
  - 5 assessment states: FULL, PARTIAL, CUSTOM, LOST, POTENTIAL
  - L3 component tracking with auto-score calculation
  - AI-powered APQC capability mapping (semantic matching algorithm)
  - Opportunity management with value estimation
  - Analytics dashboard with filtering and bulk operations
- **APQC Integration:** Process Classification Framework mapping
  - L1-L4 process hierarchy (Operating/Management/Support processes)
  - Process-to-service mapping for gap analysis
  - Industry benchmark integration
  - Capability maturity assessment

**Documentation Library (Reference When Helpful):**
You have access to comprehensive user documentation for all toolkits:
- WhiteSpot Heatmap User Guide: /WHITESPOT_HEATMAP_USER_GUIDE.md
- WhiteSpot Implementation Summary: /WHITESPOT_HEATMAP_IMPLEMENTATION_SUMMARY.md
- APM-APQC Integration Guide: /NexGenEA/EA2_Toolkit/APM_APQC_ENHANCEMENT_GUIDE.md
- APQC Capability Mapping: /NexGenEA/EA2_Toolkit/APQC_CAPABILITY_MAPPING_INTEGRATION.md
- APM Quick Start: /NexGenEA/EA2_Toolkit/APM_QUICKSTART.md
- Multi-Engagement Guide: /NexGenEA/EA2_Toolkit/MULTI_ENGAGEMENT_GUIDE.md

When users ask about features, workflows, or best practices, reference these guides to provide accurate, detailed guidance.

**5-Question Pattern (CRITICAL):**
When asked for analysis, recommendations, or to generate artifacts:
1. Ask MAX 5 contextual questions to gather information
2. STOP EARLY if you have enough information (don't force all 5)
3. Generate specific, actionable recommendations with:
   - Clear deliverables (scope statement, timeline, checklist, etc.)
   - Confidence score (%)
   - Sources/references (APQC codes, frameworks, best practices)
4. Format output with clear sections and markdown

**Tone & Style:**
- Concise and actionable (not verbose)
- Commercially sharp (ROI, value, growth focus)
- Evidence-based (cite APQC benchmarks, industry standards, documentation)
- Helpful but not patronizing

**Context Awareness:**
You automatically adapt based on current workflow step, canvas, and connected toolkits. 
You can see what the user is working on and tailor your guidance accordingly. When users are on the WhiteSpot Heatmap canvas, provide service delivery insights, gap analysis, and APQC mapping guidance.`;
  }

  /**
   * Get step-specific prompt guidance
   * @param {string} stepId - Step identifier (E0.1, E1.2, etc.)
   * @returns {string|null} Step-specific guidance
   */
  getStepGuidance(stepId) {
    const stepPrompts = {
      // Phase E0: Initiation & Planning
      'E0.1': `**Current Task: Define Engagement Scope**
Ask max 5 questions about: business drivers, timeline, resources, budget, constraints.
Generate: Comprehensive scope statement, timeline estimate (by phase), resource allocation plan, 8-item checklist.`,

      'E0.2': `**Current Task: Identify Stakeholders**
Ask about: organizational structure, decision-makers, influencers, communication needs.
Generate: Stakeholder list with roles, influence levels (high/medium/low), communication plan.`,

      'E0.3': `**Current Task: Set Success Criteria**
Ask about: business goals, KPIs, target metrics, measurement approach.
Generate: SMART success criteria, measurement framework, baseline vs target metrics.`,

      'E0.4': `**Current Task: Establish Governance**
Ask about: decision-making process, approval levels, meeting cadence, escalation paths.
Generate: Governance model, RACI matrix, decision framework.`,

      'E0.5': `**Current Task: Create Phase Plan**
Ask about: milestones, dependencies, resource availability, risks.
Generate: Phase-by-phase plan with milestones, resource allocation, risk mitigation.`,

      // Phase E1: Discovery & Analysis
      'E1.1': `**Current Task: Application Portfolio Analysis**
Help analyze current application landscape, identify rationalization opportunities.
Generate: Portfolio insights, sunset candidates, modernization priorities.`,

      'E1.2': `**Current Task: WhiteSpot Heatmap Analysis (Service Coverage Assessment)**
Ask max 5 questions about: 
- Current service delivery scope and maturity
- Strategic priorities and growth areas
- Known gaps or customer pain points
- Competitor service offerings
- Customer industry and business capabilities

**Generate:**
- Service assessment recommendations (which services to mark FULL/PARTIAL/LOST)
- L3 component delivery suggestions
- Prioritized white-spot opportunities with impact assessment
- APQC capability mappings (L3/L4 processes to services)
- Upsell opportunity identification with estimated values
- Custom business areas aligned to customer needs

**Analysis Framework:**
1. Review existing engagement context (customer, segment, industry)
2. Assess current service coverage across 3 L1 areas:
   - Consulting & Project Services
   - Managed Services  
   - Platform Services
3. Identify high-impact gaps (LOST or PARTIAL services)
4. Map to APQC business capabilities for context
5. Prioritize opportunities by: strategic fit + value potential + feasibility
6. Generate actionable recommendations with confidence scores

**Documentation Reference:**
- Full workflows: /WHITESPOT_HEATMAP_USER_GUIDE.md (Section 4: User Workflows)
- Feature guide: /WHITESPOT_HEATMAP_USER_GUIDE.md (Section 5: Feature Reference)`,

      'E1.3': `**Current Task: Current State Assessment**
Help document as-is architecture, processes, and pain points.
Generate: Current state summary, pain point analysis, improvement opportunities.`,

      // Phase E2: Customer Validation
      'E2.1': `**Current Task: Stakeholder Engagement**
Help plan stakeholder workshops, interviews, validation sessions.
Generate: Engagement strategy, workshop agendas, validation framework.`,

      'E2.2': `**Current Task: Requirements Validation**
Help validate business requirements and constraints.
Generate: Validated requirements, prioritization, trade-off analysis.`,

      // Phase E3: Target State Design
      'E3.1': `**Current Task: Define Architecture Principles**
Ask about: architecture goals, constraints, technology strategy, risk tolerance.
Generate: Architecture principles, design guidelines, pattern recommendations.`,

      'E3.2': `**Current Task: Design Target Architecture**
Help design future-state architecture aligned with business goals.
Generate: Target architecture blueprint, layer-by-layer design, technology choices.`,

      // Phase E4: Roadmap & Planning
      'E4.1': `**Current Task: Initiative Planning**
Help define transformation initiatives with scope, effort, value.
Generate: Initiative portfolio, prioritization, sequencing recommendations.`,

      'E4.2': `**Current Task: Roadmap Development**
Ask max 5 questions about: transformation horizon, parallel capacity, quick wins, dependencies.
Generate: Phased roadmap with waves, dependency-aware sequencing, resource allocation.`,

      // Phase E5: Outputs & Enablement
      'E5.1': `**Current Task: Document Generation**
Help generate EA documentation (customer deliverables, leadership views, technical specs).
Generate: Document templates, content suggestions, formatting guidance.`,

      'E5.2': `**Current Task: Knowledge Transfer**
Help plan enablement sessions, training materials, handover documentation.
Generate: Enablement plan, training agenda, handover checklist.`
    };

    return stepPrompts[stepId] || null;
  }

  /**
   * Get canvas-specific hints
   * @param {string} tabName - Tab/canvas identifier
   * @returns {string|null} Canvas-specific hints
   */
  getCanvasHints(tabName) {
    const canvasHints = {
      'stakeholders': `**Canvas: Stakeholders**
Help map stakeholder influence, identify key decision-makers, plan engagement strategies.
Suggest communication approaches based on influence/interest matrix.`,

      'whitespace': `**Canvas: WhiteSpot Heatmap (Service Delivery Assessment)**
Help analyze service coverage across 41 High-Level services with 5 assessment states:
- FULL (green): All L3 components delivered
- PARTIAL (yellow): Some gaps in L3 delivery  
- CUSTOM (blue): Bespoke solutions
- LOST (red): Not currently delivered
- POTENTIAL (orange): Planned or high-value opportunities

**Your Expertise:**
- Analyze service delivery coverage and identify gaps (white-spots)
- Suggest L3 component assessments based on customer context
- Map services to APQC L3/L4 business capabilities
- Identify upsell opportunities from gaps
- Interpret heatmap analytics (state distribution, L1 coverage, opportunity values)
- Guide filtering strategies (by state, L1 area, score, gaps, opportunities)
- Recommend bulk operations for efficiency

**Key Features Available:**
- Service drill-down with L3 component tracking
- AI-powered APQC capability mapping (semantic matching with confidence scores)
- Opportunity management with value estimation
- Custom business area linking (multi-select services)
- Advanced filtering (6 filter types)
- Bulk operations (mark states, generate APQC mappings, export opportunities)
- Analytics dashboard (state distribution, L1 coverage, top opportunities, gap analysis)
- Export formats: JSON, CSV, Print-to-PDF

**Documentation Access:**
- User Guide: /WHITESPOT_HEATMAP_USER_GUIDE.md (9 sections, workflows, feature reference)
- Implementation Summary: /WHITESPOT_HEATMAP_IMPLEMENTATION_SUMMARY.md
- Testing Checklist: /WHITESPOT_HEATMAP_TESTING_CHECKLIST.md

If APQC is connected, leverage industry benchmarks for capability maturity and provide process-to-service mapping suggestions.`,

      'portfolio': `**Canvas: Application Portfolio**
Help analyze applications, identify sunset candidates, recommend modernization priorities.
If APM Toolkit is connected, leverage portfolio data for deeper insights.`,

      'roadmap': `**Canvas: Roadmap & Timeline**
Help sequence initiatives, identify dependencies, suggest quick wins, plan waves.
Recommend phased approach (short/mid/long term) with resource smoothing.`,

      'target': `**Canvas: Target Architecture**
Help design future-state architecture, suggest patterns, define principles.
Consider cloud adoption framework, industry reference architectures, best practices.`,

      'leadership': `**Canvas: Leadership View (Investment)**
Help generate executive summaries, investment analysis, value narratives.
Focus on ROI, payback period, strategic alignment, risk mitigation.`
    };

    return canvasHints[tabName] || null;
  }

  /**
   * Get integration-specific context
   * @param {Object} integrations - Integration status object
   * @returns {string|null} Integration context
   */
  getIntegrationContext(integrations) {
    const lines = [];
    
    if (integrations.apqc?.status === 'connected') {
      lines.push(`**APQC Framework:** Connected. 
- Provide industry benchmarks and process best practices
- Map L3/L4 processes to service delivery offerings (WhiteSpot Heatmap)
- Suggest capability maturity standards
- AI-powered semantic matching: keyword (60%) + description (20%) + strategic alignment (20%)
- Data source: /NexGenEA/EA2_Toolkit/data/apqc_pcf_master.json (v8.0 Cross-Industry)
- Integration module: apqc_whitespot_integration.js`);
    }
    
    if (integrations.apm?.status === 'connected') {
      lines.push(`**APM Toolkit:** Connected (Project: ${integrations.apm.projectId || 'unknown'}). Application portfolio data available for analysis.`);
    }
    
    if (integrations.bmc?.status === 'connected') {
      lines.push(`**BMC Toolkit:** Connected (Canvas: ${integrations.bmc.canvasId || 'unknown'}). Business model and stakeholder data available.`);
    }
    
    if (integrations.capability?.status === 'connected') {
      lines.push(`**Capability Map:** Connected (Map: ${integrations.capability.capMapId || 'unknown'}). Capability maturity data available.`);
    }
    
    return lines.length > 0 ? '\n**Connected Toolkits:**\n' + lines.join('\n') : null;
  }

  /**
   * Get context-aware suggested prompts (quick actions)
   * @param {Object} context Analyze service coverage gaps', command: 'gaps' },
        { icon: '⭐', text: 'Prioritize white-spot opportunities', command: 'prioritize' },
        { icon: '🎯', text: 'Generate APQC capability mappings', command: 'apqc_mappings' }
      );
      if (context.integrations.apqc?.status === 'connected') {
        prompts.push({ icon: '📊', text: 'Show heatmap analytics insights', command: 'heatmap_analytics' });
      } else {
        prompts.push({ icon: '📚', text: 'Connect APQC framework', command: 'connect_apqc' });
      }
      prompts.push({ icon: '💡', text: 'Suggest service assessments', command: 'assess_services' });
    const prompts = [];
    
    // Step-specific suggestions
    if (context.currentStep === 'E0.1') {
      prompts.push(
        { icon: '📋', text: 'Help me define engagement scope', command: 'scope' },
        { icon: '📅', text: 'Generate timeline estimate', command: 'timeline' },
        { icon: '👥', text: 'Suggest resource allocation', command: 'resources' }
      );
    } else if (context.currentStep === 'E0.2') {
      prompts.push(
        { icon: '👥', text: 'Identify key stakeholders', command: 'identify_stakeholders' },
        { icon: '🎯', text: 'Map influence and power', command: 'influence_map' }
      );
      if (context.integrations.bmc?.status === 'connected') {
        prompts.push({ icon: '📥', text: 'Import stakeholders from BMC', command: 'import_bmc' });
      }
    } else if (context.currentStep === 'E1.2' || context.currentTab === 'whitespace') {
      prompts.push(
        { icon: '🔍', text: 'Identify capability gaps', command: 'gaps' },
        { icon: '⭐', text: 'Prioritize white-spots', command: 'prioritize' }
      );
      if (context.integrations.apqc?.status === 'connected') {
        prompts.push({ icon: '📚', text: 'Load APQC benchmarks', command: 'apqc_benchmarks' });
      } else {
        prompts.push({ icon: '📚', text: 'Connect APQC framework', command: 'connect_apqc' });
      }
    } else if (context.currentStep === 'E4.2' || context.currentTab === 'roadmap') {
      prompts.push(
        { icon: '🔢', text: 'Sequence initiatives', command: 'sequence' },
        { icon: '🔗', text: 'Identify dependencies', command: 'dependencies' },
        { icon: '🏆', text: 'Find quick wins', command: 'quickwins' }
      );
    } else if (context.currentTab === 'portfolio') {
      prompts.push(
        { icon: '🔍', text: 'Analyze portfolio', command: 'analyze_portfolio' },
        { icon: '🌅', text: 'Identify sunset candidates', command: 'sunset' },
        { icon: '🚀', text: 'Modernization priorities', command: 'modernize' }
      );
      if (context.integrations.apm?.status === 'connected') {
        prompts.push({ icon: '📥', text: 'Import from APM Toolkit', command: 'import_apm' });
      }
    }
    
    // General helpful prompts (always available)
    if (prompts.length < 3) {
      prompts.push(
        { icon: '💡', text: 'What should I do next?', command: 'next_steps' },
        { icon: '📊', text: 'Show engagement insights', command: 'insights' }
      );
    }
    
    return prompts.slice(0, 5); // Max 5 suggested prompts
  }

  /**
   * Get human-readable label for step ID
   * @param {string} stepId - Step identifier
   * @returns {string} Human-readable label
   */
  getStepLabel(stepId) {
    const labels = {
      'E0.1': 'E0.1 Define Scope',
      'E0.2': 'E0.2 Identify Stakeholders',
      'E0.3': 'E0.3 Set Success Criteria',
      'E0.4': 'E0.4 Establish Governance',
      'E0.5': 'E0.5 Create Phase Plan',
      'E1.1': 'E1.1 Portfolio Analysis',
      'E1.2': 'E1.2 Capability Gap Analysis',
      'E1.3': 'E1.3 Current State Assessment',
      'E2.1': 'E2.1 Stakeholder Engagement',
      'E2.2': 'E2.2 Requirements Validation',
      'E3.1': 'E3.1 Architecture Principles',
      'E3.2': 'E3.2 Target Architecture Design',
      'E4.1': 'E4.1 Initiative Planning',
      'E4.2': 'E4.2 Roadmap Development',
      'E5.1': 'E5.1 Document Generation',
      'E5.2': 'E5.2 Knowledge Transfer'
    };
    return labels[stepId] || stepId;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONVERSATIONAL ENGINE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Main chat interface - context-aware conversational AI
   * @param {string} userMessage - User's message
   * @param {Object} options - Optional settings
   * @returns {Promise<string>} AI response
   */
  async chat(userMessage, options = {}) {
    try {
      // Update context
      const context = this.detectContext();
      
      // Generate context-aware system prompt
      const systemPrompt = this.generateSystemPrompt(context);
      
      // Add user message to history
      this.conversationHistory.push({ 
        role: 'user', 
        content: userMessage,
        context: { step: context.currentStep, tab: context.currentTab },
        timestamp: new Date().toISOString()
      });
      
      // Check if AzureOpenAIProxy is available
      if (typeof AzureOpenAIProxy === 'undefined') {
        console.error('AzureOpenAIProxy not available');
        return 'Sorry, the AI service is not available. Please check your configuration.';
      }
      
      // Build messages array for API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.map(m => ({ role: m.role, content: m.content }))
      ];
      
      // Call AzureOpenAIProxy
      const response = await AzureOpenAIProxy.chat(messages, {
        taskType: options.taskType || 'analysis',
        includeReasoning: options.includeReasoning || false,
        maxTokens: options.maxTokens || 1500
      });
      
      // Extract content from response
      const aiResponse = response.content || response;
      
      // Add AI response to history
      this.conversationHistory.push({ 
        role: 'assistant', 
        content: aiResponse,
        context: { step: context.currentStep, tab: context.currentTab },
        timestamp: new Date().toISOString()
      });
      
      // Store conversation in engagement model
      this.storeConversation(context, userMessage, aiResponse);
      
      return aiResponse;
      
    } catch (error) {
      console.error('EA_AIAssistant chat error:', error);
      throw error;
    }
  }

  /**
   * 5-Question Pattern - Ask max 5 contextual questions before generating recommendation
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Question flow controller
   */
  async askQuestions(options = {}) {
    const context = this.detectContext();
    const maxQuestions = options.maxQuestions || 5;
    const purpose = options.purpose || `gather information for ${context.currentStep}`;
    
    this.activeQuestionFlow = {
      purpose,
      maxQuestions,
      questions: [],
      answers: [],
      context,
      startTime: new Date().toISOString()
    };
    
    // Generate first question
    const firstQuestion = await this.generateNextQuestion();
    
    return {
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions: maxQuestions,
      addAnswer: (answer) => this.addAnswerAndContinue(answer)
    };
  }

  /**
   * Generate next contextual question based on previous Q&A
   * @returns {Promise<string>} Next question
   */
  async generateNextQuestion() {
    if (!this.activeQuestionFlow) {
      throw new Error('No active question flow. Call askQuestions() first.');
    }
    
    const flow = this.activeQuestionFlow;
    const questionNumber = flow.questions.length + 1;
    
    if (questionNumber > flow.maxQuestions) {
      return null; // No more questions
    }
    
    // Build prompt for next question
    let prompt = `You are gathering information for: ${flow.purpose}\n\n`;
    
    if (flow.questions.length === 0) {
      prompt += `Generate the FIRST question (of max ${flow.maxQuestions}) to gather key information.\n`;
      prompt += `Context: ${JSON.stringify(flow.context, null, 2)}\n`;
      prompt += `Make it specific and actionable. Ask ONE question only.`;
    } else {
      prompt += `Previous Q&A:\n`;
      flow.questions.forEach((q, i) => {
        prompt += `Q${i + 1}: ${q}\nA${i + 1}: ${flow.answers[i] || '(pending)'}\n\n`;
      });
      prompt += `\nBased on the answers so far, generate question ${questionNumber} of ${flow.maxQuestions}.\n`;
      prompt += `If you have ENOUGH information to make a good recommendation, respond with "ENOUGH_INFO".\n`;
      prompt += `Otherwise, ask the next most important question. Ask ONE question only.`;
    }
    
    const response = await this.chat(prompt, { taskType: 'question_generation' });
    
    if (response.includes('ENOUGH_INFO')) {
      return null; // Enough information gathered
    }
    
    // Store question
    flow.questions.push(response);
    
    return response;
  }

  /**
   * Add answer to current question and generate next question
   * @param {string} answer - User's answer to current question
   * @returns {Promise<Object|null>} Next question object or null if done
   */
  async addAnswerAndContinue(answer) {
    if (!this.activeQuestionFlow) {
      throw new Error('No active question flow.');
    }
    
    const flow = this.activeQuestionFlow;
    flow.answers.push(answer);
    
    // Check if we should continue asking
    if (flow.questions.length >= flow.maxQuestions) {
      // Max questions reached, generate recommendation
      const recommendation = await this.generateRecommendation();
      this.activeQuestionFlow = null; // Clear flow
      return { done: true, recommendation };
    }
    
    // Generate next question
    const nextQuestion = await this.generateNextQuestion();
    
    if (!nextQuestion) {
      // AI determined enough info, generate recommendation
      const recommendation = await this.generateRecommendation();
      this.activeQuestionFlow = null; // Clear flow
      return { done: true, recommendation };
    }
    
    return {
      done: false,
      question: nextQuestion,
      questionNumber: flow.questions.length,
      totalQuestions: flow.maxQuestions
    };
  }

  /**
   * Generate recommendation based on Q&A from 5-question flow
   * @returns {Promise<Object>} Structured recommendation
   */
  async generateRecommendation() {
    if (!this.activeQuestionFlow) {
      throw new Error('No active question flow to generate recommendation from.');
    }
    
    const flow = this.activeQuestionFlow;
    
    // Build comprehensive prompt
    let prompt = `Based on the following Q&A session, generate a comprehensive recommendation.\n\n`;
    prompt += `**Purpose:** ${flow.purpose}\n\n`;
    prompt += `**Context:** ${flow.context.currentStep} - ${this.getStepLabel(flow.context.currentStep)}\n\n`;
    prompt += `**Q&A Session:**\n`;
    flow.questions.forEach((q, i) => {
      prompt += `Q${i + 1}: ${q}\nA${i + 1}: ${flow.answers[i]}\n\n`;
    });
    
    prompt += `\n**Generate:**\n`;
    prompt += `1. **Summary** - Brief summary of what was discussed\n`;
    prompt += `2. **Recommendation** - Specific, actionable recommendation\n`;
    prompt += `3. **Deliverables** - Concrete artifacts to create (scope statement, timeline, checklist, etc.)\n`;
    prompt += `4. **Checklist** - 5-10 action items as a checklist (use [ ] format)\n`;
    prompt += `5. **Confidence Score** - How confident are you in this recommendation (0-100%)\n`;
    prompt += `6. **Sources** - References (APQC codes, frameworks, best practices)\n\n`;
    prompt += `Format with clear markdown sections. Be specific and actionable.`;
    
    const response = await this.chat(prompt, { taskType: 'recommendation', maxTokens: 2000 });
    
    // Parse recommendation
    const recommendation = this.parseRecommendation(response, flow);
    
    return recommendation;
  }

  /**
   * Parse AI recommendation text into structured format
   * @param {string} responseText - AI response text
   * @param {Object} flow - Question flow object
   * @returns {Object} Structured recommendation
   */
  parseRecommendation(responseText, flow) {
    // Extract checklist items (lines starting with [ ] or [x])
    const checklistRegex = /[-*]\s*\[[\sx]\]\s*(.+)/gi;
    const checklistMatches = responseText.match(checklistRegex) || [];
    const checklist = checklistMatches.map(item => {
      const text = item.replace(/[-*]\s*\[[\sx]\]\s*/, '').trim();
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: text,
        completed: false,
        aiGenerated: true,
        source: 'AI Assistant',
        timestamp: new Date().toISOString()
      };
    });
    
    // Extract confidence score
    const confidenceRegex = /confidence[:\s]+(\d+)%?/i;
    const confidenceMatch = responseText.match(confidenceRegex);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
    
    // Extract sources
    const sourcesRegex = /(?:sources?|references?)[\s:]+(.+?)(?:\n\n|$)/is;
    const sourcesMatch = responseText.match(sourcesRegex);
    const sources = sourcesMatch ? sourcesMatch[1].trim().split(/[,\n]/).map(s => s.trim()).filter(Boolean) : [];
    
    return {
      summary: responseText,
      checklist,
      confidence,
      sources,
      qa: flow.questions.map((q, i) => ({ question: q, answer: flow.answers[i] })),
      context: flow.context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Apply recommendation to engagement model
   * @param {Object} recommendation - Recommendation object from generateRecommendation()
   * @returns {Promise<boolean>} Success status
   */
  async applyRecommendation(recommendation) {
    try {
      const engagement = this.engagementManager?.getCurrentEngagement?.();
      if (!engagement) {
        console.error('No active engagement to apply recommendation to');
        return false;
      }
      
      const context = recommendation.context || this.currentContext;
      
      // Add checklist items to current phase
      if (recommendation.checklist && recommendation.checklist.length > 0) {
        const currentPhase = context.currentPhase;
        const phase = engagement.phases?.find(p => p.id === currentPhase);
        
        if (phase) {
          if (!phase.checklistItems) {
            phase.checklistItems = [];
          }
          phase.checklistItems.push(...recommendation.checklist);
        }
      }
      
      // Store full recommendation in AI conversations
      if (!engagement.engagement.aiConversations) {
        engagement.engagement.aiConversations = [];
      }
      
      engagement.engagement.aiConversations.push({
        stepId: context.currentStep,
        recommendation: recommendation.summary,
        checklist: recommendation.checklist,
        confidence: recommendation.confidence,
        sources: recommendation.sources,
        qa: recommendation.qa,
        timestamp: recommendation.timestamp
      });
      
      // Mark step as complete if workflow engine is available
      if (this.workflowEngine?.markStepComplete) {
        this.workflowEngine.markStepComplete(engagement.engagement.id, context.currentStep, {
          completedBy: 'AI Assistant',
          recommendation: recommendation.summary
        });
      }
      
      // Save engagement
      if (this.engagementManager?.saveEngagement) {
        this.engagementManager.saveEngagement(engagement.engagement.id, engagement);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error applying recommendation:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STORAGE & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Store conversation in engagement model
   * @param {Object} context - Current context
   * @param {string} userMessage - User's message
   * @param {string} aiResponse - AI's response
   */
  storeConversation(context, userMessage, aiResponse) {
    try {
      const engagement = this.engagementManager?.getCurrentEngagement?.();
      if (!engagement) return;
      
      if (!engagement.engagement.aiConversations) {
        engagement.engagement.aiConversations = [];
      }
      
      engagement.engagement.aiConversations.push({
        stepId: context.currentStep,
        tab: context.currentTab,
        userMessage,
        aiResponse,
        context: {
          phase: context.currentPhase,
          step: context.currentStep,
          tab: context.currentTab,
          integrations: context.integrations
        },
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 conversations to avoid storage bloat
      if (engagement.engagement.aiConversations.length > 50) {
        engagement.engagement.aiConversations = engagement.engagement.aiConversations.slice(-50);
      }
      
      // Save engagement
      if (this.engagementManager?.saveEngagement) {
        this.engagementManager.saveEngagement(engagement.engagement.id, engagement);
      }
      
    } catch (error) {
      console.error('Error storing conversation:', error);
    }
  }

  /**
   * Clear conversation history (for current session only)
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('✅ Conversation history cleared');
  }

  /**
   * Get conversation history with optional filtering
   * @param {Object} filters - Optional filters (stepId, tab, limit)
   * @returns {Array} Filtered conversation history
   */
  getHistory(filters = {}) {
    let history = [...this.conversationHistory];
    
    if (filters.stepId) {
      history = history.filter(h => h.context?.step === filters.stepId);
    }
    
    if (filters.tab) {
      history = history.filter(h => h.context?.tab === filters.tab);
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return history;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get current state (for debugging)
   * @returns {Object} Current state
   */
  getState() {
    return {
      currentContext: this.currentContext,
      conversationHistory: this.conversationHistory,
      activeQuestionFlow: this.activeQuestionFlow
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GLOBAL INITIALIZATION (when dependencies are ready)
// ═══════════════════════════════════════════════════════════════════════

// Note: Will be initialized by EA_Engagement_Playbook.html after other managers load
// Usage: window.EAAIAssistant = new EA_AIAssistant(engagementManager, workflowEngine, integrationBridge);

console.log('✅ EA_AIAssistant.js loaded');
