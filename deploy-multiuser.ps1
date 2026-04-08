# Deploy Multi-User Authentication System
# Run this script to deploy everything to Azure

Write-Host "`n=== EA Platform Multi-User Deployment ===" -ForegroundColor Cyan
Write-Host "This script will deploy the multi-user authentication system to Azure`n" -ForegroundColor White

# Step 1: Generate Admin Secret Key
Write-Host "Step 1: Generating Admin Secret Key..." -ForegroundColor Yellow
$adminKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "[OK] Admin key generated!`n" -ForegroundColor Green

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Save this key securely!" -ForegroundColor Red
Write-Host "ADMIN_SECRET_KEY=$adminKey" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

# Save to local file
$configContent = @"
# EA Platform Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

ADMIN_SECRET_KEY=$adminKey
APP_BASE_URL=https://your-app-name.azurestaticapps.net

# Copy these to Azure Portal:
# Azure Portal → Static Web Apps → Your App → Configuration → Environment variables

# Required variables:
# 1. ADMIN_SECRET_KEY = $adminKey
# 2. APP_BASE_URL = https://your-app-name.azurestaticapps.net
# 3. ea_invites_data = {}
# 4. ea_sessions_data = {}
"@

$configContent | Out-File -FilePath "azure-deployment\DEPLOYMENT_CONFIG.txt" -Encoding UTF8
Write-Host "[OK] Config saved to: azure-deployment\DEPLOYMENT_CONFIG.txt`n" -ForegroundColor Green

# Step 2: Verify files
Write-Host "Step 2: Verifying implementation files..." -ForegroundColor Yellow

$filesToCheck = @(
    "azure-deployment\api\validate-invite\index.js",
    "azure-deployment\api\save-project\index.js",
    "azure-deployment\api\load-projects\index.js",
    "azure-deployment\api\delete-project\index.js",
    "azure-deployment\api\create-invite\index.js",
    "azure-deployment\static\auth\login.html",
    "azure-deployment\static\auth\auth.js",
    "azure-deployment\static\admin\invites.html"
)

$allPresent = $true
foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (!$allPresent) {
    Write-Host "`n[WARNING] Some files are missing. Please run the implementation first.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n[OK] All files present!`n" -ForegroundColor Green

# Step 3: Git status
Write-Host "Step 3: Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "Modified/New files:`n" -ForegroundColor Cyan
    git status --short
    Write-Host ""
} else {
    Write-Host "[OK] No uncommitted changes`n" -ForegroundColor Green
}

# Step 4: Ask for confirmation
Write-Host "Step 4: Ready to deploy?" -ForegroundColor Yellow
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Add all multi-user system files" -ForegroundColor White
Write-Host "  2. Commit with message: 'feat: Multi-user auth with APM workflow support'" -ForegroundColor White
Write-Host "  3. Push to Azure (triggers auto-deployment)`n" -ForegroundColor White

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "`n[CANCELLED] Deployment cancelled.`n" -ForegroundColor Yellow
    exit 0
}

# Step 5: Git add
Write-Host "`nStep 5: Adding files to git..." -ForegroundColor Yellow
git add azure-deployment/api/load-projects/index.js
git add azure-deployment/api/delete-project/index.js
git add azure-deployment/api/create-invite/index.js
git add azure-deployment/static/auth/login.html
git add azure-deployment/static/auth/auth.js
git add azure-deployment/static/admin/invites.html
git add COMPLETE_IMPLEMENTATION_PACKAGE.md
git add TEST_APM_MULTIUSER_WORKFLOW.md
git add EA2_Toolkit/Import\ data/test_applications.json
git add azure-deployment/DEPLOYMENT_CONFIG.txt

Write-Host "[OK] Files staged`n" -ForegroundColor Green

# Step 6: Commit
Write-Host "Step 6: Creating commit..." -ForegroundColor Yellow
git commit -m "feat: Multi-user authentication with APM workflow support

- Implemented 5 Azure Functions for auth and project management
- Created login UI with glassmorphism design
- Added admin panel for invite code generation
- Created test workflow documentation
- Added sample APM test data (10 applications)
- User data isolation with separate storage per user
- Session-based authentication (7-day expiry)

Cost: $0.00/month (Azure free tier)
"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Commit created`n" -ForegroundColor Green
} else {
    Write-Host "[WARNING] No changes to commit or commit failed`n" -ForegroundColor Yellow
}

# Step 7: Push
Write-Host "Step 7: Pushing to Azure..." -ForegroundColor Yellow
Write-Host "This will trigger GitHub Actions deployment (3-5 minutes)`n" -ForegroundColor Cyan

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Push successful!`n" -ForegroundColor Green
} else {
    Write-Host "`n[FAILED] Push failed. Check git configuration.`n" -ForegroundColor Red
    exit 1
}

# Step 8: Next steps
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Deployment Initiated!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:`n" -ForegroundColor Yellow

Write-Host "1. Configure Azure Environment Variables:" -ForegroundColor White
Write-Host "   • Go to Azure Portal → Static Web Apps → Your App → Configuration" -ForegroundColor Gray
Write-Host "   • Add these environment variables:" -ForegroundColor Gray
Write-Host "     - ADMIN_SECRET_KEY = $adminKey" -ForegroundColor Cyan
Write-Host "     - APP_BASE_URL = https://your-app-name.azurestaticapps.net" -ForegroundColor Cyan
Write-Host "     - ea_invites_data = {}" -ForegroundColor Cyan
Write-Host "     - ea_sessions_data = {}`n" -ForegroundColor Cyan

Write-Host "2. Wait for Deployment (3-5 minutes):" -ForegroundColor White
Write-Host "   • Check GitHub Actions: https://github.com/your-repo/actions" -ForegroundColor Gray
Write-Host "   • Wait for green checkmark in GitHub Actions`n" -ForegroundColor Gray

Write-Host "3. Generate Test Invite Code:" -ForegroundColor White
Write-Host "   • Open: https://your-app-name.azurestaticapps.net/admin/invites.html" -ForegroundColor Gray
Write-Host "   • Enter admin key: $adminKey" -ForegroundColor Cyan
Write-Host "   • Generate invite for test user`n" -ForegroundColor Gray

Write-Host "4. Test APM Workflow:" -ForegroundColor White
Write-Host "   • Follow: TEST_APM_MULTIUSER_WORKFLOW.md" -ForegroundColor Gray
Write-Host "   • Use test data: EA2_Toolkit/Import data/test_applications.json`n" -ForegroundColor Gray

Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Config file saved: azure-deployment\DEPLOYMENT_CONFIG.txt" -ForegroundColor Green
Write-Host "Keep this file SECURE - contains admin key!`n" -ForegroundColor Red

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "   • TEST_APM_MULTIUSER_WORKFLOW.md - Complete test guide" -ForegroundColor Gray
Write-Host "   • COMPLETE_IMPLEMENTATION_PACKAGE.md - Technical details" -ForegroundColor Gray
Write-Host "   • MULTI_USER_IMPLEMENTATION_GUIDE.md - Architecture overview`n" -ForegroundColor Gray

Write-Host "[OK] Deployment script complete!`n" -ForegroundColor Green
