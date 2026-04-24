module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/NexGenEA/', 
    '/azure-deployment/',
    '/tests/unit/EA_ObjectivesManager.test.js'  // Legacy custom test class, not Jest format
  ],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/NexGenEA/', '<rootDir>/azure-deployment/'],
  collectCoverageFrom: [
    'NexGenEA/**/*.js',
    '!NexGenEA/**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  maxWorkers: 1,
  watchman: false,
  cache: false,
  cacheDirectory: 'C:/Temp/jest-cache'
};
