@echo off
title Club Campestre - POS Server
cd /d "%~dp0"

echo ===================================================
echo   INICIANDO CLUB CAMPESTRE (SERVIDOR Y TUNEL PUBLICO)
echo ===================================================
echo.

:: 1. Realizar copia de seguridad automatica (segun reglas del proyecto)
echo [1/3] Realizando copia de seguridad de la base de datos...
call node scripts/backup.js
echo.

:: 2. Usando base de datos Supabase
echo [2/3] Usando base de datos Supabase (PostgreSQL en la nube)...
echo.

:: 3. Iniciar el servidor local y abrir el navegador
echo [3/3] Iniciando servidores (Backend :3001 + Frontend :3000)...
echo.
echo ===================================================
echo  App Firebase:  https://club-campestre-pos.web.app
echo  Localhost:     http://localhost:3000
echo  DevTunnel:     https://vcm5ts91-3000.usw3.devtunnels.ms/
echo  Alwaysdata:    https://admin.alwaysdata.com
echo  Firebase Adm:  https://console.firebase.google.com
echo ===================================================
echo.

:: Esperar a que arranquen los servidores y abrir Edge con todas las pestañas
start /b cmd /c "ping 127.0.0.1 -n 7 > nul && start msedge https://club-campestre-pos.web.app http://localhost:3000 https://vcm5ts91-3000.usw3.devtunnels.ms/ https://admin.alwaysdata.com https://console.firebase.google.com"

:: Arrancar backend y frontend en paralelo
call npm run dev

pause
