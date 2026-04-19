/**
 * EA_AIOrchestrator.js
 * Advanced AI Content Generation Orchestrator
 * Manages AI-powered analysis, recommendations, and content generation
 * with confidence scoring, source citation, and audit trail
 * 
 * @version 2.0
 * @phase Phase 4 - Output Generation & Advanced AI
 */

class EA_AIOrchestrator {
  constructor(engagementManager, dataManager, workflowEngine) {
    this.engagementManager = engagementManager;
    this.dataManager = dataManager;
    this.workflowEngine = workflowEngine;
    this.aiProxy = window.AzureOpenAIProxy;
    this.handlebars = null;
    this.auditLog = [];
    this.conversationMemory = new Map(); // engagementId -> conversation history
  }

  /**
   * Initialize Handlebars and register helpers
   */
  async init() {
    if (!this.handlebars) {
      // Check if Handlebars is available globally
      if (window.Handlebars) {
        this.handlebars = window.Handlebars;
      } else {
        // Load from CDN
        await this.loadHandlebars();
      }
      this.registerHandlebarsHelpers();
    }
  }

  /**
   * Load Handlebars from CDN
   */
  async loadHandlebars() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.7/handlebars.min.js';
      script.onload = () => {
        this.handlebars = window.Handlebars;
        console.log('✅ Handlebars loaded');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Handlebars'));
      document.head.appendChild(script);
    });
  }

  /**
   * Register custom Handlebars helpers
   */
  registerHandlebarsHelpers() {
    this.handlebars.registerHelper('eq', (a, b) => a === b);
    this.handlebars.registerHelper('gt', (a, b) => a > b);
    this.handlebars.registerHelper('gte', (a, b) => a >= b);
    this.handlebars.registerHelper('includes', (collection, value) => {
      if (Array.isArray(collection)) return collection.includes(value);
      if (typeof collection === 'string') return collection.includes(value);
      return false;
    });
    this.handlebars.registerHelper('and', (a, b) => a && b);
  }

  /**
   * Load AI prompt template
   * @param {string} templateName - Name of template file (without .txt)
   * @returns {Promise<string>}
   */
  async loadPromptTemplate(templateName) {
    try {
      const templatePath = `../NexGenEA/EA2_Toolkit/ai_prompts/${templateName}.txt`;
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Template ${templateName} not found`);
      }
      return await response.text();
    } catch (error) {
      console.error(`❌ Failed to load prompt template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Render prompt template with data
   * @param {string} templateName
   * @param {object} data
   * @returns {string}
   */
  async renderPrompt(templateName, data) {
    await this.init();
    const templateContent = await this.loadPromptTemplate(templateName);
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  /**
   * Inject external knowledge into context
   * @param {object} engagement
   * @returns {Promise<object>}
   */
  async injectExternalKnowledge(engagement) {
    const knowledge = {
      apqcVersion: 'PCF v8.0',
      industry: engagement.segment || 'General',
      togafPhases: ['Preliminary', 'Architecture Vision', 'Business Architecture', 'Information Systems Architecture', 'Technology Architecture', 'Opportunities & Solutions', 'Migration Planning', 'Implementation Governance', 'Architecture Change Management'],
      industryBenchmarks: {}
    };

    // Load APQC framework
    try {
      const apqcFramework = await this.dataManager.loadAPQCFramework();
      if (apqcFramework) {
        knowledge.apqcLoaded = true;
        knowledge.apqcCategories = apqcFramework.categories?.length || 0;
      }
    } catch (error) {
      console.warn('APQC framework not loaded:', error);
    }

    // Industry-specific patterns (can be extended with real data)
    const industryPatterns = {
      'Banking': { avgTransformationMonths: 18, successRate: 0.65, topRisks: ['Regulatory compliance', 'Data migration', 'Legacy system complexity'] },
      'Healthcare': { avgTransformationMonths: 24, successRate: 0.58, topRisks: ['Patient data security', 'Compliance', 'Interoperability'] },
      'Retail': { avgTransformationMonths: 12, successRate: 0.72, topRisks: ['Customer experience disruption', 'E-commerce integration', 'Supply chain'] },
      'Manufacturing': { avgTransformationMonths: 20, successRate: 0.60, topRisks: ['Production downtime', 'Supply chain integration', 'IoT complexity'] }
    };

    knowledge.industryBenchmarks = industryPatterns[engagement.segment] || industryPatterns['Retail'];

    return knowledge;
  }

  /**
   * Perform gap analysis (white-spot identification)
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async analyzeGaps(engagementId) {
    console.log('🔍 Starting gap analysis...');

    const engagement = this.engagementManager.getEngagement(engagementId);
    const capabilities = this.engagementManager.getCapabilities(engagementId);
    const applications = this.engagementManager.getApplications(engagementId);

    // Inject external knowledge
    const knowledge = await this.injectExternalKnowledge(engagement);

    // Prepare template data
    const promptData = {
      engagementName: engagement.name,
      customerName: engagement.customerName,
      industry: engagement.segment,
      theme: engagement.theme,
      capabilities: capabilities.map(c => ({
        name: c.name,
        level: c.level,
        maturity: c.maturity,
        targetMaturity: c.targetMaturity,
        strategicImportance: c.strategicImportance,
        supportedBy: c.supportedBy || []
      })),
      applications: applications.map(a => ({
        name: a.name,
        category: a.category,
        businessValue: a.businessValue,
        technicalFit: a.technicalFit
      })),
      apqcVersion: knowledge.apqcVersion
    };

    // Render prompt
    const prompt = await this.renderPrompt('gap_analysis_prompt', promptData);

    // Call AI
    const startTime = Date.now();
    const aiResponse = await this.callAI(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'json'
    });

    const duration = Date.now() - startTime;

    // Parse AI response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      analysis = { error: 'Failed to parse AI response', rawResponse: aiResponse };
    }

    // Log to audit trail
    this.logAICall({
      type: 'gap_analysis',
      engagementId,
      prompt: prompt.substring(0, 500) + '...',
      response: analysis,
      duration,
      confidence: analysis.overallConfidence || null,
      timestamp: new Date().toISOString()
    });

    // Store in conversation memory
    this.addToConversationMemory(engagementId, {
      type: 'gap_analysis',
      content: analysis,
      timestamp: new Date().toISOString()
    });

    return analysis;
  }

  /**
   * Identify risks
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async identifyRisks(engagementId) {
    console.log('⚠️ Starting risk identification...');

    const engagement = this.engagementManager.getEngagement(engagementId);
    const applications = this.engagementManager.getApplications(engagementId);
    const initiatives = this.engagementManager.getInitiatives(engagementId);
    const constraints = this.engagementManager.getConstraints(engagementId);

    const knowledge = await this.injectExternalKnowledge(engagement);

    const promptData = {
      engagementName: engagement.name,
      customerName: engagement.customerName,
      industry: engagement.segment,
      theme: engagement.theme,
      applications: applications.map(a => ({
        name: a.name,
        lifecycleStage: a.lifecycleStage,
        recommendation: a.recommendation,
        businessValue: a.businessValue
      })),
      initiatives: initiatives.map(i => ({
        name: i.name,
        timeHorizon: i.timeHorizon,
        effort: i.effort,
        dependencies: i.dependencies || []
      })),
      constraints: constraints.map(c => ({
        name: c.name,
        type: c.type,
        description: c.description
      }))
    };

    const prompt = await this.renderPrompt('risk_identification_prompt', promptData);

    const startTime = Date.now();
    const aiResponse = await this.callAI(prompt, {
      temperature: 0.7,
      maxTokens: 2500,
      responseFormat: 'json'
    });

    const duration = Date.now() - startTime;

    let riskAnalysis;
    try {
      riskAnalysis = JSON.parse(aiResponse);
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      riskAnalysis = { error: 'Failed to parse AI response', rawResponse: aiResponse };
    }

    this.logAICall({
      type: 'risk_identification',
      engagementId,
      prompt: prompt.substring(0, 500) + '...',
      response: riskAnalysis,
      duration,
      confidence: riskAnalysis.confidence || null,
      timestamp: new Date().toISOString()
    });

    this.addToConversationMemory(engagementId, {
      type: 'risk_identification',
      content: riskAnalysis,
      timestamp: new Date().toISOString()
    });

    return riskAnalysis;
  }

  /**
   * Recommend initiatives
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async recommendInitiatives(engagementId) {
    console.log('💡 Starting initiative recommendation...');

    const engagement = this.engagementManager.getEngagement(engagementId);
    const capabilities = this.engagementManager.getCapabilities(engagementId);
    const applications = this.engagementManager.getApplications(engagementId);
    const stakeholders = this.engagementManager.getStakeholders(engagementId);
    const constraints = this.engagementManager.getConstraints(engagementId);

    // Calculate capability gaps
    const capabilityGaps = capabilities
      .filter(c => c.targetMaturity > c.maturity)
      .map(c => ({
        capability: c.name,
        gap: c.targetMaturity - c.maturity,
        strategicImportance: c.strategicImportance,
        supportedBy: c.supportedBy || []
      }));

    const knowledge = await this.injectExternalKnowledge(engagement);

    const promptData = {
      engagementName: engagement.name,
      customerName: engagement.customerName,
      industry: engagement.segment,
      theme: engagement.theme,
      successCriteria: engagement.successCriteria || [],
      capabilityGaps,
      applications: applications.map(a => ({
        name: a.name,
        recommendation: a.recommendation,
        businessValue: a.businessValue,
        technicalFit: a.technicalFit
      })),
      stakeholders: stakeholders.map(s => ({
        name: s.name,
        role: s.role,
        priorities: s.priorities || [],
        painPoints: s.painPoints || []
      })),
      constraints: constraints.map(c => ({
        type: c.type,
        description: c.description
      }))
    };

    const prompt = await this.renderPrompt('initiative_recommendation_prompt', promptData);

    const startTime = Date.now();
    const aiResponse = await this.callAI(prompt, {
      temperature: 0.8,
      maxTokens: 3000,
      responseFormat: 'json'
    });

    const duration = Date.now() - startTime;

    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      recommendations = { error: 'Failed to parse AI response', rawResponse: aiResponse };
    }

    this.logAICall({
      type: 'initiative_recommendation',
      engagementId,
      prompt: prompt.substring(0, 500) + '...',
      response: recommendations,
      duration,
      confidence: recommendations.overallConfidence || null,
      timestamp: new Date().toISOString()
    });

    this.addToConversationMemory(engagementId, {
      type: 'initiative_recommendation',
      content: recommendations,
      timestamp: new Date().toISOString()
    });

    return recommendations;
  }

  /**
   * Generate value narratives
   * @param {string} engagementId
   * @param {string} targetAudience - 'executive', 'financial', 'technical', 'all'
   * @returns {Promise<object>}
   */
  async generateValueNarrative(engagementId, targetAudience = 'all') {
    console.log('📊 Generating value narrative...');

    const engagement = this.engagementManager.getEngagement(engagementId);
    const initiatives = this.engagementManager.getInitiatives(engagementId);
    const capabilities = this.engagementManager.getCapabilities(engagementId);
    const risks = this.engagementManager.getRisks(engagementId);

    const knowledge = await this.injectExternalKnowledge(engagement);

    const promptData = {
      engagementName: engagement.name,
      customerName: engagement.customerName,
      industry: engagement.segment,
      theme: engagement.theme,
      initiatives: initiatives.map(i => ({
        name: i.name,
        estimatedCost: i.estimatedCost || 0,
        estimatedValue: i.estimatedValue || 0,
        businessOutcomes: i.businessOutcomes || []
      })),
      capabilities: capabilities.map(c => ({
        name: c.name,
        maturity: c.maturity,
        targetMaturity: c.targetMaturity,
        strategicImportance: c.strategicImportance
      })),
      risks: risks.map(r => ({
        name: r.name,
        impact: r.impact,
        description: r.description
      })),
      targetAudience: targetAudience !== 'all' ? targetAudience : null
    };

    const prompt = await this.renderPrompt('value_narrative_prompt', promptData);

    const startTime = Date.now();
    const aiResponse = await this.callAI(prompt, {
      temperature: 0.7,
      maxTokens: 2500,
      responseFormat: 'json'
    });

    const duration = Date.now() - startTime;

    let narrative;
    try {
      narrative = JSON.parse(aiResponse);
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      narrative = { error: 'Failed to parse AI response', rawResponse: aiResponse };
    }

    this.logAICall({
      type: 'value_narrative',
      engagementId,
      targetAudience,
      prompt: prompt.substring(0, 500) + '...',
      response: narrative,
      duration,
      confidence: narrative.confidence || null,
      timestamp: new Date().toISOString()
    });

    this.addToConversationMemory(engagementId, {
      type: 'value_narrative',
      content: narrative,
      timestamp: new Date().toISOString()
    });

    return narrative;
  }

  /**
   * Generate step-specific checklist
   * @param {string} stepId - E.g., 'E0.1', 'E1.3'
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async generateStepChecklist(stepId, engagementId) {
    console.log(`📋 Generating checklist for step ${stepId}...`);

    const engagement = this.engagementManager.getEngagement(engagementId);
    const step = this.workflowEngine.getStepDefinition(stepId);

    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow`);
    }

    const promptData = {
      stepId,
      stepName: step.name,
      stepDescription: step.description || '',
      stepObjectives: step.objectives || [],
      engagementName: engagement.name,
      industry: engagement.segment || 'General',
      complexityLevel: this.assessEngagementComplexity(engagement),
      applicationCount: this.engagementManager.getApplications(engagementId).length,
      capabilityCount: this.engagementManager.getCapabilities(engagementId).length,
      stakeholderCount: this.engagementManager.getStakeholders(engagementId).length,
      initiativeCount: this.engagementManager.getInitiatives(engagementId).length
    };

    const prompt = await this.renderPrompt('checklist_generation_prompt', promptData);

    const startTime = Date.now();
    const aiResponse = await this.callAI(prompt, {
      temperature: 0.6,
      maxTokens: 2000,
      responseFormat: 'json'
    });

    const duration = Date.now() - startTime;

    let checklist;
    try {
      checklist = JSON.parse(aiResponse);
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      checklist = { error: 'Failed to parse AI response', rawResponse: aiResponse };
    }

    this.logAICall({
      type: 'checklist_generation',
      engagementId,
      stepId,
      prompt: prompt.substring(0, 500) + '...',
      response: checklist,
      duration,
      confidence: checklist.confidence || null,
      timestamp: new Date().toISOString()
    });

    return checklist;
  }

  /**
   * Assess engagement complexity
   * @param {object} engagement
   * @returns {string} - 'low', 'medium', 'high'
   */
  assessEngagementComplexity(engagement) {
    // Simple heuristic based on data volume
    const appCount = this.engagementManager.getApplications(engagement.id).length;
    const capCount = this.engagementManager.getCapabilities(engagement.id).length;
    const stakeholderCount = this.engagementManager.getStakeholders(engagement.id).length;

    const totalEntities = appCount + capCount + stakeholderCount;

    if (totalEntities < 20) return 'low';
    if (totalEntities < 50) return 'medium';
    return 'high';
  }

  /**
   * Call Azure OpenAI Proxy
   * @param {string} prompt
   * @param {object} options
   * @returns {Promise<string>}
   */
  async callAI(prompt, options = {}) {
    if (!this.aiProxy) {
      throw new Error('AzureOpenAIProxy not initialized');
    }

    const systemPrompt = 'You are an expert Enterprise Architect with deep knowledge of TOGAF, APQC frameworks, business transformation, and technology modernization. Provide structured, data-driven analysis with confidence scores and source citations.';

    try {
      const response = await this.aiProxy.createChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ AI call failed:', error);
      throw error;
    }
  }

  /**
   * Log AI call to audit trail
   * @param {object} logEntry
   */
  logAICall(logEntry) {
    this.auditLog.push(logEntry);
    console.log(`📝 AI Call logged: ${logEntry.type} (${logEntry.duration}ms, confidence: ${logEntry.confidence}%)`);
  }

  /**
   * Get audit trail
   * @param {string} engagementId - Optional filter by engagement
   * @returns {Array}
   */
  getAuditTrail(engagementId = null) {
    if (engagementId) {
      return this.auditLog.filter(entry => entry.engagementId === engagementId);
    }
    return this.auditLog;
  }

  /**
   * Add to conversation memory
   * @param {string} engagementId
   * @param {object} entry
   */
  addToConversationMemory(engagementId, entry) {
    if (!this.conversationMemory.has(engagementId)) {
      this.conversationMemory.set(engagementId, []);
    }
    this.conversationMemory.get(engagementId).push(entry);
    
    // Keep only last 10 entries per engagement
    const memory = this.conversationMemory.get(engagementId);
    if (memory.length > 10) {
      memory.shift();
    }
  }

  /**
   * Get conversation memory for engagement
   * @param {string} engagementId
   * @returns {Array}
   */
  getConversationMemory(engagementId) {
    return this.conversationMemory.get(engagementId) || [];
  }

  /**
   * Clear conversation memory
   * @param {string} engagementId - Optional, clear all if not provided
   */
  clearConversationMemory(engagementId = null) {
    if (engagementId) {
      this.conversationMemory.delete(engagementId);
    } else {
      this.conversationMemory.clear();
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_AIOrchestrator = EA_AIOrchestrator;
}
