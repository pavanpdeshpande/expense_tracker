@echo off
title Personal Expense Tracker - Shutdown
echo =====================================================================
echo       Stopping Personal Expense Tracker Servers
echo =====================================================================
echo.

echo Stopping processes on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes on port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] All Personal Expense Tracker local servers have been stopped.
ping 127.0.0.1 -n 2 >nul
exit
