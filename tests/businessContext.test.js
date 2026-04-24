// Phase 1: Business Context Data Model Tests
// These tests should FAIL initially (RED phase)
// We'll implement the code to make them pass (GREEN phase)

const {
  createTestModel,
  createLegacyModel,
  createFullyEnrichedModel,
  createPartiallyEnrichedModel
} = require('./fixtures/models');

// Import functions to test
const {
  buildBusinessContextContext,
  migrateStrategicIntentToBusinessContext,
  initializeEnrichment,
  validateBusinessContext
} = require('../NexGenEA/js/businessContext');

describe('Phase 1: Business Context Data Model', () => {
  
  describe('businessContext structure', () => {
    
    test('has mandatory org_name field', () => {
      const model = createTestModel();
      expect(model.businessContext).toHaveProperty('org_name');
      expect(typeof model.businessContext.org_name).toBe('string');
    });

    test('has mandatory industry field', () => {
      const model = createTestModel();
      expect(model.businessContext).toHaveProperty('industry');
      expect(typeof model.businessContext.industry).toBe('string');
    });

    test('has primaryObjectives array with proper structure', () => {
      const model = createFullyEnrichedModel();
      expect(Array.isArray(model.businessContext.primaryObjectives)).toBe(true);
      expect(model.businessContext.primaryObjectives.length).toBeGreaterThan(0);
      
      const objective = model.businessContext.primaryObjectives[0];
      expect(objective).toHaveProperty('id');
      expect(objective).toHaveProperty('objective');
      expect(objective).toHaveProperty('category');
      expect(objective).toHaveProperty('measurable');
      expect(objective).toHaveProperty('kpis');
      expect(Array.isArray(objective.kpis)).toBe(true);
    });

    test('has enrichment object with all required fields', () => {
      const model = createTestModel();
      const enrichment = model.businessContext.enrichment;
      
      expect(enrichment).toHaveProperty('bmcInsights');
      expect(enrichment).toHaveProperty('capabilityGaps');
      expect(enrichment).toHaveProperty('operatingModelRisks');
      expect(enrichment).toHaveProperty('criticalGaps');
      expect(enrichment).toHaveProperty('valueStreamInsights');
      expect(enrichment).toHaveProperty('roadmapConstraints');
      expect(enrichment).toHaveProperty('validatedData');
      expect(enrichment).toHaveProperty('questionnaireResponses');
      expect(enrichment).toHaveProperty('completenessScore');
      
      // Validate validatedData structure
      expect(enrichment.validatedData).toHaveProperty('organizationValidation');
      expect(enrichment.validatedData).toHaveProperty('objectiveBenchmarks');
      expect(enrichment.validatedData).toHaveProperty('industryInsights');
      expect(enrichment.validatedData).toHaveProperty('technologyValidation');
      expect(enrichment.validatedData).toHaveProperty('regulatoryContext');
    });
  });

  describe('buildBusinessContextContext()', () => {
    
    test('builds context string from businessContext data', () => {
      const model = createFullyEnrichedModel();
      const context = buildBusinessContextContext(model);
      
      expect(typeof context).toBe('string');
      expect(context).toContain('Global Tech Solutions');
      expect(context).toContain('Technology Services');
      expect(context).toContain('Achieve 30% revenue growth');
    });

    test('includes enrichment data in context', () => {
      const model = createFullyEnrichedModel();
      const context = buildBusinessContextContext(model);
      
      expect(context).toContain('BMC Insights');
      expect(context).toContain('Capability Gaps');
      expect(context).toContain('Critical Gaps');
    });

    test('handles empty businessContext gracefully', () => {
      const model = createTestModel();
      const context = buildBusinessContextContext(model);
      
      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(0);
      // Should still return valid context even with empty data
    });
  });

  describe('migrateStrategicIntentToBusinessContext()', () => {
    
    test('migrates legacy strategicIntent to new businessContext structure', () => {
      const legacyModel = createLegacyModel();
      const migratedModel = migrateStrategicIntentToBusinessContext(legacyModel);
      
      expect(migratedModel).toHaveProperty('businessContext');
      expect(migratedModel.businessContext.org_name).toBe('Legacy Corp');
      expect(migratedModel.businessContext.industry).toBe('Manufacturing');
    });

    test('preserves legacy strategicIntent alongside new businessContext', () => {
      const legacyModel = createLegacyModel();
      const migratedModel = migrateStrategicIntentToBusinessContext(legacyModel);
      
      // Both should exist during transition period
      expect(migratedModel).toHaveProperty('strategicIntent');
      expect(migratedModel).toHaveProperty('businessContext');
    });

    test('merges businessObjectives into primaryObjectives', () => {
      const legacyModel = createLegacyModel();
      const migratedModel = migrateStrategicIntentToBusinessContext(legacyModel);
      
      expect(migratedModel.businessContext.primaryObjectives).toBeDefined();
      expect(migratedModel.businessContext.primaryObjectives.length).toBeGreaterThan(0);
      expect(migratedModel.businessContext.primaryObjectives[0].objective).toBe('Modernize core systems');
    });

    test('converts success_metrics to successMetrics array', () => {
      const legacyModel = createLegacyModel();
      const migratedModel = migrateStrategicIntentToBusinessContext(legacyModel);
      
      expect(Array.isArray(migratedModel.businessContext.successMetrics)).toBe(true);
      expect(migratedModel.businessContext.successMetrics.length).toBe(2);
    });

    test('demotes strategic_ambition to optional strategicVision', () => {
      const legacyModel = createLegacyModel();
      const migratedModel = migrateStrategicIntentToBusinessContext(legacyModel);
      
      expect(migratedModel.businessContext.strategicVision).toBeDefined();
      expect(migratedModel.businessContext.strategicVision.ambition).toBe('Transform into digital leader');
      expect(migratedModel.businessContext.strategicVision.timeframe).toBe('2-3 years');
    });
  });

  describe('initializeEnrichment()', () => {
    
    test('creates empty enrichment structure', () => {
      const enrichment = initializeEnrichment();
      
      expect(enrichment).toHaveProperty('bmcInsights');
      expect(enrichment).toHaveProperty('completenessScore');
      expect(enrichment.completenessScore).toBe(0);
    });
  });

  describe('validateBusinessContext()', () => {
    
    test('validates mandatory fields are present', () => {
      const model = createTestModel();
      model.businessContext.org_name = '';
      
      const validation = validateBusinessContext(model.businessContext);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('org_name is required');
    });

    test('passes validation for complete businessContext', () => {
      const model = createFullyEnrichedModel();
      const validation = validateBusinessContext(model.businessContext);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});
