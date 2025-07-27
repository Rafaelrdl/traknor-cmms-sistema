import { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationNode } from '@/types';

  filteredTree: LocationNode[];
  expandedNod
  setSelectedNo
  type: 'company' | 'sector' | 'subsection';
  parentId?: string;
  children?: LocationNode[];
  data: any;
}

  children: ReactNode;
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

          children: subSectionNod
        };


        type: 'company' as const,
        data: company,
    });


  const filterTree = (nodes: LocationNode[], searc

      const matchesSearch = node.name.toLowerCase().in

        const filteredNode = { ...node };
          filteredNode.children = fil
        filtered.push(filteredNode);
      
    }, []);


    setExpandedNodes(prev => {
      if (newSet.has(nodeId)
      } else {
      }
    });
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

































