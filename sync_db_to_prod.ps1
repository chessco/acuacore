# Script para sincronizar la base de datos local (DOCKER) con producción
# Uso: .\sync_db_to_prod.ps1

$DB_NAME = "acuacore_db"
$REMOTE_HOST = "46.224.155.43"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_citaia"

Write-Host "--- Iniciando Sincronización de Base de Datos (Vía Docker) ---" -ForegroundColor Yellow

# 1. Exportar local usando CMD (forzando UTF-8 para evitar problemas de "ñ" y acentos)
Write-Host "Step 1: Exportando base de datos limpia con soporte para acentos..." -ForegroundColor Cyan
cmd /c "chcp 65001 > nul && docker exec luxury-mysql mysqldump -u root -pacuacore_pass --databases $DB_NAME --hex-blob --skip-extended-insert > db_dump.sql"

if ($LASTEXITCODE -ne 0) { 
    Write-Host "Intentando con nombre alternativo 'luxury-mysql-prod'..." -ForegroundColor Gray
    cmd /c "chcp 65001 > nul && docker exec luxury-mysql-prod mysqldump -u root -pacuacore_pass --databases $DB_NAME --hex-blob --skip-extended-insert > db_dump.sql"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error definitivo al exportar." -ForegroundColor Red
    exit
}

# 2. Subir al servidor
Write-Host "Step 2: Subiendo dump al servidor Hetzner..." -ForegroundColor Cyan
scp -i $SSH_KEY db_dump.sql "root@${REMOTE_HOST}:~/db_dump.sql"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Error al subir archivo" -ForegroundColor Red; exit }

# 3. Importar en el contenedor remoto
Write-Host "Step 3: Importando en contenedor de producción (luxury-mysql-prod)..." -ForegroundColor Cyan
ssh -i $SSH_KEY "root@${REMOTE_HOST}" "docker exec -i luxury-mysql-prod mysql --binary-mode=1 --default-character-set=utf8mb4 -u root -pluxury_pass $DB_NAME < ~/db_dump.sql"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Error al importar en producción" -ForegroundColor Red; exit }

# Limpieza
Remove-Item db_dump.sql
Write-Host "✅ ¡Sincronización completada con éxito!" -ForegroundColor Green
Write-Host "Los datos de producción ahora son una copia exacta de tu local de Docker." -ForegroundColor Gray
