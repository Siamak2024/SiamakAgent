/**
 * testUtils.js - Common test utilities and helpers
 * 
 * Provides utility functions used across multiple test files
 */

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
async function wait(ms = 10) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a promise that rejects after timeout
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Timeout message
 * @returns {Promise} Promise that rejects
 */
function timeout(ms, message = 'Operation timed out') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Mock user answers for interactive tasks
 * @param {Array} answers - Array of {taskId, answer} objects
 */
function mockUserAnswers(answers) {
  const answerMap = {};
  answers.forEach(({ taskId, answer }) => {
    answerMap[taskId] = answer;
  });
  
  // Store in global test context
  global.__mockUserAnswers = answerMap;
}

/**
 * Get mock answer for a task
 * @param {string} taskId - Task ID
 * @returns {any} Mock answer
 */
function getMockAnswer(taskId) {
  return global.__mockUserAnswers?.[taskId] || null;
}

/**
 * Clear mock user answers
 */
function clearMockAnswers() {
  global.__mockUserAnswers = {};
}

/**
 * Generate random ID
 * @returns {string} Random ID
 */
function generateId() {
  return 'test-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate mock organization summary
 * @param {number} minLength - Minimum character length
 * @returns {string} Mock summary
 */
function generateMockOrganizationSummary(minLength = 500) {
  const template = `
    We are a leading technology company specializing in enterprise software solutions.
    Our mission is to empower businesses through innovative digital transformation.
    We serve clients across multiple industries including finance, healthcare, and retail.
    
    Key strengths include:
    - Advanced AI and machine learning capabilities
    - Robust cloud infrastructure
    - Experienced team of 500+ professionals
    - Strong customer relationships built over 15 years
    
    Strategic objectives for 2026:
    - Expand market share in healthcare sector by 20%
    - Launch new AI-powered product suite
    - Improve customer satisfaction scores to 90%+
    - Achieve operational excellence through process optimization
    
    Current challenges:
    - Legacy system integration complexity
    - Rapid technology evolution
    - Increasing competitive pressure
    - Talent acquisition and retention
  `;
  
  let summary = template.trim();
  
  // Pad to minimum length if needed
  while (summary.length < minLength) {
    summary += '\n\nAdditional context: Our organization continues to evolve and adapt to market changes.';
  }
  
  return summary;
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Assert object contains expected properties
 * @param {object} obj - Object to check
 * @param {object} expected - Expected properties
 */
function assertContains(obj, expected) {
  Object.keys(expected).forEach(key => {
    expect(obj).toHaveProperty(key);
    if (typeof expected[key] === 'object' && expected[key] !== null) {
      assertContains(obj[key], expected[key]);
    } else {
      expect(obj[key]).toEqual(expected[key]);
    }
  });
}

/**
 * Spy on console methods
 * @returns {object} Spies for console methods
 */
function spyOnConsole() {
  return {
    log: jest.spyOn(console, 'log').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation()
  };
}

/**
 * Restore console spies
 */
function restoreConsole() {
  console.log.mockRestore?.();
  console.warn.mockRestore?.();
  console.error.mockRestore?.();
}

/**
 * Create a mock context object
 * @param {object} overrides - Properties to override
 * @returns {object} Mock context
 */
function createMockContext(overrides = {}) {
  return {
    stepId: 'step1',
    model: {},
    answers: {},
    organizationProfile: null,
    businessContext: null,
    ...overrides
  };
}


// CommonJS exports
module.exports = {
  wait,
  timeout,
  mockUserAnswers,
  getMockAnswer,
  clearMockAnswers,
  generateId,
  generateMockOrganizationSummary,
  deepClone,
  assertContains,
  spyOnConsole,
  restoreConsole,
  createMockContext
};
