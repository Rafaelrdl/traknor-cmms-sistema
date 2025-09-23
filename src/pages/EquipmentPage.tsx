import { useState, useMemo, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { LocationTree } from '@/components/LocationTree';
import { LocationDetails } from '@/components/LocationDetails';
import { LocationFormModal } from '@/components/LocationFormModal';
import { EquipmentSearch } from '@/components/EquipmentSearch';
import { EquipmentStatusTracking } from '@/components/EquipmentStatusTracking';
import { AssetUtilizationDashboard } from '@/components/AssetUtilizationDashboard';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, MapPin, Users, Search, BarChart3, Activity } from 'lucide-react';
import { useEquipment, useSectors, useSubSections, useCompanies } from '@/hooks/useDataTemp';
import { LocationProvider, useLocation as useLocationContext } from '@/contexts/LocationContext';
import { IfCan } from '@/components/auth/IfCan';
import { useRoleBasedData, DataFilterInfo } from '@/components/data/FilteredDataProvider';
import { useAbility } from '@/hooks/useAbility';
import type { Equipment, SubSection } from '@/types';

/**
 * PÁGINA DE GESTÃO DE ATIVOS
 * 
 * Esta é a página principal para gestão de ativos/equipamentos do sistema.
 * Combina todos os componentes relacionados a locais (empresas, setores, subsetores)
 * com funcionalidades de busca, análise e criação de equipamentos.
 * 
 * Funcionalidades principais:
 * - Menu hierárquico de locais (LocationTree)
 * - Busca e listagem de equipamentos
 * - Dashboard de análises de utilização
 * - Criação e edição de locais e equipamentos
 * - Controle de acesso baseado em permissões
 */

/**
 * COMPONENTE PRINCIPAL DO CONTEÚDO DE ATIVOS
 * 
 * Este componente contém toda a lógica e interface da página de ativos.
 * Deve ser envolvido pelo LocationProvider para ter acesso ao contexto de locais.
 */
function AssetsContent() {
  // ========== HOOKS PARA DADOS ==========
  // Obtém dados dos equipamentos e permite modificações
  const [equipment, setEquipment] = useEquipment();
  // Obtém dados estáticos de setores, subsetores e empresas
  const [sectors] = useSectors();
  const [subSections] = useSubSections();
  const [companies] = useCompanies();
  
  // ========== CONTEXTO E PERMISSÕES ==========
  // Obtém o nó/local selecionado na árvore de locais
  const { selectedNode } = useLocationContext();
  // Obtém informações sobre as permissões do usuário atual
  const { role } = useAbility();
  
  // ========== FILTROS BASEADOS EM PERMISSÕES ==========
  // Memoiza as opções de filtro para evitar re-renderizações desnecessárias
  const filterOptions = useMemo(() => ({
    includeInactive: role === 'admin' // Apenas admin pode ver ativos inativos
  }), [role]);

  // Aplica filtros baseados na função do usuário aos dados de equipamentos
  const { data: filteredEquipmentData, stats: equipmentFilterStats } = useRoleBasedData(
    equipment || [], 
    'asset',
    filterOptions
  );
  
  // ========== ESTADOS DO COMPONENTE ==========
  // Controla a abertura do modal de criação/edição de equipamento
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  // Controla a abertura do modal de locais (empresa/setor/subsetor)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  // Define se o modal de local está em modo criar ou editar
  const [locationModalMode, setLocationModalMode] = useState<'create' | 'edit'>('create');
  // Define o tipo de local sendo criado/editado (empresa, setor ou subsetor)
  const [locationModalType, setLocationModalType] = useState<'company' | 'sector' | 'subsection'>('company');
  // Controla qual aba está ativa (buscar, análises ou locais)
  const [activeTab, setActiveTab] = useState('search');
  // Lista de equipamentos filtrados para exibição
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>(filteredEquipmentData);
  // Equipamento selecionado para rastreamento de status
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  // Controla a abertura do modal de rastreamento de status
  const [isStatusTrackingOpen, setIsStatusTrackingOpen] = useState(false);

  // ========== EFEITO PARA ATUALIZAR EQUIPAMENTOS FILTRADOS ==========
  // Atualiza os equipamentos filtrados quando os dados baseados em função mudam
  useEffect(() => {
    setFilteredEquipment(filteredEquipmentData);
  }, [filteredEquipmentData]);

  // ========== ESTADO DO FORMULÁRIO DE NOVO EQUIPAMENTO ==========
  // Estado para armazenar os dados do formulário de criação de equipamento
  const [newEquipment, setNewEquipment] = useState({
    tag: '',           // Identificação única do equipamento (ex: AC-001)
    model: '',         // Modelo do equipamento
    brand: '',         // Marca do equipamento
    type: 'SPLIT' as Equipment['type'], // Tipo do equipamento (SPLIT, CENTRAL, VRF, CHILLER)
    capacity: '',      // Capacidade em BTUs
    sectorId: '',      // ID do setor onde o equipamento está localizado
    subSectionId: '',  // ID do subsetor (opcional)
    installDate: '',   // Data de instalação
    nextMaintenance: '', // Data da próxima manutenção
    serialNumber: '',  // Número de série
    warrantyExpiry: '', // Data de expiração da garantia
    location: '',      // Localização específica (ex: Sala 101, Teto - Posição A)
    notes: ''          // Observações adicionais
  });

  // ========== FUNÇÕES DE MANIPULAÇÃO ==========
  
  /**
   * ADICIONAR NOVO EQUIPAMENTO
   * 
   * Cria um novo equipamento com base nos dados do formulário.
   * Auto-vincula o equipamento ao local selecionado na árvore quando possível.
   */
  const handleAddEquipment = () => {
    const equipment_data: Equipment = {
      id: Date.now().toString(), // ID único baseado no timestamp
      ...newEquipment,
      capacity: parseInt(newEquipment.capacity), // Converte capacidade para número
      status: 'FUNCTIONING', // Status inicial como "funcionando"
      totalOperatingHours: 0, // Horas de operação inicial
      energyConsumption: Math.floor(Math.random() * 200) + 150, // Consumo de energia mockado
      // Auto-vinculação ao local selecionado na árvore
      sectorId: selectedNode?.type === 'sector' ? selectedNode.id : 
                selectedNode?.type === 'subsection' ? (selectedNode.data as SubSection).sectorId :
                newEquipment.sectorId,
      subSectionId: selectedNode?.type === 'subsection' ? selectedNode.id : newEquipment.subSectionId
    };
    
    // Adiciona o novo equipamento à lista existente
    setEquipment((current) => [...(current || []), equipment_data]);
    
    // Reset do formulário para valores iniciais
    setNewEquipment({
      tag: '',
      model: '',
      brand: '',
      type: 'SPLIT',
      capacity: '',
      sectorId: '',
      subSectionId: '',
      installDate: '',
      nextMaintenance: '',
      serialNumber: '',
      warrantyExpiry: '',
      location: '',
      notes: ''
    });
    
    // Fecha o modal de criação
    setIsEquipmentDialogOpen(false);
  };

  /**
   * CRIAR NOVO LOCAL
   * 
   * Abre o modal para criação de um novo local (empresa, setor ou subsetor).
   * 
   * @param type - Tipo de local a ser criado
   */
  const handleCreateLocation = (type: 'company' | 'sector' | 'subsection') => {
    setLocationModalType(type);
    setLocationModalMode('create');
    setIsLocationModalOpen(true);
  };

  /**
   * EDITAR LOCAL SELECIONADO
   * 
   * Abre o modal para edição do local atualmente selecionado na árvore.
   * Só funciona se há um local selecionado.
   */
  const handleEditLocation = () => {
    if (!selectedNode) return;
    setLocationModalType(selectedNode.type);
    setLocationModalMode('edit');
    setIsLocationModalOpen(true);
  };

  /**
   * CRIAR NOVO ATIVO
   * 
   * Abre o modal para criação de um novo equipamento/ativo.
   */
  const handleCreateAsset = () => {
    setIsEquipmentDialogOpen(true);
  };

  /**
   * SELECIONAR EQUIPAMENTO PARA RASTREAMENTO
   * 
   * Define o equipamento selecionado e abre o modal de rastreamento de status.
   * 
   * @param selectedEquipment - Equipamento selecionado
   */
  const handleEquipmentSelect = (selectedEquipment: Equipment) => {
    setSelectedEquipment(selectedEquipment);
    setIsStatusTrackingOpen(true);
  };

  /**
   * ATUALIZAR RESULTADOS FILTRADOS
   * 
   * Callback chamado quando os filtros de busca são aplicados.
   * Atualiza a lista de equipamentos exibidos.
   * 
   * @param filtered - Lista de equipamentos filtrados
   */
  const handleFilteredResults = (filtered: Equipment[]) => {
    setFilteredEquipment(filtered);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)]">
      {/* ========== BARRA LATERAL - ÁRVORE DE LOCAIS ========== */}
      {/* Oculta no mobile, visível no desktop */}
      <div className="hidden lg:flex w-80 border-r bg-card">
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Locais</h3>
          </div>
          {/* Componente da árvore hierárquica de locais */}
          <LocationTree />
        </div>
      </div>
      
      {/* ========== CONTEÚDO PRINCIPAL ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ========== CABEÇALHO COM BOTÕES DE AÇÃO ========== */}
        <div className="p-4 lg:p-6 border-b bg-background">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl lg:text-2xl font-bold">Gestão de Ativos</h1>
            
            {/* Informações sobre filtros de dados aplicados */}
            {equipmentFilterStats.filtered > 0 && (
              <DataFilterInfo
                filterStats={equipmentFilterStats}
                dataType="asset"
                canViewAll={role === 'admin'}
                className="lg:max-w-md"
              />
            )}
            
            {/* Árvore de locais no mobile (componente colapsável) */}
            <div className="lg:hidden">
              <LocationTree />
            </div>
            
            {/* Botões para criar novos locais - com controle de permissões */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Botão para criar empresa - apenas usuários com permissão */}
              <IfCan action="create" subject="asset">
                <Button 
                  onClick={() => handleCreateLocation('company')}
                  className="flex items-center gap-2 text-sm"
                  size="sm"
                  data-testid="company-create"
                >
                  <Building2 className="h-4 w-4" />
                  + Empresa
                </Button>
              </IfCan>
              
              {/* Botão para criar setor - desabilitado se não há empresas */}
              <IfCan action="create" subject="asset">
                <Button 
                  onClick={() => handleCreateLocation('sector')}
                  disabled={companies.length === 0}
                  variant="outline"
                  className="flex items-center gap-2 text-sm"
                  size="sm"
                  data-testid="sector-create"
                >
                  <MapPin className="h-4 w-4" />
                  + Setor
                </Button>
              </IfCan>
              
              {/* Botão para criar subsetor - desabilitado se não há setores */}
              <IfCan action="create" subject="asset">
                <Button 
                  onClick={() => handleCreateLocation('subsection')}
                  disabled={sectors.length === 0}
                  variant="outline"
                  className="flex items-center gap-2 text-sm"
                  size="sm"
                  data-testid="subsection-create"
                >
                  <Users className="h-4 w-4" />
                  + Subsetor
                </Button>
              </IfCan>
            </div>
          </div>
        </div>

        {/* ========== SISTEMA DE ABAS PARA GESTÃO DE EQUIPAMENTOS ========== */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Navegação das abas */}
            <div className="border-b bg-background px-4 lg:px-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                {/* Aba de busca de equipamentos */}
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </TabsTrigger>
                {/* Aba de análises e dashboards */}
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Análises
                </TabsTrigger>
                {/* Aba de detalhes dos locais */}
                <TabsTrigger value="locations" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Locais
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Conteúdo das abas */}
            <div className="flex-1 overflow-auto">
              {/* ABA DE BUSCA - Componente para buscar e filtrar equipamentos */}
              <TabsContent value="search" className="h-full p-4 lg:p-6 m-0">
                <EquipmentSearch
                  equipment={filteredEquipmentData}
                  selectedLocation={selectedNode?.id}
                  onFilteredResults={handleFilteredResults}
                  onEquipmentSelect={handleEquipmentSelect}
                />
              </TabsContent>

              {/* ABA DE ANÁLISES - Dashboard de utilização de ativos */}
              <TabsContent value="analytics" className="h-full p-4 lg:p-6 m-0">
                <AssetUtilizationDashboard
                  equipment={filteredEquipment}
                  selectedLocation={selectedNode?.id}
                />
              </TabsContent>

              {/* ABA DE LOCAIS - Detalhes do local selecionado */}
              <TabsContent value="locations" className="h-full p-4 lg:p-6 m-0">
                <LocationDetails 
                  onEdit={handleEditLocation}
                  onCreateAsset={handleCreateAsset}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* ========== MODAL DE RASTREAMENTO DE STATUS DO EQUIPAMENTO ========== */}
      {/* Exibe detalhes e permite rastrear o status de um equipamento específico */}
      {selectedEquipment && (
        <EquipmentStatusTracking
          equipment={selectedEquipment}
          isOpen={isStatusTrackingOpen}
          onClose={() => {
            setIsStatusTrackingOpen(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {/* ========== MODAL DE CRIAÇÃO DE EQUIPAMENTO ========== */}
      {/* Formulário completo para adicionar um novo equipamento */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* ========== SEÇÃO: INFORMAÇÕES BÁSICAS ========== */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Tag do equipamento - identificação única obrigatória */}
                <div>
                  <Label htmlFor="tag">Tag do Equipamento *</Label>
                  <Input 
                    id="tag"
                    value={newEquipment.tag}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, tag: e.target.value }))}
                    placeholder="AC-001"
                    required
                  />
                </div>
                {/* Tipo do equipamento - seleção obrigatória */}
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select 
                    value={newEquipment.type} 
                    onValueChange={(value: Equipment['type']) => 
                      setNewEquipment(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SPLIT">Split</SelectItem>
                      <SelectItem value="CENTRAL">Central</SelectItem>
                      <SelectItem value="VRF">VRF</SelectItem>
                      <SelectItem value="CHILLER">Chiller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Marca do equipamento */}
                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <Input 
                    id="brand"
                    value={newEquipment.brand}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Daikin"
                    required
                  />
                </div>
                {/* Modelo do equipamento */}
                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input 
                    id="model"
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Inverter 18000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Capacidade em BTUs */}
                <div>
                  <Label htmlFor="capacity">Capacidade (BTUs) *</Label>
                  <Input 
                    id="capacity"
                    type="number"
                    value={newEquipment.capacity}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="18000"
                    required
                  />
                </div>
                {/* Número de série (opcional) */}
                <div>
                  <Label htmlFor="serialNumber">Número de Série</Label>
                  <Input 
                    id="serialNumber"
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                    placeholder="SN123456789"
                  />
                </div>
              </div>
            </div>

            {/* ========== SEÇÃO: INFORMAÇÕES DE LOCALIZAÇÃO ========== */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Localização</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Seleção de setor - obrigatória, desabilitada se já há setor selecionado */}
                <div>
                  <Label htmlFor="sector">Setor *</Label>
                  <Select 
                    value={newEquipment.sectorId} 
                    onValueChange={(value) => setNewEquipment(prev => ({ ...prev, sectorId: value, subSectionId: '' }))}
                    disabled={selectedNode?.type === 'sector' || selectedNode?.type === 'subsection'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(sector => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Seleção de subsetor - opcional, depende do setor selecionado */}
                <div>
                  <Label htmlFor="subSection">Subsetor (Opcional)</Label>
                  <Select 
                    value={newEquipment.subSectionId} 
                    onValueChange={(value) => setNewEquipment(prev => ({ ...prev, subSectionId: value }))}
                    disabled={selectedNode?.type === 'subsection' || !newEquipment.sectorId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar subsetor" />
                    </SelectTrigger>
                    <SelectContent>
                      {subSections
                        .filter(ss => ss.sectorId === newEquipment.sectorId)
                        .map(subSection => (
                          <SelectItem key={subSection.id} value={subSection.id}>
                            {subSection.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localização específica dentro do setor/subsetor */}
              <div>
                <Label htmlFor="location">Localização Específica</Label>
                <Input 
                  id="location"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Sala 101, Teto - Posição A"
                />
              </div>
            </div>

            {/* ========== SEÇÃO: DATAS E GARANTIA ========== */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Datas e Garantia</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Data de instalação - obrigatória */}
                <div>
                  <Label htmlFor="installDate">Data de Instalação *</Label>
                  <Input 
                    id="installDate"
                    type="date"
                    value={newEquipment.installDate}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, installDate: e.target.value }))}
                    required
                  />
                </div>
                {/* Data da próxima manutenção - obrigatória */}
                <div>
                  <Label htmlFor="nextMaintenance">Próxima Manutenção *</Label>
                  <Input 
                    id="nextMaintenance"
                    type="date"
                    value={newEquipment.nextMaintenance}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Data de fim da garantia - opcional */}
              <div>
                <Label htmlFor="warrantyExpiry">Fim da Garantia</Label>
                <Input 
                  id="warrantyExpiry"
                  type="date"
                  value={newEquipment.warrantyExpiry}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                />
              </div>
            </div>

            {/* ========== SEÇÃO: OBSERVAÇÕES ========== */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  value={newEquipment.notes}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre o equipamento..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>

            {/* ========== BOTÕES DE AÇÃO DO FORMULÁRIO ========== */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
                Cancelar
              </Button>
              {/* Botão de adicionar - desabilitado se campos obrigatórios não estão preenchidos */}
              <Button 
                onClick={handleAddEquipment} 
                disabled={!newEquipment.tag || !newEquipment.brand || !newEquipment.model || !newEquipment.capacity || !newEquipment.installDate || !newEquipment.nextMaintenance}
              >
                Adicionar Equipamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* ========== MODAL DE FORMULÁRIO DE LOCAIS ========== */}
      {/* Modal para criar/editar empresas, setores e subsetores */}
      <LocationFormModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        mode={locationModalMode}
        type={locationModalType}
        initialData={locationModalMode === 'edit' ? selectedNode?.data : undefined}
      />
    </div>
  );
}

/**
 * PÁGINA DE EQUIPAMENTOS - COMPONENTE PRINCIPAL EXPORTADO
 * 
 * Esta é a página principal de gestão de ativos/equipamentos.
 * Envolvida pelo LocationProvider para fornecer acesso ao contexto
 * de locais hierárquicos (empresas, setores, subsetores) para todos
 * os componentes filhos.
 * 
 * O LocationProvider garante que:
 * - A árvore de locais seja compartilhada entre componentes
 * - O estado de seleção seja consistente
 * - Os filtros e ações baseados em localização funcionem corretamente
 */
export function EquipmentPage() {
  return (
    <LocationProvider>
      <AssetsContent />
    </LocationProvider>
  );
}