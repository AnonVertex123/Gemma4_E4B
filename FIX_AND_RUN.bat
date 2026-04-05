@echo off
:: Xóa bỏ các cấu hình Python home/path bị lỗi trên hệ thống
set "PYTHONHOME="
set "PYTHONPATH="

echo [INFO] Dang vao thu muc I:\Gemma4_E4B...
cd /d I:\Gemma4_E4B

echo [INFO] Dang chay setup venv va cai dat 4-bit quantization...
python setup_gemma4.py

pause
