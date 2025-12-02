import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  ClipboardList,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ChecklistTemplate, ChecklistCategory } from '@/models/checklist';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistTableProps {
  checklists: ChecklistTemplate[];
  categories: ChecklistCategory[];
  onView: (checklist: ChecklistTemplate) => void;
  onEdit: (checklist: ChecklistTemplate) => void;
  onDuplicate: (checklist: ChecklistTemplate) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function ChecklistTable({
  checklists,
  categories,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
}: ChecklistTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<ChecklistTemplate | null>(null);

  const getCategoryById = (id: string | null | undefined) => {
    if (!id) return null;
    return categories.find(cat => cat.id === id);
  };

  const handleDeleteClick = (checklist: ChecklistTemplate) => {
    setChecklistToDelete(checklist);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (checklistToDelete) {
      onDelete(checklistToDelete.id);
    }
    setDeleteDialogOpen(false);
    setChecklistToDelete(null);
  };

  if (checklists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum checklist encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crie seu primeiro checklist para vincular aos planos de manutenção
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
              <TableHead className="w-[300px]">Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead className="text-center">Itens</TableHead>
              <TableHead className="text-center">Usos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.map((checklist) => {
              const category = getCategoryById(checklist.category_id);
              
              return (
                <TableRow key={checklist.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <button
                        onClick={() => onView(checklist)}
                        className="font-medium text-left hover:underline hover:text-primary transition-colors"
                      >
                        {checklist.name}
                      </button>
                      {checklist.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {checklist.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {category ? (
                      <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                        {category.color && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {checklist.equipment_type ? (
                      <Badge variant="outline">{checklist.equipment_type}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {checklist.items.length} {checklist.items.length === 1 ? 'item' : 'itens'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">
                      {checklist.usage_count || 0}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={checklist.is_active ? 'default' : 'secondary'}
                      className={checklist.is_active ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {checklist.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground">
                    {checklist.updated_at ? formatDistanceToNow(new Date(checklist.updated_at), {
                      addSuffix: true,
                      locale: ptBR,
                    }) : '-'}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(checklist)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(checklist)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(checklist)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onToggleActive(checklist.id, !checklist.is_active)}
                        >
                          {checklist.is_active ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(checklist)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Checklist</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o checklist "{checklistToDelete?.name}"?
              {(checklistToDelete?.usage_count ?? 0) > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ Este checklist está vinculado a {checklistToDelete?.usage_count} plano(s) de manutenção.
                </span>
              )}
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
