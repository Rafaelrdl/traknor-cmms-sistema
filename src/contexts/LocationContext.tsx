import { createContext, useContext, useState, ReactNode } from 'react';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useData';
import type { LocationNode } from '@/types';

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

  const { data: companies = [] } = useCompanies();
  const { data: sectors = [] } = useSectors();
  const { data: subSections = [] } = useSubSections();

  const buildTree = (): LocationNode[] => {
    return companies.map(company => {
      const companySectors = sectors.filter(s => s.companyId === company.id);
      
      const sectorNodes: LocationNode[] = companySectors.map(sector => {
        const sectorSubSections = subSections.filter(sub => sub.sectorId === sector.id);
        
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
          children: subSectionNodes,
          data: sector,
        };
      });

      return {
        id: company.id,
        name: company.name,
        type: 'company' as const,
        children: sectorNodes,
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