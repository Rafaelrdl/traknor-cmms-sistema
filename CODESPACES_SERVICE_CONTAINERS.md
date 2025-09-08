# 🚀 TrakNor CMMS - Service Containers Setup

## 📋 Configuração Completa sem Docker-in-Docker

Esta configuração usa **PostgreSQL como Service Container** do GitHub Codespaces - a abordagem oficial e recomendada. Nenhum `sudo`, nenhum PostgreSQL nativo do SO, tudo gerenciado pelo Codespaces.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│           GitHub Codespaces                 │
│                                             │
│  ┌────────────────┐    ┌─────────────────┐  │
│  │   app          │    │      db         │  │
│  │ (devcontainer) │◄──►│ (postgres:16)   │  │
│  │                │    │                 │  │
│  │ - Python 3.12  │    │ - traknor DB    │  │
│  │ - Node.js      │    │ - postgres user │  │
│  │ - psql client  │    │ - Auto-seeds    │  │
│  └────────────────┘    └─────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## ⚡ Ativação Automática

Para ativar esta configuração:

### 1️⃣ Rebuild do Codespace
```bash
# Via Command Palette (Ctrl+Shift+P)
> Codespaces: Rebuild Container

# Ou via Dev Containers (se disponível)
> Dev Containers: Rebuild Container
```

### 2️⃣ Aguardar Inicialização
O Codespaces automaticamente irá:
- 🐘 Subir PostgreSQL como service container
- 📦 Instalar dependências Python e Node.js
- 🗄️ Executar migrações Django
- 📊 Criar dados iniciais

## 🎯 Comandos Disponíveis

### Desenvolvimento
```bash
# Verificar se tudo está funcionando
make db-check

# Iniciar backend Django
make run-backend
# → http://localhost:3333

# Iniciar frontend React (terminal separado)  
make run-frontend
# → http://localhost:5173
```

### Database
```bash
# Conectar ao PostgreSQL
make db-shell
# ou: psql -h db -U postgres -d traknor

# Testar operações do banco
make test-db

# Status da conexão
pg_isready -h db -p 5432 -U postgres
```

### Django
```bash
# Migrações
make migrate

# Dados iniciais
make seed
```

## 🔧 Como Funciona

### Service Container PostgreSQL
- **Hostname**: `db` (não `localhost`)
- **Port**: `5432` (interno, não exposto)
- **Database**: `traknor`
- **User**: `postgres`
- **Password**: `postgres`

### Variáveis de Ambiente
Definidas automaticamente no devcontainer:
```bash
DATABASE_URL=postgres://postgres:postgres@db:5432/traknor
POSTGRES_DB=traknor
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=postgres
```

### Seeds Automáticos
Arquivos em `db/init/*.sql` executam na primeira criação:
- `001_init.sql` - Extensões e tabela healthcheck

## 🧪 Testes de Validação

### Teste Rápido
```bash
# Testar conexão PostgreSQL
psql -h db -U postgres -d traknor -c "SELECT 'OK' as status;"

# Testar healthcheck
psql -h db -U postgres -d traknor -c "SELECT * FROM healthcheck;"
```

### Teste Completo
```bash
# Executar suite completa de testes
./test_integration_complete.sh
```

## 🔄 Ciclo de Desenvolvimento

### Primeira Vez
1. **Rebuild Container** → Configuração automática
2. **Aguardar** → Seeds e migrações executam
3. **Testar** → `make db-check`

### Desenvolvimento Diário
1. **Terminal 1**: `make run-backend`
2. **Terminal 2**: `make run-frontend`
3. **Desenvolvimento normal**

### Reset do Banco (Se Necessário)
```bash
# Rebuild completo (apaga volumes)
Command Palette → "Codespaces: Rebuild Container"
```

## 🌐 URLs da Aplicação

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Backend API | http://localhost:3333 | Django REST API |
| Frontend | http://localhost:5173 | React Application |
| API Docs | http://localhost:3333/api/docs | Swagger/OpenAPI |

## 🎯 Vantagens desta Abordagem

✅ **Sem Docker-in-Docker** - Usa service containers nativos  
✅ **Sem sudo** - Tudo gerenciado pelo Codespaces  
✅ **Configuração automática** - Zero setup manual  
✅ **Reproduzível** - Idêntico para todos os desenvolvedores  
✅ **Performance** - Sem overhead de nested containers  
✅ **Seguro** - Credenciais gerenciadas via Codespaces Secrets  

## 🚨 Troubleshooting

### PostgreSQL não acessível
```bash
# Verificar service containers
docker ps

# Verificar logs do banco
docker logs <container_id>

# Rebuild se necessário
Command Palette → "Codespaces: Rebuild Container"
```

### Migrações falharam
```bash
# Executar manualmente
cd backend_django
python manage.py migrate
```

### Reset completo
```bash
# Rebuild with volume cleanup
Command Palette → "Codespaces: Rebuild Container"
# (Volumes são recriados automaticamente)
```

## 📁 Estrutura de Arquivos

```
.devcontainer/
├── devcontainer.json              # Configuração principal
├── docker-compose.codespaces.yml  # Service containers
├── .env.codespaces               # Variáveis de ambiente
└── scripts/
    ├── warmup.sh                 # Preparação inicial
    ├── wait-for-db.sh           # Aguardar PostgreSQL
    └── migrate.sh               # Migrações Django

db/init/
└── 001_init.sql                 # Seeds automáticos
```

---

## ✅ Status da Implementação

- ✅ PostgreSQL Service Container configurado
- ✅ Scripts de inicialização automática
- ✅ Migrações Django integradas
- ✅ Seeds de banco de dados
- ✅ Comandos Make otimizados
- ✅ Documentação completa
- ✅ Testes de validação

**🎉 Sistema pronto para rebuild e uso!**
