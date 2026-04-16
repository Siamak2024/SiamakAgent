/**
 * APQC PCF Excel to JSON Converter
 * ===================================
 * Converts APQC Process Classification Framework Excel file to JSON format
 * compatible with EA V5 Platform capability model.
 * 
 * Usage:
 *   node scripts/convert_apqc_to_json.js
 * 
 * Requirements:
 *   npm install xlsx
 * 
 * Input: APAQ_Data/source/K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.xlsx
 * Output: APAQ_Data/apqc_pcf_master.json
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    inputFile: path.join(__dirname, '../APAQ_Data/source/K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.xlsx'),
    outputFile: path.join(__dirname, '../APAQ_Data/apqc_pcf_master.json'),
    enrichmentFile: path.join(__dirname, '../APAQ_Data/apqc_capability_enrichment.json'),
    metadataFile: path.join(__dirname, '../APAQ_Data/apqc_metadata_mapping.json'),
    
    // Expected Excel column mappings (adjust based on actual file structure)
    columns: {
        level1: 'Category',
        level2: 'Process Group',
        level3: 'Process',
        level4: 'Activity',
        code: 'ID',
        description: 'Description',
        // Add more as needed based on actual Excel structure
    }
};

/**
 * Parse APQC Excel file and convert to hierarchical JSON
 */
function convertAPQCExcelToJSON() {
    console.log('🔄 Starting APQC Excel to JSON conversion...');
    
    // Check if input file exists
    if (!fs.existsSync(CONFIG.inputFile)) {
        console.error(`❌ Input file not found: ${CONFIG.inputFile}`);
        console.log('📋 Please place the APQC Excel file at:');
        console.log(`   ${CONFIG.inputFile}`);
        console.log('\n💡 Or update the inputFile path in this script.');
        process.exit(1);
    }

    try {
        // Read Excel file
        console.log('📖 Reading Excel file...');
        const workbook = XLSX.readFile(CONFIG.inputFile);
        const sheetName = workbook.SheetNames[0]; // Assume first sheet contains PCF data
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        console.log(`✅ Parsed ${rawData.length} rows from Excel`);

        // Build hierarchical structure
        console.log('🏗️  Building hierarchical structure...');
        const hierarchy = buildHierarchy(rawData);

        // Load metadata for enrichment
        const metadata = JSON.parse(fs.readFileSync(CONFIG.metadataFile, 'utf8'));

        // Enrich with metadata
        console.log('✨ Enriching capabilities with metadata...');
        const enrichedData = enrichCapabilities(hierarchy, metadata);

        // Create output structure
        const output = {
            framework_version: "8.0",
            framework_type: "Cross-Industry",
            last_updated: new Date().toISOString().split('T')[0],
            total_categories: enrichedData.categories.length,
            source: "APQC Process Classification Framework",
            categories: enrichedData.categories
        };

        // Write master JSON
        console.log('💾 Writing master JSON file...');
        fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));
        console.log(`✅ Master file created: ${CONFIG.outputFile}`);

        // Write enrichment file
        console.log('💾 Writing enrichment data...');
        fs.writeFileSync(CONFIG.enrichmentFile, JSON.stringify(enrichedData.enrichment, null, 2));
        console.log(`✅ Enrichment file created: ${CONFIG.enrichmentFile}`);

        // Statistics
        console.log('\n📊 Conversion Statistics:');
        console.log(`   Total L1 Categories: ${enrichedData.categories.length}`);
        console.log(`   Total Capabilities: ${enrichedData.totalCapabilities}`);
        console.log(`   AI-Enabled: ${enrichedData.aiEnabledCount}`);
        console.log('\n✅ Conversion complete!');

    } catch (error) {
        console.error('❌ Conversion failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Build hierarchical structure from flat Excel data
 */
function buildHierarchy(rawData) {
    const categories = [];
    const level1Map = new Map();
    const level2Map = new Map();
    const level3Map = new Map();

    rawData.forEach((row, index) => {
        // Determine level based on row structure
        // This logic needs to be adjusted based on actual Excel format
        const level = detectLevel(row);
        const capability = {
            id: row.ID || row.Code || `cap-${index}`,
            level: level,
            code: row.ID || row.Code,
            name: row.Name || row.Process || row.Category,
            description: row.Description || '',
            children: []
        };

        if (level === 1) {
            level1Map.set(capability.id, capability);
            categories.push(capability);
        } else if (level === 2) {
            capability.parent_id = findParentId(row, level1Map);
            const parent = level1Map.get(capability.parent_id);
            if (parent) {
                parent.children.push(capability);
                level2Map.set(capability.id, capability);
            }
        } else if (level === 3) {
            capability.parent_id = findParentId(row, level2Map);
            const parent = level2Map.get(capability.parent_id);
            if (parent) {
                parent.children.push(capability);
                level3Map.set(capability.id, capability);
            }
        } else if (level === 4) {
            capability.parent_id = findParentId(row, level3Map);
            const parent = level3Map.get(capability.parent_id);
            if (parent) {
                parent.children.push(capability);
            }
        }
    });

    return categories;
}

/**
 * Detect hierarchy level from row data
 */
function detectLevel(row) {
    // Logic depends on Excel structure
    // Common patterns:
    // - Level indicated by column position
    // - Level indicated by ID format (1.0, 1.1, 1.1.1)
    // - Level indicated by indentation
    
    const id = row.ID || row.Code || '';
    const parts = id.split('.');
    
    if (parts.length === 1 || (parts.length === 2 && parts[1] === '0')) return 1;
    if (parts.length === 2) return 2;
    if (parts.length === 3) return 3;
    if (parts.length === 4) return 4;
    
    return 1; // Default
}

/**
 * Find parent ID based on hierarchy
 */
function findParentId(row, parentMap) {
    const id = row.ID || row.Code || '';
    const parts = id.split('.');
    
    if (parts.length <= 1) return null;
    
    // Remove last part to get parent ID
    const parentId = parts.slice(0, -1).join('.');
    
    return parentId;
}

/**
 * Enrich capabilities with metadata
 */
function enrichCapabilities(categories, metadata) {
    const enrichment = [];
    let totalCapabilities = 0;
    let aiEnabledCount = 0;

    function enrichNode(node, parentContext = {}) {
        totalCapabilities++;

        // Determine business types
        const businessTypes = determineBusinessTypes(node, metadata);
        
        // Determine strategic alignment
        const strategicAlignment = determineStrategicAlignment(node, metadata);
        
        // Determine AI transformation potential
        const aiTransformation = determineAITransformation(node, metadata);
        
        if (aiTransformation.ai_enabled) aiEnabledCount++;

        // Create enrichment record
        const enrichmentRecord = {
            capability_id: node.id,
            code: node.code,
            name: node.name,
            level: node.level,
            source: "APQC",
            business_types: businessTypes,
            strategic_alignment: strategicAlignment,
            ai_transformation: aiTransformation,
            tags: generateTags(node),
            parent_id: node.parent_id || null
        };

        enrichment.push(enrichmentRecord);

        // Recursively enrich children
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => enrichNode(child, { parent: node }));
        }
    }

    categories.forEach(category => enrichNode(category));

    return {
        categories,
        enrichment,
        totalCapabilities,
        aiEnabledCount
    };
}

/**
 * Determine applicable business types
 */
function determineBusinessTypes(node, metadata) {
    const categoryCode = node.id.split('.')[0] + '.0';
    const businessTypes = ['All']; // All capabilities apply to all by default
    
    // Add specific business types based on category
    Object.entries(metadata.business_type_mappings).forEach(([type, config]) => {
        if (config.primary_categories?.includes(categoryCode)) {
            businessTypes.push(type);
        }
    });
    
    return [...new Set(businessTypes)]; // Remove duplicates
}

/**
 * Determine strategic alignment
 */
function determineStrategicAlignment(node, metadata) {
    const categoryCode = node.id.split('.')[0] + '.0';
    const bmcElements = [];
    
    Object.entries(metadata.bmc_element_mappings).forEach(([element, config]) => {
        if (config.primary_categories?.includes(categoryCode)) {
            bmcElements.push(element);
        }
    });

    return {
        intent_categories: determineIntentCategories(categoryCode, metadata),
        bmc_elements: bmcElements
    };
}

/**
 * Determine strategic intent categories
 */
function determineIntentCategories(categoryCode, metadata) {
    const intents = [];
    
    Object.entries(metadata.strategic_intent_mappings).forEach(([intent, config]) => {
        if (config.primary_categories?.includes(categoryCode)) {
            intents.push(intent);
        }
    });
    
    return intents.length > 0 ? intents : ['All'];
}

/**
 * Determine AI transformation potential
 */
function determineAITransformation(node, metadata) {
    const categoryCode = node.id.split('.')[0] + '.0';
    
    // Check AI transformation mappings
    for (const [potential, config] of Object.entries(metadata.ai_transformation_mappings)) {
        if (config.categories.includes(categoryCode)) {
            let maturity = 2; // Default medium maturity
            if (potential === 'high_potential') maturity = 4;
            if (potential === 'foundational') maturity = 3;
            
            return {
                ai_enabled: potential !== 'foundational',
                ai_opportunity: `${node.name} can leverage ${config.ai_types.join(', ')} for automation and optimization`,
                ai_maturity: maturity,
                ai_types: config.ai_types
            };
        }
    }
    
    return {
        ai_enabled: false,
        ai_opportunity: '',
        ai_maturity: 1,
        ai_types: []
    };
}

/**
 * Generate tags for capability
 */
function generateTags(node) {
    const tags = [];
    const name = node.name.toLowerCase();
    
    // Extract keywords
    if (name.includes('develop') || name.includes('design')) tags.push('development');
    if (name.includes('manage') || name.includes('management')) tags.push('management');
    if (name.includes('deliver') || name.includes('service')) tags.push('delivery');
    if (name.includes('market') || name.includes('sales')) tags.push('commercial');
    if (name.includes('supply') || name.includes('logistics')) tags.push('operations');
    if (name.includes('finance') || name.includes('accounting')) tags.push('finance');
    if (name.includes('hr') || name.includes('people') || name.includes('talent')) tags.push('human-resources');
    if (name.includes('technology') || name.includes('it') || name.includes('digital')) tags.push('technology');
    
    return tags.length > 0 ? tags : ['general'];
}

// Run converter
convertAPQCExcelToJSON();
