@echo off
echo [INFO] Dang khoi tao TuminhAGI_G4 model thong qua Ollama...
cd /d I:\Gemma4_E4B
ollama create TuminhAGI_G4 -f Tuminh_G4.modelfile
echo [SUCCESS] Model da duoc build thanh cong!
pause
