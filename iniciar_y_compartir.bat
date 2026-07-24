@echo off
title Club Campestre - POS Server
cd /d "%~dp0"

echo ===================================================
echo   INICIANDO CLUB CAMPESTRE (SERVIDOR Y TUNEL PUBLICO)
echo ===================================================
echo.

:: 1. Realizar copia de seguridad automática (según reglas del proyecto)
echo [1/3] Realizando copia de seguridad de la base de datos...
call node scripts/backup.js
echo.

:: 2. Asegurar que Docker esté arriba (Desactivado: Se usa SQLite)
:: echo [2/3] Levantando base de datos en Docker...
:: call npm run db:up
echo [2/3] Usando base de datos Supabase (PostgreSQL en la nube)...
echo.

:: 3. Iniciar el servidor local y abrir el navegador
echo [3/3] Iniciando servidores (Backend :3001 + Frontend :3000)...
echo.
echo ===================================================
echo  Local:   http://localhost:3000
echo  Publico: https://vcm5ts91-3000.usw3.devtunnels.ms/
echo  Presiona CTRL+C para detener los servidores.
echo ===================================================
echo.

:: Esperar 6 segundos a que arranquen los servidores y abrir en Edge
start /b cmd /c "ping 127.0.0.1 -n 7 > nul && start msedge http://localhost:3000 && start msedge https://vcm5ts91-3000.usw3.devtunnels.ms/"

:: Arrancar backend y frontend en paralelo
call npm run dev

pause
