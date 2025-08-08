import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Calendar, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { SolicitationsDrawer } from '@/components/SolicitationsDrawer';
import { toast } from 'sonner';
import {
  useSolicitations,
  useWorkOrders,
  useStockItems,
  convertSolicitationToWorkOrder
} from '@/hooks/useDataTemp';
import type { Solicitation } from '@/types';

export function RequestsPage() {
  const [solicitations, setSolicitations] = useSolicitations();
  const [workOrders, setWorkOrders] = useWorkOrders();
  const [stockItems] = useStockItems();
  const [selectedSolicitation, setSelectedSolicitation] = useState<Solicitation | null>(null);

  const handleRowClick = (solicitation: Solicitation) => {
    setSelectedSolicitation(solicitation);
  };

  const handleUpdateSolicitation = (updatedSolicitation: Solicitation) => {
    setSolicitations(current =>
      current.map(s =>
        s.id === updatedSolicitation.id ? updatedSolicitation : s
      )
    );
  };

  const handleConvertToWorkOrder = (solicitation: Solicitation) => {
    try {
      // Convert solicitation to work order
      const workOrder = convertSolicitationToWorkOrder(solicitation);
      
      // Add to work orders
      setWorkOrders(current => [workOrder, ...current]);
      
      // Close drawer
      setSelectedSolicitation(null);
      
      toast.success('Solicitação convertida em OS com sucesso!', {
        description: `Ordem de serviço ${workOrder.number} criada.`,
        action: {
          label: 'Ver OS',
          onClick: () => {
            // Navigate to work orders page - this would be handled by routing
            console.log('Navigate to work orders page');
          }
        }
      });
    } catch (error) {
      console.error('Error converting solicitation:', error);
      toast.error('Erro ao converter solicitação em OS.');
    }
  };

  const handleCloseDrawer = () => {
    setSelectedSolicitation(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateText = (text: string | undefined, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Statistics
  const stats = {
    total: solicitations.length,
    nova: solicitations.filter(s => s.status === 'Nova').length,
    triagem: solicitations.filter(s => s.status === 'Em triagem').length,
    convertida: solicitations.filter(s => s.status === 'Convertida em OS').length
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Solicitações" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{stats.nova}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Novas</p>
                <div className="text-2xl font-bold text-blue-600">{stats.nova}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">{stats.triagem}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Em Triagem</p>
                <div className="text-2xl font-bold text-yellow-600">{stats.triagem}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">{stats.convertida}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Convertidas</p>
                <div className="text-2xl font-bold text-green-600">{stats.convertida}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Lista de Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {solicitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table 
                className="w-full" 
                role="grid"
                aria-label="Lista de solicitações de manutenção"
              >
                <thead>
                  <tr className="border-b">
                    <th scope="col" className="text-left p-4 font-medium text-muted-foreground">
                      Localização/Equipamento
                    </th>
                    <th scope="col" className="text-left p-4 font-medium text-muted-foreground">
                      Usuário Solicitante
                    </th>
                    <th scope="col" className="text-left p-4 font-medium text-muted-foreground">
                      Observação
                    </th>
                    <th scope="col" className="text-left p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th scope="col" className="text-left p-4 font-medium text-muted-foreground">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {solicitations.map((solicitation) => (
                    <tr
                      key={solicitation.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(solicitation)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(solicitation);
                        }
                      }}
                      aria-label={`Ver detalhes da solicitação ${solicitation.location_name} - ${solicitation.equipment_name}`}
                    >
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-sm">
                            {solicitation.location_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {solicitation.equipment_name}
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {solicitation.requester_user_name}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p 
                            className="text-sm text-muted-foreground"
                            title={solicitation.note}
                          >
                            {truncateText(solicitation.note)}
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <StatusBadge status={solicitation.status} />
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(solicitation.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-muted-foreground">
                Não há solicitações cadastradas no sistema.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solicitations Drawer */}
      <SolicitationsDrawer
        solicitation={selectedSolicitation}
        isOpen={!!selectedSolicitation}
        onClose={handleCloseDrawer}
        onUpdate={handleUpdateSolicitation}
        onConvert={handleConvertToWorkOrder}
        stockItems={stockItems}
      />
    </div>
  );
}