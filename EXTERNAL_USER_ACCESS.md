# 🌐 EA Platform - External User Access Guide

**App URL:** https://white-cliff-010e13b10.azurestaticapps.net  
**Status:** Multi-user authentication enabled  
**Date:** April 7, 2026

---

## 📧 How to Invite External Users

### Quick Method (Recommended)

1. **Run the invite generator script:**
   ```powershell
   .\generate-invite.ps1
   ```
   
2. **Enter user details:**
   - Email address
   - Expiration (default: 48 hours)

3. **Send the invite link** (automatically copied to clipboard)

### Manual Method (Admin Panel)

1. Open: https://white-cliff-010e13b10.azurestaticapps.net/admin/invites.html
2. Enter your ADMIN_SECRET_KEY
3. Fill in user email
4. Click "Generate Invite Code"
5. Send the generated link to user

---

## 🔗 What Users Receive

**Invite Link Format:**
```
https://white-cliff-010e13b10.azurestaticapps.net/auth/login.html?invite=ABC12345&email=user@company.com
```

**What happens when they click:**
1. Opens login page with email and code auto-filled
2. User clicks "Access Platform →"
3. Redirects to main EA Platform
4. User can immediately start working

---

## 🧪 APM Test Workflow for External Users

Users can test the full APM workflow:

### Step 1: Login
- Click invite link → Auto-login

### Step 2: Navigate to APM
- URL: https://white-cliff-010e13b10.azurestaticapps.net/EA2_Toolkit/Application_Portfolio_Management.html

### Step 3: Upload Application List
- Click "Import" button
- Upload JSON file (see sample format below)
- View applications in grid/card views

### Step 4: Manage Inventory
- Edit applications (status, criticality, owner)
- Add new applications
- Delete applications
- View analytics dashboards

### Step 5: Export Data
- Click "Export" button
- Download JSON with all changes
- **All data saved in user's isolated folder**

---

## 📝 Sample Application JSON Format

Users can prepare their application list in this format:

```json
{
  "applications": [
    {
      "id": "APP001",
      "name": "Customer Portal",
      "description": "Customer-facing web portal",
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
      "capabilities": ["Financial Management", "Procurement"]
    }
  ]
}
```

**Test Data Available:** `EA2_Toolkit/Import data/test_applications.json` (10 sample apps)

---

## 🔒 Data Isolation & Security

✅ **Each user has isolated storage**
- User A cannot see User B's data
- Projects saved in separate folders: `users/{userId}/projects/`
- Export only includes user's own data

✅ **Session Security**
- 7-day session expiration
- Automatic logout after expiry
- Secure session tokens (Base64-encoded)

✅ **Invite Code Security**
- Single-use codes (marked as used after login)
- Time-limited expiration (default 24-48 hours)
- Optional email restriction

---

## ⚙️ Azure Configuration (Admin Only)

**Required Environment Variables:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `ADMIN_SECRET_KEY` | (from DEPLOYMENT_CONFIG.txt) | Admin operations |
| `APP_BASE_URL` | https://white-cliff-010e13b10.azurestaticapps.net | App base URL |
| `ea_invites_data` | `{}` | Invite codes storage |
| `ea_sessions_data` | `{}` | User sessions storage |

**Where to set:**
Azure Portal → Static Web Apps → white-cliff-010e13b10 → Configuration → Environment variables

---

## 🎯 User Experience Flow

```
1. Receive invite email
   ↓
2. Click invite link
   ↓
3. Login page opens (email + code pre-filled)
   ↓
4. Click "Access Platform"
   ↓
5. Main EA Platform loads
   ↓
6. Navigate to APM tool
   ↓
7. Upload application list
   ↓
8. Manage inventory (edit/add/delete)
   ↓
9. View analytics dashboards
   ↓
10. Export updated JSON
```

**Total time:** <5 minutes from invite to first use

---

## 📊 Important URLs

| Purpose | URL |
|---------|-----|
| **Main App** | https://white-cliff-010e13b10.azurestaticapps.net |
| **Login Page** | https://white-cliff-010e13b10.azurestaticapps.net/auth/login.html |
| **Admin Panel** | https://white-cliff-010e13b10.azurestaticapps.net/admin/invites.html |
| **APM Tool** | https://white-cliff-010e13b10.azurestaticapps.net/EA2_Toolkit/Application_Portfolio_Management.html |
| **GitHub Actions** | https://github.com/your-repo/actions |

---

## 🐛 Troubleshooting

### User Can't Login
- ✅ Check invite code hasn't expired
- ✅ Verify email matches invite
- ✅ Confirm Azure environment variables configured
- ✅ Check GitHub Actions deployment succeeded

### Data Not Saving
- ✅ Verify user is logged in (check sessionStorage)
- ✅ Check browser console for API errors
- ✅ Confirm Azure Functions deployed correctly

### Invite Code Generation Fails
- ✅ Verify ADMIN_SECRET_KEY is correct
- ✅ Check Azure environment variables set
- ✅ Confirm API endpoint accessible: `/api/admin/create-invite`

---

## 💰 Cost & Scalability

**Current:** $0.00/month (Azure free tier)

**Free Tier Limits:**
- 100 GB bandwidth/month
- 1 million function executions/month
- 5 GB storage

**Expected usage (per 10 users):**
- ~500 MB bandwidth
- ~50,000 function calls
- ~100 MB storage

✅ **Safely under free tier limits!**

---

## 📞 Support

**Documentation:**
- QUICKSTART_FIRST_USER.md - Setup guide
- TEST_APM_MULTIUSER_WORKFLOW.md - Complete test workflow
- DEPLOYMENT_STATUS.md - Current deployment status

**Admin Key Location:**
- `azure-deployment\DEPLOYMENT_CONFIG.txt` (KEEP SECURE!)

**Invite Log:**
- `invites_log.txt` (created automatically by generate-invite.ps1)

---

## ✅ Pre-Launch Checklist

Before inviting real users:

- [ ] GitHub Actions deployment completed (green checkmark)
- [ ] Azure environment variables configured (4 variables)
- [ ] Admin panel accessible (test with your admin key)
- [ ] Test invite generated successfully
- [ ] Login flow tested (invite link → login → redirect)
- [ ] APM tool loads without errors
- [ ] File upload/download works
- [ ] Data isolation verified (2 test users)

---

**Ready to invite users!** 🚀

Run `.\generate-invite.ps1` to create your first invite code.
