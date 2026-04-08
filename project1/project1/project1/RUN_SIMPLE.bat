@echo off
echo Starting Job Portal - Simple Mode

echo 1. Backend Server...
cd backend
start "Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo 2. Code Runner...
cd ..\code-runner
start "Code Runner" cmd /k "python app.py"

timeout /t 3 /nobreak > nul

echo 3. Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo Services started!
echo Backend: http://localhost:8000
echo Code Runner: http://localhost:5000
echo Frontend: http://localhost:3000
pause