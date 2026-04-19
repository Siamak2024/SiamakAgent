/**
 * EA_KPI_Validator.js
 * Validates and tests all KPI calculations (ROI, NPV, IRR, Payback)
 * Ensures financial accuracy across the toolkit
 * 
 * @version 1.0
 * @date April 19, 2026
 */

class EA_KPI_Validator {
  constructor() {
    this.financialEngine = typeof FinancialEngine !== 'undefined' ? new FinancialEngine() : null;
    this.testResults = [];
  }

  /**
   * Run comprehensive validation tests
   * @returns {object} Test results with pass/fail status
   */
  runAllValidations() {
    console.log('🧪 Running KPI Validation Tests...');
    
    this.testResults = [];
    
    // Test NPV calculations
    this.testNPV();
    
    // Test ROI calculations
    this.testROI();
    
    // Test Payback calculations
    this.testPayback();
    
    // Test IRR calculations
    this.testIRR();
    
    // Test edge cases
    this.testEdgeCases();
    
    const summary = this.generateSummary();
    console.log('✅ KPI Validation Complete');
    console.log(`   • Total Tests: ${summary.total}`);
    console.log(`   • Passed: ${summary.passed}`);
    console.log(`   • Failed: ${summary.failed}`);
    console.log(`   • Pass Rate: ${summary.passRate}%`);
    
    return summary;
  }

  /**
   * Test NPV (Net Present Value) calculations
   */
  testNPV() {
    console.log('📊 Testing NPV calculations...');
    
    // Test Case 1: Simple 3-year project
    // Investment: -€100,000, Annual benefit: €40,000, Discount rate: 10%
    const scenario1 = {
      changes: [
        { costChange: -100000, benefitChange: 0 },
        { costChange: 0, benefitChange: 40000 }
      ],
      duration: 3
    };
    
    // Expected NPV = -100,000 + 40,000/(1.10) + 40,000/(1.10)^2 + 40,000/(1.10)^3
    // = -100,000 + 36,364 + 33,058 + 30,053 = -611 (approximately)
    const npv1 = this.financialEngine.calculateNPV(scenario1, 10);
    const expected1 = -611;
    const tolerance = 100; // Allow small rounding differences
    
    this.testResults.push({
      test: 'NPV Test 1: Simple 3-year project',
      passed: Math.abs(npv1 - expected1) < tolerance,
      actual: npv1,
      expected: expected1,
      formula: 'NPV = -100k + 40k/(1.10) + 40k/(1.10)^2 + 40k/(1.10)^3'
    });
    
    // Test Case 2: Positive NPV project
    // Investment: -€50,000, Annual benefit: €25,000, Discount rate: 8%, Duration: 3 years
    const scenario2 = {
      changes: [
        { costChange: -50000, benefitChange: 75000 }
      ],
      duration: 3
    };
    
    // Expected NPV = -50,000 + 25,000/(1.08) + 25,000/(1.08)^2 + 25,000/(1.08)^3
    // = -50,000 + 23,148 + 21,433 + 19,846 = 14,427
    const npv2 = this.financialEngine.calculateNPV(scenario2, 8);
    const expected2 = 14427;
    
    this.testResults.push({
      test: 'NPV Test 2: Positive NPV project',
      passed: Math.abs(npv2 - expected2) < tolerance,
      actual: npv2,
      expected: expected2,
      formula: 'NPV = -50k + 25k/(1.08) + 25k/(1.08)^2 + 25k/(1.08)^3'
    });
    
    // Test Case 3: Different discount rates
    const scenario3 = {
      changes: [{ costChange: -100000, benefitChange: 40000 }],
      duration: 3
    };
    
    const npv3a = this.financialEngine.calculateNPV(scenario3, 5);  // Low discount rate
    const npv3b = this.financialEngine.calculateNPV(scenario3, 10); // Medium discount rate  
    const npv3c = this.financialEngine.calculateNPV(scenario3, 20); // High discount rate
    
    // Higher discount rate should result in lower NPV
    this.testResults.push({
      test: 'NPV Test 3: Discount rate impact',
      passed: npv3a > npv3b && npv3b > npv3c,
      actual: `5%: ${npv3a}, 10%: ${npv3b}, 20%: ${npv3c}`,
      expected: 'NPV decreases as discount rate increases',
      formula: 'NPV inversely proportional to discount rate'
    });
  }

  /**
   * Test ROI (Return on Investment) calculations
   */
  testROI() {
    console.log('📊 Testing ROI calculations...');
    
    // Test Case 1: 200% ROI
    // Cost: €100,000, Benefit: €300,000
    // ROI = (300,000 - 100,000) / 100,000 = 200%
    const scenario1 = {
      changes: [
        { costChange: -100000, benefitChange: 300000 }
      ]
    };
    
    const roi1 = this.financialEngine.calculateROI(scenario1);
    const expected1 = 200;
    
    this.testResults.push({
      test: 'ROI Test 1: 200% ROI',
      passed: roi1 === expected1,
      actual: roi1,
      expected: expected1,
      formula: 'ROI = (Benefit - Cost) / Cost × 100'
    });
    
    // Test Case 2: 50% ROI
    // Cost: €80,000, Benefit: €120,000
    // ROI = (120,000 - 80,000) / 80,000 = 50%
    const scenario2 = {
      changes: [
        { costChange: -80000, benefitChange: 120000 }
      ]
    };
    
    const roi2 = this.financialEngine.calculateROI(scenario2);
    const expected2 = 50;
    
    this.testResults.push({
      test: 'ROI Test 2: 50% ROI',
      passed: roi2 === expected2,
      actual: roi2,
      expected: expected2,
      formula: 'ROI = (120k - 80k) / 80k × 100 = 50%'
    });
    
    // Test Case 3: Negative ROI (loss)
    // Cost: €100,000, Benefit: €60,000
    // ROI = (60,000 - 100,000) / 100,000 = -40%
    const scenario3 = {
      changes: [
        { costChange: -100000, benefitChange: 60000 }
      ]
    };
    
    const roi3 = this.financialEngine.calculateROI(scenario3);
    const expected3 = -40;
    
    this.testResults.push({
      test: 'ROI Test 3: Negative ROI',
      passed: roi3 === expected3,
      actual: roi3,
      expected: expected3,
      formula: 'ROI = (60k - 100k) / 100k × 100 = -40%'
    });
    
    // Test Case 4: Multiple changes
    // Costs: -€50k, -€30k, Benefits: +€150k, +€50k
    // Total Cost: €80k, Total Benefit: €200k, ROI = 150%
    const scenario4 = {
      changes: [
        { costChange: -50000, benefitChange: 150000 },
        { costChange: -30000, benefitChange: 50000 }
      ]
    };
    
    const roi4 = this.financialEngine.calculateROI(scenario4);
    const expected4 = 150;
    
    this.testResults.push({
      test: 'ROI Test 4: Multiple changes',
      passed: roi4 === expected4,
      actual: roi4,
      expected: expected4,
      formula: 'ROI = (200k - 80k) / 80k × 100 = 150%'
    });
  }

  /**
   * Test Payback Period calculations
   */
  testPayback() {
    console.log('📊 Testing Payback Period calculations...');
    
    // Test Case 1: 2-year payback
    // Investment: -€100k, Annual benefit: €50k (cumulative: -100, -50, 0, +50)
    const scenario1 = {
      changes: [
        { costChange: -100000, benefitChange: 50000 }
      ],
      duration: 4
    };
    
    const payback1 = this.financialEngine.calculatePayback(scenario1);
    const expected1 = 2; // Breaks even at year 2
    
    this.testResults.push({
      test: 'Payback Test 1: 2-year payback',
      passed: payback1 === expected1,
      actual: payback1,
      expected: expected1,
      formula: 'Year 0: -100k, Year 1: -50k, Year 2: 0 → Payback = 2 years'
    });
    
    // Test Case 2: Immediate payback (Year 1)
    // Investment: -€40k, Annual benefit: €60k
    const scenario2 = {
      changes: [
        { costChange: -40000, benefitChange: 60000 }
      ],
      duration: 3
    };
    
    const payback2 = this.financialEngine.calculatePayback(scenario2);
    const expected2 = 1;
    
    this.testResults.push({
      test: 'Payback Test 2: 1-year payback',
      passed: payback2 === expected2,
      actual: payback2,
      expected: expected2,
      formula: 'Year 0: -40k, Year 1: +20k → Payback = 1 year'
    });
    
    // Test Case 3: No payback (project never breaks even)
    // Investment: -€100k, Annual benefit: €10k over 3 years
    const scenario3 = {
      changes: [
        { costChange: -100000, benefitChange: 10000 }
      ],
      duration: 3
    };
    
    const payback3 = this.financialEngine.calculatePayback(scenario3);
    
    this.testResults.push({
      test: 'Payback Test 3: No payback within duration',
      passed: payback3 === null,
      actual: payback3,
      expected: null,
      formula: 'Total benefit (30k) < Investment (100k) → No payback'
    });
  }

  /**
   * Test IRR (Internal Rate of Return) calculations
   */
  testIRR() {
    console.log('📊 Testing IRR calculations...');
    
    // Test Case 1: Known IRR scenario
    // Cash flows: [-100, 50, 50, 50]
    // IRR ≈ 23.4%
    const scenario1 = {
      changes: [
        { costChange: -100, benefitChange: 50 }
      ],
      duration: 3
    };
    
    const irr1 = this.financialEngine.calculateIRR(scenario1);
    const expected1 = 23.4;
    const tolerance = 1.0; // Allow 1% tolerance
    
    this.testResults.push({
      test: 'IRR Test 1: Standard IRR calculation',
      passed: irr1 !== null && Math.abs(irr1 - expected1) < tolerance,
      actual: irr1,
      expected: expected1,
      formula: 'Cash flows: [-100, 50, 50, 50] → IRR ≈ 23.4%'
    });
    
    // Test Case 2: High IRR scenario
    // Cash flows: [-100, 150, 0, 0]
    // IRR = 50%
    const scenario2 = {
      changes: [
        { costChange: -100, benefitChange: 150 }
      ],
      duration: 1
    };
    
    const irr2 = this.financialEngine.calculateIRR(scenario2);
    const expected2 = 50.0;
    
    this.testResults.push({
      test: 'IRR Test 2: High IRR (50%)',
      passed: irr2 !== null && Math.abs(irr2 - expected2) < tolerance,
      actual: irr2,
      expected: expected2,
      formula: 'Cash flows: [-100, 150] → IRR = 50%'
    });
    
    // Test Case 3: No IRR (all negative flows)
    const scenario3 = {
      changes: [
        { costChange: -100, benefitChange: 0 }
      ],
      duration: 3
    };
    
    const irr3 = this.financialEngine.calculateIRR(scenario3);
    
    this.testResults.push({
      test: 'IRR Test 3: No IRR (all negative flows)',
      passed: irr3 === null,
      actual: irr3,
      expected: null,
      formula: 'Cash flows: [-100, 0, 0, 0] → No IRR'
    });
  }

  /**
   * Test edge cases and error handling
   */
  testEdgeCases() {
    console.log('📊 Testing edge cases...');
    
    // Test Case 1: Zero cost (divide by zero in ROI)
    const scenario1 = {
      changes: [
        { costChange: 0, benefitChange: 100000 }
      ]
    };
    
    const roi1 = this.financialEngine.calculateROI(scenario1);
    
    this.testResults.push({
      test: 'Edge Case 1: Zero cost (ROI)',
      passed: roi1 === 0, // Should handle gracefully
      actual: roi1,
      expected: 0,
      formula: 'Zero cost → ROI = 0 (not infinity)'
    });
    
    // Test Case 2: Empty changes array
    const scenario2 = {
      changes: [],
      duration: 3
    };
    
    const npv2 = this.financialEngine.calculateNPV(scenario2, 10);
    const roi2 = this.financialEngine.calculateROI(scenario2);
    
    this.testResults.push({
      test: 'Edge Case 2: Empty changes',
      passed: npv2 === 0 && roi2 === 0,
      actual: `NPV: ${npv2}, ROI: ${roi2}`,
      expected: 'NPV: 0, ROI: 0',
      formula: 'No changes → All metrics = 0'
    });
    
    // Test Case 3: Very large numbers
    const scenario3 = {
      changes: [
        { costChange: -10000000, benefitChange: 25000000 }
      ],
      duration: 5
    };
    
    const roi3 = this.financialEngine.calculateROI(scenario3);
    const expected3 = 150;
    
    this.testResults.push({
      test: 'Edge Case 3: Large numbers',
      passed: roi3 === expected3,
      actual: roi3,
      expected: expected3,
      formula: 'ROI = (25M - 10M) / 10M × 100 = 150%'
    });
    
    // Test Case 4: Negative discount rate
    const scenario4 = {
      changes: [
        { costChange: -100000, benefitChange: 40000 }
      ],
      duration: 3
    };
    
    const npv4 = this.financialEngine.calculateNPV(scenario4, -5);
    
    this.testResults.push({
      test: 'Edge Case 4: Negative discount rate',
      passed: !isNaN(npv4) && isFinite(npv4),
      actual: npv4,
      expected: 'Valid number (handles negative rate)',
      formula: 'NPV with negative discount rate should not crash'
    });
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const failed = this.testResults.filter(t => !t.passed).length;
    const total = this.testResults.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return {
      total,
      passed,
      failed,
      passRate,
      tests: this.testResults,
      status: passRate === 100 ? 'PASS' : 'FAIL'
    };
  }

  /**
   * Export validation report as JSON
   */
  exportReport() {
    const summary = this.generateSummary();
    const report = {
      title: 'EA Toolkit - KPI Validation Report',
      date: new Date().toISOString(),
      summary,
      tests: this.testResults,
      formulas: {
        NPV: 'NPV = Σ(CFt / (1+r)^t) where CFt = cash flow at time t, r = discount rate',
        ROI: 'ROI = (Total Benefit - Total Cost) / Total Cost × 100',
        Payback: 'Payback = Year when Cumulative Cash Flow >= 0',
        IRR: 'IRR = r where NPV(r) = 0 (solved using Newton-Raphson method)'
      },
      benchmarks: {
        NPV: 'Positive NPV indicates value creation',
        ROI: '> 15% considered good, > 25% excellent',
        Payback: '< 2 years ideal, < 3 years acceptable',
        IRR: '> WACC (typically 8-12%) indicates project viability'
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KPI_Validation_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📄 Validation report exported');
  }

  /**
   * Get detailed test results as HTML
   */
  getResultsHTML() {
    const summary = this.generateSummary();
    
    let html = `
      <div style="font-family: 'Segoe UI', sans-serif; padding: 20px;">
        <h2 style="color: #1e3a8a;">KPI Validation Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <div style="background: ${summary.status === 'PASS' ? '#d1fae5' : '#fee2e2'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0;">Summary: ${summary.status}</h3>
          <p>Pass Rate: <strong>${summary.passRate}%</strong> (${summary.passed}/${summary.total} tests passed)</p>
        </div>
        
        <h3>Test Results</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #d1d5db;">Test</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #d1d5db;">Status</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #d1d5db;">Expected</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #d1d5db;">Actual</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #d1d5db;">Formula</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    this.testResults.forEach(test => {
      const statusIcon = test.passed ? '✅' : '❌';
      const statusColor = test.passed ? '#10b981' : '#ef4444';
      
      html += `
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${test.test}</td>
          <td style="padding: 10px; border: 1px solid #d1d5db; color: ${statusColor}; font-weight: 600;">${statusIcon} ${test.passed ? 'PASS' : 'FAIL'}</td>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${test.expected}</td>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${test.actual}</td>
          <td style="padding: 10px; border: 1px solid #d1d5db; font-size: 12px; font-family: monospace;">${test.formula}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    return html;
  }
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined') {
  window.EA_KPI_Validator = EA_KPI_Validator;
}