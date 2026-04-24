# Task 5.1: Survey Generation

## Objective
Design targeted survey instruments to validate capability maturity ratings and gather stakeholder insights on gaps identified in the benchmark analysis.

## Context Provided
- **Benchmark Gaps**: Critical capability gaps from Step 4
- **Quick Wins**: Fast-track improvement opportunities
- **Capabilities**: Full capability map with current maturity ratings
- **Strategic Intent**: Organizational goals and constraints

## Your Task

### 1. Identify Priority Survey Targets
Focus surveys on:
- **High-gap capabilities**: Current maturity >1.0 points below industry average
- **Strategic core capabilities**: CORE importance + gaps
- **Quick-win candidates**: Opportunities for rapid improvement
- **Cross-cutting themes**: Issues affecting multiple capabilities (e.g., skills gaps, data quality)

Typical coverage: 5-8 surveys covering 12-20 capabilities

### 2. Design Survey Questions
For each priority capability, create 5-10 questions that:

**Maturity Validation Questions**:
- Current state assessment (Likert 1-5 scale aligned to maturity levels)
- Process documentation and standardization
- Measurement and monitoring practices
- Continuous improvement activities

**Gap Root Cause Questions**:
- Technology constraints
- Skills/knowledge gaps
- Process bottlenecks
- Data availability/quality issues
- Organizational barriers

**Improvement Opportunity Questions**:
- Quick-win potential
- Stakeholder priorities
- Resource availability
- Change readiness

### 3. Question Types & Best Practices

| Type | Use Case | Example |
|------|----------|---------|
| **LIKERT_5** | Maturity assessment, agreement scale | "Rate process documentation: 1=None, 5=Comprehensive" |
| **MULTIPLE_CHOICE** | Root cause identification, priorities | "Primary constraint: A) Budget B) Skills C) Technology D) Process" |
| **FREE_TEXT** | Qualitative insights, specific examples | "Describe one specific improvement you'd prioritize" |

**Survey Design Principles**:
- ✅ 5-10 questions per survey (8-10 min completion)
- ✅ Mix quantitative (Likert) + qualitative (free text)
- ✅ Clear, jargon-free language
- ✅ Neutral wording (avoid leading questions)
- ✅ Logical flow (current state → gaps → opportunities)
- ❌ Avoid double-barreled questions
- ❌ No more than 2-3 free-text questions per survey

### 4. Define Target Respondents
Identify who should complete each survey:
- **Capability Owners**: Process managers, functional leads
- **Process Performers**: End users, front-line staff
- **Stakeholders**: Customers of the capability (internal/external)
- **Subject Matter Experts**: Technical specialists, domain experts

Typical respondent count: 5-15 per survey for statistical validity

### 5. Rollout Strategy
Sequence surveys based on:
1. **Critical gaps first**: Address highest-risk capabilities
2. **Quick wins next**: Build momentum with fast improvements
3. **Strategic enablers last**: Foundation capabilities supporting others

## Output Format
Return **ONLY** valid JSON:

```json
{
  "surveys": [
    {
      "survey_id": "S01",
      "capability_id": "C02.03",
      "capability_name": "Data Analytics & Insights",
      "focus_area": "TECHNOLOGY",
      "priority": "HIGH",
      "questions": [
        {
          "question_id": "Q01",
          "question_text": "How would you rate the maturity of our data analytics capabilities? 1=Ad-hoc/reactive, 2=Some tools but inconsistent, 3=Standard tools & processes, 4=Data-driven with dashboards, 5=Predictive analytics & AI",
          "question_type": "LIKERT_5",
          "options": ["1 - Ad-hoc", "2 - Developing", "3 - Defined", "4 - Managed", "5 - Optimizing"],
          "rationale": "Validate current maturity assessment (benchmark shows 1.5 vs 3.2 avg)"
        },
        {
          "question_id": "Q02",
          "question_text": "What is the PRIMARY barrier preventing better data analytics?",
          "question_type": "MULTIPLE_CHOICE",
          "options": [
            "Lack of analytics tools/platform",
            "Data quality and integration issues",
            "Insufficient data science skills",
            "No clear use cases or strategy",
            "Budget constraints"
          ],
          "rationale": "Identify root cause of technology gap"
        },
        {
          "question_id": "Q03",
          "question_text": "Describe one specific analytics use case that would deliver immediate business value if implemented",
          "question_type": "FREE_TEXT",
          "options": [],
          "rationale": "Capture quick-win opportunities and stakeholder priorities"
        }
      ],
      "target_respondents": "Business Analysts (5), Data Team (3), Function Heads (6)",
      "estimated_time": "8 minutes",
      "expected_responses": 14
    }
  ],
  "survey_strategy": {
    "total_surveys": 6,
    "total_capabilities_covered": 18,
    "priority_areas": [
      "Data & Analytics (critical gap)",
      "Digital Customer Experience (strategic core)",
      "Process Automation (quick wins)"
    ],
    "rollout_sequence": [
      "Week 1: Critical gaps (Data Analytics, Digital CX)",
      "Week 2: Quick wins (Automation, Feedback Management)",
      "Week 3: Strategic enablers (Workforce Skills, Change Management)"
    ],
    "estimated_completion": "3 weeks",
    "total_respondent_target": 85
  }
}
```

## Maturity Question Template
Use this Likert scale for maturity validation questions:

```
"How mature is [capability name]?"

1 = Initial: Ad-hoc, reactive, no formal process or documentation
2 = Developing: Some structure, inconsistent execution, basic tools
3 = Defined: Documented standards, repeatable processes, standard tools
4 = Managed: Measured performance, data-driven decisions, proactive management
5 = Optimizing: Continuous improvement, innovation, industry-leading practices
```

## Quality Checklist
- [ ] 5-8 surveys covering priority gaps and quick wins
- [ ] Each survey has 5-10 questions (mix of Likert + MC + free text)
- [ ] Questions directly relate to capability gaps or improvement opportunities
- [ ] Target respondents identified with realistic counts
- [ ] Estimated completion time is 8-10 minutes per survey
- [ ] Rollout sequence prioritizes critical gaps first
- [ ] JSON is valid and complete

## Common Pitfalls
❌ Too many surveys (>10) overwhelming respondents  
❌ Questions too technical/jargon-heavy  
❌ All free-text questions (analysis nightmare)  
❌ No clear link between questions and capability gaps  
❌ Targeting wrong respondents (e.g., asking execs about daily process issues)  

✅ Focused survey set (5-8 surveys)  
✅ Plain language, business-friendly questions  
✅ Balanced mix of quantitative + qualitative  
✅ Questions validate benchmark findings  
✅ Right respondents for each capability level  
