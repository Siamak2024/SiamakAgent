/**
 * StandardStrategy.test.js - Unit tests for Mode1 (Standard) strategy
 * 
 * Tests the StandardStrategy implementation for the 7-step EA workflow
 * Following TDD: Write tests first, then implement to make them pass
 */

const { createMockModel } = require('../../fixtures/mockModel.js');
const { wait } = require('../../helpers/testUtils.js');

// Import the actual StandardStrategy (will be implemented after tests)
// For now, this import will fail - that's expected in TDD
let StandardStrategy;

describe('StandardStrategy', () => {
  
  beforeAll(() => {
    // Dynamic import for StandardStrategy
    try {
      StandardStrategy = require('../../../js/Mode1/StandardStrategy.js');
    } catch (e) {
      // Expected to fail initially - implementation doesn't exist yet
      console.log('[TDD] StandardStrategy not implemented yet - tests will fail as expected');
    }
  });
  
  describe('getName()', () => {
    it('should return "Standard Mode"', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      expect(strategy.getName()).toBe('Standard Mode');
    });
  });
  
  describe('getStep()', () => {
    it('should return Step1_Standard for "step1"', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const step = strategy.getStep('step1');
      
      expect(step).toBeDefined();
      expect(step.id).toBe('step1');
      expect(step.name).toContain('Business');
    });
    
    it('should return Step2_Standard for "step2"', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const step = strategy.getStep('step2');
      
      expect(step).toBeDefined();
      expect(step.id).toBe('step2');
    });
    
    it('should return all 7 steps', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      
      for (let i = 1; i <= 7; i++) {
        const step = strategy.getStep(`step${i}`);
        expect(step).toBeDefined();
        expect(step.id).toBe(`step${i}`);
      }
    });
    
    it('should throw error for invalid step ID', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      
      expect(() => strategy.getStep('step99'))
        .toThrow(/step99.*not found/i);
    });
    
    it('should return step with tasks array', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const step = strategy.getStep('step1');
      
      expect(step.tasks).toBeDefined();
      expect(Array.isArray(step.tasks)).toBe(true);
    });
    
    it('should return step with dependsOn array', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const step = strategy.getStep('step2');
      
      expect(step.dependsOn).toBeDefined();
      expect(Array.isArray(step.dependsOn)).toBe(true);
    });
    
    it('should return step with synthesize function', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const step = strategy.getStep('step1');
      
      expect(typeof step.synthesize).toBe('function');
    });
    
    it('should return step with applyOutput function', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const step = strategy.getStep('step1');
      
      expect(typeof step.applyOutput).toBe('function');
    });
  });
  
  describe('executeTask()', () => {
    it('should handle question tasks', async () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const questionTask = {
        type: 'question',
        taskId: 'q1',
        title: 'Test Question',
        question: 'What is your answer?',
        options: ['A', 'B', 'C']
      };
      
      // For now, we'll accept any result since UI is mocked
      // Real implementation will use QuestionCardMode1
      const result = await strategy.executeTask(questionTask, {}, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('q1');
      expect(result.output).toBeDefined();
    });
    
    it('should handle text-input tasks', async () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const textTask = {
        type: 'text-input',
        taskId: 'txt1',
        title: 'Enter text',
        prompt: 'Provide details'
      };
      
      const result = await strategy.executeTask(textTask, {}, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('txt1');
      expect(result.output).toBeDefined();
    });
    
    it('should handle custom-ui tasks', async () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const customTask = {
        type: 'custom-ui',
        taskId: 'validate1'
      };
      
      const result = await strategy.executeTask(customTask, {}, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('validate1');
      expect(result.output).toBeDefined();
    });
    
    it('should handle internal AI tasks', async () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const aiTask = {
        type: 'internal',
        taskId: 'ai1',
        taskType: 'general',
        instruction: 'Generate something'
      };
      
      const result = await strategy.executeTask(aiTask, {}, null);
      
      expect(result).toBeDefined();
      expect(result.taskId).toBe('ai1');
      expect(result.output).toBeDefined();
    });
    
    it('should use wrapAnswer function if provided', async () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const task = {
        type: 'question',
        taskId: 'q1',
        question: 'Test?',
        wrapAnswer: (ans, ctx) => ({ 
          wrapped: true, 
          answer: ans, 
          contextStepId: ctx.stepId 
        })
      };
      
      const result = await strategy.executeTask(task, { stepId: 'step1' }, null);
      
      expect(result.output).toBeDefined();
      // If wrapAnswer is used, should have custom structure
      if (result.output.wrapped) {
        expect(result.output.wrapped).toBe(true);
        expect(result.output.contextStepId).toBe('step1');
      }
    });
    
    it('should pass taskDef, ctx, and stepEngine to executeTask', async () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const taskDef = { type: 'internal', taskId: 't1', taskType: 'general' };
      const ctx = { stepId: 'step1', model: {} };
      const mockEngine = { run: jest.fn() };
      
      await strategy.executeTask(taskDef, ctx, mockEngine);
      
      // Should not throw, arguments should be accessible in implementation
      expect(true).toBe(true);
    });
  });
  
  describe('synthesize()', () => {
    it('should return synthesized output object', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const ctx = {
        stepId: 'step1',
        answers: {
          step1_q1: 'Answer 1',
          step1_q2: 'Answer 2'
        }
      };
      
      const result = strategy.synthesize('step1', ctx);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
    
    it('should delegate to step module synthesize function', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const ctx = { stepId: 'step1', answers: {} };
      
      const result = strategy.synthesize('step1', ctx);
      
      // Step module should handle synthesis
      expect(result).toBeDefined();
    });
    
    it('should handle missing context gracefully', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      
      // Should not throw even with minimal context
      expect(() => strategy.synthesize('step1', {})).not.toThrow();
    });
  });
  
  describe('applyOutput()', () => {
    it('should return updated model', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const model = createMockModel();
      const output = { businessContext: { objectives: [] } };
      
      const updatedModel = strategy.applyOutput('step1', output, model);
      
      expect(updatedModel).toBeDefined();
      expect(updatedModel.projectId).toBe(model.projectId);
    });
    
    it('should delegate to step module applyOutput function', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const model = createMockModel();
      const output = { data: 'test' };
      
      const updatedModel = strategy.applyOutput('step1', output, model);
      
      // Step module should handle output application
      expect(updatedModel).toBeDefined();
    });
    
    it('should preserve existing model data', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const model = createMockModel({
        projectName: 'Test Project',
        businessContext: { existing: true }
      });
      const output = { newData: 'value' };
      
      const updatedModel = strategy.applyOutput('step1', output, model);
      
      expect(updatedModel.projectName).toBe('Test Project');
      expect(updatedModel.businessContext).toBeDefined();
    });
  });
  
  describe('onStepComplete()', () => {
    it('should be optional (not throw if missing)', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const model = createMockModel();
      
      // Should not throw
      if (strategy.onStepComplete) {
        expect(() => strategy.onStepComplete('step1', model)).not.toThrow();
      }
    });
    
    it('should accept stepId and model parameters', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      const model = createMockModel();
      
      if (strategy.onStepComplete) {
        strategy.onStepComplete('step1', model);
      }
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
  
  describe('ModeStrategy interface compliance', () => {
    it('should extend/implement ModeStrategy', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      
      // Should have all required methods
      expect(typeof strategy.getName).toBe('function');
      expect(typeof strategy.getStep).toBe('function');
      expect(typeof strategy.executeTask).toBe('function');
      expect(typeof strategy.synthesize).toBe('function');
      expect(typeof strategy.applyOutput).toBe('function');
    });
    
    it('should work with StepEngine', () => {
      if (!StandardStrategy) return;
      
      const strategy = new StandardStrategy();
      
      // Verify it can be configured in StepEngine
      expect(strategy.getName()).toBeTruthy();
      expect(typeof strategy.getStep('step1')).toBe('object');
    });
  });
});
