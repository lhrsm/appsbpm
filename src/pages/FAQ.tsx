import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search } from "lucide-react";
import PageSkeleton from "@/components/PageSkeleton";

type FaqItem = {
  id: string;
  categoria: string;
  pergunta: string;
  resposta: string;
  ordem: number;
};

export default function FAQ() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("faq_items")
        .select("*")
        .eq("publicado", true)
        .order("categoria")
        .order("ordem");
      setItems((data as FaqItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = term
      ? items.filter(
          (i) =>
            i.pergunta.toLowerCase().includes(term) ||
            i.resposta.toLowerCase().includes(term) ||
            i.categoria.toLowerCase().includes(term),
        )
      : items;
    const map: Record<string, FaqItem[]> = {};
    for (const it of filtered) {
      (map[it.categoria] ??= []).push(it);
    }
    return map;
  }, [items, q]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" /> Perguntas Frequentes
        </h1>
        <p className="text-sm text-muted-foreground">
          Encontre respostas rápidas para as dúvidas mais comuns.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar pergunta ou palavra-chave…"
          className="pl-9"
        />
      </div>

      {Object.keys(grouped).length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum resultado encontrado.
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([cat, list]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-base capitalize">{cat}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {list.map((it) => (
                <AccordionItem key={it.id} value={it.id}>
                  <AccordionTrigger className="text-left">{it.pergunta}</AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-sm text-muted-foreground">
                    {it.resposta}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
