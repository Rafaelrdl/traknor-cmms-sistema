# 🗺️ Roadmap de Integração API - TrakNor CMMS

## 📊 Estado Atual

### ✅ Implementado
| Domínio | Backend | Frontend Service | React Query Hook |
|---------|---------|------------------|------------------|
| Assets/Equipment | `/api/assets/`, `/api/assets/complete/` | `equipmentService.ts` | `useEquipmentQuery.ts` |
| Devices | `/api/devices/` | `monitor/devicesService.ts` | `monitor/useDevicesQuery.ts` |
| Sensors | `/api/sensors/` | - | - |
| Sites | `/api/sites/` | - | - |
| Auth | `/api/auth/login/`, `/api/auth/refresh/` | `lib/api.ts` (interceptors) | `useAuth.ts` |
| Rules/Alerts | `/api/alerts/rules/` | `monitor/rulesService.ts` | `monitor/useRulesQuery.ts` |
| **Work Orders** | ✅ `/api/cmms/work-orders/` | ✅ `workOrdersService.ts` | ✅ `useWorkOrdersQuery.ts` |
| **Requests** | ✅ `/api/cmms/requests/` | ✅ `requestsService.ts` | ✅ `useRequestsQuery.ts` |
| **Maintenance Plans** | ✅ `/api/cmms/plans/` | ✅ `plansService.ts` | ✅ `usePlansQuery.ts` |
| **Locations** | ✅ `/api/locations/` | ✅ `locationsService.ts` | ✅ `useLocationsQuery.ts` |
| **Inventory** | ✅ `/api/inventory/items/` | ⏳ Pendente | ⏳ Pendente |
| **Checklist Templates** | ✅ `/api/cmms/checklist-templates/` | ⏳ Pendente | ⏳ Pendente |

### ⏳ A Implementar (Frontend)
| Domínio | Backend | Frontend | Prioridade |
|---------|---------|----------|------------|
| Inventory | ✅ Pronto | ❌ Criar Service/Hook | 🟡 Média |
| Procedures | ❌ Criar | ❌ Criar | 🟡 Média |
| Reports/Metrics | ❌ Criar | ❌ Criar | 🟡 Média |
| Help Center | ❌ Criar | ❌ Criar | 🟢 Baixa |

---

## 📁 Fase 1: Base & Tipos (Prioridade Alta)

### 1.1 Alinhar Tipos (`src/types/api.ts` ↔ `src/types/index.ts`)

**Problema:** Existem dois sistemas de tipos - um para API (`api.ts`) e outro para UI (`index.ts`).

**Solução:** Criar mappers e manter ambos sincronizados.

```typescript
// src/types/api.ts - Adicionar tipos faltantes

// Work Order (OS)
export interface ApiWorkOrder {
  id: number;
  number: string;
  asset: number;
  asset_tag: string;
  asset_name: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  scheduled_date: string;
  completed_at: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  execution_description: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  checklist_template: number | null;
  checklist_responses: ApiChecklistResponse[];
  photos: ApiPhoto[];
  stock_items: ApiWorkOrderItem[];
  created_at: string;
  updated_at: string;
}

// Solicitação
export interface ApiRequest {
  id: number;
  number: string;
  location: number;
  location_name: string;
  asset: number | null;
  asset_name: string | null;
  requester: number;
  requester_name: string;
  status: 'NEW' | 'TRIAGING' | 'CONVERTED' | 'REJECTED';
  note: string;
  items: ApiRequestItem[];
  status_history: ApiStatusChange[];
  work_order: number | null; // Se convertido
  created_at: string;
  updated_at: string;
}

// Plano de Manutenção
export interface ApiMaintenancePlan {
  id: number;
  name: string;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  is_active: boolean;
  assets: number[]; // IDs dos ativos
  asset_tags: string[];
  checklist_template: number | null;
  next_execution: string | null;
  last_execution: string | null;
  auto_generate: boolean;
  created_at: string;
  updated_at: string;
}

// Inventory
export interface ApiInventoryItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: number;
  category_name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  unit_cost: number;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiInventoryCategory {
  id: number;
  name: string;
  description: string;
  parent: number | null;
  item_count: number;
}

export interface ApiInventoryMovement {
  id: number;
  item: number;
  item_name: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reference_type: 'WORK_ORDER' | 'PURCHASE' | 'MANUAL' | 'INVENTORY';
  reference_id: number | null;
  notes: string;
  performed_by: number;
  performed_by_name: string;
  created_at: string;
}

// Companies/Locations
export interface ApiCompany {
  id: number;
  name: string;
  segment: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  responsible_name: string;
  responsible_role: string;
  phone: string;
  email: string;
  total_area: number;
  occupants: number;
  hvac_units: number;
  notes: string;
  sector_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiSector {
  id: number;
  name: string;
  company: number;
  company_name: string;
  responsible_name: string;
  phone: string;
  email: string;
  area: number;
  occupants: number;
  hvac_units: number;
  notes: string;
  subsection_count: number;
}

export interface ApiSubsection {
  id: number;
  name: string;
  sector: number;
  sector_name: string;
  responsible_name: string;
  phone: string;
  email: string;
  area: number;
  occupants: number;
  hvac_units: number;
  notes: string;
}
```

---

## 📁 Fase 2: Backend - Criar Apps CMMS

### 2.1 Novo App: `apps/cmms/` (Ordens de Serviço, Solicitações, Planos)

```
apps/cmms/
├── __init__.py
├── admin.py
├── apps.py
├── models.py          # WorkOrder, Request, MaintenancePlan, Checklist
├── serializers.py
├── views.py
├── urls.py
├── signals.py         # Auto-generate WO from plans
├── tasks.py           # Celery tasks for scheduling
└── migrations/
```

**Models Principais:**

```python
# apps/cmms/models.py

class ChecklistTemplate(models.Model):
    """Template de checklist reutilizável"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    items = models.JSONField(default=list)  # [{question, type, required, options}]
    is_active = models.BooleanField(default=True)

class WorkOrder(models.Model):
    """Ordem de Serviço"""
    TYPES = [('PREVENTIVE', 'Preventiva'), ('CORRECTIVE', 'Corretiva'), ('EMERGENCY', 'Emergência')]
    STATUSES = [('OPEN', 'Aberta'), ('IN_PROGRESS', 'Em Andamento'), ('COMPLETED', 'Concluída'), ('CANCELLED', 'Cancelada')]
    PRIORITIES = [('LOW', 'Baixa'), ('MEDIUM', 'Média'), ('HIGH', 'Alta'), ('CRITICAL', 'Crítica')]
    
    number = models.CharField(max_length=20, unique=True)
    asset = models.ForeignKey('assets.Asset', on_delete=models.PROTECT)
    type = models.CharField(max_length=20, choices=TYPES)
    status = models.CharField(max_length=20, choices=STATUSES, default='OPEN')
    priority = models.CharField(max_length=20, choices=PRIORITIES, default='MEDIUM')
    description = models.TextField()
    scheduled_date = models.DateField()
    completed_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    execution_description = models.TextField(blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    checklist_template = models.ForeignKey(ChecklistTemplate, on_delete=models.SET_NULL, null=True)
    checklist_responses = models.JSONField(default=dict)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_work_orders')
    
class WorkOrderPhoto(models.Model):
    """Fotos anexadas à OS"""
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='photos')
    file = models.FileField(upload_to='work_orders/photos/')
    caption = models.CharField(max_length=200, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class WorkOrderItem(models.Model):
    """Itens de estoque usados na OS"""
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='items')
    inventory_item = models.ForeignKey('inventory.InventoryItem', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
class Request(models.Model):
    """Solicitação de manutenção"""
    STATUSES = [('NEW', 'Nova'), ('TRIAGING', 'Em Triagem'), ('CONVERTED', 'Convertida'), ('REJECTED', 'Rejeitada')]
    
    number = models.CharField(max_length=20, unique=True)
    location = models.ForeignKey('locations.Location', on_delete=models.PROTECT)
    asset = models.ForeignKey('assets.Asset', on_delete=models.SET_NULL, null=True, blank=True)
    requester = models.ForeignKey(User, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUSES, default='NEW')
    note = models.TextField()
    work_order = models.OneToOneField(WorkOrder, on_delete=models.SET_NULL, null=True, blank=True)
    
class MaintenancePlan(models.Model):
    """Plano de manutenção preventiva"""
    FREQUENCIES = [
        ('DAILY', 'Diária'), ('WEEKLY', 'Semanal'), ('BIWEEKLY', 'Quinzenal'),
        ('MONTHLY', 'Mensal'), ('QUARTERLY', 'Trimestral'),
        ('SEMI_ANNUAL', 'Semestral'), ('ANNUAL', 'Anual')
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCIES)
    is_active = models.BooleanField(default=True)
    assets = models.ManyToManyField('assets.Asset', related_name='maintenance_plans')
    checklist_template = models.ForeignKey(ChecklistTemplate, on_delete=models.SET_NULL, null=True)
    next_execution = models.DateField(null=True, blank=True)
    last_execution = models.DateField(null=True, blank=True)
    auto_generate = models.BooleanField(default=True)
```

### 2.2 Novo App: `apps/inventory/`

```python
# apps/inventory/models.py

class InventoryCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

class InventoryItem(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(InventoryCategory, on_delete=models.PROTECT)
    unit = models.CharField(max_length=20)  # UN, KG, L, M
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

class InventoryMovement(models.Model):
    TYPES = [('IN', 'Entrada'), ('OUT', 'Saída'), ('ADJUSTMENT', 'Ajuste'), ('TRANSFER', 'Transferência')]
    REFERENCES = [('WORK_ORDER', 'Ordem de Serviço'), ('PURCHASE', 'Compra'), ('MANUAL', 'Manual'), ('INVENTORY', 'Inventário')]
    
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    movement_type = models.CharField(max_length=20, choices=TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reference_type = models.CharField(max_length=20, choices=REFERENCES, null=True)
    reference_id = models.IntegerField(null=True)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(User, on_delete=models.PROTECT)
```

### 2.3 Novo App: `apps/locations/` (Empresas, Setores, Subsetores)

```python
# apps/locations/models.py

class Company(models.Model):
    """Empresa/Cliente"""
    name = models.CharField(max_length=200)
    segment = models.CharField(max_length=100, blank=True)
    cnpj = models.CharField(max_length=18, unique=True)
    # ... campos de endereço, responsável, contato

class Sector(models.Model):
    """Setor dentro de uma empresa"""
    name = models.CharField(max_length=200)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='sectors')
    # ... campos

class Subsection(models.Model):
    """Subsetor dentro de um setor"""
    name = models.CharField(max_length=200)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, related_name='subsections')
    # ... campos
```

---

## 📁 Fase 3: Frontend Services & Hooks

### 3.1 Estrutura de Arquivos

```
src/services/
├── equipmentService.ts     ✅ Existe
├── workOrdersService.ts    ❌ Criar
├── requestsService.ts      ❌ Criar
├── plansService.ts         ❌ Criar
├── inventoryService.ts     ❌ Criar
├── locationsService.ts     ❌ Criar
├── proceduresService.ts    ❌ Criar
├── metricsService.ts       ❌ Criar
├── reportsService.ts       ❌ Criar
└── helpCenterService.ts    ❌ Criar

src/hooks/
├── useEquipmentQuery.ts    ✅ Existe
├── useWorkOrdersQuery.ts   ❌ Criar
├── useRequestsQuery.ts     ❌ Criar
├── usePlansQuery.ts        ❌ Criar
├── useInventoryQuery.ts    ❌ Criar
├── useLocationsQuery.ts    ❌ Criar
├── useProceduresQuery.ts   ❌ Criar
├── useMetricsQuery.ts      ❌ Criar
└── useHelpCenterQuery.ts   ❌ Criar
```

### 3.2 Template: Work Orders Service

```typescript
// src/services/workOrdersService.ts

import { api } from '@/lib/api';
import type { WorkOrder } from '@/types';
import type { ApiWorkOrder, PaginatedResponse } from '@/types/api';

export interface WorkOrderFilters {
  status?: string[];
  type?: string[];
  priority?: string[];
  asset?: string;
  assigned_to?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Mapper: API → Frontend
const mapWorkOrder = (api: ApiWorkOrder): WorkOrder => ({
  id: String(api.id),
  number: api.number,
  equipmentId: String(api.asset),
  type: api.type,
  status: api.status,
  priority: api.priority,
  description: api.description,
  scheduledDate: api.scheduled_date,
  completedAt: api.completed_at || undefined,
  assignedTo: api.assigned_to_name || undefined,
  executionDescription: api.execution_description || undefined,
  photos: api.photos.map(p => ({
    id: String(p.id),
    url: p.file,
    name: p.caption || 'Foto',
    uploadedAt: p.created_at,
  })),
  checklistResponses: api.checklist_responses,
  stockItems: api.stock_items.map(i => ({
    id: String(i.id),
    workOrderId: String(api.id),
    stockItemId: String(i.item),
    quantity: i.quantity,
  })),
});

export const workOrdersService = {
  async getAll(filters?: WorkOrderFilters): Promise<WorkOrder[]> {
    const response = await api.get<PaginatedResponse<ApiWorkOrder>>('/cmms/work-orders/', { params: filters });
    return response.data.results.map(mapWorkOrder);
  },

  async getById(id: string): Promise<WorkOrder> {
    const response = await api.get<ApiWorkOrder>(`/cmms/work-orders/${id}/`);
    return mapWorkOrder(response.data);
  },

  async create(data: Partial<WorkOrder>): Promise<WorkOrder> {
    const payload = {
      asset: Number(data.equipmentId),
      type: data.type,
      priority: data.priority,
      description: data.description,
      scheduled_date: data.scheduledDate,
    };
    const response = await api.post<ApiWorkOrder>('/cmms/work-orders/', payload);
    return mapWorkOrder(response.data);
  },

  async update(id: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
    const response = await api.patch<ApiWorkOrder>(`/cmms/work-orders/${id}/`, data);
    return mapWorkOrder(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/cmms/work-orders/${id}/`);
  },

  // Ações específicas
  async start(id: string): Promise<WorkOrder> {
    const response = await api.post<ApiWorkOrder>(`/cmms/work-orders/${id}/start/`);
    return mapWorkOrder(response.data);
  },

  async complete(id: string, data: { execution_description: string; actual_hours: number }): Promise<WorkOrder> {
    const response = await api.post<ApiWorkOrder>(`/cmms/work-orders/${id}/complete/`, data);
    return mapWorkOrder(response.data);
  },

  async cancel(id: string, reason: string): Promise<WorkOrder> {
    const response = await api.post<ApiWorkOrder>(`/cmms/work-orders/${id}/cancel/`, { reason });
    return mapWorkOrder(response.data);
  },

  async uploadPhoto(id: string, file: File, caption?: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    await api.post(`/cmms/work-orders/${id}/photos/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

### 3.3 Template: Work Orders Hook

```typescript
// src/hooks/useWorkOrdersQuery.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersService, type WorkOrderFilters } from '@/services/workOrdersService';
import type { WorkOrder } from '@/types';

export const workOrderKeys = {
  all: ['workOrders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (filters?: WorkOrderFilters) => [...workOrderKeys.lists(), filters] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
  stats: () => [...workOrderKeys.all, 'stats'] as const,
};

export function useWorkOrders(filters?: WorkOrderFilters) {
  return useQuery({
    queryKey: workOrderKeys.list(filters),
    queryFn: () => workOrdersService.getAll(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useWorkOrder(id: string | null | undefined) {
  return useQuery({
    queryKey: workOrderKeys.detail(id!),
    queryFn: () => workOrdersService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkOrder>) => workOrdersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrder> }) => 
      workOrdersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useStartWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workOrdersService.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

export function useCompleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { execution_description: string; actual_hours: number } }) => 
      workOrdersService.complete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
    },
  });
}
```

---

## 📁 Fase 4: Integração por Página

### 4.1 Prioridade 1: Operação (Alta)

| Página | Hooks a Usar | Substituir |
|--------|--------------|------------|
| `Dashboard.tsx` | `useWorkOrders`, `useEquipments`, `useMetrics` | `useDataTemp` |
| `WorkOrdersPage.tsx` | `useWorkOrders`, `useCreateWorkOrder`, `useUpdateWorkOrder` | `useWorkOrders` local |
| `RequestsPage.tsx` | `useRequests`, `useCreateRequest`, `useConvertToWorkOrder` | `useDataTemp` |
| `EquipmentPage.tsx` | `useEquipments`, `useLocations` | `useDataTemp` |
| `AssetDetailPage.tsx` | `useEquipment`, `useWorkOrders({ asset: id })` | Fetch manual |

### 4.2 Prioridade 2: Planejamento (Média)

| Página | Hooks a Usar | Substituir |
|--------|--------------|------------|
| `PlansPage.tsx` | `usePlans`, `useCreatePlan`, `useGenerateWorkOrders` | `useMaintenancePlans` |
| `MetricsPage.tsx` | `useMetrics`, `useEquipmentStats` | `useMetrics` local |
| `InventoryPage.tsx` | `useInventory`, `useInventoryCategories`, `useMovements` | `inventoryStore` |
| `ReportsPage.tsx` | `useGenerateReport`, `useReportPreview` | Fetch manual |

### 4.3 Prioridade 3: Conhecimento (Baixa)

| Página | Hooks a Usar | Substituir |
|--------|--------------|------------|
| `ProceduresPage.tsx` | `useProcedures`, `useProcedureCategories` | `proceduresStore` |
| `ProfilePage.tsx` | `useCurrentUser`, `useUpdateProfile` | `useAuth` |
| `TeamPage.tsx` | `useTeamMembers`, `useInvites` | Fetch manual |
| `HelpCenterPage.tsx` | `useHelpCategories`, `useHelpContent` | `useHelpCenter` |

---

## 📁 Fase 5: Endpoints Backend Necessários

### CMMS App (`/api/cmms/`)

```
GET    /api/cmms/work-orders/                 # Lista com filtros
POST   /api/cmms/work-orders/                 # Criar
GET    /api/cmms/work-orders/{id}/            # Detalhes
PATCH  /api/cmms/work-orders/{id}/            # Atualizar
DELETE /api/cmms/work-orders/{id}/            # Deletar
POST   /api/cmms/work-orders/{id}/start/      # Iniciar
POST   /api/cmms/work-orders/{id}/complete/   # Concluir
POST   /api/cmms/work-orders/{id}/cancel/     # Cancelar
POST   /api/cmms/work-orders/{id}/photos/     # Upload foto

GET    /api/cmms/requests/                    # Lista
POST   /api/cmms/requests/                    # Criar
PATCH  /api/cmms/requests/{id}/               # Atualizar status
POST   /api/cmms/requests/{id}/convert/       # Converter para OS

GET    /api/cmms/plans/                       # Lista
POST   /api/cmms/plans/                       # Criar
PATCH  /api/cmms/plans/{id}/                  # Atualizar
POST   /api/cmms/plans/{id}/generate/         # Gerar OS

GET    /api/cmms/checklists/                  # Templates de checklist
```

### Inventory App (`/api/inventory/`)

```
GET    /api/inventory/categories/             # Categorias
GET    /api/inventory/items/                  # Itens com filtros
POST   /api/inventory/items/                  # Criar item
PATCH  /api/inventory/items/{id}/             # Atualizar
GET    /api/inventory/movements/              # Histórico
POST   /api/inventory/movements/              # Registrar movimento
```

### Locations App (`/api/locations/`)

```
GET    /api/locations/companies/              # Empresas
POST   /api/locations/companies/              # Criar
GET    /api/locations/sectors/                # Setores
GET    /api/locations/subsections/            # Subsetores
GET    /api/locations/tree/                   # Árvore completa
```

### Metrics & Reports (`/api/reports/`)

```
GET    /api/reports/metrics/?range=30d        # KPIs
GET    /api/reports/metrics/mttr/             # MTTR por período
GET    /api/reports/metrics/backlog/          # Backlog trend
POST   /api/reports/pmoc/generate/            # Gerar PDF PMOC
GET    /api/reports/pmoc/{id}/preview/        # Preview JSON
GET    /api/reports/pmoc/{id}/download/       # Download PDF
```

---

## 🎯 Próximos Passos Imediatos

### Semana 1: Base
1. ✅ Alinhar tipos em `src/types/api.ts`
2. [ ] Criar app `apps/cmms/` no backend com models básicos
3. [ ] Criar `workOrdersService.ts` e `useWorkOrdersQuery.ts`
4. [ ] Integrar `WorkOrdersPage.tsx` com API real

### Semana 2: Solicitações e Planos
1. [ ] Adicionar models Request e MaintenancePlan ao `apps/cmms/`
2. [ ] Criar services e hooks correspondentes
3. [ ] Integrar `RequestsPage.tsx` e `PlansPage.tsx`

### Semana 3: Estoque e Locais
1. [ ] Criar app `apps/inventory/`
2. [ ] Criar app `apps/locations/`
3. [ ] Integrar `InventoryPage.tsx` e `LocationTree`

### Semana 4: Métricas e Relatórios
1. [ ] Criar endpoints de métricas agregadas
2. [ ] Implementar geração de PDF PMOC
3. [ ] Integrar `MetricsPage.tsx` e `ReportsPage.tsx`

---

## 📝 Checklist de Migração por Página

### Para cada página:
- [ ] Identificar dados mockados (useDataTemp, stores)
- [ ] Criar/usar service com mappers
- [ ] Criar/usar hooks React Query
- [ ] Substituir useState por hooks
- [ ] Testar loading states
- [ ] Testar error handling
- [ ] Remover imports de mock
