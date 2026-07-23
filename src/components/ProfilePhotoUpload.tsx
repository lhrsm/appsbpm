import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAssociado } from '@/contexts/AssociadoContext';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  userId: string;
  userType: 'associado' | 'dependente';
  userName: string;
  onPhotoUpdated?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  userId,
  userType,
  userName,
  onPhotoUpdated,
  size = 'md',
  className,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { associado, dependentes } = useAssociado();

  useEffect(() => {
    setPhotoUrl(currentPhotoUrl);
  }, [currentPhotoUrl]);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const buttonSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${userType}-${userId}.${fileExt}`;
      const filePath = `${userType}s/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Add cache-busting parameter
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      // Persistir foto_url via Edge Function (contorna RLS com autorização por matrícula)
      if (!associado?.matricula) {
        throw new Error('Sessão inválida: matrícula do titular não encontrada.');
      }
      const cpfParaEnvio =
        userType === 'dependente'
          ? dependentes.find((d) => d.id === userId)?.cpf || undefined
          : associado.cpf;
      const { data: updData, error: updateError } = await supabase.functions.invoke('update-perfil', {
        body: {
          tipo: userType,
          id: userId,
          matricula_titular: associado.matricula,
          cpf: cpfParaEnvio,
          campos: { foto_url: publicUrl },
        },
      });


      if (updateError) throw updateError;
      if (updData?.error) throw new Error(updData.error);

      setPhotoUrl(urlWithCacheBust);
      onPhotoUpdated?.(urlWithCacheBust);

      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Erro ao enviar foto',
        description: 'Ocorreu um erro ao enviar a foto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-2 border-white shadow-lg')}>
        <AvatarImage src={photoUrl || undefined} alt={userName} className="object-cover" />
        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
          {initials || <User className={iconSizes[size]} />}
        </AvatarFallback>
      </Avatar>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className={cn(
          'absolute -bottom-1 -right-1 rounded-full shadow-md',
          buttonSizes[size]
        )}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Camera className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
