# Static HTML APM Toolkit Implementation Specification

This document contains full implementation instructions for creating a **static HTML APM Toolkit** with integrated AI assistant and business capability mapping.

---

## 1. Input

- Excel file: `K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.0`
- Place the Excel file in the project `/apm-toolkit/data/` folder.
- Convert Excel into `capabilities.json` using Copilot:
  - L1, L2, L3 capabilities
  - Parent-child relationships
  - Include fields: `id`, `name`, `level`, `parentId`, `industryTag`, `strategicImportance`, `maturity`, `aiPotential`
- Applications and AI agents will be in separate JSON files (`applications.json`, `ai_agents.json`) with empty arrays initially, scaffold structure only.

---

## 2. Project Structure

```
/apm-toolkit/
├── index.html            # Main entry point with tabs and visualization container
├── style.css             # Global styling for tabs, heatmaps, layers, and AI assistant
├── app.js                # Main JS logic for loading JSON, mapping, and UI interactions
├── data/
│   ├── capabilities.json # Generated from Excel
│   ├── applications.json # Placeholder empty array with schema
│   └── ai_agents.json    # Placeholder empty array with schema
├── components/
│   ├── capabilityTab.js
│   ├── applicationTab.js
│   ├── aiAgentTab.js
│   └── visualization.js
└── ai/
    └── aiAssistant.js    # Embedded AI assistant integration
```

---

## 3. Core Features

### Tabs
- Capability Layer  
- Application Layer  
- AI Agent Layer  
- Architecture Visualization  

### Mapping
- Capability ↔ Application (many-to-many)  
- Capability ↔ AI Agent (many-to-many)  

### Visualization
- Heatmap for redundancy & fit  
- Layered diagram (Capability → Application → AI Agent)  
- AS-IS vs TO-BE visualization  

### AI Assistant
- Embedded panel in HTML  
- Context-aware system instructions per tab  
- Supports mapping, TO-BE scenarios, AI agent recommendations  

---

## 4. Data Models (JSON)

### capabilities.json
```json
[
  {
    "id": "C001",
    "name": "Property Management",
    "level": "L1",
    "parentId": null,
    "industryTag": "RealEstate",
    "strategicImportance": "High",
    "maturity": 3,
    "aiPotential": "High"
  }
]
```

### applications.json
```json
[]
```

### ai_agents.json
```json
[]
```

---

## 5. System Instructions (AI prompts)

### Capability Tab
```
Map applications to business capabilities.
Highlight gaps and redundancy.
Suggest optimization and AI automation opportunities.
Output structured JSON for UI.
```

### Application Tab
```
Analyze fit, lifecycle, and redundancy of applications.
Flag low-fit or redundant systems.
Output structured JSON for mapping.
```

### AI Agent Tab
```
For each business capability, suggest AI agents.
Evaluate potential for automation or decision support.
Include TO-BE scenarios.
Output structured JSON for UI.
```

### Visualization Tab
```
Render layers: Capability → Application → AI Agent.
Color-code AS-IS vs TO-BE, highlight redundancy and AI potential.
Output ready-to-render data structure for frontend.
```

---

## 6. Frontend Implementation

- Tabbed layout for all layers  
- Panel for AI assistant  
- Container for architecture visualization (SVG / Canvas)  

**JS Components**
- Load JSON data (capabilities, applications, AI agents)  
- Map applications to capabilities and AI agents
- Generate heatmaps:
  - Red = high redundancy
  - Yellow = low fit
  - Green = optimized
- Render AS-IS → TO-BE layered architecture
- Integrate AI assistant panel with pre-defined instructions per tab

---

## 7. Visualization

- Layered diagram: Capability → Application → AI Agent  
- Color-coded heatmaps  
- Icons for AI agents  
- Solid lines = AS-IS, dashed lines = TO-BE  

---

## 8. Phased Implementation

1. **Phase 1** – Capability & Application tabs with AI assistant MVP  
2. **Phase 2** – AI Agent tab + mapping + TO-BE suggestions  
3. **Phase 3** – Visualization layer + heatmaps + interactive mapping  
4. **Phase 4** – Import APQC templates for industry-specific filtering  

---

## 9. Governance / Validation

- Every application must map to ≥1 capability  
- Every capability must have AI potential assessed  
- AI suggestions are optional but visible for user  

---

## 10. Copilot Prompts Examples

1. CRUD for `capabilities.json`  
2. Mapping logic for capabilities ↔ applications ↔ AI agents  
3. Heatmap generator  
4. AI assistant integration  
5. Layered architecture visualization  

---

## 11. Example Real Estate Capabilities JSON
```json
[
  {
    "id": "C001",
    "name": "Property Management",
    "level": "L1",
    "parentId": null,
    "industryTag": "RealEstate",
    "strategicImportance": "High",
    "maturity": 3,
    "aiPotential": "High"
  },
  {
    "id": "C001-1",
    "name": "Tenant Management",
    "level": "L2",
    "parentId": "C001",
    "industryTag": "RealEstate",
    "strategicImportance": "High",
    "maturity": 3,
    "aiPotential": "High"
  }
]
```

> Note: Extend with L3 capabilities as needed.

---

## 12. Notes

- Use standard HTML/CSS/JS only (no frameworks required)  
- Load JSON files via fetch API  
- Comment code for clarity  
- Placeholder icons for AI agents  
- Keep interface lightweight and responsive

---

## 13. Excel File Reference

- Copy the APQC Excel file `K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.0` into the project `/data/` folder so that Copilot can reference it when generating `capabilities.json`.

