#!/bin/bash

# Script para reset apenas do database lógico (sem remover volumes)
# Útil quando não queremos perder configurações do cluster PostgreSQL

set -e

# Configurações
DB_SERVICE="db"
DB_NAME="traknor"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Função para confirmar operação
confirm_reset() {
    warn "⚠️  RESET DO DATABASE LÓGICO ⚠️"
    echo
    echo "Este script irá:"
    echo "  1. Dropar o database '$DB_NAME' (se existir)"
    echo "  2. Recriar o database '$DB_NAME'"
    echo "  3. PERDER todos os dados, mas manter configurações do cluster"
    echo
    echo "NOTA: Este método NÃO redefine senhas do PostgreSQL."
    echo "      Para garantir senhas das variáveis de ambiente, use o reset completo."
    echo
    read -p "Deseja continuar? (s/N): " confirmation
    
    if [[ "$confirmation" != "s" && "$confirmation" != "S" ]]; then
        info "Operação cancelada pelo usuário."
        exit 0
    fi
}

# Função para verificar se PostgreSQL está rodando
check_postgres_running() {
    if ! docker compose ps $DB_SERVICE --format "table {{.State}}" | grep -q "running"; then
        log "Iniciando serviço PostgreSQL..."
        docker compose up -d $DB_SERVICE
        
        # Aguarda ficar pronto
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if docker compose exec -T $DB_SERVICE pg_isready -U $DB_USER >/dev/null 2>&1; then
                log "✅ PostgreSQL está pronto!"
                break
            fi
            
            info "Aguardando PostgreSQL... ($attempt/$max_attempts)"
            sleep 2
            attempt=$((attempt + 1))
        done
        
        if [ $attempt -gt $max_attempts ]; then
            error "PostgreSQL não ficou pronto"
        fi
    else
        log "PostgreSQL já está rodando"
    fi
}

# Função para resetar database lógico
reset_database() {
    log "Resetando database lógico '$DB_NAME'..."
    
    # Conecta ao database 'postgres' para poder dropar o database 'traknor'
    local drop_cmd="DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);"
    local create_cmd="CREATE DATABASE $DB_NAME;"
    
    # Executa drop database
    info "Dropando database '$DB_NAME'..."
    docker compose exec -T $DB_SERVICE psql -U $DB_USER -d postgres -c "$drop_cmd" || {
        error "Falha ao dropar database"
    }
    
    # Cria database novamente
    info "Criando database '$DB_NAME'..."
    docker compose exec -T $DB_SERVICE psql -U $DB_USER -d postgres -c "$create_cmd" || {
        error "Falha ao criar database"
    }
    
    log "✅ Database '$DB_NAME' resetado com sucesso"
}

# Função para testar a conexão
test_connection() {
    log "Testando conexão com o database..."
    
    local result=$(docker compose exec -T $DB_SERVICE \
        psql -U $DB_USER -d $DB_NAME -tAc "SELECT 'OK' as status;" 2>/dev/null || echo "ERRO")
    
    if [[ "$result" == "OK" ]]; then
        log "✅ Conexão com database funcionando"
    else
        error "❌ Falha na conexão com database"
    fi
}

# Função para aplicar migrações Django
apply_migrations() {
    log "Aplicando migrações Django..."
    
    # Verifica se backend está rodando
    if ! docker compose ps backend --format "table {{.State}}" | grep -q "running"; then
        log "Iniciando backend para aplicar migrações..."
        docker compose up -d backend
        sleep 5
    fi
    
    # Aplica migrações
    docker compose exec -T backend python manage.py migrate || {
        warn "Falha ao aplicar migrações automaticamente"
        info "Execute manualmente: docker compose exec backend python manage.py migrate"
    }
    
    log "✅ Migrações aplicadas"
}

# Função principal
main() {
    log "Iniciando reset do database lógico..."
    
    # Confirma operação
    confirm_reset
    
    # Verifica se PostgreSQL está rodando
    check_postgres_running
    
    # Reset do database
    reset_database
    
    # Testa conexão
    test_connection
    
    # Aplica migrações
    apply_migrations
    
    log "🎉 Reset do database lógico concluído!"
}

# Executa o script principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
