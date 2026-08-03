import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAssociado } from "@/contexts/AssociadoContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Check } from "lucide-react";
import { toast } from "sonner";
import PageSkeleton from "@/components/PageSkeleton";

type Evento = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  local: string | null;
  endereco: string | null;
  data_inicio: string;
  data_fim: string | null;
  capacidade: number | null;
  imagem_url: string | null;
  permite_rsvp: boolean;
};

export default function Agenda() {
  const { associado } = useAssociado();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: evts } = await supabase
      .from("eventos")
      .select("*")
      .eq("ativo", true)
      .order("data_inicio", { ascending: true });
    setEventos((evts as Evento[]) ?? []);
    if (associado) {
      const { data: r } = await supabase
        .from("evento_rsvps")
        .select("evento_id")
        .eq("associado_id", associado.id);
      setRsvps(new Set((r ?? []).map((x: any) => x.evento_id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [associado?.id]);

  const confirmar = async (ev: Evento) => {
    if (!associado) return;
    const { error } = await supabase.from("evento_rsvps").insert({
      evento_id: ev.id,
      associado_id: associado.id,
      nome: associado.nome,
      matricula: associado.matricula,
      status: "confirmado",
    });
    if (error) {
      toast.error("Não foi possível confirmar", { description: error.message });
      return;
    }
    toast.success("Presença confirmada!");
    setRsvps((s) => new Set(s).add(ev.id));
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> Agenda de Eventos
        </h1>
        <p className="text-sm text-muted-foreground">
          Assembleias, campanhas e eventos institucionais da SBPM.
        </p>
      </div>

      {eventos.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum evento programado no momento.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {eventos.map((ev) => {
          const confirmed = rsvps.has(ev.id);
          const past = new Date(ev.data_inicio) < new Date();
          return (
            <Card key={ev.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {ev.imagem_url && (
                <img src={ev.imagem_url} alt={ev.titulo} className="w-full h-40 object-cover" />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{ev.titulo}</CardTitle>
                  <Badge variant="secondary" className="capitalize">{ev.categoria}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {new Date(ev.data_inicio).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                  </p>
                  {ev.local && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {ev.local}
                      {ev.endereco ? ` — ${ev.endereco}` : ""}
                    </p>
                  )}
                  {ev.capacidade && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" /> Capacidade: {ev.capacidade}
                    </p>
                  )}
                </div>
                {ev.descricao && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{ev.descricao}</p>
                )}
                {ev.permite_rsvp && !past && (
                  confirmed ? (
                    <Button variant="secondary" disabled className="w-full">
                      <Check className="h-4 w-4 mr-1" /> Presença confirmada
                    </Button>
                  ) : (
                    <Button onClick={() => confirmar(ev)} className="w-full">
                      Confirmar presença
                    </Button>
                  )
                )}
                {past && (
                  <Badge variant="outline" className="w-full justify-center py-1">Evento encerrado</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
