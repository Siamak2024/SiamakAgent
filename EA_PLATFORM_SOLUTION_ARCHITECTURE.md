# EA Platform — Solution Architecture Documentation

**Document Version:** 1.0  
**Date:** April 23, 2026  
**Status:** Active

---

## Executive Summary

The **EA Platform** (Enterprise Architecture Platform) is an AI-powered, web-based solution designed to streamline enterprise architecture processes, strategic planning, and customer engagement workflows. The platform combines advanced AI capabilities with industry-standard frameworks (APQC, Wardley Mapping, Business Model Canvas) to deliver actionable insights for enterprise architects, sales teams, and business consultants.

### Key Characteristics
- **Architecture Pattern:** Three-tier web application (Client-Server-AI)
- **Deployment:** Hybrid (Local development + Azure cloud production)
- **AI Integration:** OpenAI GPT-5 with Responses API
- **Data Persistence:** SQLite (server) + IndexedDB/LocalStorage (client)
- **Industry Focus:** Financial Services, Insurance, Banking, Manufacturing, Technology

---

## 1. System Overview

### 1.1 Platform Purpose

The EA Platform serves three primary use cases:

1. **Enterprise Architecture Modeling** — 7-step methodology for strategic EA planning
2. **Customer Engagement & Sales** — Growth Sprint Dashboard for coordinated EA/Sales collaboration
3. **Analytics & Insights** — AI-powered analysis of architecture maturity, gaps, and opportunities

### 1.2 Target Users

- Enterprise Architects
- Solution Architects
- Sales Engineers
- Business Consultants
- C-level Executives
- Strategy Teams

---

## 2. High-Level Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Web Browser (Chrome, Edge, Firefox, Safari)             │  │
│  │                                                            │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐│  │
│  │  │  NexGen EA V4  │  │ EA2 Toolkit    │  │  Start Page ││  │
│  │  │  (Primary App) │  │ (20+ Tools)    │  │  Dashboard  ││  │
│  │  └────────────────┘  └────────────────┘  └─────────────┘│  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Client-Side Components                             │ │  │
│  │  │  • UI Layer (Tailwind CSS + Nordic Theme)           │ │  │
│  │  │  • State Management (Model Object + LocalStorage)   │ │  │
│  │  │  • Client Integration (client-integration.js)       │ │  │
│  │  │  • Industry Selectors & Data Generators             │ │  │
│  │  │  • AI Chat Component (EAChatComponent)              │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER TIER (Node.js)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Backend (server.js)                          │  │
│  │                                                            │  │
│  │  API Endpoints:                                           │  │
│  │  • /api/health              — Health check                │  │
│  │  • /api/config/openai-key   — API key delivery           │  │
│  │  • /api/openai/chat         — AI proxy (secure)          │  │
│  │  • /api/models              — Model CRUD operations      │  │
│  │  • /api/models/:id          — Specific model retrieval   │  │
│  │                                                            │  │
│  │  Middleware:                                              │  │
│  │  • CORS (Cross-Origin Resource Sharing)                  │  │
│  │  • Body Parser (JSON, 50MB limit)                        │  │
│  │  • Static File Serving (no-cache for dev)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Data Layer (database.js)                                │  │
│  │                                                            │  │
│  │  SQLite Database: ea_models.db                           │  │
│  │  • models table (id, name, data, timestamps)             │  │
│  │  • Operations: CRUD, getAllModels, saveModel, delete     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI/EXTERNAL SERVICES                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OpenAI API (GPT-5 with Responses API)                   │  │
│  │  • Endpoint: api.openai.com/v1/chat/completions         │  │
│  │  • Models: gpt-5 (primary), gpt-4o (fallback)            │  │
│  │  • Features: Reasoning, Tool calling, JSON mode          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Azure Cloud Services (Production)                        │  │
│  │  • Azure Static Web Apps                                  │  │
│  │  • Azure Functions (API proxy endpoints)                  │  │
│  │  • Azure Storage (optional)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|----------|
| **Three-Tier** | Client-Server-AI | Separation of concerns |
| **API Gateway** | Express.js server | Security, routing, middleware |
| **Proxy Pattern** | AI API proxy | API key security, request transformation |
| **SPA** | Single Page Application | Rich user experience |
| **RESTful API** | JSON over HTTP | Standard web services |
| **Repository Pattern** | database.js | Data access abstraction |

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **HTML5** | Latest | Structure & markup |
| **JavaScript** | ES6+ | Application logic |
| **Tailwind CSS** | 3.x | Styling framework |
| **Font Awesome** | 6.4.0 | Icons |
| **IndexedDB** | Native | Client-side data persistence |
| **LocalStorage** | Native | Settings & state |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **SQLite3** | 5.1.6 | Database |
| **CORS** | 2.8.5 | Cross-origin handling |
| **dotenv** | 16.3.1 | Environment configuration |
| **node-fetch** | 3.3.2 | HTTP client for AI API |

### 3.3 AI & External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **GPT-5** | OpenAI | Primary AI model |
| **Responses API** | OpenAI | AI integration standard |
| **Azure Functions** | Microsoft | Production API proxy |
| **Azure Static Web Apps** | Microsoft | Production hosting |

### 3.4 Development Tools

| Tool | Purpose |
|------|---------|
| **Jest** | Unit testing |
| **Playwright** | E2E testing |
| **PowerShell** | Deployment scripts |
| **Git** | Version control |

---

## 4. Component Architecture

### 4.1 Frontend Components

#### 4.1.1 Core Applications

**1. NexGen EA V4 (Primary Application)**
- **File:** `NexGenEA/NexGen_EA_V4.html`
- **Lines:** ~16,000 (monolithic SPA)
- **Purpose:** 7-step EA methodology with AI-powered analysis
- **Key Features:**
  - Strategic Intent Builder
  - Business Capabilities Mapping
  - Application Portfolio Management
  - Technology & Infrastructure
  - AI Agent Layer
  - Analytics Dashboard
  - Output Generation

**2. EA2 Toolkit (20+ Specialized Tools)**
- **Location:** `NexGenEA/EA2_Toolkit/`
- **Tools Include:**
  - AI Strategy Workbench
  - AI Capability Mapping
  - AI Value Chain Analyzer
  - Business Objectives Toolkit
  - Application Portfolio Management
  - WhiteSpot Analysis (APQC-based)
  - Wardley Workshop Builder
  - Capability Workshop Builder
  - EA Analytics Dashboard
  - Engagement Playbook
  - Stakeholder Influence Matrix
  - Value Case Builder
  - Mainframe Modernization Toolkit

**3. Growth Sprint Dashboard (Start Page)**
- **File:** `EA2_Toolkit/EA_Start_Page.html`
- **Purpose:** EA & Sales collaboration platform
- **Features:**
  - 6-phase engagement workflow
  - Industry-specific demos (Banking, FinTech, Insurance)
  - Team coordination
  - Opportunity tracking
  - Demo scenario management

#### 4.1.2 Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| **AI Chat** | `ea_chat_component.js` | Context-aware AI assistant |
| **APQC Integration** | `apqc_whitespot_integration.js` | Process framework integration |
| **APQC Mapping UI** | `apqc_mapping_modal.js` | Capability mapping interface |
| **Engagement Core** | `ea_engagement_core.js` | Engagement workflow engine |
| **Industry Selector** | `industry_selector.js` | Industry-specific customization |
| **Output Generator** | `ea_output_generator.js` | Document generation |
| **Service Loader** | `vivicta_service_loader.js` | Service catalog management |
| **WhiteSpot Renderer** | `whitespot_heatmap_renderer.js` | Heatmap visualization |

#### 4.1.3 Client Integration Layer

**File:** `client-integration.js`

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Core Functions:
• callAI(systemPrompt, userInput)      → AI request via proxy
• saveModelToDB()                       → Persist model to server
• loadModelFromDB()                     → Retrieve saved models
• deleteModelFromDB(id)                 → Remove model
• exportModelToJSON()                   → Export functionality
```

### 4.2 Backend Components

#### 4.2.1 API Server (server.js)

**Core Routes:**

```javascript
// Health & Configuration
GET  /api/health                    → Status check
GET  /api/config/openai-key         → Retrieve API key

// AI Proxy (Security-Critical)
POST /api/openai/chat               → OpenAI proxy with transformation
  • Input: Responses API or Chat Completions format
  • Output: Standardized response
  • Timeout: 5 minutes
  • Features: Format detection, parameter transformation

// Model Management
GET    /api/models                  → List all models
GET    /api/models/:id              → Get specific model
POST   /api/models                  → Create/update model
DELETE /api/models/:id              → Delete model

// Static File Serving
GET  /*                             → Serve HTML/JS/CSS/Assets
  • Cache-Control: no-cache (development)
  • Etag: disabled (development)
```

#### 4.2.2 Database Layer (database.js)

**Schema:**

```sql
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  data TEXT NOT NULL,              -- JSON stringified model
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Operations:**

```javascript
• init()                            → Initialize DB connection
• createTables()                    → Schema setup
• getAllModels(callback)            → Retrieve model list
• getModel(id, callback)            → Get specific model with parsed JSON
• saveModel(id, name, data, cb)     → Upsert model
• deleteModel(id, callback)         → Remove model
• close()                           → Graceful shutdown
```

#### 4.2.3 AI Proxy Layer (AzureOpenAIProxy.js)

**Purpose:** Secure, standardized interface to OpenAI API

**Key Features:**
1. **Environment Detection:** Auto-switch between Azure/local endpoints
2. **API Format Transformation:** Responses API ↔ Chat Completions API
3. **Tool Calling Support:** Function definitions, parallel calls
4. **Error Handling:** Retry logic, timeout management
5. **Multi-turn Conversations:** Previous response chaining

**Class Methods:**

```javascript
AzureOpenAIProxy.create(input, options)
  • input: String or message array
  • options: {
      model: 'gpt-5',
      instructions: 'System prompt',
      tools: [...],
      tool_choice: 'auto',
      response_format: {...},
      temperature: 1.0,
      timeout: 30000
    }
  • Returns: { output_text, usage, ... }

AzureOpenAIProxy.callWithTools(input, handlers, options)
  • Automatic tool execution loop
  • Handler functions for tool calls
  • Returns final response after tool completion

AzureOpenAIProxy.getApiEndpoint()
  • Returns appropriate endpoint based on environment
```

---

## 5. Data Flow Architecture

### 5.1 User Interaction Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1. Interaction (Click, Input)
       ▼
┌─────────────────────────────┐
│   Browser (Client-Side)     │
│                              │
│  • UI Event Handlers         │
│  • State Updates (model {})  │
│  • Validation                │
└──────────┬──────────────────┘
           │
           │ 2. API Request (if needed)
           ▼
┌───────────────────────────────┐
│   Express Server (Backend)    │
│                                │
│  • Route Handling              │
│  • Request Validation          │
│  • Business Logic              │
└──────┬───────────────┬────────┘
       │               │
       │ 3a. DB Query  │ 3b. AI Request
       ▼               ▼
┌──────────┐    ┌─────────────┐
│  SQLite  │    │  OpenAI API │
│ Database │    │   (GPT-5)   │
└──────────┘    └─────────────┘
       │               │
       │ 4a. Data      │ 4b. AI Response
       ▼               ▼
┌───────────────────────────────┐
│   Express Server (Backend)    │
│  • Response Formatting         │
│  • Error Handling              │
└──────────┬────────────────────┘
           │
           │ 5. JSON Response
           ▼
┌─────────────────────────────┐
│   Browser (Client-Side)     │
│  • Update UI                 │
│  • Update State              │
│  • Persist to LocalStorage   │
└─────────────────────────────┘
           │
           │ 6. Visual Feedback
           ▼
┌─────────────┐
│    User     │
└─────────────┘
```

### 5.2 AI Request Flow (Detailed)

```
Client Component
    │
    │ callAI(systemPrompt, userMessage)
    ▼
AzureOpenAIProxy.create(userMessage, { instructions: systemPrompt })
    │
    │ Detect environment (Azure vs Local)
    ▼
POST /api/openai/chat
    │
    │ Server validates request
    │ Detects API format (Responses API vs Chat Completions)
    ▼
Transform request if needed
    │ • Responses API → Chat Completions format
    │ • Add authorization header
    │ • Set timeouts (5 min)
    ▼
POST https://api.openai.com/v1/chat/completions
    │
    │ OpenAI processes request
    ▼
OpenAI Response
    │
    │ Transform response if needed
    │ Chat Completions → Responses API format
    ▼
Server Response
    │
    │ Send JSON to client
    ▼
Client receives response.output_text
    │
    │ Update UI with AI content
    ▼
User sees result
```

### 5.3 Data Persistence Flow

**Client-Side Persistence:**

```javascript
// Auto-save every 30 seconds
setInterval(() => {
  localStorage.setItem('ea_model_v4', JSON.stringify(model));
}, 30000);

// IndexedDB for larger datasets
const db = await indexedDB.open('ea_platform', 1);
db.objectStore('models').add({ id, name, data, timestamp });
```

**Server-Side Persistence:**

```javascript
// Save model to SQLite
app.post('/api/models', (req, res) => {
  const { id, name, data } = req.body;
  db.saveModel(id, name, JSON.stringify(data), (err, modelId) => {
    res.json({ success: true, id: modelId });
  });
});
```

---

## 6. Key Features & Capabilities

### 6.1 AI-Powered Features

| Feature | Description | AI Model | Use Case |
|---------|-------------|----------|----------|
| **Strategic Analysis** | Analyze business objectives and generate strategic recommendations | GPT-5 | Step 1: Strategic Intent |
| **Capability Mapping** | Map business capabilities to APQC framework | GPT-5 | Step 2: Capabilities |
| **Gap Analysis** | Identify gaps between current and target state | GPT-5 | WhiteSpot Analysis |
| **Agent Recommendations** | Suggest AI agents based on capabilities and maturity | GPT-5 | AI Agent Layer |
| **Technology Assessment** | Evaluate technology stack and suggest improvements | GPT-5 | Step 4: Technology |
| **Output Generation** | Generate executive summaries, proposals, presentations | GPT-5 | Step 7: Outputs |
| **Chat Assistant** | Context-aware conversational AI for guidance | GPT-5 | Advicy Agent |

### 6.2 Framework Integrations

#### 6.2.1 APQC Framework (3-Layer Architecture)

**Integration Files:**
- `apqc_whitespot_integration.js` — Core framework loader
- `apqc_mapping_modal.js` — UI for capability mapping

**Structure:**
```
APQC Framework
├── L1: Operating Models (12)
├── L2: Process Groups (~150)
├── L3: Processes (~1,000)
└── L4: Activities (~4,000)
```

**Features:**
- Industry-specific process variations (Banking, Insurance, Manufacturing, etc.)
- Capability maturity assessment (Level 1-5)
- Service → Capability mapping with types (Primary, Secondary, Enabler)
- AI-powered mapping suggestions
- WhiteSpot heatmap visualization

#### 6.2.2 Wardley Mapping

**Integration:** `Wardley_Workshop_Builder.html`

**Features:**
- Component positioning on evolution axis
- Value chain analysis
- Movement tracking
- Strategic play identification

#### 6.2.3 Business Model Canvas

**Integration:** `AI Business Model Canvas.html`

**Features:**
- 9 building blocks
- AI-assisted completion
- Value proposition generation
- Revenue stream analysis

### 6.3 Engagement & Collaboration

**Growth Sprint Dashboard Features:**

1. **6-Phase Engagement Workflow**
   - Phase 1: Discovery & Qualification
   - Phase 2: Strategic Alignment
   - Phase 3: Solution Design
   - Phase 4: Value Case Building
   - Phase 5: Proposal & Negotiation
   - Phase 6: Execution Planning

2. **Team Coordination**
   - EA & Sales collaboration
   - Shared context & notes
   - Activity tracking
   - Document management

3. **Industry Demos**
   - Banking scenario (Digital transformation)
   - FinTech scenario (Platform modernization)
   - Insurance scenario (Claims automation)

4. **Opportunity Pipeline**
   - Opportunity tracking
   - Probability scoring
   - Value estimation
   - Timeline management

---

## 7. Security Architecture

### 7.1 Security Principles

| Principle | Implementation |
|-----------|---------------|
| **API Key Security** | Server-side storage, never exposed to client |
| **Request Validation** | Input sanitization, schema validation |
| **CORS Protection** | Configured origins, preflight handling |
| **Rate Limiting** | (TODO: Implement for production) |
| **Authentication** | (Production: Azure AD integration) |
| **Authorization** | (Production: Role-based access control) |

### 7.2 Secure AI Proxy Pattern

**Problem:** Exposing OpenAI API keys in client-side code is a security risk.

**Solution:** Server-side proxy that handles all AI requests.

```javascript
// ❌ INSECURE: Client-side API key
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${CLIENT_SIDE_API_KEY}` }
});

// ✅ SECURE: Server-side proxy
const response = await fetch('/api/openai/chat', {
  method: 'POST',
  body: JSON.stringify({ input: userMessage, instructions: systemPrompt })
});
```

**Server Implementation:**

```javascript
app.post('/api/openai/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;  // Server environment
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`  // Never exposed to client
    },
    body: JSON.stringify(transformedRequest)
  });
  
  res.json(await response.json());
});
```

### 7.3 Data Protection

| Data Type | Storage Location | Protection Mechanism |
|-----------|------------------|---------------------|
| **API Keys** | Server `.env` file | Environment variables, not in source control |
| **User Models** | SQLite database | Server-side, no client access to raw data |
| **Session Data** | Client LocalStorage | Encrypted in transit (HTTPS) |
| **Sensitive Content** | (Production) Azure Storage | Encryption at rest, access policies |

---

## 8. Deployment Architecture

### 8.1 Development Environment

**Startup Script:** `dev-start.ps1`

```powershell
# Prerequisites check
- Node.js installation
- .env file creation
- npm dependencies

# Startup
node server.js
# Server: http://localhost:3000
# Auto-opens: EA_Start_Page.html
```

**Configuration:** `.env`

```env
PORT=3000
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

### 8.2 Production Environment (Azure)

**Azure Resources:**

```
Azure Resource Group: ea-platform-prod
├── Static Web App
│   ├── Frontend: /NexGenEA/*
│   ├── CDN: Azure Front Door
│   └── Custom Domain: ea-platform.advicy.com
├── Azure Functions
│   ├── /api/openai-proxy
│   ├── /api/models
│   └── /api/health
├── Azure Cosmos DB (optional future enhancement)
│   └── Model persistence
└── Application Insights
    └── Monitoring & telemetry
```

**Deployment Scripts:**

```powershell
# Deploy to Azure
.\deploy-multiuser.ps1

# Copy files to Azure staging
.\copy-files-to-azure.ps1
```

### 8.3 Environment Comparison

| Feature | Development | Production (Azure) |
|---------|-------------|-------------------|
| **Server** | Node.js/Express | Azure Functions |
| **Database** | SQLite | Azure Storage / Cosmos DB |
| **AI Endpoint** | `/api/openai/chat` | `/api/openai-proxy` |
| **Auth** | None | Azure AD |
| **HTTPS** | Optional | Enforced |
| **Domain** | localhost:3000 | ea-platform.advicy.com |
| **Monitoring** | Console logs | Application Insights |

---

## 9. Integration Points

### 9.1 External Integrations

| Integration | Protocol | Purpose | Status |
|-------------|----------|---------|--------|
| **OpenAI API** | HTTPS/REST | AI model inference | ✅ Active |
| **Azure AD** | OAuth2 | Authentication | 🔄 Production only |
| **Azure Functions** | HTTPS/REST | API gateway | 🔄 Production only |
| **Azure Storage** | HTTPS/REST | File storage | 📋 Planned |

### 9.2 Internal Integrations

| Integration | Mechanism | Purpose |
|-------------|-----------|---------|
| **Client ↔ Server** | REST API (JSON) | Data operations, AI requests |
| **Server ↔ Database** | SQLite3 driver | Model persistence |
| **Server ↔ OpenAI** | HTTP client (node-fetch) | AI inference |
| **Components ↔ Chat** | JavaScript events | Context sharing |

### 9.3 Data Exchange Formats

**API Request Format:**

```json
{
  "model": "gpt-5",
  "instructions": "You are an enterprise architecture expert...",
  "input": "Analyze the current state...",
  "temperature": 1.0,
  "max_tokens": 4000
}
```

**API Response Format:**

```json
{
  "id": "resp_abc123",
  "model": "gpt-5",
  "output_text": "Based on the analysis...",
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  }
}
```

**Model Save Format:**

```json
{
  "id": 42,
  "name": "Enterprise Architecture 2026",
  "data": {
    "step1": { "objectives": [...] },
    "step2": { "capabilities": [...] },
    "step3": { "applications": [...] },
    "step4": { "technologies": [...] },
    "step5": { "agents": [...] },
    "step6": { "analytics": {...} },
    "step7": { "outputs": [...] }
  },
  "created_at": "2026-04-23T10:30:00Z",
  "updated_at": "2026-04-23T14:45:00Z"
}
```

---

## 10. Performance & Scalability

### 10.1 Performance Characteristics

| Metric | Target | Current |
|--------|--------|---------|
| **Page Load Time** | < 2s | ~1.5s |
| **AI Response Time** | < 30s | 5-20s (varies by model) |
| **Database Query Time** | < 100ms | ~50ms |
| **Concurrent Users** | 100+ | (Not load tested) |
| **Model Size Limit** | 50MB | Configurable |

### 10.2 Optimization Strategies

**Client-Side:**
- Lazy loading of toolkit modules
- IndexedDB for large datasets
- Debounced auto-save (30s interval)
- Virtual scrolling for large lists
- Image lazy loading

**Server-Side:**
- Static file caching (production)
- Database connection pooling
- Request timeout limits (5 min for AI)
- Gzip compression
- CDN for static assets (Azure)

**AI Integration:**
- Streaming responses (TODO)
- Request caching (TODO)
- Prompt optimization (token reduction)
- Parallel processing where applicable

### 10.3 Scalability Considerations

**Horizontal Scaling:**
- Azure Functions auto-scale
- Stateless API design
- Session data in client-side storage

**Vertical Scaling:**
- Database optimization (indexes, query tuning)
- Memory management (large model handling)
- CPU optimization (avoid blocking operations)

**Future Enhancements:**
- Redis cache for session data
- Azure Cosmos DB for distributed persistence
- Message queue for async processing
- WebSocket for real-time updates

---

## 11. Monitoring & Observability

### 11.1 Logging Strategy

**Client-Side:**
```javascript
// Console logging levels
console.log('Info: User action');
console.warn('Warning: Validation issue');
console.error('Error: API failure');

// Error tracking (TODO: Integrate Sentry)
window.onerror = (msg, url, line, col, error) => {
  // Send to logging service
};
```

**Server-Side:**
```javascript
// Request logging
console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

// Error logging
console.error('AI API Error:', error.message, error.stack);

// Production: Application Insights
// appInsights.trackRequest(...)
// appInsights.trackException(...)
```

### 11.2 Health Monitoring

**Endpoint:** `GET /api/health`

```json
{
  "status": "ok",
  "timestamp": "2026-04-23T15:30:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "openai_configured": true,
  "database_connected": true
}
```

### 11.3 Key Metrics

| Metric | Collection Method | Alerting |
|--------|------------------|----------|
| **API Latency** | Request timing | > 5s |
| **Error Rate** | Exception tracking | > 5% |
| **AI Failures** | Response validation | Any failure |
| **Database Errors** | Query monitoring | Any error |
| **User Sessions** | Analytics | N/A |

---

## 12. Development Workflow

### 12.1 Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd CanvasApp

# 2. Install dependencies
npm install

# 3. Configure environment
# Create .env file with OPENAI_API_KEY

# 4. Start development server
npm start
# Or: node server.js
# Or: .\dev-start.ps1

# 5. Access application
# http://localhost:3000
# http://localhost:3000/NexGenEA/EA2_Toolkit/EA_Start_Page.html
```

### 12.2 Testing Strategy

**Unit Tests:**
```bash
npm test              # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

**E2E Tests:**
```bash
npm run test:e2e     # Playwright tests
```

**Test Files:**
- `jest.config.js` — Jest configuration
- `E2E_WORKFLOW_TEST_GUIDE.md` — E2E test documentation
- `E2E_AUTOPILOT_TEST_RESULTS.md` — Test results

### 12.3 Deployment Process

```bash
# 1. Test locally
npm test

# 2. Build (if applicable)
# No build step for current architecture

# 3. Deploy to Azure
.\deploy-multiuser.ps1

# 4. Verify deployment
# Check Azure portal
# Test production endpoints

# 5. Monitor
# Application Insights dashboard
```

---

## 13. Known Limitations & Future Enhancements

### 13.1 Current Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Monolithic SPA** | Large file size (16K lines) | Consider modularization |
| **No Authentication** | Open access in dev | Azure AD in production |
| **SQLite** | Single-server limitation | Migrate to Cosmos DB |
| **No Rate Limiting** | Potential abuse | Implement middleware |
| **Client-Side State** | Lost on refresh | Auto-save + server sync |
| **Manual Scaling** | Limited concurrent users | Azure Functions auto-scale |

### 13.2 Planned Enhancements

**Q2 2026:**
- [ ] Implement authentication (Azure AD)
- [ ] Add rate limiting
- [ ] Migrate to Cosmos DB
- [ ] WebSocket for real-time collaboration
- [ ] Streaming AI responses

**Q3 2026:**
- [ ] Mobile-responsive design
- [ ] Offline mode (PWA)
- [ ] Advanced analytics dashboard
- [ ] Export to PowerPoint/PDF
- [ ] Multi-language UI (beyond English)

**Q4 2026:**
- [ ] Collaborative editing (multi-user)
- [ ] Version control for models
- [ ] Integration with Microsoft Teams
- [ ] Custom AI model fine-tuning
- [ ] API for third-party integrations

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **APQC** | American Productivity & Quality Center — Process framework provider |
| **EA** | Enterprise Architecture |
| **SPA** | Single Page Application |
| **CRUD** | Create, Read, Update, Delete |
| **REST** | Representational State Transfer |
| **GPT** | Generative Pre-trained Transformer (AI model) |
| **L1/L2/L3** | APQC framework layers (Operating Models, Process Groups, Processes) |
| **WhiteSpot** | Gap analysis visualization tool |
| **Responses API** | OpenAI's high-level API format (vs Chat Completions API) |

---

## 15. References & Documentation

### 15.1 Internal Documentation

- [README.md](README.md) — Project overview
- [QUICKSTART.md](QUICKSTART.md) — Getting started guide
- [ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md)
- [IMPLEMENTATION_APQC_3LAYER_ARCHITECTURE.md](IMPLEMENTATION_APQC_3LAYER_ARCHITECTURE.md)
- [MULTI_USER_IMPLEMENTATION_GUIDE.md](MULTI_USER_IMPLEMENTATION_GUIDE.md)
- [EA_Platform_V4_Quick_Reference.md](EA_Platform_V4_Quick_Reference.md)
- [SALES_EA_COLLABORATION_GUIDE.md](SALES_EA_COLLABORATION_GUIDE.md)

### 15.2 External References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/)
- [APQC Process Classification Framework](https://www.apqc.org/resource-library/resource-listing/apqc-process-classification-framework-pcf-cross-industry-pdf)
- [Wardley Mapping](https://wardleymaps.com/)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-23 | EA Platform Team | Initial release |

---

**END OF DOCUMENT**
