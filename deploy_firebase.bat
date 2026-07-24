@echo off
title Club Campestre - Deploy a Firebase
cd /d "%~dp0"

echo ===================================================
echo   DEPLOY A FIREBASE (FRONTEND + FLY.IO BACKEND)
echo ===================================================
echo.

:: 1. Verificar que VITE_API_URL esté configurado
findstr /C:"REEMPLAZA_CON_TU_URL" frontend\.env.production >nul 2>&1
if not errorlevel 1 (
    echo [ERROR] Aun no has configurado la URL de Fly.io.
    echo Abre el archivo frontend\.env.production y reemplaza
    echo "REEMPLAZA_CON_TU_URL_DE_FLY_IO" con tu URL real de Fly.io
    echo ^(ejemplo: https://campestre-pos-backend.fly.dev^).
    echo.
    pause
    exit /b 1
)

:: 2. Build del frontend (usa .env.production automaticamente)
echo [1/2] Compilando frontend para produccion...
call npm run build --prefix frontend
if errorlevel 1 (
    echo [ERROR] Fallo el build del frontend.
    pause
    exit /b 1
)
echo.

:: 3. Deploy a Firebase Hosting
echo [2/2] Publicando en Firebase Hosting...
call firebase deploy --only hosting
if errorlevel 1 (
    echo [ERROR] Fallo el deploy a Firebase.
    pause
    exit /b 1
)
echo.

echo ===================================================
echo  Deploy exitoso!
echo  Tu app esta en: https://club-campestre-pos.web.app
echo ===================================================
echo.
pause
