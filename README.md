# AI Enterprise Architecture Platform - Local Setup Guide

> **📚 NEW! Complete Documentation Update (April 2026)**  
> - **[CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)** - Master architecture reference
> - **[WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)** - Navigation guide  
> - **[DOCUMENTATION_UPDATE_SUMMARY_2026.md](DOCUMENTATION_UPDATE_SUMMARY_2026.md)** - What's changed
> - **[ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md)** - Testing guide

This guide will help you set up the EA Platform to run locally with:
- ✅ Backend server (Node.js + Express)
- ✅ SQLite database for data persistence
- ✅ Secure OpenAI API key management (server-side)
- ✅ Save/Load functionality for multiple models
- ✅ GPT-5 Responses API integration (NEW)

## Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## 🚀 Quick Start

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install:
- express (web server)
- sqlite3 (database)
- cors (cross-origin support)
- dotenv (environment variables)
- body-parser (request parsing)
- node-fetch (for OpenAI proxy)

### Step 2: Configure Environment

1. Copy the example environment file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` file and add your OpenAI API key:
   ```
   PORT=3000
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

### Step 3: Modify Your HTML File

You need to make a few changes to your HTML file to connect it to the backend.

#### Option A: Use the Integration Script (Recommended)

1. Add this line in the `<head>` section of your HTML file, **before** the closing `</head>` tag:
   ```html
   <script src="client-integration.js"></script>
   ```

2. Update the header buttons section (around line 45-51). Replace:
   ```html
   <div class="flex gap-2">
     <button onclick="showApiModal()" class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-600">⚙ API Key</button>
     <button onclick="exportModel()" class="bg-white text-slate-900 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50">↓ Export JSON</button>
     <label class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-600">↑ Import<input type="file" class="hidden" onchange="importModel(event)" accept=".json"></label>
   </div>
   ```
   
   With:
   ```html
   <div class="flex gap-2">
     <button onclick="newModel()" class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-600">📄 New</button>
     <button onclick="saveModelToDB()" class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">💾 Save</button>
     <button onclick="loadModelFromDB()" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">📂 Load</button>
     <button onclick="exportModel()" class="bg-white text-slate-900 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50">↓ Export</button>
     <label class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-600">↑ Import<input type="file" class="hidden" onchange="importModel(event)" accept=".json"></label>
   </div>
   ```

3. Remove or comment out the API Modal section (around lines 54-65):
   ```html
   <!-- API MODAL - NO LONGER NEEDED
   <div id="apiModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center">
     ...
   </div>
   -->
   ```

4. In the `<script>` section, replace these variables and functions:
   
   **Remove/Comment out:**
   ```javascript
   let OPENAI_KEY = localStorage.getItem('ea_api_key') || '';
   
   function showApiModal() { ... }
   function closeApiModal() { ... }
   function saveApiKey() { ... }
   
   async function callAI(sys, user) {
     if (!OPENAI_KEY) { showApiModal(); throw new Error('No API key'); }
     const r = await fetch('https://api.openai.com/v1/chat/completions', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
       ...
     });
     ...
   }
   ```
   
   These functions are now provided by `client-integration.js`.

### Step 4: Start the Server

```powershell
npm start
```

You should see:
```
═══════════════════════════════════════════════════════
  🚀 AI Enterprise Architecture Platform Backend
═══════════════════════════════════════════════════════
  Server running on: http://localhost:3000
  API endpoint:      http://localhost:3000/api
  OpenAI Key:        ✓ Configured
═══════════════════════════════════════════════════════
```

### Step 5: Open Your Application

Open your browser and navigate to:
```
http://localhost:3000/EA%20Plattform/EA%2020%20Platform_BD_final_2.html
```

Or open the HTML file directly - it will connect to the backend server.

## 📖 How to Use

### Creating and Saving Models

1. **New Model**: Click "📄 New" to start fresh
2. **Enter Description**: Fill in your organization description
3. **Generate**: Click "Generate Architecture" and other buttons
4. **Save**: Click "💾 Save" and enter a model name
5. **Load**: Click "📂 Load" to see all saved models

### Database Location

Your models are stored in: `ea_models.db` in the project directory

### Export/Import

- **Export**: Creates a downloadable JSON file
- **Import**: Load JSON file (imported models are not automatically saved to DB)

## 🔐 Security Notes

- ✅ API key is stored in `.env` file (never committed to git)
- ✅ API key never sent to browser
- ✅ All OpenAI requests go through backend proxy
- ✅ Database is local on your machine

## 🛠️ Development Mode

For auto-restart on file changes:

```powershell
npm install -g nodemon
npm run dev
```

## 📁 Project Structure

```
CanvasApp/
├── server.js                 # Express backend server
├── database.js               # SQLite database operations
├── client-integration.js     # Frontend integration script
├── package.json              # Node dependencies
├── .env                      # Your configuration (NOT in git)
├── .env.example              # Configuration template
├── ea_models.db              # SQLite database (created automatically)
└── EA Plattform/
    └── EA 20 Platform_BD_final_2.html  # Your main application
```

## 🐛 Troubleshooting

### "Cannot find module" errors
```powershell
rm -r node_modules
npm install
```

### Port 3000 already in use
Change the PORT in `.env` file:
```
PORT=3001
```

Then update `API_BASE_URL` in `client-integration.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

### OpenAI API errors
- Check your API key in `.env`
- Ensure you have credits in your OpenAI account
- Check server console for detailed error messages

### Database errors
- Delete `ea_models.db` and restart server (will recreate database)

### CORS errors
- Make sure you're accessing the app through the server (http://localhost:3000)
- Or open HTML file directly (CORS is enabled for all origins)

## 📊 API Endpoints

### Health Check
```
GET /api/health
```

### Get All Models
```
GET /api/models
```

### Get Specific Model
```
GET /api/models/:id
```

### Save Model
```
POST /api/models
Body: { id?: number, name: string, data: object }
```

### Delete Model
```
DELETE /api/models/:id
```

### OpenAI Proxy
```
POST /api/openai/chat
Body: { model, messages, temperature }
```

## 🔄 Backup Your Data

To backup your models:
1. Copy `ea_models.db` to a safe location
2. Or use the Export function to save as JSON

## 📝 Notes

- The database file `ea_models.db` is automatically created on first run
- Models are saved with timestamps for version tracking
- API key is never exposed to the browser
- Server must be running for the application to work

## 🚀 Next Steps

- Set up automatic backups
- Add user authentication (if multi-user)
- Deploy to a remote server
- Add more AI models support

## 💡 Tips

- Save your work frequently using the Save button
- Export important models as JSON backup
- Keep your `.env` file secure
- Monitor server console for errors and logs

---

**Need Help?** Check the server console for detailed error messages.
