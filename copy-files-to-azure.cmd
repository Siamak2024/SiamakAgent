@echo off
REM PowerShell Copy Script for Azure Deployment
REM This script copies all necessary files to the azure-deployment/static folder

echo.
echo ================================================
echo Azure Static Web App - File Copy Script
echo ================================================
echo.

setlocal enabledelayedexpansion

set SOURCE_DIR=%~dp0
set DEST_DIR=%SOURCE_DIR%azure-deployment\static

echo Source: %SOURCE_DIR%
echo Destination: %DEST_DIR%
echo.

REM Create destination directories if they don't exist
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"
if not exist "%DEST_DIR%\NexGenEA" mkdir "%DEST_DIR%\NexGenEA"
if not exist "%DEST_DIR%\EA2_Toolkit" mkdir "%DEST_DIR%\EA2_Toolkit"
if not exist "%DEST_DIR%\css" mkdir "%DEST_DIR%\css"
if not exist "%DEST_DIR%\js" mkdir "%DEST_DIR%\js"
if not exist "%DEST_DIR%\data" mkdir "%DEST_DIR%\data"
if not exist "%DEST_DIR%\scripts" mkdir "%DEST_DIR%\scripts"
if not exist "%DEST_DIR%\e2e-artifacts" mkdir "%DEST_DIR%\e2e-artifacts"

echo Creating directories... Done!
echo.
echo Starting file copy...
echo.

REM Copy HTML files from root
echo [1/8] Copying root HTML files...
copy "%SOURCE_DIR%EA 20 Platform_BD_final_2.html" "%DEST_DIR%\" >nul 2>&1
copy "%SOURCE_DIR%Integration_Workflow_Hub.html" "%DEST_DIR%\" >nul 2>&1
copy "%SOURCE_DIR%TEST_SYNC_FLOW.html" "%DEST_DIR%\" >nul 2>&1
echo   ✓ Root HTML files copied

REM Copy NexGenEA folder
echo [2/8] Copying NexGenEA platform files...
xcopy "%SOURCE_DIR%NexGenEA\*.html" "%DEST_DIR%\NexGenEA\" /Y >nul 2>&1
xcopy "%SOURCE_DIR%NexGenEA\js\*" "%DEST_DIR%\NexGenEA\js\" /Y /E >nul 2>&1
echo   ✓ NexGenEA files copied

REM Copy EA2_Toolkit folder
echo [3/8] Copying EA2_Toolkit files...
xcopy "%SOURCE_DIR%EA2_Toolkit\*.html" "%DEST_DIR%\EA2_Toolkit\" /Y >nul 2>&1
xcopy "%SOURCE_DIR%EA2_Toolkit\*" "%DEST_DIR%\EA2_Toolkit\" /Y /E >nul 2>&1
echo   ✓ EA2_Toolkit files copied

REM Copy CSS files
echo [4/8] Copying CSS files...
copy "%SOURCE_DIR%css\ea-design-engine.css" "%DEST_DIR%\css\" >nul 2>&1
copy "%SOURCE_DIR%css\ea-design-v2.css" "%DEST_DIR%\css\" >nul 2>&1
copy "%SOURCE_DIR%css\ea-nordic-theme.css" "%DEST_DIR%\css\" >nul 2>&1
echo   ✓ CSS files copied

REM Copy JS modules
echo [5/8] Copying JavaScript modules...
copy "%SOURCE_DIR%js\*.js" "%DEST_DIR%\js\" >nul 2>&1
echo   ✓ JavaScript files copied

REM Copy data folder
echo [6/8] Copying data folder...
xcopy "%SOURCE_DIR%data\*" "%DEST_DIR%\data\" /Y /E >nul 2>&1
echo   ✓ Data folder copied

REM Copy scripts folder
echo [7/8] Copying scripts...
xcopy "%SOURCE_DIR%scripts\*" "%DEST_DIR%\scripts\" /Y /E >nul 2>&1
echo   ✓ Scripts copied

REM Copy e2e-artifacts
echo [8/8] Copying e2e artifacts...
xcopy "%SOURCE_DIR%e2e-artifacts\*" "%DEST_DIR%\e2e-artifacts\" /Y /E >nul 2>&1
echo   ✓ E2E artifacts copied

echo.
echo ================================================
echo ✓ All files copied successfully!
echo ================================================
echo.
echo Total files/directories copied to:
echo %DEST_DIR%
echo.
echo Next steps:
echo 1. Review files in azure-deployment\static\
echo 2. Update HTML files to use Azure Function proxy
echo 3. Push to GitHub for deployment
echo.
pause
