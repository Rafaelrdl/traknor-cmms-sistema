import { useState, useRef, useEffect } from 'react';
import { Building2, MapPin, Users, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import type { LocationNode } from '@/types';

export function LocationTree() {
  const { 
    filteredTree, 
    selectedNode, 
    expandedNodes, 
    searchTerm,
    setSelectedNode, 
    toggleExpanded, 
    setSearchTerm 
  } = useLocationContext();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileTreeRef = useRef<HTMLDivElement>(null);

  // Close mobile tree on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the tree for accessibility
      mobileTreeRef.current?.focus();
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMobileOpen]);

  // Close mobile tree when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileTreeRef.current && !mobileTreeRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileOpen]);

  const getNodeIcon = (type: LocationNode['type']) => {
    switch (type) {
      case 'company':
        return <Building2 className="h-4 w-4" />;
      case 'sector':
        return <MapPin className="h-4 w-4" />;
      case 'subsection':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderTreeNode = (node: LocationNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="w-full">
        <div
          className={cn(
            "tree-node flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors focus-ring",
            isSelected && "tree-node-selected bg-primary/10 text-primary font-medium",
            !isSelected && "hover:bg-muted/50",
            depth > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => {
            setSelectedNode(node);
            // Close mobile tree when item is selected
            if (window.innerWidth < 1024) {
              setIsMobileOpen(false);
            }
          }}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-level={depth + 1}
          aria-selected={isSelected}
          tabIndex={isSelected ? 0 : -1}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="flex items-center justify-center p-0.5 hover:bg-muted rounded"
              aria-label={isExpanded ? "Recolher" : "Expandir"}
              tabIndex={-1}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          {getNodeIcon(node.type)}
          <span className="truncate">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Desktop tree component
  const DesktopTree = () => (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <Input
          placeholder="Buscar localização"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
          aria-label="Buscar localização"
        />
      </div>

      {/* Tree */}
      <div 
        className="flex-1 overflow-auto p-2 space-y-1"
        role="tree"
        aria-label="Hierarquia de localizações"
      >
        {filteredTree.length > 0 ? (
          filteredTree.map(node => renderTreeNode(node))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {searchTerm ? 'Nenhuma localização encontrada' : 'Nenhuma localização disponível'}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile tree component
  const MobileTree = () => (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        onClick={() => setIsMobileOpen(true)}
        className="btn-press flex items-center gap-2 w-full justify-start"
        aria-label="Abrir hierarquia de localizações"
      >
        <Menu className="h-4 w-4" />
        <span className="mobile-truncate">
          {selectedNode ? selectedNode.name : 'Selecionar localização'}
        </span>
      </Button>

      {/* Mobile popover overlay */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 modal-backdrop bg-background/80"
            aria-hidden="true"
          />
          
          {/* Mobile tree panel */}
          <div 
            ref={mobileTreeRef}
            className="fixed inset-x-4 top-20 z-50 max-h-[70vh] bg-card border rounded-lg shadow-lg animate-in"
            role="dialog"
            aria-modal="true"
            aria-label="Seletor de localização"
            tabIndex={-1}
          >
            <div className="flex flex-col h-full max-h-[70vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg">Selecionar Localização</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Fechar seletor"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b">
                <Input
                  placeholder="Buscar localização"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                  aria-label="Buscar localização"
                  autoFocus
                />
              </div>

              {/* Tree */}
              <div 
                className="flex-1 overflow-auto p-2 space-y-1"
                role="tree"
                aria-label="Hierarquia de localizações"
              >
                {filteredTree.length > 0 ? (
                  filteredTree.map(node => renderTreeNode(node))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhuma localização encontrada' : 'Nenhuma localização disponível'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: Always show tree */}
      <div className="hidden lg:contents">
        <DesktopTree />
      </div>
      
      {/* Mobile: Show toggle button and modal */}
      <div className="lg:hidden">
        <MobileTree />
      </div>
    </>
  );
}