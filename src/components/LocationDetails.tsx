import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Edit, Plus } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import type { Company, Sector, SubSection } from '@/types';

interface LocationDetailsProps {
  onEdit: () => void;
  onCreateAsset: () => void;
}

export function LocationDetails({ onEdit, onCreateAsset }: LocationDetailsProps) {
  const { selectedNode } = useLocation();

  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <Building2 className="h-12 w-12 mx-auto opacity-50" />
          <p className="text-lg font-medium">Select a location</p>
          <p className="text-sm">Choose a company, section or sub-section to view details</p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (selectedNode.type) {
      case 'company':
        return <Building2 className="h-5 w-5" />;
      case 'sector':
        return <MapPin className="h-5 w-5" />;
      case 'subsection':
        return <Users className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (selectedNode.type) {
      case 'company':
        return 'Company';
      case 'sector':
        return 'Section';
      case 'subsection':
        return 'Sub-section';
    }
  };

  const renderCompanyDetails = (company: Company) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="font-medium">{company.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Segment</label>
              <p>{company.segment}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tax ID (CNPJ)</label>
              <p>{company.cnpj}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Address</label>
              <p>{company.address.fullAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">City</label>
                <p>{company.address.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">State</label>
                <p>{company.address.state}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsible</label>
              <p className="font-medium">{company.responsible}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p>{company.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p>{company.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p>{company.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Operational Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Area</label>
                <p className="font-medium">{company.totalArea.toLocaleString()} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupants</label>
                <p className="font-medium">{company.occupants}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">HVAC Units</label>
                <p className="font-medium">{company.hvacUnits}</p>
              </div>
            </div>
            {company.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                <p>{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSectorDetails = (sector: Sector) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsible</label>
              <p className="font-medium">{sector.responsible}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p>{sector.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p>{sector.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Operational Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Area</label>
                <p className="font-medium">{sector.area.toLocaleString()} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupants</label>
                <p className="font-medium">{sector.occupants}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">HVAC Units</label>
                <p className="font-medium">{sector.hvacUnits}</p>
              </div>
            </div>
            {sector.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                <p>{sector.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSubSectionDetails = (subSection: SubSection) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsible</label>
              <p className="font-medium">{subSection.responsible}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p>{subSection.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p>{subSection.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Operational Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Area</label>
                <p className="font-medium">{subSection.area.toLocaleString()} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupants</label>
                <p className="font-medium">{subSection.occupants}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">HVAC Units</label>
                <p className="font-medium">{subSection.hvacUnits}</p>
              </div>
            </div>
            {subSection.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                <p>{subSection.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{selectedNode.name}</h2>
              <Badge variant="secondary">{getTypeLabel()}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={onCreateAsset} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Asset
          </Button>
        </div>
      </div>

      {/* Content */}
      {selectedNode.type === 'company' && renderCompanyDetails(selectedNode.data as Company)}
      {selectedNode.type === 'sector' && renderSectorDetails(selectedNode.data as Sector)}
      {selectedNode.type === 'subsection' && renderSubSectionDetails(selectedNode.data as SubSection)}
    </div>
  );
}