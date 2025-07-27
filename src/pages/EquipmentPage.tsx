import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Package, Wrench } from 'lucide-react';
import { useEquipment, useSectors, useCompanies } from '@/hooks/useData';
import type { Equipment } from '@/types';

export function EquipmentPage() {
  const [equipment, setEquipment] = useEquipment();
  const [sectors] = useSectors();
  const [companies] = useCompanies();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    tag: '',
    model: '',
    brand: '',
    type: 'SPLIT' as Equipment['type'],
    capacity: '',
    sectorId: '',
    installDate: '',
    nextMaintenance: ''
  });

  // Filter equipment
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddEquipment = () => {
    const equipment_data: Equipment = {
      id: Date.now().toString(),
      ...newEquipment,
      capacity: parseInt(newEquipment.capacity),
      status: 'FUNCTIONING'
    };
    
    setEquipment(current => [...current, equipment_data]);
    setNewEquipment({
      tag: '',
      model: '',
      brand: '',
      type: 'SPLIT',
      capacity: '',
      sectorId: '',
      installDate: '',
      nextMaintenance: ''
    });
    setIsDialogOpen(false);
  };

  const updateEquipmentStatus = (id: string, status: Equipment['status']) => {
    setEquipment(current => 
      current.map(eq => eq.id === id ? { ...eq, status } : eq)
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestão de Ativos" 
        description="Cadastro e controle de equipamentos HVAC"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
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
                    onValueChange={(value) => setNewEquipment(prev => ({ ...prev, sectorId: value }))}
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
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipamentos Cadastrados
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Status</SelectItem>
                  <SelectItem value="FUNCTIONING">Funcionando</SelectItem>
                  <SelectItem value="MAINTENANCE">Em Manutenção</SelectItem>
                  <SelectItem value="STOPPED">Parado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Manutenção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((eq) => {
                const sector = sectors.find(s => s.id === eq.sectorId);
                const company = companies.find(c => c.id === sector?.companyId);
                
                return (
                  <TableRow key={eq.id}>
                    <TableCell className="font-medium">{eq.tag}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{eq.type}</Badge>
                    </TableCell>
                    <TableCell>{eq.brand} {eq.model}</TableCell>
                    <TableCell>{eq.capacity.toLocaleString()} BTUs</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sector?.name}</div>
                        <div className="text-sm text-muted-foreground">{company?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={eq.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(eq.nextMaintenance).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateEquipmentStatus(eq.id, 'MAINTENANCE')}
                          disabled={eq.status === 'MAINTENANCE'}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredEquipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum equipamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}