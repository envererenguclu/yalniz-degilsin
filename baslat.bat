@echo off
cd /d "%~dp0"

start "Server" cmd /k "node server.js"

timeout /t 2

start "Ngrok" cmd /k ".\ngrok\ngrok.exe http 3000"

pause