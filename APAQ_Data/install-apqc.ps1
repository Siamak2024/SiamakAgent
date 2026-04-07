# APQC Integration - Installation & Verification Script
# Run this after placing APQC Excel file in APAQ_Data/source/

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  APQC Framework Integration Setup" -ForegroundColor Cyan
Write-Host "  EA V5 Platform" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "[2/5] Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Check for APQC Excel file
Write-Host ""
Write-Host "[3/5] Checking for APQC Excel file..." -ForegroundColor Yellow
$excelPath = "APAQ_Data\source\*.xlsx"
$excelFiles = Get-ChildItem -Path $excelPath -ErrorAction SilentlyContinue

if ($excelFiles) {
    Write-Host "  ✓ Excel file found: $($excelFiles[0].Name)" -ForegroundColor Green
    
    # Try to convert
    Write-Host ""
    Write-Host "[4/5] Converting Excel to JSON..." -ForegroundColor Yellow
    node scripts\convert_apqc_to_json.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Conversion successful" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Conversion encountered issues (check output above)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ No Excel file found in APAQ_Data\source\" -ForegroundColor Yellow
    Write-Host "  → Using placeholder data (13 L1 categories)" -ForegroundColor Yellow
    Write-Host "  → Place APQC Excel file and re-run this script for full framework" -ForegroundColor Cyan
}

# Step 4: Verify JSON files
Write-Host ""
Write-Host "[5/5] Verifying integration files..." -ForegroundColor Yellow

$requiredFiles = @(
    "APAQ_Data\apqc_pcf_master.json",
    "APAQ_Data\apqc_metadata_mapping.json",
    "APAQ_Data\apqc_capability_enrichment.json",
    "scripts\convert_apqc_to_json.js",
    "js\EA_DataManager.js"
)

$allPresent = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING" -ForegroundColor Red
        $allPresent = $false
    }
}

# Summary
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Installation Summary" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

if ($allPresent) {
    Write-Host ""
    Write-Host "✓ APQC Integration ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start platform: npm run dev:open" -ForegroundColor White
    Write-Host "  2. Create new project or open existing" -ForegroundColor White
    Write-Host "  3. Start Standard or Autopilot workflow" -ForegroundColor White
    Write-Host "  4. Look for 'Powered by APQC' banners" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Cyan
    Write-Host "  • Quick Reference: APAQ_Data\QUICK_REFERENCE.md" -ForegroundColor White
    Write-Host "  • Integration Guide: APAQ_Data\INTEGRATION_GUIDE.md" -ForegroundColor White
    Write-Host "  • Summary: APAQ_Data\IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠ Some files are missing!" -ForegroundColor Yellow
    Write-Host "Please check the installation and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
