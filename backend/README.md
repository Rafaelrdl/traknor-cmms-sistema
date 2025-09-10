# TrakNor CMMS Backend

Backend API para o sistema de gestão de manutenção TrakNor CMMS, desenvolvido em TypeScript com Express.js, Prisma ORM e PostgreSQL.

## 🚀 Funcionalidades

- ✅ Autenticação JWT com refresh tokens
- ✅ Sistema de usuários com diferentes roles (Admin, Manager, Technician, Operator)
- ✅ Gestão de empresas, setores e equipamentos
- ✅ Planos de manutenção preventiva
- ✅ Ordens de serviço (OS) completas
- ✅ Controle de estoque e requisições
- ✅ Sistema de convites
- ✅ API RESTful com validação
- ✅ Rate limiting e segurança
- ✅ Upload de arquivos
- ✅ Logging estruturado
- ✅ Docker support

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Linguagem**: TypeScript
- **Autenticação**: JWT
- **Validação**: Zod
- **Logging**: Winston
- **Testes**: Jest + Supertest
- **Containerização**: Docker

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- Docker (opcional)
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd traknor-cmms-sistema/backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Inicie o banco de dados (Docker)

```bash
docker-compose up -d postgres
```

### 5. Execute as migrations

```bash
npm run migrate
```

### 6. Execute o seed (dados iniciais)

```bash
npm run seed
```

### 7. Inicie o servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (DB, JWT, Logger)
│   ├── controllers/     # Controllers REST
│   ├── services/        # Lógica de negócio
│   ├── middlewares/     # Auth, validação, error handling
│   ├── validators/      # Schemas de validação Zod
│   ├── utils/          # Helpers e utilidades
│   ├── routes/         # Definição de rotas
│   └── app.ts          # Configuração Express
├── prisma/
│   ├── schema.prisma   # Schema do banco
│   └── seed.ts         # Dados iniciais
├── tests/              # Testes unitários e integração
├── docker-compose.yml  # Configuração Docker
└── package.json
```

## 🔐 Credenciais Padrão (Desenvolvimento)

Após executar o seed, você pode usar:

- **Admin**: admin@traknor.com / admin123
- **Técnico**: tecnico@traknor.com / tecnico123

## 📖 Documentação da API

### Endpoints de Autenticação

```
POST   /api/auth/login          # Login
POST   /api/auth/logout         # Logout
POST   /api/auth/refresh        # Refresh token
GET    /api/auth/me            # Dados do usuário atual
POST   /api/auth/forgot-password # Esqueci a senha
POST   /api/auth/reset-password  # Resetar senha
```

### Endpoints de Usuários

```
GET    /api/users              # Listar usuários
POST   /api/users              # Criar usuário
GET    /api/users/:id          # Obter usuário
PUT    /api/users/:id          # Atualizar usuário
DELETE /api/users/:id          # Deletar usuário
PUT    /api/users/:id/preferences # Atualizar preferências
PUT    /api/users/:id/security    # Atualizar segurança
```

### Outros Endpoints (em desenvolvimento)

- `/api/companies` - Gestão de empresas
- `/api/equipment` - Gestão de equipamentos
- `/api/plans` - Planos de manutenção
- `/api/work-orders` - Ordens de serviço
- `/api/stock` - Controle de estoque
- `/api/metrics` - Dashboard e métricas

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar com coverage
npm run test:coverage
```

## 🐳 Docker

### Subir toda a stack

```bash
npm run docker:up
```

### Ver logs da aplicação

```bash
npm run docker:logs
```

### Parar os serviços

```bash
npm run docker:down
```

## 🔒 Segurança

- Helmet.js para headers HTTP seguros
- Rate limiting por IP
- Validação rigorosa de entrada
- Hash de senhas com bcrypt
- JWT com expiração
- CORS configurado
- SQL injection prevention (Prisma)

## 🚀 Deploy

### Environment Variables for Production

Set these environment variables:

```env
NODE_ENV=production
PORT=3333
DATABASE_URL=postgresql://user:pass@host:port/database

JWT_SECRET=your-very-long-and-secure-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com

CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=another-very-secure-secret

BCRYPT_ROUNDS=12
LOG_LEVEL=info
```

### Production Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run database migrations**
   ```bash
   npm run migrate:prod
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3333:3333"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped
```

### Health Monitoring

The API includes a health check endpoint:
```
GET /api/health
```

Use this for load balancer health checks and monitoring.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.