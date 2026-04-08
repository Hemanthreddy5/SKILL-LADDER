@echo off
echo Starting Job Portal Project...

echo.
echo 1. Starting Backend Server...
cd backend
start cmd /k "python main.py"
cd ..

echo.
echo 2. Starting Code Runner...
cd code-runner
start cmd /k "pip install -r requirements.txt && python app.py"
cd ..

echo.
echo 3. Starting Frontend...
cd frontend
start cmd /k "npm install && npm start"
cd ..

echo.
echo All services started!
echo Backend: http://localhost:8000
echo Code Runner: http://localhost:5000  
echo Frontend: http://localhost:3000
echo.
pause