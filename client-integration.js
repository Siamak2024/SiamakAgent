// Configuration - Point this to your backend server
const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let currentModelId = null;
let currentModelName = 'Untitled Model';

// ==================== API INTEGRATION ====================

// Call OpenAI through backend proxy using the Responses API (keeps API key secure)
async function callAI(sys, user) {
  try {
    const response = await fetch(`${API_BASE_URL}/openai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1',
        instructions: sys,
        input: user
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API error');
    }

    const data = await response.json();
    return data.output_text;
  } catch (error) {
    console.error('AI Call Error:', error);
    toast('Failed to communicate with AI: ' + error.message, true);
    throw error;
  }
}

// ==================== DATABASE OPERATIONS ====================

// Save current model to database
async function saveModelToDB() {
  const name = prompt('Enter model name:', currentModelName || 'Untitled Model');
  if (!name) return;

  try {
    const response = await fetch(`${API_BASE_URL}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentModelId,
        name: name,
        data: model
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save model');
    }

    const result = await response.json();
    currentModelId = result.id;
    currentModelName = name;
    updateHeaderTitle();
    toast('Model saved successfully ✓');
  } catch (error) {
    console.error('Save Error:', error);
    toast('Failed to save model: ' + error.message, true);
  }
}

// Load model from database
async function loadModelFromDB() {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) {
      throw new Error('Failed to load models');
    }

    const models = await response.json();
    
    if (models.length === 0) {
      toast('No saved models found');
      return;
    }

    showModelSelector(models);
  } catch (error) {
    console.error('Load Error:', error);
    toast('Failed to load models: ' + error.message, true);
  }
}

// Show model selector modal
function showModelSelector(models) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 w-[500px] max-h-[600px] shadow-2xl flex flex-col">
      <h3 class="font-bold text-lg mb-4">Load Model</h3>
      <div class="flex-1 overflow-y-auto space-y-2" id="modelList">
        ${models.map(m => `
          <div class="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center" onclick="selectModel(${m.id})">
            <div>
              <div class="font-semibold text-sm">${m.name}</div>
              <div class="text-xs text-slate-500">Last updated: ${new Date(m.updated_at).toLocaleString()}</div>
            </div>
            <button onclick="event.stopPropagation(); deleteModelFromDB(${m.id})" class="text-red-600 hover:text-red-800 text-xs px-2 py-1">Delete</button>
          </div>
        `).join('')}
      </div>
      <button onclick="closeModal()" class="mt-4 bg-slate-100 text-slate-700 py-2 rounded-lg font-bold text-sm">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  
  window.closeModal = () => modal.remove();
}

// Select and load a specific model
async function selectModel(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/models/${id}`);
    if (!response.ok) {
      throw new Error('Failed to load model');
    }

    const modelData = await response.json();
    currentModelId = modelData.id;
    currentModelName = modelData.name;
    model = modelData.data;

    // Ensure business fields and recompute
    ensureBusinessFields();
    computeDerivedFinancials();
    
    // Re-render all views
    renderLayers();
    renderCapMap();
    renderHeatmap();
    renderMaturityDashboard();
    populateImpactSelect();
    renderExecSummary();
    generateNarrative();
    
    if (model.initiatives?.length) {
      renderInitiatives();
      renderRoadmap();
      renderRoadmapVisual();
    }
    
    if (model.operatingModel?.valueProposition) {
      renderOperatingModel();
    }

    updateHeaderTitle();
    closeModal();
    toast('Model loaded successfully ✓');
  } catch (error) {
    console.error('Select Model Error:', error);
    toast('Failed to load model: ' + error.message, true);
  }
}

// Delete model from database
async function deleteModelFromDB(id) {
  if (!confirm('Are you sure you want to delete this model?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/models/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete model');
    }

    toast('Model deleted successfully ✓');
    closeModal();
    loadModelFromDB(); // Refresh the list
  } catch (error) {
    console.error('Delete Error:', error);
    toast('Failed to delete model: ' + error.message, true);
  }
}

// Create new model
function newModel() {
  if (!confirm('Create a new model? Any unsaved changes will be lost.')) return;
  
  currentModelId = null;
  currentModelName = 'Untitled Model';
  model = {
    valueStreams: [],
    capabilities: [],
    processes: [],
    systems: [],
    dataDomains: [],
    aiAgents: [],
    initiatives: [],
    operatingModel: {}
  };
  
  // Clear all views
  document.getElementById('description').value = '';
  renderLayers();
  updateHeaderTitle();
  toast('New model created');
}

// Update header with current model name
function updateHeaderTitle() {
  const titleEl = document.querySelector('header .font-bold.text-base');
  if (titleEl) {
    titleEl.textContent = currentModelName || 'AI Enterprise Architecture Platform';
  }
}

// ==================== UTILITY FUNCTIONS ====================

// Toast notification
function toast(msg, err) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px 18px;border-radius:10px;color:white;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.2);background:${err?'#dc2626':'#16a34a'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Extract JSON from AI response
function extractJSON(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  const a = text.indexOf('['), b = text.indexOf('{');
  const start = a === -1 ? b : b === -1 ? a : Math.min(a, b);
  if (start === -1) return text;
  return text.slice(start, Math.max(text.lastIndexOf(']'), text.lastIndexOf('}')) + 1);
}

// Export model to JSON file (local download)
function exportModel() {
  const a = document.createElement('a');
  a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(model, null, 2));
  a.download = `${currentModelName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
  a.click();
  toast('Model exported ✓');
}

// Import model from JSON file
function importModel(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      model = JSON.parse(e.target.result);
      currentModelId = null; // Reset ID on import
      currentModelName = 'Imported Model';
      
      ensureBusinessFields();
      computeDerivedFinancials();
      renderLayers();
      renderCapMap();
      renderHeatmap();
      renderMaturityDashboard();
      populateImpactSelect();
      renderExecSummary();
      generateNarrative();
      
      if (model.initiatives?.length) {
        renderInitiatives();
        renderRoadmap();
        renderRoadmapVisual();
      }
      
      if (model.operatingModel?.valueProposition) {
        renderOperatingModel();
      }
      
      updateHeaderTitle();
      toast('Model imported ✓');
    } catch (error) {
      toast('Invalid JSON file', true);
    }
  };
  reader.readAsText(event.target.files[0]);
}
