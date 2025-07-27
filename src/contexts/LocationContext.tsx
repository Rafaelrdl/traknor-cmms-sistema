import { createContext, useContext, useState, ReactNode } from 'react';


/** Context typing */
interface LocationContextType {
  tree: LocationNode[];
  filteredTree: LocationNode[];
  selectedNode: LocationNode | null;
  setSearchTerm: (term: strin
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

  /* TODO: replace mocks with real API calls */
  const mockCompanies: Company[] = [
    {
      id: '1',
      hvacUnits: 12,
      segment: 'Technology',
      cnpj: '12.345.678/0001-90',
      address: {
      name: 'Industrial C
        city: 'São Paulo',
      address: {
        fullAddress: 'Av. Paulista, 1000'
      },
      responsible: 'João Silva',
      role: 'Facilities Manager',
      phone: '(11) 98765-4321',
      email: 'maria@industrial.co
      totalArea: 5000,
      hvacUnits: 20,
      hvacUnits: 12,
    }
      createdAt: '2024-01-15'
      
     
      phone: '
      area: 6000,
      hvacUnits: 12
  ];
  const mockSubS
      id: '1',
      sectorId: '1',
      phone: '(11) 4
      area: 1200,
      hv
    {
      name: 'Infrastructure Team'
      responsible: 'Roberto Oli
      email: 'roberto@techcorp.com',
      occupants: 60,
    },
      id: '3',
      sectorId: '2',
      phone: '(11) 22222-2222
     
    

      name: 'Assembly Line A',
     
      email: '
      occupants: 75,
    },
      id: '5',
      sectorId: '3',
      phone: '(11) 88888-8888',
      area: 1500,
      hvacUnits: 3
  ];
  /** 
    r
      
        const sectorSubSection
        const subSect
          name: subSection.name
          parentId: sector.id,
          children: []

          id: sector
          type: 's
      
     

        id: company.id,
        type: 'compan
        children: sectorNodes
    });


  const filterTree = 

     
    

          children: filteredChildren
     
      
    }, []);


    setExpandedNodes(prev => {
      if (next.has(nodeId)) {
      } else {
      }
    });

    t
    selectedNo
    searchTerm,
    toggleExpanded,
  };
  return (
      {children}
  );

  const context = 
    th
  ret





























































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