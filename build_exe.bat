@echo off
echo ===============================================
echo   Feed Factory Admin - EXE Builder
echo ===============================================
echo.

echo [1/3] Installing dependencies (this may take a while)...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error during installation!
    pause
    exit /b
)

echo.
echo [2/3] Building Next.js App...
call npm run build
if %errorlevel% neq 0 (
    echo Error during Web Build!
    pause
    exit /b
)

echo.
echo [3/3] Packaging as Desktop App (.exe)...
call npm run dist
if %errorlevel% neq 0 (
    echo Error during Electron Packaging!
    pause
    exit /b
)

echo.
echo ===============================================
echo   SUCCESS!
echo   The installation file is located in:
echo   frontend\dist
echo ===============================================
pause
