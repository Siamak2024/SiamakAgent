# 🔒 Security Implementation Guide

## ✅ What Has Been Secured

Your Azure app has been upgraded with **enterprise-level security**:

### 1. **Authentication & Authorization**
- ✅ JWT-based session tokens
- ✅ All data endpoints now require authentication
- ✅ User-level data isolation (users can only access their own data)
- ✅ Session expiry (7 days by default)

### 2. **API Security**
- ✅ **REMOVED** exposed OpenAI API key endpoint (`/api/config/openai-key`)
- ✅ API keys now stay server-side only
- ✅ Rate limiting (100 requests/minute per user)
- ✅ Input validation and sanitization

### 3. **CORS Protection**
- ✅ Restricted to specific allowed origins
- ✅ Configurable via environment variables
- ✅ Blocked unauthorized cross-origin requests

### 4. **Database Security**
- ✅ Row-level security (user_id column)
- ✅ Indexed for performance
- ✅ Ownership verification on all operations

---

## 🚀 Setup Instructions

### Step 1: Generate New Secrets

**Generate a strong admin secret key:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```
   OPENAI_API_KEY=sk-your-real-key-here
   ADMIN_SECRET_KEY=your-generated-secret-from-step-1
   ALLOWED_ORIGINS=https://your-app-name.azurestaticapps.net
   APP_BASE_URL=https://your-app-name.azurestaticapps.net
   ```

### Step 3: Update Azure Portal Configuration

1. Go to **Azure Portal** → **Static Web Apps** → Your App → **Configuration**
2. Delete old insecure values
3. Add these environment variables:
   - `OPENAI_API_KEY` = Your OpenAI API key
   - `ADMIN_SECRET_KEY` = Your generated secret
   - `ALLOWED_ORIGINS` = Your app URL
   - `APP_BASE_URL` = Your app URL
   - `ea_invites_data` = {}
   - `ea_sessions_data` = {}

### Step 4: Remove Hardcoded Secrets from Git

**IMPORTANT:** Delete the file with hardcoded secrets:
```powershell
Remove-Item "azure-deployment\DEPLOYMENT_CONFIG.txt"
git add -u
git commit -m "Remove hardcoded secrets for security"
```

**Check Git history for leaked secrets:**
```powershell
git log --all --full-history -- "*DEPLOYMENT_CONFIG.txt"
```

If secrets were committed, consider:
- Rotating all API keys immediately
- Using tools like `git-filter-repo` to remove from history

### Step 5: Update Client-Side Code

Your client code needs to be updated to:
1. **Authenticate users** before making API calls
2. **Include session tokens** in API requests

Example client-side authentication:
```javascript
// Login with invite code
async function login(email, inviteCode) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, inviteCode })
  });
  
  const data = await response.json();
  if (data.success) {
    // Store session token
    localStorage.setItem('sessionToken', data.sessionToken);
    localStorage.setItem('userEmail', data.email);
    return true;
  }
  return false;
}

// Make authenticated API requests
async function getModels() {
  const token = localStorage.getItem('sessionToken');
  
  const response = await fetch('/api/models', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## 🔐 Security Features Explained

### Authentication Flow
1. User provides email + invite code
2. Server validates and generates session token
3. Token included in all subsequent API requests
4. Server verifies token and user identity

### Data Isolation
- Each model is linked to a `user_id`
- Users can only access/modify their own models
- Database queries filtered by user ownership

### Rate Limiting
- Prevents abuse and DoS attacks
- 100 requests per minute per user/IP
- Automatically cleans up old records

### CORS Protection
- Only allows requests from your configured domains
- Prevents unauthorized sites from accessing your API
- Logs blocked attempts

---

## 🛡️ Additional Recommendations

### High Priority (Do Soon)

1. **Enable HTTPS Only**
   ```javascript
   // Add to server.js in production
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(`https://${req.header('host')}${req.url}`);
       } else {
         next();
       }
     });
   }
   ```

2. **Add Security Headers**
   ```powershell
   npm install helmet
   ```
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

3. **Implement Audit Logging**
   - Log all data access/modifications
   - Store who, what, when for compliance

4. **Database Encryption**
   - Use SQLite encryption extension (SQLCipher)
   - Or migrate to Azure SQL with encryption

5. **API Key Rotation**
   - Create a schedule to rotate secrets
   - Implement graceful key transition

### Medium Priority

6. **Multi-Factor Authentication (MFA)**
7. **IP Whitelisting for Admin Functions**
8. **Automated Security Scanning**
9. **Session Management Dashboard**
10. **Backup Encryption**

### Azure-Specific

11. **Use Azure Key Vault** for secrets
12. **Enable Azure Monitor** for security alerts
13. **Configure Azure Private Link**
14. **Enable Azure DDoS Protection**

---

## 🧪 Testing Your Security

### Test Authentication
```powershell
# This should fail (no authentication)
curl http://localhost:3000/api/models

# This should work (with valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/models
```

### Test Rate Limiting
```powershell
# Run 150 requests quickly - should get blocked
for ($i=1; $i -le 150; $i++) { 
  curl http://localhost:3000/api/health 
}
```

### Test CORS
Open browser console on a different domain and try:
```javascript
fetch('http://localhost:3000/api/models')
// Should be blocked by CORS
```

---

## 📋 Security Checklist

Before going to production:

- [ ] Generated new `ADMIN_SECRET_KEY`
- [ ] Configured `.env` file with real values
- [ ] Updated Azure Portal environment variables
- [ ] Removed hardcoded secrets from codebase
- [ ] Checked Git history for leaked secrets
- [ ] Updated client code to use authentication
- [ ] Tested authentication flow
- [ ] Tested rate limiting
- [ ] Tested CORS restrictions
- [ ] Verified user data isolation
- [ ] Enabled HTTPS in production
- [ ] Added security headers (helmet)
- [ ] Set up monitoring/alerting
- [ ] Documented who has admin access

---

## ⚠️ Breaking Changes

**Your existing clients will stop working** because:
1. All API endpoints now require authentication
2. CORS is restricted to specific origins
3. OpenAI API key endpoint is removed

**Migration Required:**
- Update all client applications to authenticate
- Add `Authorization: Bearer <token>` to all API calls
- Update Azure Functions to use new security model

---

## 🆘 Support

If you encounter issues:
1. Check server logs for authentication errors
2. Verify environment variables are set correctly
3. Test with curl to isolate client vs server issues
4. Enable debug logging: `DEBUG=* node server.js`

---

## 📊 Monitoring

Monitor these security metrics:
- Failed authentication attempts
- Rate limit violations
- CORS blocked requests
- Unusual access patterns
- Session expiry rates

Consider integrating with:
- Azure Application Insights
- Azure Security Center
- Third-party SIEM tools
