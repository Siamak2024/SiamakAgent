/**
 * target_services_bridge.js
 * V2.0 E2E Integration: WhiteSpot → Target EA Service Bridge
 * 
 * Connects WhiteSpot service selection to Target EA architecture planning
 * Provides service visualization, AI categorization, and architecture linking
 * 
 * @version 2.0
 * @date 2026-05-09
 */

// ═══════════════════════════════════════════════════════════════════
// TARGET SERVICES VIEW RENDERING
// ═══════════════════════════════════════════════════════════════════

/**
 * Render selected services in Target EA tab
 * Groups services by L1 category and displays with visual badges
 */
function renderTargetServices() {
    const container = document.getElementById('target-services-section');
    
    if (!container) {
        console.error('❌ Target services container not found');
        return;
    }
    
    if (!window.currentEngagement) {
        console.log('⚠️ No current engagement loaded');
        container.innerHTML = '';
        return;
    }
    
    // Get selected services from WhiteSpot
    const selectedServices = window.currentEngagement.selectedServices || [];
    const selectedServicesData = window.currentEngagement.selectedServicesData || [];
    
    console.log('🔍 renderTargetServices called:', {
        selectedServicesCount: selectedServices.length,
        selectedServicesDataCount: selectedServicesData.length,
        sampleService: selectedServicesData[0]
    });
    
    if (selectedServices.length === 0) {
        console.log('ℹ️ No services selected - showing empty state');
        container.innerHTML = `
            <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 32px; text-align: center;">
                <div style="font-size: 48px; color: #d1d5db; margin-bottom: 12px;">
                    <i class="fas fa-box-open"></i>
                </div>
                <h4 style="font-size: 16px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">No Services Selected</h4>
                <p style="font-size: 14px; color: #9ca3af; margin-bottom: 16px;">Select services from WhiteSpot Heatmap tab to start building your target architecture</p>
                <button class="btn btn-secondary" onclick="switchTab('whitespace', document.querySelector('[data-tab=whitespace]'))">
                    <i class="fas fa-th"></i> Go to WhiteSpot Heatmap
                </button>
            </div>
        `;
        return;
    }
    
    // Group services by L1 category
    const servicesByL1 = groupServicesByL1(selectedServicesData);
    console.log('📊 Services grouped by L1:', Object.keys(servicesByL1));
    
    // Get service categories if they exist
    const serviceCategories = window.currentEngagement.serviceCategories || [];
    
    // Build service overview header
    let html = `
        <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: white;">
                        <i class="fas fa-cubes" style="margin-right: 8px;"></i>
                        Selected Service Portfolio
                    </h3>
                    <p style="font-size: 14px; opacity: 0.9; margin-bottom: 16px;">
                        ${selectedServices.length} services selected from WhiteSpot Heatmap
                    </p>
                    <div style="display: flex; gap: 16px; font-size: 13px;">
                        <div>
                            <i class="fas fa-layer-group" style="margin-right: 6px;"></i>
                            ${Object.keys(servicesByL1).length} Service Areas
                        </div>
                        <div>
                            <i class="fas fa-tag" style="margin-right: 6px;"></i>
                            ${serviceCategories.length} Categories
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="openAISuggestCategories()" style="background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3);" title="Let AI suggest categorization themes">
                        <i class="fas fa-magic"></i> AI Suggest Categories
                    </button>
                    <button class="btn" onclick="openServiceCategoryManager()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4);" title="Manage service categories">
                        <i class="fas fa-layer-group"></i> Manage Categories
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Display service categories if they exist
    if (serviceCategories.length > 0) {
        html += renderServiceCategories(serviceCategories);
    }
    
    // Display services grouped by L1
    html += '<div style="display: grid; gap: 24px;">';
    
    for (const [l1Name, services] of Object.entries(servicesByL1)) {
        html += renderL1ServiceGroup(l1Name, services);
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    console.log('✅ Target services rendered successfully');
}

/**
 * Group services by L1 parent category
 */
function groupServicesByL1(servicesData) {
    const grouped = {};
    
    servicesData.forEach(service => {
        const l1Category = service.l1Category || service.l1ParentName || 'Other Services';
        if (!grouped[l1Category]) {
            grouped[l1Category] = [];
        }
        grouped[l1Category].push(service);
    });
    
    return grouped;
}

/**
 * Render service categories section
 */
function renderServiceCategories(categories) {
    const categoryColors = {
        'app-modernization': '#3b82f6',
        'ai-automation': '#8b5cf6',
        'cloud-migration': '#06b6d4',
        'data-platform': '#10b981',
        'integration': '#f59e0b',
        'cybersecurity': '#ef4444',
        'custom': '#6b7280'
    };
    
    let html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 15px; font-weight: 600; color: #374151; margin: 0;">
                    <i class="fas fa-tags" style="color: #10b981; margin-right: 8px;"></i>
                    Service Categories
                </h4>
                <button class="btn btn-sm btn-ghost" onclick="openServiceCategoryManager()">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
    `;
    
    categories.forEach(cat => {
        const color = categoryColors[cat.theme] || categoryColors['custom'];
        const aiIcon = cat.aiSuggested ? '<i class="fas fa-magic" style="font-size: 10px; margin-left: 4px;" title="AI Suggested"></i>' : '';
        
        html += `
            <div style="background: ${color}15; border: 1px solid ${color}40; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
                <i class="${cat.icon || 'fas fa-folder'}" style="color: ${color}; font-size: 16px;"></i>
                <div>
                    <div style="font-size: 13px; font-weight: 600; color: ${color};">
                        ${cat.name} ${aiIcon}
                    </div>
                    <div style="font-size: 11px; color: #6b7280;">
                        ${cat.linkedServices.length} services
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Render L1 service group section
 */
function renderL1ServiceGroup(l1Name, services) {
    const l1Icons = {
        'Consulting & Project Services': 'fa-users',
        'Managed Services': 'fa-server',
        'Platform Services': 'fa-cloud'
    };
    
    const l1Colors = {
        'Consulting & Project Services': '#3b82f6',
        'Managed Services': '#10b981',
        'Platform Services': '#8b5cf6'
    };
    
    const icon = l1Icons[l1Name] || 'fa-box';
    const color = l1Colors[l1Name] || '#6b7280';
    
    let html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6;">
                <div style="width: 40px; height: 40px; background: ${color}15; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${icon}" style="color: ${color}; font-size: 18px;"></i>
                </div>
                <div>
                    <h4 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0;">${l1Name}</h4>
                    <p style="font-size: 12px; color: #6b7280; margin: 0;">${services.length} services</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
    `;
    
    services.forEach(service => {
        html += renderServiceCard(service);
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Render individual service card
 */
function renderServiceCard(service) {
    // Check if service is linked to any architecture
    const linkedArchs = getServiceLinkedArchitectures(service.id);
    const isLinked = linkedArchs.length > 0;
    
    const linkedBadge = isLinked ? 
        `<span class="badge badge-active" style="font-size: 10px;" title="Linked to ${linkedArchs.length} architecture theme(s)">
            <i class="fas fa-link"></i> ${linkedArchs.length}
        </span>` : '';
    
    return `
        <div class="service-card-mini" data-service-id="${service.id}" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s;" onclick="openServiceLinkingModal('${service.id}')">
            <div style="display: flex; justify-content: between; align-items: start; gap: 8px; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: 600; color: #111827; line-height: 1.3;">
                        ${service.name}
                    </div>
                </div>
                ${linkedBadge}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
                ID: ${service.id}
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE-TO-ARCHITECTURE MAPPING
// ═══════════════════════════════════════════════════════════════════

/**
 * Get architecture themes linked to a service
 */
function getServiceLinkedArchitectures(serviceId) {
    if (!window.currentEngagement) return [];
    
    const architectures = window.engagementManager?.getEntities('architectureViews') || [];
    return architectures.filter(arch => 
        arch.linkedServices && arch.linkedServices.includes(serviceId)
    );
}

/**
 * Open modal to link service to architecture themes
 */
function openServiceLinkingModal(serviceId) {
    // Get service data
    const service = (window.currentEngagement.selectedServicesData || []).find(s => s.id === serviceId);
    if (!service) return;
    
    // Get all architecture themes
    const architectures = window.engagementManager?.getEntities('architectureThemes') || [];
    
    if (architectures.length === 0) {
        showToast('No Architecture Themes', 'Create an architecture theme first to link services', 'warning');
        return;
    }
    
    // Count currently linked architectures
    const currentLinks = architectures.filter(arch => 
        arch.linkedServices && arch.linkedServices.includes(serviceId)
    ).length;
    
    // Build modal content with improved UX
    let modalHtml = `
        <div class="modal-overlay" id="serviceLinkingModal" style="z-index: 10000; background: rgba(0,0,0,0.6);" onclick="if(event.target === this) closeServiceLinkingModal()">
            <div class="modal-box" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header" style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
                    <div class="modal-title" style="color: white;">
                        <i class="fas fa-link" style="margin-right: 8px;"></i>
                        Link Service to Architecture Themes
                    </div>
                    <button class="modal-close" onclick="closeServiceLinkingModal()" style="color: white; opacity: 0.9;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body" style="padding: 24px;">
                    <!-- Service Context Card -->
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <div style="background: #10b981; color: white; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-cube" style="font-size: 18px;"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #059669; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                    Selected Service
                                </div>
                                <div style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 4px;">
                                    ${service.name}
                                </div>
                                <div style="font-size: 12px; color: #059669;">
                                    ${service.l1Category || service.l1ParentName || 'Service'} • ${service.id}
                                </div>
                                ${currentLinks > 0 ? `
                                    <div style="margin-top: 8px; padding: 6px 10px; background: rgba(16, 185, 129, 0.1); border-radius: 6px; display: inline-block;">
                                        <i class="fas fa-check-circle" style="color: #10b981; margin-right: 6px;"></i>
                                        <span style="font-size: 12px; color: #065f46; font-weight: 600;">Currently linked to ${currentLinks} architecture${currentLinks !== 1 ? 's' : ''}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Instructions -->
                    <div style="background: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
                        <div style="font-size: 13px; color: #1e40af;">
                            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                            Select which architecture themes enable or implement this service
                        </div>
                    </div>
                    
                    <!-- Architecture List -->
                    <label style="display: block; font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 12px;">
                        Available Architecture Themes (${architectures.length})
                    </label>
                    
                    <div style="max-height: 300px; overflow-y: auto; border: 2px solid #e5e7eb; border-radius: 12px; padding: 8px; background: #fafafa;">
    `;
    
    architectures.forEach(arch => {
        const isLinked = arch.linkedServices && arch.linkedServices.includes(serviceId);
        const typeColor = arch.type === 'target' ? '#10b981' : arch.type === 'as-is' ? '#6b7280' : '#f59e0b';
        const typeIcon = arch.type === 'target' ? 'fa-bullseye' : arch.type === 'as-is' ? 'fa-archive' : 'fa-route';
        
        modalHtml += `
            <label style="display: flex; align-items: center; padding: 14px; border-radius: 10px; cursor: pointer; background: white; margin-bottom: 8px; border: 2px solid ${isLinked ? '#10b981' : '#e5e7eb'}; transition: all 0.2s;" 
                   onmouseover="if(!this.querySelector('input').checked) this.style.borderColor='#d1d5db'; this.style.background='#f9fafb';" 
                   onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='#e5e7eb'; this.style.background='white';">
                <input type="checkbox" 
                       id="link-arch-${arch.id}" 
                       ${isLinked ? 'checked' : ''} 
                       onchange="this.closest('label').style.borderColor = this.checked ? '#10b981' : '#e5e7eb';"
                       style="margin-right: 14px; width: 20px; height: 20px; cursor: pointer; accent-color: #10b981;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <i class="fas ${typeIcon}" style="color: ${typeColor}; font-size: 14px;"></i>
                        <span style="font-size: 15px; font-weight: 700; color: #111827;">${arch.name}</span>
                        ${isLinked ? '<span class="badge badge-active" style="font-size: 10px; margin-left: 4px;"><i class="fas fa-check"></i> LINKED</span>' : ''}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-left: 22px;">
                        ${arch.type.toUpperCase()} ${arch.diagramType ? '• ' + arch.diagramType.replace(/-/g, ' ') : ''}
                    </div>
                    ${arch.description ? `
                        <div style="font-size: 11px; color: #9ca3af; margin-left: 22px; margin-top: 4px; font-style: italic;">
                            ${arch.description.substring(0, 80)}${arch.description.length > 80 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
            </label>
        `;
    });
    
    modalHtml += `
                    </div>
                </div>
                
                <div class="modal-footer" style="background: #f9fafb; padding: 16px 24px; border-radius: 0 0 12px 12px; display: flex; justify-content: space-between; align-items: center;">
                    <button class="btn btn-ghost" onclick="closeServiceLinkingModal()" style="padding: 10px 20px;">
                        <i class="fas fa-times" style="margin-right: 6px;"></i> Cancel
                    </button>
                    <button class="btn btn-primary" onclick="saveServiceArchitectureLinks('${serviceId}')" style="padding: 10px 24px; background: #10b981;">
                        <i class="fas fa-save" style="margin-right: 6px;"></i> Save Links
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    const existingModal = document.getElementById('serviceLinkingModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Close service linking modal
 */
function closeServiceLinkingModal() {
    const modal = document.getElementById('serviceLinkingModal');
    if (modal) modal.remove();
}

/**
 * Save service-to-architecture links
 */
function saveServiceArchitectureLinks(serviceId) {
    const architectures = window.engagementManager?.getEntities('architectureViews') || [];
    const service = (window.currentEngagement.selectedServicesData || []).find(s => s.id === serviceId);
    
    let linksAdded = 0;
    let linksRemoved = 0;
    
    architectures.forEach(arch => {
        const checkbox = document.getElementById(`link-arch-${arch.id}`);
        if (!checkbox) return;
        
        if (!arch.linkedServices) {
            arch.linkedServices = [];
        }
        
        const isCurrentlyLinked = arch.linkedServices.includes(serviceId);
        const shouldBeLinked = checkbox.checked;
        
        if (shouldBeLinked && !isCurrentlyLinked) {
            // Add link
            arch.linkedServices.push(serviceId);
            linksAdded++;
        } else if (!shouldBeLinked && isCurrentlyLinked) {
            // Remove link
            arch.linkedServices = arch.linkedServices.filter(id => id !== serviceId);
            linksRemoved++;
        }
        
        // Update entity
        window.engagementManager.updateEntity('architectureThemes', arch.id, arch);
    });
    
    // Update service-to-architecture mapping
    updateServiceToArchitectureMap();
    
    // Refresh current engagement
    window.currentEngagement = window.engagementManager.getCurrentEngagement();
    
    // Save engagement
    window.engagementManager.saveCurrentEngagement();
    
    console.log(`✅ Service links saved: +${linksAdded} added, -${linksRemoved} removed`);
    
    // Close modal and refresh views
    closeServiceLinkingModal();
    renderTargetServices();
    renderTarget(); // Refresh architecture theme to show linked services
    
    // Build feedback message
    const totalLinks = architectures.filter(arch => 
        arch.linkedServices && arch.linkedServices.includes(serviceId)
    ).length;
    
    let message = '';
    if (linksAdded > 0 && linksRemoved > 0) {
        message = `Updated links for "${service?.name || 'service'}": +${linksAdded} added, -${linksRemoved} removed`;
    } else if (linksAdded > 0) {
        message = `Linked "${service?.name || 'service'}" to ${linksAdded} architecture${linksAdded !== 1 ? 's' : ''}`;
    } else if (linksRemoved > 0) {
        message = `Removed ${linksRemoved} link${linksRemoved !== 1 ? 's' : ''} from "${service?.name || 'service'}"`;
    } else {
        message = `No changes made to "${service?.name || 'service'}"`;
    }
    
    showToast(
        totalLinks > 0 ? `Linked to ${totalLinks} Architecture${totalLinks !== 1 ? 's' : ''}` : 'Links Updated', 
        message, 
        'success'
    );
}

/**
 * Update service-to-architecture mapping in engagement model
 */
function updateServiceToArchitectureMap() {
    if (!window.currentEngagement) return;
    
    const architectures = window.engagementManager?.getEntities('architectureViews') || [];
    const serviceToArchMap = {};
    
    architectures.forEach(arch => {
        (arch.linkedServices || []).forEach(serviceId => {
            if (!serviceToArchMap[serviceId]) {
                serviceToArchMap[serviceId] = [];
            }
            if (!serviceToArchMap[serviceId].includes(arch.id)) {
                serviceToArchMap[serviceId].push(arch.id);
            }
        });
    });
    
    // Store mapping in engagement model for reference
    if (window.currentEngagement) {
        window.currentEngagement.serviceToArchitectureMap = serviceToArchMap;
    }
}

// ═══════════════════════════════════════════════════════════════════
// AI CATEGORY SUGGESTION (Phase 2 Step 7)
// ═══════════════════════════════════════════════════════════════════

/**
 * Open AI-powered service category suggestion modal
 * Analyzes selected services and suggests categorization themes
 */
async function openAISuggestCategories() {
    if (!window.currentEngagement) {
        showToast('No Engagement', 'Load or create an engagement first', 'warning');
        return;
    }
    
    const selectedServices = window.currentEngagement.selectedServicesData || [];
    
    if (selectedServices.length === 0) {
        showToast('No Services Selected', 'Select services from WhiteSpot Heatmap first', 'warning');
        return;
    }
    
    // Show loading modal
    showAISuggestionLoadingModal();
    
    try {
        // Build prompt context
        const promptContext = buildAISuggestionPromptContext();
        
        // Load prompt template
        const promptTemplate = await loadPromptTemplate('service_category_suggestion_prompt.txt');
        
        // Substitute context into prompt
        const finalPrompt = substitutePromptTemplate(promptTemplate, promptContext);
        
        console.log('🤖 Calling AI for category suggestions...', {
            servicesCount: selectedServices.length,
            promptLength: finalPrompt.length
        });
        
        // Call Azure OpenAI
        const response = await AzureOpenAIProxy.create(finalPrompt, {
            model: 'gpt-5.4',
            instructions: 'You are an expert Enterprise Architect. Analyze services and return ONLY valid JSON array as specified in the prompt. No additional text.',
            temperature: 0.4,
            timeout: 120000,
            response_format: { type: 'json_object' }
        });
        
        // Extract response text from various possible locations
        let responseText = '';
        
        // Try various response formats
        if (response.output_text) {
            responseText = response.output_text;
        } else if (response.output && Array.isArray(response.output) && response.output[0]?.content) {
            // Azure OpenAI Responses API format: response.output[0].content
            responseText = response.output[0].content;
        } else if (response.output && response.output.content) {
            // Alternative: response.output.content
            responseText = response.output.content;
        } else if (response.choices && response.choices[0]?.message?.content) {
            responseText = response.choices[0].message.content;
        } else if (response.content) {
            responseText = response.content;
        } else if (response.message?.content) {
            responseText = response.message.content;
        } else if (typeof response === 'string') {
            responseText = response;
        }
        
        console.log('✅ AI response received:', {
            responseKeys: Object.keys(response),
            hasOutputText: !!response.output_text,
            hasOutput: !!response.output,
            outputIsArray: Array.isArray(response.output),
            outputLength: response.output?.length,
            hasChoices: !!response.choices,
            hasContent: !!response.content,
            responseType: typeof response,
            extractedType: typeof responseText,
            textLength: typeof responseText === 'string' ? responseText?.length : JSON.stringify(responseText).length,
            preview: typeof responseText === 'string' ? responseText.substring(0, 300) : JSON.stringify(responseText).substring(0, 300),
            fullResponse: response // Log full response object for debugging
        });
        
        // Check if responseText is already an object (pre-parsed)
        if (typeof responseText === 'object' && responseText !== null) {
            console.log('⚠️ Response content is already parsed object, using directly');
            // responseText is already the parsed JSON object, use it as suggestions
            let suggestions;
            if (Array.isArray(responseText)) {
                suggestions = responseText;
            } else if (responseText.categories || responseText.suggestions) {
                suggestions = responseText.categories || responseText.suggestions;
            } else if (responseText.name && responseText.theme) {
                console.log('⚠️ AI returned single category object, wrapping in array');
                suggestions = [responseText];
            } else {
                suggestions = [];
            }
            
            if (!suggestions || suggestions.length === 0) {
                throw new Error('AI returned no category suggestions');
            }
            
            console.log('📊 AI suggested', suggestions.length, 'categories:', suggestions);
            closeAISuggestionLoadingModal();
            showAISuggestionResultsModal(suggestions);
            return;
        }
        
        if (!responseText || (typeof responseText === 'string' && responseText.trim() === '')) {
            console.error('❌ Empty response from AI. Response structure:', JSON.stringify(response, null, 2));
            throw new Error('AI returned empty response - check console for response structure');
        }
        
        // Check if JSON looks complete (basic sanity check)
        const openBraces = (responseText.match(/\{/g) || []).length;
        const closeBraces = (responseText.match(/\}/g) || []).length;
        const openBrackets = (responseText.match(/\[/g) || []).length;
        const closeBrackets = (responseText.match(/\]/g) || []).length;
        
        if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
            console.error('❌ JSON appears truncated:', {
                openBraces, closeBraces, openBrackets, closeBrackets,
                text: responseText
            });
            throw new Error('AI response JSON appears truncated or malformed');
        }
        
        // Parse AI response
        let suggestions;
        try {
            const parsed = JSON.parse(responseText);
            
            // Handle multiple response formats:
            if (Array.isArray(parsed)) {
                // Direct array: [{ name, theme, ... }, ...]
                suggestions = parsed;
            } else if (parsed.categories || parsed.suggestions) {
                // Wrapped object: { categories: [...] } or { suggestions: [...] }
                suggestions = parsed.categories || parsed.suggestions;
            } else if (parsed.name && parsed.theme) {
                // Single category object returned instead of array
                console.log('⚠️ AI returned single category object, wrapping in array');
                suggestions = [parsed];
            } else {
                // Unknown format
                suggestions = [];
            }
        } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError, responseText);
            throw new Error('AI returned invalid JSON format');
        }
        
        if (!suggestions || suggestions.length === 0) {
            throw new Error('AI returned no category suggestions');
        }
        
        console.log('📊 AI suggested', suggestions.length, 'categories:', suggestions);
        
        // Close loading modal and show results
        closeAISuggestionLoadingModal();
        showAISuggestionResultsModal(suggestions);
        
    } catch (error) {
        console.error('❌ AI suggestion error:', error);
        closeAISuggestionLoadingModal();
        showToast('AI Suggestion Failed', error.message || 'Failed to generate category suggestions', 'error');
    }
}

/**
 * Build context object for AI prompt substitution
 */
function buildAISuggestionPromptContext() {
    const engagement = window.currentEngagement;
    const selectedServices = engagement.selectedServicesData || [];
    const existingArchitectures = window.engagementManager?.getEntities('architectureThemes') || [];
    
    return {
        engagementName: engagement.name || 'Unnamed Engagement',
        customerName: engagement.customer?.name || 'Customer',
        industry: engagement.segment || engagement.industry || 'General',
        strategicIntent: engagement.strategicIntent || engagement.businessContext?.objectives?.[0] || 'Digital transformation',
        selectedServices: selectedServices.map(s => ({
            id: s.id,
            name: s.name,
            l1Category: s.l1Category || s.l1ParentName || 'Unknown',
            description: s.description || '',
            keywords: s.keywords || ''
        })),
        existingArchitectures: existingArchitectures.map(a => ({
            name: a.name,
            type: a.type,
            linkedServices: a.linkedServices || []
        }))
    };
}

/**
 * Load prompt template from file
 */
async function loadPromptTemplate(filename) {
    try {
        const response = await fetch(`ai_prompts/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load prompt template: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('❌ Failed to load prompt template:', error);
        throw new Error('Could not load AI prompt template');
    }
}

/**
 * Substitute context values into Handlebars-style template
 * Supports {{variable}} and {{#each array}}{{/each}} patterns
 */
function substitutePromptTemplate(template, context) {
    let result = template;
    
    // Simple variable substitution
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return context[key] !== undefined ? context[key] : match;
    });
    
    // Handle {{#each selectedServices}} loops
    result = result.replace(/\{\{#each selectedServices\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, loopContent) => {
        if (!context.selectedServices || context.selectedServices.length === 0) {
            return '(No services selected)';
        }
        return context.selectedServices.map(service => {
            let itemContent = loopContent;
            itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (m, prop) => service[prop] || '');
            itemContent = itemContent.replace(/\{\{#if this\.(\w+)\}\}(.*?)\{\{\/if\}\}/g, (m, prop, content) => {
                return service[prop] ? content.replace(/\{\{this\.(\w+)\}\}/g, (m2, p2) => service[p2] || '') : '';
            });
            return itemContent;
        }).join('');
    });
    
    // Handle {{#each existingArchitectures}} loops
    result = result.replace(/\{\{#each existingArchitectures\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, loopContent) => {
        if (!context.existingArchitectures || context.existingArchitectures.length === 0) {
            return '(No existing architecture themes)';
        }
        return context.existingArchitectures.map(arch => {
            let itemContent = loopContent;
            itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (m, prop) => {
                if (prop === 'linkedServices' && Array.isArray(arch[prop])) {
                    return arch[prop].length.toString();
                }
                return arch[prop] !== undefined ? arch[prop] : '';
            });
            return itemContent;
        }).join('');
    });
    
    return result;
}

/**
 * Show loading modal while AI processes
 */
function showAISuggestionLoadingModal() {
    const modal = document.createElement('div');
    modal.id = 'ai-suggestion-loading-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="font-size: 64px; color: #8b5cf6; margin-bottom: 24px;">
                <i class="fas fa-magic fa-spin"></i>
            </div>
            <h3 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 12px;">
                Analyzing Service Portfolio
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
                AI is analyzing selected services to suggest strategic categorization themes...
            </p>
            <div class="loading-bar" style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%); width: 60%; animation: loadingSlide 1.5s ease-in-out infinite;"></div>
            </div>
        </div>
        <style>
            @keyframes loadingSlide {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(250%); }
            }
        </style>
    `;
    document.body.appendChild(modal);
}

/**
 * Close AI loading modal
 */
function closeAISuggestionLoadingModal() {
    const modal = document.getElementById('ai-suggestion-loading-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Show AI suggestion results in interactive modal
 * @param {Array} suggestions - Array of category suggestion objects from AI
 */
function showAISuggestionResultsModal(suggestions) {
    const modal = document.createElement('div');
    modal.id = 'ai-suggestion-results-modal';
    modal.className = 'modal';
    
    // Build category cards HTML
    const categoriesHTML = suggestions.map((cat, index) => {
        const themeColors = {
            'app-modernization': '#3b82f6',
            'ai-automation': '#8b5cf6',
            'cloud-migration': '#06b6d4',
            'data-platform': '#10b981',
            'integration': '#f59e0b',
            'cybersecurity': '#ef4444',
            'custom': '#6b7280'
        };
        
        // Ensure theme exists and is valid
        const theme = cat.theme || 'custom';
        const color = cat.color || themeColors[theme] || '#6b7280';
        const icon = cat.icon || 'fa-cube';
        
        return `
            <div class="ai-suggestion-card" data-index="${index}" style="
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                cursor: pointer;
                transition: all 0.2s;
                background: white;
            " onclick="toggleCategorySuggestion(${index})">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 10px; background: ${color}15; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${icon}" style="font-size: 24px; color: ${color};"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px;">${cat.name || 'Unnamed Category'}</h4>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <span class="badge" style="background: ${color}; color: white; font-size: 11px; padding: 2px 8px;">${theme.toUpperCase().replace('-', ' ')}</span>
                                <span style="font-size: 12px; color: #6b7280;">
                                    <i class="fas fa-layer-group" style="margin-right: 4px;"></i>
                                    ${cat.linkedServices?.length || 0} services
                                </span>
                            </div>
                        </div>
                    </div>
                    <input type="checkbox" class="category-suggestion-checkbox" checked style="width: 20px; height: 20px; cursor: pointer; accent-color: ${color};">
                </div>
                <p style="font-size: 13px; color: #4b5563; margin-bottom: 12px; line-height: 1.5;">${cat.description}</p>
                ${cat.strategicValue ? `
                    <div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
                        <div style="font-size: 11px; font-weight: 600; color: #059669; margin-bottom: 4px; text-transform: uppercase;">Strategic Value</div>
                        <div style="font-size: 12px; color: #047857;">${cat.strategicValue}</div>
                    </div>
                ` : ''}
                ${cat.aiReasoning ? `
                    <details style="margin-top: 12px;">
                        <summary style="font-size: 12px; color: #6b7280; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-lightbulb" style="margin-right: 6px; color: #8b5cf6;"></i>
                            AI Reasoning
                        </summary>
                        <p style="font-size: 12px; color: #6b7280; margin-top: 8px; padding-left: 22px; line-height: 1.5;">${cat.aiReasoning}</p>
                    </details>
                ` : ''}
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div style="position: sticky; top: 0; background: white; z-index: 10; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <h3 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                            <i class="fas fa-magic" style="color: #8b5cf6; margin-right: 8px;"></i>
                            AI Suggested Categories
                        </h3>
                        <p style="font-size: 14px; color: #6b7280;">
                            Review and select categories to add to your engagement. You can customize them later.
                        </p>
                    </div>
                    <button onclick="closeAISuggestionResultsModal()" style="background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; padding: 0; width: 32px; height: 32px;">
                        ×
                    </button>
                </div>
                <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 20px;"></i>
                    <div style="font-size: 13px; color: #1e40af;">
                        AI analyzed <strong>${window.currentEngagement?.selectedServices?.length || 0} selected services</strong> and identified <strong>${suggestions.length} strategic themes</strong>. Select categories to add to your engagement.
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 24px;">
                ${categoriesHTML}
            </div>
            
            <div style="position: sticky; bottom: 0; background: white; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; color: #6b7280;">
                    <span id="selected-count">${suggestions.length}</span> of ${suggestions.length} categories selected
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-secondary" onclick="closeAISuggestionResultsModal()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="applySelectedCategories()">
                        <i class="fas fa-check"></i> Add Selected Categories
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store suggestions in global variable for later access
    window.aiCategorySuggestions = suggestions;
}

/**
 * Toggle category selection
 */
function toggleCategorySuggestion(index) {
    const card = document.querySelector(`.ai-suggestion-card[data-index="${index}"]`);
    const checkbox = card.querySelector('.category-suggestion-checkbox');
    checkbox.checked = !checkbox.checked;
    
    // Update visual state
    if (checkbox.checked) {
        card.style.border = '2px solid #10b981';
        card.style.background = '#f0fdf4';
    } else {
        card.style.border = '2px solid #e5e7eb';
        card.style.background = 'white';
    }
    
    // Update counter
    updateSelectedCategoriesCount();
}

/**
 * Update selected categories counter
 */
function updateSelectedCategoriesCount() {
    const checkboxes = document.querySelectorAll('.category-suggestion-checkbox');
    const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const counterEl = document.getElementById('selected-count');
    if (counterEl) {
        counterEl.textContent = selectedCount;
    }
}

/**
 * Apply selected categories to engagement
 */
function applySelectedCategories() {
    const checkboxes = document.querySelectorAll('.category-suggestion-checkbox');
    const selectedIndices = Array.from(checkboxes)
        .map((cb, index) => cb.checked ? index : -1)
        .filter(i => i >= 0);
    
    if (selectedIndices.length === 0) {
        showToast('No Selection', 'Please select at least one category', 'warning');
        return;
    }
    
    const suggestions = window.aiCategorySuggestions || [];
    const selectedCategories = selectedIndices.map(i => suggestions[i]);
    
    console.log('✅ Applying', selectedCategories.length, 'categories to engagement');
    
    // Add categories to engagement via EngagementManager
    let addedCount = 0;
    selectedCategories.forEach(cat => {
        // Ensure required fields exist with defaults
        const categoryData = {
            name: cat.name || 'Unnamed Category',
            theme: cat.theme || 'custom',
            description: cat.description || '',
            linkedServices: cat.linkedServices || [],
            linkedArchitectures: [],
            linkedInitiatives: [],
            color: cat.color || '#6b7280',
            icon: cat.icon || 'fa-cube',
            aiSuggested: true,
            aiReasoning: cat.aiReasoning || '',
            strategicValue: cat.strategicValue || ''
        };
        
        try {
            window.engagementManager.addEntity('serviceCategories', categoryData);
            addedCount++;
            console.log('✅ Added category:', categoryData.name);
        } catch (error) {
            console.error('❌ Failed to add category:', cat.name, error);
        }
    });
    
    // Update window.currentEngagement
    window.currentEngagement = window.engagementManager.getCurrentEngagement();
    
    // Close modal
    closeAISuggestionResultsModal();
    
    // Refresh Target EA view
    renderTargetServices();
    
    // Show success message
    showToast(
        'Categories Added',
        `Successfully added ${addedCount} service ${addedCount === 1 ? 'category' : 'categories'} to your engagement`,
        'success'
    );
}

/**
 * Close AI suggestion results modal
 */
function closeAISuggestionResultsModal() {
    const modal = document.getElementById('ai-suggestion-results-modal');
    if (modal) {
        modal.remove();
    }
    window.aiCategorySuggestions = null;
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE CATEGORY MANAGER (Phase 2 Step 8)
// ═══════════════════════════════════════════════════════════════════

/**
 * Open service category management modal
 * Create, edit, delete, and manage service categories
 */
function openServiceCategoryManager() {
    if (!window.currentEngagement) {
        showToast('No Engagement', 'Load or create an engagement first', 'warning');
        return;
    }
    
    const categories = window.engagementManager?.getEntities('serviceCategories') || [];
    const selectedServices = window.currentEngagement.selectedServicesData || [];
    
    renderCategoryManagerModal(categories, selectedServices);
}

/**
 * Render the main category manager modal
 */
function renderCategoryManagerModal(categories, selectedServices) {
    const modal = document.createElement('div');
    modal.id = 'category-manager-modal';
    modal.className = 'modal';
    
    // Build category cards HTML
    const categoriesHTML = categories.length > 0 ? categories.map((cat, index) => {
        const themeColors = {
            'app-modernization': '#3b82f6',
            'ai-automation': '#8b5cf6',
            'cloud-migration': '#06b6d4',
            'data-platform': '#10b981',
            'integration': '#f59e0b',
            'cybersecurity': '#ef4444',
            'custom': '#6b7280'
        };
        const color = cat.color || themeColors[cat.theme] || '#6b7280';
        const icon = cat.icon || 'fa-cube';
        const linkedServicesCount = (cat.linkedServices || []).length;
        const linkedArchitecturesCount = (cat.linkedArchitectures || []).length;
        
        return `
            <div class="category-card" style="
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                background: white;
                transition: all 0.2s;
            " onmouseenter="this.style.borderColor='${color}'; this.style.boxShadow='0 4px 12px ${color}20';" 
               onmouseleave="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                        <div style="width: 56px; height: 56px; border-radius: 12px; background: ${color}15; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas ${icon}" style="font-size: 28px; color: ${color};"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <h4 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">${cat.name}</h4>
                                ${cat.aiSuggested ? '<span class="badge" style="background: #8b5cf6; color: white; font-size: 10px; padding: 2px 6px;"><i class="fas fa-magic" style="margin-right: 3px;"></i>AI</span>' : ''}
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
                                <span class="badge" style="background: ${color}; color: white; font-size: 11px; padding: 3px 10px;">${cat.theme.toUpperCase().replace('-', ' ')}</span>
                                <span style="font-size: 13px; color: #6b7280;">
                                    <i class="fas fa-layer-group" style="margin-right: 4px;"></i>
                                    ${linkedServicesCount} service${linkedServicesCount !== 1 ? 's' : ''}
                                </span>
                                <span style="font-size: 13px; color: #6b7280;">
                                    <i class="fas fa-sitemap" style="margin-right: 4px;"></i>
                                    ${linkedArchitecturesCount} architecture${linkedArchitecturesCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5;">${cat.description || 'No description'}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-left: 16px;">
                        <button class="btn btn-ghost" onclick="editCategory('${cat.id}')" title="Edit Category" style="padding: 8px 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-ghost" onclick="deleteCategory('${cat.id}')" title="Delete Category" style="padding: 8px 12px; color: #ef4444;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('') : `
        <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 48px; text-align: center;">
            <div style="font-size: 48px; color: #d1d5db; margin-bottom: 16px;">
                <i class="fas fa-layer-group"></i>
            </div>
            <h4 style="font-size: 16px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">No Categories Yet</h4>
            <p style="font-size: 14px; color: #9ca3af; margin-bottom: 16px;">Create categories to organize your service portfolio into strategic themes</p>
            <button class="btn btn-primary" onclick="openCategoryForm(null)">
                <i class="fas fa-plus"></i> Create First Category
            </button>
        </div>
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
            <div style="position: sticky; top: 0; background: white; z-index: 10; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <h3 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                            <i class="fas fa-layer-group" style="color: #10b981; margin-right: 8px;"></i>
                            Service Category Manager
                        </h3>
                        <p style="font-size: 14px; color: #6b7280;">
                            Organize services into strategic transformation themes and architecture categories
                        </p>
                    </div>
                    <button onclick="closeCategoryManagerModal()" style="background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; padding: 0; width: 32px; height: 32px;">
                        ×
                    </button>
                </div>
                ${selectedServices.length > 0 ? `
                    <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 18px;"></i>
                        <div style="font-size: 13px; color: #1e40af;">
                            <strong>${selectedServices.length} services</strong> available to categorize • <strong>${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}</strong> defined
                        </div>
                    </div>
                ` : `
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 18px;"></i>
                        <div style="font-size: 13px; color: #92400e;">
                            No services selected. Go to <strong>WhiteSpot Heatmap</strong> tab to select services first.
                        </div>
                    </div>
                `}
            </div>
            
            <div id="category-list-container">
                ${categoriesHTML}
            </div>
            
            ${categories.length > 0 ? `
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button class="btn btn-primary" onclick="openCategoryForm(null)" style="width: 100%;">
                        <i class="fas fa-plus"></i> Add New Category
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Open category create/edit form
 */
function openCategoryForm(categoryId = null) {
    const isEdit = categoryId !== null;
    const category = isEdit ? window.engagementManager.getEntity('serviceCategories', categoryId) : null;
    const selectedServices = window.currentEngagement.selectedServicesData || [];
    
    // Theme definitions
    const themes = [
        { value: 'app-modernization', label: 'Application Modernization', color: '#3b82f6', icon: 'fa-rocket' },
        { value: 'ai-automation', label: 'AI & Automation', color: '#8b5cf6', icon: 'fa-robot' },
        { value: 'cloud-migration', label: 'Cloud Migration', color: '#06b6d4', icon: 'fa-cloud' },
        { value: 'data-platform', label: 'Data Platform', color: '#10b981', icon: 'fa-database' },
        { value: 'integration', label: 'Integration', color: '#f59e0b', icon: 'fa-exchange-alt' },
        { value: 'cybersecurity', label: 'Cybersecurity', color: '#ef4444', icon: 'fa-shield-alt' },
        { value: 'custom', label: 'Custom Theme', color: '#6b7280', icon: 'fa-cube' }
    ];
    
    const currentTheme = category?.theme || 'app-modernization';
    const currentThemeData = themes.find(t => t.value === currentTheme) || themes[0];
    
    // Group services by L1
    const servicesByL1 = {};
    selectedServices.forEach(service => {
        const l1 = service.l1Category || service.l1ParentName || 'Other';
        if (!servicesByL1[l1]) {
            servicesByL1[l1] = [];
        }
        servicesByL1[l1].push(service);
    });
    
    const linkedServiceIds = category?.linkedServices || [];
    
    const modal = document.createElement('div');
    modal.id = 'category-form-modal';
    modal.className = 'modal';
    modal.style.zIndex = '10001'; // Above category manager modal
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                    <i class="fas ${isEdit ? 'fa-edit' : 'fa-plus'}" style="margin-right: 8px;"></i>
                    ${isEdit ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p style="font-size: 14px; color: #6b7280;">
                    ${isEdit ? 'Update category details and linked services' : 'Define a new strategic category for your service portfolio'}
                </p>
            </div>
            
            <form id="category-form" onsubmit="saveCategoryForm(event, ${isEdit ? `'${categoryId}'` : 'null'})">
                <!-- Category Name -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        Category Name *
                    </label>
                    <input 
                        type="text" 
                        id="category-name" 
                        value="${category?.name || ''}" 
                        placeholder="e.g., AI-Powered Automation Platform"
                        required
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;"
                    >
                </div>
                
                <!-- Theme Selection -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        Theme Type *
                    </label>
                    <select 
                        id="category-theme" 
                        onchange="updateThemePreview()"
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;"
                    >
                        ${themes.map(t => `
                            <option value="${t.value}" ${t.value === currentTheme ? 'selected' : ''}>
                                ${t.label}
                            </option>
                        `).join('')}
                    </select>
                    <div id="theme-preview" style="margin-top: 12px; padding: 12px; background: ${currentThemeData.color}10; border: 1px solid ${currentThemeData.color}40; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: ${currentThemeData.color}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${currentThemeData.icon}" style="font-size: 20px; color: white;"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; font-weight: 600; color: #111827;">${currentThemeData.label}</div>
                            <div style="font-size: 12px; color: #6b7280;">Theme color: ${currentThemeData.color}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Description -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        Description
                    </label>
                    <textarea 
                        id="category-description" 
                        rows="3"
                        placeholder="Describe the strategic purpose and value of this category..."
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical;"
                    >${category?.description || ''}</textarea>
                </div>
                
                <!-- Linked Services -->
                ${selectedServices.length > 0 ? `
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            Linked Services
                            <span style="font-weight: 400; color: #6b7280; font-size: 13px;">(Select services that belong to this category)</span>
                        </label>
                        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px;">
                            ${Object.entries(servicesByL1).map(([l1, services]) => `
                                <div style="margin-bottom: 16px;">
                                    <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;">
                                        ${l1}
                                    </div>
                                    ${services.map(service => `
                                        <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 6px; transition: background 0.2s;" 
                                               onmouseenter="this.style.background='#f3f4f6'" 
                                               onmouseleave="this.style.background='transparent'">
                                            <input 
                                                type="checkbox" 
                                                class="category-service-checkbox" 
                                                value="${service.id}"
                                                ${linkedServiceIds.includes(service.id) ? 'checked' : ''}
                                                style="width: 16px; height: 16px; cursor: pointer; accent-color: ${currentThemeData.color};"
                                            >
                                            <span style="font-size: 13px; color: #374151; flex: 1;">${service.name}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <button type="button" class="btn btn-secondary" onclick="closeCategoryFormModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas ${isEdit ? 'fa-save' : 'fa-plus'}"></i>
                        ${isEdit ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Update theme preview in category form
 */
function updateThemePreview() {
    const themeSelect = document.getElementById('category-theme');
    const themeValue = themeSelect.value;
    
    const themes = {
        'app-modernization': { label: 'Application Modernization', color: '#3b82f6', icon: 'fa-rocket' },
        'ai-automation': { label: 'AI & Automation', color: '#8b5cf6', icon: 'fa-robot' },
        'cloud-migration': { label: 'Cloud Migration', color: '#06b6d4', icon: 'fa-cloud' },
        'data-platform': { label: 'Data Platform', color: '#10b981', icon: 'fa-database' },
        'integration': { label: 'Integration', color: '#f59e0b', icon: 'fa-exchange-alt' },
        'cybersecurity': { label: 'Cybersecurity', color: '#ef4444', icon: 'fa-shield-alt' },
        'custom': { label: 'Custom Theme', color: '#6b7280', icon: 'fa-cube' }
    };
    
    const theme = themes[themeValue];
    const preview = document.getElementById('theme-preview');
    
    preview.innerHTML = `
        <div style="width: 40px; height: 40px; border-radius: 8px; background: ${theme.color}; display: flex; align-items: center; justify-content: center;">
            <i class="fas ${theme.icon}" style="font-size: 20px; color: white;"></i>
        </div>
        <div>
            <div style="font-size: 13px; font-weight: 600; color: #111827;">${theme.label}</div>
            <div style="font-size: 12px; color: #6b7280;">Theme color: ${theme.color}</div>
        </div>
    `;
    preview.style.background = `${theme.color}10`;
    preview.style.borderColor = `${theme.color}40`;
    
    // Update checkbox accent colors
    const checkboxes = document.querySelectorAll('.category-service-checkbox');
    checkboxes.forEach(cb => {
        cb.style.accentColor = theme.color;
    });
}

/**
 * Save category form (create or update)
 */
function saveCategoryForm(event, categoryId) {
    event.preventDefault();
    
    const name = document.getElementById('category-name').value.trim();
    const theme = document.getElementById('category-theme').value;
    const description = document.getElementById('category-description').value.trim();
    
    // Get selected services
    const checkboxes = document.querySelectorAll('.category-service-checkbox:checked');
    const linkedServices = Array.from(checkboxes).map(cb => cb.value);
    
    // Get theme data
    const themes = {
        'app-modernization': { color: '#3b82f6', icon: 'fa-rocket' },
        'ai-automation': { color: '#8b5cf6', icon: 'fa-robot' },
        'cloud-migration': { color: '#06b6d4', icon: 'fa-cloud' },
        'data-platform': { color: '#10b981', icon: 'fa-database' },
        'integration': { color: '#f59e0b', icon: 'fa-exchange-alt' },
        'cybersecurity': { color: '#ef4444', icon: 'fa-shield-alt' },
        'custom': { color: '#6b7280', icon: 'fa-cube' }
    };
    const themeData = themes[theme];
    
    const categoryData = {
        name,
        theme,
        description,
        linkedServices,
        linkedArchitectures: categoryId ? window.engagementManager.getEntity('serviceCategories', categoryId)?.linkedArchitectures || [] : [],
        linkedInitiatives: [],
        color: themeData.color,
        icon: themeData.icon,
        aiSuggested: false
    };
    
    try {
        if (categoryId) {
            // Update existing
            window.engagementManager.updateEntity('serviceCategories', categoryId, categoryData);
            console.log('✅ Category updated:', name);
        } else {
            // Create new
            window.engagementManager.addEntity('serviceCategories', categoryData);
            console.log('✅ Category created:', name);
        }
        
        // Update window.currentEngagement
        window.currentEngagement = window.engagementManager.getCurrentEngagement();
        
        // Close form modal
        closeCategoryFormModal();
        
        // Refresh category manager
        closeCategoryManagerModal();
        setTimeout(() => openServiceCategoryManager(), 100);
        
        // Refresh Target EA view
        renderTargetServices();
        
        // Show success message
        showToast(
            categoryId ? 'Category Updated' : 'Category Created',
            `"${name}" has been ${categoryId ? 'updated' : 'added to your engagement'}`,
            'success'
        );
        
    } catch (error) {
        console.error('❌ Failed to save category:', error);
        showToast('Save Failed', error.message || 'Failed to save category', 'error');
    }
}

/**
 * Edit existing category
 */
function editCategory(categoryId) {
    openCategoryForm(categoryId);
}

/**
 * Delete category with confirmation
 */
function deleteCategory(categoryId) {
    const category = window.engagementManager.getEntity('serviceCategories', categoryId);
    
    if (!category) {
        showToast('Not Found', 'Category not found', 'error');
        return;
    }
    
    const linkedServicesCount = (category.linkedServices || []).length;
    const linkedArchitecturesCount = (category.linkedArchitectures || []).length;
    
    let confirmMsg = `Are you sure you want to delete "${category.name}"?`;
    
    if (linkedServicesCount > 0 || linkedArchitecturesCount > 0) {
        confirmMsg += `\n\n⚠️ This category has:\n`;
        if (linkedServicesCount > 0) confirmMsg += `• ${linkedServicesCount} linked service${linkedServicesCount !== 1 ? 's' : ''}\n`;
        if (linkedArchitecturesCount > 0) confirmMsg += `• ${linkedArchitecturesCount} linked architecture${linkedArchitecturesCount !== 1 ? 's' : ''}\n`;
        confirmMsg += `\nThese links will be removed.`;
    }
    
    confirmMsg += '\n\nThis action cannot be undone.';
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        window.engagementManager.deleteEntity('serviceCategories', categoryId);
        window.currentEngagement = window.engagementManager.getCurrentEngagement();
        
        // Refresh views
        closeCategoryManagerModal();
        setTimeout(() => openServiceCategoryManager(), 100);
        renderTargetServices();
        
        console.log('✅ Category deleted:', category.name);
        showToast('Category Deleted', `"${category.name}" has been removed`, 'success');
        
    } catch (error) {
        console.error('❌ Failed to delete category:', error);
        showToast('Delete Failed', error.message || 'Failed to delete category', 'error');
    }
}

/**
 * Close category manager modal
 */
function closeCategoryManagerModal() {
    const modal = document.getElementById('category-manager-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Close category form modal
 */
function closeCategoryFormModal() {
    const modal = document.getElementById('category-form-modal');
    if (modal) {
        modal.remove();
    }
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL SCOPE EXPORTS (for HTML onclick handlers)
// ═══════════════════════════════════════════════════════════════════

window.renderTargetServices = renderTargetServices;
window.openServiceLinkingModal = openServiceLinkingModal;
window.closeServiceLinkingModal = closeServiceLinkingModal;
window.saveServiceArchitectureLinks = saveServiceArchitectureLinks;
window.openAISuggestCategories = openAISuggestCategories;
window.toggleCategorySuggestion = toggleCategorySuggestion;
window.closeAISuggestionResultsModal = closeAISuggestionResultsModal;
window.applySelectedCategories = applySelectedCategories;
window.openServiceCategoryManager = openServiceCategoryManager;
window.openCategoryForm = openCategoryForm;
window.saveCategoryForm = saveCategoryForm;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.updateThemePreview = updateThemePreview;
window.closeCategoryManagerModal = closeCategoryManagerModal;
window.closeCategoryFormModal = closeCategoryFormModal;

console.log('✓ Target Services Bridge module loaded (V2.8 - FIELD VALIDATION)');
console.log('✓ window.openServiceCategoryManager:', typeof window.openServiceCategoryManager);
console.log('✓ window.openAISuggestCategories:', typeof window.openAISuggestCategories);
