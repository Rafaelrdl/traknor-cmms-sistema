// Importações dos componentes de UI e hooks necessários
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useDataTemp';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
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
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Primeira linha: Nome e Segmento */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome da Empresa *</Label>
          <Input
            id="name"
            value={companyForm.name}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome da Empresa"
            required
          />
        </div>
        <div>
          <Label htmlFor="segment">Segmento *</Label>
          <Input
            id="segment"
            value={companyForm.segment}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, segment: e.target.value }))}
            placeholder="ex.: Varejo, Corporativo"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cnpj">CNPJ *</Label>
        <Input
          id="cnpj"
          value={companyForm.cnpj}
          onChange={(e) => setCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
          placeholder="00.000.000/0000-00"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Endereço *</Label>
        <div>
          <Input
            value={companyForm.address?.fullAddress || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, fullAddress: e.target.value }
            }))}
            placeholder="Endereço Completo"
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
            placeholder="CEP"
          />
          <Input
            value={companyForm.address?.city || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, city: e.target.value }
            }))}
            placeholder="Cidade"
          />
          <Input
            value={companyForm.address?.state || ''}
            onChange={(e) => setCompanyForm(prev => ({ 
              ...prev, 
              address: { ...prev.address!, state: e.target.value }
            }))}
            placeholder="Estado"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="responsible">Responsável *</Label>
          <Input
            id="responsible"
            value={companyForm.responsible}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, responsible: e.target.value }))}
            placeholder="Nome Completo"
            required
          />
        </div>
        <div>
          <Label htmlFor="role">Cargo *</Label>
          <Input
            id="role"
            value={companyForm.role}
            onChange={(e) => setCompanyForm(prev => ({ ...prev, role: e.target.value }))}
            placeholder="ex.: Gerente Geral"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefone *</Label>
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
            placeholder="email@empresa.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="totalArea">Área Total (m²) *</Label>
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
          <Label htmlFor="occupants">Ocupantes *</Label>
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
          <Label htmlFor="hvacUnits">Unidades HVAC *</Label>
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
        <Label htmlFor="notes">Observações Adicionais</Label>
        <Textarea
          id="notes"
          value={companyForm.notes}
          onChange={(e) => setCompanyForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Informações adicionais..."
          rows={3}
        />
      </div>
    </div>
  );

  /**
   * Renderiza o formulário específico para setores
   * Inclui seleção de empresa, dados de contato e informações operacionais
   */
  const renderSectorForm = () => (
    <div className="space-y-4">
      {/* Nome do setor */}
      <div>
        <Label htmlFor="sectorName">Nome do Setor *</Label>
        <Input
          id="sectorName"
          value={sectorForm.name}
          onChange={(e) => setSectorForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nome do Setor"
          required
        />
      </div>

      <div>
        <Label htmlFor="companySelect">Empresa *</Label>
        <Select 
          value={sectorForm.companyId} 
          onValueChange={(value) => setSectorForm(prev => ({ ...prev, companyId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-company">Selecionar empresa</SelectItem>
            {(companies || []).map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sectorResponsible">Responsável *</Label>
          <Input
            id="sectorResponsible"
            value={sectorForm.responsible}
            onChange={(e) => setSectorForm(prev => ({ ...prev, responsible: e.target.value }))}
            placeholder="Nome Completo"
            required
          />
        </div>
        <div>
          <Label htmlFor="sectorPhone">Telefone *</Label>
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
          placeholder="email@empresa.com"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sectorArea">Área (m²) *</Label>
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
          <Label htmlFor="sectorOccupants">Ocupantes *</Label>
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
          <Label htmlFor="sectorHvacUnits">Unidades HVAC *</Label>
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
        <Label htmlFor="sectorNotes">Observações Adicionais</Label>
        <Textarea
          id="sectorNotes"
          value={sectorForm.notes}
          onChange={(e) => setSectorForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Informações adicionais..."
          rows={3}
        />
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="subSectionName">Nome do Subsetor *</Label>
          <Input
            id="subSectionName"
            value={subSectionForm.name}
            onChange={(e) => setSubSectionForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome do Subsetor"
            required
          />
        </div>

        <div>
          <Label htmlFor="companySelectSub">Empresa *</Label>
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
            <SelectTrigger>
              <SelectValue placeholder="Selecionar empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-company-sub">Selecionar empresa</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sectorSelectSub">Setor *</Label>
          <Select 
            value={subSectionForm.sectorId} 
            onValueChange={(value) => setSubSectionForm(prev => ({ ...prev, sectorId: value }))}
            disabled={!sectorForm.companyId || sectorForm.companyId === 'no-company'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-sector">Selecionar setor</SelectItem>
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
            <Label htmlFor="subSectionResponsible">Responsável *</Label>
            <Input
              id="subSectionResponsible"
              value={subSectionForm.responsible}
              onChange={(e) => setSubSectionForm(prev => ({ ...prev, responsible: e.target.value }))}
              placeholder="Nome Completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="subSectionPhone">Telefone *</Label>
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
            placeholder="email@empresa.com"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="subSectionArea">Área (m²) *</Label>
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
            <Label htmlFor="subSectionOccupants">Ocupantes *</Label>
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
            <Label htmlFor="subSectionHvacUnits">Unidades HVAC *</Label>
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
          <Label htmlFor="subSectionNotes">Observações Adicionais</Label>
          <Textarea
            id="subSectionNotes"
            value={subSectionForm.notes}
            onChange={(e) => setSubSectionForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Informações adicionais..."
            rows={3}
          />
        </div>
      </div>
    );
  };

  /**
   * Gera o título do modal baseado no modo e tipo de localização
   */
  const getTitle = () => {
    const action = mode === 'create' ? 'Adicionar' : 'Editar';
    const typeName = type === 'company' ? 'Empresa' : 
                     type === 'sector' ? 'Setor' : 'Subsetor';
    return `${action} ${typeName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Renderiza o formulário baseado no tipo de localização */}
        {type === 'company' && renderCompanyForm()}
        {type === 'sector' && renderSectorForm()}
        {type === 'subsection' && renderSubSectionForm()}

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-4">
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