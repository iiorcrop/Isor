# ISOR Digital Platform - Start All Servers
# Run this script to start Backend, Frontend, and Admin Dashboard

Write-Host "Starting ISOR Digital Platform..." -ForegroundColor Cyan

# 1. Start Backend
Write-Host "Launching Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js" -WindowStyle Normal

# 2. Start Admin Dashboard
Write-Host "Launching Admin Dashboard (Port 5176)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-dashboard; npm run dev -- --port 5176" -WindowStyle Normal

# 3. Start Frontend
Write-Host "Launching Public Frontend (Port 3000)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --port 3000" -WindowStyle Normal

Write-Host "`nAll systems initiated!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000"
Write-Host "Admin:   http://localhost:5176"
Write-Host "Public:  http://localhost:3000"
