/**
 * Node.js E2E Test Runner
 * Simulates browser environment for testing
 */

// Simulate localStorage for Node.js environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

// Set up global environment
global.localStorage = new LocalStorageMock();

// Load modules
const fs = require('fs');
const path = require('path');

function loadModule(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    // Create a wrapper to expose classes to global scope
    const wrappedCode = code.replace(
      /class (\w+)/g,
      'global.$1 = class $1'
    );
    eval(wrappedCode);
    console.log(`✅ Loaded: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to load ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

console.log('📦 Loading modules...\n');

const basePath = path.join(__dirname, '..');
const modulePaths = [
  path.join(basePath, 'js', 'EA_AccountManager.js'),
  path.join(basePath, 'js', 'EA_EngagementManager.js'),
  path.join(basePath, 'js', 'EA_WorkflowEngine.js'),
  path.join(basePath, 'js', 'EA_CustomerSuccess.js'),
  path.join(basePath, 'js', 'EA_AccountTeam.js'),
  path.join(basePath, 'js', 'EA_UserGuide.js'),
  path.join(__dirname, 'E2E_SalesEA_Collaboration_Test.js')
];

let allLoaded = true;
modulePaths.forEach(modulePath => {
  if (!loadModule(modulePath)) {
    allLoaded = false;
  }
});

console.log('');

if (!allLoaded) {
  console.error('❌ Some modules failed to load. Cannot run tests.\n');
  process.exit(1);
}

// Run tests
console.log('🧪 Starting E2E Tests...\n');
console.log('='.repeat(80) + '\n');

async function runTests() {
  try {
    const testSuite = new SalesEACollaborationE2ETest();
    const report = await testSuite.runAllTests();
    
    // Exit with appropriate code
    if (report && report.success) {
      console.log('\n✅ All tests passed successfully!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Review the output above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Critical error during test execution:');
    console.error(error);
    process.exit(1);
  }
}

runTests();
