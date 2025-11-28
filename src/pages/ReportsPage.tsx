import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye } from 'lucide-react';
import { useCompanies, useSectors } from '@/hooks/useLocationsQuery';

export function ReportsPage() {
  const { data: companies = [] } = useCompanies();
  const { data: sectors = [] } = useSectors();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Relatórios PMOC" 
        description="Geração de relatórios para conformidade PMOC"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório PMOC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period">Período</Label>
              <Input 
                id="period"
                type="month" 
                defaultValue="2025-01"
              />
            </div>
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as empresas</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sector">Setor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os setores</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visualizar Preview
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Gerar PDF
            </Button>
          </div>

          {/* Mock preview */}
          <div className="border rounded-lg p-6 bg-muted/50">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">RELATÓRIO PMOC</h2>
              <p className="text-muted-foreground">Plano de Manutenção, Operação e Controle</p>
              <p className="text-sm">Período: Janeiro 2025</p>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold">1. IDENTIFICAÇÃO DA EMPRESA</h3>
                <p>Razão Social: Shopping Center Norte</p>
                <p>CNPJ: 12.345.678/0001-90</p>
              </div>
              
              <div>
                <h3 className="font-semibold">2. SISTEMAS DE CLIMATIZAÇÃO</h3>
                <p>Total de equipamentos: 3</p>
                <p>Capacidade total instalada: 114.000 BTUs</p>
              </div>
              
              <div>
                <h3 className="font-semibold">3. MANUTENÇÕES REALIZADAS</h3>
                <p>Manutenções preventivas: 2</p>
                <p>Manutenções corretivas: 1</p>
                <p>Taxa de conformidade: 100%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum relatório gerado ainda</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}