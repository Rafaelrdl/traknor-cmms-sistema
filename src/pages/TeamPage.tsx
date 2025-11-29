import { useState, useCallback, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { TeamTable } from '@/components/team/TeamTable';
import { InviteUserModal } from '@/components/team/InviteUserModal';
import { InvitePreviewDrawer } from '@/components/team/InvitePreviewDrawer';
import { IfCan } from '@/components/auth/IfCan';
import { 
  useTeamMembers, 
  useTeamInvites, 
  useTeamStats,
  useUpdateMember,
  useCreateInvite,
  useResendInvite,
  useRevokeInvite
} from '@/hooks/useTeamQuery';
import { useUsers } from '@/data/usersStore';
import type { Invite } from '@/models/invite';
import type { User } from '@/models/user';
import { toast } from 'sonner';

export function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [previewInvite, setPreviewInvite] = useState<Invite | null>(null);

  // Dados da API
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useTeamMembers();
  const { data: teamInvites = [], isLoading: isLoadingInvites } = useTeamInvites();
  const { data: stats } = useTeamStats();
  
  // Mutations
  const updateMemberMutation = useUpdateMember();
  const createInviteMutation = useCreateInvite();
  const resendInviteMutation = useResendInvite();
  const revokeInviteMutation = useRevokeInvite();

  // Usuário atual (do localStorage)
  const { getCurrentUser } = useUsers();
  const currentUser = getCurrentUser();

  // Mapear membros da API para o formato esperado pelo TeamTable
  const users: User[] = useMemo(() => {
    return teamMembers.map(member => ({
      id: String(member.user.id),
      name: member.user.full_name || `${member.user.first_name} ${member.user.last_name}`.trim() || member.user.username,
      email: member.user.email,
      role: member.role === 'owner' ? 'admin' : member.role as 'admin' | 'technician' | 'requester',
      status: member.status === 'suspended' ? 'disabled' : member.status as 'active' | 'disabled',
      avatar: undefined,
      created_at: member.joined_at,
      last_login_at: member.joined_at, // API não retorna last_login, usar joined_at
    }));
  }, [teamMembers]);

  // Mapear convites da API para o formato esperado pelo TeamTable
  const invites: Invite[] = useMemo(() => {
    return teamInvites.map(invite => ({
      id: String(invite.id),
      email: invite.email,
      role: invite.role as 'admin' | 'technician' | 'requester',
      status: invite.status as 'pending' | 'accepted' | 'expired',
      sent_at: invite.created_at,
      expires_at: invite.expires_at,
      invited_by_user_id: String(invite.invited_by.id),
      accepted_at: undefined,
    }));
  }, [teamInvites]);

  // Estatísticas
  const inviteStats = useMemo(() => {
    const pending = teamInvites.filter(i => i.status === 'pending').length;
    const accepted = teamInvites.filter(i => i.status === 'accepted').length;
    const expired = teamInvites.filter(i => i.status === 'expired' || i.is_expired).length;
    return { pending, accepted, expired };
  }, [teamInvites]);

  const handleInviteUser = useCallback(async (email: string, role: any) => {
    try {
      await createInviteMutation.mutateAsync({ email, role });
      setShowInviteModal(false);
      toast.success('Convite enviado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar convite');
    }
  }, [createInviteMutation]);

  const handleResendInvite = useCallback(async (inviteId: string) => {
    try {
      await resendInviteMutation.mutateAsync(Number(inviteId));
      toast.success('Convite reenviado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar convite');
    }
  }, [resendInviteMutation]);

  const handleRevokeInvite = useCallback(async (inviteId: string) => {
    try {
      await revokeInviteMutation.mutateAsync(Number(inviteId));
      toast.success('Convite revogado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao revogar convite');
    }
  }, [revokeInviteMutation]);

  const handleToggleUserStatus = useCallback(async (userId: string, currentStatus: any) => {
    try {
      // Encontrar o membro pelo user ID
      const member = teamMembers.find(m => String(m.user.id) === userId);
      if (!member) {
        toast.error('Membro não encontrado');
        return;
      }
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateMemberMutation.mutateAsync({ 
        memberId: member.id, 
        data: { status: newStatus } 
      });
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error: any) {
      toast.error('Erro ao alterar status do usuário');
    }
  }, [teamMembers, updateMemberMutation]);

  const handleChangeUserRole = useCallback(async (userId: string, newRole: string) => {
    try {
      // Encontrar o membro pelo user ID
      const member = teamMembers.find(m => String(m.user.id) === userId);
      if (!member) {
        toast.error('Membro não encontrado');
        return;
      }
      
      await updateMemberMutation.mutateAsync({ 
        memberId: member.id, 
        data: { role: newRole as any } 
      });
      toast.success('Permissão alterada com sucesso');
    } catch (error: any) {
      toast.error('Erro ao alterar permissão do usuário');
    }
  }, [teamMembers, updateMemberMutation]);

  // Verificar se o usuário atual é admin
  const isCurrentUserAdmin = useMemo(() => {
    if (!currentUser) return false;
    const member = teamMembers.find(m => String(m.user.id) === currentUser.id);
    return member?.role === 'admin' || member?.role === 'owner';
  }, [currentUser, teamMembers]);

  const isLoading = isLoadingMembers || isLoadingInvites;

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
              {stats?.active_members ?? users.filter(u => u.status === 'active').length}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando equipe...</span>
              </div>
            ) : (
              <TeamTable
                users={users}
                invites={invites}
                onResendInvite={handleResendInvite}
                onRevokeInvite={handleRevokeInvite}
                onToggleUserStatus={handleToggleUserStatus}
                onChangeUserRole={handleChangeUserRole}
                currentUserId={currentUser?.id || ''}
                isAdmin={isCurrentUserAdmin}
              />
            )}
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