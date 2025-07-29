import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Search, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function ProceduresPage() {
  const procedures = [
    {
      id: 1,
      title: 'Procedimento de Limpeza de Filtros HVAC',
      category: 'Manutenção Preventiva',
      version: '2.1',
      status: 'Ativo',
      lastUpdated: '2024-01-15',
      description: 'Procedimento padrão para limpeza e substituição de filtros em sistemas de ar condicionado.',
    },
    {
      id: 2,
      title: 'Inspeção de Compressores',
      category: 'Manutenção Preventiva',
      version: '1.3',
      status: 'Ativo',
      lastUpdated: '2024-01-10',
      description: 'Checklist completo para inspeção de compressores e identificação de problemas.',
    },
    {
      id: 3,
      title: 'Manutenção Corretiva - Vazamentos',
      category: 'Manutenção Corretiva',
      version: '1.0',
      status: 'Em Revisão',
      lastUpdated: '2024-01-08',
      description: 'Procedimentos para identificação e reparo de vazamentos em sistemas HVAC.',
    },
    {
      id: 4,
      title: 'Calibração de Termostatos',
      category: 'Manutenção Preventiva',
      version: '1.2',
      status: 'Ativo',
      lastUpdated: '2024-01-05',
      description: 'Procedimento para calibração e ajuste de termostatos digitais e analógicos.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procedimentos</h1>
          <p className="text-muted-foreground">
            Gerencie e acesse procedimentos operacionais padronizados
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Procedimento
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar procedimentos..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Categoria
              </Button>
              <Button variant="outline" size="sm">
                Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Procedimentos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">
              83% do total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            <Badge variant="outline" className="h-4 w-4 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Pendente aprovação
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obsoletos</CardTitle>
            <Badge variant="destructive" className="h-4 w-4 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Requer atualização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Procedures List */}
      <div className="grid gap-4">
        {procedures.map((procedure) => (
          <Card key={procedure.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{procedure.title}</CardTitle>
                  <CardDescription>{procedure.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Categoria: {procedure.category}</span>
                  <span>Versão: {procedure.version}</span>
                  <span>Atualizado: {procedure.lastUpdated}</span>
                </div>
                <Badge 
                  variant={procedure.status === 'Ativo' ? 'default' : procedure.status === 'Em Revisão' ? 'secondary' : 'destructive'}
                >
                  {procedure.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}