# 🔧 TrakNor CMMS - Instruções de Configuração e Execução

## 📋 Visão Geral do Projeto

**TrakNor CMMS** é um sistema frontend de gestão de manutenção HVAC (Heating, Ventilation, and Air Conditioning) que segue padrões brasileiros PMOC. É um protótipo React moderno construído com as mais recentes tecnologias web.

### 🛠️ Stack Tecnológica

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: TailwindCSS 4 + shadcn/ui components
- **Roteamento**: React Router DOM 7.7.1
- **Estado**: TanStack Query para gerenciamento de dados
- **Ícones**: Lucide React + Phosphor Icons
- **Gráficos**: Recharts para visualizações
- **Formulários**: React Hook Form + Zod para validação
- **Componentes UI**: Radix UI primitives + shadcn/ui
- **Animações**: Framer Motion

## 🚀 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Node.js** versão 18+ (recomendado: v22.14.0 ou superior)
- **npm** versão 9+ (incluído com Node.js)
- **Git** para controle de versão

### Verificar Versões Instaladas

```powershell
node --version    # Deve mostrar v18+ ou superior
npm --version     # Deve mostrar 9+ ou superior
```

## 📦 Instalação

### 1. Clone o Repositório

```powershell
git clone https://github.com/Rafaelrdl/traknor-cmms-sistema.git
cd traknor-cmms-sistema
```

### 2. Instale as Dependências

```powershell
npm install
```

> **Nota**: Se encontrar erros relacionados ao Rollup no Windows, execute:
> ```powershell
> Remove-Item -Recurse -Force node_modules, package-lock.json
> npm install
> ```

### 3. Verificar a Instalação

```powershell
npm run build
```

Se a compilação for bem-sucedida, está tudo pronto!

## 🎮 Execução

### Modo Desenvolvimento

```powershell
npm run dev
```

A aplicação estará disponível em: http://localhost:5173/

### Modo Produção

```powershell
# Compilar para produção
npm run build

# Servir build de produção
npm run preview
```

### Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Serve build de produção
- `npm run lint` - Executa linting do código

## 🌟 Funcionalidades do Sistema

### Dashboard
- **KPIs em tempo real**: Métricas de equipamentos, ordens de serviço e manutenções
- **Gráficos interativos**: Visualizações de dados com Recharts
- **Calendário de manutenções**: Próximas atividades programadas

### Gestão de Ativos
- **CRUD completo**: Empresas, setores, subsetores e equipamentos
- **Árvore hierárquica**: Visualização organizada de locais
- **Status em tempo real**: Funcionando, em manutenção, parado

### Ordens de Serviço
- **Gestão completa**: Criar, executar e finalizar ordens
- **Checklists digitais**: Formulários dinâmicos para manutenção
- **Anexos**: Upload de fotos e documentos

### Planejamento
- **Planos de manutenção**: Preventiva com frequências configuráveis
- **Agendamento automático**: Geração automática de ordens

### Estoque
- **Controle de peças**: Gestão de estoque de componentes
- **Alertas de estoque baixo**: Notificações automatizadas
- **Histórico de uso**: Rastreamento de consumo

### Relatórios
- **Relatórios PMOC**: Conformidade com normas brasileiras
- **Análises customizadas**: Filtros por período, equipamento, etc.
- **Exportação**: PDF e Excel

## 🎨 Design System

O projeto utiliza um design system profissional baseado em:

- **Cores**: Paleta azul-verde (Deep Teal) transmitindo confiança
- **Tipografia**: Inter (sans-serif) + Noto Serif
- **Componentes**: shadcn/ui para consistência
- **Responsividade**: Mobile-first design
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 📱 Responsividade

O sistema é otimizado para:
- **Desktop**: Experiência completa
- **Tablet**: Interface adaptada para campo
- **Mobile**: Funcionalidades essenciais

## 🔧 Configuração Avançada

### Customização de Temas

Edite `src/styles/theme.css` para personalizar:
- Cores principais
- Espaçamentos
- Bordas e raios
- Fontes

### Variáveis de Ambiente

Crie um arquivo `.env.local` se necessário:
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=TrakNor CMMS
```

### Configuração do TailwindCSS

O arquivo `tailwind.config.js` contém:
- Configurações de tema
- Cores customizadas
- Espaçamentos
- Breakpoints responsivos

## 🐛 Solução de Problemas

### Erro de Módulo Não Encontrado

```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Erro de Rollup (Windows)

Este é um problema conhecido. A solução aplicada remove dependências problemáticas do GitHub Spark.

### Porta em Uso

Se a porta 5173 estiver ocupada:
```powershell
npm run dev -- --port 3000
```

### Problemas de TypeScript

```powershell
# Verificar configuração
npx tsc --noEmit
```

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Layout.tsx      # Layout principal
│   └── ...
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── contexts/           # Context providers
├── data/               # Dados mockados
├── types/              # Definições TypeScript
├── lib/                # Utilitários
└── styles/             # Estilos globais
```

## 🔄 Dados Mockados

O sistema utiliza dados simulados para demonstração:
- **12 empresas** exemplo
- **8 setores** diversos
- **15 equipamentos** HVAC
- **10 ordens de serviço** em diferentes status
- **4 planos** de manutenção

## 🚦 Status do Projeto

- ✅ Interface funcional
- ✅ Componentes responsivos
- ✅ Navegação completa
- ✅ Dados mockados
- ⏳ Integração com backend (futuro)
- ⏳ Autenticação (futuro)
- ⏳ API real (futuro)

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este README
2. Consulte a documentação do React/Vite
3. Abra uma issue no repositório

## 🎯 Próximos Passos

1. **Backend**: Implementar API REST
2. **Autenticação**: Sistema de login
3. **PWA**: Funcionalidade offline
4. **Mobile App**: Versão nativa
5. **Integrações**: ERPs e sistemas existentes

---

**Desenvolvido com ❤️ para gestão profissional de manutenção HVAC**
