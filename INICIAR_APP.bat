@echo off
title FitCheck - Provador Virtual com IA
chcp 65001 >nul
cd /d "%~dp0"

echo =======================================================
echo          FITCHECK - PROVADOR VIRTUAL IE
echo ======================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no sistema!
    echo Por favor, instale o Node.js em https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] Primeira execucao detectada. Instalando dependencias...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha ao instalar dependencias do projeto.
        pause
        exit /b 1
    )
)

echo [INFO] Iniciando o FitCheck na porta 3000...
echo [INFO] Abrindo o navegador em http://localhost:3000
echo.

start "" "http://localhost:3000"
call npm run dev -- --port 3000 --host

pause
