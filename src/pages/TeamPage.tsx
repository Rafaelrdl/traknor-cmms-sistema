import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { TeamTable } from '@/components/team/TeamTable';
import { InviteUserModal } from '@/components/team/InviteUserModal';
import { InvitePreviewDrawer } from '@/components/team/InvitePreviewDrawer';
import { IfCan } from '@/components/auth/IfCan';
import { useUsers } from '@/data/usersStore';
import { useInvites } from '@/data/invitesStore';
import type { Invite } from '@/models/invite';
import { toast } from 'sonner';

export function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [previewInvite, setPreviewInvite] = useState<Invite | null>(null);

  const { listUsers, setUserStatus, getCurrentUser } = useUsers();
  const { 
    createInvite, 
    listInvites, 
    resendInvite, 
    revokeInvite,
    getInviteStats
  } = useInvites();

  const currentUser = getCurrentUser();
  const users = listUsers();
  const invites = listInvites();
  const inviteStats = getInviteStats();

  const handleInviteUser = useCallback(async (email: string, role: any) => {
    try {
      const invite = createInvite({
        email,
        role,
        invited_by_user_id: currentUser.id
      });

      setShowInviteModal(false);
      setPreviewInvite(invite);
      
      toast.success('Convite criado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar convite');
    }
  }, [createInvite, currentUser.id]);

  const handleResendInvite = useCallback(async (inviteId: string) => {
    try {
      const invite = resendInvite(inviteId);
      setPreviewInvite(invite);
      toast.success('Convite reenviado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar convite');
    }
  }, [resendInvite]);

  const handleRevokeInvite = useCallback(async (inviteId: string) => {
    try {
      revokeInvite(inviteId);
      toast.success('Convite revogado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao revogar convite');
    }
  }, [revokeInvite]);

  const handleToggleUserStatus = useCallback(async (userId: string, currentStatus: any) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      setUserStatus(userId, newStatus);
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error: any) {
      toast.error('Erro ao alterar status do usuário');
    }
  }, [setUserStatus]);

  return (
    <IfCan action="manage" subject="user" fallback={
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground">Acesso Negado</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Você não tem permissão para acessar o gerenciamento de equipe.
          </p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        <PageHeader
          title="Equipe"
          subtitle="Gerencie usuários e convites da sua organização"
        >
          <Button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Convidar Usuário
          </Button>
        </PageHeader>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-foreground">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">
              Usuários Ativos
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-primary">
              {inviteStats.pending}
            </div>
            <div className="text-sm text-muted-foreground">
              Convites Pendentes
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-green-600">
              {inviteStats.accepted}
            </div>
            <div className="text-sm text-muted-foreground">
              Convites Aceitos
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-orange-600">
              {inviteStats.expired}
            </div>
            <div className="text-sm text-muted-foreground">
              Convites Expirados
            </div>
          </div>
        </div>

        {/* Tabela de usuários */}
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Usuários</h3>
            <TeamTable
              users={users}
              invites={invites}
              onResendInvite={handleResendInvite}
              onRevokeInvite={handleRevokeInvite}
              onToggleUserStatus={handleToggleUserStatus}
              currentUserId={currentUser.id}
            />
          </div>
        </div>

        {/* Modal de convite */}
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
        />

        {/* Drawer de preview do convite */}
        <InvitePreviewDrawer
          invite={previewInvite}
          onClose={() => setPreviewInvite(null)}
        />
      </div>
    </IfCan>
  );
}