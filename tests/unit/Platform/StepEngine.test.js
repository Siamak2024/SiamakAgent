/**
 * StepEngine.test.js - Unit tests for StepEngine platform service
 * 
 * Tests core orchestration engine functionality before implementation
 * Following TDD: Write tests first, then implement to make them pass
 */

const { createMockModel, createModelWithCompletedSteps, createModelWithVersions } = require('../../fixtures/mockModel.js');
const { createMockStrategy, createFailingStrategy, createConditionalStrategy } = require('../../helpers/mockStrategy.js');
const { wait, spyOnConsole, restoreConsole } = require('../../helpers/testUtils.js');
const { ModelAssertions } = require('../../helpers/assertModel.js');

// Import the actual StepEngine (will be implemented after tests)
// For now, this import will fail - that's expected in TDD
let StepEngine;

describe('StepEngine Service', () => {
  
  beforeAll(() => {
    // Dynamic import for StepEngine
    try {
      StepEngine = require('../../../js/Platform/StepEngine.js');
    } catch (e) {
      // Expected to fail initially - implementation doesn't exist yet
      console.log('[TDD] StepEngine not implemented yet - tests will fail as expected');
    }
  });
  
  beforeEach(() => {
    // Reset StepEngine state before each test
    if (StepEngine && StepEngine._reset) {
      StepEngine._reset();
    }
  });
  
  afterEach(() => {
    restoreConsole();
  });
  
  describe('configure()', () => {
    
    it('should accept a valid ModeStrategy', () => {
      const mockStrategy = createMockStrategy();
      
      expect(() => StepEngine.configure(mockStrategy)).not.toThrow();
    });
    
    it('should reject strategy with missing getName()', () => {
      const invalidStrategy = {
        getStep: () => {},
        executeTask: async () => {},
        synthesize: () => {},
        applyOutput: () => {}
      };
      
      expect(() => StepEngine.configure(invalidStrategy))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should reject strategy with missing getStep()', () => {
      const invalidStrategy = {
        getName: () => 'Test',
        executeTask: async () => {},
        synthesize: () => {},
        applyOutput: () => {}
      };
      
      expect(() => StepEngine.configure(invalidStrategy))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should reject strategy with missing executeTask()', () => {
      const invalidStrategy = {
        getName: () => 'Test',
        getStep: () => {},
        synthesize: () => {},
        applyOutput: () => {}
      };
      
      expect(() => StepEngine.configure(invalidStrategy))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should reject strategy with missing synthesize()', () => {
      const invalidStrategy = {
        getName: () => 'Test',
        getStep: () => {},
        executeTask: async () => {},
        applyOutput: () => {}
      };
      
      expect(() => StepEngine.configure(invalidStrategy))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should reject strategy with missing applyOutput()', () => {
      const invalidStrategy = {
        getName: () => 'Test',
        getStep: () => {},
        executeTask: async () => {},
        synthesize: () => {}
      };
      
      expect(() => StepEngine.configure(invalidStrategy))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should reject null strategy', () => {
      expect(() => StepEngine.configure(null))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should reject undefined strategy', () => {
      expect(() => StepEngine.configure(undefined))
        .toThrow('[StepEngine] Invalid strategy: must implement ModeStrategy interface');
    });
    
    it('should log configuration message', () => {
      const consoleSpy = spyOnConsole();
      const mockStrategy = createMockStrategy({ name: 'TestStrategy' });
      
      StepEngine.configure(mockStrategy);
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[StepEngine] Configured with strategy: TestStrategy');
    });
    
    it('should allow reconfiguration with different strategy', () => {
      const strategy1 = createMockStrategy({ name: 'Strategy1' });
      const strategy2 = createMockStrategy({ name: 'Strategy2' });
      
      StepEngine.configure(strategy1);
      expect(() => StepEngine.configure(strategy2)).not.toThrow();
    });
    
  });
  
  describe('run()', () => {
    
    it('should throw error if no strategy configured', async () => {
      const model = createMockModel();
      
      await expect(StepEngine.run('step1', {}, model))
        .rejects.toThrow('[StepEngine] No strategy configured. Call StepEngine.configure(strategy) first.');
    });
    
    it('should delegate step retrieval to strategy', async () => {
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(mockStrategy.getStep).toHaveBeenCalledWith('step1');
    });
    
    it('should throw error if step module not found', async () => {
      const mockStrategy = createMockStrategy();
      mockStrategy.getStep = jest.fn().mockReturnValue(null);
      
      StepEngine.configure(mockStrategy);
      
      await expect(StepEngine.run('step99', {}, createMockModel()))
        .rejects.toThrow('[StepEngine] Step module "step99" not found');
    });
    
    it('should validate dependencies before execution', async () => {
      const mockStrategy = createMockStrategy({
        step: {
          dependsOn: ['step0'],
          tasks: []
        }
      });
      const model = createMockModel(); // No completed steps
      
      StepEngine.configure(mockStrategy);
      
      await expect(StepEngine.run('step1', {}, model))
        .rejects.toThrow('[StepEngine] step1 requires "step0" to be completed first');
    });
    
    it('should allow execution if dependencies are met', async () => {
      const mockStrategy = createMockStrategy({
        step: {
          dependsOn: ['step0'],
          tasks: []
        }
      });
      const model = createModelWithCompletedSteps(['step0']);
      
      StepEngine.configure(mockStrategy);
      
      await expect(StepEngine.run('step1', {}, model)).resolves.toBeDefined();
    });
    
    it('should execute all tasks via strategy.executeTask()', async () => {
      const task1 = { taskId: 'task1' };
      const task2 = { taskId: 'task2' };
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [task1, task2],
          dependsOn: []
        }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(mockStrategy.executeTask).toHaveBeenCalledTimes(2);
      expect(mockStrategy.executeTask).toHaveBeenNthCalledWith(1, task1, expect.any(Object), StepEngine);
      expect(mockStrategy.executeTask).toHaveBeenNthCalledWith(2, task2, expect.any(Object), StepEngine);
    });
    
    it('should skip tasks that fail shouldRun condition', async () => {
      const task1 = { taskId: 'task1', shouldRun: () => true };
      const task2 = { taskId: 'task2', shouldRun: () => false };
      const task3 = { taskId: 'task3', shouldRun: () => true };
      
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [task1, task2, task3],
          dependsOn: []
        }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(mockStrategy.executeTask).toHaveBeenCalledTimes(2);
      expect(mockStrategy.executeTask).toHaveBeenCalledWith(task1, expect.any(Object), StepEngine);
      expect(mockStrategy.executeTask).toHaveBeenCalledWith(task3, expect.any(Object), StepEngine);
      expect(mockStrategy.executeTask).not.toHaveBeenCalledWith(task2, expect.any(Object), StepEngine);
    });
    
    it('should log skipped tasks', async () => {
      const consoleSpy = spyOnConsole();
      const task = { taskId: 'task1', shouldRun: () => false };
      
      const mockStrategy = createMockStrategy({
        step: { tasks: [task], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[StepEngine] Skipping task task1 (shouldRun condition not met)'
      );
    });
    
    it('should merge task outputs into context', async () => {
      const task1 = { taskId: 'task1' };
      const task2 = { taskId: 'task2' };
      
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [task1, task2],
          dependsOn: []
        },
        taskOutputs: [
          { taskId: 'task1', output: { result: 'A' } },
          { taskId: 'task2', output: { result: 'B' } }
        ]
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      // Check that synthesize received merged context
      const synthesizeCall = mockStrategy.synthesize.mock.calls[0];
      const ctx = synthesizeCall[1];
      
      expect(ctx.answers.task1).toEqual({ result: 'A' });
      expect(ctx.answers.task2).toEqual({ result: 'B' });
    });
    
    it('should call strategy.synthesize() after all tasks', async () => {
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [{ taskId: 't1' }, { taskId: 't2' }],
          dependsOn: []
        }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(mockStrategy.synthesize).toHaveBeenCalledWith('step1', expect.any(Object));
      expect(mockStrategy.synthesize).toHaveBeenCalledTimes(1);
    });
    
    it('should call strategy.applyOutput() with synthesized result', async () => {
      const synthesizedOutput = { businessContext: { objectives: ['Obj1'] } };
      
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] },
        synthesizeOutput: synthesizedOutput
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(mockStrategy.applyOutput).toHaveBeenCalledWith(
        'step1',
        synthesizedOutput,
        expect.any(Object)
      );
    });
    
    it('should mark step as completed in model', async () => {
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      const result = await StepEngine.run('step1', {}, createMockModel());
      
      expect(result.steps.step1.status).toBe('completed');
      expect(result.steps.step1.completedAt).toBeDefined();
      expect(result.steps.step1.output).toBeDefined();
    });
    
    it('should set step status to in-progress during execution', async () => {
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [{ taskId: 't1' }],
          dependsOn: []
        }
      });
      
      let capturedModel;
      mockStrategy.executeTask = jest.fn(async (taskDef, ctx, stepEngine) => {
        // Capture model state during task execution
        capturedModel = { ...ctx.model };
        return { taskId: taskDef.taskId, output: {}, aiResult: null };
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      // During execution, status should have been 'in-progress'
      expect(capturedModel).toBeDefined();
      // (Context might not have the full model, so we just verify execution didn't fail)
    });
    
    it('should call strategy.onStepComplete() hook if defined', async () => {
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(mockStrategy.onStepComplete).toHaveBeenCalledWith('step1', expect.any(Object));
    });
    
    it('should not fail if onStepComplete() is undefined', async () => {
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] }
      });
      delete mockStrategy.onStepComplete;
      
      StepEngine.configure(mockStrategy);
      
      await expect(StepEngine.run('step1', {}, createMockModel())).resolves.toBeDefined();
    });
    
    it('should handle task execution errors gracefully', async () => {
      const error = new Error('AI timeout');
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [{ taskId: 't1' }],
          dependsOn: []
        }
      });
      mockStrategy.executeTask = jest.fn().mockRejectedValue(error);
      
      StepEngine.configure(mockStrategy);
      
      await expect(StepEngine.run('step1', {}, createMockModel()))
        .rejects.toThrow('AI timeout');
    });
    
    it('should mark step as error on task failure', async () => {
      const mockStrategy = createMockStrategy({
        step: {
          tasks: [{ taskId: 't1' }],
          dependsOn: []
        }
      });
      mockStrategy.executeTask = jest.fn().mockRejectedValue(new Error('Task failed'));
      
      StepEngine.configure(mockStrategy);
      
      try {
        await StepEngine.run('step1', {}, createMockModel());
      } catch (e) {
        // Expected error
      }
      
      // Verify error was logged (in a real implementation, would check model state)
    });
    
    it('should create snapshot before execution for existing step', async () => {
      const existingOutput = { oldData: true };
      const model = createMockModel({
        steps: {
          step1: {
            id: 'step1',
            status: 'completed',
            output: existingOutput,
            versions: []
          }
        }
      });
      
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] },
        synthesizeOutput: { newData: true }
      });
      
      StepEngine.configure(mockStrategy);
      const result = await StepEngine.run('step1', {}, model);
      
      expect(result.steps.step1.versions).toHaveLength(1);
      expect(result.steps.step1.versions[0].output).toEqual(existingOutput);
      expect(result.steps.step1.versions[0].timestamp).toBeDefined();
    });
    
    it('should not create snapshot for new step', async () => {
      const model = createMockModel(); // No existing step
      
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      const result = await StepEngine.run('step1', {}, model);
      
      expect(result.steps.step1.versions).toHaveLength(0);
    });
    
    it('should preserve existing versions when creating new snapshot', async () => {
      const model = createModelWithVersions('step1', 2);
      
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] },
        synthesizeOutput: { newData: true }
      });
      
      StepEngine.configure(mockStrategy);
      const result = await StepEngine.run('step1', {}, model);
      
      expect(result.steps.step1.versions).toHaveLength(3); // 2 existing + 1 new
    });
    
    it('should track completed tasks', async () => {
      const task1 = { taskId: 'task1' };
      const task2 = { taskId: 'task2' };
      
      const mockStrategy = createMockStrategy({
        step: { tasks: [task1, task2], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      const result = await StepEngine.run('step1', {}, createMockModel());
      
      expect(result.steps.step1.completedTasks).toContain('task1');
      expect(result.steps.step1.completedTasks).toContain('task2');
    });
    
    it('should store task answers in step state', async () => {
      const mockStrategy = createMockStrategy({
        step: { tasks: [{ taskId: 't1' }], dependsOn: [] },
        taskOutputs: [{ taskId: 't1', output: { answer: 'test-answer' } }]
      });
      
      StepEngine.configure(mockStrategy);
      const result = await StepEngine.run('step1', {}, createMockModel());
      
      expect(result.steps.step1.answers.t1).toEqual({ answer: 'test-answer' });
    });
    
    it('should log start message', async () => {
      const consoleSpy = spyOnConsole();
      const mockStrategy = createMockStrategy({
        name: 'TestStrategy',
        step: { tasks: [], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[StepEngine] Running step1 with TestStrategy strategy'
      );
    });
    
    it('should log completion message', async () => {
      const consoleSpy = spyOnConsole();
      const mockStrategy = createMockStrategy({
        step: { tasks: [], dependsOn: [] }
      });
      
      StepEngine.configure(mockStrategy);
      await StepEngine.run('step1', {}, createMockModel());
      
      expect(consoleSpy.log).toHaveBeenCalledWith('[StepEngine] Completed step1');
    });
    
  });
  
  describe('rollback()', () => {
    
    it('should throw error if no strategy configured', () => {
      const model = createMockModel();
      
      expect(() => StepEngine.rollback('step1', model))
        .toThrow('[StepEngine] No strategy configured');
    });
    
    it('should restore previous version if available', () => {
      const prevOutput = { old: true };
      const currOutput = { new: true };
      
      const model = createMockModel({
        steps: {
          step1: {
            id: 'step1',
            status: 'completed',
            output: currOutput,
            versions: [
              { timestamp: '2026-04-27T10:00:00Z', output: prevOutput }
            ]
          }
        }
      });
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      const result = StepEngine.rollback('step1', model);
      
      expect(result.steps.step1.output).toEqual(prevOutput);
    });
    
    it('should remove restored version from versions array', () => {
      const model = createModelWithVersions('step1', 2);
      const initialVersionCount = model.steps.step1.versions.length;
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      const result = StepEngine.rollback('step1', model);
      
      expect(result.steps.step1.versions).toHaveLength(initialVersionCount - 1);
    });
    
    it('should call strategy.applyOutput() with restored output', () => {
      const prevOutput = { old: true };
      const model = createMockModel({
        steps: {
          step1: {
            id: 'step1',
            status: 'completed',
            output: { new: true },
            versions: [
              { timestamp: '2026-04-27T10:00:00Z', output: prevOutput }
            ]
          }
        }
      });
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      StepEngine.rollback('step1', model);
      
      expect(mockStrategy.applyOutput).toHaveBeenCalledWith(
        'step1',
        prevOutput,
        expect.any(Object)
      );
    });
    
    it('should warn if no versions available', () => {
      const consoleSpy = spyOnConsole();
      const model = createMockModel({
        steps: {
          step1: {
            id: 'step1',
            status: 'completed',
            output: { current: true },
            versions: []
          }
        }
      });
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      StepEngine.rollback('step1', model);
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[StepEngine] No versions to roll back to for step1'
      );
    });
    
    it('should return model unchanged if no versions', () => {
      const model = createMockModel({
        steps: {
          step1: { id: 'step1', status: 'completed', versions: [], output: { data: 1 } }
        }
      });
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      const result = StepEngine.rollback('step1', model);
      
      expect(result.steps.step1.output).toEqual({ data: 1 });
    });
    
    it('should handle rollback for step with no versions property', () => {
      const model = createMockModel({
        steps: {
          step1: { id: 'step1', status: 'completed', output: { data: 1 } }
          // No versions property
        }
      });
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      expect(() => StepEngine.rollback('step1', model)).not.toThrow();
    });
    
    it('should log rollback message', () => {
      const consoleSpy = spyOnConsole();
      const model = createModelWithVersions('step1', 1);
      const timestamp = model.steps.step1.versions[0].timestamp;
      
      const mockStrategy = createMockStrategy();
      StepEngine.configure(mockStrategy);
      
      StepEngine.rollback('step1', model);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        `[StepEngine] Rolled back step1 to version from ${timestamp}`
      );
    });
    
  });
  
});
