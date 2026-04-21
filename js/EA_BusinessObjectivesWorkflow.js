/**
 * Business Objectives AI-Assisted Workflow
 * 
 * Orchestrates the 3-step AI-driven workflow:
 * - Step 1: Understand Goals (AI-driven objectives definition)
 * - Step 2: Define and Assess Capabilities (APQC mapping)
 * - Step 3 (Optional): Link to EA Insights (Integration)
 * 
 * Features:
 * - Context-aware AI across all steps
 * - Max 5 questions per step
 * - Structured output generation
 * - Workflow state persistence
 * - Integration with existing EA components
 */

const EA_BusinessObjectivesWorkflow = (function() {
  'use strict';

  // Workflow state
  let currentState = {
    currentStep: 0, // 0=not started, 1=objectives, 2=capabilities, 3=insights
    step1Data: null,
    step2Data: null,
    step3Data: null,
    questionCounts: {
      step1: 0,
      step2: 0,
      step3: 0
    },
    conversationHistory: {
      step1: [],
      step2: [],
      step3: []
    },
    workflowComplete: {
      step1: false,
      step2: false,
      step3: false
    }
  };

  // Constants
  const MAX_QUESTIONS_PER_STEP = 5;

  // ==================== STEP 1: UNDERSTAND GOALS ====================

  /**
   * Build Step 1 system prompt (objectives definition)
   */
  function buildStep1SystemPrompt(questionCount, conversationHistory) {
    return `You are an expert Enterprise Architect helping define business objectives.

Your task: Ask questions to understand strategic context and define clear business objectives.

Rules:
1. Ask ONE question at a time
2. Maximum 5 questions total
3. After 5 questions OR when you have enough information, synthesize 3-5 business objectives
4. Focus on OUTCOMES, not solutions
5. Ensure objectives are measurable and strategic

Current question count: ${questionCount}/${MAX_QUESTIONS_PER_STEP}

${questionCount === MAX_QUESTIONS_PER_STEP ? `
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
   * Start Step 1: Understand Goals
   */
  async function startStep1() {
    console.log('🚀 Starting Step 1: Understand Goals');

    // Reset Step 1 state
    currentState.currentStep = 1;
    currentState.questionCounts.step1 = 0;
    currentState.conversationHistory.step1 = [];
    currentState.workflowComplete.step1 = false;

    // First question
    const firstQuestion = "What industry does your organization operate in?";
    currentState.questionCounts.step1 = 1;
    currentState.conversationHistory.step1.push({
      role: 'assistant',
      content: firstQuestion,
      timestamp: Date.now()
    });

    return {
      question: firstQuestion,
      questionCount: 1,
      step: 1
    };
  }

  /**
   * Handle Step 1 user response
   */
  async function handleStep1UserResponse(userMessage) {
    console.log(`📝 Step 1: Processing user response (Q${currentState.questionCounts.step1})`);

    // Record user response
    currentState.conversationHistory.step1.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });

    // Check if we've reached max questions
    if (currentState.questionCounts.step1 >= MAX_QUESTIONS_PER_STEP) {
      // Synthesize objectives
      return await synthesizeObjectives();
    }

    // Generate next question using AI
    try {
      const systemPrompt = buildStep1SystemPrompt(
        currentState.questionCounts.step1,
        currentState.conversationHistory.step1
      );

      const response = await AzureOpenAIProxy.create(
        userMessage,
        {
          instructions: systemPrompt,
          model: 'gpt-5'
        }
      );

      const nextQuestion = response.output_text;

      // Increment question count
      currentState.questionCounts.step1++;

      // Record AI question
      currentState.conversationHistory.step1.push({
        role: 'assistant',
        content: nextQuestion,
        timestamp: Date.now()
      });

      return {
        question: nextQuestion,
        questionCount: currentState.questionCounts.step1,
        step: 1
      };

    } catch (error) {
      console.error('❌ Error generating next question:', error);
      throw error;
    }
  }

  /**
   * Synthesize objectives from conversation
   */
  async function synthesizeObjectives() {
    console.log('🔨 Synthesizing business objectives from conversation...');

    try {
      // Build synthesis prompt
      const conversationSummary = currentState.conversationHistory.step1
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n');

      const synthesisPrompt = `Based on the following conversation, synthesize 3-5 clear business objectives.

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

      const response = await AzureOpenAIProxy.create(
        "Please synthesize the objectives now.",
        {
          instructions: synthesisPrompt,
          model: 'gpt-5'
        }
      );

      // Parse JSON response
      let synthesis;
      try {
        synthesis = JSON.parse(response.output_text);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', response.output_text);
        throw new Error('AI response was not valid JSON');
      }

      // Store synthesis
      currentState.step1Data = synthesis;

      return {
        synthesis: synthesis,
        questionCount: currentState.questionCounts.step1,
        step: 1,
        complete: true
      };

    } catch (error) {
      console.error('❌ Error synthesizing objectives:', error);
      throw error;
    }
  }

  /**
   * Complete Step 1 and save objectives
   */
  async function completeStep1(objectives) {
    console.log('✅ Completing Step 1: Saving objectives...');

    try {
      // Save each objective to EA_ObjectivesManager
      const savedObjectives = [];

      for (const objectiveData of objectives) {
        const objective = {
          id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...objectiveData,
          linkedCapabilities: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          workflowState: {
            step1Complete: true,
            step2Complete: false,
            step3Complete: false,
            aiSessionHistory: [
              {
                step: 1,
                timestamp: Date.now(),
                questionCount: currentState.questionCounts.step1,
                userInputs: currentState.conversationHistory.step1
                  .filter(msg => msg.role === 'user')
                  .map(msg => msg.content)
              }
            ]
          }
        };

        const saved = await EA_ObjectivesManager.createObjective(objective);
        savedObjectives.push(saved);
      }

      // Mark Step 1 as complete
      currentState.workflowComplete.step1 = true;

      console.log(`✅ Step 1 complete: Saved ${savedObjectives.length} objectives`);

      return {
        step1Complete: true,
        savedObjectives: savedObjectives,
        nextStep: 2
      };

    } catch (error) {
      console.error('❌ Error completing Step 1:', error);
      throw error;
    }
  }

  // ==================== STEP 2: CAPABILITY MAPPING ====================

  /**
   * Build Step 2 system prompt (capability mapping)
   */
  function buildStep2SystemPrompt(questionCount, step1Context, apqcCapabilities) {
    const contextSummary = step1Context ? `
Strategic Context from Step 1:
- Industry: ${step1Context.strategicContext?.industry || 'Unknown'}
- Company Size: ${step1Context.strategicContext?.companySize || 'Unknown'}
- Key Challenges: ${(step1Context.strategicContext?.challenges || []).join(', ')}
- Opportunities: ${(step1Context.strategicContext?.opportunities || []).join(', ')}

Business Objectives:
${(step1Context.objectives || []).map(obj => `- ${obj.name}: ${obj.description}`).join('\n')}
` : 'No Step 1 context available';

    return `You are an expert Enterprise Architect mapping business objectives to capabilities using the APQC framework.

${contextSummary}

Your task: Ask questions to map objectives to APQC capabilities and identify gaps.

Rules:
1. Ask ONE question at a time
2. Maximum 5 questions total
3. Use APQC Process Classification Framework v8.0
4. Identify capability gaps and maturity levels
5. Prioritize based on strategic themes

Current question count: ${questionCount}/${MAX_QUESTIONS_PER_STEP}

${questionCount === MAX_QUESTIONS_PER_STEP ? `
IMPORTANT: This is the final question. After the user responds, you MUST synthesize capability mappings in JSON format.

After receiving the user's final answer, respond with ONLY this JSON structure (no other text):
{
  "capabilities": [
    {
      "apqc_code": "string",
      "name": "string",
      "domain": "string",
      "currentMaturity": 1-5,
      "targetMaturity": 1-5,
      "gap": "string",
      "strategicImportance": "critical|high|medium|low",
      "linkedObjectives": ["obj-id"]
    }
  ],
  "gapAnalysis": {
    "summary": "string",
    "criticalGaps": ["string"],
    "recommendations": ["string"]
  }
}
` : 'Continue asking questions to map capabilities and assess maturity.'}`;
  }

  /**
   * Start Step 2: Capability Mapping
   */
  async function startStep2(step1Output) {
    console.log('🚀 Starting Step 2: Capability Mapping');

    // Check Step 1 completed
    if (!currentState.workflowComplete.step1) {
      throw new Error('Step 1 must be completed before starting Step 2');
    }

    // Store Step 1 data
    currentState.step1Data = step1Output;

    // Reset Step 2 state
    currentState.currentStep = 2;
    currentState.questionCounts.step2 = 0;
    currentState.conversationHistory.step2 = [];
    currentState.workflowComplete.step2 = false;

    // Load APQC capabilities
    let apqcCapabilities = [];
    try {
      const apqcData = await EA_DataManager.loadAPQCFramework();
      apqcCapabilities = apqcData || [];
    } catch (error) {
      console.warn('⚠️ Could not load APQC framework:', error);
    }

    // First question
    const industry = step1Output.strategicContext?.industry || 'your industry';
    const firstQuestion = `Based on your ${industry} objectives, which APQC capabilities are most critical for achieving your digital transformation goals?`;
    
    currentState.questionCounts.step2 = 1;
    currentState.conversationHistory.step2.push({
      role: 'assistant',
      content: firstQuestion,
      timestamp: Date.now()
    });

    return {
      question: firstQuestion,
      questionCount: 1,
      step: 2,
      context: step1Output,
      apqcCapabilities: apqcCapabilities
    };
  }

  /**
   * Handle Step 2 user response
   */
  async function handleStep2UserResponse(userMessage) {
    console.log(`📝 Step 2: Processing user response (Q${currentState.questionCounts.step2})`);

    // Record user response
    currentState.conversationHistory.step2.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });

    // Check if we've reached max questions
    if (currentState.questionCounts.step2 >= MAX_QUESTIONS_PER_STEP) {
      // Synthesize capability mapping
      return await synthesizeCapabilityMapping();
    }

    // Generate next question using AI
    try {
      const systemPrompt = buildStep2SystemPrompt(
        currentState.questionCounts.step2,
        currentState.step1Data,
        []
      );

      const response = await AzureOpenAIProxy.create(
        userMessage,
        {
          instructions: systemPrompt,
          model: 'gpt-5'
        }
      );

      const nextQuestion = response.output_text;

      // Increment question count
      currentState.questionCounts.step2++;

      // Record AI question
      currentState.conversationHistory.step2.push({
        role: 'assistant',
        content: nextQuestion,
        timestamp: Date.now()
      });

      return {
        question: nextQuestion,
        questionCount: currentState.questionCounts.step2,
        step: 2
      };

    } catch (error) {
      console.error('❌ Error generating next question:', error);
      throw error;
    }
  }

  /**
   * Synthesize capability mapping from conversation
   */
  async function synthesizeCapabilityMapping() {
    console.log('🔨 Synthesizing capability mapping from conversation...');

    try {
      const conversationSummary = currentState.conversationHistory.step2
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n');

      const synthesisPrompt = `Based on the conversation and Step 1 objectives, map capabilities to APQC framework.

Step 1 Context:
${JSON.stringify(currentState.step1Data, null, 2)}

Conversation:
${conversationSummary}

Respond with ONLY this JSON structure (no other text):
{
  "capabilities": [
    {
      "apqc_code": "string",
      "name": "string",
      "domain": "string",
      "currentMaturity": 1-5,
      "targetMaturity": 1-5,
      "gap": "string",
      "strategicImportance": "critical|high|medium|low",
      "linkedObjectives": ["obj-id"]
    }
  ],
  "gapAnalysis": {
    "summary": "string",
    "criticalGaps": ["string"],
    "recommendations": ["string"]
  }
}`;

      const response = await AzureOpenAIProxy.create(
        "Please synthesize the capability mapping now.",
        {
          instructions: synthesisPrompt,
          model: 'gpt-5'
        }
      );

      // Parse JSON response
      let synthesis;
      try {
        synthesis = JSON.parse(response.output_text);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', response.output_text);
        throw new Error('AI response was not valid JSON');
      }

      // Store synthesis
      currentState.step2Data = synthesis;

      return {
        synthesis: synthesis,
        questionCount: currentState.questionCounts.step2,
        step: 2,
        complete: true
      };

    } catch (error) {
      console.error('❌ Error synthesizing capability mapping:', error);
      throw error;
    }
  }

  /**
   * Complete Step 2 and link capabilities
   */
  async function completeStep2(capabilities) {
    console.log('✅ Completing Step 2: Linking capabilities...');

    try {
      // Get all objectives from Step 1
      const allObjectives = await EA_ObjectivesManager.listObjectives();
      const step1Objectives = allObjectives.filter(obj => obj.workflowState.step1Complete);

      // Link capabilities to objectives
      const linkedCapabilities = [];

      for (const capability of capabilities) {
        // Find matching objectives based on linkedObjectives array
        const matchingObjectives = step1Objectives.filter(obj => 
          capability.linkedObjectives && capability.linkedObjectives.some(linkedId => 
            linkedId.includes(obj.name.toLowerCase().replace(/\s+/g, '-')) ||
            obj.id === linkedId
          )
        );

        if (matchingObjectives.length > 0) {
          for (const objective of matchingObjectives) {
            // Add capability ID to objective's linkedCapabilities
            const capabilityId = `cap-${capability.apqc_code}`;
            const existingCaps = objective.linkedCapabilities || [];
            
            if (!existingCaps.includes(capabilityId)) {
              await EA_ObjectivesManager.linkCapabilities(
                objective.id,
                [...existingCaps, capabilityId]
              );
            }

            linkedCapabilities.push({
              objectiveId: objective.id,
              capabilityId: capabilityId,
              capability: capability
            });
          }
        }
      }

      // Update workflow state for all objectives
      for (const objective of step1Objectives) {
        const updated = await EA_ObjectivesManager.getObjective(objective.id);
        if (updated) {
          const newWorkflowState = {
            ...updated.workflowState,
            step2Complete: true,
            aiSessionHistory: [
              ...updated.workflowState.aiSessionHistory,
              {
                step: 2,
                timestamp: Date.now(),
                questionCount: currentState.questionCounts.step2,
                userInputs: currentState.conversationHistory.step2
                  .filter(msg => msg.role === 'user')
                  .map(msg => msg.content)
              }
            ]
          };

          await EA_ObjectivesManager.updateObjective(objective.id, {
            ...updated,
            workflowState: newWorkflowState,
            updatedAt: Date.now()
          });
        }
      }

      // Mark Step 2 as complete
      currentState.workflowComplete.step2 = true;

      console.log(`✅ Step 2 complete: Linked ${linkedCapabilities.length} capability-objective relationships`);

      return {
        step2Complete: true,
        linkedCapabilities: linkedCapabilities,
        nextStep: 3
      };

    } catch (error) {
      console.error('❌ Error completing Step 2:', error);
      throw error;
    }
  }

  // ==================== STEP 3: EA INSIGHTS INTEGRATION ====================

  /**
   * Build Step 3 system prompt (EA integration)
   */
  function buildStep3SystemPrompt(questionCount, previousContext) {
    const contextSummary = `
Strategic Context:
${JSON.stringify(previousContext.step1?.strategicContext || {}, null, 2)}

Business Objectives:
${(previousContext.step1?.objectives || []).map(obj => `- ${obj.name}`).join('\n')}

Capability Gaps:
${(previousContext.step2?.gapAnalysis?.criticalGaps || []).map(gap => `- ${gap}`).join('\n')}
`;

    return `You are an expert Enterprise Architect linking strategy to execution using EA tools.

${contextSummary}

Your task: Connect objectives and capabilities to EA execution tools.

Available EA Tools:
- Growth Dashboard: Account management, opportunity tracking
- WhiteSpot Heatmap: Service coverage assessment, gap visualization
- Engagement Playbook: Project execution, stakeholder management

Rules:
1. Ask ONE question at a time
2. Maximum 5 questions total
3. Identify which tools provide most value
4. Create phased execution roadmap

Current question count: ${questionCount}/${MAX_QUESTIONS_PER_STEP}

${questionCount === MAX_QUESTIONS_PER_STEP ? `
IMPORTANT: This is the final question. After the user responds, you MUST synthesize the integration plan in JSON format.

After receiving the user's final answer, respond with ONLY this JSON structure (no other text):
{
  "integrations": [
    {
      "tool": "GrowthDashboard|WhiteSpot|Engagement",
      "linkedEntities": ["entity-id"],
      "purpose": "string",
      "priority": "high|medium|low"
    }
  ],
  "executionRoadmap": {
    "phases": [
      {
        "name": "string",
        "objectives": ["obj-id"],
        "capabilities": ["cap-id"],
        "duration": "string",
        "description": "string"
      }
    ]
  }
}
` : 'Continue asking questions to determine integration priorities.'}`;
  }

  /**
   * Start Step 3: EA Insights Integration (Optional)
   */
  async function startStep3(previousStepsOutput) {
    console.log('🚀 Starting Step 3: EA Insights Integration');

    // Check Steps 1-2 completed
    if (!currentState.workflowComplete.step1 || !currentState.workflowComplete.step2) {
      throw new Error('Steps 1 and 2 must be completed before starting Step 3');
    }

    // Store previous context
    currentState.step1Data = previousStepsOutput.step1;
    currentState.step2Data = previousStepsOutput.step2;

    // Reset Step 3 state
    currentState.currentStep = 3;
    currentState.questionCounts.step3 = 0;
    currentState.conversationHistory.step3 = [];
    currentState.workflowComplete.step3 = false;

    // First question
    const firstQuestion = "Which EA tools would provide the most value for tracking your transformation: Growth Dashboard for account management, WhiteSpot for service coverage, or Engagement Playbook for project execution?";
    
    currentState.questionCounts.step3 = 1;
    currentState.conversationHistory.step3.push({
      role: 'assistant',
      content: firstQuestion,
      timestamp: Date.now()
    });

    return {
      question: firstQuestion,
      questionCount: 1,
      step: 3,
      context: {
        objectives: previousStepsOutput.step1?.objectives,
        capabilities: previousStepsOutput.step2?.capabilities
      }
    };
  }

  /**
   * Handle Step 3 user response
   */
  async function handleStep3UserResponse(userMessage) {
    console.log(`📝 Step 3: Processing user response (Q${currentState.questionCounts.step3})`);

    // Record user response
    currentState.conversationHistory.step3.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });

    // Check if we've reached max questions
    if (currentState.questionCounts.step3 >= MAX_QUESTIONS_PER_STEP) {
      // Synthesize integration plan
      return await synthesizeIntegrationPlan();
    }

    // Generate next question using AI
    try {
      const systemPrompt = buildStep3SystemPrompt(
        currentState.questionCounts.step3,
        {
          step1: currentState.step1Data,
          step2: currentState.step2Data
        }
      );

      const response = await AzureOpenAIProxy.create(
        userMessage,
        {
          instructions: systemPrompt,
          model: 'gpt-5'
        }
      );

      const nextQuestion = response.output_text;

      // Increment question count
      currentState.questionCounts.step3++;

      // Record AI question
      currentState.conversationHistory.step3.push({
        role: 'assistant',
        content: nextQuestion,
        timestamp: Date.now()
      });

      return {
        question: nextQuestion,
        questionCount: currentState.questionCounts.step3,
        step: 3
      };

    } catch (error) {
      console.error('❌ Error generating next question:', error);
      throw error;
    }
  }

  /**
   * Synthesize integration plan from conversation
   */
  async function synthesizeIntegrationPlan() {
    console.log('🔨 Synthesizing EA integration plan from conversation...');

    try {
      const conversationSummary = currentState.conversationHistory.step3
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n');

      const synthesisPrompt = `Based on the conversation and previous steps, create an integration plan.

Previous Context:
Step 1: ${JSON.stringify(currentState.step1Data, null, 2)}
Step 2: ${JSON.stringify(currentState.step2Data, null, 2)}

Conversation:
${conversationSummary}

Respond with ONLY this JSON structure (no other text):
{
  "integrations": [
    {
      "tool": "GrowthDashboard|WhiteSpot|Engagement",
      "linkedEntities": ["entity-id"],
      "purpose": "string",
      "priority": "high|medium|low"
    }
  ],
  "executionRoadmap": {
    "phases": [
      {
        "name": "string",
        "objectives": ["obj-id"],
        "capabilities": ["cap-id"],
        "duration": "string",
        "description": "string"
      }
    ]
  }
}`;

      const response = await AzureOpenAIProxy.create(
        "Please synthesize the integration plan now.",
        {
          instructions: synthesisPrompt,
          model: 'gpt-5'
        }
      );

      // Parse JSON response
      let synthesis;
      try {
        synthesis = JSON.parse(response.output_text);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', response.output_text);
        throw new Error('AI response was not valid JSON');
      }

      // Store synthesis
      currentState.step3Data = synthesis;

      return {
        synthesis: synthesis,
        questionCount: currentState.questionCounts.step3,
        step: 3,
        complete: true
      };

    } catch (error) {
      console.error('❌ Error synthesizing integration plan:', error);
      throw error;
    }
  }

  /**
   * Complete Step 3 and finalize workflow
   */
  async function completeStep3(integrationPlan) {
    console.log('✅ Completing Step 3: Finalizing workflow...');

    try {
      // Get all objectives from previous steps
      const allObjectives = await EA_ObjectivesManager.listObjectives();
      const workflowObjectives = allObjectives.filter(obj => 
        obj.workflowState.step1Complete && obj.workflowState.step2Complete
      );

      // Update workflow state for all objectives
      for (const objective of workflowObjectives) {
        const newWorkflowState = {
          ...objective.workflowState,
          step3Complete: true,
          aiSessionHistory: [
            ...objective.workflowState.aiSessionHistory,
            {
              step: 3,
              timestamp: Date.now(),
              questionCount: currentState.questionCounts.step3,
              userInputs: currentState.conversationHistory.step3
                .filter(msg => msg.role === 'user')
                .map(msg => msg.content)
            }
          ]
        };

        await EA_ObjectivesManager.updateObjective(objective.id, {
          ...objective,
          workflowState: newWorkflowState,
          updatedAt: Date.now()
        });
      }

      // Mark Step 3 as complete
      currentState.workflowComplete.step3 = true;

      console.log('✅ Step 3 complete: Workflow finalized');
      console.log('🎉 All workflow steps complete!');

      return {
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        integrationPlan: integrationPlan,
        workflowComplete: true
      };

    } catch (error) {
      console.error('❌ Error completing Step 3:', error);
      throw error;
    }
  }

  // ==================== WORKFLOW STATE MANAGEMENT ====================

  /**
   * Get current workflow step
   */
  function getCurrentStep() {
    return currentState.currentStep;
  }

  /**
   * Get workflow state
   */
  function getWorkflowState() {
    return {
      currentStep: currentState.currentStep,
      step1Complete: currentState.workflowComplete.step1,
      step2Complete: currentState.workflowComplete.step2,
      step3Complete: currentState.workflowComplete.step3,
      questionCounts: currentState.questionCounts,
      step1Data: currentState.step1Data,
      step2Data: currentState.step2Data,
      step3Data: currentState.step3Data
    };
  }

  /**
   * Reset workflow (for testing or restart)
   */
  function resetWorkflow() {
    currentState = {
      currentStep: 0,
      step1Data: null,
      step2Data: null,
      step3Data: null,
      questionCounts: {
        step1: 0,
        step2: 0,
        step3: 0
      },
      conversationHistory: {
        step1: [],
        step2: [],
        step3: []
      },
      workflowComplete: {
        step1: false,
        step2: false,
        step3: false
      }
    };

    console.log('🔄 Workflow reset');
  }

  // Public API
  return {
    // Step 1: Understand Goals
    startStep1,
    handleStep1UserResponse,
    synthesizeObjectives,
    completeStep1,

    // Step 2: Capability Mapping
    startStep2,
    handleStep2UserResponse,
    synthesizeCapabilityMapping,
    completeStep2,

    // Step 3: EA Insights Integration
    startStep3,
    handleStep3UserResponse,
    synthesizeIntegrationPlan,
    completeStep3,

    // Workflow Management
    getCurrentStep,
    getWorkflowState,
    resetWorkflow
  };
})();

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_BusinessObjectivesWorkflow;
}
