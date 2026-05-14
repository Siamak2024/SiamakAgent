/**
 * GrowthDashboard_BusinessObjectivesWorkflow
 * 
 * AI-Assisted Business Objectives Definition for Growth Sprint Dashboard
 * - Copied from EA_BusinessObjectivesWorkflow Step1 logic
 * - Fixed model: gpt-5.4 (not gpt-5)
 * - Account-scoped: Requires accountId parameter
 * - Uses GrowthDashboard_ObjectivesManager for storage
 * 
 * Features:
 * - Max 5 questions to understand strategic context
 * - AI synthesizes 3-5 business objectives
 * - Evidence-based validation support
 * - Saves to Growth Sprint Dashboard storage (localStorage)
 * 
 * Version: 1.0 (Phase 2)
 */

const GrowthDashboard_BusinessObjectivesWorkflow = (function() {
  'use strict';

  // Workflow state (per account)
  let workflowStates = {}; // { accountId: { currentStep, questionCount, conversationHistory, ... } }

  // Constants
  const MAX_QUESTIONS = 5;

  /**
   * Get or initialize workflow state for account
   */
  function getWorkflowState(accountId) {
    if (!workflowStates[accountId]) {
      workflowStates[accountId] = {
        currentStep: 0, // 0=not started, 1=in progress, 2=complete
        questionCount: 0,
        conversationHistory: [],
        synthesis: null
      };
    }
    return workflowStates[accountId];
  }

  /**
   * Reset workflow state for account
   */
  function resetWorkflowState(accountId) {
    workflowStates[accountId] = {
      currentStep: 0,
      questionCount: 0,
      conversationHistory: [],
      synthesis: null
    };
    console.log(`🔄 Reset workflow state for account: ${accountId}`);
  }

  /**
   * Build system prompt for question generation
   */
  function buildQuestionPrompt(questionCount, conversationHistory) {
    return `You are an expert Enterprise Architect helping define business objectives.

Your task: Ask questions to understand strategic context and define clear business objectives.

Rules:
1. Ask ONE question at a time
2. Maximum 5 questions total
3. After 5 questions OR when you have enough information, synthesize 3-5 business objectives
4. Focus on OUTCOMES, not solutions
5. Ensure objectives are measurable and strategic

Current question count: ${questionCount}/${MAX_QUESTIONS}

${questionCount === MAX_QUESTIONS ? `
IMPORTANT: This is the final question. After the user responds, you MUST synthesize objectives in JSON format.

After receiving the user's final answer, respond with ONLY this JSON structure (no other text):
{
  "strategicContext": {
    "industry": "string",
    "companySize": "string",
    "challenges": ["string"],
    "opportunities": ["string"]
  },
  "objectives": [
    {
      "name": "string",
      "description": "string",
      "priority": "high|medium|low",
      "strategicTheme": "string",
      "outcomeStatement": "string"
    }
  ]
}
` : 'Continue asking questions to gather strategic context.'}`;
  }

  /**
   * Build synthesis prompt
   */
  function buildSynthesisPrompt(conversationSummary) {
    return `Based on the following conversation, synthesize 3-5 clear business objectives.

Conversation:
${conversationSummary}

Respond with ONLY this JSON structure (no other text):
{
  "strategicContext": {
    "industry": "string",
    "companySize": "string",
    "challenges": ["string"],
    "opportunities": ["string"]
  },
  "objectives": [
    {
      "name": "string",
      "description": "string",
      "priority": "high|medium|low",
      "strategicTheme": "string",
      "outcomeStatement": "string"
    }
  ]
}`;
  }

  /**
   * Start workflow for account
   */
  async function startWorkflow(accountId) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    console.log(`🚀 Starting Business Objectives workflow for account: ${accountId}`);

    // Reset state
    resetWorkflowState(accountId);

    const state = getWorkflowState(accountId);
    state.currentStep = 1;
    state.questionCount = 1;

    // First question
    const firstQuestion = "What industry does your organization operate in?";
    state.conversationHistory.push({
      role: 'assistant',
      content: firstQuestion,
      timestamp: Date.now()
    });

    return {
      question: firstQuestion,
      questionCount: 1,
      accountId: accountId
    };
  }

  /**
   * Handle user response
   */
  async function handleUserResponse(accountId, userMessage) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    if (!userMessage || userMessage.trim() === '') {
      throw new Error('userMessage is required');
    }

    const state = getWorkflowState(accountId);

    console.log(`📝 Processing user response for account ${accountId} (Q${state.questionCount})`);

    // Record user response
    state.conversationHistory.push({
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now()
    });

    // Check if we've reached max questions
    if (state.questionCount >= MAX_QUESTIONS) {
      // Synthesize objectives
      return await synthesizeObjectives(accountId);
    }

    // Generate next question using AI
    try {
      const systemPrompt = buildQuestionPrompt(
        state.questionCount,
        state.conversationHistory
      );

      console.log(`🤖 Calling AI (gpt-5.4) to generate question ${state.questionCount + 1}...`);

      const response = await AzureOpenAIProxy.create(
        userMessage,
        {
          instructions: systemPrompt,
          model: 'gpt-5.4', // FIXED: Was 'gpt-5'
          timeout: 45000
        }
      );

      const nextQuestion = response.output_text;

      // Increment question count
      state.questionCount++;

      // Record AI question
      state.conversationHistory.push({
        role: 'assistant',
        content: nextQuestion,
        timestamp: Date.now()
      });

      return {
        question: nextQuestion,
        questionCount: state.questionCount,
        accountId: accountId
      };

    } catch (error) {
      console.error('❌ Error generating next question:', error);
      throw error;
    }
  }

  /**
   * Synthesize objectives from conversation
   */
  async function synthesizeObjectives(accountId) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    const state = getWorkflowState(accountId);

    console.log(`🔨 Synthesizing business objectives for account: ${accountId}...`);

    try {
      // Build conversation summary
      const conversationSummary = state.conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n');

      const synthesisPrompt = buildSynthesisPrompt(conversationSummary);

      console.log('🤖 Calling AI (gpt-5.4) to synthesize objectives...');

      const response = await AzureOpenAIProxy.create(
        "Please synthesize the objectives now.",
        {
          instructions: synthesisPrompt,
          model: 'gpt-5.4', // FIXED: Was 'gpt-5'
          timeout: 90000
        }
      );

      // Parse JSON response
      let synthesis;
      try {
        const cleanedOutput = response.output_text.trim();
        // Try to extract JSON if wrapped in markdown
        const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : cleanedOutput;
        synthesis = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', response.output_text);
        throw new Error('AI response was not valid JSON');
      }

      // Validate synthesis structure
      if (!synthesis.objectives || !Array.isArray(synthesis.objectives)) {
        throw new Error('Synthesis missing objectives array');
      }

      if (synthesis.objectives.length === 0) {
        throw new Error('Synthesis returned no objectives');
      }

      // Store synthesis
      state.synthesis = synthesis;
      state.currentStep = 2;

      console.log(`✅ Synthesized ${synthesis.objectives.length} objectives`);

      return {
        synthesis: synthesis,
        questionCount: state.questionCount,
        accountId: accountId,
        complete: true
      };

    } catch (error) {
      console.error('❌ Error synthesizing objectives:', error);
      throw error;
    }
  }

  /**
   * Save objectives to account
   */
  async function saveObjectives(accountId, objectives, industry = null) {
    if (!accountId) {
      throw new Error('accountId is required');
    }

    if (!objectives || !Array.isArray(objectives)) {
      throw new Error('objectives must be an array');
    }

    console.log(`💾 Saving ${objectives.length} objectives to account: ${accountId}`);

    const state = getWorkflowState(accountId);
    const savedObjectives = [];

    try {
      for (const objectiveData of objectives) {
        // Create objective with workflow metadata
        const objective = {
          name: objectiveData.name,
          description: objectiveData.description,
          priority: objectiveData.priority,
          strategicTheme: objectiveData.strategicTheme,
          outcomeStatement: objectiveData.outcomeStatement,
          linkedCapabilities: objectiveData.linkedCapabilities || [],
          validation_status: objectiveData.validation_status || 'unknown',
          evidence_source: objectiveData.evidence_source || null,
          evidence_strength: objectiveData.evidence_strength || 'unsupported',
          evidence_gap: objectiveData.evidence_gap || null,
          industry: industry || objectiveData.industry || null,
          isShared: objectiveData.isShared || false,
          createdBy: 'ai_workflow',
          workflowState: {
            step1Complete: true,
            step2Complete: false,
            aiSessionHistory: [
              {
                step: 1,
                timestamp: Date.now(),
                questionCount: state.questionCount,
                userInputs: state.conversationHistory
                  .filter(msg => msg.role === 'user')
                  .map(msg => msg.content)
              }
            ]
          }
        };

        const saved = GrowthDashboard_ObjectivesManager.createObjective(accountId, objective);
        savedObjectives.push(saved);
        
        // If marked as shared, share to industry
        if (objectiveData.isShared && industry) {
          try {
            GrowthDashboard_ObjectivesManager.shareObjective(saved.id, accountId);
          } catch (error) {
            console.warn(`Failed to share objective ${saved.id}:`, error);
          }
        }
      }

      console.log(`✅ Saved ${savedObjectives.length} objectives to Growth Sprint Dashboard`);

      return {
        success: true,
        savedObjectives: savedObjectives,
        count: savedObjectives.length
      };

    } catch (error) {
      console.error('❌ Error saving objectives:', error);
      throw error;
    }
  }

  /**
   * Get current workflow state for account
   */
  function getCurrentState(accountId) {
    if (!accountId) {
      return null;
    }
    return getWorkflowState(accountId);
  }

  // Public API
  return {
    startWorkflow,
    handleUserResponse,
    synthesizeObjectives,
    saveObjectives,
    getCurrentState,
    resetWorkflowState,
    
    // Constants
    MAX_QUESTIONS
  };
})();

// Log initialization
console.log('✅ GrowthDashboard_BusinessObjectivesWorkflow loaded (Phase 2 - AI Integration)');
