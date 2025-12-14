@echo off
color 0C
echo =========================================
echo  PORT 5000 CLEANUP UTILITY
echo =========================================
echo.
echo This will free up port 5000 by killing
echo any process using it.
echo.
echo =========================================
echo.

echo Checking for processes using port 5000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    set PID=%%a
)

if defined PID (
    echo Found process using port 5000: PID %PID%
    echo.
    echo Killing process...
    taskkill /PID %PID% /F
    echo.
    echo ✅ Port 5000 is now free!
) else (
    echo ✅ Port 5000 is already free - nothing to do!
)

echo.
echo =========================================
echo.
pause
