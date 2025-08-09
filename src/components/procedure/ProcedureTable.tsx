import { useState } from 'react';
import { Eye, Edit2, Trash2, FolderOpen, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IfCan, IfCanEdit, IfCanDelete } from '@/components/auth/IfCan';
import { useAbility } from '@/hooks/useAbility';
import { Procedure, ProcedureCategory, ProcedureStatus } from '@/models/procedure';
import { updateProcedure, deleteProcedure } from '@/data/proceduresStore';
import { toast } from 'sonner';

interface ProcedureTableProps {
  procedures: Procedure[];
  categories: ProcedureCategory[];
  onView: (procedure: Procedure) => void;
  onEdit: (procedure: Procedure) => void;
  onUpdate: () => void;
}

export function ProcedureTable({
  procedures,
  categories,
  onView,
  onEdit,
  onUpdate,
}: ProcedureTableProps) {
  const { canEdit, canDelete } = useAbility();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    procedure?: Procedure;
  }>({ isOpen: false });

  const getCategoryName = (categoryId?: string | null) => {
    if (!categoryId) return 'Sem categoria';
    return categories.find(cat => cat.id === categoryId)?.name || 'Categoria desconhecida';
  };

  const getCategoryColor = (categoryId?: string | null) => {
    if (!categoryId) return '#6b7280';
    return categories.find(cat => cat.id === categoryId)?.color || '#6b7280';
  };

  const handleStatusChange = async (procedure: Procedure, newStatus: ProcedureStatus) => {
    try {
      await updateProcedure({
        ...procedure,
        status: newStatus,
      });
      onUpdate();
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleCategoryChange = async (procedure: Procedure, categoryId: string | null) => {
    try {
      await updateProcedure({
        ...procedure,
        category_id: categoryId,
      });
      onUpdate();
      toast.success('Categoria atualizada com sucesso');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleDelete = async (procedure: Procedure) => {
    try {
      await deleteProcedure(procedure.id);
      onUpdate();
      toast.success('Procedimento excluído com sucesso');
    } catch (error) {
      console.error('Error deleting procedure:', error);
      toast.error('Erro ao excluir procedimento');
    }
    setDeleteDialog({ isOpen: false });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (procedures.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          Nenhum procedimento encontrado
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Ajuste os filtros ou crie um novo procedimento para começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Título</TableHead>
              <TableHead scope="col">Categoria</TableHead>
              <TableHead scope="col">Tipo</TableHead>
              <TableHead scope="col">Versão</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Atualizado</TableHead>
              <TableHead scope="col" className="text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedures.map((procedure) => {
              const category = categories.find(cat => cat.id === procedure.category_id);
              return (
                <TableRow key={procedure.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{procedure.title}</div>
                      {procedure.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {procedure.description}
                        </div>
                      )}
                      {procedure.tags && procedure.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {procedure.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {procedure.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{procedure.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Select
                      value={procedure.category_id || 'none'}
                      onValueChange={(value) =>
                        handleCategoryChange(procedure, value === 'none' ? null : value)
                      }
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getCategoryColor(procedure.category_id) }}
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {getCategoryName(procedure.category_id)}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                                aria-hidden="true"
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={procedure.file.type === 'pdf' ? 'destructive' : 'secondary'}
                      >
                        {procedure.file.type.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(procedure.file.size)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-center">
                      <span className="font-mono text-sm">v{procedure.version}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <IfCan action="edit" subject="procedure">
                      <Select
                        value={procedure.status}
                        onValueChange={(value) =>
                          handleStatusChange(procedure, value as ProcedureStatus)
                        }
                      >
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">
                            <Badge variant="default">Ativo</Badge>
                          </SelectItem>
                          <SelectItem value="Inativo">
                            <Badge variant="secondary">Inativo</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </IfCan>
                    <IfCan action="view" subject="procedure" fallback={
                      <Badge variant={procedure.status === 'Ativo' ? "default" : "secondary"}>
                        {procedure.status}
                      </Badge>
                    }>
                    </IfCan>
                  </TableCell>
                  
                  <TableCell>
                    <time
                      dateTime={procedure.updated_at}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDistanceToNow(new Date(procedure.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </time>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(procedure)}
                        aria-label={`Visualizar ${procedure.title}`}
                        data-testid="procedure-view"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {(canEdit('procedure') || canDelete('procedure')) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Mais ações para ${procedure.title}`}
                              data-testid="procedure-actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <IfCanEdit subject="procedure">
                              <DropdownMenuItem onClick={() => onEdit(procedure)} data-testid="procedure-edit">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </IfCanEdit>
                            {(canEdit('procedure') && canDelete('procedure')) && <DropdownMenuSeparator />}
                            <IfCanDelete subject="procedure">
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({ isOpen: true, procedure })}
                                className="text-destructive"
                                data-testid="procedure-delete"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </IfCanDelete>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog({ isOpen, procedure: deleteDialog.procedure })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir procedimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o procedimento "{deleteDialog.procedure?.title}"?
              Esta ação não pode ser desfeita e o arquivo será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.procedure && handleDelete(deleteDialog.procedure)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}