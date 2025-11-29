// Importações dos componentes de UI e ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Edit } from 'lucide-react';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import { IfCanEdit } from '@/components/auth/IfCan';
import type { Company, Sector, SubSection } from '@/types';

// Interface para as props do componente
interface LocationDetailsProps {
  onEdit: () => void;        // Função para editar a localização selecionada
}

/**
 * Componente que exibe os detalhes da localização selecionada no menu
 * Mostra informações diferentes dependendo do tipo (empresa, setor, subsetor)
 */
export function LocationDetails({ onEdit }: LocationDetailsProps) {
  // Obtém o nó selecionado do contexto de localização
  const { selectedNode } = useLocationContext();

  // Estado vazio: quando nenhuma localização foi selecionada
  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <Building2 className="h-12 w-12 mx-auto opacity-50" />
          <p className="text-lg font-medium">Selecione uma localização</p>
          <p className="text-sm">Escolha uma empresa, setor ou subsetor para ver os detalhes</p>
        </div>
      </div>
    );
  }

  /**
   * Retorna o ícone apropriado para o tipo de localização
   */
  const getIcon = () => {
    switch (selectedNode.type) {
      case 'company':
        return <Building2 className="h-5 w-5" />; // Ícone de empresa
      case 'sector':
        return <MapPin className="h-5 w-5" />;    // Ícone de setor
      case 'subsection':
        return <Users className="h-5 w-5" />;     // Ícone de subsetor
    }
  };

  /**
   * Retorna o rótulo em português para o tipo de localização
   */
  const getTypeLabel = () => {
    switch (selectedNode.type) {
      case 'company':
        return 'Empresa';
      case 'sector':
        return 'Setor';
      case 'subsection':
        return 'Subsetor';
    }
  };

  /**
   * Renderiza os detalhes específicos para uma empresa
   * Exibe informações em 4 cartões: Gerais, Contato, Endereço e Dados Operacionais
   * @param company - Dados da empresa
   */
  const renderCompanyDetails = (company: Company) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Cartão 1: Informações Gerais */}
        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome da Empresa</label>
              <p className="font-medium">{company.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Segmento</label>
              <p>{company.segment || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
              <p>{company.cnpj || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Endereço Completo</label>
              <p className="break-words">{company.address?.fullAddress || '-'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                <p>{company.address?.city || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <p>{company.address?.state || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsável</label>
              <p className="font-medium">{company.responsible || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cargo</label>
              <p>{company.role || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p>{company.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="break-all">{company.email || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Área Total</label>
                <p className="font-medium">{company.totalArea?.toLocaleString() || '0'} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ocupantes</label>
                <p className="font-medium">{company.occupants || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unidades HVAC</label>
                <p className="font-medium">{company.hvacUnits || '0'}</p>
              </div>
            </div>
            {company.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações Adicionais</label>
                <p className="break-words">{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  /**
   * Renderiza os detalhes específicos para um setor
   * Exibe informações em 2 cartões: Contato e Dados Operacionais
   * @param sector - Dados do setor
   */
  const renderSectorDetails = (sector: Sector) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Cartão 1: Informações de Contato */}
        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsável</label>
              <p className="font-medium">{sector.responsible || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p>{sector.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="break-all">{sector.email || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Área</label>
                <p className="font-medium">{sector.area?.toLocaleString() || '0'} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ocupantes</label>
                <p className="font-medium">{sector.occupants || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unidades HVAC</label>
                <p className="font-medium">{sector.hvacUnits || '0'}</p>
              </div>
            </div>
            {sector.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações Adicionais</label>
                <p className="break-words">{sector.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  /**
   * Renderiza os detalhes específicos para uma subseção
   * Exibe informações em 2 cartões: Contato e Dados Operacionais
   * @param subSection - Dados da subseção
   */
  const renderSubSectionDetails = (subSection: SubSection) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Cartão 1: Informações de Contato */}
        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsável</label>
              <p className="font-medium">{subSection.responsible || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p>{subSection.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="break-all">{subSection.email || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="location-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Área</label>
                <p className="font-medium">{subSection.area?.toLocaleString() || '0'} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ocupantes</label>
                <p className="font-medium">{subSection.occupants || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unidades HVAC</label>
                <p className="font-medium">{subSection.hvacUnits || '0'}</p>
              </div>
            </div>
            {subSection.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações Adicionais</label>
                <p className="break-words">{subSection.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e botões de ação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-bold">{selectedNode.name}</h2>
              <Badge variant="secondary">{getTypeLabel()}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão Editar localização */}
          <IfCanEdit subject="asset">
            <Button 
              variant="outline" 
              onClick={onEdit} 
              className="btn-press flex items-center gap-2"
              aria-label="Editar localização"
              data-testid="asset-edit"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </IfCanEdit>
        </div>
      </div>

      {/* Conteúdo específico baseado no tipo de localização selecionada */}
      {selectedNode.type === 'company' && renderCompanyDetails(selectedNode.data as Company)}
      {selectedNode.type === 'sector' && renderSectorDetails(selectedNode.data as Sector)}
      {selectedNode.type === 'subsection' && renderSubSectionDetails(selectedNode.data as SubSection)}
    </div>
  );
}