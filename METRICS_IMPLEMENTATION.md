# Implementação de Métricas - TrakNor CMMS

## 📊 Visão Geral

A página de métricas fornece indicadores chave de performance (KPIs) e análise de tendências para o sistema de gestão de manutenção HVAC.

## 🎯 Funcionalidades Implementadas

### KPIs Principais

1. **MTTR Médio (Mean Time To Repair)**
   - Tempo médio de reparo em horas
   - Calculado apenas para OS corretivas concluídas
   - Badge de cor baseado no valor (>48h = warning)

2. **Backlog %**
   - Porcentagem de ordens de serviço em aberto
   - Calculado como: OS abertas / Total de OS × 100
   - Cores: >30% danger, >15% warning, ≤15% success

3. **Top Ativo por OS**
   - Equipamento com maior número de ordens de serviço
   - Mostra nome do equipamento e contagem
   - Inclui setor para contexto

4. **Preventivas no Prazo**
   - Porcentagem de OS preventivas concluídas no prazo
   - Calculado como: Preventivas no prazo / Total preventivas × 100
   - Cores: ≥90% success, ≥75% warning, <75% danger

### Gráficos

1. **MTTR por Setor (Barras Horizontais)**
   - Top 8 setores por volume de OS
   - Barras ordenadas por maior MTTR
   - Tooltip com detalhes (MTTR + contagem de OS)
   - Acessibilidade completa com aria-labels

2. **Evolução do Backlog (Linha)**
   - Últimos 6-12 períodos (dependendo do range)
   - Linha de meta em 20% como referência
   - Área sombreada sob a curva
   - Tooltips interativos com dados detalhados

### Controles

- **Seletor de Período**: 30 dias, 90 dias, 12 meses
- **Exportar CSV**: Dados estruturados com KPIs e gráficos
- **Exportar PDF**: Impressão otimizada via window.print()

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── models/
│   └── metrics.ts              # Types/interfaces para métricas
├── data/
│   ├── metricsStore.ts         # Lógica de cálculo e persistência
│   └── mockMetricsData.ts      # Dados expandidos para testes
├── hooks/
│   └── useMetrics.ts           # Hook customizado com React Query
├── components/
│   ├── charts/
│   │   ├── MTTRBySectorChart.tsx
│   │   └── BacklogTrendChart.tsx
│   └── metrics/
│       └── MetricsToolbar.tsx
└── pages/
    └── MetricsPage.tsx         # Página principal
```

### Fluxo de Dados

1. **useMetrics Hook** gerencia estado e queries
2. **React Query** fornece caching e revalidação automática
3. **metricsStore** calcula KPIs e gráficos from raw data
4. **localStorage** persiste dados entre sessões
5. **Mock data** fornece dados realistas para demonstração

## 🔢 Fórmulas de Cálculo

### MTTR (Mean Time To Repair)
```typescript
// Apenas OS corretivas concluídas
MTTR = Σ(data_conclusao - data_inicio) / quantidade_OS_corretivas
```

### Backlog %
```typescript
// Por período
Backlog% = (OS_abertas / OS_totais_periodo) × 100
```

### Backlog Mensal (Tendência)
```typescript
// Por mês específico
BacklogMensal% = (OS_abertas_fim_mes / (OS_abertas_mes + OS_fechadas_mes)) × 100
```

### Preventivas no Prazo
```typescript
// Considerando data de conclusão <= data programada
PreventivaPrazo% = (Preventivas_no_prazo / Total_preventivas_periodo) × 100
```

## 🎨 Design System

### Cores dos KPIs
- **Success**: Verde - valores dentro da meta
- **Warning**: Amarelo - valores de atenção
- **Danger**: Vermelho - valores críticos
- **Default**: Cinza - valores neutros

### Acessibilidade
- Todas as visualizações possuem descrições textuais (sr-only)
- Gráficos têm role="img" e aria-describedby
- Controles são navegáveis por teclado
- Contrastes respeitam WCAG AA (≥4.5:1 texto, ≥3:1 ícones)

## 📱 Responsividade

### Breakpoints
- **Mobile** (<768px): KPIs em coluna única, gráficos empilhados
- **Tablet** (768-1023px): KPIs em 2 colunas, gráficos em grid
- **Desktop** (≥1024px): KPIs em 4 colunas, gráficos lado a lado

### Impressão
- Estilos específicos para `@media print`
- Layout otimizado para PDF/impressão
- Informações de período e geração incluídas
- Navegação e controles ocultos

## 🧪 Testes

### Testes Unitários (Vitest)
- Cálculos de MTTR, backlog e preventivas
- Filtros por período funcionando
- Estrutura de dados dos gráficos
- Mocks e persistência

### Testes de Acessibilidade
- Screen readers conseguem navegar
- Descrições textuais presentes
- Contraste adequado

## 🚀 Performance

### Otimizações
- **React Query** com staleTime de 5 minutos
- **useMemo** nos cálculos pesados dos componentes
- **Lazy loading** de dados históricos
- **CSS transitions** suaves sem janks

### Caching Strategy
1. React Query mantém dados em memória
2. localStorage persiste configurações do usuário
3. Computação sob demanda apenas quando range muda

## 📈 Dados de Exemplo

Os dados incluem:
- **30+ ordens de serviço** distribuídas pelos últimos 12+ meses
- **6 equipamentos** de diferentes tipos e setores
- **5 setores** para análise comparativa
- **Mix balanceado** de OS preventivas e corretivas
- **Status variados** (aberta, em progresso, concluída)

## 🔧 Configuração e Uso

### Instalação
Dependências adicionais necessárias estão já incluídas:
- @tanstack/react-query (state management)
- lucide-react (ícones)
- sonner (toasts)

### Uso Básico
```tsx
import { MetricsPage } from '@/pages/MetricsPage';

// A página é self-contained e gerencia seu próprio estado
<Route path="/metrics" element={<MetricsPage />} />
```

### Customização
Para ajustar cálculos ou adicionar novos KPIs:

1. Atualizar interfaces em `models/metrics.ts`
2. Implementar cálculos em `data/metricsStore.ts`
3. Criar componentes de visualização se necessário
4. Adicionar ao `MetricsPage.tsx`

## 📋 Próximos Passos / Backlog

KPIs adicionais identificados para futuro desenvolvimento:

- **MTBF** (Mean Time Between Failures)
- **Taxa Corretiva vs Preventiva**
- **Aging de OS Abertas**
- **SLA de Conclusão**
- **Disponibilidade por Setor**
- **First Time Fix Rate**
- **Conversão Solicitação → OS**
- **Top 5 Ativos por Backlog**
- **Mapa de Prioridade**
- **Cumprimento de Plano**

## 🤝 Contribuição

Ao implementar novos KPIs:
1. Seguir padrões de nomenclatura existentes
2. Incluir testes unitários
3. Garantir acessibilidade
4. Documentar fórmulas de cálculo
5. Adicionar dados mock realistas

---

**Última atualização**: Janeiro 2024  
**Versão**: 1.0.0  
**Status**: ✅ Completa e testada