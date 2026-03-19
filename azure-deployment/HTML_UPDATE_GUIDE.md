# HTML Update Guide - Azure OpenAI Proxy Integration

## Overview
Your HTML files currently make direct calls to OpenAI's API using your API key exposed in the browser. This guide helps you update them to use the secure Azure Function proxy instead.

## ⚠️ Security Issue - What's Changing

### BEFORE (Insecure - Current)
```javascript
// API key stored in browser (exposed!)
let OPENAI_KEY = localStorage.getItem('ea_api_key');

// Direct API call with key in Authorization header
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': 'Bearer ' + OPENAI_KEY  // ❌ KEY EXPOSED!
  }
});
```

**Risks:**
- API key visible in browser DevTools Network tab
- Key stored in localStorage (accessible to any script)
- If website is compromised, all API keys are exposed
- Anyone can inspect the key and use your quota

### AFTER (Secure - Azure Proxy)
```javascript
// No API key in browser
// All requests go through Azure Function

const response = await AzureOpenAIProxy.chat(messages, {
  model: 'gpt-3.5-turbo',
  temperature: 0.7
});
```

**Benefits:**
- API key never leaves Azure servers
- Client never sees the key
- Key stored securely in Azure Function configuration
- Requests logged and monitored on Azure side
- Rate limiting and access control on server

---

## 🔧 Step-by-Step Update Process

### Step 1: Add the Azure Proxy Script
In the `<head>` section of your HTML files, add:

```html
<head>
    <!-- ... existing head content ... -->
    
    <!-- Add this line for Azure OpenAI proxy -->
    <script src="../AzureOpenAIProxy.js"></script>
</head>
```

**For files in subdirectories** (like NexGenEA/):
```html
<script src="../../AzureOpenAIProxy.js"></script>
```

**For files in EA2_Toolkit/**:
```html
<script src="../../AzureOpenAIProxy.js"></script>
```

---

### Step 2: Remove API Key Input from UI
Find and remove or hide the OpenAI API key input field.

**Find this code:**
```html
<label class="text-[10px] text-slate-600 font-semibold block mb-1">OpenAI API Key</label>
<input id="ai-api-key-input" type="password" class="w-full text-[11px] border rounded p-1.5" 
       placeholder="sk-..." oninput="OPENAI_KEY=this.value.trim()">
```

**Replace with:**
```html
<div class="bg-green-50 border border-green-200 rounded p-2 text-xs">
    <i class="fas fa-check-circle text-green-600 mr-1"></i>
    <strong>API Configured</strong> - Using secure Azure proxy
</div>
```

---

### Step 3: Update OpenAI API Calls

#### FIND - Direct OpenAI calls
```javascript
// Search for this pattern in your JavaScript:
await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + OPENAI_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000
  })
})
```

#### REPLACE WITH - Azure Proxy
```javascript
// Use the secure Azure proxy
try {
  const response = await AzureOpenAIProxy.chat(messages, {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1000
  });
  
  // Response has same format as OpenAI API
  const content = response.choices[0].message.content;
  // Continue with your processing...
} catch (error) {
  console.error('API Error:', error.message);
  showErrorMessage('Failed to process request: ' + error.message);
}
```

---

### Step 4: Update Error Handling

#### OLD - Check for API key
```javascript
if (!OPENAI_KEY) {
  alert('Please enter your OpenAI API key');
  return;
}
```

#### NEW - No API key check needed
```javascript
// Just try to make the call - Azure Function handles authentication
try {
  const response = await AzureOpenAIProxy.chat(messages);
  // Process response
} catch (error) {
  if (error.message.includes('500')) {
    alert('API configuration error - please contact admin');
  } else {
    alert('Request failed: ' + error.message);
  }
}
```

---

## 📝 Common API Call Patterns to Update

### Pattern 1: Simple Chat
```javascript
// OLD
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json'},
  body: JSON.stringify({model: 'gpt-3.5-turbo', messages})
});
const data = await response.json();

// NEW
const data = await AzureOpenAIProxy.chat(messages, {model: 'gpt-3.5-turbo'});
```

### Pattern 2: With Timeout
```javascript
// OLD
const response = await Promise.race([
  fetch('https://api.openai.com/v1/chat/completions', {...}),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
]);

// NEW
const data = await AzureOpenAIProxy.chat(messages, {timeout: 30000});
```

### Pattern 3: Error Handling
```javascript
// OLD
if (!OPENAI_KEY) throw new Error('No API key');
try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {'Authorization': 'Bearer ' + OPENAI_KEY}
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch (error) {...}

// NEW
try {
  const data = await AzureOpenAIProxy.chat(messages);
} catch (error) {
  console.error('API Error:', error.message);
  // Error handling - same for all errors
}
```

---

## 🔍 Files to Update

Based on your repository, update these files:

### NexGenEA/ Platform (Update All)
- [ ] NexGen_EA_V4.html
- [ ] EA_20_Transformation_Plattform.html
- [ ] EA 20 Platform.html
- [ ] EA 20 Platform_BD_final.html
- [ ] EA 20 Platform_BD_phase2.html
- [ ] EA 20 Platform_BD_phase3.html
- [ ] EA 20 Platform_BD_phase4.html
- [ ] EA 20 Platform_V3_Integrated_C.html

### EA2_Toolkit/ (Update All)
- [ ] EA2_Strategic_Tools.html
- [ ] AI Business Model Canvas.html
- [ ] AI Strategy Workbench V2.html
- [ ] AI Capability Mapping V2.html
- [ ] AI Value Chain Analyzer V2.html
- [ ] EA20 Maturity Toolbox V2.html

### Root Files (Update All)
- [ ] Integration_Workflow_Hub.html
- [ ] EA 20 Platform_BD_final_2.html
- [ ] TEST_SYNC_FLOW.html

---

## ✅ Verification Checklist

After updating each HTML file:

- [ ] Added `<script src="../../AzureOpenAIProxy.js"></script>` (or correct path)
- [ ] Removed API key input field or replaced with status message
- [ ] Updated all `fetch('https://api.openai.com/...` calls to `AzureOpenAIProxy.chat(...)`
- [ ] Removed all `OPENAI_KEY` references from fetch headers
- [ ] Updated error handling to not check for missing API key
- [ ] File still loads correctly (no JavaScript errors in console)
- [ ] Test API call works (should see request to `/api/openai-proxy`)

---

## 🧪 Testing Locally

Before deploying to Azure:

1. **Ensure server.js is running:**
   ```bash
   npm install
   npm start
   ```
   This provides `/api/openai/chat` endpoint locally

2. **Set environment variable:**
   ```bash
   # Windows PowerShell
   $env:OPENAI_API_KEY = 'your-key-here'
   npm start
   
   # Or create .env file
   OPENAI_API_KEY=your-key-here
   npm start
   ```

3. **Open HTML file locally:**
   - Visit `http://localhost:3000/NexGenEA/NexGen_EA_V4.html`
   - Open DevTools → Network tab
   - Make an API call
   - Verify request goes to `/api/openai/chat` (NOT openai.com)
   - API key should NOT appear in request headers

---

## 🚀 Azure Deployment

After updating all HTML files:

1. **Copy files to deployment directory:**
   ```bash
   # Run the copy script
   .\copy-files-to-azure.ps1
   ```

2. **Copy the Azure proxy script:**
   ```bash
   copy AzureOpenAIProxy.js azure-deployment\static\AzureOpenAIProxy.js
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update HTML for Azure secure OpenAI proxy"
   git push
   ```

4. **Check deployment:**
   - Go to https://nextgenea.se
   - Azure automatically deploys changes
   - Test every platform to verify API calls work

---

## 🆘 Troubleshooting

### "AzureOpenAIProxy is not defined"
- **Issue**: Script not loaded
- **Fix**: Check `<script src="../../AzureOpenAIProxy.js"></script>` path is correct
- **Test**: Open DevTools → Console → type `AzureOpenAIProxy`

### "API error: 500"
- **Issue**: Azure Function environment variable not set
- **Fix**: Go to Azure Portal → Function App → Configuration → Check OPENAI_API_KEY is set

### "API error: 401 Unauthorized"
- **Issue**: API key in Azure is invalid or expired
- **Fix**: Update API key in Azure Portal Configuration

### Requests still going to openai.com
- **Issue**: Old code not fully updated
- **Fix**: Search all HTML files for `fetch('https://api.openai.com`
- **Replace**: With `await AzureOpenAIProxy.chat(messages, {...})`

### "Request failed: Cannot POST /api/openai-proxy"
- **Issue**: Running locally but Azure Function not built
- **Fix**: Ensure you're using `/api/openai/chat` locally (different endpoint)
- **Note**: Local dev uses Express server, production uses Azure Function

---

## 📚 Reference

**AzureOpenAIProxy API:**

```javascript
// Basic chat
const response = await AzureOpenAIProxy.chat(messages);

// With options
const response = await AzureOpenAIProxy.chat(messages, {
  model: 'gpt-4',           // or 'gpt-3.5-turbo'
  temperature: 0.7,         // 0-2
  max_tokens: 1000,         // max response length
  timeout: 30000            // ms before timeout
});

// Streaming (if implemented)
await AzureOpenAIProxy.chatStream(
  messages,
  (chunk) => console.log(chunk),  // Called for each chunk
  { model: 'gpt-3.5-turbo' }
);
```

---

## 🎯 Summary

✅ **After updating:**
- All API calls go through Azure Function
- API key is secure on Azure servers
- No client-side key exposure
- Same API response format (drop-in replacement)
- Works identically for end users
- Better security, logging, and monitoring

**Questions? Check:**
- [AzureOpenAIProxy.js](../AzureOpenAIProxy.js) - Implementation details
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Deployment steps
- [CLIENT_API_EXAMPLE.js](../CLIENT_API_EXAMPLE.js) - Code examples
