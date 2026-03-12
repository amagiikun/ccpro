@echo off
setlocal enabledelayedexpansion

REM CCPro Auto Test (Smoke) - runs every 30 minutes
REM Logs: .\logs\auto-test-YYYYMMDD.log

cd /d %~dp0\..

if not exist logs mkdir logs

:loop
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set YYYYMMDD=%%i
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format HH:mm:ss"') do set HHMMSS=%%i

echo [%date% %time%] Running smoke tests...>> logs\auto-test-%YYYYMMDD%.log

call npm run test:smoke >> logs\auto-test-%YYYYMMDD%.log 2>&1
set EXITCODE=%ERRORLEVEL%

if not "%EXITCODE%"=="0" (
  echo [%date% %time%] Smoke tests FAILED (exit=%EXITCODE%).>> logs\auto-test-%YYYYMMDD%.log
) else (
  echo [%date% %time%] Smoke tests OK.>> logs\auto-test-%YYYYMMDD%.log
)

echo.>> logs\auto-test-%YYYYMMDD%.log

REM wait 30 minutes
timeout /t 1800 /nobreak > nul
goto loop
