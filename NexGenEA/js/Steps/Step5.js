/**
 * Step5.js — Data Collection & Survey
 *
 * V10 REDESIGN: Generate targeted surveys based on benchmark gaps,
 * process responses, and update capability maturity with validated data.
 *
 * Tasks:
 *   5.1 survey_generation     — Generate targeted survey questions
 *   5.2 survey_processing     — Process survey responses (when available)
 *   5.3 maturity_update       — Update capability maturity with survey insights
 *
 * Outputs:
 *   model.surveys[]          — generated survey instruments
 *   model.surveyResults      — processed survey data
 *   model.capabilities[]     — updated with validated maturity ratings
 */

const Step5 = {

  id: 'step5',
  name: 'Data Collection & Survey',
  dependsOn: ['step3', 'step4'],

  tasks: [

    // ── Task 5.1: Survey Generation ───────────────────────────────────────
    {
      taskId: 'step5_survey_generation',
      title: 'Generating targeted capability surveys',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '5_1_survey_generation.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Survey Design Specialist for Enterprise Architecture assessments.

Generate targeted survey questions to validate capability maturity ratings and gather gap insights.

Return ONLY valid JSON:
{
  "surveys": [
    {
      "survey_id": "",
      "capability_id": "",
      "capability_name": "",
      "focus_area": "MATURITY|PROCESS|TECHNOLOGY|SKILLS|DATA",
      "questions": [
        {
          "question_id": "",
          "question_text": "",
          "question_type": "LIKERT_5|MULTIPLE_CHOICE|FREE_TEXT",
          "options": [],
          "rationale": ""
        }
      ],
      "target_respondents": "",
      "estimated_time": ""
    }
  ],
  "survey_strategy": {
    "total_surveys": 0,
    "priority_areas": [],
    "rollout_sequence": []
  }
}`,

      userPrompt: (ctx) => {
        const benchmarkGaps = ctx.benchmarkGaps || [];
        const quickWins = ctx.benchmarkQuickWins || [];
        const capabilities = ctx.capabilities || [];
        
        const priorityList = benchmarkGaps
          .slice(0, 8)
          .map(g => `${g.capability_name}: ${g.gap_type} gap, severity=${g.severity}`)
          .join('\n');
        
        return `Strategic context: ${ctx.strategicIntent?.strategic_intent || ''}
Industry: ${ctx.industry || 'generic'}

Priority capability gaps to investigate:
${priorityList}

Quick win opportunities:
${quickWins.slice(0, 5).map(qw => qw.capability_name).join(', ')}

Design 5-8 focused surveys to:
1. Validate current maturity assumptions for high-gap capabilities
2. Understand root causes (process, tech, skills, data issues)
3. Identify quick-win opportunities
4. Gather stakeholder perspectives on improvement priorities

Target respondents: capability owners, process leads, end users.
Keep surveys concise (5-10 questions each, <10 min completion time).`;
      },

      outputSchema: {
        surveys: ['object'],
        survey_strategy: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step5_survey_generation')
    },

    // ── Task 5.2: Survey Processing ───────────────────────────────────────
    {
      taskId: 'step5_survey_processing',
      title: 'Processing survey responses',
      type: 'internal',
      taskType: 'analysis',
      instructionFile: '5_2_survey_processing.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Survey Data Analyst for Enterprise Architecture.

Process survey responses and extract insights about capability maturity.

Return ONLY valid JSON:
{
  "response_summary": {
    "total_surveys": 0,
    "total_responses": 0,
    "response_rate": 0,
    "key_insights": []
  },
  "capability_insights": [
    {
      "capability_id": "",
      "capability_name": "",
      "survey_maturity": 0,
      "confidence_level": "HIGH|MEDIUM|LOW",
      "key_findings": [],
      "stakeholder_sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
      "improvement_opportunities": []
    }
  ],
  "cross_cutting_themes": []
}`,

      userPrompt: (ctx) => {
        const surveys = ctx.answers?.step5_survey_generation?.surveys || [];
        const existingMaturity = ctx.capabilities || [];
        
        // NOTE: In real implementation, this would receive actual survey responses
        // For now, simulate based on benchmark data
        const surveyList = surveys.map(s => 
          `${s.capability_name}: ${s.questions?.length || 0} questions, focus=${s.focus_area}`
        ).join('\n');
        
        return `Surveys generated:
${surveyList}

SIMULATION MODE: Since no actual survey responses are available yet, synthesize realistic insights based on:
1. Benchmark gaps identified in Step 4
2. Existing capability maturity ratings
3. Strategic intent and constraints

Assume moderate response rate (60-70%) and mixed feedback highlighting both strengths and improvement areas.`;
      },

      outputSchema: {
        response_summary: 'object',
        capability_insights: ['object'],
        cross_cutting_themes: ['string']
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step5_survey_processing')
    },

    // ── Task 5.3: Maturity Update ─────────────────────────────────────────
    {
      taskId: 'step5_maturity_update',
      title: 'Updating capability maturity with survey insights',
      type: 'internal',
      taskType: 'synthesis',
      instructionFile: '5_3_maturity_update.instruction.md',
      expectsJson: true,

      systemPromptFallback: `You are a Capability Maturity Analyst.

Update capability maturity ratings based on survey insights and benchmark data.

Return ONLY valid JSON:
{
  "maturity_updates": [
    {
      "capability_id": "",
      "capability_name": "",
      "original_maturity": 0,
      "survey_maturity": 0,
      "adjusted_maturity": 0,
      "confidence": "HIGH|MEDIUM|LOW",
      "rationale": "",
      "validation_status": "CONFIRMED|ADJUSTED_UP|ADJUSTED_DOWN"
    }
  ],
  "validation_summary": {
    "confirmed_count": 0,
    "adjusted_up_count": 0,
    "adjusted_down_count": 0,
    "avg_confidence": ""
  }
}`,

      userPrompt: (ctx) => {
        const insights = ctx.answers?.step5_survey_processing?.capability_insights || [];
        const capabilities = ctx.capabilities || [];
        
        const insightList = insights.map(ins => 
          `${ins.capability_name}: Survey maturity=${ins.survey_maturity}, Confidence=${ins.confidence_level}`
        ).join('\n');
        
        return `Original capability maturity ratings (from Step 3):
${capabilities.slice(0, 15).map(c => `${c.name}: Current=${c.current_maturity || 'null'}, Target=${c.target_maturity || 'null'}`).join('\n')}

Survey insights:
${insightList}

For each capability with survey data:
1. Compare original maturity vs survey-validated maturity
2. Adjust rating if survey provides higher-confidence data
3. Maintain rating if survey confirms original assessment
4. Flag low-confidence ratings for further investigation

Use weighted average if multiple data sources: 40% original estimate + 60% survey data.`;
      },

      outputSchema: {
        maturity_updates: ['object'],
        validation_summary: 'object'
      },

      parseOutput: (raw) => OutputValidator.parseJSON(raw, 'step5_maturity_update')
    }

  ],

  synthesize: (ctx) => {
    const surveyGen = ctx.answers?.step5_survey_generation || {};
    const surveyProc = ctx.answers?.step5_survey_processing || {};
    const maturityUpd = ctx.answers?.step5_maturity_update || {};
    
    return {
      surveys: surveyGen.surveys || [],
      surveyStrategy: surveyGen.survey_strategy || {},
      surveyResults: {
        response_summary: surveyProc.response_summary || {},
        capability_insights: surveyProc.capability_insights || [],
        cross_cutting_themes: surveyProc.cross_cutting_themes || [],
        timestamp: new Date().toISOString()
      },
      maturityUpdates: maturityUpd.maturity_updates || [],
      maturityValidation: {
        validation_summary: maturityUpd.validation_summary || {},
        last_updated: new Date().toISOString()
      }
    };
  },

  applyOutput: (output, model) => {
    // Update capability maturity ratings with validated data
    let updatedCapabilities = model.capabilities || [];
    const updates = output.maturityUpdates || [];
    
    if (updates.length > 0) {
      updates.forEach(upd => {
        const cap = updatedCapabilities.find(c => 
          c.id === upd.capability_id || c.name === upd.capability_name
        );
        if (cap && upd.adjusted_maturity !== undefined) {
          cap.current_maturity = upd.adjusted_maturity;
          cap.maturity_confidence = upd.confidence;
          cap.maturity_source = 'SURVEY_VALIDATED';
          cap.validation_status = upd.validation_status;
        }
      });
    }
    
    return {
      ...model,
      surveys: output.surveys,
      surveyStrategy: output.surveyStrategy,
      surveyResults: output.surveyResults,
      capabilities: updatedCapabilities,
      maturityValidation: output.maturityValidation,
      surveyDone: true
    };
  },

  onComplete: (model) => {
    if (typeof updateWorkflowStepStates === 'function') updateWorkflowStepStates();
    if (typeof updateWorkflowProgress === 'function') updateWorkflowProgress([1, 2, 3, 4, 5]);
    if (typeof toast === 'function') toast('Data Collection complete ✓');
    if (typeof addAssistantMessage === 'function') {
      const surveyCount = model.surveys?.length || 0;
      const updateCount = model.maturityValidation?.validation_summary?.updated_count || 0;
      addAssistantMessage(
        `**Step 5 — Data Collection & Survey complete**\n\n` +
        `Generated ${surveyCount} surveys and validated ${updateCount} capability ratings.\n\n` +
        `**Click on Step 6: Layers & Gap in the left sidebar to continue.**`
      );
    }
  }

};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Step5;
}
