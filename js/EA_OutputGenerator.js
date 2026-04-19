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
        pdf: true,     // Client-side with jsPDF
        xlsx: true,    // Client-side with SheetJS
        pptx: true     // Client-side with PptxGenJS
      },
      templates: {
        engagementDocument: 'ea_engagement_output',
        leadershipView: 'leadership_view',
        salesExtract: 'sales_extract',
        valueCaseDocument: 'value_case_document',
        architectureBlueprint: 'architecture_blueprint'
      },
      versioning: {
        enabled: true,
        autoIncrement: true
      },
      metadata: {
        includeTimestamp: true,
        includeAuthor: true,
        includeEngagementId: true
      },
      libraries: {
        jsPDF: null,        // Will be loaded dynamically
        PptxGenJS: null,    // Will be loaded dynamically
        XLSX: null,         // Will be loaded dynamically
        Handlebars: null    // Will be loaded dynamically
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

  // =====================================================
  // ENHANCED PHASE 4: Advanced Export Capabilities
  // =====================================================

  /**
   * Load external library dynamically
   * @param {string} library - 'jsPDF', 'PptxGenJS', 'XLSX', 'Handlebars'
   * @returns {Promise<object>}
   */
  async loadLibrary(library) {
    if (this.config.libraries[library]) {
      return this.config.libraries[library];
    }

    const cdnUrls = {
      jsPDF: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      PptxGenJS: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
      XLSX: 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js',
      Handlebars: 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.7/handlebars.min.js'
    };

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = cdnUrls[library];
      script.onload = () => {
        console.log(`✅ Loaded ${library} from CDN`);
        // Get library instance from window
        if (library === 'jsPDF') {
          this.config.libraries[library] = window.jspdf?.jsPDF || window.jsPDF;
        } else if (library === 'PptxGenJS') {
          this.config.libraries[library] = window.PptxGenJS;
        } else if (library === 'XLSX') {
          this.config.libraries[library] = window.XLSX;
        } else if (library === 'Handlebars') {
          this.config.libraries[library] = window.Handlebars;
        }
        resolve(this.config.libraries[library]);
      };
      script.onerror = () => {
        reject(new Error(`Failed to load ${library} from CDN`));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Load Handlebars template from file
   * @param {string} templateName - Template name (without .md extension)
   * @returns {Promise<string>}
   */
  async loadTemplate(templateName) {
    try {
      const templatePath = `../NexGenEA/EA2_Toolkit/engagement_templates/${templateName}.md`;
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Template ${templateName} not found`);
      }
      const templateContent = await response.text();
      return templateContent;
    } catch (error) {
      console.error(`❌ Failed to load template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Render template with data using Handlebars
   * @param {string} templateName
   * @param {object} data
   * @returns {Promise<string>}
   */
  async renderTemplate(templateName, data) {
    // Load Handlebars if not already loaded
    if (!this.config.libraries.Handlebars) {
      await this.loadLibrary('Handlebars');
    }

    const Handlebars = this.config.libraries.Handlebars;

    // Register custom helpers
    this.registerHandlebarsHelpers(Handlebars);

    // Load template
    const templateContent = await this.loadTemplate(templateName);

    // Compile template
    const template = Handlebars.compile(templateContent);

    // Render with data
    const rendered = template(data);

    return rendered;
  }

  /**
   * Register custom Handlebars helpers
   * @param {object} Handlebars - Handlebars instance
   */
  registerHandlebarsHelpers(Handlebars) {
    // Equality helper
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    // Greater than helper
    Handlebars.registerHelper('gt', function(a, b) {
      return a > b;
    });

    // Greater than or equal helper
    Handlebars.registerHelper('gte', function(a, b) {
      return a >= b;
    });

    // Includes helper (array or string contains)
    Handlebars.registerHelper('includes', function(collection, value) {
      if (Array.isArray(collection)) {
        return collection.includes(value);
      }
      if (typeof collection === 'string') {
        return collection.includes(value);
      }
      return false;
    });

    // And helper
    Handlebars.registerHelper('and', function(a, b) {
      return a && b;
    });
  }

  /**
   * Validate template data completeness
   * @param {string} templateName
   * @param {object} data
   * @returns {object} - {valid: boolean, missingFields: array}
   */
  validateTemplateData(templateName, data) {
    const requiredFields = {
      ea_engagement_output: ['engagement', 'stakeholders', 'applications', 'capabilities', 'initiatives'],
      leadership_view: ['engagement', 'initiatives', 'risks', 'stakeholders'],
      sales_extract: ['account', 'opportunities', 'engagements', 'stakeholders'],
      value_case_document: ['valueCase', 'opportunity', 'account'],
      architecture_blueprint: ['engagement', 'applications', 'capabilities', 'architectureViews']
    };

    const required = requiredFields[templateName] || [];
    const missingFields = [];

    for (const field of required) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        missingFields.push(field);
      }
    }

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Generate PDF from markdown content
   * @param {string} markdownContent
   * @param {string} title
   * @returns {Promise<Blob>}
   */
  async generatePDF(markdownContent, title = 'EA Document') {
    // Load jsPDF if not already loaded
    if (!this.config.libraries.jsPDF) {
      await this.loadLibrary('jsPDF');
    }

    const jsPDF = this.config.libraries.jsPDF;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Convert markdown to plain text (simple version)
    const plainText = markdownContent
      .replace(/#{1,6}\s/g, '')  // Remove markdown headers
      .replace(/\*\*/g, '')      // Remove bold
      .replace(/\*/g, '')        // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');  // Convert links to text

    // Split text into lines and add to PDF
    const lines = doc.splitTextToSize(plainText, 180);
    
    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(title, 15, 20);

    // Add content
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    let y = 35;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines[i], 15, y);
      y += lineHeight;
    }

    // Add footer with page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
    }

    // Return as Blob
    return doc.output('blob');
  }

  /**
   * Generate PowerPoint presentation
   * @param {object} engagementData
   * @param {string} type - 'engagementDocument', 'leadershipView', 'salesExtract'
   * @returns {Promise<Blob>}
   */
  async generatePPTX(engagementData, type) {
    // Load PptxGenJS if not already loaded
    if (!this.config.libraries.PptxGenJS) {
      await this.loadLibrary('PptxGenJS');
    }

    const PptxGenJS = this.config.libraries.PptxGenJS;
    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.author = 'EA Platform v4.0';
    pptx.company = engagementData.engagement.customerName || 'EA Team';
    pptx.title = engagementData.engagement.name || 'EA Engagement';

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: 'F1F5F9' };
    titleSlide.addText(engagementData.engagement.name || 'EA Engagement', {
      x: 1, y: 2, w: 8, h: 1,
      fontSize: 32,
      bold: true,
      color: '92400E'
    });
    titleSlide.addText(engagementData.engagement.customerName || '', {
      x: 1, y: 3.2, w: 8, h: 0.5,
      fontSize: 20,
      color: '475569'
    });
    titleSlide.addText(new Date().toLocaleDateString(), {
      x: 1, y: 6, w: 8, h: 0.3,
      fontSize: 12,
      color: '64748B'
    });

    // Add content slides based on type
    if (type === 'leadershipView') {
      this.addLeadershipPPTXSlides(pptx, engagementData);
    } else if (type === 'salesExtract') {
      this.addSalesPPTXSlides(pptx, engagementData);
    } else {
      this.addEngagementPPTXSlides(pptx, engagementData);
    }

    // Generate and return as Blob
    const pptxBlob = await pptx.write('blob');
    return pptxBlob;
  }

  /**
   * Add leadership view slides to PPTX
   * @param {object} pptx - PptxGenJS instance
   * @param {object} engagementData
   */
  addLeadershipPPTXSlides(pptx, engagementData) {
    // Slide: Investment Summary
    const investmentSlide = pptx.addSlide();
    investmentSlide.addText('Investment Summary', { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 24, bold: true, color: '92400E' });
    
    const initiatives = engagementData.initiatives || [];
    const totalCost = initiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
    const totalValue = initiatives.reduce((sum, i) => sum + (i.estimatedValue || 0), 0);
    
    const investmentData = [
      ['Metric', 'Value'],
      ['Total Initiatives', initiatives.length.toString()],
      ['Total Investment', `$${totalCost.toLocaleString()}`],
      ['Expected Value', `$${totalValue.toLocaleString()}`],
      ['ROI', `${totalCost > 0 ? Math.round((totalValue - totalCost) / totalCost * 100) : 0}%`]
    ];

    investmentSlide.addTable(investmentData, {
      x: 1, y: 1.5, w: 8, h: 2.5,
      fontSize: 14,
      border: { pt: 1, color: 'CBD5E1' },
      fill: { color: 'F8FAFC' }
    });

    // Slide: Top Initiatives
    const initiativesSlide = pptx.addSlide();
    initiativesSlide.addText('Top Initiatives', { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 24, bold: true, color: '92400E' });
    
    const topInitiatives = initiatives.slice(0, 5).map(i => [
      i.name,
      i.timeHorizon || 'N/A',
      `$${(i.estimatedCost || 0).toLocaleString()}`
    ]);
    
    if (topInitiatives.length > 0) {
      initiativesSlide.addTable([['Initiative', 'Horizon', 'Investment'], ...topInitiatives], {
        x: 0.5, y: 1.5, w: 9, h: 4,
        fontSize: 12,
        border: { pt: 1, color: 'CBD5E1' }
      });
    }
  }

  /**
   * Add sales extract slides to PPTX
   * @param {object} pptx - PptxGenJS instance
   * @param {object} engagementData
   */
  addSalesPPTXSlides(pptx, engagementData) {
    // Slide: Account Overview
    const accountSlide = pptx.addSlide();
    accountSlide.addText('Account Overview', { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 24, bold: true, color: '92400E' });
    
    accountSlide.addText(`Customer: ${engagementData.engagement.customerName || 'N/A'}`, { x: 1, y: 1.5, fontSize: 16 });
    accountSlide.addText(`Segment: ${engagementData.engagement.segment || 'N/A'}`, { x: 1, y: 2, fontSize: 16 });
    accountSlide.addText(`Applications: ${(engagementData.applications || []).length}`, { x: 1, y: 2.5, fontSize: 16 });
    accountSlide.addText(`Stakeholders: ${(engagementData.stakeholders || []).length}`, { x: 1, y: 3, fontSize: 16 });
  }

  /**
   * Add engagement slides to PPTX
   * @param {object} pptx - PptxGenJS instance
   * @param {object} engagementData
   */
  addEngagementPPTXSlides(pptx, engagementData) {
    // Slide: Executive Summary
    const summarySlide = pptx.addSlide();
    summarySlide.addText('Executive Summary', { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 24, bold: true, color: '92400E' });
    summarySlide.addText(engagementData.engagement.theme || 'EA Engagement', { x: 1, y: 1.5, w: 8, h: 3, fontSize: 14 });

    // Slide: Key Metrics
    const metricsSlide = pptx.addSlide();
    metricsSlide.addText('Engagement Metrics', { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 24, bold: true, color: '92400E' });
    
    const metrics = [
      ['Metric', 'Count'],
      ['Applications', (engagementData.applications || []).length.toString()],
      ['Capabilities', (engagementData.capabilities || []).length.toString()],
      ['Initiatives', (engagementData.initiatives || []).length.toString()],
      ['Stakeholders', (engagementData.stakeholders || []).length.toString()],
      ['Risks', (engagementData.risks || []).length.toString()]
    ];

    metricsSlide.addTable(metrics, {
      x: 2, y: 1.5, w: 6, h: 3,
      fontSize: 14,
      border: { pt: 1, color: 'CBD5E1' }
    });
  }

  /**
   * Generate Excel workbook
   * @param {object} engagementData
   * @returns {Promise<Blob>}
   */
  async generateXLSX(engagementData) {
    // Load XLSX if not already loaded
    if (!this.config.libraries.XLSX) {
      await this.loadLibrary('XLSX');
    }

    const XLSX = this.config.libraries.XLSX;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = [
      ['Engagement Name', engagementData.engagement.name || 'N/A'],
      ['Customer', engagementData.engagement.customerName || 'N/A'],
      ['Segment', engagementData.engagement.segment || 'N/A'],
      ['Theme', engagementData.engagement.theme || 'N/A'],
      ['Status', engagementData.engagement.status || 'N/A'],
      ['Start Date', engagementData.engagement.startDate || 'N/A'],
      ['End Date', engagementData.engagement.endDate || 'N/A'],
      [''],
      ['Metrics', 'Count'],
      ['Applications', (engagementData.applications || []).length],
      ['Capabilities', (engagementData.capabilities || []).length],
      ['Initiatives', (engagementData.initiatives || []).length],
      ['Stakeholders', (engagementData.stakeholders || []).length],
      ['Risks', (engagementData.risks || []).length]
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

    // Sheet 2: Applications
    if (engagementData.applications && engagementData.applications.length > 0) {
      const appData = [
        ['Name', 'Category', 'Technology', 'Business Value', 'Technical Fit', 'Lifecycle', 'Recommendation'],
        ...engagementData.applications.map(app => [
          app.name,
          app.category || '',
          app.technology || '',
          app.businessValue || '',
          app.technicalFit || '',
          app.lifecycleStage || '',
          app.recommendation || ''
        ])
      ];
      const wsApps = XLSX.utils.aoa_to_sheet(appData);
      XLSX.utils.book_append_sheet(wb, wsApps, 'Applications');
    }

    // Sheet 3: Initiatives
    if (engagementData.initiatives && engagementData.initiatives.length > 0) {
      const initData = [
        ['Name', 'Time Horizon', 'Status', 'Effort', 'Estimated Cost', 'Estimated Value'],
        ...engagementData.initiatives.map(init => [
          init.name,
          init.timeHorizon || '',
          init.status || '',
          init.effort || '',
          init.estimatedCost || 0,
          init.estimatedValue || 0
        ])
      ];
      const wsInit = XLSX.utils.aoa_to_sheet(initData);
      XLSX.utils.book_append_sheet(wb, wsInit, 'Initiatives');
    }

    // Sheet 4: Stakeholders
    if (engagementData.stakeholders && engagementData.stakeholders.length > 0) {
      const stakeholderData = [
        ['Name', 'Role', 'Type', 'Level', 'Decision Power', 'Influence'],
        ...engagementData.stakeholders.map(s => [
          s.name,
          s.role || '',
          s.type || '',
          s.level || '',
          s.decisionPower || '',
          s.influence || ''
        ])
      ];
      const wsStakeholders = XLSX.utils.aoa_to_sheet(stakeholderData);
      XLSX.utils.book_append_sheet(wb, wsStakeholders, 'Stakeholders');
    }

    // Sheet 5: Risks
    if (engagementData.risks && engagementData.risks.length > 0) {
      const riskData = [
        ['Name', 'Category', 'Probability', 'Impact', 'Mitigation', 'Owner', 'Status'],
        ...engagementData.risks.map(r => [
          r.name,
          r.category || '',
          r.probability || '',
          r.impact || '',
          r.mitigation || '',
          r.owner || '',
          r.status || ''
        ])
      ];
      const wsRisks = XLSX.utils.aoa_to_sheet(riskData);
      XLSX.utils.book_append_sheet(wb, wsRisks, 'Risks');
    }

    // Generate and return as Blob
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.document' });
  }

  /**
   * Batch export: Generate all 3 formats (MD, PDF, PPTX) for a document type
   * @param {string} engagementId
   * @param {string} templateType - 'ea_engagement_output', 'leadership_view', 'sales_extract', etc.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async batchExport(engagementId, templateType, options = {}) {
    console.log(`📦 Starting batch export for ${templateType}...`);

    try {
      // Load engagement data
      const engagementData = await this.loadEngagementData(engagementId);

      // Add additional data for templates
      const templateData = await this.prepareTemplateData(engagementData, templateType);

      // Validate data
      const validation = this.validateTemplateData(templateType, templateData);
      if (!validation.valid) {
        console.warn(`⚠️ Template data incomplete. Missing fields: ${validation.missingFields.join(', ')}`);
      }

      const results = {
        engagementId,
        templateType,
        timestamp: new Date().toISOString(),
        outputs: {},
        errors: []
      };

      // 1. Generate Markdown
      try {
        const markdown = await this.renderTemplate(templateType, templateData);
        results.outputs.markdown = {
          content: markdown,
          filename: `${templateType}_${engagementId}.md`,
          size: new Blob([markdown]).size
        };
        console.log('✅ Markdown generated');
      } catch (error) {
        results.errors.push({ format: 'markdown', error: error.message });
        console.error('❌ Markdown generation failed:', error);
      }

      // 2. Generate PDF
      if (this.config.formats.pdf) {
        try {
          const pdfBlob = await this.generatePDF(
            results.outputs.markdown?.content || 'No content',
            templateData.engagement?.name || 'EA Document'
          );
          results.outputs.pdf = {
            blob: pdfBlob,
            filename: `${templateType}_${engagementId}.pdf`,
            size: pdfBlob.size
          };
          console.log('✅ PDF generated');
        } catch (error) {
          results.errors.push({ format: 'pdf', error: error.message });
          console.error('❌ PDF generation failed:', error);
        }
      }

      // 3. Generate PPTX
      if (this.config.formats.pptx) {
        try {
          const pptxBlob = await this.generatePPTX(templateData, templateType);
          results.outputs.pptx = {
            blob: pptxBlob,
            filename: `${templateType}_${engagementId}.pptx`,
            size: pptxBlob.size
          };
          console.log('✅ PPTX generated');
        } catch (error) {
          results.errors.push({ format: 'pptx', error: error.message });
          console.error('❌ PPTX generation failed:', error);
        }
      }

      // 4. Generate XLSX (optional, mainly for data-heavy exports)
      if (this.config.formats.xlsx && options.includeXLSX) {
        try {
          const xlsxBlob = await this.generateXLSX(templateData);
          results.outputs.xlsx = {
            blob: xlsxBlob,
            filename: `${templateType}_${engagementId}.xlsx`,
            size: xlsxBlob.size
          };
          console.log('✅ XLSX generated');
        } catch (error) {
          results.errors.push({ format: 'xlsx', error: error.message });
          console.error('❌ XLSX generation failed:', error);
        }
      }

      console.log(`✅ Batch export complete: ${Object.keys(results.outputs).length} formats generated`);
      return results;

    } catch (error) {
      console.error('❌ Batch export failed:', error);
      throw error;
    }
  }

  /**
   * Prepare template data by enriching engagement data with computed fields
   * @param {object} engagementData
   * @param {string} templateType
   * @returns {Promise<object>}
   */
  async prepareTemplateData(engagementData, templateType) {
    const data = { ...engagementData };

    // Add computed fields
    data.generatedDate = new Date().toLocaleString();

    // Portfolio stats
    data.portfolio = {
      invest: (data.applications || []).filter(a => a.recommendation === 'invest').length,
      maintain: (data.applications || []).filter(a => a.recommendation === 'maintain').length,
      contain: (data.applications || []).filter(a => a.recommendation === 'contain').length,
      sunset: (data.applications || []).filter(a => a.recommendation === 'sunset').length
    };

    // Initiative aggregations
    if (data.initiatives) {
      data.totals = {
        shortTerm: {
          cost: data.initiatives.filter(i => i.timeHorizon === 'short').reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
          value: data.initiatives.filter(i => i.timeHorizon === 'short').reduce((sum, i) => sum + (i.estimatedValue || 0), 0)
        },
        midTerm: {
          cost: data.initiatives.filter(i => i.timeHorizon === 'mid').reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
          value: data.initiatives.filter(i => i.timeHorizon === 'mid').reduce((sum, i) => sum + (i.estimatedValue || 0), 0)
        },
        longTerm: {
          cost: data.initiatives.filter(i => i.timeHorizon === 'long').reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
          value: data.initiatives.filter(i => i.timeHorizon === 'long').reduce((sum, i) => sum + (i.estimatedValue || 0), 0)
        },
        totalInvestment: data.initiatives.reduce((sum, i) => sum + (i.estimatedCost || 0), 0),
        totalValue: data.initiatives.reduce((sum, i) => sum + (i.estimatedValue || 0), 0),
        quickWins: data.initiatives.filter(i => i.timeHorizon === 'short' && i.effort === 'low').length
      };

      data.totals.roi = data.totals.totalInvestment > 0 
        ? Math.round((data.totals.totalValue - data.totals.totalInvestment) / data.totals.totalInvestment * 100)
        : 0;
    }

    // Stakeholder stats
    if (data.stakeholders) {
      data.stakeholderStats = {
        executiveCount: data.stakeholders.filter(s => s.level === 'executive').length,
        decisionMakerCount: data.stakeholders.filter(s => s.decisionPower === 'high').length,
        technicalCount: data.stakeholders.filter(s => s.type === 'technical').length
      };
    }

    // Applications by category
    if (data.applications) {
      const categoryCounts = {};
      data.applications.forEach(app => {
        const cat = app.category || 'Uncategorized';
        if (!categoryCounts[cat]) {
          categoryCounts[cat] = { category: cat, count: 0, applications: [] };
        }
        categoryCounts[cat].count++;
        categoryCounts[cat].applications.push(app);
      });
      data.applicationsByCategory = Object.values(categoryCounts);
    }

    return data;
  }

  /**
   * Download artifact directly to user's computer
   * @param {string} filename
   * @param {Blob} blob
   */
  downloadFile(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`✅ Downloaded: ${filename}`);
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
