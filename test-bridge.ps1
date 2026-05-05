# Integration Test: AcuaCore <-> Flow Bridge
$apiKey = $env:PITAYA_INTERNAL_KEY # Set this in your environment for security
if (-not $apiKey) { $apiKey = "YOUR_INTERNAL_KEY_HERE" }
$tenantSlug = "pitaya"

# Production Flow API
Write-Host "Connecting to Production Flow..." -ForegroundColor Yellow
$flowUrl = "https://flow-api.pitayacode.io"
Write-Host "Using Flow API at: $flowUrl" -ForegroundColor Gray

# Use ngrok URL for AcuaCore Local
$ACUACORE_TUNNEL = "https://67a1-2806-263-481-978-a0ac-f952-680f-bfb9.ngrok-free.app"
$acuacoreUrl = $ACUACORE_TUNNEL
Write-Host "Using AcuaCore Tunnel at: $acuacoreUrl" -ForegroundColor Gray

Write-Host "`n--- Testing Flow API Auth & Tenant Resolution ---" -ForegroundColor Cyan

# 1. Test Get Conversations (Resolving slug 'pitaya')
try {
    $headers = @{
        "x-api-key" = $apiKey
        "x-tenant-id" = $tenantSlug
    }
    # Try with and without /api prefix
    $response = try { 
        Invoke-RestMethod -Uri "$flowUrl/whatsapp/conversations" -Headers $headers -Method Get -ErrorAction Stop
    } catch {
        Invoke-RestMethod -Uri "$flowUrl/api/whatsapp/conversations" -Headers $headers -Method Get -ErrorAction Stop
    }
    Write-Host "[SUCCESS] Flow API responded. Found $($response.Count) conversations." -ForegroundColor Green
} catch {
    Write-Host "[FAILURE] Flow API error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test Invalid API Key
try {
    $headers = @{ "x-api-key" = "wrong_key"; "x-tenant-id" = $tenantSlug }
    $response = Invoke-RestMethod -Uri "$flowUrl/whatsapp/conversations" -Headers $headers -Method Get
    Write-Host "[FAILURE] Flow API accepted a wrong key!" -ForegroundColor Red
} catch {
    Write-Host "[SUCCESS] Flow API rejected invalid key as expected." -ForegroundColor Green
}

Write-Host "`n--- Testing Webhook Forwarding (Flow -> AcuaCore) ---" -ForegroundColor Cyan

# 3. Simulate Flow forwarding a message to AcuaCore via ngrok
try {
    $headers = @{
        "x-internal-key" = $apiKey
        "x-tenant-id" = "edd1ac37-5ff9-4e46-bc7f-fff3c414d718"
        "Content-Type" = "application/json"
    }
    $body = @{
        userId = "526442221844"
        content = "Test message from ngrok tunnel"
        externalId = "wamid.ngrok_$(Get-Date -Format 'yyyyMMddHHmmss')"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$acuacoreUrl/api/webhooks/flow/incoming" -Headers $headers -Method Post -Body $body
    Write-Host "[SUCCESS] AcuaCore (via ngrok) accepted the forwarded message." -ForegroundColor Green
} catch {
    Write-Host "[FAILURE] AcuaCore webhook error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Gray
    }
}

Write-Host "`n--- Verification Complete ---" -ForegroundColor Cyan
