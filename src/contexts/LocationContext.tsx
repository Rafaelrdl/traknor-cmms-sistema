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
      totalArea: 5000,
      occupants: 200,
      hvacUnits: 15,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Industrial Solutions',
      segment: 'Manufacturing',
      cnpj: '98.765.432/0001-10',
      address: {
        zip: '09876-543',
        city: 'São Bernardo do Campo',
        state: 'SP',
        fullAddress: 'Rua Industrial, 500'
      },
      responsible: 'Maria Santos',
      role: 'Operations Manager',
      phone: '(11) 88888-8888',
      email: 'maria@industrial.com',
      totalArea: 12000,
      occupants: 500,
      hvacUnits: 30,
      createdAt: '2024-01-01'
    }
  ];

  const mockSectors: Sector[] = [
    {
      id: '1',
      name: 'Administration',
      companyId: '1',
      responsible: 'Ana Costa',
      phone: '(11) 77777-7777',
      email: 'ana@techcorp.com',
      area: 1500,
      occupants: 50,
      hvacUnits: 5
    },
    {
      id: '2',
      name: 'Development',
      companyId: '1',
      responsible: 'Carlos Lima',
      phone: '(11) 66666-6666',
      email: 'carlos@techcorp.com',
      area: 2000,
      occupants: 80,
      hvacUnits: 6
    },
    {
      id: '3',
      name: 'Production Line A',
      companyId: '2',
      responsible: 'Pedro Oliveira',
      phone: '(11) 55555-5555',
      email: 'pedro@industrial.com',
      area: 6000,
      occupants: 200,
      hvacUnits: 15
    }
  ];

  const mockSubSections: SubSection[] = [
    {
      id: '1',
      name: 'HR Department',
      sectorId: '1',
      responsible: 'Lucia Ferreira',
      phone: '(11) 44444-4444',
      email: 'lucia@techcorp.com',
      area: 500,
      occupants: 15,
      hvacUnits: 2
    },
    {
      id: '2',
      name: 'Finance Department',
      sectorId: '1',
      responsible: 'Roberto Silva',
      phone: '(11) 33333-3333',
      email: 'roberto@techcorp.com',
      area: 600,
      occupants: 20,
      hvacUnits: 2
    },
    {
      id: '3',
      name: 'Frontend Team',
      sectorId: '2',
      responsible: 'Fernanda Costa',
      phone: '(11) 22222-2222',
      email: 'fernanda@techcorp.com',
      area: 800,
      occupants: 30,
      hvacUnits: 3
    }
  ];

  // Build hierarchical tree structure
  const buildTree = (): LocationNode[] => {
    return mockCompanies.map(company => {
      const companySecors = mockSectors.filter(sector => sector.companyId === company.id);
      
      const sectorNodes: LocationNode[] = companySecors.map(sector => {
        const sectorSubSections = mockSubSections.filter(subSection => subSection.sectorId === sector.id);
        
        const subSectionNodes: LocationNode[] = sectorSubSections.map(subSection => ({
          id: subSection.id,
          name: subSection.name,
          type: 'subsection' as const,
          parentId: sector.id,
          data: subSection,
        }));

        return {
          id: sector.id,
          name: sector.name,
          type: 'sector' as const,
          parentId: company.id,
          children: subSectionNodes.length > 0 ? subSectionNodes : undefined,
          data: sector,
        };
      });

      return {
        id: company.id,
        name: company.name,
        type: 'company' as const,
        children: sectorNodes.length > 0 ? sectorNodes : undefined,
        data: company,
      };
    });
  };

  const tree = buildTree();

  // Filter tree based on search term
  const filterTree = (nodes: LocationNode[], searchTerm: string): LocationNode[] => {
    if (!searchTerm) return nodes;

    return nodes.reduce((filtered: LocationNode[], node) => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasMatchingChildren = node.children && filterTree(node.children, searchTerm).length > 0;
      
      if (matchesSearch || hasMatchingChildren) {
        const filteredNode = { ...node };
        if (node.children) {
          filteredNode.children = filterTree(node.children, searchTerm);
        }
        filtered.push(filteredNode);
      }
      
      return filtered;
    }, []);
  };

  const filteredTree = filterTree(tree, searchTerm);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
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