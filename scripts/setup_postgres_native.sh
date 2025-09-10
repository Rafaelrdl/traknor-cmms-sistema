#!/bin/bash

set -e

echo "🐘 CONFIGURAÇÃO DO POSTGRESQL NATIVO"
echo "===================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL não encontrado. Instalando...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-client
fi

# Verificar se o serviço está rodando
if ! sudo service postgresql status &> /dev/null; then
    echo "Iniciando PostgreSQL..."
    
    # Corrigir permissões se necessário
    sudo mkdir -p /var/log/postgresql
    sudo chown postgres:postgres /var/log/postgresql
    sudo mkdir -p /var/lib/postgresql/15/main
    sudo chown postgres:postgres /var/lib/postgresql/15/main
    
    # Tentar iniciar o serviço
    sudo service postgresql start || {
        echo "Tentando inicializar cluster PostgreSQL..."
        sudo -u postgres /usr/lib/postgresql/15/bin/initdb -D /var/lib/postgresql/15/main
        sudo service postgresql start
    }
fi

# Configurar usuário postgres
echo "Configurando usuário postgres..."
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD 'postgres';
EOF

# Criar database traknor
echo "Criando database traknor..."
sudo -u postgres createdb traknor 2>/dev/null || echo "Database traknor já existe"

# Verificar conexão
echo ""
echo "Testando conexão..."
PGPASSWORD=postgres psql -h localhost -U postgres -d traknor -c "SELECT 1;" &> /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PostgreSQL configurado com sucesso!${NC}"
    echo ""
    echo "Configuração:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: traknor"
    echo "  User: postgres"
    echo "  Password: postgres"
else
    echo -e "${RED}❌ Erro ao configurar PostgreSQL${NC}"
    exit 1
fi
