# Azure Deployment - NextGen EA Platform

Welcome! This folder contains everything needed to deploy your NextGen EA Platform to Azure Static Web Apps with secure OpenAI integration.

## 📋 Quick Navigation

**Just want to get started?** Start here (5 min read):
- → [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - One-page cheat sheet

**Comprehensive guide?** Start here (20 min read):
- → [COMPLETE_ACTION_PLAN.md](COMPLETE_ACTION_PLAN.md) - Full step-by-step plan

**Detailed guides for specific topics:**
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full technical guide
- [HTML_UPDATE_GUIDE.md](HTML_UPDATE_GUIDE.md) - How to update your HTML files
- [QUICK_START.md](QUICK_START.md) - Five-minute checklist

**Code & Configuration:**
- [AzureOpenAIProxy.js](AzureOpenAIProxy.js) - JavaScript proxy handler
- [CLIENT_API_EXAMPLE.js](CLIENT_API_EXAMPLE.js) - Example code snippets
- [github-workflow-template.yml](github-workflow-template.yml) - CI/CD workflow
- [staticwebapp.config.json](staticwebapp.config.json) - Azure Static Web App config

---

## 🎯 What This Does

### Problem
Your app currently:
- ❌ Stores OpenAI API key in browser (exposed!)
- ❌ Makes direct calls to OpenAI with exposed key
- ❌ Not accessible from the internet
- ❌ No scalability or reliability

### Solution
This deployment:
- ✅ Stores API key securely on Azure (never leaves servers)
- ✅ Routes all API calls through secure Azure Function proxy
- ✅ Makes app accessible worldwide at **https://nextgenea.se**
- ✅ Auto-scales with no configuration needed
- ✅ Enterprise-grade monitoring and logging
- ✅ Free tier for most use cases

---

## 📁 Structure

```
azure-deployment/
├── 📄 README.md                      ← You are here
├── 📄 COMPLETE_ACTION_PLAN.md        ← Start here (comprehensive)
├── 📄 QUICK_REFERENCE.md             ← Start here (quick)
├── 📄 DEPLOYMENT_GUIDE.md            ← Full technical guide
├── 📄 HTML_UPDATE_GUIDE.md           ← How to update HTML
├── 📄 QUICK_START.md                 ← 5-minute checklist
│
├── 🔧 AzureOpenAIProxy.js            ← Include in your HTML
├── 🔧 CLIENT_API_EXAMPLE.js          ← Code examples
├── 🔧 github-workflow-template.yml   ← GitHub Actions CI/CD
├── 🔧 staticwebapp.config.json       ← Azure Static Web App routing
│
├── 📂 static/                        ← Your app files go here
│   ├── index.html                   ← Landing page (included)
│   ├── [your HTML files will go here after copy]
│   ├── css/
│   ├── js/
│   ├── NexGenEA/
│   ├── EA2_Toolkit/
│   └── data/
│
└── 📂 api/                           ← Azure Function
    ├── package.json
    ├── openai-proxy/
    │   ├── function.json            ← Already configured
    │   └── index.js                 ← Already implemented
    └── [auto-deployed by Azure]
```

---

## 🚀 30-Second Overview

1. **Copy files** - Run `copy-files-to-azure.ps1`
2. **Update HTML** - Add Azure proxy, remove direct API calls (17 files)
3. **Push to GitHub** - `git push origin main`
4. **Create Azure Static Web App** - 3 clicks in Azure Portal
5. **Set API key** - Add `OPENAI_API_KEY` in Configuration
6. **Add custom domain** - DNS CNAME record + Azure Portal
7. **Done!** - Your app is live at `https://nextgenea.se`

**Total time: ~2 hours**

---

## ✅ Prerequisites Checklist

Before starting, verify you have:

- [ ] Azure account (free: https://azure.microsoft.com/free)
- [ ] GitHub account with repository (or create one)
- [ ] OpenAI API key (from https://platform.openai.com/api-keys)
- [ ] Domain registered: `nextgenea.se` (already have this ✓)
- [ ] Access to domain registrar DNS settings
- [ ] This repository cloned or downloaded locally

---

## 📖 Recommended Reading Order

### First Time Setup (Read in Order)
1. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 5 min overview
2. [COMPLETE_ACTION_PLAN.md](COMPLETE_ACTION_PLAN.md) - Full step-by-step
3. [HTML_UPDATE_GUIDE.md](HTML_UPDATE_GUIDE.md) - Code changes

### If You Need Additional Details
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Comprehensive guide with screenshots
- [CLIENT_API_EXAMPLE.js](CLIENT_API_EXAMPLE.js) - Code examples
- [AzureOpenAIProxy.js](AzureOpenAIProxy.js) - Implementation details

---

## 🔑 Key Files Explained

### AzureOpenAIProxy.js
This is your new API handler. Instead of:
```javascript
// OLD - Bad (key exposed):
fetch('https://api.openai.com/v1/chat/completions', {
  headers: {'Authorization': 'Bearer ' + OPENAI_KEY}
})

// NEW - Good (secure):
AzureOpenAIProxy.chat(messages, {model: 'gpt-3.5-turbo'})
```

### staticwebapp.config.json
Tells Azure:
- ✓ Where your app files are (`static/` folder)
- ✓ Where API functions are (`api/` folder)
- ✓ How to route requests
- ✓ Where to send SPA navigation fallbacks

### api/openai-proxy/index.js
This Azure Function:
- ✓ Receives requests from your browser
- ✓ Adds your secure OpenAI API key (stored in Azure)
- ✓ Calls OpenAI API
- ✓ Returns response to browser
- ✓ Logs everything for audit trail

---

## 🎯 Phase Details

### Phase 1: Local Preparation
- Copy your files to deployment directory
- Include the Azure proxy script

### Phase 2: Code Updates
- Update 17 HTML files to use Azure proxy
- Remove direct OpenAI calls
- Remove API key input fields

### Phase 3: GitHub
- Push changes to your repository
- GitHub Actions will trigger automatic deployment

### Phase 4: Azure Infrastructure
- Create Static Web App resource
- Set environment variables
- Configure custom domain

### Phase 5: Deployment
- Azure automatically builds and deploys
- Your app goes live
- DNS propagates (15-30 min)

### Phase 6: Verification
- Test all functionality
- Verify no API keys in browser
- Confirm API calls work through proxy

---

## 🔒 Security Improvements

### Before (Current - Insecure)
```
Browser → OpenAI (with your exposed API key) ❌
```

### After (With Azure Proxy - Secure)
```
Browser → Azure Function (no key) 
         → OpenAI (with secure server-side key) ✅
```

**Benefits:**
- API key never leaves Azure servers
- API key not visible in browser DevTools
- Requests logged and monitored
- Rate limiting and access control
- Audit trail for compliance

---

## 💰 Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Static Web App | FREE | Includes 100 GB/month bandwidth |
| Azure Functions | ~$0 - $20/month | Very generous free tier |
| Custom Domain | $0 | Bring your own (nextgenea.se) |
| **Total** | **FREE - $20/month** | Ideal for your use case |

---

## 🆘 Troubleshooting Quick Links

- **Git:** See DEPLOYMENT_GUIDE.md → Git Issues
- **Azure Portal:** See DEPLOYMENT_GUIDE.md → Azure Issues
- **HTML Updates:** See HTML_UPDATE_GUIDE.md → Common Patterns
- **API Errors:** See COMPLETE_ACTION_PLAN.md → Troubleshooting

---

## ❓ Common Questions

**Q: Do I need to know Azure CLI?**
A: No! Everything is done in the portal and GitHub. No CLI needed.

**Q: Will my app still work locally?**
A: Yes! Switch between local development and Azure with no code changes.

**Q: How long until it works?**
A: App is live in 10 minutes. Custom domain takes 15-30 min for DNS.

**Q: What if I break something?**
A: GitHub keeps history. Rollback by reverting commits. No data loss.

**Q: Can I keep the same app name?**
A: Yes! Use different staging/production deployments. See DEPLOYMENT_GUIDE.md.

---

## 📞 Next Steps

👉 **Ready to start?** 
- Open [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for the quick version
- Or [COMPLETE_ACTION_PLAN.md](COMPLETE_ACTION_PLAN.md) for the full guide

👉 **Have questions?**
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed explanations
- Review [HTML_UPDATE_GUIDE.md](HTML_UPDATE_GUIDE.md) for code patterns

👉 **Need examples?**
- See [CLIENT_API_EXAMPLE.js](CLIENT_API_EXAMPLE.js)
- Check [AzureOpenAIProxy.js](AzureOpenAIProxy.js) for implementation

---

## 🎉 Success!

Once deployed, your team can:
- ✅ Access your EA Platform at https://nextgenea.se
- ✅ Use all AI features securely
- ✅ No manual API key management
- ✅ Automatic scaling
- ✅ Azure monitoring and logging
- ✅ Enterprise-grade reliability

**Your platform will be production-ready!** 🚀

---

## 📊 Deployment Checklist Template

```
[ ] Verify prerequisites (Azure, GitHub, OpenAI key)
[ ] Run copy-files-to-azure.ps1
[ ] Update all 17 HTML files with Azure proxy
[ ] Push to GitHub
[ ] Create Static Web App in Azure Portal
[ ] Set OPENAI_API_KEY environment variable
[ ] Add custom domain CNAME in DNS
[ ] Verify GitHub Actions deployment (green ✓)
[ ] Test staging URL loads correctly
[ ] Test app functionality
[ ] Verify custom domain resolves
[ ] Test API calls through proxy
[ ] Deploy to production
```

---

**Version**: 1.0 | **Last Updated**: March 2026 | **Status**: Ready for Production 

For latest updates and support, see [COMPLETE_ACTION_PLAN.md](COMPLETE_ACTION_PLAN.md).
