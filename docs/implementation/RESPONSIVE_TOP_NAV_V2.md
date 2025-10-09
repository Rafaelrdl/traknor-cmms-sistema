# ResponsiveTopNav - Navegação Responsiva com Priority+ Pattern V2

## 📋 Visão Geral

Componente de navegação responsiva que usa **medição real do DOM** para determinar dinamicamente quantos itens exibir e quando usar modo compacto (ícone-apenas).

## ✨ Características

- ✅ **Sem números mágicos** - Decisões baseadas em medições reais
- ✅ **Modo adaptativo** - Alterna automaticamente entre label+ícone e ícone-apenas
- ✅ **Menu overflow inteligente** - Aparece apenas quando necessário
- ✅ **Zero loops infinitos** - Cálculos isolados antes de aplicar ao estado
- ✅ **Responsivo nativo** - ResizeObserver para detecção de mudanças

## 🚀 Como Usar

### Estrutura de Item

```typescript
type NavItem = { 
  id: string;        // Identificador único
  label: string;     // Texto do link
  icon?: React.ReactNode;  // Ícone opcional
  to: string;        // Rota do React Router
};
```

### Exemplo Básico

```tsx
import ResponsiveTopNav from '@/components/layout/ResponsiveTopNav';
import { Home, Package, Settings } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Início', icon: <Home />, to: '/' },
  { id: 'products', label: 'Produtos', icon: <Package />, to: '/products' },
  { id: 'settings', label: 'Configurações', icon: <Settings />, to: '/settings' },
];

function App() {
  return (
    <header>
      <ResponsiveTopNav items={navItems} />
    </header>
  );
}
```

## 🎯 Algoritmo de Decisão

### Passo 1: Tentativa Otimista
- Mede largura total disponível no container
- Tenta encaixar todos os itens com labels (ícone + texto)
- ✅ Se tudo couber → **Sucesso! Modo normal**

### Passo 2: Overflow Detectado
- Subtrai largura do botão "Mais" (⋯)
- Recalcula: quantos cabem com labels vs quantos cabem só com ícones
- Compara os dois modos

### Passo 3: Escolha Inteligente
- Escolhe o modo que mostre **MAIS itens visíveis**
- Preferência para labels quando empate
- Itens que não couberem vão para o menu "Mais"

## 🔧 Pontos Técnicos Críticos

### Medição Real do DOM

```typescript
const liW = li.getBoundingClientRect().width;
const labelW = label?.getBoundingClientRect().width ?? 0;

// Largura no modo ícone-apenas = largura total - largura do label
const iconOnlyWidth = Math.max(0, liW - labelW);
```

### Prevenção de Loops

- Cálculos feitos **localmente** dentro de `measure()`
- Estado atualizado **apenas no final**
- Sem dependências de estado nos cálculos

### CSS Crítico

```css
/* Permite que a lista encolha sem "sumir" */
.priority-nav__list {
  min-width: 0;
  overflow: hidden;
}

/* Modo compacto via data-attribute */
.priority-nav[data-compact="true"] .priority-nav__link .label {
  display: none;
}
```

## 📐 Configuração CSS

O arquivo `priority-nav.css` já está importado em `src/index.css`:

```css
@import './components/layout/priority-nav.css';
```

### Personalização

Para ajustar o visual, edite `priority-nav.css`:

```css
/* Espaçamento entre itens */
.priority-nav__list { gap: 6px; }

/* Padding dos links */
.priority-nav__link { padding: 8px 12px; }

/* Tamanho dos ícones */
.icon { width: 18px; height: 18px; }

/* Menu dropdown */
.priority-nav__menu {
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
}
```

## 🎨 Integração com Tema

Para integrar com Tailwind/tema escuro:

```css
/* priority-nav.css */
.priority-nav__menu {
  background: var(--popover);
  border: 1px solid var(--border);
  color: var(--popover-foreground);
}

.priority-nav__link:hover {
  background: var(--muted);
  color: var(--foreground);
}
```

## ⚠️ Requisitos

- ✅ React ^19.2.0 (instalado)
- ✅ react-router-dom ^6.30.1 (instalado)
- ✅ ResizeObserver (nativo nos navegadores modernos)

**Nenhuma biblioteca adicional necessária!**

## 🆚 Comparação com Implementação Anterior

| Aspecto | Antes (useNavbarOverflow) | Agora (ResponsiveTopNav V2) |
|---------|---------------------------|------------------------------|
| **Thresholds** | Breakpoint <913px fixo | Medição dinâmica |
| **Modo compacto** | Ativado muito cedo | Apenas se aumentar itens visíveis |
| **Menu "⋯"** | Condicional ao estado | Sempre renderizado (medição) |
| **Overflow** | Calculado por estimativa | getBoundingClientRect real |
| **min-width** | Ausente (causava bugs) | Presente na lista |

## 🐛 Bugs Corrigidos

1. ❌ Menu "⋯" só aparecia <913px → ✅ Aparece em qualquer largura quando necessário
2. ❌ Modo compacto travado → ✅ Alterna dinamicamente
3. ❌ Itens sumindo por overflow → ✅ min-width:0 previne
4. ❌ Loops infinitos → ✅ Cálculos isolados do estado

## 📚 Referências

- [Priority+ Navigation Pattern - Brad Frost](https://bradfrost.com/blog/post/revisiting-the-priority-pattern/)
- [ResizeObserver API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [getBoundingClientRect - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)

## 🔗 Arquivos Criados

```
src/
  components/
    layout/
      ResponsiveTopNav.tsx     # Componente principal
      priority-nav.css         # Estilos
  index.css                    # Import do CSS adicionado
```

## 🎯 Próximos Passos

Para integrar no Layout existente:

1. Importe o componente:
   ```tsx
   import ResponsiveTopNav from '@/components/layout/ResponsiveTopNav';
   ```

2. Converta seus itens de navegação para o formato `NavItem`

3. Substitua a navegação atual por:
   ```tsx
   <ResponsiveTopNav items={navItems} />
   ```

4. Teste em diferentes larguras de tela (300px até 2000px+)
