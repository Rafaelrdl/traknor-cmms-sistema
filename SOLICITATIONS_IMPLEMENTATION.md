# Implementação da Tela Solicitações - Issue #16

## ✅ Tarefas Completadas

### 1. Remoção do subtítulo redundante
- ✅ Removido subtítulo "Solicitações de manutenção dos usuários" da PageHeader
- ✅ Mantido apenas o título principal "Solicitações"

### 2. DataGrid com colunas mínimas
- ✅ Implementada tabela responsiva com as 3 colunas obrigatórias:
  - Localização/Equipamento (concatenado)
  - Usuário Solicitante
  - Observação
- ✅ Colunas adicionais: Status e Data
- ✅ Cabeçalhos com `<th scope="col">` para acessibilidade
- ✅ Texto truncado com tooltip (title attribute) para campos longos
- ✅ Clique na linha abre Drawer de detalhes

### 3. Fluxo de status sem backend
- ✅ Estados implementados: Nova → Em triagem → Convertida em OS
- ✅ Regras de transição respeitadas (não permite pulos)
- ✅ Status e status_history armazenados com timestamps
- ✅ Ações condicionais:
  - "Iniciar triagem" (habilitado quando status === 'Nova')
  - "Converter em OS" (habilitado quando status === 'Em triagem')
- ✅ Validações para conversão implementadas

### 4. Drawer de detalhes
- ✅ Abre ao clicar em linha do grid
- ✅ Conteúdo completo:
  - Cabeçalho com identificador SOL-XXXXXX e status
  - Campos somente leitura: Localização, Equipamento, Usuário, Observação
  - Seção Itens de Estoque com ações de Adicionar/Remover
  - Ações de status e botão Fechar
- ✅ Acessibilidade:
  - Foco inicial no título ao abrir
  - aria-labelledby/aria-describedby corretos
  - Fechamento por ESC
  - Trap de foco implementado

### 5. Adicionar Itens de Estoque
- ✅ Interface para adicionar SolicitationItem
- ✅ Seleção de stock_item e quantidade
- ✅ Persistência na estrutura da Solicitation
- ✅ Evita duplicatas (soma quantidades do mesmo item)
- ✅ Validações de entrada

### 6. Conversão em OS
- ✅ Criação de WorkOrder no mock/localStorage
- ✅ Mapeamento correto de propriedades:
  - id, origin: 'solicitation', origin_solicitation_id
  - location_id, equipment_id, requester_user_id
  - items mapeados de SolicitationItem para WorkOrderItem
  - status inicial 'OPEN', tipo 'CORRECTIVE'
- ✅ Atualização da Solicitation para status 'Convertida em OS'
- ✅ Toast de sucesso com ação para ver OS

### 7. Persistência (mocks/localStorage)
- ✅ Dados vêm de mockData.ts (seed inicial)
- ✅ Sincronização com localStorage para persistência
- ✅ Carregamento preferencial do localStorage
- ✅ Funções puras implementadas:
  - loadSolicitations(), saveSolicitations()
  - advanceStatus(), addItem(), convertToWorkOrder()

### 8. Testes unitários
- ✅ Testes para RequestsPage com React Testing Library
- ✅ Testes para SolicitationsDrawer
- ✅ Testes para funções utilitárias (status transitions, item management)
- ✅ Cobertura de acessibilidade:
  - Grid com role="grid" e cabeçalhos corretos
  - Drawer com foco e aria-labels
  - Navegação por teclado

## 📊 Tipos/Interfaces TypeScript

### Criados em `/src/types/index.ts`:
```typescript
export type SolicitationStatus = 'Nova' | 'Em triagem' | 'Convertida em OS';

export interface SolicitationItem {
  id: string;
  stock_item_id: string;
  stock_item_name: string;
  unit?: string;
  qty: number;
}

export interface SolicitationStatusHistory {
  from?: SolicitationStatus;
  to: SolicitationStatus;
  at: string;
}

export interface Solicitation {
  id: string;
  location_id: string;
  location_name: string;
  equipment_id: string;
  equipment_name: string;
  requester_user_id: string;
  requester_user_name: string;
  note?: string;
  status: SolicitationStatus;
  status_history: SolicitationStatusHistory[];
  items: SolicitationItem[];
  created_at: string;
  updated_at: string;
}
```

## 🗂️ Estrutura de Arquivos

### Novos arquivos criados:
- `/src/components/SolicitationsDrawer.tsx` - Componente drawer para detalhes
- `/src/components/__tests__/RequestsPage.test.tsx` - Testes da página principal
- `/src/components/__tests__/SolicitationsDrawer.test.tsx` - Testes do drawer
- `/src/components/__tests__/SolicitationUtils.test.tsx` - Testes das funções utilitárias

### Arquivos modificados:
- `/src/pages/RequestsPage.tsx` - Implementação completa da página
- `/src/types/index.ts` - Tipos adicionados
- `/src/data/mockData.ts` - Mock data para solicitations
- `/src/hooks/useDataTemp.ts` - Hook e funções utilitárias
- `/src/components/StatusBadge.tsx` - Suporte aos novos status

## 📋 Dados de Exemplo (Seed)

### Mockdata implementado:
- ✅ 5 Solicitações com diferentes status
- ✅ Histórico de transições
- ✅ Itens de estoque associados
- ✅ Dados realistas (CNPJ, localizações, equipamentos HVAC)

## 🎨 UI/UX

### Características implementadas:
- ✅ Seguir tema e tokens existentes
- ✅ Botões com rótulos claros em pt-BR
- ✅ Tooltip para observações longas
- ✅ Estados vazios com mensagem amigável
- ✅ Cards de estatísticas na parte superior
- ✅ Loading states e feedback visual

## ♿ Acessibilidade

### Funcionalidades implementadas:
- ✅ Grid com role="grid" e scope="col" nos cabeçalhos
- ✅ Drawer com foco no título ao abrir
- ✅ aria-labelledby vinculado ao título
- ✅ Fechamento com ESC
- ✅ Botões com aria-label quando necessário
- ✅ Contraste conforme padrão do projeto
- ✅ Navegação por teclado completa

## 🎯 Mensagens (pt-BR)

### Toasts implementados:
- ✅ Sucesso de triagem: "Solicitação movida para triagem."
- ✅ Sucesso de conversão: "Solicitação convertida em OS."
- ✅ Erro de fluxo: "Transição de status inválida."
- ✅ Item: "Item adicionado." / "Item removido."

## ✅ Critérios de Aceite Atendidos

- [x] Subtítulo removido na página de Solicitações
- [x] Grid exibe exatamente 3 colunas principais + status e data
- [x] Drawer abre ao clicar na linha; foco vai ao título; acessível via teclado
- [x] Fluxo de status respeita Nova → Em triagem → Convertida em OS
- [x] Conversão gera objeto WorkOrder e marca Solicitação como convertida
- [x] Adicionar/remover SolicitationItem; mesmo item soma qty
- [x] Testes unitários cobrindo transições, conversão, itens e a11y
- [x] Nenhuma nova dependência adicionada; componentes reutilizados

## 🚀 Como Testar

1. Navegue para a página "Solicitações"
2. Veja as estatísticas no topo
3. Clique em qualquer linha da tabela para abrir o drawer
4. Teste o fluxo de status: Nova → Em triagem → Convertida em OS
5. Adicione/remova itens de estoque
6. Teste a navegação por teclado (Tab, Enter, ESC)
7. Verifique a persistência recarregando a página

## 📝 Commits Sugeridos (Implementado como um único commit)

```
feat(requests): implement complete solicitations management system

- Add grid with 3 main columns (Location/Equipment, User, Note)
- Implement status workflow: Nova → Em triagem → Convertida em OS  
- Add detailed drawer with accessibility features (focus, ARIA, keyboard nav)
- Implement stock item management (add/remove with quantity sum)
- Add conversion to Work Order functionality
- Include localStorage persistence and mock data
- Add comprehensive unit tests for components and utilities
- Support pt-BR localization with proper toast messages
- Ensure WCAG AA compliance with proper table roles and labels
```

## 🔧 Dependências

Nenhuma nova dependência foi adicionada. O sistema reutiliza:
- Componentes shadcn/ui existentes
- React Hook Form patterns existentes  
- Mantine components patterns
- Vitest + Testing Library
- localStorage para persistência leve