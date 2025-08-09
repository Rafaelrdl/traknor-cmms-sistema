import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProcedureFilters } from '@/components/procedure/ProcedureFilters';
import { ProcedureTable } from '@/components/procedure/ProcedureTable';
import { ProcedureModal } from '@/components/procedure/ProcedureModal';
import { ProcedureViewer } from '@/components/procedure/ProcedureViewer';
import { IfCanCreate } from '@/components/auth/IfCan';
import { 
  listProcedures, 
  listCategories, 
  filterProcedures,
  initializeStorage,
  createSampleFiles
} from '@/data/proceduresStore';
import { Procedure, ProcedureStatus } from '@/models/procedure';

export function ProceduresPage() {
  const [procedures, setProcedures] = useState(listProcedures());
  const [filteredProcedures, setFilteredProcedures] = useState(procedures);
  const [categories] = useState(listCategories());
  
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

  // Initialize storage and load procedures
  useEffect(() => {
    initializeStorage();
    createSampleFiles().catch(console.warn); // Create sample files for demo
    refreshProcedures();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const filtered = filterProcedures({
      category_id: filters.category_id,
      status: filters.status === 'Todos' ? undefined : filters.status,
      q: filters.q,
    });
    setFilteredProcedures(filtered);
  }, [procedures, filters]);

  const refreshProcedures = () => {
    setProcedures(listProcedures());
  };

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
    refreshProcedures();
    setModals({ create: false, edit: false, view: false });
    setSelectedProcedure(undefined);
  };

  const handleViewerClose = () => {
    setModals(prev => ({ ...prev, view: false }));
    // Refresh procedures when viewer closes to catch any version changes
    refreshProcedures();
  };

  // Calculate statistics
  const stats = {
    total: procedures.length,
    active: procedures.filter(p => p.status === 'Ativo').length,
    inactive: procedures.filter(p => p.status === 'Inativo').length,
    pdf: procedures.filter(p => p.file.type === 'pdf').length,
    md: procedures.filter(p => p.file.type === 'md').length,
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
            selectedCategory={filters.category_id}
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pdf} PDF • {stats.md} Markdown
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <div className="w-4 h-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <div className="w-4 h-4 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inactive > 0 ? 'Requer revisão' : 'Nenhum inativo'}
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

      {/* Results Summary */}
      {filteredProcedures.length !== procedures.length && (
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Exibindo {filteredProcedures.length} de {procedures.length} procedimentos
          </span>
        </div>
      )}

      {/* Procedures Table */}
      <Card>
        <CardContent className="p-0">
          <ProcedureTable
            procedures={filteredProcedures}
            categories={categories}
            onView={handleViewProcedure}
            onEdit={handleEditProcedure}
            onUpdate={refreshProcedures}
          />
        </CardContent>
      </Card>

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