$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "[watchdog] Starting persistent server watchdog in $root"
Write-Host "[watchdog] Press Ctrl+C to stop watchdog"

while ($true) {
  $start = Get-Date
  Write-Host "[watchdog] Launching server at $($start.ToString('yyyy-MM-dd HH:mm:ss'))"

  try {
    node server.js
    $exitCode = $LASTEXITCODE
  } catch {
    $exitCode = 1
    Write-Host "[watchdog] Server crashed: $($_.Exception.Message)"
  }

  $end = Get-Date
  Write-Host "[watchdog] Server stopped at $($end.ToString('yyyy-MM-dd HH:mm:ss')) with exit code $exitCode"
  Write-Host "[watchdog] Restarting in 3 seconds..."
  Start-Sleep -Seconds 3
}
