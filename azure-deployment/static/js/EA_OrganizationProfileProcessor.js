/**
 * EA_OrganizationProfileProcessor.js
 * 
 * Purpose: Process multi-paragraph organizational summaries into structured JSON profiles
 * Version: 1.0
 * Date: April 22, 2026
 * 
 * Key Functions:
 * - processOrganizationalSummary(): Main entry point for processing user summaries
 * - extractStructuredData(): AI-powered extraction using GPT-5
 * - validateAndEnrichProfile(): Validation and quality assurance
 * - generateExecutiveSummary(): Create executive summary from profile
 * - calculateCompleteness(): Score profile completeness (0-100%)
 * 
 * Dependencies:
 * - AzureOpenAIProxy (GPT-5 integration)
 * - Instruction file: step0/0_2_organization_profile_processor.instruction.md
 * - Data contract: step0/ORGANIZATION_PROFILE_DATA_CONTRACT.md
 */

window.EA_OrganizationProfileProcessor = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        MIN_SUMMARY_LENGTH: 100,        // Minimum characters for processing
        RECOMMENDED_LENGTH: 500,        // Recommended minimum (words)
        MAX_RETRIES: 2,                 // Retry attempts for AI calls
        COMPLETENESS_THRESHOLD: 60,     // Minimum completeness for quality output
        AI_MODEL: 'gpt-5',              // Model for processing
        INSTRUCTION_FILE: 'step0/0_2_organization_profile_processor.instruction.md'
    };

    /**
     * Preprocess user input to normalize formatting from various sources
     * Handles copy-pasted content from AI chats, markdown files, etc.
     * 
     * @param {string} text - Raw user input
     * @returns {string} - Cleaned and normalized text
     */
    function preprocessInputText(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        let cleaned = text;

        // 1. Remove HTML tags (in case of copy-paste from web)
        cleaned = cleaned.replace(/<[^>]*>/g, ' ');

        // 2. Remove markdown headers (###, ##, #)
        cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

        // 3. Remove markdown bold/italic (**text**, *text*, __text__, _text_)
        cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
        cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

        // 4. Remove markdown links [text](url) -> text
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

        // 5. Remove markdown bullet points (-, *, +)
        cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');

        // 6. Remove markdown numbered lists (1., 2., etc.)
        cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

        // 7. Remove markdown code blocks (```...```)
        cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ');
        cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

        // 8. Remove markdown blockquotes (>)
        cleaned = cleaned.replace(/^>\s+/gm, '');

        // 9. Normalize excessive line breaks (max 2 consecutive)
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

        // 10. Normalize excessive spaces (max 1)
        cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

        // 11. Remove zero-width characters and other invisible characters
        cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

        // 12. Remove leading/trailing whitespace on each line
        cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

        // 13. Final trim
        cleaned = cleaned.trim();

        // 14. Log if significant transformation occurred
        const originalLength = text.length;
        const cleanedLength = cleaned.length;
        const reduction = originalLength - cleanedLength;
        
        if (reduction > originalLength * 0.2) {
            console.log(`[OrganizationProfileProcessor] Preprocessing removed ${reduction} characters (${Math.round(reduction/originalLength*100)}% reduction)`);
            console.log('[OrganizationProfileProcessor] Detected formatted content - automatically cleaned for optimal processing');
        }

        return cleaned;
    }

    /**
     * Main entry point: Process organizational summary into structured profile
     * 
     * @param {string} summaryText - User's organizational summary (freeform text)
     * @param {Object} options - Optional configuration
     * @param {Function} progressCallback - Optional progress updates
     * @returns {Promise<Object>} - Structured organization profile or error
     */
    async function processOrganizationalSummary(summaryText, options = {}, progressCallback = null) {
        console.log('[OrganizationProfileProcessor] Starting processing...');
        
        try {
            // Step 0: Preprocess input to normalize formatting
            updateProgress(progressCallback, 'Preparing input...', 5);
            summaryText = preprocessInputText(summaryText);
            console.log('[OrganizationProfileProcessor] Input preprocessed and normalized');

            // Step 1: Validate input
            updateProgress(progressCallback, 'Validating input...', 10);
            const validation = validateInput(summaryText);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error,
                    message: validation.message
                };
            }

            // Step 2: Extract structured data using AI
            updateProgress(progressCallback, 'Analyzing organizational summary with AI...', 30);
            const extractedProfile = await extractStructuredData(summaryText, options);
            
            if (!extractedProfile.success) {
                return extractedProfile; // Return error
            }

            // Step 3: Validate and enrich the profile
            updateProgress(progressCallback, 'Validating and enriching profile...', 70);
            const enrichedProfile = await validateAndEnrichProfile(extractedProfile.data, summaryText);

            // Step 4: Calculate completeness score
            updateProgress(progressCallback, 'Calculating completeness...', 90);
            const completeness = calculateCompleteness(enrichedProfile);
            enrichedProfile.metadata.completeness = completeness;

            // Step 5: Generate warnings if completeness is low
            if (completeness < CONFIG.COMPLETENESS_THRESHOLD) {
                enrichedProfile.metadata.warnings = generateCompletenessWarnings(enrichedProfile);
            }

            updateProgress(progressCallback, 'Complete!', 100);

            console.log('[OrganizationProfileProcessor] Processing complete. Completeness:', completeness + '%');

            return {
                success: true,
                profile: enrichedProfile,
                completeness: completeness,
                readyForWorkflow: completeness >= CONFIG.COMPLETENESS_THRESHOLD
            };

        } catch (error) {
            console.error('[OrganizationProfileProcessor] Error:', error);
            return {
                success: false,
                error: 'Processing failed',
                message: error.message || 'An unexpected error occurred during processing',
                details: error
            };
        }
    }

    /**
     * Validate input summary text
     * 
     * @param {string} summaryText - User input
     * @returns {Object} - Validation result {valid, error, message}
     */
    function validateInput(summaryText) {
        if (!summaryText || typeof summaryText !== 'string') {
            return {
                valid: false,
                error: 'Invalid input',
                message: 'Summary text is required and must be a string.'
            };
        }

        const trimmed = summaryText.trim();
        const length = trimmed.length;
        const wordCount = trimmed.split(/\s+/).length;

        if (length < CONFIG.MIN_SUMMARY_LENGTH) {
            return {
                valid: false,
                error: 'Input too short',
                message: `Organization summary must be at least ${CONFIG.MIN_SUMMARY_LENGTH} characters. Current length: ${length} characters. Please provide more detail about the organization.`,
                requiredLength: CONFIG.MIN_SUMMARY_LENGTH,
                actualLength: length
            };
        }

        if (wordCount < 50) {
            return {
                valid: true, // Allow but warn
                warning: `Summary is quite short (${wordCount} words). For best results, aim for ${CONFIG.RECOMMENDED_LENGTH}+ words with details about strategic priorities, challenges, and organizational context.`,
                wordCount: wordCount
            };
        }

        return { valid: true, wordCount: wordCount };
    }

    /**
     * Extract structured data from summary using AI
     * 
     * @param {string} summaryText - User's organizational summary
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} - Extracted profile data
     */
    async function extractStructuredData(summaryText, options = {}) {
        console.log('[OrganizationProfileProcessor] Calling GPT-5 for extraction...');

        try {
            // Load instruction file
            const instructionContent = await loadInstructionFile(CONFIG.INSTRUCTION_FILE);
            
            // Prepare prompt
            const userPrompt = `USER ORGANIZATIONAL SUMMARY:\n\n${summaryText}\n\n---\n\nExtract and structure this information according to the Organization Profile schema. Return ONLY valid JSON with no markdown formatting.`;

            // Call GPT-5
            const response = await callAIWithRetry(instructionContent, userPrompt, options);

            if (!response.success) {
                return response; // Return error
            }

            // Parse JSON response
            const parsedProfile = parseAIResponse(response.text);
            
            if (!parsedProfile.success) {
                return parsedProfile; // Return parse error
            }

            return {
                success: true,
                data: parsedProfile.data
            };

        } catch (error) {
            console.error('[OrganizationProfileProcessor] Extraction error:', error);
            return {
                success: false,
                error: 'AI extraction failed',
                message: error.message || 'Failed to extract structured data from summary',
                details: error
            };
        }
    }

    /**
     * Call AI with retry logic
     * 
     * @param {string} systemPrompt - AI system instructions
     * @param {string} userPrompt - User input
     * @param {Object} options - Call options
     * @returns {Promise<Object>} - AI response
     */
    async function callAIWithRetry(systemPrompt, userPrompt, options = {}) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
            try {
                console.log(`[OrganizationProfileProcessor] AI call attempt ${attempt}/${CONFIG.MAX_RETRIES}`);
                
                const aiProxy = await AzureOpenAIProxy.create({
                    instructions: systemPrompt,
                    model: options.model || CONFIG.AI_MODEL
                });

                const response = await aiProxy.chat(userPrompt);
                
                return {
                    success: true,
                    text: response,
                    attempt: attempt
                };

            } catch (error) {
                console.warn(`[OrganizationProfileProcessor] Attempt ${attempt} failed:`, error);
                lastError = error;
                
                // Wait before retry (exponential backoff)
                if (attempt < CONFIG.MAX_RETRIES) {
                    await sleep(1000 * attempt);
                }
            }
        }

        // All retries failed
        return {
            success: false,
            error: 'AI call failed',
            message: `Failed after ${CONFIG.MAX_RETRIES} attempts: ${lastError.message}`,
            details: lastError
        };
    }

    /**
     * Parse AI response JSON
     * 
     * @param {string} responseText - Raw AI response
     * @returns {Object} - Parsed profile or error
     */
    function parseAIResponse(responseText) {
        try {
            // Remove markdown code fences if present
            let cleaned = responseText.trim();
            
            // Remove ```json or ``` wrappers
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
            }

            // Parse JSON
            const parsed = JSON.parse(cleaned);

            // Check if it's an error structure
            if (parsed.error) {
                return {
                    success: false,
                    error: parsed.error,
                    message: parsed.message || 'AI returned an error',
                    details: parsed
                };
            }

            return {
                success: true,
                data: parsed
            };

        } catch (error) {
            console.error('[OrganizationProfileProcessor] JSON parse error:', error);
            console.error('Response text:', responseText);
            
            return {
                success: false,
                error: 'Invalid JSON response',
                message: 'AI returned invalid JSON. Please try again or contact support.',
                details: {
                    parseError: error.message,
                    responsePreview: responseText.substring(0, 200)
                }
            };
        }
    }

    /**
     * Validate and enrich the extracted profile
     * 
     * @param {Object} profile - Extracted profile data
     * @param {string} originalSummary - Original user input
     * @returns {Object} - Validated and enriched profile
     */
    async function validateAndEnrichProfile(profile, originalSummary) {
        console.log('[OrganizationProfileProcessor] Validating and enriching profile...');

        // Ensure required fields
        if (!profile.organizationName) {
            profile.organizationName = 'Unknown Organization';
        }
        if (!profile.industry) {
            profile.industry = 'Unknown Industry';
        }

        // Ensure metadata exists
        if (!profile.metadata) {
            profile.metadata = {};
        }

        // Set metadata fields
        const now = Date.now();
        profile.metadata = {
            ...profile.metadata,
            createdAt: profile.metadata.createdAt || now,
            updatedAt: now,
            processedBy: 'AI',
            source: 'User summary',
            version: '1.0',
            originalSummary: originalSummary
        };

        // Ensure arrays are arrays (not null)
        profile.strategicPriorities = profile.strategicPriorities || [];
        profile.challenges = profile.challenges || [];
        profile.opportunities = profile.opportunities || [];
        profile.constraints = profile.constraints || [];

        // Generate executive summary if missing or incomplete
        if (!profile.executiveSummary || !profile.executiveSummary.oneLinePitch) {
            profile.executiveSummary = await generateExecutiveSummary(profile);
        }

        // Validate enums and fix if needed
        profile = validateEnumValues(profile);

        return profile;
    }

    /**
     * Validate enum values and fix if needed
     * 
     * @param {Object} profile - Profile to validate
     * @returns {Object} - Validated profile
     */
    function validateEnumValues(profile) {
        // Company size category
        const validSizeCategories = ['SME', 'Mid-Market', 'Enterprise', 'Large Enterprise'];
        if (profile.companySize && !validSizeCategories.includes(profile.companySize.sizeCategory)) {
            // Auto-correct based on employee count
            const emp = profile.companySize.employees || 0;
            if (emp < 250) profile.companySize.sizeCategory = 'SME';
            else if (emp < 2000) profile.companySize.sizeCategory = 'Mid-Market';
            else if (emp < 10000) profile.companySize.sizeCategory = 'Enterprise';
            else profile.companySize.sizeCategory = 'Large Enterprise';
        }

        // Challenge/opportunity severity/potential
        const validSeverity = ['Critical', 'High', 'Medium', 'Low'];
        if (profile.challenges) {
            profile.challenges.forEach(c => {
                if (!validSeverity.includes(c.severity)) {
                    c.severity = 'Medium'; // Default
                }
            });
        }
        if (profile.opportunities) {
            profile.opportunities.forEach(o => {
                if (!validSeverity.includes(o.potential)) {
                    o.potential = 'Medium'; // Default
                }
            });
        }

        // Transformation readiness
        const validReadiness = ['Low', 'Medium', 'High', 'Very High'];
        if (profile.executiveSummary && !validReadiness.includes(profile.executiveSummary.transformationReadiness)) {
            profile.executiveSummary.transformationReadiness = 'Medium'; // Default
        }

        return profile;
    }

    /**
     * Generate executive summary from profile data
     * 
     * @param {Object} profile - Organization profile
     * @returns {Object} - Executive summary structure
     */
    async function generateExecutiveSummary(profile) {
        console.log('[OrganizationProfileProcessor] Generating executive summary...');

        // Generate one-line pitch
        const oneLinePitch = generateOneLinePitch(profile);

        // Extract three key facts
        const threeKeyFacts = extractKeyFacts(profile);

        // Generate strategic narrative
        const strategicNarrative = generateStrategicNarrative(profile);

        // Assess transformation readiness
        const transformationReadiness = assessTransformationReadiness(profile);

        return {
            oneLinePitch: oneLinePitch,
            threeKeyFacts: threeKeyFacts,
            strategicNarrative: strategicNarrative,
            transformationReadiness: transformationReadiness
        };
    }

    /**
     * Generate one-line pitch (max 150 chars)
     * 
     * @param {Object} profile - Organization profile
     * @returns {string} - One-line pitch
     */
    function generateOneLinePitch(profile) {
        const org = profile.organizationName || 'Organization';
        const industry = profile.industry || 'industry';
        const position = profile.markets?.marketPosition || 'player';
        const size = profile.companySize?.sizeCategory || '';

        let pitch = `${position} in ${industry}`;
        
        // Add differentiator if available
        if (profile.markets?.differentiators && profile.markets.differentiators.length > 0) {
            const diff = profile.markets.differentiators[0];
            pitch = `${org}: ${position} in ${industry} with ${diff}`;
        } else {
            pitch = `${org}: ${size} ${position} in ${industry}`;
        }

        // Truncate to 150 chars
        if (pitch.length > 150) {
            pitch = pitch.substring(0, 147) + '...';
        }

        return pitch;
    }

    /**
     * Extract three key facts about the organization
     * 
     * @param {Object} profile - Organization profile
     * @returns {Array<string>} - Three key facts
     */
    function extractKeyFacts(profile) {
        const facts = [];

        // Fact 1: Size and scale
        if (profile.companySize?.employees) {
            const emp = profile.companySize.employees;
            const locations = profile.companySize.locations || 1;
            const countries = profile.companySize.countries?.length || 1;
            
            let fact = `${emp} employees`;
            if (locations > 1) fact += ` across ${locations} locations`;
            if (countries > 1) fact += ` in ${countries} countries`;
            
            facts.push(fact);
        }

        // Fact 2: Market position or customer base
        if (profile.markets?.marketPosition && profile.markets?.primaryMarkets) {
            const position = profile.markets.marketPosition;
            const market = profile.markets.primaryMarkets[0] || profile.markets.geographicPresence;
            facts.push(`${position} in ${market}`);
        } else if (profile.customers?.customerCount) {
            facts.push(`Serving ${profile.customers.customerCount}+ customers`);
        }

        // Fact 3: Strategic focus or key differentiator
        if (profile.strategicPriorities && profile.strategicPriorities.length > 0) {
            const topPriority = profile.strategicPriorities[0].priority;
            facts.push(`Strategic focus: ${topPriority}`);
        } else if (profile.markets?.differentiators && profile.markets.differentiators.length > 0) {
            facts.push(`Key differentiator: ${profile.markets.differentiators[0]}`);
        }

        // Fill with fallbacks if needed
        while (facts.length < 3) {
            if (facts.length === 0) facts.push(profile.industry || 'Industry player');
            else if (facts.length === 1) facts.push(profile.missionStatement || 'Mission-driven organization');
            else facts.push('Focused on innovation and growth');
        }

        return facts.slice(0, 3);
    }

    /**
     * Generate strategic narrative (2-3 paragraphs)
     * 
     * @param {Object} profile - Organization profile
     * @returns {string} - Strategic narrative
     */
    function generateStrategicNarrative(profile) {
        let narrative = '';

        // Paragraph 1: Company overview and current state
        const org = profile.organizationName || 'The organization';
        const industry = profile.industry || 'its industry';
        const size = profile.companySize?.employees ? `${profile.companySize.employees} employees` : 'a growing team';
        const mission = profile.missionStatement || 'deliver value to its customers';

        narrative += `${org} operates in ${industry} with ${size}. The organization's mission is to ${mission}. `;

        if (profile.markets?.marketPosition) {
            narrative += `As a ${profile.markets.marketPosition} in the market, `;
            if (profile.markets.competitiveLandscape) {
                narrative += profile.markets.competitiveLandscape + ' ';
            }
        }

        narrative += '\n\n';

        // Paragraph 2: Strategic priorities and challenges
        if (profile.strategicPriorities && profile.strategicPriorities.length > 0) {
            narrative += `The strategic focus for the coming years includes `;
            const priorities = profile.strategicPriorities.map(p => p.priority).join(', ');
            narrative += priorities + '. ';
        }

        if (profile.challenges && profile.challenges.length > 0) {
            narrative += `Key challenges include `;
            const challenges = profile.challenges.slice(0, 3).map(c => c.challenge).join(', ');
            narrative += challenges + '. ';
        }

        if (profile.opportunities && profile.opportunities.length > 0) {
            narrative += `However, significant opportunities exist in `;
            const opportunities = profile.opportunities.slice(0, 2).map(o => o.opportunity).join(' and ');
            narrative += opportunities + '. ';
        }

        narrative += '\n\n';

        // Paragraph 3: Future outlook and transformation readiness
        narrative += `Looking ahead, `;
        
        if (profile.financial?.investmentCapacity) {
            const capacity = profile.financial.investmentCapacity;
            if (capacity === 'Significant' || capacity === 'Strong') {
                narrative += `the organization has strong investment capacity to drive transformation. `;
            } else if (capacity === 'Moderate') {
                narrative += `the organization has moderate resources available for strategic initiatives. `;
            } else {
                narrative += `the organization faces resource constraints but remains committed to strategic goals. `;
            }
        }

        if (profile.culture?.changeReadiness) {
            const readiness = profile.culture.changeReadiness;
            if (readiness === 'High' || readiness === 'Very High') {
                narrative += `The organization demonstrates high change readiness and a culture that supports innovation. `;
            } else if (readiness === 'Medium') {
                narrative += `The organization is building change readiness and adapting its culture for transformation. `;
            } else {
                narrative += `Cultural change management will be important for successful transformation. `;
            }
        }

        if (profile.strategicPriorities && profile.strategicPriorities.length > 0) {
            const criticalPriorities = profile.strategicPriorities.filter(p => p.importance === 'Critical');
            if (criticalPriorities.length > 0) {
                narrative += `With clear strategic priorities and organizational commitment, the organization is positioned to achieve its transformation goals.`;
            } else {
                narrative += `By executing on strategic priorities, the organization can strengthen its market position and drive sustainable growth.`;
            }
        }

        return narrative;
    }

    /**
     * Assess transformation readiness
     * 
     * @param {Object} profile - Organization profile
     * @returns {string} - Readiness level (Low|Medium|High|Very High)
     */
    function assessTransformationReadiness(profile) {
        let score = 0;

        // Factor 1: Strategic clarity (25 points)
        if (profile.strategicPriorities && profile.strategicPriorities.length >= 3) {
            score += 25;
        } else if (profile.strategicPriorities && profile.strategicPriorities.length >= 1) {
            score += 15;
        }

        // Factor 2: Investment capacity (25 points)
        const capacity = profile.financial?.investmentCapacity;
        if (capacity === 'Significant') score += 25;
        else if (capacity === 'Strong') score += 20;
        else if (capacity === 'Moderate') score += 10;
        else if (capacity === 'Limited') score += 0;

        // Factor 3: Change readiness (25 points)
        const changeReadiness = profile.culture?.changeReadiness;
        if (changeReadiness === 'Very High') score += 25;
        else if (changeReadiness === 'High') score += 20;
        else if (changeReadiness === 'Medium') score += 10;
        else if (changeReadiness === 'Low') score += 0;

        // Factor 4: Challenge awareness (15 points)
        if (profile.challenges && profile.challenges.length >= 3) {
            score += 15; // Aware of challenges = ready to address them
        } else if (profile.challenges && profile.challenges.length >= 1) {
            score += 10;
        }

        // Factor 5: Opportunity identification (10 points)
        if (profile.opportunities && profile.opportunities.length >= 2) {
            score += 10;
        } else if (profile.opportunities && profile.opportunities.length >= 1) {
            score += 5;
        }

        // Map score to readiness level
        if (score >= 75) return 'Very High';
        if (score >= 55) return 'High';
        if (score >= 35) return 'Medium';
        return 'Low';
    }

    /**
     * Calculate completeness score (0-100%)
     * 
     * @param {Object} profile - Organization profile
     * @returns {number} - Completeness percentage
     */
    function calculateCompleteness(profile) {
        console.log('[OrganizationProfileProcessor] Calculating completeness...');

        const weights = {
            coreIdentity: 15,       // name, industry, size
            businessOverview: 15,   // mission, vision, business model
            offerings: 10,          // products/services
            markets: 10,            // market position, competitors
            strategicPriorities: 15, // priorities (CRITICAL)
            challenges: 10,         // challenges & opportunities
            structure: 10,          // organizational structure
            technology: 10,         // tech landscape
            financial: 5            // financial context
        };

        let score = 0;

        // Core Identity (15 points)
        if (profile.organizationName && profile.industry && profile.companySize?.employees) {
            score += weights.coreIdentity;
        } else if (profile.organizationName && profile.industry) {
            score += weights.coreIdentity * 0.7;
        }

        // Business Overview (15 points)
        if (profile.missionStatement && profile.visionStatement && profile.businessModel?.type) {
            score += weights.businessOverview;
        } else if (profile.missionStatement || profile.visionStatement) {
            score += weights.businessOverview * 0.5;
        }

        // Offerings (10 points)
        if (profile.offerings && profile.offerings.length >= 2) {
            score += weights.offerings;
        } else if (profile.offerings && profile.offerings.length >= 1) {
            score += weights.offerings * 0.6;
        }

        // Markets (10 points)
        if (profile.markets?.marketPosition && profile.markets?.competitiveLandscape) {
            score += weights.markets;
        } else if (profile.markets?.marketPosition) {
            score += weights.markets * 0.6;
        }

        // Strategic Priorities (15 points - CRITICAL)
        if (profile.strategicPriorities && profile.strategicPriorities.length >= 3) {
            score += weights.strategicPriorities;
        } else if (profile.strategicPriorities && profile.strategicPriorities.length >= 1) {
            score += weights.strategicPriorities * 0.5;
        }

        // Challenges (10 points)
        if (profile.challenges && profile.challenges.length >= 3) {
            score += weights.challenges;
        } else if (profile.challenges && profile.challenges.length >= 1) {
            score += weights.challenges * 0.6;
        }

        // Structure (10 points)
        if (profile.structure?.type && profile.structure?.governanceModel) {
            score += weights.structure;
        } else if (profile.structure?.type) {
            score += weights.structure * 0.5;
        }

        // Technology (10 points)
        if (profile.technologyLandscape?.cloudAdoption && profile.technologyLandscape?.techDebt) {
            score += weights.technology;
        } else if (profile.technologyLandscape?.cloudAdoption) {
            score += weights.technology * 0.5;
        }

        // Financial (5 points)
        if (profile.financial?.revenue && profile.financial?.growth) {
            score += weights.financial;
        } else if (profile.financial?.growth || profile.financial?.investmentCapacity) {
            score += weights.financial * 0.5;
        }

        return Math.round(Math.min(100, score));
    }

    /**
     * Generate warnings for incomplete profile
     * 
     * @param {Object} profile - Organization profile
     * @returns {Array<string>} - Warning messages
     */
    function generateCompletenessWarnings(profile) {
        const warnings = [];

        if (!profile.strategicPriorities || profile.strategicPriorities.length < 3) {
            warnings.push('Missing strategic priorities - AI-generated Strategic Intent may be generic');
        }

        if (!profile.challenges || profile.challenges.length < 2) {
            warnings.push('Limited challenge information - Gap Analysis will have reduced accuracy');
        }

        if (!profile.technologyLandscape || !profile.technologyLandscape.cloudAdoption) {
            warnings.push('No technology landscape information - Operating Model design will be limited');
        }

        if (!profile.financial || !profile.financial.investmentCapacity) {
            warnings.push('Financial context not provided - Value Pool estimation and roadmap phasing will be imprecise');
        }

        if (!profile.missionStatement && !profile.visionStatement) {
            warnings.push('Missing mission/vision - Business Model Canvas value proposition will need manual refinement');
        }

        if (!profile.markets || !profile.markets.marketPosition) {
            warnings.push('Market position unknown - Competitive analysis and differentiation strategy will be limited');
        }

        return warnings;
    }

    /**
     * Load instruction file content
     * 
     * @param {string} filePath - Relative path to instruction file
     * @returns {Promise<string>} - File content
     */
    async function loadInstructionFile(filePath) {
        try {
            const fullPath = `NexGenEA/js/Instructions/${filePath}`;
            const response = await fetch(fullPath);
            
            if (!response.ok) {
                throw new Error(`Failed to load instruction file: ${fullPath}`);
            }

            const content = await response.text();
            return content;

        } catch (error) {
            console.error('[OrganizationProfileProcessor] Failed to load instruction file:', error);
            
            // Fallback: Return minimal instruction
            return `You are an Enterprise Architecture analyst. Extract structured information from the organizational summary and return valid JSON matching the Organization Profile schema.`;
        }
    }

    /**
     * Update progress callback
     * 
     * @param {Function} callback - Progress callback function
     * @param {string} message - Progress message
     * @param {number} percent - Progress percentage (0-100)
     */
    function updateProgress(callback, message, percent) {
        if (callback && typeof callback === 'function') {
            callback({ message, percent });
        }
    }

    /**
     * Sleep utility for retry backoff
     * 
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} - Promise that resolves after delay
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    return {
        // Main entry point
        processOrganizationalSummary: processOrganizationalSummary,

        // Utility functions (exposed for testing)
        validateInput: validateInput,
        calculateCompleteness: calculateCompleteness,
        generateExecutiveSummary: generateExecutiveSummary,

        // Configuration
        CONFIG: CONFIG
    };

})();

// Auto-attach to window for global access
if (typeof window !== 'undefined') {
    window.EA_OrganizationProfileProcessor = window.EA_OrganizationProfileProcessor;
}

console.log('[OrganizationProfileProcessor] Module loaded successfully');
