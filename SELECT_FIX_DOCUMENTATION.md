# Correção de Erros SelectItem com Valores Vazios

## Problema Identificado

O erro reportado era:
```
Uncaught Error: A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

## Arquivos Corrigidos

### 1. `/src/pages/InventoryPage.tsx`
- **Problema**: `<SelectItem value="">Todas</SelectItem>`
- **Correção**: `<SelectItem value="all">Todas</SelectItem>`
- **Código relacionado atualizado**: 
  - Estado inicial: `useState<string>('all')`
  - Lógica de filtro: `selectedCategory === 'all' ? undefined : selectedCategory`

### 2. `/src/components/inventory/EditItemModal.tsx`
- **Problema**: `<SelectItem value="">Sem categoria</SelectItem>`
- **Correção**: `<SelectItem value="uncategorized">Sem categoria</SelectItem>`
- **Código relacionado atualizado**:
  - Estado inicial: `category_id: 'uncategorized'`
  - Carregamento: `item.category_id || 'uncategorized'`
  - Envio: `formData.category_id === 'uncategorized' ? undefined : formData.category_id`

### 3. `/src/components/inventory/NewItemModal.tsx`
- **Problema**: `<SelectItem value="">Sem categoria</SelectItem>`
- **Correção**: `<SelectItem value="uncategorized">Sem categoria</SelectItem>`
- **Código relacionado atualizado**:
  - Estado inicial: `category_id: 'uncategorized'`
  - Reset: `category_id: 'uncategorized'`
  - Envio: `formData.category_id === 'uncategorized' ? undefined : formData.category_id`

### 4. `/src/components/inventory/MoveItemModal.tsx`
- **Problema**: `<SelectItem value="">Nenhum</SelectItem>`
- **Correção**: `<SelectItem value="none-reference">Nenhum</SelectItem>`
- **Código relacionado atualizado**:
  - Estado inicial: `reference_type: 'none-reference'`
  - Reset: `reference_type: 'none-reference'`
  - Envio: `formData.reference_type === 'none-reference' ? undefined : formData.reference_type`

### 5. `/src/components/LocationFormModal.tsx`
- **Problemas**: 
  - `<SelectItem value="none">Selecionar empresa</SelectItem>` (2x)
  - `<SelectItem value="none">Selecionar setor</SelectItem>`
- **Correções**: 
  - `<SelectItem value="no-company">Selecionar empresa</SelectItem>`
  - `<SelectItem value="no-company-sub">Selecionar empresa</SelectItem>`
  - `<SelectItem value="no-sector">Selecionar setor</SelectItem>`
- **Código relacionado atualizado**:
  - Estado inicial: `companyId: 'no-company'`, `sectorId: 'no-sector'`
  - Validações: comparação com os novos valores
  - Reset: uso dos novos valores

### 6. `/src/components/PlanFormModal.tsx`
- **Problemas**:
  - `<SelectItem value="none">Nenhuma selecionada</SelectItem>`
  - `<SelectItem value="none">Nenhum selecionado</SelectItem>`
- **Correções**:
  - `<SelectItem value="no-location">Nenhuma selecionada</SelectItem>`
  - `<SelectItem value="no-equipment">Nenhum selecionado</SelectItem>`
- **Código relacionado atualizado**:
  - Validações: `locationId === "no-location"`, `equipmentId === "no-equipment"`
  - Valores padrão: `formData.scope.location_id || "no-location"`

## Padrão Adotado

Para resolver este problema sistematicamente, foi adotado o seguinte padrão:

1. **Valores de "nenhum/todos"**: Usar valores semânticos específicos ao invés de strings vazias ou "none"
   - `""` → `"all"` (para filtros "todos")
   - `""` → `"uncategorized"` (para sem categoria)
   - `"none"` → valores específicos como `"no-company"`, `"no-sector"`, etc.

2. **Lógica condicional**: Sempre verificar o valor especial antes de enviar para a API
   - `value === 'all' ? undefined : value`
   - `value === 'uncategorized' ? undefined : value`

3. **Estados iniciais**: Usar os valores especiais ao invés de strings vazias

## Resultado

Todos os componentes Select agora usam valores válidos não-vazios, resolvendo o erro reportado e mantendo a funcionalidade esperada.