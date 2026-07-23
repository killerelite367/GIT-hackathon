@echo off
REM ============================================================
REM  StudyQuest - first-time GitHub setup (run once)
REM  Double-click this file, or run it from a terminal in this folder.
REM ============================================================
setlocal

echo Cleaning any half-created git data...
if exist ".git" rmdir /s /q ".git"

echo Initializing repository...
git init
git branch -M main

echo Staging files...
git add .
git commit -m "Initial commit: StudyQuest scaffold (React + Vite + TS + Tailwind + Supabase)"

echo.
set /p REPO="Paste your GitHub repo URL (e.g. https://github.com/USER/GIT-HACKATHON.git): "
git remote add origin %REPO%
git push -u origin main

echo.
echo Done. Refresh your GitHub repo page to see the files.
pause
