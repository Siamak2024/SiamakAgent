# EA Toolkit Sync Script
# Syncs files between local development and Azure deployment folders
# Date: April 21, 2026

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Check', 'SyncToAzure', 'SyncFromAzure', 'Force')]
    [string]$Mode = 'Check',
    
    [Parameter(Mandatory=$false)]
    [string]$FilePattern = '*.html'
)

$localPath = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\NexGenEA\EA2_Toolkit"
$azurePath = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\azure-deployment\static\NexGenEA\EA2_Toolkit"

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  EA Toolkit Sync Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verify paths exist
if (-not (Test-Path $localPath)) {
    Write-Host "❌ ERROR: Local path not found: $localPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $azurePath)) {
    Write-Host "❌ ERROR: Azure path not found: $azurePath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Local:  $localPath" -ForegroundColor Gray
Write-Host "☁️  Azure:  $azurePath" -ForegroundColor Gray
Write-Host "🔍 Pattern: $FilePattern" -ForegroundColor Gray
Write-Host "⚙️  Mode:    $Mode" -ForegroundColor Gray
Write-Host ""

# Get all matching files
$localFiles = Get-ChildItem -Path $localPath -Filter $FilePattern -File

$differences = @()
$identical = 0
$localOnly = 0
$azureOnly = 0

Write-Host "Analyzing files..." -ForegroundColor Yellow
Write-Host ""

foreach ($localFile in $localFiles) {
    $azureFile = Join-Path $azurePath $localFile.Name
    
    if (-not (Test-Path $azureFile)) {
        $localOnly++
        Write-Host "⚠️  $($localFile.Name) - LOCAL ONLY" -ForegroundColor Magenta
        continue
    }
    
    # Get file hashes for accurate comparison
    $localHash = (Get-FileHash $localFile.FullName -Algorithm MD5).Hash
    $azureHash = (Get-FileHash $azureFile -Algorithm MD5).Hash
    
    if ($localHash -eq $azureHash) {
        $identical++
        Write-Host "✅ $($localFile.Name) - IDENTICAL" -ForegroundColor Green
    }
    else {
        $localLines = (Get-Content $localFile.FullName | Measure-Object -Line).Lines
        $azureLines = (Get-Content $azureFile | Measure-Object -Line).Lines
        $diff = $localLines - $azureLines
        
        $differences += [PSCustomObject]@{
            File = $localFile.Name
            LocalLines = $localLines
            AzureLines = $azureLines
            Difference = $diff
            LocalPath = $localFile.FullName
            AzurePath = $azureFile
        }
        
        $color = if ($diff -gt 0) { "Yellow" } else { "Cyan" }
        $symbol = if ($diff -gt 0) { "📤" } else { "📥" }
        Write-Host "$symbol $($localFile.Name) - Local: $localLines | Azure: $azureLines | Diff: $diff" -ForegroundColor $color
    }
}

# Check for Azure-only files
$azureFiles = Get-ChildItem -Path $azurePath -Filter $FilePattern -File
foreach ($azureFile in $azureFiles) {
    $localFile = Join-Path $localPath $azureFile.Name
    if (-not (Test-Path $localFile)) {
        $azureOnly++
        Write-Host "⚠️  $($azureFile.Name) - AZURE ONLY" -ForegroundColor Magenta
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Identical:     $identical files" -ForegroundColor Green
Write-Host "🔄 Differences:   $($differences.Count) files" -ForegroundColor Yellow
Write-Host "📂 Local only:    $localOnly files" -ForegroundColor Magenta
Write-Host "☁️  Azure only:    $azureOnly files" -ForegroundColor Magenta
Write-Host ""

if ($differences.Count -eq 0 -and $localOnly -eq 0 -and $azureOnly -eq 0) {
    Write-Host "🎉 All files are in sync!" -ForegroundColor Green
    exit 0
}

# Display differences table
if ($differences.Count -gt 0) {
    Write-Host ""
    Write-Host "Detailed Differences:" -ForegroundColor Cyan
    $differences | Format-Table -AutoSize
}

# Execute sync based on mode
if ($Mode -eq 'Check') {
    Write-Host ""
    Write-Host "ℹ️  Running in CHECK mode. No files were modified." -ForegroundColor Gray
    Write-Host ""
    Write-Host "To sync files, run with one of these modes:" -ForegroundColor Gray
    Write-Host "  -Mode SyncToAzure    : Copy local files to Azure (for files where Local is newer)" -ForegroundColor Gray
    Write-Host "  -Mode SyncFromAzure  : Copy Azure files to Local (for files where Azure is newer)" -ForegroundColor Gray
    Write-Host "  -Mode Force          : Force overwrite Azure with Local (⚠️ CAUTION)" -ForegroundColor Gray
    Write-Host ""
}
elseif ($Mode -eq 'SyncToAzure') {
    Write-Host ""
    $localNewer = $differences | Where-Object { $_.Difference -gt 0 }
    
    if ($localNewer.Count -eq 0) {
        Write-Host "ℹ️  No local files are newer than Azure. Nothing to sync." -ForegroundColor Gray
        exit 0
    }
    
    Write-Host "📤 Syncing $($localNewer.Count) file(s) to Azure..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($file in $localNewer) {
        try {
            Copy-Item -Path $file.LocalPath -Destination $file.AzurePath -Force
            Write-Host "✅ Synced: $($file.File)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed: $($file.File) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Sync to Azure complete!" -ForegroundColor Green
}
elseif ($Mode -eq 'SyncFromAzure') {
    Write-Host ""
    $azureNewer = $differences | Where-Object { $_.Difference -lt 0 }
    
    if ($azureNewer.Count -eq 0) {
        Write-Host "ℹ️  No Azure files are newer than local. Nothing to sync." -ForegroundColor Gray
        exit 0
    }
    
    Write-Host "📥 Syncing $($azureNewer.Count) file(s) from Azure..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  WARNING: This will overwrite your local files!" -ForegroundColor Red
    $confirm = Read-Host "Type 'YES' to continue"
    
    if ($confirm -ne 'YES') {
        Write-Host "❌ Sync cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    foreach ($file in $azureNewer) {
        try {
            Copy-Item -Path $file.AzurePath -Destination $file.LocalPath -Force
            Write-Host "✅ Synced: $($file.File)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed: $($file.File) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Sync from Azure complete!" -ForegroundColor Green
}
elseif ($Mode -eq 'Force') {
    Write-Host ""
    Write-Host "⚠️  WARNING: FORCE MODE - This will overwrite ALL Azure files with local versions!" -ForegroundColor Red
    Write-Host "This will affect $($differences.Count) file(s)" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Type 'FORCE' to continue"
    
    if ($confirm -ne 'FORCE') {
        Write-Host "❌ Sync cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "📤 Force syncing ALL different files to Azure..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($file in $differences) {
        try {
            Copy-Item -Path $file.LocalPath -Destination $file.AzurePath -Force
            Write-Host "✅ Synced: $($file.File)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed: $($file.File) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Force sync complete!" -ForegroundColor Green
}

Write-Host ""
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Script completed at $timestamp" -ForegroundColor Gray
