# Azure Deployment Guide - Static Web Apps + Azure Functions

## Overview
This deployment consists of:
- **Azure Static Web Apps**: Hosts your static HTML/CSS/JS files
- **Azure Function**: Securely proxies OpenAI API requests
- **Custom Domain**: nextgenea.se pointing to your Static Web App

---

## Prerequisites
1. Azure account (https://portal.azure.com)
2. GitHub account with the repository pushed
3. Your custom domain registered (nextgenea.se)

---

## Step 1: Create Azure Static Web App

### Via Azure Portal:
1. Go to https://portal.azure.com
2. Click **+ Create a resource**
3. Search for **"Static Web App"** and click it
4. Click **Create**

### Fill in the form:
- **Resource Group**: Create new: `ea-platform-resources`
- **Name**: `ea-platform-static` (or your preferred name)
- **Plan Type**: Free
- **Region**: North Europe (closest to Sweden)
- **Source**: GitHub
  - Click "Sign in with GitHub" and authorize
  - Select your repository
  - **Build presets**: Custom
  - **App location**: `azure-deployment/static`
  - **API location**: `azure-deployment/api`
  - **Output location**: `.` (current directory)

5. Click **Review + Create** → **Create**

Azure will create a GitHub Actions workflow automatically in `.github/workflows/`.

---

## Step 2: Prepare Static Files
Copy your static files to `azure-deployment/static/`:

```bash
# Include all HTML, CSS, JS, and assets
# Example structure:
azure-deployment/static/
  ├── index.html
  ├── css/
  │   ├── ea-design-engine.css
  │   └── ea-nordic-theme.css
  ├── js/
  │   ├── EA_Config.js
  │   ├── EA_DataManager.js
  │   └── ...
  ├── EA2_Toolkit/
  └── NexGenEA/
```

---

## Step 3: Copy Your Static Files

Copy these directories to `azure-deployment/static/`:
```bash
# From your project root:
copy NexGenEA\* azure-deployment\static\NexGenEA\
copy EA2_Toolkit\* azure-deployment\static\EA2_Toolkit\
copy css\* azure-deployment\static\css\
copy js\* azure-deployment\static\js\
copy *.html azure-deployment\static\
```

Make sure your HTML files include:
```html
<!-- Update API calls to use Azure Function -->
<script>
const API_BASE = '/api';
// Or use full URL: https://your-function-name.azurewebsites.net/api
</script>
```

---

## Step 4: Configure Azure Function

The Azure Function is already set up in `azure-deployment/api/openai-proxy/`

### Update your client-side code to call the Azure Function:

```javascript
// Instead of calling OpenAI directly, call your Azure Function
async function callOpenAI(messages) {
  try {
    const response = await fetch('/api/openai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
```

---

## Step 5: Set Environment Variables

After the Static Web App is created:

1. Go to **Azure Portal** → Your Static Web App resource
2. Click **Configuration** in the left menu
3. Click **+ Add** to add application settings:
   
   | Name | Value |
   |------|-------|
   | `OPENAI_API_KEY` | Your actual OpenAI API key from https://platform.openai.com/api-keys |

4. Click **Save**

---

## Step 6: Add Custom Domain (nextgenea.se)

### In Azure Portal:

1. Go to your Static Web App resource
2. Click **Custom domains** in the left menu
3. Click **+ Add**
4. Enter: `nextgenea.se`
5. Choose validation method: **CNAME**

### Update your domain DNS settings:

For your domain registrar (add CNAME record):
- **Type**: CNAME
- **Name**: `nextgenea`
- **Value**: Look in Azure Portal for the CNAME value provided, typically:
  `nextgenea.se.azurewebsites.net` or similar

Example for common registrars:
- **GoDaddy**: DNS Settings → Add CNAME
- **Namecheap**: Advanced DNS → Add CNAME Record
- **IIS**: Add DNS CNAME record

Wait 15-30 minutes for DNS propagation, then Azure will validate automatically.

---

## Step 7: Deploy

### Automatic Deployment (GitHub Actions):
1. Push your changes to GitHub:
```bash
git add .
git commit -m "Add Azure deployment files"
git push origin main
```

2. Azure will automatically build and deploy via GitHub Actions
3. Monitor deployment at: GitHub → Actions → See workflow status

### Manual Push if needed:
```bash
# Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows
az staticwebapp secrets list --name ea-platform-static --resource-group ea-platform-resources
```

---

## Step 8: Verify Deployment

1. Visit `https://nextgenea.se` (after domain is configured)
2. Or visit the staging URL: `https://[unique-name].azurestaticapps.net`
3. Check browser console for any errors
4. Test the OpenAI API call through the Azure Function

---

## Troubleshooting

### Azure Function returns 500 error
- **Check**: Environment variable `OPENAI_API_KEY` is set in Static Web App Configuration
- **Check**: API key is valid at https://platform.openai.com/api-keys

### Static files not loading (404 errors)
- **Check**: Files are in `azure-deployment/static/` folder
- **Check**: HTML file paths are relative: `./css/style.css` not `/css/style.css`

### Domain not working
- **Check**: DNS CNAME record is set correctly
- **Check**: Allow 15-30 minutes for DNS propagation
- **Check**: Azure Portal shows domain validation as "✓ Verified"

### Deployment fails in GitHub Actions
- **Check**: `.github/workflows/` file exists
- **Check**: App location and API location paths are correct
- **Check**: No build errors in GitHub Actions logs

---

## Important Files for Deployment

```
azure-deployment/
├── staticwebapp.config.json    ← Routing configuration
├── api/
│   ├── package.json            ← Azure Function dependencies
│   └── openai-proxy/
│       ├── function.json       ← Function metadata
│       └── index.js            ← OpenAI proxy implementation
└── static/                     ← Your static files go here
    ├── index.html
    ├── css/
    ├── js/
    └── ...
```

---

## Next Steps

1. ✅ Verify deployment is live
2. ✅ Test all functionality at nextgenea.se
3. ✅ Monitor Azure costs (Free tier for Static Web Apps)
4. ✅ Set up CI/CD monitoring in GitHub

---

## Resources

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Custom Domains Guide](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)
- [OpenAI API Documentation](https://platform.openai.com/docs)
