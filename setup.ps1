# AI Enterprise Architecture Platform - Quick Setup Script
# Run this script from PowerShell in the project directory

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  AI Enterprise Architecture Platform - Quick Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host ""
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env configuration file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file and add your OpenAI API key!" -ForegroundColor Yellow
    Write-Host "   Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
    Write-Host ""
    
    # Prompt for API key
    $addKey = Read-Host "Would you like to add your OpenAI API key now? (y/n)"
    if ($addKey -eq "y" -or $addKey -eq "Y") {
        $apiKey = Read-Host "Enter your OpenAI API key"
        if ($apiKey) {
            $envContent = Get-Content ".env" -Raw
            $envContent = $envContent -replace "your_openai_api_key_here", $apiKey
            Set-Content ".env" $envContent
            Write-Host "✓ API key added to .env file" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure your OpenAI API key is in .env file" -ForegroundColor White
Write-Host "2. Follow the HTML modification steps in README.md" -ForegroundColor White
Write-Host "3. Start the server with: npm start" -ForegroundColor White
Write-Host "4. Open: http://localhost:3000/EA%20Plattform/EA%2020%20Platform_BD_final_2.html" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see README.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to start server now
$startNow = Read-Host "Would you like to start the server now? (y/n)"
if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Yellow
    Write-Host ""
    npm start
}
