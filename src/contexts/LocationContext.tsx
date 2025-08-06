import { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationNode, Company, Sector, SubSection } from '@/types';
import { MOCK_COMPANIES, MOCK_SECTORS, MOCK_SUBSECTIONS } from '@/data/mockData';

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

  /** Helper to build hierarchical tree structure */
  const buildTree = (): LocationNode[] => {
    return MOCK_COMPANIES.map(company => {
      const companySectors = MOCK_SECTORS.filter(sector => sector.companyId === company.id);
      
      const sectorNodes: LocationNode[] = companySectors.map(sector => {
        const sectorSubSections = MOCK_SUBSECTIONS.filter(subSection => subSection.sectorId === sector.id);
        
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