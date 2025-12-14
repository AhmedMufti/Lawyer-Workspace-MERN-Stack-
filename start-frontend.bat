@echo off
echo =========================================
echo  Starting Pakistan Legal Nexus Frontend
echo =========================================
echo.

cd frontend

echo [1/2] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/2] Starting frontend development server...
echo.
echo Frontend will run on: http://localhost:3000
echo The browser will open automatically
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
