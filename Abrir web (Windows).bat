@echo off
chcp 65001 >nul
title SHUA French Taco - web
cd /d "%~dp0"
where py >nul 2>nul && (py servidor.py & goto fin)
where python >nul 2>nul && (python servidor.py & goto fin)
where node >nul 2>nul && (node servidor.js & goto fin)
echo.
echo   No se ha encontrado Python ni Node.js en este ordenador.
echo   Instala Python desde https://www.python.org/downloads/
echo   (marca "Add python.exe to PATH") y vuelve a abrir este archivo.
echo.
:fin
pause
