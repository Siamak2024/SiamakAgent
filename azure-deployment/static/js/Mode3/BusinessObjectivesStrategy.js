/**
 * BusinessObjectivesStrategy.js - Mode3 (Business Objectives) strategy implementation
 * 
 * Implements outcome-focused workflow with streamlined Q&A (max 3 questions per step)
 * Supports enrichment, skip support questions, and objective traceability
 * 
 * @implements {ModeStrategy}
 */

// Import ModeStrategy base class
const ModeStrategy = (typeof require !== 'undefined') 
  ? require('../Platform/ModeStrategy.js') 
  : window.ModeStrategy;

/**
 * BusinessObjectivesStrategy - Implements Mode3 (Outcome-focused workflow)
 */
class BusinessObjectivesStrategy extends ModeStrategy {
  
  constructor() {
    super();
    
    // Maximum questions per step
    this.MAX_QUESTIONS_PER_STEP = 3;
    
    // Step module registry (will use defaults for now)
    this.stepModules = {
      step1: this._createDefaultStep('step1'),
      step2: this._createDefaultStep('step2'),
      step3: this._createDefaultStep('step3'),
      step4: this._createDefaultStep('step4'),
      step5: this._createDefaultStep('step5'),
      step6: this._createDefaultStep('step6'),
      step7: this._createDefaultStep('step7')
    };
  }
  
  /**
   * Get strategy name
   * @returns {string} Strategy name
   */
  getName() {
    return 'Business Objectives Mode';
  }
  
  /**
   * Get step module definition
   * @param {string} stepId - Step ID (e.g., 'step1')
   * @returns {object} Step module definition
   */
  getStep(stepId) {
    const stepModule = this.stepModules[stepId];
    
    if (!stepModule) {
      throw new Error(`[BusinessObjectivesStrategy] Step "${stepId}" not found`);
    }
    
    // If stepModule is a function (class), instantiate it
    if (typeof stepModule === 'function') {
      return new stepModule();
    }
    
    // Otherwise, return the module directly
    return stepModule;
  }
  
  /**
   * Execute a task with objective context
   * @param {object} taskDef - Task definition
   * @param {object} ctx - Execution context
   * @param {object} stepEngine - StepEngine instance
   * @returns {Promise<object>} Task result
   */
  async executeTask(taskDef, ctx, stepEngine) {
    const { type, taskId } = taskDef;
    
    // Handle different task types with objective focus
    switch (type) {
      case 'question':
        return await this._executeQuestionTask(taskDef, ctx);
        
      case 'text-input':
        return await this._executeTextInputTask(taskDef, ctx);
        
      case 'enrichment':
        return await this._executeEnrichmentTask(taskDef, ctx);
        
      case 'custom-ui':
        return await this._executeCustomUITask(taskDef, ctx);
        
      case 'internal':
        return await this._executeInternalTask(taskDef, ctx);
        
      default:
        throw new Error(`[BusinessObjectivesStrategy] Unknown task type: ${type}`);
    }
  }
  
  /**
   * Synthesize step output with objective traceability
   * @param {string} stepId - Step ID
   * @param {object} ctx - Context with answers
   * @returns {object} Synthesized output
   */
  synthesize(stepId, ctx) {
    const stepModule = this.getStep(stepId);
    
    if (stepModule && typeof stepModule.synthesize === 'function') {
      return stepModule.synthesize(ctx);
    }
    
    return this._defaultSynthesize(stepId, ctx);
  }
  
  /**
   * Apply step output to model with objective links
   * @param {string} stepId - Step ID
   * @param {object} output - Step output
   * @param {object} model - Current model
   * @returns {object} Updated model
   */
  applyOutput(stepId, output, model) {
    const stepModule = this.getStep(stepId);
    
    if (stepModule && typeof stepModule.applyOutput === 'function') {
      return stepModule.applyOutput(output, model);
    }
    
    return this._defaultApplyOutput(stepId, output, model);
  }
  
  /**
   * Optional hook after step completion - validate objective coverage
   * @param {string} stepId - Step ID
   * @param {object} model - Updated model
   */
  onStepComplete(stepId, model) {
    console.log(`[BusinessObjectivesStrategy] Step ${stepId} completed`);
    
    // Validate objective coverage
    if (model.businessObjectives && Array.isArray(model.businessObjectives)) {
      const unlinked = model.businessObjectives.filter(obj => !obj.linked);
      if (unlinked.length > 0) {
        console.warn(`[BusinessObjectivesStrategy] ${unlinked.length} objectives not yet linked to capabilities`);
      }
    }
  }
  
  /**
   * Enrich content from web sources
   * @param {string} query - Search query
   * @returns {Promise<object>} Enrichment data
   */
  async enrichFromWeb(query) {
    // Simulate web enrichment
    return {
      query,
      sources: [
        { title: 'Best Practice Guide', url: 'https://example.com/guide' }
      ],
      insights: [
        'Industry trend: Digital transformation adoption increased by 40%'
      ]
    };
  }
  
  /**
   * Enrich content from organization profile
   * @param {object} model - Current model
   * @returns {Promise<object>} Enrichment data
   */
  async enrichFromProfile(model) {
    const profile = model.organizationProfile || {};
    
    return {
      industry: profile.industry || 'Generic',
      priorities: profile.strategicPriorities || [],
      challenges: profile.challenges || []
    };
  }
  
  /**
   * Merge enriched data with generated content
   * @param {object} baseContent - Base generated content
   * @param {object} enrichedData - Enriched data to merge
   * @returns {object} Merged content
   */
  mergeEnrichment(baseContent, enrichedData) {
    return {
      ...baseContent,
      enrichment: enrichedData,
      enriched: true
    };
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ──────────────────────────────────────────────────────────────────────────
  
  /**
   * Create a default step module (for testing or when modules unavailable)
   */
  _createDefaultStep(stepId) {
    return {
      id: stepId,
      name: this._getStepName(stepId),
      tasks: [],
      dependsOn: this._getStepDependencies(stepId),
      synthesize: (ctx) => this._defaultSynthesize(stepId, ctx),
      applyOutput: (output, model) => this._defaultApplyOutput(stepId, output, model)
    };
  }
  
  /**
   * Execute question task (with skip support)
   */
  async _executeQuestionTask(taskDef, ctx) {
    const { taskId, question, options, skippable, category } = taskDef;
    
    // Support questions can be skipped
    const canSkip = skippable || category === 'support';
    
    // Simulate user answer (in real implementation, use QuestionCardMode3)
    const mockAnswer = options ? options[0] : 'Mock answer';
    
    // Simulate skip for support questions
    const isSkipped = canSkip && category === 'support';
    
    const output = isSkipped 
      ? { skipped: true }
      : { userAnswer: mockAnswer };
    
    return {
      taskId,
      output,
      aiResult: null
    };
  }
  
  /**
   * Execute text input task
   */
  async _executeTextInputTask(taskDef, ctx) {
    const { taskId } = taskDef;
    
    // Simulate user text input
    const mockAnswer = 'Mock text input';
    
    return {
      taskId,
      output: { [taskId]: mockAnswer },
      aiResult: null
    };
  }
  
  /**
   * Execute enrichment task (web search, data augmentation)
   */
  async _executeEnrichmentTask(taskDef, ctx) {
    const { taskId, source = 'web' } = taskDef;
    
    // Extract business objectives for enrichment context
    const objectives = ctx.businessObjectives || [];
    
    let enrichmentData;
    if (source === 'web') {
      const query = objectives.map(obj => obj.title).join(' ');
      enrichmentData = await this.enrichFromWeb(query);
    } else if (source === 'profile') {
      enrichmentData = await this.enrichFromProfile(ctx.model || {});
    } else {
      enrichmentData = { source, data: 'enriched' };
    }
    
    return {
      taskId,
      output: enrichmentData,
      aiResult: null
    };
  }
  
  /**
   * Execute custom UI task (with objective context)
   */
  async _executeCustomUITask(taskDef, ctx) {
    const { taskId } = taskDef;
    
    // Simulate validation confirmation
    const output = { confirmed: true, objectives: ctx.businessObjectives || [] };
    
    return {
      taskId,
      output,
      aiResult: null
    };
  }
  
  /**
   * Execute internal AI task (with objective injection)
   */
  async _executeInternalTask(taskDef, ctx) {
    const { taskId, instruction, taskType } = taskDef;
    
    // Inject business objectives into AI context
    const objectives = ctx.businessObjectives || [];
    const objectiveContext = objectives.map(obj => 
      `Objective: ${obj.title || obj} (Priority: ${obj.priority || 'medium'})`
    ).join('\n');
    
    // Simulate AI generation with objective focus
    const mockAIResult = {
      rawOutput: JSON.stringify({
        taskId,
        generated: true,
        objectivesConsidered: objectives.length,
        objectiveContext,
        result: `Generated with ${objectives.length} objectives in context`
      })
    };
    
    const output = JSON.parse(mockAIResult.rawOutput);
    
    return {
      taskId,
      output,
      aiResult: mockAIResult
    };
  }
  
  /**
   * Default synthesize implementation (with objective traceability)
   */
  _defaultSynthesize(stepId, ctx) {
    return {
      stepId,
      synthesized: true,
      objectiveTraceability: true,
      objectives: ctx.businessObjectives || [],
      answers: ctx.answers || {}
    };
  }
  
  /**
   * Default apply output implementation (preserve objective links)
   */
  _defaultApplyOutput(stepId, output, model) {
    return {
      ...model,
      [stepId + 'Output']: output,
      // Preserve objective traceability
      businessObjectives: model.businessObjectives || []
    };
  }
  
  /**
   * Get step name by ID
   */
  _getStepName(stepId) {
    const names = {
      step1: 'Business Objectives',
      step2: 'Objective-Aligned Capabilities',
      step3: 'Capability-Objective Mapping',
      step4: 'Outcome-Focused Operating Model',
      step5: 'Objective Benchmarking',
      step6: 'Objective Gap Analysis',
      step7: 'Objective-Driven Roadmap'
    };
    return names[stepId] || stepId;
  }
  
  /**
   * Get step dependencies
   */
  _getStepDependencies(stepId) {
    const dependencies = {
      step1: [],
      step2: ['step1'],
      step3: ['step1', 'step2'],
      step4: ['step1', 'step2', 'step3'],
      step5: ['step1', 'step2', 'step3', 'step4'],
      step6: ['step1', 'step2', 'step3', 'step4', 'step5'],
      step7: ['step1', 'step2', 'step3', 'step4', 'step5', 'step6']
    };
    return dependencies[stepId] || [];
  }
}

// ──────────────────────────────────────────────────────────────────────────
// EXPORTS
// ──────────────────────────────────────────────────────────────────────────

// CommonJS export (for Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessObjectivesStrategy;
}

// Browser global export
if (typeof window !== 'undefined') {
  window.BusinessObjectivesStrategy = BusinessObjectivesStrategy;
}
