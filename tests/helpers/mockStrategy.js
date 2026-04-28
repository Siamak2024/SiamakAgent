/**
 * mockStrategy.js - Test helper for creating mock strategy implementations
 * 
 * Provides factory functions for creating mock strategies with configurable behavior
 */

/**
 * Create a basic mock strategy
 * @param {object} config - Configuration options
 * @returns {object} Mock strategy instance
 */
function createMockStrategy(config = {}) {
  const {
    name = 'MockStrategy',
    step = {},
    taskOutputs = [],
    synthesizeOutput = {},
    applyOutputFn = null
  } = config;
  
  const mockStrategy = {
    // ModeStrategy interface methods
    getName: jest.fn(() => name),
    
    getStep: jest.fn((stepId) => ({
      id: stepId,
      name: step.name || `Mock ${stepId}`,
      tasks: step.tasks || [],
      dependsOn: step.dependsOn || [],
      synthesize: step.synthesize || jest.fn(() => synthesizeOutput),
      applyOutput: step.applyOutput || jest.fn((output, model) => ({ 
        ...model, 
        [stepId]: output 
      }))
    })),
    
    executeTask: jest.fn(async (taskDef, ctx, stepEngine) => {
      // Find configured output for this task
      const configured = taskOutputs.find(t => t.taskId === taskDef.taskId);
      
      if (configured) {
        return {
          taskId: taskDef.taskId,
          output: configured.output,
          aiResult: configured.aiResult || null
        };
      }
      
      // Default behavior: return empty output
      return {
        taskId: taskDef.taskId,
        output: { [taskDef.taskId]: 'mock-answer' },
        aiResult: null
      };
    }),
    
    synthesize: jest.fn((stepId, ctx) => {
      if (typeof synthesizeOutput === 'function') {
        return synthesizeOutput(ctx);
      }
      return synthesizeOutput;
    }),
    
    applyOutput: jest.fn((stepId, output, model) => {
      if (applyOutputFn) {
        return applyOutputFn(stepId, output, model);
      }
      return {
        ...model,
        [stepId + 'Output']: output
      };
    }),
    
    onStepComplete: jest.fn()
  };
  
  return mockStrategy;
}

/**
 * Create a strategy that simulates task failures
 * @param {string} failingTaskId - Task ID that should fail
 * @param {Error} error - Error to throw
 * @returns {object} Mock strategy
 */
function createFailingStrategy(failingTaskId, error) {
  return createMockStrategy({
    name: 'FailingStrategy',
    step: {
      tasks: [
        { taskId: 'task1' },
        { taskId: failingTaskId },
        { taskId: 'task2' }
      ]
    },
    taskOutputs: [
      { taskId: 'task1', output: { result: 'ok' } }
    ]
  }).executeTask = jest.fn(async (taskDef) => {
    if (taskDef.taskId === failingTaskId) {
      throw error;
    }
    return {
      taskId: taskDef.taskId,
      output: { result: 'ok' },
      aiResult: null
    };
  });
}

/**
 * Create a strategy with conditional task execution
 * @param {object} config - Configuration
 * @returns {object} Mock strategy
 */
function createConditionalStrategy(config = {}) {
  const {
    tasks = [],
    shouldRunConditions = {}
  } = config;
  
  const tasksWithConditions = tasks.map(t => ({
    ...t,
    shouldRun: shouldRunConditions[t.taskId] || (() => true)
  }));
  
  return createMockStrategy({
    step: { tasks: tasksWithConditions }
  });
}

/**
 * Create spy wrappers for a strategy
 * @param {object} strategy - Strategy to wrap
 * @returns {object} Spies for each method
 */
function createStrategySpies(strategy) {
  return {
    getName: jest.spyOn(strategy, 'getName'),
    getStep: jest.spyOn(strategy, 'getStep'),
    executeTask: jest.spyOn(strategy, 'executeTask'),
    synthesize: jest.spyOn(strategy, 'synthesize'),
    applyOutput: jest.spyOn(strategy, 'applyOutput'),
    onStepComplete: strategy.onStepComplete ? jest.spyOn(strategy, 'onStepComplete') : null
  };
}

// CommonJS exports
module.exports = {
  createMockStrategy,
  createFailingStrategy,
  createConditionalStrategy,
  createStrategySpies
};
