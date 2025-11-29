import { useState } from 'react';
import { MoreHorizontal, Mail, UserCheck, UserX, RotateCcw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IfCan } from '@/components/auth/IfCan';
import type { User } from '@/models/user';
import type { Invite } from '@/models/invite';

interface TeamTableProps {
  users: User[];
  invites: Invite[];
  onResendInvite: (inviteId: string) => void;
  onRevokeInvite: (inviteId: string) => void;
  onToggleUserStatus: (userId: string, currentStatus: User['status']) => void;
  onChangeUserRole?: (userId: string, newRole: User['role']) => void;
  currentUserId: string;
  isAdmin?: boolean;
}

const statusVariants = {
  active: 'default',
  invited: 'secondary',
  disabled: 'destructive',
} as const;

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  operator: 'Operador',
  technician: 'Técnico',
  viewer: 'Visualizador',
};

const roleColors: Record<string, string> = {
  owner: 'text-purple-500',
  admin: 'text-red-500',
  operator: 'text-blue-500',
  technician: 'text-green-500',
  viewer: 'text-gray-500',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  invited: 'Convidado',
  disabled: 'Desativado',
  inactive: 'Inativo',
  suspended: 'Suspenso',
};

export function TeamTable({
  users,
  invites,
  onResendInvite,
  onRevokeInvite,
  onToggleUserStatus,
  onChangeUserRole,
  currentUserId,
  isAdmin = false,
}: TeamTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleAction = async (actionId: string, action: () => Promise<void> | void) => {
    setLoadingStates(prev => ({ ...prev, [actionId]: true }));
    try {
      await action();
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Combinar usuários e convites pendentes para exibir na tabela
  const tableData = [
    ...users.map(user => ({ type: 'user' as const, data: user })),
    ...invites
      .filter(invite => invite.status === 'pending')
      .map(invite => ({ type: 'invite' as const, data: invite })),
  ].sort((a, b) => {
    // Ordenar por data de criação, mais recentes primeiro
    const dateA = new Date(a.data.created_at || a.data.sent_at).getTime();
    const dateB = new Date(b.data.created_at || b.data.sent_at).getTime();
    return dateB - dateA;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Nome</TableHead>
            <TableHead scope="col">Email</TableHead>
            <TableHead scope="col">Papel</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Último Acesso</TableHead>
            <TableHead scope="col" className="w-[70px]">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum usuário ou convite encontrado
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((item) => {
              const isUser = item.type === 'user';
              const data = item.data;
              const uniqueId = isUser ? `user-${data.id}` : `invite-${data.id}`;
              
              return (
                <TableRow key={uniqueId}>
                  <TableCell className="font-medium">
                    {isUser ? data.name : '—'}
                  </TableCell>
                  <TableCell>{data.email}</TableCell>
                  <TableCell>
                    {isUser && isAdmin && data.id !== currentUserId && onChangeUserRole ? (
                      <Select
                        value={data.role}
                        onValueChange={(newRole) => {
                          handleAction(
                            `role-${data.id}`,
                            () => onChangeUserRole(data.id, newRole as User['role'])
                          );
                        }}
                        disabled={loadingStates[`role-${data.id}`]}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue>
                            <div className="flex items-center gap-1.5">
                              <Shield className={`h-3 w-3 ${roleColors[data.role] || 'text-gray-500'}`} />
                              {roleLabels[data.role] || data.role}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-red-500" />
                              Administrador
                            </div>
                          </SelectItem>
                          <SelectItem value="operator">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              Operador
                            </div>
                          </SelectItem>
                          <SelectItem value="technician">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-500" />
                              Técnico
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              Visualizador
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">
                        {roleLabels[data.role] || data.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusVariants[data.status]}
                      className="whitespace-nowrap"
                    >
                      {statusLabels[data.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {isUser 
                      ? formatDate((data as User).last_login_at) 
                      : `Convidado em ${formatDate((data as Invite).sent_at)}`
                    }
                  </TableCell>
                  <TableCell>
                    <IfCan action="manage" subject="user">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            aria-label={`Ações para ${data.email}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!isUser && data.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleAction(
                                  `resend-${data.id}`,
                                  () => onResendInvite(data.id)
                                )}
                                disabled={loadingStates[`resend-${data.id}`]}
                                className="flex items-center gap-2"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Reenviar Convite
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(
                                  `revoke-${data.id}`,
                                  () => onRevokeInvite(data.id)
                                )}
                                disabled={loadingStates[`revoke-${data.id}`]}
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                              >
                                <UserX className="h-4 w-4" />
                                Revogar Convite
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {isUser && data.id !== currentUserId && (
                            <DropdownMenuItem
                              onClick={() => handleAction(
                                `toggle-${data.id}`,
                                () => onToggleUserStatus(data.id, data.status)
                              )}
                              disabled={loadingStates[`toggle-${data.id}`]}
                              className="flex items-center gap-2"
                            >
                              {data.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4" />
                                  Desativar Usuário
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" />
                                  Ativar Usuário
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          
                          {isUser && data.id === currentUserId && (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              Você mesmo
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </IfCan>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}