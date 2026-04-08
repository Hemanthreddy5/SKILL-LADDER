@echo off
echo Quick Start - Job Portal Project

echo Starting Backend...
cd backend
start "Backend" cmd /k "python main.py"

echo Starting Code Runner...
cd ..\code-runner  
start "Code Runner" cmd /k "python app.py"

echo Starting Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo Services starting...
echo Backend: http://localhost:8000
echo Code Runner: http://localhost:5000
echo Frontend: http://localhost:3000
pause