import { createContext, useContext, useState, ReactNode } from 'react';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useData';

export interface LocationNode {
  id: string;
  name: string;
  type: 'company' | 'sector' | 'subsection';
  parentId?: string;
  children?: LocationNode[];
  data: any;
}

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

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const { data: companies = [] } = useCompanies();
  const { data: sectors = [] } = useSectors();
  const { data: subSections = [] } = useSubSections();

  // Build hierarchical tree
  const buildTree = (): LocationNode[] => {
    return companies.map(company => {
      const companySectors = sectors.filter(sector => sector.companyId === company.id);
      
      const sectorNodes: LocationNode[] = companySectors.map(sector => {
        const sectorSubSections = subSections.filter(subSection => subSection.sectorId === sector.id);
        
        const subSectionNodes: LocationNode[] = sectorSubSections.map(subSection => ({
          id: subSection.id,
          name: subSection.name,
          type: 'subsection' as const,
          parentId: sector.id,
          data: subSection
        }));

        return {
          id: sector.id,
          name: sector.name,
          type: 'sector' as const,
          parentId: company.id,
          children: subSectionNodes,
          data: sector
        };
      });

      return {
        id: company.id,
        name: company.name,
        type: 'company' as const,
        children: sectorNodes,
        data: company
      };
    });
  };

  const tree = buildTree();

  // Filter tree based on search term
  const filterTree = (nodes: LocationNode[], term: string): LocationNode[] => {
    if (!term) return nodes;

    return nodes.reduce((filtered: LocationNode[], node) => {
      const matchesSearch = node.name.toLowerCase().includes(term.toLowerCase());
      const hasMatchingChildren = node.children && filterTree(node.children, term).length > 0;

      if (matchesSearch || hasMatchingChildren) {
        const filteredNode = { ...node };
        if (node.children) {
          filteredNode.children = filterTree(node.children, term);
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
    setSearchTerm
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};