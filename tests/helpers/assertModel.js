/**
 * assertModel.js - Custom assertions for model testing
 * 
 * Provides custom Jest matchers for validating model structure and state
 */

/**
 * Check if a step has the expected status
 */
expect.extend({
  toHaveStepStatus(model, stepId, expectedStatus) {
    const step = model?.steps?.[stepId];
    
    if (!step) {
      return {
        pass: false,
        message: () => `Expected model to have step "${stepId}", but it was not found`
      };
    }
    
    const pass = step.status === expectedStatus;
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected step "${stepId}" not to have status "${expectedStatus}"`
          : `Expected step "${stepId}" to have status "${expectedStatus}", but got "${step.status}"`
    };
  }
});

/**
 * Check if a step is completed
 */
expect.extend({
  toHaveCompletedStep(model, stepId) {
    const step = model?.steps?.[stepId];
    
    if (!step) {
      return {
        pass: false,
        message: () => `Expected model to have step "${stepId}", but it was not found`
      };
    }
    
    const pass = step.status === 'completed' && !!step.completedAt && !!step.output;
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected step "${stepId}" not to be completed`
          : `Expected step "${stepId}" to be completed with output, but status="${step.status}", completedAt=${step.completedAt}, output=${!!step.output}`
    };
  }
});

/**
 * Check if model has valid structure
 */
expect.extend({
  toBeValidModel(model) {
    const requiredFields = ['projectId', 'projectName', 'createdAt', 'lastModified', 'steps'];
    const missingFields = requiredFields.filter(field => !(field in model));
    
    if (missingFields.length > 0) {
      return {
        pass: false,
        message: () => `Model is missing required fields: ${missingFields.join(', ')}`
      };
    }
    
    if (typeof model.steps !== 'object') {
      return {
        pass: false,
        message: () => `Model.steps must be an object, got ${typeof model.steps}`
      };
    }
    
    return {
      pass: true,
      message: () => 'Model is valid'
    };
  }
});

/**
 * Check if step has expected tasks completed
 */
expect.extend({
  toHaveCompletedTasks(model, stepId, expectedTasks) {
    const step = model?.steps?.[stepId];
    
    if (!step) {
      return {
        pass: false,
        message: () => `Expected model to have step "${stepId}", but it was not found`
      };
    }
    
    const completedTasks = step.completedTasks || [];
    const missingTasks = expectedTasks.filter(t => !completedTasks.includes(t));
    const pass = missingTasks.length === 0;
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected step "${stepId}" not to have completed tasks ${expectedTasks.join(', ')}`
          : `Expected step "${stepId}" to have completed tasks ${expectedTasks.join(', ')}, but missing: ${missingTasks.join(', ')}`
    };
  }
});

/**
 * Check if model has capability data
 */
expect.extend({
  toHaveCapabilities(model) {
    const pass = Array.isArray(model.capabilities) && model.capabilities.length > 0;
    
    return {
      pass,
      message: () => 
        pass
          ? 'Expected model not to have capabilities'
          : 'Expected model to have capabilities array with data'
    };
  }
});

/**
 * Check if step has versions for rollback
 */
expect.extend({
  toHaveVersions(model, stepId, minCount = 1) {
    const step = model?.steps?.[stepId];
    
    if (!step) {
      return {
        pass: false,
        message: () => `Expected model to have step "${stepId}", but it was not found`
      };
    }
    
    const versions = step.versions || [];
    const pass = versions.length >= minCount;
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected step "${stepId}" to have less than ${minCount} versions`
          : `Expected step "${stepId}" to have at least ${minCount} versions, but got ${versions.length}`
    };
  }
});

/**
 * Standard model assertions helper
 */
const ModelAssertions = {
  /**
   * Assert step is in expected state
   */
  assertStepState(model, stepId, expectedState) {
    expect(model).toHaveStepStatus(stepId, expectedState);
  },
  
  /**
   * Assert step is completed
   */
  assertStepCompleted(model, stepId) {
    expect(model).toHaveCompletedStep(stepId);
  },
  
  /**
   * Assert model has valid structure
   */
  assertValidModel(model) {
    expect(model).toBeValidModel();
  },
  
  /**
   * Assert step has expected output
   */
  assertStepOutput(model, stepId, outputMatcher) {
    const step = model?.steps?.[stepId];
    expect(step).toBeDefined();
    expect(step.output).toMatchObject(outputMatcher);
  },
  
  /**
   * Assert model has business context
   */
  assertHasBusinessContext(model) {
    expect(model.businessContext).toBeDefined();
    expect(model.businessContext).toHaveProperty('identity');
    expect(model.businessContextConfirmed).toBe(true);
  },
  
  /**
   * Assert model has capabilities
   */
  assertHasCapabilities(model) {
    expect(model).toHaveCapabilities();
  }
};


// CommonJS exports
module.exports = {
  ModelAssertions
};
