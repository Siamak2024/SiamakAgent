/**
 * Mock AI Responses for Business Objectives Workflow Testing
 * Provides deterministic AI responses for test scenarios
 */

const MockAIResponses = {
  /**
   * Step 1: Understand Goals - Mock AI Questions
   */
  step1Questions: [
    {
      questionNumber: 1,
      response: {
        output_text: "What industry does your organization operate in?",
        usage: { total_tokens: 15 }
      }
    },
    {
      questionNumber: 2,
      response: {
        output_text: "What is your company size in terms of employees?",
        usage: { total_tokens: 18 }
      }
    },
    {
      questionNumber: 3,
      response: {
        output_text: "What are your top strategic priorities for the next 12-24 months?",
        usage: { total_tokens: 22 }
      }
    },
    {
      questionNumber: 4,
      response: {
        output_text: "What are the biggest challenges currently facing your organization?",
        usage: { total_tokens: 20 }
      }
    },
    {
      questionNumber: 5,
      response: {
        output_text: "What opportunities do you see in your market or industry?",
        usage: { total_tokens: 19 }
      }
    }
  ],

  /**
   * Step 1: Understand Goals - Final Synthesis
   */
  step1Synthesis: {
    response: {
      output_text: JSON.stringify({
        strategicContext: {
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
        objectives: [
          {
            name: "Improve digital customer experience",
            description: "Transform patient engagement through digital channels including telehealth, patient portals, and mobile apps",
            priority: "high",
            strategicTheme: "Customer Experience",
            outcomeStatement: "Achieve 80% patient portal adoption and 4.5+ satisfaction rating by Q4 2027"
          },
          {
            name: "Increase recurring revenue",
            description: "Expand subscription-based services and continuous care models",
            priority: "high",
            strategicTheme: "Growth",
            outcomeStatement: "Generate 40% of revenue from subscription services by Q4 2027"
          },
          {
            name: "Reduce operational complexity",
            description: "Consolidate systems and automate manual processes to improve efficiency",
            priority: "medium",
            strategicTheme: "Operational Efficiency",
            outcomeStatement: "Reduce administrative overhead by 25% within 18 months"
          },
          {
            name: "Modernize technology infrastructure",
            description: "Migrate legacy systems to cloud-native architecture",
            priority: "medium",
            strategicTheme: "Modernization",
            outcomeStatement: "Complete migration of 80% of core systems to cloud by Q2 2027"
          }
        ]
      }),
      usage: { total_tokens: 450 }
    }
  },

  /**
   * Step 2: Capability Mapping - Mock AI Questions
   */
  step2Questions: [
    {
      questionNumber: 1,
      response: {
        output_text: "Based on your digital transformation objectives, which APQC healthcare capabilities are most critical: Patient Engagement, EHR Systems, or Telehealth Services?",
        usage: { total_tokens: 28 }
      }
    },
    {
      questionNumber: 2,
      response: {
        output_text: "What is your current maturity level for Patient Portal and Mobile App capabilities (1=Basic to 5=Optimized)?",
        usage: { total_tokens: 25 }
      }
    },
    {
      questionNumber: 3,
      response: {
        output_text: "For your revenue growth objectives, which capabilities need the most investment: Subscription Billing, Customer Analytics, or Service Delivery?",
        usage: { total_tokens: 30 }
      }
    },
    {
      questionNumber: 4,
      response: {
        output_text: "What operational capabilities are currently causing the most inefficiency: Data Integration, Process Automation, or System Consolidation?",
        usage: { total_tokens: 28 }
      }
    },
    {
      questionNumber: 5,
      response: {
        output_text: "Which modernization capabilities should be prioritized: Cloud Migration, API Integration, or Data Architecture?",
        usage: { total_tokens: 24 }
      }
    }
  ],

  /**
   * Step 2: Capability Mapping - Final Synthesis
   */
  step2Synthesis: {
    response: {
      output_text: JSON.stringify({
        capabilities: [
          {
            apqc_code: "10391",
            name: "Manage patient engagement",
            domain: "Healthcare Delivery",
            currentMaturity: 2,
            targetMaturity: 4,
            gap: "Need to implement patient portal and mobile app",
            strategicImportance: "critical",
            linkedObjectives: ["obj-1"]
          },
          {
            apqc_code: "10392",
            name: "Manage electronic health records",
            domain: "Healthcare Delivery",
            currentMaturity: 3,
            targetMaturity: 4,
            gap: "EHR system needs cloud migration and API modernization",
            strategicImportance: "critical",
            linkedObjectives: ["obj-1", "obj-4"]
          },
          {
            apqc_code: "10393",
            name: "Provide telehealth services",
            domain: "Healthcare Delivery",
            currentMaturity: 1,
            targetMaturity: 4,
            gap: "Telehealth capability needs to be built from scratch",
            strategicImportance: "critical",
            linkedObjectives: ["obj-1", "obj-2"]
          },
          {
            apqc_code: "10406",
            name: "Manage subscription billing",
            domain: "Finance & Revenue",
            currentMaturity: 1,
            targetMaturity: 4,
            gap: "Need recurring billing platform for subscription services",
            strategicImportance: "high",
            linkedObjectives: ["obj-2"]
          },
          {
            apqc_code: "10526",
            name: "Manage customer analytics",
            domain: "Data & Analytics",
            currentMaturity: 2,
            targetMaturity: 4,
            gap: "Analytics platform needs patient data integration",
            strategicImportance: "high",
            linkedObjectives: ["obj-1", "obj-2"]
          },
          {
            apqc_code: "10652",
            name: "Manage data integration",
            domain: "IT Operations",
            currentMaturity: 2,
            targetMaturity: 4,
            gap: "Need unified integration layer for system consolidation",
            strategicImportance: "high",
            linkedObjectives: ["obj-3", "obj-4"]
          },
          {
            apqc_code: "10653",
            name: "Manage process automation",
            domain: "IT Operations",
            currentMaturity: 1,
            targetMaturity: 4,
            gap: "Robotic process automation needed for administrative tasks",
            strategicImportance: "medium",
            linkedObjectives: ["obj-3"]
          },
          {
            apqc_code: "10671",
            name: "Manage cloud infrastructure",
            domain: "IT Operations",
            currentMaturity: 2,
            targetMaturity: 5,
            gap: "Cloud-native architecture and migration strategy required",
            strategicImportance: "critical",
            linkedObjectives: ["obj-4"]
          },
          {
            apqc_code: "10672",
            name: "Manage API integration",
            domain: "IT Operations",
            currentMaturity: 1,
            targetMaturity: 4,
            gap: "Need API gateway and microservices architecture",
            strategicImportance: "high",
            linkedObjectives: ["obj-4"]
          },
          {
            apqc_code: "10690",
            name: "Manage data architecture",
            domain: "IT Operations",
            currentMaturity: 2,
            targetMaturity: 4,
            gap: "Need unified data model and master data management",
            strategicImportance: "high",
            linkedObjectives: ["obj-3", "obj-4"]
          }
        ],
        gapAnalysis: {
          summary: "Organization has significant capability gaps across digital engagement, revenue operations, and infrastructure modernization. Critical gaps exist in telehealth, subscription billing, and cloud architecture.",
          criticalGaps: [
            "Telehealth services (maturity 1 → target 4)",
            "Subscription billing (maturity 1 → target 4)",
            "Cloud infrastructure (maturity 2 → target 5)",
            "API integration (maturity 1 → target 4)"
          ],
          recommendations: [
            "Prioritize telehealth platform implementation to capture market demand",
            "Implement subscription billing system to enable recurring revenue model",
            "Establish cloud migration roadmap with API-first architecture",
            "Consolidate data integration layer to reduce operational complexity",
            "Invest in process automation for administrative efficiency"
          ]
        }
      }),
      usage: { total_tokens: 680 }
    }
  },

  /**
   * Step 3: Link to EA Insights - Mock AI Questions
   */
  step3Questions: [
    {
      questionNumber: 1,
      response: {
        output_text: "Which EA tools would provide the most value for tracking these objectives: Growth Dashboard for account management, WhiteSpot for service coverage, or Engagement Playbook for project execution?",
        usage: { total_tokens: 35 }
      }
    },
    {
      questionNumber: 2,
      response: {
        output_text: "Do you want to visualize capability gaps using the WhiteSpot Heatmap to identify service coverage weaknesses?",
        usage: { total_tokens: 24 }
      }
    },
    {
      questionNumber: 3,
      response: {
        output_text: "Should we link these objectives to specific accounts in the Growth Dashboard for tracking transformation progress?",
        usage: { total_tokens: 22 }
      }
    },
    {
      questionNumber: 4,
      response: {
        output_text: "Would you like to create an engagement plan in the EA Engagement Playbook to structure the implementation roadmap?",
        usage: { total_tokens: 24 }
      }
    },
    {
      questionNumber: 5,
      response: {
        output_text: "What is your preferred implementation timeline: Aggressive (12 months), Balanced (18 months), or Conservative (24 months)?",
        usage: { total_tokens: 26 }
      }
    }
  ],

  /**
   * Step 3: Link to EA Insights - Final Synthesis
   */
  step3Synthesis: {
    response: {
      output_text: JSON.stringify({
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
        executionRoadmap: {
          phases: [
            {
              name: "Phase 1: Foundation (Months 1-6)",
              objectives: ["obj-4"],
              capabilities: ["cap-10671", "cap-10672", "cap-10690"],
              duration: "6 months",
              description: "Establish cloud infrastructure and API architecture"
            },
            {
              name: "Phase 2: Digital Engagement (Months 4-12)",
              objectives: ["obj-1"],
              capabilities: ["cap-10391", "cap-10392", "cap-10393"],
              duration: "8 months",
              description: "Implement patient portal, mobile app, and telehealth"
            },
            {
              name: "Phase 3: Revenue Growth (Months 10-18)",
              objectives: ["obj-2"],
              capabilities: ["cap-10406", "cap-10526"],
              duration: "8 months",
              description: "Launch subscription billing and customer analytics"
            },
            {
              name: "Phase 4: Operational Efficiency (Months 12-18)",
              objectives: ["obj-3"],
              capabilities: ["cap-10652", "cap-10653"],
              duration: "6 months",
              description: "Automate processes and consolidate systems"
            }
          ]
        }
      }),
      usage: { total_tokens: 520 }
    }
  },

  /**
   * Error responses for testing error handling
   */
  errors: {
    timeout: new Error("Request timeout after 30 seconds"),
    invalidJSON: {
      response: {
        output_text: "This is not valid JSON {incomplete",
        usage: { total_tokens: 10 }
      }
    },
    emptyResponse: {
      response: {
        output_text: "",
        usage: { total_tokens: 0 }
      }
    },
    rateLimitError: new Error("Rate limit exceeded. Please try again later.")
  }
};

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockAIResponses;
}
