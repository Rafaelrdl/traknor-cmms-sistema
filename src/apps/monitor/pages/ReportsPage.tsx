/**
 * ReportsPage - Página de Relatórios do Monitor
 * 
 * Gera relatórios de monitoramento e exporta dados históricos.
 */

import { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'energy-consumption',
    name: 'Consumo Energético',
    description: 'Análise detalhada do consumo de energia dos equipamentos',
    icon: TrendingUp,
    category: 'Operacional'
  },
  {
    id: 'equipment-performance',
    name: 'Desempenho de Equipamentos',
    description: 'Métricas de eficiência e disponibilidade',
    icon: BarChart3,
    category: 'Operacional'
  },
  {
    id: 'alerts-summary',
    name: 'Resumo de Alertas',
    description: 'Histórico de alertas gerados e tempo de resposta',
    icon: FileText,
    category: 'Qualidade'
  },
  {
    id: 'temperature-trends',
    name: 'Tendências de Temperatura',
    description: 'Análise de variações de temperatura ao longo do tempo',
    icon: TrendingUp,
    category: 'Operacional'
  }
];

const myReports = [
  {
    id: 1,
    name: 'Relatório Mensal - Outubro 2024',
    type: 'Consumo Energético',
    date: '2024-10-31',
    status: 'completed',
    size: '2.4 MB'
  },
  {
    id: 2,
    name: 'Análise de Desempenho - Q3 2024',
    type: 'Desempenho de Equipamentos',
    date: '2024-09-30',
    status: 'completed',
    size: '3.1 MB'
  },
  {
    id: 3,
    name: 'Alertas - Setembro 2024',
    type: 'Resumo de Alertas',
    date: '2024-09-01',
    status: 'completed',
    size: '1.8 MB'
  }
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('templates');

  const handleRequestReport = (template?: ReportTemplate) => {
    // Implementar modal de solicitação de relatório

  };

  const handleDownload = (reportId: number) => {

  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gere relatórios customizados e exporte dados de monitoramento"
        icon={<FileText className="h-6 w-6" />}
      >
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Dados
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-fit">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Modelos</span>
          </TabsTrigger>
          <TabsTrigger value="my-reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Meus Relatórios</span>
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Modelos de Relatório</h2>
              <p className="text-sm text-muted-foreground">
                Selecione um modelo e personalize os parâmetros do relatório
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => handleRequestReport(template)}
                      >
                        <Calendar className="w-4 h-4" />
                        Gerar Relatório
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* My Reports Tab */}
        <TabsContent value="my-reports" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Relatórios Gerados</h2>
                <p className="text-sm text-muted-foreground">
                  Acesse e baixe seus relatórios anteriores
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
            </div>

            {myReports.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium mb-2">
                    Nenhum relatório gerado ainda
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece gerando um relatório usando os modelos disponíveis
                  </p>
                  <Button onClick={() => setActiveTab('templates')}>
                    Ver Modelos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{new Date(report.date).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={report.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {report.status === 'completed' ? 'Concluído' : 'Processando'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(report.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Exportação Rápida</CardTitle>
          <CardDescription>
            Exporte dados específicos sem gerar um relatório completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start gap-2">
              <Download className="w-4 h-4" />
              Exportar Alertas (CSV)
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Download className="w-4 h-4" />
              Exportar Telemetria (Excel)
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Download className="w-4 h-4" />
              Exportar Dispositivos (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
