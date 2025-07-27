import { createContext, useContext, useState, ReactNode } from 'react';


interface LocationContextType {
  tree: LocationNode[];
  filteredTree: LocationNode[];
}
const LocationContext = creat
interface LocationPro
}
export function LocationProvider({ children
  const [expandedNodes, setExpandedNodes
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
      totalAre
      name: 'TechCorp Ltd',
      segment: 'Technology',
      cnpj: '12.345.678/0001-90',
      id: '2',
        zip: '01234-567',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Paulista, 1000'
      },
      responsible: 'João Silva',
      role: 'Facilities Manager',
      phone: '(11) 88888-8888',
      email: 'joao@techcorp.com',
      occupants: 500,
      phone: '(11) 66
      area: 2000,
      hvacUnits: 6
    {
     
      responsi
      email: 'pedro@industrial.com'
      occupants: 200,
    }

    {
      name: 'HR Department',
      responsible: '
      email: 'lucia@techcorp.com',
      oc
    },
      id: '2',
      sectorId: '1',
      phone: '(11) 33333-3333',
      area: 600,
      hvacUnits: 2
    {
      name: 'Frontend Team',
     
    

    }

  const buildT
      const companySecors = m
      const sectorNod
        
          id: subSection.id,
          type: 'subsection' as 
          data: s

          id: sect
      
     
        };

        id: company.i
        type: 'company' as const,
        data: company,
    });


  const filterTree

     
      
        const filteredNode = { .
          filteredNod
        filtered.push(filteredNode);
      
    }, []);


    setExpandedNode
     
    

    });

    tree,
    selectedNode,
    searchTerm,
    toggleExpanded,
  };
  return (
      {children}
  );

  cons
    t
  return conte
























    return mockCompanies.map(company => {
      const companySecors = mockSectors.filter(sector => sector.companyId === company.id);




























































































