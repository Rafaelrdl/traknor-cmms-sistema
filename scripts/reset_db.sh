#!/bin/bash

# Script para reset completo do PostgreSQL no Docker Compose
# ATENÇÃO: Este script é DESTRUTIVO e remove todos os dados do banco!

set -e

# Configurações
PROJECT_NAME="$(basename "$(pwd)")"
VOLUME_NAME="${PROJECT_NAME}_postgres_data"
DB_SERVICE="db"
BACKEND_SERVICE="backend"
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

# Função para verificar se estamos em ambiente de desenvolvimento
check_dev_environment() {
    if [[ "$NODE_ENV" == "production" || "$ENVIRONMENT" == "production" ]]; then
        error "Este script não deve ser executado em ambiente de PRODUÇÃO!"
    fi
    
    if [[ -f ".env" ]]; then
        if grep -q "NODE_ENV=production\|ENVIRONMENT=production" .env; then
            error "Ambiente de produção detectado no .env. Abortando por segurança."
        fi
    fi
}

# Função para confirmar operação destrutiva
confirm_reset() {
    warn "⚠️  OPERAÇÃO DESTRUTIVA ⚠️"
    echo
    echo "Este script irá:"
    echo "  1. Parar todos os serviços do Docker Compose"
    echo "  2. REMOVER COMPLETAMENTE o volume PostgreSQL '${VOLUME_NAME}'"
    echo "  3. PERDER TODOS OS DADOS do banco de dados"
    echo "  4. Recriar o cluster PostgreSQL do zero"
    echo
    echo "Project: ${PROJECT_NAME}"
    echo "Volume: ${VOLUME_NAME}"
    echo
    read -p "Tem certeza que deseja continuar? (digite 'CONFIRMO' para prosseguir): " confirmation
    
    if [[ "$confirmation" != "CONFIRMO" ]]; then
        info "Operação cancelada pelo usuário."
        exit 0
    fi
}

# Função para descobrir o nome real do volume
discover_volume() {
    log "Descobrindo volumes do PostgreSQL..."
    
    # Lista todos os volumes do compose
    local compose_volumes=$(docker compose config --volumes 2>/dev/null | grep -E "(postgres|db)" || true)
    
    # Lista volumes existentes que correspondem ao padrão
    local existing_volumes=$(docker volume ls --format "table {{.Name}}" | grep -E "(postgres|${PROJECT_NAME})" || true)
    
    info "Volumes encontrados relacionados ao projeto:"
    if [[ -n "$existing_volumes" ]]; then
        echo "$existing_volumes"
    else
        info "Nenhum volume PostgreSQL encontrado."
    fi
    
    # Verifica se o volume esperado existe
    if docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
        log "Volume encontrado: $VOLUME_NAME"
        return 0
    else
        info "Volume $VOLUME_NAME não existe (primeira execução ou já removido)"
        return 1
    fi
}

# Função para parar serviços e remover volumes
stop_and_remove_volumes() {
    log "Parando serviços e removendo volumes..."
    
    # Para todos os serviços
    docker compose down --remove-orphans
    
    # Remove volumes (incluindo os nomeados)
    docker compose down --volumes --remove-orphans
    
    # Verifica se o volume ainda existe e remove explicitamente se necessário
    if docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
        warn "Volume ainda existe, removendo explicitamente..."
        docker volume rm "$VOLUME_NAME" || {
            error "Não foi possível remover o volume $VOLUME_NAME. Verifique se não há containers usando este volume."
        }
    fi
    
    log "✅ Volumes removidos com sucesso"
}

# Função para aguardar o PostgreSQL ficar pronto
wait_for_postgres() {
    log "Aguardando PostgreSQL ficar pronto..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T $DB_SERVICE pg_isready -U $DB_USER >/dev/null 2>&1; then
            log "✅ PostgreSQL está pronto!"
            return 0
        fi
        
        info "Tentativa $attempt/$max_attempts - PostgreSQL ainda não está pronto..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "PostgreSQL não ficou pronto após $max_attempts tentativas"
}

# Função para testar autenticação
test_authentication() {
    log "Testando autenticação PostgreSQL..."
    
    # Testa conexão com senha usando um container temporário
    local result=$(docker compose run --rm -e PGPASSWORD=$DB_PASSWORD $DB_SERVICE \
        psql -h $DB_SERVICE -U $DB_USER -d $DB_NAME -tAc "SELECT 1;" 2>/dev/null || echo "ERRO")
    
    if [[ "$result" == "1" ]]; then
        log "✅ Autenticação PostgreSQL funcionando corretamente"
        return 0
    else
        error "❌ Falha na autenticação PostgreSQL"
    fi
}

# Função para verificar database e aplicar migrações
setup_backend() {
    log "Configurando backend Django..."
    
    # Sobe o serviço backend
    docker compose up -d $BACKEND_SERVICE
    
    # Aguarda um pouco para o backend inicializar
    sleep 5
    
    # Verifica se as migrações foram aplicadas
    log "Verificando migrações Django..."
    
    # Como o comando já inclui migrate no docker-compose.yml, apenas verificamos se funcionou
    local backend_status=$(docker compose ps $BACKEND_SERVICE --format "table {{.State}}" | tail -n 1)
    
    if [[ "$backend_status" == "running" ]]; then
        log "✅ Backend Django iniciado com sucesso"
    else
        warn "Backend pode ter problemas. Verificando logs..."
        docker compose logs --tail 20 $BACKEND_SERVICE
    fi
}

# Função para gerar relatório final
generate_report() {
    log "Gerando relatório final..."
    
    echo
    echo "==================== RELATÓRIO DE RESET ===================="
    echo "Project Name: $PROJECT_NAME"
    echo "Volume Name: $VOLUME_NAME"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    echo
    
    # Verifica volumes atuais
    info "Volumes PostgreSQL atuais:"
    docker volume ls | grep -E "(postgres|${PROJECT_NAME})" || info "Nenhum volume encontrado"
    
    echo
    # Verifica serviços
    info "Status dos serviços:"
    docker compose ps
    
    echo
    # Testa conexão final
    info "Teste de conexão final:"
    if docker compose run --rm -e PGPASSWORD=$DB_PASSWORD $DB_SERVICE \
        psql -h $DB_SERVICE -U $DB_USER -d $DB_NAME -tAc "SELECT 'Conexão OK' as status;" >/dev/null 2>&1; then
        log "✅ Conexão PostgreSQL: OK"
    else
        error "❌ Conexão PostgreSQL: FALHOU"
    fi
    
    echo "=========================================================="
    log "🎉 Reset do banco de dados concluído com sucesso!"
}

# Função principal
main() {
    log "Iniciando reset do PostgreSQL..."
    
    # Verificações preliminares
    check_dev_environment
    confirm_reset
    
    # Descobre volumes existentes
    discover_volume
    volume_existed=$?
    
    # Remove volumes e para serviços
    stop_and_remove_volumes
    
    # Inicia apenas o banco de dados
    log "Iniciando serviço de banco de dados..."
    docker compose up -d $DB_SERVICE
    
    # Aguarda PostgreSQL ficar pronto
    wait_for_postgres
    
    # Testa autenticação
    test_authentication
    
    # Configura backend
    setup_backend
    
    # Relatório final
    generate_report
}

# Executa o script principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
