@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo           🏮 TU MINH AGI - RESTART ALL SERVICES
echo ==========================================================
echo [Chu nhan: Hung Dai (Eric)]
echo [Thuc the: Lucian - Gemma 4 E4B]
echo.

cd /d I:\Gemma4_E4B

:: 1. Fix Python Environment
set "PYTHONHOME="
set "PYTHONPATH="

:: 2. Start Dashboard (Gradio) in a new window
echo [INFO] Dang khoi chay Dashboard (Python/Gradio)...
start cmd /k "call venv\Scripts\activate.bat && python chat_ui.py"

:: 3. Start Frontend (Next.js) in a new window
echo [INFO] Dang khoi chay Frontend (Next.js 14)...
cd /d I:\Gemma4_E4B\frontend
start cmd /k "npm run dev:3010"

echo.
echo ==========================================================
echo ✅ DA GUI LENH KHOI CHAY!
echo.
echo - Dashboard UI:  http://localhost:7860 (Hien tai)
echo - Frontend UI:   http://localhost:3010
echo ==========================================================
echo.
pause
