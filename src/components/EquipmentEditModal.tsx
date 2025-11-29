/**
 * EquipmentEditModal - Modal de Edição de Equipamento (CMMS)
 * 
 * Modal para editar informações de um equipamento no módulo CMMS.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { useUpdateEquipment } from '@/hooks/useEquipmentQuery';
import { useSectors, useSubsections } from '@/hooks/useLocationsQuery';
import type { Equipment } from '@/types';
import { toast } from 'sonner';

interface EquipmentEditModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Tipos de equipamento
const EQUIPMENT_TYPES: { value: Equipment['type']; label: string }[] = [
  { value: 'SPLIT', label: 'Split' },
  { value: 'CENTRAL', label: 'Central' },
  { value: 'VRF', label: 'VRF' },
  { value: 'CHILLER', label: 'Chiller' },
];

// Criticidade
const CRITICIDADE_OPTIONS: { value: Equipment['criticidade']; label: string }[] = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
];

// Status
const STATUS_OPTIONS: { value: Equipment['status']; label: string }[] = [
  { value: 'FUNCTIONING', label: 'Funcionando' },
  { value: 'MAINTENANCE', label: 'Em Manutenção' },
  { value: 'STOPPED', label: 'Parado' },
];

export function EquipmentEditModal({ equipment, open, onOpenChange }: EquipmentEditModalProps) {
  const updateMutation = useUpdateEquipment();
  const { data: sectors = [] } = useSectors();
  const { data: subsections = [] } = useSubsections();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    tag: '',
    model: '',
    brand: '',
    type: 'SPLIT' as Equipment['type'],
    capacity: 0,
    criticidade: 'MEDIA' as Equipment['criticidade'],
    status: 'FUNCTIONING' as Equipment['status'],
    sectorId: '',
    subSectionId: '',
    location: '',
    serialNumber: '',
    installDate: '',
    nextMaintenance: '',
    warrantyExpiry: '',
    notes: '',
  });

  // Preencher formulário quando o equipment mudar
  useEffect(() => {
    if (equipment) {
      setFormData({
        tag: equipment.tag || '',
        model: equipment.model || '',
        brand: equipment.brand || '',
        type: equipment.type || 'SPLIT',
        capacity: equipment.capacity || 0,
        criticidade: equipment.criticidade || 'MEDIA',
        status: equipment.status || 'FUNCTIONING',
        sectorId: equipment.sectorId || '',
        subSectionId: equipment.subSectionId || '',
        location: equipment.location || '',
        serialNumber: equipment.serialNumber || '',
        installDate: equipment.installDate || '',
        nextMaintenance: equipment.nextMaintenance || '',
        warrantyExpiry: equipment.warrantyExpiry || '',
        notes: equipment.notes || '',
      });
    }
  }, [equipment]);

  // Filtrar subseções baseado no setor selecionado
  const filteredSubsections = subsections.filter(
    sub => sub.sectorId === formData.sectorId
  );

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar subseção se o setor mudar
    if (field === 'sectorId') {
      setFormData(prev => ({ ...prev, subSectionId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment) return;

    try {
      await updateMutation.mutateAsync({
        id: equipment.id,
        data: {
          ...formData,
          capacity: Number(formData.capacity),
        },
      });
      
      toast.success('Equipamento atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error('Erro ao atualizar equipamento');
    }
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Equipamento</DialogTitle>
          <DialogDescription>
            Atualize as informações do equipamento {equipment.tag}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Tag *</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => handleChange('tag', e.target.value)}
                placeholder="Ex: AC-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Série</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                placeholder="Serial number"
              />
            </div>
          </div>

          {/* Marca e Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Ex: Carrier, Trane"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Modelo do equipamento"
              />
            </div>
          </div>

          {/* Tipo, Capacidade e Criticidade */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (BTUs)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticidade">Criticidade</Label>
              <Select
                value={formData.criticidade}
                onValueChange={(value) => handleChange('criticidade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CRITICIDADE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sectorId">Setor</Label>
              <Select
                value={formData.sectorId}
                onValueChange={(value) => handleChange('sectorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSectionId">Subsetor</Label>
              <Select
                value={formData.subSectionId}
                onValueChange={(value) => handleChange('subSectionId', value)}
                disabled={!formData.sectorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o subsetor" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubsections.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Localização específica */}
          <div className="space-y-2">
            <Label htmlFor="location">Localização Específica</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ex: Sala 101, Teto - Posição A"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installDate">Data de Instalação</Label>
              <Input
                id="installDate"
                type="date"
                value={formData.installDate}
                onChange={(e) => handleChange('installDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextMaintenance">Próxima Manutenção</Label>
              <Input
                id="nextMaintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => handleChange('nextMaintenance', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Garantia até</Label>
              <Input
                id="warrantyExpiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações adicionais sobre o equipamento"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
