/**
 * EA_OutputGenerator.js
 * Core Output Generation Orchestrator for EA Engagement Playbook
 * Transforms canonical engagement model into multiple formats (MD/HTML/PDF/DOCX/PPTX)
 * 
 * @version 1.0
 * @date 2026-04-17
 */

class EA_OutputGenerator {
  constructor(storageManager, markdownGenerator, config = null) {
    this.storage = storageManager;
    this.mdGenerator = markdownGenerator;
    this.config = config || this.getDefaultConfig();
    this.outputCache = new Map(); // Cache generated outputs
  }

  /**
   * Get default configuration
   * @returns {object}
   */
  getDefaultConfig() {
    return {
      formats: {
        markdown: true,
        html: true,
        pdf: false,    // Requires server-side rendering
        docx: false,   // Requires server-side rendering
        pptx: false    // Requires server-side rendering
      },
      templates: {
        engagementDocument: 'ea_engagement_document',
        leadershipView: 'ea_leadership_view',
        salesExtract: 'ea_sales_extract'
      },
      versioning: {
        enabled: true,
        autoIncrement: true
      },
      metadata: {
        includeTimestamp: true,
        includeAuthor: true,
        includeEngagementId: true
      }
    };
  }

  /**
   * Generate all outputs for an engagement
   * @param {string} engagementId - Engagement ID
   * @param {object} options - Generation options (formats, template selection)
   * @returns {Promise<GenerationResult>}
   */
  async generateAllOutputs(engagementId, options = {}) {
    try {
      console.log(`📄 Generating outputs for engagement: ${engagementId}`);
      
      // Load engagement data
      const engagement = await this.storage.get('engagements', engagementId);
      if (!engagement) {
        throw new Error(`Engagement ${engagementId} not found`);
      }

      // Load related data
      const engagementData = await this.loadEngagementData(engagementId);
      
      // Generate outputs
      const results = {
        engagementId,
        timestamp: new Date().toISOString(),
        outputs: [],
        errors: []
      };

      // 1. EA Engagement Output Document (full-depth)
      try {
        const engagementDoc = await this.generateEngagementDocument(engagementData, options);
        results.outputs.push(engagementDoc);
      } catch (error) {
        results.errors.push({ type: 'engagementDocument', error: error.message });
      }

      // 2. Portfolio/Leadership View (1-3 pages)
      try {
        const leadershipView = await this.generateLeadershipView(engagementData, options);
        results.outputs.push(leadershipView);
      } catch (error) {
        results.errors.push({ type: 'leadershipView', error: error.message });
      }

      // 3. Sales/Account Planning Extract (1-pager)
      try {
        const salesExtract = await this.generateSalesExtract(engagementData, options);
        results.outputs.push(salesExtract);
      } catch (error) {
        results.errors.push({ type: 'salesExtract', error: error.message });
      }

      // Save generation metadata
      await this.saveGenerationMetadata(results);

      console.log(`✅ Output generation complete: ${results.outputs.length} outputs, ${results.errors.length} errors`);
      return results;

    } catch (error) {
      console.error('❌ Output generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate EA Engagement Output Document
   * Full-depth analysis document (14 sections)
   * 
   * @param {object} engagementData - Complete engagement data
   * @param {object} options - Generation options
   * @returns {Promise<OutputArtifact>}
   */
  async generateEngagementDocument(engagementData, options = {}) {
    console.log('📝 Generating EA Engagement Output Document...');

    const sections = [
      'executiveSummary',
      'engagementOverview',
      'scopeAndObjectives',
      'governanceAndRACI',
      'agilePhases',
      'asisSummary',
      'whitespotAnalysis',
      'stakeholderInsights',
      'targetEAVision',
      'modernizationAndSunsetting',
      'roadmapAndNextSteps',
      'decisionsRisksAssumptions',
      'actionsAndFollowUp',
      'appendices'
    ];

    // Generate markdown
    const markdown = await this.mdGenerator.generateEngagementDocument(engagementData, sections);
    
    // Generate HTML (if enabled)
    let html = null;
    if (this.config.formats.html) {
      html = await this.convertMarkdownToHTML(markdown, 'engagementDocument');
    }

    // Create artifact
    const artifact = this.createOutputArtifact({
      type: 'engagementDocument',
      name: 'EA_Engagement_Output_Document',
      engagementId: engagementData.engagement.id,
      formats: {
        markdown: markdown,
        html: html
      },
      metadata: this.generateMetadata(engagementData)
    });

    // Save to storage
    await this.storage.save('artifacts', artifact);

    return artifact;
  }

  /**
   * Generate Portfolio/Leadership View
   * Investment-focused summary (1-3 pages)
   * 
   * @param {object} engagementData - Complete engagement data
   * @param {object} options - Generation options
   * @returns {Promise<OutputArtifact>}
   */
  async generateLeadershipView(engagementData, options = {}) {
    console.log('📊 Generating Portfolio/Leadership View...');

    const sections = [
      'portfolioContext',
      'strategicThemes',
      'investmentOptions',
      'portfolioRoadmap',
      'valueRiskDependencies',
      'leadershipDecisions'
    ];

    // Generate markdown
    const markdown = await this.mdGenerator.generateLeadershipView(engagementData, sections);
    
    // Generate HTML
    let html = null;
    if (this.config.formats.html) {
      html = await this.convertMarkdownToHTML(markdown, 'leadershipView');
    }

    // Create artifact
    const artifact = this.createOutputArtifact({
      type: 'leadershipView',
      name: 'Portfolio_Leadership_View',
      engagementId: engagementData.engagement.id,
      formats: {
        markdown: markdown,
        html: html
      },
      metadata: this.generateMetadata(engagementData)
    });

    await this.storage.save('artifacts', artifact);
    return artifact;
  }

  /**
   * Generate Sales/Account Planning Extract
   * Value-focused 1-pager
   * 
   * @param {object} engagementData - Complete engagement data
   * @param {object} options - Generation options
   * @returns {Promise<OutputArtifact>}
   */
  async generateSalesExtract(engagementData, options = {}) {
    console.log('💼 Generating Sales/Account Planning Extract...');

    const sections = [
      'valueProposition',
      'businessCase',
      'keyFindings',
      'recommendations',
      'nextSteps'
    ];

    // Generate markdown
    const markdown = await this.mdGenerator.generateSalesExtract(engagementData, sections);
    
    // Generate HTML
    let html = null;
    if (this.config.formats.html) {
      html = await this.convertMarkdownToHTML(markdown, 'salesExtract');
    }

    // Create artifact
    const artifact = this.createOutputArtifact({
      type: 'salesExtract',
      name: 'Sales_Account_Planning_Extract',
      engagementId: engagementData.engagement.id,
      formats: {
        markdown: markdown,
        html: html
      },
      metadata: this.generateMetadata(engagementData)
    });

    await this.storage.save('artifacts', artifact);
    return artifact;
  }

  /**
   * Load complete engagement data from storage
   * @param {string} engagementId
   * @returns {Promise<object>}
   */
  async loadEngagementData(engagementId) {
    const data = {
      engagement: await this.storage.get('engagements', engagementId),
      stakeholders: await this.storage.query('stakeholders', 'engagementId', engagementId) || [],
      applications: await this.storage.query('applications', 'engagementId', engagementId) || [],
      capabilities: await this.storage.query('capabilities', 'engagementId', engagementId) || [],
      initiatives: await this.storage.query('initiatives', 'engagementId', engagementId) || [],
      roadmapItems: await this.storage.query('roadmapItems', 'engagementId', engagementId) || [],
      decisions: await this.storage.query('decisions', 'engagementId', engagementId) || [],
      risks: await this.storage.query('risks', 'engagementId', engagementId) || [],
      constraints: await this.storage.query('constraints', 'engagementId', engagementId) || [],
      assumptions: await this.storage.query('assumptions', 'engagementId', engagementId) || []
    };

    return data;
  }

  /**
   * Convert markdown to HTML with template
   * @param {string} markdown
   * @param {string} templateType
   * @returns {Promise<string>}
   */
  async convertMarkdownToHTML(markdown, templateType) {
    // Simple markdown to HTML conversion (can be enhanced with marked.js or similar)
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraph tags
    html = '<p>' + html + '</p>';

    // Load template
    const template = await this.loadHTMLTemplate(templateType);
    
    // Inject content into template
    const finalHTML = template.replace('{{CONTENT}}', html);

    return finalHTML;
  }

  /**
   * Load HTML template
   * @param {string} templateType
   * @returns {Promise<string>}
   */
  async loadHTMLTemplate(templateType) {
    // Basic template (can be enhanced with actual template files)
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EA Engagement - ${templateType}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 40px; }
        h1 { color: #92400e; border-bottom: 3px solid #ea580c; padding-bottom: 10px; }
        h2 { color: #b45309; margin-top: 30px; }
        h3 { color: #475569; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: 700; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>
    {{CONTENT}}
</body>
</html>`;
  }

  /**
   * Create output artifact object
   * @param {object} data
   * @returns {object}
   */
  createOutputArtifact(data) {
    const version = this.config.versioning.autoIncrement ? this.getNextVersion(data.engagementId, data.type) : 1;
    
    return {
      id: this.generateArtifactId(data.engagementId, data.type, version),
      type: data.type,
      name: data.name,
      engagementId: data.engagementId,
      version: version,
      formats: data.formats,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      createdBy: 'EA_OutputGenerator',
      status: 'generated'
    };
  }

  /**
   * Generate metadata for output
   * @param {object} engagementData
   * @returns {object}
   */
  generateMetadata(engagementData) {
    return {
      engagementId: engagementData.engagement.id,
      engagementName: engagementData.engagement.name || 'Untitled',
      segment: engagementData.engagement.segment,
      generatedAt: new Date().toISOString(),
      generatedBy: 'EA Platform v4.0',
      totalApplications: engagementData.applications?.length || 0,
      totalInitiatives: engagementData.initiatives?.length || 0,
      totalStakeholders: engagementData.stakeholders?.length || 0
    };
  }

  /**
   * Generate artifact ID
   * @param {string} engagementId
   * @param {string} type
   * @param {number} version
   * @returns {string}
   */
  generateArtifactId(engagementId, type, version) {
    return `artifact_${engagementId}_${type}_v${version}_${Date.now()}`;
  }

  /**
   * Get next version number for artifact type
   * @param {string} engagementId
   * @param {string} type
   * @returns {number}
   */
  getNextVersion(engagementId, type) {
    // TODO: Query storage for existing versions
    return 1;
  }

  /**
   * Save generation metadata
   * @param {object} results
   * @returns {Promise<void>}
   */
  async saveGenerationMetadata(results) {
    const metadata = {
      id: `generation_${results.engagementId}_${Date.now()}`,
      engagementId: results.engagementId,
      timestamp: results.timestamp,
      outputCount: results.outputs.length,
      errorCount: results.errors.length,
      outputs: results.outputs.map(o => ({ id: o.id, type: o.type, version: o.version })),
      errors: results.errors
    };

    await this.storage.save('generationHistory', metadata);
  }

  /**
   * Export artifact to downloadable format
   * @param {string} artifactId
   * @param {string} format - 'markdown', 'html', 'pdf', 'docx'
   * @returns {Promise<Blob>}
   */
  async exportArtifact(artifactId, format) {
    const artifact = await this.storage.get('artifacts', artifactId);
    if (!artifact) {
      throw new Error(`Artifact ${artifactId} not found`);
    }

    const content = artifact.formats[format];
    if (!content) {
      throw new Error(`Format ${format} not available for artifact ${artifactId}`);
    }

    const mimeTypes = {
      markdown: 'text/markdown',
      html: 'text/html',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    return new Blob([content], { type: mimeTypes[format] });
  }

  /**
   * Get all artifacts for engagement
   * @param {string} engagementId
   * @returns {Promise<Array>}
   */
  async getEngagementArtifacts(engagementId) {
    try {
      return await this.storage.query('artifacts', 'engagementId', engagementId) || [];
    } catch (error) {
      console.warn('Query not supported, using getAll and filtering:', error);
      const allArtifacts = await this.storage.getAll('artifacts');
      return allArtifacts.filter(a => a.engagementId === engagementId);
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.EA_OutputGenerator = EA_OutputGenerator;
}
