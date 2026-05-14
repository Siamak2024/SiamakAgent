/**
 * ModeStrategy.js — Interface for workflow mode strategies.
 * 
 * Each workflow mode (Standard, Autopilot, Business Objectives) implements
 * this interface to provide mode-specific behavior to the StepEngine.
 * 
 * This is an abstract base class that enforces a contract for all mode strategies.
 * All methods except onStepComplete() must be implemented by concrete strategies.
 * 
 * @abstract
 * @class ModeStrategy
 */

class ModeStrategy {
  
  /**
   * Get the mode name (for logging/debugging).
   * 
   * @abstract
   * @returns {string} Mode name
   * @throws {Error} If not implemented by subclass
   */
  getName() {
    throw new Error('ModeStrategy.getName() must be implemented');
  }

  /**
   * Get the step module for a given step ID.
   * 
   * @abstract
   * @param {string} stepId - Step identifier (e.g., 'step1')
   * @returns {object} Step module with tasks[], synthesize(), applyOutput()
   * @throws {Error} If not implemented by subclass
   */
  getStep(stepId) {
    throw new Error('ModeStrategy.getStep() must be implemented');
  }

  /**
   * Execute a task using mode-specific logic.
   * 
   * This method is called by StepEngine for each task in a step's task list.
   * The strategy determines how to execute the task based on its type:
   * - question: Show UI to collect user input
   * - internal: Call AI service for generation
   * - custom-ui: Show custom validation or interactive UI
   * - etc.
   * 
   * @abstract
   * @param {object} taskDef - Task definition
   * @param {string} taskDef.taskId - Unique task identifier
   * @param {string} taskDef.type - Task type (question, internal, custom-ui, etc.)
   * @param {object} ctx - Execution context
   * @param {string} ctx.stepId - Current step ID
   * @param {object} ctx.model - Current model state
   * @param {object} ctx.answers - Answers collected so far in this step
   * @param {object} stepEngine - Reference to StepEngine instance
   * @returns {Promise<object>} Task result { taskId, output, aiResult? }
   * @throws {Error} If not implemented by subclass
   */
  async executeTask(taskDef, ctx, stepEngine) {
    throw new Error('ModeStrategy.executeTask() must be implemented');
  }

  /**
   * Synthesize final output for a step.
   * 
   * This method is called after all tasks in a step have been completed.
   * It combines task outputs into a final, cohesive output for the step.
   * 
   * @abstract
   * @param {string} stepId - Step identifier
   * @param {object} ctx - Execution context with all task answers
   * @param {object} ctx.answers - Map of taskId -> task output
   * @returns {object} Synthesized output
   * @throws {Error} If not implemented by subclass
   */
  synthesize(stepId, ctx) {
    throw new Error('ModeStrategy.synthesize() must be implemented');
  }

  /**
   * Apply step output to the model.
   * 
   * This method is called after synthesis to update the model with the step's output.
   * The strategy determines which model properties to update based on the step.
   * 
   * @abstract
   * @param {string} stepId - Step identifier
   * @param {object} output - Synthesized output from synthesize()
   * @param {object} model - Current model state
   * @returns {object} Updated model
   * @throws {Error} If not implemented by subclass
   */
  applyOutput(stepId, output, model) {
    throw new Error('ModeStrategy.applyOutput() must be implemented');
  }

  /**
   * Optional hook called after step completion.
   * 
   * This method is called after a step has been successfully completed and
   * the model has been updated. Strategies can override this to perform
   * additional actions like updating UI, triggering analytics, etc.
   * 
   * Default implementation does nothing (no-op).
   * 
   * @param {string} stepId - Step identifier
   * @param {object} model - Updated model after step completion
   */
  onStepComplete(stepId, model) {
    // Optional - override if needed
    // Default no-op implementation
  }
}

// Export for use by mode implementations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModeStrategy;
}

// Also make available globally for browser usage
if (typeof window !== 'undefined') {
  window.ModeStrategy = ModeStrategy;
}
