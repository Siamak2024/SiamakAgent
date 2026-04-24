// Mock Web Search API for testing
// Simulates web search without making real external calls

class MockWebSearch {
  constructor() {
    this.callCount = 0;
    this.searchHistory = [];
  }

  /**
   * Mock organization validation
   */
  async validateOrganization(companyName) {
    this.callCount++;
    this.searchHistory.push({
      type: 'organization',
      query: companyName,
      timestamp: new Date().toISOString()
    });

    // Predefined responses for common test cases
    const responses = {
      'Microsoft': {
        validated: true,
        data: {
          org_name: 'Microsoft Corporation',
          industry: 'Technology',
          employees: 221000,
          revenue: '$211B',
          confidence: 0.98,
          source: 'web_search',
          validatedAt: new Date().toISOString()
        }
      },
      'Global Tech Solutions': {
        validated: true,
        data: {
          org_name: 'Global Tech Solutions',
          industry: 'Technology Services',
          employees: 850,
          revenue: '$150M',
          confidence: 0.95,
          source: 'web_search',
          validatedAt: new Date().toISOString()
        }
      },
      'Unknown Company XYZ': {
        validated: false,
        data: null,
        message: 'No reliable information found'
      }
    };

    return responses[companyName] || {
      validated: false,
      data: null,
      message: 'Organization not found in mock data'
    };
  }

  /**
   * Mock objective benchmark enrichment
   */
  async enrichObjectiveWithBenchmarks(objective, industry) {
    this.callCount++;
    this.searchHistory.push({
      type: 'benchmark',
      query: `${objective} ${industry}`,
      timestamp: new Date().toISOString()
    });

    // Simulate industry benchmarking
    const benchmarks = {
      'Achieve 30% revenue growth': {
        industryBenchmark: '15-25% typical for tech services',
        feasibilityScore: 0.78,
        insight: 'Aggressive but achievable with market expansion',
        source: 'web_search'
      },
      'Improve patient outcomes': {
        industryBenchmark: '85-90% patient satisfaction typical',
        feasibilityScore: 0.92,
        insight: 'Realistic goal aligned with industry standards',
        source: 'web_search'
      }
    };

    return benchmarks[objective] || {
      industryBenchmark: 'No benchmark data available',
      feasibilityScore: 0.5,
      insight: 'Limited industry data for this objective',
      source: 'web_search'
    };
  }

  /**
   * Mock technology validation
   */
  async validateTechnology(technologyName) {
    this.callCount++;
    this.searchHistory.push({
      type: 'technology',
      query: technologyName,
      timestamp: new Date().toISOString()
    });

    const technologies = {
      'Salesforce CRM': {
        technology: 'Salesforce CRM',
        currentVersion: null, // Not known from user input
        latestVersion: 'v60',
        alternatives: ['HubSpot', 'Microsoft Dynamics', 'Zoho CRM'],
        recommendation: 'Leading CRM with strong enterprise features',
        source: 'web_search'
      },
      'SAP ERP': {
        technology: 'SAP ERP',
        currentVersion: null,
        latestVersion: 'SAP S/4HANA',
        alternatives: ['Oracle ERP Cloud', 'Microsoft Dynamics 365'],
        recommendation: 'Consider cloud migration to S/4HANA',
        source: 'web_search'
      }
    };

    return technologies[technologyName] || {
      technology: technologyName,
      currentVersion: null,
      latestVersion: 'Unknown',
      alternatives: [],
      recommendation: 'No detailed information available',
      source: 'web_search'
    };
  }

  /**
   * Mock industry insights
   */
  async getIndustryInsights(industry) {
    this.callCount++;
    this.searchHistory.push({
      type: 'industry',
      query: industry,
      timestamp: new Date().toISOString()
    });

    const insights = {
      'Technology': {
        marketTrends: ['AI/ML adoption', 'Cloud migration', 'Cybersecurity focus'],
        commonChallenges: ['Talent shortage', 'Legacy modernization', 'Rapid change'],
        typicalSolutions: ['Agile transformation', 'Cloud-first strategy', 'Upskilling programs'],
        source: 'web_search'
      },
      'Healthcare': {
        marketTrends: ['Digital health', 'Telemedicine', 'Value-based care'],
        commonChallenges: ['Regulatory compliance', 'Data interoperability', 'Patient privacy'],
        typicalSolutions: ['EHR integration', 'HIPAA compliance', 'Patient portals'],
        source: 'web_search'
      }
    };

    return insights[industry] || {
      marketTrends: [],
      commonChallenges: [],
      typicalSolutions: [],
      source: 'web_search'
    };
  }

  /**
   * Reset mock state
   */
  reset() {
    this.callCount = 0;
    this.searchHistory = [];
  }

  /**
   * Get search statistics
   */
  getStats() {
    return {
      totalCalls: this.callCount,
      searchHistory: this.searchHistory
    };
  }
}

module.exports = MockWebSearch;
