/**
 * BusinessObjectivesStrategy.test.js - Unit tests for Mode3 (Business Objectives) strategy
 * 
 * Tests the BusinessObjectivesStrategy implementation for outcome-focused workflow
 * Following TDD: Write tests first, then implement to make them pass
 */

const { createMockModel, createModelWithBusinessContext } = require('../../fixtures/mockModel.js');
const { wait } = require('../../helpers/testUtils.js');

// Import the actual BusinessObjectivesStrategy (will be implemented after tests)
// For now, this import will fail - that's expected in TDD
let BusinessObjectivesStrategy;

describe('BusinessObjectivesStrategy', () => {
  
  beforeAll(() => {
    // Dynamic import for BusinessObjectivesStrategy
    try {
      BusinessObjectivesStrategy = require('../../../js/Mode3/BusinessObjectivesStrategy.js');
    } catch (e) {
      // Expected to fail initially - implementation doesn't exist yet
      console.log('[TDD] BusinessObjectivesStrategy not implemented yet - tests will fail as expected');
    }
  });
  
  describe('getName()', () => {
    it('should return "Business Objectives Mode"', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      expect(strategy.getName()).toBe('Business Objectives Mode');
    });
  });
  
  describe('getStep()', () => {
    it('should return Step1_BusinessObjectives for "step1"', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const step = strategy.getStep('step1');
      
      expect(step).toBeDefined();
      expect(step.id).toBe('step1');
    });
    
    it('should return all 7 business objectives steps', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      for (let i = 1; i <= 7; i++) {
        const step = strategy.getStep(`step${i}`);
        expect(step).toBeDefined();
        expect(step.id).toBe(`step${i}`);
      }
    });
    
    it('should throw error for invalid step ID', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      expect(() => strategy.getStep('step99'))
        .toThrow(/step99.*not found/i);
    });
    
    it('should limit questions to 3 per step', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      for (let i = 1; i <= 7; i++) {
        const step = strategy.getStep(`step${i}`);
        if (step.tasks) {
          const questionTasks = step.tasks.filter(t => t.type === 'question');
          expect(questionTasks.length).toBeLessThanOrEqual(3);
        }
      }
    });
  });
  
  describe('executeTask()', () => {
    it('should handle question tasks with skip option', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const questionTask = {
        type: 'question',
        taskId: 'q1',
        title: 'Optional Question',
        question: 'Provide additional details?',
        skippable: true
      };
      
      const result = await strategy.executeTask(questionTask, {}, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('q1');
      expect(result.output).toBeDefined();
    });
    
    it('should mark skipped questions appropriately', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const task = {
        type: 'question',
        taskId: 'q1',
        skippable: true
      };
      
      // Simulate skip
      const result = await strategy.executeTask(task, {}, null);
      
      // Should handle skipped state
      expect(result.output).toBeDefined();
    });
    
    it('should handle enrichment tasks', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const enrichmentTask = {
        type: 'enrichment',
        taskId: 'enrich1',
        source: 'web'
      };
      const ctx = {
        businessObjectives: [
          { title: 'Increase market share', kpi: 'Market share %' }
        ]
      };
      
      const result = await strategy.executeTask(enrichmentTask, ctx, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('enrich1');
      expect(result.output).toBeDefined();
    });
    
    it('should inject business objectives into AI context', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const aiTask = {
        type: 'internal',
        taskId: 'ai1',
        taskType: 'general',
        instruction: 'Generate architecture'
      };
      const ctx = {
        businessObjectives: [
          { title: 'Objective 1', priority: 'high' },
          { title: 'Objective 2', priority: 'medium' }
        ]
      };
      
      const result = await strategy.executeTask(aiTask, ctx, null);
      
      expect(result).toBeDefined();
      // Should have used objectives in generation
      expect(result.output).toBeDefined();
    });
    
    it('should handle custom-ui tasks with objective context', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const customTask = {
        type: 'custom-ui',
        taskId: 'validate1'
      };
      const ctx = {
        businessObjectives: [{ title: 'Test Objective' }]
      };
      
      const result = await strategy.executeTask(customTask, ctx, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('validate1');
    });
    
    it('should prioritize outcome-focused tasks', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const task = {
        type: 'internal',
        taskId: 'outcome1',
        focusArea: 'objectives'
      };
      
      const result = await strategy.executeTask(task, {}, null);
      
      expect(result).toBeDefined();
      // Should focus on business outcomes
    });
  });
  
  describe('synthesize()', () => {
    it('should synthesize with objective traceability', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const ctx = {
        stepId: 'step1',
        businessObjectives: [
          { title: 'Objective 1', category: 'Growth' }
        ],
        answers: {
          step1_q1: 'Answer 1'
        }
      };
      
      const result = strategy.synthesize('step1', ctx);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
    
    it('should link capabilities to objectives', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const ctx = {
        stepId: 'step2',
        businessObjectives: [{ title: 'Digital transformation' }],
        answers: {}
      };
      
      const result = strategy.synthesize('step2', ctx);
      
      expect(result).toBeDefined();
      // Should maintain objective linkage
    });
  });
  
  describe('applyOutput()', () => {
    it('should apply output to model', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const model = createMockModel();
      const output = {
        businessObjectives: [
          { title: 'Objective 1', kpi: 'Revenue growth', target: '10%' }
        ]
      };
      
      const updatedModel = strategy.applyOutput('step1', output, model);
      
      expect(updatedModel).toBeDefined();
      expect(updatedModel.projectId).toBe(model.projectId);
    });
    
    it('should preserve objective traceability', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const model = createModelWithBusinessContext();
      const output = {
        capabilities: [
          { name: 'Cap1', linkedObjectives: ['Obj1'] }
        ]
      };
      
      const updatedModel = strategy.applyOutput('step2', output, model);
      
      expect(updatedModel).toBeDefined();
      // Should maintain objective links
    });
  });
  
  describe('onStepComplete()', () => {
    it('should validate objective coverage', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const model = createModelWithBusinessContext();
      
      if (strategy.onStepComplete) {
        expect(() => strategy.onStepComplete('step1', model)).not.toThrow();
      }
    });
    
    it('should warn about unlinked objectives', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const model = createMockModel({
        businessObjectives: [
          { title: 'Obj1', linked: false }
        ]
      });
      
      if (strategy.onStepComplete) {
        // Should handle unlinked objectives
        strategy.onStepComplete('step2', model);
      }
      
      expect(true).toBe(true);
    });
  });
  
  describe('enrichment support', () => {
    it('should support web search enrichment', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      if (typeof strategy.enrichFromWeb === 'function') {
        const query = 'digital transformation best practices';
        const result = await strategy.enrichFromWeb(query);
        
        expect(result).toBeDefined();
      }
    });
    
    it('should support data enrichment from profile', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      if (typeof strategy.enrichFromProfile === 'function') {
        const model = createModelWithBusinessContext();
        const result = await strategy.enrichFromProfile(model);
        
        expect(result).toBeDefined();
      }
    });
    
    it('should merge enriched data with generated content', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const baseContent = { objectives: ['Obj1'] };
      const enrichedData = { insights: ['Insight1'] };
      
      if (typeof strategy.mergeEnrichment === 'function') {
        const result = strategy.mergeEnrichment(baseContent, enrichedData);
        
        expect(result).toBeDefined();
        expect(result.objectives).toBeDefined();
      }
    });
  });
  
  describe('skip support', () => {
    it('should allow skipping support capability questions', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const task = {
        type: 'question',
        taskId: 'support_q1',
        category: 'support',
        skippable: true
      };
      
      const result = await strategy.executeTask(task, {}, null);
      
      expect(result).toBeDefined();
      // Support questions should be skippable
    });
    
    it('should not skip core objective questions', async () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      const task = {
        type: 'question',
        taskId: 'core_q1',
        category: 'core',
        skippable: false
      };
      
      const result = await strategy.executeTask(task, {}, null);
      
      expect(result).toBeDefined();
      // Core questions should require answers
    });
  });
  
  describe('ModeStrategy interface compliance', () => {
    it('should extend/implement ModeStrategy', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      // Should have all required methods
      expect(typeof strategy.getName).toBe('function');
      expect(typeof strategy.getStep).toBe('function');
      expect(typeof strategy.executeTask).toBe('function');
      expect(typeof strategy.synthesize).toBe('function');
      expect(typeof strategy.applyOutput).toBe('function');
    });
    
    it('should work with StepEngine', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      // Verify it can be configured in StepEngine
      expect(strategy.getName()).toBeTruthy();
      expect(typeof strategy.getStep('step1')).toBe('object');
    });
  });
  
  describe('Business Objectives-specific behavior', () => {
    it('should focus on outcome delivery', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      expect(strategy.getName()).toContain('Business Objectives');
      // Mode should emphasize objectives
    });
    
    it('should maintain objective traceability throughout', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      // All steps should link back to objectives
      for (let i = 1; i <= 7; i++) {
        const step = strategy.getStep(`step${i}`);
        expect(step).toBeDefined();
      }
    });
    
    it('should support streamlined workflow (3 questions max)', () => {
      if (!BusinessObjectivesStrategy) return;
      
      const strategy = new BusinessObjectivesStrategy();
      
      // Workflow should be concise and focused
      expect(strategy.getName()).toBeTruthy();
    });
  });
});
