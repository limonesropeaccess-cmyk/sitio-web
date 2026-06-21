@echo off
chcp 65001 >nul
title Actualizar galeria - Limones Rope Access
echo.
echo ============================================
echo   Actualizando la galeria del sitio...
echo ============================================
echo.

cd /d "%~dp0"
node actualizar-galeria.js

echo.
echo ============================================
echo   Listo. Revisa gallery.json si queres
echo   ajustar algun titulo o descripcion.
echo ============================================
echo.
pause
