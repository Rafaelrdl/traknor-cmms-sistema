import { createContext, useContext, useState, ReactNode } from 'react';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useData
interface LocationContextType {

interface LocationContextType {
  toggleExpanded: (nodeId: string) =
}
const LocationContext
  filteredTree: LocationNode[];
  setSelectedNode: (node: LocationNode | null) => void;
  toggleExpanded: (nodeId: string) => void;
  setSearchTerm: (term: string) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

        
          id: subSection.id,
          type: 'subsection' as c
          data: subSection
  
          id: sector.id,
          type: 'sector' as const,
          children: subSectionNodes,


        id: company.id,
        type: 'company' as const,
        data: company
    })

  const filterTree = (nodes: LocationNode[], term: string): LocationNode[] => {
        
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




















































