# PowerShell script to copy files to azure-deployment/static

$sourceDir = Get-Location
$destDir = Join-Path $sourceDir "azure-deployment/static"

Write-Host ""
Write-Host "Azure Static Web App - File Copy Script"
Write-Host ""

Write-Host "Source: $sourceDir"
Write-Host "Destination: $destDir"
Write-Host ""

# Create destination directories
@(
    $destDir,
    "$destDir/NexGenEA",
    "$destDir/EA2_Toolkit",
    "$destDir/css",
    "$destDir/js",
    "$destDir/data",
    "$destDir/scripts",
    "$destDir/e2e-artifacts"
) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

Write-Host "Creating directories... Done!"
Write-Host ""
Write-Host "Starting file copy..."
Write-Host ""

# Copy HTML files from root
Write-Host "[1/8] Copying root HTML files..."
Copy-Item -Path "$sourceDir/*.html" -Destination $destDir -Force -ErrorAction SilentlyContinue
Write-Host "   Root HTML files copied"

# Copy NexGenEA folder
Write-Host "[2/8] Copying NexGenEA platform files..."
Copy-Item -Path "$sourceDir/NexGenEA/*" -Destination "$destDir/NexGenEA/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   NexGenEA files copied"

# Copy EA2_Toolkit folder
Write-Host "[3/8] Copying EA2_Toolkit files..."
Copy-Item -Path "$sourceDir/EA2_Toolkit/*" -Destination "$destDir/EA2_Toolkit/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   EA2_Toolkit files copied"

# Copy CSS files
Write-Host "[4/8] Copying CSS files..."
Copy-Item -Path "$sourceDir/css/*.css" -Destination "$destDir/css/" -Force -ErrorAction SilentlyContinue
Write-Host "   CSS files copied"

# Copy JS modules
Write-Host "[5/8] Copying JavaScript modules..."
Copy-Item -Path "$sourceDir/js/*.js" -Destination "$destDir/js/" -Force -ErrorAction SilentlyContinue
Write-Host "   JavaScript files copied"

# Copy data folder
Write-Host "[6/8] Copying data folder..."
Copy-Item -Path "$sourceDir/data/*" -Destination "$destDir/data/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   Data folder copied"

# Copy scripts folder
Write-Host "[7/8] Copying scripts..."
Copy-Item -Path "$sourceDir/scripts/*" -Destination "$destDir/scripts/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   Scripts copied"

# Copy e2e-artifacts
Write-Host "[8/8] Copying e2e artifacts..."
Copy-Item -Path "$sourceDir/e2e-artifacts/*" -Destination "$destDir/e2e-artifacts/" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   E2E artifacts copied"

Write-Host ""
Write-Host "All files copied successfully!"
Write-Host ""
Write-Host "Total files/directories copied to:"
Write-Host "$destDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review files in azure-deployment/static/"
Write-Host "2. Update HTML files to use Azure Function proxy"
Write-Host "3. Push to GitHub for deployment"
Write-Host ""
