@echo off
color 0A
echo =========================================
echo    PAKISTAN LEGAL NEXUS - QUICK START
echo =========================================
echo.
echo Welcome to Pakistan Legal Nexus Setup!
echo.
echo This script will help you get started quickly.
echo.
echo ☁️  Using MongoDB Atlas Cloud Database
echo    (No local MongoDB installation needed!)
echo.
echo =========================================
echo  CHOOSE AN OPTION:
echo =========================================
echo.
echo 1. Start Backend Only (Port 5000)
echo 2. Start Frontend Only (Port 3000)
echo 3. Create Backend .env file from example
echo 4. Check Installation Status
echo 5. Exit
echo.
echo =========================================

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto createenv
if "%choice%"=="4" goto checkstatus
if "%choice%"=="5" goto end

echo Invalid choice! Please try again.
pause
goto end

:backend
echo.
echo Starting Backend Server...
echo.
cd backend
npm run dev
goto end

:frontend
echo.
echo Starting Frontend Server...
echo.
cd frontend
npm start
goto end

:createenv
echo.
echo Creating .env file from .env.example...
echo.
if exist "backend\.env" (
    echo WARNING: .env file already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" goto end
)
copy "backend\.env.example" "backend\.env"
echo.
echo ✓ .env file created successfully!
echo ✓ Location: backend\.env
echo.
echo IMPORTANT: Please edit backend\.env and update:
echo   - JWT_SECRET (use a strong random string)
echo   - Payment gateway credentials (when available)
echo   - SMS API keys (when available)
echo.
pause
goto end

:checkstatus
echo.
echo =========================================
echo  INSTALLATION STATUS CHECK
echo =========================================
echo.
echo [Backend]
if exist "backend\node_modules" (
    echo   ✓ Backend dependencies installed
) else (
    echo   ✗ Backend dependencies NOT installed
    echo     Run: cd backend ^&^& npm install
)

if exist "backend\.env" (
    echo   ✓ Backend .env file exists
) else (
    echo   ! Backend .env file missing (Optional for now)
    echo     Run option 3 to create it
)

if exist "backend\server.js" (
    echo   ✓ Backend server.js exists
) else (
    echo   ✗ Backend server.js missing!
)

echo.
echo [Frontend]
if exist "frontend\node_modules" (
    echo   ✓ Frontend dependencies installed
) else (
    echo   ✗ Frontend dependencies NOT installed
    echo     Run: cd frontend ^&^& npm install
)

if exist "frontend\src\App.js" (
    echo   ✓ Frontend App.js exists
) else (
    echo   ✗ Frontend App.js missing!
)

echo.
echo [Node.js]
node --version > nul 2>&1
if errorlevel 1 (
    echo   ✗ Node.js NOT installed
) else (
    echo   ✓ Node.js installed
    node --version
)

echo.
echo [MongoDB]
mongod --version > nul 2>&1
if errorlevel 1 (
    echo   ✗ MongoDB NOT installed or not in PATH
) else (
    echo   ✓ MongoDB installed
)

echo.
echo =========================================
echo.
pause
goto end

:end
exit
