# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything's fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas

## 🔧 Dicas para Ambiente de Desenvolvimento

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

### Dicas para Melhor Performance

1. Evite fechar o contêiner antes de terminar seu trabalho
2. Execute `npm run build` ocasionalmente para verificar se tudo está funcionando
3. Se precisar limpar completamente o cache: `rm -rf node_modules && npm install`
4. O script `npm run dev` agora executa automaticamente a verificação de dependências

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (com verificação automática de deps)
- `npm run build` - Compila o projeto para produção
- `npm run lint` - Executa o linting do código
- `bash ./scripts/check-deps.sh` - Verifica e corrige dependências manualmente
  
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
