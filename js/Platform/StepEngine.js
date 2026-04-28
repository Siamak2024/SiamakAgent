/**
 * StepEngine.js — Platform service for EA workflow orchestration.
 * 
 * This is a mode-agnostic orchestration engine that manages the execution
 * of workflow steps. It delegates mode-specific behavior to ModeStrategy
 * implementations using the Strategy Pattern.
 * 
 * Key responsibilities:
 * - Task execution orchestration
 * - Context management
 * - State tracking & snapshots
 * - Validation & rollback
 * - Dependency management
 * 
 * The StepEngine is configured with a strategy before use. Each mode
 * (Standard, Autopilot, Business Objectives) provides its own strategy
 * implementation that defines how tasks are executed, synthesized, and applied.
 * 
 * @module StepEngine
 */

const StepEngine = (() => {

  // Current active strategy
  let _currentStrategy = null;

  /**
   * Configure StepEngine with a mode strategy.
   * 
   * This must be called before running any steps. The strategy determines
   * how tasks are executed, how output is synthesized, and how the model
   * is updated.
   * 
   * @param {ModeStrategy} strategy - Mode-specific strategy implementation
   * @throws {Error} If strategy is invalid or doesn't implement required methods
   */
  function configure(strategy) {
    // Validate strategy object
    if (!strategy || typeof strategy !== 'object') {
      throw new Error('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    }
    
    // Check required methods
    const requiredMethods = ['getName', 'getStep', 'executeTask', 'synthesize', 'applyOutput'];
    for (const method of requiredMethods) {
      if (typeof strategy[method] !== 'function') {
        throw new Error('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
      }
    }
    
    _currentStrategy = strategy;
    console.log(`[StepEngine] Configured with strategy: ${strategy.getName()}`);
  }

  /**
   * Run a workflow step using the configured strategy.
   * 
   * Executes all tasks in the step, synthesizes the output, and updates the model.
   * Tasks are executed sequentially. Each task's output is merged into the context
   * for subsequent tasks.
   * 
   * @param {string} stepId - Step identifier (e.g., 'step1')
   * @param {object} userInput - User-provided input (optional)
   * @param {object} model - Current model state
   * @returns {Promise<object>} Updated model
   * @throws {Error} If no strategy configured, step not found, dependencies not met, or task execution fails
   */
  async function run(stepId, userInput, model) {
    // Validate strategy is configured
    if (!_currentStrategy) {
      throw new Error('[StepEngine] No strategy configured. Call StepEngine.configure(strategy) first.');
    }

    console.log(`[StepEngine] Running ${stepId} with ${_currentStrategy.getName()} strategy`);

    // 1. Get step module from strategy
    const stepModule = _currentStrategy.getStep(stepId);
    if (!stepModule) {
      throw new Error(`[StepEngine] Step module "${stepId}" not found in ${_currentStrategy.getName()} strategy`);
    }

    // 2. Validate dependencies
    _validateDependencies(stepId, model, stepModule);

    // 3. Build context using StepContext if available, otherwise create basic context
    let ctx;
    if (typeof window !== 'undefined' && window.StepContext && typeof window.StepContext.build === 'function') {
      ctx = window.StepContext.build(stepId, model);
    } else {
      // Fallback context construction
      ctx = {
        stepId,
        model,
        organizationProfile: model.organizationProfile || null,
        businessContext: model.businessContext || null,
        strategicIntent: model.strategicIntent || null,
        bmc: model.bmc || null,
        capabilities: model.capabilities || [],
        capabilityMap: model.capabilityMap || null
      };
    }
    
    ctx = { ...ctx, answers: {}, stepId, userInput };

    // 4. Initialize step state (snapshot for rollback)
    const existingStep = model.steps?.[stepId];
    const snapshot = existingStep?.output ? JSON.parse(JSON.stringify(existingStep.output)) : null;
    
    let workingModel = {
      ...model,
      steps: {
        ...(model.steps || {}),
        [stepId]: {
          id: stepId,
          name: stepModule.name || stepId,
          status: 'in-progress',
          startedAt: new Date().toISOString(),
          completedTasks: [],
          answers: {},
          output: null,
          versions: [
            ...(existingStep?.versions || []),
            ...(snapshot ? [{ timestamp: new Date().toISOString(), output: snapshot }] : [])
          ]
        }
      }
    };

    // 5. Execute tasks via strategy
    const tasks = stepModule.tasks || [];
    for (let i = 0; i < tasks.length; i++) {
      const taskDef = tasks[i];

      // Check if task should run
      if (taskDef.shouldRun && typeof taskDef.shouldRun === 'function') {
        if (!taskDef.shouldRun(ctx)) {
          console.log(`[StepEngine] Skipping task ${taskDef.taskId} (shouldRun condition not met)`);
          continue;
        }
      }

      let taskResult;
      try {
        // Delegate task execution to strategy
        taskResult = await _currentStrategy.executeTask(taskDef, ctx, StepEngine);
      } catch (err) {
        console.error(`[StepEngine] Task ${taskDef.taskId} failed:`, err);
        
        // Mark step as error
        workingModel.steps[stepId].status = 'error';
        workingModel.steps[stepId].error = err.message;
        
        // Auto-save if possible
        if (typeof autoSaveCurrentModel === 'function') {
          Object.assign(window.model || {}, workingModel);
          autoSaveCurrentModel();
        }
        
        throw err;
      }

      // Merge task output into context
      ctx = { 
        ...ctx, 
        ...taskResult.output, 
        answers: { 
          ...ctx.answers, 
          [taskDef.taskId]: taskResult.output 
        } 
      };

      // Record task completion
      workingModel.steps[stepId].completedTasks.push(taskDef.taskId);
      workingModel.steps[stepId].answers[taskDef.taskId] = taskResult.output;

      // Auto-save after each task if possible
      if (typeof autoSaveCurrentModel === 'function') {
        Object.assign(window.model || {}, workingModel);
        autoSaveCurrentModel();
      }
    }

    // 6. Synthesize final output via strategy
    let finalOutput;
    try {
      finalOutput = _currentStrategy.synthesize(stepId, ctx);
    } catch (err) {
      throw new Error(`[StepEngine] Synthesis failed: ${err.message}`);
    }

    // 7. Apply output to model via strategy
    let newModel;
    try {
      newModel = _currentStrategy.applyOutput(stepId, finalOutput, workingModel);
    } catch (err) {
      throw new Error(`[StepEngine] Apply output failed: ${err.message}`);
    }

    // Mark step as completed
    newModel = {
      ...newModel,
      steps: {
        ...newModel.steps,
        [stepId]: {
          ...newModel.steps[stepId],
          status: 'completed',
          completedAt: new Date().toISOString(),
          output: finalOutput
        }
      }
    };

    // 8. Update global model, persist, render
    if (typeof window !== 'undefined' && typeof window.model !== 'undefined') {
      Object.assign(window.model, newModel);
    }
    
    if (typeof autoSaveCurrentModel === 'function') {
      autoSaveCurrentModel();
    }
    
    if (typeof updateWorkflowStepStates === 'function') {
      updateWorkflowStepStates();
    }

    // Call strategy hook for post-completion actions
    if (_currentStrategy.onStepComplete && typeof _currentStrategy.onStepComplete === 'function') {
      _currentStrategy.onStepComplete(stepId, newModel);
    }

    console.log(`[StepEngine] Completed ${stepId}`);
    return newModel;
  }

  /**
   * Validate that step dependencies are met.
   * 
   * @private
   * @param {string} stepId - Step being validated
   * @param {object} model - Current model state
   * @param {object} stepModule - Step module definition
   * @throws {Error} If dependencies are not met
   */
  function _validateDependencies(stepId, model, stepModule) {
    const dependsOn = stepModule.dependsOn || [];
    
    for (const depId of dependsOn) {
      const dep = model.steps?.[depId];
      if (!dep || dep.status !== 'completed') {
        throw new Error(`[StepEngine] ${stepId} requires "${depId}" to be completed first.`);
      }
    }
  }

  /**
   * Rollback a step to its previous version snapshot.
   * 
   * Restores the step's output to the most recent version in the versions array.
   * The restored version is removed from the versions array.
   * 
   * @param {string} stepId - Step identifier
   * @param {object} model - Current model state
   * @returns {object} Updated model with rolled back step
   * @throws {Error} If no strategy configured
   */
  function rollback(stepId, model) {
    // Validate strategy is configured
    if (!_currentStrategy) {
      throw new Error('[StepEngine] No strategy configured.');
    }

    const versions = model.steps?.[stepId]?.versions || [];
    
    if (!versions.length) {
      console.warn(`[StepEngine] No versions to roll back to for ${stepId}`);
      return model;
    }

    // Get the most recent version
    const prev = versions[versions.length - 1];
    
    // Create new model with restored output
    const newModel = {
      ...model,
      steps: {
        ...model.steps,
        [stepId]: {
          ...model.steps[stepId],
          output: prev.output,
          status: 'completed',
          versions: versions.slice(0, -1) // Remove restored version
        }
      }
    };

    // Re-apply via strategy to update model properties
    const restored = _currentStrategy.applyOutput(stepId, prev.output, newModel);
    
    // Update global model if available
    if (typeof window !== 'undefined' && window.model) {
      Object.assign(window.model, restored);
    }
    
    if (typeof autoSaveCurrentModel === 'function') {
      autoSaveCurrentModel();
    }

    console.log(`[StepEngine] Rolled back ${stepId} to version from ${prev.timestamp}`);
    return restored;
  }

  /**
   * Reset StepEngine state (for testing purposes).
   * 
   * @private
   */
  function _reset() {
    _currentStrategy = null;
  }

  // Public API
  return { 
    configure, 
    run, 
    rollback,
    _reset // Expose for testing
  };

})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StepEngine;
}

// Also make available globally for browser usage
if (typeof window !== 'undefined') {
  window.StepEngine = StepEngine;
}
