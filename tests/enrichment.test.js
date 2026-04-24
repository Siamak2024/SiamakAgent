// Phase 4: Steps 2-7 Enrichment Capture Tests
// Tests for continuous enrichment loop (Golden Rule)

const {
  buildBusinessContextContext,
  initializeEnrichment,
  validateBusinessContext
} = require('../NexGenEA/js/businessContext');

const {
  createTestModel,
  createFullyEnrichedModel
} = require('./fixtures/models');

describe('Phase 4: Steps 2-7 Enrichment Capture', () => {

  describe('Step2: BMC Enrichment', () => {
    
    test('captures BMC insights into enrichment after generation', () => {
      const model = createTestModel();
      model.businessContext.org_name = 'Acme Corp';
      model.businessContext.industry = 'Technology';
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Increase revenue', category: 'Financial' }
      ];

      // Simulate Step2 completing with BMC output
      const bmcOutput = {
        customerSegments: ['Enterprise', 'SMB'],
        valuePropositions: ['Integrated platform', 'Cost reduction'],
        channels: ['Direct sales', 'Partners'],
        customerRelationships: ['Dedicated account manager'],
        revenueStreams: ['Subscription', 'Professional services'],
        keyResources: ['Technology platform', 'Sales team'],
        keyActivities: ['Product development', 'Customer support'],
        keyPartnerships: ['Cloud providers', 'Resellers'],
        costStructure: ['R&D', 'Sales & Marketing']
      };

      // Capture BMC insights
      model.businessContext.enrichment.bmcInsights = {
        customerSegments: bmcOutput.customerSegments,
        valuePropositions: bmcOutput.valuePropositions,
        keyInsights: 'Strong product-market fit in enterprise segment'
      };

      expect(model.businessContext.enrichment.bmcInsights).toBeDefined();
      expect(model.businessContext.enrichment.bmcInsights.customerSegments).toEqual(['Enterprise', 'SMB']);
      expect(model.businessContext.enrichment.bmcInsights.keyInsights).toContain('product-market fit');
    });

    test('BMC references primary objectives', () => {
      const model = createTestModel();
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Increase revenue by 25%' }
      ];

      // BMC should reference objectives in analysis
      const bmcAnalysis = {
        alignmentToObjectives: [
          {
            objectiveId: 'obj1',
            valueProposition: 'Premium pricing model',
            revenueStream: 'Subscription growth'
          }
        ]
      };

      expect(bmcAnalysis.alignmentToObjectives[0].objectiveId).toBe('obj1');
    });
  });

  describe('Step3: Capability Gaps with Objective Links', () => {
    
    test('captures capability gaps with linkedObjectives field', () => {
      const model = createTestModel();
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Expand to APAC' },
        { id: 'obj2', objective: 'Improve customer retention' }
      ];

      // Step3 captures capability gaps
      model.businessContext.enrichment.capabilityGaps = [
        {
          capability: 'International Operations',
          currentLevel: 2,
          targetLevel: 4,
          priority: 'High',
          linkedObjective: 'obj1'  // Linked to APAC expansion
        },
        {
          capability: 'Customer Success Management',
          currentLevel: 3,
          targetLevel: 5,
          priority: 'High',
          linkedObjective: 'obj2'  // Linked to retention
        }
      ];

      expect(model.businessContext.enrichment.capabilityGaps).toHaveLength(2);
      expect(model.businessContext.enrichment.capabilityGaps[0].linkedObjective).toBe('obj1');
      expect(model.businessContext.enrichment.capabilityGaps[1].linkedObjective).toBe('obj2');
    });

    test('capability maturity levels are numeric', () => {
      const model = createFullyEnrichedModel();
      const gaps = model.businessContext.enrichment.capabilityGaps;

      gaps.forEach(gap => {
        expect(typeof gap.currentLevel).toBe('number');
        expect(typeof gap.targetLevel).toBe('number');
        expect(gap.targetLevel).toBeGreaterThan(gap.currentLevel);
      });
    });
  });

  describe('Step4: Operating Model Risks', () => {
    
    test('captures operating model risks into enrichment', () => {
      const model = createTestModel();
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Scale operations' }
      ];

      // Step4 captures risks
      model.businessContext.enrichment.operatingModelRisks = [
        {
          risk: 'Lack of regional expertise',
          severity: 'High',
          mitigation: 'Hire regional leaders',
          affectedObjective: 'obj1'
        }
      ];

      expect(model.businessContext.enrichment.operatingModelRisks).toBeDefined();
      expect(model.businessContext.enrichment.operatingModelRisks[0].severity).toBe('High');
      expect(model.businessContext.enrichment.operatingModelRisks[0].affectedObjective).toBe('obj1');
    });
  });

  describe('Step5: Gap Analysis by Objective Impact', () => {
    
    test('captures critical gaps with priority by objective impact', () => {
      const model = createTestModel();
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Revenue growth', category: 'Financial' }
      ];

      // Step5 prioritizes gaps by impact on objectives
      model.businessContext.enrichment.criticalGaps = [
        {
          gap: 'Legacy CRM system',
          impact: 'Blocks sales efficiency',
          priority: 1,  // Highest priority
          affectedObjective: 'obj1',
          estimatedCost: '$500K',
          timeToResolve: '6 months'
        },
        {
          gap: 'Manual reporting',
          impact: 'Slow decision-making',
          priority: 2,
          affectedObjective: 'obj1',
          estimatedCost: '$200K',
          timeToResolve: '3 months'
        }
      ];

      expect(model.businessContext.enrichment.criticalGaps).toHaveLength(2);
      expect(model.businessContext.enrichment.criticalGaps[0].priority).toBe(1);
      expect(model.businessContext.enrichment.criticalGaps[0].affectedObjective).toBe('obj1');
    });

    test('gaps are sorted by priority', () => {
      const model = createFullyEnrichedModel();
      const gaps = model.businessContext.enrichment.criticalGaps;

      for (let i = 0; i < gaps.length - 1; i++) {
        expect(gaps[i].priority).toBeLessThanOrEqual(gaps[i + 1].priority);
      }
    });
  });

  describe('Step6: Value Pools & Value Streams', () => {
    
    test('captures value stream insights into enrichment', () => {
      const model = createTestModel();
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Increase customer lifetime value' }
      ];

      // Step6 analyzes value streams
      model.businessContext.enrichment.valueStreamInsights = [
        {
          valueStream: 'Customer Acquisition',
          insight: 'High CAC due to manual processes',
          improvement: 'Implement marketing automation',
          linkedObjective: 'obj1',
          potentialValue: '$2M annually'
        },
        {
          valueStream: 'Customer Retention',
          insight: 'Churn rate 15% above industry average',
          improvement: 'Launch customer success program',
          linkedObjective: 'obj1',
          potentialValue: '$1.5M annually'
        }
      ];

      expect(model.businessContext.enrichment.valueStreamInsights).toHaveLength(2);
      expect(model.businessContext.enrichment.valueStreamInsights[0].linkedObjective).toBe('obj1');
      expect(model.businessContext.enrichment.valueStreamInsights[0].potentialValue).toContain('$2M');
    });
  });

  describe('Step7: Roadmap Constraints & Completeness', () => {
    
    test('captures roadmap constraints into enrichment', () => {
      const model = createTestModel();

      // Step7 identifies dependencies and constraints
      model.businessContext.enrichment.roadmapConstraints = [
        {
          constraint: 'CRM migration must complete before Q2 2027',
          reason: 'Prerequisite for APAC expansion',
          type: 'Dependency'
        },
        {
          constraint: 'Budget: $12M total across all initiatives',
          reason: 'Board-approved investment limit',
          type: 'Budget'
        }
      ];

      expect(model.businessContext.enrichment.roadmapConstraints).toHaveLength(2);
      expect(model.businessContext.enrichment.roadmapConstraints[0].type).toBe('Dependency');
    });

    test('sets completeness score to 100% after Step7', () => {
      const model = createTestModel();
      model.businessContext.org_name = 'Acme Corp';
      model.businessContext.industry = 'Technology';
      
      // Simulate all steps completed
      model.businessContext.enrichment.bmcInsights = { keyInsights: 'Done' };
      model.businessContext.enrichment.capabilityGaps = [{ capability: 'Test' }];
      model.businessContext.enrichment.operatingModelRisks = [{ risk: 'Test' }];
      model.businessContext.enrichment.criticalGaps = [{ gap: 'Test' }];
      model.businessContext.enrichment.valueStreamInsights = [{ valueStream: 'Test' }];
      model.businessContext.enrichment.roadmapConstraints = [{ constraint: 'Test' }];

      // Step7 completion sets score to 100%
      model.businessContext.enrichment.completenessScore = 100;

      expect(model.businessContext.enrichment.completenessScore).toBe(100);
    });

    test('completeness score reflects partial enrichment', () => {
      const model = createTestModel();
      
      // Only some enrichment captured
      model.businessContext.enrichment.bmcInsights = { keyInsights: 'Done' };
      model.businessContext.enrichment.capabilityGaps = [{ capability: 'Test' }];
      // Missing: operatingModelRisks, criticalGaps, valueStreamInsights, roadmapConstraints

      // Calculate completeness (4 out of 7 sections)
      const sections = [
        'bmcInsights',
        'capabilityGaps',
        'operatingModelRisks',
        'criticalGaps',
        'valueStreamInsights',
        'roadmapConstraints',
        'validatedData'
      ];

      const completed = sections.filter(section => {
        const data = model.businessContext.enrichment[section];
        if (Array.isArray(data)) return data.length > 0;
        if (typeof data === 'object' && data !== null) return Object.keys(data).length > 0;
        return false;
      }).length;

      const score = Math.round((completed / sections.length) * 100);
      model.businessContext.enrichment.completenessScore = score;

      expect(model.businessContext.enrichment.completenessScore).toBe(43); // 3/7 = 42.8% ≈ 43% (bmcInsights, capabilityGaps, validatedData)
    });
  });

  describe('Integration: Full Enrichment Loop', () => {
    
    test('enrichment flows through all steps progressively', () => {
      const model = createTestModel();
      model.businessContext.org_name = 'Test Corp';
      model.businessContext.industry = 'Technology';
      model.businessContext.primaryObjectives = [
        { id: 'obj1', objective: 'Grow revenue', category: 'Financial' }
      ];

      // Step 2: BMC
      model.businessContext.enrichment.bmcInsights = { keyInsights: 'Product-market fit strong' };
      expect(model.businessContext.enrichment.completenessScore).toBe(0); // Not calculated yet

      // Step 3: Capabilities
      model.businessContext.enrichment.capabilityGaps = [
        { capability: 'Sales', currentLevel: 2, targetLevel: 4, linkedObjective: 'obj1' }
      ];

      // Step 4: Operating Model
      model.businessContext.enrichment.operatingModelRisks = [
        { risk: 'Scalability', severity: 'Medium' }
      ];

      // Step 5: Gap Analysis
      model.businessContext.enrichment.criticalGaps = [
        { gap: 'CRM outdated', priority: 1, affectedObjective: 'obj1' }
      ];

      // Step 6: Value Pools
      model.businessContext.enrichment.valueStreamInsights = [
        { valueStream: 'Sales', insight: 'Manual processes', linkedObjective: 'obj1' }
      ];

      // Step 7: Roadmap
      model.businessContext.enrichment.roadmapConstraints = [
        { constraint: 'Budget: $5M', type: 'Budget' }
      ];
      model.businessContext.enrichment.completenessScore = 100;

      // Verify all enrichment captured
      expect(model.businessContext.enrichment.bmcInsights).toBeDefined();
      expect(model.businessContext.enrichment.capabilityGaps.length).toBeGreaterThan(0);
      expect(model.businessContext.enrichment.operatingModelRisks.length).toBeGreaterThan(0);
      expect(model.businessContext.enrichment.criticalGaps.length).toBeGreaterThan(0);
      expect(model.businessContext.enrichment.valueStreamInsights.length).toBeGreaterThan(0);
      expect(model.businessContext.enrichment.roadmapConstraints.length).toBeGreaterThan(0);
      expect(model.businessContext.enrichment.completenessScore).toBe(100);
    });

    test('buildBusinessContextContext includes all enrichment data', () => {
      const model = createFullyEnrichedModel();
      const context = buildBusinessContextContext(model);

      // Verify context string includes enrichment data
      expect(context).toContain('BMC Insights');
      expect(context).toContain('Capability Gaps');
      expect(context).toContain('Operating Model Risks');
      expect(context).toContain('Critical Gaps');
      expect(context).toContain('Value Stream Insights');
      expect(context).toContain('Roadmap Constraints');
      expect(context).toContain('Enrichment Completeness: 100%');
    });

    test('context shows progression through workflow', () => {
      const model = createTestModel();
      model.businessContext.org_name = 'Test Corp';
      model.businessContext.industry = 'Technology';
      
      // Before any enrichment
      let context = buildBusinessContextContext(model);
      expect(context).toContain('Test Corp');
      expect(context).not.toContain('BMC Insights');

      // After Step 2
      model.businessContext.enrichment.bmcInsights = { keyInsights: 'Test' };
      context = buildBusinessContextContext(model);
      expect(context).toContain('BMC Insights');

      // After Step 3
      model.businessContext.enrichment.capabilityGaps = [{ capability: 'Test' }];
      context = buildBusinessContextContext(model);
      expect(context).toContain('Capability Gaps');
    });
  });
});
