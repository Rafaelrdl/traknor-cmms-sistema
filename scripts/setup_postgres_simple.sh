#!/bin/bash

set -e

echo "🐘 TrakNor CMMS - PostgreSQL Native Setup (Simplificado)"
echo "========================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 1. Garantir que PostgreSQL está instalado
log "Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    log "Instalando PostgreSQL..."
    apt-get update && apt-get install -y postgresql postgresql-client
fi

# 2. Configurar PostgreSQL para aceitar conexões
log "Configurando PostgreSQL..."

# Editar postgresql.conf
PGCONF="/etc/postgresql/15/main/postgresql.conf"
if [ -f "$PGCONF" ]; then
    log "Configurando postgresql.conf..."
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" $PGCONF
    sed -i "s/#port = 5432/port = 5432/g" $PGCONF
fi

# Editar pg_hba.conf
PGHBA="/etc/postgresql/15/main/pg_hba.conf"
if [ -f "$PGHBA" ]; then
    log "Configurando pg_hba.conf..."
    # Adicionar linha para permitir conexões com senha
    echo "host    all             all             0.0.0.0/0               md5" >> $PGHBA
    # Mudar peer para md5 para local
    sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/g' $PGHBA
fi

# 3. Iniciar PostgreSQL (sem sudo -u postgres)
log "Iniciando PostgreSQL..."
service postgresql start

# Aguardar PostgreSQL estar pronto
log "Aguardando PostgreSQL..."
for i in {1..30}; do
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        log "PostgreSQL está pronto!"
        break
    fi
    sleep 1
done

# 4. Configurar usuário e database (método alternativo)
log "Configurando usuário e database..."

# Criar script SQL temporário
cat > /tmp/setup.sql << 'EOF'
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE IF NOT EXISTS traknor;
GRANT ALL PRIVILEGES ON DATABASE traknor TO postgres;
EOF

# Executar como usuário postgres usando peer authentication
su -c "psql -f /tmp/setup.sql" postgres 2>/dev/null || {
    # Se falhar, tentar método direto
    log "Tentando método alternativo..."
    
    # Resetar senha do usuário postgres do sistema
    echo "postgres:postgres" | chpasswd
    
    # Tentar novamente
    su -c "psql -f /tmp/setup.sql" postgres 2>/dev/null || {
        error "Não foi possível configurar database. Tentando método direto..."
        
        # Método mais direto - editar diretamente
        systemctl stop postgresql
        su - postgres -c "/usr/lib/postgresql/15/bin/postgres --single -D /var/lib/postgresql/15/main" << 'EOSQL'
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE traknor;
EOSQL
        systemctl start postgresql
    }
}

# Limpar arquivo temporário
rm -f /tmp/setup.sql

# 5. Testar conexão
log "Testando conexão..."
if PGPASSWORD=postgres psql -h localhost -U postgres -d traknor -c "SELECT 1;" >/dev/null 2>&1; then
    log "✅ Setup concluído com sucesso!"
    echo ""
    echo "Configuração:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: traknor"  
    echo "  User: postgres"
    echo "  Password: postgres"
else
    error "❌ Falha na conexão. Verifique os logs."
    tail -n 20 /var/log/postgresql/postgresql-15-main.log 2>/dev/null || echo "Não foi possível acessar logs"
    exit 1
fi
