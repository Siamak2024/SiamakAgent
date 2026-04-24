/**
 * whitespot_help_system.js
 * Phase 5: Help & Guidance System for WhiteSpot Heatmap
 * - Comprehensive help modal with feature guide
 * - Inline tooltips for key features
 * - Keyboard shortcuts
 * - Quick start guide
 * 
 * @version 1.0
 * @date 2026-04-20
 */

// ═══════════════════════════════════════════════════════════════════
// HELP MODAL
// ═══════════════════════════════════════════════════════════════════

/**
 * Show comprehensive help modal
 */
function showWhiteSpotHelp() {
    const modalContent = `
        <div style="padding: 20px; max-width: 900px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="margin: 0;">WhiteSpot Heatmap - User Guide</h3>
                <button class="btn btn-ghost" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Tab Navigation -->
            <div class="modal-tabs" style="margin-bottom: 24px;">
                <button class="modal-tab active" onclick="switchHelpTab('overview')">
                    <i class="fas fa-info-circle"></i> Overview
                </button>
                <button class="modal-tab" onclick="switchHelpTab('getting-started')">
                    <i class="fas fa-play-circle"></i> Getting Started
                </button>
                <button class="modal-tab" onclick="switchHelpTab('features')">
                    <i class="fas fa-star"></i> Features
                </button>
                <button class="modal-tab" onclick="switchHelpTab('shortcuts')">
                    <i class="fas fa-keyboard"></i> Shortcuts
                </button>
                <button class="modal-tab" onclick="switchHelpTab('faq')">
                    <i class="fas fa-question"></i> FAQ
                </button>
            </div>
            
            <!-- Tab Content: Overview -->
            <div id="help-tab-overview" class="modal-tab-content active">
                <h4 style="color: #111827; margin-bottom: 16px;">What is WhiteSpot Heatmap?</h4>
                <p style="color: #6b7280; line-height: 1.6; margin-bottom: 16px;">
                    WhiteSpot Heatmap is a comprehensive service delivery assessment tool that helps you:
                </p>
                <ul style="color: #374151; line-height: 1.8; margin-bottom: 24px;">
                    <li><strong>Assess Coverage:</strong> Evaluate delivery status across 41 High-Level services</li>
                    <li><strong>Track Service States:</strong> Classify services as FULL, PARTIAL, CUSTOM, LOST, or POTENTIAL</li>
                    <li><strong>Identify Gaps:</strong> Discover service delivery gaps and white-spots (undelivered capabilities)</li>
                    <li><strong>Map to APQC:</strong> Align services to APQC business capabilities for strategic context</li>
                    <li><strong>Capture Opportunities:</strong> Document expansion and upsell opportunities with estimated values</li>
                    <li><strong>Analyze Trends:</strong> View coverage analytics and identify high-priority improvement areas</li>
                </ul>
                
                <h4 style="color: #111827; margin-bottom: 16px;">Assessment States Explained</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    ${renderStateExplanation('FULL', 'check-circle', '#10b981', 'All L3 components delivered and operational')}
                    ${renderStateExplanation('PARTIAL', 'exclamation-circle', '#f59e0b', 'Some components delivered, gaps exist')}
                    ${renderStateExplanation('CUSTOM', 'cog', '#3b82f6', 'Bespoke solution for specific requirements')}
                    ${renderStateExplanation('LOST', 'times-circle', '#ef4444', 'Service not currently delivered')}
                    ${renderStateExplanation('POTENTIAL', 'star', '#f97316', 'Opportunity identified, not yet delivered')}
                </div>
                
                <div style="background: #dbeafe; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px;">
                        <strong><i class="fas fa-lightbulb"></i> Pro Tip:</strong> Start by assessing high-priority services first, then expand to the full portfolio. Use the filter controls to focus on specific service areas or states.
                    </p>
                </div>
            </div>
            
            <!-- Tab Content: Getting Started -->
            <div id="help-tab-getting-started" class="modal-tab-content" style="display: none;">
                <h4 style="color: #111827; margin-bottom: 16px;">Quick Start Guide</h4>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="color: #374151; margin-bottom: 12px;">Step 1: Create or Generate Heatmap</h5>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li><strong>Manual Creation:</strong> Click "Create Heatmap" to start with blank assessments</li>
                        <li><strong>Demo Data:</strong> Click "Generate Demo Data" to create realistic sample data for testing</li>
                    </ul>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="color: #374151; margin-bottom: 12px;">Step 2: Assess Services</h5>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>Click on any service row to open the detailed drill-down view</li>
                        <li>Set the assessment state (FULL, PARTIAL, CUSTOM, LOST, POTENTIAL)</li>
                        <li>Toggle individual L3 components to track detailed delivery status</li>
                        <li>Add notes to document your assessment rationale</li>
                    </ul>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="color: #374151; margin-bottom: 12px;">Step 3: Map to APQC Capabilities</h5>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>In the drill-down modal, switch to the "APQC Mapping" tab</li>
                        <li>Click "Generate AI Suggestions" for automated mapping recommendations</li>
                        <li>Review suggested mappings with confidence scores</li>
                        <li>Apply high-confidence mappings or create custom mappings</li>
                    </ul>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="color: #374151; margin-bottom: 12px;">Step 4: Capture Opportunities</h5>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>In the drill-down modal, switch to the "Opportunities" tab</li>
                        <li>Click "Add Opportunity" to document gaps and expansion potential</li>
                        <li>Enter estimated value, priority, target date, and description</li>
                        <li>Link opportunities to specific services or mark as general</li>
                    </ul>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h5 style="color: #374151; margin-bottom: 12px;">Step 5: Analyze & Export</h5>
                    <ul style="color: #6b7280; line-height: 1.8;">
                        <li>Click "Analytics" to view comprehensive dashboard with charts</li>
                        <li>Use filters to focus on specific states, service areas, or score ranges</li>
                        <li>Export to CSV for Excel analysis or Print for stakeholder presentations</li>
                        <li>Download JSON for backup or sharing with team members</li>
                    </ul>
                </div>
            </div>
            
            <!-- Tab Content: Features -->
            <div id="help-tab-features" class="modal-tab-content" style="display: none;">
                <h4 style="color: #111827; margin-bottom: 16px;">Key Features</h4>
                
                ${renderFeatureSection('Filtering & Search', 'filter', [
                    'Text search across service names',
                    'Filter by assessment state (FULL, PARTIAL, etc.)',
                    'Filter by L1 service area',
                    'Score range filtering (0-100%)',
                    'Quick filters: Gaps Only, Has Opportunities',
                    'Active filter tags with one-click removal'
                ])}
                
                ${renderFeatureSection('Bulk Operations', 'tasks', [
                    'Bulk update assessment state for filtered services',
                    'Generate AI-powered APQC mappings for all services',
                    'Export opportunities to CSV',
                    'Batch operations save time on large assessments'
                ])}
                
                ${renderFeatureSection('Analytics Dashboard', 'chart-bar', [
                    'State distribution horizontal bar chart',
                    'Coverage by L1 service area visualization',
                    'Top 5 opportunities ranked by value',
                    'Gap analysis with top 10 gaps',
                    'Summary metrics: total services, avg coverage, opportunity value',
                    'Export analytics report to JSON'
                ])}
                
                ${renderFeatureSection('Service Drill-Down', 'eye', [
                    'Detailed L3 component tracking',
                    'APQC capability mapping with AI suggestions',
                    'Service-specific opportunity capture',
                    'Comprehensive notes and documentation',
                    'Automated score calculation based on L3 delivery'
                ])}
                
                ${renderFeatureSection('Custom Business Areas', 'sitemap', [
                    'Create custom business areas/capabilities',
                    'Link multiple services to business areas',
                    'Document area-specific requirements',
                    'Priority and notes for each area'
                ])}
                
                ${renderFeatureSection('Export & Print', 'download', [
                    'Excel-compatible CSV export with all details',
                    'Print-friendly HTML generation',
                    'JSON export for backup and sharing',
                    'Analytics report export'
                ])}
            </div>
            
            <!-- Tab Content: Keyboard Shortcuts -->
            <div id="help-tab-shortcuts" class="modal-tab-content" style="display: none;">
                <h4 style="color: #111827; margin-bottom: 16px;">Keyboard Shortcuts</h4>
                <p style="color: #6b7280; margin-bottom: 20px;">
                    Use these keyboard shortcuts to work more efficiently:
                </p>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 30%;">Shortcut</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
                            <td>Focus search filter</td>
                        </tr>
                        <tr>
                            <td><kbd>Ctrl</kbd> + <kbd>H</kbd></td>
                            <td>Toggle help modal</td>
                        </tr>
                        <tr>
                            <td><kbd>Ctrl</kbd> + <kbd>A</kbd></td>
                            <td>Open analytics dashboard</td>
                        </tr>
                        <tr>
                            <td><kbd>Ctrl</kbd> + <kbd>E</kbd></td>
                            <td>Export to CSV</td>
                        </tr>
                        <tr>
                            <td><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
                            <td>Print heatmap</td>
                        </tr>
                        <tr>
                            <td><kbd>Esc</kbd></td>
                            <td>Close modal/dialog</td>
                        </tr>
                        <tr>
                            <td><kbd>Tab</kbd></td>
                            <td>Navigate between form fields</td>
                        </tr>
                        <tr>
                            <td><kbd>Enter</kbd></td>
                            <td>Submit form / Confirm action</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px;">
                        <strong><i class="fas fa-info-circle"></i> Note:</strong> Some shortcuts may conflict with browser defaults. Use with care or customize in your browser settings.
                    </p>
                </div>
            </div>
            
            <!-- Tab Content: FAQ -->
            <div id="help-tab-faq" class="modal-tab-content" style="display: none;">
                <h4 style="color: #111827; margin-bottom: 16px;">Frequently Asked Questions</h4>
                
                ${renderFAQItem(
                    'How many High-Level services should I see?',
                    'The heatmap assesses 41 High-Level (HL) services across 3 main L1 service areas: Consulting & Project Services, Managed Services, and Platform Services.'
                )}
                
                ${renderFAQItem(
                    'What is the difference between PARTIAL and CUSTOM states?',
                    'PARTIAL means standard services are delivered but with gaps (e.g., only 50% of L3 components). CUSTOM means a bespoke solution was implemented instead of the standard service offering.'
                )}
                
                ${renderFAQItem(
                    'How is the coverage score calculated?',
                    'The score is automatically calculated as: (Number of Delivered L3 Components / Total L3 Components) × 100%. Toggle individual L3 components in the drill-down view to update the score.'
                )}
                
                ${renderFAQItem(
                    'Can I manually override APQC mappings?',
                    'Yes! After generating AI suggestions, you can remove unwanted mappings and add custom mappings using the "Add Custom Mapping" button in the APQC Mapping tab.'
                )}
                
                ${renderFAQItem(
                    'What happens if I generate demo data for a customer with existing heatmap?',
                    'The system will prompt you for confirmation before replacing existing data. Demo generation is destructive and will overwrite all current assessments, opportunities, and mappings.'
                )}
                
                ${renderFAQItem(
                    'How do filters affect bulk operations?',
                    'Bulk operations only apply to currently visible (filtered) services. For example, if you filter to show only "PARTIAL" services, bulk "Mark as FULL" will only update those filtered services.'
                )}
                
                ${renderFAQItem(
                    'Can I create multiple heatmaps per customer?',
                    'Currently, each customer has one active heatmap. To track changes over time, export the current heatmap to JSON before making major updates, or use version control in your assessment notes.'
                )}
                
                ${renderFAQItem(
                    'What is the recommended assessment workflow?',
                    '1) Start with high-priority L1 areas, 2) Assess each L2 service state, 3) Drill down to toggle L3 components, 4) Generate APQC mappings, 5) Document opportunities, 6) Review analytics and export.'
                )}
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button class="btn btn-secondary" onclick="openQuickReference()">
                    <i class="fas fa-file-alt"></i> Quick Reference PDF
                </button>
                <button class="btn btn-primary" onclick="closeModal()">
                    <i class="fas fa-check"></i> Got It
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent, 'large');
}

/**
 * Switch help tab
 */
function switchHelpTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.modal-tab').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(`help-tab-${tabName}`);
    if (targetContent) {
        targetContent.style.display = 'block';
        targetContent.classList.add('active');
    }
}

/**
 * Render state explanation card
 */
function renderStateExplanation(state, icon, color, description) {
    return `
        <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${color};">
            <i class="fas fa-${icon}" style="color: ${color}; font-size: 20px; margin-top: 2px;"></i>
            <div>
                <strong style="color: #111827; display: block; margin-bottom: 4px;">${state}</strong>
                <span style="color: #6b7280; font-size: 13px;">${description}</span>
            </div>
        </div>
    `;
}

/**
 * Render feature section
 */
function renderFeatureSection(title, icon, features) {
    return `
        <div style="margin-bottom: 24px;">
            <h5 style="color: #374151; margin-bottom: 12px;">
                <i class="fas fa-${icon}" style="color: #10b981; margin-right: 8px;"></i>${title}
            </h5>
            <ul style="color: #6b7280; line-height: 1.8; margin-left: 20px;">
                ${features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
    `;
}

/**
 * Render FAQ item
 */
function renderFAQItem(question, answer) {
    return `
        <div style="margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <h5 style="color: #111827; margin-bottom: 8px;">
                <i class="fas fa-question-circle" style="color: #3b82f6; margin-right: 8px;"></i>${question}
            </h5>
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">${answer}</p>
        </div>
    `;
}

/**
 * Open quick reference guide (placeholder)
 */
function openQuickReference() {
    showNotification('Quick Reference guide will be available in the documentation package', 'info');
}

// ═══════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Initialize keyboard shortcuts for WhiteSpot Heatmap
 */
function initializeWhiteSpotKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when on WhiteSpot tab
        const activeTab = document.querySelector('.section-view.active');
        if (!activeTab || activeTab.id !== 'view-whitespace') return;
        
        // Ctrl+H: Toggle help
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            showWhiteSpotHelp();
        }
        
        // Ctrl+F: Focus search filter
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('filter-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl+A: Open analytics dashboard
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            const heatmaps = engagementManager.getEntities('whiteSpotHeatmaps');
            if (heatmaps && heatmaps.length > 0 && typeof showAnalyticsDashboard === 'function') {
                const currentHeatmap = heatmaps.find(h => h.customerId === window.currentWhiteSpotCustomer) || heatmaps[0];
                if (currentHeatmap) {
                    showAnalyticsDashboard(currentHeatmap.id);
                }
            }
        }
        
        // Ctrl+E: Export to CSV
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            const heatmaps = engagementManager.getEntities('whiteSpotHeatmaps');
            if (heatmaps && heatmaps.length > 0 && typeof exportHeatmapCSV === 'function') {
                const currentHeatmap = heatmaps.find(h => h.customerId === window.currentWhiteSpotCustomer) || heatmaps[0];
                if (currentHeatmap) {
                    exportHeatmapCSV(currentHeatmap.id);
                }
            }
        }
        
        // Ctrl+P: Print heatmap
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            const heatmaps = engagementManager.getEntities('whiteSpotHeatmaps');
            if (heatmaps && heatmaps.length > 0 && typeof printHeatmap === 'function') {
                const currentHeatmap = heatmaps.find(h => h.customerId === window.currentWhiteSpotCustomer) || heatmaps[0];
                if (currentHeatmap) {
                    printHeatmap(currentHeatmap.id);
                }
            }
        }
        
        // Esc: Close modal
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal && typeof closeModal === 'function') {
                closeModal();
            }
        }
    });
}

// Initialize shortcuts when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhiteSpotKeyboardShortcuts);
} else {
    initializeWhiteSpotKeyboardShortcuts();
}

// ═══════════════════════════════════════════════════════════════════
// INLINE TOOLTIPS
// ═══════════════════════════════════════════════════════════════════

/**
 * Initialize tooltips for WhiteSpot Heatmap elements
 * Uses browser native title attributes enhanced with custom styling
 */
function initializeWhiteSpotTooltips() {
    // Tooltips are handled via title attributes on buttons and UI elements
    // This function is a placeholder for future tooltip library integration
    console.log('WhiteSpot tooltips initialized via title attributes');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhiteSpotTooltips);
} else {
    initializeWhiteSpotTooltips();
}
