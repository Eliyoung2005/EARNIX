# ============================================================
# EARNIX - Master Launch Script
# Starts: Next.js dev server + Cloudflare Tunnel
# ============================================================

$ErrorActionPreference = "Continue"
$projectDir = $PSScriptRoot

# Refresh PATH so cloudflared is found in this session
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   EARNIX - Starting Services...        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Kill any existing processes on port 3000 ---
Write-Host "[1/4] Clearing port 3000..." -ForegroundColor Yellow
$existing = netstat -ano | Select-String ":3000 " | ForEach-Object {
    ($_ -split "\s+")[-1]
} | Sort-Object -Unique
foreach ($pid in $existing) {
    if ($pid -match '^\d+$' -and $pid -ne "0") {
        try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
    }
}
Start-Sleep -Seconds 1

# --- 2. Start Next.js dev server in background ---
Write-Host "[2/4] Starting Next.js dev server on port 3000..." -ForegroundColor Yellow
$nextJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev 2>&1
} -ArgumentList $projectDir

# Wait for Next.js to be ready (max 40s)
Write-Host "[3/4] Waiting for Next.js to be ready..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -lt 500) {
            $ready = $true
            break
        }
    } catch {}
    Write-Host "   Waiting... ($($i+1)s)" -ForegroundColor DarkGray
}

if (-not $ready) {
    Write-Host "   [WARN] Next.js might still be compiling -- continuing anyway." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "[4/4] Starting Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host ""

# --- 3. Start Cloudflare tunnel ---
# Use separate stdout/stderr log files (PowerShell limitation)
$tunnelOut = Join-Path $projectDir "tunnel-out.log"
$tunnelErr = Join-Path $projectDir "tunnel-err.log"
foreach ($f in @($tunnelOut, $tunnelErr)) {
    if (Test-Path $f) { Remove-Item $f -Force }
}

$tunnelProcess = Start-Process -FilePath "cloudflared" `
    -ArgumentList "tunnel", "--url", "http://localhost:3000" `
    -RedirectStandardOutput $tunnelOut `
    -RedirectStandardError $tunnelErr `
    -PassThru -WindowStyle Hidden

# Wait for URL to appear in either log file (max 30s)
# cloudflared writes the URL to stderr
$publicUrl = $null
Write-Host "   Waiting for tunnel URL..." -ForegroundColor DarkGray
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    foreach ($logFile in @($tunnelErr, $tunnelOut)) {
        if (Test-Path $logFile) {
            $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
            if ($content -match 'https://[a-z0-9\-]+\.trycloudflare\.com') {
                $publicUrl = $Matches[0]
                break
            }
        }
    }
    if ($publicUrl) { break }
}

Write-Host ""

if ($publicUrl) {
    # Update .env with the live tunnel URL
    $envPath = Join-Path $projectDir ".env"
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'NEXTAUTH_URL=.*', "NEXTAUTH_URL=`"$publicUrl`""
    Set-Content $envPath $envContent -Encoding UTF8

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   [OK] EARNIX IS LIVE!                 " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "   >> Public URL (mobile + desktop):" -ForegroundColor White
    Write-Host "   $publicUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Share this link -- works on any device!" -ForegroundColor White
    Write-Host "   NOTE: URL is temporary -- changes on each restart." -ForegroundColor DarkGray
    Write-Host "   Powered by Cloudflare (stable while running)" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Write URL to a quick-access file
    $publicUrl | Out-File -FilePath (Join-Path $projectDir "LIVE-URL.txt") -Encoding UTF8
    Write-Host "   URL saved to: LIVE-URL.txt" -ForegroundColor DarkGray
} else {
    Write-Host "[WARN] Could not extract tunnel URL automatically." -ForegroundColor DarkYellow
    Write-Host "   Check tunnel-err.log for the URL manually." -ForegroundColor DarkYellow
    Write-Host "   Run: Get-Content tunnel-err.log | Select-String trycloudflare" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "   Press Ctrl+C to stop all services." -ForegroundColor DarkGray
Write-Host ""

# --- 4. Keep-alive: monitor both processes ---
try {
    while ($true) {
        Start-Sleep -Seconds 10

        # Check if Next.js job is still running
        $jobState = (Get-Job -Id $nextJob.Id -ErrorAction SilentlyContinue).State
        if ($jobState -ne "Running") {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') [WARN] Next.js stopped. Restarting..." -ForegroundColor DarkYellow
            $nextJob = Start-Job -ScriptBlock {
                param($dir)
                Set-Location $dir
                npm run dev 2>&1
            } -ArgumentList $projectDir
        }

        # Check if tunnel is still alive
        if ($tunnelProcess.HasExited) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') [WARN] Tunnel stopped. Restarting..." -ForegroundColor DarkYellow
            foreach ($f in @($tunnelOut, $tunnelErr)) {
                if (Test-Path $f) { Remove-Item $f -Force }
            }
            $tunnelProcess = Start-Process -FilePath "cloudflared" `
                -ArgumentList "tunnel", "--url", "http://localhost:3000" `
                -RedirectStandardOutput $tunnelOut `
                -RedirectStandardError $tunnelErr `
                -PassThru -WindowStyle Hidden

            Start-Sleep -Seconds 10
            foreach ($logFile in @($tunnelErr, $tunnelOut)) {
                if (Test-Path $logFile) {
                    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
                    if ($content -match 'https://[a-z0-9\-]+\.trycloudflare\.com') {
                        $newUrl = $Matches[0]
                        Write-Host "$(Get-Date -Format 'HH:mm:ss') [NEW URL] $newUrl" -ForegroundColor Cyan
                        $newUrl | Out-File -FilePath (Join-Path $projectDir "LIVE-URL.txt") -Encoding UTF8
                        break
                    }
                }
            }
        }
    }
} finally {
    # Cleanup on Ctrl+C
    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Yellow
    if ($tunnelProcess -and -not $tunnelProcess.HasExited) {
        $tunnelProcess.Kill()
    }
    Stop-Job -Id $nextJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $nextJob.Id -ErrorAction SilentlyContinue

    # Restore local URL in .env
    $envPath = Join-Path $projectDir ".env"
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'NEXTAUTH_URL="https://[^"]*"', 'NEXTAUTH_URL="http://localhost:3000"'
    Set-Content $envPath $envContent -Encoding UTF8

    Write-Host "Services stopped. .env restored to localhost." -ForegroundColor Green
}
