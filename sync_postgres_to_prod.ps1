# Script para sincronizar PostgreSQL local con producción
# Uso: .\sync_postgres_to_prod.ps1

$DB_NAME = "acuacore_vectors"
$REMOTE_HOST = "46.224.155.43"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_citaia"

Write-Host "--- Iniciando Sincronización de PostgreSQL (Vectores y Conocimiento) ---" -ForegroundColor Yellow

# 1. Exportar local usando CMD (para evitar problemas de binarios)
Write-Host "Step 1: Exportando PostgreSQL local desde 'acua-core-postgres'..." -ForegroundColor Cyan
cmd /c "docker exec acua-core-postgres pg_dump -U acuacore_user $DB_NAME > pg_dump.sql"

if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Error al exportar Postgres local." -ForegroundColor Red
    exit 
}

# 2. Subir al servidor
Write-Host "Step 2: Subiendo dump al servidor Hetzner..." -ForegroundColor Cyan
scp -i $SSH_KEY pg_dump.sql "root@${REMOTE_HOST}:~/pg_dump.sql"
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Error al subir archivo" -ForegroundColor Red; exit }

# 3. Importar en el servidor remoto
Write-Host "Step 3: Importando en producción (acua-core-postgres)..." -ForegroundColor Cyan
ssh -i $SSH_KEY "root@${REMOTE_HOST}" "docker exec -i acua-core-postgres psql -U acuacore_user -d $DB_NAME < ~/pg_dump.sql"

if ($LASTEXITCODE -ne 0) { Write-Host "❌ Error al importar en producción" -ForegroundColor Red; exit }

# Limpieza
Remove-Item pg_dump.sql
Write-Host "✅ ¡PostgreSQL sincronizado con éxito!" -ForegroundColor Green
