# Verificação de Migração: TrakSense → Sistema Unificado

## 📊 Status Geral

| Categoria | Total | Migrado | Pendente | Status |
|-----------|-------|---------|----------|--------|
| Páginas | 10 | 3 | 7 | 🟡 30% |
| Componentes Dashboard | 10 | 0 | 10 | 🔴 0% |
| Componentes Charts | 11 | 0 | 11 | 🔴 0% |
| Componentes Alerts | 4 | 1 | 3 | 🟡 25% |
| Hooks | 14 | 0 | 14 | 🔴 0% |
| Stores | 12 | 0 | 12 | 🔴 0% |
| Services | 8 | 0 | 8 | 🔴 0% |

---

## 📄 PÁGINAS

### ✅ Migradas
| Página TrakSense | Página Unificada | Status | Paridade |
|------------------|------------------|--------|----------|
| OverviewPage | MonitorDashboard | ✅ Criada | 🟡 Parcial (sem charts) |
| AlertsPage | AlertsList | ✅ Criada | 🟡 Parcial (sem detalhes) |
| AssetDetailPage | EquipmentRealtime | ✅ Criada | 🟡 Parcial |

### ❌ Não Migradas
| Página TrakSense | Funcionalidade | Prioridade |
|------------------|----------------|------------|
| **EditableOverviewPage** | Dashboard drag-drop com dnd-kit, widgets customizáveis | 🔴 ALTA |
| **SensorsPage** | Grid de dispositivos IoT, status real-time, filtros | 🔴 ALTA |
| **RulesPage** | Configuração de regras de alertas | 🔴 ALTA |
| **AssetsPage** | Lista de ativos com telemetria integrada | 🟡 MÉDIA |
| **ReportsPage** | Relatórios de monitoramento | 🟡 MÉDIA |
| **SettingsPage** | Configurações do módulo Monitor | 🟡 MÉDIA |
| **MaintenancePage** | Manutenções vinculadas ao Monitor | 🟢 BAIXA |

---

## 🎨 COMPONENTES DE DASHBOARD

**Diretório Original:** `traksense-hvac-monit/src/components/dashboard/`

| Componente | Descrição | Dependências | Status |
|------------|-----------|--------------|--------|
| CustomDashboard.tsx | Sistema de dashboard multi-layout | dnd-kit, zustand | ❌ |
| DraggableWidget.tsx | Widget arrastável | @dnd-kit/core | ❌ |
| ResizableWidget.tsx | Widget redimensionável | react-resizable | ❌ |
| LayoutManager.tsx | Gerenciador de layouts salvos | zustand | ❌ |
| WidgetPalette.tsx | Paleta de widgets disponíveis | - | ❌ |
| WidgetConfig.tsx | Configuração de widget | - | ❌ |
| OverviewWidgetPalette.tsx | Paleta específica overview | - | ❌ |
| OverviewWidgetConfig.tsx | Config específica overview | - | ❌ |

**Subpasta widgets/:** Contém widgets individuais (KPIs, gráficos, tabelas)

---

## 📈 COMPONENTES DE CHARTS

**Diretório Original:** `traksense-hvac-monit/src/components/charts/`

| Componente | Biblioteca | Funcionalidade | Status |
|------------|------------|----------------|--------|
| LineChartTemp.tsx | ECharts | Gráfico de linha para temperatura | ❌ |
| BarChartEnergy.tsx | ECharts | Gráfico de barras para energia | ❌ |
| BarChartGeneric.tsx | ECharts | Gráfico de barras genérico | ❌ |
| LineChartGeneric.tsx | ECharts | Gráfico de linha genérico | ❌ |
| GaugeFilterHealth.tsx | ECharts | Gauge de saúde dos filtros | ❌ |
| HeatmapAlarms.tsx | ECharts | Heatmap de alarmes | ❌ |
| TelemetryChart.tsx | ECharts | Gráfico de telemetria real-time | ❌ |
| PieChartGeneric.tsx | ECharts | Gráfico de pizza | ❌ |
| RadialChartGeneric.tsx | ECharts | Gráfico radial | ❌ |
| ScatterPerformance.tsx | ECharts | Gráfico de dispersão | ❌ |
| ChartWrapper.tsx | - | Container wrapper para charts | ❌ |

**Decisão Necessária:** Manter ECharts ou migrar para Recharts (já usado no CMMS)?

---

## 🚨 COMPONENTES DE ALERTAS

**Diretório Original:** `traksense-hvac-monit/src/components/alerts/`

| Componente | Funcionalidade | Status |
|------------|----------------|--------|
| AlertsPage.tsx | Página principal de alertas | ✅ (AlertsList) |
| RuleBuilder.tsx | Builder visual de regras de alerta | ❌ CRÍTICO |
| AddRuleModalMultiParam.tsx | Modal para regra multi-parâmetro | ❌ CRÍTICO |
| AlertDetailsDialog.tsx | Dialog com detalhes do alerta | ❌ |

---

## 📟 COMPONENTES DE DEVICES

**Diretório Original:** `traksense-hvac-monit/src/components/devices/`

| Componente | Funcionalidade | Status |
|------------|----------------|--------|
| DeviceCard.tsx | Card de dispositivo com status, métricas | ❌ |

---

## 🪝 HOOKS

### Hooks de Queries (React Query)
**Diretório:** `traksense-hvac-monit/src/hooks/queries/`

| Hook | Funcionalidade | Status |
|------|----------------|--------|
| useDevicesQuery.ts | Query de dispositivos IoT | ❌ |
| useAssetsQuery.ts | Query de ativos | ❌ |
| useAlertsQuery.ts | Query de alertas | ❌ |
| useRulesQuery.ts | Query de regras | ❌ |
| useSensorsQuery.ts | Query de sensores | ❌ |
| useSitesQuery.ts | Query de sites | ❌ |
| useAlertNotifications.ts | Notificações de alertas | ❌ |

### Hooks de Dados
**Diretório:** `traksense-hvac-monit/src/hooks/`

| Hook | Funcionalidade | Status |
|------|----------------|--------|
| useSensorData.ts | Dados de sensor em real-time | ❌ |
| useSensorHistory.ts | Histórico de sensor | ❌ |
| useMultipleSensorHistory.ts | Histórico múltiplos sensores | ❌ |
| useSensorTrend.ts | Tendência de sensor | ❌ |
| useSiteStats.ts | Estatísticas do site | ❌ |
| useIoTParams.ts | Parâmetros IoT | ❌ |
| useQueryMonitoring.ts | Monitoramento de queries | ❌ |

---

## 🗄️ STORES (Zustand)

**Diretório:** `traksense-hvac-monit/src/store/`

| Store | Estado Gerenciado | Status |
|-------|-------------------|--------|
| alertsStore.ts | Alertas ativos, filtros | ❌ |
| dashboard.ts | Layouts, widgets ativos | ❌ |
| equipment.ts | Equipamentos selecionados | ❌ |
| sensors.ts | Sensores, filtros, seleção | ❌ |
| rulesStore.ts | Regras de alerta | ❌ |
| notifications.ts | Notificações UI | ❌ |
| overview.ts | Estado do overview | ❌ |
| features.ts | Feature flags | ❌ |
| app.ts | Estado global da app | ❌ |
| auth.ts | Autenticação | ⚠️ Usar CMMS |
| team.ts | Equipe | ⚠️ Usar CMMS |
| cta.ts | Call-to-actions | ⚠️ Avaliar |

---

## 🔌 SERVICES (API)

**Diretório:** `traksense-hvac-monit/src/services/`

| Service | Endpoints | Status |
|---------|-----------|--------|
| assetsService.ts | CRUD de ativos | ❌ |
| devicesService.ts | CRUD de dispositivos | ❌ |
| telemetryService.ts | Dados de telemetria | ❌ |
| sitesService.ts | CRUD de sites | ❌ |
| api/alerts.ts | API de alertas | ❌ |
| auth.service.ts | Autenticação | ⚠️ Usar CMMS |
| teamService.ts | Serviço de equipe | ⚠️ Usar CMMS |
| tenantAuthService.ts | Auth multi-tenant | ⚠️ Avaliar |

---

## 📦 DEPENDÊNCIAS ADICIONAIS

Pacotes usados no TrakSense que podem precisar ser instalados:

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "echarts": "^5.x",
  "echarts-for-react": "^3.x",
  "@tanstack/react-query": "^5.x"
}
```

**Nota:** React Query já está no CMMS. Avaliar se manter ECharts ou usar Recharts existente.

---

## 🎯 PLANO DE MIGRAÇÃO RECOMENDADO

### Fase 1: Infraestrutura (1-2 dias)
1. [ ] Migrar hooks de queries (useDevicesQuery, useSensorsQuery, etc.)
2. [ ] Migrar stores essenciais (sensors, alerts, dashboard)
3. [ ] Migrar services de API (telemetry, devices, alerts)

### Fase 2: Páginas Core (2-3 dias)
4. [ ] **SensorsPage** - Grid de dispositivos com DeviceCard
5. [ ] **AssetsPage** - Lista de ativos com telemetria
6. [ ] **RulesPage** - Configuração de regras

### Fase 3: Dashboard Avançado (2-3 dias)
7. [ ] Instalar dnd-kit
8. [ ] Migrar CustomDashboard + DraggableWidget
9. [ ] Migrar widgets individuais
10. [ ] Migrar LayoutManager

### Fase 4: Visualização (1-2 dias)
11. [ ] Decidir: ECharts vs Recharts
12. [ ] Migrar componentes de charts necessários
13. [ ] Integrar charts no dashboard

### Fase 5: Finalização (1 dia)
14. [ ] SettingsPage
15. [ ] ReportsPage
16. [ ] Testes de integração

---

## ✅ CHECKLIST DE VERIFICAÇÃO FINAL

- [ ] Todas as páginas do TrakSense acessíveis em /monitor/*
- [ ] Dashboard customizável funcionando
- [ ] Gráficos exibindo dados reais
- [ ] Alertas com criação de regras
- [ ] Navegação cruzada CMMS ↔ Monitor
- [ ] Dados de telemetria em real-time
- [ ] Persistência de layouts de dashboard
- [ ] Notificações de alertas funcionando

---

*Documento gerado em: $(Get-Date -Format "yyyy-MM-dd HH:mm")*
*Fase atual: Verificação de Paridade*
