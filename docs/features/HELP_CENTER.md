# Centro de Ajuda TrakNor CMMS

## Visão Geral

O Centro de Ajuda é uma solução integrada para fornecer suporte e treinamento aos usuários do TrakNor CMMS. Inclui vídeos tutoriais, guias passo a passo, artigos de conhecimento e perguntas frequentes, tudo organizado em um sistema de fácil navegação com funcionalidades avançadas de busca e acompanhamento de progresso.

## Funcionalidades Principais

### 🎥 Conteúdo Multimídia
- **Vídeos Tutoriais**: Tutoriais em vídeo com player integrado e controle de progresso
- **Artigos de Conhecimento**: Artigos formatados em Markdown com suporte completo a elementos rich text
- **Guias Passo a Passo**: Guias interativos com checklist de conclusão de etapas
- **FAQ Dinâmico**: Perguntas frequentes com sistema expansível e contador de utilidade

### 🔍 Sistema de Busca Avançado
- Busca em tempo real por título, descrição, tags e conteúdo
- Histórico de pesquisas com sugestões automáticas
- Resultados ordenados por relevância
- Filtros por categoria, tipo de conteúdo e nível de dificuldade

### 📊 Acompanhamento de Progresso
- Marcação de conteúdo como concluído
- Percentual de progresso por item
- Estatísticas gerais de aprendizado
- Sistema de favoritos/bookmarks

### 🏷️ Organização por Categorias
- **Primeiros Passos**: Introdução ao sistema
- **Gestão de Ativos**: Cadastro e manutenção de equipamentos
- **Ordens de Serviço**: Criação e execução de manutenção
- **Manutenção Preventiva**: Planejamento e agendamento
- **Controle de Estoque**: Gestão de peças e materiais
- **Relatórios e Métricas**: Análise de dados e KPIs
- **Solução de Problemas**: Troubleshooting comum

### 🎯 Tour Guiado Interativo
- Tour automático para novos usuários
- Highlights visuais em elementos da interface
- Navegação passo a passo com explicações contextuais
- Guia de início rápido integrado

## Estrutura Técnica

### Arquivos Principais

```
src/
├── pages/
│   ├── HelpCenterPage.tsx          # Página principal do centro de ajuda
│   └── HelpContentViewPage.tsx     # Visualização individual de conteúdo
├── hooks/
│   └── useHelpCenter.ts            # Hook para gerenciamento de estado
├── data/
│   └── helpCenterStore.ts          # Store de dados e lógica de negócio
├── models/
│   └── helpCenter.ts               # Definições de tipos TypeScript
├── components/tour/
│   └── HelpCenterTour.tsx          # Componente do tour guiado
└── mocks/
    ├── helpCategories.json         # Dados de categorias
    └── helpContent.json            # Dados de conteúdo
```

### Modelos de Dados

#### HelpContent
```typescript
interface HelpContent {
  id: string;
  title: string;
  description: string;
  category_id: string;
  type: 'video' | 'article' | 'faq' | 'guide';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes?: number;
  read_time_minutes?: number;
  tags: string[];
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
  // Conteúdo específico por tipo
  video_url?: string;
  article_content?: string;
  faq_items?: FAQItem[];
  guide_steps?: GuideStep[];
}
```

#### UserProgress
```typescript
interface UserProgress {
  user_id: string;
  content_id: string;
  completed: boolean;
  progress_percent: number;
  last_accessed_at: string;
  bookmarked: boolean;
}
```

### Persistência de Dados

O sistema utiliza uma abordagem híbrida de persistência:

- **localStorage**: Metadados de conteúdo, progresso do usuário, favoritos e histórico de busca
- **Arquivos Mock**: Dados iniciais de categorias e conteúdo
- **IndexedDB** (futuro): Para armazenamento de arquivos binários (vídeos, imagens)

## Instalação e Configuração

### Dependências

```bash
npm install react-markdown
```

### Configuração de Rotas

As rotas já estão configuradas no `App.tsx`:

```typescript
<Route path="/help" element={<HelpCenterPage />} />
<Route path="/help/:contentId" element={<HelpContentViewPage />} />
```

### Navegação

O centro de ajuda está integrado ao menu principal de navegação com ícone de ajuda.

## Uso

### Acessando o Centro de Ajuda

1. Clique no ícone "Ajuda" no menu de navegação
2. Para novos usuários, o tour guiado será iniciado automaticamente
3. Use a barra de pesquisa para encontrar conteúdo específico
4. Navegue pelas categorias ou explore o conteúdo em destaque

### Criando Novo Conteúdo

Para adicionar novo conteúdo, edite os arquivos mock:

#### Novo Vídeo Tutorial
```json
{
  "id": "content-new",
  "title": "Novo Tutorial",
  "description": "Descrição do tutorial",
  "category_id": "cat-1",
  "type": "video",
  "difficulty": "beginner",
  "duration_minutes": 10,
  "tags": ["tutorial", "básico"],
  "featured": false,
  "published": true,
  "views": 0,
  "likes": 0,
  "video_url": "https://player.vimeo.com/video/sample",
  "video_thumbnail": "/src/assets/images/help/thumbnail.jpg"
}
```

#### Novo Artigo
```json
{
  "id": "article-new",
  "title": "Novo Artigo",
  "description": "Descrição do artigo",
  "category_id": "cat-1",
  "type": "article",
  "difficulty": "intermediate",
  "read_time_minutes": 5,
  "tags": ["artigo", "guia"],
  "featured": false,
  "published": true,
  "views": 0,
  "likes": 0,
  "article_content": "# Título\n\nConteúdo em **Markdown**..."
}
```

### Personalização do Tour

Para modificar o tour guiado, edite o array `tourSteps` em `HelpCenterTour.tsx`:

```typescript
const tourSteps: TourStep[] = [
  {
    id: 'step-id',
    title: 'Título do Passo',
    description: 'Descrição detalhada',
    target: '[data-tour="target-selector"]',
    position: 'bottom',
    icon: IconComponent
  }
];
```

## Acessibilidade

O centro de ajuda foi desenvolvido com foco em acessibilidade:

- **Navegação por teclado**: Todos os elementos são navegáveis via teclado
- **Screen readers**: Suporte completo com aria-labels e descrições
- **Contraste**: Cores seguem padrões WCAG AA
- **Focus management**: Gerenciamento adequado de foco em modais e tour
- **Semântica HTML**: Uso correto de elementos semânticos

## Métricas e Analytics

### Dados Coletados

- Visualizações por conteúdo
- Curtidas e avaliações
- Progresso de conclusão
- Padrões de busca
- Conteúdo mais popular

### Acesso às Métricas

```typescript
const { getCompletionStats, getPopularContent } = useHelpCenter();

// Estatísticas de conclusão do usuário
const stats = getCompletionStats();
console.log(`Progresso: ${stats.percentage}%`);

// Conteúdo mais popular
const popular = getPopularContent(10);
```

## Extensibilidade

### Adicionando Novos Tipos de Conteúdo

1. Estenda o enum `ContentType` em `models/helpCenter.ts`
2. Adicione o ícone correspondente em `contentTypeIcons`
3. Implemente a renderização em `HelpContentViewPage.tsx`
4. Atualize os filtros e busca se necessário

### Integrações Futuras

- **Player de vídeo avançado**: Integração com Vimeo/YouTube
- **Sistema de comentários**: Discussões por conteúdo
- **Avaliações**: Sistema de rating com feedback
- **Notificações**: Alertas para novo conteúdo
- **API real**: Substituição dos mocks por endpoints REST

## Troubleshooting

### Problemas Comuns

**Tour não inicia automaticamente**
- Verifique se os elementos `data-tour` existem no DOM
- Confirme que `hasSeenTour` está false

**Busca não retorna resultados**
- Verifique se o conteúdo está marcado como `published: true`
- Confirme que os termos de busca têm mais de 2 caracteres

**Progresso não é salvo**
- Verifique se o localStorage está funcionando
- Confirme que o `user_id` está sendo passado corretamente

### Logs de Debug

```typescript
// Habilitar logs detalhados
localStorage.setItem('help:debug', 'true');

// Ver dados do store
console.log(helpCenterStore.getAllContent());
```

## Contribuição

Para contribuir com o centro de ajuda:

1. Adicione novos conteúdos nos arquivos mock
2. Teste a acessibilidade com leitores de tela
3. Valide a responsividade em diferentes dispositivos
4. Documente mudanças significativas neste README

## Licença

Este componente faz parte do sistema TrakNor CMMS e segue a mesma licença do projeto principal.