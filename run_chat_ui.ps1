# run_chat_ui.ps1 - Cấu hình bản vá Ollama
$env:PYTHONHOME = ""
$env:PYTHONPATH = ""

$BASE_DIR = "I:\Gemma4_E4B"
if (Test-Path $BASE_DIR) {
    Set-Location $BASE_DIR
}

# Kích hoạt Venv
$ACTIVATE_PATH = ".\venv\Scripts\Activate.ps1"
if (Test-Path $ACTIVATE_PATH) {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
    & $ACTIVATE_PATH
}

# Cài đặt thư viện cần thiết
Write-Host "[INFO] Dang kiem tra va cap nhat thu vien tu requirements.txt..." -ForegroundColor Cyan
python -m pip install -r requirements.txt

# Khởi chạy giao diện
Write-Host "[INFO] Dang khoi chay Tu Minh qua Backend Ollama..." -ForegroundColor Green
python chat_ui.py

Pause
