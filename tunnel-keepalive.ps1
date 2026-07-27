while ($true) {
    Write-Host "Starting tunnel..."
    npx localtunnel --port 3000 --subdomain earnix-pro-testing
    Write-Host "Tunnel crashed or closed. Restarting in 2 seconds..."
    Start-Sleep -Seconds 2
}
