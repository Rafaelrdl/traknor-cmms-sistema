import { Building2, MapPin, Users, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocation } from '@/contexts/LocationContext';
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
  } = useLocation();

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
            "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 rounded-md transition-colors",
            isSelected && "bg-primary/10 text-primary font-medium",
            depth > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => setSelectedNode(node)}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-level={depth + 1}
          aria-selected={isSelected}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="flex items-center justify-center p-0.5 hover:bg-muted rounded"
              aria-label={isExpanded ? "Collapse" : "Expand"}
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

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <Input
          placeholder="Search location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Tree */}
      <div 
        className="flex-1 overflow-auto p-2 space-y-1"
        role="tree"
        aria-label="Location hierarchy"
      >
        {filteredTree.length > 0 ? (
          filteredTree.map(node => renderTreeNode(node))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {searchTerm ? 'No locations found' : 'No locations available'}
          </div>
        )}
      </div>
    </div>
  );
}