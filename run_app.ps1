# ==============================================================
#           FounderOS AI Digital Marketing Agent Launcher (PowerShell)
# ==============================================================

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "          FounderOS AI Digital Marketing Agent Launcher" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$VENV_DIR = ".venv"
if (-not (Test-Path ".venv")) {
    if (Test-Path "venv") {
        $VENV_DIR = "venv"
    } else {
        Write-Host "[1/3] Setting up Python virtual environment..." -ForegroundColor Yellow
        python -m venv .venv
        & .venv\Scripts\pip install -r backend\requirements.txt
    }
}
Write-Host "[1/3] Python environment ready in $VENV_DIR" -ForegroundColor Green

Write-Host "[2/3] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; & '$PSScriptRoot\$VENV_DIR\Scripts\activate.ps1'; uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[3/3] Starting Next.js frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "Startup commands executed!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor Green
