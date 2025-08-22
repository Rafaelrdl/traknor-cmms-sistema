# Sistema ACL (Access Control Layer) - TrakNor CMMS

## Visão Geral

Este documento descreve a implementação do sistema de controle de acesso baseado em papéis (ACL) para o TrakNor CMMS, que condiciona a visualização e disponibilidade de ações conforme o papel do usuário.

## Papéis Implementados

### Administrador (`admin`)
- **Permissões**: Acesso completo a todas as funcionalidades
- **Ações permitidas**: view, create, edit, delete, manage em todos os subjects (*)

### Técnico (`technician`)  
- **Permissões**: Acesso operacional limitado
- **Ações permitidas**:
  - `view`: Todos os subjects (*)
  - `edit`, `move`, `convert`: workorder, inventory, procedure
  - `create`: workorder, solicitation
  - `convert`: solicitation (pode converter solicitações em OS)

### Solicitante (`requester`)
- **Permissões**: Acesso apenas de leitura e criação/edição de solicitações
- **Ações permitidas**:
  - `view`: Todos os subjects (*)
  - `create`, `edit`: solicitation

## Arquivos Implementados

### Core ACL
- `src/acl/abilities.ts`: Mapa de permissões por papel
- `src/hooks/useAbility.ts`: Hook para verificação de permissões
- `src/data/authStore.ts`: Gerenciamento do papel atual do usuário
- `src/components/auth/IfCan.tsx`: Componente para renderização condicional
- `src/components/auth/RoleSwitcher.tsx`: Seletor de papel (apenas dev)

### Componentes com ACL Aplicado
- `src/pages/EquipmentPage.tsx`: Botões de criação de empresa/setor/subsetor/ativo
- `src/components/LocationDetails.tsx`: Botões de edição e criação de ativo
- `src/pages/InventoryPage.tsx`: Botão de novo item
- `src/components/inventory/InventoryTable.tsx`: Botões de editar, movimentar, excluir
- `src/components/inventory/InventoryCards.tsx`: Botões de ação nos cards
- `src/pages/PlansPage.tsx`: Botões de criação e edição de planos
- `src/pages/ProceduresPage.tsx`: Botão de criação de procedimento
- `src/components/procedure/ProcedureTable.tsx`: Botões de edição, exclusão e alteração de status
- `src/components/SolicitationsDrawer.tsx`: Botões de conversão, adição/remoção de itens

## Testes E2E (Cypress)

### Estrutura dos Testes
- `cypress/e2e/acl/admin.cy.ts`: Testes para papel Administrador
- `cypress/e2e/acl/technician.cy.ts`: Testes para papel Técnico  
- `cypress/e2e/acl/requester.cy.ts`: Testes para papel Solicitante
- `cypress/e2e/acl/a11y.cy.ts`: Testes de acessibilidade e navegação por teclado

### Comandos Personalizados
- `cy.setRole(role)`: Define o papel do usuário antes dos testes

### Scripts NPM
```bash
npm run cy:open          # Abre interface do Cypress
npm run cy:run           # Executa todos os testes
npm run cy:run-acl       # Executa apenas testes ACL
```

## Data Test IDs Implementados

Para facilitar os testes, foram adicionados `data-testid` nos elementos:

### Ativos (Equipment)
- `company-create`: Botão criar empresa
- `sector-create`: Botão criar setor
- `subsection-create`: Botão criar subsetor
- `asset-create`: Botão criar ativo
- `asset-edit`: Botão editar ativo

### Estoque (Inventory)
- `inventory-create`: Botão novo item
- `inventory-edit`: Botão editar item
- `inventory-move`: Botão movimentar item
- `inventory-delete`: Botão excluir item

### Planos (Plans)
- `plan-create`: Botão novo plano
- `plan-create-empty`: Botão criar primeiro plano (estado vazio)
- `plan-edit`: Botão editar plano

### Procedimentos (Procedures)
- `procedure-create`: Botão novo procedimento
- `procedure-view`: Botão visualizar procedimento
- `procedure-actions`: Menu de ações
- `procedure-edit`: Botão editar procedimento
- `procedure-delete`: Botão excluir procedimento

### Solicitações (Solicitations)
- `solicitation-advance`: Botão avançar status/converter
- `solicitation-add-item`: Botão adicionar item
- `solicitation-remove-item`: Botão remover item

## Acessibilidade

### Princípios Seguidos
1. **Elementos não permitidos não são renderizados**: Uso do `IfCan` garante que botões restritos não existem no DOM, evitando problemas de navegação por teclado
2. **Foco gerenciado**: Elementos ocultos não recebem foco durante navegação por Tab
3. **ARIA labels**: Todos os botões de ação possuem `aria-label` descritivos
4. **Contraste adequado**: Mantido padrão de cores do tema existente

### Validações de A11y nos Testes
- Verificação de que botões restritos não existem no DOM
- Teste de navegação por teclado sem encontrar elementos ocultos
- Validação de atributos ARIA em botões visíveis

## Como Usar

### Para Desenvolvedores

1. **Verificar permissão em componente**:
```tsx
import { IfCan } from '@/components/auth/IfCan';

<IfCan action="edit" subject="asset">
  <Button onClick={handleEdit}>Editar Ativo</Button>
</IfCan>
```

2. **Verificar permissão programaticamente**:
```tsx
import { useAbility } from '@/hooks/useAbility';

const { can, canEdit, canDelete } = useAbility();

if (can('edit', 'asset')) {
  // Lógica para usuários que podem editar
}
```

3. **Alternar papel (apenas desenvolvimento)**:
   - O componente `RoleSwitcher` aparece no canto inferior direito apenas em modo desenvolvimento
   - Permite alternar entre admin/technician/requester para testes

### Para Testes

1. **Definir papel antes do teste**:
```ts
cy.setRole('admin');
cy.visit('/ativos');
```

2. **Verificar presença/ausência de elementos**:
```ts
cy.get('[data-testid="asset-edit"]').should('exist');        // Admin deve ver
cy.get('[data-testid="asset-delete"]').should('not.exist'); // Técnico não deve ver
```

## Persistência

- O papel atual é salvo em `localStorage` com chave `auth:role`
- Padrão: `requester` (papel mais restritivo)
- Persiste entre recarregamentos de página

## Extensibilidade

Para adicionar novos papéis ou permissões:

1. **Atualizar types em `abilities.ts`**:
```ts
export type Role = 'admin' | 'technician' | 'requester' | 'new-role';
export type Subject = 'workorder' | 'asset' | 'new-subject';
```

2. **Definir permissões no mapa `abilities`**:
```ts
'new-role': [
  { action: ['view'], subject: 'new-subject' },
  { action: ['create'], subject: ['workorder'] }
]
```

3. **Aplicar `IfCan` nos componentes correspondentes**

## Limitações

1. **Apenas client-side**: Este ACL é apenas visual/UI. Em produção, validações de backend são obrigatórias
2. **Sem validações contextuais**: As regras atuais não consideram contexto (ex: "só pode editar seus próprios itens")
3. **Sem hierarchy**: Não há herança entre papéis (admin não herda permissões de technician)

## Critérios de Aceite Atendidos

✅ Mapa de habilidades implementado com admin/technician/requester  
✅ Hook `useAbility()` disponível e aplicado nas telas principais  
✅ Ações não permitidas não são renderizadas (logo, não são tabuláveis)  
✅ Testes E2E validam visualização/ocultação por papel  
✅ Sem backend: papel vem de localStorage  
✅ Sem regressões visuais: mantido padrão Tailwind/tokens existente  