# SkyXing App 构建脚本
# 用于构建 Windows 和 Android 应用

param(
    [string]$Platform = "all",
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ReleasesDir = "$RootDir/releases"

# 确保 releases 目录存在
New-Item -ItemType Directory -Force -Path $ReleasesDir | Out-Null

Write-Host "=== SkyXing App Build Script ===" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Cyan

# 安装依赖
Write-Host "`n[1/3] Installing dependencies..." -ForegroundColor Yellow
Set-Location $RootDir
npm install

# 检查 Rust 环境
try {
    rustc --version | Out-Null
    Write-Host "  Rust is available" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Rust is not installed. Please install Rust from https://rustup.rs/" -ForegroundColor Red
    Write-Host "  Skipping Tauri builds. Only web dist will be built." -ForegroundColor Yellow
}

if ($Platform -eq "all" -or $Platform -eq "windows") {
    Write-Host "`n[2/3] Building Windows..." -ForegroundColor Yellow
    
    # 构建前端
    npm run build
    
    # Tauri Windows build
    try {
        npm run tauri:build:windows
        Write-Host "  Windows build completed!" -ForegroundColor Green
        
        # 复制构建产物到 releases
        $msiPath = "$RootDir/src-tauri/target/release/bundle/msi/*.msi"
        $exePath = "$RootDir/src-tauri/target/release/bundle/nsis/*.exe"
        
        if (Test-Path $RootDir/src-tauri/target/release/bundle/msi) {
            Copy-Item $msiPath -Destination "$ReleasesDir/SkyXing-$Version-windows-x64.msi" -Force
            Write-Host "    MSI installer copied to releases/" -ForegroundColor Green
        }
        if (Test-Path $RootDir/src-tauri/target/release/bundle/nsis) {
            Copy-Item $exePath -Destination "$ReleasesDir/SkyXing-$Version-windows-x64-setup.exe" -Force
            Write-Host "    NSIS installer copied to releases/" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Windows build failed: $_" -ForegroundColor Red
        Write-Host "  Make sure Rust and Tauri CLI are properly installed." -ForegroundColor Yellow
    }
}

if ($Platform -eq "all" -or $Platform -eq "android") {
    Write-Host "`n[3/3] Building Android..." -ForegroundColor Yellow
    
    try {
        npm run tauri:build:android
        Write-Host "  Android build completed!" -ForegroundColor Green
        
        # 复制 APK 到 releases
        $apkPath = "$RootDir/src-tauri/gen/android/app/build/outputs/apk/release/*.apk"
        if (Test-Path "$RootDir/src-tauri/gen/android/app/build/outputs/apk/release") {
            Get-ChildItem $apkPath | ForEach-Object {
                Copy-Item $_.FullName -Destination "$ReleasesDir/SkyXing-$Version-android.apk" -Force
            }
            Write-Host "    APK copied to releases/" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Android build failed: $_" -ForegroundColor Red
        Write-Host "  Make sure Android SDK and NDK are properly configured." -ForegroundColor Yellow
    }
}

Write-Host "`n=== Build Complete ===" -ForegroundColor Cyan
Write-Host "Releases directory: $ReleasesDir" -ForegroundColor Cyan
Get-ChildItem $ReleasesDir | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }
