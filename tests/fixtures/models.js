// Test Fixtures for Business Context Testing
// These create test data for different scenarios

/**
 * Create a basic empty business context structure
 */
function createTestModel() {
  return {
    businessContext: {
      org_name: '',
      industry: '',
      primaryObjectives: [],
      keyChallenges: [],
      successMetrics: [],
      constraints: [],
      strategicVision: {
        ambition: '',
        themes: [],
        timeframe: ''
      },
      enrichment: {
        bmcInsights: {},
        capabilityGaps: [],
        operatingModelRisks: [],
        criticalGaps: [],
        valueStreamInsights: [],
        roadmapConstraints: [],
        validatedData: {
          organizationValidation: null,
          objectiveBenchmarks: [],
          industryInsights: null,
          technologyValidation: [],
          regulatoryContext: []
        },
        questionnaireResponses: [],
        completenessScore: 0
      }
    }
  };
}

/**
 * Create a legacy model with old strategicIntent structure
 * Used for testing migration
 */
function createLegacyModel() {
  return {
    strategicIntent: {
      org_name: 'Legacy Corp',
      industry: 'Manufacturing',
      strategic_ambition: 'Transform into digital leader',
      success_metrics: ['Increase revenue by 25%', 'Reduce costs by 15%'],
      key_challenges: ['Legacy systems', 'Skill gaps'],
      constraints: ['Budget limited to $5M', 'Complete in 24 months'],
      time_horizon: '2-3 years'
    },
    businessObjectives: {
      primaryObjectives: [
        {
          id: 'obj1',
          objective: 'Modernize core systems',
          category: 'Technology',
          measurable: true,
          kpis: ['System uptime 99.9%']
        }
      ],
      keyChallenges: [
        {
          id: 'ch1',
          challenge: 'Legacy infrastructure',
          impact: 'High',
          category: 'Technical'
        }
      ],
      strategicContext: 'Digital transformation initiative'
    }
  };
}

/**
 * Create a fully enriched business context
 * Represents completed workflow through all 7 steps
 */
function createFullyEnrichedModel() {
  return {
    businessContext: {
      org_name: 'Global Tech Solutions',
      industry: 'Technology Services',
      primaryObjectives: [
        {
          id: 'obj1',
          objective: 'Achieve 30% revenue growth',
          category: 'Financial',
          measurable: true,
          kpis: ['Revenue: $150M → $195M', 'Gross margin: 45%'],
          linkedCapabilities: ['cap_sales', 'cap_marketing']
        },
        {
          id: 'obj2',
          objective: 'Expand into APAC markets',
          category: 'Growth',
          measurable: true,
          kpis: ['APAC revenue: $20M', 'Market share: 5%'],
          linkedCapabilities: ['cap_intl_ops']
        }
      ],
      keyChallenges: [
        {
          id: 'ch1',
          challenge: 'Fragmented technology stack',
          impact: 'High',
          category: 'Technical',
          affectedObjectives: ['obj1']
        }
      ],
      successMetrics: [
        {
          metric: 'Revenue Growth',
          target: '$195M',
          timeframe: '18 months'
        }
      ],
      constraints: [
        {
          type: 'Budget',
          description: 'Total investment: $12M over 18 months'
        },
        {
          type: 'Timeline',
          description: 'Must complete by Q4 2027'
        }
      ],
      strategicVision: {
        ambition: 'Become the leading platform provider in APAC',
        themes: ['Digital transformation', 'Global expansion', 'Customer-centricity'],
        timeframe: '3 years'
      },
      enrichment: {
        bmcInsights: {
          customerSegments: ['Enterprise', 'Mid-market'],
          valuePropositions: ['Integrated platform', 'AI-powered analytics'],
          keyInsights: 'Strong product-market fit in enterprise segment'
        },
        capabilityGaps: [
          {
            capability: 'International Operations',
            currentLevel: 2,
            targetLevel: 4,
            priority: 'High',
            linkedObjective: 'obj2'
          }
        ],
        operatingModelRisks: [
          {
            risk: 'Lack of local market expertise in APAC',
            severity: 'Medium',
            mitigation: 'Hire regional leadership'
          }
        ],
        criticalGaps: [
          {
            gap: 'Outdated CRM system',
            impact: 'Limits sales effectiveness',
            priority: 1,
            affectedObjective: 'obj1'
          }
        ],
        valueStreamInsights: [
          {
            valueStream: 'Customer Acquisition',
            insight: 'Lead conversion rate below industry average',
            improvement: 'Implement marketing automation'
          }
        ],
        roadmapConstraints: [
          {
            constraint: 'CRM migration must complete before Q2 2027',
            reason: 'Dependency for APAC expansion'
          }
        ],
        validatedData: {
          organizationValidation: {
            org_name: 'Global Tech Solutions',
            industry: 'Technology Services',
            employees: 850,
            revenue: '$150M',
            confidence: 0.95,
            source: 'web_search',
            validatedAt: '2026-04-22T10:30:00Z'
          },
          objectiveBenchmarks: [
            {
              objective: 'Achieve 30% revenue growth',
              industryBenchmark: '15-25% typical for tech services',
              feasibilityScore: 0.78,
              insight: 'Aggressive but achievable with market expansion',
              source: 'web_search'
            }
          ],
          industryInsights: {
            marketTrends: ['AI integration', 'Cloud-native solutions', 'APAC growth'],
            commonChallenges: ['Talent shortage', 'Legacy system modernization'],
            typicalSolutions: ['Phased migration', 'Partnership strategies'],
            source: 'web_search'
          },
          technologyValidation: [
            {
              technology: 'Salesforce CRM',
              currentVersion: 'v48',
              latestVersion: 'v60',
              alternatives: ['HubSpot', 'Microsoft Dynamics'],
              recommendation: 'Upgrade to v60 or migrate to HubSpot',
              source: 'web_search'
            }
          ],
          regulatoryContext: [
            {
              regulation: 'GDPR',
              relevance: 'High',
              impact: 'Data handling for EU customers',
              compliance: 'Required'
            }
          ]
        },
        questionnaireResponses: [
          {
            step: 'Step1',
            question: 'Which growth strategies are you considering?',
            selections: ['Market expansion', 'Product innovation'],
            customInput: 'Focus on APAC region',
            timestamp: '2026-04-22T09:15:00Z'
          }
        ],
        completenessScore: 100
      }
    }
  };
}

/**
 * Create a partially enriched model
 * Represents workflow in progress (e.g., completed through Step 4)
 */
function createPartiallyEnrichedModel() {
  const model = createTestModel();
  model.businessContext.org_name = 'Mid-Stage Company';
  model.businessContext.industry = 'Healthcare';
  model.businessContext.primaryObjectives = [
    {
      id: 'obj1',
      objective: 'Improve patient outcomes',
      category: 'Quality',
      measurable: true,
      kpis: ['Patient satisfaction: 90%+']
    }
  ];
  model.businessContext.enrichment.bmcInsights = {
    customerSegments: ['Hospitals', 'Clinics'],
    keyInsights: 'Strong value proposition in mid-market'
  };
  model.businessContext.enrichment.capabilityGaps = [
    {
      capability: 'Data Analytics',
      currentLevel: 1,
      targetLevel: 3,
      priority: 'High'
    }
  ];
  model.businessContext.enrichment.completenessScore = 45;
  return model;
}

module.exports = {
  createTestModel,
  createLegacyModel,
  createFullyEnrichedModel,
  createPartiallyEnrichedModel
};
