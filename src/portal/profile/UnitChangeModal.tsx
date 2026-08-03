import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnitChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnitId?: string | null;
  associadoId: string;
}

export function UnitChangeModal({ 
  isOpen, 
  onClose, 
  currentUnitId,
  associadoId 
}: UnitChangeModalProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const { data: unidades, isLoading } = useQuery({
    queryKey: ['cams-unidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cams_unidades')
        .select('*')
        .eq('active', true)
        .order('nome');
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async () => {
    if (!selectedUnit) {
      toast.error('Selecione uma unidade.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: protocolData } = await supabase.rpc('generate_protocol');
      const protocol = protocolData || 'REQ-' + Date.now();

      // Create Correction Request for Unit change (Section 9)
      const { error: requestError } = await supabase
        .from('data_correction_requests')
        .insert({
          protocol,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          associado_id: associadoId,
          field_key: 'unidade_id',
          current_value: currentUnitId,
          new_value: selectedUnit,
          justification: 'Alteração de unidade operacional solicitada pelo associado.',
          status: 'sent'
        });

      if (requestError) throw requestError;

      toast.success(`Solicitação enviada! Protocolo: ${protocol}`);
      onClose();
    } catch (error: any) {
      toast.error('Erro ao enviar solicitação: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Alterar Unidade Operacional
          </DialogTitle>
          <DialogDescription>
            Selecione sua nova lotação. A alteração passará por validação administrativa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Unidade Atual</Label>
            <div className="p-2 bg-muted rounded border text-sm italic">
              {unidades?.find(u => u.id === currentUnitId)?.nome || 'Não informada'}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newUnit">Nova Unidade</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione a unidade"} />
              </SelectTrigger>
              <SelectContent>
                {unidades?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.nome} ({u.sigla})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting || isLoading}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirmar Alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
