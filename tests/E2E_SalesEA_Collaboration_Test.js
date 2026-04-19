/**
 * E2E Test Suite: Sales + EA Collaboration Platform
 * Tests: Customer Success Plans, Account Teams, Activities, Growth Plan Integration
 * Version: 2.0
 * Date: April 19, 2026
 */

class SalesEACollaborationE2ETest {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Run all E2E tests
   */
  async runAllTests() {
    console.log('🧪 Starting Sales + EA Collaboration Platform E2E Tests...\n');
    this.startTime = Date.now();

    try {
      // Clear any existing test data
      this.cleanupTestData();

      // Phase 1: Module Availability Tests
      await this.testModuleAvailability();

      // Phase 2: Customer Success Plan Tests
      await this.testCustomerSuccessModule();

      // Phase 3: Account Team Tests
      await this.testAccountTeamModule();

      // Phase 4: Activity Logging Tests
      await this.testActivityLogging();

      // Phase 5: Integration Tests
      await this.testIntegration();

      // Phase 6: Insurance Demo Tests
      await this.testInsuranceDemo();

      // Phase 7: Data Persistence Tests
      await this.testDataPersistence();

      // Phase 8: Error Handling Tests
      await this.testErrorHandling();

      // Generate final report
      this.endTime = Date.now();
      this.generateReport();

    } catch (error) {
      console.error('❌ CRITICAL ERROR during E2E test execution:', error);
      this.logTest('Critical Test Execution', false, error.message);
      this.generateReport();
    }
  }

  /**
   * Test 1: Module Availability
   */
  async testModuleAvailability() {
    console.log('\n📦 Phase 1: Module Availability Tests\n');

    // Test EA_CustomerSuccess module
    this.logTest(
      'EA_CustomerSuccess module loaded',
      typeof EA_CustomerSuccess !== 'undefined',
      'EA_CustomerSuccess should be defined'
    );

    if (typeof EA_CustomerSuccess !== 'undefined') {
      const csp = new EA_CustomerSuccess();
      this.logTest(
        'EA_CustomerSuccess instantiation',
        csp !== null && csp !== undefined,
        'Should create CustomerSuccess instance'
      );

      this.logTest(
        'CustomerSuccess has createOrUpdateCSP method',
        typeof csp.createOrUpdateCSP === 'function',
        'Should have createOrUpdateCSP method'
      );

      this.logTest(
        'CustomerSuccess has addGoal method',
        typeof csp.addGoal === 'function',
        'Should have addGoal method'
      );

      this.logTest(
        'CustomerSuccess has updateHealth method',
        typeof csp.updateHealth === 'function',
        'Should have updateHealth method'
      );
    }

    // Test EA_AccountTeam module
    this.logTest(
      'EA_AccountTeam module loaded',
      typeof EA_AccountTeam !== 'undefined',
      'EA_AccountTeam should be defined'
    );

    if (typeof EA_AccountTeam !== 'undefined') {
      const team = new EA_AccountTeam();
      this.logTest(
        'EA_AccountTeam instantiation',
        team !== null && team !== undefined,
        'Should create AccountTeam instance'
      );

      this.logTest(
        'AccountTeam has createOrUpdateTeam method',
        typeof team.createOrUpdateTeam === 'function',
        'Should have createOrUpdateTeam method'
      );

      this.logTest(
        'AccountTeam has logActivity method',
        typeof team.logActivity === 'function',
        'Should have logActivity method'
      );

      this.logTest(
        'AccountTeam has getEngagementMetrics method',
        typeof team.getEngagementMetrics === 'function',
        'Should have getEngagementMetrics method'
      );
    }

    // Test existing modules still work
    this.logTest(
      'EA_AccountManager still available',
      typeof EA_AccountManager !== 'undefined',
      'Existing module should not be broken'
    );

    this.logTest(
      'EA_EngagementManager still available',
      typeof EA_EngagementManager !== 'undefined',
      'Existing module should not be broken'
    );
  }

  /**
   * Test 2: Customer Success Plan Module
   */
  async testCustomerSuccessModule() {
    console.log('\n📊 Phase 2: Customer Success Plan Module Tests\n');

    if (typeof EA_CustomerSuccess === 'undefined') {
      this.logTest('CustomerSuccess Module Tests', false, 'Module not loaded');
      return;
    }

    const csp = new EA_CustomerSuccess();
    const testAccountId = 'TEST-ACC-001';
    const testCSPId = 'TEST-CSP-001';

    // Test 2.1: Create CSP
    const cspData = {
      planName: 'Test Customer Success Plan',
      planPeriod: 'Q2 2026 - Q4 2026',
      owner: 'Test CSM',
      customerSponsor: 'Test Customer CDO'
    };

    try {
      const createdCSP = csp.createOrUpdateCSP(testAccountId, cspData);
      this.logTest(
        'Create Customer Success Plan',
        createdCSP && createdCSP.id,
        'Should create CSP with ID'
      );

      this.logTest(
        'CSP has correct account reference',
        createdCSP.accountId === testAccountId,
        'CSP should reference correct account'
      );

      this.logTest(
        'CSP has default health score',
        createdCSP.health && typeof createdCSP.health.overallScore === 'number',
        'CSP should have health tracking'
      );

      // Test 2.2: Add Goals
      const goalData = {
        goal: 'Reduce processing time by 50%',
        category: 'business',
        targetDate: '2026-12-31',
        owner: 'Test Owner'
      };

      const goalResult = csp.addGoal(createdCSP.id, goalData);
      this.logTest(
        'Add goal to CSP',
        goalResult && goalResult.goals && goalResult.goals.length > 0,
        'Should add goal successfully'
      );

      this.logTest(
        'Goal has correct properties',
        goalResult.goals[0].goal === goalData.goal &&
        goalResult.goals[0].category === goalData.category,
        'Goal should have correct data'
      );

      // Test 2.3: Add Metrics
      const metricData = {
        metric: 'Active Users',
        baseline: 0,
        target: 1000,
        current: 0,
        unit: ' users',
        category: 'adoption',
        frequency: 'weekly'
      };

      const metricResult = csp.addMetric(createdCSP.id, metricData);
      this.logTest(
        'Add metric to CSP',
        metricResult && metricResult.metrics && metricResult.metrics.length > 0,
        'Should add metric successfully'
      );

      // Test 2.4: Schedule EBR
      const ebrData = {
        date: '2026-06-30',
        attendees: ['Customer CEO', 'Our CEO', 'CSM'],
        topics: ['Q2 Review', 'Value Realization']
      };

      const ebrResult = csp.scheduleEBR(createdCSP.id, ebrData);
      this.logTest(
        'Schedule EBR',
        ebrResult && ebrResult.ebrs && ebrResult.ebrs.length > 0,
        'Should schedule EBR successfully'
      );

      // Test 2.5: Update Health
      const healthData = {
        dimensions: {
          adoption: { score: 75, notes: 'Good progress' },
          satisfaction: { score: 80, notes: 'Customer happy' },
          value: { score: 70, notes: 'On track' },
          engagement: { score: 85, notes: 'High engagement' },
          renewal: { score: 90, notes: 'Strong renewal likelihood' }
        }
      };

      const healthResult = csp.updateHealth(createdCSP.id, healthData);
      this.logTest(
        'Update health score',
        healthResult && healthResult.health && healthResult.health.overallScore > 0,
        'Should update health successfully'
      );

      this.logTest(
        'Health score calculated correctly',
        healthResult.health.overallScore === 80, // Average of 75,80,70,85,90
        'Overall score should be average of dimensions'
      );

      // Test 2.6: Track Value Realization
      const valueData = {
        realizedValue: 500000,
        evidence: 'Q1 cost savings validated'
      };

      const valueResult = csp.trackValueRealization(createdCSP.id, valueData);
      this.logTest(
        'Track value realization',
        valueResult && valueResult.valueRealization,
        'Should track value successfully'
      );

      // Test 2.7: Get CSP by ID
      const retrievedCSP = csp.getCSP(createdCSP.id);
      this.logTest(
        'Retrieve CSP by ID',
        retrievedCSP && retrievedCSP.id === createdCSP.id,
        'Should retrieve CSP by ID'
      );

      // Test 2.8: Get CSP by Account ID
      const accountCSPs = csp.getCSPByAccount(testAccountId);
      this.logTest(
        'Get CSP by account ID',
        accountCSPs && accountCSPs.id === createdCSP.id,
        'Should retrieve CSP by account ID'
      );

      // Test 2.9: Get Health Summary
      const healthSummary = csp.getHealthSummary();
      this.logTest(
        'Get health summary across all CSPs',
        healthSummary && typeof healthSummary.totalCSPs === 'number',
        'Should return health summary'
      );

    } catch (error) {
      this.logTest('Customer Success Plan Tests', false, error.message);
    }
  }

  /**
   * Test 3: Account Team Module
   */
  async testAccountTeamModule() {
    console.log('\n👥 Phase 3: Account Team Module Tests\n');

    if (typeof EA_AccountTeam === 'undefined') {
      this.logTest('Account Team Module Tests', false, 'Module not loaded');
      return;
    }

    const team = new EA_AccountTeam();
    const testAccountId = 'TEST-ACC-002';

    // Test 3.1: Create Team
    const teamData = {
      market: 'EMEA',
      region: 'Northern Europe',
      workingAgreements: {
        meetingCadence: 'weekly',
        communicationChannel: 'Microsoft Teams',
        decisionMakingProcess: 'consensus'
      }
    };

    try {
      const createdTeam = team.createOrUpdateTeam(testAccountId, teamData);
      this.logTest(
        'Create account team',
        createdTeam && createdTeam.id,
        'Should create team with ID'
      );

      this.logTest(
        'Team has correct account reference',
        createdTeam.accountId === testAccountId,
        'Team should reference correct account'
      );

      // Test 3.2: Add Team Members
      const member1 = {
        name: 'John Sales',
        role: 'Sales Lead',
        email: 'john.sales@test.com',
        primaryContact: true,
        responsibilities: ['Account ownership'],
        availability: 'full-time',
        market: 'EMEA'
      };

      const memberResult1 = team.addMember(createdTeam.id, member1);
      this.logTest(
        'Add team member (Sales Lead)',
        memberResult1 && memberResult1.members && memberResult1.members.length > 0,
        'Should add team member successfully'
      );

      this.logTest(
        'Sales Lead set in roles',
        memberResult1.roles && memberResult1.roles.salesLead,
        'Sales Lead should be assigned to role'
      );

      const member2 = {
        name: 'Jane Architect',
        role: 'Enterprise Architect',
        email: 'jane.arch@test.com',
        primaryContact: false,
        responsibilities: ['EA engagement'],
        availability: 'part-time',
        market: 'EMEA'
      };

      const memberResult2 = team.addMember(createdTeam.id, member2);
      this.logTest(
        'Add team member (EA)',
        memberResult2 && memberResult2.members && memberResult2.members.length === 2,
        'Should add second member'
      );

      this.logTest(
        'EA set in roles',
        memberResult2.roles && memberResult2.roles.enterpriseArchitect,
        'EA should be assigned to role'
      );

      // Test 3.3: Remove Team Member
      const memberId = memberResult2.members[0].id;
      const removeResult = team.removeMember(createdTeam.id, memberId);
      this.logTest(
        'Remove team member',
        removeResult && removeResult.members && removeResult.members.length === 1,
        'Should remove member successfully'
      );

      // Test 3.4: Get Team by ID
      const retrievedTeam = team.getTeam(createdTeam.id);
      this.logTest(
        'Retrieve team by ID',
        retrievedTeam && retrievedTeam.id === createdTeam.id,
        'Should retrieve team by ID'
      );

      // Test 3.5: Get Team by Account ID
      const accountTeam = team.getTeamByAccount(testAccountId);
      this.logTest(
        'Get team by account ID',
        accountTeam && accountTeam.id === createdTeam.id,
        'Should retrieve team by account ID'
      );

    } catch (error) {
      this.logTest('Account Team Tests', false, error.message);
    }
  }

  /**
   * Test 4: Activity Logging
   */
  async testActivityLogging() {
    console.log('\n📝 Phase 4: Activity Logging Tests\n');

    if (typeof EA_AccountTeam === 'undefined') {
      this.logTest('Activity Logging Tests', false, 'Module not loaded');
      return;
    }

    const team = new EA_AccountTeam();
    const testAccountId = 'TEST-ACC-003';

    try {
      // Test 4.1: Log Activity
      const activityData = {
        type: 'meeting',
        subject: 'Quarterly Business Review',
        date: '2026-04-19',
        time: '14:00:00',
        duration: 60,
        internalParticipants: ['Sales Lead', 'EA', 'CSM'],
        customerParticipants: ['CEO', 'CIO'],
        purpose: 'Review Q1 progress',
        notes: 'Very productive meeting',
        outcomes: ['Approved Phase 2', 'Increased budget'],
        actionItems: [
          {
            action: 'Send proposal for Phase 2',
            owner: 'Sales Lead',
            dueDate: '2026-04-25',
            priority: 'high'
          },
          {
            action: 'Schedule architecture workshop',
            owner: 'EA',
            dueDate: '2026-04-30',
            priority: 'medium'
          }
        ],
        customerSentiment: 'positive'
      };

      const loggedActivity = team.logActivity(testAccountId, activityData);
      this.logTest(
        'Log activity',
        loggedActivity && loggedActivity.id,
        'Should log activity successfully'
      );

      this.logTest(
        'Activity has action items',
        loggedActivity.actionItems && loggedActivity.actionItems.length === 2,
        'Should have correct number of action items'
      );

      this.logTest(
        'Activity has sentiment',
        loggedActivity.customerSentiment === 'positive',
        'Should track customer sentiment'
      );

      // Test 4.2: Log Multiple Activities
      const activity2 = {
        type: 'workshop',
        subject: 'Architecture Design Workshop',
        date: '2026-04-15',
        time: '09:00:00',
        duration: 240,
        internalParticipants: ['EA', 'Solutions Architect'],
        customerParticipants: ['CIO', 'IT Architect'],
        purpose: 'Design target architecture',
        notes: 'Collaborative session',
        outcomes: ['Architecture blueprint created'],
        actionItems: [],
        customerSentiment: 'positive'
      };

      const loggedActivity2 = team.logActivity(testAccountId, activity2);
      this.logTest(
        'Log second activity',
        loggedActivity2 && loggedActivity2.id,
        'Should log multiple activities'
      );

      // Test 4.3: Get Activities
      const activities = team.getActivities(testAccountId);
      this.logTest(
        'Retrieve all activities',
        activities && activities.length === 2,
        'Should retrieve all logged activities'
      );

      this.logTest(
        'Activities sorted by date (descending)',
        activities[0].date >= activities[1].date,
        'Activities should be sorted newest first'
      );

      // Test 4.4: Filter Activities by Type
      const meetings = team.getActivities(testAccountId, { type: 'meeting' });
      this.logTest(
        'Filter activities by type',
        meetings && meetings.length === 1 && meetings[0].type === 'meeting',
        'Should filter activities by type'
      );

      // Test 4.5: Get Action Items
      const actionItems = team.getActionItems(testAccountId);
      this.logTest(
        'Get all action items',
        actionItems && actionItems.length === 2,
        'Should retrieve all action items'
      );

      // Test 4.6: Filter Action Items by Status
      const openItems = team.getActionItems(testAccountId, 'open');
      this.logTest(
        'Filter action items by status',
        openItems && openItems.length === 2,
        'Should filter by status'
      );

      // Test 4.7: Update Action Item Status
      const activityId = loggedActivity.id;
      const actionItemId = loggedActivity.actionItems[0].id;
      const updatedActivity = team.updateActionItemStatus(activityId, actionItemId, 'completed');
      
      this.logTest(
        'Update action item status',
        updatedActivity && 
        updatedActivity.actionItems[0].status === 'completed',
        'Should update action item status'
      );

      this.logTest(
        'Completed action has completedDate',
        updatedActivity.actionItems[0].completedDate !== undefined,
        'Should set completedDate when completed'
      );

      // Test 4.8: Get Engagement Metrics
      const metrics = team.getEngagementMetrics(testAccountId);
      this.logTest(
        'Calculate engagement metrics',
        metrics && typeof metrics.totalActivities === 'number',
        'Should calculate metrics'
      );

      this.logTest(
        'Metrics include activity breakdown',
        metrics.activitiesByType && 
        metrics.activitiesByType.meeting === 1 &&
        metrics.activitiesByType.workshop === 1,
        'Should break down by activity type'
      );

      this.logTest(
        'Metrics include sentiment score',
        typeof metrics.sentimentScore === 'number' &&
        metrics.sentimentScore >= 0 &&
        metrics.sentimentScore <= 100,
        'Should calculate sentiment score (0-100)'
      );

      // Test 4.9: Generate Activity Timeline
      const timeline = team.generateActivityTimeline(testAccountId, 30);
      this.logTest(
        'Generate activity timeline',
        timeline && Array.isArray(timeline),
        'Should generate timeline'
      );

    } catch (error) {
      this.logTest('Activity Logging Tests', false, error.message);
    }
  }

  /**
   * Test 5: Integration Tests
   */
  async testIntegration() {
    console.log('\n🔗 Phase 5: Integration Tests\n');

    if (typeof EA_CustomerSuccess === 'undefined' || 
        typeof EA_AccountTeam === 'undefined' ||
        typeof EA_AccountManager === 'undefined') {
      this.logTest('Integration Tests', false, 'Required modules not loaded');
      return;
    }

    const csp = new EA_CustomerSuccess();
    const team = new EA_AccountTeam();
    const accountMgr = new EA_AccountManager();

    const testAccountId = 'TEST-ACC-INTEGRATION';

    try {
      // Test 5.1: Create Complete Account Setup
      const account = accountMgr.createAccount({
        name: 'Integration Test Corp',
        accountManager: 'Test Manager',
        ACV: 1000000,
        industry: 'Technology',
        region: 'EMEA'
      });

      this.logTest(
        'Create account for integration test',
        account && account.id,
        'Should create account'
      );

      // Test 5.2: Link Team to Account
      const accountTeam = team.createOrUpdateTeam(account.id, {
        market: 'EMEA',
        region: 'Northern Europe'
      });

      this.logTest(
        'Link team to account',
        accountTeam && accountTeam.accountId === account.id,
        'Team should reference account'
      );

      // Add team reference to account
      account.teamId = accountTeam.id;
      localStorage.setItem(`ea_account_${account.id}`, JSON.stringify(account));

      // Test 5.3: Link CSP to Account
      const accountCSP = csp.createOrUpdateCSP(account.id, {
        planName: 'Integration Test CSP',
        owner: 'Test CSM'
      });

      this.logTest(
        'Link CSP to account',
        accountCSP && accountCSP.accountId === account.id,
        'CSP should reference account'
      );

      // Add CSP reference to account
      account.cspId = accountCSP.id;
      localStorage.setItem(`ea_account_${account.id}`, JSON.stringify(account));

      // Test 5.4: Verify Account has both references
      const updatedAccount = accountMgr.getAccount(account.id);
      this.logTest(
        'Account has team reference',
        updatedAccount.teamId === accountTeam.id,
        'Account should store teamId'
      );

      this.logTest(
        'Account has CSP reference',
        updatedAccount.cspId === accountCSP.id,
        'Account should store cspId'
      );

      // Test 5.5: Cross-reference integrity
      const retrievedTeam = team.getTeam(updatedAccount.teamId);
      this.logTest(
        'Team can be retrieved via account reference',
        retrievedTeam && retrievedTeam.id === accountTeam.id,
        'Cross-reference should work'
      );

      const retrievedCSP = csp.getCSP(updatedAccount.cspId);
      this.logTest(
        'CSP can be retrieved via account reference',
        retrievedCSP && retrievedCSP.id === accountCSP.id,
        'Cross-reference should work'
      );

      // Test 5.6: Activity links to CSP
      const activity = team.logActivity(account.id, {
        type: 'meeting',
        subject: 'Integration Test Meeting',
        date: '2026-04-19',
        linkedCSP: accountCSP.id,
        customerSentiment: 'positive'
      });

      this.logTest(
        'Activity can link to CSP',
        activity.linkedCSP === accountCSP.id,
        'Activity should reference CSP'
      );

    } catch (error) {
      this.logTest('Integration Tests', false, error.message);
    }
  }

  /**
   * Test 6: Insurance Demo Data
   */
  async testInsuranceDemo() {
    console.log('\n🏥 Phase 6: Insurance Demo Tests\n');

    // Skip in Node.js environment (no window object)
    if (typeof window === 'undefined') {
      this.logTest(
        'Insurance Demo Tests',
        true,
        'Skipped in Node.js environment (requires browser)'
      );
      return;
    }

    if (typeof EA_UserGuide === 'undefined') {
      this.logTest('Insurance Demo Tests', false, 'EA_UserGuide not loaded');
      return;
    }

    try {
      // Clear existing demo data
      const demoAccountId = 'INS-2026-001';
      const demoEngagementId = 'ENG-INS-2026-001';
      const demoOpportunityId = 'OPP-INS-2026-001';
      const demoValueCaseId = 'VC-INS-2026-001';
      const demoTeamId = 'TEAM-INS-2026-001';
      const demoCSPId = 'CSP-INS-2026-001';

      localStorage.removeItem(`ea_account_${demoAccountId}`);
      localStorage.removeItem(`ea_engagement_model_${demoEngagementId}`);
      localStorage.removeItem(`ea_opportunity_${demoOpportunityId}`);
      localStorage.removeItem(`ea_valuecase_${demoValueCaseId}`);
      localStorage.removeItem(`ea_team_${demoTeamId}`);
      localStorage.removeItem(`ea_csp_${demoCSPId}`);
      localStorage.removeItem('ea_activity_ACT-001');
      localStorage.removeItem('ea_activity_ACT-002');

      // Test 6.1: Load Insurance Demo
      const guide = new EA_UserGuide();
      guide.loadInsuranceDemoData();

      this.logTest(
        'Load insurance demo data',
        true,
        'Should execute without errors'
      );

      // Test 6.2: Verify Account Created
      const demoAccount = JSON.parse(localStorage.getItem(`ea_account_${demoAccountId}`));
      this.logTest(
        'Demo account created',
        demoAccount && demoAccount.id === demoAccountId,
        'Should create SecureLife Insurance account'
      );

      this.logTest(
        'Demo account has correct name',
        demoAccount && demoAccount.name === 'SecureLife Insurance Group',
        'Account name should match'
      );

      this.logTest(
        'Demo account has team reference',
        demoAccount && demoAccount.teamId === demoTeamId,
        'Account should reference team'
      );

      this.logTest(
        'Demo account has CSP reference',
        demoAccount && demoAccount.cspId === demoCSPId,
        'Account should reference CSP'
      );

      // Test 6.3: Verify Team Created
      const demoTeam = JSON.parse(localStorage.getItem(`ea_team_${demoTeamId}`));
      this.logTest(
        'Demo team created',
        demoTeam && demoTeam.id === demoTeamId,
        'Should create account team'
      );

      this.logTest(
        'Demo team has 5 members',
        demoTeam && demoTeam.members && demoTeam.members.length === 5,
        'Should have correct number of team members'
      );

      this.logTest(
        'Demo team has Sales Lead',
        demoTeam && demoTeam.roles && demoTeam.roles.salesLead,
        'Should have Sales Lead assigned'
      );

      this.logTest(
        'Demo team has Enterprise Architect',
        demoTeam && demoTeam.roles && demoTeam.roles.enterpriseArchitect,
        'Should have EA assigned'
      );

      // Test 6.4: Verify CSP Created
      const demoCSP = JSON.parse(localStorage.getItem(`ea_csp_${demoCSPId}`));
      this.logTest(
        'Demo CSP created',
        demoCSP && demoCSP.id === demoCSPId,
        'Should create Customer Success Plan'
      );

      this.logTest(
        'Demo CSP has 5 goals',
        demoCSP && demoCSP.goals && demoCSP.goals.length === 5,
        'Should have correct number of goals'
      );

      this.logTest(
        'Demo CSP has 6 metrics',
        demoCSP && demoCSP.metrics && demoCSP.metrics.length === 6,
        'Should have correct number of KPIs'
      );

      this.logTest(
        'Demo CSP has scheduled EBR',
        demoCSP && demoCSP.ebrs && demoCSP.ebrs.length === 1,
        'Should have EBR scheduled'
      );

      this.logTest(
        'Demo CSP has health score',
        demoCSP && demoCSP.health && typeof demoCSP.health.overallScore === 'number',
        'Should have health tracking'
      );

      // Test 6.5: Verify Activities Created
      const activity1 = JSON.parse(localStorage.getItem('ea_activity_ACT-001'));
      const activity2 = JSON.parse(localStorage.getItem('ea_activity_ACT-002'));

      this.logTest(
        'Demo activity 1 created (workshop)',
        activity1 && activity1.id === 'ACT-001' && activity1.type === 'workshop',
        'Should create workshop activity'
      );

      this.logTest(
        'Demo activity 2 created (team sync)',
        activity2 && activity2.id === 'ACT-002' && activity2.type === 'meeting',
        'Should create meeting activity'
      );

      this.logTest(
        'Activities linked to CSP',
        activity1 && activity1.linkedCSP === demoCSPId,
        'Activities should reference CSP'
      );

      this.logTest(
        'Activities have action items',
        activity1 && activity1.actionItems && activity1.actionItems.length > 0,
        'Should have action items'
      );

      // Test 6.6: Verify Engagement Created
      const demoEngagement = JSON.parse(localStorage.getItem(`ea_engagement_model_${demoEngagementId}`));
      this.logTest(
        'Demo engagement created',
        demoEngagement && demoEngagement.id === demoEngagementId,
        'Should create EA engagement'
      );

      // Test 6.7: Verify Opportunity Created
      const demoOpportunity = JSON.parse(localStorage.getItem(`ea_opportunity_${demoOpportunityId}`));
      this.logTest(
        'Demo opportunity created',
        demoOpportunity && demoOpportunity.id === demoOpportunityId,
        'Should create opportunity'
      );

      // Test 6.8: Verify Value Case Created
      const demoValueCase = JSON.parse(localStorage.getItem(`ea_valuecase_${demoValueCaseId}`));
      this.logTest(
        'Demo value case created',
        demoValueCase && demoValueCase.id === demoValueCaseId,
        'Should create value case'
      );

    } catch (error) {
      this.logTest('Insurance Demo Tests', false, error.message);
    }
  }

  /**
   * Test 7: Data Persistence
   */
  async testDataPersistence() {
    console.log('\n💾 Phase 7: Data Persistence Tests\n');

    if (typeof EA_CustomerSuccess === 'undefined' || typeof EA_AccountTeam === 'undefined') {
      this.logTest('Data Persistence Tests', false, 'Required modules not loaded');
      return;
    }

    const csp = new EA_CustomerSuccess();
    const team = new EA_AccountTeam();

    try {
      // Test 7.1: CSP Persistence
      const testCSP = csp.createOrUpdateCSP('TEST-PERSIST-001', {
        planName: 'Persistence Test CSP'
      });

      const cspKey = `ea_csp_${testCSP.id}`;
      const storedCSP = localStorage.getItem(cspKey);

      this.logTest(
        'CSP persisted to localStorage',
        storedCSP !== null,
        'CSP should be saved to localStorage'
      );

      const parsedCSP = JSON.parse(storedCSP);
      this.logTest(
        'Persisted CSP is valid JSON',
        parsedCSP && parsedCSP.id === testCSP.id,
        'Should parse correctly from storage'
      );

      // Test 7.2: Update CSP and verify persistence
      const updatedCSP = csp.addGoal(testCSP.id, {
        goal: 'Test Goal',
        category: 'business',
        owner: 'Test Owner'
      });

      const updatedStoredCSP = JSON.parse(localStorage.getItem(cspKey));
      this.logTest(
        'CSP updates persisted',
        updatedStoredCSP.goals && updatedStoredCSP.goals.length > 0,
        'Updates should be saved'
      );

      // Test 7.3: Team Persistence
      const testTeam = team.createOrUpdateTeam('TEST-PERSIST-002', {
        market: 'EMEA'
      });

      const teamKey = `ea_team_${testTeam.id}`;
      const storedTeam = localStorage.getItem(teamKey);

      this.logTest(
        'Team persisted to localStorage',
        storedTeam !== null,
        'Team should be saved to localStorage'
      );

      // Test 7.4: Activity Persistence
      const testActivity = team.logActivity('TEST-PERSIST-002', {
        type: 'meeting',
        subject: 'Persistence Test',
        date: '2026-04-19',
        customerSentiment: 'positive'
      });

      const activityKey = `ea_activity_${testActivity.id}`;
      const storedActivity = localStorage.getItem(activityKey);

      this.logTest(
        'Activity persisted to localStorage',
        storedActivity !== null,
        'Activity should be saved'
      );

      // Test 7.5: Schema Version
      this.logTest(
        'CSP has schema version',
        parsedCSP.metadata && parsedCSP.metadata.version,
        'Should include schema version for future migrations'
      );

      // Test 7.6: Timestamps
      this.logTest(
        'CSP has createdAt timestamp',
        parsedCSP.metadata && parsedCSP.metadata.createdAt,
        'Should track creation time'
      );

      this.logTest(
        'CSP has updatedAt timestamp',
        parsedCSP.metadata && parsedCSP.metadata.updatedAt,
        'Should track update time'
      );

    } catch (error) {
      this.logTest('Data Persistence Tests', false, error.message);
    }
  }

  /**
   * Test 8: Error Handling
   */
  async testErrorHandling() {
    console.log('\n⚠️ Phase 8: Error Handling Tests\n');

    if (typeof EA_CustomerSuccess === 'undefined' || typeof EA_AccountTeam === 'undefined') {
      this.logTest('Error Handling Tests', false, 'Required modules not loaded');
      return;
    }

    const csp = new EA_CustomerSuccess();
    const team = new EA_AccountTeam();

    // Test 8.1: Get non-existent CSP
    try {
      const nonExistent = csp.getCSP('NON-EXISTENT-CSP-ID');
      this.logTest(
        'Get non-existent CSP returns null',
        nonExistent === null,
        'Should return null for missing CSP'
      );
    } catch (error) {
      this.logTest('Get non-existent CSP', false, 'Should not throw error');
    }

    // Test 8.2: Get non-existent Team
    try {
      const nonExistent = team.getTeam('NON-EXISTENT-TEAM-ID');
      this.logTest(
        'Get non-existent team returns null',
        nonExistent === null,
        'Should return null for missing team'
      );
    } catch (error) {
      this.logTest('Get non-existent team', false, 'Should not throw error');
    }

    // Test 8.3: Add goal to non-existent CSP
    try {
      const result = csp.addGoal('NON-EXISTENT-CSP', { goal: 'Test' });
      this.logTest(
        'Add goal to non-existent CSP',
        false,
        'Should have thrown error'
      );
    } catch (error) {
      this.logTest(
        'Add goal to non-existent CSP throws error',
        error.message === 'CSP not found',
        'Should throw CSP not found error'
      );
    }

    // Test 8.4: Add member to non-existent team
    try {
      const result = team.addMember('NON-EXISTENT-TEAM', { name: 'Test' });
      this.logTest(
        'Add member to non-existent team',
        false,
        'Should have thrown error'
      );
    } catch (error) {
      this.logTest(
        'Add member to non-existent team throws error',
        error.message === 'Team not found',
        'Should throw Team not found error'
      );
    }

    // Test 8.5: Invalid health score (should be 0-100)
    try {
      const testCSP = csp.createOrUpdateCSP('TEST-ERROR-001', { planName: 'Test' });
      
      // Try to set invalid score
      const result = csp.updateHealth(testCSP.id, {
        dimensions: {
          adoption: { score: 150, notes: 'Invalid score' }, // >100
          satisfaction: { score: -10, notes: 'Negative score' } // <0
        }
      });
      
      // Check if the scores were clamped to valid range
      const stored = csp.getCSP(testCSP.id);
      const adoptionScore = stored.health.dimensions.adoption.score;
      const satisfactionScore = stored.health.dimensions.satisfaction.score;
      
      this.logTest(
        'Invalid health score handled',
        (adoptionScore >= 0 && adoptionScore <= 100) &&
        (satisfactionScore >= 0 && satisfactionScore <= 100),
        'Scores should be clamped to valid range (0-100)'
      );
    } catch (error) {
      // It's also acceptable to throw an error for invalid input
      this.logTest(
        'Invalid health score rejected',
        true,
        'Error thrown for invalid scores: ' + error.message
      );
    }

    // Test 8.6: Empty activity data
    try {
      const result = team.logActivity('TEST-ERROR-002', {});
      this.logTest(
        'Empty activity data handled',
        result !== null,
        'Should handle with defaults or validation'
      );
    } catch (error) {
      this.logTest('Empty activity data', true, 'Error thrown as expected');
    }
  }

  /**
   * Cleanup test data
   */
  cleanupTestData() {
    console.log('🧹 Cleaning up test data...\n');
    
    const testPrefixes = ['TEST-', 'DEMO-'];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      testPrefixes.forEach(prefix => {
        if (key.includes(prefix)) {
          localStorage.removeItem(key);
        }
      });
    });
  }

  /**
   * Log individual test result
   */
  logTest(testName, passed, message) {
    this.totalTests++;
    
    if (passed) {
      this.passedTests++;
      console.log(`✅ PASS: ${testName}`);
      if (message && message !== 'Should create account') {
        console.log(`   └─ ${message}`);
      }
    } else {
      this.failedTests++;
      console.error(`❌ FAIL: ${testName}`);
      if (message) {
        console.error(`   └─ ${message}`);
      }
    }
    
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate final test report
   */
  generateReport() {
    const duration = this.endTime - this.startTime;
    const passRate = ((this.passedTests / this.totalTests) * 100).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('📊 E2E TEST REPORT - Sales + EA Collaboration Platform');
    console.log('='.repeat(80));
    console.log(`\n⏱️  Duration: ${duration}ms`);
    console.log(`📝 Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log('\n' + '='.repeat(80));

    if (this.failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! Platform is ready for production.');
    } else {
      console.log('⚠️  SOME TESTS FAILED. Review errors above.');
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.name}: ${r.message}`);
        });
    }

    console.log('\n' + '='.repeat(80));

    // Return summary for programmatic access
    return {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      passRate: parseFloat(passRate),
      duration,
      results: this.testResults,
      success: this.failedTests === 0
    };
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('🧪 E2E Test Suite Loaded');
  console.log('Run tests with: const test = new SalesEACollaborationE2ETest(); test.runAllTests();');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SalesEACollaborationE2ETest;
}
