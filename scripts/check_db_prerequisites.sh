#!/bin/bash

# Script para verificar pré-requisitos do sistema de reset PostgreSQL

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[CHECK] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Função para verificar se Docker está instalado
check_docker() {
    log "Verificando Docker..."
    
    if command -v docker >/dev/null 2>&1; then
        local docker_version=$(docker --version 2>/dev/null)
        log "✅ Docker encontrado: $docker_version"
    else
        error "❌ Docker não encontrado ou não instalado"
        info "   Instale o Docker antes de usar os scripts de reset"
        return 1
    fi
}

# Função para verificar se Docker Compose está disponível
check_docker_compose() {
    log "Verificando Docker Compose..."
    
    if docker compose version >/dev/null 2>&1; then
        local compose_version=$(docker compose version 2>/dev/null)
        log "✅ Docker Compose encontrado: $compose_version"
    else
        error "❌ Docker Compose não encontrado"
        info "   Instale Docker Compose antes de usar os scripts"
        return 1
    fi
}

# Função para verificar arquivos de configuração
check_config_files() {
    log "Verificando arquivos de configuração..."
    
    # Verifica docker-compose.yml
    if [[ -f "docker-compose.yml" ]]; then
        log "✅ docker-compose.yml encontrado"
        
        # Verifica se contém serviço db
        if grep -q "db:" docker-compose.yml; then
            log "✅ Serviço 'db' encontrado no docker-compose.yml"
        else
            warn "⚠️ Serviço 'db' não encontrado no docker-compose.yml"
        fi
        
        # Verifica se contém volume postgres_data
        if grep -q "postgres_data:" docker-compose.yml; then
            log "✅ Volume 'postgres_data' encontrado no docker-compose.yml"
        else
            warn "⚠️ Volume 'postgres_data' não encontrado no docker-compose.yml"
        fi
    else
        error "❌ docker-compose.yml não encontrado"
        return 1
    fi
    
    # Verifica Makefile
    if [[ -f "Makefile" ]]; then
        log "✅ Makefile encontrado"
    else
        warn "⚠️ Makefile não encontrado"
    fi
}

# Função para verificar scripts
check_reset_scripts() {
    log "Verificando scripts de reset..."
    
    # Script de reset completo
    if [[ -f "scripts/reset_db.sh" ]]; then
        if [[ -x "scripts/reset_db.sh" ]]; then
            log "✅ scripts/reset_db.sh encontrado e executável"
        else
            warn "⚠️ scripts/reset_db.sh encontrado mas não é executável"
            info "   Execute: chmod +x scripts/reset_db.sh"
        fi
    else
        error "❌ scripts/reset_db.sh não encontrado"
        return 1
    fi
    
    # Script de reset lógico
    if [[ -f "scripts/reset_db_logical.sh" ]]; then
        if [[ -x "scripts/reset_db_logical.sh" ]]; then
            log "✅ scripts/reset_db_logical.sh encontrado e executável"
        else
            warn "⚠️ scripts/reset_db_logical.sh encontrado mas não é executável"
            info "   Execute: chmod +x scripts/reset_db_logical.sh"
        fi
    else
        error "❌ scripts/reset_db_logical.sh não encontrado"
        return 1
    fi
}

# Função para verificar comandos Make
check_make_commands() {
    log "Verificando comandos do Makefile..."
    
    if [[ -f "Makefile" ]]; then
        if grep -q "db-reset:" Makefile; then
            log "✅ Comando 'make db-reset' disponível"
        else
            error "❌ Comando 'make db-reset' não encontrado no Makefile"
        fi
        
        if grep -q "db-reset-logical:" Makefile; then
            log "✅ Comando 'make db-reset-logical' disponível"
        else
            error "❌ Comando 'make db-reset-logical' não encontrado no Makefile"
        fi
    fi
}

# Função para verificar ambiente de desenvolvimento
check_dev_environment() {
    log "Verificando ambiente de desenvolvimento..."
    
    # Verifica variáveis de ambiente perigosas
    if [[ "$NODE_ENV" == "production" || "$ENVIRONMENT" == "production" ]]; then
        error "❌ Ambiente de PRODUÇÃO detectado!"
        info "   Os scripts de reset NÃO devem ser executados em produção"
        return 1
    fi
    
    # Verifica arquivo .env
    if [[ -f ".env" ]]; then
        if grep -q "NODE_ENV=production\|ENVIRONMENT=production" .env; then
            error "❌ Configuração de produção encontrada no .env"
            return 1
        else
            log "✅ Arquivo .env verificado (não contém config de produção)"
        fi
    else
        info "Arquivo .env não encontrado (OK para desenvolvimento)"
    fi
    
    log "✅ Ambiente parece ser de desenvolvimento"
}

# Função para exibir guia de uso
show_usage_guide() {
    echo
    log "Guia de uso dos scripts de reset:"
    echo
    info "Comandos disponíveis:"
    echo "  make db-reset         - Reset completo (remove volumes)"
    echo "  make db-reset-logical - Reset apenas dados (mantém cluster)"
    echo
    info "Scripts diretos:"
    echo "  ./scripts/reset_db.sh         - Reset completo com verificações"
    echo "  ./scripts/reset_db_logical.sh - Reset lógico do database"
    echo
    warn "IMPORTANTE:"
    echo "  • Os resets são DESTRUTIVOS e removem dados!"
    echo "  • Use APENAS em ambiente de desenvolvimento"
    echo "  • Sempre confirme antes de executar"
    echo "  • Faça backup se necessário"
}

# Função principal
main() {
    log "Verificando pré-requisitos para reset do PostgreSQL..."
    echo
    
    local errors=0
    
    # Verificações
    check_docker || errors=$((errors + 1))
    check_docker_compose || errors=$((errors + 1))
    check_config_files || errors=$((errors + 1))
    check_reset_scripts || errors=$((errors + 1))
    check_make_commands || errors=$((errors + 1))
    check_dev_environment || errors=$((errors + 1))
    
    echo
    
    if [[ $errors -eq 0 ]]; then
        log "🎉 Todos os pré-requisitos atendidos!"
        log "✅ Sistema de reset PostgreSQL está pronto para uso"
        show_usage_guide
    else
        error "❌ $errors erro(s) encontrado(s)"
        info "Corrija os erros antes de usar os scripts de reset"
        return 1
    fi
}

# Executa se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
