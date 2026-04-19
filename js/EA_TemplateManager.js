/**
 * EA_TemplateManager.js
 * 
 * Manages import/export templates for bulk data operations
 * Generates CSV and JSON templates for Accounts, Opportunities, and other entities
 * 
 * Features:
 * - CSV template generation with headers and sample data
 * - JSON template generation with structure and examples
 * - Bulk import from CSV/JSON files
 * - Data validation and error reporting
 * - Template download functionality
 * 
 * @version 1.0.0
 * @date April 19, 2026
 */

class EA_TemplateManager {
  constructor() {
    this.accountManager = typeof EA_AccountManager !== 'undefined' ? new EA_AccountManager() : null;
    console.log('EA_TemplateManager initialized');
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACCOUNT TEMPLATES
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Generate blank account CSV template
   */
  downloadAccountCSVTemplate() {
    const headers = [
      'Account ID',
      'Account Name',
      'Account Manager',
      'ACV (Annual Contract Value)',
      'Industry',
      'Region',
      'Company Size',
      'Health Status',
      'Strategic Priorities',
      'Business Strategy',
      'Pain Points',
      'Last Contact Date'
    ];

    const sampleRow = [
      'ACC-001',
      'Acme Corporation',
      'John Smith',
      '1500000',
      'Banking',
      'Nordic',
      'Enterprise',
      'good',
      'Digital Transformation;Cost Reduction;Customer Experience',
      'Transform to digital-first bank with modern core banking platform',
      'Legacy systems;High IT costs;Slow time-to-market',
      '2026-04-15'
    ];

    const csv = [
      headers.join(','),
      '# Sample row (delete this line and add your data below)',
      sampleRow.join(','),
      '',
      '# Instructions:',
      '# - Account ID: Unique identifier (e.g., ACC-001, ACC-002) or leave blank to auto-generate',
      '# - ACV: Annual Contract Value in euros (numbers only, no currency symbols)',
      '# - Industry: Banking, Insurance, Fintech, Healthcare, Manufacturing, Retail, etc.',
      '# - Region: Nordic, EMEA, Americas, APAC, etc.',
      '# - Company Size: Enterprise (>1000), MidMarket (100-1000), SMB (<100)',
      '# - Health Status: excellent, good, at-risk, critical',
      '# - Strategic Priorities: Separate multiple values with semicolon (;)',
      '# - Last Contact Date: YYYY-MM-DD format'
    ].join('\n');

    this.downloadFile('EA_Account_Import_Template.csv', csv, 'text/csv');
    console.log('✅ Account CSV template downloaded');
  }

  /**
   * Generate account JSON template
   */
  downloadAccountJSONTemplate() {
    const template = {
      _instructions: {
        format: 'JSON array of account objects',
        requiredFields: ['name', 'accountManager', 'industry'],
        optionalFields: ['id', 'ACV', 'region', 'size', 'health', 'strategicPriorities', 'businessStrategy', 'painPoints'],
        idGeneration: 'If id is omitted or empty, system will auto-generate (ACC-001, ACC-002, etc.)',
        multipleValues: 'Use arrays for fields like strategicPriorities and painPoints'
      },
      accounts: [
        {
          id: 'ACC-001',
          name: 'Nordic Universal Bank',
          accountManager: 'Anna Andersson',
          ACV: 3250000,
          industry: 'Banking',
          region: 'Nordic',
          size: 'Enterprise',
          health: 'good',
          strategicPriorities: [
            'Digital Transformation',
            'Core Banking Modernization',
            'Open Banking & APIs'
          ],
          businessStrategy: 'Transform to digital-first bank with modern core banking platform and best-in-class customer experience',
          painPoints: [
            'Legacy mainframe COBOL systems from 1998',
            '18-month average time to launch new products',
            'Disconnected customer data across 12 systems',
            'Manual processes in 65% of operations'
          ],
          lastContactDate: '2026-04-15'
        },
        {
          id: 'ACC-002',
          name: 'SecureLife Insurance Group',
          accountManager: 'Erik Johansson',
          ACV: 1850000,
          industry: 'Insurance',
          region: 'Nordic',
          size: 'Enterprise',
          health: 'excellent',
          strategicPriorities: [
            'Claims Automation',
            'Customer Self-Service',
            'Regulatory Compliance'
          ],
          businessStrategy: 'Become the most customer-centric insurance provider through digital innovation and automation',
          painPoints: [
            'Manual claims processing (78% of cases)',
            '14-day average claims settlement time',
            'Limited self-service capabilities',
            'Paper-based policy administration'
          ],
          lastContactDate: '2026-04-18'
        }
      ]
    };

    const json = JSON.stringify(template, null, 2);
    this.downloadFile('EA_Account_Import_Template.json', json, 'application/json');
    console.log('✅ Account JSON template downloaded');
  }

  // ═══════════════════════════════════════════════════════════════════
  // OPPORTUNITY TEMPLATES
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Generate opportunity CSV template
   */
  downloadOpportunityCSVTemplate() {
    const headers = [
      'Opportunity ID',
      'Account ID',
      'Opportunity Name',
      'Status',
      'Stage',
      'Estimated Value (€)',
      'Probability (%)',
      'Expected Close Date',
      'Executive Sponsor',
      'Competitors',
      'Next Steps',
      'Risks'
    ];

    const sampleRow = [
      'OPP-001',
      'ACC-001',
      'Core Banking Platform Modernization',
      'active',
      'negotiate',
      '5800000',
      '85',
      '2026-09-30',
      'CIO - Marcus Berg',
      'Oracle;SAP;Temenos',
      'Technical deep-dive session;Contract negotiation;POC planning',
      'Budget approval pending;Competing priorities;Integration complexity'
    ];

    const csv = [
      headers.join(','),
      '# Sample row (delete this line and add your data below)',
      sampleRow.join(','),
      '',
      '# Instructions:',
      '# - Opportunity ID: Unique identifier (e.g., OPP-001) or leave blank to auto-generate',
      '# - Account ID: Must match an existing account (e.g., ACC-001)',
      '# - Status: active, won, lost, on-hold',
      '# - Stage: discovery, qualify, propose, negotiate, close',
      '# - Estimated Value: Total opportunity value in euros (numbers only)',
      '# - Probability: Win probability as percentage (0-100)',
      '# - Expected Close Date: YYYY-MM-DD format',
      '# - Competitors/Next Steps/Risks: Separate multiple values with semicolon (;)'
    ].join('\n');

    this.downloadFile('EA_Opportunity_Import_Template.csv', csv, 'text/csv');
    console.log('✅ Opportunity CSV template downloaded');
  }

  /**
   * Generate opportunity JSON template
   */
  downloadOpportunityJSONTemplate() {
    const template = {
      _instructions: {
        format: 'JSON array of opportunity objects',
        requiredFields: ['accountId', 'name', 'estimatedValue'],
        optionalFields: ['id', 'status', 'stage', 'probability', 'closeDate', 'sponsor', 'competitors', 'nextSteps', 'risks'],
        accountIdValidation: 'accountId must reference an existing account',
        idGeneration: 'If id is omitted, system will auto-generate (OPP-001, OPP-002, etc.)'
      },
      opportunities: [
        {
          id: 'OPP-001',
          accountId: 'ACC-001',
          name: 'Core Banking Platform Modernization',
          status: 'active',
          stage: 'negotiate',
          estimatedValue: 5800000,
          probability: 85,
          closeDate: '2026-09-30',
          sponsor: 'CIO - Marcus Berg',
          competitors: ['Oracle', 'SAP', 'Temenos'],
          nextSteps: [
            'Technical deep-dive session with CTO team',
            'Contract and pricing negotiation',
            'POC planning and scope definition'
          ],
          risks: [
            'Budget approval pending Q2 board meeting',
            'Competing digital wallet initiative',
            'Integration complexity with legacy systems'
          ]
        },
        {
          id: 'OPP-002',
          accountId: 'ACC-002',
          name: 'Claims Processing Automation',
          status: 'active',
          stage: 'propose',
          estimatedValue: 2500000,
          probability: 70,
          closeDate: '2026-07-15',
          sponsor: 'COO - Sofia Larsson',
          competitors: ['Guidewire', 'Duck Creek'],
          nextSteps: [
            'Present automation roadmap to exec team',
            'Demo AI claims processing',
            'ROI and business case review'
          ],
          risks: [
            'Regulatory approval for AI in underwriting',
            'Change management for claims staff',
            'Data quality and integration challenges'
          ]
        }
      ]
    };

    const json = JSON.stringify(template, null, 2);
    this.downloadFile('EA_Opportunity_Import_Template.json', json, 'application/json');
    console.log('✅ Opportunity JSON template downloaded');
  }

  // ═══════════════════════════════════════════════════════════════════
  // IMPORT FROM TEMPLATES
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Import accounts from CSV file
   * @param {File} file - CSV file
   * @returns {Promise<Object>} Import results
   */
  async importAccountsFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => 
            line.trim() && !line.startsWith('#')
          );
          
          if (lines.length < 2) {
            throw new Error('CSV file is empty or contains only headers');
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const imported = [];
          const errors = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length !== headers.length) {
              errors.push(`Row ${i + 1}: Column count mismatch`);
              continue;
            }
            
            try {
              const accountData = {
                id: values[0] || undefined,
                name: values[1],
                accountManager: values[2],
                ACV: parseFloat(values[3]) || 0,
                industry: values[4],
                region: values[5],
                size: values[6] || 'MidMarket',
                health: values[7] || 'good',
                strategicPriorities: values[8] ? values[8].split(';').map(s => s.trim()) : [],
                businessStrategy: values[9] || '',
                painPoints: values[10] ? values[10].split(';').map(s => s.trim()) : [],
                lastContactDate: values[11] || null
              };
              
              // Validate required fields
              if (!accountData.name || !accountData.accountManager || !accountData.industry) {
                errors.push(`Row ${i + 1}: Missing required fields (name, accountManager, or industry)`);
                continue;
              }
              
              const account = this.accountManager.createAccount(accountData);
              imported.push(account);
              
            } catch (error) {
              errors.push(`Row ${i + 1}: ${error.message}`);
            }
          }
          
          resolve({
            success: true,
            imported: imported.length,
            errors: errors,
            accounts: imported
          });
          
        } catch (error) {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  /**
   * Import accounts from JSON file
   * @param {File} file - JSON file
   * @returns {Promise<Object>} Import results
   */
  async importAccountsFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const accountsArray = data.accounts || data;
          
          if (!Array.isArray(accountsArray)) {
            throw new Error('JSON must contain an "accounts" array or be an array itself');
          }
          
          const imported = [];
          const errors = [];
          
          accountsArray.forEach((accountData, index) => {
            try {
              // Validate required fields
              if (!accountData.name || !accountData.accountManager || !accountData.industry) {
                errors.push(`Account ${index + 1}: Missing required fields`);
                return;
              }
              
              const account = this.accountManager.createAccount(accountData);
              imported.push(account);
              
            } catch (error) {
              errors.push(`Account ${index + 1}: ${error.message}`);
            }
          });
          
          resolve({
            success: true,
            imported: imported.length,
            errors: errors,
            accounts: imported
          });
          
        } catch (error) {
          reject(new Error(`JSON parsing failed: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  /**
   * Import opportunities from CSV file
   * @param {File} file - CSV file
   * @returns {Promise<Object>} Import results
   */
  async importOpportunitiesFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => 
            line.trim() && !line.startsWith('#')
          );
          
          if (lines.length < 2) {
            throw new Error('CSV file is empty or contains only headers');
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const imported = [];
          const errors = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            try {
              const opportunityData = {
                id: values[0] || undefined,
                accountId: values[1],
                name: values[2],
                status: values[3] || 'active',
                stage: values[4] || 'discovery',
                estimatedValue: parseFloat(values[5]) || 0,
                probability: parseInt(values[6]) || 50,
                closeDate: values[7] || null,
                sponsor: values[8] || '',
                competitors: values[9] ? values[9].split(';').map(s => s.trim()) : [],
                nextSteps: values[10] ? values[10].split(';').map(s => s.trim()) : [],
                risks: values[11] ? values[11].split(';').map(s => s.trim()) : []
              };
              
              // Validate required fields
              if (!opportunityData.accountId || !opportunityData.name) {
                errors.push(`Row ${i + 1}: Missing required fields (accountId or name)`);
                continue;
              }
              
              // Validate account exists
              const account = this.accountManager.getAccount(opportunityData.accountId);
              if (!account) {
                errors.push(`Row ${i + 1}: Account ${opportunityData.accountId} not found`);
                continue;
              }
              
              const opportunity = this.accountManager.createOpportunity(opportunityData);
              imported.push(opportunity);
              
            } catch (error) {
              errors.push(`Row ${i + 1}: ${error.message}`);
            }
          }
          
          resolve({
            success: true,
            imported: imported.length,
            errors: errors,
            opportunities: imported
          });
          
        } catch (error) {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  /**
   * Import opportunities from JSON file
   * @param {File} file - JSON file
   * @returns {Promise<Object>} Import results
   */
  async importOpportunitiesFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const opportunitiesArray = data.opportunities || data;
          
          if (!Array.isArray(opportunitiesArray)) {
            throw new Error('JSON must contain an "opportunities" array or be an array itself');
          }
          
          const imported = [];
          const errors = [];
          
          opportunitiesArray.forEach((opportunityData, index) => {
            try {
              // Validate required fields
              if (!opportunityData.accountId || !opportunityData.name) {
                errors.push(`Opportunity ${index + 1}: Missing required fields`);
                return;
              }
              
              // Validate account exists
              const account = this.accountManager.getAccount(opportunityData.accountId);
              if (!account) {
                errors.push(`Opportunity ${index + 1}: Account ${opportunityData.accountId} not found`);
                return;
              }
              
              const opportunity = this.accountManager.createOpportunity(opportunityData);
              imported.push(opportunity);
              
            } catch (error) {
              errors.push(`Opportunity ${index + 1}: ${error.message}`);
            }
          });
          
          resolve({
            success: true,
            imported: imported.length,
            errors: errors,
            opportunities: imported
          });
          
        } catch (error) {
          reject(new Error(`JSON parsing failed: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Download file helper
   * @param {string} filename - File name
   * @param {string} content - File content
   * @param {string} mimeType - MIME type
   */
  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined') {
  window.EA_TemplateManager = EA_TemplateManager;
}
