# 🚀 Quick Start: First External User Test

**Date:** April 7, 2026  
**Objective:** Get your first external user testing the APM workflow in under 10 minutes

---

## ✅ What's Ready

All implementation files have been created:
- ✅ 5 Azure Functions (auth + storage)
- ✅ Login page with glassmorphism design
- ✅ Authentication library
- ✅ Admin panel for invite generation
- ✅ Test data (10 sample applications)
- ✅ Automated deployment script
- ✅ Complete test documentation

---

## 🎯 3-Step Deployment

### Step 1: Deploy to Azure (2 minutes)

```powershell
# Run the automated deployment script
.\deploy-multiuser.ps1
```

This will:
- Generate a secure admin key
- Add all files to git
- Commit and push to Azure
- Save configuration to `azure-deployment\DEPLOYMENT_CONFIG.txt`

### Step 2: Configure Azure (3 minutes)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Static Web Apps** → **Your App** → **Configuration**
3. Click **"Environment variables"** → **"Add"**
4. Add these 4 variables:

| Name | Value | 
|------|-------|
| `ADMIN_SECRET_KEY` | Copy from DEPLOYMENT_CONFIG.txt |
| `APP_BASE_URL` | `https://your-app-name.azurestaticapps.net` |
| `ea_invites_data` | `{}` |
| `ea_sessions_data` | `{}` |

5. Click **"Save"**

### Step 3: Generate Invite & Test (5 minutes)

**Option A: Using Admin Panel**
1. Open: `https://your-app-name.azurestaticapps.net/admin/invites.html`
2. Paste your `ADMIN_SECRET_KEY`
3. Enter test email: `test.user@company.com`
4. Click "Generate Invite Code"
5. Copy the invite link

**Option B: Using PowerShell**
```powershell
# Load your admin key
$adminKey = "YOUR_ADMIN_KEY_FROM_CONFIG_FILE"

# Generate invite
$body = @{
    email = "test.user@company.com"
    expiresInHours = 48
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "https://your-app-name.azurestaticapps.net/api/admin/create-invite" `
    -Method POST `
    -Headers @{
        "x-admin-key" = $adminKey
        "Content-Type" = "application/json"
    } `
    -Body $body

Write-Host "Invite Link: $($response.inviteLink)" -ForegroundColor Green
```

---

## 🧪 APM Test Workflow

### 1. Login Test
- Open the invite link (should auto-fill email + code)
- Click "Access Platform →"
- Should redirect to main app

### 2. Upload Test Data
- Navigate to: `/EA2_Toolkit/Application_Portfolio_Management.html`
- Click **"Import"** → Select `EA2_Toolkit/Import data/test_applications.json`
- Verify 10 applications appear

### 3. Manage Inventory
- View all applications in grid/card view
- Edit 2-3 applications (change status, criticality)
- Add 1 new application
- Delete 1 application

### 4. Export & Verify
- Click **"Export"** button
- Download JSON file
- Open in text editor
- Verify changes are included

### 5. Data Isolation Test
- Generate second invite for `user2@company.com`
- Login as second user
- Upload different data
- Verify first user's data is NOT visible

---

## ✅ Success Checklist

After testing, check these:

**Authentication:**
- [ ] Invite link works (auto-fills email + code)
- [ ] Login succeeds and redirects to app
- [ ] Invalid invite shows error
- [ ] Session persists on page refresh

**APM Workflow:**
- [ ] JSON upload works (10 apps visible)
- [ ] All views display correctly (grid, card, charts)
- [ ] Edit saves successfully
- [ ] New application creates
- [ ] Delete works
- [ ] Export generates correct JSON

**Data Isolation:**
- [ ] User 1 and User 2 have separate data
- [ ] Session expires after 7 days (or manual test)
- [ ] No cross-user data leakage

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `deploy-multiuser.ps1` | Automated deployment script |
| `TEST_APM_MULTIUSER_WORKFLOW.md` | Complete test documentation |
| `EA2_Toolkit/Import data/test_applications.json` | Sample test data (10 apps) |
| `azure-deployment/DEPLOYMENT_CONFIG.txt` | Your admin key (keep secure!) |
| `COMPLETE_IMPLEMENTATION_PACKAGE.md` | Technical implementation details |

---

## 🐛 Common Issues

**Issue:** Login button doesn't respond  
**Fix:** Check browser console (F12). Verify Azure Functions deployed (check GitHub Actions).

**Issue:** "Invalid invite code"  
**Fix:** Verify `ea_invites_data={}` is set in Azure environment variables.

**Issue:** Data doesn't persist after refresh  
**Fix:** Check browser console for API errors. Verify session token in sessionStorage.

**Issue:** Can't generate invite  
**Fix:** Verify `ADMIN_SECRET_KEY` matches between admin panel and Azure config.

---

## 📊 Performance Expectations

- **Login:** < 500ms
- **File Upload (5MB):** < 2s
- **Save Project:** < 300ms
- **Export:** < 1s

---

## 💰 Cost

**$0.00/month** - Stays in Azure free tier:
- 100 GB bandwidth/month
- 1 million function executions/month
- 5 GB storage

---

## 📞 Get Help

- **Test Guide:** `TEST_APM_MULTIUSER_WORKFLOW.md`
- **Implementation:** `COMPLETE_IMPLEMENTATION_PACKAGE.md`
- **Architecture:** `MULTI_USER_IMPLEMENTATION_GUIDE.md`

---

## 🎉 You're Ready!

Run `.\deploy-multiuser.ps1` to get started.

Deployment takes ~5 minutes total (3 min deploy + 2 min config).

Your first external user can start testing immediately after!
