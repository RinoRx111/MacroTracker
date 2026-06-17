@echo off
title MacroTracker Launcher
echo ===================================================
echo   Launching MacroTracker Standalone Desktop App...
echo ===================================================
cd /d "%~dp0frontend"
npm run electron
