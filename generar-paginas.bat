@echo off
chcp 65001 >nul
title Generar paginas - Limones Rope Access
echo.
echo ============================================
echo   Generando paginas internas y sitemap...
echo ============================================
echo.

cd /d "%~dp0"
node _src\generar-paginas.js

echo.
echo ============================================
echo   Listo. Revisa los cambios en GitHub Desktop
echo   y subilos (Commit + Push).
echo ============================================
echo.
pause
