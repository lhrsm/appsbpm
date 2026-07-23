import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAssociado } from "@/contexts/AssociadoContext";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AvaliacaoParceiro({ clinicaId, nome }: { clinicaId: string; nome: string }) {
  const { associado } = useAssociado();
  const [media, setMedia] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("avaliacoes_parceiros")
        .select("nota")
        .eq("clinica_id", clinicaId)
        .eq("aprovado", true);
      if (data && data.length > 0) {
        const avg = data.reduce((s: number, r: any) => s + r.nota, 0) / data.length;
        setMedia(avg);
        setTotal(data.length);
      } else {
        setMedia(null);
        setTotal(0);
      }
    })();
  }, [clinicaId]);

  const enviar = async () => {
    if (!associado) return;
    setSaving(true);
    const { error } = await supabase.from("avaliacoes_parceiros").upsert(
      {
        clinica_id: clinicaId,
        associado_id: associado.id,
        autor_nome: associado.nome,
        nota,
        comentario: comentario.trim() || null,
        aprovado: false,
      },
      { onConflict: "clinica_id,associado_id" },
    );
    setSaving(false);
    if (error) {
      toast.error("Não foi possível enviar", { description: error.message });
      return;
    }
    toast.success("Avaliação enviada!", {
      description: "Será publicada após moderação.",
    });
    setOpen(false);
    setComentario("");
    setNota(5);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              media && i <= Math.round(media)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground",
            )}
          />
        ))}
        <span className="text-muted-foreground ml-1">
          {media ? `${media.toFixed(1)} (${total})` : "sem avaliações"}
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
            <MessageSquare className="h-3 w-3 mr-1" /> Avaliar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar {nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">Sua nota:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNota(i)}
                    aria-label={`${i} estrelas`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        i <= nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm mb-2">Comentário (opcional):</p>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte sua experiência…"
                rows={4}
                maxLength={500}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Sua avaliação passará por moderação antes de ser publicada.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={enviar} disabled={saving}>
              {saving ? "Enviando…" : "Enviar avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
