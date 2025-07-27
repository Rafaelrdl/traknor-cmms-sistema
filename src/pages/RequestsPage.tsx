import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function RequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Solicitações" 
        description="Solicitações de manutenção dos usuários"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Solicitações de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p>Esta funcionalidade estará disponível em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}