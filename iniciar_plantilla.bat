@echo off
title Asistente de Inicio - Plantilla POS
color 0A

echo ==================================================
echo    INICIANDO ASISTENTE DE CONFIGURACION Y DESARROLLO
echo ==================================================
echo.

cd /d "C:\Users\SERGIO\Desktop\plantillas"
if errorlevel 1 (
    echo [ERROR] No se encontro la carpeta "plantillas" en el escritorio.
    pause
    exit /b
)

echo [1/4] Ejecutando configuracion interactiva...
call npm run configure
echo.

echo [2/4] Instalando dependencias (esto puede tardar unos minutos)...
call npm run install:all
echo.

echo [3/4] Inicializando base de datos con Prisma...
cd backend
call npx prisma db push
echo.

set /p SEED="¿Desea sembrar la base de datos con datos de prueba? (S/N): "
if /i "%SEED%"=="S" (
    echo Sembrando datos...
    call npm run seed
)
cd ..
echo.

echo [4/4] Iniciando servidores de desarrollo (Frontend + Backend)...
echo Presione CTRL+C en esta ventana para detener los servidores.
echo.
call npm run dev
pause
