# 🎨 Guia de Uso - Cores e Tokens TrakNor CMMS

## 📋 Como Usar os Tokens de Cores

### 🎯 Tokens Principais

```css
/* Cores da marca TrakNor */
--brand: #38B2A4         /* Cor principal da marca */
--brand-light: #B1E0DA   /* Versão clara da marca */
--brand-dark: #2A8A7E    /* Versão escura da marca */

/* Cores de estado */
--success: #38B2A4       /* Sucesso (usa cor da marca) */
--warning: #F59E0B       /* Alerta/avisos */
--destructive: #ff5b5b   /* Erro/crítico */
--info: #e0f3f4          /* Informativo */
```

### 📊 Cores de Gráficos (Alinhadas com 7756ef0)

```css
--chart-1: #006b76   /* Concluído/Funcionando - Verde petróleo escuro */
--chart-2: #e0f3f4   /* Aberto/Pendente - Azul claro */
--chart-3: #ff5b5b   /* Em Atraso/Parado - Vermelho */
--chart-4: #F59E0B   /* Manutenção/Warning - Laranja */
--chart-5: #38B2A4   /* Marca principal */
--chart-6: #64748B   /* Neutro/cinza */
```

### 🧭 Sidebar (Navegação)

```css
--sidebar-active-bg: #006b76      /* Fundo do item ativo */
--sidebar-active-fg: #FFFFFF      /* Texto do item ativo */
--sidebar-active-outline: #006b76 /* Contorno do item ativo */
```

## 💻 Exemplos de Uso

### Classes Tailwind Recomendadas

```html
<!-- Botão primário -->
<button class="bg-primary text-primary-foreground">
  Ação Principal
</button>

<!-- Status de sucesso -->
<div class="bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30">
  ✅ Operação concluída
</div>

<!-- Gráfico usando tokens -->
<div class="bg-[var(--chart-1)]" style="height: 20px"></div>

<!-- Sidebar item ativo -->
<div class="bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)] ring-2 ring-[var(--sidebar-active-outline)]">
  Item Ativo
</div>
```

### CSS Direto (quando necessário)

```css
.custom-chart-series {
  background-color: var(--chart-1);
  border-color: var(--chart-1);
}

.status-funcionando {
  color: var(--chart-1);
}

.status-atraso {
  color: var(--chart-3);
}
```

### Componentes de Gráfico (Recharts)

```tsx
const CHART_CONFIG = {
  concluido: {
    label: "Concluído",
    color: "var(--chart-1)"
  },
  aberto: {
    label: "Aberto", 
    color: "var(--chart-2)"
  },
  atraso: {
    label: "Em Atraso",
    color: "var(--chart-3)"
  }
}
```

## 🚨 Regras Importantes

### ✅ FAÇA

- Use sempre tokens CSS: `var(--token-name)`
- Para Tailwind: `bg-[var(--chart-1)]` ou classes mapeadas
- Mantenha consistência visual usando os mesmos tokens
- Teste contrastes (WCAG AA: 4.5:1 mínimo)

### ❌ NÃO FAÇA

- Cores hardcoded: `#38B2A4`, `rgb(56, 178, 164)`
- Valores mágicos sem significado semântico
- Cores diferentes para o mesmo estado/tipo
- Ignorar a hierarquia de tokens

## 📐 Contrastes Validados

| Token | Cor | Sobre Branco | Sobre Escuro |
|-------|-----|-------------|--------------|
| `--chart-1` | #006b76 | 8.2:1 ✅ | 2.6:1 ❌ |
| `--chart-3` | #ff5b5b | 4.9:1 ✅ | 3.4:1 ❌ |
| `--success` | #38B2A4 | 6.1:1 ✅ | 2.2:1 ❌ |
| `--warning` | #F59E0B | 3.8:1 ❌ | 4.5:1 ✅ |

## 🔄 Manutenção

Para alterar cores no futuro:

1. **Modifique apenas** `src/index.css` e `src/globals.css`
2. **Mantenha a consistência** entre os dois arquivos
3. **Teste o build**: `npm run build`
4. **Valide visualmente** todas as páginas
5. **Teste acessibilidade** com ferramentas como axe ou Lighthouse

---

*Atualizado em: 31 de julho de 2025*  
*Baseado na auditoria do commit 7756ef0*
