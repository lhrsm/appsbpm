import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, Gift, X } from "lucide-react";
import { useAssociado } from "@/contexts/AssociadoContext";
import { getMonth, parseISO } from "date-fns";

type Comunicado = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "informativo" | "alerta" | "promocao";
  segmento: "todos" | "cidade" | "aniversariantes";
  cidade_alvo: string | null;
};

const iconMap = { informativo: Info, alerta: AlertTriangle, promocao: Gift };
const styleMap: Record<Comunicado["tipo"], string> = {
  informativo: "border-blue-300 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100",
  alerta: "border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100",
  promocao: "border-green-300 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100",
};

const DISMISS_KEY = "sbpm_comunicados_dismiss";

export default function ComunicadosBanner() {
  const { associado, dependenteLogado, isDependente } = useAssociado();
  const [items, setItems] = useState<Comunicado[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { setDismissed(new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"))); } catch {}
    (async () => {
      const { data } = await supabase.from("comunicados").select("*");
      setItems((data as any) || []);
    })();
  }, []);

  const nascimento = isDependente ? dependenteLogado?.data_nascimento : associado?.data_nascimento;
  const cidade = (associado as any)?.cidade || null;
  const mesAtual = getMonth(new Date());
  const aniversarioEsteMes = nascimento ? getMonth(parseISO(nascimento)) === mesAtual : false;

  const visiveis = items.filter((c) => {
    if (dismissed.has(c.id)) return false;
    if (c.segmento === "todos") return true;
    if (c.segmento === "aniversariantes") return aniversarioEsteMes;
    if (c.segmento === "cidade") return c.cidade_alvo && cidade && c.cidade_alvo.toLowerCase() === String(cidade).toLowerCase();
    return false;
  });

  const dismiss = (id: string) => {
    const next = new Set(dismissed); next.add(id);
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
  };

  if (!visiveis.length) return null;

  return (
    <div className="space-y-2">
      {visiveis.map((c) => {
        const Icon = iconMap[c.tipo];
        return (
          <Card key={c.id} className={`p-4 border-l-4 ${styleMap[c.tipo]}`}>
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{c.titulo}</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{c.mensagem}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => dismiss(c.id)} className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
