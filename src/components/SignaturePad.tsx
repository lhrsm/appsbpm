import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eraser, Save, Upload, Loader2, PenTool, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAssociado } from '@/contexts/AssociadoContext';

interface SignaturePadProps {
  currentSignatureUrl?: string | null;
  userId: string;
  userType: 'associado' | 'dependente';
  onSaved?: (url: string) => void;
}

export default function SignaturePad({
  currentSignatureUrl,
  userId,
  userType,
  onSaved,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentSignatureUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { associado } = useAssociado();

  useEffect(() => setPreview(currentSignatureUrl || null), [currentSignatureUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Resize canvas para nitidez
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const onUp = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasContent(false);
  };

  const uploadBlob = async (blob: Blob) => {
    if (!associado?.matricula) throw new Error('Sessão inválida');
    const path = `assinaturas/${userType}-${userId}.png`;
    const { error: upErr } = await supabase.storage
      .from('profile-photos')
      .upload(path, blob, { upsert: true, contentType: 'image/png' });
    if (upErr) throw upErr;
    const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path);

    const { data, error } = await supabase.functions.invoke('update-perfil', {
      body: {
        tipo: userType,
        id: userId,
        matricula_titular: associado.matricula,
        cpf: associado.cpf,
        campos: { assinatura_url: publicUrl },
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const busted = `${publicUrl}?t=${Date.now()}`;
    setPreview(busted);
    onSaved?.(busted);
    toast.success('Assinatura salva!');
  };

  const saveDrawing = async () => {
    if (!hasContent) return toast.error('Desenhe sua assinatura antes de salvar.');
    setSaving(true);
    try {
      const canvas = canvasRef.current!;
      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), 'image/png'),
      );
      await uploadBlob(blob);
      clear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar assinatura');
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Selecione uma imagem');
    if (file.size > 2 * 1024 * 1024) return toast.error('Máx. 2MB');
    setSaving(true);
    try {
      await uploadBlob(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {preview && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <img src={preview} alt="Assinatura atual" className="h-16 bg-white rounded border p-1" />
          <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
            <Check className="h-4 w-4" /> Assinatura cadastrada
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PenTool className="h-4 w-4" /> Desenhe sua assinatura no quadro abaixo
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-40 border-2 border-dashed border-muted-foreground/40 rounded-md bg-white touch-none cursor-crosshair"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clear} disabled={saving}>
              <Eraser className="h-4 w-4 mr-1" /> Limpar
            </Button>
            <Button type="button" size="sm" onClick={saveDrawing} disabled={saving || !hasContent}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar assinatura
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={saving}
            >
              <Upload className="h-4 w-4 mr-1" /> Enviar imagem
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
