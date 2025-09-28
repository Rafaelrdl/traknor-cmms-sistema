import { useState, useEffect, useRef } from 'react';import { useState, useEffect, useRef } from 'react';import { useState, useEffect, useRef } from 'react';import { useState, useEffect, useRef } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';import { Button } from '@/components/ui/button';import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';import { Input } from '@/components/ui/input';

import { Separator } from '@/components/ui/separator';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { Label } from '@/components/ui/label';import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import { Card } from '@/components/ui/card';import { Textarea } from '@/components/ui/textarea';

import { Checkbox } from '@/components/ui/checkbox';

import { ScrollArea } from '@/components/ui/scroll-area';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';import { Input } from '@/components/ui/input';import { Input } from '@/components/ui/input';

import { 

  ClipboardList, import { Separator } from '@/components/ui/separator';

  CalendarClock, 

  Wrench, import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { Label } from '@/components/ui/label';import { Label } from '@/components/ui/label';

  Building, 

  Package, import { Badge } from '@/components/ui/badge';

  AlertTriangle, 

  Plus, import { Card } from '@/components/ui/card';import { Textarea } from '@/components/ui/textarea';import { Textarea } from '@/components/ui/textarea';

  Trash2,

  Save,import { Checkbox } from '@/components/ui/checkbox';

  Info,

  Calendar,import { ScrollArea } from '@/components/ui/scroll-area';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

  User,

  Tag,import { 

  MapPin,

  Circle,  ClipboardList, import { Separator } from '@/components/ui/separator';import { ScrollArea } from '@/components/ui/scroll-area';

  CheckCircle2,

  Clock,  CalendarClock, 

  Camera,

  Upload,  Wrench, import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { Separator } from '@/components/ui/separator';

  FileText,

  ClipboardCheck,  Building, 

  AlertCircle,

  Lock,  Package, import { Badge } from '@/components/ui/badge';import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

  Shield

} from 'lucide-react';  AlertTriangle, 

import { DatePicker } from '@/components/ui/date-picker';

import { useCompanies, useSectors, useEquipment, useStockItems } from '@/hooks/useDataTemp';  Plus, import { Card } from '@/components/ui/card';import { Badge } from '@/components/ui/badge';

import type { WorkOrder, WorkOrderStockItem, ChecklistResponse, UploadedPhoto } from '@/types';

import { cn } from '@/lib/utils';  Trash2,

import { toast } from 'sonner';

  Save,import { Checkbox } from '@/components/ui/checkbox';import { Card } from '@/components/ui/card';

interface WorkOrderEditModalProps {

  isOpen: boolean;  Info,

  onClose: () => void;

  workOrder: WorkOrder | null;  Calendar,import { import { Checkbox } from '@/components/ui/checkbox';

  onSave: (updatedWorkOrder: WorkOrder) => void;

}  User,



interface StockItemRequest {  Tag,  ClipboardList, import { 

  id: string;

  stockItemId: string;  MapPin,

  name: string;

  quantity: number;  Circle,  CalendarClock,   ClipboardList, 

  unit: string;

}  CheckCircle2,



export function WorkOrderEditModal({  Clock,  Wrench,   CalendarClock, 

  isOpen,

  onClose,  Camera,

  workOrder,

  onSave  Upload,  Building,   Wrench, 

}: WorkOrderEditModalProps) {

  // Estados e hooks  FileText,

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<WorkOrder>>({});  ClipboardCheck,  Package,   Building, 

  const [activeTab, setActiveTab] = useState("details");

  const [selectedStockItems, setSelectedStockItems] = useState<StockItemRequest[]>([]);  AlertCircle,

  const [stockItemForm, setStockItemForm] = useState({ stockItemId: '', quantity: 1 });

  const [isSubmitting, setIsSubmitting] = useState(false);  Lock,  AlertTriangle,   Package, 

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [executionDescription, setExecutionDescription] = useState('');  Shield

  const [checklistResponses, setChecklistResponses] = useState<ChecklistResponse[]>([]);

  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);} from 'lucide-react';  Plus,   AlertTriangle, 

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  import { DatePicker } from '@/components/ui/date-picker';

  const [equipment] = useEquipment();

  const [sectors] = useSectors();import { useCompanies, useSectors, useEquipment, useStockItems } from '@/hooks/useDataTemp';  Trash2,  Plus, 

  const [companies] = useCompanies();

  const [stockItems] = useStockItems();import type { WorkOrder, WorkOrderStockItem, ChecklistResponse, UploadedPhoto } from '@/types';



  // Simulação de autenticação - substituir pela implementação realimport { cn } from '@/lib/utils';  Save,  Trash2,

  const user = { name: 'Usuário Atual', role: 'admin' };

import { toast } from 'sonner';

  // Verificar permissões do usuário

  const canEditDetails = user?.role === 'admin';  Info,  Save,

  const canEditExecution = user?.role === 'technician' || user?.role === 'admin';

  const canEditMaterials = user?.role === 'technician' || user?.role === 'admin';interface WorkOrderEditModalProps {



  // Carregar dados da ordem de serviço quando abrir o modal  isOpen: boolean;  Calendar,  Info,

  useEffect(() => {

    if (workOrder && isOpen) {  onClose: () => void;

      setFormData({ ...workOrder });

        workOrder: WorkOrder | null;  User,  Calendar,

      const stockItemRequests: StockItemRequest[] = (workOrder.stockItems || []).map(item => ({

        id: item.id,  onSave: (updatedWorkOrder: WorkOrder) => void;

        stockItemId: item.stockItemId,

        name: item.stockItem?.description || `Item ${item.stockItemId}`,}  Tag,  User,

        quantity: item.quantity,

        unit: item.stockItem?.unit || 'un'

      }));

      interface StockItemRequest {  MapPin,  Tag,

      setSelectedStockItems(stockItemRequests);

      setExecutionDescription(workOrder.executionDescription || '');  id: string;

      setUploadedPhotos(workOrder.photos || []);

        stockItemId: string;  Circle,  MapPin,

      // Se for ordem preventiva sem checklist, criar um exemplo

      const defaultChecklist: ChecklistResponse[] = workOrder.type === 'PREVENTIVE' && (!workOrder.checklistResponses || workOrder.checklistResponses.length === 0) ? [  name: string;

        {

          taskId: 'task-1',  quantity: number;  CheckCircle2,  Circle,

          taskName: 'Inspeção Visual do Equipamento',

          completed: false,  unit: string;

          observations: '',

          checkItems: [}  Clock,  CheckCircle2,

            { id: 'check-1', description: 'Verificar ruídos anormais', checked: false },

            { id: 'check-2', description: 'Verificar vazamentos', checked: false },

            { id: 'check-3', description: 'Verificar condição das mangueiras', checked: false }

          ]export function WorkOrderEditModal({  Camera,  Clock,

        },

        {  isOpen,

          taskId: 'task-2',

          taskName: 'Limpeza e Manutenção',  onClose,  Upload,  Camera,

          completed: false,

          observations: '',  workOrder,

          checkItems: [

            { id: 'check-4', description: 'Limpar filtros', checked: false },  onSave  FileText,  Upload,

            { id: 'check-5', description: 'Verificar pressão do sistema', checked: false },

            { id: 'check-6', description: 'Lubrificar componentes', checked: false }}: WorkOrderEditModalProps) {

          ]

        }  // Estados e hooks  ClipboardCheck,  FileText,

      ] : (workOrder.checklistResponses || []);

        const fileInputRef = useRef<HTMLInputElement>(null);

      setChecklistResponses(defaultChecklist);

        const [formData, setFormData] = useState<Partial<WorkOrder>>({});  AlertCircle,  ClipboardCheck,

      // Definir aba inicial baseada no status

      if (workOrder.status === 'IN_PROGRESS' && canEditExecution) {  const [activeTab, setActiveTab] = useState("details");

        setActiveTab("execution");

      } else {  const [selectedStockItems, setSelectedStockItems] = useState<StockItemRequest[]>([]);  Lock,  AlertCircle,

        setActiveTab("details");

      }  const [stockItemForm, setStockItemForm] = useState({ stockItemId: '', quantity: 1 });

      

      setErrors({});  const [isSubmitting, setIsSubmitting] = useState(false);  Shield,  Lock,

    }

  }, [workOrder, isOpen, canEditExecution]);  const [errors, setErrors] = useState<Record<string, string>>({});



  // Reset form when modal closes  const [executionDescription, setExecutionDescription] = useState('');  X  Shield,

  useEffect(() => {

    if (!isOpen) {  const [checklistResponses, setChecklistResponses] = useState<ChecklistResponse[]>([]);

      setFormData({});

      setSelectedStockItems([]);  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);} from 'lucide-react';  X

      setStockItemForm({ stockItemId: '', quantity: 1 });

      setExecutionDescription('');  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

      setChecklistResponses([]);

      setUploadedPhotos([]);  import { DatePicker } from '@/components/ui/date-picker';} from 'lucide-react';

      setActiveTab("details");

      setErrors({});  const [equipment] = useEquipment();

    }

  }, [isOpen]);  const [sectors] = useSectors();import { useCompanies, useSectors, useEquipment, useStockItems } from '@/hooks/useDataTemp';import { DatePicker } from '@/components/ui/date-picker';



  // Validação do formulário  const [companies] = useCompanies();

  const validateForm = (): boolean => {

    const newErrors: Record<string, string> = {};  const [stockItems] = useStockItems();import type { WorkOrder, WorkOrderStockItem, ChecklistResponse, UploadedPhoto } from '@/types';import { useCompanies, useSectors, useEquipment, useStockItems } from '@/hooks/useDataTemp';

    

    if (!formData.type) newErrors.type = 'Tipo de ordem é obrigatório';

    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';

    if (!formData.description) newErrors.description = 'Descrição é obrigatória';  // Simulação de autenticação - substituir pela implementação realimport { cn } from '@/lib/utils';import type { WorkOrder, WorkOrderStockItem, ChecklistResponse, UploadedPhoto } from '@/types';

    if (!formData.equipmentId) newErrors.equipmentId = 'Equipamento é obrigatório';

    if (!formData.scheduledDate) newErrors.scheduledDate = 'Data programada é obrigatória';  const user = { name: 'Usuário Atual', role: 'admin' };

    if (!formData.status) newErrors.status = 'Status é obrigatório';

    import { toast } from 'sonner';import { cn } from '@/lib/utils';

    // Validações específicas para status concluído

    if (formData.status === 'COMPLETED' && !formData.completedAt) {  // Verificar permissões do usuário

      newErrors.completedAt = 'Data de conclusão é obrigatória para ordens concluídas';

    }  const canEditDetails = user?.role === 'admin';

    

    setErrors(newErrors);  const canEditExecution = user?.role === 'technician' || user?.role === 'admin';

    return Object.keys(newErrors).length === 0;

  };  const canEditMaterials = user?.role === 'technician' || user?.role === 'admin';interface WorkOrderEditModalProps {interface WorkOrderEditModalProps {



  // Manipuladores de eventos

  const handleSave = () => {

    if (!formData || !workOrder) return;  // Carregar dados da ordem de serviço quando abrir o modal  isOpen: boolean;  isOpen: boolean;

    

    if (!validateForm()) {  useEffect(() => {

      setActiveTab("details");

      return;    if (workOrder && isOpen) {  onClose: () => void;  onClose: () => void;

    }

          setFormData({ ...workOrder });

    setIsSubmitting(true);

            workOrder: WorkOrder | null;  workOrder: WorkOrder | null;

    setTimeout(() => {

      try {      const stockItemRequests: StockItemRequest[] = (workOrder.stockItems || []).map(item => ({

        const updatedStockItems: WorkOrderStockItem[] = selectedStockItems.map(item => ({

          id: item.id,        id: item.id,  onSave: (updatedWorkOrder: WorkOrder) => void;  onSave: (updatedWorkOrder: WorkOrder) => void;

          workOrderId: workOrder.id,

          stockItemId: item.stockItemId,        stockItemId: item.stockItemId,

          quantity: item.quantity,

          stockItem: stockItems.find(si => si.id === item.stockItemId)        name: item.stockItem?.description || `Item ${item.stockItemId}`,}}

        }));

        quantity: item.quantity,

        const updatedWorkOrder: WorkOrder = {

          ...workOrder,        unit: item.stockItem?.unit || 'un'

          ...formData,

          stockItems: updatedStockItems,      }));

          executionDescription,

          checklistResponses,      interface StockItemRequest {interface StockItemRequest {

          photos: uploadedPhotos

        };      setSelectedStockItems(stockItemRequests);

        

        onSave(updatedWorkOrder);      setExecutionDescription(workOrder.executionDescription || '');  id: string;  id: string;

        toast.success('Ordem de serviço atualizada com sucesso!');

        onClose();      setUploadedPhotos(workOrder.photos || []);

      } catch (error) {

        console.error('Erro ao salvar ordem de serviço:', error);        stockItemId: string;  stockItemId: string;

        toast.error('Erro ao salvar ordem de serviço');

      } finally {      // Se for ordem preventiva sem checklist, criar um exemplo

        setIsSubmitting(false);

      }      const defaultChecklist: ChecklistResponse[] = workOrder.type === 'PREVENTIVE' && (!workOrder.checklistResponses || workOrder.checklistResponses.length === 0) ? [  name: string;  name: string;

    }, 500);

  };        {



  // Upload de fotos          taskId: 'task-1',  quantity: number;  quantity: number;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files;          taskName: 'Inspeção Visual do Equipamento',

    if (!files || files.length === 0) return;

          completed: false,  unit: string;  unit: string;

    setIsUploadingPhoto(true);

              observations: '',

    setTimeout(() => {

      const newPhotos: UploadedPhoto[] = Array.from(files).map(file => ({          checkItems: [}}

        id: `photo-${Date.now()}-${Math.random()}`,

        url: URL.createObjectURL(file),            { id: 'check-1', description: 'Verificar ruídos anormais', checked: false },

        name: file.name,

        uploadedAt: new Date().toISOString(),            { id: 'check-2', description: 'Verificar vazamentos', checked: false },

        uploadedBy: user?.name || 'Técnico'

      }));            { id: 'check-3', description: 'Verificar condição das mangueiras', checked: false }

      

      setUploadedPhotos(prev => [...prev, ...newPhotos]);          ]export function WorkOrderEditModal({

      setIsUploadingPhoto(false);

      toast.success(`${files.length} foto(s) adicionada(s) com sucesso!`);        },

      

      if (fileInputRef.current) {        {  isOpen,

        fileInputRef.current.value = '';

      }          taskId: 'task-2',

    }, 1000);

  };          taskName: 'Limpeza e Manutenção',  onClose,export function WorkOrderEditModal({



  const removePhoto = (photoId: string) => {          completed: false,

    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));

    toast.success('Foto removida');          observations: '',  workOrder,  isOpen,

  };

          checkItems: [

  const updateChecklistResponse = (taskId: string, field: string, value: any) => {

    setChecklistResponses(prev => prev.map(response => {            { id: 'check-4', description: 'Limpar filtros', checked: false },  onSave  onClose,

      if (response.taskId === taskId) {

        if (field === 'checkItem') {            { id: 'check-5', description: 'Verificar pressão do sistema', checked: false },

          const { itemId, checked } = value;

          return {            { id: 'check-6', description: 'Lubrificar componentes', checked: false }}: WorkOrderEditModalProps) {  workOrder,

            ...response,

            checkItems: response.checkItems?.map(item =>          ]

              item.id === itemId ? { ...item, checked } : item

            )        }  // Estados e hooks  onSave

          };

        }      ] : (workOrder.checklistResponses || []);

        return { ...response, [field]: value };

      }        const fileInputRef = useRef<HTMLInputElement>(null);}: WorkOrderEditModalProps) {

      return response;

    }));      setChecklistResponses(defaultChecklist);

  };

          const [formData, setFormData] = useState<Partial<WorkOrder>>({});  // Estados e hooks

  const addStockItem = () => {

    if (!stockItemForm.stockItemId) return;      // Definir aba inicial baseada no status

    

    const stockItem = stockItems.find(si => si.id === stockItemForm.stockItemId);      if (workOrder.status === 'IN_PROGRESS' && canEditExecution) {  const [activeTab, setActiveTab] = useState("details");  const [formData, setFormData] = useState<Partial<WorkOrder>>({});

    

    if (stockItem) {        setActiveTab("execution");

      const newStockItemRequest: StockItemRequest = {

        id: `${stockItem.id}-${Date.now()}`,      } else {  const [selectedStockItems, setSelectedStockItems] = useState<StockItemRequest[]>([]);  const [activeTab, setActiveTab] = useState("details");

        stockItemId: stockItem.id,

        name: stockItem.description,        setActiveTab("details");

        quantity: stockItemForm.quantity,

        unit: stockItem.unit      }  const [stockItemForm, setStockItemForm] = useState({ stockItemId: '', quantity: 1 });  const [selectedStockItems, setSelectedStockItems] = useState<StockItemRequest[]>([]);

      };

            

      setSelectedStockItems(prev => [...prev, newStockItemRequest]);

      setStockItemForm({ stockItemId: '', quantity: 1 });      setErrors({});  const [isSubmitting, setIsSubmitting] = useState(false);  const [stockItemForm, setStockItemForm] = useState({ stockItemId: '', quantity: 1 });

    }

  };    }



  const removeStockItem = (id: string) => {  }, [workOrder, isOpen, canEditExecution]);  const [errors, setErrors] = useState<Record<string, string>>({});  const [isSubmitting, setIsSubmitting] = useState(false);

    setSelectedStockItems(prev => prev.filter(item => item.id !== id));

  };



  const availableStockItems = stockItems.filter(  // Reset form when modal closes  const [executionDescription, setExecutionDescription] = useState('');  const [errors, setErrors] = useState<Record<string, string>>({});

    si => !selectedStockItems.some(selected => selected.stockItemId === si.id)

  );  useEffect(() => {



  if (!workOrder) return null;    if (!isOpen) {  const [checklistResponses, setChecklistResponses] = useState<ChecklistResponse[]>([]);  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);



  // Encontrar o equipamento selecionado      setFormData({});

  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);

  const selectedSector = selectedEquipment       setSelectedStockItems([]);  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);  const [checklistResponses, setChecklistResponses] = useState<ChecklistResponse[]>([]);

    ? sectors.find(s => s.id === selectedEquipment.sectorId) 

    : null;      setStockItemForm({ stockItemId: '', quantity: 1 });

  const selectedCompany = selectedSector 

    ? companies.find(c => c.id === selectedSector.companyId)       setExecutionDescription('');  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);  const [executionDescription, setExecutionDescription] = useState('');

    : null;

      setChecklistResponses([]);

  // Helper para obter cor da prioridade

  const getPriorityColor = (priority: string) => {      setUploadedPhotos([]);    

    switch (priority) {

      case 'LOW': return 'bg-blue-500';      setActiveTab("details");

      case 'MEDIUM': return 'bg-yellow-500';

      case 'HIGH': return 'bg-orange-500';      setErrors({});  const [equipment] = useEquipment();  const [equipment] = useEquipment();

      case 'CRITICAL': return 'bg-red-500';

      default: return 'bg-gray-500';    }

    }

  };  }, [isOpen]);  const [sectors] = useSectors();  const [sectors] = useSectors();



  const getPriorityLabel = (priority: string) => {

    switch (priority) {

      case 'LOW': return 'Baixa';  // Validação do formulário  const [companies] = useCompanies();  const [companies] = useCompanies();

      case 'MEDIUM': return 'Média';

      case 'HIGH': return 'Alta';  const validateForm = (): boolean => {

      case 'CRITICAL': return 'Crítica';

      default: return priority;    const newErrors: Record<string, string> = {};  const [stockItems] = useStockItems();  const [stockItems] = useStockItems();

    }

  };    



  return (    if (!formData.type) newErrors.type = 'Tipo de ordem é obrigatório';  

    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0">    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';

        {/* CORREÇÃO 1: Header sem botão X manual (Dialog já tem o X) */}

        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">    if (!formData.description) newErrors.description = 'Descrição é obrigatória';  // Simulação de autenticação - substituir pela implementação real  // Simulação do hook de autenticação - substituir pela implementação real

          <div className="flex items-start justify-between">

            <div className="flex-1">    if (!formData.equipmentId) newErrors.equipmentId = 'Equipamento é obrigatório';

              <div className="flex items-center gap-3">

                <DialogTitle className="text-xl font-semibold flex items-center gap-2">    if (!formData.scheduledDate) newErrors.scheduledDate = 'Data programada é obrigatória';  const user = { name: 'Usuário Atual', role: 'admin' };  const user = { name: 'Usuário Atual', role: 'ADMIN' }; // Placeholder

                  <ClipboardList className="h-5 w-5 text-primary" />

                  Editar Ordem de Serviço    if (!formData.status) newErrors.status = 'Status é obrigatório';

                </DialogTitle>

                {/* CORREÇÃO 2: Badge de Status com melhor visibilidade e contraste */}      const canEditDetails = user.role === 'ADMIN';

                <Badge 

                  variant="outline"     // Validações específicas para status concluído

                  className={cn(

                    "flex items-center gap-1.5 px-2.5 py-1 border font-medium",    if (formData.status === 'COMPLETED' && !formData.completedAt) {  // Verificar permissões do usuário  const canEditExecution = true; // Tanto admin quanto técnico podem editar execução

                    formData.status === 'OPEN' && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",

                    formData.status === 'IN_PROGRESS' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",      newErrors.completedAt = 'Data de conclusão é obrigatória para ordens concluídas';

                    formData.status === 'COMPLETED' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"

                  )}    }  const canEditDetails = user?.role === 'admin';  

                >

                  {formData.status === 'OPEN' && <AlertCircle className="h-3.5 w-3.5" />}    

                  {formData.status === 'IN_PROGRESS' && <Clock className="h-3.5 w-3.5" />}

                  {formData.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}    setErrors(newErrors);  const canEditExecution = user?.role === 'technician' || user?.role === 'admin';  // Carregar dados da ordem de serviço quando abrir o modal

                  <span>

                    {formData.status === 'OPEN' && 'Aberta'}    return Object.keys(newErrors).length === 0;

                    {formData.status === 'IN_PROGRESS' && 'Em Progresso'}

                    {formData.status === 'COMPLETED' && 'Concluída'}  };  const canEditMaterials = user?.role === 'technician' || user?.role === 'admin';  useEffect(() => {

                  </span>

                </Badge>

              </div>

              <DialogDescription className="mt-1.5">  // Manipuladores de eventos    if (workOrder && isOpen) {

                OS #{workOrder.number} - {workOrder.type === 'PREVENTIVE' ? 'Manutenção Preventiva' : 'Manutenção Corretiva'}

              </DialogDescription>  const handleSave = () => {

            </div>

          </div>    if (!formData || !workOrder) return;  // Carregar dados da ordem de serviço quando abrir o modal      setFormData({ ...workOrder });

        </DialogHeader>

    

        {/* CORREÇÃO 4: Content com scroll corrigido usando ScrollArea */}

        <div className="flex-1 overflow-hidden flex flex-col">    if (!validateForm()) {  useEffect(() => {      

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">

            <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/50 rounded-none border-b shrink-0">      setActiveTab("details");

              <TabsTrigger 

                value="details"       return;    if (workOrder && isOpen) {      // Converter WorkOrderStockItem[] para StockItemRequest[]

                className="flex items-center gap-2 data-[state=active]:bg-background"

                disabled={!canEditDetails && workOrder.status !== 'OPEN'}    }

              >

                {!canEditDetails && workOrder.status !== 'OPEN' ? (          setFormData({ ...workOrder });      const stockItemRequests: StockItemRequest[] = (workOrder.stockItems || []).map(item => ({

                  <Lock className="h-4 w-4" />

                ) : (    setIsSubmitting(true);

                  <Info className="h-4 w-4" />

                )}                  id: item.id,

                Detalhes

                {!canEditDetails && (    setTimeout(() => {

                  <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">

                    Somente Leitura      try {      const stockItemRequests: StockItemRequest[] = (workOrder.stockItems || []).map(item => ({        stockItemId: item.stockItemId,

                  </Badge>

                )}        const updatedStockItems: WorkOrderStockItem[] = selectedStockItems.map(item => ({

              </TabsTrigger>

                        id: item.id,        id: item.id,        name: item.stockItem?.description || `Item ${item.stockItemId}`,

              <TabsTrigger 

                value="execution"           workOrderId: workOrder.id,

                className="flex items-center gap-2 data-[state=active]:bg-background"

                disabled={!canEditExecution}          stockItemId: item.stockItemId,        stockItemId: item.stockItemId,        quantity: item.quantity,

              >

                <Wrench className="h-4 w-4" />          quantity: item.quantity,

                Execução

              </TabsTrigger>          stockItem: stockItems.find(si => si.id === item.stockItemId)        name: item.stockItem?.description || `Item ${item.stockItemId}`,        unit: item.stockItem?.unit || 'un'

              

              <TabsTrigger         }));

                value="materials" 

                className="flex items-center gap-2 data-[state=active]:bg-background"        quantity: item.quantity,      }));

                disabled={!canEditMaterials}

              >        const updatedWorkOrder: WorkOrder = {

                <Package className="h-4 w-4" />

                Materiais          ...workOrder,        unit: item.stockItem?.unit || 'un'      

                {selectedStockItems.length > 0 && (

                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">          ...formData,

                    {selectedStockItems.length}

                  </span>          stockItems: updatedStockItems,      }));      setSelectedStockItems(stockItemRequests);

                )}

              </TabsTrigger>          executionDescription,

              

              <TabsTrigger           checklistResponses,            setUploadedPhotos(workOrder.photos || []);

                value="photos" 

                className="flex items-center gap-2 data-[state=active]:bg-background"          photos: uploadedPhotos

              >

                <Camera className="h-4 w-4" />        };      setSelectedStockItems(stockItemRequests);      

                Fotos

                {uploadedPhotos.length > 0 && (        

                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">

                    {uploadedPhotos.length}        onSave(updatedWorkOrder);      setExecutionDescription(workOrder.executionDescription || '');      // Se for ordem preventiva sem checklist, criar um exemplo

                  </span>

                )}        toast.success('Ordem de serviço atualizada com sucesso!');

              </TabsTrigger>

            </TabsList>        onClose();      setUploadedPhotos(workOrder.photos || []);      const defaultChecklist: ChecklistResponse[] = workOrder.type === 'PREVENTIVE' && (!workOrder.checklistResponses || workOrder.checklistResponses.length === 0) ? [

            

            {/* Tabs Content com ScrollArea para scroll funcional */}      } catch (error) {

            <div className="flex-1">

              <ScrollArea className="h-full">        console.error('Erro ao salvar ordem de serviço:', error);              {

                <div className="p-6">

                  {/* CORREÇÃO 3: Aba de Detalhes - Layout horizontal (stack) ao invés de 2 colunas */}        toast.error('Erro ao salvar ordem de serviço');

                  <TabsContent value="details" className="mt-0 space-y-6">

                    {!canEditDetails && (      } finally {      // Se for ordem preventiva sem checklist, criar um exemplo          taskId: 'task-1',

                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4">

                        <div className="flex items-center gap-2">        setIsSubmitting(false);

                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />

                          <p className="text-sm text-yellow-800 dark:text-yellow-200">      }      const defaultChecklist: ChecklistResponse[] = workOrder.type === 'PREVENTIVE' && (!workOrder.checklistResponses || workOrder.checklistResponses.length === 0) ? [          taskName: 'Inspeção Visual do Equipamento',

                            Você possui apenas permissão de visualização nesta seção.

                          </p>    }, 500);

                        </div>

                      </div>  };        {          completed: false,

                    )}

                    

                    {/* Cards em Layout Stack - Sem grid de 2 colunas */}

                    <div className="space-y-6">  // Upload de fotos          taskId: 'task-1',          observations: '',

                      {/* Card de Informações Básicas */}

                      <div className="rounded-lg border bg-card">  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

                        <div className="px-4 py-3 border-b bg-muted/50">

                          <h3 className="text-sm font-medium flex items-center gap-2">    const files = event.target.files;          taskName: 'Inspeção Visual do Equipamento',          checkItems: [

                            <ClipboardList className="h-4 w-4 text-muted-foreground" />

                            Informações Básicas    if (!files || files.length === 0) return;

                          </h3>

                        </div>          completed: false,            { id: 'check-1', description: 'Verificar ruídos anormais', checked: false },

                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                          <div className="space-y-2">    setIsUploadingPhoto(true);

                            <Label htmlFor="workOrderType">

                              Tipo de Ordem <span className="text-destructive">*</span>              observations: '',            { id: 'check-2', description: 'Verificar vazamentos', checked: false },

                            </Label>

                            <Select     setTimeout(() => {

                              value={formData.type || ''} 

                              onValueChange={(value) => {      const newPhotos: UploadedPhoto[] = Array.from(files).map(file => ({          checkItems: [            { id: 'check-3', description: 'Verificar condição das mangueiras', checked: false }

                                if (canEditDetails) {

                                  setFormData(prev => ({ ...prev, type: value as WorkOrder['type'] }));        id: `photo-${Date.now()}-${Math.random()}`,

                                  if (errors.type) setErrors(prev => ({ ...prev, type: '' }));

                                }        url: URL.createObjectURL(file),            { id: 'check-1', description: 'Verificar ruídos anormais', checked: false },          ]

                              }}

                              disabled={!canEditDetails}        name: file.name,

                            >

                              <SelectTrigger className={cn(errors.type && "border-destructive")}>        uploadedAt: new Date().toISOString(),            { id: 'check-2', description: 'Verificar vazamentos', checked: false },        },

                                <SelectValue placeholder="Selecione o tipo" />

                              </SelectTrigger>        uploadedBy: user?.name || 'Técnico'

                              <SelectContent>

                                <SelectItem value="CORRECTIVE">      }));            { id: 'check-3', description: 'Verificar condição das mangueiras', checked: false }        {

                                  <div className="flex items-center gap-2">

                                    <Wrench className="h-4 w-4" />      

                                    Corretiva

                                  </div>      setUploadedPhotos(prev => [...prev, ...newPhotos]);          ]          taskId: 'task-2',

                                </SelectItem>

                                <SelectItem value="PREVENTIVE">      setIsUploadingPhoto(false);

                                  <div className="flex items-center gap-2">

                                    <Calendar className="h-4 w-4" />      toast.success(`${files.length} foto(s) adicionada(s) com sucesso!`);        },          taskName: 'Limpeza e Manutenção',

                                    Preventiva

                                  </div>      

                                </SelectItem>

                              </SelectContent>      if (fileInputRef.current) {        {          completed: false,

                            </Select>

                            {errors.type && (        fileInputRef.current.value = '';

                              <p className="text-xs text-destructive">{errors.type}</p>

                            )}      }          taskId: 'task-2',          observations: '',

                          </div>

                              }, 1000);

                          <div className="space-y-2">

                            <Label>  };          taskName: 'Limpeza e Manutenção',          checkItems: [

                              Prioridade <span className="text-destructive">*</span>

                            </Label>

                            <Select 

                              value={formData.priority || ''}   const removePhoto = (photoId: string) => {          completed: false,            { id: 'check-4', description: 'Limpar filtros', checked: false },

                              onValueChange={(value) => {

                                if (canEditDetails) {    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));

                                  setFormData(prev => ({ ...prev, priority: value as WorkOrder['priority'] }));

                                  if (errors.priority) setErrors(prev => ({ ...prev, priority: '' }));    toast.success('Foto removida');          observations: '',            { id: 'check-5', description: 'Verificar pressão do sistema', checked: false },

                                }

                              }}  };

                              disabled={!canEditDetails}

                            >          checkItems: [            { id: 'check-6', description: 'Lubrificar componentes', checked: false }

                              <SelectTrigger className={cn(errors.priority && "border-destructive")}>

                                <SelectValue placeholder="Selecione a prioridade" />  const updateChecklistResponse = (taskId: string, field: string, value: any) => {

                              </SelectTrigger>

                              <SelectContent>    setChecklistResponses(prev => prev.map(response => {            { id: 'check-4', description: 'Limpar filtros', checked: false },          ]

                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (

                                  <SelectItem key={priority} value={priority}>      if (response.taskId === taskId) {

                                    <div className="flex items-center gap-2">

                                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(priority))} />        if (field === 'checkItem') {            { id: 'check-5', description: 'Verificar pressão do sistema', checked: false },        }

                                      <span>{getPriorityLabel(priority)}</span>

                                    </div>          const { itemId, checked } = value;

                                  </SelectItem>

                                ))}          return {            { id: 'check-6', description: 'Lubrificar componentes', checked: false }      ] : (workOrder.checklistResponses || []);

                              </SelectContent>

                            </Select>            ...response,

                            {errors.priority && (

                              <p className="text-xs text-destructive">{errors.priority}</p>            checkItems: response.checkItems?.map(item =>          ]      

                            )}

                          </div>              item.id === itemId ? { ...item, checked } : item



                          <div className="space-y-2">            )        }      setChecklistResponses(defaultChecklist);

                            <Label>

                              <User className="h-3.5 w-3.5 inline mr-1.5" />          };

                              Responsável

                            </Label>        }      ] : (workOrder.checklistResponses || []);      setExecutionDescription(workOrder.executionDescription || '');

                            <Input 

                              value={formData.assignedTo || ''}         return { ...response, [field]: value };

                              onChange={(e) => {

                                if (canEditDetails) {      }            setActiveTab("details");

                                  setFormData(prev => ({ ...prev, assignedTo: e.target.value }));

                                }      return response;

                              }}

                              placeholder="Nome do técnico responsável"    }));      setChecklistResponses(defaultChecklist);      setErrors({});

                              disabled={!canEditDetails}

                            />  };

                          </div>

                                      }

                          <div className="space-y-2 md:col-span-3">

                            <Label>  const addStockItem = () => {

                              Descrição <span className="text-destructive">*</span>

                            </Label>    if (!stockItemForm.stockItemId) return;      // Definir aba inicial baseada no status  }, [workOrder, isOpen]);

                            <Textarea 

                              value={formData.description || ''}     

                              onChange={(e) => {

                                if (canEditDetails) {    const stockItem = stockItems.find(si => si.id === stockItemForm.stockItemId);      if (workOrder.status === 'IN_PROGRESS' && canEditExecution) {

                                  setFormData(prev => ({ ...prev, description: e.target.value }));

                                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));    

                                }

                              }}    if (stockItem) {        setActiveTab("execution");  // Reset form when modal closes

                              placeholder="Descreva o problema ou trabalho a ser realizado"

                              rows={3}      const newStockItemRequest: StockItemRequest = {

                              disabled={!canEditDetails}

                              className={cn(        id: `${stockItem.id}-${Date.now()}`,      } else {  useEffect(() => {

                                "resize-none",

                                errors.description && "border-destructive"        stockItemId: stockItem.id,

                              )}

                            />        name: stockItem.description,        setActiveTab("details");    if (!isOpen) {

                            {errors.description && (

                              <p className="text-xs text-destructive">{errors.description}</p>        quantity: stockItemForm.quantity,

                            )}

                          </div>        unit: stockItem.unit      }      setFormData({});

                        </div>

                      </div>      };

                      

                      {/* Card de Agendamento */}                  setSelectedStockItems([]);

                      <div className="rounded-lg border bg-card">

                        <div className="px-4 py-3 border-b bg-muted/50">      setSelectedStockItems(prev => [...prev, newStockItemRequest]);

                          <h3 className="text-sm font-medium flex items-center gap-2">

                            <CalendarClock className="h-4 w-4 text-muted-foreground" />      setStockItemForm({ stockItemId: '', quantity: 1 });      setErrors({});      setStockItemForm({ stockItemId: '', quantity: 1 });

                            Agendamento

                          </h3>    }

                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">  };    }      setActiveTab("details");

                          <div className="space-y-2">

                            <Label>

                              Data Programada <span className="text-destructive">*</span>

                            </Label>  const removeStockItem = (id: string) => {  }, [workOrder, isOpen, canEditExecution]);      setErrors({});

                            <DatePicker

                              date={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}    setSelectedStockItems(prev => prev.filter(item => item.id !== id));

                              setDate={(date) => {

                                if (canEditDetails) {  };    }

                                  setFormData(prev => ({ ...prev, scheduledDate: date?.toISOString() }));

                                  if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: '' }));

                                }

                              }}  const availableStockItems = stockItems.filter(  // Reset form when modal closes  }, [isOpen]);

                              disabled={!canEditDetails}

                              className={cn(errors.scheduledDate && "border-destructive")}    si => !selectedStockItems.some(selected => selected.stockItemId === si.id)

                            />

                            {errors.scheduledDate && (  );  useEffect(() => {

                              <p className="text-xs text-destructive">{errors.scheduledDate}</p>

                            )}

                          </div>

  if (!workOrder) return null;    if (!isOpen) {  // Validação do formulário

                          {formData.completedAt && (

                            <div className="space-y-2">

                              <Label>

                                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5" />  // Encontrar o equipamento selecionado      setFormData({});  const validateForm = (): boolean => {

                                Data de Conclusão

                              </Label>  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);

                              <DatePicker

                                date={new Date(formData.completedAt)}  const selectedSector = selectedEquipment       setSelectedStockItems([]);    const newErrors: Record<string, string> = {};

                                setDate={() => {}}

                                disabled={true}    ? sectors.find(s => s.id === selectedEquipment.sectorId) 

                              />

                            </div>    : null;      setStockItemForm({ stockItemId: '', quantity: 1 });    

                          )}

                        </div>  const selectedCompany = selectedSector 

                      </div>

    ? companies.find(c => c.id === selectedSector.companyId)       setExecutionDescription('');    if (!formData.type) newErrors.type = 'Tipo de ordem é obrigatório';

                      {/* Card de Localização e Equipamento */}

                      <div className="rounded-lg border bg-card">    : null;

                        <div className="px-4 py-3 border-b bg-muted/50">

                          <h3 className="text-sm font-medium flex items-center gap-2">      setChecklistResponses([]);    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';

                            <Building className="h-4 w-4 text-muted-foreground" />

                            Localização e Equipamento  // Helper para obter cor da prioridade

                          </h3>

                        </div>  const getPriorityColor = (priority: string) => {      setUploadedPhotos([]);    if (!formData.description) newErrors.description = 'Descrição é obrigatória';

                        <div className="p-4 space-y-4">

                          <div className="space-y-2">    switch (priority) {

                            <Label>

                              <Tag className="h-3.5 w-3.5 inline mr-1.5" />      case 'LOW': return 'bg-blue-500';      setActiveTab("details");    if (!formData.equipmentId) newErrors.equipmentId = 'Equipamento é obrigatório';

                              Equipamento <span className="text-destructive">*</span>

                            </Label>      case 'MEDIUM': return 'bg-yellow-500';

                            <Select 

                              value={formData.equipmentId || ''}       case 'HIGH': return 'bg-orange-500';      setErrors({});    if (!formData.scheduledDate) newErrors.scheduledDate = 'Data programada é obrigatória';

                              onValueChange={(value) => {

                                if (canEditDetails) {      case 'CRITICAL': return 'bg-red-500';

                                  setFormData(prev => ({ ...prev, equipmentId: value }));

                                  if (errors.equipmentId) setErrors(prev => ({ ...prev, equipmentId: '' }));      default: return 'bg-gray-500';    }    if (!formData.status) newErrors.status = 'Status é obrigatório';

                                }

                              }}    }

                              disabled={!canEditDetails}

                            >  };  }, [isOpen]);    

                              <SelectTrigger className={cn(errors.equipmentId && "border-destructive")}>

                                <SelectValue placeholder="Selecione o equipamento" />

                              </SelectTrigger>

                              <SelectContent>  const getPriorityLabel = (priority: string) => {    // Validações específicas para status concluído

                                {equipment.map(eq => (

                                  <SelectItem key={eq.id} value={eq.id}>    switch (priority) {

                                    <div className="flex flex-col">

                                      <span className="font-medium">{eq.tag}</span>      case 'LOW': return 'Baixa';  // Validação do formulário    if (formData.status === 'COMPLETED' && !formData.completedAt) {

                                      <span className="text-xs text-muted-foreground">

                                        {eq.brand} {eq.model}      case 'MEDIUM': return 'Média';

                                      </span>

                                    </div>      case 'HIGH': return 'Alta';  const validateForm = (): boolean => {      newErrors.completedAt = 'Data de conclusão é obrigatória para ordens concluídas';

                                  </SelectItem>

                                ))}      case 'CRITICAL': return 'Crítica';

                              </SelectContent>

                            </Select>      default: return priority;    const newErrors: Record<string, string> = {};    }

                            {errors.equipmentId && (

                              <p className="text-xs text-destructive">{errors.equipmentId}</p>    }

                            )}

                          </div>  };        

                          

                          {selectedEquipment && (

                            <div className="rounded-lg bg-muted/50 p-4">

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">  return (    if (!formData.type) newErrors.type = 'Tipo de ordem é obrigatório';    setErrors(newErrors);

                                <div>

                                  <span className="text-muted-foreground">Tipo:</span>    <Dialog open={isOpen} onOpenChange={onClose}>

                                  <p className="font-medium">{selectedEquipment.type}</p>

                                </div>      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0">    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';    return Object.keys(newErrors).length === 0;

                                <div>

                                  <span className="text-muted-foreground">Marca:</span>        {/* Header - Removido botão X manual */}

                                  <p className="font-medium">{selectedEquipment.brand}</p>

                                </div>        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">    if (!formData.description) newErrors.description = 'Descrição é obrigatória';  };

                                <div>

                                  <span className="text-muted-foreground">Modelo:</span>          <div className="flex items-start justify-between">

                                  <p className="font-medium">{selectedEquipment.model}</p>

                                </div>            <div className="flex-1">    if (!formData.equipmentId) newErrors.equipmentId = 'Equipamento é obrigatório';

                                <div>

                                  <span className="text-muted-foreground">Capacidade:</span>              <div className="flex items-center gap-3">

                                  <p className="font-medium">{selectedEquipment.capacity.toLocaleString()} BTUs</p>

                                </div>                <DialogTitle className="text-xl font-semibold flex items-center gap-2">    if (!formData.scheduledDate) newErrors.scheduledDate = 'Data programada é obrigatória';  // Referência para input de arquivo

                              </div>

                                                <ClipboardList className="h-5 w-5 text-primary" />

                              <Separator className="my-3" />

                                                Editar Ordem de Serviço    if (!formData.status) newErrors.status = 'Status é obrigatório';  const fileInputRef = useRef<HTMLInputElement>(null);

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                <div>                </DialogTitle>

                                  <span className="text-muted-foreground">Empresa:</span>

                                  <p className="font-medium">{selectedCompany?.name || 'Não definida'}</p>                {/* Badge de Status com melhor visibilidade */}    

                                </div>

                                <div>                <Badge 

                                  <span className="text-muted-foreground">Setor:</span>

                                  <p className="font-medium">{selectedSector?.name || 'Não definido'}</p>                  variant="outline"     // Validações específicas para status concluído  // Manipuladores de eventos

                                </div>

                              </div>                  className={cn(

                            </div>

                          )}                    "flex items-center gap-1.5 px-2.5 py-1 border font-medium",    if (formData.status === 'COMPLETED' && !formData.completedAt) {  // Upload de fotos

                        </div>

                      </div>                    formData.status === 'OPEN' && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",

                    </div>

                  </TabsContent>                    formData.status === 'IN_PROGRESS' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",      newErrors.completedAt = 'Data de conclusão é obrigatória para ordens concluídas';  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {



                  {/* Aba de Execução */}                    formData.status === 'COMPLETED' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"

                  <TabsContent value="execution" className="mt-0 space-y-6">

                    <div className="rounded-lg border bg-card">                  )}    }    const files = event.target.files;

                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">                >

                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />

                          Controle de Status                  {formData.status === 'OPEN' && <AlertCircle className="h-3.5 w-3.5" />}        if (!files) return;

                        </h3>

                      </div>                  {formData.status === 'IN_PROGRESS' && <Clock className="h-3.5 w-3.5" />}

                      <div className="p-4 space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  {formData.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}    setErrors(newErrors);

                          <div className="space-y-2">

                            <Label>Alterar Status</Label>                  <span>

                            <Select 

                              value={formData.status || ''}                     {formData.status === 'OPEN' && 'Aberta'}    return Object.keys(newErrors).length === 0;    Array.from(files).forEach((file) => {

                              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}

                              disabled={!canEditExecution}                    {formData.status === 'IN_PROGRESS' && 'Em Progresso'}

                            >

                              <SelectTrigger>                    {formData.status === 'COMPLETED' && 'Concluída'}  };      if (file.type.startsWith('image/')) {

                                <SelectValue placeholder="Selecione o status" />

                              </SelectTrigger>                  </span>

                              <SelectContent>

                                <SelectItem value="OPEN">                </Badge>        const reader = new FileReader();

                                  <div className="flex items-center gap-2">

                                    <Circle className="h-3 w-3 text-yellow-500" />              </div>

                                    Aberta

                                  </div>              <DialogDescription className="mt-1.5">  // Manipuladores de eventos        reader.onload = (e) => {

                                </SelectItem>

                                <SelectItem value="IN_PROGRESS">                OS #{workOrder.number} - {workOrder.type === 'PREVENTIVE' ? 'Manutenção Preventiva' : 'Manutenção Corretiva'}

                                  <div className="flex items-center gap-2">

                                    <Clock className="h-3 w-3 text-blue-500" />              </DialogDescription>  const handleSave = () => {          const newPhoto: UploadedPhoto = {

                                    Em Progresso

                                  </div>            </div>

                                </SelectItem>

                                <SelectItem value="COMPLETED">          </div>    if (!formData || !workOrder) return;            id: `photo-${Date.now()}-${Math.random()}`,

                                  <div className="flex items-center gap-2">

                                    <CheckCircle2 className="h-3 w-3 text-green-500" />        </DialogHeader>

                                    Concluída

                                  </div>                url: e.target?.result as string,

                                </SelectItem>

                              </SelectContent>        {/* Content com scroll corrigido */}

                            </Select>

                          </div>        <div className="flex-1 overflow-hidden flex flex-col">    if (!validateForm()) {            name: file.name,

                          

                          {formData.status === 'COMPLETED' && (          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">

                            <div className="space-y-2">

                              <Label>            <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/50 rounded-none border-b shrink-0">      setActiveTab("details");            uploadedAt: new Date().toISOString(),

                                <CalendarClock className="h-3.5 w-3.5 inline mr-1.5" />

                                Data de Conclusão              <TabsTrigger 

                              </Label>

                              <DatePicker                value="details"       return;            uploadedBy: user?.name || 'Usuário'

                                date={formData.completedAt ? new Date(formData.completedAt) : undefined}

                                setDate={(date) => setFormData(prev => ({ ...prev, completedAt: date?.toISOString() }))}                className="flex items-center gap-2 data-[state=active]:bg-background"

                                placeholder="Selecione quando foi concluída"

                                disabled={!canEditExecution}                disabled={!canEditDetails && workOrder.status !== 'OPEN'}    }          };

                              />

                            </div>              >

                          )}

                        </div>                {!canEditDetails && workOrder.status !== 'OPEN' ? (              setUploadedPhotos(prev => [...prev, newPhoto]);

                      </div>

                    </div>                  <Lock className="h-4 w-4" />



                    <div className="rounded-lg border bg-card">                ) : (    setIsSubmitting(true);        };

                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">                  <Info className="h-4 w-4" />

                          <FileText className="h-4 w-4 text-muted-foreground" />

                          Descrição do Trabalho Realizado                )}            reader.readAsDataURL(file);

                        </h3>

                      </div>                Detalhes

                      <div className="p-4">

                        <Textarea                {!canEditDetails && (    setTimeout(() => {      }

                          value={executionDescription}

                          onChange={(e) => setExecutionDescription(e.target.value)}                  <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">

                          placeholder={

                            workOrder.type === 'CORRECTIVE'                     Somente Leitura      try {    });

                              ? "Descreva detalhadamente o que foi feito para resolver o problema..."

                              : "Descreva as atividades realizadas durante a manutenção preventiva..."                  </Badge>

                          }

                          rows={6}                )}        const updatedStockItems: WorkOrderStockItem[] = selectedStockItems.map(item => ({

                          disabled={!canEditExecution}

                          className="resize-none"              </TabsTrigger>

                        />

                        <p className="text-xs text-muted-foreground mt-2">                        id: item.id,    // Limpar input

                          Este campo é importante para o histórico de manutenções do equipamento.

                        </p>              <TabsTrigger 

                      </div>

                    </div>                value="execution"           workOrderId: workOrder.id,    if (event.target) {



                    {workOrder.type === 'PREVENTIVE' && checklistResponses.length > 0 && (                className="flex items-center gap-2 data-[state=active]:bg-background"

                      <div className="rounded-lg border bg-card">

                        <div className="px-4 py-3 border-b bg-muted/50">                disabled={!canEditExecution}          stockItemId: item.stockItemId,      event.target.value = '';

                          <h3 className="text-sm font-medium flex items-center gap-2">

                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />              >

                            Checklist de Manutenção Preventiva

                          </h3>                <Wrench className="h-4 w-4" />          quantity: item.quantity,    }

                        </div>

                        <div className="p-4 space-y-4">                Execução

                          {checklistResponses.map((response, index) => (

                            <Card key={response.taskId} className="p-4">              </TabsTrigger>          stockItem: stockItems.find(si => si.id === item.stockItemId)  };

                              <div className="space-y-3">

                                <div className="flex items-start gap-3">              

                                  <Checkbox

                                    id={`task-${response.taskId}`}              <TabsTrigger         }));

                                    checked={response.completed}

                                    onCheckedChange={(checked) =>                 value="materials" 

                                      updateChecklistResponse(response.taskId, 'completed', checked)

                                    }                className="flex items-center gap-2 data-[state=active]:bg-background"  // Remover foto

                                    disabled={!canEditExecution}

                                  />                disabled={!canEditMaterials}

                                  <div className="space-y-1 flex-1">

                                    <Label               >        const updatedWorkOrder: WorkOrder = {  const removePhoto = (photoId: string) => {

                                      htmlFor={`task-${response.taskId}`}

                                      className="text-sm font-medium cursor-pointer"                <Package className="h-4 w-4" />

                                    >

                                      {index + 1}. {response.taskName}                Materiais          ...workOrder,    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));

                                    </Label>

                                                    {selectedStockItems.length > 0 && (

                                    {response.checkItems && response.checkItems.length > 0 && (

                                      <div className="ml-4 space-y-2 mt-2">                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">          ...formData,  };

                                        {response.checkItems.map(item => (

                                          <div key={item.id} className="flex items-center gap-2">                    {selectedStockItems.length}

                                            <Checkbox

                                              id={`check-${item.id}`}                  </span>          stockItems: updatedStockItems,

                                              checked={item.checked}

                                              onCheckedChange={(checked) =>                 )}

                                                updateChecklistResponse(

                                                  response.taskId,               </TabsTrigger>          executionDescription,  const handleSave = () => {

                                                  'checkItem', 

                                                  { itemId: item.id, checked }              

                                                )

                                              }              <TabsTrigger           checklistResponses,    if (!formData || !workOrder) return;

                                              disabled={!canEditExecution}

                                              className="h-3 w-3"                value="photos" 

                                            />

                                            <Label                 className="flex items-center gap-2 data-[state=active]:bg-background"          photos: uploadedPhotos    

                                              htmlFor={`check-${item.id}`}

                                              className="text-xs text-muted-foreground cursor-pointer"              >

                                            >

                                              {item.description}                <Camera className="h-4 w-4" />        };    if (!validateForm()) {

                                            </Label>

                                          </div>                Fotos

                                        ))}

                                      </div>                {uploadedPhotos.length > 0 && (              setActiveTab("details");

                                    )}

                                                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">

                                    <div className="mt-3">

                                      <Label className="text-xs text-muted-foreground">                    {uploadedPhotos.length}        onSave(updatedWorkOrder);      return;

                                        Observações (opcional)

                                      </Label>                  </span>

                                      <Textarea

                                        value={response.observations || ''}                )}        toast.success('Ordem de serviço atualizada com sucesso!');    }

                                        onChange={(e) => 

                                          updateChecklistResponse(response.taskId, 'observations', e.target.value)              </TabsTrigger>

                                        }

                                        placeholder="Adicione observações se necessário..."            </TabsList>        onClose();    

                                        rows={2}

                                        disabled={!canEditExecution}            

                                        className="resize-none mt-1 text-sm"

                                      />            {/* TabsContent com ScrollArea corrigida */}      } catch (error) {    setIsSubmitting(true);

                                    </div>

                                  </div>            <div className="flex-1">

                                </div>

                              </div>              <ScrollArea className="h-full">        console.error('Erro ao salvar ordem de serviço:', error);    

                            </Card>

                          ))}                <div className="p-6">

                        </div>

                      </div>                  {/* Aba de Detalhes - Layout horizontal (stack) */}        toast.error('Erro ao salvar ordem de serviço');    setTimeout(() => {

                    )}

                  </TabsContent>                  <TabsContent value="details" className="mt-0 space-y-6">



                  {/* Aba de Materiais */}                    {!canEditDetails && (      } finally {      try {

                  <TabsContent value="materials" className="mt-0 space-y-6">

                    <div className="rounded-lg border bg-card">                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4">

                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">                        <div className="flex items-center gap-2">        setIsSubmitting(false);        // Converter StockItemRequest[] de volta para WorkOrderStockItem[]

                          <Package className="h-4 w-4 text-muted-foreground" />

                          Itens de Estoque Utilizados                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />

                        </h3>

                      </div>                          <p className="text-sm text-yellow-800 dark:text-yellow-200">      }        const updatedStockItems: WorkOrderStockItem[] = selectedStockItems.map(item => ({

                      <div className="p-4 space-y-4">

                        <div className="flex flex-col sm:flex-row gap-3">                            Você possui apenas permissão de visualização nesta seção.

                          <div className="flex-1">

                            <Select                           </p>    }, 500);          id: item.id,

                              value={stockItemForm.stockItemId} 

                              onValueChange={(value) => setStockItemForm(prev => ({ ...prev, stockItemId: value }))}                        </div>

                              disabled={!canEditMaterials}

                            >                      </div>  };          workOrderId: workOrder.id,

                              <SelectTrigger>

                                <SelectValue placeholder="Selecione um item do estoque" />                    )}

                              </SelectTrigger>

                              <SelectContent>                              stockItemId: item.stockItemId,

                                {availableStockItems.map(item => (

                                  <SelectItem key={item.id} value={item.id}>                    {/* Cards em Layout Horizontal - Stack sem colunas */}

                                    <div className="flex justify-between items-center w-full">

                                      <span>{item.description}</span>                    <div className="space-y-6">  // Upload de fotos          quantity: item.quantity,

                                      <span className="text-xs text-muted-foreground ml-2">

                                        {item.unit}                      {/* Card de Informações Básicas */}

                                      </span>

                                    </div>                      <div className="rounded-lg border bg-card">  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {          stockItem: stockItems.find(si => si.id === item.stockItemId)

                                  </SelectItem>

                                ))}                        <div className="px-4 py-3 border-b bg-muted/50">

                              </SelectContent>

                            </Select>                          <h3 className="text-sm font-medium flex items-center gap-2">    const files = event.target.files;        }));

                          </div>

                                                      <ClipboardList className="h-4 w-4 text-muted-foreground" />

                          <div className="w-full sm:w-28">

                            <Input                             Informações Básicas    if (!files || files.length === 0) return;

                              type="number" 

                              min="1"                          </h3>

                              value={stockItemForm.quantity} 

                              onChange={(e) => setStockItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}                        </div>        // Combina os dados do formulário com os itens de estoque selecionados

                              placeholder="Qtd"

                              disabled={!canEditMaterials}                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                            />

                          </div>                          <div className="space-y-2">    setIsUploadingPhoto(true);        const updatedWorkOrder: WorkOrder = {

                          

                          <Button                             <Label htmlFor="workOrderType">

                            onClick={addStockItem}

                            disabled={!stockItemForm.stockItemId || !canEditMaterials}                              Tipo de Ordem <span className="text-destructive">*</span>              ...workOrder,

                            className="sm:w-auto"

                          >                            </Label>

                            <Plus className="h-4 w-4 mr-2" />

                            Adicionar                            <Select     setTimeout(() => {          ...formData,

                          </Button>

                        </div>                              value={formData.type || ''} 

                        

                        {selectedStockItems.length === 0 ? (                              onValueChange={(value) => {      const newPhotos: UploadedPhoto[] = Array.from(files).map(file => ({          stockItems: updatedStockItems,

                          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">

                            <div className="flex flex-col items-center text-center">                                if (canEditDetails) {

                              <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />

                              <p className="text-sm text-muted-foreground">                                  setFormData(prev => ({ ...prev, type: value as WorkOrder['type'] }));        id: `photo-${Date.now()}-${Math.random()}`,          executionDescription,

                                Nenhum item adicionado

                              </p>                                  if (errors.type) setErrors(prev => ({ ...prev, type: '' }));

                              <p className="text-xs text-muted-foreground mt-1">

                                Selecione itens do estoque que serão utilizados                                }        url: URL.createObjectURL(file),          photos: uploadedPhotos,

                              </p>

                            </div>                              }}

                          </div>

                        ) : (                              disabled={!canEditDetails}        name: file.name,          checklistResponses,

                          <div className="rounded-lg border overflow-hidden">

                            <table className="w-full">                            >

                              <thead>

                                <tr className="border-b bg-muted/50">                              <SelectTrigger className={cn(errors.type && "border-destructive")}>        uploadedAt: new Date().toISOString(),        };

                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">

                                    Item                                <SelectValue placeholder="Selecione o tipo" />

                                  </th>

                                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">                              </SelectTrigger>        uploadedBy: user?.name || 'Técnico'        

                                    Quantidade

                                  </th>                              <SelectContent>

                                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-16">

                                    Ação                                <SelectItem value="CORRECTIVE">      }));        onSave(updatedWorkOrder);

                                  </th>

                                </tr>                                  <div className="flex items-center gap-2">

                              </thead>

                              <tbody>                                    <Wrench className="h-4 w-4" />              onClose();

                                {selectedStockItems.map((item, index) => (

                                  <tr key={item.id} className={cn(                                    Corretiva

                                    "border-b",

                                    index % 2 === 0 ? "bg-background" : "bg-muted/20"                                  </div>      setUploadedPhotos(prev => [...prev, ...newPhotos]);      } catch (error) {

                                  )}>

                                    <td className="px-4 py-3">                                </SelectItem>

                                      <p className="font-medium text-sm">{item.name}</p>

                                    </td>                                <SelectItem value="PREVENTIVE">      setIsUploadingPhoto(false);        console.error('Erro ao salvar ordem de serviço:', error);

                                    <td className="px-4 py-3 text-center">

                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">                                  <div className="flex items-center gap-2">

                                        {item.quantity} {item.unit}

                                      </span>                                    <Calendar className="h-4 w-4" />      toast.success(`${files.length} foto(s) adicionada(s) com sucesso!`);      } finally {

                                    </td>

                                    <td className="px-4 py-3 text-center">                                    Preventiva

                                      <Button 

                                        variant="ghost"                                   </div>              setIsSubmitting(false);

                                        size="icon"

                                        onClick={() => removeStockItem(item.id)}                                </SelectItem>

                                        disabled={!canEditMaterials}

                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"                              </SelectContent>      if (fileInputRef.current) {      }

                                      >

                                        <Trash2 className="h-4 w-4" />                            </Select>

                                      </Button>

                                    </td>                            {errors.type && (        fileInputRef.current.value = '';    }, 500); // Simula delay de API

                                  </tr>

                                ))}                              <p className="text-xs text-destructive">{errors.type}</p>

                              </tbody>

                            </table>                            )}      }  };

                          </div>

                        )}                          </div>

                      </div>

                    </div>                              }, 1000);  

                  </TabsContent>

                                            <div className="space-y-2">

                  {/* Aba de Fotos */}

                  <TabsContent value="photos" className="mt-0 space-y-6">                            <Label>  };  const addStockItem = () => {

                    <div className="rounded-lg border bg-card">

                      <div className="px-4 py-3 border-b bg-muted/50">                              Prioridade <span className="text-destructive">*</span>

                        <h3 className="text-sm font-medium flex items-center gap-2">

                          <Camera className="h-4 w-4 text-muted-foreground" />                            </Label>    if (!stockItemForm.stockItemId) return;

                          Fotos e Evidências

                        </h3>                            <Select 

                      </div>

                      <div className="p-4 space-y-4">                              value={formData.priority || ''}   const removePhoto = (photoId: string) => {    

                        <div className="flex items-center gap-4">

                          <input                              onValueChange={(value) => {

                            ref={fileInputRef}

                            type="file"                                if (canEditDetails) {    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));    const stockItem = stockItems.find(si => si.id === stockItemForm.stockItemId);

                            accept="image/*"

                            multiple                                  setFormData(prev => ({ ...prev, priority: value as WorkOrder['priority'] }));

                            onChange={handlePhotoUpload}

                            className="hidden"                                  if (errors.priority) setErrors(prev => ({ ...prev, priority: '' }));    toast.success('Foto removida');    

                          />

                          <Button                                }

                            onClick={() => fileInputRef.current?.click()}

                            disabled={isUploadingPhoto}                              }}  };    if (stockItem) {

                            variant="outline"

                          >                              disabled={!canEditDetails}

                            {isUploadingPhoto ? (

                              <>                            >      const newStockItemRequest: StockItemRequest = {

                                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />

                                Enviando...                              <SelectTrigger className={cn(errors.priority && "border-destructive")}>

                              </>

                            ) : (                                <SelectValue placeholder="Selecione a prioridade" />  const updateChecklistResponse = (taskId: string, field: string, value: any) => {        id: `${stockItem.id}-${Date.now()}`,

                              <>

                                <Upload className="h-4 w-4 mr-2" />                              </SelectTrigger>

                                Adicionar Fotos

                              </>                              <SelectContent>    setChecklistResponses(prev => prev.map(response => {        stockItemId: stockItem.id,

                            )}

                          </Button>                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (

                          <p className="text-sm text-muted-foreground">

                            Formatos aceitos: JPG, PNG, GIF (máx. 5MB cada)                                  <SelectItem key={priority} value={priority}>      if (response.taskId === taskId) {        name: stockItem.description,

                          </p>

                        </div>                                    <div className="flex items-center gap-2">

                        

                        {uploadedPhotos.length === 0 ? (                                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(priority))} />        if (field === 'checkItem') {        quantity: stockItemForm.quantity,

                          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">

                            <div className="flex flex-col items-center text-center">                                      <span>{getPriorityLabel(priority)}</span>

                              <Camera className="h-12 w-12 text-muted-foreground/50 mb-3" />

                              <p className="text-sm text-muted-foreground">                                    </div>          const { itemId, checked } = value;        unit: stockItem.unit

                                Nenhuma foto adicionada

                              </p>                                  </SelectItem>

                              <p className="text-xs text-muted-foreground mt-1">

                                Adicione fotos para documentar o trabalho realizado                                ))}          return {      };

                              </p>

                            </div>                              </SelectContent>

                          </div>

                        ) : (                            </Select>            ...response,      

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                            {uploadedPhotos.map(photo => (                            {errors.priority && (

                              <div key={photo.id} className="relative group">

                                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">                              <p className="text-xs text-destructive">{errors.priority}</p>            checkItems: response.checkItems?.map(item =>      setSelectedStockItems(prev => [...prev, newStockItemRequest]);

                                  <img 

                                    src={photo.url}                             )}

                                    alt={photo.name}

                                    className="w-full h-full object-cover"                          </div>              item.id === itemId ? { ...item, checked } : item      setStockItemForm({ stockItemId: '', quantity: 1 });

                                  />

                                </div>

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">

                                  <Button                          <div className="space-y-2">            )    }

                                    size="icon"

                                    variant="destructive"                            <Label>

                                    onClick={() => removePhoto(photo.id)}

                                    className="h-8 w-8"                              <User className="h-3.5 w-3.5 inline mr-1.5" />          };  };

                                  >

                                    <Trash2 className="h-4 w-4" />                              Responsável

                                  </Button>

                                </div>                            </Label>        }

                                <div className="mt-1">

                                  <p className="text-xs text-muted-foreground truncate">                            <Input 

                                    {photo.name}

                                  </p>                              value={formData.assignedTo || ''}         return { ...response, [field]: value };  const removeStockItem = (id: string) => {

                                  <p className="text-xs text-muted-foreground">

                                    {new Date(photo.uploadedAt).toLocaleDateString('pt-BR')}                              onChange={(e) => {

                                    {photo.uploadedBy && ` • ${photo.uploadedBy}`}

                                  </p>                                if (canEditDetails) {      }    setSelectedStockItems(prev => prev.filter(item => item.id !== id));

                                </div>

                              </div>                                  setFormData(prev => ({ ...prev, assignedTo: e.target.value }));

                            ))}

                          </div>                                }      return response;  };

                        )}

                      </div>                              }}

                    </div>

                  </TabsContent>                              placeholder="Nome do técnico responsável"    }));

                </div>

              </ScrollArea>                              disabled={!canEditDetails}

            </div>

          </Tabs>                            />  };  const availableStockItems = stockItems.filter(

        </div>

                          </div>

        {/* Footer */}

        <div className="border-t bg-background px-6 py-4 shrink-0">                                si => !selectedStockItems.some(selected => selected.stockItemId === si.id)

          <div className="flex items-center justify-between">

            <div className="text-sm text-muted-foreground">                          <div className="space-y-2 md:col-span-3">

              {Object.keys(errors).length > 0 && (

                <p className="text-destructive flex items-center gap-1">                            <Label>  const addStockItem = () => {  );

                  <AlertTriangle className="h-3.5 w-3.5" />

                  Corrija os campos obrigatórios                              Descrição <span className="text-destructive">*</span>

                </p>

              )}                            </Label>    if (!stockItemForm.stockItemId) return;

            </div>

            <div className="flex items-center gap-3">                            <Textarea 

              <Button 

                variant="outline"                               value={formData.description || ''}       if (!workOrder) return null;

                onClick={onClose}

                disabled={isSubmitting}                              onChange={(e) => {

              >

                Cancelar                                if (canEditDetails) {    const stockItem = stockItems.find(si => si.id === stockItemForm.stockItemId);

              </Button>

              <Button                                   setFormData(prev => ({ ...prev, description: e.target.value }));

                onClick={handleSave} 

                disabled={isSubmitting || (!canEditDetails && !canEditExecution && !canEditMaterials)}                                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));      // Encontrar o equipamento selecionado para mostrar informações relacionadas

                className="min-w-[100px]"

              >                                }

                {isSubmitting ? (

                  <>                              }}    if (stockItem) {  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);

                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />

                    Salvando...                              placeholder="Descreva o problema ou trabalho a ser realizado"

                  </>

                ) : (                              rows={3}      const newStockItemRequest: StockItemRequest = {  const selectedSector = selectedEquipment 

                  <>

                    <Save className="h-4 w-4 mr-2" />                              disabled={!canEditDetails}

                    Salvar Alterações

                  </>                              className={cn(        id: `${stockItem.id}-${Date.now()}`,    ? sectors.find(s => s.id === selectedEquipment.sectorId) 

                )}

              </Button>                                "resize-none",

            </div>

          </div>                                errors.description && "border-destructive"        stockItemId: stockItem.id,    : null;

        </div>

      </DialogContent>                              )}

    </Dialog>

  );                            />        name: stockItem.description,  const selectedCompany = selectedSector 

}
                            {errors.description && (

                              <p className="text-xs text-destructive">{errors.description}</p>        quantity: stockItemForm.quantity,    ? companies.find(c => c.id === selectedSector.companyId) 

                            )}

                          </div>        unit: stockItem.unit    : null;

                        </div>

                      </div>      };

                      

                      {/* Card de Agendamento */}        // Helper para obter cor da prioridade

                      <div className="rounded-lg border bg-card">

                        <div className="px-4 py-3 border-b bg-muted/50">      setSelectedStockItems(prev => [...prev, newStockItemRequest]);  const getPriorityColor = (priority: string) => {

                          <h3 className="text-sm font-medium flex items-center gap-2">

                            <CalendarClock className="h-4 w-4 text-muted-foreground" />      setStockItemForm({ stockItemId: '', quantity: 1 });    switch (priority) {

                            Agendamento

                          </h3>    }      case 'LOW': return 'bg-blue-500';

                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">  };      case 'MEDIUM': return 'bg-yellow-500';

                          <div className="space-y-2">

                            <Label>      case 'HIGH': return 'bg-orange-500';

                              Data Programada <span className="text-destructive">*</span>

                            </Label>  const removeStockItem = (id: string) => {      case 'CRITICAL': return 'bg-red-500';

                            <DatePicker

                              date={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}    setSelectedStockItems(prev => prev.filter(item => item.id !== id));      default: return 'bg-gray-500';

                              setDate={(date) => {

                                if (canEditDetails) {  };    }

                                  setFormData(prev => ({ ...prev, scheduledDate: date?.toISOString() }));

                                  if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: '' }));  };

                                }

                              }}  const availableStockItems = stockItems.filter(

                              disabled={!canEditDetails}

                              className={cn(errors.scheduledDate && "border-destructive")}    si => !selectedStockItems.some(selected => selected.stockItemId === si.id)  // Helper para obter label da prioridade

                            />

                            {errors.scheduledDate && (  );  const getPriorityLabel = (priority: string) => {

                              <p className="text-xs text-destructive">{errors.scheduledDate}</p>

                            )}    switch (priority) {

                          </div>

  if (!workOrder) return null;      case 'LOW': return 'Baixa';

                          {formData.completedAt && (

                            <div className="space-y-2">      case 'MEDIUM': return 'Média';

                              <Label>

                                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5" />  // Encontrar o equipamento selecionado      case 'HIGH': return 'Alta';

                                Data de Conclusão

                              </Label>  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);      case 'CRITICAL': return 'Crítica';

                              <DatePicker

                                date={new Date(formData.completedAt)}  const selectedSector = selectedEquipment       default: return priority;

                                setDate={() => {}}

                                disabled={true}    ? sectors.find(s => s.id === selectedEquipment.sectorId)     }

                              />

                            </div>    : null;  };

                          )}

                        </div>  const selectedCompany = selectedSector 

                      </div>

    ? companies.find(c => c.id === selectedSector.companyId)   return (

                      {/* Card de Localização e Equipamento */}

                      <div className="rounded-lg border bg-card">    : null;    <Dialog open={isOpen} onOpenChange={onClose}>

                        <div className="px-4 py-3 border-b bg-muted/50">

                          <h3 className="text-sm font-medium flex items-center gap-2">      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0">

                            <Building className="h-4 w-4 text-muted-foreground" />

                            Localização e Equipamento  // Helper para obter cor da prioridade        {/* Header - Removido X manual, melhorado Badge de Status */}

                          </h3>

                        </div>  const getPriorityColor = (priority: string) => {        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">

                        <div className="p-4 space-y-4">

                          <div className="space-y-2">    switch (priority) {          <div className="flex items-start justify-between">

                            <Label>

                              <Tag className="h-3.5 w-3.5 inline mr-1.5" />      case 'LOW': return 'bg-blue-500';            <div className="flex-1">

                              Equipamento <span className="text-destructive">*</span>

                            </Label>      case 'MEDIUM': return 'bg-yellow-500';              <div className="flex items-center gap-3">

                            <Select 

                              value={formData.equipmentId || ''}       case 'HIGH': return 'bg-orange-500';                <DialogTitle className="text-xl font-semibold flex items-center gap-2">

                              onValueChange={(value) => {

                                if (canEditDetails) {      case 'CRITICAL': return 'bg-red-500';                  <ClipboardList className="h-5 w-5 text-primary" />

                                  setFormData(prev => ({ ...prev, equipmentId: value }));

                                  if (errors.equipmentId) setErrors(prev => ({ ...prev, equipmentId: '' }));      default: return 'bg-gray-500';                  Editar Ordem de Serviço

                                }

                              }}    }                </DialogTitle>

                              disabled={!canEditDetails}

                            >  };                {/* Status Badge com melhor visibilidade */}

                              <SelectTrigger className={cn(errors.equipmentId && "border-destructive")}>

                                <SelectValue placeholder="Selecione o equipamento" />                <Badge 

                              </SelectTrigger>

                              <SelectContent>  const getPriorityLabel = (priority: string) => {                  variant="outline" 

                                {equipment.map(eq => (

                                  <SelectItem key={eq.id} value={eq.id}>    switch (priority) {                  className={cn(

                                    <div className="flex flex-col">

                                      <span className="font-medium">{eq.tag}</span>      case 'LOW': return 'Baixa';                    "flex items-center gap-1.5 px-2.5 py-1 border",

                                      <span className="text-xs text-muted-foreground">

                                        {eq.brand} {eq.model}      case 'MEDIUM': return 'Média';                    formData.status === 'OPEN' && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",

                                      </span>

                                    </div>      case 'HIGH': return 'Alta';                    formData.status === 'IN_PROGRESS' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",

                                  </SelectItem>

                                ))}      case 'CRITICAL': return 'Crítica';                    formData.status === 'COMPLETED' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"

                              </SelectContent>

                            </Select>      default: return priority;                  )}

                            {errors.equipmentId && (

                              <p className="text-xs text-destructive">{errors.equipmentId}</p>    }                >

                            )}

                          </div>  };                  {formData.status === 'OPEN' && <AlertCircle className="h-3.5 w-3.5" />}

                          

                          {selectedEquipment && (                  {formData.status === 'IN_PROGRESS' && <Clock className="h-3.5 w-3.5" />}

                            <div className="rounded-lg bg-muted/50 p-4">

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">  return (                  {formData.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}

                                <div>

                                  <span className="text-muted-foreground">Tipo:</span>    <Dialog open={isOpen} onOpenChange={onClose}>                  <span className="font-medium">

                                  <p className="font-medium">{selectedEquipment.type}</p>

                                </div>      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0">                    {formData.status === 'OPEN' && 'Aberta'}

                                <div>

                                  <span className="text-muted-foreground">Marca:</span>        {/* Header - Removido X manual, melhorado Badge de Status */}                    {formData.status === 'IN_PROGRESS' && 'Em Progresso'}

                                  <p className="font-medium">{selectedEquipment.brand}</p>

                                </div>        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">                    {formData.status === 'COMPLETED' && 'Concluída'}

                                <div>

                                  <span className="text-muted-foreground">Modelo:</span>          <div className="flex items-start justify-between">                  </span>

                                  <p className="font-medium">{selectedEquipment.model}</p>

                                </div>            <div className="flex-1">                </Badge>

                                <div>

                                  <span className="text-muted-foreground">Capacidade:</span>              <div className="flex items-center gap-3">              </div>

                                  <p className="font-medium">{selectedEquipment.capacity.toLocaleString()} BTUs</p>

                                </div>                <DialogTitle className="text-xl font-semibold flex items-center gap-2">              <DialogDescription className="mt-1.5">

                              </div>

                                                <ClipboardList className="h-5 w-5 text-primary" />                OS #{workOrder.number} - {workOrder.type === 'PREVENTIVE' ? 'Manutenção Preventiva' : 'Manutenção Corretiva'}

                              <Separator className="my-3" />

                                                Editar Ordem de Serviço              </DialogDescription>

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                <div>                </DialogTitle>            </div>

                                  <span className="text-muted-foreground">Empresa:</span>

                                  <p className="font-medium">{selectedCompany?.name || 'Não definida'}</p>                {/* Status Badge com melhor visibilidade */}          </div>

                                </div>

                                <div>                <Badge         </DialogHeader>

                                  <span className="text-muted-foreground">Setor:</span>

                                  <p className="font-medium">{selectedSector?.name || 'Não definido'}</p>                  variant="outline" 

                                </div>

                              </div>                  className={cn(        {/* Content - Scrollable */}

                            </div>

                          )}                    "flex items-center gap-1.5 px-2.5 py-1 border",        <div className="flex-1 overflow-hidden">

                        </div>

                      </div>                    formData.status === 'OPEN' && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">

                    </div>

                  </TabsContent>                    formData.status === 'IN_PROGRESS' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",            <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/50 rounded-none border-b shrink-0">



                  {/* Aba de Execução */}                    formData.status === 'COMPLETED' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"              <TabsTrigger 

                  <TabsContent value="execution" className="mt-0 space-y-6">

                    <div className="rounded-lg border bg-card">                  )}                value="details" 

                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">                >                className="flex items-center gap-2 data-[state=active]:bg-background"

                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />

                          Controle de Status                  {formData.status === 'OPEN' && <AlertCircle className="h-3.5 w-3.5" />}              >

                        </h3>

                      </div>                  {formData.status === 'IN_PROGRESS' && <Clock className="h-3.5 w-3.5" />}                <Info className="h-4 w-4" />

                      <div className="p-4 space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  {formData.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}                Detalhes

                          <div className="space-y-2">

                            <Label>Alterar Status</Label>                  <span className="font-medium">              </TabsTrigger>

                            <Select 

                              value={formData.status || ''}                     {formData.status === 'OPEN' && 'Aberta'}              <TabsTrigger 

                              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}

                              disabled={!canEditExecution}                    {formData.status === 'IN_PROGRESS' && 'Em Progresso'}                value="materials" 

                            >

                              <SelectTrigger>                    {formData.status === 'COMPLETED' && 'Concluída'}                className="flex items-center gap-2 data-[state=active]:bg-background"

                                <SelectValue placeholder="Selecione o status" />

                              </SelectTrigger>                  </span>              >

                              <SelectContent>

                                <SelectItem value="OPEN">                </Badge>                <Package className="h-4 w-4" />

                                  <div className="flex items-center gap-2">

                                    <Circle className="h-3 w-3 text-yellow-500" />              </div>                Materiais

                                    Aberta

                                  </div>              <DialogDescription className="mt-1.5">                {selectedStockItems.length > 0 && (

                                </SelectItem>

                                <SelectItem value="IN_PROGRESS">                OS #{workOrder.number} - {workOrder.type === 'PREVENTIVE' ? 'Manutenção Preventiva' : 'Manutenção Corretiva'}                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">

                                  <div className="flex items-center gap-2">

                                    <Clock className="h-3 w-3 text-blue-500" />              </DialogDescription>                    {selectedStockItems.length}

                                    Em Progresso

                                  </div>            </div>                  </span>

                                </SelectItem>

                                <SelectItem value="COMPLETED">          </div>                )}

                                  <div className="flex items-center gap-2">

                                    <CheckCircle2 className="h-3 w-3 text-green-500" />        </DialogHeader>              </TabsTrigger>

                                    Concluída

                                  </div>              {workOrder.status !== 'COMPLETED' && (

                                </SelectItem>

                              </SelectContent>        {/* Content - Com overflow corrigido */}                <TabsTrigger 

                            </Select>

                          </div>        <div className="flex-1 overflow-hidden flex flex-col">                  value="execution" 

                          

                          {formData.status === 'COMPLETED' && (          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">                  className="flex items-center gap-2 data-[state=active]:bg-background"

                            <div className="space-y-2">

                              <Label>            <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/50 rounded-none border-b shrink-0">                >

                                <CalendarClock className="h-3.5 w-3.5 inline mr-1.5" />

                                Data de Conclusão              <TabsTrigger                   <Wrench className="h-4 w-4" />

                              </Label>

                              <DatePicker                value="details"                   Execução

                                date={formData.completedAt ? new Date(formData.completedAt) : undefined}

                                setDate={(date) => setFormData(prev => ({ ...prev, completedAt: date?.toISOString() }))}                className="flex items-center gap-2 data-[state=active]:bg-background"                </TabsTrigger>

                                placeholder="Selecione quando foi concluída"

                                disabled={!canEditExecution}                disabled={!canEditDetails && workOrder.status !== 'OPEN'}              )}

                              />

                            </div>              >            </TabsList>

                          )}

                        </div>                {!canEditDetails && workOrder.status !== 'OPEN' ? (            

                      </div>

                    </div>                  <Lock className="h-4 w-4" />            <ScrollArea className="flex-1">



                    <div className="rounded-lg border bg-card">                ) : (              <div className="p-6">

                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">                  <Info className="h-4 w-4" />                {/* Aba de Detalhes - Layout Horizontal */}

                          <FileText className="h-4 w-4 text-muted-foreground" />

                          Descrição do Trabalho Realizado                )}                <TabsContent value="details" className="mt-0 space-y-6">

                        </h3>

                      </div>                Detalhes                  {!canEditDetails && (

                      <div className="p-4">

                        <Textarea                {!canEditDetails && (                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4">

                          value={executionDescription}

                          onChange={(e) => setExecutionDescription(e.target.value)}                  <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">                      <div className="flex items-center gap-2">

                          placeholder={

                            workOrder.type === 'CORRECTIVE'                     Somente Leitura                        <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />

                              ? "Descreva detalhadamente o que foi feito para resolver o problema..."

                              : "Descreva as atividades realizadas durante a manutenção preventiva..."                  </Badge>                        <p className="text-sm text-yellow-800 dark:text-yellow-200">

                          }

                          rows={6}                )}                          Você possui apenas permissão de visualização nesta seção. 

                          disabled={!canEditExecution}

                          className="resize-none"              </TabsTrigger>                          Entre em contato com um administrador para realizar alterações.

                        />

                        <p className="text-xs text-muted-foreground mt-2">                                      </p>

                          Este campo é importante para o histórico de manutenções do equipamento.

                        </p>              <TabsTrigger                       </div>

                      </div>

                    </div>                value="execution"                     </div>



                    {workOrder.type === 'PREVENTIVE' && checklistResponses.length > 0 && (                className="flex items-center gap-2 data-[state=active]:bg-background"                  )}

                      <div className="rounded-lg border bg-card">

                        <div className="px-4 py-3 border-b bg-muted/50">                disabled={!canEditExecution}                  

                          <h3 className="text-sm font-medium flex items-center gap-2">

                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />              >                  {/* Cards em Layout Horizontal (Stack) */}

                            Checklist de Manutenção Preventiva

                          </h3>                <Wrench className="h-4 w-4" />                  <div className="space-y-6">

                        </div>

                        <div className="p-4 space-y-4">                Execução                    {/* Card de Informações Básicas */}

                          {checklistResponses.map((response, index) => (

                            <Card key={response.taskId} className="p-4">              </TabsTrigger>                    <div className="rounded-lg border bg-card">

                              <div className="space-y-3">

                                <div className="flex items-start gap-3">                                    <div className="px-4 py-3 border-b bg-muted/50">

                                  <Checkbox

                                    id={`task-${response.taskId}`}              <TabsTrigger                         <h3 className="text-sm font-medium flex items-center gap-2">

                                    checked={response.completed}

                                    onCheckedChange={(checked) =>                 value="materials"                           <ClipboardList className="h-4 w-4 text-muted-foreground" />

                                      updateChecklistResponse(response.taskId, 'completed', checked)

                                    }                className="flex items-center gap-2 data-[state=active]:bg-background"                          Informações Básicas

                                    disabled={!canEditExecution}

                                  />                disabled={!canEditMaterials}                        </h3>

                                  <div className="space-y-1 flex-1">

                                    <Label               >                      </div>

                                      htmlFor={`task-${response.taskId}`}

                                      className="text-sm font-medium cursor-pointer"                <Package className="h-4 w-4" />                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                                    >

                                      {index + 1}. {response.taskName}                Materiais                          {/* Tipo de Ordem */}

                                    </Label>

                                                    {selectedStockItems.length > 0 && (                          <div className="space-y-2">

                                    {response.checkItems && response.checkItems.length > 0 && (

                                      <div className="ml-4 space-y-2 mt-2">                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">                            <Label htmlFor="workOrderType">

                                        {response.checkItems.map(item => (

                                          <div key={item.id} className="flex items-center gap-2">                    {selectedStockItems.length}                              Tipo de Ordem <span className="text-destructive">*</span>

                                            <Checkbox

                                              id={`check-${item.id}`}                  </span>                            </Label>

                                              checked={item.checked}

                                              onCheckedChange={(checked) =>                 )}                            <Select 

                                                updateChecklistResponse(

                                                  response.taskId,               </TabsTrigger>                              value={formData.type || ''} 

                                                  'checkItem', 

                                                  { itemId: item.id, checked }                                            onValueChange={(value) => {

                                                )

                                              }              <TabsTrigger                                 setFormData(prev => ({ ...prev, type: value as WorkOrder['type'] }));

                                              disabled={!canEditExecution}

                                              className="h-3 w-3"                value="photos"                                 if (errors.type) setErrors(prev => ({ ...prev, type: '' }));

                                            />

                                            <Label                 className="flex items-center gap-2 data-[state=active]:bg-background"                              }}

                                              htmlFor={`check-${item.id}`}

                                              className="text-xs text-muted-foreground cursor-pointer"              >                            >

                                            >

                                              {item.description}                <Camera className="h-4 w-4" />                              <SelectTrigger className={cn(errors.type && "border-destructive")}>

                                            </Label>

                                          </div>                Fotos                                <SelectValue placeholder="Selecione o tipo" />

                                        ))}

                                      </div>                {uploadedPhotos.length > 0 && (                              </SelectTrigger>

                                    )}

                                                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">                              <SelectContent>

                                    <div className="mt-3">

                                      <Label className="text-xs text-muted-foreground">                    {uploadedPhotos.length}                                <SelectItem value="CORRECTIVE">

                                        Observações (opcional)

                                      </Label>                  </span>                                  <div className="flex items-center gap-2">

                                      <Textarea

                                        value={response.observations || ''}                )}                                    <Wrench className="h-4 w-4" />

                                        onChange={(e) => 

                                          updateChecklistResponse(response.taskId, 'observations', e.target.value)              </TabsTrigger>                                    Corretiva

                                        }

                                        placeholder="Adicione observações se necessário..."            </TabsList>                                  </div>

                                        rows={2}

                                        disabled={!canEditExecution}                                            </SelectItem>

                                        className="resize-none mt-1 text-sm"

                                      />            {/* TabsContent com overflow corrigido */}                                <SelectItem value="PREVENTIVE">

                                    </div>

                                  </div>            <div className="flex-1 overflow-y-auto">                                  <div className="flex items-center gap-2">

                                </div>

                              </div>              <div className="p-6">                                    <Calendar className="h-4 w-4" />

                            </Card>

                          ))}                {/* Aba de Detalhes - Layout Horizontal */}                                    Preventiva

                        </div>

                      </div>                <TabsContent value="details" className="mt-0 space-y-6">                                  </div>

                    )}

                  </TabsContent>                  {!canEditDetails && (                                </SelectItem>



                  {/* Aba de Materiais */}                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4">                              </SelectContent>

                  <TabsContent value="materials" className="mt-0 space-y-6">

                    <div className="rounded-lg border bg-card">                      <div className="flex items-center gap-2">                            </Select>

                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">                        <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />                            {errors.type && (

                          <Package className="h-4 w-4 text-muted-foreground" />

                          Itens de Estoque Utilizados                        <p className="text-sm text-yellow-800 dark:text-yellow-200">                              <p className="text-xs text-destructive">{errors.type}</p>

                        </h3>

                      </div>                          Você possui apenas permissão de visualização nesta seção.                             )}

                      <div className="p-4 space-y-4">

                        <div className="flex flex-col sm:flex-row gap-3">                          Entre em contato com um administrador para realizar alterações.                          </div>

                          <div className="flex-1">

                            <Select                         </p>                          

                              value={stockItemForm.stockItemId} 

                              onValueChange={(value) => setStockItemForm(prev => ({ ...prev, stockItemId: value }))}                      </div>                          {/* Prioridade */}

                              disabled={!canEditMaterials}

                            >                    </div>                          <div className="space-y-2">

                              <SelectTrigger>

                                <SelectValue placeholder="Selecione um item do estoque" />                  )}                            <Label htmlFor="workOrderPriority">

                              </SelectTrigger>

                              <SelectContent>                                                Prioridade <span className="text-destructive">*</span>

                                {availableStockItems.map(item => (

                                  <SelectItem key={item.id} value={item.id}>                  {/* Cards em Layout Horizontal (Stack) */}                            </Label>

                                    <div className="flex justify-between items-center w-full">

                                      <span>{item.description}</span>                  <div className="space-y-6">                            <Select 

                                      <span className="text-xs text-muted-foreground ml-2">

                                        {item.unit}                    {/* Card de Informações Básicas */}                              value={formData.priority || ''} 

                                      </span>

                                    </div>                    <div className="rounded-lg border bg-card">                              onValueChange={(value) => {

                                  </SelectItem>

                                ))}                      <div className="px-4 py-3 border-b bg-muted/50">                                setFormData(prev => ({ ...prev, priority: value as WorkOrder['priority'] }));

                              </SelectContent>

                            </Select>                        <h3 className="text-sm font-medium flex items-center gap-2">                                if (errors.priority) setErrors(prev => ({ ...prev, priority: '' }));

                          </div>

                                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />                              }}

                          <div className="w-full sm:w-28">

                            <Input                           Informações Básicas                            >

                              type="number" 

                              min="1"                        </h3>                              <SelectTrigger className={cn(errors.priority && "border-destructive")}>

                              value={stockItemForm.quantity} 

                              onChange={(e) => setStockItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}                      </div>                                <SelectValue placeholder="Selecione a prioridade" />

                              placeholder="Qtd"

                              disabled={!canEditMaterials}                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">                              </SelectTrigger>

                            />

                          </div>                        {/* Tipo de Ordem */}                              <SelectContent>

                          

                          <Button                         <div className="space-y-2">                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (

                            onClick={addStockItem}

                            disabled={!stockItemForm.stockItemId || !canEditMaterials}                          <Label htmlFor="workOrderType">                                  <SelectItem key={priority} value={priority}>

                            className="sm:w-auto"

                          >                            Tipo de Ordem <span className="text-destructive">*</span>                                    <div className="flex items-center gap-2">

                            <Plus className="h-4 w-4 mr-2" />

                            Adicionar                          </Label>                                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(priority))} />

                          </Button>

                        </div>                          <Select                                       <span>{getPriorityLabel(priority)}</span>

                        

                        {selectedStockItems.length === 0 ? (                            value={formData.type || ''}                                     </div>

                          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">

                            <div className="flex flex-col items-center text-center">                            onValueChange={(value) => {                                  </SelectItem>

                              <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />

                              <p className="text-sm text-muted-foreground">                              if (canEditDetails) {                                ))}

                                Nenhum item adicionado

                              </p>                                setFormData(prev => ({ ...prev, type: value as WorkOrder['type'] }));                              </SelectContent>

                              <p className="text-xs text-muted-foreground mt-1">

                                Selecione itens do estoque que serão utilizados                                if (errors.type) setErrors(prev => ({ ...prev, type: '' }));                            </Select>

                              </p>

                            </div>                              }                            {errors.priority && (

                          </div>

                        ) : (                            }}                              <p className="text-xs text-destructive">{errors.priority}</p>

                          <div className="rounded-lg border overflow-hidden">

                            <table className="w-full">                            disabled={!canEditDetails}                            )}

                              <thead>

                                <tr className="border-b bg-muted/50">                          >                          </div>

                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">

                                    Item                            <SelectTrigger className={cn(errors.type && "border-destructive")}>                          

                                  </th>

                                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">                              <SelectValue placeholder="Selecione o tipo" />                          {/* Descrição */}

                                    Quantidade

                                  </th>                            </SelectTrigger>                          <div className="space-y-2">

                                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-16">

                                    Ação                            <SelectContent>                            <Label htmlFor="workOrderDescription">

                                  </th>

                                </tr>                              <SelectItem value="CORRECTIVE">                              Descrição <span className="text-destructive">*</span>

                              </thead>

                              <tbody>                                <div className="flex items-center gap-2">                            </Label>

                                {selectedStockItems.map((item, index) => (

                                  <tr key={item.id} className={cn(                                  <Wrench className="h-4 w-4" />                            <Textarea 

                                    "border-b",

                                    index % 2 === 0 ? "bg-background" : "bg-muted/20"                                  Corretiva                              id="workOrderDescription"

                                  )}>

                                    <td className="px-4 py-3">                                </div>                              value={formData.description || ''} 

                                      <p className="font-medium text-sm">{item.name}</p>

                                    </td>                              </SelectItem>                              onChange={(e) => {

                                    <td className="px-4 py-3 text-center">

                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">                              <SelectItem value="PREVENTIVE">                                setFormData(prev => ({ ...prev, description: e.target.value }));

                                        {item.quantity} {item.unit}

                                      </span>                                <div className="flex items-center gap-2">                                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));

                                    </td>

                                    <td className="px-4 py-3 text-center">                                  <Calendar className="h-4 w-4" />                              }}

                                      <Button 

                                        variant="ghost"                                   Preventiva                              placeholder="Descreva o problema ou trabalho a ser realizado"

                                        size="icon"

                                        onClick={() => removeStockItem(item.id)}                                </div>                              rows={4}

                                        disabled={!canEditMaterials}

                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"                              </SelectItem>                              className={cn(

                                      >

                                        <Trash2 className="h-4 w-4" />                            </SelectContent>                                "resize-none",

                                      </Button>

                                    </td>                          </Select>                                errors.description && "border-destructive"

                                  </tr>

                                ))}                          {errors.type && (                              )}

                              </tbody>

                            </table>                            <p className="text-xs text-destructive">{errors.type}</p>                            />

                          </div>

                        )}                          )}                            {errors.description && (

                      </div>

                    </div>                        </div>                              <p className="text-xs text-destructive">{errors.description}</p>

                  </TabsContent>

                                                                      )}

                  {/* Aba de Fotos */}

                  <TabsContent value="photos" className="mt-0 space-y-6">                        {/* Prioridade */}                          </div>

                    <div className="rounded-lg border bg-card">

                      <div className="px-4 py-3 border-b bg-muted/50">                        <div className="space-y-2">                        </div>

                        <h3 className="text-sm font-medium flex items-center gap-2">

                          <Camera className="h-4 w-4 text-muted-foreground" />                          <Label htmlFor="workOrderPriority">                      </div>

                          Fotos e Evidências

                        </h3>                            Prioridade <span className="text-destructive">*</span>                      

                      </div>

                      <div className="p-4 space-y-4">                          </Label>                      {/* Agendamento */}

                        <div className="flex items-center gap-4">

                          <input                          <Select                       <div className="rounded-lg border bg-card">

                            ref={fileInputRef}

                            type="file"                            value={formData.priority || ''}                         <div className="px-4 py-3 border-b bg-muted/50">

                            accept="image/*"

                            multiple                            onValueChange={(value) => {                          <h3 className="text-sm font-medium flex items-center gap-2">

                            onChange={handlePhotoUpload}

                            className="hidden"                              if (canEditDetails) {                            <CalendarClock className="h-4 w-4 text-muted-foreground" />

                          />

                          <Button                                setFormData(prev => ({ ...prev, priority: value as WorkOrder['priority'] }));                            Agendamento

                            onClick={() => fileInputRef.current?.click()}

                            disabled={isUploadingPhoto}                                if (errors.priority) setErrors(prev => ({ ...prev, priority: '' }));                          </h3>

                            variant="outline"

                          >                              }                        </div>

                            {isUploadingPhoto ? (

                              <>                            }}                        <div className="p-4 space-y-4">

                                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />

                                Enviando...                            disabled={!canEditDetails}                          {/* Data Programada */}

                              </>

                            ) : (                          >                          <div className="space-y-2">

                              <>

                                <Upload className="h-4 w-4 mr-2" />                            <SelectTrigger className={cn(errors.priority && "border-destructive")}>                            <Label htmlFor="scheduledDate">

                                Adicionar Fotos

                              </>                              <SelectValue placeholder="Selecione a prioridade" />                              Data Programada <span className="text-destructive">*</span>

                            )}

                          </Button>                            </SelectTrigger>                            </Label>

                          <p className="text-sm text-muted-foreground">

                            Formatos aceitos: JPG, PNG, GIF (máx. 5MB cada)                            <SelectContent>                            <DatePicker

                          </p>

                        </div>                              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (                              date={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}

                        

                        {uploadedPhotos.length === 0 ? (                                <SelectItem key={priority} value={priority}>                              setDate={(date) => {

                          <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">

                            <div className="flex flex-col items-center text-center">                                  <div className="flex items-center gap-2">                                setFormData(prev => ({ ...prev, scheduledDate: date?.toISOString() }));

                              <Camera className="h-12 w-12 text-muted-foreground/50 mb-3" />

                              <p className="text-sm text-muted-foreground">                                    <div className={cn("w-2 h-2 rounded-full", getPriorityColor(priority))} />                                if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: '' }));

                                Nenhuma foto adicionada

                              </p>                                    <span>{getPriorityLabel(priority)}</span>                              }}

                              <p className="text-xs text-muted-foreground mt-1">

                                Adicione fotos para documentar o trabalho realizado                                  </div>                              className={cn(errors.scheduledDate && "border-destructive")}

                              </p>

                            </div>                                </SelectItem>                            />

                          </div>

                        ) : (                              ))}                            {errors.scheduledDate && (

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                            {uploadedPhotos.map(photo => (                            </SelectContent>                              <p className="text-xs text-destructive">{errors.scheduledDate}</p>

                              <div key={photo.id} className="relative group">

                                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">                          </Select>                            )}

                                  <img 

                                    src={photo.url}                           {errors.priority && (                          </div>

                                    alt={photo.name}

                                    className="w-full h-full object-cover"                            <p className="text-xs text-destructive">{errors.priority}</p>                          

                                  />

                                </div>                          )}                          {/* Responsável */}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">

                                  <Button                        </div>                          <div className="space-y-2">

                                    size="icon"

                                    variant="destructive"                            <Label htmlFor="assignedTo">

                                    onClick={() => removePhoto(photo.id)}

                                    className="h-8 w-8"                        {/* Responsável */}                              <User className="h-3.5 w-3.5 inline mr-1.5" />

                                  >

                                    <Trash2 className="h-4 w-4" />                        <div className="space-y-2">                              Responsável

                                  </Button>

                                </div>                          <Label htmlFor="assignedTo">                            </Label>

                                <div className="mt-1">

                                  <p className="text-xs text-muted-foreground truncate">                            <User className="h-3.5 w-3.5 inline mr-1.5" />                            <Input 

                                    {photo.name}

                                  </p>                            Responsável                              id="assignedTo"

                                  <p className="text-xs text-muted-foreground">

                                    {new Date(photo.uploadedAt).toLocaleDateString('pt-BR')}                          </Label>                              value={formData.assignedTo || ''} 

                                    {photo.uploadedBy && ` • ${photo.uploadedBy}`}

                                  </p>                          <Input                               onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}

                                </div>

                              </div>                            id="assignedTo"                              placeholder="Nome do técnico responsável"

                            ))}

                          </div>                            value={formData.assignedTo || ''}                             />

                        )}

                      </div>                            onChange={(e) => {                          </div>

                    </div>

                  </TabsContent>                              if (canEditDetails) {                        </div>

                </div>

              </ScrollArea>                                setFormData(prev => ({ ...prev, assignedTo: e.target.value }));                      </div>

            </div>

          </Tabs>                              }                    </div>

        </div>

                            }}                    

        {/* Footer */}

        <div className="border-t bg-background px-6 py-4 shrink-0">                            placeholder="Nome do técnico responsável"                    {/* Coluna da Direita */}

          <div className="flex items-center justify-between">

            <div className="text-sm text-muted-foreground">                            disabled={!canEditDetails}                    <div className="space-y-6">

              {Object.keys(errors).length > 0 && (

                <p className="text-destructive flex items-center gap-1">                          />                      {/* Localização e Equipamento */}

                  <AlertTriangle className="h-3.5 w-3.5" />

                  Corrija os campos obrigatórios                        </div>                      <div className="rounded-lg border bg-card">

                </p>

              )}                                                <div className="px-4 py-3 border-b bg-muted/50">

            </div>

            <div className="flex items-center gap-3">                        {/* Descrição - Ocupando largura total */}                          <h3 className="text-sm font-medium flex items-center gap-2">

              <Button 

                variant="outline"                         <div className="space-y-2 md:col-span-3">                            <Building className="h-4 w-4 text-muted-foreground" />

                onClick={onClose}

                disabled={isSubmitting}                          <Label htmlFor="workOrderDescription">                            Localização e Equipamento

              >

                Cancelar                            Descrição <span className="text-destructive">*</span>                          </h3>

              </Button>

              <Button                           </Label>                        </div>

                onClick={handleSave} 

                disabled={isSubmitting || (!canEditDetails && !canEditExecution && !canEditMaterials)}                          <Textarea                         <div className="p-4 space-y-4">

                className="min-w-[100px]"

              >                            id="workOrderDescription"                          {/* Equipamento */}

                {isSubmitting ? (

                  <>                            value={formData.description || ''}                           <div className="space-y-2">

                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />

                    Salvando...                            onChange={(e) => {                            <Label htmlFor="equipmentId">

                  </>

                ) : (                              if (canEditDetails) {                              <Tag className="h-3.5 w-3.5 inline mr-1.5" />

                  <>

                    <Save className="h-4 w-4 mr-2" />                                setFormData(prev => ({ ...prev, description: e.target.value }));                              Equipamento <span className="text-destructive">*</span>

                    Salvar Alterações

                  </>                                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));                            </Label>

                )}

              </Button>                              }                            <Select 

            </div>

          </div>                            }}                              value={formData.equipmentId || ''} 

        </div>

      </DialogContent>                            placeholder="Descreva o problema ou trabalho a ser realizado"                              onValueChange={(value) => {

    </Dialog>

  );                            rows={3}                                setFormData(prev => ({ ...prev, equipmentId: value }));

}
                            disabled={!canEditDetails}                                if (errors.equipmentId) setErrors(prev => ({ ...prev, equipmentId: '' }));

                            className={cn(                              }}

                              "resize-none",                            >

                              errors.description && "border-destructive"                              <SelectTrigger className={cn(errors.equipmentId && "border-destructive")}>

                            )}                                <SelectValue placeholder="Selecione o equipamento" />

                          />                              </SelectTrigger>

                          {errors.description && (                              <SelectContent>

                            <p className="text-xs text-destructive">{errors.description}</p>                                {equipment.map(eq => (

                          )}                                  <SelectItem key={eq.id} value={eq.id}>

                        </div>                                    <div className="flex flex-col">

                      </div>                                      <span className="font-medium">{eq.tag}</span>

                    </div>                                      <span className="text-xs text-muted-foreground">

                                                            {eq.brand} {eq.model}

                    {/* Card de Agendamento */}                                      </span>

                    <div className="rounded-lg border bg-card">                                    </div>

                      <div className="px-4 py-3 border-b bg-muted/50">                                  </SelectItem>

                        <h3 className="text-sm font-medium flex items-center gap-2">                                ))}

                          <CalendarClock className="h-4 w-4 text-muted-foreground" />                              </SelectContent>

                          Agendamento                            </Select>

                        </h3>                            {errors.equipmentId && (

                      </div>                              <p className="text-xs text-destructive">{errors.equipmentId}</p>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">                            )}

                        {/* Data Programada */}                          </div>

                        <div className="space-y-2">                          

                          <Label htmlFor="scheduledDate">                          {/* Informações do equipamento selecionado */}

                            Data Programada <span className="text-destructive">*</span>                          {selectedEquipment && (

                          </Label>                            <div className="rounded-lg bg-muted/50 p-4 space-y-3">

                          <DatePicker                              <div className="grid grid-cols-2 gap-3 text-sm">

                            date={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}                                <div>

                            setDate={(date) => {                                  <span className="text-muted-foreground">Tipo:</span>

                              if (canEditDetails) {                                  <p className="font-medium">{selectedEquipment.type}</p>

                                setFormData(prev => ({ ...prev, scheduledDate: date?.toISOString() }));                                </div>

                                if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: '' }));                                <div>

                              }                                  <span className="text-muted-foreground">Marca:</span>

                            }}                                  <p className="font-medium">{selectedEquipment.brand}</p>

                            disabled={!canEditDetails}                                </div>

                            className={cn(errors.scheduledDate && "border-destructive")}                                <div>

                          />                                  <span className="text-muted-foreground">Modelo:</span>

                          {errors.scheduledDate && (                                  <p className="font-medium">{selectedEquipment.model}</p>

                            <p className="text-xs text-destructive">{errors.scheduledDate}</p>                                </div>

                          )}                                <div>

                        </div>                                  <span className="text-muted-foreground">Capacidade:</span>

                                  <p className="font-medium">{selectedEquipment.capacity.toLocaleString()} BTUs</p>

                        {/* Data de Conclusão (se houver) */}                                </div>

                        {formData.completedAt && (                              </div>

                          <div className="space-y-2">                              

                            <Label>                              <Separator />

                              <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5" />                              

                              Data de Conclusão                              <div className="space-y-2 text-sm">

                            </Label>                                <div className="flex items-center gap-2">

                            <DatePicker                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />

                              date={new Date(formData.completedAt)}                                  <span className="text-muted-foreground">Localização:</span>

                              setDate={() => {}}                                </div>

                              disabled={true}                                <div className="pl-5 space-y-1">

                            />                                  <p><span className="text-muted-foreground">Empresa:</span> <span className="font-medium">{selectedCompany?.name || 'Não definida'}</span></p>

                          </div>                                  <p><span className="text-muted-foreground">Setor:</span> <span className="font-medium">{selectedSector?.name || 'Não definido'}</span></p>

                        )}                                </div>

                      </div>                              </div>

                    </div>                            </div>

                          )}

                    {/* Card de Localização e Equipamento */}                        </div>

                    <div className="rounded-lg border bg-card">                      </div>

                      <div className="px-4 py-3 border-b bg-muted/50">                      

                        <h3 className="text-sm font-medium flex items-center gap-2">                      {/* Status da Ordem de Serviço */}

                          <Building className="h-4 w-4 text-muted-foreground" />                      <div className="rounded-lg border bg-card">

                          Localização e Equipamento                        <div className="px-4 py-3 border-b bg-muted/50">

                        </h3>                          <h3 className="text-sm font-medium flex items-center gap-2">

                      </div>                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />

                      <div className="p-4 space-y-4">                            Status da Ordem

                        {/* Equipamento */}                          </h3>

                        <div className="space-y-2">                        </div>

                          <Label htmlFor="equipmentId">                        <div className="p-4 space-y-4">

                            <Tag className="h-3.5 w-3.5 inline mr-1.5" />                          <div className="space-y-2">

                            Equipamento <span className="text-destructive">*</span>                            <Label htmlFor="workOrderStatus">Status Atual</Label>

                          </Label>                            <Select 

                          <Select                               value={formData.status || ''} 

                            value={formData.equipmentId || ''}                               onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}

                            onValueChange={(value) => {                            >

                              if (canEditDetails) {                              <SelectTrigger>

                                setFormData(prev => ({ ...prev, equipmentId: value }));                                <SelectValue placeholder="Selecione o status" />

                                if (errors.equipmentId) setErrors(prev => ({ ...prev, equipmentId: '' }));                              </SelectTrigger>

                              }                              <SelectContent>

                            }}                                <SelectItem value="OPEN">

                            disabled={!canEditDetails}                                  <div className="flex items-center gap-2">

                          >                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />

                            <SelectTrigger className={cn(errors.equipmentId && "border-destructive")}>                                    Aberta

                              <SelectValue placeholder="Selecione o equipamento" />                                  </div>

                            </SelectTrigger>                                </SelectItem>

                            <SelectContent>                                <SelectItem value="IN_PROGRESS">

                              {equipment.map(eq => (                                  <div className="flex items-center gap-2">

                                <SelectItem key={eq.id} value={eq.id}>                                    <div className="w-2 h-2 rounded-full bg-blue-500" />

                                  <div className="flex flex-col">                                    Em Progresso

                                    <span className="font-medium">{eq.tag}</span>                                  </div>

                                    <span className="text-xs text-muted-foreground">                                </SelectItem>

                                      {eq.brand} {eq.model}                                <SelectItem value="COMPLETED">

                                    </span>                                  <div className="flex items-center gap-2">

                                  </div>                                    <div className="w-2 h-2 rounded-full bg-green-500" />

                                </SelectItem>                                    Concluída

                              ))}                                  </div>

                            </SelectContent>                                </SelectItem>

                          </Select>                              </SelectContent>

                          {errors.equipmentId && (                            </Select>

                            <p className="text-xs text-destructive">{errors.equipmentId}</p>                          </div>

                          )}                        </div>

                        </div>                      </div>

                                            </div>

                        {/* Informações do equipamento selecionado */}                  </div>

                        {selectedEquipment && (                </TabsContent>

                          <div className="rounded-lg bg-muted/50 p-4">                )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

                              <div>                {/* Aba de Materiais */}

                                <span className="text-muted-foreground">Tipo:</span>                <TabsContent value="materials" className="mt-0 space-y-6">

                                <p className="font-medium">{selectedEquipment.type}</p>                  <div className="rounded-lg border bg-card">

                              </div>                    <div className="px-4 py-3 border-b bg-muted/50">

                              <div>                      <h3 className="text-sm font-medium flex items-center gap-2">

                                <span className="text-muted-foreground">Marca:</span>                        <Package className="h-4 w-4 text-muted-foreground" />

                                <p className="font-medium">{selectedEquipment.brand}</p>                        Itens de Estoque Utilizados

                              </div>                      </h3>

                              <div>                    </div>

                                <span className="text-muted-foreground">Modelo:</span>                    <div className="p-4 space-y-4">

                                <p className="font-medium">{selectedEquipment.model}</p>                      {/* Adicionar item */}

                              </div>                      <div className="flex flex-col sm:flex-row gap-3">

                              <div>                        <div className="flex-1">

                                <span className="text-muted-foreground">Capacidade:</span>                          <Label htmlFor="stockItemId" className="sr-only">Item</Label>

                                <p className="font-medium">{selectedEquipment.capacity.toLocaleString()} BTUs</p>                          <Select 

                              </div>                            value={stockItemForm.stockItemId} 

                            </div>                            onValueChange={(value) => setStockItemForm(prev => ({ ...prev, stockItemId: value }))}

                                                      >

                            <Separator className="my-3" />                            <SelectTrigger>

                                                          <SelectValue placeholder="Selecione um item do estoque" />

                            <div className="grid grid-cols-2 gap-4 text-sm">                            </SelectTrigger>

                              <div>                            <SelectContent>

                                <span className="text-muted-foreground">Empresa:</span>                              {availableStockItems.map(item => (

                                <p className="font-medium">{selectedCompany?.name || 'Não definida'}</p>                                <SelectItem key={item.id} value={item.id}>

                              </div>                                  <div className="flex justify-between items-center w-full">

                              <div>                                    <span>{item.description}</span>

                                <span className="text-muted-foreground">Setor:</span>                                    <span className="text-xs text-muted-foreground ml-2">

                                <p className="font-medium">{selectedSector?.name || 'Não definido'}</p>                                      {item.unit}

                              </div>                                    </span>

                            </div>                                  </div>

                          </div>                                </SelectItem>

                        )}                              ))}

                      </div>                            </SelectContent>

                    </div>                          </Select>

                  </div>                        </div>

                </TabsContent>                        

                        <div className="w-full sm:w-28">

                {/* Aba de Execução - Com scroll funcionando */}                          <Label htmlFor="quantity" className="sr-only">Quantidade</Label>

                <TabsContent value="execution" className="mt-0 space-y-6">                          <Input 

                  {/* Status da Ordem */}                            id="quantity"

                  <div className="rounded-lg border bg-card">                            type="number" 

                    <div className="px-4 py-3 border-b bg-muted/50">                            min="1"

                      <h3 className="text-sm font-medium flex items-center gap-2">                            value={stockItemForm.quantity} 

                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />                            onChange={(e) => setStockItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}

                        Controle de Status                            placeholder="Qtd"

                      </h3>                          />

                    </div>                        </div>

                    <div className="p-4 space-y-4">                        

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                        <Button 

                        <div className="space-y-2">                          onClick={addStockItem}

                          <Label htmlFor="workOrderStatus">Alterar Status</Label>                          disabled={!stockItemForm.stockItemId}

                          <Select                           className="sm:w-auto"

                            value={formData.status || ''}                         >

                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}                          <Plus className="h-4 w-4 mr-2" />

                            disabled={!canEditExecution}                          Adicionar

                          >                        </Button>

                            <SelectTrigger>                      </div>

                              <SelectValue placeholder="Selecione o status" />                      

                            </SelectTrigger>                      {/* Lista de itens adicionados */}

                            <SelectContent>                      {selectedStockItems.length === 0 ? (

                              <SelectItem value="OPEN">                        <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">

                                <div className="flex items-center gap-2">                          <div className="flex flex-col items-center text-center">

                                  <Circle className="h-3 w-3 text-yellow-500" />                            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />

                                  Aberta                            <p className="text-sm text-muted-foreground">

                                </div>                              Nenhum item adicionado

                              </SelectItem>                            </p>

                              <SelectItem value="IN_PROGRESS">                            <p className="text-xs text-muted-foreground mt-1">

                                <div className="flex items-center gap-2">                              Selecione itens do estoque que serão utilizados

                                  <Clock className="h-3 w-3 text-blue-500" />                            </p>

                                  Em Progresso                          </div>

                                </div>                        </div>

                              </SelectItem>                      ) : (

                              <SelectItem value="COMPLETED">                        <div className="rounded-lg border overflow-hidden">

                                <div className="flex items-center gap-2">                          <table className="w-full">

                                  <CheckCircle2 className="h-3 w-3 text-green-500" />                            <thead>

                                  Concluída                              <tr className="border-b bg-muted/50">

                                </div>                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">

                              </SelectItem>                                  Item

                            </SelectContent>                                </th>

                          </Select>                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">

                        </div>                                  Quantidade

                                                        </th>

                        {/* Data de Conclusão */}                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-16">

                        {formData.status === 'COMPLETED' && (                                  Ação

                          <div className="space-y-2">                                </th>

                            <Label htmlFor="completedAt">                              </tr>

                              <CalendarClock className="h-3.5 w-3.5 inline mr-1.5" />                            </thead>

                              Data de Conclusão                            <tbody>

                            </Label>                              {selectedStockItems.map((item, index) => (

                            <DatePicker                                <tr key={item.id} className={cn(

                              date={formData.completedAt ? new Date(formData.completedAt) : undefined}                                  "border-b",

                              setDate={(date) => setFormData(prev => ({ ...prev, completedAt: date?.toISOString() }))}                                  index % 2 === 0 ? "bg-background" : "bg-muted/20"

                              placeholder="Selecione quando foi concluída"                                )}>

                              disabled={!canEditExecution}                                  <td className="px-4 py-3">

                            />                                    <p className="font-medium text-sm">{item.name}</p>

                          </div>                                  </td>

                        )}                                  <td className="px-4 py-3 text-center">

                      </div>                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">

                    </div>                                      {item.quantity} {item.unit}

                  </div>                                    </span>

                                  </td>

                  {/* Descrição do Trabalho Realizado */}                                  <td className="px-4 py-3 text-center">

                  <div className="rounded-lg border bg-card">                                    <Button 

                    <div className="px-4 py-3 border-b bg-muted/50">                                      variant="ghost" 

                      <h3 className="text-sm font-medium flex items-center gap-2">                                      size="icon"

                        <FileText className="h-4 w-4 text-muted-foreground" />                                      onClick={() => removeStockItem(item.id)}

                        Descrição do Trabalho Realizado                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"

                      </h3>                                    >

                    </div>                                      <Trash2 className="h-4 w-4" />

                    <div className="p-4">                                    </Button>

                      <Textarea                                  </td>

                        value={executionDescription}                                </tr>

                        onChange={(e) => setExecutionDescription(e.target.value)}                              ))}

                        placeholder={                            </tbody>

                          workOrder.type === 'CORRECTIVE'                           </table>

                            ? "Descreva detalhadamente o que foi feito para resolver o problema..."                        </div>

                            : "Descreva as atividades realizadas durante a manutenção preventiva..."                      )}

                        }                    </div>

                        rows={6}                  </div>

                        disabled={!canEditExecution}                </TabsContent>

                        className="resize-none"                

                      />                {/* Aba de Execução */}

                      <p className="text-xs text-muted-foreground mt-2">                {canEditExecution && (

                        Este campo é importante para o histórico de manutenções do equipamento.                  <TabsContent value="execution" className="mt-0 space-y-6">

                      </p>                    {/* Status de Execução */}

                    </div>                    <div className="rounded-lg border bg-card">

                  </div>                      <div className="px-4 py-3 border-b bg-muted/50">

                        <h3 className="text-sm font-medium flex items-center gap-2">

                  {/* Checklist para OS Preventiva */}                          <Circle className="h-4 w-4 text-muted-foreground" />

                  {workOrder.type === 'PREVENTIVE' && checklistResponses.length > 0 && (                          Status da Ordem

                    <div className="rounded-lg border bg-card">                        </h3>

                      <div className="px-4 py-3 border-b bg-muted/50">                      </div>

                        <h3 className="text-sm font-medium flex items-center gap-2">                      <div className="p-4">

                          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />                        <div className="space-y-2">

                          Checklist de Manutenção Preventiva                          <Label htmlFor="status">Status *</Label>

                        </h3>                          <Select

                      </div>                            value={formData.status}

                      <div className="p-4 space-y-4">                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}

                        {checklistResponses.map((response, index) => (                          >

                          <Card key={response.taskId} className="p-4">                            <SelectTrigger className={cn(errors.status && "border-destructive")}>

                            <div className="space-y-3">                              <SelectValue placeholder="Selecione o status" />

                              <div className="flex items-start gap-3">                            </SelectTrigger>

                                <Checkbox                            <SelectContent>

                                  id={`task-${response.taskId}`}                              <SelectItem value="OPEN">Aberta</SelectItem>

                                  checked={response.completed}                              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>

                                  onCheckedChange={(checked) =>                               <SelectItem value="COMPLETED">Concluída</SelectItem>

                                    updateChecklistResponse(response.taskId, 'completed', checked)                            </SelectContent>

                                  }                          </Select>

                                  disabled={!canEditExecution}                          {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}

                                />                        </div>

                                <div className="space-y-1 flex-1">                      </div>

                                  <Label                     </div>

                                    htmlFor={`task-${response.taskId}`}

                                    className="text-sm font-medium cursor-pointer"                    {/* Descrição da Execução */}

                                  >                    <div className="rounded-lg border bg-card">

                                    {index + 1}. {response.taskName}                      <div className="px-4 py-3 border-b bg-muted/50">

                                  </Label>                        <h3 className="text-sm font-medium flex items-center gap-2">

                                                            <FileText className="h-4 w-4 text-muted-foreground" />

                                  {/* Sub-itens do checklist */}                          Descrição da Execução

                                  {response.checkItems && response.checkItems.length > 0 && (                        </h3>

                                    <div className="ml-4 space-y-2 mt-2">                      </div>

                                      {response.checkItems.map(item => (                      <div className="p-4">

                                        <div key={item.id} className="flex items-center gap-2">                        <div className="space-y-2">

                                          <Checkbox                          <Label htmlFor="executionDescription">Detalhes da Execução</Label>

                                            id={`check-${item.id}`}                          <Textarea

                                            checked={item.checked}                            id="executionDescription"

                                            onCheckedChange={(checked) =>                             value={executionDescription}

                                              updateChecklistResponse(                            onChange={(e) => setExecutionDescription(e.target.value)}

                                                response.taskId,                             placeholder="Descreva os procedimentos realizados, observações e resultados..."

                                                'checkItem',                             rows={4}

                                                { itemId: item.id, checked }                            className="resize-none"

                                              )                          />

                                            }                        </div>

                                            disabled={!canEditExecution}                      </div>

                                            className="h-3 w-3"                    </div>

                                          />

                                          <Label                     {/* Checklist para Ordens Preventivas */}

                                            htmlFor={`check-${item.id}`}                    {formData.type === 'PREVENTIVE' && (

                                            className="text-xs text-muted-foreground cursor-pointer"                      <div className="rounded-lg border bg-card">

                                          >                        <div className="px-4 py-3 border-b bg-muted/50">

                                            {item.description}                          <h3 className="text-sm font-medium flex items-center gap-2">

                                          </Label>                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />

                                        </div>                            Checklist de Manutenção

                                      ))}                          </h3>

                                    </div>                        </div>

                                  )}                        <div className="p-4">

                                                            {checklistResponses.length > 0 ? (

                                  {/* Observações da tarefa */}                            <div className="space-y-4">

                                  <div className="mt-3">                              {checklistResponses.map((response, index) => (

                                    <Label className="text-xs text-muted-foreground">                                <div key={response.taskId} className="p-3 border rounded-lg space-y-3">

                                      Observações (opcional)                                  <div className="flex items-center justify-between">

                                    </Label>                                    <h4 className="font-medium text-sm">{response.taskName}</h4>

                                    <Textarea                                    <Checkbox

                                      value={response.observations || ''}                                      checked={response.completed}

                                      onChange={(e) =>                                       onCheckedChange={(checked) => {

                                        updateChecklistResponse(response.taskId, 'observations', e.target.value)                                        const updated = [...checklistResponses];

                                      }                                        updated[index] = { ...response, completed: checked === true };

                                      placeholder="Adicione observações se necessário..."                                        setChecklistResponses(updated);

                                      rows={2}                                      }}

                                      disabled={!canEditExecution}                                    />

                                      className="resize-none mt-1 text-sm"                                  </div>

                                    />                                  

                                  </div>                                  {response.checkItems && response.checkItems.length > 0 && (

                                </div>                                    <div className="ml-4 space-y-2">

                              </div>                                      {response.checkItems.map((item, itemIndex) => (

                            </div>                                        <div key={item.id} className="flex items-center gap-2 text-sm">

                          </Card>                                          <Checkbox

                        ))}                                            checked={item.checked}

                      </div>                                            onCheckedChange={(checked) => {

                    </div>                                              const updated = [...checklistResponses];

                  )}                                              updated[index].checkItems![itemIndex] = { 

                </TabsContent>                                                ...item, 

                                                checked: checked === true 

                {/* Aba de Materiais */}                                              };

                <TabsContent value="materials" className="mt-0 space-y-6">                                              setChecklistResponses(updated);

                  <div className="rounded-lg border bg-card">                                            }}

                    <div className="px-4 py-3 border-b bg-muted/50">                                          />

                      <h3 className="text-sm font-medium flex items-center gap-2">                                          <span className="text-muted-foreground">{item.description}</span>

                        <Package className="h-4 w-4 text-muted-foreground" />                                        </div>

                        Itens de Estoque Utilizados                                      ))}

                      </h3>                                    </div>

                    </div>                                  )}

                    <div className="p-4 space-y-4">                                  

                      {/* Adicionar item */}                                  <div className="space-y-2">

                      <div className="flex flex-col sm:flex-row gap-3">                                    <Label className="text-xs">Observações</Label>

                        <div className="flex-1">                                    <Textarea

                          <Label htmlFor="stockItemId" className="sr-only">Item</Label>                                      value={response.observations || ''}

                          <Select                                       onChange={(e) => {

                            value={stockItemForm.stockItemId}                                         const updated = [...checklistResponses];

                            onValueChange={(value) => setStockItemForm(prev => ({ ...prev, stockItemId: value }))}                                        updated[index] = { ...response, observations: e.target.value };

                            disabled={!canEditMaterials}                                        setChecklistResponses(updated);

                          >                                      }}

                            <SelectTrigger>                                      placeholder="Observações adicionais sobre esta tarefa..."

                              <SelectValue placeholder="Selecione um item do estoque" />                                      rows={2}

                            </SelectTrigger>                                      className="text-sm"

                            <SelectContent>                                    />

                              {availableStockItems.map(item => (                                  </div>

                                <SelectItem key={item.id} value={item.id}>                                </div>

                                  <div className="flex justify-between items-center w-full">                              ))}

                                    <span>{item.description}</span>                            </div>

                                    <span className="text-xs text-muted-foreground ml-2">                          ) : (

                                      {item.unit}                            <div className="text-center py-8 text-muted-foreground">

                                    </span>                              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />

                                  </div>                              <p className="text-sm">Nenhum checklist disponível para esta ordem preventiva</p>

                                </SelectItem>                              <p className="text-xs mt-1">O checklist será carregado automaticamente do plano de manutenção</p>

                              ))}                            </div>

                            </SelectContent>                          )}

                          </Select>                        </div>

                        </div>                      </div>

                                            )}

                        <div className="w-full sm:w-28">

                          <Label htmlFor="quantity" className="sr-only">Quantidade</Label>                    {/* Upload de Fotos */}

                          <Input                     <div className="rounded-lg border bg-card">

                            id="quantity"                      <div className="px-4 py-3 border-b bg-muted/50">

                            type="number"                         <h3 className="text-sm font-medium flex items-center gap-2">

                            min="1"                          <Camera className="h-4 w-4 text-muted-foreground" />

                            value={stockItemForm.quantity}                           Fotos da Execução

                            onChange={(e) => setStockItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}                        </h3>

                            placeholder="Qtd"                      </div>

                            disabled={!canEditMaterials}                      <div className="p-4 space-y-4">

                          />                        {/* Upload Area */}

                        </div>                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">

                                                  <input

                        <Button                             type="file"

                          onClick={addStockItem}                            ref={fileInputRef}

                          disabled={!stockItemForm.stockItemId || !canEditMaterials}                            multiple

                          className="sm:w-auto"                            accept="image/*"

                        >                            onChange={handlePhotoUpload}

                          <Plus className="h-4 w-4 mr-2" />                            className="hidden"

                          Adicionar                          />

                        </Button>                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />

                      </div>                          <p className="text-sm text-muted-foreground mb-2">

                                                  Arraste fotos aqui ou clique para selecionar

                      {/* Lista de itens adicionados */}                          </p>

                      {selectedStockItems.length === 0 ? (                          <Button

                        <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">                            type="button"

                          <div className="flex flex-col items-center text-center">                            variant="outline"

                            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />                            size="sm"

                            <p className="text-sm text-muted-foreground">                            onClick={() => fileInputRef.current?.click()}

                              Nenhum item adicionado                          >

                            </p>                            <Camera className="h-4 w-4 mr-2" />

                            <p className="text-xs text-muted-foreground mt-1">                            Adicionar Fotos

                              Selecione itens do estoque que serão utilizados                          </Button>

                            </p>                        </div>

                          </div>

                        </div>                        {/* Photos Grid */}

                      ) : (                        {uploadedPhotos.length > 0 && (

                        <div className="rounded-lg border overflow-hidden">                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                          <table className="w-full">                            {uploadedPhotos.map((photo) => (

                            <thead>                              <div key={photo.id} className="relative group">

                              <tr className="border-b bg-muted/50">                                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">

                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">                                  <img

                                  Item                                    src={photo.url}

                                </th>                                    alt={photo.name}

                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">                                    className="w-full h-full object-cover"

                                  Quantidade                                  />

                                </th>                                </div>

                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-16">                                <Button

                                  Ação                                  type="button"

                                </th>                                  variant="destructive"

                              </tr>                                  size="sm"

                            </thead>                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"

                            <tbody>                                  onClick={() => removePhoto(photo.id)}

                              {selectedStockItems.map((item, index) => (                                >

                                <tr key={item.id} className={cn(                                  <X className="h-3 w-3" />

                                  "border-b",                                </Button>

                                  index % 2 === 0 ? "bg-background" : "bg-muted/20"                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs truncate">

                                )}>                                  {photo.name}

                                  <td className="px-4 py-3">                                </div>

                                    <p className="font-medium text-sm">{item.name}</p>                              </div>

                                  </td>                            ))}

                                  <td className="px-4 py-3 text-center">                          </div>

                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">                        )}

                                      {item.quantity} {item.unit}                      </div>

                                    </span>                    </div>

                                  </td>

                                  <td className="px-4 py-3 text-center">                    {/* Data de Conclusão */}

                                    <Button                     {formData.status === 'COMPLETED' && (

                                      variant="ghost"                       <div className="rounded-lg border bg-card">

                                      size="icon"                        <div className="px-4 py-3 border-b bg-muted/50">

                                      onClick={() => removeStockItem(item.id)}                          <h3 className="text-sm font-medium flex items-center gap-2">

                                      disabled={!canEditMaterials}                            <CalendarClock className="h-4 w-4 text-muted-foreground" />

                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"                            Data de Conclusão

                                    >                          </h3>

                                      <Trash2 className="h-4 w-4" />                        </div>

                                    </Button>                        <div className="p-4">

                                  </td>                          <div className="space-y-2">

                                </tr>                            <Label htmlFor="completedAt">Data de Conclusão *</Label>

                              ))}                            <DatePicker

                            </tbody>                              date={formData.completedAt ? new Date(formData.completedAt) : undefined}

                          </table>                              setDate={(date) => setFormData(prev => ({ ...prev, completedAt: date?.toISOString() }))}

                        </div>                              placeholder="Selecione quando foi concluída"

                      )}                            />

                    </div>                            {errors.completedAt && <p className="text-sm text-destructive">{errors.completedAt}</p>}

                  </div>                          </div>

                </TabsContent>                        </div>

                                      </div>

                {/* Aba de Fotos */}                    )}

                <TabsContent value="photos" className="mt-0 space-y-6">                  </TabsContent>

                  <div className="rounded-lg border bg-card">                )}

                    <div className="px-4 py-3 border-b bg-muted/50">              </div>

                      <h3 className="text-sm font-medium flex items-center gap-2">            </ScrollArea>

                        <Camera className="h-4 w-4 text-muted-foreground" />          </Tabs>

                        Fotos e Evidências        </div>

                      </h3>

                    </div>        {/* Footer - Fixed */}

                    <div className="p-4 space-y-4">        <div className="border-t bg-background px-6 py-4 shrink-0">

                      {/* Upload de Fotos */}          <div className="flex items-center justify-between">

                      <div className="flex items-center gap-4">            <div className="text-sm text-muted-foreground">

                        <input              {Object.keys(errors).length > 0 && (

                          ref={fileInputRef}                <p className="text-destructive flex items-center gap-1">

                          type="file"                  <AlertTriangle className="h-3.5 w-3.5" />

                          accept="image/*"                  Corrija os campos obrigatórios

                          multiple                </p>

                          onChange={handlePhotoUpload}              )}

                          className="hidden"            </div>

                        />            <div className="flex items-center gap-3">

                        <Button              <Button 

                          onClick={() => fileInputRef.current?.click()}                variant="outline" 

                          disabled={isUploadingPhoto}                onClick={onClose}

                          variant="outline"                disabled={isSubmitting}

                        >              >

                          {isUploadingPhoto ? (                Cancelar

                            <>              </Button>

                              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />              <Button 

                              Enviando...                onClick={handleSave} 

                            </>                disabled={isSubmitting}

                          ) : (                className="min-w-[100px]"

                            <>              >

                              <Upload className="h-4 w-4 mr-2" />                {isSubmitting ? (

                              Adicionar Fotos                  <>

                            </>                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />

                          )}                    Salvando...

                        </Button>                  </>

                        <p className="text-sm text-muted-foreground">                ) : (

                          Formatos aceitos: JPG, PNG, GIF (máx. 5MB cada)                  <>

                        </p>                    <Save className="h-4 w-4 mr-2" />

                      </div>                    Salvar Alterações

                                        </>

                      {/* Grid de Fotos */}                )}

                      {uploadedPhotos.length === 0 ? (              </Button>

                        <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">            </div>

                          <div className="flex flex-col items-center text-center">          </div>

                            <Camera className="h-12 w-12 text-muted-foreground/50 mb-3" />        </div>

                            <p className="text-sm text-muted-foreground">      </DialogContent>

                              Nenhuma foto adicionada    </Dialog>

                            </p>  );

                            <p className="text-xs text-muted-foreground mt-1">}
                              Adicione fotos para documentar o trabalho realizado
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedPhotos.map(photo => (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                                <img 
                                  src={photo.url} 
                                  alt={photo.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => removePhoto(photo.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground truncate">
                                  {photo.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(photo.uploadedAt).toLocaleDateString('pt-BR')}
                                  {photo.uploadedBy && ` • ${photo.uploadedBy}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-background px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {Object.keys(errors).length > 0 && (
                <p className="text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Corrija os campos obrigatórios
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSubmitting || (!canEditDetails && !canEditExecution && !canEditMaterials)}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}