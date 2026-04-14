# Fix CDN Tracking Prevention Issues
# Adds crossorigin="anonymous" to all CDN script and link tags

$patterns = @(
    @{
        Find = 'src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"'
        Replace = 'src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" crossorigin="anonymous"'
    },
    @{
        Find = 'src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"'
        Replace = 'src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js" crossorigin="anonymous"'
    },
    @{
        Find = 'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">'
        Replace = 'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous">'
    },
    @{
        Find = 'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />'
        Replace = 'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" />'
    },
    @{
        Find = 'src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"'
        Replace = 'src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" crossorigin="anonymous"'
    },
    @{
        Find = 'src="https://unpkg.com/react@17/umd/react.production.min.js"'
        Replace = 'src="https://unpkg.com/react@17/umd/react.production.min.js" crossorigin="anonymous"'
    },
    @{
        Find = 'src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"'
        Replace = 'src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js" crossorigin="anonymous"'
    },
    @{
        Find = 'src="https://unpkg.com/@babel/standalone/babel.min.js"'
        Replace = 'src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"'
    }
)

# Get all HTML files in NexGenEA and azure-deployment
$htmlFiles = Get-ChildItem -Path "NexGenEA\**\*.html" -Recurse
$htmlFiles += Get-ChildItem -Path "azure-deployment\static\NexGenEA\**\*.html" -Recurse

$modifiedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    foreach ($pattern in $patterns) {
        if ($content -match [regex]::Escape($pattern.Find) -and $content -notmatch [regex]::Escape($pattern.Replace)) {
            $content = $content -replace [regex]::Escape($pattern.Find), $pattern.Replace
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.FullName)"
        $modifiedCount++
    }
}

Write-Host "`nTotal files modified: $modifiedCount"
