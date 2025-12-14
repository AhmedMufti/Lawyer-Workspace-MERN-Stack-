@echo off
color 0E
echo =========================================
echo  CLEANUP ALL PORTS
echo =========================================
echo.
echo This will free up both ports 5000 and 3000
echo by killing any processes using them.
echo.
echo Useful when servers don't shut down properly.
echo.
echo =========================================
echo.
pause

echo [1/2] Checking port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    set PID5000=%%a
)

if defined PID5000 (
    echo   Found process: PID %PID5000%
    taskkill /PID %PID5000% /F >nul 2>&1
    echo   ✅ Killed port 5000
) else (
    echo   ✅ Port 5000 already free
)

echo.
echo [2/2] Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID3000=%%a
)

if defined PID3000 (
    echo   Found process: PID %PID3000%
    taskkill /PID %PID3000% /F >nul 2>&1
    echo   ✅ Killed port 3000
) else (
    echo   ✅ Port 3000 already free
)

echo.
echo =========================================
echo  ✅ ALL PORTS CLEANED!
echo =========================================
echo.
echo You can now start your servers.
echo.
pause
