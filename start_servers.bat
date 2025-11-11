@echo off
echo Starting Air Quality Dashboard Servers...
echo.

echo Starting Flask Backend Server...
start "Flask Backend Server" cmd /k "cd /d C:\Users\singh\OneDrive\Desktop\AQI_data && python AQI_learning\app.py"

echo Starting FastAPI Backend Server...
start "FastAPI Backend Server" cmd /k "cd /d C:\Users\singh\OneDrive\Desktop\AQI_data\AQI_learning && uvicorn fastapi_app:app --host 0.0.0.0 --port 5001 --reload"

echo Waiting for backends to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d C:\Users\singh\OneDrive\Desktop\AQI_data\demo_aqi && npm run dev"

echo.
echo All servers are starting...
echo Flask Backend: http://localhost:4000
echo FastAPI Backend: http://localhost:5001
echo Frontend: http://localhost:4008
echo.
echo Press any key to exit...
pause > nul


