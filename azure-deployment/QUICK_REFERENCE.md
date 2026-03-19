# ⚡ Azure Deployment Quick Reference

## 🎯 Phase 1: Copy Files (5 min)
```powershell
cd "C:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp"
.\copy-files-to-azure.ps1
```

## 🔧 Phase 2: Update HTML (17 files)
**Quick Edit - For Each HTML File:**

1. **Add proxy script** (in `<head>`):
   ```html
   <script src="../../AzureOpenAIProxy.js"></script>
   ```

2. **Find & Replace** (in `<script>` blocks):
   ```javascript
   // FIND:
   fetch('https://api.openai.com/v1/chat/completions', {
     headers: {'Authorization': 'Bearer ' + OPENAI_KEY}
   })
   
   // REPLACE:
   AzureOpenAIProxy.chat(messages, {model: 'gpt-3.5-turbo'})
   ```

3. **Remove API key input** (in HTML):
   ```html
   <!-- Remove this -->
   <input id="ai-api-key-input" type="password" placeholder="sk-...">
   
   <!-- Replace with -->
   <div class="bg-green-50 p-2 rounded">✓ API Secured</div>
   ```

**Files to Update (17 total):**
- [ ] NexGen_EA_V4.html
- [ ] EA_20_Transformation_Plattform.html
- [ ] EA 20 Platform*.html (all versions)
- [ ] EA2_Strategic_Tools.html
- [ ] AI Business Model Canvas.html
- [ ] AI Strategy Workbench V2.html + others
- [ ] Integration_Workflow_Hub.html
- [ ] TEST_SYNC_FLOW.html

## 📤 Phase 3: Push to GitHub
```powershell
git add azure-deployment/
git commit -m "Deploy to Azure with secure proxy"
git push origin main
```

## 🌐 Phase 4: Azure Portal (10 min)
1. Portal → + Create → Static Web App
2. Fill form:
   - Name: `ea-platform-static`
   - Region: North Europe
   - Source: GitHub
   - App location: `azure-deployment/static`
   - API location: `azure-deployment/api`
   - Output: `.`
3. Create → Wait 2-3 min

## 🔑 Phase 5: Environment Variable
1. Static Web App → Configuration
2. + Add: `OPENAI_API_KEY` = (your key)
3. Save

## 🌍 Phase 6: Custom Domain
1. Static Web App → Custom domains → + Add
2. Enter: `nextgenea.se`
3. Copy CNAME value from Azure
4. Go to domain registrar (GoDaddy, Namecheap, etc)
5. Add DNS CNAME Record:
   - Name: `nextgenea`
   - Value: (paste from Azure)
6. Wait 15-30 min for DNS

## ✅ Phase 7: Verify
1. GitHub → Actions → Wait for ✓
2. Visit staging: https://[id].azurestaticapps.net
3. After DNS: https://nextgenea.se
4. DevTools → Network → Test API call
5. No `openai.com` in network requests ✓

---

## 🆘 Emergency Fixes

**Files still going to openai.com?**
```powershell
# Search all HTML files for openai.com
Get-ChildItem "api-deployment\static" -Filter "*.html" -Recurse | 
  Select-String "openai.com"
# Update any found instances
```

**Azure Function returns 500?**
- Check: Azure Portal → Static Web App → Configuration
- Verify: `OPENAI_API_KEY` is set
- Update: If key is old/invalid

**Domain not working?**
- Check: Azure Portal shows "✓ Verified"
- Verify: DNS CNAME record is correct (nslookup nextgenea.se)
- Wait: DNS takes 15-30 min to propagate

**HTML files 404?**
- Check: Did copy script run successfully?
- Verify: Files exist in `azure-deployment/static/`
- Fix: Re-run `copy-files-to-azure.ps1`

---

## 📍 File Locations

```
azure-deployment/
├── static/              ← Your app loads from here
│   ├── index.html       ← Landing page
│   ├── *.html           ← All your platforms
│   ├── css/             ← Stylesheets
│   ├── js/              ← JavaScript modules
│   └── AzureOpenAIProxy.js
├── api/                 ← Azure Functions
│   ├── openai-proxy/
│   │   ├── function.json
│   │   └── index.js
│   └── package.json
├── AzureOpenAIProxy.js  ← Copy to static/
└── [guides].*           ← Documentation
```

---

## ✨ After Going Live

1. **Monitor**: Azure Portal → Dashboard
2. **Log access**: Check API calls in Functions logs
3. **Performance**: azurestaticapps.net is super fast
4. **Security**: No API keys exposed
5. **Scale**: Auto-scales - no config needed

---

## 📱 Contact Info You'll Need

- **Azure Portal**: portal.azure.com
- **GitHub**: github.com/[your-repo]
- **Domain Registrar**: Where you registered nextgenea.se
- **OpenAI**: platform.openai.com (for API key)

---

**Estimated time: 2 hours total** | **Difficulty: Medium** | **Risk: Low**

Your team can now access the full EA Platform securely at **https://nextgenea.se** 🎉
