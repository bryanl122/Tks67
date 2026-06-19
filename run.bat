@echo off
REM Lanceur (Windows) - safety checker desactive. Double-clique sur ce fichier.
cd /d "%~dp0"
set DISABLE_SAFETY_CHECKER=1
python app.py
pause
