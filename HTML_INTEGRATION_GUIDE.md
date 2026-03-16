# HTML Integration Guide

Follow these steps to integrate your HTML file with the backend.

## Step 1: Add Integration Script

In your HTML file `EA 20 Platform_BD_final_2.html`, find the `<head>` section and add this line **before** `</head>`:

```html
<script src="../client-integration.js"></script>
```

**Location:** Around line 10, before `</head>`

---

## Step 2: Update Header Buttons

### FIND (around lines 45-51):
```html
<div class="flex gap-2">
  <button onclick="showApiModal()" class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-600">⚙ API Key</button>
  <button onclick="exportModel()" class="bg-white text-slate-900 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50">↓ Export JSON</button>
  <label class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-600">↑ Import<input type="file" class="hidden" onchange="importModel(event)" accept=".json"></label>
</div>
```

### REPLACE WITH:
```html
<div class="flex gap-2">
  <button onclick="newModel()" class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-600">📄 New</button>
  <button onclick="saveModelToDB()" class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">💾 Save</button>
  <button onclick="loadModelFromDB()" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">📂 Load</button>
  <button onclick="exportModel()" class="bg-white text-slate-900 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50">↓ Export</button>
  <label class="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-600">↑ Import<input type="file" class="hidden" onchange="importModel(event)" accept=".json"></label>
</div>
```

---

## Step 3: Remove API Modal HTML

### FIND (around lines 54-65):
```html
<!-- API MODAL -->
<div id="apiModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center">
  <div class="bg-white rounded-2xl p-6 w-96 shadow-2xl">
    <h3 class="font-bold text-lg mb-1">OpenAI API Key</h3>
    <p class="text-xs text-slate-500 mb-4">Stored in your browser only. Never sent anywhere except OpenAI.</p>
    <input id="apiKeyInput" type="password" placeholder="sk-..." class="w-full border rounded-lg p-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400">
    <div class="flex gap-2">
      <button onclick="saveApiKey()" class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Save</button>
      <button onclick="closeApiModal()" class="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-bold text-sm">Cancel</button>
    </div>
  </div>
</div>
```

### REPLACE WITH:
```html
<!-- API MODAL - NO LONGER NEEDED (handled by backend) -->
```

---

## Step 4: Remove Old JavaScript Code

In the `<script>` section (around line 420+), **REMOVE OR COMMENT OUT** these sections:

### Remove API Key Storage:
```javascript
let OPENAI_KEY = localStorage.getItem('ea_api_key') || '';
```

### Remove API Modal Functions:
```javascript
function showApiModal() { ... }
function closeApiModal() { ... }
function saveApiKey() { ... }
```

### Remove Direct OpenAI Call (around line 588-600):
```javascript
async function callAI(sys, user) {
  if (!OPENAI_KEY) { showApiModal(); throw new Error('No API key'); }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], temperature: 0.3 })
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || 'API error'); }
  return (await r.json()).choices[0].message.content;
}
```

### Remove Export/Import Functions (around line 1346-1365):
```javascript
function exportModel() { ... }
function importModel(event) { ... }
```

### Remove Toast Function (if present):
```javascript
function toast(msg, err) { ... }
```

### Remove extractJSON Function (if separate):
```javascript
function extractJSON(text) { ... }
```

**NOTE:** All these functions are now provided by `client-integration.js`

---

## Quick Reference - What Changed?

| Old Behavior | New Behavior |
|-------------|-------------|
| API key in localStorage | API key in server .env file |
| Direct OpenAI API calls | Proxy through backend server |
| No persistence | SQLite database storage |
| Manual JSON export/import | Save/Load with database |
| Single model | Multiple named models |

---

## Verification Checklist

After making changes, verify:

- [ ] `client-integration.js` is referenced in `<head>`
- [ ] Header has New/Save/Load/Export/Import buttons
- [ ] API Modal HTML is removed/commented
- [ ] Old JavaScript functions are removed/commented
- [ ] Server starts without errors (`npm start`)
- [ ] Browser console shows no errors
- [ ] Can save and load models

---

## Need Help?

If you're unsure about any change:
1. Make a backup copy of your HTML file first
2. Search for the exact text shown in the "FIND" sections
3. Be careful with quotes and spacing
4. Check the browser console for errors

See [README.md](README.md) for more help.
