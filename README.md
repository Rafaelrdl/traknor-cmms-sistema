# TrakNor CMMS - Sistema de Gerenciamento de Manutenção

Sistema de gerenciamento de manutenção para equipamentos e ativos.

## 📁 Estrutura do Projeto

```
├── docs/                    # 📚 Documentação organizada
│   ├── features/           # Documentação de funcionalidades
│   ├── implementation/     # Documentação técnica
│   ├── fixes/             # Documentação de correções
│   └── root-docs/         # Documentos gerais do projeto
├── src/                    # 💻 Código fonte
├── tests/                  # 🧪 Testes organizados
│   └── manual/            # Testes manuais e documentação
└── cypress/               # 🔍 Testes E2E
```

## 🚀 Configuração

1. Instale as dependências:
```bash
npm install
```

2. Execute o projeto:
```bash
npm run dev
```

3. Execute os testes:
```bash
npm test
```

## 🆘 Solução de Problemas

Encontrou um erro? Consulte nossos guias:

- **🚑 [QUICK-FIX.md](QUICK-FIX.md)** - Soluções rápidas para erros comuns
- **🔧 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guia detalhado de diagnóstico
- **🚨 [NOT_INSTRUCTIONS.md](NOT_INSTRUCTIONS.md)** - Arquivos que não devem ser modificados

### Erros Mais Comuns:

**Vite Module Not Found:**
```bash
npm run clean
```

**Porta em uso:**
```bash
npm run kill
```

**Problemas de cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
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

- `npm run dev` - Inicia o servidor de desenvolvimento (com verificação automática de deps)
- `npm run build` - Compila o projeto para produção
- `npm run lint` - Executa o linting do código
- `bash ./scripts/check-deps.sh` - Verifica e corrige dependências manualmente

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
