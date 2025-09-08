#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}CHECKING DATABASE PREREQUISITES (Native PostgreSQL)${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Função para check com status
check_item() {
    local status=$1
    local message=$2
    local info=$3
    
    if [ "$status" == "ok" ]; then
        echo -e "[CHECK] ${GREEN}✅${NC} $message"
    elif [ "$status" == "warning" ]; then
        echo -e "[WARN]  ${YELLOW}⚠️${NC}  $message"
        [ -n "$info" ] && echo -e "[INFO]     $info"
        ((WARNINGS++))
    else
        echo -e "[ERROR] ${RED}❌${NC} $message"
        [ -n "$info" ] && echo -e "[INFO]     $info"
        ((ERRORS++))
    fi
}

echo "[CHECK] Verificando ambiente Codespaces/Dev Container..."

# Verificar se estamos em Codespaces ou Dev Container
if [ -n "$CODESPACES" ] || [ -f "/.dockerenv" ]; then
    check_item "ok" "Ambiente Dev Container detectado"
else
    check_item "warning" "Ambiente local detectado" "Certifique-se de ter PostgreSQL instalado"
fi

echo ""
echo "[CHECK] Verificando PostgreSQL nativo..."

# Verificar PostgreSQL instalado
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    check_item "ok" "PostgreSQL encontrado (versão $PSQL_VERSION)"
else
    check_item "error" "PostgreSQL não instalado" "Execute: sudo apt-get install postgresql postgresql-client"
fi

# Verificar serviço PostgreSQL
if sudo service postgresql status &> /dev/null; then
    check_item "ok" "Serviço PostgreSQL rodando"
else
    check_item "warning" "Serviço PostgreSQL parado" "Execute: sudo service postgresql start"
fi

echo ""
echo "[CHECK] Verificando configuração do projeto..."

# Verificar arquivos necessários
[ -f "backend_django/manage.py" ] && check_item "ok" "Django backend encontrado" || check_item "error" "Django backend não encontrado"
[ -f "Makefile" ] && check_item "ok" "Makefile encontrado" || check_item "error" "Makefile não encontrado"
[ -d "scripts" ] && check_item "ok" "Diretório scripts encontrado" || check_item "error" "Diretório scripts não encontrado"

echo ""
echo "[CHECK] Verificando scripts de reset..."

# Verificar scripts
for script in "reset_db_native.sh" "setup_postgres_native.sh"; do
    if [ -f "scripts/$script" ]; then
        if [ -x "scripts/$script" ]; then
            check_item "ok" "scripts/$script encontrado e executável"
        else
            check_item "warning" "scripts/$script encontrado mas não executável" "Execute: chmod +x scripts/$script"
        fi
    else
        check_item "error" "scripts/$script não encontrado"
    fi
done

echo ""
echo "[CHECK] Verificando conexão com PostgreSQL..."

# Tentar conectar ao PostgreSQL
if PGPASSWORD=postgres psql -h localhost -U postgres -c "SELECT 1;" &> /dev/null; then
    check_item "ok" "Conexão com PostgreSQL funcionando"
    
    # Verificar database traknor
    if PGPASSWORD=postgres psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw traknor; then
        check_item "ok" "Database 'traknor' existe"
    else
        check_item "warning" "Database 'traknor' não existe" "Será criado no setup"
    fi
else
    check_item "warning" "Não foi possível conectar ao PostgreSQL" "Verifique usuário/senha ou execute setup"
fi

echo ""
echo "[CHECK] Verificando ambiente Python/Django..."

# Verificar Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    check_item "ok" "Python encontrado (versão $PYTHON_VERSION)"
else
    check_item "error" "Python não encontrado"
fi

# Verificar venv do Django
if [ -d "backend_django/venv" ]; then
    check_item "ok" "Virtual environment Django configurado"
else
    check_item "warning" "Virtual environment Django não configurado" "Execute: cd backend_django && python -m venv venv"
fi

echo ""
echo "════════════════════════════════════════════"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ $ERRORS erro(s) encontrado(s)${NC}"
    echo -e "${YELLOW}Corrija os erros antes de prosseguir${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    echo -e "${GREEN}Você pode prosseguir, mas verifique os avisos${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Todos os pré-requisitos atendidos!${NC}"
    echo ""
    echo "Você pode executar:"
    echo "  • make db-setup    - Configurar PostgreSQL"
    echo "  • make db-reset    - Resetar banco de dados"
    exit 0
fi
