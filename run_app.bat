@echo off
echo ==============================================================
echo           FounderOS AI Digital Marketing Agent Launcher
echo ==============================================================
echo.

:: Step 1: Check Python requirements
echo [1/3] Setting up Python virtual environment and backend dependencies...
set VENV_DIR=.venv
if not exist .venv\ (
    if exist venv\ (
        set VENV_DIR=venv
    ) else (
        python -m venv .venv
        set VENV_DIR=.venv
        call .venv\Scripts\activate
        pip install -r backend\requirements.txt
        if %ERRORLEVEL% neq 0 (
            echo.
            echo WARNING: Pip installation encountered errors. Trying normal installation...
            pip install fastapi uvicorn sqlalchemy psycopg2-binary celery redis openai pydantic pydantic-settings httpx python-jose[cryptography] passlib[bcrypt] python-multipart strawberry-graphql
        )
    )
)
echo Using virtual environment in %VENV_DIR%
echo.

:: Step 2: Start backend Uvicorn server in background
echo [2/3] Starting FastAPI backend on http://localhost:8000 ...
start "FastAPI Backend" cmd /k "call %VENV_DIR%\Scripts\activate && uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"
echo.

:: Step 3: Start frontend Next.js server
echo [3/3] Starting Next.js frontend on http://localhost:3000 ...
cd frontend
start "Next.js Frontend" cmd /k "npm run dev"
echo.

echo ==============================================================
echo Startup commands executed!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo GraphQL API: http://localhost:8000/graphql
echo.
echo Press any key to exit this launcher (servers will keep running).
echo ==============================================================
pause > nul

