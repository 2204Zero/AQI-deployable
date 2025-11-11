@echo off
REM Unified Startup Script for AQI Dashboard (Windows Batch)
echo ============================================================
echo AQI Dashboard - Unified Startup
echo ============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Run the unified startup script
python start_unified.py

pause




