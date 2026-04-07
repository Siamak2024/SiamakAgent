# AI Analysis Instructions - User Guide

## Overview
This folder contains **AI Analysis instruction files** for each tab in the EA Platform. Each instruction file defines how the AI expert analyzes that specific tab's context.

## File Naming Convention

All instruction files follow this standard pattern:

```
AI_ANALYSIS_[TAB_NAME].instruction.md
```

**Examples:**
- `AI_ANALYSIS_DASHBOARD.instruction.md` - Dashboard tab AI analysis
- `AI_ANALYSIS_BMC.instruction.md` - Business Model Canvas tab
- `AI_ANALYSIS_CAPABILITY_MAP.instruction.md` - Capability Map tab
- `AI_ANALYSIS_GAP.instruction.md` - Gap Analysis tab
- etc.

This naming convention makes files **easy to find** and **easy to identify** by tab name.

## File Structure

Each instruction file contains:

### 1. **Expert Role**
Defines the AI's persona (e.g., "Business Model Innovation Expert")

### 2. **Expertise Areas**
Lists the specific domains of knowledge the AI should apply

### 3. **Analysis Type**
Names the type of analysis being performed

### 4. **System Prompt**
The core instruction that defines how the AI thinks and analyzes

### 5. **Leverage Your Capabilities Section**
★ **NEW - Enables web search and external research!**
- Tells AI to search the web for current trends, benchmarks, case studies
- Encourages using GPT-5's full knowledge and creative problem-solving
- Suggests specific things to research (industry standards, technology trends, etc.)

### 6. **Guidelines**
Flexible guidance (not strict rules) for the analysis

### 7. **Data Context Required**
Lists what data the AI needs from the application

## How to Customize Instructions

### Option 1: Edit Directly in VS Code

1. Open the instruction file you want to modify (e.g., `AI_ANALYSIS_BMC.instruction.md`)
2. Edit the markdown file - it's plain text
3. Save the file
4. The platform will automatically load the updated instruction on next AI analysis

### Option 2: Use Any Text Editor

1. Navigate to: `NexGenEA/js/Instructions/AI_Analysis/`
2. Open the `.instruction.md` file in Notepad, Sublime, or your preferred editor
3. Make changes
4. Save

## Customization Examples

### Example 1: Add Industry-Specific Focus

In `AI_ANALYSIS_BMC.instruction.md`, you could add:

```markdown
**Industry-Specific Focus:**
- For Financial Services: Emphasize regulatory compliance and risk management
- For Healthcare: Prioritize patient outcomes and HIPAA compliance
- For Manufacturing: Focus on supply chain and operational efficiency
```

### Example 2: Add Web Search Suggestions

```markdown
**Leverage Your Capabilities**:
- **Web Search Recommended**: Look up the latest Gartner Magic Quadrant for this technology
- **Competitive Intelligence**: Research what top 3 competitors are doing
- **Regulatory Changes**: Search for recent regulatory changes affecting this industry
```

### Example 3: Change Analysis Depth

You can make instructions more detailed:

```markdown
When analyzing gaps:
1. **Root Cause Analysis**: Use 5 Whys methodology
2. **Financial Impact**: Quantify in EUR/year
3. **Risk Assessment**: Use Monte Carlo simulation if data allows
etc.
```

Or make them more concise:

```markdown
Provide: 1) Priority gaps, 2) Quick fix recommendations, 3) Strategic initiatives
```

## Design Philosophy

### ✅ What These Instructions DO:

- **Guide thinking** - Suggest frameworks and approaches
- **Enable creativity** - Encourage web search and external research
- **Provide context** - Explain the analysis purpose and audience
- **Be flexible** - Give guidelines, not rigid rules

### ❌ What These Instructions DON'T DO:

- **Over-constrain** - No strict formatting requirements that limit AI
- **Block research** - AI can and should search the web for latest info
- **Limit scope** - AI can go beyond the guidelines if it makes sense
- **Force templates** - Output format is suggested, not mandated

## Web Search Capability

★ **GPT-5 can search the web during analysis!**

The instructions actively encourage:
- 📊 **Benchmarking**: "Search for industry maturity benchmarks..."
- 🔍 **Research**: "Look up latest trends in..."
- 💡 **Case Studies**: "Find examples of organizations that..."
- 📈 **Market Data**: "Research typical ROI for..."
- 🛠️ **Technology**: "Look up current technology options for..."

This means AI analysis will include **current, relevant**, external context!

## Tips for Best Results

1. **Be Specific**: If you want focus on a specific industry, add it to the instruction
2. **Add Examples**: Include real-world examples of good analysis
3. **Update Regularly**: As your business evolves, update instructions to reflect new priorities
4. **Test Changes**: Run AI analysis after updating to see the impact
5. **Keep it Readable**: Use markdown formatting for clarity

## File Locations

- **Production**: `NexGenEA/js/Instructions/AI_Analysis/`
- **Azure Deployment**: *(Will be synced when deployed)*

## Need Help?

- **Markdown Guide**: https://www.markdownguide.org/basic-syntax/
- **Template**: Copy any existing instruction file as a starting point
- **Backup**: Keep a copy of original instructions before making major changes

---

**Last Updated**: April 6, 2026
**Instruction Count**: 14 tab-specific instructions + expandable
