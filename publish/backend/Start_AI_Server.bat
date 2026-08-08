@echo off
title Portfolio Management System Python API Server
color 0A
echo ==========================================
echo Starting Python API Server...
echo Please keep this window open while using the application.
echo ==========================================
call venv\Scripts\activate.bat
python api_server.py
pause
