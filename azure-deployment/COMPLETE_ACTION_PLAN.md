# Complete Azure Deployment Action Plan

## 📋 Master Checklist

This document provides a complete step-by-step action plan to get your app live at **https://nextgenea.se** with secure OpenAI integration.

---

## ✅ PHASE 1: Local Setup & File Preparation (15 minutes)

### 1.1 Copy Files to Deployment Directory
Run one of these commands from your project root:

**Option A - PowerShell (Recommended for Windows):**
```powershell
cd C:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp
.\copy-files-to-azure.ps1
```

**Option B - Command Prompt:**
```cmd
cd C:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp
copy-files-to-azure.cmd
```

**What this does:**
- ✓ Copies all HTML files to `azure-deployment/static/`
- ✓ Copies NexGenEA, EA2_Toolkit, css, js folders
- ✓ Copies data, scripts, and e2e-artifacts

### 1.2 Verify Files Copied Correctly
```powershell
# List files in deployment directory
Get-ChildItem "azure-deployment/static" -Recurse | Select-Object Name | measure
# Should see ~17 HTML files + all folders
```

### 1.3 Copy Azure Proxy Script
```powershell
Copy-Item "azure-deployment/AzureOpenAIProxy.js" "azure-deployment/static/AzureOpenAIProxy.js" -Force
Copy-Item "azure-deployment/AzureOpenAIProxy.js" "azure-deployment/static/js/AzureOpenAIProxy.js" -Force
```

✅ **Checkpoint**: All files are now in `azure-deployment/static/`

---

## ✅ PHASE 2: Update HTML Files (30-60 minutes)

**Required for all 17 HTML files listed below.**

### Files to Update:
**NexGenEA/ folder (8 files):**
1. NexGen_EA_V4.html
2. EA_20_Transformation_Plattform.html
3. EA 20 Platform.html
4. EA 20 Platform_BD_final.html
5. EA 20 Platform_BD_phase2.html
6. EA 20 Platform_BD_phase3.html
7. EA 20 Platform_BD_phase4.html
8. EA 20 Platform_V3_Integrated_C.html

**EA2_Toolkit/ folder (6 files):**
9. EA2_Strategic_Tools.html
10. AI Business Model Canvas.html
11. AI Strategy Workbench V2.html
12. AI Capability Mapping V2.html
13. AI Value Chain Analyzer V2.html
14. EA20 Maturity Toolbox V2.html

**Root folder (3 files):**
15. Integration_Workflow_Hub.html
16. EA 20 Platform_BD_final_2.html
17. TEST_SYNC_FLOW.html

### For Each HTML File:

#### Step 1: Add Azure Proxy Script
In the `<head>` section, add after other scripts:
```html
<script src="../AzureOpenAIProxy.js"></script>
```

**For subdirectories**, use appropriate path:
- NexGenEA files: `<script src="../../AzureOpenAIProxy.js"></script>`
- EA2_Toolkit files: `<script src="../../AzureOpenAIProxy.js"></script>`

#### Step 2: Find & Replace OpenAI Calls

**Search for:**
```javascript
fetch('https://api.openai.com/v1/chat/completions'
```

**Create this helper function** (add to `<script>` block):
```javascript
// Azure OpenAI Proxy - Drop-in replacement for direct OpenAI calls
async function callOpenAISecure(messages, options = {}) {
  const { model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 } = options;
  
  try {
    return await AzureOpenAIProxy.chat(messages, { model, temperature, max_tokens });
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

**Then replace:**
```javascript
// OLD CODE - Search and replace all instances:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
});

// NEW CODE:
const response = await callOpenAISecure(messages, {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  max_tokens: 1000
});
```

#### Step 3: Remove API Key Input
Find this:
```html
<label class="text-[10px] text-slate-600 font-semibold block mb-1">OpenAI API Key</label>
<input id="ai-api-key-input" type="password" placeholder="sk-..." ...>
```

Replace with:
```html
<div class="bg-green-50 border border-green-200 rounded p-2 text-xs">
  <i class="fas fa-check-circle text-green-600 mr-1"></i>
  <strong>✓ API Secured</strong> - Azure proxy active
</div>
```

#### Step 4: Update Error Checks
Remove:
```javascript
if (!OPENAI_KEY) {
  alert('Please enter your OpenAI API key');
  return;
}
```

These checks are no longer needed.

### 2.1 Quick Update Summary
See **[HTML_UPDATE_GUIDE.md](HTML_UPDATE_GUIDE.md)** for detailed patterns and examples.

✅ **Checkpoint**: All 17 HTML files updated with Azure proxy calls

---

## ✅ PHASE 3: GitHub Setup (5 minutes)

### 3.1 Initialize/Update Git Repository
```powershell
# If not already a git repo:
git init

# Add origin if needed:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Add all changes:
git add azure-deployment/
git add copy-files-to-azure.*
git status  # Verify changes
```

### 3.2 Commit Changes
```powershell
git commit -m "Prepare Azure deployment with secure OpenAI proxy

- Add azure-deployment directory structure
- Create Azure Function for OpenAI proxy
- Update all 17 HTML files for secure API integration
- Add staticwebapp.config.json for routing
- Add copy scripts for file deployment"

git push origin main
```

✅ **Checkpoint**: Code pushed to GitHub

---

## ✅ PHASE 4: Azure Portal Setup (10 minutes)

### 4.1 Create Static Web App
1. Go to **https://portal.azure.com**
2. Click **+ Create a resource**
3. Search for **"Static Web App"** → Click it → **Create**

### 4.2 Fill Configuration Form

| Field | Value |
|-------|-------|
| **Resource Group** | Create new: `ea-platform-resources` |
| **Name** | `ea-platform-static` |
| **Plan** | Free |
| **Region** | North Europe (Sweden) |
| **Source** | GitHub |
| **Authorization** | Click "Sign in with GitHub" |
| **Organization** | Select your account |
| **Repository** | Select your repo |
| **Branch** | main |
| **Build Presets** | Custom |
| **App location** | `azure-deployment/static` |
| **API location** | `azure-deployment/api` |
| **Output location** | `.` (dot) |

### 4.3 Create Resource
- Click **Review + Create**
- Click **Create**
- Wait for deployment (2-3 minutes)

✅ **Checkpoint**: Static Web App created in Azure

---

## ✅ PHASE 5: Set Environment Variables (2 minutes)

### 5.1 Configure API Key
1. Go to your Static Web App resource in Azure Portal
2. Click **Configuration** (left sidebar)
3. Click **+ Add** (Application settings)
4. Add new setting:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your actual OpenAI API key from https://platform.openai.com/api-keys
5. Click **Save**

⚠️ **Copy your OpenAI API key:**
- Visit https://platform.openai.com/api-keys
- Create new or copy existing key
- Paste into Azure Portal

✅ **Checkpoint**: Environment variables configured

---

## ✅ PHASE 6: Configure Custom Domain (10 minutes)

### 6.1 Add Domain in Azure
1. Your Static Web App resource → **Custom domains** (left sidebar)
2. Click **+ Add**
3. Enter: `nextgenea.se`
4. Choose validation: **CNAME**
5. Azure will show you a CNAME value (copy it)

Example CNAME value:
```
nextgenea.se.azurestaticapps.net
```

### 6.2 Update Domain DNS
Go to your domain registrar (GoDaddy, Namecheap, etc.):

1. Find **DNS Management** or **Advanced DNS**
2. Add a **CNAME Record**:
   - **Type**: CNAME
   - **Name**: `nextgenea` (or leave as @)
   - **Value**: (paste the CNAME value from Azure)
   - **TTL**: 3600
3. Save/Apply changes

⏱️ **Wait 15-30 minutes** for DNS propagation

### 6.3 Verify Domain
In Azure Portal → Custom domains:
- You should see: `✓ nextgenea.se` with status "Verified"

✅ **Checkpoint**: Custom domain configured and verified

---

## ✅ PHASE 7: Automatic Deployment Verification (5 minutes)

Azure Static Web Apps automatically deploys your code via GitHub Actions.

### 7.1 Check Deployment Status
1. Go to GitHub → Your repository → **Actions** tab
2. Look for workflow: "Build and Deploy Job"
3. Wait for ✅ (all green checkmarks)

If deployment fails:
- Click the workflow to see logs
- Common issues: Path incorrect, file missing
- Fix and push again: `git push origin main`

### 7.2 Access Your App
After deployment succeeds:
- **Production**: https://nextgenea.se (after DNS verified)
- **Staging**: https://YOUR_ID.azurestaticapps.net (immediate)

### 7.3 Test Everything
1. Open the staging URL in browser
2. Navigate to each platform
3. Make a test API call
4. Verify:
   - ✓ Files load correctly (no 404 errors)
   - ✓ Application runs without errors
   - ✓ API calls work (check DevTools → Network)

✅ **Checkpoint**: App deployed and tested

---

## 🎯 FINAL VERIFICATION CHECKLIST

Before going live:

- [ ] All 17 HTML files updated with AzureOpenAIProxy
- [ ] Files copied to `azure-deployment/static/`
- [ ] Code pushed to GitHub
- [ ] Static Web App created in Azure Portal
- [ ] OPENAI_API_KEY environment variable set
- [ ] Custom domain CNAME record added to DNS
- [ ] GitHub Actions deployment shows ✓ (green)
- [ ] Staging URL (azurestaticapps.net) loads correctly
- [ ] Production URL (nextgenea.se) loads correctly
- [ ] API calls working (no console errors)
- [ ] No OPENAI_KEY visible in Network tab
- [ ] All platforms accessible and functional

---

## 📊 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| 404 on static files | Files not in `azure-deployment/static/` - re-run copy script |
| Azure Function 500 error | Check OPENAI_API_KEY is set in Configuration |
| Domain not working | DNS CNAME record may need 30 minutes to propagate; verify it's set correctly |
| Deployment failed in GitHub | Check GitHub Actions log for specific error; common: wrong paths |
| Cannot find AzureOpenAIProxy | Script path incorrect - check relative paths match file locations |
| API key still exposed | Search all HTML for `openai.com` - may have missed some calls |

---

## 📞 Time Estimate

| Phase | Duration |
|-------|----------|
| Phase 1: File Prep | 15 min |
| Phase 2: HTML Updates | 30-60 min |
| Phase 3: GitHub | 5 min |
| Phase 4: Azure Portal | 10 min |
| Phase 5: Environment Vars | 2 min |
| Phase 6: Custom Domain | 10 min + 15-30 min DNS |
| Phase 7: Verification | 5 min |
| **Total** | **1.5 - 2 hours** |

---

## 🎉 Success Criteria

✅ Your app is ready when:

1. ✓ **Accessible**: https://nextgenea.se loads instantly
2. ✓ **Secure**: No API keys visible in browser
3. ✓ **Functional**: All platforms work correctly
4. ✓ **AI-Enabled**: OpenAI API calls work through Azure proxy
5. ✓ **Monitored**: Azure logs all API usage
6. ✓ **Scalable**: Infrastructure auto-scales with traffic

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Full detailed guide |
| [QUICK_START.md](QUICK_START.md) | 5-minute checklist |
| [HTML_UPDATE_GUIDE.md](HTML_UPDATE_GUIDE.md) | HTML code changes |
| [CLIENT_API_EXAMPLE.js](CLIENT_API_EXAMPLE.js) | Code examples |
| [AzureOpenAIProxy.js](AzureOpenAIProxy.js) | API proxy implementation |

---

## 🚀 Next Steps After Launch

1. **Monitor**: Check Azure Dashboard for usage metrics
2. **Test**: Verify all AI features work as expected
3. **Optimize**: Adjust Azure Function instance size if needed
4. **Backup**: Ensure your data is being exported regularly
5. **Security**: Review Azure security best practices
6. **Scaling**: Plan for increased load as users grow

---

## ❓ Need Help?

1. Check the troubleshooting section above
2. Review the detailed [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. Check [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
4. Verify your Azure Function Configuration has OPENAI_API_KEY set

**Good luck! 🎯**

Your NextGen EA Platform will soon be live at **https://nextgenea.se** with enterprise-grade security.
