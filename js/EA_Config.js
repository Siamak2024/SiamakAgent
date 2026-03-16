/**
 * EA Platform V3 - Unified Configuration
 * Centralized config for API keys, storage keys, and toolkit settings
 */

const EA_Config = {
  // Version info
  version: '3.0.0',
  buildDate: '2026-03-13',
  
  // Storage keys - unified across all toolkits
  storage: {
    apiKey: 'ea_config',           // Unified API key storage
    projects: 'ea_projects',        // All projects
    currentProject: 'ea_current_project',
    
    // Legacy keys (for backward compatibility)
    legacy: {
      v2_apiKey: 'ea_api_key',
      v2_models: 'ea_saved_models',
      v2_current: 'ea_current_model',
      bmc_key: 'bmc_openai_key',
      cap_key: 'cap_openai_key',
      strategy_key: 'strategy_openai_key',
      vc_key: 'vc_openai_key',
      maturity_key: 'ea20_openai_key'
    }
  },
  
  // OpenAI configuration
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  },
  
  // Toolkit definitions
  toolkits: {
    platform: {
      id: 'platform',
      name: 'EA Platform',
      file: 'EA Plattform/EA 20 Platform_V3_Integrated.html',
      color: '#1e3a8a',
      icon: '🏛️'
    },
    bmc: {
      id: 'bmc',
      name: 'Business Model Canvas',
      file: 'AI Business Model Canvas.html',
      color: '#0891b2',
      icon: '📊',
      syncTarget: 'operatingModel'
    },
    capabilityMap: {
      id: 'capabilityMap',
      name: 'Capability Mapping',
      file: 'AI Capability Mapping V2.html',
      color: '#7c3aed',
      icon: '🎯',
      syncTarget: 'capabilities'
    },
    wardley: {
      id: 'wardley',
      name: 'Strategy Workbench',
      file: 'AI Strategy Workbench V2.html',
      color: '#2563eb',
      icon: '🗺️',
      syncTarget: 'systems'
    },
    valueChain: {
      id: 'valueChain',
      name: 'Value Chain Analyzer',
      file: 'AI Value Chain Analyzer V2.html',
      color: '#d97706',
      icon: '⛓️',
      syncTarget: 'processes'
    },
    maturity: {
      id: 'maturity',
      name: 'Maturity Toolbox',
      file: 'EA20 Maturity Toolbox V2.html',
      color: '#dc2626',
      icon: '📈',
      syncTarget: 'maturityScores'
    }
  },
  
  // Work modes
  modes: {
    MANUAL: 'manual',
    AI_ASSISTED: 'ai-assisted',
    WORKSHOP: 'workshop-integration'
  },
  
  // Export/Import settings
  export: {
    baseDir: 'ea_exports',
    projectsDir: 'ea_exports/projects',
    templatesDir: 'ea_exports/templates',
    formats: ['json', 'csv', 'excel']
  },
  
  // Auto-save interval (milliseconds)
  autoSaveInterval: 30000  // 30 seconds
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.EA_Config = EA_Config;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_Config;
}
