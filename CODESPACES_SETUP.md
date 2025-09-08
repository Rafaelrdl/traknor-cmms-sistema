# 🚀 TrakNor CMMS - GitHub Codespaces Setup Guide

Este documento fornece instruções completas para configurar e usar o TrakNor CMMS em GitHub Codespaces com PostgreSQL nativo (sem Docker).

## 📋 Visão Geral

O TrakNor CMMS foi configurado para funcionar nativamente no GitHub Codespaces, eliminando a necessidade do Docker e utilizando PostgreSQL instalado diretamente no ambiente.

### ✅ Configuração Atual

- **PostgreSQL 16**: Instalado nativamente no sistema
- **Django Backend**: Configurado com virtual environment
- **React Frontend**: Configurado com Node.js
- **Base URL**: `http://localhost:3333/api`
- **Database**: PostgreSQL local (localhost:5432)

## 🛠️ Setup Automático

### Primeira Vez (Auto-inicialização)

Quando você abre o Codespace pela primeira vez, o sistema executa automaticamente:

1. **Instalação PostgreSQL**: Se não estiver instalado
2. **Configuração do banco**: Usuário `postgres` com senha `postgres`
3. **Criação do database**: Database `traknor` 
4. **Setup Django**: Virtual environment e dependências
5. **Migrações**: Criação e aplicação das tabelas
6. **Dados iniciais**: Se disponível
7. **Dependências frontend**: Node.js packages

### ⏱️ Tempo de Setup

- **Primeira vez**: 3-5 minutos
- **Reabrir Codespace**: 30-60 segundos

## 🎯 Como Usar

### Iniciar os Serviços

```bash
# Opção 1: Usar Makefile (recomendado)
make dev

# Opção 2: Manual - Backend Django
cd backend_django
source venv/bin/activate  
python manage.py runserver 0.0.0.0:3333

# Opção 3: Manual - Frontend React
npm run dev
```

### URLs Disponíveis

- **🔗 Backend API**: http://localhost:3333
- **🔗 Frontend React**: http://localhost:5173  
- **🔗 Admin Django**: http://localhost:3333/admin
- **🔗 API Docs**: http://localhost:3333/api/docs

### Testar a API

```bash
# Health check
curl http://localhost:3333/api/health

# Ou diretamente no browser
open http://localhost:3333/api/health
```

## 🗄️ Banco de Dados

### Configuração Padrão

```bash
Host: localhost
Port: 5432
Database: traknor
User: postgres
Password: postgres
```

### Comandos Úteis

```bash
# Verificar status do PostgreSQL
make db-status

# Conectar ao banco via psql
PGPASSWORD=postgres psql -h localhost -U postgres -d traknor

# Reset completo do banco (⚠️ DESTRUTIVO)
make db-reset

# Reset lógico (apenas dados)
make db-reset-logical

# Aplicar migrações
make migrate

# Criar dados iniciais
make seed
```

### Acesso Direto ao PostgreSQL

```bash
# Via comando direto
PGPASSWORD=postgres psql -h localhost -U postgres -d traknor

# Listar databases
PGPASSWORD=postgres psql -h localhost -U postgres -l

# Ver tabelas
PGPASSWORD=postgres psql -h localhost -U postgres -d traknor -c "\dt"
```

## 🐍 Django Backend

### Ativação do Virtual Environment

```bash
cd backend_django
source venv/bin/activate
```

### Comandos Django

```bash
# Com venv ativo
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
python manage.py runserver 0.0.0.0:3333

# Ou usar Makefile (ativa venv automaticamente)
make migrate
make seed
make shell
```

### Estrutura do Backend

```
backend_django/
├── venv/                 # Virtual environment
├── manage.py            # Django CLI
├── requirements.txt     # Python dependencies
├── traknor/            # Django project
│   └── settings/       # Settings (base, dev, prod)
└── apps/               # Django applications
    ├── accounts/       # User management
    ├── companies/      # Company management
    ├── core/          # Core utilities
    ├── equipment/     # Equipment management
    ├── maintenance/   # Maintenance plans
    └── workorders/    # Work orders
```

## ⚛️ Frontend React

### Comandos Frontend

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Testes
npm test
```

### Integração API

O frontend está configurado para se conectar ao backend Django:

```javascript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:3333/api'
```

## 🔧 Comandos Make Disponíveis

```bash
# Desenvolvimento
make help          # Mostrar ajuda
make dev           # Iniciar todos os serviços
make stop          # Parar serviços
make test          # Executar testes

# Database
make db-check      # Verificar pré-requisitos
make db-setup      # Setup inicial PostgreSQL
make db-status     # Status do PostgreSQL
make db-reset      # Reset completo (destrutivo)
make db-reset-logical # Reset apenas dados

# Django
make migrate       # Aplicar migrações
make seed          # Criar dados iniciais
make shell         # Django shell
make clean         # Limpar arquivos temporários
```

## 🚨 Troubleshooting

### PostgreSQL não inicia

```bash
# Verificar status
sudo service postgresql status

# Iniciar manualmente
sudo service postgresql start

# Verificar logs
sudo journalctl -u postgresql -f
```

### Erro de conexão com banco

```bash
# Testar conexão
PGPASSWORD=postgres psql -h localhost -U postgres -c "SELECT 1;"

# Recriar database
PGPASSWORD=postgres psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS traknor;"
PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE traknor;"
```

### Migrações com erro

```bash
# Reset migrations (CUIDADO!)
cd backend_django
source venv/bin/activate
find apps -path "*/migrations/*.py" -not -name "__init__.py" -delete
find apps -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

### Virtual Environment corrompido

```bash
cd backend_django
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend não carrega

```bash
# Limpar cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Verificar portas
lsof -i :3333  # Backend
lsof -i :5173  # Frontend
```

## 🔒 Credenciais Padrão

Após executar `make seed`:

- **Admin**: `admin@traknor.com` / `admin123`
- **Técnico**: `tecnico@traknor.com` / `tecnico123`
- **Solicitante**: `solicitante@traknor.com` / `solicitante123`

## 🎨 Desenvolvimento

### Adicionando Nova Funcionalidade

1. **Backend (Django)**:
   ```bash
   cd backend_django
   source venv/bin/activate
   python manage.py startapp nova_app
   # Adicionar à INSTALLED_APPS
   python manage.py makemigrations nova_app
   python manage.py migrate
   ```

2. **Frontend (React)**:
   ```bash
   # Criar componente em src/components/
   # Adicionar rota em src/App.tsx
   # Testar com npm run dev
   ```

### Estrutura de Arquivos

```
traknor-cmms-sistema/
├── .devcontainer/           # Codespaces config
│   ├── postStartCommand.sh  # Auto-init script
│   └── post-start.sh       # TrakNor setup
├── backend_django/         # Django backend  
├── scripts/               # Utility scripts
│   ├── setup_postgres_codespaces.sh
│   └── setup_postgres_native.sh
├── src/                   # React frontend
├── Makefile              # Development commands
└── CODESPACES_SETUP.md   # This file
```

## 📊 Performance Tips

### PostgreSQL Optimization

```sql
-- Verificar performance
SELECT * FROM pg_stat_activity;

-- Limpar cache
SELECT pg_reload_conf();
```

### Django Optimization

```python
# settings/dev.py - Debug toolbar
INTERNAL_IPS = ['127.0.0.1']

# Cache local
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

## 🌐 Integração com GitHub

### Workflow Actions

O projeto está configurado para CI/CD com GitHub Actions:

- **Tests**: Executados em cada PR
- **Build**: Validação de build
- **Deploy**: Deploy automático (se configurado)

### Variáveis de Ambiente

Para produção, configure as variáveis:

```env
DATABASE_URL=postgresql://user:pass@host:port/database
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
```

## 🚀 Próximos Passos

1. **Desenvolvimento**: Use os comandos `make dev` para iniciar
2. **Testes**: Execute `make test` regularmente  
3. **Deploy**: Configure variáveis de produção
4. **Monitoramento**: Configure logs e métricas

## 💡 Dicas

- **Use make commands**: Mais simples e consistente
- **Mantenha venv ativo**: Para comandos Django
- **Monitor de recursos**: Codespaces tem limites de CPU/RAM
- **Salve frequentemente**: Auto-save está ativo
- **Use extensões**: Django, Python, PostgreSQL no VSCode

---

**📞 Suporte**: Para problemas, abra uma issue no GitHub ou consulte a documentação completa em `/docs`.