@echo off
color 0B
echo =========================================
echo  PAKISTAN LEGAL NEXUS - DEV MODE
echo =========================================
echo.
echo This will start BOTH servers in background
echo and show their logs in this window.
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop BOTH servers
echo =========================================
echo.
pause

REM Install concurrently if not already installed
echo Installing concurrently (if needed)...
cd backend
call npm install -g concurrently 2>nul

REM Go back to root
cd ..

echo.
echo Starting servers...
echo.

REM Run both servers concurrently
npx concurrently -n "BACKEND,FRONTEND" -c "blue,magenta" "cd backend && npm run dev" "cd frontend && npm start"
