/**
 * EA_AI_Assistant.js
 * AI-powered questionnaire generation, analysis, and instructions
 * Provides contextual questionnaires and intelligent analysis for EA engagements
 * 
 * @version 1.0
 * @date April 19, 2026
 */

class EA_AI_Assistant {
  constructor() {
    this.advisyAI = window.AdvisyAI || null;
    this.accountManager = new EA_AccountManager();
  }

  /**
   * Generate industry-specific discovery questionnaire
   * @param {string} industry - Banking, Insurance, Fintech, etc.
   * @param {string} engagementPhase - E0, E1, E2, E3, E4, E5
   * @returns {object} Questionnaire with sections and questions
   */
  generateQuestionnaire(industry, engagementPhase) {
    console.log(`📋 Generating questionnaire for ${industry} - Phase ${engagementPhase}`);

    const questionnaires = {
      Banking: this.getBankingQuestionnaire(engagementPhase),
      Insurance: this.getInsuranceQuestionnaire(engagementPhase),
      Fintech: this.getFinTechQuestionnaire(engagementPhase),
      'Real Estate': this.getRealEstateQuestionnaire(engagementPhase),
      Healthcare: this.getHealthcareQuestionnaire(engagementPhase),
      'Public Sector': this.getPublicSectorQuestionnaire(engagementPhase),
      Manufacturing: this.getManufacturingQuestionnaire(engagementPhase),
      Retail: this.getRetailQuestionnaire(engagementPhase)
    };

    const questionnaire = questionnaires[industry] || this.getGenericQuestionnaire(engagementPhase);
    
    questionnaire.metadata = {
      industry,
      phase: engagementPhase,
      generatedAt: new Date().toISOString(),
      questionCount: this.countQuestions(questionnaire)
    };

    this.trackEvent('questionnaire_generated', { industry, phase: engagementPhase });
    return questionnaire;
  }

  /**
   * Banking Industry Questionnaire
   */
  getBankingQuestionnaire(phase) {
    if (phase === 'E0' || phase === 'E1') {
      return {
        title: 'Banking Discovery & Current State Assessment',
        description: 'Comprehensive questionnaire for understanding banking operations, systems, and digital transformation readiness',
        sections: [
          {
            section: '1. Strategic Context',
            questions: [
              {
                id: 'BNK-STR-01',
                question: 'What is your banks strategic vision for digital transformation over the next 3-5 years?',
                type: 'long-text',
                required: true,
                guidance: 'Consider: customer experience goals, operational efficiency targets, new business models (e.g., embedded banking, BaaS)'
              },
              {
                id: 'BNK-STR-02',
                question: 'What are your top 3 strategic priorities driving technology investment?',
                type: 'multiple-choice',
                options: [
                  'Customer digital experience (mobile/web banking)',
                  'Core banking modernization',
                  'Open Banking & API economy',
                  'Real-time payments',
                  'Data & analytics capabilities',
                  'Cloud migration',
                  'Regulatory compliance automation',
                  'Branch network optimization',
                  'AI/ML for fraud detection and credit risk'
                ],
                required: true,
                maxSelections: 3
              },
              {
                id: 'BNK-STR-03',
                question: 'What is your current Net Promoter Score (NPS) and customer satisfaction rating?',
                type: 'number',
                validation: { min: -100, max: 100 },
                required: false
              },
              {
                id: 'BNK-STR-04',
                question: 'What is your current cost-to-income ratio (CIR)?',
                type: 'percentage',
                required: false,
                guidance: 'Industry benchmark: 45-55% for digital leaders, 55-65% for traditional banks'
              }
            ]
          },
          {
            section: '2. Core Banking Systems',
            questions: [
              {
                id: 'BNK-CORE-01',
                question: 'What is your current core banking platform?',
                type: 'single-choice',
                options: [
                  'Legacy mainframe (IBM, Unisys)',
                  'Temenos T24/Transact',
                  'FIS Core Banking',
                  'Oracle FLEXCUBE',
                  'SAP for Banking',
                  'Jack Henry Symitar/SilverLake',
                  'Mambu (cloud-native)',
                  'Thought Machine Vault',
                  'Custom-built',
                  'Other'
                ],
                required: true
              },
              {
                id: 'BNK-CORE-02',
                question: 'What year was your core banking system implemented?',
                type: 'number',
                validation: { min: 1970, max: 2026 },
                required: true
              },
              {
                id: 'BNK-CORE-03',
                question: 'How long does it take to launch a new banking product (e.g., new savings account type)?',
                type: 'single-choice',
                options: [
                  'Less than 1 week',
                  '1-4 weeks',
                  '1-3 months',
                  '3-6 months',
                  '6-12 months',
                  'More than 12 months'
                ],
                required: true,
                kpi: 'time-to-market'
              },
              {
                id: 'BNK-CORE-04',
                question: 'What percentage of your IT budget is spent on maintaining legacy systems vs. innovation?',
                type: 'percentage',
                required: false,
                guidance: 'Industry average: 70-80% maintenance, 20-30% innovation. Digital leaders: 40% maintenance, 60% innovation'
              },
              {
                id: 'BNK-CORE-05',
                question: 'Does your core banking system support real-time processing?',
                type: 'yes-no',
                required: true,
                followUp: {
                  condition: 'no',
                  question: 'What is your average transaction processing latency?',
                  type: 'single-choice',
                  options: ['Near real-time (<5 sec)', 'Minutes', 'Hours', 'Batch (end-of-day)', 'Unknown']
                }
              }
            ]
          },
          {
            section: '3. Digital Channels & Customer Experience',
            questions: [
              {
                id: 'BNK-DIGI-01',
                question: 'What is your mobile banking app store rating (iOS/Android average)?',
                type: 'rating',
                scale: 5,
                required: false
              },
              {
                id: 'BNK-DIGI-02',
                question: 'What percentage of transactions are completed digitally (mobile + web)?',
                type: 'percentage',
                required: true,
                kpi: 'digital-adoption'
              },
              {
                id: 'BNK-DIGI-03',
                question: 'What is your current mobile banking Monthly Active Users (MAU)?',
                type: 'number',
                required: false
              },
              {
                id: 'BNK-DIGI-04',
                question: 'Do you offer the following digital capabilities?',
                type: 'checkbox',
                options: [
                  'Instant account opening (digital onboarding)',
                  'Mobile check deposit',
                  'P2P payments (Swish, Vipps, etc.)',
                  'Personal financial management (PFM) tools',
                  'Instant loan decisions',
                  'Video banking / virtual assistant',
                  'Biometric authentication',
                  'Card controls (freeze/unfreeze)',
                  'Real-time spending notifications',
                  'AI chatbot for customer service'
                ]
              },
              {
                id: 'BNK-DIGI-05',
                question: 'What is your average customer digital onboarding completion time?',
                type: 'single-choice',
                options: [
                  'Less than 10 minutes',
                  '10-30 minutes',
                  '30-60 minutes',
                  '1-24 hours (awaiting verification)',
                  'More than 24 hours',
                  'Not applicable / no digital onboarding'
                ],
                required: true,
                kpi: 'onboarding-time'
              }
            ]
          },
          {
            section: '4. Open Banking & APIs',
            questions: [
              {
                id: 'BNK-API-01',
                question: 'Have you implemented PSD2 Open Banking APIs?',
                type: 'yes-no',
                required: true,
                followUp: {
                  condition: 'yes',
                  question: 'How many Third-Party Providers (TPPs) are connected?',
                  type: 'number'
                }
              },
              {
                id: 'BNK-API-02',
                question: 'Do you have an API monetization strategy (Banking-as-a-Service)?',
                type: 'yes-no',
                required: false
              },
              {
                id: 'BNK-API-03',
                question: 'What is your API management platform?',
                type: 'single-choice',
                options: [
                  'None / custom-built',
                  'Apigee',
                  'MuleSoft',
                  'AWS API Gateway',
                  'Azure API Management',
                  'Kong',
                  'WSO2',
                  'Other'
                ]
              }
            ]
          },
          {
            section: '5. Data & Analytics',
            questions: [
              {
                id: 'BNK-DATA-01',
                question: 'Do you have a unified 360° customer data platform?',
                type: 'yes-no',
                required: true,
                followUp: {
                  condition: 'no',
                  question: 'How many customer data systems are in use?',
                  type: 'number',
                  guidance: 'Include: CRM, core banking, loan origination, card systems, etc.'
                }
              },
              {
                id: 'BNK-DATA-02',
                question: 'What AI/ML use cases have you implemented?',
                type: 'checkbox',
                options: [
                  'Fraud detection',
                  'Credit risk scoring',
                  'Anti-Money Laundering (AML) detection',
                  'Customer churn prediction',
                  'Next-best-action recommendations',
                  'Chatbot / virtual assistant',
                  'Document processing (OCR)',
                  'Loan underwriting automation',
                  'None yet'
                ]
              },
              {
                id: 'BNK-DATA-03',
                question: 'What percentage of your AML/KYC process is automated?',
                type: 'percentage',
                required: false,
                kpi: 'aml-automation'
              }
            ]
          },
          {
            section: '6. Regulatory & Compliance',
            questions: [
              {
                id: 'BNK-REG-01',
                question: 'Which regulatory frameworks apply to your bank?',
                type: 'checkbox',
                options: [
                  'Basel III / Basel IV',
                  'PSD2 / PSD3',
                  'GDPR',
                  'MiFID II',
                  'DORA (Digital Operational Resilience Act)',
                  'Local banking regulations',
                  'Other'
                ],
                required: true
              },
              {
                id: 'BNK-REG-02',
                question: 'What percentage of regulatory reporting is automated?',
                type: 'percentage',
                required: false,
                kpi: 'reporting-automation'
              },
              {
                id: 'BNK-REG-03',
                question: 'How many FTEs are dedicated to compliance and regulatory reporting?',
                type: 'number',
                required: false
              }
            ]
          },
          {
            section: '7. Cloud & Infrastructure',
            questions: [
              {
                id: 'BNK-CLOUD-01',
                question: 'What is your cloud adoption status?',
                type: 'single-choice',
                options: [
                  '100% on-premise / data center',
                  'Hybrid: some workloads in cloud',
                  'Cloud-first: most new workloads in cloud',
                  'Cloud-native: majority in cloud',
                  'Cloud-only strategy'
                ],
                required: true
              },
              {
                id: 'BNK-CLOUD-02',
                question: 'Which cloud providers do you use?',
                type: 'checkbox',
                options: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Private cloud', 'None']
              },
              {
                id: 'BNK-CLOUD-03',
                question: 'Is your core banking system approved for cloud deployment by regulators?',
                type: 'yes-no',
                required: true
              }
            ]
          },
          {
            section: '8. Pain Points & Challenges',
            questions: [
              {
                id: 'BNK-PAIN-01',
                question: 'What are your top 3 technology pain points?',
                type: 'long-text',
                required: true,
                guidance: 'Be specific: quantify impact if possible (e.g., "Manual AML review takes 3 FTE, 5-day turnaround")'
              },
              {
                id: 'BNK-PAIN-02',
                question: 'What keeps you up at night regarding technology risk?',
                type: 'checkbox',
                options: [
                  'Cybersecurity threats',
                  'Legacy system failure / outage',
                  'Losing customers to neobanks/fintechs',
                  'Inability to innovate fast enough',
                  'Talent retention (tech skills shortage)',
                  'Regulatory fines',
                  'Data breach',
                  'Integration complexity',
                  'Cost overruns on IT projects'
                ]
              }
            ]
          }
        ]
      };
    }

    // E2-E4 phases would have different questionnaires
    return {
      title: `Banking ${phase} Questionnaire`,
      description: `Phase-specific questions for ${phase}`,
      sections: []
    };
  }

  /**
   * Insurance Industry Questionnaire
   */
  getInsuranceQuestionnaire(phase) {
    if (phase === 'E0' || phase === 'E1') {
      return {
        title: 'Insurance Discovery & Current State Assessment',
        description: 'Comprehensive questionnaire for insurance carriers (P&C, Life, Health)',
        sections: [
          {
            section: '1. Strategic Context',
            questions: [
              {
                id: 'INS-STR-01',
                question: 'What lines of insurance business do you operate?',
                type: 'checkbox',
                options: [
                  'Auto insurance',
                  'Home & property insurance',
                  'Life insurance',
                  'Health insurance',
                  'Commercial insurance',
                  'Specialty insurance (cyber, parametric, etc.)'
                ],
                required: true
              },
              {
                id: 'INS-STR-02',
                question: 'What is your current combined ratio (loss ratio + expense ratio)?',
                type: 'percentage',
                required: false,
                guidance: 'Industry benchmark: <100% is profitable, 95-100% is competitive'
              },
              {
                id: 'INS-STR-03',
                question: 'What percentage of policies are sold through digital channels (direct-to-consumer)?',
                type: 'percentage',
                required: true,
                kpi: 'digital-sales'
              }
            ]
          },
          {
            section: '2. Policy Administration',
            questions: [
              {
                id: 'INS-POLICY-01',
                question: 'What is your policy administration system?',
                type: 'single-choice',
                options: [
                  'Legacy mainframe system',
                  'Guidewire PolicyCenter',
                  'Duck Creek Policy',
                  'Sapiens ALIS',
                  'Instanda',
                  'Custom-built',
                  'Other'
                ],
                required: true
              },
              {
                id: 'INS-POLICY-02',
                question: 'How long does it take to launch a new insurance product?',
                type: 'single-choice',
                options: [
                  'Less than 1 month',
                  '1-3 months',
                  '3-6 months',
                  '6-12 months',
                  'More than 12 months'
                ],
                required: true,
                kpi: 'product-time-to-market'
              },
              {
                id: 'INS-POLICY-03',
                question: 'Can customers get instant quotes online?',
                type: 'yes-no',
                required: true,
                followUp: {
                  condition: 'no',
                  question: 'What is the average quote turnaround time?',
                  type: 'single-choice',
                  options: ['< 1 hour', '1-24 hours', '1-3 days', '3-7 days', '> 7 days']
                }
              }
            ]
          },
          {
            section: '3. Claims Processing',
            questions: [
              {
                id: 'INS-CLAIMS-01',
                question: 'What is your average claims settlement time?',
                type: 'single-choice',
                options: [
                  'Same day',
                  '1-3 days',
                  '4-7 days',
                  '1-2 weeks',
                  '2-4 weeks',
                  'More than 4 weeks'
                ],
                required: true,
                kpi: 'claims-settlement-time'
              },
              {
                id: 'INS-CLAIMS-02',
                question: 'What percentage of claims are processed with straight-through processing (no human intervention)?',
                type: 'percentage',
                required: true,
                kpi: 'claims-automation'
              },
              {
                id: 'INS-CLAIMS-03',
                question: 'Do you use AI for claims fraud detection?',
                type: 'yes-no',
                required: true
              },
              {
                id: 'INS-CLAIMS-04',
                question: 'What is your First Notice of Loss (FNOL) channel mix?',
                type: 'distribution',
                categories: ['Mobile app', 'Web portal', 'Phone call', 'Agent portal', 'Email'],
                required: false
              }
            ]
          },
          {
            section: '4. Underwriting & Risk Assessment',
            questions: [
              {
                id: 'INS-UW-01',
                question: 'What percentage of policies are underwritten using automated rules engines?',
                type: 'percentage',
                required: true,
                kpi: 'underwriting-automation'
              },
              {
                id: 'INS-UW-02',
                question: 'Do you use external data sources for risk assessment?',
                type: 'checkbox',
                options: [
                  'Telematics (auto insurance)',
                  'IoT sensors (home insurance)',
                  'Credit scores',
                  'Social media data',
                  'Geospatial data',
                  'Wearables (health/life insurance)',
                  'None - traditional data only'
                ]
              }
            ]
          },
          {
            section: '5. Regulatory Compliance',
            questions: [
              {
                id: 'INS-REG-01',
                question: 'Are you compliant with Solvency II requirements?',
                type: 'yes-no',
                required: true,
                applicableRegions: ['Europe']
              },
              {
                id: 'INS-REG-02',
                question: 'What percentage of regulatory reporting is automated?',
                type: 'percentage',
                required: false,
                kpi: 'reporting-automation'
              }
            ]
          }
        ]
      };
    }

    return {
      title: `Insurance ${phase} Questionnaire`,
      sections: []
    };
  }

  /**
   * FinTech Industry Questionnaire
   */
  getFinTechQuestionnaire(phase) {
    if (phase === 'E0' || phase === 'E1') {
      return {
        title: 'FinTech Discovery & Technical Assessment',
        description: 'Questionnaire for payment platforms, neobanks, lending platforms, and financial infrastructure companies',
        sections: [
          {
            section: '1. Business Model & Scale',
            questions: [
              {
                id: 'FIN-BIZ-01',
                question: 'What is your primary business model?',
                type: 'single-choice',
                options: [
                  'Payment processing / gateway',
                  'Neobank / challenger bank',
                  'Lending platform (P2P, BNPL, etc.)',
                  'Digital wallet',
                  'Open Banking aggregator',
                  'Banking-as-a-Service (BaaS)',
                  'Cryptocurrency / blockchain',
                  'Wealth management / robo-advisor',
                  'InsurTech',
                  'RegTech'
                ],
                required: true
              },
              {
                id: 'FIN-BIZ-02',
                question: 'What is your current annual transaction volume (TPV)?',
                type: 'currency',
                required: false
              },
              {
                id: 'FIN-BIZ-03',
                question: 'What is your current funding stage?',
                type: 'single-choice',
                options: [
                  'Pre-seed / Seed',
                  'Series A',
                  'Series B',
                  'Series C+',
                  'Profitable / Self-sustaining',
                  'Public company'
                ],
                required: true
              },
              {
                id: 'FIN-BIZ-04',
                question: 'What is your customer acquisition cost (CAC) vs. lifetime value (LTV) ratio?',
                type: 'text',
                required: false,
                guidance: 'Healthy ratio: LTV/CAC > 3.0'
              }
            ]
          },
          {
            section: '2. Technology Architecture',
            questions: [
              {
                id: 'FIN-TECH-01',
                question: 'What is your current platform architecture?',
                type: 'single-choice',
                options: [
                  'Monolithic application',
                  'Modular monolith',
                  'Microservices',
                  'Serverless',
                  'Hybrid'
                ],
                required: true
              },
              {
                id: 'FIN-TECH-02',
                question: 'What is your primary technology stack?',
                type: 'text',
                required: true,
                placeholder: 'e.g., Ruby on Rails, PostgreSQL, Redis, AWS'
              },
              {
                id: 'FIN-TECH-03',
                question: 'What is your current peak transaction throughput (TPS)?',
                type: 'number',
                required: true,
                kpi: 'system-capacity'
              },
              {
                id: 'FIN-TECH-04',
                question: 'What is your target peak TPS for next 12-18 months?',
                type: 'number',
                required: true,
                kpi: 'capacity-target'
              },
              {
                id: 'FIN-TECH-05',
                question: 'What is your system uptime/availability?',
                type: 'single-choice',
                options: [
                  '< 99%',
                  '99.0-99.5%',
                  '99.5-99.9% (three nines)',
                  '99.9-99.95% (high availability)',
                  '> 99.95% (four nines)'
                ],
                required: true,
                kpi: 'uptime'
              }
            ]
          },
          {
            section: '3. Scalability & Performance',
            questions: [
              {
                id: 'FIN-SCALE-01',
                question: 'Have you experienced production outages or performance degradation in the past 6 months?',
                type: 'yes-no',
                required: true,
                followUp: {
                  condition: 'yes',
                  question: 'How many incidents occurred?',
                  type: 'number'
                }
              },
              {
                id: 'FIN-SCALE-02',
                question: 'What is your average API response time (p95)?',
                type: 'single-choice',
                options: [
                  '< 100ms',
                  '100-500ms',
                  '500ms-1s',
                  '1-2s',
                  '> 2s'
                ],
                required: true,
                kpi: 'api-latency'
              },
              {
                id: 'FIN-SCALE-03',
                question: 'Do you have auto-scaling configured?',
                type: 'yes-no',
                required: true
              }
            ]
          },
          {
            section: '4. Regulatory & Compliance',
            questions: [
              {
                id: 'FIN-REG-01',
                question: 'Are you a licensed financial institution?',
                type: 'single-choice',
                options: [
                  'Yes - bank license',
                  'Yes - payment institution license (PSD2)',
                  'Yes - e-money license',
                  'No - operating under sponsor bank',
                  'No - not required'
                ],
                required: true
              },
              {
                id: 'FIN-REG-02',
                question: 'Which compliance frameworks apply to you?',
                type: 'checkbox',
                options: [
                  'PSD2 / Open Banking',
                  'GDPR',
                  'PCI-DSS',
                  'SOC 2 Type II',
                  'ISO 27001',
                  'AML / KYC regulations',
                  'Strong Customer Authentication (SCA)',
                  'None yet'
                ]
              },
              {
                id: 'FIN-REG-03',
                question: 'Do you have PSD2 Strong Customer Authentication (SCA) implemented?',
                type: 'yes-no',
                required: true
              }
            ]
          }
        ]
      };
    }

    return {
      title: `FinTech ${phase} Questionnaire`,
      sections: []
    };
  }

  /**
   * Generic Questionnaire (fallback)
   */
  getGenericQuestionnaire(phase) {
    return {
      title: `${phase} Discovery Questionnaire`,
      description: 'General discovery questions for enterprise architecture engagement',
      sections: [
        {
          section: 'Strategic Context',
          questions: [
            {
              id: 'GEN-STR-01',
              question: 'What are your top 3 business objectives for this engagement?',
              type: 'long-text',
              required: true
            },
            {
              id: 'GEN-STR-02',
              question: 'What is driving the need for architecture transformation?',
              type: 'checkbox',
              options: [
                'Digital transformation',
                'Cost reduction',
                'Legacy system modernization',
                'Regulatory compliance',
                'Competitive pressure',
                'Merger & acquisition',
                'Growth / scale',
                'Customer experience improvement'
              ]
            }
          ]
        },
        {
          section: 'Current State',
          questions: [
            {
              id: 'GEN-CUR-01',
              question: 'How many applications are in your portfolio?',
              type: 'number',
              required: false
            },
            {
              id: 'GEN-CUR-02',
              question: 'What percentage of your IT budget goes to maintaining legacy systems?',
              type: 'percentage',
              required: false
            }
          ]
        }
      ]
    };
  }

  /**
   * Placeholder methods for other industries
   */
  getRealEstateQuestionnaire(phase) {
    return { title: `Real Estate ${phase} Questionnaire`, sections: [] };
  }

  getHealthcareQuestionnaire(phase) {
    return { title: `Healthcare ${phase} Questionnaire`, sections: [] };
  }

  getPublicSectorQuestionnaire(phase) {
    return { title: `Public Sector ${phase} Questionnaire`, sections: [] };
  }

  getManufacturingQuestionnaire(phase) {
    return { title: `Manufacturing ${phase} Questionnaire`, sections: [] };
  }

  getRetailQuestionnaire(phase) {
    return { title: `Retail ${phase} Questionnaire`, sections: [] };
  }

  /**
   * Count total questions in questionnaire
   */
  countQuestions(questionnaire) {
    let count = 0;
    questionnaire.sections.forEach(section => {
      count += section.questions.length;
      section.questions.forEach(q => {
        if (q.followUp) count++;
      });
    });
    return count;
  }

  /**
   * Generate AI-powered analysis and recommendations
   * @param {string} accountId
   * @param {object} questionnaireResponses
   * @returns {Promise<object>}
   */
  async generateAnalysis(accountId, questionnaireResponses) {
    console.log(`🤖 Generating AI analysis for account: ${accountId}`);

    const account = this.accountManager.getAccount(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Build context for AI
    const context = {
      accountName: account.name,
      industry: account.industry,
      strategicPriorities: account.strategicPriorities,
      painPoints: account.painPoints,
      questionnaireResponses
    };

    if (this.advisyAI) {
      try {
        const prompt = this.buildAnalysisPrompt(context);
        const analysis = await this.advisyAI.call(prompt, {
          stepNum: 1,
          industry: account.industry
        });

        this.trackEvent('ai_analysis_generated', { accountId });
        return {
          success: true,
          analysis,
          generatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('AI analysis failed:', error);
        return {
          success: false,
          error: error.message,
          fallback: this.generateFallbackAnalysis(context)
        };
      }
    } else {
      // Fallback if AI not available
      return {
        success: false,
        fallback: this.generateFallbackAnalysis(context)
      };
    }
  }

  /**
   * Build analysis prompt for AI
   */
  buildAnalysisPrompt(context) {
    return `
You are an expert Enterprise Architect analyzing a ${context.industry} organization.

**Customer:** ${context.accountName}

**Strategic Priorities:**
${context.strategicPriorities.map(p => `- ${p}`).join('\n')}

**Pain Points:**
${context.painPoints.map(p => `- ${p}`).join('\n')}

**Discovery Questionnaire Responses:**
${JSON.stringify(context.questionnaireResponses, null, 2)}

**Instructions:**
Based on the information provided, generate a comprehensive analysis covering:

1. **Key Findings**: What are the 3-5 most critical insights from the discovery?
2. **Architecture Maturity Assessment**: Rate current maturity across dimensions (Digital Capabilities, Integration, Data, Cloud, Security) on 1-5 scale
3. **Primary Challenges**: What are the top 3 technical/organizational challenges?
4. **Quick Wins**: Identify 2-3 initiatives that can deliver value in <90 days
5. **Strategic Recommendations**: What should the target architecture prioritize?
6. **Estimated Transformation Timeline**: High-level phases (e.g., Foundation, Modernization, Optimization)
7. **Risk Factors**: Top 3 risks to transformation success

Format the response as structured markdown.
    `.trim();
  }

  /**
   * Generate fallback analysis (rule-based when AI unavailable)
   */
  generateFallbackAnalysis(context) {
    return {
      keyFindings: [
        `Organization has identified ${context.painPoints.length} critical pain points requiring architecture intervention`,
        `Strategic focus on: ${context.strategicPriorities.slice(0, 2).join(', ')}`,
        'Detailed AI-powered analysis requires connectivity to AdvisyAI service'
      ],
      recommendations: [
        'Conduct detailed current state architecture assessment',
        'Prioritize initiatives based on strategic value and implementation complexity',
        'Establish architecture governance framework'
      ],
      note: 'This is a basic rules-based analysis. For AI-powered insights, ensure AdvisyAI is configured.'
    };
  }

  /**
   * Export questionnaire responses as JSON
   */
  exportResponses(questionnaireId, responses) {
    const data = {
      questionnaireId,
      responses,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questionnaire_responses_${questionnaireId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.trackEvent('questionnaire_exported', { questionnaireId });
  }

  /**
   * Track usage event
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      module: 'EA_AI_Assistant',
      properties
    };

    const events = JSON.parse(localStorage.getItem('ea_usage_events') || '[]');
    events.push(event);

    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem('ea_usage_events', JSON.stringify(events));
    console.log(`📊 Event tracked: ${eventName}`, properties);
  }
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined') {
  window.EA_AI_Assistant = EA_AI_Assistant;
}