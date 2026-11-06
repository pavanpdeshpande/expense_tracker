@echo off
title Personal Expense Tracker - Launcher
echo =====================================================================
echo       Starting Personal Expense Tracker (FinTrack Local)
echo =====================================================================
echo.

cd /d "%~dp0"

:: Check if virtual environment exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [NOTICE] First time launch detected. Running setup first...
    call setup.bat
)

echo [1/3] Launching Python FastAPI Backend on http://localhost:8000...
start "Expense Tracker - Backend" /min cmd /c "cd /d "%~dp0backend" && call venv\Scripts\activate && python run_backend.py"

echo [2/3] Launching React Vite Frontend on http://localhost:3000...
start "Expense Tracker - Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Waiting for servers to initialize...
ping 127.0.0.1 -n 4 >nul

echo.
echo =====================================================================
echo Application is now live!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Opening browser...
echo Use stop.bat to stop the servers when finished.
echo =====================================================================
start http://localhost:3000

exit
