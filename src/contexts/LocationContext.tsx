// Importações dos tipos e dados necessários
import { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationNode } from '@/types';
import { MOCK_COMPANIES, MOCK_SECTORS, MOCK_SUBSECTIONS } from '@/data/mockData';

/**
 * Interface que define o tipo do contexto de localização
 * Centraliza todo o estado e funções relacionadas ao menu de locais
 */
interface LocationContextType {
  tree: LocationNode[];                                    // Árvore completa de localizações
  filteredTree: LocationNode[];                           // Árvore filtrada pela busca
  selectedNode: LocationNode | null;                      // Nó atualmente selecionado
  expandedNodes: Set<string>;                             // Set com IDs dos nós expandidos
  searchTerm: string;                                     // Termo de busca atual
  setSelectedNode: (node: LocationNode | null) => void;   // Função para selecionar nó
  toggleExpanded: (nodeId: string) => void;              // Função para expandir/recolher nó
  setSearchTerm: (term: string) => void;                 // Função para atualizar busca
}

// Criação do contexto React
const LocationContext = createContext<LocationContextType | null>(null);

// Interface para as props do Provider
interface LocationProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de localização
 * Gerencia todo o estado relacionado ao menu hierárquico de locais
 */
export function LocationProvider({ children }: LocationProviderProps) {
  // Estados principais do contexto
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);  // Nó selecionado
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());   // Nós expandidos
  const [searchTerm, setSearchTerm] = useState('');                            // Termo de busca

  /**
   * Função auxiliar para construir a estrutura hierárquica da árvore
   * Transforma os dados planos em uma estrutura de árvore aninhada
   * @returns Array de nós raiz (empresas) com seus filhos (setores > subsetores)
   */
  const buildTree = (): LocationNode[] => {
    return MOCK_COMPANIES.map(company => {
      // Busca todos os setores desta empresa
      const companySectors = MOCK_SECTORS.filter(sector => sector.companyId === company.id);
      
      // Constrói os nós dos setores
      const sectorNodes: LocationNode[] = companySectors.map(sector => {
        // Busca todas as subseções deste setor
        const sectorSubSections = MOCK_SUBSECTIONS.filter(subSection => subSection.sectorId === sector.id);
        
        // Constrói os nós das subseções (folhas da árvore)
        const subSectionNodes: LocationNode[] = sectorSubSections.map(subSection => ({
          id: subSection.id,
          name: subSection.name,
          type: 'subsection' as const,
          parentId: sector.id,
          data: subSection,
          children: [] // Subseções são folhas, não têm filhos
        }));

        // Retorna o nó do setor com suas subseções como filhos
        return {
          id: sector.id,
          name: sector.name,
          type: 'sector' as const,
          parentId: company.id,
          data: sector,
          children: subSectionNodes
        };
      });

      // Retorna o nó da empresa com seus setores como filhos
      return {
        id: company.id,
        name: company.name,
        type: 'company' as const,
        data: company,
        children: sectorNodes
      };
    });
  };

  // Constrói a árvore completa
  const tree = buildTree();

  /**
   * Função auxiliar para filtrar a árvore com base no termo de busca
   * Busca recursivamente em todos os níveis da árvore
   * @param nodes - Nós para filtrar
   * @param term - Termo de busca
   * @returns Árvore filtrada contendo apenas nós que correspondem à busca
   */
  const filterTree = (nodes: LocationNode[], term: string): LocationNode[] => {
    if (!term.trim()) return nodes; // Se não há termo de busca, retorna a árvore completa

    return nodes.reduce<LocationNode[]>((filtered, node) => {
      // Verifica se o nome do nó atual corresponde à busca
      const matchesSearch = node.name.toLowerCase().includes(term.toLowerCase());
      
      // Filtra recursivamente os filhos
      const filteredChildren = node.children ? filterTree(node.children, term) : [];
      
      // Inclui o nó se ele ou algum de seus filhos corresponde à busca
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

  // Aplica o filtro de busca na árvore
  const filteredTree = filterTree(tree, searchTerm);

  /**
   * Função para alternar o estado expandido/recolhido de um nó
   * @param nodeId - ID do nó para expandir/recolher
   */
  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId); // Remove se já estava expandido (recolhe)
      } else {
        next.add(nodeId);    // Adiciona se estava recolhido (expande)
      }
      return next;
    });
  };

  // Objeto com todos os valores e funções que serão disponibilizados pelo contexto
  const value: LocationContextType = {
    tree,              // Árvore completa de localizações
    filteredTree,      // Árvore filtrada pela busca
    selectedNode,      // Nó atualmente selecionado
    expandedNodes,     // Set com IDs dos nós expandidos
    searchTerm,        // Termo de busca atual
    setSelectedNode,   // Função para selecionar um nó
    toggleExpanded,    // Função para expandir/recolher nó
    setSearchTerm,     // Função para atualizar termo de busca
  };

  // Provider que disponibiliza o contexto para componentes filhos
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook personalizado para usar o contexto de localização
 * Deve ser usado dentro de um LocationProvider
 * @returns Objeto com estado e funções do contexto de localização
 * @throws Error se usado fora do LocationProvider
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}