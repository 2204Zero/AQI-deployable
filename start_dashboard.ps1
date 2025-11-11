# AQI Dashboard Launcher for PowerShell
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    AQI DASHBOARD LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the AQI_learning directory
Set-Location -Path "$PSScriptRoot\AQI_learning"

Write-Host "Starting Flask backend..." -ForegroundColor Green
Write-Host ""

# Start the Flask application in a new window
Start-Process -FilePath "python" -ArgumentList "app.py" -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Opening dashboard in browser..." -ForegroundColor Green
$frontendPath = Join-Path $PSScriptRoot "index.html"
Start-Process -FilePath $frontendPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DASHBOARD LAUNCHED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: index.html" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")