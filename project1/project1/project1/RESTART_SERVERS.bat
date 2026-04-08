@echo off
echo Restarting servers to fix connection issues...

taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

timeout /t 2 /nobreak > nul

echo Starting Backend...
cd backend
start "Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo Starting Code Runner...
cd ..\code-runner
start "Code Runner" cmd /k "python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo Servers restarted!
echo Backend: http://localhost:8000
echo Code Runner: http://localhost:5000
echo Frontend: http://localhost:3000
pause