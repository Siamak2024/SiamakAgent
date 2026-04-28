/**
 * ModeStrategy.test.js - Unit tests for ModeStrategy interface
 * 
 * Tests that the interface contract is properly enforced
 * Following TDD: Write tests first, then implement to make them pass
 */

// Import the actual ModeStrategy (will be implemented after tests)
let ModeStrategy;

describe('ModeStrategy Interface', () => {
  
  beforeAll(() => {
    // Dynamic import for ModeStrategy
    try {
      ModeStrategy = require('../../../js/Platform/ModeStrategy.js');
    } catch (e) {
      // Expected to fail initially - implementation doesn't exist yet
      console.log('[TDD] ModeStrategy not implemented yet - tests will fail as expected');
    }
  });
  
  describe('Abstract method enforcement', () => {
    
    it('should throw error when getName() not implemented', () => {
      class IncompleteStrategy extends ModeStrategy {}
      const strategy = new IncompleteStrategy();
      
      expect(() => strategy.getName())
        .toThrow('ModeStrategy.getName() must be implemented');
    });
    
    it('should throw error when getStep() not implemented', () => {
      class IncompleteStrategy extends ModeStrategy {}
      const strategy = new IncompleteStrategy();
      
      expect(() => strategy.getStep('step1'))
        .toThrow('ModeStrategy.getStep() must be implemented');
    });
    
    it('should throw error when executeTask() not implemented', async () => {
      class IncompleteStrategy extends ModeStrategy {}
      const strategy = new IncompleteStrategy();
      
      await expect(strategy.executeTask({}, {}, {}))
        .rejects.toThrow('ModeStrategy.executeTask() must be implemented');
    });
    
    it('should throw error when synthesize() not implemented', () => {
      class IncompleteStrategy extends ModeStrategy {}
      const strategy = new IncompleteStrategy();
      
      expect(() => strategy.synthesize('step1', {}))
        .toThrow('ModeStrategy.synthesize() must be implemented');
    });
    
    it('should throw error when applyOutput() not implemented', () => {
      class IncompleteStrategy extends ModeStrategy {}
      const strategy = new IncompleteStrategy();
      
      expect(() => strategy.applyOutput('step1', {}, {}))
        .toThrow('ModeStrategy.applyOutput() must be implemented');
    });
    
  });
  
  describe('Optional methods', () => {
    
    it('should allow onStepComplete() to be optional', () => {
      class MinimalStrategy extends ModeStrategy {
        getName() { return 'Minimal'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new MinimalStrategy();
      
      // onStepComplete should exist but do nothing
      expect(() => strategy.onStepComplete('step1', {})).not.toThrow();
    });
    
    it('should have default no-op implementation for onStepComplete()', () => {
      class MinimalStrategy extends ModeStrategy {
        getName() { return 'Minimal'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new MinimalStrategy();
      const result = strategy.onStepComplete('step1', {});
      
      // Should return undefined (no-op)
      expect(result).toBeUndefined();
    });
    
  });
  
  describe('Concrete implementation', () => {
    
    it('should be extendable by concrete strategies', () => {
      class ConcreteStrategy extends ModeStrategy {
        getName() { return 'Concrete'; }
        getStep(stepId) { return { id: stepId, name: 'Test Step' }; }
        async executeTask(taskDef) {
          return { taskId: taskDef.taskId, output: { result: 'ok' }, aiResult: null };
        }
        synthesize(stepId, ctx) { return { stepId, data: ctx }; }
        applyOutput(stepId, output, model) {
          return { ...model, [stepId]: output };
        }
      }
      
      const strategy = new ConcreteStrategy();
      
      expect(strategy.getName()).toBe('Concrete');
      expect(strategy.getStep('step1')).toEqual({ id: 'step1', name: 'Test Step' });
    });
    
    it('should allow async executeTask()', async () => {
      class AsyncStrategy extends ModeStrategy {
        getName() { return 'Async'; }
        getStep() { return {}; }
        async executeTask(taskDef) {
          await new Promise(resolve => setTimeout(resolve, 10));
          return { taskId: taskDef.taskId, output: { async: true }, aiResult: null };
        }
        synthesize() { return {}; }
        applyOutput(stepId, output, model) { return model; }
      }
      
      const strategy = new AsyncStrategy();
      const result = await strategy.executeTask({ taskId: 't1' }, {}, {});
      
      expect(result.output.async).toBe(true);
    });
    
    it('should allow custom onStepComplete() implementation', () => {
      let completionCalled = false;
      
      class CustomStrategy extends ModeStrategy {
        getName() { return 'Custom'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() { return {}; }
        onStepComplete(stepId, model) {
          completionCalled = true;
        }
      }
      
      const strategy = new CustomStrategy();
      strategy.onStepComplete('step1', {});
      
      expect(completionCalled).toBe(true);
    });
    
  });
  
  describe('Method signatures', () => {
    
    it('getName() should accept no parameters', () => {
      class TestStrategy extends ModeStrategy {
        getName() { return 'Test'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new TestStrategy();
      expect(strategy.getName.length).toBe(0);
    });
    
    it('getStep() should accept stepId parameter', () => {
      class TestStrategy extends ModeStrategy {
        getName() { return 'Test'; }
        getStep(stepId) { return { id: stepId }; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new TestStrategy();
      const step = strategy.getStep('step1');
      
      expect(step.id).toBe('step1');
    });
    
    it('executeTask() should accept taskDef, ctx, and stepEngine parameters', async () => {
      class TestStrategy extends ModeStrategy {
        getName() { return 'Test'; }
        getStep() { return {}; }
        async executeTask(taskDef, ctx, stepEngine) {
          return {
            taskId: taskDef.taskId,
            output: { ctxReceived: !!ctx, engineReceived: !!stepEngine },
            aiResult: null
          };
        }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new TestStrategy();
      const mockEngine = { run: jest.fn() };
      const result = await strategy.executeTask(
        { taskId: 't1' },
        { stepId: 'step1' },
        mockEngine
      );
      
      expect(result.output.ctxReceived).toBe(true);
      expect(result.output.engineReceived).toBe(true);
    });
    
    it('synthesize() should accept stepId and ctx parameters', () => {
      class TestStrategy extends ModeStrategy {
        getName() { return 'Test'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize(stepId, ctx) {
          return { stepId, hasContext: !!ctx };
        }
        applyOutput() { return {}; }
      }
      
      const strategy = new TestStrategy();
      const result = strategy.synthesize('step1', { answers: {} });
      
      expect(result.stepId).toBe('step1');
      expect(result.hasContext).toBe(true);
    });
    
    it('applyOutput() should accept stepId, output, and model parameters', () => {
      class TestStrategy extends ModeStrategy {
        getName() { return 'Test'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput(stepId, output, model) {
          return {
            ...model,
            [stepId]: output,
            updated: true
          };
        }
      }
      
      const strategy = new TestStrategy();
      const result = strategy.applyOutput(
        'step1',
        { data: 'test' },
        { projectId: 'p1' }
      );
      
      expect(result.step1).toEqual({ data: 'test' });
      expect(result.updated).toBe(true);
      expect(result.projectId).toBe('p1');
    });
    
  });
  
  describe('Error handling', () => {
    
    it('should allow executeTask() to throw errors', async () => {
      class FailingStrategy extends ModeStrategy {
        getName() { return 'Failing'; }
        getStep() { return {}; }
        async executeTask() {
          throw new Error('Task execution failed');
        }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new FailingStrategy();
      
      await expect(strategy.executeTask({}, {}, {}))
        .rejects.toThrow('Task execution failed');
    });
    
    it('should allow synthesize() to throw errors', () => {
      class FailingStrategy extends ModeStrategy {
        getName() { return 'Failing'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() {
          throw new Error('Synthesis failed');
        }
        applyOutput() { return {}; }
      }
      
      const strategy = new FailingStrategy();
      
      expect(() => strategy.synthesize('step1', {}))
        .toThrow('Synthesis failed');
    });
    
    it('should allow applyOutput() to throw errors', () => {
      class FailingStrategy extends ModeStrategy {
        getName() { return 'Failing'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() {
          throw new Error('Apply failed');
        }
      }
      
      const strategy = new FailingStrategy();
      
      expect(() => strategy.applyOutput('step1', {}, {}))
        .toThrow('Apply failed');
    });
    
  });
  
  describe('instanceof checks', () => {
    
    it('should identify concrete implementations as ModeStrategy instances', () => {
      class ConcreteStrategy extends ModeStrategy {
        getName() { return 'Concrete'; }
        getStep() { return {}; }
        async executeTask() { return { taskId: 't1', output: {}, aiResult: null }; }
        synthesize() { return {}; }
        applyOutput() { return {}; }
      }
      
      const strategy = new ConcreteStrategy();
      
      expect(strategy instanceof ModeStrategy).toBe(true);
    });
    
    it('should not identify plain objects as ModeStrategy instances', () => {
      const plainObject = {
        getName: () => 'Plain',
        getStep: () => {},
        executeTask: async () => {},
        synthesize: () => {},
        applyOutput: () => {}
      };
      
      expect(plainObject instanceof ModeStrategy).toBe(false);
    });
    
  });
  
});
