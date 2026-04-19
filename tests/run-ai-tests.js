/**
 * Node.js Test Runner for AI Interaction Tests
 * 
 * Loads Advicy_AI.js and related modules, then runs E2E_AI_Interaction_Test.js
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Loading AI modules for testing...\n');

// Mock browser globals needed by Advicy_AI
global.window = {
  location: {
    hostname: 'localhost'
  },
  model: {
    phase4Config: {
      activeBusinessAreas: []
    }
  }
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock console for cleaner output (optional)
const originalConsole = { ...console };

/**
 * Load a JavaScript module and make it available globally
 */
function loadModule(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    
    // For Advicy_AI.js - expose the AdvisyAI object
    if (filePath.includes('Advicy_AI.js')) {
      // Replace const AdvisyAI with global.AdvisyAI to expose it globally
      const wrappedCode = code.replace(
        /const AdvisyAI = /g,
        'global.AdvisyAI = '
      );
      eval(wrappedCode);
      console.log(`✅ Loaded: ${path.basename(filePath)}`);
      return;
    }
    
    // For AzureOpenAIProxy.js - expose the class
    if (filePath.includes('AzureOpenAIProxy.js')) {
      // Replace class declaration to make it global
      const wrappedCode = code.replace(
        /class AzureOpenAIProxy/g,
        'global.AzureOpenAIProxy = class AzureOpenAIProxy'
      );
      eval(wrappedCode);
      console.log(`✅ Loaded: ${path.basename(filePath)}`);
      return;
    }
    
    // For test file
    if (filePath.includes('E2E_AI_Interaction_Test.js')) {
      // Replace class declaration to make it global
      const wrappedCode = code.replace(
        /class E2E_AI_Interaction_Test/g,
        'global.E2E_AI_Interaction_Test = class E2E_AI_Interaction_Test'
      );
      eval(wrappedCode);
      console.log(`✅ Loaded: ${path.basename(filePath)}`);
      return;
    }
    
    eval(code);
    console.log(`✅ Loaded: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Failed to load ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

// Load modules in dependency order
try {
  // Optional: Load AzureOpenAIProxy (AI tests will skip actual API calls if not available)
  const proxyPath = path.join(__dirname, '..', 'AzureOpenAIProxy.js');
  if (fs.existsSync(proxyPath)) {
    loadModule(proxyPath);
  } else {
    console.log('⚠️  AzureOpenAIProxy.js not found - API call tests will be skipped');
  }
  
  // Load AdvisyAI module
  const aiPath = path.join(__dirname, '..', 'js', 'Advicy_AI.js');
  loadModule(aiPath);
  
  // Load test suite
  const testPath = path.join(__dirname, 'E2E_AI_Interaction_Test.js');
  loadModule(testPath);
  
  console.log('\n🧪 Starting AI Interaction Tests...\n');
  
  // Run tests
  const test = new global.E2E_AI_Interaction_Test();
  test.runAllTests().then(() => {
    const results = test.results;
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('\n❌ Module loading failed:', error);
  process.exit(1);
}
