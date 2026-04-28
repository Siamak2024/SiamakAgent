# convert-test-helpers.ps1 - Convert ES6 exports to CommonJS

$files = @(
    'tests\helpers\testUtils.js',
    'tests\helpers\mockAIService.js',
    'tests\helpers\mockDatabase.js',
    'tests\helpers\assertModel.js'
)

foreach ($file in $files) {
    Write-Host "Converting $file..."
    $content = Get-Content $file -Raw
    
    # Replace export statements
    $content = $content -replace '(?m)^export function', 'function'
    $content = $content -replace '(?m)^export async function', 'async function'
    $content = $content -replace '(?m)^export const', 'const'
    
    # Save back
    Set-Content -Path $file -Value $content -NoNewline
    Write-Host "  Done"
}

Write-Host ""
Write-Host "All files converted!"
