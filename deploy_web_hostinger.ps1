# PitayaCode AcuaCore - Web Deployment Script (Hostinger)
# Uso: .\deploy_web_hostinger.ps1

$ErrorActionPreference = "Stop"

# Configuración de Hostinger
$SSH_USER = "u471794305"
$SSH_HOST = "185.212.71.206"
$SSH_PORT = "65002"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_citaia"
$REMOTE_PATH = "domains/acuacore.pitayacode.io/public_html" 

Write-Host "--- Iniciando Despliegue Web (Hostinger) - AcuaCore ---" -ForegroundColor Cyan

try {
    # 1. Construir el proyecto
    Write-Host "Step 1: Construyendo proyecto Vite..." -ForegroundColor Yellow
    Set-Location web
    npm run build
    Set-Location ..

    # 2. Empaquetar la carpeta dist
    Write-Host "Step 2: Empaquetando carpeta dist..." -ForegroundColor Yellow
    $ARCHIVE = "acuacore_web_deploy.tar.gz"
    if (Test-Path $ARCHIVE) { Remove-Item $ARCHIVE }
    
    Set-Location web/dist
    tar -czf ../../$ARCHIVE .
    Set-Location ../..

    # 3. Preparar directorio remoto (¡IMPORTANTE: esto debe ir antes de scp!)
    Write-Host "Step 3: Asegurando directorio remoto en Hostinger..." -ForegroundColor Yellow
    ssh -p $SSH_PORT -i $SSH_KEY -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" "mkdir -p ${REMOTE_PATH}"

    # 4. Subir a Hostinger
    Write-Host "Step 4: Subiendo a Hostinger ($SSH_HOST)..." -ForegroundColor Yellow
    scp -P $SSH_PORT -i $SSH_KEY -o StrictHostKeyChecking=no $ARCHIVE "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/"

    # 5. Extraer en el servidor
    Write-Host "Step 5: Extrayendo archivos..." -ForegroundColor Yellow
    ssh -p $SSH_PORT -i $SSH_KEY -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" "cd ${REMOTE_PATH} && tar -xzf ${ARCHIVE} && rm ${ARCHIVE}"

    Write-Host "--- DESPLIEGUE WEB COMPLETADO CON ÉXITO ---" -ForegroundColor Green
    Write-Host "NOTA: Si recibes NXDOMAIN, asegúrate de crear el subdominio 'acuacore' en el panel de Hostinger." -ForegroundColor Yellow
    Write-Host "URL: https://acuacore.pitayacode.io" -ForegroundColor Cyan
}
catch {
    Write-Host "Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Sugerencia: Verifica que el subdominio exista en Hostinger y que la ruta sea correcta." -ForegroundColor Gray
}
finally {
    if (Test-Path $ARCHIVE) { Remove-Item $ARCHIVE }
}
