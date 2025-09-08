#!/bin/bash

echo "🧪 TESTE DE INTEGRAÇÃO COMPLETA - TrakNor CMMS"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Função para testes
test_item() {
    local status=$1
    local message=$2
    local info=$3
    
    if [ "$status" == "ok" ]; then
        echo -e "[TEST] ${GREEN}✅${NC} $message"
    elif [ "$status" == "warning" ]; then
        echo -e "[WARN] ${YELLOW}⚠️${NC}  $message"
        [ -n "$info" ] && echo -e "[INFO]     $info"
        ((WARNINGS++))
    else
        echo -e "[ERROR] ${RED}❌${NC} $message"
        [ -n "$info" ] && echo -e "[INFO]     $info"
        ((ERRORS++))
    fi
}

echo "1. Testando PostgreSQL Service Container..."

# Testar se PostgreSQL está acessível via hostname 'db'
if pg_isready -h db -p 5432 -U postgres >/dev/null 2>&1; then
    test_item "ok" "PostgreSQL acessível via hostname 'db'"
else
    test_item "error" "PostgreSQL não acessível via hostname 'db'" "Verifique se o service container está rodando"
fi

# Testar conexão com credenciais
if psql -h db -U postgres -d traknor -c "SELECT 1;" >/dev/null 2>&1; then
    test_item "ok" "Conexão com database 'traknor' funcionando"
else
    test_item "error" "Falha na conexão com database 'traknor'"
fi

# Testar tabela de healthcheck
if psql -h db -U postgres -d traknor -c "SELECT * FROM healthcheck LIMIT 1;" >/dev/null 2>&1; then
    test_item "ok" "Tabela healthcheck existe e está acessível"
    HEALTH_MSG=$(psql -h db -U postgres -d traknor -tAc "SELECT message FROM healthcheck LIMIT 1;" 2>/dev/null)
    echo -e "[INFO]     Mensagem: $HEALTH_MSG"
else
    test_item "warning" "Tabela healthcheck não encontrada" "Pode não ter sido criada ainda"
fi

echo ""
echo "2. Testando Backend Django..."

# Verificar se manage.py existe
if [ -f "backend_django/manage.py" ]; then
    test_item "ok" "Django backend encontrado"
    
    # Testar se consegue importar Django
    cd backend_django
    if python -c "import django; print(f'Django {django.get_version()}')" >/dev/null 2>&1; then
        DJANGO_VERSION=$(python -c "import django; print(django.get_version())")
        test_item "ok" "Django importado com sucesso (versão $DJANGO_VERSION)"
    else
        test_item "error" "Falha ao importar Django" "Verifique se as dependências estão instaladas"
    fi
    
    # Testar conexão Django com banco
    if python manage.py check --database default >/dev/null 2>&1; then
        test_item "ok" "Django conectado ao banco de dados"
    else
        test_item "error" "Django não consegue conectar ao banco" "Verifique DATABASE_URL"
    fi
    
    # Verificar migrações
    if python manage.py showmigrations >/dev/null 2>&1; then
        PENDING=$(python manage.py showmigrations 2>/dev/null | grep -c "\[ \]" || echo "0")
        APPLIED=$(python manage.py showmigrations 2>/dev/null | grep -c "\[X\]" || echo "0")
        
        if [ "$PENDING" -eq 0 ]; then
            test_item "ok" "Todas as migrações aplicadas ($APPLIED aplicadas)"
        else
            test_item "warning" "$PENDING migrações pendentes, $APPLIED aplicadas"
        fi
    else
        test_item "error" "Falha ao verificar migrações"
    fi
    
    cd ..
else
    test_item "error" "Django backend não encontrado"
fi

echo ""
echo "3. Testando Frontend React..."

# Verificar package.json
if [ -f "package.json" ]; then
    test_item "ok" "Frontend React encontrado"
    
    # Verificar se node_modules existe
    if [ -d "node_modules" ]; then
        test_item "ok" "Dependências Node.js instaladas"
    else
        test_item "warning" "Dependências Node.js não instaladas" "Execute: npm install"
    fi
    
    # Verificar se npm/yarn funciona
    if npm --version >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        test_item "ok" "NPM disponível (versão $NPM_VERSION)"
    else
        test_item "error" "NPM não disponível"
    fi
else
    test_item "warning" "Frontend React não encontrado"
fi

echo ""
echo "4. Testando APIs..."

# Verificar se podemos fazer um request básico
if command -v curl >/dev/null 2>&1; then
    # Tentar conectar no endpoint Django (mesmo que não esteja rodando)
    if curl -s --connect-timeout 2 http://localhost:3333 >/dev/null 2>&1; then
        test_item "ok" "Backend respondendo na porta 3333"
    else
        test_item "warning" "Backend não respondendo na porta 3333" "Execute: cd backend_django && python manage.py runserver 0.0.0.0:3333"
    fi
    
    # Tentar conectar no frontend (mesmo que não esteja rodando)
    if curl -s --connect-timeout 2 http://localhost:5173 >/dev/null 2>&1; then
        test_item "ok" "Frontend respondendo na porta 5173"
    else
        test_item "warning" "Frontend não respondendo na porta 5173" "Execute: npm run dev"
    fi
else
    test_item "warning" "curl não disponível para teste de APIs"
fi

echo ""
echo "5. Validação de Configuração..."

# Verificar variáveis de ambiente
if [ -f "backend_django/.env" ]; then
    if grep -q "db:5432" "backend_django/.env"; then
        test_item "ok" "DATABASE_URL configurado para service container"
    else
        test_item "warning" "DATABASE_URL pode não estar configurado para 'db:5432'"
    fi
else
    test_item "warning" "Arquivo .env do Django não encontrado"
fi

# Verificar se scripts estão executáveis
for script in ".devcontainer/scripts/wait-for-db.sh" ".devcontainer/scripts/setup.sh" ".devcontainer/scripts/start.sh"; do
    if [ -x "$script" ]; then
        test_item "ok" "$script executável"
    else
        test_item "warning" "$script não executável" "Execute: chmod +x $script"
    fi
done

echo ""
echo "=============================================="

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ $ERRORS erro(s) crítico(s) encontrado(s)${NC}"
    echo -e "${YELLOW}Sistema pode não funcionar corretamente${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    echo -e "${GREEN}Sistema deve funcionar, mas verifique os avisos${NC}"
    echo ""
    echo "🚀 Para iniciar os serviços:"
    echo "   Backend:  cd backend_django && python manage.py runserver 0.0.0.0:3333"
    echo "   Frontend: npm run dev"
    exit 0
else
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
    echo -e "${GREEN}Sistema TrakNor CMMS está pronto para uso${NC}"
    echo ""
    echo "🔗 URLs disponíveis:"
    echo "   API Backend: http://localhost:3333"
    echo "   Frontend: http://localhost:5173"
    echo "   API Docs: http://localhost:3333/api/docs"
    echo ""
    echo "🗄️ Banco de dados:"
    echo "   Host: db"
    echo "   Port: 5432"
    echo "   Database: traknor"
    echo "   User: postgres"
    echo "   Conectar: psql -h db -U postgres -d traknor"
    exit 0
fi
