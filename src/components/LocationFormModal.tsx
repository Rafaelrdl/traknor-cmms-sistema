// Importações dos componentes de UI e hooks necessários
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useDataTemp';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import { Building2, MapPin, Users, Phone, Mail, Calendar, FileText, LayoutGrid } from 'lucide-react';
import type { Company, Sector, SubSection } from '@/types';

// Interface para as props do modal
interface LocationFormModalProps {
  isOpen: boolean;                                    // Controla se o modal está aberto
  onClose: () => void;                               // Função para fechar o modal
  mode: 'create' | 'edit';                          // Modo: criar ou editar
  type: 'company' | 'sector' | 'subsection';        // Tipo de localização
  initialData?: Company | Sector | SubSection;       // Dados iniciais para edição
}

/**
 * Modal para criar ou editar localizações (empresas, setores, subsetores)
 * Apresenta formulários diferentes baseados no tipo de localização
 */
export function LocationFormModal({ 
  isOpen, 
  onClose, 
  mode, 
  type, 
  initialData 
}: LocationFormModalProps) {
  // Hooks para gerenciar os dados de empresas, setores e subseções
  const [companies, setCompanies] = useCompanies();
  const [sectors, setSectors] = useSectors();
  const [subSections, setSubSections] = useSubSections();
  const { selectedNode, setSelectedNode } = useLocationContext();

  // Estado do formulário para empresas
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    name: '',
    segment: '',
    cnpj: '',
    address: {
      zip: '',         // CEP
      city: '',        // Cidade
      state: '',       // Estado
      fullAddress: ''  // Endereço completo
    },
    responsible: '',   // Responsável
    role: '',         // Cargo do responsável
    phone: '',        // Telefone
    email: '',        // Email
    totalArea: 0,     // Área total em m²
    occupants: 0,     // Número de ocupantes
    hvacUnits: 0,     // Unidades HVAC
    notes: ''         // Observações
  });

  // Estado do formulário para setores
  const [sectorForm, setSectorForm] = useState<Partial<Sector>>({
    name: '',                    // Nome do setor
    companyId: 'no-company',     // ID da empresa (inicialmente vazio)
    responsible: '',             // Responsável
    phone: '',                   // Telefone
    email: '',                   // Email
    area: 0,                     // Área em m²
    occupants: 0,               // Número de ocupantes
    hvacUnits: 0,               // Unidades HVAC
    notes: ''                   // Observações
  });

  // Estado do formulário para subseções
  const [subSectionForm, setSubSectionForm] = useState<Partial<SubSection>>({
    name: '',                   // Nome da subseção
    sectorId: 'no-sector',      // ID do setor (inicialmente vazio)
    responsible: '',            // Responsável
    phone: '',                  // Telefone
    email: '',                  // Email
    area: 0,                    // Área em m²
    occupants: 0,              // Número de ocupantes
    hvacUnits: 0,              // Unidades HVAC
    notes: ''                  // Observações
  });

  /**
   * Efeito para inicializar os dados do formulário quando o modal abre
   * Carrega dados para edição ou limpa para criação
   */
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        // Modo edição: carrega dados existentes
        if (type === 'company') {
          setCompanyForm(initialData as Company);
        } else if (type === 'sector') {
          setSectorForm(initialData as Sector);
        } else if (type === 'subsection') {
          setSubSectionForm(initialData as SubSection);
        }
      } else {
        // Modo criação: reseta formulários
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
          companyId: 'no-company',
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
          sectorId: 'no-sector',
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

  /**
   * Função para processar o envio do formulário
   * Valida os dados e salva/atualiza a localização conforme o tipo e modo
   */
  const handleSubmit = () => {
    if (type === 'company') {
      // Criação/edição de empresa
      const newCompany: Company = {
        ...(companyForm as Omit<Company, 'id'>),
        id: mode === 'edit' ? (initialData as Company).id : Date.now().toString(),
        createdAt: mode === 'edit' ? (initialData as Company).createdAt : new Date().toISOString()
      };

      if (mode === 'edit') {
        // Atualiza empresa existente na lista
        setCompanies((current) => current?.map(c => c.id === newCompany.id ? newCompany : c) || [newCompany]);
        // Atualiza nó selecionado se for o mesmo
        if (selectedNode?.id === newCompany.id) {
          setSelectedNode({ ...selectedNode, data: newCompany });
        }
      } else {
        // Adiciona nova empresa à lista
        setCompanies((current) => [...(current || []), newCompany]);
      }
    } else if (type === 'sector') {
      // Validação: não permite salvar sem empresa selecionada
      if (!sectorForm.companyId || sectorForm.companyId === 'no-company') {
        return;
      }
      
      // Criação/edição de setor
      const newSector: Sector = {
        ...(sectorForm as Omit<Sector, 'id'>),
        id: mode === 'edit' ? (initialData as Sector).id : Date.now().toString()
      };

      if (mode === 'edit') {
        // Atualiza setor existente na lista
        setSectors((current) => current?.map(s => s.id === newSector.id ? newSector : s) || [newSector]);
        // Atualiza nó selecionado se for o mesmo
        if (selectedNode?.id === newSector.id) {
          setSelectedNode({ ...selectedNode, data: newSector });
        }
      } else {
        // Adiciona novo setor à lista
        setSectors((current) => [...(current || []), newSector]);
      }
    } else if (type === 'subsection') {
      // Validação: não permite salvar sem setor selecionado
      if (!subSectionForm.sectorId || subSectionForm.sectorId === 'no-sector') {
        return;
      }
      
      // Criação/edição de subseção
      const newSubSection: SubSection = {
        ...(subSectionForm as Omit<SubSection, 'id'>),
        id: mode === 'edit' ? (initialData as SubSection).id : Date.now().toString()
      };

      if (mode === 'edit') {
        // Atualiza subseção existente na lista
        setSubSections((current) => current?.map(ss => ss.id === newSubSection.id ? newSubSection : ss) || [newSubSection]);
        // Atualiza nó selecionado se for o mesmo
        if (selectedNode?.id === newSubSection.id) {
          setSelectedNode({ ...selectedNode, data: newSubSection });
        }
      } else {
        // Adiciona nova subseção à lista
        setSubSections((current) => [...(current || []), newSubSection]);
      }
    }

    // Fecha o modal após salvar
    onClose();
  };

  /**
   * Renderiza o formulário específico para empresas
   * Inclui campos para dados gerais, contato, endereço e informações operacionais
   */
  const renderCompanyForm = () => (
    <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary" />
        Dados da Empresa
      </h3>
      
      <div className="space-y-5">
        {/* Nome e Segmento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Nome da Empresa *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Nome oficial da organização
              </span>
            </Label>
            <Input
              id="name"
              value={companyForm.name}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: TechCorp Industrial"
              className="h-10"
              required
            />
          </div>
          <div>
            <Label htmlFor="segment" className="mb-2 block">
              Segmento *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Área de atuação
              </span>
            </Label>
            <Input
              id="segment"
              value={companyForm.segment}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, segment: e.target.value }))}
              placeholder="Ex: Varejo, Corporativo"
              className="h-10"
              required
            />
          </div>
        </div>

        {/* CNPJ */}
        <div>
          <Label htmlFor="cnpj" className="mb-2 block">
            CNPJ *
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              Cadastro Nacional da Pessoa Jurídica
            </span>
          </Label>
          <Input
            id="cnpj"
            value={companyForm.cnpj}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
            placeholder="00.000.000/0000-00"
            className="h-10"
            required
          />
        </div>

        {/* Endereço */}
        <div className="space-y-3">
          <Label className="mb-2 block">Endereço *</Label>
          <div>
            <Input
              value={companyForm.address?.fullAddress || ''}
              onChange={(e) => setCompanyForm(prev => ({ 
                ...prev, 
                address: { ...prev.address!, fullAddress: e.target.value }
              }))}
              placeholder="Ex: Av. Industrial, 1000 - Centro"
              className="h-10 mb-3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              value={companyForm.address?.zip || ''}
              onChange={(e) => setCompanyForm(prev => ({ 
                ...prev, 
                address: { ...prev.address!, zip: e.target.value }
              }))}
              placeholder="CEP"
              className="h-10"
            />
            <Input
              value={companyForm.address?.city || ''}
              onChange={(e) => setCompanyForm(prev => ({ 
                ...prev, 
                address: { ...prev.address!, city: e.target.value }
              }))}
              placeholder="Cidade"
              className="h-10"
            />
            <Input
              value={companyForm.address?.state || ''}
              onChange={(e) => setCompanyForm(prev => ({ 
                ...prev, 
                address: { ...prev.address!, state: e.target.value }
              }))}
              placeholder="Estado"
              className="h-10"
            />
          </div>
        </div>

        {/* Responsável e Cargo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="responsible" className="mb-2 block">
              Responsável *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Nome do responsável
              </span>
            </Label>
            <Input
              id="responsible"
              value={companyForm.responsible}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, responsible: e.target.value }))}
              placeholder="Ex: João Silva"
              className="h-10"
              required
            />
          </div>
          <div>
            <Label htmlFor="role" className="mb-2 block">
              Cargo *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Função do responsável
              </span>
            </Label>
            <Input
              id="role"
              value={companyForm.role}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Ex: Gerente Geral"
              className="h-10"
              required
            />
          </div>
        </div>

        {/* Telefone e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="mb-2 block">Telefone *</Label>
            <Input
              id="phone"
              value={companyForm.phone}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="h-10"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="mb-2 block">Email *</Label>
            <Input
              id="email"
              type="email"
              value={companyForm.email}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@empresa.com"
              className="h-10"
              required
            />
          </div>
        </div>

        {/* Área Total, Ocupantes e Unidades HVAC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="totalArea" className="mb-2 block">
              Área Total (m²) *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Metragem total
              </span>
            </Label>
            <Input
              id="totalArea"
              type="number"
              value={companyForm.totalArea}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, totalArea: Number(e.target.value) }))}
              placeholder="0"
              className="h-10"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="occupants" className="mb-2 block">
              Ocupantes *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Número de pessoas
              </span>
            </Label>
            <Input
              id="occupants"
              type="number"
              value={companyForm.occupants}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, occupants: Number(e.target.value) }))}
              placeholder="0"
              className="h-10"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="hvacUnits" className="mb-2 block">
              Unidades HVAC *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Quantidade total
              </span>
            </Label>
            <Input
              id="hvacUnits"
              type="number"
              value={companyForm.hvacUnits}
              onChange={(e) => setCompanyForm(prev => ({ ...prev, hvacUnits: Number(e.target.value) }))}
              placeholder="0"
              className="h-10"
              min="0"
              required
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="notes" className="mb-2 block">
            Observações Adicionais
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              (opcional)
            </span>
          </Label>
          <Textarea
            id="notes"
            value={companyForm.notes}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Informações adicionais sobre a empresa..."
            className="min-h-[80px] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza o formulário específico para setores
   * Inclui seleção de empresa, dados de contato e informações operacionais
   */
  const renderSectorForm = () => (
    <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        Dados do Setor
      </h3>
      
      <div className="space-y-5">
        {/* Nome do Setor */}
        <div>
          <Label htmlFor="sectorName" className="mb-2 block">
            Nome do Setor *
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              Identificação da área
            </span>
          </Label>
          <Input
            id="sectorName"
            value={sectorForm.name}
            onChange={(e) => setSectorForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Departamento de TI"
            className="h-10"
            required
          />
        </div>

        {/* Empresa */}
        <div>
          <Label htmlFor="companySelect" className="mb-2 block">Empresa *</Label>
          <Select 
            value={sectorForm.companyId} 
            onValueChange={(value) => setSectorForm(prev => ({ ...prev, companyId: value }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-company">Selecione uma empresa</SelectItem>
              {(companies || []).map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsável e Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sectorResponsible" className="mb-2 block">
              Responsável *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Nome do responsável
              </span>
            </Label>
            <Input
              id="sectorResponsible"
              value={sectorForm.responsible}
              onChange={(e) => setSectorForm(prev => ({ ...prev, responsible: e.target.value }))}
              placeholder="Ex: Maria Santos"
              className="h-10"
              required
            />
          </div>
          <div>
            <Label htmlFor="sectorPhone" className="mb-2 block">Telefone *</Label>
            <Input
              id="sectorPhone"
              value={sectorForm.phone}
              onChange={(e) => setSectorForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="h-10"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="sectorEmail" className="mb-2 block">Email *</Label>
          <Input
            id="sectorEmail"
            type="email"
            value={sectorForm.email}
            onChange={(e) => setSectorForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="setor@empresa.com"
            className="h-10"
            required
          />
        </div>

        {/* Área, Ocupantes e Unidades HVAC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sectorArea" className="mb-2 block">
              Área (m²) *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Metragem do setor
              </span>
            </Label>
            <Input
              id="sectorArea"
              type="number"
              value={sectorForm.area}
              onChange={(e) => setSectorForm(prev => ({ ...prev, area: Number(e.target.value) }))}
              placeholder="0"
              className="h-10"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="sectorOccupants" className="mb-2 block">
              Ocupantes *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Número de pessoas
              </span>
            </Label>
            <Input
              id="sectorOccupants"
              type="number"
              value={sectorForm.occupants}
              onChange={(e) => setSectorForm(prev => ({ ...prev, occupants: Number(e.target.value) }))}
              placeholder="0"
              className="h-10"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="sectorHvacUnits" className="mb-2 block">
              Unidades HVAC *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Sistemas de climatização
              </span>
            </Label>
            <Input
              id="sectorHvacUnits"
              type="number"
              value={sectorForm.hvacUnits}
              onChange={(e) => setSectorForm(prev => ({ ...prev, hvacUnits: Number(e.target.value) }))}
              placeholder="0"
              className="h-10"
              min="0"
              required
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="sectorNotes" className="mb-2 block">
            Observações Adicionais
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              (opcional)
            </span>
          </Label>
          <Textarea
            id="sectorNotes"
            value={sectorForm.notes}
            onChange={(e) => setSectorForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Informações adicionais sobre o setor..."
            className="min-h-[80px] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza o formulário específico para subseções
   * Inclui seleção de empresa e setor, além de dados de contato e operacionais
   */
  const renderSubSectionForm = () => {
    // Filtra setores pela empresa selecionada
    const availableSectors = sectorForm.companyId 
      ? sectors.filter(s => s.companyId === sectorForm.companyId)
      : sectors;

    return (
      <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          Dados do Subsetor
        </h3>
        
        <div className="space-y-5">
          {/* Nome do Subsetor */}
          <div>
            <Label htmlFor="subSectionName" className="mb-2 block">
              Nome do Subsetor *
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                Identificação da subárea
              </span>
            </Label>
            <Input
              id="subSectionName"
              value={subSectionForm.name}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Sala de Reuniões"
              className="h-10"
              required
            />
          </div>

          {/* Empresa */}
          <div>
            <Label htmlFor="companySelectSub" className="mb-2 block">Empresa *</Label>
            <Select 
              value={
                subSectionForm.sectorId 
                  ? sectors.find(s => s.id === subSectionForm.sectorId)?.companyId || 'no-company-sub'
                  : 'no-company-sub'
              }
              onValueChange={(companyId) => {
                // Reset sector when company changes
                setSubSectionForm(prev => ({ ...prev, sectorId: 'no-sector' }));
                // Store company in temporary state for filtering
                setSectorForm(prev => ({ ...prev, companyId }));
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-company-sub">Selecione uma empresa</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Setor */}
          <div>
            <Label htmlFor="sectorSelectSub" className="mb-2 block">Setor *</Label>
            <Select 
              value={subSectionForm.sectorId} 
              onValueChange={(value) => setSubSectionForm(prev => ({ ...prev, sectorId: value }))}
              disabled={!sectorForm.companyId || sectorForm.companyId === 'no-company'}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-sector">Selecione um setor</SelectItem>
                {availableSectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsável e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subSectionResponsible" className="mb-2 block">
                Responsável *
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  Nome do responsável
                </span>
              </Label>
              <Input
                id="subSectionResponsible"
                value={subSectionForm.responsible}
                onChange={(e) => setSubSectionForm(prev => ({ ...prev, responsible: e.target.value }))}
                placeholder="Ex: Ana Costa"
                className="h-10"
                required
              />
            </div>
            <div>
              <Label htmlFor="subSectionPhone" className="mb-2 block">Telefone *</Label>
              <Input
                id="subSectionPhone"
                value={subSectionForm.phone}
                onChange={(e) => setSubSectionForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="h-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="subSectionEmail" className="mb-2 block">Email *</Label>
            <Input
              id="subSectionEmail"
              type="email"
              value={subSectionForm.email}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="subsetor@empresa.com"
              className="h-10"
              required
            />
          </div>

          {/* Área, Ocupantes e Unidades HVAC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subSectionArea" className="mb-2 block">
                Área (m²) *
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  Metragem do subsetor
                </span>
              </Label>
              <Input
                id="subSectionArea"
                type="number"
                value={subSectionForm.area}
                onChange={(e) => setSubSectionForm(prev => ({ ...prev, area: Number(e.target.value) }))}
                placeholder="0"
                className="h-10"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="subSectionOccupants" className="mb-2 block">
                Ocupantes *
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  Número de pessoas
                </span>
              </Label>
              <Input
                id="subSectionOccupants"
                type="number"
                value={subSectionForm.occupants}
                onChange={(e) => setSubSectionForm(prev => ({ ...prev, occupants: Number(e.target.value) }))}
                placeholder="0"
                className="h-10"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="subSectionHvacUnits" className="mb-2 block">
                Unidades HVAC *
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  Sistemas de climatização
                </span>
              </Label>
              <Input
                id="subSectionHvacUnits"
                type="number"
                value={subSectionForm.hvacUnits}
                onChange={(e) => setSubSectionForm(prev => ({ ...prev, hvacUnits: Number(e.target.value) }))}
                placeholder="0"
                className="h-10"
                min="0"
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="subSectionNotes" className="mb-2 block">
              Observações Adicionais
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="subSectionNotes"
              value={subSectionForm.notes}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informações adicionais sobre o subsetor..."
              className="min-h-[80px] resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Gera o título do modal baseado no modo e tipo de localização
   */
  const getModalTitle = () => {
    const action = mode === 'create' ? 'Adicionar' : 'Editar';
    switch (type) {
      case 'company': return `${action} Empresa`;
      case 'sector': return `${action} Setor`;
      case 'subsection': return `${action} Subsetor`;
      default: return '';
    }
  };

  const getModalDescription = () => {
    switch (type) {
      case 'company': 
        return mode === 'create' 
          ? 'Cadastre uma nova empresa no sistema. Empresas são o nível mais alto na hierarquia de locais.'
          : 'Edite os dados da empresa. Altere as informações conforme necessário.';
      case 'sector': 
        return mode === 'create'
          ? 'Adicione um novo setor vinculado a uma empresa. Setores são áreas ou departamentos dentro de uma empresa.'
          : 'Edite os dados do setor. Modifique as informações conforme necessário.';
      case 'subsection': 
        return mode === 'create'
          ? 'Crie um novo subsetor vinculado a um setor. Subsetores são espaços específicos dentro de um setor.'
          : 'Edite os dados do subsetor. Ajuste as informações conforme necessário.';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-semibold">{getModalTitle()}</DialogTitle>
          <DialogDescription>
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Renderiza o formulário baseado no tipo de localização */}
          {type === 'company' && renderCompanyForm()}
          {type === 'sector' && renderSectorForm()}
          {type === 'subsection' && renderSubSectionForm()}
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {mode === 'create' ? 'Criar' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}