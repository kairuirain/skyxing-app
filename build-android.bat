@echo off
echo ========================================
echo  SkyXing Android Build Script
echo ========================================

set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
set ANDROID_HOME=E:\Android\Sdk
set ANDROID_SDK_ROOT=E:\Android\Sdk
set NDK_HOME=E:\Android\Sdk\ndk\27.0.12077973

echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo NDK_HOME=%NDK_HOME%
echo.

cd /d "%~dp0src-tauri\gen\android"

echo Building Android APK (Release)...
echo.

set GRADLE_BIN=C:\Users\Administrator\.gradle\wrapper\dists\gradle-8.14.3-bin\a58f7e4a0b42a1b0c9a6d9e3f4c5b6d7\gradle-8.14.3\bin\gradle.bat

call "%GRADLE_BIN%" assembleRelease --no-daemon

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  BUILD SUCCESSFUL!
    echo ========================================
    
    REM Copy APK to releases directory
    for /r app\build\outputs\apk\release %%f in (*.apk) do (
        echo Copying %%f to releases...
        copy /Y "%%f" "%~dp0releases\" >nul
    )
    
    REM Copy AAB if exists
    for /r app\build\outputs\bundle\release %%f in (*.aab) do (
        echo Copying %%f to releases...
        copy /Y "%%f" "%~dp0releases\" >nul
    )
    
    echo.
    echo APK(s) copied to: %~dp0releases\
    dir "%~dp0releases\" /b
) else (
    echo.
    echo ========================================
    echo  BUILD FAILED! Check errors above.
    echo ========================================
    exit /b %ERRORLEVEL%
)

pause
