# APM Multi-User Test Workflow

**Test Date:** April 7, 2026  
**Purpose:** Verify multi-user authentication with APM workflow (upload → manage → export)  
**Test User:** First external user

---

## 🎯 Test Scenario

User should be able to:
1. ✅ Login with email + invite code
2. ✅ Upload local Application list JSON file
3. ✅ Populate APM Inventory
4. ✅ View all inventory views
5. ✅ Manage inventory items
6. ✅ Export JSON with changes
7. ✅ All data saved in user's separate folder

---

## 📋 Pre-Deployment Checklist

### Step 1: Generate Admin Secret Key
```powershell
# Generate a secure 32-character admin key
$adminKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "ADMIN_SECRET_KEY=$adminKey" -ForegroundColor Green
# SAVE THIS - You'll need it for Azure configuration
```

### Step 2: Configure Azure Environment Variables

Go to Azure Portal → Your Static Web App → Configuration → Environment variables:

```bash
ADMIN_SECRET_KEY=<paste-your-generated-key-here>
APP_BASE_URL=https://your-app-name.azurestaticapps.net
ea_invites_data={}
ea_sessions_data={}
```

### Step 3: Deploy to Azure

```powershell
# Check git status
git status

# Add all new files
git add azure-deployment/api/load-projects/index.js
git add azure-deployment/api/delete-project/index.js
git add azure-deployment/api/create-invite/index.js
git add azure-deployment/static/auth/login.html
git add azure-deployment/static/auth/auth.js
git add azure-deployment/static/admin/invites.html
git add COMPLETE_IMPLEMENTATION_PACKAGE.md
git add TEST_APM_MULTIUSER_WORKFLOW.md

# Commit changes
git commit -m "feat: Complete multi-user auth system with APM workflow support"

# Push to Azure (triggers auto-deployment)
git push origin main
```

Wait 3-5 minutes for GitHub Actions to deploy.

---

## 🔑 Generate Test Invite Code

### Option A: Using curl (PowerShell)
```powershell
$adminKey = "YOUR_ADMIN_KEY_HERE"
$body = @{
    email = "test.user@company.com"
    expiresInHours = 48
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://your-app.azurestaticapps.net/api/admin/create-invite" `
    -Method POST `
    -Headers @{
        "x-admin-key" = $adminKey
        "Content-Type" = "application/json"
    } `
    -Body $body

Write-Host "`n✅ Invite Code: $($response.inviteCode)" -ForegroundColor Green
Write-Host "📧 Email: $($response.email)" -ForegroundColor Cyan
Write-Host "🔗 Link: $($response.inviteLink)" -ForegroundColor Yellow
Write-Host "⏰ Expires: $($response.expiresAt)`n" -ForegroundColor Magenta
```

### Option B: Using Admin Panel
1. Open: `https://your-app.azurestaticapps.net/admin/invites.html`
2. Enter your `ADMIN_SECRET_KEY`
3. Enter test user email: `test.user@company.com`
4. Set expiration: 48 hours
5. Click "Generate Invite Code"
6. Copy the invite link

---

## 🧪 Test Execution Steps

### Phase 1: Authentication Test

1. **Open invite link** (from email or admin panel)
   ```
   https://your-app.azurestaticapps.net/auth/login.html?invite=ABC12345&email=test.user@company.com
   ```

2. **Verify auto-fill:**
   - Email field should be pre-filled
   - Invite code should be pre-filled

3. **Click "Access Platform →"**
   - Should see loading spinner
   - Should redirect to main app (`/`)
   - Should see session in browser sessionStorage

4. **Verify session:**
   - Open browser DevTools (F12) → Application → Session Storage
   - Check for `ea_session` key
   - Should contain: `userId`, `email`, `sessionToken`, `expiresAt`

### Phase 2: APM Workflow Test

#### 2.1 Upload Application List

1. Navigate to **APM Tool:**
   - Open `/EA2_Toolkit/Application_Portfolio_Management.html`
   - Should see APM interface without re-authentication

2. **Prepare test data** (use sample file below)
   - Create `test_applications.json` with 5-10 applications
   - Include fields: `name`, `owner`, `technology`, `status`, `criticality`

3. **Upload file:**
   - Click "Import" or "Upload" button
   - Select `test_applications.json`
   - Verify applications appear in inventory

#### 2.2 Manage Inventory

1. **View all views:**
   - Grid view (table with all applications)
   - Card view (application cards)
   - Technology breakdown (pie chart)
   - Lifecycle status (bar chart)

2. **Make changes:**
   - Edit 2-3 applications (change status, owner, criticality)
   - Add 1 new application manually
   - Delete 1 test application
   - Add notes/comments to applications

3. **Verify changes persist:**
   - Refresh page
   - Check if changes are still there (should load from server)

#### 2.3 Export Data

1. **Export JSON:**
   - Click "Export" button
   - Download `applications_export.json`
   - Verify file contains all changes

2. **Verify export content:**
   - Open exported JSON in text editor
   - Confirm edited applications show new values
   - Confirm new application is included
   - Confirm deleted application is missing

### Phase 3: Data Isolation Test

1. **Check user folder structure:**
   - Backend should have saved data in `user_projects_{userId}`
   - Each user's data completely isolated

2. **Test with second invite code:**
   - Generate another invite for `user2@company.com`
   - Login as second user
   - Upload different application list
   - Verify first user's data is NOT visible

3. **Test session expiry:**
   - Wait 7 days OR manually expire session
   - Try to access APM
   - Should redirect to login page

---

## 📊 Success Criteria

✅ **Authentication:**
- [ ] Invite code generates successfully
- [ ] Login works with email + invite code
- [ ] Session token stored in sessionStorage
- [ ] Invalid invite code shows error message
- [ ] Expired invite code rejected

✅ **APM Workflow:**
- [ ] JSON file upload succeeds
- [ ] Applications visible in all views
- [ ] Edit operations save successfully
- [ ] New application creates successfully
- [ ] Delete operation works
- [ ] Export generates correct JSON
- [ ] Page refresh loads data from server

✅ **Data Isolation:**
- [ ] User 1 data NOT visible to User 2
- [ ] Each user has separate storage
- [ ] Export only contains user's own data
- [ ] Session expiry forces re-login

✅ **User Experience:**
- [ ] No re-authentication required between pages
- [ ] Auto-redirect to login if not authenticated
- [ ] Error messages are clear and helpful
- [ ] Loading states visible during API calls

---

## 📝 Sample Test Data

### test_applications.json
```json
{
  "applications": [
    {
      "id": "APP001",
      "name": "Customer Portal",
      "description": "External customer-facing portal",
      "owner": "Marketing Team",
      "businessCriticality": "High",
      "technology": "React, Node.js, PostgreSQL",
      "status": "Production",
      "users": 15000,
      "lastUpdated": "2026-03-15",
      "annualCost": 120000,
      "capabilities": ["Customer Management", "Order Processing"]
    },
    {
      "id": "APP002",
      "name": "ERP System",
      "description": "Enterprise resource planning",
      "owner": "Finance Team",
      "businessCriticality": "Critical",
      "technology": "SAP ECC",
      "status": "Production",
      "users": 500,
      "lastUpdated": "2026-02-20",
      "annualCost": 850000,
      "capabilities": ["Financial Management", "Procurement", "Inventory Management"]
    },
    {
      "id": "APP003",
      "name": "HR Portal",
      "description": "Employee self-service portal",
      "owner": "HR Department",
      "businessCriticality": "Medium",
      "technology": "Workday",
      "status": "Production",
      "users": 1200,
      "lastUpdated": "2026-01-10",
      "annualCost": 45000,
      "capabilities": ["Employee Management", "Payroll Processing"]
    },
    {
      "id": "APP004",
      "name": "Legacy Billing System",
      "description": "Legacy system for monthly billing",
      "owner": "Finance Team",
      "businessCriticality": "High",
      "technology": "COBOL, DB2",
      "status": "Sunset Planned",
      "users": 80,
      "lastUpdated": "2025-12-01",
      "annualCost": 200000,
      "capabilities": ["Billing Management"]
    },
    {
      "id": "APP005",
      "name": "Mobile Sales App",
      "description": "Sales field force mobile application",
      "owner": "Sales Team",
      "businessCriticality": "Medium",
      "technology": "React Native, MongoDB",
      "status": "Production",
      "users": 250,
      "lastUpdated": "2026-04-01",
      "annualCost": 75000,
      "capabilities": ["Sales Management", "Customer Engagement"]
    },
    {
      "id": "APP006",
      "name": "Data Warehouse",
      "description": "Central analytics data warehouse",
      "owner": "Analytics Team",
      "businessCriticality": "High",
      "technology": "Snowflake, Tableau",
      "status": "Production",
      "users": 150,
      "lastUpdated": "2026-03-25",
      "annualCost": 180000,
      "capabilities": ["Analytics & Reporting"]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: Login button doesn't work
**Solution:** Check browser console for errors. Verify `/api/auth/validate-invite` endpoint is deployed.

### Issue: "Not authenticated" redirect loop
**Solution:** Check if auth.js is blocking login page. Verify `window.location.pathname !== '/auth/login.html'` condition.

### Issue: Data not persisting after refresh
**Solution:** Verify API calls include `Authorization: Bearer <token>` header. Check Azure Functions logs.

### Issue: Invite code always shows "invalid"
**Solution:** Verify `ea_invites_data={}` is set in Azure environment variables. Check invite expiration time.

### Issue: Users can see each other's data
**Solution:** Verify `userId` is correctly extracted from session token. Check storage key includes `user_projects_{userId}`.

---

## 📈 Performance Benchmarks

Expected performance:
- **Login:** < 500ms
- **File upload (5MB):** < 2s
- **Save project:** < 300ms
- **Load projects:** < 200ms
- **Export JSON:** < 1s

---

## 🔒 Security Checklist

- [ ] ADMIN_SECRET_KEY is strong (32+ characters)
- [ ] Admin key NOT committed to git
- [ ] Invite codes expire (default 24h)
- [ ] Session tokens expire (7 days)
- [ ] CORS properly configured for Static Web Apps
- [ ] No sensitive data in client-side logs
- [ ] UserId calculated from email hash (prevents guessing)

---

## 📞 Next Steps After Testing

1. **If successful:**
   - Generate production invite codes for real users
   - Update admin email in login.html footer
   - Monitor Azure Functions logs for errors
   - Set up monitoring/alerts

2. **If issues found:**
   - Check browser console errors
   - Review Azure Functions logs (Azure Portal → Functions → Monitor)
   - Test individual API endpoints with Postman
   - Review COMPLETE_IMPLEMENTATION_PACKAGE.md

3. **Future enhancements:**
   - Migrate from environment variables to Azure Blob Storage
   - Add password reset functionality
   - Implement admin dashboard with user management
   - Add audit logs for all operations
   - Enable SSO/OAuth integration

---

**Created:** April 7, 2026  
**Status:** Ready for first external user test  
**Cost:** $0.00/month (Azure free tier)
