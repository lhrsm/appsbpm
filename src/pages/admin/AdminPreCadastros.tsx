import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Search, RefreshCw, Phone, FileDown } from 'lucide-react';
import { STATUS_PRE_CADASTRO, rotuloStatus } from '@/lib/associacao';
import { maskCPF, formatPhone } from '@/lib/format';

interface PreCadastro {
  id: string;
  protocol: string;
  full_name: string;
  cpf_reference: string;
  registration_number: string | null;
  rank_other: string | null;
  functional_status: string;
  email: string;
  phone: string;
  status: string;
  observacoes: string | null;
  submitted_at: string;
  association_ranks?: { nome: string } | null;
}

interface Contato {
  id: string;
  contact_type: string;
  contact_at: string;
  result: string | null;
  notes: string | null;
}

interface Historico {
  id: string;
  previous_status: string | null;
  new_status: string;
  created_at: string;
}

const dataHora = (v?: string | null) =>
  v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default function AdminPreCadastros() {
  const [itens, setItens] = useState<PreCadastro[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<PreCadastro | null>(null);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [notaContato, setNotaContato] = useState('');
  const [tipoContato, setTipoContato] = useState('telefone');

  const carregar = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from('association_pre_registrations')
      .select('*, association_ranks(nome)')
      .is('deleted_at', null)
      .order('submitted_at', { ascending: false });
    setCarregando(false);
    if (error) {
      toast.error('Não foi possível carregar os pré-cadastros.');
      return;
    }
    setItens((data ?? []) as unknown as PreCadastro[]);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirDetalhe = async (item: PreCadastro) => {
    setAberto(item);
    setNotaContato('');
    const [{ data: c }, { data: h }] = await Promise.all([
      supabase
        .from('association_contacts')
        .select('id, contact_type, contact_at, result, notes')
        .eq('pre_registration_id', item.id)
        .order('contact_at', { ascending: false }),
      supabase
        .from('association_status_history')
        .select('id, previous_status, new_status, created_at')
        .eq('pre_registration_id', item.id)
        .order('created_at', { ascending: false }),
    ]);
    setContatos((c ?? []) as Contato[]);
    setHistorico((h ?? []) as Historico[]);
  };

  const alterarStatus = async (novo: string) => {
    if (!aberto) return;
    const { error } = await supabase
      .from('association_pre_registrations')
      .update({ status: novo })
      .eq('id', aberto.id);
    if (error) {
      toast.error('Sem permissão para alterar o status.');
      return;
    }
    toast.success(`Status alterado para ${rotuloStatus(novo)}.`);
    setAberto({ ...aberto, status: novo });
    carregar();
    abrirDetalhe({ ...aberto, status: novo });
  };

  const registrarContato = async () => {
    if (!aberto || !notaContato.trim()) return;
    const { error } = await supabase.from('association_contacts').insert({
      pre_registration_id: aberto.id,
      contact_type: tipoContato,
      notes: notaContato.trim(),
      performed_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    });
    if (error) {
      toast.error('Não foi possível registrar o contato.');
      return;
    }
    toast.success('Contato registrado.');
    setNotaContato('');
    abrirDetalhe(aberto);
  };

  const exportar = () => {
    const linhas = [
      ['Protocolo', 'Nome', 'Posto', 'Situação', 'E-mail', 'Telefone', 'Status', 'Recebido em'],
      ...filtrados.map((i) => [
        i.protocol,
        i.full_name,
        i.association_ranks?.nome ?? i.rank_other ?? '',
        i.functional_status === 'regular' ? 'Ativo' : 'Inativo',
        i.email,
        formatPhone(i.phone),
        rotuloStatus(i.status),
        dataHora(i.submitted_at),
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pre-cadastros-associacao.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((i) => {
      const okStatus = filtroStatus === 'todos' || i.status === filtroStatus;
      const okBusca =
        !q ||
        i.full_name.toLowerCase().includes(q) ||
        i.protocol.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q);
      return okStatus && okBusca;
    });
  }, [itens, busca, filtroStatus]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pré-cadastros de associação</h1>
          <p className="text-sm text-muted-foreground">
            Solicitações enviadas pelo portal externo. Um pré-cadastro não representa associação concluída.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregar} disabled={carregando}>
            <RefreshCw className={`mr-2 h-4 w-4 ${carregando ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button variant="outline" onClick={exportar}>
            <FileDown className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="busca">Pesquisar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="busca"
                className="pl-9"
                placeholder="Nome, protocolo ou e-mail"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {STATUS_PRE_CADASTRO.map((s) => (
                  <SelectItem key={s.valor} value={s.valor}>{s.rotulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filtrados.map((i) => (
          <button
            key={i.id}
            onClick={() => abrirDetalhe(i)}
            className="rounded-xl border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{i.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {i.protocol} · {i.association_ranks?.nome ?? i.rank_other ?? 'Posto não informado'} ·{' '}
                  {i.functional_status === 'ativo' ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{rotuloStatus(i.status)}</Badge>
                <span className="text-xs text-muted-foreground">{dataHora(i.submitted_at)}</span>
              </div>
            </div>
          </button>
        ))}
        {!carregando && filtrados.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum pré-cadastro encontrado.
          </p>
        )}
      </div>

      <Sheet open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {aberto && (
            <>
              <SheetHeader>
                <SheetTitle>{aberto.full_name}</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-6 text-sm">
                <section className="space-y-1">
                  <h3 className="font-semibold">Dados do interessado</h3>
                  <p><span className="text-muted-foreground">Protocolo:</span> {aberto.protocol}</p>
                  <p><span className="text-muted-foreground">CPF:</span> {maskCPF(aberto.cpf_reference)}</p>
                  <p><span className="text-muted-foreground">Matrícula:</span> {aberto.registration_number ?? '—'}</p>
                  <p><span className="text-muted-foreground">Posto:</span> {aberto.association_ranks?.nome ?? aberto.rank_other ?? '—'}</p>
                  <p><span className="text-muted-foreground">Situação:</span> {aberto.functional_status === 'ativo' ? 'Ativo' : 'Inativo'}</p>
                  <p><span className="text-muted-foreground">E-mail:</span> {aberto.email}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {formatPhone(aberto.phone)}</p>
                  <p><span className="text-muted-foreground">Recebido em:</span> {dataHora(aberto.submitted_at)}</p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Status</h3>
                  <Select value={aberto.status} onValueChange={alterarStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_PRE_CADASTRO.map((s) => (
                        <SelectItem key={s.valor} value={s.valor}>{s.rotulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Registrar contato</h3>
                  <Select value={tipoContato} onValueChange={setTipoContato}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={notaContato}
                    onChange={(e) => setNotaContato(e.target.value)}
                    placeholder="Resumo do contato realizado"
                    maxLength={1000}
                  />
                  <Button onClick={registrarContato} disabled={!notaContato.trim()}>
                    <Phone className="mr-2 h-4 w-4" /> Registrar contato
                  </Button>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Histórico de contatos</h3>
                  {contatos.length === 0 && <p className="text-muted-foreground">Nenhum contato registrado.</p>}
                  {contatos.map((c) => (
                    <div key={c.id} className="rounded-lg border p-2">
                      <p className="text-xs text-muted-foreground">{dataHora(c.contact_at)} · {c.contact_type}</p>
                      <p>{c.notes}</p>
                    </div>
                  ))}
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Linha do tempo</h3>
                  {historico.map((h) => (
                    <p key={h.id} className="text-xs text-muted-foreground">
                      {dataHora(h.created_at)} — {h.previous_status ? `${rotuloStatus(h.previous_status)} → ` : ''}
                      {rotuloStatus(h.new_status)}
                    </p>
                  ))}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
