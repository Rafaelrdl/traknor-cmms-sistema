import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useData';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import type { Company, Sector, SubSection } from '@/types';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  type: 'company' | 'sector' | 'subsection';
  initialData?: Company | Sector | SubSection;
}

export function LocationFormModal({ 
  isOpen, 
  onClose, 
  mode, 
  type, 
  initialData 
}: LocationFormModalProps) {
  const [companies, setCompanies] = useCompanies();
  const [sectors, setSectors] = useSectors();
  const [subSections, setSubSections] = useSubSections();
  const { selectedNode, setSelectedNode } = useLocationContext();

  // Company form state
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    name: '',
    segment: '',
    cnpj: '',
    address: {
      zip: '',
      city: '',
      state: '',
      fullAddress: ''
    },
    responsible: '',
    role: '',
    phone: '',
    email: '',
    totalArea: 0,
    occupants: 0,
    hvacUnits: 0,
    notes: ''
  });

  // Sector form state
  const [sectorForm, setSectorForm] = useState<Partial<Sector>>({
    name: '',
    companyId: '',
    responsible: '',
    phone: '',
    email: '',
    area: 0,
    occupants: 0,
    hvacUnits: 0,
    notes: ''
  });

  // Sub-section form state
  const [subSectionForm, setSubSectionForm] = useState<Partial<SubSection>>({
    name: '',
    sectorId: '',
    responsible: '',
    phone: '',
    email: '',
    area: 0,
    occupants: 0,
    hvacUnits: 0,
    notes: ''
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        if (type === 'company') {
          setCompanyForm(initialData as Company);
        } else if (type === 'sector') {
          setSectorForm(initialData as Sector);
        } else if (type === 'subsection') {
          setSubSectionForm(initialData as SubSection);
        }
      } else {
        // Reset forms for create mode
        setCompanyForm({
          name: '',
          segment: '',
          cnpj: '',
          address: { zip: '', city: '', state: '', fullAddress: '' },
          responsible: '',
          role: '',
          phone: '',
          email: '',
          totalArea: 0,
          occupants: 0,
          hvacUnits: 0,
          notes: ''
        });
        setSectorForm({
          name: '',
          companyId: '',
          responsible: '',
          phone: '',
          email: '',
          area: 0,
          occupants: 0,
          hvacUnits: 0,
          notes: ''
        });
        setSubSectionForm({
          name: '',
          sectorId: '',
          responsible: '',
          phone: '',
          email: '',
          area: 0,
          occupants: 0,
          hvacUnits: 0,
          notes: ''
        });
      }
    }
  }, [isOpen, mode, type, initialData]);

  const handleSubmit = () => {
    if (type === 'company') {
      const newCompany: Company = {
        id: mode === 'edit' ? (initialData as Company).id : Date.now().toString(),
        ...companyForm as Company,
        createdAt: mode === 'edit' ? (initialData as Company).createdAt : new Date().toISOString()
      };

      if (mode === 'edit') {
        setCompanies(current => current.map(c => c.id === newCompany.id ? newCompany : c));
        if (selectedNode?.id === newCompany.id) {
          setSelectedNode({ ...selectedNode, data: newCompany });
        }
      } else {
        setCompanies(current => [...current, newCompany]);
      }
    } else if (type === 'sector') {
      const newSector: Sector = {
        id: mode === 'edit' ? (initialData as Sector).id : Date.now().toString(),
        ...sectorForm as Sector
      };

      if (mode === 'edit') {
        setSectors(current => current.map(s => s.id === newSector.id ? newSector : s));
        if (selectedNode?.id === newSector.id) {
          setSelectedNode({ ...selectedNode, data: newSector });
        }
      } else {
        setSectors(current => [...current, newSector]);
      }
    } else if (type === 'subsection') {
      const newSubSection: SubSection = {
        id: mode === 'edit' ? (initialData as SubSection).id : Date.now().toString(),
        ...subSectionForm as SubSection
      };

      if (mode === 'edit') {
        setSubSections(current => current.map(ss => ss.id === newSubSection.id ? newSubSection : ss));
        if (selectedNode?.id === newSubSection.id) {
          setSelectedNode({ ...selectedNode, data: newSubSection });
        }
      } else {
        setSubSections(current => [...current, newSubSection]);
      }
    }

    onClose();
  };

  const renderCompanyForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={companyForm.name}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Company Name"
            required
          />
        </div>
        <div>
          <Label htmlFor="segment">Segment *</Label>
          <Input
            id="segment"
            value={companyForm.segment}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, segment: e.target.value }))}
            placeholder="e.g., Retail, Corporate"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cnpj">Tax ID (CNPJ) *</Label>
        <Input
          id="cnpj"
          value={companyForm.cnpj}
          onChange={(e) => setCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
          placeholder="00.000.000/0000-00"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Address *</Label>
        <div>
          <Input
            value={companyForm.address?.fullAddress || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, fullAddress: e.target.value }
            }))}
            placeholder="Full Address"
            className="mb-2"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={companyForm.address?.zip || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, zip: e.target.value }
            }))}
            placeholder="ZIP Code"
          />
          <Input
            value={companyForm.address?.city || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, city: e.target.value }
            }))}
            placeholder="City"
          />
          <Input
            value={companyForm.address?.state || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, state: e.target.value }
            }))}
            placeholder="State"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="responsible">Responsible *</Label>
          <Input
            id="responsible"
            value={companyForm.responsible}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, responsible: e.target.value }))}
            placeholder="Full Name"
            required
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            value={companyForm.role}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., General Manager"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={companyForm.phone}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={companyForm.email}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="totalArea">Total Area (m²) *</Label>
          <Input
            id="totalArea"
            type="number"
            value={companyForm.totalArea}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, totalArea: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="occupants">Occupants *</Label>
          <Input
            id="occupants"
            type="number"
            value={companyForm.occupants}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, occupants: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="hvacUnits">HVAC Units *</Label>
          <Input
            id="hvacUnits"
            type="number"
            value={companyForm.hvacUnits}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, hvacUnits: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={companyForm.notes}
          onChange={(e) => setCompanyForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional information..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderSectorForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sectorName">Section Name *</Label>
        <Input
          id="sectorName"
          value={sectorForm.name}
          onChange={(e) => setSectorForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Section Name"
          required
        />
      </div>

      <div>
        <Label htmlFor="companySelect">Company *</Label>
        <Select 
          value={sectorForm.companyId} 
          onValueChange={(value) => setSectorForm(prev => ({ ...prev, companyId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sectorResponsible">Responsible *</Label>
          <Input
            id="sectorResponsible"
            value={sectorForm.responsible}
            onChange={(e) => setSectorForm(prev => ({ ...prev, responsible: e.target.value }))}
            placeholder="Full Name"
            required
          />
        </div>
        <div>
          <Label htmlFor="sectorPhone">Phone *</Label>
          <Input
            id="sectorPhone"
            value={sectorForm.phone}
            onChange={(e) => setSectorForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sectorEmail">Email *</Label>
        <Input
          id="sectorEmail"
          type="email"
          value={sectorForm.email}
          onChange={(e) => setSectorForm(prev => ({ ...prev, email: e.target.value }))}
          placeholder="email@company.com"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sectorArea">Area (m²) *</Label>
          <Input
            id="sectorArea"
            type="number"
            value={sectorForm.area}
            onChange={(e) => setSectorForm(prev => ({ ...prev, area: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="sectorOccupants">Occupants *</Label>
          <Input
            id="sectorOccupants"
            type="number"
            value={sectorForm.occupants}
            onChange={(e) => setSectorForm(prev => ({ ...prev, occupants: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="sectorHvacUnits">HVAC Units *</Label>
          <Input
            id="sectorHvacUnits"
            type="number"
            value={sectorForm.hvacUnits}
            onChange={(e) => setSectorForm(prev => ({ ...prev, hvacUnits: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sectorNotes">Additional Notes</Label>
        <Textarea
          id="sectorNotes"
          value={sectorForm.notes}
          onChange={(e) => setSectorForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional information..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderSubSectionForm = () => {
    // Filter sectors by selected company
    const availableSectors = sectorForm.companyId 
      ? sectors.filter(s => s.companyId === sectorForm.companyId)
      : sectors;

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="subSectionName">Sub-section Name *</Label>
          <Input
            id="subSectionName"
            value={subSectionForm.name}
            onChange={(e) => setSubSectionForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Sub-section Name"
            required
          />
        </div>

        <div>
          <Label htmlFor="companySelectSub">Company *</Label>
          <Select 
            value={
              subSectionForm.sectorId 
                ? sectors.find(s => s.id === subSectionForm.sectorId)?.companyId || ''
                : ''
            }
            onValueChange={(companyId) => {
              // Reset sector when company changes
              setSubSectionForm(prev => ({ ...prev, sectorId: '' }));
              // Store company in temporary state for filtering
              setSectorForm(prev => ({ ...prev, companyId }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sectorSelectSub">Section *</Label>
          <Select 
            value={subSectionForm.sectorId} 
            onValueChange={(value) => setSubSectionForm(prev => ({ ...prev, sectorId: value }))}
            disabled={!sectorForm.companyId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {availableSectors.map(sector => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subSectionResponsible">Responsible *</Label>
            <Input
              id="subSectionResponsible"
              value={subSectionForm.responsible}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, responsible: e.target.value }))}
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <Label htmlFor="subSectionPhone">Phone *</Label>
            <Input
              id="subSectionPhone"
              value={subSectionForm.phone}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subSectionEmail">Email *</Label>
          <Input
            id="subSectionEmail"
            type="email"
            value={subSectionForm.email}
            onChange={(e) => setSubSectionForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@company.com"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="subSectionArea">Area (m²) *</Label>
            <Input
              id="subSectionArea"
              type="number"
              value={subSectionForm.area}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, area: Number(e.target.value) }))}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="subSectionOccupants">Occupants *</Label>
            <Input
              id="subSectionOccupants"
              type="number"
              value={subSectionForm.occupants}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, occupants: Number(e.target.value) }))}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="subSectionHvacUnits">HVAC Units *</Label>
            <Input
              id="subSectionHvacUnits"
              type="number"
              value={subSectionForm.hvacUnits}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, hvacUnits: Number(e.target.value) }))}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subSectionNotes">Additional Notes</Label>
          <Textarea
            id="subSectionNotes"
            value={subSectionForm.notes}
            onChange={(e) => setSubSectionForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information..."
            rows={3}
          />
        </div>
      </div>
    );
  };

  const getTitle = () => {
    const action = mode === 'create' ? 'Add' : 'Edit';
    const typeName = type === 'company' ? 'Company' : 
                     type === 'sector' ? 'Section' : 'Sub-section';
    return `${action} ${typeName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {type === 'company' && renderCompanyForm()}
        {type === 'sector' && renderSectorForm()}
        {type === 'subsection' && renderSubSectionForm()}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}