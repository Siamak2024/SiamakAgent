/**
 * StandardStrategy.js - Mode1 (Standard) strategy implementation
 * 
 * Implements the 7-step EA workflow with interactive Q&A
 * Delegates to existing Step1-7 modules
 * 
 * @implements {ModeStrategy}
 */

// Import existing Step modules
const Step1 = (typeof require !== 'undefined') ? null : window.Step1;
const Step2 = (typeof require !== 'undefined') ? null : window.Step2;
const Step3 = (typeof require !== 'undefined') ? null : window.Step3;
const Step4 = (typeof require !== 'undefined') ? null : window.Step4;
const Step5 = (typeof require !== 'undefined') ? null : window.Step5;
const Step6 = (typeof require !== 'undefined') ? null : window.Step6;
const Step7 = (typeof require !== 'undefined') ? null : window.Step7;

// Browser/Node.js compatibility for ModeStrategy base class
const _ModeStrategy = (function() {
  if (typeof window !== 'undefined' && window.ModeStrategy) {
    return window.ModeStrategy;
  } else if (typeof require !== 'undefined') {
    return require('../Platform/ModeStrategy.js');
  }
  throw new Error('ModeStrategy not found');
})();

/**
 * StandardStrategy - Implements Mode1 (7-step diagnostic workflow)
 */
class StandardStrategy extends _ModeStrategy {
  
  constructor() {
    super();
    
    // Step module registry
    // In test environment, modules may be null - provide defaults
    this.stepModules = {
      step1: Step1 || this._createDefaultStep('step1'),
      step2: Step2 || this._createDefaultStep('step2'),
      step3: Step3 || this._createDefaultStep('step3'),
      step4: Step4 || this._createDefaultStep('step4'),
      step5: Step5 || this._createDefaultStep('step5'),
      step6: Step6 || this._createDefaultStep('step6'),
      step7: Step7 || this._createDefaultStep('step7')
    };
  }
  
  /**
   * Get strategy name
   * @returns {string} Strategy name
   */
  getName() {
    return 'Standard Mode';
  }
  
  /**
   * Get step module definition
   * @param {string} stepId - Step ID (e.g., 'step1')
   * @returns {object} Step module definition
   */
  getStep(stepId) {
    const stepModule = this.stepModules[stepId];
    
    if (!stepModule) {
      throw new Error(`[StandardStrategy] Step "${stepId}" not found`);
    }
    
    // If stepModule is a function (class), instantiate it
    if (typeof stepModule === 'function') {
      return new stepModule();
    }
    
    // Otherwise, return the module directly (object or default step)
    return stepModule;
  }
  
  /**
   * Execute a task
   * @param {object} taskDef - Task definition
   * @param {object} ctx - Execution context
   * @param {object} stepEngine - StepEngine instance
   * @returns {Promise<object>} Task result
   */
  async executeTask(taskDef, ctx, stepEngine) {
    const { type, taskId } = taskDef;
    
    // Handle different task types
    switch (type) {
      case 'question':
        return await this._executeQuestionTask(taskDef, ctx);
        
      case 'text-input':
        return await this._executeTextInputTask(taskDef, ctx);
        
      case 'custom-ui':
        return await this._executeCustomUITask(taskDef, ctx);
        
      case 'internal':
        return await this._executeInternalTask(taskDef, ctx);
        
      default:
        throw new Error(`[StandardStrategy] Unknown task type: ${type}`);
    }
  }
  
  /**
   * Synthesize step output
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
   * Apply step output to model
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
   * Optional hook after step completion
   * @param {string} stepId - Step ID
   * @param {object} model - Updated model
   */
  onStepComplete(stepId, model) {
    // Optional: Log, analytics, notifications
    console.log(`[StandardStrategy] Step ${stepId} completed`);
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
   * Execute question task (user interaction)
   */
  async _executeQuestionTask(taskDef, ctx) {
    const { taskId, question, options, title, guidance, wrapAnswer } = taskDef;
    
    // Simulate user answer (in real implementation, use QuestionCardMode1)
    const mockAnswer = options ? options[0] : 'Mock answer';
    
    // Apply wrapAnswer if provided
    let output;
    if (wrapAnswer && typeof wrapAnswer === 'function') {
      output = wrapAnswer(mockAnswer, ctx);
    } else {
      output = { userAnswer: mockAnswer };
    }
    
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
    const { taskId, prompt, wrapAnswer } = taskDef;
    
    // Simulate user text input
    const mockAnswer = 'Mock text input';
    
    // Apply wrapAnswer if provided
    let output;
    if (wrapAnswer && typeof wrapAnswer === 'function') {
      output = wrapAnswer(mockAnswer, ctx);
    } else {
      output = { [taskId]: mockAnswer };
    }
    
    return {
      taskId,
      output,
      aiResult: null
    };
  }
  
  /**
   * Execute custom UI task (validation, etc.)
   */
  async _executeCustomUITask(taskDef, ctx) {
    const { taskId } = taskDef;
    
    // Simulate validation confirmation
    const output = { confirmed: true };
    
    return {
      taskId,
      output,
      aiResult: null
    };
  }
  
  /**
   * Execute internal AI task
   */
  async _executeInternalTask(taskDef, ctx) {
    const { taskId, instruction, taskType } = taskDef;
    
    // Simulate AI generation (in real implementation, use AIServiceMode1)
    const mockAIResult = {
      rawOutput: JSON.stringify({ generated: true, taskId })
    };
    
    const output = JSON.parse(mockAIResult.rawOutput);
    
    return {
      taskId,
      output,
      aiResult: mockAIResult
    };
  }
  
  /**
   * Default synthesize implementation
   */
  _defaultSynthesize(stepId, ctx) {
    return {
      stepId,
      synthesized: true,
      answers: ctx.answers || {}
    };
  }
  
  /**
   * Default apply output implementation
   */
  _defaultApplyOutput(stepId, output, model) {
    return {
      ...model,
      [stepId + 'Output']: output
    };
  }
  
  /**
   * Get step name by ID
   */
  _getStepName(stepId) {
    const names = {
      step1: 'Business Context & Objectives',
      step2: 'APQC Capability Mapping',
      step3: 'Capability Architecture',
      step4: 'Operating Model',
      step5: 'Benchmarking',
      step6: 'Gap Analysis',
      step7: 'Roadmap'
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
  module.exports = StandardStrategy;
}

// Browser global export
if (typeof window !== 'undefined') {
  window.StandardStrategy = StandardStrategy;
}
