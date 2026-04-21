/**
 * Test Data Fixtures for Business Objectives Workflow
 * Provides sample data for unit and integration tests
 */

const BusinessObjectivesTestData = {
  /**
   * Valid business objective examples
   */
  validObjectives: [
    {
      id: "test-obj-1",
      name: "Improve digital customer experience",
      description: "Transform patient engagement through digital channels including telehealth, patient portals, and mobile apps",
      priority: "high",
      strategicTheme: "Customer Experience",
      outcomeStatement: "Achieve 80% patient portal adoption and 4.5+ satisfaction rating by Q4 2027",
      linkedCapabilities: ["cap-10391", "cap-10392", "cap-10393"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workflowState: {
        step1Complete: true,
        step2Complete: true,
        step3Complete: false,
        aiSessionHistory: [
          {
            step: 1,
            timestamp: Date.now(),
            questionCount: 5,
            userInputs: ["Healthcare", "500 employees", "Digital transformation", "Legacy systems", "Telehealth demand"]
          }
        ]
      }
    },
    {
      id: "test-obj-2",
      name: "Increase recurring revenue",
      description: "Expand subscription-based services and continuous care models",
      priority: "high",
      strategicTheme: "Growth",
      outcomeStatement: "Generate 40% of revenue from subscription services by Q4 2027",
      linkedCapabilities: ["cap-10406", "cap-10526"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workflowState: {
        step1Complete: true,
        step2Complete: true,
        step3Complete: false,
        aiSessionHistory: []
      }
    },
    {
      id: "test-obj-3",
      name: "Reduce operational complexity",
      description: "Consolidate systems and automate manual processes to improve efficiency",
      priority: "medium",
      strategicTheme: "Operational Efficiency",
      outcomeStatement: "Reduce administrative overhead by 25% within 18 months",
      linkedCapabilities: ["cap-10652", "cap-10653"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workflowState: {
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        aiSessionHistory: []
      }
    }
  ],

  /**
   * Invalid objective examples (for validation testing)
   */
  invalidObjectives: [
    {
      // Missing required fields
      id: "test-invalid-1",
      name: "Incomplete objective"
      // Missing: description, priority, strategicTheme, outcomeStatement
    },
    {
      // Invalid priority value
      id: "test-invalid-2",
      name: "Invalid priority objective",
      description: "Test",
      priority: "urgent", // Should be: high, medium, or low
      strategicTheme: "Growth",
      outcomeStatement: "Test outcome"
    },
    {
      // Empty strings
      id: "test-invalid-3",
      name: "",
      description: "",
      priority: "high",
      strategicTheme: "",
      outcomeStatement: ""
    }
  ],

  /**
   * Strategic context examples
   */
  strategicContexts: [
    {
      industry: "Healthcare",
      companySize: "500 employees",
      challenges: [
        "Legacy systems limiting digital capabilities",
        "Fragmented patient data across multiple systems",
        "Rising operational costs"
      ],
      opportunities: [
        "Growing demand for telehealth services",
        "Patient data analytics for personalized care",
        "Automation of administrative processes"
      ]
    },
    {
      industry: "Financial Services",
      companySize: "1000 employees",
      challenges: [
        "Regulatory compliance complexity",
        "Legacy core banking systems",
        "Customer acquisition costs"
      ],
      opportunities: [
        "Open banking and API economy",
        "AI-driven risk assessment",
        "Digital-first customer experience"
      ]
    },
    {
      industry: "Manufacturing",
      companySize: "2500 employees",
      challenges: [
        "Supply chain disruptions",
        "Equipment maintenance costs",
        "Quality control variability"
      ],
      opportunities: [
        "IoT-enabled predictive maintenance",
        "Supply chain visibility through digital twin",
        "Automated quality inspection"
      ]
    }
  ],

  /**
   * Capability mapping examples
   */
  capabilityMappings: [
    {
      apqc_code: "10391",
      name: "Manage patient engagement",
      domain: "Healthcare Delivery",
      currentMaturity: 2,
      targetMaturity: 4,
      gap: "Need to implement patient portal and mobile app",
      strategicImportance: "critical",
      linkedObjectives: ["test-obj-1"]
    },
    {
      apqc_code: "10392",
      name: "Manage electronic health records",
      domain: "Healthcare Delivery",
      currentMaturity: 3,
      targetMaturity: 4,
      gap: "EHR system needs cloud migration and API modernization",
      strategicImportance: "critical",
      linkedObjectives: ["test-obj-1", "test-obj-3"]
    },
    {
      apqc_code: "10406",
      name: "Manage subscription billing",
      domain: "Finance & Revenue",
      currentMaturity: 1,
      targetMaturity: 4,
      gap: "Need recurring billing platform for subscription services",
      strategicImportance: "high",
      linkedObjectives: ["test-obj-2"]
    }
  ],

  /**
   * Gap analysis examples
   */
  gapAnalyses: [
    {
      summary: "Organization has significant capability gaps across digital engagement, revenue operations, and infrastructure modernization.",
      criticalGaps: [
        "Telehealth services (maturity 1 → target 4)",
        "Subscription billing (maturity 1 → target 4)",
        "Cloud infrastructure (maturity 2 → target 5)"
      ],
      recommendations: [
        "Prioritize telehealth platform implementation",
        "Implement subscription billing system",
        "Establish cloud migration roadmap"
      ]
    }
  ],

  /**
   * Workflow state examples
   */
  workflowStates: [
    {
      // Step 1 complete, others pending
      step1Complete: true,
      step2Complete: false,
      step3Complete: false,
      aiSessionHistory: [
        {
          step: 1,
          timestamp: Date.now(),
          questionCount: 5,
          userInputs: ["Healthcare", "500 employees", "Digital transformation", "Legacy systems", "Telehealth demand"]
        }
      ]
    },
    {
      // Steps 1-2 complete, Step 3 pending
      step1Complete: true,
      step2Complete: true,
      step3Complete: false,
      aiSessionHistory: [
        {
          step: 1,
          timestamp: Date.now() - 3600000,
          questionCount: 5,
          userInputs: ["Healthcare", "500 employees", "Digital transformation", "Legacy systems", "Telehealth demand"]
        },
        {
          step: 2,
          timestamp: Date.now(),
          questionCount: 5,
          userInputs: ["Patient Engagement", "Maturity level 2", "Subscription Billing", "Data Integration", "Cloud Migration"]
        }
      ]
    },
    {
      // All steps complete
      step1Complete: true,
      step2Complete: true,
      step3Complete: true,
      aiSessionHistory: [
        {
          step: 1,
          timestamp: Date.now() - 7200000,
          questionCount: 5,
          userInputs: ["Healthcare", "500 employees", "Digital transformation", "Legacy systems", "Telehealth demand"]
        },
        {
          step: 2,
          timestamp: Date.now() - 3600000,
          questionCount: 5,
          userInputs: ["Patient Engagement", "Maturity level 2", "Subscription Billing", "Data Integration", "Cloud Migration"]
        },
        {
          step: 3,
          timestamp: Date.now(),
          questionCount: 3,
          userInputs: ["WhiteSpot and Growth Dashboard", "Yes, visualize gaps", "18 months timeline"]
        }
      ]
    }
  ],

  /**
   * Integration examples
   */
  integrations: [
    {
      tool: "WhiteSpot",
      linkedEntities: ["cap-10391", "cap-10392", "cap-10393"],
      purpose: "Visualize capability gaps for digital engagement capabilities",
      priority: "high"
    },
    {
      tool: "GrowthDashboard",
      linkedEntities: ["account-healthcare-digital"],
      purpose: "Track transformation progress and opportunities",
      priority: "high"
    },
    {
      tool: "Engagement",
      linkedEntities: ["engagement-digital-transformation"],
      purpose: "Structure implementation roadmap with stakeholder engagement",
      priority: "medium"
    }
  ],

  /**
   * Execution roadmap examples
   */
  executionRoadmaps: [
    {
      phases: [
        {
          name: "Phase 1: Foundation (Months 1-6)",
          objectives: ["test-obj-3"],
          capabilities: ["cap-10671", "cap-10672", "cap-10690"],
          duration: "6 months",
          description: "Establish cloud infrastructure and API architecture"
        },
        {
          name: "Phase 2: Digital Engagement (Months 4-12)",
          objectives: ["test-obj-1"],
          capabilities: ["cap-10391", "cap-10392", "cap-10393"],
          duration: "8 months",
          description: "Implement patient portal, mobile app, and telehealth"
        }
      ]
    }
  ],

  /**
   * User conversation examples for AI testing
   */
  userConversations: {
    healthcare: {
      step1: [
        "Healthcare",
        "500 employees",
        "Digital transformation, patient experience improvement, operational efficiency",
        "Legacy systems, fragmented data, rising costs",
        "Telehealth demand, patient analytics, process automation"
      ],
      step2: [
        "Patient Engagement, Telehealth Services, and EHR Systems are most critical",
        "Current maturity is level 2 - we have basic patient portal but limited functionality",
        "Subscription Billing and Customer Analytics need the most investment",
        "Data Integration is the biggest inefficiency - systems don't talk to each other",
        "Cloud Migration should be prioritized first to enable other capabilities"
      ],
      step3: [
        "WhiteSpot for service coverage and Growth Dashboard for account tracking",
        "Yes, visualize capability gaps using WhiteSpot Heatmap",
        "Yes, link to Growth Dashboard for our main healthcare account",
        "Yes, create engagement plan in EA Engagement Playbook",
        "Balanced 18-month timeline"
      ]
    }
  },

  /**
   * Helper function to generate unique IDs
   */
  generateId: function(prefix = "test") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Helper function to create a valid objective
   */
  createValidObjective: function(overrides = {}) {
    return {
      id: this.generateId("obj"),
      name: "Test Objective",
      description: "Test objective description",
      priority: "medium",
      strategicTheme: "Growth",
      outcomeStatement: "Achieve test outcome by Q4 2027",
      linkedCapabilities: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workflowState: {
        step1Complete: false,
        step2Complete: false,
        step3Complete: false,
        aiSessionHistory: []
      },
      ...overrides
    };
  }
};

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessObjectivesTestData;
}
