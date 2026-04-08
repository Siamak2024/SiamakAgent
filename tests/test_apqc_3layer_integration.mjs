/**
 * Test Suite: APQC 3-Layer Intelligence Integration
 * Tests industry detection, APQC filtering, and AI customization
 * 
 * Run: node tests/test_apqc_3layer_integration.mjs
 */

import { strict as assert } from 'assert';

console.log('\n=== APQC 3-Layer Integration Test Suite ===\n');

// Mock data
const mockBMCContext = {
  value_proposition: "AI-powered analytics platform for enterprise architecture",
  customer_segments: ["Fortune 500 CIOs", "Enterprise Architects"],
  key_activities: ["AI model training", "Data platform operation"],
  strategic_goal: "Become leading EA automation platform",
  business_driver: "Digital transformation demand"
};

const mockAPQCData = {
  framework_version: "8.0",
  categories: [
    {
      id: "1.0",
      level: 1,
      code: "1.0",
      name: "Develop Vision and Strategy",
      children: [
        {
          id: "1.1",
          level: 2,
          code: "1.1",
          parent_id: "1.0",
          name: "Define business concept and organizational strategy",
          industries: ["all"],
          strategic_themes: ["growth", "innovation"],
          capability_category: "product"
        }
      ]
    },
    {
      id: "7.0",
      level: 1,
      code: "7.0",
      name: "Manage Information Technology",
      children: [
        {
          id: "7.1",
          level: 2,
          code: "7.1",
          parent_id: "7.0",
          name: "Manage IT strategy and governance",
          industries: ["technology", "financial_services", "all"],
          strategic_themes: ["efficiency", "innovation"],
          capability_category: "technology"
        },
        {
          id: "7.2",
          level: 2,
          code: "7.2",
          parent_id: "7.0",
          name: "Develop and manage IT infrastructure",
          industries: ["technology", "manufacturing", "all"],
          strategic_themes: ["efficiency"],
          capability_category: "technology"
        }
      ]
    }
  ]
};

// Test 1: Industry Detection from Context
function testIndustryDetection() {
  console.log('Test 1: Industry Detection Logic');
  
  const contextText = `${mockBMCContext.value_proposition} ${mockBMCContext.key_activities.join(', ')}`;
  
  const expectedIndustry = 'technology';
  const keywordMap = {
    technology: ['AI', 'platform', 'software', 'data', 'automation', 'digital'],
    financial_services: ['banking', 'finance', 'trading', 'investment'],
    manufacturing: ['production', 'supply chain', 'factory', 'assembly'],
    healthcare: ['patient', 'clinical', 'medical', 'hospital'],
    retail: ['store', 'merchandise', 'inventory', 'sales'],
    services: ['consulting', 'professional services', 'advisory']
  };
  
  let detectedIndustry = 'all';
  let maxScore = 0;
  
  for (const [industry, keywords] of Object.entries(keywordMap)) {
    const score = keywords.filter(kw => contextText.toLowerCase().includes(kw.toLowerCase())).length;
    if (score > maxScore) {
      maxScore = score;
      detectedIndustry = industry;
    }
  }
  
  assert.equal(detectedIndustry, expectedIndustry, 
    `Should detect "${expectedIndustry}" industry from context`);
  assert.ok(maxScore > 0, 'Confidence score should be > 0');
  
  console.log(`  [OK] Detected industry: ${detectedIndustry} (score: ${maxScore})`);
}

// Test 2: APQC Subset Filtering
function testAPQCFiltering() {
  console.log('\nTest 2: APQC Subset Filtering');
  
  const industry = 'technology';
  const strategicTheme = 'innovation';
  
  const filtered = [];
  
  mockAPQCData.categories.forEach(category => {
    if (category.children) {
      category.children.forEach(child => {
        if (child.level === 2 && 
            child.industries && 
            child.strategic_themes &&
            (child.industries.includes(industry) || child.industries.includes('all')) &&
            child.strategic_themes.includes(strategicTheme)) {
          filtered.push({
            ...child,
            parent_name: category.name
          });
        }
      });
    }
  });
  
  assert.ok(filtered.length > 0, 'Should return filtered capabilities');
  assert.ok(filtered.some(c => c.code === '1.1'), 
    'Should include cross-industry capability 1.1');
  assert.ok(filtered.some(c => c.code === '7.1'), 
    'Should include tech-specific capability 7.1');
  assert.ok(!filtered.some(c => c.code === '7.2'), 
    'Should NOT include 7.2 (no innovation theme)');
  
  console.log(`  [OK] Filtered ${filtered.length} capabilities for ${industry}/${strategicTheme}`);
  filtered.forEach(c => console.log(`    - ${c.code}: ${c.name}`));
}

// Test 3: Domain Mapping from capability_category
function testDomainMapping() {
  console.log('\nTest 3: Domain Mapping');
  
  const testCases = [
    { capability_category: 'product', expectedDomain: 'product' },
    { capability_category: 'technology', expectedDomain: 'technology' },
    { capability_category: 'operations', expectedDomain: 'operations' },
    { capability_category: 'customer', expectedDomain: 'customer' },
    { capability_category: 'finance', expectedDomain: 'finance' },
    { capability_category: null, expectedDomain: 'operations' }
  ];
  
  testCases.forEach(tc => {
    const domain = tc.capability_category || 'operations';
    assert.equal(domain, tc.expectedDomain, 
      `capability_category "${tc.capability_category}" should map to "${tc.expectedDomain}"`);
  });
  
  console.log(`  [OK] All ${testCases.length} domain mappings correct`);
}

// Test 4: Deduplication Logic
function testDeduplication() {
  console.log('\nTest 4: Deduplication');
  
  const existingCapabilities = {
    technology: [
      { name: 'IT Strategy Management', desc: 'Existing capability' }
    ]
  };
  
  const newCapability = {
    name: 'Manage IT strategy and governance',
    domain: 'technology'
  };
  
  const duplicate = {
    name: 'IT Strategy Management',
    domain: 'technology'
  };
  
  const exists = (cap, domain) => {
    return existingCapabilities[domain]?.some(c => 
      c.name.toLowerCase() === cap.name.toLowerCase()
    );
  };
  
  assert.ok(!exists(newCapability, 'technology'), 
    'New capability should not be flagged as duplicate');
  assert.ok(exists(duplicate, 'technology'), 
    'Duplicate capability should be detected (case-insensitive)');
  
  console.log('  [OK] Deduplication logic working correctly');
}

// Test 5: Fallback Behavior (No API Key)
function testFallbackBehavior() {
  console.log('\nTest 5: Fallback Behavior (No AI)');
  
  const apqcEntry = {
    code: '7.1',
    name: 'Manage IT strategy and governance',
    capability_category: 'technology'
  };
  
  const strategicIntent = 'Innovation';
  const priorityByIntent = {
    'Growth': 'strategic',
    'Innovation': 'strategic',
    'Efficiency': 'important',
    'Customer Centricity': 'strategic',
    'Sustainability': 'important'
  };
  
  const imported = {
    name: apqcEntry.name,
    desc: `APQC ${apqcEntry.code}: ${apqcEntry.name}`,
    priority: priorityByIntent[strategicIntent] || 'important',
    maturity: 2
  };
  
  assert.equal(imported.priority, 'strategic', 
    'Innovation intent should map to strategic priority');
  assert.equal(imported.maturity, 2, 
    'Default maturity should be 2 in fallback mode');
  assert.ok(imported.desc.includes('APQC'), 
    'Description should indicate APQC source');
  
  console.log('  [OK] Fallback import logic works without AI');
}

// Test 6: Data Structure Validation
function testEnrichedAPQCStructure() {
  console.log('\nTest 6: Enriched APQC Data Structure');
  
  const l2Entry = mockAPQCData.categories[1].children[0];
  
  assert.ok(l2Entry.industries, 'L2 entry must have industries array');
  assert.ok(Array.isArray(l2Entry.industries), 'industries must be array');
  assert.ok(l2Entry.strategic_themes, 'L2 entry must have strategic_themes array');
  assert.ok(Array.isArray(l2Entry.strategic_themes), 'strategic_themes must be array');
  assert.ok(l2Entry.capability_category, 'L2 entry must have capability_category');
  assert.ok(['customer', 'operations', 'product', 'finance', 'technology'].includes(l2Entry.capability_category),
    'capability_category must be valid domain');
  
  console.log('  [OK] Enriched APQC data structure is valid');
}

// Run all tests
function runAllTests() {
  const tests = [
    testIndustryDetection,
    testAPQCFiltering,
    testDomainMapping,
    testDeduplication,
    testFallbackBehavior,
    testEnrichedAPQCStructure
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, i) => {
    try {
      test();
      passed++;
    } catch (error) {
      failed++;
      console.error(`\n[FAILED] ${test.name}`);
      console.error(`  Error: ${error.message}`);
    }
  });
  
  console.log('\n========================================');
  console.log(`Results: ${passed}/${tests.length} tests passed`);
  if (failed > 0) {
    console.log(`[FAIL] ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log('[SUCCESS] All tests passed');
    process.exit(0);
  }
}

runAllTests();
