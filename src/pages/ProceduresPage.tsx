import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NewProcedureModal } from '@/components/NewProcedureModal';
import { ProcedureViewModal } from '@/components/ProcedureViewModal';
import { toast } from 'sonner';

export function ProceduresPage() {
  const [procedures, setProcedures] = useState([
    {
      id: 1,
      title: 'Procedimento de Limpeza de Filtros HVAC',
      category: 'Manutenção Preventiva',
      version: '2.1',
      status: 'Ativo',
      lastUpdated: '2024-01-15',
      description: 'Procedimento padrão para limpeza e substituição de filtros em sistemas de ar condicionado.',
      tags: ['filtros', 'limpeza', 'hvac'],
      priority: 'medium',
      estimatedTime: '30 minutos',
      requiredTools: 'Chaves de fenda, aspirador, filtros novos, EPIs',
      safetyNotes: 'Sempre desligue o sistema antes de iniciar. Use EPIs adequados.',
    },
    {
      id: 2,
      title: 'Inspeção de Compressores',
      category: 'Manutenção Preventiva',
      version: '1.3',
      status: 'Ativo',
      lastUpdated: '2024-01-10',
      description: 'Checklist completo para inspeção de compressores e identificação de problemas.',
      tags: ['compressor', 'inspeção', 'diagnóstico'],
      priority: 'high',
      estimatedTime: '45 minutos',
      requiredTools: 'Multímetro, manômetro, chaves diversas',
      safetyNotes: 'Cuidado com pressão do sistema. Verifique vazamentos.',
    },
    {
      id: 3,
      title: 'Manutenção Corretiva - Vazamentos',
      category: 'Manutenção Corretiva',
      version: '1.0',
      status: 'Em Revisão',
      lastUpdated: '2024-01-08',
      description: 'Procedimentos para identificação e reparo de vazamentos em sistemas HVAC.',
      tags: ['vazamento', 'reparo', 'emergência'],
      priority: 'critical',
      estimatedTime: '60-120 minutos',
      requiredTools: 'Detector de vazamentos, solda, EPIs especiais',
      safetyNotes: 'Procedimento crítico. Evacue área se necessário.',
    },
    {
      id: 4,
      title: 'Calibração de Termostatos',
      category: 'Manutenção Preventiva',
      version: '1.2',
      status: 'Ativo',
      lastUpdated: '2024-01-05',
      description: 'Procedimento para calibração e ajuste de termostatos digitais e analógicos.',
      tags: ['termostato', 'calibração', 'temperatura'],
      priority: 'low',
      estimatedTime: '20 minutos',
      requiredTools: 'Termômetro digital, chaves pequenas',
      safetyNotes: 'Verifique tensão antes de abrir equipamentos.',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = procedure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || procedure.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(procedures.map(p => p.category))];
  
  const stats = {
    total: procedures.length,
    active: procedures.filter(p => p.status === 'Ativo').length,
    inReview: procedures.filter(p => p.status === 'Em Revisão').length,
    obsolete: procedures.filter(p => p.status === 'Obsoleto').length,
  };

  const handleProcedureCreated = (newProcedure: any) => {
    setProcedures(prev => [newProcedure, ...prev]);
    toast.success('Procedimento adicionado à lista!');
  };

  const handleDownload = (procedure: any) => {
    // Implementar download do procedimento
    toast.success(`Download iniciado: ${procedure.title}`);
  };

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
          <NewProcedureModal onProcedureCreated={handleProcedureCreated} />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedCategory ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  {category}
                </Button>
              ))}
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{procedures.filter(p => new Date(p.lastUpdated) > new Date(Date.now() - 30*24*60*60*1000)).length} este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.active / stats.total) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            <Badge variant="outline" className="h-4 w-4 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
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
            <div className="text-2xl font-bold">{stats.obsolete}</div>
            <p className="text-xs text-muted-foreground">
              Requer atualização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Procedures List */}
      <div className="grid gap-4">
        {filteredProcedures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum procedimento encontrado</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || selectedCategory 
                  ? 'Tente ajustar os filtros de busca ou criar um novo procedimento.'
                  : 'Comece criando seu primeiro procedimento operacional.'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <div className="mt-4">
                  <NewProcedureModal onProcedureCreated={handleProcedureCreated} />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProcedures.map((procedure) => (
            <Card key={procedure.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{procedure.title}</CardTitle>
                    <CardDescription>{procedure.description}</CardDescription>
                    {procedure.tags && procedure.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {procedure.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <ProcedureViewModal procedure={procedure} />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(procedure)}
                    >
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
                    {procedure.estimatedTime && (
                      <span>Tempo: {procedure.estimatedTime}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {procedure.priority && (
                      <Badge 
                        variant={
                          procedure.priority === 'critical' || procedure.priority === 'high' 
                            ? 'destructive' 
                            : procedure.priority === 'medium' 
                            ? 'default' 
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {procedure.priority === 'critical' ? 'Crítica' :
                         procedure.priority === 'high' ? 'Alta' :
                         procedure.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    )}
                    <Badge 
                      variant={procedure.status === 'Ativo' ? 'default' : procedure.status === 'Em Revisão' ? 'secondary' : 'destructive'}
                    >
                      {procedure.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}