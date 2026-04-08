@echo off
echo Starting Backend and Frontend Servers...
echo.

REM Start Backend Server
echo Starting Backend Server on port 8000...
start "Backend Server" cmd /k "cd backend && python main.py"
timeout /t 3 > nul

REM Start Frontend Server  
echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd frontend && npm start"
timeout /t 3 > nul

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will continue running)...
pause > nul
