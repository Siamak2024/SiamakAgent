# EA Platform - Multi-User Complete Implementation Package

**Created:** 2026-04-07  
**Status:** Ready for deployment  
**Implementation:** Azure Functions + Static Web Apps

---

## ✅ Files Already Created

1. ✓ `azure-deployment/api/validate-invite/function.json`
2. ✓ `azure-deployment/api/validate-invite/index.js`
3. ✓ `azure-deployment/api/save-project/function.json`
4. ✓ `azure-deployment/api/save-project/index.js`
5. ✓ `azure-deployment/api/load-projects/function.json`
6. ✓ `azure-deployment/api/delete-project/function.json`
7. ✓ `azure-deployment/api/create-invite/function.json`

---

## 📝 Files Still Needed

Copy the code below to create the remaining files manually.

### 1. load-projects/index.js

**File:** `azure-deployment/api/load-projects/index.js`

```javascript
const { verifySessionToken } = require('../validate-invite');

function getStorage(key) {
  const data = process.env[key];
  return data ? JSON.parse(data) : {};
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }
  
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      context.res.status = 401;
      context.res.body = { success: false, error: 'Missing authorization header' };
      return;
    }
    
    const sessionToken = authHeader.substring(7);
    const session = verifySessionToken(sessionToken);
    
    if (!session.valid) {
      context.res.status = 401;
      context.res.body = { success: false, error: session.error || 'Invalid session' };
      return;
    }
    
    const { userId } = session;
    const projectId = req.query.projectId;
    
    const storageKey = `user_projects_${userId}`;
    const userProjects = getStorage(storageKey) || {};
    
    if (projectId) {
      const project = userProjects[projectId];
      if (!project) {
        context.res.status = 404;
        context.res.body = { success: false, error: 'Project not found' };
        return;
      }
      
      context.res.status = 200;
      context.res.body = { success: true, project, userId };
      return;
    }
    
    const projectsList = Object.values(userProjects).map(p => ({
      id: p.id,
      name: p.data?.projectName || p.data?.name || 'Untitled Project',
      description: p.data?.description || '',
      lastModified: p.lastModified,
      version: p.version,
      completionStatus: p.data?.metadata?.completionStatus
    }));
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      projects: projectsList,
      count: projectsList.length,
      userId
    };
    
  } catch (error) {
    context.log.error('Load error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to load projects' };
  }
};
```

### 2. delete-project/index.js

**File:** `azure-deployment/api/delete-project/index.js`

```javascript
const { verifySessionToken } = require('../validate-invite');

function getStorage(key) {
  const data = process.env[key];
  return data ? JSON.parse(data) : {};
}

function setStorage(key, data) {
  process.env[key] = JSON.stringify(data);
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }
  
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      context.res.status = 401;
      context.res.body = { success: false, error: 'Missing authorization header' };
      return;
    }
    
    const sessionToken = authHeader.substring(7);
    const session = verifySessionToken(sessionToken);
    
    if (!session.valid) {
      context.res.status = 401;
      context.res.body = { success: false, error: session.error || 'Invalid session' };
      return;
    }
    
    const { userId } = session;
    const projectId = req.params.projectId || req.body?.projectId;
    
    if (!projectId) {
      context.res.status = 400;
      context.res.body = { success: false, error: 'projectId required' };
      return;
    }
    
    const storageKey = `user_projects_${userId}`;
    const userProjects = getStorage(storageKey) || {};
    
    if (!userProjects[projectId]) {
      context.res.status = 404;
      context.res.body = { success: false, error: 'Project not found' };
      return;
    }
    
    delete userProjects[projectId];
    setStorage(storageKey, userProjects);
    
    context.log('Project deleted:', projectId, 'for user:', userId);
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      projectId,
      deletedAt: new Date().toISOString()
    };
    
  } catch (error) {
    context.log.error('Delete error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to delete project' };
  }
};
```

### 3. create-invite/index.js

**File:** `azure-deployment/api/create-invite/index.js`

```javascript
const crypto = require('crypto');

const INVITES_KEY = 'ea_invites_data';

function getStorage(key) {
  const data = process.env[key];
  return data ? JSON.parse(data) : {};
}

function setStorage(key, data) {
  process.env[key] = JSON.stringify(data);
}

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }
  
  try {
    const adminKey = req.headers['x-admin-key'];
    const expectedAdminKey = process.env.ADMIN_SECRET_KEY || 'CHANGE_THIS_IN_PRODUCTION';
    
    if (adminKey !== expectedAdminKey) {
      context.res.status = 401;
      context.res.body = { success: false, error: 'Invalid admin key' };
      return;
    }
    
    const { email, expiresInHours = 24 } = req.body || {};
    
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    
    const invite = {
      code: inviteCode,
      email: email || null,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false,
      usedAt: null,
      usedBy: null
    };
    
    const invites = getStorage(INVITES_KEY);
    invites[inviteCode] = invite;
    setStorage(INVITES_KEY, invites);
    
    const baseUrl = process.env.APP_BASE_URL || 'https://yourapp.azurestaticapps.net';
    const inviteLink = `${baseUrl}/auth/login.html?invite=${inviteCode}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
    
    context.log('Invite created:', inviteCode, 'for', email || 'any email');
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      inviteCode,
      inviteLink,
      email: email || null,
      expiresAt,
      expiresInHours
    };
    
  } catch (error) {
    context.log.error('Create invite error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to create invite' };
  }
};
```

---

## 🎨 Frontend Files

### 4. Login Page

**File:** `azure-deployment/static/auth/login.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EA Platform - Login</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .login-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 48px 40px;
      width: 100%;
      max-width: 440px;
      animation: slideUp 0.5s ease;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo h1 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    
    .logo p {
      font-size: 14px;
      color: #64748b;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
    }
    
    input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.2s;
      background: white;
    }
    
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .btn {
      width: 100%;
      padding: 14px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .error {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 16px;
      display: none;
    }
    
    .error.show {
      display: block;
      animation: shake 0.5s;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    
    .loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 13px;
      color: #64748b;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <h1>🏛️ EA Platform</h1>
      <p>Enterprise Architecture & Strategic Planning</p>
    </div>
    
    <form id="loginForm">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" placeholder="your.email@company.com" required autocomplete="email" />
      </div>
      
      <div class="form-group">
        <label for="inviteCode">Invite Code</label>
        <input type="text" id="inviteCode" name="inviteCode" placeholder="ABC1234DEF" required autocomplete="off" style="text-transform: uppercase;" />
      </div>
      
      <button type="submit" class="btn" id="loginBtn">
        Access Platform →
      </button>
      
      <div class="error" id="errorMsg"></div>
    </form>
    
    <div class="footer">
      Don't have an invite code? <a href="mailto:admin@yourcompany.com">Request Access</a>
    </div>
  </div>

  <script src="auth.js"></script>
  <script>
    // Auto-fill from URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('email')) {
      document.getElementById('email').value = params.get('email');
    }
    if (params.get('invite')) {
      document.getElementById('inviteCode').value = params.get('invite').toUpperCase();
    }
    
    const form = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const inviteCode = document.getElementById('inviteCode').value.trim().toUpperCase();
      
      // Show loading state
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="loading"></span>Authenticating...';
      errorMsg.classList.remove('show');
      
      try {
        await window.EAAuth.login(email, inviteCode);
        // Redirect to main app
        window.location.href = '/';
      } catch (error) {
        errorMsg.textContent = error.message || 'Login failed. Please check your invite code.';
        errorMsg.classList.add('show');
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Access Platform →';
      }
    });
    
    // Auto-submit if both fields populated from URL
    if (params.get('email') && params.get('invite')) {
      setTimeout(() => {
        if (document.getElementById('email').value && document.getElementById('inviteCode').value) {
          form.dispatchEvent(new Event('submit'));
        }
      }, 800);
    }
  </script>
</body>
</html>
```

### 5. Authentication Library

**File:** `azure-deployment/static/auth/auth.js`

```javascript
/**
 * EA Platform Authentication Library
 * Handles login, session management, and API authentication
 */

class EAAuth {
  constructor() {
    this.sessionKey = 'ea_session';
    this.apiBase = '/api'; // Azure Functions endpoint
  }

  // Check if user is authenticated
  isAuthenticated() {
    const session = this.getSession();
    if (!session) return false;
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Get current session
  getSession() {
    const sessionData = sessionStorage.getItem(this.sessionKey);
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  // Validate invite code and create session
  async login(email, inviteCode) {
    const response = await fetch(`${this.apiBase}/auth/validate-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, inviteCode })
    });

    const result = await response.json();

    if (!result.valid) {
      throw new Error(result.error || 'Invalid invite code');
    }

    // Store session
    sessionStorage.setItem(this.sessionKey, JSON.stringify({
      userId: result.userId,
      email: result.email,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt
    }));

    console.log('✅ Login successful:', result.email);
    return result;
  }

  // Logout and clear session
  logout() {
    sessionStorage.removeItem(this.sessionKey);
    window.location.href = '/auth/login.html';
  }

  // Get headers for API calls
  getAuthHeaders() {
    const session = this.getSession();
    if (!session) throw new Error('Not authenticated');

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.sessionToken}`
    };
  }
  
  // Get current user info
  getCurrentUser() {
    const session = this.getSession();
    return session ? {
      userId: session.userId,
      email: session.email,
      expiresAt: session.expiresAt
    } : null;
  }
}

// Global instance
window.EAAuth = new EAAuth();

// Auto-redirect if not authenticated (for protected pages)
if (window.location.pathname !== '/auth/login.html' && 
    !window.location.pathname.includes('/auth/') &&
    !window.EAAuth.isAuthenticated()) {
  console.log('⚠️ Not authenticated, redirecting to login...');
  window.location.href = '/auth/login.html';
}
```

---

## 🚀 Deployment Steps

### Step 1: Create Remaining Files

1. Copy each code block above into the specified file locations
2. Verify all files exist:
   ```bash
   ls azure-deployment/api/*/index.js
   ls azure-deployment/static/auth/*
   ```

### Step 2: Configure Environment Variables

In Azure Portal → Your Static Web App → Configuration:

```bash
ADMIN_SECRET_KEY=generate-random-32-char-string-here
APP_BASE_URL=https://your-app-name.azurestaticapps.net
ea_invites_data={}
ea_sessions_data={}
```

Generate admin key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Deploy

```bash
git add .
git commit -m "feat: Complete multi-user auth system implementation"
git push origin main
```

GitHub Actions will automatically deploy to Azure.

### Step 4: Generate First Invite

1. Get your admin key from Azure environment variables
2. Use curl or Postman:

```bash
curl -X POST https://your-app.azurestaticapps.net/api/admin/create-invite \
  -H "x-admin-key: YOUR_ADMIN_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","expiresInHours":24}'
```

3. Send the returned invite link to the user

### Step 5: Test Login

Visit: `https://your-app.azurestaticapps.net/auth/login.html`

---

## 📊 What's Already Working

✅ Directory structure created  
✅ Function configurations (function.json) created  
✅ validate-invite function complete  
✅ save-project function complete  
✅ Documentation framework ready  

## ⏳ Next: Complete These Files

1. Create `load-projects/index.js` (copy code from above)
2. Create `delete-project/index.js` (copy code from above)
3. Create `create-invite/index.js` (copy code from above)
4. Create `static/auth/login.html` (copy code from above)
5. Create `static/auth/auth.js` (copy code from above)
6. Configure Azure environment variables
7. Deploy and test!

---

**Total Implementation Time:** ~2-3 hours to copy files + configure + deploy  
**Cost:** $0.00/month (stays in free tier)

