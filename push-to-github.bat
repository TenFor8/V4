@echo off
setlocal
echo ===================================================
echo CourseGlide - Quick Git Import and Push Helper
echo ===================================================
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed yet on your computer.
    echo.
    echo Download the free installer here:
    echo https://git-scm.com/download/win
    echo.
    echo Once installed, double-click this file again!
    pause
    exit /b 1
)

if not exist ".git" (
    echo [*] Initializing Git repository on branch 'main'...
    git init -b main
)

echo [*] Staging project files...
git add src .gitignore next.config.mjs package.json postcss.config.mjs README.md tailwind.config.ts tsconfig.json start-app.bat push-to-github.bat

echo [*] Creating commit...
git commit -m "CourseGlide: minimal UI, dark mode toggle, dual reviews & TA hub"

echo.
echo ---------------------------------------------------
set /p REPO_URL="Paste your GitHub Repo URL (e.g. https://github.com/YOUR_USER/YOUR_REPO.git): "
echo ---------------------------------------------------

if "%REPO_URL%"=="" (
    echo No URL provided. Your changes were safely committed locally on 'main'.
    pause
    exit /b 0
)

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [*] Pushing to GitHub main branch...
git push -u origin main --force

echo.
echo ===================================================
echo Push complete! Refresh your GitHub page in browser.
echo ===================================================
pause
