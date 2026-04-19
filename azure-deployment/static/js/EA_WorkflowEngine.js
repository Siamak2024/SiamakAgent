/**
 * EA_WorkflowEngine - Step-by-step guided workflow for EA engagements (E0-E5)
 * Location: js/EA_WorkflowEngine.js
 * 
 * Responsibilities:
 * - Define workflow steps for each phase (E0 Initiation, E1 Analysis, E2 Design, etc.)
 * - Track progress and completion status
 * - Provide step-specific guidance and checklists
 * - Validate prerequisites and gate progression
 * - Integration points for AI assistance
 */

class EA_WorkflowEngine {
  constructor(engagementManager) {
    this.engagementManager = engagementManager;
    this.workflowDefinition = this.defineWorkflow();
    this.currentEngagement = null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // WORKFLOW DEFINITION (E0-E5 Steps)
  // ═══════════════════════════════════════════════════════════════════

  defineWorkflow() {
    return {
      E0: {
        id: 'E0',
        name: 'Initiation',
        description: 'Define engagement scope, identify stakeholders, establish governance',
        steps: [
          {
            id: 'E0.1',
            name: 'Define Engagement Scope',
            description: 'Clarify business drivers, objectives, timeline, and resource allocation',
            checklistTemplate: [
              'Business drivers documented',
              'Strategic objectives defined',
              'Timeline estimate created',
              'Resource allocation planned',
              'Success criteria established',
              'Budget range identified',
              'Constraints documented',
              'Scope boundaries defined'
            ],
            aiPrompt: 'Help me define engagement scope. Ask max 5 questions about: business drivers, timeline, resources, constraints.',
            suggestedPrompts: [
              { text: 'Help me define engagement scope', icon: '📋', command: 'scope' },
              { text: 'Generate timeline estimate', icon: '📅', command: 'timeline' },
              { text: 'Suggest resource allocation', icon: '👥', command: 'resources' }
            ],
            requiredFields: ['engagement.name', 'engagement.theme', 'engagement.segment'],
            completionCriteria: {
              minimumChecklist: 5,
              requiredFields: true
            }
          },
          {
            id: 'E0.2',
            name: 'Identify Stakeholders',
            description: 'Map key stakeholders, assess influence, plan engagement strategy',
            checklistTemplate: [
              'Executive sponsor identified',
              'Key decision-makers mapped',
              'Stakeholder influence assessed (power/interest)',
              'Communication plan drafted',
              'RACI matrix created',
              'Engagement strategy defined'
            ],
            aiPrompt: 'Help me identify and map stakeholders. Ask about: key roles, decision authority, influence levels.',
            suggestedPrompts: [
              { text: 'Identify key stakeholders', icon: '👥', command: 'stakeholders' },
              { text: 'Map influence and power', icon: '🎯', command: 'influence' },
              { text: 'Import from BMC Toolkit', icon: '📥', command: 'import_bmc' }
            ],
            requiredFields: [],
            integrationHooks: {
              bmc: { action: 'importStakeholders', label: 'Import from BMC Toolkit' }
            },
            completionCriteria: {
              minimumEntities: { type: 'stakeholders', count: 3 },
              minimumChecklist: 4
            }
          },
          {
            id: 'E0.3',
            name: 'Set Success Criteria',
            description: 'Define measurable outcomes and KPIs for the engagement',
            checklistTemplate: [
              'Business outcomes defined',
              'Technical outcomes defined',
              'KPIs established',
              'Baseline metrics captured',
              'Target metrics defined',
              'Success thresholds agreed'
            ],
            aiPrompt: 'Help me define success criteria based on industry benchmarks and APQC standards.',
            suggestedPrompts: [
              { text: 'Define success criteria', icon: '🎯', command: 'success' },
              { text: 'Load APQC benchmarks', icon: '📚', command: 'apqc' }
            ],
            integrationHooks: {
              apqc: { action: 'loadBenchmarks', label: 'Load Industry Benchmarks' }
            },
            completionCriteria: {
              minimumChecklist: 4
            }
          },
          {
            id: 'E0.4',
            name: 'Establish Governance',
            description: 'Define decision-making processes, roles, and cadence',
            checklistTemplate: [
              'Governance model defined',
              'Decision authority established',
              'Meeting cadence agreed',
              'Escalation paths defined',
              'Status reporting format agreed',
              'Change management process defined'
            ],
            aiPrompt: 'Help me establish governance structure. Generate RACI template from stakeholders.',
            suggestedPrompts: [
              { text: 'Generate RACI template', icon: '📊', command: 'raci' },
              { text: 'Define decision process', icon: '⚖️', command: 'decisions' }
            ],
            completionCriteria: {
              minimumChecklist: 4
            }
          },
          {
            id: 'E0.5',
            name: 'Create Phase Plan',
            description: 'Plan detailed timeline and resource allocation for next phases',
            checklistTemplate: [
              'Phase timeline created',
              'Resource allocation finalized',
              'Dependencies identified',
              'Risk mitigation plan drafted',
              'Communication plan finalized',
              'Kickoff meeting scheduled'
            ],
            aiPrompt: 'Help me create a phase plan based on scope and resources.',
            suggestedPrompts: [
              { text: 'Generate phase timeline', icon: '📅', command: 'timeline' },
              { text: 'Identify dependencies', icon: '🔗', command: 'dependencies' }
            ],
            completionCriteria: {
              minimumChecklist: 5,
              previousStepsComplete: ['E0.1', 'E0.2', 'E0.3', 'E0.4']
            }
          }
        ]
      },
      E1: {
        id: 'E1',
        name: 'Current State Analysis',
        description: 'Assess current architecture, identify gaps, prioritize opportunities',
        steps: [
          {
            id: 'E1.1',
            name: 'Document Current Architecture',
            description: 'Map existing applications, capabilities, and technology landscape',
            checklistTemplate: [
              'Application inventory completed',
              'Integration map created',
              'Technology stack documented',
              'Capability map created',
              'Technical debt assessed',
              'Architecture diagrams captured'
            ],
            aiPrompt: 'Help me document current architecture.',
            suggestedPrompts: [
              { text: 'Import from APM Toolkit', icon: '📥', command: 'import_apm' },
              { text: 'Analyze portfolio', icon: '🔍', command: 'analyze' }
            ],
            integrationHooks: {
              apm: { action: 'importApplications', label: 'Import from APM Toolkit' },
              capability: { action: 'syncCapabilities', label: 'Sync with Capability Map' }
            },
            completionCriteria: {
              minimumEntities: { type: 'applications', count: 5 }
            }
          },
          {
            id: 'E1.2',
            name: 'Identify Capability Gaps',
            description: 'Analyze white-spots and capability maturity',
            checklistTemplate: [
              'Capability gaps identified',
              'Maturity assessment completed',
              'White-spots documented',
              'Strategic impact assessed',
              'Gaps prioritized',
              'Industry benchmarks compared'
            ],
            aiPrompt: 'Help me identify capability gaps. Ask max 5 questions about: strategic priorities, friction points, manual processes.',
            suggestedPrompts: [
              { text: 'Identify capability gaps', icon: '🔍', command: 'gaps' },
              { text: 'Load APQC benchmarks', icon: '📚', command: 'apqc' },
              { text: 'Prioritize white-spots', icon: '⭐', command: 'prioritize' }
            ],
            integrationHooks: {
              apqc: { action: 'loadCapabilities', label: 'Load APQC Framework' }
            },
            completionCriteria: {
              minimumEntities: { type: 'capabilities', count: 3 }
            }
          },
          {
            id: 'E1.3',
            name: 'Assess Portfolio Health',
            description: 'Evaluate application fitness, identify rationalization opportunities',
            checklistTemplate: [
              'Application scoring completed (business value × technical fit)',
              'Sunset candidates identified',
              'Modernization priorities defined',
              'Cost reduction opportunities quantified',
              'Rationalization plan drafted',
              'Quick wins identified'
            ],
            aiPrompt: 'Help me assess portfolio health and identify optimization opportunities.',
            suggestedPrompts: [
              { text: 'Identify sunset candidates', icon: '🌅', command: 'sunset' },
              { text: 'Find modernization priorities', icon: '🚀', command: 'modernize' }
            ],
            completionCriteria: {
              minimumEntities: { type: 'applications', count: 5 }
            }
          },
          {
            id: 'E1.4',
            name: 'Analyze Risks',
            description: 'Identify technical, business, and organizational risks',
            checklistTemplate: [
              'Risk register created',
              'Risk probability assessed',
              'Risk impact assessed',
              'Risk mitigation strategies defined',
              'Risk owners assigned',
              'Contingency plans drafted'
            ],
            aiPrompt: 'Help me identify and assess risks based on architecture constraints.',
            suggestedPrompts: [
              { text: 'Identify risks', icon: '⚠️', command: 'risks' },
              { text: 'Prioritize by impact', icon: '📊', command: 'prioritize_risks' }
            ],
            completionCriteria: {
              minimumEntities: { type: 'risks', count: 3 }
            }
          },
          {
            id: 'E1.5',
            name: 'Document Constraints',
            description: 'Capture technical, organizational, and regulatory constraints',
            checklistTemplate: [
              'Technical constraints documented',
              'Budget constraints documented',
              'Timeline constraints documented',
              'Regulatory constraints documented',
              'Organizational constraints documented',
              'Constraint impact assessed'
            ],
            aiPrompt: 'Help me document constraints that may impact the engagement.',
            suggestedPrompts: [
              { text: 'Document constraints', icon: '🚧', command: 'constraints' }
            ],
            completionCriteria: {
              minimumEntities: { type: 'constraints', count: 2 }
            }
          }
        ]
      },
      E2: {
        id: 'E2',
        name: 'Solution Design',
        description: 'Design target architecture and transformation roadmap',
        steps: [
          {
            id: 'E2.1',
            name: 'Define Architecture Principles',
            description: 'Establish guiding principles for target architecture',
            checklistTemplate: [
              'Architecture principles defined',
              'Principles aligned with business strategy',
              'Principles prioritized',
              'Trade-offs documented',
              'Principles validated with stakeholders'
            ],
            aiPrompt: 'Help me define architecture principles based on industry best practices.',
            suggestedPrompts: [
              { text: 'Generate architecture principles', icon: '📐', command: 'principles' }
            ],
            completionCriteria: {
              minimumChecklist: 4
            }
          },
          {
            id: 'E2.2',
            name: 'Design Target Architecture',
            description: 'Create vision for future-state architecture',
            checklistTemplate: [
              'Target architecture diagram created',
              'Application map defined',
              'Integration patterns defined',
              'Technology stack selected',
              'Cloud strategy defined',
              'Data architecture defined'
            ],
            aiPrompt: 'Help me design target architecture. Ask max 5 questions about: architecture goals, constraints, principles.',
            suggestedPrompts: [
              { text: 'Design target architecture', icon: '🏗️', command: 'design' },
              { text: 'Suggest cloud patterns', icon: '☁️', command: 'cloud' }
            ],
            integrationHooks: {
              apqc: { action: 'loadPatterns', label: 'Load Architecture Patterns' }
            },
            completionCriteria: {
              minimumChecklist: 5
            }
          },
          {
            id: 'E2.3',
            name: 'Define Initiatives',
            description: 'Identify transformation initiatives to close gaps',
            checklistTemplate: [
              'Initiatives defined',
              'Initiative scope documented',
              'Business value estimated',
              'Effort estimated',
              'Dependencies mapped',
              'Themes assigned'
            ],
            aiPrompt: 'Help me define initiatives based on capability gaps and target architecture.',
            suggestedPrompts: [
              { text: 'Generate initiatives from gaps', icon: '💡', command: 'initiatives' }
            ],
            completionCriteria: {
              minimumEntities: { type: 'initiatives', count: 3 }
            }
          }
        ]
      },
      E3: {
        id: 'E3',
        name: 'Roadmap Planning',
        description: 'Sequence initiatives, plan implementation',
        steps: [
          {
            id: 'E3.1',
            name: 'Sequence Initiatives',
            description: 'Prioritize and sequence transformation initiatives',
            checklistTemplate: [
              'Initiatives prioritized',
              'Dependencies resolved',
              'Sequencing defined',
              'Quick wins identified',
              'Phases defined',
              'Timeline aligned'
            ],
            aiPrompt: 'Help me sequence initiatives. Ask about: dependencies, quick wins, resource constraints.',
            suggestedPrompts: [
              { text: 'Sequence initiatives', icon: '🔢', command: 'sequence' },
              { text: 'Find quick wins', icon: '🏆', command: 'quickwins' },
              { text: 'Identify dependencies', icon: '🔗', command: 'dependencies' }
            ],
            completionCriteria: {
              minimumEntities: { type: 'initiatives', count: 3 }
            }
          },
          {
            id: 'E3.2',
            name: 'Create Roadmap',
            description: 'Build visual timeline with waves and milestones',
            checklistTemplate: [
              'Roadmap timeline created',
              'Waves defined (short/mid/long)',
              'Milestones identified',
              'Resource allocation planned',
              'Budget phasing planned',
              'Governance checkpoints defined'
            ],
            aiPrompt: 'Help me create transformation roadmap.',
            suggestedPrompts: [
              { text: 'Generate roadmap', icon: '🗺️', command: 'roadmap' }
            ],
            completionCriteria: {
              minimumEntities: { type: 'roadmapItems', count: 3 }
            }
          }
        ]
      },
      E4: {
        id: 'E4',
        name: 'Business Case',
        description: 'Build investment case and value justification',
        steps: [
          {
            id: 'E4.1',
            name: 'Quantify Value',
            description: 'Calculate ROI, payback, and business value',
            checklistTemplate: [
              'Cost baseline established',
              'Benefits quantified',
              'ROI calculated',
              'Payback period calculated',
              'NPV calculated',
              'Value drivers documented'
            ],
            aiPrompt: 'Help me quantify business value and calculate ROI.',
            suggestedPrompts: [
              { text: 'Calculate ROI', icon: '💰', command: 'roi' }
            ],
            completionCriteria: {
              minimumChecklist: 5
            }
          },
          {
            id: 'E4.2',
            name: 'Generate Executive Summary',
            description: 'Create leadership-ready business case',
            checklistTemplate: [
              'Executive summary written',
              'Financial case documented',
              'Technical justification documented',
              'Risk mitigation approach documented',
              'Stakeholder impacts documented',
              'Recommendation finalized'
            ],
            aiPrompt: 'Help me generate executive business case.',
            suggestedPrompts: [
              { text: 'Generate business case', icon: '📄', command: 'businesscase' }
            ],
            completionCriteria: {
              minimumChecklist: 5
            }
          }
        ]
      },
      E5: {
        id: 'E5',
        name: 'Execution Planning',
        description: 'Prepare for implementation and handoff',
        steps: [
          {
            id: 'E5.1',
            name: 'Plan Implementation',
            description: 'Define execution approach and resource mobilization',
            checklistTemplate: [
              'Implementation approach defined',
              'Team structure defined',
              'Resource mobilization planned',
              'Vendor strategy defined',
              'Change management approach defined',
              'Training plan outlined'
            ],
            aiPrompt: 'Help me plan implementation and resource mobilization.',
            suggestedPrompts: [
              { text: 'Plan implementation', icon: '🎯', command: 'implementation' }
            ],
            completionCriteria: {
              minimumChecklist: 5
            }
          },
          {
            id: 'E5.2',
            name: 'Prepare Handoff',
            description: 'Package deliverables and transition to execution team',
            checklistTemplate: [
              'All documentation packaged',
              'Knowledge transfer completed',
              'Handoff meeting scheduled',
              'Ongoing support defined',
              'Success metrics defined',
              'Handoff complete'
            ],
            aiPrompt: 'Help me prepare engagement handoff.',
            suggestedPrompts: [
              { text: 'Generate handoff package', icon: '📦', command: 'handoff' }
            ],
            completionCriteria: {
              minimumChecklist: 5,
              previousStepsComplete: ['E5.1']
            }
          }
        ]
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // WORKFLOW STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Initialize workflow state for a new engagement
   */
  initializeWorkflowState(engagement) {
    if (!engagement.workflowState) {
      engagement.workflowState = {
        currentPhase: 'E0',
        currentStep: 'E0.1',
        completedSteps: [],
        phaseCompleteness: { E0: 0, E1: 0, E2: 0, E3: 0, E4: 0, E5: 0 },
        stepData: {}, // Store step-specific data (checklists, AI responses, etc.)
        aiConversations: [],
        integrations: {
          apqc: { status: 'not_connected', lastSync: null },
          apm: { status: 'not_connected', lastSync: null, projectId: null },
          bmc: { status: 'not_connected', lastSync: null },
          capability: { status: 'not_connected', lastSync: null, capMapId: null }
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
    return engagement;
  }

  /**
   * Get workflow state from engagement
   */
  getWorkflowState(engagement) {
    if (!engagement) {
      const current = this.engagementManager.getCurrentEngagement();
      engagement = current?.engagement || current;
    }
    return engagement?.workflowState || null;
  }

  /**
   * Update workflow state
   */
  updateWorkflowState(engagement, updates) {
    if (!engagement.workflowState) {
      this.initializeWorkflowState(engagement);
    }
    
    Object.assign(engagement.workflowState, updates);
    engagement.workflowState.lastUpdated = new Date().toISOString();
    
    // Save to storage
    this.engagementManager.saveEngagement(engagement.id, { engagement });
    
    return engagement.workflowState;
  }

  // ═══════════════════════════════════════════════════════════════════
  // NAVIGATION & PROGRESSION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get current phase
   */
  getCurrentPhase() {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    return state?.currentPhase || 'E0';
  }

  /**
   * Get current step
   */
  getCurrentStep() {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    return state?.currentStep || 'E0.1';
  }

  /**
   * Get step definition
   */
  getStepDefinition(stepId) {
    const [phaseId] = stepId.split('.');
    const phase = this.workflowDefinition[phaseId];
    if (!phase) return null;
    
    return phase.steps.find(s => s.id === stepId) || null;
  }

  /**
   * Get all steps for a phase
   */
  getPhaseSteps(phaseId) {
    return this.workflowDefinition[phaseId]?.steps || [];
  }

  /**
   * Get completed steps
   */
  getCompletedSteps() {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    return state?.completedSteps || [];
  }

  /**
   * Check if step is complete
   */
  isStepComplete(stepId) {
    const completedSteps = this.getCompletedSteps();
    return completedSteps.includes(stepId);
  }

  /**
   * Move to next step
   */
  moveToNextStep() {
    const currentStep = this.getCurrentStep();
    const [phaseId, stepNum] = currentStep.split('.');
    const phase = this.workflowDefinition[phaseId];
    
    if (!phase) return null;
    
    const currentStepIndex = parseInt(stepNum) - 1;
    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex < phase.steps.length) {
      // Next step in same phase
      const nextStep = phase.steps[nextStepIndex];
      this.navigateToStep(nextStep.id);
      return nextStep.id;
    } else {
      // Move to next phase
      const phases = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5'];
      const currentPhaseIndex = phases.indexOf(phaseId);
      
      if (currentPhaseIndex < phases.length - 1) {
        const nextPhaseId = phases[currentPhaseIndex + 1];
        const nextPhase = this.workflowDefinition[nextPhaseId];
        const nextStep = nextPhase.steps[0];
        this.navigateToStep(nextStep.id);
        return nextStep.id;
      }
    }
    
    return null; // No next step (engagement complete)
  }

  /**
   * Navigate to specific step
   */
  navigateToStep(stepId) {
    const [phaseId] = stepId.split('.');
    const engagement = this.engagementManager.getCurrentEngagement();
    
    if (!engagement) {
      console.error('No active engagement');
      return false;
    }
    
    const state = this.getWorkflowState(engagement.engagement || engagement);
    
    // Update state
    this.updateWorkflowState(engagement.engagement || engagement, {
      currentPhase: phaseId,
      currentStep: stepId
    });
    
    // Trigger UI update
    if (typeof window !== 'undefined' && window.updateAIContext) {
      window.updateAIContext();
    }
    
    return true;
  }

  /**
   * Mark step as complete
   */
  completeStep(stepId) {
    const engagement = this.engagementManager.getCurrentEngagement();
    if (!engagement) return false;
    
    const state = this.getWorkflowState(engagement.engagement || engagement);
    
    if (!state.completedSteps.includes(stepId)) {
      state.completedSteps.push(stepId);
      
      // Update phase completeness
      const [phaseId] = stepId.split('.');
      const phase = this.workflowDefinition[phaseId];
      const totalSteps = phase.steps.length;
      const completedInPhase = state.completedSteps.filter(s => s.startsWith(phaseId)).length;
      state.phaseCompleteness[phaseId] = Math.round((completedInPhase / totalSteps) * 100);
      
      this.updateWorkflowState(engagement.engagement || engagement, state);
    }
    
    return true;
  }

  /**
   * Validate step completion criteria
   */
  validateStepCompletion(stepId) {
    const step = this.getStepDefinition(stepId);
    if (!step) return { valid: false, errors: ['Step not found'] };
    
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    const errors = [];
    
    // Check completion criteria
    if (step.completionCriteria) {
      // Check minimum checklist items
      if (step.completionCriteria.minimumChecklist) {
        const stepData = state?.stepData?.[stepId];
        const completedChecklist = stepData?.checklist?.filter(c => c.completed).length || 0;
        if (completedChecklist < step.completionCriteria.minimumChecklist) {
          errors.push(`Complete at least ${step.completionCriteria.minimumChecklist} checklist items`);
        }
      }
      
      // Check minimum entities
      if (step.completionCriteria.minimumEntities) {
        const { type, count } = step.completionCriteria.minimumEntities;
        const entities = engagement?.[type] || [];
        if (entities.length < count) {
          errors.push(`Add at least ${count} ${type}`);
        }
      }
      
      // Check previous steps complete
      if (step.completionCriteria.previousStepsComplete) {
        const completedSteps = state?.completedSteps || [];
        const missing = step.completionCriteria.previousStepsComplete.filter(s => !completedSteps.includes(s));
        if (missing.length > 0) {
          errors.push(`Complete previous steps: ${missing.join(', ')}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // CHECKLIST MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Initialize checklist for a step
   */
  initializeChecklist(stepId) {
    const step = this.getStepDefinition(stepId);
    if (!step) return null;
    
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    
    if (!state.stepData) state.stepData = {};
    if (!state.stepData[stepId]) {
      state.stepData[stepId] = {
        checklist: step.checklistTemplate.map((item, index) => ({
          id: `${stepId}_${index}`,
          title: item,
          completed: false,
          aiGenerated: false
        })),
        notes: '',
        aiRecommendations: []
      };
      
      this.updateWorkflowState(engagement.engagement || engagement, state);
    }
    
    return state.stepData[stepId].checklist;
  }

  /**
   * Get checklist for a step
   */
  getChecklist(stepId) {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    return state?.stepData?.[stepId]?.checklist || this.initializeChecklist(stepId);
  }

  /**
   * Update checklist item
   */
  updateChecklistItem(stepId, itemId, updates) {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    
    if (!state.stepData?.[stepId]) {
      this.initializeChecklist(stepId);
    }
    
    const checklist = state.stepData[stepId].checklist;
    const item = checklist.find(c => c.id === itemId);
    
    if (item) {
      Object.assign(item, updates);
      this.updateWorkflowState(engagement.engagement || engagement, state);
    }
    
    return item;
  }

  // ═══════════════════════════════════════════════════════════════════
  // INTEGRATION STATUS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Update integration status
   */
  updateIntegrationStatus(integrationName, status) {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    
    if (!state.integrations) state.integrations = {};
    
    state.integrations[integrationName] = {
      ...state.integrations[integrationName],
      ...status,
      lastSync: new Date().toISOString()
    };
    
    this.updateWorkflowState(engagement.engagement || engagement, state);
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(integrationName) {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    return state?.integrations?.[integrationName] || { status: 'not_connected' };
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get overall engagement progress (0-100%)
   */
  getOverallProgress() {
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    
    if (!state) return 0;
    
    const phases = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5'];
    const totalProgress = phases.reduce((sum, phaseId) => sum + (state.phaseCompleteness[phaseId] || 0), 0);
    return Math.round(totalProgress / phases.length);
  }

  /**
   * Get phase summary
   */
  getPhaseSummary(phaseId) {
    const phase = this.workflowDefinition[phaseId];
    if (!phase) return null;
    
    const engagement = this.engagementManager.getCurrentEngagement();
    const state = this.getWorkflowState(engagement?.engagement || engagement);
    const completedSteps = state?.completedSteps || [];
    
    return {
      id: phase.id,
      name: phase.name,
      description: phase.description,
      totalSteps: phase.steps.length,
      completedSteps: completedSteps.filter(s => s.startsWith(phaseId)).length,
      completeness: state?.phaseCompleteness[phaseId] || 0,
      steps: phase.steps.map(step => ({
        ...step,
        completed: completedSteps.includes(step.id)
      }))
    };
  }

  /**
   * Get workflow summary (for dashboard)
   */
  getWorkflowSummary() {
    const phases = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5'];
    return {
      currentPhase: this.getCurrentPhase(),
      currentStep: this.getCurrentStep(),
      overallProgress: this.getOverallProgress(),
      phases: phases.map(phaseId => this.getPhaseSummary(phaseId))
    };
  }
}

// Initialize global instance (will be initialized after engagementManager loads)
if (typeof window !== 'undefined') {
  window.EA_WorkflowEngine = EA_WorkflowEngine;
}
