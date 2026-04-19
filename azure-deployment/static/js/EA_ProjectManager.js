/**
 * EA_ProjectManager.js
 * Project export/import with auto-save functionality
 * Saves complete customer cases as JSON with folder structure
 * 
 * @version 1.0
 * @date April 19, 2026
 */

class EA_ProjectManager {
  constructor() {
    this.accountManager = new EA_AccountManager();
    this.autoSaveInterval = null;
    this.autoSaveEnabled = false;
  }

  /**
   * Export complete project for a customer account
   * Creates comprehensive JSON package with all related data
   * @param {string} accountId
   * @returns {object} Project data package
   */
  exportProject(accountId) {
    console.log(`📦 Exporting project for account: ${accountId}`);

    const account = this.accountManager.getAccount(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Gather all related data
    const projectData = {
      metadata: {
        projectName: account.name,
        accountId: accountId,
        exportDate: new Date().toISOString(),
        exportedBy: 'EA Platform V4',
        version: '2.0',
        industry: account.industry,
        region: account.region
      },
      
      account: account,
      
      opportunities: account.opportunities.map(oppId => {
        try {
          const opp = JSON.parse(localStorage.getItem(`ea_opportunity_${oppId}`));
          return opp;
        } catch (e) {
          console.warn(`⚠️ Opportunity not found: ${oppId}`);
          return null;
        }
      }).filter(o => o !== null),
      
      engagements: account.engagements.map(engId => {
        try {
          const eng = JSON.parse(localStorage.getItem(`ea_engagement_model_${engId}`));
          return eng;
        } catch (e) {
          console.warn(`⚠️ Engagement not found: ${engId}`);
          return null;
        }
      }).filter(e => e !== null),
      
      valueCases: [],
      
      team: this.getAccountTeam(accountId),
      
      customerSuccessPlan: this.getAccountCSP(accountId),
      
      activities: this.getAccountActivities(accountId),
      
      analytics: {
        totalACV: account.ACV,
        pipelineValue: this.calculatePipelineValue(account),
        health: account.health,
        opportunityCount: account.opportunities.length,
        engagementCount: account.engagements.length
      }
    };

    console.log('✅ Project export complete');
    console.log(`   • Account: ${account.name}`);
    console.log(`   • Opportunities: ${projectData.opportunities.length}`);
    console.log(`   • Engagements: ${projectData.engagements.length}`);

    return projectData;
  }

  /**
   * Download project as JSON file
   * @param {string} accountId
   */
  downloadProject(accountId) {
    const projectData = this.exportProject(accountId);
    const account = this.accountManager.getAccount(accountId);
    
    const fileName = `${account.name.replace(/[^a-z0-9]/gi, '_')}_Project_${new Date().toISOString().split('T')[0]}.json`;
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Project downloaded: ${fileName}`);
    this.trackEvent('project_exported', { accountId, fileName });
  }

  /**
   * Import project from JSON file
   * @param {File} file
   * @param {object} options - {overwrite: boolean}
   * @returns {Promise}
   */
  async importProject(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          
          // Validate project structure
          if (!projectData.metadata || !projectData.account) {
            throw new Error('Invalid project file format');
          }
          
          console.log(`📥 Importing project: ${projectData.metadata.projectName}`);
          
          const accountId = projectData.account.id;
          
          // Check if account already exists
          const existing = this.accountManager.getAccount(accountId);
          if (existing && !options.overwrite) {
            throw new Error(`Account ${accountId} already exists. Enable overwrite to replace.`);
          }
          
          // Import account
          localStorage.setItem(`ea_account_${accountId}`, JSON.stringify(projectData.account));
          
          // Import opportunities
          projectData.opportunities.forEach(opp => {
            localStorage.setItem(`ea_opportunity_${opp.id}`, JSON.stringify(opp));
          });
          
          // Import engagements
          projectData.engagements.forEach(eng => {
            localStorage.setItem(`ea_engagement_model_${eng.id}`, JSON.stringify(eng));
          });
          
          // Import team
          if (projectData.team) {
            localStorage.setItem(`ea_team_${projectData.team.id}`, JSON.stringify(projectData.team));
          }
          
          // Import CSP
          if (projectData.customerSuccessPlan) {
            localStorage.setItem(`ea_csp_${projectData.customerSuccessPlan.id}`, JSON.stringify(projectData.customerSuccessPlan));
          }
          
          // Import activities
          if (projectData.activities && Array.isArray(projectData.activities)) {
            projectData.activities.forEach(activity => {
              localStorage.setItem(`ea_activity_${activity.id}`, JSON.stringify(activity));
            });
          }
          
          console.log('✅ Project import complete');
          console.log(`   • Account: ${projectData.account.name}`);
          console.log(`   • Opportunities: ${projectData.opportunities.length}`);
          console.log(`   • Engagements: ${projectData.engagements.length}`);
          
          this.trackEvent('project_imported', { 
            accountId, 
            fileName: file.name,
            opportunityCount: projectData.opportunities.length,
            engagementCount: projectData.engagements.length
          });
          
          resolve({
            success: true,
            accountId: accountId,
            imported: {
              account: 1,
              opportunities: projectData.opportunities.length,
              engagements: projectData.engagements.length,
              team: projectData.team ? 1 : 0,
              csp: projectData.customerSuccessPlan ? 1 : 0
            }
          });
          
        } catch (error) {
          console.error('❌ Import failed:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Enable auto-save for a project
   * Automatically saves project every N minutes
   * @param {string} accountId
   * @param {number} intervalMinutes - Default: 5 minutes
   */
  enableAutoSave(accountId, intervalMinutes = 5) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveEnabled = true;
    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.autoSaveInterval = setInterval(() => {
      try {
        const projectData = this.exportProject(accountId);
        const autoSaveKey = `ea_autosave_${accountId}`;
        localStorage.setItem(autoSaveKey, JSON.stringify({
          ...projectData,
          autoSavedAt: new Date().toISOString()
        }));
        console.log(`💾 Auto-save complete for ${accountId} at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, intervalMs);
    
    console.log(`✅ Auto-save enabled for ${accountId} (every ${intervalMinutes} minutes)`);
    this.trackEvent('autosave_enabled', { accountId, intervalMinutes });
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      this.autoSaveEnabled = false;
      console.log('✅ Auto-save disabled');
      this.trackEvent('autosave_disabled');
    }
  }

  /**
   * Get list of all projects
   * @returns {Array}
   */
  listProjects() {
    const accounts = this.accountManager.listAccounts();
    
    return accounts.map(account => {
      const opportunityCount = account.opportunities.length;
      const engagementCount = account.engagements.length;
      const pipelineValue = this.calculatePipelineValue(account);
      
      return {
        accountId: account.id,
        projectName: account.name,
        industry: account.industry,
        region: account.region,
        ACV: account.ACV,
        health: account.health,
        opportunityCount,
        engagementCount,
        pipelineValue,
        lastModified: account.metadata.updatedAt,
        hasAutoSave: localStorage.getItem(`ea_autosave_${account.id}`) !== null
      };
    });
  }

  /**
   * Delete project (with confirmation)
   * @param {string} accountId
   * @param {boolean} confirmed
   */
  deleteProject(accountId, confirmed = false) {
    if (!confirmed) {
      throw new Error('Project deletion requires confirmation');
    }
    
    const account = this.accountManager.getAccount(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }
    
    console.log(`🗑️  Deleting project: ${account.name}`);
    
    // Delete all related data
    this.accountManager.deleteAccount(accountId);
    
    // Delete team data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(accountId)) {
        localStorage.removeItem(key);
      }
    }
    
    // Delete auto-save
    localStorage.removeItem(`ea_autosave_${accountId}`);
    
    console.log('✅ Project deleted');
    this.trackEvent('project_deleted', { accountId, projectName: account.name });
  }

  /**
   * Helper: Get account team
   */
  getAccountTeam(accountId) {
    try {
      if (typeof EA_AccountTeam !== 'undefined') {
        const teamManager = new EA_AccountTeam();
        return teamManager.getTeamByAccount(accountId);
      }
    } catch (e) {
      console.warn('⚠️ EA_AccountTeam not available');
    }
    return null;
  }

  /**
   * Helper: Get account CSP
   */
  getAccountCSP(accountId) {
    try {
      if (typeof EA_CustomerSuccess !== 'undefined') {
        const cspManager = new EA_CustomerSuccess();
        return cspManager.getCSPByAccount(accountId);
      }
    } catch (e) {
      console.warn('⚠️ EA_CustomerSuccess not available');
    }
    return null;
  }

  /**
   * Helper: Get account activities
   */
  getAccountActivities(accountId) {
    try {
      if (typeof EA_AccountTeam !== 'undefined') {
        const teamManager = new EA_AccountTeam();
        return teamManager.getActivities(accountId);
      }
    } catch (e) {
      console.warn('⚠️ EA_AccountTeam not available');
    }
    return [];
  }

  /**
   * Helper: Calculate pipeline value
   */
  calculatePipelineValue(account) {
    let total = 0;
    account.opportunities.forEach(oppId => {
      try {
        const opp = JSON.parse(localStorage.getItem(`ea_opportunity_${oppId}`));
        if (opp && !['close-won', 'close-lost'].includes(opp.status)) {
          total += (opp.estimatedValue * (opp.probability / 100));
        }
      } catch (e) {
        // Ignore
      }
    });
    return total;
  }

  /**
   * Track usage event
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      module: 'EA_ProjectManager',
      properties
    };

    const events = JSON.parse(localStorage.getItem('ea_usage_events') || '[]');
    events.push(event);

    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem('ea_usage_events', JSON.stringify(events));
    console.log(`📊 Event tracked: ${eventName}`, properties);
  }
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined') {
  window.EA_ProjectManager = EA_ProjectManager;
}