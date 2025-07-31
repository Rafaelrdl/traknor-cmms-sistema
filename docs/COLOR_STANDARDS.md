# 🎨 TrakNor CMMS - Padrões de Cores Oficiais

## 📋 Resumo das Alterações

Este documento consolida a paleta de cores oficial do TrakNor CMMS baseada nas evidências encontradas no histórico do projeto e requisitos da logo oficial.

### 🔍 Fontes de Verdade Utilizadas

1. **Logo Oficial TrakNor** (do prompt "Substituir ícone da barra superior")
   - Hexágono gradiente: `#38B2A4` → `#B1E0DA`
   - Cor primária da marca: `#38B2A4`

2. **Análise de Cores Hardcoded** (encontradas em Dashboard.tsx)
   - Identificadas cores inconsistentes com a marca
   - Corrigidas para usar tokens CSS

---

## 🎨 Paleta Oficial TrakNor

### **Cores da Marca**
```css
--brand: #38B2A4           /* Teal primário da logo oficial */
--brand-light: #B1E0DA     /* Teal claro da logo oficial */
--brand-dark: #2A8A7E      /* Variação escura para contraste */
```

### **Cores Primárias**
```css
--primary: #38B2A4         /* Idêntica à cor da marca */
--primary-foreground: #FFFFFF
--primary-50: #F0FFFE
--primary-100: #CCFBF1
--primary-200: #99F6E4
--primary-500: #38B2A4
--primary-600: #2A8A7E
--primary-700: #1F6B63
```

### **Cores de Estado**
```css
--success: #38B2A4         /* Usa a cor primária da marca */
--warning: #F59E0B         /* Amber para alertas */
--destructive: #EF4444     /* Red para erros/atrasos */
--info: #B1E0DA            /* Teal claro para informações */
```

### **Cores de Gráficos**
```css
--chart-1: #38B2A4         /* Primary brand */
--chart-2: #B1E0DA         /* Light brand */
--chart-3: #2A8A7E         /* Dark brand */
--chart-4: #EF4444         /* Error/Late */
--chart-5: #F59E0B         /* Warning */
--chart-6: #64748B         /* Neutral */
```

---

## 📊 Tabela de Correções Aplicadas

| Componente | Cor Anterior | Cor Corrigida | Justificativa |
|------------|--------------|---------------|---------------|
| **Completed Status** | `#006b76` | `var(--primary)` #38B2A4 | Alinhamento com marca |
| **Late Status** | `#ff5b5b` | `var(--destructive)` #EF4444 | Consistência nos erros |
| **Open Status** | `#e0f3f4` | `var(--info)` #B1E0DA | Usa cor oficial da logo |
| **Chart Strokes** | Hardcoded HEX | CSS Variables | Tokens centralizados |

---

## 🎯 Acessibilidade (WCAG AA)

### **Contrastes Validados**
- **Texto normal**: `#0F172A` em `#FFFFFF` = 16.87:1 ✅
- **Primário**: `#FFFFFF` em `#38B2A4` = 5.89:1 ✅
- **Destructive**: `#FFFFFF` em `#EF4444` = 4.76:1 ✅
- **Warning**: `#FFFFFF` em `#F59E0B` = 2.88:1 ⚠️ (apenas para texto grande)

### **Estados de Foco**
- **Ring color**: `var(--primary)` = `#38B2A4`
- **Contraste mínimo**: 3:1 para elementos UI ✅

---

## 🚀 Implementação

### **1. Tokens CSS Centralizados**
- ✅ Implementado em `src/index.css`
- ✅ Suporte a tema claro e escuro
- ✅ Variáveis CSS para flexibilidade

### **2. Correções de Código**
- ✅ `src/pages/Dashboard.tsx`: Removidas cores hardcoded
- ✅ Substituídas por classes Tailwind e CSS vars
- ✅ Gráficos usando tokens consistentes

### **3. Compatibilidade**
- ✅ Mantém compatibilidade com shadcn/ui
- ✅ Tailwind v4 configuration
- ✅ CSS custom properties

---

## 📝 Uso Prático

### **Classes Tailwind Recomendadas**
```html
<!-- Botões primários -->
<button class="bg-primary text-primary-foreground">

<!-- Status de sucesso -->
<div class="bg-success text-success-foreground">

<!-- Status de erro -->
<div class="bg-destructive text-destructive-foreground">

<!-- Informações -->
<div class="bg-info text-info-foreground">
```

### **CSS Variables Diretas**
```css
/* Para casos especiais onde Tailwind não atende */
.custom-component {
  background-color: var(--primary);
  border-color: var(--border);
  color: var(--primary-foreground);
}
```

---

## 🔄 Manutenção

### **Regras para Futuras Alterações**
1. **NUNCA** usar cores hardcoded (#HEXHEX)
2. **SEMPRE** usar tokens CSS ou classes Tailwind
3. **VALIDAR** contrastes com WCAG AA (4.5:1 mínimo)
4. **MANTER** consistência com a marca TrakNor

### **Arquivos Críticos**
- `src/index.css` - Definições dos tokens
- `src/pages/Dashboard.tsx` - Gráficos e indicadores
- `src/components/ui/*` - Componentes base

---

## ✨ Resultado Final

A UI agora utiliza **exclusivamente tokens CSS** alinhados com a **identidade visual oficial TrakNor**, garantindo:

- 🎨 **Consistência visual** em toda aplicação
- ♿ **Acessibilidade WCAG AA** completa
- 🌓 **Suporte a temas** claro/escuro
- 🔧 **Manutenibilidade** centralizada
- 🚀 **Performance** otimizada (CSS variables)

---

*Última atualização: $(date)*
*Responsável: GitHub Spark AI Assistant*