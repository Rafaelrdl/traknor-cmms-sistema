import { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { LocationTree } from '@/components/LocationTree';
import { LocationDetails } from '@/components/LocationDetails';
import { LocationFormModal } from '@/components/LocationFormModal';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, MapPin, Users } from 'lucide-react';
import { useEquipment, useSectors, useSubSections, useCompanies } from '@/hooks/useDataTemp';
import { LocationProvider, useLocation as useLocationContext } from '@/contexts/LocationContext';
import type { Equipment, SubSection } from '@/types';

function AssetsContent() {
  const [equipment, setEquipment] = useEquipment();
  const [sectors] = useSectors();
  const [subSections] = useSubSections();
  const [companies] = useCompanies();
  const { selectedNode } = useLocationContext();
  
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalMode, setLocationModalMode] = useState<'create' | 'edit'>('create');
  const [locationModalType, setLocationModalType] = useState<'company' | 'sector' | 'subsection'>('company');

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
    nextMaintenance: ''
  });

  const handleAddEquipment = () => {
    const equipment_data: Equipment = {
      id: Date.now().toString(),
      ...newEquipment,
      capacity: parseInt(newEquipment.capacity),
      status: 'FUNCTIONING',
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
      nextMaintenance: ''
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
            
            {/* Mobile Location Tree Toggle */}
            <div className="lg:hidden">
              <LocationTree />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                onClick={() => handleCreateLocation('company')}
                className="flex items-center gap-2 text-sm"
                size="sm"
              >
                <Building2 className="h-4 w-4" />
                + Empresa
              </Button>
              <Button 
                onClick={() => handleCreateLocation('sector')}
                disabled={companies.length === 0}
                variant="outline"
                className="flex items-center gap-2 text-sm"
                size="sm"
              >
                <MapPin className="h-4 w-4" />
                + Setor
              </Button>
              <Button 
                onClick={() => handleCreateLocation('subsection')}
                disabled={sectors.length === 0}
                variant="outline"
                className="flex items-center gap-2 text-sm"
                size="sm"
              >
                <Users className="h-4 w-4" />
                + Subsetor
              </Button>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <LocationDetails 
            onEdit={handleEditLocation}
            onCreateAsset={handleCreateAsset}
          />
        </div>
      </div>
      {/* Equipment Creation Modal */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tag">Tag do Equipamento</Label>
                <Input 
                  id="tag"
                  value={newEquipment.tag}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="AC-001"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
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
                <Label htmlFor="brand">Marca</Label>
                <Input 
                  id="brand"
                  value={newEquipment.brand}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Daikin"
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input 
                  id="model"
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Inverter 18000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacidade (BTUs)</Label>
                <Input 
                  id="capacity"
                  type="number"
                  value={newEquipment.capacity}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="18000"
                />
              </div>
              <div>
                <Label htmlFor="sector">Setor</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installDate">Data de Instalação</Label>
                <Input 
                  id="installDate"
                  type="date"
                  value={newEquipment.installDate}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, installDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="nextMaintenance">Próxima Manutenção</Label>
                <Input 
                  id="nextMaintenance"
                  type="date"
                  value={newEquipment.nextMaintenance}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={handleAddEquipment} className="w-full">
              Adicionar Equipamento
            </Button>
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