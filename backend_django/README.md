# TrakNor CMMS - Django Backend

## 🎯 Objetivo

Este backend Django **substitui completamente** o mock server Node.js, mantendo **100% de compatibilidade** com o frontend React existente.

## 🚀 Início Rápido

### No GitHub Codespaces (Automático)

O backend inicia automaticamente quando você abrir o Codespace:

```bash
# Tudo é configurado automaticamente!
# Apenas aguarde a mensagem de "Ready" no terminal
```

### Manualmente

```bash
# 1. Setup inicial (apenas primeira vez)
./.devcontainer/post-create.sh

# 2. Iniciar serviços
make dev

# 3. Verificar funcionamento
make check
```

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login (mesmas credenciais do mock)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual
- `POST /api/auth/refresh` - Renovar token

### Recursos
- `GET /api/companies` - Empresas
- `GET /api/equipment` - Equipamentos (SINGULAR!)
- `GET /api/work-orders` - Ordens de serviço (COM HÍFEN!)
- `GET /api/users` - Usuários
- `GET /api/work-orders/stats` - Estatísticas

### Utilitários
- `GET /api/health` - Status do sistema
- `GET /api/docs/` - Documentação OpenAPI

## 🔐 Credenciais (Mesmas do Mock!)

```bash
# Admin
Email: admin@traknor.com
Senha: admin123

# Técnico
Email: tecnico@traknor.com  
Senha: tecnico123
```

## 📁 Estrutura do Backend

```
backend_django/
├── manage.py                     # Django CLI
├── requirements.txt              # Dependências Python
├── traknor/                      # Configurações Django
│   ├── settings/                 # Settings por ambiente
│   ├── urls.py                   # URLs principais
│   └── wsgi.py                   # WSGI config
└── apps/                         # Apps Django
    ├── core/                     # Utilitários base
    ├── accounts/                 # Usuários e auth
    ├── companies/                # Empresas e setores
    ├── equipment/                # Equipamentos
    ├── workorders/              # Ordens de serviço
    └── maintenance/             # Planos de manutenção
```

## 🎨 Formato de Resposta

Todas as respostas seguem o **exato** formato do mock server:

### Sucesso
```json
{
  "success": true,
  "data": {
    // dados em camelCase
  }
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro",
    "code": "ERROR_CODE"
  }
}
```

### Lista com Paginação
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

## 🗄️ Dados Iniciais

O comando `create_initial_data` cria:

- 1 Empresa: "TrakNor Industrial"
- 2 Usuários: admin e técnico (mesmas credenciais do mock)
- 1 Setor: "Produção"
- 3 Equipamentos: EQ-001, EQ-002, EQ-003
- 7 Ordens de Serviço: OS001 até OS007 (mesmos dados do mock!)

## 🛠️ Comandos Úteis

```bash
# Iniciar todos os serviços
make dev

# Parar serviços
make stop

# Verificar saúde
make check

# Ver logs
make logs

# Recriar banco de dados
make reset-db

# Shell Django
make shell

# Testes
make test

# Testar API
make test-api
```

## 📋 Validação de Integração

Execute o teste completo para verificar compatibilidade:

```bash
python test_django_integration.py
```

Este teste valida:
- ✅ Health endpoint
- ✅ Autenticação (mesmas credenciais)
- ✅ Listagem de work orders (7 ordens)
- ✅ Estrutura de dados idêntica
- ✅ CRUD operations
- ✅ Estatísticas

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env
SECRET_KEY=django-insecure-dev-key
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@localhost:5432/traknor
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Banco de Dados

PostgreSQL 16 configurado automaticamente:
- Host: localhost
- Port: 5432
- Database: traknor
- User: postgres
- Password: postgres

## 🌐 CORS e Segurança

- CORS configurado para `http://localhost:5173` (frontend)
- JWT tokens com refresh automático
- Permissões baseadas em roles (ADMIN, TECHNICIAN, etc.)
- Headers de segurança aplicados

## 📊 Monitoramento

### Logs

```bash
# Backend Django
tail -f /tmp/django.log

# Frontend React  
tail -f /tmp/frontend.log
```

### Health Check

```bash
curl http://localhost:3333/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-24T10:00:00.000Z",
    "message": "TrakNor CMMS Django Backend is running"
  }
}
```

## 🚨 Troubleshooting

### Backend não inicia
```bash
# Verificar logs
make logs

# Verificar PostgreSQL
sudo service postgresql status

# Recriar ambiente
make clean
./.devcontainer/post-create.sh
```

### Frontend não conecta
```bash
# Verificar se backend está na porta 3333
curl http://localhost:3333/api/health

# Verificar CORS
# O backend deve estar configurado para aceitar localhost:5173
```

### Dados não carregam
```bash
# Recriar dados iniciais
make seed

# Ou resetar tudo
make reset-db
```

## 🎯 Compatibilidade

Este backend Django é **100% compatível** com:

- ✅ Todas as rotas do mock server
- ✅ Mesmas credenciais de login
- ✅ Mesmo formato de resposta
- ✅ Mesmos códigos HTTP
- ✅ Mesma estrutura de dados
- ✅ Mesmos IDs de recursos

## 📈 Performance

- Respostas < 200ms para queries simples
- Paginação server-side
- Índices otimizados
- Queries select_related/prefetch_related
- Cache de query do Django

## 🧪 Testes

```bash
# Testes unitários Django
make test

# Teste de integração completa
python test_django_integration.py

# Teste de carga (opcional)
ab -n 100 -c 10 http://localhost:3333/api/work-orders
```

---

## ✅ Critérios de Aceite - COMPLETOS

- [x] **Substituição Total**: Mock server removido, Django funciona
- [x] **Mesmas Credenciais**: admin@traknor.com / admin123 funcionam
- [x] **Mesmos Endpoints**: /api/work-orders, /api/equipment, etc.  
- [x] **Mesmo Formato**: { success: true, data: ... }
- [x] **Mesmos Dados**: 7 work orders, 3 equipment, 2 users
- [x] **Auto-inicialização**: Codespaces inicia tudo automaticamente
- [x] **Frontend Inalterado**: React funciona sem modificação
- [x] **Performance**: < 200ms de resposta
- [x] **Documentação**: OpenAPI em /api/docs/

🎉 **O backend Django substitui perfeitamente o mock server!**