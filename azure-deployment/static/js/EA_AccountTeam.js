/**
 * EA_AccountTeam.js
 * Cross-Functional Account Team Management
 * 
 * Tracks:
 * - Account team members (Sales, EA, CSM, Solutions, Delivery)
 * - Ongoing activities and touchpoints
 * - Action items and follow-ups
 * - Meeting notes and collaboration
 * - Market/region coordination
 * 
 * @version 1.0
 * @date 2026-04-19
 */

class EA_AccountTeam {
  constructor() {
    this.storagePrefix = 'ea_team_';
    this.activityPrefix = 'ea_activity_';
  }

  /**
   * Create or update Account Team
   * @param {string} accountId - Associated account ID
   * @param {object} teamData - Team details
   * @returns {object} - Saved team
   */
  createOrUpdateTeam(accountId, teamData) {
    const team = {
      id: teamData.id || this.generateId('TEAM'),
      accountId: accountId,
      
      // Team Members
      members: teamData.members || [
        // {
        //   id, name, role, email, phone,
        //   primaryContact: boolean,
        //   responsibilities: [],
        //   availability: 'full-time' | 'part-time',
        //   market: 'EMEA' | 'APAC' | 'Americas'
        // }
      ],
      
      // Team Roles Structure
      roles: teamData.roles || {
        salesLead: null, // Primary sales owner
        enterpriseArchitect: null, // EA lead
        customerSuccessManager: null, // CSM
        solutionsArchitect: null, // Technical solutions
        deliveryManager: null, // Implementation lead
        accountExecutive: null, // Senior sales exec
        technicalAccountManager: null, // Technical support
        productSpecialist: [], // Product experts (can be multiple)
        partners: [] // Partner resources
      },
      
      // Market/Region
      market: teamData.market || 'EMEA', // EMEA, APAC, Americas, etc.
      region: teamData.region || '', // Specific region within market
      
      // Team Dynamics
      teamHealth: teamData.teamHealth || {
        collaborationScore: 0, // 0-100
        communicationFrequency: 'weekly', // daily, weekly, bi-weekly, monthly
        lastSyncMeeting: null,
        nextSyncMeeting: null,
        issues: [] // { issue, severity, resolution }
      },
      
      // Working Agreements
      workingAgreements: teamData.workingAgreements || {
        meetingCadence: 'weekly', // How often team syncs
        communicationChannel: 'Teams', // Primary channel (Teams, Slack, Email)
        escalationPath: [], // Who to escalate to in order
        decisionMakingProcess: 'consensus', // consensus, voting, lead-decides
        documentationLocation: '', // Where docs are stored
        toolsUsed: ['EA Platform', 'CRM', 'Email'] // Tools for collaboration
      },
      
      // Metadata
      metadata: {
        createdAt: teamData.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: teamData.metadata?.createdBy || 'System'
      }
    };

    // Save to localStorage
    localStorage.setItem(`${this.storagePrefix}${team.id}`, JSON.stringify(team));
    
    // Update account reference
    this.updateAccountTeamReference(accountId, team.id);
    
    console.log(`✅ Account Team saved: ${team.id} for account ${accountId}`);
    return team;
  }

  /**
   * Get Account Team by ID
   * @param {string} teamId
   * @returns {object|null}
   */
  getTeam(teamId) {
    const data = localStorage.getItem(`${this.storagePrefix}${teamId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get Account Team by Account ID
   * @param {string} accountId
   * @returns {object|null}
   */
  getTeamByAccount(accountId) {
    // Search through all teams to find one with matching accountId
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        try {
          const team = JSON.parse(localStorage.getItem(key));
          if (team.accountId === accountId) {
            return team;
          }
        } catch (e) {
          console.error(`Error parsing team from ${key}:`, e);
        }
      }
    }
    return null;
  }

  /**

  /**
   * Add Team Member
   * @param {string} teamId
   * @param {object} memberData
   * @returns {object}
   */
  addMember(teamId, memberData) {
    const team = this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    const member = {
      id: this.generateId('MEMBER'),
      name: memberData.name,
      role: memberData.role, // 'Sales Lead', 'Enterprise Architect', 'CSM', etc.
      email: memberData.email || '',
      phone: memberData.phone || '',
      primaryContact: memberData.primaryContact || false,
      responsibilities: memberData.responsibilities || [],
      availability: memberData.availability || 'full-time',
      market: memberData.market || team.market,
      startDate: memberData.startDate || new Date().toISOString().split('T')[0],
      endDate: memberData.endDate || null, // For temporary team members
      notes: memberData.notes || ''
    };

    // If primary contact, unset others
    if (member.primaryContact) {
      team.members.forEach(m => m.primaryContact = false);
    }

    team.members.push(member);
    
    // Auto-assign to role based on member.role
    const roleMap = {
      'Sales Lead': 'salesLead',
      'Enterprise Architect': 'enterpriseArchitect',
      'Customer Success Manager': 'customerSuccessManager',
      'Solutions Architect': 'solutionsArchitect',
      'Delivery Manager': 'deliveryManager',
      'Account Executive': 'accountExecutive',
      'Technical Account Manager': 'technicalAccountManager',
      'Product Specialist': 'productSpecialist'
    };
    
    const roleKey = roleMap[member.role];
    if (roleKey && team.roles[roleKey] !== undefined) {
      if (Array.isArray(team.roles[roleKey])) {
        team.roles[roleKey].push(member.id);
      } else {
        team.roles[roleKey] = member.id;
      }
    }

    const updatedTeam = this.createOrUpdateTeam(team.accountId, team);
    return updatedTeam;
  }

  /**
   * Remove Team Member
   * @param {string} teamId
   * @param {string} memberId
   */
  removeMember(teamId, memberId) {
    const team = this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    team.members = team.members.filter(m => m.id !== memberId);
    
    // Remove from role assignments
    Object.keys(team.roles).forEach(role => {
      if (Array.isArray(team.roles[role])) {
        team.roles[role] = team.roles[role].filter(id => id !== memberId);
      } else if (team.roles[role] === memberId) {
        team.roles[role] = null;
      }
    });

    const updatedTeam = this.createOrUpdateTeam(team.accountId, team);
    return updatedTeam;
  }

  /**
   * Log Activity (meeting, call, email, etc.)
   * @param {string} accountId
   * @param {object} activityData
   * @returns {object}
   */
  logActivity(accountId, activityData) {
    const activity = {
      id: this.generateId('ACT'),
      accountId: accountId,
      
      // Activity Details
      type: activityData.type || 'meeting', // meeting, call, email, workshop, presentation, demo, other
      subject: activityData.subject || 'Account Activity',
      date: activityData.date || new Date().toISOString().split('T')[0],
      time: activityData.time || new Date().toTimeString().split(' ')[0],
      duration: activityData.duration || 60, // minutes
      
      // Participants
      internalParticipants: activityData.internalParticipants || [], // Team members
      customerParticipants: activityData.customerParticipants || [], // Customer stakeholders
      
      // Content
      purpose: activityData.purpose || '', // Why we had this activity
      agenda: activityData.agenda || [],
      notes: activityData.notes || '', // What was discussed
      outcomes: activityData.outcomes || [], // Key decisions/outcomes
      actionItems: (activityData.actionItems || []).map(item => ({
        id: item.id || this.generateId('AI'),
        action: item.action,
        owner: item.owner,
        dueDate: item.dueDate,
        status: item.status || 'open', // open, in-progress, completed, cancelled
        priority: item.priority || 'medium', // low, medium, high, critical
        completedDate: item.completedDate || null
      })),
      
      // Follow-up
      nextSteps: activityData.nextSteps || [],
      followUpRequired: activityData.followUpRequired || false,
      followUpDate: activityData.followUpDate || null,
      
      // Links
      linkedEngagement: activityData.linkedEngagement || null,
      linkedOpportunity: activityData.linkedOpportunity || null,
      linkedCSP: activityData.linkedCSP || null,
      
      // Attachments
      attachments: activityData.attachments || [], // Links to docs, recordings, etc.
      
      // Sentiment
      customerSentiment: activityData.customerSentiment || 'neutral', // positive, neutral, negative
      
      // Metadata
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: activityData.metadata?.createdBy || 'System',
        lastUpdated: new Date().toISOString()
      }
    };

    // Save to localStorage
    localStorage.setItem(`${this.activityPrefix}${activity.id}`, JSON.stringify(activity));
    
    console.log(`✅ Activity logged: ${activity.id} for account ${accountId}`);
    return activity;
  }

  /**
   * Get Activity by ID
   * @param {string} activityId
   * @returns {object|null}
   */
  getActivity(activityId) {
    const data = localStorage.getItem(`${this.activityPrefix}${activityId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get all activities for an account
   * @param {string} accountId
   * @param {object} filters - Optional filters (type, dateRange, participant)
   * @returns {array}
   */
  getActivities(accountId, filters = {}) {
    const activities = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.activityPrefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          const activity = JSON.parse(data);
          if (activity.accountId === accountId) {
            activities.push(activity);
          }
        }
      }
    }

    // Apply filters
    let filtered = activities;

    if (filters.type) {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(a => a.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(a => a.date <= filters.dateTo);
    }

    if (filters.participant) {
      filtered = filtered.filter(a => 
        a.internalParticipants.includes(filters.participant) ||
        a.customerParticipants.includes(filters.participant)
      );
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB - dateA;
    });

    return filtered;
  }

  /**
   * Get all action items across activities for an account
   * @param {string} accountId
   * @param {string} status - Optional filter by status (open, in-progress, completed, cancelled)
   * @returns {array}
   */
  getActionItems(accountId, status = null) {
    const activities = this.getActivities(accountId);
    const allActionItems = [];

    activities.forEach(activity => {
      if (activity.actionItems && activity.actionItems.length > 0) {
        activity.actionItems.forEach(item => {
          allActionItems.push({
            ...item,
            activityId: activity.id,
            activitySubject: activity.subject,
            activityDate: activity.date
          });
        });
      }
    });

    // Filter by status if provided
    let filteredItems = status ? allActionItems.filter(item => item.status === status) : allActionItems;

    // Sort by due date
    filteredItems.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return filteredItems;
  }

  /**
   * Update Action Item Status
   * @param {string} activityId
   * @param {string} actionItemId
   * @param {string} newStatus
   * @returns {object}
   */
  updateActionItemStatus(activityId, actionItemId, newStatus) {
    const activity = this.getActivity(activityId);
    if (!activity) throw new Error('Activity not found');

    const actionItem = activity.actionItems.find(ai => ai.id === actionItemId);
    if (!actionItem) throw new Error('Action item not found');

    actionItem.status = newStatus;
    if (newStatus === 'completed') {
      actionItem.completedDate = new Date().toISOString().split('T')[0];
    }

    activity.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${this.activityPrefix}${activityId}`, JSON.stringify(activity));

    return activity;
  }

  /**
   * Generate Activity Timeline for Account
   * @param {string} accountId
   * @param {number} days - Number of days to include (default: 90)
   * @returns {array}
   */
  generateActivityTimeline(accountId, days = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const activities = this.getActivities(accountId, { dateFrom: cutoffStr });
    
    // Group by month
    const timeline = {};
    
    activities.forEach(activity => {
      const monthKey = activity.date.substring(0, 7); // YYYY-MM
      if (!timeline[monthKey]) {
        timeline[monthKey] = {
          month: monthKey,
          activities: [],
          summary: {
            total: 0,
            meetings: 0,
            calls: 0,
            emails: 0,
            workshops: 0,
            presentations: 0
          }
        };
      }
      
      timeline[monthKey].activities.push(activity);
      timeline[monthKey].summary.total++;
      timeline[monthKey].summary[activity.type + 's'] = 
        (timeline[monthKey].summary[activity.type + 's'] || 0) + 1;
    });

    // Convert to array and sort by month
    return Object.values(timeline).sort((a, b) => b.month.localeCompare(a.month));
  }

  /**
   * Get Account Engagement Metrics
   * @param {string} accountId
   * @param {number} days - Period to analyze (default: 90)
   * @returns {object}
   */
  getEngagementMetrics(accountId, days = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const activities = this.getActivities(accountId, { dateFrom: cutoffStr });
    const actionItems = this.getActionItems(accountId);
    
    // Calculate metrics
    const totalActivities = activities.length;
    const activitiesByType = {};
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let totalDuration = 0;
    
    activities.forEach(activity => {
      activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
      sentimentCounts[activity.customerSentiment]++;
      totalDuration += activity.duration || 0;
    });

    // Calculate touchpoint frequency
    const daysWithActivity = new Set(activities.map(a => a.date)).size;
    const avgDaysBetweenTouchpoints = daysWithActivity > 0 ? days / daysWithActivity : 0;

    // Action items metrics
    const totalActionItems = actionItems.length;
    const completedActionItems = actionItems.filter(ai => ai.status === 'completed').length;
    const overdueActionItems = actionItems.filter(ai => 
      ai.status !== 'completed' && 
      ai.dueDate && 
      new Date(ai.dueDate) < new Date()
    ).length;

    return {
      period: `Last ${days} days`,
      totalActivities,
      activitiesByType,
      totalHoursEngaged: Math.round(totalDuration / 60 * 10) / 10,
      averageDaysBetweenTouchpoints: Math.round(avgDaysBetweenTouchpoints),
      sentimentScore: this.calculateSentimentScore(sentimentCounts),
      sentimentBreakdown: sentimentCounts,
      actionItems: {
        total: totalActionItems,
        completed: completedActionItems,
        completionRate: totalActionItems > 0 
          ? Math.round((completedActionItems / totalActionItems) * 100)
          : 0,
        overdue: overdueActionItems
      },
      engagementTrend: this.calculateEngagementTrend(activities, days)
    };
  }

  /**
   * Get Cross-Market Insights
   * @returns {object} - Insights across all markets/regions
   */
  getCrossMarketInsights() {
    const allTeams = this.getAllTeams();
    
    const insights = {
      totalMarkets: new Set(allTeams.map(t => t.market)).size,
      marketBreakdown: {},
      bestPractices: [],
      challenges: []
    };

    // Group by market
    allTeams.forEach(team => {
      if (!insights.marketBreakdown[team.market]) {
        insights.marketBreakdown[team.market] = {
          accounts: 0,
          teamMembers: 0,
          collaborationScore: 0
        };
      }
      
      insights.marketBreakdown[team.market].accounts++;
      insights.marketBreakdown[team.market].teamMembers += team.members.length;
      insights.marketBreakdown[team.market].collaborationScore += team.teamHealth.collaborationScore || 0;
    });

    // Calculate averages
    Object.keys(insights.marketBreakdown).forEach(market => {
      const data = insights.marketBreakdown[market];
      data.avgTeamSize = Math.round(data.teamMembers / data.accounts);
      data.avgCollaborationScore = Math.round(data.collaborationScore / data.accounts);
    });

    return insights;
  }

  /**
   * Generate Team Sync Agenda
   * @param {string} teamId
   * @returns {object}
   */
  generateTeamSyncAgenda(teamId) {
    const team = this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    const account = this.getAccount(team.accountId);
    const recentActivities = this.getActivities(team.accountId, { 
      dateFrom: this.getDateDaysAgo(7) 
    });
    const openActionItems = this.getActionItems(team.accountId, 'open');
    const inProgressActionItems = this.getActionItems(team.accountId, 'in-progress');

    return {
      title: `Team Sync - ${account?.name || 'Account'}`,
      date: new Date().toISOString().split('T')[0],
      attendees: team.members.map(m => m.name),
      
      agenda: [
        {
          topic: 'Recent Activity Review',
          duration: 10,
          items: recentActivities.map(a => `${a.type}: ${a.subject} (${a.date})`)
        },
        {
          topic: 'Action Items Status',
          duration: 15,
          items: [
            `${openActionItems.length} open action items`,
            `${inProgressActionItems.length} in progress`,
            ...openActionItems.slice(0, 5).map(ai => `• ${ai.action} (${ai.owner})`)
          ]
        },
        {
          topic: 'Account Health & Risks',
          duration: 10,
          items: ['Review current health score', 'Discuss any new risks or concerns']
        },
        {
          topic: 'Upcoming Activities',
          duration: 10,
          items: ['Plan next touchpoints', 'Prepare for upcoming meetings/presentations']
        },
        {
          topic: 'Blockers & Support Needed',
          duration: 10,
          items: ['What support does the team need?', 'Any escalations required?']
        },
        {
          topic: 'Next Steps',
          duration: 5,
          items: ['Assign action items', 'Schedule next sync']
        }
      ],
      
      totalDuration: 60,
      
      prework: [
        'Review recent activity log',
        'Update your action items',
        'Prepare any customer feedback or concerns'
      ]
    };
  }

  // ==================== Helper Functions ====================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  updateAccountTeamReference(accountId, teamId) {
    const account = this.getAccount(accountId);
    if (account) {
      account.teamId = teamId;
      localStorage.setItem(`ea_account_${accountId}`, JSON.stringify(account));
    }
  }

  getAccount(accountId) {
    const data = localStorage.getItem(`ea_account_${accountId}`);
    return data ? JSON.parse(data) : null;
  }

  getAllTeams() {
    const teams = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.storagePrefix)) {
        const data = localStorage.getItem(key);
        if (data) teams.push(JSON.parse(data));
      }
    }
    return teams;
  }

  calculateSentimentScore(sentimentCounts) {
    const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
    if (total === 0) return 50;
    
    // Positive = +1, Neutral = 0, Negative = -1
    const score = (
      (sentimentCounts.positive * 1) + 
      (sentimentCounts.neutral * 0) + 
      (sentimentCounts.negative * -1)
    ) / total;
    
    // Convert to 0-100 scale
    return Math.round(((score + 1) / 2) * 100);
  }

  calculateEngagementTrend(activities, days) {
    // Split period in half and compare
    const midpoint = this.getDateDaysAgo(days / 2);
    const recent = activities.filter(a => a.date >= midpoint).length;
    const older = activities.filter(a => a.date < midpoint).length;
    
    if (older === 0) return 'stable';
    const change = ((recent - older) / older) * 100;
    
    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
  }

  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.accountTeam = new EA_AccountTeam();
}
