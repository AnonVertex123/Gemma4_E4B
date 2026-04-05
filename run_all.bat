@echo off
setlocal
cd /d I:\Gemma4_E4B

echo [1/4] Dang kiem tra moi truong Python...
python -m venv venv
if %errorlevel% neq 0 (
    echo [ERROR] Python khong ton tai hoac bi loi trong PATH. Hay kiem tra lai "python" command.
    pause
    exit /b 1
)

echo [2/4] Dang kich hoat moi truong ao va cai dat thu vien...
call venv\Scripts\activate
python -m pip install -U ollama

echo [3/4] Dang build model TuminhAGI_G4...
ollama create TuminhAGI_G4 -f Tuminh_G4.modelfile

echo [4/4] Dang chay Deploy Gemma 4...
python deploy_gemma4.py

echo.
echo [HOAN THANH] He thong da chay xong.
pause
