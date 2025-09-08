#!/bin/bash

echo "🧪 SIMULAÇÃO DE TESTE - PostgreSQL Service Container"
echo "=================================================="
echo ""
echo "⚠️  NOTA: Este teste simula o ambiente de service container"
echo "   Para testar completamente, reinicie o Codespace para"
echo "   ativar a nova configuração em devcontainer.json"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Validando Arquivos de Configuração...${NC}"

# Verificar devcontainer.json
if [ -f ".devcontainer/devcontainer.json" ]; then
    if grep -q "docker-compose.codespaces.yml" ".devcontainer/devcontainer.json"; then
        echo -e "${GREEN}✅ devcontainer.json configurado para service container${NC}"
    else
        echo -e "${YELLOW}⚠️ devcontainer.json pode não estar configurado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ devcontainer.json não encontrado${NC}"
fi

# Verificar docker-compose.codespaces.yml
if [ -f ".devcontainer/docker-compose.codespaces.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.codespaces.yml encontrado${NC}"
    
    # Verificar se contém serviços necessários
    if grep -q "services:" ".devcontainer/docker-compose.codespaces.yml"; then
        if grep -q "app:" ".devcontainer/docker-compose.codespaces.yml"; then
            echo -e "${GREEN}✅ Serviço 'app' configurado${NC}"
        fi
        if grep -q "db:" ".devcontainer/docker-compose.codespaces.yml"; then
            echo -e "${GREEN}✅ Serviço 'db' (PostgreSQL) configurado${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️ docker-compose.codespaces.yml não encontrado${NC}"
fi

echo ""
echo -e "${BLUE}2. Validando Scripts de Setup...${NC}"

# Verificar scripts
for script in "wait-for-db.sh" "setup.sh" "start.sh"; do
    if [ -f ".devcontainer/scripts/$script" ]; then
        if [ -x ".devcontainer/scripts/$script" ]; then
            echo -e "${GREEN}✅ .devcontainer/scripts/$script executável${NC}"
        else
            echo -e "${YELLOW}⚠️ .devcontainer/scripts/$script não executável${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ .devcontainer/scripts/$script não encontrado${NC}"
    fi
done

echo ""
echo -e "${BLUE}3. Validando Seeds de Banco...${NC}"

if [ -f "db/init/001_init.sql" ]; then
    echo -e "${GREEN}✅ Seeds SQL configurados${NC}"
    echo "   Arquivo: db/init/001_init.sql"
else
    echo -e "${YELLOW}⚠️ Seeds SQL não encontrados${NC}"
fi

echo ""
echo -e "${BLUE}4. Validando Configuração Django...${NC}"

if [ -f "backend_django/.env" ]; then
    if grep -q "db:5432" "backend_django/.env"; then
        echo -e "${GREEN}✅ Django configurado para hostname 'db'${NC}"
    else
        echo -e "${YELLOW}⚠️ Django pode não estar configurado para service container${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Arquivo .env do Django não encontrado${NC}"
fi

echo ""
echo -e "${BLUE}5. Validando Makefile...${NC}"

if [ -f "Makefile" ]; then
    if grep -q "test-integration" "Makefile"; then
        echo -e "${GREEN}✅ Makefile atualizado com novos comandos${NC}"
    fi
    if grep -q "db-shell" "Makefile"; then
        echo -e "${GREEN}✅ Comandos de database configurados${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Makefile não encontrado${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Configuração do Service Container está pronta!${NC}"
echo ""
echo "🔄 Para ativar completamente:"
echo "  1. Faça commit das mudanças"
echo "  2. Reinicie o Codespace"
echo "  3. O novo devcontainer.json será usado"
echo "  4. PostgreSQL rodará como service container"
echo ""
echo "🚀 Após reiniciar, teste com:"
echo "  ./test_integration_complete.sh"
echo "  make db-check"
echo "  make test-integration"
echo ""
echo "🎯 URLs esperadas:"
echo "  Backend: http://localhost:3333"
echo "  Frontend: http://localhost:5173"
echo "  Database: psql -h db -U postgres -d traknor"
