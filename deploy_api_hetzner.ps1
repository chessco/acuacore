# PitayaCode AcuaCore - Production Deploy Script (Hetzner)
# Uso: .\deploy_api_hetzner.ps1

$ErrorActionPreference = "Stop"
$SERVER_IP = "46.224.155.43"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_citaia"

Write-Host "--- Iniciando Despliegue de Producción (Hetzner) - AcuaCore ---" -ForegroundColor Cyan

try {
    Write-Host "Step 1: Empaquetando y subiendo código y configuración..." -ForegroundColor Yellow
    
    # Comprimir api y archivos de compose (excluyendo node_modules y dist)
    tar --exclude="node_modules" --exclude="dist" -czf deploy_acuacore_api.tar.gz api docker-compose.prod.yml
    
    scp -i $SSH_KEY -o StrictHostKeyChecking=no deploy_acuacore_api.tar.gz root@${SERVER_IP}:/opt/pitaya/acuacore/

    Write-Host "Step 2: Descomprimiendo y reconstruyendo en el servidor..." -ForegroundColor Yellow
    
    $remoteCommands = @"
        cd /opt/pitaya/acuacore
        
        echo 'Limpiando conflictos de contenedores antiguos...'
        # Detener cualquier contenedor que pueda estar usando el puerto 3014
        docker stop acuacore-api-prod acua-core-api 2>/dev/null || true
        docker rm acuacore-api-prod acua-core-api 2>/dev/null || true
        
        echo 'Descomprimiendo archivos...'
        tar -xzf deploy_acuacore_api.tar.gz
        rm deploy_acuacore_api.tar.gz
        
        echo 'Reconstruyendo contenedores...'
        docker compose -f docker-compose.prod.yml up -d --build
        
        echo 'Esperando inicialización (5s)...'
        sleep 5
        
        echo 'Estado final del contenedor:'
        docker ps --filter name=acua-core-api
        
        echo 'Últimos logs:'
        docker logs --tail 20 acua-core-api
"@

    ssh -i $SSH_KEY -o StrictHostKeyChecking=no root@$SERVER_IP $remoteCommands

    Write-Host "--- DESPLIEGUE API COMPLETADO CON ÉXITO ---" -ForegroundColor Green
}
catch {
    Write-Host "Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if (Test-Path "deploy_acuacore_api.tar.gz") { Remove-Item "deploy_acuacore_api.tar.gz" }
}
