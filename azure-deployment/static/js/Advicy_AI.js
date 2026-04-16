/**
 * Advicy AI — Context Engine & Orchestrator
 * Version: 1.0.0 (MVP)
 *
 * Builds a dynamic, layered system prompt for every AI call:
 *   LAYER 1 — BASE:      Core EA expert identity (always present)
 *   LAYER 2 — INDUSTRY:  Domain expertise injected from Phase 4 selection or free-text detection
 *   LAYER 3 — VIEW:      Current tab / EA workflow step context
 *   LAYER 4 — ESG:       Addendum when ESG is an active business area
 *
 * All AI calls go through the Responses API via AzureOpenAIProxy.
 *
 * Public API:
 *   AdvisyAI.updateIndustryLayer(industry)      — call when Phase 4 dropdown changes
 *   AdvisyAI.setActiveView(tabName)             — call inside showTab()
 *   AdvisyAI.updateDescriptionContext(text)     — call from description textarea oninput
 *   AdvisyAI.buildSystemPrompt(options)         — returns full layered prompt string
 *   AdvisyAI.call(userInput, options)           — main AI entry point (Responses API)
 *   AdvisyAI.getState()                         — inspect current context state (debug)
 */
const AdvisyAI = (() => {

  // ── INTERNAL STATE ─────────────────────────────────────────────────────────
  let _state = {
    industry: 'generic',       // set by Phase 4 selector
    activeView: 'exec',        // set by showTab()
    detectedIndustry: null,    // inferred from description text
    descriptionText: ''
  };

  // ── LAYER 1: BASE PROMPT ───────────────────────────────────────────────────
  const BASE_PROMPT = `You are Advicy AI — the intelligent nervous system of the Advicy EA Platform. \
You are a senior enterprise architecture and business strategy advisor supporting C-level executives \
(CIO, CFO, CDO, COO) and their teams across all industries. You have deep mastery of TOGAF, ArchiMate, \
Zachman, SABSA, and modern EA practices. You cover capability mapping, operating model design, digital \
transformation, strategic planning, and technology-enabled business change.

You guide users through the Advicy 7-step EA methodology:
(1) Strategic Intent → (2) Business Model Canvas → (3) Capability Map → \
(4) Operating Model → (5) Gap Analysis → (6) Value Pools → \
(7) Target Architecture & Roadmap.

**AI TRANSFORMATION MINDSET (CRITICAL):**
When generating ANY EA artifact, ALWAYS identify opportunities for AI-driven automation, data-driven \
decision-making, and intelligent process optimization. Flag AI opportunities with clear markers. \
- Capability maps should highlight AI-enabled and AI-augmented capabilities
- Operating models should propose AI agents and intelligent automation
- Value pools should identify AI-driven value creation
- **Architecture layers MUST generate 3-8 specific AI agents** with type (NLP/RPA/Predictive/etc), purpose, and capability links
- Roadmaps should sequence AI infrastructure before AI-dependent initiatives

**MANDATORY for Step 7 Target Architecture:**
Generate AI agents for automation opportunities including:
- Document processing & data entry (RPA, OCR)
- Customer service & support (Conversational AI, NLP)
- Predictive maintenance & forecasting (Predictive Analytics, Machine Learning)
- Data quality & anomaly detection (ML/AI)
- Process optimization & decision support (Decision Support, Recommendation Engines)
Each AI agent MUST link to specific capabilities by name from the capability map.

You are commercially sharp, concise, and always connect guidance to the user's specific strategic \
ambition and context. When you propose changes to the model, discuss first — if the user confirms, \
embed the change as a \`\`\`json block for automatic application.`;

  // ── LAYER 2: INDUSTRY EXPERTISE ────────────────────────────────────────────
  const INDUSTRY_LAYERS = {
    'startup':
      'You are also an expert in fast-growth startup strategy, lean operating models, ' +
      'MVP-to-scale patterns, and venture-backed digital business design.',

    'fintech':
      'You are also an expert in financial technology, open banking, payments architecture, ' +
      'PSD2/PSD3, regulatory compliance (FCA, ECB, Finansinspektionen), core banking ' +
      'modernization, and fintech platform design.',

    'banking':
      'You are also an expert in retail and corporate banking, core banking transformation, ' +
      'Basel III/IV, AML/KYC, credit risk architecture, and digital channel strategy for banks.',

    'healthcare':
      'You are also an expert in healthcare IT and digital health — EHR/EMR architecture, ' +
      'HL7/FHIR interoperability, GDPR for healthcare, HIPAA, patient journey digitization, ' +
      'and clinical operations optimization.',

    'public-sector':
      'You are also an expert in public sector enterprise architecture — government digital ' +
      'services, e-government frameworks, public procurement rules, GDPR for public authorities, ' +
      'digital inclusion, and interoperability standards (ISA2/EIRA). You understand the Swedish ' +
      'public sector context (SKR, Digg, myndigheter, kommunal förvaltning).',

    'retail':
      'You are also an expert in retail and e-commerce — omnichannel architecture, supply chain ' +
      'capability design, PIM/OMS/WMS platform strategy, customer data platforms, and D2C ' +
      'digital transformation.',

    'insurance':
      'You are also an expert in insurance architecture — core insurance system modernization, ' +
      'Solvency II/IFRS 17, underwriting capability design, InsurTech integration patterns, ' +
      'and claims process digitization.',

    'real-estate':
      'You are also an expert in real estate and property systems — property portfolio management, ' +
      'facility management platforms (CAFM/IWMS), tenant lifecycle digitization, lease management ' +
      '(hyresavtal), real estate investment management (REIM), PropTech solutions, ESG compliance ' +
      'for property (BREEAM, EU Taxonomy Green Asset Ratio), and legacy property system ' +
      'modernization (Vitec, Momentum, Hogia Fastighetssystem).',

    'manufacturing':
      'You are also an expert in manufacturing and industrial operations — ERP for manufacturing ' +
      '(SAP S/4HANA, Oracle), Industry 4.0 and IIoT integration, MES/PLM systems, supply chain ' +
      'resilience, lean operations, and smart factory architecture.',

    'domain-specific':
      'You adapt your domain expertise to the specific industry context provided by the user.',

    'industry-specific':
      'You adapt your domain expertise to the specific industry context provided by the user.'
  };

  // ── LAYER 3: VIEW / WORKFLOW CONTEXT ───────────────────────────────────────
  const VIEW_LAYERS = {
    'exec':
      'The user is currently viewing the Executive Summary. Focus on strategic outcomes, ' +
      'headline KPIs, and prioritized recommendations.',

    'phase4':
      'The user is in the Industry & Business Areas dashboard. Focus on industry-specific ' +
      'capability requirements, regulatory areas, and business area priorities.',

    'bench':
      'The user is in Benchmarking & Gap Analysis. Focus on peer comparison, industry baseline ' +
      'scores, and which gaps are the highest priority to address.',

    'survey':
      'The user is in Data Collection. Help capture and validate maturity evidence across ' +
      'capability domains.',

    'capmap':
      'The user is in the Capability Map view. Focus on capability domains, maturity levels, ' +
      'strategic importance ratings, and gap identification.',

    'heatmap':
      'The user is viewing the Maturity Heatmap. Help interpret maturity patterns, identify ' +
      'hotspots, and prioritize improvement areas.',

    'opmodel':
      'The user is in the Operating Model view. Connect capability design to how the organization ' +
      'delivers value via processes, roles, systems, and partners.',

    'network':
      'The user is in the Architecture Network view. Focus on integration points, system ' +
      'dependencies, and architectural coherence.',

    'roadmap':
      'The user is viewing the Transformation Roadmap. Focus on initiative sequencing, phase ' +
      'design, dependencies, and business case framing.',

    'target':
      'The user is in the Target Architecture view. Help define to-be capability targets, uplift ' +
      'paths, and strategic architecture decisions.',

    'home':
      'The user is on the main dashboard. Provide a contextual overview of where they are in the ' +
      'EA journey and suggest the most impactful next action.',

    'maturity':
      'The user is viewing the Maturity Dashboard. Help interpret maturity scores, identify ' +
      'patterns across domains, and connect maturity gaps to strategic priorities.'
  };

  // ── INDUSTRY KEYWORD DETECTION ─────────────────────────────────────────────
  const INDUSTRY_KEYWORDS = {
    'real-estate': [
      'real estate', 'property', 'fastighet', 'fastighetssystem', 'building management',
      'tenant', 'landlord', 'hyresrätt', 'property management', 'facility manage',
      'brf', 'bostadsrätt', 'proptech', 'cafm', 'iwms', 'vitec', 'momentum fastig'
    ],
    'banking': [
      'bank', 'banking', 'financial institution', 'lending', 'credit risk',
      'mortgage', 'bolån', 'retail bank', 'core banking'
    ],
    'fintech': [
      'fintech', 'payment', 'betalning', 'open banking', 'digital wallet',
      'neobank', 'crypto', 'payment gateway'
    ],
    'healthcare': [
      'healthcare', 'hospital', 'clinic', 'patient', 'medical record',
      'vård', 'sjukhus', 'vårdcentral', 'ehr', 'emr', 'hl7', 'fhir'
    ],
    'public-sector': [
      'public sector', 'government', 'municipality', 'kommunal', 'myndighet',
      'statlig', 'offentlig', 'public authority', 'e-government', 'digg', 'skr'
    ],
    'retail': [
      'retail', 'e-commerce', 'ecommerce', 'webshop', 'butik',
      'handel', 'supply chain', 'omnichannel', 'd2c'
    ],
    'insurance': [
      'insurance', 'försäkring', 'underwriting', 'claims management',
      'actuarial', 'solvency'
    ],
    'startup': [
      'startup', 'scale-up', 'seed round', 'series a', 'venture capital',
      'mvp launch', 'product-market fit'
    ],
    'manufacturing': [
      'manufacturing', 'tillverkning', 'industry 4.0', 'factory',
      'produktion', 'mes system', 'plm', 'iiot', 'smart factory'
    ]
  };

  function _detectIndustryFromText(text) {
    if (!text || text.length < 8) return null;
    const lower = text.toLowerCase();
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
      if (keywords.some(kw => lower.includes(kw))) return industry;
    }
    return null;
  }

  // ── PUBLIC: STATE MUTATORS ─────────────────────────────────────────────────

  /** Called when the Phase 4 Industry dropdown changes. */
  function updateIndustryLayer(industry) {
    _state.industry = industry || 'generic';
    console.log('[AdvisyAI] Industry layer set to:', _state.industry);
  }

  /** Called inside showTab() whenever the user switches view. */
  function setActiveView(tabName) {
    _state.activeView = tabName || 'exec';
  }

  /** Called from the description textarea oninput event. */
  function updateDescriptionContext(text) {
    _state.descriptionText = text || '';
    const detected = _detectIndustryFromText(text);
    if (detected !== _state.detectedIndustry) {
      _state.detectedIndustry = detected;
      if (detected && (_state.industry === 'generic' || !_state.industry)) {
        console.log('[AdvisyAI] Industry auto-detected from description:', detected);
      }
    }
  }

  // ── PUBLIC: PROMPT BUILDER ─────────────────────────────────────────────────

  /**
   * Builds the full layered system prompt.
   *
   * @param {Object}  [options]
   * @param {string}  [options.stepOverridePrompt]  Full step-specific prompt text (replaces view layer)
   * @param {number}  [options.stepNum]             EA step number 1-7 (used only for logging/ESG check)
   * @param {string}  [options.userText]            User message — used for on-the-fly industry detection
   * @returns {string}
   */
  function buildSystemPrompt(options = {}) {
    const layers = [BASE_PROMPT];

    // LAYER 2 — Industry: explicit Phase 4 selection > description detection > message detection
    const effectiveIndustry = (_state.industry && _state.industry !== 'generic')
      ? _state.industry
      : (_state.detectedIndustry || (options.userText ? _detectIndustryFromText(options.userText) : null));
    if (effectiveIndustry && INDUSTRY_LAYERS[effectiveIndustry]) {
      layers.push(INDUSTRY_LAYERS[effectiveIndustry]);
      if (options.userText && !_state.detectedIndustry && effectiveIndustry !== _state.industry) {
        // Persist the detection so subsequent calls in the same session keep the context
        _state.detectedIndustry = effectiveIndustry;
        console.log('[AdvisyAI] Industry auto-detected from user message:', effectiveIndustry);
      }
    }

    // LAYER 3 — View/workflow
    if (options.stepOverridePrompt) {
      // The caller already has a rich step-specific prompt; inject it as-is
      layers.push(options.stepOverridePrompt);
    } else {
      const viewLayer = VIEW_LAYERS[_state.activeView];
      if (viewLayer) layers.push(viewLayer);
    }

    // LAYER 4 — ESG addendum
    const activeAreas = (typeof window !== 'undefined' && window.model?.phase4Config?.activeBusinessAreas) || [];
    if (activeAreas.includes('esg')) {
      layers.push(
        'ESG is an active focus area. Apply EU Taxonomy, CSRD, ESRS, and Science-Based Targets ' +
        '(SBTi) knowledge to sustainability capability design and reporting architecture.'
      );
    }

    return layers.join('\n\n');
  }

  // ── PUBLIC: MAIN AI CALL ───────────────────────────────────────────────────

  /**
   * Main AI entry point using the Responses API via AzureOpenAIProxy.
   *
   * @param {string}  userInput
   * @param {Object}  [options]
   * @param {string}  [options.stepOverridePrompt]    Step-specific prompt text (see buildSystemPrompt)
   * @param {number}  [options.stepNum]               Active EA step (1-7)
   * @param {string}  [options.taskType]              'lightweight' | 'heavy'
   * @param {string}  [options.replyLanguage]         ISO language code, e.g. 'sv', 'en'
   * @param {Array}   [options.tools]                 Responses API tool definitions
   * @param {string}  [options.previous_response_id]  Chain to a prior response (multi-turn)
   * @param {boolean} [options.includeProjectContext] Inject master data context (default: true)
   * @param {boolean} [options.silentOnNoKey]         Suppress errors when no key
   * @returns {Promise<string>} The assistant's text response
   */
  async function call(userInput, options = {}) {
    const {
      stepOverridePrompt,
      stepNum,
      taskType = 'lightweight',
      replyLanguage,
      tools,
      previous_response_id,
      includeProjectContext = true,
    } = options;

    if (typeof AzureOpenAIProxy === 'undefined') {
      throw new Error(
        'AdvisyAI: AzureOpenAIProxy is not loaded. ' +
        'Ensure AzureOpenAIProxy.js is included before Advicy_AI.js.'
      );
    }

    const instructions = buildSystemPrompt({ stepNum, stepOverridePrompt });

    // Language instruction
    const lang = replyLanguage
      || (typeof getAppLanguage === 'function' ? getAppLanguage() : 'en');
    const normFn = typeof normalizeLanguageCode === 'function' ? normalizeLanguageCode : (x => x);
    const langCode = normFn(lang);
    const expectsJson = /return\s+only\s+valid\s+json|json\s+only/i.test(userInput);
    const langInstr = langCode !== 'en'
      ? (expectsJson
          ? `\n\nResponse Language Policy:\n- Respond in ${langCode}.\n- Keep JSON keys and enum tokens exactly as specified; translate only natural-language values.`
          : `\n\nResponse Language Policy:\n- Respond in ${langCode}.`)
      : '';

    // Project master data context
    let masterCtx = '';
    if (includeProjectContext && typeof buildMasterDataPromptContext === 'function') {
      masterCtx = buildMasterDataPromptContext();
    }

    const fullInstructions = instructions
      + langInstr
      + (masterCtx ? `\n\nProject Context:\n${masterCtx}` : '');

    const fullInput = includeProjectContext
      ? userInput + '\n\nAnalysis Constraints:\n- Avoid generic advice.\n- Reference the provided project context and industry.\n- Tailor output to the selected business areas.'
      : userInput;

    const createOptions = {
      model: 'gpt-5',
      instructions: fullInstructions,
      timeout: taskType === 'heavy' ? 150000 : 45000,
      reasoning: { summary: 'auto', effort: taskType === 'heavy' ? 'high' : 'medium' }
    };

    if (tools)                createOptions.tools = tools;
    if (previous_response_id) createOptions.previous_response_id = previous_response_id;

    const response = await AzureOpenAIProxy.create(fullInput, createOptions);
    return response.output_text || '';
  }

  // ── PUBLIC API SURFACE ─────────────────────────────────────────────────────
  return {
    updateIndustryLayer,
    setActiveView,
    updateDescriptionContext,
    buildSystemPrompt,
    call,
    /** Returns a snapshot of current context state (useful for debugging). */
    getState: () => ({ ..._state })
  };

})();
