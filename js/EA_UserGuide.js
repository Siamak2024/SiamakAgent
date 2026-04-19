/**
 * EA_UserGuide.js
 * User guide, onboarding, and help system
 * Provides in-app tutorials, context-sensitive help, and sample data
 * 
 * @version 1.0
 * @phase Phase 5 - Integration & Polish
 */

class EA_UserGuide {
  constructor() {
    this.currentStep = 0;
    this.tutorialActive = false;
    this.tutorialSteps = this.defineTutorialSteps();
  }

  /**
   * Define tutorial steps (5-step walkthrough)
   * @returns {Array}
   */
  defineTutorialSteps() {
    return [
      {
        id: 'step1',
        title: 'Welcome to EA Platform!',
        content: `
          <h3>🎯 Let's get you started</h3>
          <p>This 5-minute tutorial will show you how to:</p>
          <ul>
            <li>Create your first account</li>
            <li>Set up an opportunity</li>
            <li>Start an EA engagement</li>
            <li>Use the AI assistant</li>
            <li>Generate reports</li>
          </ul>
          <p><strong>You can skip this tutorial anytime by clicking "Skip Tutorial"</strong></p>
        `,
        target: null,
        position: 'center',
        actions: [
          { label: 'Start Tutorial', action: 'next', primary: true },
          { label: 'Skip Tutorial', action: 'skip', primary: false }
        ]
      },
      {
        id: 'step2',
        title: 'Step 1: Create an Account',
        content: `
          <h3>🏢 Account Management</h3>
          <p>Start by creating an account for your customer. An account represents a customer organization you're working with.</p>
          <p><strong>Try it now:</strong></p>
          <ol>
            <li>Click the <strong>"Create Account"</strong> button</li>
            <li>Fill in the account details (name, industry, region, ACV)</li>
            <li>Click <strong>Save</strong></li>
          </ol>
          <p><em>Tip: You can also load sample data to explore the platform quickly.</em></p>
        `,
        target: '#create-account-btn',
        position: 'bottom',
        actions: [
          { label: 'Got it!', action: 'next', primary: true },
          { label: 'Load Sample Data', action: 'loadSample', primary: false }
        ]
      },
      {
        id: 'step3',
        title: 'Step 2: Create an Opportunity',
        content: `
          <h3>🎯 Opportunity Pipeline</h3>
          <p>Opportunities represent potential deals or projects within an account.</p>
          <p><strong>Try it now:</strong></p>
          <ol>
            <li>Click <strong>"New Opportunity"</strong></li>
            <li>Enter opportunity details (name, value, probability, close date)</li>
            <li>Click <strong>Create</strong></li>
          </ol>
          <p>You can track opportunities through their lifecycle: Discovery → Qualify → Propose → Negotiate → Close</p>
        `,
        target: '#new-opportunity-btn',
        position: 'bottom',
        actions: [
          { label: 'Continue', action: 'next', primary: true }
        ]
      },
      {
        id: 'step4',
        title: 'Step 3: Start an EA Engagement',
        content: `
          <h3>📋 EA Engagement Playbook</h3>
          <p>EA Engagements are where you perform architecture analysis, capability assessments, and transformation planning.</p>
          <p><strong>The E0-E5 Workflow:</strong></p>
          <ul>
            <li><strong>E0:</strong> Initiation - Define scope and stakeholders</li>
            <li><strong>E1:</strong> Analysis - Document current state (AS-IS)</li>
            <li><strong>E2:</strong> Design - Define target architecture</li>
            <li><strong>E3:</strong> Roadmap - Sequence initiatives</li>
            <li><strong>E4:</strong> Business Case - Quantify value</li>
            <li><strong>E5:</strong> Execution - Plan implementation</li>
          </ul>
          <p>Click <strong>"New Engagement"</strong> to start your first engagement.</p>
        `,
        target: '#new-engagement-btn',
        position: 'bottom',
        actions: [
          { label: 'Continue', action: 'next', primary: true }
        ]
      },
      {
        id: 'step5',
        title: 'Step 4: Use the AI Assistant',
        content: `
          <h3>🤖 AI-Powered Analysis</h3>
          <p>The AI Assistant helps you throughout your engagement journey:</p>
          <ul>
            <li><strong>Gap Analysis:</strong> Identifies capability white-spots automatically</li>
            <li><strong>Risk Identification:</strong> Suggests potential risks and mitigation strategies</li>
            <li><strong>Initiative Recommendations:</strong> Proposes strategic initiatives with ROI</li>
            <li><strong>Value Narratives:</strong> Generates executive summaries and business cases</li>
          </ul>
          <p><strong>Keyboard Shortcut:</strong> Press <kbd>Ctrl+K</kbd> to open the AI chat panel anytime.</p>
        `,
        target: '#ai-chat-panel',
        position: 'left',
        actions: [
          { label: 'Continue', action: 'next', primary: true }
        ]
      },
      {
        id: 'step6',
        title: 'Step 5: Generate Reports',
        content: `
          <h3>📊 Output Generation</h3>
          <p>Generate professional documents in multiple formats:</p>
          <ul>
            <li><strong>EA Engagement Report:</strong> Full-depth analysis (14 sections)</li>
            <li><strong>Leadership View:</strong> Executive investment summary (1-3 pages)</li>
            <li><strong>Sales Extract:</strong> Account planning one-pager</li>
            <li><strong>Architecture Blueprint:</strong> AS-IS and Target documentation</li>
            <li><strong>Value Case:</strong> Business case with ROI, NPV, payback</li>
          </ul>
          <p><strong>Export Formats:</strong> Markdown, PDF, PowerPoint, Excel</p>
          <hr>
          <h4>✅ Tutorial Complete!</h4>
          <p>You're ready to start using the EA Platform. Need help? Click the <strong>?</strong> icon for context-sensitive guidance.</p>
        `,
        target: '#generate-output-btn',
        position: 'bottom',
        actions: [
          { label: 'Finish Tutorial', action: 'finish', primary: true },
          { label: 'Restart', action: 'restart', primary: false }
        ]
      }
    ];
  }

  /**
   * Start tutorial
   */
  startTutorial() {
    this.tutorialActive = true;
    this.currentStep = 0;
    this.showStep(0);
    this.trackEvent('tutorial_started');
  }

  /**
   * Show tutorial step
   * @param {number} stepIndex
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.tutorialSteps.length) {
      this.endTutorial();
      return;
    }

    this.currentStep = stepIndex;
    const step = this.tutorialSteps[stepIndex];

    // Create tutorial overlay
    this.createTutorialOverlay(step);

    this.trackEvent('tutorial_step_viewed', { step: step.id });
  }

  /**
   * Create tutorial overlay
   * @param {object} step
   */
  createTutorialOverlay(step) {
    // Remove existing overlay
    this.removeTutorialOverlay();

    console.log('🎨 Creating tutorial overlay for step:', step.id);

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'tutorial-backdrop';
    backdrop.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.7) !important;
      z-index: 99998 !important;
      display: block !important;
    `;
    document.body.appendChild(backdrop);
    console.log('✅ Backdrop created:', backdrop);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'tutorial-modal';
    // Always center the modal initially - we'll reposition if needed
    modal.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: white !important;
      border-radius: 12px !important;
      padding: 30px !important;
      max-width: 500px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
      z-index: 99999 !important;
      font-family: 'Segoe UI', sans-serif !important;
      display: block !important;
      border: 3px solid #EA580C !important;
    `;

    // Title
    const title = document.createElement('h2');
    title.textContent = step.title;
    title.style.cssText = 'margin: 0 0 15px 0; color: #92400E; font-size: 22px;';
    modal.appendChild(title);

    // Content
    const content = document.createElement('div');
    content.innerHTML = step.content;
    content.style.cssText = 'margin-bottom: 20px; line-height: 1.6;';
    modal.appendChild(content);

    // Progress indicator
    const progress = document.createElement('div');
    progress.textContent = `Step ${this.currentStep + 1} of ${this.tutorialSteps.length}`;
    progress.style.cssText = 'font-size: 12px; color: #64748B; margin-bottom: 15px;';
    modal.appendChild(progress);

    // Actions
    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

    step.actions.forEach(action => {
      const btn = document.createElement('button');
      btn.textContent = action.label;
      btn.style.cssText = `
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        ${action.primary 
          ? 'background: #EA580C; color: white;' 
          : 'background: #F1F5F9; color: #475569;'}
      `;
      btn.addEventListener('click', () => this.handleAction(action.action));
      actions.appendChild(btn);
    });

    modal.appendChild(actions);

    document.body.appendChild(modal);
    console.log('✅ Modal created and appended to body:', modal);
    console.log('📊 Modal computed style - display:', window.getComputedStyle(modal).display);
    console.log('📊 Modal computed style - z-index:', window.getComputedStyle(modal).zIndex);
    console.log('📊 Modal computed style - position:', window.getComputedStyle(modal).position);

    // Highlight target element if specified
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        this.highlightElement(targetElement, step.position);
      }
    }
  }

  /**
   * Highlight target element
   * @param {HTMLElement} element
   * @param {string} position
   */
  highlightElement(element, position) {
    const rect = element.getBoundingClientRect();
    
    const highlight = document.createElement('div');
    highlight.id = 'tutorial-highlight';
    highlight.style.cssText = `
      position: fixed;
      top: ${rect.top - 5}px;
      left: ${rect.left - 5}px;
      width: ${rect.width + 10}px;
      height: ${rect.height + 10}px;
      border: 3px solid #EA580C;
      border-radius: 8px;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.3);
    `;
    
    document.body.appendChild(highlight);

    // Position modal near target
    const modal = document.getElementById('tutorial-modal');
    if (modal && position !== 'center') {
      if (position === 'bottom') {
        modal.style.top = `${rect.bottom + 20}px`;
        modal.style.left = `${rect.left}px`;
      } else if (position === 'left') {
        modal.style.top = `${rect.top}px`;
        modal.style.right = `${window.innerWidth - rect.left + 20}px`;
        modal.style.left = 'auto';
      }
      modal.style.transform = 'none';
    }
  }

  /**
   * Remove tutorial overlay
   */
  removeTutorialOverlay() {
    const backdrop = document.getElementById('tutorial-backdrop');
    const modal = document.getElementById('tutorial-modal');
    const highlight = document.getElementById('tutorial-highlight');

    if (backdrop) backdrop.remove();
    if (modal) modal.remove();
    if (highlight) highlight.remove();
  }

  /**
   * Handle tutorial action
   * @param {string} action
   */
  handleAction(action) {
    switch (action) {
      case 'next':
        this.showStep(this.currentStep + 1);
        break;
      case 'skip':
      case 'finish':
        this.endTutorial();
        break;
      case 'restart':
        this.startTutorial();
        break;
      case 'loadSample':
        this.loadSampleData();
        this.showStep(this.currentStep + 1);
        break;
    }
  }

  /**
   * End tutorial
   */
  endTutorial() {
    this.tutorialActive = false;
    this.removeTutorialOverlay();
    localStorage.setItem('ea_tutorial_completed', 'true');
    this.trackEvent('tutorial_completed');
  }

  /**
   * Check if tutorial has been completed
   * @returns {boolean}
   */
  isTutorialCompleted() {
    return localStorage.getItem('ea_tutorial_completed') === 'true';
  }

  /**
   * Load sample data
   */
  loadSampleData() {
    console.log('📊 Loading sample data...');

    const sampleAccount = {
      id: 'ACC-001',
      name: 'Acme Corporation',
      accountManager: 'John Smith',
      ACV: 500000,
      industry: 'Manufacturing',
      region: 'North America',
      size: 'Enterprise',
      health: 'good',
      strategicPriorities: [
        'Digital transformation',
        'Supply chain optimization',
        'Customer experience improvement'
      ],
      businessStrategy: 'Expand into new markets and modernize operations',
      painPoints: [
        'Legacy ERP system causing inefficiencies',
        'Disconnected data systems',
        'Manual processes in procurement'
      ],
      engagements: [],
      opportunities: [],
      stakeholders: [],
      applications: [],
      capabilities: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Sample Data Generator'
      }
    };

    const sampleOpportunity = {
      id: 'OPP-001',
      accountId: 'ACC-001',
      name: 'ERP Modernization Program',
      status: 'qualify',
      stage: 2,
      estimatedValue: 750000,
      probability: 60,
      closeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sponsor: 'Jane Doe, CIO',
      linkedInitiatives: [],
      linkedEngagements: [],
      valueCase: null,
      competitors: ['SAP', 'Oracle'],
      nextSteps: [
        'Schedule executive briefing',
        'Conduct architecture assessment',
        'Prepare ROI analysis'
      ],
      risks: [
        { risk: 'Budget constraints', probability: 'medium', impact: 'high' }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Sample Data Generator'
      }
    };

    // Save to localStorage
    localStorage.setItem(`ea_account_${sampleAccount.id}`, JSON.stringify(sampleAccount));
    localStorage.setItem(`ea_opportunity_${sampleOpportunity.id}`, JSON.stringify(sampleOpportunity));

    console.log('✅ Sample data loaded');
    this.trackEvent('sample_data_loaded');

    // Reload page to show sample data
    if (window.location.href.includes('EA_Growth_Dashboard')) {
      window.location.reload();
    }
  }

  /**
   * Load comprehensive Insurance industry demo scenario
   * Perfect for demonstrating EA value to sales leadership
   */
  loadInsuranceDemoData() {
    console.log('🏥 Loading Insurance Industry Demo Scenario...');

    const accountId = 'INS-2026-001';
    const engagementId = 'ENG-INS-2026-001';
    const opportunityId = 'OPP-INS-2026-001';
    const valueCaseId = 'VC-INS-2026-001';

    // 1. CREATE ACCOUNT - SecureLife Insurance Group
    const insuranceAccount = {
      id: accountId,
      name: 'SecureLife Insurance Group',
      accountManager: 'Sarah Chen',
      ACV: 1850000,
      industry: 'Insurance',
      region: 'EMEA',
      size: 'Enterprise',
      health: 'at-risk',
      strategicPriorities: [
        'Digital-first customer experience',
        'Real-time underwriting and pricing',
        'Legacy system modernization',
        'Data-driven decision making',
        'Regulatory compliance (Solvency II, GDPR)'
      ],
      businessStrategy: 'Transform from traditional insurer to digital insurance platform. Goal: 40% of policies sold digitally by 2027, reduce claims processing time by 60%, improve customer satisfaction (NPS) from 32 to 65.',
      painPoints: [
        '78% of claims still processed manually - avg 14 days settlement time',
        'Policy administration system from 2003 - unable to support new product types',
        'Customer data scattered across 14 siloed systems',
        'Mobile app rated 2.1 stars - 67% abandonment rate',
        'Underwriting takes 5-7 days vs. competitors offering instant quotes',
        'IT costs consuming 22% of revenue (industry avg: 12%)',
        'Unable to leverage AI/ML for risk assessment'
      ],
      engagements: [engagementId],
      opportunities: [opportunityId],
      stakeholders: [],
      applications: [],
      capabilities: [],
      metadata: {
        createdAt: new Date('2026-03-15').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    // 2. CREATE OPPORTUNITY - Digital Customer Experience Platform
    const digitalOpportunity = {
      id: opportunityId,
      accountId: accountId,
      name: 'Digital Customer Experience & Core Modernization',
      status: 'propose',
      stage: 3,
      estimatedValue: 2500000,
      probability: 70,
      closeDate: new Date('2026-06-30').toISOString().split('T')[0],
      sponsor: 'Michael Roberts, Chief Digital Officer',
      linkedInitiatives: ['INIT-API', 'INIT-MOBILE', 'INIT-CLOUD'],
      linkedEngagements: [engagementId],
      valueCase: valueCaseId,
      competitors: ['Guidewire', 'Duck Creek', 'Accenture'],
      nextSteps: [
        'Present architecture vision to Executive Committee (Apr 25)',
        'Conduct 3-day design workshop with IT and business (May 2-4)',
        'Finalize ROI model and business case (May 10)',
        'Submit formal proposal with pricing (May 20)',
        'Executive decision meeting (Jun 15)'
      ],
      risks: [
        { risk: 'Integration complexity with legacy policy admin system', probability: 'high', impact: 'high' },
        { risk: 'Regulatory approval for cloud migration may delay timeline', probability: 'medium', impact: 'medium' },
        { risk: 'Internal IT resistance to external architecture guidance', probability: 'medium', impact: 'low' }
      ],
      metadata: {
        createdAt: new Date('2026-03-20').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    // 3. CREATE COMPREHENSIVE ENGAGEMENT
    const insuranceEngagement = {
      id: engagementId,
      accountId: accountId,
      name: 'SecureLife Digital Insurance Platform - EA Advisory',
      customer: 'SecureLife Insurance Group',
      segment: 'Insurance',
      theme: 'Digital Transformation & Legacy Modernization',
      status: 'in-progress',
      linkedOpportunityId: opportunityId,
      
      // E0: INITIATION
      scope: 'Design target architecture for digital insurance platform covering: customer-facing digital channels (web/mobile), API-first integration layer, cloud-native policy and claims processing, real-time data analytics, and migration roadmap from legacy systems. Focus on P&C insurance lines initially, expand to life insurance in Phase 2.',
      objectives: [
        'Reduce policy issuance time from 7 days to <2 hours (straight-through processing)',
        'Achieve 40% digital sales penetration by Q4 2027',
        'Reduce claims processing time from 14 days to 48 hours',
        'Improve NPS from 32 to 65+ within 18 months',
        'Reduce IT run costs by 35% through cloud migration and automation'
      ],
      successCriteria: [
        'Executive-approved target architecture and 24-month roadmap',
        'Business case showing >200% ROI over 3 years',
        'Proof-of-concept for instant quote engine (auto insurance)',
        'Vendor-agnostic design enabling competitive procurement',
        'Change management plan with 85%+ stakeholder buy-in'
      ],
      assumptions: [
        { id: 'A1', assumption: 'Cloud migration approved by regulatory authority within 6 months', category: 'technical', validated: false },
        { id: 'A2', assumption: 'Legacy policy admin system has API capabilities or can be wrapped', category: 'technical', validated: true },
        { id: 'A3', assumption: 'Budget allocation of €12M over 24 months', category: 'financial', validated: false },
        { id: 'A4', assumption: 'Key IT architects available 50% time for 6-month design phase', category: 'resource', validated: true },
        { id: 'A5', assumption: 'Business willing to accept 3-month parallel run for claims migration', category: 'business', validated: true }
      ],
      constraints: [
        { id: 'C1', constraint: 'Must maintain 99.95% uptime during migration', category: 'technical', impact: 'Requires zero-downtime migration strategy' },
        { id: 'C2', constraint: 'GDPR and Solvency II compliance mandatory', category: 'regulatory', impact: 'Data residency in EU, audit trails, encryption at rest/transit' },
        { id: 'C3', constraint: 'No data migration over weekends (business operates 24/7)', category: 'operational', impact: 'Migration must use continuous sync approach' },
        { id: 'C4', constraint: 'Existing IBM mainframe contract until Dec 2027', category: 'contractual', impact: 'Gradual workload migration, not big-bang replacement' }
      ],
      decisions: [
        { id: 'D1', decision: 'Adopt cloud-native architecture on Microsoft Azure', rationale: 'Existing Microsoft EA, compliance certifications, hybrid capability', status: 'approved', decidedBy: 'Architecture Board', decidedDate: '2026-03-28' },
        { id: 'D2', decision: 'API-first integration strategy using Azure API Management', rationale: 'Enable gradual migration, support omnichannel, facilitate partner ecosystem', status: 'approved', decidedBy: 'CDO', decidedDate: '2026-04-02' },
        { id: 'D3', decision: 'Build mobile app in-house rather than outsource', rationale: 'Core differentiator, iterative UX improvements, control over roadmap', status: 'pending', decidedBy: null, decidedDate: null },
        { id: 'D4', decision: 'Use Guidewire PolicyCenter for new policy admin (vs. build)', rationale: 'Faster time-to-market, proven in insurance, lower risk', status: 'pending', decidedBy: null, decidedDate: null }
      ],

      // E0: STAKEHOLDERS (Customer, Segment, Story entities)
      customers: [
        { id: 'CUS-1', name: 'Individual Policyholders', description: 'Consumers purchasing auto, home, life insurance', needs: ['Easy self-service', 'Instant quotes', 'Fast claims', 'Mobile access'] },
        { id: 'CUS-2', name: 'Corporate Clients', description: 'SME and enterprise customers', needs: ['Multi-policy management', 'Dedicated support', 'Custom coverage', 'API integration'] },
        { id: 'CUS-3', name: 'Insurance Brokers', description: 'B2B2C channel partners', needs: ['Partner portal', 'Commission tracking', 'Quote comparison tools'] }
      ],
      segments: [
        { id: 'SEG-1', segment: 'Personal Lines (P&C)', description: 'Auto and home insurance', size: '€420M annual premium', painPoints: ['Poor mobile experience', 'Slow claims processing'] },
        { id: 'SEG-2', segment: 'Commercial Lines', description: 'SME insurance products', size: '€180M annual premium', painPoints: ['Manual underwriting', 'Limited product flexibility'] }
      ],
      phases: [
        { id: 'PH-1', phase: 'Phase 1: Digital Channels & API Layer', description: 'New mobile app, web portal, API gateway', duration: '9 months', keyMilestones: ['API Gateway live (M4)', 'Mobile app beta (M7)', 'Full launch (M9)'] },
        { id: 'PH-2', phase: 'Phase 2: Claims Modernization', description: 'Cloud-native claims processing with AI', duration: '12 months', keyMilestones: ['AI claims triage (M6)', 'Automated payment (M10)', 'Legacy decommission (M12)'] },
        { id: 'PH-3', phase: 'Phase 3: Policy Admin Migration', description: 'Move to Guidewire PolicyCenter', duration: '15 months', keyMilestones: ['Auto products migrated (M8)', 'Home products (M12)', 'Full cutover (M15)'] }
      ],
      stories: [
        { id: 'US-1', story: 'As a policyholder, I want to file a claim via mobile app with photo upload, so I can start the process immediately after an incident', acceptanceCriteria: ['Photo upload <10MB', 'Claim number generated instantly', 'Status notifications via push'], priority: 'high' },
        { id: 'US-2', story: 'As a customer, I want an instant auto insurance quote by entering my vehicle details, so I can compare and buy within minutes', acceptanceCriteria: ['Quote generated <30 seconds', 'Real-time pricing engine', 'Bind policy immediately'], priority: 'high' },
        { id: 'US-3', story: 'As a claims adjuster, I want AI to triage and estimate claim value, so I can focus on complex cases', acceptanceCriteria: ['80% claims auto-triaged', 'Estimate accuracy ±15%', 'Fraud flag for manual review'], priority: 'medium' }
      ],
      stakeholders: [
        { id: 'STK-1', name: 'Michael Roberts', role: 'Chief Digital Officer', influence: 'high', interest: 'high', stance: 'champion', concerns: ['Time to market', 'Customer adoption'], engagementStrategy: 'Weekly steering committee, executive sponsor' },
        { id: 'STK-2', name: 'Jennifer Wu', role: 'CIO', influence: 'high', interest: 'high', stance: 'supportive', concerns: ['Integration complexity', 'Team capacity', 'Vendor lock-in'], engagementStrategy: 'Architecture reviews, technical validation sessions' },
        { id: 'STK-3', name: 'David Martinez', role: 'Head of Claims', influence: 'medium', interest: 'high', stance: 'neutral', concerns: ['User adoption by adjusters', 'Process changes'], engagementStrategy: 'Co-design workshops, early prototypes for feedback' },
        { id: 'STK-4', name: 'Lisa Anderson', role: 'Chief Risk Officer', influence: 'high', interest: 'medium', stance: 'resistant', concerns: ['Regulatory compliance', 'Data security', 'Operational risk'], engagementStrategy: 'Risk assessment reviews, compliance validation checkpoints' },
        { id: 'STK-5', name: 'Robert Kim', role: 'Head of IT Architecture', influence: 'medium', interest: 'high', stance: 'supportive', concerns: ['Technical debt', 'Skills gap in cloud/APIs'], engagementStrategy: 'Daily collaboration, architecture co-creation' }
      ],

      // E1: ANALYSIS (Applications, Capabilities)
      applications: [
        { id: 'APP-1', name: 'Policy Administration System (PAS)', vendor: 'Custom (built 2003)', category: 'Core', status: 'retire', technicalFit: 1, businessFit: 2, criticality: 'high', issues: ['Mainframe COBOL', 'No APIs', 'Cannot support new products'], retirementDate: '2027-12-31' },
        { id: 'APP-2', name: 'Claims Processing System', vendor: 'Legacy', category: 'Core', status: 'retire', technicalFit: 2, businessFit: 2, criticality: 'high', issues: ['Manual workflows', 'No mobile support', '14-day avg processing'], retirementDate: '2027-06-30' },
        { id: 'APP-3', name: 'Underwriting Workbench', vendor: 'Verisk', category: 'Supporting', status: 'keep', technicalFit: 6, businessFit: 7, criticality: 'medium', issues: ['Integration via batch files'], retirementDate: null },
        { id: 'APP-4', name: 'Customer Portal (Web)', vendor: 'Outsourced', category: 'Engagement', status: 'replace', technicalFit: 3, businessFit: 4, criticality: 'medium', issues: ['Poor UX', 'Not mobile-responsive', 'Limited self-service'], retirementDate: '2026-12-31' },
        { id: 'APP-5', name: 'CRM (Salesforce)', vendor: 'Salesforce', category: 'Supporting', status: 'keep', technicalFit: 8, businessFit: 8, criticality: 'medium', issues: ['Not integrated with PAS'], retirementDate: null },
        { id: 'APP-6', name: 'Document Management', vendor: 'OpenText', category: 'Supporting', status: 'keep', technicalFit: 7, businessFit: 7, criticality: 'low', issues: ['High storage costs'], retirementDate: null }
      ],
      capabilities: [
        { id: 'CAP-1', capability: 'Customer Self-Service', currentLevel: 2, targetLevel: 9, gap: 7, priority: 'high', description: 'Customers manage policies, file claims, get quotes online/mobile', investment: 'high' },
        { id: 'CAP-2', capability: 'Real-time Underwriting & Pricing', currentLevel: 1, targetLevel: 8, gap: 7, priority: 'high', description: 'Instant quotes using real-time rating engine and risk assessment', investment: 'high' },
        { id: 'CAP-3', capability: 'Claims Automation', currentLevel: 3, targetLevel: 9, gap: 6, priority: 'high', description: 'AI-powered triage, automated payment, fraud detection', investment: 'high' },
        { id: 'CAP-4', capability: 'Omnichannel Engagement', currentLevel: 2, targetLevel: 8, gap: 6, priority: 'high', description: 'Seamless experience across web, mobile, agent, call center', investment: 'medium' },
        { id: 'CAP-5', capability: 'Data Analytics & Insights', currentLevel: 3, targetLevel: 9, gap: 6, priority: 'medium', description: 'Real-time dashboards, predictive analytics, customer 360', investment: 'medium' },
        { id: 'CAP-6', capability: 'API & Integration Platform', currentLevel: 2, targetLevel: 9, gap: 7, priority: 'high', description: 'API gateway enabling partners, third-party integrations', investment: 'medium' },
        { id: 'CAP-7', capability: 'Product Configuration & Launch', currentLevel: 3, targetLevel: 8, gap: 5, priority: 'medium', description: 'Rapid new product creation without IT coding', investment: 'low' }
      ],
      risks: [
        { id: 'R1', risk: 'Data migration from 20-year-old mainframe system fails or causes data corruption', probability: 'medium', impact: 'critical', mitigation: 'Extensive data profiling, migration dry-runs, parallel processing for 3 months, automated reconciliation' },
        { id: 'R2', risk: 'Regulatory authority does not approve cloud migration within timeline', probability: 'low', impact: 'high', mitigation: 'Early engagement with regulator, compliance-by-design, SOC2/ISO27001 certifications' },
        { id: 'R3', risk: 'Claims adjusters resist AI-assisted processing (fear of job loss)', probability: 'high', impact: 'medium', mitigation: 'Change management program, reposition as augmentation not replacement, focus on complex cases' },
        { id: 'R4', risk: 'Customer adoption of mobile app lower than expected (<20%)', probability: 'medium', impact: 'high', mitigation: 'UX research, beta testing, incentives for digital adoption, agent-assisted onboarding' }
      ],

      // E2: TARGET ARCHITECTURE (Initiatives)
      initiatives: [
        { id: 'INIT-API', initiative: 'API Gateway & Integration Platform', description: 'Azure API Management with event-driven architecture', businessValue: 'Enable partner ecosystem, faster integrations, reduce point-to-point complexity', cost: 450000, duration: 6, priority: 'high', dependencies: [], status: 'not-started' },
        { id: 'INIT-MOBILE', initiative: 'Native Mobile App (iOS/Android)', description: 'Customer-facing app for quotes, policy management, claims', businessValue: 'Capture 40% digital sales, improve NPS +15 points, reduce call center volume 30%', cost: 680000, duration: 9, priority: 'high', dependencies: ['INIT-API'], status: 'not-started' },
        { id: 'INIT-CLOUD', initiative: 'Cloud Migration (Azure)', description: 'Move workloads to Azure PaaS/SaaS, retire on-prem data centers', businessValue: 'Reduce IT costs 35%, improve scalability, enable AI/ML capabilities', cost: 920000, duration: 18, priority: 'high', dependencies: [], status: 'planning' },
        { id: 'INIT-CLAIMS', initiative: 'Claims Processing Platform (Cloud-Native)', description: 'New claims system with AI triage, automated workflows, mobile-first', businessValue: 'Reduce processing time from 14d to 48h, improve customer satisfaction, detect fraud', cost: 1100000, duration: 12, priority: 'high', dependencies: ['INIT-CLOUD', 'INIT-API'], status: 'not-started' },
        { id: 'INIT-POLICY', initiative: 'Policy Admin Modernization (Guidewire)', description: 'Replace legacy PAS with Guidewire PolicyCenter', businessValue: 'Support new products in weeks not months, reduce maintenance costs 60%', cost: 2400000, duration: 15, priority: 'medium', dependencies: ['INIT-API', 'INIT-CLOUD'], status: 'evaluation' },
        { id: 'INIT-DATA', initiative: 'Customer Data Platform & Analytics', description: 'Unified customer 360, real-time analytics, AI/ML platform', businessValue: 'Personalized pricing, churn prediction, upsell opportunities', cost: 580000, duration: 10, priority: 'medium', dependencies: ['INIT-CLOUD'], status: 'not-started' }
      ],

      // E3: ROADMAP
      roadmapItems: [
        { id: 'RM-1', initiative: 'INIT-API', phase: 'Phase 1', startMonth: 1, duration: 6, dependencies: [], milestone: 'API Gateway operational' },
        { id: 'RM-2', initiative: 'INIT-CLOUD', phase: 'Phase 1', startMonth: 1, duration: 18, dependencies: [], milestone: 'Azure landing zone ready' },
        { id: 'RM-3', initiative: 'INIT-MOBILE', phase: 'Phase 1', startMonth: 4, duration: 9, dependencies: ['INIT-API'], milestone: 'Mobile app launched' },
        { id: 'RM-4', initiative: 'INIT-CLAIMS', phase: 'Phase 2', startMonth: 7, duration: 12, dependencies: ['INIT-CLOUD', 'INIT-API'], milestone: 'Claims platform live' },
        { id: 'RM-5', initiative: 'INIT-DATA', phase: 'Phase 2', startMonth: 10, duration: 10, dependencies: ['INIT-CLOUD'], milestone: 'CDP operational' },
        { id: 'RM-6', initiative: 'INIT-POLICY', phase: 'Phase 3', startMonth: 13, duration: 15, dependencies: ['INIT-API', 'INIT-CLOUD'], milestone: 'PolicyCenter cutover' }
      ],

      // E4: VALUE CASE
      architectureViews: [
        { id: 'AV-1', viewType: 'Current State', description: 'Legacy mainframe-centric architecture with siloed applications', diagram: null },
        { id: 'AV-2', viewType: 'Target State', description: 'Cloud-native microservices with API-first integration layer', diagram: null },
        { id: 'AV-3', viewType: 'Integration View', description: 'Azure API Management hub connecting legacy and modern systems', diagram: null }
      ],
      artifacts: [
        { id: 'ART-1', name: 'Target Architecture Blueprint', type: 'document', description: 'Detailed technical architecture (47 pages)', url: null },
        { id: 'ART-2', name: '24-Month Transformation Roadmap', type: 'presentation', description: 'Executive roadmap with phases and milestones', url: null },
        { id: 'ART-3', name: 'Business Case & ROI Model', type: 'spreadsheet', description: '3-year financial model showing €8.2M NPV', url: null }
      ],

      // E5: EXECUTION (tracked via workflowState)
      workflowState: {
        currentPhase: 'E2',
        completedPhases: ['E0', 'E1'],
        phaseProgress: {
          'E0': 100,
          'E1': 100,
          'E2': 85,
          'E3': 45,
          'E4': 20,
          'E5': 0
        },
        lastUpdated: new Date().toISOString()
      },

      metadata: {
        createdAt: new Date('2026-03-18').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    // 4. CREATE VALUE CASE
    const insuranceValueCase = {
      id: valueCaseId,
      opportunityId: opportunityId,
      accountId: accountId,
      engagementId: engagementId,
      name: 'Digital Insurance Platform - Business Case',
      
      // Financial Model
      costs: {
        year1: 3200000, // High initial investment (initiatives + change management)
        year2: 2800000, // Continued implementation
        year3: 1400000, // Optimization and final cutover
        total: 7400000
      },
      benefits: {
        year1: 1200000, // Early wins: API cost savings, reduced manual processing
        year2: 4500000, // Mobile adoption, claims automation, cloud savings
        year3: 7800000, // Full platform operational, legacy decommissioned
        total: 13500000
      },
      netBenefit: 6100000,
      roi: 82, // (6.1M / 7.4M) * 100
      paybackPeriod: 2.1, // years
      npv: 4800000, // Using 10% discount rate
      irr: 34, // Internal rate of return %

      // Value Drivers
      valueDrivers: [
        { driver: 'Increase digital sales from 12% to 40%', impact: 'revenue', value: 2800000, confidence: 'high', timeline: '18 months' },
        { driver: 'Reduce claims processing cost by 60% (automation)', impact: 'cost', value: 2100000, confidence: 'high', timeline: '12 months' },
        { driver: 'Reduce IT infrastructure costs by 35% (cloud)', impact: 'cost', value: 1400000, confidence: 'medium', timeline: '24 months' },
        { driver: 'Improve customer retention +5% (better NPS)', impact: 'revenue', value: 1900000, confidence: 'medium', timeline: '24 months' },
        { driver: 'Faster time-to-market for new products (3 months → 2 weeks)', impact: 'revenue', value: 1200000, confidence: 'medium', timeline: '30 months' },
        { driver: 'Reduce call center volume 30% (self-service)', impact: 'cost', value: 900000, confidence: 'high', timeline: '12 months' }
      ],

      // Assumptions
      assumptions: [
        '40% digital adoption rate achieved by month 18',
        'Claims automation reaches 75% straight-through processing',
        'No major regulatory delays in cloud approval',
        'Customer NPS improves from 32 to 65',
        'IT team successfully upskills to cloud technologies'
      ],

      // Risk Adjustments
      risks: [
        { risk: 'Lower than expected mobile adoption', impact: -800000, probability: 30 },
        { risk: 'Migration delays add 6 months and €1.2M cost', impact: -1200000, probability: 20 },
        { risk: 'Regulatory compliance requirements increase costs', impact: -500000, probability: 40 }
      ],

      approvalStatus: 'pending',
      approvers: [
        { name: 'Michael Roberts (CDO)', status: 'approved', date: '2026-04-10' },
        { name: 'Jennifer Wu (CIO)', status: 'approved', date: '2026-04-12' },
        { name: 'CFO', status: 'pending', date: null },
        { name: 'CEO', status: 'pending', date: null }
      ],

      metadata: {
        createdAt: new Date('2026-04-08').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        schemaVersion: '2.0'
      }
    };

    // 5. CREATE ACCOUNT TEAM
    const teamId = 'TEAM-INS-2026-001';
    const insuranceTeam = {
      id: teamId,
      accountId: accountId,
      
      members: [
        {
          id: 'MEMBER-001',
          name: 'Sarah Chen',
          role: 'Sales Lead',
          email: 'sarah.chen@company.com',
          phone: '+46 70 123 4567',
          primaryContact: true,
          responsibilities: ['Account ownership', 'Customer relationship', 'Revenue target', 'Executive engagement'],
          availability: 'full-time',
          market: 'EMEA',
          startDate: '2026-03-01',
          endDate: null,
          notes: 'Primary account owner, 12 years experience in insurance sector'
        },
        {
          id: 'MEMBER-002',
          name: 'David Anderson',
          role: 'Enterprise Architect',
          email: 'david.anderson@company.com',
          phone: '+46 70 234 5678',
          primaryContact: false,
          responsibilities: ['E0-E5 execution', 'Architecture advisory', 'Business case development', 'Technical validation'],
          availability: 'part-time',
          market: 'EMEA',
          startDate: '2026-03-15',
          endDate: null,
          notes: 'EA lead for digital transformation, TOGAF certified'
        },
        {
          id: 'MEMBER-003',
          name: 'Michael Torres',
          role: 'Customer Success Manager',
          email: 'michael.torres@company.com',
          phone: '+46 70 345 6789',
          primaryContact: false,
          responsibilities: ['CSP management', 'Adoption tracking', 'Health monitoring', 'EBR/QBR facilitation'],
          availability: 'full-time',
          market: 'EMEA',
          startDate: '2026-03-01',
          endDate: null,
          notes: 'Customer success lead, 8 years experience'
        },
        {
          id: 'MEMBER-004',
          name: 'Lisa Park',
          role: 'Solutions Architect',
          email: 'lisa.park@company.com',
          phone: '+46 70 456 7890',
          primaryContact: false,
          responsibilities: ['Technical solution design', 'Demos and POCs', 'Integration architecture', 'Cloud expertise'],
          availability: 'part-time',
          market: 'EMEA',
          startDate: '2026-04-01',
          endDate: null,
          notes: 'Azure specialist, insurance domain knowledge'
        },
        {
          id: 'MEMBER-005',
          name: 'James Wilson',
          role: 'Delivery Manager',
          email: 'james.wilson@company.com',
          phone: '+46 70 567 8901',
          primaryContact: false,
          responsibilities: ['Implementation planning', 'Project management', 'Risk management', 'Delivery governance'],
          availability: 'part-time',
          market: 'EMEA',
          startDate: '2026-05-01',
          endDate: null,
          notes: 'Delivery lead, will manage implementation phase'
        }
      ],
      
      roles: {
        salesLead: 'MEMBER-001',
        enterpriseArchitect: 'MEMBER-002',
        customerSuccessManager: 'MEMBER-003',
        solutionsArchitect: 'MEMBER-004',
        deliveryManager: 'MEMBER-005',
        accountExecutive: null,
        technicalAccountManager: null,
        productSpecialist: [],
        partners: []
      },
      
      market: 'EMEA',
      region: 'Northern Europe',
      
      teamHealth: {
        collaborationScore: 85,
        communicationFrequency: 'weekly',
        lastSyncMeeting: '2026-04-18',
        nextSyncMeeting: '2026-04-25',
        issues: []
      },
      
      workingAgreements: {
        meetingCadence: 'weekly',
        communicationChannel: 'Microsoft Teams',
        escalationPath: ['Sarah Chen (Sales Lead)', 'Regional VP Sales', 'SVP Enterprise'],
        decisionMakingProcess: 'consensus',
        documentationLocation: 'SharePoint - SecureLife Folder',
        toolsUsed: ['EA Platform', 'Salesforce', 'Microsoft Teams', 'SharePoint']
      },
      
      metadata: {
        createdAt: new Date('2026-03-15').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator'
      }
    };

    // 6. CREATE CUSTOMER SUCCESS PLAN
    const cspId = 'CSP-INS-2026-001';
    const insuranceCSP = {
      id: cspId,
      accountId: accountId,
      
      planName: 'SecureLife Digital Transformation - Customer Success Plan',
      planPeriod: 'Q2 2026 - Q4 2027',
      owner: 'Michael Torres (CSM)',
      executiveSponsor: 'Sarah Chen (Sales Lead)',
      customerSponsor: 'Michael Roberts (CDO, SecureLife)',
      
      goals: [
        {
          id: 'GOAL-001',
          goal: 'Reduce claims processing time from 14 days to 48 hours',
          category: 'business',
          targetDate: '2027-06-30',
          status: 'in-progress',
          progress: 0,
          owner: 'David Martinez (Head of Claims)',
          description: 'Implement AI-powered claims automation to achieve 48-hour settlement',
          successCriteria: ['75% claims auto-triaged', 'Average settlement time <48h', 'Customer satisfaction >80%'],
          dependencies: ['INIT-CLAIMS']
        },
        {
          id: 'GOAL-002',
          goal: 'Achieve 40% digital sales penetration by Q4 2027',
          category: 'business',
          targetDate: '2027-12-31',
          status: 'in-progress',
          progress: 25,
          owner: 'Michael Roberts (CDO)',
          description: 'Launch mobile app and web portal to enable self-service policy purchase',
          successCriteria: ['Mobile app >4.5 stars', '5,000+ active users', '40% policies sold digitally'],
          dependencies: ['INIT-MOBILE']
        },
        {
          id: 'GOAL-003',
          goal: 'Migrate 80% of workloads to Azure cloud',
          category: 'technical',
          targetDate: '2027-09-30',
          status: 'in-progress',
          progress: 15,
          owner: 'Jennifer Wu (CIO)',
          description: 'Cloud migration to reduce IT costs and enable innovation',
          successCriteria: ['80% workloads in Azure', 'Legacy data center decommissioned', 'Zero downtime migration'],
          dependencies: ['INIT-CLOUD']
        },
        {
          id: 'GOAL-004',
          goal: 'Train 500 users on new digital platforms',
          category: 'adoption',
          targetDate: '2027-03-31',
          status: 'not-started',
          progress: 0,
          owner: 'Michael Torres (CSM)',
          description: 'User training program for claims adjusters, agents, and customer service',
          successCriteria: ['500 users trained', '80% proficiency level', '90% user satisfaction'],
          dependencies: ['INIT-MOBILE', 'INIT-CLAIMS']
        },
        {
          id: 'GOAL-005',
          goal: 'Realize €6.1M in business value by Q4 2027',
          category: 'value',
          targetDate: '2027-12-31',
          status: 'in-progress',
          progress: 10,
          owner: 'CFO',
          description: 'Track and validate value realization across all initiatives',
          successCriteria: ['€6.1M value realized', 'Value drivers validated', 'ROI >80%'],
          dependencies: []
        }
      ],
      
      metrics: [
        {
          id: 'KPI-001',
          metric: 'Active Users (Mobile App)',
          baseline: 0,
          target: 5000,
          current: 0,
          unit: ' users',
          trend: 'stable',
          category: 'adoption',
          frequency: 'weekly',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KPI-002',
          metric: 'Claims Processing Time',
          baseline: 14,
          target: 2,
          current: 14,
          unit: ' days',
          trend: 'stable',
          category: 'business',
          frequency: 'monthly',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KPI-003',
          metric: 'Digital Sales Penetration',
          baseline: 12,
          target: 40,
          current: 12,
          unit: '%',
          trend: 'stable',
          category: 'business',
          frequency: 'monthly',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KPI-004',
          metric: 'Customer NPS',
          baseline: 32,
          target: 65,
          current: 32,
          unit: '',
          trend: 'stable',
          category: 'business',
          frequency: 'quarterly',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KPI-005',
          metric: 'IT Cost % of Revenue',
          baseline: 22,
          target: 12,
          current: 22,
          unit: '%',
          trend: 'stable',
          category: 'business',
          frequency: 'quarterly',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'KPI-006',
          metric: 'Cloud Adoption',
          baseline: 0,
          target: 80,
          current: 0,
          unit: '%',
          trend: 'stable',
          category: 'technical',
          frequency: 'monthly',
          lastUpdated: new Date().toISOString()
        }
      ],
      
      initiatives: [
        {
          id: 'CSP-INIT-001',
          initiative: 'Mobile App Launch',
          description: 'Launch iOS and Android app for policy management and claims',
          status: 'planning',
          dueDate: '2026-12-31',
          owner: 'Lisa Park',
          linkedEAInitiative: 'INIT-MOBILE'
        },
        {
          id: 'CSP-INIT-002',
          initiative: 'Claims Automation Platform',
          description: 'Deploy AI-powered claims processing',
          status: 'planning',
          dueDate: '2027-06-30',
          owner: 'James Wilson',
          linkedEAInitiative: 'INIT-CLAIMS'
        },
        {
          id: 'CSP-INIT-003',
          initiative: 'Cloud Migration Program',
          description: 'Migrate workloads to Azure',
          status: 'in-progress',
          dueDate: '2027-09-30',
          owner: 'Jennifer Wu',
          linkedEAInitiative: 'INIT-CLOUD'
        }
      ],
      
      ebrs: [
        {
          id: 'EBR-001',
          date: '2026-06-15',
          status: 'scheduled',
          attendees: [
            'Michael Roberts (CDO, SecureLife)',
            'Jennifer Wu (CIO, SecureLife)',
            'Sarah Chen (Sales Lead)',
            'David Anderson (EA)',
            'Michael Torres (CSM)'
          ],
          topics: [
            'Q2 progress review',
            'Mobile app development status',
            'Cloud migration readiness',
            'Value realization tracking',
            'Q3 priorities and roadmap'
          ],
          outcomes: '',
          actionItems: [],
          nextDate: '2026-09-15',
          duration: 90,
          location: 'Virtual (Teams)',
          materials: [],
          notes: 'First EBR to align on transformation vision'
        }
      ],
      
      qbrs: [],
      
      adoption: {
        productUsage: [],
        featureAdoption: [],
        trainingCompleted: 0,
        certifications: 0
      },
      
      valueRealization: {
        expectedValue: 6100000,
        realizedValue: 0,
        realizationRate: 0,
        valueDrivers: [
          {
            id: 'VD-001',
            driver: 'Increase digital sales from 12% to 40%',
            expectedImpact: 2800000,
            realizedImpact: 0,
            status: 'not-started',
            evidence: ''
          },
          {
            id: 'VD-002',
            driver: 'Reduce claims processing cost by 60%',
            expectedImpact: 2100000,
            realizedImpact: 0,
            status: 'not-started',
            evidence: ''
          },
          {
            id: 'VD-003',
            driver: 'Reduce IT infrastructure costs by 35%',
            expectedImpact: 1400000,
            realizedImpact: 0,
            status: 'not-started',
            evidence: ''
          }
        ]
      },
      
      health: {
        overallScore: 72,
        dimensions: {
          adoption: { score: 65, trend: 'stable', notes: 'Early stage, not launched yet' },
          satisfaction: { score: 70, trend: 'stable', notes: 'Customer optimistic about transformation' },
          value: { score: 75, trend: 'stable', notes: 'Strong business case approved' },
          engagement: { score: 80, trend: 'improving', notes: 'High executive engagement' },
          renewal: { score: 70, trend: 'stable', notes: 'Renewal expected if transformation succeeds' }
        },
        risks: [
          {
            id: 'CSP-RISK-001',
            risk: 'Regulatory approval for cloud migration may be delayed',
            severity: 'medium',
            impact: 'Could delay cloud migration by 3-6 months',
            mitigation: 'Early engagement with regulator, compliance-by-design approach',
            owner: 'Jennifer Wu (CIO)',
            status: 'open'
          },
          {
            id: 'CSP-RISK-002',
            risk: 'User adoption of mobile app lower than expected',
            severity: 'medium',
            impact: 'May not hit 40% digital sales target',
            mitigation: 'UX research, beta testing, incentives for digital adoption',
            owner: 'Michael Roberts (CDO)',
            status: 'open'
          }
        ],
        opportunities: [
          {
            id: 'CSP-OPP-001',
            opportunity: 'Expand to life insurance products after P&C success',
            value: 1200000,
            effort: 'medium',
            priority: 'medium',
            owner: 'Sarah Chen'
          },
          {
            id: 'CSP-OPP-002',
            opportunity: 'Partner ecosystem via API platform',
            value: 800000,
            effort: 'low',
            priority: 'high',
            owner: 'Lisa Park'
          }
        ]
      },
      
      stakeholders: [
        {
          id: 'CSP-STK-001',
          name: 'Michael Roberts',
          role: 'Chief Digital Officer',
          sentimentScore: 90,
          lastContact: '2026-04-15',
          nextContact: '2026-04-22',
          notes: 'Executive sponsor, highly engaged, champion of transformation'
        },
        {
          id: 'CSP-STK-002',
          name: 'Jennifer Wu',
          role: 'CIO',
          sentimentScore: 85,
          lastContact: '2026-04-16',
          nextContact: '2026-04-23',
          notes: 'Supportive, concerned about integration complexity'
        },
        {
          id: 'CSP-STK-003',
          name: 'Lisa Anderson',
          role: 'Chief Risk Officer',
          sentimentScore: 60,
          lastContact: '2026-04-10',
          nextContact: '2026-04-24',
          notes: 'Resistant, concerned about compliance and operational risk'
        }
      ],
      
      milestones: [
        {
          id: 'MS-001',
          milestone: 'Cloud migration approved by regulator',
          targetDate: '2026-06-30',
          completedDate: null,
          status: 'pending',
          celebration: 'Team celebration dinner'
        },
        {
          id: 'MS-002',
          milestone: 'Mobile app beta launch',
          targetDate: '2026-10-01',
          completedDate: null,
          status: 'pending',
          celebration: 'Press release, customer event'
        },
        {
          id: 'MS-003',
          milestone: 'First €1M value realized',
          targetDate: '2027-03-31',
          completedDate: null,
          status: 'pending',
          celebration: 'Executive celebration with customer'
        }
      ],
      
      metadata: {
        createdAt: new Date('2026-04-01').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Demo Data Generator',
        lastReviewDate: '2026-04-15',
        nextReviewDate: '2026-06-15',
        version: 1
      }
    };

    // 7. CREATE SAMPLE ACTIVITIES
    const activity1 = {
      id: 'ACT-001',
      accountId: accountId,
      type: 'workshop',
      subject: 'Digital Platform Architecture Design Workshop',
      date: '2026-04-02',
      time: '09:00:00',
      duration: 480,
      internalParticipants: ['David Anderson (EA)', 'Lisa Park (Solutions Architect)'],
      customerParticipants: ['Robert Kim (IT Architect)', 'Jennifer Wu (CIO)'],
      purpose: 'Design target architecture for digital insurance platform',
      agenda: ['Review AS-IS architecture', 'Design target state', 'Integration patterns', 'Create roadmap'],
      notes: 'Highly productive 2-day workshop. Customer team engaged and collaborative. Identified 6 strategic initiatives totaling €6.1M investment. CIO Jennifer Wu approved cloud-first approach. IT Architect Robert Kim expressed concerns about legacy integration complexity - addressed via API wrapper strategy.',
      outcomes: [
        'Agreed on Azure as cloud platform',
        'Decided on API-first integration strategy',
        'Approved phased migration approach (3 phases over 24 months)',
        'Identified 7 capability gaps requiring investment'
      ],
      actionItems: [
        {
          id: 'AI-001',
          action: 'Create detailed architecture blueprint document',
          owner: 'David Anderson',
          dueDate: '2026-04-10',
          status: 'in-progress',
          priority: 'high'
        },
        {
          id: 'AI-002',
          action: 'Build API catalog for legacy system integration',
          owner: 'Lisa Park',
          dueDate: '2026-04-15',
          status: 'open',
          priority: 'high'
        },
        {
          id: 'AI-003',
          action: 'Submit cloud migration request to regulatory authority',
          owner: 'Jennifer Wu',
          dueDate: '2026-04-30',
          status: 'open',
          priority: 'critical'
        }
      ],
      nextSteps: ['Architecture review with CIO team', 'Present to Executive Committee', 'Begin Phase 1 planning'],
      followUpRequired: true,
      followUpDate: '2026-04-12',
      linkedEngagement: engagementId,
      linkedOpportunity: opportunityId,
      linkedCSP: cspId,
      attachments: ['Architecture Diagram v1.0', 'Workshop Notes', 'Initiative Roadmap'],
      customerSentiment: 'positive',
      metadata: {
        createdAt: new Date('2026-04-02').toISOString(),
        createdBy: 'David Anderson',
        lastUpdated: new Date('2026-04-02').toISOString()
      }
    };

    const activity2 = {
      id: 'ACT-002',
      accountId: accountId,
      type: 'meeting',
      subject: 'Weekly Account Team Sync',
      date: '2026-04-18',
      time: '14:00:00',
      duration: 30,
      internalParticipants: ['Sarah Chen', 'David Anderson', 'Michael Torres', 'Lisa Park'],
      customerParticipants: [],
      purpose: 'Team alignment on account activities and progress',
      agenda: ['Recent activity review', 'Action items status', 'EBR preparation', 'Next steps'],
      notes: 'Team sync went well. Architecture blueprint 95% complete. EBR scheduled for June 15. Customer CDO confirmed attendance. Need to finalize ROI model before EBR.',
      outcomes: [
        'EBR confirmed for June 15, 2026',
        'Architecture blueprint on track for April 20 delivery',
        'ROI model needs review by Sarah (Sales Lead) before customer presentation'
      ],
      actionItems: [
        {
          id: 'AI-004',
          action: 'Review ROI model and value narrative',
          owner: 'Sarah Chen',
          dueDate: '2026-04-22',
          status: 'open',
          priority: 'high'
        },
        {
          id: 'AI-005',
          action: 'Send EBR invites to customer executives',
          owner: 'Michael Torres',
          dueDate: '2026-04-19',
          status: 'open',
          priority: 'medium'
        }
      ],
      nextSteps: ['Complete architecture blueprint', 'EBR deck preparation', 'ROI model finalization'],
      followUpRequired: false,
      followUpDate: null,
      linkedEngagement: engagementId,
      linkedOpportunity: opportunityId,
      linkedCSP: cspId,
      attachments: [],
      customerSentiment: 'neutral',
      metadata: {
        createdAt: new Date('2026-04-18').toISOString(),
        createdBy: 'Sarah Chen',
        lastUpdated: new Date('2026-04-18').toISOString()
      }
    };

    // Update account references
    insuranceAccount.teamId = teamId;
    insuranceAccount.cspId = cspId;

    // Save all entities to localStorage
    localStorage.setItem(`ea_account_${accountId}`, JSON.stringify(insuranceAccount));
    localStorage.setItem(`ea_opportunity_${opportunityId}`, JSON.stringify(digitalOpportunity));
    localStorage.setItem(`ea_engagement_model_${engagementId}`, JSON.stringify(insuranceEngagement));
    localStorage.setItem(`ea_valuecase_${valueCaseId}`, JSON.stringify(insuranceValueCase));
    localStorage.setItem(`ea_team_${teamId}`, JSON.stringify(insuranceTeam));
    localStorage.setItem(`ea_csp_${cspId}`, JSON.stringify(insuranceCSP));
    localStorage.setItem(`ea_activity_ACT-001`, JSON.stringify(activity1));
    localStorage.setItem(`ea_activity_ACT-002`, JSON.stringify(activity2));

    console.log('✅ Insurance Demo Scenario Loaded Successfully!');
    console.log('📊 Demo includes:');
    console.log('   - Account: SecureLife Insurance Group (€1.85M ACV)');
    console.log('   - Opportunity: Digital Platform ($2.5M, 70% probability)');
    console.log('   - Full EA Engagement: E0-E2 complete, E3-E4 in progress');
    console.log('   - Account Team: 5 members (Sales Lead, EA, CSM, Solutions, Delivery)');
    console.log('   - Customer Success Plan: 5 goals, 6 KPIs, 1 EBR scheduled');
    console.log('   - Activities: 2 logged (workshop + team sync with action items)');
    console.log('   - 5 Stakeholders (CDO, CIO, Head of Claims, CRO, IT Architect)');
    console.log('   - 6 Legacy Applications (mainframe PAS, claims system, etc.)');
    console.log('   - 7 Target Capabilities (self-service, AI claims, omnichannel)');
    console.log('   - 6 Strategic Initiatives (API, Mobile, Cloud, Claims Platform)');
    console.log('   - Value Case: €6.1M net benefit, 82% ROI, 2.1yr payback');
    console.log('');
    console.log('🎯 Perfect for demonstrating Sales + EA Collaboration!');

    this.trackEvent('insurance_demo_loaded');

    // Reload page to show demo data
    if (window.location.href.includes('EA_Growth_Dashboard') || 
        window.location.href.includes('EA_Account_Dashboard')) {
      alert('🏥 Insurance Demo Loaded!\n\n' +
            'SecureLife Insurance Group has been created with:\n' +
            '✅ Full EA engagement (E0-E2 complete)\n' +
            '✅ $2.5M opportunity at 70% probability\n' +
            '✅ Complete stakeholder map and architecture analysis\n' +
            '✅ Business case showing €6.1M value\n' +
            '✅ Account team with 5 members\n' +
            '✅ Customer Success Plan with goals and KPIs\n' +
            '✅ Activity log with workshop and team sync\n\n' +
            'Navigate to Growth Dashboard to explore!');
      window.location.reload();
    }
  }

  /**
   * Get context-sensitive help for current page
   * @param {string} page - Page identifier
   * @returns {object}
   */
  getContextHelp(page) {
    const helpContent = {
      'growth_dashboard': {
        title: 'Growth Dashboard',
        content: `
          <h3>📊 Growth Dashboard Overview</h3>
          <p>The Growth Dashboard is your central hub for managing accounts, opportunities, and EA engagements.</p>
          
          <h4>Three Entry Points:</h4>
          <ul>
            <li><strong>Account Dashboard:</strong> Understand your customer (account-centric view)</li>
            <li><strong>Opportunity Pipeline:</strong> Shape opportunities and track sales progress</li>
            <li><strong>EA Playbook:</strong> Deliver value through architecture engagements</li>
          </ul>

          <h4>Key Metrics:</h4>
          <ul>
            <li><strong>Total ACV:</strong> Annual Contract Value across all accounts</li>
            <li><strong>Pipeline Value:</strong> Total value of active opportunities</li>
            <li><strong>Win Rate:</strong> Percentage of closed-won opportunities</li>
            <li><strong>Quarterly Forecast:</strong> Expected revenue this quarter</li>
          </ul>
        `,
        videoUrl: null
      },
      'account_dashboard': {
        title: 'Account Dashboard',
        content: `
          <h3>🏢 Account Dashboard Help</h3>
          <p>Manage customer accounts and track engagement activity.</p>
          
          <h4>Tabs:</h4>
          <ul>
            <li><strong>Opportunities:</strong> View and create opportunities for this account</li>
            <li><strong>Engagements:</strong> Link EA engagements to this account</li>
            <li><strong>Stakeholders:</strong> Aggregated stakeholders from all linked engagements</li>
            <li><strong>AI Insights:</strong> AI-generated account analysis and recommendations</li>
          </ul>

          <h4>Actions:</h4>
          <ul>
            <li>Click <strong>"New Opportunity"</strong> to create an opportunity</li>
            <li>Click <strong>"Link Engagement"</strong> to associate an EA engagement</li>
            <li>Click <strong>"Generate Insights"</strong> for AI analysis</li>
          </ul>
        `,
        videoUrl: null
      },
      'engagement_playbook': {
        title: 'EA Engagement Playbook',
        content: `
          <h3>📋 EA Engagement Playbook Help</h3>
          <p>Execute structured EA engagements using the E0-E5 workflow.</p>

          <h4>Workflow Steps:</h4>
          <ul>
            <li><strong>E0:</strong> Initiation - Define scope, stakeholders, success criteria</li>
            <li><strong>E1:</strong> Analysis - Document AS-IS (applications, capabilities)</li>
            <li><strong>E2:</strong> Design - Define target architecture and initiatives</li>
            <li><strong>E3:</strong> Roadmap - Sequence initiatives and create timeline</li>
            <li><strong>E4:</strong> Business Case - Quantify value and build ROI</li>
            <li><strong>E5:</strong> Execution - Plan implementation and handoff</li>
          </ul>

          <h4>Using the AI Assistant:</h4>
          <ul>
            <li>Press <kbd>Ctrl+K</kbd> to open AI chat panel</li>
            <li>AI provides step-specific guidance and suggestions</li>
            <li>AI can generate gap analysis, risk identification, and recommendations</li>
          </ul>
        `,
        videoUrl: null
      }
    };

    return helpContent[page] || {
      title: 'Help',
      content: '<p>No help available for this page yet.</p>',
      videoUrl: null
    };
  }

  /**
   * Show context help modal
   * @param {string} page
   */
  showContextHelp(page) {
    const help = this.getContextHelp(page);

    // Create modal
    const backdrop = document.createElement('div');
    backdrop.id = 'help-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
    `;
    backdrop.addEventListener('click', () => this.closeContextHelp());
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      font-family: 'Segoe UI', sans-serif;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;';
    
    const title = document.createElement('h2');
    title.textContent = help.title;
    title.style.cssText = 'margin: 0; color: #92400E;';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
      color: #64748B;
    `;
    closeBtn.addEventListener('click', () => this.closeContextHelp());
    header.appendChild(closeBtn);

    modal.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.innerHTML = help.content;
    content.style.cssText = 'line-height: 1.6;';
    modal.appendChild(content);

    // Video (if available)
    if (help.videoUrl) {
      const video = document.createElement('iframe');
      video.src = help.videoUrl;
      video.style.cssText = 'width: 100%; height: 315px; border: none; border-radius: 8px; margin-top: 20px;';
      modal.appendChild(video);
    }

    document.body.appendChild(modal);

    this.trackEvent('help_viewed', { page });
  }

  /**
   * Close context help modal
   */
  closeContextHelp() {
    const backdrop = document.getElementById('help-backdrop');
    const modal = document.getElementById('help-modal');

    if (backdrop) backdrop.remove();
    if (modal) modal.remove();
  }

  /**
   * Generate cheat sheet PDF
   * @returns {string} - Download URL
   */
  generateCheatSheet() {
    const cheatSheet = `
# EA Platform Cheat Sheet

## Keyboard Shortcuts

- **Ctrl+K** - Open AI Assistant
- **Ctrl+S** - Save current entity
- **Ctrl+N** - Create new entity
- **Esc** - Close modal/dialog

## E0-E5 Workflow

1. **E0: Initiation** - Define scope, stakeholders, success criteria
2. **E1: Analysis** - Document AS-IS (applications, capabilities, risks)
3. **E2: Design** - Define target architecture and initiatives
4. **E3: Roadmap** - Sequence initiatives and create timeline
5. **E4: Business Case** - Quantify value (ROI, NPV, payback)
6. **E5: Execution** - Plan implementation and handoff

## Quick Actions

### Create New Account
1. Click "Create Account" on Growth Dashboard
2. Fill in: Name, Industry, Region, ACV, Health
3. Click Save

### Create New Opportunity
1. Navigate to Account Dashboard
2. Click "New Opportunity"
3. Fill in: Name, Value, Probability, Close Date
4. Click Create

### Start EA Engagement
1. Click "New Engagement" on Growth Dashboard
2. Fill in: Name, Customer, Segment, Theme
3. Link to Account (optional)
4. Follow E0-E5 workflow steps

### Generate Reports
1. Open engagement in EA Playbook
2. Click "Generate Output"
3. Select template (Engagement Report, Leadership View, etc.)
4. Choose format (PDF, PPTX, XLSX, MD)
5. Click Download

## Integration Points

- **APQC**: Import capability framework (E1.2)
- **APM**: Import application portfolio (E1.1)
- **BMC**: Import stakeholders from Business Model Canvas (E0.2)
- **Capability Map**: Sync capability assessments (E1.3)

## AI Assistant Commands

- "Analyze capability gaps"
- "Identify risks"
- "Recommend initiatives"
- "Generate value narrative"
- "Create step checklist"

---

© 2026 EA Platform | Version 2.0
`;

    const blob = new Blob([cheatSheet], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ea_platform_cheat_sheet.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.trackEvent('cheat_sheet_downloaded');

    return url;
  }

  /**
   * Track usage event
   * @param {string} eventName
   * @param {object} properties
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      properties
    };

    // Store in localStorage for analytics
    const events = JSON.parse(localStorage.getItem('ea_usage_events') || '[]');
    events.push(event);

    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem('ea_usage_events', JSON.stringify(events));

    console.log(`📊 Event tracked: ${eventName}`, properties);
  }

  /**
   * Get usage statistics
   * @returns {object}
   */
  getUsageStats() {
    const events = JSON.parse(localStorage.getItem('ea_usage_events') || '[]');

    const stats = {
      totalEvents: events.length,
      tutorialCompleted: this.isTutorialCompleted(),
      recentEvents: events.slice(-10),
      eventCounts: {}
    };

    events.forEach(event => {
      stats.eventCounts[event.name] = (stats.eventCounts[event.name] || 0) + 1;
    });

    return stats;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_UserGuide = EA_UserGuide;
  window.userGuide = new EA_UserGuide();

  // Auto-show tutorial on first visit
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.userGuide.isTutorialCompleted()) {
      // Check if user wants tutorial
      const showTutorial = localStorage.getItem('ea_auto_tutorial') !== 'false';
      if (showTutorial) {
        setTimeout(() => {
          const startTutorial = confirm('Welcome to EA Platform! Would you like to take a quick 5-minute tutorial?');
          if (startTutorial) {
            window.userGuide.startTutorial();
          } else {
            localStorage.setItem('ea_auto_tutorial', 'false');
          }
        }, 1000);
      }
    }
  });
}
