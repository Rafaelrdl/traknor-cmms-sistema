-- TrakNor CMMS Database Initialization
-- Este arquivo é executado automaticamente quando o PostgreSQL é criado pela primeira vez

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de healthcheck
CREATE TABLE IF NOT EXISTS healthcheck (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT DEFAULT 'PostgreSQL está funcionando!',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir registro inicial
INSERT INTO healthcheck (message) VALUES ('TrakNor CMMS - PostgreSQL inicializado com sucesso!');
