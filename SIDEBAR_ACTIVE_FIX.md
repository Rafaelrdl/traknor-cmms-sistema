# Correção do Item Ativo da Sidebar

## Alterações Realizadas

### 1. Tokens CSS (src/index.css e src/globals.css)

- **Removido**: `--sidebar-active-outline` (contorno)
- **Adicionado**: 
  - `--sidebar-active-bg: #006b76` (cor de fundo)
  - `--sidebar-active-fg: #ffffff` (cor do texto)

### 2. Tailwind Config (tailwind.config.js)

Adicionados novos tokens ao tema:
```javascript
sidebar: {
  DEFAULT: "var(--sidebar)",
  primary: "var(--sidebar-primary)",
  accent: "var(--sidebar-accent)",
  border: "var(--sidebar-border)",
  active: {
    bg: "var(--sidebar-active-bg)",
    fg: "var(--sidebar-active-fg)",
  },
},
```

### 3. Componente Layout (src/components/Layout.tsx)

**Antes:**
```tsx
className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
  isActive
    ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-[var(--sidebar-active-outline)]'
    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
}`}
```

**Depois:**
```tsx
className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
  isActive
    ? 'bg-sidebar-active-bg text-sidebar-active-fg'
    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
}`}
```

### 4. Limpeza (src/globals.css)

Removidos estilos CSS antigos:
- `[data-sidebar="menu-button"][data-active="true"]`
- `[data-sidebar="menu-sub-button"][data-active="true"]`

## Resultado

- ✅ Contorno removido do item ativo
- ✅ Cor de fundo #006b76 aplicada ao item selecionado
- ✅ Texto branco sobre fundo #006b76 para boa legibilidade
- ✅ Tokens centralizados e reutilizáveis
- ✅ Suporte para tema dark mantido

## Cores Aplicadas

- **Background ativo**: #006b76 (verde-azulado escuro)
- **Texto ativo**: #ffffff (branco)
- **Contraste**: Atende WCAG AA (4.5:1 ratio)