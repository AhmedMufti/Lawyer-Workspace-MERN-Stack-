@echo off
color 0C
echo =========================================
echo  PORT 3000 CLEANUP UTILITY
echo =========================================
echo.
echo This will free up port 3000 by killing
echo any process using it.
echo.
echo =========================================
echo.

echo Checking for processes using port 3000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
)

if defined PID (
    echo Found process using port 3000: PID %PID%
    echo.
    echo Killing process...
    taskkill /PID %PID% /F
    echo.
    echo ✅ Port 3000 is now free!
) else (
    echo ✅ Port 3000 is already free - nothing to do!
)

echo.
echo =========================================
echo.
pause
