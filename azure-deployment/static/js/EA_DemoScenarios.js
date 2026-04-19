/**
 * EA_DemoScenarios.js  
 * Comprehensive demo scenarios for Banking, Finance/FinTech, and Insurance industries
 * Provides realistic E2E data for toolkit demonstration and testing
 * 
 * @version 2.0
 * @date April 19, 2026
 */

class EA_DemoScenarios {
  constructor() {
    this.accountManager = new EA_AccountManager();
    console.log('EA_DemoScenarios initialized');
  }

  /**
   * Load Banking Industry Demo Scenario
   */
  loadBankingDemo() {
    console.log('🏦 Loading Banking Industry Demo Scenario...');

    const accountId = 'BANK-2026-001';
    const engagementId = 'ENG-BANK-2026-001';
    const opportunityId = 'OPP-BANK-2026-001';

    const bankingAccount = {
      id: accountId,
      name: 'Nordic Universal Bank',
      accountManager: 'David Anderson',
      ACV: 3250000,
      industry: 'Banking',
      region: 'Nordics',
      size: 'Large Enterprise',
      health: 'good',
      strategicPriorities: [
        'Digital banking transformation',
        'Open Banking & PSD2/PSD3 compliance',
        'Core banking modernization'
      ],
      businessStrategy: 'Transform from traditional branch-based bank to digital-first financial services provider.',
      painPoints: [
        'Core banking system from 1998 - costly and inflexible',
        'Unable to launch new products quickly',
        'Customer data fragmented across 23 systems'
      ],
      engagements: [engagementId],
      opportunities: [opportunityId],
      stakeholders: [],
      applications: [],
      capabilities: [],
      metadata: {
        createdAt: new Date('2026-02-10').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    const bankingOpportunity = {
      id: opportunityId,
      accountId: accountId,
      name: 'Core Banking Modernization & Open Banking Platform',
      status: 'negotiate',
      stage: 4,
      estimatedValue: 5800000,
      probability: 85,
      closeDate: new Date('2026-06-15').toISOString().split('T')[0],
      sponsor: 'Anna Svensson, Chief Technology Officer',
      linkedInitiatives: ['INIT-CORE', 'INIT-API', 'INIT-MOBILE'],
      linkedEngagements: [engagementId],
      valueCase: 'VC-BANK-2026-001',
      competitors: ['Thoughtworks', 'Accenture', 'Capgemini'],
      nextSteps: [
        'Final contract negotiations (Apr 20)',
        'Executive presentation (Apr 30)',
        'Contract signature target (June 15)'
      ],
      risks: [],
      metadata: {
        createdAt: new Date('2026-02-15').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    localStorage.setItem(`ea_account_${accountId}`, JSON.stringify(bankingAccount));
    localStorage.setItem(`ea_opportunity_${opportunityId}`, JSON.stringify(bankingOpportunity));

    console.log('✅ Banking demo loaded: Nordic Universal Bank');
    this.trackEvent('banking_demo_loaded');
    return { accountId, opportunityId, engagementId };
  }

  /**
   * Load FinTech Industry Demo Scenario
   */
  loadFinTechDemo() {
    console.log('💳 Loading FinTech Industry Demo Scenario...');

    const accountId = 'FINTECH-2026-001';
    const engagementId = 'ENG-FINTECH-2026-001';
    const opportunityId = 'OPP-FINTECH-2026-001';

    const fintechAccount = {
      id: accountId,
      name: 'PayNordic - Digital Payment Platform',
      accountManager: 'Lisa Park',
      ACV: 1450000,
      industry: 'Fintech',
      region: 'Nordics',
      size: 'Growth Stage Startup',
      health: 'excellent',
      strategicPriorities: [
        'Series B scale-up: 10x transaction volume capacity',
        'Multi-currency expansion',
        'PSD2 compliance'
      ],
      businessStrategy: 'Scale from Nordic regional player to European payment platform.',
      painPoints: [
        'Monolithic app struggling at 850 TPS',
        'Manual reconciliation with 14 acquiring banks',
        'Database bottleneck issues'
      ],
      engagements: [engagementId],
      opportunities: [opportunityId],
      stakeholders: [],
      applications: [],
      capabilities: [],
      metadata: {
        createdAt: new Date('2026-03-01').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    const fintechOpportunity = {
      id: opportunityId,
      accountId: accountId,
      name: 'Payment Platform Re-Architecture for Series B Scale',
      status: 'qualify',
      stage: 2,
      estimatedValue: 1850000,
      probability: 65,
      closeDate: new Date('2026-07-31').toISOString().split('T')[0],
      sponsor: 'Marcus Johansson, Co-Founder & CTO',
      linkedInitiatives: ['INIT-MICROSERVICES', 'INIT-CLOUD'],
      linkedEngagements: [engagementId],
      valueCase: 'VC-FINTECH-2026-001',
      competitors: ['AWS Professional Services', 'Thoughtworks'],
      nextSteps: [
        'Architecture assessment (Apr 22-26)',
        'POC: Event-driven payment processing (May 15-June 5)'
      ],
      risks: [],
      metadata: {
        createdAt: new Date('2026-03-05').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    localStorage.setItem(`ea_account_${accountId}`, JSON.stringify(fintechAccount));
    localStorage.setItem(`ea_opportunity_${opportunityId}`, JSON.stringify(fintechOpportunity));

    console.log('✅ FinTech demo loaded: PayNordic');
    this.trackEvent('fintech_demo_loaded');
    return { accountId, opportunityId, engagementId };
  }

  /**
   * Load Insurance demo (calls UserGuide if available)
   */
  loadInsuranceDemo() {
    if (typeof window.userGuide !== 'undefined' && userGuide.loadInsuranceDemoData) {
      return userGuide.loadInsuranceDemoData();
    }
    console.warn('Insurance demo not available');
    return null;
  }

  /**
   * Load all 3 industry demos at once
   */
  loadAllDemos() {
    console.log('🌍 Loading ALL Industry Demo Scenarios...');
    
    const banking = this.loadBankingDemo();
    const fintech = this.loadFinTechDemo();
    const insurance = this.loadInsuranceDemo();

    console.log('✅ All demo scenarios loaded successfully!');
    return { banking, fintech, insurance };
  }

  /**
   * Clear all demo data
   */
  clearAllDemos() {
    console.log('🗑️  Clearing all demo data...');
    
    const demoKeys = [
      'BANK-2026-001',
      'FINTECH-2026-001',
      'INS-2026-001'
    ];

    demoKeys.forEach(key => {
      localStorage.removeItem(`ea_account_${key}`);
      localStorage.removeItem(`ea_opportunity_${key}`);
      localStorage.removeItem(`ea_engagement_model_${key}`);
    });

    console.log('✅ Demo data cleared');
    this.trackEvent('demo_data_cleared');
  }

  /**
   * Track usage event
   */
  trackEvent(eventName) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      module: 'EA_DemoScenarios'
    };

    const events = JSON.parse(localStorage.getItem('ea_usage_events') || '[]');
    events.push(event);

    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem('ea_usage_events', JSON.stringify(events));
    console.log(`📊 Event tracked: ${eventName}`);
  }
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined') {
  window.EA_DemoScenarios = EA_DemoScenarios;
}
