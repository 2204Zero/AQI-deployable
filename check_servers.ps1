Write-Host "Checking Air Quality Dashboard Servers..." -ForegroundColor Green
Write-Host ""

# Check Backend Server (Port 5000)
Write-Host "Backend Server (Port 5000):" -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        $healthData = $backendResponse.Content | ConvertFrom-Json
        Write-Host "✅ Backend is running" -ForegroundColor Green
        Write-Host "   Status: $($healthData.status)" -ForegroundColor White
        Write-Host "   Database: $($healthData.database)" -ForegroundColor White
    } else {
        Write-Host "❌ Backend returned status: $($backendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check Frontend Server (Port 5173)
Write-Host "Frontend Server (Port 5173):" -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend returned status: $($frontendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test API endpoints
Write-Host "Testing API Endpoints:" -ForegroundColor Yellow
try {
    $latestResponse = Invoke-WebRequest -Uri "http://localhost:5000/latest" -Method GET -TimeoutSec 5
    if ($latestResponse.StatusCode -eq 200) {
        $latestData = $latestResponse.Content | ConvertFrom-Json
        Write-Host "✅ /latest endpoint working" -ForegroundColor Green
        Write-Host "   Latest data: PM10=$($latestData.pm10), PM2.5=$($latestData.pm25), CO2=$($latestData.co2)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ /latest endpoint failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Dashboard URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Health Check: http://localhost:5000/health" -ForegroundColor White

