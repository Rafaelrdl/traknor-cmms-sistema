#!/bin/bash

# TrakNor CMMS - PostgreSQL Setup for GitHub Codespaces
# This script configures PostgreSQL natively without Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐘 TrakNor CMMS - PostgreSQL Setup for Codespaces${NC}"
echo "=================================================="
echo ""

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL não encontrado. Instalando...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-client postgresql-contrib
    echo -e "${GREEN}✅ PostgreSQL instalado${NC}"
fi

# Get PostgreSQL version
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
echo -e "${GREEN}PostgreSQL versão $PG_VERSION encontrado${NC}"

# Initialize PostgreSQL cluster if needed
PG_CLUSTER_DIR="/var/lib/postgresql/${PG_VERSION}/main"
if [ ! -d "$PG_CLUSTER_DIR" ]; then
    echo "Inicializando cluster PostgreSQL..."
    sudo mkdir -p "$PG_CLUSTER_DIR"
    sudo chown postgres:postgres "$PG_CLUSTER_DIR"
    sudo -u postgres /usr/lib/postgresql/${PG_VERSION}/bin/initdb -D "$PG_CLUSTER_DIR"
elif [ -z "$(sudo ls -A $PG_CLUSTER_DIR 2>/dev/null)" ]; then
    echo "Cluster vazio, inicializando..."
    sudo -u postgres /usr/lib/postgresql/${PG_VERSION}/bin/initdb -D "$PG_CLUSTER_DIR"
else
    echo "Cluster PostgreSQL já existe"
fi

# Ensure PostgreSQL service is running
echo "Iniciando serviço PostgreSQL..."
sudo service postgresql start

# Wait for PostgreSQL to be ready
echo "Aguardando PostgreSQL ficar disponível..."
until pg_isready -h localhost -p 5432 -U postgres &> /dev/null; do
  sleep 1
done

# Configure PostgreSQL user and database
echo "Configurando usuário postgres..."
sudo -u postgres psql << EOF
-- Set password for postgres user
ALTER USER postgres PASSWORD 'postgres';

-- Create traknor database if it doesn't exist
SELECT 'CREATE DATABASE traknor'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'traknor')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE traknor TO postgres;
EOF

# Test connection
echo ""
echo "Testando conexão com o banco de dados..."
if PGPASSWORD=postgres psql -h localhost -U postgres -d traknor -c "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL configurado com sucesso!${NC}"
    echo ""
    echo "Configuração do banco:"
    echo "  🏠 Host: localhost"
    echo "  🔌 Port: 5432"
    echo "  🗄️  Database: traknor"
    echo "  👤 User: postgres" 
    echo "  🔑 Password: postgres"
else
    echo -e "${RED}❌ Erro ao configurar PostgreSQL${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Setup do PostgreSQL completo!${NC}"