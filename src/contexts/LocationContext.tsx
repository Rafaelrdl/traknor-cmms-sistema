import { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationNode, Company, Sector, SubSection } from '@/types';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useData';

interface LocationContextType {
  selectedNode: LocationNode | null;
  expandedNodes: Set<string>;
  searchTerm: string;
  filteredTree: LocationNode[];
  setSelectedNode: (node: LocationNode | null) => void;
  toggleExpanded: (nodeId: string) => void;
  setSearchTerm: (term: string) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [companies] = useCompanies();
  const [sectors] = useSectors();
  const [subSections] = useSubSections();
  
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1'])); // Expand first company by default
  const [searchTerm, setSearchTerm] = useState('');

  // Build hierarchical tree structure
  const buildLocationTree = (): LocationNode[] => {
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

  // Filter tree based on search term
  const filterTree = (nodes: LocationNode[], term: string): LocationNode[] => {
    if (!term) return nodes;

    return nodes.reduce<LocationNode[]>((acc, node) => {
      const nameMatches = node.name.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = node.children ? filterTree(node.children, term) : [];
      
      if (nameMatches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      
      return acc;
    }, []);
  };

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

  const locationTree = buildLocationTree();
  const filteredTree = filterTree(locationTree, searchTerm);

  return (
    <LocationContext.Provider value={{
      selectedNode,
      expandedNodes,
      searchTerm,
      filteredTree,
      setSelectedNode,
      toggleExpanded,
      setSearchTerm
    }}>
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