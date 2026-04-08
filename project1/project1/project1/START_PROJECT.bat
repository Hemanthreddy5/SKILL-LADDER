@echo off
echo Starting Job Portal Project...

echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
echo.

echo Installing Code Runner Dependencies...
cd ..\code-runner
pip install -r requirements.txt
echo.

echo Installing Frontend Dependencies...
cd ..\frontend
call npm install
echo.

echo Starting all services...
echo.

echo 1. Starting Backend Server...
cd ..\backend
start "Backend" cmd /k "python main.py"

echo 2. Starting Code Runner...
cd ..\code-runner
start "Code Runner" cmd /k "python app.py"

echo 3. Starting Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo All services started!
echo Backend: http://localhost:8000
echo Code Runner: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul