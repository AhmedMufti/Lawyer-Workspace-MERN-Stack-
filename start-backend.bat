@echo off
echo =========================================
echo  Starting Pakistan Legal Nexus Backend
echo =========================================
echo.

cd backend

echo [1/2] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/2] Starting backend server...
echo.
echo Backend will run on: http://localhost:5000
echo Health Check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
