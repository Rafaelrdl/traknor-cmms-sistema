import { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationNode, Company, Sector, SubSection } from '@/types';

interface LocationContextType {
  tree: LocationNode[];
  filteredTree: LocationNode[];
  selectedNode: LocationNode | null;
  expandedNodes: Set<string>;
}
  setSelectedNode: (node: LocationNode | null) => void;
  toggleExpanded: (nodeId: string) => void;
  setSearchTerm: (term: string) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

interface LocationProviderProps {
  children: ReactNode;
 

export function LocationProvider({ children }: LocationProviderProps) {
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const mockCompanies: Company[] = [
    {
      totalAre
      name: 'TechCorp Ltd',
      segment: 'Technology',
      cnpj: '12.345.678/0001-90',
    {
        zip: '01234-567',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Paulista, 1000'
      },
      responsible: 'João Silva',
      role: 'Facilities Manager',
      role: 'Operations Manager
      email: 'joao@techcorp.com',
      totalArea: 5000,
      occupants: 500,
      createdAt: '2
      notes: 'Main headquarters',

    },
    {
      id: '2',
      area: 3000,
      hvacUnits: 8
  ];
  const mockSubS
      id: '1',
      sectorId: '1',
      phone: '(11) 4
      area: 400,
      hv
    {
      name: 'QA Team',
      responsible: 'Roberto Oli
      email: 'roberto@techcorp.com',
      occupants: 30,
    },
      id: '3',
      sectorId: '2',
     
    

    {
     
      responsi
      email: 'jose@industria
      occupants: 80,
    }

    return mockCompanies.map(compa
      
        const sectorS
        const subS
      
     
          chil

          id: sector.
          type: 'sector' as const,
          data: sector,
        };

        id: company.
        type: 'com
      
    }


    if (!term.trim())
    return nodes.reduce<LocationN
      const filteredChildren = 
      if (matchesSearch || filteredCh
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

      
      return filtered;
    }, []);


  const filteredTree = filterTree(tree, searchTerm);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {

      }

    });


  const value: LocationContextType = {
    tree,

    selectedNode,
    expandedNodes,
    searchTerm,

    toggleExpanded,

  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );


export function useLocation() {
  const context = useContext(LocationContext);

    throw new Error('useLocation must be used within a LocationProvider');

  return context;
