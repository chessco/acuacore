# PitayaCode AcuaCore - Production Deploy Script (Hetzner)
# Uso: .\deploy_api_hetzner.ps1

$ErrorActionPreference = "Stop"
$SERVER_IP = "46.224.155.43"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_citaia"

Write-Host "--- Iniciando Despliegue de AcuaCore API (Hetzner) ---" -ForegroundColor Cyan

try {
    # Cambiar al directorio de acuacore para comprimir correctamente
    $oldDir = Get-Location
    Set-Location "c:\PitayaCode\acuacore"
    
    # Comprimir api (excluyendo node_modules y dist)
    tar --exclude="node_modules" --exclude="dist" -czf deploy_acuacore_api.tar.gz api docker-compose.prod.yml
    
    # Asegurar que el directorio remoto existe
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no root@${SERVER_IP} "mkdir -p /opt/pitaya/acuacore/"
    
    scp -i $SSH_KEY -o StrictHostKeyChecking=no deploy_acuacore_api.tar.gz root@${SERVER_IP}:/opt/pitaya/acuacore/
    
    # Volver al directorio anterior
    Set-Location $oldDir

    Write-Host "Step 2: Descomprimiendo y reconstruyendo..." -ForegroundColor Yellow
    
    $remoteCommands = @"
        mkdir -p /opt/pitaya/acuacore
        cd /opt/pitaya/acuacore
        
        echo 'Descomprimiendo archivos...'
        # Limpiar directorio de api para evitar conflictos con archivos viejos
        rm -rf api
        tar -xzf deploy_acuacore_api.tar.gz
        rm deploy_acuacore_api.tar.gz
        
        echo 'Reconstruyendo contenedor acua-core-api...'
        docker compose -f docker-compose.prod.yml up -d --build postgres api
        
        echo 'Sincronizando esquema de base de datos...'
        docker exec acua-core-api npx prisma db push --schema=prisma/mysql.prisma --accept-data-loss
        
        echo 'Esperando inicializacion (5s)...'
        sleep 5
        
        echo 'Estado final de los contenedores:'
        docker ps --filter name=acua-core
        
        echo 'Ultimos logs de API:'
        docker logs --tail 20 acua-core-api
"@

    ssh -i $SSH_KEY -o StrictHostKeyChecking=no root@$SERVER_IP $remoteCommands

    Write-Host "--- DESPLIEGUE COMPLETADO CON EXITO ---" -ForegroundColor Green
}
catch {
    Write-Host "Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
