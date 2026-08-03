import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, FileText } from 'lucide-react';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string;
  fieldName: string;
  currentValue: string;
}

export function CorrectionRequestModal({ 
  isOpen, 
  onClose, 
  fieldKey, 
  fieldName, 
  currentValue 
}: CorrectionRequestModalProps) {
  const { associado, dependenteLogado, isDependente } = useAssociado();
  const [newValue, setNewValue] = useState('');
  const [justification, setJustification] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newValue.trim() || !justification.trim()) {
      toast.error('Preencha o novo valor e a justificativa.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: protocolData } = await supabase.rpc('generate_protocol');
      const protocol = protocolData || 'REQ-' + Date.now();

      // 1. Create Request
      const { data: request, error: requestError } = await supabase
        .from('data_correction_requests')
        .insert({
          protocol,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          associado_id: associado?.id,
          dependente_id: isDependente ? dependenteLogado?.id : null,
          field_key: fieldKey,
          current_value: currentValue,
          new_value: newValue,
          justification,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // 2. Upload Documents
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `correction-docs/${request.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('associados_documentos')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          await supabase.from('correction_request_documents').insert({
            request_id: request.id,
            file_path: filePath,
            file_name: file.name,
            content_type: file.type,
            size_bytes: file.size,
          });
        }
      }

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
          <DialogTitle>Solicitar Correção</DialogTitle>
          <DialogDescription>
            Campo: <strong>{fieldName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Valor atual</Label>
            <Input value={currentValue} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newValue">Novo valor correto</Label>
            <Input 
              id="newValue" 
              value={newValue} 
              onChange={(e) => setNewValue(e.target.value)} 
              placeholder="Digite o valor correto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="justification">Justificativa</Label>
            <Textarea 
              id="justification" 
              value={justification} 
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explique por que este dado está incorreto"
            />
          </div>
          <div className="space-y-2">
            <Label>Documentação comprobatória</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Arraste ou clique para anexar documentos (RG, Contracheque, etc.)</p>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted p-1 rounded">
                    <FileText className="h-3 w-3" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enviar Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
