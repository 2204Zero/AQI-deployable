@echo off
title AQI Dashboard Launcher
color 0A

echo.
echo ========================================
echo    AQI DASHBOARD LAUNCHER
echo ========================================
echo.
echo Starting Flask backend...
echo.

cd /d "%~dp0AQI_learning"

echo Starting backend on port 5000...
start "Flask Backend" cmd /k "python app.py"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Opening dashboard in browser...
start "" "%~dp0index.html"

echo.
echo ========================================
echo    DASHBOARD LAUNCHED SUCCESSFULLY!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: index.html
echo.
echo Press any key to exit this launcher...
pause >nul