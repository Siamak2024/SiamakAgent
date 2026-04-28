/**
 * mockAIService.js - Mock AI service for testing
 * 
 * Provides mock AI responses for different task types
 */

/**
 * Mock AI responses by task type
 */
const mockResponses = {
  general: {
    rawOutput: JSON.stringify({
      status: 'success',
      data: {
        analysis: 'Mock analysis result',
        recommendations: ['Recommendation 1', 'Recommendation 2']
      }
    })
  },
  
  discovery: {
    rawOutput: JSON.stringify({
      businessContext: {
        identity: 'Mock Organization',
        industry: 'Technology',
        size: 'Enterprise'
      }
    })
  },
  
  action: {
    rawOutput: JSON.stringify({
      capabilities: [
        { id: '1.0', name: 'Strategy Development' },
        { id: '2.0', name: 'Product Management' }
      ]
    })
  },
  
  analysis: {
    rawOutput: JSON.stringify({
      gaps: [
        { capability: '1.0', currentMaturity: 2, targetMaturity: 4, gap: 2 }
      ]
    })
  },
  
  heavy: {
    rawOutput: JSON.stringify({
      detailedArchitecture: {
        layers: ['Presentation', 'Business', 'Data'],
        components: []
      }
    })
  }
};

/**
 * Create a mock AI service
 * @param {object} customResponses - Override default responses
 * @returns {object} Mock AI service
 */
function createMockAIService(customResponses = {}) {
  const responses = { ...mockResponses, ...customResponses };
  
  return {
    call: jest.fn(async (taskDef, ctx) => {
      const taskType = taskDef.taskType || 'general';
      
      // Simulate async delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Return mock response based on task type
      if (responses[taskType]) {
        return {
          ...responses[taskType],
          taskId: taskDef.taskId,
          timestamp: new Date().toISOString()
        };
      }
      
      // Default response
      return {
        rawOutput: JSON.stringify({ result: 'mock-result' }),
        taskId: taskDef.taskId,
        timestamp: new Date().toISOString()
      };
    }),
    
    callStreaming: jest.fn(async function* (taskDef, ctx) {
      const response = await this.call(taskDef, ctx);
      yield { chunk: response.rawOutput, done: false };
      yield { chunk: '', done: true };
    })
  };
}

/**
 * Create AI service that fails
 * @param {Error} error - Error to throw
 * @returns {object} Failing AI service
 */
function createFailingAIService(error = new Error('AI service timeout')) {
  return {
    call: jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw error;
    })
  };
}

/**
 * Create AI service with custom behavior
 * @param {function} handler - Custom handler function
 * @returns {object} Custom AI service
 */
function createCustomAIService(handler) {
  return {
    call: jest.fn(async (taskDef, ctx) => {
      return await handler(taskDef, ctx);
    })
  };
}


// CommonJS exports
module.exports = {
  createMockAIService,
  createFailingAIService,
  createCustomAIService
};
