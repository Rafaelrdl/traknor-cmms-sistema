# TrakNor CMMS — Instruções Unificadas (Spark + React + Django)

## 0. Escopo e versões

* Frontend: React + TypeScript executando sob **GitHub Spark**.
* Controle de versões é do Spark. **Não** altere major versions (`react`, `react-dom`, `vite`) sem validação explícita no ambiente Spark.
* Tailwind habilitado (container queries). TypeScript/ESLint em modo estrito.

---

## 1. Integração Spark — Regras críticas

### Arquivos protegidos (NUNCA MODIFICAR)

```
src/main.tsx          ❌ integra com runtime do Spark
src/main.css          ❌ estilos estruturais do Spark
index.html            ⚠️ apenas <title> e meta tags
```

### Scripts e Vite

* `package.json` scripts **imutáveis**: `"dev"`, `"build"`, `"preview"`.
* `vite.config.ts`: apenas plugins compatíveis; **não** alterar `base`.
* Frontend roda fixo na **porta 5173**.

### APIs/Hooks Spark permitidos

* Globais: `spark.llm()`, `spark.kv`, `spark.user()`.
* Persistência: **`useKV()`** de `@github/spark/hooks`.
* **Não** importar hooks Spark não documentados além de `useKV()`.

### Assets

* **Sempre** importar explicitamente: `import logo from '@/assets/logo.png'`.
* **Nunca** usar caminhos string estáticos para assets.

---

## 2. Dados e estado — padrão unificado

**Regra de ouro**

* **Persistência de domínio** → **`useKV()`** (sem `localStorage`/`sessionStorage`).
* **Estado efêmero de UI** (filtros, ids em edição, visibilidade de modal) → **Zustand** (sem persistência).

#### Adaptador KV (exemplo)

```ts
// src/data/useWorkOrdersKV.ts
import { useKV } from '@github/spark/hooks'
import type { WorkOrder } from '@/types'

const KEY = 'workOrders:db'
export function useWorkOrdersKV() {
  const [items, setItems] = useKV<WorkOrder[]>(KEY, [])
  const add = (item: WorkOrder) => setItems(prev => ([...(prev ?? []), item]))
  const patch = (id: string, data: Partial<WorkOrder>) =>
    setItems(prev => (prev ?? []).map(x => x.id === id ? { ...x, ...data } : x))
  return { items: items ?? [], setItems, add, patch }
}
```

#### Zustand para UI (exemplo)

```ts
// src/data/uiStore.ts
import { create } from 'zustand'

interface UIState { editId?: string; setEdit: (id?: string) => void }
export const useUIStore = create<UIState>(set => ({
  editId: undefined,
  setEdit: (id) => set({ editId: id })
}))
```

**Sincronização**

* Dados (persistentes) → hooks baseados em `useKV()`.
* UI (efêmero) → Zustand. Não misturar persistência no Zustand.

---

## 3. Arquitetura de componentes

* **Layout-first**: `src/components/Layout.tsx` (navegação por papel).
* **Modais**: Radix Dialog (`WorkOrderEditModal.tsx`, `ProcedureViewModal.tsx`).
* **UI base**: `src/components/ui/` (shadcn/ui).
* **Páginas**: `src/pages/` + rotas **protegidas** em `App.tsx`.
* **Responsivo**: validar com `useIsMobile()`.

---

## 4. ACL

* Abilities em `src/acl/abilities.ts`: `admin | technician | requester`.
* Ações: `view | create | edit | delete | move | convert | manage`.
* Integrar via `<IfCan>` (sem checagens manuais no componente).
* Técnicos podem **converter** solicitações em ordens de serviço.

---

## 5. Dados de exemplo e inicialização

* Mock: `src/data/mockData.ts`.
* Inicialização: `src/data/initializeStores.ts` deve escrever via **hooks KV**.
* OS podem ser auto-geradas a partir de planos quando habilitado.

---

## 6. Ciclo de vida de OS

```ts
// Plan → Generated → Assigned → In Progress → Completed
// Frequências: ver src/data/workOrdersStore.ts (date-fns)
// Transições: WorkOrderEditModal.tsx
```

---

## 7. PDFs

* Config: `src/utils/pdfConfig.ts` (PDF.js worker).
* Dev utils: carregadas em desenvolvimento.
* Build: excluir/adaptar workers conforme configuração do Vite.

---

## 8. Brasil/PMOC

* Planos seguem PMOC.
* Classificação de equipamentos HVAC brasileira.
* Frequências: **Semanal, Mensal, Bimestral, Trimestral**.
* **UI**: datas em **DD/MM/YYYY**; **armazenamento/API**: ISO 8601 com `Z`.

---

## 9. Backend Django — contrato de integração

### Porta e execução

* Executar em `0.0.0.0:3333`. **Não** usar `:8000` para o backend do app.

### CORS e headers

```py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Spark padrão
    'http://localhost:5001',  # Alternativa Spark
    'http://localhost:5000',  # Backup Spark
]
CORS_ALLOW_CREDENTIALS = True
# Incluir/propagar 'x-spark-session' quando aplicável
```

### Formato de resposta (obrigatório)

```py
from rest_framework.response import Response

def api_response(data, success=True, error=None):
    return Response({'success': success, 'data': data, 'error': error})
```

### URLs (sem barra final; manter hífen)

```py
path('api/auth/login', LoginView.as_view()),
path('api/auth/logout', LogoutView.as_view()),
path('api/users', UserListView.as_view()),
path('api/work-orders', WorkOrderListView.as_view()),
```

### IDs e timestamps

* IDs: **UUID** como string.
* Serializers: ISO 8601 com `Z` (`'%Y-%m-%dT%H:%M:%S.%fZ'`).

---

## 10. Ferramentas e padrões

* **Forms**: React Hook Form + Zod.
* **Rotas**: React Router com guards/proteção.
* **Animações**: Framer Motion.
* **Server state**: React Query (planejado).
* **TS/ESLint**: estrito (`eslint.config.js`).
* **Tailwind**: v4 (container queries).
* **Scripts**: usar `npm run` (não chamar CLIs diretamente quando houver script).

---

## 11. Devcontainer/Codespaces

**Requisitos mínimos**

* Node 20, Python 3.12, PostgreSQL 16.
* `forwardPorts`: `5173`, `3333`, `5432` (opcional: `8000` apenas para ferramentas locais, não Django do app).

**Post-start (exemplo)**

```bash
#!/usr/bin/env bash
set -euo pipefail

pkill -f "python manage.py runserver" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node simple-mock-api.js" 2>/dev/null || true

pushd backend_django >/dev/null
python manage.py runserver 0.0.0.0:3333 &
popd >/dev/null

npm run dev &
echo "Spark + Django ativos"
```

---

## 12. Testes

* Unitários: **Vitest** (`src/__tests__/`).
* E2E: **Cypress** por perfil/ACL (script `cy:run-acl`).
* Planos: **`PlansTestingSuite.tsx`**.

---

## 13. Checklist de validação

```bash
# Frontend
curl -s http://localhost:5173 | grep -q "TrakNor" && echo "Frontend OK"

# Backend (saúde)
curl -s http://localhost:3333/api/health | jq -r '.success' | grep -q true && echo "Backend OK"

# Formato de resposta
curl -s http://localhost:3333/api/users | jq -e '.success and .data' && echo "Formato OK"

# CORS
curl -H "Origin: http://localhost:5173" -I http://localhost:3333/api/health | \
  grep -q "Access-Control-Allow-Origin" && echo "CORS OK"
```

---

## 14. Troubleshooting

* **Spark não carrega**: conferir `src/main.tsx`/`src/main.css`, porta `3333` livre, CORS/headers no Django, rebuild do container.
* **Assets falham**: imports explícitos; sem caminhos string; não alterar `vite.base`.
* **Persistência falha**: garantir `useKV` em componente/hook; não misturar com persistência Zustand; usar updates funcionais (`set(prev => ...)`).

---

## 15. Regras de ouro

1. Persistência de domínio → **`useKV()`**; **nunca** `localStorage`/`sessionStorage`.
2. Arquivos/scripts protegidos **intocáveis** (`main.tsx`, `main.css`, `dev/build/preview`).
3. API Django **sempre** `{ success, data, error }`; rotas **sem** barra final; recursos **com hífen**.
4. Frontend **:5173**, backend **:3333** (não usar **:8000** para o app).
5. IDs **UUID** string e datas **ISO 8601** com `Z`.
6. ACL via `<IfCan>`; sem checagens manuais.
7. Testar responsividade e cálculos de data com `date-fns`.
8. Validar compatibilidade Spark após **qualquer** mudança estrutural.
