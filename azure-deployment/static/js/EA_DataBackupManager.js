/**
 * EA_DataManager.js  
 * Data import/export and backup utilities
 * Handles bulk data operations, backup/restore, and schema versioning
 * 
 * @version 1.0
 * @phase Phase 5 - Integration & Polish
 */

class EA_DataBackupManager {
  constructor() {
    this.currentSchemaVersion = '2.0'; // Updated for Phase 3-4 additions
    this.backupPrefix = 'ea_backup_';
    this.autoBackupEnabled = false;
  }

  /**
   * Export all data to JSON
   * @returns {object}
   */
  exportAllData() {
    console.log('📦 Exporting all data...');

    const exportData = {
      version: this.currentSchemaVersion,
      exportDate: new Date().toISOString(),
      accounts: [],
      opportunities: [],
      valueCases: [],
      engagements: [],
      entities: {}
    };

    // Export accounts
    const accountKeys = Object.keys(localStorage).filter(key => key.startsWith('ea_account_'));
    accountKeys.forEach(key => {
      try {
        const account = JSON.parse(localStorage.getItem(key));
        exportData.accounts.push(account);
      } catch (error) {
        console.warn(`Failed to export ${key}:`, error);
      }
    });

    // Export opportunities
    const oppKeys = Object.keys(localStorage).filter(key => key.startsWith('ea_opportunity_'));
    oppKeys.forEach(key => {
      try {
        const opportunity = JSON.parse(localStorage.getItem(key));
        exportData.opportunities.push(opportunity);
      } catch (error) {
        console.warn(`Failed to export ${key}:`, error);
      }
    });

    // Export value cases
    const vcKeys = Object.keys(localStorage).filter(key => key.startsWith('ea_valuecase_'));
    vcKeys.forEach(key => {
      try {
        const valueCase = JSON.parse(localStorage.getItem(key));
        exportData.valueCases.push(valueCase);
      } catch (error) {
        console.warn(`Failed to export ${key}:`, error);
      }
    });

    // Export engagements
    const engagementKeys = Object.keys(localStorage).filter(key => key.startsWith('ea_engagement_model_'));
    engagementKeys.forEach(key => {
      try {
        const engagement = JSON.parse(localStorage.getItem(key));
        exportData.engagements.push(engagement);
      } catch (error) {
        console.warn(`Failed to export ${key}:`, error);
      }
    });

    // Export other entities (navigation history, saved searches, etc.)
    const metadataKeys = ['ea_navigation_history', 'ea_saved_searches', 'ea_recent_items'];
    metadataKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          exportData.entities[key] = JSON.parse(data);
        }
      } catch (error) {
        console.warn(`Failed to export ${key}:`, error);
      }
    });

    console.log(`✅ Export complete: ${exportData.accounts.length} accounts, ${exportData.opportunities.length} opportunities, ${exportData.engagements.length} engagements`);

    return exportData;
  }

  /**
   * Download export as JSON file
   * @param {string} filename
   */
  downloadExport(filename = null) {
    const exportData = this.exportAllData();
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `ea_export_${timestamp}.json`;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded: ${filename || defaultFilename}`);
  }

  /**
   * Import data from JSON
   * @param {object} importData
   * @param {object} options - {merge: boolean, skipValidation: boolean}
   * @returns {object} - Import result with counts and errors
   */
  importData(importData, options = { merge: true, skipValidation: false }) {
    console.log('📥 Importing data...');

    const result = {
      success: true,
      imported: {
        accounts: 0,
        opportunities: 0,
        valueCases: 0,
        engagements: 0
      },
      skipped: {
        accounts: 0,
        opportunities: 0,
        valueCases: 0,
        engagements: 0
      },
      errors: []
    };

    // Check schema version
    if (importData.version && importData.version !== this.currentSchemaVersion) {
      console.warn(`⚠️ Schema version mismatch: import=${importData.version}, current=${this.currentSchemaVersion}`);
      
      // Attempt migration
      try {
        importData = this.migrateSchema(importData, importData.version, this.currentSchemaVersion);
        console.log('✅ Schema migration successful');
      } catch (error) {
        result.errors.push({ type: 'migration', error: error.message });
        if (!options.skipValidation) {
          result.success = false;
          return result;
        }
      }
    }

    // Import accounts
    if (importData.accounts) {
      importData.accounts.forEach(account => {
        try {
          const key = `ea_account_${account.id}`;
          const existing = localStorage.getItem(key);

          if (existing && !options.merge) {
            result.skipped.accounts++;
          } else {
            localStorage.setItem(key, JSON.stringify(account));
            result.imported.accounts++;
          }
        } catch (error) {
          result.errors.push({ type: 'account', id: account.id, error: error.message });
        }
      });
    }

    // Import opportunities
    if (importData.opportunities) {
      importData.opportunities.forEach(opportunity => {
        try {
          const key = `ea_opportunity_${opportunity.id}`;
          const existing = localStorage.getItem(key);

          if (existing && !options.merge) {
            result.skipped.opportunities++;
          } else {
            localStorage.setItem(key, JSON.stringify(opportunity));
            result.imported.opportunities++;
          }
        } catch (error) {
          result.errors.push({ type: 'opportunity', id: opportunity.id, error: error.message });
        }
      });
    }

    // Import value cases
    if (importData.valueCases) {
      importData.valueCases.forEach(valueCase => {
        try {
          const key = `ea_valuecase_${valueCase.id}`;
          const existing = localStorage.getItem(key);

          if (existing && !options.merge) {
            result.skipped.valueCases++;
          } else {
            localStorage.setItem(key, JSON.stringify(valueCase));
            result.imported.valueCases++;
          }
        } catch (error) {
          result.errors.push({ type: 'valueCase', id: valueCase.id, error: error.message });
        }
      });
    }

    // Import engagements
    if (importData.engagements) {
      importData.engagements.forEach(engagement => {
        try {
          const key = `ea_engagement_model_${engagement.id}`;
          const existing = localStorage.getItem(key);

          if (existing && !options.merge) {
            result.skipped.engagements++;
          } else {
            localStorage.setItem(key, JSON.stringify(engagement));
            result.imported.engagements++;
          }
        } catch (error) {
          result.errors.push({ type: 'engagement', id: engagement.id, error: error.message });
        }
      });
    }

    // Import metadata entities
    if (importData.entities) {
      Object.keys(importData.entities).forEach(key => {
        try {
          localStorage.setItem(key, JSON.stringify(importData.entities[key]));
        } catch (error) {
          result.errors.push({ type: 'metadata', key, error: error.message });
        }
      });
    }

    console.log(`✅ Import complete: ${result.imported.accounts} accounts, ${result.imported.opportunities} opportunities, ${result.imported.engagements} engagements`);
    if (result.errors.length > 0) {
      console.warn(`⚠️ ${result.errors.length} errors during import`);
    }

    return result;
  }

  /**
   * Import from file upload
   * @param {File} file
   * @param {object} options
   * @returns {Promise<object>}
   */
  async importFromFile(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          const result = this.importData(importData, options);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse import file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Import from CSV
   * @param {File} file
   * @param {string} entityType - 'account', 'opportunity', 'engagement'
   * @returns {Promise<object>}
   */
  async importFromCSV(file, entityType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());

          const entities = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim());
            const entity = {};

            headers.forEach((header, index) => {
              entity[header] = values[index];
            });

            entities.push(entity);
          }

          // Convert to import format
          const importData = {
            version: this.currentSchemaVersion,
            exportDate: new Date().toISOString()
          };

          if (entityType === 'account') {
            importData.accounts = entities;
          } else if (entityType === 'opportunity') {
            importData.opportunities = entities;
          } else if (entityType === 'engagement') {
            importData.engagements = entities;
          }

          const result = this.importData(importData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Create backup
   * @param {string} name - Optional backup name
   * @returns {string} - Backup ID
   */
  createBackup(name = null) {
    const exportData = this.exportAllData();
    const backupId = `${this.backupPrefix}${Date.now()}`;
    const backupName = name || `Backup ${new Date().toLocaleString()}`;

    const backup = {
      id: backupId,
      name: backupName,
      timestamp: new Date().toISOString(),
      data: exportData
    };

    try {
      localStorage.setItem(backupId, JSON.stringify(backup));
      console.log(`✅ Backup created: ${backupName}`);
      return backupId;
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * List all backups
   * @returns {Array}
   */
  listBackups() {
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith(this.backupPrefix));
    const backups = [];

    backupKeys.forEach(key => {
      try {
        const backup = JSON.parse(localStorage.getItem(key));
        backups.push({
          id: backup.id,
          name: backup.name,
          timestamp: backup.timestamp,
          size: JSON.stringify(backup.data).length
        });
      } catch (error) {
        console.warn(`Failed to load backup ${key}:`, error);
      }
    });

    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return backups;
  }

  /**
   * Restore from backup
   * @param {string} backupId
   * @returns {object} - Restore result
   */
  restoreBackup(backupId) {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backup = JSON.parse(backupData);
      const result = this.importData(backup.data, { merge: false });

      console.log(`✅ Restored from backup: ${backup.name}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
      throw error;
    }
  }

  /**
   * Delete backup
   * @param {string} backupId
   */
  deleteBackup(backupId) {
    localStorage.removeItem(backupId);
    console.log(`✅ Deleted backup: ${backupId}`);
  }

  /**
   * Migrate schema from old version to new version
   * @param {object} data
   * @param {string} fromVersion
   * @param {string} toVersion
   * @returns {object}
   */
  migrateSchema(data, fromVersion, toVersion) {
    console.log(`🔄 Migrating schema from ${fromVersion} to ${toVersion}...`);

    let migratedData = { ...data };

    // Migration from 1.0 to 2.0
    if (fromVersion === '1.0' && toVersion === '2.0') {
      // Add workflowState to engagements if missing
      if (migratedData.engagements) {
        migratedData.engagements.forEach(engagement => {
          if (!engagement.workflowState) {
            engagement.workflowState = {
              currentPhase: 'E0',
              currentStep: 'E0.1',
              completedSteps: [],
              phaseCompleteness: { E0: 0, E1: 0, E2: 0, E3: 0, E4: 0, E5: 0 },
              stepData: {},
              aiConversations: [],
              integrations: { apqc: {}, apm: {}, bmc: {}, capability: {} }
            };
          }

          // Add accountId field if missing
          if (!engagement.accountId) {
            engagement.accountId = null;
          }
        });
      }

      // Add opportunityId to initiatives if missing
      if (migratedData.engagements) {
        migratedData.engagements.forEach(engagement => {
          if (engagement.initiatives) {
            engagement.initiatives.forEach(initiative => {
              if (!initiative.opportunityId) {
                initiative.opportunityId = null;
              }
            });
          }
        });
      }

      migratedData.version = '2.0';
    }

    return migratedData;
  }

  /**
   * Enable automatic daily backup
   * @param {string} downloadPath - Optional, downloads to browser's default location
   */
  enableAutoBackup(downloadPath = null) {
    this.autoBackupEnabled = true;

    // Schedule daily backup at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;

    setTimeout(() => {
      this.performAutoBackup(downloadPath);
      
      // Then schedule every 24 hours
      setInterval(() => {
        this.performAutoBackup(downloadPath);
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    console.log('✅ Automatic daily backup enabled');
  }

  /**
   * Disable automatic backup
   */
  disableAutoBackup() {
    this.autoBackupEnabled = false;
    console.log('⏸️ Automatic backup disabled');
  }

  /**
   * Perform automatic backup
   * @param {string} downloadPath
   */
  performAutoBackup(downloadPath = null) {
    if (!this.autoBackupEnabled) return;

    try {
      // Create in-storage backup
      this.createBackup(`Auto-backup ${new Date().toLocaleDateString()}`);

      // Optional: Download to file
      if (downloadPath !== null) {
        this.downloadExport(`ea_auto_backup_${new Date().toISOString().split('T')[0]}.json`);
      }

      console.log('✅ Automatic backup completed');
    } catch (error) {
      console.error('❌ Automatic backup failed:', error);
    }
  }

  /**
   * Get storage statistics
   * @returns {object}
   */
  getStorageStats() {
    let totalSize = 0;
    let entityCounts = {
      accounts: 0,
      opportunities: 0,
      valueCases: 0,
      engagements: 0,
      backups: 0
    };

    Object.keys(localStorage).forEach(key => {
      const item = localStorage.getItem(key);
      totalSize += item.length;

      if (key.startsWith('ea_account_')) entityCounts.accounts++;
      if (key.startsWith('ea_opportunity_')) entityCounts.opportunities++;
      if (key.startsWith('ea_valuecase_')) entityCounts.valueCases++;
      if (key.startsWith('ea_engagement_model_')) entityCounts.engagements++;
      if (key.startsWith(this.backupPrefix)) entityCounts.backups++;
    });

    // localStorage limit is typically 5-10MB depending on browser
    const maxStorage = 10 * 1024 * 1024; // 10MB
    const usagePercentage = Math.round((totalSize / maxStorage) * 100);

    return {
      totalSize: totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      usagePercentage,
      entityCounts,
      maxStorage: maxStorage,
      maxStorageFormatted: this.formatBytes(maxStorage),
      available: maxStorage - totalSize,
      availableFormatted: this.formatBytes(maxStorage - totalSize)
    };
  }

  /**
   * Format bytes to human-readable string
   * @param {number} bytes
   * @returns {string}
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Clear all data (with confirmation)
   * @param {boolean} confirmed
   */
  clearAllData(confirmed = false) {
    if (!confirmed) {
      throw new Error('clearAllData requires explicit confirmation');
    }

    const keysToDelete = Object.keys(localStorage).filter(key => 
      key.startsWith('ea_account_') ||
      key.startsWith('ea_opportunity_') ||
      key.startsWith('ea_valuecase_') ||
      key.startsWith('ea_engagement_model_') ||
      key.startsWith('ea_navigation_') ||
      key.startsWith('ea_saved_') ||
      key.startsWith('ea_recent_')
    );

    keysToDelete.forEach(key => localStorage.removeItem(key));

    console.log(`✅ Cleared ${keysToDelete.length} items from localStorage`);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_DataBackupManager = EA_DataBackupManager;
  window.dataBackup = new EA_DataBackupManager();
}
