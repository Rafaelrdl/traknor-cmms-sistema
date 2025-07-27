import { createContext, useContext, useState, ReactNode } from 'react';
import { useCompanies, useSectors, useSubSections } from '@/hooks/useData';

export interface LocationNode {
  id: string;
  name: string;
  type: 'company' | 'sector' | 'subsection';
  parentId?: string;
  children?: LocationNode[];
  data: any;
 

  setSelectedNode: (node: Locat
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

        const subSectionNodes: LocationNo
          name: subSection.name,
          parentI
        }));
   
          name: s
  

      });
      return {
        name: company.name,
        children: sectorNodes,

  };
  const tree = buildTree();
  // Filter tree based on search term

    return nodes.reduce((fil
      const hasMatchingChildren = node.chil
      if (matchesSearch || hasMatchin
        if (node.children) {
      
      }
      return filtered;
  };
  const filteredTree = filterTree(tree, searchTerm);
  const toggleExpanded = (no
      const newSet = new Set(pre
        newSet.delete(nodeId);
        newSet.add(nodeId);
      return newSet;
  };

    filteredTree
    expandedNodes,
    setSelectedNode,
    setSearchTerm

    <LocationContext.Provider value=
    </LocationContext.
};
































































