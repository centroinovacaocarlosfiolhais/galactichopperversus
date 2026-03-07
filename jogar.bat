@echo off
title Galactic Hopper VS

echo.
echo  ==========================================
echo    GALACTIC HOPPER VS - A INICIAR...
echo  ==========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERRO: Node.js nao encontrado!
    echo.
    echo  Instala em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo  A instalar dependencias...
    npm install
    echo.
)

echo  A iniciar servidor...
echo.
start "" http://localhost:3000
node server.js

pause
