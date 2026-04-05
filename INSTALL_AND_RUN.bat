@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo           TỰ MINH AGI - HỆ THỐNG CÀI ĐẶT TỰ ĐỘNG
echo ==========================================================
echo [Chủ nhân: Hùng Đại (Eric)]
echo [Thực thể: Lucian - Gemma 4 E4B]
echo.

:: 1. Kiểm tra Ollama
echo [1/5] Dang kiem tra Ollama...
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Ollama! Hay tai va cai dat Ollama tai: https://ollama.com
    pause
    exit /b 1
)

:: 2. Tai Model E4B va Build TuminhAGI
echo [2/5] Dang tai "Nao bo" Gemma 4 E4B (9.6GB)...
ollama pull gemma4:e4b
if %errorlevel% neq 0 (
    echo [LOI] Khong the tai Model. Hay kiem tra ket noi Internet.
    pause
    exit /b 1
)

echo [3/5] Dang "Khai mo Nhan than" (Build TuminhAGI_G4)...
ollama create TuminhAGI_G4 -f Tuminh_G4.modelfile
if %errorlevel% neq 0 (
    echo [LOI] Khong the build model. Hay kiem tra file Tuminh_G4.modelfile.
    pause
    exit /b 1
)

:: 3. Phuc hoi moi truong Python
echo [4/5] Dang thiet lap moi truong Python (Venv)...
set "PYTHONHOME="
set "PYTHONPATH="

if not exist venv (
    python -m venv venv
)

call venv\Scripts\activate.bat
echo [INFO] Dang cai dat thu vien (Gradio, Ollama, Pillow, RAG)...
python -m pip install -U pip
python -m pip install -r requirements.txt

:: 4. Chan doan He thong
echo [5/5] Dang thuc hien Chan doan He thong (Health Check)...
python setup_gemma4.py

echo.
echo ==========================================================
echo ✅ CAI DAT HOAN TAT! DANG KHOI CHAY DASHBOARD...
echo ==========================================================
python chat_ui.py

pause
