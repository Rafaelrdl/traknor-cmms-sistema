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

  // Mock data - replace with actual API calls
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Ltd',
      segment: 'Technology',
      cnpj: '12.345.678/0001-90',
      address: {
        zip: '01234-567',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Paulista, 1000'
      },
      responsible: 'João Silva',
      role: 'Facilities Manager',
      phone: '(11) 99999-9999',
      email: 'joao@techcorp.com',
      totalArea: 3000,
      occupants: 500,
      hvacUnits: 8,
      notes: 'Main headquarters',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Industrial Solutions Corp',
      segment: 'Manufacturing',
      cnpj: '98.765.432/0001-10',
      address: {
        zip: '04567-890',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Rua Industrial, 500'
      },
      responsible: 'Pedro Santos',
      role: 'Operations Manager',
      phone: '(11) 88888-8888',
      email: 'pedro@industrial.com',
      totalArea: 5000,
      occupants: 200,
      hvacUnits: 12,
      createdAt: '2024-02-01T14:30:00Z'
    }
  ];

  const mockSectors: Sector[] = [
    {
      id: '1',
      name: 'IT Department',
      companyId: '1',
      responsible: 'Maria Costa',
      phone: '(11) 77777-7777',
      email: 'maria@techcorp.com',
      area: 800,
      occupants: 120,
      hvacUnits: 3
    },
    {
      id: '2',
      name: 'HR Department',
      companyId: '1',
      responsible: 'Lúcia Fernandes',
      phone: '(11) 66666-6666',
      email: 'lucia@techcorp.com',
      area: 400,
      occupants: 50,
      hvacUnits: 2
    },
    {
      id: '3',
      name: 'Production Floor',
      companyId: '2',
      responsible: 'Carlos Lima',
      phone: '(11) 55555-5555',
      email: 'carlos@industrial.com',
      area: 3000,
      occupants: 150,
      hvacUnits: 8
    }
  ];

  const mockSubSections: SubSection[] = [
    {
      id: '1',
      name: 'Development Team',
      sectorId: '1',
      responsible: 'Ana Silva',
      phone: '(11) 44444-4444',
      email: 'ana@techcorp.com',
      area: 400,
      occupants: 60,
      hvacUnits: 2
    },
    {
      id: '2',
      name: 'QA Team',
      sectorId: '1',
      responsible: 'Roberto Oliveira',
      phone: '(11) 33333-3333',
      email: 'roberto@techcorp.com',
      area: 200,
      occupants: 30,
      hvacUnits: 1
    },
    {
      id: '3',
      name: 'Recruitment',
      sectorId: '2',
      responsible: 'Patricia Santos',
      phone: '(11) 22222-2222',
      email: 'patricia@techcorp.com',
      area: 200,
      occupants: 25,
      hvacUnits: 1
    },
    {
      id: '4',
      name: 'Assembly Line A',
      sectorId: '3',
      responsible: 'José Machado',
      phone: '(11) 11111-1111',
      email: 'jose@industrial.com',
      area: 1500,
      occupants: 80,
      hvacUnits: 4
    }
  ];

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