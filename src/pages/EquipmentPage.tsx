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

function AssetsContent() {
  const [equipment, setEquipment] = useEquipment();
  const [sectors] = useSectors();
  const [subSections] = useSubSections();
  const [companies] = useCompanies();
  const { selectedNode } = useLocationContext();
  const { role } = useAbility();
  
  // Memoize the filter options to prevent infinite re-renders
  const filterOptions = useMemo(() => ({
    includeInactive: role === 'admin' // Only admin can see inactive assets
  }), [role]);

  // Apply role-based filtering to equipment data
  const { data: filteredEquipmentData, stats: equipmentFilterStats } = useRoleBasedData(
    equipment || [], 
    'asset',
    filterOptions
  );
  
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalMode, setLocationModalMode] = useState<'create' | 'edit'>('create');
  const [locationModalType, setLocationModalType] = useState<'company' | 'sector' | 'subsection'>('company');
  const [activeTab, setActiveTab] = useState('search');
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>(filteredEquipmentData);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isStatusTrackingOpen, setIsStatusTrackingOpen] = useState(false);

  // Update filtered equipment when role-based data changes
  useEffect(() => {
    setFilteredEquipment(filteredEquipmentData);
  }, [filteredEquipmentData]);

  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    tag: '',
    model: '',
    brand: '',
    type: 'SPLIT' as Equipment['type'],
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

  const handleAddEquipment = () => {
    const equipment_data: Equipment = {
      id: Date.now().toString(),
      ...newEquipment,
      capacity: parseInt(newEquipment.capacity),
      status: 'FUNCTIONING',
      totalOperatingHours: 0,
      energyConsumption: Math.floor(Math.random() * 200) + 150, // Mock initial value
      // Auto-link to selected location if available
      sectorId: selectedNode?.type === 'sector' ? selectedNode.id : 
                selectedNode?.type === 'subsection' ? (selectedNode.data as SubSection).sectorId :
                newEquipment.sectorId,
      subSectionId: selectedNode?.type === 'subsection' ? selectedNode.id : newEquipment.subSectionId
    };
    
    setEquipment((current) => [...(current || []), equipment_data]);
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
    setIsEquipmentDialogOpen(false);
  };

  const handleCreateLocation = (type: 'company' | 'sector' | 'subsection') => {
    setLocationModalType(type);
    setLocationModalMode('create');
    setIsLocationModalOpen(true);
  };

  const handleEditLocation = () => {
    if (!selectedNode) return;
    setLocationModalType(selectedNode.type);
    setLocationModalMode('edit');
    setIsLocationModalOpen(true);
  };

  const handleCreateAsset = () => {
    setIsEquipmentDialogOpen(true);
  };

  const handleEquipmentSelect = (selectedEquipment: Equipment) => {
    setSelectedEquipment(selectedEquipment);
    setIsStatusTrackingOpen(true);
  };

  const handleFilteredResults = (filtered: Equipment[]) => {
    setFilteredEquipment(filtered);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)]">
      {/* Sidebar - Location Tree - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex w-80 border-r bg-card">
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Locais</h3>
          </div>
          <LocationTree />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Action Buttons */}
        <div className="p-4 lg:p-6 border-b bg-background">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl lg:text-2xl font-bold">Gestão de Ativos</h1>
            
            {/* Data filtering info */}
            {equipmentFilterStats.filtered > 0 && (
              <DataFilterInfo
                filterStats={equipmentFilterStats}
                dataType="asset"
                canViewAll={role === 'admin'}
                className="lg:max-w-md"
              />
            )}
            
            {/* Mobile Location Tree Toggle */}
            <div className="lg:hidden">
              <LocationTree />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
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

        {/* Enhanced Equipment Management Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b bg-background px-4 lg:px-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Análises
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Locais
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="search" className="h-full p-4 lg:p-6 m-0">
                <EquipmentSearch
                  equipment={filteredEquipmentData}
                  selectedLocation={selectedNode?.id}
                  onFilteredResults={handleFilteredResults}
                  onEquipmentSelect={handleEquipmentSelect}
                />
              </TabsContent>

              <TabsContent value="analytics" className="h-full p-4 lg:p-6 m-0">
                <AssetUtilizationDashboard
                  equipment={filteredEquipment}
                  selectedLocation={selectedNode?.id}
                />
              </TabsContent>

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

      {/* Equipment Status Tracking Modal */}
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

      {/* Equipment Creation Modal */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Informações Básicas</h3>
              <div className="grid grid-cols-2 gap-4">
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

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Localização</h3>
              <div className="grid grid-cols-2 gap-4">
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

            {/* Dates and Warranty */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Datas e Garantia</h3>
              <div className="grid grid-cols-2 gap-4">
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

            {/* Notes */}
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

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
                Cancelar
              </Button>
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
      {/* Location Form Modal */}
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

export function EquipmentPage() {
  return (
    <LocationProvider>
      <AssetsContent />
    </LocationProvider>
  );
}