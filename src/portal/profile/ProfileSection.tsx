import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, X } from 'lucide-react';

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  isEditable?: boolean;
  onEditToggle?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ProfileSection({
  title,
  description,
  children,
  isEditable,
  onEditToggle,
  isEditing,
  onSave,
  onCancel,
  loading
}: ProfileSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {isEditable && !isEditing && (
          <Button variant="ghost" size="sm" onClick={onEditToggle} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
                <X className="h-4 w-4" />
                Cancelar
             </Button>
             <Button size="sm" onClick={onSave} disabled={loading}>
                Salvar
             </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
