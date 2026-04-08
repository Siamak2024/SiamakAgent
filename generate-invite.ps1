# Generate Invite Code for External User
# Quick script to create invite codes via PowerShell

Write-Host "`n=== EA Platform - Generate Invite Code ===" -ForegroundColor Cyan
Write-Host ""

# Your Azure Static Web App URL
$appUrl = "https://white-cliff-010e13b10.azurestaticapps.net"

# Load admin key from config
$configPath = "azure-deployment\DEPLOYMENT_CONFIG.txt"
$adminKey = ""

if (Test-Path $configPath) {
    $config = Get-Content $configPath | Where-Object { $_ -match "ADMIN_SECRET_KEY=" }
    if ($config) {
        $adminKey = ($config -split "=")[1].Trim()
        Write-Host "✅ Admin key loaded from config file" -ForegroundColor Green
    }
}

if ([string]::IsNullOrWhiteSpace($adminKey)) {
    Write-Host "⚠️  Admin key not found in config file!" -ForegroundColor Yellow
    $adminKey = Read-Host "Enter your ADMIN_SECRET_KEY"
}

# Get user email
Write-Host ""
$email = Read-Host "Enter user email address (e.g., user@company.com)"

# Get expiration
Write-Host ""
$expiresIn = Read-Host "Expires in hours (default: 48)"
if ([string]::IsNullOrWhiteSpace($expiresIn)) {
    $expiresIn = 48
}

Write-Host "`nGenerating invite code..." -ForegroundColor Yellow

try {
    $body = @{
        email = $email
        expiresInHours = [int]$expiresIn
    } | ConvertTo-Json

    $response = Invoke-RestMethod `
        -Uri "$appUrl/api/admin/create-invite" `
        -Method POST `
        -Headers @{
            "x-admin-key" = $adminKey
            "Content-Type" = "application/json"
        } `
        -Body $body

    if ($response.success) {
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "   ✅ INVITE CODE GENERATED!" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

        Write-Host "Invite Code: " -NoNewline -ForegroundColor Yellow
        Write-Host $response.inviteCode -ForegroundColor Cyan

        Write-Host "Email: " -NoNewline -ForegroundColor Yellow
        Write-Host $response.email -ForegroundColor White

        Write-Host "Expires: " -NoNewline -ForegroundColor Yellow
        $expiryDate = [DateTime]::Parse($response.expiresAt)
        Write-Host $expiryDate.ToString("yyyy-MM-dd HH:mm") -ForegroundColor White

        Write-Host "`nInvite Link (send this to user):" -ForegroundColor Yellow
        Write-Host $response.inviteLink -ForegroundColor Green

        # Copy to clipboard
        $response.inviteLink | Set-Clipboard
        Write-Host "`n✅ Link copied to clipboard!" -ForegroundColor Green

        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

        # Save to file
        $inviteLog = @"
Invite Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Email: $($response.email)
Code: $($response.inviteCode)
Expires: $($expiryDate.ToString("yyyy-MM-dd HH:mm"))
Link: $($response.inviteLink)

"@

        $inviteLog | Add-Content -Path "invites_log.txt"
        Write-Host "📝 Invite also saved to: invites_log.txt`n" -ForegroundColor Cyan

    } else {
        Write-Host "`n❌ Failed to generate invite: $($response.error)" -ForegroundColor Red
    }

} catch {
    Write-Host "`n❌ Error generating invite:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host "`nTroubleshooting:" -ForegroundColor Cyan
    Write-Host "  • Verify Azure environment variables are configured" -ForegroundColor White
    Write-Host "  • Check GitHub Actions deployment completed successfully" -ForegroundColor White
    Write-Host "  • Confirm admin key is correct" -ForegroundColor White
    Write-Host "  • Test API endpoint: $appUrl/api/admin/create-invite`n" -ForegroundColor White
}
