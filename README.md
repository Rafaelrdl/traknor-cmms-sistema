# TrakNor CMMS - Sistema de Gerenciamento de Manutenção

Sistema completo de gerenciamento de manutenção para equipamentos e ativos, com backend TypeScript + Express + Prisma e frontend React integrados.

## ✅ Status do Projeto

**🎉 BACKEND E INTEGRAÇÃO VALIDADOS COM SUCESSO!**

- ✅ Backend TypeScript + Express + Prisma implementado
- ✅ API REST com autenticação JWT funcional  
- ✅ Frontend integrado com backend via API
- ✅ Todos os endpoints principais testados
- ✅ Documentação completa atualizada

📸 **[Ver evidência da integração funcionando](https://github.com/user-attachments/assets/8a17b77d-ab3f-4eb7-af23-986326ea1613)**

## 📁 Estrutura do Projeto

```
├── backend/                  # 🔧 Backend API (TypeScript + Express)
│   ├── src/                 # Código fonte do backend
│   ├── prisma/              # Schema e migrations do banco
│   └── tests/               # Testes do backend
├── docs/                    # 📚 Documentação organizada
│   ├── features/           # Documentação de funcionalidades
│   ├── implementation/     # Documentação técnica
│   ├── fixes/             # Documentação de correções
│   └── BACKEND_IMPLEMENTATION_COMPLETE.md # 🎯 Status da implementação
├── src/                    # 💻 Código fonte frontend
├── tests/                  # 🧪 Testes organizados
│   └── manual/            # Testes manuais e documentação
└── cypress/               # 🔍 Testes E2E
```

## 🏗️ Arquitetura

### Backend (API REST)
- **Framework**: Express.js com TypeScript
- **Database**: PostgreSQL com Prisma ORM  
- **Auth**: JWT tokens com refresh
- **Security**: Helmet, CORS, Rate limiting
- **Port**: 3333 (desenvolvimento)

### Frontend (React)
- **Framework**: React com TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query
- **API**: Cliente HTTP integrado
- **Port**: 5173 (desenvolvimento)

## 🚀 Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou Docker)
- npm ou yarn

### 1. Frontend
```bash
npm install
npm run dev
```

### 2. Backend  
```bash
cd backend
npm install

# Configurar banco de dados
docker compose up postgres -d

# Executar migrations e seed
npm run migrate
npm run seed

# Iniciar servidor
npm run dev
```

## 🔑 Credenciais de Teste

```
Email: admin@traknor.com
Senha: admin123
```

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Dados
- `GET /api/companies` - Empresas
- `GET /api/users` - Usuários  
- `GET /api/equipment` - Equipamentos
- `GET /api/work-orders` - Ordens de serviço
- `GET /api/plans` - Planos de manutenção
- `GET /api/metrics/kpis` - KPIs do dashboard

### Saúde  
- `GET /api/health` - Health check
```

3. Execute os testes:
```bash
npm test
```

## 📚 Documentação

Toda a documentação do projeto está organizada na pasta `docs/`. Para mais detalhes, consulte [docs/README.md](docs/README.md).

## 🧪 Testes

Os testes estão organizados na pasta `tests/`. Para mais informações, consulte [tests/README.md](tests/README.md).

## �️ Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Zustand (gerenciamento de estado)
- React Hook Form
- React Router DOM
- Vitest (testes unitários)
- Cypress (testes E2E)

## �🔧 Dicas para Ambiente de Desenvolvimento

### Problemas Comuns com Dependências

Se você encontrar erros de importação como:
```
Failed to resolve import "react-pdf" from "src/utils/pdfConfig.ts"
Failed to resolve import "@dnd-kit/core" from "src/components/WorkOrderKanban.tsx"
```

Execute o seguinte comando para restaurar as dependências:

```bash
bash ./scripts/check-deps.sh
```

Ou, alternativamente:

```bash
rm -rf node_modules/.vite
npm install
```

### Scripts Disponíveis

## 📚 Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (com verificação automática de deps)
- `npm run build` - Compila o projeto para produção
- `npm run lint` - Executa o linting do código
- `bash ./scripts/check-deps.sh` - Verifica e corrige dependências manualmente

## 🗄️ Gerenciamento de Banco de Dados

O projeto utiliza PostgreSQL via Docker Compose. Os seguintes comandos estão disponíveis:

### Comandos Make

- `make db-reset` - **🔴 DESTRUTIVO**: Reset completo do PostgreSQL (remove volumes)
- `make db-reset-logical` - **⚠️ CUIDADO**: Reset apenas do conteúdo do database

### Scripts Disponíveis

- `./scripts/reset_db.sh` - Script completo de reset com verificações de segurança
- `./scripts/reset_db_logical.sh` - Script para reset apenas do database lógico

### ⚠️ IMPORTANTE - Ambiente de Desenvolvimento

**Os comandos de reset são DESTRUTIVOS e devem ser usados APENAS em desenvolvimento!**

- ✅ **Safe**: Remove todos os dados do banco para começar limpo
- ⚠️ **Cuidado**: Sempre confirma antes de executar
- 🛡️ **Proteção**: Verifica ambiente antes de executar
- 📋 **Relatório**: Gera relatório completo após reset

#### Reset Completo (`make db-reset`)
- Para todos os serviços Docker Compose
- Remove completamente o volume PostgreSQL
- **PERDE TODOS OS DADOS** do banco
- Recria cluster PostgreSQL do zero
- Garante aplicação correta das variáveis de ambiente
- Testa autenticação com senha configurada

#### Reset Lógico (`make db-reset-logical`)
- Mantém o cluster PostgreSQL existente
- Remove apenas o database `traknor`
- Recria database vazio
- **NÃO redefine senhas** do PostgreSQL
- Mais rápido que reset completo

📄 License

The project files and resources are licensed under the terms of the MIT license.
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don't need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind. Spark Template!
You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
