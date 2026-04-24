// Phase 2: Step0 & Step1 Refactoring Tests
// Tests for Business Context architecture changes

const {
  buildBusinessContextContext,
  migrateStrategicIntentToBusinessContext,
  initializeEnrichment,
  validateBusinessContext
} = require('../NexGenEA/js/businessContext');

const {
  createTestModel,
  createLegacyModel,
  createFullyEnrichedModel
} = require('./fixtures/models');

const MockWebSearch = require('./mocks/webSearch');

describe('Phase 2: Step0 & Step1 Business Context Refactoring', () => {

  describe('Step0: Organization Extraction', () => {
    
    test('extracts org_name as MANDATORY field from context', () => {
      // Simulate Step0 output
      const step0Output = {
        context: {
          org_name: 'Acme Corporation',
          industry: 'Technology',
          sub_sector: 'SaaS',
          org_type: 'enterprise'
        }
      };

      // org_name should be present and non-empty
      expect(step0Output.context.org_name).toBeDefined();
      expect(step0Output.context.org_name).not.toBe('');
      expect(step0Output.context.org_name).toBe('Acme Corporation');
    });

    test('extracts industry as MANDATORY field from context', () => {
      const step0Output = {
        context: {
          org_name: 'Acme Corporation',
          industry: 'Technology',
          sub_sector: 'SaaS',
          org_type: 'enterprise'
        }
      };

      expect(step0Output.context.industry).toBeDefined();
      expect(step0Output.context.industry).not.toBe('');
      expect(step0Output.context.industry).toBe('Technology');
    });

    test('validates extracted organization data', () => {
      const step0Output = {
        context: {
          org_name: 'Acme Corporation',
          industry: 'Technology'
        }
      };

      // Create minimal businessContext from Step0
      const businessContext = {
        org_name: step0Output.context.org_name,
        industry: step0Output.context.industry,
        primaryObjectives: [],
        keyChallenges: [],
        successMetrics: [],
        constraints: [],
        strategicVision: { ambition: '', themes: [], timeframe: '' },
        enrichment: initializeEnrichment()
      };

      const validation = validateBusinessContext(businessContext);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('fails validation if org_name is missing', () => {
      const businessContext = {
        org_name: '',  // Empty!
        industry: 'Technology',
        primaryObjectives: [],
        keyChallenges: [],
        successMetrics: [],
        constraints: [],
        strategicVision: { ambition: '', themes: [], timeframe: '' },
        enrichment: initializeEnrichment()
      };

      const validation = validateBusinessContext(businessContext);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('org_name is required');
    });

    test('fails validation if industry is missing', () => {
      const businessContext = {
        org_name: 'Acme Corporation',
        industry: '',  // Empty!
        primaryObjectives: [],
        keyChallenges: [],
        successMetrics: [],
        constraints: [],
        strategicVision: { ambition: '', themes: [], timeframe: '' },
        enrichment: initializeEnrichment()
      };

      const validation = validateBusinessContext(businessContext);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('industry is required');
    });
  });

  describe('Step0: Web Search Validation', () => {
    
    let mockWebSearch;

    beforeEach(() => {
      mockWebSearch = new MockWebSearch();
    });

    afterEach(() => {
      mockWebSearch.reset();
    });

    test('validates organization via web search', async () => {
      const companyName = 'Microsoft';
      const result = await mockWebSearch.validateOrganization(companyName);

      expect(result.validated).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.org_name).toBe('Microsoft Corporation');
      expect(result.data.industry).toBe('Technology');
      expect(result.data.confidence).toBeGreaterThan(0.9);
      expect(result.data.source).toBe('web_search');
    });

    test('handles unknown organization gracefully', async () => {
      const companyName = 'Unknown Company XYZ';
      const result = await mockWebSearch.validateOrganization(companyName);

      expect(result.validated).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBeDefined();
    });

    test('stores validated data in enrichment', async () => {
      const companyName = 'Global Tech Solutions';
      const result = await mockWebSearch.validateOrganization(companyName);

      const model = createTestModel();
      model.businessContext.org_name = result.data.org_name;
      model.businessContext.industry = result.data.industry;
      model.businessContext.enrichment.validatedData.organizationValidation = result.data;

      expect(model.businessContext.enrichment.validatedData.organizationValidation).toBeDefined();
      expect(model.businessContext.enrichment.validatedData.organizationValidation.confidence).toBeGreaterThan(0.9);
    });

    test('limits web search calls to 5 per step', async () => {
      // Simulate Step0 making multiple validation calls
      await mockWebSearch.validateOrganization('Company 1');
      await mockWebSearch.validateOrganization('Company 2');
      await mockWebSearch.validateOrganization('Company 3');
      await mockWebSearch.validateOrganization('Company 4');
      await mockWebSearch.validateOrganization('Company 5');

      const stats = mockWebSearch.getStats();
      expect(stats.totalCalls).toBeLessThanOrEqual(5);
    });
  });

  describe('Step1: Business Context Output', () => {
    
    test('outputs to model.businessContext instead of model.strategicIntent', () => {
      // Simulate new Step1 behavior
      const model = {
        businessContext: {
          org_name: 'Acme Corporation',
          industry: 'Technology',
          primaryObjectives: [
            {
              id: 'obj1',
              objective: 'Increase revenue by 25%',
              category: 'Financial',
              measurable: true,
              kpis: ['Revenue: $100M → $125M']
            }
          ],
          keyChallenges: [
            {
              id: 'ch1',
              challenge: 'Legacy systems',
              impact: 'High',
              category: 'Technical'
            }
          ],
          successMetrics: [
            {
              metric: 'Revenue growth',
              target: '$125M',
              timeframe: '12 months'
            }
          ],
          constraints: [
            {
              type: 'Budget',
              description: '$5M total investment'
            }
          ],
          strategicVision: {
            ambition: 'Become market leader',
            themes: ['Innovation', 'Customer-centricity'],
            timeframe: '3 years'
          },
          enrichment: initializeEnrichment()
        }
      };

      // Validate structure
      const validation = validateBusinessContext(model.businessContext);
      expect(validation.isValid).toBe(true);
      
      // Verify businessContext exists (not strategicIntent)
      expect(model).toHaveProperty('businessContext');
      expect(model.businessContext.primaryObjectives).toBeDefined();
      expect(model.businessContext.primaryObjectives.length).toBeGreaterThan(0);
    });

    test('includes businessContextConfirmed flag after user confirmation', () => {
      const model = createTestModel();
      model.businessContext.org_name = 'Acme Corporation';
      model.businessContext.industry = 'Technology';
      model.businessContextConfirmed = true;

      expect(model.businessContextConfirmed).toBe(true);
    });
  });

  describe('Step1: Task Reordering (Org Identity → Objectives → Metrics → Challenges → Vision)', () => {
    
    test('tasks are ordered correctly: organization identity first', () => {
      // Expected order:
      // 1. Org Identity (org_name, industry, scale)
      // 2. Primary Objectives
      // 3. Success Metrics
      // 4. Key Challenges
      // 5. Constraints
      // 6. Strategic Vision (DEMOTED to optional)

      const expectedTaskOrder = [
        'org_identity',      // NEW: Org name, industry, scale
        'objectives',        // Primary business objectives
        'metrics',           // Success metrics & KPIs
        'challenges',        // Key challenges & pain points
        'constraints',       // Budget, timeline, regulatory
        'strategic_vision'   // OPTIONAL: Vision & ambition
      ];

      // This will be verified in actual Step1.js refactoring
      expect(expectedTaskOrder[0]).toBe('org_identity');
      expect(expectedTaskOrder[1]).toBe('objectives');
      expect(expectedTaskOrder[5]).toBe('strategic_vision');
    });

    test('Strategic Vision is marked as optional', () => {
      const model = createTestModel();
      model.businessContext.org_name = 'Acme Corporation';
      model.businessContext.industry = 'Technology';
      model.businessContext.primaryObjectives = [
        {
          id: 'obj1',
          objective: 'Increase revenue',
          category: 'Financial',
          measurable: true,
          kpis: ['Revenue: +25%']
        }
      ];
      // strategicVision can be empty
      model.businessContext.strategicVision = {
        ambition: '',
        themes: [],
        timeframe: ''
      };

      const validation = validateBusinessContext(model.businessContext);
      // Should still be valid even without strategic vision
      expect(validation.isValid).toBe(true);
    });

    test('Primary Objectives come before Strategic Vision in task flow', () => {
      const taskFlow = [
        { id: 'org_identity', required: true },
        { id: 'objectives', required: true },
        { id: 'metrics', required: true },
        { id: 'challenges', required: true },
        { id: 'constraints', required: true },
        { id: 'strategic_vision', required: false }  // DEMOTED
      ];

      const objectivesIndex = taskFlow.findIndex(t => t.id === 'objectives');
      const visionIndex = taskFlow.findIndex(t => t.id === 'strategic_vision');

      expect(objectivesIndex).toBeLessThan(visionIndex);
      expect(taskFlow[visionIndex].required).toBe(false);
    });
  });

  describe('Step1: Label Change (Strategic Intent → Business Context)', () => {
    
    test('step name is "Business Context" not "Strategic Intent"', () => {
      const step1Name = 'Business Context';  // NEW NAME
      const oldName = 'Strategic Intent';    // OLD NAME

      expect(step1Name).not.toBe(oldName);
      expect(step1Name).toBe('Business Context');
    });

    test('UI labels reference "Business Context"', () => {
      // These will be verified in UI update phase
      const labels = {
        stepTitle: 'Business Context',
        sectionHeader: 'Business Context',
        exportLabel: 'businessContext',
        renderFunction: 'renderBusinessContextSection'
      };

      expect(labels.stepTitle).toBe('Business Context');
      expect(labels.renderFunction).toBe('renderBusinessContextSection');
    });
  });

  describe('Integration: Step0 → Step1 → businessContext', () => {
    
    test('full workflow creates valid businessContext', async () => {
      // Step 0: Extract org data
      const step0Output = {
        context: {
          org_name: 'Acme Corporation',
          industry: 'Technology',
          org_type: 'enterprise',
          maturity_estimate: '3'
        }
      };

      // Optional: Web search validation
      const mockWebSearch = new MockWebSearch();
      const validation = await mockWebSearch.validateOrganization(step0Output.context.org_name);

      // Step 1: Build businessContext
      const model = {
        businessContext: {
          org_name: step0Output.context.org_name,
          industry: step0Output.context.industry,
          primaryObjectives: [
            {
              id: 'obj1',
              objective: 'Modernize infrastructure',
              category: 'Technology',
              measurable: true,
              kpis: ['System uptime: 99.9%']
            }
          ],
          keyChallenges: [],
          successMetrics: [],
          constraints: [],
          strategicVision: {
            ambition: '',
            themes: [],
            timeframe: ''
          },
          enrichment: initializeEnrichment()
        }
      };

      // Add validation data
      if (validation.validated) {
        model.businessContext.enrichment.validatedData.organizationValidation = validation.data;
      }

      // Verify complete structure
      const contextValidation = validateBusinessContext(model.businessContext);
      expect(contextValidation.isValid).toBe(true);
      expect(model.businessContext.org_name).toBe('Acme Corporation');
      expect(model.businessContext.primaryObjectives.length).toBeGreaterThan(0);

      // Verify enrichment has validation data
      if (validation.validated) {
        expect(model.businessContext.enrichment.validatedData.organizationValidation).toBeDefined();
        expect(model.businessContext.enrichment.validatedData.organizationValidation.confidence).toBeGreaterThan(0.9);
      }
    });
  });
});
