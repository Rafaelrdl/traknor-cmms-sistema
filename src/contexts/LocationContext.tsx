import { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationNode, Company, Sector, SubSection } from '@/types';

interface LocationContextType {
  tree: LocationNode[];
  filteredTree: LocationNode[];
  selectedNode: LocationNode | null;
  expandedNodes: Set<string>;
  searchTerm: string;
  setSelectedNode: (node: LocationNode | null) => void;
  toggleExpanded: (nodeId: string) => void;
  setSearchTerm: (term: string) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  /* TODO: replace mocks with real API calls */
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Industrial',
      segment: 'Tecnologia',
      cnpj: '12.345.678/0001-90',
      address: {
        zip: '01310-100',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Paulista, 1000'
      },
      responsible: 'Maria Santos',
      role: 'Gerente de Facilities',
      phone: '(11) 98765-4321',
      email: 'maria@techcorp.com',
      totalArea: 5000,
      occupants: 150,
      hvacUnits: 12,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Industrial Corp',
      segment: 'Manufatura',
      cnpj: '98.765.432/0001-10',
      address: {
        zip: '04567-000',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Rua Industrial, 500'
      },
      responsible: 'João Silva',
      role: 'Gerente de Planta',
      phone: '(11) 91234-5678',
      email: 'joao@industrial.com',
      totalArea: 10000,
      occupants: 300,
      hvacUnits: 25,
      createdAt: '2024-01-10'
    }
  ];

  const mockSectors: Sector[] = [
    {
      id: '1',
      name: 'Setor Administrativo',
      companyId: '1',
      responsible: 'Ana Costa',
      phone: '(11) 91111-1111',
      email: 'ana@techcorp.com',
      area: 1500,
      occupants: 50,
      hvacUnits: 4
    },
    {
      id: '2',
      name: 'Departamento de TI',
      companyId: '1',
      responsible: 'Carlos Lima',
      phone: '(11) 92222-2222',
      email: 'carlos@techcorp.com',
      area: 800,
      occupants: 30,
      hvacUnits: 3
    },
    {
      id: '3',
      name: 'Chão de Fábrica',
      companyId: '2',
      responsible: 'Roberto Oliveira',
      phone: '(11) 93333-3333',
      email: 'roberto@industrial.com',
      area: 6000,
      occupants: 200,
      hvacUnits: 15
    }
  ];

  const mockSubSections: SubSection[] = [
    {
      id: '1',
      name: 'Recepção',
      sectorId: '1',
      responsible: 'Lucia Ferreira',
      phone: '(11) 94444-4444',
      email: 'lucia@techcorp.com',
      area: 200,
      occupants: 5,
      hvacUnits: 1
    },
    {
      id: '2',
      name: 'Salas de Reunião',
      sectorId: '1',
      responsible: 'Pedro Santos',
      phone: '(11) 95555-5555',
      email: 'pedro@techcorp.com',
      area: 300,
      occupants: 20,
      hvacUnits: 2
    },
    {
      id: '3',
      name: 'Sala de Servidores',
      sectorId: '2',
      responsible: 'Ana Tech',
      phone: '(11) 96666-6666',
      email: 'ana.tech@techcorp.com',
      area: 100,
      occupants: 5,
      hvacUnits: 2
    },
    {
      id: '4',
      name: 'Linha de Montagem A',
      sectorId: '3',
      responsible: 'Mario Silva',
      phone: '(11) 97777-7777',
      email: 'mario@industrial.com',
      area: 2000,
      occupants: 75,
      hvacUnits: 6
    },
    {
      id: '5',
      name: 'Controle de Qualidade',
      sectorId: '3',
      responsible: 'Elena Rodriguez',
      phone: '(11) 98888-8888',
      email: 'elena@industrial.com',
      area: 500,
      occupants: 25,
      hvacUnits: 2
    }
  ];

  /** Helper to build hierarchical tree structure */
  const buildTree = (): LocationNode[] => {
    return mockCompanies.map(company => {
      const companySectors = mockSectors.filter(sector => sector.companyId === company.id);
      
      const sectorNodes: LocationNode[] = companySectors.map(sector => {
        const sectorSubSections = mockSubSections.filter(subSection => subSection.sectorId === sector.id);
        
        const subSectionNodes: LocationNode[] = sectorSubSections.map(subSection => ({
          id: subSection.id,
          name: subSection.name,
          type: 'subsection' as const,
          parentId: sector.id,
          data: subSection,
          children: []
        }));

        return {
          id: sector.id,
          name: sector.name,
          type: 'sector' as const,
          parentId: company.id,
          data: sector,
          children: subSectionNodes
        };
      });

      return {
        id: company.id,
        name: company.name,
        type: 'company' as const,
        data: company,
        children: sectorNodes
      };
    });
  };

  const tree = buildTree();

  /** Helper to filter tree by search term */
  const filterTree = (nodes: LocationNode[], term: string): LocationNode[] => {
    if (!term.trim()) return nodes;

    return nodes.reduce<LocationNode[]>((filtered, node) => {
      const matchesSearch = node.name.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = node.children ? filterTree(node.children, term) : [];
      
      if (matchesSearch || filteredChildren.length > 0) {
        const filteredNode = {
          ...node,
          children: filteredChildren
        };
        filtered.push(filteredNode);
      }
      
      return filtered;
    }, []);
  };

  const filteredTree = filterTree(tree, searchTerm);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const value: LocationContextType = {
    tree,
    filteredTree,
    selectedNode,
    expandedNodes,
    searchTerm,
    setSelectedNode,
    toggleExpanded,
    setSearchTerm,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}