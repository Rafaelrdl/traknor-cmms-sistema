# Implementação do Contorno Ativo da Sidebar - Token #006b76

## Resumo das Alterações

Implementação do token CSS `--sidebar-active-outline` com cor #006b76 para o contorno dos itens ativos na navegação lateral, seguindo os requisitos de acessibilidade e padronização de tokens.

## Arquivos Modificados

### 1. `/src/globals.css`
- **Linhas 34 e 71**: Adicionado token `--sidebar-active-outline: #006b76` para temas light e dark
- **Linhas 94-101**: Adicionadas regras CSS para aplicar o contorno nos elementos sidebar ativos

### 2. `/src/components/Layout.tsx`
- **Linha 69**: Adicionado `ring-2 ring-offset-2 ring-[var(--sidebar-active-outline)]` ao estado ativo dos links de navegação

## Implementação de Tokens

| Token | Valor | Uso | Tema |
|-------|-------|-----|------|
| `--sidebar-active-outline` | #006b76 | Contorno de itens ativos na sidebar | Light/Dark |

## Seletores CSS Aplicados

```css
/* Para componentes do shadcn/ui sidebar */
[data-sidebar="menu-button"][data-active="true"] {
  outline: 2px solid var(--sidebar-active-outline);
  outline-offset: 2px;
}

[data-sidebar="menu-sub-button"][data-active="true"] {
  outline: 2px solid var(--sidebar-active-outline);
  outline-offset: 2px;
}
```

```css
/* Para componente Layout.tsx */
.ring-[var(--sidebar-active-outline)] {
  --tw-ring-color: var(--sidebar-active-outline);
}
```

## Critérios de Aceite Atendidos

- ✅ Token global definido em CSS (não hardcoded nos componentes)
- ✅ Cor #006b76 aplicada via `var(--sidebar-active-outline)`
- ✅ Contorno visível apenas em itens ativos
- ✅ Acessibilidade mantida com `outline-offset: 2px`
- ✅ Compatibilidade com light e dark theme
- ✅ Aplicação em ambos os componentes: Layout.tsx e shadcn sidebar

## Componentes Afetados

1. **Layout.tsx**: Navegação horizontal principal
2. **sidebar.tsx**: Componente shadcn/ui para futuras implementações de sidebar
3. **globals.css**: Definição centralizada de tokens

## Validação Visual

O contorno aparece automaticamente nos itens ativos da navegação (ex: "Visão Geral") com:
- Cor: #006b76
- Espessura: 2px
- Offset: 2px para melhor visibilidade
- Aplicação: Apenas em elementos com estado ativo/selecionado

## Comandos de Verificação

```bash
# Verificar aplicação do token
grep -R "sidebar-active-outline" src/

# Verificar uso em componentes
grep -R "ring-\[var(--sidebar-active-outline)\]" src/
```