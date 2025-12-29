@echo off
echo ========================================
echo   BTLB16 - Firebase Hosting Deploy
echo ========================================
echo.

cd /d "%~dp0"

echo Working directory: %CD%
echo.
echo Executing command:
echo    npx firebase-tools deploy --project btlb16 --only hosting
echo.

npx firebase-tools deploy --project btlb16 --only hosting

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   Deploy thanh cong!
    echo   URL: https://btlb16.web.app
    echo ========================================
) else (
    echo ========================================
    echo   Deploy that bai! Kiem tra lai.
    echo ========================================
)

echo.
pause
