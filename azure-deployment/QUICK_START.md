# Quick Start: Azure Deployment Checklist

## ✅ Before You Start
- [ ] Azure account created (https://portal.azure.com)
- [ ] GitHub account with repository
- [ ] OpenAI API key ready from https://platform.openai.com/api-keys
- [ ] Domain nextgenea.se accessible (DNS settings)

## 🚀 Deployment Steps (5 minutes)

### 1. Create Azure Static Web App
```
Azure Portal → + Create Resource → Static Web App
- Name: ea-platform-static
- Region: North Europe
- Source: GitHub (your repo)
- App location: azure-deployment/static
- API location: azure-deployment/api
- Output location: .
```

### 2. Copy Your Files
Copy to `azure-deployment/static/`:
- All `.html` files
- `NexGenEA/` folder
- `EA2_Toolkit/` folder
- `css/` folder
- `js/` folder
- `data/` folder

### 3. Set Environment Variable
Azure Portal → Your Static Web App → Configuration → + Add:
- Key: `OPENAI_API_KEY`
- Value: Your OpenAI API key

### 4. Add Custom Domain
Azure Portal → Your Static Web App → Custom domains → + Add:
- Domain: `nextgenea.se`
- Get CNAME value from Azure
- Add CNAME record to your domain registrar

### 5. Push to GitHub
```bash
cd azure-deployment
git add .
git commit -m "Deploy to Azure Static Web Apps"
git push
```

## 📍 Access Your App
- **Live URL**: https://nextgenea.se
- **Staging URL**: https://[unique-id].azurestaticapps.net

## 🔒 API Security
- OpenAI API key stored in Azure Function (secure)
- Client-side JavaScript cannot access the key
- All requests routed through `/api/openai-proxy`

## 📊 Monitor
- GitHub Actions: Check deployment status
- Azure Portal: Monitor function execution
- Browser DevTools: Check API response

## ❌ Common Issues

| Issue | Solution |
|-------|----------|
| 404 on files | Copy files to `static/` folder |
| Function 500 error | Check `OPENAI_API_KEY` env var |
| Domain not working | DNS CNAME needs 15-30 min + verify in Azure |
| Build fails | Check `staticwebapp.config.json` paths |
