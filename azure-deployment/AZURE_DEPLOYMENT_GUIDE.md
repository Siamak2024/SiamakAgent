# 🚀 Azure Deployment Guide - Secured Version

## ✅ What Has Been Secured for Azure

Your Azure deployment now includes:

### Azure Functions (Backend API)
- ✅ **Authentication Required** on OpenAI proxy
- ✅ **Rate Limiting** (100 requests/minute per user)
- ✅ **Restricted CORS** (only your domain)
- ✅ **User Data Isolation** (existing - already implemented)
- ✅ **Session Token Validation**

### Static Web App (Frontend)
- ✅ **Security Status Badge** added to dashboard
- ✅ **Login page** (auth/login.html)
- ✅ **Client authentication library** (client-auth-example.js)
- ✅ **Security checker** (EA_SecurityChecker.js)

---

## 🚀 Quick Deploy to Azure (5 Steps)

### Step 1: Configure Environment Variables in Azure Portal (5 minutes)

1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Select: **Static Web Apps** → Your App → **Configuration**

2. **Add/Update these Environment Variables:**

   ```plaintext
   OPENAI_API_KEY = sk-your-actual-openai-key-here
   ADMIN_SECRET_KEY = <generate-using-command-below>
   ALLOWED_ORIGINS = https://white-cliff-010e13b10.2.azurestaticapps.net
   APP_BASE_URL = https://white-cliff-010e13b10.2.azurestaticapps.net
   ea_invites_data = {}
   ea_sessions_data = {}
   ```

3. **Generate New Admin Secret:**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use it for `ADMIN_SECRET_KEY`

4. **Click "Save"** at the top of the Configuration page

### Step 2: Commit and Push Secured Code (2 minutes)

```powershell
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add enterprise security: authentication, rate limiting, CORS protection, security badge"

# Push to Azure
git push origin main
```

### Step 3: Monitor Deployment (3-5 minutes)

1. **Check GitHub Actions:**
   - Go to your repository on GitHub
   - Click "Actions" tab
   - Watch the deployment workflow

2. **Wait for completion:**
   - Green checkmark = Success
   - Red X = Failed (check logs)

### Step 4: Verify Security (2 minutes)

1. **Open your Azure app:**
   ```
   https://white-cliff-010e13b10.2.azurestaticapps.net/NexGenEA/EA2_Toolkit/EA_Growth_Dashboard.html
   ```

2. **Check the security badge:**
   - Should show **🛡️ GREEN** badge "Secured"
   - Click badge to see security score: **100%**

3. **Test authentication:**
   - Open browser console (F12)
   - Run: `fetch('/api/openai-proxy', {method: 'POST', body: '{}'})`
   - Should return **401 Unauthorized** ✅

### Step 5: Create First User (1 minute)

You need to generate an invite code to create the first user.

**Option A: Use PowerShell Script**
```powershell
.\generate-invite.ps1 -email "your@email.com"
```

**Option B: Manual API Call**
```powershell
$adminKey = "YOUR_ADMIN_SECRET_KEY"
$body = @{
    email = "your@email.com"
    expiresInHours = 48
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://white-cliff-010e13b10.2.azurestaticapps.net/api/admin/create-invite" -Headers @{"x-admin-key"=$adminKey; "Content-Type"="application/json"} -Body $body
```

This will return an invite link. Open it to login!

---

## 📋 Deployment Checklist

Before deploying:

- [ ] Generated new `ADMIN_SECRET_KEY`
- [ ] Updated all Azure environment variables
- [ ] Committed all security changes
- [ ] Pushed to GitHub
- [ ] Verified GitHub Actions deployment succeeded
- [ ] Checked security badge shows green
- [ ] Tested authentication requirement
- [ ] Generated first invite code
- [ ] Successfully logged in

---

## 🔍 What Changed in Azure Functions

### openai-proxy/index.js
**Before:**
```javascript
authLevel: "anonymous"  // Anyone could call it
'Access-Control-Allow-Origin': '*'  // Open to all domains
// No authentication check
```

**After:**
```javascript
// Authentication required
const session = verifySessionToken(token);

// Rate limiting
checkRateLimit(userId);

// Restricted CORS
'Access-Control-Allow-Origin': corsOrigin  // Only your domain
```

### All Azure Functions
- ✅ Changed CORS from `*` to specific origins
- ✅ Added credential support for authenticated requests
- ✅ Logging for security events

---

## 🧪 Testing Your Deployment

### Test 1: Verify Authentication is Required

**Browser Console:**
```javascript
// Try to call API without auth - should fail
fetch('https://white-cliff-010e13b10.2.azurestaticapps.net/api/openai-proxy', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({input: 'test'})
})
.then(r => r.json())
.then(d => console.log(d));

// Expected: 401 Unauthorized ✅
```

### Test 2: Verify CORS Protection

**From a Different Domain:**
```javascript
// Open console on any other website
fetch('https://white-cliff-010e13b10.2.azurestaticapps.net/api/openai-proxy')

// Expected: CORS error (blocked) ✅
```

### Test 3: Verify Rate Limiting

**Browser Console on Your App:**
```javascript
// Make 150 rapid requests
for(let i=0; i<150; i++) {
  fetch('/api/openai-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('ea_session_token')
    },
    body: JSON.stringify({input: 'test'})
  }).then(r => console.log(i, r.status));
}

// Expected: After ~100 requests, returns 429 Too Many Requests ✅
```

### Test 4: Verify Security Badge

1. Open dashboard
2. Badge should show **🛡️ Secured (Green)**
3. Click badge → Security Score: **100%**
4. All 5 features should be checked ✅

---

## ⚙️ Azure Configuration Details

### Required Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI API access | `sk-proj-...` |
| `ADMIN_SECRET_KEY` | Admin operations | `a3f2d8b...` (64 chars) |
| `ALLOWED_ORIGINS` | CORS whitelist | `https://your-app.azurestaticapps.net` |
| `APP_BASE_URL` | Base URL for links | `https://your-app.azurestaticapps.net` |
| `ea_invites_data` | Invite storage | `{}` |
| `ea_sessions_data` | Session storage | `{}` |

### Optional Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `RATE_LIMIT_MAX_REQUESTS` | Max requests/min | `100` |
| `SESSION_EXPIRY_DAYS` | Session duration | `7` |

---

## 🔧 Troubleshooting

### Issue: Deployment Failed

**Check:**
1. GitHub Actions logs for errors
2. Azure Portal → Static Web Apps → Deployment History
3. Function code syntax errors

**Fix:**
```powershell
# Check for syntax errors locally
npm install
node -c azure-deployment/api/openai-proxy/index.js
```

### Issue: Security Badge Shows Red

**Possible Causes:**
1. Environment variables not set in Azure
2. Deployment hasn't completed yet
3. Old cached files in browser

**Fix:**
```powershell
# Hard refresh browser
Ctrl + Shift + R

# Or clear cache
Ctrl + Shift + Delete
```

### Issue: 401 Unauthorized Error

**Possible Causes:**
1. Not logged in
2. Session expired
3. Invalid invite code

**Fix:**
1. Go to: `/auth/login.html`
2. Generate new invite code
3. Login with email + invite code

### Issue: CORS Errors

**Possible Causes:**
1. `ALLOWED_ORIGINS` not set correctly
2. Wrong domain in environment variable

**Fix:**
```plaintext
# In Azure Portal, update ALLOWED_ORIGINS to include your domain:
ALLOWED_ORIGINS = https://white-cliff-010e13b10.2.azurestaticapps.net,http://localhost:3000
```

### Issue: Rate Limit Triggered

**Expected Behavior:**
- Shows "429 Too Many Requests" after 100 requests/minute

**Fix:**
- Wait 1 minute
- Or adjust `RATE_LIMIT_MAX_REQUESTS` in Azure config

---

## 📊 Security Monitoring

### View Azure Logs

1. **Application Insights:**
   - Azure Portal → Your Static Web App → Application Insights
   - Check for:
     - Failed authentication attempts
     - Rate limit violations
     - CORS blocked requests

2. **Function Logs:**
   - Azure Portal → Function App → Log Stream
   - Monitor real-time security events

### Security Events to Monitor

- **401 errors** = Unauthorized access attempts
- **429 errors** = Rate limiting active
- **CORS errors** = Cross-domain attack attempts
- **Invalid tokens** = Potential security threats

---

## 🔄 Updating After Deployment

### To Deploy New Changes:

```powershell
# 1. Make changes to code
# 2. Test locally
npm start

# 3. Commit and push
git add .
git commit -m "Your update message"
git push origin main

# 4. Wait for auto-deployment (3-5 min)
```

### To Update Environment Variables:

1. Azure Portal → Static Web Apps → Configuration
2. Edit variable
3. Click "Save"
4. **No redeployment needed** - takes effect immediately

### To Rotate Secrets:

```powershell
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Azure Portal
# All existing sessions will be invalidated
```

---

## 🌐 Production Best Practices

### 1. Custom Domain (Recommended)

```plaintext
# Instead of: white-cliff-010e13b10.2.azurestaticapps.net
# Use: ea-platform.yourcompany.com
```

**Setup:**
1. Azure Portal → Static Web Apps → Custom domains
2. Add custom domain
3. Update `ALLOWED_ORIGINS` and `APP_BASE_URL`

### 2. Azure Key Vault Integration

**For Production:**
```plaintext
# Store secrets in Key Vault instead of environment variables
@Microsoft.KeyVault(SecretUri=https://your-vault.vault.azure.net/secrets/OPENAI-API-KEY)
```

### 3. Azure Monitor Alerts

**Set up alerts for:**
- High rate of 401 errors
- Rate limit violations
- Function errors
- Unusual traffic patterns

### 4. Backup Strategy

**Automated Backups:**
- User data: Stored in environment variables (ea_invites_data, ea_sessions_data)
- Consider moving to Azure Table Storage for production

---

## 📞 Need Help?

### Documentation
- **Security Setup:** `SECURITY_SETUP.md`
- **Quick Start:** `SECURITY_UPDATE_README.md`
- **Verification:** `HOW_TO_VERIFY_SECURITY.md`

### Common Issues
- **Can't login:** Check invite code is valid and not expired
- **Badge shows orange:** Likely HTTPS issue (expected on localhost)
- **Badge shows red:** Environment variables not configured

### Support Resources
- Azure Static Web Apps Docs: https://docs.microsoft.com/azure/static-web-apps/
- Azure Functions Docs: https://docs.microsoft.com/azure/azure-functions/

---

## ✅ Success Checklist

Your Azure deployment is fully secured when:

- [x] All environment variables configured
- [x] Code deployed successfully  
- [x] Security badge shows **GREEN**
- [x] Security score is **100%**
- [x] Authentication required for API calls
- [x] Rate limiting active
- [x] CORS restricted to your domain
- [x] You can login with invite code
- [x] You can access authenticated features

**Congratulations!** Your Azure deployment is now enterprise-secured! 🎉🛡️
