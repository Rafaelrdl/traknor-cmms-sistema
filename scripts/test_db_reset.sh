#!/bin/bash

# Script de teste para validar o sistema de reset do PostgreSQL

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
NC='\033[0m'

log() {
    echo -e "${GREEN}[TEST] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    return 1
}

# Função para testar descoberta de volumes
test_volume_discovery() {
    log "Testando descoberta de volumes..."
    
    # Lista volumes existentes
    local volumes=$(docker volume ls --format "table {{.Name}}" | grep -E "(postgres|spark-template)" || true)
    
    if [[ -n "$volumes" ]]; then
        info "Volumes encontrados:"
        echo "$volumes"
    else
        info "Nenhum volume PostgreSQL encontrado"
    fi
    
    return 0
}

# Função para testar se PostgreSQL está acessível
test_postgres_access() {
    log "Testando acesso ao PostgreSQL..."
    
    # Verifica se o serviço está rodando
    if ! docker compose ps $DB_SERVICE --format "table {{.State}}" | grep -q "running"; then
        info "PostgreSQL não está rodando. Iniciando..."
        docker compose up -d $DB_SERVICE
        
        # Aguarda ficar pronto
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if docker compose exec -T $DB_SERVICE pg_isready -U $DB_USER >/dev/null 2>&1; then
                info "PostgreSQL está pronto!"
                break
            fi
            
            info "Aguardando PostgreSQL... ($attempt/$max_attempts)"
            sleep 2
            attempt=$((attempt + 1))
        done
        
        if [ $attempt -gt $max_attempts ]; then
            error "PostgreSQL não ficou pronto"
        fi
    fi
    
    # Testa conexão
    local result=$(docker compose exec -T $DB_SERVICE \
        psql -U $DB_USER -d postgres -tAc "SELECT 1;" 2>/dev/null || echo "ERRO")
    
    if [[ "$result" == "1" ]]; then
        log "✅ Conexão PostgreSQL funcionando"
    else
        error "❌ Falha na conexão PostgreSQL"
    fi
}

# Função para testar autenticação com senha
test_password_authentication() {
    log "Testando autenticação com senha..."
    
    # Testa conexão usando container temporário com senha
    local result=$(docker compose run --rm -e PGPASSWORD=$DB_PASSWORD $DB_SERVICE \
        psql -h $DB_SERVICE -U $DB_USER -d postgres -tAc "SELECT 'AUTH_OK';" 2>/dev/null || echo "AUTH_FAIL")
    
    if [[ "$result" == "AUTH_OK" ]]; then
        log "✅ Autenticação com senha funcionando"
    else
        error "❌ Falha na autenticação com senha"
    fi
}

# Função para testar criação e acesso ao database
test_database_operations() {
    log "Testando operações no database..."
    
    # Verifica se database existe
    local db_exists=$(docker compose exec -T $DB_SERVICE \
        psql -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null || echo "0")
    
    if [[ "$db_exists" == "1" ]]; then
        log "✅ Database '$DB_NAME' existe"
        
        # Testa operações no database
        local test_result=$(docker compose exec -T $DB_SERVICE \
            psql -U $DB_USER -d $DB_NAME -tAc "SELECT 'DB_ACCESS_OK';" 2>/dev/null || echo "DB_ACCESS_FAIL")
        
        if [[ "$test_result" == "DB_ACCESS_OK" ]]; then
            log "✅ Acesso ao database '$DB_NAME' funcionando"
        else
            error "❌ Falha no acesso ao database '$DB_NAME'"
        fi
    else
        info "Database '$DB_NAME' não existe (pode ser primeira execução)"
    fi
}

# Função para testar comandos do Makefile
test_makefile_commands() {
    log "Testando comandos do Makefile..."
    
    # Verifica se os comandos existem no Makefile
    if grep -q "db-reset:" Makefile; then
        log "✅ Comando 'make db-reset' encontrado no Makefile"
    else
        error "❌ Comando 'make db-reset' não encontrado no Makefile"
    fi
    
    if grep -q "db-reset-logical:" Makefile; then
        log "✅ Comando 'make db-reset-logical' encontrado no Makefile"
    else
        error "❌ Comando 'make db-reset-logical' não encontrado no Makefile"
    fi
}

# Função para testar scripts de reset
test_reset_scripts() {
    log "Testando scripts de reset..."
    
    # Verifica se scripts existem e são executáveis
    if [[ -x "./scripts/reset_db.sh" ]]; then
        log "✅ Script 'reset_db.sh' existe e é executável"
    else
        error "❌ Script 'reset_db.sh' não encontrado ou não executável"
    fi
    
    if [[ -x "./scripts/reset_db_logical.sh" ]]; then
        log "✅ Script 'reset_db_logical.sh' existe e é executável"
    else
        error "❌ Script 'reset_db_logical.sh' não encontrado ou não executável"
    fi
}

# Função para gerar relatório do ambiente
generate_environment_report() {
    log "Gerando relatório do ambiente..."
    
    echo
    echo "==================== RELATÓRIO DE AMBIENTE ===================="
    
    # Informações do Docker Compose
    info "Serviços Docker Compose:"
    docker compose ps || info "Nenhum serviço rodando"
    
    echo
    # Volumes
    info "Volumes PostgreSQL:"
    docker volume ls | grep -E "(postgres|spark-template)" || info "Nenhum volume PostgreSQL encontrado"
    
    echo
    # Configuração do banco
    info "Configuração do banco:"
    echo "  - Database: $DB_NAME"
    echo "  - User: $DB_USER"
    echo "  - Service: $DB_SERVICE"
    
    echo "=========================================================="
}

# Função principal
main() {
    log "Iniciando testes de validação do sistema de reset PostgreSQL..."
    echo
    
    # Testes básicos
    test_volume_discovery
    test_postgres_access
    test_password_authentication
    test_database_operations
    
    echo
    
    # Testes de configuração
    test_makefile_commands
    test_reset_scripts
    
    echo
    
    # Relatório
    generate_environment_report
    
    log "🎉 Testes de validação concluídos!"
    echo
    info "Para testar os resets:"
    echo "  - Reset completo: make db-reset"
    echo "  - Reset lógico: make db-reset-logical"
}

# Executa se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
