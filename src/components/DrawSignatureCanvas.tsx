import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Save, PenTool, Loader2 } from 'lucide-react';

interface DrawSignatureCanvasProps {
  onSave: (blob: Blob) => Promise<void> | void;
  saving?: boolean;
  height?: number;
  label?: string;
}

/**
 * Canvas de desenho de assinatura reutilizável (mouse/touch/pen).
 * Emite um Blob PNG via onSave. Não persiste nada por conta própria.
 */
export default function DrawSignatureCanvas({
  onSave,
  saving = false,
  height = 160,
  label = 'Desenhe sua assinatura no quadro abaixo',
}: DrawSignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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

  const salvar = async () => {
    const canvas = canvasRef.current!;
    const blob: Blob = await new Promise((res) =>
      canvas.toBlob((b) => res(b!), 'image/png'),
    );
    await onSave(blob);
    clear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <PenTool className="h-4 w-4" /> {label}
      </div>
      <canvas
        ref={canvasRef}
        style={{ height }}
        className="w-full border-2 border-dashed border-muted-foreground/40 rounded-md bg-white touch-none cursor-crosshair"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear} disabled={saving}>
          <Eraser className="h-4 w-4 mr-1" /> Limpar
        </Button>
        <Button type="button" size="sm" onClick={salvar} disabled={saving || !hasContent}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Salvar assinatura desenhada
        </Button>
      </div>
    </div>
  );
}
