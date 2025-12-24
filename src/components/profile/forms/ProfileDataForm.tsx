import { useState, useRef, useCallback } from 'react';
import { User, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { User as UserType } from '@/models/user';

interface ProfileDataFormProps {
  user: UserType;
  onSave: (data: Partial<UserType>) => void;
}

export function ProfileDataForm({ user, onSave }: ProfileDataFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.phone && !/^[+]?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAvatarPreview(dataUrl);
      setFormData(prev => ({ ...prev, avatar_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="tabpanel"
      aria-labelledby="tab-dados"
      id="panel-dados"
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium mb-2">Dados Pessoais</h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações pessoais e foto de perfil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar do usuário"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            {avatarPreview && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full"
                onClick={handleRemoveAvatar}
                aria-label="Remover foto do perfil"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {avatarPreview ? 'Alterar Foto' : 'Adicionar Foto'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              aria-label="Selecionar foto do perfil"
            />
            
            <p className="text-xs text-muted-foreground">
              JPG, PNG até 5MB
            </p>
          </div>
        </div>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome Completo *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Entre em contato com o administrador para alterar o email
          </p>
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Telefone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(11) 99999-9999"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p id="phone-error" role="alert" className="text-sm text-destructive">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                name: user.name || '',
                phone: user.phone || '',
                avatar_url: user.avatar_url || '',
              });
              setAvatarPreview(user.avatar_url || '');
              setErrors({});
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}