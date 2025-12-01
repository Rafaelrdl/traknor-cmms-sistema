import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProcedureFilters } from '@/components/procedure/ProcedureFilters';
import { ProcedureTable } from '@/components/procedure/ProcedureTable';
import { ProcedureModal } from '@/components/procedure/ProcedureModal';
import { ProcedureViewer } from '@/components/procedure/ProcedureViewer';
import { IfCanCreate } from '@/components/auth/IfCan';
import { 
  useProcedures, 
  useProcedureCategories,
  useProcedureStats 
} from '@/hooks/useProceduresQuery';
import { Procedure, ProcedureCategory, ProcedureStatus } from '@/models/procedure';
import type { ApiProcedureListItem, ApiProcedureCategory } from '@/types/api';

// Helper para converter do formato API para o formato local (para compatibilidade com componentes existentes)
function apiProcedureToLocal(apiProcedure: ApiProcedureListItem): Procedure {
  return {
    id: String(apiProcedure.id),
    title: apiProcedure.title,
    description: '',
    category_id: apiProcedure.category ? String(apiProcedure.category) : null,
    status: apiProcedure.is_active || apiProcedure.status === 'ACTIVE' ? 'Ativo' : 'Inativo',
    tags: apiProcedure.tags || [],
    version: apiProcedure.version || 1,
    file: {
      id: String(apiProcedure.id),
      name: apiProcedure.title,
      type: apiProcedure.file_type === 'PDF' ? 'pdf' : 'md',
      size: 0,
    },
    created_at: apiProcedure.created_at,
    updated_at: apiProcedure.updated_at,
    // Campos adicionais da API para uso interno
    _apiData: apiProcedure,
  } as Procedure & { _apiData: ApiProcedureListItem };
}

function apiCategoryToLocal(apiCategory: ApiProcedureCategory): ProcedureCategory {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    color: apiCategory.color || '#6b7280',
  };
}

// Helper para converter status local para API
function localStatusToApi(status: ProcedureStatus | 'Todos'): 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED' | undefined {
  if (status === 'Todos') return undefined;
  return status === 'Ativo' ? 'ACTIVE' : 'INACTIVE';
}

export function ProceduresPage() {
  const [filters, setFilters] = useState({
    category_id: null as string | null,
    status: 'Todos' as ProcedureStatus | 'Todos',
    q: '',
  });
  
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    view: false,
  });
  
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | undefined>();

  // Fetch data from API
  const { 
    data: apiProcedures = [], 
    isLoading: loadingProcedures, 
    refetch: refetchProcedures 
  } = useProcedures({
    category: filters.category_id ? Number(filters.category_id) : undefined,
    status: localStatusToApi(filters.status),
    search: filters.q || undefined,
  });

  const { 
    data: apiCategories = [], 
    isLoading: loadingCategories 
  } = useProcedureCategories();

  const { data: stats } = useProcedureStats();

  // Convert API data to local format for existing components
  // Adiciona verificação defensiva para garantir que são arrays
  const procedures = useMemo(() => 
    Array.isArray(apiProcedures) ? apiProcedures.map(apiProcedureToLocal) : [], 
    [apiProcedures]
  );
  
  const categories = useMemo(() => 
    Array.isArray(apiCategories) ? apiCategories.map(apiCategoryToLocal) : [], 
    [apiCategories]
  );

  const isLoading = loadingProcedures || loadingCategories;

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      category_id: null,
      status: 'Todos',
      q: '',
    });
  };

  const handleViewProcedure = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setModals(prev => ({ ...prev, view: true }));
  };

  const handleEditProcedure = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setModals(prev => ({ ...prev, edit: true }));
  };

  const handleCloseModal = (type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }));
    if (type !== 'view') {
      setSelectedProcedure(undefined);
    }
  };

  const handleModalSuccess = () => {
    refetchProcedures();
    setModals({ create: false, edit: false, view: false });
    setSelectedProcedure(undefined);
  };

  const handleViewerClose = () => {
    setModals(prev => ({ ...prev, view: false }));
    refetchProcedures();
  };

  // Calculate statistics from API stats or local data
  const displayStats = {
    total: stats?.total ?? procedures.length,
    active: stats?.by_status?.active ?? procedures.filter(p => p.status === 'Ativo').length,
    inactive: (stats?.by_status?.inactive ?? 0) + (stats?.by_status?.draft ?? 0) + (stats?.by_status?.archived ?? 0) 
      || procedures.filter(p => p.status === 'Inativo').length,
    pdf: stats?.by_type?.pdf ?? procedures.filter(p => p.file.type === 'pdf').length,
    md: stats?.by_type?.markdown ?? procedures.filter(p => p.file.type === 'md').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procedimentos</h1>
        </div>
        <div className="flex gap-2">
          <IfCanCreate subject="procedure">
            <Button onClick={() => setModals(prev => ({ ...prev, create: true }))} data-testid="procedure-create">
              <Plus className="mr-2 h-4 w-4" />
              Novo Procedimento
            </Button>
          </IfCanCreate>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <ProcedureFilters
            categories={categories}
            selectedCategory={filters.category_id ?? undefined}
            selectedStatus={filters.status}
            searchQuery={filters.q}
            onCategoryChange={(categoryId) => handleFilterChange({ category_id: categoryId })}
            onStatusChange={(status) => handleFilterChange({ status })}
            onSearchChange={(q) => handleFilterChange({ q })}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.pdf} PDF • {displayStats.md} Markdown
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <div className="w-4 h-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.total > 0 ? Math.round((displayStats.active / displayStats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <div className="w-4 h-4 rounded-full bg-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.inactive > 0 ? 'Rascunho/Revisão' : 'Nenhum pendente'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando procedimentos...</span>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filters.q && (
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {procedures.length === 0 
              ? 'Nenhum procedimento encontrado' 
              : `Exibindo ${procedures.length} procedimento${procedures.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* Procedures Table */}
      {!isLoading && (
        <Card>
          <CardContent className="p-0">
            <ProcedureTable
              procedures={procedures}
              categories={categories}
              onView={handleViewProcedure}
              onEdit={handleEditProcedure}
              onUpdate={() => refetchProcedures()}
            />
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ProcedureModal
        isOpen={modals.create}
        onClose={() => handleCloseModal('create')}
        onSuccess={handleModalSuccess}
        categories={categories}
      />
      
      <ProcedureModal
        isOpen={modals.edit}
        onClose={() => handleCloseModal('edit')}
        onSuccess={handleModalSuccess}
        categories={categories}
        procedure={selectedProcedure}
      />

      <ProcedureViewer
        isOpen={modals.view}
        onClose={handleViewerClose}
        procedure={selectedProcedure}
        categories={categories}
      />
    </div>
  );
}