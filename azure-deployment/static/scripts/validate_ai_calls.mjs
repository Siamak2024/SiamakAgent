#!/usr/bin/env node

/**
 * AI Analysis Validation Script
 * Tests all toolkit AI analysis functions to ensure temperature parameter removal didn't break functionality
 * 
 * What this validates:
 * 1. All AI API calls have correct structure (no temperature parameters)
 * 2. API endpoints are properly formatted
 * 3. Message structures are valid
 * 4. Error handling is in place
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Toolkit files to validate
const toolkits = [
  'EA2_Toolkit/AI Business Model Canvas.html',
  'EA2_Toolkit/AI Capability Mapping V2.html',
  'EA2_Toolkit/AI Value Chain Analyzer V2.html',
  'EA2_Toolkit/AI Strategy Workbench V2.html',
  'EA2_Toolkit/EA20 Maturity Toolbox V2.html',
  'EA2_Toolkit/Application_Portfolio_Management.html',
  'EA2_Toolkit/Wardley_Workshop_Builder.html',
  'EA2_Toolkit/ValueChain_Workshop_Builder.html',
  'EA2_Toolkit/EA2_Strategic_Tools.html',
  // Azure mirrors
  'azure-deployment/static/EA2_Toolkit/AI Business Model Canvas.html',
  'azure-deployment/static/EA2_Toolkit/AI Capability Mapping V2.html',
  'azure-deployment/static/EA2_Toolkit/AI Value Chain Analyzer V2.html',
  'azure-deployment/static/EA2_Toolkit/AI Strategy Workbench V2.html',
  'azure-deployment/static/EA2_Toolkit/EA20 Maturity Toolbox V2.html',
  'azure-deployment/static/EA2_Toolkit/Application_Portfolio_Management.html',
  'azure-deployment/static/EA2_Toolkit/Wardley_Workshop_Builder.html',
  'azure-deployment/static/EA2_Toolkit/ValueChain_Workshop_Builder.html',
  'azure-deployment/static/EA2_Toolkit/EA2_Strategic_Tools.html',
  'azure-deployment/static/EA2_Toolkit/EA_Strategy_Workflow.html'
];

let totalTests = 0;
let passed = 0;
let failed = 0;
let warnings = 0;

const results = [];

console.log('🔍 AI Analysis Validation Report');
console.log('================================\n');

// Test 1: No temperature parameters
console.log('Test 1: Verify no temperature parameters remain');
for (const toolkit of toolkits) {
  const filePath = join(rootDir, toolkit);
  totalTests++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for temperature parameters
    const temperatureMatches = content.match(/temperature:\s*0\.\d+/g);
    
    if (temperatureMatches && temperatureMatches.length > 0) {
      failed++;
      results.push({
        test: 'Temperature Check',
        file: toolkit,
        status: '❌ FAIL',
        details: `Found ${temperatureMatches.length} temperature parameter(s): ${temperatureMatches.join(', ')}`
      });
    } else {
      passed++;
      results.push({
        test: 'Temperature Check',
        file: toolkit,
        status: '✅ PASS',
        details: 'No temperature parameters found'
      });
    }
  } catch (err) {
    failed++;
    results.push({
      test: 'Temperature Check',
      file: toolkit,
      status: '❌ FAIL',
      details: `Error reading file: ${err.message}`
    });
  }
}

// Test 2: Valid API endpoint structure
console.log('\nTest 2: Verify valid API endpoint structure');
for (const toolkit of toolkits) {
  const filePath = join(rootDir, toolkit);
  totalTests++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for correct API endpoint
    const apiCalls = content.match(/fetch\(['"`]\/api\/openai\/chat['"`]/g);
    
    if (apiCalls && apiCalls.length > 0) {
      passed++;
      results.push({
        test: 'API Endpoint',
        file: toolkit,
        status: '✅ PASS',
        details: `Found ${apiCalls.length} valid API call(s)`
      });
    } else {
      warnings++;
      results.push({
        test: 'API Endpoint',
        file: toolkit,
        status: '⚠️ WARN',
        details: 'No API calls found (may be expected for some toolkits)'
      });
    }
  } catch (err) {
    failed++;
    results.push({
      test: 'API Endpoint',
      file: toolkit,
      status: '❌ FAIL',
      details: `Error reading file: ${err.message}`
    });
  }
}

// Test 3: Proper JSON.stringify structure
console.log('\nTest 3: Verify JSON.stringify structure');
for (const toolkit of toolkits) {
  const filePath = join(rootDir, toolkit);
  totalTests++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for proper body structure
    const bodyStructure = content.match(/body:\s*JSON\.stringify\(\{[^}]*model:\s*['"]gpt-5['"]/g);
    
    if (bodyStructure && bodyStructure.length > 0) {
      // Check that none of these have temperature
      const hasTemperature = bodyStructure.some(match => /temperature/.test(match));
      
      if (hasTemperature) {
        failed++;
        results.push({
          test: 'JSON Structure',
          file: toolkit,
          status: '❌ FAIL',
          details: 'Found temperature in JSON.stringify body'
        });
      } else {
        passed++;
        results.push({
          test: 'JSON Structure',
          file: toolkit,
          status: '✅ PASS',
          details: `All ${bodyStructure.length} API call(s) use default temperature`
        });
      }
    } else {
      warnings++;
      results.push({
        test: 'JSON Structure',
        file: toolkit,
        status: '⚠️ WARN',
        details: 'No standard API calls found'
      });
    }
  } catch (err) {
    failed++;
    results.push({
      test: 'JSON Structure',
      file: toolkit,
      status: '❌ FAIL',
      details: `Error reading file: ${err.message}`
    });
  }
}

// Test 4: Error handling present
console.log('\nTest 4: Verify error handling in AI calls');
for (const toolkit of toolkits) {
  const filePath = join(rootDir, toolkit);
  totalTests++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for try/catch or .catch() error handling
    const hasTryCatch = /try\s*{[\s\S]*?fetch\(['"`]\/api\/openai\/chat/g.test(content);
    const hasCatchChain = /fetch\(['"`]\/api\/openai\/chat[\s\S]*?\.catch\(/g.test(content);
    
    if (hasTryCatch || hasCatchChain) {
      passed++;
      results.push({
        test: 'Error Handling',
        file: toolkit,
        status: '✅ PASS',
        details: 'Error handling found'
      });
    } else {
      const hasApiCall = /fetch\(['"`]\/api\/openai\/chat/g.test(content);
      if (hasApiCall) {
        warnings++;
        results.push({
          test: 'Error Handling',
          file: toolkit,
          status: '⚠️ WARN',
          details: 'API calls found but no explicit error handling detected'
        });
      } else {
        passed++;
        results.push({
          test: 'Error Handling',
          file: toolkit,
          status: '✅ PASS',
          details: 'N/A - no API calls'
        });
      }
    }
  } catch (err) {
    failed++;
    results.push({
      test: 'Error Handling',
      file: toolkit,
      status: '❌ FAIL',
      details: `Error reading file: ${err.message}`
    });
  }
}

// Test 5: Message structure validation
console.log('\nTest 5: Verify message array structure');
for (const toolkit of toolkits) {
  const filePath = join(rootDir, toolkit);
  totalTests++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for proper messages array structure
    const messageArrays = content.match(/messages:\s*\[[\s\S]*?\{[\s\S]*?role:\s*['"](?:system|user|assistant)['"]/g);
    
    if (messageArrays && messageArrays.length > 0) {
      passed++;
      results.push({
        test: 'Message Structure',
        file: toolkit,
        status: '✅ PASS',
        details: `Found ${messageArrays.length} properly structured message array(s)`
      });
    } else {
      warnings++;
      results.push({
        test: 'Message Structure',
        file: toolkit,
        status: '⚠️ WARN',
        details: 'No standard message arrays found'
      });
    }
  } catch (err) {
    failed++;
    results.push({
      test: 'Message Structure',
      file: toolkit,
      status: '❌ FAIL',
      details: `Error reading file: ${err.message}`
    });
  }
}

// Print summary
console.log('\n\n📊 SUMMARY');
console.log('==========');
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️ Warnings: ${warnings}`);

// Print detailed results
console.log('\n\n📋 DETAILED RESULTS');
console.log('==================\n');

// Group by file
const fileGroups = {};
results.forEach(result => {
  if (!fileGroups[result.file]) {
    fileGroups[result.file] = [];
  }
  fileGroups[result.file].push(result);
});

Object.entries(fileGroups).forEach(([file, tests]) => {
  console.log(`\n${file}:`);
  tests.forEach(test => {
    console.log(`  ${test.status} ${test.test}: ${test.details}`);
  });
});

// Exit code
if (failed > 0) {
  console.log('\n\n❌ VALIDATION FAILED - Fix errors above');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n\n⚠️ VALIDATION PASSED WITH WARNINGS');
  process.exit(0);
} else {
  console.log('\n\n✅ ALL VALIDATIONS PASSED');
  process.exit(0);
}
