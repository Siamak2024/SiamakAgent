/**
 * mockModel.js - Test fixture for creating mock model data
 * 
 * Provides factory functions to create test models with various states
 */

/**
 * Create a basic mock model with default values
 * @param {object} overrides - Properties to override defaults
 * @returns {object} Mock model
 */
function createMockModel(overrides = {}) {
  const baseModel = {
    projectId: 'test-project-' + Math.random().toString(36).substr(2, 9),
    projectName: 'Test Project',
    createdAt: '2026-04-27T10:00:00Z',
    lastModified: '2026-04-27T10:00:00Z',
    steps: {},
    organizationProfile: null,
    businessContext: null,
    businessContextConfirmed: false,
    strategicIntent: null,
    bmc: null,
    capabilities: [],
    capabilityMap: null,
    gapInsights: [],
    whiteSpots: [],
    archBenchmark: null,
    operatingModel: null,
    operatingModelDelta: null
  };
  
  return {
    ...baseModel,
    ...overrides,
    steps: {
      ...baseModel.steps,
      ...(overrides.steps || {})
    }
  };
}

/**
 * Create a model with specific steps completed
 * @param {string[]} completedSteps - Array of step IDs (e.g., ['step1', 'step2'])
 * @returns {object} Mock model
 */
function createModelWithCompletedSteps(completedSteps = []) {
  const steps = {};
  
  completedSteps.forEach(stepId => {
    steps[stepId] = {
      id: stepId,
      name: `Mock ${stepId}`,
      status: 'completed',
      startedAt: '2026-04-27T10:00:00Z',
      completedAt: '2026-04-27T10:05:00Z',
      completedTasks: [],
      answers: {},
      output: {
        mockData: true,
        stepId
      },
      versions: []
    };
  });
  
  return createMockModel({ steps });
}

/**
 * Create a model with a step in progress
 * @param {string} stepId - Step currently in progress
 * @param {object} partialAnswers - Answers collected so far
 * @returns {object} Mock model
 */
function createModelWithStepInProgress(stepId, partialAnswers = {}) {
  const steps = {};
  
  steps[stepId] = {
    id: stepId,
    name: `Mock ${stepId}`,
    status: 'in-progress',
    startedAt: '2026-04-27T10:00:00Z',
    completedTasks: Object.keys(partialAnswers),
    answers: partialAnswers,
    output: null,
    versions: []
  };
  
  return createMockModel({ steps });
}

/**
 * Create a model with step versions (for rollback testing)
 * @param {string} stepId - Step with versions
 * @param {number} versionCount - Number of previous versions
 * @returns {object} Mock model
 */
function createModelWithVersions(stepId, versionCount = 2) {
  const versions = [];
  
  for (let i = 0; i < versionCount; i++) {
    versions.push({
      timestamp: new Date(Date.now() - (versionCount - i) * 60000).toISOString(),
      output: {
        version: i + 1,
        data: `Version ${i + 1} data`
      }
    });
  }
  
  const steps = {};
  steps[stepId] = {
    id: stepId,
    name: `Mock ${stepId}`,
    status: 'completed',
    startedAt: '2026-04-27T10:00:00Z',
    completedAt: '2026-04-27T10:05:00Z',
    completedTasks: [],
    answers: {},
    output: {
      version: versionCount + 1,
      data: 'Current version data'
    },
    versions
  };
  
  return createMockModel({ steps });
}

/**
 * Create a model with business context data
 * @returns {object} Mock model
 */
function createModelWithBusinessContext() {
  return createMockModel({
    businessContext: {
      identity: 'Test Organization',
      industry: 'Technology',
      trigger: 'Digital transformation',
      scale: 'Enterprise-wide',
      ambition: 'Strategic transformation',
      constraints: ['Budget limitations', 'Legacy systems'],
      stakeholders: ['CEO', 'CTO', 'Business units'],
      timeline: '12-18 months'
    },
    businessContextConfirmed: true,
    steps: {
      step1: {
        id: 'step1',
        name: 'Business Context',
        status: 'completed',
        startedAt: '2026-04-27T10:00:00Z',
        completedAt: '2026-04-27T10:05:00Z',
        completedTasks: ['step1_synthesize'],
        answers: {},
        output: {},
        versions: []
      }
    }
  });
}

/**
 * Create a model with APQC capabilities
 * @returns {object} Mock model
 */
function createModelWithCapabilities() {
  return createMockModel({
    capabilities: [
      {
        id: '1.0',
        name: 'Develop Vision and Strategy',
        level: 'L1',
        category: 'CORE',
        maturity: 3,
        itEnablement: 'High',
        objectiveAlignment: ['Strategic planning', 'Market analysis']
      },
      {
        id: '2.0',
        name: 'Develop and Manage Products and Services',
        level: 'L1',
        category: 'CORE',
        maturity: 4,
        itEnablement: 'High',
        objectiveAlignment: ['Product innovation']
      }
    ],
    capabilityMap: {
      core: ['1.0', '2.0'],
      support: [],
      commodity: []
    },
    steps: {
      step2: {
        id: 'step2',
        name: 'Capability Mapping',
        status: 'completed',
        output: {},
        versions: []
      }
    }
  });
}

/**
 * Create autopilot mode model
 * @param {string} summary - Organization summary
 * @returns {object} Mock model
 */
function createAutopilotModel(summary = '') {
  return createMockModel({
    _autopilotContext: {
      summary: summary || 'A'.repeat(500),
      startedAt: '2026-04-27T10:00:00Z'
    }
  });
}

// CommonJS exports
module.exports = {
  createMockModel,
  createModelWithCompletedSteps,
  createModelWithStepInProgress,
  createModelWithVersions,
  createModelWithBusinessContext,
  createModelWithCapabilities,
  createAutopilotModel
};
