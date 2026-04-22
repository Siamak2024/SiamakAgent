/**
 * StepEngine.js — Main orchestrator for the modular EA workflow.
 *
 * Replaces the individual step trigger functions (clarifyStrategicIntent,
 * generateBMC, generateArchitecture, etc.) with a unified runner.
 *
 * Usage:
 *   const newModel = await StepEngine.run('step1', { initialPrompt: '...' }, model);
 *
 * The engine:
 *  1. Validates all required prior steps are complete
 *  2. Preloads instruction files from the server
 *  3. Executes each task in sequence
 *  4. For "question" tasks: pauses and awaits user input via QuestionCard
 *  5. For "internal" tasks: runs silently and updates context
 *  6. Synthesises the final step output
 *  7. Applies output to model (immutable update with snapshot for rollback)
 *  8. Persists, renders, and triggers UI updates
 */

const StepEngine = (() => {

  // ── Step module registry ─────────────────────────────────────────────────
  const STEP_MODULES = {
    step0:  () => typeof Step0  !== 'undefined' ? Step0  : null,
    step1:  () => typeof Step1  !== 'undefined' ? Step1  : null,
    step2:  () => typeof Step2  !== 'undefined' ? Step2  : null,
    step3:  () => typeof Step3  !== 'undefined' ? Step3  : null,
    step4:  () => typeof Step4  !== 'undefined' ? Step4  : null,
    step5:  () => typeof Step5  !== 'undefined' ? Step5  : null,
    step6:  () => typeof Step6  !== 'undefined' ? Step6  : null,
    step7:  () => typeof Step7  !== 'undefined' ? Step7  : null,  // ← FIX: was missing, caused "Step module step7 is not loaded"
    step7a: () => typeof Step7  !== 'undefined' ? Step7.targetArch : null,
    step7b: () => typeof Step7  !== 'undefined' ? Step7.roadmap    : null
  };

  /**
   * Optional explicit registration (in addition to lazy getters above).
   * registerStepsWhenReady() in the HTML calls this after all scripts load.
   * @param {Array} stepModules - Array of step objects [Step0, Step1, ...]
   */
  function register(stepModules) {
    if (!Array.isArray(stepModules)) return;
    const idMap = { step0: 'step0', step1: 'step1', step2: 'step2', step3: 'step3',
                    step4: 'step4', step5: 'step5', step6: 'step6', step7: 'step7' };
    stepModules.forEach(m => {
      if (m && m.id) {
        // Patch STEP_MODULES lazy getter to return registered instance directly
        const key = idMap[m.id] || m.id;
        if (key in STEP_MODULES) {
          STEP_MODULES[key] = () => m;
        }
      }
    });
    console.log('[StepEngine] Registered steps:', stepModules.map(m => m.id).join(', '));
  }

  // ── Active run tracker (for UI state) ────────────────────────────────────
  let _activeStepId = null;
  let _activeTaskIndex = 0;

  /**
   * Run a workflow step end-to-end.
   *
   * Supports two call signatures:
   *   StepEngine.run('step1', window.model)             — bridge from old button handlers
   *   StepEngine.run('step1', { initialPrompt }, model) — direct call with explicit input
   *
   * @param {string} stepId
   * @param {object} userInputOrModel
   * @param {object} [modelOverride]
   * @returns {Promise<object>} Updated model
   */
  async function run(stepId, userInputOrModel, modelOverride) {
    // Normalise call signatures
    let userInput, model;
    if (modelOverride === undefined || modelOverride === null) {
      // Called as run(stepId, model) — second arg is the model
      model     = userInputOrModel || window.model;
      userInput = {};
    } else {
      userInput = userInputOrModel || {};
      model     = modelOverride || window.model;
    }
    // Ensure model is always the global window.model if not provided
    if (!model) model = window.model || {};

    const stepModule = STEP_MODULES[stepId]?.();
    if (!stepModule) {
      _chatError(`Step module "${stepId}" is not loaded.`);
      throw new Error(`[StepEngine] Module not found: ${stepId}`);
    }

    _activeStepId    = stepId;
    _activeTaskIndex = 0;

    // ── Disable chat auto-save during step workflow ───────────────────────
    if (typeof window.enableChatAutoSave !== 'undefined') {
      window.enableChatAutoSave = false;
      console.log('[StepEngine] Chat auto-save disabled during step workflow');
    }

    console.log(`[StepEngine] Starting ${stepId}`);

    // ── 1. Validate dependencies ──────────────────────────────────────────
    _validateDependencies(stepId, model, stepModule);

    // ── 2. Preload instruction files ──────────────────────────────────────
    if (stepModule.tasks && typeof PromptBuilder !== 'undefined') {
      const preloadDefs = stepModule.tasks
        .filter(t => t.instructionFile)
        .map(t => ({ taskFile: t.instructionFile, fallback: t.systemPromptFallback || '' }));
      if (preloadDefs.length) {
        await PromptBuilder.preloadStep(stepId, preloadDefs);
      }
    }

    // ── 3. Build context ──────────────────────────────────────────────────
    let ctx = StepContext.build(stepId, model);
    ctx = { ...ctx, answers: {}, stepId, userInput };

    // ── 4. Initialize step state in model (snapshot current for rollback)─
    const snapshot = JSON.parse(JSON.stringify(
      model.steps?.[stepId]?.output || null
    ));
    let workingModel = {
      ...model,
      steps: {
        ...(model.steps || {}),
        [stepId]: {
          id: stepId,
          name: stepModule.name,
          status: 'in-progress',
          startedAt: new Date().toISOString(),
          completedTasks: [],
          answers: {},
          output: null,
          versions: [
            ...(model.steps?.[stepId]?.versions || []),
            ...(snapshot ? [{ timestamp: new Date().toISOString(), output: snapshot, reason: 'Pre-run snapshot' }] : [])
          ]
        }
      }
    };

    // ── 5. Execute tasks ──────────────────────────────────────────────────
    for (let i = 0; i < (stepModule.tasks || []).length; i++) {
      const taskDef = stepModule.tasks[i];
      _activeTaskIndex = i;

      // NEW: Check if task should run (conditional execution)
      if (taskDef.shouldRun && !taskDef.shouldRun(ctx)) {
        console.log(`[StepEngine] Skipping task ${taskDef.taskId} (shouldRun condition not met)`);
        continue;  // Skip this task
      }

      // Only show progress for user-facing question tasks, not internal background tasks
      if (taskDef.type === 'question') {
        _updateProgressUI(stepId, taskDef, i, stepModule.tasks.length);
      }

      let taskResult;
      try {
        taskResult = await _runTask(taskDef, ctx, userInput);
      } catch (err) {
        console.error(`[StepEngine] Task ${taskDef.taskId} failed:`, err);
        _chatError(`Task "${taskDef.title}" failed: ${err.message}`);
        // Mark step as errored but don't throw — caller can decide
        workingModel.steps[stepId].status = 'error';
        workingModel.steps[stepId].error  = err.message;
        if (typeof autoSaveCurrentModel === 'function') {
          // Write partial model to global
          Object.assign(window.model || {}, workingModel);
          autoSaveCurrentModel();
        }
        throw err;
      }

      // Merge task output into context for subsequent tasks
      ctx = { ...ctx, ...taskResult.output, answers: { ...ctx.answers, [taskDef.taskId]: taskResult.output } };

      // Record task result in working model
      workingModel.steps[stepId].completedTasks.push(taskDef.taskId);
      workingModel.steps[stepId].answers[taskDef.taskId] = taskResult.output;

      // Auto-save after each task (CRITICAL for user progress preservation)
      if (typeof autoSaveCurrentModel === 'function') {
        Object.assign(window.model || {}, workingModel);
        autoSaveCurrentModel();
        console.log(`[StepEngine] Auto-saved after task ${taskDef.taskId}`);
      }
      
      // Enable chat auto-save after completing each QUESTION task (not internal tasks)
      // This ensures user's Q&A conversation is preserved incrementally
      if (taskDef.type === 'question' && typeof window.enableChatAutoSave !== 'undefined') {
        window.enableChatAutoSave = true;
        if (typeof saveConversationHistory === 'function') saveConversationHistory();
        console.log(`[StepEngine] Chat auto-save enabled after question ${taskDef.taskId}`);
        // Re-disable for next question to keep workflow clean
        setTimeout(() => { window.enableChatAutoSave = false; }, 500);
      }
    }

    // ── 6. Synthesise final output ────────────────────────────────────────
    let finalOutput;
    try {
      finalOutput = stepModule.synthesize(ctx);
    } catch (err) {
      _chatError(`Synthesis failed: ${err.message}`);
      throw err;
    }

    // ── 7. Apply output to model (immutable update) ───────────────────────
    let newModel = stepModule.applyOutput(finalOutput, workingModel);

    // Mark step as completed
    newModel = {
      ...newModel,
      steps: {
        ...newModel.steps,
        [stepId]: {
          ...newModel.steps[stepId],
          status: 'completed',
          completedAt: new Date().toISOString(),
          output: finalOutput
        }
      }
    };

    // ── 8. Update global model, persist, render ───────────────────────────
    if (typeof window !== 'undefined' && typeof window.model !== 'undefined') {
      Object.assign(window.model, newModel);
    }
    if (typeof autoSaveCurrentModel === 'function')  autoSaveCurrentModel();
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof _updateContinueBtn === 'function') _updateContinueBtn(); // Update Continue button to show next step
    if (stepModule.onComplete) stepModule.onComplete(newModel);

    // ── Enable chat auto-save after step completion ───────────────────────
    if (typeof window.enableChatAutoSave !== 'undefined') {
      window.enableChatAutoSave = true;
      console.log('[StepEngine] Chat auto-save enabled after step completion');
    }

    _activeStepId    = null;
    _activeTaskIndex = 0;
    console.log(`[StepEngine] Completed ${stepId}`);
    return newModel;
  }

  // ── Run a single task ─────────────────────────────────────────────────────
  async function _runTask(taskDef, ctx, userInput) {
    const taskType = taskDef.type || 'internal';

    if (taskType === 'question') {
      // ── Question task: ask user, await answer ──────────────────────────
      return await _runQuestionTask(taskDef, ctx);
    } else {
      // ── Internal task: fire AI silently ───────────────────────────────
      return await _runInternalTask(taskDef, ctx, userInput);
    }
  }

  // ── Internal (AI-only) task ───────────────────────────────────────────────
  async function _runInternalTask(taskDef, ctx, userInput) {
    // Show thinking indicator in chat
    if (typeof showTypingIndicator === 'function') {
      showTypingIndicator();
    }

    // Load system prompt
    let systemPrompt;
    if (taskDef.instructionFile && typeof PromptBuilder !== 'undefined') {
      systemPrompt = await PromptBuilder.load(
        ctx.stepId, taskDef.instructionFile, taskDef.systemPromptFallback || ''
      );
    } else {
      systemPrompt = typeof taskDef.systemPromptFallback === 'function'
        ? taskDef.systemPromptFallback(ctx)
        : (taskDef.systemPromptFallback || '');
    }

    // Build user prompt
    const userPrompt = typeof taskDef.userPrompt === 'function'
      ? taskDef.userPrompt(ctx, userInput)
      : taskDef.userPrompt;

    // AI call
    const aiResult = await AIService.call({
      taskId:        taskDef.taskId,
      taskType:      taskDef.taskType || 'general',
      systemPrompt,
      userPrompt,
      replyLanguage: ctx.language,
      expectsJson:   taskDef.expectsJson !== false,
      timeoutMs:     taskDef.timeoutMs,
      temperature:   taskDef.temperature
    });

    if (aiResult.status === 'error') {
      throw new Error(aiResult.error || 'AI call failed');
    }

    // Parse output
    let parsed = taskDef.parseOutput
      ? taskDef.parseOutput(aiResult.rawOutput)
      : OutputValidator.parseJSON(aiResult.rawOutput, taskDef.taskId);

    // Validate schema (and auto-normalize types like string→array)
    if (taskDef.outputSchema && typeof OutputValidator !== 'undefined') {
      parsed = OutputValidator.assert(parsed, taskDef.outputSchema, taskDef.taskId);
    }

    // Hide thinking indicator
    if (typeof hideTypingIndicator === 'function') {
      hideTypingIndicator();
    }

    return { taskId: taskDef.taskId, output: parsed, aiResult };
  }

  // ── Question task: render card in chat, await user answer ─────────────────
  async function _runQuestionTask(taskDef, ctx) {
    // Generate the question via AI (if taskDef has AI generation)
    let questionData;
    if (taskDef.generateQuestion) {
      const aiResult = await _runInternalTask({ ...taskDef, type: 'internal' }, ctx, {});
      questionData = aiResult.output;
    } else {
      // Static question (pre-defined in the task def)
      questionData = {
        question: typeof taskDef.question === 'function' ? taskDef.question(ctx) : taskDef.question,
        options: typeof taskDef.options === 'function' ? taskDef.options(ctx) : (taskDef.options || []),
        guidance: taskDef.guidance || ''
      };
    }

    // ── AUTOPILOT MODE: Auto-answer question tasks with first/recommended option ──
    // In autopilot mode there is no user to type an answer, so we select the first
    // (recommended) option automatically and notify the user via chat.
    if (window._autopilotState?.running) {
      const autoAnswer = (questionData.options && questionData.options.length > 0)
        ? questionData.options[0]
        : 'Confirm';
      console.log(`[StepEngine] Autopilot auto-answering "${taskDef.taskId}" with: "${autoAnswer}"`);
      if (typeof addAssistantMessage === 'function') {
        addAssistantMessage(
          `⚡ **Autopilot:** Auto-selected for *${taskDef.title}*: "${autoAnswer}"`,
          { mode: 'autopilot' }
        );
      }
      const output = taskDef.wrapAnswer
        ? taskDef.wrapAnswer(autoAnswer, ctx)
        : { [taskDef.taskId]: autoAnswer, userAnswer: autoAnswer };
      return { taskId: taskDef.taskId, output, aiResult: null };
    }

    // Show question card in chat, await answer
    const answer = await QuestionCard.show({
      taskId:        taskDef.taskId,
      title:         taskDef.title,
      question:      questionData.question,
      options:       questionData.options || [],
      guidance:      questionData.guidance || '',
      allowSkip:     taskDef.allowSkip !== false,
      allowMultiple: taskDef.allowMultiple || false,
      taskIndex:     _activeTaskIndex,
      totalTasks:    STEP_MODULES[ctx.stepId]?.()?.tasks?.length || 9
    });

    // Wrap plain string answer in expected output shape
    const output = taskDef.wrapAnswer
      ? taskDef.wrapAnswer(answer, ctx)
      : { [taskDef.taskId]: answer, userAnswer: answer };

    return { taskId: taskDef.taskId, output, aiResult: null };
  }

  // ── Dependency validation ─────────────────────────────────────────────────
  function _validateDependencies(stepId, model, stepModule) {
    for (const depId of (stepModule.dependsOn || [])) {
      const dep = model.steps?.[depId];
      if (!dep || dep.status !== 'completed') {
        // Check legacy flags too (for backward compat during migration)
        const legacyOk = _checkLegacyFlag(depId, model);
        if (!legacyOk) {
          throw new Error(
            `[StepEngine] ${stepId} requires "${depId}" to be completed first.`
          );
        }
      }
    }
  }

  // Backward compat: check old model flags until all steps are migrated
  function _checkLegacyFlag(depId, model) {
    switch (depId) {
      case 'step1':  return !!(model.strategicIntentConfirmed ||
                              model.strategicIntent?.strategic_ambition ||
                              model.strategicIntent?.burning_platform ||
                              // Implicit: if BMC or capabilities exist, step1 was done in a prior flow
                              model.bmc ||
                              model.capabilities?.length);
      case 'step2':  return !!(model.bmc?.value_propositions?.length ||
                              model.bmc?.value_proposition ||
                              model.bmc);
      case 'step3':  return !!(model.capabilities?.length);
      case 'step4':  return !!(model.operatingModel?.current?.value_delivery ||
                              model.operatingModel?.valueProposition);
      case 'step5':  return !!model.gapAnalysisDone;
      case 'step6':  return !!(model.valuePools?.length);
      case 'step7a': return !!model.targetArchDone;
      default: return false;
    }
  }

  // ── Progress UI ───────────────────────────────────────────────────────────
  function _updateProgressUI(stepId, taskDef, taskIndex, totalTasks) {
    const progressEl = document.getElementById('step-engine-progress');
    if (progressEl) {
      const textEl  = document.getElementById('step-engine-progress-text');
      const countEl = document.getElementById('step-engine-progress-count');
      if (textEl)  textEl.textContent  = taskDef.title;
      if (countEl) countEl.textContent = `${taskIndex + 1}/${totalTasks}`;
      progressEl.style.display = 'flex';
    }
    if (typeof spin === 'function') spin(_getSpinnerId(stepId), true);
  }

  function _getSpinnerId(stepId) {
    const map = { step0: 's0', step1: 's0', step2: 's2b', step3: 's1', step4: 's3', step5: 's5', step6: 's6v', step7a: 's6', step7b: 's7' };
    return map[stepId] || 's0';
  }

  function stopSpinner(stepId) {
    if (typeof spin === 'function') spin(_getSpinnerId(stepId), false);
    const progressEl = document.getElementById('step-engine-progress');
    if (progressEl) progressEl.style.display = 'none';
  }

  // ── Chat helpers ──────────────────────────────────────────────────────────
  function _chatError(msg) {
    if (typeof addAssistantMessage === 'function') {
      addAssistantMessage(`❌ **Error:** ${msg}`);
    }
    console.error(`[StepEngine] ${msg}`);
    if (typeof toast === 'function') toast(msg, true);
  }

  // ── Rollback ──────────────────────────────────────────────────────────────
  /**
   * Roll back a step to its previous version snapshot.
   * @param {string} stepId
   * @param {object} model
   * @returns {object} Updated model with previous output restored
   */
  function rollback(stepId, model) {
    const versions = model.steps?.[stepId]?.versions || [];
    if (!versions.length) {
      console.warn(`[StepEngine] No versions to roll back to for ${stepId}`);
      return model;
    }
    const prev = versions[versions.length - 1];
    const newModel = {
      ...model,
      steps: {
        ...model.steps,
        [stepId]: {
          ...model.steps[stepId],
          output: prev.output,
          status: 'completed',
          versions: versions.slice(0, -1)
        }
      }
    };
    // Re-apply to flat model fields via module's applyOutput
    const stepModule = STEP_MODULES[stepId]?.();
    if (stepModule?.applyOutput && prev.output) {
      const restored = stepModule.applyOutput(prev.output, newModel);
      Object.assign(window.model || {}, restored);
      if (typeof autoSaveCurrentModel === 'function') autoSaveCurrentModel();
      if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
      console.log(`[StepEngine] Rolled back ${stepId} to version from ${prev.timestamp}`);
      return restored;
    }
    return newModel;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return { run, rollback, stopSpinner, register };

})();


// ── QuestionCard — renders question cards in the chat panel ─────────────────
/**
 * QuestionCard.show(opts) renders an interactive question card in the AI
 * chat sidebar and returns a Promise that resolves with the user's answer.
 *
 * This is the Step Engine's primary UI primitive for the 9-task Step 1 flow.
 */
const QuestionCard = (() => {

  let _cardCounter = 0;

  /**
   * @param {object} opts
   * @param {string}   opts.taskId
   * @param {string}   opts.title
   * @param {string}   opts.question
   * @param {string[]} opts.options       - Suggested answer options (can be empty)
   * @param {string}   [opts.guidance]    - Helper text shown below question
   * @param {boolean}  [opts.allowSkip]   - Show "Skip" button (default true)
   * @param {boolean}  [opts.allowMultiple] - Allow selecting multiple options (default false)
   * @param {number}   [opts.taskIndex]   - 0-based task number
   * @param {number}   [opts.totalTasks]  - Total tasks in step
   * @returns {Promise<string>}  -  User's answer text
   */
  function show(opts) {
    return new Promise(resolve => {
      _cardCounter++;
      const cardId = `qcard-${_cardCounter}`;

      // Ensure chat panel is open
      const panel = document.getElementById('ai-chat-panel');
      if (panel && panel.classList.contains('hidden') && typeof toggleChatPanel === 'function') {
        toggleChatPanel();
      }

      // Progress indicator
      const progressPct = opts.totalTasks > 0
        ? Math.round(((opts.taskIndex || 0) / opts.totalTasks) * 100)
        : 0;
      const progressBar = opts.totalTasks > 0 ? `
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">
              ${opts.title}
            </span>
            <span style="font-size:11px;font-weight:600;color:#cbd5e1;">
              Q${(opts.taskIndex || 0) + 1} of ${opts.totalTasks}
            </span>
          </div>
          <div style="height:4px;background:rgba(148,163,184,0.2);border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${progressPct}%;background:#6366f1;border-radius:99px;transition:width 0.3s;"></div>
          </div>
        </div>` : '';

      // Options HTML with numbering
      const multiHint = opts.allowMultiple ? `
        <div style="font-size:11px;color:#94a3b8;margin-top:8px;margin-bottom:6px;font-style:italic;">
          💡 You can select multiple options (click to toggle)
        </div>` : '';
      
      const customInputHint = (opts.options || []).length > 0 ? `
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.15);">
          <div style="font-size:11px;color:#94a3b8;font-style:italic;margin-bottom:6px;">
            ✏️ Or type your own answer in the chat box below and press Enter
          </div>
        </div>` : '';
      
      const optionsHtml = (opts.options || []).length > 0 ? `
        ${multiHint}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
          ${opts.options.map((opt, oi) => `
            <button type="button"
              onclick="_qcSelectOption('${cardId}', ${oi}, this)"
              style="font-size:13px;padding:10px 16px;border-radius:8px;border:1px solid rgba(148,163,184,0.3);
                     background:rgba(148,163,184,0.1);color:#e2e8f0;cursor:pointer;transition:all 0.15s;
                     text-align:left;"
              onmouseover="this.style.background='rgba(148,163,184,0.2)';this.style.borderColor='rgba(203,213,225,0.5)';"
              onmouseout="if(this.style.borderColor!=='rgb(99, 102, 241)'){this.style.background='rgba(148,163,184,0.1)';this.style.borderColor='rgba(148,163,184,0.3)';}"
              data-cardid="${cardId}" data-oi="${oi}">
              <strong>${oi + 1}.</strong> ${_escapeHtml(opt)}
            </button>`).join('')}
        </div>
        ${customInputHint}` : '';

      const guidanceHtml = opts.guidance ? `
        <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:12px;padding:12px;
                    background:rgba(148,163,184,0.1);border-left:3px solid #64748b;border-radius:6px;">
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Example:</span><br>
          <span style="color:#e2e8f0;margin-top:4px;display:inline-block;">${_escapeHtml(opts.guidance)}</span>
        </div>` : '';

      const actionBar = `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(148,163,184,0.2);display:flex;gap:8px;align-items:center;">
          <button type="button"
            onclick="_qcSubmit('${cardId}')"
            style="font-size:13px;font-weight:600;color:#fff;background:#6366f1;border:none;
                   padding:8px 20px;border-radius:6px;cursor:pointer;transition:all 0.15s;"
            onmouseover="this.style.background='#4f46e5';"
            onmouseout="this.style.background='#6366f1';">
            Submit →
          </button>
          ${opts.allowSkip !== false ? `
            <button type="button"
              onclick="_qcSkip('${cardId}')"
              style="font-size:12px;color:#94a3b8;background:rgba(148,163,184,0.05);border:1px solid rgba(148,163,184,0.2);
                     padding:6px 12px;border-radius:6px;cursor:pointer;transition:all 0.15s;"
              onmouseover="this.style.background='rgba(148,163,184,0.15)';this.style.color='#cbd5e1';"
              onmouseout="this.style.background='rgba(148,163,184,0.05)';this.style.color='#94a3b8';">
              Skip →
            </button>` : ''}
        </div>`;

      const card = document.createElement('div');
      card.id = cardId;
      card.className = 'chat-message assistant-message';
      card.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content" style="width:100%;">
          ${progressBar}
          <div style="font-size:15px;color:#f1f5f9;margin-bottom:${guidanceHtml ? '12px' : '16px'};line-height:1.5;
                      font-weight:600;padding:12px 16px;background:rgba(99,102,241,0.08);border-left:3px solid #6366f1;
                      border-radius:6px;">
            <span style="font-size:11px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px;">
              📋 QUESTION
            </span>
            ${_formatQuestionText(opts.question)}
          </div>
          ${guidanceHtml}
          ${optionsHtml}
          ${actionBar}
        </div>`;

      // Attach to messages container
      const container = document.getElementById('chat-messages');
      if (container) {
        container.appendChild(card);
        if (typeof scrollToBottom === 'function') scrollToBottom();
        // Focus main chat input and set up Enter key handler
        requestAnimationFrame(() => {
          const mainInput = document.getElementById('chat-input');
          if (mainInput) {
            mainInput.focus();
            mainInput.placeholder = 'Type your own answer here, or select an option above...';
            // Store active question card ID
            mainInput.dataset.activeQuestionCard = cardId;
            // Add Enter key listener
            const enterHandler = (e) => {
              if (e.key === 'Enter' && !e.shiftKey && mainInput.dataset.activeQuestionCard === cardId) {
                e.preventDefault();
                _qcSubmit(cardId);
              }
            };
            mainInput.addEventListener('keydown', enterHandler);
            // Store handler so we can remove it later
            window[`_qcEnterHandler_${cardId}`] = enterHandler;
          }
        });
      }

      // Store resolve on card element
      card._resolve = resolve;

      // Store global handlers (support multi-select)
      window[`_qcData_${cardId}`] = { 
        selectedOptions: [],
        allowMultiple: opts.allowMultiple || false,
        resolve 
      };
    });
  }

  function _escapeHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _formatQuestionText(str) {
    // Escape HTML first (security)
    let formatted = _escapeHtml(str);
    // Convert **text** to <strong>text</strong> for bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Convert newlines to <br> for line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  return { show };

})();

// ── QuestionCard global onclick handlers (inline onclick references) ──────────
function _qcSelectOption(cardId, oi, btn) {
  const data = window[`_qcData_${cardId}`];
  if (!data) return;
  
  // Extract option text without the number prefix (e.g., "1. Text" -> "Text")
  const fullText = btn.textContent.trim();
  const optText = fullText.replace(/^\d+\.\s*/, ''); // Remove "1. " prefix
  const isSelected = data.selectedOptions.includes(optText);
  
  if (data.allowMultiple) {
    // Multi-select: toggle option on/off
    if (isSelected) {
      // Deselect
      data.selectedOptions = data.selectedOptions.filter(o => o !== optText);
      btn.style.background = 'rgba(148,163,184,0.1)';
      btn.style.color = '#e2e8f0';
      btn.style.borderColor = 'rgba(148,163,184,0.3)';
    } else {
      // Select
      data.selectedOptions.push(optText);
      btn.style.background = '#6366f1';
      btn.style.color = '#fff';
      btn.style.borderColor = '#6366f1';
    }
  } else {
    // Single-select: deselect all others
    const card = document.getElementById(cardId);
    if (card) {
      card.querySelectorAll(`[data-cardid="${cardId}"]`).forEach(b => {
        b.style.background = 'rgba(148,163,184,0.1)';
        b.style.color = '#e2e8f0';
        b.style.borderColor = 'rgba(148,163,184,0.3)';
      });
    }
    btn.style.background = '#6366f1';
    btn.style.color = '#fff';
    btn.style.borderColor = '#6366f1';
    data.selectedOptions = [optText];
  }
  
  // Update main chat input with selected option(s)
  const mainInput = document.getElementById('chat-input');
  if (mainInput) {
    mainInput.value = data.selectedOptions.join('; ');
  }
}

function _qcSubmit(cardId) {
  try {
    const data = window[`_qcData_${cardId}`];
    if (!data) {
      console.warn('[QuestionCard] Submit called but question data not found:', cardId);
      return;
    }
    
    // Prevent double-submission
    if (data.submitted) {
      console.warn('[QuestionCard] Answer already submitted for:', cardId);
      return;
    }
    data.submitted = true;
    
    // Get answer from main chat input or selected options
    const mainInput = document.getElementById('chat-input');
    const manualInput = mainInput && mainInput.value.trim();
    const answer = manualInput || data.selectedOptions.join('; ') || '';
    
    if (!answer) {
      console.warn('[QuestionCard] No answer provided');
      data.submitted = false; // Allow retry
      return;
    }
    
    // Clear main input after submit
    if (mainInput) {
      mainInput.value = '';
      mainInput.placeholder = 'Ask Advicy Agent anything about your EA...';
    }
    
    console.log('[QuestionCard] Submitting answer:', answer);
    _qcFinalize(cardId, answer);
  } catch (err) {
    console.error('[QuestionCard] Error in _qcSubmit:', err);
    alert('An error occurred while submitting your answer. Please try again or refresh the page.');
  }
}

function _qcSkip(cardId) {
  // Clear main input when skipping
  const mainInput = document.getElementById('chat-input');
  if (mainInput) {
    mainInput.value = '';
    mainInput.placeholder = 'Ask Advicy Agent anything about your EA...';
  }
  _qcFinalize(cardId, '(skipped)');
}

function _qcFinalize(cardId, answer) {
  try {
    const data = window[`_qcData_${cardId}`];
    if (!data) {
      console.warn('[QuestionCard] Finalize called but data not found:', cardId);
      return;
    }
    
    const card = document.getElementById(cardId);
    if (card) { 
      card.style.opacity = '0.6'; 
      card.style.pointerEvents = 'none'; 
    }
    
    // Remove Enter key handler
    const mainInput = document.getElementById('chat-input');
    if (mainInput) {
      const handler = window[`_qcEnterHandler_${cardId}`];
      if (handler) {
        mainInput.removeEventListener('keydown', handler);
        delete window[`_qcEnterHandler_${cardId}`];
      }
      delete mainInput.dataset.activeQuestionCard;
    }
    
    const resolve = data.resolve;
    delete window[`_qcData_${cardId}`];
    
    // Show confirmed answer as a user bubble
    if (typeof addUserMessage === 'function' && answer && answer !== '(skipped)') {
      addUserMessage(answer);
    }
    
    console.log('[QuestionCard] Resolving with answer:', answer);
    if (resolve) {
      setTimeout(() => {
        try {
          resolve(answer);
        } catch (err) {
          console.error('[QuestionCard] Error in resolve callback:', err);
        }
      }, 100); // Small delay to allow UI to update
    }
  } catch (err) {
    console.error('[QuestionCard] Error in _qcFinalize:', err);
    alert('An error occurred while processing your answer. Please refresh the page and try again.');
  }
}
