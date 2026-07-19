import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Building2, FileText } from "lucide-react";

export default function AdminHome() {
  const [counts, setCounts] = useState({ associados: 0, dependentes: 0, clinicas: 0, informes: 0 });

  useEffect(() => {
    (async () => {
      const [a, d, c, i] = await Promise.all([
        supabase.from("associados").select("*", { count: "exact", head: true }),
        supabase.from("dependentes").select("*", { count: "exact", head: true }),
        supabase.from("clinicas_parceiros").select("*", { count: "exact", head: true }),
        supabase.from("informes_rendimentos").select("*", { count: "exact", head: true }),
      ]);
      setCounts({
        associados: a.count ?? 0,
        dependentes: d.count ?? 0,
        clinicas: c.count ?? 0,
        informes: i.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Associados", value: counts.associados, icon: Users },
    { label: "Dependentes", value: counts.dependentes, icon: UserPlus },
    { label: "Clínicas & Parceiros", value: counts.clinicas, icon: Building2 },
    { label: "Informes", value: counts.informes, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel administrativo</h1>
        <p className="text-muted-foreground">Gerencie os dados exibidos aos associados.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
