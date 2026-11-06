@echo off
title Personal Expense Tracker - Setup
echo =====================================================================
echo       Personal Expense Tracker - Automated Setup
echo =====================================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ and re-run setup.bat
    pause
    exit /b 1
)
echo [OK] Python found.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ and re-run setup.bat
    pause
    exit /b 1
)
echo [OK] Node.js found.

echo.
echo ---------------------------------------------------------------------
echo Step 1/3: Setting up Python Virtual Environment and Dependencies...
echo ---------------------------------------------------------------------
cd /d "%~dp0backend"
if not exist "venv" (
    echo Creating virtual environment in backend\venv...
    python -m venv venv
)
echo Installing backend requirements...
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend requirements.
    pause
    exit /b 1
)

echo.
echo Initializing local SQLite database...
python -c "from app.database import engine, Base, SessionLocal; from app.services.seed import seed_defaults; Base.metadata.create_all(bind=engine); db = SessionLocal(); seed_defaults(db); db.close(); print('[OK] Database and default categories initialized successfully.')"

echo.
echo ---------------------------------------------------------------------
echo Step 2/3: Installing Frontend NPM Dependencies...
echo ---------------------------------------------------------------------
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend packages.
    pause
    exit /b 1
)

echo.
echo ---------------------------------------------------------------------
echo Step 3/3: Setup Complete!
echo ---------------------------------------------------------------------
echo.
echo To launch the application, simply run:
echo    start.bat
echo.
echo To stop all running servers, run:
echo    stop.bat
echo.
ping 127.0.0.1 -n 3 >nul
