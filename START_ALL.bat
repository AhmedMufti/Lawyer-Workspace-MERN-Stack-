@echo off
color 0A
echo =========================================
echo  PAKISTAN LEGAL NEXUS - START ALL
echo =========================================
echo.
echo Starting Backend and Frontend servers...
echo.
echo This will open 2 new windows:
echo   1. Backend Server (Port 5000)
echo   2. Frontend Server (Port 3000)
echo.
echo =========================================
echo.
echo [0/3] Cleaning up ports...

REM Kill any processes using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill any processes using port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo   ✅ Ports cleaned!
echo.

REM Start Backend in new window
echo [1/2] Starting Backend Server...
start "PLN Backend - Port 5000" cmd /c "cd backend && npm run dev"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak > nul

REM Start Frontend in new window
echo [2/2] Starting Frontend Server...
start "PLN Frontend - Port 3000" cmd /c "cd frontend && npm start"

echo.
echo =========================================
echo  ✅ SERVERS STARTING!
echo =========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two new windows have opened:
echo   - Backend Server Window
echo   - Frontend Server Window
echo.
echo To stop servers: Close the terminal windows
echo                  OR press Ctrl+C in each window
echo.
echo =========================================
echo.
pause
