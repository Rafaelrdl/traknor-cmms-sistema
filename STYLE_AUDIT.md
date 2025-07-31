# 🎨 TrakNor CMMS - Auditoria de Estilos Completa

## 📋 Resumo Executivo

**Data da Auditoria**: 31 de julho de 2025  
**Comparação**: HEAD vs. commit 7756ef0483d6a06002cbf86bcd2947ec6b901513  
**Status**: 🟡 Divergências críticas identificadas

### 🔍 Principais Descobertas

1. **Duplicação de Arquivos CSS**: Existem múltiplos arquivos CSS com conflitos de tokens
2. **Configuração Tailwind Fragmentada**: 3 versões diferentes (v3, v4, e principal)
3. **Inconsistência de Valores**: Mesmos tokens com valores diferentes entre arquivos
4. **Hooks Alterados**: Mudança de `useData` para `useDataTemp` em componentes

### ⚠️ Impacto Visual

- **Paleta de Gráficos**: Inconsistente entre `index.css` e `globals.css`
- **Sidebar Ativa**: Tokens implementados mas podem estar duplicados
- **Cores de Status**: Conflitos entre HEX e OKLCH nos mesmos tokens

### Causa Raiz

As divergências ocorreram devido a múltiplas implementações CSS simultâneas e fragmentação da configuração de tokens, resultando em inconsistência visual entre arquivos de configuração.

## 📊 Tabela Comparativa de Tokens

Baseado na análise dos arquivos anexados, identifiquei estas divergências principais:

| Token | Valor em 7756ef0 | Valor em HEAD (index.css) | Valor em HEAD (globals.css) | Diferença | Onde é usado |
|-------|------------------|----------------------------|-------------------------------|-----------|--------------|
| `--chart-1` | **Não disponível** | #006b76 | oklch(0.6 0.2 180) | Conflito entre arquivos | Gráficos - série principal |
| `--chart-2` | **Não disponível** | #e0f3f4 | oklch(0.7 0.15 120) | Conflito entre arquivos | Gráficos - série secundária |
| `--chart-3` | **Não disponível** | #ff5b5b | oklch(0.8 0.1 60) | Conflito entre arquivos | Gráficos - série de erro |
| `--destructive` | **Não disponível** | #ff5b5b | oklch(0.5 0.2 0) | Conflito entre arquivos | Alertas, erros |
| `--sidebar-active-bg` | **Não disponível** | #006b76 | #006b76 | Consistente | Fundo de item ativo |
| `--sidebar-active-fg` | **Não disponível** | #FFFFFF | #ffffff | Consistente | Texto de item ativo |

## 🔍 Cores Hardcoded Identificadas

### Arquivos CSS (Esperado)
| Arquivo | Linha | Cor | Contexto | Status |
|---------|-------|-----|----------|---------|
| src/index.css | 17 | #38B2A4 | Token --brand | ✅ Aceito |
| src/index.css | 52 | #ff5b5b | Token --destructive | ✅ Aceito |
| src/index.css | 67 | #006b76 | Token --sidebar-active-bg | ✅ Aceito |

### Componentes UI (Requer Correção)
| Arquivo | Linha | Cor | Contexto | Substituir por |
|---------|-------|-----|----------|----------------|
| src/components/ui/chart.tsx | 56 | #ccc | Grid lines recharts | `var(--border)` |
| src/components/ui/chart.tsx | 56 | #fff | Stroke colors | `var(--background)` |

## 🖼️ Impacto por Componente/Página

### Layout.tsx
- ✅ **Modificação Identificada**: Hook alterado de `useData` para `useDataTemp`
- ✅ **Rota Alterada**: Visão Geral de `/` para `/dashboard`
- ✅ **Sidebar Ativo**: Usa `var(--sidebar-active-bg)` corretamente

### KPICard.tsx
- ✅ **Tokens Aplicados**: Variantes usando `var(--success)`, `var(--warning)`, `var(--destructive)`
- ✅ **Ícones Corretos**: TrendingDown usa `text-[var(--success)]` (pode ser incorreto - deveria ser red para down?)

### Chart.tsx
- ⚠️ **Cores Hardcoded**: `#ccc` e `#fff` em seletores CSS para recharts
- ✅ **Sistema de Tokens**: Implementado corretamente com ChartConfig

## 🎯 Paleta de Gráficos

### Atual (HEAD) - index.css
- Concluído: #006b76 (verde-azulado escuro)
- Em Atraso: #ff5b5b (vermelho)
- Aberto: #e0f3f4 (azul claro)
- Warning: #F59E0B (laranja)
- Primary: #38B2A4 (verde-azulado médio)

### Atual (HEAD) - globals.css
- Chart-1: oklch(0.6 0.2 180) (diferente do index.css)
- Chart-2: oklch(0.7 0.15 120) (diferente do index.css)
- Chart-3: oklch(0.8 0.1 60) (diferente do index.css)

## ⚠️ Riscos e Pontos de Confirmação

1. **Múltiplos Arquivos CSS**: 
   - `src/index.css`, `src/globals.css`, `src/main.css`, `src/styles/theme.css`
   - **Recomendação**: Consolidar em um único arquivo ou estabelecer hierarquia clara

2. **Conflito de Valores**:
   - Chart colors definidos diferentemente em index.css (HEX) vs globals.css (OKLCH)
   - **Necessário**: Decidir qual fonte usar como verdade

3. **PostCSS Config Duplicado**:
   - `postcss.config.js` e `postcss.config.cjs` existem simultaneamente
   - **Recomendação**: Manter apenas um

4. **Hook Changes**:
   - Layout mudou de `useData` para `useDataTemp`
   - **Confirmação Necessária**: Se esta é uma mudança intencional

## 📝 Plano de Correção

### 1. Consolidar Configurações CSS
- Definir `src/index.css` como fonte de verdade para tokens
- Remover duplicações em outros arquivos CSS
- Manter apenas tokens essenciais em cada arquivo

### 2. Eliminar Cores Hardcoded
- Substituir `#ccc` por `var(--border)` em chart.tsx
- Substituir `#fff` por `var(--background)` em chart.tsx

### 3. Padronizar Configuração Tailwind
- Garantir que tailwind.config.js mapeia todos os tokens CSS
- Verificar compatibilidade com Tailwind v4

### 4. Validar Funcionalidade
- Confirmar se mudanças de hooks são intencionais
- Verificar se todas as páginas funcionam corretamente

### 5. Acessibilidade
- Validar contrastes WCAG AA (4.5:1 mínimo)
- Confirmar visibilidade de foco em elementos interativos

## 🚀 Comandos de Verificação

```bash
# Verificar cores hardcoded em componentes
grep -R --line-number -E "#[0-9a-fA-F]{3,8}" src/components/ src/pages/ | grep -v "index.css"

# Verificar uso correto de tokens
grep -R --line-number "var(--" src/components/ src/pages/

# Verificar imports duplicados de CSS
find src/ -name "*.css" -exec echo "=== {} ===" \; -exec head -10 {} \;

# Testar build
npm run build
```

## 📋 Checklist de Implementação

- [ ] **Consolidar arquivos CSS** (decidir arquivo principal)
- [ ] **Corrigir chart.tsx** (remover #ccc e #fff)
- [ ] **Validar tokens de chart** (HEX vs OKLCH)
- [ ] **Verificar funcionalidade de hooks** (useDataTemp vs useData)
- [ ] **Limpar configurações PostCSS duplicadas**
- [ ] **Testar acessibilidade** (contrastes e foco)
- [ ] **Validar build** (sem erros)

## ✅ Critérios de Aceite

1. **Única Fonte de Verdade**: Tokens definidos em um local centralizado
2. **Zero Cores Hardcoded**: Exceto em definições de tokens CSS
3. **Funcionalidade Mantida**: Todas as páginas funcionam corretamente
4. **Acessibilidade**: WCAG AA compliant
5. **Build Limpo**: Sem warnings ou erros

---

**Data da Auditoria**: $(date)
**Responsável**: GitHub Spark AI Assistant
**Status**: 🔍 Análise Completa - Aguardando Implementação
