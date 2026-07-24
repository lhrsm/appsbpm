import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { Users, Building2, Wallet, TrendingUp } from 'lucide-react';

const COLORS = ['#1a6b3f', '#c8102e', '#0057a3', '#f4b400', '#6b7280'];

export default function AdminRelatorios() {
  const [loading, setLoading] = useState(true);
  const [assoc, setAssoc] = useState<any[]>([]);
  const [deps, setDeps] = useState<any[]>([]);
  const [mens, setMens] = useState<any[]>([]);
  const [clins, setClins] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [a, d, m, c] = await Promise.all([
        supabase.from('associados').select('id,patente,cidade,estado,ativo,created_at'),
        supabase.from('dependentes').select('id,associado_id,ativo'),
        supabase.from('mensalidades').select('valor,status,vencimento'),
        supabase.from('clinicas_parceiros').select('categoria,ativo'),
      ]);
      setAssoc(a.data ?? []);
      setDeps(d.data ?? []);
      setMens(m.data ?? []);
      setClins(c.data ?? []);
      setLoading(false);
    })();
  }, []);

  const kpis = useMemo(() => {
    const totalAssoc = assoc.length;
    const ativos = assoc.filter((a) => a.ativo).length;
    const totalDep = deps.length;
    const pagas = mens.filter((m) => m.status === 'paga');
    const receita = pagas.reduce((s, m) => s + Number(m.valor || 0), 0);
    return { totalAssoc, ativos, totalDep, receita };
  }, [assoc, deps, mens]);

  const porPatente = useMemo(() => {
    const map: Record<string, number> = {};
    assoc.forEach((a) => {
      const k = a.patente || 'Não informada';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [assoc]);

  const porCidade = useMemo(() => {
    const map: Record<string, number> = {};
    assoc.forEach((a) => {
      const k = a.cidade || 'Não informada';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [assoc]);

  const catParceiros = useMemo(() => {
    const map: Record<string, number> = {};
    clins.filter((c) => c.ativo).forEach((c) => {
      const k = c.categoria || 'Outros';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [clins]);

  const evolucaoMensal = useMemo(() => {
    const map: Record<string, number> = {};
    assoc.forEach((a) => {
      if (!a.created_at) return;
      const d = new Date(a.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([mes, novos]) => ({ mes, novos }));
  }, [assoc]);

  if (loading) return <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;

  const Kpi = ({ icon: Icon, label, value, color }: any) => (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Relatórios Gerenciais</h1>
        <p className="text-sm text-muted-foreground">Visão consolidada da base de associados e uso da plataforma.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label="Total associados" value={kpis.totalAssoc} color="bg-sbpm-green" />
        <Kpi icon={TrendingUp} label="Ativos" value={kpis.ativos} color="bg-sbpm-blue" />
        <Kpi icon={Users} label="Dependentes" value={kpis.totalDep} color="bg-sbpm-yellow" />
        <Kpi icon={Wallet} label="Receita paga" value={kpis.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="bg-sbpm-red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Associados por patente</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porPatente}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1a6b3f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Parceiros por categoria</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catParceiros} dataKey="value" nameKey="name" outerRadius={90} label>
                  {catParceiros.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top cidades</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porCidade} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#0057a3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Novos associados (últimos 12 meses)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="novos" stroke="#c8102e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
