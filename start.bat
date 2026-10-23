@echo off
title SNAPBOX Photobooth
echo ==========================================
echo   Menjalankan SNAPBOX Photobooth...
echo ==========================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
