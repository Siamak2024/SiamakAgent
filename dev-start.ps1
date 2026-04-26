# EA Platform — Local Dev Startup Script
# Usage:  .\dev-start.ps1
# Checks prerequisites, then starts the server and opens browser.

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  EA Platform — Local Dev Startup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Node is installed ───────────────────────────────────────────────
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ── 2. Create .env from .env.example if missing ──────────────────────────────
$envFile     = Join-Path $Root ".env"
$envExample  = Join-Path $Root ".env.example"

if (-not (Test-Path $envFile)) {
    Write-Host "[WARN] No .env file found." -ForegroundColor Yellow
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "[OK]  Created .env from .env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "  >>> IMPORTANT: Edit .env and add your OPENAI_API_KEY <<<" -ForegroundColor Yellow
        Write-Host "      File: $envFile" -ForegroundColor Yellow
        Write-Host ""
        $key = Read-Host "  Paste your OpenAI API key now (or press Enter to skip)"
        if ($key.Trim() -ne '') {
            (Get-Content $envFile) -replace 'your_openai_api_key_here', $key.Trim() | Set-Content $envFile
            Write-Host "[OK]  API key saved to .env" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARN] .env.example not found either. Creating minimal .env..." -ForegroundColor Yellow
        "PORT=3000`nOPENAI_API_KEY=" | Set-Content $envFile
    }
} else {
    Write-Host "[OK] .env file found" -ForegroundColor Green

    # Check if key is still the placeholder
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'your_openai_api_key_here') {
        Write-Host "[WARN] OPENAI_API_KEY is still the placeholder value in .env" -ForegroundColor Yellow
        $key = Read-Host "  Paste your real OpenAI API key (or press Enter to skip)"
        if ($key.Trim() -ne '') {
            (Get-Content $envFile) -replace 'your_openai_api_key_here', $key.Trim() | Set-Content $envFile
            Write-Host "[OK]  API key updated in .env" -ForegroundColor Green
        }
    }
}

# ── 3. Install dependencies if node_modules missing ──────────────────────────
$nodeModules = Join-Path $Root "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "[INFO] node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK]  Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] node_modules present" -ForegroundColor Green
}

# ── 4. Resolve PORT from .env (default 3000) ─────────────────────────────────
$port = 3000
$envContent = Get-Content $envFile -Raw
if ($envContent -match 'PORT\s*=\s*(\d+)') {
    $port = [int]$Matches[1]
}
$url = "http://localhost:$port"

Write-Host ""
Write-Host "[INFO] Starting server on $url ..." -ForegroundColor Cyan

# ── 5. Start server in background job ────────────────────────────────────────
$serverJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    node server.js
} -ArgumentList $Root

Start-Sleep -Seconds 2

# Check if server started OK (job still running = good)
if ($serverJob.State -eq 'Failed') {
    Write-Host "[ERROR] Server failed to start. Check server.js." -ForegroundColor Red
    Receive-Job $serverJob
    exit 1
}

Write-Host "[OK]  Server started (Job ID: $($serverJob.Id))" -ForegroundColor Green

# ── 6. Open browser ──────────────────────────────────────────────────────────
Start-Sleep -Milliseconds 800
Write-Host "[INFO] Opening $url in your browser..." -ForegroundColor Cyan
Start-Process $url

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Server running at $url" -ForegroundColor Green
Write-Host "  Dev dashboard: $url" -ForegroundColor Green
Write-Host "  NexGen EA V11:  $url/NexGenEA/NexGenEA_V11.html" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

# ── 7. Keep alive — stream server output ─────────────────────────────────────
try {
    while ($serverJob.State -eq 'Running') {
        $output = Receive-Job $serverJob -ErrorAction SilentlyContinue
        if ($output) { Write-Host $output }
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host ""
    Write-Host "[INFO] Stopping server..." -ForegroundColor Yellow
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
    Write-Host "[OK]  Server stopped." -ForegroundColor Green
}
