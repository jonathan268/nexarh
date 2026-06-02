@echo off
echo =====================================
echo  NexaRH - Construction installateur
echo =====================================
echo.

:: Vérifier Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Node.js n'est pas installe. Telechargez-le sur https://nodejs.org
    pause
    exit /b 1
)

:: Vérifier npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : npm n'est pas trouve.
    pause
    exit /b 1
)

echo [1/3] Installation des dependances...
call npm install
if %errorlevel% neq 0 (
    echo ERREUR lors de l'installation des dependances.
    pause
    exit /b 1
)

echo [2/3] Construction de l'application et de l'installateur...
REM Le postinstall rebuild better-sqlite3 automatiquement
call npm run dist:win
if %errorlevel% neq 0 (
    echo ERREUR lors de la construction.
    pause
    exit /b 1
)

echo.
echo =====================================
echo  SUCCES !
echo =====================================
echo.
echo L'installateur se trouve dans le dossier :
echo   %CD%\dist-installer\
echo.
pause
