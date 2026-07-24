import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { RefreshCw } from "lucide-react";

type Row = { path: string | null; event: string; created_at: string };

export default function AdminAnalytics() {
  const [rows, setRows] = useState<Row[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const { data } = await supabase
      .from("analytics_events")
      .select("path,event,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  const topPaths = useMemo(() => {
    const m = new Map<string, number>();
    rows.filter((r) => r.event === "pageview").forEach((r) => {
      const k = r.path ?? "(desconhecido)";
      m.set(k, (m.get(k) ?? 0) + 1);
    });
    return Array.from(m, ([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [rows]);

  const perDay = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const d = r.created_at.slice(0, 10);
      m.set(d, (m.get(d) ?? 0) + 1);
    });
    return Array.from(m, ([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  const totalPageviews = rows.filter((r) => r.event === "pageview").length;
  const totalEvents = rows.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics de Uso</h1>
          <p className="text-sm text-muted-foreground">Pageviews e eventos dos últimos {days} dias</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" />Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pageviews</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{totalPageviews}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Eventos totais</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{totalEvents}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Páginas únicas</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{topPaths.length}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Evolução diária</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top 10 páginas</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPaths} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="path" fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-center text-sm text-muted-foreground">Carregando…</p>}
    </div>
  );
}
