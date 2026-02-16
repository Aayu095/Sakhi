# Complete App Restart Script
Write-Host "=== COMPLETE APP RESTART ===" -ForegroundColor Cyan

# Stop any running processes
Write-Host "`n1. Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear all caches
Write-Host "`n2. Clearing all caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue
Write-Host "   ✓ Caches cleared" -ForegroundColor Green

# Start fresh
Write-Host "`n3. Starting fresh server..." -ForegroundColor Yellow
Write-Host "   Run: npm start --clear" -ForegroundColor Cyan
Write-Host "`n=== READY TO START ===" -ForegroundColor Green
Write-Host "Please run: npm start --clear" -ForegroundColor White
