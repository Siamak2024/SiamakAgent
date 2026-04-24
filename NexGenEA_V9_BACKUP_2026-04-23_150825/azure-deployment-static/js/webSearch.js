/**
 * webSearch.js - Web Search & Validation Module
 * 
 * GOLDEN RULE: Validate Business Context data via web search to ensure accuracy.
 * 
 * Features:
 * - Organization validation
 * - Objective benchmarking
 * - Technology validation
 * - Industry insights
 * - Search limit enforcement (≤5 per step)
 * - Result caching
 * - Transparency indicators
 * - Contradiction detection
 */

// Search state management
let searchCount = 0;
const SEARCH_LIMIT = 5;
const cache = new Map();

/**
 * Reset search counter (call at start of each step)
 */
function resetSearchCount() {
  searchCount = 0;
}

/**
 * Get current search statistics
 */
function getSearchStats() {
  return {
    count: searchCount,
    remaining: Math.max(0, SEARCH_LIMIT - searchCount),
    limit: SEARCH_LIMIT
  };
}

/**
 * Check if search limit has been reached
 */
function isSearchLimitReached() {
  return searchCount >= SEARCH_LIMIT;
}

/**
 * Validate organization via web search
 * 
 * @param {string} companyName - Organization name to validate
 * @returns {Promise<Object>} Validation result with org_name, industry, confidence
 */
async function validateOrganization(companyName) {
  // Check cache first
  const cacheKey = `org:${companyName.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Check search limit
  if (isSearchLimitReached()) {
    return {
      org_name: companyName,
      industry: 'Unknown',
      confidence: 0,
      source: 'user_provided',
      transparency: '⊙ User-provided (search limit reached)'
    };
  }

  searchCount++;

  try {
    // In production, this would call a real search API
    // For now, we use fetch which will be mocked in tests
    const response = await fetch(`/api/validate-org?name=${encodeURIComponent(companyName)}`);
    
    if (response.ok) {
      const data = await response.json();
      const result = {
        org_name: data.name || companyName,
        industry: data.industry || 'Unknown',
        confidence: data.confidence || 0.9,
        source: 'web_search',
        transparency: '✓ Validated via web search',
        description: data.description || ''
      };
      
      // Cache result
      cache.set(cacheKey, result);
      return result;
    } else {
      // Not found - return user-provided data
      const result = {
        org_name: companyName,
        industry: 'Unknown',
        confidence: 0.3,
        source: 'user_provided',
        transparency: '⊙ User-provided (not validated)'
      };
      
      cache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('Web search failed:', error);
    return {
      org_name: companyName,
      industry: 'Unknown',
      confidence: 0.3,
      source: 'user_provided',
      transparency: '⊙ User-provided (search failed)'
    };
  }
}

/**
 * Enrich objective with industry benchmarks
 * 
 * @param {string} objective - Business objective text
 * @param {string} industry - Industry context
 * @returns {Promise<Object|null>} Benchmark data or null if limit reached
 */
async function enrichObjectiveWithBenchmarks(objective, industry) {
  // Check cache
  const cacheKey = `benchmark:${objective}:${industry}`.toLowerCase();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Check search limit
  if (isSearchLimitReached()) {
    return null;
  }

  searchCount++;

  try {
    const response = await fetch('/api/benchmark-objective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, industry })
    });

    if (response.ok) {
      const data = await response.json();
      const result = {
        objective: data.objective || objective,
        industryBenchmark: data.industryBenchmark || '',
        feasibilityScore: data.feasibilityScore || 0.75,
        competitors: data.competitors || [],
        insights: data.insights || ''
      };
      
      cache.set(cacheKey, result);
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.warn('Benchmark fetch failed:', error);
    return null;
  }
}

/**
 * Validate technology component
 * 
 * @param {string} technologyName - Technology/platform name
 * @returns {Promise<Object|null>} Technology validation data
 */
async function validateTechnology(technologyName) {
  // Check cache
  const cacheKey = `tech:${technologyName.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Check search limit
  if (isSearchLimitReached()) {
    return null;
  }

  searchCount++;

  try {
    const response = await fetch(`/api/validate-tech?name=${encodeURIComponent(technologyName)}`);

    if (response.ok) {
      const data = await response.json();
      const result = {
        name: data.name || technologyName,
        category: data.category || 'Technology',
        maturity: data.maturity || 'Unknown',
        vendors: data.vendors || [],
        adoptionRate: data.adoptionRate || 'Unknown',
        cost: data.cost || 'Variable'
      };
      
      cache.set(cacheKey, result);
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.warn('Technology validation failed:', error);
    return null;
  }
}

/**
 * Get industry-specific insights
 * 
 * @param {string} industry - Industry name
 * @returns {Promise<Object|null>} Industry insights
 */
async function getIndustryInsights(industry) {
  // Check cache
  const cacheKey = `industry:${industry.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Check search limit
  if (isSearchLimitReached()) {
    return null;
  }

  searchCount++;

  try {
    const response = await fetch(`/api/industry-insights?industry=${encodeURIComponent(industry)}`);

    if (response.ok) {
      const data = await response.json();
      const result = {
        industry: data.industry || industry,
        marketTrends: data.marketTrends || [],
        commonChallenges: data.commonChallenges || [],
        typicalSolutions: data.typicalSolutions || [],
        keyMetrics: data.keyMetrics || {}
      };
      
      cache.set(cacheKey, result);
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.warn('Industry insights fetch failed:', error);
    return null;
  }
}

/**
 * Detect contradictions in EA model
 * 
 * @param {Object} model - EA model object
 * @returns {Array<string>} Array of contradiction messages
 */
function detectContradictions(model) {
  const contradictions = [];

  if (!model.businessContext) {
    return contradictions;
  }

  const primaryObjectives = model.businessContext.primaryObjectives || [];
  const enrichment = model.businessContext.enrichment || {};

  // Check 1: Capability gaps without linked objectives
  if (enrichment.capabilityGaps) {
    enrichment.capabilityGaps.forEach(gap => {
      if (!gap.linkedObjective) {
        contradictions.push(
          `⚠️ Capability gap "${gap.capability}" is not linked to any objective. All capabilities should support Primary Objectives.`
        );
      }
    });
  }

  // Check 2: BMC not aligned to objectives
  if (enrichment.bmcInsights && primaryObjectives.length > 0) {
    const objectiveKeywords = primaryObjectives.map(obj => 
      obj.objective.toLowerCase().split(' ')
    ).flat();

    const bmcText = JSON.stringify(enrichment.bmcInsights).toLowerCase();
    
    // Simple heuristic: if objective mentions "Asia" but BMC doesn't, flag it
    primaryObjectives.forEach(obj => {
      const keywords = ['asia', 'europe', 'global', 'international', 'expand', 'market'];
      const hasGeoKeyword = keywords.some(kw => obj.objective.toLowerCase().includes(kw));
      
      if (hasGeoKeyword) {
        const bmcMentions = keywords.some(kw => bmcText.includes(kw));
        if (!bmcMentions && bmcText.includes('north america') || bmcText.includes('us market')) {
          contradictions.push(
            `⚠️ BMC may not be aligned to objective "${obj.objective}". Customer segments and value propositions should support geographic expansion.`
          );
        }
      }
    });
  }

  // Check 3: Operating model risks without affected objectives
  if (enrichment.operatingModelRisks) {
    enrichment.operatingModelRisks.forEach(risk => {
      if (!risk.affectedObjective && risk.severity === 'High') {
        contradictions.push(
          `⚠️ High-severity risk "${risk.risk}" is not linked to an objective. Understand which goals are at risk.`
        );
      }
    });
  }

  // Check 4: Critical gaps without objective impact
  if (enrichment.criticalGaps) {
    enrichment.criticalGaps.forEach(gap => {
      if (!gap.affectedObjective && gap.priority <= 3) {
        contradictions.push(
          `⚠️ Top-priority gap "${gap.gap}" (P${gap.priority}) is not linked to an objective. Prioritization should be driven by objective impact.`
        );
      }
    });
  }

  return contradictions;
}

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateOrganization,
    enrichObjectiveWithBenchmarks,
    validateTechnology,
    getIndustryInsights,
    detectContradictions,
    resetSearchCount,
    getSearchStats
  };
}

// Export for browser (global)
if (typeof window !== 'undefined') {
  window.WebSearch = {
    validateOrganization,
    enrichObjectiveWithBenchmarks,
    validateTechnology,
    getIndustryInsights,
    detectContradictions,
    resetSearchCount,
    getSearchStats
  };
}
