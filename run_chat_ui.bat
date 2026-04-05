@echo off
setlocal
set "PYTHONHOME="
set "PYTHONPATH="

cd /d I:\Gemma4_E4B

:: Kiểm tra Virtual Environment
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Moi truong ao (venv) chua duoc tao. Hay chay FIX_AND_RUN.bat truoc.
    pause
    exit /b 1
)

echo [INFO] Dang kich hoat moi truong ao...
call venv\Scripts\activate

echo [INFO] Dang kiem tra va cai dat Gradio...
python -m pip install gradio

echo [INFO] Dang khoi chay Giao dien Chat cho Tu Minh...
python chat_ui.py

pause
