# EA Toolkit Sync Script (Simple Version)
# Syncs files between local development and Azure deployment folders

$localPath = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\NexGenEA\EA2_Toolkit"
$azurePath = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\azure-deployment\static\NexGenEA\EA2_Toolkit"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " EA Toolkit Sync Analysis" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Get all HTML files
$localFiles = Get-ChildItem -Path $localPath -Filter "*.html" -File

$differences = @()
$identical = 0

foreach ($localFile in $localFiles) {
    $azureFile = Join-Path $azurePath $localFile.Name
    
    if (-not (Test-Path $azureFile)) {
        Write-Host "[LOCAL ONLY] $($localFile.Name)" -ForegroundColor Magenta
        continue
    }
    
    # Compare using MD5 hash
    $localHash = (Get-FileHash $localFile.FullName -Algorithm MD5).Hash
    $azureHash = (Get-FileHash $azureFile -Algorithm MD5).Hash
    
    if ($localHash -eq $azureHash) {
        $identical++
        Write-Host "[IDENTICAL]  $($localFile.Name)" -ForegroundColor Green
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
        }
        
        $color = if ($diff -gt 0) { "Yellow" } else { "Cyan" }
        $arrow = if ($diff -gt 0) { ">>>" } else { "<<<" }
        Write-Host "[$arrow]       $($localFile.Name) | Local: $localLines | Azure: $azureLines | Diff: $diff" -ForegroundColor $color
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " Summary" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Identical files:   $identical" -ForegroundColor Green
Write-Host "Different files:   $($differences.Count)" -ForegroundColor Yellow
Write-Host ""

if ($differences.Count -gt 0) {
    Write-Host "Detailed Differences:" -ForegroundColor Cyan
    $differences | Format-Table -AutoSize
}
