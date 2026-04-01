@echo off
setlocal

cd /d "%~dp0"

echo Launching all services...
echo - Frontend: http://localhost:3000
echo - Backend : http://localhost:4000
echo - ML      : http://localhost:5001
echo.

start "Frontend" cmd /k "cd /d "%~dp0" && npm start"
start "Backend" cmd /k "cd /d "%~dp0" && node server.js"
start "ML Service" cmd /k "cd /d "%~dp0ml_service" && if exist ".venv\Scripts\activate.bat" (call .venv\Scripts\activate.bat && python app.py) else (python app.py)"

echo Started. You can close this window.
