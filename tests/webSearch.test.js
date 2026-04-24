// Phase 5: Web Search & AI Integration Tests
// Tests for real web search validation functions

// Import module once at top
const WebSearch = require('../NexGenEA/js/webSearch');

describe('Phase 5: Web Search & Validation', () => {

  beforeEach(() => {
    // Reset module state
    WebSearch.resetSearchCount();
    
    // Mock fetch for testing
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOrganization()', () => {
    
    test('validates known organization via web search', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Microsoft Corporation',
          industry: 'Technology',
          confidence: 0.95,
          source: 'web_search',
          description: 'Leading technology company'
        })
      });
      
      const result = await WebSearch.validateOrganization('Microsoft');

      expect(result).toBeDefined();
      expect(result.org_name).toBe('Microsoft Corporation');
      expect(result.industry).toBe('Technology');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.source).toBe('web_search');
    });

    test('handles unknown organization gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      const result = await WebSearch.validateOrganization('Unknown Corp XYZ');

      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.org_name).toBe('Unknown Corp XYZ');
      expect(result.source).toBe('user_provided');
    });

    test('respects search limit of 5 calls per step', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'Test', industry: 'Test', confidence: 0.9 })
      });
      
      // Make 6 calls
      for (let i = 0; i < 6; i++) {
        await WebSearch.validateOrganization(`Company ${i}`);
      }

      // Only first 5 should have triggered fetch
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    test('caches results to avoid duplicate searches', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Acme', industry: 'Manufacturing', confidence: 0.9 })
      });
      
      // Search same company twice
      await WebSearch.validateOrganization('Acme Corp');
      await WebSearch.validateOrganization('Acme Corp');

      // Should only fetch once (cached)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('enrichObjectiveWithBenchmarks()', () => {
    
    test('fetches industry benchmarks for objective', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          objective: 'Increase revenue by 25%',
          industryBenchmark: 'Industry average growth: 15-20%',
          feasibilityScore: 0.78,
          competitors: ['CompanyA', 'CompanyB'],
          insights: 'Ambitious but achievable with digital transformation'
        })
      });
      
      const result = await WebSearch.enrichObjectiveWithBenchmarks(
        'Increase revenue by 25%',
        'Technology'
      );

      expect(result).toBeDefined();
      expect(result.feasibilityScore).toBeGreaterThan(0.5);
      expect(result.industryBenchmark).toContain('15-20%');
      expect(result.competitors).toBeInstanceOf(Array);
    });

    test('returns null if search limit exceeded', async () => {
      // Exhaust search limit
      for (let i = 0; i < 5; i++) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ name: `Test ${i}`, industry: 'Test' })
        });
        await WebSearch.validateOrganization(`Test ${i}`);
      }

      const result = await WebSearch.enrichObjectiveWithBenchmarks(
        'Test objective',
        'Technology'
      );

      expect(result).toBeNull();
    });
  });

  describe('validateTechnology()', () => {
    
    test('validates technology stack component', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Kubernetes',
          category: 'Container Orchestration',
          maturity: 'Mature',
          vendors: ['Google', 'Red Hat', 'VMware'],
          adoptionRate: 'High',
          cost: 'Open Source + Enterprise Support'
        })
      });
      
      const result = await WebSearch.validateTechnology('Kubernetes');

      expect(result).toBeDefined();
      expect(result.maturity).toBe('Mature');
      expect(result.vendors).toBeInstanceOf(Array);
      expect(result.vendors.length).toBeGreaterThan(0);
    });
  });

  describe('getIndustryInsights()', () => {
    
    test('fetches industry-specific insights', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          industry: 'Financial Services',
          marketTrends: [
            'Digital banking adoption',
            'Open banking APIs',
            'Embedded finance'
          ],
          commonChallenges: [
            'Legacy system modernization',
            'Regulatory compliance',
            'Cybersecurity threats'
          ],
          typicalSolutions: [
            'Cloud migration',
            'API-first architecture',
            'Zero-trust security'
          ],
          keyMetrics: {
            'Digital adoption rate': '65-80%',
            'Cloud spend': '$5-10M annually'
          }
        })
      });
      
      const result = await WebSearch.getIndustryInsights('Financial Services');

      expect(result).toBeDefined();
      expect(result.marketTrends).toBeInstanceOf(Array);
      expect(result.marketTrends.length).toBeGreaterThan(0);
      expect(result.commonChallenges).toBeInstanceOf(Array);
      expect(result.typicalSolutions).toBeInstanceOf(Array);
    });
  });

  describe('Search Statistics & Transparency', () => {
    
    test('tracks search count per step', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'Test', industry: 'Test' })
      });

      await WebSearch.validateOrganization('Company1');
      await WebSearch.validateOrganization('Company2');

      const stats = WebSearch.getSearchStats();
      expect(stats.count).toBe(2);
      expect(stats.remaining).toBe(3);
      expect(stats.limit).toBe(5);
    });

    test('resetSearchCount() clears counter for new step', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'Test', industry: 'Test' })
      });

      // Make some searches
      await WebSearch.validateOrganization('Test1');
      await WebSearch.validateOrganization('Test2');

      expect(WebSearch.getSearchStats().count).toBe(2);

      // Reset
      WebSearch.resetSearchCount();
      expect(WebSearch.getSearchStats().count).toBe(0);
      expect(WebSearch.getSearchStats().remaining).toBe(5);
    });

    test('provides transparency indicator for validated data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'ValidCorp', industry: 'Tech', confidence: 0.95 })
      });
      
      const result = await WebSearch.validateOrganization('ValidCorp');

      expect(result.transparency).toBeDefined();
      expect(result.transparency).toBe('✓ Validated via web search');
    });

    test('provides transparency indicator for user-provided data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      const result = await WebSearch.validateOrganization('UnknownCorp');

      expect(result.transparency).toBeDefined();
      expect(result.transparency).toBe('⊙ User-provided (not validated)');
    });
  });

  describe('AI Contradiction Detection', () => {
    
    test('detects capability without linked objective', () => {
      const model = {
        businessContext: {
          primaryObjectives: [
            { id: 'obj1', objective: 'Increase revenue' }
          ],
          enrichment: {
            capabilityGaps: [
              { capability: 'CRM', linkedObjective: 'obj1' },
              { capability: 'ERP', linkedObjective: null }  // ← Contradiction
            ]
          }
        }
      };

      const contradictions = WebSearch.detectContradictions(model);

      expect(contradictions).toBeInstanceOf(Array);
      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0]).toContain('ERP');
      expect(contradictions[0]).toContain('not linked to any objective');
    });

    test('detects BMC not aligned to objectives', () => {
      const model = {
        businessContext: {
          primaryObjectives: [
            { id: 'obj1', objective: 'Expand to Asia', category: 'Growth' }
          ],
          enrichment: {
            bmcInsights: {
              customerSegments: ['North America only'],
              valuePropositions: ['US market leader']
            }
          }
        }
      };

      const contradictions = WebSearch.detectContradictions(model);

      expect(contradictions).toBeInstanceOf(Array);
      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0]).toContain('BMC');
      expect(contradictions[0]).toContain('Asia');
    });

    test('returns empty array when no contradictions', () => {
      const model = {
        businessContext: {
          primaryObjectives: [
            { id: 'obj1', objective: 'Increase revenue' }
          ],
          enrichment: {
            capabilityGaps: [
              { capability: 'CRM', linkedObjective: 'obj1' }
            ],
            bmcInsights: {
              valuePropositions: ['Revenue growth platform']
            }
          }
        }
      };

      const contradictions = WebSearch.detectContradictions(model);

      expect(contradictions).toBeInstanceOf(Array);
      expect(contradictions.length).toBe(0);
    });
  });
});
