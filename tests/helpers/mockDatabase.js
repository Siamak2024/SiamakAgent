/**
 * mockDatabase.js - Mock database operations for testing
 * 
 * Provides in-memory mock database for testing persistence
 */

let mockStorage = {};

/**
 * Create a mock database service
 * @returns {object} Mock database
 */
function createMockDatabase() {
  return {
    save: jest.fn(async (projectId, model) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      mockStorage[projectId] = JSON.parse(JSON.stringify(model));
      return { success: true, projectId };
    }),
    
    load: jest.fn(async (projectId) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      if (!mockStorage[projectId]) {
        throw new Error(`Project ${projectId} not found`);
      }
      return JSON.parse(JSON.stringify(mockStorage[projectId]));
    }),
    
    delete: jest.fn(async (projectId) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      if (!mockStorage[projectId]) {
        throw new Error(`Project ${projectId} not found`);
      }
      delete mockStorage[projectId];
      return { success: true };
    }),
    
    list: jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return Object.keys(mockStorage).map(id => ({
        projectId: id,
        projectName: mockStorage[id].projectName,
        lastModified: mockStorage[id].lastModified
      }));
    }),
    
    exists: jest.fn(async (projectId) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return !!mockStorage[projectId];
    })
  };
}

/**
 * Reset mock storage
 */
function resetMockDatabase() {
  mockStorage = {};
}

/**
 * Get current mock storage state
 * @returns {object} Storage state
 */
function getMockDatabaseState() {
  return JSON.parse(JSON.stringify(mockStorage));
}

/**
 * Set mock storage state
 * @param {object} state - Storage state to set
 */
function setMockDatabaseState(state) {
  mockStorage = JSON.parse(JSON.stringify(state));
}


// CommonJS exports
module.exports = {
  createMockDatabase,
  resetMockDatabase,
  getMockDatabaseState,
  setMockDatabaseState
};
