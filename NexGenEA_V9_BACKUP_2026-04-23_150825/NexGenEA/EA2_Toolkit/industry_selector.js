/**
 * industry_selector.js
 * Industry dropdown component for customer creation
 * Populates from APQC framework with financial services focus
 * 
 * @version 1.0
 * @date 2026-04-21
 */

/**
 * Render industry dropdown with grouped options
 * @param {string} selectedValue - Currently selected industry
 * @param {string} elementId - HTML element ID for the select
 * @returns {string} - HTML for industry dropdown
 */
function renderIndustryDropdown(selectedValue = '', elementId = 'customer-industry') {
    if (!window.apqcWhiteSpotIntegration || !window.apqcWhiteSpotIntegration.isReady()) {
        // Fallback if APQC not loaded
        return `
            <select id="${elementId}" class="form-input" required>
                <option value="">Select industry...</option>
                <optgroup label="Financial Services">
                    <option value="banking" ${selectedValue === 'banking' ? 'selected' : ''}>Banking</option>
                    <option value="insurance" ${selectedValue === 'insurance' ? 'selected' : ''}>Insurance</option>
                    <option value="finance" ${selectedValue === 'finance' ? 'selected' : ''}>Finance & Investment</option>
                    <option value="wealth_management" ${selectedValue === 'wealth_management' ? 'selected' : ''}>Wealth Management</option>
                    <option value="asset_management" ${selectedValue === 'asset_management' ? 'selected' : ''}>Asset Management</option>
                </optgroup>
                <optgroup label="Other Industries">
                    <option value="technology" ${selectedValue === 'technology' ? 'selected' : ''}>Technology</option>
                    <option value="manufacturing" ${selectedValue === 'manufacturing' ? 'selected' : ''}>Manufacturing</option>
                    <option value="retail" ${selectedValue === 'retail' ? 'selected' : ''}>Retail</option>
                    <option value="healthcare" ${selectedValue === 'healthcare' ? 'selected' : ''}>Healthcare</option>
                    <option value="utilities" ${selectedValue === 'utilities' ? 'selected' : ''}>Utilities</option>
                    <option value="government" ${selectedValue === 'government' ? 'selected' : ''}>Government</option>
                </optgroup>
            </select>
        `;
    }

    // Get industries from APQC
    const industries = window.apqcWhiteSpotIntegration.getIndustries();
    
    // Group by category
    const grouped = {};
    industries.forEach(ind => {
        if (!grouped[ind.category]) {
            grouped[ind.category] = [];
        }
        grouped[ind.category].push(ind);
    });

    // Build HTML
    let html = `<select id="${elementId}" class="form-input" required>`;
    html += `<option value="">Select industry...</option>`;
    
    // Sort categories - Financial Services first
    const categories = Object.keys(grouped).sort((a, b) => {
        if (a === 'Financial Services') return -1;
        if (b === 'Financial Services') return 1;
        return a.localeCompare(b);
    });

    categories.forEach(category => {
        html += `<optgroup label="${category}">`;
        grouped[category].forEach(ind => {
            const selected = ind.value === selectedValue ? 'selected' : '';
            const badge = ind.apqcBased ? ' 📊' : '';
            html += `<option value="${ind.value}" ${selected}>${ind.label}${badge}</option>`;
        });
        html += `</optgroup>`;
    });

    html += `</select>`;
    html += `<small style="color: #6b7280; font-size: 12px; margin-top: 4px; display: block;">📊 = APQC framework-based industry | Enables intelligent capability mapping</small>`;

    return html;
}

/**
 * Get industry label from value
 * @param {string} industryValue - Industry value
 * @returns {string} - Formatted label
 */
function getIndustryLabel(industryValue) {
    if (!industryValue) return 'Not Specified';
    
    if (!window.apqcWhiteSpotIntegration || !window.apqcWhiteSpotIntegration.isReady()) {
        return industryValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    const industries = window.apqcWhiteSpotIntegration.getIndustries();
    const industry = industries.find(i => i.value === industryValue);
    return industry ? industry.label : industryValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Initialize industry dropdown in a container
 * @param {string} containerId - Container element ID
 * @param {string} selectedValue - Pre-selected value
 */
function initializeIndustryDropdown(containerId, selectedValue = '') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container ${containerId} not found for industry dropdown`);
        return;
    }

    container.innerHTML = renderIndustryDropdown(selectedValue);
}

// Export functions for global access
if (typeof window !== 'undefined') {
    window.renderIndustryDropdown = renderIndustryDropdown;
    window.getIndustryLabel = getIndustryLabel;
    window.initializeIndustryDropdown = initializeIndustryDropdown;
}

console.log('✓ Industry Selector loaded');
